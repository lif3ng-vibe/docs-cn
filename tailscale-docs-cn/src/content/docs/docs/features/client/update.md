---
title: "Update Tailscale"
description: "Our team regularly releases updates for the Tailscale client, and we recommend always being on the latest version of the Tailscale client. To explore all the latest features, changes, and fixes, inclu"
---

Last validated Dec 4, 2025

Our team regularly releases updates for the Tailscale client, and we recommend always being on the latest version of the Tailscale client. To explore all the latest features, changes, and fixes, including release versions of the Tailscale client, refer to our [Changelog][co-changelog-client] page.

There are 3 ways to keep your Tailscale client up-to-date:

* Auto-updates (recommended)
* Manual updates
* MDM-managed updates

## Check for updates

To find the version of the Tailscale client installed on every device in your Tailscale network (known as a tailnet), open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and refer to the **Version** column. A gray arrow indicates that a standard update is available, a red arrow indicates that a security update is available, and no arrow indicates that the device is up-to-date.

*（图：Devices showing the Tailscale client version.）*

To display only the devices where an update is available, select the **Version** filter and select [Update available](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available).

*（图：Devices showing the Tailscale client and filtered by available updates.）*

## Auto-updates

Tailscale can automatically apply client updates as they are released. To apply the update, the same mechanism is used during the initial client installation. For example, if the client was installed using a Linux package manager, that package manager will be used to upgrade the installed package.

Auto-updates are optional, and individual devices can be opted in or out of them anytime.

> **Note:**
>
> Devices using the iOS, macOS (App Store version), and Android (Google Play Store version) operating systems might not have automatic updates configured by default. We recommend verifying that this setting is enabled in the App Store and Google Play Store to ensure these devices are updated per with your tailnet settings.

If you use [system policies][docs-mdm-keys-configure-auto-update] to enforce your tailnet updates, auto-updates will occur based on the system policies that you set.

Auto-updates apply even if the client is disconnected from Tailscale.

### Configure auto-updates in your tailnet

You must be the [Owner, Admin, or IT admin](/docs/reference/user-roles) to enable or disable auto-updates for a tailnet.

To enable auto-updates for your entire tailnet, open the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console. Under **Auto-update Tailscale**, enable the **Auto-update new devices** toggle.

*（图：Auto-update enabled in the admin console.）*

Changing the auto-update setting in the admin console will not change the Tailscale client settings for existing devices. The setting only affects new devices. Existing device owners must manually enable or disable auto-updates.

### Auto-updates for new tailnets

All newly created tailnets have auto-updates enabled by default in the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console. When a new device is added to the tailnet, the Tailscale client will be configured to automatically update by default.

### Auto-updates for existing tailnets

If your tailnet was created prior to February 2024, you must manually enable auto-updates in the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console, and for each of the existing devices. When auto-updates are enabled in the admin console, new devices added to your tailnet will be configured to automatically update by default.

### Auto-updates for Docker containers

[Docker][docs-docker] containers are designed to be immutable, meaning they are not meant to change over time. Therefore, we recommend using the `stable` tag (`image: tailscale/tailscale:stable`) in your Docker [configuration][xt-gh-tailscale-docker-examples] to ensure containers are updated to the latest stable version of the Tailscale client every time they are deployed.

> **Note:**
>
> It is common for Docker to also use the `latest` tag. In the context of Tailscale, the `latest` and `stable` tags accomplish the same thing, however, we recommend that you use the `stable` tag.

Although you can enable auto-updates within the Tailscale container by setting the Tailscale CLI command [`tailscale set --auto-update`][docs-cli-set], be aware of the following limitations:

* Auto-updates inside a container do not persist between restarts. Therefore, you must reissue the command whenever a container is re-deployed or restarted.
* We recommend setting the version to `stable` and not setting the `auto-update` flag to on. This ensures that each time you deploy or restart the container, it will run with our latest stable version of Tailscale.
* If you have both the `auto-update` flag set for the container and your configuration specifies a version such as `tailscale/tailscale:v1.76.0`, the version of the Tailscale client will revert to this version upon re-deploy or restart and then eventually update to the latest stable version.
* Auto-updates inside a container will ignore the tailnet-wide settings for auto-updates.

### Enable auto-updates on devices

You may need to configure auto-update settings for the Tailscale clients on a device if auto-updates were not previously configured or if you need to disable auto-updates for the device.

Here's how to change auto-update device settings on different platforms:

#### Windows

Select the Tailscale tray icon and toggle **Automatically install updates** under the **Preferences** menu.

#### macOS

If you installed Tailscale from the Mac App Store, open the App Store application, select **App Store** in your macOS menu bar, select **Settings**, and check the **Automatic Updates** box. Note that enabling this setting will automatically update all of your installed apps.

*（图：Devices showing the Tailscale client version.）*

If you installed Tailscale by downloading the `.zip` archive from `pkgs.tailscale.com`, select the Tailscale tray icon and toggle **Automatically install updates** under the **Settings** menu.

#### iOS

Auto-updates for iOS apps are managed through the App Store settings.

#### Android

Auto-updates for Android apps are managed through the Google Play Store settings.

#### Linux

From the CLI, run `tailscale set --auto-update` to enable auto-updates, or `tailscale set --auto-update=false` to disable them.

#### Synology

