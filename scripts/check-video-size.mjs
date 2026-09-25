#!/usr/bin/env node
// Size budget for self-hosted video: <= 15 MiB per file, <= 120 MiB total in public/videos.
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'public/videos'
const MAX_FILE = 15 * 1024 * 1024
const MAX_TOTAL = 120 * 1024 * 1024
const mib = bytes => (bytes / 1024 / 1024).toFixed(1)

let total = 0
let failed = false
if (existsSync(dir)) {
  for (const name of readdirSync(dir)) {
    const size = statSync(join(dir, name)).size
    total += size
    if (size > MAX_FILE) {
      console.error(`${name}: ${mib(size)} MiB exceeds ${mib(MAX_FILE)} MiB per-file budget (re-encode or use a YouTube unlisted embed)`)
      failed = true
    }
  }
}
if (total > MAX_TOTAL) {
  console.error(`public/videos total ${mib(total)} MiB exceeds ${mib(MAX_TOTAL)} MiB budget`)
  failed = true
}
if (failed) process.exit(1)
console.log(`videos: ${mib(total)} MiB total, within budget`)
