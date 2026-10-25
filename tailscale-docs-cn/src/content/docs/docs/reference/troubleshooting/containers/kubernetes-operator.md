---
title: "Kubernetes Operator 问题排障"
description: "以下章节提供帮助你排查常见 Kubernetes Operator 问题的建议与技巧。"
---

最后验证于 Jan 5, 2026

以下章节提供帮助你排查常见 Kubernetes Operator 问题的建议与技巧。

## 使用日志

如果你的安装出现了问题，查看 Operator 日志可能会很有用。

对于[入站][docs-operator-cluster-ingress]和[出站][docs-operator-cluster-egress]代理以及 `Connector`，Operator 会在 `tailscale` 命名空间中创建一个单副本的 `StatefulSet`，负责在 tailnet 之间转发流量。如果该 `StatefulSet` 已成功创建，你还应该查看其 `Pod` 的日志。

### Operator 日志

你可以提高 Operator 的日志级别以获取调试日志。

要将使用 Helm 部署的 Operator 的日志级别设为 `debug`，请运行：

```shell
helm upgrade --install \
  operator tailscale/tailscale-operator \
  --set operatorConfig.logging=debug
```

如果你是使用[静态清单][docs-operator-static-manifests-with-kubectl]部署的 Operator，可以将 Operator `Deployment` 的 `OPERATOR_LOGGING` 环境变量设为 `debug`。

要查看日志，请运行：

```shell
kubectl logs deployment/operator --namespace tailscale
```

### 代理日志与事件

要获取为 [`Ingress`][docs-operator-cluster-ingress] 资源创建的代理的日志和事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=<ingress-name>,tailscale.com/parent-resource-ns=<ingress-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为[入站][docs-operator-cluster-ingress]或[出站][docs-operator-cluster-egress] `Service` 创建的代理的日志和事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=svc,tailscale.com/parent-resource=<service-name>,tailscale.com/parent-resource-ns=<service-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为 `Connector` 创建的代理的日志和事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=connector,tailscale.com/parent-resource=<connector-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为 `ProxyGroup` 创建的代理的日志和事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=proxygroup,tailscale.com/parent-resource=<proxy-group-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

## 集群出站/集群入站代理

代理 Pod 部署在 `tailscale` 命名空间中，名称形如 `ts-<annotated-service-name>-<random-string>`。

如果无法访问外部服务，请验证代理 Pod 是否已正确部署：

* 查看代理 Pod 的日志和事件。
* 查看 Operator 的日志。可以运行 `kubectl logs deploy/operator --namespace tailscale` 来完成。日志级别可以通过 Operator [清单文件][xt-gh-tailscale-k8s-operator]中的 `OPERATOR_LOGGING` 环境变量进行配置。
* 验证集群工作负载能否向 `tailscale` 命名空间中的代理 Pod 发送流量。

## TLS 连接错误

如果你在连接通过 `Ingress` 暴露到 tailnet 的工作负载，或通过 Operator 的 API 服务器代理连接 `kube` API 服务器，有时会遇到 TLS 连接错误。

请按顺序检查以下各项：

1. tailnet 未启用 HTTPS。

   要使用 Tailscale `Ingress` 或 API 服务器代理，你必须确保[tailnet 已启用 HTTPS][docs-enabling-https]。

2. Let's Encrypt 证书尚未完成签发。

   如果已启用 HTTPS，这些错误很可能与 Let's Encrypt 证书的签发流程有关。

   对于每个 Tailscale `Ingress` 资源，Operator 都会部署一个运行 TLS 服务器的 Tailscale 节点。该服务器会获得一张针对该节点 MagicDNS 名称的 Let's Encrypt 证书。对于 API 服务器代理，Operator 还会运行一个进程内 TLS 服务器，将 tailnet 流量代理到 Kubernetes API 服务器。该服务器会获得一张针对 Operator MagicDNS 名称的 Let's Encrypt 证书。

   在这两种情况下，证书都是在客户端首次连接服务器时才惰性签发的。签发需要一些时间，因此你可能会收到一些 TLS 超时错误。

   你可以查看日志来跟踪证书签发过程：

   对于 API 服务器代理，请查看 Operator 的日志：

* 对于 API 服务器代理，请查看 [Operator 日志][ar-operator-logs]。
* 对于 `Ingress`，请查看[代理日志][ar-operator-proxy-logs]。

  目前你无法避免首次客户端连接有时会报错。如果这影响了你的工作流程，欢迎[向我们反馈][xt-gh-tailscale-issue-types]。

