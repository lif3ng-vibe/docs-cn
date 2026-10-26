# LiteLLM Proxy CLI

`lite` CLI 是一个命令行工具，用于管理 LiteLLM 代理服务器，并通过它运行编程智能体（coding agent）。它能管理模型、凭据、API 密钥、团队和用户，向代理发起对话补全和 HTTP 请求，迁移静态凭据加密，还能启动编程智能体（Claude Code、Codex、OpenCode），让它们的 LLM 流量全部经由代理路由。

| 功能                   | 你能做什么                                                  |
|------------------------|-----------------------------------------------------------|
| 编程智能体             | 通过代理运行 Claude Code、Codex 或 OpenCode                 |
| 模型管理               | 列出、添加、更新和删除模型                                  |
| 凭据管理               | 管理提供商凭据                                              |
| 密钥管理               | 生成、列出、删除和导入 API 密钥                             |
| 团队管理               | 列出所属团队和可加入的团队，并把你的密钥分配给某个团队        |
| 用户管理               | 创建、列出和删除用户                                        |
| 对话补全               | 运行对话补全                                                |
| HTTP 请求              | 向代理服务器发起自定义 HTTP 请求                            |
| 加密迁移               | 将静态凭据重新加密为 AES-256-GCM                            |

## 快速上手

