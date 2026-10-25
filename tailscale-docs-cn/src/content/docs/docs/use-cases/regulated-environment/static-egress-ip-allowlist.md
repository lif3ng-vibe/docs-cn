---
title: "为受监管环境提供静态 IP 出站地址"
description: "为满足银行、医疗和政府等受监管环境的安全与合规要求，组织通常需要让网络流量经由固定 IP 地址进行"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**子网路由器**](/docs/features/subnet-routers)——使用子网路由器让本地网络之外的设备访问特定子网内的服务，用 Tailscale 扩展你的私有网络。

为满足银行、医疗和政府等受监管环境的安全与合规要求，组织通常需要让网络流量经由固定 IP 地址路由，以便进行白名单登记。你可以用 Tailscale 完成这项任务：设置一台[子网路由器][docs-subnet-routers]，并向受监管环境提供一个静态出站 IP 地址。

在本指南中，你将更新 [tailnet 策略文件][docs-tailnet-policy-file]以限制对云虚拟机的访问，配置并运行一台云虚拟机把请求路由到受监管环境，并更新受监管环境的 IP 地址白名单，使其只接受来自该云虚拟机的流量。完成本指南后，你将设置好访问限制，只允许你的 tailnet 用户访问受监管环境。

## 更新你的 tailnet 策略文件

配置你的 [tailnet 策略文件][docs-tailnet-policy-file]，把 tailnet 流量安全地路由到受监管环境。你需要在 tailnet 策略文件中做以下更新：

* 创建一个用于云虚拟机的标签，由它把你的 tailnet 用户连接到受监管环境。
* 创建一个分组，确保只有特定用户经由云虚拟机路由流量。
* 创建一条授权，让 tailnet 用户可以访问云虚拟机，进而访问受监管环境。

> **注意：**
>
> 编辑 tailnet 策略文件需要拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 角色。

### 创建标签

Tailscale [标签][docs-tags]让你认证并标识非用户设备。一个标签由标识符以及可应用该标签的用户和分组组成。创建 `tag:regulated-egress-node` 标签，让你和其他管理员能把它应用到要用作子网路由器的云虚拟机上。

