---
title: "启用 Operator 调试端点"
description: "如果启用，调试端点将通过名为 \"debug\" 的容器端口提供。这些端点包括来自 Go [`net/http/pprof`][xt-go-pprof] 库的 `/debug/metrics` 和 `/debug/pprof/` 路径。"
---

最后验证于 Jun 5, 2026

> **警告：**
>
> 调试端点不稳定，可能在不另行通知的情况下变更，Tailscale 不建议在生产环境中使用调试端点。
>
> 如果你依赖调试指标（位于 `/debug/metrics`），在升级到 v1.82（该版本起调试始终默认禁用）之前，必须显式启用以下调试选项。

如果启用，调试端点将通过名为 "debug" 的容器端口提供。这些端点包括来自 Go [`net/http/pprof`][xt-go-pprof] 库的 `/debug/metrics` 和 `/debug/pprof/` 路径。

为了保持向后兼容，如果 `.spec.metrics.enable` 设为 `true`，调试端点默认启用。如果 `.spec.metrics.enable` 设为 `false`，调试端点默认禁用。

在 Tailscale v1.82 及更高版本中，调试端点始终默认禁用。你可以使用 `ProxyClass` 覆盖调试端点的默认值：

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
