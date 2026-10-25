---
title: "Tailscale Services"
description: "使用 Tailscale Services 安全地连接到内部资源并管理其访问权限。"
---

最后验证于 Oct 7, 2026

Tailscale Services 让你可以将内部资源（例如数据库或 Web 服务器）作为命名服务发布到你的 Tailscale 网络（即 tailnet）中。

用户无需连接到特定设备，而是使用稳定的 [MagicDNS][docs-magicdns] 名称连接到 Tailscale Services，同时 Tailscale 会自动将流量路由到你基础设施中可用的主机。

当你把服务迁移到另一台主机、添加冗余主机或跨区域部署时，服务的地址保持不变。你还可以为不同的网络层配置访问控制、审批工作流和端点类型。

Tailscale Services 提高了可靠性，利用了 Tailscale 带访问控制的路由，并提供了一种集中管理 Tailscale 网络中所有内部资源的方式。你可以专注于维护应用程序，而把网络复杂性交给 Tailscale 处理。

## 用例

你可以在多种场景下使用 Tailscale Services，以安全的方式在 tailnet 内暴露内部资源，并将其与承载它们的设备解耦。例如：

* **开发工作流与内部工具**：让任何内部应用或开发资源实现高可用、可横向扩展且安全，而无需复杂的负载均衡器配置。
* **数据库连接**：安全地连接到数据库集群（PostgreSQL、MySQL、RDS），简化连接扩展并获得基于身份的访问控制。
* **集群互联**：在 EC2 实例、Kubernetes 服务或容器等任意计算资源之间实现跨集群或混合云连接。
* **版本控制的应用**：为频繁更新、纳入版本控制或临时的资源生成稳定的主机名，并在多次部署之间保持不变。
* **物联网集成**：将设备日志和遥测数据安全地流式传输到 SIEM 或日志服务，而无需将物联网设备暴露给公共互联网。
* **内部 API 与 webhook**：在无需公共域名或复杂 mTLS 配置的情况下安全地暴露内部 API，同时保持细粒度的访问控制。

## 前提条件

要开始使用 Tailscale Services，你必须具备：

* 一个处于活动状态的 tailnet。
* 一台或多台运行 Tailscale v1.86.0 或更高版本的设备，或者是 [unstable][docs-install-unstable] 渠道的 v1.87.x 版本。
* 具有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 账户权限。
* 一个运行在 tailnet 中某台设备上、你想暴露为 Tailscale Service 的内部资源。承载该资源的设备必须使用[基于标签][docs-tags]的身份。

## 开始使用

要开始使用 Tailscale Services，你需要通过管理控制台定义一个 Service，在 tailnet 中的一台设备（主机）上配置一个端点，然后通告该端点。

### 第 1 步：定义 Tailscale Service

你通过管理控制台定义 Tailscale Service。每个 Tailscale Service 由一个 MagicDNS 名称、一个 TailVIP（Tailscale 虚拟 IP 地址）、一个资源定义以及一台或多台后端主机构成。

1. 打开管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择 **Advertise**（通告），然后选择 **Define a Service**（定义 Service）。
3. 在 **Define a Service**（定义 Service）对话框中，为你的 Service 提供名称和描述。
4. 选择你的 Service 将要通告的端口或端点集合，并带上 `tcp:` 传输协议前缀（例如 `tcp:443`）。目前 TCP 是唯一受支持的传输协议。你也可以输入 `do-not-validate` 来跳过端点验证。
5. （可选）通过添加一个或多个[标签][docs-tags]为 Service 提供身份。
6. 选择 **Add service**（添加服务）。

至此，Service 接口已定义完成。接下来，你需要将一台 tailnet 设备配置为 Service 主机。

### 第 2 步：配置 Service 主机

Service 主机是运行 Tailscale 客户端并为特定 Tailscale Service 通告一个或多个端点的 Tailscale 设备。主机处理指向该 Service 的传入连接，并将其路由到相应的资源。主机既可以通告本地资源，也可以通告远程资源。

