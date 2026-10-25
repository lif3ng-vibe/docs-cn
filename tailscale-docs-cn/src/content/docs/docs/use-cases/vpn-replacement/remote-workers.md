---
title: "为居家或远程办公员工提供安全的远程访问"
description: "远程办公与居家办公员工需要访问本地部署和办公室内的资源，而又不必身临现场。Tailscale 使用子网路由器暴露公司网络、使用出口节点将全部流量通过公司网关隧"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选方案指南：
>
> [**创建到 MongoDB Atlas 的安全连接**](/docs/solutions/create-a-secure-connection-to-mongodb-atlas) — 安全地连接 MongoDB Atlas 数据库，并只允许你的 Tailscale 网络访问。

远程办公与居家办公员工需要访问本地部署和办公室内的资源，而又不必身临现场。Tailscale 使用子网路由器来暴露公司网络，使用出口节点将全部流量通过公司网关隧道传输，并借助[访问控制][docs-access-control]策略定义谁能访问什么。

## 将所有流量路由经过公司网关

在不受信任的网络中工作的员工，或受合规策略约束、要求所有流量都经过公司网络路由的员工，需要的不仅仅是对特定资源的访问。[出口节点][docs-exit-nodes]会将设备的所有互联网流量路由经过你网络中的一个指定节点，充当完整的 VPN 替代方案。与暴露特定网段的子网路由器不同，出口节点会捕获所有出站流量。

1. 在公司网络中[配置一台设备][docs-exit-node-configure]，将其对外宣告为出口节点。
2. 在管理控制台中[允许该出口节点][docs-exit-node-allow]。
3. [配置远程员工的设备][docs-exit-node-use]，让它们通过 Tailscale 客户端使用该出口节点。
4. （可选）使用[系统策略][docs-system-policies]强制员工设备上的 Tailscale 始终运行，并防止员工将其停用。

配置完成后，这些设备的所有互联网流量都会经过出口节点路由，无论它们身处何种网络，连接都是安全的。

## 连接到你的公司网络

文件服务器、内部应用和数据库等某些资源无法直接安装 Tailscale。[子网路由器][docs-subnet-routers]在公司网络内的一台设备上运行 Tailscale，并宣告通向周围子网的路由，让远程员工无需在每个资源上安装 Tailscale 就能访问它们。

1. 在公司网络内一台将充当网关的设备上[安装 Tailscale][docs-subnet-router-install]。
2. 从该设备[宣告子网路由][docs-subnet-router-advertise]。
3. 在管理控制台中[启用已宣告的路由][docs-subnet-router-enable]。
4. 为该子网[添加访问规则][docs-subnet-router-acl]。
5. （可选）设置[高可用][docs-set-up-high-availability]，避免你的子网路由器成为连接性的单点故障。

此后，远程员工即可通过 tailnet 访问该子网上的任何资源，无需在这些设备上做任何额外配置。

## 按群组和角色限制访问

访问控制策略确保远程员工只能访问与其角色相关的资源，防止在网络中横向移动。使用群组、标签和授权来划定这些边界，例如[按群组允许访问不同环境][docs-grants-groups]，或[根据位置将流量路由经过出口节点][docs-grants-location]。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面，管理你的 tailnet 策略文件。

2. 定义一个[群组][docs-visual-editor-groups]，并将其与用户关联。

   ```json
   {
     "groups": {
       "group:remote": ["alice@example.com"]
     }
   }
   ```

   在此示例中，创建了一个 "Remote"（`remote`）群组。

3. 定义一个[标签][docs-visual-editor-tags]，并[将其与设备关联][docs-tags-working-with-tags]。

   ```json
   {
     "tagOwners": {
       "tag:internal-tools": ["autogroup:admin"]
     }
   }
   ```

   在此示例中，创建了一个 "Internal Tools"（`internal-tools`）标签。

4. 定义一条授权，将群组与标签关联。

   ```json
   {
     "grants": [
       {
         "src": ["group:remote"],
         "dst": ["tag:internal-tools"],
         "ip": ["*"]
       }
     ]
   }
   ```

> **提示：**
>
> 对于加入你 tailnet 的承包商，`autogroup:shared` 是一个很实用的选择器。

[docs-access-control]: /docs/features/access-control

[docs-exit-node-allow]: /docs/features/exit-nodes#allow-the-exit-node-from-the-admin-console

[docs-exit-node-configure]: /docs/features/exit-nodes#configure-an-exit-node

[docs-exit-node-use]: /docs/features/exit-nodes#use-the-exit-node

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-set-up-high-availability]: /docs/how-to/set-up-high-availability

[docs-subnet-router-acl]: /docs/features/subnet-routers#add-access-rules-for-the-advertised-subnet-routes

[docs-subnet-router-advertise]: /docs/features/subnet-routers#connect-to-tailscale-as-a-subnet-router

[docs-subnet-router-enable]: /docs/features/subnet-routers#enable-subnet-routes-from-the-admin-console

[docs-subnet-router-install]: /docs/features/subnet-routers#install-the-tailscale-client

[docs-grants-groups]: /docs/reference/examples/grants#allow-access-to-different-environments-by-group

[docs-grants-location]: /docs/reference/examples/grants#route-traffic-through-exit-nodes-based-on-location

[docs-system-policies]: /docs/features/tailscale-system-policies

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags-working-with-tags]: /docs/features/tags#working-with-tags

[docs-visual-editor-groups]: /docs/reference/visual-editor#groups

[docs-visual-editor-tags]: /docs/reference/visual-editor#tags
