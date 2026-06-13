# 竹笛洞洞谱功能 PRD

## 1. 功能名称

洞洞谱

## 2. 背景

当前产品已有竹笛音准检测相关能力，后续希望增加一个独立的“洞洞谱”功能，让用户可以把数字谱转换为竹笛洞洞谱，也可以直接手动编排洞洞谱。

该功能不是单纯的“简谱转换器”，而是一个本地化的竹笛洞洞谱编辑和管理工具。用户可以新建洞洞谱、保存到浏览器本地、打开历史乐谱、导入 JSON、导出 JSON。

## 3. 功能目标

### 3.1 核心目标

用户可以在浏览器中完成以下操作：

1. 新建洞洞谱
2. 从数字谱自动生成洞洞谱
3. 手动编排洞洞谱
4. 保存洞洞谱到浏览器本地
5. 从本地乐谱库打开洞洞谱
6. 导出洞洞谱 JSON
7. 导入洞洞谱 JSON
8. 根据不同新建方式进入不同编辑器

### 3.2 非目标

第一版暂不做：

1. 用户账号和云端同步
2. 图片钢琴谱识别
3. MIDI 导入
4. 乐声识别生成洞洞谱
5. 复杂节奏编辑
6. 多声部编排
7. PDF 导出
8. 打印排版
9. 社区乐谱分享

## 4. 用户角色

### 4.1 初学者

手里有数字谱，希望快速看到竹笛洞洞谱，不想理解太多乐理。

### 4.2 竹笛学习者

想保存常练曲子，后续反复打开练习。

### 4.3 教学者

想手动编排洞洞谱，用于教学、截图、分享。

### 4.4 进阶用户

希望修改默认指法，手动处理半孔、叉口、特殊指法。

## 5. 功能入口

主入口名称：

```text
洞洞谱
```

进入后展示：

```text
洞洞谱首页
├─ 新建
├─ 导入 JSON
└─ 本地乐谱列表
```

点击“新建”后展示两个入口：

```text
新建洞洞谱
├─ 从数字谱编排
└─ 编排洞洞谱
```

## 6. 页面结构

### 6.1 洞洞谱首页

#### 页面目标

展示本地保存的洞洞谱，支持新建、打开、导入、导出、删除。

#### 页面元素

```text
标题：洞洞谱

操作区：
[新建] [导入 JSON]

本地乐谱列表：
- 乐谱标题
- 类型：从数字谱编排 / 手动洞洞谱
- 配置信息
- 简短预览
- 更新时间
- 操作按钮：打开 / 导出 / 删除
```

#### 空状态

当没有本地乐谱时，展示：

```text
还没有保存的洞洞谱
可以从数字谱生成，也可以手动编排一份洞洞谱
[新建洞洞谱]
```

---

### 6.2 新建方式选择页

#### 页面目标

让用户选择洞洞谱创建方式。

#### 页面元素

```text
新建洞洞谱

卡片一：
标题：从数字谱编排
说明：输入 1 2 3 5 6 5，自动生成竹笛洞洞谱
按钮：开始编排

卡片二：
标题：编排洞洞谱
说明：直接选择洞洞指法，自由制作洞洞谱
按钮：开始编排
```

#### 交互

点击“从数字谱编排”进入数字谱编辑器。

点击“编排洞洞谱”进入手动洞洞谱编辑器。

---

## 7. 新建方式一：从数字谱编排

### 7.1 功能说明

用户输入数字谱，选择曲谱调、笛子调、筒音指法，系统自动生成洞洞谱。

该模式中，数字谱是源内容，洞洞谱是计算结果。

### 7.2 页面结构

```text
从数字谱编排

乐谱名称：
[小星星________]

配置：
曲谱调：[G]
笛子调：[G调笛]
筒音：[筒音作5]

数字谱输入：
[多行输入框]

简谱键盘：
低  .1 .2 .3 .4 .5 .6 .7
中   1  2  3  4  5  6  7
高  1' 2' 3' 4' 5' 6' 7'
符   #  b  0  -  |
辑   空格  换行  删除  清空

转换结果：
- 简谱音
- 真实音高
- 洞洞谱
- 指法备注
- 警告和错误

操作：
[保存] [导出 JSON] [返回]
```

### 7.3 输入规则

第一版支持：

```text
1 2 3 4 5 6 7        中音
.1 .2 .3 .4 .5 .6 .7 低音
1' 2' 3' 4' 5' 6' 7' 高音
#4 b7                升降音
0                    休止
-                    延音
|                    小节线
换行                  分行
```