1. **安装 CLI**

   `lite` 客户端是一个轻量的本地安装：它指向一个 LiteLLM 代理，并通过它运行你的编程智能体，完全不会引入代理服务器运行时。一行安装脚本只需要 `curl`；缺少 [uv](https://github.com/astral-sh/uv) 时会自动引导安装，并让 uv 为你准备一个兼容的 Python 版本：

   ```shell
   curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install-cli.sh | sh
   ```

   已经装好 uv，更想自己动手？直接安装该包：

   ```shell
   uv tool install 'litellm[cli]'
   ```

   以上任一方式都会给你 `lite` 命令。通过 `litellm[proxy]` 安装的代理服务器也自带它，但那个 extra 不包含 `keyring`，因此凭据会保存在文件里，而不是操作系统的钥匙串。先在终端里输入试试：

   ```shell
   lite
   ```

2. **设置环境变量**

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   export LITELLM_PROXY_API_KEY=sk-your-key
   ```

   *（替换为你的实际代理 URL 和 API 密钥）*

3. **发起第一个请求（列出模型）**

   ```bash
   lite models list
   ```

   如果 CLI 配置正确，你应该会看到可用模型列表或表格输出。

4. **故障排查**

   - 如果看到报错，请检查环境变量和代理服务器状态。

## 通过 CLI 认证

你可以用 CLI 完成对 LiteLLM 网关的认证。如果想让大量开发者自助访问 LiteLLM 网关，这个功能非常合适。

:::info

想深入了解，请参阅 [CLI 认证](./cli_sso)。

:::

### 前置条件

:::warning[Beta 功能 - 需要设置环境变量]

CLI SSO 认证目前处于 beta 阶段。你必须在**启动 LiteLLM 代理时**设置以下环境变量：

```bash
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

或者把它加进代理的启动命令：

```bash
EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

:::

### 步骤

1. **设置代理 URL**

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   ```

   *（替换为你的实际代理 URL）*

2. **登录**

   ```bash
   lite login
   ```

   这一步会打开浏览器窗口进行认证。如果你已把 LiteLLM 代理接入 SSO 提供商，就可以用 SSO 凭据登录。登录后即可用 CLI 向 LiteLLM 网关发起请求。

   如果想改用 OAuth 授权码加 PKCE 的方式通过系统浏览器登录，请运行 `lite login --pkce`。这种凭据会通过刷新令牌（refresh token）自动续期，`lite auth print-token` 可以把它交给 Claude Code、OpenCode 或任何 OpenAI 兼容客户端。参见[使用 PKCE 的浏览器登录](./cli_sso#使用-pkce-进行浏览器登录)

3. **验证认证**

   ```bash
   lite models list
   ```

   这会列出你能使用的所有模型。

## 通过代理运行编程智能体

启动编程智能体，让它所有 LLM 流量都经由你的 LiteLLM 代理路由。每个受支持的智能体都有专属命令，只需记住智能体的名字：

```bash
lite claude
lite codex
lite opencode
```

智能体名之后的内容会原样转发给智能体，它自己的参数照常生效：

```bash
lite claude --resume
lite codex exec "summarize the repo"
```

每条命令都会先解析你的 LiteLLM 密钥（本地没有存储且当前处于终端环境时通过 SSO 登录；否则读取 `LITELLM_PROXY_API_KEY` 或 `--api-key`），再向代理校验该密钥，让无效凭据立刻报错，而不是深入到智能体内部才失败；然后导出智能体读取的环境变量，最后把自身替换为智能体进程。

环境变量按智能体分别设置。Claude Code 拿到 `ANTHROPIC_BASE_URL`（代理根地址，它会在此基础上拼接 `/v1/messages`）和 `ANTHROPIC_AUTH_TOKEN`，同时清掉可能残留的 `ANTHROPIC_API_KEY`，确保代理令牌优先生效。Codex 和 OpenCode 拿到 `OPENAI_BASE_URL`（代理地址加 `/v1`）和 `OPENAI_API_KEY`。Codex 会忽略 `OPENAI_BASE_URL`，因此还会额外通过 `-c` 配置覆盖传入的自定义提供商把它指向代理（采用 HTTP/SSE Responses 传输，因为代理不支持 Responses 的 WebSocket 协议）。

`--skip-verify` 会跳过启动前的密钥校验，在离线或非标准认证场景下很有用。这个参数属于包装器本身，所以要放在智能体自己的参数之前：

```bash
lite claude --skip-verify --resume
```

要固定模型，可以传入智能体自己的模型参数（`lite claude --model my-proxy-model` 或 `lite codex -m my-proxy-model`），也可以导出智能体读取的环境变量（Claude Code 对应 `ANTHROPIC_MODEL` / `ANTHROPIC_SMALL_FAST_MODEL`）；你已经设置好的值，包装器不会改动。智能体请求的模型必须存在于代理上，因为请求会落到代理的 `/v1/messages`（Anthropic）或 `/v1/chat/completions` 与 `/v1/responses`（OpenAI）端点上。

### `lite login` 的凭据

`lite login` 签发的令牌是一种短期的会话级智能体凭据，不是受管的虚拟密钥（virtual key）。它的作用域限于你认证时所用的用户和团队，继承该用户与团队的模型和预算，并在代理上受到与同团队虚拟密钥完全相同的约束，包括防护栏（guardrails）、路由、日志与花费追踪。花费会记入共享的团队与用户预算，因此同时运行多个智能体（或多次登录）并不会让每个会话各自拥有独立预算；它们消耗的是同一份团队和用户额度，也没有单独的会话级上限。

这种凭据按设计就是短期的（默认 24 小时，可通过 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 配置）；重新运行 `lite login` 即可刷新，同时会重新读取你最新的团队和用户设置。它不会出现在密钥界面（Keys UI）中，也无法在会话中途轮换或吊销；`lite claude`、`lite codex` 和 `lite opencode` 在默认部署上都能使用它。如果你需要长期有效、可轮换、且能在密钥界面中看到的密钥，请在仪表板（dashboard）中创建专用虚拟密钥，然后通过 `--api-key` 或 `LITELLM_PROXY_API_KEY` 传入。

`lite login` 把凭据保存在操作系统钥匙串（macOS Keychain、Windows 凭据管理器或 Linux Secret Service）中，服务名为 `litellm-cli`，账户名为 `credential`。`~/.litellm/token.json` 里只存放非机密的那一半：网关 URL、你的用户 ID、邮箱和角色、认证头名称，以及登录时间戳。该文件以 `0600` 权限创建于 `0700` 权限的目录中。访问钥匙串需要 `keyring` 包，它随 `cli` extra 一起安装，所以想用钥匙串存储的话，请用 `pip install 'litellm[cli]'` 安装，而不是裸装 `pip install litellm` 或 `pip install 'litellm[proxy]'`。通过 `litellm.get_litellm_gateway_api_key()` 读回凭据的代码出于同样的原因也需要 `keyring`：没有它，即使 `lite login` 已经把凭据存入钥匙串，这个调用也看不到钥匙串条目，只会返回 `None`。

没有钥匙串的机器（比如无头 Linux 服务器）会把凭据保存在同一个仅所有者可读的文件里；缺少 `keyring` 的安装，以及把 `LITELLM_CLI_DISABLE_KEYRING` 设为 `1`、`true`、`yes` 或 `on`（彻底关闭钥匙串存储）的 shell 同样如此。无论凭据最终落在哪里，`lite login` 都会打印出它的存放位置。旧版 `lite` 以明文写入 `token.json` 的凭据仍然有效：下一条读取它的命令会把它移入钥匙串并从文件中清除。

`lite login --pkce` 签发的凭据还附带一个刷新令牌：CLI 会在下次使用时续期密钥，`lite auth print-token` 把当前密钥交给其他工具，`lite logout` 则会在代理上吊销刷新令牌。每把续期后的密钥和换取它的刷新令牌都会和之前一样存入钥匙串。参见[使用 PKCE 的浏览器登录](./cli_sso#使用-pkce-进行浏览器登录)

登录时认证到某个团队，或之后想把已存储的密钥转移到其他团队时，使用 `lite teams assign-key`（参见[团队管理](#团队管理)）。查看或清除已存储的凭据：

```bash
lite whoami             # 显示已认证的用户和令牌存在时长
lite auth print-token   # 打印当前密钥，必要时先续期 --pkce 凭据
lite logout             # 清除钥匙串条目和令牌文件，并吊销 --pkce 刷新令牌
```

`lite logout` 会同时清空这两处存储。当钥匙串拒绝释放条目，或无法访问以进行确认时，它会发出警告并告诉你该怎么处理，而不是假装登出成功。

## 主要命令

### 模型管理

- 在代理上列出、添加、更新、获取和删除模型。
- 示例：

  ```bash
  lite models list
  lite models add {{openai_large}} \
    --param api_key=sk-123 \
    --param max_tokens=2048
  lite models update <model-id> -p temperature=0.7
  lite models delete <model-id>
  ```

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/model%20management)

### 凭据管理

- 列出、创建、获取和删除 LLM 提供商的凭据。凭据名称不可更改，因此 `update` 只能设置或清除显示名称。
- 示例：

  ```bash
  lite credentials list
  lite credentials create azure-prod \
    --info='{"custom_llm_provider": "azure"}' \
    --values='{"api_key": "sk-123", "api_base": "https://prod.azure.openai.com"}' \
    --display-name="Azure (prod)"
  lite credentials update azure-prod --display-name="Azure EU (prod)"
  lite credentials update azure-prod --clear-display-name
  lite credentials get azure-cred
  lite credentials delete azure-cred
  ```

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/credential%20management)

### 密钥管理

- 列出、生成、删除和导入 API 密钥。要查询单个密钥，可用 `--key-alias` 或 `--key-hash` 过滤 `lite keys list` 的结果。
- 示例：

  ```bash
  lite keys list
  lite keys generate \
    --models={{openai_large}} \
    --spend=100 \
    --duration=24h \
    --key-alias=my-key
  lite keys list --key-alias my-key
  lite keys delete --keys sk-key1,sk-key2 --key-aliases alias1,alias2
  ```

  `lite keys import` 把密钥从另一个 LiteLLM 实例复制到当前实例。加上 `--dry-run` 可以只预览不写入，加上 `--created-since`（`YYYY-MM-DD` 或 `YYYY-MM-DD_HH:MM`）可按创建日期限制导入范围：

  ```bash
  lite keys import \
    --source-base-url https://old-proxy.example.com \
    --source-api-key sk-source-admin \
    --created-since 2026-01-01
  ```

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/key%20management)

### 用户管理

- 列出、创建、查看信息和删除用户。
- 示例：

  ```bash
  lite users list
  lite users create \
    --email=user@example.com \
    --role=internal_user \
    --alias="Alice" \
    --team=team1 \
    --max-budget=100.0
  lite users get --id <user-id>
  lite users delete <user-id>
  ```

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/Internal%20User%20management)

