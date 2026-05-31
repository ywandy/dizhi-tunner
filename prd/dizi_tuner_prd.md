# 笛子音准测试 WebApp PRD

## 1. 产品概述

### 1.1 产品名称

笛子音准测试

### 1.2 产品定位

一个极简的纯前端笛子音准测试工具。

用户选择笛子调性后，通过麦克风实时检测当前吹奏音高，并用类似电平表的方式显示音准偏差。

### 1.3 产品目标

第一版只解决一个问题：

> 用户吹笛子时，快速知道当前音是偏高、偏低，还是基本准确。

### 1.4 产品形态

- 纯前端 WebApp
- 移动端优先
- 可部署为静态站点
- 后续可扩展为 PWA
- 暂不做登录、后端、云同步、历史记录、AI 分析

---

## 2. 用户场景

### 2.1 实时检测场景

用户打开网页，选择笛子调性，例如 D 调笛，点击开始检测。

用户随便吹一个音，系统自动判断当前音最接近哪一个简谱音，并显示偏差。

示例：

```text
笛子：D 调笛
模式：实时检测

当前识别：5
当前频率：438.6 Hz
目标频率：440.0 Hz
偏差：-5.5 cents
结果：略低
```

### 2.2 指定音高练习场景

用户选择笛子调性和目标音，例如 D 调笛的“5”。

系统只判断当前吹奏音和目标音之间的偏差，不自动切换目标音。

示例：

```text
笛子：D 调笛
模式：指定音练习
目标音：5

当前频率：438.6 Hz
目标频率：440.0 Hz
偏差：-5.5 cents
结果：略低
```

---

## 3. 产品范围

### 3.1 第一版包含功能

| 功能 | 是否包含 | 说明 |
|---|---:|---|
| 选择笛子调性 | 是 | 支持 C / D / E / F / G |
| 实时音准检测 | 是 | 自动匹配最近音 |
| 指定音高练习 | 是 | 用户选择目标音 |
| 电平表显示偏差 | 是 | 显示 -50 到 +50 cents |
| 当前频率显示 | 是 | 显示 Hz |
| 目标频率显示 | 是 | 显示 Hz |
| 偏差 cents 显示 | 是 | 正数偏高，负数偏低 |
| 状态文案 | 是 | 很准 / 基本准 / 略高 / 略低 / 明显偏高 / 明显偏低 |
| 麦克风授权 | 是 | 浏览器 getUserMedia |
| 停止检测 | 是 | 释放麦克风资源 |

### 3.2 第一版不包含功能

| 功能 | 第一版是否做 |
|---|---:|
| 用户登录 | 否 |
| 后端服务 | 否 |
| 历史记录 | 否 |
| 长音评分 | 否 |
| 练习报告 | 否 |
| 指法图 | 否 |
| 筒音作 2 / 筒音作 1 | 否 |
| A4 = 442Hz 配置 | 否 |
| AI 建议 | 否 |
| 曲谱跟练 | 否 |
| 教师端 | 否 |
| 录音回放 | 否 |

---

## 4. 核心设计原则

### 4.1 极简

页面只做一个主功能页，不做复杂导航。

### 4.2 即开即用

用户进入页面后，只需要完成三步：

```text
选择笛子调性
点击开始检测
吹奏笛子
```

### 4.3 反馈直观

核心反馈用电平表完成。

```text
偏低          准          偏高
-50  -25      0      +25  +50
|-----|-------|-------|-----|
              ▲
```

### 4.4 不追求教学系统

本产品不是乐器学习系统，只是音准测试工具。

---

## 5. 页面结构

### 5.1 页面数量

第一版只有一个页面：

```text
/
```

页面名称：

```text
笛子音准测试
```

### 5.2 页面布局

