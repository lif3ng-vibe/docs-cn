---
title: "安全的节点状态存储"
description: "对 Tailscale 节点状态进行静态加密。"
---

最后验证于 Jan 12, 2026

Tailscale 节点状态包含[节点密钥][docs-node-keys]（node key）以及其他敏感数据，用于向你的 Tailscale 网络（即 [tailnet][docs-tailnet]）标识设备，并对发往 tailnet 中其他设备的流量进行加解密。本文介绍如何配置 Tailscale 对节点状态进行加密。

> **注意：** 安全的节点状态存储[对所有套餐](https://tailscale.com/pricing)可用。

## 为什么重要

安全的节点状态存储有助于防范恶意行为者把节点状态从一台设备复制到另一台，从而有效克隆节点。借助[各平台特有的][ar-platform-support]能力，Tailscale 确保节点状态静态加密，让从磁盘窃取状态和克隆节点变得更加困难。

## 平台支持

安全的节点状态存储的具体实现因平台和 Tailscale 客户端版本而异。

| **平台**                                        | **实现方式**                                                        | **版本支持**                                   |
| ----------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Android                                         | [EncryptedSharedPreferences][xt-android-encryptedsharedpreferences] | 所有版本                                       |
| Linux                                           | [可信平台模块（TPM）][xt-trusted-platform-module]                   | Tailscale [v1.86][co-changelog-1.86] 及更高    |
| 来自 Mac App Store 的 macOS/iOS/tvOS            | [Keychain][xt-apple-keychain]                                       | 所有版本                                       |
| [macOS 独立版][docs-mac-variant-standalone]     | [Keychain][xt-apple-keychain]                                       | Tailscale [v1.86][co-changelog-1.86] 及更高    |
| Windows                                         | TPM                                                                 | Tailscale [v1.86][co-changelog-1.86] 及更高    |

## 前提条件

* 请参阅[平台支持][ar-platform-support]，了解你的客户端平台所需的最低 Tailscale 版本。
* 在 Linux 和 Windows 上，你的设备必须有一个可正常工作的 TPM 2.0 设备。

## 配置安全的节点状态存储

节点状态存储的配置因平台和版本而异：

* Tailscale 1.90.2 至 1.92.4：在所有受支持平台上，节点状态存储加密默认启用。
* Tailscale 1.92.5 或更高：在 Windows 和 Linux 上，节点状态存储加密为可选启用；在所有其他受支持平台上默认启用。

### Android

安全的节点状态存储默认加密，无需额外配置。

### Linux

向 `tailscaled` 传入 [`--encrypt-state`][docs-tailscaled-flags] 旗标来配置安全的节点状态存储，然后[重启 `tailscaled`][docs-tailscaled-stop-and-start] 使更改生效。

### macOS/iOS/tvOS（来自 Mac App Store）

安全的节点状态存储默认加密，无需额外配置。

### macOS 独立版

通过设置 [`EncryptState`][docs-mdm-key-encrypt-state] 系统策略来配置安全的节点状态存储，然后[重启 `tailscaled`][docs-tailscaled-stop-and-start] 使更改生效。有关在 macOS 上如何配置，请参阅[使用 MDM 在 macOS 上部署 Tailscale][docs-mdm-macos]。

### Windows

通过设置 [`EncryptState`][docs-mdm-key-encrypt-state] 系统策略来配置安全的节点状态存储，然后[重启 `tailscaled`][docs-tailscaled-stop-and-start] 使更改生效。有关在 Windows 上如何配置，请参阅[使用 MDM 在 Windows 上部署 Tailscale][docs-mdm-windows]。

## 禁用安全的节点状态存储

在受支持的平台上，禁用安全的节点状态存储会把已加密的状态迁移回先前的明文格式。

## 设备态势属性

设备有一个 `node:tsStateEncrypted` [设备态势属性][docs-device-posture-attributes]（device posture attribute），指示 Tailscale 节点状态是否已加密。

## 从 TPM 故障中恢复

在 [Linux 和 Windows][bl-encrypting-data-windowslinux] 上，Tailscale 客户端使用 TPM 设备加密节点状态文件。要读取或修改状态文件，Tailscale 必须用同一个 TPM 设备进行解密。

在某些少见的情况下，TPM 设备可能被重置或完全消失，通常由固件更新失败或硬件故障导致。发生这种情况时，Tailscale 无法解密状态文件，导致客户端无法启动。

你可以在[客户端日志][docs-client-logs]中查找包含 `failed to unseal state file` 的错误，来确认这就是 Tailscale 无法运行的原因。

如果你无法查明 TPM 设备异常的原因并加以修复，剩下的唯一办法就是重置节点状态并重新注册。

1. 在管理控制台中[移除旧设备][docs-remove-device]。

2. 删除节点状态文件。

   #### Windows

   删除以下目录：

   ```powershell
   C:\ProgramData\Tailscale
   C:\Users\%USERNAME%\AppData\Local\Tailscale
   ```

   #### Linux

   删除状态文件（需要 `sudo`）：

   ```shell
   /var/lib/tailscale/tailscaled.state
   ```

3. 按常规登录流程重新注册该节点。

## 限制

* 如果在没有 TPM 2.0 支持的 Linux 或 Windows 设备上启用安全的节点状态存储，Tailscale 将无法启动。
* 启用安全的节点状态存储只能通过系统策略或 CLI 旗标完成，无法通过图形设置界面完成。

[ar-platform-support]: #平台支持

[bl-encrypting-data-windowslinux]: https://tailscale.com/blog/encrypting-data-at-rest#windowslinux

[co-changelog-1.86]: https://tailscale.com/changelog#2025-07-24

[docs-client-logs]: /docs/features/logging#客户端日志

[docs-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes#device-posture-attributes

[docs-mac-variant-standalone]: /docs/concepts/macos-variants#standalone-变体

[docs-mdm-key-encrypt-state]: /docs/features/tailscale-system-policies#加密节点状态文件

[docs-mdm-macos]: /docs/integrations/mdm/mac

[docs-mdm-windows]: /docs/integrations/mdm/windows-mdm

[docs-node-keys]: /docs/concepts/node-keys

[docs-remove-device]: /docs/features/access-control/device-management/how-to/remove

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscaled-flags]: /docs/reference/tailscaled#tailscaled-的标志

[docs-tailscaled-stop-and-start]: /docs/reference/tailscaled#stopping-and-starting-tailscaled

[xt-android-encryptedsharedpreferences]: https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences

[xt-apple-keychain]: https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac

[xt-trusted-platform-module]: https://en.wikipedia.org/wiki/Trusted_Platform_Module
