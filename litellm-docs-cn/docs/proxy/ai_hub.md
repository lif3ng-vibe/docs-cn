import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AI Hub

在组织内共享模型与智能体（agent），让开发者一眼看到有哪些可用资源，无需重复构建。

此功能**自 v1.74.3-stable 起可用**。

## 概览

管理员选择要在公共 AI Hub 上公开的模型/智能体 → 用户访问公开 URL，即可看到可用内容。

<Image
  img={require('../../img/final_public_model_hub_view.png')}
  dark={require('../../img/final_public_model_hub_view_dark.png')}
  alt="公共 AI Hub，列出管理员已公开的模型"
/>

## 模型

### 使用方法

#### 1. 进入管理界面（Admin UI）

在管理界面中打开 AI Hub 页面（`PROXY_BASE_URL/ui/?login=success&page=model-hub-table`）。**Model Hub** 标签页列出你的所有模型，**Public** 列则标明每个模型是否已公开。

<Image
  img={require('../../img/model_hub_admin_view.png')}
  dark={require('../../img/model_hub_admin_view_dark.png')}
  alt="管理界面中的 AI Hub 页面，含 Select Models to Make Public 按钮"
/>

#### 2. 选择要公开的模型

点击 `Select Models to Make Public`，勾选要公开的模型，然后点击 `Next`。

<Image
  img={require('../../img/make_public_modal.png')}
  dark={require('../../img/make_public_modal_dark.png')}
  alt="Make Models Public 对话框，已勾选模型"
/>

#### 3. 确认变更

核对列表后点击 `Make Public`。

<Image
  img={require('../../img/make_public_modal_confirmation.png')}
  dark={require('../../img/make_public_modal_confirmation_dark.png')}
  alt="确认步骤，列出即将公开的模型"
/>

#### 4. 完成！

访问公开 URL（`PROXY_BASE_URL/ui/model_hub_table`），即可查看所有可用模型。

<Image
  img={require('../../img/final_public_model_hub_view.png')}
  dark={require('../../img/final_public_model_hub_view_dark.png')}
  alt="公共 AI Hub，列出管理员已公开的模型"
/>

### API 端点

- `GET /public/model_hub` – 返回公开模型组（model group）的列表，需要有效的用户 API 密钥。
- `GET /public/model_hub/info` – 返回公共模型中心的元数据（文档标题、版本、实用链接）。

## 智能体（Agents）

:::info
智能体仅在 v1.79.4-stable 及以上版本可用。
:::

在组织内共享预构建的智能体（agent，遵循 A2A，即 Agent-to-Agent 规范）。用户可以直接发现并使用这些智能体，无需重复构建。

