---
title: "服务器上的 Docker Compose"
description: "在单台服务器上运行独立部署的 Lens 与 ClickHouse，配备持久化存储和 HTTPS。"
slug: "/proxy/lens/deployment/server"
---

# 服务器上的 Docker Compose

[Lens 源码安装](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)会从公开的 Lens 仓库运行 Lens、ClickHouse 与 Keeper。先在服务器上安装 Git 和 Docker Compose v2，然后按照[本地快速上手](./local.md)操作。请保留其中的源码提交（commit）、环境文件和持久化卷。独立发布的构建产物仍在验证中

如需帮助配置已有部署，可以使用[帮我搭好（Set it up for me）](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md)。要把 Lens 服务接入现有网关，请参阅 [Compose 集成指南](./docker-compose.md)

## 配置公网地址 {#1-configure-the-services}

把 `lens.example.com` 这类主机名指向你的服务器，并为它签发 TLS 证书。初始设置完成后，在 `deploy/lens/.env` 中设置：

```dotenv
LENS_PUBLIC_URL=https://lens.example.com
```

主机名替换为你自己的即可。该地址决定浏览器访问源、生成的追踪（tracing）地址以及安全会话 Cookie。生成的管理员令牌和 ClickHouse 密码保持不变

## 应用配置 {#2-start-the-services}

在 Lens 仓库根目录执行：

```sh
docker compose -f deploy/lens/compose.yaml up -d --wait
```

默认配置将 Lens 绑定到 `127.0.0.1:4318`，并让 ClickHouse 留在内部网络。当反向代理运行在另一个容器或主机上时，请使用[部署网络设置](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md#configure-a-deployment)为其提供一个可访问的 Lens 内网地址

## 路由 HTTPS 流量 {#3-route-https-traffic}

将独立部署的 UI 与 API 路径转发给 Lens。如果 NGINX 运行在同一台主机上，将以下配置保存下来，并替换成你的主机名和证书路径：

```nginx title="/etc/nginx/conf.d/lens.conf"
server {
    listen 443 ssl;
    server_name lens.example.com;
    ssl_certificate /etc/letsencrypt/live/lens.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lens.example.com/privkey.pem;
    client_max_body_size 16m;

    location / {
        proxy_pass http://127.0.0.1:4318;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```

用主机上的服务管理器检查并重载 NGINX。在 systemd 主机上：

```sh
sudo nginx -t && sudo systemctl reload nginx
```

放行 443 端口的入站 HTTPS 流量。数据库保持私有，并保留容器自带的文件系统、沙箱与资源配置

## 检查安装结果 {#4-check-the-installation}

使用你的主机名打开 `https://lens.example.com/ui/`，并用生成的管理员令牌登录。从 Agent 实际运行的网络环境完成[首条追踪验证](../deployment.md#check-the-installation)。如果启用了 investigations（排查）功能，也应实际验证一次有范围限定的排查任务

使用[备份并恢复 Lens](https://github.com/BerriAI/lens/blob/main/docs/backup.md)将数据、Keeper 状态、凭据和完全一致的镜像一并保留。备份应存放在这台服务器之外，并演练一次恢复。受支持的数据库拓扑是单台 ClickHouse 服务器；迁移到外部存储本身并不提供副本或自动故障转移
