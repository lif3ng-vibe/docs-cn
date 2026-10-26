# OAuth 2.0 认证

如果你希望使用 OAuth 2.0 令牌向 LiteLLM 代理发起 `/chat`、`/embeddings` 请求，就可以采用本文的方案。

<EnterpriseFeature />

## 用法

1. 设置环境变量：

```bash
export OAUTH_TOKEN_INFO_ENDPOINT="https://your-provider.com/token/info"
export OAUTH_USER_ID_FIELD_NAME="sub"
export OAUTH_USER_ROLE_FIELD_NAME="role"
export OAUTH_USER_TEAM_ID_FIELD_NAME="team_id"
```

- `OAUTH_TOKEN_INFO_ENDPOINT`：用于校验 OAuth 令牌的 URL
- `OAUTH_USER_ID_FIELD_NAME`：令牌信息响应中包含用户 ID 的字段
- `OAUTH_USER_ROLE_FIELD_NAME`：令牌信息中表示用户角色的字段
- `OAUTH_USER_TEAM_ID_FIELD_NAME`：令牌信息中表示用户团队 ID 的字段

2. 在 litellm 的 config.yaml 中启用

在你的 config.yaml 中加入以下配置：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY
  enable_oauth2_auth: true
```

3. 在发给 LiteLLM 的请求中使用该令牌

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

## 故障排查

使用 [`--detailed_debug` 模式](cli.md#--detailed_debug)启动 LiteLLM 代理，即可看到更详细的日志。

## OAuth2 与 JWT 结合使用

LiteLLM 支持两种 OAuth2 + JWT 模式：

1. **全局 OAuth2 模式**（`enable_oauth2_auth: true`）  
   在 LLM 与 info 路由上启用 OAuth2 认证。
2. **选择性 JWT 覆盖模式**（`enable_oauth2_auth: false`）  
   只有匹配 `litellm_jwtauth.routing_overrides` 的 JWT 形态令牌，才会在 LLM 与 info 路由上转由 OAuth2 处理。

如果要做选择性路由（仅对特定 JWT 启用 OAuth2），请配置：

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    routing_overrides:
      - iss: "machine-issuer.example.com"
        client_id: "MID_LITELLM"
        path: "oauth2"
```

选择器支持 shell 风格的通配符（`*`、`?`，区分大小写），取值可以是单个字符串，也可以是字符串列表。

关于 `routing_overrides` 的完整行为（支持的选择器、通配符与列表语义，以及匹配规则），参见 [`/proxy/token_auth`](./token_auth.md#将-jwt-形态的机器令牌路由到-oauth2)。
