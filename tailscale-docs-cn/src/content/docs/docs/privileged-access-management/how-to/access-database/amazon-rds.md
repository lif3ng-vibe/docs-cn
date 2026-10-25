---
title: "使用 Tailscale PAM 访问 Amazon RDS 数据库"
description: "[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Amazon Relational Database Service（RDS），而无需共享数据库凭证。"
---

最后验证于 Sep 2, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Amazon Relational Database Service（RDS），而无需共享数据库凭证。

你可以控制谁有权访问数据库、应用细粒度权限，并保留数据库会话的审计跟踪。用户可以继续使用自己惯用的数据库客户端，或直接从浏览器连接。

本指南聚焦于 Amazon RDS for MySQL 和 PostgreSQL，带你创建 RDS PAM 服务、连接该服务并查看产生的会话活动。

## 前提条件

开始之前，确保你具备以下条件：

* 一个已安装、在线且能访问 RDS 实例的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果打算使用原生数据库客户端，你用来连接的设备上需已[安装][docs-install] Tailscale 并登录。
* 一个运行 MySQL 或 PostgreSQL 的 Amazon RDS 实例。
* 你的 RDS 实例的端点和端口。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

PAM 连接器必须能通过网络访问 RDS 实例。对于私有 RDS 实例，你可以在 Elastic Compute Cloud（EC2）实例或其他能访问 Amazon Virtual Private Cloud（VPC）的设备上运行连接器。如果你的 RDS 实例可公开访问，连接器可以在 VPC 之外运行，只要 RDS 安全组允许该连接。

## 选择认证方式

Tailscale PAM 支持两种向上游 RDS 数据库认证的方式：

* **密码认证**：连接器使用数据库用户名和密码。
* **IAM 数据库认证**：连接器使用 Amazon Web Services（AWS）身份向 RDS 认证，无需保存数据库密码。

### 使用密码认证

密码认证的工作方式与普通 MySQL 或 PostgreSQL PAM 服务相同。

你需要：

* RDS 端点。
* 数据库端口。MySQL 的默认端口是 `3306`；PostgreSQL 的默认端口是 `5432`。
* 一个数据库用户名。
* 该数据库用户的密码。

如果你使用密码认证，可以直接跳到[创建 Amazon RDS PAM 服务][ar-create-service]。

### 使用 IAM 数据库认证

Amazon RDS IAM 数据库认证让 PAM 连接器使用 AWS 身份认证，而不是静态数据库密码。

如果你使用 IAM 数据库认证，请在你的 AWS 环境中执行以下操作：

1. 为你的 RDS 实例启用 **IAM database authentication**。

2. 创建一个可以用 IAM 认证的数据库用户。

   对于 RDS for MySQL，用一个能创建数据库用户的用户连接，并运行：

   ```sql
   CREATE USER 'tailscale_pam' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```

   然后为该用户授予所需的数据库权限。

   对于 RDS for PostgreSQL，创建用户并授予 `rds_iam` 角色：

   ```sql
   CREATE USER tailscale_pam;
   GRANT rds_iam TO tailscale_pam;
   ```