> **警告：**
>
> 任何想用作 Service 主机的设备都必须使用[基于标签的身份][docs-tags]。你不能将使用用户账户认证的设备用作 Service 主机。

> **提示：**
>
> 请确保先在 tailnet 中的一台设备上启动你想暴露为 Tailscale Service 的资源。该资源可以是 Web 服务器、数据库，或任何你想通过 Tailscale 提供的服务。
>
> 例如，你可以使用 Node.js 和 [`http-server` 软件包][xt-http-server]启动一个监听 `8080` 端口的基础 Web 服务器：
>
> ```shell
> # Install globally
> npm install -g http-server
>
> # Then start a basic web server
> http-server -p 8080
> ```
>
> 此示例启动一个基础 Web 服务器，在 `8080` 端口上提供当前目录中的静态文件。
>
> 资源启动并开始监听连接后，你就可以将其配置为 Service 主机。

你可以使用 `tailscale serve` CLI 命令或 [Service 配置文件][docs-tailscale-services-configuration-file]来配置 Service 主机。

Tailscale 推荐使用 CLI 方式，因为它会自动完成配置和通告；而配置文件方式则让你可以分步控制这两个环节。

1. 运行带有 `--service` 标志的 `tailscale serve` 命令，后跟服务名称、协议、端口号和目标地址：

   ```shell
   tailscale serve --service=svc:web-server --https=443 127.0.0.1:8080
   ```

   该命令返回类似于以下的输出：

   ```shell
   This machine is configured as a service host for `svc:web-server`, but approval from an admin is required. Once approved, it will be available in your Tailnet as:

   https://web-server.<tailnet-name>.ts.net:443/
   |-- proxy http://127.0.0.1:8080
   ```

   > **注意：**
   >
   > 使用 `tailscale serve` CLI 命令配置并通告端点时，会自动使用后台模式（如果使用 `tailscale serve` 命令，通常需要使用 `--bg` 标志来启用该模式）。

   此命令会为资源配置并自动通告一个端点。当你将 `tailscale serve` 命令与 HTTPS 协议配合使用时，Tailscale 会自动为你唯一的 tailnet DNS 名称预配 TLS 证书。

2. 运行 `tailscale serve status` 命令验证你的配置：

   ```shell
   tailscale serve status --json
   ```

> **注意：**
>
> 启用[区域路由][docs-route-selection]，即可为 Tailscale Services 使用区域内负载均衡。
>
> 如果你将 tailnet 切换到 [MagicRoute][docs-magicroute]，Tailscale 会使用优先级评分在现有 Service 主机之间进行选择，而不是按 DERP 区域分组或主备故障切换。你无需重新创建 Service 或重新配置其主机。

### 第 3 步：批准 Service 主机

如果你的 tailnet 已为该 Service 设置了[自动审批][docs-policy-syntax-auto-approvers]策略，主机会自动获得批准。如果没有，则需要由 [Admin、Network admin 或 Owner](/docs/reference/user-roles) 批准主机，主机才会生效。

1. 打开管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 选择你之前创建的 Service 的名称。
3. 在 **Service hosts**（Service 主机）区域中找到待处理的通告。
4. 选择 **Approve**（批准）。

批准后，主机随即生效，并开始处理该 Tailscale Service 的流量。tailnet 中的用户现在可以使用其 MagicDNS 名称或 IP 地址连接到该 Service（前提是他们拥有必要的访问权限）。

### 第 4 步：从其他设备访问 Tailscale Services

配置并批准 Tailscale Service 之后，你需要确保 tailnet 中的其他设备能够发现并使用通往所通告资源的路由。

Tailscale 1.94 及更高版本的客户端不再需要启用 `accept-routes` 即可使用 Tailscale Services。这让所有客户端默认就能使用 Tailscale Services，同时不必启用可能导致路由冲突的 `accept-routes`。

> **注意：**
>
> 运行 Tailscale 1.93 或更早版本的 Linux 设备默认不会发现通往 Tailscale Services 的新路由。你必须使用 [`tailscale set`][docs-tailscale-set] 命令并加上 `--accept-routes` 标志，显式启用路由接受：
>
> ```shell
> sudo tailscale set --accept-routes
> ```

