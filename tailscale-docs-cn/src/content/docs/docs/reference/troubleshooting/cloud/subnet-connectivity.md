---
title: "排查云中的子网连接性"
description: "据我们观察，在 Amazon Web Services、Microsoft Azure 和 Google Cloud Platform 中，最常见的问题是安全组（security group）限制过严，从而阻断了连接。"
---

最后验证于 Mar 20, 2026

据我们观察，在 Amazon Web Services、Microsoft Azure 和 Google Cloud Platform 中，最常见的问题是安全组（security group）限制过严，从而阻断了连接。为排查问题，可以尝试将内部安全组设置为允许子网上的所有流量，并将子网路由器本身所在的安全组也设置为允许所有流量，看看这样能否恢复连接。
