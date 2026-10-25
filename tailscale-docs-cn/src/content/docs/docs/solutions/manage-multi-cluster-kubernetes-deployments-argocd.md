---
title: "使用 ArgoCD 管理多集群 Kubernetes 部署"
description: "使用 Tailscale 的私有网络搭建安全的多集群 Kubernetes 管理，让 ArgoCD 无需复杂组网即可连接跨区域的集群。"
---

最后验证于 Jan 5, 2026

## 简介

跨多个集群管理 Kubernetes 部署，是 DevOps 团队扩展基础设施时的常见挑战。无论你是为了冗余在不同区域运行集群、隔离开发与生产环境，还是管理边缘部署，[ArgoCD][xt-argocd] 都提供了强大的多集群 GitOps 能力。然而，将 ArgoCD 连接到远程集群通常需要复杂的组网配置、VPN 设置，或将 Kubernetes API 服务器暴露到互联网。

本指南介绍如何使用 Tailscale 的私有网络解决这个问题。你将配置 Tailscale Kubernetes Operator，在多个集群之间安全地暴露 Kubernetes API 服务器，让 ArgoCD 无需陷入传统组网方式的复杂性即可管理部署。读完本指南，你将拥有一套安全、可扩展的多集群设置，不再需要复杂的防火墙规则或 VPN 基础设施。

你将这样做：在每个集群中安装 Tailscale Kubernetes Operator，配置安全的 API 服务器代理，并设置 ArgoCD 通过 Tailscale 的加密网状网络与远程集群通信。这种方式比公开暴露 API 服务器更安全，同时比传统 VPN 方案容易管理得多。

*（图：架构图，展示控制集群中的 ArgoCD 通过 Tailscale 私有网络连接多个 Kubernetes 集群。每个集群都有一个启用了 API 服务器代理的 Tailscale Operator，实现跨 tailnet 的安全通信。）*

## 前提条件

