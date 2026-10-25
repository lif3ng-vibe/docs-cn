---
title: "面向嵌入式设备的更小二进制文件"
description: "构建超小体积的 Tailscale 二进制文件，用于磁盘空间受限的环境。"
---

最后验证于 Jan 5, 2026

Tailscale 在[下载页面][co-download]上提供多种操作系统和架构的下载。不过，有些情况下你可能希望构建一个"超小"的 Tailscale 二进制文件——占用磁盘空间极小的版本。一个常见用例是为 OpenWrt 路由器这类嵌入式设备构建。

## 前提条件

开始本指南之前，你需要已经搭建好并可正常使用的 Go 开发环境。

## 第 1 步：构建 Tailscale

首先，你可以构建一个把客户端（`tailscale` 二进制文件）和守护进程（`tailscaled` 二进制文件）都嵌入到同一个二进制文件中的 Tailscale 版本。这类似于 `busybox` 这类工具的工作方式：二进制文件的行为取决于它被调用的方式（具体来说，就是 `argv[0]` 的值）。本质上：如果磁盘上的文件名为 `tailscale`，该二进制文件就会表现为 `tailscale`；如果名为 `tailscaled`，就会表现为 `tailscaled`。

在 [Tailscale 仓库][xt-gh-tailscale-repo]中：

```shell
go build -o tailscale.combined -tags ts_include_cli ./cmd/tailscaled
```

使用 `du`（disk usage）命令查看编译出的二进制文件大小：

```shell
du -hs tailscale.combined
```

> **注意：**
>
> 输出二进制文件的实际大小取决于 Tailscale 版本以及编译所针对的操作系统和架构。确切数值仅作示例。

通过创建指向合并二进制文件的符号链接，它可以同时作为守护进程和 CLI 运行：

```shell
ln -s tailscale.combined tailscale
ln -s tailscale.combined tailscaled
```

用 `--help` 标志测试你的 `tailscale` 符号链接：

```shell
./tailscale --help
```

这条命令应返回帮助信息：

```shell
USAGE
  tailscale [flags] <subcommand> [command flags]

For help on subcommands, add --help after: "tailscale status --help".
 # ... omitted ...
```

用 `--help` 标志测试你的 `tailscaled` 符号链接：

```shell
./tailscaled --help
```

这条命令应返回帮助信息：

```shell
Usage of ./tailscaled:
  -bird-socket string
        path of the bird unix socket
  -cleanup
        clean up system state and exit
 # ... omitted ...
```

## 第 2 步：构建更小的 Tailscale 二进制文件

除了把 Tailscale 客户端和守护进程合并到同一个二进制文件之外，你还可以使用 `--extra-small` 标志，在构建出的二进制文件中省略调试信息和较少使用的功能。

```shell
build_dist.sh --extra-small
```

## 第 3 步：压缩 Tailscale

在磁盘空间极其宝贵的情况下，更有效的办法之一是使用压缩。有一类名为"加壳器"（packer）的工具，它们压缩磁盘上的二进制文件，并在运行时还原出未压缩的原始版本。

**使用加壳器可能有危险**！这些工具会从根本上改变二进制文件与操作系统的交互方式，可能降低该二进制文件的安全性。本指南不打算展开全部细节，但举一个具体的例子：大多数加壳器需要关闭 [W^X 保护][xt-wikipedia-write-or-execute]或需要一个可执行的临时目录才能工作。

> **注意：**
>
> 此外，一些杀毒软件会把加壳的二进制文件视为恶意软件，因为恶意软件常用这种技术来混淆自己的行为。

不过在确有需要时，节省的空间可能相当可观。最著名的加壳器之一是 [UPX][xt-upx]，可以用它来压缩上面构建的 Tailscale 合并二进制文件。

```shell
go build -o tailscale.combined -tags ts_include_cli -ldflags="-s -w" ./cmd/tailscaled
```

使用 `du` 命令查看编译出的二进制文件大小：

```shell
du -hs tailscale.combined
```

例如，返回的大小如下：

```shell
 18M    tailscale.combined
```

接下来使用 `upx` 命令：

```shell
upx --lzma --best ./tailscale.combined
```

使用 `du` 命令查看编译出的二进制文件大小：

```shell
du -hs tailscale.combined
```

例如，返回的压缩后大小如下：

```shell
 4.5M   tailscale.combined
```

经过 UPX 压缩，我们把（合并的）Tailscale 二进制文件从原始的 23MiB 缩减到只有 4.5MiB，约为原始大小的 20%！

[co-download]: https://tailscale.com/download

[xt-gh-tailscale-repo]: https://github.com/tailscale/tailscale

[xt-upx]: https://upx.github.io

[xt-wikipedia-write-or-execute]: https://en.wikipedia.org/wiki/W%5EX
