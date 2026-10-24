---
title: "Tailscale PAM service accounts"
description: "Use service accounts to manage Tailscale PAM programmatically and to access an HTTP service without the Tailscale client."
---

Last validated Aug 13, 2026

> **Note:** Tailscale PAM is currently in beta.

Service accounts are machine identities that let AI agents and applications interact with Tailscale PAM.

You can use service accounts for two primary purposes:

* **Manage Tailscale PAM programmatically**: Create a service account and token for automation that uses the Tailscale PAM API, such as Terraform or scripts that manage services, connectors, policies, or session data.
* **Access an HTTP service without the Tailscale client**: Tailscale [tags][docs-tags] are represented in PAM as client service accounts. You can create a token for one of these identities when a workload needs clientless access to an HTTP service.

> **Note:**
>
> Programmatic management of Tailscale PAM currently uses the Border0 API at `https://api.border0.com`, not the Tailscale API. As a result, you need a separate Tailscale PAM service account and token for API access.

For other machine-to-machine access to PAM services, use a tagged device running Tailscale. Tailscale tags provide identities for non-user devices and let you control their access through your tailnet policy.

## Service accounts and Tailscale tags

Tailscale PAM automatically represents each Tailscale tag as a service account with the `client` role. You can find these identities in the [PAM](https://console.tailscale.com/admin/settings/pam) settings page of the admin console, under **Service accounts**.

You don't need to create a PAM service account for a tagged device. If the workload has the Tailscale client installed, use its tag identity to access PAM services.

A token is only needed for a tag-backed client service account when a workload programmatically accesses an HTTP service without the Tailscale client. Other PAM service types do not require a service account token.

| Use case                                                       | Identity                            | PAM token required |
| -------------------------------------------------------------- | ----------------------------------- | ------------------ |
| Manage PAM resources with Terraform or another automation tool | PAM service account                 | Yes                |
| Access PAM services from a machine running Tailscale           | Tagged Tailscale device             | No                 |
| Access an HTTP service without the Tailscale client            | Tag-backed `client` service account | Yes                |

The `client` role lets the identity act as a client of PAM services. It doesn't provide permission to manage PAM configuration, and the identity must still be allowed to access the target service by your [tailnet policy file][docs-tailnet-policy-file].

## Create a service account for API access

Create a service account when an application, script, or automation tool needs to manage Tailscale PAM resources programmatically.

For example, you can use a service account with Terraform to create and manage PAM services, connectors, and policies. Tailscale PAM currently uses the [Border0 Terraform provider][xt-border0-terraform-docs] for this workflow.

To create a service account:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page.
2. In the **Service accounts** section, select **Add service account**.
3. Enter a **Name** for the service account.
4. (Optional) Enter a description.
5. Select the role that provides the permissions required by your automation.
6. Select **Add service account**.

For Terraform configurations that manage services and connectors, use the **Member** role. For more limited automation, select a more restrictive role when possible.

### Service account roles

Select the least-privileged role that provides the access your automation requires.

| Role                | Permissions                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrator**   | Full read-write access to the Border0 API used by Tailscale PAM.                                                                              |
| **Member**          | Manage services, connectors, and policies, and view other PAM resources. Does not provide access to organization settings or user management. |
| **Service Manager** | Manage services and connectors only.                                                                                                          |
| **Read Only**       | View PAM resources without making changes.                                                                                                    |

These roles determine what the service account can do through the Border0 API used by Tailscale PAM.

For automation such as Terraform, choose the narrowest role that covers the resources managed by your configuration.

## Create a service account token

After creating the service account, create a token that your application can use to authenticate to the Border0 API used by Tailscale PAM.

To create a token:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page.
2. In the **Service accounts** section, find the service account, select the  menu, and select **Edit**.
3. Select **Create token**.
4. Enter a name for the token.
5. Select the token lifetime.
6. Select **Save**.
7. Copy the token and store it securely.

Treat service account tokens as secrets. The token inherits the permissions of its service account.

When possible, use an expiring token and choose the shortest lifetime that works for your automation.

## Use a service account with the Tailscale PAM API

Tailscale PAM currently uses the Border0 API at `https://api.border0.com` for programmatic management. Authentication for this API is separate from authentication for the Tailscale API.

Use the token created for your PAM service account to authenticate API requests.

For example:

```shell
curl https://api.border0.com/api/v1/connectors \
  -H "accept: application/json" \
  -H "Authorization: <your-token>"
```

Replace `<your-token>` with the token that you created.

The permissions available to the application are determined by the role assigned to the service account.

## Use Terraform with Tailscale PAM

You can use the Border0 Terraform provider to manage Tailscale PAM resources as infrastructure as code.

Create a PAM service account with the permissions required by your Terraform configuration, create a token for that service account, and use the token to authenticate the provider.

Refer to the following resources for provider configuration and examples:

* [Border0 Terraform provider documentation][xt-border0-terraform-docs]
* [Border0 Terraform examples][xt-border0-terraform-examples]

The Terraform provider and examples currently use Border0 API and resource terminology. For example, resources that appear as **services** of the Tailscale admin console might be called **sockets** in the Terraform provider.

## Access an HTTP service with a client service account

HTTP services can be accessed programmatically without installing the Tailscale client on the requesting machine. For this use case, create a token for the tag-backed client service account that represents the workload's Tailscale identity.

You don't need to create another service account.

To create the token:

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) settings page.
2. In the **Service accounts** section, find the service account corresponding to the Tailscale tag you want to use. Tag-backed identities have the `client` role.
3. Select the  menu, and select **Edit**.
4. Select **Create token**.
5. Enter a name for the token.
6. Select the token lifetime.
7. Select **Save**.
8. Copy the token.

Pass the token to the HTTP service using the `Border0-Token` request header, replacing `<your-token>` with the token that you created.
:

```shell
export BORDER0_TOKEN=<your-token>

curl https://nginx1-demo.border0.io \
  -H "Border0-Token: $BORDER0_TOKEN"
```

Tailscale PAM uses the `Border0-Token` header instead of the standard `Authorization` header so that PAM authentication doesn't conflict with authentication headers required by the upstream HTTP application.

The token identifies the request as the corresponding tagged client identity. Creating a token does not grant additional access. Your [tailnet policy file][docs-tailnet-policy-file] still determines which PAM services that identity can use.

## Best practices to protect service account tokens

Service account tokens provide non-human access to PAM resources, so protect them like other privileged credentials.

* Use the least-privileged service account role appropriate for the workload.
* Prefer expiring tokens instead of tokens that never expire.
* Store tokens in a secrets manager or another secure credential store instead of source code or configuration files.
* Create separate service accounts or tokens for separate automation workloads when doing so makes ownership and rotation clearer.
* Remove tokens that are no longer required, and replace a token if you believe it has been exposed.

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-border0-terraform-docs]: https://registry.terraform.io/providers/borderzero/border0/latest/docs

[xt-border0-terraform-examples]: https://github.com/borderzero/terraform-examples