* 多个 Kubernetes 集群（开发、staging、生产或区域集群）
* 一个拥有 [Admin](/docs/reference/user-roles) 权限的 [Tailscale 账户](https://login.tailscale.com/start)
* 每个集群中都已[安装][docs-operator-install] Tailscale Kubernetes Operator
* 你的控制集群（你将从中管理部署的集群）中已安装 ArgoCD
* 已为 Tailscale Kubernetes Operator [配置 OAuth 凭证][docs-operator-install]

## 安装带 API 服务器代理的 Tailscale Kubernetes Operator

第一步是在每个集群中安装启用了 API 服务器代理能力的 Tailscale Kubernetes Operator。这会创建一条安全隧道，让 ArgoCD 能够通过 Tailscale 的私有网络与远程 Kubernetes API 服务器通信。

你需要在计划管理的每个集群中安装 Operator，包括 ArgoCD 所在的集群。每次安装都需要一个唯一的主机名，以区分 Tailscale 网络（称为 tailnet）中的各个集群。

使用以下 [Helm][xt-helm] 命令在你的第一个集群中安装 Tailscale Kubernetes Operator：

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=cluster1-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --wait
```

多集群管理的关键配置选项是：

* `operatorConfig.hostname`：为该集群在你的 tailnet 中创建一个唯一标识（例如 `cluster1-k8s-operator`、`staging-k8s-operator` 或 `prod-k8s-operator`）。
* `apiServerProxyConfig.mode=true`：启用 Kubernetes API 服务器代理，实现对该集群 API 服务器的安全远程访问。

对你计划管理的每个集群重复这一安装，并确保每个集群的主机名唯一：

```shell
helm upgrade --install tailscale-operator tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<YOUR_OAUTH_CLIENT_ID> \
  --set-string oauth.clientSecret=<YOUR_OAUTH_CLIENT_SECRET> \
  --set operatorConfig.hostname=cluster2-k8s-operator \
  --set apiServerProxyConfig.mode=true \
  --wait
```

每次安装都会为对应集群创建一个安全入口点，ArgoCD 可以用它在你整个基础设施中部署和管理应用。

## 使用访问控制策略配置安全访问

在每个集群上安装 Tailscale Kubernetes Operator 之后，你需要配置 Tailscale [访问控制策略][docs-access-control]，以启用 ArgoCD 集群与远程 Kubernetes API 服务器之间的安全通信。这一步确保只有经过授权的组件才能访问你的集群，同时维护基础设施的安全。

如果不通过 tailnet 策略文件配置访问控制策略，Tailscale 的默认安全模型会阻止集群之间的通信，使 ArgoCD 无法管理远程部署。
推荐的最佳实践是使用[授权][docs-grants]（grants）来编写访问控制策略。下面的授权对哪些服务可以访问哪些集群提供了细粒度控制。

将以下授权策略添加到你的 tailnet 策略文件。你可以在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面更新 tailnet 策略文件：

> **注意：**
>
> 这条授权策略使用[应用能力（application capabilities）][docs-app-capabilities]为 Kubernetes 集群提供细粒度的访问控制。

```json
{
  "grants": [
    {
      "src": ["autogroup:admin", "tag:k8s"],
      "dst": ["tag:k8s-operator"],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": ["system:masters"]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

这段 tailnet 策略文件片段提供了：

* `"src"`：定义谁能访问 Kubernetes API 服务器。`autogroup:admin` 允许 Tailscale [Admin](/docs/reference/user-roles) 用户访问，`tag:k8s` 允许任何[打有][docs-tags] `k8s` 标签的设备访问（通常就是你的 ArgoCD 集群）。
* `"dst"`：指定来源（`src`）可以访问哪些 operator（即你的 API 服务器代理）。
* `"impersonate"`：授予对 Kubernetes 集群的管理访问权，使 ArgoCD 能够部署应用和管理资源。

`system:masters` 群组提供对 Kubernetes 集群的完整管理权限，ArgoCD 需要它来管理部署、创建命名空间并执行其他管理任务。

## 为 MagicDNS 设置 DNS 解析

要让你的 ArgoCD 集群能够解析 [Tailscale 主机名][docs-tailnet-names]（例如 `cluster1-k8s-operator.tailnet.ts.net`），你需要为 [MagicDNS][docs-magicdns] 配置 DNS 解析。

> **警告：**
>
> 这一步是必需的，因为 ArgoCD 需要解析 Tailscale 主机名才能连接远程集群。DNS 设置不正确时，ArgoCD 无法解析 Tailscale 私有网络使用的 `.ts.net` 域名，也就无法连接远程集群。

在你的 ArgoCD 集群中创建一个 DNS 配置资源：

```yaml
apiVersion: tailscale.com/v1alpha1
kind: DNSConfig
metadata:
  name: ts-dns
spec:
  nameserver:
    image:
      repo: tailscale/k8s-nameserver
      tag: unstable
```

使用 [`kubectl` 命令行工具][xt-k8s-kubectl]将此配置应用到你的集群：

```shell
kubectl apply -f dns-config.yaml
```

获取 Tailscale 名称服务器的 IP 地址。这个[存根 DNS 解析器][docs-dns-nameserver]由 Tailscale Kubernetes Operator 自动部署，为集群内的 `.ts.net` 域名提供 DNS 解析：

```shell
kubectl get dnsconfig ts-dns -o jsonpath='{.status.nameserverStatus.ip}'
```

记下返回的 IP 地址（例如 `100.64.0.4` 或 `10.100.124.196`）。稍后你将用这个 IP 地址配置 CoreDNS。

更新你的 CoreDNS 配置，把 Tailscale DNS 查询转发到 Tailscale 名称服务器：

```shell
kubectl edit configmap coredns -n kube-system
```

在 `Corefile` 部分添加以下块，并将 `<TAILSCALE_NAMESERVER_IP>` 替换为你记下的 IP 地址：

```yaml
ts.net:53 {
    errors
    cache 30
    forward . <TAILSCALE_NAMESERVER_IP>
}
```

这一配置确保你的 ArgoCD 集群能够解析 Tailscale 主机名，并与远程集群建立安全连接。

## 为远程集群创建出站服务

在你的 ArgoCD 集群中，你需要创建指向远程集群 Tailscale 主机名的 Kubernetes 服务。这些服务充当连接点，ArgoCD 可以借助它们与远程 Kubernetes API 服务器通信。

这些出站服务利用 [Tailscale 的服务发现][docs-services]能力，自动把流量经由 tailnet 路由到正确的集群。

为你计划管理的每个远程集群创建一个服务。以下是两个集群的示例：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cluster1-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: cluster2-k8s-operator
  annotations:
    tailscale.com/tailnet-fqdn: cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
spec:
  externalName: placeholder
  type: ExternalName
  ports:
  - name: https
    port: 443
    protocol: TCP
```

将 `<YOUR_TAILNET_NAME>` 替换为你 tailnet 的 MagicDNS 域。例如，如果你的 tailnet 是 `example.ts.net`，那么完全限定域名（[FQDN][xt-wiki-fqdn]）就是 `cluster1-k8s-operator.example.ts.net`。

将这些服务应用到你的 ArgoCD 集群：

```shell
kubectl apply -f cluster-services.yaml
```

Tailscale Kubernetes Operator 会自动更新这些服务，使其指向远程集群的正确 IP 地址，从而实现经由 tailnet 的无缝通信。

## 为远程集群生成 `kubeconfig`

ArgoCD 需要 [`kubeconfig` 文件][xt-k8s-kubeconfig]来向远程集群认证。[Tailscale CLI][docs-cli] 提供了一种基于你设置好的 Tailscale 主机名生成这些配置的方法。

为每个远程集群生成 `kubeconfig` 条目：

```shell
tailscale configure kubeconfig cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

```shell
tailscale configure kubeconfig cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net
```

这些命令会把集群配置添加到你的本地 `kubeconfig` 文件中，让 `kubectl` 和 ArgoCD 能够通过 Tailscale 的安全网络向远程集群认证。

生成的 `kubeconfig` 条目包含 ArgoCD 跨集群管理部署所需的证书和认证令牌。

## 将集群添加到 ArgoCD

最后一步是把你的远程集群注册到 ArgoCD，让它开始管理你基础设施中的部署。ArgoCD 使用你生成的 `kubeconfig` 条目与每个集群建立安全连接。

把每个远程集群添加到 ArgoCD：

```shell
argocd cluster add cluster1-k8s-operator.<YOUR_TAILNET_NAME>.ts.net --grpc-web
```

```shell
argocd cluster add cluster2-k8s-operator.<YOUR_TAILNET_NAME>.ts.net --grpc-web
```

`--grpc-web` 标志确保与 ArgoCD 的网页界面及其经由安全 Tailscale 网络的 API 服务器通信兼容。

验证你的集群是否已成功注册：

```shell
argocd cluster list
```

你应该会看到所有集群及其 Tailscale 主机名和连接状态都列在其中。ArgoCD 现在可以使用 GitOps 工作流向其中任何集群部署应用。

## 结语

你已成功使用 Tailscale 的私有网络，搭建了一个基于 ArgoCD 的安全多集群 Kubernetes 环境。你的设置现在支持跨多个集群的集中式 GitOps 管理，而无需传统组网方式的复杂性。

这一配置带来几项关键优势：

* **更高的安全性**：Kubernetes API 服务器不暴露到互联网，缩小攻击面。
* **组网更简单**：无需复杂的 VPN 配置或防火墙规则。
* **可扩展的架构**：安装 Operator 并指定唯一主机名即可轻松添加新集群。
* **统一管理**：ArgoCD 可以从单个[控制平面][docs-control-data-planes]向所有集群部署应用。

现在你可以创建针对不同集群的 ArgoCD 应用，按部署策略区分。例如，你可以把开发应用部署到开发集群，把生产应用部署到生产集群，全部通过 GitOps 工作流管理。

要了解高级配置，可以探索[自定义 Tailscale Kubernetes Operator][docs-operator-customization]来微调安全策略；遇到连接问题时，可以参阅[常见问题故障排除][docs-operator-troubleshooting]。

[xt-argocd]: https://argo-cd.readthedocs.io/en/stable/

[xt-helm]: https://helm.sh/

[xt-k8s-kubectl]: https://kubernetes.io/docs/reference/kubectl/

[xt-wiki-fqdn]: https://en.wikipedia.org/wiki/Fully_qualified_domain_name

[xt-k8s-kubeconfig]: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

[docs-access-control]: /docs/features/access-control

[docs-app-capabilities]: /docs/integrations/identity/custom-oidc

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-data-planes]: /docs/features/oauth-clients

[docs-dns-nameserver]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-operator-customization]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-install]: /docs/kubernetes-operator/install-operator

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-services]: /docs/features/services

[docs-tags]: /docs/features/tags

[docs-tailnet-names]: /docs/features/magicdns#fully-qualified-domain-names-vs-machine-names
