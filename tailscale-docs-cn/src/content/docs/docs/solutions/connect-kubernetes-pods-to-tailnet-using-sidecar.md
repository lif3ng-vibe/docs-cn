---
title: "使用 sidecar 将 Kubernetes pod 连接到你的 tailnet"
description: "在 Kubernetes 中将 Tailscale 容器镜像作为 sidecar（边车）运行，涵盖持久状态、DNS 配置、认证与路由指南。"
---

最后验证于 Mar 28, 2026

某些 Kubernetes 工作负载需要在集群之外的网络中拥有自己的身份：每个 pod 都可以被单独寻址、单独命名，并受各自的访问规则约束。标准 Kubernetes 网络为 pod 提供的是服务抽象背后的临时 IP，因此从别处访问特定 pod 通常意味着搭建 VPN 网关、防火墙规则或不保留 per-pod 身份的 ingress 控制器。Tailscale sidecar 的解决方式，是在你的 pod 内部作为次要容器运行 Tailscale 客户端。同一 pod 中的容器共享网络命名空间和生命周期，因此 sidecar 无需修改应用本身就能为应用扩展 tailnet 连接能力，pod 会在你的 Tailscale 网络（称为 tailnet）上获得一个专属身份。

当你需要 tailnet 中的 per-pod 身份时，请使用 sidecar。每个副本都成为独立的设备，因此你可以编写针对特定 pod 的[访问控制规则][docs-access-control]，为单个工作负载分配稳定的 tailnet 主机名，或授予某个 pod 对 tailnet 资源的出站访问而不暴露集群的其他部分。有状态工作负载、跳板机和专用代理是常见场景。代价在运维层面：1,000 个 pod 就意味着要管理 1,000 个 tailscaled 实例、1,000 次设备注册和 1,000 条保活连接。如果你的工作负载只需要共享的集群出入连接能力，[Tailscale Kubernetes Operator][docs-operator]运行的共享代理可以替你处理[入站（ingress）][docs-cluster-ingress]、[出站（egress）][docs-cluster-egress]、生命周期、状态和认证。

本指南介绍如何在不用 Operator 的情况下，将 Tailscale 容器镜像作为 sidecar 运行在 Kubernetes 中。内容涵盖状态持久化、DNS、认证、路由和常见故障模式。读完本指南，你将拥有一个可用于生产的 sidecar 部署，具备稳定身份、正确的 DNS 解析，以及大规模运行所需的安全加固。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个启用了基于角色的访问控制（RBAC）的 Kubernetes 集群。
* 一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 Tailscale 账户。
* 一个配置了合适[访问控制列表（ACL）标签][docs-tags]的 [OAuth 客户端][docs-oauth-clients]或[认证密钥][docs-auth-keys]。
* 一个有权限在 sidecar 所在命名空间读写 Secret 的 ServiceAccount（用于 Kubernetes Secret 状态存储）。

## 第 1 步：持久化状态以避免重复注册

状态管理是 Tailscale sidecar 最关键的配置决策。Tailscale 容器启动时会生成节点密钥（node key）并向控制平面注册。如果该密钥没有被持久化，每次容器重启都会生成新密钥并注册新设备。在规模较大时，这会产生注册洪峰，压垮控制平面并触发限流。

> **警告：**
>
> 在生产环境中绝不要使用 `--state=mem:` 或让状态处于未配置状态。每次重启都会注册一台新设备，负载之下由此产生的注册洪流可能导致无法自愈的持续宕机。

### （推荐）使用 Kubernetes Secret

使用 `TS_KUBE_SECRET` 将状态存入 Kubernetes Secret。设置该变量后，containerboot 会自动向 tailscaled 传递 `--state=kube:<secret_name>`，因此你无需单独设置状态标志。这是最持久的选项，因为状态既能挺过容器重启，也能挺过 pod 重启。请使用 StatefulSet，让每个副本都获得稳定的 pod 名来对应其 Secret。

