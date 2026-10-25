---
title: "Tailscale Kubernetes Operator 故障排查"
description: "如果安装遇到问题，请查看 operator 日志。"
---

最后验证于 Jun 5, 2026

## 使用日志

如果安装遇到问题，请查看 operator 日志。

对于 [ingress][docs-operator-cluster-ingress] 与 [egress][docs-operator-cluster-egress] 代理以及 `Connector`，operator 会在 `tailscale` 命名空间中创建一个单副本 `StatefulSet`，用于在集群与 tailnet 之间转发流量。如果该 `StatefulSet` 已成功创建，还请查看其 Pod 的日志。

### Operator 日志

你可以调高 operator 的日志级别以获取调试日志。

要将使用 Helm 部署的 operator 的日志级别设置为 `debug`，请运行：

```shell
helm upgrade --install \
  operator tailscale/tailscale-operator \
  --set operatorConfig.logging=debug
```

如果你是使用[静态清单][docs-operator-static-manifests-with-kubectl]部署的 operator，请将 operator `Deployment` 的 `OPERATOR_LOGGING` 环境变量设置为 `debug`。

要查看日志，请运行：

```shell
kubectl logs deployment/operator --namespace tailscale
```

### 代理日志与事件

要获取为 [`Ingress`][docs-operator-cluster-ingress] 资源创建的代理的日志与事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=<ingress-name>,tailscale.com/parent-resource-ns=<ingress-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为 [ingress][docs-operator-cluster-ingress] 或 [egress][docs-operator-cluster-egress] `Service` 创建的代理的日志与事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=svc,tailscale.com/parent-resource=<service-name>,tailscale.com/parent-resource-ns=<service-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为 [`Connector`][docs-connector] 创建的代理的日志与事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=connector,tailscale.com/parent-resource=<connector-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

要获取为 [`ProxyGroup`][docs-proxygroup] 创建的代理的日志与事件，请运行：

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=proxygroup,tailscale.com/parent-resource=<proxy-group-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

## 集群出站与集群入站代理

代理 Pod 部署在 `tailscale` 命名空间中，名称形如 `ts-<annotated-service-name>-<random-string>`。

如果你无法访问外部服务，请验证代理 Pod 是否已正确部署：

* 查看代理 Pod 的日志与事件。
* 运行 `kubectl logs deployment/operator --namespace tailscale` 查看 operator 日志。你可以通过 operator [清单文件][docs-operator-static-manifests-with-kubectl]中的 `OPERATOR_LOGGING` 环境变量配置日志级别。
* 验证集群工作负载能否向 `tailscale` 命名空间中的代理 Pod 发送流量。

## TLS 连接错误

如果你正在连接通过 `Ingress` 暴露到 tailnet 的工作负载，或通过 operator 的 API server 代理连接 Kubernetes API server，可能会遇到 TLS 连接错误。

请按顺序检查以下各项：

1. 未为 tailnet 启用 HTTPS。

   要使用 Tailscale `Ingress` 或 API server 代理，请确保[已为你的 tailnet 启用 HTTPS][docs-enabling-https]。

2. Let's Encrypt 证书尚未置备完成。

   如果 HTTPS 已启用，这些错误最有可能与 Let's Encrypt 证书置备流程有关。

   对于每个 Tailscale `Ingress` 资源，operator 都会部署一个运行 TLS 服务器的 Tailscale 节点。该服务器会获得一张 Let's Encrypt 证书，对应节点的 MagicDNS 名称。对于 API server 代理，operator 还会在进程内运行一个 TLS 服务器，将 tailnet 流量代理到 Kubernetes API server。该服务器会获得一张 Let's Encrypt 证书，对应 operator 的 MagicDNS 名称。

   在这两种情况下，证书都是在客户端首次连接服务器时惰性置备的。置备需要时间，因此可能出现 TLS 超时错误。

   要跟踪证书置备过程，请查看日志：

   * 对于 API server 代理，查看 [operator 日志][ar-operator-logs]。
   * 对于 `Ingress`，查看[代理日志][ar-operator-proxy-logs]。

   证书置备期间，首次客户端连接可能报错；这是已知限制。如果它影响你的工作流程，请[在 GitHub 上提交 issue][xt-gh-tailscale-issue-types]。

