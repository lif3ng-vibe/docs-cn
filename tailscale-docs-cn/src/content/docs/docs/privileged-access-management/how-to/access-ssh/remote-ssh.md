---
title: "使用 Tailscale PAM 访问远程 SSH 服务器"
description: "[Tailscale PAM][docs-pam] 让你使用 Tailscale 身份对远程 SSH 服务器提供安全访问，无需分发 SSH 密钥或共享静态密码。"
---

最后验证于 Aug 20, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让你使用 Tailscale 身份对远程 SSH 服务器提供安全访问，无需分发 SSH 密钥或共享静态密码。

Tailscale PAM [连接器][docs-pam-connectors]充当 SSH 代理。当用户发起 SSH 会话时，连接器会处理传入连接、应用相应的访问控制，并在允许时代表用户连接到上游 SSH 服务器。

用户使用自己的 [Tailscale 身份][docs-tailscale-identity]进行身份验证。连接器负责向上游 SSH 服务器进行身份验证，因此用户无需接触它的密码、私钥或其他凭证。

对于从连接器到上游 SSH 服务器的连接，Tailscale PAM 支持以下身份验证方式：

* 用户名和密码。
* SSH 私钥。
* 基于证书的身份验证。

本指南将带你完成：创建远程 SSH PAM 服务、配置各种身份验证方式、连接到服务，以及查看产生的 SSH 会话。

## 前提条件

开始之前，请确保你已具备：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一台连接器可达的 SSH 服务器。
* 如果你计划使用原生 SSH 客户端，请在你将用于连接的设备上[安装][docs-install] Tailscale 并登录。

如果你使用的是自己的 SSH 服务器，你需要它的主机名或 IP 地址、端口，以及你所选身份验证方式所需的上游认证信息。

如果你只是想试用 Tailscale PAM，可以使用公共 SSH 沙箱。其设置见下表。

| 设置     | 值                          |
| -------- | --------------------------- |
| 主机名   | `ssh.playground.border0.io` |
| 端口     | `22`                        |
| 用户名   | `border0`                   |
| 密码     | `Border0<3Ssh`              |

该沙箱仅用于测试，并且会定期重置。关于其他可用于测试的沙箱服务，参见 [Tailscale PAM FAQ][docs-pam-faq-sandbox]。

## 创建 SSH PAM 服务

要为该远程 SSH 服务器创建 PAM 服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择**添加服务**。

3. 选择 **PAM 服务**。

4. 选择 **Secure Shell - Standard SSH**。

5. 选择**继续**。

6. 输入服务名称。

7. （可选）输入描述。

8. 选择是否启用会话录制。

9. 在**通过以下方式连接**中，选择一个或多个 Tailscale PAM 连接器。

   你选择的每个连接器都必须与上游 SSH 服务器有网络连通。

   一个服务可以使用多个连接器。当你在多个位置都有能独立到达同一台 SSH 服务器的连接器时，这可以提高可用性。

10. 选择**继续**。

11. 在 **Upstream hostname or IP** 中，填写上游 SSH 服务器的主机名或 IP 地址。

12. 在 **Port** 中，输入 SSH 端口。默认为 `22`。

13. 在 **Authentication type** 中，选择连接器向上游服务器进行身份验证应使用的方式。

    身份验证类型控制的是 Tailscale PAM 连接器如何向远程 SSH 服务器进行身份验证，并不会改变用户向 Tailscale PAM 进行身份验证的方式。用户始终使用自己的 Tailscale 身份连接。

    #### Username and password

    当上游 SSH 服务器接受密码身份验证时，选择 **Username and Password**。填写以下值：

    * **Username：** 连接器在上游 SSH 服务器上应使用的用户名。
    * **Password：** 该用户的密码。

    连接器在建立上游 SSH 连接时使用这些凭证。连接该 PAM 服务的用户无需知道这个用户名或密码。

    #### SSH private key

    当上游 SSH 服务器使用基于密钥的身份验证时，选择 **SSH Private Key**。填写以下值：

    * **Username：** 连接器在上游 SSH 服务器上应使用的用户名。
    * **SSH private key：** 与该用户已授权公钥相对应的私钥。

    连接器使用该私钥向上游服务器进行身份验证。你无需把密钥分发给通过 Tailscale PAM 连接的用户。

    私钥属于敏感凭证。

    > **警告：**
    >
    > 在生产环境中，尽量不要把长期有效的凭证直接存储在服务配置里，而是改用受支持的密钥来源。更多信息，参见[管理密钥与凭证][docs-pam-manage-secrets]。

    #### Tailscale PAM certificate

    选择 **Border0 Certificate**，使用 Tailscale PAM 内置的 SSH 证书身份验证。

    采用基于证书的身份验证后，你无需存储上游 SSH 密码或私钥。Tailscale PAM 会向连接器签发 SSH 证书，而上游 SSH 服务器信任由 Tailscale PAM SSH 证书颁发机构（CA）签名的证书。

    选择上游用户名的确定方式：

    * **Manual username**：输入连接器连接上游 SSH 服务器时应始终使用的用户名。
    * **Prompt Client for Username**：让用户在发起 SSH 连接时指定上游用户名。

    在使用基于证书的身份验证之前，你必须先配置上游 SSH 服务器信任 Tailscale PAM SSH CA。参见下一节。