## 常见场景

本节介绍管理 Tailscale Service 主机的常见场景，包括排空主机、移除主机配置以及更新 Service 主机配置。

### 排空主机

当你需要将 Service 主机下线时，应首先排空该主机。排空主机会让它停止接受新的传入连接，同时让现有连接正常关闭。

使用 `tailscale serve drain` 命令让主机停止针对某个服务（`svc:<service-name>`）通告自身：

```shell
tailscale serve drain svc:<service-name>
```

运行 `tailscale serve drain` 命令后，主机上所有相关端点都会停止接受新的传入连接，但正在进行的连接会保持存活，直到正常关闭。

所有连接正常关闭后，你就可以安全地移除所有相关端点配置。

### 移除主机配置

> **危险：**
>
> 不要在排空之前移除端点配置。否则会突然中断与所通告资源的所有连接。

排空资源的端点后，你可以通过以下三种方式之一移除其配置：移除特定端点（针对单个 `protocol:port` 端点映射）、移除整个主机配置，或重置配置文件。最佳方式取决于你想保留配置文件中的多少内容。

> **提示：**
>
> 你可以随时使用 `tailscale serve status` 命令查看你的 Service 配置文件。
>
> ```shell
> tailscale serve status -json
> ```

#### 移除端点

如果你使用不同的端口号或协议为单个资源配置了多个端点，可以使用 `off` 参数只移除特定的端点映射。要移除资源在特定端口号上的端点映射，请使用 `off` 参数重新运行最初用于配置该端点的 `tailscale serve` 命令。你必须使用与设置端点时相同的值和标志来运行该命令。

```shell
tailscale serve --service:"svc:<service-name>" --https:<port> <additional-flags> off
```

在你用来通告端点的命令末尾加上 `off` 参数（保持相同的标志），即可移除为某个端口配置的端点。例如，假设你有一个 `web-server` 在 HTTPS 端口 `443` 上的端点，以及 `web-server` 在 HTTP 端口 `80` 和 `3000` 上的端点，而你需要移除 HTTPS 端口 `443` 上的端点：

1. 运行以下命令，仅禁用 HTTPS 端口 `443` 上的配置：

   ```shell
   tailscale serve --service="svc:web-server" --https=443 off
   ```

2. 然后，仅使用 HTTP 端口 `80` 重新通告：

   ```shell
   tailscale serve advertise svc:web-server
   ```

> **注意：**
>
> 以下是移除端点的更完整示例：
>
> ```shell
> # Run tailscale up <...>
> # Set up a few L7 endpoints:
>
> tailscale serve --service="svc:web-server" --https=443 8080
> tailscale serve --service="svc:web-server" --https=443 --set-path /mt2 8081
> tailscale serve --service="svc:web-server" --http=80 3000
>
> # When you want to modify config, drain it first.
>
> tailscale serve drain svc:web-server
>
> # Wait until all connections close.
>
> # To only remove the endpoint configuration for the /mt2 path on port 443:
>
> tailscale serve --service="svc:web-server" --https=443 --set-path /mt2 off
>
> # Then, advertise it again and it will only create one endpoint on HTTPS port 443
>
> tailscale serve advertise svc:web-server
>
> # To remove the endpoint configuration for HTTPS port 443:
>
> tailscale serve --service:"svc:web-server" --https=443 off
> # You will see a prompt asking you to confirm
> # After you confirm, it removes all configured endpoints on port 443 but preserves other port configured for the same service resource.
> # Advertise the service again without the removed HTTPS port:
>
> tailscale serve advertise svc:web-server
> ```

#### 移除 Service 的所有端点映射

要移除特定 Service（可以有一个或多个端点）的配置，请使用 `tailscale serve clear` 命令。

```shell
tailscale serve clear svc:<service-name>
```

这会从服务配置文件中移除该 Service 的所有端点配置。

