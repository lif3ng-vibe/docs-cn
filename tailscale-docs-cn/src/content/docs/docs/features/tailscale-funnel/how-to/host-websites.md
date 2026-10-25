---
title: "使用 tailnet 设备托管网站"
description: "本主题详细介绍如何使用 [Tailscale Serve][docs-serve]，从一台 Tailscale 设备提供只有 Tailscale 网络（即 tailnet）中其他用户才能访问的网站。你也可以按照下面的说明，使用 [Tailscale Funnel][docs-funnel] 托管一个对公共互联网开放的网站。"
---

最后验证于 Jan 5, 2026

本主题详细介绍如何使用 [Tailscale Serve][docs-serve]，从一台 Tailscale 设备提供只有 Tailscale 网络（即 tailnet）中其他用户才能访问的网站。你也可以按照下面的说明，使用 [Tailscale Funnel][docs-funnel] 托管一个对公共互联网开放的网站。

## 前提条件

* 你需要一个 [Tailscale 账户][docs-install]。
* 你需要[在本地计算机上安装 Tailscale][co-download]。

> **注意：**
>
> 我们建议使用 Linux 虚拟机（VM）来提供你的文件和网站。你也可以在 macOS 上尝试，但由于该操作系统的沙箱特性，可能会遇到错误。

以下是创建各类云端 Linux 虚拟机并在其上设置 Tailscale 的指南：

* [在 Azure 上创建 Linux 虚拟机][xt-entra-vm]
* [在 AWS 上创建 Linux 虚拟机][xt-aws-ec2-get-started]
* [在 GCP 上创建 Linux 虚拟机][xt-google-linux-vm-create]

创建 Linux 虚拟机后，你还需要[在该虚拟机上安装 Tailscale][docs-install-linux]。

## 提供你的文件和网站

1. 首先在你的本地计算机上创建一个名为 `index.html` 的文件用于测试。以下是可以在该文件中使用的 HTML 代码示例：

   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <title>Test Website</title>
       </head>
       <body>
           <h1>This is a heading</h1>
           <p>This is a paragraph</p>
       </body>
   </html>
   ```

2. 在本地计算机上创建一个 `/tmp` 目录及其下的一个子目录：

   ```shell
   mkdir /tmp
   mkdir /tmp/test-funnel
   ```

3. 将你创建的 `index.html` 文件移动到上一步创建的 `/tmp/test-funnel` 子目录中。在本示例中，该文件当前位于 `/home/amelie`：

   ```shell
   mv /home/amelie/index.html /tmp/test-funnel
   ```

4. 在你的计算机上运行以下命令，将 `index.html` 文件提供给你的 tailnet：

   ```shell
   tailscale serve /tmp/test-funnel/index.html
   ```

   或者，如果你想让同样的文件和网站在公共互联网上可见，请使用以下命令：

   ```shell
   tailscale funnel /tmp/test-funnel/index.html
   ```

## 共享你的网站

现在你可以将 tailnet 机器名与 tailnet 名称组合起来，分享网站 URL。机器名可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面找到，tailnet DNS 名称可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到。

如果你的 tailnet 机器名是 `amelie-vm`，tailnet DNS 名称是 `pango-lin.ts.net`，那么分享的 URL 为：

`https://amelie-vm.pango-lin.ts.net`

[co-download]: https://tailscale.com/download

[docs-funnel]: /docs/features/tailscale-funnel

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-serve]: /docs/features/tailscale-serve

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-entra-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
