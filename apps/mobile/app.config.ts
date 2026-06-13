import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Ditune Mobile Placeholder',
  slug: 'ditune-mobile-placeholder',
  version: '0.0.0',
  orientation: 'portrait',
  scheme: 'ditune-placeholder',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.placeholder.ditune',
    infoPlist: {
      NSMicrophoneUsageDescription: '用于实时采集笛声音频并检测音准。',
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: 'com.placeholder.ditune',
    permissions: ['RECORD_AUDIO', 'INTERNET'],
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.5',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
}

export default config
