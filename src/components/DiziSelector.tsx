import { diziKeyOptions, type DiziKey } from '../core/dizi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type DiziSelectorProps = {
  value: DiziKey
  onChange: (value: DiziKey) => void
}

export function DiziSelector({ value, onChange }: DiziSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        笛子调性
      </label>
      <Select value={value} onValueChange={(next) => onChange(next as DiziKey)}>
        <SelectTrigger aria-label="笛子调性">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {diziKeyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
