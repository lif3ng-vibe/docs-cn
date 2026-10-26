---
title: "[Beta] 自动路由"
sidebar_label: "[Beta] 自动路由"
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [Beta] 自动路由

一个路由器统一复杂度、语义与自适应路由。用启发式规则、LLM 分类器、经由 TypeSafe System One Choice 的 JEV、词面/语义关键词规则，或你自己的分类器插件给每个请求分类，然后按层级路由到固定模型、随机池或 Thompson 采样池

:::info[可用性]

自动路由目前处于 **beta** 阶段，配置键与默认值在后续版本中仍可能变化。随 **v1.94.x** 发布。最早的 dev 版本于 **2026-07-14（周二）** 发布。建议与反馈：[discussion #32168](https://github.com/BerriAI/litellm/discussions/32168)。

:::

## 何时使用

| 功能      | 语义自动路由器（已废弃） | 自动路由（本页） |
| ------------ | --------------------------------- | -------------------------------------------------------------------------- |
| 分类器   | 基于话语的嵌入匹配     | 启发式规则、LLM 分类器、JEV、词面/语义关键词规则或你自己的插件 |
| 层级取值   | 单个模型                         | 单模型、随机池或自适应（Thompson 采样）池 |
| 延迟      | 约 100-500ms（一次嵌入调用）       | 亚毫秒级（启发式/关键词）或一次小型分类器调用（LLM） |
| 会话固定  | 无                                | 可选 `session_affinity`（默认关闭），以 `session_id` 元数据为键 |
| 日志          | 无路由原因信号           | 每次决策带 `cause=` 标记（scorer、literal、semantic、session_pin、LLM、plugin） |
| 适用场景     | 基于意图的路由              | 成本/质量分层、规则加分类器的混合方案、提示词缓存固定 |

[语义自动路由器](./auto_routing_semantic.md)已废弃，但现有配置仍可继续使用。

## 快速上手（Proxy）

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params: {model: openai/{{openai_small}}, api_key: os.environ/OPENAI_API_KEY}
  - model_name: {{openai_large}}
    litellm_params: {model: openai/{{openai_large}}, api_key: os.environ/OPENAI_API_KEY}
  - model_name: {{anthropic}}
    litellm_params: {model: anthropic/{{anthropic}}, api_key: os.environ/ANTHROPIC_API_KEY}
  - model_name: {{anthropic_large}}
    litellm_params: {model: anthropic/{{anthropic_large}}, api_key: os.environ/ANTHROPIC_API_KEY}

  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE:    {{openai_small}}
          MEDIUM:    {{openai_large}}
          COMPLEX:   {{anthropic}}
          REASONING: {{anthropic_large}}
      complexity_router_default_model: {{openai_large}}
```

像调用其他模型一样调用它：

```shell
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{"model": "smart-router", "messages": [{"role": "user", "content": "What is 2+2?"}]}'
```

## 与你的 agent 一起配置

开始时，告诉你的 agent：

```
run curl -fsSL https://docs.litellm.ai/skills/auto-router and follow the instructions
```

它会读取你的代理已在服务的模型，询问你希望路由器叫什么名字、每个层级由哪个模型承担，并在写入任何内容之前先说明它默认采用的设定。

## 完整配置

v2 暴露的所有配置项。`complexity_router_config` 上除 `tiers` 外的所有字段都是可选的。

```yaml
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    drop_params: true
    complexity_router_config:
      tiers:
        SIMPLE:    ["{{openai_small}}", "{{gemini_flash}}"]   # random-pick pool
        MEDIUM:    {{openai_large}}                                 # single pin
        COMPLEX:   {{anthropic}}
        REASONING: {{anthropic_large}}

      # Optional display names; omit to keep SIMPLE/MEDIUM/COMPLEX/REASONING everywhere
      # tier_labels:
      #   SIMPLE: Cheap

      # LLM classifier instead of the heuristic scorer
      classifier_type: llm
      classifier_llm_config:
        model: {{anthropic}}
        timeout_ms: 2000
        # system_prompt: <your rubric>         # replaces the built-in rubric entirely; omit for the default
      classifier_fallback: heuristic           # default; or default_model
      # Prior conversation the classifier sees (LLM or JEV)
      classifier_context_window_size: 3          # default 3; 0 disables
      classifier_context_budget_chars: 8000     # default 8000
      # classifier_context_per_turn_chars: 200  # optional per-turn cap; unset by default
      classifier_context_include_assistant_turns: false   # default false

      # Or hand the tier decision to your own code (config file only)
      # classifier_type: custom
      # classifier_plugin: classifiers.tier_by_team   # dotted path to an async classify(context)
      # classifier_plugin_timeout_ms: 3000            # default

      # Keyword rules, run before the scorer, escalate to the highest matched tier
      keyword_tier_rules:
        - keywords: ["hi", "hello", "thanks"]
          tier: SIMPLE
        - keywords: ["kubernetes", "k8s", "istio"]
          tier: REASONING
      semantic_keyword_matching: true
      embedding_model: voyage-3-5
      match_threshold: 0.5

      # Append to the built-in technical keyword list
      custom_technical_keywords: [kafka, redis, postgresql, udp, dns]

      # Marker pair whose blocks are stripped before classification
      reminder_markers: ["<system-reminder>", "</system-reminder>"]   # default

      # Escalate a prompt that provably does not fit the decided tier, before dispatch
      enable_context_window_escalation: false   # default; set true to opt in
      context_window_escalation_buffer: 0.95   # default; prompt must fit within this fraction of the window

      # Send image-bearing requests to a tier that can see them
      modality_routing: false   # default; set true to opt in

      # Classify new user asks only, carrying the decision through continuation turns
      classification_mode: every_request   # default; or user_turn

      # Thompson-sample within the tier's pool
      adaptive: true

      # Pin a session to its first-turn model to preserve prompt cache
      session_affinity: false   # default; set true to pin
      session_affinity_ttl_seconds: 3600

      # Return the model the router picked in the response body `model` field
      # instead of restamping it back to the alias the client called
      return_raw_model_name: false   # default

      # Tune heuristic scorer boundaries and weights (all optional)
      tier_boundaries:
        simple_medium:     0.15
        medium_complex:    0.35
        complex_reasoning: 0.60
      token_thresholds:
        simple:  15
        complex: 400
      dimension_weights:
        tokenCount:        0.10
        codePresence:      0.30
        reasoningMarkers:  0.25
        technicalTerms:    0.25
        simpleIndicators:  0.05
        multiStepPatterns: 0.03
        questionComplexity: 0.02

    complexity_router_default_model: {{anthropic}}

    # Compression guardrail per hop; a guardrail name, or `none`. Both unset (the
    # default) keeps whatever compression the key, team, or request already applies
    # on both hops
    # auto_router_routing_compression: headroom-compression
    # auto_router_model_compression: none
```

## 分类

选择一个分类器，并可在分类前叠加可选的关键词规则。除非另行配置，LLM、JEV 或自定义分类器失败时都会回退到启发式评分器。

**启发式评分器（默认）**。零 API 调用，亚毫秒级。沿七个维度给每个请求打分，并把分数映射到某个层级。

| 维度          | 检测内容                                 |
| ------------------ | ----------------------------------------------- |
| tokenCount         | 过短（&lt;15）或过长（&gt;400）的提示词        |
| codePresence       | "function"、"class"、"api"、"database" 等    |
| reasoningMarkers   | "step by step"、"think through"、"analyze"      |
| technicalTerms     | "architecture"、"distributed"、"encryption"     |
| simpleIndicators   | "what is"、"define"、问候语                  |
| multiStepPatterns  | "first...then"、分步骤列举                  |
| questionComplexity | 多个问号                                         |

只要出现两个及以上推理标记，无论加权得分如何都会直接路由到 `REASONING`。

**LLM 分类器**。使用一个小而快的模型（gpt-5.6-luna、Claude Sonnet 5，或你指定的任何模型）并配合结构化输出。它走同一个 `Router` 实例，因此凭证、预算与回退机制同样生效。超时、内容为空或 schema 不匹配时，会回退到启发式评分器；若设置 `classifier_fallback: default_model`，则回退到 `complexity_router_default_model`。分类目标不是复杂度的分类器应当选后者，因为复杂度分数得出的层级与其自身的分类体系并不相关。

```yaml
classifier_type: llm
classifier_llm_config:
  model: {{anthropic}}
  timeout_ms: 2000
```

### JEV 分类器

本参考文档保留已发布版本支持的字段名。包含 [backend #43626](https://github.com/BerriAI/litellm/pull/43626) 的构建还接受 `classifier_type: oss_classifier` 加 `opensource_classifier_config.provider: jev`，下述设置放在 `opensource_classifier_config` 内。原有字段名仍然可用。迁移方法以及 Jev、Nimble、Laya 提供商的配置见 [OSS 分类器指南](/docs/auto_router/decision_classifiers)。

设置 `classifier_type: jev` 与 `jev_classifier_config` 即可使用 [TypeSafe System One](/docs/pass_through/typesafe)。它会向 `POST /v1/systemone` 发送一道 `questions.tier` Choice 问题，分类输入放在 `state` 中，层级描述放在 `criteria` 中，返回的选择即用于挑选既有的层级池。配置与仪表板操作见[相关说明](/docs/auto_router/setup#jev-分类器typesafe-ai)。

```yaml
classifier_type: jev
jev_classifier_config:
  model: jev-latest
  timeout_ms: 3000
  circuit_breaker_enabled: true
  circuit_breaker_cooldown_seconds: 30
classifier_fallback: heuristic
classifier_context_window_size: 3
classifier_context_budget_chars: 8000
classifier_context_include_assistant_turns: false
```

| `jev_classifier_config` 字段 | 默认值 | 行为 |
| --- | --- | --- |
| `model` | `jev-latest` | TypeSafe 模型标识，不带 `typesafe/` 前缀。要得到可复现的评测，请固定版本 |
| `api_key` | `null` | 省略时从服务器读取 `TYPESAFE_API_KEY` |
| `api_base` | `null` | 读取 `TYPESAFE_API_BASE`，否则回退到 `https://api.typesafe.ai`。显式设置本字段时必须同时显式设置 `api_key` |
| `timeout_ms` | `3000` | 单次分类的截止时间，最小 1 毫秒 |
| `instructions` | `null` | 替换内置的问题指令，省略即用默认值，空白字符串会被拒绝 |
| `circuit_breaker_enabled` | `true` | 为该路由器实例启用进程内的超时熔断器 |
| `circuit_breaker_cooldown_seconds` | `30` | 冷却期（正值），期间只放行一次恢复探测 |

#### 发送给 JEV 的上下文

JEV 与 LLM 分类器共用同一套分类上下文构建逻辑。`classifier_context_window_size` 默认取最近三轮用户轮次；`classifier_context_budget_chars` 默认给 8000 字符的历史轮次文本，优先取最新的轮次；`classifier_context_per_turn_chars` 是可选的正数上限，默认不设；`classifier_context_include_assistant_turns: true` 会把助手文本纳入，并让窗口同时统计两种角色。

默认情况下，历史轮次会发送到所配置的 TypeSafe 端点，即使补全由其他提供商承担。除非显式开启，助手轮次不会包含在内。已有的 JEV 路由器升级到[上下文集成](https://github.com/BerriAI/litellm/pull/41886)后即获得这一历史行为。若想在升级前避免把历史对话送进 JEV 请求，可先设置 `classifier_context_window_size: 0`。

这些上限只覆盖历史轮次文本。当前提问与提取出的系统文本不计入该预算，历史轮次的编号同样不计入。可识别的 Claude Code 请求会去掉其 harness 系统文本。窗口大小设为 `0` 时关闭历史轮次上下文，字符预算低于 `120` 时该块整体省略。增加上下文会改变发送给 TypeSafe 的内容，也可能改变分类成本与层级选择。

#### 回退与恢复

超时、HTTP 失败、响应格式错误、选择项缺失或未知，以及熔断打开时，都会走既有的分类器回退。对内置层级，默认是 `classifier_fallback: heuristic`；`classifier_fallback: default_model` 会把请求发给 `litellm_params.complexity_router_default_model`。对自定义层级，若配置了 `fallback_tier`，它优先于上述设置。

熔断器在识别到分类超时时打开。冷却期内，请求直接走回退，不再发起 JEV 调用。冷却结束后，由一个请求负责探测恢复，其余请求继续回退。探测成功则关闭熔断器，失败则重新打开。熔断关闭期间的普通非超时失败只走回退，不会触发熔断。该状态属于单个进程内的单个路由器实例，不在 worker 之间共享。

分类器截止时间只约束等待分类的时长。它不保证已被取消的提供商请求未被接收或计费，回退补全本身仍可能在对应提供商处失败。

#### 自定义、许可与授权

内置 JEV 分类无需企业版许可即可使用，政策与内置 LLM 分类器一致。替换 `instructions` 或定义 `tier_definitions` 则使用既有的企业版自定义分类器能力。设置 `tier_definitions` 时，每条描述都会成为对应的 Choice criterion。JEV 同样支持常规的 `enable_non_reasoning_tier` 配置。

依赖授权把 JEV 识别为角色为 `evaluation` 的 `typesafe/<configured model>`，与路由器的层级、默认及嵌入依赖并列。受限密钥与团队成员需要对其可调用的依赖有访问权限。团队成员管理类写入不能提供 `api_key` 或 `api_base`，即使用户有权编辑路由器。选择 JEV 不会带来额外的模型或管理权限。

#### Test Routing 与计费核算

`POST /auto_router/test_routing` 只做分类，不向所选层级发送补全。但 JEV 调用与语义嵌入调用仍可能产生提供商花费。请求中的 `default_model` 字段用于指定本次预览的默认模型。**Test Connection** 还会探测 JEV 与已配置的模型依赖，因此可能同时产生分类与补全两笔费用。

Test Routing 会检查对其可调用模型的访问权限，并在分类前执行虚拟密钥（virtual key）预算限制。团队与成员策略同样通过管理路由授权生效。预览不会因为跳过下游补全而绕过这些检查。

成功的 JEV 决策会记录 `cause: jev_classifier`、`classifier_model: typesafe/<model>`、`classifier_probabilities`、`classifier_confidence`，以及在可计价时的 `classifier_cost`。模型取 TypeSafe 返回的版本，响应未给出时用所配置的模型。概率描述的是 TypeSafe 的选择，并非独立测得的正确性。

JEV 用量会作为一条独立的分类器调用记录日志，并携带原始请求的身份元数据。返回的输入/输出 token 用模型注册表计价；缺少用量或价格时成本记为未知。只要 HTTP 响应带可用的用量，即使其选择后来未通过校验也会被记录，但回退决策不保证有 `classifier_cost` 值。对账时，除了父补全记录，还要查看这条独立的分类器记录。

对成功的分类，Auto Router 报告的节省额已扣除 `classifier_cost`。汇总已包含分类器调用的花费记录时，不要把该元数据再加一遍。评估与节省核算见[相关说明](/docs/auto_router/evaluate#在自己的提示词上评估-jev)，基准测试的成本口径见[博客](https://docs.litellm.ai/blog//blog/jev-auto-router-benchmark)。

### 关键词规则

确定性的短路路径。命中关键词，即落入对应层级。多条规则同时命中时，路由会升到其中最高的层级（`SIMPLE < MEDIUM < COMPLEX < REASONING`），因此规则顺序不会悄悄改变行为。

开启 `semantic_keyword_matching` 即可通过嵌入匹配同义改写。语义打分采用 MAX 聚合，某个层级中一个关键词的强匹配不会被该层级的其他话语稀释。查询嵌入会带上调用方的请求元数据，其花费因此归属到发起请求的密钥。嵌入失败时，路由器回退到评分器。

```yaml
keyword_tier_rules:
  - keywords: ["hi", "hello", "thanks"]
    tier: SIMPLE
  - keywords: ["kubernetes", "k8s", "istio"]
    tier: REASONING
semantic_keyword_matching: true
embedding_model: voyage-3-5
match_threshold: 0.5
```

**自定义分类器插件**。层级由你自己的代码决定。设置 `classifier_type: custom`，并把 `classifier_plugin` 指向一个带异步 `classify(context)` 的对象的点分路径，解析方式与 routing [`plugins`](../routing_plugins.md) 相同。当层级根本不是对提示词的判断时用它：按团队或租户套餐路由，按你自有服务里的某个开关路由，按任何你能用 Python 表达的规则路由。

:::info

自定义分类器插件随 **v1.99.x** 发布（[PR #37249](https://github.com/BerriAI/litellm/pull/37249)）。仅限配置文件：与 `plugins` 一样，`classifier_plugin` 不能通过模型管理 API 或 UI 设置，因为活对象无法通过 HTTP 传输。

:::

```yaml title="config.yaml"
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    complexity_router_config:
      classifier_type: custom
      classifier_plugin: classifiers.tier_by_team   # dotted path, resolved next to this config file
      classifier_plugin_timeout_ms: 3000            # default
      tiers:
        SIMPLE:    {{openai_small}}
        REASONING: {{openai_large}}
    complexity_router_default_model: {{openai_small}}
```

```python title="classifiers.py"
from litellm.types.router import RoutingContext


class TierByTeam:
    async def classify(self, context: RoutingContext) -> str | None:
        team = context.metadata.get("user_api_key_team_alias")
        if team == "research":
            return "REASONING"
        if team == "support":
            return "SIMPLE"
        return None   # decline, and let classifier_fallback decide


tier_by_team = TierByTeam()
```

`context` 与 routing 插件收到的是同一个 `RoutingContext`：`raw_messages`、`structured_messages`（已归一化为 OpenAI chat 格式）、`metadata` 和 `candidate_models`。调用方身份随 `metadata` 一起传来，因此 `user_api_key_team_id`、`user_api_key_team_alias` 和 `user_api_key_user_id` 无需你自己搭管道即可读取。这里的 `candidate_models` 只是各层级模型的信息性快照，不是 routing 插件用来收窄的过滤面：你返回的层级决定池子，改动这个列表不会有效果。

返回某个层级的名字：内置层级（`SIMPLE`、`MEDIUM`、`COMPLEX`、`REASONING`），或其 `tier_labels` 显示名。返回 `None` 表示放弃决定。

其他任何情况都按可用性问题而非策略处理，回退方式与 LLM 分类器完全一致。返回 `None`、抛出异常、调用超过 `classifier_plugin_timeout_ms`、路由器不认识的层级名，以及没有配置任何模型的层级，都会把请求交给 `classifier_fallback`：默认是启发式评分器，或 `default_model`。插件宕机只会让路由退化，绝不会让请求失败。

配置错误会在启动时暴露，而不是等到第一次分类请求。`classify` 缺失或不是 `async` 的 `classifier_plugin` 会被拒绝并指明配置键；`classifier_type: custom` 却没配插件会报错；把插件配在其他 `classifier_type` 下也会报错，因为它永远不会执行。

路由器上的其他机制照常生效。`keyword_tier_rules` 在插件之前短路；升级关键词仍会把它返回的层级再往上抬；`adaptive: true` 仍会在该层级池内做 Thompson 采样；`session_affinity: true` 仍会把会话固定在首轮模型。`classifier_context_*` 设置只对 LLM 分类器有效；插件直接拿到消息，自行决定读多少。

### 参与分类的内容

请求不会被当作一整块来分类。路由器会从消息列表里提取**最后一条真实的人类提问**和**最新的系统提示词**，针对当前请求的打分路径读的是这些字符串，而不是原始负载。分类器上下文窗口还可以附加历史轮次与轨迹估算，下文详述。这在 agent harness 场景下最关键：单个轮次到达时，往往是一个巨大的共享系统前缀，加一堆工具结果，加一行提问。

提取按消息列表从新到旧进行，返回第一个仍带人类文本的用户轮次。内容扁平化时只保留 `type == "text"` 块，因此整个内容都是工具输出的轮次会扁平化成空字符串并被跳过，不会被当作提问接受；在 Messages 接口上，工具结果挂在用户轮次的非文本 `tool_result` 块里，在 chat completions 上则位于 `tool` 角色，后者从不读取。完整成对的 `<system-reminder>` ... `</system-reminder>` 块会在文本使用前被移除，围绕它们写下的提问得以保留。标记匹配是字面且大小写不敏感的；未闭合的起始标签不算块，保持原样；若 harness 的提醒标记用了别的写法，可用 `reminder_markers` 换一对。当每个用户轮次里只剩管道性内容时，就没有提问可言，请求会落到 `complexity_router_default_model`，而不是让 harness 注入的文本决定层级。在配置了 `plugins` 的路由器上，它会改走 `MEDIUM` 池，默认模型因此永远绕不过插件管线。

结果正是内行读者通常以为缺失的那一点："fix this typo"和"refactor the auth subsystem"各自按自己的提问打分，而不会被它们共享的 4 万 token 系统前缀和提醒块强行归入同一层级。

剥离后的人类提问是唯一会进入 `keyword_tier_rules`、语义关键词匹配、升级关键词以及启发式评分器推理标记维度的文本。系统提示词单独提取，且**不**做提醒剥离；它供启发式评分器的代码、技术与简单维度使用，并被原样引用进 LLM 分类器的负载。推理标记刻意只读人类提问，这正是防止一条 `You are an expert engineer. Always think step by step.` 系统提示词把会话里所有请求都钉死在 `REASONING` 上的原因。升级关键词更窄：只读最新用户轮次剥离后的文本，因此一次要求升级的请求不会在其后每个工具轮次上反复触发。

在出现两个及以上推理标记时强制 `REASONING` 的启发式覆盖属于评分器的一部分，因此它在 `classifier_type` 为 `heuristic` 时生效，也在分类器调用失败后的评分器回退中生效。走 LLM 分类器路径时，分类器返回的层级会被原样采用。

已废弃的[语义自动路由器](./auto_routing_semantic.md)契约要薄得多。它只取最新的用户消息，返回该消息扁平化的结果：不做提醒剥离，不看系统提示词，也不做跳过，因此只含工具结果块的最新轮次会得到空字符串并被原样嵌入。真正嵌入的内容在调用 `auto_router_embedding_model` 前会截断到前 `auto_router_max_input_chars` 个字符（默认 2000，保留开头），因为截断后的提示词仍可路由，超长的提示词则会直接报错。在 agent harness 下，这相当于只按某个轮次的开头路由，而这正是内行读者容易误以为复杂度路由器也在用的设计。

### 分类器上下文窗口

:::info

上下文窗口支持随 **v1.96.x** 发布（[PR #35185](https://github.com/BerriAI/litellm/pull/35185)）；窗口中的助手轮次也在同一版本加入（[PR #35471](https://github.com/BerriAI/litellm/pull/35471)）。更早的版本上分类器只能看到当前消息，这些键会被静默忽略。

:::

LLM 与 JEV 分类器默认最多收到三轮历史用户轮次，历史轮次文本预算为 8000 字符。这样，"now do the same for the streaming path" 这类追问就能对照它所指的内容来评级。`classifier_context_per_turn_chars` 可选地在总预算生效前先限制单轮长度，默认不设。

默认情况下，只有带人类所写文本的轮次计入窗口。工具输出永远不算（Messages 接口上的 `tool_result` 块、chat completions 上的 `tool` 角色）；完整的提醒块会在轮次被纳入前剥离（默认 `<system-reminder>` ... `</system-reminder>`，可用 `reminder_markers` 换一对）；剥离后为空的轮次会被跳过，不占用名额。设置 `classifier_context_include_assistant_turns` 可把助手轮次也纳入，见下文[上下文窗口中的助手轮次](#上下文窗口中的助手轮次)。文本与本次待分类提问完全相同的轮次会被排除，避免提问被引用两次。历史轮次按从旧到新的顺序发送并编号为 `[1]`、`[2]`、`[3]`，在字符上限处被截断的轮次会带一个尾部 `...`，让分类器知道它被剪过。存在历史对话时，还会附带一行深度信息（`Conversation so far: ~N tokens across the request`）。这个轨迹数是对请求中所有消息文本按每 token 约 4 字符的粗略估算，不是分词器计数，也不限于窗口内的轮次，因此应读作深度信号，而不是可计费数字。

LLM 路径上，system 角色承载运营方的评分准则，调用方提供的上下文引用在 user 轮次里。JEV 把这份分类上下文作为 `state` 随 Choice 问题的指令一起发送。LLM 路径上三轮对话会产出：

```
system: <rubric, operator-authored, identical on every request>

user:   Caller system prompt, quoted as task context:
        <the caller's own system prompt>

        Recent conversation (context only, do not classify these):
        [1] add a health check endpoint
        [2] now wire it into the readiness probe

        Conversation so far: ~1240 tokens across the request

        Classify this message:
        now do the same for the streaming path
```

设置 `classifier_context_window_size: 0` 可关闭历史轮次上下文与深度行。当前提问与提取的系统文本仍在历史轮次预算之外，但可识别的 Claude Code harness 系统文本会被剔除。若相关上下文被截断，可调高 `classifier_context_budget_chars` 或设置显式的单轮上限。这些上下文控制同样适用于 JEV。关键词匹配仍只读人类提问，启发式评分器不使用这个历史轮次窗口。

注意 `session_affinity` 会在会话首轮之后跳过重新分类，因此在开启它的路由器上，上下文窗口只在第一轮、或无法从元数据解析出 `session_id` 的请求上起作用。该功能默认关闭，所以默认每一轮都会分类，窗口全程生效。

### 上下文窗口中的助手轮次

`classifier_context_include_assistant_turns` 默认关闭，开启后会把模型自己的回复放进窗口。它为那种难度由助手而非用户陈述的对话而生：助手回答"这是方案，比较复杂，要我执行吗？"，用户回答"好的"；只看用户轮次的话，路由器评级的就是"好的"这个词，然后选最便宜的层级。开启后，分类器评的是当前消息所批准的工作，并放在它延续的对话语境里判断。

```yaml
classifier_type: llm
classifier_llm_config:
  model: {{anthropic}}
classifier_context_include_assistant_turns: true
classifier_context_window_size: 3
classifier_context_per_turn_chars: 200
```

开启后 `classifier_context_window_size` 的计数对象随之改变：从最近 N 个用户轮次变成对话中跨两种角色的最近 N 个轮次，若一段多轮往来的对话仍需容纳几个用户提问，请相应调大预算。只有开启时轮次才会在负载中按角色标注，这让所有既有部署的提示词保持不变。助手回复与用户轮次共享 `classifier_context_per_turn_chars`，若回复在陈述难度的部分之前就被截断，请调高它。

默认关闭有两个原因：其一，开启会改变已上线路由器的层级决策，进而改变花费；其二，助手文本会成为发给分类器部署的净新增出站内容，而分类器部署的提供商可能与被路由的模型不同。助手文本只进入分类器负载，不进入其他任何地方；`keyword_tier_rules`、升级关键词、启发式评分器和语义匹配仍只读人类提问，因此助手复述升级关键词也选不了层级。

## 层级池

层级取值可以是单个模型名，也可以是列表。

- **单个字符串**：把层级固定到一个模型。
- **列表**：路由器逐请求随机挑一个（均匀分布），与 simple-shuffle 同一思路。空池会在配置加载时报错，而不是落到 `default_model`。
- **列表加 `adaptive: true`**：在池内做 Thompson 采样。冷启动请求只在被分类到的层级内采样，成本权重因此不会把初始流量全部压到最便宜的模型上。配置在多个层级里的模型取其与被分类层级的最近距离。后续轮次的反馈会归因到真正服务上一次响应的模型。

## 会话亲和 {#session-affinity}

默认关闭：每一轮都按自身情况分类，因此各自落在对它足够用的最便宜层级上。

设置 `session_affinity: true` 可把会话固定在首轮模型上，并在后续轮次跳过重新分类。开启它换到两样东西。其一是 keyed 到该模型的提供商侧提示词缓存，不再因后续轮次（比如一句"谢谢！"）本会落进别的层级而失效。其二是多轮会话稳定在同一个模型上，避免某模型生成的对话历史（例如 Anthropic 的 `thinking` 块）在后续轮次重放给另一个模型时触发提供商报错。

代价是整个会话继承首轮的层级。一句难题开场、随后一路简单追问的对话，会一直为所有轮次支付昂贵层级。

```yaml
session_affinity: true          # default false; set true to pin a session to its first-turn model
session_affinity_ttl_seconds: 3600
```

`session_id` 从请求元数据读取；解析不出 `session_id` 时，无论本项如何设置，路由器都会照常给每一轮分类。同时设置 `adaptive: true` 时，被固定的轮次仍会写入自适应 bandit 的所选模型元数据键，奖励反馈因此继续有效。配置了 routing `plugins` 时 `session_affinity` 会被忽略，会话中途的策略变更因此仍能作用于后续轮次，不会被缓存的固定关系跳过。这里说的是 routing `plugins` 本身；`classifier_plugin` 只在发生分类的轮次挑选层级，固定关系保持不变。

:::info[默认值变更]

`session_affinity` 过去默认为 `true`。在那次变更之前创建的路由器没有存储 `session_affinity` 键，因此会吃到新的 `false` 默认值，开始对每一轮重新分类。需要继续保持固定的路由器请补上 `session_affinity: true`。

:::

### 会话亲和固定的是模型名

复杂度路由器存储的固定关系是它路由到的**模型名**，缓存在 `complexity_router_session_affinity:v1:<router name>:<key hash>:<session_id>` 下，有效期 `session_affinity_ttl_seconds`。TTL 在缓存命中时刷新，一次升级请求可以把固定关系上移一层。部署选择照常在该名字之下进行。若层级条目指向一个扇出到多个部署的模型组（两个 Bedrock 区域、Vertex 加 Anthropic 一方 API、一对 Azure 资源），会话保持在同一个模型上，同时仍会分散到这些部署，每个提供商侧前缀缓存只能看到会话轮次的一部分。对编码 agent 负载来说，缓存前缀几乎就是整个请求，读一个热前缀和重写一遍之间的差距就在这里。

补上这一环的是 `DeploymentAffinityCheck`。它固定的是具体部署 id（`model_info.id`）而非模型名，并且正是为这种隐式提示词缓存场景而存在。它是一个独立的 Router pre-call check，与路由器别名上的任何配置无关地单独启用，其中两个标志值得区分：

| `optional_pre_call_checks` 条目 | 固定部署的依据 |
| ------------------------------- | ---------------------- |
| `deployment_affinity`           | 调用方的密钥哈希（`metadata.user_api_key_hash`） |
| `session_affinity`              | 请求元数据中的 `session_id` |
| `responses_api_deployment_check` | `previous_response_id`，优先于上面两者 |

`optional_pre_call_checks` 里的 `session_affinity` 与 `complexity_router_config` 里的 `session_affinity` 虽然同名，却是两个不同设置。前者在 Router pre-call check 下固定一个部署 id；后者固定模型名并跳过重新分类。agent 负载上两者都值得开启。`deployment_affinity_ttl_seconds`（默认 `3600`）是部署固定的 TTL，它放在 `router_settings` 里，不在路由器别名上。

编码 agent 负载的推荐形态：既为会话固定层级，也固定层级背后的部署。

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
  # same tier, second deployment: this is the fan-out a model-name pin cannot hold
  - model_name: {{anthropic}}
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-east-1
  - model_name: {{anthropic_large}}
    litellm_params:
      model: anthropic/{{anthropic_large}}
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-auto
    litellm_params:
      model: auto_router/complexity_router
      cache_control_injection_points:
        - location: message
          role: system
      complexity_router_config:
        tiers:
          SIMPLE:    {{openai_small}}
          MEDIUM:    {{anthropic}}
          COMPLEX:   {{anthropic}}
          REASONING: {{anthropic_large}}
        session_affinity: true
        session_affinity_ttl_seconds: 3600
      complexity_router_default_model: {{anthropic}}

router_settings:
  optional_pre_call_checks: ["deployment_affinity", "session_affinity", "prompt_caching"]
  deployment_affinity_ttl_seconds: 3600
```

第三个条目 `prompt_caching` 启用 `PromptCachingDeploymentCheck`，它以缓存前缀而非会话为驱动：补全成功后，它以可缓存前缀（直到并含最后一个 `cache_control` 检查点的全部内容）为键记录服务该提示词的部署，并把下一个携带相同前缀的请求发回同一部署。它只在提示词超过模型最小可缓存 token 数时才介入，帮助的是不发 `session_id` 也没有稳定密钥的调用方，因此是对前两个亲和固定的补充而非替代。

## 自定义技术关键词

内置技术关键词表是通用型的：有 "tcp" 没有 "udp"，有 "api" 没有 "kafka" 或 "postgresql"。`custom_technical_keywords` 是向内置列表追加，而不是替换。

```yaml
custom_technical_keywords: [kafka, redis, postgresql, mongodb, udp, dns, ssl, ssh]
```

## 决策日志 {#decision-log}

每次路由决策都会输出一行可 grep 的日志，注明其原因。在日志管线中可以按决策类型 grep `cause=`。

```
ComplexityRouter: routing decision cause=complexity_scorer,      tier=SIMPLE,     score=-0.150, signals=['short (7 tokens)', 'simple (what is)'], routed_model={{openai_small}}
ComplexityRouter: routing decision cause=literal_keyword_match,  tier=REASONING,                                                                    routed_model={{openai_large}}
ComplexityRouter: routing decision cause=semantic_keyword_match, tier=REASONING,                                                                    routed_model={{openai_large}}
ComplexityRouter: routing decision cause=llm_classifier,         tier=COMPLEX,    score=1.000, signals=['llm-classifier:COMPLEX'],                  routed_model={{anthropic}}
ComplexityRouter: routing decision cause=classifier_plugin,      tier=REASONING,  score=n/a,   signals=['classifier-plugin:REASONING'],             routed_model={{openai_large}}
ComplexityRouter: routing decision cause=session_affinity_pin,                                                                                      routed_model={{openai_large}}
```

## 从响应中读取路由选中的模型

默认情况下，响应体的 `model` 字段保持为你调用的别名（`smart-router`），符合 OpenAI 惯例：客户端拿回它请求的模型名。真正作答的层级只能通过 [`x-litellm-model-id` 响应头](./response_headers.md#litellm-专属响应头)获知。读不了响应头的客户端，包括框架封装和只见 body 分块的流式消费者，需要把这个值放进响应体。

在路由器上设置 `return_raw_model_name` 即可把它放进响应体。此后代理跳过重写步骤，把解析后的模型留在 `model` 字段里，非流式响应与每个流式分块都是如此：

```yaml
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    complexity_router_config:
      tiers:
        SIMPLE:    {{openai_small}}
        REASONING: {{openai_large}}
      return_raw_model_name: true   # default false
```

同一个开关也在 UI 的 Auto Router 标签页上，名为 "Return raw model name"。

非流式：

```json
{
  "id": "chatcmpl-abc123",
  "model": "{{openai_large}}",
  "choices": [{"...": "..."}]
}
```

流式：每个 SSE 分块都如此，而不是只有第一个或最后一个：

```
data: {"id":"chatcmpl-abc123","model":"{{openai_large}}","choices":[{"delta":{"content":"The"},"...":"..."}]}

data: {"id":"chatcmpl-abc123","model":"{{openai_large}}","choices":[{"delta":{"content":" sum"},"...":"..."}]}
```

`model` 是标准的 OpenAI 响应字段，所有 SDK 与框架都会把它带到应用代码里，无需任何组件去读原始分块。在 LangChain 中它体现为 `response_metadata.model_name`，流式时出现在最后一个分块上。

开启该开关后有两处变化。调用方拿回的不再是他们发送的别名，而某些客户端会对此做断言。而且这个值是部署上报的解析后模型，因此 `hosted_vllm/my-model` 这类带提供商前缀的标识会原样到达客户端，而不是[决策日志](#decision-log)打印为 `routed_model=` 的 `model_list` `model_name`。

:::info[没有专用响应字段]

v1.99 的候选版本曾短暂提供过一个单独的 `router_model_name` 响应体字段（[PR #37725](https://github.com/BerriAI/litellm/pull/37725)），出发点就是 LangChain 调用方。但它从未到达他们手里：`@langchain/openai` 依据固定的键白名单构建 `additional_kwargs` 与 `response_metadata`，在分块顶层和 `delta` 内部都会丢弃未知字段，因此代理侧无论把带命名空间的键放在哪都行不通。该字段在稳定版发布前移除，改用 `return_raw_model_name`，它落在 LangChain 确实会透传的 `model` 字段里。

:::

## 节省额报告

每个自动路由的请求都会对照一个反事实来记录路由节省了多少：即没有路由器时这股流量会跑在的那个模型，并扣除路由决策本身的开销。

```text
savings = cost(baseline model, this request)
        - cost(the model the router picked, this request)
        - cost(the classifier call that routed it)
```

- **基线是推导出来的，不是配置出来的**。没有路由器时，部署只能选一个足以扛起所见最难请求的模型，因此基线取路由器所配置最难层级中最贵的模型。是最难*配置出来的*层级，所以只定义了 `SIMPLE` 和 `MEDIUM` 的路由器，就按它实际可能选到的最好情况来衡量。指向池子的层级会把池中每个模型都算进来；自定义层级标签不携带严重程度顺序，那种情况下每个层级的每个模型都参与竞争
- **"最贵"按成本判定，不按单价判定**，因为每个输出 token 更贵的模型，按缓存 token 算可能更便宜。候选模型用节省额所用的同一引擎、按一个固定参考请求（20k 提示词 token：19k 缓存读加 1k 缓存写，再加 1k 补全）计价一次。无法计价的候选出局，若全都无法计价，驱动报告为零。该排名按路由器实例固定，因此不会进入逐请求路径
- **只有一侧是假设**。请求实际花费从成本计算器记录的数值读回，按其计费时的服务层级与数据驻留计算，而不是重新推导；基线从未运行，因此用同一引擎按同一口径计价。该数字是输入加输出成本，内置工具成本、折扣与加价不参与比较
- **结果带符号**。切换模型会让新模型变冷，当由此产生的缓存创建费用超过更低的单价时，数字变为负数，仪表板也会如实显示
- **分类器自身的费用从节省中扣除**（v1.100 及以后）。LLM 分类器把本次调用在路由决策上的开销记为 `classifier_cost`，报告的数字是扣除它之后的净值，即路由为决策付费后真正赚到的部分。启发式独立做出的决策不记录费用，也就无从扣除
- **零节省时两侧成本都保留**。对受支持的原生 Anthropic 请求，若记录的会话以相同价格用过与基线完全相同的部署（含重叠请求），完整的观测用量即可确立两侧模型成本相等。请求可计费时两侧成本都保持非零。已记录的分类器费用仍从节省中扣除。路由发生分叉后再回到同一模型需要缓存历史证据，仅凭模型身份不足以确立零节省。缺少价格或证据时给出不可用的估算

### 缓存前缀历史与过期 {#the-baseline-is-priced-with-a-warm-cache}

对受支持的原生 Anthropic `/v1/messages` 请求，基线缓存读要求存在一个在请求开始时可用、且仍在其 5 分钟或 1 小时 TTL 内的匹配前缀。已知已过期的前缀按写入计费。由更便宜模型服务的请求同样会推进假设基线的历史。仅有助手消息不足以确立缓存命中。

请使用稳定的会话 ID、配置好的代理数据库并开启花费日志。核算在推理之后进行，按请求开始顺序重放记录到的观测。迟到观测会在请求、会话与每日总计得到修正期间，暂时撤回受影响的估算。实际账单花费全程保留记录。

基线 token 计数要求与被服务请求相同的端点和 API 密钥。Anthropic 兼容网关必须对每个所需前缀支持原生计数，包括只有 system 或 tools 而没有 messages 的情况。计数缺失或超时会产生未知估算；本地分词器或伪造的消息无法确立缓存命中。

比较会把记录到的提示词、输出用量与请求时序视为固定。它不预测其他模型的响应、提供商的缓存驱逐或未记录的流量。旧会话不会仅仅因为其记录历史不可用就变成新的基线等同会话。不活跃的会话历史按会话保留策略清理，复用已退役的会话 ID 不会确立新的初始估算。

部分 Claude Code beta 头与 `context_management` 形态在建模缓存核算中仍不受支持。初始的基线等同请求仍可使用完整的观测用量。切换模型后的支持情况取决于实际请求形态与可用的前缀计数。

### 估算覆盖范围

仪表板在同一批已估算轮次上比较基线与路由成本，包括数值为零节省的轮次。它展示有多少轮次有估算，并附实际花费总额。未知与待定轮次不计入比较双方任何一侧的成本，但其实际花费仍保留在总额中。既有会话状态客户端在覆盖不完整时拿不到基线总额。

举例来说，一个基线等同请求花费 $0.10，就有 $0.10 基线成本、$0.10 路由模型成本和 $0 模型节省。若下一轮缓存历史不可用，其账单花费仍会记录，但会被排除在节省比较两侧之外。

### 展示位置

- **用量**，从各提供商自己的形态归一化：Anthropic 接口上的 `cache_read_input_tokens` 与 `cache_creation_input_tokens`，OpenAI 兼容接口上的 `prompt_tokens_details.cached_tokens`，以及 DeepSeek 的 `prompt_cache_hit_tokens`
- **每日汇总**：`cache_read_input_tokens` 与 `cache_creation_input_tokens` 列与 `autorouter_savings_spend` 并列，存在于 `LiteLLM_DailyUserSpend`、`LiteLLM_DailyTeamSpend`、`LiteLLM_DailyTagSpend`、`LiteLLM_DailyOrganizationSpend`、`LiteLLM_DailyEndUserSpend` 和 `LiteLLM_DailyAgentSpend`
- **API**：`GET /user/daily/activity` 在 `metrics` 下返回它们，响应元数据中带 `total_autorouter_savings_spend`
- **UI**：**Cost Optimization** 页面读取该端点，数字标注为 "Auto-router savings"。其 Auto-Router Benchmarks 标签页把每轮的 `classifier_cost` 并入该轮花费，因此那里的节省百分比是对照完整基线成本测得的净节省

:::note

`LiteLLM_SpendLogs` 没有缓存 token 或节省列，该拆分在那里查不到；上面的每日汇总可以。携带拆分的用量确实存在行的 `metadata` 里、`usage_object` 键下，每日节省写入器正是读它来重建 `Usage`。表中的 `cache_hit` 与 `cache_key` 列与此无关，描述的是 LiteLLM 自己的响应缓存而非提供商侧提示词缓存。路由本身以 `routing_decision` 持久化在元数据中：始终有 `routed_model`、`cause` 和 `conversation_continuing`；确定了层级时有 `tier`；LLM 分类器运行过时有 `classifier_cost`；还有推导出的基线及其解析到的部署。净额以 `autorouter_savings` 标在该元数据上。带版本的 `autorouter_savings_estimate` 记录比较标识、来源、状态、原因与比较双方成本。读取方使用记录的估算及其覆盖范围。

:::

## 路由器上的 `litellm_params` 别名

设置在自动路由部署自身上的 `drop_params`、`cache_control_injection_points` 以及其他任何 `litellm_params`，都会在路由器选定层级时合并进出站请求。调用方在请求上显式传入的值优先于别名默认值。

```yaml
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    drop_params: true
    cache_control_injection_points:
      - location: message
        role: system
    complexity_router_config: {...}
```

## 压缩

从 v1.101.0 起，自动路由器可以为路由请求经过的两跳分别指定一个压缩防护栏（guardrail）：决定层级的分类器调用，和路由目标模型的调用。两个字段都放在标记的 `litellm_params` 上、`complexity_router_default_model` 旁边，取 [Headroom](./headroom.md) 或 [Compresr](./guardrails/compresr.md) 防护栏的名字，也接受 `none`（大小写不敏感）表示该跳完全不压缩。

```yaml title="config.yaml"
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    complexity_router_config: {...}
    auto_router_routing_compression: headroom-compression
    auto_router_model_compression: none
```

两个字段都不设时，保持所有现有路由器今天的行为：一次压缩处理，取密钥、团队或请求已选定的那一个，同时供给两跳。设置任一字段后，路由器改为对其服务的请求拥有决定权，其他所有压缩防护栏对这些请求一律抑制，包括标记为 `default_on` 的和调用方在请求体中点名的。同一代理上的普通部署不受影响。两跳指定同一防护栏时只运行一次并复用结果，不会把同一文本压缩两遍。

解析不到活跃压缩防护栏的名字，只在代理日志中留一条警告、该跳不压缩，而不是让请求失败。能解析到的防护栏报错时仍按其自身配置行事，因此一个不可达且配置为 fail closed 的压缩服务，仍会在任何提供商调用之前让请求失败。

上线前有两点值得知道。压缩路由跳只有在跑 LLM 分类器时才省 token，因为那是唯一把文本发给模型的分类器；启发式评分器在本地免费读取，已废弃的语义路由器只嵌入最后一条用户消息，压缩对它不加处理。另外，两跳指定不同防护栏时，模型跳先压缩，分类器读到的是模型压缩后的文本而非原文。路由刻意读取活消息：唯一可用的未压缩副本是 pre-call 防护栏运行前取的那份，把它交给压缩服务等于把脱敏防护栏自己的输入发给第三方。

## 上下文窗口

自动路由条目是一个标记而非可调用模型，因此它不携带自己的提供商元数据，在你声明之前也不公布上下文窗口。这个数字不从层级模型推导：不是它们的最小值，不是最大值，也不是 `complexity_router_default_model` 的窗口。层级里存的是代理在请求时才解析的模型名，model-info 路径上没有任何环节会遍历该列表。在你声明窗口之前，`GET /v1/models` 对路由器完全省略 `max_input_tokens` 与 `max_output_tokens`，`/model_group/info` 对两者都报 `null`。

在路由器条目的 `model_info` 中声明：

```yaml title="config.yaml"
- model_name: smart-router
  litellm_params:
    model: auto_router/complexity_router
    complexity_router_config:
      tiers:
        SIMPLE:    {{openai_small}}
        REASONING: {{openai_large}}
    complexity_router_default_model: {{openai_large}}
  model_info:
    max_input_tokens: 200000
    max_output_tokens: 64000
```

这两个值随后会出现在 `/v1/models`、`/model/info` 和 `/model_group/info` 上，客户端与 LiteLLM UI 读的就是它们。它们只是参考值。没有任何机制依据路由器条目上声明的窗口去拦截、升级或拒绝请求，所以请选一个对调用方如实描述路由器的数字；请求可能落上的最小窗口是保守选择，最大窗口是乐观选择。

当同一个 `model_name` 既是路由器标记又对应普通部署时，`/model_group/info` 报告的是该组中最大的 `max_input_tokens` 而非最小值，因为模型组元数据按部署取最大值聚合。

:::info[路由条目上的成本字段读数为零]

对自动路由器，`/model_group/info` 把 `input_cost_per_token` 与 `output_cost_per_token` 报为 `0.0`，`providers` 报为空字符串，因为策略别名上的自定义定价被有意排除在成本映射之外。花费仍会记在实际服务请求的层级模型上，这些零只是此元数据视图的缺口，并非用量未被追踪。

:::

### 谁来执行窗口限制

先解析路由。路由器选定层级后，标记退出候选池，之后的一切都是作用于所选模型的普通模型组行为：部署选择、冷却、标签路由，以及针对该部署自身 `max_input_tokens` 的上下文窗口 pre-call 检查。因此执行依赖 `router_settings.enable_pre_call_checks: true`，且层级部署要声明或可解析出窗口，从不依赖路由器条目本身。参见[上下文窗口回退](./reliability.md#上下文窗口回退调用前检查与回退)。

`context_window_fallbacks` 先按路由器选定的层级解析，再按客户端调用的名字解析，因此以 `smart-router` 或层级自身模型组为键的链路都会生效。

`auto_router_max_input_chars` 与以上都无关。它截断交给嵌入模型的文本，用于语义路由器上的路由匹配，默认 2000 字符。

### 上下文窗口升级

从 v1.101.0 起，复杂度路由器可以在分发前检查已定层级是否装得下提示词，并在可证明装不下时把请求挪走。默认关闭，省略该键的路由器只按复杂度分发；设置 `enable_context_window_escalation: true` 开启。

```yaml title="config.yaml"
complexity_router_config:
  enable_context_window_escalation: true   # default false
  context_window_escalation_buffer: 0.95   # default
```

估算覆盖提示词的全部足迹，包括顶层 `system` 块、Responses API `instructions` 和序列化的工具定义，编码 agent 流量的大部分负载正是这些。层级模型在计数落入其声明窗口的 `context_window_escalation_buffer` 以内时合格，默认因此保留 5% 余量，而不是拿贴近上限的提示词去赌。层级内只有部分模型装得下时，层级保留请求、选择范围缩小到这些模型；全都装不下时，请求挪到持有可证明装得下模型的最低更高层级。

未知窗口在两个方向上都保持不动。解析不出窗口的模型组永远不会被升级离开，因为装不下无法证明；也永远不会被升级进入，因为装得下同样无法证明。组内只要有一个部署缺窗口，该组就按未证明处理，因为组的安全性取决于最小的那个成员。当任何地方都无可证明装得下时，被分类的层级维持原状、请求照常分发，升级因此从不会自己抛错，也从不绕到 `complexity_router_default_model`。

窗口升级读取的是各层级部署上的 `model_info.max_input_tokens`，回退到模型成本映射。在路由器条目上声明窗口在这里无效。升级后的决策会连同分类器最初选的层级一起记录 `context_escalated`，并且从不会被会话固定，会话回落时路由也随之回落。

两个键都必须放在 `complexity_router_config` 内。往上一级、直接放在 `litellm_params` 下，会在加载时和管理端点写入时被拒绝，而不是被静默忽略。

## 推理力度阶梯

切换模型不是路由器能爬的唯一轴。推理力度（reasoning effort）改变的是请求在同一单价下花多少输出 token，而切换模型改变的是请求中每个 token 的单价，因此先在便宜模型上抬力度往往是更便宜的下一步，值得在层级阶梯伸向前沿模型之前用尽。

表达这一点不需要任何新东西。每个梯级声明一个 `model_list` 条目，除 `litellm_params` 里的推理参数外完全一致，层级指向这些名字。路由器返回层级的模型名后，该名字解析到其部署，部署自身的 `litellm_params` 合并进出站请求，调用方显式发送的内容优先于它们。自己设置了 `reasoning_effort` 的客户端因此保留自己的值，其他所有人都拿到梯级。

```yaml
model_list:
  - model_name: {{openai_small}}-low
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      reasoning_effort: low

  # same model and the same per-token rate as the rung above, more thinking
  - model_name: {{openai_small}}-high
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      reasoning_effort: high
  - model_name: {{openai_small}}-xhigh
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      reasoning_effort: xhigh

  # top rung: a different rate on every token
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      drop_params: true
      complexity_router_config:
        tiers:
          SIMPLE:    {{openai_small}}-low
          MEDIUM:    {{openai_small}}-high
          COMPLEX:   {{openai_small}}-xhigh
          REASONING: {{openai_large}}
      complexity_router_default_model: {{openai_small}}-high
```

Anthropic 系的梯级同样用 `thinking`，它就是普通的 `litellm_params` 键：

```yaml
  - model_name: claude-sonnet-5-thinking
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      thinking: {type: enabled, budget_tokens: 8192}
```

力度级别是逐模型的能力，请确认模型支持你要的梯级：`gpt-5-mini` 拒绝 `xhigh` 而 `gpt-5.4-mini` 接受，路由器别名上的 `drop_params: true` 会把拒绝变成静默丢弃参数，看起来就是阶梯什么都没改变。还有两点要记住。成本追踪按各梯级的底层模型计价，这样搭出来的阶梯在花费里表现为一个模型的多个力度级别，而不是多个独立模型。`session_affinity` 固定的是梯级的 `model_name`；TTL 在缓存命中时刷新，升级请求可以把固定关系上移一层，而不是卡在一个硬性的固定时长锁上。

## Python SDK

```python
from litellm import Router

router = Router(
    model_list=[
        {"model_name": "{{openai_small}}",   "litellm_params": {"model": "{{openai_small}}"}},
        {"model_name": "{{openai_large}}",        "litellm_params": {"model": "{{openai_large}}"}},
        {"model_name": "claude-sonnet", "litellm_params": {"model": "{{anthropic}}"}},
        {"model_name": "claude-opus",   "litellm_params": {"model": "{{anthropic_large}}"}},
        {
            "model_name": "smart-router",
            "litellm_params": {
                "model": "auto_router/complexity_router",
                "complexity_router_config": {
                    "tiers": {
                        "SIMPLE":    "{{openai_small}}",
                        "MEDIUM":    "{{openai_large}}",
                        "COMPLEX":   "claude-sonnet",
                        "REASONING": "claude-opus",
                    },
                    "session_affinity": True,
                },
                "complexity_router_default_model": "{{openai_large}}",
            },
        },
    ],
)

response = await router.acompletion(
    model="smart-router",
    messages=[{"role": "user", "content": "What is 2+2?"}],
)
```

## UI

Models + Endpoints > Add Model > Auto Router 标签页。输入路由器名称，然后点 **Configure automatically**，LiteLLM 会检查你的代理已在服务的模型，为全部四个复杂度层级挑选可用的最佳模型，并替你填好表单。保存前请核对生成的层级。也可以用 **Template** 下拉框选一个内置模板预填四个层级，或用 **Custom Configuration** 自己填。模板中的模型本代理不服务时，该模板会置灰并显示缺失的名字，因此可选的就一定适用。其余设置都在 **Detailed Configuration** 下，默认折叠并带一行当前层级的摘要；展开后可设置层级模型组、层级显示名、Semantic Keyword Matching、LLM Classifier、升级关键词或 Adaptive。

**Test Routing** 把输入送过表单里的分类器，不创建路由器，也不调用所选的补全模型。LLM 与 JEV 分类器调用、语义嵌入调用都可能产生花费。**Test Connection** 会探测已配置的模型依赖，对 JEV 还会单独检查分类是否成功。见 [JEV Test Routing 与计费核算](#test-routing-与计费核算)。

层级与分类器下拉框排除嵌入模式模型；语义嵌入下拉框只列嵌入模式模型。提交时四个层级都必填，缺失的层级会内联标出。

选择 **LLM Classifier** 会展开其模型、超时与提示词编辑器。**JEV Classifier** 会展开 JEV 模型、超时、熔断器与 instructions。两者都提供分类器回退、**Context Window Size**、**Context Character Budget** 和 **Include Assistant Turns**。创建与编辑流程见 [JEV 仪表板配置](/docs/auto_router/setup#在仪表板中创建或编辑)。

**Advanced > Session Affinity** 存放会话固定，默认关闭以与配置默认一致。创建页与编辑弹窗都会显式写入该值，因此 UI 里建出来的路由器记录的是它实际的行为，而不是恰好继承到的默认值。

**Advanced > Compression** 为路由决策选压缩防护栏，然后可复用它给模型调用，或另选一个，包括 `None`。把路由器改回*未配置*不会清除已保存的策略，因为模型更新只合并给到的字段、从不删除键，所以要在弹窗里关掉压缩，两跳都选 **None**。旧语义自动路由器（`auto_router/<name>`）可以通过 `config.yaml` 与模型管理 API 接受这两个字段，但 UI 里还没有对应控件。

## Claude Code 与 Claude Desktop

一个路由器能否出现在 Claude 客户端里由两件事决定，其中只有一件与名字有关：

1. **网关模型发现只挑出名字含 `claude` 或 `anthropic` 的 `model_name`**。Claude Code 从 `/v1/models` 填充 `/model` 选择器时用的就是这一条过滤；像 `smart-router` 这样的名字不会被自动发现。把 `ANTHROPIC_MODEL` 或 `ANTHROPIC_CUSTOM_MODEL_OPTION` 直接指过去仍然完全可用，这条路绕过了发现及其过滤。
2. **在 Claude for Teams 或 Enterprise 上，名字必须在组织的 `availableModels` 允许名单上**。名字不在名单上就会在 Claude Desktop 选择器里置灰，并在 CLI 启动时显示 `restricted by your organization's settings`，无论这名字看起来多像 Anthropic。

允许名单检查在客户端执行，被它排除的路由器不会在 LiteLLM 日志里留下任何解释。参见 [Claude Code 与 Claude Desktop 搭配 Auto Router](../tutorials/claude_code_autorouter.md)。

## 另请参阅

- 发布公告：[Auto Router v2：一个路由器统一复杂度、语义与自适应路由](https://docs.litellm.ai/blog//blog/autorouter-v2)
- 本地 Claude Code 预览：[lite autoroute](../learn/autorouter_cli.md)
- 旧版语义路由器：[语义自动路由器（已废弃）](./auto_routing_semantic.md)
