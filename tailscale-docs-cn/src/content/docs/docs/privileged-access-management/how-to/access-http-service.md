---
title: "使用 Tailscale PAM 访问 HTTP 服务"
description: "[Tailscale PAM][docs-pam] 让用户直接从浏览器获得对内部 Web 应用的、基于身份的访问。"
---

最后验证于 Sep 11, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

[Tailscale PAM][docs-pam] 让用户直接从浏览器获得对内部 Web 应用的、基于身份的访问。

你可以开放仪表盘、管理控制台、内部工具和其他 HTTP 或 HTTPS 应用，而不需要用户再管理一套访问凭证，也不用给他们更宽泛的网络访问权限。用户打开 Web 应用，使用其 [Tailscale 身份][docs-tailscale-identity]登录，Tailscale PAM 会根据你的 tailnet 访问策略中的 PAM 授权判断他们是否可以访问。

PAM 连接器代表用户处理与上游 Web 应用的连接。只要连接器能访问到上游应用，上游应用就可以留在你的私有网络中。

在实际使用中，这相当于在内部 Web 应用前面加了一层具备身份感知的访问层，同时用户仍保留直接在浏览器中打开应用的熟悉体验。

## HTTP 访问的工作方式

创建 HTTP PAM 服务后，Tailscale PAM 会为该服务提供一个可通过浏览器访问的端点。

用户打开它时：

1. 用户使用其 Tailscale 身份认证。
2. Tailscale PAM 检查其 tailnet 访问策略是否允许其使用该 HTTP 服务。
3. 如果允许访问，PAM 连接器把请求发送到上游 Web 应用。
4. 响应返回到用户的浏览器。

只有连接器需要与上游 Web 应用的网络连通性。上游应用本身无需用户可直接访问，甚至无需可从互联网访问。

Tailscale PAM 代理会为面向浏览器的服务处理 TLS，因此即使用户访问的是上游 HTTP 应用，他们也是通过 HTTPS 访问的。

## 前提条件

开始之前，确认你具备以下条件：

* 一个已安装且在线的 Tailscale PAM [连接器][docs-pam-connectors]。
* 一台能访问上游 Web 应用的连接器。
* 上游应用的主机名或 IP 地址和端口。
* 更新 [tailnet 策略文件][docs-tailnet-policy-file]的权限。

## 创建 HTTP PAM 服务

要创建该服务：

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Add service**。

3. 选择 **PAM service**。

4. 选择 **HTTP**（Web App）。

5. 选择 **Continue**。

6. 为服务起一个名称。

7. （可选）为服务提供描述。

8. 选择 **Session Recording** 选项是启用还是禁用。

9. 在 **Connect via** 中选择一个或多个 Tailscale PAM 连接器。

10. 选择 **Continue**。

11. 在 **Upstream Hostname or IP** 中输入 Web 应用的主机名或 IP 地址。

    例如：

    ```shell
    10.10.10.10
    ```

    也可以使用内部 DNS 名称：

    ```shell
    dashboard.internal.example.com
    ```

12. 在 **Port** 中输入上游 Web 应用监听的端口。

    例如：

    * HTTP 用 `80`。
    * HTTPS 用 `443`。
    * 如果你的应用使用自定义端口，则填 `8080` 或 `8443` 之类的值。

13. 在 **Scheme** 中为连接器与上游应用的通信方式选择以下之一：

    * HTTP
    * HTTPS

    此设置描述的是 PAM 连接器与上游应用之间的连接。

14. （可选）在 **Host header** 中输入连接器应发送给上游应用的 HTTP `Host` 头。

    当应用期望的主机名与你在 **Upstream hostname or IP** 中输入的相同时，留空即可。

    当上游服务器使用基于域名的虚拟主机，或以其他方式要求特定主机名时，设置不同的值。

    例如，连接器可能连接到：

    ```shell
    10.10.10.10
    ```

    同时发送：

    ```shell
    internal-dashboard.example.com
    ```

    作为 HTTP `Host` 头。

15. （可选）在 **Request headers** 中，你可以添加连接器随每个发往上游应用的请求一起发送的 HTTP 头。

    对每个想添加的请求头，选择 **Add header** 并填写头名称和值。

    当内部应用期望入站请求带有额外请求头时，这会很有用。
    这些是你自行配置的额外请求头。Tailscale PAM 还能自动把已认证用户的信息传递给上游应用，参见[把 Tailscale 身份传给你的 Web 应用][ar-pass-tailscale-identity]。

