---
title: "使用 Tailscale PAM 通过 AWS EC2 Instance Connect 访问 EC2 实例"
description: "[Tailscale PAM][docs-pam] 让你使用 [Tailscale 身份][docs-tailscale-identity]为 Amazon Elastic Compute Cloud（EC2）实例提供 SSH 访问，无需分发和管理长期有效的 SSH 密钥。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让你使用 [Tailscale 身份][docs-tailscale-identity]为 Amazon Elastic Compute Cloud（EC2）实例提供 SSH 访问，无需分发和管理长期有效的 SSH 密钥。

Tailscale PAM [连接器][docs-pam-connectors]充当 SSH 代理。当用户发起 SSH 会话时，Tailscale PAM 会先应用相应的访问控制，然后连接器代表用户使用 AWS EC2 Instance Connect 向上游 EC2 实例进行身份验证。EC2 Instance Connect 的工作原理是向实例元数据中临时添加一个 SSH 公钥。该密钥在 60 秒内有效，足以让连接器建立 SSH 连接。用户无需接触连接器所用的 SSH 密钥或 AWS 凭证。

你可以直接通过 EC2 实例的公网或私有 IP 地址连接，也可以在需要通过私有 IP 地址访问实例时，经由 EC2 Instance Connect Endpoint 连接。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果你计划使用原生 SSH 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。
* 一台已安装 EC2 Instance Connect 的 EC2 Linux 实例。
* 一个连接器可用的 AWS 身份，并具有使用 EC2 Instance Connect 的权限。
* 从连接器到 EC2 实例的网络连通性，或者一个能到达该实例的 EC2 Instance Connect Endpoint。

EC2 Instance Connect 已经预装在多个常用的 Amazon Machine Image（AMI）镜像中，包括 Amazon Linux 2023、较新的 Amazon Linux 2 版本以及 Ubuntu 20.04 及以上版本。对于其他受支持的操作系统，你可以手动安装 EC2 Instance Connect。

如果你采用直连方式，请确保 EC2 实例的安全组和其他网络控制允许来自 Tailscale PAM 连接器所在网络的 SSH 流量。

## 授予连接器使用 EC2 Instance Connect 的权限

Tailscale PAM 连接器需要一个 AWS 身份，并具有向 EC2 实例推送临时 SSH 公钥的权限。

只要可能，请让连接器以提供所需权限的 IAM 角色运行。例如，如果连接器运行在 EC2 实例上，你可以为该实例附加一个 IAM 角色。

连接器也可以使用标准 AWS 凭证提供程序链中可用的凭证，例如 AWS profile 或静态 AWS 凭证。

连接器至少需要对其应能访问的 EC2 实例拥有 `ec2-instance-connect:SendSSHPublicKey` 权限。

