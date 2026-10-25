---
title: "排查沙箱问题"
description: "使用本主题排查沙箱工具、存储和文件下载方面的问题。"
---

最后验证于 Sep 28, 2026

> **注意：** Aperture 聊天沙箱目前处于 alpha 阶段。

\[Missing snippet: contact\_account\_manager.mdx]

使用本主题排查沙箱工具、存储和文件下载方面的问题。

## 沙箱工具不出现在会话中

在会话中打开 **Tools** 并检查 **Code Sandbox**：

1. 如果 **Code Sandbox** 显示 **Contact support**，说明该网关的沙箱服务不可用。请联系你的 Tailscale 客户经理，或发送邮件至 `aperture@tailscale.com`。
2. 如果 **Code Sandbox** 可用但未被选中，请为该会话选中它。
3. 如果该会话属于某个项目，检查该项目的工具策略是否禁用了沙箱。
4. 确认用户拥有门户访问权限。门户访问默认可用，但 `enable_portal: false` 会让匹配到的非管理员用户只能使用 API。管理员始终保留门户访问，而且任何匹配授权中显式设置的 `enable_portal: true` 会覆盖匹配到的 `false`。

## 工具调用因连接错误而失败

助手尝试使用沙箱工具，但工具调用失败，出现 `exec failed:` 之类的错误，后面跟着与连接相关的消息。

1. 重试该请求。
2. 开启新会话，判断失败是否仅限于单个会话。
3. 如果错误在多个会话中持续出现，请联系你的 Tailscale 客户经理，或附上大致时间和错误消息发送邮件至 `aperture@tailscale.com`。

## 超出存储上限

存储错误可能来自已保存文件配额，也可能来自沙箱执行容量。

### 上传或已保存文件配额

上传失败并返回 HTTP 429，伴随以下消息之一：

* `Conversation storage limit reached. You can contact support to request a limit increase.` 请用更少文件开启新会话，或联系支持团队。
* `Storage limit reached. Try again later or contact support.` 已达到滚动的用户或网关配额。请等待后重试。开启另一个会话不会重置这些配额。

在适用这些配额的网关上，保存的上传文件和生成的输出共享 500 MiB 的会话上限。新文件存储还有滚动的 24 小时限制：每用户 1 GiB、每网关 10 GiB。

如果输出超出配额，命令可能执行成功但未能保存其输出，文件可能无法下载。对于会话配额，请在文件更少的新会话中重跑该任务。对于滚动的用户或网关配额，请等待后重试或联系支持团队。

### 沙箱执行容量

沙箱命令或文件修改失败，并显示消息：

> 此会话附加的文件超出了沙箱容量（合计 5 GiB）。请归档或移除部分文件后重试。

可供沙箱命令使用的文件超出了独立的 5 GiB 执行容量。这不是前文所述的已保存文件配额。

要解决此问题，请开启新会话。为减少存储占用，把中间工作保存在暂存目录（scratch directory）中，只把最终交付物放入输出目录。暂存文件可能会在后续轮次之间消失。

## 文件下载失败

点击沙箱生成文件的下载链接会返回错误。下表列出了常见的 HTTP 状态码及其原因。

| 状态码 | 原因 | 解决办法 |
| --- | --- | --- |
| 401 | 用户未通过认证。 | 验证请求经由 tailnet 且带有有效的 Tailscale 认证。 |
| 403 | 用户没有门户访问权限。 | 检查匹配的 `enable_portal` 授权。门户访问对非管理员用户默认开启，管理员始终保留访问权限。 |
| 404 | 会话或文件不存在，或该用户无权访问。 | 核实会话和文件。只有获得授权的会话所有者才能下载该文件。 |
| 502 | 沙箱服务返回了上游错误。 | 重试下载。如果持续失败，请联系你的 Tailscale 客户经理，或发送邮件至 `aperture@tailscale.com`。 |
| 503 | 该网关的沙箱存储不可用。 | 联系你的 Tailscale 客户经理，或发送邮件至 `aperture@tailscale.com`。 |

> **注意：**
>
> 当会话不存在或请求用户不是其所有者时，Aperture 会返回 404。这可以防止泄露其他用户的会话。

> **注意：**
>
> Aperture 在查找文件之前会先检查门户访问权限。没有门户访问权限的非管理员用户会收到 403。管理员始终保留门户访问。

## 命令输出被截断

助手的命令输出以截断提示结尾，例如 `... output truncated (exceeded 1 MiB) ...` 或 `... output truncated ...`。

沙箱工具会限制返回给助手的输出：

* `aperture_bash` 输出：1 MiB（1,048,576 字节）
* `aperture_read_file`、`aperture_list_files` 和 `aperture_grep` 输出：16,000 字节

对于大输出，让助手把命令输出重定向到文件，搜索相关行，然后读取有限的部分。

## 验证沙箱健康状态

要检查命令和文件下载是否正常：

1. 在 `/` 或 `/chat` 开启新会话。
2. 打开 **Tools**，确认 **Code Sandbox** 可用且已选中。
3. 向助手提问："What is the output of `echo hello`?"
4. 确认助手运行了该命令并返回 `hello`。
5. 让助手创建并展示一个文件。
6. 确认出现了文件卡片且文件可以下载。

如果 **Code Sandbox** 显示 **Contact support**，请联系你的 Tailscale 客户经理，或发送邮件至 `aperture@tailscale.com`。

## 相关内容

* [Aperture 聊天沙箱][docs-chat-sandbox]：该功能的概念性概述。
* [沙箱参考][docs-sandbox-reference]：工具参数、大小限制、超时和错误消息。
* [管理沙箱运维][docs-manage-sandbox]：监控与其他运维任务。
* [Aperture 配置参考][docs-aperture-configuration]
* [Aperture 故障排查][docs-troubleshooting]

[ar-connection-errors]: #工具调用因连接错误而失败

[ar-file-downloads-fail]: #文件下载失败

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-enable-sandbox]: /docs/aperture/how-to/enable-sandbox

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-troubleshooting]: /docs/aperture/troubleshooting
