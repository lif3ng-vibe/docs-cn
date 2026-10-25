---
title: "解决方案"
description: "通过实操指南探索在各种场景下使用 Tailscale 的方法。"
---

最后验证于 Jul 3, 2026

## VPN

[**使用 Apple TV 保护公共 Wi-Fi 上的互联网流量**](/docs/solutions/secure-traffic-public-wifi-appletv)——让 Tailscale 流量经由你的 Apple TV 路由，实现安全、私密的浏览，并访问受地区限制的内容。

[**用树莓派在任何地方屏蔽所有设备上的广告**](/docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi)——用树莓派搭配 Pi-hole 屏蔽广告，以高性价比的方式提升隐私、安全性和浏览性能。

[**使用 Windows RDP 访问远程桌面**](/docs/solutions/access-remote-desktops-using-windows-rdp)——使用远程桌面和 Tailscale 从任何地方安全访问 Windows 电脑。在私有 tailnet 上连接设备，无需端口转发或公网 IP。

[**使用 RustDesk 访问远程桌面**](/docs/solutions/access-remote-desktops-with-rustdesk)——使用 RustDesk 和 Tailscale 搭建安全的远程桌面访问，通过你的私有 tailnet 直接连接设备，无需服务器。

[**用 tailnet 设备托管网站**](/docs/features/tailscale-funnel/how-to/host-websites)——从 tailnet 中的一台设备托管网站。

[**用 Tailscale、树莓派和 Motion 搭建宠物摄像头**](/docs/solutions/set-up-dogcam)——搭建一个可以从任何地方安全访问的宠物摄像头。

## 开发

[**创建到 MongoDB Atlas 的安全连接**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas)——安全连接到 MongoDB Atlas 数据库，只允许你的 Tailscale 网络访问。

[**将 GitHub CI/CD 工作流连接到私有基础设施而不公开暴露**](/docs/solutions/connect-github-cicd-workflows-to-private-infrastructure-without-public-exposure)——使用 Tailscale 的临时、经认证的连接，将 GitHub 托管的 runner 连接到私有基础设施，且不公开暴露。

[**通过 Aperture 路由 AI 代码评审**](/docs/solutions/route-ai-code-reviews-through-aperture)——将 Claude Code GitHub Action 的请求经由 Tailscale 的 Aperture 路由，集中管理 AI 代码评审的 API 密钥、用量跟踪与成本控制。

[**在不改动应用的前提下降低 AI token 开销**](/docs/solutions/reduce-aperture-token-costs-with-tsheadroom)——在 Aperture 中加入 tsheadroom，在 AI 请求体到达你的服务商之前压缩其体积，无需修改任何客户端应用即可降低全部流量的 token 开销。

[**用 Visual Studio Code、Caddy 和 code-server 在 iPad 上写代码**](/docs/solutions/code-on-ipad-vscode-caddy-code-server)——通过到你自己的远程编码环境的安全私有连接，随时随地用 iPad 写代码。

## 管理基础设施

[**使用 ArgoCD 管理多集群 Kubernetes 部署**](/docs/solutions/manage-multi-cluster-kubernetes-deployments-argocd)——借助 Tailscale 的私有网络，用 ArgoCD 搭建安全的多集群 Kubernetes 管理，跨区域连接集群而无需复杂组网。

[**使用 External Secrets Operator 跨集群同步 Kubernetes 密钥**](/docs/solutions/sync-kubernetes-secrets-across-clusters-external-secrets)——使用 External Secrets Operator 和 Tailscale 的私有网络在 Kubernetes 集群之间分发密钥，无需将凭证存入 Git，也无需将 API 服务器暴露到互联网。

[**使用 sidecar 将 Kubernetes pod 接入你的 tailnet**](/docs/solutions/connect-kubernetes-pods-to-tailnet-using-sidecar)——在 Kubernetes 中以 sidecar 方式运行 Tailscale 容器镜像，涵盖持久化状态、DNS 配置、认证和路由指引。

[**用 ufw 锁定 Ubuntu 服务器**](/docs/how-to/secure-ubuntu-server-with-ufw)——让服务器只接受来自 Tailscale 的连接，忽略互联网流量。

[**从任何地方访问 PiKVM**](/docs/integrations/pikvm)——在 PiKVM 上设置 Tailscale。

[**用 Tailscale 运行私有 Minecraft 服务器**](/docs/solutions/set-up-minecraft)——随时随地与你想邀请的人共享 Minecraft 服务器。

[**Tailscale on NixOS：十分钟搭好新的 Minecraft 服务器**](/docs/solutions/set-up-nixos-minecraft)——在 NixOS 上搭建 Minecraft 服务器。

[**使用 IP 黑名单连接外部服务**](/docs/concepts/ip-blocklist-relays)——控制对托管在未运行 Tailscale 的服务器上的 SaaS 应用的访问。

[**基础设施即代码**](/docs/integration-infrastructure-as-code)——基础设施即代码（IaC）集成让你能够以编程方式部署基础设施。