```text
┌────────────────────────────┐
│ 笛子音准测试                │
│                            │
│ 笛子调性                    │
│ [D 调笛 ▼]                  │
│                            │
│ 检测模式                    │
│ [实时检测] [指定音练习]      │
│                            │
│ 目标音                      │
│ [5 ▼]                       │
│ 仅指定音练习模式显示          │
│                            │
│ 当前音                      │
│ 5                           │
│                            │
│ 当前频率                    │
│ 438.6 Hz                    │
│                            │
│ 目标频率                    │
│ 440.0 Hz                    │
│                            │
│ 偏差                        │
│ -5.5 cents                  │
│                            │
│ -50   -25    0    +25   +50 │
│ |------|------|------|------| │
│              ▲              │
│                            │
│ 状态：略低                  │
│                            │
│ [开始检测] [停止]            │
└────────────────────────────┘
```

---

## 6. 功能需求

## 6.1 笛子调性选择

### 6.1.1 功能说明

用户可以选择当前使用的笛子调性。

### 6.1.2 支持范围

第一版支持：

```text
C 调笛
D 调笛
E 调笛
F 调笛
G 调笛
```

### 6.1.3 默认值

默认选择：

```text
D 调笛
```

### 6.1.4 业务规则

第一版固定为：

```text
筒音作 5
A4 = 440Hz
```

不同调笛子的简谱 1 对应：

| 笛子调性 | 简谱 1 |
|---|---|
| C 调笛 | C4 |
| D 调笛 | D4 |
| E 调笛 | E4 |
| F 调笛 | F4 |
| G 调笛 | G4 |

---

## 6.2 实时检测模式

### 6.2.1 功能说明

用户吹任意一个音，系统自动查找当前频率最接近的目标音。

### 6.2.2 输入

- 当前麦克风检测频率 `currentFreq`
- 当前笛子调性 `diziKey`

### 6.2.3 输出

- 当前识别的简谱音
- 当前频率
- 目标频率
- 偏差 cents
- 状态文案
- 电平表指针位置

### 6.2.4 匹配逻辑

```text
1. 根据笛子调性生成目标音列表
2. 当前频率与所有目标音频率计算 cents 差值
3. 选择绝对值最小的目标音
4. 显示该目标音和偏差
```

### 6.2.5 示例

D 调笛目标音列表部分：

| 简谱 | 目标频率 |
|---|---:|
| 低音5 | 220.00 Hz |
| 低音6 | 246.94 Hz |
| 低音7 | 277.18 Hz |
| 1 | 293.66 Hz |
| 2 | 329.63 Hz |
| 3 | 369.99 Hz |
| 4 | 392.00 Hz |
| 5 | 440.00 Hz |
| 6 | 493.88 Hz |
| 7 | 554.37 Hz |
| 高音1 | 587.33 Hz |

如果检测到：

```text
currentFreq = 438.6 Hz
```

最近音为：

```text
5 / A4 / 440.00 Hz
```

偏差：

```text
-5.5 cents
```

---

## 6.3 指定音高练习模式

### 6.3.1 功能说明

用户选择一个目标音，系统只对比当前频率与该目标音的偏差。

### 6.3.2 输入

- 当前笛子调性 `diziKey`
- 目标音 `targetLabel`
- 当前检测频率 `currentFreq`

### 6.3.3 输出

- 目标简谱音
- 当前频率
- 目标频率
- 偏差 cents
- 状态文案
- 电平表指针位置

### 6.3.4 业务规则

在指定音高练习模式下：

```text
即使用户吹到其他音，系统也不自动切换目标音。
```

例如用户选择目标音 `5`，系统始终以 `5` 的频率作为目标频率进行比较。

---

## 6.4 目标音选择

### 6.4.1 显示条件

仅在指定音高练习模式下显示。

### 6.4.2 可选范围

第一版目标音范围：

```text
低音5
低音6
低音7
1
2
3
4
5
6
7
高音1
高音2
高音3
高音4
高音5
```

### 6.4.3 默认值

默认目标音：

```text
5
```

---

## 6.5 麦克风检测

### 6.5.1 功能说明

用户点击开始检测后，浏览器请求麦克风权限。

### 6.5.2 权限规则

用户必须主动点击按钮后才能启动麦克风。

```text
点击开始检测
  ↓
请求麦克风权限
  ↓
授权成功
  ↓
开始检测
```

### 6.5.3 授权失败

