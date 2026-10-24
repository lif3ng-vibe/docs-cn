---
title: "Use custom machine names for ingress and egress proxies"
description: "Cluster ingress and egress proxies support overriding the hostname they announce while registering with Tailscale. For `Service`, you can set a custom hostname using a `tailscale.com/hostname` annotat"
---

Last validated Jun 5, 2026

Cluster ingress and egress proxies support overriding the hostname they announce while registering with Tailscale. For `Service`, you can set a custom hostname using a `tailscale.com/hostname` annotation. For `Ingress`, you can set a custom hostname using the `.spec.tls.hosts` field. Only the first value will be used.

This only sets a custom operating system (OS) hostname reported by the device. The actual machine name [will differ][docs-machine-names-how-names-determined] if a device is on the network with the same name.

Machine names are subject to the constraints of DNS. They can be up to 63 characters long, must start and end with a letter, and consist of only letters, numbers, and `-`.

[docs-machine-names-how-names-determined]: /docs/concepts/machine-names#how-machine-names-are-determined
