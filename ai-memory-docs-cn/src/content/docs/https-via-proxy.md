---
title: "通过反向代理上 HTTPS"
description: "处于以下形态之一时整个跳过 TLS——安全预算花在别处更值。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/https-via-proxy.md"
---

# 通过反向代理上 HTTPS

> ai-memory 刻意**不**自己做 TLS 终结。本页是操作者指南：用成熟的 TLS 终结者（Caddy、Cloudflare Tunnel、nginx）挡在前面，让 token 与 `/web` cookie 在客户端与服务器之间加密传输。默认安装保持环回上的明文 HTTP——既有用户升级无需任何改动。

## 什么时候不需要这篇

处于以下形态之一时整个跳过 TLS——安全预算花在别处更值：

- **单用户、stdio MCP 传输。** `claude mcp add ai-memory -- ai-memory serve --transport stdio` 完全不碰网络。没有 TLS 可操心。
- **仅环回的 HTTP 服务器**、单用户、不从另一台机器访问 `/web`。`127.0.0.1:49374` 从宿主之外够不到；这里 TLS 保护不了任何内核环回边界没保护的东西。
- **本地开发 / 一次性实验。** 部署形态需要时再上 TLS；不要提前。

README 快速开始记录的单用户快乐路径就是这种情况。大多数 ai-memory 安装从不需要代理。

## 什么时候需要

以下任一条成立时，在 ai-memory 前面加一个 TLS 终结代理：

- **多用户模式开启**（至少存在一行用户记录；`[auth].token_pepper` 是凭据前提）。逐用户令牌在客户端与服务器之间传输——局域网明文 HTTP 上可被嗅探。见[多用户归因](/users/)。
- **服务器绑定到环回之外**（`AI_MEMORY_BIND=0.0.0.0:49374` 或局域网可路由 IP）。网段里的任何人都能看到明文令牌流量与 `/web` cookie。
- **你从另一台机器访问 `/web`**。Basic 认证后设置的浏览器会话 cookie 在 HTTP 上裸奔。
- **你把 ai-memory 暴露到局域网之外。** Cloudflare Tunnel 或带 Let's Encrypt 的公网域名 Caddy 是家庭实验室操作者最常落地的两种模式。

ai-memory 默认拒绝无认证的非环回 HTTP 启动。配置 `AI_MEMORY_AUTH_TOKEN` 或绑环回；危险的 `--allow-insecure-no-auth` 逃生口只为刻意的明文 HTTP 局域网使用而存在。带认证的非环回明文 HTTP 仍可用并大声记警告：没有 TLS，bearer token 与 `/web` cookie 仍可被嗅探。加不加 TLS 由你决定；本页是配方。

## 选一条路

| 路径 | 最适合 | 外部需要什么 |
|---|---|---|
| **Caddy + 公网域名 + Let's Encrypt** | 有域名且 80/443 端口可从互联网到达的操作者（大多数在转发路由器后面的家庭实验室）。 | 指向你 IP 的 DNS A/AAAA 记录。 |
| **Caddy + 内部 CA（仅局域网）** | 仅局域网多用户、无公网暴露。每台客户端机器要一次性信任 Caddy 的根证书。 | 每客户端一次性根证书安装。 |
| **Cloudflare Tunnel** | 「我不想在路由器上开端口」——仅出站隧道，TLS 在 Cloudflare 边缘终结。 | 一个 Cloudflare 账号（免费层可用）+ 一个托管在 Cloudflare 的域名。 |
| **外部证书文件（Caddy 或 nginx）** | 你已有向服务发证书的公司或家庭实验室 CA。 | 证书/私钥文件，随你的环境怎么产出。 |
| **nginx** | 你已经为其他服务跑着 nginx、想用一种配置语言。 | 与 Caddy 相同：域名或文件。 |

`docker/` 里的 compose 模板可直接复制：

