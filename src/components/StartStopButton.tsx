import { LoaderCircle, Mic, Square } from 'lucide-react'

import { Button } from './ui/button'

type StartStopButtonProps = {
  isRunning: boolean
  isStarting: boolean
  onStart: () => void
  onStop: () => void
}

export function StartStopButton({
  isRunning,
  isStarting,
  onStart,
  onStop,
}: StartStopButtonProps) {
  if (isRunning) {
    return (
      <Button
        className="w-full"
        onClick={onStop}
        size="lg"
        type="button"
        variant="secondary"
      >
        <Square className="h-4 w-4 fill-current" />
        停止检测
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      disabled={isStarting}
      onClick={onStart}
      size="lg"
      type="button"
    >
      {isStarting ? (
        <LoaderCircle className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      {isStarting ? '正在请求麦克风' : '开始检测'}
    </Button>
  )
}
