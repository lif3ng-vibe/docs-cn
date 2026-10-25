# 术语表（Glossary）— impeccable 两项目共用

适用于 `impeccable-docs-cn`（源码重建版）与 `impeccable-mirror-cn`（线上镜像版）。
翻译开工前通读；终检时按本表抽查全站一致性。

## 不译名单

| 原文 | 处理 |
|---|---|
| Impeccable | 产品名，不译 |
| 命令名（impeccable / polish / audit / critique / bolder / quieter / distill / harden / onboard / animate / colorize / typeset / layout / delight / overdrive / clarify / adapt / optimize / document / extract / init / generate / live / shape / craft / teach / new-work / doctor / improve-design 等） | 命令名一律不译，保留 `/impeccable polish` 形态 |
| Live Mode | 功能名，不译 |
| AI slop / Slop | 不译（章节名 Slop 保留）；首次出现可写「AI slop（AI 生成界面的廉价套路）」 |
| Claude Code / Cursor / Codex / Gemini CLI / Copilot / Windsurf / Kiro / OpenCode 等 | 工具名不译 |
| PRODUCT.md / DESIGN.md / .impeccable/ | 文件名路径不译 |
| design token 代码形态（如 `--color-accent`） | 不译 |
| CLI（npx impeccable detect 等） | 不译 |

## 译法表

| 英文 | 中文 |
|---|---|
| skill | 技能 |
| command | 命令 |
| harness (AI harness) | 宿主（AI 宿主）；首次「AI 宿主（harness）」 |
| design system | 设计系统 |
| design token / token（设计语境） | 设计令牌 / 令牌 |
| detector | 检测器 |
| detection rule | 检测规则 |
| overlay | 覆盖层 |
| anti-pattern | 反模式 |
| specimen（slop 样例页） | 样例 |
| variant | 变体 |
| before / after（对比图） | 改前 / 改后 |
| mock | 视觉稿 |
| hi-fi | 高保真 |
| brief | 简报 |
| discovery | 需求澄清（discovery interview → 需求澄清访谈） |
| register（品牌调性） | 调性 |
| voice | 语调 |
| lane（brand/product lane） | 路线（品牌路线 / 产品路线） |
| core loop | 核心循环 |
| gauntlet（pre-ship gauntlet） | 关卡（上线前关卡） |
| design debt | 设计债 |
| pay down (debt) | 偿还 |
| polish（动词性描述） | 打磨 |
| refine | 精修 |
| harden | 加固 |
| distill | 提纯 |
| ship / shipping / shipped | 上线 / 交付 |
| landing page | 落地页 |
| empty state / loading state / error state | 空状态 / 加载状态 / 错误状态 |
| focus state | 焦点状态 |
| edge case | 边界情况 |
| responsive | 响应式 |
| accessibility | 无障碍 |
| viewport | 视口 |
| breakpoint | 断点 |
| whitespace | 留白 |
| spacing | 间距 |
| kerning | 字距 |
| hierarchy | 层级 |
| affordance | 可供性 |
| microcopy | 微文案 |
| UX writing | UX 文案 |
| CTA (call to action) | CTA |
| walkthrough | 走查 |
| onboarding | 新手引导 |
| handoff | 交接 |
| intercept/hook | 钩子（design hook → 设计钩子） |
| finding（检测结果） | 发现 |
| false positive | 误报 |
| deterministic | 确定性的 |
| LLM-only rule | 仅 LLM 检测的规则 |
| headless / CLI layer | CLI 层 |
| browser extension | 浏览器扩展 |
| alpha | Alpha（保留） |
| scaffold | 脚手架 |
| boilerplate | 样板代码 |
| fidelity | 还原度 |

## 排版约定（全站统一）

- 中文全角标点（，。：；？！、（）""——）；代码内半角
- 中英文 / 中文与数字之间一个半角空格
- 引号用 ""（不用「」）；破折号用——不带空格
- 命令首次出现保留英文原词：打磨（polish）之后直接用命令名
- **CJK 粗体闭合**：`**……**。后文` ✓；`**……。**后文` ✗（句读移出粗体）；`**词**（gloss）后文` ✓
- markdown 文件中标题译中文后需重算页内锚点（github-slugger 保留 CJK）
