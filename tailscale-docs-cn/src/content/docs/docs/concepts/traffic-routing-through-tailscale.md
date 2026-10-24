---
title: "Is my traffic routed through your servers?"
description: "Understand how Tailscale makes routing decisions and when your traffic is routed through our DERP servers."
---

Last validated Jan 5, 2026

No.

Tailscale routes traffic over the shortest path possible. In most cases,
this is a direct, peer-to-peer connection.

In cases where a direct connection cannot be established, devices will
communicate by bouncing traffic off of one or more geographically
[distributed relay servers][bl-how-tailscale-derp], called DERPs. The traffic that bounces
through our relay servers is encrypted and no different security-wise than
the other dozen hops your internet packets already make when passing over
the network from point A to B.

[bl-how-tailscale-derp]: https://tailscale.com/blog/how-tailscale-works#encrypted-tcp-relays-derp
