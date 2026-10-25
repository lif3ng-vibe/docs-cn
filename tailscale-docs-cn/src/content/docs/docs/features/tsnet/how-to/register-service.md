---
title: "Register a tsnet application as a Tailscale Service"
description: "在本指南中，你将使用 [`tsnet`][docs-tsnet] 包把一个应用注册为 [Tailscale Service][docs-tailscale-services] 主机。此模式可应用于其他 `tsnet` 应用。"
---

最后验证于 Jan 27, 2026

## 简介

在本指南中，你将使用 [`tsnet`][docs-tsnet] 包把一个应用注册为 [Tailscale Service][docs-tailscale-services] 主机。此模式可应用于其他 `tsnet` 应用。

本演示的示例代码位于 [`tailscale/tailscale` 仓库][xt-github-tailscale-tsnet-services-example]。

## 前提条件

开始本指南之前，你需要具备以下条件：

* [Go 编译器工具链][xt-go-download]。
* 一个终端窗口（命令提示符）。
* 一个可用的 tailnet。
* 一台或多台运行 Tailscale v1.86.0 或更高版本的设备。
* [Owner、Admin 或 Network admin](/docs/reference/user-roles) 账户权限。

## 步骤 1：更新 tailnet 策略文件

向你的 tailnet 策略文件添加 `tagOwners`、`autoApprovers` 和 `grants`。

### 创建标签

使用 Tailscale 管理控制台创建一个[标签（tag）][docs-tags]。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。

2. 选择 **Tags** 面板。

3. 选择 **Create tag**。

4. 填写 **Tag name**。

   ```json
   tsnet-demo-host
   ```

5. 填写 **Tag owner**。

   ```json
   autogroup:member
   ```

6. 选择 **Save**。

### 定义 Service

使用 Tailscale 管理控制台添加一个 Tailscale Service。

1. 打开管理控制台的 [Services](https://console.tailscale.com/admin/services) 页面。

2. 选择 **Advertised** 面板。

3. 选择 **Define Service**。

4. 填写 **Service name**。

   ```json
   tsnet-demo
   ```

5. 填写 **Ports**。

   ```json
   443
   ```

6. 选择 **Define Service**。

就本示例而言，Service 定义本身并不限制哪些标签可以托管它，但主机节点需要打上标签。

### 定义自动审批

使用 Tailscale 管理控制台添加自动审批。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。

2. 选择 **Auto approvers** 面板。

3. 在 **Select service** 下拉框中选择示例 Service。

   ```json
   svc:tsnet-demo
   ```

4. 在 **Service can automatically accept devices** 下拉框中选择示例标签。

   ```json
   tag:tsnet-demo-host
   ```

5. 选择 **Save service auto approver**。

### 定义授权

使用 Tailscale 管理控制台添加授权（grant）。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。

2. 选择 **General access rule** 面板。

3. 选择 **Add rule**。

4. 为 **Source** 添加 **All users and devices**。

5. 为 **Destination** 添加示例 Service。

   ```json
   svc:tsnet-demo
   ```

6. 为 **Port and protocol** 添加 **All ports and protocols**。

7. 选择 **Save grant**。

### tailnet 策略文件示例

此时，你的策略文件应包含以下键（把它们合并进你现有的文件）：

```json
"tagOwners": {
  "tag:tsnet-demo-host": ["autogroup:member"],
},
"autoApprovers": {
  "services": {
    "svc:tsnet-demo": ["tag:tsnet-demo-host"],
  },
},
"grants": [
  {
    "src": ["*"],
    "dst": ["svc:tsnet-demo"],
    "ip": ["*"],
  },
],
```

## 步骤 2：生成认证密钥

使用 Tailscale 管理控制台[生成认证密钥][docs-auth-key-generate-an-auth-key]。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 选择 **Generate auth key**。
3. 启用 **Tags**。
4. 选择 **Add tags** 并选择示例标签。
5. 选择 **Generate key**。
6. 把认证密钥复制到剪贴板，稍后使用。
7. 选择 **Done**。

打开一个命令终端，把认证密钥保存为环境变量。

```shell
export TS_AUTHKEY=<your-authkey>
```

## 步骤 3：使用 `tsnet` 包

1. 打开你的文本编辑器。
2. 创建一个 `tsnet-services.go` 文件：

```go
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"tailscale.com/tsnet"
)

var (
	svcName = flag.String("service", "", "the name of your Service, e.g. svc:tsnet-demo")
)

func main() {
	flag.Parse()
	if *svcName == "" {
		log.Fatal("a Service name must be provided")
	}

	s := &tsnet.Server{
		Hostname: "tsnet-services-demo",
	}
	defer s.Close()

	ln, err := s.ListenService(*svcName, tsnet.ServiceModeHTTP{
		HTTPS: true,
		Port:  443,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	log.Printf("Listening on https://%v\n", ln.FQDN)

	err = http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "<html><body><h1>Hello, tailnet!</h1>")
	}))
	log.Fatal(err)
}
```

在这个示例程序中，你将创建一个主机名为 `tsnet-services-demo` 的 `tsnet.Server` 实例。该服务器充当 tailnet 中的一个虚拟节点。程序指示该节点在端口 `443` 上监听发往某个 Service 的 HTTPS 连接。该监听器使用 `tsnet` 包的 [`ListenService`][docs-tailscale-services-listenservice] 与 `ServiceModeHTTP`。程序还使用 Go 标准库的 `net/http` 包在该监听器之上运行一个 HTTP 服务器。当 tailnet 中的其他节点连接到该 Service 时，这些连接会被路由到本程序定义的虚拟节点。

## 步骤 4：运行程序

1. 运行命令：

   ```shell
   go run tsnet-services.go --service=svc:tsnet-demo
   ```

## 步骤 5：连接到应用

1. 访问示例服务器：

   ```
   open https://tsnet-demo.<your-tailnet-DNS-name>
   ```

有关 tailnet DNS 名称的更多信息，请参阅 [tailnet name][docs-tailnet-name-dns-name]。

## 结语

此模式可应用于其他 `tsnet` 应用，把它们作为 Tailscale Services 主机。

[docs-auth-key-generate-an-auth-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-tags]: /docs/features/tags

[docs-tailscale-services-listenservice]: /docs/reference/tsnet-server-api#serverlistenservice

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailnet-name-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tsnet]: /docs/features/tsnet

[xt-github-tailscale-tsnet-services-example]: https://github.com/tailscale/tailscale/blob/v1.94.1/tsnet/example/tsnet-services/tsnet-services.go

[xt-go-download]: https://go.dev/dl
