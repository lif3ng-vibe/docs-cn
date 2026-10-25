---
title: "tailscale lock 命令"
description: "`tailscale lock` 管理你 tailnet 的 [Tailnet Lock][docs-tailnet-lock]。"
---

最后验证于 Jan 5, 2026

`tailscale lock` 管理你 tailnet 的 [Tailnet Lock][docs-tailnet-lock]。

```shell
tailscale lock <subcommand> [flags] <args>
```

子命令：

* [`init`][ar-lock-init] 初始化 Tailnet Lock。
* [`status`][ar-lock-status] 输出 Tailnet Lock 的状态。
* [`add`][ar-lock-add] 向 Tailnet Lock 添加一个或多个受信任签名密钥。
* [`remove`][ar-lock-remove] 从 Tailnet Lock 移除一个或多个受信任签名密钥。
* [`sign`][ar-lock-sign] 为节点密钥签名，并把签名传送给协调服务器。
* [`disable`][ar-lock-disable] 消耗一个禁用密钥（disablement secret）来关闭整个 tailnet 的 Tailnet Lock。
* [`log`][ar-lock-log] 列出已应用到 Tailnet Lock 的变更。
* [`local-disable`][ar-lock-local-disable] 仅为该节点禁用 Tailnet Lock。
* [`revoke-keys`][ar-lock-revoke-keys] 追溯吊销一个或多个 Tailnet Lock 密钥。

不带子命令和参数运行 `Tailnet Lock` 等同于运行 [`tailscale lock status`][ar-lock-status]。

示例：

```shell
tailscale lock
```

示例输出：

```shell
Tailnet Lock is ENABLED.

This node is accessible under Tailnet Lock.

This node's tailnet-lock key: tlpub:1234abcdef

Trusted signing keys:
	tlpub:1234abcdef	(us)
```

## lock init

为整个 tailnet 初始化 [Tailnet Lock][docs-tailnet-lock]。

```shell
tailscale lock init [flags] <tlpub:trusted-key1 tlpub:trusted-key2 ...>
```

可用标志：

* `--confirm=false` 是否提示确认。设为 `true` 时不提示确认。
* `--gen-disablement-for-support` 额外生成一个禁用密钥并传送给 Tailscale 支持团队。Tailscale 支持随后可以用它来禁用 Tailnet Lock。注意，如果 Tailscale 支持禁用了 Tailnet Lock，它将保持禁用状态，且 Tailscale 支持无法重新启用，因此这被视为一种紧急恢复机制，而不是临时禁用 Tailnet Lock。
* `--gen-disablements <N>` 要生成的禁用密钥数量。未指定时默认生成一个，这是初始化 Tailnet Lock 所需的最小数量。

所指定的 Tailnet Lock 密钥是最初受信任、可用于为节点签名或对 Tailnet Lock 配置做进一步修改的密钥。它们是 Tailnet Lock 公钥。要确定你想信任的节点的 Tailnet Lock 密钥，可以在该节点上运行 `tailscale lock`，然后复制该节点的 Tailnet Lock 密钥。

你必须把正在运行 `tailscale lock init` 的节点的 Tailnet Lock 密钥指定为受信任的 Tailnet Lock 密钥之一。其他密钥列表必须以空格分隔。

> **注意：**
>
> 禁用密钥只在你初始化 Tailnet Lock 时显示。请记录下来，并妥善保存在安全的地方。

示例：

```shell
tailscale lock init --gen-disablements=3 --gen-disablement-for-support \
  --confirm tlpub:1234abcdef
```

示例输出：

```
You are initializing Tailnet Lock with the following trusted signing keys:
 - tlpub:1234abcdef (25519 key)

3 disablement secrets have been generated and are printed below. Take note of them now, they WILL NOT be shown again.
	disablement-secret:ABC1234
	disablement-secret:DEF5678
	disablement-secret:GHI9012
A disablement secret for Tailscale support has been generated and will be transmitted to Tailscale upon initialization.
Initialization complete.
```

禁用密钥是关闭你的 Tailnet Lock 所需的长密码。更多信息请参阅 [`tailscale lock disable`][ar-lock-disable] 命令。

