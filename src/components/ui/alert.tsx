import * as React from 'react'

import { cn } from '../../lib/utils'

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm leading-6',
        variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-900'
          : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]',
        className,
      )}
      role="alert"
      {...props}
    />
  ),
)
Alert.displayName = 'Alert'

export { Alert }
