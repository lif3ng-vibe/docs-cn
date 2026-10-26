# 安全最佳实践

安全是 LiteLLM 的头等大事。生产环境与企业部署请采用以下实践。如需对照 2026 年 OWASP LLM Applications Top 10 逐项查看各防护措施（包括每项措施的局限），参见 [OWASP LLM Top 10 映射](./security_owasp_llm_top10)。

## 1. 监控安全邮件并及时升级

留意 LiteLLM 企业版（Enterprise）账户关联的邮箱，及时获取 CVE 警报与安全更新。对于较大或重要的安全更新，LiteLLM 会在公开披露前 7 天邮件通知企业版客户。请利用这段窗口期测试并部署更新版本，遇到升级问题可直接回复邮件反馈。

请确保这些邮件能同时送达安全团队与平台团队。

## 2. 运行受支持的稳定版本

始终停留在最新的稳定版本上，并把 LiteLLM 升级纳入常规补丁流程。锁定确切的版本号或镜像摘要，不要使用 `latest`，并在部署前[验证 Docker 镜像签名](./docker_image_security)。

当前的发布节奏参见 [LiteLLM 发布周期](./release_cycle)。

## 3. 采用最小权限访问

分配所需的最小 [RBAC 角色](./access_control)，并让代理管理员的人数保持精简。

应用与用户应使用权限受限的[虚拟密钥（virtual key）](./virtual_keys)，而不是 LiteLLM 主密钥（master key）。为每个生产工作负载使用独立的服务账户密钥，这样吊销访问时不会影响其他服务。

### 禁用环境变量凭据登录管理界面（Admin UI）

默认情况下，管理界面接受由环境变量拼出的登录凭据：`UI_USERNAME`（默认 `admin`）配合 `UI_PASSWORD`；当 `UI_PASSWORD` 未设置时，主密钥本身也可用于登录。这是一份永久有效、共享且明文的管理员凭据：无法按人轮换，任何读过环境变量的人都能持续以代理管理员身份登录，审计日志也无法把变更归属到具体个人。只应把它当作引导机制使用。该机制启用期间，仪表板会向管理员显示警告横幅。

禁用之前，先为每位管理员创建一个 `proxy_admin` 用户并设置各自的密码（或接入 [SSO（单点登录）](./admin_ui_sso)），确认他们能够登录。然后在 `config.yaml` 中加入以下配置并重启代理：

```yaml
general_settings:
  disable_env_credential_login: true
```

此后登录页会拒绝 `UI_USERNAME`、`UI_PASSWORD` 和主密钥，横幅也随之消失。数据库用户和 SSO 不受影响。如果管理员账户尚不存在时就启用了该设置，删除这行配置并重启即可恢复环境变量登录；整个过程中 API 始终可以用主密钥正常工作。分步操作参见[管理界面快速上手](./ui#5-创建自己的管理员账号并停用环境变量凭据登录)。

### 限制管理界面登录失败次数

管理界面的密码登录失败默认就有限流：同一来源地址在 60 秒内密码输错超过 10 次，该地址被封禁 5 分钟；同一地址对单个用户名输错超过 5 次，则只封禁这一对"地址+用户名"组合。封禁以地址为键，从不以账户为键，因此没人能从别处靠试探用户名把管理员锁在门外；而按用户名的限制也保证办公室 NAT 后面一个配置出错的脚本，不会把同一出口地址上的所有同事全部挡住。封禁是绝对的：到期之前，正确密码、`UI_USERNAME`/`UI_PASSWORD` 和主密钥都会被拒绝并返回 `429`，因为对正确凭据开任何例外，攻击者都能借机继续猜下去。被封禁的管理员仍可把主密钥当作 API bearer token 使用，这项限制不覆盖该用法。

按地址的限制只在 LiteLLM 知道客户端真实地址时才生效，因此生产部署必须设置 `general_settings.trusted_proxy_ranges`：要么设为反向代理或 ingress 的 CIDR 网段，让客户端地址从 `X-Forwarded-For` 读取，外部伪造的请求头无法冒用别的地址；要么在客户端直连时设为 `[]`。不设置的话，代理会在启动时告警，且只执行按用户名的限制，来自单一地址的用户名喷洒（username spraying）将不受约束。对于已知的共享出口地址，应使用 `max_failed_login_attempts_per_source_overrides`，而不是放宽全局限制。

```yaml
general_settings:
  trusted_proxy_ranges: ["10.0.0.0/8"]  # your ingress; [] when clients connect directly
  max_failed_login_attempts_per_source_overrides:
    "203.0.113.7": 50                   # shared office egress
    "198.51.100.4": 0                   # a scanner you run yourself, exempt
```

封禁状态通过 Redis 在多个 worker 和 pod 之间共享；没有 Redis 时每个 worker 各自计数，代理会在启动时告警。用户名以哈希形式存储。相关配置与默认值见[管理界面指南](./ui#限制登录失败尝试)。

## 4. 接入企业身份提供商

### SSO

为管理界面启用 [SSO](./admin_ui_sso)，让认证、MFA 和登录策略统一保留在你的身份提供商中。

### JWT

为 API 流量启用 [JWT 认证](./token_auth)，让工作负载使用来自 OIDC 提供商的签名身份，而不是共享的长期 API 密钥。JWT 声明（claims）还能把请求映射到 LiteLLM 的用户、团队、模型和花费控制。

### SCIM

启用 [SCIM](../tutorials/scim_litellm) 以自动开通和注销用户与团队。当用户从身份提供商中移除时，LiteLLM 会一并删除其关联的密钥和访问令牌，减少残留的访问权限。

## 5. 限制网络访问

尽可能把 LiteLLM 网关部署在私有网络中，只暴露客户端需要的路由。部署前先检查[公开路由设置](./public_routes)。

客户端到网关、网关到提供商的流量都应使用 TLS。保持证书校验开启；如果你的组织使用私有 CA，请配置[自定义 CA bundle](../guides/security_settings)。

## 6. 保护密钥并审查审计日志

把提供商凭据、主密钥和 salt key 存放在所在平台的秘密存储或受支持的[密钥管理器（secret manager）](../secret_managers/overview)中。不要把秘密提交到 `config.yaml` 或版本控制。遵循[主密钥轮换指南](./master_key_rotations)，并且凭据已入库后不要再轮换 `LITELLM_SALT_KEY`。

启用[审计日志](./multiple_admins)，并审查密钥创建、密钥删除、角色变更、团队更新等管理操作。

## 7. 避免通过错误响应和响应头泄露内部信息

意外的 5xx 错误会向客户端返回笼统的 `Internal server error` 消息；原始异常（包括堆栈跟踪）始终写入服务器日志。借助 `x-litellm-call-id` [响应头](./response_headers)，可以把失败的请求与服务端日志条目关联起来，无需让面向客户端的消息携带任何细节。

LiteLLM 自身基于 uvicorn 的启动方式（`litellm --config ...` 或默认 Docker 镜像）不会发送 `Server` 响应头。如果你把代理跑在 gunicorn、hypercorn 或 granian worker 之后，或放在反向代理、负载均衡器（nginx、ingress controller、CDN）后面，这一层可能会附加自己的 `Server` 头，暴露其名称和版本。请配置该层省略或泛化这个头，例如 nginx 中的 `server_tokens off;`，或 ingress controller、CDN 上的等价设置。

## 8. 为敏感工作负载添加防护栏（可选）

如果你的工作负载处理敏感或受监管的数据，可以添加[防护栏（guardrails）](./guardrails/quick_start)来筛查提示词和响应。内容过滤、PII（个人身份信息）检测和禁止话题策略推荐使用 [Bedrock Guardrails](./guardrails/bedrock)；对特定词语或模式做轻量级、基于正则的拦截，推荐使用 [LiteLLM 内容过滤器](./guardrails/litellm_content_filter)。防护栏可以按密钥、团队或模型分别启用，以便在需要之处执行更严格的管控。

## 8. 在 TLS 终止的反向代理后面配置 Secure cookie

只要对外源站是 HTTPS，代理的会话、SSO 和 SAML cookie 都会标记 `Secure`。当 TLS 在 LiteLLM 前面的反向代理或负载均衡器上终止时，LiteLLM 只能看到来自该代理的明文 HTTP 一跳，因此需要一个可信信号来判断对外源站确实是 HTTPS：

- 将 [`PROXY_BASE_URL`](./config_settings#环境变量参考) 设为用户在浏览器中看到的确切 `https://` 源站。这是最简单的做法，优先级也高于其他一切。
- 否则，设置 `general_settings.use_x_forwarded_for: true`，并把 `general_settings.mcp_trusted_proxy_ranges` 设为反向代理的 CIDR 网段。此后 LiteLLM 会采信来自该代理的 `X-Forwarded-Proto: https`，但前提是请求的直接对端地址落在这些网段之内：不受信任的调用方无法伪造该头来剥离自己 cookie 上的 `Secure`。

```yaml
general_settings:
  use_x_forwarded_for: true
  mcp_trusted_proxy_ranges:
    - "10.0.0.0/8" # your reverse proxy / ingress controller's network
```

两者都不配置的话，部署在 TLS 终止之后的站点拿到的 cookie 将不带 `Secure`，因为 LiteLLM 没有可信途径判断自己是经由 HTTPS 被访问的。尽管带 `mcp_` 前缀，这两项设置都不是 MCP 专属；它们就是 LiteLLM 处理 `X-Forwarded-*` 头时所用的通用请求信任边界。

## 9. 在生产环境禁用 API 文档

默认情况下，代理在 `/` 提供 Swagger UI，在 `/redoc` 提供 ReDoc，在 `/openapi.json` 提供原始 OpenAPI schema，且均无需认证。安全扫描器会将其视为侦察面，因为它列出了全部路由和请求 schema。生产环境中应把三者全部禁用：

```env
NO_DOCS="True"
NO_REDOC="True"
NO_OPENAPI="True"
```

每个变量各控制一个入口，只设 `NO_DOCS` 时 `/redoc` 和 `/openapi.json` 仍然可读；三个都要设置，然后重启代理。之后 `/redoc` 和 `/openapi.json` 返回 404，`/` 只返回简单的 `"LiteLLM: RUNNING"` 状态字符串，推理和管理路由则不受影响。各入口对应的变量，以及不禁用而是把文档挪到其他路径的做法，参见[限制所有 API 文档](./configs#生产隔离网络部署下禁用全部-api-文档)。

## 10. 限制文件上传

与其他代理路由一样，`POST /v1/files` 需要虚拟密钥，代理也只是把上传的字节原样转发给所配置的提供商，自身从不执行、解包或对外提供该文件。尽管如此，仍应把上传当作不可信输入，在其到达提供商之前限制网关接受的内容。

把 `general_settings` 下的 `allowed_file_extensions` 设为工作负载真正需要的扩展名。匹配对上传文件名不区分大小写，因此 `.jsonl` 也能接受 `batch.JSONL`。任何其他扩展名，以及没有扩展名的文件名，都会在转发前被拒绝并返回 `400`。设为空列表（`[]`）会拒绝所有上传；不配置该项则上传不受限制。可搭配使用：`max_file_size_mb` 限制任意上传的大小，`max_batch_file_size_mb` 限制批处理输入文件，`max_request_size_mb` 限制所有路由的整个请求体大小。

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  allowed_file_extensions: [".jsonl", ".pdf", ".txt"]
  max_file_size_mb: 50
  max_batch_file_size_mb: 200
  max_request_size_mb: 250
```

上传被拒时返回 OpenAI 格式的错误：

```json
{
  "error": {
    "message": "File extension '.exe' is not in this proxy's allowed_file_extensions setting. The file was not forwarded to the provider.",
    "type": "invalid_request_error",
    "param": "file",
    "code": "400"
  }
}
```

`blocked_file_extensions` 是较早的黑名单（blocklist）方式，现已弃用，推荐改用允许名单（allowlist）。它仍然有效；两者同时设置时，先检查允许名单，通过检查的部分仍会经过黑名单把关。优先选择允许名单：黑名单必须列全所有想拦下的扩展名，而允许名单只需列出你在用的那些。
