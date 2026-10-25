---
title: "使用 Tailscale PAM 访问 Microsoft SQL Server 数据库"
description: "[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Microsoft SQL Server，而无需共享数据库凭证。"
---

最后验证于 Sep 25, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Microsoft SQL Server，而无需共享数据库凭证。

你可以控制谁有权访问数据库、应用细粒度权限，并保留数据库会话的审计跟踪。用户可以继续使用自己惯用的数据库客户端，或直接从浏览器连接。

本指南带你创建 SQL Server 服务、连接该服务并查看产生的会话活动。

## 前提条件

开始之前，确保你具备以下条件：

* 一个已安装、在线且能访问 SQL Server 实例的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果打算使用原生数据库客户端，你用来连接的设备上需已[安装][docs-install] Tailscale 并登录。
* 一个 SQL Server 实例。
* 你的 SQL Server 实例的端点和端口。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

## 选择认证方式

Tailscale PAM 支持两种向上游 SQL Server 数据库认证的方式：

* **SQL Server Authentication**：连接器使用数据库用户名和密码。
* **Kerberos**：连接器使用 Kerberos 认证。关于在 SQL Server 中使用 Kerberos 的信息，参见 Microsoft 的 [Register a Service Principal Name for Kerberos connections][xt-microsoft-sql-kerberos] 主题。

## 创建 SQL Server PAM 服务

SQL Server 实例就绪后，为它创建一个 PAM 服务。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **Microsoft SQL Server**。

5. 选择 **Continue**。

6. 输入服务名称。

   起一个便于用户在浏览可用服务时辨认的名字。

7. （可选）为服务提供一个显示名称。

8. （可选）为服务提供描述。

9. 选择是否启用会话录制。

10. 选择能够访问你的 SQL Server 实例的 Tailscale PAM 连接器。

11. 选择 **Continue**。

12. 在 **Upstream hostname or IP** 中输入 SQL Server 端点。

13. 在 **Port** 中输入默认值 `1433`，或按你的环境需要输入其他值。

14. 在 **Authentication type** 中选择 PAM 连接器应如何连接并向你的 SQL Server 实例认证。

15. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。

16. 在 **Password** 中输入该数据库用户的密码。

17. （可选）在 **Server CA certificate** 中输入用于验证上游服务 TLS 证书的 PEM 编码证书颁发机构（CA）证书；也可以将此字段留空以跳过证书验证。如果跳过验证，连接仍会用 TLS 加密，但 Tailscale PAM 不会验证上游服务的身份。这会增加连到冒名服务或中间人攻击者的风险。

你的 Microsoft SQL PAM 服务已创建。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 SQL Server 数据库授予访问权限

在用户尝试连接之前，确保有 Tailscale PAM [授权让他们能访问][docs-pam-control-access]该服务。Tailscale PAM 使用你的 tailnet 访问策略来决定哪些用户、组、设备或标签可以连接该服务。

例如，以下授权允许任何来源连接到 PAM 数据库服务：

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

> **危险：**
>
> tailnet 策略文件中的[允许的查询类型][docs-pam-control-access-database]数据库权限所定义的查询级访问控制，目前不支持 Microsoft SQL Server。为 Microsoft SQL Server 配置访问控制时，不要依赖该功能。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 SQL Server 数据库

主要的连接方式是通过 Tailscale 客户端，它可以启动你惯用的数据库客户端。你也可以使用 Tailscale 浏览器客户端完全从浏览器连接。

### 使用你惯用的 SQL Server 客户端连接

使用 Tailscale 客户端，可用设备上已安装的兼容数据库客户端打开数据库。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 SQL Server 服务。
4. 选择你想使用的数据库客户端。

Tailscale 客户端会扫描你的设备，寻找与该数据库引擎兼容的知名客户端，并列出它找到的客户端。选择其中一个即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的客户端。如果你惯用的数据库客户端不在列表中，可以直接打开它，并使用 Tailscale PAM 服务的名称作为主机名。

例如，你可以使用 SQL Server 命令行客户端 `sqlcmd` 连接：

```shell
sqlcmd -S <service-name>,<port> -Q "SELECT @@VERSION AS 'SQL_Server_Version';"
```

把 `<service-name>` 替换为你的 SQL Server PAM 服务名称，把 `<port>` 替换为端口。如果你想访问特定数据库，可以在命令行中用 `-d <database-name>` 传入：

```shell
sqlcmd -S <service-name>,<port> -d <database-name> -Q "SELECT @@VERSION AS 'SQL_Server_Version';"
```

把 `<database-name>` 替换为你的数据库名称。

Tailscale PAM 使用你的 Tailscale 身份为连接授权，并代表你处理上游认证。你无需了解或管理上游数据库凭证。

### 从浏览器连接

你也可以使用基于 Web 的数据库客户端连接。浏览器客户端使用 WebAssembly（Wasm）直接在浏览器中运行 Tailscale 客户端，因此无需安装其他东西。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你想访问的 SQL Server 服务。
3. 选择右上角的 **Connect**，Tailscale 数据库浏览器客户端就会打开。
4. 如有提示，使用你的 Tailscale 身份进行认证。

现在你可以直接从浏览器对 SQL Server 数据库执行查询了。

浏览器客户端在你的 tailnet 中显示为一台 Tailscale 设备。如果启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 保护上游凭证

如果你的数据库服务使用密码认证，上游数据库用户名和密码可以作为 PAM 服务配置的一部分保存。Tailscale 以加密形式存储这些凭证，但对于生产环境，我们建议尽量把上游凭证保留在连接器本地。

你可以把连接器配置为从受支持的密钥源动态加载凭证，而不是把凭证直接存储在服务配置中。例如，可以从环境变量或其他受支持的密钥管理系统加载凭证。

更多信息参见[管理密钥与凭证][docs-pam-manage-secrets]。

## 查看会话详情与录制

Tailscale PAM 让你清楚了解与 SQL Server 服务的连接情况。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 SQL Server 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 被访问的服务。

启用会话录制后，你还可以查看该会话的 SQL 查询。

这能直接回答两个很有用的问题：谁访问了数据库？他们在里面做了什么？

## 故障排查

如果你无法连接 SQL Server 服务，首先确认 PAM 连接器能访问 SQL Server 端点和数据库端口。

对于密码认证，验证 PAM 服务配置中的数据库用户名和密码有效。

如果以上排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-pam-session-logs]中失败会话的详情。失败的会话通常包含连接无法建立的原因，这有助于判断问题出在网络连通性、数据库认证还是 SQL Server 实例本身。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access-database]: /docs/privileged-access-management/how-to/control-access#控制数据库访问

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-microsoft-sql-kerberos]: https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/register-a-service-principal-name-for-kerberos-connections
