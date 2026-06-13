import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { BookOpen, Mic, SlidersHorizontal } from 'lucide-react'

import { ModeTopTabs } from './components/ModeTopTabs'
import { SettingsPanel } from './components/SettingsPanel'
import { StartStopButton } from './components/StartStopButton'
import { TuningMeter } from './components/TuningMeter'
import { ResultPanel } from './components/ResultPanel'
import { Alert } from './components/ui/alert'
import {
  HoleScoreHome,
  JianpuHoleScoreEditor,
  type ManualHoleScoreDraft,
  ManualHoleScoreEditor,
  NewHoleScorePage,
} from './pages/HoleScorePages'
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
import type { SavedScore } from './core/score/scoreTypes'

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

type AppRoute =
  | 'tuner'
  | 'hole-scores'
  | 'hole-scores-new'
  | 'hole-scores-jianpu'
  | 'hole-scores-manual'
  | 'settings'

function getRouteFromHash(): AppRoute {
  const hash = window.location.hash
  if (hash === '#/tuner') return 'tuner'
  if (hash === '#/settings') return 'settings'
  if (hash === '#/hole-scores/new') return 'hole-scores-new'
  if (hash === '#/hole-scores/jianpu') return 'hole-scores-jianpu'
  if (hash === '#/hole-scores/manual') return 'hole-scores-manual'
  if (hash === '#/hole-scores') return 'hole-scores'
  return 'tuner'
}

function getHashPathFromRoute(route: AppRoute) {
  if (route === 'hole-scores-new') return '/hole-scores/new'
  if (route === 'hole-scores-jianpu') return '/hole-scores/jianpu'
  if (route === 'hole-scores-manual') return '/hole-scores/manual'
  return `/${route}`
}

function getIsNativeShell(): boolean {
  return new URLSearchParams(window.location.search).get('native-shell') === '1'
}

