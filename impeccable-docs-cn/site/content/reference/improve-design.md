---
title: 改进现有设计
tagline: "从觉得不对劲的地方开始。"
description: "评审现有界面，做专注的改进，并在保留你想留住的设计决策的同时检查结果。"
section: concepts
order: 4
---

打开想改进的页面，用自己的话描述问题。说清什么必须保留：品牌、布局、内容，或用户已经依赖的某个行为。

```text
/impeccable this dashboard feels crowded and the important numbers are hard to find. Improve the hierarchy while keeping our colors and existing features.
```

你不需要知道哪条命令合适。Impeccable 可以检查页面，并根据你的请求选择处理方式。

## 找到问题

拿不准哪里需要改时，先要一次 critique：

```text
/impeccable critique the dashboard
```

读完发现，让 agent 处理你想改的那些。critique 负责评审设计，不会自动应用每一条建议的修复。完整示例见[用视觉覆盖层做评审](/docs-cn/impeccable/tutorials/critique-with-overlay))。

## 做一次专注的改进

描述你想要的结果；已经清楚要哪类改动时，直接用命令：

```text
/impeccable polish the pricing page. Keep our colors, plan names, and monthly/yearly switch.
```

**改前**

> Launch / 14 · On track · Release planning
> Ship the *launch plan* by Friday.
> Owners, dependencies, and decisions in one view.
> 8 of 11 decisions closed · Review plan →

**改后**

> Launch / 14 · On track
> Ship the launch plan by Friday.
> Owners, dependencies, and decisions in one view.
> 8 of 11 decisions closed · Review plan →

来自首页 demo 的 polish 图示示例。任务和内容保持可辨认；标题更容易扫读，多余的标签、装饰性侧边框和闪烁的状态点都被移除。

### 为特定类型的改进选择命令

| 需要处理的问题 | 试试 |
|---|---|
| 细节未完成、对不齐，或间距不一致 | [polish](/docs-cn/impeccable/docs/polish)) |
| 页面结构混乱或层级薄弱 | [layout](/docs-cn/impeccable/docs/layout)) |
| 文本难读或字体不统一 | [typeset](/docs-cn/impeccable/docs/typeset)) |
| 内容太多、互相竞争 | [distill](/docs-cn/impeccable/docs/distill)) |
| 标签含糊或说明不清 | [clarify](/docs-cn/impeccable/docs/clarify)) |
| 设计显得太怯或太吵 | [bolder](/docs-cn/impeccable/docs/bolder)) 或 [quieter](/docs-cn/impeccable/docs/quieter)) |

想在运行中的页面上看视觉备选方案，用 [generate](/docs-cn/impeccable/docs/generate)) 点名元素和方向：

```text
/impeccable generate 3 bold variants of the pricing cards
```

在浏览器里比较这些备选方案，把想要的那个采纳进源码。想自己选取元素、做标注，见[用 Live Mode 迭代](/docs-cn/impeccable/tutorials/iterate-live))。

## 决定是否要重设计

专注的改进会保留当前的视觉识别。想替换它，就明说：

```text
/impeccable redesign the marketing site. Keep the product facts and signup flow, but replace the current visual style.
```

重设计会走[构建新东西](/docs-cn/impeccable/docs/new-work))的流程，包括选定方向、决定是否先评审视觉稿。例行 polish 不需要这套流程。想让后续工作延续既有的品牌识别，[把设计系统记录下来](/docs-cn/impeccable/docs/design-system))。

## 检查结果

试用页面的主要任务，在窄宽度下检查一遍，并审阅代码改动。告诉 agent 哪些起效了、哪些还需要调整。具体的反馈最有用：

> 方案对比更容易读了。保留这一点，但把月付/年付开关挪回它上面去。

上线前，用 [audit](/docs-cn/impeccable/docs/audit)) 查无障碍、性能和响应式问题。希望以后的 UI 编辑都能得到检测器反馈，就启用[自动设计检查](/docs-cn/impeccable/docs/hooks))。
