---
title: "排查 Sunrise Communications 问题"
description: "Sunrise Communications 似乎正在封锁 Tailscale 服务。"
---

最后验证于 Mar 16, 2026

Sunrise Communications 似乎正在封锁 Tailscale 服务。

具体来说，Tailscale 被 Sunrise 的 [Surf Protect][xt-sunrise-surf-protect]（错误地）标记为了潜在恶意应用。

要使用 Tailscale，你需要与 Sunrise 支持团队协商解决：

* 找到你的 Sunrise 站点 ID。
* 通过 [Sunrise 支持][xt-sunrise-support]联系 Sunrise 支持团队，请他们将 `*.tailscale.com` 和 `*.tailscale.io` 加入你的 Surf Protect 订阅的排除列表。如果你愿意，也可以从账户中移除 Surf Protect。

[xt-sunrise-support]: https://www.sunrise.ch/en/residential/help/kontakt.html

[xt-sunrise-surf-protect]: https://www.sunrise.ch/en/residential/mobile/freedom/options/surf-protect1/surf-protect-home.html
