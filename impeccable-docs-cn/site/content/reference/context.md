---
title: 设计上下文
tagline: "给 Impeccable 足够的项目记忆，让它做出具体的设计决策。"
description: "了解 Impeccable 为什么需要设计上下文、PRODUCT.md 和 DESIGN.md 里该写什么，以及如何让这些上下文保持最新。"
section: concepts
order: 1
---

当 Impeccable 能读到那些你原本会交给人类设计师的产品与设计决策时，它的表现最好。缺少这份上下文，它就只能从代码里去推断受众、调性、配色、字体和组件规则，结果往往是更保守、更泛泛的方案。

<p class="docs-context-note">如果 Impeccable 给你的建议很套路，通常是设计上下文缺失、太模糊，或者已经过时。</p>

## 快速路径

在项目根目录运行一次初始化：

```text
/impeccable init
```

这会创建策略文件 `PRODUCT.md`。结束时，Impeccable 会提议接着运行，答 yes 即可：

```text
/impeccable document
```

这会创建视觉系统文件 `DESIGN.md`，以及一个生成出来的辅助文件 `.impeccable/design.json`。通读这两个 markdown 文件，凡是与真实产品不符的地方都改掉。

<div class="docs-context-flow" aria-label="Impeccable 如何使用设计上下文">
  <div class="docs-context-flow-source">
    <span class="docs-context-flow-label">策略</span>
    <strong>PRODUCT.md</strong>
    <span>受众、目的、语调、调性、反面参照。</span>
  </div>
  <div class="docs-context-flow-source">
    <span class="docs-context-flow-label">视觉系统</span>
    <strong>DESIGN.md</strong>
    <span>颜色、字体、组件、圆角、设计规则。</span>
  </div>
  <div class="docs-context-flow-source docs-context-flow-source--generated">
    <span class="docs-context-flow-label">生成</span>
    <strong>.impeccable/design.json</strong>
    <span>供自动化读取的结构化元数据。不要手动编辑。</span>
  </div>
  <div class="docs-context-flow-output">
    <span class="docs-context-flow-label">被谁使用</span>
    <strong>命令、钩子、检测器、Live Mode</strong>
    <span>更具体的修改、更准的审计、更少的错误假设。</span>
  </div>
</div>

## 什么内容放在哪里

| 文件 | 应该回答什么 | 何时更新 |
|---|---|---|
| `PRODUCT.md` | 这是给谁用的？产品想做成什么？品牌应该是什么感觉？这是品牌面还是产品面？这项工作要避开什么？ | 受众、定位、产品目的、语调、调性或反面参照发生变化时。 |
| `DESIGN.md` | 允许使用哪些颜色、字体栈、组件处理方式、圆角、层级和视觉规则？ | 配色、字体、组件、令牌、间距/圆角刻度或设计规则发生变化时。 |
| `.impeccable/design.json` | 自动化应该使用哪些结构化设计数据？ | 不要直接编辑。运行 `/impeccable document` 刷新。 |

两个 markdown 文件由你负责。生成的 JSON 帮助检测器、钩子和 Live Mode 精确读取设计系统。

## 最重要的选择：品牌还是产品

Impeccable 把这个选择称为**调性（register）**。日常使用时，你只需要判断当下让它评审的是哪类界面。

- **品牌面**：营销站、落地页、活动页、作品集、编辑类页面。访客正在评估、信任、记住、比较或感受品牌。
- **产品面**：应用 UI、仪表盘、管理后台、工作流工具、设置页。用户正在配置、监控、搜索、提交、比对数据或完成任务。

同一个视觉手法，在一种调性里是对的，在另一种里就是错的。活动页可以承受一张巨大的图片、富有表现力的字体和每屏一个主导想法；仪表盘需要信息密度、可预期的控件、清晰可读的状态、稳定的导航和更克制的动效。

很多代码库两者都有。把项目默认值设成你最常做的那类界面，任务不同时明确说明：

