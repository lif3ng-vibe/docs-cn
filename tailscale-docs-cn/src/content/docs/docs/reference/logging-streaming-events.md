---
title: "日志、流式传输与事件"
description: "探索 Tailscale 面向 webhook 的日志功能与事件。"
---

最后验证于 Feb 5, 2025

管理你的 Tailscale 网络（即 tailnet）中的日志与事件。

## 捕获日志与事件

你可以捕获 tailnet 的配置变更以及网络流量。

[**配置审计日志**](/docs/features/logging/audit-logging)——查明谁在何时对 tailnet 配置做了什么。

[**网络流量日志**](/docs/features/logging/network-flow-logs)——查看 Tailscale 网络中各节点的网络遥测数据。

## 把日志与事件流式传输到 SIEM 或存储桶

把配置审计日志和网络流量日志流式传输到你偏好的日志流集成，例如安全信息与事件管理（SIEM）系统、Amazon S3 或兼容 S3 的存储桶。你还可以把 Tailscale SSH 会话录制流式传输到 tailnet 中的另一个节点或存储桶。

[**日志流式传输**](/docs/features/logging/log-streaming)——把 Tailscale 日志流式传输到安全信息与事件管理（SIEM）系统、Amazon S3 以及兼容 S3 的服务。

[**Tailscale SSH 会话录制**](/docs/features/tailscale-ssh/tailscale-ssh-session-recording)——使用 Tailscale SSH 会话录制收集端到端加密的 Tailscale SSH 会话记录。

[**将 Tailscale SSH 会话录制发送到 S3**](/docs/features/tailscale-ssh/how-to/session-recording-s3)——为 SSH 会话录制配置 S3 后端。

## 将日志事件接入你的基础设施

使用 webhook 把日志事件接入你的基础设施，例如接入 Slack 这类应用。

[**Webhook**](/docs/features/webhooks)——设置 webhook，接收 Tailscale 网络上的事件通知。