- [`docker/compose.tls.caddy.yml`](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.caddy.yml)——Caddy 前置，LE 与内部 CA 两个变体都在文件里注释。
- [`docker/compose.tls.cloudflared.yml`](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.cloudflared.yml)——Cloudflare Tunnel 伴生容器，零开放端口。

下面各节逐条走。

---

## 路径 1——Caddy + 公网域名 + Let's Encrypt

有域名且 80/443 可达时最干净的路径。Caddy 自动签发 + 自动续期 Let's Encrypt，首次启动后无需操作者介入。

### Compose 模板

把 `docker/compose.tls.caddy.yml` 拷进你的部署目录。相关块：

```yaml
services:
  ai-memory:
    image: akitaonrails/ai-memory:latest
    container_name: ai-memory
    restart: unless-stopped
    expose:
      - "49374"          # 仅内部——Caddy 经 docker 网络够到它
    volumes:
      - ai-memory-data:/data
    env_file:
      - .env.production  # AI_MEMORY_AUTH_TOKEN + AI_MEMORY_ALLOWED_HOSTS + 你的 LLM 提供方凭据

  caddy:
    image: caddy:2-alpine
    container_name: ai-memory-caddy
    restart: unless-stopped
    ports:
      - "80:80"           # 供 Let's Encrypt HTTP-01 挑战
      - "443:443"         # 你的客户端唯一触碰的端口
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config

volumes:
  ai-memory-data:
    name: ai-memory-data
  caddy-data:           # 证书 + ACME 账户键住这里。备份它。
  caddy-config:
```

### Caddyfile

完整的一份，真正要紧的就三行：

```caddyfile
memory.example.com {
    reverse_proxy ai-memory:49374
}
```

Caddy 会：

1. 首次请求该主机名时解 HTTP-01 ACME 挑战。
2. 签发 Let's Encrypt 证书。
3. 到期前 30 天自动续期。
4. 原样转发 `Authorization: Bearer ...` 头（及你的认证流）。
5. 自动设置 `X-Forwarded-Proto: https` 与 `X-Forwarded-For: <client-ip>`。

### ai-memory 的 `.env.production` 调整

```bash
AI_MEMORY_AUTH_TOKEN=...long-random-token-from-generate-auth-token...
AI_MEMORY_AUTH__SECURE_COOKIE=true
AI_MEMORY_ALLOWED_HOSTS=memory.example.com,localhost,127.0.0.1
AI_MEMORY_BIND=0.0.0.0:49374
```

`AI_MEMORY_ALLOWED_HOSTS` 必须含公网主机名，否则 ai-memory 的 DNS rebinding 守卫会拒绝 Caddy 转发的请求。

### 挂在子路径下

ai-memory 与其他应用共享主机名时，代理时保留前缀并告诉 ai-memory：

```bash
AI_MEMORY_BASE_PATH=/wiki
```

```caddyfile
memory.example.com {
    handle /wiki/* {
        reverse_proxy ai-memory:49374
    }
}
```

这个部署**不要**用 `handle_path /wiki/*`：它会在转发前剥掉 `/wiki`，而 ai-memory 刻意把所有路由放在配置的前缀之下。用上面的例子，客户端这样接：

```bash
ai-memory install-mcp   --client claude-code --apply \
    --server-url "https://memory.example.com/wiki/mcp" --auth-token "$AI_MEMORY_AUTH_TOKEN"
ai-memory install-hooks --agent  claude-code --apply \
    --server-url "https://memory.example.com/wiki" --auth-token "$AI_MEMORY_AUTH_TOKEN"
```

内置浏览器随后在 `https://memory.example.com/wiki/web`；想让浏览器或自定义 `--web-ui-dir` SPA 直接在 `https://memory.example.com/wiki` 上，加 `AI_MEMORY_WEB_SLUG=/`。

