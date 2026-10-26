import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OIDC - 基于 JWT 的认证

用 JWT 让管理员 / 用户 / 项目登录代理。

<EnterpriseFeature feature="JWT-based Auth" />

:::tip[JWT → 虚拟密钥映射]

想要按用户限制可用模型、设定花费上限与速率限制，又不想分发 API 密钥？参见 **[JWT → 虚拟密钥映射](./jwt_key_mapping.md)**，为通过 JWT 认证的用户（如 Claude Code + SSO）提供细粒度访问控制。

:::

## 用法

### 第 1 步：配置代理

- `JWT_PUBLIC_KEY_URL`：你的 OpenID 提供商的公钥端点。通常是 `{openid-provider-base-url}/.well-known/openid-configuration/jwks`；对 Keycloak 则是 `{keycloak_base_url}/realms/{your-realm}/protocol/openid-connect/certs`。
- `JWT_AUDIENCE`：解码 JWT 时使用的受众（audience）。若不设置，解码阶段不会校验受众。

```bash
export JWT_PUBLIC_KEY_URL="" # "https://demo.duendesoftware.com/.well-known/openid-configuration/jwks"
```

- 在配置中设置 `enable_jwt_auth`。这会让代理检查令牌是否为 JWT 令牌。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True

model_list:
- model_name: azure-gpt-3.5 
  litellm_params:
      model: azure/<your-deployment-name>
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

### 第 2 步：创建带作用域的 JWT

<Tabs>
<TabItem value="admin" label="管理员">

在你的 OpenID 提供商（例如 Keycloak）中创建一个名为 `litellm_proxy_admin` 的客户端作用域（client scope）。

为用户签发 JWT 时授予 `litellm_proxy_admin` 作用域。

```bash
curl --location ' 'https://demo.duendesoftware.com/connect/token'' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={CLIENT_ID}' \
--data-urlencode 'client_secret={CLIENT_SECRET}' \
--data-urlencode 'username=test-{USERNAME}' \
--data-urlencode 'password={USER_PASSWORD}' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=litellm_proxy_admin' # 👈 grant this scope
```
</TabItem>
<TabItem value="project" label="项目">

在你的 OpenID 提供商（例如 Keycloak）上为项目创建 JWT。

```bash
# client_id: 👈 project id
curl --location ' 'https://demo.duendesoftware.com/connect/token'' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={CLIENT_ID}' \
--data-urlencode 'client_secret={CLIENT_SECRET}' \
--data-urlencode 'grant_type=client_credential' \
```

</TabItem>
</Tabs>

### 第 3 步：测试你的 JWT

<Tabs>
<TabItem value="key" label="/key/generate">

```bash
curl --location '{proxy_base_url}/key/generate' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiI...' \
--header 'Content-Type: application/json' \
--data '{}'
```
</TabItem>
<TabItem value="llm_call" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1...' \
--data '{"model": "azure-gpt-3.5", "messages": [ { "role": "user", "content": "What's the weather like in Boston today?" } ]}'
```

</TabItem>
</Tabs>

## 进阶

### 多个 OIDC 提供商

如果你想让 LiteLLM 向多个 OIDC 提供商（例如 Google Cloud、GitHub Auth）校验 JWT，就用这个功能。

把环境变量 `JWT_PUBLIC_KEY_URL` 设置为逗号分隔的 URL 列表，对应你的各个 OIDC 提供商。每一项可以是 JWKS URL，也可以是 OIDC 发现 URL（`.../.well-known/openid-configuration`）；LiteLLM 会拉取发现文档并跟随其中的 `jwks_uri`

```bash
export JWT_PUBLIC_KEY_URL="https://demo.duendesoftware.com/.well-known/openid-configuration,https://accounts.google.com/.well-known/openid-configuration"
```

所有列出的提供商的令牌都会用同一套共享的声明映射（claim mapping）来校验。如果各提供商对同一声明的含义不一致，请改用按 issuer 区分的声明映射。

#### 令牌如何被校验

LiteLLM 从未校验的 JWT 头部读取 `kid`，按顺序遍历 `JWT_PUBLIC_KEY_URL` 列表：对每个 URL 加载对应提供商的密钥集，寻找 `kid` 与令牌一致的密钥。命中第一个匹配即停止查找；如果列表中没有任何提供商发布该 `kid`，请求会被 401 拒绝（`No matching public key found`）。在这条路径上选择密钥集时完全不看 `iss` 声明，所以由 `kid` 单独决定尝试哪个提供商的密钥

没有 `kid` 头部的令牌只能匹配恰好只含一个密钥的密钥集；面对含多个密钥的 JWKS 会被拒绝，因此会轮换密钥的提供商必须在头部带上 `kid`

选定密钥后用它验证签名，并检查 `exp`（存在时还包括 `nbf` 和 `iat`）。接受的算法为 RS256/384/512、PS256/384/512、ES256/384/512 和 EdDSA；HMAC 签名的令牌（`HS*`）一律拒绝。密钥材料从 JWK 的 `kty`、`n`、`e`、`x`、`y` 和 `crv` 成员读取，因此 RSA、EC 和 OKP 密钥都可用，`x5c` 证书链则被忽略

`aud` 与 `iss` 只有在你要求时才校验。`JWT_AUDIENCE` 设定期望的受众（令牌的 `aud` 是列表时，只要包含该值即通过），`JWT_ISSUER` 设定期望的 `iss`。两者都是单一值，由列表里的每个 URL 共享，所以有多个提供商时 `JWT_ISSUER` 只能放行其中一个；如果需要对不止一个提供商校验 `iss`，必须采用[按 issuer 的配置](#按-issuer-区分的声明映射)。两者都不设置时，任何列出的提供商签发的令牌都会被接受，无论它原本签给哪个应用，代理也会在首次使用时记录警告说明这一点

#### 缓存与失败行为

每个密钥集（以及每个发现文档）都会缓存到代理的认证缓存中：配置了 Redis 就用 Redis，否则用进程内内存，时长为 `litellm_jwtauth.public_key_ttl` 秒（默认 600）。TTL 内 `kid` 未命中不会触发重新拉取，所以用提供商刚轮换掉的密钥签发的令牌会被拒绝，直到缓存副本过期

拉取在传输层失败（DNS、连接、TLS、超时）时，LiteLLM 会做最多三次短退避重试，然后把这次故障记住 30 秒，避免并发请求继续涌向失效端点。如果该密钥集存在最后已知可用的副本，且存续时间未超过 `public_key_ttl + public_key_stale_ttl`（默认 600 + 3600 秒），就继续提供该副本并记录警告。否则请求以 503 失败（`the identity provider's JWKS endpoint is temporarily unreachable`），列表中剩余的 URL 也不会再尝试，哪怕匹配的密钥在其中一个上。把 `public_key_stale_ttl` 设为 `0` 可以让缓存在副本过期后立即封闭失败。非 200 响应或无法解析的响应体既不重试也不提供过期副本；请求以 401 失败，并且同样终止对列表的遍历

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  litellm_jwtauth:
    public_key_ttl: 600
    public_key_stale_ttl: 3600
