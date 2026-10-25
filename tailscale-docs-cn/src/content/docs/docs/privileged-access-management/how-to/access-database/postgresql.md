---
title: "使用 Tailscale PAM 访问 PostgreSQL 数据库"
description: "[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 PostgreSQL，而无需共享数据库凭证。"
---

最后验证于 Aug 18, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 PostgreSQL，而无需共享数据库凭证。

你可以控制谁有权访问数据库、应用细粒度权限，并保留数据库会话的审计跟踪。用户可以从浏览器连接，也可以继续使用自己惯用的 PostgreSQL 客户端。

本指南带你创建 PostgreSQL PAM 服务、连接该服务并查看产生的会话活动。

## 前提条件

开始之前，确认你具备以下条件：

* 一个已安装、在线且能访问 PostgreSQL 服务器的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果打算使用原生数据库客户端，你用来连接的设备上需已[安装][docs-install] Tailscale 并登录。
* 连接器能够访问的一台 PostgreSQL 服务器。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

你可以使用自己的 PostgreSQL 服务器、Tailscale PAM 沙箱服务器，或本地 Docker 容器。

如果使用自己的 PostgreSQL 服务器，你需要它的主机名或 IP 地址、端口、用户名和密码。

如果你只是想试用 Tailscale PAM，可以使用公共 PostgreSQL 沙箱：

| 设置 | 值 |
| --- | --- |
| 主机名 | `psql.playground.border0.io` |
| 端口 | `5432` |
| 用户名 | `border0` |
| 密码 | `Border0<3Psql` |

关于其他可用于测试的沙箱服务器的信息，参见 [Tailscale PAM 常见问题][docs-pam-faq-sandbox]。

## 用 Docker 运行本地 PostgreSQL 服务器

如果你使用自己的 PostgreSQL 服务器或 Tailscale PAM 沙箱，请跳到下一步。

如需快速本地测试，用 Docker 启动一个 PostgreSQL 服务器：

```shell
docker run --name tailscale-pam-postgres --rm \
  -e POSTGRES_PASSWORD=<your-database-password> \
  -d -p 5432:5432 postgres
```

把 `<your-database-password>` 替换为你自选的密码。这会在端口 `5432` 上启动一个 PostgreSQL 服务器，用户为 `postgres`，密码为你指定的值。

继续之前，先验证你能连接到它：

```shell
psql -h 127.0.0.1 -U postgres -d postgres
```

收到提示时，输入你指定的密码。

连接后，运行一条基本查询：

```sql
SELECT VERSION();
```

如果查询成功，说明你的 PostgreSQL 服务器已就绪。

如果 Tailscale PAM 连接器与 Docker 运行在同一台设备上，你在配置 PAM 服务时可以使用 `localhost` 和端口 `5432`。如果连接器运行在其他地方，请使用连接器能访问到的 IP 地址或主机名。

## 创建 PostgreSQL PAM 服务

创建一个数据库[服务][docs-pam-services]，并将其关联到你的连接器。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **PostgreSQL**。

5. 选择 **Continue**。

6. 为服务起一个名称。

   起一个便于用户在浏览可访问服务时辨认该数据库的名字。

7. （可选）为服务提供描述。

8. 选择 **Session Recording** 选项是启用还是禁用。

9. 选择能够访问你的 PostgreSQL 服务器的 Tailscale PAM 连接器。

10. 选择 **Continue**。

11. 在 **Upstream hostname** 中输入 PostgreSQL 服务器的主机名或 IP 地址。

12. 在 **Port** 中输入 PostgreSQL 端口。默认是 `5432`。

13. 在 **Authentication Type** 中选择 **Username and Password**。

14. 在 **Username** 中输入 Tailscale PAM 连接 PostgreSQL 应使用的用户名。

15. 在 **Password** 中输入该用户的密码。

    如果你使用的是本地 Docker 示例且连接器在同一设备上运行，则使用 `localhost`、端口 `5432`、用户名 `postgres`，以及你为 `<your-database-password>` 占位符设置的密码。

    如果你使用的是 Tailscale PAM 沙箱，请使用上文前提条件中的沙箱连接信息。如果你使用自己的 PostgreSQL 服务器，请输入该服务器的连接信息。

16. 选择 **Save**。

数据库服务创建完成后，你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 PostgreSQL 服务授予访问权限

在用户连接之前，确保有 Tailscale PAM [授权（grant）][docs-grants]让他们能访问该服务。例如，以下授权允许任何来源连接到 PAM 数据库服务：

