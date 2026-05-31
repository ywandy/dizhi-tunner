import { cn } from '../../lib/utils'

type ToggleOption<TValue extends string> = {
  value: TValue
  label: string
}

type ToggleGroupProps<TValue extends string> = {
  label: string
  value: TValue
  options: Array<ToggleOption<TValue>>
  onValueChange: (value: TValue) => void
  className?: string
}

export function ToggleGroup<TValue extends string>({
  label,
  value,
  options,
  onValueChange,
  className,
}: ToggleGroupProps<TValue>) {
  return (
    <div
      aria-label={label}
      className={cn('grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-muted)] p-1', className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            aria-checked={selected}
            className={cn(
              'min-h-11 rounded-xl px-3 text-sm font-semibold transition-[background,color,box-shadow] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
              selected
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft'
                : 'text-[var(--muted-foreground)] hover:bg-white/70',
            )}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
