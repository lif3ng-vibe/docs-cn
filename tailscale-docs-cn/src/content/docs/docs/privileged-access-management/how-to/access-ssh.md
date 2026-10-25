---
title: "使用 Tailscale PAM 访问 SSH 服务器（或 shell）"
description: "[Tailscale PAM][docs-pam] 让用户使用自己的 [Tailscale 身份][docs-tailscale-identity]安全地访问 SSH 服务器，无需分发 SSH 密钥或共享静态密码。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用自己的 [Tailscale 身份][docs-tailscale-identity]安全地访问 SSH 服务器，无需分发 SSH 密钥或共享静态密码。

用户可以使用已有的 SSH 工具连接，也可以直接在浏览器中连接。Tailscale PAM 让你集中控制谁能访问每个 SSH 服务、可以使用哪些用户名和 SSH 能力，并获得 SSH 会话活动的记录。

## SSH 访问的工作原理

SSH 访问由 Tailscale PAM [连接器][docs-pam-connectors]提供。

连接器运行在你的环境中，可以通过两种方式提供 SSH 访问：

* 使用连接器自身内置的 SSH 服务器。
* 将连接代理到连接器可达的其他 SSH 服务器。

对于远程 SSH 服务器，连接器会代表用户处理与上游服务器的连接。用户使用自己的 Tailscale 身份进行身份验证，而连接器负责处理上游 SSH 身份验证。

这意味着你不需要向上游 SSH 密码或私钥分发给每一位需要访问的用户。用户只需使用自己的 Tailscale 身份。

## 访问 SSH 服务器的几种方式

Tailscale PAM 支持多种提供 SSH 访问的方式。

### 内置 SSH 服务器

每个 Tailscale PAM 连接器都内置一个 SSH 服务器。

这是最快的上手方式。连接器主机上无需安装或配置单独的 SSH 服务，用户即可使用自己的 Tailscale 身份连接到该主机。

内置 SSH 服务器只监听连接器的 Tailscale 网络接口。它不会向公共互联网暴露新的 SSH 监听器，也不会干扰已经在端口 `22` 上监听的其他 SSH 服务器。

更多信息，参见[访问内置 SSH 服务器][docs-pam-ssh-built-in]。

### 远程 SSH 服务器

将连接器用作它能访问的另一台服务器的 SSH 代理。

Tailscale PAM 可以让连接器使用多种身份验证方式向上游 SSH 服务器进行身份验证，包括：

* 用户名和密码。
* SSH 私钥。
* SSH 证书。

用户仍然使用自己的 Tailscale 身份向 Tailscale PAM 进行身份验证，无需接触上游凭证。

更多信息，参见[访问远程 SSH 服务器][docs-pam-ssh-remote]。

### Amazon EC2 Instance Connect

Tailscale PAM 可以使用 Amazon EC2 Instance Connect 访问 EC2 实例，而无需为上游实例维护长期有效的 SSH 密钥。

连接器使用自己的 AWS 身份请求一个临时 SSH 密钥，然后将获授权的 SSH 会话代理到该 EC2 实例。

更多信息，参见[使用 AWS EC2 Instance Connect 访问 EC2 实例][docs-pam-ssh-ec2-instance]。

### 使用 AWS Systems Manager Session Manager 的 EC2 实例

你可以将 Tailscale PAM 与 AWS Systems Manager Session Manager 结合使用，为受支持的 AWS 工作负载提供 SSH 访问。

这使连接器能够通过 AWS SSM 建立上游会话，而不要求实例上有可直接访问的 SSH 监听器。

更多信息，参见[使用 AWS Systems Manager Session Manager 访问 EC2 实例][docs-pam-ssh-ec2-ssm]。

### 使用 AWS Systems Manager Session Manager 的 ECS 容器

你可以将 Tailscale PAM 与 AWS Systems Manager Session Manager 结合使用，为运行在 Amazon Elastic Container Service（ECS）中的容器提供 SSH 访问。

用户无需管理 SSH 密钥、静态密码或 AWS 凭证即可连接到 ECS 容器。Tailscale PAM 使用用户的 Tailscale 身份为连接授权，而连接器使用 AWS Systems Manager 建立上游会话。

更多信息，参见[使用 AWS Systems Manager 访问 ECS 容器][docs-pam-ssh-ecs-ssm]。

## 控制 SSH 访问

Tailscale PAM 策略控制谁能连接到 SSH 服务，以及连接后能做什么。

SSH 权限可以控制交互式 shell 访问、SSH exec 请求、SFTP、所请求的用户名以及 TCP 转发。你还可以使用正则表达式把 exec 访问限制到特定命令。

例如，你可以让一个用户组拥有完整的交互式 SSH 访问权限，同时让另一个用户组只能运行一小批运维命令。

SSH 授权示例和细粒度 SSH 权限的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 查看 SSH 会话

Tailscale PAM 为你提供对 SSH 访问的集中可见性。

要查看 SSH 访问活动，请打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 SSH 服务的一个会话。你可以查看如下信息：

启用会话录制后，你还可以查看录制下来的会话。

这让你能直接回答两个很有用的问题：谁访问了服务器，以及连接期间做了什么。

更多信息，参见[Tailscale PAM 会话日志][docs-pam-session-logs]。

[docs-pam-ssh-built-in]: /docs/privileged-access-management/how-to/access-ssh/built-in-ssh

[docs-pam-ssh-ec2-instance]: /docs/privileged-access-management/how-to/access-ssh/ec2-instance

[docs-pam-ssh-ec2-ssm]: /docs/privileged-access-management/how-to/access-ssh/ec2-ssm

[docs-pam-ssh-ecs-ssm]: /docs/privileged-access-management/how-to/access-ssh/ecs-ssm

[docs-pam-ssh-remote]: /docs/privileged-access-management/how-to/access-ssh/remote-ssh

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management
