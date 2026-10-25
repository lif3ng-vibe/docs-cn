---
title: "Docker 有状态过滤"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Dec 29, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Docker with stateful filtering
Stateful filtering is enabled and Docker was detected; this may prevent Docker containers on this host from resolving DNS and connecting to Tailscale nodes.

## 参考 ID

`docker-stateful-filtering`

## 为什么会看到这条消息

有状态过滤是指防火墙跟踪活动连接，只放行属于已建立且已获批准连接的流量。例如，因为某个节点或设备发出过请求，防火墙才放行其响应。当你为 Docker 配置自己的防火墙规则（如 iptables）时，这些规则可能与 Tailscale 设置的防火墙或路由规则冲突，从而导致连接问题或出现这条消息之类的警告。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 使用命令 `sudo dockerd --iptables=false` 禁用 Docker 的 iptables 管理。
* 使用 Tailscale Serve 或 Tailscale Funnel 安全地暴露服务，而不依赖 Docker 端口映射。
* 使用 Tailscale CLI 命令 `tailscale set --stateful-filtering=false` 选项，避免丢弃目标 IP 为其他节点的入站数据包。
* 在手动管理全部 iptables 规则的高级场景中，使用 Tailscale CLI 命令 `tailscale up --netfilter-mode=off`。更多信息请参阅 [netfilter 模式][docs-netfilter-mode]。
* 添加允许 Tailscale 流量的自定义 iptables 规则，尤其是 `ESTABLISHED` 和 `RELATED` 连接状态。
* 使用 `iptables -L -v`、`tailscale netcheck` 等工具核查路由与 NAT 行为。

## 更多信息

* 有关在 Docker 中配置防火墙规则的信息，请参阅 [数据包过滤与防火墙][xt-docker-firewall-config]。
* 有关设置 Tailscale Serve 的信息，请参阅 [Tailscale Serve][docs-serve]。
* 有关设置 Tailscale Funnel 的信息，请参阅 [Tailscale Funnel][docs-funnel]。
* 有关 Tailscale 命令的信息，请参阅 [Tailscale CLI][docs-cli]。

[docs-cli]: /docs/reference/tailscale-cli

[docs-funnel]: /docs/features/tailscale-funnel

[docs-messages]: /docs/reference/messages

[docs-netfilter-mode]: /docs/reference/netfilter-modes

[docs-serve]: /docs/features/tailscale-serve

[xt-docker-firewall-config]: https://docs.docker.com/engine/network/packet-filtering-firewalls/
