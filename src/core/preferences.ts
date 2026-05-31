import {
  diziKeyOptions,
  type DiziKey,
  type FingeringProfileId,
  type JianpuLabel,
  isFingeringProfileId,
  isJianpuLabel,
  isTargetLabelForFingering,
} from './dizi'
import type { Mode } from './tuning'

export type AppPreferences = {
  diziKey: DiziKey
  fingeringProfileId: FingeringProfileId
  mode: Mode
  targetLabel: JianpuLabel
}

export const preferencesStorageKey = 'dizi-tuner-preferences-v1'

export const defaultPreferences: AppPreferences = {
  diziKey: 'D',
  fingeringProfileId: 'tube_as_5',
  mode: 'realtime',
  targetLabel: '5',
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function isDiziKey(value: unknown): value is DiziKey {
  return (
    typeof value === 'string' &&
    diziKeyOptions.some((option) => option.value === value)
  )
}

function isMode(value: unknown): value is Mode {
  return value === 'realtime' || value === 'target'
}

function parsePreferences(value: unknown): AppPreferences | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<Record<keyof AppPreferences, unknown>>
  const hasSavedFingering = 'fingeringProfileId' in candidate

  if (
    !isDiziKey(candidate.diziKey) ||
    !isMode(candidate.mode) ||
    !isJianpuLabel(candidate.targetLabel) ||
    (hasSavedFingering && !isFingeringProfileId(candidate.fingeringProfileId))
  ) {
    return null
  }

  const fingeringProfileId = isFingeringProfileId(candidate.fingeringProfileId)
    ? candidate.fingeringProfileId
    : defaultPreferences.fingeringProfileId
  const targetLabel = isTargetLabelForFingering(
    candidate.targetLabel,
    fingeringProfileId,
  )
    ? candidate.targetLabel
    : '1'

  return {
    diziKey: candidate.diziKey,
    fingeringProfileId,
    mode: candidate.mode,
    targetLabel,
  }
}

export function loadPreferences() {
  try {
    const storage = getStorage()
    const saved = storage?.getItem(preferencesStorageKey)

    if (!saved) return defaultPreferences

    return parsePreferences(JSON.parse(saved)) ?? defaultPreferences
  } catch {
    return defaultPreferences
  }
}

export function savePreferences(preferences: AppPreferences) {
  try {
    const storage = getStorage()
    storage?.setItem(preferencesStorageKey, JSON.stringify(preferences))
  } catch {
    // Ignore storage failures so tuning still works in private or restricted modes.
  }
}