禁用密钥的数量将是你为 `--gen-disablements` 指定的值。如果你设置了 `--gen-disablement-for-support`，会看到一条关于已为 Tailscale 支持生成禁用密钥的消息。

## lock status

输出 Tailnet Lock 的状态。该命令显示 Tailnet Lock 是否启用、节点 Tailnet Lock 公钥的值，以及哪些节点被 Tailnet Lock 锁定而无法连接其他节点。

```shell
tailscale lock status [flags]
```

可用标志：

* `--json` 返回机器可读的 JSON 响应。

示例：

```shell
tailscale lock status
```

示例输出：

```
Tailnet Lock is ENABLED.

This node is accessible under Tailnet Lock.

This node's tailnet-lock key: tlpub:1234abcdef

Trusted signing keys:
	tlpub:1234abcdef	(us)
```

如果运行 `tailscale lock status` 的节点没有可用的密钥，输出会类似：

```
This node is LOCKED OUT by tailnet-lock, and action is required to establish connectivity.
Run the following command on a node with a trusted key:
	tailscale lock sign nodekey:abcdef12 tlpub:11223344
```

如果你的某个对端节点被锁定在 tailnet 之外，在受信任签名密钥列表之后，输出会类似：

```
 The following nodes are locked out by Tailnet Lock and cannot connect to other nodes:
	bob.yak-bebop.ts.net.	100.111.222.33, fd7a:115c:a1e0:aabb:ccdd:eeff:0123:4567	n12345CNTRL
```

## lock add

向 Tailnet Lock 添加一个或多个受信任签名密钥。

此命令需要在拥有受信任 Tailnet Lock 密钥的节点上运行。

```shell
tailscale lock add <tlpub:trusted-key1 tlpub:trusted-key2 ...>
```

所指定的 Tailnet Lock 密钥是 Tailnet Lock 公钥。要确定 Tailnet Lock 密钥，可以在该节点上运行 `tailscale lock`，然后复制该节点的 Tailnet Lock 密钥。

其他密钥列表必须以空格分隔。

## lock remove

从 Tailnet Lock 移除一个或多个受信任签名密钥。

此命令需要在拥有受信任 Tailnet Lock 密钥的节点上运行。

```shell
tailscale lock remove [flags] <tlpub:trusted-key1 tlpub:trusted-key2 ...>
```

可用标志：

* `--re-sign` 重新签署会因移除受信任签名密钥而失效的签名。默认为 true。

所指定的 Tailnet Lock 密钥是 Tailnet Lock 公钥。要确定 Tailnet Lock 密钥，可以在该节点上运行 `tailscale lock`，然后复制该节点的 Tailnet Lock 密钥。

其他密钥列表必须以空格分隔。

## lock sign

执行签名操作。`tailscale lock sign` 有两种签名模式：

* 使用当前节点（命令运行所在的节点）上的 Tailnet Lock 密钥为节点密钥签名，并把签名传送给协调服务器。
* 为[预批准认证密钥][docs-auth-keys]签名，并以可用于在 [Tailnet Lock][docs-tailnet-lock] 下启动节点的形式输出。具体来说，它[为认证密钥签名][docs-tailnet-lock-add-pre-approved]，使其无需在把新节点加入 tailnet 前*再*为新节点签名就能完成新节点认证。每个已签名的认证密钥（也称包裹认证密钥，wrapped auth key）内嵌一个签名密钥，可为单个或多个新节点签名，直到它被[移除][ar-lock-remove]。

为节点密钥签名，是让被 Tailnet Lock 锁定的节点建立连接所必需的。

如果任何密钥参数以 `file:` 开头，密钥将从参数后缀指定路径的文件中读取。

此命令需要在拥有受信任 Tailnet Lock 密钥的节点上运行。

```shell
tailscale lock sign <node-key> [<rotation-key>]
```

或者

```shell
tailscale lock sign <auth-key>
```

示例：

本示例演示为节点密钥签名，可选地使用该节点的 Tailnet Lock 密钥（`tlpub:trusted-key2`）以支持密钥轮换。

```shell
tailscale lock sign nodekey:1abddef1 tlpub:trusted-key2
```

