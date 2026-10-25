---
title: "应用连接器的工作原理"
description: "使用应用连接器在 tailnet 中路由 SaaS 应用流量。"
---

最后验证于 Oct 7, 2026

> **注意：** 应用连接器适用于[所有套餐](https://tailscale.com/pricing)。

应用连接器让你可以把自托管应用和软件即服务（SaaS）应用的流量经由 Tailscale 网络（即 tailnet）中的专用设备路由。应用连接器的工作方式类似[子网路由器][docs-subnets]，额外的好处是按域名（而非 IP 地址）把用户和设备路由到应用，从而提供更可靠的连接。

此外，你还可以使用应用连接器满足应用连接性、监控、优化、安全性和可靠性方面的更多需求。

**应用类型**

* 内部托管的资源。
* 云基础设施或虚拟私有云（VPC）。
* SaaS 应用，包括 Amplitude、Confluence、GitHub、Looker、Office 365、Salesforce 和 Stripe。
* 托管平台，例如 Mongo Atlas、Amazon RDS 和 Planetscale。

**管理选项与优势**

* 集中管理应用连接器设备的应用访问，而不必为 tailnet 中的每台设备分别管理对应用的访问。
* 在[配置审计日志][docs-audit-logging]中监控 tailnet 内新增或移除的应用连接器的活动。
* 使用第三方工具监控应用连接器与应用流量。
* 可选择在应用设置中配置 IP 白名单，将所有应用访问限制为必须经过应用连接器设备。这样，tailnet 中只有被授予应用连接器访问权限的设备才能访问该应用。

**可靠性选项与优势**

* 为同一应用部署多台应用连接器设备以提供冗余。
* 使用 tailnet 的[路由选择选项][docs-route-selection]选择 Tailscale 在合格连接器之间的选取方式。

部署说明参见[设置高可用][docs-high-availability]。

## 工作原理

以下术语与定义有助于理解应用连接器的工作方式。

* **应用连接器**：这一特性的总称，也指管理控制台中用于在 tailnet 内添加和移除应用连接器的设置。
* **应用连接器设备**：tailnet 中被指定用于将流量路由到应用的 Linux 设备。
* **应用**：应用连接器设备将 tailnet 流量路由到的自托管、云端或 SaaS 应用。

应用连接器的设置方式如下。更多信息参见[在 tailnet 中设置应用连接器][docs-app-connectors-setup]。

1. 配置 [tailnet 策略文件][docs-tailnet-policy-file]，定义 tailnet 内应用连接器的设备权限，包括标签。
2. 为 tailnet 中你已配置为可访问应用连接器的设备分配相应标签。
3. 将 tailnet 中的一台 Linux 设备配置为承担应用连接器角色，负责把流量路由到应用。该设备必须拥有公网 IP 地址，并且必须启用 IP 转发。
4. 在管理控制台中配置应用连接器，指定标签以及各应用的域名。
5. 配置应用本身以满足额外的访问与安全需求，包括可选的 IP 白名单，只允许来自应用连接器设备 IP 地址的请求。

以下是应用连接器的高层工作流程，假设访问控制策略只允许 tailnet 中特定组的用户和设备通过应用连接器访问应用：

1. 带有指定标签的设备访问某个应用。
2. 请求被传递给被指定为应用连接器的设备。
3. 应用连接器通过向应用域名所通告的 IP 地址发出出站流量，将流量路由到该应用。
4. （可选）应用验证请求是否来自应用连接器的公网 IP 地址。
5. 来自应用的流量经应用连接器路由回来，再传递给 tailnet 中的用户设备。

### DNS 发现机制

应用连接器使用 PeerAPI 通过 DoH（DNS over HTTPS）执行 DNS 发现：

1. **访问要求**：客户端设备必须能够访问应用连接器标签，连接器才会作为对等节点出现。
2. **DNS 解析**：应用连接器使用 DoH 将已配置的域名解析为 IP 地址。
3. **路由通告**：发现的 IP 地址会自动作为路由通告给 tailnet。

最小访问权限（例如 ICMP）足以启用对等节点发现——无需完整的应用访问权限。

## 注意事项

* 如果用户未连接到 tailnet，除非在[应用设置][docs-app-connectors-setup-apps]中配置了 IP 白名单，否则他们仍能访问应用。如果你设置了 IP 白名单，还可以强制执行系统策略设置（例如 [`AlwaysOn.Enabled`][docs-mdm-keys-always-on]），确保设备始终连接到 tailnet。
* 如果用户在其 Tailscale 客户端上禁用了[接受路由][docs-client-preferences-accept-routes]选项，其设备将不会经由应用连接器路由。你可以使用 [`UseTailscaleSubnets`][docs-mdm-keys-tailscale-subnets] 系统策略防止用户禁用该设置。
* tailnet 中的 Linux 设备默认不接受路由。如果尚未设置，请务必在所有需要访问应用连接器的 Linux 设备上使用 Tailscale CLI 命令 [`tailscale set --accept-routes=true`][docs-client-preferences-accept-routes]。
* 手动配置应用时，提供商往往使用多个域名。你必须把这些域名全部加入应用连接器配置。GitHub 上的 [V2Fly 项目][xt-gh-domain-list-community]提供了一份精选清单，收录了常见应用及各自对应的域名。
* 如果多个完全限定域名（FQDN）共享同一个 IP 地址，而其中一个 FQDN 是应用连接器的目标，那么与所有共享该解析 IP 的 FQDN 的连接都会经由应用连接器路由。这是因为应用连接器一旦解析出某个 IP 地址，就会把发往该 IP 的流量经由连接器路由——无论该 IP 是如何解析得到的，甚至即使流量直接使用 IP 地址而非 DNS 名称也一样。
* 为获得最佳性能与可靠性，建议为单个应用连接器部署多台应用连接器设备。
* 如果某台应用连接器在使用中变得不可用，且没有其他可用的应用连接器，该域名的解析将开始失败，直到应用连接器恢复在线。
* 如果你使用 [Terraform][docs-terraform-provider] 或 [GitOps][docs-gitops] 等外部提供方管理 tailnet 策略文件，那么在管理控制台中对应用连接器所做的任何更改都会在下次同步时被覆盖。请务必通过你的外部提供方来管理应用连接器。

### 设备密钥过期

\[Missing snippet: expired\_device\_keys\_fail\_close.mdx]

[docs-app-connectors-setup-apps]: /docs/features/app-connectors/how-to/setup#restrict-application-access-by-ip-address

[docs-app-connectors-setup]: /docs/features/app-connectors/how-to/setup

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-client-preferences-accept-routes]: /docs/features/client/manage-preferences#use-tailscale-subnets

[docs-gitops]: /docs/gitops

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-mdm-keys-always-on]: /docs/features/tailscale-system-policies#set-tailscale-to-always-be-connected

[docs-mdm-keys-tailscale-subnets]: /docs/features/tailscale-system-policies#set-whether-the-device-accepts-tailscale-subnets

[docs-route-selection]: /docs/features/route-selection

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-terraform-provider]: /docs/integrations/terraform-provider

[xt-gh-domain-list-community]: https://github.com/v2fly/domain-list-community/tree/master/data
