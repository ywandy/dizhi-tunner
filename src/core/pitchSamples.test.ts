import { createRollingPitchWindow } from './pitchSamples'

describe('rolling pitch window', () => {
  it('averages only samples inside the configured time window', () => {
    const window = createRollingPitchWindow(1000)

    window.addSample(220, 0)
    window.addSample(440, 500)
    window.addSample(880, 1500)

    expect(window.getAverage(1500)).toBeCloseTo(660, 6)
    expect(window.getAverage(1601)).toBeCloseTo(880, 6)
  })

  it('returns null when no samples remain and supports clearing', () => {
    const window = createRollingPitchWindow(1000)

    expect(window.getAverage(0)).toBeNull()

    window.addSample(440, 100)
    expect(window.getAverage(100)).toBe(440)

    window.clear()
    expect(window.getAverage(100)).toBeNull()
  })
})
