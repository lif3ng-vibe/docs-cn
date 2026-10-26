---
title: Codex (CLI)
sidebar_label: Codex (CLI)
---

import Image from '@theme/IdealImage';

# 将 Codex CLI 接入 LiteLLM

[Codex](https://github.com/openai/codex) 的全部配置都读取自 `~/.codex/config.toml`。你可以在这一处把 LiteLLM 定义为自定义模型提供商，并在同一文件里注册 [MCP（Model Context Protocol）网关](../../mcp.md)。[ChatGPT Desktop 内的 Codex](./codex_chatgpt_desktop.md) 用的也是这份配置，所以设置一次两边都生效。

## 快速参考

| 设置项 | 取值 |
|---|---|
| 配置文件 | `~/.codex/config.toml` |
| `base_url` | `<LITELLM_PROXY_BASE_URL>/v1`（如 `http://localhost:4000/v1`） |
| 提供商密钥 | 你的 LiteLLM [虚拟密钥](../virtual_keys.md)，从 `env_key` 指定的环境变量读取，或通过 [`lite auth print-token`](#通过-litellm-sso-登录) 获取 |
| `model_catalog_url` | `<LITELLM_PROXY_BASE_URL>/v1/models`，并在 `[features]` 下设置 `api_key_model_discovery = true` |
| MCP 端点 | `<LITELLM_PROXY_BASE_URL>/<server_name>/mcp` |
| MCP 认证 | 同一个虚拟密钥，从 `bearer_token_env_var` 指定的环境变量读取 |

## LLM 设置

### 1. 安装 Codex

```bash
npm i -g @openai/codex
```

也可以用官方安装脚本：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

### 2. 将 LiteLLM 定义为模型提供商

Codex 使用 OpenAI Responses API，LiteLLM 在 `/v1/responses` 上提供该 API。在 `~/.codex/config.toml` 中添加一个提供商块并将其设为默认。`env_key` 指定 Codex 从哪个环境变量读取你的虚拟密钥，因此密钥不会存进这个文件：

```toml title="~/.codex/config.toml"
model = "{{anthropic}}"
model_provider = "litellm"

[model_providers.litellm]
name = "LiteLLM"
base_url = "http://localhost:4000/v1"
env_key = "LITELLM_API_KEY"
wire_api = "responses"
```

Agent 的长回合在网关后面可能一连几分钟没有输出，如果任务经常被提前中断，就调大流式超时和重试次数：

```toml title="~/.codex/config.toml"
[model_providers.litellm]
stream_idle_timeout_ms = 7200000
stream_max_retries = 5
request_max_retries = 4
```

导出密钥后运行 Codex：

```bash
export LITELLM_API_KEY="sk-<your-virtual-key>"

codex
```

`model` 可以填 LiteLLM 配置里的任意 `model_name`，也可用 `codex --model {{gemini_pro}}` 在单次运行时覆盖。在完成[第 4 步](#model-catalog-and-service-tiers)之前，Codex 只认识 OpenAI 自家模型的元数据，所以填网关侧的名称时，首次请求会打印 `Model metadata for ... not found. Defaulting to fallback metadata`，`/model` 选择器也一直只显示 Codex 内置的模型；不过请求本身照常发出。第 4 步会改为从网关拉取模型目录，[自定义别名的模型元数据](#自定义别名的模型元数据)则介绍改用本地目录文件的做法。

Codex 会在启动页头显示所用模型，并把任务经由网关路由。下图是 Codex 0.154 通过本地网关作答的示例：

<Image img={require('../../../img/client_setup/codex_cli_llm.png')} />

### 3. 验证

让 Codex 做一个小改动，然后到管理界面（Admin UI）的 **Logs** 或 **Usage** 下查看；请求会出现在 `/v1/responses` 下，归属到你使用的虚拟密钥和所选模型。

这条记录暂时没有终端用户信息，因为 Codex 没有能把用户写进请求体的设置项。如果想把每个请求归属到具体的开发者、客户或项目，可以在提供商块里通过 `http_headers` 或 `env_http_headers` 加上 LiteLLM 追踪请求头；参见 [Codex CLI 精细化成本追踪](../../tutorials/codex_customer_tracking.md)。

### 4. 让 Codex 列出网关的模型与服务层级 {#model-catalog-and-service-tiers}

OpenAI 部署的界面截图、配置和请求示例见 [Fast 与 Ultrafast 模式](../../providers/openai/ultrafast.md)。该指南还说明了何时设置默认 `service_tier`、何时让 Codex 按请求自选。

除非你明确告知，Codex 从不询问自定义提供商提供了哪些模型，所以它的 `/model` 选择器只显示 Codex 内置的 OpenAI 模型，`my-coding-model` 这类只存在于网关的名称永远不会出现。Codex CLI 0.159 及以上版本可以改为从网关拉取模型目录。这需要两项设置配合：提供商块上的 `model_catalog_url`，指向 `<LITELLM_PROXY_BASE_URL>/v1/models`；以及 `[features]` 下的 `api_key_model_discovery` 特性开关。缺一不可，只运行 `codex --enable api_key_model_discovery` 而不给 URL 时，Codex 不会调用网关。`suppress_unstable_features_warning = true` 可以关掉启用该特性时出现的启动警告。

```toml title="~/.codex/config.toml"
[features]
api_key_model_discovery = true
suppress_unstable_features_warning = true

[model_providers.litellm]
name = "LiteLLM"
base_url = "http://localhost:4000/v1"
model_catalog_url = "http://localhost:4000/v1/models"
env_key = "LITELLM_API_KEY"
wire_api = "responses"
```

启动时，Codex 会带上你的虚拟密钥调用 `GET /v1/models?client_version=<its version>`，网关则以 Codex 自己的目录格式应答。此后 `/model` 选择器按 `model_list` 顺序列出网关的对话模型，设置了 `model_info.display_name` 的以该名称显示，否则用 `model_name`。`openai/*` 这类通配条目以及非对话模型（如嵌入模型）会被排除。Codex 已经认识的模型（通过 `model_name` 或 `litellm_params.model` 中的上游模型识别）在你的名称下沿用 Codex 自带的元数据（推理等级、提示词、工具支持），所以由 `openai/gpt-6.1-sol` 支撑的 `my-coding-model` 会获得与 Codex 自带 `gpt-6.1-sol` 相同的推理等级和提示词。其他模型则套用 Codex 对 `codex -m <unknown name>` 使用的同一套回退元数据，并以网关的 `max_input_tokens` 作为上下文窗口，因此模型能用，但没有推理力度（reasoning effort）可选。

`model_info.service_tiers` 决定 Codex 为某个模型提供哪些服务层级，每个层级对应一个斜杠命令。层级 id `ultrafast` 会变成 `/ultrafast`；切换它之后，Codex 会在每个请求里发送 `service_tier: "ultrafast"`，网关原样转发给上游，并在模型的定价条目带有相应字段时，按该层级的成本字段（`input_cost_per_token_ultrafast` 及其他 `*_ultrafast` 字段）计费。列表项可以是层级 id 字符串，也可以是含 `id`、`name`、`description` 的对象。纯字符串以 id 首字母大写作为名称，描述固定为 `Sends service_tier=<id> upstream`，Codex 会把名称转成小写来生成命令。如果字符串指的是 Codex 为该模型自带的层级（如 `priority`），则沿用 Codex 自己的名称和描述，所以仍显示为 `/fast`。对象形式则自定义命令弹窗中显示的名称和描述。配置的列表会整体替换 Codex 为该模型自带的层级，所以想在新增层级旁保留 `/fast`，就要把 `priority` 一并列出。空列表会移除所有层级；不设置 `service_tiers` 时，Codex 认识的模型保留自带层级（不认识的模型本来就没有）。

```yaml title="config.yaml"
model_list:
  - model_name: gpt-6-astra
    litellm_params:
      model: openai/gpt-6-astra
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      service_tiers: ["priority", "ultrafast"]
  - model_name: my-coding-model
    litellm_params:
      model: openai/gpt-6-astra
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      service_tiers:
        - id: ultrafast
          name: Ultrafast
          description: Fastest responses, higher cost
```

只列出上游模型和你的提供商账户支持的层级。上面两个部署用的都是 GPT-6 Astra；在其他模型上开放层级之前，先查阅 [Fast 与 Ultrafast 支持的模型](../../providers/openai/ultrafast.md#支持的模型与可用性)。

通过管理界面或 `POST /model/new` 添加的模型同样适用这套 `model_info`。Codex 会把目录缓存五分钟，存在其主目录的 `models_cache.json` 里，因此新加进网关的模型要等这次缓存过期后再启动，才会出现在 `/model` 中。`service_tiers` 取值非法（不是列表、id 为空、对象含未知键）时，该模型一个层级都不会提供，连 Codex 内置的层级也算在内，网关会记录一条指名该模型的警告；目录其余部分不受影响。

多个部署共用同一个 `model_name` 时，请求可能路由到其中任何一个，因此 Codex 只会看到该名称下、密钥所属团队可路由到的所有部署共同列出的层级，顺序按第一个部署排列；该名称下属于其他团队的部署和已暂停的部署会被排除（路由本身也会排除它们），没有团队的密钥则读取不归属任何团队的部署。同样这批部署也决定了 Codex 自带元数据取自哪个上游模型，所以 `my-coding-model` 的部署背后是 `openai/gpt-6.1-sol` 的团队会拿到该模型的推理等级和提示词，背后是其他模型的团队则拿到回退元数据。因此，只要有一个可路由的部署未设置 `service_tiers` 或设置了非法值，该名称下的所有层级都会消失。两种情况都会记录一条指名模型的警告，所以请在每个部署上配置相同的列表。

不带 Codex `client_version` 查询参数的 `/v1/models` 或 `/models` 请求仍返回 OpenAI 形状的响应，其他客户端不受影响。Codex 最多接受 1 MiB 的目录，响应体超限时它会静默沿用内置列表，所以网关只保留放得下的条目：先保留列出了服务层级的模型，再按 `model_list` 顺序保留其余模型；放不进剩余字节的条目会被跳过，排在其后更小的条目仍会保留，被排除的模型会记录在日志里。每个条目 20 到 65 KB，大约装得下 20 到 45 个模型；被排除的无层级模型仍可按名称使用，套用 Codex 的回退元数据。请把 Codex 用户需要的模型排在 `model_list` 前面。
## 通过 LiteLLM SSO 登录

Codex 可以不长期持有虚拟密钥，而是在需要时向 `lite` CLI 索取令牌。每位开发者只需运行一次 [`lite login --pkce`](../cli_sso.md)，之后的请求就会归属到其 LiteLLM 用户和团队。

在 `~/.codex/config.toml` 中用 `auth` 表替换 `env_key`：

```toml title="~/.codex/config.toml"
model_provider = "litellm"

[model_providers.litellm]
name = "LiteLLM"
base_url = "https://litellm.example.com/v1"
wire_api = "responses"

[model_providers.litellm.auth]
command = "/absolute/path/to/lite"
args = ["--base-url", "https://litellm.example.com", "auth", "print-token"]
timeout_ms = 30000
refresh_interval_ms = 300000
```

把 `/absolute/path/to/lite` 替换为 `which lite` 返回的绝对路径。`--base-url` 的值必须与 `lite login --pkce` 时用的 URL 完全一致；为 `http://127.0.0.1:4000` 签发的令牌，在 `http://localhost:4000` 下取不到。`lite auth print-token` 只把令牌写到 stdout，并用 PKCE 登录时保存的刷新令牌为其续期。执行 `lite logout` 后，Codex 会一直收到 401 响应，直到你重新运行 `lite login --pkce`。

同时设置 `auth` 和 `env_key` 的提供商会被 Codex 拒绝，报错为 `provider auth cannot be combined with env_key`，所以添加 `auth` 时要移除 `env_key`。这就是 [OpenAI 基于命令的网关认证](https://learn.chatgpt.com/docs/enterprise/connect-to-a-gateway)，已在 Codex CLI 0.160.0 上验证。

## 自定义别名的模型元数据

Codex 会在内置目录里查找所选模型名，以确定上下文窗口、推理等级和工具支持。Codex 不认识的 LiteLLM `model_name`（比如自定义别名）仍能正常工作，但 Codex 会记录 `Unknown model <name> is used. This will use fallback model metadata.`，并按通用默认值运行。

运行 `codex debug models` 可以打印内置目录。把你的别名所路由到的那个模型的条目复制出来，将其 `slug` 改为 LiteLLM 的 `model_name`，然后保存成 `{"models": [ ... ]}` 的形式。在 `~/.codex/config.toml` 中，`model_catalog_json` 要放在第一个 TOML 表之前：

```toml title="~/.codex/config.toml"
model = "my-gpt-alias"
model_provider = "litellm"
model_catalog_json = "/absolute/path/to/litellm-models.json"
```

复制的条目要保留 `base_instructions`。既没有 `base_instructions` 也没有 `model_messages.instructions_template` 的条目，Codex 会拒绝加载；解析错误以 `Error: failed to parse model_catalog_json path` 开头，并指出该模型缺少这两个字段。

这份文件会整体替换内置目录。实测中，Codex 对不在文件里的内部模型记录了回退警告，所以请保留内置条目并加入你的别名，确保 Codex 会用到的每个模型名都在文件里。

目录条目来自已安装的 Codex 版本，升级 Codex 后请重新生成该文件。[OpenAI 的网关指南](https://learn.chatgpt.com/docs/enterprise/connect-to-a-gateway)同样提到，自定义别名需要配套的目录元数据。

## MCP 设置

在同一个 `~/.codex/config.toml` 中，把 LiteLLM MCP 网关注册为 streamable HTTP 服务器。Codex 从环境变量而不是文件里读取 Bearer 令牌，所以直接复用你为模型提供商导出的那个变量即可：

```toml title="~/.codex/config.toml"
[mcp_servers.litellm]
url = "http://localhost:4000/my_mcp_server/mcp"
bearer_token_env_var = "LITELLM_API_KEY"
```

`my_mcp_server` 必须与网关配置中 `mcp_servers:` 下的某个键一致，且该密钥要有访问这个服务器的权限（参见[概览](./overview.md#处处复用的几个值)）。Codex 以 `Authorization: Bearer <key>` 的形式发送密钥，网关接受这种形式。启动 `codex` 并运行 `/mcp`：服务器会显示为 `connected` 并附上工具数量，`/mcp verbose` 会列出以服务器名为前缀的工具（如 `my_mcp_server-read_wiki_structure`）以及 `Auth: Bearer token`。

<Image img={require('../../../img/client_setup/codex_cli_mcp.png')} />

在服务器块里直接写 `bearer_token = "..."`，在当前版本的 Codex 上会报 `bearer_token is not supported for streamable_http`；请改用 `bearer_token_env_var`。如果服务器完全没有出现，说明你的 Codex 版本较旧：除非在 `[features]` 下设置 `experimental_use_rmcp_client = true`，否则它会忽略远程 MCP 服务器；更好的办法是升级 Codex。

如果 LiteLLM 服务器背后对接的是带 OAuth 的上游提供商，请运行 `codex mcp login litellm` 完成授权流程，而不是设置静态令牌；参见 [MCP OAuth](../../mcp_oauth.md)。

## 故障排查

连接被拒绝说明网关在所设的 `base_url` 上不可达；检查主机、端口和 `/v1` 后缀。网关返回 401 说明启动 `codex` 的 shell 里没有导出 `LITELLM_API_KEY`，或者密钥已失效。`Invalid model name passed in` 说明 `model` 与网关配置里的任何 `model_name` 都不匹配；应使用你自己的名称，而不是上游提供商的。如果请求始终不出现在管理界面里，说明你还在用默认提供商，请确认文件顶层设置了 `model_provider = "litellm"`。如果完成[第 4 步](#model-catalog-and-service-tiers)后 `/model` 选择器仍只显示 Codex 内置模型，可能是提供商块缺少 `model_catalog_url`、`api_key_model_discovery` 特性未开启，或者网关版本尚无 Codex 目录支持；带上密钥 `curl` 一下 `<LITELLM_PROXY_BASE_URL>/v1/models?client_version=0.159.3` 就能看出问题出在哪一侧，因为支持目录的网关会返回顶层 `models` 键而不是 `data`。

## 后续步骤

[ChatGPT Desktop 中的 Codex](./codex_chatgpt_desktop.md) 用的也是这份配置文件。另见 [LiteLLM 虚拟密钥](../virtual_keys.md)和 [MCP 网关参考](../../mcp.md)。
