---
title: "Access Unraid NAS from anywhere"
description: "Configure the Tailscale client on an Unraid NAS server."
---

Last validated Jan 5, 2026

[Unraid][xt-unraid] is a Linux-based network-attached storage (NAS) operating system. Official support for Tailscale was added in Unraid v7.

Unraid lets you:

* Pool multiple, mismatched-sized drives into a single array or volume.
* Use a wide variety of features for remote management.
* Use built-in Docker support for many apps.
* Use advanced virtual machine engine tools such as [libvirt][xt-libvirt] and [QEMU][xt-qemu] to support PCI passthrough for high performance-gaming VMs.

For more information, refer to [Unraid's Tailscale][xt-unraid-tailscale] documentation.

## Requirements

* At least one Unraid server with administrative access.
* An existing tailnet. For instructions, refer to [Tailscale quickstart][docs-install].
* You must be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet for some actions needed in the admin console.

## Install Tailscale in Unraid

> **Note:**
>
> We recommend the Tailscale (Plugin) which Derek Kaser maintains on behalf of Unraid.

1. Open the Unraid web interface.
2. Select the **Apps** menu.
   1. If this is a brand new Unraid server, select the **Install Community Applications** plugin option.
   2. Search for the Tailscale plugin.
   3. Select the app labeled **Tailscale (Plugin)**. Make sure you select this plugin and ignore the other legacy options, such as Docker.
   4. Select **Install**.
   5. After the plugin is installed, select the **Settings** menu in the Unraid web interface.
   6. Go to the **Network Services** section and select **Tailscale**.
   7. Select **Reauthenticate** > **Connect** to add the server to your tailnet. A message might display indicating that the Tailscale key will expire. This message is normal and key expiry can be disabled. For more information, refer to [Key expiry][docs-key-expiry].
3. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console and verify that the Unraid server is added.

   > **Note:**
   >
   > If [device approval][docs-device-approval] is enabled, you might need to approve the server from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console to let the Unraid server to communicate with other devices in your tailnet.

From the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, you can locate the tailnet `100.x.y.z` IP address for the Unraid server. Use that address, or the tailnet hostname, such as `tower`, to connect to the Unraid user interface from another device in your tailnet, using a web browser.

## Unraid as a Tailscale exit node

You can configure the Unraid server as an [exit node][docs-exit-nodes] to route traffic for other devices in the tailnet using the Unraid server. This can be useful when using an untrusted Wi-Fi connection in a coffee shop or accessing online services (such as banking) that require devices to be in a specific country or region.

1. To configure Unraid as an exit node open the Unraid web interface.
   1. Select **Plugins**.
   2. Select **Tailscale** by selecting the Tailscale logo.
   3. Ensure you are authenticated properly to your tailnet by selecting the user avatar / logo in the top right.
      1. Once logged in, you will be able to select which exit node Unraid should use or enable Unraid to be an exit node.
   4. To configure Unraid to be an exit node for your tailnet.
      1. Select **Run as Exit Node** from the **Exit node** UI.
   5. To configure Unraid to use an exit node elsewhere in your tailnet.
      1. Select **node name** from the **Exit node** UI.

After you configure the Unraid side, you must approve the exit node request in the Tailscale admin console.

> **Tip:**
>
> You can [configure `autoApprovers`][docs-auto-approvers] to automatically approve new exit node requests.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.
   1. Locate the Unraid server in the list. If configured correctly it will display the **Exit Node** badge.
   2. Each exit node requires manual approval. To approve devices as an exit node, in the Tailscale admin console, select the  menu next to the exit node, then select **Edit exit node**.
   3. Check the **Use as exit node** box, then select **Save**.

To configure other devices in your tailnet to use the Unraid server as an exit node, refer to [Use exit nodes][docs-quick-exit-nodes].

## Unraid as a Tailscale subnet router

You can configure the Unraid server as a [subnet router][docs-subnets] to access any devices or exit nodes in your physical network that cannot be added to your tailnet. For example, you can remotely connect to a printer.

1. Open the Unraid web interface.
   1. Select the terminal icon (**>\_**) in the main menu.
   2. Enter the following commands:

      ```shell
      tailscale up --advertise-routes=192.0.2.0/24
      ```

      If you want to add multiple subnets, you can include additional CIDR IP ranges separated by a comma.

      ```shell
      tailscale up --advertise-routes=192.168.1.0/24,198.160.50.0/24
      ```

2. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the Unraid server in the list. It should display the **Subnets** badge.
   1. Select the  menu, then select **Edit subnet routes**.
   2. Check the IP range boxes that correspond to the subnet routes you want to advertise, then select **Save**.

3. Go back to the Unraid web interface, open the Tailscale app, and verify that subnets are enabled.

## Native Docker and Tailscale integration

As of Unraid v7, you can automatically join containers created on an Unraid server to your tailnet. This lets each container appear as a unique device in your tailnet. A case for this would be sharing a service with a non-tailnet user or device, without sharing the Unraid server through Tailscale.

Refer to the [Unraid maintained documentation][xt-unraid-tailscale-docker] for more information about integration.

### Automatically join containers to your tailnet

You can automate the adding of containers to your tailnet programmatically using a Tailscale OAuth client secret.

1. Tailscale prerequisites:
   1. Create an appropriate [tag][docs-tags] in your [tailnet policy file][docs-tailnet-policy-file].
   2. Generate an [OAuth client][docs-oauth-client] with permissions to **Read** and **Write** [Auth Keys][docs-auth-keys].
   3. Enable [HTTPS certificates][docs-https-certs] for your tailnet.
2. In the Unraid web interface, select a container for creation.
   1. In the **Add Container** menu, set **Use Tailscale** to on.

   2. Enter an appropriate hostname for the container in your tailnet.

   3. Select **Tailscale Show Advanced Settings**.

   4. Enter the following string in the **Tailscale Extra Parameters** field, making sure to update the values with your own:

      ```shell
      --authkey=tskey-client-kQ3XbSTPg921CNTRL-teMgW7PkZ2No9xr1CRTt1N7k45u3MnKpZ --advertise-tags=tag:example
      ```

   5. Select **Apply**.

   6. Your service should now be available with a TLS certificate from the following location:

      ```shell
      https://myservice.example.ts.net
      ```

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-auto-approvers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-https-certs]: /docs/how-to/set-up-https-certificates

[docs-install]: /docs/how-to/quickstart

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-oauth-client]: /docs/features/oauth-clients

[docs-quick-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-libvirt]: https://libvirt.org/

[xt-qemu]: https://www.qemu.org/

[xt-unraid-tailscale-docker]: https://docs.unraid.net/go/tailscale-docker/

[xt-unraid-tailscale]: https://docs.unraid.net/go/tailscale/

[xt-unraid]: https://unraid.net/
