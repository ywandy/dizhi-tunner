# 功能 PRD：编辑状态与安全保护

## 1. 功能目标

为洞洞谱编辑流程建立统一的编辑状态和安全保护规则，避免用户误丢未保存内容，并保证删除、打开、导入、返回等危险操作有明确反馈。

## 2. 编辑状态

两个编辑器共用基础状态：

```ts
type HoleScoreEditorState = {
  currentScoreId: string | null
  mode: 'jianpu-generated' | 'manual-hole-score'
  title: string
  dirty: boolean
}
```

数字谱编辑器额外状态：

```ts
type JianpuEditorState = {
  text: string
  scoreKey: DiziKey
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}
```

手动编辑器额外状态：

```ts
type ManualEditorState = {
  items: HoleScoreItem[]
  selectedItemIndex: number | null
  fluteKey: DiziKey
  fingeringProfileId: FingeringProfileId
}
```

## 3. dirty 规则

以下变化设置 `dirty = true`：

- 标题变化
- 数字谱文本变化
- 曲谱调变化
- 笛子调变化
- 筒音指法变化
- 手动洞洞谱 items 变化
- 单个 item 的显示名、音高标记或备注变化

以下操作设置 `dirty = false`：

- 保存成功
- 打开本地乐谱成功
- 导入并打开成功

导出 JSON 不改变 `dirty`。

## 4. 未保存提醒

触发场景：

- 从编辑器返回首页。
- 打开另一首本地乐谱。
- 导入 JSON 后准备打开导入乐谱。
- 从数字谱模式切换到手动模式，或反向切换。

提示文案：

```text
当前内容还没保存，确定离开吗？
[取消] [继续]
```

如果操作目标是“打开其他乐谱”，文案可以更具体：

```text
当前内容还没保存，确定打开其他乐谱吗？
[取消] [继续打开]
```

## 5. 删除确认

删除乐谱前提示：

```text
确认删除《乐谱名》？
[取消] [删除]
```

删除后：

- 首页列表刷新。
- 如果删除的是当前正在编辑的乐谱，编辑器内容保留，`currentScoreId = null`，`dirty = true`。

## 6. 保存失败保护

保存失败时：

- 不改变 `dirty`。
- 不改变 `currentScoreId`。
- 展示明确错误。

提示示例：

```text
保存失败，浏览器可能限制了本地存储。可以先导出 JSON 备份。
```

## 7. 导入失败保护

导入失败时：

- 不覆盖当前编辑状态。
- 不写入本地乐谱库。
- 展示错误原因。

如果当前有未保存内容，导入前先走未保存提醒。

## 8. 浏览器关闭保护

当编辑器 `dirty = true` 时，可以注册 `beforeunload` 提醒，避免刷新或关闭页面导致内容丢失。

`beforeunload` 可以放在后续增强；第一版必须覆盖应用内返回、打开、导入和删除。

## 9. 反馈规则

| 操作 | 成功反馈 |
|---|---|
| 保存新乐谱 | 已保存 |
| 更新已有乐谱 | 已更新 |
| 删除乐谱 | 已删除 |
| 导入乐谱 | 已导入 |
| 导出乐谱 | 已导出 |

反馈不应遮挡主要编辑区域太久。

## 10. 验收标准

1. 编辑内容后 `dirty = true`。
2. 保存成功后 `dirty = false`。
3. 导出 JSON 不改变 `dirty`。
4. 未保存时返回首页会出现确认。
5. 未保存时打开其他乐谱会出现确认。
6. 删除乐谱前会出现确认。
7. 删除当前正在编辑的乐谱后，内容保留但不再绑定原 id。
8. 保存失败不会误标记为已保存。
9. 导入失败不会破坏当前编辑内容。
