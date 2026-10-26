# 提示词压缩（`compress()`）

:::info[测试中]

该功能目前处于 Beta 阶段。在正式发布之前，API 与行为可能发生变化。

:::

调用 `completion()` 之前，可以先用 `litellm.compress()` 压缩冗长的对话历史。

该函数会保留高相关性与较新的上下文，把低相关内容替换成轻量存根（stub），并返回一个检索工具，模型只在需要时才借此取回完整内容。

如果你是代理（proxy）用户，希望压缩改由外部服务在服务端完成，而不是进程内调用，请参考 [Headroom](/docs/proxy/headroom)。

## 快速上手

```python
import litellm
from litellm.types.utils import CallTypes

messages = [
    {"role": "system", "content": "You are a coding assistant."},
    {"role": "user", "content": "# auth.py\n" + "def authenticate():\n    pass\n" * 2000},
    {"role": "user", "content": "# utils.py\n" + "def helper():\n    pass\n" * 2000},
    {"role": "user", "content": "Fix the bug in auth.py"},
]

compressed = litellm.compress(
    messages=messages,
    model="{{openai_large}}",
    call_type=CallTypes.completion,
    compression_trigger=1000,
    compression_target=500,
)

response = litellm.completion(
    model="{{openai_large}}",
    messages=compressed["messages"],
    tools=compressed["tools"],
)
```

## 返回值

`compress()` 返回一个字典，包含：

- `messages`：压缩后的对话消息
- `original_tokens`：压缩前的 Token 数
- `compressed_tokens`：压缩后的 Token 数
- `compression_ratio`：被移除 Token 的占比
- `cache`：存根键到原始完整内容的键值映射
- `tools`：用于按需还原的检索工具定义（`litellm_content_retrieve`）

## 参数

- `messages`（`List[dict]`，必填）：输入的对话消息
- `model`（`str`，必填）：用于 Token 计数的模型名称
- `call_type`（`CallTypes`，默认 `CallTypes.completion`）：这批消息所遵循的 LiteLLM 调用类型对应的消息结构。支持的取值：`CallTypes.completion` / `CallTypes.acompletion`（OpenAI chat-completions 结构）与 `CallTypes.anthropic_messages`（Anthropic Messages 结构）
- `compression_trigger`（`int`，默认 `200000`）：输入 Token 数超过该值时才执行压缩
- `compression_target`（`Optional[int]`，默认为 `compression_trigger` 的 70%）：期望的压缩后 Token 预算
- `embedding_model`（`Optional[str]`）：设置后，相关性打分会结合 BM25 与嵌入（embedding）两种方式
- `embedding_model_params`（`Optional[dict]`）：传给 `litellm.embedding()` 的额外关键字参数
- `compression_cache`（`Optional[DualCache]`）：嵌入打分所用的可选缓存

## 行为说明

- 消息 Token 数低于 `compression_trigger` 时原样透传。
- 系统消息、最后一条用户消息和最后一条助手消息始终保留。
- 如果某条相关消息放不进剩余预算，`compress()` 可能保留其截断版本。
- 被压缩掉的内容不会丢失；它们存放在 `cache` 中，可凭 `litellm_content_retrieve` 取回。

## 处理检索工具调用

如果模型调用了 `litellm_content_retrieve`，就在 `compressed["cache"]` 中查找所请求的键，并把对应值作为工具输出返回。

```python
import json

tool_call = response.choices[0].message.tool_calls[0]
args = json.loads(tool_call.function.arguments)
full_content = compressed["cache"][args["key"]]
```

## 服务端回调循环（`/v1/messages`） {#server-side-callback-loop-v1messages}

你可以启用基于回调的压缩拦截，让 Anthropic Messages 调用的检索循环对上层完全透明：

```yaml
litellm_settings:
  callbacks: ["compression_interception"]
  compression_interception_params:
    enabled: true
    compression_trigger: 10000
    compression_target: 7000
```

启用后，LiteLLM 会在服务端依次执行以下流程：

1. 在首次调用提供商（provider）之前压缩入站消息。
2. 注入 `litellm_content_retrieve` 工具。
3. 检测模型响应中的检索类 `tool_use` 块。
4. 从压缩缓存中解析检索键。
5. 借助 agentic 循环重新调用模型，并返回最终答案。

## 性能

基于 [SWE-bench Lite](https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite_bm25_27K) 进行基准测试（真实 GitHub issue，每个问题附带约 27k Token 经 BM25 检索的仓库上下文）。

### Claude Opus：5 个问题，trigger=10k

| 指标 | 基线 | 压缩后 | 差值 |
|---|---|---|---|
| 文件重叠度 | 1.000 | 1.000 | +0.000 |
| 文件完全匹配 | 100% | 100% | +0.0% |
| Hunk 重叠度 | 0.582 | 0.361 | -0.221 |
| 内容相似度 | 0.367 | 0.373 | +0.006 |
| 平均提示词 Token 数 | 30,828 | 6,890 | -77.7% |
| 每个问题的平均成本 | $0.488 | $0.136 | **-72.0%** |

**关键结论**：

- **文件级定位完全保留**：无论是否压缩，模型编辑的都是同一批文件。
- **内容相似度与基线持平**：实际改动的代码行大体相当。
- **Hunk 重叠度小幅下降**（-0.221）。模型仍能定位到正确的文件，但由于上下文变少，编辑的行范围可能略有出入。
- **成本节省 72%**，Token 减少 78%。

### 指标说明

| 指标 | 含义 |
|---|---|
| **文件重叠度** | 生成的补丁中包含标准补丁（gold patch）文件的比例 |
| **文件完全匹配** | 生成的补丁是否恰好触及同一组文件 |
| **Hunk 重叠度** | 生成的 hunk 覆盖标准补丁行范围的比例 |
| **内容相似度** | 标准补丁与生成补丁之间改动行（新增/删除）的 Jaccard 相似度 |

### 运行 SWE-bench 评测

```bash
# 5 个问题的快速检查
python tests/eval_swe_bench.py --model {{anthropic_large}} --problems 5

# 自定义 trigger/target
python tests/eval_swe_bench.py --model {{openai_large}} --problems 20 \
    --compression-trigger 15000 --compression-target 10000

# 启用嵌入打分
python tests/eval_swe_bench.py --model {{openai_large}} --problems 10 \
    --embedding-model text-embedding-3-small
```

### 运行 HumanEval 风格评测

```bash
python scripts/eval_compression.py --model {{openai_large}} --problems 5
```