> **注意：**
>
> 以下是移除资源配置的所有端点的更完整示例：
>
> ```shell
> # Run tailscale up <...>
> # Set up a few L7 endpoints:
>
> tailscale serve --service="svc:web-server" --https=443 8080
> tailscale serve --service="svc:web-server" --https=443 --set-path /mt2 8081
> tailscale serve --service="svc:web-server" --http=80 3000
>
> # When you want to modify config, drain it first:
>
> tailscale serve drain svc:web-server
>
> # Wait until all connections close.
>
> # Remove the configuration for svc:web-server:
>
> tailscale serve clear svc:web-server
> ```

#### 移除所有 Service 配置

要重置整个配置文件（移除所有已配置的 Service 配置），请使用 `tailscale serve reset` 命令。

```shell
tailscale serve reset
```

这会从 Services 配置文件中移除所有已配置的端点。

### 更新 Service 主机配置

你可以使用 `tailscale serve` 命令或直接编辑 Service 配置文件来更新或修改主机的 Service 配置。修改之前应当先排空主机。

要更新特定协议、端口和路径的端点配置，请使用相同的标志运行 `tailscale serve`。例如，要启动一个在端口 `443` 上以 HTTPS 配置的端点：

1. 运行以下命令，启动在端口 `443` 上以 HTTPS 配置的端点：

   ```shell
   tailscale serve --service="svc:web-server" --https=443 https://localhost:443
   ```

2. 然后使用 `tailscale serve get-config --all` 检查配置：

   ```json
   {
     "version": "0.0.1",
     "services": {
       "svc:web-server": {
         "endpoints": {
           "tcp:443": "https://localhost:443"
         }
       }
     }
   }
   ```

   要将端点的默认路径改为指向本地端口 `8081`：

3. 运行以下命令：

   ```shell
   tailscale serve --service="svc:web-server" --https=443 https://localhost:8081
   ```

4. 然后使用 `tailscale serve get-config --all` 检查配置：

   ```json
   {
   "version": "0.0.1",
     "services": {
       "svc:web-server": {
         "endpoints": {
           "tcp:443": "https://localhost:8081"
         }
       }
     }
   }
   ```

要在某个端口上为本地资源运行不同的协议，你需要先移除该端口上现有的端点配置，然后重新添加配置。例如，假设你为 `my-web-app` 配置了一个 HTTPS 端口 `443` 的端点、指向一个文本示例，但需要将其改为使用 HTTP 而不是 HTTPS：

1. 运行以下命令移除端口 `443` 的端点配置：

   ```shell
   tailscale serve --service="svc:my-web-app" --https=443 off
   ```

2. 然后重新运行 `tailscale serve` 命令，以 HTTP 设置该端点：

   ```shell
   tailscale serve --service="svc:my-web-app" --http=443 http://localhost:8081
   ```

   该命令返回类似于以下的输出：

   ```shell
   Available within your tailnet:

   http://web-server.king-grouse.ts.net:443/
   |-- text  "example"
   ```

### 使用配置文件配置 Service 主机

要使用 [Service 配置语法][docs-tailscale-services-configuration-file]配置 Service 主机，你需要创建一个包含 Service 主机配置的配置文件（例如 `serveconfig.json`）。注意，使用配置文件方式时，你必须先配置每个端点映射，然后将其通告，这是两个独立的步骤。

1. 创建一个名为 `serveconfig.json` 的文件，其中包含 [`tailscale serve`][docs-tailscale-serve] 配置。此示例为通过 HTTPS 在端口 `443` 上暴露的本地 Web 服务器配置一个端点：

   ```json
   {
   "version": "0.0.1",
     "services": {
       "svc:web-server": {
         "endpoints": {
           "tcp:443": "https://localhost:443"
         }
       }
     }
   }
   ```

2. 使用 `tailscale serve set-config` 命令应用配置文件：

   ```shell
   tailscale serve set-config --all serveconfig.json
   ```

3. 运行 `tailscale serve status` 命令验证你的配置：

   ```shell
   tailscale serve get-config --all
   ```

4. 通告该端点：

   ```shell
   tailscale serve advertise svc:<service-name>
   ```

