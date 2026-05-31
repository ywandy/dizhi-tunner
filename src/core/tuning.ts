import type { DiziTarget } from './dizi'

export type Mode = 'realtime' | 'target'

export type TuningResult = DiziTarget & {
  cents: number
}

export function centsDiff(currentFreq: number, targetFreq: number) {
  return 1200 * Math.log2(currentFreq / targetFreq)
}

export function findNearestTarget(
  currentFreq: number,
  targets: DiziTarget[],
): TuningResult | null {
  return targets.reduce<TuningResult | null>((best, target) => {
    const cents = centsDiff(currentFreq, target.frequency)
    const candidate = { ...target, cents }

    if (!best || Math.abs(candidate.cents) < Math.abs(best.cents)) {
      return candidate
    }

    return best
  }, null)
}

export function checkAgainstTarget(
  currentFreq: number,
  target: DiziTarget,
): TuningResult {
  return {
    ...target,
    cents: centsDiff(currentFreq, target.frequency),
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function centsToMeterPercent(cents: number) {
  return ((clamp(cents, -50, 50) + 50) / 100) * 100
}

export function getStatusText(cents: number | null) {
  if (cents === null) return '等待吹奏'

  const absolute = Math.abs(cents)

  if (absolute <= 5) return '很准'
  if (absolute <= 10) return '基本准'
  if (absolute <= 20) return cents > 0 ? '略高' : '略低'
  return cents > 0 ? '明显偏高' : '明显偏低'
}

export function getToneDirection(cents: number | null) {
  if (cents === null || Math.abs(cents) <= 5) return 'center'
  return cents > 0 ? 'sharp' : 'flat'
}
