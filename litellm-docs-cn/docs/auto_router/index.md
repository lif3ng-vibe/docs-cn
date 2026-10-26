---
title: Auto Router [附加组件]
sidebar_label: 概览
description: 将每个请求路由到能把它处理好的最便宜模型。涵盖基准测试、配置方法、推荐配置、提示词缓存，以及如何在自己的流量上评估路由器。
---

import NavigationCards from '@site/src/components/NavigationCards';
import AutoRouterDiagram from '@site/src/components/AutoRouterDiagram';

:::info[🚀 帮助塑造 Auto Router]

抢先体验，与 LiteLLM 团队直接协作，用你的生产流量影响产品路线图。

<a className="button button--primary button--lg" href="https://calendar.app.google/i2e7qVEJphHi5S8UA">申请成为设计合作伙伴</a>

<br /><br />

已经在测试了？欢迎在 [讨论 #32168](https://github.com/BerriAI/litellm/discussions/32168) 中分享你的结果。

:::

<AutoRouterDiagram />

- **一键配置**。“自动配置”会检查你的代理已在服务的模型，并自动填好全部四个层级，无需挑选模板。
- **客户端只需一个模型名**。网关对每个请求分类并挑选模型。
- **每层任意模型、任意提供商**。可以是单一模型、随机池，或 Thompson 采样池。
- **分类器可自选**。启发式规则、LLM、经由 TypeSafe System One Choice 的 JEV、关键词规则，或自定义插件。
- **按请求汇报节省**。以全部前沿模型为基线，展示在日志与 Cost Optimization 中。
- **对 Agent 友好**。提示词缓存（prompt caching）、上下文窗口升级、模态路由、任务中途停滞升级，以及可选的会话固定。

## 实测结果

| 结果 | 测量方式 | 延伸阅读 |
| --- | --- | --- |
| JEV：分类延迟中位数比 Haiku 快 5.43 倍，按注册价计算的分类器成本低 96.12% | 80 个人工编写的合成用例，三组成对重复，在统一固定评分标准下与人工预期层级的匹配率为 95.00% 对 73.75% | [JEV 对比](https://docs.litellm.ai/blog//blog/jev-auto-router-benchmark) |
| 成本降低 27% 的 Claude Opus-5 解题率 | Terminal-Bench 2.0 的 21 个任务子集，16/21 双方均解出 | [Terminal-Bench](https://docs.litellm.ai/blog//blog/auto-router-terminal-bench-benchmark) |
| Heuristic v2：比 v1 多解出 27% 的任务，单任务成本低 45% | 同一 21 个任务子集，无 LLM 分类器调用 | [Heuristic v2](https://docs.litellm.ai/blog//blog/heuristic-v2) |
| 便宜 74.5%，保持前沿模型 87.3% 的质量 | RouterArena，8,399 条评分查询 | [成本与质量](https://docs.litellm.ai/blog//blog/auto-router-cost-quality-benchmark) |
| 四个月节省 51.1%，共 12,249 美元 | 272,876 个生产请求，450+ 名用户 | [生产环境案例](https://docs.litellm.ai/blog//blog/auto-router-production-savings) |
| 比单纯缓存便宜 37% 到 69% | 五个数据集，含真实网关流量 | [提示词缓存](https://docs.litellm.ai/blog//blog/auto-router-prompt-caching-benchmark) |
| 88.1% 的响应与现有模型持平或更优 | 基于真实流量的影子评估（shadow evaluation），评审了 143 轮对话 | [影子评估](https://docs.litellm.ai/blog//blog/auto-router-shadow-evaluations) |

## 快速上手

- **仪表板**：进入 Models + Endpoints，点击 Add Model，切到 Auto Router 标签页，输入名称，然后点击 **自动配置** 或选择一个模板。核对各层级，运行 Test Routing，保存。
- **Agent**：告诉它 `run curl -fsSL https://docs.litellm.ai/skills/auto-router and follow the instructions`。
- **config.yaml**：添加一个 router 条目，其各层级指向同一文件中的其他模型。

```yaml title="config.yaml" keep-model-ids
model_list:
  - model_name: claude-haiku-4-5
    litellm_params:
      model: anthropic/claude-haiku-4-5
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-sonnet-5
    litellm_params:
      model: anthropic/claude-sonnet-5
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-opus-5
    litellm_params:
      model: anthropic/claude-opus-5
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    claude-haiku-4-5
          MEDIUM:    claude-sonnet-5
          COMPLEX:   claude-opus-5
          REASONING: claude-opus-5
        classifier_type: heuristic
      complexity_router_default_model: claude-sonnet-5
```

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{"model": "smart-router", "messages": [{"role": "user", "content": "What is 2+2?"}]}'
```

## 深入了解

配合托管的 Jev 或自托管的 Nimble 与 Laya 使用 **OSS Classifier**。[OSS 分类器指南](/docs/auto_router/decision_classifiers)涵盖配置方法、所需的网关与仪表板版本，以及如何从现有 Jev 配置迁移。分类器上下文、回退与计费说明见[分类器参考](/docs/proxy/auto_routing#jev-分类器)。

<NavigationCards
columns={3}
items={[
  {
    title: "管理员配置",
    description: "通过仪表板预设、Agent 技能、config.yaml 或 CLI 创建 Auto Router。",
    to: "/docs/auto_router/setup",
  },
  {
    title: "用户配置",
    description: "用 lite configure 接入 Claude Code 或 Codex，并在 Claude Code 中实时查看会话节省。",
    to: "/docs/auto_router/user_setup",
  },
  {
    title: "推荐配置",
    description: "1M 上下文、Anthropic、OpenAI、Gemini 与 Lite 阶梯配置的 config.yaml，外加基准测试与生产环境配置。",
    to: "/docs/auto_router/recommended_configurations",
  },
  {
    title: "公开基准测试",
    description: "Terminal-Bench 2.0、Heuristic v2、RouterArena、分类器上下文、生产环境案例与 Fusion。",
    to: "/docs/auto_router/benchmarks",
  },
  {
    title: "提示词缓存",
    description: "切换模型也能保持缓存热度。基于五个数据集实测。",
    to: "/docs/auto_router/prompt_caching",
  },
  {
    title: "在你的流量上评估",
    description: "切换前先做影子评估，切换后核算节省。",
    to: "/docs/auto_router/evaluate",
  },
  {
    title: "OTEL 遥测",
    description: "在 Lens 或 OTLP 后端中追踪所选配置、路由原因、分类器失败与重试。",
    to: "/docs/auto_router/telemetry",
  },
  {
    title: "功能历史",
    description: "Auto Router 各功能随哪个版本发布，附稳定版 GitHub release 链接。",
    to: "/docs/auto_router/feature_history",
  },
  {
    title: "配置参考",
    description: "complexity_router_config 的每个键及其默认值。",
    to: "/docs/proxy/auto_routing",
  },
]}
/>

## 发布博文

- [Harness 感知路由](https://docs.litellm.ai/blog//blog/auto-router-harness-aware-classification)：Claude Code 与 Codex 的上下文处理、加密的委派任务，以及分类器日志
- [任务中途停滞升级](https://docs.litellm.ai/blog//blog/auto-router-stall-escalation)：请求卡在重试循环时升一个层级
- [Auto Router v2](https://docs.litellm.ai/blog//blog/autorouter-v2)：一个路由器同时覆盖复杂度、语义与自适应路由
- [一键预设与 Test Routing](https://docs.litellm.ai/blog//blog/auto-router-setup-and-testing)
- [节省标签页与按请求分类器成本](https://docs.litellm.ai/blog//blog/auto-router-spend-visibility)
- [分类器上下文与用量基准](https://docs.litellm.ai/blog//blog/auto-router-context-and-benchmarks)
- [影子评估](https://docs.litellm.ai/blog//blog/auto-router-shadow-evaluations)
- [上下文长度与模态路由](https://docs.litellm.ai/blog//blog/auto-router-more-routing-configurations)