```yaml
env:
  - name: TS_KUBE_SECRET
    value: $(POD_NAME)
```

在 Kubernetes 中运行时，`TS_KUBE_SECRET` 默认为 `tailscale`。将其显式设置即可在 StatefulSet 中使用按副本划分的 Secret，或将其设为 `""` 以完全禁用 Kubernetes Secret 存储。

这要求 sidecar 的 ServiceAccount 拥有对 Secret 的 `get`、`create`、`update` 和 `patch` 权限。完整的 Role 定义请参见下文 [RBAC 部分][ar-rbac]。

### （可选）持久卷

如果你的集群限制 Secret 写入权限，可以挂载 PersistentVolumeClaim 并使用 `TS_STATE_DIR`：

```yaml
env:
  - name: TS_STATE_DIR
    value: /var/lib/tailscale
  - name: TS_KUBE_SECRET
    value: ""
volumes:
  - name: tailscale-state
    persistentVolumeClaim:
      claimName: tailscale-state
```

### （可选）保留容器状态

配合 `TS_STATE_DIR` 使用 `emptyDir` 卷，可以在同一 pod 内的容器崩溃后保留状态，但 pod 重启后状态会丢失。这比 `mem:` 好，但不适合 pod 频繁更替的工作负载。

```yaml
env:
  - name: TS_STATE_DIR
    value: /var/lib/tailscale
  - name: TS_KUBE_SECRET
    value: ""
volumes:
  - name: tailscale-state
    emptyDir: {}
```

## 第 2 步：为 Secret 状态存储配置 RBAC

Tailscale 容器需要权限来管理自己的状态 Secret。[完整清单][ar-manifest]中的 Role 定义授予了所需的最小权限：

```yaml
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "create", "update", "patch"]
```

若要更严格的安全控制，可以预先创建状态 Secret，并使用 `resourceNames` 将 Role 的作用域限定到特定的 Secret 名称。对于一个名为 `my-app`、有 2 个副本的 StatefulSet：

```yaml
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "update", "patch"]
    resourceNames: ["my-app-0", "my-app-1"]
```

> **注意：**
>
> Kubernetes RBAC 无法按 `resourceNames` 限制 `create` 请求。如果你需要 sidecar 自动创建状态 Secret，就不要使用 `resourceNames`。要限制 Secret 的创建，请使用 `ValidatingAdmissionPolicy` 或 webhook。

## 第 3 步：对 sidecar 进行认证

部署清单使用 [OAuth 客户端][docs-oauth-clients]，这是 Kubernetes 工作负载推荐的认证方式。

OAuth 客户端密钥默认将设备注册为[临时节点][docs-ephemeral-nodes]，这与跨重启保持稳定 per-pod 身份的目标相冲突。由于本指南使用持久状态（`TS_KUBE_SECRET`），请在客户端密钥后追加 `?ephemeral=false&preauthorized=true`，使设备成为非临时节点，并在首次注册时跳过设备审批：

```shell
kubectl create secret generic tailscale-oauth \
  --from-literal=TS_CLIENT_ID=<YOUR_CLIENT_ID> \
  --from-literal=TS_CLIENT_SECRET='tskey-client-<YOUR_SECRET>?ephemeral=false&preauthorized=true'
```

如果你不持久化状态，并希望在 pod 删除时自动清理设备，可以省略 `ephemeral` 查询参数，保持默认的临时行为。

### （替代方案）使用静态认证密钥

如果你更倾向于使用静态[认证密钥][docs-auth-keys]，请把清单中的 OAuth 环境变量替换为：

```yaml
- name: TS_AUTHKEY
  valueFrom:
    secretKeyRef:
      name: tailscale-auth
      key: TS_AUTHKEY
```

### （替代方案）使用工作负载身份联合

对于拥有受支持身份提供方的环境（例如 GitHub Actions、Amazon Web Services（AWS）、Google Cloud Platform（GCP）或 Azure），你可以使用[工作负载身份联合][docs-wif]进行认证，而无需存储长期密钥：