### 团队管理

- 列出你所属的团队和可加入的团队，并把当前的 CLI 密钥分配给某个团队。
- 示例：

  ```bash
  lite teams list
  lite teams available
  lite teams assign-key --team-id team123
  ```

  不带 `--team-id` 运行 `lite teams assign-key` 时，会交互式提示你选择一个团队。

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/team%20management)

### 对话补全

- 与代理服务器上的某个模型开启交互式流式对话。省略模型名则会交互式选择。
- 示例：

  ```bash
  lite chat {{openai_large}}
  lite chat {{openai_large}} --temperature 0.9 --system "You are a helpful coding assistant"
  ```

  [所用 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/chat%2Fcompletions)

### 通用 HTTP 请求

- 直接向代理服务器发起 HTTP 请求。
- 示例：

  ```bash
  lite http request \
    POST /chat/completions \
    --json '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "Hello"}]}'
  ```

  [全部 API（OpenAPI）](https://docs.litellm.ai/api-reference/#/)

### 加密迁移

- 把静态凭据重新加密为 AES-256-GCM（`v2:gcm:`）格式。这是管理员操作；需先用 `general_settings.encryption_algorithm: aes-256-gcm` 启动代理。迁移是幂等且可恢复的，中断后重新运行是安全的。
- 示例：

  ```bash
  lite encryption migrate --check    # 只读的残余扫描，不写入
  lite encryption migrate --dry-run  # 执行扫描但不写入更改
  lite encryption migrate            # 执行迁移
  ```

  `--check` 会报告还剩多少旧格式数据；残余数量为 `0` 表示已全部迁移到新格式。

## 环境变量

- `LITELLM_PROXY_URL`：代理服务器的基础 URL
- `LITELLM_PROXY_API_KEY`：用于认证的 API 密钥

## 示例

1. **列出所有模型**：

   ```bash
   lite models list
   ```

2. **添加新模型**：

   ```bash
   lite models add {{openai_large}} \
     --param api_key=sk-123 \
     --param max_tokens=2048
   ```

3. **创建凭据**：

   ```bash
   lite credentials create azure-prod \
     --info='{"custom_llm_provider": "azure"}' \
     --values='{"api_key": "sk-123", "api_base": "https://prod.azure.openai.com"}'
   ```

4. **生成 API 密钥**：

   ```bash
   lite keys generate \
     --models={{openai_large}} \
     --spend=100 \
     --duration=24h \
     --key-alias=my-key
   ```

5. **交互式对话**：

   ```bash
   lite chat {{openai_large}} \
     --system "You are a helpful coding assistant"
   ```

6. **自定义 HTTP 请求**：

   ```bash
   lite http request \
     POST /chat/completions \
     --json '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "Hello"}]}'
   ```

## 错误处理

CLI 会对以下情况显示错误信息：

- 服务器无法访问
- 认证失败
- 参数或 JSON 无效
- 模型或凭据不存在
- 其他任何操作失败

使用 `--debug` 参数可获得详细的调试输出。

完整的命令参考和高级用法请参阅 [CLI README](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/client/cli/README.md)。
