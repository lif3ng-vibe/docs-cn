---
title: "应用连接器使用最佳实践"
description: "为确保应用连接器的可靠运行，我们推荐多项最佳实践。预先配置设置与采用延迟批准等方法可以简化设置流程并减少潜在"
---

最后验证于 Oct 7, 2026

> **注意：** [所有套餐](https://tailscale.com/pricing)均提供应用连接器（app connector）。

要确保应用连接器的可靠运行，我们推荐以下几项最佳实践。预先配置设置、采用延迟批准等方法可以简化设置流程并减少潜在的中断。了解流量的路由方式——尤其是在复杂或多租户环境中——也有助于避免性能问题以及对你的应用的非预期访问。

## 配置应用以进行路由发现

你可以使用域名、CNAME 记录和通配符来优化应用连接器的路由发现与效率。

### 域名

你可以为应用连接器配置一列有效的完全限定域名（FQDN）。Tailscale 会将 IPv4 地址的 `A` 记录、IPv6 地址的 `AAAA` 记录等 DNS 记录经由应用连接器路由。

向应用连接器的配置中添加域名后，它会自动发现路由。在没有预配置路由的情况下，应用连接器会进入学习期，在此期间代理终端用户对已配置域名的 DNS 请求。应用连接器从这些请求中识别路由记录，并将其作为路由对外通告。

启用[自动批准][docs-policy-syntax-autoapprovers]后，Tailscale 会自动批准新发现的路由，并立即向设备通告。当应用连接器发现全部路由后，学习期即告结束。较小的域名通常很快就能完成；大型域名列表或带通配符的域名则可能需要更长时间。

如果多个应用连接器通告了同一路由，Tailscale 会使用 tailnet 的[路由选择选项][docs-route-selection]为每个客户端挑选一个合适的应用连接器。

### DNS 查找

应用连接器的工作方式是充当应用所配置域名的权威域名服务器。例如，当你为某个域名（如 `*.example.com`）配置应用时，会创建一条不可见的分割 DNS（split DNS）条目。此后，所有针对 `*.example.com` 的 DNS 查找都会被 Tailscale 发送给相应的应用连接器。每个应用连接器都会执行该 DNS 查找；如果查找成功，它会先为解析出的 IP 地址引入一条新的子网路由，再把响应返回给发起 DNS 查找的设备。

### DNS 发现所需的端口访问

要让 DNS 发现正常工作，客户端设备需要能够访问应用连接器的标签（tag）。发现机制使用 PeerAPI，这要求应用连接器以对等节点（peer）的身份可见。

授予最小访问权限即可启用对等发现，例如端口 `53` 上的 TCP 或 UDP（`tcp:53` 或 `udp:53`）。若没有该访问权限，DNS 查找将无法到达应用连接器，路由发现也就不会发生。

### CNAME 记录

应用连接器支持 CNAME 记录：它会将 CNAME 解析到目标地址，并自动通告最终得到的路由。由于 CNAME 是 DNS 别名（而非路由记录），连接器会沿着别名链逐级解析，并自动通告最终得到的路由。CNAME 链是一串 DNS 记录，其中每条 CNAME 都指向另一个域名，直到最终解析为一条表明目标 IP 地址的 A 记录。

使用 [`dig`][xt-wikipedia-dig] 命令验证 CNAME 配置。下面的代码块是预期输出的示例：

```shell
.1. app.acme.com IN CNAME acme.backend.com
.2. acme.backend.com A ...
```

在上面的示例中，将发布路由通告的是 `CNAME` 链的目标 `acme.backend.com`，而不是 `app.acme.com`。

如果 Web 服务使用基于地理位置的 DNS 负载均衡，`CNAME` 记录在不同位置可能返回不同结果。我们建议在与你组织全球部署相匹配的位置部署应用连接器，并使用区域路由或 MagicRoute 为每个客户端在合适的应用连接器之间做出选择。详情参见[路由选择][docs-route-selection]。

### 通配符

应用连接器配置中可以包含通配符（`*`）。通配符不包含父域名本身。例如：

* 要包含 `acme.com` 及其全部子域，请同时使用 `acme.com` 和 `*.acme.com`。
* 只想包含顶级域名时，加入 `acme.com` 并省略 `*.acme.com`。
* 只想包含子域时，加入 `*.acme.com` 并省略 `acme.com`。

## 基于访问控制策略的路由配置

你可以在 [tailnet 策略文件][docs-tailnet-policy-file]的 `nodeAttrs` 顶层字段中，以[访问控制策略][docs-access-control]的形式手动预配置路由，包括域名配置。例如：

```json
{
  "target": ["*"],
  "app": {
    "tailscale.com/app-connectors": [
      {
        "name": "example-app",
        "connectors": ["tag:example-connector"],
        "domains": ["example.com"],
        "routes": ["192.0.2.0/24"],
      }
    ],
  },
}
```

\[缺失片段：visual\_policy\_editor.mdx]

对 tailnet 策略文件应用[访问控制策略][docs-access-control]变更后，tailnet 中的应用连接器设备会立即自动通告这些路由。该应用的应用连接器会马上通告这些路由；通过 tailnet 策略文件的访问控制策略部分添加的路由会被隐式批准，无需同时添加 [`autoApprovers`][docs-policy-syntax-autoapprovers] 条目。

这把严格的路由控制纳入了访问控制与批准流程之中。在许多情况下，它还免除了在设备配置中使用庞大的 `--advertise-routes` 参数的需要，从而避免漫长的发现期以及具破坏性的路由变更。

## 路由合并

由基于访问控制策略的路由配置填充的路由，会与新通告所覆盖的子路由合并或将其替换。例如，如果应用连接器此前发现了 `192.0.2.5/32` 和 `192.0.2.67/32`，而你更新[访问控制策略][docs-access-control]加入 `192.0.2.0/24`，连接器就会用单一的 `192.0.2.0/24` 条目替换这两条 `/32` 路由。

## 减少路由发现期间的重配置

在防火墙配置严格的环境中，应用连接器的路由发现可能造成干扰。在这类环境中，新路由可能会干扰 Google Chrome 等具备路由感知能力的软件。

对于单次域名解析发现的所有 IP，应用连接器会将其作为一次路由变更立即通告，其中包含该次域名解析新发现的全部路由。

为缩短发现期间的重配置时间，我们建议你从以下策略中选择一种：

* 尽可能广泛地使用[预配置][ar-preconfiguration]和基于访问控制策略的路由配置。
* 采用[延迟批准][ar-deferred-approvals]。在延迟批准模式下，你先推迟启用应用防火墙，待以未批准状态发现路由后，再分批全部批准。

## 配置使用多租户 IP 空间的应用

有些应用使用内容分发网络（CDN）或共享 IP 空间来提供静态资源，例如 `*.static.example.com` 或 `*.assets.acme.com`。

将这些路由发布给应用连接器，可能会迫使无关流量经过应用连接器，因为 CDN 常常共享 IP，同一批公共 IP 地址上可能还承载着指向其他内容的流量。其副作用是，这些连接器可能因与目标应用无关的站点而产生很高的带宽占用。因此，我们建议在应用连接器之外提供 CDN 与多租户内容。

## 连接大型 SaaS 服务

新的路由通告会触发客户端网络变更，进而可能引发报错。例如，Google Chrome 可能会报告 `ERR_NETWORK_CHANGED` 之类的错误。你可以借助[延迟批准][ar-deferred-approvals]或[预配置][ar-preconfiguration]来降低此类事件的发生频率。

### 延迟批准

延迟批准方法为新应用连接器内置了一段不造成干扰的学习期。你可以暂时禁用路由批准，或使用上游 IP 防火墙，来推迟批准。

*（图：待具有代表性的业务周期结束后，再批准路由。）*

单独安装各个应用连接器，以避免 [autoApprovers][docs-policy-syntax-autoapprovers] 相互重叠。应用连接器会接收来自客户端集群的 DNS 查询并配置要通告的路由，但路由保持未批准状态，流量也维持原有模式。让系统在这种状态下运行业务运营的代表性时段（例如一周），即可收集到绝大多数受影响的路由。随后你就可以把这些路由转移进 `autoApprovers` 子句。

在你批准路由之前，延迟批准会阻止用户访问相应应用。

### 预配置

*（图：在设置连接器的同时配置路由）*

如果无法让应用在不造成干扰的学习期内运行足够长的时间，以收集[延迟批准][ar-deferred-approvals]方法所需的全部受影响路由，你可以对应用进行预配置。我们建议你在设置应用连接器时配置路由，并在配置应用时配置已知子域。

即使在可以采用延迟批准的情况下，预配置也能缩短学习期。

#### 路由

诸如 GitHub、Okta 等许多服务都会发布 IP 地址列表，你可以将其汇集到应用连接器的 `--advertise-routes` 偏好设置中。预配置路由能在以下方面带来优化：

* 使用地址段而非单个 IP 地址，减小路由表规模并降低成本。
* 由于服务所用的大多数路由在启动时即已配置，你可以立即启用上游 WAF。

#### 域名

许多应用带有通配符域名，应用连接器由于不知道需要解析的全部子域而无法预先探测。如果你知道全部子域，可以在通配符域名之外显式添加它们，以生成一份预配置路由列表。

提示：你可以从浏览器历史、DNS 服务器历史和 DNS 日志中收集子域。

#### 自动化预配置

你可以使用 Tailscale 提供的 [connector-gen][xt-gh-tailscale-cmd-connector-gen] 工具实现预配置自动化。它提供了一个简单示例，演示如何解析一些常见提供商，并生成 [tailnet 策略文件][docs-tailnet-policy-file]片段和 [`--advertise-routes`][docs-subnet-router] 标志，供你手动执行路由预配置策略。

运行 connector-gen 工具：

```shell
 ./tool/go run ./cmd/connector-gen github
```

上面的示例会生成访问控制策略的 JSON 片段和一个 `--advertise-routes` 标志。

#### 使用 Terraform 自动化

> **警告：**
>
> 使用 Terraform 管理 tailnet 策略文件，会在下一次同步时覆盖你在管理控制台中所做的任何手动更改。请确保所有应用连接器配置都通过 Terraform 管理，以免丢失设置。

Terraform 提供一种 HTTP 数据源（data provider），可用于读取来自上游提供商的 IP 地址列表，进而在部署应用连接器时用这些列表预配置路由。

下面的示例展示了 Okta、GitHub、Amazon Web Services（AWS）等服务的预配置。

```hcl
data "http" "okta_ip_range_json" {
  url = "https://s3.amazonaws.com/okta-ip-ranges/ip_ranges.json"
}

locals {
  okta_ip_range_data = jsondecode(data.http.okta_ip_range_json.response_body)
  okta_cell_ranges   = [for key in keys(local.okta_ip_range_data) : local.okta_ip_range_data["${key}"].ip_ranges if key == "us_cell_1"]
  okta_ip_ranges     = sort(distinct(flatten(local.okta_cell_ranges)))
}

data "http" "github_meta_json" {
  url = "https://api.github.com/meta"
}

locals {
  github_meta    = jsondecode(data.http.github_meta_json.response_body)
  github_ips     = concat(local.github_meta.hooks, local.github_meta.web, local.github_meta.api, local.github_meta.git, local.github_meta.github_enterprise_importer, local.github_meta.packages, local.github_meta.pages, local.github_meta.importer, local.github_meta.actions, local.github_meta.dependabot)
  github_domains = concat(local.github_meta.domains.website, local.github_meta.domains.codespaces, local.github_meta.domains.copilot, local.github_meta.domains.packages, local.github_meta.domains.actions)
}

data "http" "aws_ip_ranges_json" {
  url = "https://ip-ranges.amazonaws.com/ip-ranges.json"
}

locals {
  aws_ip_range_data = jsondecode(data.http.aws_ip_ranges_json.response_body)
  aws_ip_ranges     = sort(distinct(concat([for prefix in local.aws_ip_range_data.prefixes : prefix.ip_prefix], [for prefix in local.aws_ip_range_data.ipv6_prefixes : prefix.ipv6_prefix])))
}

locals {
  all_ip_ranges = concat(local.okta_ip_ranges, local.github_ips, local.aws_ip_ranges)
}
```

[ar-deferred-approvals]: #延迟批准

[ar-preconfiguration]: #预配置

[docs-access-control]: /docs/features/access-control

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-route-selection]: /docs/features/route-selection

[docs-subnet-router]: /docs/features/subnet-routers#connect-to-tailscale-as-a-subnet-router

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-gh-tailscale-cmd-connector-gen]: https://github.com/tailscale/tailscale/tree/main/cmd/connector-gen

[xt-wikipedia-dig]: https://en.wikipedia.org/wiki/Dig_\(command\)