```yaml
- name: TS_CLIENT_ID
  value: <YOUR_CLIENT_ID>
- name: TS_AUDIENCE
  value: <YOUR_AUDIENCE>
```

将 `TS_AUDIENCE` 设置为在管理控制台中联合身份信任配置里设定的受众（audience）值。Containerboot 会自动从环境中获取 ID 令牌，并将其兑换为 Tailscale 认证凭证。各提供方的具体设置请参阅[工作负载身份联合文档][docs-wif]。

## 第 4 步：处理 pod 中的 DNS

当 `TS_ACCEPT_DNS` 设为 `true` 时，tailscaled 会把 `/etc/resolv.conf` 完全替换为 `nameserver 100.100.100.100`（即 [Quad100][docs-quad100] [MagicDNS][docs-magicdns] 解析器）。由于 pod 中所有容器共享 `/etc/resolv.conf`，这会影响应用容器的 DNS，而不只是 sidecar 的。

这会带来两个问题：

* **启动期间**，在 Tailscale 连接之前，`100.100.100.100` 不可达。在 sidecar 完全连接之前，pod 中任何容器发出的 DNS 查询都会失败。
* **启动之后**，集群内部 DNS 名称（例如 `kubernetes.default.svc`）会通过 [MagicDNS][docs-magicdns] 而非 CoreDNS 解析。这些查询能否成功取决于你 tailnet 的 [DNS 配置][docs-dns]。如果你的 tailnet 配置了上游解析器，或有覆盖该查询的[拆分 DNS][docs-split-dns]路由，就能成功；否则集群服务查找会失败。

### （可选）使用拆分 DNS 接受 DNS

大多数 sidecar 需要 [MagicDNS][docs-magicdns] 来解析 tailnet 主机名。设置 `TS_ACCEPT_DNS=true`，并添加一条[拆分 DNS][docs-split-dns]路由，让集群服务查找仍然到达 CoreDNS。

在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面，添加一条拆分 DNS 条目：

* **Domain**（域名）：`svc.cluster.local`
* **Nameserver**（名称服务器）：你集群的 CoreDNS ClusterIP（例如 `10.96.0.10`）

你可以用以下命令找到集群的 CoreDNS IP：

```shell
kubectl get svc -n kube-system kube-dns -o jsonpath='{.spec.clusterIP}'
```

采用这一配置后，当 tailscaled 把 `/etc/resolv.conf` 替换为 `100.100.100.100` 时，对 `*.svc.cluster.local` 的查询会经由拆分 DNS 路由从 MagicDNS 转发到你集群的 CoreDNS。所有其他查询照常使用你 tailnet 的 DNS 解析器或 MagicDNS。

> **注意：**
>
> 这种方式适用于所有 sidecar 都在单一集群中运行的情况。如果你在多个集群中运行 sidecar，每个集群的 CoreDNS ClusterIP 都不同，而一条针对 `svc.cluster.local` 的拆分 DNS 条目只能指向其中一个。对于多集群环境，请为每个集群分配唯一的 DNS 域（例如 `cluster-a.k8s`），并配置按集群划分、解析到各自 CoreDNS 的拆分 DNS 路由。或者，在你的 tailnet 中配置[全局名称服务器][docs-dns]，让没有匹配拆分 DNS 路由的查询回退到能够处理它们的解析器。

> **警告：**
>
> 使用 `TS_ACCEPT_DNS=true` 时，在 Tailscale 连接之前的启动窗口内，pod 中的 DNS 不可用。如果应用容器先于 sidecar 就绪启动，它的 DNS 查询会失败。请配置应用容器容忍瞬时 DNS 故障，或使用 Kubernetes 原生 sidecar 容器，让 Tailscale 容器先于应用容器启动。

### （可选）禁用 DNS 接管

如果 sidecar 不需要 [MagicDNS][docs-magicdns] 解析、只需通过 IP 访问 tailnet 设备，可以设置 `TS_ACCEPT_DNS=false`，阻止 tailscaled 修改 `/etc/resolv.conf`。集群 DNS 正常工作，无需额外配置。

```yaml
- name: TS_ACCEPT_DNS
  value: "false"
```

## 第 5 步：加固 sidecar

在每个 pod 中都运行 sidecar 会扩大配置失误的影响面。以下小节介绍 Tailscale 容器所需的安全上下文、如何用标签限定访问范围，以及在把 pod 暴露给 tailnet 之前需要了解的路由与 shields 行为。

### 安全上下文

部署清单在 initContainer 和 Tailscale 容器上都使用了 `privileged: true`。这与 [Operator 的代理模板][docs-operator]一致——它同样以特权方式运行 Tailscale 容器。内核网络模式需要创建 tun 设备、配置 iptables/nftables 规则并修改路由表，这些都需要提升的权限。

### 基于标签的访问控制

使用 `--advertise-tags` 为 sidecar 节点分配 [ACL 标签][docs-tags]。标签让你无需逐一管理设备身份，就能为你的 Kubernetes 工作负载编写访问控制规则：

```yaml
- name: TS_EXTRA_ARGS
  value: "--advertise-tags=tag:k8s"
```

### 限制入站流量

默认情况下，tailnet 策略中的 ACL 规则决定哪些设备可以访问 sidecar。使用 [ACL 标签][docs-tags]和[访问控制策略][docs-access-control]把入站流量限制到特定来源和端口。

`--shields-up` 标志会在 WireGuard 包过滤层拒绝所有入站连接，无论 ACL 如何设置。只有 sidecar 发起连接的有状态回程流量才被放行。这会让 pod 无法被其他 tailnet 设备访问，也破坏了运行 sidecar 的主要意义之一：双向连通性。只有当 pod 从不需要接受入站 tailnet 连接时才使用 `--shields-up`。

### 防止路由冲突破坏集群内网络

`--accept-routes` 标志让 sidecar 能够访问 tailnet 中其他节点宣告的[子网路由][docs-subnet-routers]，例如本地部署网络、其他集群和云 VPC。这是 sidecar 的核心功能，已包含在部署清单中。

然而，`--accept-routes` 会无条件地把每条已宣告路由装入 pod 的内核路由表，没有任何重叠检测。如果 tailnet 中任何节点宣告的子网路由与本集群的 pod 或服务无类别域间路由（CIDR）范围重叠，集群内流量就会经由 Tailscale 隧道路由，而不是经由容器网络接口（CNI）。这会破坏 pod 间通信、服务发现和 DNS。发往服务 ClusterIP 上 CoreDNS 的流量会在 Tailscale 中被来回折返，并被网络地址转换（NAT）改写，响应无法路由回来。

#### 路由的工作原理

Tailscale 把已接受的路由装入一个独立的 Linux 路由表（table 52），并使用基于策略的路由（`ip rule`）把未打标的包引导到该表。Tailscale 自身的流量打有 fwmark `0x80000` 标记，以绕开 table 52 改用主路由表，从而避免循环。

问题在于，IP 规则会把所有未打标的 pod 流量都路由到 table 52。如果 table 52 中因为另一个节点宣告了路由而包含你集群服务 CIDR 的路由，pod 发往 CoreDNS 或其他服务的流量就会匹配到那条路由，被送往 Tailscale tun 设备而非 CNI。

#### 部署前验证你的 tailnet

在使用 `--accept-routes` 部署 sidecar 之前，检查 tailnet 中是否有节点正在宣告与你集群 pod 或服务 CIDR 重叠的路由。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面查看已宣告的路由，或运行：

```shell
tailscale status --json | jq '.Peer[] | select(.PrimaryRoutes) | {name: .HostName, routes: .PrimaryRoutes}'
```

将输出与你集群的 CIDR 进行比对：

```shell
kubectl cluster-info dump | grep -m 2 -E "service-cluster-ip-range|cluster-cidr"
```

