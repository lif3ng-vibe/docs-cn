import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 工具权限防护栏（Tool Permission Guardrail）

LiteLLM 提供了 LiteLLM 工具权限防护栏（Tool Permission Guardrail），让你通过可配置的允许/拒绝规则，控制模型可以调用哪些**工具调用**（tool calls）。它对工具执行提供细粒度、与具体提供商无关的控制，例如 OpenAI Chat Completions 的 `tool_calls`、Anthropic Messages 的 `tool_use`，以及 MCP 工具。

## 快速上手

### LiteLLM UI 配置

#### 第 1 步：选择工具权限防护栏

打开 LiteLLM 仪表板，点击 **Add New Guardrail**，选择 **LiteLLM Tool Permission Guardrail**，随后会加载规则构建器界面。

#### 第 2 步：定义正则规则

1. 点击 **Add Rule**。
2. 填写一个唯一的 Rule ID。
3. 为工具名提供一个正则表达式（例如 `^mcp__github_.*$`）。
4. 可选：为工具类型添加正则表达式（例如 `^function$`）。
5. 选择 **Allow**（允许）或 **Deny**（拒绝）。

#### 第 3 步：限制工具参数（可选）

选择 **+ Restrict tool arguments**（限制工具参数），即可为嵌套路径（点号 + `[]` 记法）附加正则校验。这会强制敏感参数（例如 `arguments.to[]`）符合预先批准的格式。

#### 第 4 步：选择默认动作与处置方式

- 为未命中任何规则的工具设置兜底判定（`default_action`）。
- 决定被禁工具的处理方式：**Block**（拦截）会直接中断请求；**Rewrite**（改写）会剥离被禁止的工具，并在响应内部返回一条错误消息。
- 如果想使用自定义品牌的错误文案，可修改 `violation_message_template`。
- 保存防护栏。

### LiteLLM Config.yaml 配置

```yaml
guardrails:
  - guardrail_name: "tool-permission-guardrail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      rules:
        - id: "allow_bash"
          tool_name: "Bash"
          decision: "allow"
        - id: "allow_github_mcp"
          tool_name: "^mcp__github_.*$"
          decision: "allow"
        - id: "allow_aws_documentation"
          tool_name: "^mcp__aws-documentation_.*_documentation$"
          decision: "allow"
        - id: "deny_read_commands"
          tool_name: "Read"
          decision: "deny"
        - id: "mail-domain"
          tool_name: "^send_email$"
          tool_type: "^function$"
          decision: "allow"
          allowed_param_patterns:
            "to[]": "^.+@berri\\.ai$"
            "cc[]": "^.+@berri\\.ai$"
            "subject": "^.{1,120}$"
      default_action: "deny"  # Fallback when no rule matches: "allow" or "deny"
      on_disallowed_action: "block"  # How to handle disallowed tools: "block" or "rewrite"
```

#### 规则结构

```yaml
- id: "unique_rule_id"           # Unique identifier for the rule
  tool_name: "^regex$"           # Regex for tool name (optional, at least one of name/type required)
  tool_type: "^function$"        # Regex for tool type (optional)
  decision: "allow"              # "allow" or "deny"
  allowed_param_patterns:         # Optional - regex map for argument paths (dot + [] notation)
    "path.to[].field": "^regex$"
```

#### `mode` 的可选值

- `pre_call`：在 LLM 调用**之前**运行，检查**输入**
- `post_call`：在 LLM 调用**之后**运行，检查**输入与输出**

### `on_disallowed_action` 的行为

| 取值 | 行为说明 |
| --- | --- |
| `block` | 请求会被立即拒绝。pre-call 检查会抛出 `400` HTTP 错误；post-call 检查会抛出 `GuardrailRaisedException`，代理因此返回错误响应，而不是模型输出。适用于调用被禁工具时必须中断工作流的场景。 |
| `rewrite` | LiteLLM 会在负载到达模型之前（pre-call）静默剥离被禁工具，或在事后改写模型响应与工具调用。防护栏会把错误文本插入 `message.content`/`tool_result` 条目，让客户端得知该工具已被拦截，同时补全的其余部分照常继续。适用于希望优雅降级而非硬性失败的场景。 |

