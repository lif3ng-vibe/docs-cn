---
title: "在 Kubernetes Gateway API 中搭配 Tailscale 使用自定义域名"
description: "使用 Kubernetes Gateway API、ExternalDNS 和自动化 TLS 证书管理，为通过 Tailscale 暴露的服务配置自定义域名。"
---

最后验证于 Jan 5, 2026

## 简介

虽然 Tailscale 通过 MagicDNS 提供了 `*.ts.net` 域名的自动 DNS，但你可能需要为你通过 Tailscale 网络（称为 tailnet）暴露的服务使用自己的自定义域名（例如 `app.example.com`）。例如，在把现有服务迁移到 Tailscale、满足组织对域名命名规范的要求，或用你自己的证书终结 TLS 而不依赖 Tailscale 内置 HTTPS 时，自定义域名就很有用。

本指南介绍如何将 [Kubernetes Gateway API][xt-k8s-gateway-api] 与 Tailscale 集成，为你的服务启用自定义域名，并在 Gateway 层完成完整的 [TLS 终结][xt-tls-termination]。你将配置 [Envoy Gateway][xt-envoy-gateway] 作为你的 Gateway API 实现来终结 TLS 连接，使用 [ExternalDNS][xt-external-dns] 在你的内部 DNS 解析器中自动管理 DNS 记录，并用 [cert-manager][xt-cert-manager] 来供应和续期 TLS 证书。Gateway 使用你的自定义域名证书来终结 TLS，让你完全掌控 TLS 配置和证书管理。

本方案使用一个为你的自定义域名保存本地权威记录的 DNS 解析器，让你可以定义只存在于 tailnet 中的域名记录。这种方式在保持 [Tailscale 安全模型][co-security]的同时，让你完全掌控域名和 TLS 终结。

读完本指南，你将拥有一套完全自动化的系统：创建 Gateway 资源就会自动在你的内部 DNS 解析器中为你的域名供应权威 DNS 记录并获取 TLS 证书，从而让你能通过自定义域名在整个 tailnet 中安全地访问你的服务。

*（图：架构图，展示流量从 Tailscale 客户端经 MagicDNS 到保存本地权威记录的内部 DNS 解析器，再到终结 TLS 并通过 Tailscale LoadBalancer 暴露的 Envoy Gateway，最后路由到 Kubernetes 中的后端服务。）*

## 前提条件

完成本指南之前，请确保你具备以下条件：

