---
title: "功能"
description: "功能文档索引。"
---

最后验证于 Jan 29, 2026

* [访问控制](/docs/features/access-control) —— 了解 Tailscale 中可用的访问控制选项。

* [客户端](/docs/features/client) —— 客户端文档索引。

* [容器](/docs/features/containers) —— 容器文档索引。

* [使用系统策略自定义 Tailscale](/docs/features/tailscale-system-policies) —— 一份配置键列表，可用于通过系统策略（包括 MDM）自定义 Tailscale 客户端。

* [声明式节点共享](/docs/features/declarative-node-sharing) —— 通过策略定义共享关系，并授权跨受信任 tailnet 访问资源。

* [设备态势管理](/docs/features/device-posture) —— 使用设备态势（device posture）在 tailnet 中强制执行设备规则。

* [临时节点](/docs/features/ephemeral-nodes) —— 在 Tailscale 中使用临时节点（ephemeral node）管理容器和 CI/CD 系统等短生命周期设备。

* [出口节点（路由全部流量）](/docs/features/exit-nodes) —— 将所有互联网流量路由通过网络中的特定设备。

* [tailscaled 中的防火墙模式](/docs/features/firewall-mode) —— 了解 Tailscale 在 Linux 设备上支持的不同防火墙模式。

* [用标签给设备分组](/docs/features/tags) —— 使用 Tailscale 标签（tag）来认证和识别服务器等非用户设备。

* [Tailscale 客户端上的分组可见性](/docs/features/group-visibility-clients) —— 为 Tailscale 网络中运行的应用获取组成员身份信息。

* [应用连接器的工作原理](/docs/features/app-connectors) —— 使用应用连接器在 tailnet 中路由 SaaS 应用流量。

* [日志概览](/docs/features/logging) —— 了解 Tailscale 的日志基础设施。

* [macOS 和 iOS 快捷指令](/docs/features/mac-ios-shortcuts) —— 了解 Tailscale 如何与"快捷指令"应用配合工作，让你可以把任务自动化。

* [MagicDNS](/docs/features/magicdns) —— 了解如何为 Tailscale 网络中的设备自动注册 DNS 名称。

* [MagicRoute](/docs/features/magicroute) —— 使用 MagicRoute 在符合条件的子网路由器、应用连接器和 Tailscale Service 主机之间进行选择。

* [管理多个 tailnet](/docs/features/multiple-tailnets) —— 在单一组织下管理多个 tailnet。

* [OAuth 应用](/docs/features/oauth-apps) —— 通过标准 OAuth 2.0 授权码流程构建代表单个用户执行操作的内部工具，让每个操作都携带同意授权的用户身份。

* [OAuth 客户端](/docs/features/oauth-clients) —— 使用 OAuth 客户端为 Tailscale API 提供持续访问能力。

* [路由选择](/docs/features/route-selection) —— 比较并配置子网路由器、应用连接器和 Tailscale Service 主机的路由选择，包括 MagicRoute 的出口节点推荐。

* [安全的节点状态存储](/docs/features/secure-node-state-storage) —— 对 Tailscale 节点状态进行静态加密。

* [与其他用户共享你的机器](/docs/features/sharing) —— 让另一个 tailnet 上的 Tailscale 用户访问你 tailnet 内的私有机器，而不把机器公开暴露。

* [站点到站点组网](/docs/features/site-to-site) —— 把 tailnet 中的两个子网互相连接起来。

* [子网路由器](/docs/features/subnet-routers) —— 使用子网路由器让本地网络之外的设备能够访问特定子网内的服务。用 Tailscale 扩展你的私有网络。

* [Taildrive](/docs/features/taildrive) —— 在 Tailscale 网络的设备之间安全地共享文件夹。

* [Taildrop](/docs/features/taildrop) —— 在 Tailscale 网络上的个人设备之间发送文件。

* [Tailnet Lock](/docs/features/tailnet-lock) —— 确保除非 tailnet 中受信任的节点为新节点签名，否则任何节点都无法加入你的 tailnet。

* [tailnet 策略文件](/docs/features/tailnet-policy-file) —— 了解 tailnet 策略文件。

* [Tailnets API](/docs/features/tailnets-api) —— 使用 Tailscale Tailnets API 以编程方式创建和管理你组织中的 tailnet。

* [Tailscale Funnel](/docs/features/tailscale-funnel) —— 使用 Tailscale Funnel 安全地把互联网流量路由到本地服务。

* [Tailscale Peer Relay](/docs/features/peer-relay) —— 当无法建立直连时，使用 Tailscale Peer Relay 进行客户端到客户端的连接。

* [Tailscale Serve](/docs/features/tailscale-serve) —— 探索 Tailscale Serve 服务。

* [Tailscale Services](/docs/features/tailscale-services) —— 使用 Tailscale Services 安全地连接内部资源并管理其访问。

* [面向编码智能体的 Tailscale skill](/docs/features/tailscale-skill) —— 安装 Tailscale skill，让编码智能体能够处理 Tailscale 配置与代码。

* [Tailscale SSH](/docs/features/tailscale-ssh) —— 使用 Tailscale SSH 管理 tailnet 中 SSH 连接的身份验证与授权。

* [tsidp](/docs/features/tsidp) —— 使用 tsidp 为任何支持 OIDC/OAuth 的服务提供安全保护，在 tailnet 内无需额外登录，包括 Grafana 和 MCP 服务器等自托管应用。

* [tsnet](/docs/features/tsnet) —— 使用 tsnet 包把 Tailscale 嵌入 Go 程序中。

* [tsrecorder](/docs/features/tsrecorder) —— 将 tsrecorder 与 Tailscale SSH 和 Tailscale Kubernetes Operator 配合进行会话录制。

* [使用设备态势实现即时访问（JIT）](/docs/features/tailscale-accessbot-jit) —— 使用设备态势对 tailnet 中的资源实现即时访问（just-in-time access）。

* [用户与分组预配](/docs/features/user-group-provisioning) —— 了解 Tailscale 支持哪些跨域身份管理（SCIM）身份提供方（IdP）。

* [查看网络中的端点列表](/docs/features/services) —— 了解如何监控并便捷地连接 Tailscale 网络中机器上运行的端点。

* [可视化策略编辑器](/docs/features/visual-editor) —— 使用可视化策略编辑器更新你的 tailnet 策略文件。

* [Webhooks](/docs/features/webhooks) —— 设置一个 webhook，接收 Tailscale 网络上的事件通知。

* [工作负载身份联合](/docs/features/workload-identity-federation) —— 使用来自第三方提供商的联合 OIDC 工作负载身份来验证对 Tailscale API 的请求。
