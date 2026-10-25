---
title: "随时随地访问 Unraid NAS"
description: "在 Unraid NAS 服务器上配置 Tailscale 客户端。"
---

最后验证于 Jan 5, 2026

[Unraid][xt-unraid] 是一个基于 Linux 的网络附加存储（NAS）操作系统。从 Unraid v7 开始，Tailscale 获得官方支持。

Unraid 让你可以：

* 将多块容量不一的硬盘汇集成单一阵列或卷。
* 使用丰富多样的远程管理功能。
* 利用内置的 Docker 支持运行众多应用。
* 使用 [libvirt][xt-libvirt] 和 [QEMU][xt-qemu] 等高级虚拟机引擎工具，为高性能游戏虚拟机提供 PCI 直通支持。

更多信息请参阅 Unraid 的 [Tailscale 文档][xt-unraid-tailscale]。

## 环境要求

* 至少一台拥有管理权限的 Unraid 服务器。
* 一个已有的 tailnet。操作说明请参阅 [Tailscale 快速开始][docs-install]。
* 若要在管理控制台执行某些操作，你必须是一个 tailnet 的[所有者、管理员或 IT 管理员](/docs/reference/user-roles)。

## 在 Unraid 中安装 Tailscale

> **注意：**
>
> 我们推荐由 Derek Kaser 代表 Unraid 维护的 Tailscale (Plugin) 插件。

1. 打开 Unraid Web 界面。
2. 选择 **Apps** 菜单。
   1. 如果这是一台全新的 Unraid 服务器，选择 **Install Community Applications** 插件选项。
   2. 搜索 Tailscale 插件。
   3. 选择名为 **Tailscale (Plugin)** 的应用。请务必选择这个插件，忽略其他旧式选项（例如 Docker）。
   4. 选择 **Install**。
   5. 插件安装完成后，在 Unraid Web 界面中选择 **Settings** 菜单。
   6. 进入 **Network Services** 部分，选择 **Tailscale**。
   7. 选择 **Reauthenticate** > **Connect**，将服务器添加到你的 tailnet。界面上可能会提示 Tailscale 密钥将会过期。该提示属正常现象，且可以禁用密钥过期。更多信息请参阅[密钥过期][docs-key-expiry]。
3. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认 Unraid 服务器已添加。

   > **注意：**
   >
   > 如果启用了[设备审批][docs-device-approval]，你可能需要在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面批准该服务器，Unraid 服务器才能与 tailnet 中的其他设备通信。

在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，你可以找到 Unraid 服务器的 tailnet IP 地址（`100.x.y.z`）。在 tailnet 中的另一台设备上，用浏览器通过该地址或 tailnet 主机名（例如 `tower`）即可连接到 Unraid 用户界面。

## 将 Unraid 用作 Tailscale 出口节点

你可以将 Unraid 服务器配置为[出口节点][docs-exit-nodes]，让 tailnet 中其他设备的流量经由 Unraid 服务器路由。当你在咖啡馆使用不可信的 Wi-Fi，或访问要求设备位于特定国家或地区的在线服务（例如网上银行）时，这会很有用。

1. 若要将 Unraid 配置为出口节点，请打开 Unraid Web 界面。
   1. 选择 **Plugins**。
   2. 点击 Tailscale 图标进入 **Tailscale**。
   3. 点击右上角的用户头像/图标，确认你已正确完成 tailnet 身份验证。
      1. 登录后，你可以选择 Unraid 应使用的出口节点，或让 Unraid 成为出口节点。
   4. 若要将 Unraid 配置为 tailnet 的出口节点。
      1. 在 **Exit node** 界面中选择 **Run as Exit Node**。
   5. 若要让 Unraid 使用 tailnet 中其他位置的出口节点。
      1. 在 **Exit node** 界面中选择目标节点的名称。

完成 Unraid 侧的配置后，你还需要在 Tailscale 管理控制台中批准该出口节点请求。