function WebBottomNavigation({
  route,
  onRouteChange,
}: {
  route: AppRoute
  onRouteChange: (route: AppRoute) => void
}) {
  const items: Array<{
    route: AppRoute
    label: string
    icon: typeof Mic
  }> = [
    { route: 'tuner', label: '测音', icon: Mic },
    { route: 'hole-scores', label: '洞洞谱', icon: BookOpen },
    { route: 'settings', label: '设置', icon: SlidersHorizontal },
  ]

  return (
    <nav
      aria-label="主导航"
      className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:pb-3"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = route === item.route

          return (
            <button
              aria-current={active ? 'page' : undefined}
              className={[
                'flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-[background,color,transform] active:scale-[0.98]',
                active
                  ? 'bg-[var(--status-good-bg)] text-[var(--status-good)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]',
              ].join(' ')}
              key={item.route}
              onClick={() => onRouteChange(item.route)}
              type="button"
            >
              <Icon aria-hidden className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function App() {
  const [preferences, setPreferences] = useState<AppPreferences>(loadPreferences)
  const { diziKey, fingeringProfileId, mode, targetLabel } = preferences
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash)
  const [isNativeShell] = useState(getIsNativeShell)
  const [currentHoleScore, setCurrentHoleScore] = useState<SavedScore | null>(
    null,
  )
  const [manualDraftConfig, setManualDraftConfig] =
    useState<ManualHoleScoreDraft | null>(null)
  const [, setScoreLibraryVersion] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [realtimeFreq, setRealtimeFreq] = useState<number | null>(null)
  const [realtimeResult, setRealtimeResult] = useState<TuningResult | null>(null)
  const [averageFreq, setAverageFreq] = useState<number | null>(null)
  const [averageResult, setAverageResult] = useState<TuningResult | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

  const handleRouteChange = (nextRoute: AppRoute) => {
    setRoute(nextRoute)
    window.location.hash = getHashPathFromRoute(nextRoute)
  }

  const refreshScoreLibrary = () => {
    setScoreLibraryVersion((version) => version + 1)
  }

  const openHoleScore = (score: SavedScore) => {
    setCurrentHoleScore(score)
    setManualDraftConfig(null)
    handleRouteChange(
      score.mode === 'jianpu-generated'
        ? 'hole-scores-jianpu'
        : 'hole-scores-manual',
    )
  }

  const renderHoleScoreRoute = () => {
    if (route === 'hole-scores-new') {
      return (
        <NewHoleScorePage
          defaultFingeringProfileId={fingeringProfileId}
          defaultFluteKey={diziKey}
          onBack={() => handleRouteChange('hole-scores')}
          onCreateJianpu={() => {
            setCurrentHoleScore(null)
            setManualDraftConfig(null)
            handleRouteChange('hole-scores-jianpu')
          }}
          onCreateManual={(draft) => {
            setCurrentHoleScore(null)
            setManualDraftConfig(draft)
            handleRouteChange('hole-scores-manual')
          }}
        />
      )
    }

    if (route === 'hole-scores-jianpu') {
      return (
        <JianpuHoleScoreEditor
          defaultFingeringProfileId={fingeringProfileId}
          defaultFluteKey={diziKey}
          initialScore={currentHoleScore}
          onBack={() => handleRouteChange('hole-scores')}
          onSaved={(score) => {
            setCurrentHoleScore(score)
            refreshScoreLibrary()
          }}
        />
      )
    }

    if (route === 'hole-scores-manual') {
      return (
        <ManualHoleScoreEditor
          draftConfig={manualDraftConfig}
          defaultFingeringProfileId={fingeringProfileId}
          defaultFluteKey={diziKey}
          initialScore={currentHoleScore}
          onBack={() => handleRouteChange('hole-scores')}
          onSaved={(score) => {
            setCurrentHoleScore(score)
            refreshScoreLibrary()
          }}
        />
      )
    }

    return (
      <HoleScoreHome
        onCreate={() => handleRouteChange('hole-scores-new')}
        onOpen={openHoleScore}
        onRefresh={refreshScoreLibrary}
      />
    )
  }

  const isHoleScoreRoute = route.startsWith('hole-scores')
  const isManualHoleScoreRoute = route === 'hole-scores-manual'

  return (
    <main
      className={[
        'h-dvh overflow-hidden bg-[var(--panel)] p-0 text-[var(--foreground)] sm:bg-[var(--app-bg)] sm:px-6 sm:py-5',
        isNativeShell ? 'native-shell' : '',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex h-full min-h-0 w-full max-w-none flex-col sm:min-h-[calc(100dvh-4rem)] sm:max-w-md',
          isNativeShell
            ? ''
            : 'web-app-shell sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-white/80 sm:bg-[var(--panel)]',
        ].join(' ')}
      >
        <section
          className={[
            'tuner-shell flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-none border-0 bg-[var(--panel)] shadow-none',
            isManualHoleScoreRoute ? 'px-3 py-3 sm:px-4 sm:py-3' : 'px-5 py-4 sm:px-6 sm:py-5',
            isNativeShell
              ? 'sm:rounded-[2rem] sm:border sm:border-white/80'
              : '',
          ].join(' ')}
        >
          {isHoleScoreRoute ? null : (
            <ModeTopTabs onChange={setMode} value={mode} />
          )}
          {isHoleScoreRoute ? (
            renderHoleScoreRoute()
          ) : route === 'settings' ? (
            <SettingsPanel
              diziKey={diziKey}
              fingeringProfileId={fingeringProfileId}
              mode={mode}
              onDiziKeyChange={setDiziKey}
              onFingeringProfileChange={setFingeringProfileId}
              onTargetLabelChange={setTargetLabel}
              targetLabel={targetLabel}
              targets={targets}
            />
          ) : (
            <>
              <header className="mb-[clamp(0.75rem,3dvh,1.75rem)]">
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
              </header>

              <div className="flex flex-1 flex-col justify-center gap-[clamp(0.75rem,3dvh,1.75rem)]">
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

              <div className="mt-[clamp(0.75rem,3dvh,1.75rem)] space-y-3">
                {error ? <Alert variant="destructive">{error}</Alert> : null}
                <StartStopButton
                  isRunning={isRunning}
                  isStarting={isStarting}
                  onStart={handleStart}
                  onStop={handleStop}
                />
              </div>
            </>
          )}
        </section>
        {isNativeShell ? null : (
          <WebBottomNavigation
            onRouteChange={handleRouteChange}
            route={route}
          />
        )}
      </div>
    </main>
  )
}
