---
title: "连接推理与训练服务器"
description: "GPU 服务器、推理端点和训练节点需要安全的网络访问，同时又不能暴露在公网上。当这些机器用用户账号来认证时，员工离职"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**Aperture**](/docs/aperture)——使用 Tailscale 出品的 Aperture 监控并保护 LLM 用量。

GPU 服务器、推理端点和训练节点需要安全的网络访问，同时又不能暴露在公网上。如果这些机器用用户账号来认证，员工离职时访问就会中断，密钥按固定周期轮换会打断长时间运行的任务，而且也没有干净的办法按团队或客户划分访问范围。

Tailscale [标签][docs-tags]与[认证密钥][docs-auth-keys]为每台服务器在 tailnet 中赋予机器身份。标签定义服务器是什么，认证密钥自动化其加入方式，而[授权][docs-grants]控制谁能访问它。本主题介绍单租户与多租户两种部署方式，包括容器化推理工作负载。

## 为服务器基础设施定义标签

标签让非用户设备在你的 tailnet 中拥有自己的身份。在 [tailnet 策略文件][docs-tailnet-policy-file]中添加一个 `tagOwners` 块，为你的服务器角色定义标签：

```json
"tagOwners": {
  "tag:inference-server": ["autogroup:admin"],
  "tag:training-cluster": ["autogroup:admin"],
}
```

`tag:inference-server` 标签标识承载模型推理请求的机器，`tag:training-cluster` 标签标识用于模型训练的机器。将 `autogroup:admin` 指定为所有者意味着只有 tailnet 管理员才能为这些标签创建认证密钥。

> **注意：**
>
> 这些标签名称仅作示例。如果你管理多类服务器，请根据你的基础设施命名规范调整（例如 `tag:gpu-a100` 或 `tag:ml-serving`）。

\[Missing snippet: visual\_policy\_editor.mdx]

策略文件配置选项的完整集合请参阅 [tailnet 策略文件参考][docs-tailnet-policy-file]。

## 用带标签的认证密钥认证服务器

认证密钥让服务器无需交互式登录即可加入你的 tailnet。在[密钥](https://console.tailscale.com/admin/settings/keys)页面生成带标签的认证密钥，设置如下：

* **可重用**（Reusable）：若要用同一标签添加多台服务器，则选择是。
* **预授权**（Pre-authorized）：如果你已启用[设备审批][docs-device-approval]，则选择是。
* **标签**（Tags）：选择你之前定义的标签（例如 `tag:inference-server`）。

在每台服务器上安装 Tailscale 并使用认证密钥完成认证：

```shell
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=tskey-auth-<your-key> --advertise-tags=tag:inference-server
```

服务器会立即以正确的标签加入你的 tailnet，全程无需交互式登录。

> **注意：**
>
> 带标签的设备已[禁用密钥自动过期][docs-key-expiry]，因此用带标签认证密钥认证的服务器无需定期重新认证。请像对待密码一样对待认证密钥，并将其存放在密钥管理器（secrets manager）中。

认证密钥选项的详细信息请参阅[认证密钥参考][docs-auth-keys]。

## 使用授权控制访问

使用[授权][docs-grants]定义哪些用户和分组可以访问你的带标签服务器以及通过哪些端口。以下示例为你的 ML 工程团队开放推理服务器的所有端口，并将训练集群的访问限制为 SSH 和一个监控端口：

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:inference-server"],
    "ip": ["*"],
  },
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:training-cluster"],
    "ip": ["22", "8080"],
  },
]
```

授权默认一律拒绝：如果没有任何授权明确允许某个源-目标组合，Tailscale 就会拦截该流量。

\[Missing snippet: visual\_policy\_editor.mdx]

更多授权模式请参阅[授权概述][docs-grants]与[授权示例][docs-grants-examples]。

## 为多租户环境隔离访问

当多个团队或客户共享 GPU 基础设施时，为每个租户分配各自的标签，防止一个租户访问另一个租户的服务器。为每个租户定义单独的标签和授权：

```json
"tagOwners": {
  "tag:tenant-a-gpu": ["autogroup:admin"],
  "tag:tenant-b-gpu": ["autogroup:admin"],
},
"grants": [
  {
    "src": ["group:tenant-a-users"],
    "dst": ["tag:tenant-a-gpu"],
    "ip": ["*"],
  },
  {
    "src": ["group:tenant-b-users"],
    "dst": ["tag:tenant-b-gpu"],
    "ip": ["*"],
  },
]
```

在此配置下，`group:tenant-a-users` 的成员可以访问打上 `tag:tenant-a-gpu` 标签的服务器，但无法访问 `tag:tenant-b-gpu`，反之亦然。

> **注意：**
>
> 这一模式适用于任何需要工作负载隔离的场景，并不限于多租户 GPU 基础设施。你可以用同样的方法分隔开发与生产环境、内部团队，或面向特定客户的部署。

## 连接容器化推理工作负载

对于运行在 Docker 容器中的推理工作负载，请使用通过环境变量传入的临时（ephemeral）带标签认证密钥。容器停止时，临时密钥会自动把该设备从你的 tailnet 中清理掉。

以下 Docker Compose 示例将一个容器作为带标签的推理服务器接入你的 tailnet：

```yaml
services:
  inference:
    image: your-inference-image:latest
    environment:
      - TS_AUTHKEY=tskey-auth-<your-ephemeral-key>
      - TS_STATE_DIR=/var/lib/tailscale
    volumes:
      - tailscale-state:/var/lib/tailscale
volumes:
  tailscale-state:
```

生成认证密钥时启用**临时**（Ephemeral）选项并勾选 `tag:inference-server` 标签。每个容器实例都以自己的身份加入 tailnet，关闭时 Tailscale 会自动将其移除。

> **注意：**
>
> 短生命周期容器使用临时密钥，长期运行的服务器使用可重用的非临时密钥。密钥类型的详细信息请参阅[认证密钥参考][docs-auth-keys]。

Docker 与容器配置选项的完整集合请参阅 [Docker 主题][docs-docker]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-docker]: /docs/features/containers/docker

[docs-grants]: /docs/features/access-control/grants

[docs-grants-examples]: /docs/reference/examples/grants

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
