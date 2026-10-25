---
title: "为合规与审计录制 SSH 会话"
description: "Tailscale SSH 让 SSH 连接经由你的 tailnet 路由，而无需开放防火墙端口。会话录制把这些连接捕获为可审计的日志，让你可以精确回看"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**Tailscale SSH 会话录制**](/docs/features/tailscale-ssh/tailscale-ssh-session-recording)——使用 Tailscale SSH 会话录制功能，收集端到端加密的 Tailscale SSH 会话录像。

[Tailscale SSH][docs-tailscale-ssh] 让 SSH 连接经由你的 tailnet 路由，而无需开放防火墙端口。会话录制把这些连接捕获为可审计的日志，让你可以精确回看任何 SSH 会话中发生了什么。你还可以把录制设为访问的前提条件——录制器不可用时，会话会被直接拦截。

## 在服务器上启用 Tailscale SSH

在每台需要录制的服务器上安装 Tailscale 客户端，并启用其内置的 SSH 服务器。

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh
```

在每台需要录制的服务器上都重复此操作。打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面，为这些服务器分配标签，以便在策略文件中把它们作为一组来定向。`tailscale up` 全部标志请参阅 [`tailscale up`][docs-cli-up] CLI 参考。

## 部署会话录制器

会话录制器是一台专用的 Tailscale 节点，负责接收并存储会话数据。录像以 `asciinema` 格式保存为 `.cast` 文件，你可以回放或导出它们用于审计审查。

在你将用作录制器的主机上安装 Tailscale 客户端并完成认证：

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:recorder
```

然后带上存储目的地启动 `tsrecorder`：

```bash
tsrecorder --dst s3://your-bucket/sessions
```

如果用本地存储，把 S3 URL 替换为本地路径（例如 `/var/lib/tsrecorder/sessions`）。在需要长期保留和集中访问的合规环境中，推荐使用 S3 兼容存储。

## 在策略文件中配置录制

打开管理控制台的[访问控制](https://console.tailscale.com/admin/acls/file)页面，添加一条 SSH 规则，定向到你的服务器并让会话经由录制器节点。

```json
"ssh": [
  {
    "action": "accept",
    "src": ["autogroup:member"],
    "dst": ["tag:server"],
    "users": ["autogroup:nonroot", "root"],
    "recorder": ["tag:recorder"],
    "enforceRecorder": true
  }
]
```

把 `enforceRecorder` 设为 `true` 后，录制器不可达时会阻止 SSH 访问。对于不允许出现未录制会话的合规环境，这是推荐的设置。

## 连接你的服务器

使用任何标准 SSH 客户端连接打有标签的服务器。Tailscale 会为连接路由，并通知连接的用户会话正在被录制。

```bash
ssh user@hostname
```

使用服务器的 [MagicDNS][docs-magicdns] 主机名或它的 Tailscale IP 地址。会话结束后，检查录制器的存储目的地，确认录像已被捕获。

## 审查已录制的会话

录像以 `asciinema` 格式的 `.cast` 文件存储在你配置的目的地。每个文件捕获单个会话的完整终端输出（包含时序数据），因此回放与原始会话完全一致。

在装有 `asciinema` 的任意机器上回放会话：

```bash
asciinema play /path/to/session.cast
```

对于 S3 后端存储，先下载文件或让 `asciinema` 指向本地副本。你也可以用 `tsrecorder` 直接在录制器节点上列出并回放会话。就长期审计留存而言，`.cast` 文件可以归档、按 JSON 解析，或导入 SIEM 或日志聚合工具。

## 延伸探索

* 阅读 [Tailscale SSH 会话录制][docs-session-recording]参考，了解录制器配置、存储选项和文件格式的完整细节。
* 按照[将会话录像发送到 S3][docs-session-recording-s3]指南，搭建持久化的云端录像存储。
* 查阅 [Tailscale SSH][docs-tailscale-ssh] 文档，了解 SSH 规则选项全集，包括 check 条件和用户映射。
* 使用 [tailnet 策略文件][docs-policy-file]叠加更多访问控制，例如把 SSH 访问限制到特定源设备或分组。
* 查看[配置审计日志][docs-audit-logs]，与会话录像一同跟踪策略文件变更。
* 使用[日志流式传输][docs-log-streaming]把 Tailscale 日志转发到 SIEM 或日志聚合平台，实现集中化审计工作流。

[docs-audit-logs]: /docs/features/logging/audit-logging

[docs-cli-up]: /docs/reference/tailscale-cli/up

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-session-recording-s3]: /docs/features/tailscale-ssh/how-to/session-recording-s3

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