16. 选择 **Save**。

你的 HTTP PAM 服务已可使用。你可以在 [Services](https://console.tailscale.com/admin/services) 页面中访问它。

## 为 Web 应用授予访问权限

在用户打开应用之前，创建一条 Tailscale PAM [授权（grant）][docs-grants]，让他们能访问该 HTTP 服务。

例如，以下宽泛的授权允许 HTTP 访问：

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
              "http": {}
            }
          }
        ]
      }
    }
  ]
}
```

`http` 权限允许授权覆盖的来源访问 HTTP PAM 服务。PAM 授权使用与其他 Tailscale 服务类型相同的 Tailscale 访问策略模型。

> **警告：**
>
> 这个宽泛的示例适合入门使用。在生产环境中，请限制 `src` 和 `dst`，只让合适的用户、组、设备或标签访问他们所需的特定 Web 应用。
>
> 例如，你可以允许一个工程组访问内部部署仪表盘，而不让该组访问其他 PAM 服务。

关于编辑授权的信息，参见[在 tailnet 策略文件中编辑访问控制策略][docs-manage-tailnet-policies]。

关于 PAM 授权的更多信息，参见[控制对 Tailscale PAM 服务的访问][docs-pam-control-access]。

## 打开 Web 应用

配置好服务并授予访问权限后，用户可以直接从浏览器打开该 HTTP 服务。

用户不需要与上游 Web 应用的直接网络连通性。他们可以在浏览器中打开 PAM 服务并使用其 Tailscale 身份认证。

如果用户尚未认证，Tailscale PAM 会提示其登录。

认证后，Tailscale PAM 代理会根据 tailnet 策略检查该用户的访问权限。如果匹配的 PAM 授权允许对该服务进行 HTTP 访问，请求会被转发给连接器，由它把 Web 应用代理到用户的浏览器。

从用户的视角看，他们只是在浏览器中打开了该 Web 应用。他们不需要知道其私有 IP 地址，也不需要对它运行所在的网络有直接访问权。

## 查看 HTTP 会话

Tailscale PAM 为你提供一个集中位置，用于审查谁在何时访问了你的内部 Web 应用。

要查看 HTTP 会话，打开管理控制台的 [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) 页面，选择你想检查的会话。在那里你可以查看用户、其访问的服务以及该会话的相关信息。

启用 **Session recording** 后，Tailscale PAM 还会记录用户与 Web 应用的交互。

你可以从 PAM 会话日志回放录制的浏览器会话，审查用户使用应用期间发生了什么。

这让你同时掌握访问流程的两端：对*谁能打开应用*进行基于身份的控制，以及*他们连接之后发生了什么*的记录。

## 把 Tailscale 身份传给你的 Web 应用

除了你自己配置的请求头之外，Tailscale PAM 会随每个上游请求自动传递已认证用户的信息。

你的应用可以利用这些信息识别发起请求的用户，并且如果你愿意，还可以基于该身份做出自己的认证或授权决策。

Tailscale PAM 会添加如下身份头：

| HTTP 头 | 示例值 |
| --- | --- |
| `"X-Auth-Email"` | `"ameliepangolin@gmail.com"` |
| `"X-Auth-Expiresin"` | `"1234567890"` |
| `"X-Auth-Name"` | `"Amelie Pangolin"` |
| `"X-Auth-Subject"` | `"1234abcd-56ef-78ab-1111-abcd1234efab"` |
| `"X-Auth-Userid"` | `"ameliepangolin@gmail.com"` |
| `"X-Auth-Username"` | `"ameliepangolin@gmail.com"` |

这对支持通过可信反向代理进行认证的应用很有用。应用不必再让用户重新登录，可以直接使用 Tailscale PAM 已认证的身份。

有关使用这些请求头的示例，参见[在 Grafana 中使用 Tailscale 身份][docs-pam-grafana]。

### 验证身份头

如果你的应用依赖 `X-Auth-*` 请求头进行认证或授权，你可以用密码学方式验证这些身份信息确实来自 Tailscale PAM。

请求会包含如下签名元数据：

* `X-Auth-Sig`
* `X-Auth-Kid`
* `X-Auth-Timestamp`
* `X-Auth-Request-Id`

经认证的身份头（包括 `X-Auth-Email` 之类的头）都由签名覆盖。

Tailscale PAM 对请求的规范化表示（包括 HTTP 方法、路径、查询和已签名的请求头）使用 Ed25519 签名。你的应用可以用 `X-Auth-Kid` 找到对应的公钥，并在信任身份信息之前验证签名。

公钥签名密钥可从以下地址获取：

```shell
https://signing.border0.io/keys
```

在 Go 和 PHP 中验证这些签名的示例实现，参见 [HTTP 签名验证示例][xt-github-border0-httpsig]。

签名验证是可选的，但当你的应用使用转发的身份头做出涉及安全的认证或授权决策时，建议启用。

## 以编程方式访问 HTTP 服务

你可以从脚本、命令行客户端（例如 `curl`）或其他无法完成浏览器登录流程的工作负载访问 HTTP PAM 服务。为此，请使用客户端[服务账户][docs-pam-service-accounts]的令牌认证。客户端服务账户在 PAM 中代表一个 Tailscale [标签（tag）][docs-tags]。Tailscale PAM 会为 tailnet 中的每个标签自动创建一个客户端服务账户，因此你无需单独创建服务账户。

如果你想为工作负载使用新身份，请先在 tailnet 策略中[创建一个新标签][docs-tags-define]。然后为对应的客户端服务账户创建令牌：

1. 打开 Tailscale 管理控制台的 [PAM](https://console.tailscale.com/admin/settings/pam) 页面。
2. 在 **Service accounts** 部分，找到与你想让工作负载使用的 Tailscale 标签对应的客户端服务账户。客户端服务账户拥有 `client` 角色。
3. 选择其菜单，然后选择 **Edit**。
4. 选择 **Create token**。
5. 输入令牌名称。
6. 选择令牌有效期。
7. 选择 **Save**。
8. 复制该令牌并妥善保存。

把服务账户令牌当作机密对待。每个令牌都继承其服务账户的权限。

尽可能使用会过期的令牌，并选择适合你的自动化的最短有效期。

> **注意：**
>
> 令牌只是把请求标识为具有对应的标签客户端身份。创建令牌并不会让该身份获得对任何 HTTP 服务的访问权。你的 [tailnet 策略文件][docs-tailnet-policy-file]必须[包含一条 PAM 授权][docs-pam-control-access]，允许该标签访问该 HTTP 服务。

关于客户端服务账户及其令牌保护的更多信息，参见 Tailscale PAM [服务账户][docs-pam-service-accounts]。

现在你可以使用 `Border0-Token` 请求头把令牌传给 HTTP 服务：

```shell
export BORDER0_TOKEN=<your-token>

