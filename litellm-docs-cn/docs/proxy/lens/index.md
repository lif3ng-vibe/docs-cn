---
slug: /proxy/lens
title: LiteLLM Lens
description: 用 LiteLLM Lens 追踪智能体运行并排查反复出现的问题。
image: /img/lens/lens_hero_labeled.gif
---

# LiteLLM Lens

<p>
  <a className="button button--primary button--sm" href="https://forms.gle/3GC1Ner4vjthGWi18">抢先体验</a>
</p>

![智能体集群经 LiteLLM 网关流转，每次运行生成一条追踪记录，LiteLLM Lens 再把改进反哺回来。](/img/lens/lens_hero_labeled.gif)

智能体上线生产后，你不可能逐条人工审查每一次追踪。

LiteLLM Lens 用 AI 智能体分析智能体的追踪记录（trace），找出反复出现的问题。你只需定义预期行为，Lens 就会排查失败原因、把相似问题归类分组，并将每条发现关联回原始追踪记录。

通过 **Lens > Traces** 手动查看单次运行。通过 **Lens > Investigations** 调查一组运行，可按需触发，也可定时执行。

在开始配置前，可点击 Lens 标题旁的 **Preview sample**，浏览示例追踪、调查及其关联证据。点击 **Exit demo** 即可返回你自己的工作区。

## 快速上手

如果团队已经在用 Lens，可以直接[发送第一条追踪记录](./first-trace.md)。选择你使用的框架，给智能体起个名字，然后运行示例。

你可以[单独部署 Lens](./deployment/local.md)，或[把它加进 LiteLLM 仪表板](./deployment/litellm.md)。如果 Lens 已经在运行，可以[把该部署接入你的网关](./deployment/litellm.md#1-获取-lens-地址)。每篇指南最后都带有连接检查和第一条追踪记录。

阅读[编码智能体指南](./coding-agents.md)可以记录你个人的 Claude Code 或 Codex 会话。追踪记录就绪后，即可[发起一次调查](./investigations.md)，或查阅 [API 参考](./api.md)。

## Lens 的工作原理

**1. 捕获智能体的追踪记录**

把智能体的追踪记录发送给 Lens。打开某次运行，即可查看它的输入、响应和工具调用，以及延迟与成本。

![Lens Traces 页面，展示客服智能体的多次运行及其输入、耗时、成本、发现和用户反馈。](/img/lens/overview-traces.webp)

**2. 找出智能体的薄弱环节**

发起一次调查，找出追踪记录中的各类问题。每条发现都附带示例、修复建议，以及该问题在所分析追踪记录中的出现频率。

![Lens 发现：反复查询订单的问题、转交客服的建议，以及受影响追踪记录的占比。](/img/lens/overview-finding.webp)

**3. 把这些运行变成测试用例**

把运行保存进数据集，并补上你期望的响应。导出数据集，用来测试提示词、工具或模型的改动对智能体的影响。

![Lens 数据集，包含客服请求、已记录的回复、期望响应，以及 Export JSONL 按钮。](/img/lens/overview-dataset.webp)
