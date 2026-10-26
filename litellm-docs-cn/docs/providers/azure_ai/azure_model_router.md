# Azure Model Router

Azure Model Router 是 Azure AI Foundry 中的一项功能，会根据你的需求自动把请求路由到最合适的可用模型。这样你只需一个端点，它就能为每个请求智能选出最优模型。

## 快速上手

**模型模式**：`azure_ai/model_router/<deployment-name>`

```python
import litellm

response = litellm.completion(
    model="azure_ai/model_router/model-router",  # Replace with your deployment name
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key="your-api-key",
)
```

**代理配置**（`config.yaml`）：

```yaml
model_list:
  - model_name: model-router
    litellm_params:
      model: azure_ai/model_router/model-router
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/deployments/model-router/chat/completions?api-version=2025-01-01-preview
      api_key: your-api-key
```

## 核心特性

- **自动模型选择**：Azure Model Router 会为你的请求动态挑选最佳模型
- **成本追踪**（cost tracking）：LiteLLM 根据实际使用的模型（如 `{{openai_small}}`）自动追踪成本，并额外计入 Model Router 的基础设施费用
- **流式支持**：完整支持流式响应，成本计算同样准确
- **配置简单**：通过 UI 或配置文件即可轻松完成设置

## 模型命名模式

使用以下模式：`azure_ai/model_router/<deployment-name>`

**组成部分**：
- `azure_ai`：提供商（provider）标识
- `model_router`：表示这是一个 Model Router 部署
- `<deployment-name>`：你在 Azure AI Foundry 中的实际部署名称（deployment name），如 `azure-model-router`

**示例**：`azure_ai/model_router/azure-model-router`

**工作原理**：
- LiteLLM 在向 Azure 发送请求时会自动剥离 `model_router/` 前缀
- 实际发送给 Azure API 的只有你的部署名称（如 `azure-model-router`）
- 响应与日志中会保留完整路径，以便准确追踪成本

## LiteLLM Python SDK

### 基本用法

使用模式 `azure_ai/model_router/<deployment-name>`，其中 `<deployment-name>` 是你在 Azure 的部署名称：

```python
import litellm
import os

response = litellm.completion(
    model="azure_ai/model_router/azure-model-router",  # Use your deployment name
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key=os.getenv("AZURE_MODEL_ROUTER_API_KEY"),
)

print(response)
```

**模式说明**：
- `azure_ai`：提供商
- `model_router`：表示这是一个 model router 部署
- `azure-model-router`：你在 Azure AI Foundry 中的实际部署名称

LiteLLM 在向 Azure 发送请求时会自动剥离 `model_router/` 前缀，因此实际发送给 API 的只有 `azure-model-router`。

### 流式与用量统计

```python
import litellm
import os

response = await litellm.acompletion(
    model="azure_ai/model_router/azure-model-router",  # Use your deployment name
    messages=[{"role": "user", "content": "hi"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key=os.getenv("AZURE_MODEL_ROUTER_API_KEY"),
    stream=True,
    stream_options={"include_usage": True},
)

async for chunk in response:
    print(chunk)
```

## LiteLLM 代理（AI 网关）

### config.yaml

```yaml
model_list:
  - model_name: azure-model-router  # Public name for your users
    litellm_params:
      model: azure_ai/model_router/azure-model-router  # Use your deployment name
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/v1/
      api_key: os.environ/AZURE_MODEL_ROUTER_API_KEY
```

**注意**：请将模型路径中的 `azure-model-router` 替换为你在 Azure AI Foundry 中的实际部署名称。

### 启动代理

```bash
litellm --config config.yaml
```

### 测试请求

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "azure-model-router",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 通过 LiteLLM UI 添加 Azure Model Router

本节将演示如何通过管理界面（Admin Dashboard）把 Azure Model Router 端点添加到 LiteLLM。

### 快速上手

1. 进入 LiteLLM UI 的 **Models** 页面
2. 在提供商下拉框中选择 **"Azure AI Foundry (Studio)"**
3. 输入你的部署名称（如 `azure-model-router`）
4. LiteLLM 会自动将其格式化为 `azure_ai/model_router/azure-model-router`
5. 填写 API Base URL 和 API 密钥
6. 测试并保存

### 详细操作指引

#### 第 1 步：选择提供商

进入 Models 页面，在提供商下拉框中选择 "Azure AI Foundry (Studio)"。

##### 前往 Models 页面

![前往 Models 页面](./img/azure_model_router_01.jpeg)

##### 点击提供商下拉框

![点击提供商](./img/azure_model_router_02.jpeg)

##### 选择 Azure AI Foundry

![选择 Azure AI Foundry](./img/azure_model_router_03.jpeg)

#### 第 2 步：输入部署名称

**新的简化方式**：直接在文本框中输入部署名称即可。如果名称中包含 "model-router" 或 "model_router"，LiteLLM 会自动将其格式化为 `azure_ai/model_router/<deployment-name>`。

**示例**：
- 输入：`azure-model-router`
- LiteLLM 生成：`azure_ai/model_router/azure-model-router`

##### 从 Azure 门户复制部署名称

切换到 Azure AI Foundry，复制你的 model router 部署名称。

![Azure 门户中的模型名称](./img/azure_model_router_09.jpeg)

![复制模型名称](./img/azure_model_router_10.jpeg)

##### 在 LiteLLM 中输入部署名称

把你的部署名称（如 `azure-model-router`）直接粘贴到文本框中。

