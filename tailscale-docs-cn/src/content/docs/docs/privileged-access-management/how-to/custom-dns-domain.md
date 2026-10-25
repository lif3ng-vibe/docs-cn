---
title: "在 Tailscale PAM 中使用自定义 DNS 域"
description: "你可以为 [Tailscale PAM HTTP 服务][docs-pam-http-services]使用自己的 DNS 域。这样你就能用自己控制的域中的主机名（例如 `wiki.infra.example.com`）来开放服务，而不是使用默认的 PAM 主机名。"
---

最后验证于 Aug 21, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

> **注意：** Tailscale PAM HTTP 服务的自定义域名面向 [Premium 套餐](https://tailscale.com/pricing)开放。

你可以为 [Tailscale PAM HTTP 服务][docs-pam-http-services]使用自己的 DNS 域。这样你就能用自己控制的域中的主机名（例如 `wiki.infra.example.com`）来开放服务，而不是使用默认的 PAM 主机名。

要使用自定义域，你需要先向 DNS 配置中添加两条 CNAME 记录，然后把该域添加到 Tailscale PAM。Tailscale PAM 使用这些记录把流量路由到其全球基础设施，并为你的域签发 TLS 证书。

自定义域适用于 PAM HTTP 服务。其他 PAM 服务类型（例如 SSH、数据库、Kubernetes 和 RDP）不使用自定义 HTTP 主机名。

## 前提条件

开始之前，请确保你已具备：

* 一个你可以管理的域或子域，例如 `infra.example.com`。
* 你的 DNS 服务商的访问权限，以便创建 CNAME 记录。
* 你的 tailnet 的[所有者或管理员](/docs/reference/user-roles)角色，以便修改 PAM 域设置。

## 添加自定义域

要添加自定义域：

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。

2. 在 **Domains** 部分选择**添加域**。

3. 输入你想使用的域，例如 `infra.example.com`。

   Tailscale PAM 会显示你需要添加到 DNS 配置的两条 CNAME 记录：

   * 一条通配符 CNAME 记录（`*`），把你的自定义域下的 HTTP 服务路由到 Tailscale PAM。
   * 一条 `_acme-challenge` CNAME 记录，Tailscale PAM 用它来验证域并签发 TLS 证书。

   CNAME 的具体目标值专属于你的 Tailscale PAM 配置，会显示在**添加域**对话框中。

   例如，这些记录会类似：

   | 名称                                | 类型  | 值                                              |
   | ----------------------------------- | ----- | ----------------------------------------------- |
   | `*.infra.example.com`               | CNAME | `<your-pam-subdomain>.border0.io`               |
   | `_acme-challenge.infra.example.com` | CNAME | `<domain>.<your-pam-subdomain>.acme.border0.io` |

   把 `<domain>` 和 `<your-pam-subdomain>` 替换为你 tailnet 的值。

   **名称**字段的确切填写方式取决于你的 DNS 服务商。例如，有些服务商在你编辑 `infra.example.com` 的 DNS 区域时，只要求填写 `*` 和 `_acme-challenge`。

4. 通过你的 DNS 服务商添加这两条 CNAME 记录。

5. 等待 DNS 变更传播生效。

6. 回到 [PAM](https://console.tailscale.com/admin/settings/pam) 页面，选择**保存**。

保存该域时，Tailscale PAM 会验证这两条 DNS 记录。

## 选择默认域

如果你配置了多个自定义域，可以选择哪个作为默认域。

添加域时，选择**将其设为默认域**，把它用作你 PAM HTTP 服务的主域。

之后如果添加了更多域，你也可以更改默认域。

## 使用你的自定义域

配置好自定义域后，你的 Tailscale PAM HTTP 服务即可通过自定义域访问。

例如，如果你的自定义域是：

* `infra.example.com`

那么名为 `wiki` 的 HTTP 服务可以使用：

* `https://wiki.infra.example.com`

你无需为每个 HTTP 服务单独配置自定义域。

[docs-pam-http-services]: /docs/privileged-access-management/how-to/access-http-service
