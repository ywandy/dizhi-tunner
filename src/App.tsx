import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SettingsSheet } from './components/SettingsSheet'
import { StartStopButton } from './components/StartStopButton'
import { TuningMeter } from './components/TuningMeter'
import { ResultPanel } from './components/ResultPanel'
import { Alert } from './components/ui/alert'
import {
  buildDiziTargets,
  getFingeringProfileLabel,
  isTargetLabelForFingering,
  type DiziKey,
  type FingeringProfileId,
  type JianpuLabel,
} from './core/dizi'
import { startTuner, type TunerController } from './core/audio'
import { createRollingPitchWindow } from './core/pitchSamples'
import {
  loadPreferences,
  savePreferences,
  type AppPreferences,
} from './core/preferences'
import {
  checkAgainstTarget,
  findNearestTarget,
  type Mode,
  type TuningResult,
} from './core/tuning'

function getDiziLabel(key: DiziKey) {
  return `${key} 调笛`
}

function getDiziSummary(key: DiziKey, fingeringProfileId: FingeringProfileId) {
  return `${getDiziLabel(key)} · ${getFingeringProfileLabel(fingeringProfileId)}`
}

function getAudioErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError'
    ) {
      return '无法访问麦克风，请允许浏览器使用麦克风后重试。'
    }

    if (
      error.message === 'UNSUPPORTED_GET_USER_MEDIA' ||
      error.message === 'UNSUPPORTED_AUDIO_CONTEXT'
    ) {
      return '当前浏览器不支持麦克风检测，请使用 Chrome、Edge 或 Safari 浏览器。'
    }
  }

  return '麦克风启动失败，请检查浏览器权限后重试。'
}