### 7.4 简谱键盘交互

按钮布局：

```text
低  .1 .2 .3 .4 .5 .6 .7
中   1  2  3  4  5  6  7
高  1' 2' 3' 4' 5' 6' 7'
符   #  b  0  -  |
辑   空格  换行  删除  清空
```

点击音符后，在光标位置插入对应 token，并自动追加空格。

示例：

```text
点 1   -> 插入 "1 "
点 .5  -> 插入 ".5 "
点 5'  -> 插入 "5' "
点 -   -> 插入 "- "
点 |   -> 插入 "| "
```

升降号交互：

```text
点 # 后，# 进入高亮状态
再点 4，插入 "#4 "
插入后 # 状态取消

点 b 后，b 进入高亮状态
再点 7，插入 "b7 "
插入后 b 状态取消
```

删除逻辑：

```text
删除光标前一个完整 token，而不是删除单个字符
```

例如：

```text
当前输入：1 2 #4 5'
点击删除：1 2 #4
再次删除：1 2
```

### 7.5 实时转换

当以下内容变化时，自动重新生成洞洞谱：

```text
数字谱内容
曲谱调
笛子调
筒音指法
```

页面不需要“开始转换”按钮。

转换流程：

```text
数字谱文本
↓
解析 token
↓
计算真实音高
↓
匹配笛子指法
↓
生成洞洞谱结果
```

### 7.6 转换结果展示

每个音展示为一个结果卡片：

```text
简谱：1
音高：G4
洞洞：●●●○○○
备注：中音1
```

对于休止符：

```text
简谱：0
备注：休止
```

对于延音：

```text
简谱：-
备注：延音
```

对于小节线：

```text
|
```

### 7.7 错误提示

需要处理：

1. 非法符号
2. 找不到指法
3. 超出当前笛子音域
4. 暂不支持的输入格式

示例：

```text
“x” 暂时识别不了，可以输入 1-7、0、-、|
该音 C3 低于 G调笛常用音域
该音 F4 暂无默认指法，可能需要半孔或替代指法
```

### 7.8 保存逻辑

点击“保存”：

如果是新乐谱：

```text
创建 SavedScore
写入 localStorage
设置 currentScoreId
dirty = false
提示：已保存
```

如果是已保存乐谱：

```text
更新当前 SavedScore
updatedAt = 当前时间
dirty = false
提示：已更新
```

---

## 8. 新建方式二：编排洞洞谱

### 8.1 功能说明

用户不输入数字谱，而是直接选择洞洞谱指法卡片进行编排。

该模式中，洞洞谱本身就是源内容。

适合：

1. 教学演示
2. 特殊指法
3. 半孔、叉口、替代指法
4. 用户只想记录一段指法
5. 不想从数字谱自动转换

### 8.2 页面结构

```text
编排洞洞谱

乐谱名称：
[练习曲一________]

配置：
笛子调：[G调笛]
筒音：[筒音作5]

洞洞谱内容区：
[●●●●●●] [●●●●●○] [●●●●○○] [|]
[●●●○○○] [●●○○○○] [-]

指法键盘：
低音：
[低5] [低6] [低7]

中音：
[1] [2] [3] [4] [5] [6] [7]

高音：
[高1] [高2] [高3] [高4] [高5] [高6] [高7]

符号：
[休止] [延音] [小节线] [换行]

编辑：
[删除] [清空]

当前选中项：
简谱标记：[5]
音高标记：[D4]
备注：[筒音]

操作：
[保存] [导出 JSON] [返回]
```

### 8.3 指法键盘

每个指法按钮展示：

```text
音名 / 简谱名
洞洞图
```

示例：

```text
中音1
●●●○○○
```

点击后向洞洞谱内容区插入一个 item。

### 8.4 洞洞谱内容区

洞洞谱内容区展示一组可编辑 item。

item 类型包括：

```text
note   指法音
rest   休止
hold   延音
bar    小节线
lineBreak 换行
```

点击某个 item 后，可以编辑：

```text
简谱显示名
真实音高
备注
```

第一版可以先不支持拖拽排序，只支持：

```text
插入
选中
删除
清空
```

### 8.5 保存逻辑

点击保存后，将当前 holeScore.items 保存到本地。

手动编排模式不依赖 source.text。

---

## 9. 本地乐谱库

### 9.1 本地保存方式

第一版使用 localStorage。

