import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 从 OpenAPI 规范生成 MCP 服务器

LiteLLM 能把任意 OpenAPI/Swagger 规范转换成一个 MCP（Model Context Protocol）服务器，无需编写任何自定义 MCP 服务器代码。

## 第 1 步：添加 MCP 服务器

在 `config.yaml` 中添加基于 OpenAPI 的服务器：

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  petstore_mcp:
    url: "https://petstore.swagger.io/v2"
    spec_path: "/path/to/openapi.json"
    auth_type: "none"

  my_api_mcp:
    url: "http://0.0.0.0:8090"
    spec_path: "/path/to/openapi.json"
    auth_type: "api_key"
    auth_value: "your-api-key-here"

  secured_api_mcp:
    url: "https://api.example.com"
    spec_path: "/path/to/openapi.json"
    auth_type: "bearer_token"
    auth_value: "your-bearer-token"
```

也可以直接在 UI 中操作：进入 **MCP Servers → Add New MCP Server**，填入 URL 和 spec 路径，LiteLLM 会拉取该规范并把所有端点加载为工具。

**配置参数**：

| 参数 | 是否必填 | 说明 |
|------|----------|------|
| `url` | 是 | API 的基础 URL |
| `spec_path` | 是 | OpenAPI 规范的路径或 URL（JSON 或 YAML） |
| `auth_type` | 否 | `none`、`api_key`、`bearer_token`、`basic`、`authorization`、`oauth2` |
| `auth_value` | 否 | 认证值（设置了 `auth_type` 时必填） |
| `description` | 否 | 可选描述 |
| `allowed_tools` | 否 | 指定工具的白名单 |
| `disallowed_tools` | 否 | 指定工具的黑名单 |

**支持的规范版本**：OpenAPI 3.0.x、3.1.x、Swagger 2.0。每个操作的 `operationId` 会成为工具名，请确保它们互不重复。

## 内网 spec URL 与 SSRF 防护

当 `spec_path` 是 `http://` 或 `https://` URL 时，LiteLLM 代理默认会启用 **SSRF 防护**再拉取：先解析主机名，只要任一解析出的地址不可全局路由（如 `10.x`、`192.168.x`、`127.0.0.1`），请求就会被**拒绝**，除非你把 **URL 中的主机名**（而非解析出的 IP）加入白名单。

典型场景：

- spec URL 写的是 `https://api.example.com/...`，但内网 DNS 把它解析成了私有 IP。把 `api.example.com` 加入白名单即可（若固定了端口，则加 `api.example.com:443`）。
- spec URL 是 `http://127.0.0.1:8080/openapi.json`。把 `127.0.0.1` 或 `127.0.0.1:8080` 加入白名单。

在代理 `config.yaml` 的 **`litellm_settings`** 下配置（**不会**从 `general_settings` 读取）：

```yaml title="config.yaml" showLineNumbers
litellm_settings:
  user_url_validation: true # default; set false only if you fully trust URL sources
  user_url_allowed_hosts:
    - "api.example.com"
    - "127.0.0.1"
    - "127.0.0.1:8080"
```

这些字段的完整说明见 [配置项：`litellm_settings`](./proxy/config_settings.md#litellm_settings-参考)。

工具加载完成后，你会在 Tool Configuration 区域看到它们：

<Image
  img={require('../img/mcp_openapi_tools_loaded.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

## 第 2 步：按需覆盖工具名称与描述

默认情况下，工具名称与描述取自 spec 中的 `operationId` 和 description 字段。你可以在不改动上游 spec 的前提下重命名或改写它们，让 MCP 客户端看到更简洁的名称与描述。

### 通过 UI

每张工具卡片上都有一个铅笔图标，点击即可打开内联编辑器：

<Image
  img={require('../img/mcp_openapi_tool_edit_panel.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

- **Display Name**：覆盖 MCP 客户端看到的名称
- **Description**：覆盖 MCP 客户端看到的描述。它会与 spec 原文一样经过[发现时的防护栏（guardrails）扫描](./mcp_guardrail#发现时扫描工具描述)，因此防护栏同样可以对其脱敏或隐藏
- 字段留空则保留 spec 中的原始值

设置覆盖后，工具卡片上会出现紫色的 **Custom name** 徽标：

<Image
  img={require('../img/mcp_openapi_custom_name_badge.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

### 通过 API

在创建或更新请求中传入 `tool_name_to_display_name` 和 `tool_name_to_description`：

```bash title="创建服务器并覆盖工具名称" showLineNumbers
curl -X POST http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "petstore_mcp",
    "url": "https://petstore.swagger.io/v2",
    "spec_path": "/path/to/openapi.json",
    "tool_name_to_display_name": {
      "getPetById": "Get Pet",
      "findPetsByStatus": "List Available Pets"
    },
    "tool_name_to_description": {
      "getPetById": "Look up a pet by its ID",
      "findPetsByStatus": "Returns all pets matching a given status (available, pending, sold)"
    }
  }'
```

```bash title="更新已有服务器的覆盖配置" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "<server-id>",
    "tool_name_to_display_name": {
      "getPetById": "Get Pet"
    },
    "tool_name_to_description": {
      "getPetById": "Look up a pet by its ID"
    }
  }'
```

映射的键是 spec 中的**原始 `operationId`**，而不是带前缀的工具名。LiteLLM 会先去掉服务器前缀再做查找。

例如，服务器名为 `petstore_mcp` 时，工具会以 `petstore_mcp-getPetById` 的形式暴露，而映射的键仍是 `getPetById`。

**覆盖前后对比**：

```
# Without overrides
Tool: "petstore_mcp-getPetById"
Description: "Returns a single pet"

Tool: "petstore_mcp-findPetsByStatus"
Description: "Finds Pets by status"

# After overrides
Tool: "Get Pet"
Description: "Look up a pet by its ID"

Tool: "List Available Pets"
Description: "Returns all pets matching a given status (available, pending, sold)"
```

## 使用服务器

<Tabs>
<TabItem value="fastmcp" label="Python FastMCP">

```python title="使用基于 OpenAPI 的 MCP 服务器" showLineNumbers
from fastmcp import Client
import asyncio

config = {
    "mcpServers": {
        "petstore": {
            "url": "http://localhost:4000/petstore_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"
            }
        }
    }
}

client = Client(config)

async def main():
    async with client:
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        response = await client.call_tool(
            name="Get Pet",        # overridden name
            arguments={"petId": "1"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP 配置" showLineNumbers
{
  "mcpServers": {
    "Petstore": {
      "url": "http://localhost:4000/petstore_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"
      }
    }
  }
}
```

</TabItem>

<TabItem value="openai" label="OpenAI Responses API">

```bash title="配合 OpenAI 使用基于 OpenAPI 的 MCP 服务器" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "tools": [
        {
            "type": "mcp",
            "server_label": "petstore",
            "server_url": "http://localhost:4000/petstore_mcp/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY"
            }
        }
    ],
    "input": "Find all available pets",
    "tool_choice": "required"
}'
```

</TabItem>
</Tabs>
