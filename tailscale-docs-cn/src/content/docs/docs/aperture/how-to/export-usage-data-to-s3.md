---
title: "将使用数据导出到 S3"
description: "[Aperture 管理仪表盘][docs-aperture-dashboard]在 `/admin/adoption` 显示近期的组织范围使用数据，但它不是长期的捕获归档。你可以设置[保留策略][docs"
---

最后验证于 Oct 1, 2026

[Aperture 管理仪表盘][docs-aperture-dashboard]在 `/admin/adoption` 显示近期的组织范围使用数据，但它不是长期的捕获归档。你可以设置[保留策略][docs-aperture-retention]来控制 Aperture 在本地保留捕获内容的时长。把保留的使用记录导出到 S3 兼容存储，用于成本分析、记录留存和自定义报告。不与导出联动（export gating）的零保留不会归档捕获内容。

当[保留配置][docs-aperture-retention]中的 `require_export` 为 `true` 时，Aperture 只有在以下三件事都发生后才移除本地捕获内容：捕获已导出到 S3、其保留窗口已过、本地清除已运行。

Aperture 的 S3 导出器会周期性地把使用记录写入你配置的存储桶，写成 CBOR 编码、zstd 压缩的文件。它适用于 Amazon S3 和其他 S3 兼容存储，例如 Google Cloud Storage。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-aperture-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限。
* 一个有写入权限的 S3 兼容存储桶。你需要存储桶名称、区域和凭证（访问密钥 ID 与私有密钥）。

## 配置 S3 导出器

\[Missing snippet: aperture\_admin\_nav.mdx] 在配置中添加 `exporters` 部分。把示例中的存储桶名称、区域和凭证占位符替换为你的存储桶对应的值：

```json
"exporters": {
  "s3": {
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<aws-access-key-id>",
    "access_secret": "<aws-secret-access-key>"
  }
}
```

把 `bucket_name` 设为非空值并保存配置后，S3 导出器即被启用。

### 使用非 Amazon 的 S3 兼容服务

Aperture 也支持 AWS 之外的 S3 兼容存储服务。对 Google Cloud Storage 或任何具有 S3 兼容 API 的服务，可以使用相同的配置，外加一个 `endpoint` 字段。

对 Amazon S3 以外的服务（例如 Google Cloud Storage），添加 `endpoint` 字段，填入该服务的 S3 兼容 API URL：

```json
"exporters": {
  "s3": {
    "endpoint": "https://storage.googleapis.com",
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<access-key-id>",
    "access_secret": "<secret-key>"
  }
}
```

即使是非 AWS 服务，`region` 字段也必填，因为 AWS SDK 会校验它。

### 自定义导出行为

你可以用 `every` 和 `limit` 字段调整 Aperture 导出数据的频率以及每批包含的记录数：

```json
"exporters": {
  "s3": {
    "bucket_name": "aperture-exports",
    "region": "us-east-1",
    "access_key_id": "<aws-access-key-id>",
    "access_secret": "<aws-secret-access-key>",
    "prefix": "prod",
    "every": 1800,
    "limit": 2000
  }
}
```

下表汇总了这些字段：

| 字段     | 默认值 | 说明                                                                        |
| -------- | ------ | --------------------------------------------------------------------------- |
| `prefix` | `""`   | （可选）S3 对象的路径前缀。不得以 `/` 结尾。                                |
| `every`  | `3600` | 导出周期之间的秒数。上一个示例每 30 分钟导出一次。                          |
| `limit`  | `1000` | 每个导出批次的最大记录数。Aperture 将其上限设为 `10000`。                   |

把你所选配置中的示例存储桶名称和凭证替换掉，然后保存配置。Aperture 会在下一个导出周期开始导出使用记录。

## 导出文件格式

Aperture 将使用数据导出为 [CBOR][xt-cbor] 编码、[zstd][xt-zstd] 压缩的文件。CBOR 是一种二进制编码，类似 JSON，支持多模态 LLM 请求中的图像和音频等二进制数据。

每个导出文件名为 `ts-aperture-export-<unix-timestamp>.cbor.zstd`，包含一个 CBOR 编码记录的序列。每条记录包含以下顶层字段：

| 字段             | 类型      | 说明                                                                               |
| ---------------- | --------- | ---------------------------------------------------------------------------------- |
| `id`             | integer   | 记录标识符。                                                                       |
| `ver`            | integer   | 模式版本。`2`。                                                                    |
| `timestamp`      | timestamp | LLM 请求发生的时间。                                                               |
| `identity`       | object    | 用户与节点标识：登录名、稳定节点 ID 和标签。                                       |
| `model`          | string    | LLM 模型名称。                                                                     |
| `api_type`       | string    | API 类型，例如 `oai_completions` 或 `ant_messages`。                               |
| `usage`          | object    | token 计数：输入、输出、缓存和推理 token。                                         |
| `estimated_cost` | object    | 请求的估算美元成本。不可用时省略。                                                 |
| `duration_ms`    | integer   | 请求时长（毫秒）。                                                                 |
| `capture_id`     | string    | 该捕获的唯一标识符。                                                               |
| `session_id`     | string    | 会话分组标识符。                                                                   |
| `path`           | string    | API 端点路径。                                                                     |
| `status_code`    | integer   | HTTP 响应状态码。                                                                  |
| `capture`        | object    | 捕获的请求与响应数据，包括头部、处理后的 JSON 正文、工具使用数据，以及可选的原始请求和响应字节。 |