```

#### 按 issuer 区分的声明映射

当同一声明在不同提供商签发的令牌里含义不同时，使用 `litellm_jwtauth.issuers`。常见情况：一个提供商把团队 ID 放进 `sub`，另一个把用户 ID 放进 `sub`，单一的全局 `team_id_jwt_field: "sub"` 无法同时满足两者

每个条目与令牌的 `iss` 声明匹配，并携带自己的 JWKS URL、受众和声明映射

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  litellm_jwtauth:
    admin_jwt_scope: "litellm_proxy_admin"
    issuers:
      - issuer: "https://accounts.google.com"
        audience: "my-gcp-audience"
        team_id_jwt_field: "sub"

      - issuer: "https://keycloak.example.com/realms/my-realm"
        jwks_url: "https://keycloak.example.com/realms/my-realm/protocol/openid-connect/certs"
        audience: "my-keycloak-audience"
        user_id_jwt_field: "sub"
        user_email_jwt_field: "email"
```

在这份配置下，来自 `accounts.google.com` 的令牌把 `sub` 解析为团队 ID，而来自 Keycloak 的令牌把同样的 `sub` 解析为用户 ID

##### 按 issuer 的字段

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| `issuer` | 必填 | 期望的 `iss` 声明精确值。匹配是精确的字符串比较 |
| `audience` | 必填，除非设置了 `disable_audience_validation` | 该签发方的令牌所期望的 `aud` |
| `disable_audience_validation` | 必填，除非设置了 `audience` | 跳过该签发方的受众校验。与 `audience` 同时设置会被拒绝 |
| `jwks_url` | 否 | 该签发方的 JWKS 端点。默认读取 `<issuer>/.well-known/openid-configuration` 并跟随其 `jwks_uri` |
| `team_id_jwt_field` | 否 | 读取团队 ID 的声明路径 |
| `team_ids_jwt_field` | 否 | 读取团队 ID 列表的声明路径 |
| `user_id_jwt_field` | 否 | 读取用户 ID 的声明路径 |
| `user_email_jwt_field` | 否 | 读取用户邮箱的声明路径 |
| `org_id_jwt_field` | 否 | 读取组织 ID 的声明路径 |
| `end_user_id_jwt_field` | 否 | 读取终端用户 ID 的声明路径 |

声明路径支持用点号访问嵌套声明，例如 `resource_access.my-client.team`

##### 需要了解的几点

每个签发方都必须设置 `audience` 或 `disable_audience_validation: true`，否则 LiteLLM 会在启动时拒绝该配置；这样，与你共享提供商签名密钥的其他应用所签发的令牌就无法向你的代理认证

签发方条目里没有写明的声明映射会回退到顶层的 `litellm_jwtauth` 设置。如果你保留了全局的 `team_id_jwt_field: "sub"`，又添加了一个只映射 `user_id_jwt_field: "sub"` 的签发方，该签发方的令牌仍会从 `sub` 读取团队 ID。要避免这种情况，把所有声明映射都移入 `issuers`

`issuers` 是叠加的路由而不是允许列表。`iss` 匹配不到任何条目的令牌会落回全局的 `JWT_PUBLIC_KEY_URL` 和 `JWT_AUDIENCE` 路径，所以如果只想接受列出的签发方，请保持这两项不设置

匹配只看 `iss`。在匹配到的签发方的 JWKS 内部，仍然由 `kid` 头部选择签名密钥

#### 推荐的多提供商配置

提供商不止一个时，即便声明映射完全相同，也优先用 `litellm_jwtauth.issuers` 而非共享列表。`issuers` 条目把密钥查找限定在该签发方自己的 JWKS 内，并按提供商逐个校验 `iss` 和 `aud`，这是共享列表做不到的。保持 `JWT_PUBLIC_KEY_URL` 不设置，这样 `iss` 不在列表中的令牌会被拒绝（401，`Missing JWT Public Key URL`），而不是落回无限定范围的路径。上文描述的密钥缓存与过期副本回退机制对每个签发方的 JWKS 同样生效

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    user_email_jwt_field: "email"
    issuers:
      - issuer: "https://keycloak.example.com/realms/my-realm"
        audience: "litellm-proxy"

      - issuer: "https://sts.example-cloud.com"
        jwks_url: "https://sts.example-cloud.com/.well-known/jwks.json"
        audience: "litellm-proxy"
```

#### 提供商兼容性

LiteLLM 不对任何身份提供商做特殊处理。任何签发方只要满足以下条件即可使用：用上文列出的算法之一给令牌签名；以 JWKS 形式发布公钥（直接发布，或通过携带 `jwks_uri` 的 OIDC 发现文档）；设置的 `kid` 头部能在该 JWKS 中找到；`iss` 值稳定，并签发你配置的受众。本页展示的 Keycloak 和 Kubernetes 签发方就是这样发布密钥的；其他签发方在投入使用前，请对照一段解码后的样例令牌和该提供商的 JWKS 逐项核实这四点

#### 故障排查

用 `--detailed_debug` 启动代理，可以看到 `JWT Auth:` 开头的日志行，了解每次拒绝的具体原因

| 症状 | 原因 | 修复方法 |
| --- | --- | --- |
| 401 `No matching public key found. keys=[...], kid=...` | 列出的 JWKS 中没有包含该令牌 `kid` 的密钥，或者令牌没有 `kid` 而 JWKS 含多个密钥 | 确认令牌头部的 `kid` 出现在某份 JWKS 文档中。如果提供商刚轮换过密钥，等 `public_key_ttl` 过期或重启代理 |
| 在 `JWT_PUBLIC_KEY_URL` 配了多个提供商时报 401 `Validation fails: Signature verification failed` | 两个提供商发布了相同的 `kid`；共享列表取第一个含该 `kid` 的 URL，用错误的密钥做了校验 | 改用 `litellm_jwtauth.issuers`，让查找限定在该令牌的签发方范围内 |
| 401 `Validation fails: Invalid issuer` | `iss` 不等于 `JWT_ISSUER`（共享路径）或匹配到的 `issuers[].issuer` | 从解码后的令牌中原样复制 `iss`；末尾斜杠以及 `http` 与 `https` 的差异都有影响 |
| 401 `Validation fails: Audience doesn't match` 或 `Token is missing the "aud" claim` | `aud` 不包含 `JWT_AUDIENCE` / `issuers[].audience`，或令牌没有 `aud` | 设置提供商实际签发的受众（通常是客户端 ID）；若该签发方无法签发受众，就在其条目上设置 `disable_audience_validation: true` |
| 401 `Validation fails: The specified alg value is not allowed` | 令牌为 HMAC 签名，或使用了上文列表之外的算法 | 让提供商改用 RS256 或其他非对称算法签名 |
| 401 `OIDC discovery document at ... does not contain a 'jwks_uri' field` | URL 中包含 `.well-known/openid-configuration`，被当作发现文档处理，但返回的却是 JWKS | 让 `JWT_PUBLIC_KEY_URL` 指向发现文档本身，或指向路径中不含该片段的 JWKS URL |
| 503 `the identity provider's JWKS endpoint is temporarily unreachable` | 某个 JWKS 或发现 URL 无法访问，且没有可用的过期副本 | 检查代理到提供商的出网连通性。调高 `public_key_stale_ttl` 以扛过更长的故障期 |
| 401 `Missing JWT Public Key URL from environment` | `iss` 没有匹配到任何 `issuers` 条目，且 `JWT_PUBLIC_KEY_URL` 未设置 | 把该签发方加入 `issuers`；若应接受未列出的签发方，则设置 `JWT_PUBLIC_KEY_URL` |

