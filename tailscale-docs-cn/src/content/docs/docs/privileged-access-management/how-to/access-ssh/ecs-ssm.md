---
title: "使用 Tailscale PAM 通过 AWS Systems Manager 访问 ECS 容器"
description: "[Tailscale PAM][docs-pam] 让你使用 [Tailscale 身份][docs-tailscale-identity]，对运行在 Amazon Elastic Container Service（ECS）中的容器提供安全访问。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让你使用 [Tailscale 身份][docs-tailscale-identity]，对运行在 Amazon Elastic Container Service（ECS）中的容器提供安全访问。

用户无需管理 SSH 密钥、静态密码或 AWS 凭证即可连接到 ECS 容器。Tailscale PAM 使用用户的 Tailscale 身份为连接授权，而连接器使用 AWS Systems Manager 建立上游会话。

由于连接经由 AWS Systems Manager，你无需在容器内运行 SSH 服务器，也无需暴露端口 `22`。

本指南将带你完成：准备可访问的 ECS 任务、为连接器配置 AWS 权限、创建 PAM 服务，以及连接到容器。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果你计划使用原生 SSH 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。
* 一个有正在运行任务的 Amazon ECS 集群。
* 该任务已启用 ECS Exec。
* 一个具有与 AWS Systems Manager 通信所需权限的 ECS 任务角色。
* 一个 PAM 连接器可用的 AWS 身份，并具有访问该 ECS 任务的权限。
* 该 ECS 集群所在的 AWS 区域。

ECS Exec 使用 AWS Systems Manager Session Manager 与容器建立连接。所需的 Systems Manager 组件作为 ECS Exec 的一部分由 AWS 托管，因此你无需在容器内安装传统 SSH 服务器或管理 SSH 凭证。

## 准备可访问的 ECS 任务

在 Tailscale PAM 能够连接之前，请确保 ECS 服务或独立任务已启用 ECS Exec。

你可以在创建或更新 ECS 服务时启用 ECS Exec，也可以在启动新的独立任务时启用。已经运行中的任务无法启用 ECS Exec，必须在该功能启用后再启动新任务。

任务还需要一个任务 IAM 角色，让托管 Systems Manager 代理能够与 Systems Manager 服务通信。

将以下权限添加到**任务角色**（task role），而不是任务执行角色：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

AWS 要求 ECS Exec 所用的托管 SSM 代理具备这些权限。

如果任务没有互联网访问且使用 VPC 端点，请确保它能到达 Systems Manager Session Manager 的 `ssmmessages` 端点。

继续之前，请先用你惯用的 AWS 工具确认 ECS Exec 对该任务可用。如果你能成功打开到该容器的 ECS Exec 会话，那么该任务已经可以配合 Tailscale PAM 使用了。

## 授予连接器访问 ECS 的权限

Tailscale PAM 连接器需要一个 AWS 身份，具有建立到该 ECS 任务的 Systems Manager 会话的权限，以及识别 ECS 资源所需的只读 ECS 操作权限。

只要可能，请使用 AWS IAM 角色而不是长期有效的 AWS 访问密钥。例如，如果连接器运行在 EC2 实例上，你可以为该实例附加一个 IAM 角色，并使用 **Default credentials provider chain** 身份验证策略。

下面的策略是让连接器访问特定 ECS 任务的一个良好起点：

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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${ECS_TASK_ID}",
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
            "${ECS_TASK_ID}"
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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${ECS_TASK_ID}",
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
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeClusters",
        "ecs:DescribeContainerInstances",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListClusters",
        "ecs:ListContainerInstances",
        "ecs:ListServices",
        "ecs:ListTaskDefinitionFamilies",
        "ecs:ListTaskDefinitions",
        "ecs:ListTasks"
      ],
      "Resource": [
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:*"
      ]
    }
  ]
}
```

替换以下内容：

* `${AWS_REGION}` 替换为该 ECS 工作负载所在的 AWS 区域。
* `${AWS_ACCOUNT_ID}` 替换为你的 AWS 账户 ID。
* `${ECS_TASK_ID}` 替换为该 ECS 任务的 ID。

此策略沿用了现有集成所使用的权限，同时在可能的情况下把资源限制在所配置的 AWS 区域、账户和 ECS 任务内。

这些 ECS 只读权限让连接器能够发现并识别 ECS 集群、服务、任务定义、任务和容器。连接 ECS 目标时需要这些权限。

如果连接器需要访问多个 ECS 任务，请添加所需的任务资源，或按你的环境适当放宽资源范围。除非连接器确实需要跨多个区域、账户或 ECS 资源访问，否则请避免使用不加限制的通配符。

## 创建 AWS ECS PAM 服务

要为该 ECS 工作负载创建 Tailscale PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **Secure Shell - AWS ECS via AWS SSM**。

5. 选择**继续**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. 在**通过以下方式连接**中，选择一个或多个 Tailscale PAM 连接器。

   连接器不需要与 ECS 容器有 SSH 网络连通，但需要能够访问建立 Systems Manager 会话所需的 AWS API。

10. 选择**继续**。

11. 在 **ECS cluster name** 中，输入该任务所在 ECS 集群的名称。

12. 在 **ECS cluster name** 中，输入要连接的 ECS 服务名称。

13. 在 **AWS region** 中，选择该实例所在的 AWS 区域。

14. 在 **AWS authentication strategy** 中，选择连接器向 AWS 进行身份验证的方式。

    #### Default credentials provider chain

    选择 **Default credentials provider chain**，使用连接器通过标准 AWS 凭证提供程序链已经可用的 AWS 凭证。

    当连接器以 IAM 角色运行时（例如附加在 EC2 实例上的 IAM 角色），这是首选方式。

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

15. 选择**保存**。

使用 AWS Systems Manager 提供对该 ECS 容器访问的 SSH PAM 服务已创建完成。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 ECS 服务授予访问权限

在用户连接之前，请确保有一条 Tailscale PAM [授权][docs-grants]允许他们访问该服务。

由于该服务以 SSH 服务的形式呈现给用户，你可以使用 Tailscale PAM 授权中的 SSH 权限来控制会话期间可用的能力。

例如，下面这条宽泛授权允许交互式 shell 会话和 SSH exec 请求：

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
            "ssh": {
              "shell": {},
              "exec": {}
            }
          }
        }
      ]
    }
  }
]
```

