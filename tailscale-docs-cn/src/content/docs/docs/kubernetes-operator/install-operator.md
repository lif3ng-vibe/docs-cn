---
title: "安装 Tailscale Kubernetes Operator"
description: "在你的 Kubernetes 集群中安装 Tailscale Kubernetes Operator。"
---

最后验证于 Jun 5, 2026

本指南介绍如何在你的集群中设置 Tailscale Kubernetes Operator。你将配置访问控制标签、创建 OAuth 凭证，然后使用 Helm 或静态清单安装 Operator。

如果你不想使用 OAuth 凭证，可以改为[使用工作负载身份联合（workload identity federation）安装 Operator][docs-k8s-workload-identity]。

## 前提条件

已知的兼容性问题请参阅[兼容性指南][docs-k8s-compatibility]。

开始之前，请确保你具备以下条件：

* 一个 Kubernetes 集群。
* 能够访问管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 和 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。
* 熟悉[标签][docs-tags]和 [OAuth 客户端凭证][docs-oauth-clients]。

## 配置标签和 OAuth 凭证

在安装 Operator 之前，你需要创建标签和一个 OAuth 客户端供 Operator 使用。

1. 在你的 [Access controls](https://console.tailscale.com/admin/acls/file) 中，在 `tagOwners` 部分下添加以下内容：

   ```json
   "tagOwners": {
     "tag:k8s-operator": [],
     "tag:k8s": ["tag:k8s-operator"],
   }
   ```

   这将会：

   * 创建[标签][docs-tags] `tag:k8s-operator` 和 `tag:k8s`。
   * 让 `tag:k8s-operator` 成为 `tag:k8s` 的所有者（这样 Operator 就能管理带有 `tag:k8s` 的设备）。

   \[Missing snippet: visual\_policy\_editor.mdx]

2. 在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面[创建一个 OAuth 客户端][docs-oauth-clients-setup]。创建客户端时，为以下权限授予 `write` 作用域：

   * `General/Services`（附带 `tag:k8s-operator`）
   * `Devices/Core`（附带 `tag:k8s-operator`）
   * `Keys/Auth Keys`（附带 `tag:k8s-operator`）

Operator 会使用这些凭证通过 [Tailscale API][docs-api] 管理设备，并为自己及其管理的设备创建[认证密钥（auth key）][docs-auth-keys]。

## 安装 Operator

默认安装会创建：

* 一个 `"tailscale"` `Namespace`。
* 一个 `"operator"` `Deployment`。
* Operator 的基于角色的访问控制（RBAC）。
* 一个 `"tailscale"` `IngressClass`。
* `ProxyClass`、`Connector`、`ProxyGroup`、`DNSConfig`、`Recorder`、`Tailnet` 自定义资源定义（CRD）。

安装 Tailscale Kubernetes Operator 有两种方式：

* 使用 [Helm][ar-helm] 安装。
* 应用 [`kubectl` 静态清单][ar-static-manifests]。

### 使用 Helm 安装

Tailscale Kubernetes Operator 的 Helm 图表可从两个图表仓库获取：

* `https://pkgs.tailscale.com/helmcharts` 仓库包含经过充分测试的图表，对应[稳定的 Tailscale 版本][docs-versions]。
* `https://pkgs.tailscale.com/unstable/helmcharts` 仓库包含最新改动的图表，在正式版本之间发布。

两个仓库中的图表是同一图表的不同版本，你可以从一个升级到另一个。

> **注意：**
>
> 新的 Tailscale 稳定版本正式发布几天后，对应的 Helm 图表和容器镜像才会发布。

在 `tailscale` 命名空间中从 `https://pkgs.tailscale.com/helmcharts` 安装最新的 Kubernetes Tailscale Operator：

1. 将 `https://pkgs.tailscale.com/helmcharts` 添加到你的本地 Helm 仓库：

   ```shell
   helm repo add tailscale https://pkgs.tailscale.com/helmcharts
   ```

2. 更新你的本地 Helm 缓存：

   ```shell
   helm repo update
   ```

3. 安装 Operator，并传入你之前创建的 OAuth 客户端凭证：

   ```shell
   helm upgrade \
     --install \
     tailscale-operator \
     tailscale/tailscale-operator \
     --namespace=tailscale \
     --create-namespace \
     --set-string oauth.clientId="<OAuth client ID>" \
     --set-string oauth.clientSecret="<OAuth client secret>" \
     --wait
   ```

4. [验证][ar-validation] Operator 已成功加入你的 tailnet。

### 使用 kubectl 静态清单安装

1. 从 [`tailscale/tailscale`][xt-gh-tailscale-repo] 仓库下载 Tailscale Kubernetes Operator 的[清单文件][xt-gh-tailscale-k8s-operator]。

2. 编辑你下载的清单文件：

   * 找到 `# SET CLIENT ID HERE` 并替换为你的 OAuth 客户端 ID。
   * 找到 `# SET CLIENT SECRET HERE` 并替换为你的 OAuth 客户端密钥。OAuth 客户端密钥区分大小写。

   客户端 ID 和密钥都请给值加上引号，避免未加引号的字符串被 YAML 误解析。例如使用：

   ```yaml
   client_id: "k123456CNTRL"
   client_secret: "tskey-client-k123456CNTRL-abcdef"
   ```

3. 将编辑后的文件应用到你的 Kubernetes 集群：

   ```shell
   kubectl apply -f operator.yaml
   ```

4. [验证][ar-validation] Operator 已成功加入你的 tailnet。

## 验证

要确认 Tailscale Operator 已加入你的 tailnet，请打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，查找名为 `tailscale-operator`（或你自定义的主机名）且带有 `tag:k8s-operator` 标签的节点。

Operator 加入你的 tailnet 可能需要一些时间，因为容器镜像要下载、Pod 要启动。

## 进一步探索

* 在[实操演练][docs-k8s-walkthrough]中按步骤了解 Operator。
* 经 Tailscale [访问][docs-k8s-api-access] Kubernetes API。
* 把集群工作负载[公开][docs-k8s-ingress]到你的 tailnet。
* 在 Kubernetes 中[访问][docs-k8s-egress] tailnet 节点或服务。
* 配置[多集群入站][docs-k8s-multi-cluster-ingress]。
* 启用 [kubectl 会话录制][docs-k8s-session-recording]。
* 在 Kubernetes 中[托管][docs-k8s-host-resources] Tailscale 资源。
* [配置][docs-operator-customization] Operator 的高级设置。
* [排查][docs-operator-troubleshooting]部署和连接问题。

[ar-helm]: #使用-helm-安装

[ar-static-manifests]: #使用-kubectl-静态清单安装

[ar-validation]: #验证

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-k8s-api-access]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-k8s-compatibility]: /docs/kubernetes-operator/reference/compatibility

[docs-k8s-egress]: /docs/kubernetes-operator/egress

[docs-k8s-host-resources]: /docs/kubernetes-operator/connector/deploy-subnet-router

[docs-k8s-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-k8s-session-recording]: /docs/kubernetes-operator/recorder

[docs-k8s-workload-identity]: /docs/kubernetes-operator/manage-and-configure/workload-identity-federation

[docs-k8s-walkthrough]: /docs/kubernetes-operator/quickstart

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-oauth-clients-setup]: /docs/features/oauth-clients#setting-up-an-oauth-client

[docs-operator-customization]: /docs/kubernetes-operator/concepts/proxyclass

[docs-operator-troubleshooting]: /docs/kubernetes-operator/reference/troubleshooting

[docs-tags]: /docs/features/tags

[docs-versions]: /docs/reference/tailscale-client-versions

[xt-gh-tailscale-k8s-operator]: https://github.com/tailscale/tailscale/blob/main/cmd/k8s-operator/deploy/manifests/operator.yaml

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale
