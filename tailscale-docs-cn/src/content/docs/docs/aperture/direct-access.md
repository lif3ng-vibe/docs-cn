---
title: "直接提供商访问"
description: "直接提供商访问新增一个 `/direct` 端点，把请求转发给已配置提供商自己的 API，并基本原样返回提供商的响应。Aperture 通过 [Tailscale 身份][docs-tailscale-identity]认证调用者。"
---

最后验证于 Sep 28, 2026

直接提供商访问（direct provider access）新增一个 `/direct` 端点，把请求转发给已配置提供商自己的 API，并基本原样返回提供商的响应。Aperture 通过 [Tailscale 身份][docs-tailscale-identity]认证调用者，并从你的配置注入提供商凭证，因此客户端无需持有提供商 API 密钥即可访问提供商端点。

Aperture 的标准端点会把每个请求规范化为 chat completions 和 messages API。这覆盖了文本生成，但也意味着 Aperture 只能路由支持这些 API 的模型。其他模态的模型，例如嵌入、图像、音频和视频模型，不符合 chat 请求形态，根本无法通过标准端点路由。

直接提供商访问就是为它们准备的。由于 `/direct` 把请求原样透传给提供商自己的 API，提供商暴露的任何模型都变得可达，与模态无关。同一个端点还覆盖提供商表面的非推理部分，例如模型列表、文件上传和批处理作业。

发送到 `/direct` 的请求还会跳过模型路由、配额、hook 和用量统计。把生产流量路由到它之前，请先阅读[限制][ar-limitations]。

在功能处于私有 alpha 期间，端点、授权语法和本页内容都可能变化。Aperture 升级后请重新查看本页，不要依赖缓存的旧步骤。

## 前提条件

设置直接提供商访问之前，你需要：

* Aperture 中的[管理员角色][docs-set-up-admin-access]，用于更改功能标志、编辑授权和查看直接访问日志。
* 至少一个[已配置且凭证可用的提供商][docs-set-up-providers]。
* 发送请求的客户端能够访问 Aperture 网关。

## 开始使用

设置直接提供商访问分四步：启用功能标志、把直连路径访问授予某个身份、发送请求、在日志中确认请求。

### 第 1 步：启用 direct access API 标志

启用 `direct_access_api` 标志之前，`/direct` 返回 `501 Not Implemented`。要启用，把它加入 Aperture 配置的 [`flags`][docs-aperture-flags] 段：

```json
{
  "flags": {
    "direct_access_api": {
      "value": true
    }
  }
}
```

### 第 2 步：授予直连路径访问

Aperture 默认拒绝，`direct_paths` 能力独立于 `models`。拥有完整模型访问权限的用户，在授权列出匹配的直连路径之前，从 `/direct` 收到的仍是 `403 Forbidden`。

在 [`grants`][docs-aperture-grants] 段的某条授权中添加 `direct_paths` 条目。每个条目由一个 HTTP 方法选择器和一个 `provider/path` glob 组成：

```json
{
  "grants": [
    {
      "src": ["alice@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "direct_paths": ["POST openai/v1/embeddings"] }
        ]
      }
    }
  ]
}
```

这条授权让 `alice@example.com` 能调用 `openai` 键下配置的提供商的 embeddings 端点，仅此而已。没有更多条目时，该账户无法访问图像生成、文件上传或该提供商的任何其他路径。请从窄授权开始。完整的模式语法参阅[直连路径授权语法][ar-direct-path-grant-syntax]。

### 第 3 步：发送请求

把请求发送到 `/direct/{provider}/{path}`，其中 `{provider}` 是 `providers` 配置中某个提供商的键，`{path}` 是该提供商 API 上的路径。客户端不发送提供商凭证，因为 Aperture 会附上配置的凭证：

```shell
curl http://<aperture-hostname>/direct/openai/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model": "text-embedding-3-small", "input": "the quick brown fox"}'
```

响应是提供商自己的 embeddings 载荷——任何标准 Aperture 端点都无法产生它，因为嵌入模型不使用 chat completions API。该模型不需要出现在提供商的 `models` 列表中。

Aperture 从 Tailscale 连接识别调用者，把方法和路径与调用者的 `direct_paths` 授权匹配，然后把请求转发给提供商的 base URL。提供商的响应体和状态码按原样返回给客户端，仅有[请求路由与响应][ar-request-routing-and-responses]中描述的头调整。

### 第 4 步：查看直接访问日志

匹配授权的请求会被记录，包括提供商拒绝的请求。Aperture 自身拒绝的请求不会记录。禁用标志产生的 `501` 和缺少匹配授权产生的 `403` 不会出现在日志中。查看日志：

\[Missing snippet: aperture\_admin\_nav.mdx]

日志浏览器为每个请求显示一行，包括时间、级别、调用身份和标签、提供商、状态码、方法、路径、耗时和传输字节数。选择时间窗口后，可用 Go 正则表达式过滤以缩小结果。默认时间窗口覆盖最近三小时，最多可搜索七天前的请求。

该页面仅管理员可见，且只在 `direct_access_api` 标志启用时出现在侧边栏。

## 直连路径授权语法

