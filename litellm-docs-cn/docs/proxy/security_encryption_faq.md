# LiteLLM 自托管安全与加密 FAQ

## 传输中的数据加密

### 产品是否加密传输中的数据？

**是的**，LiteLLM 使用 TLS/SSL 加密传输中的数据。

### 开源版和企业版都可用吗？

**是的**，开源版和企业版均提供 TLS 加密。

### 调用客户端与产品之间的传输？

**是的**，通过配置 SSL 证书即可支持 HTTPS/TLS。

**配置方法**：
```bash
# CLI
litellm --ssl_keyfile_path /path/to/key.pem --ssl_certfile_path /path/to/cert.pem

# Environment Variables
export SSL_KEYFILE_PATH="/path/to/key.pem"
export SSL_CERTFILE_PATH="/path/to/cert.pem"
```

**文档参考**：`docs/my-website/docs/guides/security_settings.md`

### 产品与 LLM 提供商之间的传输？

**是的**，所有发往 LLM 提供商的连接默认都走 TLS 加密。

**实现细节**：
- 使用 Python 的 `ssl.create_default_context()`
- 使用启用了 SSL/TLS 的 HTTPX 与 aiohttp 库
- SSL 校验默认使用 certifi 的 CA 证书包

**代码参考**：`litellm/llms/custom_httpx/http_handler.py`（第 43-105 行）

### 与 LLM 提供商的 TCP 会话是共享的吗？

**是的**，TCP 连接会进入连接池并复用。

**详情**：
- 连接池默认开启
- 默认最多 1000 个并发连接，并启用 keepalive
- 对同一提供商的多次请求之间会维持会话
- 降低 TLS 握手开销

**代码参考**：`litellm/llms/custom_httpx/http_handler.py`（第 704-712 行）

### 还是说每次顺序调用都会和同一个 LLM 提供商重新协商 TLS 会话？

**不是**，TLS 会话通过连接池复用，不会每个请求都重新做一次 TLS 握手。

### 它是如何加密的？

**TLS 1.2 和 TLS 1.3**

使用 Python 默认的 SSL 上下文，同时支持 TLS 1.2 和 TLS 1.3。实际协商出哪个版本取决于：
- Python 版本
- 系统 SSL 库（通常是 OpenSSL）
- 服务端能力

**实现方式**：Python 的 `ssl.create_default_context()`

### 这些证书如何加入产品配置？

#### x.509 证书

**方式 1：CLI 参数**
```bash
litellm --ssl_certfile_path /path/to/certificate.pem
```

**方式 2：环境变量**
```bash
export SSL_CERTFILE_PATH="/path/to/certificate.pem"
```

#### 私钥

**方式 1：CLI 参数**
```bash
litellm --ssl_keyfile_path /path/to/private_key.pem
```

**方式 2：环境变量**
```bash
export SSL_KEYFILE_PATH="/path/to/private_key.pem"
```

#### 证书捆绑包/证书链

**客户端到代理的连接**：
使用标准的 SSL 证书配置，把中间证书一并打进 certfile。

**代理到 LLM 提供商的连接**：

**方式 1：YAML 配置**
```yaml
litellm_settings:
  ssl_verify: "/path/to/ca_bundle.pem"
```

**方式 2：环境变量**
```bash
export SSL_CERT_FILE="/path/to/ca_bundle.pem"
```

**方式 3：客户端证书认证**
```yaml
litellm_settings:
  ssl_certificate: "/path/to/client_certificate.pem"
```

或

```bash
export SSL_CERTIFICATE="/path/to/client_certificate.pem"
```

### 文档覆盖情况

**主要文档**：
- `docs/my-website/docs/guides/security_settings.md`：SSL/TLS 配置指南

**其他参考**：
- `litellm/proxy/proxy_cli.py`（第 455-467 行）：CLI 选项
- `docs/my-website/docs/completion/http_handler_config.md`：自定义 HTTP 处理器配置

---

## 静态数据加密

### 产品是否加密静态数据？

**部分加密**。只有特定的敏感数据才会加密存放。

### 哪些数据以加密形式存储？

#### 已加密的数据
1. **LLM API 密钥**：`LiteLLM_ProxyModelTable.litellm_params` 中的模型凭证
2. **提供商凭证**：存放在 `LiteLLM_CredentialsTable.credential_values`
3. **配置中的敏感信息**：`LiteLLM_Config` 表里的敏感配置值
4. **虚拟密钥（virtual key）**：使用密钥管理器（secret managers）时才加密，属可选功能

#### 未加密的数据
1. **花费日志**：`LiteLLM_SpendLogs` 中的请求/响应数据
2. **审计日志**：`LiteLLM_AuditLog` 中的变更历史
3. **用户/团队/组织数据**：元数据与配置信息
4. **缓存的提示词与补全**：缓存数据以明文存放

### 缓存的提示词与补全？

**没有**，缓存的提示词与补全**未做加密**。

缓存后端（Redis、S3、本地磁盘）都以明文 JSON 存放数据。

**代码参考**：
- `litellm/caching/redis_cache.py`
- `litellm/caching/s3_cache.py`
- `litellm/caching/caching.py`

### 配置数据？

**部分加密**。

#### 已加密的部分
- 模型配置中的 LLM API 密钥与凭证
- `LiteLLM_Config` 表中的敏感值
- `LiteLLM_CredentialsTable` 中的凭证值

#### 未加密的部分
- 模型名称与别名
- 速率限制与预算设置
- 用户/团队/组织元数据
- 非敏感的配置参数

**代码参考**：`litellm/proxy/management_endpoints/model_management_endpoints.py`（第 275-308 行）

### 日志数据？

**没有**，日志数据**未做加密**。

