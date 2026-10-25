---
title: "Tailscale Funnel 示例"
description: "借助 [Tailscale Funnel][docs-funnel]，你可以将本地服务、文件夹或文本通过 HTTPS 暴露到公共互联网。我们从 Tailscale 用户那里收集了这些示例，希望能启发你以新的方式使用它"
---

最后验证于 Oct 14, 2025

> **警告：**
>
> 在尝试本主题中的示例之前，请先查阅 [Funnel 文档][docs-funnel]，确保满足相关要求。

借助 [Tailscale Funnel][docs-funnel]，你可以将本地服务、文件夹或文本通过 HTTPS 暴露到公共互联网。我们从 Tailscale 用户那里收集了这些示例，希望能启发你以新的方式使用它。

几乎任何监听在本地设备上的 HTTP 或 TCP 服务都可以通过 Funnel 共享出去。例如，你可以向客户共享一个 Web 应用演示，无需等待云服务随每次变更而收敛就能测试 webhook 接收器的改动，或者将网站的开发副本暴露出来以测试 [OpenGraph 元数据变更][xt-open-graph]。

以下各节将更详细地介绍常见用例。

## 共享文件服务器

下面的示例使用 [`tailscale funnel`][docs-tailscale-funnel] 命令创建一个文件服务器。用 Funnel 作文件服务器通常比通过第三方服务传输更高效，也比使用 Python 的 `http.server` 之类的工具更方便。

首先，创建一些要提供的文件。本示例从头创建文件，你也可以直接使用现有文件。

```shell
mkdir /tmp/public
echo "Hello World" > /tmp/public/hello.txt
echo "Pangolin" > /tmp/public/animal.txt
```

使用 Funnel 通过互联网提供这些文件：

```shell
sudo tailscale funnel /tmp/public
```

在 Windows 上，不用 `sudo`，而是以管理员身份打开命令提示符，然后运行：

```shell
c:\Users\Amelie> tailscale funnel c:\tmp\public
```

状态输出会确认前一条命令，并提供 Funnel 为该设备配置的主机名。

```shell
sudo tailscale funnel /tmp/public
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / path /tmp/public

Press Ctrl+C to exit.
```

你可以用 `curl` 确认 URL 可用，也应该能通过浏览器访问 Funnel URL 来查看创建的两个文件。请求 `/public` 文件夹会返回目录列表。

```shell
curl -L https://amelie-workstation.pango-lin.ts.net
<pre>
<a href="animal.txt">animal.txt</a>
<a href="hello.txt">hello.txt</a>
</pre>

curl -L https://amelie-workstation.pango-lin.ts.net/animal.txt
Pangolin
```

## 托管静态站点

本示例展示如何将一个静态 HTML 网站发布到互联网。

首先，创建一些文件作为静态站点组成部分的示例（例如一个 index 文件和一些资源）。你也可以使用众多[静态站点生成器][xt-gh-awesome-static-generators]之一。

`/tmp/static-site/index.html`

```html
<html>
  <head>
    <title>Hello World</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

`/tmp/static-site/styles.css`

```css
*,
html {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 10vw;
  text-transform: uppercase;
}

body {
  position: absolute;
  left: 50%;
  top: 25%;
  transform: translate3d(-50%, -50%, 0);
  overflow: hidden;
}

h1 {
  position: relative;
  top: 2em;
  animation: slide-up 3s infinite;
}

@keyframes slide-up {
  0% {
    top: 2em;
  }
  50% {
    top: 0em;
  }
  100% {
    top: 2em;
  }
}
```

文件准备好后，将该静态站点发布到互联网：

```shell
sudo tailscale funnel /tmp/static-site
```

状态输出会确认前一条命令，并提供 Funnel 为该设备配置的主机名。

```shell
sudo tailscale funnel /tmp/static-site
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / path /tmp/static-site

Press Ctrl+C to exit.
```

现在可以在浏览器中打开该 URL，确认一切正常。

*（图：浏览器中查看的经 Tailscale 发布的网页。）*

## 将开发服务器公开到互联网

一条通过 Funnel 可访问的路由，意味着其他互联网用户可以与你设备上的本地服务器交互。例如，如果你正在写一篇博文并想分享草稿供人审阅，可以用 Funnel 将开发站点公开。

如果本地 HTTP 服务器运行在端口 `3000` 上，你可以用 Funnel 通过 HTTPS 将该本地服务器暴露到互联网：

```shell
sudo tailscale funnel 3000
```

状态输出会确认前一条命令，并提供 Funnel 为该设备配置的主机名。

```shell
sudo tailscale funnel 3000
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

在浏览器中打开该 URL，确认一切工作正常。

只要你的开发机开机并连接到 Tailscale，数据就会经由 Funnel 在你的开发服务器之间往来传输。请记住，Funnel 使用中继服务器在设备之间传递加密数据，并不允许互联网上的设备直接连接到你的机器。

## 共享 Funnel 设备

Funnel 拥有可预测且稳定的 DNS 名称，例如 `amelie-workstation.pango-lin.ts.net`。这样一来，你只需设置或共享一次 DNS 名称，之后只要开启 Funnel，它随时都可访问。

> **提示：**
>
> 开启 Tailscale SSH 可以让 Funnel 更容易连接。

你还可以将 Funnel DNS 名称共享给多位协作者或同事。这在为 GitHub 之类的后端配置开发 webhook URL 并希望保持该 URL 稳定时非常有用——无论当前是哪位开发者在测试 webhook API。

你可以用自定义名称共享 Funnel 设备。例如，暴露 GitHub webhook 的 Funnel 可以命名为 `github-hooks-dev.pango-lin.ts.net`。

以下命令会开启端口 `8080` 的 Funnel：

```shell
sudo tailscale funnel 8080
```

这样 Funnel 会将任意路径的 HTTPS 流量转发到 `http://localhost:8080`。

启动你的开发服务器，以便从你要与之共享 Funnel 的其他机器测试 webhook。下面的示例使用端口 `3000` 作为本地开发服务器的端口。建立一条 SSH 反向代理，把本地开发服务器连接到共享的 Funnel 设备。Funnel 设备应在其端口 `8080`（Funnel 的目标端口）上完成配置。例如：

```shell
ssh -NT -R 8080:127.0.0.1:3000 github-hook-dev.pango-lin.ts.net
```

你可以测试 webhook，或直接访问 URL `https://github-hook-dev.pango-lin.ts.net`。你可以观察到请求从互联网经共享的 Funnel 设备抵达你的本地开发服务器！

如果共享的 Funnel 已被占用，Tailscale 会在建立 SSH 反向代理时返回一条错误消息。

```shell
Warning: remote port forwarding failed for listen port 8080
```

## 测试 webhook 接收器的变更

Funnel 中的路由意味着网络上的其他服务可以访问它。它们可以提交数据，例如来自 GitHub 或 Stripe 等厂商的 webhook。使用 Funnel 能让你比使用云端部署更快地测试自己的工作。

你可以用 Funnel 暴露开发设备上的 webhook 接收器，然后将该 URL 提供给你要集成的服务。

如果本地 HTTP 服务器运行在端口 `3000` 上，将 Funnel 设置为指向该服务器的反向代理：

```shell
sudo tailscale funnel 3000
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

像往常一样配置另一方的服务，使用你的 URL 和 webhook 路径。你可以像触发任何其他 webhook 接收器一样向你的服务发送消息。只要开发设备开机并连接到 Tailscale，webhook 就会经由 Funnel 路由到你的服务器。

[docs-funnel]: /docs/features/tailscale-funnel

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[xt-gh-awesome-static-generators]: https://github.com/myles/awesome-static-generators

[xt-open-graph]: https://ogp.me
