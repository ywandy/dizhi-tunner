import type {
  DiziKey,
  DiziTarget,
  FingeringProfileId,
  JianpuLabel,
} from '../core/dizi'
import type { Mode } from '../core/tuning'
import { DiziSelector } from './DiziSelector'
import { FingeringSelector } from './FingeringSelector'
import { TargetSelector } from './TargetSelector'

type SettingsPanelProps = {
  diziKey: DiziKey
  fingeringProfileId: FingeringProfileId
  mode: Mode
  targetLabel: JianpuLabel
  targets: DiziTarget[]
  onDiziKeyChange: (value: DiziKey) => void
  onFingeringProfileChange: (value: FingeringProfileId) => void
  onTargetLabelChange: (value: JianpuLabel) => void
}

export function SettingsPanel({
  diziKey,
  fingeringProfileId,
  mode,
  onDiziKeyChange,
  onFingeringProfileChange,
  onTargetLabelChange,
  targetLabel,
  targets,
}: SettingsPanelProps) {
  return (
    <section className="flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          设置
        </p>
        <h1 className="text-xl font-black tracking-normal text-[var(--foreground)]">
          调音设置
        </h1>
        <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
          支持筒音作 5 / 2 / 1，A4 = 440Hz。
        </p>
      </header>

      <div className="grid gap-5">
        <DiziSelector onChange={onDiziKeyChange} value={diziKey} />
        <FingeringSelector
          onChange={onFingeringProfileChange}
          value={fingeringProfileId}
        />
        {mode === 'target' ? (
          <TargetSelector
            onChange={onTargetLabelChange}
            targets={targets}
            value={targetLabel}
          />
        ) : null}
      </div>
    </section>
  )
}
