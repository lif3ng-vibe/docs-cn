---
title: "Enable Operator debug endpoints"
description: "If enabled, the debug endpoints are available on a container port named \"debug\". The endpoints include `/debug/metrics` and `/debug/pprof/` paths from Go's [`net/http/pprof`][xt-go-pprof] library."
---

Last validated Jun 5, 2026

> **Warning:**
>
> Debug endpoints are unstable, may change without notice, and Tailscale does not recommend debug endpoints for production use.
>
> If you rely on the debug metrics (at `/debug/metrics`), you must explicitly enable the following debug option before upgrading to v1.82, which always defaults debug to disabled.

If enabled, the debug endpoints are available on a container port named "debug". The endpoints include `/debug/metrics` and `/debug/pprof/` paths from Go's [`net/http/pprof`][xt-go-pprof] library.

To maintain backward compatibility, debug endpoints default to enabled if `.spec.metrics.enable` is set to `true`. If `.spec.metrics.enable` is set to `false`, the debug endpoints default to disabled.

In Tailscale v1.82 and later, the debug endpoints always default to disabled. You can override the default for debug endpoints using `ProxyClass`:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyClass
metadata:
  name: prod
spec:
  metrics:
    enable: true
  statefulSet:
    pod:
      tailscaleContainer:
        debug:
          enable: false
```

[xt-go-pprof]: https://pkg.go.dev/net/http/pprof
