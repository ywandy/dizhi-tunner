import { Fragment, type ChangeEvent, useMemo, useState } from 'react'

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  FileInput,
  Plus,
  Trash2,
} from 'lucide-react'

import { DiziSelector } from '../components/DiziSelector'
import { FingeringSelector } from '../components/FingeringSelector'
import { HoleDiagramSvg } from '../components/HoleDiagramSvg'
import { Button } from '../components/ui/button'
import { Alert } from '../components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  buildDiziTargets,
  diziKeyOptions,
  type DiziKey,
  type DiziTarget,
  fingeringProfileOptions,
  type FingeringProfileId,
  getFingeringProfileLabel,
} from '../core/dizi'
import { convertJianpuToHoleScore } from '../core/score/jianpuConverter'
import {
  importScoreJsonText,
  serializeScoreJson,
} from '../core/score/scoreJson'
import { buildDiziToneVisual } from '../core/score/toneVisual'
import {
  createJianpuGeneratedScore,
  createManualHoleScore,
  deleteScore,
  listScores,
  saveScore,
} from '../core/score/scoreStorage'
import type { HoleNoteItem, HoleScoreItem, SavedScore } from '../core/score/scoreTypes'

type HoleScoreHomeProps = {
  onCreate: () => void
  onOpen: (score: SavedScore) => void
  onRefresh: () => void
}

export type ManualHoleScoreDraft = {
  title: string
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}

type NewHoleScorePageProps = {
  defaultFluteKey: DiziKey
  defaultFingeringProfileId: FingeringProfileId
  onBack: () => void
  onCreateJianpu: () => void
  onCreateManual: (draft: ManualHoleScoreDraft) => void
}

type JianpuHoleScoreEditorProps = {
  defaultFluteKey: DiziKey
  defaultFingeringProfileId: FingeringProfileId
  initialScore: SavedScore | null
  onBack: () => void
  onSaved: (score: SavedScore) => void
}

type ManualHoleScoreEditorProps = {
  defaultFluteKey: DiziKey
  defaultFingeringProfileId: FingeringProfileId
  draftConfig: ManualHoleScoreDraft | null
  initialScore: SavedScore | null
  onBack: () => void
  onSaved: (score: SavedScore) => void
}

function scoreModeLabel(score: SavedScore) {
  return score.mode === 'jianpu-generated' ? '从数字谱编排' : '手动洞洞谱'
}

function scoreConfigLabel(score: SavedScore) {
  const fluteKey = 'fluteKey' in score.config ? score.config.fluteKey : 'D'
  const fingeringProfileId =
    'fingeringProfileId' in score.config
      ? score.config.fingeringProfileId
      : 'tube_as_5'
  const scoreKey =
    score.mode === 'jianpu-generated' && 'scoreKey' in score.config
      ? `${score.config.scoreKey} 调谱 / `
      : ''

  return `${scoreKey}${fluteKey} 调笛 / ${getFingeringProfileLabel(fingeringProfileId)}`
}

function firstNoteItem(items: HoleScoreItem[]) {
  return items.find((item): item is HoleNoteItem => item.type === 'note')
}

const pitchNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

