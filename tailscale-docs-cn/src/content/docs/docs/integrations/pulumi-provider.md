---
title: "使用 Pulumi 管理 Tailscale 资源"
description: "使用 Pulumi Tailscale provider 与 Tailscale API 交互。"
---

最后验证于 Mar 3, 2025

[Pulumi][xt-pulumi] 是一种基础设施即代码（IaC）工具，可让你以编程方式部署基础设施。Pulumi 在 Pulumi registry 中维护着 [Tailscale Pulumi provider][xt-pulumi-tailscale]。

你可以使用 Tailscale Pulumi provider 来：

* 使用 [`Acl` 资源][xt-pulumi-tailscale-api-acl]定义你的 [ACL][docs-acls]。
* 设置 [DNS 设置][docs-dns]，包括：
  * 使用 [`DnsNameservers` 资源][xt-pulumi-tailscale-api-dnsnameservers]设置全局域名服务器。
  * 使用 [`DnsSearchPaths` 资源][xt-pulumi-tailscale-api-dnssearchpaths]设置用于 split DNS 的受限域名服务器。
  * 使用 [`DnsPreferences` 资源][xt-pulumi-tailscale-api-dnspreferences]设置 [MagicDNS][docs-magicdns]。
* 使用 [`TailnetKey` 资源][xt-pulumi-tailscale-api-tailnetkey]生成[认证密钥（auth key）][docs-auth-keys]（包括设置其是否可重用、是否为临时密钥（ephemeral）、是否预授权以及是否带标签）。
* 管理设备的属性，包括：
  * 使用 [`DeviceAuthorization` 资源][xt-pulumi-tailscale-api-deviceauthorization]进行[设备审批][docs-device-approval]。
  * 使用 [`DeviceKey` 资源][xt-pulumi-tailscale-api-devicekeys]设置[密钥过期][docs-key-expiry]。
  * 使用 [`DeviceTags` 资源][xt-pulumi-tailscale-api-devicetags]设置[标签][docs-tags]。
  * 使用 [`DeviceSubnetRoutes` 资源][xt-pulumi-tailscale-api-devicesubnetroutes]设置[子网路由][docs-subnets]。

## 安装步骤

要将 Pulumi 与 Tailscale 一起使用：

1. 安装 Tailscale Pulumi provider 在 [Node.js、Python、Go 或 .NET][xt-gh-pulumi-install] 下的软件包。
2. 使用 Tailscale 的 [API 访问令牌][docs-api]和你的 tailnet 名称设置 Pulumi 的 Tailscale 配置。你可以[将它们设置为环境变量，或将其作为 Pulumi 配置的一部分][xt-pulumi-tailscale-configure]。要在 Pulumi 配置中设置它们：

   ```shell
   pulumi config set tailscale:apiKey tskey-1234567CNTRL-abcdefghijklmnopqrstu --secret
   pulumi config set tailscale:tailnet example.com
   ```

## 支持

如果你遇到问题或有功能需求，请[提交 GitHub issue][xt-gh-pulumi-tailscale-issues]。

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[xt-gh-pulumi-install]: https://github.com/pulumi/pulumi-tailscale/blob/master/README.md#installing

[xt-gh-pulumi-tailscale-issues]: https://github.com/pulumi/pulumi-tailscale/issues

[xt-pulumi-tailscale-api-acl]: https://www.pulumi.com/registry/packages/tailscale/api-docs/acl

[xt-pulumi-tailscale-api-deviceauthorization]: https://www.pulumi.com/registry/packages/tailscale/api-docs/deviceauthorization

[xt-pulumi-tailscale-api-devicekeys]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicekey

[xt-pulumi-tailscale-api-devicesubnetroutes]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicesubnetroutes

[xt-pulumi-tailscale-api-devicetags]: https://www.pulumi.com/registry/packages/tailscale/api-docs/devicetags

[xt-pulumi-tailscale-api-dnsnameservers]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnsnameservers

[xt-pulumi-tailscale-api-dnspreferences]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnspreferences

[xt-pulumi-tailscale-api-dnssearchpaths]: https://www.pulumi.com/registry/packages/tailscale/api-docs/dnssearchpaths

[xt-pulumi-tailscale-api-tailnetkey]: https://www.pulumi.com/registry/packages/tailscale/api-docs/tailnetkey

[xt-pulumi-tailscale-configure]: https://www.pulumi.com/registry/packages/tailscale/installation-configuration/#configuring-the-provider

[xt-pulumi-tailscale]: https://www.pulumi.com/registry/packages/tailscale

[xt-pulumi]: https://www.pulumi.com
