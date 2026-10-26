import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SSL 与 HTTP 代理安全设置

如果你的环境使用的是较旧的 TTS 打包依赖和旧版加密方案，请参照本指南。默认情况下，LiteLLM 使用 certifi 的 CA 证书包进行 SSL 验证，它兼容绝大多数现代服务器；但如果需要禁用 SSL 验证或改用自定义 CA 证书包，按下面的步骤配置即可。

请注意，环境变量的优先级高于 SDK 中的设置。

除非另有说明，LiteLLM 的网络请求均由 HTTPX 发起。

## 1. 自定义 CA 证书包

可以通过 `SSL_CERT_FILE` 环境变量设置自定义 CA 证书包的文件路径，也可以直接给 ssl_verify 设置传入一个字符串。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_verify = "client.pem"
```
</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml
litellm_settings:
  ssl_verify: "client.pem"
```

</TabItem>  
<TabItem value="env_var" label="环境变量">

```bash
export SSL_CERT_FILE="client.pem"
```
</TabItem>
</Tabs>

## 2. 禁用 SSL 验证


<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_verify = False
```
</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml
litellm_settings:
  ssl_verify: false
```

</TabItem>  
<TabItem value="env_var" label="环境变量">

```bash
export SSL_VERIFY="False"
```
</TabItem>
</Tabs>

## 3. 调低安全等级

`ssl_security_level` 用于为 SSL 连接设置更低的安全等级。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_security_level = "DEFAULT@SECLEVEL=1"
```
</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml
litellm_settings:
  ssl_security_level: "DEFAULT@SECLEVEL=1"
```
</TabItem>
<TabItem value="env_var" label="环境变量">

```bash
export SSL_SECURITY_LEVEL="DEFAULT@SECLEVEL=1"
```
</TabItem>
</Tabs>

## 4. 证书认证

通过 `SSL_CERTIFICATE` 环境变量或 `ssl_certificate` 属性，可以指定客户端证书，向服务器证明客户端身份。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_certificate = "/path/to/certificate.pem"
```
</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml
litellm_settings:
  ssl_certificate: "/path/to/certificate.pem"
```
</TabItem>
<TabItem value="env_var" label="环境变量">

```bash
export SSL_CERTIFICATE="/path/to/certificate.pem"
```

</TabItem>
</Tabs>

## 5. 配置 ECDH 曲线以优化 SSL/TLS 性能

`ssl_ecdh_curve` 设置用于指定 SSL/TLS 密钥交换所用的椭圆曲线迪菲-赫尔曼（ECDH）曲线。在不需要后量子密码学（PQC）的环境里，用这一设置把 PQC 关掉以提升性能，尤其实用。

**典型场景**：部分 OpenSSL 3.x 系统默认启用 PQC，会拖慢 TLS 握手。把 ECDH 曲线设为 `X25519` 即可禁用 PQC，连接性能会有明显提升。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm.ssl_ecdh_curve = "X25519"  # Disables PQC for better performance
```

</TabItem>
<TabItem value="proxy" label="代理服务器">

```yaml
litellm_settings:
  ssl_ecdh_curve: "X25519"
```

</TabItem>  
<TabItem value="env_var" label="环境变量">

```bash
export SSL_ECDH_CURVE="X25519"
```

</TabItem>
</Tabs>

**常用有效曲线**：

- `X25519` - 现代、高速的曲线（推荐用于禁用 PQC）
- `prime256v1` - NIST P-256 曲线
- `secp384r1` - NIST P-384 曲线
- `secp521r1` - NIST P-521 曲线

**注意**：如果曲线名无效，或你的 Python/OpenSSL 版本不支持该特性，LiteLLM 会记录一条警告，并继续使用默认曲线。

## 6. 使用 HTTP_PROXY 环境变量

无论是默认的 aiohttp 传输层，还是 httpx 传输层（`DISABLE_AIOHTTP_TRANSPORT=True`），也不管有没有开启 `force_ipv4`，LiteLLM 在每一次 LLM 请求时都会从环境中解析 `HTTP_PROXY`、`HTTPS_PROXY` 和 `NO_PROXY`。无需额外开关，只要在代理或 SDK 启动前设好这些变量即可：

<Tabs>
<TabItem value="sdk" label="SDK">

```bash
export HTTPS_PROXY='http://username:password@proxy_uri:port'
export NO_PROXY='localhost,127.0.0.1'
```
</TabItem>

<TabItem value="proxy" label="代理服务器">

```bash
export HTTPS_PROXY='http://username:password@proxy_uri:port'
export NO_PROXY='localhost,127.0.0.1'
```
</TabItem>
</Tabs>

设置 `DISABLE_AIOHTTP_TRUST_ENV=True`（或 `litellm.disable_aiohttp_trust_env = True`）可让 aiohttp 传输层忽略这些变量。`AIOHTTP_TRUST_ENV`（或 `litellm.aiohttp_trust_env`）与代理选择无关：它只是向 aiohttp 会话传入 `trust_env=True`，让 aiohttp 自己额外读取 `~/.netrc` 与 `SSL_CERT_FILE` / `SSL_CERT_DIR`。
## 7. 按服务设置 SSL 验证

LiteLLM 允许针对特定服务或提供商（provider）调用单独覆盖 SSL 验证设置。当不同服务需要不同的 CA 证书时，例如内部防护栏（guardrail）与公开的 LLM 提供商各需一套证书，这一功能就很有用。

### Bedrock（SDK）
可以直接在 `completion` 调用中传入 `ssl_verify`。

```python
import litellm

response = litellm.completion(
    model="bedrock/us.anthropic.{{anthropic}}",
    messages=[{"role": "user", "content": "hi"}],
    ssl_verify="path/to/bedrock_cert.pem" # Or False to disable
)
```

### AIM 防护栏（代理）
可以在 `config.yaml` 中为每条防护栏单独配置 `ssl_verify`。

```yaml
guardrails:
  - guardrail_name: aim-protected-app
    litellm_params:
      guardrail: aim
      ssl_verify: "/path/to/aim_cert.pem" # Use specific cert for AIM
```

### Cato Networks 防护栏（代理）
可以在 `config.yaml` 中为每条防护栏单独配置 `ssl_verify`。

```yaml
guardrails:
  - guardrail_name: cato-protected-app
    litellm_params:
      guardrail: cato_networks
      ssl_verify: "/path/to/cato_cert.pem" # Use specific cert for AIM
```

### 优先级规则
LiteLLM 按以下优先级解析 `ssl_verify`：
1. **显式参数**：在 `completion()` 或防护栏配置中传入。
2. **环境变量**：`SSL_VERIFY` 环境变量。
3. **全局设置**：`litellm.ssl_verify` 设置。
4. **系统标准**：`SSL_CERT_FILE` 环境变量。