**两个标志的安全规则。** `AI_MEMORY_BASE_PATH` 与 `AI_MEMORY_WEB_SLUG` 走同一个归一化器。段必须是 RFC 3986 非保留字符（`[A-Za-z0-9-._~]`）。点段（`.` / `..`）被拒——它们在段边界上意味着「当前」和「父级」，接受它们会让一个打字错误把前缀变成目录穿越。非保留集合之外的任何东西回退根挂载，启动日志说明原因。`{base_path}{web_slug}/` 的尾斜杠重定向在去规范形式的路上保留查询串。

### MCP 客户端配置（以 Claude Code 为例——其他同形）

```bash
ai-memory install-mcp   --client claude-code --apply \
    --server-url "https://memory.example.com/mcp" --auth-token "$AI_MEMORY_AUTH_TOKEN"
ai-memory install-hooks --agent  claude-code --apply \
    --server-url "https://memory.example.com" --auth-token "$AI_MEMORY_AUTH_TOKEN"
```

`https://` 打开，token 走 `Authorization: Bearer`，Caddy 的证书被浏览器/curl/MCP 客户端处处信任——因为 Let's Encrypt 在每个系统信任库里。

### 哪里会出问题

- **80 端口从互联网够不到** → ACME 失败。症状：Caddy 日志出现 `Get "https://acme-v02.api.letsencrypt.org/...": ...` 错误。修复：从路由器把 80 与 443 转发到 Caddy 宿主，或换 Cloudflare Tunnel（路径 3），它不需要开放端口。
- **DNS 尚未传播** → 首次签发以 `unauthorized: ...DNS name does not have any address` 失败。修复：等待，或检查 A 记录指向你的公网 IP。
- **数月后证书续期静默失败** → Caddy 记了失败日志但你不看。修复：订阅 `journalctl -u docker-compose@... | grep -i 'renew\|error'` 或给 Caddy 挂健康检查。

---

## 路径 2——带内部 CA 的 Caddy（仅局域网）

你没有公网域名、或不想向互联网暴露任何东西。Caddy 的内部 CA 生成一个逐服务器根证书，操作者**一次性**装进每台客户端机器的 OS 信任库。与路径 1 同样的线上形态，无互联网依赖、无端口转发。

### Caddyfile

```caddyfile
{
    local_certs   # 告诉 Caddy 用内部 CA 而非 LE
}

homelab.local, 192.168.1.50 {
    reverse_proxy ai-memory:49374
}
```

把客户端会用到的每个名字 + IP（浏览器、MCP 客户端、curl）都列进站点地址。Caddy 会把它们全部放进证书的 SAN。

### 信任安装步骤（承重的那步）

Caddy 的根证书在卷内的 `<caddy-data>/caddy/pki/authorities/local/root.crt`。提取一次：

```bash
docker compose exec caddy cat /data/caddy/pki/authorities/local/root.crt > caddy-root.crt
```

然后装进每个客户端 OS 的信任库：

| OS | 命令 |
|---|---|
| macOS | `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain caddy-root.crt` |
| Linux（Debian/Ubuntu） | `sudo cp caddy-root.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates` |
| Linux（Arch/openSUSE） | `sudo trust anchor --store caddy-root.crt` |
| Windows | `certutil -addstore -f "Root" caddy-root.crt`（管理员 PowerShell） |
| iOS / Android | 把文件邮件发到设备、打开、在 设置 → 通用 → VPN 与设备管理 安装为描述文件。然后**还要**在 设置 → 通用 → 关于本机 → 证书信任设置 里显式信任它。 |

**必须大声的警告**：某台客户端跳过信任安装，那台客户端要么拒绝 TLS 连接（MCP 客户端、curl），要么把操作者训练成无脑点掉警告（浏览器）。后一种情况下**你既没有 HTTP 的透明、也没有 HTTPS 的保护**——你得到的是一张让所有人更不安全的安全表演证书。在你连接的每台客户端机器上装根证书，或者改用路径 1 / 路径 3。

### 与路径 1 相同的 `.env` + 客户端配置形态

把 `https://homelab.local`（或你设置的任意 SAN）替换公网域名。其余完全一致。

---

