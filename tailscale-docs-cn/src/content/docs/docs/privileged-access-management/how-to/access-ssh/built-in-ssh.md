---
title: "访问 Tailscale PAM 内置 SSH 服务器"
description: "每个 [Tailscale PAM][docs-pam] [连接器][docs-pam-connectors]都内置一个 SSH 服务器，让你可以用自己的 [Tailscale 身份][docs-tailscale-identity]直接 SSH 到运行连接器的设备，十分便利。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

每个 [Tailscale PAM][docs-pam] [连接器][docs-pam-connectors]都内置一个 SSH 服务器，让你可以用自己的 [Tailscale 身份][docs-tailscale-identity]直接 SSH 到运行连接器的设备，十分便利。

无需额外安装或配置任何 SSH 服务器。内置 SSH 服务器只监听连接器的 Tailscale IP 地址，因此不会在端口 `22` 上对外暴露，也不会干扰设备上已经在运行的 SSH 服务器。

内置 SSH 服务器默认启用。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 如果你计划使用原生 SSH 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。
* 一条授予你访问连接器内置 SSH 服务权限的 Tailscale PAM [授权][docs-grants]。

## 启用或停用内置 SSH 服务器

你无需为内置 SSH 服务器单独创建 PAM 服务。每个连接器都会创建并管理自己的 SSH 服务。

要更改内置 SSH 服务器是否可用：

打开 Tailscale 管理控制台的 Connectors 页面。

1. 打开管理控制台的 [Connectors](https://console.tailscale.com/admin/connectors) 页面。
2. 选择要配置的连接器。
3. 选择**操作**。
4. 选择**编辑**。
5. 在 **Connector Configuration** 页面中，根据是否需要使用来启用或停用**启用内置 SSH 服务**设置。
6. 选择**提交**。

启用后，连接器的内置 SSH 服务器会出现在 Services 中。默认情况下，其名称基于连接器名称并带有 `ssh` 前缀，例如 `ssh-production-connector`。

启用后，连接器即可通过 Tailscale PAM 接受 SSH 连接。

## 为 SSH 服务授予访问权限

在用户连接之前，请确保有一条 Tailscale PAM [授权][docs-grants]允许他们访问该 SSH 服务。

例如，下面的授权允许交互式 shell 会话、SSH exec 请求和 SFTP：

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
              "exec": {},
              "sftp": {}
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
> 这是一条范围很宽的授权，适合上手试用。在生产环境中，请收紧 `src` 和 `dst` 字段，以控制谁能访问特定的 SSH 服务。

你还可以限制用户允许请求的 SSH 用户名。例如：

```json
"ssh": {
  "shell": {},
  "exec": {},
  "sftp": {},
  "allowed_usernames": [
    "support",
    "ubuntu"
  ]
}
```

SSH 授权还可以停用单个能力、把 SSH exec 请求限制到特定命令，或者允许向特定目的地进行 TCP 转发。TCP 转发默认停用。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-edit-policies]。

更多 SSH 授权示例和细粒度访问控制的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 使用你偏好的 SSH 客户端连接

主要的连接方式是通过 Tailscale 客户端，它可以启动你设备上已安装的 SSH 客户端。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择连接器的内置 SSH 服务。
4. 选择你想使用的 SSH 客户端。

Tailscale 客户端会扫描你的设备上常见的 SSH 客户端，并显示它能找到的那些。选中其一即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的客户端。如果你偏好的 SSH 客户端不在列表中，可以直接打开它并使用以下信息连接：

* **主机名：** 内置 SSH 服务的名称。
* **端口：** `22`。
* **用户名：** 你想以其身份连接的系统用户。

你无需向用户分发 SSH 密钥或静态密码。Tailscale PAM 使用用户的 Tailscale 身份为连接授权。

例如：

```shell
ssh your-username@your-service-name
```

端口 `22` 是默认值，因此无需指定。你也可以显式指定：

```shell
ssh -p 22 your-username@your-service-name
```

## 从浏览器连接

你也可以完全在浏览器中，使用 Tailscale SSH 浏览器客户端进行连接。

1. 打开管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择连接器的内置 SSH 服务。
3. 选择**连接**，Tailscale SSH 浏览器客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

现在你可以直接在浏览器中对连接器使用交互式 shell 了。

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

如果你无法连接到内置 SSH 服务器，请先确认连接器在线，并且你已经[启用了内置 SSH 服务器][ar-enable]。

接下来，确认有一条 Tailscale PAM 授权允许你的身份访问该 SSH 服务，并允许你尝试使用的用户名或 SSH 能力。

如果你是从浏览器连接，且你的 tailnet 启用了**设备审批**，请确认该浏览器设备已获批准。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中该失败会话的详情。这些信息有助于判断连接是被 Tailscale PAM 授权、所请求的 SSH 用户名还是连接器本身拦截的。

[ar-enable]: #启用或停用内置-ssh-服务器

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
