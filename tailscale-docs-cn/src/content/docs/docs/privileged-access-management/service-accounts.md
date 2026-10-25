---
title: "Tailscale PAM 服务账户"
description: "使用服务账户以编程方式管理 Tailscale PAM，并在没有 Tailscale 客户端的情况下访问 HTTP 服务。"
---

最后验证于 Aug 13, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

服务账户是机器身份，让 AI 代理和应用程序能够与 Tailscale PAM 交互。

服务账户有两个主要用途：

* **以编程方式管理 Tailscale PAM**：为使用 Tailscale PAM API 的自动化创建服务账户和令牌，例如管理服务、连接器、策略或会话数据的 Terraform 或脚本。
* **在没有 Tailscale 客户端的情况下访问 HTTP 服务**：Tailscale [标签（tag）][docs-tags]在 PAM 中表示为客户端服务账户。当工作负载需要以无客户端方式访问 HTTP 服务时，你可以为其中一个身份创建令牌。

> **注意：**
>
> Tailscale PAM 的编程管理目前使用 `https://api.border0.com` 的 Border0 API，而不是 Tailscale API。因此，你需要一个单独的 Tailscale PAM 服务账户和令牌来进行 API 访问。

对于其他机器对机器访问 PAM 服务的场景，请使用运行 Tailscale 的带标签设备。Tailscale 标签为非用户设备提供身份，并让你可以通过 tailnet 策略控制它们的访问。

## 服务账户与 Tailscale 标签

Tailscale PAM 会自动把每个 Tailscale 标签表示为一个具有 `client` 角色的服务账户。你可以在管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面的 **Service accounts** 下找到这些身份。

你无需为带标签的设备创建 PAM 服务账户。如果工作负载上安装了 Tailscale 客户端，直接使用它的标签身份来访问 PAM 服务即可。

只有当工作负载在不使用 Tailscale 客户端的情况下以编程方式访问 HTTP 服务时，才需要为标签背后的客户端服务账户创建令牌。其他 PAM 服务类型不需要服务账户令牌。

| 使用场景                                                       | 身份                                | 是否需要 PAM 令牌 |
| -------------------------------------------------------------- | ----------------------------------- | ------------------ |
| 使用 Terraform 或其他自动化工具管理 PAM 资源                   | PAM 服务账户                        | 是                 |
| 从运行 Tailscale 的机器访问 PAM 服务                           | 带标签的 Tailscale 设备             | 否                 |
| 在没有 Tailscale 客户端的情况下访问 HTTP 服务                  | 标签背后的 `client` 服务账户        | 是                 |

`client` 角色让该身份可以作为 PAM 服务的客户端。它不提供管理 PAM 配置的权限，而且该身份仍必须被你的 [tailnet 策略文件][docs-tailnet-policy-file]允许访问目标服务。

## 为 API 访问创建服务账户

当应用程序、脚本或自动化工具需要以编程方式管理 Tailscale PAM 资源时，请创建服务账户。

例如，你可以让服务账户配合 Terraform 来创建和管理 PAM 服务、连接器和策略。Tailscale PAM 目前在此工作流中使用 [Border0 Terraform provider][xt-border0-terraform-docs]。

要创建服务账户：

1. 打开 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面。
2. 在 **Service accounts** 部分选择**添加服务账户**。
3. 输入服务账户的**名称**。
4. （可选）输入描述。
5. 选择能为你的自动化提供所需权限的角色。
6. 选择**添加服务账户**。

对于管理服务和连接器的 Terraform 配置，请使用 **Member** 角色。对于受限更多的自动化，请尽量选择限制更强的角色。

### 服务账户角色

请选择既能满足自动化所需访问、又具备最小权限的角色。

| 角色                | 权限                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrator**   | 对 Tailscale PAM 所用的 Border0 API 拥有完整的读写权限。                                                                              |
| **Member**          | 管理服务、连接器和策略，并查看其他 PAM 资源。不提供对组织设置或用户管理的访问。 |
| **Service Manager** | 仅能管理服务和连接器。                                                                                                          |
| **Read Only**       | 只读查看 PAM 资源，不能做更改。                                                                                                    |

这些角色决定了服务账户可以通过 Tailscale PAM 所用的 Border0 API 做什么。

对于 Terraform 这类自动化，请选择能覆盖你配置所管理资源的最窄角色。

## 创建服务账户令牌

创建服务账户后，为你的应用程序创建一个用于向 Tailscale PAM 所用 Border0 API 进行身份验证的令牌。

要创建令牌：

1. 打开 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面。
2. 在 **Service accounts** 部分找到该服务账户，选择该菜单，然后选择**编辑**。
3. 选择**创建令牌**。
4. 输入令牌名称。
5. 选择令牌的有效期。
6. 选择**保存**。
7. 复制令牌并妥善保管。

请把服务账户令牌当作机密对待。令牌会继承其服务账户的权限。

只要可能，请使用有过期时间的令牌，并选择能满足你自动化的最短有效期。

## 配合 Tailscale PAM API 使用服务账户

Tailscale PAM 目前的编程管理使用 `https://api.border0.com` 上的 Border0 API。该 API 的身份验证与 Tailscale API 的身份验证是分开的。

使用为你的 PAM 服务账户创建的令牌来对 API 请求进行身份验证。

例如：

```shell
curl https://api.border0.com/api/v1/connectors \
  -H "accept: application/json" \
  -H "Authorization: <your-token>"
```

把 `<your-token>` 替换为你创建的令牌。

应用程序可用的权限由分配给服务账户的角色决定。

## 配合 Tailscale PAM 使用 Terraform

你可以使用 Border0 Terraform provider 以基础设施即代码的方式管理 Tailscale PAM 资源。

创建一个具备你 Terraform 配置所需权限的 PAM 服务账户，为该服务账户创建令牌，并使用该令牌对 provider 进行身份验证。

provider 配置和示例参见以下资源：

* [Border0 Terraform provider 文档][xt-border0-terraform-docs]
* [Border0 Terraform 示例][xt-border0-terraform-examples]

Terraform provider 和示例目前使用的是 Border0 的 API 和资源术语。例如，在 Tailscale 管理控制台中显示为**服务**的资源，在 Terraform provider 中可能被称为 **socket**。

## 使用客户端服务账户访问 HTTP 服务

无需在发起请求的机器上安装 Tailscale 客户端，就可以以编程方式访问 HTTP 服务。对于这种场景，请为代表该工作负载 Tailscale 身份的标签背后客户端服务账户创建一个令牌。

你不需要再创建别的服务账户。

要创建令牌：

1. 打开 [PAM](https://console.tailscale.com/admin/settings/pam) 设置页面。
2. 在 **Service accounts** 部分找到与你想要使用的 Tailscale 标签对应的服务账户。标签背后的身份具有 `client` 角色。
3. 选择该菜单，然后选择**编辑**。
4. 选择**创建令牌**。
5. 输入令牌名称。
6. 选择令牌的有效期。
7. 选择**保存**。
8. 复制该令牌。

通过 `Border0-Token` 请求头把令牌传给 HTTP 服务，并把 `<your-token>` 替换为你创建的令牌。
:

```shell
export BORDER0_TOKEN=<your-token>

curl https://nginx1-demo.border0.io \
  -H "Border0-Token: $BORDER0_TOKEN"
```

Tailscale PAM 使用 `Border0-Token` 请求头而不是标准的 `Authorization` 请求头，这样 PAM 身份验证就不会与上游 HTTP 应用所需的身份验证请求头发生冲突。

该令牌把请求标识为对应的带标签客户端身份。创建令牌本身不会授予额外访问权限。该身份能使用哪些 PAM 服务，仍由你的 [tailnet 策略文件][docs-tailnet-policy-file]决定。

## 保护服务账户令牌的最佳实践

服务账户令牌为非人类主体提供对 PAM 资源的访问，因此请像对待其他特权凭证一样保护它们。

* 为工作负载选用权限最小的服务账户角色。
* 优先使用会过期的令牌，而不是永不过期的令牌。
* 把令牌存储在密钥管理器或其他安全的凭证存储中，而不是源代码或配置文件里。
* 当分开创建服务账户或令牌能让归属和轮换更清晰时，为不同的自动化工作负载创建不同的服务账户或令牌。
* 移除不再需要的令牌；如果你认为某个令牌已经泄露，请立即更换。

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-border0-terraform-docs]: https://registry.terraform.io/providers/borderzero/border0/latest/docs

[xt-border0-terraform-examples]: https://github.com/borderzero/terraform-examples
