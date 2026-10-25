---
title: "为 Tailscale Kubernetes Operator 配置工作负载身份联合"
description: "Tailscale 支持[工作负载身份联合（workload identity federation）][docs-wif]，可使用提供商原生的身份令牌向 tailnet 进行身份验证。Operator 可以将其 ServiceAccount 令牌作为 OIDC 身份"
---

最后验证于 Jun 5, 2026

Tailscale 支持[工作负载身份联合（workload identity federation）][docs-wif]，可使用提供商原生的身份令牌向 tailnet 进行身份验证。Operator 可以将其 ServiceAccount 令牌用作 OIDC 身份，无需长期有效的 OAuth 客户端密钥即可完成身份验证。

## 准备集群

Kubernetes 集群的 OIDC 发现端点必须可公开访问。将 `"unauthenticated"` 组绑定到 `"system:service-account-issuer-discovery"` `ClusterRole`，以允许未经身份验证的访问：

```shell
kubectl create clusterrolebinding oidc-discovery \
  --clusterrole=system:service-account-issuer-discovery \
  --group=system:unauthenticated
```

## 获取集群的颁发者（issuer）

> **注意：**
>
> 以下命令依赖 `jq`。你可能需要在你的设备上安装 `jq`。

要获取集群的颁发者，请运行以下命令：

```shell
ISSUER="$(kubectl get --raw /.well-known/openid-configuration | jq '.issuer')"
```

## 配置联合身份

按照管理控制台中[配置联合身份][docs-wif-configure]的步骤操作，并使用以下值：

* 将 **Issuer** 设置为 **Custom issuer**。
* 将 **Issuer URL** 设置为上一步中 `$ISSUER` 的值。
* 将 **Subject** 设置为 `system:serviceaccount:tailscale:operator`。
* 将 **Audience** 字段留空。
* 创建客户端时授予 `write` 作用域：
  * `General/Services`（附带 `tag:k8s-operator` 标签）
  * `Devices/Core`（附带 `tag:k8s-operator` 标签）
  * `Keys/Auth Keys`（附带 `tag:k8s-operator` 标签）

## 安装或升级 Tailscale Kubernetes Operator

> **注意：**
>
> 在继续[安装指南][docs-install-operator]之前，请先记下你的安装方式所需的更改。

### Helm

* 在按照 [Helm 安装指南][docs-install-helm]操作时，把 `--set-string oauth.clientSecret="<OAuth client secret>"` 替换为 `--set-string oauth.audience="<OIDC Audience>"`。

### 静态清单

在按照[使用静态清单安装][docs-install-static-manifests]指南操作时，对清单文件做以下更改

* 移除 `operator-oauth` secret 定义（不再需要）。
* 编辑 Deployment：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: operator
  namespace: tailscale
spec:
  replicas: 1
  selector:
    matchLabels:
      app: operator
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: operator
    spec:
      containers:
        - env:
            - name: OPERATOR_INITIAL_TAGS
              value: tag:k8s-operator
            - name: OPERATOR_HOSTNAME
              value: tailscale-operator
            - name: OPERATOR_SECRET
              value: operator
            - name: OPERATOR_LOGGING
              value: info
            - name: OPERATOR_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: OPERATOR_LOGIN_SERVER
              value: null
            - name: OPERATOR_INGRESS_CLASS_NAME
              value: tailscale
            - name: CLIENT_ID
              value: "<OAuth client ID>"
            - name: PROXY_IMAGE
              value: tailscale/tailscale:stable
            - name: PROXY_TAGS
              value: tag:k8s
            - name: APISERVER_PROXY
              value: "false"
            - name: PROXY_FIREWALL_MODE
              value: auto
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
          image: tailscale/k8s-operator:stable
          imagePullPolicy: Always
          name: operator
          volumeMounts:
            - mountPath: /var/run/secrets/tailscale/serviceaccount
              name: oidc-jwt
              readOnly: true
      nodeSelector:
        kubernetes.io/os: linux
      serviceAccountName: operator
      volumes:
        - name: oidc-jwt
          projected:
            defaultMode: 420
            sources:
              - serviceAccountToken:
                  audience: "<OIDC Audience>"
                  expirationSeconds: 3600
                  path: token
```

应用清单并确认 `operator-oauth` secret 已不再被使用后，你可以删除该 secret。

## 进一步探索

* 了解[工作负载身份联合][docs-wif]的工作原理及其与 Tailscale 的集成方式。
* [安装][docs-install-operator] Tailscale Kubernetes Operator。

[docs-install-helm]: /docs/kubernetes-operator/install-operator#install-using-helm

[docs-install-static-manifests]: /docs/kubernetes-operator/install-operator#install-using-static-manifests-with-kubectl

[docs-install-operator]: /docs/kubernetes-operator/install-operator

[docs-release-stages]: /docs/reference/tailscale-release-stages#beta

[docs-wif]: /docs/features/workload-identity-federation

[docs-wif-configure]: /docs/features/workload-identity-federation#configure-federated-identities-in-the-admin-console
