---
title: "LLM 提供方对比：本地 Ollama vs 托管 OpenRouter"
description: "家庭实验室部署把 ai-memory 从计费的 OpenAI / OpenRouter 提供方切到本地托管的 Ollama 服务器时，我们需要实证——不是凭感觉的宣称。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/llm-provider-comparison.md"
---

# LLM 提供方对比：本地 Ollama vs 托管 OpenRouter

> **TL;DR。** ai-memory 的整编提示词有一个潜伏的 schema vs 提示词 bug，让每个提供方都过不了 JSON 校验。两轮修复（schema + 收紧的反幻觉提示词）之后，六个提供方在同样的 5 个夹具上做了基准：
>
> | 提供方 | 解析 | 平均延迟 | 忠实度 | $/M 输出 token† | 说明 |
> |---|---|---|---|---|---|
> | qwen3:32b（Ollama 本地） | 5/5 | 92 s | 高 | **$0** | 生产默认 |
> | **GPT-5.4-mini**（OpenRouter） | 5/5 | **4.3 s** | 高‡ | ~$1 | 最快 + 最便宜的托管 |
> | Haiku 4.5（OpenRouter） | 5/5 | 7.3 s | 高 | ~$5 | 托管里克制度最佳 |
> | DeepSeek V4 Flash（OpenRouter） | 5/5 | 21.7 s | 高 | ~$0.40 | 比 GPT-mini 慢、价格相当 |
> | Sonnet 4.5（OpenRouter） | 5/5 | 10.8 s | 高（提示词修复后） | ~$15 | 此任务被 Haiku 取代 |
> | Kimi-K2.6（OpenRouter） | 挂起 | 无 | 无 | 无 | 推理模型——不合格 |
>
> † 每百万输出 token 的量级定价。实际每次整编成本取决于输入 + 输出 token 数。
> ‡ 一次失误：GPT-5.4-mini 为一个修错字会话造了一页 `decisions/`（轻度过度分类），而 Haiku 正确地只发了会话日志。
>
> **多数用户的推荐默认：Claude Haiku 4.5。**托管（总是可用）、快（约 7 s）、便宜到个人使用的每会话成本无所谓、且是托管模型里克制 + 分类上最有纪律的。**更便宜的替代**：GPT-5.4-mini（比 Haiku 便宜约 5 倍、快约 2 倍、对琐碎会话轻度过度分类）。**有本地 LLM 服务器（Ollama / vLLM / llama-swap 带 30B 级模型）时的免费替代**：Ollama 上的 qwen3:32b——每次整编 $0、后台延迟用户不可见。设置见[安装指南的 LLM 提供方层级](/install/#llm-提供方层级)。对比可在 [`evals/`](https://github.com/akitaonrails/ai-memory/tree/main/evals) 复现。

## 这份文档为什么存在

家庭实验室部署把 ai-memory 从计费的 OpenAI / OpenRouter 提供方切到本地托管的 Ollama 服务器时，我们需要实证——不是凭感觉的宣称——*整编质量没有退化*。ai-memory 的整编器把一个会话的原始观察变成 1-5 页分类为 `concept`、`decision`、`gotcha` 或 `rule` 的 wiki 页面；质量的小幅下滑在数百个会话上快速复利。

本文档记录：

- **方法论**（对比什么、怎么对比、两个提供方看到的精确提示词 + schema）。
- 早期运行看起来糟糕的**根因**。
- 落进整编器类型 + 提示词的**修复**。
- **逐提供方的最终数字**（解析率、延迟、人工质量评估）。
- **复现方法**一节，任何人都能对着自己的模型 + 提供方选择重跑对比。

## 测了什么

### 五个夹具

[`evals/fixtures/`](https://github.com/akitaonrails/ai-memory/tree/main/evals/fixtures) 持有五份短的合成会话日志，每份专门暴露整编的一种*不同*失败模式：

| 夹具 | 考验什么 |
|---|---|
| `01-rust-bug-fix` | 模型是否把多页会话切成了正确的片（会话日志 + 概念 + 决策 + 坑点）？ |
| `02-architecture-decision` | 模型能否产出区别于运行中会话日志的 ADR 式页面？ |
| `03-gotcha-with-rule` | 模型是否正确把一条持久项目规则分类为 `kind: rule`，让整编器能自动路由到 `_rules/`？ |
| `04-low-signal-session` | 没有可捕获的持久内容时，模型是否*抵得住*制造概念页？ |
| `05-multi-topic-session` | 模型是否按主题发*独立*页面而不是把两个无关主题揉在一起？ |

夹具用生产钩子入口发出的、真实形状的 `ObservationKind` 值（`session-start`、`user-prompt`、`pre-tool-use`、`post-tool-use`、`session-end`）。

### 精确的请求

逐夹具，运行器调 [`ai_memory_consolidate::build_batch_request(session_id, &observations)`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-consolidate/src/consolidator.rs)——与活跃整编器每次 `memory_consolidate` 调用用的**同一**函数。该请求再经 [`ai_memory_llm::complete_structured`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-llm/src/lib.rs)（同样是活跃路径）发出。构造上苹果对苹果。

### 六个提供方

| 标签 | 提供方 | 模型 | 端点 |
|---|---|---|---|
| **Kimi** | OpenRouter（openai-compat） | `moonshotai/kimi-k2.6` | `https://openrouter.ai/api/v1` |
| **Sonnet** | OpenRouter（openai-compat） | `anthropic/claude-sonnet-4.5` | `https://openrouter.ai/api/v1` |
| **Haiku** | OpenRouter（openai-compat） | `anthropic/claude-haiku-4.5` | `https://openrouter.ai/api/v1` |
| **GPT-mini** | OpenRouter（openai-compat） | `openai/gpt-5.4-mini` | `https://openrouter.ai/api/v1` |
| **DeepSeek** | OpenRouter（openai-compat） | `deepseek/deepseek-v4-flash` | `https://openrouter.ai/api/v1` |
| **qwen3** | Ollama（openai-compat） | `qwen3:32b`（Q4_K_M，约 20 GB） | `http://192.168.0.90:11434/v1` |

家用服务器（`192.168.0.90`）是 Ryzen AI MAX+ 395（Strix Halo / gfx1151）、96 GB 统一内存、ROCm 背书的 Ollama，带 `OLLAMA_KEEP_ALIVE=20m` + `OLLAMA_FLASH_ATTENTION=1` + `OLLAMA_KV_CACHE_TYPE=q8_0`。模型一旦载入统一内存就保温 20 分钟——第一个请求付 30-60 s 冷加载税、后续低于 3 s。

## 第 1 轮——坏提示词 + schema（修复前基线）

每个提供方在每个夹具上都没过 schema 校验：

| 夹具 | Kimi | qwen3:32b |
|---|---|---|
| 01-rust-bug-fix | ❌ *response is not valid JSON* | ❌ *integer 1, expected string* |
| 02-architecture-decision | ❌ *response is not valid JSON* | ❌ *integer 2, expected string* |
| 03-gotcha-with-rule | ❌ *response is not valid JSON* | ❌ *integer 1, expected string* |
| 04-low-signal-session | ❌ *response is not valid JSON* | ❌ *integer 1, expected string* |
| 05-multi-topic-session | ❌ *response is not valid JSON* | ❌ *integer 2, expected string* |

但*原始响应*讲的是很不同的故事：两个模型在内容上都做了**出色**的整编工作。它们正确识别了每个夹具的多张独立页面、提取了忠实的摘要、遵守了路径约定。失败**仅在格式**：

- **Kimi** 输出排版精美的 markdown（`### Update 1` / `**path:**` / `**body:**`）——完全无视 JSON 请求。
- **qwen3** 在代码围栏里输出干净 JSON，但 `tier: 1` / `tier: 2` / `tier: 3`（整数）而非文档化的字符串值，偶尔还有发明的 `kind` 值如 `"session"`（不在 `PageKind` 枚举里）。

## 根因

两个独立问题，都在**我们这边**：

### Bug A——`Tier` 没有 `JsonSchema` derive

在 `crates/ai-memory-consolidate/src/types.rs`：

```rust
pub struct ConsolidatedPageUpdate {
    pub path: String,
    pub tier: String,   // ← bug：类型是 String
    pub kind: PageKind, // ← 已是带 JsonSchema 的枚举
    ...
}
```

`schemars` 无法为 `tier` 产出枚举约束，因为 `Tier`（`ai-memory-core` 里的真正枚举）没有 `JsonSchema` derive。生成的 schema 字段只是 `{ "type": "string" }`——没有 `enum` 约束——所以模型可以随便猜。Kimi 和 qwen3 都猜了数字索引。

### Bug B——提示词描述了取值、没有强制

[`build_batch_request`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-consolidate/src/consolidator.rs) 里的系统提示词用散文列出合法的 `tier` 与 `kind` 值，但从没说「用这些精确字符串值、绝不整数、绝不同义词、绝不代码围栏」。本地指令微调模型——尤其在没有 `response_format: json_schema` 支持可强制时——会漂到顺手的形式。

运行时加剧这一点：openai-compat 提供方（Ollama、OpenRouter 透传）当时用 ai-memory 的宽容解析器路径，所以 schema 是描述性的、不是强制性的。提供方对强制结构化输出的选择启用记录如下。

#### openai-compat 的严格结构化输出

`openai-compat` 默认发送 `response_format={ type: "json_schema", strict: true }`。解析形状失败（上游返回了响应但不是有效 JSON 对象）、或显式点名 `response_format`/`json_schema`/结构化输出的 400/422 拒绝时，ai-memory 回退宽容解析器。其他 HTTP / 认证 / 传输错误不重试直接传播。设 `AI_MEMORY_LLM_COMPAT_STRICT=false` 退出。

**成本。**上游尊重 `response_format` 时严格模式是一次 HTTP 调用。不尊重时，你为宽容回退付第二次调用。按引擎选：

| 引擎类别 | 设置 |
|---|---|
| 尊重 `response_format=json_schema` 的现代 Ollama / vLLM / LM Studio | 保持默认（一次调用、schema 约束） |
| `content` 里带 `<think>…</think>` 的推理模型（DeepSeek-R1、Qwen3-Thinking、MiniMax M2） | 严格后回退的双调用频繁时设 `AI_MEMORY_LLM_COMPAT_STRICT=false` |
| 显式拒绝 `response_format` 的老引擎/代理 | 保持默认；ai-memory 不带它重试 |
| 无可识别拒绝却错误处理该字段的老引擎/代理 | 设 `AI_MEMORY_LLM_COMPAT_STRICT=false` |

严格模式关闭或严格调用回退时，承重的活仍得提示词来干。

## 修复

三个小改动一起落地：

### 1. 给 `Tier` 加 `JsonSchema` derive

`crates/ai-memory-core/src/page.rs`：

```rust
#[derive(
    Clone, Copy, Debug, PartialEq, Eq, Hash,
    Serialize, Deserialize,
    schemars::JsonSchema, // ← 新增
)]
#[serde(rename_all = "snake_case")]
pub enum Tier { Working, Episodic, Semantic, Procedural }
```

给 `ai-memory-core` 加 `schemars` 依赖（可接受——schemars 已是 workspace 依赖、被每个跨 LLM 边界的类型使用）。

### 2. 字段类型改为 `Tier` 而非 `String`

`crates/ai-memory-consolidate/src/types.rs`：

```rust
pub struct ConsolidatedPageUpdate {
    pub path: String,
    pub tier: Tier,        // ← 原为 String
    pub kind: PageKind,
    ...
}
```

生成的 schema 现在为 `tier` 含 `{ "enum": ["working", "episodic", "semantic", "procedural"] }`。`serde_json::from_value` 拒绝其他任何东西。

### 3. 收紧提示词

`build_batch_request` 现在明确写：

```
Set `tier` to EXACTLY ONE of these four strings — never an integer, never a synonym:
- "working"      (the live in-progress slice of the session — rarely used here)
- "episodic"     (per-session narrative; the sessions/<id>.md page)
- "semantic"     (durable knowledge: concepts/, decisions/, gotchas/, rules)
- "procedural"   (repeated patterns extracted from many episodic pages)

Set `kind` to EXACTLY ONE of these four strings — never an integer, never "session" / "concept" / "note":
- "decision" / "gotcha" / "rule" / "fact"

## Output format (read this carefully)
Reply with ONE JSON object matching the ConsolidatedBatch schema, and nothing else.
NO prose preamble, NO trailing commentary, NO markdown headers wrapping the JSON,
NO ``` code fences. The very first character of your reply must be `{` and the
very last `}`. Strings must be JSON strings (with double quotes), not numbers
and not bare identifiers.
```

双保险：schema 现在*拒绝*坏值，提示词也让模型一开始就难以产出它们。

## 第 2 轮——schema + 第一版提示词修复

schema 修复 + 第一版提示词迭代之后，同样五个夹具产出：

### Sonnet 4.5（OpenRouter）vs qwen3:32b（Ollama）

| 夹具 | Sonnet 解析 | Sonnet ms | Sonnet 更新数 | qwen3 解析 | qwen3 ms | qwen3 更新数 |
|---|---|---|---|---|---|---|
| 01 rust-bug-fix | ✓ | 27,613 | 4 | ✓ | 110,227 | 4 |
| 02 architecture-decision | ✓ | 31,039 | 4 | ✓ | 122,200 | 5 |
| 03 gotcha-with-rule | ✓ | 19,173 | 4 | ✓ | 98,025 | 4 |
| 04 low-signal-session | ✓ | 6,106 | **1** | ✓ | 51,694 | **1** |
| 05 multi-topic-session | ✓ | 47,249 | 4 | ✗* | 133,178 | - |
| **合计** | **5/5** | **平均 26 s** | - | **4/5** | **平均 103 s** | - |

*qwen3 唯一的失败：发明 `kind: "concept"`（不在 `PageKind` 枚举——合法值是 `decision`/`gotcha`/`rule`/`fact`）。尽管提示词提到合法集合，模型还是漂了。**第 3 轮修复。**

两个模型都在夹具 04（低信号会话）上**正确克制**、只产出一条更新——这是 schema 坏掉的第 1 轮根本够不到的非平凡测试。

### Haiku 4.5（OpenRouter）vs Sonnet 4.5（OpenRouter）

同一提示词、两个 Anthropic 模型并排：

| 夹具 | Sonnet 解析 | Sonnet ms | Sonnet 更新数 | Haiku 解析 | Haiku ms | Haiku 更新数 |
|---|---|---|---|---|---|---|
| 01 rust-bug-fix | ✓ | 34,920 | 4 | ✓ | 16,505 | 5 |
| 02 architecture-decision | ✓ | 31,043 | 4 | ✓ | 13,731 | 4 |
| 03 gotcha-with-rule | ✓ | 24,810 | 4 | ✓ | 14,304 | 4 |
| 04 low-signal-session | ✓ | 5,673 | **1** | ✓ | 4,044 | **1** |
| 05 multi-topic-session | ✓ | 39,189 | 4 | ✓ | 16,026 | 4 |
| **合计** | **5/5** | **平均 27 s** | - | **5/5** | **平均 13 s** | - |

**Haiku 在每个夹具上都比 Sonnet 快约 2 倍**、同样 5/5 解析率，且在 gotcha-with-rule 夹具上正确把 `audit-ignore-with-revisit-date` 约定分类为 `kind: rule`——**Sonnet 漏了**，把它叫成泛化的 `gotcha`。整编器依赖的到 `_rules/<slug>.md` 的自动路由因此在该夹具上*只在 Haiku 下触发*、Sonnet 不触发。

质量上，即便提示词宽松，Haiku 在忠实度上也比 Sonnet 更有纪律：

- **Sonnet** 在夹具 5 两次发明 `Date: 2025-01-23`（源观察里没有日期）；捏造了整段列出 Alpine/Scratch/Debian-slim 的 `## Alternatives considered`——会话里一个都没提；加 "Better long-term solutions" / "When NOT to ignore" 填充。
- **Haiku** 有几条发明的 "Options considered" 条目（Alpine、激进优化标志）但其余贴近观察。

对整编，Sonnet 相对 Haiku 的余量表现为*更多幻觉*、不是更好保真。

### Kimi-K2.6（OpenRouter）——此任务不合格

提示词 + schema 修复后，Kimi 重跑**在第一个夹具上挂了 16 分钟以上**、从未返回可解析响应。直接探测 OpenRouter 端点说明了原因：

```
$ curl … -d '{"model":"moonshotai/kimi-k2.6", "max_tokens": 50, ...}'
{
  "choices": [{
    "message": {
      "content": null,          ← 无实际内容
      "reasoning": "...208 chars..."
    }
  }],
  "usage": { "completion_tokens": 50, "reasoning_tokens": 50 }
}
```

Kimi-K2.6 是**推理模型**：它在发出可见 `content` 之前把 `max_tokens` 预算内部消耗为「思考」。`max_tokens: 50` 的短探测里，全部 50 个 token 进了推理、content 保持 `null`。

`max_tokens: 4000` 的整编提示词下，Kimi 会对着严格 JSON 指令愉快地推理很多分钟，*要么*最终发出 JSON、*要么*预算耗尽无内容。评测在夹具 1 上观察到 16 分钟无进展后被杀。

这**不是可修复的提示词或 schema 问题**——是模型响应风格的属性。第 1 轮在 Kimi 上「工作」（产出*某种东西*的意义上）只因宽松提示词让 Kimi 发散文 markdown、自然地用了 `content`。修复后的严格 JSON 提示词激发 Kimi 的推理模式并饿死可见响应。

**Kimi-K2.6 不适合 ai-memory 的整编工作负载。**它适合更宽的「帮我总结这个」场景——格式化散文无妨——只是不适合我们 JSON-schema 校验的路径。

其他推理模式模型（开 extended thinking 的 Claude、GPT-o3、Gemini "thinking" 变体）需要同样的告诫：关掉推理模式，或把推理消耗算进 token 预算。

## 第 3 轮——收紧的反幻觉系统提示词

上面第 2 轮的证据表明 Sonnet 在幻觉日期、捏造 "Alternatives considered" 表、发明教程小节——观察里没有的内容。连 Haiku 也偶尔失手。修复不是换模型；是收紧**系统提示词**、显式要求忠实：

```text
## FAITHFULNESS — the most important rule

The wiki records *what happened in this project*, not what you
know about the topic in general. … Every claim in every page
MUST be grounded in the observations.

Do NOT:
- Invent dates, timestamps, version numbers, commit hashes,
  author names, file paths, function names, line numbers,
  error codes, or any other concrete detail not present in the
  observations.
- Add 'When to use' / 'When NOT to use' / 'Gotchas' / 'Best
  practices' / 'Alternative approaches' / 'See also' sections
  that weren't grounded in the session.
- Enumerate alternatives that weren't actually considered in
  the session.
- Expand terse user comments into long explanations.
- Fabricate code examples that didn't appear in the session.
- Speculate about consequences unless the speculation
  appeared in the observations themselves.

Do:
- Compress and restructure the observations into well-titled
  pages with the right `kind` classification.
- Preserve the user's actual phrasing for decisions and rules.
- Keep page bodies short. A good consolidated page is 100-400
  words of dense fact, not 1500 words of tutorial.
```

该改动在 [`crates/ai-memory-consolidate/src/consolidator.rs`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-consolidate/src/consolidator.rs) 的 `pub const BATCH_SYSTEM_PROMPT` 下。

### 同样夹具、收紧提示词——Haiku vs Sonnet

| 指标 | Sonnet（旧提示词） | Sonnet（收紧） | Δ |
|---|---|---|---|
| 解析率 | 5/5 | 5/5 | 不变 |
| 平均延迟 | 27.1 s | **10.8 s** | **−60%** |
| 字节（夹具 5 原始） | 7,642 | 2,640 | **−65%** |
| 逐夹具更新数 | 4-4-4-1-4 | 3-3-3-1-3 | 更少制造的页面 |
| 发明 `Date: 2025-01-23` | **2 次** | 0 | ✓ 消失 |

| 指标 | Haiku（旧提示词） | Haiku（收紧） | Δ |
|---|---|---|---|
| 解析率 | 5/5 | 5/5 | 不变 |
| 平均延迟 | 12.9 s | **7.3 s** | **−43%** |
| 字节（夹具 5 原始） | 5,888 | 2,191 | **−63%** |
| 逐夹具更新数 | 5-4-4-1-4 | 4-2-4-1-3 | 更少制造的页面 |
| 发明 "Options considered" 填充 | 少许 | 0 | ✓ 消失 |

### 同一提示词对本地模型——Haiku vs qwen3:32b

| 夹具 | Haiku 解析 | Haiku ms | Haiku 更新数 | qwen3 解析 | qwen3 ms | qwen3 更新数 |
|---|---|---|---|---|---|---|
| 01 rust-bug-fix | ✓ | 11,151 | 3 | ✓ | 110,817 | 4 |
| 02 architecture-decision | ✓ | 8,793 | 3 | ✓ | 90,890 | 3 |
| 03 gotcha-with-rule | ✓ | 7,610 | 3 | ✓ | 91,307 | 3 |
| 04 low-signal-session | ✓ | 2,922 | **1** | ✓ | 44,502 | **1** |
| 05 multi-topic-session | ✓ | 9,681 | 3 | ✓ | 122,220 | 5 |
| **合计** | **5/5** | **平均 8 s** | - | **5/5** | **平均 92 s** | - |

**qwen3 从 4/5 → 5/5**——合法 `kind` 值的逐字段显式列举消除了破坏第 2 轮的 "concept" 漂移。

收紧提示词的改动是整个调查里最有用的 diff。同样模型、零基础设施变更、约 60% 延迟降低、Sonnet 日期幻觉完全消除、qwen3 解析率恢复持平。

## 第 4 轮——预算档托管对比

确立 Haiku 4.5 在此任务上胜过 Sonnet 4.5 之后，问题变成「有没有更便宜但仍可用的托管选项？」测了两个：

### GPT-5.4-mini（OpenRouter）vs Haiku 4.5

| 夹具 | GPT-mini 解析 | GPT-mini ms | GPT-mini 更新数 | Haiku 解析 | Haiku ms | Haiku 更新数 |
|---|---|---|---|---|---|---|
| 01 rust-bug-fix | ✓ | 4,048 | 4 | ✓ | 9,673 | 4 |
| 02 architecture-decision | ✓ | 4,851 | 4 | ✓ | 8,322 | 3 |
| 03 gotcha-with-rule | ✓ | 4,212 | 4 | ✓ | 8,211 | 3 |
| 04 low-signal-session | ✓ | 4,636 | **2*** | ✓ | 3,258 | **1** |
| 05 multi-topic-session | ✓ | 3,997 | 3 | ✓ | 10,583 | 4 |
| **合计** | **5/5** | **平均 4.3 s** | - | **5/5** | **平均 8.0 s** | - |

*GPT-5.4-mini 在低信号会话上没过克制测试：它为一个修错字造了一页多余的 `decisions/docs-spelling.md`。内容是忠实的（只是复述了错字更正），但把「我们修了个错字」分类为持久架构决策是过度提取。Haiku 正确地只发了情节会话日志，理由是 "Session was trivial; only the episodic record is warranted."。

其余方面 GPT-5.4-mini 是**测过的最快托管模型**（平均 4.3 s、约 2 倍于 Haiku）且输出最短（夹具 5 约 2.3 KB，对 Haiku 约 3.5 KB、Sonnet 约 2.6 KB）。无发明日期、无捏造教程小节。

### DeepSeek V4 Flash（OpenRouter）vs Haiku 4.5

| 夹具 | DeepSeek 解析 | DeepSeek ms | DeepSeek 更新数 | Haiku 解析 | Haiku ms | Haiku 更新数 |
|---|---|---|---|---|---|---|
| 01 rust-bug-fix | ✓ | 13,921 | 3 | ✓ | 8,817 | 4 |
| 02 architecture-decision | ✓ | 20,835 | 4 | ✓ | 9,196 | 3 |
| 03 gotcha-with-rule | ✓ | 54,203 | 4 | ✓ | 8,376 | 3 |
| 04 low-signal-session | ✓ | 4,049 | **1** | ✓ | 2,837 | **1** |
| 05 multi-topic-session | ✓ | 15,543 | 5 | ✓ | 7,616 | 3 |
| **合计** | **5/5** | **平均 21.7 s** | - | **5/5** | **平均 7.4 s** | - |

DeepSeek V4 Flash 过了每条可靠性线——5/5 解析、低信号正确克制、无幻觉日期（其输出里的 "2026-08"*确实*在源观察里）、正确的 `kind: rule` 分类。注：夹具 3 花了 54 s，暗示负载下方差或扩展推理。多主题上它产出 5 条更新、多于其他模型收敛的 3 条——比 Haiku 略奔放。

## 综合排名——全部六个提供方

逐轴 0-5 打分再聚合。除成本（低成本得高分）外**每列越高越好**。粗体 = 该列最佳。按对 ai-memory 的整体适配排序。

| # | 提供方 | 解析 | 速度 | 成本† | 忠实度 | 克制 | 分类 | 适配 |
|---|---|---|---|---|---|---|---|---|
| 1 | **Haiku 4.5** | 5 | 4 | 3 | 5 | **5** | **5** | **5**——推荐默认 |
| 2 | **GPT-5.4-mini** | 5 | **5** | **5** | 5 | 3 | 4 | 4——更便宜替代 |
| 3 | **qwen3:32b（Ollama）** | 5 | 1 | **5**（$0） | 5 | **5** | 4 | 4——有本地服务器则免费 |
| 4 | DeepSeek V4 Flash | 5 | 2 | 4 | 5 | **5** | **5** | 4——对 GPT-mini 或 Haiku 无优势 |
| 5 | Sonnet 4.5 | 5 | 4 | 1 | 4‡ | 4 | 3 | 3——被 Haiku 取代 |
| 6 | Kimi-K2.6 | 0 | 0 | 无 | 无 | 无 | 无 | **0**——不合格（推理模型） |

† 成本分从 $/M 输出 token 量级派生：$0（qwen3）= 5；~$0.40（DeepSeek）= 4；~$1（GPT-mini）= 按摊销的每任务成本算 5；~$5（Haiku）= 3；~$15（Sonnet）= 1。

‡ Sonnet 宽松提示词下忠实度 2/5（发明日期、捏造备选小节）。收紧提示词后恢复到 4——但 Haiku 不那么依赖提示词改动就达到同一水平，说明 Haiku 在此任务上有更好的默认。

### 每列为什么重要

- **解析**：结构可靠性。低于 5/5 意味着生产整编可能静默失败并丢观察。
- **速度**：对整编不那么要紧（后台任务），但在多页 lint 清扫上复利、且影响对提示词本身的开发迭代。
- **成本**：对每天 N 会话 × 365 天积分。便宜选项把成本从月度经常性变成可忽略。
- **忠实度**：模型是否只写观察里有的东西？对*记忆* wiki 至关重要——捏造腐蚀长期记录。
- **克制**：会话低信号时模型是否抵得住制造页面？缺克制用稀薄的、制造的「决策」页污染 wiki、盖过真实内容。
- **分类**：模型是否正确把规则标 `kind: rule`、决策标 `kind: decision` 等？错误分类破坏整编器到 `_rules/<slug>.md` 的自动路由。
- **对 ai-memory 的适配**：每个提供方对这个具体整编工作负载的整体裁决。不是通用 LLM 基准。

### 最终排序

专就 ai-memory 的整编任务：

1. **Haiku 4.5**——**多数用户的推荐默认。**托管（总是可用）、平均 7 s 延迟、克制 + 分类全场最佳、个人使用下 ~$0.02/次可忽略。其他一切选项的丈量基准。
2. **GPT-5.4-mini**——**更便宜的托管替代。**比 Haiku 便宜约 5 倍、快 2 倍（平均 4 s）。唯一弱点是琐碎会话上轻度过度分类（为修错字会话多造一页 "decisions/"）。预算比克制要紧就选它。
3. **Ollama 上的 qwen3:32b**——**有本地服务器者的免费替代。**每次整编 $0。约 92 s 延迟不可见，因为整编是后台任务。克制 + 忠实度匹敌顶级托管模型。要求 Ollama（或兼容的 OpenAI-compat 服务器）已拉取 `qwen3:32b` 且有足够 RAM/VRAM（约 20 GB）保温。
4. **DeepSeek V4 Flash**——**扎实但无明确优势。**全部可靠性线达标、忠实、克制、正确分类规则。但 GPT-mini 质量持平、速度更胜；Haiku 质量持平、分类一致性更胜。只在你的工作流已偏向 DeepSeek 时选。
5. **Sonnet 4.5**——纯整编上**被 Haiku 严格支配**。3 倍价格、同样解析率、延迟仅略不同。留给*专门*需要扩展推理的任务（跨页比较矛盾论断的 lint 清扫，或观察稀少、希望模型更激进推断的会话）。
6. **Kimi-K2.6**——**不合格。**推理模型在发出可见内容前把 `max_tokens` 预算烧在内部思考上。严格 JSON 提示词上无限挂起。同样的告诫适用于其他推理模式模型（开 extended thinking 的 Claude、GPT-o3、Gemini "thinking" 变体）——先关推理或把消耗算进预算再用到这里。

## 定性读法（第 2 轮）

并排读原始 `.md` 输出揭示解析率数字捕捉不到的实质风格差异：

- **Sonnet 写长而全面的条目。**一个 Docker 多阶段构建的概念页会有 3 KB 组织良好的散文，含 "When to use" / "When NOT to use" / "Gotchas" 小节——*观察里没有的*内容。模型在生成有用的教程式内容、不是严格整编发生过的事。Sonnet 的夹具 05 页发明了观察里无来源的 `Date: 2025-01-23` 字段。

- **qwen3 写简短、忠实的条目。**每页约 500-800 字符捕捉会话实际包含的东西。无发明元数据、无泛型教程填充。同一 Docker 页 qwen3 保持贴近「我们把 Dockerfile 改成两段、镜像从 380→67 MB」而不发散到更宽的最佳实践讨论。

对 **wiki 整编**（*本项目*的忠实长期记忆、不是通用最佳实践的知识图谱），**qwen3 的克制可以说优于** Sonnet 的奔放。wiki 的意义是记录项目里发生过的事，不是托管模型已经知道的再生成教程内容。

不过，项目记忆真的稀疏、且模型被要求浮出持久知识时，Sonnet 的「补上显然的」倾向可能有用。任务不同 → 偏好不同。

## 裁决

三轮修复（schema → 第一版提示词 → 收紧提示词）之后，图景清晰：

### 生产默认：Ollama qwen3:32b

- **解析**：5/5（收紧提示词）。
- **延迟**：端到端平均约 92 s。可接受，因为整编是后台任务、非交互。
- **成本**：**每次整编 $0**（电费未计）。
- **保真**：匹敌或优于托管模型——qwen3 在第 2 轮旧提示词对比里是最忠实的提供方。

### 最佳托管回退：Claude Haiku 4.5

家庭实验室够不到、或一次性复杂整编时，**Haiku 4.5 是正确的托管选择——不是 Sonnet 4.5**：

- 每个夹具上都比 Sonnet **快 2 倍**。
- 每 token **便宜约 3 倍**（Anthropic 公布价：Haiku 4.5 ≈ $1/$5 每百万输入/输出 token，Sonnet 4.5 ≈ $3/$15）。
- 即便宽松提示词也**更少幻觉倾向**。
- 至少一个夹具上**分类更好**（正确识别了 Sonnet 压扁成 gotcha 的规则）。
- 同样 5/5 解析可靠性。

### Sonnet 4.5——此任务被 Haiku 取代

Sonnet 的推理余量帮不了整编。宽松提示词下它表现为*更多幻觉*（发明日期、捏造备选表、教程式填充）。收紧提示词让 Sonnet 归队，但 Haiku 更快更便宜地给出同等可靠性。把 Sonnet 留给额外推理要紧的任务（如比较矛盾论断的跨页 lint 清扫）。

### Kimi-K2.6——不合格

推理模型——发出可见内容前内部烧 `max_tokens` 预算。严格 JSON 提示词下运行在夹具 1 挂了 16 分钟以上。直接探测证实：`content: null`、整个 token 预算被 `reasoning` 消耗。不是提示词问题；该模型在结构上就不适合严格 JSON 输出。同样的告诫适用于其他推理模式模型用在这条管线上时。

### 成本 / 延迟快照

| 提供方 | $/次* | 延迟 | 说明 |
|---|---|---|---|
| Ollama qwen3:32b（本地） | **$0** | ~92 s | 电费未计 |
| GPT-5.4-mini（OpenRouter） | ~$0.005 | **~4 s** | 最快 + 最便宜托管 |
| DeepSeek V4 Flash（OpenRouter） | ~$0.005 | ~22 s | 便宜但比 GPT-mini 慢 |
| Haiku 4.5（OpenRouter） | ~$0.02 | ~7 s | 克制/分类最佳 |
| Sonnet 4.5（OpenRouter） | ~$0.06 | ~11 s | 同样任务 3 倍于 Haiku 的价格 |
| Kimi-K2.6（OpenRouter） | 无 | ✗ 挂起 | 推理模型——不合格 |

\* 量级估计；收紧提示词下 ai-memory 整编产出约 2-3 KB。每次的 $ 是 $/M-token 乘以输入 + 输出 token 预算。

### 何时重评

以下任一变化时重跑本框架：

- 整编提示词本身被重新设计
- 拉取了新的 Ollama 模型（如 Qwen 3.5 stable 登陆 Ollama 时）
- `evals/fixtures/` 加了新夹具
- 家用服务器硬件变化
- 某本地引擎改了 `response_format=json_schema` 实现，让默认 vs `AI_MEMORY_LLM_COMPAT_STRICT=false` 的新对比值得做

## 如何复现

### 前提

- 仓库检出 + `cargo` 工具链（Rust 1.95+，按 `rust-toolchain.toml` 钉住）。
- OpenRouter API key，export 为 `OPENROUTER_API_KEY`——支付 Kimi + Sonnet 腿。
- 可达的 Ollama 且已拉取 `qwen3:32b`。文档里的默认 URL 假设家庭实验室；换成你自己的。

### 跑框架

规范的双方调用（框架每次对比两个提供方）：

```bash
cargo run -p ai-memory-eval --release -- \
    --baseline-provider  openai-compat \
    --baseline-base-url  https://openrouter.ai/api/v1 \
    --baseline-model     moonshotai/kimi-k2.6 \
    --baseline-api-key-env OPENROUTER_API_KEY \
    --candidate-provider openai-compat \
    --candidate-base-url http://192.168.0.90:11434/v1 \
    --candidate-model    qwen3:32b \
    --candidate-api-key  ollama-local
```

三方对比时，把候选方（你考虑切换到的模型）对每个想比的基线各跑一次框架。输出目录带时间戳、不冲突。

### 读输出

```
evals/runs/<timestamp>/
├── baseline/
│   ├── 01-rust-bug-fix.json          ← 解析出的结构化输出（若有）
│   ├── 01-rust-bug-fix.md            ← 平铺渲染供目检
│   ├── 01-rust-bug-fix.raw.txt       ← 模型精确输出，总有
│   └── 01-rust-bug-fix.meta.json     ← {elapsed_ms, parsed_ok, update_count, error}
└── candidate/
    └── ...
```

解析失败时 `.raw.txt` 文件信息量最大——它们展示模型说的*精确内容*，让你分清失败是格式（模型发了散文）、schema（模型用了整数枚举）、还是实质（模型没产出有用的东西）。

并排阅读时运行器打印提示：

```
compare with: diff -ru <run>/baseline <run>/candidate
```

### 加新夹具

每个夹具是 `evals/fixtures/` 下的 JSON 文件：

```json
{
  "name": "human-readable-id",
  "description": "what this case is meant to surface",
  "observations": [
    {"kind": "session-start", "title": "...", "body": "..."},
    {"kind": "user-prompt",   "title": "user prompt", "body": "..."},
    {"kind": "pre-tool-use",  "title": "Edit", "body": "..."}
  ]
}
```

`kind` 接受 [`ObservationKind`](https://github.com/akitaonrails/ai-memory/blob/main/crates/ai-memory-core/src/observation.rs) 枚举 `FromStr` 认识的任何字符串。未知值静默回退 `Other`。

争取命中四个硬情形之一：

1. **多页提取**——模型是否把会话切成正确的片？
2. **克制**——没有持久内容时是否抵得住制造页面？
3. **分类**——项目规则是否正确选 `kind: rule`？
4. **主题分离**——是否按无关主题产出独立页面而不是揉在一起？

## 本框架还没有的（暂时）

- **自动化质量打分。**运行器只报告客观增量（延迟、解析率、更新数）。更细微的（忠实度、幻觉、范围）需要人读。
- **嵌入 A/B。**本文档仅限 LLM。嵌入提供方切换（OpenAI text-embedding-3-small → Ollama nomic-embed-text）等页面侧数据够度量检索质量时单独成文。
- **LLM 当裁判。**加第三个「裁判」模型按 rubric 给候选输出打分可以自动化质量度量。未建；本框架被常态化使用后的下一层。

## 未来工作

如果最终常态化跑本框架：

1. 加第三个位置（`--judge-*`），让独立的「裁判」模型逐夹具按 rubric 给基线 vs 候选打分，产出数值质量差。
2. 给夹具扩展 `must_mention` / `must_not_mention` 关键词表，自动计算简单关键词召回（抓住明显幻觉 / 缺失事实）。
3. 并行嵌入检索评测：一组带预期目标 wiki 页的探测查询；对两个嵌入模型在同一已索引语料上算 recall@5 + MRR。
4. 把排行榜持久化到某处（讽刺的是、一页 wiki），免得跨运行丢失哪个模型在哪个夹具上表现最好的记录。
