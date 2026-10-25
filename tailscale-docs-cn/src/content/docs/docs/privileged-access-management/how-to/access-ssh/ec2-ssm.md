---
title: "使用 Tailscale PAM 通过 AWS Systems Manager Session Manager 访问 EC2 实例"
description: "[Tailscale PAM][docs-pam] 让你通过 AWS Systems Manager Session Manager，使用 [Tailscale 身份][docs-tailscale-identity]对 Amazon EC2 实例提供安全访问。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让你通过 AWS Systems Manager Session Manager，使用 [Tailscale 身份][docs-tailscale-identity]对 Amazon EC2 实例提供安全访问。

用户无需管理 SSH 密钥、静态密码或 AWS 凭证即可连接到 EC2 实例。Tailscale PAM 使用用户的 Tailscale 身份为连接授权，而连接器使用 AWS Systems Manager 建立上游会话。

由于连接经由 Systems Manager，你无需暴露端口 22，也无需提供从连接器到 EC2 实例的直接网络路径。

本指南将带你完成：为 Session Manager 准备 EC2 实例、为连接器配置 AWS 权限、创建 PAM 服务，以及连接到实例。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果你计划使用原生 SSH 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。
* 一台已配置为 AWS Systems Manager 托管节点的 Amazon EC2 实例。
* EC2 实例上已安装并正在运行 SSM Agent。
* 一个 PAM 连接器可用的 AWS 身份，并具有启动 Systems Manager 会话的权限。
* EC2 实例 ID 和 AWS 区域。

PAM 连接器不需要与 EC2 实例直接网络连通。托管实例使用出站 HTTPS 连接与 AWS Systems Manager 通信。AWS 要求托管节点能够访问 Systems Manager 服务端点。

PAM 连接器不需要与 EC2 实例直接网络连通。托管实例使用出站 HTTPS 连接与 AWS Systems Manager 通信。AWS 要求托管节点能够访问 Systems Manager 服务端点。

## 为 Session Manager 准备 EC2 实例

在 Tailscale PAM 能够连接之前，请确保你能通过 AWS Systems Manager Session Manager 访问该 EC2 实例。

实例必须已安装并正在运行 SSM Agent，并具备注册为 Systems Manager 托管节点所需的权限。

对于 EC2 实例，你可以使用附带 AWS 托管策略 `AmazonSSMManagedInstanceCore` 的 IAM 实例配置文件来提供这些权限。

AWS 还支持 Default Host Management Configuration，可以在账户级别提供所需的 Systems Manager 权限。

你可以在 AWS Systems Manager 控制台中验证该实例。如果该实例显示为托管节点，并且你能对它启动 Session Manager 会话，那么它已经可以配合 Tailscale PAM 使用了。

## 授予连接器使用 Session Manager 的权限

Tailscale PAM 连接器需要一个能够为该 EC2 实例启动和管理 Systems Manager 会话的 AWS 身份。

只要可能，请使用 IAM 角色而不是长期有效的 AWS 访问密钥。例如，如果 PAM 连接器运行在 EC2 实例上，你可以为连接器实例附加一个 IAM 角色，并使用 Default credentials provider chain 身份验证策略。

