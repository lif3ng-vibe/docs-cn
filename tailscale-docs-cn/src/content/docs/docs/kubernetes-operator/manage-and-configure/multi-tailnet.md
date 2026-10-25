---
title: "为运行在 Kubernetes 上的设备使用多个 tailnet"
description: "在部署 Tailscale Kubernetes Operator 的[自定义资源（custom resources）][xt-kubernetes-crd]时，你可能希望工作负载能够跨集群、跨 tailnet 通信。在 Tailscale v1.96 及更高版本中，你可"
---

最后验证于 Jun 5, 2026

在部署 Tailscale Kubernetes Operator 的[自定义资源（custom resources）][xt-kubernetes-crd]时，你可能希望工作负载能够跨集群、跨 tailnet 通信。在 Tailscale v1.96 及更高版本中，你可以使用 `Tailnet` 自定义资源定义来指定 `ProxyGroup`、`Connector` 或 `Recorder` 实例应使用哪个 tailnet。

## 前提条件

你需要能够访问多个 tailnet，可以通过单独的登录，也可以由同一个组织管理。关于在同一组织内管理多个 tailnet 的更多信息，请参阅[管理多个 tailnet][docs-multi-tailnet]。

你要公开的每个 tailnet 都需要在 ACL 策略文件中为 Tailscale Kubernetes Operator 设置相应的 `tagOwners`：

```json
"tagOwners": {
	"tag:k8s-operator": [],
	"tag:k8s": ["tag:k8s-operator"],
}
```

> **注意：**
>
> 如果你使用的标签与默认的 `tag:k8s-operator` 不同，请用你自己的标签替换上面的示例。

每个 tailnet 都需要一个 `Secret` 资源，其中包含来自 [OAuth 客户端][docs-oauth-clients]的客户端 ID 和密钥，或用于[工作负载身份联合][docs-wif]的客户端 ID 和受众（audience）。Operator 使用这些凭证为工作负载生成认证密钥。在创建 `Tailnet` 资源之前，请先在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面中，为你要提供访问的 tailnet 创建一个 OAuth 或 OpenID Connect 客户端。创建客户端时授予 `Devices Core`、`Auth Keys`、`Services` 写作用域，并附带 `tag:k8s-operator` 标签。

## 创建 Tailnet 资源

每个 `Tailnet` 资源都引用一组以 Kubernetes `Secret` 形式存储的 OAuth 凭证，该 `Secret` 位于与 Operator 相同的命名空间中。

拿到客户端 ID 和密钥后，创建一个 `Secret` 资源：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: example-tailnet
  namespace: tailscale
stringData:
  # OAuth 客户端
  client_id: "<CLIENT_ID>"
  client_secret: "<CLIENT_SECRET>"
  # 或 WIF
  client_id: "<CLIENT_ID">
  audience: "<AUDIENCE>"
```

> **注意：**
>
> 如果你把 Tailscale Kubernetes Operator 部署到了其他命名空间，请使用该命名空间的名称代替 `tailscale`。

接下来，创建一个引用包含 OAuth 凭证的 Secret 的 `Tailnet` 资源：

```yaml
apiVersion: tailscale.com/v1alpha
kind: Tailnet
metadata:
  name: example-tailnet
spec:
  credentials:
    secretName: example-tailnet
```

> **注意：**
>
> `Tailnet` 资源是集群作用域的，`namespace` 字段无需填值。

部署后，Operator 会检查指定的凭证是否存在并可访问 Tailscale API。如果成功，`Tailnet` 资源会转为 `TailnetReady` 状态，并可供其他资源使用。使用 `kubectl get tailnet` 命令查看 tailnet 的状态。

## 配置资源以使用特定 tailnet

在你的集群中拥有一个或多个 `Tailnet` 资源后，就可以创建使用 `spec.tailnet` 字段连接到该 tailnet 的 `ProxyGroup`、`Connector` 和 `Recorder` 资源。该字段不可变，留空表示该资源应使用 Operator 最初配置的 tailnet。

以下示例展示了如何配置这些资源来使用特定的 tailnet。

使用特定 tailnet 的 `Connector` 资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Connector
metadata:
	name: example-connector
spec:
	replicas: 3
	tailnet: example-tailnet
	exitNode: true
```

关于 `Connector` 资源的更多信息，请参阅[在 Kubernetes 上创建出口节点和子网路由器][docs-k8s-connector]。

使用特定 tailnet 的 `Recorder` 资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Recorder
metadata:
	name: example-recorder
spec:
	replicas: 3
	tailnet: example-tailnet
	storage: {}
```

关于 `Recorder` 资源的更多信息，请参阅[会话录制][docs-k8s-session-recording]。

使用特定 tailnet 的 `ProxyGroup` 资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
	name: example-proxygroup
spec:
	replicas: 3
	tailnet: example-tailnet
	type: kube-apiserver
```

关于 `ProxyGroup` 资源的更多信息，请参阅[入站][docs-k8s-ingress]或[出站][docs-k8s-egress]文档。

启动并就绪后，你的设备会出现在各个 tailnet 对应的 [Machines](https://console.tailscale.com/admin/machines) 页面中。

[docs-k8s-connector]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-egress]: /docs/kubernetes-operator/egress

[docs-k8s-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-session-recording]: /docs/kubernetes-operator/recorder

[docs-multi-tailnet]: /docs/features/multiple-tailnets

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-wif]: /docs/features/workload-identity-federation

[xt-kubernetes-crd]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources
