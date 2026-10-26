# 透传成本与用量追踪

有些透传（pass-through）目标会在内部把一个 HTTP 请求分发给多个模型。LiteLLM 无法从响应体为这类请求计价，因此在这套约定出现之前，它们进入花费日志时成本和 Token 数都是零。

目标服务也可以改用两个响应头报告整个请求的总量。LiteLLM 会照实记录上报的数值，不做二次计算。

## 响应头

| 响应头 | 格式 | 含义 |
| --- | --- | --- |
| `x-litellm-response-cost` | 十进制字符串，单位为美元 | 该请求所有内部模型调用加总的总成本，例如 `0.000415` |
| `x-litellm-total-tokens` | 整数字符串 | 所有内部模型调用加总的总 Token 数，例如 `1874` |

每个 HTTP 请求只发送一份总量，不区分内部各模型的明细，且上报的数值即为最终依据。

## 快速上手

像平常一样定义透传端点即可。配置中没有任何开关用于启用这套约定；只要目标服务发送了这些响应头，LiteLLM 就会读取。

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/internal-api"
      target: "https://internal-api.example.com/v1/answer"
      include_subpath: true
      headers:
        Authorization: "Bearer os.environ/INTERNAL_API_TOKEN"
```

通过代理并使用你的 LiteLLM 密钥调用：

```shell
curl -i -X POST 'http://localhost:4000/internal-api/summarize' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"document_id": "doc-9931"}'
```

让目标服务在响应中带上它计算出的总量：

```
HTTP/1.1 200 OK
content-type: application/json
x-litellm-response-cost: 0.000415
x-litellm-total-tokens: 1874
```

LiteLLM 会把 `0.000415` 和 `1874` 记到发起调用的密钥、团队与用户名下，这些数值会与该密钥的其他流量一起出现在花费日志和用量仪表板中。

## LiteLLM 记录了什么

上报的数值按原样写入。LiteLLM 会解析这些数值并做合理性检查，但绝不会在此基础上自行重算成本。

只有目标服务真正上报的数值才会被写入。如果目标服务只发了成本而没发 Token 数，Token 数将保留 LiteLLM 自己推算的结果，不会被清零。如果两个响应头都没有发送，则完全不做处理；这也是 Anthropic、Vertex AI 等提供商透传路由的常态，这类路由的成本由 LiteLLM 从响应体推算。

## 校验规则

未通过以下任一检查的值将被视为未上报，代理日志中会写入一条警告，指明响应头名称和问题值。

| 响应头 | 接受 | 拒绝 |
| --- | --- | --- |
| `x-litellm-response-cost` | 任何有限、非负的十进制数，包括 `0` | 无法解析的文本、负数、`inf`、`nan` |
| `x-litellm-total-tokens` | 任何非负整数，包括 `0` | 无法解析的文本、负数 |

显式的 `0` 是真实数值而非缺省，因此即使总量为零，也要把两个响应头都发过来。

## 错误响应

无论状态码是什么，这些响应头在上游的每次响应中都会被读取。失败前已经消耗了 Token 的请求，其花费会记在失败那一行上，而不是因为 4xx 或 5xx 状态码就被丢弃。只要仍然产生了成本，错误响应也应发送这些响应头。

在失败行上，缺失或无法使用的值会记为 `0`。

## 优先于 `cost_per_request`

目标服务自行计价时，其结果始终优先于端点上配置的固定 [`cost_per_request`](./pass_through.md) 估算值。每个配置定义的端点上 `cost_per_request` 默认为 `0.0`，若优先采用它，目标服务刚上报的真实成本就会被清零。

即使上报值无法解析，这条优先级依然成立。此时请求会记为 `0`，而不是按一个已被目标服务否定的估算值计费。

## 速率限制与预算

上报的 Token 与调用者的其他流量一样计入同一个 TPM（每分钟 Token 数）窗口，因此密钥或团队无法仅凭透传流量超出共享的 Token 上限。在这套约定出现之前，透传用量根本到不了 Token 窗口，因为限流器只会从它能识别的响应结构中读取用量。

记录的成本与其他请求的成本一样计入预算。

## 流式

流式目标也能正常工作，因为响应头先于响应体到达。如果目标服务要等流式传输结束后才知道最终成本，就无法通过这套约定上报，因为那时响应头早已发出。

## 读回这些值

上游响应头会原样透传给调用方客户端，因此调用方看到的 `x-litellm-response-cost` 与通用 API 返回的格式一致。LiteLLM 在返回时还会附加 `x-litellm-call-id`，对账单个请求时，用它与花费日志进行匹配。