存储 key：

```text
dizi-hole-score-library-v1
```

### 9.2 列表展示字段

每条乐谱展示：

```text
标题
模式：从数字谱编排 / 手动洞洞谱
配置：G调谱 / G调笛 / 筒音作5
预览
更新时间
操作：打开 / 导出 / 删除
```

### 9.3 打开乐谱

点击“打开”：

```text
读取 SavedScore
根据 mode 判断编辑器类型
mode = jianpu-generated -> 打开从数字谱编排编辑器
mode = manual-hole-score -> 打开编排洞洞谱编辑器
恢复标题、配置、内容
dirty = false
```

如果当前内容未保存，打开前提醒：

```text
当前内容还没保存，确定打开其他乐谱吗？
[取消] [继续打开]
```

### 9.4 删除乐谱

点击“删除”：

```text
确认删除《乐谱名》？
[取消] [删除]
```

删除后从 localStorage 移除。

如果删除的是当前正在编辑的乐谱：

```text
currentScoreId = null
dirty = true
```

页面内容保留，但不再绑定本地乐谱。

---

## 10. 导出 JSON

### 10.1 功能说明

用户可以将当前洞洞谱导出为 JSON 文件，用于备份、分享、跨设备导入。

### 10.2 入口

支持两个位置导出：

1. 编辑器内导出当前乐谱
2. 本地乐谱列表中导出某一首

### 10.3 文件名

```text
{乐谱标题}.dizi-hole-score.json
```

如果没有标题：

```text
未命名乐谱.dizi-hole-score.json
```

### 10.4 导出内容

导出完整 SavedScore，不只导出洞洞谱结果。

原因：

1. 导入后可以继续编辑
2. 可以恢复配置
3. 数字谱模式可以重新生成洞洞谱
4. 后续指法表更新后，可以基于原始内容重新计算

---

## 11. 导入 JSON

### 11.1 功能说明

用户可以导入 `.dizi-hole-score.json` 文件。导入后保存到本地乐谱库，并自动打开。

### 11.2 导入流程

```text
用户点击导入 JSON
↓
选择文件
↓
读取文件文本
↓
JSON.parse
↓
校验格式
↓
生成新 id
↓
写入 localStorage
↓
根据 mode 打开对应编辑器
↓
提示：已导入
```

### 11.3 导入校验

必须校验：

```text
schemaVersion 是否支持
type 是否为 dizi-hole-score
mode 是否存在
title 是否存在
config 是否存在
holeScore 是否存在
```

数字谱模式还需要校验：

```text
source.kind = jianpu
source.text 存在
config.scoreKey 存在
config.fluteKey 存在
config.fingeringMode 存在
```

手动编排模式还需要校验：

```text
source.kind = manual-hole-score
holeScore.items 存在
```

### 11.4 导入冲突处理

第一版导入时永远生成新 id，不覆盖本地已有乐谱。

如果导入标题重复，可以自动改名：

```text
小星星（导入）
```

### 11.5 错误提示

```text
这个文件不是有效的洞洞谱 JSON
这个 JSON 不是竹笛洞洞谱文件
这个乐谱版本暂不支持
乐谱文件缺少数字谱内容，无法导入
乐谱文件缺少洞洞谱内容，无法导入
```

---

## 12. SavedScore 数据结构

### 12.1 公共结构

```ts
export type ScoreMode = "jianpu-generated" | "manual-hole-score";

export type SavedScore = {
  schemaVersion: 1;
  type: "dizi-hole-score";
  id: string;
  title: string;
  mode: ScoreMode;
  createdAt: string;
  updatedAt: string;
  config: ScoreConfig;
  source: ScoreSource;
  holeScore: HoleScore;
  meta?: {
    appName?: string;
    appVersion?: string;
    converterVersion?: string;
  };
};
```

### 12.2 数字谱模式

```ts
export type JianpuGeneratedScore = SavedScore & {
  mode: "jianpu-generated";
  config: {
    scoreKey: "C" | "D" | "E" | "F" | "G" | "A" | "Bb";
    fluteKey: "C" | "D" | "E" | "F" | "G" | "A" | "Bb";
    fingeringMode: "tube-as-5";
  };
  source: {
    kind: "jianpu";
    text: string;
  };
};
```

### 12.3 手动洞洞谱模式

```ts
export type ManualHoleScore = SavedScore & {
  mode: "manual-hole-score";
  config: {
    fluteKey?: "C" | "D" | "E" | "F" | "G" | "A" | "Bb";
    fingeringMode?: "tube-as-5";
  };
  source: {
    kind: "manual-hole-score";
  };
};
```

