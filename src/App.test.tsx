import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { startTuner } from './core/audio'
import { preferencesStorageKey } from './core/preferences'
import {
  createJianpuGeneratedScore,
  saveScore,
} from './core/score/scoreStorage'
import { serializeScoreJson } from './core/score/scoreJson'

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
    window.history.replaceState(null, '', '/')
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
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders the focused tuner panel default state', () => {
    render(<App />)

    const modeTabs = screen.getByRole('radiogroup', { name: '检测模式' })
    expect(within(modeTabs).getByRole('radio', { name: '实时检测' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('heading', { name: '笛子音准测试' })).toBeInTheDocument()
    expect(screen.getByText('D 调笛 · 筒音作5')).toBeInTheDocument()
    expect(screen.getByText('等待吹奏')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始检测' })).toBeInTheDocument()
  })

  it('switches tuning mode from the immersive top tabs', () => {
    render(<App />)

    const modeTabs = screen.getByRole('radiogroup', { name: '检测模式' })
    fireEvent.click(within(modeTabs).getByRole('radio', { name: '指定音练习' }))

    expect(within(modeTabs).getByRole('radio', { name: '指定音练习' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('目标 5')).toBeInTheDocument()
  })

  it('uses web bottom navigation to switch between tuner and settings', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    expect(within(navigation).getByRole('button', { name: '测音' })).toHaveAttribute('aria-current', 'page')
    expect(within(navigation).getByRole('button', { name: '洞洞谱' })).toBeInTheDocument()

    fireEvent.click(within(navigation).getByRole('button', { name: '设置' }))

    expect(screen.getByRole('heading', { name: '调音设置' })).toBeInTheDocument()
    expect(within(navigation).getByRole('button', { name: '设置' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('button', { name: '开始检测' })).not.toBeInTheDocument()
  })

  it('creates, saves, and reopens a jianpu hole score from the library', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))

    expect(screen.getByRole('heading', { name: '洞洞谱' })).toBeInTheDocument()
    expect(screen.getByText('还没有保存的洞洞谱')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '新建洞洞谱' }))
    fireEvent.click(screen.getByRole('button', { name: '从数字谱编排' }))

    expect(screen.getByRole('heading', { name: '从数字谱编排' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('乐谱名称'), {
      target: { value: '小星星' },
    })
    fireEvent.change(screen.getByLabelText('数字谱输入'), {
      target: { value: '1' },
    })

    expect(screen.getByText('D5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '洞洞图 ●●●○○○' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('已保存')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(screen.getByText('小星星')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '打开 小星星' }))
    expect(screen.getByRole('heading', { name: '从数字谱编排' })).toBeInTheDocument()
    expect(screen.getByLabelText('数字谱输入')).toHaveValue('1')
  })

  it('keeps the new hole score route after the browser hashchange event', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))

    fireEvent.click(screen.getByRole('button', { name: '新建洞洞谱' }))
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(window.location.hash).toBe('#/hole-scores/new')
    expect(screen.getByRole('heading', { name: '新建洞洞谱' })).toBeInTheDocument()
  })

  it('keeps the jianpu editor open when unsaved return is canceled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))
    fireEvent.click(screen.getByRole('button', { name: '新建洞洞谱' }))
    fireEvent.click(screen.getByRole('button', { name: '从数字谱编排' }))

    fireEvent.change(screen.getByLabelText('数字谱输入'), {
      target: { value: '1 2' },
    })

    confirmSpy.mockReturnValueOnce(false)
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(screen.getByRole('heading', { name: '从数字谱编排' })).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(true)
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(screen.getByRole('heading', { name: '洞洞谱' })).toBeInTheDocument()
  })

  it('creates and edits a wysiwyg manual hole score from the bottom keyboard', () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))
    fireEvent.click(screen.getByRole('button', { name: '新建洞洞谱' }))
    fireEvent.change(screen.getByLabelText('乐谱名称'), {
      target: { value: '手编练习' },
    })
    fireEvent.click(screen.getByRole('button', { name: '编排洞洞谱' }))

    expect(screen.getByRole('heading', { name: '编排洞洞谱' })).toBeInTheDocument()
    const scoreCanvas = screen.getByRole('region', { name: '洞洞谱曲谱' })
    const keyboard = screen.getByRole('region', { name: '指法键盘' })
    expect(document.querySelector('.tuner-shell')).toHaveClass('px-3')
    expect(document.querySelector('.tuner-shell')).not.toHaveClass('px-5')
    expect(keyboard).toHaveClass('-mx-3')
    expect(keyboard).not.toHaveClass('-mx-5')
    expect(within(scoreCanvas).getByText('点底部键盘开始编排')).toBeInTheDocument()
    expect(screen.queryByLabelText('乐谱名称')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('笛子调性')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('指法')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('选中项备注')).not.toBeInTheDocument()
    expect(screen.queryByText('洞洞谱', { selector: 'p' })).not.toBeInTheDocument()
    expect(screen.queryByText('洞洞谱曲谱')).not.toBeInTheDocument()
    expect(screen.queryByText(/光标在第/)).not.toBeInTheDocument()
    expect(within(keyboard).queryByRole('group', { name: '音符键盘' })).not.toBeInTheDocument()
    const lowKeyboard = within(keyboard).getByRole('group', { name: '低音键盘' })
    const middleKeyboard = within(keyboard).getByRole('group', { name: '中音键盘' })
    const highKeyboard = within(keyboard).getByRole('group', { name: '高音键盘' })
    const functionKeyboard = within(keyboard).getByRole('group', { name: '功能键盘' })
    expect(within(lowKeyboard).getAllByRole('button')).toHaveLength(7)
    expect(within(middleKeyboard).getAllByRole('button')).toHaveLength(7)
    expect(within(highKeyboard).getAllByRole('button')).toHaveLength(7)
    expect(within(lowKeyboard).getByRole('button', { name: '插入 低音1' })).toBeDisabled()
    expect(within(lowKeyboard).getByRole('button', { name: '插入 低音5' })).toHaveTextContent('低5')
    expect(within(lowKeyboard).getByRole('button', { name: '插入 低音5' })).toBeEnabled()
    expect(within(middleKeyboard).getByRole('button', { name: '插入 1' })).toHaveTextContent('1')
    expect(within(highKeyboard).getByRole('button', { name: '插入 高音6' })).toHaveTextContent('高6')
    expect(within(highKeyboard).getByRole('button', { name: '插入 高音6' })).toBeEnabled()
    expect(within(highKeyboard).getByRole('button', { name: '插入 高音7' })).toBeDisabled()
    expect(within(functionKeyboard).getByRole('button', { name: '删除选中项' })).toBeInTheDocument()
    expect(within(functionKeyboard).getByRole('button', { name: '清空' })).toBeInTheDocument()

    fireEvent.click(within(keyboard).getByRole('button', { name: '插入 1' }))
    expect(within(scoreCanvas).getByText('D5')).toBeInTheDocument()
    expect(within(scoreCanvas).getByRole('img', { name: '洞洞图 ●●●○○○' })).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(false)
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(screen.getByRole('heading', { name: '编排洞洞谱' })).toBeInTheDocument()

    fireEvent.click(within(keyboard).getByRole('button', { name: '插入 2' }))
    fireEvent.click(
      within(scoreCanvas).getByRole('button', { name: '曲谱项 第 1 项 1 D5' }),
    )
    fireEvent.click(within(keyboard).getByRole('button', { name: '插入 3' }))
    expect(
      within(scoreCanvas)
        .getAllByRole('button', { name: /曲谱项 第 \d 项/ })
        .map((item) => item.getAttribute('aria-label')),
    ).toEqual(['曲谱项 第 1 项 1 D5', '曲谱项 第 2 项 3 F#5', '曲谱项 第 3 项 2 E5'])

    fireEvent.click(
      within(scoreCanvas).getByRole('button', { name: '曲谱项 第 1 项 1 D5' }),
    )
    expect(screen.queryByLabelText('选中项备注')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(screen.getByText('已保存')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(screen.getByText('手编练习')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '打开 手编练习' }))
    const reopenedCanvas = screen.getByRole('region', { name: '洞洞谱曲谱' })
    fireEvent.click(
      within(reopenedCanvas).getByRole('button', { name: '曲谱项 第 1 项 1 D5' }),
    )
    expect(screen.queryByLabelText('选中项备注')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('乐谱名称')).not.toBeInTheDocument()

    const reopenedKeyboard = screen.getByRole('region', { name: '指法键盘' })
    confirmSpy.mockClear()
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '删除选中项' }))
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(
      within(reopenedCanvas).queryByRole('button', { name: '曲谱项 第 1 项 1 D5' }),
    ).not.toBeInTheDocument()

    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '插入休止' }))
    expect(within(reopenedCanvas).getByText('休止')).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(false)
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '删除选中项' }))
    expect(within(reopenedCanvas).getByText('休止')).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(true)
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '删除选中项' }))
    expect(within(reopenedCanvas).queryByText('休止')).not.toBeInTheDocument()

    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '插入延音' }))
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '插入小节线' }))
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '换行' }))
    expect(within(reopenedCanvas).getByText('延音')).toBeInTheDocument()
    expect(within(reopenedCanvas).getByText('小节线')).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(false)
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '清空' }))
    expect(within(reopenedCanvas).getByText('延音')).toBeInTheDocument()

    confirmSpy.mockReturnValueOnce(true)
    fireEvent.click(within(reopenedKeyboard).getByRole('button', { name: '清空' }))
    expect(within(reopenedCanvas).getByText('点底部键盘开始编排')).toBeInTheDocument()
  })

  it('imports a hole score json file into the library', async () => {
    const score = createJianpuGeneratedScore({
      title: '导入谱',
      scoreKey: 'D',
      fluteKey: 'D',
      fingeringProfileId: 'tube_as_5',
      text: '1',
      holeScore: { items: [] },
    })
    const json = serializeScoreJson(score)
    const file = new File([json], '导入谱.json', { type: 'application/json' })
    Object.defineProperty(file, 'text', {
      value: vi.fn(async () => json),
    })

    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))
    await act(async () => {
      fireEvent.change(screen.getByLabelText('导入洞洞谱 JSON 文件'), {
        target: { files: [file] },
      })
    })

    expect(screen.getByText('已导入《导入谱》')).toBeInTheDocument()
    expect(screen.getByText('导入谱')).toBeInTheDocument()
  })

  it('downloads a saved score as json from the library', () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const createObjectURL = vi.fn(() => 'blob:hole-score')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    })
    saveScore(
      createJianpuGeneratedScore({
        title: '小星星',
        scoreKey: 'D',
        fluteKey: 'D',
        fingeringProfileId: 'tube_as_5',
        text: '1',
        holeScore: { items: [] },
      }),
    )

    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '洞洞谱' }))
    fireEvent.click(screen.getByRole('button', { name: '导出 小星星 JSON' }))

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:hole-score')
  })

  it('hides the web bottom navigation when rendered inside the native shell', () => {
    window.history.replaceState(null, '', '/?native-shell=1#/settings')

    render(<App />)

    expect(screen.queryByRole('navigation', { name: '主导航' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '调音设置' })).toBeInTheDocument()
    expect(document.querySelector('.native-shell .tuner-shell')).toBeInTheDocument()
  })

  it('shows fingering selector and target selector only in target practice mode', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: '主导航' })
    fireEvent.click(within(navigation).getByRole('button', { name: '设置' }))

    expect(screen.getByText('指法')).toBeInTheDocument()
    expect(screen.queryByText('目标音')).not.toBeInTheDocument()
    expect(screen.queryByText('检测模式')).not.toBeInTheDocument()

    const modeTabs = screen.getByRole('radiogroup', { name: '检测模式' })
    fireEvent.click(within(modeTabs).getByRole('radio', { name: '指定音练习' }))

    expect(screen.getByText('目标音')).toBeInTheDocument()
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

  it('shows E key tube-as-5 low 5 target frequency before any pitch in target mode', () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        diziKey: 'E',
        fingeringProfileId: 'tube_as_5',
        mode: 'target',
        targetLabel: '低音5',
      }),
    )

    render(<App />)

    expect(screen.getByText('目标 低音5')).toBeInTheDocument()
    expect(getFrequencyValue('当前频率')).toHaveTextContent('-- Hz')
    expect(getFrequencyValue('平均频率')).toHaveTextContent('-- Hz')
    expect(getFrequencyValue('目标频率')).toHaveTextContent('493.9 Hz')
  })

  it('uses the restored fingering profile for realtime target matching', async () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        diziKey: 'E',
        fingeringProfileId: 'tube_as_2',
        mode: 'realtime',
        targetLabel: '低音5',
      }),
    )

    render(<App />)

    expect(screen.getByText('E 调笛 · 筒音作2')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '开始检测' }))
    })

    act(() => {
      pitchCallback?.(659.26)
    })

    expect(screen.getByText('低音5', { selector: '.jianpu-display' })).toBeInTheDocument()
    expect(getFrequencyValue('目标频率')).toHaveTextContent('659.3 Hz')
  })

  it('shows E key tube-as-2 low 5 target frequency in target mode', () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        diziKey: 'E',
        fingeringProfileId: 'tube_as_2',
        mode: 'target',
        targetLabel: '低音5',
      }),
    )

    render(<App />)

    expect(getFrequencyValue('目标频率')).toHaveTextContent('659.3 Hz')
  })

  it('falls back to target 1 when the saved target is unavailable for the active fingering', () => {
    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        diziKey: 'D',
        fingeringProfileId: 'tube_as_2',
        mode: 'target',
        targetLabel: '高音6',
      }),
    )

    render(<App />)

    expect(screen.getByText('目标 1')).toBeInTheDocument()
    expect(getFrequencyValue('目标频率')).toHaveTextContent('784.0 Hz')
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
      JSON.stringify({
        diziKey: 'G',
        fingeringProfileId: 'tube_as_1',
        mode: 'target',
        targetLabel: '高音1',
      }),
    )

    render(<App />)

    expect(screen.getByText('目标 高音1')).toBeInTheDocument()
    expect(screen.getByText('G 调笛 · 筒音作1')).toBeInTheDocument()
  })
})
