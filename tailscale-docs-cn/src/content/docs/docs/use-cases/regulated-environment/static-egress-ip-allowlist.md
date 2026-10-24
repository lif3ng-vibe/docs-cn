---
title: "Provide a static IP egress address to a regulated environment"
description: "To meet the security and compliance requirements of regulated environments such as banking, healthcare, and government, organizations often need to route network traffic through fixed IP addresses for"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Subnet routers**](/docs/features/subnet-routers) — Use subnet routers to give devices outside your local network access to services within specific subnets. Extend your private network with Tailscale.

To meet the security and compliance requirements of regulated environments such as banking, healthcare, and government, organizations often need to route network traffic through fixed IP addresses for allowlisting. You can use Tailscale for this task, by setting up a [subnet router][docs-subnet-routers] and providing the regulated environment with a static egress IP address.

In this guide, you will update your [tailnet policy file][docs-tailnet-policy-file] to restrict access to your cloud VM, configure and run a cloud VM to route requests to the regulated environment, and update the regulated environment's IP address allowlist to accept traffic only from the cloud VM. When you finish this guide, you'll have set access restrictions to let only your tailnet users access the regulated environment.

## Update your tailnet policy file

Configure your [tailnet policy file][docs-tailnet-policy-file] to securely route tailnet traffic to your regulated environment. You need to make the following updates to your tailnet policy file:

* Create a tag to use for your cloud VM, which will connect your tailnet users to your regulated environment.
* Create a group to ensure only specific users route traffic through the cloud VM.
* Create a grant that lets your tailnet users access the cloud VM to reach your regulated environment.

> **Note:**
>
> You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to edit a tailnet policy file.

### Create a tag

Tailscale [tags][docs-tags] let you authenticate and identify non-user devices. A tag consists of an identifier and the users and groups that can apply the tag. Create a `tag:regulated-egress-node` tag so that you and other admins can apply the tag to the cloud VMs you want to use as subnet routers.

1. Go to the [Visual editor](https://console.tailscale.com/admin/acls/visual) tab of the admin console.

2. Select **Tags**, and then select **Create tag**.

3. For **Tag name**, enter `regulated-egress-node`.

4. For **Tag owner**, select `autogroup:admin`.

5. (Optional) For **Note**, enter any note you'd like to keep for this tag.

6. Select **Save tag**.

Now that you have the tag named `regulated-egress-node`, you can apply it to any device that you want to use for routing traffic to the regulated environment.

### Create a group

Tailscale [groups][docs-policy-file-groups] let you create groups of users, which you can use in access rules (instead of listing users out explicitly). Create a group named `regulated-access-users` so that you can add all of your intended regulated environment users into a single group.

1. Go to the [Visual editor](https://console.tailscale.com/admin/acls/visual) tab of the admin console.

2. Select **Groups**, and then select **Create group**.

3. For **Group name**, enter `regulated-access-users`.

4. For **Members**, add the set of users in your tailnet for which you want to provide access to the regulated environment. You can add users by name, group, or use an [`autogroup`][docs-targets-and-selectors-autogroups], such as `autogroup:member` if you want all members of your tailnet to access the regulated environment.

5. (Optional) For **Note**, enter any note you'd like to keep for this group.

6. Select **Save group**.

Now that you have the `regulated-access-users` group, you can use it to provide access to the cloud VM.

### Create a grant

Add a [`grants`][docs-grants] rule to route traffic through the cloud VM for allowed users.

1. Go to the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.

2. If you don't already have a `grants` section, create it.

3. Within the `grants` section, create a new `grant`:

   ```json
   "grants": [
     {
       "src": ["group:regulated-access-users"],
       "dst": ["1.2.3.4/32"],
       "ip": ["*"],
       "via": ["tag:regulated-egress-node"]
     }
   ]
   ```

   In this grant example:

   * `src` is the group you set up for your tailnet users that need access to the regulated environment.
   * `dst` is the range of IP addresses for the regulated environment. Replace `"1.2.3.4/32"` with the actual values for your regulated environment.
   * `ip` is the set of IP protocols and ports. In this case, all protocols and all ports.
   * `via` is how the source (`src`) routes to the destination (`dst`). In this case, the traffic routes through the cloud VMs that have the tag `tag:regulated-egress-node`.

4. Select **Save**.

## Configure the cloud VM

Set up the cloud VM so that it routes traffic to the regulated environment.

1. Refer to your cloud provider's documentation for setting up a cloud VM with Linux as the operating system. Ensure the VM has a static IP address.

2. On the Linux device, run the Tailscale install script:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

   This script detects your Linux distribution and installs Tailscale using the appropriate package manager. It works on a variety of Linux platforms. For distributions not covered by the script, refer to [Install Tailscale on Linux][docs-install-linux] for alternative installation methods.

3. Subnet routers must have IP forwarding enabled so they can route traffic between the tailnet and the local network. Run the following commands to enable IP forwarding and make it persistent across reboots:

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

4. Run the [`tailscale up`][docs-up] command on the cloud VM:

   ```bash
   sudo tailscale up --advertise-routes=198.51.100.5/32 --advertise-tags=tag:regulated-egress-node
   ```

   Replace `198.51.100.5/32` with the actual IP address values of the regulated environment network you want to advertise.

5. The command outputs a URL. Open the URL in a browser, log in with your identity provider, and authorize the device. Once authorized, the device joins your tailnet and begins advertising routes to the specified subnet.

> **Tip:**
>
> For headless servers where you can't open a browser locally, copy the URL and open it on any other device. The authorization applies to the cloud VM regardless of which device you use to complete it.

Advertised subnet routes must be approved before other devices can use them.

1. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Select the  icon next to the cloud VM, then select **Edit subnet routes**.
3. Enable the routes you want to approve and select **Save**.

## Allowlist the cloud VM IP address

Provide the regulated environment with the cloud VM's static IP address.

1. Retrieve the cloud VM IP address from your cloud provider management console. Your cloud provider controls this IP address, not Tailscale.

2. Update your regulated environment's set of allowlisted IP addresses to contain the cloud VM IP address. For guidance, refer to the regulated environment's documentation for allowlisting IP addresses.

3. On Linux devices in your tailnet that need to reach services on the advertised subnet, run the following to accept the routes:

```bash
tailscale set --accept-routes
```

Tailscale clients on other operating systems accept subnet routes by default.

Your tailnet users should now be able to connect to the regulated environment.

## (Optional) Keep the cloud VM persistently connected

For servers and other always-on devices, consider disabling key expiry to prevent the subnet router from needing to re-authenticate periodically, which would interrupt connectivity for any device using it.

To disable key expiry, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the  icon next to the device, then select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry reduces security and can expose your network if the device or key is compromised. Only do this for trusted devices and revoke the key immediately if the device is lost or replaced. For more information, refer to [Key expiry][docs-key-expiry].

You can also verify that the `tailscaled` service is configured to start automatically on boot:

```bash
sudo systemctl enable --now tailscaled
```

Your Linux device now acts as a subnet router with a stable, persistent egress IP address. Any tailnet device that connects to services on the regulated environment subnet will appear to those services as coming from the subnet router's local IP address, regardless of where that device is physically located. You can allowlist that egress IP address in services, APIs, or firewalls on the local network with confidence that it will not change.

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#groups

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-and-selectors-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-up]: /docs/reference/tailscale-cli/up