14. 选择**保存**。

你的远程 SSH 服务已创建完成。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## （可选）为基于证书的身份验证配置服务器

如果你使用的是用户名和密码或 SSH 私钥身份验证，请跳过这一步。

对于基于证书的身份验证，上游 OpenSSH 服务器必须信任 Tailscale PAM SSH CA。

### 复制 SSH CA 证书

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。
2. 找到 **SSH certificate authority**。
3. 复制 CA 公钥。

你需要把这个公钥安装到每台应接受 Tailscale PAM 证书的上游 SSH 服务器上。

### 配置 OpenSSH 信任 CA 证书

1. 在上游 SSH 服务器上，为 CA 公钥创建一个文件：

   ```shell
   sudo tee /etc/ssh-ca.pub >/dev/null
   ```

2. 把 Tailscale PAM SSH CA 公钥粘贴进该文件，然后保存。

3. 要让 OpenSSH 信任由该 CA 签名的证书，请把以下几行添加到 `/etc/ssh/sshd_config`。

   ```shell
   TrustedUserCAKeys /etc/ssh-ca.pub
   AuthorizedPrincipalsFile /etc/ssh/authorized_principals
   ```

4. 创建 Tailscale PAM 所期望的 principals 文件：

   ```shell
   echo "border0_ssh_signed" | sudo tee /etc/ssh/authorized_principals
   ```

5. 重新加载 SSH 服务器：

   ```shell
   sudo service ssh reload
   ```

上游服务器现在可以接受由 Tailscale PAM SSH CA 签发的 SSH 证书了。当前的 PAM 证书流程使用 `border0_ssh_signed` 证书 principal。

如果你希望证书身份验证只对特定系统用户可用，请改用按用户配置的 `AuthorizedPrincipalsFile`。例如：

```shell
AuthorizedPrincipalsFile %h/.ssh/authorized_principals
```

然后只为允许使用 PAM 证书进行身份验证的用户添加 PAM 证书 principal。

## 为 SSH 服务授予访问权限

在用户连接之前，请确保有一条 Tailscale PAM [授权][docs-grants]允许他们访问该 SSH 服务。

例如，下面这条宽泛授权允许交互式 shell 会话、SSH exec 请求和 SFTP：

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

你还可以限制用户允许请求的上游用户名。注意，控制用户名只在内置 SSH 服务器或基于证书的身份验证下有效，因为使用密码或 SSH 密钥选项时，你总是静态地定义一个用户名：

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

SSH 权限可以分别控制交互式 shell 访问、exec 请求、SFTP、所请求的用户名和 TCP 转发。你还可以使用正则表达式把 exec 请求限制到特定命令。TCP 转发默认停用。

更多 SSH 授权示例和细粒度 SSH 访问控制的说明，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 连接到 SSH 服务器

主要的连接方式是通过 Tailscale 客户端，它可以启动你偏好的 SSH 客户端。你也可以完全在浏览器中，使用 Tailscale 浏览器客户端进行连接。

### 使用你偏好的 SSH 客户端连接

使用 Tailscale 客户端，用你设备上已安装的兼容 SSH 客户端快速打开该 SSH 服务。

1. 打开 Tailscale 客户端。
2. 打开 **Services**。
3. 选择你的 SSH 服务。
4. 选择你想使用的 SSH 客户端。

Tailscale 客户端会扫描你的设备上常见的 SSH 客户端，并显示它能找到的那些。选中其一即可建立 PAM 会话并为你启动该客户端。

你并不局限于 Tailscale 客户端中列出的 SSH 客户端。如果你偏好的客户端不在列表中，可以直接打开它，并使用该 PAM 服务的名称作为主机名。

例如：

```shell
ssh your-service-name
```

如果该服务使用 **Prompt Client for Username**，请指定你要使用的上游用户名：

```shell
ssh your-username@your-service-name
```

端口 `22` 是默认值，因此无需指定，除非你的 PAM 服务使用其他端口。

