---
title: "从 OpenVSCode 访问你的 tailnet"
description: "通过在 OpenVSCode 上安装 Tailscale 来远程编写代码。"
---

最后验证于 Sep 18, 2025

[OpenVSCode][xt-gitpod-openvscode] 是一种在现代 Web 浏览器中访问远程机器上运行的 Visual Studio Code 的方式。

可以在 OpenVSCode 虚拟机（VM）内安装 Tailscale，从而安全地访问私有资源，例如开发/测试环境中的数据库、持续集成节点或服务器。

## 集成

OpenVSCode 安装在一台虚拟机内，[多家托管提供商都有相应的安装说明][xt-gh-open-vs-code]。

Tailscale 可以[安装在虚拟机中][docs-install-linux]，支持许多常见的托管提供商，例如 [AWS][docs-install-aws]、[Azure][docs-cloud-azure-linux]、[Google Cloud][docs-cloud-gce] 和 [Hetzner][docs-cloud-hetzner]。

## 授权

需要授权该虚拟机加入 tailnet，方式可以是使用浏览器登录，或使用[一次性认证密钥（auth key）][docs-auth-keys]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cloud-azure-linux]: /docs/install/cloud/azure/linux

[docs-cloud-gce]: /docs/install/cloud/gce

[docs-cloud-hetzner]: /docs/install/cloud/hetzner

[docs-install-aws]: /docs/install/cloud/aws

[docs-install-linux]: /docs/install/linux

[xt-gh-open-vs-code]: https://github.com/gitpod-io/openvscode-server/tree/docs/guides

[xt-gitpod-openvscode]: https://www.gitpod.io/blog/openvscode-server-launch
