import { PitchDetector } from 'pitchy'

export type TunerController = {
  stop: () => void
}

type AudioContextConstructor = typeof AudioContext

function getAudioContextConstructor(): AudioContextConstructor | null {
  const browserWindow = window as Window &
    typeof globalThis & {
      webkitAudioContext?: AudioContextConstructor
    }

  return browserWindow.AudioContext ?? browserWindow.webkitAudioContext ?? null
}

export async function startTuner(
  onPitch: (frequency: number) => void,
): Promise<TunerController> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('UNSUPPORTED_GET_USER_MEDIA')
  }

  const AudioContextClass = getAudioContextConstructor()

  if (!AudioContextClass) {
    throw new Error('UNSUPPORTED_AUDIO_CONTEXT')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })

  const audioContext = new AudioContextClass()

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  const source = audioContext.createMediaStreamSource(stream)
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0
  source.connect(analyser)

  const detector = PitchDetector.forFloat32Array(analyser.fftSize)
  const buffer = new Float32Array(analyser.fftSize)

  let stopped = false
  let animationFrame = 0

  const tick = () => {
    if (stopped) return

    analyser.getFloatTimeDomainData(buffer)
    const [pitch, clarity] = detector.findPitch(buffer, audioContext.sampleRate)

    if (
      Number.isFinite(pitch) &&
      pitch >= 80 &&
      pitch <= 2000 &&
      clarity >= 0.85
    ) {
      onPitch(pitch)
    }

    animationFrame = window.requestAnimationFrame(tick)
  }

  animationFrame = window.requestAnimationFrame(tick)

  return {
    stop() {
      if (stopped) return

      stopped = true
      window.cancelAnimationFrame(animationFrame)
      source.disconnect()
      stream.getTracks().forEach((track) => track.stop())
      void audioContext.close()
    },
  }
}
