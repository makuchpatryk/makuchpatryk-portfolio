#!/usr/bin/env node
// Static file server that mimics GitHub Pages: directory index.html, 404.html fallback, optional base path.
// usage: node scripts/serve.mjs [--dir .output/public] [--base /repo/] [--port 4173]
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const dir = arg('dir', '.output/public')
const base = `/${arg('base', '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')
const port = Number(arg('port', process.env.PORT || 4173))

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4'
}

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const candidate = join(dir, clean)
  const info = await stat(candidate).catch(() => null)
  if (info?.isFile()) return candidate
  if (info?.isDirectory()) {
    const index = join(candidate, 'index.html')
    if ((await stat(index).catch(() => null))?.isFile()) return index
  }
  return null
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  let file = null
  let status = 200
  if (pathname.startsWith(base) || `${pathname}/` === base) {
    file = await resolveFile(pathname.slice(base.length - 1))
  }
  if (!file) {
    status = 404
    file = join(dir, '404.html')
  }
  try {
    let body = await readFile(file)
    const type = types[extname(file)] ?? 'application/octet-stream'
    // GitHub Pages compresses text responses and sets a 10 minute cache; mirror both so Lighthouse numbers are realistic
    const headers = { 'content-type': type, 'cache-control': 'public, max-age=600' }
    if (/^(text|application\/(json|xml|javascript))|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body)
      headers['content-encoding'] = 'gzip'
      headers.vary = 'accept-encoding'
    }
    res.writeHead(status, headers)
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(port, () => console.log(`serving ${dir} at http://localhost:${port}${base}`))