Refer to [Access Synology NAS from anywhere][docs-synology-schedule-updates] for instructions on scheduling automatic updates in DiskStation Manager (DSM).

### Auto-updates for devices on multiple tailnets

If a device has automatic updates enabled and belongs to multiple tailnets where the **Auto-update new devices** setting in the admin console varies, the client will be updated when connected to a tailnet with auto-updates enabled.

### Auto-update limitations

Auto-updates are currently not supported on Synology and Linux distributions based on Arch Linux.

Auto-updates do not happen immediately when a new version of Tailscale is released. We monitor stability and issue reports for several days before enabling a release for auto-updates. It typically takes around a week after a release before your machines start to update, and it can take longer. Important security updates may be applied faster.

If machines with auto-updates enabled are not updated several weeks after a release, [contact support][co-contact-support].

Scheduling of auto-updates is not currently supported. Auto-updates are automatically scheduled around each node's activity to minimize disruption.

## Manual updates

Here's how to manually upgrade on different platforms:

#### Windows

Upgrade Tailscale by downloading our [Windows installer][pk-windows-installer] and running it. This will update your existing installation to the latest version.

Alternatively, you can update Windows clients by running the [Tailscale CLI][docs-cli] command [`tailscale update`][docs-cli-update].

#### macOS

Tailscale for macOS is available in [multiple variants][docs-macos-variants].

We recommend using the [Standalone application][docs-macos-variants-standalone]
for a new macOS installation. You can enable auto-updates from the Preferences
page of the installed app.

The [Mac App Store][xt-apple-macos-store-tailscale] application will
auto-update by default. If you need to manually update, you can do so from the
App Store updates page.

#### iOS

Tailscale for iOS is only available [through the App Store][xt-apple-ios-store-tailscale]
and will auto-update by default. If you need to manually update, you can do so from
the App Store updates page.

#### Android

Tailscale for Android is only available [through the Play Store][xt-google-play-tailscale] and will auto-update by default. If you need to manually update, you can do so from the Play Store updates page.

#### Linux

If you are using Tailscale v1.36 or later, you can update some distros of Linux clients by running the [Tailscale CLI][docs-cli] [`update`][docs-cli-update] command.

```shell
tailscale update
```

Alternatively, you can upgrade the Tailscale client on [supported Linux distros][docs-install-linux] by using the upgrade command from the package manager used to install Tailscale. Here's a reference for common distros.

For **all Ubuntu and Debian versions**, upgrade using `apt-get`:

```shell
sudo apt-get update
sudo apt-get install tailscale
```

For **CentOS 7** and **Amazon Linux 2**, upgrade using `yum`:

```shell
sudo yum update tailscale
```

For **openSUSE Leap and openSUSE Tumbleweed**, upgrade using `zypper`:

```shell
sudo zypper update tailscale
```

For **CentOS 8**, **CentOS Stream 9**, **RHEL 8**, and **Fedora**, upgrade using `dnf`:

```shell
sudo dnf update tailscale
```

Consult your distro's package manager documentation on how to enable auto-updates.

#### Tailscale admin console

Devices can be updated by using the [`Last seen`](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available+auto-update%3Aenabled+lastseen%3Aconnected) filter in the **Machines** page of the admin console when:

* [Auto-updates][ar-auto-updates] are enabled on devices
* Devices are online
* You are logged in to the admin console as an [Owner, Admin, or IT admin](/docs/reference/user-roles)

Hover over  for a device and select **Start update** to start the update. You can also set the [`Last seen`](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available+auto-update%3Aenabled+lastseen%3Aconnected) filter options `Last seen: Currently connected`, `Version: Update available`, and `Auto-update: Enabled` to display only the devices that can be updated using this method. If you can't find the **Start update** button, then one of the conditions above is not met.

*（图：The Machine page displaying the Start update option.）*

#### Synology

The best way to install and update Tailscale on Synology devices is to download and manually install the Tailscale package for DiskStation Manager (DSM). For more information, refer to [Install Tailscale on DSM manually][docs-synology-manual].

## MDM-managed updates

To manage the installed version of Tailscale using MDM, refer to your MDM software documentation. You can also configure the installed Tailscale client using [MDM policies][docs-mdm-keys-configure-auto-update].

[ar-auto-updates]: #auto-updates

[co-changelog-client]: https://tailscale.com/changelog#client

[co-contact-support]: https://tailscale.com/contact/support

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-docker]: /docs/features/containers/docker

[docs-install-linux]: /docs/install/linux

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-macos-variants-standalone]: /docs/concepts/macos-variants#standalone-variant

[docs-mdm-keys-configure-auto-update]: /docs/features/tailscale-system-policies#configure-the-auto-update-settings

[docs-synology-manual]: /docs/integrations/synology#install-tailscale-on-dsm-manually

[docs-synology-schedule-updates]: /docs/integrations/synology#schedule-automatic-updates

[xt-apple-ios-store-tailscale]: https://apps.apple.com/app/tailscale/id1470499037

[xt-apple-macos-store-tailscale]: https://apps.apple.com/app/tailscale/id1475387142

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples

[xt-google-play-tailscale]: https://play.google.com/store/apps/details?id=com.tailscale.ipn

[pk-windows-installer]: https://pkgs.tailscale.com/stable/tailscale-setup-full-latest.exe
