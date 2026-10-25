---
title: "tailzero"
description: "[Tailscale PAM][docs-pam] 提供 `tailzero` 命令行界面（CLI），让你启动和管理自己的 Tailscale PAM [连接器][docs-pam-connectors]。"
---

最后验证于 Sep 30, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 提供 `tailzero` 命令行界面（CLI），让你启动和管理自己的 Tailscale PAM [连接器][docs-pam-connectors]。

当你[设置 PAM 连接器][docs-pam-connectors-install]时，`tailzero` 会被安装到连接器设备上。

> **注意：**
>
> Tailscale PAM 源自 [Border0 加入 Tailscale][bl-border0-joins-tailscale]。由于后端依赖关系，目前 `tailzero` 的若干内容（如标志名称和描述）仍使用 "border0" 或 "Border0"，如本主题所示。

## 命令参考

`tailzero` 提供用于启动、安装和卸载连接器，检查和升级 `tailzero` 版本，以及查看运行中连接器状态的命令。

要获取 `tailzero` 的帮助，运行：

```shell
tailzero -h
```

要获取某个具体命令（例如 `tailzero start`）的帮助，运行：

```shell
tailzero start -h
```

要获取某个具体子命令（例如 `tailzero version check`）的帮助，运行：

```shell
tailzero version check -h
```

### start

启动连接器。这是默认命令。

```shell
tailzero start [flags]
```

可用标志：

* `--acl-cap-pam=<uri>` 策略引擎读取 PAM 授权所用应用能力的 URI。当控制平台保留了 `tailscale.com` 域时可覆盖此值，例如 `border0.com/cap/pam`。默认为 `tailscale.com/cap/pam`。
* `--border0-invite-code=<code>` Border0 连接器邀请码。除非设置了 `--border0-token`，否则必填。
* `--border0-token=<token>` Border0 连接器令牌。除非设置了 `--border0-invite-code`，否则必填。
* `--cache-k8s-namespace=<namespace>` 用于缓存邀请交换凭证的 Kubernetes Secret 所在的命名空间。与 `--border0-invite-code` 配合使用。
* `--cache-k8s-secret-name=<name>` 用于缓存邀请交换凭证的 Kubernetes Secret 名称。与 `--border0-invite-code` 配合使用。
* `--cache-ssm-path=<path>` 用于缓存邀请交换凭证的 AWS SSM Parameter Store 路径。与 `--border0-invite-code` 配合使用。
* `--config-dir=<path>` 包含凭证和密钥环境文件的目录，启动时加载。
* `--debug` 启用详细的逐连接日志，包括策略评估和连接追踪。也可以通过设置环境变量 `BORDER0_VERBOSE_LOG=true` 来启用。
* `--hostname=<name>` 用作连接器名称的主机名。默认为所在主机的主机名。
* `--state-source=<uri>` Tailscale 节点身份的状态源 URI。可以是 Kubernetes Secret 的 `kube:<secret-name>`，AWS SSM Parameter Store 的 `arn:aws:ssm:<region>:<acct>:parameter/<path>`（可在 ECS 部署后保留），或临时状态的 `mem:`。留空时，状态以文件形式存储在 `--statedir` 下。当此值为 SSM ARN 且未设置 `--cache-ssm-path` 时，Border0 凭证也会存储在同一个参数中。
* `--statedir=<path>` Tailscale 状态目录。用于运行时文件，也是未设置 `--state-source` 时默认的状态文件位置。默认为 `/var/lib/tailzero`。
* `--ts-auth-key=<key>` Tailscale [认证密钥（auth key）][docs-auth-keys]。除非已有身份联合凭证，否则必填。
* `--ts-control-url=<url>` Tailscale 协调服务器 URL。自托管部署时设置此项。默认为公共 Tailscale 控制平面。
* `--ts-id-fed-cid=<client-id>` Tailscale [身份联合][docs-workload-identity]的客户端 ID。未设置 `--ts-auth-key` 时必填。
* `--ts-id-fed-token=<token>` Tailscale [身份联合][docs-workload-identity]的令牌。未设置 `--ts-auth-key` 时必填。

