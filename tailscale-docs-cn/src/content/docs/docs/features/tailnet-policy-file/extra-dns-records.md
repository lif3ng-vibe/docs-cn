---
title: "为你的 tailnet 添加自定义额外 DNS 记录"
description: "Tailscale 为你的 Tailscale 网络（即 tailnet）中的节点提供 DNS，以支持 MagicDNS 节点名称和自定义 DNS 配置。借助 Tailscale 的 DNS 基础设施，你可以配置能在你的节点上解析的额外 DNS 记录。"
---

最后验证于 Dec 10, 2025

Tailscale 为你的 Tailscale 网络（即 tailnet）中的节点提供 DNS，以支持 MagicDNS 节点名称和自定义 DNS 配置。借助 Tailscale 的 DNS 基础设施，你可以配置能在你的节点上解析的额外 DNS 记录。

> **注意：** 自定义额外 DNS 记录目前处于 alpha 阶段。

1. [联系 Tailscale 支持团队][co-contact-support-billing]，为你的 tailnet 启用 `extraDNSRecords` 设置。
2. 前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。在 **Nameservers**（名称服务器）区域中，找到 **Global nameservers**（全局名称服务器）并启用 **Override DNS servers**（覆盖 DNS 服务器）。
3. 确认以上步骤后，前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，编辑你的策略文件，加入一个 `extraDNSRecords` 字段：

   ```json
   {
     "grants": ["..."],
     "extraDNSRecords": [
       {"Name": "custom.record", "Value": "100.100.100.100"},
     ],
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

这会将域名 `custom.record` 添加到你 tailnet 中的每个节点，并解析为一条指向 `100.100.100.100` 的 `A` 记录。

[co-contact-support-billing]: https://tailscale.com/contact/support/?type=billing
