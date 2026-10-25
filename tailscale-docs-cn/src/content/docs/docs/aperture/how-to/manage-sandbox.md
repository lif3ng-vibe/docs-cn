---
title: "管理沙箱运维"
description: "[聊天沙箱][docs-chat-sandbox]让每段对话都有一个隔离环境，助手可以在其中运行代码、创建文件并生成可下载的产物。沙箱可用性由 Tailscale 管"
---

最后验证于 Sep 28, 2026

> **注意：** Aperture 聊天沙箱目前处于 alpha 阶段。

\[Missing snippet: contact\_account\_manager.mdx]

[聊天沙箱][docs-chat-sandbox]让每段对话都有一个隔离环境，助手可以在其中运行代码、创建文件并生成可下载的产物。沙箱的可用性由 Tailscale 为你的 Aperture 网关管理，你无需配置或运维其基础设施。

## 可用性与支持

聊天沙箱由 Tailscale 为你的网关启用，你不需要在 Aperture 配置中添加任何内容。要申请访问，参阅[启用聊天沙箱][docs-enable-sandbox]。

如果沙箱停止响应、反复报错，或报告意外的存储占用，参阅[排查沙箱问题][docs-troubleshoot-sandbox]。如果故障在多个对话中持续出现，请联系你的 Tailscale 客户经理或发送电子邮件至 `aperture@tailscale.com`。

## 安全注意事项

每段对话都有自己独立的沙箱。以下特性适用：

* 各对话之间无法访问彼此的文件或状态。
* 文件下载需要对话所有权。用户只能从自己的对话中下载文件。
* 出站访问仅限于获得批准的软件包仓库和源代码主机。沙箱代码无法触达你的 tailnet 或 Aperture 内部系统。
* HTML 预览无法加载外部资源，也无法访问父页面的 cookie、存储或 DOM。

> **警告：**
>
> 受限的出站访问降低了数据离开沙箱的风险，但并未消除。某些获批主机可以接收任意内容。请避免把高度敏感的数据放进沙箱对话。

## 运维参数参考

| 参数                                    | 值      | 说明                                                                                                                                                                    |
| --------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 上传大小限制（模型可读文件）            | 25 MiB  | 单个图像、PDF、文本或办公文档上传的大小上限。这些文件随消息一起发送给模型。                                                                                              |
| 上传大小限制（其他文件）                | 500 MiB | 模型无法读取的单个上传的大小上限，例如视频、音频、压缩包或无法识别的二进制文件。这些文件仅对沙箱命令可用。                                                               |
| 每个对话的附件数                        | 20      | 单个对话中上传文件的累计上限，不是按消息计                                                                                                                               |
| 沙箱执行容量                            | 5 GiB   | 沙箱命令可用的上传与输出总量                                                                                                                                             |

独立的存储配额可能在更低的限额下拒绝上传或阻止生成的文件被保存。对话、用户和网关各级的限制请参阅[大小限制与配额][docs-sandbox-limits]。

## 相关内容

* [Aperture 聊天沙箱][docs-chat-sandbox]：该功能的概念概览。
* [启用聊天沙箱][docs-enable-sandbox]：分步设置说明。
* [沙箱参考][docs-sandbox-reference]：工具参数、大小限制、超时和错误消息。
* [排查沙箱问题][docs-troubleshoot-sandbox]：诊断常见问题。

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-enable-sandbox]: /docs/aperture/how-to/enable-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-troubleshoot-sandbox]: /docs/aperture/troubleshooting/sandbox

[docs-sandbox-limits]: /docs/aperture/reference/sandbox#size-limits-and-quotas