例如：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:SendSSHPublicKey",
      "Resource": [
        "arn:aws:ec2:<aws-region>:<aws-account-id>:instance/<ec2-instance-id>"
      ],
      "Condition": {
        "StringEquals": {
          "ec2:osuser": "ubuntu"
        }
      }
    }
  ]
}
```

把 `<aws-region>`、`<aws-account-id>` 和 `<ec2-instance-id>` 替换为你的环境所需的值。

`ec2:osuser` 条件让你可以限制连接器能使用哪个操作系统用户。例如，你可以允许以 `ubuntu` 身份连接，而不允许以 `root` 身份连接。如果 `unbuntu` 不适合你的环境，请按需更新。

请使用最小权限的 AWS IAM 权限，把连接器限制在它需要访问的 EC2 实例和操作系统用户范围内。

## 创建 SSH PAM 服务

要为该 EC2 实例创建 PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **Secure Shell - AWS EC2 via Inst. Connect**。

5. 选择**继续**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. 在**通过以下方式连接**中，选择一个或多个 Tailscale PAM 连接器。

   选择一个能到达该 EC2 实例的连接器，或者能使用你计划配置的 EC2 Instance Connect Endpoint 的连接器。

10. 选择**继续**。

11. 在 **Upstream hostname or IP** 中，填写上游 SSH 服务器的主机名或 IP 地址。

12. 在 **Port** 中，输入 SSH 端口。默认为 `22`。

13. 在 **EC2 instance ID** 中，输入该 EC2 实例的实例 ID。

14. 在 **AWS region** 中，输入该实例所在的 AWS 区域。

15. （可选）在 **EC2 Instance Connect endpoint ID** 中，如果你是通过 EC2 Instance Connect Endpoint 连接的，输入该端点 ID。

16. 在 **Username** 中，输入连接器连接 EC2 实例时应使用的用户名。

17. 在 **AWS authentication strategy** 中，选择连接器向 AWS 进行身份验证的方式。

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

18. 选择**保存**。

使用 EC2 Instance Connect 的 SSH PAM 服务已创建完成。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 使用 EC2 Instance Connect Endpoint

如果连接器到 EC2 实例私有 IP 地址没有直接的网络路径，你可以使用 EC2 Instance Connect Endpoint。

EC2 Instance Connect Endpoint 会建立一条到 EC2 实例私有地址的隧道，不要求实例拥有公网 IP 地址。

配置 Tailscale PAM 服务时：

* 使用实例的私有 IP 地址或私有 DNS 名称作为上游主机名。
* 输入 EC2 实例 ID。
* 输入 AWS 区域。
* 输入 EC2 Instance Connect Endpoint ID。
* 使用端口 `22`，除非你的 SSH 服务器监听其他端口。

连接器使用的 AWS 身份既需要推送 SSH 公钥的权限，也需要打开 EC2 Instance Connect Endpoint 隧道的权限。

例如：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:SendSSHPublicKey",
      "Resource": [
        ""arn:aws:ec2:<aws-region>:<aws-account-id>:instance/<ec2-instance-id>""
      ],
      "Condition": {
        "StringEquals": {
          "ec2:osuser": "ubuntu"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": "ec2-instance-connect:OpenTunnel",
      "Resource": [
        "arn:aws:ec2:<aws-region>::<aws-account-id>:instance-connect-endpoint/<instance-connect-endpoint-id>"
      ]
    }
  ]
}
```

把 `<aws-region>`、`<aws-account-id>`、`<ec2-instance-id>` 和 `<instance-connect-endpoint-id>` 替换为你的环境所需的值。

如果 `unbuntu` 不适合你的环境，请按需更新。

AWS 还允许你根据远程端口、目的地私有 IP 地址和最长隧道时长等属性来收紧 `OpenTunnel` 权限。当你想要更严格的 IAM 权限时，可以考虑使用这些条件。

## 为 SSH 服务授予访问权限

在用户连接之前，请确保有一条 Tailscale PAM [授权][docs-grants]允许他们访问该 SSH 服务。

SSH 权限可以分别控制交互式 shell 访问、exec 请求、SFTP、用户名和 TCP 转发。你还可以把 SSH exec 请求限制到特定命令。

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
> 这适合上手试用。在生产环境中，请收紧授权的来源和目的地，只让合适的用户、用户组、设备或标签能够访问该 EC2 SSH 服务。

如果该服务配置为 **Prompt Client for Username**，你还可以使用 SSH PAM 权限来限制用户允许请求的用户名。

更多 SSH 授权示例和细粒度 SSH 访问控制的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 连接到 EC2 实例

主要的连接方式是通过 Tailscale 客户端，它可以启动你偏好的 SSH 客户端。你也可以完全在浏览器中，使用 Tailscale 浏览器客户端进行连接。

### 使用你偏好的 SSH 客户端连接

使用 Tailscale 客户端，用你设备上已安装的兼容 SSH 客户端快速打开该 SSH 服务。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 EC2 SSH 服务。
4. 选择你想使用的 SSH 客户端。