### Kubernetes ServiceAccount 认证

使用 Kubernetes ServiceAccount 令牌为集群内运行的工作负载做认证。当你希望 Pod 以其原生的 Kubernetes 身份向 LiteLLM 认证时，这个功能很有用。

#### 前置条件

1. 你的 Kubernetes 集群必须启用 ServiceAccount 令牌投影（Kubernetes 1.20+ 默认开启）
2. 集群的 OIDC 签发方必须可访问（EKS、GKE、AKS 会自动满足）

#### 第 1 步：配置 OIDC 发现 URL

把 `JWT_PUBLIC_KEY_URL` 设置为你集群的 OIDC 发现端点：

<Tabs>
<TabItem value="eks" label="Amazon EKS">

```bash
# Get your EKS OIDC issuer URL
aws eks describe-cluster --name <cluster-name> --query "cluster.identity.oidc.issuer" --output text

# Set the JWKS URL (append /keys to the issuer URL)
export JWT_PUBLIC_KEY_URL="https://oidc.eks.<region>.amazonaws.com/id/<id>/keys"
```

</TabItem>
<TabItem value="gke" label="Google GKE">

```bash
# GKE uses Google's OIDC provider
export JWT_PUBLIC_KEY_URL="https://container.googleapis.com/v1/projects/<project>/locations/<location>/clusters/<cluster>/jwks"
```

</TabItem>
<TabItem value="aks" label="Azure AKS">

```bash
# Get your AKS OIDC issuer URL
az aks show --name <cluster-name> --resource-group <resource-group> --query "oidcIssuerProfile.issuerUrl" -o tsv

# Set the JWKS URL
export JWT_PUBLIC_KEY_URL="<issuer-url>/openid/v1/jwks"
```

</TabItem>
<TabItem value="self-managed" label="自管集群">

```bash
# For self-managed clusters, check your API server's --service-account-issuer flag
# The JWKS endpoint is typically at:
export JWT_PUBLIC_KEY_URL="https://<api-server>/openid/v1/jwks"
```

</TabItem>
</Tabs>

#### 第 2 步：配置 LiteLLM

配置 LiteLLM 从 Kubernetes ServiceAccount 令牌中提取身份信息：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:  
    # Use namespace as team identifier (resolves via team_alias in DB)
    team_alias_jwt_field: 'kubernetes\.io.namespace'
```

#### 第 3 步：创建 ServiceAccount 并配置 Pod

创建 ServiceAccount 及其关联的 Secret，并配置 Pod 使用该令牌：

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-llm-client
  namespace: my-app
---
apiVersion: v1
kind: Secret
metadata:
  name: my-llm-client-token
  namespace: my-app
  annotations:
    kubernetes.io/service-account.name: my-llm-client
type: kubernetes.io/service-account-token
---
apiVersion: v1
kind: Pod
metadata:
  name: llm-client-pod
  namespace: my-app
spec:
  serviceAccountName: my-llm-client
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: LITELLM_TOKEN
      valueFrom:
        secretKeyRef:
          name: my-llm-client-token
          key: token
```

在 LiteLLM 中设置期望的受众：

```bash
export JWT_AUDIENCE="https://kubernetes.default.svc"
```

#### 第 4 步：为命名空间创建团队

在 LiteLLM 中创建与命名空间对应的团队（使用 `team_alias`）：

```bash
curl -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-d '{
    "team_alias": "my-app",
    "team_id": "my-app",
    "models": ["{{openai_large}}", "{{anthropic}}"]
}'
```

#### 第 5 步：使用令牌

在 Pod 内部，令牌位于 `LITELLM_TOKEN` 环境变量中：

```bash
# Make a request to LiteLLM using the env var
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_TOKEN" \
-d '{
  "model": "{{openai_large}}",
  "messages": [{"role": "user", "content": "Hello!"}]
}'
```

#### 示例：ServiceAccount 令牌结构

Kubernetes ServiceAccount 令牌的结构如下：

```json
{
  "aud": ["litellm-proxy"],
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLE",
  "kubernetes.io": {
    "namespace": "my-app",
    "pod": {
      "name": "llm-client-pod",
      "uid": "pod-uid"
    },
    "serviceaccount": {
      "name": "my-llm-client",
      "uid": "sa-uid"
    }
  },
  "nbf": 1234567890,
  "sub": "system:serviceaccount:my-app:my-llm-client"
}
```

#### 进阶：通过名称解析把命名空间映射到团队

使用 `team_alias_jwt_field` 自动把命名空间解析为团队：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    # Map the namespace to team_alias in the database
    team_alias_jwt_field: 'kubernetes\.io.namespace'
    user_id_upsert: true
```

这样，`production` 命名空间中的 Pod 会自动关联到 `team_alias: production` 对应的团队。

### 设置接受的 JWT 作用域名称

修改 JWT 'scopes' 中用于判定用户是否拥有管理员权限的字符串。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
```

### 追踪终端用户 / 内部用户 / 团队 / 组织

设置 JWT 令牌中与 LiteLLM 用户 / 团队 / 组织相对应的字段。

**说明**：所有 JWT 字段都支持用点号访问嵌套声明（例如 `"user.sub"`、`"resource_access.client.roles"`）。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    team_id_jwt_field: "client_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    user_id_jwt_field: "sub" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    org_id_jwt_field: "org_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    end_user_id_jwt_field: "customer_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
```

预期的 JWT（扁平结构）：

```json
{
  "client_id": "my-unique-team",
  "sub": "my-unique-user",
  "org_id": "my-unique-org"
}
```

**也可以用点号表示嵌套结构**：

```json
{
  "user": {
    "sub": "my-unique-user",
    "email": "user@example.com"
  },
  "tenant": {
    "team_id": "my-unique-team"
  },
  "organization": {
    "id": "my-unique-org"
  }
}
```

**嵌套示例对应的配置**：

```yaml
litellm_jwtauth:
  user_id_jwt_field: "user.sub"
  user_email_jwt_field: "user.email"
  team_id_jwt_field: "tenant.team_id"
  org_id_jwt_field: "organization.id"
