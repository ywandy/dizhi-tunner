import { describe, expect, test } from 'vitest'

import { getShellMessage, shouldLoadWebView } from './webViewState'

describe('webViewState', () => {
  test('loads the WebView only after microphone permission and a source URL are ready', () => {
    expect(shouldLoadWebView({ microphoneGranted: true, webViewUrl: 'http://127.0.0.1:8080/index.html' })).toBe(true)
    expect(shouldLoadWebView({ microphoneGranted: false, webViewUrl: 'http://127.0.0.1:8080/index.html' })).toBe(false)
    expect(shouldLoadWebView({ microphoneGranted: true, webViewUrl: null })).toBe(false)
  })

  test('shows a permission-specific message when microphone access is denied', () => {
    expect(getShellMessage('permission-denied')).toContain('麦克风')
  })
})
