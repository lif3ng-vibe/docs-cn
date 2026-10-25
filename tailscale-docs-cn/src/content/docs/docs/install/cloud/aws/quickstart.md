---
title: "在 AWS 虚拟机上安装 Tailscale"
description: "你可以在 AWS EC2 虚拟机上安装 Tailscale 客户端，将其连接到你的 Tailscale 网络（即 tailnet），并配置子网路由器、出口节点、应用连接器等常用功能。"
---

最后验证于 Jan 12, 2026

你可以在 AWS EC2 虚拟机上安装 Tailscale 客户端，将其连接到你的 Tailscale 网络（即 tailnet），并配置子网路由器、出口节点、应用连接器等常用功能。

## 手动安装

1. （可选）打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面，选择**生成认证密钥**（Generate auth key）来创建[认证密钥][docs-auth-keys]。这样你可以自动将虚拟机加入 tailnet，而无需使用你的凭证手动认证。

2. 通过 SSH 连入你的 EC2 虚拟机。

3. 使用以下命令[安装 Tailscale][docs-install-linux]：

   ```shell
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

4. 使用以下任一命令启动 Tailscale 客户端：
   * 如果想使用认证密钥，请使用命令 `sudo tailscale up --auth-key=foo`，其中 `foo` 是你在第一步生成的认证密钥字符串。
   * 如果不想使用认证密钥，请使用命令 `sudo tailscale up`，将给出的 URL 复制粘贴到网页浏览器中，然后使用你的凭证认证到 tailnet。

5. 在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中，确认虚拟机已连接到 tailnet。如果你添加的虚拟机是一台服务器，可以考虑[禁用密钥过期][docs-key-expiry]，以免需要定期重新认证。

## 自动安装

你可以使用我们的 AWS 安装向导，通过 [AWS CloudFormation][xt-aws-cloudformation] 模板在 AWS 虚拟机上部署 Tailscale。为此，你需要有一个能访问 AWS CloudFormation 控制台的账户，并拥有创建新堆栈的权限。你可以用它启动用户自有节点（user-owned node）或带标签的节点（tagged node）。对于共享基础设施，我们建议使用带标签的节点。更多信息请参阅[用标签为设备分组][docs-tags]。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。在**向网络添加设备**（Add devices to your network）部分，选择**添加 AWS 虚拟机**（Add AWS VM）。
   1. （推荐）要将此节点设为带标签的节点，请打开 **Tags** 开关，选择**添加标签**（Add tags），然后选择要为该 AWS 虚拟机使用的标签。
   2. （可选）如果你希望该 AWS 虚拟机离线后从 tailnet 中移除，请打开 **Ephemeral** 开关。
   3. （可选）如果你想让 tailnet 流量经由该 AWS 虚拟机转发，请打开**用作出口节点**（Use as exit node）开关。更多信息请参阅[宣告出口节点][docs-quick-guide-exit-node-advertise]。
   4. 选择**继续前往 AWS**（Continue to AWS）。你会被重定向到 AWS CloudFormation 控制台。如果你已完成认证，将显示**快速创建堆栈**（Quick create stack）页面。
2. 在 CloudFormation 控制台中：
   1. 在 **Stack name** 字段中输入一个名称，作为对你所创建堆栈的描述。
   2. （可选）在 **ExtraArgs** 字段中指定所需功能，例如 [Tailscale SSH][docs-quick-guide-ssh-linux-vm]（`--ssh`）和[子网路由器][docs-quick-guide-subnets]（`--advertise-routes=192.0.1.0/24`）（如适用）。每个功能之间用空格分隔。
   3. （可选）在 **Hostname** 字段中为虚拟机输入一个名称，该名称将显示在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中。
   4. （可选）在 **ImageId** 字段中，如果想为虚拟机使用其他镜像 ID，可以修改。有关镜像 ID 的更多信息，请参阅[查找符合 EC2 实例要求的 AMI][xt-aws-ami]。
   5. （可选）在 **InstanceType** 字段中，如果想使用其他 Amazon EC2 实例类型，可以修改虚拟机大小。
   6. （可选）在 **VpcId** 字段中，如果希望虚拟机预置在特定的 VPC 中，请输入 Amazon Virtual Private Cloud（VPC）和子网 ID。
   7. 选择**创建堆栈**（Create stack）开始预置。
3. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认虚拟机已添加。预置的虚拟机可能需要最多 5 分钟才能加入你的 tailnet。

## 后续步骤

如果尚未配置，你可以为你的 AWS 虚拟机添加以下 tailnet 功能。

* 使用 Tailscale SSH [通过 SSH 连接你的虚拟机][docs-quick-guide-ssh-linux-vm]。
* [宣告出口节点][docs-quick-guide-exit-node-advertise]，转发你 tailnet 中的流量。
* [使用 tailnet 中现有的出口节点][docs-quick-guide-exit-node-use]。
* [配置子网路由器][docs-quick-guide-subnets]，为网络中的访问提供中继，包括无法安装 Tailscale 的资源。
* [配置应用连接器][docs-app-connectors]，将 tailnet 中的应用特定流量经由选定的设备（充当应用连接器）转发。

[docs-app-connectors]: /docs/features/app-connectors

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-install-linux]: /docs/install/linux

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-quick-guide-exit-node-advertise]: /docs/features/exit-nodes/how-to/setup?tab=linux#advertise-a-device-as-an-exit-node

[docs-quick-guide-exit-node-use]: /docs/features/exit-nodes/how-to/setup?tab=linux#use-an-exit-node

[docs-quick-guide-ssh-linux-vm]: /docs/how-to/connect-ssh-linux-vm

[docs-quick-guide-subnets]: /docs/features/subnet-routers/how-to/setup?tab=linux

[docs-tags]: /docs/features/tags

[xt-aws-ami]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html

[xt-aws-cloudformation]: https://aws.amazon.com/pm/cloudformation
