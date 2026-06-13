import '../src/global.css'

import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <NativeTabs
        backgroundColor="#fbfdfb"
        blurEffect="systemMaterialLight"
        disableTransparentOnScrollEdge
        iconColor={{ default: '#6b756f', selected: '#167744' }}
        labelStyle={{
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        <NativeTabs.Trigger name="index">
          <Label>测音</Label>
          <Icon sf={{ default: 'waveform', selected: 'waveform.circle.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Label>设置</Label>
          <Icon sf={{ default: 'slider.horizontal.3', selected: 'slider.horizontal.3' }} />
        </NativeTabs.Trigger>
      </NativeTabs>
      <StatusBar style="dark" />
    </>
  )
}
