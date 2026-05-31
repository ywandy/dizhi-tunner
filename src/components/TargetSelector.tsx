import type { DiziTarget, JianpuLabel } from '../core/dizi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type TargetSelectorProps = {
  value: JianpuLabel
  targets: DiziTarget[]
  onChange: (label: JianpuLabel) => void
}

export function TargetSelector({ value, targets, onChange }: TargetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        目标音
      </label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as JianpuLabel)}
      >
        <SelectTrigger aria-label="目标音">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {targets.map((target) => (
            <SelectItem key={target.label} value={target.label}>
              {target.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
