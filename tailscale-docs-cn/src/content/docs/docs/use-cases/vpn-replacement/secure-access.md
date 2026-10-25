---
title: "安全地远程访问公司内部应用与数据"
description: "员工需要访问内部仪表盘、文件共享、SaaS 工具和基础设施，但这些访问必须受到控制，只有合适的人才能触达合适的资源。Tailscale 使用访问控制策略精"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选方案指南：
>
> [**创建到 MongoDB Atlas 的安全连接**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas) — 安全地连接 MongoDB Atlas 数据库，并只允许你的 Tailscale 网络访问。

员工需要访问内部仪表盘、文件共享、SaaS 工具和基础设施，但这些访问必须受到控制，只有合适的人才能触达合适的资源。Tailscale 使用访问控制策略精确定义谁能连接哪些内部应用，依据的是身份而非网络位置。

## 控制对内部应用的访问

访问控制策略让你可以细粒度地控制哪些员工能访问哪些内部资源。使用群组、主机、标签和授权来表达这些策略，例如[基于用途并借助标签来允许访问][docs-grants-tags]、[按群组限制访问][docs-grants-groups]，或[基于设备态势管控访问][docs-grants-device-posture]。

下面的示例为工程团队和销售团队分别授予对各自内部主机的访问权限。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面，管理你的 tailnet 策略文件。

2. 定义[群组][docs-visual-editor-groups]，并将其与用户关联。

   ```json
   {
     "groups": {
       "group:eng": ["alice@example.com"],
       "group:sales": ["bob@example.com"]
     }
   }
   ```

   在此示例中，创建了一个 "Engineering"（`eng`）群组和一个 "Sales"（`sales`）群组。

3. 定义[主机][docs-visual-editor-hosts]。

   ```json
   {
     "hosts": {
       "internal-bugreports": "100.100.123.123",
       "internal-dashboard": "100.100.124.124"
     }
   }
   ```

   在此示例中，创建了 "Internal Bug Reports"（`internal-bugreports`）和 "Internal Dashboard"（`internal-dashboard`）这两个主机。

4. 定义一条授权，将群组与主机关联。

   ```json
   {
     "grants": [
       {
         "src": ["group:eng"],
         "dst": ["host:internal-bugreports"],
         "ip": ["tcp:443", "tcp:22"]
       },
       {
         "src": ["group:sales"],
         "dst": ["host:internal-dashboard"],
         "ip": ["tcp:443", "tcp:22"]
       }
     ]
   }
   ```

> **提示：**
>
> 对于无法直接安装 Tailscale 的内部资源（例如打印机或旧式服务器），可以使用[子网路由器][docs-subnet-routers]来访问。

## 使用 SSH 安全访问服务器

对于需要访问内部服务器的团队，[Tailscale SSH][docs-tailscale-ssh] 用基于身份的认证取代了传统的 SSH 密钥管理。SSH 连接使用 Tailscale 身份进行认证，并与 tailnet 其余部分遵循同一套访问控制策略，从此无需再分发和轮换 SSH 密钥。

## 通过即时审批限制访问

对于敏感资源，可以考虑即时访问（JIT），确保连接是临时且有明确意图的，而不是长期常开。Tailscale 通过[设备态势][docs-device-posture]属性和 [Tailscale Accessbot][docs-tailscale-accessbot-jit]支持[即时访问][docs-jit]，员工可以通过 Slack 工作流申请限时访问权限。

## 监控与审计访问

为满足合规与事件响应需求，Tailscale 提供[配置审计日志][docs-audit-logging]来跟踪 tailnet 配置的变更，并提供[网络流日志][docs-network-flow-logs]来监控哪些设备正在与哪些资源通信。二者结合，让你既能看清谁改了什么，也能看清谁访问了什么。

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-device-posture]: /docs/features/device-posture

[docs-grants-device-posture]: /docs/reference/examples/grants#基于设备态势控制资源访问

[docs-grants-groups]: /docs/reference/examples/grants#按组访问不同环境

[docs-grants-tags]: /docs/reference/examples/grants#使用标签按用途授权

[docs-jit]: /docs/features/access-control/just-in-time-access

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailscale-accessbot-jit]: /docs/features/tailscale-accessbot-jit

[docs-visual-editor-groups]: /docs/reference/visual-editor#组

[docs-visual-editor-hosts]: /docs/reference/visual-editor#主机
