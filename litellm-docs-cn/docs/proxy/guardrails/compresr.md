import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 上下文压缩（Compresr）

[Compresr](https://compresr.ai) 围绕正在提出的问题对 LLM 上下文做压缩：保留对回答有用的 token，丢弃其余部分。作为 LiteLLM 的一款防护栏（guardrail），它会在工具输出、检索到的文档、数据库结果和 RAG 负载到达模型之前先行压缩，从而让你用原来一小部分的输入 token 拿到同样的答案。

该功能适用于 `/v1/chat/completions`、`/v1/messages`（Anthropic 格式）和 `/v1/responses`。

## 演示

<iframe width="840" height="500" src="https://www.youtube.com/embed/4Ktiwv3ka40" frameBorder="0" allowFullScreen></iframe>

## 工作原理

这款防护栏在 `pre_call` 阶段以进程内方式运行，调用 Compresr 的托管 API（`https://api.compresr.ai`），因此不需要额外部署任何服务。只有代理（proxy）会与 Compresr 通信，而且只发送被选中做压缩的消息文本；客户端和上游 LLM 提供商都不会连接到它。被改写的只有请求输入，响应原样透传。

压缩按消息逐条进行，并且是面向查询的：

1. **选定压缩目标**。默认只压缩长度不低于 500 字符的 `tool`/`function` 输出。系统消息、此前的历史消息和最后一条用户消息原样保留，除非显式开启（`compress_system`、`compress_history`、`compress_last_user`）。
2. **为每个目标推导查询**。工具输出会围绕产生它的那次工具调用的意图来压缩：LiteLLM 通过 `tool_call_id` 找到对应的 assistant 调用，并把它渲染成例如 `web_search: {"query": "2026 EV range"}` 这样的形式。其余目标一律围绕最后一条用户消息来压缩。推导不出查询的目标不做压缩。
3. **执行压缩**。目标内容被发送到 `{api_base}/api/compress/question-specific/`（多个目标时走 `.../batch`），通过 `X-API-Key` 完成认证。
4. **回写结果**。返回的 `compressed_context` 原位替换各目标的消息文本。未被选中的消息保持逐字节不变，图片等多模态部分原样保留；压缩结果与原文相同或为空时，请求按原样转发。

默认使用 Compresr 最快的面向查询模型 `latte_v2` 做压缩。它采用抽取式策略：删掉与查询无关的片段，其余内容原样保留。

### 动态压缩

默认 `dynamic: true`：由服务端衡量每个负载的可压缩程度，并在 `dynamic_min_ratio`（服务端默认 1.5x）到 `dynamic_max_ratio`（服务端默认 10.0x）之间为其挑选一个压缩比，此时 `target_compression_ratio` 会被忽略。内容越密集压缩得越轻，越稀疏则压得越狠。

如果想固定压缩比，设 `dynamic: false` 并指定 `target_compression_ratio`：取值在 0 到 1 之间表示删掉这一比例的 token（0.5 约删一半），大于 1 时表示 Nx 压缩系数（4 约保留四分之一）。可以借助花费日志（spend logs）里的 `tokens_saved` 统计来判断你的负载能承受多大压缩。

## 前提条件

你只需要一个包含 `compresr` 防护栏的 LiteLLM 版本，以及一个来自 [compresr.ai](https://compresr.ai) 的 API 密钥（API key）。私有化部署请联系 [founders@compresr.ai](mailto:founders@compresr.ai)。

## 快速上手

### 1. 在配置文件中定义防护栏

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

guardrails:
  - guardrail_name: compresr-compression
    litellm_params:
      guardrail: compresr
      mode: pre_call
      api_key: os.environ/COMPRESR_API_KEY
#     api_base: https://api.compresr.ai  [OPTIONAL, change only for on-prem]
#     model: latte_v2                    [OPTIONAL, this is the default]
#     unreachable_fallback: fail_open    [OPTIONAL, defaults to fail_closed]
#     default_on: true                   [OPTIONAL]
```

请使用 `mode: pre_call`，因为这款防护栏只改写请求输入。`api_key` 为必填，可以写在配置里，也可以用环境变量 `COMPRESR_API_KEY`。设 `default_on: true` 会压缩所有请求；不设（推荐）则压缩保持按密钥或按请求自愿开启。

其余配置都通过 `optional_params` 传递，完整清单见[配置参考](#配置参考)：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: compresr-compression
    litellm_params:
      guardrail: compresr
      mode: pre_call
      api_key: os.environ/COMPRESR_API_KEY
      optional_params:
        compress_tool_outputs: true   # default; tool/function results
        compress_system: false        # default; opt in to compress system prompts
        min_chars_to_compress: 500    # default; shorter messages skipped
        dynamic: true                 # default; service picks ratio per payload
```

也可以在管理界面（Admin UI）的 Guardrails 页面创建这款防护栏，字段完全相同；上方的[演示视频](#演示)完整走了一遍这个流程。

### 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml
```

### 3. 发送请求

<Tabs>
<TabItem label="OpenAI 格式" value="openai">

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "Which filing discusses Q3 revenue?"},
      {"role": "assistant", "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "search_filings", "arguments": "{\"query\": \"Q3 revenue\"}"}}]},
      {"role": "tool", "tool_call_id": "call_1", "content": "<...tens of thousands of tokens of filing text...>"}
    ],
    "guardrails": ["compresr-compression"]
  }'
```

</TabItem>
<TabItem label="Anthropic 格式" value="anthropic">

```shell
curl -i http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "{{anthropic}}",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Which filing discusses Q3 revenue?"}
    ],
    "litellm_metadata": {"guardrails": ["compresr-compression"]}
  }'
```

</TabItem>
</Tabs>

负载转发上游之前，工具输出会围绕 `search_filings: {"query": "Q3 revenue"}` 完成压缩；其余内容分毫不动。

## 按密钥启用压缩

未设置 `default_on` 时，只有主动加入的请求才会被压缩。常见做法是把防护栏绑到虚拟密钥（virtual key）上，这样拿到这把密钥的人无需改任何客户端代码就能享受压缩。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "guardrails": ["compresr-compression"]
      }'
```

用返回的密钥发出的每个请求都会经过 `compresr-compression`；已有密钥则用 `/key/update` 带上同样的 `guardrails` 字段即可。用虚拟密钥认证还能启用[取回](#取回被压缩的内容compresr_retrieve)功能，因为原文是按密钥存储的。没有虚拟密钥的请求照样会被压缩，但无法取回原文。

## 按请求启用压缩

客户端可以在单次调用上自行加入，无需管理员参与。

<Tabs>
<TabItem label="OpenAI 格式" value="openai-perreq">

在请求体里传入 `guardrails` 数组：

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-..." \
  -d '{
    "model": "{{anthropic}}",
    "messages": [...],
    "guardrails": ["compresr-compression"]
  }'
```

</TabItem>
<TabItem label="Anthropic 格式" value="anthropic-perreq">

`/v1/messages` 没有顶层的 `guardrails` 字段，改用 `litellm_metadata` 加入：

```shell
curl -i http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-..." \
  -d '{
    "model": "{{anthropic}}",
    "max_tokens": 1024,
    "messages": [...],
    "litellm_metadata": {"guardrails": ["compresr-compression"]}
  }'
```

</TabItem>
</Tabs>

响应会带上 `x-litellm-applied-guardrails: compresr-compression` 头，调用方借此确认压缩确实执行过。

## 自动路由器场景下的压缩

[自动路由器](../auto_routing.md)处理的请求会发出两次调用：一次用于给请求分类，一次打到路由到的模型。默认情况下两次调用看到的都是同一份压缩后文本。从 v1.101.0 起，路由器可以通过 `auto_router_routing_compression` 和 `auto_router_model_compression` 为每一跳分别指定压缩防护栏，也可以对某一跳设 `none`。设置其中任一字段后，这类请求的压缩就交由路由器全权负责，本页在密钥、团队或请求层面附加的防护栏对它们不再生效。参见[压缩](../auto_routing.md#压缩)。

## 向团队推广

平台管理员可以为整个团队开启压缩，客户端零改动。最适合的是智能体（agent）和 RAG 类负载：它们的流量大头是非代码的工具输出，比如搜索结果、检索到的文档、工单往来、CRM 记录和各类转写文本。

**管理员：在 `config.yaml` 中注册 Compresr**。按照快速上手一节定义 `compresr-compression`。保持 `default_on` 不开启，让只有主动加入的密钥才被压缩。

**管理员：为每位开发者签发绑定 Compresr 的密钥**。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "key_alias": "support-agent-alice",
        "guardrails": ["compresr-compression"],
        "models": ["{{anthropic}}"],
        "metadata": {"team": "compression-rollout"}
      }'
```

**开发者：把客户端指向代理**。任何兼容 OpenAI 或 Anthropic 的客户端都可以，因为只有 base URL 和密钥变了。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-litellm-proxy.example.com/v1",
    api_key="sk-the-key-the-admin-issued",
)
```

从这一步起，用这把密钥发出的每个请求都会在派发前压缩工具结果。若想对单个请求跳过压缩（比如想对比未压缩的基线），在 `optional_params` 里设 `allow_bypass_header: true`，并在该次调用中发送 `x-compresr-bypass: true`；由于任何调用方都能随意设置请求头，管理员未开启此开关时该头会被忽略。

## 取回被压缩的内容（`compresr_retrieve`）

每条被压缩的消息，其原文在请求存续期间始终可取。开启 `enable_retrieval`（默认开启）后，每次压缩都会：

1. 把原文存入内存，以其 SHA-256 的前 24 个十六进制字符作为键。
2. 在压缩后文本末尾追加标记：`[compresr hash=<hash>: parts of this content were compressed away. If you need the full original, call the compresr_retrieve tool with this hash.]`
3. 在请求现有工具旁注入一个 `compresr_retrieve` 函数工具，带一个必填的 `hash` 参数。

模型调用 `compresr_retrieve` 时，LiteLLM 会拦截这次调用、还原原文、补上一段正确配对的工具往返，然后重新发起请求，客户端看到的仍是一次普通的补全。三种接口上都保证了格式正确：Anthropic 用 `tool_use`/`tool_result` 块，Responses API 用 `function_call`/`function_call_output` 条目，chat completions 用 `role: tool` 消息。如果模型在同一轮里把 `compresr_retrieve` 和真实工具调用混在一起，服务端只解决取回调用，真实调用留到下一轮由模型重新规划，工具调用与结果依然成对。

取回循环有明确的边界：

- **租户隔离**。原文上下文按发起请求的虚拟密钥存储，哈希只对签发给它的那把密钥生效，其他密钥什么都拿不到。没有虚拟密钥的请求缺少用于划定存储范围的身份，因此取回对其禁用，并在每个进程记一次警告日志。
- **放大防护**。单轮最多解析 8 个哈希，且每个哈希只解析一次。编造的哈希什么都解析不到，也不会触发后续请求。
- **内存占用**。原文上下文在内存中保留 15 分钟。单次调用最多存 10 MiB（`max_bytes_per_call`），整个进程最多容纳 256 次调用、256 MiB，超出时先淘汰最旧的。大到存不下的上下文不会追加标记；已过期或被淘汰的上下文则解析失败。

这个存储位于 worker 进程内，因此在多 worker 部署中，后续取回请求可能落到与当初压缩时不同的 worker 上。可以用 `--workers 1` 运行，或设 `enable_retrieval: false`。

## 为什么 tokens_saved 会是 0

- 默认只压缩 `tool`/`function` 消息。请求中若没有任何达到 `min_chars_to_compress` 字符数的工具输出，会原样通过，也不记录防护栏统计。
- 推导不出查询的目标不做压缩。
- 压缩结果与输入相同则视作空操作。
- 在 Responses API 上，只有映射关系明确时才把压缩后内容回写进去；含糊的情况宁可保持原样，也不冒损坏负载的风险。
- 开启 `allow_bypass_header` 后，携带旁路头会跳过压缩。

## 失败语义

默认是 `fail_closed`：Compresr 服务不可达、超时（预算 60 秒）或返回异常状态码、异常响应体时，请求会以 `502` 和一条笼统的错误信息失败；上游响应体只进服务器日志，绝不返回给客户端。

设 `unreachable_fallback: fail_open` 则改为不压缩直接转发请求，并在代理日志里记一条警告。只要不是精确的字符串 `fail_open`，一律按 `fail_closed` 处理。

## 安全说明

这套集成经过多轮审计，以下每一项都在代码中强制执行，并有回归测试覆盖：

- **`api_base` 经 SSRF 校验**。只接受 `http`/`https` 协议，云元数据端点（如 `169.254.169.254`）在初始化时即被拒绝，十进制、十六进制和 IPv4 映射等变体写法同样不放行。
- **跨租户隔离**：取回存储按租户隔离，伪造的 `user_api_key` 字符串明确不受信任。
- **透传防注入**。`compression_params` 原样转发，但保留键 `context`、`query`、`inputs` 会被剔除并给出警告；与具名配置字段冲突时，以具名字段为准。
- **防日志注入**。模型提供的哈希在写进日志前会去掉不可打印字符并截断。
- **错误信息脱敏**。上游错误响应体只留在服务器日志里，客户端只会看到笼统的 502。

## 验证 Compresr 是否已运行

1. 响应头 `x-litellm-applied-guardrails: compresr-compression`。
2. 花费日志记录上的 `guardrail_information` 字段：`messages_compressed`、`tokens_before`、`tokens_after`、`tokens_saved`、`compression_model`。只有确实压缩了至少一条消息时才会记录这些值。
3. 管理界面：在 **Logs** 中打开任一请求，滚动到 **Guardrails & Policy Compliance**，`compresr-compression` 会作为带延迟数据的 `pre-call` 步骤出现在 **Request Lifecycle** 下，**Evaluation Details** 下也有一条对应记录。

## 预期效果

典型负载可以无质量损失地压缩 2 到 10 倍。稀疏内容压缩空间最大，往往远超这个区间：转写文本、报告、申报文件、工单往来、日志和搜索结果里，大部分 token 与眼前的提问毫无关系。结构化数据（JSON、XML、HTML）压缩效果也很好。代码暂时不做压缩。

## 配置参考

顶层的 `litellm_params`：

| 参数                   | 类型 | 说明                                                                                                                           |
| ---------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| `guardrail`            | str  | 必须填 `compresr`。                                                                                                            |
| `mode`                 | str  | 使用 `pre_call`。这款防护栏只改写请求输入，响应原样透传。                                                                      |
| `api_key`              | str  | Compresr 的 API 密钥，以 `X-API-Key` 请求头发送。未设置时回退到 `COMPRESR_API_KEY`。必填，缺失时初始化失败。                    |
| `api_base`             | str  | Compresr API 的 base URL。未设置时回退到 `COMPRESR_API_BASE`，再回退到 `https://api.compresr.ai`。仅私有化部署时修改。          |
| `model`                | str  | 压缩模型（不是 LLM 本身）。默认 `latte_v2`。                                                                                   |
| `unreachable_fallback` | str  | `fail_closed`（默认）在服务故障时返回 502；`fail_open` 不压缩直接转发请求。                                                    |
| `default_on`           | bool | 对每个请求都生效，无需逐次调用加入。默认 `false`。                                                                             |

嵌套的 `optional_params`（每个字段也可以直接写在 `litellm_params` 下；嵌套值优先）：

| 参数                       | 类型  | 默认值 | 说明                                                                                                           |
| -------------------------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `target_compression_ratio` | float | `0.5`   | 取值 0 到 1 之间时表示删除的 token 比例；大于 1 时表示 Nx 压缩系数。`dynamic` 开启时被忽略。                    |
| `coarse`                   | bool  | `true`  | 按段落粒度打分（更快）。设 `false` 切换到 token 粒度。                                                          |
| `min_chars_to_compress`    | int   | `500`   | 短于该长度的消息直接跳过。                                                                                      |
| `compress_tool_outputs`    | bool  | `true`  | 压缩 `tool`/`function` 结果。                                                                                   |
| `compress_system`          | bool  | `false` | 压缩系统消息。                                                                                                  |
| `compress_history`         | bool  | `false` | 压缩最后一条之前的用户消息。                                                                                    |
| `compress_last_user`       | bool  | `false` | 压缩最后一条用户消息，以其自身文本作为查询。                                                                    |
| `enable_retrieval`         | bool  | `true`  | 存储原文、追加标记并注入 `compresr_retrieve` 工具。                                                             |
| `max_bytes_per_call`       | int   | `10485760` | 单次调用可存储原文的上限（10 MiB）。`0` 表示不设上限，负值会被拒绝。                                         |
| `allow_bypass_header`      | bool  | `false` | 认可 `x-compresr-bypass: true`。默认关闭，因为请求头由调用方掌控。                                              |
| `dynamic`                  | bool  | `true`  | 由服务端按每个负载挑选压缩比（`latte_v2`）。                                                                    |
| `dynamic_min_ratio`        | float | unset   | 动态模式的下界；服务端默认 1.5。                                                                                |
| `dynamic_max_ratio`        | float | unset   | 动态模式的上界；服务端默认 10.0。                                                                               |
| `compression_params`       | dict  | unset   | 原样转发给压缩 API 的额外字段。`context`、`query`、`inputs` 为保留键，会被剔除。                                 |

## 环境变量

| 变量                | 说明                                                          |
| ------------------- | ------------------------------------------------------------- |
| `COMPRESR_API_KEY`  | 防护栏配置中未设置 `api_key` 时的回退值。                     |
| `COMPRESR_API_BASE` | 防护栏配置中未设置 `api_base` 时的回退值。                    |

## 关于 Compresr

Compresr 是一家 YC 孵化公司（W26 届），由四位 EPFL 研究人员创立，他们曾任职于 Microsoft、贝尔实验室（Bell Labs）和 UBS。欢迎访问 [compresr.ai](https://compresr.ai)、[YC 页面](https://www.ycombinator.com/companies/compresr)或 [LinkedIn](https://www.linkedin.com/company/compresr)。
