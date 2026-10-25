---
title: "启用聊天沙箱"
description: "聊天沙箱让 Aperture 助手可以访问一个隔离的 Linux 环境，在对话过程中执行命令、读取和编辑文件，并与用户分享可下载的输出。"
---

最后验证于 Sep 28, 2026

> **注意：** Aperture 聊天沙箱目前处于 alpha 阶段。

\[Missing snippet: contact\_account\_manager.mdx]

聊天沙箱让 Aperture 助手可以访问一个隔离的 Linux 环境，在对话过程中执行命令、读取和编辑文件，并与用户分享可下载的输出。

## 前提条件

开始之前，请确认以下事项：

* 你拥有编辑 Aperture 配置的管理员权限。参阅[设置管理员访问权限][docs-set-up-admin-access]。
* 需要使用沙箱的用户能够访问聊天界面，该界面默认可用。参阅[控制模型访问][docs-grant-model-access]。

> **注意：**
>
> 沙箱的可用性由 Tailscale 为你的 Aperture 网关管理。你无需配置或运维沙箱基础设施。关于该功能的更多信息，参阅 [Aperture 聊天沙箱][docs-chat-sandbox]。

## 为你的 Aperture 网关申请聊天沙箱

聊天沙箱由 Tailscale 为你的网关启用，你不需要在 Aperture 配置中添加任何内容。

要申请沙箱，请[填写申请表单][xt-sandbox-request]。你也可以联系你的 Tailscale 客户经理，或发送电子邮件至 `aperture@tailscale.com`。

> **注意：**
>
> 聊天沙箱为聊天助手提供沙箱工具。它与 `sandboxes` 配置块无关，后者控制的是独立的工作站开通功能。

## 限制门户访问（可选）

用户门户默认可用，因此获得授权的用户无需额外的门户授权即可使用聊天及其沙箱工具。要让匹配的非管理员用户只能使用 API，请将 `enable_portal` 设为 `false`：

```json
{
  "grants": [
    {
      "src": ["group:contractors"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "enable_portal": false }
        ]
      }
    }
  ]
}
```

这会为匹配的非管理员用户禁用整个用户门户，包括聊天和沙箱访问。它不是仅针对沙箱的授权。管理员始终保留门户访问。任何匹配授权中的显式 `enable_portal: true` 会覆盖匹配的 `false`。

## 验证沙箱是否正常工作

在 Tailscale 为你的网关启用沙箱之后：

1. 打开 Aperture 网关上的 `/` 或 `/chat`。
2. 开始一个新对话。
3. 打开 **Tools**，确认 **Code Sandbox** 可用且已选中。
4. 让助手运行一个命令，例如 "`echo hello` 的输出是什么？"
5. 确认助手运行了命令并返回结果。

如果 **Code Sandbox** 显示 **Contact support**，请联系你的 Tailscale 客户经理，或发送电子邮件至 `aperture@tailscale.com`。

## 启用沙箱后有哪些变化

助手可以运行命令、读取和搜索文件、创建和编辑文件，并展示输出文件供查看或下载。用户可以为对话选择 **Code Sandbox**，除非用户或项目的工具策略将其禁用。

## 后续步骤

* [管理沙箱运维][docs-manage-sandbox]：监控与其他运维任务。
* [沙箱参考][docs-sandbox-reference]：工具参数、大小限制、超时和错误消息。
* [排查沙箱问题][docs-troubleshoot-sandbox]：诊断常见问题。
* 完整配置参考（包括功能开关和授权能力）请参阅 [Aperture 配置][docs-configuration]。
* [控制模型访问][docs-grant-model-access]：配置聊天界面中可用的模型。
* [设置管理员访问权限][docs-set-up-admin-access]：管理谁可以更改网关设置。
* [Chat 参考][docs-chat-reference]：用户门户的工具与设置。

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-configuration]: /docs/aperture/configuration

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-troubleshoot-sandbox]: /docs/aperture/troubleshooting/sandbox

[xt-sandbox-request]: https://forms.gle/stYHtWNM274fvGMH8

[docs-chat-reference]: /docs/aperture/reference/chat
