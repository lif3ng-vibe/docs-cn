---
title: "将 Tailscale PAM 会话录制存储到 S3"
description: "默认情况下，[Tailscale PAM][docs-pam] 会替你存储会话录制。如果你希望自己控制录制数据的存放位置，可以把 Tailscale PAM 配置为使用你自有的 Amazon S3 存储桶。"
---

最后验证于 Aug 21, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

> **注意：** 自定义录制存储面向 [Premium 套餐](https://tailscale.com/pricing)开放。

默认情况下，[Tailscale PAM][docs-pam] 会替你存储会话录制。如果你希望自己控制录制数据的存放位置，可以把 Tailscale PAM 配置为使用你自有的 Amazon S3 存储桶。

使用自己的 S3 存储桶，你可以掌控会话录制的存储位置、保留策略和访问权限。Tailscale PAM 通过跨账户的 Amazon Web Services（AWS）IAM 角色访问你的存储桶，因此你无需向 Tailscale 提供 AWS 访问密钥或其他长期有效的 AWS 凭证。

目前，Amazon S3 是唯一受支持的自定义录制存储位置。

> **注意：**
>
> 更改录制存储位置不会迁移已有的录制。切换之后，存储在先前位置的录制将无法再在 Tailscale 管理控制台中回放。新的录制会存储到所配置的 S3 存储桶中。

## 录制存储的工作原理

当你配置自己的 S3 存储桶时：

1. Tailscale PAM 会话录制器捕获一个会话的活动。
2. 录制数据被发送到 Tailscale PAM API。
3. Tailscale PAM API 担任你在自己 AWS 账户中配置的 IAM 角色。
4. Tailscale PAM API 把录制写入你的 S3 存储桶。

你的 S3 存储桶是录制的存储位置，桶及其访问策略的所有权和控制权仍归你所有。

> **注意：**
>
> 使用自己的 S3 存储桶改变的是会话录制的存放位置，但录制在写入你的存储桶之前仍会经过 Tailscale PAM API。录制不会由 PAM 连接器直接上传到你的 S3 存储桶。
>
> 我们建议在允许 Tailscale PAM 写入存储桶的同时，也允许它读取。读取权限让 Tailscale PAM 能够在 Tailscale 管理控制台中展示会话录制和回放。如果你移除读取权限，Tailscale PAM 将无法在管理控制台中展示这些录制。

## 前提条件

开始之前，你需要：

* 一个 AWS 账户。
* 一个用于存储会话录制的 S3 存储桶。
* 在你的 AWS 账户中创建 IAM 策略和角色的权限。
* 你的 tailnet 的[所有者或管理员](/docs/reference/user-roles)角色，以便配置 PAM 录制存储设置。

你需要创建：

* 一个用于存放录制的 S3 存储桶。
* 一条授予该存储桶访问权限的 IAM 策略。
* 一个附加了该策略、可由 Tailscale PAM 担任的 IAM 角色。

## 创建 S3 存储桶

在你的 AWS 账户中创建一个 S3 存储桶，用于存储 Tailscale PAM 会话录制。

例如，创建一个名为 `my-pam-recordings` 的存储桶。

存储桶的配置由你掌控，包括保留策略、加密、生命周期规则，以及你想应用的任何其他访问控制。

## 创建 IAM 策略

创建一条 IAM 策略，允许 Tailscale PAM 向存储桶存储和取回录制。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}",
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ],
      "Effect": "Allow",
      "Sid": "AllowAccessS3Bucket"
    }
  ]
}
```

把 `${BUCKET_NAME}` 替换为你的 S3 存储桶名称。

`s3:GetObject` 权限让 Tailscale PAM 能取回录制，从而可以在 Tailscale 管理控制台中回放。

## 创建 IAM 角色

创建一个 AWS IAM 角色，并附加上一步创建的策略。

配置该角色的信任策略，让 Tailscale PAM 的 AWS 账户能够担任它：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "arn:aws:iam::235487987553:root"
        ]
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "${EXTERNAL_ID}"
        }
      }
    }
  ]
}
```

把 `${EXTERNAL_ID}` 替换为你自选的外部 ID。

使用外部 ID 是可选的，但建议使用。如果你在 IAM 角色中配置了外部 ID，那么在 Tailscale PAM 中配置录制存储时必须提供相同的外部 ID。

创建角色后，复制它的 Amazon Resource Name（ARN）。它看起来类似：

* `arn:aws:iam::123456789012:role/pam-recordings`

## 在 Tailscale PAM 中配置录制存储

创建好 AWS 资源后：

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。
2. 在 **Recording storage** 部分选择**配置存储**。
3. 输入你的 S3 存储桶名称。
4. 输入 Tailscale PAM 应担任的 IAM 角色的 ARN。
5. 如果你为该角色配置了外部 ID，请在 **External ID** 中输入它。
6. （可选）输入该存储桶所在的 AWS 区域。
7. 选择**保存**。

Tailscale PAM 在把会话录制存入你的 S3 存储桶时会使用所配置的 IAM 角色。

## 验证录制存储

要验证配置：

1. 连接到一个启用了会话录制的 PAM 服务。
2. 在会话期间进行一些操作。
3. 结束会话。
4. 确认录制已写入你的 S3 存储桶。
5. 打开 Tailscale 管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面。
6. 打开该会话，确认它的录制或回放可用。

如果 Tailscale PAM 能把录制写入存储桶，但无法在管理控制台中展示它们，请检查该 IAM 角色是否有从存储桶读取对象的权限。

[docs-pam]: /docs/privileged-access-management
