---
title: "在 Kubernetes 上部署应用连接器"
description: "从 Tailscale v1.78 开始，你可以使用 Tailscale Kubernetes Operator 及其 [`Connector` 自定义资源定义][xt-gh-tailscale-k8s-connector] 将[应用连接器][docs-app-connector]部署到 Kubernetes 集群。"
---

最后验证于 Jun 5, 2026

从 Tailscale v1.78 开始，你可以使用 Tailscale Kubernetes Operator 及其 [`Connector` 自定义资源定义][xt-gh-tailscale-k8s-connector] 将[应用连接器][docs-app-connector]部署到 Kubernetes 集群。

> **注意：**
>
> 唯一经测试并受支持的使用场景是部署应用连接器来访问公共互联网上的 SaaS 应用程序。使用应用连接器暴露集群工作负载或其他内部工作负载可能可行，但这不是 Tailscale 已测试或优化过的场景。

> **注意：**
>
> 如果你使用应用连接器访问 SaaS 应用程序的原因是需要一个可加入允许列表的可预测出站 IP 地址，那么确保来自连接器的集群流量经由该可预测 IP 地址流出也是你的责任。例如，将集群出站流量经由具有静态 IP 地址的 NAT 设备路由。

## 前提条件

部署应用连接器之前，请完成以下操作：

1. 设置 [Kubernetes operator][docs-operator]。

2. （可选）创建一个[标签][docs-tags]（例如 `tag:github-connector`），附加到连接器设备上。

   如果你不指定自定义标签，Operator 会为连接器设备打上 `tag:k8s` 标签。

   确保 Operator 是连接器标签的[标签所有者][docs-acls-tag-owners]之一：

   ```json
   "tagOwners": {
     "tag:k8s-operator":     [],
     "tag:github-connector": ["tag:k8s-operator"],
   }
   ```

   \[缺失片段：visual\_policy\_editor.mdx]

3. 在 [Apps][docs-app-connector-apps] 中配置经由应用连接器路由的域名。

4. 配置 tailnet 策略权限，让所需域名的流量经由应用连接器路由。请参阅[应用连接器策略配置说明][docs-app-connector-policy]。

## 部署应用连接器

按照以下步骤部署应用连接器：

1. 参照以下示例创建你的 `Connector` 资源，并保存为 `connector.yaml`：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Connector
   metadata:
     name: appc-github
   spec:
     appConnector: {}
   ```

2. （可选）添加[预配置路由][docs-app-connector-preconfiguration]：

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Connector
   metadata:
     name: appc-github
   spec:
     appConnector:
       routes:
       - 140.82.114.4/32
   ```

   你可以在 GitHub 上找到[所有可用的 `Connector` 配置选项][xt-gh-tailscale-k8s-connector]。

3. 应用该文件：

   ```shell
   kubectl apply -f connector.yaml
   ```

4. （可选）等待连接器就绪：

   ```shell
   kubectl wait --for condition=ConnectorReady=true Connector appc-github
   ```

   ```
   connector.tailscale.com/appc-github condition met
   ```

5. （可选）[将应用连接器的出站 IP 地址加入 IP 允许列表][docs-app-connector-ip-allowlist]。

## 已知问题与限制

以下限制适用：

* 配置应用连接器需要大量手动设置，包括更新 tailnet 策略文件以及需要经由连接器路由流量的应用程序。
* 应用连接器的出站 IP 地址无法自动发现。你可以在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面获取。

[docs-acls-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-app-connector-apps]: /docs/features/app-connectors/how-to/setup#configure-a-device-as-an-app-connector

[docs-app-connector-ip-allowlist]: /docs/features/app-connectors/how-to/setup#restrict-application-access-by-ip-address

[docs-app-connector-policy]: /docs/features/app-connectors/how-to/setup#update-the-tailnet-policy-file

[docs-app-connector-preconfiguration]: /docs/reference/best-practices/app-connectors#preconfiguration

[docs-app-connector]: /docs/features/app-connectors

[docs-operator]: /docs/kubernetes-operator/install-operator

[docs-tags]: /docs/features/tags

[xt-gh-tailscale-k8s-connector]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md#connector
