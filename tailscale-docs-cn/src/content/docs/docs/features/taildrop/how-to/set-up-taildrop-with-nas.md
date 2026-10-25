---
title: "Taildrop 与 NAS 设备"
description: "Taildrop 让你能在 Tailscale 网络（即 tailnet）上的个人设备之间互传文件。"
---

最后验证于 Jan 5, 2026

> **注意：** Taildrop 目前处于 alpha 阶段。

> **注意：** Taildrop 适用于[所有套餐](https://tailscale.com/pricing)。

Taildrop 让你能在 Tailscale 网络（即 tailnet）上的个人设备之间互传文件。

除网络附加存储（NAS）设备外，Taildrop 无需任何客户端设置，只需[安装 Tailscale][docs-installation] 即可。NAS 设备则需要额外的设置，详见本主题。

## 在 Synology 上设置 Taildrop

如果尚未安装，请先[在你的 Synology 设备上安装 Tailscale][docs-synology-manual-installation-steps]。

要将你的 Synology 设备设置为接收 Taildrop 文件：

1. 在 Synology DSM 网页界面中，前往**主菜单**（Main Menu）> **File Station**。

2. 选择**新建**（Create），然后选择**新建共享文件夹**（Create New Shared Folder）。

3. 在**共享文件夹创建向导**（Shared Folder Creation Wizard）中，将文件夹命名为 `Taildrop`。

4. 按你的需要设置其他选项，继续完成向导，直到创建好 `Taildrop` 共享文件夹。

5. 在 **File Station** 中，右键点击 `Taildrop` 文件夹并选择**属性**（Properties）。

6. 选择**权限**（Permission）。

7. 选择 **tailscale** 系统用户，然后选择**编辑**（Edit）。注意，**tailscale** 系统用户显示的名称就是 **tailscale**，它不是你 tailnet 中某个用户的名称。

8. 授予 **tailscale** 读写权限。

   *（图：授予读写权限）*

9. 选择**完成**（Done），然后选择**保存**（Save）。

10. 完成上述步骤后，在你的 Synology 设备上重启 Tailscale。

现在，你的 Synology 设备应该可以接收 Taildrop 文件了。

## 在 QNAP 上设置 Taildrop

如果尚未安装，请先[在你的 QNAP 设备上安装 Tailscale][docs-qnap-installation-steps]。

要将你的 QNAP 设备设置为接收 Taildrop 文件：

1. 打开 QNAP File Station。

2. 选择**新建文件夹**（New Folder）图标，然后选择**共享文件夹**（Shared Folder）。

3. 在**文件夹名称**（Folder Name）字段中输入文件夹名称 `Taildrop`。

   *（图：创建共享的 Taildrop 文件夹）*

4. 保存更改。

现在，你的 QNAP 设备应该可以接收 Taildrop 文件了。

## 用 NAS 设备接收文件

当 tailnet 中的设备向你的 NAS 设备发送文件时，这些文件会自动添加到 `Taildrop` 文件夹中。

[docs-installation]: /docs/install

[docs-qnap-installation-steps]: /docs/integrations/qnap#安装步骤

[docs-synology-manual-installation-steps]: /docs/integrations/synology#在-dsm-上手动安装-tailscale
