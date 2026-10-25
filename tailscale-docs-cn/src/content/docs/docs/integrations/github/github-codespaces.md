---
title: "从 GitHub Codespaces 访问你的 tailnet"
description: "[GitHub Codespaces][xt-gh-codespaces] 是一种在云端运行 Visual Studio Code 的方式——包括其编辑器、终端、调试器、版本控制、设置同步以及整个扩展生态。"
---

最后验证于 Jan 5, 2026

[GitHub Codespaces][xt-gh-codespaces] 是一种在云端运行 Visual Studio
Code 的方式——包括其编辑器、终端、调试器、版本控制、设置同步以及整个扩展生态。

Tailscale 可以安装在 Codespace 内，从而安全地访问私有资源，例如软件包仓库或许可证服务器，无论它们位于云端还是本地部署。你还可以使用 Tailscale 与同事共享你的开发或预发布（staging）环境。

## 集成

使用 [GitHub Codespaces][xt-gh-codespaces] 时，你可以将 Tailscale 作为 [feature][xt-gh-features] 包含在你的 [dev container][xt-gh-dev-containers] 中。

该 feature 可从 [`tailscale/codespace` 仓库][xt-gh-tailscale-codespace]获取。

要使用 Tailscale feature，请在你的 `devcontainer.json` 中加入：

```json
"runArgs": ["--device=/dev/net/tun"],
"features": {
  // ...
  "ghcr.io/tailscale/codespace/tailscale": {}
  // ...
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

然后启动你的 codespace。

## 授权

codespace 首次启动时，需要进行身份验证才能加入 tailnet。
在终端窗口中运行：`tailscale set --accept-routes`

它会输出一个 URL，请在浏览器中访问该 URL，登录你想要的账户。

*（图：正在编写本主题的 GitHub Codespace）*

[xt-gh-codespaces]: https://github.com/features/codespaces

[xt-gh-dev-containers]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/introduction-to-dev-containers

[xt-gh-features]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-features-to-a-devcontainer-file

[xt-gh-tailscale-codespace]: https://github.com/tailscale/codespace
