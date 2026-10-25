---
title: "网络流日志"
description: "网络流日志让你了解 Tailscale 网络（即 tailnet）中的节点如何以及何时相互连接。你可以导出网络日志用于长期存储、安全分析、威胁检测或事件调查"
---

最后验证于 Jan 23, 2026

网络流日志让你了解 Tailscale 网络（即 tailnet）中的节点如何以及何时相互连接。你可以导出网络日志用于长期存储、安全分析、威胁检测或事件调查。你还可以把日志[流式传输][docs-log-streaming]到 SIEM（安全信息与事件管理，[SIEM][ln-security-info-event-management]）系统。

网络日志中捕获的数据是网络流量的流动情况，而不是网络流量的内容。Tailscale 不会也无法检查你的流量。有关你的数据如何保持私密的更多信息，参见我们的[安全页面][co-security]。

网络流日志可查看最近 30 天的记录。

> **注意：**此功能[面向 Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> 只有运行 Tailscale v1.34 或更高版本的节点才能向 Tailscale 日志服务发送网络遥测数据。

## 工作原理

启用网络流日志后（且未使用 [`--no-logs-no-support`][docs-log-mesh-traffic-opt-out]），节点会向 Tailscale 日志服务报告其流量信息（包括连接的两端）。连接可以发生在：

* 两个节点之间
* 节点与子网路由器后面的设备之间
* 节点与经由出口节点访问的公共设备之间

当连接发生在节点与子网路由器后面的设备之间时，由该子网路由器记录连接。当连接发生在节点与经由出口节点访问的公共设备之间时，由该出口节点记录连接。

日志记录发生在已发送和已接收的网络连接之间，并且连接两端都有条目。

日志发生在两个层面：虚拟层和物理层。虚拟层是 Tailscale 为每台设备提供的 Tailscale 网络（通常使用 [`100.x.x.x`][docs-100.x-addresses] IP 地址）。物理层涉及设备上的所有物理网络接口。当一个节点向另一个节点发送数据包时，数据包必须穿过物理层。虚拟层路由的全部流量之和通常等于物理层路由的流量。

> **注意：**
>
> Tailscale 集中存储网络日志并允许你导出。Tailscale 不会记录网络流量的实际内容或数据。

## 网络日志结构

网络日志包含一个消息数组，提供有关网络流活动的详细信息。每条消息包含以下组成部分：

* `nodeId`：生成此日志消息的节点。它是节点的全局唯一标识符，与节点名称不同。如果要把 `nodeId` 映射到节点名称，可以使用 [`/api/v2/device/:nodeId`][co-api-devices] 方法并查看 `name` 字段。
* `logged`：Tailscale 日志服务记录该消息的 UTC 时间。通常，记录时间晚于消息中的结束时间。
* `start`：消息中网络流量数据的开始时间（UTC），由生成该消息的节点记录。
* `end`：消息中网络流量数据的结束时间（UTC），由生成该消息的节点记录。
* `srcNode`：源节点自身的信息，即生成此日志消息的节点。详见下一节的 `Node` 类型。
* `dstNodes`：源节点（例如本节点）与之通信的所有目标节点的信息列表。详见 `Node` 类型。
* `virtualTraffic`：网络流虚拟流量的计数器。虚拟流量是 tailnet 中节点之间发生的流量。
* `subnetTraffic`：网络流经由已宣告的子网路由器路由的流量的计数器。
* `exitTraffic`：网络流经由出口节点路由的流量的计数器。对于从节点经出口节点发往公共设备的流量，源为 Tailscale IP 地址，但协议、源端口和目标为空。对于从公共设备经出口节点返回节点的流量响应，目标为 Tailscale IP 地址，但协议、目标端口和源为空。为保护隐私，Tailscale 不会收集单个连接的细粒度信息。如果管理员启用了[目标日志记录][docs-exit-nodes-logging]，则会记录协议、源端口和目标信息。
* `physicalTraffic`：网络流在虚拟 Tailscale 网络之下的物理网络层上的流量的计数器。物理层的流量信息收集时间与虚拟层略有不同，因此流经虚拟层的数据包可能与物理层的不完全对应。

开始和结束时间特定于生成该消息的节点。不同节点之间的时间戳可能存在时钟偏差。

虚拟、子网、出口和物理流量计数器由以下部分组成：

* `proto`：网络流的 [IANA 协议编号][xt-iana-protocol-numbers]：TCP 为 6，UDP 为 17。出口流量为空，除非启用了[目标日志记录][docs-exit-nodes-logging]。
* `src`：网络流源的 Tailscale IP 地址和端口。出口流量不包含端口号，除非启用了[目标日志记录][docs-exit-nodes-logging]。
* `dst`：网络流目标的 IP 地址和端口。该 IP 地址可以是 Tailscale IP 地址，也可以是外部 IP 地址（例如私有网络或公网 IP 上的地址）。出口流量为空，除非启用了[目标日志记录][docs-exit-nodes-logging]。
* `txPackets`：已发送的数据包数量。
* `txBytes`：已发送的字节数。
* `rxPackets`：已接收的数据包数量。
* `rxBytes`：已接收的字节数。

## 启用网络流日志

网络流日志默认停用。

你必须是 tailnet 的 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 才能启用网络流日志。

1. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
2. 选择 **Start logging**。
3. 在 **Start logging network flows** 对话框中，选择 **Start logging**。

## 停用网络流日志

你必须是 tailnet 的 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 才能停用网络流日志。

1. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
2. 选择 **Stop logging**。
3. 在 **Stop logging network flows** 对话框中，选择 **Stop logging**。

## 访问网络日志

你必须是 tailnet 的 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 才能访问网络日志。

你可以使用 Tailscale [API][docs-api] 或[日志流式传输][ar-network-flow-logs-streaming]访问网络日志。

### 通过 API 访问网络日志

你需要一个具有 `logs:network:read` 权限范围的 [API 访问令牌][docs-api-authentication]才能访问网络日志。

调用 `https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/network` 端点的响应是 `Response` 结构体的形式：

```go
type Response struct {
	Logs []Message `json:"logs"`
}
```

使用 Go 语法描述，`Response` 结构体包含一个 `Message` 类型的切片。`Message` 结构体定义如下：

```go
type Message struct {
	// NodeID is the stable ID of the node that
	// generated this network log message.
	NodeID string `json:"nodeId"` // for example, "n123456CNTRL"

	// Logged is the timestamp of when the Tailscale logs service
	// recorded the network log message from a given node.
	// It is guaranteed to be within the start and end time ranges
	// specified in the API request.
	// All log messages are listed in chronological order
	// from oldest to newest.
	Logged time.Time `json:"logged"`

	// Start and End are the inclusive time ranges for the network
	// traffic flow information present in the message.
	// These timestamps are recorded by the node and subject
	// to clock skew across different nodes.
	// Generally speaking, the Logged timestamp is after End.
	//
	// Network logs are gathered in 5 second windows.
	// This may change in the future.
	Start time.Time `json:"start"`
	End time.Time `json:"end"`

	// SrcNode is information about the source node itself,
	// which is the node that generated this log message.
	SrcNode Node `json:"srcNode,omitzero"`

	// DstNodes is information about all destination nodes
	// that the source node (i.e., this node) communicated with.
	DstNodes []Node `json:"dstNodes,omitzero"`

	// VirtualTraffic records connection statistics for
	// node to node traffic.
	// Both the source and address are Tailscale IP addresses
	// (for example, 100.xx.xx.xx). The source is always the
	// Tailscale IP address of the current node.
	VirtualTraffic []ConnectionCounts `json:"virtualTraffic"`

	// SubnetTraffic records node to external traffic
	// on an explicitly advertised subnet route.
	//
	// For nodes using a subnet router,
	// the source is the Tailscale IP address of the current node and
	// the destination is the external IP address in the subnet range.
	// For nodes operating as the subnet router,
	// the destination is the Tailscale IP address of the node
	// using the subnet router and the source address
	// is the external IP address within the advertised subnet range.
	SubnetTraffic []ConnectionCounts `json:"subnetTraffic"`

	// ExitTraffic records aggregated statistics for all traffic
	// flowing through an exit node. For traffic from a node to a
	// public device through an exit node, the source will be the
	// Tailscale IP address, but the protocol, source port,
	// and destination will be empty. For traffic responses from a
	// public device to a node through an exit node, the destination
	// will be the Tailscale IP address, but the protocol,
	// destination port and source will be empty. Fine
	// granularity information about individual connections is not
	// gathered so that privacy can be preserved.
	ExitTraffic []ConnectionCounts `json:"exitTraffic"`

	// PhysicalTraffic records traffic on the physical network layer
	// that operates below the virtual Tailscale network.
	// The source is the Tailscale IP address of remote nodes
	// that the current node is communicating with and
	// the destination is the external IP address that traffic
	// is physically sent to communicate with that
	// remote node.
	//
	// Traffic information at the physical layer is gathered
	// at a slightly different moment in time as the virtual layer,
	// so packets flowing through the virtual layer
	// may not exactly line up with those at the physical layer.
	PhysicalTraffic []ConnectionCounts `json:"physicalTraffic"`
}
```

`Message` 结构体中的若干字段使用 `ConnectionCounts` 类型。`ConnectionCounts` 结构体定义如下：

```go
type ConnectionCounts struct {
	Proto uint8  `json:"proto"` // for example, 6 for TCP, 17 for UDP
	Src   string `json:"src"`   // for example, "100.11.22.33:4567"
	Dst   string `json:"dst"`   // for example, "192.55.66.77:80"

	TxPackets uint64 `json:"txPkts"` // transferred packets
	TxBytes   uint64 `json:"txBytes"` // transferred bytes
	RxPackets uint64 `json:"rxPkts"` // received packets
	RxBytes   uint64 `json:"rxBytes"` // received bytes
}
```

`Message` 结构体中的若干字段使用 `Node` 类型。`Node` 结构体定义如下：

```go
type Node struct {
  // NodeID is the stable ID of the node.
  NodeID string `json:"nodeId"` // for example, "n123456CNTRL"

  // Name is the fully-qualified hostname of the node.
  Name string `json:"name"` // for example, "carbonite.example.ts.net"

  // Addresses are the Tailscale IP addresses of the node.
  Addresses []string `json:"addresses"` // for example, ["100.12.34.56", "fd7a:115c:a1e0::0123:4567"]

  // OS is the operating system of the node.
  OS string `json:"os"` // for example, "linux"

  // User is the user that owns the node.
  // It is not populated if the node is tagged.
  User string `json:"user"` // for example, "johndoe@example.com"

  // Tags are the tags of the node.
  // It is not populated if the node is owned by a user.
  Tags []string `json:"tags"` // for example, ["tag:prod","tag:logs"]
}
```

`Message.NodeID` 字段由 Tailscale 日志服务验证，确认为消息实际来源的节点。`Start`、`End`、`SrcNode`、`DstNodes`、`VirtualTraffic`、`SubnetTraffic`、`ExitTraffic` 和 `PhysicalTraffic` 字段由各节点生成，Tailscale 日志服务不加验证地记录。Tailscale 无法验证这些信息的准确性或真实性。恶意节点有可能伪造这些信息。

调查网络流日志时，你应当区分一组你认为更可信的节点（例如生产环境中运行的服务器）与那些可能更容易被篡改的节点（例如某位员工的工作笔记本电脑）。两者网络日志之间的不一致可能预示恶意行为。

你可以在 API 中使用以下查询参数：

* `start`：必填。要获取日志的时间范围起点，采用 [RFC 3339][xt-rfc-3339] 时间戳格式。例如：`2022-07-20T00:00:00Z`。
* `end`：必填。要获取日志的时间范围终点，采用 RFC3339 时间戳格式。如果 `end` 大于日志中最新的已知时间戳，API 调用不会阻塞。这意味着以相同 `start` 和 `end` 时间范围连续查询时，可能返回上次查询时尚不可用的不同日志条目。

`start` 和 `end` 时间在纳秒精度上包含边界。

所有日志消息按时间先后顺序列出，从最旧到最新。

该 API 不支持分页，也没有最大页大小限制。指定时间范围内所有已知的已记录网络活动都会返回。

#### API 调用示例

本示例假设你已经设置好以下变量供 API 调用使用：

* `$ACCESS_TOKEN`：调用 Tailscale API 时使用的 [API 访问令牌][docs-api-authentication]。你可以在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面创建 API 访问令牌。
* `$TAILNET_ID`：你的 tailnet ID。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 页面找到你的 tailnet ID。
* `$START`：要获取日志的时间范围起点。
* `$END`：要获取日志的时间范围终点。

```shell
export ACCESS_TOKEN=tskey-api-k123456CNTRL-0123456789abcdef
export TAILNET_ID=example.com
export START=2022-10-28T22:40:00.000000000Z
export END=2022-10-28T22:40:04.999999999Z
```

本示例调用 `https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/network` 端点。

```shell
curl -u $ACCESS_TOKEN: \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/network?start={$START}&end={$END}"
```

（你也可以从管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面复制上面的命令。）

以下代码块包含示例日志输出：

```json
{
	"logs": [
		 {
			"start":  "2025-10-28T22:39:51.890385065Z",
			"end":    "2025-10-28T22:39:56.886545512Z",
			"logged": "2025-10-28T22:40:00.290605382Z",

			"nodeId": "nBcdef1CNTRL",
			"srcNode":
					{
						"nodeId": "nBcdef1CNTRL",
						"addresses": ["100.111.22.33", "fd7a:115c:a1e0::c034:c374"],
						"os": "linux",
						"name": "pangolin.example.ts.net",
						"user": "joe@example.com"
					},
			"dstNodes": [
					{
						"nodeId": "n22daC8CNTRL",
						"addresses": ["100.111.44.55", "fd7a:115c:a1e0::abcd:0123"],
						"os": "windows",
						"name": "alice-laptop.example.ts.net",
						"user": "alice@example.com"
					},
					{
						"nodeId": "nX8fDaxCNTRL",
						"addresses": ["100.44.55.66",  "fd7a:115c:a1e0::a1b2:c3d4"],
						"os": "linux",
						"name": "prod.example.ts.net",
						"tags": ["tag:prod"]},
					{
						"nodeId": "n7sUpZQCNTRL",
						"addresses": ["100.99.88.77",  "fd7a:115c:a1e0::91ab:84ab"],
						"os": "linux",
						"name": "logstream.remote.ts.net",
						"tags": ["tag:logstream"]}
			],
			"virtualTraffic": [
					{
						"proto": 6,
						"src": "100.111.22.33:21291",
						"dst": "100.111.44.55:63281",
						"txPkts": 2,
						"txBytes": 108,
						"rxPkts": 2,
						"rxBytes": 112
					},
					{
						"proto": 6,
						"src": "100.111.22.33:864",
						"dst": "100.44.55.66:2049",
						"txPkts": 6,
						"txBytes": 900,
						"rxPkts": 3,
						"rxBytes": 728
					},
					{
						"proto": 6,
						"src": "100.111.22.33:723",
						"dst": "100.99.88.77:2049",
						"txPkts": 4,
						"txBytes": 596,
						"rxPkts": 2,
						"rxBytes": 432
					},
					{
						"proto": 6,
						"src": "100.111.22.33:21291",
						"dst": "100.111.44.55:63280",
						"txPkts": 2,
						"txBytes": 108,
						"rxPkts": 2,
						"rxBytes": 112
					}
			],
			"physicalTraffic": [
					{
						"src": "100.111.44.55:0",
						"dst": "192.55.66.77:41641",
						"txPkts": 4,
						"txBytes": 384,
						"rxPkts": 4,
						"rxBytes": 384
					},
					{
						"src": "100.44.55.66:0",
						"dst": "192.168.0.101:41641",
						"txPkts": 6,
						"txBytes": 1136,
						"rxPkts": 3,
						"rxBytes": 848
					},
					{
						"src": "100.99.88.77:0",
						"dst": "143.110.111.222:41641",
						"txPkts": 4,
						"txBytes": 752,
						"rxPkts": 2,
						"rxBytes": 512
					}
			]
		}
	]
}
```

你可以使用 Go 程序 [`netlogfmt`][xt-go-tailscale-netlogfmt] 让输出更易读：

```shell
curl -u $ACCESS_TOKEN: \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/network?start={$START}&end={$END}" \
  | go run tailscale.com/cmd/netlogfmt@latest
```

以下代码块包含示例日志输出：

```shell
===========================================================================================
NodeID: aBcdef1CNTRL
Logged: 2022-10-28 15:40:00.290
Window: 2022-10-28 15:39:51.890 (4.996s)
-----------------------------------------------------  Tx[P/s]   Tx[B/s]  Rx[P/s]   Rx[B/s]
VirtualTraffic:                                          2.80    342.66     1.80    277.01
    TCP:   100.111.22.33:864   -> 100.44.55.66:2049      1.20    180.14     0.60    145.71
    TCP:   100.111.22.33:723   -> 100.99.88.77:2049      0.80    119.29     0.40     86.47
    TCP:   100.111.22.33:21291 -> 100.111.44.55:63281    0.40     21.62     0.40     22.42
    TCP:   100.111.22.33:21291 -> 100.111.44.55:63280    0.40     21.62     0.40     22.42
PhysicalTraffic:                                         2.80    454.75     1.80    349.07
                 100.44.55.66  -> 192.168.0.101:41641    1.20    227.37     0.60    169.73
                 100.99.88.77  -> 143.111.222.333:41641  0.80    150.52     0.40    102.48
                 100.111.44.55 -> 192.55.66.77:41641     0.80     76.86     0.80     76.86
=============================================================================================
NodeID: uvwXyz2CNTRL
Logged: 2022-10-28 15:40:00.344
Window: 2022-10-28 15:39:53.286 (4.999s)
-------------------------------------------------------  Tx[P/s]   Tx[B/s]  Rx[P/s]   Rx[B/s]
VirtualTraffic:                                           28.60    3.32Ki    46.41    5.87Ki
    TCP:    100.44.55.66:37500 -> 100.103.145.6:22         9.20    1.45Ki    13.60    2.46Ki
    TCP:    100.44.55.66:49288 -> 100.99.88.77:22         12.80    1.22Ki    20.80    2.03Ki
    TCP:     100.44.55.66:2049 -> 100.111.22.33:864        0.60   145.62     1.20    180.02
    TCP:    100.44.55.66:49284 -> 100.99.88.77:22          1.00     88.01     2.00    236.03
    TCP:    100.44.55.66:49282 -> 100.99.88.77:22          1.00     88.01     2.00    236.03
    TCP:    100.44.55.66:49278 -> 100.99.88.77:22          1.00     88.01     2.00    236.03
    TCP:    100.44.55.66:49280 -> 100.99.88.77:22          1.00     88.01     2.00    236.03
    TCP:    100.44.55.66:49286 -> 100.99.88.77:22          1.00     88.01     1.80    193.62
    ICMPv4:       100.44.55.66 -> 100.99.88.77             1.00     84.01     1.00     84.01
PhysicalTraffic:                                          28.80    4.46Ki    46.41    7.74Ki
                 100.99.88.77  -> 143.111.222.333:41641   18.80    2.48Ki    31.60    4.51Ki
                 100.103.145.6 -> 64.71.162.170:41641      9.20    1.82Ki    13.60    3.01Ki
                 100.111.22.33 -> 192.168.0.102:41641      0.60    169.62     1.20    227.23
```

为了让输出中的节点更易识别，`netlogfmt` 提供了把 IP 地址解析为可读标签的标志：

* `--resolve-addrs`：把 Tailscale IP 地址转换为可读标签。有效值包括 `nodeids`（把 IP 地址解析为节点 ID）、`names`（把 IP 地址解析为主机名）或 `users`（把 IP 地址解析为拥有该机器的用户或标签）。自 Tailscale v1.92 起，网络流日志会自动把节点信息直接嵌入日志。对于由较旧客户端生成的日志，使用 `--resolve-addrs` 标志时还必须向 `netlogfmt` 传入 `--api-key` 和 `--tailnet-name` 参数。
* `--api-key`：指定用于 Tailscale API 的 [API 访问令牌][docs-api-authentication]。可以是你用于 `network-logs` 端点的同一个 API 访问令牌，也可以是另一个有效的 API 访问令牌。
* `--tailnet-name`：与你传给 `network-logs` 端点相同的组织名称。

本示例展示如何使用 `netlogfmt` 的标志：

```shell
curl -u $ACCESS_TOKEN:  -X GET \
  "https://api.tailscale.com/api/v2/tailnet/{$TAILNET_ID}/logging/network?start={$START}&end={$END}" \
  | go run tailscale.com/cmd/netlogfmt@latest --resolve-addrs=names --api-key=$ACCESS_TOKEN --tailnet-name=$TAILNET
```

如前所述，`ACCESS_TOKEN` 和 `TAILNET` 仅在为 v1.92 之前的客户端解析地址时才需要。

以下代码块包含示例日志输出。

```shell
=======================================================================================
NodeID: aBcdef1CNTRL
Logged: 2022-10-28 15:40:00.290
Window: 2022-10-28 15:39:51.890 (4.996s)
-------------------------------------------------  Tx[P/s]   Tx[B/s]  Rx[P/s]   Rx[B/s]
VirtualTraffic:                                      2.80    342.66     1.80    277.01
    TCP:   carbonite:864 -> prism:2049               1.20    180.14     0.60    145.71
    TCP:   carbonite:723 -> diamond:2049             0.80    119.29     0.40     86.47
    TCP: carbonite:21291 -> glass:63281              0.40     21.62     0.40     22.42
    TCP: carbonite:21291 -> glass:63280              0.40     21.62     0.40     22.42
PhysicalTraffic:                                     2.80    454.75     1.80    349.07
                   prism -> 192.168.0.101:41641      1.20    227.37     0.60    169.73
                 diamond -> 143.110.111.222:41641    0.80    150.52     0.40    102.48
                   glass -> 192.55.66.77:41641       0.80     76.86     0.80     76.86
======================================================================================
NodeID: uvwXyz2CNTRL
Logged: 2022-10-28 15:40:00.344
Window: 2022-10-28 15:39:53.286 (4.999s)
------------------------------------------------  Tx[P/s]   Tx[B/s]  Rx[P/s]   Rx[B/s]
VirtualTraffic:                                    28.60    3.32Ki    46.41    5.87Ki
    TCP:    prism:37500 -> glass:22                 9.20    1.45Ki    13.60    2.46Ki
    TCP:    prism:49288 -> diamond:22              12.80    1.22Ki    20.80    2.03Ki
    TCP:     prism:2049 -> carbonite:864            0.60    145.62     1.20    180.02
    TCP:    prism:49284 -> diamond:22               1.00     88.01     2.00    236.03
    TCP:    prism:49282 -> diamond:22               1.00     88.01     2.00    236.03
    TCP:    prism:49278 -> diamond:22               1.00     88.01     2.00    236.03
    TCP:    prism:49280 -> diamond:22               1.00     88.01     2.00    236.03
    TCP:    prism:49286 -> diamond:22               1.00     88.01     1.80    193.62
    ICMPv4:       prism -> diamond                  1.00     84.01     1.00     84.01
PhysicalTraffic:                                   28.80    4.46Ki    46.41    7.74Ki
                diamond -> 143.110.111.222:41641   18.80    2.48Ki    31.60    4.51Ki
                  glass -> 64.71.111.222:41641      9.20    1.82Ki    13.60    3.01Ki
              carbonite -> 192.168.0.102:41641      0.60    169.62     1.20    227.23
```

## 网络流日志流式传输

日志流式传输让你可以把网络流日志流式传输到 SIEM（安全信息与事件管理，[SIEM][ln-security-info-event-management]）系统。更多信息参见[日志流式传输][docs-log-streaming]。

## 限制

* 只有运行 Tailscale v1.34 或更高版本的节点才会向 Tailscale 日志服务发送网络遥测数据。
* 你只能通过 API 以及作为 SIEM 系统的[流式传输来源][docs-log-streaming]访问网络日志。Tailscale 管理控制台没有网络日志查看功能。
* 网络流日志用于记录，而不是监控。管理控制台不提供节点之间连接的实时读数。此外，网络日志不包含节点在线还是空闲的信息。日志只表明是否有网络流量。
* 网络日志不包含单个数据包的传输记录。日志捕获的是连接处于活动状态的时间段，其中可能包含多个数据流。
* Tailscale 只记录成功的连接。如果连接尝试被拒绝访问，该尝试不会被记录。
* 物理层的流量信息收集时间与虚拟层略有不同，因此流经虚拟层的数据包可能与物理层的不完全对应。
* 公共 IP 地址不会作为目标或源被记录。也就是说，从你的 tailnet 经出口节点发出的连接不会记录流量去向，从公共互联网经出口节点返回的连接不会记录流量来源。为保护隐私，Tailscale 不会收集单个连接的详细信息。
  * 如果管理员启用了[目标日志记录][docs-exit-nodes-logging]，则会记录协议、源端口和目标信息。
* 在源主机或目标主机上认证的用户不会被记录。要把节点映射到用户，可以使用 [`/api/v2/tailnet/:tailnet/device`][co-api-devices] 方法并查看 `user` 字段。
* 网络日志由客户端侧执行记录。Tailscale 无法保证客户端日志的送达或完整性。Tailscale 也无法完全保证客户端日志的延迟阈值——也就是说，日志并非实时送达。
* 启用网络流日志可能带来轻微的性能影响，因为客户端需要执行额外工作来跟踪必要的指标。增量负载会分散到整个设备群，而不是集中在单台主机上。

[ar-network-flow-logs-streaming]: #网络流日志流式传输

[co-api-devices]: https://tailscale.com/api#tag/devices/GET/tailnet/%7Btailnet%7D/devices

[co-security]: https://tailscale.com/security

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-api-authentication]: /docs/reference/tailscale-api#authentication

[docs-api]: /docs/reference/tailscale-api

[docs-exit-nodes-logging]: /docs/features/exit-nodes#destination-logging-in-network-flow-logs

[docs-log-mesh-traffic-opt-out]: /docs/features/logging#opt-out-of-client-logging

[docs-log-streaming]: /docs/features/logging/log-streaming

[ln-security-info-event-management]: https://tailscale.com/learn/security-information-and-event-management

[xt-go-tailscale-netlogfmt]: https://pkg.go.dev/tailscale.com/cmd/netlogfmt

[xt-iana-protocol-numbers]: https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml

[xt-rfc-3339]: https://www.rfc-editor.org/rfc/rfc3339.html
