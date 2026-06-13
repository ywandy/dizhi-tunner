import { describe, expect, it } from 'vitest'

import { buildDiziTargets, fingeringProfileOptions } from '../dizi'
import { fingeringVisualConfig } from './fingeringVisualConfig'
import { buildDiziToneVisual, renderHoleLabel } from './toneVisual'

describe('dizi tone visual', () => {
  const targets = buildDiziTargets({ diziKey: 'D', fingeringProfileId: 'tube_as_5' })
  const tubeAs2Targets = buildDiziTargets({
    diziKey: 'D',
    fingeringProfileId: 'tube_as_2',
  })

  it('reads stable six-hole visuals from the fingering config table', () => {
    expect(renderHoleLabel(buildDiziToneVisual(targets[0], 'tube_as_5').holes)).toBe(
      '●●●●●●',
    )
    expect(
      renderHoleLabel(
        buildDiziToneVisual(
          targets.find((target) => target.label === '1') ?? targets[0],
          'tube_as_5',
        ).holes,
      ),
    ).toBe('●●●○○○')
    expect(buildDiziToneVisual(targets[0], 'tube_as_5').holes).toEqual(
      fingeringVisualConfig.tube_as_5['低音5']?.holes,
    )
  })

  it('matches the tube-as-5 fingering chart and uses the first option when alternatives exist', () => {
    const labelOf = (label: string) => {
      const target = targets.find((item) => item.label === label)
      expect(target).toBeDefined()

      return renderHoleLabel(buildDiziToneVisual(target ?? targets[0], 'tube_as_5').holes)
    }

    expect(labelOf('4')).toBe('○●●○○○')
    expect(labelOf('5')).toBe('○●●●●●')
    expect(labelOf('高音4')).toBe('○●●●●○')
    expect(labelOf('高音5')).toBe('○●●●●●')
    expect(labelOf('高音6')).toBe('●●○●●○')
  })

  it('matches the tube-as-2 fingering chart and uses the first option when alternatives exist', () => {
    const labelOf = (label: string) => {
      const target = tubeAs2Targets.find((item) => item.label === label)
      expect(target).toBeDefined()

      return renderHoleLabel(buildDiziToneVisual(target ?? tubeAs2Targets[0], 'tube_as_2').holes)
    }

    expect(labelOf('低音2')).toBe('●●●●●●')
    expect(labelOf('低音3')).toBe('●●●●●○')
    expect(labelOf('低音4')).toBe('●●●●○●')
    expect(labelOf('低音5')).toBe('●●●○○○')
    expect(labelOf('低音6')).toBe('●●○○○○')
    expect(labelOf('低音7')).toBe('●○○○○○')
    expect(labelOf('1')).toBe('○●●○○○')
    expect(labelOf('2')).toBe('○●●●●●')
    expect(labelOf('3')).toBe('●●●●●○')
    expect(labelOf('4')).toBe('●●●●○●')
    expect(labelOf('5')).toBe('●●●○○○')
    expect(labelOf('6')).toBe('●●○○○○')
    expect(labelOf('7')).toBe('●○○○○○')
    expect(labelOf('高音1')).toBe('○●●●●○')
    expect(labelOf('高音2')).toBe('○●●●●●')
    expect(labelOf('高音3')).toBe('●●○●●○')
  })

  it('defines configured visuals for every supported fingering target', () => {
    fingeringProfileOptions.forEach((option) => {
      const profileTargets = buildDiziTargets({
        diziKey: 'D',
        fingeringProfileId: option.value,
      })
      const missingLabels = profileTargets
        .filter((target) => !fingeringVisualConfig[option.value][target.label])
        .map((target) => target.label)

      expect(missingLabels).toEqual([])
    })
  })

  it('reads octave remarks from the fingering config table', () => {
    const middleOne = targets.find((target) => target.label === '1')
    const highOne = targets.find((target) => target.label === '高音1')

    expect(middleOne).toBeDefined()
    expect(highOne).toBeDefined()
    expect(buildDiziToneVisual(highOne ?? targets[0], 'tube_as_5')).toMatchObject({
      holes: buildDiziToneVisual(middleOne ?? targets[0], 'tube_as_5').holes,
      remark: '高八度',
    })
  })
})
