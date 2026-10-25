---
title: "从 code-server 访问你的 tailnet"
description: "在 code-server 上安装 Tailscale，实现远程写代码。"
---

最后验证于 Sep 18, 2025

[code-server][xt-gh-code-server] 是一种在任何地方运行 Visual Studio Code 并通过浏览器访问它的方式。

Tailscale 可以安装在 code-server 虚拟机（VM）内，从而安全地访问私有资源，例如开发/测试环境中的数据库、持续集成节点或服务器。

## 集成

code-server 安装在虚拟机中，多种托管提供商都提供了[安装说明][xt-gh-code-server-install]。

Tailscale 可以[安装在虚拟机中][docs-install-linux]，支持许多常见托管提供商，如 [AWS][docs-install-aws]、[Azure][docs-cloud-azure-linux]、[Google Cloud][docs-cloud-gce] 与 [Hetzner][docs-cloud-hetzner]。

## 授权

虚拟机需要获得授权才能加入 tailnet，可以使用浏览器登录，也可以使用[一次性认证密钥（auth key）][docs-auth-keys]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cloud-azure-linux]: /docs/install/cloud/azure/linux

[docs-cloud-gce]: /docs/install/cloud/gce

[docs-cloud-hetzner]: /docs/install/cloud/hetzner

[docs-install-aws]: /docs/install/cloud/aws

[docs-install-linux]: /docs/install/linux

[xt-gh-code-server-install]: https://github.com/cdr/code-server/blob/main/docs/install.md

[xt-gh-code-server]: https://github.com/cdr/code-server
