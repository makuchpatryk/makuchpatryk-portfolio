#!/usr/bin/env node
// Launch gate: finds `[placeholder]` strings in built HTML (visible text + attributes, not scripts/styles).
// usage: node scripts/check-placeholders.mjs [--strict] [--dir .output/public]
// Without --strict it only warns (exit 0); with --strict (or RELEASE=true) it fails.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict') || process.env.RELEASE === 'true'
const dirIndex = args.indexOf('--dir')
const dir = dirIndex === -1 ? '.output/public' : args[dirIndex + 1]

// `[01]` section numbers are legitimate; bracketed text with a letter, or a bracketed year like `[2024]`, is a placeholder
const PLACEHOLDER = /\[(?:[^\]\n]*\p{L}[^\]\n]*|\d{3,})\]/gu

export function findPlaceholders(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, tag => tag.replace(/\s(?:class|style|id|data-[\w-]+|d|viewBox)="[^"]*"/g, ''))
  return [...new Set(cleaned.match(PLACEHOLDER) ?? [])]
}

function* htmlFiles(root) {
  for (const name of readdirSync(root)) {
    const path = join(root, name)
    if (statSync(path).isDirectory()) {
      if (name === '_nuxt' || name === '_og' || name.startsWith('_')) continue
      yield* htmlFiles(path)
    } else if (name.endsWith('.html')) {
      yield path
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let total = 0
  for (const file of htmlFiles(dir)) {
    const found = findPlaceholders(readFileSync(file, 'utf8'))
    if (!found.length) continue
    total += found.length
    console.log(`${relative(dir, file)}: ${found.length} placeholder(s)`)
    for (const item of found.slice(0, 5)) console.log(`   ${item.slice(0, 90)}`)
  }
  if (total === 0) {
    console.log('placeholders: none found — launch gate passes')
  } else {
    const message = `placeholders: ${total} found (see docs/content-checklist.md)`
    if (strict) {
      console.error(`::error::${message}`)
      process.exit(1)
    }
    console.warn(`::warning::${message}`)
  }
}
