import { useEffect, useState } from 'react'
import { ActivityIndicator, PermissionsAndroid, Platform } from 'react-native'
import { WebView } from 'react-native-webview'

import { Pressable, SafeAreaView, Text, View } from '../tw'
import { startH5Server } from './h5Server'
import {
  appendNativeShellRoute,
  getConfiguredWebViewDevUrl,
  getWebViewOriginWhitelist,
  resolveWebViewSource,
  type NativeShellRoute,
} from './webViewSource'
import { getShellMessage, shouldLoadWebView, type ShellState } from './webViewState'

async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
  return result === PermissionsAndroid.RESULTS.GRANTED
}

function ShellMessage({ state, onRetry }: { state: ShellState; onRetry?: () => void }) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-cyan-50 px-6">
      {state === 'loading' ? <ActivityIndicator size="large" color="#155e75" /> : null}
      <Text className="text-2xl font-bold text-cyan-950">笛子音准测试</Text>
      <Text className="max-w-80 text-center text-base leading-6 text-slate-900">{getShellMessage(state)}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" className="rounded-full bg-cyan-800 px-6 py-3" onPress={onRetry}>
          <Text className="text-base font-bold text-white">重试</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  )
}

export function LocalH5WebView({ route = 'tuner' }: { route?: NativeShellRoute }) {
  const [state, setState] = useState<ShellState>('loading')
  const [microphoneGranted, setMicrophoneGranted] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const configuredDevUrl = getConfiguredWebViewDevUrl()

  useEffect(() => {
    let mounted = true
    let stopServer: (() => Promise<void>) | undefined

    async function prepareShell() {
      setState('loading')
      setLocalUrl(null)
      setMicrophoneGranted(false)

      const granted = await requestMicrophonePermission()
      if (!mounted) return

      if (!granted) {
        setState('permission-denied')
        return
      }

      setMicrophoneGranted(true)

      if (configuredDevUrl) {
        setLocalUrl(null)
        return
      }

      try {
        const server = await startH5Server()
        stopServer = server.stop
        if (!mounted) {
          await server.stop()
          return
        }
        setLocalUrl(server.url)
      } catch (error) {
        console.error(error)
        if (mounted) setState('server-error')
      }
    }

    void prepareShell()

    return () => {
      mounted = false
      void stopServer?.()
    }
  }, [configuredDevUrl, reloadKey])

  const webViewSource = resolveWebViewSource({ configuredDevUrl, localUrl })

  if (!shouldLoadWebView({ microphoneGranted, webViewUrl: webViewSource?.url ?? null })) {
    return <ShellMessage state={state} onRetry={state === 'loading' ? undefined : () => setReloadKey((key) => key + 1)} />
  }

  const webViewUrl = webViewSource?.url ? appendNativeShellRoute(webViewSource.url, route) : null

  if (!webViewUrl) {
    return <ShellMessage state="server-error" onRetry={() => setReloadKey((key) => key + 1)} />
  }

  return (
    <View className="flex-1 bg-sf-bg">
      <WebView
        source={{ uri: webViewUrl }}
        automaticallyAdjustContentInsets={false}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        originWhitelist={getWebViewOriginWhitelist(webViewUrl)}
        onError={() => setState('webview-error')}
        onHttpError={() => setState('webview-error')}
        style={{ flex: 1, backgroundColor: '#fbfdfb' }}
      />
    </View>
  )
}
