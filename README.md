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
- 支持实时检测和指定音练习两种模式
- 电平表显示实时 cents 偏差：中间为 `0`，左侧偏低，右侧偏高
- 最近 1 秒滚动平均频率用于稳定音准评价
- 停止吹奏或无稳定音高时，电平表平滑回到中心
- 自动记住上次选择的调性、模式和目标音
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
