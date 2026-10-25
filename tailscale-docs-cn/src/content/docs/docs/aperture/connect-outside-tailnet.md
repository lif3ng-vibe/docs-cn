---
title: "连接 tailnet 之外的设备"
description: "使用 Aperture CLI 桥接或 ts-unplug，把不在你 tailnet 内的设备连接到你的 Aperture 网关。"
---

最后验证于 Sep 29, 2026

Aperture 网关位于一个 [tailnet][docs-tailnet] 中，tailnet 内的设备可以直接访问它。但并非每台需要 LLM 访问的设备都能加入该 tailnet。CI/CD 运行器、承包商机器、个人设备以及其他 tailnet 中的设备，都可以通过一个内嵌的 Tailscale 设备连接 Aperture——该设备加入你的 tailnet，并把本地流量代理到 Aperture。这些设备无需安装 Tailscale。

有两种方式：

* **[Aperture CLI 桥接][ar-connect-bridge]**（推荐）。Aperture CLI 会替你创建内嵌节点，并让启动的编码智能体直接指向它。交互式编码会话请用这种方式。
* **[`ts-unplug`][ar-connect-ts-unplug]**。[ts-plug 仓库][xt-gh-ts-plug]中的独立代理，监听你选择的本地端口。当 Aperture CLI 不会启动的工具（例如脚本、CI 作业或自定义 API 客户端）需要固定的本地端点时，请用这种方式。

两种方式都使用内嵌节点的 Tailscale 身份来认证请求，而不是共享 API 密钥。如果每个人运行自己的实例，Aperture 可以把活动归到具体用户。

> **注意：**
>
> `ts-unplug` 也被称为 bridge mode（桥接模式）或 standalone mode（独立模式）。尽管名字如此，bridge mode 指的是 `ts-unplug` 工作流，而不是 Aperture CLI 的桥接功能。

## 使用场景

当设备无法或不便直接加入你的 tailnet 时，可以从 tailnet 之外连接。

* **CI/CD 运行器**：GitHub Actions 运行器等在构建期间需要 LLM 访问的临时环境。使用[认证密钥][docs-auth-keys]（auth key）可跳过交互式批准。
* **承包商或供应商机器**：需要访问 Aperture 但不加入你所在组织 tailnet 的外部协作者。
* **个人设备**：不想在个人硬件上安装 Tailscale 的团队成员。
* **跨 tailnet 访问**：其他 tailnet 中需要访问你的 Aperture 网关的设备。

已在 tailnet 内的设备直接连接步骤更少，同样能获得按用户区分的身份。连接说明参阅[设置 LLM 客户端][docs-use-your-tools]。

## 通过 Aperture CLI 桥接连接

桥接是运行在 Aperture CLI 内部的内嵌 Tailscale 节点。激活桥接端点后，Aperture CLI 会加入你的 tailnet、打开一个本地代理，并把它启动的编码智能体配置为使用该代理。

### 前提条件

开始之前，请确认已具备以下条件：

* **Aperture CLI。** 参阅[安装 Aperture CLI][docs-aperture-cli-install]。
* **Aperture 网关的 URL。** 默认为 `http://<aperture-hostname>.<tailnet-name>.ts.net`。tailnet DNS 名称可在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面查找。
* **批准设备的权限。** 你必须是[所有者、管理员或网络管理员](/docs/reference/user-roles)才能在管理控制台中批准桥接节点，除非你使用[认证密钥][docs-auth-keys]自动完成认证。

### 第 1 步：创建桥接

1. 运行 `aperture`，然后按 `s` 打开设置。

2. 选择 **Bridges**，按 `a`，输入桥接名称，例如 `ci-runner`。

### 第 2 步：将桥接分配给端点

1. 返回设置菜单并选择 **Aperture Endpoints**。

2. 按 `a`，选择 **Bridge**，再选择你创建的桥接。Aperture CLI 开始通过它连接 `http://ai`。

   如果你的网关使用其他 URL，在连接界面输入后按 `Enter`。如果默认 URL 已经连接成功，返回 **Aperture Endpoints**，选择该连接并选择 **Change URL**。

### 第 3 步：激活端点

