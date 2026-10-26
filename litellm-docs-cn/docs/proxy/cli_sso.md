# CLI 身份验证

使用 litellm CLI 向 LiteLLM 网关（Gateway）完成身份验证。非常适合需要让大量开发者自助获得 LiteLLM 网关访问权限的场景。


## 演示

<iframe width="840" height="500" src="https://www.loom.com/embed/87c5d243cde642ff942783024ff037e3" frameBorder="0" allowFullScreen></iframe>

## 用法

### 前提条件 - 以 Beta 标志启动 LiteLLM 代理

:::warning[Beta 功能 - 必需]

CLI SSO（单点登录）身份验证目前处于 beta 阶段。你必须**在启动 LiteLLM 代理时**设置这个环境变量：

```bash
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

也可以把它加进代理的启动命令：

```bash
EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

:::

### 配置

#### JWT 令牌有效期

默认情况下，CLI 身份验证令牌会在 **24 小时**后过期。你可以在启动 LiteLLM 代理时设置 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 环境变量来自定义这个过期时间：

```bash
# Set CLI JWT tokens to expire after 48 hours
export LITELLM_CLI_JWT_EXPIRATION_HOURS=48
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

或者用一条命令完成：

```bash
LITELLM_CLI_JWT_EXPIRATION_HOURS=48 EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

**示例**：
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=12`：令牌在 12 小时后过期
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=168`：令牌在 7 天（168 小时）后过期
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=720`：令牌在 30 天（720 小时）后过期

:::note[实验性 UI 会话]
启用 `EXPERIMENTAL_UI_LOGIN` 时，**浏览器 UI 登录**会话固定为 10 分钟过期（不可配置）。`LITELLM_UI_SESSION_DURATION` 只适用于非实验性流程。
:::

:::tip
你可以用以下命令查看当前令牌的已存在时长与过期状态：
```bash
lite whoami
```
:::

#### 预填验证码

默认情况下，`lite login` 最后打开的浏览器页面会要求你输入终端打印的验证码。要让 `lite login` 打开该页面时就已填好验证码（你只需确认并点击 Continue），请在代理上设置：

```yaml
general_settings:
  allow_cli_sso_verification_uri_complete: true
```

该开关默认关闭，因为手动输入验证码正是把浏览器页面与发起登录的终端绑定起来的环节。开启开关后，确认之前仍要核对预填的验证码与终端打印的是否一致。旧版 `lite` 无论开关状态如何都会在不带验证码的情况下打开页面，因此请一并升级 CLI。

如果该浏览器已登录你的 SSO 提供商，而你又想完全跳过验证码，可改用 `lite login --pkce`：只需点击一次 Approve，终端即打印 `Login successful!`。参见[使用 PKCE 进行浏览器登录](#使用-pkce-进行浏览器登录)。

#### 归因元数据（OIDC 声明）

把列入白名单的 OIDC 声明（claims）映射到 LiteLLM 用户的 `metadata` 中，并在 `/sso/cli/poll` 里以 `attribution_metadata` 的形式返回给 CLI。用它来获取稳定的归因字段（例如雇佣类型或成本中心），而无需在客户端解析庞大的组列表。

启动前在**代理**上设置：

```bash
export CLI_SSO_CLAIM_MAP="employment_type->acme_employment_type,org_info.department->department"
export GENERIC_USER_EXTRA_ATTRIBUTES="employment_type,org_info.department"
```

`CLI_SSO_CLAIM_MAP` 与 `LITELLM_CLI_SSO_CLAIM_MAP` 等价。格式为逗号分隔的 `source_claim->metadata_key` 对。目标键上可选的 `metadata.` 前缀会被剥掉；值存储在用户的 `metadata` JSON 列中。

| 部分 | 含义 |
|------|---------|
| `source_claim` | OIDC 声明路径（点号表示法），包括来自 `GENERIC_USER_EXTRA_ATTRIBUTES` 的字段 |
| `metadata_key` | LiteLLM 用户 `metadata` 下的键（支持用点号表示嵌套键） |

只有非机密的标量值（`string`、`int`、`float`、`bool`）会被持久化并返回。列表、对象，以及目标键中含有 `token`、`secret` 之类片段的值都会被丢弃。

SSO 完成后的轮询响应示例：

```json
{
  "status": "ready",
  "key": "eyJ...",
  "user_id": "user@company.com",
  "attribution_metadata": {
    "acme_employment_type": "full_time",
    "department": "Engineering"
  }
}
```

**无真实 IdP 的本地测试**：在 LiteLLM 仓库中运行 `python scripts/mock_oidc_server_for_cli_sso.py`，把 Generic SSO 的环境变量指向 `http://127.0.0.1:8765`，然后运行 `python scripts/test_cli_sso_claims_e2e.py`。

