import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { copyDirectory, createMobileManifest, createZipArchive, removeDirectory } from './pack-mobile-h5.mjs'

describe('mobile H5 packaging helpers', () => {
  test('copies nested Vite build assets into the mobile asset directory', async () => {
    const tempRoot = await mkdtemp(path.join(tmpdir(), 'mobile-h5-copy-'))
    const source = path.join(tempRoot, 'dist')
    const target = path.join(tempRoot, 'apps', 'mobile', 'assets', 'h5')

    try {
      await mkdir(path.join(source, 'assets'), { recursive: true })
      await writeFile(path.join(source, 'index.html'), '<script src="./assets/app.js"></script>')
      await writeFile(path.join(source, 'assets', 'app.js'), 'window.__DITUNE__ = true')

      await copyDirectory(source, target)

      await expect(readFile(path.join(target, 'index.html'), 'utf8')).resolves.toContain('./assets/app.js')
      await expect(readFile(path.join(target, 'assets', 'app.js'), 'utf8')).resolves.toContain('__DITUNE__')
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  test('manifest records the packaged H5 entrypoint and generated time', () => {
    const manifest = createMobileManifest({ generatedAt: '2026-06-02T00:00:00.000Z' })

    expect(manifest).toEqual({
      entry: 'index.html',
      generatedAt: '2026-06-02T00:00:00.000Z',
      source: 'dist',
    })
  })

  test('creates a zip archive for the Expo app bundle', async () => {
    const tempRoot = await mkdtemp(path.join(tmpdir(), 'mobile-h5-zip-'))
    const source = path.join(tempRoot, 'dist')
    const zipPath = path.join(tempRoot, 'apps', 'mobile', 'assets', 'h5.zip')

    try {
      await mkdir(source, { recursive: true })
      await writeFile(path.join(source, 'index.html'), '<main>offline</main>')

      await createZipArchive(source, zipPath)

      await expect(readFile(zipPath)).resolves.toBeInstanceOf(Buffer)
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  test('removeDirectory tolerates missing generated asset directories', async () => {
    const tempRoot = await mkdtemp(path.join(tmpdir(), 'mobile-h5-remove-'))
    const missingPath = path.join(tempRoot, 'missing')

    try {
      await expect(removeDirectory(missingPath)).resolves.toBeUndefined()
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })
})