你的服务主机现在正在为你的 Tailscale Service 处理流量。你可以运行 `tailscale status --json | jq '.Self.CapMap."service-host"'` 检查 service-host 状态来验证这一点。

### 设置自动审批

Tailscale 客户端可以通告新的 Service 主机，但管理员必须批准或拒绝新的通告（类似于[子网路由审批][docs-subnets-approve]）。你可以设置自动审批策略，让特定客户端、用户或标签能够为特定 Service 或一组 Service 自动通告并批准新主机。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 创建自动审批策略，为单个 Tailscale Service 或 Tailscale Service 组（由[标签][docs-tags]定义）批准新主机。示例如下：

   ```json
   "autoApprovers": {
     "services": {
       "svc:<service-name>": ["tag:server"],
       "tag:prod-service": ["tag:prod-infra"]
     },
   },
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

该示例为带有 `tag:server` 标签的 Tailscale 客户端创建了一条自动审批规则，允许它们为 Tailscale Service `svc:<service-name>` 通告新的 Service 代理。此外，它还规定带有 `tag:prod-infra` 标签的 Tailscale 客户端可以为带有 `tag:prod-service` 标签的 Tailscale Services 通告新的 Service 代理，并自动获得批准。

### 验证你的 Service

你可以验证你的 Service 是否已在本地成功通告并通过了验证。为此，请运行以下 [`tailscale status`][docs-tailscale-status] 命令，并将其输出传递给 [`jq`][xt-jq] 命令行 JSON 处理器：

```shell
tailscale status --json | jq '.Self.CapMap."service-host"'
```

`jq` 的输出应显示 `service-host` 状态。

#### 配置 Service 访问

你可以在[授权][docs-grants]访问控制策略中将 Tailscale Service 用作目标。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 创建一条授予你的 Service 访问权限的授权规则。例如，以下授权以 `svc:web-server` 为目标、端口为 `443`，并将访问权限授予 `autogroup:member`。

```json
{
  "src":  ["autogroup:member"],
  "dst":  ["svc:web-server"],
  "ip": ["443"],
},
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **提示：**
>
> 你还可以使用分配给每个 Service 的标签来引用 Tailscale Services 组。此示例授权一组生产 Services（`tag:prod-service`）访问 `svc:database` Service。
>
> ```json
> {
>   "src":  ["tag:prod-service"],
>   "dst":  ["svc:database"],
>   "ip": ["5432"],
> },
> ```

### 使用访问控制测试

Tailscale Services 资源是[访问控制测试][docs-policy-syntax-tests]中有效的 `accept` 或 `deny` 目标。

### 检查可用性

要检查你的 Service 的可用性，可以使用管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

1. 打开 Tailscale 管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。
2. 在 **Advertised**（已通告）区域中，你应该能看到你的 Tailscale Service 及其已配置的端点。

## 参考

本节提供有关 Tailscale Services 的参考信息，包括端点类型和服务状态。

### 端点类型

Tailscale 支持三种类型的端点，各自工作在网络栈的不同层。虽然 OSI 模型并不能完美呈现现代网络，但它为理解这些区别提供了一个实用的框架。三种端点类型分别是：第 7 层（应用层）、第 4 层（传输层）和第 3 层（网络层）。本节说明每种类型的用途、适用场景以及各自能力的注意事项

#### 第 7 层端点（应用层）

第 7 层（应用层）端点通过理解和操作应用层协议，提供最精细的转发机制。它可以根据应用特定的内容检查、修改和路由流量。当你需要 Tailscale 在数据包中注入认证标头，或需要基于路径的路由时，这类端点非常合适。例如，`/api/*` 请求可以转发到一台服务器，而 `/static/*` 转发到另一台。

使用 `tailscale serve` 时，将协议值设为 `http` 或 `https` 即可创建第 7 层端点。

* 端口号是暴露该端点所用的端口。
* 可以使用可选的 `--set-path` 标志指定自定义文件路径。默认使用 `/`。
* 目标可以是文本、文件路径或本地地址。更多示例请参阅 [Tailscale Serve 示例][docs-serve-examples]。

