---
title: "Mullvad exit nodes"
description: "The Mullvad VPN add-on lets you use [Mullvad][xt-mullvad-why] VPN servers as [exit nodes][docs-exit-nodes] in a Tailscale network (known as a tailnet). Mullvad exit nodes function similarly to regular"
---

Last validated Jan 9, 2026

> **Note:** This feature is currently in beta.

The Mullvad VPN add-on lets you use [Mullvad][xt-mullvad-why] VPN servers as [exit nodes][docs-exit-nodes] in a Tailscale network (known as a tailnet). Mullvad exit nodes function similarly to regular exit nodes but use [Mullvad's pre-existing VPN infrastructure][xt-mullvad-server-list] instead of a device you own.

Mullvad exit nodes support most of the same functionality as other exit nodes, such as [suggested exit nodes][docs-suggested-exit-nodes] and [mandatory exit nodes][docs-auto-exit-nodes], but they have some limitations.

## Requirements and limitations

Review the following requirements and limitations related to the Mullvad add-on:

* You must purchase the Mullvad VPN add-on before you can access Mullvad exit nodes.
* Mullvad exit nodes don't work with [custom DERP servers][docs-custom-derp-servers].
* Access control policies for Mullvad exit nodes don't work with [Google-synced groups][docs-google-sso].
* If you use [Tailnet Lock][docs-tailnet-lock] with the Mullvad VPN add-on, you must [sign each Mullvad exit node][ar-sign-mullvad-exit-nodes].
* If you use [GitOps][docs-gitops-acls] to manage your [tailnet policy file][docs-tailnet-policy-file], the Mullvad VPN add-on checkout flow might be locked. To purchase additional licenses, go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console, then select **Manage add-ons**.
* The Tailscale client for Windows does not support displaying the full list of Mullvad exit nodes. You can access a complete list of Mullvad exit nodes using the [Tailscale CLI][docs-cli].
* You cannot use both the admin console and the tailnet policy file to [manage Mullvad access][ar-manage-mullvad-access]. If you use the tailnet policy file to manage Mullvad access, you must manage all Mullvad access through the tailnet policy file.

### Important DNS considerations

> **Note:**
>
> Tailscale v1.48.3 and later don't require additional configuration.

Mullvad exit nodes with Tailscale v1.48.1 and v1.48.2 use the device's local DNS configuration. As a result, you might lose access to DNS (effectively losing internet access) unless you configure one of the following:

* [Allow local network access][docs-exit-node-local-network-access] for exit nodes.
* Add a [global nameserver][docs-global-nameserver] and [override DNS servers settings][docs-override-dns-servers].

Keep the following in mind when configuring either of these settings:

* Overriding local DNS causes Tailscale to configure all clients to use the selected DNS server for all DNS queries while Tailscale is connected, even if you are not using an exit node. When used with the Mullvad Public DNS nameservers, this ensures all DNS routes through Mullvad and provides a green check for DNS leaks on [`mullvad.net/check`][xt-mullvad-dns-leaks].
* Allowing exit nodes access to the local network might allow DNS leaks to occur but also ensures that local DNS names, such as a local printer name or a local NAS server name, continue to work.

## Data privacy and anonymity

When you use Mullvad with Tailscale, you allow Tailscale to generate, manage, renew, and remove Mullvad accounts on your behalf. As a result, there are some important privacy and anonymity considerations:

* Tailscale generates and manages account information on users' behalf.
* Tailscale is identity-aware (Tailscale doesn't support anonymous tailnets). All Tailscale users are connected to an email address or GitHub account.
* Tailscale knows which Mullvad accounts belong to which Tailscale users.
* Users establish [encrypted][docs-encryption] [WireGuard][docs-wireguard] connections with Mullvad servers. Tailscale can identify which users are connecting to which Mullvad servers using logs. If a device [opts out of client logging][docs-opt-out-logging], Tailscale does not have visibility into which Mullvad exit node that device uses. As with any traffic in your tailnet, Tailscale cannot access any user traffic sent to Mullvad servers. This is because all user traffic is encrypted in WireGuard tunnels, and Tailscale cannot decrypt this information.
* Mullvad does not receive user identity information from Tailscale.

## Available Mullvad regions

You can purchase and use the Mullvad add-on for your tailnet in most countries, however, some countries and regions are excluded. If your region is not listed, you can subscribe to [the GitHub tracking issue][xt-gh-mullvad-issue] for updates and request updates. After you purchase the Mullvad add-on, you have access to all available Mullvad servers.

For a current list of the Mullvad servers that are available to use as exit nodes by country and city, refer to the Mullvad [Servers][xt-mullvad-servers] page. These regions are also displayed as exit node options in the Tailscale client.

## Mullvad licensing

You must purchase the Mullvad VPN add-on through the admin console before you can access Mullvad exit nodes. The base add-on includes five licenses, but you can purchase additional licenses during the initial checkout flow or afterward through the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.

Users on the [Personal or GitHub Community plans][docs-free-plans] can purchase the Mullvad add-on on either a monthly or annual basis. Users on the [Standard and Premium plans][co-pricing] can purchase the Mullvad add-on on a monthly basis only. Users on the Enterprise plan must contact their account team to purchase the Mullvad add-on.

## How-to guides

### Enable Mullvad exit nodes

You can enable Mullvad exit nodes by purchasing the Mullvad VPN add-on and configuring device access.

1. From the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console, scroll down to **Mullvad VPN**.
2. Select **Configure**.
3. Continue with the checkout flow to purchase Mullvad licenses.

If you use [GitOps][docs-gitops-acls] to manage your tailnet policy file, the Mullvad VPN add-on checkout flow might be locked. To purchase additional licenses, go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console, then select **Manage add-ons**.

### Manage Mullvad access

You can configure Mullvad access using the admin console user interface or the tailnet policy file. Using the tailnet policy file to manage Mullvad exit node access offers more flexibility. For example, it lets you assign Mullvad access to more devices than you have Mullvad licenses for.

> **Warning:**
>
> You cannot use both the admin console and the tailnet policy file to manage Mullvad access. If you use the tailnet policy file to manage Mullvad access, you must manage all Mullvad access through the tailnet policy file.

#### From the admin console

You can manage Mullvad access through the admin console. If you manage Mullvad access this way, you must explicitly configure each device.

To grant devices access to Mullvad:

1. From the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console, scroll down to **Mullvad VPN**.
2. Select **Configure**.
3. Select **Add devices**.
4. Select the devices to grant access to Mullvad's infrastructure as exit nodes.
5. Then, save your changes.

Each device uses a slot in a Mullvad license. Each Mullvad license will allow up to five devices. Your monthly bill automatically updates as you add or remove devices.

You can revoke a device's access to Mullvad by selecting **Remove**.

#### From the tailnet policy file

You can also manage access to Mullvad exit nodes using [node attributes][docs-policy-syntax-nodeattrs] in the [tailnet policy file][docs-tailnet-policy-file].

1. Go to the **Access controls** page of the admin console.
2. Add a [`nodeAttrs`][docs-policy-syntax-nodeattrs] section to your tailnet policy file that assigns the `mullvad` attribute to the device you plan to use with Mullvad exit nodes.

The following example grants access to all devices owned by `joe@example.com`:

```json
"nodeAttrs": [
  {
    "target": ["joe@example.com"],
    "attr": [
      "mullvad",
    ],
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **Warning:**
>
> When you use the tailnet policy file to manage Mullvad access, devices using a Mullvad license do not appear in the [Configure Mullvad VPN](https://console.tailscale.com/admin/settings/general/mullvad) page of the admin console. You must manage Mullvad access through the tailnet policy file.

##### Share a pool of licenses

This method lets you assign access to Mullvad for more devices than your Mullvad add-on current plan permits. For example, the following configuration lets all devices in the `mullvad` group to use Mullvad exit nodes:

```json
"nodeAttrs": [
  {
    "target": ["group:mullvad"],
    "attr": [
      "mullvad"
    ],
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

When you share a license pool in this manner, devices use available Mullvad licenses on a first-come, first-served basis as they connect to the tailnet. **Tailscale allocates Mullvad licenses to devices as they connect to the tailnet, not as they connect to Mullvad servers.** If all paid slots are in use, devices outside the selected quota will not have Mullvad exit nodes as an option.

> **Warning:**
>
> While it's possible to effectively share a pool of Mullvad licenses, it's important to ensure you have purchased enough Mullvad licenses to cover the needs of your environment.
>
> Consider the following example:
>
> The *Society of Pangolin Enthusiasts* organization has a tailnet with 100 devices in it, and they've purchased the Mullvad add-on with 50 licenses.
>
> Using the tailnet policy file, an administrator set up a `nodeAttrs` policy that lets all 100 devices use Mullvad exit nodes (if they're available). The 100 devices can then effectively share the pool of Mullvad exit nodes, even though there isn't a Mullvad exit node for each device.
>
> If 50 devices connect to the tailnet, Tailscale allocates a Mullvad license to each one. The next device (the 51st) won't get a Mullvad license allocated to it. As a result, if that device tries to use a Mullvad exit node, it **won't be able to access any Mullvad exit nodes** until one of the 50 devices releases a Mullvad license.
>
> You can [release a device's Mullvad license][ar-release-a-license] by removing the device from the tailnet policy file or by removing the device from the Mullvad VPN configuration in the admin console.

### Use Mullvad exit nodes

After you enable Mullvad exit nodes and configure a device for Mullvad access, you can use the exit nodes from devices in your tailnet. Each device must enable an exit node separately. There might be a slight delay before Mullvad exit nodes appear in your Tailscale client.

> **Tip:**
>
> You can also [get a suggested Mullvad exit node][docs-suggested-exit-nodes].

Instructions differ depending on the client operating system:

#### Android

1. From the  menu, select **Use exit node**.
2. Choose the Mullvad exit node to use.
3. (Optional) If you want to allow direct access to your local network when traffic routes through an exit node, select **Allow LAN access**.

> **Note:**
>
> If you do not select **Allow LAN access**, you might need to configure [DNS][ar-important-dns-considerations]. You can also select **None** to disable using an exit node.

#### iOS

1. Tap on **Exit Nodes**, then select **Location Based**.
2. Select the Mullvad exit node you want to use.

> **Note:**
>
> You might need to configure **Override DNS servers** as described in the [DNS][ar-important-dns-considerations] section.

#### Linux

You can select an exit node using the [`tailscale set`][docs-cli-set] or the [`tailscale up`][docs-cli-up] command.

With either command, pass the `--exit-node=` flag with the IP address of the Mullvad exit node. If [MagicDNS][docs-magicdns] is enabled, you can instead pass in the name of the Mullvad exit node.

```shell
sudo tailscale set --exit-node=<exit-node-name-or-ip>
```

You can find the exit node's IP address (and name if MagicDNS is enabled) by running [`tailscale exit-node list`][docs-cli-exit-node].

Set `--exit-node-allow-lan-access` to `true` to allow direct access to your local network when routing traffic through an exit node. If you do not configure this option, you might need to configure [DNS][ar-important-dns-considerations].

```shell
sudo tailscale set --exit-node=<exit-node-name-or-ip> --exit-node-allow-lan-access=true
```

#### macOS

1. Open the Tailscale menu and select **Exit Nodes** > **Location Based Exit Nodes** > **Countries**. (If you are running a Tailscale client version earlier than v1.60.0, select **Use exit node** for the Mullvad option.)
2. Select the Mullvad exit node you want to use.

If options do not appear in the **Countries** menu, ensure that the Mullvad add-on has been [enabled][ar-configure-devices-for-mullvad-access] for the Mac that you are using.

If you want to allow direct access to your local network when routing traffic through an exit node, select **Allow Local Network Access**. If you do not select **Allow Local Network Access**, you might need to configure [DNS][ar-important-dns-considerations].

#### tvOS

> **Note:**
>
> This option is only available in the Tailscale app on tvOS if you've already purchased Mullvad exit nodes for your tailnet.

You can configure your Apple TV to use a Mullvad exit node (location-based) instead of using another tailnet device as an exit node. For more information on how to set this up, refer to [Apple TV][docs-appletv-use-mullvad-exit-node].

#### Windows

1. Open the Tailscale menu and select **Exit Nodes** > **Location Based Exit Nodes** > **Location Based**.
2. Select the Mullvad exit node you want to use.

If you want to allow direct access to your local network when routing traffic through an exit node, select **Allow local network access**.

### Disable Mullvad on a device

> **Note:**
>
> You must be an [Owner, Admin, or Network admin](/docs/reference/user-roles) of a tailnet to disable Mullvad exit nodes on a device.

You can revoke a device's access to Mullvad exit nodes through the admin console or the tailnet policy file. Use the same method you used to grant access.

To revoke a device's access to Mullvad exit nodes from the admin console:

1. Open the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console.
2. Go to the **Mullvad VPN** section and select **Configure**.
3. Select **Remove** next to the device you want to remove, then select **Save**.

To revoke a device's access to Mullvad exit nodes from the tailnet policy file:

1. Go to the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Update the `nodeAttrs` section of your tailnet policy file to exclude the `mullvad` attribute from the device.

> **Warning:**
>
> The exact way to exclude a device's access depends on how you configured its access. For example, if you granted a user explicit access using an email address, you can remove the line that assigns the `mullvad` attribute to that user. However, if you granted access using [groups][docs-targets-groups], [tags][docs-targets-groups], or other means, the process might involve more steps (such as removing the device from a group).

### Remove the Mullvad add-on

> **Note:**
>
> You must be an [Owner, Admin, or Billing admin](/docs/reference/user-roles) of a tailnet to remove the Mullvad add-on.

You can remove the Mullvad VPN add-on from the admin console.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select **Manage add-ons**.
3. Select **Mullvad VPN** > **Remove add-on**.

### Migrate from Mullvad to Tailscale

If you're migrating from using Mullvad VPN to Tailscale's Mullvad add-on, you might need to disable Mullvad's settings to block connections without a VPN.

Before migrating from Mullvad to Tailscale's Mullvad add-on:

1. Go to the Mullvad VPN application.
2. Disable the Mullvad VPN.
3. Turn off the **Block connections without VPN** setting.

Devices that are registering with Mullvad for the first time might experience a delay when synchronizing with all the Mullvad exit nodes. The synchronization process can take up to two minutes when you first use Mullvad on a particular device or if you have not used it for several weeks. With regular usage, activating Mullvad is instantaneous.

### Sign Mullvad exit nodes

If you use [Tailnet Lock][docs-tailnet-lock] with the Mullvad VPN add-on, you must sign each Mullvad exit node. Additionally, the device you use to sign each Mullvad exit node must have access to the Mullvad exit nodes (it must have a valid Mullvad license). Otherwise, the Mullvad exit nodes are not included in the signing device's netmap and when it runs [`tailscale lock`][docs-cli-tailscale-lock], the list won't include the unsigned Mullvad exit nodes.

This is an example of signing a single Mullvad exit node:

> **Note:**
>
> The following command has a `jq` dependency. You may need to install `jq` on your device.

1. Acquire the `NodeKey` of your chosen Mullvad exit node.

   ```shell
   tailscale lock status --json | jq '[.FilteredPeers[] | select(.DNSName | contains("mullvad.ts.net")) | {DNSName, NodeKey: .NodeKey}] | sort_by(.DNSName)'
   ```

2. Use `tailscale lock` to `sign` the exit node.

   ```shell
   tailscale lock sign nodekey <nodekey-of-exit-node>
   ```

This `mullvad-script` can be used on Linux. macOS, and Windows devices to automate the signing of multiple Mullvad exit nodes with certain country codes:

[`https://github.com/tailscale-support/mullvad-script`][xt-gh-tailscale-support-mullvad-script]

Either provide a specific two letter country code or `..` (two periods) to sign all Mullvad exit nodes. Refer to the Mullvad [Servers][xt-mullvad-servers] page for the list of supported countries.

[ar-configure-devices-for-mullvad-access]: #enable-mullvad-exit-nodes

[ar-important-dns-considerations]: #important-dns-considerations

[ar-manage-mullvad-access]: #manage-mullvad-access

[ar-release-a-license]: #disable-mullvad-on-a-device

[ar-sign-mullvad-exit-nodes]: #sign-mullvad-exit-nodes

[co-pricing]: https://tailscale.com/pricing

[docs-appletv-use-mullvad-exit-node]: /docs/install/appletv#use-a-mullvad-exit-node

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-cli-exit-node]: /docs/reference/tailscale-cli#exit-node

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-tailscale-lock]: /docs/reference/tailscale-cli/lock

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-cli]: /docs/reference/tailscale-cli

[docs-custom-derp-servers]: /docs/reference/derp-servers/custom-derp-servers

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-node-local-network-access]: /docs/features/exit-nodes#local-network-access

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-free-plans]: /docs/account/manage-plans/free-plans-discounts

[docs-gitops-acls]: /docs/gitops

[docs-global-nameserver]: /docs/reference/dns-in-tailscale#global-nameservers

[docs-google-sso]: /docs/integrations/identity/google-sso

[docs-magicdns]: /docs/features/magicdns

[docs-opt-out-logging]: /docs/features/logging#opt-out-of-client-logging

[docs-override-dns-servers]: /docs/reference/dns-in-tailscale#override-dns-servers

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-suggested-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes#use-a-suggested-exit-node

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-wireguard]: /docs/concepts/wireguard

[xt-gh-mullvad-issue]: https://github.com/tailscale/tailscale/issues/9314

[xt-gh-tailscale-support-mullvad-script]: https://github.com/tailscale-support/mullvad-script

[xt-mullvad-dns-leaks]: https://mullvad.net/en/help/dns-leaks

[xt-mullvad-server-list]: https://mullvad.net/en/help/server-list

[xt-mullvad-servers]: https://mullvad.net/en/servers

[xt-mullvad-why]: https://mullvad.net/en/why-mullvad-vpn
