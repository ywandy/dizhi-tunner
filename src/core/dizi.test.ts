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

  it('builds D key tube-as-5 targets from the octave-5 dizi key basis', () => {
    const targets = buildDiziTargets('D')

    expect(targets.map((target) => target.label)).toEqual(
      jianpuRange.map((item) => item.label),
    )
    expect(
      targets.find((target) => target.label === '低音5')?.frequency,
    ).toBeCloseTo(440, 2)
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      587.33,
      2,
    )
    expect(targets.find((target) => target.label === '5')?.frequency).toBeCloseTo(
      880,
      2,
    )
    expect(
      targets.find((target) => target.label === '高音1')?.frequency,
    ).toBeCloseTo(1174.66, 2)
  })

  it('uses B4 as the physical tube note for E key tube-as-5', () => {
    const targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_5',
    })

    expect(
      targets.find((target) => target.label === '低音5')?.frequency,
    ).toBeCloseTo(493.88, 2)
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
      440,
      2,
    )
    expect(targets.find((target) => target.label === '低音4')?.frequency).toBeCloseTo(
      523.25,
      2,
    )
    expect(targets.find((target) => target.label === '低音5')?.frequency).toBeCloseTo(
      587.33,
      2,
    )
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      783.99,
      2,
    )
  })

  it('maps E key tube-as-2 from the same B4 physical tube note', () => {
    const targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_2',
    })

    expect(
      targets.find((target) => target.label === '低音2')?.frequency,
    ).toBeCloseTo(493.88, 2)
    expect(
      targets.find((target) => target.label === '低音5')?.frequency,
    ).toBeCloseTo(659.26, 2)
  })

  it('builds D key tube-as-1 targets up to double high 2', () => {
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
      '倍高音2',
    ])
    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      440,
      2,
    )
    expect(
      targets.find((target) => target.label === '倍高音1')?.frequency,
    ).toBeCloseTo(1760, 2)
    expect(
      targets.find((target) => target.label === '倍高音2')?.frequency,
    ).toBeCloseTo(1975.53, 2)
  })

  it('maps E key tube-as-1 tonic to B4', () => {
    const targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_1',
    })

    expect(targets.find((target) => target.label === '1')?.frequency).toBeCloseTo(
      493.88,
      2,
    )
  })

  it('keeps the same low and high physical range for every fingering profile', () => {
    const tubeAs5Targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_5',
    })
    const tubeAs2Targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_2',
    })
    const tubeAs1Targets = buildDiziTargets({
      diziKey: 'E',
      fingeringProfileId: 'tube_as_1',
    })

    expect(tubeAs5Targets).toHaveLength(16)
    expect(tubeAs2Targets).toHaveLength(16)
    expect(tubeAs1Targets).toHaveLength(16)
    expect(tubeAs5Targets[0]).toMatchObject({ label: '低音5', midi: 71 })
    expect(tubeAs2Targets[0]).toMatchObject({ label: '低音2', midi: 71 })
    expect(tubeAs1Targets[0]).toMatchObject({ label: '1', midi: 71 })
    expect(tubeAs2Targets.at(-1)?.midi).toBe(tubeAs5Targets.at(-1)?.midi)
    expect(tubeAs1Targets.at(-1)?.midi).toBe(tubeAs5Targets.at(-1)?.midi)
    expect(
      tubeAs2Targets.find((target) => target.label === '低音5')?.frequency,
    ).toBeCloseTo(659.26, 2)
    expect(tubeAs2Targets.find((target) => target.label === '5')?.frequency).toBeCloseTo(
      1318.51,
      2,
    )
  })
})