## 路径 3——Cloudflare Tunnel

Cloudflare 的 `cloudflared` 守护进程建立一条仅出站的隧道到 Cloudflare 边缘。**路由器上零开放端口**、不需要公网 IP、TLS 用他们的证书在 Cloudflare 边缘终结。与家庭实验室多用户场景特别搭，因为信任故事是「Cloudflare 就是 CA」——处处被信任、没有逐客户端的安装舞蹈。

### 一次性 Cloudflare 设置

1. 有一个托管在 Cloudflare 的域名（注册商可在别处；DNS 必须在 Cloudflare）。
2. 在 Cloudflare 仪表盘，进 **Zero Trust → Networks → Tunnels** → **Create a tunnel** → 命名 `ai-memory-homelab`（随便）→ 保存。
3. Cloudflare 给你一长串 token。存好，compose 文件要用。
4. 给隧道加一个公网主机名：`memory.example.com` → 服务 `http://ai-memory:49374`。保存。
5. （可选但推荐）把主机名包进一个 **Cloudflare Access** 应用——Cloudflare 的零信任 SSO 坐在隧道前面，你在 ai-memory 的 bearer token **之上**再得一层经 Google/GitHub 等的人类认证。

### Compose 模板

拷贝 `docker/compose.tls.cloudflared.yml`。相关块：

```yaml
services:
  ai-memory:
    image: akitaonrails/ai-memory:latest
    container_name: ai-memory
    restart: unless-stopped
    expose:
      - "49374"          # 隧道经 docker 网络够到它——无宿主端口
    volumes:
      - ai-memory-data:/data
    env_file:
      - .env.production

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: ai-memory-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}

volumes:
  ai-memory-data:
    name: ai-memory-data
```

`CLOUDFLARE_TUNNEL_TOKEN` 放进你的 `.env`（或 compose env）。宿主上不暴露任何端口。除上面的仪表盘步骤外无需 DNS 配置（Cloudflare 自动管理 CNAME）。

### ai-memory 的 `.env.production` 调整

```bash
AI_MEMORY_AUTH_TOKEN=...long-random-token...
AI_MEMORY_AUTH__SECURE_COOKIE=true
AI_MEMORY_ALLOWED_HOSTS=memory.example.com,localhost,127.0.0.1
AI_MEMORY_BIND=0.0.0.0:49374
CLOUDFLARE_TUNNEL_TOKEN=eyJ...long-base64-from-the-cf-dashboard...
```

### 客户端配置

与路径 1 相同：

```bash
ai-memory install-mcp   --client claude-code --apply \
    --server-url "https://memory.example.com/mcp" --auth-token "$AI_MEMORY_AUTH_TOKEN"
```

### 哪里会出问题

- **token 泄漏。** 任何拿到 `CLOUDFLARE_TUNNEL_TOKEN` 的人都能为你的主机名跑一条隧道。env 文件保持 `0600`、不提交。
- **隧道掉了 + cf 缓存了旧 DNS** → 重启后 Cloudflare 返回 502 几分钟。通常自愈。
- **Access 策略与 bearer 认证混淆。** Cloudflare Access（可选的 SSO 层）与 ai-memory 的 bearer token 是独立的两层。两层都跑、都要过。Access 挡掉的请求，ai-memory 根本见不到。

---

## 路径 4——外部证书文件（Caddy 或 nginx）

你已有向服务发证书的 CA（公司 PKI、家庭实验室 Vault，任何）。你不想让 Caddy 自己签。

### Caddyfile

```caddyfile
memory.example.com {
    tls /etc/caddy/certs/memory.crt /etc/caddy/certs/memory.key
    reverse_proxy ai-memory:49374
}
```

挂载证书 + 私钥：

```yaml
services:
  caddy:
    # ……其余同路径 1……
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - /your/cert/path:/etc/caddy/certs:ro   # 证书目录
      - caddy-data:/data
```

文件变化时 Caddy 热重载证书。无需 reload。

### nginx 等价物