1. 前往管理控制台的[可视化编辑器](https://console.tailscale.com/admin/acls/visual)标签页。

2. 选择**标签**（Tags），然后选择**创建标签**（Create tag）。

3. 在**标签名称**（Tag name）中输入 `regulated-egress-node`。

4. 在**标签所有者**（Tag owner）中选择 `autogroup:admin`。

5. （可选）在**备注**（Note）中输入你想为该标签保留的任何说明。

6. 选择**保存标签**（Save tag）。

现在你有了名为 `regulated-egress-node` 的标签，可以把它应用到任何你想用来把流量路由到受监管环境的设备上。

### 创建分组

Tailscale [分组][docs-policy-file-groups]让你创建用户分组，并可在访问规则中使用（而不必逐一列出用户）。创建名为 `regulated-access-users` 的分组，把你所有需要访问受监管环境的用户放进同一个分组。

1. 前往管理控制台的[可视化编辑器](https://console.tailscale.com/admin/acls/visual)标签页。

2. 选择**分组**（Groups），然后选择**创建分组**（Create group）。

3. 在**分组名称**（Group name）中输入 `regulated-access-users`。

4. 在**成员**（Members）中添加 tailnet 里你希望授予受监管环境访问权限的那批用户。可以按名称、分组添加用户，或使用 [`autogroup`][docs-targets-and-selectors-autogroups]，例如想让 tailnet 的所有成员都能访问受监管环境时使用 `autogroup:member`。

5. （可选）在**备注**（Note）中输入你想为该分组保留的任何说明。

6. 选择**保存分组**（Save group）。

现在你有了 `regulated-access-users` 分组，可以用它来授予对云虚拟机的访问权限。

### 创建授权

添加一条 [`grants`][docs-grants] 规则，让获准的用户经由云虚拟机路由流量。

1. 前往管理控制台的[访问控制](https://console.tailscale.com/admin/acls)页面。

2. 如果还没有 `grants` 部分，先创建一个。

3. 在 `grants` 部分内，创建一条新的 `grant`：

   ```json
   "grants": [
     {
       "src": ["group:regulated-access-users"],
       "dst": ["1.2.3.4/32"],
       "ip": ["*"],
       "via": ["tag:regulated-egress-node"]
     }
   ]
   ```

   在这条授权示例中：

   * `src` 是你为需要访问受监管环境的 tailnet 用户设置的分组。
   * `dst` 是受监管环境的 IP 地址范围。把 `"1.2.3.4/32"` 替换为你的受监管环境的实际值。
   * `ip` 是 IP 协议和端口的集合。本例中为所有协议和所有端口。
   * `via` 指定源（`src`）如何路由到目标（`dst`）。本例中，流量经由带有 `tag:regulated-egress-node` 标签的云虚拟机路由。

4. 选择**保存**（Save）。

## 配置云虚拟机

设置云虚拟机，让它把流量路由到受监管环境。

1. 参阅云提供商的文档，设置一台以 Linux 为操作系统的云虚拟机。确保该虚拟机拥有静态 IP 地址。

2. 在 Linux 设备上运行 Tailscale 安装脚本：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

   该脚本会检测你的 Linux 发行版，并用相应的包管理器安装 Tailscale，适用于多种 Linux 平台。脚本未覆盖的发行版，请参阅[在 Linux 上安装 Tailscale][docs-install-linux]了解其他安装方法。

3. 子网路由器必须启用 IP 转发，才能在 tailnet 与本地网络之间路由流量。运行以下命令启用 IP 转发并使其在重启后依然生效：

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

4. 在云虚拟机上运行 [`tailscale up`][docs-up] 命令：

   ```bash
   sudo tailscale up --advertise-routes=198.51.100.5/32 --advertise-tags=tag:regulated-egress-node
   ```

   把 `198.51.100.5/32` 替换为你要宣告的受监管环境网络的实际 IP 地址值。

5. 该命令会输出一个 URL。在浏览器中打开该 URL，用你的身份提供方（IdP）登录并授权该设备。授权完成后，设备会加入你的 tailnet，并开始向指定子网宣告路由。

> **提示：**
>
> 对于无法在本地打开浏览器的无头（headless）服务器，复制该 URL 并在任何其他设备上打开。无论你用哪台设备完成授权，授权都作用于云虚拟机。

在其他设备能够使用宣告的子网路由之前，必须先批准这些路由。

1. 前往管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。
2. 选择云虚拟机旁边的图标，然后选择**编辑子网路由**（Edit subnet routes）。
3. 启用你想批准的路由，然后选择**保存**（Save）。

## 将云虚拟机 IP 地址列入白名单

把云虚拟机的静态 IP 地址提供给受监管环境。

1. 从云提供商的管理控制台获取云虚拟机的 IP 地址。该 IP 地址由云提供商控制，而非 Tailscale。

2. 更新受监管环境的白名单 IP 地址集合，加入云虚拟机的 IP 地址。操作指引请参阅受监管环境关于 IP 地址白名单的文档。

3. 在 tailnet 中需要访问宣告子网上服务的 Linux 设备上，运行以下命令以接受路由：

```bash
tailscale set --accept-routes
```

其他操作系统上的 Tailscale 客户端默认接受子网路由。

现在你的 tailnet 用户应该能够连接到受监管环境了。

## （可选）让云虚拟机保持持久连接

对于服务器和其他长期在线的设备，考虑禁用密钥过期，避免子网路由器需要周期性重新认证——那会中断所有使用它的设备的连接。

要禁用密钥过期，前往管理控制台的[机器](https://console.tailscale.com/admin/machines)页面，选择设备旁边的图标，然后选择**禁用密钥过期**（Disable key expiry）。

> **警告：**
>
> 禁用密钥过期会降低安全性，如果设备或密钥泄露，可能暴露你的网络。只对受信任的设备这样做，一旦设备丢失或更换，立即吊销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

你也可以确认 `tailscaled` 服务已配置为开机自启：

```bash
sudo systemctl enable --now tailscaled
```

现在，你的 Linux 设备充当一台拥有稳定、持久出站 IP 地址的子网路由器。任何连接受监管环境子网上服务的 tailnet 设备，在这些服务看来都来自子网路由器的本地 IP 地址，无论该设备实际位于何处。你可以放心地把这个出站 IP 地址列入本地网络上的服务、API 或防火墙白名单，因为它不会改变。

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-and-selectors-autogroups]: /docs/reference/targets-and-selectors#autogroup

[docs-up]: /docs/reference/tailscale-cli/up