> **提示：**
>
> 你可以[配置 `autoApprovers`][docs-auto-approvers]来自动批准新的出口节点请求。

1. 打开 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
   1. 在列表中找到 Unraid 服务器。若配置正确，它会显示 **Exit Node** 徽标。
   2. 每个出口节点都需要手动批准。要在 Tailscale 管理控制台中把设备批准为出口节点，请选择出口节点旁边的  菜单，然后选择 **Edit exit node**。
   3. 勾选 **Use as exit node** 复选框，然后选择 **Save**。

要让 tailnet 中的其他设备使用 Unraid 服务器作为出口节点，请参阅[使用出口节点][docs-quick-exit-nodes]。

## 将 Unraid 用作 Tailscale 子网路由器

你可以将 Unraid 服务器配置为[子网路由器][docs-subnets]，用来访问物理网络中无法加入 tailnet 的设备或出口节点。例如，你可以远程连接一台打印机。

1. 打开 Unraid Web 界面。
   1. 在主菜单中选择终端图标（**>\_**）。
   2. 输入以下命令：

      ```shell
      tailscale up --advertise-routes=192.0.2.0/24
      ```

      如果想添加多个子网，可以用逗号分隔多个 CIDR IP 范围。

      ```shell
      tailscale up --advertise-routes=192.168.1.0/24,198.160.50.0/24
      ```

2. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到 Unraid 服务器，此时应显示 **Subnets** 徽标。
   1. 选择  菜单，然后选择 **Edit subnet routes**。
   2. 勾选与你想通告的子网路由对应的 IP 范围复选框，然后选择 **Save**。

3. 回到 Unraid Web 界面，打开 Tailscale 应用，确认子网已启用。

## Docker 与 Tailscale 的原生集成

从 Unraid v7 开始，你可以把在 Unraid 服务器上创建的容器自动加入你的 tailnet，让每个容器在 tailnet 中呈现为一台独立设备。一个用例是：与非 tailnet 用户或设备共享某个服务，而无需通过 Tailscale 共享整台 Unraid 服务器。

有关集成的更多信息，请参阅 Unraid 维护的[文档][xt-unraid-tailscale-docker]。

### 让容器自动加入你的 tailnet

你可以使用 Tailscale OAuth client 密钥，以编程方式自动把容器加入你的 tailnet。

1. Tailscale 侧的前提条件：
   1. 在你的 [tailnet 策略文件][docs-tailnet-policy-file]中创建合适的[标签][docs-tags]。
   2. 生成一个拥有[认证密钥][docs-auth-keys]**读取**（Read）与**写入**（Write）权限的 [OAuth client][docs-oauth-client]。
   3. 为你的 tailnet 启用 [HTTPS 证书][docs-https-certs]。
2. 在 Unraid Web 界面中选择要创建的容器。
   1. 在 **Add Container** 菜单中，打开 **Use Tailscale** 开关。

   2. 为容器输入一个合适的 tailnet 主机名。

   3. 选择 **Tailscale Show Advanced Settings**。

   4. 在 **Tailscale Extra Parameters** 字段中输入以下字符串，并确保把其中的值替换为你自己的：

      ```shell
      --authkey=tskey-client-kQ3XbSTPg921CNTRL-teMgW7PkZ2No9xr1CRTt1N7k45u3MnKpZ --advertise-tags=tag:example
      ```

   5. 选择 **Apply**。

   6. 现在，你的服务应可通过 TLS 证书从以下地址访问：

      ```shell
      https://myservice.example.ts.net
      ```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-https-certs]: /docs/how-to/set-up-https-certificates

[docs-install]: /docs/how-to/quickstart

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-oauth-client]: /docs/features/oauth-clients

[docs-quick-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-libvirt]: https://libvirt.org/

[xt-qemu]: https://www.qemu.org/

[xt-unraid-tailscale-docker]: https://docs.unraid.net/go/tailscale-docker/

[xt-unraid-tailscale]: https://docs.unraid.net/go/tailscale/

[xt-unraid]: https://unraid.net/
