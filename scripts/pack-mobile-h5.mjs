#!/usr/bin/env node
import { execFile } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'dist')
const targetDir = path.join(rootDir, 'apps', 'mobile', 'assets', 'h5')
const zipPath = path.join(rootDir, 'apps', 'mobile', 'assets', 'h5.zip')
const manifestPath = path.join(targetDir, 'mobile-h5-manifest.json')

export async function removeDirectory(directory) {
  await rm(directory, { recursive: true, force: true })
}

export async function copyDirectory(source, target) {
  await mkdir(path.dirname(target), { recursive: true })
  await cp(source, target, { recursive: true, force: true })
}

export async function createZipArchive(source, target) {
  await mkdir(path.dirname(target), { recursive: true })
  await rm(target, { force: true })
  await execFileAsync('zip', ['-qry', target, '.'], { cwd: source })
}

export function createMobileManifest({ generatedAt = new Date().toISOString() } = {}) {
  return {
    entry: 'index.html',
    generatedAt,
    source: 'dist',
  }
}

async function main() {
  await removeDirectory(targetDir)
  await copyDirectory(sourceDir, targetDir)
  await writeFile(manifestPath, `${JSON.stringify(createMobileManifest(), null, 2)}\n`)
  await createZipArchive(targetDir, zipPath)
  console.log(`Packaged H5 assets from ${sourceDir} to ${targetDir} and ${zipPath}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
