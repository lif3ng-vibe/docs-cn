# Handy 文档站中文镜像（非官方翻译）

将 [Handy](https://github.com/cjpais/Handy) 官方文档站 handy.computer 的文档汉化，并部署于 GitHub Pages 子路径。

> 本仓库是社区中文翻译，非官方出品。以官方英文站为准，译文可能滞后于上游更新。
> 下载相关引导统一指向官方下载页：<https://handy.computer/download>

- 上游网站仓库：https://github.com/cjpais/handy.computer
- 上游快照 commit：6e48765ba31b68af30ab8646f402f41cad1a745f（2026-10-24）
- 技术栈：Astro 5.8.1 + React + Tailwind CSS 4（原班工程，仅中文化）
- 部署路径：https://lif3ng-vibe.github.io/docs-cn/handy/

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/docs-cn/handy/
npm run build    # 产物在 dist/
```

## 汉化范围

- 13 篇文档正文 + About/Buttons/Privacy 页 + 落地页
- 组件 UI 文案、aria-label、视频文字稿
- 下载页未收录：下载相关引导统一指向官方下载页
