# agent-skills-docs-cn

**Agent Skills 官方站**（[skills.addy.ie](https://skills.addy.ie/)）的简体中文镜像，非官方翻译，一次性快照。

- 原站：https://skills.addy.ie/
- 站点工程源仓库：https://github.com/addyosmani/skills.addy.ie （快照 commit：`976c6fd`）
- 技能包上游仓库：https://github.com/addyosmani/agent-skills （快照 commit：`1401c8b`）
- 快照日期：2026-10-08
- 许可：MIT（翻译内容同样遵循）

## 范围与决策

- 原站是 Astro 5 纯静态营销/教程站（无框架运行时；正文在 `.astro` 页面与 `.ts` 数据文件里，**没有 markdown**）。
- 技能包本体（`skills/*/SKILL.md` 等英文提示词，在 agent-skills 仓库里）不参与翻译——它们是给智能体执行的功能性输入，翻译会破坏功能。详情页的「Read the full SKILL.md」仍指回原仓库。
- 教程里的 `prompt` 字段（复制进智能体的提示词）同样保持英文原文；其余说明文字（does/why/checkpoint/tip/intro 等）全译。
- `public/teach/` 下的 deck（`.html`/`.pptx`）、图示 SVG/PNG、贴纸等媒体资产保持英文原样、不重绘（站点界面上对它们的介绍文字已译）。
- skills 页过滤 `tags` 保留英文（过滤 token）。

## 部署形态（并入 docs-cn hub）

- `astro.config.mjs` 固定 `base: '/docs-cn/agent-skills/'`、site 指向 Pages 域；站内 authored 链接已在源码一次性写成带前缀的绝对路径，**dev 与 CI 产物一致，无需 env base，也无需 sed**。
- 产物 `dist/` 在根层（Astro 的 base 只影响生成 URL，不改文件落点），hub CI 的 Assemble 直接 `mv dist _site/agent-skills`。

## 本地运行 / 构建

前置要求（来自 `engines`）：Node 18.20.8 / ^20.3.0 / ≥22.0.0，npm ≥ 9.6.5。

```bash
npm install
npm run dev      # http://localhost:4321/docs-cn/agent-skills/ （base 固定，dev 也带前缀）
npm run build    # 产出 dist/（36 页）
npm run preview
```

## 翻译口径

术语统一见 `GLOSSARY.md`（agent→智能体、skill→技能、spec→规格、gate→门禁、loop→回路、ship→上线 等，与 [[mattpocock-skills-docs-cn]] 的译名基准保持一致）。

## 上游同步

本站为一次性快照，不做上游持续同步。要同步时，diff 上述两个快照 commit 之后的上游变更，手工补译。