写入数据库表的日志都是明文：
- `LiteLLM_SpendLogs`：包含请求/响应数据、token 数与花费金额
- `LiteLLM_ErrorLogs`：错误信息
- `LiteLLM_AuditLog`：变更审计记录

**注意**：若不想让敏感数据落库，可以关闭日志：

```yaml
general_settings:
  disable_spend_logs: True   # Disable writing spend logs to DB
  disable_error_logs: True   # Disable writing error logs to DB
```

**文档**：`docs/my-website/docs/proxy/db_info.md`（第 52-60 行）

### 数据存在哪里？

#### 数据库里？

**是的**，加密数据存储在 PostgreSQL 数据库中。

**存放加密数据的关键表**：
- `LiteLLM_ProxyModelTable`：模型配置，其中的 API 密钥已加密
- `LiteLLM_CredentialsTable`：凭证值
- `LiteLLM_Config`：配置中的敏感信息

**Schema 参考**：`schema.prisma`

#### 文件系统里？

**不会**，默认情况下加密数据不落在文件系统上。

**注意**：如果使用磁盘缓存（`disk_cache_dir`），缓存数据是不加密存放的。

#### 其他位置？

**可选**：使用密钥管理器（如 AWS Secrets Manager、Azure Key Vault、HashiCorp Vault）时，加密数据也可以改存到外部。

**配置方法**：
```yaml
general_settings:
  key_management_system: "aws_secret_manager"  # or "azure_key_vault", "hashicorp_vault"
```

**文档**：`docs/my-website/docs/secret.md`

### 它是如何加密的？

**算法**：NaCl SecretBox（XSalsa20-Poly1305 AEAD）

**并非 AES-256**。LiteLLM 使用的是 NaCl（Networking and Cryptography library），它提供：
- XSalsa20 流密码
- 用于认证的 Poly1305 MAC
- 与 AES-256 相当的安全性

**密钥派生**：
1. 读取 `LITELLM_SALT_KEY`（未设置时回退到 `LITELLM_MASTER_KEY`）
2. 用 SHA-256 哈希，派生出 256 位加密密钥
3. 用 NaCl SecretBox 做认证加密

**代码参考**：`litellm/proxy/common_utils/encrypt_decrypt_utils.py`（第 69-112 行）

**实现代码**：
```python
import hashlib
import nacl.secret

# Derive 256-bit key from salt
hash_object = hashlib.sha256(signing_key.encode())
hash_bytes = hash_object.digest()

# Create SecretBox and encrypt
box = nacl.secret.SecretBox(hash_bytes)
encrypted = box.encrypt(value_bytes)
```

### 设置加密密钥

**必需的环境变量**：
```bash
export LITELLM_SALT_KEY="your-strong-random-key-here"
```

**重要提示**：
- **必须在添加任何模型之前设置好**
- **绝不要更换这把密钥**，否则已加密的数据将无法恢复
- 使用足够强的随机密钥（推荐：https://1password.com/password-generator/）
- 未设置时回退到 `LITELLM_MASTER_KEY`

**文档**：`docs/my-website/docs/proxy/prod.md`（第 8 节，第 184-196 行）

### 文档覆盖情况

**主要文档**：
- `docs/my-website/docs/proxy/prod.md`（第 8 节）：LITELLM_SALT_KEY 设置
- `docs/my-website/docs/secret.md`：密钥管理系统
- `docs/my-website/docs/proxy/db_info.md`：数据库信息

**其他参考**：
- `security.md`：通用安全措施
- `docs/my-website/docs/data_security.md`：数据隐私概览
- `schema.prisma`：含加密字段的数据库 Schema

---

## 安全特性小结

### 开箱即用的安全能力

1. 客户端到代理连接的 **TLS/SSL 加密**
2. 代理到 LLM 提供商连接的 **TLS 加密**（带连接池）
3. LLM API 密钥与凭证**加密存储**
4. **支持 TLS 1.2 和 TLS 1.3**
5. 用**连接池**降低 TLS 握手开销

### 重要限制

1. **缓存数据不加密**（Redis、S3、磁盘缓存）
2. **日志数据不加密**（花费日志、审计日志）
3. **日志中的请求/响应负载不加密**
4. **使用 NaCl SecretBox 而非 AES-256**（安全性相当）
5. **未显式配置 TLS 版本**，沿用 Python/系统默认值

### 配置要求

**生产部署需要做的**：

1. 添加任何模型之前先**设置 LITELLM_SALT_KEY**
2. 为 HTTPS 客户端连接**配置 SSL 证书**
3. 日志若含敏感数据，考虑**关闭日志**
4. 使用**密钥管理器**增强安全性（可选）
5. 使用自定义证书时**配置 CA 证书包**

---

## 快速上手安全清单

```bash
# 1. Generate a strong salt key
export LITELLM_SALT_KEY="$(openssl rand -base64 32)"

# 2. Set up SSL certificates (for HTTPS)
export SSL_KEYFILE_PATH="/path/to/private_key.pem"
export SSL_CERTFILE_PATH="/path/to/certificate.pem"

# 3. Configure database
export DATABASE_URL="postgresql://user:password@host:port/dbname"

# 4. (Optional) Disable logs if they contain sensitive data
# Add to config.yaml:
# general_settings:
#   disable_spend_logs: True
#   disable_error_logs: True

# 5. Start LiteLLM Proxy
litellm --config config.yaml
```

---

## 更多资源

- **LiteLLM 文档**：https://docs.litellm.ai/
- **安全设置指南**：https://docs.litellm.ai/docs/guides/security_settings
- **生产部署**：https://docs.litellm.ai/docs/proxy/prod
- **密钥管理**：https://docs.litellm.ai/docs/secret

安全方面的问题请联系：support@berri.ai
