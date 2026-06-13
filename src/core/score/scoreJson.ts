import {
  diziKeyOptions,
  isFingeringProfileId,
  type DiziKey,
  type FingeringProfileId,
} from '../dizi'
import { listScores, saveScore } from './scoreStorage'
import type { HoleScoreItem, SavedScore } from './scoreTypes'

type JsonObject = Record<string, unknown>

const legacyFingeringModes: Record<string, FingeringProfileId> = {
  'tube-as-5': 'tube_as_5',
  'tube-as-2': 'tube_as_2',
  'tube-as-1': 'tube_as_1',
}

function createImportedScoreId() {
  return `score_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isDiziKey(value: unknown): value is DiziKey {
  return (
    typeof value === 'string' &&
    diziKeyOptions.some((option) => option.value === value)
  )
}

function normalizeFingeringProfileId(value: unknown) {
  if (isFingeringProfileId(value)) return value
  if (typeof value === 'string') return legacyFingeringModes[value] ?? null
  return null
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function getScoreTypeError(data: JsonObject) {
  if (data.type !== 'dizi-hole-score') return '这个 JSON 不是竹笛洞洞谱文件'
  if (data.schemaVersion !== 1) return '这个乐谱版本暂不支持'
  return null
}

function normalizeTitle(title: string) {
  return title.trim() || '未命名乐谱'
}

function createImportedTitle(title: string) {
  const existingTitles = new Set(listScores().map((score) => score.title))
  const baseTitle = normalizeTitle(title)

  if (!existingTitles.has(baseTitle)) return baseTitle

  let index = 1
  let nextTitle = `${baseTitle}（导入）`

  while (existingTitles.has(nextTitle)) {
    index += 1
    nextTitle = `${baseTitle}（导入 ${index}）`
  }

  return nextTitle
}

function validateHoleScoreItems(value: unknown): HoleScoreItem[] {
  if (!Array.isArray(value)) {
    throw new Error('乐谱文件缺少洞洞谱内容，无法导入')
  }

  return value as HoleScoreItem[]
}

export function serializeScoreJson(score: SavedScore) {
  return JSON.stringify(score, null, 2)
}

export function validateScoreJson(data: unknown): SavedScore {
  if (!isObject(data)) throw new Error('这个 JSON 不是竹笛洞洞谱文件')

  const typeError = getScoreTypeError(data)
  if (typeError) throw new Error(typeError)

  const mode = data.mode
  const id = getString(data.id)
  const title = getString(data.title)
  const createdAt = getString(data.createdAt)
  const updatedAt = getString(data.updatedAt)
  const config = data.config
  const source = data.source
  const holeScore = data.holeScore

  if (!id || title === null || !createdAt || !updatedAt || !isObject(config)) {
    throw new Error('乐谱文件缺少洞洞谱内容，无法导入')
  }
  if (!isObject(source) || !isObject(holeScore)) {
    throw new Error('乐谱文件缺少洞洞谱内容，无法导入')
  }

  const items = validateHoleScoreItems(holeScore.items)

  if (mode === 'jianpu-generated') {
    const scoreKey = config.scoreKey
    const fluteKey = config.fluteKey
    const fingeringProfileId = normalizeFingeringProfileId(
      config.fingeringProfileId ?? config.fingeringMode,
    )

    if (source.kind !== 'jianpu' || typeof source.text !== 'string') {
      throw new Error('乐谱文件缺少数字谱内容，无法导入')
    }
    if (!isDiziKey(scoreKey) || !isDiziKey(fluteKey) || !fingeringProfileId) {
      throw new Error('乐谱文件缺少数字谱内容，无法导入')
    }

    return {
      schemaVersion: 1,
      type: 'dizi-hole-score',
      id,
      title,
      mode,
      createdAt,
      updatedAt,
      config: {
        scoreKey,
        fluteKey,
        fingeringProfileId,
      },
      source: {
        kind: 'jianpu',
        text: source.text,
      },
      holeScore: {
        items,
      },
      ...(isObject(data.meta) ? { meta: data.meta } : {}),
    }
  }

  if (mode === 'manual-hole-score') {
    const fluteKey = config.fluteKey
    const fingeringProfileId = normalizeFingeringProfileId(
      config.fingeringProfileId ?? config.fingeringMode,
    )

    if (
      source.kind !== 'manual-hole-score' ||
      !isDiziKey(fluteKey) ||
      !fingeringProfileId
    ) {
      throw new Error('乐谱文件缺少洞洞谱内容，无法导入')
    }

    return {
      schemaVersion: 1,
      type: 'dizi-hole-score',
      id,
      title,
      mode,
      createdAt,
      updatedAt,
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
      ...(isObject(data.meta) ? { meta: data.meta } : {}),
    }
  }

  throw new Error('乐谱文件缺少洞洞谱内容，无法导入')
}

export function importScoreJsonText(text: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('这个文件不是有效的洞洞谱 JSON')
  }

  const score = validateScoreJson(parsed)
  const now = new Date().toISOString()
  const importedScore: SavedScore = {
    ...score,
    id: createImportedScoreId(),
    title: createImportedTitle(score.title),
    createdAt: now,
    updatedAt: now,
  }

  return saveScore(importedScore)
}

