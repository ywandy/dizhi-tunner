import {
  buildDiziTargets,
  getFingeringProfileLabel,
  noteToMidi,
  type Degree,
  type DiziKey,
  type FingeringProfileId,
} from '../dizi'
import type { HoleNoteItem, HoleScore, HoleScoreItem } from './scoreTypes'
import { buildDiziToneVisual } from './toneVisual'

type Accidental = 'sharp' | 'flat'

export type JianpuToken =
  | {
      type: 'note'
      raw: string
      degree: Degree
      octaveShift: -1 | 0 | 1
      accidental?: Accidental
    }
  | { type: 'rest'; raw: '0' }
  | { type: 'hold'; raw: '-' }
  | { type: 'bar'; raw: '|' }
  | { type: 'lineBreak'; raw: '\n' }
  | { type: 'invalid'; raw: string; message: string }

type ConvertJianpuToHoleScoreInput = {
  text: string
  scoreKey: DiziKey
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}

const majorScale: Record<Degree, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
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

function invalidToken(raw: string): JianpuToken {
  return {
    type: 'invalid',
    raw,
    message: `“${raw}” 暂时识别不了，可以输入 1-7、0、-、|`,
  }
}

function parseToken(raw: string): JianpuToken {
  if (raw === '0') return { type: 'rest', raw }
  if (raw === '-') return { type: 'hold', raw }
  if (raw === '|') return { type: 'bar', raw }

  const match = raw.match(/^(#|b)?(\.)?([1-7])(')?$/)
  if (!match) return invalidToken(raw)

  const degree = Number(match[3]) as Degree
  const octaveShift = match[2] ? -1 : match[4] ? 1 : 0
  const accidental =
    match[1] === '#' ? 'sharp' : match[1] === 'b' ? 'flat' : undefined

  return {
    type: 'note',
    raw,
    degree,
    octaveShift,
    ...(accidental ? { accidental } : {}),
  }
}

export function parseJianpuTokens(text: string): JianpuToken[] {
  const tokens: JianpuToken[] = []
  const lines = text.split(/(\n)/)

  for (const line of lines) {
    if (line === '\n') {
      tokens.push({ type: 'lineBreak', raw: '\n' })
      continue
    }

    for (const raw of line.trim().split(/\s+/)) {
      if (raw) tokens.push(parseToken(raw))
    }
  }

  return tokens
}

function accidentalOffset(accidental?: Accidental) {
  if (accidental === 'sharp') return 1
  if (accidental === 'flat') return -1
  return 0
}

function tokenToMidi(token: Extract<JianpuToken, { type: 'note' }>, key: DiziKey) {
  return (
    noteToMidi(key, 5) +
    majorScale[token.degree] +
    accidentalOffset(token.accidental) +
    token.octaveShift * 12
  )
}

function midiToPitch(midi: number) {
  const pitch = pitchNames[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${pitch}${octave}`
}

function createErrorNote(raw: string, message: string, midi?: number): HoleNoteItem {
  return {
    type: 'note',
    raw,
    displayName: raw,
    ...(midi === undefined ? {} : { midi, pitch: midiToPitch(midi) }),
    fingering: {
      label: '',
      holes: [],
    },
    errors: [message],
  }
}

export function convertJianpuToHoleScore({
  fingeringProfileId,
  fluteKey,
  scoreKey,
  text,
}: ConvertJianpuToHoleScoreInput): HoleScore {
  const targets = buildDiziTargets({ diziKey: fluteKey, fingeringProfileId })
  const errors: string[] = []
  const items: HoleScoreItem[] = parseJianpuTokens(text).map((token) => {
    if (token.type === 'rest') return token
    if (token.type === 'hold') return token
    if (token.type === 'bar') return token
    if (token.type === 'lineBreak') return { type: 'lineBreak' }

    if (token.type === 'invalid') {
      errors.push(token.message)
      return createErrorNote(token.raw, token.message)
    }

    const midi = tokenToMidi(token, scoreKey)
    const target = targets.find((item) => item.midi === midi)

    if (!target) {
      const message = `该音 ${midiToPitch(midi)} 超出 ${fluteKey} 调笛 · ${getFingeringProfileLabel(
        fingeringProfileId,
      )} 常用音域`
      errors.push(message)
      return createErrorNote(token.raw, message, midi)
    }

    const visual = buildDiziToneVisual(target, fingeringProfileId)

    return {
      type: 'note',
      raw: token.raw,
      displayName: target.label,
      pitch: midiToPitch(midi),
      midi,
      targetLabel: target.label,
      fingering: {
        label: visual.label,
        holes: visual.holes,
        ...(visual.remark ? { remark: visual.remark } : {}),
      },
    }
  })

  return {
    items,
    errors,
  }
}
