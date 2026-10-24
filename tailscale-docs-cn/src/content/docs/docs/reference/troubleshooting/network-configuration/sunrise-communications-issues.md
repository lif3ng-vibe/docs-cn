---
title: "Troubleshoot Sunrise Communications issues"
description: "It appears that Sunrise Communications is blocking the Tailscale service."
---

Last validated Mar 16, 2026

It appears that Sunrise Communications is blocking the Tailscale service.

Specifically, Tailscale has been (incorrectly) flagged by Sunrise's [Surf Protect][xt-sunrise-surf-protect] as a potentially malicious application.

To use Tailscale, you'll need to work with Sunrise support:

* Find your Sunrise site ID.
* Contact Sunrise support at [Sunrise support][xt-sunrise-support], and ask that `*.tailscale.com` and `*.tailscale.io` be added to the exclusion list for your Surf Protect subscription. Alternately if desired, you could remove Surf Protect from your account.

[xt-sunrise-support]: https://www.sunrise.ch/en/residential/help/kontakt.html

[xt-sunrise-surf-protect]: https://www.sunrise.ch/en/residential/mobile/freedom/options/surf-protect1/surf-protect-home.html
