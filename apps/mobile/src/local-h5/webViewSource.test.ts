import { describe, expect, test } from 'vitest'

import { appendNativeShellRoute, getWebViewOriginWhitelist, normalizeWebViewDevUrl, resolveWebViewSource, type NativeShellRoute } from './webViewSource'

const supportedNativeShellRoutes: NativeShellRoute[] = [
  'tuner',
  'settings',
  'hole-scores',
]

describe('webViewSource', () => {
  test('uses the configured dev URL ahead of the bundled local URL', () => {
    expect(
      resolveWebViewSource({
        configuredDevUrl: ' http://127.0.0.1:5173/ ',
        localUrl: 'http://127.0.0.1:8080/index.html',
      }),
    ).toEqual({
      kind: 'dev',
      url: 'http://127.0.0.1:5173/',
    })
  })

  test('falls back to the bundled local URL when no dev URL is configured', () => {
    expect(
      resolveWebViewSource({
        configuredDevUrl: '',
        localUrl: 'http://127.0.0.1:8080/index.html',
      }),
    ).toEqual({
      kind: 'local',
      url: 'http://127.0.0.1:8080/index.html',
    })
  })

  test('ignores invalid dev URL values', () => {
    expect(normalizeWebViewDevUrl('ditune.local')).toBeNull()
    expect(normalizeWebViewDevUrl('ftp://127.0.0.1:5173')).toBeNull()
  })

  test('allows the configured dev origin in the WebView whitelist', () => {
    expect(getWebViewOriginWhitelist('http://192.168.1.88:5173/app')).toContain('http://192.168.1.88:5173')
  })

  test('adds native shell marker and route hash to WebView URLs', () => {
    expect(supportedNativeShellRoutes).toContain('hole-scores')
    expect(appendNativeShellRoute('http://localhost:5173/', 'settings')).toBe('http://localhost:5173/?native-shell=1#/settings')
    expect(appendNativeShellRoute('http://127.0.0.1:8080/index.html', 'tuner')).toBe(
      'http://127.0.0.1:8080/index.html?native-shell=1#/tuner',
    )
    expect(appendNativeShellRoute('http://localhost:5173/', 'hole-scores')).toBe(
      'http://localhost:5173/?native-shell=1#/hole-scores',
    )
  })
})
