---
title: 提示词缓存
sidebar_label: 提示词缓存
description: 在轮次之间切换模型并不会丢掉提示词缓存。本文说明测量了什么、缓存为何得以保留，以及让它在智能体工作负载上保持热态的相关设置。
---

import NavigationCards from '@site/src/components/NavigationCards';

**质疑**：一个在对话中途切换模型的路由器，必然会把提示词缓存丢掉。

**实测**：并没有。Router 加缓存的组合，在每一个数据集上都比在单一固定模型上只用缓存更省钱。

| 评测 | 样本 | Router 加缓存 vs 仅用缓存 |
| --- | --- | --- |
| WildChat-1M 模拟，通用聊天 | 30,769 段多轮对话 | **便宜 68.7%** |
| DevGPT 模拟，开发者聊天 | 1,011 段对话 | **便宜 46%** |
| 真实智能体轨迹，按提供商缓存口径核算 | 95 个会话、8,174 次 API 调用 | **便宜 37.4%** |
| TwinRouterBench 静态赛道 | 81 个多步实例 | **便宜 44% 至 50%** |

- **切换不等于逐出**。当会话回到之前用过的模型时，缓存仍在原地。
- 真实网关流量中的 **4,684 次切回**：TTL 为 5 分钟时 **97.4%** 命中热缓存，TTL 为 1 小时时为 **99.3%**。
- **真正昂贵的错误恰恰相反**。关闭缓存的路由器，成本约为缓存单一固定模型的 **4 倍**。
- **节省统计如实计入了这一点**。全前沿基线在延续轮次上按热缓存计价，切换后全新写入缓存的开销也会从节省额中扣除。参见[已报告的节省金额](/docs/proxy/auto_routing#节省额报告)。

<NavigationCards
columns={2}
items={[
  {
    title: "提示词缓存在 Auto Router 下依然有效",
    description: "五个数据集、各自开启与关闭缓存时的成本对比、切回测量，以及相关配置。",
    to: "https://docs.litellm.ai/blog/auto-router-prompt-caching-benchmark",
  },
  {
    title: "会话亲和与部署亲和",
    description: "按需把对话固定在同一个模型、同一个部署上的两根“钉子”。",
    to: "/docs/proxy/auto_routing#session-affinity",
  },
]}
/>

## 何时仍应固定

- `session_affinity` **默认关闭**，而对大多数路由器来说这正是合理设置。上面的数字说明缓存并不需要它，固定反而会放弃后续轮次降档路由带来的节省。
- **当档位切换会改变客户端依赖的行为时，再把它打开**。有两类情况：
  - **历史记录里带着提供商专属状态**。一个模型产生的历史换到另一个模型上可能出错：把 Anthropic 的 `thinking` 块或 `cache_control` 标记回放给非 Anthropic 档位，或是不同提供商的工具调用格式互不兼容。固定能让会话留在产生这段历史的模型上。
  - **用户可见的一致性**。每个模型都有自己的风格。跨多轮生成版式、形状或组件的设计工作流，只有每一轮都出自同一个模型才能维持统一外观；需要保持一贯文风的写作助手也是同样的道理。
- **同族阶梯很少需要固定**。当所有档位都出自同一个提供商（全是 Claude、全是 GPT）时，历史可以干净回放，上面的缓存测量结果同样适用。保持关闭，让后续轮次往低档路由即可。
- 档位背后挂着多个部署时，还需要 `deployment_affinity` 以及 `router_settings` 里的 `prompt_caching` 调用前检查，这样延续轮次才会回到持有缓存的那个部署。
- 两者并用：[带负载均衡的编码智能体](/docs/auto_router/recommended_configurations#编码智能体与负载均衡)。

## 跨负载均衡部署的缓存

与路由器分开的一项独立能力：当同一个模型跨多个部署或 AWS 账户做负载均衡时，`prompt_caching` 调用前检查能让 Anthropic 缓存持续生效。

<NavigationCards
columns={2}
items={[
  {
    title: "Claude Code：提示词缓存路由",
    description: "在重复部署之间启用 prompt_caching 调用前检查，并在请求日志中确认缓存读取。",
    to: "/docs/tutorials/claude_code_prompt_cache_routing",
  },
]}
/>
