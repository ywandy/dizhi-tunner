import { describe, expect, test } from 'vitest'

import config from './app.config'

describe('mobile app config', () => {
  test('sets iOS deployment target high enough for RNZipArchive', () => {
    expect(config.plugins).toContainEqual([
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.5',
        },
      },
    ])
  })
})
