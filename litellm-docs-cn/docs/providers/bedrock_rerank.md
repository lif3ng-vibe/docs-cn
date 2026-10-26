import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock 重排序 API

以 Cohere `/rerank` 格式使用 Bedrock 的重排序（Rerank）API。

:::info[成本追踪]

✅ Bedrock 重排序 API 调用**支持成本追踪**。

:::

## 支持的参数

- `model` - 基础模型的 ARN
- `query` - 用于重排序的查询
- `documents` - 待重排序的文档列表
- `top_n` - 返回的结果数量

## 用法

<Tabs>
<TabItem label="SDK" value="sdk">

```python
from litellm import rerank
import os 

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = rerank(
    model="bedrock/arn:aws:bedrock:us-west-2::foundation-model/amazon.rerank-v1:0", # provide the model ARN - get this here https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock/client/list_foundation_models.html
    query="hello",
    documents=["hello", "world"],
    top_n=2,
)

print(response)
```

</TabItem>
<TabItem label="PROXY" value="proxy">

### 1. 配置 config.yaml

```yaml
model_list:
    - model_name: bedrock-rerank
      litellm_params:
        model: bedrock/arn:aws:bedrock:us-west-2::foundation-model/amazon.rerank-v1:0
        aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
        aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
        aws_region_name: os.environ/AWS_REGION_NAME
```

### 2. 启动代理服务器

```bash
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 测试

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bedrock-rerank",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3


  }'
```

</TabItem>
</Tabs>

## 身份验证

重排序支持所有标准的 Bedrock 身份验证方式，详情见 [Bedrock 身份验证](./bedrock#boto3-认证)。
