#!/usr/bin/env node
// Fails when en.json / pl.json key sets differ. Also imported by tests/unit/locales.test.ts.
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function readLocale(code) {
  return JSON.parse(readFileSync(join(root, 'i18n/locales', `${code}.json`), 'utf8'))
}

/** flattens nested objects/arrays into dotted key paths (array items become numeric segments) */
export function flattenKeys(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [prefix]
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v]) : Object.entries(value)
  return entries.flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key))
}

export function compareLocales(a, b) {
  const left = new Set(flattenKeys(a))
  const right = new Set(flattenKeys(b))
  return {
    missingInSecond: [...left].filter(k => !right.has(k)),
    missingInFirst: [...right].filter(k => !left.has(k))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { missingInSecond, missingInFirst } = compareLocales(readLocale('en'), readLocale('pl'))
  for (const key of missingInSecond) console.error(`missing in pl.json: ${key}`)
  for (const key of missingInFirst) console.error(`missing in en.json: ${key}`)
  if (missingInSecond.length || missingInFirst.length) process.exit(1)
  console.log('locales: en and pl key sets match')
}
