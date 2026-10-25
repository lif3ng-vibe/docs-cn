---
title: "Tailscale Serve 示例"
description: "[Tailscale Serve][docs-serve] 让你把内容和本地服务器从你的 Tailscale 节点共享到你的 Tailscale 网络（即 tailnet）。本主题为使用最常用的 Serve 功能提供一些指导"
---

最后验证于 Jan 14, 2026

[Tailscale Serve][docs-serve] 让你把内容和本地服务器从你的 Tailscale 节点共享到你的 Tailscale 网络（即 tailnet）。本主题为使用最常用的 Serve 功能提供一些指导。我们听取了许多 Tailscale 用户使用 Serve 的方式，并收集了这些示例，希望能启发你以新颖有趣的方式使用它。

> **警告：**
>
> 由于 macOS 应用沙盒的限制，使用 Serve 提供文件和目录只在 Tailscale 的[开源变体][docs-macos-variants]上可用。如果你是通过 Mac App Store 安装的 Tailscale，或是以 Standalone 变体的系统扩展形式安装的，那么你可以用 Serve 共享端口，但不能共享文件或目录。
>
> 此外请记住，[访问控制规则][docs-access-control]对 Serve 同样生效，与其他服务无异。如果你的访问控制规则限制了某些设备或用户的访问，这些规则也会作用于你用 Serve 共享的服务。

在开始尝试本主题中的示例之前，建议你先阅读 Serve 的[设置][docs-serve-setup]说明。

## 共享一个基础文件服务器

在本示例中，我们将探索如何用 Serve 创建一个基础文件服务器，并与 tailnet 中的其他设备共享。用 [`tailscale serve`][docs-tailscale-serve] CLI 命令作文件服务器，通常比通过第三方服务传输高效得多，也比使用 Python 的 `http.server` 之类的工具更方便。

为了完成本指南，我们需要一些要提供的文件。我们将从头创建这些文件，你也可以随意改用本地设备上已有的、想要共享的文件。

```shell
mkdir /tmp/public
echo "Hello World" > /tmp/public/hello.txt
echo "Pangolin" > /tmp/public/animal.txt
```

现在，我们可以用 Serve 把这些文件提供给你的 tailnet：

```shell
sudo tailscale serve /tmp/public
Available within your tailnet
https://amelie-workstation.pango-lin.ts.net

|-- / path /tmp/public

Press Ctrl+C to exit.
```

在 Windows 上，不用 `sudo`，而是按 Windows+x 打开管理员控制台，然后从菜单中选择**终端**（管理员）。接着运行：

```shell
c:\Users\Amelie> tailscale serve c:\tmp\public
```

在本主题中，Windows 用户运行 `tailscale serve` 命令时不需要 `sudo`，但要在管理员终端中运行。

默认情况下，Serve 在前台运行，也就是说，如果你按下 `Ctrl+C` 或关闭终端会话，Tailscale 会停止通过 Serve 共享。如果你希望即使在会话结束后也保持 Serve 共享，请使用 `--bg` 标志：

```shell
sudo tailscale serve --bg /tmp/public
Available within your tailnet:
https://amelie-workstation.pango-lin.ts.net

|-- / path  /tmp/public

Serve started and running in the background.
To disable the proxy, run: tailscale serve off
```

如果以后台方式运行 Serve，那么当你想停止向 tailnet 共享时，需要记得用 [`tailscale serve off`][docs-tailscale-serve-disable-tailscale-serve] 命令关闭 Serve。

在本指南中，我们将用 `curl` 确认 URL 可用，但你也应该能在浏览器中访问你的 Serve URL 来查看我们创建的两个文件：

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

本示例展示如何把一个静态 HTML 网站提供给 tailnet 中的其他设备。

首先，让我们创建一些文件作为静态站点组成部分的示例：一个 index 文件和一些资源。如果你的设备上已有网站资源，可以直接使用。手写的 HTML 和 CSS 也许就够用了，或者你也可以使用众多[现成的静态站点生成器][xt-gh-awesome-static-generators]之一。

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

现在，让我们把静态站点提供给 tailnet：

```shell
sudo tailscale serve /tmp/static-site
```

状态输出会确认前一条命令，并提供 Serve 为该节点配置的主机名。在这里，我们可以确认它只在 tailnet 内可用：

```shell
sudo tailscale serve /tmp/static-site
Available within your tailnet:
https://amelie-workstation.pango-lin.ts.net

|-- / path /tmp/static-site

Press Ctrl+C to exit.
```

现在可以在浏览器中打开该 URL，确认一切正常。

*（图：浏览器中查看的经 Tailscale 发布的网页。）*

### 将开发服务器暴露给你的 tailnet

拥有一条通过 Serve 可访问的路由，意味着 tailnet 中的其他用户可以访问你设备上运行的本地服务器并与之交互。例如，如果你正在写一篇博文并想分享草稿供人审阅，可以用 Serve 将开发站点提供给你的 tailnet。

假设你有一个本地 HTTP 服务器运行在端口 `3000` 上，你可以用 Serve 通过 HTTPS 将该本地服务器暴露给你的 tailnet：

```shell
tailscale serve 3000
```

