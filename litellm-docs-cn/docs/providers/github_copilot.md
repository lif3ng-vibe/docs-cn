import Image from '@theme/IdealImage';
import ThemedVideo from '@site/src/components/ThemedVideo';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GitHub Copilot

通过 LiteLLM 网关或 Python SDK 使用 [GitHub Copilot](https://docs.github.com/en/copilot) 的模型。LiteLLM 支持对话补全（Chat Completions）、Responses、嵌入（Embeddings）与 Anthropic Messages 接口。

在网关上，每位用户各自连接自己的 GitHub 账号，请求消耗的也是各自的 Copilot 套餐。你能用哪些模型由 GitHub Copilot 套餐决定，且每个模型只支持特定端点。参见[支持的端点与模型](#支持的端点与模型)。

## 设置网关

管理员只需一次性添加模型和一份 **Per-user GitHub OAuth** 凭证。之后每位用户在发请求前，先从仪表板连接自己的 GitHub 账号。

### 1. 管理员：创建凭证

在 LiteLLM 仪表板中打开 **Models + Endpoints** > **LLM Credentials**，点击 **Add Credential**。提供商选择 **GitHub Copilot**，**Credential Name** 填 `github-copilot`。**Auth Type** 会设为 **Per-user GitHub OAuth**，这是网关对 GitHub Copilot 支持的唯一认证类型。最后点击 **Add Credential**。

<div className="docs-screenshot">
  <Image img={require('../../img/github_copilot_credential.png')} dark={require('../../img/github_copilot_credential_dark.png')} alt="在 LiteLLM 中创建每用户 GitHub OAuth 凭证" width={656} height={585} />
</div>

### 2. 管理员：添加模型

打开 **Add Model**，提供商选择 **GitHub Copilot**，在 **LiteLLM Model Name(s)** 下挑选一个模型，例如 `github_copilot/claude-sonnet-5.5`。在 **Model Mappings** 下，把 **Public Model Name** 设为用户请求时使用的名称，比如 `claude-copilot`。在 **Existing Credentials** 下选择 `github-copilot`，然后点击 **Add Model**。

<div className="docs-screenshot">
  <Image img={require('../../img/github_copilot_add_model.png')} dark={require('../../img/github_copilot_add_model_dark.png')} alt="在 LiteLLM 中用已保存的凭证添加 GitHub Copilot 模型" width={1096} height={935} />
</div>

:::note

Claude Code 和 Claude Desktop 只接受以 `claude-` 或 `anth-` 开头的模型名称，因此要从这两个应用里使用模型，请给它取 `claude-copilot` 这类公开名称。其他应用可以用任意名称。

:::

<details>
<summary>用 config.yaml 添加模型</summary>

如果你用 `config.yaml` 管理模型，可以先在仪表板中创建凭证，再让模型引用它：

```yaml showLineNumbers keep-model-ids title="config.yaml"
model_list:
  - model_name: claude-copilot
    litellm_params:
      model: github_copilot/claude-sonnet-5.5
      litellm_credential_name: github-copilot
```

</details>

### 3. 用户：连接 GitHub 账号

登录 LiteLLM 仪表板，打开 **Models + Endpoints** > **LLM Credentials**。在 **Your connections** 下找到 `github-copilot`，点击 **Connect**。

<div className="docs-screenshot">
  <Image img={require('../../img/github_copilot_llm_credentials.png')} dark={require('../../img/github_copilot_llm_credentials_dark.png')} alt="在 LiteLLM 的 Your connections 中连接 GitHub 账号" width={1096} height={418} />
</div>

LiteLLM 会显示一个 GitHub 验证码。打开 https://github.com/login/device，输入验证码，并用持有你 Copilot 套餐的 GitHub 账号批准这次请求。

<div className="docs-screenshot">
  <Image img={require('../../img/github_copilot_connect.png')} dark={require('../../img/github_copilot_connect_dark.png')} alt="LiteLLM 中的 GitHub 验证码与登录链接" width={504} height={338} />
</div>

GitHub 批准后，状态会变为 **Connected**，并显示你的 GitHub 用户名。此后你向该凭证下的模型发送的每个请求，用的都是你自己的 Copilot 权限。如果你尚未连接，或者 GitHub 日后拒绝了你保存的连接，请求会返回 401，提示你回到本页重新连接。

下面的录屏在仪表板里完整走了一遍第 1 到第 3 步，从创建凭证到拿到 GitHub 验证码。

<ThemedVideo
  src={require('../../img/github_copilot_setup_flow.mp4')}
  dark={require('../../img/github_copilot_setup_flow_dark.mp4')}
  poster={require('../../img/github_copilot_setup_flow_poster.png')}
  darkPoster={require('../../img/github_copilot_setup_flow_poster_dark.png')}
  title="操作演示：创建 GitHub Copilot 凭证、添加模型、连接 GitHub 账号"
/>

### 4. 用户：发送请求

把你的应用指向网关，并按组织配置的方式登录。请求必须来自连接了 GitHub 的那个 LiteLLM 用户。对于 Claude Code，把 `ANTHROPIC_BASE_URL` 设为网关地址，`ANTHROPIC_MODEL` 设为 `claude-copilot`。对于使用 OpenAI API 的应用，把 base URL 设为 `https://litellm.example.com/v1`（替换成你的网关地址），模型设为 `claude-copilot`。

```python showLineNumbers title="发送对话请求"
from openai import OpenAI

client = OpenAI(
    base_url="https://litellm.example.com/v1",
    api_key="<your LiteLLM sign-in token>",
)

response = client.chat.completions.create(
    model="claude-copilot",
    messages=[{"role": "user", "content": "Write a Python hello world"}],
)
print(response.choices[0].message.content)
```

## 支持的端点与模型

配置模型时使用 `github_copilot/` 前缀。发往网关的请求使用公开模型名称。

| 端点 | 示例模型 |
|-------|-------|
| `/v1/chat/completions` | `github_copilot/claude-sonnet-5.5` |
| `/v1/messages` | `github_copilot/claude-sonnet-5.5` |
| `/v1/responses` | `github_copilot/gpt-5.3-codex` 或 `github_copilot/gpt-5.5` |
| `/v1/embeddings` | `github_copilot/text-embedding-3-small` |

这些示例与 LiteLLM 的模型目录一致。每个账号能用哪些模型由 GitHub 决定，因此即使网关已配置某个模型，只要它不在你的套餐内，GitHub 也会返回错误。

要提供 Responses 或嵌入能力，需要用同一份 `github-copilot` 凭证为对应端点再添加一个模型，例如 `github_copilot/gpt-5.3-codex` 或 `github_copilot/text-embedding-3-small`。

## 通过 LiteLLM Python SDK 使用

直接调用 SDK 在你自己的进程中运行，不经过网关，并使用单个 GitHub 账号登录。首次调用会在你的终端里发起 GitHub 的设备授权流程。LiteLLM 把 GitHub 访问令牌保存到 `~/.config/litellm/github_copilot/access-token`，后续调用直接复用。网关绝不会使用这种登录方式。直接调用 SDK 时要写完整模型名，包括 `github_copilot/` 前缀。

<Tabs>
<TabItem value="chat" label="对话补全">

```python showLineNumbers keep-model-ids title="对话补全"
from litellm import completion

response = completion(
    model="github_copilot/claude-sonnet-5.5",
    messages=[{"role": "user", "content": "Write a Python hello world"}],
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="streaming" label="流式">

```python showLineNumbers keep-model-ids title="流式接收对话响应"
from litellm import completion

stream = completion(
    model="github_copilot/claude-sonnet-5.5",
    messages=[{"role": "user", "content": "Write a Python hello world"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
<TabItem value="responses" label="Responses">

```python showLineNumbers keep-model-ids title="Responses"
import asyncio

import litellm


async def main():
    response = await litellm.aresponses(
        model="github_copilot/gpt-5.3-codex",
        input="Write a Python hello world",
        max_output_tokens=500,
    )
    print(response)


asyncio.run(main())
```

</TabItem>
<TabItem value="messages" label="Anthropic Messages">

```python showLineNumbers keep-model-ids title="Anthropic Messages"
import asyncio

import litellm


async def main():
    response = await litellm.anthropic.messages.acreate(
        model="github_copilot/claude-sonnet-5.5",
        messages=[{"role": "user", "content": "Write a Python hello world"}],
        max_tokens=500,
    )
    print(response)


asyncio.run(main())
```

</TabItem>
<TabItem value="embeddings" label="嵌入">

```python showLineNumbers title="嵌入"
import litellm

response = litellm.embedding(
    model="github_copilot/text-embedding-3-small",
    input=["good morning from LiteLLM"],
)
print(response)
```

</TabItem>
</Tabs>

## 环境变量

令牌文件相关的设置和 `GITHUB_COPILOT_API_BASE` 只对直接调用 Python SDK 生效，网关会忽略它们。`GITHUB_COPILOT_TOKEN_DIR` 请使用绝对路径。

| 变量 | 默认值 | 用途 |
|-------|-------|-------|
| `GITHUB_COPILOT_TOKEN_DIR` | `~/.config/litellm/github_copilot` | 仅 SDK。存放 GitHub 访问令牌与 Copilot API 令牌缓存的目录 |
| `GITHUB_COPILOT_ACCESS_TOKEN_FILE` | `access-token` | 仅 SDK。令牌目录中访问令牌文件的名称 |
| `GITHUB_COPILOT_API_KEY_FILE` | `api-key.json` | 仅 SDK。令牌目录中 Copilot API 令牌缓存文件的名称 |
| `GITHUB_COPILOT_CLIENT_ID` | `Iv1.b507a08c87ecfe98` | 网关与 SDK 登录共用的 OAuth 客户端 ID |
| `GITHUB_COPILOT_DEVICE_CODE_URL` | `https://github.com/login/device/code` | 网关与 SDK 登录用的设备码端点 |
| `GITHUB_COPILOT_ACCESS_TOKEN_URL` | `https://github.com/login/oauth/access_token` | 网关与 SDK 登录用的访问令牌端点 |
| `GITHUB_COPILOT_API_KEY_URL` | `https://api.github.com/copilot_internal/v2/token` | 把 GitHub 令牌兑换成 Copilot API 令牌的端点 |
| `GITHUB_COPILOT_API_BASE` | `https://api.githubcopilot.com` | 仅 SDK。对话补全、Responses 与嵌入的后备 API 基础地址 |

## 认证细节

<details>
<summary>令牌存储与缓存</summary>

在网关上，LiteLLM 会加密每个用户的 GitHub 访问令牌并存入数据库，但不保存刷新令牌（refresh token）。断开连接会删除已存储的连接记录。

有 Redis 时，LiteLLM 会把加密后的凭证（或“未连接”记录）缓存 60 秒；没有 Redis 时，请求直接读取数据库。

每个 worker 会把短效的 Copilot 令牌缓存在内存中，直到过期前 60 秒为止。如果在令牌兑换过程中 GitHub 返回 401、403 或 404，LiteLLM 会清除缓存的会话，并要求用户重新连接。

直接调用 SDK 时，会从磁盘读取 GitHub 访问令牌并兑换成 Copilot API 令牌，后者缓存在 `api-key.json` 中直到过期。

</details>

<details>
<summary>API 基础地址</summary>

在网关上，如果 GitHub 令牌响应中的 API 主机走 HTTPS，且主机为 `githubcopilot.com` 或其子域名，LiteLLM 就使用它；否则使用 `https://api.githubcopilot.com`。网关不使用 `GITHUB_COPILOT_API_BASE`。

直接调用 SDK 的对话补全、Responses 与嵌入时，LiteLLM 按顺序检查这些值：凭证或部署的 `api_base`、令牌响应中的 `endpoints.api`、`GITHUB_COPILOT_API_BASE`，最后是 `https://api.githubcopilot.com`。

Anthropic Messages 使用已认证的 Copilot 端点，并忽略调用方传入的 `api_base` 和 `GITHUB_COPILOT_API_BASE`。

</details>

<details>
<summary>请求头</summary>

对于对话补全、Responses 和嵌入，LiteLLM 会添加以下请求头：

| 请求头 | 默认值 |
|-------|-------|
| `Authorization` | 来自已认证 Copilot 会话的 Bearer 令牌 |
| `content-type` | `application/json` |
| `copilot-integration-id` | `vscode-chat` |
| `editor-version` | `vscode/1.95.0` |
| `editor-plugin-version` | `copilot-chat/0.26.7` |
| `user-agent` | `GitHubCopilotChat/0.26.7` |
| `openai-intent` | `conversation-panel` |
| `x-github-api-version` | `2025-04-01` |
| `x-request-id` | 每个请求一个新的 UUID |
| `x-vscode-user-agent-library-version` | `electron-fetch` |

可以传入 `extra_headers`，让自定义请求头与这些默认值合并。在网关上，`Authorization` 始终使用已连接用户的 Copilot 令牌。

对话补全和 Responses 会根据消息角色把 `X-Initiator` 设为 `user` 或 `agent`；当请求包含图片时，还会附加一个取值为 `true` 的视觉请求头。

Anthropic Messages 会设置 `openai-intent: messages-proxy`、`x-interaction-type: messages-proxy` 和 `x-github-api-version: 2026-06-01`；如果请求未提供 `anthropic-version`，则设为 `2023-06-01`。

</details>
