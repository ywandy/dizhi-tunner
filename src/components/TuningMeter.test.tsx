import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TuningMeter } from './TuningMeter'

function getPointer(container: HTMLElement) {
  const pointer = container.querySelector('[data-testid="tuning-meter-pointer"]')

  expect(pointer).toBeInstanceOf(HTMLElement)
  return pointer as HTMLElement
}

function advanceFrame() {
  act(() => {
    vi.advanceTimersByTime(16)
  })
}

describe('TuningMeter', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('defaults the pointer to 0 cents in the center', () => {
    const { container } = render(<TuningMeter cents={null} />)

    expect(getPointer(container)).toHaveStyle({ left: '50%' })
  })

  it('damps the pointer back to 0 cents instead of jumping instantly', () => {
    vi.useFakeTimers()

    const { container, rerender } = render(<TuningMeter cents={40} />)

    expect(getPointer(container)).toHaveStyle({ left: '90%' })

    rerender(<TuningMeter cents={null} />)

    expect(getPointer(container)).toHaveStyle({ left: '90%' })

    for (let index = 0; index < 60; index += 1) {
      advanceFrame()
    }

    expect(getPointer(container)).toHaveStyle({ left: '50%' })
  })

  it('jumps directly to the target when reduced motion is enabled', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { container, rerender } = render(<TuningMeter cents={40} />)

    rerender(<TuningMeter cents={null} />)

    expect(getPointer(container)).toHaveStyle({ left: '50%' })
  })
})
