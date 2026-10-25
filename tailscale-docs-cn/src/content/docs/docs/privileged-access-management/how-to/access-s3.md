---
title: "使用 Tailscale PAM 访问 Amazon S3 存储桶"
description: "[Tailscale PAM][docs-pam] 让用户以[基于身份][docs-tailscale-identity]的方式访问 Amazon S3，而无需你向每个用户分发 AWS 凭证。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户以[基于身份][docs-tailscale-identity]的方式访问 Amazon S3，而无需你向每个用户分发 AWS 凭证。

Tailscale PAM [连接器][docs-pam-connectors]会向 AWS 进行身份验证，并代表用户发送 S3 API 请求。用户使用自己的 Tailscale 身份访问 S3，而 tailnet 访问策略中的 Tailscale PAM [授权（grant）][docs-grants]则控制他们可以使用哪些存储桶、路径和操作。

用户可以在 Tailscale 浏览器客户端中浏览 S3，也可以继续使用熟悉的工具，例如 AWS CLI 和其他 S3 兼容客户端。这让用户能以更简单的方式使用 S3，同时把 AWS 凭证保留在连接器一侧，并为管理员提供集中式的访问控制和可见性。

## S3 访问的工作原理

PAM 连接器充当用户与 Amazon S3 之间的代理。

当用户发起 S3 请求时，Tailscale PAM 会在连接器把请求发送到 AWS 之前，检查该请求是否被该用户的 PAM 授权所允许。连接器的 AWS 身份也必须拥有执行所请求操作的权限。

这意味着会有两层访问控制生效：

* **AWS IAM** 控制连接器能在 S3 中做什么。
* **Tailscale PAM 授权**控制各个用户和用户组能通过该服务做什么。

Tailscale PAM 可以收窄用户可用的权限，但无法提供连接器的 AWS 身份本身不具备的访问能力。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一个连接器可用来访问 S3 的 AWS 身份。
* 你想开放的存储桶和操作所需的 AWS IAM 权限。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

## 创建 Amazon S3 PAM 服务

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **AWS S3**。

5. 选择**继续**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. 在**通过以下方式连接**中，选择一个或多个 Tailscale PAM 连接器。

   选择一个能向 AWS 进行身份验证并访问 S3 API 的连接器。

10. 选择**继续**。

11. （可选）配置可通过该服务访问的存储桶，以及连接器如何向 AWS 进行身份验证。在**存储桶允许列表**下，选择**添加存储桶**，并为要创建的每个存储桶设置输入存储桶名称或模式。例如，可以使用如下存储桶名称：

    ```shell
    production-artifacts
    ```

    也可以在存储桶模式中使用通配符，例如：

    ```shell
    production-*
    ```

    如果允许列表留空，该服务可以开放连接器的 AWS 身份可访问的任何 S3 存储桶。连接器的 AWS IAM 权限仍然生效。

    之后你可以使用 Tailscale PAM 授权对单个用户施加更具体的限制，包括对存储桶内路径的限制。

12. 在 **AWS 身份验证策略**中，选择连接器向 AWS 进行身份验证的方式。从以下选项中选择：

    * **默认凭证提供程序链**使用连接器环境中已有的凭证。如果连接器运行在 AWS 中，可以使用分配给实例或工作负载的 IAM 角色。
    * **AWS profile** 使用连接器环境中可用的 AWS profile。
    * **静态凭证**使用为该服务配置的 AWS 访问密钥和秘密访问密钥。

    无论选择哪种方式，该 AWS 身份都需要拥有执行你希望用户也能通过该服务执行的 S3 操作的权限。

13. 选择**保存**。

## 为 S3 授予访问权限

使用 tailnet 访问策略中的 Tailscale PAM 授权来控制谁可以使用该服务。

例如，下面的授权让 `group:engineering` 用户组可以访问该 S3 服务：

```json
{
  "grants": [
    {
      "src": ["group:engineering"],
      "dst": ["svc:your-s3-service"],
      "ip": ["*"],
      "app": {
        "tailscale.com/cap/pam": [
          {
            "version": "v1",
            "permissions": {
              "aws_s3": {}
            }
          }
        ]
      }
    }
  ]
}
```

一个不做限制的 `aws_s3` 权限会把该服务与连接器 AWS 身份可用的 S3 操作全部开放。

关于编辑授权的更多信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

### 按存储桶、路径和操作控制访问

如需更细粒度的访问控制，S3 规则可以按以下维度限制用户：

* 存储桶。
* 对象路径。
* 操作：`list`、`read`、`write` 或 `delete`。

例如，下面的规则让用户对 `company-data` 存储桶中 `development/` 下的对象拥有只读访问权限：

