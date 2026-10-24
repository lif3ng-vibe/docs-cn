---
title: "Install unstable Tailscale clients"
description: "Find out how to test new features before they are released to the wider community."
---

Last validated Jan 7, 2025

Tailscale tests new features and fixes in unstable release clients before releasing updates
to the wider community. If you'd like to help test new features, you can download and install unstable clients
from the links below.

Features can be in various [release stages][docs-release-stages]. Beta features do not necessarily require an unstable release client to test.

> **Note:**
>
> Installing unstable builds are recommended for testing purposes only. While we strive to keep these builds reliable, they are experimental, and some are not signed for distribution.

## Linux

To install an unstable build of the Tailscale client on Linux, use one of the following methods.

#### Packages site

1. Go to the Tailscale Packages site, [unstable][pk-unstable] page.
2. Download the build for your distribution.
3. Follow the instructions for the distribution you are using to install the unstable build.

#### Tailscale CLI

1. Open a terminal session.
2. Use the Tailscale CLI command [`tailscale update`][docs-cli-update] with the `--track` flag to set the release track to `unstable`.

   ```shell
   tailscale update --track=unstable
   ```

## Windows

To install an unstable build of the Tailscale client on Windows, use one of the following methods.

#### Packages site

1. Go to the Tailscale Packages site, [unstable][pk-unstable-windows] page, Windows section.
2. Download the Windows version applicable to your version.
3. Install the build.

#### Tailscale CLI

1. Open a command line session.
2. Use the Tailscale CLI command [`tailscale update`][docs-cli-update] with the `--track` flag to set the release track to `unstable`.

   ```shell
   tailscale update --track=unstable
   ```

## macOS

To install an unstable build of the Tailscale client on macOS, use one of the following methods.

#### Packages site

1. Go to the Tailscale Packages site, [unstable][pk-unstable-macos] page, macOS section.
2. Download either the `.zip` or `.pkg` version of macOS build.
3. Install the build.

#### Tailscale CLI

1. Open a terminal session.
2. Use the Tailscale CLI command [`tailscale update`][docs-cli-update] with the `--track` flag to set the release track to `unstable`.

   ```shell
   tailscale update --track=unstable
   ```

#### App Store

[Join our TestFlight unstable track][xt-apple-testflight-tailscale-beta]. TestFlight requires macOS Monterey 12 or later.

To stop testing unstable versions:

1. Open the TestFlight app.
2. Select **Tailscale**.
3. Scroll to the bottom, then select **Stop Testing**.

## iOS

To install an unstable build of the Tailscale client on iOS, join our [TestFlight unstable track][xt-apple-testflight-tailscale-beta-2].

To stop testing unstable versions:

1. Open the TestFlight app.
2. Select **Tailscale**.
3. Scroll to the bottom, then select **Stop Testing**.

## Android

To install an unstable build of the Tailscale client on Android, join our [Play Store unstable track][xt-google-play-tailscale-test].

## tvOS

To install an unstable build of the Tailscale client on tvOS for an Apple TV, join our [TestFlight unstable track][xt-apple-testflight-tailscale-beta-2]. This requires tvOS 17 or later.

To stop testing unstable versions:

1. Open the TestFlight app.
2. Select **Tailscale**.
3. Select the  menu, then **Stop Testing**.

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-release-stages]: /docs/reference/tailscale-release-stages

[pk-unstable-macos]: https://pkgs.tailscale.com/unstable/#macos

[pk-unstable-windows]: https://pkgs.tailscale.com/unstable/#windows

[pk-unstable]: https://pkgs.tailscale.com/unstable

[xt-apple-testflight-tailscale-beta-2]: https://testflight.apple.com/join/tLcYLZJV

[xt-apple-testflight-tailscale-beta]: https://testflight.apple.com/join/7ExrFq00

[xt-google-play-tailscale-test]: https://play.google.com/apps/testing/com.tailscale.ipn