* 一个拥有管理权限的 Kubernetes 集群
* 一个拥有 [Admin](/docs/reference/user-roles) 权限的 [Tailscale 账户](https://login.tailscale.com/start)
* 集群中已安装 [Tailscale Kubernetes Operator][docs-operator-install]
* 已为 Tailscale Kubernetes Operator [配置 OAuth 凭证][docs-operator-oauth]
* 已安装 [Envoy Gateway][xt-envoy-gateway] 作为你的 Gateway API 实现
* 已部署 [ExternalDNS][xt-external-dns] 并针对你的 DNS 提供方完成配置
* 已安装 [cert-manager][xt-cert-manager] 并配置好 ClusterIssuer
* 一个具备本地权威解析能力的内部 DNS 解析器（例如 [CoreDNS][xt-coredns]、[BIND][xt-bind]、[Pi-hole][xt-pihole] 或云提供商的私有 DNS 区域），并且它：
  * 可以从你的 Tailscale 设备访问（如有需要，可通过[子网路由器][docs-subnets]）
  * 可由 [ExternalDNS][xt-external-dns] 管理，为你的自定义域名创建权威记录

## 第 1 步：配置 Tailscale 拆分 DNS

要在 tailnet 中解析 `app.example.com` 这类自定义域名，你需要配置 Tailscale 的 MagicDNS，把你域名的查询转发到你的内部 DNS 解析器。这一[拆分 DNS][docs-split-dns]配置确保 Tailscale 设备能够使用本地权威记录解析你的自定义域名，同时保持其他域名的正常 DNS 解析。

配置拆分 DNS：

1. 前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 选择 **Add nameserver**（添加名称服务器）> **Custom**（自定义）。
3. 输入将保存你域名权威记录的内部 DNS 解析器的 IP 地址。
4. 启用 **Restrict to search domain**（限制到搜索域）。
5. 输入你的自定义域名（例如 `example.com`）。
6. 保存更改。

采用这一配置后，当 Tailscale 设备查询 `app.example.com` 时，MagicDNS 会把请求转发到你的内部 DNS 解析器。ExternalDNS 在这个解析器中维护权威 DNS 记录，指向你的 Envoy Gateway 的 Tailscale 主机名。

## 第 2 步：配置 EnvoyProxy 与 Tailscale 集成

EnvoyProxy 资源配置 Envoy Gateway 如何暴露其服务。通过指定 Tailscale 作为 LoadBalancer 提供方，你可以让 Envoy 通过你的 tailnet 被访问。

创建一个 `EnvoyProxy` 资源，配置 Envoy 使用 Tailscale 作为其 LoadBalancer 提供方：

```yaml
apiVersion: gateway.envoyproxy.io/v1alpha1
kind: EnvoyProxy
metadata:
  name: tailscale-proxy
  namespace: tailscale
spec:
  provider:
    type: Kubernetes
    kubernetes:
      envoyService:
        type: LoadBalancer
        loadBalancerClass: tailscale
        annotations:
          tailscale.com/hostname: gateway-envoy
```

`tailscale.com/hostname` 注解为 Envoy 服务分配一个特定的 Tailscale 主机名（例如 `gateway-envoy.example.com.ts.net`）。`loadBalancerClass: tailscale` 告诉 Kubernetes 使用 Tailscale Kubernetes Operator 来供应 LoadBalancer。

## 第 3 步：创建 GatewayClass

GatewayClass 定义管理 Gateway 资源的控制器，并把资源链接到配置参数。该资源把你的 Gateway 连接到你创建的 EnvoyProxy 配置。

定义一个链接到你的 EnvoyProxy 配置的 `GatewayClass`：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: tailscale
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
  parametersRef:
    group: gateway.envoyproxy.io
    kind: EnvoyProxy
    name: tailscale-proxy
    namespace: tailscale
```

## 第 4 步：部署 Gateway

Gateway 资源定义你的自定义域名的网络入口。它指定监听哪些域名、处理 TLS 终结，并与 cert-manager 集成以自动供应证书。

创建一个在你的自定义域名上监听 HTTPS 流量的 `Gateway` 资源：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: custom-domain-gateway
  namespace: tailscale
  labels:
    external-dns: enabled
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  gatewayClassName: tailscale
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "app.example.com"
      allowedRoutes:
        namespaces:
          from: All
      tls:
        mode: Terminate
        certificateRefs:
        - group: ''
          kind: Secret
          name: app-example-com-tls
```

关键配置元素：

* `external-dns: enabled` 标签让 ExternalDNS 能够发现并处理这个 Gateway。
* `cert-manager.io/cluster-issuer` 注解指定使用哪个 ClusterIssuer 来签发 TLS 证书。
* `hostname` 字段定义这个监听器处理哪个域名。
* `certificateRefs` 指向 cert-manager 存储 TLS 证书的 Secret。

## 第 5 步：把流量路由到你的服务

Gateway 基础设施就绪后，创建一个 `HTTPRoute` 把流量引导到你的后端服务：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: app-route
  namespace: default
spec:
  parentRefs:
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: custom-domain-gateway
      namespace: tailscale
  hostnames:
    - "app.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - group: ""
          kind: Service
          name: app-service
          port: 80
```

这条路由配置：

* 通过 `parentRefs` 链接到你的 Gateway。
* 指定要匹配的主机名。
* 把所有流量（路径 `/`）路由到你的后端服务。

## 第 6 步：配置 ExternalDNS 实现自动 DNS 管理

ExternalDNS 根据 Gateway 资源自动创建 DNS 记录。将它配置为监视带有特定标签的 Gateway，并在你的 DNS 解析器中创建权威记录。本例演示使用 [Pi-hole][xt-pihole] 作为具备本地权威解析能力的内部 DNS 解析器，在 tailnet 中同时提供广告拦截和自定义域名解析。

Pi-hole 需要能通过你的 tailnet 访问，这样 Tailscale 设备才能查询它进行 DNS 解析，ExternalDNS 也能管理它的记录。首先，为 Pi-hole 管理密码创建一个 Secret：

```shell
kubectl create secret generic pihole-admin \
  --from-literal=password='your-secure-password' \
  -n tailscale
```

使用 Helm 安装 Pi-hole 并通过 Tailscale 暴露它：

```shell
helm repo add pihole https://mojo2600.github.io/pihole-kubernetes/
helm repo update

helm install pihole pihole/pihole \
  --namespace tailscale \
  --set admin.existingSecret=pihole-admin \
  --set admin.passwordKey=password \
  --set serviceDns.mixedService=true \
  --set serviceDns.type=LoadBalancer \
  --set serviceDns.loadBalancerClass=tailscale \
  --set 'serviceDns.annotations.tailscale\.com/hostname=pihole-dns' \
  --set extraEnvVars.FTLCONF_dns_listeningMode=all
```

这一配置通过 Tailscale 在 `pihole-dns.example.com.ts.net` 上暴露 Pi-hole 的 DNS 服务。Pi-hole 运行并可通过 tailnet 访问后，部署 ExternalDNS 来管理它的记录。ExternalDNS 监视你的 Gateway 资源，并在 Pi-hole 中自动创建 DNS 记录，把你的自定义域名指向 Gateway 的 Tailscale 地址：

```shell
helm repo add external-dns https://kubernetes-sigs.github.io/external-dns
helm repo update

helm install external-dns external-dns/external-dns \
  --namespace tailscale \
  --set provider=pihole \
  --set 'extraArgs[0]=--pihole-server=http://pihole-web.tailscale' \
  --set 'extraArgs[1]=--pihole-api-version=6' \
  --set 'extraArgs[2]=--gateway-label-filter=external-dns==enabled' \
  --set policy=sync \
  --set 'sources[0]=gateway-httproute' \
  --set 'domainFilters[0]=example.com' \
  --set-string env[0].name=EXTERNAL_DNS_PIHOLE_PASSWORD \
  --set env[0].valueFrom.secretKeyRef.name=pihole-admin \
  --set env[0].valueFrom.secretKeyRef.key=password
```

这一配置会监视带有 `external-dns: enabled` 标签的 Gateway，为 `HTTPRoute` 中的主机名创建 DNS 记录，并且只管理 `example.com` 域名的记录。

## 第 7 步：验证你的配置

部署全部组件后，验证你的自定义域名设置工作正常。首先，检查 Gateway 资源是否已成功创建并准备好接受流量：

```shell
kubectl get gateway custom-domain-gateway -n tailscale
```

Gateway 应显示为 `Programmed` 并分配了地址。Gateway 就绪后，确认你的自定义域名能通过你设置的拆分 DNS 配置正确解析。在 tailnet 中的一台设备上运行：

```shell
nslookup app.example.com
```

它应解析为你 Envoy Gateway 的 Tailscale 接口 IP 地址。最后，测试端到端连通性，确认 HTTPS 流量能通过 Gateway 到达你的后端服务：

```shell
curl https://app.example.com
```

你应该会收到来自后端服务、带有有效 TLS 证书的响应。

## 故障排除

如果你在自定义域名设置中遇到问题，请参阅 [Troubleshoot custom domains with Kubernetes Gateway API and Tailscale][docs-operator-byod-gateway-api-troubleshooting] 获取详细的故障排除指南。

## 高级配置

以下配置演示 Gateway API 搭配 Tailscale 的高级用例。你可以通过自动把 HTTP 请求重定向到 HTTPS 来提升安全性。创建一个重定向所有 HTTP 流量的 `HTTPRoute`：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: tls-redirect
  namespace: tailscale
spec:
  parentRefs:
    - name: custom-domain-gateway
      sectionName: http
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect:
            scheme: https
            statusCode: 301
```

要启用这一重定向，在你的 Gateway 中已有的 HTTPS 监听器旁边添加一个 HTTP 监听器：

```yaml
listeners:
  - name: http
    port: 80
    protocol: HTTP
  - name: https
    protocol: HTTPS
    port: 443
    # ... rest of HTTPS configuration
```

你还可以在处理 HTTPS 流量的同一个 Gateway 上暴露 DNS 服务（例如 Pi-hole），提供统一入口。创建一个同时拥有 HTTPS 和 DNS 监听器的 Gateway：

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: unified-gateway
  namespace: tailscale
spec:
  gatewayClassName: tailscale
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "*.example.com"
      # ... TLS configuration
    - name: dns-udp
      protocol: UDP
      port: 53
      allowedRoutes:
        kinds:
        - kind: UDPRoute
    - name: dns-tcp
      protocol: TCP
      port: 53
      allowedRoutes:
        kinds:
        - kind: TCPRoute
```

添加这些监听器后，创建 `TCPRoute` 和 `UDPRoute` 资源，把 DNS 流量路由到你的 Pi-hole 服务：

```yaml
---
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: UDPRoute
metadata:
  name: pihole-dns-udp
spec:
  parentRefs:
    - name: unified-gateway
      sectionName: dns-udp
  rules:
    - backendRefs:
        - name: pihole-dns
          port: 53
---
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: TCPRoute
metadata:
  name: pihole-dns-tcp
spec:
  parentRefs:
    - name: unified-gateway
      sectionName: dns-tcp
  rules:
    - backendRefs:
        - name: pihole-dns
          port: 53
```

这一配置让客户端可以同时使用 Gateway 的 Tailscale IP 地址访问 HTTPS 服务和进行 DNS 解析。要在不同的自定义域名上暴露多个服务，请为每个域名配置单独的监听器，并使用各自的 TLS 证书：

```yaml
listeners:
  - name: app-https
    protocol: HTTPS
    port: 443
    hostname: "app.example.com"
    tls:
      mode: Terminate
      certificateRefs:
      - name: app-example-com-tls
  - name: api-https
    protocol: HTTPS
    port: 443
    hostname: "api.example.com"
    tls:
      mode: Terminate
      certificateRefs:
      - name: api-example-com-tls
```

与其为每个子域名单独管理证书，你也可以使用一张通配符证书：

```yaml
hostname: "*.example.com"
tls:
  certificateRefs:
  - name: wildcard-example-com-tls
```

默认情况下，`HTTPRoute` 只能引用同一命名空间中的后端服务。通过配置 Gateway 的 `allowedRoutes` 启用跨命名空间路由：

```yaml
allowedRoutes:
  namespaces:
    from: Selector
    selector:
      matchLabels:
        gateway-access: allowed
```

## 结语

你已成功使用 Kubernetes Gateway API 为通过 Tailscale 暴露的服务配置了自定义域名。这一设置提供了：

* **自动化 DNS 管理**：ExternalDNS 根据你的 Gateway 配置自动创建和更新 DNS 记录
* **自动 TLS 证书**：cert-manager 无需人工干预即可供应和续期证书
* **灵活路由**：Gateway API 支持精细的流量路由规则
* **安全访问**：所有流量都留在你的 tailnet 内，维持 Tailscale 的安全模型

这种架构在你添加更多服务时扩展性良好，只需新增 `HTTPRoute` 资源即可暴露更多应用。Tailscale 的安全网络与 Kubernetes Gateway API 的路由能力相结合，为内部服务暴露提供了一个稳健的平台。

要了解更高级的配置，请探索 [Gateway API 流量策略][xt-gateway-api-policies]，或根据你的具体需求[自定义 Tailscale Kubernetes Operator][docs-operator-customization]。

[xt-k8s-gateway-api]: https://kubernetes.io/docs/concepts/services-networking/gateway/

[xt-tls-termination]: https://en.wikipedia.org/wiki/TLS_termination_proxy

[xt-envoy-gateway]: https://gateway.envoyproxy.io/

[xt-external-dns]: https://github.com/kubernetes-sigs/external-dns

[xt-cert-manager]: https://cert-manager.io/docs/

[xt-coredns]: https://coredns.io/

[xt-bind]: https://en.wikipedia.org/wiki/BIND

[xt-pihole]: https://github.com/MoJo2600/pihole-kubernetes

[xt-gateway-api-policies]: https://gateway-api.sigs.k8s.io/guides/

[co-security]: https://tailscale.com/security

[docs-operator-install]: /docs/kubernetes-operator

[docs-operator-oauth]: /docs/kubernetes-operator/install-operator

[docs-subnets]: /docs/features/subnet-routers

[docs-split-dns]: /docs/reference/dns-in-tailscale#受限域名服务器

[docs-operator-customization]: /docs/kubernetes-operator/reference/tags

[docs-operator-byod-gateway-api-troubleshooting]: /docs/reference/troubleshooting/containers/kubernetes-operator/byod-gateway-api
