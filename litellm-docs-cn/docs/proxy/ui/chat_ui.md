---
title: Chat UI
description: 在管理界面（Admin UI）的同一页面上，与 LiteLLM 网关上的模型对话、使用 MCP 工具，并查看自己的密钥、日志和用量。
---

import Image from '@theme/IdealImage';

# Chat UI

Chat UI 是 LiteLLM 管理界面（Admin UI）中的一个对话页面，位于 `/ui/chat`。该功能由代理管理员（proxy admin）为网关开启，之后所有能登录管理界面的用户都可以使用。用户可以向自己有权访问的模型发送消息，并调用 MCP 服务器的工具。

Chat UI 发出的每个请求都会经过网关。LiteLLM 对这些请求应用与 API 请求相同的模型访问控制、预算和日志记录。

:::info 测试版（Beta）

Chat UI 目前处于测试阶段（beta），页面和操作项可能随新版本调整。Chat UI 在 v1.92.0 及更高版本中可用。

:::

## 启用 Chat UI

Chat UI 默认关闭，需要代理管理员手动开启。

1. 以代理管理员身份登录管理界面。
2. 进入 **Settings** > **Admin Settings**。
3. 点击 **UI Settings** 标签页。
4. 把 **[BETA] Enable Chat page** 开关打开，页面会自动刷新。

<Image
  img={require('../../../img/chat_ui_enable.png')}
  dark={require('../../../img/chat_ui_enable_dark.png')}
  alt="Admin Settings 页面，[BETA] Enable Chat page 开关已打开并高亮"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

Chat UI 开启后，管理界面顶部的视图切换器会显示 **Chat**。选择 **Chat** 即可打开 Chat UI，也可以直接访问 `PROXY_BASE_URL/ui/chat`。

<Image
  img={require('../../../img/chat_ui_switcher.png')}
  dark={require('../../../img/chat_ui_switcher_dark.png')}
  alt="视图切换器，包含 AI Gateway 与 Chat 两个选项"
  style={{width: '100%', maxWidth: '640px', display: 'block', margin: '1.5rem 0'}}
/>

Chat UI 关闭时，视图切换器中的 **Chat** 会显示为不可用。此时用户访问 `/ui/chat`，管理界面会打开仪表板。

如果不想通过管理界面修改这项设置，可以用代理管理员密钥发送以下请求：

```bash
curl -X PATCH "$PROXY_BASE_URL/update/ui_settings" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"enable_chat_ui": true}'
```

LiteLLM 会把该值保存在数据库里，因此网关必须配置 `DATABASE_URL`。

### 通过配置文件启用

v1.104.0 及更高版本支持在 `config.yaml` 中设置该开关，然后重启网关：

```yaml
general_settings:
  enable_chat_ui: true
```

配置文件中的取值优先于通过管理界面或 API 保存的值。想让管理界面重新接管这个开关，把它从 `config.yaml` 中移除即可。

网关仍需要 `DATABASE_URL` 来存储 UI 设置。启用 Chat 不要求 `store_model_in_db: true`，模型可以继续保留在 `config.yaml` 中。

## 发送消息

1. 点击 **New Chat**。
2. 在消息框下方的模型列表中选择一个模型。
3. 输入你的消息。
4. 点击 **Send** 或按回车键。

<Image
  img={require('../../../img/chat_ui_new_chat.png')}
  dark={require('../../../img/chat_ui_new_chat_dark.png')}
  alt="Chat UI 中的新对话，含消息框与模型列表"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

模型列表只显示当前用户有权使用的模型。在搜索框中输入即可查找模型。

<Image
  img={require('../../../img/chat_ui_model_picker.png')}
  dark={require('../../../img/chat_ui_model_picker_dark.png')}
  alt="展开的模型列表与搜索框"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

模型一边生成，Chat UI 一边实时展示响应。每条响应下方会显示本次请求的以下指标：

- **TTFT**（首 Token 时间）：从发出请求到收到第一个 Token 的时间
- **总延迟**（Total Latency）：完成整个响应所需的时间
- **In**、**Out** 与 **Total**：输入 Token 数、输出 Token 数以及两者之和
- **Cost**：本次请求的成本

<Image
  img={require('../../../img/chat_ui_conversation.png')}
  dark={require('../../../img/chat_ui_conversation_dark.png')}
  alt="一段对话，回复下方显示请求指标"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

### 聊天记录

Chat UI 把你的对话保存在浏览器的本地存储（local storage）中，网关不会保留这些对话。**Recents** 列表展示你的对话，每条对话的标题取自其第一条消息的开头。

浏览器最多保留 100 条对话。再新建一条时，Chat UI 会删除改动时间最早的那条。一个浏览器中的对话不会出现在其他浏览器或电脑上。清除浏览器数据会一并删掉这些对话。

