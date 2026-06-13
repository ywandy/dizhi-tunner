import type { DiziKey, FingeringProfileId } from '../dizi'
import type {
  HoleScore,
  HoleScoreItem,
  JianpuGeneratedScore,
  ManualHoleScore,
  SavedScore,
} from './scoreTypes'

export const scoreLibraryStorageKey = 'dizi-hole-score-library-v1'

type CreateJianpuGeneratedScoreInput = {
  title: string
  scoreKey: DiziKey
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
  text: string
  holeScore: HoleScore
}

type CreateManualHoleScoreInput = {
  title: string
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
  items: HoleScoreItem[]
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function createScoreId() {
  return `score_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function nowIso() {
  return new Date().toISOString()
}

function isSavedScore(value: unknown): value is SavedScore {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SavedScore>
  const holeScore = candidate.holeScore

  return (
    candidate.schemaVersion === 1 &&
    candidate.type === 'dizi-hole-score' &&
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    (candidate.mode === 'jianpu-generated' ||
      candidate.mode === 'manual-hole-score') &&
    Boolean(candidate.config) &&
    Boolean(candidate.source) &&
    holeScore !== undefined &&
    Array.isArray(holeScore.items)
  )
}

function readLibrary(): SavedScore[] {
  try {
    const saved = getStorage()?.getItem(scoreLibraryStorageKey)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isSavedScore)
  } catch {
    return []
  }
}

function writeLibrary(scores: SavedScore[]) {
  getStorage()?.setItem(scoreLibraryStorageKey, JSON.stringify(scores))
}

export function listScores() {
  return readLibrary().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getScore(id: string) {
  return readLibrary().find((score) => score.id === id) ?? null
}

export function saveScore(score: SavedScore) {
  const scores = readLibrary()
  const index = scores.findIndex((item) => item.id === score.id)
  const nextScore = {
    ...score,
    updatedAt: nowIso(),
  }

  if (index >= 0) {
    scores[index] = nextScore
  } else {
    scores.push(nextScore)
  }

  writeLibrary(scores)
  return nextScore
}

export function deleteScore(id: string) {
  writeLibrary(readLibrary().filter((score) => score.id !== id))
}

export function createJianpuGeneratedScore({
  fingeringProfileId,
  fluteKey,
  holeScore,
  scoreKey,
  text,
  title,
}: CreateJianpuGeneratedScoreInput): JianpuGeneratedScore {
  const createdAt = nowIso()

  return {
    schemaVersion: 1,
    type: 'dizi-hole-score',
    id: createScoreId(),
    title,
    mode: 'jianpu-generated',
    createdAt,
    updatedAt: createdAt,
    config: {
      scoreKey,
      fluteKey,
      fingeringProfileId,
    },
    source: {
      kind: 'jianpu',
      text,
    },
    holeScore,
    meta: {
      appName: '竹笛洞洞谱生成器',
      converterVersion: '0.1.0',
    },
  }
}

export function createManualHoleScore({
  fingeringProfileId,
  fluteKey,
  items,
  title,
}: CreateManualHoleScoreInput): ManualHoleScore {
  const createdAt = nowIso()

  return {
    schemaVersion: 1,
    type: 'dizi-hole-score',
    id: createScoreId(),
    title,
    mode: 'manual-hole-score',
    createdAt,
    updatedAt: createdAt,
    config: {
      fluteKey,
      fingeringProfileId,
    },
    source: {
      kind: 'manual-hole-score',
    },
    holeScore: {
      items,
    },
    meta: {
      appName: '竹笛洞洞谱生成器',
    },
  }
}