[**演示视频**](https://drive.google.com/file/d/1r-_Rtiu04RW5Fwwu3_eshtA1oZtC3_DH/view?usp=sharing)

### 1. 创建智能体

创建一个遵循 [A2A 规范](https://a2a.dev/) 的智能体。在管理界面中进入 **Agentic** > **Agents**，然后点击 `Add New Agent`。

<Tabs>
<TabItem value="ui" label="UI">

<Image
  img={require('../../img/add_agent.png')}
  dark={require('../../img/add_agent_dark.png')}
  alt="管理界面中的 Add New Agent 对话框"
/>

</TabItem>
<TabItem value="api" label="API">
```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{
  "agent_name": "hello-world-agent",
  "agent_card_params": {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  }
}'
```

**预期响应**

```json
{
  "agent_id": "123e4567-e89b-12d3-a456-426614174000",
  "agent_name": "hello-world-agent",
  "agent_card_params": {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  },
  "created_at": "2025-11-15T10:30:00Z",
  "created_by": "user123"
}
```

</TabItem>
</Tabs>

### 2. 公开智能体

让智能体在 AI Hub 上可被发现。

<Tabs>
<TabItem value="ui" label="UI">

打开 AI Hub 页面，切换到 **Agent Hub** 标签页。

<Image
  img={require('../../img/ai_hub_with_agents.png')}
  dark={require('../../img/ai_hub_with_agents_dark.png')}
  alt="AI Hub 页面的 Agent Hub 标签页，列出各智能体"
/>

点击 `Select Agents to Make Public`，勾选要公开的智能体，点击 `Next`，再点击 `Make Public`。

<Image
  img={require('../../img/make_agents_public.png')}
  dark={require('../../img/make_agents_public_dark.png')}
  alt="Make Agents Public 对话框，已勾选智能体"
/>

</TabItem>
<TabItem value="api" label="API">

**方式一：公开单个智能体**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents/123e4567-e89b-12d3-a456-426614174000/make_public' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json'
```

**方式二：公开多个智能体**


```bash
curl -X POST 'http://0.0.0.0:4000/v1/agents/make_public' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{
  "agent_ids": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001"
  ]
}'
```

**预期响应**

```json
{
  "message": "Successfully updated public agent groups",
  "public_agent_groups": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "updated_by": "user123"
}
```

</TabItem>

</Tabs>



### 3. 查看公开智能体

现在用户可以通过公开端点（endpoint）发现该智能体。

<Tabs>
<TabItem value="ui" label="UI">

<Image
  img={require('../../img/public_agent_hub.png')}
  dark={require('../../img/public_agent_hub_dark.png')}
  alt="公共 AI Hub 的 Agent Hub 标签页"
/>

</TabItem>
<TabItem value="api" label="API">

```bash
curl -X GET 'http://0.0.0.0:4000/public/agent_hub' \
--header 'Authorization: Bearer <user-api-key>'
```

**预期响应**

```json
[
  {
    "protocolVersion": "1.0",
    "name": "Hello World Agent",
    "description": "Just a hello world agent",
    "url": "http://localhost:9999/",
    "version": "1.0.0",
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "capabilities": {
      "streaming": true
    },
    "skills": [
      {
        "id": "hello_world",
        "name": "Returns hello world",
        "description": "just returns hello world",
        "tags": ["hello world"],
        "examples": ["hi", "hello world"]
      }
    ]
  }
]
```

</TabItem>
</Tabs>


## MCP 服务器

### 使用方法

#### 1. 添加 MCP 服务器

MCP（Model Context Protocol）服务器的添加步骤参见：[MCP 概述](../mcp#添加你的-mcp)


#### 2. 公开 MCP 服务器

<Tabs>
<TabItem value="ui" label="UI">

打开 AI Hub 页面（`PROXY_BASE_URL/ui/?login=success&page=model-hub-table`），切换到 **MCP Hub** 标签页。点击 `Manage MCP Hub Visibility`，勾选要公开的服务器，点击 `Next`，再点击 `Save Publication List`。

<Image
  img={require('../../img/mcp_server_on_ai_hub.png')}
  dark={require('../../img/mcp_server_on_ai_hub_dark.png')}
  alt="AI Hub 页面的 MCP Hub 标签页，列出各 MCP 服务器"
/>

</TabItem>
<TabItem value="api" label="API">

```bash
curl -L -X POST 'http://localhost:4000/v1/mcp/make_public' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"mcp_server_ids":["e856f9a3-abc6-45b1-9d06-62fa49ac293d"]}'
```

</TabItem>
</Tabs>


#### 3. 查看公开 MCP 服务器

现在用户可以通过公开端点（`PROXY_BASE_URL/ui/model_hub_table`）发现该 MCP 服务器。

<Tabs>
<TabItem value="ui" label="UI">

<Image
  img={require('../../img/mcp_on_public_ai_hub.png')}
  dark={require('../../img/mcp_on_public_ai_hub_dark.png')}
  alt="公共 AI Hub 的 MCP Hub 标签页"
/>

</TabItem>
<TabItem value="api" label="API">

```bash
curl -L -X GET 'http://0.0.0.0:4000/public/mcp_hub' \
-H "Authorization: Bearer $LITELLM_API_KEY"
```

**预期响应**

```json
[
    {
        "server_id": "e856f9a3-abc6-45b1-9d06-62fa49ac293d",
        "name": "deepwiki-mcp",
        "alias": null,
        "server_name": "deepwiki-mcp",
        "url": "https://mcp.deepwiki.com/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "deepwiki-mcp",
            "description": "free mcp server "
        }
    },
    {
        "server_id": "a634819f-3f93-4efc-9108-e49c5b83ad84",
        "name": "deepwiki_2",
        "alias": "deepwiki_2",
        "server_name": "deepwiki_2",
        "url": "https://mcp.deepwiki.com/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "deepwiki_2",
            "mcp_server_cost_info": null
        }
    },
    {
        "server_id": "33f950e4-2edb-41fa-91fc-0b9581269be6",
        "name": "edc_mcp_server",
        "alias": "edc_mcp_server",
        "server_name": "edc_mcp_server",
        "url": "http://lelvdckdputildev.itg.ti.com:8085/api/mcp",
        "transport": "http",
        "spec_path": null,
        "auth_type": "none",
        "mcp_info": {
            "server_name": "edc_mcp_server",
            "mcp_server_cost_info": null
        }
    }
]
```

</TabItem>
</Tabs>
