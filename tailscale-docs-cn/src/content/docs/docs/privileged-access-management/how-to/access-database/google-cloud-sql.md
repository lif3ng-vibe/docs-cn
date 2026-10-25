---
title: "使用 Tailscale PAM 访问 Google Cloud SQL 数据库"
description: "[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Google Cloud SQL，而无需共享数据库凭证。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Google Cloud SQL，而无需共享数据库凭证。

你可以控制谁有权访问数据库、应用细粒度权限，并保留数据库会话的审计跟踪。用户可以继续使用自己惯用的数据库客户端，或直接从浏览器连接。

Tailscale PAM 支持运行 MySQL 或 PostgreSQL 的 Cloud SQL 实例。本指南的示例使用 MySQL，但同样的流程也适用于 PostgreSQL。配置有差异的地方我们会特别指出。

## 前提条件

开始之前，确保你具备以下条件：

* 一个已安装、在线且能访问 Cloud SQL 服务器的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果打算使用原生数据库客户端，你用来连接的设备上需已[安装][docs-install] Tailscale 并登录。
* 一个运行 MySQL 或 PostgreSQL 的 Google Cloud SQL 实例。
* 拥有配置该 Cloud SQL 实例及其 Google Cloud IAM 权限的权限。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

Tailscale PAM 可以使用实例的私有或公网 IP 地址直接连接 Cloud SQL，也可以使用内置的 Cloud SQL 连接器。

如果你的 Cloud SQL 实例使用私有 IP 地址，Tailscale PAM 连接器必须运行在能通过网络访问该私有 IP 的位置。Cloud SQL 连接器负责认证和加密，但它不会为私有 IP 实例创建网络路径。

## 选择 Cloud SQL 的连接方式

Tailscale PAM 连接器连接你的 Cloud SQL 实例有两种方式。

### 使用 Cloud SQL 连接器

内置的 Cloud SQL 连接器让 Tailscale PAM 使用你的 Cloud SQL 实例连接名进行连接，而不是直接连接其公网 IP 地址。

对于公网 IP 实例，这意味着你无需把 PAM 连接器的 IP 地址添加到 **Authorized networks**，也无需自行管理 SSL 证书。Cloud SQL 连接器负责加密，并使用 Google Cloud IAM 为连接授权。

PAM 连接器使用的 Google Cloud 身份必须有权连接该 Cloud SQL 实例。至少要授予它 **Cloud SQL Client**（`roles/cloudsql.client`）角色。同时确保项目已启用 Cloud SQL Admin API。

你还需要 Cloud SQL 实例连接名，其格式如下：

```shell
project-id:region:instance-id
```

例如：

```shell
my-project:us-central1:production-db
```

### 直接连接到 Cloud SQL 实例

你也可以使用实例的私有或公网 IP 地址直接连接。

对于私有 IP 实例，确保 PAM 连接器能通过私有网络访问该 Cloud SQL 实例。

对于公网 IP 实例，在 Cloud SQL 实例上启用公网 IP，并把运行 PAM 连接器的机器的公网 IP 地址添加到实例的 **Authorized networks** 中。

你可以使用数据库用户名和密码认证，也可以使用客户端证书和密钥配置 TLS 认证。

## 创建 Google Cloud SQL PAM 服务

Cloud SQL 实例就绪后，为它创建一个 PAM 服务。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **MySQL - Google Cloud SQL** 或 **PostgreSQL - Google Cloud SQL**。

5. 选择 **Continue**。

6. 输入服务名称。

   起一个便于用户在浏览可访问服务时辨认该数据库的名字。

7. （可选）为服务提供描述。

8. 选择是否启用会话录制。

9. 选择能够访问你的 Cloud SQL 服务器的 Tailscale PAM 连接器。

10. 选择 **Continue**。

11. 在 **Upstream hostname or IP** 中输入 Cloud SQL 服务器的主机名或 IP 地址。

12. 在 **Port** 中输入端口。

