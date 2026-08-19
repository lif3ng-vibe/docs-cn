---
title: "用量与限流追踪"
description: "在状态栏查看 Claude Code、Codex 等智能体的本地用量，在智能体被限流卡住之前就知道离限额有多近。"
source: "https://www.onorca.dev/docs/agents/usage-tracking"
---

Orca 读取 Claude Code、Codex、Gemini、OpenCode、Kimi Code 和 MiniMax 的本地用量状态并显示在状态栏，让你在智能体被限流卡住之前就知道距离限额还有多近。

## 显示内容

- 当前用量相对活动账号套餐的情况。
- 5 小时、每日、每周以及 Claude Fable 每周窗口（如适用）的重置倒计时。
- 用量超过某项限额 80% 时的警告微标。

## 工作原理

Orca 读取各智能体维护在磁盘上的本地用量状态（位于 `~/.claude`、`~/.codex` 以及 Gemini/OpenCode 的对应位置）。不调 API，也不需要额外认证。这意味着读数的新鲜度取决于智能体自己的记账——数字在智能体写入时更新，并非实时。

## 多账号计量

状态栏始终反映*活动*账号。其他已配置的账号可在账号切换器中看到各自的用量。

## 用量清单

点击状态栏中的用量区段可打开 **Usage**（用量）弹层。其中列出每个被追踪的提供方（图标 · 名称 · 套餐 · 最近重置时间 · 各窗口条形图），并按限额最紧张者优先排序。用头部的刷新控件可重新读取本地用量状态。

- **Detailed**（详细）——显示每个窗口的完整条形图、标签与百分比。
- **Compact**（紧凑）——每个提供方只显示最紧张的那个窗口。

在 [Settings → Appearance](/settings)（设置 → 外观）中，可选择这些数字按 **% used**（已用百分比）还是 **% remaining**（剩余百分比）显示。

没有实时数字的行会改为显示简短状态：**Loading usage…**（正在加载用量…）、**not signed in**（未登录）、**Usage unavailable**（用量不可用）、**No usage data**（无用量数据）或提供方特定错误。Claude 与 Codex 的行可深入账号切换；**Manage accounts**（管理账号）会打开 Settings。

### 移动端

在伴侣应用上，打开宿主机的 **Accounts**（账号）屏幕即可获得同样的切换器/用量读数。当 Codex 攒到 **rate-limit reset**（限流重置）额度时，可从该屏幕消耗一次（参见[移动伴侣应用](/mobile)）。

## 估算成本（Stats）

Stats 细分中可能为已知模型家族显示**估算成本**（包括 Claude 5 级和 Codex GPT-5.6 的行）。标有 **• inferred pricing**（推断定价）的行使用 Orca 的本地价格表，而非提供方的实时账单。权威的支出数据请以提供方控制台为准。
