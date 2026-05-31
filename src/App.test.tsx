import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { startTuner } from './core/audio'
import { preferencesStorageKey } from './core/preferences'

vi.mock('./core/audio', () => ({
  startTuner: vi.fn(),
}))

const startTunerMock = vi.mocked(startTuner)

function getFrequencyValue(label: string) {
  const labelNode = screen.getByText(label)
  const valueNode = labelNode.nextElementSibling

  expect(valueNode).toBeInstanceOf(HTMLElement)
  return valueNode as HTMLElement
}

describe('App', () => {
  let pitchCallback: ((frequency: number) => void) | null
  let stopTuner: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    localStorage.clear()
    pitchCallback = null
    stopTuner = vi.fn()
    startTunerMock.mockImplementation(async (onPitch) => {
      pitchCallback = onPitch
      return { stop: stopTuner }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the focused tuner panel default state', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '笛子音准测试' })).toBeInTheDocument()
    expect(screen.getByText('D 调笛')).toBeInTheDocument()
    expect(screen.getByText('等待吹奏')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始检测' })).toBeInTheDocument()
  })

  it('shows target selector only in target practice mode', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '打开调音设置' }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).queryByText('目标音')).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('radio', { name: '指定音练习' }))

    expect(within(dialog).getByText('目标音')).toBeInTheDocument()
  })

  it('shows realtime frequency separately from the one-second average frequency', async () => {
    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '开始检测' }))
    })

    expect(pitchCallback).not.toBeNull()

    act(() => {
      vi.setSystemTime(0)
      pitchCallback?.(438)
      vi.setSystemTime(500)
      pitchCallback?.(442)
    })

    expect(getFrequencyValue('当前频率')).toHaveTextContent('442.0 Hz')
    expect(getFrequencyValue('平均频率')).toHaveTextContent('440.0 Hz')
    expect(getFrequencyValue('目标频率')).toHaveTextContent('440.0 Hz')
  })

  it('keeps showing selected target frequency before any pitch in target mode', () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({ diziKey: 'D', mode: 'target', targetLabel: '5' }),
    )

    render(<App />)

    expect(screen.getByText('目标 5')).toBeInTheDocument()
    expect(getFrequencyValue('当前频率')).toHaveTextContent('-- Hz')
    expect(getFrequencyValue('平均频率')).toHaveTextContent('-- Hz')
    expect(getFrequencyValue('目标频率')).toHaveTextContent('440.0 Hz')
  })

  it('clears only realtime readings after 600ms without new pitch and keeps stable history', async () => {
    render(<App />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '开始检测' }))
    })

    act(() => {
      pitchCallback?.(440)
    })
    expect(getFrequencyValue('当前频率')).toHaveTextContent('440.0 Hz')
    expect(getFrequencyValue('平均频率')).toHaveTextContent('440.0 Hz')

    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(getFrequencyValue('当前频率')).toHaveTextContent('-- Hz')
    expect(getFrequencyValue('平均频率')).toHaveTextContent('440.0 Hz')
    expect(screen.getByText('很准 · 0.0 cents')).toBeInTheDocument()
    expect(
      screen.queryByText('未检测到稳定音高，请靠近麦克风并持续吹奏。'),
    ).not.toBeInTheDocument()
  })

  it('restores the previously selected mode from localStorage', () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({ diziKey: 'G', mode: 'target', targetLabel: '高音1' }),
    )

    render(<App />)

    expect(screen.getByText('目标 高音1')).toBeInTheDocument()
    expect(screen.getByText('G 调笛')).toBeInTheDocument()
  })
})
