# Chutes

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Chutes 是一个云原生 AI 部署平台，提供 vLLM、SGLang 等热门框架的预构建模板，你可以通过 OpenAI 兼容 API 部署、运行并弹性扩展 LLM 应用。 |
| LiteLLM 中的提供商路由 | `chutes/` |
| 提供商文档链接 | [Chutes 官网 ↗](https://chutes.ai) |
| Base URL | `https://llm.chutes.ai/v1/` |
| 支持的操作 | [`/chat/completions`](/docs/providers/chutes#用法---litellm-python-sdk)、嵌入（Embeddings） |

<br />

## Chutes 是什么？

Chutes 是一个功能强大的 AI 部署与推理服务平台，提供以下能力：
- **预构建模板**：vLLM、SGLang、扩散模型与嵌入模型的即用型配置
- **OpenAI 兼容 API**：直接使用标准的 OpenAI SDK 和客户端
- **多 GPU 扩展**：支持跨多块 GPU 承载大型模型
- **流式响应**：模型输出实时呈现
- **自定义配置**：按自身需求覆盖任意参数
- **性能优化**：预先调优好的优化设置

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key
```

请前往 [chutes.ai](https://chutes.ai) 获取你的 Chutes API 密钥。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Chutes Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Chutes call
response = completion(
    model="chutes/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Chutes Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CHUTES_API_KEY"] = ""  # your Chutes API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Chutes call with streaming
response = completion(
    model="chutes/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法 - LiteLLM 代理服务器

### 1. 把密钥保存到环境变量

```bash
export CHUTES_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: chutes-model
    litellm_params:
      model: chutes/model-name  # Replace with actual model name
      api_key: os.environ/CHUTES_API_KEY
```

## 支持的 OpenAI 参数

Chutes 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 与 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID 或 HuggingFace 模型标识符 |
| `stream` | boolean | 可选。开启流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。最多生成的 Token 数 |
| `frequency_penalty` | float | 可选。对出现频繁的 Token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否已出现施加惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用行为 |
| `response_format` | object | 可选。响应格式规范 |

## 支持的框架

Chutes 为以下热门 AI 框架提供了优化模板：

### vLLM（高性能 LLM 服务）
- OpenAI 兼容端点
- 支持多 GPU 扩展
- 高级优化设置
- 最适合生产环境工作负载

### SGLang（进阶 LLM 服务）
- 结构化生成能力
- 高级特性与控制选项
- 自定义配置选项
- 最适合复杂使用场景

### 扩散模型（图像生成）
- 预配置的图像生成模板
- 为最佳效果调优的设置
- 支持热门扩散模型

### 嵌入模型
- 文本嵌入模板
- 向量检索优化
- 支持热门嵌入模型

## 身份验证

Chutes 支持多种身份验证方式：
- 通过 `X-API-Key` 请求头传递 API 密钥
- 通过 `Authorization` 请求头传递 Bearer Token

LiteLLM 用法示例（使用环境变量）：
```python
os.environ["CHUTES_API_KEY"] = "your-api-key"
```

## 性能优化

Chutes 支持选择硬件并进行优化：
- **小型模型**（7B-13B）：1 块 GPU，24GB 显存
- **中型模型**（30B-70B）：4 块 GPU，每块 80GB 显存
- **大型模型**（100B+）：8 块 GPU，每块 140GB 以上显存

另有引擎优化参数可用于微调性能。

## 部署选项

Chutes 提供灵活的部署方式：
- **快速上手**：用预构建模板即刻完成部署
- **自定义镜像**：使用自定义 Docker 镜像部署
- **弹性伸缩**：配置最大实例数与自动伸缩阈值
- **硬件**：指定 GPU 类型与配置

## 更多资源

- [Chutes 文档](https://chutes.ai/docs)
- [Chutes 入门指南](https://chutes.ai/docs/getting-started/running-a-chute)
- [Chutes API 参考](https://chutes.ai/docs/sdk-reference)
