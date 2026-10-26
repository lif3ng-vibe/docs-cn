---
name: docs-cn 入口页
description: 开源项目中文文档集合的导航入口——MDN/GitHub/Vercel 三皮肤、单文件零请求的检索页
colors:
  surface: "#ffffff"
  mdn-bg: "#ffffff"
  mdn-ink: "#1b1b1b"
  mdn-note: "#4e4e4e"
  mdn-accent: "#0069c2"
  mdn-border: "#d7d7d7"
  mdn-hairline: "#e3e3e3"
  mdn-surface2: "#f2f2f2"
  mdn-row-hover: "#f5f5f5"
  github-bg: "#f6f8fa"
  github-ink: "#1f2328"
  github-note: "#57606a"
  github-accent: "#0969da"
  github-border: "#d0d7de"
  github-hairline: "#d8dee4"
  github-chip-hover: "#eaeef2"
  github-row-hover-border: "#8c959f"
  vercel-bg: "#fafafa"
  vercel-ink: "#111111"
  vercel-note: "#666666"
  vercel-accent: "#0070f3"
  vercel-border: "#eaeaea"
  vercel-surface2: "#f5f5f5"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1.55
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "1.08rem"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "-0.005em"
  headline-compact:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "0.98rem"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "-0.005em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.55
  mono:
    fontFamily: "ui-monospace, 'Cascadia Mono', Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "18px"
  gutter: "24px"
components:
  search-mdn:
    backgroundColor: "{colors.surface}"
    height: "52px"
    rounded: "{rounded.md}"
    padding: "0 14px"
  search-github:
    backgroundColor: "{colors.surface}"
    height: "32px"
    width: "190px"
    rounded: "{rounded.md}"
    padding: "0 14px"
  search-vercel:
    backgroundColor: "{colors.surface}"
    height: "40px"
    width: "260px"
    rounded: "{rounded.lg}"
    padding: "0 14px"
  chip-mdn:
    backgroundColor: "transparent"
    textColor: "{colors.mdn-ink}"
    height: "32px"
    rounded: "{rounded.sm}"
    padding: "0 14px"
  chip-mdn-active:
    backgroundColor: "{colors.mdn-ink}"
    textColor: "{colors.surface}"
    height: "32px"
    rounded: "{rounded.sm}"
    padding: "0 14px"
  chip-github:
    backgroundColor: "{colors.github-bg}"
    textColor: "{colors.github-ink}"
    height: "28px"
    rounded: "{rounded.pill}"
    padding: "0 13px"
  chip-github-active:
    backgroundColor: "{colors.github-accent}"
    textColor: "{colors.surface}"
    height: "28px"
    rounded: "{rounded.pill}"
    padding: "0 13px"
  chip-vercel:
    backgroundColor: "transparent"
    textColor: "{colors.vercel-note}"
    height: "34px"
    rounded: "{rounded.none}"
    padding: "0 2px"
  chip-vercel-active:
    backgroundColor: "transparent"
    textColor: "{colors.vercel-ink}"
    height: "34px"
    rounded: "{rounded.none}"
    padding: "0 2px"
  row-mdn:
    backgroundColor: "{colors.surface}"
    padding: "18px 4px"
  row-github:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  row-vercel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  site-cta:
    textColor: "{colors.mdn-accent}"
    typography:
      fontSize: "0.85rem"
      fontWeight: 500
  summary-pill:
    backgroundColor: "{colors.surface}"
    height: "22px"
    rounded: "{rounded.pill}"
    padding: "0 9px"
  mini-button:
    backgroundColor: "transparent"
    textColor: "{colors.mdn-note}"
    size: "30px"
    rounded: "{rounded.md}"
  settings-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.mdn-note}"
    height: "34px"
    rounded: "{rounded.md}"
    padding: "0 12px"
  empty-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.mdn-accent}"
    rounded: "{rounded.md}"
    padding: "7px 14px"
  to-top:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.mdn-ink}"
    size: "44px"
    rounded: "{rounded.lg}"
  settings-dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "1.25rem 1.5rem"
---

# Design System: docs-cn 入口页

## Overview

**Creative North Star: 「品类标准，MDN 工艺」**

这是一个把「几秒定位一个开源项目的中文文档」当作唯一器官来打磨的检索页：搜索、筛选、摘要、空态全部为定位服务，没有装饰性的主行动、没有会蒸发的状态。视觉走品类标准精修路线——以 MDN 2023 设计语言为默认皮肤（纯白底、近黑文字、链接蓝、全宽大搜索、矩形过滤组、hairline 开放行），叠加 GitHub（Primer 灰底白卡）与 Vercel（Geist 细边框）两套皮肤。