curl https://<your-service> \
  -H "Border0-Token: $BORDER0_TOKEN"
```

把 `<your-token>` 替换为你的令牌，把 `https://<your-service>` 替换为你的 HTTP PAM 服务 URL。

Tailscale PAM 使用 `Border0-Token` 头而不是标准的 `Authorization` 头，这样 PAM 认证就不会与上游 HTTP 应用要求的认证头发生冲突。

## 故障排查

如果你无法打开某个 HTTP PAM 服务，首先确认 PAM 连接器在线。

然后验证：

* 连接器能访问所配置的上游主机名或 IP 地址。
* 所配置的端口正确。
* 所选的 **Scheme** 与上游应用使用的协议一致。
* PAM 授权允许你的 Tailscale 身份对该服务进行 HTTP 访问。

如果上游应用返回了意外的页面或错误，请检查 **Host header**。使用基于域名的虚拟主机的应用，即使连接器是通过 IP 地址或不同 DNS 名称访问它的，也可能要求特定的主机名。

如果你配置了额外的请求头，验证头名称和值是否正确。

HTTP 服务的公开主机名可能与你直接访问应用所用的主机名不同。这可能导致单点登录（SSO）失败。更多信息（包括解决办法）参见[排查 HTTP 服务的 SSO 登录失败][docs-pam-http-service-troubleshoot-sso-failure]。

[ar-pass-tailscale-identity]: #把-tailscale-身份传给你的-web-应用

[docs-grants]: /docs/features/access-control/grants

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-grafana]: /docs/privileged-access-management/how-to/access-http-service/grafana

[docs-pam-http-service-troubleshoot-sso-failure]: /docs/privileged-access-management/how-to/access-http-service/troubleshoot-sso-failure

[docs-pam-service-accounts]: /docs/privileged-access-management/service-accounts

[docs-pam]: /docs/privileged-access-management

[docs-tags-define]: /docs/features/tags#定义标签

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-github-border0-httpsig]: https://github.com/borderzero/examples/tree/main/httpsig