如果存在重叠，要么从宣告节点上移除冲突的子网路由，要么避免在该集群的 sidecar 上使用 `--accept-routes`。

## 第 6 步：部署 sidecar

下面的 StatefulSet 在一个 nginx 容器旁边部署了 Tailscale sidecar。它使用 Kubernetes Secret 状态存储、内核网络模式和指标（metrics）。

initContainer 设置 IP 转发 sysctl，这需要 `privileged: true`。当 sidecar 使用 `--accept-routes`、宣告子网路由或充当代理时需要它。

将 `tag:k8s` 替换为你的 ACL 标签，并更新认证 Secret 名称以匹配你的配置。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tailscale
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: tailscale
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "create", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tailscale
subjects:
  - kind: ServiceAccount
    name: tailscale
roleRef:
  kind: Role
  name: tailscale
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: my-app
spec:
  replicas: 2
  serviceName: my-app
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      serviceAccountName: tailscale
      initContainers:
        - name: sysctl
          image: ghcr.io/tailscale/tailscale:latest
          command: ["/bin/sh", "-c"]
          args:
            - |
              sysctl -w net.ipv4.ip_forward=1
              if sysctl net.ipv6.conf.all.forwarding 2>/dev/null; then
                sysctl -w net.ipv6.conf.all.forwarding=1
              fi
          securityContext:
            privileged: true
      containers:
        - name: tailscale
          image: ghcr.io/tailscale/tailscale:latest
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: TS_KUBE_SECRET
              value: $(POD_NAME)
            - name: TS_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: tailscale-oauth
                  key: TS_CLIENT_ID
            - name: TS_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: tailscale-oauth
                  key: TS_CLIENT_SECRET
            - name: TS_HOSTNAME
              value: $(POD_NAME)
            - name: TS_USERSPACE
              value: "false"
            - name: TS_ACCEPT_DNS
              value: "true"
            - name: TS_EXTRA_ARGS
              value: "--advertise-tags=tag:k8s --accept-routes"
            - name: TS_ENABLE_METRICS
              value: "true"
            - name: TS_LOCAL_ADDR_PORT
              value: "0.0.0.0:9002"
          ports:
            - name: metrics
              containerPort: 9002
              protocol: TCP
          securityContext:
            privileged: true
        - name: app
          image: nginx:latest
          ports:
            - containerPort: 80
