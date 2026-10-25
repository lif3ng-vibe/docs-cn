---
title: "tsrecorder"
description: "将 tsrecorder 与 Tailscale SSH 和 Tailscale Kubernetes Operator 搭配使用，进行会话录制。"
---

最后验证于 Jun 12, 2026

> **弃用：**
>
> Tailscale 不再通过 `tsrecorder` 提供会话录制。对现有用户的支持计划于 2027 年 8 月结束。如需会话录制和特权访问管理，请使用 [Tailscale PAM][docs-tailscale-pam] 或联系 [Tailscale Sales][co-contact-sales]。

通过 tailnet 访问敏感基础设施时，你可能需要一份这些会话期间所发生情况的记录。合规框架可能有此要求，安全团队需要它来做事件调查，而当你能够精确回放用户的操作时，审计也会更快。`tsrecorder` 提供了这样的记录。

`tsrecorder` 是一个加入你的 tailnet 并接收其他设备终端会话录制的节点。无论录制哪种类型的会话，它的工作方式都相同。承载会话的设备通过 tailnet 把会话数据流式传输给 `tsrecorder`，`tsrecorder` 再将其写入存储。由于数据流经由 tailnet 传输，它与其他 tailnet 流量一样是端到端加密的。

## 可以录制的内容

`tsrecorder` 支持两种录制场景：

* **Tailscale SSH 会话**：运行 Tailscale SSH 的设备将其会话流式传输到 `tsrecorder`。更多信息请参阅 [Tailscale SSH 会话录制][docs-ssh-session-recording]。
* **Kubernetes 会话**：Kubernetes API 服务器代理将所有 Kubernetes API 调用流式传输到 `tsrecorder`，包括交互式会话的端点，例如 `kubectl exec` 和 `kubectl attach`。更多信息请参阅[录制 kubectl 会话][docs-kubectl-recording]。

在这两种场景中，录制内容会捕获终端输出（`stdout` 和 `stderr`）以及会话元数据，例如时间戳、源设备和发起会话的用户。Kubernetes 会话录制不会捕获 `stdin`，这可以防止密码等敏感输入出现在录制内容中。`tsrecorder` 以 `asciinema` 格式存储会话，让你日后可以按终端中的原样回放。

[Tailscale PAM][docs-tailscale-pam] 支持录制更多会话类型，例如 SSH、Kubernetes 和数据库会话。

## 录制是如何控制的

录制由策略驱动。你部署 `tsrecorder` 时带上一个标签（tag），例如 `tag:recorder`，然后在控制你要录制会话的通用访问规则中的 `recorder` 字段里引用该标签。当会话匹配带 `recorder` 字段的规则时，录制自动开始。不匹配录制规则的会话不会被录制。

默认情况下，会话录制"失败放行"（fail open）。如果录制器节点不可达，Tailscale 仍允许会话连接。如果你的合规要求每一条会话都必须录制，你可以改为"失败阻断"（fail closed），把 `enforceRecorder` 设为 `true`。启用强制后，如果 Tailscale 无法连接到录制器，就会阻止该会话。

## 录制内容存储在哪里

`tsrecorder` 把录制内容写入以下两种目的地之一：

* 本地文件路径，例如挂载的卷
* 兼容 S3 的对象存储桶

要配置对象存储，请参阅[将会话录制发送到 S3][docs-session-recording-s3]。

## 设置 tsrecorder

无论哪种场景，设置的步骤结构都相同。你部署 `tsrecorder` 容器，将其指向一个存储目的地，并在 tailnet 策略文件中引用它的标签。各场景的专题文档会逐步讲解每种配置：

* 要录制 Tailscale SSH 会话，请参阅 [Tailscale SSH 会话录制][docs-ssh-session-recording]。
* 要录制 `kubectl` 会话，请参阅 [Kubernetes 会话录制][docs-kubectl-recording]。
* 要在 Kubernetes 集群上部署 `tsrecorder`，Operator 的 `Recorder` 自定义资源会代你完成部署。更多信息请参阅[在 Kubernetes 集群中部署会话录制器][docs-deploy-tsrecorder]。

## 查看录制内容

你可以在 Tailscale 管理控制台中查看录制内容，也可以直接从存储后端检索。`tsrecorder` 还包含一个可选的 web UI，用于浏览和回放已录制的会话。如果启用该 UI，请配置你的 [tailnet 策略文件][docs-tailnet-policy-file]，把对录制器 `443` 端口的访问限制为仅授权用户可查看录制内容。有关配置 web UI 的更多信息（包括 tailnet 策略文件示例），请参阅[在 Kubernetes 集群中部署会话录制器][docs-deploy-tsrecorder]。

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-kubectl-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-session-recording-s3]: /docs/features/tailscale-ssh/how-to/session-recording-s3

[docs-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-pam]: /docs/privileged-access-management/session-logs
