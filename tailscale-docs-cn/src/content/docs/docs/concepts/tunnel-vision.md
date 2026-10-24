---
title: "TunnelVision vulnerability and Tailscale"
description: "Understand the TunnelVision network vulnerability warning pop-up on macOS, and how to manage it."
---

Last validated Oct 29, 2025

TunnelVision is an attack that abuses legitimate network configuration tools that can potentially be exploited by malicious actors.

If the TunnelVision vulnerability is detected on a macOS device running the Tailscale client, the following pop-up notification will display:

*（图：Tailscale client warning that the TunnelVision vulnerability was detected）*

If you receive this notification on macOS, a setting called DHCP option 121 was detected and is used on the network you connected to. Although the network might be using DHCP option 121 for non-malicious purposes, there's a possibility that someone might have tried to exploit it to perform this attack.

> **Note:**
>
> On macOS and iOS devices, Tailscale cannot override DHCP option 121. This issue is not known to impact tvOS.

## How the attack works

Most computer networks use a service called Dynamic Host Configuration Protocol (DHCP). DHCP acts as a helpful guide on your local network by assigning addresses to devices as they join and ensuring they know where to send and receive information. Typically, DHCP is used solely to assign addresses, DNS name servers, and a single default route. However, it can also provide instructions (known as DHCP options) to devices when they join the network. These instructions may indicate to your device what services are available on the network, and how to use them automatically.

A TunnelVision attack occurs when someone maliciously uses a network setting known as DHCP option 121 on your local network to instruct devices to send data to the attacker when it should have gone to your tailnet or a site on the internet instead.

## How to take action

### Home networks

If you're using a home network, check your network configuration and ensure DHCP option 121 is not being used. Your internet provider might also have enabled DHCP option 121 for you. If that's the case, you can safely select **Keep Tailscale Running** and check **Don't warn me again** to hide these warning messages.

### Work networks

If you're using a work network and receive the pop-up notification, contact your network administrator and notify them that Tailscale has detected DHCP option 121 in use. Your administrator can determine whether the warning was a false positive. Your administrator may also disable the warnings using a [Tailscale system policy][docs-mdm-keys].

### Public networks

If you're using a public network such as one in a coffee shop or co-working space, and you receive the pop-up notification, we recommend that you select **Disconnect** and connect to a different network.

## Additional information

For more in-depth information, refer to our blog post [Tailscale and TunnelVision: our analysis][bl-tunnelvision-analysis].

[bl-tunnelvision-analysis]: https://tailscale.com/blog/tunnelvision-analysis

[docs-mdm-keys]: /docs/features/tailscale-system-policies
