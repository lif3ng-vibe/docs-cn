# [BETA] 自适应路由器

:::info

Beta 功能。欢迎通过 [Discord](https://discord.gg/wuPM9dRgDw) 或 [Slack](https://join.slack.com/t/litellmossslack/shared_invite/zt-3o7nkuyfr-p_kbNJj8taRfXGgQI1~YyA) 反馈使用体验。

:::

**前提条件**：需要搭配 Postgres 数据库的 LiteLLM 代理服务器（Proxy）。质量评估数据存在 Postgres 中，启动时加载。没有数据库时路由器照常工作，但重启后会把学到的东西全部忘掉。

你有一个便宜模型和一个昂贵模型，希望便宜的在效果够好时就顶上，真正关键的任务才交给贵的，又不想硬编码一套得花几个月调优的规则。

自适应路由器（adaptive router）会自动搞定这件事。它追踪每类请求（代码、写作、分析等）下哪个模型表现最好，并据此路由，按你掌控的权重在质量与成本之间取得平衡。

## 快速上手

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
    model_info:
      input_cost_per_token: 0.000002
      adaptive_router_preferences:
        quality_tier: 3        # 1=budget, 2=mid, 3=frontier
        strengths: ["code_generation", "analytical_reasoning"]

  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
    model_info:
      input_cost_per_token: 0.0000002
      adaptive_router_preferences:
        quality_tier: 2
        strengths: ["factual_lookup"]

  - model_name: my-router
    litellm_params:
      model: auto_router/adaptive_router
      adaptive_router_config:
        available_models: ["{{openai_large}}", "{{openai_small}}"]
        weights:
          quality: 0.7   # raise this if quality complaints; lower if bill too high
          cost: 0.3      # must sum to 1.0 with quality
```

把 `model` 设为自适应路由器的名称即可路由到它：

```bash
curl -X POST {{baseURL}}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "my-router",
    "messages": [
      {"role": "user", "content": "build me a python script that parses CSV"},
      {"role": "assistant", "content": "Here is a script using csv.DictReader..."},
      {"role": "user", "content": "now add error handling for missing files"},
      {"role": "assistant", "content": "Wrap the open() call in a try/except FileNotFoundError..."},
      {"role": "user", "content": "perfect, that worked. thanks!"}
    ]
  }'
```

响应头里会告诉你实际选中的是哪个模型：

```
x-litellm-adaptive-router-model: {{openai_large}}
```

上面示例中那句 "thanks!" 触发了一个满意度信号，正是它在推动多臂老虎机（bandit）算法更新。

## 调整成本与质量的权衡

`weights` 是你最主要的调节杠杆：

| 目标 | quality | cost |
|---|---|---|
| 尽量省钱，质量其次 | 0.3 | 0.7 |
| 均衡 | 0.5 | 0.5 |
| 质量优先（默认） | 0.7 | 0.3 |
| 质量不容妥协 | 0.9 | 0.1 |

路由器会随时间不断学习。每个模型最初的约 10 次请求内，它依赖你声明的档位；此后由真实表现数据接管。

## 为单个请求强制最低质量档位

如果某个请求不计成本也必须用前沿模型（frontier model），请传入这个请求头：

```
x-litellm-min-quality-tier: 3
```

也可以不走请求头，改为在请求元数据（metadata）里传 `min_quality_tier`。

## 学习内容

路由器把每个请求归入 7 种类型之一，并分别追踪每个模型在每种类型上的表现。一个擅长事实查询却不擅长代码的模型，即使整体更便宜，也会在事实类请求中胜出、在代码类请求中落选。

| 类型 | 示例 |
|---|---|
| `code_generation` | "帮我写一个 Python 排序函数" |
| `code_understanding` | "解释一下这个函数是做什么的" |
| `technical_design` | "这个 API 应该怎么设计？" |
| `analytical_reasoning` | "计算……的概率" |
| `writing` | "给团队起草一封关于……的邮件" |
| `factual_lookup` | "法国的首都是哪里？" |
| `general` | 其他一切请求 |

[**查看分类器代码**](https://github.com/BerriAI/litellm/blob/litellm_adaptive_routing/litellm/router_strategy/adaptive_router/classifier.py)

学习信号的设计借鉴了 [Signals: Trajectory Sampling and Triage for Agentic Interactions](https://arxiv.org/pdf/2604.00356) 一文。

## 查看当前状态

```
GET /adaptive_router/state
```

仅限管理员访问。每个已配置的自适应路由器返回一份快照（由 `router_name` 字段区分），包含每个模型在每种请求类型上的当前质量评估。想弄清某个模型为何被选中或落选时很有用。

```json
{
  "routers": [
    {
      "router_name": "smart-cheap-router",
      "available_models": ["fast", "smart"],
      "weights": { "quality": 0.7, "cost": 0.3 },
      "cells": [
        {
          "request_type": "analytical_reasoning",
          "model": "fast",
          "quality_mean": 0.5,
          "samples": 0
        },
        {
          "request_type": "analytical_reasoning",
          "model": "smart",
          "quality_mean": 0.95,
          "samples": 0
        }
      ]
    }
  ]
}
```

`quality_mean` 是最关键的数字：路由器当前估计该模型处理这类请求的水平。`samples` 统计有多少次真实观测更新过先验（从 0 开始；冷启动阶段的先验权重不计入其中）。

## 已知局限

- 延迟不参与评分；慢模型仍可能凭质量 + 成本胜出
- 信号基于正则匹配且偏向英文；没有 LLM 评审
- 每个单元格（cell）最多记录 200 次观测的硬上限；暂无衰减机制
- 某个会话一旦选定模型，该会话中其他模型的轮次就不会参与学习
