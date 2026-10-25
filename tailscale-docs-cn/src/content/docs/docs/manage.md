---
title: "管理访问"
description: "管理对 Tailscale 资源的访问。"
---

最后验证于 May 7, 2025

使用 Tailscale 的访问控制功能来管控用户访问 Tailscale 网络（即 tailnet）中资源的方式，同时也可以管控设备之间的相互访问。

## 管理访问策略

访问控制列表（ACL）与授权（grant）让你能够为 tailnet 中的用户和设备精确定义权限。Tailscale 通过 [tailnet 策略文件][docs-terminology-and-concepts-tailnet-policy-file]管理网络的访问规则。

[**使用 ACL 管理权限**](/docs/features/access-control/acls)——在 Tailscale 中配置访问控制列表（ACL），管理设备权限并保护你的网络安全。

[**授权（grants）**](/docs/features/access-control/grants)——同时为网络连接和应用权限授予访问控制权限。

[**tailnet 策略文件语法参考**](/docs/reference/syntax/policy-file)——tailnet 策略文件的语法参考。

[**即时访问（JIT）**](/docs/features/access-control/just-in-time-access)——为 Tailscale 网络的用户提供即时访问（也称按需访问）。

## 管理设备

你可以控制哪些设备加入 tailnet，包括是否需要 tailnet 管理员在新设备获得访问权限之前予以批准。你还可以将设备态势（device posture）与移动设备管理（MDM）方案结合使用，以强制执行设备规则。

[**管理设备**](/docs/features/access-control/device-management)——在管理控制台中审核和批准设备、重命名机器以及筛选设备。

## 管理用户与用户角色

你可以控制哪些用户加入 tailnet、如何邀请他们，以及他们对 tailnet 资源的访问权限。

[**管理用户**](/docs/manage-users)——邀请用户、分配或更改用户角色、移除用户，并在多个账户之间快速切换。

## 管理域名所有权

创建 tailnet 时，你的用户域名会成为你的 [Tailscale 身份][docs-tailscale-identity]的一部分。

[**域名所有权**](/docs/concepts/domain-ownership)——了解你的 tailnet 如何与你的域名绑定。

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-terminology-and-concepts-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file