```nginx
server {
    listen 443 ssl http2;
    server_name memory.example.com;

    ssl_certificate     /etc/nginx/certs/memory.crt;
    ssl_certificate_key /etc/nginx/certs/memory.key;

    location / {
        proxy_pass http://ai-memory:49374;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # MCP Streamable HTTP 传输是请求-响应；分块
        # 请求体与 SSE 都依赖下面两行。
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

MCP 的 Streamable HTTP 传输要正确流式传输，`proxy_http_version 1.1` 加空 `Connection` 是必需的。

---

## 原生（非 Docker）Caddy

从源码 / AUR / `cargo run` 跑 ai-memory、不带 Docker 的操作者：

```caddyfile
memory.example.com {
    reverse_proxy 127.0.0.1:49374
}
```

原生装 Caddy（`brew install caddy` / `pacman -S caddy` / `apt install caddy`），把 Caddyfile 放 OS 规范路径（Linux 上 `/etc/caddy/Caddyfile`、macOS 上 `/opt/homebrew/etc/Caddyfile`），然后 `systemctl enable --now caddy` / `brew services start caddy`。其余（LE、内部 CA、外部证书）与上面 Docker 路径一样——Caddy 不在乎自己在容器边界的哪一侧。

Cloudflare Tunnel：`cloudflared service install ${CLOUDFLARE_TUNNEL_TOKEN}` 在 Linux 上装并以 systemd 服务启动隧道、macOS 上装成 LaunchDaemon。与 Docker 变体同形。

---

## ai-memory 为支持代理后面做了什么

没什么特别的——服务器刻意不在响应里生成绝对 URL，所以前面是 `https://` 还是 `http://` 无所谓。bearer token 中间件直接从请求读 `Authorization`，代理逐字转发。`/api/v1` 的 ETag 由与请求无关的字段计算。

经 HTTPS 访问 `/web` 时，设 `AI_MEMORY_AUTH__SECURE_COOKIE=true`（或 `[auth] secure_cookie = true`）。这把 Basic 认证会话 cookie 标记 `Secure`；它始终 `HttpOnly`、`SameSite=Strict`、`Path=/`。ai-memory 刻意**不**从 `X-Forwarded-Proto` 或任何其他代理头推断 HTTPS。关闭或重定向到公网主机名的直接 HTTP 访问。在直接 HTTP 部署上启用 `secure_cookie` 会让浏览器扣住 cookie——那是预期的安全行为。它默认保持 false，让环回与明文 HTTP 的本地 `/web` 继续可用。

唯一要留心的：**`AI_MEMORY_ALLOWED_HOSTS` 必须含公网主机名**，不只是 `localhost`。主机允许列表中间件在任何头改写之前运行，所以它看到的是代理转发的 `Host: memory.example.com`，不含就会拒绝。

## 别把安全缺口糊弄过去

三件要主动避免的事：

1. **不要禁用允许主机守卫。** 它是 DNS rebinding 防御；因为代理「应该会」过滤就删掉它，正是那种「别的层会处理」的、会出货 bug 的假设。加上公网主机名；不要放宽成 `*`。
2. **不要跳过路径 2 的信任安装。** 诱惑是加 `-k`（curl）或 `--insecure`（支持的 MCP 客户端）「先跑起来」。一旦这么干，你就有了一张安全表演证书：没有认证的 TLS，比带 bearer 的 HTTP 更糟——因为它看起来安全、其实不安全。
3. **不要带 `--no-tls-verify` 跑 cloudflared。** Cloudflare 的隧道守护进程默认校验 ai-memory 的证书——这没问题，因为 ai-memory 在 docker 网络内部就是明文 HTTP。别覆盖那个标志；你想覆盖它，多半是别的东西配错了。

这些路都走不干净的话，诚实的答案是「让 ai-memory 只绑环回」或「用你已信任的代理挡在前面」。让操作者建立错误心智模型的配置——看起来安全、实际不安全——比两者都糟。
