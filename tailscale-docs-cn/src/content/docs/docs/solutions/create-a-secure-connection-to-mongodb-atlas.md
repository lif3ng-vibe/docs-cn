---
title: "创建到 MongoDB Atlas 的安全连接"
description: "安全地连接 MongoDB Atlas 数据库，并只允许你的 Tailscale 网络访问。"
---

最后验证于 Dec 4, 2025

## 简介

许多软件即服务（SaaS）应用要求提供一份允许的 IP 地址段列表，以便只允许预期的设备和用户连接。如果你在酒店、机场或咖啡馆等场所连接公共 Wi-Fi，由于允许的 IP 地址列表里没有你的 IP 地址，你很可能无法访问该应用。对于某些组织来说，每当有新用户加入，管理员都需要把该用户的 IP 地址添加到允许的 IP 地址集合中，这拖慢了新用户的入职速度。

Tailscale [应用连接器（app connector）][docs-app-connectors]让你可以把 SaaS 应用的流量经由 Tailscale 网络（称为 tailnet）中的专用设备路由。你无需维护一份包含 tailnet 中所有 IP 地址的允许列表，只需维护应用连接器 IP 地址的允许列表。你的用户在咖啡馆办公时依然拥有访问权限，tailnet 中的新用户一加入就能获得访问权限。你可以使用应用连接器安全地连接 [MongoDB Atlas][xt-mongodb-atlas] 数据库这类 SaaS 应用，并拒绝任何不在你 tailnet 中的人访问。

在本指南中，你将更新 [tailnet 策略文件][docs-tailnet-policy-file]来限制对 MongoDB Atlas 数据库的访问，配置并运行一个应用连接器来路由发往数据库的请求，并更新 Atlas 的 IP 地址列表，使访问只能经由应用连接器进行。完成本指南后，你将设置好访问限制，只允许你的 tailnet 用户访问该数据库。

## 前提条件

开始本指南之前，你需要具备以下条件：

