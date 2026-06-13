import { afterEach, describe, expect, it } from 'vitest'

import {
  createJianpuGeneratedScore,
  createManualHoleScore,
  deleteScore,
  getScore,
  listScores,
  saveScore,
  scoreLibraryStorageKey,
} from './scoreStorage'

describe('hole score storage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('creates and restores a jianpu generated score from localStorage', () => {
    const score = createJianpuGeneratedScore({
      title: '小星星',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
      text: '1 1 5 5',
      holeScore: { items: [] },
    })

    saveScore(score)

    expect(listScores()).toHaveLength(1)
    expect(getScore(score.id)).toMatchObject({
      id: score.id,
      title: '小星星',
      mode: 'jianpu-generated',
      source: { kind: 'jianpu', text: '1 1 5 5' },
      config: {
        scoreKey: 'D',
        fluteKey: 'D',
        fingeringProfileId: 'tube_as_5',
      },
    })
  })

  it('creates and deletes a manual hole score', () => {
    const score = createManualHoleScore({
      title: '练习曲一',
      fluteKey: 'G',
      fingeringProfileId: 'tube_as_1',
      items: [{ type: 'bar', raw: '|' }],
    })

    saveScore(score)
    deleteScore(score.id)

    expect(listScores()).toEqual([])
    expect(getScore(score.id)).toBeNull()
  })

  it('falls back to an empty library when localStorage contains invalid data', () => {
    localStorage.setItem(scoreLibraryStorageKey, '{not-json')

    expect(listScores()).toEqual([])
  })
})
