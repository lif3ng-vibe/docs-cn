---
title: "向集群添加静态端点"
description: "Tailscale 使用多种 [NAT 穿透技术][bl-how-nat-traversal-works]，无需人工干预即可安全连接到其他 Tailscale 节点。大多数情况下，你不需要为 Tailscale 打开任何[防"
---

最后验证于 Jun 5, 2026

> **注意：**
>
> 此功能在 Tailscale v1.86 及更高版本中可用，且仅适用于 [`ProxyGroups`][docs-proxy-group] 中的代理。

Tailscale 使用多种 [NAT 穿透技术][bl-how-nat-traversal-works]，无需人工干预即可安全连接到其他 Tailscale 节点。大多数情况下，你不需要为 Tailscale 打开任何[防火墙端口][docs-firewalls]。然而，在某些 NAT 穿透不成功的场景中，Operator 部署的 Tailscale 代理会依赖[中继连接（relayed connection）][docs-derp-region]，与直连相比吞吐量和性能更低。例如使用 AWS NAT 网关这类[硬 NAT（hard NAT）][docs-device-connectivity-hard-nat]时。

在这些场景中，`ProxyClass` 提供了相应配置，可以使用 [Kubernetes NodePort 服务][xt-kubernetes-node-port-service]作为额外端点，从而启用到 `ProxyGroups` 的直连。配置后，这些端点只对该 Kubernetes `Node` 所在网络中的 tailnet 设备生效。如果该 Kubernetes `Node` 拥有公网 IP 地址，那么配置的静态端点就能被所有 Tailscale 设备访问。

## 配置防火墙规则

> **注意：**
>
> 每个 `ProxyGroup` 最多允许两个静态端点。要指定 Operator 将哪些节点用于 NodePort `Services`，请在 [`ProxyClass` 资源][docs-operator-configuring-static-endpoints]中配置 `spec.staticEndpoints.selector` 字段。

要使用静态端点，请为每个相关 `Node` 的 IP 地址配置入站防火墙规则。Tailscale 建议在防火墙上配置足够数量的端口，以免 `ProxyGroup` 副本扩容时端口耗尽。

## 配置静态端点

要配置静态端点，请完成以下步骤。

1. 创建一个 `ProxyClass`。

   静态端点的配置通过 [`ProxyClass`][xt-gh-tailscale-k8s-proxyclass] 自定义资源提供，位于 `spec.staticEndpoints` 下：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyClass
   metadata:
     name: prod
   spec:
     staticEndpoints:
       nodePort:
         ports:
         - "31667-31680"
         selector:
           kubernetes.io/os: linux
   ```

   上面的示例将 `ProxyClass` 配置为使用 [Kubernetes NodePort 服务][xt-kubernetes-node-port-service]作为静态端点。在 `nodePort` 配置中，配置 `ports` 列表。请确保指定的端口范围具有必要的防火墙规则，以便其他 tailnet 设备能够访问这些端点。使用 `selector` 字段指定将哪个 Kubernetes 节点的 `ExternalIP` 用于静态端点。

创建此 `ProxyClass` 后，在 `ProxyGroup` 上引用它，为其所有副本配置静态端点：

1. 创建一个 `ProxyGroup`。

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyGroup
   metadata:
     name: ingress
   spec:
     type: ingress
     proxyClass: prod
     replicas: 3
   ```

   应用此配置后，该示例会创建三个代理副本和三个 Kubernetes NodePort 服务，让其他 tailnet 设备能够连接到这个 `ProxyGroup`：

   ```
   NAME                   TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)           AGE
   prod-0-nodeport        NodePort    172.20.123.3     <none>        22918:31669/UDP   84m
   prod-1-nodeport        NodePort    172.20.163.230   <none>        22918:31668/UDP   84m
   prod-2-nodeport        NodePort    172.20.84.83     <none>        22918:31667/UDP   84m
   ```

2. 测试连接。

   创建 `ProxyGroup` 后，创建一个测试 `Pod`，并使用[高可用集群入站][docs-operator-cluster-ingress-service-ha]将其公开，以测试静态端点：

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: test
     namespace: default
     labels:
       app: test
   spec:
     containers:
     - name: nginx
       image: nginx:latest
       ports:
       - containerPort: 80
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: test
     namespace: default
     annotations:
       tailscale.com/proxy-group: ingress
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale
     selector:
       app: test
     ports:
       - port: 80
         targetPort: 80
         protocol: TCP
   ```

   运行 `kubectl get service -n default` 查找用于把 `Pod` 公开到 tailnet 的 Tailscale `Service` IP 地址。

   ```
   NAME         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)           AGE
   test         LoadBalancer   172.20.50.164    100.64.1.2    80:31109/TCP      2m17s
   ```

   使用该 Tailscale `Service` IP 地址测试从你的 tailnet 到 `Pod` 的直连：

   ```shell
   tailscale ping <external-ip>
   ```

   如果直连成功，会看到类似如下的日志输出：

   ```
   pong from prod-0 (100.64.1.1) via 203.0.113.1:31670 in 91ms
   ```

   如果不成功，会看到类似如下的日志输出：

   ```
   pong from prod-0 (100.64.1.1) via DERP(nyc) in 90ms
   ```

   如果看到的是这种日志输出，请确认：

   * 已为流量正确配置入站防火墙规则，使其能够流向 `ProxyClass` 中配置的正确 Kubernetes 节点和端口范围。

   * 通过 `spec.staticEndpoints.nodePort.selector` 选中的节点，其 `status.addresses` 中含有 `ExternalIP`。

   * `ProxyGroup` 的 `status.devices` 上的 `staticEndpoints` 字段已使用有效的 `ExternalIP` 和该副本 `Service` 的正确 `NodePort` 填充了正确的地址。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-derp-region]: /docs/reference/derp-servers

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#硬-nat

[docs-firewalls]: /docs/integrations/firewalls

[docs-operator-cluster-ingress-service-ha]: /docs/kubernetes-operator/ingress

[docs-operator-configuring-static-endpoints]: /docs/kubernetes-operator/concepts/proxyclass

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[xt-gh-tailscale-k8s-proxyclass]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md#proxyclass

[xt-kubernetes-node-port-service]: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
