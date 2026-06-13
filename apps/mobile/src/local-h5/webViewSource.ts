export type WebViewSourceKind = 'dev' | 'local'
export type NativeShellRoute = 'tuner' | 'settings'

export type WebViewSource = {
  kind: WebViewSourceKind
  url: string
}

type ResolveWebViewSourceOptions = {
  configuredDevUrl?: string | null
  localUrl: string | null
}

const defaultOriginWhitelist = ['http://127.0.0.1:*', 'http://localhost:*']

export function normalizeWebViewDevUrl(value?: string | null): string | null {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return null
  }

  try {
    const url = new URL(trimmedValue)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export function getConfiguredWebViewDevUrl(): string | null {
  return normalizeWebViewDevUrl(process.env.EXPO_PUBLIC_WEBVIEW_DEV_URL)
}

export function resolveWebViewSource({ configuredDevUrl, localUrl }: ResolveWebViewSourceOptions): WebViewSource | null {
  const devUrl = normalizeWebViewDevUrl(configuredDevUrl)
  if (devUrl) {
    return {
      kind: 'dev',
      url: devUrl,
    }
  }

  if (localUrl) {
    return {
      kind: 'local',
      url: localUrl,
    }
  }

  return null
}

export function getWebViewOriginWhitelist(webViewUrl?: string | null): string[] {
  const whitelist = [...defaultOriginWhitelist]
  const normalizedUrl = normalizeWebViewDevUrl(webViewUrl)

  if (normalizedUrl) {
    whitelist.push(new URL(normalizedUrl).origin)
  }

  return [...new Set(whitelist)]
}

export function appendNativeShellRoute(url: string, route: NativeShellRoute): string {
  const webViewUrl = new URL(url)
  webViewUrl.searchParams.set('native-shell', '1')
  webViewUrl.hash = `/${route}`
  return webViewUrl.toString()
}
