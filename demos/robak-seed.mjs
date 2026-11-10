#!/usr/bin/env node
// Seeds a LOCAL robak-remonty app with sample albums and generated placeholder photos, then writes the
// screencaster script `demos/.build/robak-remonty.yaml` (template + logged-in session). Tooling only: nothing in
// app/ imports it. See specs/robak-remonty-video.md.
//
//   node demos/robak-seed.mjs [--origin http://localhost:3100] [--env ../robak-remonty/infra/.env]
//                             [--video-host http://172.17.0.1:3100] [--list]
//
// Secrets: ADMIN_USER/ADMIN_PASSWORD are read from the env file in memory and never printed. The session cookie is
// written only into the gitignored demos/.build/ copy of the script. One login attempt per run (the server locks an
// IP after 5 failures in 15 minutes), no retry.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const here = dirname(fileURLToPath(import.meta.url))
const { values: opts } = parseArgs({
  options: {
    'origin': { type: 'string', default: 'http://localhost:3100' },
    'env': { type: 'string', default: resolve(here, '../../robak-remonty/infra/.env') },
    'video-host': { type: 'string', default: 'http://172.17.0.1:3100' },
    'list': { type: 'boolean', default: false }
  }
})

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])
const origin = new URL(opts.origin)
if (origin.protocol !== 'http:' || !LOCAL_HOSTS.has(origin.hostname)) {
  throw new Error(`refusing to seed ${origin.origin}: only a local http server is allowed`)
}
const videoHost = new URL(opts['video-host'])
if (!['localhost', '127.0.0.1', '172.17.0.1', 'host.docker.internal'].includes(videoHost.hostname)) {
  throw new Error(`refusing video host ${videoHost.hostname}: only a local address is allowed`)
}

/** Title prefix of every album this script owns, so a rerun replaces them and never touches other albums. */
const OWNED_PREFIX = 'Przykład:'

const ALBUMS = [
  {
    title_pl: `${OWNED_PREFIX} łazienka z płytkami`,
    title_en: 'Sample: bathroom with tiles',
    location: 'Brzesko',
    description_pl: 'Przykładowy album z wygenerowanymi zdjęciami, nie jest to prawdziwa realizacja.',
    description_en: 'A sample album with generated photos. It is not a real job.',
    is_featured: true,
    colors: ['0x2b6cb0', '0x1a365d'],
    label: 'Bathroom'
  },
  {
    title_pl: `${OWNED_PREFIX} salon po wykończeniu`,
    title_en: 'Sample: living room finish',
    location: 'Tarnów',
    description_pl: 'Przykładowy album z wygenerowanymi zdjęciami, nie jest to prawdziwa realizacja.',
    description_en: 'A sample album with generated photos. It is not a real job.',
    is_featured: true,
    colors: ['0x2f855a', '0x1c4532'],
    label: 'Living room'
  },
  {
    title_pl: `${OWNED_PREFIX} adaptacja poddasza`,
    title_en: 'Sample: attic conversion',
    location: 'Bochnia',
    description_pl: 'Przykładowy album z wygenerowanymi zdjęciami, nie jest to prawdziwa realizacja.',
    description_en: 'A sample album with generated photos. It is not a real job.',
    is_featured: false,
    colors: ['0xb7791f', '0x744210'],
    label: 'Attic'
  }
]
const PHOTOS_PER_ALBUM = 4
const WIDTH = 1600
const HEIGHT = 1067

/** Minimal KEY=value reader; the values are used in memory only. */
function readEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (m) out[m[1]] = m[2]
  }
  return out
}

const env = readEnv(opts.env)
if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) throw new Error(`ADMIN_USER / ADMIN_PASSWORD missing in ${opts.env}`)

const base = origin.origin
const headers = { Origin: base }

