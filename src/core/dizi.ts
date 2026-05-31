export type DiziKey = 'C' | 'D' | 'E' | 'F' | 'G'
export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const diziKeyOptions: Array<{ value: DiziKey; label: string }> = [
  { value: 'C', label: 'C 调笛' },
  { value: 'D', label: 'D 调笛' },
  { value: 'E', label: 'E 调笛' },
  { value: 'F', label: 'F 调笛' },
  { value: 'G', label: 'G 调笛' },
]

export const noteToSemitone = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
} as const

export type NoteName = keyof typeof noteToSemitone

const majorScale: Record<Degree, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
}

export const jianpuRange = [
  { label: '低音5', degree: 5, octaveShift: -1 },
  { label: '低音6', degree: 6, octaveShift: -1 },
  { label: '低音7', degree: 7, octaveShift: -1 },
  { label: '1', degree: 1, octaveShift: 0 },
  { label: '2', degree: 2, octaveShift: 0 },
  { label: '3', degree: 3, octaveShift: 0 },
  { label: '4', degree: 4, octaveShift: 0 },
  { label: '5', degree: 5, octaveShift: 0 },
  { label: '6', degree: 6, octaveShift: 0 },
  { label: '7', degree: 7, octaveShift: 0 },
  { label: '高音1', degree: 1, octaveShift: 1 },
  { label: '高音2', degree: 2, octaveShift: 1 },
  { label: '高音3', degree: 3, octaveShift: 1 },
  { label: '高音4', degree: 4, octaveShift: 1 },
  { label: '高音5', degree: 5, octaveShift: 1 },
] as const satisfies ReadonlyArray<{
  label: string
  degree: Degree
  octaveShift: number
}>

export type JianpuLabel = (typeof jianpuRange)[number]['label']

export type DiziTarget = {
  label: JianpuLabel
  midi: number
  frequency: number
}

export function midiToFreq(midi: number, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12)
}

export function noteToMidi(note: NoteName, octave: number) {
  return (octave + 1) * 12 + noteToSemitone[note]
}

export function buildDiziTargets(key: DiziKey): DiziTarget[] {
  const baseOctave = 4
  const tonicMidi = noteToMidi(key, baseOctave)

  return jianpuRange.map((item) => ({
    label: item.label,
    midi: tonicMidi + majorScale[item.degree] + item.octaveShift * 12,
    frequency: midiToFreq(
      tonicMidi + majorScale[item.degree] + item.octaveShift * 12,
    ),
  }))
}
