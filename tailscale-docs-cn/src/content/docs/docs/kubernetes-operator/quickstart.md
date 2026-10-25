---
title: "Tailscale Kubernetes Operator 快速开始教程"
description: "一份 Tailscale Kubernetes Operator 及其核心功能的实操指南。"
---

最后验证于 Jul 28, 2026

本主题涵盖多个场景，演示 [Tailscale Kubernetes Operator][docs-kubernetes-operator] 的用法。你将全程使用 Tailscale 安全地公开服务、连接多个集群并搭建高可用服务。

## Tailscale Kubernetes Operator 做什么

Tailscale Kubernetes Operator 为你的 Kubernetes 集群提供安全连接。以下是一些用例。

* **安全访问**：经 Tailscale 安全访问 [Kubernetes API 服务器][xt-k8s-api-server]，而不必把它暴露到公共互联网。
* **公开服务**：把集群中部署的服务公开到你的 tailnet，还可以选择通过 [Tailscale Funnel][docs-funnel] 公开到公共互联网。
* **连接其他服务**：让集群中的 pod 能够连接 tailnet 中的服务，包括其他集群中的服务。
* **子网路由器和出口节点**：Operator 还可以充当[子网路由器][docs-subnet-routers]或[出口节点][docs-exit-nodes]。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个 [Tailscale 账户](https://login.tailscale.com/start)。
* 已安装并配置 [`kubectl`][xt-kubectl]。
* 已安装 [`helm`][xt-helm]。
* 已安装 [`kind`][xt-kind]。本地集群可选。

## 初始设置

本节介绍初始设置。先下载入门脚本和清单：

```shell
curl -sL https://tailscale.com/k8s/getting-started.tar.gz | tar xz
cd getting-started
```

这会下载并解压出一个 `getting-started/` 目录，其中包含本主题全程使用的分步脚本和 Kubernetes 清单。

### 为你的 tailnet 启用 HTTPS

操作说明请参阅[启用 HTTPS][docs-enabling-https]。

### 配置 Tailscale ACL

Operator 需要特定的 [ACL][docs-acls] 来管理 tailnet 中的设备和服务。这里也是创建你在[下一节][ar-create-oauth]中需要的 `tag:k8s-operator` 的地方。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls)。
2. 将以下内容添加到你的 ACL 中：

   ```json
   {
     "tagOwners": {
       "tag:k8s-operator": ["autogroup:admin"],
       "tag:k8s":          ["tag:k8s-operator"],
     },
     "autoApprovers": {
       "services": {
         "tag:k8s": ["tag:k8s"],
       },
     },
     "acls": [
       // 允许 tailnet 内的所有设备相互通信。此规则仅应
       // 用于个人和测试 tailnet。
       {"action": "accept", "src": ["*"], "dst": ["*:*"]},
     ],
     "grants": [
       // 允许 tailnet 中的所有设备与 API 服务器代理通信。此规则仅应
       // 用于个人和测试 tailnet。
       {
         "src": ["*"],
         "dst": ["tag:k8s-operator"],
         "ip": ["tcp:443"]
       }
     ],
     "nodeAttrs": [
       // 允许 Kubernetes Operator 使用 Tailscale Funnel
       {
         "target": ["tag:k8s"], // Tailscale Operator 用来标记代理的标签；默认为 'tag:k8s'
         "attr":   ["funnel"],
       },
     ],
   }
   ```

   > **注意：**
   >
   > 如果你已有 `tagOwners`、`grants`、`nodeAttrs`、`autoApprovers` 或 `acls` 部分，请把这些规则合并到现有配置中。

### 创建 OAuth 凭证并配置 Secret

Tailscale Kubernetes Operator 需要 [OAuth 凭证][docs-oauth-clients]才能代表你与 Tailscale API 交互。本主题中，你需要创建两个独立的 OAuth 客户端，并配置对应的 Kubernetes secret。

**集群 1：**

1. 前往管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。
2. 选择 **+ Credential**。
3. 给客户端一个描述，例如 `cluster-1-operator`。
4. 添加以下作用域：
   * **General > Services**：`Read` 和 `Write`
   * **Devices > Core**：`Read` 和 `Write`
   * **Keys > Auth Keys**：`Read` 和 `Write`