```text
/impeccable polish the marketing homepage as a brand surface
/impeccable audit the billing settings as a product surface
```

## 上下文如何改变输出

加载上下文后，Impeccable 能够：

- 保留正确的品牌识别，而不是把它"改进"成千篇一律的样子；
- 为界面选对标准：是有表现力的品牌页，还是高效的产品 UI；
- 把硬编码的视觉选择替换成有据可查的令牌和组件；
- 标记漂移，比如字体、颜色或圆角超出了 `DESIGN.md` 的约定；
- 让 Live Mode 的变体贴合系统，而不是自创配色。

上下文不能替代判断。既有代码依然重要，有意的例外也可以用检测器忽略项记录下来。参见[配置与忽略](/docs-cn/impeccable/docs/config))。

## 让上下文保持最新

记住这条规则：

| 项目里的变化 | 运行 |
|---|---|
| 新的受众、定位、产品目的、品牌语调或调性 | `/impeccable init` |
| 新的配色、字体栈、组件原语、圆角刻度或设计规则 | `/impeccable document` |
| 钩子提示 `DESIGN.md` 比 `.impeccable/design.json` 更新 | `/impeccable document` |
| 某条检测器发现是有意为之的一次性例外 | 用 `/impeccable hooks ignore-value` 或 `npx impeccable ignores` 添加一条窄范围的忽略。 |

像对待其他设计产物一样对待上下文文件：它们变化时在代码评审里过一遍，产品变化时及时更新。

## 默认路径不够用时的细节

<details class="docs-context-details">
  <summary>Impeccable 在哪里查找上下文文件</summary>
  <div>
    <p>常规项目把 <code>PRODUCT.md</code> 和 <code>DESIGN.md</code> 放在项目根目录即可。</p>
    <p>技能命令先查根目录。根目录没有时，也会检查 <code>.agents/context/</code> 和 <code>docs/</code>。</p>
    <p>检测器的设计系统规则对 <code>DESIGN.md</code> 采用同样的根目录优先行为。生成的设计元数据以 <code>.impeccable/design.json</code> 为主路径。旧的 <code>DESIGN.json</code> 文件仍可作为回退读取，但新项目应使用 <code>.impeccable/design.json</code>。</p>
  </div>
</details>

<details class="docs-context-details">
  <summary>文档与代码不一致时会发生什么</summary>
  <div>
    <p>策略问题以 <code>PRODUCT.md</code> 为准：受众、语调、调性、反面参照，以及一次改动应该延续还是抛开当前的品牌识别。</p>
    <p>视觉决策以 <code>DESIGN.md</code> 为准：颜色、字体、圆角、层级、组件行为，以及系统专属的该做/不该做规则。</p>
    <p>既有代码依然重要。命令在编辑前会读取项目文件，当真实约定比文档更强或更新时会予以保留。<code>DESIGN.md</code> 过时是刷新文档的信号，不是无视实现的许可。</p>
  </div>
</details>

<details class="docs-context-details">
  <summary>DESIGN.md 存在时会解锁哪些检测器规则</summary>
  <div>
    <p>当 <code>DESIGN.md</code> 存在时，<code>npx impeccable detect</code> 和设计钩子会解锁设计系统检查：</p>
    <ul>
      <li><code>design-system-font</code> 标记未在 <code>DESIGN.md</code> 字体声明中出现的主字体。</li>
      <li><code>design-system-color</code> 标记超出文档化调色板或 sidecar 色阶的字面颜色。</li>
      <li><code>design-system-radius</code> 标记超出文档化圆角刻度的 border-radius 值。</li>
    </ul>
    <p>当 <code>DESIGN.md</code> 不存在、配置关闭了设计系统检查，或给检测器传入 <code>--no-design-system</code> 时，这些规则不会运行。参见<a href="/docs-cn/impeccable/docs/detector"">检测器 CLI</a>。</p>
  </div>
</details>