如果用户拒绝授权，显示：

```text
无法访问麦克风，请允许浏览器使用麦克风后重试。
```

### 6.5.4 停止检测

用户点击停止后：

```text
1. 停止所有 MediaStreamTrack
2. 关闭 AudioContext
3. UI 回到未检测状态
```

---

## 6.6 电平表

### 6.6.1 功能说明

电平表用于显示当前音准偏差。

### 6.6.2 显示范围

```text
-50 cents ~ +50 cents
```

### 6.6.3 指针位置

- `0 cents` 位于中间
- 负数偏左，表示偏低
- 正数偏右，表示偏高
- 小于 `-50 cents` 时贴左边
- 大于 `+50 cents` 时贴右边

### 6.6.4 显示示例

```text
-50        -25         0        +25        +50
|-----------|----------|----------|----------|
                       ▲
```

---

## 6.7 状态文案

### 6.7.1 判断规则

| cents 绝对值 | 文案 |
|---:|---|
| `<= 5` | 很准 |
| `<= 10` | 基本准 |
| `<= 20` | 略高 / 略低 |
| `> 20` | 明显偏高 / 明显偏低 |

### 6.7.2 偏高偏低规则

```text
cents > 0：偏高
cents < 0：偏低
cents = 0：准确
```

---

## 7. 算法设计

## 7.1 总体算法流程

```text
麦克风输入
  ↓
Web Audio API 获取音频 buffer
  ↓
Pitch Detection 得到 currentFreq
  ↓
根据当前笛子调性生成目标音列表
  ↓
根据模式计算目标音
  ↓
计算 cents 偏差
  ↓
计算电平表位置
  ↓
显示结果
```

---

## 7.2 音准偏差公式

```ts
function centsDiff(currentFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(currentFreq / targetFreq)
}
```

含义：

```text
currentFreq > targetFreq：cents 为正，偏高
currentFreq < targetFreq：cents 为负，偏低
```

---

## 7.3 MIDI 与频率转换

### 7.3.1 MIDI 转频率

```ts
function midiToFreq(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12)
}
```

### 7.3.2 音名转 MIDI

```ts
const NOTE_TO_SEMITONE: Record<string, number> = {
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
}

function noteToMidi(note: string, octave: number): number {
  return (octave + 1) * 12 + NOTE_TO_SEMITONE[note]
}
```

---

## 7.4 简谱音阶关系

第一版固定为大调音阶关系：

```ts
type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7

const MAJOR_SCALE: Record<Degree, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
}
```

---

## 7.5 目标音范围

```ts
const JIANPU_RANGE = [
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
] as const
```

---

## 7.6 构建笛子目标音列表

```ts
type DiziKey = 'C' | 'D' | 'E' | 'F' | 'G'

function buildDiziTargets(key: DiziKey) {
  const baseOctave = 4
  const tonicMidi = noteToMidi(key, baseOctave)

  return JIANPU_RANGE.map(item => {
    const midi =
      tonicMidi +
      MAJOR_SCALE[item.degree] +
      item.octaveShift * 12

    return {
      label: item.label,
      midi,
      frequency: midiToFreq(midi),
    }
  })
}
```

---

## 7.7 实时检测匹配算法

```ts
function findNearestTarget(
  currentFreq: number,
  targets: Array<{
    label: string
    midi: number
    frequency: number
  }>
) {
  let best:
    | {
        label: string
        midi: number
        frequency: number
        cents: number
      }
    | null = null

  for (const target of targets) {
    const cents = centsDiff(currentFreq, target.frequency)

    if (!best || Math.abs(cents) < Math.abs(best.cents)) {
      best = {
        ...target,
        cents,
      }
    }
  }

  return best
}
```

---

## 7.8 指定音练习算法

```ts
function checkAgainstTarget(
  currentFreq: number,
  target: {
    label: string
    midi: number
    frequency: number
  }
) {
  return {
    ...target,
    cents: centsDiff(currentFreq, target.frequency),
  }
}
```

---

## 7.9 电平表位置算法

