# agency-agents-docs-cn

[msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) 的非官方中文翻译镜像——一支 300+ 专业智能体组成的"代理公司"（The Agency）完整名册与 NEXUS 战略手册，以可阅读的静态文档站呈现。

## 本地运行

```bash
# 前置要求：Node.js >= 22.12.0、npm >= 9.6.5
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
npm run preview  # 本地预览构建产物
```

## 项目结构

```
astro.config.mjs          # 站点配置：zh-CN root locale + 22 组中文侧边栏
src/content/docs/         # 全部译文（326 篇 Markdown + 落地页）
├── index.md              # 中文落地页（自撰）
├── catalog.md            # 上游 README 名册目录
├── <division>/…          # 18 个部门的 agent 定义（结构照抄上游，锚点已按中文标题重算）
├── strategy/…            # NEXUS 战略手册：playbooks / runbooks / coordination
├── examples/…            # 多智能体协作用例全记录
└── integrations/<tool>/… # 18 种工具（Claude Code/Codex/Cursor/…）安装说明
_snapshot/agency-agents-main/  # 上游快照（对照用，不参与构建）
scripts/import-sources.mjs     # 快照 → 文档目录导入脚本（补 title frontmatter）
scripts/check-anchors.mjs      # 构建产物锚点校验
scripts/fix-bold-cjk.mjs       # CJK 粗体闭合修复（**句。**文字 → **句**。文字）
GLOSSARY.md               # 术语表（并行子代理注入材料 + 终检清单）
TRANSLATION-SPEC.md       # 翻译规范
```

## 翻译口径

- 纯中文单语；术语意译为主，首次出现附英文原词（如「名册（roster）」）
- 不译：代码块（含其中英文注释）、命令、路径、产品/工具名（Claude Code、Cursor、Roblox、GaussDB…）、frontmatter 键名
- 全站统一术语见 [GLOSSARY.md](GLOSSARY.md)
- 校验：`npm run build` 零错误 + 全站页内锚点校验（`scripts/check-anchors.mjs`）+ 译文残留检查 + 渲染产物无字面 `**`

## 非官方翻译声明

- 本项目是快照式一次性翻译，**不与上游自动同步**；需要同步时以 `_snapshot/` 与上游 diff（见下）
- **源仓库**：https://github.com/msitarzewski/agency-agents
- **上游快照**：`main` 分支 commit `f99f6aa910a442b0197b768ce0ea7751e35e2060`（2026-10-08）
- 内容版权归原作者所有；译文与站点工程遵循上游仓库同款开源许可（见 `_snapshot/agency-agents-main/LICENSE`）
- agent 定义本体是给智能体消费的功能性 prompt：阅读站内已全译便于理解，但**实际安装使用请以上游英文原版为准**（安装方法见站内「工具集成」各页，命令与上游一致）