1. 完成选择桥接时开始的连接。

   首次激活会在浏览器中打开一个 Tailscale 认证 URL，并将其显示在连接界面底部。如果浏览器没有打开，按 `Ctrl+Y` 复制该 URL 并自行打开。认证节点后，如果你的 tailnet 启用了设备批准，请在承载 Aperture 的 tailnet 对应的管理控制台 [Machines](https://console.tailscale.com/admin/machines) 页面中批准该设备。

2. 连接检查通过后，从主菜单选择一个编码智能体。

   Aperture CLI 会以桥接代理作为 base URL 启动该智能体。

桥接工作原理的更多细节参阅[桥接][docs-aperture-cli-bridges]。

## 使用 ts-unplug 连接

`ts-unplug` 会创建一个轻量级 tailnet 节点，并打开一个把流量转发到 Aperture 的本地端口。与 Aperture CLI 桥接不同，这个端口由你选择且保持固定，因此设备上的任何工具都可以把它用作 base URL。

> **注意：**
>
> `ts-plug` 和 `ts-unplug` 工具仍在积极开发中。最新状态和发布信息参阅 [ts-plug 仓库][xt-gh-ts-plug]。

### 前提条件

开始之前，请确认已具备以下条件：

* **Go 工具链。** `ts-unplug` 需要从源码构建。安装 [Go][xt-go-install] 1.21 或更高版本。
* **Git。** 克隆 [ts-plug 仓库][xt-gh-ts-plug]时需要。
* **Aperture 网关的 FQDN。** 默认为 `<aperture-hostname>.<tailnet-name>.ts.net`。tailnet DNS 名称可在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面查找。
* **批准设备的权限。** 你必须是[所有者、管理员或网络管理员](/docs/reference/user-roles)才能在管理控制台中批准 `ts-unplug` 节点，除非你使用[认证密钥][docs-auth-keys]自动完成认证。

### 第 1 步：构建 ts-unplug

克隆 [ts-plug 仓库][xt-gh-ts-plug]并构建 `ts-unplug`：

```shell
git clone https://github.com/tailscale/ts-plug.git
cd ts-plug
make ts-unplug
```

二进制文件生成在 `./build/ts-unplug`。

### 第 2 步：启动 ts-unplug

运行 `ts-unplug` 并指向你的 Aperture 网关。把 `<tailnet-name>` 替换为你的 tailnet DNS 名称，并选择一个本地端口：

```shell
./build/ts-unplug -dir ./state -port 8080 <aperture-hostname>.<tailnet-name>.ts.net
```

首次运行时，`ts-unplug` 会打印一个用于认证新节点的 URL。在浏览器中打开该 URL 完成认证。

### 第 3 步：批准设备

在承载 Aperture 的 tailnet 对应的管理控制台 [Machines](https://console.tailscale.com/admin/machines) 页面中批准新设备。

批准后，`ts-unplug` 会显示 `HTTP proxy listening`，你即可通过 `http://localhost:8080` 访问 Aperture。

### 第 4 步：验证连接

`ts-unplug` 运行后，发送一个测试请求确认连接正常：

```shell
curl -s http://localhost:8080/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 25,
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

请求成功后，打开 `http://localhost:8080/sessions` 的 **Sessions**，可在你的个人历史中找到该请求。

## 后续步骤

* **配置工具使用 `ts-unplug` 代理**

  确认连接正常后，把工具的 API 请求 base URL 配置为 `http://localhost:<port>`。各工具的具体配置参阅[设置 LLM 客户端][docs-use-your-tools]，并把任一配置示例中的 `http://<aperture-hostname>` 替换为 `http://localhost:<port>`。由 Aperture CLI 启动的智能体会自动完成配置，无需更改。

* **管理你的实例**

  代理不用时停止它；设备不再需要时从 tailnet 中移除；如果多个用户需要访问，可使用独立的状态目录运行多个 `ts-unplug` 实例。移除桥接参阅[删除桥接][docs-aperture-cli-bridge-delete]。

## 限制

这些连接方式有以下限制：

* Aperture CLI 桥接代理监听随机的本地端口，且只配置由 Aperture CLI 启动的智能体。需要为其他工具提供固定端口时请用 `ts-unplug`。
* `ts-unplug` 必须从源码构建，没有预编译二进制。
* `ts-unplug` 只监听 `localhost`，同一网络中的其他设备无法访问该代理。
* 每个桥接或 `ts-unplug` 实例都会创建一个独立的 tailnet 节点。如果需要大量实例，请考虑使用带适当标签和访问控制策略的[认证密钥][docs-auth-keys]。

[ar-connect-bridge]: #通过-aperture-cli-桥接

[ar-connect-ts-unplug]: #使用-ts-unplug-连接

[docs-aperture-cli-bridge-delete]: /docs/aperture/cli#delete-a-bridge

[docs-aperture-cli-bridges]: /docs/aperture/cli#bridges

[docs-aperture-cli-install]: /docs/aperture/cli#install-the-aperture-cli

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-tailnet]: /docs/concepts/tailnet

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-gh-ts-plug]: https://github.com/tailscale/ts-plug

[xt-go-install]: https://go.dev/doc/install
