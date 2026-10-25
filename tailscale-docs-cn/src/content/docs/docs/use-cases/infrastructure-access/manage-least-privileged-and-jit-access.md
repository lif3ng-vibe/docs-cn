---
title: "管理生产环境的最小权限访问与即时访问"
description: "Tailscale 遵循默认拒绝（deny-by-default）模型：除非 tailnet 策略文件明确允许，否则任何两台设备都无法通信。在此基础上，你可以强制实施最"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**即时访问**](/docs/features/access-control/just-in-time-access)——为你的 Tailscale 网络用户提供即时访问（JIT），也称为按需访问。

Tailscale 遵循默认拒绝（deny-by-default）模型：除非 [tailnet 策略文件][docs-policy-file]明确允许，否则任何两台设备都无法通信。在此基础上，你可以用 [标签][docs-tags]对资源分组、用[授权][docs-grants]定义精确的按角色权限，并借助[临时节点][docs-ephemeral]或[即时访问工作流][docs-jit]，只在任务需要时给工程师有时限的访问权限，从而强制实施最小权限访问。

## 为生产资源打标签

[标签][docs-tags]让你按角色为设备打标签，使访问策略作用于一组设备而不是单台机器。

1. 在认证时为每台生产主机分配诸如 `tag:prod-server` 这样的标签：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up --advertise-tags=tag:prod-server
   ```

2. 打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面，确认标签已显示在每台设备上。必须先在策略文件中定义标签，然后才能在授权中引用它。

## 用授权定义访问

[授权][docs-grants]让你指定哪些源可以访问哪些目标以及通过哪些端口。这取代了允许整个分组访问整个网络的宽泛规则，换成只放行所需内容的窄规则。

下面这条授权允许 `engineering` 分组的成员通过端口 `22` 访问生产服务器。

```json
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:prod-server"],
    "ip": ["tcp:22"]
  }
]
```

通过管理控制台的[访问控制](https://console.tailscale.com/admin/acls/file)页面将授权添加到 tailnet 策略文件。要进一步收窄访问，可以把源限定为特定用户或子分组，而不是整个分组。

## 强制实施设备态势要求

[设备态势][docs-device-posture]让你根据连接设备的状态来决定是否放行访问。你可以拦截来自不符合安全策略的设备的连接，例如缺少必需的安全 agent 或运行不受支持操作系统版本的设备。

态势要求通过 `srcPosture` 字段附加到授权上，一旦设备不再合规，连接就会被自动拒绝。[设备态势文档][docs-device-posture]介绍了如何配置态势提供方，以及如何在授权中引用具名的态势检查。

## 提供即时访问

对于只在任务需要期间有效的访问，Tailscale 提供了两种方式。

[临时节点][docs-ephemeral]使用短效认证密钥（auth key）加入 tailnet，会话期间有效，设备断开连接后自动移除。工程师完成认证、做完所需工作然后登出即可，无需手动清理节点。

对于基于审批的工作流，[Tailscale Accessbot][docs-jit] 让用户通过基于 Slack 的审批流程申请访问。审批人授予一个明确时限的访问权限，时限一到，授权自动过期。你还可以从身份提供方（IdP）同步分组，基于分组成员关系控制访问。

[docs-device-posture]: /docs/features/device-posture

[docs-ephemeral]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-jit]: /docs/features/access-control/just-in-time-access

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-tags]: /docs/features/tags