下面的策略是让连接器访问特定 EC2 实例的一个良好起点：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:StartSession"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:instance/${EC2_INSTANCE_ID}",
        "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:document/SSM-SessionManagerRunShell"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:TerminateSession"
      ],
      "Resource": [
        "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:session/*"
      ],
      "Condition": {
        "StringLike": {
          "ssm:resourceTag/aws:ssmmessages:target-id": [
            "${EC2_INSTANCE_ID}"
          ]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:instance/${EC2_INSTANCE_ID}",
        "arn:aws:ssm:*::document/AWS-RunShellScript",
        "arn:aws:ssm:*::document/AWS-RunPowerShellScript"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetCommandExecution"
      ],
      "Resource": [
        "arn:aws:ec2:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    }
  ]
}
```

把 `${AWS_REGION}`、`${AWS_ACCOUNT_ID}` 和 `${EC2_INSTANCE_ID}` 替换为你环境的 AWS 区域、AWS 账户 ID 和 EC2 实例 ID。

此示例在底层 AWS 操作支持该资源限定粒度的情况下，把访问限制在所配置的 AWS 账户、区域和 EC2 实例内。如果连接器需要访问多个 EC2 实例，请添加所需的资源，而不是尽可能用宽泛的通配符替换。

## 创建 EC2 PAM 服务

要为该 EC2 实例创建 PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **Secure Shell - AWS EC2 via AWS SSM**。

5. 选择**继续**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. 在**通过以下方式连接**中，选择一个或多个 Tailscale PAM 连接器。

   连接器不需要与 EC2 实例有 SSH 网络连通，但需要能够访问建立 Systems Manager 会话所需的 AWS API。

10. 选择**继续**。

11. 在 **EC2 instance ID** 中，输入该 EC2 实例的实例 ID。

12. 在 **AWS region** 中，输入该实例所在的 AWS 区域。

13. 在 **AWS authentication strategy** 中，选择连接器向 AWS 进行身份验证的方式。

    #### Default credentials provider chain

    选择 **Default credentials provider chain**，使用连接器通过标准 AWS 凭证提供程序链已经可用的 AWS 凭证。

    当连接器运行在已附加 AWS IAM 角色的 EC2 实例上时，这是一个不错的选择。

    #### AWS profile

    选择 **AWS profile**，使用运行连接器的设备上已配置的特定 AWS profile。

    输入连接器应使用的 AWS profile 名称。

    #### Static credentials

    选择 **Static credentials**，直接提供 AWS 凭证。填写以下值：

    * **AWS access key ID**：该 AWS 身份的访问密钥 ID。
    * **AWS secret access key**：对应的秘密访问密钥。

    AWS 凭证属于敏感信息。

    > **警告：**
    >
    > 在生产环境中，尽量优先使用 AWS IAM 角色或其他短期凭证来源。

14. 选择**保存**。

使用 AWS Systems Manager Session Manager 的 SSH PAM 服务已创建完成。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 SSH 服务授予访问权限

在用户连接之前，请确保有一条 Tailscale PAM [授权][docs-grants]允许他们访问该 SSH 服务。

Tailscale PAM 授权可以控制交互式 shell 访问、命令执行、SFTP 和其他 SSH 能力。例如，你可以让一个用户组拥有完整的 SSH 访问权限，而把另一个用户组限制到特定的非交互式命令。

由于上游连接使用的是 AWS Systems Manager 而非传统的 SSH 登录，用户无需管理任何上游 SSH 用户名、密码或私钥。

例如，一条宽泛授权的 SSH 权限可以允许 shell、exec 和 SFTP 访问：

```json
"permissions": {
  "ssh": {
    "shell": {},
    "exec": {},
    "sftp": {}
  }
}
```

> **警告：**
>
> 这适合上手试用。在生产环境中，请收紧授权的来源和目的地，只让合适的用户、用户组、设备或标签能够访问这个使用 AWS Systems Manager Session Manager 的 EC2 SSH 服务。

更多 SSH 授权示例和细粒度 SSH 访问控制的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 连接到 EC2 实例

主要的连接方式是通过 Tailscale 客户端，它可以启动你偏好的 SSH 客户端。你也可以完全在浏览器中，使用 Tailscale 浏览器客户端进行连接。

### 使用你偏好的 SSH 客户端连接

使用 Tailscale 客户端，用你设备上已安装的兼容 SSH 客户端快速打开该 SSH 服务。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 EC2 SSM 服务。
4. 选择你想使用的 SSH 客户端。

Tailscale 客户端会扫描你的设备上常见的 SSH 客户端，并显示它能找到的那些。选中其一即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的 SSH 客户端。如果你偏好的客户端不在列表中，可以直接打开它，并使用该 PAM 服务的名称作为主机名。

如果该服务配置了固定的 SSH 用户名，你可以这样连接：

```shell
ssh your-service-name
```

Tailscale PAM 使用你的 Tailscale 身份为连接授权。随后连接器使用自己的 AWS 身份启动上游 Systems Manager 会话。

你不需要该 EC2 实例的 SSH 密钥、密码或 AWS 凭证。

### 从浏览器连接

你也可以完全在浏览器中，使用 Tailscale SSH 浏览器客户端进行连接。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services)。
2. 选择你要访问的 EC2 SSM 服务。
3. 选择**连接**，Tailscale SSH 浏览器客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

现在你可以直接在浏览器中对 EC2 实例使用交互式 SSH 会话了。

浏览器客户端通过 WebAssembly（Wasm）在浏览器中运行一个 Tailscale 客户端，并作为一台新的[临时节点（ephemeral node）][docs-ephemeral-nodes]出现在你的 tailnet 中。如果 tailnet 启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 查看 SSH 会话

Tailscale PAM 让你能够查看与你的 EC2 SSM 服务的连接。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 所访问的服务。

启用会话录制后，你还可以查看录制下来的 SSH 会话。

这让你能直接回答两个很有用的问题：谁访问了该 EC2 实例，以及连接期间做了什么？

## 故障排查

如果你无法连接到该 EC2 实例，请先核实 PAM 连接器是否在线。

接下来，确保该 EC2 实例可以通过 AWS Systems Manager 访问。实例必须已安装并正在运行 SSM Agent，并且具备所需的 Systems Manager 权限。

请核实：

* EC2 实例 ID 是否正确。
* 所配置的 AWS 区域是否与该实例一致。
* 连接器使用的 AWS 身份是否具有为该实例启动 Session Manager 会话的权限。
* 该实例是否显示为 Systems Manager 托管节点。
* 实例上 SSM Agent 是否正在运行。
* 实例能否向所需的 Systems Manager 端点发起出站 HTTPS 连接。
* 如果你使用的是 AWS profile 或静态凭证，请核实凭证有效且具备所需权限。
* 一个有用的排查步骤是：使用与连接器相同的 AWS 身份，确认你能直接通过 AWS 对该实例启动 Session Manager 会话。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中该失败会话的详情。这些信息有助于判断问题出在 AWS 凭证、IAM 权限、Systems Manager 配置还是 EC2 实例本身。

## 通过 AWS SSM 访问 ECS 任务

Tailscale PAM 还支持通过 AWS Systems Manager 访问 Amazon ECS 任务。

要配置 ECS 目标，请创建一个单独的 Tailscale PAM 服务并选择 **Secure Shell - AWS ECS via AWS SSM**。

Amazon ECS 使用 Systems Manager 建立 ECS Exec 会话。任务必须启用 ECS Exec，并且任务需要有一个具备所需 `ssmmessages` 权限的 AWS IAM 角色。

完整的配置步骤，参见[使用 AWS Systems Manager 访问 Amazon ECS 任务][docs-pam-ssh-ecs-ssm]。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam-ssh-ecs-ssm]: /docs/privileged-access-management/how-to/access-ssh/ecs-ssm

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
