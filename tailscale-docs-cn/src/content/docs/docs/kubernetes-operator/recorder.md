---
title: "使用 Tailscale Kubernetes Operator 进行会话录制"
description: "使用 Tailscale Kubernetes Operator 部署并配置会话录制。"
---

最后验证于 Jun 5, 2026

> **弃用提示：**
>
> Tailscale 不再通过 `tsrecorder` 提供 Tailscale Kubernetes Operator 的会话录制功能。对现有用户的支持计划于 2027 年 8 月结束。对于会话录制和特权访问管理，请使用 [Tailscale PAM][docs-tailscale-pam] 或联系 [Tailscale 销售团队][co-contact-sales]。

[API 服务器代理][docs-api-server-access] 可以录制 kubectl 会话和 Kubernetes API 请求事件，为集群交互提供安全与合规所需的审计记录。

## kubectl 会话录制

以下 kubectl 命令可以被录制：

* `kubectl exec`
* `kubectl debug`
* `kubectl attach`
* `kubectl run`

会话录制包含发送的命令、`stdout` 和 `stderr` 输出、pod 和容器上下文，以及用户的 Tailscale 身份。为保护密码等敏感数据，`stdin` 不会被录制。

## API 请求事件录制

启用后，所有经过代理的 Kubernetes API 请求都会被录制。每个事件包含 API 动词、目标资源、HTTP 详情、客户端 user agent，以及发起请求的设备或用户的 Tailscale 身份。

## 录制的路由方式

当用户连接到 API 服务器代理时，控制平面会根据用户的[授权（grant）][docs-grants]决定哪些 `tsrecorder` 实例应接收录制。随后，代理会经你的 tailnet 把会话数据流式传输到某个 `tsrecorder` 实例，全程使用 WireGuard 端到端加密。

`tsrecorder` 不需要与 API 服务器代理运行在同一集群中，它可以部署在 tailnet 的任何位置。任何匹配授权中所指定标签的 `tsrecorder` 实例都会接收录制。

## 失败策略

如果 `tsrecorder` 不可达，代理可以选择：

* **失败放行（默认）**：即使无法录制，会话也继续进行。
* **失败阻断**：无法录制时会话被阻止。

## Recorder 自定义资源

为方便在集群内部署 `tsrecorder`，Operator 提供了一个 `Recorder` 自定义资源。它管理 pod 生命周期，并支持可配置的存储后端：

* **临时文件系统（默认）**：录制内容存储在 `emptyDir` 卷中。适合测试，但 pod 被删除后就会丢失。
* **S3 兼容对象存储**：生产环境推荐使用，以确保持久、长期的保存。

设置说明请参阅[部署录制器][docs-deploy-tsrecorder]。

## 进一步探索

[部署][docs-deploy-tsrecorder]会话录制器。
[录制][docs-session-recording] kubectl 会话。
经 Tailscale [访问][docs-api-server-access] Kubernetes API。

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-api-server-access]: /docs/kubernetes-operator/api-server-access

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-grants]: /docs/features/access-control/grants

[docs-session-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-tailscale-pam]: /docs/privileged-access-management/session-logs
