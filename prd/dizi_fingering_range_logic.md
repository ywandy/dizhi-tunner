# 笛子指法 / 调性 / 音域配置逻辑

## 1. 设计目标

这个配置用于极简版“笛子音准测试 WebApp”。

目标是支持：

- 选择笛子调性：C / D / E / F / G
- 选择指法体系：筒音作5 / 筒音作2 / 筒音作1
- 根据“调性 + 指法体系”生成当前可用目标音域
- 用于两个功能：
  - 实时检测：从目标音域里找最近音
  - 指定音练习：只和用户选中的目标音比较

配置文件为：

```text
dizi_fingering_range_config.json
```

---

## 2. 核心原则

不要为每个调、每个指法手写所有频率。

正确做法是：

```text
笛子调性
  ↓
确定物理筒音
  ↓
选择指法体系
  ↓
读取该指法体系的音域模板
  ↓
根据调性转成实际音名 / MIDI / 频率
```

也就是：

```text
调性负责确定筒音物理音高
指法体系负责把筒音记作低音5 / 低音2 / 1，并据此转调
算法负责换算频率
```

---

## 3. 三个核心对象

## 3.1 diziKeys：调性配置

示例：

```json
{
  "D": {
    "id": "D",
    "name": "D调笛",
    "tonicWhenTubeAs5": {
      "noteName": "D5",
      "midi": 74,
      "frequencyHz": 587.33
    },
    "physicalTube": {
      "noteName": "A4",
      "midi": 69,
      "frequencyHz": 440.0
    }
  }
}
```

含义：

```text
D调笛在筒音作5时：
1 = D5
筒音 = 低音5 = A4
```

---

## 3.2 fingeringProfiles：指法体系配置

第一版支持三个指法体系：

```text
tube_as_5 = 筒音作5
tube_as_2 = 筒音作2
tube_as_1 = 筒音作1
```

每个指法体系维护自己的 `rangeTemplate`。

字段含义：

| 字段 | 含义 |
|---|---|
| id | 程序内部稳定 ID |
| label | UI 展示用简谱名 |
| degree | 简谱级数，1~7 |
| octaveShift | 相对于当前指法体系中“中音1”的八度偏移 |

---

## 3.3 resolvedRanges：已展开音域

`resolvedRanges` 是根据 `diziKeys + fingeringProfiles` 预生成的结果。

前端可以直接读取：

```ts
const targets = config.resolvedRanges[diziKey][fingeringProfileId].targets
```

也可以只保留模板，在运行时动态生成。

---

## 4. 为什么每个指法要有独立标签模板

同一把笛子的物理音域上下界相同，最低音都是筒音。

不同的是：筒音在不同指法体系里的简谱意义不同。

```text
筒音作5：筒音 = 低音5
筒音作2：筒音 = 低音2
筒音作1：筒音 = 1
```

因此每个指法体系要维护自己的标签模板。模板决定“同一段物理音域”在当前指法里显示成哪些简谱目标。

以 D 调笛为例：

### 4.1 筒音作5

```text
筒音 A4 = 低音5
1 = D5
```

目标标签：

```text
低音5 低音6 低音7
1 2 3 4 5 6 7
高音1 高音2 高音3 高音4 高音5 高音6
```

### 4.2 筒音作2

```text
筒音 A4 = 低音2
1 = G5
```

目标标签：

```text
低音2 低音3 低音4 低音5 低音6 低音7
1 2 3 4 5 6 7
高音1 高音2 高音3
```

### 4.3 筒音作1

```text
筒音 A4 = 1
```

目标标签：

```text
1 2 3 4 5 6 7
高音1 高音2 高音3 高音4 高音5 高音6 高音7
倍高音1 倍高音2
```

所以不能用同一套 `低音5 ~ 高音6` 标签去套所有指法；但三套指法应覆盖同一把笛子的最低筒音到最高常用目标范围。

---

## 5. 计算逻辑

### 5.1 音名转 MIDI

```ts
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

function noteToMidi(note: string, octave: number): number {
  return (octave + 1) * 12 + NOTE_TO_SEMITONE[note]
}
```

规则：

```text
C4 = 60
A4 = 69
```

---

### 5.2 MIDI 转频率

```ts
function midiToFreq(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12)
}
```

---

### 5.3 cents 偏差

```ts
function centsDiff(currentFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(currentFreq / targetFreq)
}
```

含义：

```text
cents > 0：偏高
cents < 0：偏低
cents = 0：准确
```

---

### 5.4 大调音阶半音关系

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

### 5.5 计算物理筒音

约定：

```text
笛子调性 = 筒音作5时的 1，并默认落在第 5 八度
```

因此：

```text
D调笛：
1 = D5
筒音 = 低音5 = A4

E调笛：
1 = E5
筒音 = 低音5 = B4 = 493.88Hz
```

公式：

```ts
function getPhysicalTubeMidi(diziKey: DiziKey, baseOctave = 5): number {
  const tonicWhenTubeAs5 = noteToMidi(diziKey, baseOctave)

  // 筒音作5时，筒音是低音5
  return tonicWhenTubeAs5 + MAJOR_SCALE[5] - 12
}
```

---

### 5.6 根据筒音作几计算“中音1”

这里使用规则：