```ts
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function centsToMeterPercent(cents: number) {
  const clamped = clamp(cents, -50, 50)
  return ((clamped + 50) / 100) * 100
}
```

映射关系：

| cents | 指针位置 |
|---:|---:|
| -50 | 0% |
| -25 | 25% |
| 0 | 50% |
| +25 | 75% |
| +50 | 100% |

---

## 8. 音频检测设计

## 8.1 技术方案

使用：

```text
Web Audio API + pitchy
```

### 8.1.1 依赖

```bash
pnpm add pitchy
```

### 8.1.2 麦克风配置

```ts
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
})
```

说明：

| 参数 | 原因 |
|---|---|
| echoCancellation: false | 避免回声消除影响音频 |
| noiseSuppression: false | 避免降噪影响频率 |
| autoGainControl: false | 避免自动增益导致不稳定 |

---

## 8.2 Pitch 检测逻辑

```ts
import { PitchDetector } from 'pitchy'

async function startTuner(onPitch: (frequency: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })

  const audioContext = new AudioContext()
  const source = audioContext.createMediaStreamSource(stream)

  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0

  source.connect(analyser)

  const detector = PitchDetector.forFloat32Array(analyser.fftSize)
  const buffer = new Float32Array(analyser.fftSize)

  let stopped = false

  function tick() {
    if (stopped) return

    analyser.getFloatTimeDomainData(buffer)

    const [pitch, clarity] = detector.findPitch(
      buffer,
      audioContext.sampleRate
    )

    if (
      Number.isFinite(pitch) &&
      pitch >= 80 &&
      pitch <= 2000 &&
      clarity >= 0.85
    ) {
      onPitch(pitch)
    }

    requestAnimationFrame(tick)
  }

  tick()

  return {
    stop() {
      stopped = true
      stream.getTracks().forEach(track => track.stop())
      audioContext.close()
    },
  }
}
```

---

## 8.3 有效频率范围

第一版只处理：

```text
80Hz ~ 2000Hz
```

低于或高于该范围的数据忽略。

---

## 8.4 置信度过滤

第一版使用 pitchy 返回的 clarity。

```text
clarity >= 0.85 才认为有效
```

低于该值时，不更新当前结果。

---

## 9. 状态管理设计

## 9.1 页面状态

```ts
type Mode = 'realtime' | 'target'
type DiziKey = 'C' | 'D' | 'E' | 'F' | 'G'

type AppState = {
  diziKey: DiziKey
  mode: Mode
  targetLabel: string

  isRunning: boolean
  currentFreq: number | null

  result: {
    label: string
    frequency: number
    cents: number
  } | null

  error: string | null
}
```

---

## 9.2 状态默认值

```ts
const defaultState: AppState = {
  diziKey: 'D',
  mode: 'realtime',
  targetLabel: '5',

  isRunning: false,
  currentFreq: null,
  result: null,
  error: null,
}
```

---

## 9.3 检测结果处理

```ts
function handlePitch(freq: number) {
  const targets = buildDiziTargets(state.diziKey)

  if (state.mode === 'realtime') {
    const result = findNearestTarget(freq, targets)
    setState({
      currentFreq: freq,
      result,
    })
    return
  }

  const target = targets.find(t => t.label === state.targetLabel)

  if (!target) return

  const result = checkAgainstTarget(freq, target)

  setState({
    currentFreq: freq,
    result,
  })
}
```

---

## 10. UI 组件设计

## 10.1 组件列表

```text
App
DiziSelector
ModeSwitch
TargetSelector
TuningMeter
ResultPanel
StartStopButton
```

---

## 10.2 DiziSelector

### 功能

选择笛子调性。

### Props

```ts
type DiziSelectorProps = {
  value: DiziKey
  onChange: (value: DiziKey) => void
}
```

### 选项

```text
C 调笛
D 调笛
E 调笛
F 调笛
G 调笛
```

---

## 10.3 ModeSwitch

### 功能

切换检测模式。

### Props

```ts
type ModeSwitchProps = {
  value: 'realtime' | 'target'
  onChange: (value: 'realtime' | 'target') => void
}
```

### 选项