* 一个 MongoDB Atlas 数据库。关于 MongoDB Atlas 的信息，请参阅 MongoDB 的 [What is MongoDB Atlas?][xt-mongodb-atlas-docs] 主题。
* 你的 Atlas 数据库的用户名和密码。
* 一个 MongoDB Atlas 的 Project Owner 角色，以便你能够编辑 Atlas IP 访问列表。
* 你的 Atlas 连接字符串。其形式为 `<cluster-name>.<hash>.mongodb.net`，例如 `cluster0.abcdef.mongodb.net`。关于如何获取连接字符串，请参阅 [Find your MongoDB Atlas connection string][xt-mongodb-connection-string]。
* 一个 Tailscale 账户。如果还没有，请[创建账户](https://login.tailscale.com/start)。
* 一台用作 tailnet 应用连接器的 Linux 设备。本方案会向你展示如何将该设备启动为 Atlas 的应用连接器。目前，请确保该设备满足应用连接器的[要求][docs-app-connectors-setup-requirements]，并且已加入你的 tailnet。
* tailnet 中另一台安装了 [MongoDB Shell][xt-mongodb-shell] 的设备。你将用这台设备连接你的 MongoDB Atlas 数据库。
* 一个 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 的 Tailscale 角色，以便你能够编辑 [tailnet 策略文件][docs-tailnet-policy-file]。

## 第 1 步：更新你的 tailnet 策略文件

配置你的 [tailnet 策略文件][docs-tailnet-policy-file]，把 tailnet 流量安全地路由到你的 Atlas 数据库。你需要对 tailnet 策略文件做以下更新：

* 为你的 Atlas 管理员创建一个 Tailscale 群组。
* 创建一个供你的应用连接器设备使用的标签，这些设备会把你的 tailnet 用户连接到你的 Atlas 数据库。
* 配置应用连接器设备的自动审批，这样它们加入你的 tailnet 时，通往 Atlas 数据库的路由会自动获得批准。这样你只需在该设备上运行一条 [`tailscale up`][docs-tailscale-up] 命令就能完成应用连接器设备的搭建。
* 创建一条授权，让你的 tailnet 用户能够访问 Atlas 数据库。
* 为你的特定 MongoDB Atlas 项目定义域名集合。你的 Atlas 应用连接器会使用这些域名把 tailnet 流量路由到 Atlas 数据库。

你需要是 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能编辑 tailnet 策略文件。

### 创建 Atlas 管理员群组

Tailscale [群组][docs-syntax-groups]让你可以创建用户群组，并在访问规则中使用它们（而不必逐一列出用户）。创建一个名为 `atlas-admins` 的群组，把所有 Atlas 管理员集中到同一个群组中。

1. 前往管理控制台的 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。

2. 选择 **Groups**（群组），然后选择 **Create tag**（创建标签）。

3. 在 **Group name**（群组名称）中输入 `atlas-admins`。

4. 在 **Members**（成员）中，从下拉列表选择你自己。如果你的 tailnet 中还有其他人需要管理你的 Atlas 应用连接器，也把他们加入这个群组。

5. （可选）在 **Note**（备注）中输入你想为这个群组保留的任何备注。

6. 选择 **Save group**（保存群组）。

有了 `atlas-admins` 群组之后，你就可以在标签中使用它了。

### 为你的应用连接器设备创建标签

Tailscale [标签][docs-tags]让你可以对非用户设备进行认证和标识。一个标签由一个标识符以及可以应用该标签的用户和群组组成。创建一个 `tag:atlas-app-connector` 标签，让你和 `atlas-admins` 群组的其他成员都能把它应用到你想用作 Atlas 应用连接器的设备上。

1. 前往管理控制台的 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。

2. 选择 **Tags**（标签），然后选择 **Create tag**（创建标签）。

3. 在 **Tag name**（标签名称）中输入 `atlas-app-connector`。

4. 在 **Tag owner**（标签所有者）中选择 `group:atlas-admins`。

5. （可选）在 **Note**（备注）中输入你想为这个标签保留的任何备注。

6. 选择 **Save tag**（保存标签）。

有了名为 `atlas-app-connector` 的标签之后，你就可以用它来自动审批通往你的 Atlas 数据库的路由了。

### 为你的应用连接器路由创建自动审批器

添加一条 [`autoApprovers`][docs-policy-syntax-autoapprovers] 规则，为拥有 `atlas-app-connector` 标签的设备自动审批特定路由。在你把应用流量配置为经由应用连接器路由之后，任何发往所配置应用域名的 DNS 请求都会触发路由发现。

1. 前往管理控制台的 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。

2. 选择 **Auto approvers**（自动审批器），然后选择 **Add route**（添加路由）。

3. 在 **Route**（路由）中输入 `0.0.0.0/0`。

4. 在 **Route is approved for**（路由批准对象）中选择 `tag:atlas-app-connector`。

5. （可选）在 **Note**（备注）中输入你想为这条自动审批路由保留的任何备注。

6. 再次选择 **Add route**。

7. 在 **Route**（路由）中输入 `::/0`。

8. 在 **Route is approved for**（路由批准对象）中选择 `tag:atlas-app-connector`。

9. （可选）在 **Note**（备注）中输入你想为这条自动审批路由保留的任何备注。

10. 选择 **Save route auto approver**（保存路由自动审批器）。

### 向你的 tailnet 用户提供 MongoDB Atlas 访问权限

添加一条 [`grants`][docs-policy-syntax-grants] 规则，让 Atlas 流量经由应用连接器路由。

你必须允许 tailnet 设备访问应用连接器宣告的路由。一种做法是向 tailnet 策略文件中添加一条访问控制策略，为 tailnet 成员授予对 `autogroup:internet`（任意端口）的访问权，这同时也会授予用户对 tailnet 中任何[出口节点][docs-exit-nodes]的访问权。

1. 前往管理控制台的 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。

2. 选择 **General access rules**（通用访问规则），然后选择 **Add rule**（添加规则）。

3. 在 **Source**（来源）中选择 `autogroup:member`。

4. 在 **Destination**（目标）中选择 `autogroup:internet`。

5. 在 **Destination and protocol**（目标与协议）中选择 `All ports and protocols`（所有端口和协议）。

6. （可选）在 **Note**（备注）中输入你想为这条授权保留的任何备注。

7. 选择 **Save grant**（保存授权）。

### 设置 Atlas 域名

为你创建的 `tag:atlas-app-connector` 标签添加一个[节点属性][docs-policy-syntax-node-attributes]，把你的 Atlas 项目域名加入连接器。你为这个应用连接器运行的任何设备都会使用这些域名把客户端请求映射到你的 Atlas 数据库。

你的 Atlas 连接字符串包含你的 Atlas 项目对应的 MongoDB Atlas 域名，形式为 `<cluster-name>.<hash>.mongodb.net`，例如 `cluster0.abcdef.mongodb.net`。对于这个例子，应在下一步的域名串中使用 `*.abcdef.mongodb.net`。如果你想把访问限制到特定集群，也可以使用 `cluster0.abcdef.mongodb.net` 这样的域名串。

有了 Atlas 域名之后，把它添加到应用连接器。

将你的 Atlas 域名添加到应用连接器

配置你的应用连接器，让它根据你的 Atlas 域名处理数据库请求的路由。

1. 前往管理控制台的 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。

2. 选择 **Node attributes**（节点属性），然后选择 **Add node attribute**（添加节点属性）。

3. 在 **Targets**（目标）中选择 `All users and devices`（所有用户和设备）。

4. （可选）在 **Note**（备注）中输入你想为这个节点属性保留的任何备注。

5. 在 **App** 中输入 `tailscale.com/app-connectors`。

6. 在 **Capability**（能力）中输入以下内容（把 `<hash>` 替换为你连接字符串中的哈希值）：

   ```json
   {
     "connectors": [
       "tag:atlas-app-connector"
     ],
     "domains": [
       "*.<hash>.mongodb.net"
     ],
     "name": "Atlas"
   }
   ```

   如果你希望在 `domains` 条目中指定特定集群而不是 `*`，请使用 `"<cluster-name>.<hash>.mongodb.net"` 而不是 `"*.<hash>.mongodb.net"`。

7. 选择 **Save node attribute**（保存节点属性）。

你已经为 Atlas 访问配置好了应用连接器，现在启动你的应用连接器设备。

## 第 2 步：为 Atlas 启动一个应用连接器

在 tailnet 中运行一台设备，把你的用户流量安全地路由到你的 MongoDB Atlas 数据库。

> **警告：**
>
> 应用连接器设备必须运行 Linux、已加入你的 tailnet、拥有公网 IP 地址并启用了 IP 端口转发，如应用连接器的[要求][docs-app-connectors-setup-requirements]所述。

在你想用作应用连接器的 Linux 设备上，运行以下 [`tailscale up`][docs-tailscale-up] 命令：

```shell
tailscale up --advertise-connector --advertise-tags=tag:atlas-app-connector
```

`--advertise-connector` 标志让设备能够根据 tailnet 策略文件中的配置为特定域名路由流量。`--advertise-tags` 标志告诉 Tailscale 客户端用 `tag:atlas-app-connector` 标签对设备进行认证。

默认情况下，tailnet 中的设备会不时被要求重新认证，以保证网络安全。为避免应用连接器设备需要重新认证时造成 DNS 中断，请前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择应用连接器设备旁边的按钮，然后选择 **Disable key expiry**（禁用密钥过期）。

你的应用连接器现在正在运行并充当 Atlas 应用连接器，你可以在 Atlas 中把它的 IP 地址加入允许列表，让 tailnet 用户访问数据库。

## 第 3 步：在 Atlas 中将应用连接器加入允许列表

Atlas 只允许来自 [Atlas 访问列表][xt-mongodb-atlas-configure-ips]中条目的客户端连接。更新 Atlas 访问列表，加入你应用连接器的出站 IP 地址。

首先，从 Tailscale 管理控制台获取你的应用连接器的 IP 地址。

1. 打开管理控制台的 [Apps](https://console.tailscale.com/admin/apps) 页面。
2. 选择 **MongoDB Atlas**。
3. 在 **Egress IPs**（出站 IP）部分复制该 IP 地址。

   > **注意：**
   >
   > 每次只能向 Atlas 访问列表输入一个 IP 地址。如果你有多个**出站 IP** 地址，需要逐个复制并粘贴到 Atlas IP 访问列表中。

接下来，把该 IP 地址添加到 Atlas 的允许 IP 地址列表。

1. 在 [Atlas 控制台][xt-mongodb-dashboard]中，前往 **Project**（项目），如果你的 Atlas 项目尚未激活，将其设为当前项目。
2. 在侧边栏的 **Security**（安全）下，选择 **Network Access**（网络访问），然后选择 **IP Access List**（IP 访问列表）。
3. 选择 **Add IP Address**（添加 IP 地址）。
4. 在 **Access List Entry**（访问列表条目）中，输入你从 Tailscale 管理控制台复制的应用连接器出站 IP 地址。
5. （可选）在 **Comment**（注释）中输入你想为这个 IP 地址保留的任何注释。
6. （可选）为该 IP 地址的允许访问时长设置时间限制。
7. 选择 **Confirm**（确认）。

如果你应用连接器的**出站 IP** 列表中还有其他 IP 地址，重复此步骤把它们加入 Atlas 访问列表。

### 从 Atlas 访问列表中移除不需要的 IP 地址

如果你的 Atlas 访问列表中包含并非专属于你的应用连接器的 IP 地址，请将其移除。否则，tailnet 之外的人可能访问数据库。

1. 在 **Network Access**（网络访问）页面，对你想删除的任何 IP 地址选择 **Delete**（删除）。
2. 再次选择 **Delete** 确认删除。

关于 MongoDB Atlas IP 访问列表的更多信息，请参阅 MongoDB 的 [Configure IP Access List Entries][xt-mongodb-atlas-configure-ips] 主题。

你的 Atlas 项目现在已配置为只接受来自指定 IP 地址段的请求，你可以从 tailnet 中的一台设备发起连接了。

## 第 4 步：连接到你的数据库

使用 tailnet 中装有 `mongosh` 的设备连接数据库。请使用一台与应用连接器设备不同的设备。

1. 如果该设备是 Linux 设备，请运行以下 [`tailscale set`][docs-tailscale-set] 命令，让客户端接受应用连接器提供的路由：

   ```shell
   tailscale set --accept-routes
   ```

   其他操作系统上的 Tailscale 客户端默认接受这些路由。

2. 运行以下命令（将占位符替换为你的 Atlas 数据库的值）：

   ```shell
   mongosh "mongodb+srv://<cluster-name>.<hash>.mongodb.net/" \
     --apiVersion 1 \
     --username <database-user-name>
   ```

   如果 `mongosh` 命令成功，`mongosh` 提示符会打开。要确认你能连接到数据库，运行：

   ```shell
    show dbs;
   ```

   该命令应列出你的 Atlas 项目中的数据库，类似如下：

   ```shell
   myDatabase     72.00 KiB
   admin         356.00 KiB
   local         997.79 MiB
   ```

使用完 `mongosh` 提示符后，输入 `exit` 关闭 `mongosh` 提示符。

你已经在另一台设备上测试了连接。现在尝试同样的 `mongosh` 步骤，但要先确保那台设备运行在不同的局域网（LAN）中。如果应用连接器和那台设备使用同一个局域网，它们的 IP 地址就都在你加入允许列表的同一个 IP 地址内。如果那台设备运行在不同的局域网，它使用的 IP 地址就会与应用连接器的 IP 地址不同。如果那台设备处于不同局域网仍能成功连接你的 Atlas 数据库，说明你已经成功地从 Atlas 一侧限制了访问。

现在可以确认这条连接是否依赖 Tailscale。

### 确认你的连接依赖 Tailscale

1. 在一台不同于应用连接器、且与应用连接器处于不同局域网的设备上，禁用 Tailscale 客户端。你可以通过 Tailscale 客户端界面禁用，也可以通过 [`tailscale down`][docs-tailscale-down] 命令禁用。

2. 运行以下命令（将占位符替换为你的 Atlas 数据库的值）：

   ```shell
   mongosh "mongodb+srv://<cluster-name>.<hash>.mongodb.net/" \
     --apiVersion 1 \
     --username <database-user-name>
   ```

   该命令应该无法连接到你的数据库，因为 Tailscale 未运行，设备无法使用应用连接器。如果设备没有运行 Tailscale 却成功连接了你的数据库，并且你已确认该设备的 IP 地址与应用连接器不同，说明你的 Atlas 允许 IP 地址列表过于宽松。检查是否有不应拥有访问权限的 IP 地址并移除它们。

   > **警告：**
   >
   > 如果你能在未运行 Tailscale 且 IP 地址不同于应用连接器的设备上连接你的 Atlas 数据库，请检查你的 Atlas 与 tailnet 策略文件设置并按需修正。否则，你的数据库访问就是不安全的。

确认连接依赖 Tailscale 之后，记得在客户端上重新启用 Tailscale。你可以通过 Tailscale 客户端界面启用，也可以通过 [`tailscale up`][docs-tailscale-up] 命令启用。

## 结语

在本指南中，你配置了一个应用连接器，让你的 tailnet 客户端能够访问 MongoDB Atlas 数据库，而 tailnet 之外的人无法访问该数据库。你还确保了设备必须启用 Tailscale 才能获得访问权限。

为确保你的 tailnet 用户对数据库的高可用访问，可以考虑[再添加一台应用连接器][ar-start-app-connector]设备，避免单一应用连接器故障导致无法访问 Atlas。如果你添加了另一台应用连接器，记得[把它的出站 IP 地址][ar-allowlist-app-connector]加入 Atlas 访问列表。

关于应用连接器的更多信息，请参阅[应用连接器（App connectors）][docs-app-connectors]。

[ar-allowlist-app-connector]: #第-3-步在-atlas-中将应用连接器加入允许列表

[ar-start-app-connector]: #第-2-步为-atlas-启动一个应用连接器

[docs-app-connectors-setup-requirements]: /docs/features/app-connectors/how-to/setup#要求

[docs-app-connectors]: /docs/features/app-connectors

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-grants]: /docs/reference/syntax/policy-file#授权grants

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-down]: /docs/reference/tailscale-cli#down

[docs-tailscale-set]: /docs/reference/tailscale-cli#set

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-mongodb-atlas-configure-ips]: https://www.mongodb.com/docs/atlas/security/ip-access-list

[xt-mongodb-atlas-docs]: https://www.mongodb.com/docs/atlas/

[xt-mongodb-atlas]: https://www.mongodb.com/products/platform

[xt-mongodb-connection-string]: https://www.mongodb.com/docs/manual/reference/connection-string/

[xt-mongodb-dashboard]: https://www.mongodb.com

[xt-mongodb-shell]: https://www.mongodb.com/docs/mongodb-shell/
