---
title: 自动设计检查
tagline: "在 Claude Code、GitHub Copilot、Codex 和 Cursor 内提供自动检测器反馈。"
description: "安装、启用、禁用、调试并调优 Impeccable 的原生设计钩子，在 UI 文件被编辑时自动获得检测器反馈。"
section: automation
order: 2
---

设计钩子会在 AI 编码工具编辑 UI 文件时自动运行 Impeccable 的检测器。趁 agent 还握着这次编辑的上下文，就把回归拦下来。

## 快速路径

在 AI 工具里检查钩子状态：

```text
/impeccable hooks status
```

为本项目打开或关闭钩子：

```text
/impeccable hooks on
/impeccable hooks off
```

安装与更新命令可以单次跳过钩子设置：

```bash
npx impeccable install --no-hooks
npx impeccable update --no-hooks
```

## 它做什么

钩子扫描对 UI 代码和样式的直接编辑。发现新问题时，它会把这条发现连同修复方向，以简短提醒的形式发给 agent。

Claude Code、GitHub Copilot 和 Codex 在编辑之后运行检查。Cursor 在拟议写入落地之前检查，且只在检测器于拟议 UI 代码中发现问题时才阻止。

纯 `.ts` 和 `.js` 文件也会被扫描，但只要没发现与设计相关的问题，钩子就保持安静。

## 处理有意保留的发现

先确认发现确实是有意为之，再固化例外。优先选范围最小的豁免：

```text
/impeccable hooks ignore-value overused-font Inter --shared --reason "Brand font"
/impeccable hooks ignore-file "src/legacy/Card.tsx"
/impeccable hooks ignore-rule side-tab
```

对于 `overused-font` 这类按值报告的规则，用 `ignore-value` 豁免具体字体。只有想压制整条规则时才用 `ignore-rule overused-font --all-values`。

终端里的等价命令是 `npx impeccable ignores ...`，写入的是同一份检测器配置。参见[配置与忽略](/docs-cn/impeccable/docs/config))。

## 默认路径不够用时的细节

<details class="docs-prose-details">
  <summary>支持的宿主与批准步骤</summary>
  <div>
    <p><code>npx impeccable install</code> 和 <code>npx impeccable update</code> 会为 Claude Code、GitHub Copilot、Codex 和 Cursor 安装原生钩子清单。</p>
    <ul>
      <li>Claude Code：默认写入 <code>.claude/settings.local.json</code>。</li>
      <li>GitHub Copilot：<code>.github/hooks/impeccable.json</code>，一个提交进仓库的文件，由 Copilot CLI 与云端 agent 共用。</li>
      <li>Codex：<code>.codex/hooks.json</code>。</li>
      <li>Cursor：<code>.cursor/hooks.json</code>。</li>
    </ul>
    <p>GitHub Copilot 读取已提交的 <code>.github/hooks/impeccable.json</code>。在 Copilot CLI 里，该文件进入仓库默认分支且你信任该目录后，钩子即激活；云端 agent 则直接从仓库读取。</p>
    <p>Codex 需要多一步批准。安装或更新后，在 Codex 里打开 <code>/hooks</code> 并批准项目钩子。Codex 按钩子定义跟踪信任，所以更新后可能需要再次批准。</p>
    <p>Cursor 用户还应在 Cursor Settings -> Hooks 里确认钩子已启用。</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>扫描的文件类型</summary>
  <div>
    <p>钩子扫描常见的 UI 与样式文件：</p>
    <p><code>.tsx</code>, <code>.jsx</code>, <code>.html</code>, <code>.vue</code>, <code>.svelte</code>, <code>.astro</code>, <code>.css</code>, <code>.scss</code>, <code>.sass</code>, <code>.less</code>, <code>.ts</code>, and <code>.js</code>.</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>配置与环境变量覆盖</summary>
  <div>
    <p>钩子的生命周期设置位于 <code>.impeccable/config.json</code> 的 <code>hook</code> 段：</p>
    <pre><code>{
  "hook": {
    "enabled": true,
    "quiet": false,
    "auditLog": ".impeccable/hook.ndjson"
  }
}</code></pre>
    <p>每位开发者自己的选择（包括安装授权）位于 <code>.impeccable/config.local.json</code>。</p>
    <p>检测器过滤项位于 <code>detector</code> 段而非 <code>hook</code> 段，因为它们由钩子和 CLI 检测器共享。</p>
    <p>环境变量仍可在单个 shell 里覆盖配置：<code>IMPECCABLE_HOOK_DISABLED</code>、<code>IMPECCABLE_HOOK_QUIET</code> 和 <code>IMPECCABLE_HOOK_LOG</code>。</p>
  </div>
</details>

<details class="docs-prose-details">
  <summary>调试钩子行为</summary>
  <div>
    <p>先看状态：</p>
    <pre><code>/impeccable hooks status</code></pre>
    <p>它会显示共享与本地配置路径、当前忽略项、钩子状态以及相关的环境变量覆盖。</p>
    <p>要调用日志，设置 <code>hook.auditLog</code> 或使用 <code>IMPECCABLE_HOOK_LOG</code>。钩子每次调用写一行 NDJSON。日常工作保持审计日志关闭。</p>
    <p>清单文件格式损坏时，安装/更新默认中止。只有想让 Impeccable 把损坏文件备份成 <code>.bak</code> 并替换时，才加 <code>--force</code> 重跑。</p>
  </div>
</details>
