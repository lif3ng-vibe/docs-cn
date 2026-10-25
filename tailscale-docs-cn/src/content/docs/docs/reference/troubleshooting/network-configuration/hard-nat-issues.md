---
title: "排查 Hard NAT 问题"
description: "在三个条件同时成立的场景下，你可能遇到网络性能问题。这会影响经过连接器（出口节点、子网路由器和应用连接器）的延迟敏感流量。"
---

最后验证于 Mar 16, 2026

在三个条件同时成立的场景下，你可能遇到网络性能问题。这会影响经过连接器（出口节点、子网路由器和应用连接器）的延迟敏感流量。一个可能出现的表象是 DNS 解析超时。请进行网络测试来诊断你的配置与流量，确认以下情形是否适用。

1. [Hard NAT][docs-connection-types-hard-nat] 使得直连难以建立（甚至无法建立）。Tailscale 将回退到分布在世界各地的 DERP 中继服务器。

2. 如果有大量以每秒数据包数或每秒比特数计的流量经由这些 DERP TCP 连接中继，出现[队头阻塞（head-of-line blocking）][xt-wikipedia-head-of-line-blocking]的可能性会更高——极端情况下还会引发 [TCP meltdown][xt-wikipedia-tcp-meltdown]。

3. 在由具备流量聚合与转发能力的节点（如子网路由器和出口节点）组成的网络中，这种数据包阻塞发生的概率和影响都会更大。

首选且推荐的做法是让这些关键节点使用对等直连，而不是 DERP 中继连接。消除 Hard NAT 即可解决根本原因和相关因素：将其改为无 NAT（可直接访问）或 [easy NAT][docs-device-connectivity-easy-nat] 配置。

不过，如果无法消除连接器上的 Hard NAT，你可以尝试将共享流量导致的数据包阻塞这一因素降到最低。一种做法是把延迟敏感的服务隔离到独立的子网路由器后面；另一种做法是将延迟敏感的服务托管在专属节点上，不在其前面部署子网路由器。

[docs-connection-types-hard-nat]: /docs/reference/connection-types#硬-nat

[docs-device-connectivity-easy-nat]: /docs/reference/device-connectivity#简单-nat

[xt-wikipedia-head-of-line-blocking]: https://en.wikipedia.org/wiki/Head-of-line_blocking

[xt-wikipedia-tcp-meltdown]: https://en.wikipedia.org/wiki/Tunneling_protocol#TCP_meltdown_problem
