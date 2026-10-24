---
title: "Deprecate complex physical network (wired and Wi-Fi) security schemes"
description: "Use Tailscale to move off of complex physical networks."
---

Last validated Jan 5, 2026

People used to believe that security happened at the physical network layer:
stop someone from getting into your office, so they can't plug into the
Ethernet, so they can't hack your internal servers.

Then Wi-Fi happened, and now your network signal leaks outside your walls.
WPA2-Personal (with only one password shared by everyone) isn't good enough
for corporate networks, so then you have to deploy a certificate authority,
RADIUS, and WPA2-Enterprise, a complex set of machinery that's hard to
integrate with typical corporate identity systems and works differently with
every brand of user device or Wi-Fi router.

Instead, let Tailscale move your devices off the "corporate" network and
into the virtual world. Without a policy-compliant, encrypted, multifactor
authenticated Tailscale connection, nobody can reach your servers even from
your office Wi-Fi network, which means your office Wi-Fi network is no longer
a risk.
