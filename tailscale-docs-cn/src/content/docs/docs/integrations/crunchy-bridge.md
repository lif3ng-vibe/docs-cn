---
title: "使用 Tailscale 私密访问 Crunchy Bridge"
description: "将 Crunchy Bridge 与 Tailscale 一起使用。"
---

最后验证于 Jan 12, 2026

[Crunchy Bridge][xt-crunchydata-crunchy-bridge] 是一项托管 Postgres 服务，运行在 Amazon Web Services、Microsoft Azure 与 Google Cloud Platform 等主要云提供商上。它由 [Crunchy Data][xt-crunchydata] 公司构建。每个 Crunchy Bridge 实例都位于自己的虚拟私有云（VPC）中。Crunchy Bridge 的 Tailscale 集成让用户可以在没有 VPC 的云中安全地连接到自己的 Crunchy Bridge 集群，或者在 VPC 对等（VPC peering）不划算时（例如测试场景）直接连接。

## 前提条件

开始本指南之前，你需要有一个 tailnet 和一个 Crunchy Bridge 账户。

* 有关创建 tailnet 的信息，请参阅 [Tailscale 快速开始][docs-install]。

* 有关创建 Crunchy Bridge 账户的信息，请参阅 [Crunchy Bridge][xt-crunchydata-crunchy-bridge]。

## 集成

完整设置步骤请参阅 Crunchy Data 介绍如何与 Tailscale 建立集成的[博客文章][xt-crunchydata-bridge-tailscale]。

要将 Crunchy Bridge 与 Tailscale 一起使用，你需要：

1. 创建一个[认证密钥（auth key）][docs-auth-keys]。你必须成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能创建认证密钥。
   要创建密钥，请打开 Tailscale 管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。我们建议为此目的使用带标签的可重用预授权密钥。[带标签][docs-tags]的密钥会根据[访问控制规则][docs-access-control]限制 Crunchy Bridge 设备的权限，这些规则对应的标签会在设备置备完成后立即生效。可重用密钥在重试连接逻辑中很有用；预授权则让每个新实例无需再单独授权。

> **注意：**
>
> **使用可重用密钥务必格外小心！** 这类密钥一旦被盗可能非常危险。
> 最好将其保存在为此目的专门设计的密钥保管库（key vault）产品中。

2. 在用于管理集群的 Crunchy Bridge 仪表板中，选择 **Networking**，然后选择
   **Tailscale**。在 **Auth Key** 中粘贴你先前创建的认证密钥。

3. 选择 **Connect Tailscale**。

4. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。连接初始化完成后，你应当能在 tailnet 中看到 Crunchy Bridge 集群设备。复制其 Tailscale IP 地址，格式为 [`100.x.y.z` 格式][docs-terminology-and-concepts-ip-address]。

5. 连接到你的 Crunchy Bridge 集群时使用该 Tailscale IP 地址。例如，如果
   Tailscale IP 地址为 `100.100.123.123`，你使用的端口为 `5432`：

   ```shell
   psql postgres://application:<your-application-id>@100.100.123.123:5432/postgres
   ```

## 限制

* 认证密钥会在 90 天后过期。

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-install]: /docs/how-to/quickstart

[docs-tags]: /docs/features/tags

[docs-terminology-and-concepts-ip-address]: /docs/reference/glossary#tailscale-ip-地址

[xt-crunchydata-bridge-tailscale]: https://www.crunchydata.com/blog/crunchy-bridge-with-tailscale

[xt-crunchydata-crunchy-bridge]: https://www.crunchydata.com/products/crunchy-bridge

[xt-crunchydata]: https://www.crunchydata.com
