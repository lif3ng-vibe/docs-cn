# hallmark-docs-cn — Hallmark 官网中文镜像

[usehallmark.com](https://www.usehallmark.com/)（Nutlope/hallmark，MIT）的非官方中文镜像：一个面向 Claude Code、Codex、Cursor 与 OpenCode 的设计 skill（终结 AI 味）的产品站。

- **源**：https://github.com/Nutlope/hallmark `main@6033bab`（2026-10-28 快照）
- **形态**：上游原班工具链——纯静态 HTML/CSS/JS，无构建步骤。`site/` 即整站，相对路径引用，子路径部署零改造
- **范围**：73 页全量汉化（主页 + 50 个主题页 + 21 个 made 作品页）+ 新增 `readme/` 页（官方 README 完整中文版）；全部交互保留并汉化（headline 校对动画「消除→终结」、fan 发牌、compare 对比滑块、主题筛选与预览 dialog、wheel 转盘、各页 scene/page/外部 JS 的可见文案）
- **术语**：见 [GLOSSARY.md](GLOSSARY.md)（AI slop→AI 味、theme→主题、material→材质等；主题名/虚构品牌名/命令不译）
- **许可**：上游 MIT（见 [upstream/LICENSE](upstream/LICENSE)）；翻译部分同样以 MIT 发布。非官方译本，以英文原文为准

## 本地运行

```bash
node tools/serve.cjs site 4175
# 或任何静态伺服：python -m http.server --directory site 4173
```

访问 http://127.0.0.1:4175/。无构建步骤；`tools/` 是管线辅助（残留扫描、伺服），不随站点部署。

## 部署

并入 [docs-cn](https://github.com/lif3ng-vibe/docs-cn) hub，部署于 `https://lif3ng-vibe.github.io/docs-cn/hallmark/`（CI 直接 `mv site → _site/hallmark`，无构建缓存）。
