import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import {
  getH5ExtractDirectory,
  shouldReuseExtractedH5,
  normalizeServerUrl,
  toNativeFilePath,
  toStaticServerPath,
} from './h5ServerHelpers'

describe('h5Server helpers', () => {
  test('uses the Expo document directory for extracted bundled H5 files', () => {
    expect(getH5ExtractDirectory('file:///device/documents/')).toBe('file:///device/documents/h5')
    expect(getH5ExtractDirectory('file:///device/documents')).toBe('file:///device/documents/h5')
  })

  test('reuses extracted H5 files only when the bundled asset key matches', () => {
    expect(shouldReuseExtractedH5({ entryExists: true, storedAssetKey: 'zip-v1', bundledAssetKey: 'zip-v1' })).toBe(true)
    expect(shouldReuseExtractedH5({ entryExists: true, storedAssetKey: 'zip-v1', bundledAssetKey: 'zip-v2' })).toBe(false)
    expect(shouldReuseExtractedH5({ entryExists: false, storedAssetKey: 'zip-v1', bundledAssetKey: 'zip-v1' })).toBe(false)
  })

  test('converts file URIs into filesystem paths for native modules', () => {
    expect(toNativeFilePath('file:///device/documents/h5.zip')).toBe('/device/documents/h5.zip')
    expect(toStaticServerPath('file:///device/documents/h5')).toBe('/device/documents/h5')
    expect(toStaticServerPath('/device/documents/h5')).toBe('/device/documents/h5')
  })

  test('normalizes static server URLs to localhost index.html', () => {
    expect(normalizeServerUrl('http://127.0.0.1:8080')).toBe('http://127.0.0.1:8080/index.html')
    expect(normalizeServerUrl('http://127.0.0.1:8080/')).toBe('http://127.0.0.1:8080/index.html')
  })

  test('keeps iOS static server boolean arguments bridge-compatible', () => {
    const nativeSource = readFileSync(
      path.resolve(import.meta.dirname, '../../node_modules/react-native-static-server/ios/FPStaticServer.m'),
      'utf8',
    )

    expect(nativeSource).not.toContain('localOnly:(BOOL *)localhost_only')
    expect(nativeSource).not.toContain('keepAlive:(BOOL *)keep_alive')
    expect(nativeSource).not.toContain('localOnly:(BOOL)localhost_only')
    expect(nativeSource).not.toContain('keepAlive:(BOOL)keep_alive')
    expect(nativeSource).toContain('localOnly:(NSNumber *)localhost_only')
    expect(nativeSource).toContain('keepAlive:(NSNumber *)keep_alive')
    expect(nativeSource).toContain('self.localhost_only = [localhost_only boolValue]')
    expect(nativeSource).toContain('self.keep_alive = [keep_alive boolValue]')
  })

  test('uses the patched iOS static server source in the generated Pods project', () => {
    const podsProject = readFileSync(
      path.resolve(import.meta.dirname, '../../ios/Pods/Pods.xcodeproj/project.pbxproj'),
      'utf8',
    )

    expect(podsProject).toContain('react-native-static-server@0.5.0_patch_hash=')
    expect(podsProject).not.toContain('react-native-static-server@0.5.0_react-native')
  })
})
