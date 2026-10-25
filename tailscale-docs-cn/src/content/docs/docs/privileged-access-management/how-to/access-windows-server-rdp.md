---
title: "使用 Tailscale PAM 通过 RDP 访问 Windows 服务器"
description: "[Tailscale PAM][docs-pam] 让用户使用自己的 [Tailscale 身份][docs-tailscale-identity]通过远程桌面协议（RDP）连接 Windows 服务器，而无需共享 Windows 用户名和密码。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户使用自己的 [Tailscale 身份][docs-tailscale-identity]通过远程桌面协议（RDP）连接 Windows 服务器，而无需共享 Windows 用户名和密码。

Tailscale PAM 连接器代表用户处理到上游 Windows 服务器的身份验证。用户无需知道或管理 Windows 服务器的凭证。

你可以使用 Tailscale [授权（grant）][docs-grants]来控制谁能访问每个 RDP 服务。Tailscale PAM 会记录 RDP 连接，让你能够查看谁在什么时候、从哪台设备连接过。

用户可以使用设备上的 RDP 客户端连接，也可以直接在浏览器中连接。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一个与 Windows 服务器有网络连通的连接器。
* 一台已启用 RDP 且连接器可达的 Windows 服务器。
* 该 Windows 服务器的 tailnet 主机名或 IP 地址。
* Tailscale PAM 连接 Windows 服务器时应使用的凭证。
* 如果你计划使用原生 RDP 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。

## 创建 RDP PAM 服务

要为你的 Windows 服务器创建 PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **RDP**。

5. 选择**继续**。

6. 输入服务名称。

   起一个能让用户在浏览自己可访问的服务时，一眼认出这台 Windows 服务器的名字。

7. （可选）输入该服务的显示名称。

8. （可选）输入该服务的描述。

9. 选择一个或多个能到达该 Windows 服务器的 Tailscale PAM 连接器。

   你选择的每个连接器都必须与上游 Windows 服务器有网络连通。

10. 选择**继续**。

11. 在 **Upstream hostname or IP** 中，输入该 Windows 服务器的主机名或 IP 地址。

12. 在 **Port** 中，输入 RDP 端口。默认为 `3389`。

13. 在 **Username** 中，输入 Tailscale PAM 连接该服务器时应使用的 Windows 用户名。

14. 在 **Password** 中，输入该 Windows 用户的密码。

15. （可选）在 **Domain** 中，输入 Windows 域（如果服务器要求）。

    用户名、密码和域由 Tailscale PAM 连接器用于向上游 Windows 服务器进行身份验证。连接该 PAM 服务的用户无需接触这些凭证。

16. 选择**保存**。

你的 RDP PAM 服务已创建完成。你可以在管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 RDP 服务授予访问权限

在用户尝试连接之前，请确保有一条 Tailscale PAM [授权为他们开放访问][docs-pam-control-access]该 RDP 服务。Tailscale PAM 使用你的 tailnet 访问策略来决定哪些用户、用户组、设备或标签可以连接该服务。

例如，下面的授权允许任意来源连接到 PAM RDP 服务：

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
            "rdp": {}
          }
        }
      ]
    }
  }
]
```

> **警告：**
>
> 这是一条范围很宽的授权，适合上手试用。在生产环境中，你可以收紧 `src` 和 `dst` 字段，以控制哪些用户、用户组、设备或标签能访问特定服务。

关于控制 PAM 服务访问的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 Windows 服务器

用户可以使用设备上的 RDP 客户端连接，也可以直接在浏览器中连接。

### 使用 RDP 客户端连接

从桌面连接的主要方式是通过 Tailscale 客户端。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择该 RDP 服务。
4. 选择一个可用的 RDP 客户端。
5. 连接时使用空密码。也就是说，不要提供密码。

Tailscale PAM 使用你的 Tailscale 身份为连接授权，并处理连接上游 Windows 服务器所需的凭证。这意味着用户无需知道或管理其共享的用户名和密码，即可访问该 Windows 服务器。

### 从浏览器连接

你也可以直接从浏览器连接到 Windows 桌面：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你要访问的 RDP 服务。
3. 选择右上角的**连接**，基于 web 的 RDP 客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

现在你可以直接在浏览器中使用 Windows 桌面了。

浏览器客户端会作为一台 Tailscale 设备出现在你的 tailnet 中。如果启用了[设备审批][docs-device-approval]，管理员必须先[批准][docs-device-approval-approve]该浏览器设备，它才能连接。

## 保护上游凭证

在上面的示例中，Windows 用户名和密码是作为 PAM 服务的一部分配置的。

对于生产环境，你可以改为让 Tailscale PAM 从受支持的密钥来源加载凭证。这样你可以把凭证保存在现有的密钥管理系统中，而不是直接存储在 PAM 服务配置里。

连接器会在需要时取回这些凭证，并用它们向 Windows 服务器进行身份验证。连接该 RDP 服务的用户始终无需接触这些凭证。

更多信息，参见[管理凭证与密钥][docs-pam-manage-secrets]。

## 查看 RDP 会话

Tailscale PAM 为你提供对 RDP 服务连接的集中可见性。

打开 Tailscale 管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 RDP 服务的一个会话。

你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备和源 IP。
* 连接时间。
* 所访问的 RDP 服务。
* 会话时长。
* 连接是成功还是被拒绝。

更多信息，参见 Tailscale PAM [会话日志][docs-session-logs]。

## 故障排查

如果你无法连接到你的 RDP 服务，请先确认 PAM 连接器在线，并能在所配置的 RDP 端口上到达该 Windows 服务器。

接下来，核实：

* 该 Windows 服务器是否已启用 RDP。
* 主机名或 IP 地址和端口是否正确。
* 所配置的 Windows 凭证是否有效。
* 是否有一条 Tailscale PAM 授权为你的身份开放了对该 RDP 服务的访问。

如果你使用的是 Windows 域账户，还需核实所配置的域是否正确。

如果你从浏览器连接，且你的 tailnet 使用了[设备审批][docs-device-approval]，请确认该浏览器设备已[获批准][docs-device-approval-approve]。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-session-logs]中失败会话的详情。会话详情有助于判断连接是被访问控制、网络连通性还是到上游 Windows 服务器的身份验证所拦截的。

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam]: /docs/privileged-access-management

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