```text
中音1 = 第一个大于或等于物理筒音的 1
```

代码：

```ts
function getMiddleTonicMidiByTubeAs(
  tubeMidi: number,
  tubeAs: 1 | 2 | 5
): number {
  const interval = MAJOR_SCALE[tubeAs]

  let tonicMidi = tubeMidi - interval

  while (tonicMidi < tubeMidi) {
    tonicMidi += 12
  }

  return tonicMidi
}
```

例子，D 调笛筒音 A4：

| 指法 | 筒音含义 | 中音1 |
|---|---|---|
| 筒音作5 | A4 = 低音5 | D5 |
| 筒音作2 | A4 = 低音2 | G5 |
| 筒音作1 | A4 = 1 | A4 |

---

### 5.7 根据音域模板生成目标音

```ts
function buildDiziTargets(params: {
  diziKey: DiziKey
  fingeringProfileId: 'tube_as_5' | 'tube_as_2' | 'tube_as_1'
  baseOctave?: number
  a4?: number
}) {
  const {
    diziKey,
    fingeringProfileId,
    baseOctave = 5,
    a4 = 440,
  } = params

  const profile = FINGERING_PROFILES[fingeringProfileId]

  const tubeMidi = getPhysicalTubeMidi(diziKey, baseOctave)
  const middleTonicMidi = getMiddleTonicMidiByTubeAs(
    tubeMidi,
    profile.tubeAs
  )

  return profile.rangeTemplate.map(item => {
    const midi =
      middleTonicMidi +
      MAJOR_SCALE[item.degree] +
      item.octaveShift * 12

    return {
      id: item.id,
      label: item.label,
      degree: item.degree,
      octaveShift: item.octaveShift,
      midi,
      frequencyHz: midiToFreq(midi, a4),
    }
  })
}
```

---

## 6. 实时检测使用逻辑

实时检测模式：

```text
当前频率 currentFreq
  ↓
读取当前调性 + 指法的 target 列表
  ↓
计算 currentFreq 到每个 target 的 cents 差
  ↓
选择绝对值最小的 target
  ↓
显示 label / target frequency / cents
```

代码：

```ts
function findNearestTarget(currentFreq: number, targets: DiziTarget[]) {
  let best: null | (DiziTarget & { cents: number }) = null

  for (const target of targets) {
    const cents = centsDiff(currentFreq, target.frequencyHz)

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

## 7. 指定音练习使用逻辑

指定音练习模式：

```text
用户选择 targetId
  ↓
从当前调性 + 指法的 targets 中找到目标
  ↓
只和该目标频率比较
```

代码：

```ts
function checkAgainstTarget(
  currentFreq: number,
  target: DiziTarget
) {
  return {
    ...target,
    cents: centsDiff(currentFreq, target.frequencyHz),
  }
}
```

---

## 8. UI 使用方式

页面上增加一个“指法”选择器：

```text
笛子：[D调笛 ▼]
指法：[筒音作5 ▼]
模式：[实时检测] [指定音练习]
```

指法选项：

```text
筒音作5
筒音作2
筒音作1
```

当用户切换笛子或指法时：

```text
重新加载 targets
刷新目标音下拉列表
清空当前检测结果
```

---

## 9. 配置读取建议

前端可以直接读取 JSON：

```ts
import config from './dizi_fingering_range_config.json'

function getTargets(
  diziKey: string,
  fingeringProfileId: string
) {
  return config.resolvedRanges[diziKey][fingeringProfileId].targets
}
```

如果你希望减少 JSON 体积，也可以只保留：

```text
diziKeys
fingeringProfiles
noteSystem
```

然后运行时用 `buildDiziTargets()` 动态生成。

当前 JSON 同时保留了模板和 resolvedRanges，适合：

```text
1. 前端直接读取
2. 开发调试
3. 算法验收
4. 后续改成动态生成
```

---

## 10. 后续扩展建议

### 10.1 支持更多调性

新增：

```text
A调笛
Bb调笛
```

只需要：

1. 在 `diziKeys` 增加调性
2. 确保 `majorScaleSpellings` 中有对应主音拼写
3. 重新生成 `resolvedRanges`

### 10.2 支持更多指法体系

新增指法时，不要改主算法，只新增：

```json
{
  "id": "tube_as_6",
  "name": "筒音作6",
  "tubeAs": 6,
  "rangeTemplate": []
}
```

然后配置该指法的可用音域模板。

### 10.3 支持物理指法图

如果后续要显示六孔图，不建议和当前音高算法混在一起。

可以给 target 增加：

```ts
type HoleState = 'closed' | 'open' | 'half'

type PhysicalFingering = {
  holes: HoleState[]
  difficulty: 'normal' | 'half_hole' | 'fork' | 'overblow'
  comment?: string
}
```

---

## 11. 结论

最终数据模型是：

```text
DiziKey
  ↓
FingeringProfile
  ↓
RangeTemplate
  ↓
ResolvedTargets
```

不要把三套指法理解成三把不同音域的笛子。

正确方式是：

```text
每个指法体系单独维护标签模板
每个调性先确定筒音物理音高
算法按“筒音作几”转成实际音名和频率
```

这样可以满足：

```text
不同调
不同指法
同一音域上下界里的不同简谱命名
```

同时仍然保持前端实现简单。
