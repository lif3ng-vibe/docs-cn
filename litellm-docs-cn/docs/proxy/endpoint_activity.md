import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 端点活动

直接在仪表板（dashboard）中追踪并可视化 API 端点的使用情况。监控端点级活动分析、花费分布与性能指标，了解哪些端点接收的流量最大、表现如何。

## 概述

端点活动（Endpoint Activity）让你自动追踪每个 API 端点的花费与用量。每次通过 LiteLLM 代理（proxy）调用端点时，相关活动都会被自动追踪并汇总。你可以：

- 自动追踪每个端点的花费
- 在管理界面（Admin UI）中查看端点级用量分析
- 监控各端点的 Token 消耗
- 分析每个端点的成功与失败率
- 找出活动最频繁的端点
- 查看展示端点使用随时间变化的趋势数据

<Image img={require('../../img/ui_endpoint_activity.png')} />

## 端点活动的工作原理

只要通过 LiteLLM 代理发起 API 调用，端点活动就会被**自动追踪**。无需任何额外配置，照常调用端点即可，活动会被自动记录。

### API 调用示例

向任意端点发起请求时，活动都会被自动记录：

```bash showLineNumbers title="Endpoint activity is automatically tracked"
# /chat/completions: 👈 ENDPOINT AUTOMATICALLY TRACKED
# Authorization: 👈 YOUR PROXY KEY
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --data '{
    "model": "{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ]
  }'
```

该端点（`/chat/completions`）会被自动追踪，记录内容包括：

- Token 数量（提示词 Token、补全 Token、总 Token 数）
- 该请求的花费
- 请求状态（成功或失败）
- 时间戳及其他元数据

## 如何查看端点活动

### 在管理界面查看活动

进入管理界面的端点活动标签页，查看端点级分析：

#### 1. 进入端点活动

打开管理界面的用量统计页面（`PROXY_BASE_URL/ui/?login=success&page=new_usage`），点击**端点活动**标签页。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/67601fc0-8415-49b4-8e55-0673d37540c2/ascreenshot_f609a506dfe745c5aadccd332681c32d_text_export.jpeg)

#### 2. 查看端点分析

端点活动仪表板提供以下内容：

- **端点用量表**：查看所有端点的汇总指标，包括：
  - 请求总数（成功与失败）
  - 成功率百分比
  - 消耗的 Token 总数
  - 每个端点的总花费
- **成功与失败请求对比图**：可视化各端点的请求成功与失败率
- **用量趋势**：通过每日趋势数据查看端点活动随时间的变化

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/41b2b158-3ab3-4154-a0d0-7233451d3f2b/ascreenshot_ff46db6e09b54ea9bf34ae9028aff58a_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/bce32f99-f0ba-4502-8a3a-76257ff5e47a/ascreenshot_2273d3a94acd42e983ad7d6436722c2a_text_export.jpeg)

#### 3. 理解端点指标

每个端点会展示以下指标：

- **成功请求数**：成功完成的请求数量
- **失败请求数**：遇到错误的请求数量
- **请求总数**：成功与失败请求之和
- **成功率**：成功请求所占的百分比
- **Token 总数**：提示词 Token 与补全 Token 之和
- **花费**：发往该端点的所有请求的总成本

## 网关请求计数

用量统计页面上的**成功请求数**与**失败请求数**卡片，以及其下方的**按端点划分的网关请求**图表，都由代理本身统计，而不是从花费日志推导。LiteLLM 的请求指标中间件位于 ASGI 边缘，对每个入站的 LLM、MCP（Model Context Protocol）和 A2A（Agent-to-Agent）调用进行分类，并记录网关返回的状态。这些计数会汇入 `LiteLLM_DailyGatewayRequests` 表，以日期、类别和路由为键。表的键不携带调用方提供的任何信息，也没有按密钥、按用户或按部署的维度，因此这张表只随部署服务的路由类别数量和运行时长增长，与流量大小无关。