```

此后每次调用，LiteLLM 都会自动更新数据库中该用户 / 团队 / 组织的花费。

### 按名称（别名）而非 ID 解析

有时 JWT 令牌里带的是人类可读的名称而非数据库 ID。LiteLLM 可以在数据库中查找这些名称并解析为 ID。

**使用场景**：你的 IDP 在 JWT 里提供团队 / 组织名称，而 LiteLLM 做花费追踪和访问控制需要的是实际的数据库 ID。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    # Name-based fields (resolved via database lookup)
    team_alias_jwt_field: "team_alias"       # Resolves team by team_alias in DB
    org_alias_jwt_field: "org_alias"         # Resolves org by organization_alias in DB
```

**预期的 JWT**：

```json
{
  "sub": "user-123",
  "team_alias": "engineering-team",
  "org_alias": "acme-corp"
}
```

**工作原理**：

1. LiteLLM 从配置的 JWT 字段中提取名称
2. 按别名字段在数据库中查找实体：
   - 团队：`LiteLLM_TeamTable` 表的 `team_alias` 列
   - 组织：`LiteLLM_OrganizationTable` 表的 `organization_alias` 列
3. 用解析出的 ID 做花费追踪和访问控制

**优先级**：ID 字段始终优先于名称字段。如果 `team_id_jwt_field` 和 `team_alias_jwt_field` 都已配置，且两个值都存在于 JWT 中，将使用 ID。

```yaml
# Example: ID takes precedence
litellm_jwtauth:
  team_id_jwt_field: "team_id"        # Used if present in JWT
  team_alias_jwt_field: "team_alias"   # Fallback if team_id not present
```

**嵌套字段**：名称字段同样支持用点号访问嵌套声明：

```yaml
litellm_jwtauth:
  team_alias_jwt_field: "organization.team.name"
  org_alias_jwt_field: "company.name"
```

**重要说明**：
- 实体（团队 / 组织）必须已存在于数据库中，且别名匹配
- 别名应当唯一；多个实体共用同一别名时会返回错误
- 名称解析会带来一次数据库查询，直接使用 ID 的性能略好

### JWT 作用域

JWT 认证令牌上的作用域如下所示

**可以是列表**
```
scope: ["litellm-proxy-admin",...]
```

**也可以是空格分隔的字符串**
```
scope: "litellm-proxy-admin ..."
```

### 用团队控制模型访问


1. 指定 JWT 中包含用户所属团队 ID 的字段。

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups" 
    user_id_upsert: true # add user_id to the db if they don't exist
    enforce_team_based_model_access: true # don't allow users to access models unless the team has access
```

这里假设你的令牌如下所示：
```
{
  ...,
  "sub": "my-unique-user",
  "groups": ["team_id_1", "team_id_2"]
}
```

2. 在 LiteLLM 上创建这些团队

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_id": "team_id_1" # 👈 MUST BE THE SAME AS THE SSO GROUP ID
}'
```

3. 测试整个流程

