
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 使用 MCP

本文介绍如何将 LiteLLM 用作 MCP（Model Context Protocol）网关，涵盖 Responses API、Cursor IDE 和 OpenAI SDK 三种用法。关于端点、传输方式与鉴权模式如何取舍，请参阅 [MCP 配置参考](./mcp_config_reference)。

### 在 LiteLLM UI 上使用

按照下面的演示，即可在 LiteLLM UI 上使用你的 MCP。

<iframe width="840" height="500" src="https://www.loom.com/embed/57e0763267254bc79dbe6658d0b8758c" frameBorder="0" allowFullScreen></iframe>

### 通过 Responses API 使用

将 `http://localhost:4000` 替换为你 LiteLLM 代理（Proxy）的基础 URL。

通过 LiteLLM 代理使用 Responses API 的演示视频：[点此观看](https://www.loom.com/share/34587e618c5c47c0b0d67b4e4d02718f?sid=2caf3d45-ead4-4490-bcc1-8d6dd6041c02)


<Tabs>
<TabItem value="curl" label="cURL">

```bash title="cURL Example" showLineNumbers
curl --location 'http://localhost:4000/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "input": [
    {
      "role": "user",
      "content": "give me TLDR of what BerriAI/litellm repo is about",
      "type": "message"
    }
  ],
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    "stream": true,
    "tool_choice": "required"
}'
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python title="Python SDK Example" showLineNumbers
"""
Use LiteLLM Proxy MCP Gateway to call MCP tools.

When using LiteLLM Proxy, you can use the same MCP tools across all your LLM providers.
"""
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>", # paste your litellm proxy api key here
    base_url="http://localhost:4000" # paste your litellm proxy base url here
)
print("Making API request to Responses API with MCP tools")

response = client.responses.create(
    model="{{openai_large}}",
    input=[
        {
            "role": "user",
            "content": "give me TLDR of what BerriAI/litellm repo is about",
            "type": "message"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    stream=True,
    tool_choice="required"
)

for chunk in response:
    print("response chunk: ", chunk)
```

</TabItem>
</Tabs>

#### 指定 MCP 工具

通过 `allowed_tools` 参数可以指定哪些 MCP 工具可用，从而把访问范围限定在 MCP 服务器内的特定工具上。

要查看 LiteLLM MCP 网关下可用的工具列表，可以在 LiteLLM UI 中依次进入 MCP Servers > MCP Tools，点击对应工具并复制工具名称。

<Tabs>
<TabItem value="curl" label="cURL">

```bash title="cURL Example with allowed_tools" showLineNumbers
curl --location 'http://localhost:4000/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "input": [
    {
      "role": "user",
      "content": "give me TLDR of what BerriAI/litellm repo is about",
      "type": "message"
    }
  ],
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "allowed_tools": ["GitMCP-fetch_litellm_documentation"]
        }
    ],
    "stream": true,
    "tool_choice": "required"
}'
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python title="Python SDK Example with allowed_tools" showLineNumbers
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

response = client.responses.create(
    model="{{openai_large}}",
    input=[
        {
            "role": "user",
            "content": "give me TLDR of what BerriAI/litellm repo is about",
            "type": "message"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "allowed_tools": ["GitMCP-fetch_litellm_documentation"]
        }
    ],
    stream=True,
    tool_choice="required"
)

print(response)
```

</TabItem>
</Tabs>

### 在 Cursor IDE 中使用

借助 LiteLLM MCP，可以直接在 Cursor IDE 里调用工具：

**配置步骤**：

1. **打开 Cursor 设置**：Mac 使用 `⇧+⌘+J`，Windows/Linux 使用 `Ctrl+Shift+J`
2. **进入 MCP 工具页**：切换到 "MCP Tools" 标签页，点击 "New MCP Server"
3. **添加配置**：复制粘贴下面的 JSON 配置，再用 `Cmd+S` 或 `Ctrl+S` 保存

```json title="Basic Cursor MCP Configuration" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "http://localhost:4000/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"
      }
    }
  }
}
```

#### server_url="litellm_proxy" 时的工作原理

当 server_url="litellm_proxy" 时，LiteLLM 会把非 MCP 提供商桥接到你的 MCP 工具上。

- 工具发现：LiteLLM 拉取 MCP 工具，并将其转换为 OpenAI 兼容的定义
- LLM 调用：工具定义随输入一起发给 LLM，由 LLM 决定调用哪些工具
- 工具执行：LiteLLM 自动解析参数，把调用路由到 MCP 服务器，执行工具并取回结果
- 响应整合：工具结果回传给 LLM，用于生成最终响应
- 输出：完整响应，融合了 LLM 的推理与工具执行结果

这样一来，无论提供商是否原生支持 MCP，都能通过 LiteLLM 使用 MCP 工具。

如果响应中缺少工具调用或调用失败，请参阅故障排查手册中的 [Responses 与对话补全的失败场景](./mcp_troubleshoot.md#responsescompletions-with-embedded-mcp-calls)。

#### require_approval: "never" 时的自动执行

设置 require_approval: "never" 后，工具会自动执行，一次 API 调用即返回最终响应，无需用户额外操作。