13. 配置 PAM 连接器应如何连接并向你的 Cloud SQL 实例认证。

    Cloud SQL 连接器使用 PAM 连接器可用的 Google Cloud 凭证建立连接。

    如果 PAM 连接器运行在 Google Compute Engine 虚拟机上，它可以使用的虚拟机关联的 Google Cloud Platform（GCP）服务账户，前提是该服务账户具有所需的 Cloud SQL 权限。

    #### 用户名和密码

    1. 在 **Authentication type** 中选择 **Username and Password**。
    2. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。
    3. 在 **Password** 中输入该用户名的密码。

    #### Cloud SQL 连接器

    要通过内置的 Cloud SQL 连接器使用你现有的数据库用户名和密码：

    1. 在 **Authentication type** 中选择 **Cloud SQL Connector**。
    2. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。
    3. 在 **Password** 中输入该用户名的密码。
    4. 在 **Cloud SQL instance** 中输入你的 Cloud SQL 实例连接名。
    5. （可选）在 **GCP credentials JSON** 中以 JSON 格式输入你的 GCP [服务账户密钥][xt-gcp-service-account-key]。

    #### 使用 IAM 的 Cloud SQL 连接器

    你可以使用 Google Cloud IAM 数据库认证，而无需在 PAM 服务中保存数据库密码：

    在配置 Tailscale PAM 服务之前，先在 Google Cloud 控制台中进行以下更改：

    1. 在 Cloud SQL 实例上启用 IAM 数据库认证。
    2. 把 Google Cloud IAM 用户或服务账户添加为数据库用户。
    3. 为该 IAM 主体授予 **Cloud SQL Instance User**（`roles/cloudsql.instanceUser`）角色。
    4. 为该 IAM 主体授予 **Cloud SQL Client**（`roles/cloudsql.client`）角色。
    5. 为该数据库用户授予所需的数据库权限。

    添加 IAM 数据库用户时，Cloud SQL 不会自动授予数据库权限，因此请确保在 MySQL 或 PostgreSQL 中授予相应权限。

    然后继续 Tailscale PAM 的设置：

    1. 在 **Authentication type** 中选择 **Cloud SQL Connector with IAM**。

    2. 在 **Username** 中输入 Tailscale PAM 应使用的 IAM 数据库用户名。

       IAM 数据库用户名的格式取决于数据库引擎：

       * **MySQL：**使用去掉 `@` 和域名的 IAM 用户名。对于服务账户，去掉 `@project-id.iam.gserviceaccount.com` 后缀。
       * **PostgreSQL：**使用 IAM 用户的完整电子邮件地址。对于服务账户，只去掉 `.gserviceaccount.com` 后缀。

       例如，名为 `pam-connector@my-project.iam.gserviceaccount.com` 的 PostgreSQL 服务账户，其数据库用户名为 `pam-connector@my-project.iam`。

    3. 在 **Cloud SQL instance** 中输入你的 Cloud SQL 实例连接名。

    4. （可选）在 **GCP credentials JSON** 中以 JSON 格式输入你的 GCP [服务账户密钥][xt-gcp-service-account-key]。

    #### TLS

    如果使用 TLS 认证，请提供为该 Cloud SQL 实例签发的客户端证书和私钥。你还可以提供用于验证服务器证书的证书颁发机构（CA）。

    1. 在 **Authentication type** 中选择 **TLS**。
    2. 在 **Username** 中输入 Tailscale PAM 应使用的数据库用户名。
    3. 在 **Password** 中输入该用户名的密码。
    4. 在 **Client TLS certificate** 中输入 PAM 连接器向上游服务出示、用于双向 TLS 的 PEM 编码客户端证书。如果填写此项，还必须为 **client TLS private key** 提供值。
    5. 在 **Client TLS private key** 中输入上述客户端 TLS 证书的 PEM 编码私钥。如果填写了 **Client TLS certificate**，此项为必填。
    6. （可选）在 **Server CA certificate** 中输入用于验证上游服务 TLS 证书的 PEM 编码 CA 证书。仅当你想在不用客户端 TLS 的情况下验证服务器证书时才使用此字段。你可以留空并跳过验证过程。

14. 选择 **Save**。

你的 Cloud SQL PAM 服务已创建。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 Cloud SQL 数据库授予访问权限

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

## 连接到 Cloud SQL 数据库

主要的连接方式是通过 Tailscale 客户端，它可以启动你惯用的 Cloud SQL 客户端。你也可以使用 Tailscale 浏览器客户端完全从浏览器连接。

### 使用你惯用的 Cloud SQL 客户端连接

