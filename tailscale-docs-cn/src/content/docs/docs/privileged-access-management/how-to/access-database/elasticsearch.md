---
title: "使用 Tailscale PAM 访问 Elasticsearch 服务器"
description: "[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Elasticsearch，而无需共享 Elasticsearch 凭证。"
---

最后验证于 Aug 21, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用其 [Tailscale 身份][docs-tailscale-identity]连接 Elasticsearch，而无需共享 Elasticsearch 凭证。

你可以控制谁有权访问 Elasticsearch 服务器，并保留会话和查询的审计跟踪。用户可以继续使用熟悉的工具，例如 `curl` 或其他兼容 Elasticsearch 的客户端。

本指南带你创建 Elasticsearch PAM 服务、连接该服务并查看产生的会话活动。

## 前提条件

开始之前，确认你具备以下条件：

* 一个已安装、在线且能访问 Elasticsearch 服务器的 Tailscale PAM [连接器][docs-pam-connectors]。
* 你用来连接的设备上已[安装][docs-install] Tailscale 并登录。
* 连接器能够访问的一台 Elasticsearch 服务器。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

你可以使用自己的 Elasticsearch 服务器，也可以用 Docker 运行一个本地 Elasticsearch 服务器。

如果使用自己的 Elasticsearch 服务器，你需要它的主机名或 IP 地址、端口、用户名和密码。

## 用 Docker 运行本地 Elasticsearch 服务器

如果你使用自己的 Elasticsearch 服务器或 Tailscale PAM 沙箱，请跳到下一步。

如需快速本地测试，用 Docker 启动一个单节点 Elasticsearch 服务器：

```shell
docker run --name tailscale-pam-elasticsearch --rm \
  -d -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ELASTIC_PASSWORD=<your-database-password>" \
  docker.elastic.co/elasticsearch/elasticsearch:9.4.4
```

把 `<your-database-password>` 替换为你自选的密码。

Elastic 在其容器镜像仓库中发布 Elasticsearch Docker 镜像。本示例使用 Elasticsearch 9.4.4。

这会启动一个单节点 Elasticsearch 服务器，用户为 `elastic`，密码为你为 `<your-database-password>` 设置的值。

继续之前，先验证你能连接到它：

```shell
curl -k -u elastic:<your-database-password> https://localhost:9200
```

如果 Elasticsearch 返回了集群信息，说明服务器已就绪。

如果 Tailscale PAM 连接器与 Docker 运行在同一台设备上，你在配置 PAM 服务时可以使用 `localhost` 和端口 `9200`。如果连接器运行在其他地方，请使用连接器能访问到的 IP 地址或主机名。

## 创建 Elasticsearch PAM 服务

为你的 Elasticsearch 服务器创建 PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **Elasticsearch**。

5. 选择 **Continue**。

6. 为服务起一个名称。

   起一个便于用户在浏览可访问服务时辨认该数据库的名字。

7. （可选）为服务提供一个显示名称。

8. （可选）为服务提供描述。

9. 选择 **Session Recording** 选项是启用还是禁用。

10. 选择能够访问你的 Elasticsearch 服务器的 Tailscale PAM 连接器。

11. 选择 **Continue**。

12. 在 **Upstream hostname** 中输入 Elasticsearch 服务器的主机名或 IP 地址。

13. 在 **Port** 中输入 Elasticsearch 端口。默认是 `9200`。

14. 在 **Protocol** 中选择 **HTTP** 或 **HTTPS**。

15. 在 **Authentication type** 中选择 **Basic Auth**。

    Tailscale PAM 目前对上游 Elasticsearch 连接使用 HTTP Basic 认证。

    如果你使用的是本地 Docker 示例且连接器在同一设备上运行，则使用 `localhost`、端口 `9200`、用户名 `elastic` 和你的数据库密码。

    如果你使用自己的 Elasticsearch 服务器，请输入该服务器的连接信息和凭证。

16. 在 **Username** 中输入 Tailscale PAM 连接 Elasticsearch 应使用的用户名。

17. 在 **Password** 中输入该用户的密码。

18. 选择 **Save**。

你的数据库服务已创建。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 Elasticsearch 服务授予访问权限

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

