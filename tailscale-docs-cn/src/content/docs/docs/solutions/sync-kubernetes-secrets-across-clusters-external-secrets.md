---
title: "使用 External Secrets Operator 跨集群同步 Kubernetes 密钥"
description: "借助 External Secrets Operator 和 Tailscale 的私有网络在 Kubernetes 集群之间分发密钥，无需把凭证存入 Git，也无需把 API 服务器暴露到互联网。"
---

最后验证于 Mar 9, 2026

跨多个 Kubernetes 集群管理密钥，是多集群运维中较棘手的问题之一。团队通常只能手动在集群之间复制密钥、把加密后的密钥提交到 Git，或运行一台需要额外基础设施的集中式保管库（vault）。每种做法都会带来运维负担或安全风险。

[External Secrets Operator][xt-external-secrets]（ESO）通过从外部提供方同步密钥到 Kubernetes 解决了这个问题。它的 [Kubernetes 提供方][xt-eso-kubernetes-provider]可以直接从远程集群的 API 服务器读取密钥，从而可以把一个集群当作其他集群的密钥来源。难点在于如何把 ESO 安全地连接到那些远程 API 服务器。

本指南将 External Secrets Operator 与 Tailscale Kubernetes Operator 结合，通过私有网络把密钥从源集群（保存权威密钥的集群）同步到一个或多个工作负载集群。你将配置 Tailscale 出站服务，把 ESO 的流量路由到源集群的 API 服务器，并通过 Tailscale 的 [Kubernetes 模拟（impersonation）][docs-app-capabilities]完成认证。Git 中不存任何密钥，API 服务器不暴露到互联网，而新增一个工作负载集群只需要一个新的出站服务和一个 `ClusterSecretStore`。

*（图：External Secrets Operator 标志与 Tailscale 标志并排，代表两个工具在跨集群密钥同步上的集成。）*

## 前提条件

跟着本指南操作之前，请确保你具备：

* 两个或更多 Kubernetes 集群（一个保存密钥的源集群，以及一个或多个消费密钥的工作负载集群）
* 一个拥有 [Admin](/docs/reference/user-roles) 权限的 [Tailscale 账户](https://login.tailscale.com/start)
* 每个集群中都已[安装][docs-operator-install] Tailscale Kubernetes Operator，并[配置好 OAuth 凭证][docs-operator-oauth]
* 源集群的 Operator 安装已启用 API 服务器代理
* 每个工作负载集群中都已安装 [External Secrets Operator][xt-external-secrets]

## 安装带 API 服务器代理的 Tailscale Kubernetes Operator

在源集群中安装启用 API 服务器代理的 Tailscale Kubernetes Operator。这会把该集群的 API 服务器暴露在你的 tailnet 中，让其他集群里的 ESO 能够从中读取密钥。

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=source-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --set apiServerProxyConfig.allowImpersonation=true \
  --wait
```

关键配置选项是：

* `apiServerProxyConfig.mode=true`：启用 Kubernetes API 服务器代理，把 API 服务器暴露在你的 tailnet 中。
* `apiServerProxyConfig.allowImpersonation=true`：允许 Tailscale 代表连接的客户端模拟（impersonate）Kubernetes 用户和群组。这正是 ESO 的认证方式——bearer 令牌不会被直接使用。

工作负载集群也需要安装 Tailscale Kubernetes Operator，但不需要 API 服务器代理：

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=workload-k8s-operator \
  --wait
```

## 配置访问控制策略

External Secrets Operator 通过 Tailscale [Kubernetes 模拟][docs-app-capabilities]向源集群的 API 服务器认证。你需要配置[访问控制策略][docs-access-control]，授予工作负载集群从源集群读取密钥的权限。

将以下[授权][docs-grants]添加到你的 tailnet 策略文件。你可以在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面更新 tailnet 策略文件：

> **注意：**
>
> 这条授权策略使用[应用能力][docs-app-capabilities]为源集群的 Kubernetes API 提供细粒度访问。`impersonate` 字段控制工作负载集群的 Operator 可以扮演哪些 Kubernetes 群组。

```json
{
  "grants": [
    {
      "src": ["tag:k8s-operator"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": ["tailscale:external-secrets"]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

这条策略允许任何打有 `k8s-operator` 标签的设备在访问另一台 `k8s-operator` 设备的 Kubernetes API 时，扮演 `tailscale:external-secrets` 群组。

`impersonate.groups` 字段是 Tailscale 访问控制与 Kubernetes RBAC 之间的关键衔接。当 ESO 的请求到达源集群的 API 服务器代理时，Tailscale 会识别发起调用的设备，检查它是否有匹配的授权，然后带着 [Kubernetes 模拟头][xt-k8s-impersonation] `Impersonate-Group: tailscale:external-secrets` 转发该请求。Kubernetes API 服务器随后会像对待该群组成员的请求一样评估它。这意味着你可以通过创建 Kubernetes `ClusterRoleBinding`、把被模拟的群组绑定到某个 `ClusterRole`，来控制 ESO 能做什么。

> **注意：**
>
> 请使用 `tailscale:external-secrets` 这样的专用模拟群组，而不要用 `system:masters`。这符合最小权限原则——只授予 ESO 所需的权限，而不是完整的集群管理员权限。

## 在源集群上为被模拟群组创建 RBAC

上面这条授权会让来自工作负载集群的请求以 `tailscale:external-secrets` 群组的身份到达源集群的 API 服务器。现在你需要把这个群组绑定到一个 Kubernetes `ClusterRole`，授予 ESO 所需的权限。

在源集群上创建一个 `ClusterRole` 和 `ClusterRoleBinding`：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: external-secrets-reader
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["authorization.k8s.io"]
    resources: ["selfsubjectrulesreviews"]
    verbs: ["create"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: external-secrets-reader
subjects:
  - kind: Group
    name: tailscale:external-secrets
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: external-secrets-reader
  apiGroup: rbac.authorization.k8s.io
```

`ClusterRoleBinding` 的主体群组（`tailscale:external-secrets`）必须与授权中的 `impersonate.groups` 值完全一致。`selfsubjectrulesreviews` 权限是必需的，因为 ESO 在尝试读取密钥之前会先自检，确认自己拥有必要的权限。

将其应用到源集群：

```shell
kubectl apply -f rbac.yaml --context source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

> **注意：**
>
> 要更严格的安全控制，可以改用带命名空间的 `Role` 和 `RoleBinding`（而非 `ClusterRole`），把访问限制到特定命名空间。例如，把 ESO 限制为只能读取 `default` 命名空间中的密钥：
>
> ```yaml
> apiVersion: rbac.authorization.k8s.io/v1
> kind: Role
> metadata:
>   name: external-secrets-reader
>   namespace: default
> rules:
>   - apiGroups: [""]
>     resources: ["secrets"]
>     verbs: ["get", "list", "watch"]
>   - apiGroups: ["authorization.k8s.io"]
>     resources: ["selfsubjectrulesreviews"]
>     verbs: ["create"]
> ---
> apiVersion: rbac.authorization.k8s.io/v1
> kind: RoleBinding
> metadata:
>   name: external-secrets-reader
>   namespace: default
> subjects:
>   - kind: Group
>     name: tailscale:external-secrets
>     apiGroup: rbac.authorization.k8s.io
> roleRef:
>   kind: Role
>   name: external-secrets-reader
>   apiGroup: rbac.authorization.k8s.io
> ```

## 在工作负载集群中创建 Tailscale 出站服务

在每个工作负载集群中，创建一个经由 Tailscale 把流量路由到源集群 API 服务器的 Kubernetes `Service`。这个出站服务给 ESO 提供了一个稳定的集群内主机名来访问远程 API 服务器。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: source-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
    tailscale.com/proxy-group: <YOUR_PROXY_GROUP>
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
```

把 `<YOUR_TAILNET_NAME>` 替换为你 tailnet 的 [MagicDNS][docs-magicdns] 域，把 `<YOUR_PROXY_GROUP>` 替换为你的[代理组][docs-proxy-group]名称。Tailscale Kubernetes Operator 会自动预配这个服务，并把流量经由 tailnet 路由到源集群。

将其应用到你的工作负载集群中 Tailscale operator 管理出站服务的命名空间（通常是 `tailscale`）：

```shell
kubectl apply -f egress-service.yaml -n tailscale
```

Operator 会创建一个后端 `ClusterIP` 服务，工作负载集群中的 pod 可以用它访问源集群的 API 服务器。集群中任何位置的 pod 都能把 MagicDNS 主机名 `source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net` 解析到这个 `ClusterIP` 地址。

## 为 MagicDNS 设置 DNS 解析

`ClusterSecretStore` 使用 [MagicDNS][docs-magicdns] 主机名（例如 `source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net`）作为服务器 URL。要让 ESO pod 把这个主机名解析到出站服务的 `ClusterIP`，你需要在集群内部配置针对 `.ts.net` 域的 DNS 解析。

在每个工作负载集群中创建一个 `DNSConfig` 资源。它会部署一个能解析 `.ts.net` 主机名的 [Tailscale 名称服务器][docs-dns-nameserver]：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      tag: unstable
```

将其应用到你的工作负载集群：

```shell
kubectl apply -f dns-config.yaml
```

获取 Tailscale 名称服务器的 IP 地址：

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserverStatus.ip}'
```

记下返回的 IP 地址（例如 `100.64.0.4` 或 `10.100.124.196`）。更新你的 CoreDNS 配置，把 `.ts.net` 查询转发到 Tailscale 名称服务器：

```shell
kubectl edit configmap coredns -n kube-system
```

在 `Corefile` 部分添加以下块，并把 `<TAILSCALE_NAMESERVER_IP>` 替换为你记下的 IP 地址：

```text
ts.net:53 {
    errors
    cache 30
    forward . <TAILSCALE_NAMESERVER_IP>
}
```

> **警告：**
>
> 这一步是必需的。没有它，ESO 无法解析 `ClusterSecretStore` 服务器 URL 中的 `.ts.net` MagicDNS 主机名，该存储将无法连接。

## 配置 ClusterSecretStore

在每个工作负载集群中创建一个 `ClusterSecretStore`，经由 Tailscale 出站服务指向源集群。它会告诉 ESO 如何连接远程集群并进行认证。

首先，创建一个占位令牌 Secret。Tailscale API 服务器代理通过模拟处理认证（见上面配置的访问控制策略），因此 bearer 令牌不会被直接使用。但 ESO 的 Kubernetes 提供方要求在 `ClusterSecretStore` 规范中包含一个令牌引用：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tailscale-api-token
  namespace: external-secrets
type: Opaque
stringData:
  token: "unused"
```

> **注意：**
>
> bearer 令牌的值是 `"unused"`，因为认证完全由 Tailscale 模拟处理。

然后创建 `ClusterSecretStore`：

```yaml
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: kubernetes-source
spec:
  provider:
    kubernetes:
      remoteNamespace: default
      server:
        url: https://source-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
      auth:
        token:
          bearerToken:
            name: tailscale-api-token
            namespace: external-secrets
            key: token
```

`server.url` 使用 MagicDNS 主机名，它会在工作负载集群内部解析到出站服务的 `ClusterIP`。Tailscale API 服务器代理提供的 TLS 证书对该主机名有效，因此不需要 `caBundle`。当没有显式配置 CA 时，ESO 会回退到系统证书颁发机构（CA）根证书，而 Tailscale 使用的 Let's Encrypt 证书已包含在系统信任库中。

请求到达 API 服务器代理时，Tailscale 会识别来源设备，把它映射到你的访问控制策略中定义的模拟群组，并带着这些凭据转发请求。ESO 的 Kubernetes 提供方要求有 `bearerToken` 字段，因此一个占位 Secret 就能满足模式校验。

应用 `ClusterSecretStore`：

```shell
kubectl apply -f cluster-secret-store.yaml
```

验证该存储是否健康：

```shell
kubectl get clustersecretstore kubernetes-source
```

`STATUS` 列应显示 `Valid`，表示 ESO 已成功连接源集群。

## 创建 ExternalSecret

`ClusterSecretStore` 配置好后，你就可以创建 `ExternalSecret` 资源，把特定密钥从源集群拉取到工作负载集群。例如，同步一张 TLS 证书：

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: <YOUR_SECRET_NAME>
  namespace: <YOUR_NAMESPACE>
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: kubernetes-source
  target:
    name: <YOUR_SECRET_NAME>
    creationPolicy: Owner
  data:
    - secretKey: ca.crt
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: ca.crt
    - secretKey: tls.crt
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: tls.crt
    - secretKey: tls.key
      remoteRef:
        key: <YOUR_SOURCE_SECRET>
        property: tls.key
```

应用 `ExternalSecret`：

```shell
kubectl apply -f external-secret.yaml
```

验证密钥已同步：

```shell
kubectl get externalsecret <YOUR_SECRET_NAME> -n <YOUR_NAMESPACE>
```

`STATUS` 列应显示 `SecretSynced`。ESO 会按你指定的 `refreshInterval` 从源集群重新获取密钥，自动保持工作负载集群中的副本最新。

## 结语

你已配置 External Secrets Operator，经由 Tailscale 的私有网络在 Kubernetes 集群之间同步密钥。密钥通过加密的网状连接直接从源集群的 API 服务器获取，没有中间存储，也不暴露到互联网。

这一配置带来几项关键优势：

* **Git 中没有密钥**：凭证在运行时从权威来源同步，而不是提交进仓库。
* **自动轮换**：ESO 按可配置的时间间隔重新获取密钥，无需人工干预即可应用轮换。
* **私有连接**：源集群的 API 服务器永远不会暴露到互联网。所有流量都流经 Tailscale 的加密网络。
* **细粒度访问**：Tailscale 模拟与 Kubernetes RBAC 协同工作，精确授予 ESO 所需的权限，不多一分。
* **可扩展**：新增一个工作负载集群只需要一个新的出站服务和一个 `ClusterSecretStore`。源集群无需任何改动。

要了解高级配置，可以探索[自定义 Tailscale Kubernetes Operator][docs-operator-customization]，或参阅 [External Secrets Operator 文档][xt-external-secrets]了解其他提供方和密钥存储类型。

[docs-access-control]: /docs/features/access-control/acls

[docs-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities#tailscale-kubernetes-operator

[docs-dns-nameserver]: /docs/reference/dns-in-tailscale#tailscale-dns-设置

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-operator-customization]: /docs/kubernetes-operator/reference/tags

[docs-operator-install]: /docs/kubernetes

[docs-operator-oauth]: /docs/kubernetes-operator/install-operator#配置标签和-oauth-凭证

[docs-proxy-group]: /docs/kubernetes-operator/concepts/proxygroup

[xt-eso-kubernetes-provider]: https://external-secrets.io/latest/provider/kubernetes/

[xt-external-secrets]: https://external-secrets.io/

[xt-k8s-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
