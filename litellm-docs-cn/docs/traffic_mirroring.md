import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# A/B 测试 - 流量镜像

流量镜像（traffic mirroring）让你能把生产流量"模仿"一份，发往另一个静默（silent）模型进行评估。静默模型的响应在后台收集，不会影响主请求的延迟或结果。

常见用途包括：
- 切换模型前，先用生产环境的提示词检验新模型的表现。
- 对比不同提供商之间的成本与延迟。
- 把流量镜像到输出更详细的模型，方便排查问题。

## 快速上手

要启用流量镜像，只需在某个部署（deployment）的 `litellm_params` 中加上 `silent_model`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

model_list = [
    {
        "model_name": "{{openai_small}}",
        "litellm_params": {
            "model": "azure/chatgpt-v-2",
            "api_key": "...",
            "silent_model": "{{openai_large}}" # 👈 Mirror traffic to {{openai_large}}
        },
    },
    {
        "model_name": "{{openai_large}}",
        "litellm_params": {
            "model": "openai/{{openai_large}}",
            "api_key": "..."
        },
    }
]

router = Router(model_list=model_list)

# The request to "{{openai_small}}" will trigger a background call to "{{openai_large}}"
response = await router.acompletion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "How does traffic mirroring work?"}]
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

在 `config.yaml` 中加上 `silent_model`：

```yaml
model_list:
  - model_name: primary-model
    litellm_params:
      model: azure/{{openai_small}}
      api_key: os.environ/AZURE_API_KEY
      silent_model: evaluation-model # 👈 Mirror traffic here
  - model_name: evaluation-model
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

## 工作原理
1. **收到请求**：请求发往某个模型组（model group），例如 `primary-model`。
2. **选定部署**：LiteLLM 从该模型组中挑出一个部署。
3. **主调用**：LiteLLM 向主部署发起调用。
4. **镜像**：如果配置了 `silent_model`，LiteLLM 会在后台向该模型发起一次调用。
   - **同步**调用：使用共享线程池。
   - **异步**调用：使用 `asyncio.create_task`。
5. **隔离**：后台调用使用原始请求参数的一份 `deepcopy`，并设置 `metadata["is_silent_experiment"] = True`，同时剔除日志相关的 ID，避免干扰用量统计。

## 核心特性
- **延迟隔离**：主请求一就绪立即返回，后台（静默）调用不会阻塞它。
- **统一日志**：后台调用同样经由 Router 处理，因此会自动记录到你配置的可观测性（observability）工具（Langfuse、S3 等）。
- **评估**：在日志中用 `is_silent_experiment: True` 标记筛选出镜像调用，与主调用的结果进行对比。