```json
"aws_s3": {
  "rules": [
    {
      "buckets": ["company-data"],
      "paths": ["development/*"],
      "actions": ["list", "read"]
    }
  ]
}
```

当多个团队或环境共享一个存储桶时，这会很有用。连接器可以拥有访问该存储桶所需的 AWS 权限，而 Tailscale PAM 授权则决定每个用户能访问存储桶中的哪些部分。

配置了 S3 规则后，一个操作必须至少匹配一条规则才被允许。规则是累加式的，并支持使用通配符匹配存储桶和路径。

关于授权的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 访问 S3

用户可以通过 Tailscale 浏览器客户端或 S3 兼容客户端访问该服务。

### 使用 Tailscale 浏览器客户端

从 Tailscale PAM [Border0 web 客户端](https://my.tailscale.com)打开该 S3 服务，即可浏览你的 Tailscale 身份可用的存储桶和对象。

文件浏览器为用户提供了一种熟悉的方式来浏览 S3，无需配置 AWS 凭证或使用 AWS CLI。每个用户能读取什么、能做什么，都受其 Tailscale PAM 授权以及连接器可用的 AWS 权限的限制。原始的 S3 服务在设计上就同时支持基于浏览器的文件浏览器和原生 S3 工具。

### 使用 AWS CLI

你可以配置 AWS CLI（`aws`），让它通过 Tailscale PAM 服务发送 S3 请求。

创建一个类似如下的 profile：

```ini
[profile private-s3]
aws_access_key_id = unused_placeholder
aws_secret_access_key = unused_placeholder
endpoint_url = http://<your-service-hostname-or-ip>
addressing_style = path
```

把 `<your-service-hostname-or-ip>` 替换为你的 S3 PAM 服务的端点。

访问密钥和秘密密钥的值只是未使用的占位符，并不用于身份验证。AWS CLI 在发送请求前要求凭证必须存在，但在与 S3 通信时，连接器使用的是为 PAM 服务配置的 AWS 凭证。

在常规 AWS CLI 命令中使用该 profile：

```shell
aws --profile private-s3 s3 ls
```

或者：

```shell
AWS_PROFILE=private-s3 aws s3 ls
```

你可以继续使用常规的 S3 命令。一个操作能否成功，取决于用户的 PAM 权限和连接器的 AWS IAM 权限两者。

## 查看 S3 会话

Tailscale PAM 为你提供了一个集中位置，用于查看谁访问了你的 S3 服务。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择一个 S3 会话，即可查看有关用户、来源设备、连接时间和所访问服务的信息。

启用会话录制后，你还可以查看通过该服务执行的 S3 活动。这为你提供了谁访问了 S3、执行了哪些 S3 操作的审计线索，让你能够查看谁访问了哪些文件。

## 故障排查

如果你无法访问某个 S3 服务，请检查连接器能否向 AWS 进行身份验证，以及其 AWS 身份能否执行所请求的操作。

如果你能访问 S3 服务但无法访问某个特定存储桶：

* 确认你已经使用**存储桶允许列表**选项添加了该存储桶。
* 确认该用户的 Tailscale PAM 授权允许所请求的存储桶、路径和操作。

### AWS CLI 找不到凭证

如果 AWS CLI 返回：

```shell
Unable to locate credentials. You can configure credentials by running "aws configure".
```

请确保你的本地 profile 中两个字段都填了占位值：

```ini
aws_access_key_id = unused_placeholder
aws_secret_access_key = unused_placeholder
```

AWS CLI 在发送请求前要求凭证必须已配置，即使这些 `unused_placeholder` 值并不用于向上游 S3 服务进行身份验证。

### 存储桶前缀下的对象不可见

如果你在存储桶内使用前缀来区分环境或团队，请确保连接器拥有列出该存储桶所需的足够 AWS IAM 权限。

然后你可以使用 Tailscale PAM 授权来限制单个用户可访问的路径。例如：

```json
"paths": ["development/*"]
```

这样连接器可以列出整个存储桶，而 Tailscale PAM 则限制每个用户能看到哪些对象。

如果预期中的对象仍然没有出现，请同时检查连接器的 AWS 权限以及用户授权中的存储桶和路径模式。

### S3 操作被拒绝

两层授权都必须允许该操作。

例如，如果连接器的 AWS 身份缺少所需的 S3 写入权限，那么一条允许 `write` 操作的 Tailscale PAM 授权也无法让上传成功。同样，连接器上宽泛的 AWS IAM 权限也不能覆盖更严格的 Tailscale PAM 授权。

[docs-grants]: /docs/features/access-control/grants

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies
