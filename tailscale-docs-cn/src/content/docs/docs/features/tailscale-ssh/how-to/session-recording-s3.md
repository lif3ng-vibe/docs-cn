---
title: "将 Tailscale SSH 会话录制发送到 S3"
description: "默认情况下，Tailscale SSH 会话录制会将录制内容保存到 Docker 主机的文件系统。这种方式部署会话录制器快速直接，但你可能想使用像 Amazon S3 这样更具可扩展性和弹性的存储方案。"
---

最后验证于 Jan 9, 2026

默认情况下，Tailscale SSH 会话录制会将录制内容保存到 Docker 主机的文件系统。这种方式部署会话录制器快速直接，但你可能想使用像 Amazon S3 这样更具可扩展性和弹性的存储方案。

> **注意：** Tailscale SSH 会话录制目前处于 beta 阶段。

> **注意：** Tailscale SSH 会话录制适用于 [Personal 和 Enterprise 套餐](https://tailscale.com/pricing)。

你可以配置会话录制节点，将录制内容发送到 Amazon S3 或其他兼容 S3 的对象存储服务，例如 MinIO、Wasabi、Google Cloud Storage 或 [Cloudflare R2][ar-cloudflare-r2-compatibility]。

如果你部署录制节点时启用了内置 Web UI，用户就可以在 Web UI 中访问存储在 S3 中的录制内容。

## 将 S3 配置为会话录制节点的存储

### 前提条件

要将 S3 配置为会话录制的后端存储，你必须能访问一个有权创建以下内容的 AWS 账户：

* S3 存储桶
* IAM 策略

以及以下*二者之一*

* IAM 用户
* IAM 用户访问密钥

或者

* 一个 IAM 角色

### 创建 IAM 策略和用户/角色

在你的 AWS 账户中[创建以下 IAM 策略][xt-aws-iam-create]。将 `Resource` 部分两行中的 `<bucket-name>` 替换为你的 S3 存储桶名称。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<bucket-name>/*",
        "arn:aws:s3:::<bucket-name>"
      ]
    }
  ]
}
```

如果运行录制节点时未启用内置 Web UI，可以在此策略中省略 `s3:GetObject` 和 `s3:ListBucket`。`s3:PutObject` 和 `s3:GetBucketLocation` 始终是必需的。

如果你打算使用 IAM 访问密钥来获得写入存储桶的权限，请将此策略分配给一个新的 IAM 用户，并为该用户[创建访问密钥][xt-aws-iam-create-key]。如果你打算使用 IAM 角色，请[创建一个 IAM 角色][xt-aws-iam-create-role]，并将前面定义的策略附加到该角色。

### 部署录制节点

以 S3 作为存储后端部署录制节点，与标准的文件系统部署类似。你需要添加 IAM 凭证或角色，以及 S3 存储桶信息。

#### 使用 AWS 访问密钥部署

对于 AWS 访问密钥，请指定 AWS 访问密钥和秘密密钥：

```shell
docker run --name tsrecorder --rm -it \
  -e TS_AUTHKEY=$TS_AUTHKEY \
  -e AWS_ACCESS_KEY=$AWS_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v $HOME/tsrecorder:/data \
  tailscale/tsrecorder:stable \
  /tsrecorder --dst='s3://s3.us-east-2.amazonaws.com' --statedir=/data/state \
  --bucket=$S3_BUCKET_NAME --ui \
```

#### 使用附加的 IAM 角色部署

对于 IAM 角色，凭证从 AWS 元数据服务获取。你需要为容器分配一个 IAM 角色（如果使用 EC2 实例，还需要一个 [IAM 实例配置文件][xt-aws-iam-instance-profile]）。

```shell
docker run --name tsrecorder --rm -it \
  -e TS_AUTHKEY=$TS_AUTHKEY \
  -v $HOME/tsrecorder:/data \
  tailscale/tsrecorder:stable \
  /tsrecorder --dst='s3://s3.us-east-2.amazonaws.com' --statedir=/data/state \
  --bucket=$S3_BUCKET_NAME --ui \
```

> **注意：**
>
> 如果你预配 Docker 容器所用的实例使用的是[实例元数据 v2][xt-aws-configuring-instance-metadata-service]，默认的 `PUT` 响应跳数限制为 1（即从 EC2 实例到元数据服务）。要让 IAM 实例配置文件与 Docker 配合工作，必须先将该限制调整为计入经过 EC2 实例的额外一跳，[即至少为 2][xt-aws-instance-metadata-hop-limit]。

必需标志：

* `--dst` 指定录制内容的保存位置。接受本地文件路径或 S3 区域 URL。如果打算使用 S3 存储录制内容，该值必须以 `s3://` 开头。也可以将该值定义为环境变量 `TSRECORDER_DST`。
* `--statedir` 指定录制器存储其内部状态的位置。接受本地文件路径。

可选标志：

* `--hostname` 指定录制节点使用的主机名。默认为 `recorder`。也可以将该值定义为环境变量 `TSRECORDER_HOSTNAME`。
* `--access-key` 可将录制内容上传到 S3 存储桶的 IAM 用户的 AWS 访问密钥。当使用 S3 作为存储后端且未向实例传递 IAM 角色时为必需项。也可以将该值定义为环境变量 `AWS_ACCESS_KEY_ID`。
* `--secret-key` 可将录制内容上传到 S3 存储桶的 IAM 用户的 AWS 秘密访问密钥。当使用 S3 作为存储后端且未向实例传递 IAM 角色时为必需项。也可以将该秘密访问密钥定义为环境变量 `AWS_SECRET_ACCESS_KEY`。
* `--bucket` 录制器上传录制内容的 S3 存储桶名称。使用 S3 作为存储后端时为必需项。也可以将该值定义为环境变量 `TSRECORDER_BUCKET`。
* `--state` Tailscale 状态文件的路径，用于在容器重启之间持久化录制器状态。可以是持久卷或 Kubernetes [`Secret`][xt-kubernetes-secret]。也可以将该值定义为环境变量 `TS_STATE`。
  * 要使用 `Secret`，请指定 `kube:<secret-name>`。如果设置为使用 `Secret` 存储状态，录制器必须拥有读取、更新和修补该 `Secret` 的权限。如果该 `Secret` 不存在，录制器会创建它，因此也必须拥有相应权限。
  * 如果未设置 `--state`，状态将存储在使用 `--statedir` 设置的目录中。
* `--ui` 启用录制器容器的 Web UI 以查看已录制的 SSH 会话。如果未提供此标志，默认为 `false`。也可以将该值定义为环境变量 `TSRECORDER_UI`。
  * 如果部署录制器时启用了 UI，你的 tailnet 必须已启用 HTTPS。
  * 如果启用录制器容器的 Web UI，你应在访问控制策略中限制对录制器 `443` 端口的访问，以防止 tailnet 中未经授权的成员查看敏感的录制内容。

定义连接 S3 存储桶所需的 AWS IAM 凭证有多种方式。按优先级从高到低依次为：

1. 指定 `--access-key` 和 `--secret-key`
2. 设置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`
3. 以上都不指定，运行在具有相应权限的 EC2 实例上。

#### Cloudflare R2 兼容性

Cloudflare R2 Storage 提供 [S3 兼容 API][xt-cloudflare-S3-API-compatibility]；但由于其实现存在差异，需要额外设置。要使用 Cloudflare R2 作为会话录制的存储服务，除已传递的环境变量外，还需将环境变量 `S3_SEND_CONTENT_MD5` 设置为 `true`。

```shell
S3_SEND_CONTENT_MD5=true
```

[ar-cloudflare-r2-compatibility]: #cloudflare-r2-兼容性

[xt-aws-iam-create-role]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html

[xt-aws-configuring-instance-metadata-service]: https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/configuring-instance-metadata-service.html

[xt-aws-iam-instance-profile]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html

[xt-aws-instance-metadata-hop-limit]: https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/configuring-IMDS-existing-instances.html#modify-PUT-response-hop-limit

[xt-aws-iam-create-key]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

[xt-aws-iam-create]: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create-console.html

[xt-cloudflare-S3-API-compatibility]: https://developers.cloudflare.com/r2/api/s3/api

[xt-kubernetes-secret]: https://kubernetes.io/docs/concepts/configuration/secret/
