type PitchSample = {
  frequency: number
  timestamp: number
}

export function createRollingPitchWindow(windowMs = 1000) {
  let samples: PitchSample[] = []

  function prune(timestamp: number) {
    const cutoff = timestamp - windowMs
    samples = samples.filter((sample) => sample.timestamp >= cutoff)
  }

  return {
    addSample(frequency: number, timestamp: number) {
      samples.push({ frequency, timestamp })
      prune(timestamp)
    },
    getAverage(timestamp: number) {
      prune(timestamp)

      if (samples.length === 0) return null

      const total = samples.reduce((sum, sample) => sum + sample.frequency, 0)
      return total / samples.length
    },
    clear() {
      samples = []
    },
  }
}