### 12.4 HoleScore

```ts
export type HoleScore = {
  items: HoleScoreItem[];
  warnings?: string[];
  errors?: string[];
};

export type HoleScoreItem =
  | HoleNoteItem
  | HoleRestItem
  | HoleHoldItem
  | HoleBarItem
  | HoleLineBreakItem;

export type HoleNoteItem = {
  type: "note";
  raw?: string;
  displayName?: string;
  pitch?: string;
  midi?: number;
  fingering: {
    label: string;
    holes: Array<"closed" | "open" | "half">;
    remark?: string;
  };
  warnings?: string[];
  errors?: string[];
};

export type HoleRestItem = {
  type: "rest";
  raw: "0";
};

export type HoleHoldItem = {
  type: "hold";
  raw: "-";
};

export type HoleBarItem = {
  type: "bar";
  raw: "|";
};

export type HoleLineBreakItem = {
  type: "lineBreak";
};
```

---

## 13. 示例 JSON

### 13.1 从数字谱编排

```json
{
  "schemaVersion": 1,
  "type": "dizi-hole-score",
  "id": "score_1718262000000",
  "title": "小星星",
  "mode": "jianpu-generated",
  "createdAt": "2026-06-13T03:20:00.000Z",
  "updatedAt": "2026-06-13T03:20:00.000Z",
  "config": {
    "scoreKey": "G",
    "fluteKey": "G",
    "fingeringMode": "tube-as-5"
  },
  "source": {
    "kind": "jianpu",
    "text": "1 1 5 5 6 6 5 -\n4 4 3 3 2 2 1 -"
  },
  "holeScore": {
    "items": []
  },
  "meta": {
    "appName": "竹笛洞洞谱生成器",
    "appVersion": "0.1.0",
    "converterVersion": "0.1.0"
  }
}
```

### 13.2 手动编排洞洞谱

```json
{
  "schemaVersion": 1,
  "type": "dizi-hole-score",
  "id": "score_1718263000000",
  "title": "练习曲一",
  "mode": "manual-hole-score",
  "createdAt": "2026-06-13T03:30:00.000Z",
  "updatedAt": "2026-06-13T03:30:00.000Z",
  "config": {
    "fluteKey": "G",
    "fingeringMode": "tube-as-5"
  },
  "source": {
    "kind": "manual-hole-score"
  },
  "holeScore": {
    "items": [
      {
        "type": "note",
        "displayName": "低音5",
        "pitch": "D4",
        "midi": 62,
        "fingering": {
          "label": "●●●●●●",
          "holes": ["closed", "closed", "closed", "closed", "closed", "closed"],
          "remark": "筒音"
        }
      },
      {
        "type": "bar",
        "raw": "|"
      },
      {
        "type": "hold",
        "raw": "-"
      }
    ]
  },
  "meta": {
    "appName": "竹笛洞洞谱生成器",
    "appVersion": "0.1.0"
  }
}
```

---

## 14. 编辑状态

编辑器统一维护：

```ts
type EditorState = {
  currentScoreId: string | null;
  mode: "jianpu-generated" | "manual-hole-score";
  title: string;
  dirty: boolean;
};
```

数字谱编辑器额外维护：

```ts
type JianpuEditorState = {
  text: string;
  scoreKey: string;
  fluteKey: string;
  fingeringMode: string;
};
```

手动洞洞谱编辑器额外维护：

```ts
type ManualEditorState = {
  items: HoleScoreItem[];
  selectedItemIndex: number | null;
  fluteKey?: string;
  fingeringMode?: string;
};
```

dirty 规则：

当以下内容变化时，dirty = true：

```text
标题
数字谱内容
洞洞谱 items
曲谱调
笛子调
筒音指法
单个 item 的备注
```

当以下操作成功后，dirty = false：

```text
保存成功
打开本地乐谱成功
导入并打开成功
```

导出 JSON 不改变 dirty。

---

## 15. 技术模块拆分

建议新增：

```text
src/core/score/scoreTypes.ts
src/core/score/createScore.ts
src/core/score/scoreStorage.ts
src/core/score/exportScore.ts
src/core/score/importScore.ts
src/core/score/scoreValidator.ts

src/pages/HoleScoreHome.tsx
src/pages/NewHoleScorePage.tsx
src/pages/JianpuHoleScoreEditor.tsx
src/pages/ManualHoleScoreEditor.tsx

src/components/JianpuKeyboard.tsx
src/components/HoleFingeringKeyboard.tsx
src/components/HoleScorePreview.tsx
src/components/ScoreLibraryList.tsx
src/components/ScoreActionBar.tsx
```