### install

将连接器安装为系统服务。

```shell
tailzero install [flags]
```

可用标志：

* `--border0-invite-code=<code>` Border0 邀请码，会被兑换为令牌和认证密钥。
* `--border0-token=<token>` Border0 连接器令牌。直接提供此项会跳过邀请兑换。
* `--cache-k8s-namespace=<namespace>` 用于凭证缓存的 Kubernetes 命名空间。
* `--cache-k8s-secret-name=<name>` 用于凭证缓存的 Kubernetes Secret 名称。
* `--cache-ssm-path=<path>` 用于凭证缓存的 AWS SSM 路径。
* `--config-dir=<path>` 凭证和密钥文件目录。默认为 `/etc/border0`。
* `--connector-name=<name>` 连接器名称。默认为所在主机的主机名。
* `--service-user=<user>` 运行服务的用户。默认为当前用户。
* `--state-dir=<path>` Tailscale 状态目录。默认为 `/var/lib/tailzero`。
* `--ts-auth-key=<key>` Tailscale [认证密钥][docs-auth-keys]。直接提供此项会跳过邀请兑换。

### uninstall

移除系统服务。

```shell
tailzero uninstall
```

此命令没有标志。

### version

输出版本号，或检查并升级到更新的版本。

```shell
tailzero version [subcommand] [flags]
```

不带子命令运行 `tailzero version` 会输出已安装的版本。

子命令：

* `check` 检查是否有更新的版本。
* `upgrade` 下载并安装更新的版本。

`check` 的可用标志：

* `--track=<track>` 要检查的发布通道，例如 `stable` 或 `unstable`。默认为 `stable`。

`upgrade` 的可用标志：

* `--track=<track>` 要从中升级的发布通道，例如 `stable` 或 `unstable`。默认为 `stable`。
* `--version=<version>` 要下载的特定版本，例如 `1.0.0-0-gabcdef0` 或 `latest`。

### status

显示运行中连接器的状态。`status` 命令查询连接器的本地管理套接字，因此必须在连接器设备上、且连接器正在运行时执行。

```shell
tailzero status [subcommand] [flags]
```

不带子命令运行 `tailzero status` 会输出一份一目了然的总览：连接器的健康状态、主机名、tailnet、活跃与远程对等端总数，以及活跃与本地服务总数。

子命令：

* `peers` 显示 tailnet 对等端，类似 `tailscale status`。
* `services` 显示连接器的服务及其状态。
* `health` 输出 `OK` 或 `UNHEALTHY`。连接器健康时命令以 `0` 退出，否则以 `1` 退出，因此可用作容器、systemd 或 Kubernetes 探针。

总览及所有子命令都可用的通用标志：

* `--json` 输出原始 JSON 而不是格式化表格。
* `--socket=<path>` 连接器管理套接字的路径。默认为 `<statedir>/mgmt.sock`。
* `--statedir=<path>` 用于定位默认管理套接字的状态目录。默认为 `/var/lib/tailzero`。

`peers` 和 `services` 的额外标志：

* `--active` 对于 `peers`，只显示在线的对等端。对于 `services`，只显示处于 `ACTIVE` 状态的服务。

`health` 的额外标志：

* `--quiet` 抑制输出，仅依赖退出码。

`services` 子命令会把每个服务的状态报告为以下之一：

* `ACTIVE` 该服务的 Tailscale 虚拟 IP 已分配，连接器正在提供该服务。
* `PENDING` 服务已宣告，但控制平台尚未为其分配虚拟 IP。这既包括仍在 Tailscale 管理控制台中等待审批的服务，也包括已获批准但虚拟 IP 分配尚未传播到连接器的服务。
* `HTTP-TUNNEL-OFFLINE` 一个 HTTP 服务，其到 Border0 代理的隧道当前未建立。
* `UNKNOWN` 该服务的实时状态查询失败。

[bl-border0-joins-tailscale]: https://tailscale.com/blog/border0-joins-tailscale

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam]: /docs/privileged-access-management

[docs-workload-identity]: /docs/features/workload-identity-federation
