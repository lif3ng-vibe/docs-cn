---
title: "设置应用连接器"
description: "应用连接器让你把 Tailscale 网络（即 tailnet）流量路由到软件即服务（SaaS）、云端和自托管应用，让 tailnet 中的用户和设备通过域名访问"
---

最后验证于 Jan 5, 2026

> **注意：** 应用连接器适用于[所有套餐](https://tailscale.com/pricing)。

应用连接器让你把 Tailscale 网络（即 tailnet）流量路由到你的软件即服务（SaaS）、云端和自托管应用，让 tailnet 中的用户和设备通过域名（而非 IP 地址）访问应用。你还可以在应用连接器设置中融入监控、优化、安全与可靠性能力。

有关应用连接器的更多深入信息，参见[应用连接器的工作原理][docs-app-connectors]。

> **提示：**
>
> 你也可以[使用 Kubernetes Operator 将应用连接器部署到你的 Kubernetes 集群][docs-kubernetes-app-connector]。

## 要求

要设置应用连接器，你必须具备：

* 一个已有的 tailnet，以及一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 角色的用户账号，用于编辑 tailnet 策略文件和管理管理控制台中的应用连接器设置。
* 一台用作应用连接器的 Linux 设备，且满足：
  * 拥有可公开访问的 IP 地址。
  * 已启用 IP 转发。
  * 可以使用物理设备或虚拟机作为应用连接器设备。
* 一个你拥有管理权限的 SaaS 或自托管应用。

## 开始使用

要在 tailnet 中添加[预设应用][ar-preset-apps]类型的连接器，你需要完成以下步骤：

1. 在管理控制台中添加应用连接器，将流量路由到你的应用。添加预设应用时，[tailnet 策略文件][docs-tailnet-policy-file]的 `nodeAttrs` 部分会自动为该应用连接器新增一条 `target` 条目。`tagOwners`、`autoApprovers` 和 `grants` 条目则必须在 tailnet 策略文件中手动添加。
2. 更新 tailnet 策略文件，加入 `tagOwners`、`autoApprovers` 和 `grants` 条目，让 tailnet 中的设备可以使用应用连接器。
3. 将 tailnet 中的一台 Linux 节点配置为应用连接器设备。
4. （可选）在应用中配置 IP 白名单，将应用访问限制为只能来自应用连接器设备。

要在 tailnet 中添加[自定义应用][ar-custom-apps]类型的连接器，你需要完成以下步骤：

1. 更新 [tailnet 策略文件][docs-tailnet-policy-file]，在 `nodeAttrs`、`tagOwners`、`autoApprovers` 和 `grants` 部分加入条目，让 tailnet 中的设备可以使用应用连接器。
2. 将 tailnet 中的一台 Linux 节点配置为应用连接器设备。
3. 在管理控制台中添加应用连接器设置，将流量路由到你的应用。
4. （可选）在应用中配置 IP 白名单，将应用访问限制为只能来自应用连接器设备。

### 更新 tailnet 策略文件

在 tailnet 策略文件中配置必要的权限，让设备可以使用应用连接器设备。

你需要拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限才能编辑 tailnet 策略文件。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。

2. 添加一条 [`tagOwners`][docs-tags] 规则，定义标签名称并指定哪些用户可以把该标签分配给其他设备，使其能够连接到应用连接器。以下示例将 `github-admins` 组定义为 `github-app-connector` 标签的所有者。

   ```json
   "tagOwners": {
     "tag:github-app-connector": [
       "group:github-admins",
     ],
   },
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

3. 添加一条 [`autoApprovers`][docs-policy-syntax-autoapprovers] 规则，自动批准应用连接器标签的特定路由。配置应用流量经由应用连接器路由之后，任何对已配置应用域名的 DNS 请求都会触发路由发现。

   > **注意：**
   >
   > 预设应用在多数情况下不需要为路由配置 `autoApprovers` 规则。Tailscale 会为预设应用更新并管理路由，这些路由会自动批准。
   >
   > 不过，预设应用也可能通过 DNS 发现新路由。这些学习到的路由不会自动批准，需要 `autoApprovers` 规则。
   >
   > 自定义应用的路由始终需要 `autoApprovers` 规则。

   以下自动批准策略示例会自动批准使用 `github-app-connector` 标签的设备的所有 IPv4 和 IPv6 路由。

   ```json
   "autoApprovers": {
     "routes": {
       "0.0.0.0/0": ["tag:github-app-connector"],
       "::/0": ["tag:github-app-connector"],
     },
   },
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

4. 添加一条 [`grants`][docs-policy-syntax-grants] 规则，把应用相关的流量路由到应用连接器标签。

   你必须允许 tailnet 设备访问应用连接器通告的路由。一种做法是在 tailnet 策略文件中加入一条访问控制策略，为 tailnet 成员授予对 `autogroup:internet`（任意端口号）的访问权，这同时也会授予用户访问 tailnet 内任何出口节点的权限。

   ```json
   "grants": [
     {
       "src": ["autogroup:member"],
       "dst": ["autogroup:internet"],
       "ip": ["*"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

   > **警告：**
   >
   > 设备需要能够访问应用连接器标签才能进行 DNS 发现。应用连接器使用 PeerAPI 执行 DoH 调用。请通过 TCP 或 UDP 端口 `53` 授予最小访问权限，以启用对等节点发现：
   >
   > ```json
   > "grants": [
   >   {
   >     "src": ["autogroup:member"],
   >     "dst": ["tag:github-app-connector"],
   >     "ip": ["tcp:53", "udp:53"]
   >   }
   > ]
   > ```
   >
   > \[Missing snippet: visual\_policy\_editor.mdx]

5. 添加一条 [`nodeAttrs`][docs-policy-syntax-node-attributes] 规则，把应用连接器标签映射到应用相关的域名。以下节点属性定义示例为 GitHub 域名配置 `github-app-connector` 标签。

   > **注意：**
   >
   > 如果你配置的是预设应用类型的应用连接器，tailnet 策略文件中的 `nodeAttrs` 部分会自动更新，你可以跳过这一步。

   ```json
   "nodeAttrs": [
     {
       "target": ["*"],
       "app": {
         "tailscale.com/app-connectors": [
           {
             "name": "GitHub",
             "connectors": ["tag:github-app-connector"],
             "domains": [
               "github.com",
               "*.github.com"
             ]
           }
         ]
       }
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

### 将设备配置为应用连接器

更新 [tailnet 策略文件][ar-tailnet-policy-file]之后，配置设备使其承担应用连接器职能。

> **警告：**
>
> 应用连接器设备必须运行 Linux、已加入你的 tailnet、拥有公网 IP 地址，并且已启用 IP 端口转发。

运行以下 Tailscale CLI 命令，确保将尖括号（`<>`）中的变量替换为实际的应用连接器标签名称。

```shell
tailscale up --advertise-connector --advertise-tags=tag:<connector-tag-name>
```

`--advertise-connector` 标志让设备根据 tailnet 策略文件中的配置为特定域名路由流量。`--advertise-tags` 标志让 Tailscale 客户端使用提供的标签对设备进行认证。

#### 添加预设应用

预设应用是我们支持自动添加应用所需域名的应用，可以减少应用连接器配置所需的时间。设置完成后，预设应用会定期从应用的权威配置获取域名和路由，并将任何变更传播到 tailnet。

Tailscale 支持以下预设应用：

* AWS CloudFront（全球）
* AWS Elastic Compute Cloud（EC2）/ Elastic Load Balancing（ELB）
* AWS Simple Storage Service（S3）
* Confluence
* GitHub
* Google Workspace
* Jira
* Microsoft 365
* Okta
* Oracle Cloud Infrastructure（OCI）
* Oracle Object Storage
* Oracle Services Network（OSN）（全球）
* Salesforce（Hyperforce 环境）
* Salesforce（Salesforce 托管）
* Stripe

你需要成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能配置预设应用。

1. 打开管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面。

2. 在 **Add an app** 对话框中输入以下信息。

   1. **Name**：输入一个唯一名称，用于标识该应用。
   2. **Target**：选择一个预设应用，自动添加你的应用的域名。
   3. **Connectors**：选择你在 tailnet 策略文件中为应用连接器配置的一个或一组标签。

3. 选择 **Save**。

应用连接器名称旁边的绿色图标表示它当前处于活动状态且工作正常。

选择你添加的应用连接器，可以查看更多详细信息，用于管理 tailnet 和应用两侧的设置。

*（图：预设应用的应用连接器详情。）*

发往已配置域名的流量会先经过带标签的应用连接器，再到达互联网上的目标域名。即使发起设备使用出口节点，这种路由也会发生。这类流量的源 IP 地址会显示为承担应用连接器角色的设备的公网 IP 地址之一。

#### 添加自定义应用

如果你的应用不在管理控制台的预设应用之列，可以手动配置设置。

你需要成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能添加和编辑应用连接器。

1. 打开管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面。

2. 在 **Add an app** 对话框中输入以下信息。

   1. **Name**：输入一个唯一名称，用于标识该应用。
   2. **Target**：选择 **Custom**，手动输入应用域名。如果需要添加多个域名条目，用逗号分隔每个域名。指定域名时，子域名可以使用通配符，但顶级域名（TLD）不可以。例如，`*.example.com`、`*.example.co.uk`、`*.example.info` 是有效的，而 `*.com`、`*.co.uk`、`*.info` 无效。
   3. **Connectors**：选择你在 tailnet 策略文件中为应用连接器配置的一个或一组标签。

3. 选择 **Save**。

应用连接器名称旁边的绿色图标表示它当前处于活动状态且工作正常。

选择你添加的应用连接器，可以查看更多详细信息，用于管理 tailnet 和应用两侧的设置。

*（图：自定义应用的应用连接器详情。）*

#### 编辑预设应用

管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面是设置预设应用的主要方式，添加应用连接器时会自动更新 `presetAppID`。你也可以在 tailnet 策略文件中手动修改应用的 `presetAppID`。

下面是一个以 GitHub 作为预设应用的示例片段。

```json
"nodeAttrs": [
  {
    "target": ["*"],
    "app": {
      "tailscale.com/app-connectors": [
        {
          "name": "github app",
          "connectors": ["tag:code", "tag:ci-cd"],
          "presetAppID": "github"
        }
      ]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

以下是 tailnet 策略文件中支持的预设应用清单。

| **预设应用名称** | **`presetAppID` 值** |
| --- | --- |
| AWS CloudFront (global) | `aws-cloudfront-global` |
| AWS EC2/ELB | `aws-ec2-<region>-<availability-zone>-<local-zone>` |
| AWS S3 | `aws-s3-<region>-<availability-zone>-<local-zone>` |
| Confluence | `confluence` |
| GitHub | `github` |
| Google Workspace | `google-workspace` |
| Jira | `jira` |
| Microsoft 365 | `microsoft-365` |
| Okta | `okta` |
| Oracle Cloud Infrastructure (OCI) | `oracle-oci-<region>` |
| Oracle Object Storage | `oracle-object-storage-<region>` |
| Oracle Services Network (global) | `oracle-osn-global` |
| Salesforce (Hyperforce environment) | `salesforce-hyperforce` |
| Salesforce (Salesforce-hosted) | `salesforce` |
| Stripe | `stripe` |

#### 移除应用连接器

你必须成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能移除应用连接器。

1. 打开管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面。
2. 选择要移除的应用连接器旁边的菜单，然后选择 **Remove**。

移除应用连接器后，发往该应用的流量不再经由应用连接器路由。改为从客户端设备直接路由到应用的域名，如果设备使用出口节点，则经由出口节点路由。

如果你不再需要 tailnet 中的应用连接器设备，可以[将其移除][docs-device-remove]。

### 按 IP 地址限制应用访问

许多应用支持通过指定哪些 IP 地址可以连接来控制访问。使用应用连接器时，从你的 tailnet 发往目标应用的所有流量看起来都来自应用连接器的公网出站 IP 地址。这意味着你可以把应用连接器的出站 IP 地址加入目标应用的可信入站 IP 地址列表（称为 IP 白名单）。这确保只有能访问应用连接器的用户才能访问目标应用。

设置方法是：找到你应用的 IP 白名单设置，把每台承担应用连接器角色的设备的公网 IP 地址加入其中。如果你使用多台应用连接器做冗余，请把它们的公网 IP 地址全部加入。你可以在云服务商的管理界面找到这些 IP 地址。

下面列出了 Tailscale 支持的预设应用，以及为它们配置特定 IP 地址（IP 白名单）以实现对应用连接器设备专属访问的链接。

* [AWS][xt-ip-allow-aws]
* [Confluence][xt-ip-allow-atlassian]
* [GitHub][xt-ip-allow-github]
* [Google Workspace][xt-ip-allow-google-workplace]
* [Jira][xt-ip-allow-atlassian]
* [Microsoft 365][xt-ip-allow-microsoft-365]
* [Okta][xt-ip-allow-okta]
* [Salesforce][xt-ip-allow-salesforce]
* [Stripe][xt-ip-allow-stripe]

Tailscale 会自动查找预设应用的 IP 地址。前往管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面，选择你要配置的应用详情，复制其中列出的 **Egress IPs**。该列表包含在相关标签上配置的所有连接器的全部 IP 地址。新增应用连接器时，记得同步更新你的 IP 白名单。

> **注意：**
>
> 应用连接器设备有两个不同的 IP 地址：一个是 tailnet 私有的 [Tailscale IP 地址][docs-tailscale-ip-addresses]，另一个是互联网上其他应用可以访问的公网 IP 地址。配置 IP 访问控制时，你需要的是公网 IP 地址，而不是 Tailscale IP 地址。

## 限制

* Linux 是唯一可以用作 tailnet 内应用连接器设备的操作系统。
* 应用连接器不能跨多个 tailnet 共享。
* 在单个实例上或整个 tailnet 范围内通告超过 1 万条路由，会给连接的客户端带来严重的功能问题。
* tailnet 在所有应用范围内最多只能通告 250 个域名。
* 不建议使用频繁变化或[临时（ephemeral）][docs-ephemeral-nodes]资源作为应用连接器。应用连接器会随时间学习并构建到所连域名的路由，因此使用稳定的路由基础设施能提供更好的性能和可靠性。
* 如果你使用 [Terraform][docs-terraform-provider] 或 [GitOps][docs-gitops] 等外部提供方管理 tailnet 策略文件，那么在管理控制台中对应用连接器所做的任何更改都会在下次同步时被覆盖。请务必通过你的外部提供方来管理应用连接器。

[ar-custom-apps]: #添加自定义应用

[ar-preset-apps]: #添加预设应用

[ar-tailnet-policy-file]: #更新-tailnet-策略文件

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-remove]: /docs/features/access-control/device-management/how-to/remove

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-gitops]: /docs/gitops

[docs-kubernetes-app-connector]: /docs/kubernetes-operator/connector/deploy-app-connector

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-grants]: /docs/reference/syntax/policy-file#grants

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-terraform-provider]: /docs/integrations/terraform-provider

[xt-ip-allow-atlassian]: https://support.atlassian.com/security-and-access-policies/docs/specify-ip-addresses-for-product-access/

[xt-ip-allow-aws]: https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-ip-address.html

[xt-ip-allow-github]: https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization

[xt-ip-allow-google-workplace]: https://support.google.com/a/answer/12642752?hl=en

[xt-ip-allow-microsoft-365]: https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide

[xt-ip-allow-okta]: https://support.okta.com/help/s/article/How-to-Allow-Access-to-the-Okta-Applications-Only-From-a-Specific-IP-Range

[xt-ip-allow-salesforce]: https://help.salesforce.com/s/articleView?id=000386441&type=1

[xt-ip-allow-stripe]: https://docs.stripe.com/keys#limit-api-secret-keys-ip-address
