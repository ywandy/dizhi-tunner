import type { DiziTarget, FingeringProfileId } from '../dizi'
import type { HoleState } from './scoreTypes'
import { fingeringVisualConfig } from './fingeringVisualConfig'

export type DiziToneVisual = {
  holes: HoleState[]
  label: string
  remark?: string
}

export function renderHoleLabel(holes: HoleState[]) {
  return holes
    .map((hole) => {
      if (hole === 'closed') return '●'
      if (hole === 'half') return '◐'
      return '○'
    })
    .join('')
}

export function buildDiziToneVisual(
  target: DiziTarget,
  fingeringProfileId: FingeringProfileId,
): DiziToneVisual {
  const config = fingeringVisualConfig[fingeringProfileId][target.label]

  if (!config) {
    throw new Error(
      `Missing fingering visual config: ${fingeringProfileId} / ${target.label}`,
    )
  }

  const holes = [...config.holes]

  return {
    holes,
    label: renderHoleLabel(holes),
    ...(config.remark ? { remark: config.remark } : {}),
  }
}