Tailscale 客户端会扫描你的设备上常见的 SSH 客户端，并显示它能找到的那些。选中其一即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的 SSH 客户端。如果你偏好的客户端不在列表中，可以直接打开它，并使用该 PAM 服务的名称作为主机名。

如果该服务配置了固定的 SSH 用户名，你可以这样连接：

```shell
ssh your-service-name
```

如果该服务使用 **Prompt Client for Username**，请指定你要使用的上游用户名：

```shell
ssh your-username@your-service-name
```

端口 `22` 是默认值，因此无需指定，除非你的 PAM 服务使用其他端口。

如果你选择的是 **Username and Password** 或 **SSH Private Key** 身份验证，SSH 客户端提供的任何用户名都会被忽略，Tailscale PAM 使用为该服务配置的用户名。客户端提供的用户名只在基于证书的身份验证且选择了 **Prompt Client for Username** 时才会使用。

Tailscale PAM 使用你的 Tailscale 身份为连接授权。随后连接器使用 EC2 Instance Connect 提供临时 SSH 密钥，并代表你建立上游 SSH 连接。

你无需接触上游 SSH 密钥或连接器的 AWS 凭证。

### 从浏览器连接

你也可以完全在浏览器中，使用 Tailscale SSH 浏览器客户端进行连接。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services)。
2. 选择你要访问的 EC2 SSH 服务。
3. 选择**连接**，Tailscale SSH 浏览器客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

如果该服务使用 **Prompt Client for Username**，请输入你要使用的操作系统用户名。

现在你可以直接在浏览器中对 EC2 实例使用交互式 SSH 会话了。

浏览器客户端通过 WebAssembly（Wasm）在浏览器中运行一个 Tailscale 客户端，并作为一台新的[临时节点（ephemeral node）][docs-ephemeral-nodes]出现在你的 tailnet 中。如果 tailnet 启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 查看 SSH 会话

Tailscale PAM 让你能够查看与你的 EC2 SSH 服务的连接。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 SSH 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 所访问的 SSH 服务。
* 所请求的 SSH 用户名。

启用会话录制后，你还可以查看录制下来的 SSH 会话。

这让你能直接回答两个很有用的问题：谁访问了该 EC2 服务器，以及连接期间做了什么？

## 故障排查

如果你无法连接到该 EC2 实例，请先确认 Tailscale PAM 连接器在线。

接下来，检查 EC2 Instance Connect 的配置。

确保实例上已安装 EC2 Instance Connect。如果实例的 SSH 配置覆盖了 `AuthorizedKeysCommand` 或 `AuthorizedKeysCommandUser`，EC2 Instance Connect 可能无法提供临时 SSH 密钥。

请核实：

* 为 PAM 服务配置的实例 ID 和 AWS 区域是否正确。
* 所请求的 SSH 用户名在该 EC2 实例上是否存在。
* 连接器的 AWS 身份是否拥有 `ec2-instance-connect:SendSSHPublicKey` 权限。
* AWS IAM 策略是否允许所请求的 `ec2:osuser` 值。
* 连接器能否在端口 `22` 上到达上游 SSH 服务器。

如果你采用直连方式，请核实 EC2 安全组、网络 ACL、路由和其他网络控制是否允许来自连接器的 SSH 流量。

如果你使用的是 EC2 Instance Connect Endpoint，还需核实：

* 端点 ID 是否正确。
* 端点是否可用并能到达该 EC2 实例。
* 连接器的 AWS 身份是否拥有该端点的 `ec2-instance-connect:OpenTunnel` 权限。
* 为 PAM 服务配置的私有 IP 地址是否与你要访问的实例一致。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中该失败会话的详情。这些信息有助于判断问题出在 AWS IAM 权限、网络连通性、所请求的操作系统用户名、EC2 Instance Connect 配置还是 SSH 服务器本身。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