```text
实时检测
指定音练习
```

---

## 10.4 TargetSelector

### 功能

选择指定练习目标音。

### 显示条件

```text
mode === 'target'
```

### Props

```ts
type TargetSelectorProps = {
  value: string
  targets: Array<{
    label: string
    frequency: number
  }>
  onChange: (label: string) => void
}
```

---

## 10.5 TuningMeter

### 功能

显示音准偏差。

### Props

```ts
type TuningMeterProps = {
  cents: number | null
}
```

### 显示状态

未检测到有效音高：

```text
等待吹奏
```

检测到有效音高：

```text
-50   -25    0    +25   +50
|------|------|------|------|
              ▲
```

---

## 10.6 ResultPanel

### 功能

展示检测结果。

### 内容

```text
当前音 / 目标音
当前频率
目标频率
偏差 cents
状态文案
```

### 示例

```text
当前音：5
当前频率：438.6 Hz
目标频率：440.0 Hz
偏差：-5.5 cents
状态：略低
```

---

## 10.7 StartStopButton

### 功能

开始或停止检测。

### 状态

| 当前状态 | 按钮文案 |
|---|---|
| 未运行 | 开始检测 |
| 运行中 | 停止检测 |

---

## 11. 视觉设计要求

## 11.1 整体风格

- 极简
- 工具感
- 类似调音器/电平表
- 移动端优先
- 避免复杂装饰

## 11.2 页面层级

信息优先级：

```text
1. 电平表
2. 偏差状态
3. 当前音 / 目标音
4. 当前频率 / 目标频率
5. 配置项
```

## 11.3 色彩建议

| 状态 | 颜色建议 |
|---|---|
| 很准 | 绿色 |
| 基本准 | 浅绿色 |
| 略高 / 略低 | 黄色 / 橙色 |
| 明显偏高 / 明显偏低 | 红色 |
| 未检测 | 灰色 |

## 11.4 电平表样式

建议用横向条形表：

```text
偏低                         偏高
-50      -25       0       +25      +50
|---------|--------|--------|---------|
                    ▲
```

---

## 12. 技术架构

## 12.1 技术栈

```text
React
Vite
TypeScript
Web Audio API
pitchy
CSS / Tailwind CSS
```

### 可选

```text
Zustand
```

第一版状态较少，可以直接用 React useState，不强制引入状态管理库。

---

## 12.2 项目结构

```text
src/
  App.tsx
  main.tsx

  core/
    audio.ts
    dizi.ts
    pitch.ts
    tuning.ts

  components/
    DiziSelector.tsx
    ModeSwitch.tsx
    TargetSelector.tsx
    TuningMeter.tsx
    ResultPanel.tsx
    StartStopButton.tsx

  styles/
    global.css
```

---

## 12.3 核心模块职责

| 模块 | 职责 |
|---|---|
| audio.ts | 麦克风启动、停止、音频 buffer 获取 |
| pitch.ts | pitchy 封装 |
| dizi.ts | 笛子调性、目标音频率表 |
| tuning.ts | cents 计算、电平表映射、状态判断 |
| App.tsx | 页面状态和业务流转 |
| TuningMeter.tsx | 电平表 UI |

---

## 13. 异常处理

## 13.1 麦克风权限被拒绝

显示：

```text
无法访问麦克风，请允许浏览器使用麦克风后重试。
```

## 13.2 浏览器不支持 getUserMedia

显示：

```text
当前浏览器不支持麦克风检测，请使用 Chrome、Edge 或 Safari 浏览器。
```

## 13.3 长时间无有效音高

显示：

```text
等待吹奏...
```

或者：

```text
未检测到稳定音高
```

## 13.4 音量太小 / 环境噪声

第一版不单独判断音量，仅依赖 pitch clarity 过滤。

后续可增加 RMS 音量判断。

---

## 14. 兼容性要求

## 14.1 首选支持

| 平台 | 要求 |
|---|---|
| Chrome Desktop | 支持 |
| Edge Desktop | 支持 |
| Android Chrome | 支持 |
| iOS Safari | 尽量支持 |