如果启用了 `database.save_raws`，解码后的 CBOR `capture` 映射可能包含 `rawRequestBody` 和 `rawResponseBody` 字节字段。如果某个响应 JSON 解析失败，即使 `save_raws` 未启用，只要保留策略允许，Aperture 也可能保留其原始字节。这些字段为空时 Aperture 会省略它们。仪表盘的捕获视图和 **Logs** 视图只显示解析后的 JSON 正文。要访问保留的原始字节，请使用 S3 导出。在 `duration: "0"`、`require_export: false` 下，即使 `save_raws` 已启用或 JSON 解析失败，Aperture 也不存储任何原始正文。关闭 `save_raws` 不会移除 Aperture 已经捕获的原始字节，它们由保留策略移除。

要读取导出文件，先用 zstd 库解压，再解码 CBOR 序列。常用库包括 Python 的 `cbor2` 与 `zstandard`、Go 的 `fxamacker/cbor` 与 `klauspost/compress`，以及用于解压的 `zstd` 命令行工具。

## 验证导出

发送一条已知的、非敏感的测试请求，以便在其他导出记录中找到它。如果你的网关有 OpenAI Chat Completions 兼容的模型，请在 tailnet 中的设备上运行以下命令。把 `<aperture-hostname>` 和 `<model-name>` 替换为你的值：

```shell
curl -i -sS http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"<model-name>","messages":[{"role":"user","content":"Reply with hello."}]}'
```

确认网关返回 2xx 状态。记下大致时间和所请求的模型。如果你的模型使用其他 API 格式，请改用[对应的测试请求][docs-aperture-get-started]，内容同样保持非敏感。

在下一个导出周期之后，在配置的存储桶和前缀中找到新的 `ts-aperture-export-<unix-timestamp>.cbor.zstd` 对象。仅凭对象名无法判断其中是否包含你的请求。使用你的存储服务控制台或 S3 兼容客户端，把对象下载为 `export.cbor.zstd`。

如果只想检查非敏感的记录字段，请先用 `python3 -m pip install cbor2 zstandard` 安装 Python 的 `cbor2` 和 `zstandard` 包，然后在包含下载对象的目录中运行以下命令。该命令只打印顶层元数据，不读取捕获的正文：

```shell
python3 - export.cbor.zstd <<'PY'
import sys

import cbor2
import zstandard

with open(sys.argv[1], "rb") as source:
    with zstandard.ZstdDecompressor().stream_reader(source) as stream:
        decoder = cbor2.CBORDecoder(stream)
        while True:
            try:
                record = decoder.decode()
            except cbor2.CBORDecodeEOF:
                break
            print(record["timestamp"], record["model"], record["status_code"], record["path"])
PY
```

用大致时间、请求路径和 2xx 状态来匹配你的测试请求。如果你请求的是[模型别名][docs-aperture-model-aliases]，导出的 `model` 可能是 Aperture 实际路由到的模型，而不是你请求的名称，所以不要要求模型名精确匹配。如果有多条请求共享这些值，请在空闲时段重做测试。不要把一次模糊的匹配当作证据。如果找不到该请求，请先检查后续的导出对象和导出器配置，再断定导出失败。

该检查验证的是 S3 中的记录，并不能验证 Aperture 已移除本地捕获。在 `require_export: true` 下，本地捕获内容会保留到导出成功、保留窗口经过且本地清除运行为止。对于零时长的"先归档后清除"策略，参阅[配置零保留模式][docs-aperture-zero-retention]，在导出之后检查同一请求的捕获记录。不要仅凭一个 S3 对象推断本地已移除。

## 后续步骤

* [配置零保留模式][docs-aperture-zero-retention]，避免在网关上存储捕获内容。改为要求导出，则会在 Aperture 移除本地捕获内容之前先在 S3 保留一份副本。
* Aperture 保留与数据控制的完整概述请参阅[隐私与数据保留][docs-aperture-privacy]。
* [构建自定义 webhook][docs-aperture-build-custom-webhook]，把实时事件数据发送到你自己的服务。
* 内置使用视图的细节请查阅 [Aperture 管理仪表盘参考][docs-aperture-dashboard]。
* 完整字段参考请参阅[导出器配置参考][docs-aperture-exporters]。

[docs-aperture-build-custom-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard]: /docs/aperture/reference/dashboard-admin

[docs-aperture-exporters]: /docs/aperture/configuration#exporters

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-model-aliases]: /docs/aperture/model-aliases

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-retention]: /docs/aperture/configuration#database

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[xt-cbor]: https://cbor.io/

[xt-zstd]: https://facebook.github.io/zstd/
