# 功能 PRD：SavedScore 数据模型与本地乐谱库

## 1. 功能目标

建立洞洞谱的统一数据结构和浏览器本地乐谱库，让数字谱生成模式、手动编排模式、导入导出和打开历史乐谱都使用同一套 `SavedScore`。

## 2. 当前功能基础

当前项目已有 localStorage 使用经验：

- `src/core/preferences.ts` 使用 `dizi-tuner-preferences-v1` 保存偏好。
- 读取失败、JSON 异常、字段非法时会回退默认值。
- 存储失败不会阻断主流程。

洞洞谱本地库应沿用这种“安全解析、失败兜底、不影响页面可用”的风格。

## 3. 存储 key

```text
dizi-hole-score-library-v1
```

建议存储完整乐谱数组：

```ts
type ScoreLibrary = SavedScore[]
```

后续乐谱数量变大时，再考虑拆分索引和详情。

## 4. 数据结构

### 4.1 统一结构

```ts
type ScoreMode = 'jianpu-generated' | 'manual-hole-score'

type SavedScore = {
  schemaVersion: 1
  type: 'dizi-hole-score'
  id: string
  title: string
  mode: ScoreMode
  createdAt: string
  updatedAt: string
  config: ScoreConfig
  source: ScoreSource
  holeScore: HoleScore
  meta?: ScoreMeta
}
```

### 4.2 配置字段

为匹配当前代码，内部字段建议使用：

```ts
type DiziKey = 'C' | 'D' | 'E' | 'F' | 'G'
type FingeringProfileId = 'tube_as_5' | 'tube_as_2' | 'tube_as_1'

type JianpuGeneratedConfig = {
  scoreKey: DiziKey
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}

type ManualHoleScoreConfig = {
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}
```

原始 PRD 中的 `tube-as-5` 和 A / Bb 调不作为 P0 内部字段。若后续要兼容导入旧字段，可在导入校验层做映射。

### 4.3 内容结构

```ts
type HoleScore = {
  items: HoleScoreItem[]
  warnings?: string[]
  errors?: string[]
}

type HoleScoreItem =
  | HoleNoteItem
  | HoleRestItem
  | HoleHoldItem
  | HoleBarItem
  | HoleLineBreakItem
```

`HoleNoteItem` 至少包含：

```ts
type HoleNoteItem = {
  type: 'note'
  raw?: string
  displayName?: string
  pitch?: string
  midi?: number
  fingering: {
    label: string
    holes: Array<'closed' | 'open' | 'half'>
    remark?: string
  }
  warnings?: string[]
  errors?: string[]
}
```

## 5. 乐谱摘要

首页列表不需要展示全部 JSON，可以从 `SavedScore` 计算摘要：

| 字段 | 来源 |
|---|---|
| 标题 | `title`，空值展示“未命名乐谱” |
| 类型 | `mode` |
| 配置 | `config.scoreKey` / `config.fluteKey` / `config.fingeringProfileId` |
| 预览 | 前若干个 `holeScore.items` |
| 更新时间 | `updatedAt` |

## 6. 核心能力

| 方法 | 说明 |
|---|---|
| `listScores()` | 返回乐谱摘要或完整列表 |
| `getScore(id)` | 读取单首乐谱 |
| `saveScore(score)` | 新建或覆盖保存 |
| `deleteScore(id)` | 删除指定乐谱 |
| `createJianpuGeneratedScore(input)` | 创建数字谱模式乐谱 |
| `createManualHoleScore(input)` | 创建手动模式乐谱 |

## 7. 保存规则

新乐谱保存：

1. 生成 `id`。
2. 写入 `createdAt` 和 `updatedAt`。
3. 写入 localStorage。
4. 设置当前乐谱 id。
5. 标记 `dirty = false`。

已有乐谱保存：

1. 保留 `id` 和 `createdAt`。
2. 更新 `updatedAt`。
3. 覆盖本地同 id 乐谱。
4. 标记 `dirty = false`。

## 8. 打开规则

点击打开乐谱：

1. 从 localStorage 读取 `SavedScore`。
2. 根据 `mode` 判断编辑器类型。
3. 恢复标题、配置、源内容和 `holeScore.items`。
4. 设置 `currentScoreId`。
5. 标记 `dirty = false`。

## 9. 删除规则

删除前必须确认。删除后：

- 从 localStorage 移除。
- 如果删除的是当前正在编辑的乐谱，当前页面内容保留，但 `currentScoreId = null`，后续保存应视为新乐谱或提示用户另存。

## 10. 异常处理

| 场景 | 处理 |
|---|---|
| localStorage 不可用 | 页面仍可编辑，保存时提示失败 |
| JSON parse 失败 | 返回空乐谱库并提示本地数据异常 |
| 单条乐谱字段非法 | 跳过非法乐谱，保留其他乐谱 |
| 存储超额 | 保存失败并提示用户导出备份或删除旧乐谱 |

## 11. 验收标准

1. 可以保存数字谱模式乐谱。
2. 可以保存手动模式乐谱。
3. 刷新页面后，本地乐谱列表仍存在。
4. 点击打开能恢复正确编辑器和内容。
5. 点击删除能从本地库移除乐谱。
6. 非法本地数据不会导致洞洞谱首页白屏。
7. 保存失败时有明确提示。

