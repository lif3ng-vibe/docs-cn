---
title: "使用 cloud-init 安装 Tailscale"
description: "使用 cloud-init 在机器首次启动时自动安装 Tailscale。"
---

最后验证于 Jan 5, 2026

Cloud-init 是一种用于初始化新服务器镜像的标准机制，通常与云服务商配合使用。该项目由 Canonical 发起，如今已获得[多种操作系统和大多数主流 Linux 发行版][xt-cloudinit-distros]的支持，并可在[几乎所有公共云服务商][xt-cloudinit-datasources-supported]上使用。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[如何使用 cloud-init 与 Tailscale（第 1 部分）| 用基础设施即代码自动化你的云！(视频)](https://www.youtube.com/watch?v=e-X5FJwrkaA)

本文只涉及 cloud-init 功能的一部分。具体来说，它提供了一个模板，让新机器在首次启动时通过"cloud-config"文件自动加入 tailnet。这类文件用于 cloud-init 流程的 user data（用户数据）部分。如何提供该文件的具体方式因云服务商而异；我们在[厂商专属文档][ar-vendor-specific-cloud-init-documentation]一节提供了一些链接。

由于 cloud-init 与主要云基础设施提供商关系密切，它通常与需要自动化创建大量机器的使用场景联系在一起。事实上，对于要批量创建许多节点、并希望它们无需手动配置即可各自加入 tailnet 的用户，本文正好能帮上忙。

对于只创建少量节点、并希望机器一可用就能通过 Tailscale 与其交互的用户，这套 cloud-init 配置同样有帮助。例如，用户可能在公共 VPS 上创建一台机器，用作出口节点或通过 tailnet 提供的服务。使用 cloud-init 可以让机器立即通过 Tailscale 可达，而不必先设置 SSH 并登录进行初始配置。

> **注意：**
>
> 我们开发了一个名为 [Tailgraft][xt-gh-tailscale-tailgraft] 的工具，用于在树莓派机器上自动化使用云配置文件。更多信息请参阅[发布该工具的博客文章][xt-tailgraft]。

Tailscale 的所有安装与配置都放在名为 `runcmd` 的块中，该块指定在首次启动过程接近尾声时运行的命令。如果你已有 cloud-config 文件，可以把这个块追加到文件末尾；它也可以直接作为整个文件使用。

如模板所示，这种用法需要[认证密钥][docs-auth-keys]（auth key）。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面生成认证密钥，或通过已认证的 [get-authkey 工具][docs-oauth-clients-get-authkey-utility]实例生成。

## cloud-config 示例模板

```
#cloud-config
# 上面这行头部通常必须出现在 cloud-config 文件的第一行，
# 但其他以 # 开头的行都是可选注释。

runcmd:
  # 一条命令完成安装，来自 https://tailscale.com/download/
  - ['sh', '-c', 'curl -fsSL https://tailscale.com/install.sh | sh']
  # 设置 IP 转发的 sysctl 配置（配置出口节点时有用）
  - ['sh', '-c', "echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf && echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf && sudo sysctl -p /etc/sysctl.d/99-tailscale.conf" ]
  # 在管理控制台生成认证密钥
  # https://console.tailscale.com/admin/settings/keys
  # 并替换下面的占位符
  - ['tailscale', 'up', '--auth-key=tskey-abcdef1432341818']
  # （可选）加入这一行，让该节点可通过 Tailscale SSH 访问
  - ['tailscale', 'set', '--ssh']
  # （可选）加入这一行，把该机器配置为出口节点
  - ['tailscale', 'set', '--advertise-exit-node']
```

## 厂商专属 cloud-init 文档

以下厂商列表并不详尽；如果这里没有你偏好的云服务商，请在它的文档中搜索"cloud-init"，了解如何录入你的 cloud-config 数据。这里的摘要只是起点，更多信息请查看下面的各个链接。

* [Amazon EC2][xt-aws-ec2-pass-user-data]\
  在 Web 控制台启动新实例时，在 **Advanced details**（高级详情）下方的 **User data** 字段中填入 cloud-config 信息；或者通过 `aws` 命令行工具的 `--user-data` 标志提供文件路径。
* [Google Cloud][xt-google-create-instance]\
  使用 `gcloud` 命令行工具的 `--metadata-from-file` 标志和 `user-data` 字段指定 cloud-config 文件路径。
* [Microsoft Azure][xt-entra-cloud-init]\
  将 cloud-config 文件路径作为 `az` 命令行工具 `--custom-data` 标志的参数指定。
* [Digital Ocean][xt-digital-ocean-provide-user-data]\
  在 Droplet 创建页面的 Web 控制台中打开 **Advanced Options**，选择 **Add Initialization scripts** 后填入 cloud-config 信息；或者为 `doctl` 命令行工具的 `--user-data` 或 `--user-data-file` 标志指定路径。
* [Vultr][xt-vultr-deploy-cloudinit-userdata]\
  在部署页面的 **Additional Features** 部分勾选 **Enable Cloud-Init User-Data** 复选框来添加 cloud-config 数据；或者将数据本身作为 `vultr-cli` 命令行工具 `--userdata` 字段的参数提供。
* [Linode][xt-linode-add-user-data]\
  在 **Create Linode** 工具的 **Add User Data** 部分提供 cloud-config 数据；或者将 base64 编码后的 cloud-config 数据作为 `linode-cli` 命令行工具 `--metadata.user_data` 标志的参数提供。
* [Oracle Cloud][xt-oracle-custom-scripts]\
  在 Web 控制台的 **Custom Create** 流程中，于 **Advanced Options** 部分选择 **Initialization Script** 来提供 cloud-config 数据或文件；或者将 base64 编码后的 cloud-config 数据以 `user-data` 键的取值形式提供给 `oci` 命令行工具的 `--node-metadata` 标志

- [Hetzner][xt-hetzner-cloud-config]\
  在 **Cloud Console** 创建流程的 **Cloud config** 文本框中提供 cloud-config 数据。

[ar-vendor-specific-cloud-init-documentation]: #厂商专属-cloud-init-文档

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-oauth-clients-get-authkey-utility]: /docs/features/oauth-clients#get-authkey-工具

[xt-aws-ec2-pass-user-data]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

[xt-cloudinit-datasources-supported]: https://docs.cloud-init.io/en/latest/reference/datasources.html#datasources-supported

[xt-cloudinit-distros]: https://docs.cloudinit.io/en/latest/reference/availability.html

[xt-digital-ocean-provide-user-data]: https://docs.digitalocean.com/products/droplets/how-to/provide-user-data/#providing-user-data

[xt-entra-cloud-init]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/using-cloud-init

[xt-gh-tailscale-tailgraft]: https://github.com/tailscale-dev/tailgraft

[xt-google-create-instance]: https://cloud.google.com/container-optimized-os/docs/how-to/create-configure-instance

[xt-hetzner-cloud-config]: https://community.hetzner.com/tutorials/basic-cloud-config

[xt-linode-add-user-data]: https://techdocs.akamai.com/cloud-computing/docs/add-user-data-when-deploying-a-compute-instance

[xt-oracle-custom-scripts]: https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengusingcustomcloudinitscripts.htm

[xt-tailgraft]: https://tailscale.dev/blog/tailgraft

[xt-vultr-deploy-cloudinit-userdata]: https://www.vultr.com/docs/how-to-deploy-a-vultr-server-with-cloudinit-userdata