皮肤的实现机制是本系统的骨架：三套皮肤各自是一组 CSS 自定义属性（底色、文字、主色、边框、chip 形态、搜索形态），通过 `<html data-skin="…">` 一次切换，结构规则零分叉。所有色彩、圆角、密度差异都收敛在变量组里，组件层永远只有一套。系统字体栈渲染（含中文 PingFang/雅黑），全部图标内联 SVG，列表动画 vendor 内联——**零外部请求、单文件自包含**是硬约束，不是优化目标。

信息密度中高：一行一站点，站名 17px 粗体 + 一句话描述 + 等宽元数据行（页数 · 工具链 · 快照日）+ 标签胶囊；主行动「阅读中文文档 →」在 hover 时浮现，触屏常显。整个页面近乎单色，蓝色只出现在交互语义上。

**Key Characteristics:**
- 三皮肤 = 三组 CSS 变量（`data-skin="mdn" / "github" / "vercel"`），MDN 为默认，切换不改结构
- 系统字体栈 + 内联 SVG + vendor 内联 JS：零外部请求，断网可用
- 蓝色只承载交互语义（hover、焦点、CTA、链接、高亮），不做装饰
- 开放行为 MDN 默认形态，卡片化是 GitHub/Vercel 皮肤的表达
- 等宽字体只用于「机器事实」：快捷键提示、元数据行、命中计数、EN 徽标
- 每一个筛选/搜索状态都有回显：摘要条 pill、命中计数、URL 参数、空态条件复述

## Colors

三套皮肤色板，每组七个基础角色（bg / ink / note / accent / border / hairline / surface2）加皮肤特有变量。同名角色跨皮肤只换值不换义——组件代码永远引用变量，从不写死色值。

### Primary（各皮肤主色，仅交互语义）

- **MDN 链接蓝** `--accent: #0069c2`（`mdn-accent`）：默认皮肤的全部交互色——hover 站名、焦点环、CTA「阅读中文文档 →」、清除按钮、页脚链接、`::selection`（24% 透明混合）与搜索高亮 `mark`（22% 混合）、输入光标。**用途即边界：凡不点击、不聚焦之处不出现蓝色。**
- **GitHub 蓝** `--accent: #0969da`（`github-accent`）：同上语义，另承担选中 chip 的实心底（Primer Counter 体系）。
- **Vercel 蓝** `--accent: #0070f3`（`vercel-accent`）：同上语义，另承担卡片 hover 边框（Geist 的「描边即反馈」）。

### Neutral

- **近黑正文**：MDN `#1b1b1b` / GitHub `#1f2328` / Vercel `#111`——标题、站名、选中 chip 的 MDN 实心底。
- **次级灰**：MDN `#4e4e4e` / GitHub `#57606a` / Vercel `#666`——描述、元数据、图标、占位文字、设置钮。
- **底色**：MDN 纯白 `#fff`；GitHub 灰底 `#f6f8fa` + 白卡 `#fff`；Vercel 灰底 `#fafafa` + 白卡 `#fff`。
- **边框**：MDN `#d7d7d7`（控件描边）+ `#e3e3e3`（hairline 分隔）；GitHub `#d0d7de` / `#d8dee4`；Vercel `#eaeaea`（一根线兼任两者）。
- **浅面**：MDN `#f2f2f2`（摘要条底、迷你钮 hover 底）、行 hover `#f5f5f5`；GitHub 摘要条用底色 `#f6f8fa`、chip hover `#eaeef2`；Vercel `#f5f5f5`。

### Named Rules

**The 单一主声部 Rule.** 蓝色（无论哪个皮肤的主色）只出现在可交互或可聚焦的元素上，且单屏占比远低于 10%；页面的「品牌色」是近黑与白，蓝是动词不是形容词。

**The 不虚构 Rule.** 元数据行（页数 · 工具链 · 快照日）只来自 `sites.json` 的 `meta` 字段，缺项跳过、整行缺省即不渲染；颜色与字体可以有皮肤差异，数据永远只有一份事实。

## Typography

**Display/Body Font:** 系统字体栈 `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`（中文优先 PingFang/雅黑，零网络字体）
**Label/Mono Font:** `ui-monospace, 'Cascadia Mono', Consolas, monospace`

**Character:** 无衬线系统栈 + 中文字体兜底，气质是「工具的中性」而非「品牌的表达」；等宽字体只标注机器事实，与人读的文本形成一眼可辨的双轨。