本示例展示为认证密钥签名。此示例中，`$AUTH_KEY` 是一个环境变量，其值为你[已经生成][docs-auth-keys-generating-a-key]的[预批准][docs-auth-keys-types]认证密钥。

```shell
tailscale lock sign $AUTH_KEY
```

成功运行该命令的输出是一个已签名的预批准认证密钥，随后你可以用它来[预批准][docs-device-approval-pre-approve]你 tailnet 中的设备。

> **警告：**
>
> 创建已签名认证密钥时，会为它创建一个新的受信任签名密钥，并加入 [tailnet 密钥管理机构][docs-tailnet-lock-tka]（tailnet key authority）。该签名密钥的私钥被编码在已签名认证密钥中。已签名认证密钥等同于你 tailnet 中某台签名节点上的私有签名密钥，一旦泄露会威胁你的 tailnet。即使认证密钥是一次性的，签名密钥在被从 tailnet 密钥管理机构移除之前始终受信任。
>
> 出于安全最佳实践，我们不建议使用已签名认证密钥。

## lock disable

消耗指定的禁用密钥，为整个 tailnet 禁用 Tailnet Lock。

```shell
tailscale lock disable <disablement-secret>
```

禁用 Tailnet Lock 是与安全相关的操作——如果禁用流程缺少授权检查，一个被攻陷的控制平面就能轻而易举地禁用 Tailnet Lock（及其全部保护），像从前一样攻击 tailnet。为避免这种情况，全局禁用 Tailnet Lock 必须使用禁用密钥。

禁用密钥是启用 Tailnet Lock 的过程中（即你运行 [`tailscale lock init`][ar-lock-init] 时）生成的长密码。每个禁用密钥经密钥推导函数（KDF）推导出的值会被每个节点的 tailnet 密钥管理机构存储（因此 tailnet 中的每个节点都知道），但密钥本身在被使用前保持机密。

使用禁用密钥时，该密钥会被分发给 tailnet 中的所有节点。每个节点随后可以计算该密钥的 KDF 值，并与 tailnet 密钥管理机构（TKA）中存储的 KDF 值比较，以验证禁用操作的真实性。如果匹配，节点就可以确信禁用是真实的，并在本地禁用 Tailnet Lock。

指定的 `disablement-secret` 一旦被使用，就已经分发给 tailnet 中的所有节点，应视为公开。

如果重新启用 Tailnet Lock，会生成新的禁用密钥。

示例：

```shell
tailscale lock disable disablement-secret:ABC1234
```

## lock disablement-kdf

从禁用密钥计算禁用值。此命令仅供高级用户使用。

```shell
tailscale lock disablement-kdf <hex-encoded-disablement-secret>
```

## lock log

列出已应用到 Tailnet Lock 的变更。

```shell
tailscale lock log [flags]
```

可用标志：

* `--json` 返回机器可读的 JSON 响应。
* `--limit` 列出的最大变更数。默认为 50。

示例：

```shell
tailscale lock log
```

示例输出：

```
update 17310b8e655867d3973a72cd20bc7c21f81f7687b4e7911c285f2eb16df5df36 (checkpoint)
Disablement values:
 - 1234abcd
 - 9876aaaa
 - c1d2e3f4
 - 8f6e4d2c
Keys:
  Type: 25519
  KeyID: 1234abcdef
  Votes: 1
```

## lock local-disable

仅为该节点禁用 Tailnet Lock。

```shell
tailscale lock local-disable
```

此命令只为当前节点（命令运行所在的节点）禁用 Tailnet Lock。如果仅为该节点禁用了 Tailnet Lock，该节点将开始接受来自其他被锁定节点的流量。这并不意味着该节点可以与 tailnet 中其他已签名的节点收发流量。

如果你在整个 tailnet 上遇到严重的 Tailnet Lock 问题，且无法用 [`tailscale lock disable`][ar-lock-disable] 禁用（例如找不到你的禁用密钥），可以在每台节点上运行 `tailscale lock local-disable`，让你的 tailnet 实际上忽略 Tailnet Lock。

## lock revoke-keys

追溯吊销指定的 Tailnet Lock 密钥。

