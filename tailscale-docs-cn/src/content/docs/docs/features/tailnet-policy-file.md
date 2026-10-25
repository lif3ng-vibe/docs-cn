---
title: "Tailnet 策略文件"
description: "了解 tailnet 策略文件。"
---

最后验证于 May 21, 2025

tailnet 策略文件是一个集中式的 [human JSON（HuJSON）][xt-hujson] 配置文件，用于存储你的 Tailscale 网络（即 tailnet）的参数、策略和设置。[Owner、Admin 和 Network admin](/docs/reference/user-roles) 可以在 Tailscale 管理控制台中管理你的 tailnet 策略文件。你也可以结合 [GitOps][docs-gitops]，使用 GitHub、GitLab 或 Bitbucket 来管理 tailnet 策略文件。

tailnet 策略文件由多个顶层[分区][ar-sections]组成，每个分区提供不同的功能。你可以使用 tailnet 策略文件的各个分区来：

* 使用[标签][docs-tags]、[组][docs-targets-groups]和 [IP 集][docs-ipsets]定义用户、设备和网段的命名分组。
* 使用 [ACL][docs-acls] 在[网络层][docs-osi-l3]定义访问控制策略。
* 使用[授权（grant）][docs-grants]在[网络层][docs-osi-l3]和[应用层][docs-osi-l7]定义访问控制策略。
* 为 IP 地址和[子网][docs-subnets]分配别名（使用 `hosts` 分区）。
* 定义[设备态势][docs-device-posture]规则。
* 指定谁可以使用 [Tailscale SSH][docs-tailscale-ssh]。

- 指定谁可以使用哪些[标签][docs-tags]来认证设备。
- 指定谁可以绕过审批流程来通告[子网路由器][docs-subnets]和[出口节点][docs-exit-nodes]。
- 为设备和用户应用称为[节点属性][docs-nodeattr-syntax]的附加属性。
- 编写测试，对不应改变的访问策略（[ACL][docs-acls] 和 [Tailscale SSH][docs-tailscale-ssh]）做出断言。
- 定义 tailnet 范围的策略选项（例如禁用 IPv4）。

将 tailnet 策略文件的不同分区结合使用，让你能够以模块化、细粒度的方式管理 tailnet。例如，你可以先定义一个自定义用户组，再创建一条访问控制策略，规定该组中的用户可以如何访问你 tailnet 中的资源。

## 分区

下表概述了 tailnet 策略文件的每个顶层分区。

| 分区            | 名称                        | 用途                                                                                                                                                                   | 资源                                            |
| --------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `acls`          | ACL（访问控制列表）         | 创建网络层访问控制策略。                                                                                                                                               | [语法参考 →][docs-acls-syntax]                  |
| `autoApprovers` | 自动审批器                  | 指定谁可以绕过审批流程来通告[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]和[应用连接器][docs-app-connectors]。                                                | [语法参考 →][docs-autoapprovers-syntax]         |
| `grants`        | 授权（grant）               | 定义网络层和应用层的访问控制策略。                                                                                                                                     | [语法参考 →][docs-grants-syntax]                |
| `groups`        | 组                          | 定义用户、设备和子网的命名组，供访问控制策略和其他定义引用。                                                                                                           | [语法参考 →][docs-groups-syntax]                |
| `hosts`         | 主机                        | 为设备和子网定义命名别名。                                                                                                                                             | [语法参考 →][docs-hosts-syntax]                 |
| `ipsets`        | IP 集                       | 定义[命名的网段][docs-ipsets]，供访问控制策略和其他定义引用。                                                                                                          | [语法参考 →][docs-ipsets-syntax]                |
| `nodeAttr`      | 节点属性                    | 为设备和用户应用附加属性。                                                                                                                                             | [语法参考 →][docs-nodeattr-syntax]              |
| `postures`      | 设备态势策略                | 定义[设备态势][docs-device-posture]规则，供访问控制策略引用。                                                                                                          | [语法参考 →][docs-postures-syntax]              |
| `ssh`           | Tailscale SSH               | 指定谁可以使用 [Tailscale SSH][docs-tailscale-ssh]。                                                                                                                   | [语法参考 →][docs-ssh-syntax]                   |
| `sshTests`      | Tailscale SSH 测试          | 编写测试，对不应改变的 [Tailscale SSH][docs-tailscale-ssh] 行为做出断言。                                                                                              | [语法参考 →][docs-ssh-tests-syntax]             |
| `tagOwners`     | 标签所有者                  | 定义谁可以将哪些[标签][docs-tags]分配给你 tailnet 中的设备。                                                                                                           | [语法参考 →][docs-tag-owners-syntax]            |
| `tests`         | 访问控制测试                | 编写测试，对不应改变的访问策略（[ACL][docs-acls] 和网络层[授权][docs-grants]）做出断言。                                                                               | [语法参考 →][docs-acl-tests-syntax]             |

