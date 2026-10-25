---
title: "使用 Tailscale PAM 访问 TCP 服务"
description: "[Tailscale PAM][docs-pam] 让用户以基于身份的方式访问内部 TCP 服务，而无需与这些服务建立直接的网络访问。"
---

最后验证于 Sep 3, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户以基于身份的方式访问内部 TCP 服务，而无需与这些服务建立直接的网络访问。

你可以把通过 TCP 通信的内部应用和服务开放出来，而不必把它们直接暴露到互联网，也不必给用户更宽泛的网络访问权限。Tailscale PAM 依据 tailnet 访问策略中的 PAM 授权（grant）来判断用户是否可以访问该服务。

PAM 连接器代表用户处理与上游 TCP 服务的连接。只要连接器能到达上游服务，上游服务就可以继续留在你的私有网络里。

## TCP 访问的工作原理

当你创建一个 TCP PAM 服务时，Tailscale PAM 会提供一个端点，用户可以用 TCP 客户端连接它。

当用户连接时：

1. Tailscale PAM 使用用户的 [Tailscale 身份][docs-tailscale-identity]对其进行身份验证。
2. Tailscale PAM 检查其 tailnet 访问策略是否允许该用户使用此 TCP 服务。
3. 如果允许访问，PAM 连接器会建立到上游 TCP 服务的连接。
4. Tailscale PAM 在用户与上游服务之间代理流量。

只有连接器需要与上游 TCP 服务有网络连通。上游服务本身无需能被用户直接访问，也无需能从互联网访问。

## 前提条件

开始之前，请确认你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一个能到达上游 TCP 服务的连接器。
* 上游服务的主机名或 IP 地址和端口。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。
* 如果你计划使用原生 TCP 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。

## 创建 TCP PAM 服务

要创建该服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **TCP**。

5. 选择**继续**。

6. 输入服务名称。

   起一个能让用户在浏览自己可访问的服务时，一眼认出这个 TCP 服务的名字。

7. （可选）输入该服务的显示名称。

8. （可选）输入该服务的描述。

9. 选择一个或多个能到达该 TCP 服务的 Tailscale PAM 连接器。

10. 选择**继续**。

11. 在 **Upstream Hostname or IP** 中，输入该 TCP 服务的主机名或 IP 地址。

    例如：

    ```text
    10.10.10.10
    ```

    也可以使用内部 DNS 名称：

    ```text
    service.internal.example.com
    ```

12. 在 **Port** 中，输入上游 TCP 服务监听的端口。

    例如：

    ```text
    9000
    ```

13. 选择**保存**。

你的 TCP PAM 服务已可使用。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 TCP 服务授予访问权限

在用户尝试连接之前，请确保有一条 Tailscale PAM [授权为他们开放访问][docs-pam-control-access]该 TCP 服务。Tailscale PAM 使用你的 tailnet 访问策略来决定哪些用户、用户组、设备或标签可以连接该服务。

例如，下面的授权允许任意来源连接到 PAM TCP 服务：

```json
{
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
              "tcp": {}
            }
          }
        ]
      }
    }
  ]
}
```

> **警告：**
>
> 这是一条范围很宽的授权，适合上手试用。在生产环境中，你可以收紧 `src` 和 `dst` 字段，以控制哪些用户、用户组、设备或标签能访问特定服务。

关于控制 PAM 服务访问的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

## 连接到 TCP 服务

配置好服务并授予访问权限后，用户即可使用兼容的客户端连接该 TCP 服务。

请使用 Tailscale PAM 服务的主机名和端口，而不是上游服务的私有主机名或 IP 地址。

例如，你可以用 `nc` 测试 TCP 连接：

```shell
nc -v <service-hostname> <port>
```

用户不需要与上游 TCP 服务有直接的网络连通。Tailscale PAM 会对用户进行身份验证，并对照 tailnet 策略检查其访问权限。如果有一条匹配的 PAM 授权允许对该服务进行 TCP 访问，Tailscale PAM 就会通过连接器把连接代理到上游服务。

用户也可以打开 Tailscale PAM [Border0 web 客户端](https://my.tailscale.com)并选择该服务来连接 TCP 服务。

## 查看 TCP 会话

Tailscale PAM 为你提供了一个集中位置，用于查看谁在什么时候访问了你的内部 TCP 服务。

要查看 TCP 会话，请打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你要检查的会话。从中你可以查看关于用户、其访问的服务以及会话本身的信息。

## 故障排查

如果你无法连接到某个 TCP PAM 服务，请先确认 PAM 连接器在线。

然后核实：

* 连接器能否到达所配置的上游主机名或 IP 地址。
* 所配置的端口是否正确。
* 上游服务是否正在监听所配置的端口。
* PAM 授权是否给你的 Tailscale 身份开放了对该服务的 TCP 访问。
* 如果你用 DNS 名称配置上游服务，连接器能否解析该主机名。
* 连接器与上游服务之间的防火墙是否允许该 TCP 连接。
* 如果你从浏览器客户端连接，且你的 tailnet 使用了[设备审批][docs-device-approval]，浏览器设备是否已[获批准][docs-device-approval-approve]。

你也可以从连接器所在网络测试到上游服务的连通性。例如，视连接器所在环境而定，可以使用如下命令：

* `nc -zv <upstream-hostname> <port>`
* `telnet  <upstream-hostname> <port>`

如果连接失败，请先解决连接器与上游服务之间的连通问题，再排查用户的 Tailscale PAM 连接。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 PAM [会话日志][docs-session-logs]中失败会话的详情。会话详情有助于判断连接是被访问控制、网络连通性还是到上游 Windows 服务器的身份验证所拦截的。

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
