---
title: "提供商"
---

大多数托管提供商支持以下一种或两种认证方式：

- 通过浏览器或基于 OAuth 的设备流程登录。
- 提供 API 密钥。

用 `/login [provider]` 查看某提供商支持的方式。Amazon Bedrock 和 Google Vertex AI 还可以使用隐式云凭据（ambient cloud credentials）。

## 交互式认证

运行 `/login` 并选择一个提供商。Pi 会引导你完成其 OAuth 或 API 密钥流程，并把得到的凭据保存在 [`auth.json`](configuration.md#%E6%99%BA%E8%83%BD%E4%BD%93%E7%9B%AE%E5%BD%95) 中。

在远程或无头（headless）机器上，OAuth 回调可能无法到达本地进程。出现提示时，把最终的重定向 URL 或授权码粘贴回 Pi。

运行 `/logout` 并选择一个提供商，即可移除其存储的凭据。这不会取消环境变量的设置，不会移除 `models.json` 中的认证信息，也不会在提供商处吊销该凭据。

`auth.json` 可能包含 API 密钥和 OAuth 令牌。请妥善保密，不要提交到版本库。

## 从环境变量使用 API 密钥

环境变量适用于 CI，以及任何不应让 Pi 存储密钥的场景。启动 Pi 之前设置变量：

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

下表列出只有一个主要 API 密钥变量的提供商。需要额外配置或支持隐式凭据的提供商见[提供商专属配置](#%E6%8F%90%E4%BE%9B%E5%95%86%E4%B8%93%E5%B1%9E%E9%85%8D%E7%BD%AE)。

| 提供商 | 环境变量 |
|---|---|
| Anthropic | `ANTHROPIC_API_KEY` |
| Ant Ling | `ANT_LING_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| NVIDIA NIM | `NVIDIA_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| GitHub Copilot | `COPILOT_GITHUB_TOKEN` |
| Mistral | `MISTRAL_API_KEY` |
| Groq | `GROQ_API_KEY` |
| Cerebras | `CEREBRAS_API_KEY` |
| xAI | `XAI_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| Vercel AI Gateway | `AI_GATEWAY_API_KEY` |
| ZAI Coding Plan（国际版） | `ZAI_API_KEY` |
| ZAI Coding Plan（中国版） | `ZAI_CODING_CN_API_KEY` |
| OpenCode Zen 与 Go | `OPENCODE_API_KEY` |
| Radius | `RADIUS_API_KEY` |
| TypeSafe（[分类模型](models.md#%E4%BD%BF%E7%94%A8%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B)） | `TYPESAFE_API_KEY` |
| Hugging Face | `HF_TOKEN` |
| Fireworks | `FIREWORKS_API_KEY` |
| Together AI | `TOGETHER_API_KEY` |
| Baseten | `BASETEN_API_KEY` |
| Kimi For Coding | `KIMI_API_KEY` |
| Meta | `META_API_KEY` |
| MiniMax | `MINIMAX_API_KEY` |
| MiniMax（中国版） | `MINIMAX_CN_API_KEY` |
| Moonshot AI（国际与中国） | `MOONSHOT_API_KEY` |
| Qwen Token Plan 与个人版 | `QWEN_TOKEN_PLAN_API_KEY` |
| Qwen Token Plan（中国版） | `QWEN_TOKEN_PLAN_CN_API_KEY` |
| Xiaomi MiMo | `XIAOMI_API_KEY` |
| Xiaomi MiMo Token Plan（中国版） | `XIAOMI_TOKEN_PLAN_CN_API_KEY` |
| Xiaomi MiMo Token Plan（阿姆斯特丹） | `XIAOMI_TOKEN_PLAN_AMS_API_KEY` |
| Xiaomi MiMo Token Plan（新加坡） | `XIAOMI_TOKEN_PLAN_SGP_API_KEY` |

Anthropic 还把 `ANTHROPIC_OAUTH_TOKEN` 识别为 API 凭据，把 `ANTHROPIC_AUTH_TOKEN` 识别为 bearer 认证。

未设置任何密钥或令牌时，若 `ANTHROPIC_FEDERATION_RULE_ID`、`ANTHROPIC_ORGANIZATION_ID` 和 `ANTHROPIC_IDENTITY_TOKEN_FILE` 均已设置，Anthropic 会使用工作负载身份联合（workload identity federation）：Anthropic SDK 用身份令牌换取短期访问令牌并自行刷新（会重新读取身份令牌文件，因此长时间会话请保持该文件有效）。`ANTHROPIC_SERVICE_ACCOUNT_ID` 和 `ANTHROPIC_WORKSPACE_ID` 在设置时原样传递。

## 从命令加载 API 密钥

要使用密钥管理器而不把解析出的密钥写盘，可以把 `auth.json` 中提供商的 `key` 设为以 `!` 前缀的命令：

```json
{
  "anthropic": {
    "type": "api_key",
    "key": "!security find-generic-password -ws 'anthropic'"
  }
}
```

Pi 在首次需要该密钥时运行命令，并为其标准输出缓存整个进程生命周期。输出为空、超时或非零退出都会让密钥保持未解析状态，直到 Pi 重启。

## 提供商专属配置

下列提供商需要额外的设置步骤、额外配置，或可以使用其平台提供的凭据。

存储的 API 密钥凭据可以包含一个 `env` 对象。对相应提供商而言，其值优先于进程环境：

```json
{
  "cloudflare-workers-ai": {
    "type": "api_key",
    "key": "...",
    "env": {
      "CLOUDFLARE_ACCOUNT_ID": "account-id"
    }
  }
}
```

### Radius

Radius 是 Pi 的打造者 Earendil Works 为 Pi 精心打造的服务。它提供可定制的 AI 网关，内置组织级管控与分析功能，还提供用于分享你用 Pi 创作成果的 artifacts。

开始使用：在 Pi 中运行 `/login radius`。这会把 Radius 添加为提供商，其模型会像其他提供商的模型一样出现在 `/model` 中。

Radius 还提供 MCP 服务器，Pi 可以为你管理 Radius。

Radius 目前处于早期 alpha 阶段，迭代迅速。详情参见[radius.earendil.com](https://radius.earendil.com)。

Radius 认证使用其网关目录，并缓存刷新后的模型元数据以供日后离线启动。在 `models.json` 中配置的自定义 Radius 网关使用自己的目录，而不是继承公开的 `radius.pi.dev` 目录。

### Azure OpenAI

提供商 ID 是 `azure`（曾用名 `azure-openai-responses`）。把它用作 `auth.json`、`models.json` 和 `settings.json` 中的键，以及模型引用（例如 `--model azure/gpt-5.4`）。

`azure` 提供商通过 Responses API 提供 OpenAI 模型，通过 Chat Completions 提供 Microsoft Foundry 模型，例如 `azure/deepseek-v4-pro`。

设置一个 API 密钥，外加基 URL 或资源名：

```bash
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_BASE_URL=https://your-resource.ai.azure.com
# 或者：
export AZURE_OPENAI_RESOURCE_NAME=your-resource
```

`ai.azure.com`、`cognitiveservices.azure.com` 和 `openai.azure.com` 下的资源根 URL 会被归一化为 OpenAI API 路径。

Pi 把模型 ID 作为部署名发送。如果部署名不同，用 `AZURE_OPENAI_DEPLOYMENT_NAME_MAP` 做映射：

```bash
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP=gpt-5.4=my-gpt-deployment,deepseek-v4-pro=my-deepseek
```

`AZURE_OPENAI_API_VERSION` 覆盖 OpenAI 模型的 API 版本（默认 `v1`）。

要使用 Pi 未内置的 Foundry 模型，在[`models.json`](models.md#%E9%85%8D%E7%BD%AE%E5%85%BC%E5%AE%B9%E7%AB%AF%E7%82%B9)的 `azure` 下添加它并带 `api: "openai-completions"`。自定义模型需要 `baseUrl`；设置 `AZURE_OPENAI_BASE_URL` 和 `AZURE_OPENAI_RESOURCE_NAME` 时它们优先于该值：

```json
{
  "providers": {
    "azure": {
      "baseUrl": "https://your-resource.services.ai.azure.com",
      "models": [
        { "id": "your-deployment", "api": "openai-completions" }
      ]
    }
  }
}
```

### Amazon Bedrock

Bedrock 可以使用 bearer 令牌或所处 AWS 环境的隐式凭据来源：

```bash
# 命名 profile
export AWS_PROFILE=your-profile

# IAM 密钥
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
# 临时凭据必需
export AWS_SESSION_TOKEN=...

# Bedrock bearer 令牌
export AWS_BEARER_TOKEN_BEDROCK=...

# 区域，profile 或 AWS SDK 配置未提供时需要
export AWS_REGION=us-west-2
# 也支持 AWS_DEFAULT_REGION
```

Pi 还通过标准的 `AWS_CONTAINER_CREDENTIALS_*` 和 `AWS_WEB_IDENTITY_TOKEN_FILE` 变量支持 ECS 任务凭据与 IRSA。

### Cloudflare AI Gateway

该网关需要令牌、账户 ID 和网关 ID：

```bash
export CLOUDFLARE_API_KEY=...
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_GATEWAY_ID=...
```

账户 ID 和网关 ID 可以来自进程环境，也可以来自 `auth.json` 中凭据的 `env` 对象。

`CLOUDFLARE_API_KEY` 用于向网关认证 Pi。上游访问可以使用 Cloudflare 统一计费、存储在网关中的凭据，或在 `models.json` 中为该提供商配置的 `Authorization` 头。

### Cloudflare Workers AI

Workers AI 需要令牌和账户 ID：

```bash
export CLOUDFLARE_API_KEY=...
export CLOUDFLARE_ACCOUNT_ID=...
```

账户 ID 也可以存储在凭据的 `env` 对象中。

### Google Vertex AI

使用 Google Cloud API 密钥：

```bash
export GOOGLE_CLOUD_API_KEY=...
```

要使用应用默认凭据（Application Default Credentials），配置项目和位置：

```bash
export GOOGLE_CLOUD_PROJECT=your-project
# 也支持 GCLOUD_PROJECT
export GOOGLE_CLOUD_LOCATION=us-central1
```

然后完成认证：

```bash
gcloud auth application-default login
```

改用服务账号密钥文件时，设置 `GOOGLE_APPLICATION_CREDENTIALS` 并同时给出项目与位置。