UI 的 SSO：[**观看演示**](https://www.loom.com/share/8959be458edf41fd85937452c29a33f3?sid=7ebd6d37-569a-4023-866e-e0cde67cb23e)

API 的 OIDC 认证：[**观看演示**](https://www.loom.com/share/00fe2deab59a426183a46b1e2b522200?sid=4ed6d497-ead6-47f9-80c0-ca1c4b6b4814)


### 流程

- 校验用户 ID 是否在数据库中（LiteLLM_UserTable）
- 校验任一分组是否在数据库中（LiteLLM_TeamTable）
- 校验任一分组是否拥有模型访问权限
- 全部通过后放行请求

### 通过请求头选择团队

当 JWT 令牌包含多个团队（通过 `team_ids_jwt_field`）时，可以通过 `x-litellm-team-id` 请求头显式指定本次请求使用哪个团队。

该请求头接受团队的 `team_id` 或 `team_alias`。LiteLLM 先用该值比对 JWT 授予的团队 ID；不是其中之一时，再查找具有该别名的团队，且仅当该团队的 ID 是 JWT 授予的 ID 之一时才接受。无论哪种方式，请求都以规范的 `team_id` 运行，预算、模型访问、速率限制、花费日志以及数据库中的 `team_id` 列展示的都是 ID 而非别名。直接传 ID 可以跳过别名查找

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your-jwt-token>' \
-H 'x-litellm-team-id: team_id_2' \
-d '{
  "model": "{{openai_large}}",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

同一个请求若传 `team_id_2` 的别名（即在 `/team/new` 上设置的 `team_alias`），也会解析到同一个团队：

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your-jwt-token>' \
-H 'x-litellm-team-id: team_2' \
-d '{
  "model": "{{openai_large}}",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

**校验规则**：
- 该值必须是 JWT `team_ids_jwt_field` 列表中的团队 ID（或 `team_id_jwt_field` 的值），或者是这些团队之一的别名
- 两者都不是的值（包括 JWT 未授予的团队的别名）会返回 403，错误信息说明该值未匹配任何团队 ID 或团队别名，并列出 JWT 允许的团队 ID
- 被多个团队共用的别名永远无法解析；想按别名选择团队，请保持别名唯一
- 未提供请求头时，LiteLLM 自动选择第一个有权访问所请求模型的团队

设置 `fallback_to_db_teams: true` 且 JWT 不携带团队声明时，该请求头改为对数据库中用户的团队成员关系校验，别名同样被接受：该值必须是用户所属团队的 ID 或别名，否则请求被 403 拒绝


### JWT 声明无法解析时回退到数据库团队

默认情况下，配置了 `team_id_jwt_field` 或 `team_ids_jwt_field`，而 JWT 携带的声明值**无法**映射到任何 LiteLLM 团队时，LiteLLM 会抛出错误：该声明被视为权威来源。

如果部署中 IdP 的团队声明只作**参考**（例如机器令牌的 `groups` 声明与 LiteLLM 的 `team_id` 分属两套命名体系），可以选择启用回退：当配置的声明存在但解析失败时，LiteLLM 改用用户唯一的 LiteLLM 团队（前提是该用户在数据库中恰好属于一个团队）。

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups"
    team_claim_fallback: true # 👈 opt in
```

**行为对照**：

| 触发条件 | 默认（`team_claim_fallback: false`） | 显式启用（`team_claim_fallback: true`） |
|---|---|---|
| `team_id` 声明解析到真实团队 | 200 / 使用团队 | 200 / 使用团队 |
| `team_id` 声明存在，但数据库中无此团队 | 抛错 | 延后处理 → 回退到用户在数据库中的唯一团队 |
| `team_alias` 声明解析成功 | 200 / 使用团队 | 200 / 使用团队 |
| `groups` 声明解析成功且团队拥有该模型 | 200 | 200 |
| `groups` 声明解析成功但团队没有该模型 | 403（保持不变） | 403（保持不变） |
| `groups` 声明存在，但没有任何一个解析到真实团队 | 403 | 延后处理 → 回退到用户在数据库中的唯一团队 |
| 完全没有团队声明（单团队回退基线） | 200 / 回退 | 200 / 回退 |

**安全边界**：只有当用户在数据库中恰好属于一个 LiteLLM 团队时回退才会生效；非 404 错误（例如 `"No DB Connected"`）始终照常抛出。如果 IdP 的团队声明对你的鉴权是权威的，请保持默认值（`false`）。


### 自定义 JWT 校验

如果你需要额外的方式来验证令牌对 LiteLLM 代理是否有效，可以用自定义逻辑校验 JWT 令牌。

#### 1. 设置自定义校验函数

```python
from typing import Literal

def my_custom_validate(token: str) -> Literal[True]:
  """
  Only allow tokens with tenant-id == "my-unique-tenant", and claims == ["proxy-admin"]
  """
  allowed_tenants = ["my-unique-tenant"]
  allowed_claims = ["proxy-admin"]

  if token["tenant_id"] not in allowed_tenants:
    raise Exception("Invalid JWT token")
  if token["claims"] not in allowed_claims:
    raise Exception("Invalid JWT token")
  return True
```

#### 2. 配置 config.yaml

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_id_jwt_field: "tenant_id"
    user_id_upsert: True
    custom_validate: custom_validate.my_custom_validate # 👈 custom validate function
```

#### 3. 测试流程

**预期的 JWT**

```
{
  "sub": "my-unique-user",
  "tenant_id": "INVALID_TENANT",
  "claims": ["proxy-admin"]
}
```

**预期的响应**

```
{
  "error": "Invalid JWT token"
}
```

```
{
  "sub": "my-unique-user",
  "tenant_id": "INVALID_TENANT",
  "claims": ["proxy-admin"]
}
```

**预期响应**

```
{
  "error": "Invalid JWT token"
}
```



### 允许的路由

通过配置指定 JWT 可以访问哪些路由。

默认情况下：

- 管理员：只能访问管理路由（`/team/*`、`/key/*`、`/user/*`）
- 团队：只能访问 OpenAI 路由（`/chat/completions` 等）以及信息路由（`/*/info`）

[**查看代码**](https://github.com/BerriAI/litellm/blob/b204f0c01c703317d812a1553363ab0cb989d5b6/litellm/proxy/_types.py#L95)

**管理员路由**
```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    admin_allowed_routes: ["/v1/embeddings"]
```

**团队路由**
```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    # ...
    team_id_jwt_field: "litellm-team" # 👈 Set field in the JWT token that stores the team ID
    team_allowed_routes: ["/v1/chat/completions"] # 👈 Set accepted routes
```

### 为团队开放其他提供商路由

团队 JWT 默认已经可以调用 `/v1/messages` 和 `/v1/messages/count_tokens`。要让团队 JWT 令牌访问 `anthropic_routes` 中的其他 Anthropic 风格端点，请更新 `litellm_jwtauth` 配置中的 `team_allowed_routes`。`team_allowed_routes` 支持以下取值：

- `LiteLLMRoutes` 中的命名路由组（如 `openai_routes`、`anthropic_routes`、`info_routes`、`mapped_pass_through_routes`）。
- 精确路由，如 `/v1/messages`。
- 以 `*` 结尾的路由前缀，如 `/internal-models/*`，会匹配该前缀下的所有路由。

下面是可用路由组及各组代表性路由的速查表。如需完整清单，请以 `litellm/proxy/_types.py` 中的 `LiteLLMRoutes` 枚举为准。

| 路由组 | 包含内容 | 代表性路由 |
|-------------|------------------|-----------------------|
| `openai_routes` | OpenAI 兼容的 REST 端点（对话、补全、嵌入、图像、响应、模型等） | `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/images/generations`, `/v1/models` |
| `anthropic_routes` | Anthropic 风格端点（`/v1/messages` 及相关） | `/v1/messages`, `/v1/messages/count_tokens`, `/v1/skills` |
| `mapped_pass_through_routes` | 提供商专属的透传路由前缀（如经 `/anthropic` 代理的 Anthropic），用于提供商通配映射 | `/anthropic/*`, `/vertex-ai/*`, `/bedrock/*` |
| `passthrough_routes_wildcard` | 提供商的通配映射（如 `/anthropic/*`），即代理预先生成好的通配路由列表 | `/anthropic/*`, `/vllm/*` |
| `google_routes` | Google 专属端点（如 Vertex、批处理端点） | `/v1beta/models/{model_name}:generateContent` |
| `mcp_routes` | 内部 MCP 管理端点 | `/mcp/tools`, `/mcp/tools/call` |
| `info_routes` | 管理界面使用的只读与信息类端点 | `/key/info`, `/team/info`, `/v1/models` |
| `management_routes` | 仅管理员可用的管理端点（创建/更新/删除用户、团队、模型） | `/team/new`, `/key/generate`, `/model/new` |
| `spend_tracking_routes` | 预算与花费相关端点 | `/spend/logs`, `/spend/keys`, `/spend/users` |
| `public_routes` | 公开且无需认证的端点 | `/`, `/routes`, `/.well-known/litellm-ui-config` |

注：`llm_api_routes` 是 OpenAI、Anthropic、Google、透传及其他 LLM 路由的并集（`openai_routes + anthropic_routes + google_routes + mapped_pass_through_routes + passthrough_routes_wildcard + apply_guardrail_routes + mcp_routes + litellm_native_routes`）。

默认值（未在 `litellm_jwtauth` 中覆盖时代理所使用的值）：

- `admin_jwt_scope`: `litellm_proxy_admin`
- `admin_allowed_routes`（默认）：`management_routes`, `spend_tracking_routes`, `global_spend_tracking_routes`, `info_routes`
- `team_allowed_routes`（默认）：`openai_routes`, `info_routes`, `mcp_routes`, `/v1/messages`, `/v1/messages/count_tokens`。设置 `team_allowed_routes` 会整体替换这份列表，因此如果团队还需要 `mcp_routes` 和 `/v1/messages` 路由，请把它们加回去
- `public_allowed_routes`（默认）：`public_routes`


示例：允许团队 JWT 调用 Anthropic 的 `/v1/messages`（用路由组或显式路由字符串都可以）：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes", "info_routes", "anthropic_routes"]
```

也可以只精确放行 Anthropic 消息端点：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["/v1/messages", "info_routes"]
```

如果注册的一批透传端点共享同一个前缀，只需用尾随 `*` 授权该前缀一次，之后新增的路由无需再改配置即可被覆盖。`admin_allowed_routes` 也接受同样的写法。

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes", "info_routes", "/internal-models/*"]
```

只有尾随的 `*` 才会被当作通配符，且它匹配的是前缀之下的路由，因此 `/internal-models/*` 能覆盖 `/internal-models/anthropic/v1/messages`，但不含 `/internal-models` 这个裸路由。


### 缓存公钥

控制公钥的缓存时长（单位为秒）。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    admin_allowed_routes: ["/v1/embeddings"]
    public_key_ttl: 600 # 👈 KEY CHANGE
```

### 自定义 JWT 字段

自定义存放 team_id 的字段。默认检查的是 'client_id' 字段。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    team_id_jwt_field: "client_id" # 👈 KEY CHANGE
```

### 封禁团队

要拦截某个团队 ID 的所有请求，使用 `/team/block`

**封禁团队**

```bash
curl --location 'http://0.0.0.0:4000/team/block' \
--header 'Authorization: Bearer <admin-token>' \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "litellm-test-client-id-new" # 👈 set team id
}'
```

**解封团队**

```bash
curl --location 'http://0.0.0.0:4000/team/unblock' \
--header 'Authorization: Bearer <admin-token>' \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "litellm-test-client-id-new" # 👈 set team id
}'
```


### Upsert 用户与允许的邮箱域名

属于特定邮箱域名的用户可自动获得代理访问权限。

**注意**：`user_allowed_email_domain` 为可选项。若不设置，则不论邮箱域名是什么，所有用户都会被放行。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_jwt_auth: True
  litellm_jwtauth:
    user_email_jwt_field: "email" # 👈 checks 'email' field in jwt payload
    user_allowed_email_domain: "my-co.com" # 👈 OPTIONAL - allows user@my-co.com to call proxy
    user_id_upsert: true # 👈 upserts the user to db, if valid email but not in db
```

## OIDC UserInfo 端点

当 JWT/访问令牌中不含用户身份信息时使用此功能。LiteLLM 会调用身份提供商（IdP）的 UserInfo 端点来获取用户详情。

### 适用场景

- JWT 是不透明（非自包含）的，或缺少用户声明（claims）
- 需要从身份提供商拉取最新的用户信息
- 访问令牌中不含邮箱、角色或其他身份数据

### 配置

```yaml title="config.yaml" showLineNumbers
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    # Enable OIDC UserInfo endpoint
    oidc_userinfo_enabled: true
    oidc_userinfo_endpoint: "https://your-idp.com/oauth2/userinfo"
    oidc_userinfo_cache_ttl: 300  # Cache for 5 minutes (default: 300)
    
    # Map fields from UserInfo response
    user_id_jwt_field: "sub"
    user_email_jwt_field: "email"
    user_roles_jwt_field: "roles"
```

### 流程图

```mermaid
sequenceDiagram
    participant Client
    participant LiteLLM
    participant IdP as Identity Provider

    Client->>LiteLLM: Request with Bearer token
    Note over LiteLLM: Check cache for UserInfo
    
    LiteLLM->>IdP: GET /userinfo (if not cached)<br/>Authorization: Bearer {token}
    IdP-->>LiteLLM: User data (sub, email, roles)
    
    Note over LiteLLM: Cache response (TTL: 5min)<br/>Extract user_id, email, roles<br/>Perform RBAC checks
    
    LiteLLM-->>Client: Authorized/Denied
```

### 示例：Azure AD

```yaml title="config.yaml" showLineNumbers
litellm_jwtauth:
  oidc_userinfo_enabled: true
  oidc_userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo"
  user_id_jwt_field: "sub"
  user_email_jwt_field: "email"
```

### 示例：Keycloak

```yaml title="config.yaml" showLineNumbers
litellm_jwtauth:
  oidc_userinfo_enabled: true
  oidc_userinfo_endpoint: "https://keycloak.example.com/realms/your-realm/protocol/openid-connect/userinfo"
  user_id_jwt_field: "sub"
  user_roles_jwt_field: "resource_access.your-client.roles"
```

## 将 JWT 形态的机器令牌路由到 OAuth2

适用于以下场景：
- 设置 `enable_jwt_auth: true` 做标准 JWT 校验
- 机器令牌是 JWT 形态，需要根据声明路由到 OAuth2

`routing_overrides` 支持两种工作模式：
- **选择性模式**：设置 `enable_oauth2_auth: false`，在 LLM 与信息路由上仅把匹配的 JWT 转给 OAuth2
- **全局模式**：设置 `enable_oauth2_auth: true`，在 LLM 与信息路由上同时启用 OAuth2

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    routing_overrides:
      - iss: "machine-issuer.example.com"
        client_id: "MID_LITELLM"
        path: "oauth2"
```

### 匹配行为

- 当**所有**已配置的选择器都与对应的令牌声明匹配时，规则才算命中（AND 语义）。
- 支持的选择器：`iss`（必填）、`client_id`（可选）、`scope`（可选）、`aud`（可选）。
- 选择器取值可以是单个字符串，也可以是字符串列表（声明只需按下面的规则匹配其中至少一项）。
- **通配符**：选择器可以使用 shell 风格的 `*` 和 `?`。匹配**区分大小写**，请使用 IdP 写入 JWT 声明时的原始大小写。
- **`scope` 声明为空格分隔的字符串**：OAuth/OIDC 常把 `scope` 作为单个字符串发送（如 `openid profile App:LiteLLM`）。LiteLLM **只在匹配 `scope` 选择器时**才拆分该字符串，这样像 `App:LiteLLM` 这样的配置值才能匹配上。**`iss`、`aud` 和 `client_id` 绝不按空格拆分**，一律使用完整的声明字符串（路由只用未验证的声明来选路；最终鉴权仍会校验令牌）。
- 如果没有规则命中，LiteLLM 继续走标准 JWT 校验。

### 示例：`scope` 与通配符 `client_id`

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    routing_overrides:
      - iss: "machine-issuer.example.com"
        scope: "App:LiteLLM"
        client_id: "*MID_LITELLM"
        path: "oauth2"
```

### 基于列表的覆写示例

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    routing_overrides:
      - iss: ["machine-issuer.example.com", "backup-issuer.example.com"]
        client_id: ["MID_LITELLM", "MID_BACKUP"]
        aud: ["api://litellm", "api://fallback"]
        path: "oauth2"
```

## [BETA] 通过 OIDC 角色控制访问

允许带有受支持角色的 JWT 令牌访问代理。

让用户和团队无需先写入数据库即可访问代理。


非常重要：请设置 `enforce_rbac: true`，确保 RBAC 系统已启用。

**注意**：此功能处于测试阶段，行为可能随时变化。

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    object_id_jwt_field: "oid" # can be either user / team, inferred from the role mapping
    roles_jwt_field: "roles"
    role_mappings:
      - role: litellm.api.consumer
        internal_role: "team"
    enforce_rbac: true # 👈 VERY IMPORTANT

  role_permissions: # default model + endpoint permissions for a role. 
    - role: team
      models: ["anthropic-claude"]
      routes: ["/v1/chat/completions"]

environment_variables:
  JWT_AUDIENCE: "api://LiteLLM_Proxy" # ensures audience is validated
```

- `object_id_jwt_field`：JWT 令牌中存放对象 ID 的字段。这个 ID 既可能是用户 ID，也可能是团队 ID。若同一字段两种都可能，就用本字段替代 `user_id_jwt_field` 和 `team_id_jwt_field`。**支持点号表示法**访问嵌套声明（如 `"profile.object_id"`）。

- `roles_jwt_field`：JWT 令牌中存放角色的字段。该字段是用户拥有的角色列表。**支持点号表示法**访问嵌套字段，例如 `resource_access.litellm-test-client-id.roles`。

**其他 JWT 字段配置项：**

- `team_ids_jwt_field`：存放团队 ID 列表的字段。**支持点号表示法**（如 `"groups"`、`"teams.ids"`）。
- `user_email_jwt_field`：存放用户邮箱的字段。**支持点号表示法**（如 `"email"`、`"user.email"`）。
- `end_user_id_jwt_field`：存放终端用户 ID 的字段，用于成本追踪。**支持点号表示法**（如 `"customer_id"`、`"customer.id"`）。设置后，来自已验证 JWT 声明的终端用户 ID 优先于请求中携带的任何值（如 `x-litellm-end-user-id` 这类请求头，或 `metadata.user_id` 这类请求体字段；参见[客户 ID 优先级顺序](customers#1-携带客户-id-发起-llm-api-调用)）。

- `role_mappings`：角色映射列表。把 JWT 令牌中收到的角色映射到 LiteLLM 内部角色。

- `JWT_AUDIENCE`：JWT 令牌的受众（audience），用于校验令牌的受众。通过环境变量设置。

### 令牌示例

```bash
{
  "aud": "api://LiteLLM_Proxy",
  "oid": "eec236bd-0135-4b28-9354-8fc4032d543e",
  "roles": ["litellm.api.consumer"] 
}
```

### 角色映射规范

- `role`：JWT 令牌中预期的角色。
- `internal_role`：LiteLLM 内部用于控制访问的角色。

支持的内部角色：
- `team`：使用团队对象做 RBAC 花费追踪。适合按“用例”追踪花费。
- `internal_user`：使用用户对象做 RBAC 花费追踪。适合按“个人用户”追踪花费。
- `proxy_admin`：使用代理管理员做 RBAC 花费追踪。适合给令牌授予管理员权限。

### [架构图（模型访问控制）](./jwt_auth_arch)

## [BETA] 通过作用域控制模型访问

控制 JWT 可以访问哪些模型。设置 `enforce_scope_based_access: true` 以启用基于作用域的访问控制。

### 1. 在 config.yaml 中配置作用域映射


```yaml
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: gpt-3.5-turbo-testing
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_id_jwt_field: "client_id" # 👈 set the field in the JWT token that contains the team id
    team_id_upsert: true # 👈 upsert the team to db, if team id is not found in db
    scope_mappings:
      - scope: litellm.api.consumer
        models: ["anthropic-claude"]
      - scope: litellm.api.gpt_3_5_turbo
        models: ["gpt-3.5-turbo-testing"]
    enforce_scope_based_access: true # 👈 enforce scope-based access control
    enforce_rbac: true # 👈 enforces only a Team/User/ProxyAdmin can access the proxy.
```

#### 作用域映射规范

- `scope`：JWT 令牌要使用的作用域。
- `models`：JWT 令牌可以访问的模型。取值为 `model_list` 中的 `model_name`。注意：当前不支持通配路由。

### 2. 创建带正确作用域的 JWT

预期令牌：

```bash
{
  "scope": ["litellm.api.consumer", "litellm.api.gpt_3_5_turbo"] # can be a list or a space-separated string
}
```

### 3. 测试该流程

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJhbGci...' \
-d '{
  "model": "gpt-3.5-turbo-testing",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going 1234?"
    }
  ]
}'
```

## [BETA] 与 IDP 同步用户角色和团队

自动把身份提供商（IDP）中的用户角色和团队成员关系同步到 LiteLLM 数据库，确保 LiteLLM 中的用户权限与团队成员关系始终和 IDP 保持一致。

**注意**：此功能处于测试阶段，行为可能随时变化。

### 使用场景

- **角色同步**：用户角色在 IDP 中变更时，自动更新 LiteLLM 中的角色
- **团队成员同步**：让 IDP 与 LiteLLM 之间的团队成员关系保持同步
- **集中式权限管理**：通过 IDP 统一管理所有用户权限，同时保留 LiteLLM 的各项功能

### 设置

#### 1. 配置 JWT 角色映射

把 JWT 令牌中的角色映射到 LiteLLM 用户角色：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups"
    roles_jwt_field: "roles"
    user_id_upsert: true
    sync_user_role_and_teams: true # 👈 Enable sync functionality
    jwt_litellm_role_map: # 👈 Map JWT roles to LiteLLM roles
      - jwt_role: "ADMIN"
        litellm_role: "proxy_admin"
      - jwt_role: "USER"
        litellm_role: "internal_user"
      - jwt_role: "VIEWER"
        litellm_role: "internal_user"
```

#### 2. JWT 角色映射规范

- `jwt_role`：角色在 JWT 令牌中的名称。支持基于 `fnmatch` 的通配模式（如 `"ADMIN_*"` 可匹配 `"ADMIN_READ"`、`"ADMIN_WRITE"` 等）
- `litellm_role`：对应的 LiteLLM 用户角色

**支持的 LiteLLM 角色：**
- `proxy_admin`：完整的管理权限
- `internal_user`：普通用户权限
- `internal_user_view_only`：只读权限

#### 3. JWT 令牌示例

```json
{
  "sub": "user-123",
  "roles": ["ADMIN"],
  "groups": ["team-alpha", "team-beta"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 工作原理

当用户携带 JWT 令牌发起请求时：

1. **角色同步**：
   - LiteLLM 检查 JWT 中的用户角色是否与数据库中的角色一致
   - 若不一致，会在 LiteLLM 数据库中更新该用户的角色
   - 通过 `jwt_litellm_role_map` 把 JWT 角色转换为 LiteLLM 角色

2. **团队成员同步**：
   - 将 JWT 令牌中的团队成员关系与用户当前在 LiteLLM 中的团队进行比较
   - 把用户加入 JWT 中新出现的团队
   - 把用户从 JWT 中已不存在的团队移除

3. **数据库更新**：
   - 更新在认证过程中自动完成
   - 无需人工干预

### 配置选项

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    # Required fields
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups"
    roles_jwt_field: "roles"
    
    # Sync configuration
    sync_user_role_and_teams: true
    user_id_upsert: true
    
    # Role mapping
    jwt_litellm_role_map:
      - jwt_role: "AI_ADMIN_*"  # Wildcard pattern
        litellm_role: "proxy_admin"
      - jwt_role: "AI_USER"
        litellm_role: "internal_user"
```

### 注意事项

- **性能**：同步操作发生在认证过程中，可能带来少量额外延迟
- **数据库访问**：更新用户和团队需要数据库连接
- **团队创建**：JWT 令牌中提到的团队必须先在 LiteLLM 中存在，同步才能把用户分配进去
- **通配符支持**：JWT 角色模式支持用 `fnmatch` 做通配匹配

### 测试同步功能

1. **创建一个带初始角色的测试用户**：

```bash
curl -X POST 'http://0.0.0.0:4000/user/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user-123",
    "user_role": "internal_user"
}'
```

2. **携带含不同角色的 JWT 发起请求**：

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <JWT_WITH_ADMIN_ROLE>' \
-d '{
  "model": "{{anthropic}}",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

3. **确认角色已更新**：

```bash
curl -X GET 'http://0.0.0.0:4000/user/info?user_id=user-123' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>'
```

## [BETA] JWT 到虚拟密钥映射

把 JWT 身份映射到 LiteLLM 虚拟密钥（virtual key），让通过 JWT 认证的用户获得按用户的预算、速率限制、模型访问控制和花费追踪。

JWT 进来时，LiteLLM 会在映射表中查找配置的声明（如 `email`、`sub`）。如果存在映射，请求会被当作携带了对应的虚拟密钥，所有虚拟密钥功能随之生效。

### 设置

在 JWT 认证配置中加入 `virtual_key_claim_field`：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    virtual_key_claim_field: "email"         # JWT claim to look up (supports dot notation)
    virtual_key_mapping_cache_ttl: 300       # Cache TTL in seconds (default: 300)
```

### 管理映射

所有端点都需要管理员认证（`Authorization: Bearer <master_key>`）。

**创建映射**。把 JWT 声明值关联到已有的虚拟密钥：

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/new \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jwt_claim_name": "email",
    "jwt_claim_value": "user@example.com",
    "key": "sk-virtual-key-from-key-generate"
  }'
```

**列出映射**（分页）：

```bash
curl http://localhost:4000/jwt/key/mapping/list?page=1&size=50 \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**查询指定映射**：

```bash
curl "http://localhost:4000/jwt/key/mapping/info?id=<mapping-id>" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**更新映射**：

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/update \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<mapping-id>",
    "description": "Updated description",
    "is_active": true
  }'
```

**删除映射**：

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/delete \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id": "<mapping-id>"}'
```

### 工作原理

1. 请求携带 JWT bearer 令牌到达
2. LiteLLM 校验 JWT 签名
3. 提取配置的声明（如 `email` → `user@example.com`）
4. 在 `LiteLLM_JWTKeyMapping` 表中查找该声明值
5. 如果存在映射，请求会按使用了对应虚拟密钥来处理，预算、速率限制、模型访问控制和花费追踪全部生效
6. 如果没有映射，则回退到标准 JWT 认证（团队级控制）

### 错误码

| 错误码 | 含义 |
|------|---------|
| 409 | 映射重复：相同声明名称与取值的映射已存在 |
| 400 | 提供的密钥与任何现有虚拟密钥都不匹配 |
| 404 | 未找到映射（更新/删除/查询时） |
| 403 | 非管理员用户尝试执行映射操作 |

## 将 JWT 绑定到已注册的 Agent

在身份提供商中为 Agent 开设身份（例如每个 Agent 一个 Microsoft Entra ID 应用注册），让 LiteLLM 对该 Agent 出示的每个 JWT 强制执行其策略。设置 `agent_id_jwt_field` 后，LiteLLM 会从已验证的令牌中读取该声明，与已注册的 Agent 进行匹配（先按 `agent_id`，再按 `agent_name`），并在认证身份上设置 `agent_id`。凡是绑定到 Agent 的虚拟密钥已有的约束，对 JWT 调用方同样生效：`require_trace_id_on_calls_by_agent`、按 Agent 的 MCP 服务器与工具限制，以及 `agent_id` 花费归属。

### 设置

用身份提供商将要发送的名称注册 Agent。对 Entra 应用令牌来说就是客户端 ID（client id），Entra 把它放在 `azp` 声明（v2 令牌）或 `appid`（v1 令牌）里。

```yaml
agents:
  - agent_name: 2f5c9b1e-6a4d-4c8e-9f0b-7d1a3e5c9b21   # Entra client id of the agent's app registration
    agent_card_params:
      name: research-agent
      url: http://localhost:9999/a2a
      version: "1.0.0"
    litellm_params:
      require_trace_id_on_calls_by_agent: true

general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    agent_id_jwt_field: "azp"   # supports dot notation for nested claims
    team_id_jwt_field: "team"
    user_id_jwt_field: "sub"
```

### 行为

声明能匹配到已注册 Agent 的令牌会绑定到该 Agent 并继承其限制，因此按上面的配置，缺少 `x-litellm-trace-id` 的调用会被 `400` 拒绝。声明匹配不到任何已注册 Agent 的令牌会被 `403` 拒绝，而不会退回到未绑定身份，与未知的 `team_id_jwt_field` 值被拒绝是同一逻辑；管理员权限令牌也不例外。完全不携带该声明的令牌则照旧认证。`agent_id_jwt_field` 未设置时一切不变。

只要令牌带有配置的声明，就会被当作 Agent。Entra 给委托（用户）令牌同样会加 `azp`，因此如果人类用户和 Agent 为同一个受众获取令牌，`azp` 也会把人类调用方一并绑定或拒绝。在这种部署下，请把 `agent_id_jwt_field` 指向只有 Agent 令牌才携带的声明，例如可选声明，或通过 Agent 应用注册上的声明映射策略添加的自定义声明；`azp` 则留给那些 JWT 调用方全部是 Agent 的代理。

如果令牌还通过 [JWT 到虚拟密钥映射](#beta-jwt-到虚拟密钥映射) 映射到了某个虚拟密钥，则使用该映射密钥自身的 `agent_id`，这次请求不再读取 `agent_id_jwt_field`。

## 所有 JWT 参数

[**查看代码**](https://github.com/BerriAI/litellm/blob/b204f0c01c703317d812a1553363ab0cb989d5b6/litellm/proxy/_types.py#L95)

