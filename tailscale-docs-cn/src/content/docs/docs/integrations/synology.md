---
title: "Access Synology NAS from anywhere"
description: "Install Tailscale on your Synology device. Use this guide to get secure access to your Synology NAS from anywhere."
---

Last validated Jan 5, 2026

Tailscale lets you remotely access your Synology NAS.

> **Note:**
>
> The following related video provides additional context and examples.

[Simple Synology Remote Access (video)](https://www.youtube.com/watch?v=0o2EhK-QvmY)

## Features and benefits

When a Synology NAS device is connected, Tailscale supports the following:

* Log in using a [supported identity provider][docs-sso-providers].
* Access your Synology device from anywhere, [without opening firewall ports][bl-how-nat-traversal-works].
* Share your Synology device with designated Tailscale users, using [node sharing][docs-sharing].
* Restrict and control access to your Synology device using [access control policies][docs-access-control].
* Use your Synology device as a [subnet router][docs-subnets] to provide external access to your LAN.
* Designate your Synology device as an [exit node][docs-exit-nodes] for secure internet access for your other tailnet devices from anywhere.

## Install using Synology Package Center

Installation from the Synology Package Center is the easiest way to get started.

> **Note:**
>
> We recommend that you [schedule automatic updates][ar-schedule-auto-updates] as the version published in the Synology app store may not always reflect the most recently released Tailscale version.

1. Go to the Synology Package Center ([tutorial][xt-synology-docs-install]).

2. Search for and install the **Tailscale** app.

   *（图：The Synology Package Center user interface.）*

3. After the Tailscale app is installed, follow the instructions to log in to your Tailscale network (known as a tailnet) using your preferred identity provider. If you don't already have a Tailscale account, a free account will be created automatically.

   *（图：The Synology login prompt.）*

4. After you authenticate to the tailnet, you can connect to your Synology device from your PC, laptop, phone, or tablet by [installing Tailscale on another device][co-download].

## Schedule automatic updates

You can create a scheduled task to check for Tailscale client updates and install them automatically.

1. In Synology, go to **Control Panel** > **Task Scheduler**, select **Create**, and select **Scheduled Task**.

2. Select **User-defined script**.

3. In the **General Settings** tab, enter a task name and select the **User:** as `root`.

4. Go to the **Schedule** tab, select **Run on the following days**, then **Run on the follow days**, and choose an increment such as **Daily**.

5. Go to the **Task Settings** tab and enter the following for **User-defined script**:

   ```shell
   tailscale update --yes
   ```

6. Select **OK** to save the settings.

## Enable outbound connections

Synology DSM7 introduced tighter restrictions on what packages are allowed to do. If you're running DSM6, Tailscale runs as root with full permissions and these steps are not required.

By default, Tailscale on Synology with DSM7 only lets you make inbound connections to your Synology device but outbound Tailscale access from other apps running on your Synology is not enabled.

The reason for this is that the Tailscale package does not have permission to create a [TUN device][xt-wikipedia-tuntap].

To enable TUN, to permit outbound connections from other things running on your Synology device:

1. Make sure you're running Tailscale v1.22.2 or later

2. In Synology, go to **Control Panel** > **Task Scheduler**, select **Create**, and select **Triggered Task**.

3. Select **User-defined script**.

4. When the **Create task** window appears, select **General**.

5. In **General Settings**, enter a task name, select **root** as the user that the task will run for, and select **Boot-up** as the event that triggers the task. Ensure the task is enabled.

6. Select **Task Settings** and enter the following for **User-defined script**.

   ```shell
   /var/packages/Tailscale/target/bin/tailscale configure-host; synosystemctl restart pkgctl-Tailscale.service
   ```

   If you're curious what it does, you can read the [`configure-host` code][xt-gh-tailscale-cli-synology].

7. Select **OK** to save the settings.

8. Reboot your Synology device. Alternatively, to avoid a reboot, run the above user-defined script as root on the device to restart the Tailscale package.

Your TUN settings should now be persisted across reboots of your device.

> **Note:**
>
> Upgrading the Tailscale package will require the above script to run again. When you upgrade Tailscale, run the above script as root, or reboot your Synology device.

## Adjust Synology firewall settings

By enabling TUN, Tailscale traffic will be subject to Synology's built-in firewall.

The firewall is disabled by default. However, if you have it enabled, add an exception for the Tailscale subnet, 100.64.0.0/10. In **Main menu** > **Control Panel** > **Security** > **Firewall**, add a firewall rule in the default profile that lets traffic through from the source IP subnet 100.64.0.0 with subnet mask 255.192.0.0.

## Troubleshooting

If your Synology NAS cannot connect to your tailnet after uninstalling and re-installing the Tailscale app, we recommend the following steps:

1. SSH into your NAS and run the command:

   ```shell
   sudo tailscale up
   ```

2. Enter the password for your NAS (if prompted), then copy the provided URL.

   ```shell
   To authenticate, visit:
   https://login.tailscale.com/a/xxxxxxxxxx
   Success.
   ```

3. Paste the URL into your web browser, authenticate to your tailnet, then open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console to verify that your NAS is connected to the tailnet.

## Install Tailscale on DSM manually

> **Note:**
>
> Synology Package Center updates Tailscale approximately once per quarter. To use the latest version of Tailscale, you may either [configure automatic scheduled updates][ar-schedule-auto-updates] or manually install the package.

1. [Download][pk-stable-synology] the DSM package from the Tailscale package server site.

   > **Note:**
   >
   > To determine which download is appropriate for your Synology device, visit the [Synology and SynoCommunity Package Architectures][xt-gh-synology-packages] page and look up your architecture by Synology model. Then, find the SPK download at [Tailscale Packages][pk-home] that corresponds to your model. Synology packages (SPKs) are available from both [stable][pk-stable-synology] and [unstable][pk-unstable-synology] release tracks.

2. [Manually install][xt-synology-docs-install] the DSM package onto your Synology device

3. After the Tailscale app is installed, follow the instructions to log in to your Tailscale network (known as a tailnet) using your preferred identity provider. If you don't already have a Tailscale account, a free account will be created automatically.

4. After you authenticate to the tailnet, you can connect to your Synology device from your PC, laptop, phone, or tablet by [installing Tailscale on another device][co-download].

5. The Tailscale daemon [`tailscaled`][docs-tailscaled] should now be running on your Synology device. You can configure it either by using the Tailscale package's Synology web UI or by using the [Tailscale CLI][docs-cli] over SSH.

> **Note:**
>
> For instructions on using SSH to access Synology, refer to [How can I sign in to DSM/SRM with root privilege via SSH?][xt-synology-docs-ssh].

## Limitations and known issues

* If you upgrade Synology from DSM6 to DSM7, you will need to uninstall and then reinstall the Tailscale app. Do not perform the Synology DSM7 upgrade over Tailscale or you may lose your connection during the upgrade.

* If you uninstall then re-install the Tailscale app and the NAS can no longer connect to your tailnet, refer to the [Troubleshooting][ar-troubleshooting] section for instructions.

* Tailscale uses [hybrid networking mode][docs-userspace-networking] on Synology, which means that if you share subnets, they will be reachable over UDP and TCP, but not necessarily pingable.

* Other Synology packages cannot make outgoing connections to your other Tailscale nodes by default on DSM7. Refer to the following instructions to enable.

* Tailscale on Synology currently can do `--advertise-routes` but not `--accept-routes`. This means that if you have other [subnet routers][docs-subnets], devices on those other subnets will not yet be able to reach your NAS or devices on its local subnet.

* [Tailscale SSH][docs-tailscale-ssh] does not run on Synology. You can use the provided SSH server in DSM instead.

Some of these limitations are imposed on Tailscale by the DSM7 sandbox. Refer to our [Synology tracking issue on GitHub][xt-gh-tailscale-issue-1995] for the latest status on the above issues.

## Special thanks

Special thanks to [Guilherme de Maio (nirev)][xt-gh-nirev], who contributed the original [Synology-Tailscale package builder][xt-gh-tailscale-synology]. Tailscale now maintains this package builder and produces our official Synology packages.

[ar-schedule-auto-updates]: #schedule-automatic-updates

[ar-troubleshooting]: #troubleshooting

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-download]: https://tailscale.com/download

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscaled]: /docs/reference/tailscaled

[docs-userspace-networking]: /docs/concepts/userspace-networking

[pk-home]: https://pkgs.tailscale.com

[pk-stable-synology]: https://pkgs.tailscale.com/stable/#spks

[pk-unstable-synology]: https://pkgs.tailscale.com/unstable/#spks

[xt-gh-nirev]: https://github.com/nirev

[xt-gh-synology-packages]: https://github.com/SynoCommunity/spksrc/wiki/Synology-and-SynoCommunity-Package-Architectures

[xt-gh-tailscale-cli-synology]: https://github.com/tailscale/tailscale/blob/main/cmd/tailscale/cli/configure-synology.go

[xt-gh-tailscale-issue-1995]: https://github.com/tailscale/tailscale/issues/1995

[xt-gh-tailscale-synology]: https://github.com/tailscale/tailscale-synology

[xt-synology-docs-install]: https://kb.synology.com/en-sg/DSM/tutorial/How_to_install_applications_with_Package_Center

[xt-synology-docs-ssh]: https://kb.synology.com/en-id/DSM/tutorial/How_to_login_to_DSM_with_root_permission_via_SSH_Telnet

[xt-wikipedia-tuntap]: https://en.wikipedia.org/wiki/TUN/TAP
