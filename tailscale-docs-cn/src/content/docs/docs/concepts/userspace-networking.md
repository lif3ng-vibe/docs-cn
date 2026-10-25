---
title: "用户态网络模式（容器场景）"
description: "了解用户态网络模式及其适用场景。"
---

最后验证于 Nov 12, 2025

用户态网络模式让你在没有权限创建 VPN 隧道设备的环境中运行 Tailscale。这种情况常见于容器环境。

在 Linux 系统上，Tailscale 依靠一个名为 `/dev/net/tun` 的设备驱动工作，它让你能像启动以太网或 Wi-Fi 等普通网络接口一样启动 VPN 隧道。这样，任何 Linux 应用——从网页浏览器到 `ping` 命令行工具——都可以让自己的流量经过 Tailscale 接口。

不过，并非所有 Linux 系统都支持 `/dev/net/tun`。例如，[Heroku][docs-serverless-heroku] 和 [Google Cloud Run][docs-serverless-cloudrun] 等基于容器的应用平台就不支持。对于这类环境，用户态网络模式提供了另一种运行方式：`tailscaled` 充当 SOCKS5 或 HTTP 代理，容器内的其他进程可以通过它连接。

*（图：Tailscale 用户态网络示意图。）*

> **注意：**
>
> 带 SOCKS5 的用户态网络模式在 Tailscale v1.8 及以上版本可用。HTTP 代理在 Tailscale v1.16 及以上版本可用。请[更新 Tailscale][docs-update] 以使用这些功能。

## SOCKS5 与 HTTP 的区别

SOCKS5 代理与 HTTP 代理的功能和用途有所不同。SOCKS5 代理更通用、更灵活，可以处理任意流量。HTTP 代理只服务于该协议本身，因此仅代理 HTTP 和 HTTPS 流量，例如访问网页。

## 以用户态网络模式启动 Tailscale

你可以通过 [Tailscale CLI][docs-cli] 启用用户态网络：在运行 `tailscale up` 之前，给 `tailscaled` 传入 `--tun=userspace-networking` 标志。还可以让 SOCKS5 代理和 HTTP 代理共用同一端口（如下面的代码块所示），

```shell
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --outbound-http-proxy-listen=localhost:1055 &
tailscale up --auth-key=<your-auth-key>
```

用户态网络模式主要面向[无服务器（serverless）环境][docs-serverless]。我们建议将其与[临时节点和认证密钥][docs-ephemeral-nodes]配合使用（如上所示）。

> **注意：**
>
> 在 Ubuntu、RHEL 或其衍生发行版上，可以通过在 `/etc/default/tailscaled` 的 `FLAGS` 变量中添加 `--tun=userspace-networking` 标志来启用用户态网络模式：
>
> ```
> FLAGS="--tun=userspace-networking"
> ```

> **注意：**
>
> Tailscale Docker 镜像支持 [`TS_USERSPACE`][docs-docker-ts-userspace] 参数，等同于 `tailscaled --tun=userspace-networking`。

## 配置应用使用 SOCKS5 或 HTTP

Tailscale 完成身份验证后，你的应用就可以通过 SOCKS5 代理、HTTP 代理或两者兼用来连接。许多常用的网络库已经支持这些代理，通常通过设置 `ALL_PROXY` 和 `HTTP_PROXY` 环境变量即可。对很多应用来说，你需要类似这样的命令：

```shell
ALL_PROXY=socks5://localhost:1055/ HTTP_PROXY=http://localhost:1055/ http_proxy=http://localhost:1055/ ./my-app
```

有些库使用的是小写的 `http_proxy` 而不是 `HTTP_PROXY`。你可能需要试一试才能找到适合自己应用的设置。关于在特定无服务器平台上使用 Tailscale 的说明，请参阅以下主题：

* [在 Heroku 上使用 Tailscale][docs-serverless-heroku]
* [在 Google Cloud Run 上使用 Tailscale][docs-serverless-cloudrun]
* [在 GitHub Actions 上使用 Tailscale][bl-gh-actions-and-tailscale]

[bl-gh-actions-and-tailscale]: https://tailscale.com/blog/2021-05-github-actions-and-tailscale

[docs-cli]: /docs/reference/tailscale-cli

[docs-docker-ts-userspace]: /docs/features/containers/docker/docker-params#ts_userspace

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-serverless-cloudrun]: /docs/install/cloud/cloudrun

[docs-serverless-heroku]: /docs/install/cloud/heroku

[docs-serverless]: /docs/integration-serverless-apps

[docs-update]: /docs/features/client/update