### 步骤

1. **安装 CLI**

   `lite` 客户端是一个装在笔记本电脑上的轻量工具：它指向一个 LiteLLM 代理并通过它运行你的编码 agent，本身不引入任何代理服务器运行时。一行安装命令只依赖 `curl`；缺失 uv 时它会引导安装 [uv](https://github.com/astral-sh/uv)，并由 uv 为你准备一个兼容的 Python：

   ```shell
   curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install-cli.sh | sh
   ```

   已经有 uv 并且更愿意自己动手？直接安装这个包：

   ```shell
   uv tool install 'litellm[cli]'
   ```

   以上任何一种方式都会提供 `lite` 命令。通过 `litellm[proxy]` 安装的代理服务器也自带它，但那个 extra 不包含 `keyring`，因此其凭据保存在文件里而不是操作系统钥匙串。先在终端里输入：

   ```shell
   lite
   ```

2. **设置环境变量**

   在本地机器上设置代理 URL：

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   ```

   *（替换为你的实际代理 URL）*

3. **登录**

   ```shell
   lite login
   ```

   该命令会打开一个浏览器窗口进行身份验证。如果你已把 LiteLLM 代理连接到 SSO 提供商，就应当能用你的 SSO 凭据登录。登录后，即可用 CLI 向 LiteLLM 网关发起请求。

   浏览器页面会要求输入终端打印的验证码。想跳过手动输入，可以让代理[预填验证码](#预填验证码)，或者在浏览器已保存你的 SSO 会话时改用 [`lite login --pkce`](#使用-pkce-进行浏览器登录)，它完全不需要验证码。

   凭据会存入操作系统钥匙串，`lite login` 会打印它的存放位置。在没有钥匙串的机器上，会退回到仅所有者可读写的 `~/.litellm/token.json`。细节与关闭钥匙串存储的方法参见[`lite login` 凭据](./management_cli.md#lite-login-的凭据)。

4. **发起一次测试请求查看模型**

   ```shell
   lite models list
   ```

   这会列出你可用的所有模型。

## 使用 PKCE 进行浏览器登录

`lite login --pkce` 通过系统浏览器、以 OAuth 2.0 授权码加 PKCE（S256）的方式为你登录。CLI 充当公共客户端：它向代理注册自身，监听操作系统分配的回环端口，从不持有客户端密钥。身份验证由代理登录页与你的 SSO 提供商完成，CLI 只拿到最终的凭据。

```shell
export LITELLM_PROXY_URL=https://litellm.example.com
lite login --pkce
```

```text
Opening browser to: https://litellm.example.com/authorize?response_type=code&client_id=llm_dcrc_...&redirect_uri=http%3A%2F%2F127.0.0.1%3A57485%2Fcallback&state=...&code_challenge=...&code_challenge_method=S256&resource=https%3A%2F%2Flitellm.example.com
Approve the sign-in in your browser. Waiting...

Login successful!
JWT Token: R46gzIdke6PgQZUiGctb...
Credential stored in your OS keychain.
You can now use the CLI without specifying --api-key
```

在浏览器中，如果你没有会话，代理登录页会先打开（代理已连接身份提供商时走 SSO，否则用用户名和密码）。登录后，浏览器会回到一个同意页。该页会显示 CLI 的回环地址（例如 `http://127.0.0.1:57485`）、你当前登录的用户，并让你选择请求归属的团队。属于团队的用户必须选一个，与 `lite login` 的规则相同。点击 Approve 后，浏览器显示 “Signed in to LiteLLM. You can close this window and return to the terminal.”，终端则打印 `Login successful!`。

经典的 `lite login` 流程与虚拟 API 密钥照常工作、不受影响。`--pkce` 需要代理提供 `/.well-known/litellm-cli-auth`；在较旧的代理上，该命令会停下来并给出相应提示。

### 存储的凭据

密钥与刷新令牌都存入操作系统钥匙串（`lite login` 存密钥的同一位置），其余记录写入 `~/.litellm/token.json`（权限 `0600`）。除了 `lite login` 写入的 `base_url`、`user_id`、`user_role` 字段之外，`--pkce` 记录还包含 `expires_at`、`client_id`、`token_endpoint`、`revocation_endpoint`、`resource` 和 `team_id`，这些字段本身都不能直接换来密钥。在没有可用钥匙串的机器上，密钥与刷新令牌会退回到同一个文件，`lite login` 也会明说；一旦如此，请把 `~/.litellm/token.json` 当作敏感信息对待，因为任何能读到它的人都能用刷新令牌换出一个可用密钥。用较早版本 `lite` 完成的 `--pkce` 登录会把刷新令牌留在文件里，直到下一次 `lite` 命令读取它并移入钥匙串。

密钥会在 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 之后过期（默认 24 小时，见 [JWT 令牌有效期](#jwt-令牌有效期)）。过期后无需重新登录：下一个需要密钥的 `lite` 命令会用刷新令牌续期并保存新的一对。每次续期都会轮换刷新令牌，已用过的刷新令牌会被拒绝。

### 从其他工具使用凭据

`lite auth print-token` 把当前密钥打印到 stdout，除此之外什么也不输出（诊断信息走 stderr）。密钥即将过期时它会先续期，因此调用它的工具总能拿到可用的密钥。

Claude Code 可以把它配置为自己的 [`apiKeyHelper`](https://code.claude.com/docs/en/settings)。`lite login --pkce --config-claude` 会把 `~/.claude/settings.json` 中的 `env.ANTHROPIC_BASE_URL` 设为代理地址、`env.ANTHROPIC_AUTH_TOKEN` 设为本次登录的密钥，其余设置保持原样。密钥过期后重新运行该命令即可。若想让 Claude Code 在每次刷新时调用 `lite auth print-token`，请按如下方式手动设置 `apiKeyHelper`：

```json title="~/.claude/settings.json"
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://litellm.example.com"
  },
  "apiKeyHelper": "/absolute/path/to/lite --base-url https://litellm.example.com auth print-token"
}
```

对于 OpenCode 或其他任何 OpenAI 兼容客户端，把客户端指向 `<proxy>/v1`，并通过环境变量传入密钥：

```shell
LITELLM_PROXY_KEY=$(lite auth print-token) opencode
```

```json title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM proxy",
      "options": {
        "baseURL": "https://litellm.example.com/v1",
        "apiKey": "{env:LITELLM_PROXY_KEY}"
      },
      "models": {
        "gpt-5.4-mini": { "name": "gpt-5.4-mini" }
      }
    }
  },
  "model": "litellm/gpt-5.4-mini"
}
```

用该密钥发出的请求会归因到你的用户和你选择的团队，因此会显示在日志页面你的名下，并消耗你的用户与团队预算。

### 登出

```shell
lite logout
```

`lite logout` 会把刷新令牌发送到代理的 `POST /revoke` 端点，然后清空两处存储：钥匙串条目与 `~/.litellm/token.json`。刷新令牌从那一刻起作废。密钥本身无法吊销；它会在 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 内自行过期。

重新登录（无论用 `lite login --pkce` 还是经典的 `lite login`）会对被替换的记录做同样的处理：先保存新凭据，再吊销上一次登录的刷新令牌，因此一旦你再次登录，旧副本 `token.json` 中的刷新令牌就无法续期。如果吊销时无法连接代理，登录仍会成功并明说这一点。

管理员无法从仪表板吊销 `--pkce` 登录；只有持有者的 `lite logout` 能截断刷新令牌。每次续期都会在代理上重新读取该用户，因此停用该用户或把他移出团队会让下一次续期失败，密钥会在 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 内耗尽。续期被拒绝时，`lite auth print-token` 以及其他所有 `lite` 命令都会把代理给出的原因打印到 stderr；密钥耗尽后，它们会提示你重新运行 `lite login --pkce`。

### 多个 worker 或副本

配置了 Redis 时（无论是带 Redis `cache_params` 的 `litellm_settings.cache`，还是 `general_settings.coordination_redis`），刷新令牌的单次使用、重放检测和 `POST /revoke` 都通过代理的 Redis 缓存来执行，并且在 Redis 不可达时采取“失败即拒绝”策略：此时到达的刷新或 `POST /revoke` 请求会得到 `503 temporarily_unavailable`，CLI 保留已有密钥并在下一条命令时重试；`lite logout` 会保留你的登录记录、以退出码 1 结束，并请你稍后重试，刷新令牌因此仍会被吊销。没有 Redis 时，每个 worker 各自维护记录，因此在多 worker 或多副本的代理上，某个已吊销或已用过的刷新令牌仍可能被从未见过它的 worker 接受。请运行单个 worker 或配置 Redis。

## 原生客户端契约

任何语言编写的 CLI 都可以凭一份发现文档（discovery document）完成同样的登录，无需阅读 LiteLLM 源码。典型场景是一个 Go 启动器：先为用户完成登录，再带着密钥启动 OpenCode。这份契约是带版本的：在信任文档其余部分之前，先检查 `contract_version`。新增字段不会提升版本；只有字段含义改变或字段被移除时才会。

### 发现文档

```shell
curl https://litellm.example.com/.well-known/litellm-cli-auth
```

```json
{
  "contract_version": 1,
  "issuer": "https://litellm.example.com",
  "authorization_endpoint": "https://litellm.example.com/authorize",
  "token_endpoint": "https://litellm.example.com/token",
  "registration_endpoint": "https://litellm.example.com/register",
  "revocation_endpoint": "https://litellm.example.com/revoke",
  "resource": "https://litellm.example.com",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none"],
  "revocation_endpoint_auth_methods_supported": ["none"]
}
```

`resource` 是代理的 origin。请在 authorize 与 token 请求中把它作为 RFC 8707 的 `resource` 参数发送。正是这个参数表明请求的是代理 API 凭据而非 MCP 会话；缺少它时，同样的 authorize 请求会走 MCP 连接路径，其签出的令牌在 `/v1/*` 上会被拒绝。

这些 URL 由请求的 base URL 构造。如果代理位于负载均衡器或反向代理之后，请在代理上把 `PROXY_BASE_URL` 设为它的公网 origin，让 `issuer`、各端点与 `resource` 指向用户实际访问的地址。`lite login --pkce` 会按 [RFC 8414 第 3.3 节](https://www.rfc-editor.org/rfc/rfc8414#section-3.3)的要求检查这一点：当 `issuer` 与用户输入的 `--base-url` 不一致时，命令会停下来，提示应作为 `--base-url` 传入的 issuer，两者必须一致。

### 步骤

1. 获取上面的发现文档，检查 `contract_version` 是否为 `1`，以及 `code_challenge_methods_supported` 是否包含 `S256`。在向各端点发送任何请求前，还要检查 `issuer` 是否与你获取文档的地址一致（协议、主机、端口和路径都相同，忽略大小写与末尾斜杠），以及每个端点和 `resource` 是否都在同一 origin 上。请求注册、token 与吊销端点时不要跟随重定向：否则一个 `307` 或 `308` 会把授权码与验证器、或刷新令牌重放到 `Location` 指向的任何地方。

2. 注册一个公共客户端。在 `127.0.0.1` 上由操作系统分配的端口启动监听，并把该地址注册为重定向 URI。保存返回的 `client_id`；没有密钥。

   ```shell
   curl -X POST https://litellm.example.com/register \
     -H 'content-type: application/json' \
     -d '{
       "client_name": "my-cli",
       "redirect_uris": ["http://127.0.0.1:53187/callback"],
       "token_endpoint_auth_method": "none",
       "grant_types": ["authorization_code", "refresh_token"],
       "response_types": ["code"]
     }'
   ```

   ```json
   {
     "client_id": "llm_dcrc_lq411b6QkPmfxjW...",
     "token_endpoint_auth_method": "none",
     "redirect_uris": ["http://127.0.0.1:53187/callback"]
   }
   ```

3. 生成 PKCE 码验证器（code verifier，43 到 128 个字符）及其 S256 码挑战（code challenge），外加一个随机 `state`，然后在系统浏览器中打开授权端点。

   ```text
   https://litellm.example.com/authorize
     ?response_type=code
     &client_id=llm_dcrc_lq411b6QkPmfxjW...
     &redirect_uri=http://127.0.0.1:53187/callback
     &state=<random>
     &code_challenge=<S256 challenge>
     &code_challenge_method=S256
     &resource=https://litellm.example.com
   ```

   没有代理会话时，浏览器会先被送往登录页，之后再回到这个 URL。已有会话时，同意页会立即渲染。用户选择团队并点击 Approve。

4. 在回环监听上接收授权码。浏览器会落在 `http://127.0.0.1:53187/callback?code=<code>&state=<state>`。使用授权码之前，先核对 `state` 与你发送的是否一致。如果用户点击了 Deny，回调携带的是 `error` 和 `error_description`，而不是 `code`。

5. 用授权码换取凭据。请求为表单编码，没有客户端密钥；`code_verifier` 证明客户端正是发起该流程的一方。

   ```shell
   curl -X POST https://litellm.example.com/token \
     -d grant_type=authorization_code \
     -d code=<code> \
     -d redirect_uri=http://127.0.0.1:53187/callback \
     -d client_id=llm_dcrc_lq411b6QkPmfxjW... \
     -d code_verifier=<verifier> \
     -d resource=https://litellm.example.com
   ```

   ```json
   {
     "access_token": "LneZuxEFqvemEwK6lRzgg6BN...",
     "token_type": "Bearer",
     "expires_in": 86400,
     "refresh_token": "llm_srefresh_eyJhbGciOiJ...",
     "user_id": "user@example.com",
     "team_id": "a0a759e9-6234-4c75-bbad-b535f6c9e80e"
   }
   ```

   授权码单次有效。重复发送会返回 `400` 以及 `{"error": "invalid_grant", "error_description": "the authorization code was already used"}`。

6. 把 `access_token` 用作 Bearer 令牌，访问代理的 LLM 路由：`/v1/chat/completions`、`/v1/responses`、`/v1/messages`、`/v1/models` 等。花费会归因到令牌响应中的用户与团队。

   ```shell
   curl https://litellm.example.com/v1/chat/completions \
     -H "Authorization: Bearer LneZuxEFqvemEwK6lRzgg6BN..." \
     -H 'content-type: application/json' \
     -d '{"model": "gpt-5.4-mini", "messages": [{"role": "user", "content": "Say hi in three words."}]}'
   ```

7. 在 `expires_in` 耗尽之前续期凭据。响应结构与第 5 步相同，并携带新的刷新令牌。旧刷新令牌若再次使用会被 `400 invalid_grant` 拒绝，因此请先保存新的一对，再使用新的访问令牌。

   ```shell
   curl -X POST https://litellm.example.com/token \
     -d grant_type=refresh_token \
     -d refresh_token=llm_srefresh_eyJhbGciOiJ... \
     -d client_id=llm_dcrc_lq411b6QkPmfxjW... \
     -d resource=https://litellm.example.com
   ```

8. 登出时吊销刷新令牌（[RFC 7009](https://www.rfc-editor.org/rfc/rfc7009)），并在用户重新登录后吊销被替换凭据的刷新令牌。只有刷新令牌可被吊销；访问令牌会自行过期。即使面对它已不认识的令牌，该端点也会返回 `200` 与 `{}`，因此可以安全地多次调用。

   ```shell
   curl -X POST https://litellm.example.com/revoke \
     -d token=llm_srefresh_eyJhbGciOiJ... \
     -d client_id=llm_dcrc_lq411b6QkPmfxjW...
   ```

### 安全规则

原生代理 API 授权的重定向地址限于回环地址（`127.0.0.1`、`::1` 或 `localhost`）。托管 HTTPS 回调需要单独的[托管应用授权](#托管应用登录)，并由运营方精确列入白名单；仅凭客户端注册并不会获得授权。授权码单次有效，并绑定到客户端与 PKCE 验证器。`lite` 从不跟随来自注册、token 或吊销端点的重定向；收到 `3xx` 响应命令即停止，并给出指向地址的提示，因此授权码与验证器、或刷新令牌只会到达发现文档通过核对的那个 origin。同意页以 `Cache-Control: no-store` 与 `Content-Security-Policy: frame-ancestors 'none'` 提供，无法被嵌入其他页面。服务器绝不会替用户选团队：团队来自同意页，每次 token 交换与刷新时都会重新校验成员资格；在用户仍有可选团队时，提交不带团队的授权会被拒绝，返回 `400 invalid_grant`，描述为 `this user belongs to a team; sign in again and pick the team for this credential`。

设备授权流程（device authorization grant）、嵌入式浏览器以及资源所有者密码凭据流程（resource owner password credentials grant）均不受支持。


## 托管应用登录

托管应用可以通过同样的授权码加 S256 PKCE 流程，复用网关已配置的 Google、Okta 或其他 SSO 提供商。为应用配置网关 URL，并在网关上注册其精确的 HTTPS 回调。请使用这样的网关版本：其 `/.well-known/litellm-cli-auth` 发现文档声明了所需的托管 scope。

| 请求的 scope | 网关回调设置 | 访问权限 |
| --- | --- | --- |
| `proxy:read` | `LITELLM_PROXY_API_OAUTH_REDIRECT_URIS` | 在用户当前权限范围内查看模型列表与聚合用量报表 |
| `proxy:admin` | `LITELLM_PROXY_API_OAUTH_ADMIN_REDIRECT_URIS` | 既有管理员操作与模型调用，受当前 `proxy_admin` 权限与网关限制约束 |

对管理员应用，在网关上设置：

```shell
export LITELLM_PROXY_API_OAUTH_ADMIN_REDIRECT_URIS=https://admin.example.com/oauth/callback
```

两个设置都接受逗号分隔的精确 HTTPS URI。通配符、查询字符串与片段都会被拒绝。管理员回调可以请求任一 scope；报表类回调不能请求管理员权限。省略 `scope` 即请求 `proxy:read`。注册回调绝不会提升用户权限，也不会跳过其同意环节。

发现文档保留 `contract_version: 1` 并新增 `hosted_app`。其 `scopes_supported` 列出当前启用的托管 scope，`access_token_ttl` 为 300 秒，`refresh_token_ttl` 为 86400 秒。客户端检查这些能力，针对所配置的网关校验 `issuer` 与 `resource`，并使用发现到的注册、授权、token 与吊销端点。授权时发送 `resource=<gateway origin>` 与所选 `scope`。托管令牌包含 `scope`、`user_id`、`access_token`、`refresh_token`、`expires_in` 和 `refresh_expires_in`。

托管授权需要数据库与共享 Redis。网关会在使用时检查当前用户、所选团队、回调可信度，以及适用的模型、预算与速率限制。自定义认证与独占外部认证模式不会签发托管授权。管理员一旦失去 `proxy_admin` 角色，即失去托管管理员访问权。

访问令牌在五分钟内过期。刷新令牌会轮换，且不能把同意期延长到 24 小时之外；复用已用过的刷新令牌会吊销整个授权。一次成功的刷新会为进行中的工作保留尚未过期的访问令牌。在发现到的吊销端点吊销访问令牌或刷新令牌，会让整个授权在所有网关 worker 上失效。

客户端应对刷新令牌做静态加密，把它们绑定到网关与用户，对续期做串行化，并在发送前持久化续期尝试。续期结果不确定时，应当要求重新登录，而不是重放刷新令牌或执行管理员操作。断开连接会立即移除本地访问，并在网关暂时不可用时重试网关侧吊销。

升级标准网关部署时，请保留网关 URL、回调配置、签名配置与共享 Redis 状态。应用从这个 URL 发现协议能力；它不依赖单独的后端镜像 pin。