#### 第 4 层端点（传输层）

第 4 层（传输层）端点工作在 [OSI 模型][docs-osi-model]的传输（TCP）层。它们充当 TCP 转发器，不修改数据包数据，但可能不保留数据包边界和元数据。这类端点非常适合 Web 服务器和数据库等标准 TCP 服务。由于不解析应用层协议，它们的开销比第 7 层端点更小。

使用 `tailscale serve` 时，将协议值设为 `tcp` 或 `tls-terminated-tcp` 即可创建第 4 层端点。

* 端口号是暴露 TCP 转发器所用的端口。TCP 转发器转发已终结 TLS 的原始数据包。
* 不能使用 `--set-path` 标志指定自定义文件路径。该值必须为空或未设置。
* 目标是原始 TCP 数据包将被转发到的本地地址（例如 `tcp://localhost:5432`）。

#### 第 3 层端点（网络层）

第 3 层（网络层）端点是一种特殊类型的端点，工作在 IP 数据包层面，将所有流量不加修改地转发给操作系统的网络栈。

如果你要提供的应用或资源需要 UDP 支持，或者你需要精确保留数据包边界和大小，可以考虑使用第 3 层端点。但请注意它们有以下限制：

* 需要额外的操作系统配置来处理未经修改的数据包。
* 没有任何内置的应用层功能，例如认证标头。
* 只能在 Linux 上工作。

在 Linux 设备上，运行带有 `--tun` 标志的 `tailscale serve` 命令（附带服务信息）即可创建第 3 层端点。

```shell
tailscale serve --service=svc:<service-name> --tun
```

使用 `--tun` 标志会创建一个第 3 层的协议无关端点，让你能更精细地控制数据包流向资源的方式。这种端点会将所有前往该 Tailscale Service 的流量不加修改地转发到你的本地设备。在这种模式下，你可能需要自行进行一些 `iptables` 配置或类似操作，以完全掌控数据包并将其送往预期的目的地。

### Service 状态

本节介绍管理控制台中 Service 的各种状态。在管理控制台的 Services 页面中，Service 可以处于以下状态：

* **待批准**：Service 有一台或多台已通告但仍在等待 [Admin、Network admin 或 Owner](/docs/reference/user-roles) 批准的主机。
* **需要配置**：主机已定义，但配置无效或缺失。
* **已连接**：至少有一台主机正在通告该 Service。
* **离线**：当前没有任何主机通告该 Service。
* **已预先批准**：设备已根据自动审批策略自动获得批准，但尚未通告该 Service。
* **排空中**：主机正在排空，即不再接受新连接，但仍在处理现有连接。

## 局限性

Tailscale Services 有以下限制：

* **仅支持 TCP 协议**：Services 目前只支持 TCP 传输协议；除 Linux 上需要额外操作系统（OS）级配置的第 3 层端点外，无法使用 UDP。
* **无出站连接**：分配给 Service 的虚拟 IP 地址（TailVIP）只能接受传入连接，不能发起任何出站连接。
* **第 3 层端点仅限 Linux**：保留数据包边界的第 3 层端点只能在 Linux 上工作，并且需要额外的工具配置，例如 `iptables`。
* **文本和文件端点**：Service 配置文件方式不支持 `text:` 或 `file:` 目标。这些目标只能在使用 `tailscale serve` CLI 命令时使用。
* **多网络接口的限制**：拥有多个网络接口并定义了远程资源目标的 Service 主机在特定情况下可能遇到问题。例如，在以下情况中，与远程目标的连接可能失败：
  * Service 主机（1）是 Linux 设备，（2）运行未启用 `SO_MARK` 的 `tailscaled`，（3）拥有多个网络接口，并且（4）默认路由表中没有该远程目标。你可以通过以[用户态网络模式][docs-userspace-networking]运行 `tailscaled` 来绕过此限制。
  * Service 主机（1）是使用 [Mac App Store 或 Standalone 变体][docs-macos-variants]的 macOS 设备，（2）拥有多个网络接口，并且（3）默认路由表中没有该远程端点。在这种情况下，你可以通过运行[开源 macOS 变体][docs-macos-variants-tailscaled]（默认以用户态网络模式运行 `tailscaled`）来绕过此问题。

