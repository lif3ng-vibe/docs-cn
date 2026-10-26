import Image from '@theme/IdealImage';

# 插件

插件（Plugins）让外部服务以可选模式的形式出现在 LiteLLM UI 侧边栏中，与 AI 网关（AI Gateway）并列。每个插件作为独立的后端运行；LiteLLM 把请求代理给它，注入一个范围受限的凭证，并向 iframe 下发一份短时效的身份声明（identity claim），用户因此无需重复认证。

当你想把一个内部工具（报表 UI、Agent 控制平面、数据标注应用等）放到 LiteLLM 仪表板之下，又不想把调用方的主密钥（master key）泄露给该工具时，这个功能就派上用场。

<Image img={require('../../img/plugins_dropdown.png')} />

选中某个插件后，AI 网关的导航会被替换成插件自己的导航；下图是加载在 LiteLLM 仪表板框架内的一个 Agent Control Plane 插件页面。

<Image img={require('../../img/plugins_loaded.png')} />

:::info

自 v1.89.3 起可用。

:::

## 快速上手

### 1. 在 `config.yaml` 中注册插件

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  plugins:
    - name: my-plugin              # unique identifier, no spaces
      display_name: My Plugin      # label shown in the UI dropdown
      url: "https://my-plugin.example.com"
      plugin_key: "sk-plugin-..."  # plugin's own auth credential
```

代理转发给插件的每个请求都会注入 `plugin_key`，形如 `Authorization: Bearer <plugin_key>`。调用方的 LiteLLM 凭证会先被剥离，因此插件永远不会收到真实有效的 LiteLLM API 密钥。

也可以在仪表板中添加插件，路径是 **Admin Settings > Plugins**。字段含义相同；`plugin_key` 是只写字段，保存后 API 不会返回它。

<Image img={require('../../img/plugins_add_modal.png')} />

### 2. 实现两个插件端点

插件服务必须暴露两个公开端点。`GET /api/plugin-manifest` 返回插件元数据，LiteLLM UI 用它渲染侧边栏；`POST /api/plugin-auth` 负责解密 LiteLLM 下发给 iframe 的身份声明，让用户不必登录两次。

最简 manifest 示例：

```json
{
  "name": "my-plugin",
  "display_name": "My Plugin",
  "version": "1.0.0",
  "nav_items": [
    { "key": "home",    "label": "Home",    "icon": "HomeOutlined",    "path": "/" },
    { "key": "reports", "label": "Reports", "icon": "BarChartOutlined", "path": "/reports" }
  ],
  "capabilities": ["reports", "data"]
}
```

对于 `POST /api/plugin-auth`，iframe 会转发一段 `session_claim` 密文。代理从不与插件共享 `LITELLM_SALT_KEY`，而是为每个插件单独派生一把专属密钥，派生方式为 `HMAC-SHA256(LITELLM_SALT_KEY, plugin_name)`。在代理主机上计算一次，把结果作为机密（secret）交给你的插件（例如命名为 `PLUGIN_AUTH_KEY`）：

```bash
python -c 'import base64,hmac,hashlib,os; \
print(base64.urlsafe_b64encode(hmac.new(os.environ["LITELLM_SALT_KEY"].encode(), b"my-plugin", hashlib.sha256).digest()).decode())'
```

一个被攻破的插件即使只持有这把范围受限的密钥，也无法反推出 `LITELLM_SALT_KEY`，也无法解密 LiteLLM 的其他机密。

在插件中解密并校验这份声明：

```python
import json, os, time
from cryptography.fernet import Fernet

_CLAIM_TTL_SECONDS = 30

def plugin_auth(session_claim: str) -> dict:
    cipher = Fernet(os.environ["PLUGIN_AUTH_KEY"].encode())
    claim = json.loads(cipher.decrypt(session_claim.encode(), ttl=_CLAIM_TTL_SECONDS))
    if claim.get("plugin") != "my-plugin":
        raise ValueError("claim audience mismatch")
    if int(claim.get("exp", 0)) < int(time.time()):
        raise ValueError("claim expired")
    return claim