async function api(path, init = {}, cookie) {
  const res = await fetch(base + path, {
    ...init,
    headers: { ...headers, ...(cookie ? { Cookie: cookie } : {}), ...init.headers }
  })
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} -> ${res.status}`)
  return res
}

// One attempt, no retry: a 401 here counts toward the lockout
const loginRes = await fetch(`${base}/api/admin/login`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ user: env.ADMIN_USER, password: env.ADMIN_PASSWORD })
})
if (!loginRes.ok) throw new Error(`login failed (${loginRes.status}); not retrying, to avoid the rate limit`)
const sessionPair = loginRes.headers.getSetCookie().map(c => c.split(';')[0]).find(c => c.startsWith('session='))
if (!sessionPair) throw new Error('login gave no session cookie')
const sessionValue = sessionPair.slice('session='.length)

const albums = await (await api('/api/admin/albums', {}, sessionPair)).json()
const rows = Array.isArray(albums) ? albums : (albums.items ?? [])
console.log(`albums in this local database: ${rows.length}`)
for (const a of rows) console.log(`  #${a.id} ${a.is_published ? 'published' : 'hidden   '} ${a.title_pl}`)
if (opts.list) process.exit(0)

// Replace our own albums from a previous run
for (const a of rows.filter(a => a.title_pl.startsWith(OWNED_PREFIX))) {
  await api(`/api/admin/albums/${a.id}`, { method: 'DELETE' }, sessionPair)
  console.log(`deleted previous sample album #${a.id}`)
}

// Placeholder tiles: every one says "Sample photo", so the video never passes them off as the client's work
const photoDir = join(here, '.build', 'photos')
mkdirSync(photoDir, { recursive: true })
function tile({ colors: [c0, c1] }, caption, file, width = WIDTH, height = HEIGHT) {
  const vf = [
    `drawtext=text='Sample photo':fontcolor=white:fontsize=110:x=(w-text_w)/2:y=(h-text_h)/2-50`,
    `drawtext=text='${caption}':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2+90`
  ].join(',')
  execFileSync(
    'ffmpeg',
    [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'lavfi', '-i', `gradients=s=${width}x${height}:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=${width}:y1=${height}:d=1`,
      '-vf', vf, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', file
    ],
    { stdio: 'inherit' }
  )
}

for (const album of ALBUMS) {
  const { label, ...fields } = album
  const { is_featured, ...createFields } = fields
  const created = await (
    await api('/api/admin/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createFields)
    }, sessionPair)
  ).json()
  for (let n = 1; n <= PHOTOS_PER_ALBUM; n++) {
    const file = join(photoDir, `${label.toLowerCase().replace(/\s+/g, '-')}-${n}.webp`)
    tile(album, `${label} - ${n}`, file)
    const form = new FormData()
    form.set('file', new File([readFileSync(file)], `${label}-${n}.webp`, { type: 'image/webp' }))
    form.set('width', String(WIDTH))
    form.set('height', String(HEIGHT))
    await api(`/api/admin/albums/${created.id}/images`, { method: 'POST', body: form }, sessionPair)
  }
  if (is_featured) {
    await api(`/api/admin/albums/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: true })
    }, sessionPair)
  }
  console.log(`seeded album #${created.id} (${PHOTOS_PER_ALBUM} photos)`)
}

// The home page hero is a site image, not an album photo; without one it shows an empty placeholder
const heroFile = join(photoDir, 'hero.webp')
const HERO_SIZE = 1200
tile({ colors: ['0x9b2c2c', '0x63171b'] }, 'Home page hero', heroFile, HERO_SIZE, HERO_SIZE)
const heroForm = new FormData()
heroForm.set('file', new File([readFileSync(heroFile)], 'hero.webp', { type: 'image/webp' }))
heroForm.set('width', String(HERO_SIZE))
heroForm.set('height', String(HERO_SIZE))
await api('/api/admin/site-images/hero', { method: 'POST', body: heroForm }, sessionPair)
console.log('seeded hero image')

// Script for screencaster: the template plus a session that the recording browser starts with. The cookie is
// not Secure and host-bound, because the recording reaches the app over plain http at the Docker gateway.
const template = readFileSync(join(here, 'robak-remonty.template.yaml'), 'utf8')
const storageState = {
  cookies: [
    { name: 'session', value: sessionValue, domain: videoHost.hostname, path: '/', httpOnly: true, sameSite: 'Lax', secure: false }
  ]
}
// JSON is valid YAML, so the placeholder can be replaced by a flow mapping
const script = template
  .replaceAll('__BASE__', videoHost.origin)
  .replace('__STORAGE_STATE__', JSON.stringify(storageState))
writeFileSync(join(here, '.build', 'robak-remonty.yaml'), script, { mode: 0o600 })
console.log('wrote demos/.build/robak-remonty.yaml (gitignored, holds the session cookie)')