3. 你触发了 Let's Encrypt 速率限制。

   如果首次尝试后连接仍未成功，请确认你没有触发 [Let's Encrypt 速率限制][xt-letsencrypt-rate-limit]。如果已触发限制，来自 Let's Encrypt 的错误会出现在日志中。

   关于降低触发 Let's Encrypt 速率限制可能性的持续工作，请参阅 [`tailscale/tailscale#11119`][xt-gh-tailscale-issue-11119] 中的相关讨论。

## 共享 ACME 账户 Secret 卡在 Terminating 状态

如果你删除 `tailscale-acme-accounts` `Secret`，它会停留在 `Terminating` 状态，因为 `tailscale.com/acme-account-protection` finalizer 会阻止删除。要完成删除，请先备份 `Secret` 数据（如果尚未备份），然后移除该 finalizer。

该 `Secret` 保存[共享的 Let's Encrypt 账户密钥][docs-lets-encrypt-rate-limits]，丢失这些密钥会使你 tailnet 的证书续期速率限制豁免失效。有关 finalizer 的说明以及如何备份账户密钥，请参阅 [Let's Encrypt 速率限制][docs-lets-encrypt-rate-limits]。

## OAuth 客户端与标签问题

如果 operator 未正确打标签或存在权限问题，请检查以下各项：

1. **OAuth 客户端作用域**：确保你的 OAuth 客户端同时具有 `devices:core` 与 `auth_keys` 两个作用域（scope）及写权限。

2. **OAuth 客户端标签权限**：OAuth 客户端必须有权使用你想应用到 operator 的所有标签。例如，如果你的 `operatorConfig.defaultTags` 指定了多个标签（如 `tag:k8s-operator,tag:k8s-test`），你的 OAuth 客户端必须有权使用 `tag:k8s-operator`。

3. **tailnet 策略文件中的标签所有权**：检查你的标签所有权是否已在 tailnet 策略文件中正确配置：

   ```json
   "tagOwners": {
     "tag:k8s-operator": [],
     "tag:k8s-test": ["tag:k8s-operator"],
   }
   ```

4. **刷新 operator 状态**

   * 如果你更新了 tailnet 策略文件，更改会自动生效，无需重启。
   * 如果你新建了一个 OAuth 客户端来替换之前的客户端，请重新安装 operator，以确保生成新密钥。使用新的 OAuth 客户端凭证，再次按照[安装说明][docs-kubernetes-operator-setup]操作。

5. **在管理控制台检查 OAuth 客户端**：在 Tailscale 管理控制台中确认你的 OAuth 客户端带有你想应用到 operator 的确切标签。每个标签的权限都是独立评估的。

6. **检查 operator 日志**：在 [operator 日志][ar-operator-logs]中查找授权错误或与标签相关的消息。

## Tailscale Ingress 故障排查

本主题包含排查 Tailscale `Ingress` 问题的补充信息。

请检查 operator 是否已正确配置 ingress 代理。例如，如果你有一个 Tailscale `Ingress`，其后端 `Service` 如下所示：

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

验证 ingress 代理的配置是否与该资源一致：

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
secret_name=$(kubectl get secret --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl get secret ${secret_name} -n tailscale -ojsonpath={.data.serve-config} | base64 -d
```

命令输出类似于：

```json
{"TCP":{"443":{"HTTPS":true}},"Web":{"${TS_CERT_DOMAIN}:443":{"Handlers":{"/login":{"Proxy":"http://192.0.2.9:80/"}}}}}
```

如果配置不正确，请在 operator 日志中查找与配置 `Ingress` 相关的错误。

请通过检查当前代理配置，确认 ingress 代理已加载该配置：

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec ${pod_name} --namespace tailscale -- tailscale serve status
```

命令输出类似于：

```
https://my-app.<tailnet>.ts.net (tailnet only)
|-- / proxy http://192.0.2.9:80/
```

如果配置不正确，请检查代理 Pod 日志。

验证 `Service` 后端能否从 ingress 代理 Pod 访问：

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec -it ${pod_name} -n tailscale -- sh
apk add curl
curl http://192.0.2.9:80/
```

如果无法访问后端，问题很可能与 `tailscale` 命名空间的集群连通性有关。请验证是否存在 `NetworkPolicy` 阻止 `tailscale` 命名空间中的 Pod 与 `Ingress` 后端通信。

[ar-operator-logs]: #operator-日志

[ar-operator-proxy-logs]: #代理日志与事件

[docs-connector]: /docs/kubernetes-operator/connector

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-kubernetes-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-operator-cluster-egress]: /docs/kubernetes-operator/egress

[docs-operator-cluster-ingress]: /docs/kubernetes-operator/ingress

[docs-operator-static-manifests-with-kubectl]: /docs/kubernetes-operator/install-operator#install-using-static-manifests-with-kubectl

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[xt-gh-tailscale-issue-11119]: https://github.com/tailscale/tailscale/issues/11119

[xt-gh-tailscale-issue-types]: https://github.com/tailscale/tailscale/issues/new/choose

[xt-letsencrypt-rate-limit]: https://letsencrypt.org/docs/rate-limits
