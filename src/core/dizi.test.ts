import {
  buildDiziTargets,
  diziKeyOptions,
  fingeringProfileOptions,
  jianpuRange,
  midiToFreq,
  noteToMidi,
} from './dizi'

describe('dizi target generation', () => {
  it('supports the first-version dizi keys', () => {
    expect(diziKeyOptions.map((item) => item.value)).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
    ])
  })

  it('converts note names and midi values against A4 = 440Hz', () => {
    expect(noteToMidi('A', 4)).toBe(69)
    expect(midiToFreq(69)).toBeCloseTo(440, 6)
  })

  it('builds the PRD D key target frequencies', () => {
    const targets = buildDiziTargets('D')

    expect(targets.map((target) => target.label)).toEqual(
      jianpuRange.map((item) => item.label),
    )
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      293.66,
      2,
    )
    expect(targets.find((target) => target.label === '5')?.frequency).toBeCloseTo(
      440,
      2,
    )
    expect(
      targets.find((target) => target.label === '高音1')?.frequency,
    ).toBeCloseTo(587.33, 2)
  })

  it('supports the configured fingering profiles', () => {
    expect(fingeringProfileOptions.map((item) => item.value)).toEqual([
      'tube_as_5',
      'tube_as_2',
      'tube_as_1',
    ])
    expect(fingeringProfileOptions.map((item) => item.label)).toEqual([
      '筒音作5',
      '筒音作2',
      '筒音作1',
    ])
  })

  it('keeps tube-as-5 as the default fingering profile', () => {
    expect(buildDiziTargets('D')).toEqual(
      buildDiziTargets({ diziKey: 'D', fingeringProfileId: 'tube_as_5' }),
    )
  })

  it('builds D key tube-as-2 targets from its own range template', () => {
    const targets = buildDiziTargets({
      diziKey: 'D',
      fingeringProfileId: 'tube_as_2',
    })

    expect(targets.map((target) => target.label)).toEqual([
      '低音2',
      '低音3',
      '低音4',
      '低音5',
      '低音6',
      '低音7',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '高音1',
      '高音2',
      '高音3',
    ])
    expect(targets.find((target) => target.label === '低音2')?.frequency).toBeCloseTo(
      220,
      2,
    )
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      392,
      2,
    )
  })

  it('builds D key tube-as-1 targets up to double high 1', () => {
    const targets = buildDiziTargets({
      diziKey: 'D',
      fingeringProfileId: 'tube_as_1',
    })

    expect(targets.map((target) => target.label)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '高音1',
      '高音2',
      '高音3',
      '高音4',
      '高音5',
      '高音6',
      '高音7',
      '倍高音1',
    ])
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      220,
      2,
    )
    expect(
      targets.find((target) => target.label === '倍高音1')?.frequency,
    ).toBeCloseTo(880, 2)
  })
})
