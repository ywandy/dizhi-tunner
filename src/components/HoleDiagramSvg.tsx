import type { HoleState } from '../core/score/scoreTypes'

type HoleDiagramSvgProps = {
  holes: HoleState[]
  label: string
  className?: string
}

function getFill(hole: HoleState) {
  if (hole === 'closed') return 'var(--foreground)'
  if (hole === 'half') return 'var(--meter-amber)'
  return 'var(--surface)'
}

export function HoleDiagramSvg({ className, holes, label }: HoleDiagramSvgProps) {
  return (
    <svg
      aria-label={`洞洞图 ${label}`}
      className={className}
      role="img"
      viewBox="0 0 172 34"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill="var(--surface-muted)"
        height="30"
        rx="15"
        width="168"
        x="2"
        y="2"
      />
      {holes.map((hole, index) => (
        <circle
          cx={22 + index * 26}
          cy="17"
          data-testid="hole-diagram-dot"
          fill={getFill(hole)}
          key={`${hole}-${index}`}
          r="9"
          stroke="var(--foreground)"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

