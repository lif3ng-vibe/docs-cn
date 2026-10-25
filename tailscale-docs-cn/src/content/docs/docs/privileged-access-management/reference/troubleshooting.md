---
title: "Tailscale PAM 故障排查"
description: "使用以下章节来诊断并解决你在设置或运行 [Tailscale PAM][docs-pam] 时可能遇到的常见问题。对于连接器或连接器后面的会话的问题，你可以查看日志来获取问题详情。"
---

最后验证于 Jul 6, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

使用以下章节来诊断并解决你在设置或运行 [Tailscale PAM][docs-pam] 时可能遇到的常见问题。对于连接器或连接器后面的会话的问题，你可以查看日志来获取问题详情。

要查看某个连接器的日志：

1. 打开管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。
2. 选择你要检查日志的连接器。
3. 选择 **Logs**。

以下章节列出了常见错误的成因和推荐的解决路径。

## 错误：credentials chain 中没有 Tailscale PAM 令牌

`{"level":"fatal","ts":"2023-08-04T09:50:54-07:00","msg":"failed to get connector (v2) configuration","error":"no Tailscale PAM token in credentials chain"}`

这个错误表示 `tailzero` CLI 未能找到可用于身份验证的令牌。

要解决这个问题，请确保你在环境变量 `BORDER0_TOKEN` 中提供了有效的 Tailscale PAM 连接器令牌。

## 错误：令牌无效

`{"level":"error","ts":"2023-08-04T09:53:55-07:00","msg":"failed to receive message","error":"rpc error: code = Unauthenticated desc = invalid token"}`

这个错误表示 `tailzero` CLI 找到了可用于身份验证的令牌，但该令牌无效。令牌可能因为以下原因而无效：

* 格式损坏，例如缺少字符或多了字符。
* 已过期。
* 你提供了一个 shell 展开变量作为令牌的值，而该变量展开后由于上述原因之一得到了无效的令牌。

要解决这个问题，请确保你提供的是有效的令牌。

[docs-pam]: /docs/privileged-access-management
