---
title: "Tailscale SSH 会话录制"
description: "Tailscale SSH 会话录制让你可以将 [Tailscale SSH][docs-tailscale-ssh] 会话的日志流式传输到 tailnet 中的另一个节点。与其他所有 Tailscale 流量一样，这些录制内容经过端到端加密。"
---

最后验证于 Jan 5, 2026

> **弃用通知：**
>
> Tailscale 不再通过 `tsrecorder` 提供 Tailscale SSH 会话录制。对现有用户的支持计划于 2027 年 8 月结束。对于会话录制和特权访问管理，请使用 [Tailscale PAM][docs-tailscale-pam] 或联系 [Tailscale 销售团队][co-contact-sales]。

Tailscale SSH 会话录制让你可以将 [Tailscale SSH][docs-tailscale-ssh] 会话的日志流式传输到 tailnet 中的另一个节点。与其他所有 Tailscale 流量一样，这些录制内容经过端到端加密。

> **注意：** Tailscale SSH 会话录制目前处于 beta 阶段。

> **注意：** Tailscale SSH 会话录制适用于 [Personal 和 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> Tailscale 会话录制器现在支持录制所有 [Kubernetes 会话和 API 请求][docs-operator-session-recording]。

## 工作原理

Tailscale SSH 会话录制让你可以将 Tailscale SSH 会话的录制内容从目标节点流式传输到 tailnet 中的录制节点。录制器是一个 [`tsnet` 二进制程序][bl-tsnet-virtual-private-services]，你可以将它部署到你管理的机器或 [Kubernetes 集群][docs-operator-session-recording]上。日志通过你的 tailnet 流式传输到你的节点，因此是端到端加密的，Tailscale 无法看到。录制器可以将日志文件存储在主机文件系统上，也可以将其导出到 Amazon S3 或其他兼容 S3 的存储服务。

Tailscale SSH 会话录制以 [`asciinema`][xt-asciinema] 格式捕获终端会话。这些录制内容是以换行符分隔的 JSON 文件，可以当作文本进行搜索，并可以从录制节点的可选 Web UI 或 `asciinema` CLI 回放。

> **注意：**
>
> 会话录制会捕获所有终端输出，即在 Tailscale SSH 会话期间出现在终端屏幕上的任何文本。其中可能包含敏感数据。不会捕获按键。

> **注意：**
>
> 使用二进制协议（例如旧版本的 `scp`）时，会话录制会捕获传输的二进制数据。其中可能包含敏感数据。

## 为 Tailscale SSH 设置会话录制

### 前提条件

会话录制仅适用于通过 Tailscale SSH 进行的 SSH 连接。

你必须具有 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 身份才能设置会话录制。

要启用会话录制，你必须：

* 确保在你的 tailnet 中正确配置了 Tailscale SSH。
* 在你的 tailnet 中部署一个录制节点。
* 在 tailnet 策略文件中启用会话录制，方法是在每个 SSH 策略条目中添加 `recorder:["tag:<tag-name>"]` 字段。该条目允许的 SSH 会话将被流式传输到带有指定标签的所有录制器。

录制节点二进制程序可以作为 Docker 容器在任何平台上运行。由于该二进制程序使用 [`tsnet`][bl-tsnet-virtual-private-services] 以节点身份加入你的 tailnet，因此 Docker 主机不必是 tailnet 的成员。该应用监听 `80` 端口以接收会话录制，并在 `443` 端口提供一个可选的内置 Web 应用来查看会话录制。

### 为会话录制器创建标签和认证密钥

录制节点必须关联一个标签。我们建议专门为 SSH 会话录制创建一个新的[标签][docs-tags]。你可以访问管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，在访问控制策略中定义该标签的所有者。

```json
// Example tag for SSH session recorders
"tagOwners": {
  "tag:session-recorder": [
    "<tag-owner>",
  ],
}
```

接下来，访问管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建一个认证密钥。将你刚创建的新标签分配给该认证密钥。如果你的 tailnet 启用了设备批准，请使用预批准密钥。务必将此认证密钥复制到剪贴板。

在将要部署录制节点容器的主机上，将 `TS_AUTHKEY` 环境变量设置为该认证密钥。只有第一次启动录制应用时才需要这样做。

```
export TS_AUTHKEY=<your-auth-key>
```

### 部署录制节点

录制器以 Docker 容器的形式提供，你可以在 [Tailscale 的 DockerHub 主页][xt-docker-tailscale-tsrecorder-tags]找到它。

> **注意：**
>
> 如果你使用 Tailscale 的 Kubernetes Operator，还可以使用 [`Recorder` 自定义资源][docs-operator-session-recording]部署录制器。

```shell
docker pull tailscale/tsrecorder:stable
```

要运行容器并将录制内容保存到 Docker 主机的文件系统：

```shell
docker run --name tsrecorder --rm -it \
  -e TS_AUTHKEY=$TS_AUTHKEY \
  -v $HOME/tsrecorder:/data \
  tailscale/tsrecorder:stable \
  /tsrecorder --dst=/data/recordings --statedir=/data/state --ui
```

必需标志：

* `--dst` 指定录制内容的保存位置。接受本地文件路径或 S3 区域 URL。也可以将该值定义为环境变量 `TSRECORDER_DST`。

可选标志：

* `--hostname` 指定录制节点使用的主机名。默认为 `recorder`。也可以将该值定义为环境变量 `TSRECORDER_HOSTNAME`。
* `--access-key` 可将录制内容上传到 S3 存储桶的 IAM 用户的 AWS 访问密钥。当使用 S3 作为存储后端且未向实例传递 IAM 角色时为必需项。也可以将该值定义为环境变量 `AWS_ACCESS_KEY_ID`。
* `--secret-key` 可将录制内容上传到 S3 存储桶的 IAM 用户的 AWS 秘密访问密钥。当使用 S3 作为存储后端且未向实例传递 IAM 角色时为必需项。也可以将该秘密访问密钥定义为环境变量 `AWS_SECRET_ACCESS_KEY`。
* `--bucket` 录制器上传录制内容的 S3 存储桶名称。使用 S3 作为存储后端时为必需项。也可以将该值定义为环境变量 `TSRECORDER_BUCKET`。
* `--state` Tailscale 状态文件的路径，用于在容器重启之间持久化录制器状态。可以是持久卷或 Kubernetes [`Secret`][xt-kubernetes-secret]。也可以将该值定义为环境变量 `TS_STATE`。
  * 要使用 `Secret`，请指定 `kube:<secret-name>`。如果设置为使用 `Secret` 存储状态，录制器必须拥有读取、更新和修补该 `Secret` 的权限。如果该 `Secret` 不存在，录制器会创建它，因此也必须拥有相应权限。
  * 如果未设置 `--state`，状态将存储在使用 `--statedir` 设置的目录中。
* `--statedir` 指定录制器存储其内部状态的位置。接受本地文件路径。如果存储后端是文件系统，默认为 `<recordings-destination>/state`。除非已设置状态文件路径，否则为必需项。也可以通过环境变量 `TS_STATE_DIR` 设置。
* `--ui` 启用录制器容器的 Web UI 以查看已录制的 SSH 会话。如果未提供此标志，默认为 `false`。也可以将该值定义为环境变量 `TSRECORDER_UI`。
  * 如果部署录制器时启用了 UI，你的 tailnet 必须已启用 HTTPS。
  * 如果启用录制器容器的 Web UI，你应在访问控制策略中限制对录制器 `443` 端口的访问，以防止 tailnet 中未经授权的成员查看敏感的录制内容。

### 在 tailnet 策略文件中开启会话录制

你可以在 tailnet 策略文件中针对每条 SSH [访问规则][docs-policy-syntax-acls]分别开启会话录制。为每条规则添加一个 `recorder` 字段，并指定附加在录制节点上的标签（`["tag:<tag-name>"]`）。如果未指定 `recorder`，则不会录制会话。

默认情况下，当某条 SSH 访问规则启用了会话录制时，即使录制节点不可达，Tailscale 也允许相应的 Tailscale SSH 会话建立连接。我们称之为"失败放行"（failing open）。你可以通过添加 `enforceRecorder` 字段并将其设置为 `true` 来调整此行为。这样，当录制节点不可达时，任何应当被录制的 Tailscale SSH 会话都会被拒绝和/或终止。我们称之为"失败关闭"（failing closed）。

如果某个 SSH 连接被两条或更多 SSH 访问规则允许，且这些规则为 `enforceRecorder` 指定了不同的值，Tailscale 将遵循 tailnet 策略文件中排在最前面的规则的行为。

```json
{
  "action": "check", // "accept" or "check"
  "src": [list-of-sources],
  "dst": [list-of-destinations],
  "users": [list-of-ssh-users],
  "recorder": ["tag:<tag-name>"], // optional field; specify the tag attached to your recorder node.
  "enforceRecorder": false, // optional field; defaults to false; if session recorder node is unavailable, should the session be denied?
},
```

> **注意：**
>
> 如果 `enforceRecorder` 为 `true`，且在访问控制策略中启用会话录制之后录制节点变得不可用，Tailscale SSH 会话将被拒绝，所有活动的 Tailscale SSH 会话都会被终止。在录制节点不可达且设置为失败关闭的情况下，要建立 Tailscale SSH 会话，请从访问控制策略中移除 `recorder` 字段。

## 限制对录制节点和主机的访问

每台 Tailscale SSH 服务器都会通过 `80` 端口将其 SSH 会话录制发送到录制节点。Tailscale 会自动确保 Tailscale SSH 服务器与其发送会话的录制节点之间的流量被允许。你无需在访问控制策略中做任何更改。

如果你启用了录制器容器的 Web UI，请确保为适当的用户开放 `443` 端口的访问。与前面一样，使用关联的标签来编写这条访问规则。

由于录制器会将会话录制存储在主机磁盘上，你应确保只有合适的用户才能访问这些环境。我们建议将录制节点及其主机的访问范围限制到必要的最少用户，并注意 Owner、Admin 和 Network admin 都有权更改此功能的访问规则。

## 禁用会话录制

你可以针对特定 SSH 访问规则或整个 tailnet 禁用 Tailscale SSH 会话录制。

### 针对特定 Tailscale SSH 访问规则禁用会话录制

要针对特定 SSH 访问规则禁用 Tailscale SSH 会话录制，请从该 SSH 访问规则中移除 `recorder` 行。符合该规则的 SSH 会话将不再被录制。

先前的录制内容不会被删除，需要你从录制节点上手动删除。

### 针对所有 Tailscale SSH 会话禁用会话录制

要针对 tailnet 中的所有 Tailscale SSH 会话禁用 Tailscale SSH 会话录制：

* 从 tailnet 策略文件 `ssh` 分区的所有 SSH 访问规则中移除 `recorder` 规则
* 将录制节点从你的 tailnet 中移除。可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 标签页中删除该设备。

## 会话录制内容

录制内容存储在你指定的目录中，路径为 `/dir/<stablenodeid>/<timestamp>.cast`。`<stablenodeid>` 目录对应被访问的 SSH 服务器的[稳定节点 ID][co-api-devices]。

如果主机磁盘空间耗尽，录制器将无法继续存储会话并会失败。这会导致已打开的会话被终止、新会话被拒绝。要解决此问题，请从你机器的 SSH 访问规则中移除 `recorder` 字段，访问该节点主机，清理空间或增加存储，然后恢复 `recorder` 字段。

### 查看录制内容

Tailscale SSH 会话录制以 `asciinema` 格式捕获每个 SSH 会话。这种格式可以回放，用于查看会话中发生的内容。

如果你部署录制器时开启了内置 Web UI，可以在浏览器中通过该 URL 查看录制内容。你的 [tailnet DNS 名称][docs-tailnet-name-tailnet-dns]可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到。

`https://{recorder-name}.{tailnet-dns-name}.ts.net`

在 CLI 中，你可以使用以下命令访问录制数据：

```shell
cat <session-recording.cast>
```

你也可以在 CLI 中使用 `asciinema` 通过以下命令观看录制：

```shell
play <session-recording.cast>
```

要在本地安装 `asciinema`，请参阅适用于你平台的[安装文档][xt-asciinema-install]。

你还可以使用 [`agg`][xt-gh-agg] 将录制内容转换为 GIF。

### 分析录制内容

录制内容使用 `asciinema` 格式，因此是以换行符分隔的 JSON 文件，可以当作文本搜索。例如，在录制内容中搜索 `sudo`：

```shell
grep "sudo" <session-recording.cast>
```

### 录制示例

以下是使用 `asciinema` 回放一段简短会话录制的示例：

*（图：用 asciinema 制作的终端录制，用户输入"echo hi"，终端输出"hi"。）*

asciinema 会话录制回放的演示。

同一段录制在 `asciinema` 文件中的表示如下。你可以轻松地在这个文件中搜索你感兴趣的关键字或模式。

```
{"version":2,"width":203,"height":38,"timestamp":1679441819,"env":{"TERM":"xterm-256color"},"srcNode":"srcnode.ts.net","srcNodeID":"nguedK2CNTRL","srcNodeTags":null,"sshUser":"alice","localUser":"alice","srcNodeUserID":30585448562688899,"srcNodeUser":"alice@tailscale.com"}
[0.456997416,"o","Last login: Tue Mar 21 16:35:14 from 1.2.3.4\r\n"]
[0.552500666,"o","\u001b[1m\u001b[7m%\u001b[27m\u001b[1m\u001b[0m                                                                                                                                                                                                          \r \r"]
[0.557596708,"o","\u001b]2;alice@laptop:~\u0007\u001b]1;~\u0007"]
[0.567016125,"o","\r\u001b[0m\u001b[27m\u001b[24m\u001b[J\u001b[01;32m➜  \u001b[36m~\u001b[00m \u001b[K"]
[0.567112833,"o","\u001b[?1h\u001b=\u001b[?2004h"]
[1.500827583,"o","e"]
[1.58455025,"o","\u0008ec"]
[1.6682777500000001,"o","h"]
[1.7546742499999999,"o","o"]
[1.896455708,"o"," "]
[2.020248958,"o","h"]
[2.08789675,"o","i"]
[2.323278875,"o","\u001b[?1l\u001b\u003e"]
[2.323438208,"o","\u001b[?2004l\r\r\n"]
[2.324209,"o","\u001b]2;echo hi\u0007"]
[2.324296291,"o","\u001b]1;echo\u0007hi\r\n\u001b[1m\u001b[7m%\u001b[27m\u001b[1m\u001b[0m                                                                                                                                                                                                          \r \r"]
[2.334692083,"o","\u001b]2;alice@laptop:~\u0007\u001b]1;~\u0007"]
[2.349814583,"o","\r\u001b[0m\u001b[27m\u001b[24m\u001b[J\u001b[01;32m➜  \u001b[36m~\u001b[00m \u001b[K"]
[2.349910875,"o","\u001b[?1h\u001b=\u001b[?2004h"]
[2.89156075,"o","\u001b[?2004l\r\r\n"]
```

### （可选）部署多个录制器以实现故障切换

如果你在生产环境中运行 Tailscale SSH 会话录制，可能需要[以故障切换配置部署多个录制器][docs-multiple-recorder-nodes]，以避免意外停机。

## 局限性

* 录制内容仅适用于 Tailscale SSH 会话，不适用于其他通过 Tailscale 进行的 SSH 会话。
* 录制内容从 Tailscale SSH 连接的目标节点流式传输，无法配置为从源节点传输。
* 会话录制只记录 SSH 会话的输出，不记录输入。
* 所有输出都会被记录，包括输出中可能包含的敏感数据。

[bl-tsnet-virtual-private-services]: https://tailscale.com/blog/tsnet-virtual-private-services

[co-api-devices]: https://tailscale.com/api#tag/devices

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-multiple-recorder-nodes]: /docs/reference/multiple-recorder-nodes

[docs-operator-session-recording]: /docs/kubernetes-operator/recorder

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-dns]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailscale-pam]: /docs/privileged-access-management/session-logs

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[xt-asciinema-install]: https://docs.asciinema.org/manual/cli/installation

[xt-asciinema]: https://asciinema.org

[xt-docker-tailscale-tsrecorder-tags]: https://hub.docker.com/r/tailscale/tsrecorder/tags

[xt-gh-agg]: https://github.com/asciinema/agg

[xt-kubernetes-secret]: https://kubernetes.io/docs/concepts/configuration/secret/