```shell
tailscale serve 3000
Available within your tailnet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

在浏览器中打开该 URL，确认一切工作正常。

只要你的开发设备在线并连接到 Tailscale，数据就会经由 Serve 在你的开发服务器之间往来路由。

> **提示：**
>
> 使用 Serve 转发端口时，你不需要 `sudo` 或管理员控制台。

## 将本地服务绑定到你的 tailnet

除了运行 HTTPS 服务器，你还可以用 `tailscale serve` 命令把基于 TCP 的本地服务绑定到你的 Tailscale IP，使其在 tailnet 内私有可用。

下面是一个把设备的 SSH 服务器重新绑定到端口 `2222` 的示例。例如，当你使用 Tailscale SSH 为设备的 SSH 服务器提供备用访问途径时，可能会觉得这很有用：

```shell
tailscale serve --tcp 2222 22
```

从另一台设备上，像平常一样用 SSH 连接，但在命令中加上我们配置的端口标志。例如：

```shell
ssh -p 2222 <user>@100.x.y.z
```

## 共享 Serve 节点

Serve 的一大好处是拥有可预测、稳定的 DNS 名称，例如 `web-dev.pango-lin.ts.net`。这样你只需设置或共享一次 DNS 名称，之后每次开启 Serve，它都随时可访问。

但如果你想把这个 Serve DNS 名称共享给多位协作者或同事呢？当你们协作开发一个 Web 应用、并希望无论当前是哪位开发者在开发该应用都保持 URL 稳定时，就会出现这种需求。

我们推荐的做法是：用想要的名称设置一个节点。假设就叫 `web-dev.pango-lin.ts.net`。可选地，开启 Tailscale SSH 让它更容易连接。

在该节点上开启 Serve，例如：

```shell
tailscale serve 8080
```

这样 Serve 会把任意路径的 HTTPS 流量转发到该设备的 `http://localhost:8080`。

现在只差一条命令，就能把我们的 Web 开发服务器转发到这个共享的 Serve 节点，从而通过刚设置好的 Serve 提供访问。

在你想与之共享 Serve 的其他设备上，启动用于测试 Web 应用的开发服务器。下面的示例使用端口 3000 作为本地开发服务器的端口。然后，建立一条 SSH 反向代理，把本地开发服务器连接到共享的 Serve 节点——该节点配置在其端口 8080 上，也就是我们设为 Serve 目标的端口，例如：

```shell
ssh -NT -R 8080:127.0.0.1:3000 web-dev.pango-lin.ts.net
```

如果共享的 Serve 已被占用怎么办？建立 SSH 反向代理时你会收到一条错误消息，内容类似于：

```shell
Warning: remote port forwarding failed for listen port 8080
```

## 将应用能力转发到本地服务

> **注意：**
>
> 此功能在 Tailscale v1.92 及更高版本中可用。

Serve 允许你使用 `--accept-app-caps` 命令行标志，列出应由 Serve 转发给本地服务的[应用能力][docs-app-capabilities]。
如果发起请求的用户或带标签节点已被授予所指定的任何应用能力，Serve 会将其转换为序列化的 JSON，并通过名为 `Tailscale-App-Capabilities` 的标头转发。
目标服务器可以利用这些标头，例如决定与请求关联的 Tailscale 用户或带标签节点可以访问哪些资源。

假设你想让 Serve 把名为 `example.com/cap/sql` 的应用能力转发给目标服务器。
再假设你已在 tailnet 的 ACL 中把 `example.com/cap/sql` 授予了某些用户或带标签节点，如下所示：

```shell
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:sql"],
    "app": {
      "example.com/cap/sql": [
        {"src": ["main", "self"]}
      ]
    }
  },
  {
    "src": ["group:admin"],
    "dst": ["tag:sql"],
    "app": {
      "example.com/cap/sql": [
        {"src": ["*"]}
      ]
    }
  }
]
```

要让 Serve 把应用能力 `example.com/cap/sql` 转发到端口 8080 上的本地服务，请运行：

```shell
tailscale serve --accept-app-caps=example.com/cap/sql 8080
```

每当拥有该应用能力的用户通过你刚创建的 Serve 代理向目标服务器发起请求，目标服务器都会收到包含该应用能力 JSON 字符串的 `Tailscale-App-Capabilities` 标头。对于 `group:eng` 中的用户，标头值为 `{"example.com/cap/sql":[{"src":["main","self"]}]}`；对于 `group:admin` 中的用户，则为 `{"example.com/cap/sql":[{"src":["*"]}]}`。

> **提示：**
>
> 当你使用能力标头在后端服务中为用户或带标签节点授权时，最佳实践是让该服务只监听 localhost。否则，任何能直接调用你的服务（而非通过 Serve URL）的用户都可以轻而易举地自行伪造这些 HTTP 标头的值。只监听 localhost 可以把篡改范围限制在 Serve 设备上运行的其他服务，而不会波及你的局域网或 tailnet 上的任何人。

[docs-access-control]: /docs/features/access-control

[docs-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-serve]: /docs/features/tailscale-serve

[docs-serve-setup]: /docs/features/tailscale-serve#开始使用-serve

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-serve-disable-tailscale-serve]: /docs/reference/tailscale-cli/serve#停用-tailscale-serve

[xt-gh-awesome-static-generators]: https://github.com/myles/awesome-static-generators
