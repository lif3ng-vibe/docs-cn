# 智能体循环钩子（Agentic Loop Hook）

构建一个 `CustomLogger` 回调，拦截模型响应、在服务端完成工具调用，然后重新运行模型，整个过程对调用方完全透明。

:::info[支持的调用类型]
- 仅限 `async` 异步调用（同步调用不会触发钩子）
- 流式 `/v1/messages` 已支持：上游流在被缓冲的同时透传给调用方，流结束时运行钩子，后续响应会作为第二个 `message_start` ... `message_stop` 序列追加到同一条 SSE 流上
- 流式 `/v1/chat/completions` 不会触发钩子，只有非流式的对话补全（chat completions）会被检查
- 同时适用于 `/v1/messages` 和 `/v1/chat/completions`
:::

## 实现回调

在 `CustomLogger` 上重写两个方法：

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.integrations.custom_logger import AgenticLoopPlan, AgenticLoopRequestPatch

MY_TOOL = "my_tool"

class MyToolCallback(CustomLogger):

    async def async_should_run_agentic_loop(
        self, response, model, messages, tools, stream, custom_llm_provider, kwargs
    ):
        # Return (True, context_dict) if there are tool calls to handle
        content = getattr(response, "content", None) or []
        calls = [b for b in content if isinstance(b, dict)
                 and b.get("type") == "tool_use" and b.get("name") == MY_TOOL]
        if not calls:
            return False, {}
        return True, {"tool_calls": calls}

    async def async_build_agentic_loop_plan(
        self, tools, model, messages, response,
        anthropic_messages_provider_config,
        anthropic_messages_optional_request_params,
        logging_obj, stream, kwargs,
    ):
        calls = tools["tool_calls"]
        results = [f"result for {c['input']}" for c in calls]  # your logic here

        follow_up = messages + [
            {"role": "assistant", "content": [
                {"type": "tool_use", "id": c["id"], "name": c["name"], "input": c["input"]}
                for c in calls
            ]},
            {"role": "user", "content": [
                {"type": "tool_result", "tool_use_id": c["id"], "content": results[i]}
                for i, c in enumerate(calls)
            ]},
        ]
        return AgenticLoopPlan(
            run_agentic_loop=True,
            request_patch=AgenticLoopRequestPatch(messages=follow_up),
        )
```

对于 `/v1/chat/completions`，改为重写 `async_build_chat_completion_agentic_loop_plan`。思路相同，只是用 `optional_params` 取代 `anthropic_messages_optional_request_params`。

## 注册回调

```python
import litellm
litellm.callbacks = [MyToolCallback()]
```

也可以在 `config.yaml` 中配置，指向模块中创建好的实例：

```python
# my_module.py, after the class definition above
my_tool_callback = MyToolCallback()
```

```yaml
litellm_settings:
  callbacks: ["my_module.my_tool_callback"]
```

:::warning
点分路径必须写实例而不是类。写成 `callbacks: ["my_module.MyToolCallback"]` 会导致配置加载失败；在尚未加入这项校验的旧版本上，服务能正常启动，但钩子永远不会被触发
:::

## `AgenticLoopPlan` 字段

| 字段 | 作用 |
|---|---|
| `run_agentic_loop=True` + `request_patch` | 使用修补后的请求重新运行模型 |
| `response_override` | 将该值直接返回给调用方（不重新运行） |
| `terminate=True` | 停止循环，返回当前响应 |
| `run_agentic_loop=False`（默认） | 跳过，继续检查下一个回调 |

`AgenticLoopRequestPatch` 接受：`model`、`messages`、`tools`、`max_tokens`、`optional_params`、`kwargs`。

## 循环安全

- 默认最多重新运行 `3` 次，可用 `kwargs["max_agentic_loops"]` 按请求覆盖
- 完全相同的工具调用指纹会自动终止循环
- 当前循环深度存于 `kwargs["_agentic_loop_depth"]`

## 本仓库中的示例

- `litellm/integrations/compression_interception/handler.py`
- `litellm/integrations/websearch_interception/handler.py`
