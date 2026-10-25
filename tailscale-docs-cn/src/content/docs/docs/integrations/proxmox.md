---
title: "在 Proxmox 主机上使用 Tailscale"
description: "以最佳方式配置 Proxmox，以配合 Tailscale 使用。"
---

最后验证于 Jan 5, 2026

Proxmox 是一种流行的开源虚拟机和容器运行方案，构建在 Debian Linux 平台之上。

[安装 Tailscale][docs-install-linux]后，你可以随时随地访问 Proxmox 控制台，无需开放防火墙端口或手动配置 VPN。

*（图：通过 Tailscale 访问 Proxmox Web UI。）*

## 启用对 Proxmox Web UI 的 HTTPS 访问

Proxmox Web UI 默认通过 HTTPS 在端口 `8006` 上提供服务。默认证书是自签名的，因此你需要在浏览器中接受证书警告。在 Proxmox 主机上安装 Tailscale 后，你可以生成有效的证书，无需再接受该警告。

以下脚本将使用 Tailscale 为 Proxmox 主机生成证书，并将其安装到 Proxmox 证书存储中。

> **注意：**
>
> 此脚本依赖 `jq`。你可能需要在你的设备上安装 `jq`。
>
> 使用 `apt`：
>
> ```shell
> apt -y install jq
> ```
>
> 使用 `brew`：
>
> ```shell
> brew install jq
> ```

```shell
#!/bin/bash
NAME="$(tailscale status --json | jq '.Self.DNSName | .[:-1]' -r)"
tailscale cert "${NAME}"
pvenode cert set "${NAME}.crt" "${NAME}.key" --force --restart
```

（可选）你可能希望将此脚本作为 `cron` 任务运行，以确保证书保持最新。

1. 将此脚本保存到一个文件中，例如 `update_cert.sh`。

2. 修改文件权限使其可执行，例如：

   ```shell
   chmod +x update_cert.sh
   ```

3. 创建一个 `cron` 任务条目，例如每 12 小时运行一次：

   ```shell
   0 */12 * * * /path/to/update_cert.sh
   ```

另一种选择是使用 [Tailscale Serve][docs-tailscale-serve] 来代理 Proxmox Web UI。这样你就可以使用由 Serve 自动生成的有效证书访问 Web UI。此外，你还可以在 URL 中省略端口号，因为 Serve 可以在默认 HTTPS 端口 `443` 上代理请求。

```shell
sudo tailscale serve --bg https+insecure://localhost:8006
```

> **注意：**
>
> 我们建议使用 `--bg` 标志，让 Tailscale Serve 作为后台进程运行。

## 故障排除

有关故障排除信息，请参阅[排查 Proxmox 问题][docs-troubleshooting-proxmox]。

[docs-install-linux]: /docs/install/linux

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-troubleshooting-proxmox]: /docs/reference/troubleshooting/containers/proxmox
