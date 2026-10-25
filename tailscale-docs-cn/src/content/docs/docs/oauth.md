---
title: "Tailscale 上的 OAuth"
description: "通过 OAuth 授权工具与集成代你操作 tailnet。"
---

最后验证于 Jun 30, 2026

Tailscale 支持 OAuth，供对 tailnet 执行操作的工具和集成使用。有两种机制可用，区别在于最终操作所携带的身份：

* [OAuth 客户端][docs-oauth-clients]使用客户端凭证流程。它们会创建绑定到服务身份的、由标签归属的资源，适合在无人参与下运行的自动化任务。
* [OAuth 应用][docs-oauth-apps]使用授权码流程。由用户完成同意屏幕，产生的授权会携带该用户的身份。

探索以下主题，在 Tailscale 上使用 OAuth：

[**OAuth 客户端**](/docs/features/oauth-clients)——使用 OAuth 客户端为 Tailscale API 提供持续访问。

[**OAuth 应用**](/docs/features/oauth-apps)——通过标准 OAuth 2.0 授权码流程构建代表单个用户执行操作的内网工具，让每个操作都携带同意授权用户的身份。

[**使用 OAuth 应用进行设备开通**](/docs/features/oauth-apps/device-provisioning)——通过标准 OAuth 授权码流程构建代表单个用户开通 tailnet 设备的内网工具，让每台设备都携带同意授权用户的身份。

[docs-oauth-apps]: /docs/features/oauth-apps

[docs-oauth-clients]: /docs/features/oauth-clients
