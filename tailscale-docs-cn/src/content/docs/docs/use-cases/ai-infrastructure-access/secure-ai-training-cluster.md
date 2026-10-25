---
title: "保护你的 AI 训练集群"
description: "当 Kubernetes 集群的 API 服务器可从公网访问时，每一条 `kubectl` 命令都要穿越互联网。对于运行昂贵 GPU 工作负载的 AI 训练集群，这种暴露会带来高"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**Tailscale Kubernetes Operator**](/docs/kubernetes-operator)——Tailscale Kubernetes Operator 为 Kubernetes 集群的出入流量提供安全连接。

> **注意：** Kubernetes API 服务器代理目前处于 beta 阶段。

当 Kubernetes 集群的 API 服务器可从公网访问时，每一条 `kubectl` 命令都要穿越互联网。对于运行昂贵 GPU 工作负载的 AI 训练集群来说，这种暴露会使其成为高价值攻击目标。获得 API 服务器访问权的攻击者可以窃取模型权重、把 GPU 资源拿去挖矿，或者中断需要连续运行数天的训练任务。

Tailscale Kubernetes Operator 的 API 服务器代理将 kube-apiserver 从公网上移除，让所有 `kubectl` 访问都经由你的 tailnet 路由。你可以获得基于身份的访问控制、完整的审计追踪和设备合规强制，同时不必改变 ML 工程师使用 `kubectl` 的方式。

本指南介绍如何保护 Kubernetes 训练集群的管理平面（`kubectl` 与 API 服务器访问），不涉及数据平面安全（节点间 GPU 流量）。

## 在 tailnet 策略文件中定义标签

在访问控制规则中，标签用于标识 Kubernetes Operator、其代理以及会话录制器。请在安装任何组件之前先定义它们：在 [tailnet 策略文件][docs-tailnet-policy-file]中添加以下 `tagOwners`：

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:k8s": ["tag:k8s-operator"],
  "tag:tsrecorder": [],
}
```

`tag:k8s-operator` 标签标识 Operator 本身。由于 `tag:k8s-operator` 拥有 `tag:k8s`，Operator 可以创建和管理带该标签的代理设备。`tag:tsrecorder` 标签标识后续步骤中要用到的会话录制实例。

> **注意：**
>
> 这些标签名称仅作示例。如果你管理多个 Kubernetes 环境，请按你所在组织的命名规范调整（例如 `tag:ml-cluster-operator` 或 `tag:gpu-cluster`）。

\[Missing snippet: visual\_policy\_editor.mdx]

策略文件配置选项的完整集合请参阅 [tailnet 策略文件参考][docs-tailnet-policy-file]。

## 安装带 API 服务器代理的 Kubernetes Operator

本步骤部署启用 auth 模式 API 服务器代理的 Tailscale Kubernetes Operator。auth 模式会[模拟][xt-kubernetes-impersonation]（impersonate）每个请求发送方的 Tailscale 身份，从而实现按用户的 Kubernetes RBAC。

添加 Tailscale Helm 仓库并更新本地缓存：

```shell
helm repo add tailscale https://pkgs.tailscale.com/helmcharts
helm repo update
```

安装启用 API 服务器代理的 Operator：

```shell
helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=<your-oauth-client-id> \
  --set-string oauth.clientSecret=<your-oauth-client-secret> \
  --set-string apiServerProxyConfig.mode="true" \
  --wait
```

`apiServerProxyConfig.mode="true"` 标志以 auth 模式启用进程内 API 服务器代理。请将 OAuth 客户端 ID 和密钥替换为你前置条件中 OAuth 客户端的对应值。

安装完成后，[机器](https://console.tailscale.com/admin/machines)页面会出现一台名为 `tailscale-operator` 的设备。该设备就是你的团队访问集群所用的 API 服务器代理端点。

> **注意：**
>
> 另一种 `noauth` 模式在不做身份模拟的情况下把请求转发给 kube-apiserver。仅当你将此代理与云提供商或身份提供方（IdP）单独提供的认证代理配合使用时，才使用 `noauth` 模式。

Operator 安装选项的完整集合请参阅 [Kubernetes Operator 安装指南][docs-operator-setup]。代理的详细配置请参阅 [API 服务器代理操作指南][docs-operator-api-server-proxy]。

## 配置 `kubectl` 使用 Tailscale 代理

Operator 运行起来之后，将 `kubectl` 指向 Tailscale 代理，让所有命令经由你的 tailnet 路由，而不是走公网的 kube-apiserver 端点。

```shell
tailscale configure kubeconfig tailscale-operator
```

该命令会更新 `~/.kube/config`，把 `kubectl` 指向 Tailscale 代理设备的 MagicDNS 名称（默认为 `tailscale-operator`）。

验证 `kubectl` 能否通过代理访问集群：

```shell
kubectl get nodes
```

如果该命令返回了你集群的节点，说明 `kubectl` 已经经由 Tailscale 代理路由。现在可以从云提供商的配置中移除公网 API 服务器端点，完成锁定。

> **注意：**
>
> 如果你在第 4 步部署了可选的高可用 ProxyGroup，请改用 ProxyGroup 的 URL 配置 `kubectl`：
>
> ```shell
> tailscale configure kubeconfig https://ai-cluster.tailxyz.ts.net
> ```

## 将 Tailscale 身份映射到 Kubernetes RBAC

代理就位后，需要用授权来控制谁能访问集群以及能做什么。授权通过[模拟][xt-kubernetes-impersonation]将 Tailscale 用户身份映射到 Kubernetes RBAC 角色，用按用户访问取代共享的 `kubeconfig` 凭证。这样 Kubernetes 审计日志显示的就是真实用户，而不是服务账号。

以下授权通过模拟 `system:masters` Kubernetes 分组，赋予 `group:ml-engineers` 成员完整的集群管理员访问权限：

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "impersonate": {
          "groups": ["system:masters"],
        },
      }],
    },
  },
]
```

在所有 Kubernetes 集群中，`system:masters` 默认存在指向 `cluster-admin` 的 ClusterRoleBinding，拥有对所有 API 服务器资源的完全访问权限。

对于只需查看训练任务状态而无需修改资源的只读相关人员，创建另一个授权，模拟一个自定义 Kubernetes 分组：

```json
"grants": [
  {
    "src": ["group:ml-readers"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "impersonate": {
          "groups": ["tailnet-readers"],
        },
      }],
    },
  },
]
```

`tailnet-readers` Kubernetes 分组默认不存在。将其绑定到内置的 `view` ClusterRole 即可授予只读访问权限：

```shell
kubectl create clusterrolebinding tailnet-readers-view \
  --group=tailnet-readers --clusterrole=view
```

\[Missing snippet: visual\_policy\_editor.mdx]

授权本身只控制用户连接后能做什么，但访问控制规则还必须允许这些分组的流量到达 API 服务器代理。请在 tailnet 策略文件的 `acls` 部分添加以下内容：

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:ml-engineers"],
    "dst": ["tag:k8s-operator:443"],
  },
  {
    "action": "accept",
    "src": ["group:ml-readers"],
    "dst": ["tag:k8s-operator:443"],
  },
]
```

更多授权模式请参阅[授权概述][docs-grants]、[授权语法参考][docs-grants-syntax]与[授权示例][docs-grants-examples]。

[docs-grants]: /docs/features/access-control/grants

[docs-grants-examples]: /docs/reference/examples/grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-operator-api-server-proxy]: /docs/kubernetes-operator/api-server-access

[docs-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-kubernetes-impersonation]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation
