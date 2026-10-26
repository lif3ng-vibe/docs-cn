# CyberArk Conjur

import Image from '@theme/IdealImage';

<EnterpriseFeature />

| 功能 | 支持 | 说明 |
|---------|----------|-------------|
| 读取密钥 | ✅ | 读取密钥，例如 `OPENAI_API_KEY` |
| 写入密钥 | ✅ | 存储密钥，例如 `Virtual Keys` |
| 删除密钥 | ❌ | 密钥须通过策略更新来移除 |

支持从 [CyberArk Conjur](https://www.cyberark.com/products/secrets-management/)（自托管密钥管理器，secret manager）读取和写入密钥。

**第 1 步.** 在环境中添加 CyberArk Conjur 的连接信息

LiteLLM 支持两种认证方式：

1. API 密钥认证 - `CYBERARK_API_KEY`（推荐）
2. 证书认证 - `CYBERARK_CLIENT_CERT` 和 `CYBERARK_CLIENT_KEY`

```bash title="环境变量" showLineNumbers
CYBERARK_API_BASE="http://your-conjur-instance:8080"
CYBERARK_ACCOUNT="default"
CYBERARK_USERNAME="admin"

# 通过 API 密钥认证（推荐）
CYBERARK_API_KEY="your-api-key-here"

# 或者 - 通过证书认证
CYBERARK_CLIENT_CERT="path/to/client.pem"
CYBERARK_CLIENT_KEY="path/to/client.key"

# 可选
CYBERARK_REFRESH_INTERVAL="300" # 默认 300 秒（5 分钟），token 刷新频率
CYBERARK_SSL_VERIFY="true" # 默认为 true，设为 "false" 可关闭 SSL 校验（用于自签名证书）
```

**第 2 步.** 添加到代理的 config.yaml

```yaml title="代理配置" showLineNumbers
general_settings:
  key_management_system: "cyberark"

  # [可选配置]
  key_management_settings: 
    store_virtual_keys: true # 可选。默认为 False，设为 True 时会把虚拟密钥存入密钥管理器
    prefix_for_stored_virtual_keys: "litellm/" # 可选。设置后，密钥管理器中存储的虚拟密钥会使用该前缀
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
```

**第 3 步.** 启动并测试代理

```bash title="启动代理" showLineNumbers
$ litellm --config /path/to/config.yaml
```

[快速测试代理](../proxy/user_keys)

## 将虚拟密钥写入 CyberArk

在 LiteLLM UI 中创建虚拟密钥（virtual key）后，它会自动存入 CyberArk Conjur。

**第 1 步：** 在 LiteLLM 管理界面（Admin UI）中创建虚拟密钥

本例中我们创建一个名为 `litellm-cyber-ark-secret-key` 的密钥：

<Image img={require('../../img/cyberark1.png')} alt="在 LiteLLM UI 中创建虚拟密钥" />

**第 2 步：** 确认密钥已存入 CyberArk

可以通过查询密钥 API 来确认虚拟密钥已存入 CyberArk：

```bash title="在 CyberArk 中确认密钥" showLineNumbers
TOKEN=$(curl -s -X POST http://0.0.0.0:8080/authn/default/admin/authenticate \
  -d "your-api-key" | base64 | tr -d '\n')

curl -H "Authorization: Token token=\"$TOKEN\"" \
  "http://0.0.0.0:8080/resources/default/variable" | jq .
```

响应结果中可以看到 `litellm-cyber-ark-secret-key` 已存在于 CyberArk：

<Image img={require('../../img/cyberark2.png')} alt="虚拟密钥已存入 CyberArk API" />

虚拟密钥以完整路径存储：`default:variable:litellm/litellm-cyber-ark-secret-key`

## 工作原理

**认证**

CyberArk Conjur 采用两步认证流程：

1. LiteLLM 用你的 API 密钥完成认证，换取会话 token
2. 后续 API 请求都使用该会话 token（base64 编码）
3. token 约 8 分钟后过期，因此 LiteLLM 会自动缓存并刷新

**读取密钥**

LiteLLM 按以下 URL 格式从 CyberArk Conjur 读取密钥：

```
{CYBERARK_API_BASE}/secrets/{ACCOUNT}/variable/{SECRET_NAME}
```

例如，假如你的配置如下：
- `CYBERARK_API_BASE="http://conjur.example.com:8080"`
- `CYBERARK_ACCOUNT="default"`
- 密钥名称：`AZURE_API_KEY`

LiteLLM 会请求：
```
http://conjur.example.com:8080/secrets/default/variable/AZURE_API_KEY
```

**写入密钥**

在 LiteLLM 上创建虚拟密钥时，会自动发生以下动作：

1. LiteLLM 在 Conjur 中创建策略条目来定义该变量（如果尚不存在）
2. LiteLLM 通过 Conjur API 写入密钥值

LiteLLM 将密钥存放在 `prefix_for_stored_virtual_keys` 路径下（默认为 `litellm/`）

例如，某个虚拟密钥会存储为：`litellm/virtual-key-name`

**注意事项**

- 在写入变量值之前，必须先在 Conjur 策略中定义该变量
- 写入新密钥时，LiteLLM 会自动创建对应的策略条目
- 带斜杠的密钥名称（例如 `litellm/key`）会自动进行 URL 编码
- 会话 token 默认缓存 5 分钟，以尽量减少 API 调用

## 故障排查

如果 LiteLLM 集成出现问题，请先确认你的 CyberArk Conjur 实例本身工作正常。可以直接对 CyberArk 端点运行以下 curl 命令，验证连通性和认证：

**第 1 步：认证并获取 token**

把 `http://conjur.example.com:8080` 替换为你的 `CYBERARK_API_BASE`，并使用真实的凭据：

```bash title="认证" showLineNumbers
TOKEN=$(curl -s -X POST http://conjur.example.com:8080/authn/default/admin/authenticate \
  -d "your-api-key" | base64 | tr -d '\n')
```

**第 2 步：测试读取密钥**

```bash title="读取密钥" showLineNumbers
curl -H "Authorization: Token token=\"$TOKEN\"" \
  "http://conjur.example.com:8080/secrets/default/variable/test-secret"
```

**第 3 步：测试写入密钥**

```bash title="写入密钥" showLineNumbers
curl -X POST \
  -H "Authorization: Token token=\"$TOKEN\"" \
  --data "my-secret-value" \
  "http://conjur.example.com:8080/secrets/default/variable/test-secret"
```

如果这些命令在你的 CyberArk 实例上都能成功执行，说明 CyberArk 本身没问题，问题出在 LiteLLM 配置上。请检查：
- 环境变量是否设置正确
- LiteLLM 实例能否访问 `CYBERARK_API_BASE` 对应的 URL
- 你的 API 密钥或证书在 CyberArk 中是否具备所需权限

### SSL 证书错误

如果遇到类似下面的 SSL 证书校验错误：

```
RuntimeError: Could not authenticate to CyberArk Conjur: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self-signed certificate in certificate chain
```

这通常是 CyberArk Conjur 实例使用了自签名证书导致的。可以通过以下设置关闭 SSL 校验：

```bash
CYBERARK_SSL_VERIFY="false"
```

:::warning
关闭 SSL 校验并不安全，只应在使用自签名证书的测试或开发环境中这样做。生产环境请正确配置证书链，或改用 `CYBERARK_CLIENT_CERT` 和 `CYBERARK_CLIENT_KEY` 进行证书认证。
:::

## 视频演示

这段视频演示了如何在 LiteLLM 中把 CyberArk Conjur 用作密钥管理器：先在 LiteLLM 管理界面中创建虚拟密钥并确认它已存入 CyberArk，然后轮换密钥，再次确认新密钥已存入 CyberArk。

<iframe width="840" height="500" src="https://www.loom.com/embed/e9892ae6cb9545d1b709b82e8695db91" frameBorder="0" allowFullScreen></iframe>