### Hierarchy

- **Display**（800，1.45rem，-0.01em）：仅页首 wordmark「docs-cn」一处，全页唯一的重字重。
- **Headline**（700，1.08rem，-0.005em）：列表行站名（紧凑密度降到 0.98rem）；hover 变主色。
- **Body**（400，0.9rem，1.55）：行描述；全局基准 14px/1.55。
- **Label**（400，0.82–0.92rem）：副标题 0.92rem、chips 0.82rem、按钮/CTA 0.85rem（CTA 加 500 字重）、标签胶囊 0.75rem。
- **Mono**（400，0.72–0.8rem）：kbd 快捷键提示 11px、元数据行 0.78rem、命中计数 0.8rem、EN 徽标 0.72rem/600/0.04em。

### Named Rules

**The 等宽即机器事实 Rule.** 等宽字体专用于机器产生的字符串——快捷键、页数、工具链名、快照日期、命中数、EN 徽标；任何「人写的话」不进等宽。

## Layout

单列居中布局，容器 `--wrap` 随皮肤收窄：MDN 1080px / Vercel 1024px / GitHub 1012px，左右留白 24px（移动端 16px）。纵向节奏自上而下：页头（上 2.2rem 下 1rem，hairline 收底）→ 筛选条（上距 14px）→ 已选摘要条（上距 12px，条件性出现）→ 列表（上距 18px）→ 页脚（上距 2.2rem，hairline 收顶）。

行内结构固定四段：站名 → 描述（上距 2px）→ 等宽元数据行（上距 7px，溢出省略）→ 标签胶囊组（上距 9px，gap 6px）。MDN 皮肤下搜索独占第二行（`--search-order: 3`，全宽 52px 高），GitHub/Vercel 皮肤搜索缩进页头右侧（190/260px）。

**密度变体**（`data-card-style`，设置弹窗切换）：
- **standard**（默认）：按皮肤形态——MDN 开放行（gap 0、无边框、下缘 hairline、内边距 18px 4px）、GitHub 卡（gap 16px、1px 边框、6px 圆角、14px 16px）、Vercel 卡（gap 8px、1px 边框、8px 圆角、16px 20px）。
- **compact**：gap 6px、内边距 10px 14px、站名 0.98rem、描述 0.82rem、元数据上距 4px。
- **grid**：`repeat(auto-fill, minmax(300px, 1fr))`、gap 12px、行改为块状卡，CTA 静态下移。

**响应式断点 ≤560px**：页边 16px；搜索与设置钮一律 44px 高（MDN 搜索同样回到全宽）；筛选条吸顶（`position: sticky; top: 0`，底色同页面背景），chips 单行横向滚动、隐藏滚动条、chip 拉到 44px 高；行折行，次级链接钮换行到底部（44px 见方）；摘要条紧凑化——隐藏条件 pills 只留「清除全部 + 命中计数」，防止双高条占屏；CTA 隐藏（触屏无 hover，整卡即点击）；hover 变色全部失效；页脚改纵向堆叠。

**触屏与弱动效**：`(hover: none)` 下 CTA 常显；`prefers-reduced-motion: reduce` 下全部过渡与平滑滚动关闭。

### Named Rules

**The 开放行默认 Rule.** MDN 皮肤的列表是「hairline 分隔的开放行」（gap 0、无框、浅灰 hover 带）——卡片（边框+圆角+间隙）是 GitHub/Vercel 皮肤的表达方式，不是本系统的默认形态。

**The 44px Rule.** ≤560px 下所有可触目标——搜索框、设置钮、chips、迷你图标钮——不小于 44px 见方；桌面态迷你钮可为 30px，因为那是指针的领地。

## Elevation & Depth

默认扁平。MDN 皮肤在静止态零阴影，深度完全由 hairline 分隔线与浅面色块（摘要条 `--surface2`）表达；层级靠「线 + 底色差」而非「影」。阴影只出现在两处全局浮动件和两个皮肤的动作反馈上：

### Shadow Vocabulary

- **卡片 hover（仅 GitHub）** `box-shadow: 0 1px 4px rgba(31,35,40,0.09)`：白卡 hover 时浮起一毫米。
- **卡片 hover（仅 Vercel）** `box-shadow: 0 2px 4px rgba(0,0,0,0.06)`：伴随边框变主色。
- **返回顶部钮** `0 2px 8px rgba(0,0,0,0.12)`：固定浮钮需要与内容分离。
- **设置弹窗** `0 8px 32px rgba(0,0,0,0.18)` + 遮罩 `rgba(20,20,20,0.4)`：模态层唯一的重阴影。

