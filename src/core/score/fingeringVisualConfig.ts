import type { FingeringProfileId, JianpuLabel } from '../dizi'
import type { HoleState } from './scoreTypes'

type SixHoleVisual = readonly [
  HoleState,
  HoleState,
  HoleState,
  HoleState,
  HoleState,
  HoleState,
]

export type FingeringVisualConfigEntry = {
  holes: SixHoleVisual
  remark?: string
}

export type FingeringVisualConfig = Record<
  FingeringProfileId,
  Partial<Record<JianpuLabel, FingeringVisualConfigEntry>>
>

export const fingeringVisualConfig: FingeringVisualConfig = {
  tube_as_5: {
    低音5: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'closed'],
    },
    低音6: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
    },
    低音7: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'open'],
    },
    1: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
    },
    2: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
    },
    3: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
    },
    4: {
      holes: ['open', 'closed', 'closed', 'open', 'open', 'open'],
    },
    5: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'closed'],
    },
    6: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
    },
    7: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'open'],
    },
    高音1: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音2: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音3: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音4: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'open'],
      remark: '高八度',
    },
    高音5: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'closed'],
      remark: '高八度',
    },
    高音6: {
      holes: ['closed', 'closed', 'open', 'closed', 'closed', 'open'],
      remark: '高八度',
    },
  },
  tube_as_2: {
    低音2: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'closed'],
    },
    低音3: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
    },
    低音4: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'closed'],
    },
    低音5: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
    },
    低音6: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
    },
    低音7: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
    },
    1: {
      holes: ['open', 'closed', 'closed', 'open', 'open', 'open'],
    },
    2: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'closed'],
    },
    3: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
    },
    4: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'closed'],
    },
    5: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
    },
    6: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
    },
    7: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
    },
    高音1: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'open'],
      remark: '高八度',
    },
    高音2: {
      holes: ['open', 'closed', 'closed', 'closed', 'closed', 'closed'],
      remark: '高八度',
    },
    高音3: {
      holes: ['closed', 'closed', 'open', 'closed', 'closed', 'open'],
      remark: '高八度',
    },
  },
  tube_as_1: {
    1: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'closed'],
    },
    2: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
    },
    3: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'open'],
    },
    4: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
    },
    5: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
    },
    6: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
    },
    7: {
      holes: ['open', 'open', 'open', 'open', 'open', 'open'],
    },
    高音1: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'closed'],
      remark: '高八度',
    },
    高音2: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
      remark: '高八度',
    },
    高音3: {
      holes: ['closed', 'closed', 'closed', 'closed', 'open', 'open'],
      remark: '高八度',
    },
    高音4: {
      holes: ['closed', 'closed', 'closed', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音5: {
      holes: ['closed', 'closed', 'open', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音6: {
      holes: ['closed', 'open', 'open', 'open', 'open', 'open'],
      remark: '高八度',
    },
    高音7: {
      holes: ['open', 'open', 'open', 'open', 'open', 'open'],
      remark: '高八度',
    },
    倍高音1: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'closed'],
      remark: '倍高八度',
    },
    倍高音2: {
      holes: ['closed', 'closed', 'closed', 'closed', 'closed', 'open'],
      remark: '倍高八度',
    },
  },
}
