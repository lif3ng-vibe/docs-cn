# impeccable-mirror-cn 翻译规范（每个批次必读）

目标：把 `site/` 下的英文静态站原位翻译成中文。这是**渲染后 HTML/JS 原位编辑**，任何一次改写都要保证标签结构不被破坏。

## 铁律

1. **只用 Edit 做小片段替换**，禁止整文件重写（Write 仅限新建文件）。每次 old_string 控制在几行内、带足上下文保唯一。
2. **绝不触碰**：标签名、class、id、href/src/URL、data-* 属性（`data-cfemail` 除外，后续脚本处理）、`<script>` 内逻辑、`<style>`、`<pre><code>` 代码内容、frontmatter 无此概念。
3. **id 属性保持英文原样**（如 `<h2 id="check-your-project">` —— 标题文字翻译，id 不动，页内锚点才不炸）。
4. 命令名不译：`/impeccable polish`、`npx impeccable detect`、`polish`、`audit` 等命令名保持英文；`PRODUCT.md`/`DESIGN.md`/`.impeccable/` 不译。
5. 工具名不译：Impeccable、Claude Code、Cursor、Codex、Gemini CLI、Copilot、Windsurf、Kiro、OpenCode、Vite、Next.js、SvelteKit、Astro、Nuxt、Bun、Chrome、Puppeteer、GitHub、Shiki。
6. Live Mode、AI slop、Slop、design token（代码形态）不译。
7. demo/示意图里的可见文案要译（如 Newsletter 卡片的 "Subscribe for updates"、终端演示的输出说明），但其中作为命令展示的内容（`/impeccable polish pricing`）不译。
8. 图注/alt/aria-label/占位符文本都要译。

## 译法表（GLOSSARY 摘要）

| 英文 | 中文 |
|---|---|
| skill | 技能 |
| command | 命令 |
| harness (AI harness) | 宿主（AI 宿主）；首次出现写「AI 宿主（harness）」 |
| design system | 设计系统 |
| design token / token | 设计令牌 / 令牌 |
| detector | 检测器 |
| detection rule | 检测规则 |
| overlay | 覆盖层 |
| anti-pattern | 反模式 |
| specimen | 样例 |
| variant | 变体 |
| before / after | 改前 / 改后 |
| mock | 视觉稿 |
| hi-fi | 高保真 |
| brief | 简报 |
| discovery | 需求澄清 |
| register（品牌语境） | 调性 |
| voice | 语调 |
| lane（brand/product） | 路线 |
| core loop | 核心循环 |
| design debt | 设计债 |
| polish（动词性） | 打磨 |
| refine | 精修 |
| harden | 加固 |
| distill | 提纯 |
| ship / shipped | 上线 / 交付 |
| landing page | 落地页 |
| empty/loading/error state | 空状态 / 加载状态 / 错误状态 |
| focus state | 焦点状态 |
| responsive | 响应式 |
| accessibility | 无障碍 |
| whitespace | 留白 |
| spacing | 间距 |
| hierarchy | 层级 |
| microcopy | 微文案 |
| walkthrough | 走查 |
| onboarding | 新手引导 |
| hook | 钩子（design hook → 设计钩子） |
| finding | 发现 |
| false positive | 误报 |
| deterministic | 确定性的 |
| LLM-only rule | 仅 LLM 检测的规则 |
| browser extension | 浏览器扩展 |
| fidelity | 还原度 |

## 排版

- 中文全角标点（，。：；？！、（）""——）
- 中英文/数字之间一个半角空格；代码内半角
- 引号用 ""；破折号用——不带空格
- 标题译文保持简洁（原 h2/h3 的 slug 意译成短中文短语）

## HTML 特有注意

- **HTML 是渲染产物，不认 markdown**：粗体一律 `<strong>`、斜体 `<em>`、代码 `<code>`——绝不能写 `**x**`、`` `x` `` 之类的 markdown 标记
- `<title>`：`/polish | Impeccable` → `polish 命令 | Impeccable（汉化版）`；其余页 `<原题> | Impeccable` → `<原题中文> | Impeccable（汉化版）`
- `<meta name="description">` 与 og:title / og:description / twitter:* 文案翻译；og:image、og:url 等 URL 不动
- JSON-LD（`application/ld+json`）里的 name/description 可译，URL 不动
- 按钮/链接文字翻译，href 不动
- 术语首次出现附英文：打磨（polish）风格的处理，正文自然即可，不必逐词
