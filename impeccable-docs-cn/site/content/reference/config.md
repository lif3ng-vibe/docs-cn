---
title: 配置与忽略
tagline: "针对检测器豁免、钩子行为和本地覆盖的项目设置。"
description: "用 .impeccable 配置记录已确认的检测器豁免和运行时设置。产品与设计意图请放在 PRODUCT.md 和 DESIGN.md 中。"
section: concepts
order: 2
---

Impeccable 把运行时设置存放在 `.impeccable/` 下。大多数用户不需要手动编辑这些文件；想记录一条已确认的豁免时，用 CLI 即可。

配置用于：

- `npx impeccable detect` 与设计钩子共享的检测器忽略项；
- 不应提交到仓库的私有本地忽略项；
- 钩子的生命周期设置，如启用、安静模式和审计日志。

产品与设计意图请交给 `PRODUCT.md` 和 `DESIGN.md`。参见[设计上下文](/docs-cn/impeccable/docs/context))。

## 常规路径

列出当前的忽略项：

```bash
npx impeccable ignores list
```

按真实原因添加范围最小的豁免：

```bash
npx impeccable ignores add-value design-system-color "#ff00aa" --reason "Campaign accent"
npx impeccable ignores add-file "src/legacy/**"
npx impeccable ignores add-rule side-tab
```

底层代码修复之后，移除对应的豁免：

```bash
npx impeccable ignores remove-value design-system-color "#ff00aa"
```

CLI 和钩子使用同一份检测器配置，所以一条忽略在两边的行为保持一致。

## 共享还是本地

默认的忽略项写入 `.impeccable/config.json`。当它们代表团队共识时应当提交：一个遗留目录、一条已确认的品牌例外，或一项项目级的规则决策。

私有工作用 `--local`：

```bash
npx impeccable ignores add-file "src/private-experiment/**" --local
```

本地设置写入 `.impeccable/config.local.json`，Impeccable 会让它远离 git。

## 值忽略

当规则报告的是某个具体值时，优先用值忽略：

```bash
npx impeccable ignores add-value overused-font Inter --reason "Brand font"
```

字体、颜色、圆角和动效值通常应按值压制，而不是整个规则一刀切。这样规则在其他地方继续有用。

通配符值忽略只在限定到单个文件时才允许：

```bash
npx impeccable ignores add-value design-system-color "*" --file "src/demo.css"
```

这样，一个有意做实验的文件就不会让整个项目以为所有未记录的颜色都无妨。

## 行内忽略注释

配置忽略存放在 `.impeccable/config.json`，这是仓库级策略的正确归宿。但它不会跟着文件走出仓库。当豁免只属于某个文件、且需要随文件一起流转时（生成或导出的独立文档、邮件里的 HTML 文件、脱离上下文被扫描的代码片段），把豁免写进文件本身：

```html
<!-- impeccable-disable overused-font: exported brand doc, font is first-party -->
```

指令不挑注释语法，同一个标记在 HTML、CSS、JSX、TSX、Vue 和 Svelte 的 `//`、`/* */`、`<!-- -->`、`#`、`{/* */}` 注释里都能用。有三种作用范围：

```css
/* impeccable-disable overused-font */            /* 整个文件 */
.brand { font-family: Inter }  /* impeccable-disable-line overused-font */
/* impeccable-disable-next-line bounce-easing */
```

列出一条或多条规则 id（逗号分隔），也可以省略（或用 `*`）表示所有规则。`:` 或 `--` 后面可以附一条原因，可选但推荐；它是写给人看的（供 diff 阅读），扫描器会丢弃它。与配置忽略一样，命中指令的发现会被压制。

静态 HTML 的发现没有行号，所以只有整文件的 `impeccable-disable` 对其生效——这正是为独立文档场景设计的。行级范围的几种形式适用于 CSS、JSX、TSX、Vue 和 Svelte，这些场景的发现带有行号。

行内指令默认生效。`--no-inline-ignores` 在单次运行中关掉它们但保留配置忽略；`--no-config` 把配置忽略和行内忽略一起关掉。

## 默认路径不够用时的细节

<details class="docs-prose-details">
  <summary>配置文件长什么样</summary>
  <div>
    <p>共享配置位于 <code>.impeccable/config.json</code>。典型的文件如下：</p>
    <pre><code>{
  "detector": {
    "ignoreRules": [],
    "ignoreFiles": [],
    "ignoreValues": [],
    "designSystem": {
      "enabled": true
    }
  },
  "hook": {
    "enabled": true,
    "quiet": false,
    "auditLog": ".impeccable/hook.ndjson"
  }
}</code></pre>
    <p><code>detector</code> 段由手动扫描和钩子共享。<code>hook</code> 段只控制钩子的自动执行和钩子输出。</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>关闭设计系统检查</summary>
  <div>
    <p>设计感知规则在 <code>DESIGN.md</code> 存在时运行。只有当设计文件明确还不具备权威性时，才在项目级关闭它们：</p>
    <pre><code>{
  "detector": {
    "designSystem": {
      "enabled": false
    }
  }
}</code></pre>
    <p>单次手动运行时，保留配置但跳过设计系统规则：</p>
    <pre><code>npx impeccable detect --no-design-system src/</code></pre>
    <p>只有当你想要一次不带项目忽略项、也不带 <code>DESIGN.md</code> 上下文的原始扫描时，才用 <code>--no-config</code>。</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>钩子运行时设置</summary>
  <div>
    <p>常规生命周期变更用 <code>/impeccable hooks</code>：</p>
    <pre><code>/impeccable hooks status
/impeccable hooks on
/impeccable hooks off</code></pre>
    <p><code>hook.quiet: true</code> 会压制"通过"和"待确认"的提示，但仍会浮现新的发现。</p>
    <p><code>hook.auditLog</code> 每次钩子调用写一行 NDJSON，便于调试。日常工作保持关闭。</p>
    <p>环境变量仍可在单个 shell 里覆盖配置：<code>IMPECCABLE_HOOK_DISABLED</code>、<code>IMPECCABLE_HOOK_QUIET</code> 和 <code>IMPECCABLE_HOOK_LOG</code>。</p>
  </div>
</details>
