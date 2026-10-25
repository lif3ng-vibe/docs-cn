---
title: "使用 Tailscale PAM 访问 Kubernetes 集群"
description: "[Tailscale PAM][docs-pam] 让用户获得对 Kubernetes 集群的、基于身份的访问，而无需他们管理集群凭证，也无需维护和分发 `kubeconfig` 文件。"
---

最后验证于 Aug 19, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户获得对 Kubernetes 集群的、基于身份的访问，而无需他们管理集群凭证，也无需维护和分发 `kubeconfig` 文件。

用户使用其 [Tailscale 身份][docs-tailscale-identity]访问 Kubernetes 集群，PAM [连接器][docs-pam-connectors]代表他们与 Kubernetes API 通信。你可以使用 tailnet 访问策略中的 Tailscale PAM [授权（grant）][docs-grants]来控制每个用户或组能做什么，包括可以访问哪些 Kubernetes API 操作、命名空间和资源。

用户可以继续使用他们已经在用的 Kubernetes 工具，包括 `kubectl`、Lens、K9s 和其他 Kubernetes 客户端。他们也可以使用 Tailscale 的 [Border0 web 客户端](https://my.tailscale.com)直接从浏览器与集群交互。

## 受支持的 Kubernetes 服务类型

Tailscale PAM 支持几种不同的 Kubernetes 连接方式。请根据连接器的运行位置及其访问集群的方式选择服务类型：

* **Kubernetes - Standard**：用于连接器已经能够访问并向其认证的 Kubernetes 集群。既适用于自建 Kubernetes，也适用于托管的 Kubernetes 服务。
* **Kubernetes - AWS EKS within cluster**：当 PAM 连接器运行在你想要访问的 EKS 集群内部时使用。如果连接器在集群内运行，它可以使用集群内配置及其服务账户。
* **Kubernetes - AWS EKS outside cluster**：当 PAM 连接器在 EKS 集群之外运行并使用 AWS 凭证来发现集群并向其认证时使用。如果在集群外运行，它需要一条通往 Kubernetes API 的网络路径，以及集群认可的凭证。

## 前提条件

开始之前，确保你具备以下条件：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一台能与该集群的 Kubernetes API 通信的连接器。
* 为连接器准备的一个 Kubernetes 身份，具有用户将要执行的操作所需的权限。
* 如果打算使用 `kubectl` 或其他本地 Kubernetes 客户端，你用来连接的设备上需已安装 Tailscale 并登录。
* 一条让用户能访问该 Kubernetes PAM 服务的 Tailscale PAM [授权][docs-grants]。

对于连接器在集群外运行的 EKS 集群，连接器还需要一个能够发现 EKS 集群并向其认证的 AWS 身份。

## 为连接器配置 Kubernetes 权限

与 Kubernetes API 通信的是 PAM 连接器，因此它需要足够的 Kubernetes 权限来执行你希望用户能够进行的操作。

Tailscale PAM 授权建立在这些权限之上。它们可以收窄某个用户或组被允许做的事情，但无法赋予连接器 Kubernetes 本身没有授予它的权限。

例如，如果你想让 Tailscale PAM 负责逐用户授权，可以给连接器一个宽泛的 `ClusterRole`：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tailscale-pam-connector
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
```

把该角色绑定到你的 Tailscale PAM 连接器所使用的 Kubernetes 身份上。

这样连接器就对集群拥有宽泛的访问权，而你的 Tailscale PAM 授权决定各个用户和组能通过 PAM 服务做什么。

你不必给连接器完整的集群访问权。如果用户只需要访问较小范围的 Kubernetes 资源，你可以改为给连接器一个限制更严的 Kubernetes 角色。

## 使用 Kubernetes 身份模拟（impersonation）

你也可以为 Kubernetes PAM 服务启用**身份模拟**（impersonation）。

不启用模拟时，Kubernetes 把请求视为来自连接器的 Kubernetes 身份，逐用户授权由 Tailscale PAM 授权提供。

启用模拟后，Tailscale PAM 会发送 Kubernetes 的 `Impersonate-User` 和 `Impersonate-Group` 头。这让 Kubernetes 在你用 Tailscale PAM 定义的访问控制之外，还能把自身的基于角色的访问控制（RBAC）规则应用到被模拟的用户和组上。

如果你已经在使用 Kubernetes RBAC 并希望把这些权限保留在授权决策中，这会很有用。

连接器的 Kubernetes 身份需要有模拟用户和组的权限。例如：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tailscale-pam-impersonator
rules:
  - apiGroups: [""]
    resources:
      - users
      - groups
    verbs:
      - impersonate
```

把这条 `ClusterRole` 绑定到你的 PAM 连接器所使用的 Kubernetes 身份上。之后，你就可以用现有的 Kubernetes `Role`、`ClusterRole`、`RoleBinding` 和 `ClusterRoleBinding` 资源来控制被模拟的用户和组能做什么。

要确认模拟已生效，运行：

```shell
kubectl auth whoami
```

用户名应该是你的 Tailscale 登录名而不是连接器的 Kubernetes 身份，组应该与你的 tailnet 组一致。

### 模拟 tailnet 组

Tailscale PAM 模拟的组是连接用户的 tailnet 组。这些组包括你在 tailnet 策略文件中定义的[组][docs-policy-file-groups]，以及[从身份提供方同步][docs-user-group-provisioning]来的组。

Tailscale 控制平面默认不向设备发送组成员身份。要让连接器拿到这些信息，请在你的 tailnet 策略文件中添加 `tailscale.com/visible-groups` [节点属性（node attribute）][docs-policy-file-node-attributes]，并以运行 PAM 连接器的设备为目标。更多信息参见 [Tailscale 客户端上的组可见性][docs-group-visibility-clients]。

在你添加该节点属性之前，连接器没有任何组信息，只会发送 `Impersonate-User` 头。

> **注意：**
>
> Tailscale PAM 在发送该头之前会去掉 `group:` 前缀。`group:engineering` 的成员会被模拟为 Kubernetes 组 `engineering`，因此请把你的 Kubernetes RBAC 绑定到 `engineering`。

带标签的设备以设备身份而非用户身份连接，因此来自带标签设备的请求不携带任何组。

## 创建 Kubernetes PAM 服务

要创建 Kubernetes PAM 服务：

1. 打开管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择合适的 Kubernetes 服务类型：
   * **Kubernetes - Standard**
   * **Kubernetes - AWS EKS within cluster**
   * **Kubernetes - AWS EKS outside cluster**

5. 选择 **Continue**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. （可选）如果你想让 Tailscale PAM 使用 Kubernetes 身份模拟，启用 **Enable impersonation**。

10. 在 **Connect via** 中选择一个或多个 PAM 连接器。

    为该服务选择的每个连接器都必须能访问 Kubernetes API 并向其认证。

11. 选择 **Continue**。

12. 如何配置 Kubernetes 目标取决于你选择的 Kubernetes 服务类型。

    #### Kubernetes - Standard

    当连接器已经拥有目标集群的 Kubernetes 配置时，使用此选项。

    对于使用其当前 Kubernetes 上下文的连接器，配置以下值：

    * **Configuration source:** 选择 **System's kubeconfig with current context**。
    * **Target selection strategy:** 选择 **Kubernetes context**。
    * **Authentication strategy:** 选择 **Kubernetes context**。

    这会告诉连接器使用其现有的 Kubernetes 配置来确定 API 服务器和上游认证凭证。

    #### Kubernetes - AWS EKS within cluster

    当 PAM 连接器作为工作负载运行在 EKS 集群内部时，使用此选项。

    连接器可以使用 Kubernetes 的集群内配置及其服务账户身份与 Kubernetes API 通信。

    确保连接器的服务账户拥有你希望用户执行的操作所需的 Kubernetes RBAC 权限。

    如果你启用了模拟，还要给连接器的服务账户授予所需的 Kubernetes 模拟权限。

    #### Kubernetes - AWS EKS outside cluster

    当 PAM 连接器运行在 EKS 集群之外时，使用此选项。

    连接器需要：

    * 与 EKS Kubernetes API 端点的网络连通性。
    * 一个能发现该 EKS 集群的 AWS 身份。
    * 该 AWS 身份访问 Kubernetes API 的授权。

    连接器的 AWS 身份需要有权列出和描述 EKS 集群。例如：

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "eks:ListClusters",
            "eks:DescribeCluster"
          ],
          "Resource": "*"
        }
      ]
    }
    ```

    连接器的 AWS IAM 身份还必须获得访问该 EKS 集群的授权。

    你可以使用 EKS 访问条目（access entry）把该 IAM 身份与 Kubernetes 权限或 Kubernetes RBAC 组关联起来。

    对于仍在使用 `aws-auth` `ConfigMap` 的集群，你可以改为把连接器的 IAM 角色映射到合适的 Kubernetes RBAC 组。

    分配给该身份的 Kubernetes 权限仍然决定了通过 PAM 服务可获得的访问上限。

13. 配置完 Kubernetes 目标后，选择 **Save**。

Kubernetes 服务已就绪，可以通过连接器把请求代理到集群。

## 为 Kubernetes 服务授予访问权限

在用户连接之前，创建一条 Tailscale PAM 授权，让他们能访问该 Kubernetes 服务。

例如，一条不受限制的 Kubernetes 权限如下所示：

```json
{
  "src": ["*"],
  "dst": ["*"],
  "ip": ["*"],
  "app": {
    "tailscale.com/cap/pam": [
      {
        "version": "v1",
        "permissions": {
          "kubernetes": {}
        }
      }
    ]
  }
}
```

这让用户可以访问该服务提供的 Kubernetes 操作。连接器仍然无法做其 Kubernetes 身份不被允许的任何事情。

> **警告：**
>
> 这是一条适合入门使用的授权。在生产环境中，请限制 `src` 和 `dst`，让授权只作用于需要它的用户、组、设备和 Kubernetes 服务。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

### 控制用户在 Kubernetes 中能做什么

你不必给用户不受限制的 Kubernetes 访问权。Tailscale PAM 授权可以基于以下条件控制操作：

* Kubernetes 动词（verb），例如 `get`、`list`、`create` 或 `delete`。
* 命名空间。
* 资源类型，例如 `pods`、`deployments` 和 `services`。
* 资源名称。
* Kubernetes API 组。

添加 Kubernetes 规则后，请求必须至少匹配一条规则才会被允许。

例如，以下授权把访问限制在 `staging` 命名空间：

```json
{
  "src": ["*"],
  "dst": ["*"],
  "ip": ["*"],
  "app": {
    "tailscale.com/cap/pam": [
      {
        "version": "v1",
        "permissions": {
          "kubernetes": {
            "rules": [
              {
                "api_groups": ["*"],
                "namespaces": ["staging"],
                "verbs": ["*"],
                "resources": ["*"],
                "resource_names": ["*"]
              }
            ]
          }
        }
      }
    ]
  }
}
```

只有匹配 `staging` 命名空间规则的 Kubernetes 操作才会被允许。

你可以把规则写得具体得多。例如，你可以允许开发者在 `staging` 中对 pods 和 deployments 执行 `get`、`list` 和 `watch`，同时阻止他们创建或删除资源。

Tailscale PAM 与 Kubernetes RBAC 协同工作。PAM 授权必须允许该请求，且连接器或被模拟的 Kubernetes 身份也必须有权执行它。

更多 Kubernetes 授权示例以及细粒度 Kubernetes 访问控制的信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 连接到 Kubernetes 集群

用户获得访问权后，可以继续使用他们已经在用的 Kubernetes 工具，或直接从浏览器连接。

1. 打开 Tailscale 客户端。
2. 选择 **Services**。
3. 选择该 Kubernetes 服务。
4. 选择 **kubectl** 或 **Web client**。

### 使用 kubectl 和其他 Kubernetes 工具

选择 **kubectl** 可把该 Kubernetes 服务添加到你的本地 `kubeconfig`。

Tailscale 会自动为你配置集群。你也可以选择把它设为你当前的 Kubernetes 上下文。

配置完成后，像平常一样使用 `kubectl` 即可：

```shell
kubectl get pods
```

例如：

```shell
kubectl get deployments -n staging
```

由于集群已添加到你的 `kubeconfig`，其他使用 `kubeconfig` 的 Kubernetes 工具（例如 Lens 或 K9s）也可以使用同一配置。

你不需要单独的集群凭证。你的请求使用你的 Tailscale 身份以及 PAM 授权中的 Kubernetes 权限来授权。

### 从浏览器连接

打开 Tailscale PAM 的 [Border0 web 客户端](https://my.tailscale.com)，即可直接从浏览器与 Kubernetes 集群交互。

你无需安装 `kubectl`，也无需配置本地 `kubeconfig`。

无论你使用 `kubectl` 还是 Web 客户端连接，同样的 PAM 授权都适用，因此用户只能执行其访问策略允许的 Kubernetes 操作。

## 查看 Kubernetes 会话

Tailscale PAM 为你提供一个集中位置，用于审查谁访问了你的 Kubernetes 服务，以及每个会话期间发生了什么。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，选择你想检查的会话。在那里你可以查看如下详情：连接所用的 Tailscale 身份、来源设备、连接时间，以及被访问的 Kubernetes 服务。

启用会话录制后，Tailscale PAM 还会捕获会话期间发生的活动。

对于 Kubernetes API 活动，你可以逐条查看每个 API 调用及其 HTTP 响应码。这为你提供了用户如何与集群交互、Kubernetes 如何响应的详细记录。

交互式活动也会被录制。例如，如果用户在某个 pod 中启动了交互式 `kubectl exec` 会话，你可以回放录制的会话并审查容器内发生了什么。

会话详情、Kubernetes API 活动和交互式会话录制合在一起，为你提供一份清晰的记录：

* 谁访问了集群。
* 他们做了什么。
* Kubernetes 返回了什么。

## 故障排查

如果你无法连接某个 Kubernetes 服务，首先检查 PAM 连接器是否在线、能否访问 Kubernetes API。

然后检查连接器能否向集群认证，以及其 Kubernetes 身份是否有权执行你要运行的操作。

同时确保你的 Tailscale PAM 授权允许访问该服务。如果你添加了 Kubernetes 规则，检查所请求的动词、命名空间、资源、资源名称和 API 组是否匹配其中某条规则。

如果启用了模拟，验证：

* 连接器的 Kubernetes 身份能模拟所需的用户或组。
* 被模拟的身份拥有相应的 Kubernetes `RoleBinding` 或 `ClusterRoleBinding`。
* Kubernetes RBAC 允许所请求的操作。

如果基于组的 RBAC 规则没有生效，运行 `kubectl auth whoami` 并检查它报告的组：

* 如果没有报告任何组，说明连接器没有收到组成员身份。确认 `tailscale.com/visible-groups` 节点属性以运行连接器的设备为目标，并且它让你需要的组可见。
* 如果报告的组与预期一致，检查你的 Kubernetes RBAC 是否绑定到了不带 `group:` 前缀的组名。
* 如果你是从带标签的设备连接的，请求不携带任何组。请改为从以用户身份登录的设备连接。

如果你使用的是 **AWS EKS outside cluster** 选项，还要验证：

* 所配置的 AWS 凭证有效。
* 连接器能列出和描述该 EKS 集群。
* 连接器的 AWS IAM 身份获得访问 EKS Kubernetes API 的授权。
* 连接器能访问该 EKS API 端点。

如果以上排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中失败会话的详情。这些信息有助于你判断请求是被 Tailscale PAM、Kubernetes RBAC、身份模拟、认证还是连通性问题所阻断。

[docs-grants]: /docs/features/access-control/grants

[docs-group-visibility-clients]: /docs/features/group-visibility-clients

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-policy-file-node-attributes]: /docs/reference/syntax/policy-file#节点属性

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
