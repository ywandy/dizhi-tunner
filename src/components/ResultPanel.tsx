import type { JianpuLabel } from '../core/dizi'
import type { Mode, TuningResult } from '../core/tuning'
import { getStatusText, getToneDirection } from '../core/tuning'

type ResultPanelProps = {
  result: TuningResult | null
  realtimeFreq: number | null
  averageFreq: number | null
  targetFrequency: number | null
  targetLabel: JianpuLabel
  isRunning: boolean
  mode: Mode
}

function formatFrequency(value: number | null) {
  return value === null ? '-- Hz' : `${value.toFixed(1)} Hz`
}

function formatCents(value: number | null) {
  if (value === null) return null
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} cents`
}

export function ResultPanel({
  averageFreq,
  isRunning,
  mode,
  realtimeFreq,
  result,
  targetFrequency,
  targetLabel,
}: ResultPanelProps) {
  const cents = result?.cents ?? null
  const status = isRunning ? getStatusText(cents) : '等待吹奏'
  const displayLabel = result?.label ?? (isRunning && mode === 'target' ? targetLabel : '--')
  const direction = getToneDirection(cents)
  const statusTone =
    direction === 'center'
      ? 'bg-[var(--status-good-bg)] text-[var(--status-good)]'
      : Math.abs(cents ?? 0) <= 20
        ? 'bg-[var(--status-warn-bg)] text-[var(--status-warn)]'
        : 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'

  return (
    <section className="text-center" aria-live="polite">
      <div className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
        {isRunning ? '当前识别' : '准备就绪'}
      </div>
      <div className="jianpu-display font-black leading-[0.86] text-[var(--foreground)]">
        {displayLabel}
      </div>
      <div
        className={`mx-auto mt-5 inline-flex min-h-10 items-center rounded-full px-5 text-sm font-bold ${statusTone}`}
      >
        {formatCents(cents) ? `${status} · ${formatCents(cents)}` : status}
      </div>
      <dl className="mx-auto mt-9 grid w-full max-w-[21rem] grid-cols-3 gap-1 text-center sm:gap-3">
        <div className="min-w-0">
          <dt className="text-xs text-[var(--muted-foreground)]">当前频率</dt>
          <dd className="frequency-readout mt-1 font-bold text-[var(--foreground)] tabular-nums">
            {formatFrequency(realtimeFreq)}
          </dd>
        </div>
        <div className="min-w-0 border-x border-[var(--border)] px-1 sm:px-2">
          <dt className="text-xs text-[var(--muted-foreground)]">平均频率</dt>
          <dd className="frequency-readout mt-1 font-bold text-[var(--foreground)] tabular-nums">
            {formatFrequency(averageFreq)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-[var(--muted-foreground)]">目标频率</dt>
          <dd className="frequency-readout mt-1 font-bold text-[var(--foreground)] tabular-nums">
            {formatFrequency(targetFrequency)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