与 MySQL 和 PostgreSQL PAM 服务不同，Tailscale PAM 中的 Elasticsearch 服务目前不支持查询级授权或索引级限制。用户获得服务访问权后，Tailscale PAM 不会限制他们可以提交哪些 Elasticsearch 查询、可以访问哪些索引。

要限制用户连接后能做什么，请为上游 Elasticsearch 用户配置合适的 Elasticsearch 角色和索引权限。

关于控制 PAM 服务访问的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 Elasticsearch 服务器

主要的连接方式是通过 Tailscale 客户端，然后使用 `curl` 或你惯用的兼容 Elasticsearch 的客户端。

### 使用你惯用的 Elasticsearch 客户端连接

使用 Tailscale 客户端，可快速用设备上已安装的 Elasticsearch 客户端打开数据库。

1. 打开 Tailscale 客户端。
2. 选择 **Services**。
3. 选择你的 Elasticsearch 服务。
4. 在你的 Elasticsearch 客户端中，使用该服务的名称作为主机名。

例如，你可以使用 `curl` 连接：

```shell
curl http://<service-name>:9200
```

把 `<service-name>` 替换为你的 Elasticsearch PAM 服务名称。

你无需提供上游 Elasticsearch 的用户名或密码。Tailscale PAM 使用你的 Tailscale 身份为连接授权，并代表你处理上游 Elasticsearch 认证。

例如，你可以添加一个文档：

```shell
curl -X POST "http://<service-name>:9200/my_index/_doc/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "Elasticsearch is cool!"
  }'
```

然后查询该索引：

```shell
curl "http://<service-name>:9200/my_index/_search?q=title:Hello"
```

连接 Elasticsearch PAM 服务时使用 `http://`。你的设备与 Tailscale PAM 连接器之间的流量受 WireGuard 保护，因此连接 PAM 服务的客户端一侧无需使用 HTTPS。

### 从浏览器连接

由于 Elasticsearch 暴露了 HTTP API，你也可以在连接了 Tailscale 的设备上直接从浏览器发起基本请求。

例如，打开 `http://<service-name>:9200`。

对于查询、索引和其他 API 操作，请使用 `curl` 或其他兼容 Elasticsearch 的客户端。

## 保护上游凭证

在上面的示例中，上游 Elasticsearch 的用户名和密码作为 PAM 服务配置的一部分保存。Tailscale 以加密形式存储这些凭证，但对于生产环境，我们建议尽量把上游凭证保留在连接器本地。

你可以把连接器配置为从受支持的密钥源动态加载凭证，而不是把凭证直接存储在服务配置中。例如，可以从环境变量、本地文件或密钥管理系统加载凭证。

更多信息参见[管理密钥与凭证][docs-pam-manage-secrets]。

由于 Tailscale PAM 目前不为 Elasticsearch 强制执行查询级或索引级权限，请考虑使用专用的上游 Elasticsearch 用户，而不是高特权账户。通过 Elasticsearch 角色让该用户只能访问它需要的索引和操作。

## 查看会话详情与录制

Tailscale PAM 让你清楚了解与 Elasticsearch 服务的连接情况。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 Elasticsearch 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 被访问的服务。

启用会话录制后，你还可以查看该会话的 Elasticsearch 查询。

这能直接回答两个很有用的问题：谁访问了 Elasticsearch 服务器？他们在里面做了什么？

## 故障排查

如果你无法连接 Elasticsearch 服务，最常见的问题是连接器无法连接上游 Elasticsearch 服务器。

首先，确认连接器在线且能访问 Elasticsearch 的主机名和端口。同时验证服务配置中的用户名和密码有效。

如果你使用的是 Docker 示例，请记住 `localhost` 指的是运行连接器的设备。如果连接器运行在其他设备上，请使用从该设备可达的主机名或 IP 地址。

你也可以在运行连接器的设备上直接测试与上游服务器的连通性。对于 Docker 示例：

```shell
curl -k -u elastic:<your-database-password> https://localhost:9200
```

如果以上排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-pam-session-logs]中失败会话的详情。失败的会话通常包含连接无法建立的原因，这有助于判断问题出在网络连通性、认证还是上游 Elasticsearch 服务器本身。

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
