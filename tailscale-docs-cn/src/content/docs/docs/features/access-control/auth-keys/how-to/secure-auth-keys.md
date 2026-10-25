---
title: "安全地保管认证密钥"
description: "[`tailscale login`][docs-cli-login] 和 [`tailscale up`][docs-tailscale-up] 等 Tailscale CLI 命令支持传入[预认证密钥][docs-auth-keys]（auth key），让你无需通过网页浏览器登录即可连接新"
---

最后验证于 Jul 23, 2025

[`tailscale login`][docs-cli-login] 和 [`tailscale up`][docs-tailscale-up] 等 Tailscale CLI 命令支持传入[预认证密钥][docs-auth-keys]（auth key），让你无需通过网页浏览器登录即可连接新设备。这些命令使用 `--auth-key` 标志来指定认证密钥。如果你把认证密钥直接传给这些命令，密钥可能会留在 shell 历史文件中。任何能访问该历史文件的进程都可能复用这个密钥，把未授权的设备加入你的 Tailscale 网络。缓解这一安全风险的一个办法是使用[一次性认证密钥][docs-auth-key-one-off]，而不是[可重复使用的认证密钥][docs-auth-key-reusable]。

如果必须使用可重复使用的认证密钥，可以通过环境变量把密钥传给命令。例如，定义一个名为 `TS_AUTH_KEY` 的环境变量并将其设为认证密钥的值，就可以在不暴露密钥的情况下完成 CLI 调用：

```shell
tailscale login --auth-key=$TS_AUTH_KEY
```

环境变量名不必是 `TS_AUTH_KEY`，只是本主题的示例使用了这个名称。

> **注意：**
>
> 环境变量本身的处理方式因平台和操作系统版本而异。以下示例基于 Bash 的较新版本，Bash 在许多 Linux 和 macOS 系统上都可用。如果你使用的不是 Bash，请查阅所用平台的文档了解环境变量的用法。

## 创建环境变量

使用 `export` 命令创建环境变量。

下面的示例展示了如何在不把认证密钥值作为参数传入的情况下设置环境变量，这样密钥就不会留在历史记录中。在[生成认证密钥][docs-auth-keys-generate]时，你可以把密钥值复制到剪贴板。拿到剪贴板中的密钥值后，可以通过标准输入把它赋给环境变量：先把环境变量设为 `$(cat)`，然后按 `Ctrl+v`（macOS 上按 `Cmd+v`），最后按 `Ctrl+d`：

```shell
# 使用标准输入，避免认证密钥出现在历史记录中
export TS_AUTH_KEY=$(cat)
<Ctrl+v><Ctrl+d>
```

如果无法使用 `$(cat)` 技巧，也可以直接把认证密钥值赋给环境变量：

```shell
 export TS_AUTH_KEY=<your-auth-key>
```

如果你的 [`HISTCONTROL`][xt-gnu-bash-variables] 值包含 `ignorespace` 或 `ignoreboth`，可以在 `export` 命令前插入一个空格，防止该命令出现在 `history` 文件中：

```shell
# 在命令前加一个空格，避免命令出现在 history 输出中。
 export TS_AUTH_KEY=<your-auth-key>
```

> **警告：**
>
> 在依赖这种技巧导出认证密钥之前，请先在你的设备上测试 `HISTCONTROL` 搭配 `ignorespace` 或 `ignoreboth` 的效果。具体来说，要确认前面带空格的命令确实不会出现在你的 `history` 文件中。

如果你的平台或操作系统版本不支持把命令从历史文件中省略，或者你不小心把认证密钥传给了某条命令，可以手动从历史记录中删除该命令。可行的方式包括编辑 `~/.bash_history` 或 `~/.zsh_history`，删掉包含认证密钥的那一行。某些情况下，你还可以运行 `history` 找到显示认证密钥的行号，然后执行 `history -d <line-number>`。请查阅所用平台的文档了解删除 `history` 文件中一行的方法。

## 使用环境变量

把环境变量传给命令。例如：

```shell
tailscale login --auth-key=$TS_AUTH_KEY
```

## 移除环境变量

如果不想让环境变量继续保存你的认证密钥，可以运行以下命令：

```shell
unset TS_AUTH_KEY
```

如果不再需要保留认证密钥本身，可以[吊销该认证密钥][docs-auth-key-revoke]。

[docs-auth-key-one-off]: /docs/features/access-control/auth-keys#authkey-one-off

[docs-auth-key-reusable]: /docs/features/access-control/auth-keys#authkey-reusable

[docs-auth-key-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-auth-keys-generate]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-login]: /docs/reference/tailscale-cli#login

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-gnu-bash-variables]: https://www.gnu.org/software/bash/manual/html_node/Bash-Variables.html