`direct_paths` 中的每个条目是一个方法选择器加一个路径 glob，以空白分隔：

```text
METHOD[,METHOD...] PROVIDER/PATH
```

方法选择器要么是 `*`（匹配所有方法），要么是取自 `CONNECT`、`DELETE`、`GET`、`HEAD`、`OPTIONS`、`PATCH`、`POST`、`PUT`、`TRACE` 的逗号分隔大写 HTTP 方法列表。选择器必填，没有方法的模式无法通过校验。

路径 glob 针对 `/direct` 之下的 `provider/path` 匹配，使用与 `models` 模式相同的匹配规则：

| 通配符 | 匹配 |
| --- | --- |
| `*` | 恰好一个路径段 |
| `**` | 零个或多个路径段 |
| 段内的 `*` | 该段内的任意字符序列 |

下表展示代表性模式：

| 模式 | 效果 |
| --- | --- |
| `POST openai/v1/embeddings` | 单个提供商上的嵌入模型 |
| `POST openai/v1/images/generations` | 单个提供商上的图像模型 |
| `POST */v1/embeddings` | 所有已配置提供商上的嵌入模型 |
| `GET openai/v1/models` | 单个提供商上的一个只读端点 |
| `GET,POST anthropic/v1/**` | 单个提供商 `v1` 下所有路径的读写访问 |
| `* */**` | 所有方法、提供商和路径。等同无限制的直接访问 |

模式必须包含提供商段和至少一个路径段，不能包含查询字符串、片段、开头或结尾斜杠，也不能有空段。无效模式会被 Aperture 报告为配置警告，并阻止通过管理仪表板或 API 保存。

授权是叠加的。调用者的实际直接访问权限，是其身份匹配的所有授权中所有 `direct_paths` 条目的并集，遵循 [Aperture 授权的工作方式][docs-how-grants-work]中描述的模型。

## 请求路由与响应

Aperture 剥掉 `/direct/{provider}` 前缀，把剩余路径拼接到提供商配置的 base URL。百分号编码的字符会保留，因此包含 `%2F` 的路径段原样到达提供商。查询字符串原样透传。

认证遵循提供商配置的 `authorization` 和 `apikey` 设置，与发送到 Aperture 标准端点的请求完全一致。设为 `passthrough` 认证模式的提供商仍然接受客户端提供的凭证。

转发是逐字节的透传，只有一个例外：Aperture 会从提供商的响应中移除 `Access-Control-*` 头，因此浏览器客户端不会收到提供商的 CORS 头。

该端点返回以下 Aperture 生成的响应：

| 状态 | 条件 |
| --- | --- |
| `501 Not Implemented` | `direct_access_api` 标志已禁用 |
| `403 Forbidden` | 调用者的授权中没有匹配方法和路径的 `direct_paths` 条目 |
| `404 Not Found` | `providers` 配置中不存在该提供商 ID |
| `502 Bad Gateway` | Aperture 无法连接提供商 |

其他任何状态都来自提供商。

## 限制

直接提供商访问有以下限制：

* **无推理处理。** 请求跳过模型路由、防护栏、hook 以及请求与响应抓包。模型范围的授权和授权级 `add_headers` 条目不适用。提供商级 `add_headers` 仍然适用。
* **无用量或成本统计。** 直接请求不消耗配额、不出现在支出报告中，也不产生 token 或成本记录。提供商仍会对工作量计费，因此通过 `/direct` 访问嵌入和图像模型的支出对 Aperture 不可见。拥有 `direct_paths` 授权的调用者还能在没有任何预算约束的情况下访问提供商的 chat 端点。
* **可观测性仅限元数据。** 直接访问日志记录身份、提供商、方法、路径、状态、耗时、字节数和 user agent。它不记录请求或响应体，也不发出指标。被 Aperture 拒绝的请求完全不记录，因此该日志不能用于审计被拒的访问尝试。
* **授权模式只匹配路径。** `direct_paths` 模式无法约束查询参数、请求头或请求体。请按方法和路径从窄控制，并对写方法相应谨慎。
* **标志作用于整个网关。** 启用 `direct_access_api` 会为授权带有 `direct_paths` 的每个身份激活 `/direct`。请通过授权控制访问范围，而不是靠标志。
* **日志要求管理员角色。** 非管理员调用者从日志 API 收到 `403 Forbidden`，侧边栏入口对其隐藏。

## 相关内容

以下主题涵盖直接提供商访问依赖的配置段和概念：

* [Aperture 配置][docs-aperture-configuration]：完整配置参考，包括 `grants` 和 `flags` 段。
* [Aperture 授权的工作方式][docs-how-grants-work]：授权模型，包括默认拒绝访问和优先级。
* [设置提供商][docs-set-up-providers]：配置 `/direct` 转发到的提供商。
* [观测与导出][docs-aperture-observe]：Aperture 针对被路由请求的日志、报告和导出选项。

[ar-direct-path-grant-syntax]: #直连路径授权语法

[ar-limitations]: #限制

[ar-request-routing-and-responses]: #请求路由与响应

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-flags]: /docs/aperture/configuration#flags

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-observe]: /docs/aperture/observe-and-export

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