此外还有用于[网络策略选项][docs-network-policy-options]的其他分区，例如禁用 IPv4 和自定义 [DERP][docs-derp-servers] map。在大多数情况下，这些设置并非必需。

| 分区                  | 用途                                                                                              | 资源                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `derpMap`             | 自定义 tailnet 使用的 DERP 服务器。                                                               | [语法参考 →][docs-network-policy-options-derpmap]                     |
| `disableIPv4`         | 在 tailnet 中禁用 IPv4。                                                                          | [语法参考 →][docs-network-policy-options-disableipv4]                 |
| `OneCGNATRoute`       | 修改 Tailscale 客户端生成的路由。                                                                 | [语法参考 →][docs-network-policy-options-onecgnatroute]               |
| `randomizeClientPort` | 控制设备的 WireGuard 流量是优先使用随机端口号还是默认端口 `41641`。                                | [语法参考 →][docs-network-policy-options-randomizeclientport]         |

[ar-sections]: #分区

[docs-acl-tests-syntax]: /docs/reference/syntax/policy-file#测试tests

[docs-acls-syntax]: /docs/reference/syntax/policy-file#acl

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-autoapprovers-syntax]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-gitops]: /docs/gitops

[docs-grants-syntax]: /docs/reference/syntax/policy-file#授权grants

[docs-grants]: /docs/features/access-control/grants

[docs-groups-syntax]: /docs/reference/syntax/policy-file#组

[docs-hosts-syntax]: /docs/reference/syntax/policy-file#主机

[docs-ipsets-syntax]: /docs/reference/syntax/policy-file#ip-集

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-network-policy-options-derpmap]: /docs/reference/syntax/policy-file#derpmap

[docs-network-policy-options-disableipv4]: /docs/reference/syntax/policy-file#disableipv4

[docs-network-policy-options-onecgnatroute]: /docs/reference/syntax/policy-file#onecgnatroute

[docs-network-policy-options-randomizeclientport]: /docs/reference/syntax/policy-file#randomizeclientport

[docs-network-policy-options]: /docs/reference/syntax/policy-file#网络策略选项

[docs-nodeattr-syntax]: /docs/reference/syntax/policy-file#节点属性

[docs-osi-l3]: /docs/concepts/tailscale-osi#网络层

[docs-osi-l7]: /docs/concepts/tailscale-osi#应用层

[docs-postures-syntax]: /docs/reference/syntax/policy-file#设备态势postures

[docs-ssh-syntax]: /docs/reference/syntax/policy-file#ssh

[docs-ssh-tests-syntax]: /docs/reference/syntax/policy-file#ssh-测试

[docs-subnets]: /docs/features/subnet-routers

[docs-tag-owners-syntax]: /docs/reference/syntax/policy-file#标签所有者

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets-groups]: /docs/reference/targets-and-selectors#组

[xt-hujson]: https://github.com/tailscale/hujson