在边缘计数改变了这些数字的含义。无论请求是否到达过 LiteLLM 的日志回调（callback），都会被记录下来，因此身份认证拒绝、限流响应和提供商错误都会进入失败列，而不是凭空消失；所有状态都会被计入，而不只是 2xx。无论 LiteLLM 为完成一个入站请求向上游发起了多少次调用，这个请求都只计一次，因此路由器（router）的重试、回退和内部扇出都不会推高总数。

计数先在内存中累积，并按与花费批量写入相同的间隔提交，即 `proxy_batch_write_at`，默认 10 秒，因此请求可能需要几秒钟才会显示出来。提交失败的会合并回累积器，在下一次刷新时重试，而不是被丢弃；进程关闭时还会最后清空一次累积器。这些能力都不受企业版（enterprise）许可限制；任何配置了数据库的部署都会记录这些计数。

### 网关计数为何与按密钥及按模型细分不一致

用量统计页面上的按密钥、按模型、按提供商和按标签面板，读取的仍是每日花费汇总，而这些汇总是在请求完成后从花费日志写入的。两个数据源回答的问题不同，数字本来就不指望完全对得上。

花费日志中的一行记录，只对应走得足够远、最终被记入日志的请求，其中带有为它服务的密钥、团队和模型。网关计数则覆盖代理响应过的所有请求，包括在解析出密钥或选定模型之前就被拒绝的请求，这也是网关表完全不设密钥和用户维度的原因。两边的偏差是双向的：网关只统计经过分类的推理、MCP 和 A2A 流量，并把内部扇出合并成一行；而花费汇总还会覆盖被记录下来的管理类和透传（passthrough）调用，并把每次上游尝试单独记一笔。看流量规模用卡片，要把花费归因到具体维度就看细分面板。

### /gateway/daily/activity {#gateway-daily-activity}

网关计数由独立的端点提供服务。由于底层表是整个部署范围的，没有按密钥或按用户维度，该端点仅向 `proxy_admin` 和 `proxy_admin_viewer` 角色开放；其他调用方会收到 403。在管理界面中，非管理员只会看到卡片里从花费推导出的计数，没有网关图表。如果管理员的部署尚未记录过任何网关计数，也会呈现同样的回退表现。

`start_date` 和 `end_date` 都是可选参数，格式为 `YYYY-MM-DD`；省略时返回最近 30 天的数据。

```shell title="Gateway request counts" showLineNumbers
curl -L -X GET 'http://localhost:4000/gateway/daily/activity?start_date=2026-07-28&end_date=2026-08-04' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json title="Gateway request counts response" showLineNumbers
{
  "total_successful_requests": 1284,
  "total_failed_requests": 37,
  "by_date": [
    { "date": "2026-08-03", "successful_requests": 612, "failed_requests": 11 },
    { "date": "2026-08-04", "successful_requests": 672, "failed_requests": 26 }
  ],
  "by_route": [
    { "category": "llm", "route": "/chat/completions", "successful_requests": 1103, "failed_requests": 31 },
    { "category": "llm", "route": "/embeddings", "successful_requests": 141, "failed_requests": 4 },
    { "category": "mcp", "route": "/mcp", "successful_requests": 40, "failed_requests": 2 }
  ]
}
```

`by_date` 按时间从早到晚排序，`by_route` 按成功请求数从高到低排序。`category` 取值为 `llm`、`mcp` 或 `a2a`；`route` 是分类器归一化后赋予的路由，而不是原始请求路径，因此 `/v1/chat/completions` 和 `/chat/completions` 会合并为同一行。管理界面中的图表会渲染前 15 条路由。

## 使用场景

### 性能监控

监控端点的健康与性能：

- 找出失败率偏高的端点
- 追踪哪些端点接收的流量最大
- 监控各端点的 Token 消耗模式
- 发现端点用量中的异常

### 成本优化

了解花费在各端点之间的分布：

- 找出高成本端点
- 优化开销较高的端点
- 根据端点用量分配预算
- 追踪成本随时间的变化趋势

---

## 相关功能

- [客户用量](./customer_usage.md) - 追踪单个客户的花费与用量
- [成本追踪](./cost_tracking.md) - 成本追踪与分析
- [花费日志](./cost_tracking.md#-花费日志-api单笔交易日志) - 请求级别的详细花费日志
