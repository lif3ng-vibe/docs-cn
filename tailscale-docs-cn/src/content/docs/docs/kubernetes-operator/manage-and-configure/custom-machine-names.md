---
title: "为入站和出站代理使用自定义机器名"
description: "集群入站和出站代理支持覆盖它们向 Tailscale 注册时通告的主机名。对于 `Service`，你可以使用 `tailscale.com/hostname` 注解设置自定义主机名"
---

最后验证于 Jun 5, 2026

集群入站和出站代理支持在向 Tailscale 注册时覆盖其通告的主机名。对于 `Service`，你可以使用 `tailscale.com/hostname` 注解设置自定义主机名。对于 `Ingress`，你可以使用 `.spec.tls.hosts` 字段设置自定义主机名。只会使用第一个值。

这只是设置设备报告的自定义操作系统（OS）主机名。如果网络中已有同名设备，实际的机器名[会有所不同][docs-machine-names-how-names-determined]。

机器名受 DNS 约束：最长 63 个字符，必须以字母开头和结尾，并且只能由字母、数字和 `-` 组成。

[docs-machine-names-how-names-determined]: /docs/concepts/machine-names#how-machine-names-are-determined
