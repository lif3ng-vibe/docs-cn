import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 创建透传端点

将发往 LiteLLM 代理的请求路由到任意外部 API，实现透传（pass-through）。适合自定义模型、图像生成 API，或任何想经 LiteLLM 代理转发的服务。

**核心优势：**
- 接入 Bria API、Mistral OCR 等第三方端点
- 可为每次请求设置自定义价格，也可以让内部会分发给多个模型的目标服务[自行上报成本与用量](./pass_through_cost_tracking.md)
- 代理管理员无需向开发者发放 Bria、Mistral OCR 等上游 LLM 提供商的 API 密钥
- 集中管理认证、花费追踪（spend tracking）与预算控制

## 通过 UI 快速上手（推荐）

创建透传端点最简单的方式是使用 LiteLLM UI。本例中，我们将接入 [Bria API](https://docs.bria.ai/image-generation/endpoints/text-to-image-base) 并设置每次请求的成本。

### 第 1 步：创建路由映射

要创建一个透传端点：

1. 进入 LiteLLM 代理服务器的 UI
2. 打开 `Models + Endpoints` 标签页
3. 点击 `Pass Through Endpoints`
4. 点击 "Add Pass Through Endpoint"
5. 填写以下信息：

**必填字段：**
- `Path Prefix`：客户端调用 LiteLLM 代理时使用的路由（如 `/bria`、`/mistral-ocr`）
- `Target URL`：请求将被转发到的 URL

<Image 
  img={require('../../img/pt_1.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

**路由映射示例：**

上述配置会创建以下路由映射：

| LiteLLM 代理路由 | 目标 URL |
|-------------------|------------|
| `/bria` | `https://engine.prod.bria-api.com` |
| `/bria/v1/text-to-image/base/model` | `https://engine.prod.bria-api.com/v1/text-to-image/base/model` |
| `/bria/v1/enhance_image` | `https://engine.prod.bria-api.com/v1/enhance_image` |
| `/bria/<any-sub-path>` | `https://engine.prod.bria-api.com/<any-sub-path>` |

:::info
所有路由都带有 LiteLLM 代理的基础 URL 前缀：`https://<litellm-proxy-base-url>`
:::

### 第 2 步：配置请求头与定价

配置所需的认证信息与定价：

**认证设置：**
- Bria API 需要 `api_token` 请求头
- 将你的 Bria API 密钥填入 `api_token` 请求头的值

**默认查询参数（可选）：**
- 添加会随每个请求自动发送的查询参数
- 适合 API 版本管理、格式指定或默认配置
- 客户端可以通过自行传参覆盖这些参数
- 示例：`version=v1`、`format=json`、`timeout=30`

<Image 
  img={require('../../img/passthrough_query_default.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

**定价配置：**
- 设置每次请求的成本（本例中为 $12.00）
- 这样就能为你的用户启用成本追踪与计费
- 每次请求收取固定费用，适合价格固定的目标服务。如果目标服务内部调用了多个模型且知道自己的总量，让它自行上报即可，参见[透传成本与用量追踪](./pass_through_cost_tracking.md)

<Image 
  img={require('../../img/pt_2.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

### 第 3 步：保存端点

完成配置后：
1. 检查你的设置
2. 点击 "Add Pass Through Endpoint"
3. 端点创建后立即可用

### 第 4 步：测试端点

通过 LiteLLM 代理向 Bria API 发送一个测试请求，验证配置是否正确：

```shell
curl -i -X POST \
  'http://localhost:4000/bria/v1/text-to-image/base/2.3' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-litellm-api-key>' \
  -d '{
    "prompt": "a book",
    "num_results": 2,
    "sync": true
  }'
```

**预期响应：**
如果一切配置正确，你将收到 Bria API 返回的响应，其中包含生成的图像数据。

---

## Config.yaml 配置

也可以通过 `config.yaml` 文件创建透传端点。下面演示如何添加一个转发到 Cohere API 的 `/v1/rerank` 路由：

### 配置示例

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  pass_through_endpoints:
    - path: "/v1/rerank"                                  # LiteLLM 代理上的路由
      target: "https://api.cohere.com/v1/rerank"          # 目标端点
      headers:                                            # 要转发的请求头
        Authorization: "bearer os.environ/COHERE_API_KEY"
        content-type: application/json
        accept: application/json
      forward_headers: true                               # 转发所有传入请求头
      default_query_params:                               # 可选：默认查询参数
        version: "v1"                                     # 始终发送 version=v1
        format: "json"                                    # 默认格式（可被覆盖）
```

### 启动与测试

1. **启动代理：**
   ```shell
   litellm --config config.yaml --detailed_debug
   ```

2. **发送测试请求：**
   ```shell
   curl --request POST \
     --url http://localhost:4000/v1/rerank \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '{
       "model": "rerank-english-v3.0",
       "query": "What is the capital of the United States?",
       "top_n": 3,
       "documents": ["Carson City is the capital city of the American state of Nevada."]
     }'
   ```

### 预期响应
```json
{
  "id": "37103a5b-8cfb-48d3-87c7-da288bedd429",
  "results": [
    {
      "index": 2,
      "relevance_score": 0.999071
    }
  ],
  "meta": {
    "api_version": {"version": "1"},
    "billed_units": {"search_units": 1}
  }
}
```

---

## 配置参考

### 完整规格

```yaml
general_settings:
  pass_through_request_timeout: 600   # 可选：所有透传路由的上游超时时间（秒）。默认值：600
  pass_through_endpoints:
    - path: string                    # LiteLLM 代理服务器上的路由
      target: string                  # 转发到的目标 URL
      auth: boolean                   # 启用 LiteLLM 认证（企业版）
      forward_headers: boolean        # 转发所有传入请求头
      include_subpath: boolean        # 若为 true，则转发请求到子路径（默认：false）
      timeout: float                  # 可选：单个端点的上游超时时间（秒）。覆盖 pass_through_request_timeout
      methods: list[string]           # 可选：HTTP 方法（如 ["GET", "POST"]）。未指定时支持所有方法。
      default_query_params:           # 可选：随每个请求发送的默认查询参数
        <param-name>: string          # 键值对（如 version: "v1"、format: "json"）
      headers:                        # 要添加的自定义请求头
        Authorization: string         # 目标 API 的认证请求头
        content-type: string         # 请求内容类型
        accept: string               # 期望的响应格式
        LANGFUSE_PUBLIC_KEY: string  # 用于 Langfuse 端点
        LANGFUSE_SECRET_KEY: string  # 用于 Langfuse 端点
        <custom-header>: string      # 任意自定义请求头
```

### 请求超时

透传路由默认的**上游超时时间为 600 秒**。全局覆盖可设置 `general_settings.pass_through_request_timeout`，单个端点可设置 `timeout`（端点级配置优先）。

原生提供商透传路由（Bedrock 的 `/converse`、`/v1/messages` 以及原生 `/v1/responses` 流式接口）的超时通过路由器（router）解析，按以下顺序取第一个已设置的值：请求的 `timeout`、`litellm_params` 下该部署（deployment）的 `timeout`、`router_settings.timeout`、`litellm_settings.request_timeout`（或环境变量 `REQUEST_TIMEOUT`）、`general_settings.pass_through_request_timeout`，最后是 600 秒。流式请求在上述各层级还会先检查 `stream_timeout` 再检查 `timeout`。因此在这些路由上，你设置的 `litellm_settings.request_timeout` 优先级高于 `pass_through_request_timeout`；对流式请求，它限制的是每次等待下一个分片的时间，上游一旦停滞就会以错误结束流，而不是一直挂起。

### 请求头选项
- **Authorization**：目标 API 的认证信息
- **content-type**：请求体格式说明
- **accept**：期望的响应格式
- **LANGFUSE_PUBLIC_KEY/SECRET_KEY**：用于 Langfuse 集成
- **自定义请求头**：任意其他键值对

### 默认查询参数
- **参数优先级**：客户端参数 > URL 参数 > 默认参数
- **使用场景**：API 版本管理、认证令牌、格式控制、功能开关
- **可覆盖性**：客户端可覆盖任何默认参数
- **示例**：`version: "v1"`、`format: "json"`、`timeout: "30"`

### 子路径路由

默认情况下，透传端点只匹配**指定的精确路径**。要让请求转发到子路径，请设置 `include_subpath: true`：

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/custom-api"                    # 任意你选择的前缀
      target: "https://api.example.com"
      include_subpath: true  # 转发 /custom-api/*，而不只是 /custom-api
```

| 设置 | 行为 |
|---------|----------|
| `include_subpath: false`（默认） | 只转发 `/custom-api` |
| `include_subpath: true` | `/custom-api`、`/custom-api/v1/chat`、`/custom-api/anything` 都会被转发 |

### 限制密钥与团队可访问的路由

`auth: true` 的端点会对非管理员密钥返回 403，除非该密钥或其所属团队在 `allowed_passthrough_routes` 中列出了这条路由。密钥自己有列表时优先用密钥的，否则用团队的。要在宽泛授权之下收回某条路由，可将其加入 `denied_passthrough_routes`。密钥级或团队级的拒绝始终优先于允许，因此团队可以放行 `/custom-api`，同时让某个密钥乃至整个团队都访问不了 `/custom-api/admin`。

```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "allowed_passthrough_routes": ["/custom-api"],
    "denied_passthrough_routes": ["/custom-api/admin"]
  }'
```

`/team/new`、`/team/update` 和 `/key/update` 接受同样的两个字段，两者都存储在密钥或团队的 `metadata` 中。以上面创建的密钥为例：

| 请求 | 结果 |
|---------|--------|
| `/custom-api/v1/chat` | 转发 |
| `/custom-api/admin`、`/custom-api/admin/users` | 返回 403，并指明命中的 `denied_passthrough_routes` 条目 |
| `/custom-api/administrator` | 转发，因为条目只按完整路径段匹配 |
| `/custom-api/public/../admin/users`、`/custom-api//admin/users` | 返回 403，检查的是实际转发时所用的路径 |

条目会匹配其精确路径及其下的一切路径；条目末尾的 `/` 会被忽略；末尾的 `*` 则匹配任何以其前面文本开头的路由（如 `/custom-api/adm*`）。更具体的允许条目无法重新放开被拒绝前缀覆盖的路由。团队端点列表也会隐藏该团队拒绝的需认证端点。

拒绝列表检查的是 LiteLLM 实际转发的路径，即先解析 `..`、`//` 和百分号编码之后的路径，并且要求精确匹配。LiteLLM 原样转发、不做归一的变体形式不会被拒绝，例如 `/custom-api/ADMIN`、`/custom-api/admin;x=1`、末尾的 `%20` 或反斜杠。如果你的上游把它们当作同一路径，请用 `allowed_passthrough_routes` 只授予密钥所需的路由，而不要依赖拒绝条目。

这两个字段都是企业版功能，只有代理管理员才能设置或修改。非管理员的更新如果会改动、清空或删除现有的拒绝列表（包括通过替换 `metadata`），都会收到 403。代理管理员密钥不受这两份列表限制。拒绝列表只作用于 `auth: true` 的自定义端点；`auth: false` 的端点以及 LiteLLM 内置的提供商路由（如 `/anthropic/*`）都会忽略它。

---

### 默认查询参数

透传端点支持默认查询参数，它们会自动附加到每个请求上。适用于 API 版本管理、格式指定、认证令牌或其他任何默认配置。

#### 工作原理

**参数优先级（从高到低）：**
1. **客户端提供的参数**（在请求 URL 中）
2. **URL 参数**（来自目标 URL）
3. **默认参数**（来自配置）

#### 配置示例

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/api/v1"
      target: "https://external-api.com/service?timeout=60"  # URL 中已带 timeout=60
      default_query_params:
        version: "v1"          # 始终添加 version=v1
        format: "json"         # 默认 format=json（可被覆盖）
        auth_level: "basic"    # 始终添加 auth_level=basic
```

#### 请求示例

**客户端请求：** `GET /api/v1/users`
**实际后端调用：** `https://external-api.com/service?version=v1&format=json&auth_level=basic&timeout=60`

**客户端请求：** `GET /api/v1/users?format=xml&custom=value`
**实际后端调用：** `https://external-api.com/service?version=v1&auth_level=basic&timeout=60&format=xml&custom=value`
- 客户端的 `format=xml` 覆盖默认的 `format=json`
- 默认的 `version=v1` 和 `auth_level=basic` 保留
- URL 中的 `timeout=60` 保留
- 客户端的 `custom=value` 追加到末尾

#### 用例

- **API 版本管理**：始终发送 `version=v2` 以保持兼容
- **认证**：添加 `api_key=default_key` 之类的认证令牌
- **格式控制**：默认 `format=json`，但允许客户端覆盖
- **速率限制**：默认设置 `rate_limit=standard`
- **功能开关**：默认启用 `experimental=false`

---

你可以用不同的 HTTP 方法为同一路径配置不同的目标 URL。当不同操作由不同后端处理时，这会很有用：

<Image 
  img={require('../../img/passthrough_method_setup.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

```yaml
general_settings:
  pass_through_endpoints:
    # 发往 /azure/kb 的 GET 请求走读取 API
    - path: "/azure/kb"
      target: "https://read-api.example.com/knowledge-base"
      methods: ["GET"]
      headers:
        Authorization: "bearer os.environ/READ_API_KEY"
    
    # 发往 /azure/kb 的 POST 请求走写入 API
    - path: "/azure/kb"
      target: "https://write-api.example.com/knowledge-base"
      methods: ["POST"]
      headers:
        Authorization: "bearer os.environ/WRITE_API_KEY"
    
    # 发往 /azure/kb 的 PUT 请求走更新 API
    - path: "/azure/kb"
      target: "https://update-api.example.com/knowledge-base"
      methods: ["PUT"]
      headers:
        Authorization: "bearer os.environ/UPDATE_API_KEY"
```

**要点：**
- 未指定 `methods` 时，端点支持所有 HTTP 方法（GET、POST、PUT、DELETE、PATCH）
- 多个端点可以共用同一路径，只要它们的 method 不同
- 单个端点也可以指定多个方法：`methods: ["GET", "POST"]`
- 这样就能根据操作类型路由到不同的后端

---

## 高级：自定义适配器

对于复杂的集成场景（如 Anthropic/Bedrock 客户端），你可以创建自定义适配器，在不同 API 模式之间相互转换。

### 1. 创建适配器

```python
from litellm import adapter_completion
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.llms.anthropic import AnthropicMessagesRequest, AnthropicResponse

class AnthropicAdapter(CustomLogger):
    def translate_completion_input_params(self, kwargs):
        """Translate Anthropic format to OpenAI format"""
        request_body = AnthropicMessagesRequest(**kwargs)
        return litellm.AnthropicConfig().translate_anthropic_to_openai(
            anthropic_message_request=request_body
        )

    def translate_completion_output_params(self, response):
        """Translate OpenAI response back to Anthropic format"""
        return litellm.AnthropicConfig().translate_openai_response_to_anthropic(
            response=response
        )

anthropic_adapter = AnthropicAdapter()
```

### 2. 配置端点

```yaml
model_list:
  - model_name: my-claude-endpoint
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  pass_through_endpoints:
    - path: "/v1/messages"
      target: custom_callbacks.anthropic_adapter
      headers:
        litellm_user_api_key: "x-api-key"
```

### 3. 测试自定义端点

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
  -H "x-api-key: $LITELLM_API_KEY" \
  -H 'anthropic-version: 2023-06-01' \
  -H 'content-type: application/json' \
  -d '{
    "model": "my-claude-endpoint",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, world"}]
  }'
```

---

## 教程：将 Azure OpenAI Assistants API 添加为透传端点

本视频演示如何将 Azure OpenAI Assistants API 作为透传端点添加到 LiteLLM 代理。

<iframe width="840" height="500" src="https://www.loom.com/embed/12965cb299d24fc0bd7b6b413ab6d0ad" frameBorder="0" allowFullScreen></iframe>

<br/>
<br/>


---

## 故障排查

### 常见问题

**认证错误：**
- 检查请求头中的 API 密钥是否设置正确
- 确认目标 API 接受你所用的认证方式

**路由问题：**
- 确认路径前缀与你的请求 URL 匹配
- 确认目标 URL 可以访问
- 检查配置中是否有多余的末尾斜杠

**响应错误：**
- 使用 `--detailed_debug` 开启详细调试
- 查看 LiteLLM 代理日志中的错误详情
- 确认目标 API 期望的请求格式

### 允许团队 JWT 使用透传路由

如果你正在使用透传的提供商路由（如 `/anthropic/*`），并希望 JWT 团队令牌能访问这些路由，请在 `litellm_jwtauth` 的 `team_allowed_routes` 中加入 `mapped_pass_through_routes`，或者显式添加相关路由。

示例（`proxy_server_config.yaml`）：

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes","info_routes","mapped_pass_through_routes"]
```

对你自建的透传端点来说，`mapped_pass_through_routes` 只覆盖 LiteLLM 自带的提供商前缀。如果你的端点共用一个自定义前缀，只需带末尾 `*` 授权该前缀一次，之后注册在该前缀下的每个端点都会被放行，无需再改配置。

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes","info_routes","/internal-models/*"]
```

### 获取帮助

[预约演示 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)

[社区 Discord 💭](https://discord.gg/wuPM9dRgDw)


我们的邮箱 ✉️：ishaan@berri.ai / krrish@berri.ai
