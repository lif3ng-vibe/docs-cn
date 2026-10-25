---
title: "将 GitHub CI/CD 工作流连接到私有基础设施，而不暴露于公网"
description: "使用 Tailscale 的临时、经过认证的连接，将 GitHub 托管的运行器连接到私有基础设施，而不暴露于公网。"
---

最后验证于 Jan 23, 2026

持续集成与持续开发（CI/CD）流水线（例如 [GitHub Actions][xt-gh-actions] 工作流）常常需要访问私有基础设施，包括数据库、内部 API 和 Kubernetes 集群。传统做法迫使你在安全上做取舍：要么使用公共基础设施（GitHub 托管的运行器），要么维护自己的基础设施（自托管运行器）。托管运行器灵活且零维护，但存在暴露内部服务、制造漏洞的风险。[自托管运行器][xt-gh-self-hosted-runners]安全性更高，却失去了 GitHub 托管基础设施的优势，还增加了运维负担。

使用 Tailscale 保护运行器对私有基础设施的访问，你可以同时兼得 GitHub 托管运行器的低维护和自托管运行器的安全性（而且无需[搭建复杂的环境][xt-gh-secure-runners]）。Tailscale GitHub Action 会创建临时的、经过认证的连接，这些连接在工作流执行结束后很快过期。GitHub 的托管运行器通过你的 Tailscale 网络（称为 tailnet）安全连接，而你的私有资源始终不对外暴露。

在本指南中，你将使用 Tailscale 的 [OAuth 客户端][docs-oauth-clients]、[Tailscale GitHub Action][docs-tailscale-github-action]和 [`tsnet` 库][docs-tsnet]实现安全的 CI/CD 模式。你将构建一个名为 `tshello` 的演示应用，证明 GitHub 运行器可以访问内部服务，并通过 Tailscale 的[身份][docs-tailscale-identity]层对连接用户进行认证。你建立的这些模式可以直接推广到生产场景，包括数据库迁移、API 测试和 Kubernetes 部署，既不暴露服务，也无需管理长期有效的凭证。

## 前提条件

开始本指南之前，你需要：

* 一个[拥有 Owner、Admin 或 Network admin](/docs/reference/user-roles) 权限的 [Tailscale 账户][co-start]。
* 一台安装了 Go 1.23 或更高版本的本地设备，用于创建和测试演示应用。本指南的说明假设该设备基于 Unix（例如 macOS 或 Linux）。
* 一台运行在你 Tailscale 网络（称为 tailnet）中的设备，用于测试与[运行器][xt-gh-runner]的连通性。
* 一个你拥有[协作者权限][xt-gh-account-and-profile]的 GitHub 仓库。
* 对 [GitHub Actions 工作流语法][xt-gh-workflow-syntax]、[Tailscale 标签][docs-tags]、[Go 语法][xt-go-syntax]和 [Go 测试][xt-go-tests]有基本了解。

## 第 1 步：为工作流运行器创建身份与访问控制

首先要为工作流运行器创建一个身份。你将用这个身份对运行器使用的[临时节点][docs-ephemeral-nodes]进行认证，并应用[访问控制][docs-access-control]来限制运行器可以访问哪些资源。

做法是编辑你的 [tailnet 策略文件][docs-tailnet-policy-file]，通过 `tagOwners` 部分定义 `tag:ci` 标签的所有权，并使用 `grants` 部分创建访问规则。

标签所有权部分定义标签以及哪些用户可以把标签应用到设备，而授权则决定打了标签的设备可以访问哪些资源。

打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。如果你之前没有自定义过策略文件，它会呈现默认配置。你将在保留现有规则的前提下添加新的部分。你可以使用 JSON 编辑器或可视化编辑器编辑 tailnet 策略文件。

### 方式 1：使用 JSON 编辑器

