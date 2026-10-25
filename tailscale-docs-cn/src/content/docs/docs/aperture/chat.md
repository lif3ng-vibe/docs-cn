---
title: "Chat"
description: "在一个网页界面中与模型对话、使用已连接的工具，并查看你自己的 Aperture 用量。"
---

最后验证于 Sep 28, 2026

Aperture Chat 是一个网页界面，所有能访问你的 Aperture 网关的人都可以使用。你可以用它和模型对话、使用已连接的工具，并查看自己的会话、用量和支出限额。无需安装单独的 chat 客户端。

管理员使用单独的[管理仪表板][docs-admin-dashboard]来配置网关并查看组织范围的活动。

## 访问 Chat

在浏览器中打开你的 Aperture 主机名，或直接访问 `/chat`。连接到你的 tailnet，或使用管理员提供的访问方式。

Chat 默认对所有已认证用户开放。管理员可以为仅使用 API 的用户禁用门户访问。访问该界面并不等于有权使用模型或连接器。你能使用哪些模型和工具由你的授权（grant）决定。

如果你是管理员，可在侧边栏底部选择 **Admin console** 打开管理仪表板。在管理仪表板中选择 **Chat** 可返回 Chat。

## 使用模型与工具

使用管理员开放给你的模型和已连接的服务。通过附件为对话提供上下文，或使用工具在已连接的服务中检索信息、执行操作。

把相关对话整理进 **Projects**，共享指令与工具限制。当你的账户可用时，还可以使用 **Skills** 在不同对话间复用指令和配套文件。

确切的控件与工作流参阅 [Chat 界面参考][docs-chat-reference]。

## 查看你的活动

使用 **Sessions** 调查你的请求，包括来自编码智能体的流量。在 **Usage** 中查看 token 用量和预估成本，在 **Quotas** 中查看适用的支出限额。

要在其他客户端中使用 Aperture，可在 **Models** 中查找模型标识符，在 **Agents** 中查看客户端设置说明。在 **Connectors** 中授权需要你账户的服务。

这些均为个人视图。组织范围的分析、配置与安全日志需要访问管理仪表板。

## 了解更多

[**Aperture Chat 界面参考**](/docs/aperture/reference/chat) —— Aperture Chat 输入区、项目、连接器、技能、个人会话、用量和配额的参考。

[**Chat 项目**](/docs/aperture/chat/projects) —— 用 chat 项目分组对话、设置可复用指令并控制工具访问。

[**设置 chat 界面**](/docs/aperture/how-to/set-up-chat-ui) —— 配置模型、精选模型选择器，并管理对 Aperture Chat 界面的访问。

[docs-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-chat-reference]: /docs/aperture/reference/chat