5. 在 **Tags** 框中，选择 **Add tags** 并选择 **tag:k8s-operator**。如果在列表中找不到该标签，请参阅[上一节][ar-configure-acls]。
6. 选择 **Generate credential**。
7. 复制 **Client ID** 和 **Client secret**。
8. 打开 `cluster-1-oauth.yaml`，在对应字段中填入 **Client ID** 和 **Client secret**。凭证应为**明文**。

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: operator-oauth
     namespace: tailscale
   stringData:
     client_id: "your-client-id-for-cluster-1"
     client_secret: "your-client-secret-for-cluster-1"
   ```

**集群 2：**

重复上述过程，生成凭证并填入 `cluster-2-oauth.yaml` secret。务必给 OAuth 客户端一个唯一的描述，例如 `cluster-2-operator`。

### 运行设置脚本

现在你可以开始创建 Kubernetes 集群并在其上安装 Tailscale Operator。`00-setup.sh` 脚本会替你完成这些工作。使用哪些集群有两种选择：

**选项 1：使用 `kind` 创建本地集群**

如果你安装了 `kind`，可以让脚本为你创建两个本地集群。

从仓库根目录运行脚本：

```shell
./00-setup.sh
```

该脚本会：

* 创建两个名为 `cluster-1` 和 `cluster-2` 的 `kind` 集群。
* 使用 [Helm][xt-helm] 在每个集群中安装 Tailscale Kubernetes Operator。
* 应用你创建的 OAuth secret。
* 为每个集群配置 Operator。

**选项 2：使用你自己的集群**

如果你想使用自己现有的 Kubernetes 集群，请把它们的 `kubectl` 上下文指定为环境变量。

如果选择此选项，Tailscale 建议先查阅 Operator 文档，确认 [Kubernetes 版本][docs-k8s-compatibility]和 [CNI][docs-cni-compatibility] 兼容性。

> **警告：**
>
> 为了启用第一部分（安全访问 API 服务器），设置脚本会创建一个 [`ClusterRoleBinding`][xt-k8s-clusterrolebinding]，为你的 tailnet 用户授予集群上的 `cluster-admin` 权限。不要对生产集群运行此操作。

准备好后，将 `CLUSTER_1` 和 `CLUSTER_2` 环境变量设置为你的集群上下文并运行脚本：

```shell
CLUSTER_1=<your-cluster-1-context> CLUSTER_2=<your-cluster-2-context> ./00-setup.sh
```

然后，脚本会在你指定的集群上执行相同的 Operator 安装和配置步骤。

脚本完成后，你就有了两个就绪的 Kubernetes 集群。

## 用例

设置完成后，来试试 Tailscale Kubernetes Operator 的一些用例。

### 安全访问 API 服务器

使用 Tailscale Kubernetes Operator，经你的 tailnet 安全访问集群的 [API 服务器][xt-k8s-api-server]。

`00-setup.sh` 脚本安装 Operator 时，使用了 `--set-string apiServerProxyConfig.mode="true"` 标志进行配置。这会启用 [**API 服务器代理**][docs-api-server-proxy]功能，在 Operator 的 pod 中运行一个代理，让你可以经 tailnet 安全访问 Kubernetes API 服务器。

要经 Tailscale 访问 API 服务器，请更新你的 [`kubeconfig`][xt-k8s-kubeconfig] 使其指向该代理。使用 [`tailscale configure kubeconfig`][docs-api-server-proxy] 命令，它会在你的 `kubeconfig` 中添加一个新的上下文，经 Tailscale 代理路由：

```shell
tailscale configure kubeconfig <operator-hostname>
```

为了省事，`01-api-access.sh` 脚本会替你完成这一步。它会等待 API 服务器代理就绪，然后为两个集群运行 `tailscale configure kubeconfig`。

1. 运行脚本：

   ```shell
   ./01-api-access.sh
   ```

2. 脚本完成后，你就可以使用新的 `kubeconfig` 条目访问集群了。试着对其中一个集群运行 `kubectl` 命令：

   ```shell
   kubectl get nodes
   ```

现在你正在经 Tailscale 安全访问集群的 API 服务器，没有暴露到公共互联网。

**RBAC 呢？**

你可能想知道[基于角色的访问控制（RBAC）][xt-k8s-rbac]如何与 API 服务器代理配合。`00-setup.sh` 脚本会创建一个 `ClusterRoleBinding`，为你的 Tailscale 用户授予 `cluster-admin` 权限：

```shell
kubectl --context ${CLUSTER_1} create clusterrolebinding ts-cluster-admin --clusterrole=cluster-admin --user=${ts_user}
```

Tailscale API 服务器代理会把用户的身份嵌入请求头。这意味着你可以使用标准 Kubernetes RBAC，基于 Tailscale 身份控制访问。

你可以运行以下命令查看该 `ClusterRoleBinding`：

```shell
kubectl describe clusterrolebinding ts-cluster-admin
```

输出会在 `Subjects` 字段中显示你的 Tailscale 用户身份（通常是你的电子邮箱地址）。

```
Name:         ts-cluster-admin
Labels:       <none>
Annotations:  <none>
Role:
 Kind:  ClusterRole
 Name:  cluster-admin