### Named Rules

**The 扁平默认，阴影即反馈 Rule.** 静止的列表内容不投影；阴影要么是浮层（弹窗、返回顶部）的身份，要么是皮肤对 hover 的应答（GitHub/Vercel），MDN 基础态的 hover 只有底色与边框。

## Shapes

形态语言按皮肤三轨：**MDN 是「重描边矩形」**——搜索框与 chips 用 1.5px 近黑描边（比其他皮肤的 1px 重一档）、4–6px 小圆角、选中 chip 翻转为黑底白字；**GitHub 是「Primer 卡片+胶囊」**——1px 灰边、6px 卡角、chip 全胶囊（999px）、选中变蓝底白字；**Vercel 是「Geist 细线」**——1px `#eaeaea`、8px 卡角、chip 去边框去底色只留 2px 下划线（选中下划线变近黑）。

圆角刻度：2px（搜索高亮 mark）→ 4px（kbd 提示、焦点环、MDN chip）→ 6px（GitHub 卡、MDN/GitHub 搜索、全部按钮与迷你钮）→ 8px（Vercel 卡与搜索、返回顶部、设置 seg 项）→ 12px（设置弹窗）→ 999px（标签胶囊、摘要 pill、GitHub chip）。图标语言统一：内联 SVG、stroke 1.5 线宽、圆头端点、12–16px 见方。

**The 皮肤即变量组 Rule.** 形态差异（描边粗细、圆角、chip 是否胶囊）全部收敛进 `--chip-*` / `--search-*` / `--row-*` 变量组；新增皮肤只允许写变量覆盖，不允许为皮肤添加结构性 CSS 规则。

## Components

### 搜索框（大搜索）
- **形态：** 放大镜图标（15px）+ 无框输入 + 右端 kbd 提示，垂直居中于 14px 水平内衬的容器；`focus-within` 边框变主色（0.15s ease-out）。
- **皮肤形态：** MDN 全宽 52px 高、1.5px 近黑边、6px 角，kbd 提示显示 `/`；GitHub 190×32px、1px 灰边，kbd 提示整体隐藏；Vercel 260×40px、1px `#eaeaea`、8px 角，kbd 提示显示 `⌘K`。
- **行为：** 全局 `/` 键聚焦（输入态不拦截，三种皮肤一致；`⌘K` 仅为 Vercel 的皮肤语汇展示，未绑定实际快捷键）。placeholder：「搜索 N 个文档站…」。

### Chips（过滤组）
- **形态：** 皮肤三态——MDN 矩形（32px 高、1.5px 近黑边、4px 角）/ GitHub 胶囊（28px、灰底 1px 边）/ Vercel 下划线文字钮（34px、无边框、透明底 2px 下划线）。
- **状态：** hover 主色描边+浅底（Vercel 仅文字变深）；选中 MDN 黑底白字、GitHub 蓝底白字、Vercel 近黑文字+近黑下划线；**disabled（交集下无可命中）** opacity 0.35 + not-allowed，且 hover 不再变色——置灰是「选了也没有结果」的诚实预告，不是装饰。
- **「全部」chip：** 常驻行首，无选中时它即是选中态。

### 已选摘要条
- **形态：** `--surface2` 底 + hairline 边 + 6px 角的条件回显条：选中标签与搜索词各成一颗白底胶囊 pill（22px 高、999px 圆角），中点竖线分隔，右侧等宽计数「命中 **N** / 21 站」（仅高亮模式为「命中 **N** 站」）。
- **动作：** 「清除全部」为主色文字钮，hover 下划线；有筛选/搜索任一条件时出现，条件清空即消失。
- **移动端：** 只保留清除+计数，pills 与竖线隐藏。

### 站点行（开放行 / 卡片行）
- **形态：** `article.item` 双栏——左侧主链 `.row`（站名 1.08rem/700 + 描述 + 等宽元数据行 + 标签胶囊组）占满，右缘次级链接组；MDN 呈 hairline 开放行，GitHub/Vercel 呈白卡。
- **hover：** MDN 整行浅灰带 + 站名变蓝；GitHub 白卡描边加深（`#8c959f`）+ 微阴影；Vercel 白卡描边变主色 + 微阴影。整卡可点击进中文站。
- **主行动 CTA：** 「阅读中文文档 →」（0.85rem/500 主色 + 12px 箭头图标），静止时 `opacity: 0; translateX(-4px)`，hover / `focus-within` 浮现；`(hover: none)` 常显；≤560px 隐藏（触屏整卡即行动）。
- **标签胶囊：** 0.75rem 灰字、hairline 边、999px 圆角、0.22rem×0.62rem 内边距（垂直内边距 ≥0.2rem 是硬性下限，防贴边裁切）；中/英双语由 `data-tag-lang` 切换。
- **次级链接（迷你图标钮）：** 30px 见方圆角钮（EN 徽标为等宽文字变体，带边框），note 灰，hover 主色+浅面底；≤560px 放大到 44px 并换行到底部。

### 空态
- **形态：** 居中留白块（上下 3rem），一句话**复述当前条件**：「没有匹配（智能体 × 搜索：「xyz」）的站点」——条件永远可见，绝不静默空白。
- **恢复动作：** 「清除搜索 × 清除全部筛选」两个描边小钮（7px 14px、6px 圆角、主色文字、hover 主色边）。仅过滤模式零命中触发；仅高亮模式永不空态。

### 设置弹窗
- **形态：** 原生 `<dialog>`（margin:auto 居中需显式补回）、白底 1px 边、12px 圆角、`0 8px 32px` 阴影、`rgba(20,20,20,0.4)` 遮罩；标题行「显示设置」+ 30px 幽灵关闭钮（hover 浅面底）；点遮罩可关。
- **内容：** 五个 fieldset（legend 0.85rem/600 灰字）：界面风格（MDN/GitHub/Vercel）、卡片风格（标准/紧凑/网格）、标签语言（中文/English）、关键词搜索（过滤/仅高亮）、卡片显示（描述/标签/元数据行/次级链接勾选）。
- **控件形态：** seg 项为 8px 圆角描边块（6px 12px），`:has(input:checked)` 时描边+文字变主色；勾选框 `accent-color` 跟随主色。所有偏好写入 `localStorage`（key `docs-cn-prefs`，白名单回落防脏值），页面加载前预读落到 `data-*` 属性防闪烁。

### 返回顶部钮
- **形态：** 44px 见方、8px 圆角、白底描边、上箭头 16px、`0 2px 8px` 阴影，右下 22px 固定；滚动 ≥600px 出现；hover 描边变主色；点击平滑滚顶（reduced-motion 时瞬时）。

### 状态语汇
- **微交互统一 0.15s ease-out**，只动颜色/背景/边框/透明度/位移，无缩放弹跳。
- **焦点**：全局 `:focus-visible` 主色 2px outline + 2px offset；列表链接 offset -2px（贴边不裁切）。
- **选中/激活**：chips 实心翻转或下划线、seg 项主色描边、单选 `accent-color`——三种控件一个语义：主色 = 当前生效。
- **禁用**：opacity 0.35，永不禁用「全部」。
- **URL 即状态**：`?tags=a,b&q=词`（`replaceState`，不推历史栈），刷新/分享不丢，清空条件即清参数。
- **文案口径**：计数「命中 N / 21 站」（仅高亮「命中 N 站」）；空态条件以「 × 」连接；搜索词回显格式「搜索：「词」」。

## Do's and Don'ts

### Do:
- **Do** 新增皮肤时只写一组 `data-skin` 变量覆盖（底色/文字/主色/边框/搜索/chip/行），结构 CSS 零分叉。
- **Do** 图标全部内联 SVG、stroke 1.5 线宽、12–16px、圆头端点；颜色跟随 `currentColor`。
- **Do** 移动端所有触控目标 ≥44px；触屏下 CTA 常显、hover 态全部有非 hover 兜底。
- **Do** 元数据行严格来自 `sites.json` 的 `meta`，缺哪段跳哪段，整行缺省不渲染。
- **Do** 交互改动后重跑 `node scripts/gen-index.cjs` 刷新 `index.html`（产物禁手改）。

### Don't:
- **Don't** 引入任何外部请求——网络字体、CDN 脚本、外链图片、图标字体一律禁止；新依赖必须 vendor 内联。
- **Don't** 在 MDN 基础态给列表内容加阴影或卡片边框；阴影只属于浮层与 GitHub/Vercel 的 hover 应答。
- **Don't** 让蓝色出现在非交互元素上，或用主色做大面积铺底。
- **Don't** 出现无回显的状态：筛选/搜索必须同时体现在摘要条、计数与 URL；空态必须复述条件并给出恢复动作。
- **Don't** 把人读文案排进等宽字体，或给机器事实用非等宽排印。
