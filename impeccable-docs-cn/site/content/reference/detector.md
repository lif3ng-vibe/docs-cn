---
title: 检测器 CLI
tagline: "不借助 AI 宿主，直接运行 Impeccable 的确定性设计检查。"
description: "用 npx impeccable detect 扫描文件、目录、stdin 和 URL；理解发现、退出码、忽略项以及感知设计系统的检查。"
section: automation
order: 1
---

`npx impeccable detect` 直接在终端里运行 Impeccable 的确定性设计检查。当你想要一个快速信号、而不必让 AI 命令去评审作品时，用它。

## 快速路径

扫描源码目录：

```bash
npx impeccable detect src/
```

扫描单个文件：

```bash
npx impeccable detect src/components/Card.tsx
```

扫描一个已渲染的页面：

```bash
npx impeccable detect https://example.com
```

当其他脚本或 CI 任务需要读取结果时，用 JSON：

```bash
npx impeccable detect --json src/
```

## 它检查什么

检测器查找那些通常用户一眼就能看到的设计与实现模式：对比度问题、字体漂移、布局溢出、泛泛的 AI 设计套路、脆弱的动效，以及 `DESIGN.md` 存在时的设计系统违规。

目录会被遍历以找出与设计相关的文件。HTML 文件会带上其链接的本地 CSS。JSX、TSX、Vue、Svelte、Astro 和 CSS modules 等框架文件会做源码文本检查。URL 目标会启动浏览器检查渲染后的页面。

## 如何读结果

纯文本输出按文件分组，打印规则 id、代码片段和解释。退出码如下：

| 退出码 | 含义 |
|---|---|
| `0` | 没有发现。 |
| `2` | 检测到发现。 |
| `1` | 命令失败。 |

这让 CI 用法一目了然：作业在 `2` 时失败，然后决定是修掉问题，还是添加一条窄范围的忽略。

## DESIGN.md 感知

本地存在 `DESIGN.md` 时，`detect` 默认加载它，并启用针对字体、字面颜色、圆角以及字体刻度中文档化字号的设计系统检查。生成的 `.impeccable/design.json` sidecar 为这些检查提供更丰富的令牌与色阶数据。

设计文件过时就刷新它：

```text
/impeccable document
```

如果需要一次不带设计系统检查的扫描：

```bash
npx impeccable detect --no-design-system src/
```

把扫描收窄到单个设计领域（例如在 typeset 或 layout 之前）：

```bash
npx impeccable detect --scope type src/
npx impeccable detect --scope layout src/
```

## 管理有意保留的发现

检测器忽略项与设计钩子共享：

```bash
npx impeccable ignores list
npx impeccable ignores add-value overused-font Inter --reason "Brand font"
npx impeccable ignores add-file "src/legacy/**"
```

对于应该随单个文件流转、而不是写进仓库配置的豁免，在文件本身里放一条行内注释：

```html
<!-- impeccable-disable overused-font: exported brand doc -->
```

完整的忽略工作流（包括行级的 `impeccable-disable-line` 和 `impeccable-disable-next-line` 形式）参见[配置与忽略](/docs-cn/impeccable/docs/config))。

## 默认路径不够用时的细节

<details class="docs-prose-details">
  <summary>扫描 stdin</summary>
  <div>
    <p>不给目标、把文本管道进命令时，它扫描 stdin：</p>
    <pre><code>cat component.css | npx impeccable detect</code></pre>
  </div>
</details>

<details class="docs-prose-details">
  <summary>项目配置与原始扫描</summary>
  <div>
    <p>默认情况下，<code>detect</code> 会读取 <code>.impeccable/config.json</code> 和 <code>.impeccable/config.local.json</code>。</p>
    <p>它遵循 <code>detector.ignoreRules</code>、<code>detector.ignoreFiles</code>、<code>detector.ignoreValues</code> 和 <code>detector.designSystem.enabled</code>。</p>
    <p>它不遵循 <code>hook.enabled</code>；自动钩子被禁用时，手动扫描照样运行。</p>
    <p>文件内的 <code>impeccable-disable*</code> 注释同样生效，豁免可以随文件流转。<code>--no-inline-ignores</code> 只跳过行内注释；<code>--no-config</code> 把配置和行内忽略一起跳过。</p>
    <p>只有当你想要一次不带项目配置、不带检测器忽略项、也不带 <code>DESIGN.md</code> 上下文的原始扫描时，才用 <code>--no-config</code>。</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>检测器还用在哪些地方</summary>
  <div>
    <p>同一套检测器还支撑着设计钩子、<code>/impeccable audit</code>、公开的 <a href="/docs-cn/impeccable/slop"">slop 样例库</a>、浏览器扩展和本地的检测器实验室。</p>
    <p>想让发现出现在 agent 工作流里，用<a href="/docs-cn/impeccable/docs/hooks"">自动设计检查</a>。想要直接的终端信号，用 <code>detect</code>。</p>
  </div>
</details>
