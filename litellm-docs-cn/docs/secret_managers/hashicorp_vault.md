import Image from '@theme/IdealImage';

# Hashicorp Vault

<EnterpriseFeature />

| 功能 | 支持情况 | 说明 |
|---------|----------|-------------|
| 读取密钥 | ✅ | 读取密钥，例如 `OPENAI_API_KEY` |
| 写入密钥 | ✅ | 存储密钥，例如 `Virtual Keys` |
| Hashicorp Vault 认证方式 | ✅ | AppRole、TLS 证书、Token |

从 [Hashicorp Vault](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2) 读取密钥。

**第 1 步**：在环境中添加 Hashicorp Vault 的相关配置

LiteLLM 支持三种认证方式：

1. AppRole 认证（推荐）：环境变量 `HCP_VAULT_APPROLE_ROLE_ID` 和 `HCP_VAULT_APPROLE_SECRET_ID`
2. TLS 证书认证：环境变量 `HCP_VAULT_CLIENT_CERT` 和 `HCP_VAULT_CLIENT_KEY`
3. Token 认证：环境变量 `HCP_VAULT_TOKEN`

```bash
HCP_VAULT_ADDR="https://test-cluster-public-vault-0f98180c.e98296b2.z1.hashicorp.cloud:8200"
HCP_VAULT_NAMESPACE="admin" # OPTIONAL. Vault Enterprise namespace for both login and secret operations
HCP_VAULT_LOGIN_NAMESPACE="admin" # OPTIONAL. Namespace for AppRole / TLS cert login only. Defaults to HCP_VAULT_NAMESPACE
HCP_VAULT_SECRET_NAMESPACE="admin/teams/team-a" # OPTIONAL. Namespace for secret reads and writes only. Defaults to HCP_VAULT_NAMESPACE

# Authentication via AppRole (recommended)
HCP_VAULT_APPROLE_ROLE_ID="your-role-id"
HCP_VAULT_APPROLE_SECRET_ID="your-secret-id"
HCP_VAULT_APPROLE_MOUNT_PATH="approle" # OPTIONAL. defaults to "approle"

# OR - Authentication via TLS cert
HCP_VAULT_CLIENT_CERT="path/to/client.pem"
HCP_VAULT_CLIENT_KEY="path/to/client.key"

# OR - Authentication via token
HCP_VAULT_TOKEN="hvs.CAESIG52gL6ljBSdmq*****"


# OPTIONAL
HCP_VAULT_REFRESH_INTERVAL="86400" # defaults to 86400, frequency of cache refresh for Hashicorp Vault
HCP_VAULT_MOUNT_NAME="secret" # OPTIONAL. defaults to "secret", set this if your KV engine is mounted elsewhere
HCP_VAULT_PATH_PREFIX="litellm" # OPTIONAL. defaults to None, set this if your secrets live under a custom prefix like secret/data/litellm/OPENAI_API_KEY
```

**第 2 步**：添加到代理的 config.yaml 中

```yaml
general_settings:
  key_management_system: "hashicorp_vault"

  # [OPTIONAL SETTINGS]
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
```

**第 3 步**：启动并测试代理

```
$ litellm --config /path/to/config.yaml
```

[快速测试代理](../proxy/user_keys)


## 认证方式

LiteLLM 为 Hashicorp Vault 提供三种认证方式，优先级如下：

1. **AppRole**：生产环境推荐使用
2. **TLS 证书**：基于证书的认证
3. **Token**：直接使用 token 认证

### 1. AppRole 认证

设置 AppRole 认证的步骤：

1. 在 Vault 中启用 AppRole 认证：
```bash
vault auth enable approle
```

2. 为 LiteLLM 创建策略和角色：
```bash
# Create a policy file (litellm-policy.hcl)
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Apply the policy
vault policy write litellm-policy litellm-policy.hcl

# Create an AppRole
vault write auth/approle/role/litellm \
    token_policies="litellm-policy" \
    token_ttl=32d \
    token_max_ttl=32d
```

3. 获取你的 Role ID 和 Secret ID：
```bash
# Get Role ID
vault read auth/approle/role/litellm/role-id

# Generate Secret ID
vault write -f auth/approle/role/litellm/secret-id
```

4. 设置环境变量：
```bash
export HCP_VAULT_APPROLE_ROLE_ID="your-role-id"
export HCP_VAULT_APPROLE_SECRET_ID="your-secret-id"
```

### 2. TLS 证书认证

TLS 证书认证使用客户端证书与 Vault 进行双向 TLS（mutual TLS）认证。

**环境变量**：
```bash
export HCP_VAULT_CLIENT_CERT="path/to/client.pem"
export HCP_VAULT_CLIENT_KEY="path/to/client.key"
export HCP_VAULT_CERT_ROLE="your-cert-role"  # Optional
```

**工作方式**：
- LiteLLM 使用客户端证书和私钥完成双向 TLS 认证
- Vault 校验证书后签发一个临时 token
- 该 token 在其租期（lease）内会被缓存

### 3. Token 认证

直接 token 认证使用一个静态的 Vault token。

**环境变量**：
```bash
export HCP_VAULT_TOKEN="hvs.CAESIG52gL6ljBSdmq*****"
```

## 命名空间