## 14.2 暂不重点支持

| 平台 | 原因 |
|---|---|
| 微信内置浏览器 | 麦克风和音频上下文限制较多 |
| 老旧 Android 浏览器 | Web Audio 支持不稳定 |
| 后台运行 | Web 页面后台会被暂停 |

---

## 15. 部署方案

## 15.1 第一版部署

使用静态部署：

```text
Cloudflare Pages
Vercel
Netlify
GitHub Pages
```

推荐：

```text
Cloudflare Pages
```

## 15.2 构建命令

```bash
pnpm install
pnpm build
```

## 15.3 产物目录

```text
dist/
```

---

## 16. 验收标准

## 16.1 基础功能验收

| 验收项 | 标准 |
|---|---|
| 可选择笛子调性 | C/D/E/F/G 可选 |
| 可启动麦克风 | 点击开始后请求权限 |
| 可停止检测 | 点击停止后释放麦克风 |
| 实时检测可用 | 吹奏后显示最近音 |
| 指定音练习可用 | 只对比选中的目标音 |
| 偏差计算正确 | cents 计算符合公式 |
| 电平表正常 | 指针随 cents 左右移动 |
| 状态文案正确 | 根据 cents 显示偏高/偏低 |
| 移动端可用 | 手机浏览器布局正常 |

---

## 16.2 算法验收

### D 调笛目标频率

第一版 D 调笛，筒音作 5，A4 = 440，应生成：

| 简谱 | 频率 |
|---|---:|
| 1 | 293.66 Hz |
| 2 | 329.63 Hz |
| 3 | 369.99 Hz |
| 4 | 392.00 Hz |
| 5 | 440.00 Hz |
| 6 | 493.88 Hz |
| 7 | 554.37 Hz |
| 高音1 | 587.33 Hz |

### cents 验收

输入：

```text
currentFreq = 440
targetFreq = 440
```

输出：

```text
0 cents
```

输入：

```text
currentFreq = 438.6
targetFreq = 440
```

输出约：

```text
-5.5 cents
```

---

## 17. MVP 开发任务拆分

### 17.1 初始化项目

```text
1. 创建 Vite React TS 项目
2. 安装 pitchy
3. 建立 core 和 components 目录
```

### 17.2 实现算法模块

```text
1. 实现 noteToMidi
2. 实现 midiToFreq
3. 实现 buildDiziTargets
4. 实现 centsDiff
5. 实现 findNearestTarget
6. 实现 centsToMeterPercent
7. 实现 getStatusText
```

### 17.3 实现音频模块

```text
1. 请求麦克风权限
2. 创建 AudioContext
3. 创建 AnalyserNode
4. 接入 pitchy
5. 过滤无效 pitch
6. 提供 start / stop 方法
```

### 17.4 实现 UI

```text
1. 笛子选择器
2. 模式切换
3. 目标音选择器
4. 电平表
5. 结果展示
6. 开始 / 停止按钮
```

### 17.5 联调

```text
1. 选择 D 调笛
2. 进入实时检测
3. 吹奏接近 A4 的音
4. 系统识别为 5
5. 显示偏差
6. 切换指定音练习
7. 选择目标音 5
8. 系统固定对比 A4
```

---

## 18. 后续可选迭代

第一版完成后，如果效果稳定，再考虑：

```text
1. 支持 A4 = 442Hz
2. 支持筒音作 2 / 筒音作 1
3. 支持 Bb / A 调笛
4. 支持 PWA 离线
5. 增加 RMS 音量检测
6. 增加指针平滑
7. 增加长音稳定度
8. 增加本地练习记录
```

---

## 19. 第一版结论

第一版产品只做：

```text
选笛子
实时检测
指定音练习
电平表显示偏差
```

不做复杂配置，不做后端，不做学习系统。

核心闭环：

```text
用户选择 D 调笛
  ↓
点击开始检测
  ↓
吹奏
  ↓
系统检测当前频率
  ↓
计算目标音偏差
  ↓
电平表显示偏高 / 偏低 / 准
```

这是一个可以快速实现、快速验证的小工具型 WebApp。