3. 为该数据库用户授予所需的其他数据库权限。

   Tailscale PAM 连接器使用的 AWS 身份还必须有权以该数据库用户的身份连接。例如：

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "rds-db:connect",
         "Resource": "arn:aws:rds-db:<region>:<account-id>:dbuser:<db-resource-id>/tailscale_pam"
       }
     ]
   }
   ```

   把 `<region>`、`<account-id>` 和 `<db-resource-id>` 替换为你 RDS 实例的实际值。

PAM 连接器使用其环境中可用的 AWS 凭证。如果连接器运行在 EC2 上，最简单的方式是使用挂接到实例的 IAM 角色。你也可以通过标准 AWS 配置或环境变量提供 AWS 凭证。

## 创建 Amazon RDS PAM 服务

RDS 实例就绪后，为它创建一个 PAM 服务。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **MySQL - AWS RDS** 或 **PostgreSQL - AWS RDS**。

5. 选择 **Continue**。

6. 输入服务名称。

   起一个便于用户在浏览可访问服务时辨认该数据库的名字。

7. （可选）为服务提供描述。

8. 选择是否启用会话录制。

9. 选择能够访问你的 RDS 实例的 Tailscale PAM 连接器。

10. 选择 **Continue**。

11. 在 **Upstream hostname or IP** 中输入 RDS 端点。

12. 在 **Port** 中输入 MySQL 的 `3306` 或 PostgreSQL 的 `5432`。

13. 配置 PAM 连接器应如何连接并向你的 RDS 实例认证。

    #### 用户名和密码

    1. 在 **Authentication type** 中选择 **Username and Password**。
    2. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。
    3. 在 **Password** 中输入该数据库用户的密码。
    4. （可选）在 **Server CA certificate** 中输入用于验证上游服务 TLS 证书的 PEM 编码证书颁发机构（CA）证书。你必须提供 CA 证书来验证上游的证书，也可以留空并跳过验证过程。

    #### IAM

    1. 在 **Authentication type** 中选择 **IAM**。
    2. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。
    3. （可选）在 **Server CA certificate** 中输入用于验证上游服务 TLS 证书的 PEM 编码证书颁发机构（CA）证书。你必须提供 CA 证书来验证上游的证书，也可以留空并跳过验证过程。
    4. 在 **RDS instance region** 中选择你的 RDS 实例所在区域。
    5. 在 **AWS authentication strategy** 中选择连接器向 AWS 认证的方式。

14. 选择 **Save**。

你的 Amazon RDS PAM 服务已创建。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 Amazon RDS 数据库授予访问权限

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

你还可以定义更高级的数据库权限，例如只读访问。

更多 PAM 授权示例以及细粒度访问控制的信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 Amazon RDS 数据库

主要的连接方式是通过 Tailscale 客户端，它可以启动你惯用的数据库客户端。你也可以使用 Tailscale 浏览器客户端完全从浏览器连接。

### 使用你惯用的 Amazon RDS 客户端连接

使用 Tailscale 客户端，可快速用设备上已安装的兼容数据库客户端打开数据库。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 Amazon RDS 服务。
4. 选择你想使用的数据库客户端。

Tailscale 客户端会扫描你的设备，寻找与该数据库引擎兼容的知名客户端，并列出它找到的客户端。选择其中一个即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的客户端。如果你惯用的数据库客户端不在列表中，可以直接打开它，并使用 Tailscale PAM 服务的名称作为主机名。

对于 RDS for MySQL 服务，你可以使用标准的 MySQL 命令行客户端连接：

```shell
mysql -h <service-name> -P 3306 --protocol TCP
```

对于 RDS for PostgreSQL 服务，你可以使用 `psql`：

```shell
psql -h <service-name> -p 5432 -d <database-name>
```

把 `<service-name>` 替换为你的 Amazon RDS PAM 服务名称，把 `<database-name>` 替换为你的数据库名称。

Tailscale PAM 使用你的 Tailscale 身份为连接授权，并代表你管理上游 RDS 连接。你无需了解或管理上游数据库凭证。

### 从浏览器连接

你也可以使用基于 Web 的数据库客户端连接。浏览器客户端使用 WebAssembly（Wasm）直接在浏览器中运行 Tailscale 客户端，因此无需安装其他东西。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你想访问的 Amazon RDS 服务。
3. 选择右上角的 **Connect**，Tailscale 数据库浏览器客户端就会打开。
4. 如有提示，使用你的 Tailscale 身份进行认证。

现在你可以直接从浏览器对 Amazon RDS 数据库执行查询了。

浏览器客户端在你的 tailnet 中显示为一台 Tailscale 设备。如果启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 保护上游凭证

如果你的 RDS 服务使用密码认证，上游数据库用户名和密码可以作为 PAM 服务配置的一部分保存。Tailscale 以加密形式存储这些凭证，但对于生产环境，我们建议尽量把上游凭证保留在连接器本地。

你可以把连接器配置为从受支持的密钥源动态加载凭证，而不是把凭证直接存储在服务配置中。例如，可以从环境变量、AWS Systems Manager Parameter Store、AWS Secrets Manager、本地文件或其他受支持的密钥管理系统加载凭证。

更多信息参见[管理密钥与凭证][docs-pam-manage-secrets]。

如果你使用 IAM 数据库认证，则无需存储静态数据库密码。Tailscale PAM 使用连接器可用的 AWS 身份向 RDS 认证。

RDS IAM 数据库认证对上游数据库的连接使用 TLS。

## 查看会话详情与录制

Tailscale PAM 让你清楚了解与 Amazon RDS 服务的连接情况。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 RDS 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 被访问的服务。

启用会话录制后，你还可以查看该会话的 SQL 查询。

这能直接回答两个很有用的问题：谁访问了数据库？他们在里面做了什么？

## 故障排查

如果你无法连接 Amazon RDS 服务，首先确认 PAM 连接器能访问 RDS 端点和数据库端口。

对于私有 RDS 实例，验证连接器能通过网络访问该 VPC，且 RDS 安全组允许来自连接器的连接。

对于密码认证，验证 PAM 服务配置中的数据库用户名和密码有效。

对于 IAM 数据库认证，验证：

* RDS 实例已启用 IAM 数据库认证。
* 数据库用户已配置为 IAM 认证。
* 连接器使用的 AWS 身份对该数据库用户具有 `rds-db:connect` 权限。
* 连接器拥有有效的 AWS 凭证，且配置了正确的 AWS 区域。

如果以上排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-pam-session-logs]中失败会话的详情。失败的会话通常包含连接无法建立的原因，这有助于判断问题出在网络连通性、AWS IAM 权限、数据库认证还是 RDS 实例本身。

[ar-create-service]: #创建-amazon-rds-pam-服务

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
