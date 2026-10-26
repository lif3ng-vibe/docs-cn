import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP 工具搜索

用一组固定的虚拟工具（`mcp_tool_search`、`mcp_tool_call`、`agent_search`、`skill_search`）取代完整的 MCP（Model Context Protocol）工具目录，这样即使一把密钥能用几百个工具，在 `tools/list` 上也只暴露四个。LLM 按关键词搜索、拿回按相关度排序的匹配结果，再按名称调用发现到的工具。`agent_search` 对 [A2A（Agent-to-Agent）代理注册表](./a2a.md#搜索注册中心)做同样的事，`skill_search` 则面向 [LiteLLM 托管的技能注册表](./skills.md#litellm-托管技能的语义搜索)，这两者都按嵌入（embeddings）而非关键词排序。

:::info[相关文档]
- [MCP 概览](./mcp.md)
- [MCP 权限管理](./mcp_control.md)，其中介绍了底层的 `object_permission` 模型
- [MCP 语义过滤](./mcp_semantic_filter.md)，这是作用在 `/v1/responses` 层、基于嵌入的另一种方案
:::

## 快速上手

生成密钥时在 `object_permission` 下设置 `mcp_tool_search_enabled: true`，并搭配 `mcp_servers`（或 `mcp_access_groups`）让搜索有内容可查，然后就能发现并调用工具。

```bash title="1. 创建开启工具搜索的密钥" showLineNumbers
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "object_permission": {
      "mcp_tool_search_enabled": true,
      "mcp_servers": ["github", "slack"]
    }
  }'
```

```console title="2. tools/list 只返回虚拟工具" showLineNumbers
$ curl -s http://localhost:4000/mcp-rest/tools/list \
    -H "Authorization: Bearer $KEY" | jq '[.tools[].name]'
["mcp_tool_search", "mcp_tool_call", "agent_search", "skill_search"]
```

```console title="3. 搜索发现真实工具" showLineNumbers
$ curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
    -H "Authorization: Bearer $KEY" \
    -d '{"name":"mcp_tool_search","arguments":{"query":"add numbers"}}' \
  | jq -r '.content[0].text | fromjson | [.[].name]'
["math-add", "math-multiply"]
```

```console title="4. 调用发现的工具" showLineNumbers
$ curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
    -H "Authorization: Bearer $KEY" \
    -d '{"name":"mcp_tool_call","arguments":{"tool_name":"math-add","arguments":{"a":3,"b":4}}}' \
  | jq '{result: .content[0].text, isError}'
{
  "result": "7",
  "isError": false
}
```

同一把密钥也可通过 streamable-http 协议端点（`/mcp/`）供真实 MCP 客户端使用：

```python title="用 MCP Python SDK 访问 /mcp/" showLineNumbers
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client(
    "http://localhost:4000/mcp/",
    headers={"Authorization": f"Bearer {KEY}"},
) as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()

        tools = await session.list_tools()
        print([t.name for t in tools.tools])
        # ['mcp_tool_search', 'mcp_tool_call', 'agent_search', 'skill_search']

        found = await session.call_tool("mcp_tool_search", {"query": "add numbers"})
        print(found.content[0].text)

        result = await session.call_tool(
            "mcp_tool_call",
            {"tool_name": "math-add", "arguments": {"a": 3, "b": 4}},
        )
        print(result.content[0].text)  # "7"
```

未设置该标志的密钥行为保持不变：`tools/list` 返回完整目录，这两个虚拟工具名会被拒绝并返回 `forbidden` 错误。

## 为所有新密钥默认开启

如果希望每把新密钥都默认启用工具搜索，而不用让每个调用方都记得带这个标志，可以在 `config.yaml` 的 `litellm_settings.default_key_generate_params.object_permission` 下进行配置。任何省略该字段的 `/key/generate` 请求都会合并进默认值；设置了部分 `object_permission` 的请求（例如只写了 `mcp_servers`）会保留自己显式给出的字段，只补上未设置的那些。

```yaml title="config.yaml" showLineNumbers
litellm_settings:
  default_key_generate_params:
    object_permission:
      mcp_tool_search_enabled: true
      mcp_servers: ["github", "slack"]
```

默认值是在调用方作用域校验**之后**才合并的，因此绝不会把普通的非管理员个人密钥请求变成 403。当调用方显式设置 `mcp_servers` 这类团队级字段时，仍会对照调用方自己所在的团队做校验；管理员配置的默认值只作用于最终持久化的密钥，不作用于正在被校验的请求。

## 工作原理

当密钥的 `object_permission` 上设置了 `mcp_tool_search_enabled: true` 时，无论该密钥能触达多少个 MCP 服务器，streamable-http 端点（`/mcp/`）和 REST 接口（`/mcp-rest/tools/list`）都只会返回四个工具：

- `mcp_tool_search(query, top_k=5)` 返回与查询匹配的真实工具的排序列表。
- `mcp_tool_call(tool_name, arguments)` 执行 LLM 通过搜索发现的某个工具。
- `agent_search(query, top_k=5)` 返回该密钥可触达的 A2A 代理，按与 `query` 所述任务的语义相似度排序。它需要配置 `litellm_settings.agent_search_embedding_model`；参见[搜索注册表](./a2a.md#搜索注册中心)。
- `skill_search(query, top_k=5)` 返回该密钥可触达的 LiteLLM 托管技能（`custom_llm_provider=litellm_proxy`），按语义相似度排序。它需要配置 `litellm_settings.skill_search_embedding_model`；参见[LiteLLM 托管技能的语义搜索](./skills.md#litellm-托管技能的语义搜索)。

两个处理器都走与普通 `/tools/call` 路由相同的过滤目录和分发路径，因此搜索只会露出该密钥本就允许看到的工具，调用也仍经由 `_get_allowed_mcp_servers` 和 `execute_mcp_tool` 解析。

### 搜索算法

排序方式是对工具的 `name` 和 `description` 字段做词元重叠计数，不使用嵌入，也没有额外依赖。代理对每个请求的处理流程如下：

1. 把查询转成小写，按空白切分成词元（`"add numbers"` 变成 `["add", "numbers"]`）。
2. 对调用方可触达的每个工具，用 `lower(name + " " + description)` 构造待匹配文本。
3. 按查询词元以子串形式出现在待匹配文本中的数量为每个工具打分：同时包含 `add` 和 `numbers` 的工具得 2 分，只包含 `add` 的得 1 分。
4. 丢弃得分为 0 的结果，其余按得分从高到低排序，返回前 `top_k` 个（默认 5）。

除了"得分大于 0"之外没有别的相似度阈值，因此查询哪怕只命中一个词元也照样返回匹配结果。得分相同的工具之间的先后顺序遵循 Python 对底层目录的稳定排序。空查询返回空列表。`mcp_tool_search` 的 `top_k` 参数按单次调用生效，首批结果集太窄时 LLM 可以自行放大窗口。

## 前提条件

需要 LiteLLM v1.92.x 或更高版本。

## 访问控制

工具搜索不会扩大可访问范围。`mcp_tool_search` 遍历的是与普通 `tools/list` 处理器相同的过滤后目录，密钥触达不到的工具对搜索同样不可见。`mcp_tool_call` 会先解析调用方被允许的服务器，套用基于请求 IP 的 `filter_server_ids_by_ip` 过滤，再通过 `execute_mcp_tool` 分发；后者会强制执行服务器白名单以及调用方的 `mcp_tool_permissions`。试图把 `mcp_tool_call` 指向密钥作用范围之外的服务器时，保护直接调用的同一道守卫会返回 `403`：

```console
$ curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
    -H "Authorization: Bearer $KEY" \
    -d '{"name":"mcp_tool_call","arguments":{"tool_name":"secret-server-delete_all","arguments":{}}}'
{"detail":"User not allowed to call this tool. Allowed MCP servers: [math]"}
```

可以用 `/key/info` 查看任意密钥上的这个标志：

```bash
curl "http://localhost:4000/key/info?key=$KEY" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  | jq '.info.object_permission | {mcp_tool_search_enabled, mcp_servers}'
```

## 工具搜索与语义过滤如何选择

两个功能都解决目录过大导致的问题，但作用在不同层。工具搜索是 MCP 层按密钥启用的可选项；LLM 只看到三个工具，并通过 MCP 协议自行驱动发现过程，适合端到端使用 MCP 协议的 agent 框架。[语义过滤](./mcp_semantic_filter.md)位于 `/v1/responses` 和 `/v1/chat/completions` 上，在每次请求时用嵌入重写工具列表，适合从不直接接触 `/mcp/` 的对话补全调用方。两者可以共存；开启了工具搜索的密钥即使在上游启用了语义过滤，也只会暴露这三个虚拟工具。