## 更多信息

* 使用 [Tailscale API][docs-api] 中的 [Services 端点][co-api-tailscale-services]管理你 tailnet 的 Service。
  * [列出所有服务][co-api-tailscale-services-get-services]
  * [获取服务][co-api-tailscale-services-get-servicename]
  * [更新服务][co-api-tailscale-services-put-servicename]
  * [删除服务][co-api-tailscale-services-delete-servicename]
  * [列出托管某服务的设备][co-api-tailscale-services-get-servicename-devices]
  * [获取设备上服务的审批状态][co-api-tailscale-services-get-servicename-deviceid-approved]
  * [更新设备上服务的审批状态][co-api-tailscale-services-post-servicename-deviceid-approved]
* 有关在 Go 程序中使用 [`tsnet`][docs-tsnet] 软件包和 `Server.ListenService` 的更多信息，请参阅 [`tsnet` 服务器][docs-tsnet-server]。
* 有关结合 Tailscale Services 使用 `Server.ListenService` 和 `ServiceModeHTTP` 的完整示例，请参阅 [`tsnet` 与 Tailscale Services][docs-tsnet-services]。

[co-api-tailscale-services-delete-servicename]: https://tailscale.com/api#tag/services/DELETE/tailnet/{tailnet}/services/{serviceName}

[co-api-tailscale-services-get-servicename-deviceid-approved]: https://tailscale.com/api#tag/services/GET/tailnet/{tailnet}/services/{serviceName}/device/{deviceId}/approved

[co-api-tailscale-services-get-servicename-devices]: https://tailscale.com/api#tag/services/GET/tailnet/{tailnet}/services/{serviceName}/devices

[co-api-tailscale-services-get-servicename]: https://tailscale.com/api#tag/services/GET/tailnet/{tailnet}/services/{serviceName}

[co-api-tailscale-services-get-services]: https://tailscale.com/api#tag/services/GET/tailnet/{tailnet}/services

[co-api-tailscale-services-post-servicename-deviceid-approved]: https://tailscale.com/api#tag/services/POST/tailnet/{tailnet}/services/{serviceName}/device/{deviceId}/approved

[co-api-tailscale-services-put-servicename]: https://tailscale.com/api#tag/services/PUT/tailnet/{tailnet}/services/{serviceName}

[co-api-tailscale-services]: https://tailscale.com/api#tag/services

[docs-api]: /docs/reference/tailscale-api

[docs-grants]: /docs/features/access-control/grants

[docs-install-unstable]: /docs/install/unstable

[docs-macos-variants-tailscaled]: /docs/concepts/macos-variants#open-source-tailscaled-variant

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-magicdns]: /docs/features/magicdns

[docs-magicroute]: /docs/features/magicroute

[docs-osi-model]: /docs/concepts/tailscale-osi

[docs-policy-syntax-auto-approvers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-route-selection]: /docs/features/route-selection

[docs-serve-examples]: /docs/reference/examples/serve

[docs-subnets-approve]: /docs/features/subnet-routers#enable-subnet-routes-from-the-admin-console

[docs-tags]: /docs/features/tags

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-services-configuration-file]: /docs/reference/tailscale-services-configuration-file

[docs-tailscale-set]: /docs/reference/tailscale-cli#set

[docs-tailscale-status]: /docs/reference/tailscale-cli#status

[docs-tsnet-server]: /docs/reference/tsnet-server-api

[docs-tsnet-services]: /docs/features/tsnet/how-to/register-service

[docs-tsnet]: /docs/features/tsnet

[docs-userspace-networking]: /docs/reference/kernel-vs-userspace-routers#userspace-netstack-mode

[xt-http-server]: https://www.npmjs.com/package/http-server

[xt-jq]: https://jqlang.org/
