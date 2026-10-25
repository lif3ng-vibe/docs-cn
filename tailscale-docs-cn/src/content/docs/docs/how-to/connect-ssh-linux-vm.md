---
title: "SSH 连接 Linux 虚拟机"
description: "使用 Tailscale SSH 安全连接到 Linux 虚拟机。"
---

最后验证于 Dec 8, 2025

本主题详细介绍如何通过 SSH 会话连接到 Tailscale 网络（即 tailnet）中的 Linux 虚拟机。

## 前提条件

* 你需要一个 [Tailscale 账户][docs-install]
* 你需要一台 Linux 虚拟机。以下主题介绍了如何使用常见云服务商搭建 Linux 虚拟机：
  * [在 Azure 上创建 Linux 虚拟机][xt-entra-vm]
  * [在 AWS 上创建 Linux 虚拟机][xt-aws-ec2-get-started]
  * [在 GCP 上创建 Linux 虚拟机][xt-google-linux-vm-create]
* 你需要在该 Linux 虚拟机上[安装 Tailscale][docs-install-linux]
* 你需要在本地机器上[安装 Tailscale][co-download]

## 配置 Tailscale SSH

1. 首先连接到虚拟机，安装 Tailscale。

   > **注意：**
   >
   > 这一步通常使用云服务商自带的 SSH 方式，可能需要**临时**在该虚拟机上向公司网络或互联网开放端口 `22`。

2. 在虚拟机的终端窗口中，运行 [`tailscale set`][docs-tailscale-up] 命令，为该虚拟机启用 SSH：

   ```shell
   tailscale set --ssh
   ```

3. 打开 Tailscale 管理控制台的 [访问控制](https://console.tailscale.com/admin/acls) 页面，在 tailnet 策略文件中添加以下行，以允许到该虚拟机的网络连接：

   ```json
   "grants": [
     {
       "src": ["<your tailscale username>"],
       "dst": ["<your vm's tailscale ip address>"],
       "ip": ["22"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

   你可以在管理控制台的 [机器](https://console.tailscale.com/admin/machines) 页面找到虚拟机的 Tailscale IP 地址，在 [用户](https://console.tailscale.com/admin/users) 页面找到你的 Tailscale 用户名。如果已有访问控制策略，无需替换，只需添加这条新规则。示例如下：

   ```json
   "grants": [
     {
       "src": ["john.doe@domain.com"],
       "dst": ["100.64.65.66"],
       "ip": ["22"]
     }
   ]
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

4. 在同一标签页中，在 tailnet 策略文件的 `ssh` 部分添加以下规则，以允许通过 SSH 访问该虚拟机：

   ```json
   "ssh": [
     { "action": "accept",
       "src": ["your tailscale username"],
       "dst": ["autogroup:self"],
       "users": ["root","autogroup:nonroot", "<your-local-username>"]
     }
   ],
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

5. 如果虚拟机上定义了本地用户名（例如 `local-user`），应将其添加到 `ssh` 部分的 `users` 数组中。如果已有 SSH 策略，无需替换，只需添加这条新规则。示例如下：

   ```json
   "ssh": [
     { "action": "accept",
       "src": ["john.doe@example.com"],
       "dst": ["autogroup:self"],
       "users": ["root","autogroup:nonroot", "local-user"]
     }
   ],
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

## 使用 Tailscale SSH

1. 在本地机器的终端窗口中，通过 SSH 连接到你的虚拟机：

   ```shell
   ssh <your-vm-ip-address>
   ```

2. 如果需要使用本地账户，只需在运行 SSH 命令时把账户名写在 IP 地址前面（`user@IP`）。也可以使用机器的 [MagicDNS][docs-magicdns] 主机名。例如：

   ```shell
   ssh local-user@100.64.65.66
   ```

3. 如果还没关闭，可以关闭云虚拟机上的 SSH 端口，然后重新运行 Tailscale SSH 命令，验证其是否正常工作。

> **注意：**
>
> 强烈建议不要长时间开放 SSH 端口，尤其不要长时间面向互联网开放。如果你为本次测试开放了该端口，测试完成后请务必关闭端口或删除测试虚拟机。

[co-download]: https://tailscale.com/download

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-magicdns]: /docs/features/magicdns

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-entra-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
