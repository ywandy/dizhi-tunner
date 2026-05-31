export type DiziKey = 'C' | 'D' | 'E' | 'F' | 'G'
export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type FingeringProfileId = 'tube_as_5' | 'tube_as_2' | 'tube_as_1'

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

const tubeAs5Range = [
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
  { label: '高音6', degree: 6, octaveShift: 1 },
] as const satisfies RangeTemplate

const tubeAs2Range = [
  { label: '低音2', degree: 2, octaveShift: -1 },
  { label: '低音3', degree: 3, octaveShift: -1 },
  { label: '低音4', degree: 4, octaveShift: -1 },
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
] as const satisfies RangeTemplate

const tubeAs1Range = [
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
  { label: '高音6', degree: 6, octaveShift: 1 },
  { label: '高音7', degree: 7, octaveShift: 1 },
  { label: '倍高音1', degree: 1, octaveShift: 2 },
  { label: '倍高音2', degree: 2, octaveShift: 2 },
] as const satisfies ReadonlyArray<{
  label: string
  degree: Degree
  octaveShift: number
}>

type RangeTemplate = ReadonlyArray<{
  label: string
  degree: Degree
  octaveShift: number
}>

type RangeItem =
  | (typeof tubeAs5Range)[number]
  | (typeof tubeAs2Range)[number]
  | (typeof tubeAs1Range)[number]

export const jianpuRange = tubeAs5Range

export type JianpuLabel = RangeItem['label']

export const fingeringProfiles = {
  tube_as_5: {
    id: 'tube_as_5',
    label: '筒音作5',
    tubeAs: 5,
    rangeTemplate: tubeAs5Range,
  },
  tube_as_2: {
    id: 'tube_as_2',
    label: '筒音作2',
    tubeAs: 2,
    rangeTemplate: tubeAs2Range,
  },
  tube_as_1: {
    id: 'tube_as_1',
    label: '筒音作1',
    tubeAs: 1,
    rangeTemplate: tubeAs1Range,
  },
} as const satisfies Record<
  FingeringProfileId,
  {
    id: FingeringProfileId
    label: string
    tubeAs: Degree
    rangeTemplate: RangeTemplate
  }
>

export const fingeringProfileOptions = [
  { value: 'tube_as_5', label: '筒音作5' },
  { value: 'tube_as_2', label: '筒音作2' },
  { value: 'tube_as_1', label: '筒音作1' },
] as const satisfies ReadonlyArray<{
  value: FingeringProfileId
  label: string
}>

const allJianpuLabels = new Set(
  Object.values(fingeringProfiles).flatMap((profile) =>
    profile.rangeTemplate.map((item) => item.label),
  ),
)

export type DiziTarget = {
  label: JianpuLabel
  midi: number
  frequency: number
}

export type BuildDiziTargetsParams = {
  diziKey: DiziKey
  fingeringProfileId?: FingeringProfileId
  baseOctave?: number
  a4?: number
}

export function midiToFreq(midi: number, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12)
}

export function noteToMidi(note: NoteName, octave: number) {
  return (octave + 1) * 12 + noteToSemitone[note]
}

function getPhysicalTubeMidi(diziKey: DiziKey, baseOctave: number) {
  const tonicWhenTubeAs5 = noteToMidi(diziKey, baseOctave)
  return tonicWhenTubeAs5 + majorScale[5] - 12
}

function getMiddleTonicMidiByTubeAs(tubeMidi: number, tubeAs: Degree) {
  const interval = majorScale[tubeAs]
  let tonicMidi = tubeMidi - interval

  while (tonicMidi < tubeMidi) {
    tonicMidi += 12
  }

  return tonicMidi
}

function normalizeBuildParams(
  input: DiziKey | BuildDiziTargetsParams,
): Required<BuildDiziTargetsParams> {
  if (typeof input === 'string') {
    return {
      diziKey: input,
      fingeringProfileId: 'tube_as_5',
      baseOctave: 5,
      a4: 440,
    }
  }

  return {
    diziKey: input.diziKey,
    fingeringProfileId: input.fingeringProfileId ?? 'tube_as_5',
    baseOctave: input.baseOctave ?? 5,
    a4: input.a4 ?? 440,
  }
}

export function isFingeringProfileId(
  value: unknown,
): value is FingeringProfileId {
  return (
    typeof value === 'string' &&
    fingeringProfileOptions.some((option) => option.value === value)
  )
}

export function isJianpuLabel(value: unknown): value is JianpuLabel {
  return typeof value === 'string' && allJianpuLabels.has(value as JianpuLabel)
}

export function isTargetLabelForFingering(
  value: unknown,
  fingeringProfileId: FingeringProfileId,
): value is JianpuLabel {
  const profile = fingeringProfiles[fingeringProfileId]

  return (
    typeof value === 'string' &&
    profile.rangeTemplate.some((item) => item.label === value)
  )
}

export function getFingeringProfileLabel(id: FingeringProfileId) {
  return fingeringProfiles[id].label
}

export function buildDiziTargets(key: DiziKey): DiziTarget[]
export function buildDiziTargets(params: BuildDiziTargetsParams): DiziTarget[]
export function buildDiziTargets(
  input: DiziKey | BuildDiziTargetsParams,
): DiziTarget[] {
  const { a4, baseOctave, diziKey, fingeringProfileId } =
    normalizeBuildParams(input)
  const profile = fingeringProfiles[fingeringProfileId]
  const tubeMidi = getPhysicalTubeMidi(diziKey, baseOctave)
  const middleTonicMidi = getMiddleTonicMidiByTubeAs(
    tubeMidi,
    profile.tubeAs,
  )

  return profile.rangeTemplate.map((item) => {
    const midi = middleTonicMidi + majorScale[item.degree] + item.octaveShift * 12

    return {
      label: item.label,
      midi,
      frequency: midiToFreq(midi, a4),
    }
  })
}