function midiToPitch(midi: number) {
  const pitch = pitchNames[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${pitch}${octave}`
}

function createManualNoteItem(
  target: DiziTarget,
  fingeringProfileId: FingeringProfileId,
): HoleNoteItem {
  const visual = buildDiziToneVisual(target, fingeringProfileId)

  return {
    type: 'note',
    raw: target.label,
    displayName: target.label,
    pitch: midiToPitch(target.midi),
    midi: target.midi,
    targetLabel: target.label,
    fingering: {
      label: visual.label,
      holes: visual.holes,
      ...(visual.remark ? { remark: visual.remark } : {}),
    },
  }
}

function holeScoreItemLabel(item: HoleScoreItem) {
  if (item.type === 'note') return item.displayName ?? item.raw ?? '音符'
  if (item.type === 'rest') return '休止'
  if (item.type === 'hold') return '延音'
  if (item.type === 'bar') return '小节线'
  return '换行'
}

function holeScoreItemAriaLabel(item: HoleScoreItem, index: number) {
  const pitch = item.type === 'note' && item.pitch ? ` ${item.pitch}` : ''
  return `曲谱项 第 ${index + 1} 项 ${holeScoreItemLabel(item)}${pitch}`
}

function compactTargetLabel(label: string) {
  return label
    .replace('倍高音', '倍')
    .replace('高音', '高')
    .replace('低音', '低')
}

const keyboardDegrees = ['1', '2', '3', '4', '5', '6', '7'] as const

function clampCursorIndex(index: number, itemCount: number) {
  return Math.max(0, Math.min(index, itemCount))
}

function getDownloadFileName(score: SavedScore) {
  const safeTitle = (score.title.trim() || '洞洞谱').replace(/[\\/:*?"<>|]/g, '_')
  return `${safeTitle}.json`
}

function downloadScoreJson(score: SavedScore) {
  const blob = new Blob([serializeScoreJson(score)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = getDownloadFileName(score)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function HoleScoreHome({ onCreate, onOpen, onRefresh }: HoleScoreHomeProps) {
  const scores = listScores()
  const [message, setMessage] = useState<{
    variant: 'success' | 'destructive'
    text: string
  } | null>(null)

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) return

    try {
      const imported = importScoreJsonText(await file.text())
      setMessage({
        variant: 'success',
        text: `已导入《${imported.title}》`,
      })
      onRefresh()
    } catch (error) {
      setMessage({
        variant: 'destructive',
        text:
          error instanceof Error
            ? error.message
            : '导入失败，请检查 JSON 文件内容',
      })
    } finally {
      input.value = ''
    }
  }

  return (
    <section className="flex min-h-full flex-col gap-5">
      <header className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            本地乐谱
          </p>
          <h1 className="text-xl font-black tracking-normal text-[var(--foreground)]">
            洞洞谱
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onCreate} type="button">
            <Plus aria-hidden className="h-4 w-4" />
            新建
          </Button>
          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--foreground)] transition-[background,box-shadow,color,transform] duration-200 active:scale-[0.98]">
            <FileInput aria-hidden className="h-4 w-4" />
            导入 JSON
            <input
              accept="application/json,.json"
              aria-label="导入洞洞谱 JSON 文件"
              className="sr-only"
              onChange={handleImportFile}
              type="file"
            />
          </label>
        </div>
      </header>
      {message ? (
        <Alert variant={message.variant === 'destructive' ? 'destructive' : 'default'}>
          {message.text}
        </Alert>
      ) : null}

      {scores.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-5 py-10 text-center">
          <h2 className="text-lg font-black text-[var(--foreground)]">
            还没有保存的洞洞谱
          </h2>
          <p className="mt-2 max-w-64 text-sm leading-6 text-[var(--muted-foreground)]">
            可以从数字谱生成，也可以手动编排一份洞洞谱
          </p>
          <Button className="mt-5" onClick={onCreate} type="button">
            新建洞洞谱
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {scores.map((score) => {
            const note = firstNoteItem(score.holeScore.items)

            return (
              <article
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-subtle"
                key={score.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-[var(--foreground)]">
                      {score.title || '未命名乐谱'}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                      {scoreModeLabel(score)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {scoreConfigLabel(score)}
                    </p>
                  </div>
                  {note ? (
                    <HoleDiagramSvg
                      className="h-9 w-32 shrink-0"
                      holes={note.fingering.holes}
                      label={note.fingering.label}
                    />
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
                  <Button
                    aria-label={`打开 ${score.title || '未命名乐谱'}`}
                    onClick={() => onOpen(score)}
                    type="button"
                    variant="secondary"
                  >
                    打开
                  </Button>
                  <Button
                    aria-label={`导出 ${score.title || '未命名乐谱'} JSON`}
                    onClick={() => downloadScoreJson(score)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Download aria-hidden className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label={`删除 ${score.title || '未命名乐谱'}`}
                    onClick={() => {
                      if (window.confirm(`确认删除《${score.title || '未命名乐谱'}》？`)) {
                        deleteScore(score.id)
                        onRefresh()
                      }
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function NewHoleScorePage({
  defaultFingeringProfileId,
  defaultFluteKey,
  onBack,
  onCreateJianpu,
  onCreateManual,
}: NewHoleScorePageProps) {
  const [manualTitle, setManualTitle] = useState('')
  const [manualFluteKey, setManualFluteKey] =
    useState<DiziKey>(defaultFluteKey)
  const [manualFingeringProfileId, setManualFingeringProfileId] =
    useState<FingeringProfileId>(defaultFingeringProfileId)

  return (
    <section className="flex min-h-full flex-col gap-5">
      <Button className="self-start" onClick={onBack} type="button" variant="ghost">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        返回
      </Button>
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          新建
        </p>
        <h1 className="text-xl font-black tracking-normal text-[var(--foreground)]">
          新建洞洞谱
        </h1>
      </header>
      <section className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-subtle">
        <div>
          <h2 className="text-sm font-black text-[var(--foreground)]">
            编排设置
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            先配置名称、调性和指法，再进入编排页面
          </p>
        </div>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
          乐谱名称
          <input
            className="h-12 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-base font-semibold normal-case tracking-normal text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
            onChange={(event) => setManualTitle(event.target.value)}
            value={manualTitle}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={manualFluteKey}
            onValueChange={(nextFluteKey) =>
              setManualFluteKey(nextFluteKey as DiziKey)
            }
          >
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
          <Select
            value={manualFingeringProfileId}
            onValueChange={(nextFingeringProfileId) =>
              setManualFingeringProfileId(
                nextFingeringProfileId as FingeringProfileId,
              )
            }
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
      </section>
      <div className="grid gap-3">
        <button
          aria-label="从数字谱编排"
          className="min-h-28 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-subtle transition-[background,transform] active:scale-[0.99]"
          onClick={onCreateJianpu}
          type="button"
        >
          <span className="text-base font-black text-[var(--foreground)]">
            从数字谱编排
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--muted-foreground)]">
            输入 1 2 3 5 6 5，自动生成洞洞谱
          </span>
        </button>
        <button
          aria-label="编排洞洞谱"
          className="min-h-28 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-subtle transition-[background,transform] active:scale-[0.99]"
          onClick={() =>
            onCreateManual({
              title: manualTitle,
              fluteKey: manualFluteKey,
              fingeringProfileId: manualFingeringProfileId,
            })
          }
          type="button"
        >
          <span className="text-base font-black text-[var(--foreground)]">
            编排洞洞谱
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--muted-foreground)]">
            直接选择洞洞指法，自由制作洞洞谱
          </span>
        </button>
      </div>
    </section>
  )
}

export function JianpuHoleScoreEditor({
  defaultFingeringProfileId,
  defaultFluteKey,
  initialScore,
  onBack,
  onSaved,
}: JianpuHoleScoreEditorProps) {
  const initialConfig =
    initialScore?.mode === 'jianpu-generated' &&
    'scoreKey' in initialScore.config
      ? initialScore.config
      : null
  const initialSource =
    initialScore?.mode === 'jianpu-generated' &&
    initialScore.source.kind === 'jianpu'
      ? initialScore.source
      : null
  const [title, setTitle] = useState(initialScore?.title ?? '')
  const [scoreKey, setScoreKey] = useState<DiziKey>(
    initialConfig?.scoreKey ?? 'D',
  )
  const [fluteKey, setFluteKey] = useState<DiziKey>(
    initialConfig?.fluteKey ?? defaultFluteKey,
  )
  const [fingeringProfileId, setFingeringProfileId] =
    useState<FingeringProfileId>(
      initialConfig?.fingeringProfileId ?? defaultFingeringProfileId,
    )
  const [text, setText] = useState(initialSource?.text ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const holeScore = useMemo(
    () =>
      convertJianpuToHoleScore({
        text,
        scoreKey,
        fluteKey,
        fingeringProfileId,
      }),
    [fingeringProfileId, fluteKey, scoreKey, text],
  )

  const markDirty = () => {
    setMessage(null)
    setIsDirty(true)
  }

  const handleBack = () => {
    if (isDirty && !window.confirm('有未保存的修改，确认返回？')) return
    onBack()
  }

  const handleSave = () => {
    const baseScore =
      initialScore?.mode === 'jianpu-generated'
        ? {
            ...initialScore,
            title,
            config: {
              scoreKey,
              fluteKey,
              fingeringProfileId,
            },
            source: {
              kind: 'jianpu' as const,
              text,
            },
            holeScore,
          }
        : createJianpuGeneratedScore({
            title,
            scoreKey,
            fluteKey,
            fingeringProfileId,
            text,
            holeScore,
          })
    const saved = saveScore(baseScore)
    setMessage(initialScore ? '已更新' : '已保存')
    setIsDirty(false)
    onSaved(saved)
  }

  return (
    <section className="flex min-h-full flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Button onClick={handleBack} type="button" variant="ghost">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          返回
        </Button>
        <Button onClick={handleSave} type="button">
          保存
        </Button>
      </div>
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          洞洞谱
        </p>
        <h1 className="text-xl font-black tracking-normal text-[var(--foreground)]">
          从数字谱编排
        </h1>
      </header>
      {message ? <Alert>{message}</Alert> : null}
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        乐谱名称
        <input
          className="h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-base font-semibold normal-case tracking-normal text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(event) => {
            setTitle(event.target.value)
            markDirty()
          }}
          value={title}
        />
      </label>
      <div className="grid gap-4">
        <DiziSelector
          onChange={(nextScoreKey) => {
            setScoreKey(nextScoreKey)
            markDirty()
          }}
          value={scoreKey}
        />
        <DiziSelector
          onChange={(nextFluteKey) => {
            setFluteKey(nextFluteKey)
            markDirty()
          }}
          value={fluteKey}
        />
        <FingeringSelector
          onChange={(nextFingeringProfileId) => {
            setFingeringProfileId(nextFingeringProfileId)
            markDirty()
          }}
          value={fingeringProfileId}
        />
      </div>
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        数字谱输入
        <textarea
          className="min-h-32 resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-base font-semibold normal-case tracking-normal text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(event) => {
            setText(event.target.value)
            markDirty()
          }}
          value={text}
        />
      </label>
      <div className="grid gap-3">
        <h2 className="text-sm font-black text-[var(--foreground)]">转换结果</h2>
        <div className="grid gap-2">
          {holeScore.items.length === 0 ? (
            <p className="rounded-2xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              输入数字谱后会实时生成洞洞谱
            </p>
          ) : (
            holeScore.items.map((item, index) => {
              if (item.type === 'lineBreak') {
                return <div className="h-1" key={`line-${index}`} />
              }
              if (item.type !== 'note') {
                return (
                  <div
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold"
                    key={`${item.type}-${index}`}
                  >
                    {item.raw}
                  </div>
                )
              }

              return (
                <article
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-subtle"
                  key={`${item.raw}-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-[var(--foreground)]">
                        {item.displayName}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {item.pitch}
                      </p>
                    </div>
                    {item.fingering.holes.length > 0 ? (
                      <HoleDiagramSvg
                        className="h-9 w-32"
                        holes={item.fingering.holes}
                        label={item.fingering.label}
                      />
                    ) : null}
                  </div>
                  {item.errors?.map((error) => (
                    <p className="mt-2 text-sm text-[var(--destructive)]" key={error}>
                      {error}
                    </p>
                  ))}
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export function ManualHoleScoreEditor({
  draftConfig,
  defaultFingeringProfileId,
  defaultFluteKey,
  initialScore,
  onBack,
  onSaved,
}: ManualHoleScoreEditorProps) {
  const initialConfig =
    initialScore?.mode === 'manual-hole-score' ? initialScore.config : null
  const initialItems =
    initialScore?.mode === 'manual-hole-score' ? initialScore.holeScore.items : []
  const title = initialScore?.title ?? draftConfig?.title ?? ''
  const fluteKey =
    initialConfig?.fluteKey ?? draftConfig?.fluteKey ?? defaultFluteKey
  const fingeringProfileId =
    initialConfig?.fingeringProfileId ??
    draftConfig?.fingeringProfileId ??
    defaultFingeringProfileId
  const [items, setItems] = useState<HoleScoreItem[]>(
    initialItems,
  )
  const [cursorIndex, setCursorIndex] = useState(initialItems.length)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    initialItems.length > 0 ? 0 : null,
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const targets = useMemo(
    () => buildDiziTargets({ diziKey: fluteKey, fingeringProfileId }),
    [fingeringProfileId, fluteKey],
  )
  const targetByLabel = useMemo(
    () => new Map<string, DiziTarget>(targets.map((target) => [target.label, target])),
    [targets],
  )
  const targetRows = useMemo(
    () => ({
      low: keyboardDegrees.map((degree) => `低音${degree}`),
      middle: [...keyboardDegrees],
      high: keyboardDegrees.map((degree) => `高音${degree}`),
    }),
    [],
  )

  const markDirty = () => {
    setMessage(null)
    setIsDirty(true)
  }

  const handleBack = () => {
    if (isDirty && !window.confirm('有未保存的修改，确认返回？')) return
    onBack()
  }

  const insertItemAtCursor = (item: HoleScoreItem) => {
    const insertIndex = clampCursorIndex(cursorIndex, items.length)
    setItems([
      ...items.slice(0, insertIndex),
      item,
      ...items.slice(insertIndex),
    ])
    setSelectedIndex(insertIndex)
    setCursorIndex(insertIndex + 1)
    markDirty()
  }

  const selectScoreItem = (index: number) => {
    setSelectedIndex(index)
    setCursorIndex(index + 1)
  }

  const moveCursor = (direction: -1 | 1) => {
    setCursorIndex((current) => clampCursorIndex(current + direction, items.length))
    setSelectedIndex(null)
  }

  const deleteSelectedItem = () => {
    if (selectedIndex === null) return
    const selectedItem = items[selectedIndex]
    if (!selectedItem) return
    if (
      selectedItem.type !== 'note' &&
      !window.confirm(`确认删除第 ${selectedIndex + 1} 项？`)
    ) {
      return
    }

    const nextItems = items.filter((_, itemIndex) => itemIndex !== selectedIndex)
    const nextCursorIndex = clampCursorIndex(selectedIndex, nextItems.length)

    setItems(nextItems)
    setCursorIndex(nextCursorIndex)
    setSelectedIndex(
      nextItems.length === 0
        ? null
        : Math.min(selectedIndex, nextItems.length - 1),
    )
    markDirty()
  }

  const clearItems = () => {
    if (items.length === 0) return
    if (!window.confirm('确认清空当前编排？')) return
    setItems([])
    setCursorIndex(0)
    setSelectedIndex(null)
    markDirty()
  }

  const handleSave = () => {
    const score =
      initialScore?.mode === 'manual-hole-score'
        ? {
            ...initialScore,
            title,
            config: {
              fluteKey,
              fingeringProfileId,
            },
            holeScore: { items },
          }
        : createManualHoleScore({
            title,
            fluteKey,
            fingeringProfileId,
            items,
          })
    const saved = saveScore(score)
    setMessage(initialScore ? '已更新' : '已保存')
    setIsDirty(false)
    onSaved(saved)
  }

  const renderCursor = (key: string) => (
    <span
      aria-hidden="true"
      className="my-0.5 h-[5.75rem] w-1 shrink-0 self-stretch rounded-full bg-[var(--ring)] shadow-pointer"
      key={key}
    />
  )

  const renderScoreItem = (item: HoleScoreItem, index: number) => {
    const isSelected = selectedIndex === index
    const baseClassName = [
      'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border text-center shadow-subtle transition-[background,border-color,box-shadow,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      isSelected
        ? 'border-[var(--ring)] bg-[var(--status-good-bg)] shadow-soft'
        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]',
    ].join(' ')

    if (item.type === 'lineBreak') {
      return (
        <button
          aria-label={holeScoreItemAriaLabel(item, index)}
          aria-pressed={isSelected}
          className={`${baseClassName} min-h-8 basis-full px-2 py-1`}
          key={`${item.type}-${index}`}
          onClick={() => selectScoreItem(index)}
          type="button"
        >
          <span className="text-xs font-black text-[var(--muted-foreground)]">
            换行
          </span>
          <span className="mt-1 h-px w-full bg-[var(--border-strong)]" />
        </button>
      )
    }

    if (item.type !== 'note') {
      return (
        <button
          aria-label={holeScoreItemAriaLabel(item, index)}
          aria-pressed={isSelected}
          className={`${baseClassName} min-h-[5.75rem] w-12 px-1.5 py-2`}
          key={`${item.type}-${index}`}
          onClick={() => selectScoreItem(index)}
          type="button"
        >
          <span className="text-xl font-black leading-none text-[var(--foreground)]">
            {item.raw}
          </span>
          <span className="mt-1 text-[0.66rem] font-bold text-[var(--muted-foreground)]">
            {holeScoreItemLabel(item)}
          </span>
        </button>
      )
    }

    return (
      <button
        aria-label={holeScoreItemAriaLabel(item, index)}
        aria-pressed={isSelected}
        className={`${baseClassName} min-h-[5.75rem] w-16 justify-between px-1.5 py-1.5`}
        key={`${item.type}-${item.targetLabel ?? item.raw}-${index}`}
        onClick={() => selectScoreItem(index)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-sm font-black leading-4 text-[var(--foreground)]">
            {holeScoreItemLabel(item)}
          </span>
          {item.pitch ? (
            <span className="mt-0.5 block text-[0.66rem] font-bold text-[var(--muted-foreground)]">
              {item.pitch}
            </span>
          ) : null}
        </span>
        <HoleDiagramSvg
          className="h-6 w-full shrink-0"
          holes={item.fingering.holes}
          label={item.fingering.label}
        />
        <span className="h-2" aria-hidden="true" />
      </button>
    )
  }

  const renderTargetRow = (
    ariaLabel: string,
    rowLabels: string[],
  ) => (
    <div
      aria-label={ariaLabel}
      className="grid min-h-8 gap-1"
      role="group"
      style={{
        gridTemplateColumns: `repeat(${Math.max(rowLabels.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {rowLabels.map((label) => {
        const target = targetByLabel.get(label)

        return (
          <button
            aria-label={`插入 ${label}`}
            className="min-h-8 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-0.5 text-center shadow-subtle transition-[background,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            disabled={!target}
            key={label}
            onClick={
              target
                ? () =>
                    insertItemAtCursor(
                      createManualNoteItem(target, fingeringProfileId),
                    )
                : undefined
            }
            type="button"
          >
            <span className="block text-xs font-black leading-none text-[var(--foreground)]">
              {compactTargetLabel(label)}
            </span>
          </button>
        )
      })}
    </div>
  )

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <h1 className="sr-only">编排洞洞谱</h1>
      <div className="flex items-center justify-between gap-2">
        <Button onClick={handleBack} type="button" variant="ghost">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          返回
        </Button>
        <Button onClick={handleSave} type="button">
          保存
        </Button>
      </div>
      {message ? <Alert>{message}</Alert> : null}
      <section
        aria-label="洞洞谱曲谱"
        className="min-h-0 flex-1 overflow-hidden"
        role="region"
      >
        <div className="h-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-subtle">
        {items.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 text-center">
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              点底部键盘开始编排
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 flex-wrap items-stretch gap-x-1.5 gap-y-2">
            {items.map((item, index) => (
              <Fragment key={`${item.type}-${index}`}>
                {cursorIndex === index ? renderCursor(`cursor-${index}`) : null}
                {renderScoreItem(item, index)}
              </Fragment>
            ))}
            {cursorIndex === items.length ? renderCursor('cursor-end') : null}
          </div>
        )}
        </div>
      </section>
      <section
        aria-label="指法键盘"
        className="-mx-3 grid shrink-0 gap-1.5 border-t border-[var(--border)] bg-[var(--panel)] px-3 pb-1.5 pt-1.5 shadow-panel sm:-mx-4 sm:px-4"
        role="region"
      >
        {renderTargetRow('低音键盘', targetRows.low)}
        {renderTargetRow('中音键盘', targetRows.middle)}
        {renderTargetRow('高音键盘', targetRows.high)}
        <div
          aria-label="功能键盘"
          className="grid grid-cols-8 gap-1"
          role="group"
        >
          <Button
            aria-label="光标左移"
            disabled={cursorIndex === 0}
            className="h-8 min-w-0 rounded-lg px-0"
            onClick={() => moveCursor(-1)}
            type="button"
            variant="outline"
          >
            <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <Button
            aria-label="光标右移"
            disabled={cursorIndex === items.length}
            className="h-8 min-w-0 rounded-lg px-0"
            onClick={() => moveCursor(1)}
            type="button"
            variant="outline"
          >
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          </Button>
          <Button
            aria-label="删除选中项"
            disabled={selectedIndex === null}
            className="h-8 min-w-0 rounded-lg px-0"
            onClick={deleteSelectedItem}
            type="button"
            variant="outline"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only">删除</span>
          </Button>
          <Button
            aria-label="清空"
            className="h-8 min-w-0 rounded-lg px-0"
            onClick={clearItems}
            type="button"
            variant="ghost"
          >
            <Eraser aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only">清空</span>
          </Button>
          <Button
            aria-label="插入休止"
            className="h-8 min-w-0 rounded-lg px-0 text-sm"
            onClick={() => insertItemAtCursor({ type: 'rest', raw: '0' })}
            type="button"
            variant="outline"
          >
            0
          </Button>
          <Button
            aria-label="插入延音"
            className="h-8 min-w-0 rounded-lg px-0 text-sm"
            onClick={() => insertItemAtCursor({ type: 'hold', raw: '-' })}
            type="button"
            variant="outline"
          >
            -
          </Button>
          <Button
            aria-label="插入小节线"
            className="h-8 min-w-0 rounded-lg px-0 text-sm"
            onClick={() => insertItemAtCursor({ type: 'bar', raw: '|' })}
            type="button"
            variant="outline"
          >
            |
          </Button>
          <Button
            aria-label="换行"
            className="h-8 min-w-0 rounded-lg px-0 text-sm"
            onClick={() => insertItemAtCursor({ type: 'lineBreak' })}
            type="button"
            variant="outline"
          >
            ↵
          </Button>
        </div>
      </section>
    </section>
  )
}
