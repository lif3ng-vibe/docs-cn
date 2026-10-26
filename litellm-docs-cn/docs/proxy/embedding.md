import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 嵌入 - `/embeddings`

支持的嵌入提供商与模型列表见[这里](https://docs.litellm.ai/docs/embedding/supported_embedding)

## 支持的输入格式

`/v1/embeddings` 端点遵循 [OpenAI 嵌入 API 规范](https://platform.openai.com/docs/api-reference/embeddings/create)，支持以下输入格式：

| 格式 | 示例 |
|--------|---------|
| 字符串 | `"input": "Hello"` |
| 字符串数组 | `"input": ["Hello", "World"]` |
| 整数 token 数组 | `"input": [1234, 5678, 9012]` |
| 嵌套的 token 数组 | `"input": [[1234, 5678], [9012, 3456]]` |

## 快速上手
下面的示例演示如何在代理服务器上对三种嵌入做路由：GPT-J 嵌入（SageMaker 端点）、Amazon Titan 嵌入（Bedrock）和 Azure OpenAI 嵌入。

1. 在 config.yaml 中配置模型
```yaml
model_list:
  - model_name: sagemaker-embeddings
    litellm_params: 
      model: "sagemaker/berri-benchmarking-gpt-j-6b-fp16"
  - model_name: amazon-embeddings
    litellm_params:
      model: "bedrock/amazon.titan-embed-text-v1"
  - model_name: azure-embeddings
    litellm_params: 
      model: "azure/azure-embedding-model"
      api_base: "os.environ/AZURE_API_BASE" # os.getenv("AZURE_API_BASE")
      api_key: "os.environ/AZURE_API_KEY" # os.getenv("AZURE_API_KEY")
      api_version: "2023-07-01-preview"

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY # [OPTIONAL] if set all calls to proxy will require either this key or a valid generated token
```

2. 启动代理
```shell
$ litellm --config /path/to/config.yaml
```

3. 测试嵌入调用

```shell
curl --location 'http://0.0.0.0:4000/v1/embeddings' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "input": "The food was delicious and the waiter..",
    "model": "sagemaker-embeddings",
}'
```
## 默认 `encoding_format` {#embedding-encoding-format}

对于经由 LiteLLM **OpenAI 兼容嵌入路径**（例如 OpenAI 模型、带自定义 `api_base` 的 `openai/...`，或是转发到该路径的代理 `/v1/embeddings` 路由）处理的嵌入请求，当调用方未指定时，LiteLLM 会显式发送 `encoding_format`。

**解析顺序**（以首个命中的项为准）：

1. 嵌入请求体中的取值（JSON 里的 `encoding_format`）。
2. `config.yaml` 中 `litellm_params.encoding_format` 指定的按模型默认值。
3. 进程环境变量 **`LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT`**（例如 `float` 或 `base64`）。
4. 回退默认值 **`float`**。

任何 OpenAI 兼容客户端仍可逐请求覆盖该值：

```bash
curl --location 'http://0.0.0.0:4000/v1/embeddings' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"model": "my-embedding-model", "input": "hello", "encoding_format": "base64"}'
```

另见：[配置设置](./config_settings.md)（`LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT`）。
