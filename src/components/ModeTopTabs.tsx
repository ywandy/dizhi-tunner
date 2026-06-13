import { Activity, Target } from 'lucide-react'

import type { Mode } from '../core/tuning'
import { cn } from '../lib/utils'

type ModeTopTabsProps = {
  value: Mode
  onChange: (value: Mode) => void
}

const modeOptions: Array<{
  value: Mode
  label: string
  icon: typeof Activity
}> = [
  { value: 'realtime', label: '实时检测', icon: Activity },
  { value: 'target', label: '指定音练习', icon: Target },
]

export function ModeTopTabs({ onChange, value }: ModeTopTabsProps) {
  return (
    <div className="mode-top-tabs sticky top-0 z-20 mb-5 bg-[linear-gradient(180deg,var(--panel)_74%,rgb(251_253_251/0))] pb-3 pt-1">
      <div
        aria-label="检测模式"
        className="grid grid-cols-2 gap-1 rounded-full border border-white/80 bg-white/70 p-1 shadow-subtle backdrop-blur-xl"
        role="radiogroup"
      >
        {modeOptions.map((option) => {
          const Icon = option.icon
          const selected = option.value === value

          return (
            <button
              aria-checked={selected}
              className={cn(
                'flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-bold transition-[background,color,box-shadow,transform] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] sm:gap-2 sm:px-3 sm:text-sm',
                selected
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft'
                  : 'text-[var(--muted-foreground)] hover:bg-white/80',
              )}
              key={option.value}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              <Icon aria-hidden className="h-4 w-4" />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
