import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /fine_tuning

<EnterpriseFeature />

| 功能 | 是否支持 | 说明 |
|-------|-------|-------|
| 支持的提供商 | OpenAI, Azure OpenAI, Vertex AI | - |

#### ⚡️支持的模型与提供商完整列表见 [models.litellm.ai](https://models.litellm.ai/)
| 成本追踪 | 🟡 | [如需此功能请告诉我们](https://github.com/BerriAI/litellm/issues) |
| 日志 | ✅ | 适用于所有日志集成 |


在 litellm 的 config.yaml 中添加 `finetune_settings` 与 `files_settings`，即可使用微调（fine-tuning）端点。
## `finetune_settings` 与 `files_settings` 的 config.yaml 示例
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# For /fine_tuning/jobs endpoints
finetune_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
  - custom_llm_provider: "vertex_ai"
    vertex_project: "adroit-crow-413218"
    vertex_location: "us-central1"
    vertex_credentials: "/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json"

# for /files endpoints
files_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: fake-key
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
```

## 创建微调文件

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
client = AsyncOpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000") # base_url is your litellm proxy url

file_name = "openai_batch_completions.jsonl"
response = await client.files.create(
    extra_headers={"custom-llm-provider": "azure"}, # tell litellm proxy which provider to use
    file=open(file_name, "rb"),
    purpose="fine-tune",
)
```
</TabItem>
<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: azure" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```
</TabItem>
</Tabs>

## 创建微调任务

<Tabs>
<TabItem value="azure" label="Azure OpenAI">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
ft_job = await client.fine_tuning.jobs.create(
    model="gpt-4.1-2025-04-14",                   # Azure OpenAI model you want to fine-tune
    training_file="file-abc123",                 # file_id from create file response
    extra_headers={"custom-llm-provider": "azure"}, # tell litellm proxy which provider to use
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "custom-llm-provider: azure" \
    -d '{
    "model": "gpt-4.1-2025-04-14",
    "training_file": "file-abc123"
    }'
```
</TabItem>
</Tabs>

</TabItem>

</Tabs>

### 请求体

<Tabs>
<TabItem value="params" label="支持的参数">

* `model`

    **类型**：string  
    **必填**：是  
    要微调的模型名称。

* `custom_llm_provider`

    **类型**：`Literal["azure", "openai", "vertex_ai"]`

    **必填**：是
    要微调的模型名称。可从[**支持的提供商**](/docs/fine_tuning#支持的-hyperparameters)中选择一个。

* `training_file`

    **类型**：string  
    **必填**：是  
    包含训练数据的已上传文件 ID。
    - 上传文件的方法参见 **上传文件**。
    - 数据集必须为 JSONL 文件格式。

* `hyperparameters`

    **类型**：object  
    **必填**：否  
    微调任务所用的超参数。
    > #### 支持的 `hyperparameters`
    > #### batch_size
    **类型**：string 或 integer  
    **必填**：否  
    每个批次中的样本数量。批次越大，模型参数更新得越不频繁，但方差也更小。
    > #### learning_rate_multiplier
    **类型**：string 或 number  
    **必填**：否  
    学习率的缩放因子。较小的学习率可能有助于避免过拟合。

    > #### n_epochs
    **类型**：string 或 integer  
    **必填**：否  
    模型要训练的 epoch 数。一个 epoch 指对训练数据集的完整遍历一轮。

* `suffix`
    **类型**：string 或 null  
    **必填**：否  
    **默认值**：null  
    最长 18 个字符的字符串，将附加到微调后的模型名称中。
    示例：`suffix` 为 “custom-model-name” 时，生成的模型名称形如 `ft:gpt-4o-mini:openai:custom-model-name:7p4lURel`。

* `validation_file`
    **类型**：string 或 null  
    **必填**：否  
    包含验证数据的已上传文件 ID。
    - 若提供，微调期间会定期使用这些数据生成验证指标。


* `integrations`
    **类型**：array 或 null  
    **必填**：否  
    要为微调任务启用的集成列表。

* `seed`
    **类型**：integer 或 null  
    **必填**：否  
    seed 用于控制任务的可复现性。传入相同的 seed 与任务参数应能得到相同的结果，但在极少数情况下也可能有差异。若未指定 seed，系统会自动生成一个。

</TabItem>
<TabItem value="example" label="请求体示例">

```json
{
  "model": "gpt-4.1-mini-2025-04-14",
  "training_file": "file-abcde12345",
  "hyperparameters": {
    "batch_size": 4,
    "learning_rate_multiplier": 0.1,
    "n_epochs": 3
  },
  "suffix": "custom-model-v1",
  "validation_file": "file-fghij67890",
  "seed": 42
}
```
</TabItem>
</Tabs>

## 取消微调任务

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
# cancel specific fine tuning job
cancel_ft_job = await client.fine_tuning.jobs.cancel(
    fine_tuning_job_id="123",                          # fine tuning job id
    extra_headers={"custom-llm-provider": "azure"},       # tell litellm proxy which provider to use
)

print("response from cancel ft job={}".format(cancel_ft_job))
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl -X POST http://localhost:4000/v1/fine_tuning/jobs/ftjob-abc123/cancel \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -H "custom-llm-provider: azure"
```
</TabItem>

</Tabs>

## 列出微调任务

<Tabs>

<TabItem value="openai" label="OpenAI Python SDK">

```python
list_ft_jobs = await client.fine_tuning.jobs.list(
    extra_headers={"custom-llm-provider": "azure"}   # tell litellm proxy which provider to use
)

print("list of ft jobs={}".format(list_ft_jobs))
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl -X GET 'http://localhost:4000/v1/fine_tuning/jobs' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $LITELLM_API_KEY" \
     -H "custom-llm-provider: azure"
```
</TabItem>

</Tabs>



## [👉 Proxy API 参考](https://docs.litellm.ai/api-reference/#/fine-tuning)
