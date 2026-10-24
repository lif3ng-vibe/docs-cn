---
title: "Share a private game server with friends"
description: "Hosting a game server for friends traditionally means either paying for third-party hosting or opening ports in your firewall, exposing your server to anyone on the internet. With Tailscale, you can s"
---

Last validated May 18, 2026

> **Note:**
>
> Featured solution guide:
>
> [**Run a private Minecraft server with Tailscale**](/docs/solutions/set-up-minecraft) — Share a Minecraft server with the people you want from anywhere.

Hosting a game server for friends traditionally means either paying for third-party hosting or opening ports in your firewall, exposing your server to anyone on the internet. With Tailscale, you can share a game server privately with just the people you want, from anywhere, without opening a single port or touching a firewall rule.

Tailscale connects devices peer-to-peer over encrypted connections, and its [node sharing feature][docs-sharing] lets friends outside your network access your server securely — no public IP, no complex configuration required.

## Install Tailscale on the game server (Linux)

1. Run the automated install script:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Start and authenticate Tailscale:

   ```bash
   sudo tailscale up
   ```

   The command displays a URL. Open it in a browser to authenticate the machine to your tailnet.

3. Verify the machine appears in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

4. To confirm the assigned Tailscale IP address, run:

   ```bash
   tailscale ip
   ```

   This is the IP address your friends will use to connect to the server.

## Lock down the server firewall

Configure the server's firewall to only allow game traffic over the Tailscale interface (`tailscale0`), blocking direct internet access to the game port. This ensures only tailnet members can connect.

On Ubuntu, use `ufw` to lock down the server so that only Tailscale traffic is accepted, with port `25565` (Minecraft) as the example game server port:

1. Set default rules: deny all incoming, allow all outgoing

   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```

   The `ufw default deny incoming` rule is what blocks public internet access to your game server's port.

2. Allow all traffic on the Tailscale interface

   ```bash
   sudo ufw allow in on tailscale0
   ```

3. Allow Tailscale's own UDP port (needed for peer-to-peer connectivity)

   ```bash
   sudo ufw allow 41641/udp
   ```

4. Enable the firewall

   ```bash
   sudo ufw enable
   ```

In this example, the game port `25565` is never explicitly opened to the public internet and is only reachable through the `tailscale0` interface, which is restricted to your tailnet members.

> **Tip:**
>
> Tailscale installs its own iptables rules directly, bypassing `ufw`, so the `tailscale0` interface may already be open even before running `sudo ufw allow in on tailscale0`.

## Share the server with friends

Friends need their own Tailscale accounts to receive an invitation, so ask them to sign up for Tailscale accounts. Once they have their accounts, use the following steps to share your server:

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Find the game server machine, open the **…** menu, and select **Share**.
3. Either:
   * **Share by email**: Enter each friend's email address and select **Share** to send individual invite links.
   * **Share by link**: Select **Copy invite link**, optionally toggle **Reusable link** (usable up to 1,000 times), then copy and send the link to friends.
4. Wait for each friend to accept the invite. Once accepted, the shared machine will appear in their Tailscale client as if it were on their own tailnet.

> **Tip:**
>
> Shared machines are quarantined by default; they can receive incoming connections from friends, but cannot establish outbound connections to friends' tailnets.

Then have your friend connect to the server:

1. Install Tailscale and sign in.
2. Accept the invite link received.
3. In the game client, enter the server's Tailscale IP address and the appropriate game port.

Your friends can now connect to your private game server, and you've kept it safe and secure from potential attackers.

[docs-sharing]: /docs/features/sharing