Subjects:
 Kind  Name                  Namespace
  ----  ----                  ---------
  User  alice@example.com
```

更多信息请参阅[经 Tailscale 访问 Kubernetes API 服务器][docs-api-server-proxy]。

### 使用 Tailscale Ingress 公开服务

接下来，使用 [Tailscale Ingress][docs-ingress] 把集群中运行的工作负载公开到你的 tailnet。本节使用一个 Tailscale 主题的演示 web 应用。

1. 把 "Tailnet Connect" 游戏部署到 `cluster-1`：

   ```shell
   ./02-tailnet-connect-game.sh
   ```

   该脚本应用 `ingress/deploy.yaml` 清单，为应用创建标准的 Kubernetes [`Deployment`][xt-k8s-deployment] 和 [`Service`][xt-k8s-service]。

2. 使用 Tailscale Ingress 把游戏公开到你的 tailnet：

   ```shell
   ./03-tailnet-connect-game-ingress.sh
   ```

   该脚本应用 `ingress/ingress.yaml` 清单。此文件的关键部分如下：

   ```yaml
   # ingress/ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: tailnet-connect-game
   spec:
     defaultBackend:
       service:
         name: tailnet-connect-game
         port:
           number: 80
     ingressClassName: tailscale
     tls:
       - hosts:
           - tailnet-connect-game
   ```

   把 `spec.ingressClassName` 设置为 `tailscale`，就是请 Tailscale Kubernetes Operator 接管这个 `Ingress`。Operator 会在你的 tailnet 中预置一个新的 Tailscale 节点，并把流量代理到后端服务。

3. `Ingress` 完全配置好、TLS 证书签发并配置完成，可能需要一两分钟。你可以运行以下命令检查其状态：

   ```shell
   kubectl get ingress tailnet-connect-game
   ```

   当 `ADDRESS` 字段填充了 [MagicDNS][docs-magicdns] 名称后，复制并在浏览器中打开即可玩游戏。

### 使用 Funnel 公开服务

现在，使用 [Tailscale Funnel][docs-funnel] 把同一服务公开到公共互联网。

1. 为该 `Ingress` 启用 Funnel：

   ```shell
   ./04-tailnet-connect-game-funnel.sh
   ```

   该脚本应用 `ingress/ingress-funnel.yaml` 清单，为上一步创建的 `Ingress` 添加 `tailscale.com/funnel: "true"` [注解][xt-k8s-annotations]。这会告诉 Operator 通过 Funnel 公开该服务。

   生成的 `Ingress` 如下所示：

   ```yaml
   # ingress/ingress-funnel.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: tailnet-connect-game
     annotations:
       tailscale.com/funnel: "true"
   spec:
     defaultBackend:
       service:
         name: tailnet-connect-game
         port:
           number: 80
     ingressClassName: tailscale
     tls:
       - hosts:
           - tailnet-connect-game
   ```

2. 你可以使用 `kubectl get ingress tailnet-connect-game`，在 `Ingress` 的 `ADDRESS` 字段中找到公共 URL。

3. 在浏览器中通过公共 URL 访问游戏。你也可以试着在设备上关闭 Tailscale，确认它能从公共互联网访问。

更多信息请参阅[使用 Ingress 将集群工作负载公开到你的 tailnet][docs-ingress]。

### 多集群互联

本节介绍如何连接运行在不同集群中的服务。把演示应用部署到两个集群，并配置它们相互通信。该演示应用有两种模式："game" 模式（你已经见过）和 "visualizer" 模式。在 visualizer 模式下，它会尝试连接对端服务。你会观察到它在尝试连接对端服务时的一些有趣行为。

1. 把应用部署到两个集群：

   ```shell
   ./05-multi-cluster-deploy.sh
   ```

   该脚本把应用部署到两个集群。查看 `cross-cluster/tailnet-connect-1.yaml`：

   ```yaml
   # cross-cluster/tailnet-connect-1.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-1
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale
   ...
   ---
   apiVersion: apps/v1
   kind: Deployment
   ...
         env:
           - name: PEER_URL
             value: "http://tailnet-connect-2-egress.default.svc.cluster.local"
   ```

   把 `spec.type` 设置为 `LoadBalancer`、`spec.loadBalancerClass` 设置为 `tailscale`，就是告诉 Operator 用 MagicDNS 名称把这个 `Service` 公开到 tailnet。`Deployment` 被配置为与名为 `tailnet-connect-2-egress` 的服务通信，你将在下一步设置它。`cluster-2` 也会应用类似的配置。

2. 访问 web UI。你可以通过 MagicDNS 名称访问任一集群中运行的应用的 web UI：

   ```shell
   http://default-tailnet-connect-1.<your-tailnet>
   ```

   或者

   ```shell
   http://default-tailnet-connect-2.<your-tailnet>
   ```

   几秒钟后，web UI 会显示它无法经 tailnet 连接到对端服务。

3. 配置跨集群通信：

   ```shell
   ./06-multi-cluster-connect.sh
   ```

   该脚本让一个集群中的 pod 能够与另一个集群中的服务通信。它对每个方向分两步完成。第一步，创建一个 Kubernetes `Service`：

   ```yaml
   # cross-cluster/tailnet-connect-2-egress.yaml（应用到 cluster-1）
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-2-egress
   spec:
     type: ExternalName
     externalName: placeholder # 会被忽略
   ```

   这个 Kubernetes `Service` 的类型是 [`ExternalName`][xt-k8s-externalname]，因为 Operator 需要它来把流量路由到 Tailscale 管理的代理。

   第二步，用另一个集群中服务的 MagicDNS 名称注解这个服务：

   ```shell
   kubectl annotate service tailnet-connect-2-egress \
     tailscale.com/tailnet-fqdn="default-tailnet-connect-2.${magic_dns}"
   ```

   `tailscale.com/tailnet-fqdn` 注解告诉 Tailscale Kubernetes Operator 的出站代理，把对 `tailnet-connect-2-egress.default.svc.cluster.local` 的请求解析到 tailnet 中指定的 MagicDNS 名称。这让 `cluster-1` 中的应用可以用标准 Kubernetes 服务名连接到 `cluster-2` 中的应用。

4. 现在，回到任一集群的浏览器标签页（使用 MagicDNS 名称 `default-tailnet-connect-1.<your-tailnet>` 或 `default-tailnet-connect-2.<your-tailnet>`），UI 中的 Tailscale 标志会从随机闪烁的点变成排列成 Tailscale 标志的点，下方还有一个绿色的"在线"指示。两个应用正在跨集群相互通信。

更多信息请参阅[使用 Egress 从集群访问 tailnet 资源][docs-egress]。

### 高可用

你可以搭建一个在两个集群中都有副本的高可用服务。Tailscale 的[多集群入站][docs-multi-cluster]能力让你可以把流量负载均衡到不同集群中的服务。

1. 部署高可用服务。为了更容易区分集群，运行脚本时把 `CLUSTER_1_COLOR` 和 `CLUSTER_2_COLOR` 环境变量设置为你喜欢的颜色。例如：

   ```shell
   CLUSTER_1_COLOR=orange CLUSTER_2_COLOR=purple ./07-tailnet-connect-game-ha.sh
   ```

   该脚本向每个集群应用两个关键清单。第一个是 `multi-cluster-replica/proxy-group.yaml`，它定义了一个 [`ProxyGroup`][docs-proxygroup]——一种在 Tailscale 命名空间中部署一组 Tailscale 代理的自定义资源。这个 `ProxyGroup` 的 `spec.type` 为 `ingress`，因此被配置用于入站。根据你打算如何使用该 `ProxyGroup`，`spec.type` 字段也可以设置为 `egress` 或 `kube-apiserver`。

   > **注意：**
   >
   > 你也可以使用 `spec.replicas` 部署副本以实现高可用。

   ```yaml
   # multi-cluster-replica/proxy-group.yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyGroup
   metadata:
     name: ingress-proxies
   spec:
     type: ingress
   ```

   第二个是 `multi-cluster-replica/service.yaml`，它创建一个使用这些 `ProxyGroup` 代理（通过 `tailscale.com/proxy-group` 注解）的 [`LoadBalancer`][xt-k8s-loadbalancer] 服务，让后端可以被 tailnet 访问。

   ```yaml
   # multi-cluster-replica/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-game
     annotations:
       tailscale.com/proxy-group: ingress-proxies # 将此 Service 分配给 ProxyGroup
       tailscale.com/hostname: tailnet-connect-game-multi-cluster # 设置高可用服务的 MagicDNS 名称
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale # 指定由 Tailscale 管理此 LoadBalancer
   ...
   ```

   把这两个清单应用到两个集群后，就是告诉每个集群中的 Tailscale Kubernetes Operator，把主机名 `tailnet-connect-game-multi-cluster` 配置为在 `ProxyGroup` `ingress-proxies` 上通告。现在每个集群中的 Kubernetes `Service` 都可以通过相同的 MagicDNS 名称 `tailnet-connect-game-multi-cluster.<your-tailnet>` 访问。

   > **注意：**
   >
   > `ProxyGroup` 功能使用了 [Tailscale Services][docs-tailscale-services]。详情请参阅相关文档。

2. 使用 MagicDNS 名称 `http://tailnet-connect-game-multi-cluster.<your-tailnet>` 访问应用。"Tailnet Connect" 游戏会显示出来，点的颜色表示由哪个集群服务该请求。

