---
title: "Tailscale 客户端版本与发布通道"
description: "了解 Tailscale 客户端版本与发布通道。"
---

最后验证于 Feb 21, 2025

本主题介绍 Tailscale 的客户端版本编号方法以及我们提供的客户端发布通道。这些概念有助于理解应该[安装][docs-installation]哪个客户端，以及[更新][docs-update]客户端的流程。

## 客户端版本编号

Tailscale 采用基于[语义化版本（Semantic Versioning）][xt-semver]的交替版本编号方案。版本编号在不同的构建发布通道之间有所不同。

* stable（稳定）构建以偶数次版本号标识，例如 1.70.0、1.72.0 和 1.74.0。也可能包含补丁版本，例如 1.72.1、1.72.2 和 1.72.3。
* release candidate（候选版本）构建以带补丁号的偶数次版本号标识，例如 1.70.1、1.70.2 和 1.70.3。
* unstable（不稳定）构建以奇数编号标识，例如 1.71.0、1.73.0 和 1.75.0。

## 客户端发布通道

发布通道表示客户端构建的成熟度和可靠性。

### Stable 通道

Stable 通道的构建是最新且经过支持与测试的版本。这些构建被认为最可靠，并收录在[更新日志][co-changelog]中。

Stable 构建可以从以下位置获取：

* Tailscale [下载（Download）][co-download]页面。
* 已安装客户端的[用户界面][docs-update-manual]（在有更新选项的平台上），包括 Windows 和 macOS。
* [Tailscale CLI][docs-cli] 命令 [`tailscale update`][docs-cli-update]（在 CLI 功能可用的平台上），包括 Linux、Windows 和 macOS。
* 我们支持的各平台的应用商店，例如 Apple App Store、Google Play 和 Amazon Appstore。
* [Tailscale Packages][pk-home] 网站的 Tailscale Packages [stable 通道][pk-stable]页面。具体平台的可用情况有所不同，因为并非所有平台都会同时更新。
  * 通常，Linux、Windows 和 macOS 的更新会同步发布。Synology、QNAP 等 NAS 平台的更新发布频率较低。
  * iOS 和 tvOS 的 stable 构建仅在 Apple App Store 提供。
  * 对于 macOS，我们称之为 Standalone 变体，并推荐优先使用这种变体。更多信息请参阅[在 macOS 上运行 Tailscale 的三种方式][docs-macos-variants]。

我们大约每四周发布一次 stable 构建。

### Release candidate 通道

Release candidate 通道的构建仅在 [Tailscale Packages][pk-home] 网站的 Tailscale Packages [Release candidates 通道][pk-release-candidate]页面提供。它们是当前 stable 版本之后的补丁版本，正在为进入 stable 通道进行测试。例如 1.72.1。

当补丁候选版本被认为稳定后，它将从该页面移入 stable 通道。次要版本（例如 1.72.0）不提供候选版本。

补丁候选版本按需发布，用于补丁发布测试。

### Unstable 通道

Unstable 通道的构建仅在 [Tailscale Packages][pk-home] 网站的 [unstable 通道][pk-unstable]页面提供。Unstable 构建是可供测试的最新版本，更新最频繁，不建议在生产环境中使用。更多信息请参阅[安装 unstable 版 Tailscale 客户端][docs-install-unstable]。

我们大约每隔几天发布一次 unstable 构建。

[co-changelog]: https://tailscale.com/changelog#client

[co-download]: https://tailscale.com/download

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-install-unstable]: /docs/install/unstable

[docs-installation]: /docs/install

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-update-manual]: /docs/features/client/update#manual-updates

[docs-update]: /docs/features/client/update

[pk-home]: https://pkgs.tailscale.com/

[pk-release-candidate]: https://pkgs.tailscale.com/release-candidate

[pk-stable]: https://pkgs.tailscale.com/stable/

[pk-unstable]: https://pkgs.tailscale.com/unstable/

[xt-semver]: https://semver.org
