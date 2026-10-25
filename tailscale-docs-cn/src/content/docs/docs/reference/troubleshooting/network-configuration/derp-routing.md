---
title: "排查 DERP 流量路由问题"
description: "要获取用于排查[直连与中继连接][docs-connection-types]的深入信息，请使用 [Tailscale CLI][docs-cli] 运行 [`tailscale status`][docs-cli-status] 命令。如果你"
---

最后验证于 Mar 16, 2026

要获取用于排查[直连与中继连接][docs-connection-types]的深入信息，请使用 [Tailscale CLI][docs-cli] 运行 [`tailscale status`][docs-cli-status] 命令。如果你看到形如 `relay "code"` 的输出，说明你的流量正经过一个以 "code" 为位置代码的 [DERP 服务器][docs-derp-servers]路由。例如，下面 `tailscale status` 输出中的第二行表明流量正经过 "sea"（西雅图）中继服务器转发：

```shell
100.99.98.97 device1 linux active; direct 1.2.3.4:1234; tx 1000 rx 1000
100.99.98.96 device2 linux active; relay "sea", tx 1000 rx 1000
```

如果 `tailscale status` 输出中没有 `relay "code"` 这样的行，说明你的流量没有经过 DERP 路由。

另外，[`tailscale ping`][docs-cli-ping] 命令会表明一次成功的 ping 是经由直连路径还是使用了 DERP。`tailscale ping` 会不断尝试，直到通过中继发送完 10 个 ping 数据包（不使用 `--c` 标志时的默认值），或者找到直连路径为止。例如，如果前五个 ping 经过中继，而第六个 ping 走的是直连路径，`tailscale ping` 就会停止。下面这个 `tailscale ping device2` 示例表明：第一个 ping 通过 "sea" 中继到达设备，第二个 ping 走了直连路径，此时 `tailscale ping` 便停止了。

```shell
tailscale ping device2

pong from device2 (100.99.98.96) via DERP(sea) in 242ms
pong from device2 (100.99.98.96) via 1.2.3.4:1234 in 127ms
```

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli]: /docs/reference/tailscale-cli

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers
