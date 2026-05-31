import { buildDiziTargets } from './dizi'
import {
  centsDiff,
  centsToMeterPercent,
  checkAgainstTarget,
  findNearestTarget,
  getStatusText,
} from './tuning'

describe('tuning math', () => {
  it('calculates cents with negative values for flat notes', () => {
    expect(centsDiff(440, 440)).toBeCloseTo(0, 6)
    expect(centsDiff(438.6, 440)).toBeCloseTo(-5.5, 1)
  })

  it('finds the nearest dizi target in realtime mode', () => {
    const result = findNearestTarget(438.6, buildDiziTargets('D'))

    expect(result?.label).toBe('5')
    expect(result?.frequency).toBeCloseTo(440, 2)
    expect(result?.cents).toBeCloseTo(-5.5, 1)
  })

  it('keeps comparing against the selected target in target mode', () => {
    const target = buildDiziTargets('D').find((item) => item.label === '5')

    expect(target).toBeDefined()
    const result = checkAgainstTarget(293.66, target!)

    expect(result.label).toBe('5')
    expect(result.frequency).toBeCloseTo(440, 2)
    expect(result.cents).toBeLessThan(-600)
  })

  it('maps cents to a clamped meter percentage', () => {
    expect(centsToMeterPercent(-75)).toBe(0)
    expect(centsToMeterPercent(-25)).toBe(25)
    expect(centsToMeterPercent(0)).toBe(50)
    expect(centsToMeterPercent(25)).toBe(75)
    expect(centsToMeterPercent(75)).toBe(100)
  })

  it('uses PRD status text thresholds', () => {
    expect(getStatusText(0)).toBe('很准')
    expect(getStatusText(5)).toBe('很准')
    expect(getStatusText(8)).toBe('基本准')
    expect(getStatusText(18)).toBe('略高')
    expect(getStatusText(-18)).toBe('略低')
    expect(getStatusText(21)).toBe('明显偏高')
    expect(getStatusText(-21)).toBe('明显偏低')
  })
})