要使用 JSON 编辑器，在 [Access controls](https://console.tailscale.com/admin/acls) 页面顶部选择 **JSON editor**（JSON 编辑器）。

首先，为 CI 运行器定义标签所有者。找到 `tagOwners` 部分（如不存在则新建）。添加 `ci` 标签，所有者留空。默认情况下，[Owner、Admin 和 Network admin](/docs/reference/user-roles) 无需显式所有权即可应用标签。

```json
"tagOwners": {
  "tag:ci": [], // No owners, so Owners, Admins, and Network admins can apply the tag
  // Other tag definitions
}
```

如有需要，[Owner、Admin 和 Network admin](/docs/reference/user-roles) 可以手动为设备打上 `tag:ci` 标签。

接下来，为 CI 运行器创建访问规则。在 `grants` 部分，添加定义 GitHub 运行器可访问内容的规则。先从一条基本规则开始，让 CI 运行器能与 tailnet 中的所有设备通信：

```json
"grants": [
  {
    "src": ["tag:ci"],
    "dst": ["*"],
    "ip": ["*"]
  },
  // Other access rules
]
```

这条授权让使用 `tag:ci` 身份的设备可以访问任何其他设备。这是一条宽松的策略，仅用于演示。不要在生产环境中使用这条访问控制策略。

> **警告：**
>
> 对于生产环境，你应该进一步收紧访问。下面这个示例将 CI 运行器限制为只能访问特定资源：
>
> ```json
> "grants": [
>   {
>     "src": ["tag:ci"],
>     "dst": ["tag:prod-db"],
>     "ip": ["5432"]
>   },
>   {
>     "src": ["tag:ci"],
>     "dst": ["tag:staging-api"],
>     "ip": ["443", "8080"]
>   },
>   // Other access rules
> ]
> ```
>
> 这些示例授权让 CI 运行器能访问打有 `tag:prod-db` 标签的 PostgreSQL 数据库（端口 `5432`），以及打有 `tag:staging-api` 标签的 staging API（端口 `443` 和 `8080`）。请根据你的基础设施和安全需求调整这些规则。

保存你的策略文件更改。管理控制台会校验语法并立即应用新规则。

### 方式 2：使用可视化编辑器

要使用可视化编辑器，在 [Access controls](https://console.tailscale.com/admin/acls) 页面顶部选择 **Visual editor**（可视化编辑器）。

选择 **Tags**（标签）页签，然后选择 **Create tag**（创建标签）。

将标签名设为 `ci`，并添加一条说明该标签用途的备注（CI/CD 运行器）。这里无需指定任何所有者；把所有者列表留空。默认情况下，[Owner、Admin 和 Network admin](/docs/reference/user-roles) 无需显式所有权即可应用标签。

然后，选择 **Save tag**（保存标签）。

接下来，为你的 CI 运行器创建访问规则。

选择 **General access rules**（通用访问规则）页签，然后选择 **Add rule**（添加规则）。

将来源设为 `tag:ci`，目标设为 **All users and devices**（所有用户和设备），端口和协议设为 **All ports and protocols**（所有端口和协议）。可选：添加一条备注，说明该访问规则的用途。然后，选择 **Save grant**（保存授权）。

这条授权让使用 `tag:ci` 身份的设备可以访问任何其他设备。

> **警告：**
>
> 这是一条宽松的策略，仅用于演示。不要在生产环境中使用这条访问控制策略。

你已经为 tailnet 配置好了相应的权限。接下来，你将使用刚创建的 `ci` 标签来配置 Tailscale OAuth 客户端，为你的工作流提供按需认证。

## 第 2 步：创建用于临时访问的 OAuth 客户端

在创建 GitHub Action 工作流之前，你需要配置一个能按需生成临时认证密钥（auth key）的 [Tailscale OAuth 客户端][docs-oauth-clients]。这些认证密钥让 GitHub 运行器以打有 `tag:ci` 标签的[临时节点][docs-ephemeral-nodes]身份加入你的 tailnet。每次工作流运行都会获得一个唯一的认证密钥，该密钥在作业完成后不久过期。这种方式让你无需管理长期凭证，也无需手动清理不再使用的设备。

创建 Tailscale OAuth 客户端：

1. 打开管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面。
2. 选择 **Credential**（凭证）。
3. 选择 **OAuth**。
4. （可选）为该凭证填写 **Description**（描述），方便在审查访问日志或管理多个 OAuth 客户端时识别其用途。
5. 选择 **Continue**（继续）。
6. 选择以下 OAuth 作用域（scope）：

   * **Devices** > **Core** > **Write**
   * **Keys** > **Auth Keys** > **Write**

   在标签字段中，添加你之前创建的 `tag:ci` 标签。

   这些作用域让 OAuth 客户端能够创建可向你的 tailnet 注册新设备（你的 GitHub 运行器）的**认证密钥**（auth key）。写入权限对运行器加入 tailnet 至关重要。
7. 选择 **Generate credential**（生成凭证）。
8. 管理控制台会显示你的客户端 ID 和客户端密钥。

   > **警告：**
   >
   > 请立即复制这两个值，因为你之后将无法再次查看该密钥。

将这些凭证以[密钥（secret）的形式保存到你的 GitHub 仓库][xt-gh-actions]中。

1. 在 GitHub 中打开你的仓库。
2. 选择 **Settings** > **Secrets and variables** > **Actions**。
3. 创建仓库密钥 `TS_OAUTH_CLIENT_ID`，并粘贴你的 OAuth 客户端 ID。
4. 创建仓库密钥 `TS_OAUTH_SECRET`，并粘贴你的 OAuth 客户端密钥。

你的 OAuth 客户端现在已可以为 GitHub Actions 工作流进行认证。每次工作流运行都会使用这些凭证生成一个唯一的、一次性的认证密钥。

接下来，你将创建一个 Go 测试用来验证连通性的认证密钥。

## 第 3 步：为 Go 测试创建认证密钥

为了让 Tailscale 连通性测试（你将在后面的步骤中创建）正常工作，你必须创建一个可重复使用的[认证密钥][docs-auth-keys]，并用它在本地和 GitHub 仓库密钥中定义 `TS_AUTHKEY` 环境变量。你稍后创建的 Go 测试中的连通性测试部分将使用这个认证密钥。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 选择 Generate auth key（生成认证密钥）。
3. 为认证密钥添加描述，方便你记住它的用途。
4. 启用 **Reusable**（可重复使用）。
5. 有效期保持 90 天。
6. 启用 **Ephemeral**（临时）。
7. 启用 **Tags**（标签），然后添加你之前创建的 `tag:ci` 标签。
8. 选择 **Generate key**（生成密钥）。

将认证密钥保存到一个安全的地方，以便稍后取用。你将无法再次查看它，而稍后创建的 Go 测试需要用到它。

接下来，将认证密钥作为[密钥添加到你的 GitHub 仓库][xt-gh-actions]。前往你在 GitHub 上的仓库，进入 **Settings** > **Secrets and variables** > **Actions**。创建一个新的仓库密钥，命名为 `TS_AUTHKEY`，并粘贴你的认证密钥。

你已为 Go 测试创建好了认证密钥。接下来，你将创建一个该测试要验证的基础 `tsnet` 应用。

你的认证密钥已创建完毕。现在你将构建一个用于测试工作流的演示应用。

## 第 4 步：创建一个基础的 `tsnet` 应用

出于演示目的，我们来创建一个使用 `tsnet` 的基础 "Hello, world!" Go 应用。[`tsnet` 库][docs-tsnet]让你可以把 Tailscale 功能嵌入 Go 程序中。更详细的步骤请参阅 [Hello `tsnet`][docs-hello-tsnet-create-a-tsnet] 中的说明。

为 `tshello` 应用创建一个新目录：

```shell
mkdir tshello
cd tshello
```

启动 Go 模块：

```shell
go mod init tshello
go get tailscale.com/tsnet
```

创建一个名为 `tshello.go` 的文件。这段代码来自 [Hello `tsnet`][docs-hello-tsnet-create-a-tsnet] 指南。关于代码工作原理的详细解释，请访问该指南。

从包声明和导入语句开始。这些导入包括用于网络、HTTP 操作和 TLS 的标准 Go 库，以及 Tailscale 的 `tsnet` 包。

```go
// This program demonstrates how to use tsnet as a library.
package main

import (
    "crypto/tls"
    "flag"
    "fmt"
    "html"
    "log"
    "net/http"
    "strings"

    "tailscale.com/tsnet"
)
```

为服务器地址定义一个命令行标志。这让你可以指定服务器监听的端口，默认为 `80` 端口。

```go
var (
   addr = flag.String("addr", ":80", "address to listen on")
)
```

main 函数解析命令行标志并初始化 `tsnet` 服务器。服务器创建一个 TCP 监听器，并获取一个用于与 Tailscale 网络交互的本地客户端。

```go
func main() {
    flag.Parse()
    srv := new(tsnet.Server)
    defer srv.Close()
    ln, err := srv.Listen("tcp", *addr)
    if err != nil {
       log.Fatal(err)
    }
    defer ln.Close()

    lc, err := srv.LocalClient()
    if err != nil {
     log.Fatal(err)
    }
```

当服务器监听 `443` 端口时，使用 Tailscale 的自动证书供应功能为监听器包裹 TLS。这无需手动管理证书即可提供 HTTPS。

```go
    if *addr == ":443" {
       ln = tls.NewListener(ln, &tls.Config{
          GetCertificate: lc.GetCertificate,
     })
    }
```

HTTP 处理器使用 `WhoIs` API 通过 Tailscale 的认证来识别连接的客户端。这演示了应用如何在不单独实现认证逻辑的情况下验证用户身份。

```go
    log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
            if err != nil {
                http.Error(w, err.Error(), 500)
            return
        }
        fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
        fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
            html.EscapeString(who.UserProfile.LoginName),
            html.EscapeString(firstLabel(who.Node.ComputedName)),
            r.RemoteAddr)
     })))
}
```

添加一个从域名中提取第一个标签的辅助函数。这个工具函数用于在 HTTP 响应中格式化设备名。

```go
func firstLabel(s string) string {
    s, _, _ = strings.Cut(s, ".")
    return s
}
```

这个应用创建一个 `tsnet` 服务器，以 "`tshello`" 为主机名加入你的 tailnet。HTTP 处理器通过 [Tailscale 的 `WhoIs` API][xt-tailscale-go-whois] 识别连接的用户，证明该应用可以通过 tailnet 的身份层对连接进行认证。

安装所需的依赖：

```shell
go mod tidy
```

`go mod tidy` 命令会下载 `tsnet` 库及其依赖。你的 `go.mod` 文件现在包含所有所需包的确切版本。

在本地测试该应用，确保它能编译并运行：

```shell
go build -o tshello
./tshello -addr tshello
```

应用启动后会尝试加入你的 tailnet。如果你本地设备尚未通过 Tailscale 认证，它会提示你进行认证。按照提示完成认证即可。

连接成功后，应用会显示它的 [Tailscale IP 地址][docs-100.x-addresses]。你可以从 tailnet 中的任何设备使用你指定的主机名或 tailnet IP 地址访问它。

用 `CTRL+C` 停止本地测试。你的演示应用已准备好在 GitHub Actions 中进行自动化测试。

在继续之前，初始化 Git 并将本地仓库关联到你的 GitHub 仓库：

```shell
git init
git remote add origin https://github.com/<username>/<repository-name>.git
git commit -m "Init tshello app"
git push -u origin main
```

你已经手动验证了程序，但现在要创建一个测试来确保它能正常工作。你最终会在 GitHub action 中运行这个测试。

你已经有了一个会加入 tailnet 的基础 `tsnet` 应用。接下来，你将创建一个 Go 测试，验证该应用可以通过 Tailscale 通信。

> **提示：**
>
> 你可以在 GitHub 上的 [`tailscale-dev/secure-github-runners`][xt-gh-secure-github-runners] 仓库中获取本指南的完整代码。

## 第 5 步：创建 Go 测试

接下来，你将添加一个 [Go 测试][xt-go-tests]文件，其中的测试用于验证你的 GitHub Actions 运行器可以通过 Tailscale 网络成功通信。这些测试确保 `tshello` 应用正常工作，并能通过 Tailscale 的认证识别连接的客户端。

> **警告：**
>
> 要让这个测试生效，你必须已经创建了[认证密钥][docs-auth-keys]，并用它在本地和 GitHub 仓库密钥中定义了 `TS_AUTHKEY` 环境变量。如果你跳过了创建认证密钥，测试仍会运行，但会跳过 Tailscale 连通性测试。

创建一个 `.env` 文件并添加以下内容（将占位符替换为你的认证密钥）：

```
TS_AUTHKEY=<your-ts-auth-key>
```

创建一个名为 `tshello_test.go` 的 Go 测试文件。该测试文件包含验证 Tailscale 网络连通性的集成测试，以及无需网络即可验证代码行为的单元测试。集成测试验证服务器初始化、通过 tailnet 的 HTTP 客户端连通性，以及对等节点间的 DNS 解析。

先声明包并导入必要的依赖。这些导入包括用于测试、网络和 HTTP 操作的标准 Go 库，以及用于创建临时 Tailscale 节点的 Tailscale `tsnet` 包。

```go
package main

import (
 "context"
 "fmt"
 "io"
 "net"
 "net/http"
 "os"
 "strings"
 "testing"
 "time"

 "tailscale.com/tsnet"
)
```

`tsnet` 包提供创建临时 Tailscale 设备（临时节点）的核心功能，这些设备会在测试执行期间加入你的 tailnet。标准库包负责 HTTP 操作、上下文管理和网络操作。

第一个测试函数验证 `tshello` 服务器能否正确初始化、创建监听器并优雅关闭。该测试创建一个临时 `tsnet` 服务器，启动一个 HTTP 服务器，并验证启动过程。

```go
func TestTshelloServer(t *testing.T) {
 if testing.Short() {
  t.Skip("skipping test in short mode")
 }

 ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
 defer cancel()

 srv := &tsnet.Server{
  Hostname: "tshello-test",
  Dir:      t.TempDir(),
 }
 defer srv.Close()

 ln, err := srv.Listen("tcp", ":0")
 if err != nil {
  t.Fatalf("failed to listen: %v", err)
 }
 defer ln.Close()

 lc, err := srv.LocalClient()
 if err != nil {
  t.Fatalf("failed to get local client: %v", err)
 }

 serverURL := fmt.Sprintf("http://%s", ln.Addr().String())
 t.Logf("Test server listening on %s", serverURL)

 httpServer := &http.Server{
  Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
   who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
   if err != nil {
    http.Error(w, err.Error(), 500)
    return
   }
   fmt.Fprintf(w, "Hello, %s!", who.UserProfile.LoginName)
  }),
 }

 errCh := make(chan error, 1)
 go func() {
  errCh <- httpServer.Serve(ln)
 }()

 select {
 case <-ctx.Done():
  t.Fatal("test timed out waiting for server to start")
 case err := <-errCh:
  if err != nil && err != http.ErrServerClosed {
   t.Fatalf("server error: %v", err)
  }
 case <-time.After(5 * time.Second):
  t.Log("Server started successfully")
 }

 if err := httpServer.Shutdown(ctx); err != nil {
  t.Logf("server shutdown error: %v", err)
 }
}
```

该测试使用临时目录存放 `tsnet` 服务器状态，并验证 HTTP 处理器能否使用 Tailscale 的认证信息识别连接的客户端。如果服务器在超时时间内成功启动并干净地关闭，测试即通过。

下一个测试函数创建一个 `tsnet` 客户端，并尝试通过 tailnet 连接到正在运行的 `tshello` 实例。这个集成测试需要有效的认证密钥，并会尝试访问测试服务器和生产服务器。

```go
func TestTshelloHTTPClient(t *testing.T) {
 if testing.Short() {
  t.Skip("skipping test in short mode")
 }

 authKey := os.Getenv("TS_AUTHKEY")
 if authKey == "" {
  t.Skip("TS_AUTHKEY not set, skipping Tailscale connectivity test")
 }

 ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
 defer cancel()

 srv := &tsnet.Server{
  Hostname: "tshello-client-test",
  Dir:      t.TempDir(),
  AuthKey:  authKey,
 }
 defer srv.Close()

 if err := srv.Start(); err != nil {
  t.Fatalf("failed to start tsnet: %v", err)
 }

 httpClient := srv.HTTPClient()

 targets := []string{
  "tshello-test",
  "tshello",
 }

 for _, target := range targets {
  t.Run(fmt.Sprintf("ping_%s", target), func(t *testing.T) {
   url := fmt.Sprintf("http://%s/", target)

   req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
   if err != nil {
    t.Skipf("failed to create request for %s: %v", target, err)
    return
   }

   resp, err := httpClient.Do(req)
   if err != nil {
    if strings.Contains(err.Error(), "no such host") ||
       strings.Contains(err.Error(), "connection refused") ||
       strings.Contains(err.Error(), "timeout") {
     t.Skipf("target %s not available: %v", target, err)
     return
    }
    t.Errorf("failed to connect to %s: %v", target, err)
    return
   }
   defer resp.Body.Close()

   body, err := io.ReadAll(resp.Body)
   if err != nil {
    t.Errorf("failed to read response from %s: %v", target, err)
    return
   }

   t.Logf("Response from %s (status %d): %s", target, resp.StatusCode, string(body))

   if resp.StatusCode != http.StatusOK {
    t.Errorf("unexpected status code from %s: %d", target, resp.StatusCode)
   }
  })
 }
}
```

该测试为每个目标主机名创建子测试，并优雅地跳过不可用的目标。在本地运行且 tailnet 中没有其他设备时，测试会跳过不可用的目标。在 GitHub Actions 环境中，测试会连接运行器上的 `tshello` 实例。

再添加一个测试函数，验证 tailnet 中对等节点的 DNS 查询是否正常。该测试从 Tailscale 状态中获取对等节点列表，并尝试解析每个对等节点的主机名。

```go
func TestTshelloDNSResolution(t *testing.T) {
 if testing.Short() {
  t.Skip("skipping test in short mode")
 }

 authKey := os.Getenv("TS_AUTHKEY")
 if authKey == "" {
  t.Skip("TS_AUTHKEY not set, skipping DNS test")
 }

 ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
 defer cancel()

 srv := &tsnet.Server{
  Hostname: "tshello-dns-test",
  Dir:      t.TempDir(),
  AuthKey:  authKey,
 }
 defer srv.Close()

 if err := srv.Start(); err != nil {
  t.Fatalf("failed to start tsnet: %v", err)
 }

 lc, err := srv.LocalClient()
 if err != nil {
  t.Fatalf("failed to get local client: %v", err)
 }

 status, err := lc.Status(ctx)
 if err != nil {
  t.Fatalf("failed to get status: %v", err)
 }

 t.Logf("Current node: %s", status.Self.HostName)
 t.Logf("Tailnet name: %s", status.CurrentTailnet.Name)
 t.Logf("Number of peers: %d", len(status.Peer))

 for _, peer := range status.Peer {
  t.Logf("Peer: %s (%s)", peer.HostName, peer.TailscaleIPs[0])

  ips, err := net.LookupIP(peer.HostName)
  if err != nil {
   t.Logf("Failed to resolve %s: %v", peer.HostName, err)
   continue
  }

  for _, ip := range ips {
   t.Logf("  Resolved IP: %s", ip)
  }
 }
}
```

该测试记录当前设备、tailnet 名称以及 tailnet 中每台设备的信息。它会尝试对每台 tailnet 设备进行 DNS 解析并记录结果，帮助你验证 MagicDNS 在测试环境中是否正常工作。

最后，为从域名中提取第一个标签的 `firstLabel` 工具函数添加一个单元测试。该测试验证该函数在各种输入格式下都能正确工作。

```go
func TestFirstLabel(t *testing.T) {
 tests := []struct {
  input    string
  expected string
 }{
  {"example.com", "example"},
  {"sub.example.com", "sub"},
  {"localhost", "localhost"},
  {"", ""},
  {"single", "single"},
 }

 for _, tt := range tests {
  t.Run(tt.input, func(t *testing.T) {
   result := firstLabel(tt.input)
   if result != tt.expected {
    t.Errorf("firstLabel(%q) = %q, want %q", tt.input, result, tt.expected)
   }
  })
 }
}
```

这个表驱动测试为每个输入用例创建子测试，并验证函数产生预期的输出。该单元测试无需网络访问或认证即可运行。

从 `.env` 文件加载认证密钥：

```shell
export $(cat .env | xargs)
```

在本地运行测试，验证它们可以正常工作：

```shell
go test -v
```

单元测试通过。集成测试只有在你 tailnet 中有 `tshello` 实例运行时才会执行。这是有意为之的设计，因为当运行器加入你的 tailnet 后，集成测试会在你的 GitHub Actions 工作流中成功运行。

提交并将更改推送到你的 GitHub 仓库：

```shell
git add .
git commit -m "Add tshello test"
git push -u origin main
```

你现在有了一个单元测试和一个集成测试。可以准备在 GitHub 上作为 action 的一部分运行它们了。

> **提示：**
>
> 你可以在 GitHub 上的 [`tailscale-dev/secure-github-runners`][xt-gh-secure-github-runners] 仓库中获取本指南的完整代码。

## 第 6 步：创建 GitHub Actions 工作流

接下来，你将创建一个 [GitHub Actions 工作流][xt-gh-actions]，使用 [Tailscale GitHub Action][docs-tailscale-GitHub-action] 把运行器连接到你的 tailnet，构建 `tshello` 应用并验证连通性。这个工作流演示了从 CI/CD 流水线访问私有资源的完整模式。

在你的仓库中创建 GitHub Actions 工作流的目录结构：

```shell
mkdir -p .github/workflows
```

创建一个名为 `.github/workflows/<name>.yml` 的 YAML 工作流文件：

```shell
touch .github/workflows/<name>.yml
```

先定义工作流名称和触发器。这份配置让工作流在推送到 main 分支、提交 pull request，以及通过 GitHub Actions 界面手动触发时运行。

```yaml
name: Test tshello with Tailscale

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
```

定义作业并指定运行器。该工作流使用 GitHub Actions 提供的 Ubuntu 运行器。

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
```

第一步检出你的仓库代码，使其对工作流中的后续步骤可用。

```yaml
    - name: Checkout code
      uses: actions/checkout@v4
```

下一步安装指定版本的 Go。这确保运行器拥有构建和测试你的应用所需的正确 Go 工具链。

```yaml
    - name: Set up Go
      uses: actions/setup-go@v5
      with:
        go-version: '1.23'
```

[Tailscale GitHub Action][docs-tailscale-GitHub-action] 将运行器连接到你的 tailnet。这一步使用你的 OAuth 凭证进行认证，并以打有 `tag:ci` 标签的[临时节点][docs-ephemeral-nodes]身份加入。运行器会获得一个 Tailscale IP 地址，并能通过 [MagicDNS][docs-magicdns] 解析其他设备。

```yaml
    - name: Connect to Tailscale
      uses: tailscale/github-action@v4
      with:
        oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
        oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
        tags: tag:ci
        version: latest
```

连接到 Tailscale 后，构建 `tshello` 应用。构建过程会下载依赖并编译代码。

```yaml
    - name: Build tshello
      run: |
        cd tshello
        go mod download
        go build -v ./...
```

设置超时时间运行测试套件，防止测试在遇到问题时挂起。这些测试验证应用功能正常，并且可以通过 Tailscale 网络通信。

```yaml
    - name: Run tests
      run: |
        cd tshello
        go test -v -timeout 30s ./...
```

通过检查状态和 IP 地址验证运行器的 Tailscale 连接。这一步证明运行器成功加入了你的 tailnet，并获得了有效的 Tailscale IP 地址。

```yaml
    - name: Test connectivity
      run: |
        # Test that we can reach the Tailscale network
        tailscale status

        # Show our IP address
        tailscale ip -4
```

这个工作流展示了运行器如何以带 `tag:ci` 标签的临时节点身份加入你的 tailnet。`tshello` 应用在同一运行器上运行，创建自己的 `tsnet` 节点，tailnet 中的其他设备可以访问它。

提交你的工作流并推送到 GitHub：

```shell
git add .
git commit -m "Add GitHub workflow"
git push origin main
```

在网页浏览器中，前往 GitHub 仓库的 **Actions** 标签页，确认工作流正在运行。选中它即可[实时监控][xt-gh-actions]日志，观察运行器连接 tailnet、构建 `tshello` 应用并运行测试的过程。

你的 GitHub Actions 工作流现在正通过到 tailnet 的安全连接运行。你可以验证这一连接，并观察临时节点在你的基础设施中的行为。

在工作流运行期间，打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，检查是否存在一台名为 `github-actions-runner` 之类、打有 `tag:ci` 标签的设备。这就是你的临时 GitHub 运行器。该设备在工作流执行期间显示为已连接，作业完成后自动消失。

你也可以在 GitHub Actions 中查看工作流日志。"Verify Tailscale connection" 步骤会显示运行器的 Tailscale IP 地址和状态。该 IP 地址来自 Tailscale 使用的 `100.64.0.0/10` [CGNAT][docs-100.x-addresses] 网段。在工作流执行期间，tailnet 中的任何设备都可以使用这个 IP 地址访问该运行器。

"Test connectivity to `tshello`" 步骤证明了基于 `tsnet` 的应用成功加入了你的 tailnet。该应用获得了自己的 [Tailscale 身份][docs-tailscale-identity]，并能对连接的客户端进行认证。在生产场景中，同样的模式可以让你的服务识别是哪个 CI 运行器或用户在发起请求。

查看管理控制台的 [Logs](https://console.tailscale.com/admin/logs) 页面。在这里，你可以查看 OAuth 客户端创建认证密钥、临时节点加入和离开 tailnet 的审计记录。这些日志为所有针对你基础设施的 CI/CD 访问提供了完整的审计追踪。

这些连接的临时性带来了安全收益：临时节点只在作业执行期间存在，从而缩小了攻击面。每个作业获得的凭证都是全新的、无法重用的。你的 tailnet 中不会累积陈旧设备，因为不再使用的临时节点会被自动清理。自动清理消除了手动维护。

你已成功创建了一个连接私有基础设施而不向互联网暴露服务的安全 GitHub Actions 工作流。接下来，你将探索如何把这一模式扩展到生产场景。

> **提示：**
>
> 你可以在 GitHub 上的 [`tailscale-dev/secure-github-runners`][xt-gh-secure-github-runners] 仓库中获取本指南的完整代码。

## 第 7 步：面向生产场景进行扩展、监控与优化

`tshello` 演示所展示的核心能力可以直接推广到生产场景。你的 GitHub Actions 工作流现在可以使用同样的模式访问 tailnet 中的任何私有资源。

对于数据库迁移，你的工作流可以直接连接 tailnet 中运行的 PostgreSQL、MySQL 或 MongoDB 实例。把 `tshello` 测试替换为实际的迁移命令：

```yaml
- name: Run database migrations
  run: |
    export DATABASE_URL="postgresql://user:pass@prod-db.tail-scale.ts.net:5432/my-app"
    npm run migrate:latest
    npm run migrate:status
```

数据库保持完全私密，没有任何面向互联网的端口。连接经由 Tailscale 加密并认证，你的审计日志会准确记录哪个工作流在何时访问了数据库。

对于 API 测试，你的集成测试可以访问未暴露到互联网的内部服务：

```yaml
- name: Run API integration tests
  run: |
    export API_BASE_URL="https://staging-api.tail-scale.ts.net"
    npm test:integration
```

你的 staging 环境保持私密，同时仍可供自动化测试访问。这些测试运行时拥有的网络访问权限与生产环境一致。

对于 Kubernetes 部署，你可以使用 `kubectl` 命令：

```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl config set-cluster production --server=https://k8s-api.tail-scale.ts.net:6443
    kubectl apply -f ./k8s/production/
    kubectl rollout status deployment/my-app -n production
```

你的 Kubernetes API 服务器无需公开端点。连接通过你的安全 tailnet 进行，并带有完整的审计日志。

对于从私有镜像仓库拉取，Docker 命令无需暴露你的仓库即可工作：

```yaml
- name: Build and push container
  run: |
    docker build -t registry.tail-scale.ts.net/my-app:${{ github.sha }} .
    docker push registry.tail-scale.ts.net/my-app:${{ github.sha }}
```

以上每个场景都遵循同一模式。你的工作流加入 tailnet，在完全访问私有资源的情况下执行操作，然后自动断开。没有手动清理，没有残留访问，没有暴露的服务。

监控临时节点并优化工作流性能，能确保你的 CI/CD 流水线高效且安全地运行。Tailscale 管理控制台让你对所有临时连接一目了然，而有的放矢的优化可以缩短工作流执行时间。

在工作流执行期间，通过 [Machines](https://console.tailscale.com/admin/machines) 页面监控临时节点。每个运行器都会显示其临时状态标识和 `tag:ci` 标签。连接时长展示了工作流已运行多久。作业完成后，这些临时节点会自动消失，保持你的设备列表整洁。

在 [Logs](https://console.tailscale.com/admin/logs) 页面审查认证模式。每次工作流运行都会生成认证密钥创建、节点注册和断开连接的日志条目。按 `tag:ci` 标签过滤日志，即可审查所有 CI/CD 活动。这些日志帮助你了解使用模式并排查连接问题。

通过[缓存 Tailscale 二进制文件][docs-tailscale-github-action-cache-tailscale]优化工作流性能。GitHub Action 会自动处理缓存，但你可以调整其行为：

```yaml
- name: Connect to Tailscale
  uses: tailscale/github-action@v4
  with:
    oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
    oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
    tags: tag:ci
    version: '1.76.1'  # Pin version for consistency
    use-cache: 'true' # Enable caching
```

固定 Tailscale 版本能确保各次工作流运行行为一致，并最大化缓存命中，缩短下载时间。

对于需要多个作业都访问 Tailscale 的工作流，可以考虑使用[矩阵策略（matrix strategy）][xt-gh-actions]：

```yaml
strategy:
  matrix:
    service: [database, api, frontend]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Connect to Tailscale
      uses: tailscale/github-action@v4
      with:
        oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
        oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
        tags: tag:ci

    - name: Test ${{ matrix.service }}
      run: |
        ./test-${{ matrix.service }}.sh
```

每个矩阵作业都会获得自己的临时连接，从而可以并行地针对你的私有基础设施进行测试。

## 结语

你的 GitHub Actions 工作流现在通过只在作业执行期间存在的临时、经过认证的 Tailscale 连接安全地访问私有基础设施。你消除了内部服务的公网暴露，同时保留了 GitHub 托管运行器的简便性，并免除了自托管基础设施的运维负担。

`tshello` 演示虽然简单，却证明了可推广到生产场景的强大能力。数据库迁移可以从 GitHub Actions 执行而不暴露数据库端口。API 集成测试可以针对内部 staging 环境运行。部署脚本可以安全地访问本地部署的资源。GitHub Actions 跨云提供商编排资源的多云架构也能无缝工作。

这种临时、带标签的访问模式提供了一种能随基础设施复杂度扩展的安全模型。每个连接都经过认证、授权和审计。自动清理确保没有残留访问。你的安全团队通过审计日志获得完整的可见性，而开发团队则保持部署速度。

这一基础能力还能支撑更高级的模式，例如面向私有 Kubernetes 集群的[蓝绿部署][xt-wikipedia-blue-green-deployment]、对内部服务的自动化安全扫描、针对类生产环境的性能测试，以及访问受监管系统的合规性工作流。每个用例都遵循你在这里实现的同一安全模式。

[co-start]: https://tailscale.com/start

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-hello-tsnet-create-a-tsnet]: /docs/features/tsnet/how-to/create-basic-tsnet-app#创建-tsnet-hello-world-程序

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-tailscale-github-action-cache-tailscale]: /docs/integrations/github/github-action#缓存-tailscale-二进制文件

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-tsnet]: /docs/features/tsnet

[xt-gh-account-and-profile]: https://docs.github.com/en/account-and-profile/reference/permission-levels-for-a-personal-account-repository

[xt-gh-actions]: https://docs.github.com/en/actions

[xt-gh-runner]: https://docs.github.com/en/actions/concepts/runners

[xt-gh-secure-github-runners]: https://github.com/tailscale-dev/secure-github-runners

[xt-gh-secure-runners]: https://docs.github.com/en/actions/concepts/runners/private-networking

[xt-gh-self-hosted-runners]: https://docs.github.com/en/actions/concepts/runners/self-hosted-runners

[xt-gh-workflow-syntax]: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax

[xt-go-syntax]: https://go.dev/ref/spec

[xt-go-tests]: https://go.dev/doc/tutorial/add-a-test

[xt-tailscale-go-whois]: https://pkg.go.dev/tailscale.com@v1.88.1/client/local#Client.WhoIs

[xt-wikipedia-blue-green-deployment]: https://en.wikipedia.org/wiki/Blue%E2%80%93green_deployment