在 Vault Enterprise 上，LiteLLM 会在两个地方携带命名空间（namespace）：AppRole 或 TLS 证书登录请求中的 `X-Vault-Namespace` 请求头，以及每次读取、写入、轮换和删除密钥时 URL 中的路径段。`HCP_VAULT_NAMESPACE` 会同时设置这两者。如果 LiteLLM 登录所用的角色与其管理的密钥分属不同命名空间，可以用 `HCP_VAULT_LOGIN_NAMESPACE` 和 `HCP_VAULT_SECRET_NAMESPACE` 分别指定。这两个变量未设置时都会回退到 `HCP_VAULT_NAMESPACE`，因此现有部署的行为完全不变。这三个配置项同样出现在管理界面（Admin UI）的 Settings > Admin Settings > Hashicorp Vault 下，分别对应 Namespace、Login Namespace 和 Secret Namespace。

举个例子：某个 AppRole 定义在顶层 `admin` 命名空间中，可访问其下所有团队命名空间，团队的虚拟密钥和提供商密钥都存放在 `admin/teams/team-a` 之下：

```bash
HCP_VAULT_ADDR="https://vault.example.com:8200"
HCP_VAULT_LOGIN_NAMESPACE="admin"
HCP_VAULT_SECRET_NAMESPACE="admin/teams/team-a"
HCP_VAULT_APPROLE_ROLE_ID="your-role-id"
HCP_VAULT_APPROLE_SECRET_ID="your-secret-id"
```

采用上述配置后，登录请求是 `POST https://vault.example.com:8200/v1/auth/approle/login`，带有 `X-Vault-Namespace: admin` 请求头；而读取 `OPENAI_API_KEY` 会请求 `GET https://vault.example.com:8200/v1/admin/teams/team-a/secret/data/OPENAI_API_KEY`，只带 `X-Vault-Token` 请求头。Vault 以省略请求头的方式指代根命名空间，因此要在根命名空间登录、同时读取团队密钥，只需不设置 `HCP_VAULT_LOGIN_NAMESPACE` 和 `HCP_VAULT_NAMESPACE`，仅设置 `HCP_VAULT_SECRET_NAMESPACE`。密钥请求从不携带命名空间请求头，URL 是判断密钥所在命名空间的唯一依据。按团队设置的 `namespace` 覆盖（参见 [团队级覆盖配置](#团队级覆盖配置)）会在该团队的密钥上取代 `HCP_VAULT_SECRET_NAMESPACE`，且从不影响登录。

## 工作原理

**读取密钥**

LiteLLM 按照以下 URL 格式从 Hashicorp Vault 的 KV v2 引擎读取密钥：
```
{VAULT_ADDR}/v1/{NAMESPACE}/{MOUNT_NAME}/data/{PATH_PREFIX}/{SECRET_NAME}
```

例如，假设配置如下：
- `HCP_VAULT_ADDR="https://vault.example.com:8200"`
- `HCP_VAULT_NAMESPACE="admin"`
- `HCP_VAULT_MOUNT_NAME="secret"`
- `HCP_VAULT_PATH_PREFIX="litellm"`
- 密钥名称：`AZURE_API_KEY`


LiteLLM 将查询以下地址：
```
https://vault.example.com:8200/v1/admin/secret/data/litellm/AZURE_API_KEY
```

### 密钥的预期格式

LiteLLM 要求所有密钥都以 JSON 对象的形式存储，其中包含一个 `key` 字段来存放密钥的值。

例如，`AZURE_API_KEY` 对应的密钥应存储为：

```json
{
  "key": "sk-<virtual-key>"
}
```

<Image img={require('../../img/hcorp.png')} />

**写入密钥**

在 LiteLLM 上创建或删除虚拟密钥（virtual key）时，LiteLLM 会自动在 Hashicorp Vault 中创建或删除对应的密钥。

- 通过 LiteLLM 管理界面（Admin UI）或 API 创建虚拟密钥

<Image img={require('../../img/hcorp_create_virtual_key.png')} />


- 到 Hashicorp Vault 中查看密钥

LiteLLM 会把密钥存放在 `prefix_for_stored_virtual_keys` 路径下（默认为 `litellm/`）

<Image img={require('../../img/hcorp_virtual_key.png')} />

### 团队级覆盖配置

运行 LiteLLM 代理时，你可以按团队覆盖 Vault 的存储位置。在仪表板（dashboard）中使用 [团队级密钥管理器设置](./overview.md#团队级密钥管理器设置) 流程，并配置下图所示的面板：

<Image img={require('../../img/secret_manager_hashicorp_vault_settings.png')} />

JSON 负载（payload）采用以下结构：

```json
{
  "namespace": "teams/team-a",
  "mount": "kv-prod",
  "path_prefix": "virtual-keys",
  "data": "password"
}
```

- `namespace`：覆盖密钥 URL 中的密钥命名空间（即 `HCP_VAULT_SECRET_NAMESPACE`，未设置时为 `HCP_VAULT_NAMESPACE`）。登录始终使用登录命名空间。
- `mount`：要使用的 KV 引擎挂载点（默认为 `secret`）。
- `path_prefix`：挂载点与密钥名称之间的附加路径段。
- `data`：KV 负载中的字段名（默认为 `key`）。

每当 LiteLLM 为该团队存储或删除虚拟密钥时，都会应用这些覆盖项，这样每个团队的凭据都可以放在各自的命名空间、挂载点或字段布局中，而无需改动全局 Vault 配置。