```

## 第 7 步：（可选）配置健康检查与可观测性

Tailscale Kubernetes Operator 不会在其代理容器上配置 startup、liveness 或 readiness 探针。它通过 IPN 总线在内部管理容器生命周期。本指南中的清单遵循同样的做法。

设置 `TS_ENABLE_METRICS=true` 会在 `TS_LOCAL_ADDR_PORT` 配置的地址（默认 `[::]:9002`）上提供 Prometheus 兼容的 `/metrics` 端点。可将其用于监控和告警。

设置 `TS_ENABLE_HEALTH_CHECK=true` 会在同一服务器上提供 `/healthz` 端点。该端点在节点至少拥有一个 tailnet IP 地址时返回 HTTP 200，否则返回 503。如果你需要为外部负载均衡器或服务网格集成提供健康端点，请启用它。上面的清单默认未启用。

> **警告：**
>
> 避免把 `/healthz` 用作 Kubernetes 的 `livenessProbe`。节点暂时失去 tailnet IP 时（瞬时网络中断期间可能发生），该端点会返回 503。liveness 探针失败会触发容器重启，进而强制重新注册。这正是大规模场景下引发级联故障的模式。同样，避免使用依赖 MagicDNS 解析的 liveness 探针（例如向 `100.100.100.100` 发起 `nslookup`），因为断连期间 MagicDNS 不可用。

## 故障排除

| 问题                                                           | 影响                                                                                                                                                                                                                                          | 修复方法                                                                                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--state=mem:` 或未配置状态                                    | 每次重启都会注册新设备。负载之下会淹没控制平面并触发限流。                                                                                                                                                                                    | 配合 StatefulSet 使用 `TS_KUBE_SECRET`，或配合持久卷使用 `TS_STATE_DIR`。                                                                |
| `TS_ACCEPT_DNS=true` 且没有针对 `svc.cluster.local` 的拆分 DNS | tailscaled 会替换整个 pod 的 `/etc/resolv.conf`。集群服务查找失败，因为默认名称服务器不再能访问 CoreDNS。                                                                                                                                     | 在管理控制台中为 `svc.cluster.local` 添加一条指向你集群 CoreDNS IP 的拆分 DNS 路由。                                                     |
| 使用 Deployment 而非 StatefulSet                               | pod 名称不稳定，`TS_KUBE_SECRET=$(POD_NAME)` 会产生孤儿 Secret。                                                                                                                                                                              | 使用 StatefulSet 获得稳定的 pod 身份。                                                                                                    |
| 将 `/healthz` 或 MagicDNS 用作 liveness 探针                   | 瞬时网络中断导致探针失败，触发容器重启和重新注册。这会放大故障而不是从中恢复。                                                                                                                                                                | 不要使用 `/healthz` 或基于 MagicDNS 的 liveness 探针。Operator 正是出于这个原因不在其代理容器上配置探针。                                 |
| 子网路由与集群 CIDR 重叠                                       | 如果另一个节点把你的 pod 或服务 CIDR 作为子网路由宣告，`--accept-routes` 会把这些路由装入 tun 设备。集群内流量在 Tailscale 中被来回折返，破坏 DNS、pod 间通信和服务发现。                                                                     | 部署前，验证 tailnet 中没有节点宣告与本集群 pod 或服务 CIDR 重叠的路由。                                                                  |
| 高副本数下使用 `podManagementPolicy: Parallel`                 | 所有 pod 同时启动，注册洪峰冲击控制平面。                                                                                                                                                                                                     | 使用默认的 `OrderedReady` 策略，或逐步扩容。                                                                                              |

## 进一步探索

* 对于不需要 per-pod 身份的工作负载，[Tailscale Kubernetes Operator][docs-operator]管理的共享代理可以服务多个 pod，运维开销低于在每个 pod 中运行 sidecar。
* 要在没有 per-pod sidecar 的情况下把 Kubernetes 服务暴露给你的 tailnet，请通过 Operator 配置[集群入站（ingress）][docs-cluster-ingress]。
* 要让集群工作负载获得对 tailnet 资源的出站访问，请通过 Operator 配置[集群出站（egress）][docs-cluster-egress]。
* 要限制哪些 tailnet 设备可以在哪些端口访问你的 sidecar pod，请编写引用 sidecar 所宣告 [ACL 标签][docs-tags]的[访问控制策略][docs-access-control]。
* 要在为 tailnet 主机名保留 [MagicDNS][docs-magicdns] 的同时解析集群服务，请在管理控制台中配置[拆分 DNS][docs-split-dns]。
* 要在不向集群存储长期密钥的情况下认证 sidecar，请与受支持的身份提供方一起配置[工作负载身份联合][docs-wif]。
* 要让 sidecar 能到达不在 tailnet 中的网络，请从 pod 宣告[子网路由][docs-subnet-routers]。
* 有关在容器中运行 Tailscale 的其他方式，请参阅 [Tailscale 容器概览][docs-containers]。

[ar-manifest]: #第-6-步部署-sidecar

[ar-rbac]: #第-2-步为-secret-状态存储配置-rbac

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cluster-egress]: /docs/kubernetes-operator/egress

[docs-cluster-ingress]: /docs/kubernetes-operator/ingress

[docs-containers]: /docs/features/containers

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-operator]: /docs/kubernetes-operator

[docs-quad100]: /docs/reference/quad100

[docs-split-dns]: /docs/reference/dns-in-tailscale#受限域名服务器

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-wif]: /docs/features/workload-identity-federation
