---
title: "从任何位置访问 PiKVM"
description: "在 PiKVM 上设置 Tailscale。"
---

最后验证于 Jan 5, 2026

PiKVM 是一种基于 Raspberry Pi 的 IP KVM（键盘、视频和鼠标）解决方案。它让你可以远程连接到一台计算机并使用它，就像坐在它面前一样。本指南向你展示如何在 PiKVM 上设置 Tailscale。

要进一步了解 PiKVM，请访问 [`pikvm.org`][xt-pikvm]。

> **注意：**
>
> 下方相关视频提供了更多背景信息和示例。

[使用 PiKVM 和 Tailscale 远程访问任意系统（视频）](https://www.youtube.com/watch?v=Btqw56DFhro)

## 前提条件

* 一台 PiKVM 设备，或一台安装了 PiKVM 的 Raspberry Pi。
  * PiKVM 项目[推荐][xt-pikvm-faq]使用 Pi 4。对于此用例，Pi 5 几乎没有性能提升。
* [一个 Tailscale 账户](https://login.tailscale.com/start)——免费的 [Personal 套餐][co-pricing]已包含入门所需的全部功能。

## 安装 Tailscale

1. 通过 Web 界面访问你的 PiKVM，并打开 Web 终端。

   *（图：PiKVM Web 界面，突出显示"Terminal"选项。）*

2. 提权到 root。

   ```shell
   # 默认密码为 'root'
   su -
   ```

3. 启用读写模式。

   ```shell
   rw
   ```

> **注意：**
>
> 如果在此过程中重启了 PiKVM，你需要重新启用读写模式。

4. 安装 `tailscale-pikvm` 软件包。

   ```shell
   pacman -Sy tailscale-pikvm
   ```

> **注意：**
>
> 我们推荐使用 `tailscale-pikvm` 软件包，原因参见[此 issue][xt-issue2934]。

5. 启用并启动 Tailscale 服务。

   ```shell
   systemctl enable --now tailscaled
   ```

6. 登录 Tailscale。

   有关可用登录选项的更多信息，请参阅我们的[命令参考][docs-cli-up]。

   ```shell
   tailscale up
   ```

7. （可选）启用 [Tailscale SSH][docs-ssh]。

   ```shell
   tailscale set --ssh
   ```

8. 恢复只读模式。

   ```shell
   ro
   ```

> **注意：**
>
> 你可能希望为你的子网节点禁用密钥过期，以避免定期重新认证。有关机器密钥以及如何禁用其过期的更多信息，请参阅[密钥过期][docs-key-expiry]。如果你使用[标签][docs-tags]，[密钥过期默认是禁用的][docs-tags-key-expiry]。

## 访问你的 PiKVM 设备

在 PiKVM 设备上安装 Tailscale 后，你可以随时随地通过 Tailscale 网络访问它。

打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面，找到你的 PiKVM 设备。

你可以访问 `https://<your-pikvm>.<your-tailnet>.ts.net` 来打开 Web 界面。例如，如果你的 PiKVM 设备名为 `pikvm`，而你的 Tailscale 网络名为 `pango-lin`，那么你应访问 `https://pikvm.pango-lin.ts.net`。

### 使用 Tailscale Serve 访问你的 PiKVM 设备

你可以设置 Tailscale Serve 来代理 PiKVM 的 Web 界面。这会为你的 PiKVM 设备提供有效的 TLS 证书，避免浏览器显示安全警告。

要设置 Tailscale Serve，请按照以下说明操作。你也可以在我们的 [Tailscale Funnel 与 Serve 使用][docs-funnel-examples]主题中找到更多信息。

> **注意：**
>
> Tailscale Serve 服务器只能在你的 tailnet 内访问，无法从公共互联网访问。使用 [Tailscale Funnel][docs-funnel] 会将你的 PiKVM 设备暴露给公共互联网，不建议这样做。

```shell
tailscale serve --bg https+insecure://localhost:443
```

运行上述命令后，你可以像之前一样访问 `https://<your-pikvm>.<your-tailnet>.ts.net` 来访问你的 PiKVM 设备。区别在于连接是通过你的 Tailscale Serve 服务器代理的，这会为你的 PiKVM 设备提供有效的 TLS 证书。

> **注意：**
>
> 对 PiKVM 设备的首次请求可能需要几秒钟才能完成。这是因为 Tailscale Serve 需要为你的 PiKVM 设备获取有效的 TLS 证书。后续请求会快得多。

### 将你的 PiKVM 节点用作出口节点或子网路由器

现在 PiKVM 已加入你的 tailnet，你可以将其配置为执行其他有用的功能，例如充当[出口节点][docs-exit-node]或[子网路由器][docs-subnet-router]。

[co-pricing]: https://tailscale.com/pricing

[docs-tags-key-expiry]: /docs/features/tags#密钥过期

[docs-tags]: /docs/features/tags

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-funnel]: /docs/features/tailscale-funnel

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-exit-node]: /docs/features/exit-nodes

[docs-ssh]: /docs/features/tailscale-ssh

[docs-subnet-router]: /docs/features/subnet-routers

[xt-issue2934]: https://github.com/tailscale/tailscale/issues/2934

[xt-pikvm]: https://pikvm.org

[xt-pikvm-faq]: https://docs.pikvm.org/faq/