export default function App() {
  const [preferences, setPreferences] = useState<AppPreferences>(loadPreferences)
  const { diziKey, fingeringProfileId, mode, targetLabel } = preferences
  const [isRunning, setIsRunning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [realtimeFreq, setRealtimeFreq] = useState<number | null>(null)
  const [realtimeResult, setRealtimeResult] = useState<TuningResult | null>(null)
  const [averageFreq, setAverageFreq] = useState<number | null>(null)
  const [averageResult, setAverageResult] = useState<TuningResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const tunerRef = useRef<TunerController | null>(null)
  const stateRef = useRef({ diziKey, fingeringProfileId, mode, targetLabel })
  const pitchWindowRef = useRef(createRollingPitchWindow(1000))
  const lastPitchAtRef = useRef<number | null>(null)

  const targets = useMemo(
    () => buildDiziTargets({ diziKey, fingeringProfileId }),
    [diziKey, fingeringProfileId],
  )
  const selectedTarget = useMemo(
    () => targets.find((target) => target.label === targetLabel) ?? null,
    [targetLabel, targets],
  )

  useEffect(() => {
    stateRef.current = { diziKey, fingeringProfileId, mode, targetLabel }
  }, [diziKey, fingeringProfileId, mode, targetLabel])

  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  const calculateResult = useCallback((frequency: number) => {
    const {
      diziKey: activeKey,
      fingeringProfileId: activeFingeringProfileId,
      mode: activeMode,
      targetLabel: activeTargetLabel,
    } = stateRef.current
    const activeTargets = buildDiziTargets({
      diziKey: activeKey,
      fingeringProfileId: activeFingeringProfileId,
    })

    if (activeMode === 'realtime') {
      return findNearestTarget(frequency, activeTargets)
    }

    const activeTarget = activeTargets.find(
      (target) => target.label === activeTargetLabel,
    )

    return activeTarget ? checkAgainstTarget(frequency, activeTarget) : null
  }, [])

  const clearReadings = useCallback(() => {
    pitchWindowRef.current.clear()
    lastPitchAtRef.current = null
    setRealtimeFreq(null)
    setRealtimeResult(null)
    setAverageFreq(null)
    setAverageResult(null)
  }, [])

  const clearRealtimeReadings = useCallback(() => {
    pitchWindowRef.current.clear()
    lastPitchAtRef.current = null
    setRealtimeFreq(null)
    setRealtimeResult(null)
  }, [])

  const setDiziKey = useCallback(
    (value: DiziKey) => {
      setPreferences((current) => ({ ...current, diziKey: value }))
      clearReadings()
    },
    [clearReadings],
  )

  const setFingeringProfileId = useCallback(
    (value: FingeringProfileId) => {
      setPreferences((current) => ({
        ...current,
        fingeringProfileId: value,
        targetLabel: isTargetLabelForFingering(current.targetLabel, value)
          ? current.targetLabel
          : '1',
      }))
      clearReadings()
    },
    [clearReadings],
  )

  const setMode = useCallback((value: Mode) => {
    setPreferences((current) => ({ ...current, mode: value }))
  }, [])

  const setTargetLabel = useCallback((value: JianpuLabel) => {
    setPreferences((current) => ({ ...current, targetLabel: value }))
  }, [])

  const handlePitch = useCallback(
    (frequency: number) => {
      const now = Date.now()
      const nextRealtimeResult = calculateResult(frequency)
      pitchWindowRef.current.addSample(frequency, now)
      const nextAverageFreq = pitchWindowRef.current.getAverage(now)

      lastPitchAtRef.current = now
      setRealtimeFreq(frequency)
      setRealtimeResult(nextRealtimeResult)
      setAverageFreq(nextAverageFreq)
      setAverageResult(
        nextAverageFreq === null ? null : calculateResult(nextAverageFreq),
      )
      setError(null)
    },
    [calculateResult],
  )

  useEffect(() => {
    stateRef.current = { diziKey, fingeringProfileId, mode, targetLabel }
    setRealtimeResult(
      realtimeFreq === null ? null : calculateResult(realtimeFreq),
    )
    setAverageResult(averageFreq === null ? null : calculateResult(averageFreq))
  }, [
    averageFreq,
    calculateResult,
    diziKey,
    fingeringProfileId,
    mode,
    realtimeFreq,
    targetLabel,
  ])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      const lastPitchAt = lastPitchAtRef.current

      if (lastPitchAt !== null && Date.now() - lastPitchAt > 600) {
        clearRealtimeReadings()
      }
    }, 100)

    return () => window.clearInterval(interval)
  }, [clearRealtimeReadings, isRunning])

  useEffect(
    () => () => {
      tunerRef.current?.stop()
    },
    [],
  )

  const handleStart = async () => {
    if (isStarting || isRunning) return

    setIsStarting(true)
    setError(null)
    clearReadings()

    try {
      tunerRef.current = await startTuner(handlePitch)
      setIsRunning(true)
    } catch (startError) {
      setError(getAudioErrorMessage(startError))
      setIsRunning(false)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = () => {
    tunerRef.current?.stop()
    tunerRef.current = null
    setIsRunning(false)
    setIsStarting(false)
    clearReadings()
  }

  const summaryMode = mode === 'realtime' ? '实时检测' : `目标 ${targetLabel}`
  const targetFrequency =
    mode === 'target' ? selectedTarget?.frequency ?? null : averageResult?.frequency ?? null

  return (
    <main className="h-dvh overflow-hidden bg-[var(--panel)] p-0 text-[var(--foreground)] sm:bg-[var(--app-bg)] sm:px-6 sm:py-8">
      <div className="mx-auto flex h-full w-full max-w-none flex-col sm:min-h-[calc(100dvh-4rem)] sm:max-w-md">
        <section className="tuner-shell flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-none border-0 bg-[var(--panel)] px-5 py-4 shadow-none sm:rounded-[2rem] sm:border sm:border-white/80 sm:px-6 sm:py-6">
          <header className="mb-[clamp(1rem,4dvh,2.5rem)] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                {summaryMode}
              </p>
              <h1 className="truncate text-xl font-black tracking-normal text-[var(--foreground)]">
                笛子音准测试
              </h1>
              <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
                {getDiziSummary(diziKey, fingeringProfileId)}
              </p>
            </div>
            <SettingsSheet
              diziKey={diziKey}
              fingeringProfileId={fingeringProfileId}
              mode={mode}
              onDiziKeyChange={setDiziKey}
              onFingeringProfileChange={setFingeringProfileId}
              onModeChange={setMode}
              onOpenChange={setSettingsOpen}
              onTargetLabelChange={setTargetLabel}
              open={settingsOpen}
              targetLabel={targetLabel}
              targets={targets}
            />
          </header>

          <div className="flex flex-1 flex-col justify-center gap-[clamp(1rem,4dvh,2.25rem)]">
            <ResultPanel
              averageFreq={averageFreq}
              isRunning={isRunning}
              mode={mode}
              realtimeFreq={realtimeFreq}
              result={averageResult}
              targetFrequency={targetFrequency}
              targetLabel={targetLabel}
            />
            <TuningMeter cents={realtimeResult?.cents ?? null} />
          </div>

          <div className="mt-[clamp(1rem,4dvh,2.25rem)] space-y-3 pb-[env(safe-area-inset-bottom)]">
            {error ? <Alert variant="destructive">{error}</Alert> : null}
            <StartStopButton
              isRunning={isRunning}
              isStarting={isStarting}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
