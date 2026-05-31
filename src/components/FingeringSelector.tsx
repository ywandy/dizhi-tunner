import {
  fingeringProfileOptions,
  type FingeringProfileId,
} from '../core/dizi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type FingeringSelectorProps = {
  value: FingeringProfileId
  onChange: (value: FingeringProfileId) => void
}

export function FingeringSelector({
  onChange,
  value,
}: FingeringSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        指法
      </label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as FingeringProfileId)}
      >
        <SelectTrigger aria-label="指法">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fingeringProfileOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
