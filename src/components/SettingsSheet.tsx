import { SlidersHorizontal } from 'lucide-react'

import type { DiziKey, DiziTarget, JianpuLabel } from '../core/dizi'
import type { Mode } from '../core/tuning'
import { DiziSelector } from './DiziSelector'
import { ModeSwitch } from './ModeSwitch'
import { TargetSelector } from './TargetSelector'
import { Button } from './ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

type SettingsSheetProps = {
  diziKey: DiziKey
  mode: Mode
  targetLabel: JianpuLabel
  targets: DiziTarget[]
  onDiziKeyChange: (value: DiziKey) => void
  onModeChange: (value: Mode) => void
  onTargetLabelChange: (value: JianpuLabel) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsSheet({
  diziKey,
  mode,
  onDiziKeyChange,
  onModeChange,
  onOpenChange,
  onTargetLabelChange,
  open,
  targetLabel,
  targets,
}: SettingsSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="打开调音设置"
          size="icon"
          type="button"
          variant="outline"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>调音设置</SheetTitle>
          <SheetDescription>
            第一版固定为筒音作 5，A4 = 440Hz。
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5">
          <DiziSelector onChange={onDiziKeyChange} value={diziKey} />
          <ModeSwitch onChange={onModeChange} value={mode} />
          {mode === 'target' ? (
            <TargetSelector
              onChange={onTargetLabelChange}
              targets={targets}
              value={targetLabel}
            />
          ) : null}
          <SheetClose asChild>
            <Button className="mt-1 w-full" size="lg" type="button">
              完成
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
