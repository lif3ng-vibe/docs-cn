---
title: "排查 Oracle 云设备"
description: "如果你发现你的 Tailscale 网络（即 tailnet）节点无法访问你的 [Oracle Cloud Linux VM][docs-oracle-cloud]，可能需要更新该 VM 的 `iptables` 配置。"
---

最后验证于 Mar 20, 2026

如果你发现你的 Tailscale 网络（即 tailnet）节点无法访问你的 [Oracle Cloud Linux VM][docs-oracle-cloud]，可能需要更新该 VM 的 `iptables` 配置。

在修改 `iptables` 之前，请备份当前配置：

```shell
sudo iptables-save > ~/iptables.old
```

运行以下命令查看当前的 `iptables` 配置：

```shell
sudo iptables --list --line-numbers
```

如果你想允许从 tailnet 对该 VM 的 HTTP 访问，请运行：

```shell
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

或者，如果发现某条具体规则在拒绝你的入站访问，可以按行号将其删除：

```shell
sudo iptables -D INPUT <line-number>
```

再次查看 `iptables` 列表，确认更改已生效。

```shell
sudo iptables --list --line-numbers
```

然后，再次尝试从你的 tailnet 节点访问 Oracle Cloud Linux VM。

[docs-oracle-cloud]: /docs/install/cloud/oracle-cloud
