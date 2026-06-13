import { describe, expect, it } from 'vitest'

import { convertJianpuToHoleScore, parseJianpuTokens } from './jianpuConverter'

describe('jianpu converter', () => {
  it('parses supported note, symbol, accidental, and newline tokens', () => {
    expect(parseJianpuTokens("1 .5 5' #4 b7 0 - |\nx")).toEqual([
      { type: 'note', raw: '1', degree: 1, octaveShift: 0 },
      { type: 'note', raw: '.5', degree: 5, octaveShift: -1 },
      { type: 'note', raw: "5'", degree: 5, octaveShift: 1 },
      {
        type: 'note',
        raw: '#4',
        degree: 4,
        octaveShift: 0,
        accidental: 'sharp',
      },
      {
        type: 'note',
        raw: 'b7',
        degree: 7,
        octaveShift: 0,
        accidental: 'flat',
      },
      { type: 'rest', raw: '0' },
      { type: 'hold', raw: '-' },
      { type: 'bar', raw: '|' },
      { type: 'lineBreak', raw: '\n' },
      { type: 'invalid', raw: 'x', message: '“x” 暂时识别不了，可以输入 1-7、0、-、|' },
    ])
  })

  it('converts jianpu notes by score key and matches current dizi targets', () => {
    const result = convertJianpuToHoleScore({
      text: '1 0 - |',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
    })

    expect(result.items).toMatchObject([
      {
        type: 'note',
        raw: '1',
        displayName: '1',
        pitch: 'D5',
        midi: 74,
        targetLabel: '1',
        fingering: {
          label: '●●●○○○',
          holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
        },
      },
      { type: 'rest', raw: '0' },
      { type: 'hold', raw: '-' },
      { type: 'bar', raw: '|' },
    ])
    expect(result.errors).toEqual([])
  })

  it('keeps converting valid tokens when one token is invalid or outside the target range', () => {
    const result = convertJianpuToHoleScore({
      text: '.1 x 1',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
    })

    expect(result.items).toHaveLength(3)
    expect(result.items[0]).toMatchObject({
      type: 'note',
      raw: '.1',
      errors: ['该音 D4 超出 D 调笛 · 筒音作5 常用音域'],
    })
    expect(result.items[1]).toMatchObject({
      type: 'note',
      raw: 'x',
      errors: ['“x” 暂时识别不了，可以输入 1-7、0、-、|'],
    })
    expect(result.items[2]).toMatchObject({
      type: 'note',
      raw: '1',
      targetLabel: '1',
    })
    expect(result.errors).toEqual([
      '该音 D4 超出 D 调笛 · 筒音作5 常用音域',
      '“x” 暂时识别不了，可以输入 1-7、0、-、|',
    ])
  })
})
