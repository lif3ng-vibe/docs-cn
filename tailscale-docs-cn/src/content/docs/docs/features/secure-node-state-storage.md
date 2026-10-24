---
title: "Secure node state storage"
description: "Encrypt Tailscale node state at rest."
---

Last validated Jan 12, 2026

Tailscale node state contains [node keys][docs-node-keys] and other sensitive data necessary for identifying the device to your Tailscale network (known as a [tailnet][docs-tailnet]) and for encrypting and decrypting traffic to other devices in the tailnet. This document covers how to configure Tailscale to encrypt the node state.

> **Note:** Secure node state storage is available for [all plans](https://tailscale.com/pricing).

## Why it matters

Secure node state storage can help protect against a malicious actor copying node state from one device to another, effectively cloning the node. By using [platform-specific][ar-platform-support] capabilities, Tailscale ensures node state encrypts at rest, making theft from disk and node cloning more difficult.

## Platform support

Secure node state storage implementations vary by platform and Tailscale client version.

| **Platform**                                    | **Implementation**                                                  | **Version support**                            |
| ----------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Android                                         | [EncryptedSharedPreferences][xt-android-encryptedsharedpreferences] | All versions                                   |
| Linux                                           | [Trusted Platform Module (TPM)][xt-trusted-platform-module]         | Tailscale [v1.86][co-changelog-1.86] and later |
| macOS/iOS/tvOS from Mac App Store               | [Keychain][xt-apple-keychain]                                       | All versions                                   |
| [macOS standalone][docs-mac-variant-standalone] | [Keychain][xt-apple-keychain]                                       | Tailscale [v1.86][co-changelog-1.86] and later |
| Windows                                         | TPM                                                                 | Tailscale [v1.86][co-changelog-1.86] and later |

## Prerequisites

* Refer to [platform support][ar-platform-support] for the minimum required Tailscale version for your client platforms.
* On Linux and Windows, your device must have a functioning TPM 2.0 device.

## Configure secure node state storage

Configuration of node state storage differs by platform and version:

* Tailscale 1.90.2 to 1.92.4: node state storage encryption is enabled by default on all supported platforms.
* Tailscale 1.92.5 or later: node state storage encryption is opt-in on Windows and Linux, and enabled by default on all other supported platforms.

### Android

Secure node state storage encrypts by default and does not require extra configuration.

### Linux

Configure secure node state storage by passing the [`--encrypt-state`][docs-tailscaled-flags] flag to `tailscaled`. Apply the changes by [restarting `tailscaled`][docs-tailscaled-stop-and-start].

### macOS/iOS/tvOS (from Mac App Store)

Secure node state storage encrypts by default and does not require extra configuration.

### macOS standalone

Configure secure node state storage by setting the [`EncryptState`][docs-mdm-key-encrypt-state] system policy. Apply the changes by [restarting `tailscaled`][docs-tailscaled-stop-and-start]. Refer to [Deploy Tailscale on macOS using MDM][docs-mdm-macos] for how to configure this on macOS.

### Windows

Configure secure node state storage by setting the [`EncryptState`][docs-mdm-key-encrypt-state] system policy. Apply the changes by [restarting `tailscaled`][docs-tailscaled-stop-and-start]. Refer to [Deploy Tailscale on Windows using MDM][docs-mdm-windows] for how to configure this on Windows.

## Disabling secure node state storage

On supported platforms, disabling secure node state storage will migrate encrypted state to the prior plaintext format.

## Device posture attribute

Devices have a `node:tsStateEncrypted` [device posture attribute][docs-device-posture-attributes] indicating whether the Tailscale node state encrypts.

## Recover from TPM failures

On [Linux and Windows][bl-encrypting-data-windowslinux], the Tailscale client
encrypts the node state file with a TPM device. To read or modify the state
file, Tailscale has to decrypt it with the exact same TPM device.

In some uncommon situations the TPM device can get reset or disappear entirely,
usually due to a bad firmware update or hardware failure. When this happens,
Tailscale is unable to decrypt the state file, which causes the client to fail
to start.

You can verify that this is the reason for Tailscale not running by looking for
errors containing `failed to unseal state file` in the [client
logs][docs-client-logs].

If you are unable to determine why the TPM device is misbehaving and fix it, the
only remaining solution is to reset the node state and register it again.

1. [Remove the old device][docs-remove-device] from the admin console.

2. Remove the node state files.

   #### Windows

   Remove the following directories:

   ```powershell
   C:\ProgramData\Tailscale
   C:\Users\%USERNAME%\AppData\Local\Tailscale
   ```

   #### Linux

   Remove the state file (requires `sudo`):

   ```shell
   /var/lib/tailscale/tailscaled.state
   ```

3. Follow the usual login flow to register the node again.

## Limitations

* If secure node state storage is enabled on a Linux or Windows
  device without TPM 2.0 support, Tailscale will fail to start.
* Enabling secure node state storage can only be done using system policies or CLI flags, not through the graphical settings screen.

[ar-platform-support]: #platform-support

[bl-encrypting-data-windowslinux]: https://tailscale.com/blog/encrypting-data-at-rest#windowslinux

[co-changelog-1.86]: https://tailscale.com/changelog#2025-07-24

[docs-client-logs]: /docs/features/logging#client-logs

[docs-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes#device-posture-attributes

[docs-mac-variant-standalone]: /docs/concepts/macos-variants#standalone-variant

[docs-mdm-key-encrypt-state]: /docs/features/tailscale-system-policies#encrypt-node-state-file

[docs-mdm-macos]: /docs/integrations/mdm/mac

[docs-mdm-windows]: /docs/integrations/mdm/windows-mdm

[docs-node-keys]: /docs/concepts/node-keys

[docs-remove-device]: /docs/features/access-control/device-management/how-to/remove

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscaled-flags]: /docs/reference/tailscaled#flags-to-tailscaled

[docs-tailscaled-stop-and-start]: /docs/reference/tailscaled#stopping-and-starting-tailscaled

[xt-android-encryptedsharedpreferences]: https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences

[xt-apple-keychain]: https://support.apple.com/guide/keychain-access/what-is-keychain-access-kyca1083/mac

[xt-trusted-platform-module]: https://en.wikipedia.org/wiki/Trusted_Platform_Module