---

## 16. 核心方法

### 16.1 本地存储

```ts
listScores(): SavedScoreSummary[]

getScore(id: string): SavedScore | null

saveScore(score: SavedScore): void

deleteScore(id: string): void

upsertScore(score: SavedScore): void
```

### 16.2 JSON 导出

```ts
downloadScoreJson(score: SavedScore): void
```

### 16.3 JSON 导入

```ts
readScoreFromFile(file: File): Promise<SavedScore>

validateScoreJson(data: unknown): SavedScore
```

### 16.4 创建乐谱

```ts
createJianpuGeneratedScore(input): JianpuGeneratedScore

createManualHoleScore(input): ManualHoleScore
```

---

## 17. 验收标准

### 17.1 洞洞谱首页

1. 可以看到本地保存的洞洞谱列表
2. 没有乐谱时展示空状态
3. 可以点击新建
4. 可以导入 JSON
5. 乐谱项可以打开、导出、删除

### 17.2 从数字谱编排

1. 可以输入数字谱
2. 可以通过专用键盘输入低音、中音、高音
3. 可以选择曲谱调、笛子调、筒音
4. 输入变化后能实时生成洞洞谱
5. 可以保存到本地
6. 刷新页面后本地乐谱仍然存在
7. 可以导出 JSON
8. 打开后能恢复数字谱和配置

### 17.3 编排洞洞谱

1. 可以通过指法键盘插入洞洞谱 item
2. 可以插入休止、延音、小节线、换行
3. 可以删除 item
4. 可以保存到本地
5. 可以导出 JSON
6. 打开后能恢复洞洞谱内容

### 17.4 导入 JSON

1. 正确的 JSON 可以导入
2. 导入后出现在本地乐谱列表
3. 导入后自动打开对应编辑器
4. 错误 JSON 有友好提示
5. 不支持的版本有提示
6. 导入不会覆盖已有乐谱

### 17.5 数据安全

1. 加载其他乐谱前，如果当前内容未保存，需要提醒
2. 删除乐谱前需要确认
3. 导出不改变 dirty 状态
4. 保存成功后 dirty = false

---

## 18. 第一版开发优先级

### P0

1. SavedScore 数据结构
2. localStorage 保存和读取
3. 洞洞谱首页
4. 新建方式选择
5. 从数字谱编排编辑器
6. 简谱键盘
7. 实时转换
8. 保存本地乐谱
9. 打开本地乐谱

### P1

1. 导出 JSON
2. 导入 JSON
3. 删除确认
4. dirty 未保存提醒
5. 本地乐谱列表优化

### P2

1. 编排洞洞谱编辑器
2. 指法键盘
3. 手动 item 编辑
4. 手动洞洞谱保存和导出

### P3

1. JSON 版本兼容
2. 搜索本地乐谱
3. 乐谱复制
4. 更好的导出文件名
5. 本地备份和恢复

---

## 19. 可以给开发模型的任务描述

```text
请实现“洞洞谱”功能。

功能结构：
1. 洞洞谱首页
2. 新建洞洞谱
3. 从数字谱编排
4. 编排洞洞谱
5. 本地乐谱库
6. 导入 JSON
7. 导出 JSON

新建洞洞谱时有两个入口：
- 从数字谱编排：输入数字谱，系统自动生成洞洞谱
- 编排洞洞谱：用户直接选择洞洞指法进行手动编排

要求：
1. 使用统一 SavedScore JSON 数据结构
2. SavedScore 需要包含 schemaVersion、type、id、title、mode、createdAt、updatedAt、config、source、holeScore、meta
3. mode 支持 jianpu-generated 和 manual-hole-score
4. 本地保存使用 localStorage
5. 导出 JSON 时导出完整 SavedScore
6. 导入 JSON 时校验格式，生成新 id，保存到本地并自动打开
7. 根据 mode 打开对应编辑器
8. 数字谱编辑器支持简谱键盘
9. 手动洞洞谱编辑器支持指法键盘
10. 加载其他乐谱前，如果当前内容未保存，需要提示
11. 删除乐谱前需要确认
12. 导出 JSON 不改变 dirty 状态
```
