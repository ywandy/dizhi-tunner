export type WebViewReadiness = {
  microphoneGranted: boolean
  webViewUrl: string | null
}

export type ShellState = 'loading' | 'permission-denied' | 'server-error' | 'webview-error'

const shellMessages: Record<ShellState, string> = {
  loading: '正在准备离线应用...',
  'permission-denied': '需要麦克风权限才能检测笛子音准。请在系统设置中允许访问麦克风。',
  'server-error': '离线 H5 资源加载失败，请先运行 pnpm mobile:pack 重新打包。',
  'webview-error': '应用页面加载失败，请重启 App 后重试。',
}

export function shouldLoadWebView({ microphoneGranted, webViewUrl }: WebViewReadiness): boolean {
  return microphoneGranted && Boolean(webViewUrl)
}

export function getShellMessage(state: ShellState): string {
  return shellMessages[state]
}
