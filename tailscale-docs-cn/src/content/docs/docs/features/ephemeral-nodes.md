---
title: "临时节点"
description: "在 Tailscale 中使用临时节点（ephemeral node）管理容器、CI/CD 系统等短生命周期设备。"
---

最后验证于 Dec 4, 2025

> **提示：**
>
> 临时节点的使用在月度限额（按分钟计）内免费，限额因[定价套餐][co-pricing]而异。
>
> 如果临时节点在 tailnet 中存在四小时或更久，它将不再计入你的临时节点分钟额度，而是改按标准[带标签设备][docs-tailnet-policy-tags]计。

临时节点让容器、云函数或频繁启停的 CI/CD 系统等短生命周期设备的连接与清理变得更简单。

默认情况下，当你向 Tailscale 网络添加新设备时，它会出现在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面以及 Tailscale 客户端应用中。然而，短生命周期设备会让你的网络难以梳理，因为设备在被移除之前会一直留在管理控制台中。

临时节点与常规节点有几处不同：

* 它们在短暂的不活跃期之后会被自动移出你的网络。下次创建该临时节点时，它会获得一个新的 IP 地址。
* 如果你运行 [`tailscale logout`][docs-cli-logout]，它们会立即从你的网络中移除。
* 它们只能通过[临时认证密钥][docs-auth-keys]（ephemeral auth key）创建（不能通过常规认证流程），或者通过带 `state=mem:` 标志运行 `tailscaled` 守护进程创建。

为避免临时设备加入 Tailscale 网络时更新[每台设备的 netmap][docs-device-visibility-see-devices]，考虑使用临时[带标签认证密钥][docs-tags-auth-key-tag]，并更新[访问控制策略][docs-access-control]来限制带标签设备可访问的内容。如果你要部署同一容器的多个实例，请使用[可复用认证密钥][docs-auth-keys]，而不要把 Tailscale 节点密钥烘焙进容器镜像，以避免出现[重复设备][docs-troubleshooting-same-ip-address]。

在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，看到设备名称下方有 "Ephemeral" 徽标即可识别临时节点。

## 认证临时节点

### 第 1 步：生成临时认证密钥

要创建临时节点，你首先需要在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面生成一个临时认证密钥。

*（图：管理控制台的 Settings 页面与"Generate auth key"对话框，ephemeral key 开关已打开。）*

> **注意：**
>
> **认证密钥请务必妥善保管！**这些密钥一旦失窃可能造成严重危害。
> 最好将它们保存在专门为此设计的密钥保管库（key vault）产品中。

> **注意：**

### 第 2 步：配置基础设施使用该密钥

最简单的方法是更新你常用的脚本，改用新的认证密钥：

```shell
sudo tailscale up --auth-key=<your ephemeral key>
```

具体步骤因平台而异。请参阅我们针对常见平台的设置指南：

* [Heroku 上的 Tailscale][docs-tailscale-on-heroku]
* [Google Cloud Run 上的 Tailscale][docs-tailscale-on-gcr]
* [GitHub Actions 上的 Tailscale][bl-gh-actions-and-tailscale]
* [AWS Lambda 上的 Tailscale][docs-tailscale-on-aws-lambda]
* [Kubernetes 上的 Tailscale][docs-kubernetes]

### 第 3 步：触发构建

下次你的基础设施启动新设备时，它会作为临时节点出现在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中。它将能够连接到你的网络，并在下线后不久被自动移除。

### 常见问题

#### 临时设备能将自己从 tailnet 中移除吗？

可以。在临时设备上运行 [`tailscale logout`][docs-cli-logout] 命令即可将其立即从你的 tailnet
中移除。例如，你可以在临时节点部署脚本的最后一步加上 `tailscale logout`，在脚本完成时立即将其从 tailnet
中移除。

另一种方式是：如果你是通过带 `--state=mem:` 标志运行 `tailscaled` 创建的临时设备，且设备运行的是 Tailscale v1.30
或更高版本，那么当设备退出时，`tailscaled` 守护进程自身会执行 `tailscale logout`，立即将设备从你的 tailnet 中移除。

#### 临时设备多久后会被自动移除？

临时设备通常在最后一次活动后 30 到 60 分钟内被自动移除。这一时间范围可能会随着我们进一步了解什么最适合 Tailscale 用户而调整。如果你想立即移除某台临时设备，请按前述方法运行 [`tailscale logout`][docs-cli-logout]。

#### 能在没有认证密钥的情况下创建临时节点吗？

可以，需要运行 Tailscale v1.22 或更高版本。你可以带 `--state=mem:` 标志运行 `tailscaled`。`tailscaled` 是
Tailscale 守护进程，运行在已安装 Tailscale 客户端的设备上。`--state=mem:` 标志会将节点注册为临时节点，使守护进程把状态保存在内存中，而不是写入磁盘。

[bl-gh-actions-and-tailscale]: https://tailscale.com/blog/2021-05-github-actions-and-tailscale

[co-pricing]: https://tailscale.com/pricing

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-device-visibility-see-devices]: /docs/concepts/device-visibility

[docs-kubernetes]: /docs/kubernetes

[docs-tags-auth-key-tag]: /docs/features/tags#best-practices

[docs-tailnet-policy-tags]: /docs/reference/syntax/policy-file#tags

[docs-tailscale-on-aws-lambda]: /docs/install/cloud/aws/aws-lambda

[docs-tailscale-on-gcr]: /docs/install/cloud/cloudrun

[docs-tailscale-on-heroku]: /docs/install/cloud/heroku

[docs-troubleshooting-same-ip-address]: /docs/reference/troubleshooting/network-configuration/multiple-devices-same-100-x-ip-address
