---
title: "使用 Terraform 管理 Tailscale PAM 资源"
description: "你可以使用 Terraform 以基础设施即代码（IaC）的方式管理 [Tailscale PAM][docs-pam] 连接器和服务。本主题将带你完成为 Tailscale PAM 配置 Terraform 并创建第一批资源。"
---

最后验证于 Aug 21, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

你可以使用 Terraform 以基础设施即代码（IaC）的方式管理 [Tailscale PAM][docs-pam] 连接器和服务。本主题将带你完成为 Tailscale PAM 配置 Terraform 并创建第一批资源。

Tailscale PAM 目前使用 [Border0 Terraform provider][xt-terraform-border0] 来管理 PAM 资源。它与管理其他 tailnet 资源所用的 [Tailscale Terraform provider][docs-terraform-provider] 是分开的。

完整的资源 schema 和配置选项，参见 Border0 Terraform provider 的[文档][xt-terraform-border0-docs]。

你还可以浏览 [Border0 Terraform 示例仓库][xt-border0-terraform-examples-repository]获取更多配置示例。请注意，这些示例使用的是 Border0 术语，因此 Tailscale PAM 服务可能被描述为 **socket**，而且一些较早的示例可能包含不适用于 Tailscale PAM 的 Border0 策略资源。

| Tailscale PAM | Border0 Terraform provider |
| -------------- | -------------------------- |
| PAM 连接器     | `border0_connector`        |
| PAM 服务       | `border0_socket`           |
| 访问控制       | Tailscale 授权             |

特别地，Tailscale PAM [服务][docs-pam-services]在 Border0 Terraform provider 中被称为 **socket**。

> **注意：**
>
> 对于 Tailscale PAM，只使用 Border0 Terraform provider 管理 **PAM 连接器**（`border0_connector`）和 **PAM 服务**（`border0_socket`）。不要在 Tailscale PAM 中使用其他 Border0 资源，包括策略资源。请使用 Tailscale [授权][docs-grants]来管理对 PAM 服务的访问。

## 前提条件

开始之前，你需要：

* 访问 Tailscale PAM 的权限。
* 已安装 Terraform。

你还需要按本指南所述，创建一个带有服务账户令牌的 Tailscale PAM [服务账户][docs-pam-service-accounts]。

## 创建服务账户

Terraform 使用 Tailscale PAM 服务账户向 API 进行身份验证。

要创建服务账户：

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面。
2. 在 **Service accounts** 部分选择**添加服务账户**。
3. 输入服务账户的**名称**，例如 `terraform`。
4. （可选）输入描述。
5. 选择 **Member** 角色。这会授予服务账户管理连接器和服务所需的权限。
6. 选择**添加服务账户**。

更多信息，参见 Tailscale PAM [服务账户][docs-pam-service-accounts]。

### 创建服务账户令牌

创建服务账户后，为 Terraform 创建一个令牌：

1. 打开 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面。
2. 在 **Service accounts** 部分找到该服务账户，选择该菜单，然后选择**编辑**。
3. 选择**创建令牌**。
4. 输入令牌名称，例如 `terraform`。
5. 选择令牌的有效期。
6. 选择**保存**。
7. 复制令牌并妥善保管。离开该页面后，你将无法再次获取该令牌的值。

> **警告：**
>
> 请把服务账户令牌当作机密对待。令牌会继承其服务账户的权限。

## 配置 Terraform provider

把 Border0 provider 添加到你的 Terraform 配置中：

```hcl
terraform {
  required_providers {
    border0 = {
      source = "borderzero/border0"
    }
  }
}

provider "border0" {}
```

该 provider 可以从 `BORDER0_TOKEN` 环境变量读取服务账户令牌。使用环境变量或密钥管理器可以避免把令牌存储在 Terraform 配置里。

```shell
export BORDER0_TOKEN="<service-account-token>"
terraform init
```

把 `<service-account-token>` 替换为你的服务账户令牌。

现在你可以使用该 provider 管理 Tailscale PAM 资源了。

## 管理 Tailscale PAM 连接器

使用 `border0_connector` 资源管理 Tailscale PAM [连接器][docs-pam-connectors]。

例如：

```hcl
resource "border0_connector" "production" {
  name        = "production"
  description = "Tailscale PAM connector for production services"
}
```

创建连接器资源会在 Tailscale PAM 中完成连接器的配置。你还必须在一台能到达你想通过 PAM 开放的资源的主机上安装并运行该连接器。

连接器的安装说明，参见[安装 Tailscale PAM 连接器][docs-pam-connectors-install]。

## 管理 Tailscale PAM 服务

Tailscale PAM [服务][docs-pam-services]在 Border0 Terraform provider 中称为 **socket**。使用 `border0_socket` 资源来创建和管理它们。

例如，下面的配置创建一个 HTTP 服务，并将其关联到上面创建的连接器：

```hcl
resource "border0_socket" "internal_admin" {
  name          = "internal-admin"
  description   = "Internal admin application"
  socket_type   = "http"
  connector_ids = [border0_connector.production.id]

  http_configuration {
    upstream_url = "https://admin.internal.example.com"
  }
}
```

运行 Terraform 以检查并应用配置：

```shell
terraform plan
terraform apply
```

你也可以通过提供连接器 ID，把服务关联到一个不受同一 Terraform 配置管理的连接器：

```hcl
connector_ids = ["<connector-id>"]
```

把 `<connector-id>` 替换为你的连接器 ID。

`border0_socket` 可用的配置取决于你要创建的服务类型。完整的资源 schema 和更多示例，请参见 Terraform Registry 中的 Border0 Terraform provider [文档][xt-terraform-border0-docs]。

## 控制对 Terraform 管理的服务的访问

Terraform 管理 PAM 连接器和服务基础设施。请使用 **Tailscale 授权**来控制谁能访问这些服务以及能做什么。

> **注意：**
>
> 在 Terraform provider 文档或较早的 Border0 示例中，可能会出现 `border0_policy` 等 Border0 策略资源。它们属于 Border0 旧版访问控制模型，不适用于 Tailscale PAM。不要用它们来配置对 Tailscale PAM 服务的访问。

关于使用 PAM 授权配置访问的信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 后续步骤

受支持的参数和资源的完整列表，参见 Terraform Registry 中的 Border0 Terraform provider [文档][xt-terraform-border0-docs]。

你还可以浏览 Border0 Terraform [示例仓库][xt-border0-terraform-examples-repository]获取更多 Terraform 配置。请注意，那些示例使用的是 Border0 术语，因此 Tailscale PAM 服务可能被描述为 socket。较早的示例可能包含不适用于 Tailscale PAM 的 Border0 策略资源。

[docs-grants]: /docs/features/access-control/grants

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-service-accounts]: /docs/privileged-access-management/service-accounts

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam]: /docs/privileged-access-management

[docs-terraform-provider]: /docs/integrations/terraform-provider

[xt-border0-terraform-examples-repository]: https://github.com/borderzero/terraform-examples/

[xt-terraform-border0-docs]: https://registry.terraform.io/providers/borderzero/border0/latest/docs

[xt-terraform-border0]: https://registry.terraform.io/providers/borderzero/border0/latest
