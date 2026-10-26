import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 控制公开与私有路由

<EnterpriseFeature />

控制哪些路由需要认证、哪些路由可供公开访问。

## 路由类型

| 路由类型 | 是否需要认证 | 说明 |
|------------|---------------|-------------|
| `public_routes` | 否 | 无需任何认证即可访问的路由 |
| `admin_only_routes` | 是（仅管理员） | 仅 [代理管理员（Proxy Admin）](./self_serve#可用角色) 可访问的路由 |
| `allowed_routes` | 是 | 代理上以精确匹配方式暴露的路由列表；未设置时暴露所有路由 |

## 快速上手

### 将路由设为公开

允许特定路由无需认证即可访问：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  public_routes: ["LiteLLMRoutes.public_routes", "/spend/calculate"]
```

### 将路由限制为仅管理员可访问

将特定路由限制为仅代理管理员可访问：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  admin_only_routes: ["/key/generate", "/key/delete"]
```

### 限制可用路由

仅在代理上暴露特定路由：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  allowed_routes: ["/chat/completions", "/embeddings"]
```

`allowed_routes` 是一个精确匹配列表，会在公开路由检查之前先行校验，因此 `LiteLLMRoutes.public_routes` 这类路由组名称与通配符在这里都不会被展开。任何未列入列表、需要经过认证的路由（例如 `/routes` 或 `/models`）都会返回 `403 Route ... not allowed`。`/health/liveliness` 和 `/health/readiness` 这类无需认证的端点不受 `allowed_routes` 影响，仍然保持可访问。请将所有必须保持可访问的已认证路由逐一列入。

## 使用示例

### 同时定义公开、仅管理员与允许路由

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  public_routes: ["LiteLLMRoutes.public_routes", "/spend/calculate"]
  admin_only_routes: ["/key/generate"]
  allowed_routes: ["/chat/completions", "/spend/calculate"]
```

`public_routes` 中的 `LiteLLMRoutes.public_routes` 指 LiteLLM 默认的公开路由集合，即使不显式列出，它们也保持公开。[查看源码](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_types.py)。它不会在 `allowed_routes` 中被展开。

### 测试

<Tabs>

<TabItem value="public" label="测试 public_routes">

```shell
curl --request POST \
  --url 'http://localhost:4000/spend/calculate' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hey, how'\''s it going?"}]
  }'
```

该端点无需 `Authorization` 请求头即可访问。

</TabItem>

<TabItem value="admin_only_routes" label="测试 admin_only_routes">

**管理员发起的成功请求**

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{}'
```

**非管理员发起的失败请求**

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <virtual-key-from-non-admin>' \
--header 'Content-Type: application/json' \
--data '{"user_role": "internal_user"}'
```

**预期响应**

```json
{
  "error": {
    "message": "user not allowed to access this route. Route=/key/generate is an admin only route",
    "type": "auth_error",
    "param": "None",
    "code": "403"
  }
}
```

</TabItem>

<TabItem value="allowed_routes" label="测试 allowed_routes">

**成功请求**

```shell
curl http://localhost:4000/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
"model": "fake-openai-endpoint",
"messages": [
    {"role": "user", "content": "Hello, Claude"}
]
}'
```

**路由未被放行时的失败请求**

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
--header 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
"model": "text-embedding-ada-002",
"input": ["write a litellm poem"]
}'
```

**预期响应**

```json
{
  "error": {
    "message": "Route /embeddings not allowed",
    "type": "auth_error",
    "param": "None",
    "code": "403"
  }
}
```

</TabItem>

</Tabs>

## 进阶：通配模式

使用通配模式（wildcard patterns）可一次性匹配多条路由。

### 语法

| 模式 | 说明 | 示例 |
|---------|-------------|---------|
| `/path/*` | 匹配所有以 `/path/` 开头的路由 | `/api/*` 可匹配 `/api/users`、`/api/users/123` |


### 示例

#### 将某一路径下的所有路由设为公开

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  public_routes:
    - "LiteLLMRoutes.public_routes"
    - "/api/v1/*"      # All routes under /api/v1/
    - "/health/*"       # All health check routes
```

#### 仅管理员路由不支持通配符

`admin_only_routes` 是精确匹配列表，`/key/*` 这类模式匹配不到任何路由，因此需要逐条列出各个路由：

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  admin_only_routes:
    - "/key/generate"
    - "/key/delete"
```

### 测试通配路由

**配置**
```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  public_routes:
    - "/public/*"
```

**测试**
```shell
# This works without auth (matches /public/*)
curl http://localhost:4000/public/status

# This also works without auth (matches /public/*)
curl http://localhost:4000/public/health/detailed

# This requires auth (doesn't match /public/*)
curl http://localhost:4000/private/data
```
