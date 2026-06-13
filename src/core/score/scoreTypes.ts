import type { DiziKey, FingeringProfileId, JianpuLabel } from '../dizi'

export type ScoreMode = 'jianpu-generated' | 'manual-hole-score'

export type HoleState = 'closed' | 'open' | 'half'

export type HoleScore = {
  items: HoleScoreItem[]
  warnings?: string[]
  errors?: string[]
}

export type HoleScoreItem =
  | HoleNoteItem
  | HoleRestItem
  | HoleHoldItem
  | HoleBarItem
  | HoleLineBreakItem

export type HoleNoteItem = {
  type: 'note'
  raw?: string
  displayName?: string
  pitch?: string
  midi?: number
  targetLabel?: JianpuLabel
  fingering: {
    label: string
    holes: HoleState[]
    remark?: string
  }
  warnings?: string[]
  errors?: string[]
}

export type HoleRestItem = {
  type: 'rest'
  raw: '0'
}

export type HoleHoldItem = {
  type: 'hold'
  raw: '-'
}

export type HoleBarItem = {
  type: 'bar'
  raw: '|'
}

export type HoleLineBreakItem = {
  type: 'lineBreak'
}

export type JianpuGeneratedConfig = {
  scoreKey: DiziKey
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}

export type ManualHoleScoreConfig = {
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}

export type ScoreConfig = JianpuGeneratedConfig | ManualHoleScoreConfig

export type JianpuScoreSource = {
  kind: 'jianpu'
  text: string
}

export type ManualHoleScoreSource = {
  kind: 'manual-hole-score'
}

export type ScoreSource = JianpuScoreSource | ManualHoleScoreSource

export type ScoreMeta = {
  appName?: string
  appVersion?: string
  converterVersion?: string
}

export type SavedScore = {
  schemaVersion: 1
  type: 'dizi-hole-score'
  id: string
  title: string
  mode: ScoreMode
  createdAt: string
  updatedAt: string
  config: ScoreConfig
  source: ScoreSource
  holeScore: HoleScore
  meta?: ScoreMeta
}

export type JianpuGeneratedScore = SavedScore & {
  mode: 'jianpu-generated'
  config: JianpuGeneratedConfig
  source: JianpuScoreSource
}

export type ManualHoleScore = SavedScore & {
  mode: 'manual-hole-score'
  config: ManualHoleScoreConfig
  source: ManualHoleScoreSource
}

