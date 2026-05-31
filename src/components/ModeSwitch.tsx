import type { Mode } from '../core/tuning'
import { ToggleGroup } from './ui/toggle-group'

type ModeSwitchProps = {
  value: Mode
  onChange: (value: Mode) => void
}

const modeOptions: Array<{ value: Mode; label: string }> = [
  { value: 'realtime', label: '实时检测' },
  { value: 'target', label: '指定音练习' },
]

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        检测模式
      </div>
      <ToggleGroup
        label="检测模式"
        onValueChange={onChange}
        options={modeOptions}
        value={value}
      />
    </div>
  )
}
