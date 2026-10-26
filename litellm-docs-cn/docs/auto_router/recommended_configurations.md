---
title: 推荐配置
sidebar_label: 推荐配置
description: 内置的 1M 上下文、Anthropic、OpenAI、Gemini 与 Lite 预设对应的 config.yaml、公开基准测试所用的配置，以及如何在它们之间做选择。
---

与仪表板中 Auto Router 模板对应的推荐阶梯。每一档都必须以 `model_name` 的形式存在于同一个文件中；把提供商前缀或凭证换成你自己的部署即可，路由器条目保持不变。

| 阶梯 | SIMPLE | MEDIUM | COMPLEX | REASONING | 分类器 |
| --- | --- | --- | --- | --- | --- |
| [1M 上下文](#1m-上下文) | gpt-5.6-luna | gpt-5.6-terra | gpt-5.6-sol | claude-opus-5, high effort | heuristic v2 |
| [Anthropic 家族](#anthropic-家族) | claude-haiku-4-5 | claude-sonnet-5 | claude-opus-5 | claude-opus-5, high effort | heuristic |
| [OpenAI 家族](#openai-家族) | gpt-5.6-luna | gpt-5.6-terra | gpt-5.6-sol | gpt-5.6-sol, xhigh effort | heuristic |
| [Gemini 家族](#gemini-家族) | gemini-2.5-flash-lite | gemini-3.1-flash-lite | gemini-3.7-flash | gemini-3.1-pro-preview | heuristic |
| [Lite](#lite) | deepseek-v4-flash | muse-spark-1.2, xhigh | kimi-k3, max | claude-opus-5 | LLM, agentic rubric |
| [基准测试配置](#基准测试配置) | claude-haiku-4-5 | claude-sonnet-5 | claude-opus-5 | claude-opus-5 | LLM, gpt-5.4-mini |
| [生产环境配置](#生产环境配置) | claude-haiku-4-5 | claude-haiku-4-5 | claude-sonnet-5 | claude-opus-5 | heuristic |

## 如何选择阶梯

- **单一家族**：客户端依赖特定提供商的行为时选它（如 Anthropic 的 cache control、OpenAI 的推理参数），所有档位都走同一个 API 面。
- **Lite**：成本比提供商一致性更重要、流量以智能体为主时选它。提供商混搭，使用带 `agentic` 评分标准的 LLM 分类器。
- **1M 上下文**：面向长提示词。Luna、Terra、Sol，再到高推理力度的 Opus 5，搭配 heuristic v2 分类器。
- **同一模型、更高推理力度**：用在最高一档。多花的是输出 token 数，而不是更高的单 token 单价。模式见 [推理力度阶梯](/docs/proxy/auto_routing#推理力度阶梯)。
- 所有阶梯都保持 `session_affinity` 关闭（默认值；参见 [提示词缓存](/docs/auto_router/prompt_caching)），并设置 `escalation_keywords: ["LITELLM ESCALATE"]`：消息中一旦出现这个精确短语，请求就会被上调一档。匹配区分大小写。

## Anthropic 家族

Haiku、Sonnet、Opus，最后是高推理力度的 Opus。

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
  - model_name: claude-opus-5-high
    litellm_params:
      model: anthropic/claude-opus-5
      api_key: os.environ/ANTHROPIC_API_KEY
      reasoning_effort: high

  - model_name: claude-auto
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    claude-haiku-4-5
          MEDIUM:    claude-sonnet-5
          COMPLEX:   claude-opus-5
          REASONING: claude-opus-5-high
        classifier_type: heuristic
        escalation_keywords: ["LITELLM ESCALATE"]
        session_affinity: false
      complexity_router_default_model: claude-sonnet-5
```

如果要让 Claude Code 或 Claude Desktop 发现这个路由器，路由器名称里要保留 `claude`。参见 [管理界面设置](/docs/auto_router/setup#claude-code-与-claude-desktop)。

## OpenAI 家族

Luna、Terra、Sol，最后是 xhigh 推理力度的 Sol。

```yaml title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-5.6-sol
    litellm_params:
      model: openai/gpt-5.6-sol
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-5.6-sol-xhigh
    litellm_params:
      model: openai/gpt-5.6-sol
      api_key: os.environ/OPENAI_API_KEY
      reasoning_effort: xhigh

  - model_name: gpt-auto
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    {{openai_small}}
          MEDIUM:    {{openai_large}}
          COMPLEX:   gpt-5.6-sol
          REASONING: gpt-5.6-sol-xhigh
        classifier_type: heuristic
        escalation_keywords: ["LITELLM ESCALATE"]
        session_affinity: false
      complexity_router_default_model: {{openai_large}}
```

## Gemini 家族

Flash Lite 2.5、Flash Lite 3.1、Flash 3.7，最后是 Pro 3.1。

```yaml title="config.yaml" keep-model-ids
model_list:
  - model_name: gemini-2.5-flash-lite
    litellm_params:
      model: gemini/gemini-2.5-flash-lite
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-3.1-flash-lite
    litellm_params:
      model: gemini/gemini-3.1-flash-lite
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-3.7-flash
    litellm_params:
      model: gemini/gemini-3.7-flash
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-3.1-pro-preview
    litellm_params:
      model: gemini/gemini-3.1-pro-preview
      api_key: os.environ/GEMINI_API_KEY

  - model_name: gemini-auto
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    gemini-2.5-flash-lite
          MEDIUM:    gemini-3.1-flash-lite
          COMPLEX:   gemini-3.7-flash
          REASONING: gemini-3.1-pro-preview
        classifier_type: heuristic
        escalation_keywords: ["LITELLM ESCALATE"]
        session_affinity: false
      complexity_router_default_model: gemini-3.1-flash-lite
```

## Lite

跨提供商，为成本而生。DeepSeek V4 Flash 同时充当 LLM 分类器，采用 `agentic` 评分标准，分类器上下文窗口为 0 轮。

```yaml title="config.yaml"
model_list:
  - model_name: deepseek-v4-flash
    litellm_params:
      model: deepseek/deepseek-v4-flash
      api_key: os.environ/DEEPSEEK_API_KEY
  - model_name: muse-spark-1.2-xhigh
    litellm_params:
      model: meta/muse-spark-1.2
      api_key: os.environ/META_API_KEY
      reasoning_effort: xhigh
  - model_name: kimi-k3-max
    litellm_params:
      model: moonshot/kimi-k3
      api_key: os.environ/MOONSHOT_API_KEY
      reasoning_effort: max
  - model_name: {{anthropic_large}}
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: lite-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    deepseek-v4-flash
          MEDIUM:    muse-spark-1.2-xhigh
          COMPLEX:   kimi-k3-max
          REASONING: {{anthropic_large}}
        classifier_type: llm
        classifier_llm_config:
          model: deepseek-v4-flash
          timeout_ms: 3000
          classification_rubric: agentic
        classifier_context_window_size: 0
        escalation_keywords: ["LITELLM ESCALATE"]
        session_affinity: false
      complexity_router_default_model: muse-spark-1.2-xhigh
```

## 1M 上下文

Luna、Terra、Sol，最后是高推理力度的 Opus 5。使用 heuristic v2 分类器，分类本身不产生额外的 LLM 调用。

GPT 各档最多接受 922K 输入 token，Opus 5 则可接受 1M。超出容量的提示词会被路由器挪到第一个装得下的更高档。参见 [上下文窗口升级](/docs/proxy/auto_routing#上下文窗口)。

```yaml title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-5.6-sol
    litellm_params:
      model: openai/gpt-5.6-sol
      api_key: os.environ/OPENAI_API_KEY
  - model_name: claude-opus-5-high
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY
      reasoning_effort: high

  - model_name: 1m-auto
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    {{openai_small}}
          MEDIUM:    {{openai_large}}
          COMPLEX:   gpt-5.6-sol
          REASONING: claude-opus-5-high
        classifier_type: heuristic_v2
        escalation_keywords: ["LITELLM ESCALATE"]
        session_affinity: false
      complexity_router_default_model: {{openai_large}}
```

## 基准测试配置

- [Terminal-Bench](https://docs.litellm.ai/blog//blog/auto-router-terminal-bench-benchmark)：采用本配置、由 gpt-5.4-mini 分类器仅看当前这条消息时，Opus-5 解题率持平而成本低 27%。
- [成本与质量](https://docs.litellm.ai/blog//blog/auto-router-cost-quality-benchmark) 和 [提示词缓存](https://docs.litellm.ai/blog//blog/auto-router-prompt-caching-benchmark)：档位相同，heuristic 分类器。

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
  - model_name: gpt-5.4-mini
    litellm_params:
      model: openai/gpt-5.4-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    claude-haiku-4-5
          MEDIUM:    claude-sonnet-5
          COMPLEX:   claude-opus-5
          REASONING: claude-opus-5
        classifier_type: llm
        classifier_llm_config:
          model: gpt-5.4-mini
        classifier_context_window_size: 0
      complexity_router_default_model: claude-sonnet-5
```

针对你自己的流量，分类器上下文窗口是最值得回头调的旋钮：

- Terminal-Bench：带上最近 3 条用户消息，解题率从 66.7% 提到 76.2%，成本上升 44%。再带助手回复则两者都变差。
- 对话流量（[v1.97 实测数据](https://docs.litellm.ai/blog//blog/auto-router-context-and-benchmarks)）：带上此前轮次，后续回答一致率从 14% 提到 78%。
- 随版本默认上线：3 轮用户消息，不带助手消息。

## 生产环境配置

- 报告节省 51.1% 的那篇 [生产环境案例](https://docs.litellm.ai/blog//blog/auto-router-production-savings)。
- Haiku 同时承担 SIMPLE 和 MEDIUM 两档；Opus 只留给 REASONING。
- 95% 的请求从未触及旗舰档。

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

  - model_name: claude-auto-latest
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    claude-haiku-4-5
          MEDIUM:    claude-haiku-4-5
          COMPLEX:   claude-sonnet-5
          REASONING: claude-opus-5
      complexity_router_default_model: claude-haiku-4-5
```

## 编码智能体与负载均衡

- 适用于某一档背后挂着多个部署的情形，例如同一个 Claude 模型同时接 Anthropic 和 Bedrock。
- `session_affinity` 把会话固定在同一档；`deployment_affinity` 配合 `prompt_caching` 的调用前检查，把请求固定在持有缓存的那个部署上。
- 在智能体流量上两者都很要紧。详见 [会话亲和性](/docs/proxy/auto_routing#session-affinity)。

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
  - model_name: claude-sonnet-5
    litellm_params:
      model: bedrock/us.anthropic.claude-sonnet-5
      aws_region_name: us-east-1
  - model_name: claude-opus-5
    litellm_params:
      model: anthropic/claude-opus-5
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-auto
    litellm_params:
      model: auto_router/complexity_router
      cache_control_injection_points:
        - location: message
          role: system
      complexity_router_config:
        tiers:
          SIMPLE:    claude-haiku-4-5
          MEDIUM:    claude-sonnet-5
          COMPLEX:   claude-sonnet-5
          REASONING: claude-opus-5
        session_affinity: true
        session_affinity_ttl_seconds: 3600
      complexity_router_default_model: claude-sonnet-5

router_settings:
  optional_pre_call_checks: ["deployment_affinity", "session_affinity", "prompt_caching"]
  deployment_affinity_ttl_seconds: 3600
```