如果你选择的是 **Username and Password** 或 **SSH Private Key** 身份验证，SSH 客户端提供的任何用户名都会被忽略，Tailscale PAM 使用为该服务配置的用户名。客户端提供的用户名只在基于证书的身份验证且选择了 **Prompt Client for Username** 时才会使用。

Tailscale PAM 使用你的 Tailscale 身份为连接授权。随后连接器使用为该服务配置的用户名和密码、私钥或 PAM 证书向上游 SSH 服务器进行身份验证。

用户无需接触上游认证凭证。

### 从浏览器连接

你也可以完全在浏览器中，使用 Tailscale SSH 浏览器客户端进行连接。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services)。
2. 选择你要访问的 SSH 服务。
3. 选择**连接**，Tailscale SSH 浏览器客户端会随之打开。
4. 如果出现提示，请使用你的 Tailscale 身份进行身份验证。

如果该服务配置为提示输入上游用户名，请输入你要使用的用户名。

现在你可以直接在浏览器中使用交互式 SSH 会话了。

浏览器客户端通过 WebAssembly（Wasm）在浏览器中运行一个 Tailscale 客户端，并作为一台新的[临时节点（ephemeral node）][docs-ephemeral-nodes]出现在你的 tailnet 中。如果 tailnet 启用了[设备审批][docs-device-approval]，管理员必须先批准该浏览器设备，它才能连接。

## 保护上游凭证

对于用户名和密码或私钥身份验证，连接器需要能访问上游 SSH 服务器的凭证。

> **警告：**
>
> 在生产环境中，我们建议使用受支持的密钥来源把上游凭证保留在连接器本地，而不是直接存储在 PAM 服务配置中。

Tailscale PAM 支持由连接器在本地解析的密钥引用。例如，SSH 用户名可以来自本地文件，密码可以来自 AWS Secrets Manager：

```shell
Username:
from:file:/etc/ssh_username

Password:
from:aws:secretsmanager:/staging/sshpassword
```

受支持的密钥来源包括环境变量、本地文件、AWS Systems Manager Parameter Store、AWS Secrets Manager 和 Keeper Secrets Manager。

更多信息，参见[管理密钥与凭证][docs-pam-manage-secrets]。

基于证书的身份验证则避免了存储静态的上游 SSH 密码或私钥，改为由上游服务器信任 Tailscale PAM SSH CA。

## 查看 SSH 会话

Tailscale PAM 让你能够查看与你的远程 SSH 服务的连接。

打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，然后选择你的 SSH 服务的一个会话。你可以查看如下信息：

* 连接所用的 Tailscale 身份。
* 来源设备。
* 连接时间。
* 所访问的 SSH 服务。
* 所请求的 SSH 用户名。

启用会话录制后，你还可以查看录制下来的 SSH 会话。

这让你能直接回答两个很有用的问题：谁访问了该服务器，以及连接期间做了什么？

## 故障排查

如果你无法连接到你的 SSH 服务，请先确认连接器在线，并能到达上游 SSH 主机名和端口。

由于上游 SSH 连接是由连接器建立的，请尽量在运行连接器的设备上测试连通性。

### 用户名和密码身份验证

核实用户名和密码是否有效，以及上游 SSH 服务器是否启用了密码身份验证。

你可以直接在连接器上测试这些凭证：

```shell
ssh -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no \
  your-username@your-upstream-host
```

如果密码身份验证被停用，请在上游服务器的 `sshd_config` 中检查：

```
PasswordAuthentication yes
```

修改配置后请重新加载 SSH 服务。

### SSH 私钥身份验证

核实为 PAM 服务配置的用户名和私钥与上游 SSH 服务器已授权的公钥相匹配。

你可以直接在连接器上测试该密钥：

```shell
ssh -i ~/.ssh/id_rsa \
  -o PreferredAuthentications=publickey \
  -o IdentitiesOnly=yes \
  your-username@your-upstream-host
```

### 基于证书的身份验证

如果证书身份验证失败，请核实：

* 上游服务器在 `/etc/ssh-ca.pub` 中是否保存了正确的 Tailscale PAM SSH CA。
* `TrustedUserCAKeys` 是否指向正确的 CA 文件。
* `AuthorizedPrincipalsFile` 是否配置正确。
* principals 文件中是否存在预期的证书 principal。
* 客户端请求的用户名在上游系统上是否存在。
* 配置更改后 SSH 守护进程是否重新加载过。

如果上述排查步骤都无法解决问题，请查看连接器日志以及 Tailscale PAM [会话日志][docs-pam-session-logs]中失败会话的详情。这些失败会话有助于判断问题出在连接器可达性、上游身份验证、Tailscale PAM 访问控制还是 SSH 服务器配置。

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
