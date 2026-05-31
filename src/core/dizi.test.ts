import {
  buildDiziTargets,
  diziKeyOptions,
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
})
