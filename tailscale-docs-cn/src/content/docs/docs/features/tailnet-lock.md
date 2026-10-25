---
title: "Tailnet Lock"
description: "确保未经 tailnet 中受信任节点签名的节点无法加入你的 tailnet。"
---

最后验证于 Dec 2, 2025

Tailnet Lock 让你可以确保：除非 tailnet 中受信任的节点为新节点签名，否则任何节点都无法加入你的 Tailscale 网络（即 tailnet）。启用 Tailnet Lock 后，即使 Tailscale 本身作恶或 Tailscale 基础设施被攻破，攻击者也无法在你的 tailnet 中收发流量。

> **注意：** Tailnet Lock 适用于 [Personal 和 Enterprise 套餐](https://tailscale.com/pricing)。

## Tailnet Lock 是什么？

Tailnet Lock 让 tailnet 中受信任的节点为其他节点签名并加以验证，这意味着你无需信任 Tailscale [协调服务器][docs-control-data-planes-coordination-server]来向 tailnet 中的对等节点分发公开[节点密钥][bl-tailscale-key-management-node-keys]（node key）。你可以控制哪些节点有资格为其他节点的公钥签名。

Tailscale 的[控制平面][docs-control-data-planes-control-plane]有权向 tailnet 添加节点或从中移除节点。因此，客户必须信任 Tailscale 的控制平面会对谁以及什么可以加入某个 tailnet 做出正确决定。客户有时会将这视为滥用或安全威胁的一个途径。Tailnet Lock 强制要求客户必须使用受信任的节点为 tailnet 的新增成员签名，从而大大降低了 Tailscale 突然成为威胁途径的风险。Tailnet Lock 遵循"首次使用即信任（TOFU）"模型：客户最初必须信任 Tailscale 的控制平面，但在首次使用之后，客户就可以将信任中心转移到自己的网络中。

客户也可以使用 [Headscale][xt-headscale] 自行托管受信任的控制平面。但这条路会失去 Tailscale 软件即服务（SaaS）模式所提供的可用性保障和低维护成本。既想把信任中心留在自己的网络中、又想继续享受 Tailscale 维护的控制平面所带来的好处的客户，可以使用 Tailnet Lock。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[Tailnet Lock | Tailscale Explained (video)](https://www.youtube.com/watch?v=G6ReHlan2EA)

## 工作原理

在没有 Tailnet Lock 的情况下，当新节点加入 tailnet 时，Tailscale 协调服务器会将公开节点密钥分发给对等节点。如果 Tailscale 作恶，悄悄向你的网络中插入新节点，那么 Tailscale 就能以明文形式与你现有的节点收发流量。

启用 Tailnet Lock 后，当新节点加入 tailnet 时，它的公开节点密钥需要由一个 Tailnet Lock 密钥签名。协调服务器将签名后的公开节点密钥分发给 tailnet 中的对等节点，对等节点随后会在允许连接之前验证签名。通过这种方式，你既能控制哪些节点可以信任地存在于你的 tailnet 中，也能控制哪些节点可以信任地为其他节点签名。

每个节点都有一个节点密钥和一个 Tailnet Lock 密钥：

* [节点密钥][bl-tailscale-key-management-node-keys]是由 Tailscale 客户端在节点上生成的公私钥对。协调服务器将节点密钥与特定身份绑定。私钥保存在节点上不外泄，公钥则被传输到协调服务器。

* Tailnet Lock 密钥（TLK），同样是一个公私钥对。每个节点都会生成一个 TLK，即使未启用 Tailnet Lock 也是如此。每个 TLK 的私钥存储在生成它的节点上，而每个受信任 TLK 的公钥副本则存储在 [tailnet 密钥管理机构][ar-tka]（TKA）中。

Tailnet Lock 主要由两个组件构成：

* 签名节点（signing node），即可用于为新节点签名、使其加入 tailnet 的节点。

* tailnet 密钥管理机构，它是 tailnet 中可用签名节点的存储机制。TKA 通过掌握当前受信任的 TLK 集合，可以在以下两种情况下验证签名：

  * 在将节点密钥加入其对等节点列表之前，验证节点密钥的签名。

  * 在处理更改受信任 TLK 集合的请求之前，验证请求的签名。

  TKA 的存储机制是一条加密链。随着客户更改 tailnet 配置，TKA 可能会无限制地增长。

有关 Tailnet Lock 架构的更多信息，请参阅 [Tailnet Lock 白皮书][docs-tailnet-lock-whitepaper]。

### 禁用密钥

禁用密钥（disablement secret）是在启用 Tailnet Lock 的过程中生成的长密码。由于禁用 Tailnet Lock 是一项涉及安全的操作，你必须持有禁用密钥才能禁用 Tailnet Lock。如果禁用流程缺少授权检查，被攻破的协调服务器就能轻而易举地禁用 Tailnet Lock（连同其所有保护），进而像 Tailnet Lock 未运行一样攻击 tailnet。

禁用密钥只会在你初始化 Tailnet Lock 时发放一次。请务必安全地保存它们。可以选择使用你所在组织的安全存储（如密码管理器），或者打印出来存放在保险柜中。在初始化 Tailnet Lock 时，你还可以选择为 Tailscale 支持团队生成一个禁用密钥。这样，万一我们的 Tailnet Lock 实现出现问题，或者你丢失了自己的禁用密钥，Tailscale 支持团队仍可禁用 Tailnet Lock。

### tailnet 密钥管理机构

为了确定信任哪些 Tailnet Lock 密钥，节点实现了一个名为 tailnet 密钥管理机构（tailnet key authority，TKA）的新子系统。TKA 跟踪并更新可用于为节点密钥签名的 Tailnet Lock 密钥集合。你在启用 Tailnet Lock 时指定初始的受信任锁密钥集合，之后可以通过[添加][ar-add-a-signing-node]或[移除][ar-remove-a-signing-node]密钥来更改受信任的 Tailnet Lock 密钥集合。协调服务器会将受信任的 Tailnet Lock 密钥集合发布到你 tailnet 的所有节点。

## 启用 Tailnet Lock

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能启用 Tailnet Lock。

Tailnet Lock 默认不启用。启用后，tailnet 中所有现有节点都会获得由你 tailnet 中受信任节点提供的签名。

> **注意：**
>
> 确保你想要用 Tailnet Lock 锁定的节点运行的是 Tailscale v1.46.1 或更高版本。

启用 Tailnet Lock 需要使用 [`tailscale lock init`][docs-tailscale-lock-lock-init] 命令。借助 Tailscale 管理控制台，可以更轻松地生成 `tailscale lock init` 命令所需的各个值。

*（图：启用 Tailnet Lock 的界面）*

1. 打开管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。确保管理控制台与签名节点上运行的 Tailscale 客户端登录的是同一个 tailnet。
2. 选择 **Enable Tailnet Lock**（启用 Tailnet Lock）。
3. 在 **Add signing nodes**（添加签名节点）区域中，选择 **Add signing node**（添加签名节点）。
4. 选择你想要信任其 Tailnet Lock 密钥的节点。你必须至少选择两个签名节点。
5. （可选）：在 **Configure disablement options**（配置禁用选项）区域中，指定是否向 Tailscale 支持团队发送一个[禁用密钥][ar-disablement-secrets]。启用 **Send disablement secret to Tailscale support**（向 Tailscale 支持团队发送禁用密钥）后，此选项会额外创建一个禁用密钥并自动传输给 Tailscale 支持团队。这样，万一我们的 Tailnet Lock 实现出现问题，或者你丢失了自己的禁用密钥，Tailscale 支持团队仍可禁用 Tailnet Lock。
6. 在 **Run command from signing node**（从签名节点运行命令）区域中，复制 `tailscale lock init` 命令。
7. 在你选择的其中一个签名节点上打开终端窗口。
8. 粘贴你从管理控制台复制的 `tailscale lock init` 命令，然后按 Enter。

运行管理控制台提供的 `tailscale lock init` 命令时，该命令会创建并显示十个禁用密钥。禁用 Tailnet Lock 只需要一个禁用密钥，尽管 `tailscale lock init` 会生成十个。请记下输出中显示的禁用密钥。禁用密钥是禁用你的 Tailnet Lock 所需的长密码。有关禁用密钥的更多信息，请参阅 [`tailscale lock disable`][docs-tailscale-lock-lock-disable]。

> **警告：**
>
> 禁用密钥只会在你初始化 Tailnet Lock 时显示一次。如果你丢失了禁用密钥，又没有向 Tailscale 支持团队提供过一份，那么该 tailnet 将无法恢复。请务必安全地保存禁用密钥。可以选择使用你所在组织的安全存储（如密码管理器），或者打印出来存放在保险柜中。

在 `tailscale lock init` 成功完成后：

* tailnet 中的所有现有节点都由受信任的 Tailnet Lock 密钥签名。
* 受信任的 Tailnet Lock 密钥集合会分发到现有节点。
* 节点在允许连接之前会验证对等节点节点密钥的签名。
* 所有新的节点密钥都必须由现有的 Tailnet Lock 密钥[签名][ar-add-node]。

> **注意：**
>
> 启用 Tailnet Lock 后，每个节点都依赖从控制平面发送给它的 Tailnet Lock 初始状态（[首次使用即信任][docs-tailnet-lock-whitepaper-tofu]）。要确认初始状态未被篡改，你可以运行 [`tailscale lock status`][docs-tailscale-lock-lock-status] 命令并检查受信任签名密钥列表，以验证每个节点上配置的 Tailnet Lock 状态。tailnet 中的所有节点应报告相同的签名密钥集合，且该集合应与你指定签名节点的 Tailnet Lock 密钥一致。

## 禁用 Tailnet Lock

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能禁用 Tailnet Lock。

#### Tailscale 管理控制台

1. 打开管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面。
2. 选择 **Disable Tailnet Lock**（禁用 Tailnet Lock）。
3. 在 **Disablement secret**（禁用密钥）中，输入你在启用 Tailnet Lock 时安全保存的[禁用密钥][ar-disablement-secrets]。
4. 选择 **Disable Tailnet Lock**（禁用 Tailnet Lock）。

#### Tailscale CLI

运行 [`tailscale lock disable`][docs-tailscale-lock-lock-disable] 命令，并指定你在启用 Tailnet Lock 时安全保存的一个[禁用密钥][ar-disablement-secrets]。

```shell
tailscale lock disable <disablement-secret>
```

一旦你使用了指定的禁用密钥，Tailscale 协调服务器就会将它分发到 tailnet 中的所有节点，你应当将其视为已公开。

如果你重新启用 Tailnet Lock（例如再次运行 `tailscale lock init` 命令），会得到新的禁用密钥。

如果你的整个 tailnet 在 Tailnet Lock 上遇到严重问题，且无法通过 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面将其禁用（例如找不到你的禁用密钥），你可以在每个节点上运行 `tailscale lock local-disable` 命令，让你的 tailnet 实际上忽略 Tailnet Lock。详情请参阅 [`tailscale lock local-disable`][docs-tailscale-lock-lock-local-disable]。

## 向已锁定 tailnet 添加节点

如果你已启用 Tailnet Lock 并想添加一个新节点，你需要为新节点的[节点密钥][bl-tailscale-key-management-node-keys]签名。

添加节点有两种方式：

* 使用 Tailscale 客户端应用的签名链接。此方式仅适用于 macOS、Windows 和 iOS。*我们正在支持 Android。*
* 使用 [`tailscale lock sign`][docs-tailscale-lock-lock-sign] 命令，它是 [Tailscale CLI][docs-cli] 的一部分。此方式仅适用于 Linux、macOS 和 Windows。

两种方式都需要访问 Tailscale 管理控制台，因为获取待添加节点的节点密钥信息只能通过管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面完成。

### 使用客户端应用添加节点

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。确保管理控制台与签名节点上运行的 Tailscale 客户端登录的是同一个 tailnet。
2. 选择需要签名的节点。在机器列表中查找 **Locked out**（已锁定）徽章，或者使用 [`property:locked-out`](https://console.tailscale.com/admin/machines?q=property%3Alocked-out) 筛选器找出所有被锁定的设备。
3. 选择 **Sign machine**（签名机器）。
4. 在 **Sign machine**（签名机器）对话框中，有三个标签页可供选择来添加节点。
   * 在 **Desktop**（桌面）标签页中，如果你正在使用一台作为签名节点的 macOS 或 Windows 设备，选择 **Sign this node**（签署此节点）。否则，选择 **Copy signing URL**（复制签名 URL），将该 URL 发送给一台签名节点，并在该签名节点上打开此 URL。两种方式都会打开 Tailscale 客户端，让你添加该节点。

   * 在 **Mobile**（移动）标签页中，如果你正在使用一台作为签名节点的 iOS 设备，扫描二维码打开 Tailscale 客户端，然后添加该节点。也可以选择 **Copy signing URL**（复制签名 URL），将该 URL 发送给一台签名节点，并在该签名节点上打开此 URL。两种方式都会打开 Tailscale 客户端，让你添加该节点。

     > **注意：**
     >
     > 目前仅 iOS 设备支持通过二维码添加节点。

   * 在 **CLI** 标签页中，选择 **Copy**（复制）图标复制 [`tailscale lock sign`][docs-tailscale-lock-lock-sign] 命令。在签名节点上运行该命令即可添加节点。

### 使用 CLI 添加节点

使用 [`tailscale lock sign`][docs-tailscale-lock-lock-sign] 命令添加节点。

以下示例添加一个节点：

```shell
tailscale lock sign nodekey:1abddef1 tlpub:abcdef12
```

* `nodekey:1abddef1` 是你想添加到 tailnet 的节点的节点密钥。
* `tlpub:abcdef12` 是可选的受信任签名节点的 Tailnet Lock 密钥，用于密钥轮换。

请将这些示例值替换为你实际的节点密钥和可选的 Tailnet Lock 密钥。

你可以通过管理控制台或 [Tailscale CLI][docs-cli] 来获取所需的 `tailscale lock sign` 命令。

使用管理控制台获取 `tailscale lock sign` 命令的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。确保管理控制台与签名节点上运行的 Tailscale 客户端登录的是同一个 tailnet。
2. 选择需要签名的节点。在机器列表中查找 **Locked out**（已锁定）徽章，或者使用 [`property:locked-out`](https://console.tailscale.com/admin/machines?q=property%3Alocked-out) 筛选器找出所有被锁定的设备。
3. 选择 **Sign node**（签名节点）。
4. 选择 **CLI**。
5. 复制为该节点签名所需的 `tailscale lock sign` 命令。
6. 在签名节点上运行该命令以添加节点。

也可以使用 Tailscale CLI 来获取 `tailscale lock sign` 命令：

1. 在你想添加到 tailnet 的节点上运行：

   ```shell
   tailscale lock status
   ```

2. 在 `tailscale lock status` 的输出中，复制为该节点签名所需的 `tailscale lock sign` 命令。

3. 然后，在持有受信任 Tailnet Lock 密钥的节点上，运行你在上一步复制的命令：

   ```shell
   tailscale lock sign nodekey:<your-node-key> tlpub:<your-tailnet-lock-key>
   ```

   请将这些示例值替换为你实际的节点密钥和可选的 Tailnet Lock 密钥。

当已签名的节点密钥[过期][docs-key-expiry]后，新的节点密钥无需重新签名。用户重新认证时，节点会用自己的 [Tailnet Lock 密钥][docs-tailnet-lock-whitepaper-keys]为新节点密钥签名，从而自动轮换其签名。

### 使用预签名认证密钥添加节点

为[认证密钥][docs-auth-keys]签名后，你就可以使用[预签名][docs-auth-keys-authkey-pre-signed]认证密钥将设备添加到已锁定的 tailnet，而不必先添加节点*再*为它的节点密钥签名。

1. [生成][docs-auth-keys-generate-a-key]一个预批准认证密钥。

2. 在持有受信任 Tailnet Lock 密钥的节点上，将环境变量 `AUTH_KEY` 设置为该认证密钥的值：

   ```shell
   export AUTH_KEY="tskey-auth-<XXXXCTRL-NNNNNN>"
   ```

   请将此示例值替换为你实际的认证密钥。

3. 运行 [`tailscale lock sign`][docs-tailscale-lock-lock-sign] 命令为认证密钥签名：

   ```shell
   tailscale lock sign $AUTH_KEY
   ```

4. 使用 `tailscale lock sign` 命令生成的新密钥来[预批准][docs-device-approval-pre-approve]你 tailnet 中的设备。

## 查看节点的 Tailnet Lock 公钥

在某些 Tailnet Lock 操作中，你需要知道节点的 Tailnet Lock 公钥。节点的 Tailnet Lock 公钥形如 `tlpub:abcdef12`。

它与节点的 Tailscale 公钥不同，后者形如 `nodekey:abcdef12`。

### 使用 CLI 查看 Tailnet Lock 公钥

使用 [Tailscale CLI][docs-cli] 查看节点的 Tailnet Lock 公钥（仅适用于 Linux、macOS 和 Windows）：

* 运行 [`tailscale lock status`][docs-tailscale-lock-lock-status]。该命令会显示此节点的 Tailnet Lock 公钥。

### 使用管理控制台查看 Tailnet Lock 公钥

使用管理控制台查看节点的 Tailnet Lock 公钥的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。确保管理控制台与签名节点上运行的 Tailscale 客户端登录的是同一个 tailnet。

2. 选择你想查看其 Tailnet Lock 公钥的节点。

3. 在 **Machine Details**（机器详情）区域中查找 **Tailnet Lock key**（Tailnet Lock 密钥）。如果界面中没有 **Tailnet Lock key**，说明该 tailnet 未启用 Tailnet Lock。

4. 选择 **Copy**（复制），将该密钥复制到剪贴板。

### 使用客户端查看 Tailnet Lock 公钥

#### macOS

1. 从 Tailscale 客户端菜单中选择 **Settings**（设置）。
2. 如果 **Settings** 标签页尚未激活，选择它。
3. 在 **Tailnet Lock** 区域中，选择 **Manage**（管理）。
4. 在打开的对话框中，**Tailnet Lock Key** 区域会显示 Tailnet Lock 公钥。选择 **Copy**（复制）图标，将该密钥复制到剪贴板。

#### iOS

1. 从 Tailscale 客户端菜单中选择 **Settings**（设置）。
2. 如果 **Settings** 标签页尚未激活，选择它。
3. 在 **Tailnet Lock** 区域中，选择 **Manage**（管理）。
4. 在打开的对话框中，**Tailnet Lock Key** 区域会显示 Tailnet Lock 公钥。选择 **Copy**（复制）图标，将该密钥复制到剪贴板。

## 添加签名节点

1. [查看][ar-determine-public-key]你想添加为签名节点的节点的 Tailnet Lock 公钥。

2. 在持有受信任 Tailnet Lock 密钥的节点上，运行 [`tailscale lock add`][docs-tailscale-lock-lock-add] 命令，并传入上一步查到的 Tailnet Lock 密钥。

   以下示例添加两个签名节点：

   ```shell
   tailscale lock add tlpub:trusted-key1 tlpub:trusted-key2
   ```

   请将这些示例值替换为你自己的 Tailnet Lock 密钥。

## 移除签名节点

你必须从持有受信任 Tailnet Lock 密钥的节点上执行此流程。

1. 如果你还没有想要移除的各签名节点的 Tailnet Lock 公钥，请先[查看 Tailnet Lock 公钥][ar-determine-public-key]。

2. 在持有受信任 Tailnet Lock 密钥的节点上，运行 [`tailscale lock remove`][docs-tailscale-lock-lock-remove] 命令，并传入上一步查到的 Tailnet Lock 密钥。

   以下示例移除两个签名节点：

   ```shell
   tailscale lock remove tlpub:trusted-key7 tlpub:trusted-key8
   ```

   请将这些示例值替换为你自己的 Tailnet Lock 密钥。

当你在节点 *Node-A* 上运行 `tailscale lock remove` 来移除签名节点 *Node-B* 时，默认情况下，之前由 Node-B 签名的所有节点都会用 Node-A 的密钥重新签名。你可以通过向 `tailscale lock remove` 命令传入 `--re-sign=false` 来禁用此行为。

## 吊销已泄露的签名节点

如果某个签名节点被泄露（compromised），请运行 [`tailscale lock revoke-keys`][docs-tailscale-lock-revoke-keys] 命令吊销已泄露的密钥。密钥一旦被吊销，就不能再用于 Tailnet Lock。之前由被吊销密钥签名的所有节点都会失去授权，需要重新签名。

> **注意：**
>
> 如果你想移除的密钥并未泄露，请改用 [`tailscale lock remove`][docs-tailscale-lock-lock-remove] 命令。

吊销是一个多步骤流程，需要多个签名节点共同签署此次吊销。每个步骤都使用 `tailscale lock revoke-keys` 命令。

1. 在一台未持有被泄露密钥的签名节点上打开终端。

2. 运行 `tailscale lock revoke-keys` 命令。

   以下示例吊销两个签名节点——`tlpub:compromised-key1 tlpub:compromised-key2` 是以空格分隔的待吊销密钥列表：

   ```shell
   tailscale lock revoke-keys tlpub:compromised-key1 tlpub:compromised-key2
   ```

   请将这些示例值替换为你自己的 Tailnet Lock 密钥。

   该命令的输出中包含一条 `tailscale lock revoke-keys --cosign` 命令，下一步会用到它。

3. 在另一台受信任的签名节点上，运行 `tailscale lock revoke-keys --cosign` 命令。该命令的输出中会包含一条新的 `tailscale lock revoke-keys --cosign` 命令。重复此过程，始终使用每条 `--cosign` 命令的最新输出，直到你使用 `--cosign` 的次数超过被吊销密钥的数量。例如，如果你吊销了 3 个密钥，就需要运行 `tailscale lock revoke-keys --cosign` 命令 4 次。

4. 最后，运行上一次使用 `--cosign` 时输出的命令，**但**要将 `--cosign` 替换为 `--finish`：

   ```shell
   tailscale lock revoke-keys --finish <hex-data>
   ```

   请将此示例值替换为你自己的十六进制数据。

默认情况下，Tailscale 会确定 Tailnet Lock 日志中合适的分叉点。如果认为某个密钥应当可被吊销的签名节点多于持反对意见的节点，那么你的 tailnet 会使用 Tailscale 判定仍然可信的那个分叉中的密钥，而不是被吊销的密钥。

如果大多数签名节点都被泄露，你可以禁用 Tailnet Lock，然后再重新启用。

## Tailnet Lock 如何与其他 Tailscale 功能协作

关于 Tailnet Lock 如何与其他 Tailscale 功能协作，请注意以下几点。

### 基于链接的节点共享

要将 Tailnet Lock 与[基于链接的节点共享][docs-sharing]配合使用，共享到启用了 Tailnet Lock 的 tailnet 中的节点需要先获得签名才能被访问。

要从启用了 Tailnet Lock 的 tailnet 向外共享节点，接受共享邀请的用户需要先让其节点在已锁定的 tailnet 中获得签名，然后才能访问被共享的节点。

### Tailscale SSH Console

你可以使用 [Tailscale SSH Console][docs-tailscale-ssh-console] 为 tailnet 中已签名的节点建立 SSH 会话，前提是：

* 你的 [tailnet 策略文件][docs-acls]允许网络访问。
* [Tailscale SSH 规则][docs-policy-syntax-ssh]允许 SSH 访问。

## 配置审计日志

启用、禁用或修改 Tailnet Lock 配置都会产生事件，这些事件会出现在[配置审计日志][docs-audit-logging]中。

除配置审计日志外，你还可以在节点上运行 [`tailscale lock log`][docs-tailscale-lock-lock-log] 命令，查看 tailnet 最近的 Tailnet Lock 更改。

## Tailnet Lock 状态

Tailnet Lock 会尝试将数据存储在每个节点的 Tailscale 状态目录中：

* 如果使用 macOS、Windows、iOS、Android 和 tvOS 客户端，状态目录会自动设置。
* 如果运行 [`tailscaled` 守护进程][docs-tailscaled]，状态目录由 [`--statedir`][docs-tailscaled-flags] 或 `--state` 标志设置。
* 如果使用官方 Tailscale `deb`、`rpm` 和 `tar.gz` 软件包自带的默认 systemd unit 文件，`--state` 标志会自动设置。
* 如果在 Docker 或 Kubernetes 中使用 Tailscale，状态目录由 [`TS_STATE_DIR` 环境变量][docs-docker-tsstatedir]设置。

如果你不提供状态目录，Tailscale 就必须将 Tailnet Lock 数据存储在内存中。
这意味着节点每次启动时都必须从控制平面重新获取完整状态。

我们强烈建议设置状态目录，这样可以消除这种对控制平面的启动依赖。

## 局限性

* 你需要自行安全保存[禁用密钥][ar-disablement-secrets]。如果你丢失了禁用密钥，又没有向 Tailscale 支持团队提供过一份，那么该 tailnet 将无法恢复。
* 你的 tailnet 中最多可以有 20 个签名节点。
* 为防止 TKA 无限制增长，Tailnet Lock 密钥的轮换频率不得超过每年一次。
* Tailnet Lock 与[设备批准][docs-device-approval]不能同时启用——两者互斥。
* Tailnet Lock 密钥存储在设备上。如果设备被攻破，密钥就可能被获取。
* 你不能将 Android 设备用作签名节点，因为它无法执行签名操作。*我们正在改进这一点。*

[ar-add-a-signing-node]: #添加签名节点

[ar-add-node]: #向已锁定-tailnet-添加节点

[ar-determine-public-key]: #查看节点的-tailnet-lock-公钥

[ar-disablement-secrets]: #禁用密钥

[ar-remove-a-signing-node]: #移除签名节点

[ar-tka]: #tailnet-密钥管理机构

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys-authkey-pre-signed]: /docs/features/access-control/auth-keys#authkey-pre-signed

[docs-auth-keys-generate-a-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-data-planes-control-plane]: /docs/concepts/control-data-planes#control-plane

[docs-control-data-planes-coordination-server]: /docs/concepts/control-data-planes#coordination-server

[docs-device-approval-pre-approve]: /docs/features/access-control/device-management/device-approval#pre-approve-devices-with-an-auth-key

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-docker-tsstatedir]: /docs/features/containers/docker/docker-params#ts_state_dir

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-sharing]: /docs/features/sharing

[docs-tailnet-lock-whitepaper-keys]: /docs/concepts/tailnet-lock-whitepaper#tailnet-lock-keys

[docs-tailnet-lock-whitepaper-tofu]: /docs/concepts/tailnet-lock-whitepaper#enablement-is-trust-on-first-use-tofu

[docs-tailnet-lock-whitepaper]: /docs/concepts/tailnet-lock-whitepaper

[docs-tailscale-lock-lock-add]: /docs/reference/tailscale-cli/lock#lock-add

[docs-tailscale-lock-lock-disable]: /docs/reference/tailscale-cli/lock#lock-disable

[docs-tailscale-lock-lock-init]: /docs/reference/tailscale-cli/lock#lock-init

[docs-tailscale-lock-lock-local-disable]: /docs/reference/tailscale-cli/lock#lock-local-disable

[docs-tailscale-lock-lock-log]: /docs/reference/tailscale-cli/lock#lock-log

[docs-tailscale-lock-lock-remove]: /docs/reference/tailscale-cli/lock#lock-remove

[docs-tailscale-lock-lock-sign]: /docs/reference/tailscale-cli/lock#lock-sign

[docs-tailscale-lock-lock-status]: /docs/reference/tailscale-cli/lock#lock-status

[docs-tailscale-lock-revoke-keys]: /docs/reference/tailscale-cli/lock#lock-revoke-keys

[docs-tailscale-ssh-console]: /docs/features/tailscale-ssh/tailscale-ssh-console

[docs-tailscaled]: /docs/reference/tailscaled

[docs-tailscaled-flags]: /docs/reference/tailscaled#flags-to-tailscaled

[xt-headscale]: https://headscale.net
