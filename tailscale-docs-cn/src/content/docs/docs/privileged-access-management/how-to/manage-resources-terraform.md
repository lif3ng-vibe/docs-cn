---
title: "Manage Tailscale PAM resources using Terraform"
description: "You can use Terraform to manage [Tailscale PAM][docs-pam] connectors and services as Infrastructure as Code (IaC). This topic walks through configuring Terraform for Tailscale PAM and creating your fi"
---

Last validated Aug 21, 2026

> **Note:** Tailscale PAM is currently in beta.

You can use Terraform to manage [Tailscale PAM][docs-pam] connectors and services as Infrastructure as Code (IaC). This topic walks through configuring Terraform for Tailscale PAM and creating your first resources.

Tailscale PAM currently uses the [Border0 Terraform provider][xt-terraform-border0] to manage PAM resources. This is separate from the [Tailscale Terraform provider][docs-terraform-provider] used to manage other tailnet resources.

For complete resource schemas and configuration options, refer to the Border0 Terraform provider [documentation][xt-terraform-border0-docs].

You can also explore the [Border0 Terraform examples repository][xt-border0-terraform-examples-repository] for additional configuration examples. Keep in mind that these examples use Border0 terminology, so Tailscale PAM services might be described as **sockets**, and some older examples might include Border0 policy resources that don't apply to Tailscale PAM.

| Tailscale PAM  | Border0 Terraform provider |
| -------------- | -------------------------- |
| PAM Connector  | `border0_connector`        |
| PAM Service    | `border0_socket`           |
| Access control | Tailscale grants           |

In particular, Tailscale PAM [services][docs-pam-services] are referred to as **sockets** in the Border0 Terraform provider.

> **Note:**
>
> For Tailscale PAM, use the Border0 Terraform provider only to manage **PAM connectors** (`border0_connector`) and **PAM services** (`border0_socket`). Don't use other Border0 resources, including policy resources, with Tailscale PAM. Use Tailscale [grants][docs-grants] to manage access to PAM services.

## Prerequisites

Before you begin, you need:

* Access to Tailscale PAM.
* Terraform installed.

You need to create a Tailscale PAM [service account][docs-pam-service-accounts] with a service account token, as described in this guide.

## Create a service account

Terraform authenticates to the API using a Tailscale PAM service account.

To create a service account:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page of the Tailscale admin console.
2. In the **Service accounts** section, select **Add service account**.
3. Enter a **Name** for the service account, such as `terraform`.
4. (Optional) Enter a description.
5. Select the **Member** role. This gives the service account the permissions needed to manage connectors and services.
6. Select **Add service account**.

For more information, refer to Tailscale PAM [service accounts][docs-pam-service-accounts].

### Create a service account token

After creating the service account, create a token for Terraform:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page.
2. In the **Service accounts** section, find the service account, select the  menu, and select **Edit**.
3. Select **Create token**.
4. Enter a name for the token, such as `terraform`.
5. Select the token lifetime.
6. Select **Save**.
7. Copy the token and store it securely. You won't be able to get the token value again after you leave the page.

> **Warning:**
>
> Treat service account tokens as secrets. The token inherits the permissions of its service account.

## Configure the Terraform provider

Add the Border0 provider to your Terraform configuration:

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

The provider can read the service account token from the `BORDER0_TOKEN` environment variable. Using an environment variable or secrets manager avoids storing the token in your Terraform configuration.

```shell
export BORDER0_TOKEN="<service-account-token>"
terraform init
```

Replace `<service-account-token>` with your service account token.

You can now use the provider to manage Tailscale PAM resources.

## Manage a Tailscale PAM connector

Use the `border0_connector` resource to manage a Tailscale PAM [connector][docs-pam-connectors].

For example:

```hcl
resource "border0_connector" "production" {
  name        = "production"
  description = "Tailscale PAM connector for production services"
}
```

Creating the connector resource configures the connector in Tailscale PAM. You must also install and run the connector on a host that can reach the resources you want to make available through PAM.

For connector installation instructions, refer to [Install a Tailscale PAM connector][docs-pam-connectors-install].

## Manage a Tailscale PAM service

Tailscale PAM [services][docs-pam-services] are called **sockets** in the Border0 Terraform provider. Use the `border0_socket` resource to create and manage them.

For example, the following configuration creates an HTTP service and associates it with the connector created above:

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

Run Terraform to review and apply the configuration:

```shell
terraform plan
terraform apply
```

You can also associate a service with a connector that isn't managed by the same Terraform configuration by providing its connector ID:

```hcl
connector_ids = ["<connector-id>"]
```

Replace `<connector-id>` with the ID of your connector.

The configuration available for a `border0_socket` depends on the type of service you are creating. Refer to the Border0 Terraform provider [documentation][xt-terraform-border0-docs] in the Terraform Registry for the complete resource schema and additional examples.

## Control access to Terraform-managed services

Terraform manages the PAM connector and service infrastructure. Use **Tailscale grants** to control who can access those services and what they can do.

> **Note:**
>
> There may be Border0 policy resources, such as `border0_policy`, in the Terraform provider documentation or older Border0 examples. These belong to the legacy Border0 access control model and don't apply to Tailscale PAM. Don't use them to configure access to Tailscale PAM services.

For information about configuring access using PAM grants, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Next steps

For the complete list of supported arguments and resources, refer to the Border0 Terraform provider [documentation][xt-terraform-border0-docs] in the Terraform Registry.

You can also explore the Border0 Terraform [examples repository][xt-border0-terraform-examples-repository] for additional Terraform configurations. Keep in mind that those examples use Border0 terminology, so Tailscale PAM services might be described as sockets. Older examples might include Border0 policy resources that aren't applicable to Tailscale PAM.

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