### 自定义拒绝消息

当希望防护栏返回自定义品牌的错误信息时（例如 "this violates our org policy…"），可以设置 `violation_message_template`。LiteLLM 会用被拒工具的相关信息替换其中的占位符：

- `{tool_name}`：工具/函数名（例如 `Read`）
- `{rule_id}`：命中的规则 ID（触发默认动作时为 `None`）
- `{default_message}`：LiteLLM 的原始消息，需要在后面追加时使用

示例：

```yaml
guardrails:
  - guardrail_name: "tool-permission-guardrail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      violation_message_template: "this violates our org policy, we don't support executing {tool_name} commands"
      rules:
        - id: "allow_bash"
          tool_name: "Bash"
          decision: "allow"
        - id: "deny_read"
          tool_name: "Read"
          decision: "deny"
      default_action: "deny"
      on_disallowed_action: "block"
```

如果请求试图调用 `Read`，代理现在会返回 "this violates our org policy, we don't support executing Read commands"，而不是默认的错误文案。省略该字段即可保留默认消息。

### 2. 启动代理服务器

```shell
litellm --config config.yaml --port 4000
```

## 示例

<Tabs>
<TabItem value="block" label="拦截请求">

**拦截请求**（`on_disallowed_action: block`）

```bash
# Test
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-master-key-here" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user","content": "What is the weather like in Tokyo today?"}],
    "tools": [
      {
        "type":"function",
        "function": {
          "name":"get_current_weather",
          "description": "Get the current weather in a given location"
        }
      }
    ]
  }'
```

**预期响应**（已拒绝）：

```json
{
  "error":
    {
      "message": "Guardrail raised an exception, Guardrail: tool-permission-guardrail, Message: Tool 'get_current_weather' denied by default action",
      "type": "None",
      "param": "None",
      "code": "500"
    }
}
```

</TabItem>
<TabItem value="rewrite" label="改写请求">

**改写请求**（`on_disallowed_action: rewrite`）

```bash
# Test
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-master-key-here" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user","content": "What is the weather like in Tokyo today?"}],
    "tools": [
      {
        "type":"function",
        "function": {
          "name":"get_current_weather",
          "description": "Get the current weather in a given location"
        }
      }
    ]
  }'
```

**预期响应**（已移除工具，补全继续）：

```json
{
	"id": "chatcmpl-xxxxxxxxxxxxxxx",
	"created": 1757716050,
	"model": "{{openai_small}}",
	"object": "chat.completion",
	"choices": [
		{
			"finish_reason": "stop",
			"index": 0,
			"message": {
				"content": "I can’t fetch live weather — I don’t have real‑time internet access.",
				"role": "assistant",
				"annotations": []
			},
			"provider_specific_fields": {}
		}
	],
	"usage": {
		"prompt_tokens": 112,
		"total_tokens": 735,
		"completion_tokens_details": {
			"reasoning_tokens": 384
		}
	},
	"service_tier": "default"
}
```

</TabItem>
</Tabs>

### 限制工具参数

有时你希望允许某个工具，但又想限制它的**使用方式**。在规则中加入 `allowed_param_patterns`，即可对特定的参数路径（点号记法，数组用 `[]`）强制应用正则模式。

```yaml title="仅允许 mail_mcp 发送邮件至 @berri.ai 地址"
guardrails:
  - guardrail_name: "tool-permission-mail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      rules:
        - id: "mail-domain"
          tool_name: "send_email"
          decision: "allow"
          allowed_param_patterns:
            "to[]": "^.+@berri\\.ai$"
            "cc[]": "^.+@berri\\.ai$"
            "subject": "^.{1,120}$"
      default_action: "deny"
      on_disallowed_action: "block"
```

在这个例子中，LLM 仍然可以调用 `send_email`，但只要它试图给 `@berri.ai` 以外的地址发邮件，或者生成的主题没能通过正则校验，防护栏就会拦截（或改写，取决于 `on_disallowed_action`）这次调用。任何参数取值重要的工具都适合这个模式：邮件发送、升级流程、工单创建等。