```

声明的负载为 `{ "plugin", "user_id", "user_role", "exp" }`，其中不携带任何 LiteLLM bearer token。用 `user_id` 和 `user_role` 建立插件自己的会话；插件回调 LiteLLM 的 API 请求则通过 `/plugin-proxy/<name>/*` 反向代理认证，它会替你注入 `plugin_key`。

## 插件能获取到哪些用户信息

LiteLLM 转发的用户上下文刻意保持最小化。插件永远看不到调用方的邮箱、密钥别名、团队、预算或 bearer token，只能拿到一个标识符和一个角色。

解密后的 `session_claim` 负载恰好只有四个字段：

```json
{
  "plugin": "my-plugin",
  "user_id": "user_abc123",
  "user_role": "proxy_admin",
  "exp": 1750460400
}
```

`plugin` 是这份声明签发给的插件名。在信任其余字段之前，务必先核对它与自己的插件一致，这样某个插件的声明就无法被重放到另一个插件上。`user_id` 是调用方在 LiteLLM 内部的用户标识；如果需要查询用户资料，可以用它作为稳定的关联键去对接 LiteLLM 的 `/user/info`。`user_role` 是调用方的 LiteLLM 角色字符串（例如 `proxy_admin`、`internal_user` 或 `internal_user_viewer`）；把它当作粗粒度的授权提示即可，随后仍要执行你自己的校验。`exp` 是一个设为 30 秒之后的 Unix 时间戳；Fernet 的 `ttl` 参数已经会拒绝过期的密文，但独立校验 `exp` 还能捕获代理与插件之间的时钟偏差。

当代理无法解析出 `user_id` 和 `user_role` 时（例如调用方未认证），两者的默认值都是空字符串 `""`。应把空字符串视为未认证；角色缺失时不要授予提权访问。

代理每次调用 `/plugin-proxy/<name>/<path>` 访问插件后端时，都会以两个请求头转发同一份身份信息：

```
x-litellm-user-id: user_abc123
x-litellm-user-role: proxy_admin
```

这两个请求头仅作参考。插件仍应基于自己的会话（由校验通过的 `session_claim` 签发）来认证请求，而不是相信这些它无法独立验证的请求头。

## iframe 鉴权的工作原理

```
LiteLLM UI
  GET /api/plugins/auth-token        -> { session_claim }
  postMessage({ type:"litellm-auth", session_claim }, pluginOrigin)
       |
       v
Plugin iframe (browser)
  POST /api/plugin-auth { session_claim }
       |
       v
Plugin server
  decrypt(session_claim, PLUGIN_AUTH_KEY) -> { user_id, user_role, exp }
  establish plugin session -> stored in sessionStorage
```

LiteLLM 的 bearer token 从不离开代理。声明只传递调用方的身份，且 30 秒后即过期；即便 `postMessage` 被拦截，拿到的密文在没有插件专属密钥的情况下也毫无用处。

## 代理路由

`GET /api/plugins` 列出已注册的插件，返回每个插件的 `name`、`display_name` 和 `url`。`plugin_key` 永不返回，只保留在服务端。调用方必须经过认证。

`GET /api/plugins/auth-token?plugin_name=<name>` 返回指定插件的一段短时效加密身份声明。它要求代理上已设置 `LITELLM_SALT_KEY`（否则返回 503），且该插件已注册（否则返回 404）。

`ANY /plugin-proxy/{name}/{path}` 是通往插件后端、需要认证的反向代理。仅 `proxy_admin` 可访问。

## 反向代理行为

当管理员（或服务端对服务端的调用方）访问 `/plugin-proxy/<name>/<path>` 时，代理会在本地认证调用方，然后改写请求再转发给插件的 `url`。

转发前会剥离所有 LiteLLM 凭证请求头，包括 `Authorization`、`x-api-key`、`API-Key`、`x-goog-api-key`、`Ocp-Apim-Subscription-Key`、`x-litellm-api-key`、任何配置的 `litellm_key_header_name` 以及 `Cookie`。插件永远拿不到调用方真实有效的 LiteLLM 密钥。

随后注入 `plugin_key`，形如 `Authorization: Bearer <plugin_key>`。这是插件收到的唯一凭证。

调用方身份通过 `x-litellm-user-id` 和 `x-litellm-user-role` 转发，供插件执行自己的授权逻辑。这些只是参考信息，不是凭证。

响应通过 `Content-Security-Policy: sandbox` 和 `X-Content-Type-Options: nosniff` 进行沙箱隔离，这样由插件控制、却从 LiteLLM 源（origin）发出的字节内容无法在仪表板上执行。

## 安全检查清单

在向用户开放插件之前，请确认以下几点：代理上已设置 `LITELLM_SALT_KEY` 且从不与插件共享；插件手中只有为其派生的 `HMAC(LITELLM_SALT_KEY, plugin_name)` 密钥（以专属 secret 形式下发）；`plugin_key` 是限定在该插件上的专属凭证，而不是你的 LiteLLM 主密钥。插件的 `POST /api/plugin-auth` 必须同时校验声明的 `plugin` 受众和 `exp`（30 秒有效期）。插件应把 `x-litellm-user-id` 和 `x-litellm-user-role` 当作身份提示而非认证凭据；生产环境中插件服务 URL 应使用 HTTPS。
