---
title: "检查未加密数据包"
description: "有时，使用 Wireshark 之类的工具检查 WireGuard 隧道内的未加密数据包会很有用。这只能在隧道端点的设备之一上进行。"
---

最后验证于 Mar 26, 2026

有时，使用 Wireshark 之类的工具检查 WireGuard 隧道内的未加密数据包会很有用。这只能在隧道端点的设备之一上进行。传输途中被抓取的数据包是无法解密的。

在隧道端点的设备上，有以下几种方式可以实现：

1. `tailscale debug capture -o /path/to/capture.pcap`
2. 在 TUN 设备上运行 Wireshark（用户态模式下不可用）。

使用 `tailscale debug capture` 时，`-o /path/to/capture.pcap` 参数指定要写入数据包的文件名。如果省略该参数，Tailscale 会尝试在本地启动 Wireshark 进行实时抓包。这些 `pcap` 文件在抓取时带有包含 tailnet 元数据的文件头。要在 Wireshark 中查看它们，你必须安装一个 [Lua 解析器][xt-githubusercontent-tailscale-ts-dissector]。

要从 TUN 设备抓包，你需要启动 Wireshark 并让它从以下接口抓取：

1. Linux 和 Windows 系统上的 `tailscale0`。
2. macOS 上的 `utun#`，其中数字可能不同。Wireshark 会显示接口列表，其中某个 `utun` 接口应该会有流量。

Wireshark 3.65 及更高版本支持从 TUN 设备抓取 Wireshark 帧。

[xt-githubusercontent-tailscale-ts-dissector]: https://raw.githubusercontent.com/tailscale/tailscale/refs/heads/main/feature/capture/dissector/ts-dissector.lua
