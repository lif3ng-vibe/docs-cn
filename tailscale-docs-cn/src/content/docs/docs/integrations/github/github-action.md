---
title: "Tailscale GitHub Action"
description: "The [Tailscale GitHub Action][xt-gh-connect-tailscale] 是一个 [GitHub Action][xt-gh-actions]，让你可以把 Tailscale 网络（即 tailnet）连接到 GitHub Actions [工作流][xt-gh-workflows]。"
---

最后验证于 Jan 30, 2026

[Tailscale GitHub Action][xt-gh-connect-tailscale] 是一个 [GitHub Action][xt-gh-actions]，让你可以把 Tailscale 网络（即 tailnet）连接到 GitHub Actions [工作流][xt-gh-workflows]。

你可以直接从 GitHub 工作流访问 tailnet 中的设备，这带来了一系列可能性：

* 将应用安全地部署到内部服务器（即使你使用的是 [GitHub 托管的 runner][xt-gh-hosted-runner]）。
* 安全地访问面向特定平台的[自托管 runner][xt-gh-self-hosted-runner]。
* 访问你的测试数据数据库，而不必将其暴露在互联网上。
* 访问内部部署监控工具。

## 前提条件

使用 Tailscale GitHub Action 之前，请确保具备以下条件：

1. 一个拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 Tailscale 账户。
2. 一个你有管理员权限的 GitHub 仓库（设置 GitHub Action 时需要）。
3. 至少一个已配置的[标签（tag）][docs-tags]。
4. 一个[联合身份][docs-workload-identity-federation]的 client ID 与 audience，或一个 [OAuth 客户端][docs-oauth-clients]的 ID 与密钥，或一个[认证密钥（auth key）][docs-auth-keys]。
5. runner 镜像版本 >= 2.237.1（支持运行 Node.js 24 所需）。

## 工作原理

当你把 Tailscale GitHub Action 添加到工作流后，GitHub Action 中后续的步骤就可以访问 tailnet 中的节点。例如，工作流可以访问一个存有测试数据数据库的节点。

Tailscale GitHub Action 需要以下之一：一个[联合身份][docs-workload-identity-federation]的 client ID 与 audience，或一个 [OAuth 客户端][docs-oauth-clients]的 ID 与密钥，或一个[认证密钥][docs-auth-keys]；它必须使用[标签身份][docs-tags]，并且是可重用、临时的，以及（如适用）[预批准][docs-device-approval]的。

我们建议你提供联合身份的 client ID 与 audience，使用工作负载身份联合（workload identity federation）进行身份验证。联合身份需要 [`auth_keys`][docs-trust-credentials-scopes] 作用域。你可以将联合身份的 client ID 存储为 [GitHub 加密机密][xt-gh-secrets]。联合身份不与 tailnet 中的任何用户关联，因此你必须创建一个[标签][docs-tags]来标识 GitHub runner。当你用标签标识某台设备（例如 GitHub runner）时，授予该标签的访问权限会自动应用到它。

工作流运行时，会使用联合身份与 GitHub JWT 身份令牌创建一个[临时节点（ephemeral node）][docs-ephemeral-nodes]。随后，该临时节点可以基于授予你用于标识 GitHub runner 的标签的访问权限，访问 tailnet 中的设备。

在启用了[设备审批（device approval）][docs-device-approval]的 tailnet 中，Tailscale GitHub Action 使用联合身份创建的任何临时节点都是[预批准][docs-auth-keys-types]的。

CI 工作流完成后，GitHub Action 会立即注销该临时节点，此时控制服务器（control server）会自动将该临时节点从你的 tailnet 中移除。下一次运行该 action 时，它会创建一个新的临时节点，仅对新工作流可用。

## 将 Tailscale GitHub Action 添加到工作流

1. 为 Tailscale GitHub Action 将创建的临时节点创建至少一个[标签][docs-tags]。例如本例使用的 `tag:ci`。你授予这些标签的访问权限会应用到工作流将创建的节点上。
2. 设置 [Tailscale 联合身份][docs-workload-identity-federation-setup]。你需要联合身份的 **Client ID** 与 **Audience** 值。
3. 创建一个名为 `TS_OAUTH_CLIENT_ID` 的 [GitHub 仓库][xt-gh-secrets-in-actions]机密，并将其值设置为你的 OAuth **Client ID**。
4. 创建一个名为 `TS_AUDIENCE` 的 GitHub 仓库机密，并将其值设置为你的联合身份 **Audience**。
5. 在你的 GitHub Actions [工作流][xt-gh-workflows]中，使用 Tailscale GitHub Action 连接到你的 tailnet。例如：

   ```yaml
   - name: Tailscale
     uses: tailscale/github-action@v4
     with:
       oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
       audience: ${{ secrets.TS_AUDIENCE }}
       tags: tag:ci
   ```

`oauth-client-id` 与 `audience` 分别是你的联合身份 Client ID 与 audience。`tags` 是一个以逗号分隔的标签列表，会应用到 GitHub Action 创建的临时节点上。这些标签必须已存在于你的 tailnet 中。

工作负载身份联合要求为工作流设置 `id-token: write` [权限配置][xt-gh-permission-setting]：

```yaml
permissions:
  id-token: write # Tailscale action 需要此项才能向 GitHub 请求 JWT
  # 工作流所需的其他权限
```

action 运行时会创建一个临时节点。该节点可以访问 tailnet 中的节点，但受应用于指定标签的访问规则约束。在工作流的其余部分，按需访问 tailnet 中的其他节点。

action 结束后不久，临时节点会被自动清理。

## 使用 OAuth 客户端

1. 为 Tailscale GitHub Action 将创建的临时节点创建至少一个[标签][docs-tags]。例如本例使用的 `tag:ci`。你授予这些标签的访问权限会应用到工作流将创建的节点上。
2. 设置一个 [Tailscale OAuth 客户端][docs-oauth-clients-setup]。你需要 OAuth **Client ID** 与 **Client secret** 的值。如果你使用[认证密钥][docs-auth-keys]而非 OAuth 客户端，请参阅[使用认证密钥][ar-auth-key-local]。
3. 创建一个名为 `TS_OAUTH_CLIENT_ID` 的 [GitHub 仓库][xt-gh-secrets-in-actions]机密，并将其值设置为你的 OAuth **Client ID**。
4. 创建一个名为 `TS_OAUTH_SECRET` 的 GitHub 仓库机密，并将其值设置为你的 OAuth **Client secret**。
5. 在你的 GitHub Actions [工作流][xt-gh-workflows]中，使用 Tailscale GitHub Action 连接到你的 tailnet。例如：

```yaml
- name: Tailscale
  uses: tailscale/github-action@v4
  with:
    oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
    oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
    tags: tag:ci
```

`oauth-client-id` 与 `oauth-secret` 分别是你的 OAuth Client ID 与 Client secret。`tags` 是一个以逗号分隔的标签列表，会应用到 GitHub Action 创建的临时节点上。这些标签必须已存在于你的 tailnet 中。

action 运行时会创建一个临时节点。该节点可以访问 tailnet 中的节点，但受应用于指定标签的访问规则约束。在工作流的其余部分，按需访问 tailnet 中的其他节点。

action 结束后不久，临时节点会被自动清理。

## 认证密钥相关注意事项

如果你使用[认证密钥][docs-auth-keys]而非 OAuth 客户端，最佳实践是确保[密钥类型][docs-auth-keys-types]使用标签身份、可重用且临时。如果 tailnet 启用了[设备审批][docs-device-approval]，还应确保密钥类型是预批准的。

要在工作流中使用认证密钥，请创建一个名为 `TAILSCALE_AUTHKEY` 的 GitHub 机密，并将其值设置为你的认证密钥。然后在你的工作流中使用 `authkey` 字段引用该机密。例如：

```yaml
- name: Tailscale
  uses: tailscale/github-action@v4
  with:
    authkey: ${{ secrets.TAILSCALE_AUTHKEY }}
```

## 用 ping 验证连通性

新 tailnet 设备的信息（例如该 GitHub Action 创建的临时节点）需要一些时间才能传播到整个 tailnet，期间你可能遇到短暂延迟。
这些设备只有在收到该信息后，才允许来自你的 GitHub 工作流节点的连接。
Tailscale 建议你使用 `ping` 参数指定目标设备的 IP 地址或主机名，以检查与它们的连通性。
GitHub Action 最多会等待三分钟，以验证与所列节点之间[直连或中继][docs-connection-types]的连通性。

例如：

```yaml
- name: Tailscale
  uses: tailscale/github-action@v4
  with:
    ping: 100.x.y.z,machine-1.my-tailnet.ts.net,machine-2
```

如果你不想使用 `ping` 功能，或者在工作流中安装 Tailscale 时还不知道对端的 tailnet 设备，可以考虑在你自己的工作流步骤中使用 [`tailscale ping`][docs-ping] 命令：

```bash
tailscale ping my-target.my-tailnet.ts.net
```

## Tailscale 客户端版本

Tailscale 不会在每次发布新客户端时都更新 Tailscale GitHub Action 的客户端版本。基础 YAML 文件中指定的[默认版本][xt-gh-ts-yaml-version]会长期保持不变，只有在有充分理由时才会更改。

如果你想自行设置版本，请在工作流中添加一个 `version` 条目：

```yaml
  - name: Tailscale
    uses: tailscale/github-action@v4
    with:
      oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
      audience: ${{ secrets.TS_AUDIENCE }}
      tags: tag:ci
      version: 1.66.0
```

如果你想指定最新的稳定版本，请将 `version` 设置为 `latest`。

```yaml
  - name: Tailscale
    uses: tailscale/github-action@v4
    with:
      oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
      audience: ${{ secrets.TS_AUDIENCE }}
      tags: tag:ci
      version: latest
```

如果你想指定最新的不稳定版本，请将 `version` 设置为 `unstable`。

```yaml
  - name: Tailscale
    uses: tailscale/github-action@v4
    with:
      oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
      audience: ${{ secrets.TS_AUDIENCE }}
      tags: tag:ci
      version: unstable
```

最新的 Tailscale 稳定版本号可以在我们的 [stable 发布通道][pk-stable-static]找到，最新的不稳定版本号可以在 [unstable 发布通道][pk-unstable-static]找到。

对于 Linux 与 Windows，使用的是发布在 [`https://pkgs.tailscale.com/unstable`][pk-unstable] 上的版本；macOS 使用的则是 [`https://github.com/tailscale/tailscale/`][xt-gh-ts-tailscale] `main` 分支的 `HEAD`。

## 缓存 Tailscale 二进制文件

缓存可以减少网络连接较慢的 runner 上的下载时间与下载失败。缓存默认启用。

你可以通过向 `use-cache` 输入传入 `'false'` 来选择不缓存 Tailscale 二进制文件：

```yaml
  - name: Tailscale
    uses: tailscale/github-action@v4
    with:
      oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
      audience: ${{ secrets.TS_AUDIENCE }}
      use-cache: 'false'
```

[ar-auth-key-local]: #认证密钥相关注意事项

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-auth-keys-types]: /docs/features/access-control/auth-keys#认证密钥的类型

[docs-connection-types]: /docs/reference/connection-types

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-ping]: /docs/reference/tailscale-cli#ping

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-oauth-clients-setup]: /docs/features/oauth-clients#设置-oauth-客户端

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[docs-workload-identity-federation-setup]: /docs/features/workload-identity-federation#设置联合身份

[docs-tags]: /docs/features/tags

[docs-trust-credentials-scopes]: /docs/reference/trust-credentials#权限范围scopes

[pk-stable-static]: https://pkgs.tailscale.com/stable/#static

[pk-unstable]: https://pkgs.tailscale.com/unstable/

[pk-unstable-static]: https://pkgs.tailscale.com/unstable/#static

[xt-gh-actions]: https://github.com/features/actions

[xt-gh-connect-tailscale]: https://github.com/marketplace/actions/connect-tailscale

[xt-gh-hosted-runner]: https://docs.github.com/en/actions/concepts/runners/github-hosted-runners

[xt-gh-permission-setting]: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers#adding-permissions-settings

[xt-gh-secrets]: https://docs.github.com/en/actions/security-guides/encrypted-secrets

[xt-gh-secrets-in-actions]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets

[xt-gh-self-hosted-runner]: https://docs.github.com/en/actions/concepts/runners/self-hosted-runners

[xt-gh-ts-tailscale]: https://github.com/tailscale/tailscale/

[xt-gh-ts-yaml-version]: https://github.com/tailscale/github-action/blob/main/action.yml#L23

[xt-gh-workflows]: https://docs.github.com/en/actions/using-workflows/about-workflows
