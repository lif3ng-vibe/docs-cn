---
title: "tsidp"
description: "使用 tsidp 保护 tailnet 内任何支持 OIDC/OAuth 的服务，无需额外登录，包括 Grafana 等自托管应用和 MCP 服务器。"
---

最后验证于 Mar 10, 2026

`tsidp` 是一个轻量级 OIDC/OAuth 服务器，它利用 Tailscale 以密码学方式保证的[网络身份][docs-tailscale-identity]来消除认证提示，同时提升安全态势。借助 Tailscale 和 `tsidp`，你可以用极小的代价安全地隔离并授权任何支持 OIDC/OAuth 的服务，包括 Grafana 等自托管应用，甚至面向私有 AI 部署的 Model Context Protocol（MCP）服务器。

`tsidp` 是一个开源项目，托管于 [https://github.com/tailscale/tsidp][xt-github-tailscale-tsidp]。

> **警告：**
>
> `tsidp` 是一个实验性项目，目前仍在积极开发中，可能出现破坏性变更。

## 工作原理

在 Tailscale 网络（即 tailnet）上运行 `tsidp` 时，它会暴露标准的 OIDC 端点，Grafana、Proxmox 等支持 OIDC 的应用可以把它用作身份提供方（IdP）。应用会针对 `tsidp` 端点执行 OIDC 发现。当用户需要访问应用时，应用会提供 **Log in using Tailscale**（使用 Tailscale 登录）选项，并把登录请求重定向到 `tsidp`。`tsidp` 使用 LocalAPI 的 `whois` 功能来确定调用者的身份。`tsidp` 与应用相互交换信息，最终由 `tsidp` 向应用发送 ID token 和访问 token。应用可以验证 ID token 的数字签名。此外，应用还可以选择检索 `userinfo` 内容，以获取用户名、邮箱或头像等信息（如可用）。

`tsidp` 基于 [`tsnet`][docs-tsnet] 构建，后者让应用能够以编程方式与 tailnet 中的设备建立直连。在众多功能之中，`tsnet` 为 `tsidp` 提供了对 [LocalAPI][xt-gh-tailscale-tailscale-ipn-localapi] 的访问能力，应用因此能够以编程方式获取 Tailscale 客户端的信息，包括 `whois` 身份。

## 前提条件

要设置 `tsidp`，你需要满足以下前提条件：

* 一个 tailnet。如果你还没有 tailnet，请[注册](https://login.tailscale.com/start)。

* 一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 Tailscale 账户，以便你能在要设置 `tsidp` 的 tailnet 中执行以下任务：

  * 启用 MagicDNS。
  * 启用 HTTPS。
  * 编辑 tailnet 策略文件。
  * （可选）创建一个[认证密钥（auth key）][docs-auth-keys]或一个 [OAuth client][docs-oauth-clients]。目的是在 `tsidp` 实例加入你的 tailnet 时预先批准它，无需交互式登录。

* tailnet 中的一台设备，你将在其上运行 `tsidp` 二进制文件。

* （推荐）设备上已安装 Docker。本文假设你已安装 Docker。

* 能够创建配置文件并运行 CLI 命令，以便运行 `tsidp` 二进制文件。

要把 `tsidp` 与某个应用搭配使用，该应用需要支持 OIDC/OAuth，并且需要知道 `tsidp` 服务器使用哪些端点。为应用配置端点因应用而异，故此处不做说明。

## 配置你的 tailnet

你需要执行以下任务来为 `tsidp` 配置 tailnet。

### 启用 MagicDNS

MagicDNS 会为 tailnet 中的设备自动注册 DNS 名称。2022 年 10 月 20 日及之后创建的 tailnet 默认已启用 MagicDNS。有关启用 MagicDNS 的信息，请参阅[启用 MagicDNS][docs-magicdns-enable]。

### 启用 HTTPS

启用 HTTPS 后，你可以为 tailnet 中的设备配置传输层安全（TLS）证书。`tsidp` 功能要求你的 `tsidp` 服务器持有 TLS 证书。有关启用 HTTPS 的信息，请参阅[配置 HTTPS][docs-enabling-https-configure]。

### （可选）创建 auth key 或其他凭证

如果你想预先批准把 `tsidp` 实例加入 tailnet，你需要一个[认证密钥（auth key）][docs-auth-keys]或一个 [OAuth client][docs-oauth-clients]。没有这类凭证的话，你需要交互式登录 `tsidp` 实例，它才能加入你的 tailnet。

就本文而言，凭证使用 auth key。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 选择 **Generate auth key**。
3. 在 **Description** 中输入 `tsidp` 或你想要的其他字符串。该值仅用于整理你的认证密钥。
4. （可选）为认证密钥配置其他设置。有关认证密钥设置的信息，请参阅 [Auth keys][docs-auth-keys]。
5. 选择 **Generate key**。
6. 复制认证密钥的值并妥善保管。之后不会再完整显示。稍后设置 `TS_AUTHKEY` 环境变量时需要用到该值。
7. 选择 **Done**。

### 设置应用能力授权

默认情况下，`tsidp` 管理界面和动态客户端注册（DCR）端点的访问都被拒绝。

要允许访问，你需要设置一个 `tailscale.com/cap/tsidp` [应用能力（app capability）][docs-grants-app-capabilities]授权（grant）。例如，要让 tailnet 管理员访问带有 [tag][docs-tags] `tag:server` 的设备，请先[创建该 tag][docs-tags-define-a-tag]，再[编辑 tailnet 策略文件][docs-edit-policies]并添加如下授权：

```json
"grants": [
  {
    // Allow admins to access any device with the tag "tag:server"
    "src": ["autogroup:admin"],
    "dst": ["tag:server"],

    "app": {
      "tailscale.com/cap/tsidp": [
        {
          // allow access to UI
          "allow_admin_ui": true,

          // Security Token Service (STS) controls
          "users":     ["*"],
          "resources": ["*"],

          // extraClaims are included in the id_token
          // recommend: keep this small and simple
          "extraClaims": {
            "bools": true,
            "strings": "Mon Jan 2 15:04:05 MST 2006",
            "numbers": 180,
            "array1": [1,2,3],
            "array2": ["one", "two", "three"]
          },

          // include extraClaims data in /userinfo response
          "includeInUserInfo": true,
        },
      ],
    },
  },
],
```

下表描述了定义 `tailscale.com/cap/tsidp` 应用能力时 `app` 各字段的含义。

| 字段                | 说明                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------ |
| `allow_admin_ui`    | `users` 中指定的用户能否访问 `tsidp` 管理界面。                                        |
| `users`             | 允许向 STS 请求安全令牌（security token）的用户。                                      |
| `resources`         | 安全令牌可提供访问权限的资源。                                                         |
| `extraClaims`       | 要包含在安全令牌中的额外 claims。                                                      |
| `includeInUserInfo` | 是否在 `/userinfo` 响应中包含额外 claims。                                             |

你可以按需添加更多授权。例如，你可以允许 `group:sales` 访问打了 `tag:sales` 标签的设备。那会是一条独立的授权，包含它自己的 `tailscale.com/cap/tsidp` 定义。

> **警告：**
>
> `tsidp` 应用能力的 schema 仍在开发中，可能随时变更。

应用能力授权按请求生效并立即更新。创建或修改应用能力授权后，无需重启 `tsidp`。

## 部署 tsidp 实例

`tsidp` 的源码位于 [https://github.com/tailscale/tsidp][xt-github-tailscale-tsidp]。我们推荐使用预构建的 Docker 镜像，如下列步骤所示。

1. 在 tailnet 中一台运行 Docker 的设备上，创建一个打算用于 `tsidp` 的文件夹，并将其设为当前工作目录。

2. 创建一个 `compose.yaml` 文件，内容使用以下模板：

   ```yaml
   services:
     tsidp:
       container_name: tsidp
       image: ghcr.io/tailscale/tsidp:latest
       volumes:
         - tsidp-data:/data
       environment:
         - TAILSCALE_USE_WIP_CODE=1 # tsidp 为实验性项目——版本 <1.0.0 期间必需
         - TS_STATE_DIR=/data # 存储 tsnet 与 tsidp 的持久化状态
         - TS_HOSTNAME=idp # tailnet 内的主机名（会成为 idp.your-tailnet.ts.net）
         - TSIDP_ENABLE_STS=1 # 启用 OAuth token 交换
   volumes:
     tsidp-data:
   ```

3. 创建 `TS_ADVERTISE_TAGS` 环境变量，并在 tailnet 策略文件中为其赋值为先前创建的 tag：

   ```shell
   export TS_ADVERTISE_TAGS=tag:tsidp
   ```

4. 创建 `TS_AUTHKEY` 环境变量，并为其赋值为先前创建的认证密钥：

   ```shell
   export TS_AUTHKEY=<your-auth-key>
   ```

   把 `<your-auth-key>` 替换为你的认证密钥。或者，如果你创建的是 OAuth client，就把 `<your-auth-key>` 替换为 OAuth client 的 secret。

5. 运行 `tsidp` 二进制文件：

   ```shell
   docker compose up -d
   ```

6. （可选）持续输出 `tsidp` 容器的 `stdout` 与 `stderr` 日志：

   ```shell
   docker compose logs -f
   ```

   想停止查看日志输出时，按 `Ctrl+C`。

   在初始化过程中，`tsidp` 二进制文件会为 `tsidp` 实例生成一张 TLS 证书。

   > **注意：**
   >
   > 如果你是第一次运行 `tsidp`，TLS 证书的生成可能需要几分钟。在证书就绪之前，你可能无法访问 `tsidp` 服务器。

7. `tsidp` 启动后，从 tailnet 中的设备打开 `https://idp.<your-tailnet-dns-name>`，把 `<your-tailnet-dns-name>` 替换为你实际的 [tailnet DNS 名称][docs-tailnet-name-tailnet-dns-name]。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到你的 tailnet DNS 名称。例如 `https://idp.cat-crocodile.ts.net`。

现在 `tsidp` 已经在你的 tailnet 中运行，你可以用它来管理凭证。

## 使用 tsidp 管理凭证

启动 `tsidp` 服务器后，使用 `tsidp` 管理界面来创建、更新或删除 OIDC 客户端。

### 创建 OIDC 客户端

1. 打开你的 `tsidp` 应用提供的 **Tailscale OIDC Identity Provider** URL。
2. 选择 **Create Client**。
3. 在 **Client Name** 中为客户端提供一个名称。
4. 在 **Redirect URIs** 中提供一个或多个重定向 URI，用户在认证完成后会被重定向到这些地址。每行填写一个重定向 URI。
5. 选择 **Create Client**。
6. 同时复制 Client ID 和 Client Secret。关闭 Add New OIDC Client 页面后，Client Secret 将不再可见。
7. 按需在你的托管或 SaaS 应用中使用 Client ID 和 Client Secret。具体做法因应用而异，故此处不做说明。

### 更新 OIDC 客户端

1. 打开你的 `tsidp` 应用提供的 **Tailscale OIDC Identity Provider** URL。
2. 找到要更新的客户端，选择 **Edit**。
3. 按需更新客户端名称和重定向 URI。
4. 选择 **Update Client**。

### 重新生成客户端密钥

1. 打开你的 `tsidp` 应用提供的 **Tailscale OIDC Identity Provider** URL。
2. 找到要更新密钥的客户端，选择 **Edit**。
3. 选择 **Regenerate Secret**。
4. 选择 **OK**，确认你要重新生成密钥。
5. 复制新的 Client Secret。关闭 **Edit OIDC Client** 页面后，Client Secret 将不再可见。
6. 按需在你的托管或 SaaS 应用中使用新的 Client Secret。

### 删除 OIDC 客户端

1. 打开你的 `tsidp` 应用提供的 **Tailscale OIDC Identity Provider** URL。
2. 找到要删除的客户端，选择 **Edit**。
3. 选择 **Delete Client**。
4. 选择 **OK**，确认你要删除该客户端。

## 后续步骤

* 要把 `tsidp` 配置为 [Proxmox][xt-proxmox] 的身份提供方，请参阅 [`tsidp` Proxmox 示例][xt-github-tailscale-tsidp-proxmox]。

* `tsidp` 支持 [MCP Authorization 规范][xt-mcp-authorization]要求和建议的端点，包括[动态客户端注册（Dynamic Client Registration）][xt-rfc-7591]。更多信息请参阅以下示例：

  * [MCP Client / Server][xt-github-tsidp-mcp-server]
  * [MCP Client / Gateway Server][xt-github-tsidp-mcp-gateway]

* 作为认证密钥的替代方案，你可以使用 OAuth client 来预先批准你的 `tsidp` 实例。更多信息请参阅 [OAuth clients][docs-oauth-clients]。

* 有关 `tsidp` 配置的更多信息，请参阅 [`tsidp` 配置][docs-tsidp-configuration]。

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-enabling-https-configure]: /docs/how-to/set-up-https-certificates

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-magicdns-enable]: /docs/features/magicdns#启用-magicdns

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-tags-define-a-tag]: /docs/features/tags#定义标签

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-名称

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-tsidp-configuration]: /docs/reference/tsidp-configuration

[docs-tsnet]: /docs/features/tsnet

[xt-gh-tailscale-tailscale-ipn-localapi]: https://github.com/tailscale/tailscale/blob/main/ipn/localapi/localapi.go

[xt-github-tailscale-tsidp-proxmox]: https://github.com/tailscale/tsidp/blob/main/docs/proxmox/README.md

[xt-github-tailscale-tsidp]: https://github.com/tailscale/tsidp

[xt-github-tsidp-mcp-gateway]: https://github.com/tailscale/tsidp/blob/main/examples/mcp-gateway/README.md

[xt-github-tsidp-mcp-server]: https://github.com/tailscale/tsidp/blob/main/examples/mcp-server/README.md

[xt-mcp-authorization]: https://modelcontextprotocol.io/specification/draft/basic/authorization

[xt-proxmox]: https://www.proxmox.com/

[xt-rfc-7591]: https://www.rfc-editor.org/rfc/rfc7591.html
