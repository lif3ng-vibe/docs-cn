---
title: "排查 Tailscale 域名与站点无法访问的问题"
description: "如果你的网络和互联网连接一切正常，却无法访问任何 Tailscale 站点（包括公司官网、文档和管理控制台），原因可能是我们被错误地加入了某个互联网黑名单。"
---

最后验证于 Mar 16, 2026

如果你的网络和互联网连接一切正常，却无法访问任何 Tailscale 站点（包括公司官网、文档和管理控制台），原因可能是我们被错误地加入了某个互联网黑名单。为防止我们的站点被 DNS 临时封锁，我们建议在你的 DNS 服务白名单中加入以下条目。

```shell
*.tailscale.com
*.tailscale.io
```

我们支持多种多样的 DNS 服务，包括 [Control D][docs-controld]、[Linux DNS][docs-linux-dns]、[NextDNS][docs-nextdns] 以及 [OPNsense 中的 Unbound DNS][docs-unbound-dns]。

[docs-controld]: /docs/integrations/control-d

[docs-linux-dns]: /docs/reference/linux-dns

[docs-nextdns]: /docs/integrations/nextdns

[docs-unbound-dns]: /docs/integrations/firewalls/opnsense-unbound