```json
"grants": [
  {
    "src": ["*"],
    "dst": ["*"],
    "ip": ["*"],

    "app": {
      "tailscale.com/cap/pam": [
        {
          "version": "v1",

          "permissions": {
            "database": {}
          }
        }
      ]
    }
  }
]
```

> **警告：**
>
> 这是一条范围很宽的授权，适合入门使用。在生产环境中，你可以限制 `src` 和 `dst` 字段，以控制哪些用户、组、设备或标签可以访问特定服务。
>
> 你还可以定义更高级的数据库权限，例如只读访问。
>
> 更多 PAM 授权示例以及细粒度访问控制的信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 PostgreSQL 数据库

主要的连接方式是通过 Tailscale 客户端，它可以启动你惯用的 PostgreSQL 客户端。你也可以使用 Tailscale 的 [Border0 web 客户端](https://my.tailscale.com)完全从浏览器连接。

### 使用你惯用的 PostgreSQL 客户端连接

使用 Tailscale 客户端，可快速用设备上已安装的 PostgreSQL 客户端打开数据库。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 PostgreSQL 服务。
4. 选择你想使用的数据库客户端。

Tailscale 客户端会扫描你的设备，寻找知名的兼容 PostgreSQL 的数据库客户端，并列出它找到的客户端。选择其中一个即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的客户端。如果你惯用的数据库客户端不在列表中，可以直接打开它，使用 Tailscale PAM 服务的名称作为主机名、`5432` 作为端口。你无需了解或管理上游 PostgreSQL 凭证。

Tailscale PAM 使用你的 Tailscale 身份为连接授权，并代表你管理上游数据库连接。这意味着你可以继续使用熟悉的数据库工具，而无需 PostgreSQL 凭证。

例如，你可以使用标准的 `psql` 命令行客户端连接：

```shell
psql -h <service-name> -p 5432 -d <database-name>
```

把 `<service-name>` 替换为你的 PostgreSQL PAM 服务名称，把 `<database-name>` 替换为你要访问的数据库。如果你使用的是本地 Docker 示例，默认数据库是 `postgres`：

```shell
psql -h <service-name> -p 5432 -d postgres
```

### 从浏览器连接

你也可以使用基于 Web 的 PostgreSQL 客户端连接。浏览器客户端使用 WebAssembly（Wasm）直接在浏览器中运行 Tailscale 客户端，因此无需安装其他东西。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你想访问的 PostgreSQL 服务。
3. 选择右上角的 **Connect**，Tailscale PostgreSQL 浏览器客户端就会打开。
4. 如有提示，使用你的 Tailscale 身份进行认证。

现在你可以直接从浏览器对 PostgreSQL 数据库执行查询了。

浏览器客户端在你的 tailnet 中显示为一台[临时（ephemeral）][docs-ephemeral-nodes]设备。如果 tailnet 启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 保护上游凭证

在上面的示例中，上游 PostgreSQL 的用户名和密码作为 PAM 服务配置的一部分保存。Tailscale 以加密形式存储这些凭证，但对于生产环境，我们建议尽量把上游凭证保留在连接器本地。

你可以把连接器配置为从受支持的密钥源动态加载凭证，而不是把凭证直接存储在服务配置中。例如，可以从环境变量、本地文件或密钥管理系统加载凭证。

更多信息参见[管理密钥与凭证][docs-pam-manage-secrets]。

默认情况下，Tailscale PAM 会尝试使用 TLS 建立连接器与上游 PostgreSQL 服务器之间的连接。如果 PostgreSQL 服务器不支持 TLS，连接会回退为非 TLS 连接。

## 查看会话详情与录制

Tailscale PAM 让你清楚了解与 PostgreSQL 服务的连接情况。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 PostgreSQL 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 被访问的服务。

启用会话录制后，你还可以查看该会话的 SQL 查询。

这能直接回答两个很有用的问题：谁访问了数据库？他们在里面做了什么？

## 故障排查

如果你无法连接 PostgreSQL 服务，最常见的问题是连接器无法连接上游数据库。

首先，确认连接器在线且能访问 PostgreSQL 的主机名和端口。同时验证服务配置中的用户名和密码有效。

如果你使用的是 Docker 示例，请记住 `localhost` 指的是运行连接器的设备。如果连接器运行在其他设备上，请使用从该设备可达的主机名或 IP 地址。

如果以上排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-pam-session-logs]中失败会话的详情。失败的会话通常包含连接无法建立的原因，这有助于判断问题出在网络连通性、认证还是上游数据库本身。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