![输入部署名称](./img/azure_model_router_04.jpeg)

**背后的处理逻辑**：
- 你输入：`azure-model-router`
- LiteLLM 自动识别出这是一个 model router 部署
- 完整模型路径变为：`azure_ai/model_router/azure-model-router`
- 实际发起 API 调用时，只有 `azure-model-router` 会发送给 Azure

#### 第 3 步：配置 API Base 和密钥

从 Azure 门户复制端点 URL 和 API 密钥。

##### 从 Azure 复制 API Base URL

![复制 API Base](./img/azure_model_router_12.jpeg)

##### 在 LiteLLM 中填写 API Base

![点击 API Base 输入框](./img/azure_model_router_13.jpeg)

![粘贴 API Base](./img/azure_model_router_14.jpeg)

##### 从 Azure 复制 API 密钥

![复制 API 密钥](./img/azure_model_router_15.jpeg)

##### 在 LiteLLM 中填写 API 密钥

![输入 API 密钥](./img/azure_model_router_16.jpeg)

#### 第 4 步：测试并添加模型

确认配置可用后，保存模型。

##### 测试连接

![测试连接](./img/azure_model_router_17.jpeg)

##### 关闭测试对话框

![关闭对话框](./img/azure_model_router_18.jpeg)

##### 添加模型

![添加模型](./img/azure_model_router_19.jpeg)

#### 第 5 步：在 Playground 中验证

测试你的模型，并确认成本追踪正常工作。

##### 打开 Playground

![前往 Playground](./img/azure_model_router_20.jpeg)

##### 选择模型

![选择模型](./img/azure_model_router_21.jpeg)

##### 发送测试消息

![发送消息](./img/azure_model_router_22.jpeg)

##### 查看日志

![查看日志](./img/azure_model_router_23.jpeg)

##### 验证成本追踪

成本按实际使用的模型（如 `{{openai_small}}`）计算；此外，使用 Model Router 还会产生每百万输入 Token 0.14 美元的固定基础设施费用。

![验证成本](./img/azure_model_router_24.jpeg)

## 成本追踪

LiteLLM 会自动处理 Azure Model Router 的成本追踪。理解其计算方式，有助于你解读花费数据、排查计费问题。

### LiteLLM 如何计算成本

使用 Azure Model Router 时，LiteLLM 会计算**两个成本组成部分**：

| 组成部分 | 说明 | 适用场景 |
|-----------|-------------|--------------|
| **模型成本** | 处理请求的实际模型按 Token 计费的费用（如 `gpt-5-nano`、`gpt-4.1-nano`） | 只要 Azure 在响应中返回了模型名，就会计入 |
| **路由器固定成本** | 每百万输入 Token 0.14 美元（Azure AI Foundry 基础设施费用） | 请求经由 model router 端点发出时 |

### 成本计算流程

1. **识别请求模型**：LiteLLM 记录你所请求的模型（如 `azure_ai/model_router/model-router`）。只要其中包含 `model_router` 或 `model-router`，该请求就会被视为路由器请求。

2. **提取响应模型**：Azure 会在响应中返回实际使用的模型（如 `{{openai_small}}`），LiteLLM 以此查询模型单价。

3. **计算模型成本**：LiteLLM 在价格表中查找该响应模型，并根据提示词 Token 与补全 Token 计算成本。

4. **叠加路由器固定成本**：由于原始请求发往 model router，LiteLLM 会在模型成本之上再加一笔固定成本（每百万输入 Token 0.14 美元）。

5. **得出总成本**：`Total = Model Cost + Router Flat Cost`

### 配置要求

要让成本追踪正常工作，需要满足以下条件：

- **使用完整模式**：`azure_ai/model_router/<deployment-name>`（如 `azure_ai/model_router/model-router`）
- **代理配置**：使用 LiteLLM 代理时，将 `litellm_params` 中的 `model` 设为完整模式，这样请求模型才能被正确识别为路由器请求

```yaml
# proxy_server_config.yaml
model_list:
  - model_name: model-router
    litellm_params:
      model: azure_ai/model_router/model-router  # Required for router cost detection
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/deployments/model-router/chat/completions?api-version=2025-01-01-preview
      api_key: your-api-key
```

### 成本构成

使用 Azure Model Router 时，总成本包括：

- **模型成本**：按处理请求的实际模型计算（如 `{{openai_small}}`、`{{openai_large}}`）
- **路由器固定成本**：每百万输入 Token 0.14 美元（Azure AI Foundry 基础设施费用）

### 含成本的响应示例

```python
import litellm

response = litellm.completion(
    model="azure_ai/model_router/azure-model-router",
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key="your-api-key",
)

# The response will show the actual model used
print(f"Model used: {response.model}")  # e.g., "azure_ai/{{openai_small}}"

# Get cost (includes both model cost and router flat cost)
from litellm import completion_cost
cost = completion_cost(completion_response=response)
print(f"Total cost: ${cost}")

# Access detailed cost breakdown
if hasattr(response, '_hidden_params') and 'response_cost' in response._hidden_params:
    print(f"Response cost: ${response._hidden_params['response_cost']}")
```

### 在 UI 中查看成本构成

在 LiteLLM UI 中查看日志时，你会看到：

- **模型成本**：实际所用模型产生的费用
- **Azure Model Router 固定成本**：每百万输入 Token 0.14 美元的基础设施费用
- **总成本**：两项之和

有了这份明细，你可以准确了解使用 Model Router 时每一笔开销的去向。