> **警告：**
>
> 这是一条范围很宽的授权，适合上手试用。在生产环境中，请收紧 `src` 和 `dst` 字段，以控制谁能访问特定的 ECS 服务。

Tailscale PAM 授权可以分别控制交互式 shell 访问和命令执行等 SSH 能力。

由于上游会话使用 AWS Systems Manager，用户不需要上游 SSH 用户名、密码或私钥。

更多 SSH 授权示例和细粒度 SSH 访问控制的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 连接到 ECS 容器

主要的连接方式是通过 Tailscale 客户端，它可以启动你偏好的 SSH 客户端。你也可以完全在浏览器中，使用 Tailscale 浏览器客户端进行连接。

### 使用你偏好的 SSH 客户端连接

使用 Tailscale 客户端，用你设备上已安装的兼容 SSH 客户端快速打开该 SSH 服务。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 ECS 服务。
4. 选择你想使用的 SSH 客户端。

Tailscale 客户端会扫描你的设备上常见的 SSH 客户端，并显示它能找到的那些。选中其一即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的 SSH 客户端。如果你偏好的客户端不在列表中，可以直接打开它，并使用该 PAM 服务的名称作为主机名。

如果该服务配置了固定的 SSH 用户名，你可以这样连接：

```shell
ssh your-service-name
```

Tailscale PAM 使用你的 Tailscale 身份为连接授权。随后连接器使用自己的 AWS 身份和 AWS Systems Manager 建立到该 ECS 容器的上游会话。

你不需要该 ECS 工作负载的 SSH 密钥、密码或 AWS 凭证。

### 从浏览器连接

你也可以完全在浏览器中，使用 Tailscale SSH 浏览器客户端进行连接。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services)。
2. 选择你要访问的 ECS 服务。
3. 选择**连接**，Tailscale SSH 浏览器客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

现在你可以直接在浏览器中对该 ECS 实例使用交互式 SSH 会话了。

浏览器客户端通过 WebAssembly（Wasm）在浏览器中运行一个 Tailscale 客户端，并作为一台新的[临时节点（ephemeral node）][docs-ephemeral-nodes]出现在你的 tailnet 中。如果 tailnet 启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 查看 SSH 会话

Tailscale PAM 让你能够查看与你的 ECS 服务的连接。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 ECS 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 所访问的服务。

启用会话录制后，你还可以查看录制下来的会话。

这让你能直接回答两个很有用的问题：谁访问了该容器，以及连接期间做了什么？

AWS 还通过 AWS CloudTrail 为 ECS Exec 活动提供自带的审计，并且可以把 ECS Exec 配置为将命令输出发送到 CloudWatch Logs 或 Amazon S3。

## 故障排查

如果你无法连接到该 ECS 容器，请先核实 Tailscale PAM 连接器是否在线。

接下来，确保目标任务的 ECS Exec 可用。

请核实：

* 该任务是否已启用 ECS Exec。
* 该任务当前是否正在运行。
* 所配置的 AWS 区域是否正确。
* 集群、任务和容器信息是否能定位到你要访问的工作负载。
* 任务 IAM 角色是否具备所需的 `ssmmessages` 权限。
* PAM 连接器使用的 AWS 身份是否具备所需的 Systems Manager 和 ECS 权限。
* 该任务能否与 Systems Manager Session Manager 服务通信。

如果 ECS Exec 是在任务启动之后才启用的，请启动一个新任务。AWS 不支持在已经运行的任务上启用 ECS Exec。

如果你使用的是 AWS profile 或静态凭证，请核实凭证有效且具备所需权限。

一个有用的排查步骤是：使用连接器可用的 AWS 身份，确认你能对同一任务和容器打开 ECS Exec 会话。AWS 还提供了 ECS Exec Checker，用于验证集群和任务是否满足 ECS Exec 的前提条件。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中该失败会话的详情。这些信息有助于判断问题出在 AWS 凭证、IAM 权限、ECS Exec 配置、Systems Manager 连通性还是 ECS 任务本身。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
