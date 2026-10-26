# [已废弃] 基于团队的路由

:::info

此方案已废弃，请改用[基于标签的路由](./tag_routing.md)

:::


## 路由

按 team-id（团队 ID）将请求路由到不同的模型组

### 基于模型组的配置

创建一个含 2 个模型组的 config.yaml，并连接好 PostgreSQL 数据库

```yaml
model_list:
  - model_name: gpt-4o-mini-eu # 👈 Model Group 1
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE_EU
      api_key: os.environ/AZURE_API_KEY_EU
      api_version: "2023-07-01-preview"
  - model_name: gpt-4o-mini-worldwide # 👈 Model Group 2
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"

general_settings:
    master_key: os.environ/LITELLM_MASTER_KEY
    database_url: "postgresql://..." # 👈 Connect proxy to DB
```

启动代理

```bash
litellm --config /path/to/config.yaml
```

### 创建带模型别名的团队

```bash
# Authorization: 👈 Master Key
curl --location 'http://0.0.0.0:4000/team/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
  "team_alias": "my-new-team_4",
  "model_aliases": {"{{openai_small}}": "gpt-4o-mini-eu"}
}'

# Returns team_id: my-team-id
```

### 创建团队密钥

```bash
curl --location 'http://localhost:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "my-team-id",  # 👈 YOUR TEAM ID
}'
```

### 通过别名调用模型

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-A1L0C3Px2LJl53sF_kTF9A' \
--data '{
  "model": "{{openai_small}}", # 👈 MODEL
  "messages": [{"role": "system", "content": "You'\''re an expert at writing poems"}, {"role": "user", "content": "Write me a poem"}, {"role": "user", "content": "What'\''s your name?"}],
  "user": "usha"
}'
```