3. 每次刷新可能都显示相同颜色的点，这可能与你对常规轮询负载均衡的预期不同。这是因为你的 Tailscale 客户端会尝试寻找到后端的最优路由，可能更偏好其中一个目标。

   要模拟故障并观察故障转移，可以把你当前看到的颜色所对应集群中的 deployment 缩容到 0。

   ```shell
   # 对于 cluster-1
   kubectl scale deployment tailnet-connect-game --replicas=0

   # 对于 cluster-2
   kubectl scale deployment tailnet-connect-game --replicas=0
   ```

4. 刷新浏览器页面。几秒钟后，你会发现游戏仍在运行，但点的颜色变了。现在为你服务的是另一个集群。`ProxyGroup` 自动检测到故障，并取消了对这个 MagicDNS 名称的通告，从而把所有流量路由到健康的副本。

更多信息请参阅[跨集群连接服务][docs-connect-services]。

## 进一步探索

* [了解 Tailscale Kubernetes Operator][docs-concepts]，学习其架构及它管理的自定义资源。
* [管理和配置 Tailscale Kubernetes Operator][docs-manage-and-configure]，运维并调优你的部署。
* [Tailscale Kubernetes Operator 参考][docs-reference]，查看详细的参考文档。

\[Missing snippet: tailscale\_skill.mdx]

