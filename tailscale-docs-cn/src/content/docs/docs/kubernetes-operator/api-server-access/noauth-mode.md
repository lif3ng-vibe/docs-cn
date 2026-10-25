---
title: "在不使用 Tailscale 身份验证的情况下使用 API 服务器代理"
description: "在 noauth 模式下，API 服务器代理将请求转发给 Kubernetes API 服务器时不添加任何身份验证或模拟头。当 Tailscale 为 API 服务器提供安全连接、身份验证由其他机制处理时，这种模式非常有用"
---

最后验证于 Jun 5, 2026

在 noauth 模式下，API 服务器代理将请求转发给 Kubernetes API 服务器时不添加任何身份验证或模拟头。当 Tailscale 为 API 服务器提供安全连接、身份验证由其他机制处理时，这种模式非常有用。

## 何时使用 noauth 模式

noauth 模式专为身份验证在外部处理的环境设计，例如：

* **托管 Kubernetes 与云 IAM**：云提供商有自己的身份验证机制（例如 IAM 角色、OIDC 令牌）。在这些环境中，Tailscale 提供通往 API 服务器的私有连接，而云提供商的身份验证机制保持不变。
* **外部身份验证代理**：如果你已经在 API 服务器前面运行了[身份验证代理][xt-k8s-auth-proxy]，noauth 模式可以避免与其冲突。

## 前提条件

开始之前，请完成以下操作：

* [安装][docs-k8s-install] Tailscale Kubernetes Operator。
* 为你的 tailnet [启用 HTTPS][docs-enabling-https]。
* 确保你的[访问控制策略][docs-acls]允许设备通过 TCP 端口 `443` 访问代理。

## 以 noauth 模式安装进程内代理

你可以使用 Helm 或静态清单安装代理。

### Helm

运行以下命令，以 noauth 模式安装带 API 服务器代理的 Operator：

```shell
helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<oauth-client-id> \
  --set-string oauth.clientSecret=<oauth-client-secret> \
  --set-string apiServerProxyConfig.mode="noauth" \
  --wait
```

### 静态清单

在 Operator 部署中设置 `APISERVER_PROXY` 环境变量：

```yaml
name: APISERVER_PROXY
value: "noauth"
```

## 以 noauth 模式用 ProxyGroup 部署

你还可以将 noauth 代理部署为 [`ProxyGroup`][docs-proxygroup] 以实现高可用。将 `spec.kubeAPIServer.mode` 设置为 `noauth`：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: ProxyGroup
metadata:
  name: my-cluster
spec:
  type: kube-apiserver
  replicas: 2
  kubeAPIServer:
    mode: noauth
```

有关配置详情的更多信息，请参阅 [Tailscale Kubernetes Operator 高可用][docs-ha]。

## 身份验证与授权

在 noauth 模式下，代理在 `<proxy-hostname>:443` 上暴露 Kubernetes API 服务器，且不修改请求。你需要自行通过现有机制配置身份验证。

例如，对于 GCP GKE，你可以照常使用 `gcloud` CLI 生成 kubeconfig，然后将 `server` 字段更新为指向代理的 MagicDNS FQDN。现有的 `gcloud` 身份验证插件会继续处理身份验证，而 Tailscale 提供通往 API 服务器的私有网络路径。

同样的方法也适用于 AWS EKS（使用 `aws-iam-authenticator` 或 `aws eks get-token`）和 Azure AKS。在这几种情况下，Tailscale 都能取代公共 API 端点或通往 VPC 的 VPN。

> **注意：**
>
> 一些 Kubernetes 发行版（例如 k3s）默认使用客户端证书进行身份验证。代理在 noauth 模式下不会转发客户端证书。如果你的发行版没有云 IAM 插件之类的外部身份验证机制，请改用 [auth 模式][docs-auth-mode]。

## 配置 kubeconfig

由于 noauth 模式依赖你现有的身份验证机制，请以云提供商生成的 kubeconfig 为起点，这样可以保留你的身份验证插件配置。

例如，对于 GKE，照常生成 kubeconfig：

```shell
gcloud container clusters get-credentials my-cluster --region us-central1
```

然后修改集群条目，使其指向代理。将 `server` 改为代理的完整 MagicDNS FQDN，并移除 `certificate-authority-data`（代理的 Let's Encrypt 证书已受你的系统信任）：

```yaml
clusters:
  - cluster:
      server: https://tailscale-operator.<tailnet>.ts.net:443
      # 移除 certificate-authority-data
    name: my-cluster
users:
  - name: my-cluster-user
    user:
      exec:
        command: gke-gcloud-auth-plugin  # 保持不变
        ...
```

TLS 证书是为完整 FQDN（例如 `tailscale-operator.<tailnet>.ts.net`）签发的，而不是短主机名。你的云提供商身份验证插件保持不变。

> **警告：**
>
> noauth 模式下代理本身不需要任何 Kubernetes RBAC 配置。但是，你仍需确保到达 API 服务器的请求已被你使用的某种机制（例如云提供商 IAM、身份验证代理或客户端证书）完成身份验证。

## 进一步探索

* 使用 auth 模式[通过 Tailscale 访问][docs-access-api] Kubernetes API。
* [配置][docs-auth-rbac]身份验证与授权。

[docs-access-api]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-auth-mode]: /docs/kubernetes-operator/api-server-access#身份验证模式默认

[docs-acls]: /docs/features/access-control/acls

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-ha]: /docs/kubernetes-operator/manage-and-configure/high-availability

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[xt-k8s-auth-proxy]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#authenticating-proxy
