import { Link as RouterLink } from 'expo-router'
import React from 'react'
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  View as RNView,
} from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from 'react-native-css'

export const useCSSVariable =
  process.env.EXPO_OS !== 'web'
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string
}

export function View(props: ViewProps) {
  return useCssElement(RNView, props, { className: 'style' })
}
View.displayName = 'CSS(View)'

export type SafeAreaViewProps = React.ComponentProps<typeof RNSafeAreaView> & {
  className?: string
}

export function SafeAreaView(props: SafeAreaViewProps) {
  return useCssElement(RNSafeAreaView, props, { className: 'style' })
}
SafeAreaView.displayName = 'CSS(SafeAreaView)'

export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string
}

export function Text(props: TextProps) {
  return useCssElement(RNText, props, { className: 'style' })
}
Text.displayName = 'CSS(Text)'

export type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string
}

export function Pressable(props: PressableProps) {
  return useCssElement(RNPressable, props, { className: 'style' })
}
Pressable.displayName = 'CSS(Pressable)'

export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string
  contentContainerClassName?: string
}

export function ScrollView(props: ScrollViewProps) {
  return useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  })
}
ScrollView.displayName = 'CSS(ScrollView)'

export type LinkProps = React.ComponentProps<typeof RouterLink> & {
  className?: string
}

export function Link(props: LinkProps) {
  return useCssElement(RouterLink, props, { className: 'style' })
}

Link.Trigger = RouterLink.Trigger
Link.Menu = RouterLink.Menu
Link.MenuAction = RouterLink.MenuAction
Link.Preview = RouterLink.Preview
