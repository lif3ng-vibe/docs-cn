---
title: "使用 Docker Compose 将 Docker 容器连接到你的 tailnet"
description: "本指南介绍如何使用 Docker Compose 命令行方式，运行一个将 Tailscale 客户端与 nginx Web 服务器及反向代理组合在一起的容器。"
---

最后验证于 Mar 23, 2026

本指南介绍如何使用 [Docker Compose][xt-docker-docs-compose] 命令行方式，运行一个把 Tailscale 客户端与 [nginx][xt-nginx] Web 服务器和反向代理组合在一起的容器。nginx 容器共享 Tailscale 的网络连接，让你可以通过 tailnet 安全地访问它。

## 前提条件

开始之前，你需要：

* 已安装并正在运行 Docker Engine。
* 已安装 Docker Compose，并可通过 `docker compose` 命令使用。
* 一个 Tailscale 账户，且有权在管理控制台中生成[认证密钥][docs-auth-keys]。

准备好这些后，你就可以开始把 Docker 容器连接到你的 tailnet 了。

## 生成认证密钥

生成认证密钥并将其添加到 Docker 配置中，即可自动把 Docker 容器连接到你的 tailnet，无需手动登录。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys)（密钥）页面。
2. 在 **Auth keys**（认证密钥）部分，选择 **Generate auth key**（生成认证密钥）。
   1. 添加一段描述以便识别该密钥。描述不影响配置。
   2. 其他选项保持默认。
   3. 选择 **Generate key**（生成密钥）。
3. 立即复制该密钥。关闭对话框后将无法再次查看。

关于 Tailscale 认证密钥的更多信息，请参阅[认证密钥][docs-auth-keys]。

## 创建并运行容器

1. 在项目目录中新建一个名为 `docker-compose.yml` 的文件，并在文件中添加配置指令。以下配置定义了两个服务：一个用于 Tailscale 客户端，另一个用于 nginx Web 服务器。

   ```yaml
   services:
     tailscale:
       image: tailscale/tailscale:latest
       container_name: tailscale
       hostname: tailscale-nginx
       environment:
         - TS_AUTHKEY=<tskey-YOUR-AUTH-KEY>
         - TS_STATE_DIR=/var/lib/tailscale
       volumes:
         - ./tailscale-state:/var/lib/tailscale
       cap_add:
         - net_admin
         - net_raw
       restart: unless-stopped

     nginx:
       image: nginx:latest
       container_name: nginx_server
       ports:
         - "8080:80"
       depends_on:
         - tailscale
       restart: unless-stopped

   ```

   > **注意：**
   >
   > 正确的 YAML 格式至关重要。文件使用缩进（空格，而不是制表符）来表示结构和层级。每一级缩进必须一致，通常使用两个空格。缩进不正确会导致 Docker Compose 解析出错而失败。

2. 将 `<tskey-YOUR-AUTH-KEY>` 替换为你生成的认证密钥。

3. 保存文件，然后启动容器：

   ```shell
   docker compose up -d
   ```

4. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines)（机器）页面，确认 `tailscale-nginx` 已出现。

在已连接到 tailnet 的设备上用浏览器访问 Docker 主机上的 `http://localhost:8080`。此时会显示 "Welcome to nginx" 页面。

## Docker Compose 示例详解

基于本主题中的 Docker Compose YAML 示例，以下是该配置所含字段和标志的逐一说明：

**Tailscale 服务的组成部分**

* `tailscale`：在容器中运行 Tailscale 客户端。
  * `image: tailscale/tailscale:latest`：告诉 Docker 下载官方 Tailscale 镜像并使用最新版本。
  * `container_name: tailscale`：为容器指定固定名称，便于用 Docker 命令查找和管理。
  * `hostname: tailscale-nginx`：设置该容器在你的网络和 tailnet 中标识自己的方式。
  * `environment`：定义启动时要使用的环境变量，例如 [Tailscale 配置参数][docs-docker-parameters]。
    * `TS_AUTHKEY`：使用你的 Tailscale 认证密钥对容器进行认证。
    * `TS_STATE_DIR`：告诉 Tailscale 在哪里存储登录和连接数据。
  * `volumes`：让容器把数据保存到你的计算机上，而不是在重启时丢失。
    * `./tailscale-state:/var/lib/tailscale`：把 Tailscale 数据存储在本地文件夹中，使其在重启后仍保持登录状态。
  * `cap_add`：添加容器正常运行所需的额外系统权限。
    * `net_admin`：让容器可以配置网络接口、路由表和其他网络设置。在 Tailscale 使用内核网络时需要此权限。
    * `net_raw`：让容器能在更底层处理网络流量；Tailscale 建立 VPN 连接以及 `ping` 等工具正常工作都需要它。
  * `restart: unless-stopped`：自动重启容器，除非你手动停止它。

**nginx 服务的组成部分**

* `nginx`：运行 nginx Web 服务器。
  * `image: nginx:latest`：告诉 Docker 下载官方 nginx 镜像并使用最新版本。
  * `container_name: nginx_server`：为容器指定固定名称，便于用 Docker 命令查找和管理。
  * `ports`：定义你的计算机如何访问容器。
    * `"8080:80"`：把计算机上的 8080 端口映射到容器内的 80 端口，这样你就可以在 `http://localhost:8080` 打开该网站。
  * `depends_on`：列出必须先于本服务启动的服务。
    * `tailscale`：确保 Tailscale 服务先于本服务启动。
  * `restart: unless-stopped`：自动重启容器，除非你手动停止它。

Docker Compose 文件中可包含的字段和标志还有很多，取决于你的具体配置和需求。更多 Tailscale 配置示例，请参阅 [`tailscale-dev/docker-guide-code-examples`][xt-gh-tailscale-docker-examples]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-docker-parameters]: /docs/features/containers/docker/docker-params

[xt-docker-docs-compose]: https://docs.docker.com/compose/

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples

[xt-nginx]: https://nginx.org/
