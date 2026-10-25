---
title: "使用 Tailscale PAM 访问数据库"
description: "[Tailscale PAM][docs-pam] 让你为用户提供对数据库的、基于身份的安全访问，而无需分发数据库凭证。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让你为用户提供对数据库的、基于身份的安全访问，而无需分发数据库凭证。

用户使用他们的 [Tailscale 身份][docs-tailscale-identity]进行认证，由你控制谁能连接到每个数据库以及他们能做什么。Tailscale PAM 还提供集中式审计跟踪，你可以审查谁访问了数据库、从哪台设备连接、何时连接，以及在启用会话录制的情况下，他们执行了哪些查询。

在实际使用中，这为数据库访问带来了类似单点登录（SSO）的体验。用户使用 Tailscale 登录，即可连接到他们被允许使用的数据库，而无需知道上游数据库的用户名或密码。

## 数据库访问的工作方式

数据库访问通过 Tailscale PAM [连接器][docs-pam-connectors]提供。连接器在你的环境中运行，对你想开放的数据库具有网络访问能力。

连接器会建立到 Tailscale PAM 的出站连接。当获得授权的用户发起数据库会话时，Tailscale PAM 会用其 Tailscale 身份认证该用户、应用相应的访问控制，并通过连接器把连接代理到目标数据库。

由于连接是从你的环境内部发起的，你无需把数据库直接暴露到公网。

用户可以使用他们已经在用的数据库客户端连接，也可以在可用时使用基于浏览器的数据库客户端。这让你的组织既能集中管理数据库访问，又能让用户继续使用熟悉的工具。

## 控制数据库访问

Tailscale PAM 授权（grant）让你可以控制谁能连接到数据库，以及连接之后能做什么。

例如，你可以为一个组提供只读的数据库访问权限，同时允许另一个组执行更广泛的操作。数据库仍受其既有认证的保护，而用户通过其 Tailscale 身份访问它。

更多信息参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 数据库指南

以下指南介绍如何通过 Tailscale PAM 开放不同类型的数据库：

* [使用 Tailscale PAM 访问 Google Cloud SQL 数据库](/docs/privileged-access-management/how-to/access-database/google-cloud-sql)——使用 Tailscale PAM 访问 Google Cloud SQL 数据库。

* [使用 Tailscale PAM 访问 Microsoft SQL Server 数据库](/docs/privileged-access-management/how-to/access-database/microsoft-sql-server)——使用 Tailscale PAM 为 Microsoft SQL Server 数据库提供特权访问。

* [使用 Tailscale PAM 访问 MongoDB 数据库](/docs/privileged-access-management/how-to/access-database/mongodb)——使用 Tailscale PAM 访问 MongoDB 数据库。

* [使用 Tailscale PAM 访问 MySQL 数据库](/docs/privileged-access-management/how-to/access-database/mysql)——使用 Tailscale PAM 访问 MySQL 数据库。

* [使用 Tailscale PAM 访问 PostgreSQL 数据库](/docs/privileged-access-management/how-to/access-database/postgresql)——使用 Tailscale PAM 访问 PostgreSQL 数据库。

* [使用 Tailscale PAM 访问 Amazon RDS 数据库](/docs/privileged-access-management/how-to/access-database/amazon-rds)——使用 Tailscale PAM 访问 Amazon RDS 数据库。

* [使用 Tailscale PAM 访问 Elasticsearch 服务器](/docs/privileged-access-management/how-to/access-database/elasticsearch)——使用 Tailscale PAM 访问 Elasticsearch 服务器。

如果你没有可用于测试的数据库，也可以使用 Tailscale 的公共 PAM 沙箱服务器之一。关于可用沙箱服务和凭证的信息，参见 [Tailscale PAM 沙箱服务器][docs-pam-faq-sandbox]。

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
