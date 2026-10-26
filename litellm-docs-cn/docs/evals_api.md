# /evals

LiteLLM 代理支持 OpenAI 的评估（Evals）API，让你能够创建、管理和运行评估，衡量模型在既定测试标准下的表现。

## Evals 是什么？

OpenAI Evals API 提供了一套结构化的方式：
- **创建评估**：定义用于评估模型输出的测试标准与数据源
- **运行评估**：针对特定模型和数据集执行评估
- **追踪结果**：监控评估进度并查看详细结果

## 快速上手

### 搭建 LiteLLM 代理

首先，启动你的 LiteLLM 代理服务器：

```bash
litellm --config config.yaml

# 代理将运行在 http://localhost:4000
```

### 初始化 OpenAI 客户端

```python
from openai import OpenAI

# Point to your LiteLLM Proxy
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM proxy API key
    base_url="http://localhost:4000"  # Your proxy URL
)
```


异步操作则使用：

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)
```

---

## 评估管理

### 创建评估

创建一个评估，配置测试标准与数据源。

#### 示例：情感分类评估

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

# Create evaluation with label model grader
eval_obj = client.evals.create(
    name="Sentiment Classification",
    data_source_config={
        "type": "stored_completions",
        "metadata": {"usecase": "chatbot"}
    },
    testing_criteria=[
        {
            "type": "label_model",
            "model": "{{openai_small}}",
            "input": [
                {
                    "role": "developer",
                    "content": "Classify the sentiment of the following statement as one of 'positive', 'neutral', or 'negative'"
                },
                {
                    "role": "user",
                    "content": "Statement: {{item.input}}"
                }
            ],
            "passing_labels": ["positive"],
            "labels": ["positive", "neutral", "negative"],
            "name": "Sentiment Grader"
        }
    ]
)

# Note: If you want to use model-specific credentials for this evaluation, you can specify the model name in the extra body parameters.

print(f"Created eval: {eval_obj.id}")
print(f"Eval name: {eval_obj.name}")
```

#### 示例：推送通知摘要器监控

本示例演示如何监控推送通知摘要器的提示词变更，检查是否出现回归：

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

# Define data source for stored completions
data_source_config = {
    "type": "stored_completions",
    "metadata": {
        "usecase": "push_notifications_summarizer"
    }
}

# Define grader criteria
GRADER_DEVELOPER_PROMPT = """
Label the following push notification summary as either correct or incorrect.
The push notification and the summary will be provided below.
A good push notification summary is concise and snappy.
If it is good, then label it as correct, if not, then incorrect.
"""

GRADER_TEMPLATE_PROMPT = """
Push notifications: {{item.input}}
Summary: {{sample.output_text}}
"""

push_notification_grader = {
    "name": "Push Notification Summary Grader",
    "type": "label_model",
    "model": "{{openai_small}}",
    "input": [
        {
            "role": "developer",
            "content": GRADER_DEVELOPER_PROMPT,
        },
        {
            "role": "user",
            "content": GRADER_TEMPLATE_PROMPT,
        },
    ],
    "passing_labels": ["correct"],
    "labels": ["correct", "incorrect"],
}

# Create the evaluation
eval_result = await client.evals.create(
    name="Push Notification Completion Monitoring",
    metadata={"description": "This eval monitors completions"},
    data_source_config=data_source_config,
    testing_criteria=[push_notification_grader],
)

eval_id = eval_result.id
print(f"Created eval: {eval_id}")
```

### 列出评估

获取全部评估的列表，支持分页。

```python
# List all evaluations
evals_response = client.evals.list(
    limit=20,
    order="desc"
)

for eval in evals_response.data:
    print(f"Eval ID: {eval.id}, Name: {eval.name}")

# Check if there are more evals
if evals_response.has_more:
    # Fetch next page
    next_evals = client.evals.list(
        after=evals_response.last_id,
        limit=20
    )
```

### 获取特定评估

按 ID 获取特定评估的详情。

```python
eval = client.evals.retrieve(
    eval_id="eval_abc123"
)

print(f"Eval ID: {eval.id}")
print(f"Name: {eval.name}")
print(f"Data Source: {eval.data_source_config}")
print(f"Testing Criteria: {eval.testing_criteria}")
```

### 更新评估

更新评估的元数据或名称。

```python
updated_eval = client.evals.update(
    eval_id="eval_abc123",
    name="Updated Evaluation Name",
    metadata={
        "version": "2.0",
        "updated_by": "user@example.com"
    }
)

print(f"Updated eval: {updated_eval.name}")
```

### 删除评估

永久删除一个评估。

```python
delete_response = client.evals.delete(
    eval_id="eval_abc123"
)

print(f"Deleted: {delete_response.deleted}")  # True
```

---

## 评估运行

### 创建运行

通过创建运行（run）来执行一次评估。运行会把你的数据送入模型处理，并应用测试标准。

#### 使用已存储的补全

首先，通过携带元数据的对话补全生成一批测试数据：

```python
from openai import AsyncOpenAI
import asyncio

client = AsyncOpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

# Generate test data with different prompt versions
push_notification_data = [
    """
- New message from Sarah: "Can you call me later?"
- Your package has been delivered!
- Flash sale: 20% off electronics for the next 2 hours!
""",
    """
- Weather alert: Thunderstorm expected in your area.
- Reminder: Doctor's appointment at 3 PM.
- John liked your photo on Instagram.
"""
]

PROMPTS = [
    (
        """
        You are a helpful assistant that summarizes push notifications.
        You are given a list of push notifications and you need to collapse them into a single one.
        Output only the final summary, nothing else.
        """,
        "v1"
    ),
    (
        """
        You are a helpful assistant that summarizes push notifications.
        You are given a list of push notifications and you need to collapse them into a single one.
        The summary should be longer than it needs to be and include more information than is necessary.
        Output only the final summary, nothing else.
        """,
        "v2"
    )
]

# Create completions with metadata for tracking
tasks = []
for notifications in push_notification_data:
    for (prompt, version) in PROMPTS:
        tasks.append(client.chat.completions.create(
            model="{{openai_small}}",
            messages=[
                {"role": "developer", "content": prompt},
                {"role": "user", "content": notifications},
            ],
            metadata={
                "prompt_version": version,
                "usecase": "push_notifications_summarizer"
            }
        ))

await asyncio.gather(*tasks)
```

接下来创建运行，评估不同的提示词版本：

```python
# Grade prompt_version=v1
eval_run_result = await client.evals.runs.create(
    eval_id=eval_id,
    name="v1-run",
    data_source={
        "type": "completions",
        "source": {
            "type": "stored_completions",
            "metadata": {
                "prompt_version": "v1",
            }
        }
    }
)

print(f"Run ID: {eval_run_result.id}")
print(f"Status: {eval_run_result.status}")
print(f"Report URL: {eval_run_result.report_url}")

# Grade prompt_version=v2
eval_run_result_v2 = await client.evals.runs.create(
    eval_id=eval_id,
    name="v2-run",
    data_source={
        "type": "completions",
        "source": {
            "type": "stored_completions",
            "metadata": {
                "prompt_version": "v2",
            }
        }
    }
)

print(f"Run ID: {eval_run_result_v2.id}")
print(f"Report URL: {eval_run_result_v2.report_url}")
```

#### 使用不同模型的补全

测试不同模型在相同输入上的表现：

```python
# Test with {{openai_large}} using stored completions as input
tasks = []
for prompt_version in ["v1", "v2"]:
    tasks.append(client.evals.runs.create(
        eval_id=eval_id,
        name=f"gpt-5.6-terra-run-{prompt_version}",
        data_source={
            "type": "completions",
            "input_messages": {
                "type": "item_reference",
                "item_reference": "item.input",
            },
            "model": "{{openai_large}}",
            "source": {
                "type": "stored_completions",
                "metadata": {
                    "prompt_version": prompt_version,
                }
            }
        }
    ))

results = await asyncio.gather(*tasks)
for run in results:
    print(f"Report URL: {run.report_url}")
```

### 列出运行

获取特定评估下的全部运行。

```python
# List all runs for an evaluation
runs_response = client.evals.runs.list(
    eval_id="eval_abc123",
    limit=20,
    order="desc"
)

for run in runs_response.data:
    print(f"Run ID: {run.id}")
    print(f"Status: {run.status}")
    print(f"Name: {run.name}")
    if run.result_counts:
        print(f"Results: {run.result_counts.passed}/{run.result_counts.total} passed")
```

### 获取运行详情

获取某次运行的详细信息，包括结果。

```python
run = client.evals.runs.retrieve(
    eval_id="eval_abc123",
    run_id="run_def456"
)

print(f"Run ID: {run.id}")
print(f"Status: {run.status}")
print(f"Started: {run.started_at}")
print(f"Completed: {run.completed_at}")

# Check results
if run.result_counts:
    print(f"\nOverall Results:")
    print(f"Total: {run.result_counts.total}")
    print(f"Passed: {run.result_counts.passed}")
    print(f"Failed: {run.result_counts.failed}")
    print(f"Error: {run.result_counts.errored}")

# Per-criteria results
if run.per_testing_criteria_results:
    for criteria_result in run.per_testing_criteria_results:
        print(f"\nCriteria {criteria_result.testing_criteria_index}:")
        print(f"  Passed: {criteria_result.result_counts.passed}")
        print(f"  Average Score: {criteria_result.average_score}")
```

### 删除运行

永久删除某次运行及其结果。

```python
delete_response = await client.evals.runs.delete(
    eval_id="eval_abc123",
    run_id="run_def456"
)

print(f"Deleted: {delete_response.deleted}")  # True
print(f"Run ID: {delete_response.run_id}")
```
