# 保留思考的前缀稳定性

支持跨轮次保留思考的 Claude 模型会给每个思考块签名，并将它绑定到产生它的那次请求。当你以 `thinking-binding-controls-2026-08-01` beta 回放对话时，Anthropic 会检查该思考块之前的请求部分是否仍与创建该块时的内容一致：顶层的 `system` 提示词、`tools` 列表，以及它之前的每条消息。前缀一旦改变，要么丢弃该思考块（`prefix_mismatch_behavior: drop_block`，Anthropic 会在 `input_transformations` 中报告一条 `thinking_dropped` 条目），要么以 400 拒绝请求并指明不一致的部分（`prefix_mismatch_behavior: error`）。`cache_control` 标记不参与比较

经 LiteLLM 转发时，模型看到的是 LiteLLM 构建出的请求，因此任何会改写对话的功能，都必须在每次请求中以相同方式改写较早的轮次。本页列出 LiteLLM 对每个触及前缀的功能做了什么、在各提供商上如何安放对话中段（mid-conversation）的 `system` 消息，以及哪些改动会按设计破坏前缀

## 开启这项检查

发送 beta 请求头，并在 `thinking` 内传入 `block_binding` 设置。二者经 `/v1/chat/completions` 原样透传

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/{{anthropic_large}}",
    "max_tokens": 4096,
    "extra_headers": {"anthropic-beta": "thinking-binding-controls-2026-08-01"},
    "thinking": {"type": "adaptive", "block_binding": {"prefix_mismatch_behavior": "error"}},
    "messages": [
      {"role": "system", "content": "You are a terse assistant."},
      {"role": "user", "content": "Which box do I open first?"}
    ]
  }'
```

下一轮时，将助手消息按 LiteLLM 返回的原样回放（包括 `thinking_blocks`），再追加新的用户消息。使用 `error` 时，前缀一旦改变就会返回 400，报错信息会说明哪一部分不一致，例如 `The system prompt differs from the one this block was created with`。使用 `drop_block` 时请求仍会成功，模型会在缺失先前推理的情况下作答，Anthropic 的响应带有 `input_transformations`，其中一条 `thinking_dropped` 条目会指明被丢弃的块；代理以 `--detailed_debug` 运行时会打印该条目

## 各功能下 LiteLLM 的行为

| 功能 | 对前缀的影响 | 说明 |
|---|---|---|
| `/v1/chat/completions` 上的对话中段 `system` 消息 | 稳定 | 仅依据相邻消息安放，追加轮次不会移动它（详见下文） |
| 提示词管理，每轮变量相同 | 稳定 | 模板每次渲染出的开头消息都一致 |
| 提示词管理，变量或提示词版本发生变化 | 按设计破坏 | 开头消息随之改变，此前创建的每个思考块要么被丢弃，要么请求直接失败 |
| Presidio PII 脱敏 | 稳定 | 每条消息独立脱敏，且同一文本的替换结果是确定的 |
| `modify_params` 为无结果的工具调用补插占位工具结果 | 稳定 | 插入的结果只取决于它所回应的那个工具调用 |
| `modify_params` 对助手预填充（prefill）做末尾空白裁剪 | 不会触发 | 思考模式会拒绝助手预填充，因此开启思考后该裁剪不会执行 |
| MCP（Model Context Protocol）工具注入 | 服务器工具列表变化时会破坏 | `tools` 每次请求都从服务器重建 |
| `cache_control` 标记 | 不参与比较 | Anthropic 在比较时会排除它们 |

## 对话中段的 `system` 消息

OpenAI 风格的客户端可以把 `system` 消息放在 `messages` 的任意位置。Anthropic 的 Messages API 在被 LiteLLM 标记为 `supports_mid_conversation_system` 的模型上（Claude Opus 4.8 与 Claude 5 一代及之后）接受 `messages` 内出现 `system` 角色，但只接受一种形态：该消息必须紧跟在用户轮次之后，并且要么紧邻助手轮次之前，要么位于数组末尾，且两条 `system` 消息不能相邻。Bedrock Converse 在所有模型上都拒绝 `messages` 内的 `system` 角色

LiteLLM 过去会把每条 `system` 消息都提升到顶层 `system` 提示词里。到了第 N+1 轮，这等于改动了第 N 轮创建思考块时所用的 `system`，于是任何在对话中加了提醒的会话，绑定校验都会在第二轮失败。LiteLLM 现在只依据相邻消息来安放每一组连续的 `system` 消息。紧跟用户轮次的一组，会以 `role: system` 的形式留在用户轮次之后。跟在助手轮次后面的一组，会挪到下一个用户轮次之后，因此 `[user, assistant, system, user]` 会以 `[user, assistant, user, system]` 发出。如果一组后面没有用户轮次（即它位于数组末尾，或接下来是助手轮次），它会在原位转成用户轮次，并加上操作者说明前缀。落在同一位置的多组会合并成一条 `system` 消息。每次判断只看这组消息紧邻的内容，从不看它之后的部分，因此回放对话时即便追加了更多轮次，先前每一组的位置都保持不变，前缀逐字节一致

| 路由 | 被标记为 `supports_mid_conversation_system` 的模型 | 其他 Claude 模型 |
|---|---|---|
| `/v1/chat/completions` 上的 Anthropic、Vertex AI、Azure AI Foundry 与 Bedrock Invoke | 在 `messages` 内保留为 `role: system`，按上文方式安放 | 在原位转成用户轮次，加操作者说明前缀 |
| `/v1/chat/completions` 上的 Bedrock Converse | 在原位转成用户轮次，加操作者说明前缀 | 同左 |
| `/v1/messages` | 原样发送 | 原样发送 |

操作者说明的内容是 `Operator note (not from the user): the following was originally a mid-conversation system-role reminder.`，后接原始文本，这样模型仍能知道该指令并非来自用户。`litellm.supports_mid_conversation_system("{{anthropic_large}}", "anthropic")` 可以告诉你某个模型是否保留 `system` 角色

## 按设计会破坏前缀的改动

有些改写无法做到稳定，因为输入本身就变了。用不同的变量值渲染提示词模板，或者换用新版本的提示词，都会产生不同的开头消息，而在旧消息下创建的每个思考块都会失去绑定。在对话存续期间保持变量与提示词版本不变；要加新指令，就在末尾追加一条新消息，而不是去改变量。MCP 服务器同理：LiteLLM 每次请求都会拉取服务器的工具列表，因此服务器在两轮之间增删或重命名工具，就会改变 `tools`。对话开启期间请保持工具集稳定，否则要接受改动之后那一轮思考块被丢弃

如果你的应用无法保证这一点，建议用 `prefix_mismatch_behavior: drop_block` 而非 `error`：请求仍会成功，模型在缺失先前推理的情况下作答，而 `thinking_dropped` 条目会告诉你哪个块受到了影响

## 只追加的对话

让思考块保持绑定的规则只有一条：绝不改动已经发送过的内容。每条助手消息都按 LiteLLM 返回的原样回放（包括 `thinking_blocks`），新的用户消息、工具结果和提醒一律追加在末尾，并在整个对话期间保持 `system`、`tools` 与提示词变量不变。LiteLLM 对对话中段 `system` 消息的安放、PII 脱敏以及占位工具结果，都遵循同一条规则，因此只做追加的客户端，每一轮发出的前缀都逐字节一致