1. 你触及了 Let's Encrypt 的速率限制。

   如果首次连接尝试之后连接仍然不成功，你应该确认自己没有触及 [Let's Encrypt 速率限制][xt-letsencrypt-rate-limit]。如果触及了限制，你可以在日志中找到 Let's Encrypt 返回的错误。

   我们目前正在努力降低用户触及 Let's Encrypt 速率限制的可能性。相关讨论请参阅 [`tailscale/tailscale#11119`][xt-gh-tailscale-issue-11119]。

## OAuth 客户端与标签问题

如果你遇到 Operator 标签设置不当或权限问题，请检查以下各项：

1. **OAuth 客户端作用域**：确保你的 OAuth 客户端同时具有 `devices:core` 和 `auth_keys` 两个作用域的写入权限。

2. **OAuth 客户端标签权限**：OAuth 客户端必须有权使用你想应用到 Operator 的所有标签。例如，如果你的 `operatorConfig.defaultTags` 指定了 `tag:k8s-operator,tag:k8s-test` 这样多个标签，那么你的 OAuth 客户端必须有权使用 `tag:k8s-operator`。

3. **ACL 中的标签所有权**：检查 tailnet 策略文件中的标签所有权配置是否正确。

   ```json
   "tagOwners": {
     "tag:k8s-operator": [],
     "tag:k8s-test": ["tag:k8s-operator"],
   }
   ```

4. **刷新 Operator 状态**：

   * 如果你更新了 ACL 策略，变更会自动应用，无需任何重启。

   * 如果你创建了新的 OAuth 客户端来替换原来的客户端，必须完全重新安装 Operator，以确保生成新密钥。使用新的 OAuth 客户端凭证重新执行[安装说明][docs-kubernetes-operator-setup]。

5. **在控制台检查 OAuth 客户端**：在 Tailscale 管理控制台中验证你的 OAuth 客户端具有的标签与你想要应用到 Operator 的标签完全一致。请注意，每个标签的权限都是独立评估的。

6. **检查 Operator 日志**：在 [Operator 日志][ar-operator-logs]中查找授权错误或与标签相关的消息。

## Tailscale Ingress 排障

本节包含排查 Tailscale `Ingress` 问题的补充信息。

* 检查 Operator 是否正确配置了入站代理：

例如，如果你有一个 Tailscale `Ingress`，其后端 `Service` 与下面类似：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
name: my-app
spec:
ingressClassName: tailscale
rules:
- http:
    paths:
    - backend:
        service:
          name: my-app
          port:
            number: 80
      path: /login
      pathType: Prefix
tls:
- hosts:
  - my-app
---
apiVersion: v1
kind: Service
metadata:
name: my-app
spec:
clusterIP: 192.0.2.9
ports:
- port: 80
```

* 验证入站代理的配置是否匹配：

```shell
INGRESS_NAME=<ingress-resource-name> \
INGRESS_NAMESPACE=<ingress-resource-namespace> \
secret_name=$(kubectl get secret --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl get secret ${secret_name} -n tailscale -ojsonpath={.data.serve-config} | base64 -d
'{"TCP":{"443":{"HTTPS":true}},"Web":{"${TS_CERT_DOMAIN}:443":{"Handlers":{"/login":{"Proxy":"http://192.0.2.9:80/"}}}}}'
```

如果配置看起来不正确，请在 Operator 日志中检查与配置 `Ingress` 相关的错误。

* 检查入站代理是否已加载配置。

运行以下命令查看当前代理的配置：

```shell
INGRESS_NAME=<ingress-resource-name> \
INGRESS_NAMESPACE=<ingress-resource-namespace> \
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec ${pod_name} --namespace tailscale -- tailscale serve status
https://my-app.<tailnetxyz>.ts.net (tailnet only)
|-- / proxy http://192.0.2.9:80/
```

如果配置看起来不正确，请检查代理 `Pod` 的日志。

* 验证 `Service` 后端能否从入站代理 `Pod` 访问：

```shell
INGRESS_NAME=<ingress-resource-name> \
INGRESS_NAMESPACE=<ingress-resource-namespace> \
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec -it ${pod_name} -n tailscale -- sh \
apk add curl \
curl http://192.0.2.9:80/
```

如果无法访问后端，问题很可能与来自 `tailscale` 命名空间的集群连接有关。
请确认你没有配置阻止 `tailscale` 命名空间中的 `Pod` 与 `Ingress` 后端通信的 `NetworkPolicy`。

[ar-operator-logs]: #operator-日志

[ar-operator-proxy-logs]: #代理日志与事件

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-kubernetes-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-operator-cluster-egress]: /docs/kubernetes-operator/egress

[docs-operator-cluster-ingress]: /docs/kubernetes-operator/ingress

[docs-operator-static-manifests-with-kubectl]: /docs/kubernetes-operator/install-operator#install-using-static-manifests-with-kubectl

[xt-gh-tailscale-issue-11119]: https://github.com/tailscale/tailscale/issues/11119

[xt-gh-tailscale-issue-types]: https://github.com/tailscale/tailscale/issues/new/choose

[xt-gh-tailscale-k8s-operator]: https://github.com/tailscale/tailscale/blob/main/cmd/k8s-operator/deploy/manifests/operator.yaml

[xt-letsencrypt-rate-limit]: https://letsencrypt.org/docs/rate-limits
