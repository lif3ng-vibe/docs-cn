# impeccable-docs-cn 翻译规范（A+ 源码版批次必读）

目标：把 `site/content/**`（md）与 `site/pages/**`、`site/components/**`、`site/layouts/**`、`site/data/**`、`site/scripts/**` 里的英文文案原位翻译成中文。上游为 Astro 7 静态站（srcDir=site/）。

## 铁律

1. **md/astro 文件用 Edit 小片段替换**，old_string 带足上下文；只有新建文件才用 Write。
2. 术语与排版规则同 `C:\Users\lif3n\src\docs\impeccable-docs-cn\GLOSSARY.md`（必读）。
3. **md 标题译中文后，正文中指向它的页内锚点链接 `#...` 必须重算**（github-slugger：中文保留、空格转连字符、小写）。astro 组件里 `<h2 id="...">` 的 id 同理。**本页 h2 译名先定稿，再统一改本页所有锚点引用**。
4. 命令名/工具名/文件名不译（清单见 GLOSSARY 不译名单）。代码块、命令、配置键逐字保留。
5. frontmatter 的 title/tagline/description 翻译（一句话摘要保持一句话）；slug/文件名不改。
6. **CJK 粗体闭合**：句读移出粗体——`**……。**后文` ✗ → `**……**。后文` ✓。
7. 中英文/数字间一个半角空格；全角标点；引号用 ""。

## 文件类型注意

- `site/content/skills/*.md`：editorial 正文（含 `docs-viz-*` 原始 HTML 块）。HTML 块里的可见英文文案要译（如 `<span class="docs-viz-flow-name">Shape</span>` 的流程名可译「洞察成形」需谨慎——**viz 块里的流程步骤名/短标签保持简短意译**），HTML 结构与 class 不动。
- `site/content/reference/*.md`：概念/自动化文档，纯 md 为主。
- `site/content/tutorials/*.md`：教程，代码块内的命令保留、注释可译。
- `site/data/sub-pages-data.ts`：CATEGORY_LABELS/DESCRIPTIONS、COMMAND_RELATIONSHIPS 副文案（"Pairs with"→"常与…搭配" 等渲染在 docs 索引）——翻译**值**不改**键**。
- `site/data/testimonials.js`、`site/data/anti-patterns-catalog.js`：GALLERY_ITEMS 标题/描述、LLM_ONLY_RULES 文案——值译，键/id 不译。
- `site/components/*.astro`、`site/layouts/*.astro`：UI 文案、aria-label、按钮文字；组件名/props 不动。
- `site/scripts/**`（客户端 JS）：字符串字面量里的 UI 文案（如 "Copied"→"已复制"）；逻辑不动。
- `site/pages/index.astro` 等营销页：hero/卖点/FAQ 全译。

## 锚点重算示例

`## What you'll build` → `## 你将完成什么`；正文 `[jump to results](#what-youll-build)` → `[跳到成果](#你将完成什么)`（slugger 产出）。改完用构建验证死链（astro build 会报）。
