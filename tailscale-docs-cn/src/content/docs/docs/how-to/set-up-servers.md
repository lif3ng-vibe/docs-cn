---
title: "在 Tailscale 网络上设置服务器"
description: "在 tailnet 中设置服务器，并使用 Tailscale SSH 管理这些服务器的身份认证。"
---

最后验证于 Dec 4, 2025

如果你要在 Tailscale 上搭建服务器，我们建议你使用[认证密钥][docs-auth-keys]预配服务器，并使用[标签][docs-tags]限制其访问。你还可以设置 [Tailscale SSH][docs-tailscale-ssh] 来访问你的服务器。

在 Tailscale 中设置服务器的方法如下：

1. 在 tailnet 中为你所管理的共享资源类型创建一个新[标签][docs-tags]。例如，可以为服务器使用 `server` 标签，为环境使用 `prod` 或 `test` 标签，用 `front-end` 分组你维护的其他资源。

   要创建标签，需修改 [tailnet 策略文件][docs-acls]，指定标签的拥有者，即可以使用该标签的团队或用户。你可以对所有服务器沿用现有标签。如果你还要设置 Tailscale SSH，我们建议使用新标签。

   ```json
   {
     "tagOwners": {
       "tag:server": ["alice@example.com"]
     }
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

2. 在 tailnet 策略文件中编写[访问规则][docs-policy-syntax-acls]：

   * 允许所需的来源访问带标签的资源
   * 如果你还要设置 Tailscale SSH，允许所需的来源使用 Tailscale SSH 访问带标签的资源

   ```json
   {
     "grants": [
       {
         "src": ["group:sre"],
         "dst": ["tag:server"],
         "ip": ["*"]
       }
     ],
     "ssh": [
       {
         "action": "accept",
         "src": ["group:sre"],
         "dst": ["tag:server"],
         "users": ["ubuntu", "root"]
       }
     ]
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

3. 生成[认证密钥][docs-auth-keys]，让服务器自动连接到你的网络。在该认证密钥中选择你希望用于服务器的标签。

   * 如果要认证多台服务器，请使用可复用的认证密钥。或者，对于长期有效的认证密钥，设置[具有 `auth_keys` 作用域的 OAuth 客户端][docs-oauth-clients-generate-long]。
   * 如果要认证容器或函数这类临时工作负载，请使用临时密钥（ephemeral key）。
   * 如果你的 tailnet 启用了[设备审批][docs-device-approval]，并且你只打算用它审批最终用户设备，请使用预授权认证密钥。

   *（图：Tailscale 的认证密钥生成页面）*

> **注意：**

> **注意：**
>
> 目前，如果你的客户端节点是使用[认证密钥][docs-auth-keys]预配的，则无法在以该节点作为来源建立 Tailscale SSH 连接时使用[检查模式][docs-tailscale-ssh-check-mode]。

4. 预配新服务器时，手动或作为自动化工具的一部分[安装][co-download] Tailscale 并连接到 Tailscale。请确保指定包含所需标签的认证密钥，并启用 Tailscale SSH。

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY
   ```

   如果你想为服务器指定特定的机器名称以便与 [MagicDNS][docs-magicdns] 配合使用，还需指定 `--hostname`：

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --hostname=$TS_HOSTNAME
   ```

   如果认证密钥生成时未包含标签，还需指定 `--advertise-tags`：

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --advertise-tags=<tags>
   ```

   如果你想启用 Tailscale SSH，还需指定 `--ssh`：

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --ssh
   ```

5. 要通过 Tailscale 访问你的服务器，可以像访问 tailnet 中的其他设备一样连接它们。

   如果你已设置 Tailscale SSH，可以使用 [Tailscale SSH][docs-tailscale-ssh] 或 [Tailscale SSH 控制台][docs-tailscale-ssh-console]连接你的服务器。

[co-download]: https://tailscale.com/download

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-tags]: /docs/features/tags

[docs-acls]: /docs/features/access-control/acls

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients-generate-long]: /docs/features/oauth-clients#生成长期认证密钥

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#检查模式

[docs-tailscale-ssh-console]: /docs/features/tailscale-ssh/tailscale-ssh-console

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
