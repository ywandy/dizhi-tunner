import { useEffect, useRef, useState } from 'react'

import { centsToMeterPercent, clamp, getToneDirection } from '../core/tuning'

type TuningMeterProps = {
  cents: number | null
}

const meterDamping = 0.16
const snapThreshold = 0.1

function getTargetCents(cents: number | null) {
  return clamp(cents ?? 0, -50, 50)
}

function shouldReduceMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function TuningMeter({ cents }: TuningMeterProps) {
  const targetCents = getTargetCents(cents)
  const [displayCents, setDisplayCents] = useState(targetCents)
  const displayCentsRef = useRef(targetCents)
  const animationFrameRef = useRef<number | null>(null)
  const percent = centsToMeterPercent(displayCents)
  const direction = getToneDirection(cents)

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (shouldReduceMotion()) {
      displayCentsRef.current = targetCents
      setDisplayCents(targetCents)
      return
    }

    const animate = () => {
      const current = displayCentsRef.current
      const distance = targetCents - current

      if (Math.abs(distance) < snapThreshold) {
        displayCentsRef.current = targetCents
        setDisplayCents(targetCents)
        animationFrameRef.current = null
        return
      }

      const next = current + distance * meterDamping
      displayCentsRef.current = next
      setDisplayCents(next)
      animationFrameRef.current = window.requestAnimationFrame(animate)
    }

    animationFrameRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [targetCents])

  return (
    <section aria-label="音准偏差电平表" className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
        <span>偏低</span>
        <span>准</span>
        <span>偏高</span>
      </div>
      <div className="relative px-1 pb-5 pt-5">
        <div className="relative h-2 rounded-full bg-[var(--meter-muted)]">
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,var(--meter-red),var(--meter-amber)_32%,var(--meter-green)_50%,var(--meter-amber)_68%,var(--meter-red))]" />
          <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-y-1/2 bg-white/75" />
          <div
            className="absolute top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--foreground)] shadow-pointer transition-colors duration-200"
            data-testid="tuning-meter-pointer"
            style={{ left: `${percent}%` }}
          />
        </div>
        <div className="mt-4 flex justify-between text-[11px] font-semibold text-[var(--muted-foreground)] tabular-nums">
          <span>-50</span>
          <span>-25</span>
          <span>0</span>
          <span>+25</span>
          <span>+50</span>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {cents === null
          ? '电平表等待吹奏'
          : `当前偏差 ${cents.toFixed(1)} cents，${
              direction === 'sharp' ? '偏高' : direction === 'flat' ? '偏低' : '很准'
            }`}
      </div>
    </section>
  )
}