要删除某条对话，在 **Recents** 中将鼠标悬停到该对话上，点击垃圾桶图标，然后确认 **Delete**。此操作只从当前浏览器移除这条对话，不影响网关的请求日志。

网关会把每个请求记入日志，参见[查看你的日志](#查看你的日志)。

## 在对话中使用 MCP 工具

Chat UI 可以把 MCP 服务器的工具提供给模型使用。

1. 点击模型列表旁边的 **+**。
2. 为每台要使用的 MCP 服务器打开开关。
3. 发送你的消息。

<Image
  img={require('../../../img/chat_ui_mcp_picker.png')}
  dark={require('../../../img/chat_ui_mcp_picker_dark.png')}
  alt="MCP 服务器列表，每台服务器各有一个开关"
  style={{width: '100%', maxWidth: '720px', display: 'block', margin: '1.5rem 0'}}
/>

此后模型即可调用你选中的那些服务器的工具。列表只显示当前登录账号可访问的 MCP 服务器。要给用户授予 MCP 服务器访问权限，参见[授予 MCP 服务器访问权限](../../mcp_grant_access.md)。

## 通过 OAuth 连接 MCP 服务器

有些 MCP 服务器要求每个用户单独登录。对这类服务器，LiteLLM 会为每个用户保存一份 OAuth 令牌。

1. 点击 **Integrations**。
2. 找到该 MCP 服务器。需要登录的服务器会显示 **Connect** 按钮。
3. 点击 **Connect**。
4. 在提供商的页面上完成登录。

<Image
  img={require('../../../img/chat_ui_integrations.png')}
  dark={require('../../../img/chat_ui_integrations_dark.png')}
  alt="Integrations 页面，其中一台 MCP 服务器与一台 OAuth 服务器带 Connect 按钮"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

**All** 标签页显示当前登录账号可访问的全部 MCP 服务器，每台服务器会显示自己的工具数量。**Connected** 标签页显示已在对话中启用的服务器。

**Credentials** 页面显示你的 OAuth 连接。要移除某个连接，点击其所在行的删除图标（**Revoke connection**）。

要让某台 MCP 服务器显示 **Connect** 按钮，代理管理员需要在该服务器上设置 `auth_type: oauth2` 与 `oauth2_flow: authorization_code`：

```yaml title="config.yaml"
mcp_servers:
  github:
    url: https://api.githubcopilot.com/mcp/
    transport: http
    auth_type: oauth2
    oauth2_flow: authorization_code
    description: Issues, pull requests, and code search
```

:::warning

每台设置了 `auth_type: oauth2` 的 MCP 服务器都必须配置 `oauth2_flow`。如果缺少 `oauth2_flow`，网关将无法启动。

:::

完整的 OAuth 设置参见 [MCP OAuth](../../mcp_oauth.md)。

## 查看你的 API 密钥

**API Keys** 页面显示当前用户的虚拟密钥（virtual key）。对每把密钥，页面会显示花费、预算、过期日期和创建日期。

LiteLLM 企业版中，每把密钥还配有 **Rotate** 按钮。点击 **Rotate** 会为该密钥生成一个新的密钥值。

<Image
  img={require('../../../img/chat_ui_api_keys.png')}
  dark={require('../../../img/chat_ui_api_keys_dark.png')}
  alt="API Keys 页面，显示两个虚拟密钥"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

## 查看你的日志

**Logs** 页面只显示当前用户自己的请求。每一行显示时间、模型、状态、Token 数、耗时和成本。点击 **24h**、**7d** 或 **30d** 可更改时间范围。

点击任意一行可查看该请求的详情，其中包含请求体和响应体。要保存这些内容，需要在 `general_settings` 中设置 `store_prompts_in_spend_logs: true`。

<Image
  img={require('../../../img/chat_ui_logs.png')}
  dark={require('../../../img/chat_ui_logs_dark.png')}
  alt="Logs 页面，显示三条成功的请求"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

## 查看你的用量

**Usage** 页面显示你的总花费、API 请求数、Token 数和成功率。点击 **7d**、**30d** 或 **90d** 可更改时间范围。

<Image
  img={require('../../../img/chat_ui_usage.png')}
  dark={require('../../../img/chat_ui_usage_dark.png')}
  alt="Usage 页面，显示花费、请求数、Token 数与成功率"
  style={{width: '100%', display: 'block', margin: '1.5rem 0'}}
/>

## Chat UI 请求的花费

Chat UI 发出的每个请求都附带用户的登录会话。LiteLLM 会把请求产生的花费记录到该用户名下，而不计入用户的虚拟密钥。

## Chat UI 与 Playground

管理界面中还有 **Playground** 页面，可以在上面测试模型，并支持最多 3 个模型并排对比。Chat UI 则会保留聊天记录、连接 MCP 服务器，并展示你的密钥、日志和用量。

更多信息参见[模型对比 Playground](../model_compare_ui.md)、[MCP 概览](../../mcp.md)和 [Admin UI](../ui.md)。
