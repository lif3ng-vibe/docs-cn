---
tagline: "在浏览器里迭代 UI。点名元素、丢句评论，拿到三个变体。选一个，写回源码。"
---

<div class="docs-live-callout">
  <span class="docs-live-callout-icon" aria-hidden="true">▸</span>
  <span class="docs-live-callout-text">想看实际效果和动画演示，去 <a href="/docs-cn/impeccable/live-mode"">/live-mode</a>。本页是命令运行时你的 AI 宿主（harness）所读内容的参考。</span>
</div>

<div class="docs-live-callout">
  <span class="docs-live-callout-icon" aria-hidden="true">▸</span>
  <span class="docs-live-callout-text"><strong>状态：alpha</strong>。Live Mode 已端到端跑通，可以上手试，但在真实仓库和框架配置上仍需更多测试。不常见的配置难免有毛边，坏了请报给我们。</span>
</div>

<div class="docs-viz-hero docs-viz-hero--plain">
  <div class="docs-viz-live-frame">
    <div class="docs-viz-live-chrome">
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-dot"></span>
      <span class="docs-viz-live-url">localhost:3000</span>
    </div>
    <div class="docs-viz-live-stage docs-viz-live-stage--tall">
      <div class="docs-viz-live-target">
        <span class="docs-viz-live-kicker">No. 04</span>
        <h3 class="docs-viz-live-title">信件，<em>偶尔</em>。</h3>
        <p class="docs-viz-live-body">来自编辑的明信片，大约每月一封。没有跟踪像素，没有"近来可好"式的寒暄。</p>
        <button class="docs-viz-live-btn" type="button">给我也来一封</button>
      </div>
      <div class="docs-viz-live-outline" aria-hidden="true"></div>
      <div class="docs-viz-live-ctx" aria-hidden="true">
        <button class="docs-viz-live-ctx-nav" type="button" aria-label="上一个">‹</button>
        <span class="docs-viz-live-ctx-counter">2 / 3</span>
        <button class="docs-viz-live-ctx-nav" type="button" aria-label="下一个">›</button>
        <span class="docs-viz-live-ctx-divider"></span>
        <button class="docs-viz-live-ctx-accept" type="button">Accept</button>
      </div>
      <div class="docs-viz-live-gbar" aria-hidden="true">
        <span class="docs-viz-live-gbar-brand">/</span>
        <span class="docs-viz-live-gbar-btn is-active">Pick</span>
        <span class="docs-viz-live-gbar-divider"></span>
        <span class="docs-viz-live-gbar-x">✕</span>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">Live Mode 进行中：picker 给你选中的元素描边，上下文条显示当前是第几个变体，全局条钉在底部。在这里点 Accept，就会把变体 2 写回源码。</p>
</div>

## 什么时候用

想用设计工具的方式做视觉迭代、同时产出又必须是生产代码时，用 `/impeccable live`。像 Figma 一样的画布式流程，但省掉了落地成实现的那一圈往返。

适用场景：

- **在真实元素上探索方向**。hero 区块、订阅卡片、定价档位。三个真正不同的思路，并排出现在真实页面和真实上下文里。
- **打磨一件已经八九不离十的 UI**。你知道哪里不对劲，但说不清楚。选中元素，写一句"再俏皮一点"，或者在那块碍眼的地方划一笔，点 Go。
- **团队争执不下的两个方向，快速 A/B 一下**。生成变体，一个都不采纳，转身走人。要的本来就是这个对比。

它不适合全新的绿地功能或整页重设计；要建要改，直接找 `/impeccable`。

## 工作原理

一条命令，就会在你运行中的开发服务器上方拉起一个 picker 覆盖层。你点名任意元素，它旁边出现一条小小的上下文条。可以输入自由描述，也可以点选操作 chip（`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、`animate`、`delight`、`overdrive`）。也可以先在元素上丢评论图钉或直接划线，技能会把这些读作意图。

点 Go。三个**生产级变体**生成出来，每一个都锚定在真正不同的设计原型上（不是同一配色的三种变奏），并经你框架的 HMR 热插进页面。用方向键轮换比较。采纳一个，变体写回源码。三个都丢弃，页面保持原样。

它支持 Vite、Next.js（含 monorepo）、SvelteKit、Astro、Nuxt 和纯静态 HTML。如果开发服务器有严格的 Content Security Policy，首次运行设置会检测到，并提供一次性、仅限开发环境的补丁，让 picker 得以加载。视觉决策听 `DESIGN.md` 的，语调听 `PRODUCT.md` 的：两个都有的话，变体不用叮嘱也守住品牌。

## 试一试

```
/impeccable live
```

打开开发服务器地址，选中订阅卡片，点 `delight` chip，点 Go。你会得到三个在个性维度上各不相同的变体（邮票明信片感、字体惊喜版、插画点缀版），而不是同一种处理的三次变奏。

或者选中一个 hero，输入"更有杂志感、少一点 SaaS 味"，点 Go。三个变体会锚定到不同的编辑风格原型（大报报头、目录式规格行、超大字形海报），而不是同一想法的三种深浅。

用完就停掉 Live Mode：说一声"stop live mode"、关掉标签页，或点 picker 条上的退出按钮。

## 常见陷阱

- **在半成品页面上跑**。Live 变体生成需要上下文。如果元素上是占位文案、大路货 Lorem ipsum 或未套样式的默认格式，变体也会照着这个味儿来。先填内容。
- **指望它做宏观决策**。Live Mode 迭代的是单个被选中的元素。"重做整个定价页"这种事，直接找 `/impeccable`。
- **无视兜底提示**。如果元素活在生成文件里（编译模板、构建产物），picker 会明说，并提出把采纳结果路由到真正的源文件。别硬把采纳写进生成文件：下次构建就冲掉了。
- **在意品牌一致性却不带 PRODUCT.md 或 DESIGN.md 就跑**。Live 照样能生成，但变体会偏向大路货默认值。如果结果得像你的产品说的话，先跑 `/impeccable init` 和 `/impeccable document`。
