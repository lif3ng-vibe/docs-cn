---
title: "Tailscale PAM 服务"
description: "使用 Tailscale PAM 服务管理对 Tailscale 网络上服务的特权访问。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

服务（service）是 Tailscale 网络（即 tailnet）中通过 Tailscale PAM 平台提供的资源。借助服务，你可以管理对这些服务的特权访问。

Tailscale PAM 支持多种服务类型：

* HTTP/HTTPS
* SSH
* 数据库，例如：
  * Amazon RDS
  * Elasticsearch
  * Google Cloud SQL
  * Microsoft SQL Server
  * MongoDB
  * MySQL
  * PostgreSQL
* Kubernetes
* 远程桌面协议（RDP）
* 虚拟网络计算（VNC）
* 任意 TCP 端口

*（图：服务是 Tailscale PAM 中的核心构建块）*

## 前提条件

开始之前，请确认你已具备以下条件：

* 一个 [Tailscale PAM 连接器][docs-pam-connectors]。

## 创建服务

1. 打开 Tailscale 管理控制台的[服务](https://console.tailscale.com/admin/services)页面。
2. 选择**添加服务**。
3. 选择 **PAM 服务**。
4. 根据你的使用场景选择一种服务类型，然后选择**继续**。
5. 按照提示配置你的新服务。在配置过程中，你需要为该服务选择一个连接器。
6. 填写完新服务的详细信息后，选择**保存**。

## 更新服务

1. 打开[服务](https://console.tailscale.com/admin/services)页面。
2. 选择要更新的服务。
3. 选择**编辑服务**。
4. 进行所需的更改。
5. 选择**保存**。

## 删除服务

1. 打开[服务](https://console.tailscale.com/admin/services)页面。
2. 选择要删除的服务。
3. 选择**编辑服务**。
4. 选择**移除服务**。
5. 收到提示时，确认你要删除该服务。

[docs-pam-connectors]: /docs/privileged-access-management/connectors
