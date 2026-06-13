# 笛子音准测试 H5

[![Deploy GitHub Pages](https://github.com/ywandy/dizhi-tunner/actions/workflows/deploy.yml/badge.svg)](https://github.com/ywandy/dizhi-tunner/actions/workflows/deploy.yml)

[English](README.en.md)

一个移动端优先的纯 Web 笛子音准测试工具。它通过浏览器麦克风实时识别音高，显示当前频率、最近 1 秒平均频率、目标频率和 cents 偏差，帮助笛子练习者快速判断音准。

![笛子音准测试界面预览](docs/dizi-tuner-preview.png)

## 在线体验

- Cloudflare Pages: [https://ditune.ywandy.top/](https://ditune.ywandy.top/)
- GitHub Pages 旧地址: [https://ywandy.github.io/dizhi-tunner/](https://ywandy.github.io/dizhi-tunner/)

使用前请允许浏览器访问麦克风。建议在 Chrome、Edge 或 Safari 中打开。

## 功能特点

- 支持 `C / D / E / F / G` 调笛，默认 `D 调笛`
- 支持 `筒音作5 / 筒音作2 / 筒音作1` 三套筒音转调指法
- 采用调名第 5 八度作为换算基准，例如 `E 调笛 · 筒音作5` 的 `低音5` 为 `B4 / 493.88Hz`
- 支持实时检测和指定音练习两种模式
- 电平表显示实时 cents 偏差：中间为 `0`，左侧偏低，右侧偏高
- 最近 1 秒滚动平均频率用于稳定音准评价
- 停止吹奏或无稳定音高时，电平表平滑回到中心
- 自动记住上次选择的调性、指法、模式和目标音
- 纯前端实现，无后端、无登录、无录音上传

## 技术栈

- React + Vite + TypeScript
- Tailwind CSS + shadcn-style UI components
- `pitchy` 音高检测
- Vitest + Testing Library
- GitHub Actions + Cloudflare Pages

## 本地开发

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

## Expo App 壳

本仓库包含一个 Expo iOS/Android App 壳，位于 `apps/mobile`。它会把当前 H5 构建产物打包进 App，并通过本地 WebView 离线运行。

首次安装依赖：

```bash
pnpm install
```

打包离线 H5 资源：

```bash
pnpm mobile:pack
```

运行离线原生 App：

```bash
pnpm mobile:ios
pnpm mobile:android
```

开发期也可以让 iOS App 壳直接加载 Vite dev server，跳过本地 `dist`/`h5.zip`：

```bash
pnpm dev
pnpm mobile:ios:dev
```

其中：

- `pnpm mobile:ios:dev` 默认把 WebView 指向 `http://localhost:5173`，适合 iOS Simulator。
- 真机调试时，先保持 `pnpm dev` 运行，再使用局域网地址覆盖：

```bash
EXPO_PUBLIC_WEBVIEW_DEV_URL=http://你的电脑局域网IP:5173 pnpm mobile:ios:dev
```

补充说明：

- `pnpm mobile:pack` 会使用移动端相对路径构建 Vite 产物，并生成 `apps/mobile/assets/h5.zip`。
- `pnpm mobile:ios` / `pnpm mobile:android` 会先执行 `pnpm mobile:pack`，并清空 dev URL，确保加载打包进 App 的离线 H5。
- 配置了 `EXPO_PUBLIC_WEBVIEW_DEV_URL` 时，App 会优先加载该 dev 地址，不会启动本地静态服务。
- App 启动后会申请麦克风权限，并在 WebView 中加载内置 H5 或配置的 dev 地址。
- 麦克风采集依赖 iOS/Android WebView 对 `getUserMedia` 的支持，最终效果需要用真机或 EAS development build 验证；Expo Go 不能完整代表生产行为。
- 当前 App 名称、Bundle ID 和 Android package 使用占位配置，正式发布前需要替换。

## 音准计算

音分偏差使用标准 cents 公式：

```ts
cents = 1200 * Math.log2(currentFreq / targetFreq)
```

判断阈值：

- `<= 5 cents`: 很准
- `<= 10 cents`: 基本准
- `<= 20 cents`: 略高或略低
- `> 20 cents`: 明显偏高或偏低

## 部署

推送到 `main` 后，GitHub Actions 会自动执行：

1. 安装依赖
2. 运行测试
3. 运行类型检查
4. 构建静态产物
5. 发布到 Cloudflare Pages
