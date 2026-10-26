import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 提示词压缩（Headroom）

Headroom 是面向 LLM 应用的上下文优化层。它在工具输出、数据库查询结果、文件读取内容和 RAG 负载送达模型之前先行压缩，让你只用一小部分 token 就能得到同样的回答。

`/v1/chat/completions` 和 `/v1/messages`（Anthropic 格式）两种端点均支持该功能。

## 演示

<iframe width="840" height="500" src="https://www.loom.com/embed/6cb57484c5444c9aa0585db1a1b17bb5" frameBorder="0" allowFullScreen></iframe>

## 架构

Headroom 以 sidecar 服务的形式与 LiteLLM 并排运行。客户端流量照常访问 LiteLLM 网关；LiteLLM 在 `pre_call` 步骤中以进程内调用的方式让 Headroom 重写消息，随后把压缩后的负载转发给上游 LLM。客户端和上游 LLM 提供商都不与 Headroom 直接通信。

![客户端到 LiteLLM 再到 LLM，Headroom 作为 sidecar 挂载在 LiteLLM 上](/img/headroom_architecture.png)

## 前提条件

需要 LiteLLM v1.92.x 或更高版本，以及一个可访问的 Headroom 代理。下文 [部署 Headroom](#部署-headroom) 给出了单文件 Dockerfile。

如果想在稳定版定稿前先做测试，可以使用 [v1.92.0-dev.1](https://github.com/BerriAI/litellm/releases/tag/v1.92.0-dev.1) 开发版。

## 快速上手

### 1. 在配置中定义防护栏

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

guardrails:
  - guardrail_name: headroom-compression
    litellm_params:
      guardrail: headroom
      mode: pre_call
      api_base: https://your-headroom-service
#     api_key: os.environ/HEADROOM_API_KEY  [OPTIONAL]
#     default_on: true [OPTIONAL]
```

只有 `pre_call` 模式有意义；该防护栏（guardrail）对响应不做任何处理。

想让经过代理的每个请求都被压缩，就加上 `default_on: true`。想让压缩改为按需开启（向部分用户或工作负载灰度放量时推荐这种做法），则保持不设置该项。

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
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Summarize the prior conversation..."}
    ],
    "guardrails": ["headroom-compression"]
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
      {"role": "user", "content": "Summarize the prior conversation..."}
    ],
    "litellm_metadata": {"guardrails": ["headroom-compression"]}
  }'
```

</TabItem>
</Tabs>

消息会以 JSON 请求体 `{"messages": [...], "model": "<model>"}` 的形式发送到 headroom 服务的 `{api_base}/v1/compress`。返回的 `messages` 列表会在调用 LLM 之前替换原请求负载。

## 按密钥启用压缩

未设置 `default_on` 时，只有显式选择加入的请求才会执行压缩。常见的管理做法是把防护栏绑定到虚拟密钥（virtual key）上，这样使用该密钥的开发者无需改动客户端代码，就能自动获得压缩。

创建一个绑定了 Headroom 的密钥：

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "guardrails": ["headroom-compression"]
      }'
```

使用返回密钥发起的每个请求，都会在到达 LLM 之前先经过 `headroom-compression` 处理。若要绑定到已有密钥，使用 `/key/update` 并带上同样的 `guardrails` 字段即可。

## 按请求启用压缩

客户端无需管理员介入，即可在单次调用中选择加入压缩。

<Tabs>
<TabItem label="OpenAI 格式" value="openai-perreq">

在请求体中传入 `guardrails` 数组：

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-..." \
  -d '{
    "model": "{{anthropic}}",
    "messages": [...],
    "guardrails": ["headroom-compression"]
  }'
```

</TabItem>
<TabItem label="Anthropic 格式" value="anthropic-perreq">

`/v1/messages` 没有顶层的 `guardrails` 字段，因此通过 `litellm_metadata` 选择加入：

```shell
curl -i http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-..." \
  -d '{
    "model": "{{anthropic}}",
    "max_tokens": 1024,
    "messages": [...],
    "litellm_metadata": {"guardrails": ["headroom-compression"]}
  }'
```

</TabItem>
</Tabs>

响应中会带有 `x-litellm-applied-guardrails: headroom-compression` 响应头，调用方可以借此确认压缩确实执行了。

### `x-headroom-bypass` 只能用来关闭压缩

在防护栏自身的代码看到请求头之前，LiteLLM 就已经决定了某个请求要不要执行 `headroom-compression`：这一决定来自 `config.yaml` 里的 `default_on`、防护栏是否绑定在调用方的密钥或团队上，以及上文展示的按请求 `guardrails` / `litellm_metadata.guardrails` 选择加入。只有当决定结果是“执行”时，防护栏才会检查 `x-headroom-bypass`，并且它认作旁路的唯一取值是字面量 `true`（大小写不敏感）。其他任何取值，包括 `false`、空请求头，或压根没有这个请求头，都不会产生影响，防护栏仍按既定安排运行。

具体来说：在 `default_on: false` 且调用方密钥未绑定 `headroom-compression` 的情况下，发送 `x-headroom-bypass: false` 并不会为该请求开启压缩，也不存在能做到这一点的按请求请求头。按请求跳过压缩是可行的（`x-headroom-bypass: true`，见上文 Claude Code 一节）；要在没有管理员介入的情况下按请求启用压缩，需要使用 `guardrails` / `litellm_metadata.guardrails` 字段，而不是请求头。

## 自动路由器背后的压缩

经由[自动路由器（auto router）](./auto_routing.md)处理的请求会发起两次调用，一次用于对请求分类，一次发往实际路由到的模型。默认情况下，两者看到的是同一段压缩后的文本。从 v1.101.0 开始，路由器可以通过 `auto_router_routing_compression` 和 `auto_router_model_compression` 为每一跳分别指定压缩防护栏，也可以把其中任一跳设为 `none`。只要设置了其中任一字段，路由器就会接管自己请求的压缩，并且无论上述防护栏绑定在密钥、团队还是请求体上，对这类请求一律不再生效。参见[压缩](./auto_routing.md#压缩)。

## Claude Code 用法

这是最常见的落地方式：平台管理员希望为一个经由 Claude Code 产生大量流量的团队削减输入 token 开销，同时不要求每位开发者改动自己的环境配置。

整个流程分三步。

**管理员：在 `config.yaml` 中注册 Headroom**。按照快速上手一节所示定义 `headroom-compression`。让 `default_on` 保持不设置，这样只有选择加入的密钥才会启用压缩。

**管理员：为每位开发者签发绑定了 Headroom 的密钥**。每个开发者拿到一个绑定了该防护栏的虚拟密钥。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "key_alias": "claude-code-alice",
        "guardrails": ["headroom-compression"],
        "models": ["{{anthropic}}"],
        "metadata": {"team": "claude-code-rollout"}
      }'
```

**开发者：把 Claude Code 指向代理**。无需改动任何代码；Claude Code 会从环境中读取 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_AUTH_TOKEN`。

```shell
export ANTHROPIC_BASE_URL="https://your-litellm-proxy.example.com"
export ANTHROPIC_AUTH_TOKEN="sk-the-key-the-admin-issued"

claude
```

从此以后，Claude Code 发出的每个 `/v1/messages` 请求都会先由 Headroom 压缩，再分发到 Anthropic。除了花费日志上的 token 用量降低之外，开发者感知不到任何行为变化。要验证压缩是否执行，管理员可以查看对应花费日志条目中的 `guardrail_information`，或者检查响应头中的 `x-litellm-applied-guardrails: headroom-compression`。

如果某位开发者想跳过单次请求的压缩（例如想对比未压缩的基线效果），可以为该次调用设置 `x-headroom-bypass: true` 请求头。

## 验证 Headroom 是否运行

在管理界面（Admin UI）中打开 **日志**（Logs）里的任一请求，滚动到 **防护栏与策略合规**（Guardrails & Policy Compliance）面板，你会看到 `headroom-compression` 列在 **请求生命周期**（Request Lifecycle）下，显示为一个带有延迟数据的 `pre-call` 步骤，同时在 **评估详情**（Evaluation Details）下也有一条记录。

![LiteLLM 日志界面中的 Headroom 防护栏](/img/headroom_logs.png)

## 部署 Headroom

以下是部署 headroom 代理所用的 Dockerfile：

```Dockerfile
FROM python:{{python_version}}-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && pip install --no-cache-dir "headroom-ai[proxy]==0.27.0" \
    && apt-get purge -y build-essential \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8787
ENV HEADROOM_TELEMETRY=off
CMD ["headroom", "proxy", "--host", "0.0.0.0", "--port", "8787"]
```

### 为什么 `requests_compressed` 可能是 0

Headroom 默认保护两类消息。这些设置在 Headroom 容器自身上配置，而不是在 LiteLLM 的 `config.yaml` 中：

- `user`/`system` 消息，除非设置了 `ENV HEADROOM_COMPRESS_USER_MESSAGES=1`。Claude Code 的流量大多来自 `user` 角色，因此默认部署不会压缩其中任何内容。
- 带 Anthropic `cache_control` 标记的消息，则一律不压缩。压缩它们会破坏提示词缓存的字节级匹配，且没有可用的覆盖开关。

## 配置参考

| 参数         | 类型 | 说明                                                                             |
| ------------ | ---- | -------------------------------------------------------------------------------- |
| `guardrail`  | str  | 必须为 `headroom`。                                                              |
| `mode`       | str  | 使用 `pre_call`。该防护栏对响应不做任何处理。                                    |
| `api_base`   | str  | headroom 服务的基础 URL。未设置时回退到环境变量 `HEADROOM_API_BASE`。必填。      |
| `api_key`    | str  | headroom 服务的 Bearer 令牌。未设置时回退到 `HEADROOM_API_KEY`。可选。           |
| `model`      | str  | 转发给 `/v1/compress` 的模型名称。默认取请求的 `model` 字段。                    |
| `default_on` | bool | 对每个请求都执行该防护栏，无需逐次调用选择加入。默认为 `false`。                 |

## 环境变量

| 变量                 | 说明                                                     |
| -------------------- | -------------------------------------------------------- |
| `HEADROOM_API_BASE`  | 防护栏配置中未设置 `api_base` 时的回退值。               |
| `HEADROOM_API_KEY`   | 防护栏配置中未设置 `api_key` 时的回退值。                |
