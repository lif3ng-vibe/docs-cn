---
title: "使用 Kubernetes Gateway API 和 Tailscale 的自定义域名排障"
description: "如果你的自定义域名无法正确解析，请检查以下各项："
---

最后验证于 Jan 5, 2026

## DNS 解析失败

如果你的自定义域名无法正确解析，请检查以下各项：

* **验证 split DNS 配置**：前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面，确认你的自定义域名的配置正确，即指向内部 DNS 解析器的 IP 地址，并且已启用 **Restrict to search domain**。
* **检查 DNS 解析器的可访问性**：从一台 Tailscale 设备验证你的内部 DNS 解析器可以访问。如果你的 DNS 解析器位于另一个子网，请确保已配置并通告了[子网路由器][docs-subnets]。
* **确认 DNS 记录存在**：检查 ExternalDNS 是否已在你的 DNS 解析器中创建了权威 DNS 记录。具体方法取决于你的 DNS 提供商（对于 Pi-hole，请在 Web 界面的 Local DNS > CNAME Records 下检查）。
* **查看 ExternalDNS 日志**：检查是否有错误能表明 DNS 记录未被创建的原因：

```shell
kubectl logs -n tailscale deployment/external-dns
```

常见问题包括凭证错误、与 DNS 服务器的连接问题或域名过滤器配置错误。

## TLS 证书问题

如果你遇到与证书相关的错误，请尝试以下步骤：

* **检查 cert-manager 日志**：查看日志中是否有证书签发错误：

```shell
kubectl logs -n cert-manager deployment/cert-manager
```

* **验证 ClusterIssuer 配置**：确保你的 ClusterIssuer 配置正确并已就绪：

```shell
kubectl get clusterissuer
```

状态应显示 `Ready: True`。

* **检查证书状态**：验证证书是否已成功签发：

```shell
kubectl get certificate -A
```

查找你的 Gateway 的 `certificateRefs` 中引用的证书。它应显示 `Ready: True`。

* **检查证书 Secret**：确保证书 Secret 存在于预期的命名空间中：

```shell
kubectl get secret app-example-com-tls -n tailscale
```

如果 Secret 缺失，请检查 Certificate 资源的事件以找出错误：

```shell
kubectl describe certificate app-example-com-tls -n tailscale
```

## Gateway 未接收到流量

如果 Gateway 未接收到来自你 tailnet 的请求，请验证以下各项：

* **检查 Tailscale IP 分配**：确认 Envoy 服务已被分配了 Tailscale IP 地址：

```shell
kubectl get svc -n tailscale -l gateway.envoyproxy.io/owning-gateway-name
```

`EXTERNAL-IP` 字段应显示一个 Tailscale IP 地址（通常在 `100.x.x.x` 网段）。

* **验证 LoadBalancer 状态**：检查 LoadBalancer 服务是否显示为就绪：

```shell
kubectl get svc -n tailscale
```

查找 Envoy Gateway 服务，并确保它已被分配外部 IP。

* **检查 ACL 策略**：验证你的 Tailscale ACL 策略是否允许设备与 Gateway 之间的流量。检查管理控制台中的 [Access controls](https://console.tailscale.com/admin/acls)，确保存在允许端口 443（如果使用 HTTP 重定向还包括 80）上流量的规则。

* **检查 Gateway 状态**：验证 Gateway 是否已正确编程：

```shell
kubectl describe gateway custom-domain-gateway -n tailscale
```

在 status 部分查找任何错误状态。

* **从 tailnet 测试连通性**：从 tailnet 中的一台设备尝试直接连接 Gateway 的 Tailscale IP：

```shell
curl https://<gateway-tailscale-ip>
```

如果这样能成功，但自定义域名不行，那么问题很可能出在 DNS 解析，而不是 Gateway 连接。

## `HTTPRoute` 不工作

如果你的 `HTTPRoute` 没有正确路由流量：

* **验证 `HTTPRoute` 已被接受**：检查你的 `HTTPRoute` 的状态：

```shell
kubectl get httproute -n default app-route -o yaml
```

查找表明该路由是否被 Gateway 接受的条件。

* **检查命名空间权限**：如果使用跨命名空间路由，请确保 `HTTPRoute` 所在的命名空间带有与 Gateway 的 `allowedRoutes` 选择器匹配的标签。

* **验证后端服务**：确保你的后端服务存在并已就绪：

```shell
kubectl get svc app-service -n default
```

检查支撑该服务的 Pod 是否正在运行：

```shell
kubectl get pods -n default -l <service-selector>
```

## ExternalDNS 未创建记录

如果 ExternalDNS 没有创建 DNS 记录：

* **验证 Gateway 标签**：确保你的 Gateway 带有 ExternalDNS 所过滤的标签：

```shell
kubectl get gateway custom-domain-gateway -n tailscale -o yaml | grep "external-dns"
```

该标签应为 `external-dns: enabled`（或与你配置的过滤器相匹配）。

* **检查 ExternalDNS 配置**：验证 ExternalDNS 正在监视正确的源和域名：

```shell
kubectl get deployment external-dns -n tailscale -o yaml
```

查找 `--source`、`--domain-filter` 和 `--gateway-label-filter` 参数。

* **检查 ExternalDNS 权限**：如果使用 RBAC，请确保 ExternalDNS 有权读取 Gateway 和 `HTTPRoute` 资源：

```shell
kubectl auth can-i list gateways.gateway.networking.k8s.io \
  --as=system:serviceaccount:tailscale:external-dns
```

[docs-subnets]: /docs/features/subnet-routers
