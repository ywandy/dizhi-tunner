import { afterEach, describe, expect, it } from 'vitest'

import {
  createJianpuGeneratedScore,
  getScore,
  listScores,
  saveScore,
} from './scoreStorage'
import {
  importScoreJsonText,
  serializeScoreJson,
  validateScoreJson,
} from './scoreJson'

describe('score json import and export', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('exports a complete SavedScore json document', () => {
    const score = createJianpuGeneratedScore({
      title: '小星星',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
      text: '1 1 5 5',
      holeScore: { items: [] },
    })

    expect(JSON.parse(serializeScoreJson(score))).toMatchObject({
      schemaVersion: 1,
      type: 'dizi-hole-score',
      id: score.id,
      title: '小星星',
      mode: 'jianpu-generated',
      createdAt: score.createdAt,
      updatedAt: score.updatedAt,
      config: {
        scoreKey: 'D',
        fluteKey: 'D',
        fingeringProfileId: 'tube_as_5',
      },
      source: {
        kind: 'jianpu',
        text: '1 1 5 5',
      },
      holeScore: { items: [] },
      meta: {
        appName: '竹笛洞洞谱生成器',
      },
    })
  })

  it('validates legacy fingeringMode json into the current fingeringProfileId field', () => {
    const score = validateScoreJson({
      schemaVersion: 1,
      type: 'dizi-hole-score',
      id: 'score_legacy',
      title: '旧谱',
      mode: 'jianpu-generated',
      createdAt: '2026-06-13T00:00:00.000Z',
      updatedAt: '2026-06-13T00:00:00.000Z',
      config: {
        scoreKey: 'D',
        fluteKey: 'D',
        fingeringMode: 'tube-as-5',
      },
      source: {
        kind: 'jianpu',
        text: '1',
      },
      holeScore: {
        items: [],
      },
    })

    expect(score.config).toMatchObject({
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
    })
  })

  it('imports as a new score and renames duplicate titles', () => {
    const existing = createJianpuGeneratedScore({
      title: '小星星',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
      text: '1',
      holeScore: { items: [] },
    })
    saveScore(existing)

    const imported = importScoreJsonText(serializeScoreJson(existing))

    expect(imported.id).not.toBe(existing.id)
    expect(imported.title).toBe('小星星（导入）')
    expect(listScores()).toHaveLength(2)
    expect(getScore(imported.id)).toMatchObject({
      title: '小星星（导入）',
    })
  })

  it('reports invalid json with a friendly error', () => {
    expect(() => importScoreJsonText('{not-json')).toThrow(
      '这个文件不是有效的洞洞谱 JSON',
    )
  })
})
