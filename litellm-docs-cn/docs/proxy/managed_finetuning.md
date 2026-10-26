# ✨ [测试版] LiteLLM 托管文件与微调

<EnterpriseFeature free />

| 属性 | 取值 | 说明 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | 需要 postgres 数据库存储文件 ID。 |
| 可在所有[批处理提供商](../batches#支持的提供商)中使用 | ✅ |  |
| 支持的端点 | `/fine_tuning/jobs` |  |

## 概览

用途：

- 以 OpenAI 格式在 OpenAI/Azure/Vertex AI 上创建微调（finetuning）任务（无需额外的 `custom_llm_provider` 参数）。
- 按密钥/用户/团队控制微调模型的访问权限（与对话补全模型的管控方式相同）。


## （代理管理员）用法

下面介绍如何让开发者使用你的微调模型。

### 1. 配置 config.yaml

在 `supported_endpoints` 列表中加入 `/fine_tuning`。这样开发者就能知道该模型支持 `/fine_tuning` 端点。

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "gpt-4.1-openai"
    litellm_params:
      model: gpt-4.1
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supported_endpoints: ["/chat/completions", "/fine_tuning"]
```

### 2. 创建虚拟密钥

```bash showLineNumbers title="create_virtual_key.sh"
curl -L -X POST 'https://{PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4.1-openai"]}'
```


现在就可以用这把虚拟密钥（virtual key）访问微调模型了（参见开发者流程）。

## （开发者）用法

下面介绍如何创建 LiteLLM 托管文件，并基于该文件执行微调的增删改查（CRUD）操作。

### 1. 创建 request.jsonl


```json showLineNumbers title="request.jsonl"
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already."}]}
{"messages": [{"role": "system", "content": "Clippy is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?"}]}
```

### 2. 上传文件

指定 `target_model_names: "<model-name>"`，即可启用 LiteLLM 托管文件与请求校验。

model-name 应与 request.jsonl 中的 model-name 保持一致。

```python showLineNumbers title="create_finetuning_job.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",
)

# Upload file
finetuning_input_file = client.files.create(
    file=open("./request.jsonl", "rb"),
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"}
)
print(finetuning_input_file)

```


**文件会被写入到哪里？**

文件会写入所有 gpt-4.1-openai 部署（deployment）。这样在第 3 步创建任务时，就能在所有 gpt-4.1-openai 部署之间进行负载均衡（load balancing）。任务创建后，后续的 retrieve/list/cancel 操作都会被路由到该任务所在的部署。

### 3. 创建微调任务

```python showLineNumbers title="create_finetuning_job.py"
... # Step 2

file_id = finetuning_input_file.id

# Create Finetuning Job
ft_job = client.fine_tuning.jobs.create(
    model="gpt-4.1-openai",  # litellm public model name you want to finetune                  
    training_file=file_id,
)
```

### 4. 检索微调任务

```python showLineNumbers title="create_finetuning_job.py"
... # Step 3

response = client.fine_tuning.jobs.retrieve(ft_job.id)
print(response)
```

### 5. 列出微调任务

```python showLineNumbers title="create_finetuning_job.py"
...

client.fine_tuning.jobs.list(extra_query={"target_model_names": "gpt-4.1-openai"})
```

### 6. 取消微调任务

```python showLineNumbers title="create_finetuning_job.py"
...

cancel_ft_job = client.fine_tuning.jobs.cancel(
    fine_tuning_job_id=ft_job.id,                          # fine tuning job id
)
```



## 端到端示例

```python showLineNumbers title="create_finetuning_job.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-...",
    max_retries=0
)


# Upload file
finetuning_input_file = client.files.create(
    file=open("./fine_tuning.jsonl", "rb"), # {"model": "azure-gpt-4o"} <-> {"model": "gpt-4o-my-special-deployment"}
    purpose="fine-tune",
    extra_body={"target_model_names": "gpt-4.1-openai"} # 👈 Tells litellm which regions/projects to write the file in. 
)
print(finetuning_input_file) # file.id = "litellm_proxy/..." = {"model_name": {"deployment_id": "deployment_file_id"}}

file_id = finetuning_input_file.id
# # file_id = "bGl0ZWxs..."

# ## create fine-tuning job 
ft_job = client.fine_tuning.jobs.create(
    model="gpt-4.1-openai",  # litellm model name you want to finetune                  
    training_file=file_id,
)

print(f"ft_job: {ft_job}")

ft_job_id = ft_job.id
## cancel fine-tuning job 
cancel_ft_job = client.fine_tuning.jobs.cancel(
    fine_tuning_job_id=ft_job_id,                          # fine tuning job id
)

print("response from cancel ft job={}".format(cancel_ft_job))
# list fine-tuning jobs 
list_ft_jobs = client.fine_tuning.jobs.list(
    extra_query={"target_model_names": "gpt-4.1-openai"}   # tell litellm proxy which provider to use
)

print("list of ft jobs={}".format(list_ft_jobs))

# get fine-tuning job 
response = client.fine_tuning.jobs.retrieve(ft_job.id)
print(response)
```

## 常见问题

### 我的文件会被写入到哪里？

指定 `target_model_names` 后，文件会写入所有与 `target_model_names` 匹配的部署。

无需任何额外的基础设施。