此命令需要在拥有受信任 Tailnet Lock 密钥的节点上运行。

```shell
tailscale lock revoke-keys <tlpub:key1 tlpub:key2 ...> [flags]
```

可用标志：

* `--cosign=false` 使用此设备上的 Tailnet Lock 密钥继续密钥吊销，配合来自另一台拥有受信任 Tailnet Lock 密钥、已运行 `tailscale lock revoke-keys` 的设备提供的恢复命令。
* `--finish=false` 通过传送吊销内容来完成恢复过程。
* `--fork-from <hash>`（仅限高级用户）用于重写 tailnet 密钥管理机构状态的父[管理机构更新消息][docs-tailnet-lock-whitepaper-aums]（AUM）的哈希。

所指定的 Tailnet Lock 密钥是 Tailnet Lock 公钥。要确定 Tailnet Lock 密钥，可以在该节点上运行 `tailscale lock`，然后复制该节点的 Tailnet Lock 密钥。

其他密钥列表必须以空格分隔。

> **注意：**
>
> 如果你想移除一个未被攻陷的密钥，请改用 [`tailscale lock remove`][ar-lock-remove] 命令。

吊销是一个多步骤流程，需要多台签名节点共同签署吊销。每一步都使用 `tailscale lock revoke-keys` 命令。

1. 在一台密钥未被攻陷的签名节点上打开终端。

2. 运行以下命令，其中 `<tlpub:compromised-key1 tlpub:compromised-key2>` 是你想吊销的密钥的空格分隔列表：

   ```shell
   tailscale lock revoke-keys tlpub:compromised-key1 tlpub:compromised-key2
   ```

   此命令的输出包含一条 `tailscale lock revoke-keys --cosign` 命令，你将在下一步使用它。

3. 在另一台受信任的签名节点上，运行该 `tailscale lock revoke-keys --cosign` 命令。此命令的输出会包含一条新的 `tailscale lock revoke-keys --cosign` 命令。重复此过程，始终使用每条 `--cosign` 命令的新输出，直到你使用 `--cosign` 的次数超过被吊销密钥的数量。例如，如果你吊销了 3 个密钥，需要运行 `tailscale lock revoke-keys --cosign` 命令 4 次。

4. 用最后一次使用 `--cosign` 时输出的命令完成流程，**但**要把 `--cosign` 替换为 `--finish`：

   ```shell
   tailscale lock revoke-keys --finish <hex-data>
   ```

默认情况下，Tailscale 会确定 Tailnet Lock 日志中合适的分叉点。如果同意吊销某个密钥的签名节点多于反对的，那么 Tailscale 认定仍然受信任的分叉中的密钥将取代被吊销的密钥。

如果大多数签名节点已被攻陷，你可以[禁用][docs-tailnet-lock-disable-tailnet-lock]再[重新启用][docs-tailnet-lock-enable-tailnet-lock] Tailnet Lock 本身。

[ar-lock-add]: #lock-add

[ar-lock-disable]: #lock-disable

[ar-lock-init]: #lock-init

[ar-lock-local-disable]: #lock-local-disable

[ar-lock-log]: #lock-log

[ar-lock-remove]: #lock-remove

[ar-lock-revoke-keys]: #lock-revoke-keys

[ar-lock-sign]: #lock-sign

[ar-lock-status]: #lock-status

[docs-auth-keys-generating-a-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#types-of-auth-keys

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval-pre-approve]: /docs/features/access-control/device-management/device-approval#pre-approve-devices-with-an-auth-key

[docs-tailnet-lock-add-pre-approved]: /docs/features/tailnet-lock#add-a-node-using-a-pre-signed-auth-key

[docs-tailnet-lock-disable-tailnet-lock]: /docs/features/tailnet-lock#disable-tailnet-lock

[docs-tailnet-lock-enable-tailnet-lock]: /docs/features/tailnet-lock#enable-tailnet-lock

[docs-tailnet-lock-tka]: /docs/features/tailnet-lock#tailnet-key-authority

[docs-tailnet-lock-whitepaper-aums]: /docs/concepts/tailnet-lock-whitepaper#authority-update-messages-aums

[docs-tailnet-lock]: /docs/features/tailnet-lock
