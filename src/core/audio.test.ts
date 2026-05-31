import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pitchyMocks = vi.hoisted(() => ({
  findPitch: vi.fn(),
  forFloat32Array: vi.fn(),
}))

vi.mock('pitchy', () => ({
  PitchDetector: {
    forFloat32Array: pitchyMocks.forFloat32Array,
  },
}))

import { startTuner } from './audio'

describe('startTuner pitch filtering', () => {
  beforeEach(() => {
    pitchyMocks.findPitch.mockReset()
    pitchyMocks.forFloat32Array.mockReset()
    pitchyMocks.forFloat32Array.mockReturnValue({
      findPitch: pitchyMocks.findPitch,
    })

    const stream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
    }
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(stream),
      },
    })

    const analyser = {
      fftSize: 0,
      smoothingTimeConstant: 0,
      getFloatTimeDomainData: vi.fn(),
    }
    const source = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    }
    const AudioContextMock = vi.fn(() => ({
      state: 'running',
      sampleRate: 48000,
      close: vi.fn(),
      createAnalyser: vi.fn(() => analyser),
      createMediaStreamSource: vi.fn(() => source),
      resume: vi.fn(),
    }))

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: AudioContextMock,
    })
    Object.defineProperty(window, 'webkitAudioContext', {
      configurable: true,
      value: undefined,
    })

    let didRunFrame = false
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      if (!didRunFrame) {
        didRunFrame = true
        callback(0)
      }

      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts stable pitches above 2000Hz for high dizi targets', async () => {
    pitchyMocks.findPitch.mockReturnValue([2500, 0.9])
    const onPitch = vi.fn()

    const controller = await startTuner(onPitch)

    expect(onPitch).toHaveBeenCalledWith(2500)
    controller.stop()
  })
})