[ar-configure-acls]: #配置-tailscale-acl

[ar-create-oauth]: #创建-oauth-凭证并配置-secret

[docs-acls]: /docs/features/access-control#access-control-lists-acls

[docs-api-server-proxy]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-cni-compatibility]: /docs/kubernetes-operator/reference/compatibility

[docs-concepts]: /docs/kubernetes-operator/concepts

[docs-connect-services]: /docs/kubernetes-operator/ingress/multi-cluster-service-mirroring

[docs-egress]: /docs/kubernetes-operator/egress

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-compatibility]: /docs/kubernetes-operator/reference/compatibility#kubernetes-版本

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-magicdns]: /docs/features/magicdns

[docs-manage-and-configure]: /docs/kubernetes-operator/manage-and-configure

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-reference]: /docs/kubernetes-operator/reference

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailscale-services]: /docs/features/tailscale-services

[xt-helm]: https://helm.sh/docs/intro/install/

[xt-k8s-annotations]: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/

[xt-k8s-api-server]: https://kubernetes.io/docs/concepts/architecture/#kube-apiserver

[xt-k8s-clusterrolebinding]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

[xt-k8s-deployment]: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

[xt-k8s-externalname]: https://kubernetes.io/docs/concepts/services-networking/service/#externalname

[xt-k8s-kubeconfig]: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

[xt-k8s-loadbalancer]: https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer

[xt-k8s-rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/

[xt-k8s-service]: https://kubernetes.io/docs/concepts/services-networking/service/

[xt-kind]: https://kind.sigs.k8s.io/docs/user/quick-start/

[xt-kubectl]: https://kubernetes.io/docs/tasks/tools/
