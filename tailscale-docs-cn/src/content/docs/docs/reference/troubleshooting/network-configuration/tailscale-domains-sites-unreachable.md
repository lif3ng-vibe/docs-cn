---
title: "Troubleshoot Tailscale domains and sites unreachable"
description: "If your network and internet connectivity are working as expected, but you cannot reach any of the Tailscale sites, including our corporate site, documentation, and admin console, this may be because "
---

Last validated Mar 16, 2026

If your network and internet connectivity are working as expected, but you cannot reach any of the Tailscale sites, including our corporate site, documentation, and admin console, this may be because we were erroneously added to an internet blocklist. To prevent temporary DNS blocking to our sites, we recommend adding the following entries to your DNS service allowlists.

```shell
*.tailscale.com
*.tailscale.io
```

We support a wide variety of DNS services, including [Control D][docs-controld], [Linux DNS][docs-linux-dns], [NextDNS][docs-nextdns], and [Unbound DNS in OPNsense][docs-unbound-dns].

[docs-controld]: /docs/integrations/control-d

[docs-linux-dns]: /docs/reference/linux-dns

[docs-nextdns]: /docs/integrations/nextdns

[docs-unbound-dns]: /docs/integrations/firewalls/opnsense-unbound