使用 Tailscale 客户端，可快速用设备上已安装的 Cloud SQL 客户端打开数据库。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 Cloud SQL 服务。
4. 选择你想使用的数据库客户端。

Tailscale 客户端会扫描你的设备，寻找与该数据库引擎兼容的知名客户端，并列出它找到的客户端。选择其中一个即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的客户端。如果你惯用的数据库客户端不在列表中，可以直接打开它，并使用 Tailscale PAM 服务的名称作为主机名。

对于 MySQL Cloud SQL 服务，使用端口 `3306`，并把用户名和密码留空：

```shell
mysql -h <service-name> -P 3306 --protocol TCP
```

对于 PostgreSQL Cloud SQL 服务，使用端口 `5432`：

```shell
psql -h <service-name> -p 5432 -d <database-name>
```

把 `<service-name>` 替换为你的 Cloud SQL PAM 服务名称，把 `<database-name>` 替换为你的数据库名称。

Tailscale PAM 使用你的 Tailscale 身份为连接授权，并代表你管理上游 Cloud SQL 连接。你无需了解或管理上游数据库凭证。

### 从浏览器连接

你也可以使用基于 Web 的数据库客户端连接。浏览器客户端使用 WebAssembly（Wasm）直接在浏览器中运行 Tailscale 客户端，因此无需安装其他东西。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你想访问的 Cloud SQL 服务。
3. 选择右上角的 **Connect**。
4. Tailscale 数据库浏览器客户端会打开。
5. 如有提示，使用你的 Tailscale 身份进行认证。

现在你可以直接从浏览器对 Cloud SQL 数据库执行查询了。

浏览器客户端在你的 tailnet 中显示为一台 Tailscale 设备。如果启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 保护上游凭证

如果你的 Cloud SQL 服务使用数据库用户名和密码，这些凭证可以作为 PAM 服务配置的一部分保存。Tailscale 以加密形式存储这些凭证，但对于生产环境，我们建议尽量把上游凭证保留在连接器本地。

你可以把连接器配置为从受支持的密钥源动态加载凭证，而不是把凭证直接存储在服务配置中。例如，可以从环境变量、本地文件或密钥管理系统加载凭证。

更多信息参见[管理密钥与凭证][docs-pam-manage-secrets]。

如果你使用带 IAM 数据库认证的 Cloud SQL 连接器，则无需存储静态数据库密码。Cloud SQL 连接器会使用 PAM 连接器可用的 Google Cloud 身份处理 IAM 数据库认证。

## 查看会话详情与录制

Tailscale PAM 让你清楚了解与 Cloud SQL 服务的连接情况。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 Cloud SQL 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 被访问的服务。

启用会话录制后，你还可以查看该会话的 SQL 查询。

这能直接回答两个很有用的问题：谁访问了数据库？他们在里面做了什么？

## 故障排查

如果你无法连接 Cloud SQL 服务，请先查看连接器日志以及 PAM 会话日志中的失败会话。

如果你是直连私有 IP 地址，确认 PAM 连接器能通过网络访问该 Cloud SQL 实例。

如果你是直连公网 IP 地址，验证 PAM 连接器的公网 IP 已包含在该 Cloud SQL 实例的 **Authorized networks** 中。

如果你使用 Cloud SQL 连接器，确认：

* 已启用 Cloud SQL Admin API。
* 实例连接名正确。
* PAM 连接器使用的 Google Cloud 身份拥有 **Cloud SQL Client** 角色。
* PAM 连接器能通过 TCP 端口 `443` 和 `3307` 发起出站连接。Cloud SQL 连接器使用端口 `443` 访问 Google API，使用端口 `3307` 连接 Cloud SQL 实例。

如果你使用 IAM 数据库认证，还要确认实例已启用 IAM 数据库认证、该 IAM 主体拥有 **Cloud SQL Instance User** 角色、对应的数据库用户存在，且该用户拥有所需的数据库权限。

如果以上排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-pam-session-logs]中失败会话的详情。失败的 PAM 会话通常包含连接无法建立的原因，这有助于判断问题出在网络连通性、Google Cloud IAM 权限、数据库认证还是上游 Cloud SQL 实例本身。

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

[xt-gcp-service-account-key]: https://docs.cloud.google.com/iam/docs/service-account-creds#key-types
