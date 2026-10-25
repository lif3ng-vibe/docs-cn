---
title: "不改动应用即可降低 AI token 开销"
description: "为 Aperture 添加 tsheadroom，在请求到达提供商之前压缩臃肿的 AI 请求体，无需改动客户端应用即可降低全部流量的 token 开销。"
---

最后验证于 Sep 28, 2026

编码智能体 和检索增强生成（RAG）流水线每一轮都会向大语言模型（LLM）提供商发送巨大的载荷。工具输出、构建日志和文件列表填满了请求体，而提供商会按请求体中的每一个 token 计费——尽管这些 token 很少改变响应内容。

本指南将 tsheadroom 添加到你的 [Aperture][docs-aperture] 网关。tsheadroom 是一个运行在你 tailnet 中的小型服务，会在臃肿请求经过 Aperture 时将其压缩。它基于开源的 `headroom-ai` 库 [Headroom][xt-headroom] 构建，能在保留提示词内容的同时缩减过大的请求体。配置完成后，Aperture 会透明地压缩符合条件的请求，应用无需任何改动。本指南使用的工具密集型请求从约 47 KB 压缩到 25 KB，约等于该轮次一半的计费 token，热身后的 worker 只增加个位数毫秒的延迟。模型加载后的第一个请求延迟会更高。

## 工作原理

Aperture 可以在把请求转发给提供商之前，把每个请求交给外部服务处理。Aperture 把这种机制称为[护栏][docs-guardrails]（guardrail），它作为 `pre_request` 事件上的 hook 运行。tsheadroom 遵循[自定义 webhook][docs-build-custom-webhook]模式来改写请求体并使其变小，这样你就能集中检查和缩减流量，而无需改动发送流量的客户端。

tsheadroom 运行在你提供的 Linux 主机上。本指南中，*主机*指你运行 tsheadroom 的那台 Linux 机器，*设备*指 tsheadroom 在 tailnet 中的身份，它会以 `tsheadroom` 的名字出现在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面上。它会自行加入 tailnet，并获得一个稳定的 MagicDNS 名称。客户端经由 tailnet 访问 Aperture，只有 LLM 提供商在外部。访问如何管控请参阅[安全注意事项][ar-security-notes]。

*（图：tailnet 内的客户端应用向 Aperture 发送请求。Aperture 在 pre\_request hook 上调用 tsheadroom（同样在 tailnet 内），发送请求体（1）。tsheadroom 返回 modify 并附带更小的请求体，或返回 allow（2）。Aperture 将压缩后的请求——从约 47 KB 缩减到 25 KB——转发给外部 LLM 提供商（3）。）*

Aperture 通过 tailnet 以同步方式把 tsheadroom 作为 pre\_request hook 调用，然后把压缩后的请求转发给提供商。

请求到达时，Aperture 会调用 tsheadroom 并把请求体发送给它。该调用是同步的，因此 Aperture 会等待 tsheadroom 应答后才转发请求。tsheadroom 在压缩了内容时返回 `modify` 并附带更小的请求体；在没有值得压缩的内容或出现任何异常时返回 `allow`。该 hook 使用 `fail_open`，因此设备不可达或响应慢时，原始请求会不经压缩直接通过。tsheadroom 可能增加一点延迟，但绝不会阻断请求。

## 前提条件

本指南面向能够编辑 Aperture 配置、管理 tailnet，并会用 Docker 运行 Linux 服务的平台与基础设施工程师。

开始之前，请确保你具备以下条件：

* 一个 Tailscale 网络，其中至少有一个正在运行的 Aperture 网关，并且至少配置了一个 LLM 提供商，如[设置 LLM 提供商][docs-set-up-providers]所述。

* 有权限编辑你的 Aperture 配置，可以通过 [Aperture 管理仪表盘][docs-aperture-dashboard-admin]的 **Administration** > **Configuration** 页面，或通过 [Aperture 配置 API][docs-aperture-configuration]。

* tailnet 中一台用于运行 tsheadroom 的 Linux 设备。该设备应安装了 Docker 和 Docker Compose 插件，并且有足够的内存把模型载入内存。Headroom 的 `ml` 变体每个 worker 大约需要 600 MB 内存。

* 拥有 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 权限，用于生成 [Tailscale 认证密钥][docs-auth-keys]。

\[Missing snippet: aperture\_tls\_warning.mdx]

## 第 1 步：生成 Tailscale 认证密钥

tsheadroom 使用 Tailscale 认证密钥加入你的 tailnet，这让它第一次启动时无需交互式登录即可完成认证。它把身份保存到状态目录后，重启就不再需要该密钥。

1. 打开管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面。
2. 选择 **Generate auth key**（生成认证密钥）。
3. 为密钥添加描述和有效期，然后选择 **Generate key**（生成密钥）。
4. 立即复制 `tskey-auth-...` 值并妥善保存。稍后你会把它用作 `<ts-auth-key>`。

当你拿到一个以 `tskey-auth-` 开头的字符串时，这一步就完成了。如[认证密钥文档][docs-auth-keys]所述，请把它当作机密对待。

## 第 2 步：部署 tsheadroom

现在你在 Linux 主机上运行 tsheadroom。Docker Compose 会构建服务、安装 Headroom、加入你的 tailnet，并在 `80` 端口上提供 hook 服务。这一步完成后，一台名为 `tsheadroom` 的设备将处于在线状态，随时可供 Aperture 调用。

克隆仓库并准备其配置：

```shell
git clone https://github.com/tailscale/tsheadroom.git
cd tsheadroom
cp .env.example .env
mkdir -p config && cp tsheadroom.config.example.json config/config.json
```

这会创建你稍后要编辑的 `.env` 文件，并把默认压缩设置写入 `config/config.json`。

打开 `.env`，设置以下四个值：

```shell
TS_AUTHKEY=<ts-auth-key>
TS_HOSTNAME=tsheadroom
HEADROOM_VARIANT=ml
POOL_SIZE=1  # ships as 4. Lower to 1 on a fresh host so the model downloads once, then raise after your first successful run
```

`TS_AUTHKEY` 是你生成的密钥，`TS_HOSTNAME` 会成为设备在你的 tailnet 中的名称。`HEADROOM_VARIANT=ml` 选择可同时缩减工具输出和正文的压缩方式，并在镜像中安装 `headroom-ai[ml]`。`POOL_SIZE` 设置 worker 数量，每个 worker 都在内存中保存一份自己的模型副本。

构建并启动服务：

```shell
docker compose up -d --build
```

设备身份和模型缓存保存在具名 Docker 卷中，因此重启绝不会让设备重新认证或重新下载模型。之后要更新 tsheadroom，运行 `git pull && docker compose up -d --build` 即可。附带的 `docker-compose.yml` 以 `-v` 运行二进制文件，因此本指南末尾要看的每请求日志默认是开启的。

当 `docker compose logs -f` 显示设备加入 tailnet、worker 报告就绪时，这一步就完成了。在 `ml` 变体下，每个 worker 会在启动时加载模型，加载完成后记录 `ML model preload complete`，因此约 600 MB 的下载发生在那行日志出现的位置，而不是在第一个请求时。

## 第 3 步：确认设备已加入你的 tailnet

在动 Aperture 之前，先确认设备在线并能应答。单独测试 tsheadroom，可以把设备问题与 Aperture 配置问题区分开。

首先，打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认出现了一台名为 `tsheadroom` 的已连接设备。它的 URL 是 `http://tsheadroom.<tailnet-name>.ts.net/`。把 `<tailnet-name>` 替换为你的 tailnet 名称，即 `.ts.net` 前面的那串标签（例如 `tail1a2b3c`）。你可以在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面找到它。如果你修改过 `TS_HOSTNAME`，请在 URL 中改用那个名称。

接下来，从同一 tailnet 中的另一台设备，发送一个形如 tsheadroom 所压缩的臃肿工具输出的请求。

```shell
python3 - <<'PY' | curl -s -X POST http://tsheadroom.<tailnet-name>.ts.net/ -H 'Content-Type: application/json' -d @-
import json
big = json.dumps([{"id": i, "path": f"/src/m{i}.py", "status": "unchanged",
                   "hash": "deadbeef"*4} for i in range(400)])
print(json.dumps({"request_body": {"model": "claude-sonnet-5-5", "messages": [
    {"role": "user", "content": "list files"},
    {"role": "assistant", "content": [{"type": "tool_use", "id": "t1", "name": "ls", "input": {}}]},
    {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t1", "content": big}]},
    {"role": "user", "content": "summarize"}]}}))
PY
```

设备正常时会在几毫秒内返回 `{"action":"modify","request_body":{...}}`，因为每个 `ml` worker 都在启动时就加载了模型。在新主机上，如果 worker 尚未完成加载就发来请求，它会阻塞最长约 60 秒（第一个 worker 加载模型），然后返回 `modify`。对于这种大请求，tsheadroom 只有在调用方先取消（例如 Aperture 超时或 `curl --max-time`）时才返回 `allow`。稍后要测试的格式良好的短对话则因为不值得压缩而返回 `allow`。等待 `ML model preload complete` 日志出现后重试。

要确认相反的情况，发送一条短对话。它应返回 `{"action":"allow"}`。

```shell
curl -s -X POST http://tsheadroom.<tailnet-name>.ts.net/ -H 'Content-Type: application/json' \
  -d '{"request_body":{"model":"claude-sonnet-5-5","messages":[{"role":"user","content":"hi"}]}}'
```

大请求返回 `modify`、短对话返回 `allow` 时，这一步就完成了。

## 第 4 步：在 Aperture 中定义 hook

把 tsheadroom 添加到 Aperture 配置的 `hooks` 映射中，让 Aperture 能访问它。在你于下一步启用之前，这个 hook 不会接收任何流量。

打开 Aperture 管理仪表盘的 **Administration** > **Configuration**。在顶层 `hooks` 映射中添加以下条目。把 `url` 设为你[先前确认过][ar-confirm-device]的设备 URL。

如果你更愿意通过 API 编辑：

1. 调用 `GET http://<aperture-hostname>/api/config` 获取完整配置及其哈希值。
2. 在返回的配置中添加该 hook。
3. 向 `PUT http://<aperture-hostname>/api/config` 发送一个 JSON 对象。把 `config` 设为完整的 HuJSON 配置字符串，把 `hash` 设为原始哈希值。这会替换整个配置。

Aperture 使用 HuJSON，它支持注释和尾随逗号。这些示例中的解释性注释可以省略。

```json
"hooks": {
  "headroom": {
    "url": "http://tsheadroom.<tailnet-name>.ts.net/",
    "fail_policy": "fail_open", // if tsheadroom is unreachable, send the request uncompressed
    "timeout": "30s",           // the entire latency budget for this hook
  },
},
```

保持 `fail_policy` 为 `fail_open`，这样不可达或响应慢的 hook 就不会阻断流量。把 `timeout` 设为 `30s`，让大请求有时间完成压缩。默认的 `5s` 可能超时并把请求不经压缩地发送出去。

tsheadroom 不需要 `apikey` 或 `authorization`。Aperture 经由你的 tailnet 访问它，访问由你的授权（grants）管控。

当 Aperture 接受并保存更新后的配置时，这一步就完成了。

## 第 5 步：把 hook 挂接到授权

添加一条授权，让请求体在 `pre_request` 事件上发送给 tsheadroom。先只针对一个提供商，以便在发送更多流量之前验证压缩效果。

在你的 Aperture 配置中添加以下授权。

```json
{
  "src": ["*"],
  "app": {
    "tailscale.com/cap/aperture": [
      {
        "models": "anthropic/**",   // start scoped to one provider. Widen to "**" after you verify
        "send_hooks": [
          {
            "name": "headroom",
            "events": ["pre_request"],
            "send": ["request_body"],
          },
        ],
      },
    ],
  },
},
```

这条授权使用了以下字段：

* `src: ["*"]` 匹配所有调用方。
* `models: "anthropic/**"` 把这条授权限制到一个提供商。验证压缩效果后再放宽。
* `send_hooks` 在 `pre_request` 事件上把 `request_body` 发送给 `headroom` hook。

`send` 中只需配置 `request_body`。Aperture 还会自动发送 `model` 和 `session_id`。tsheadroom 用它们来衡量压缩规模，并把同一会话的请求一致地路由。

> **注意：**
>
> 如果你的访问规则保存在 tailnet 策略文件而不是 Aperture 配置中，那条授权还需要一个 `dst` 字段，因为策略文件授权必须同时有来源和目标（[授权语法参考][docs-grants-syntax]）。

配置连同授权一起保存成功时，这一步就完成了。hook 现已生效。

## 第 6 步：验证端到端压缩

现在观察 tsheadroom 压缩一个流经 Aperture 的真实请求。部署时设置的 `-v` 标志会为每个请求记录一行摘要，节省效果就体现在那里。

1. 用 `docker compose logs -f` 跟踪日志。
2. 通过你的 Aperture 端点发起一次真实的 LLM 调用，使用 Anthropic 模型以匹配你在第 5 步限定的 `anthropic/**` 授权，调用中要包含一个较大的工具结果；或者运行一次会这样的编码智能体 会话。
3. 找到以 `-> modify` 结尾且 `out_bytes` 小于 `in_bytes` 的日志行。这行日志证明压缩正在运行。

worker 处理的第一个请求（`cold=true`）和之后的一个请求（`cold=false`）如下所示。`cold=true` 标志表示该 worker 处理的第一个请求，而不是慢请求。

```text
request in_msgs=4 in_bytes=47227 out_bytes=24885 wire_bytes=47227 dur_ms=48 read_ms=2 write_ms=1 worker_ms=42 slot=0 cold=true model_limit=200000 -> modify
request in_msgs=4 in_bytes=47227 out_bytes=24885 wire_bytes=47227 dur_ms=12 read_ms=1 write_ms=0 worker_ms=11 slot=0 cold=false model_limit=200000 -> modify
```

对比 `out_bytes` 与 `in_bytes`。`wire_bytes`、`model_limit`、各 `_ms` 计时和 `slot` 字段是诊断信息，此处可以忽略。

要持续度量而不是逐请求看日志行，tsheadroom 在 `http://tsheadroom.<tailnet-name>.ts.net/metrics` 暴露 Prometheus 指标，其中包括 `headroom_tokens_saved_total`。

在你把 `models` 放宽到 `"**"` 之前，先让一个有代表性的编码智能体 或 RAG 任务经由限定范围的授权运行，并确认响应不受影响。

当日志显示工具密集型请求的 `-> modify` 且 `out_bytes` 降低时，这一步——乃至整个搭建——就完成了。如果每个请求都记录 `allow`，请按[故障排除][ar-troubleshooting]排查。要关闭压缩，请参阅[回滚或禁用压缩][ar-rollback]。

## 回滚或禁用压缩

压缩现在运行在真实流量上，所以要随时准备好关闭开关。

* 要停止压缩，从授权中移除 `send_hooks` 条目，或移除整条授权，然后保存。流量立即恢复为不压缩。

* 要只对某一个提供商停止压缩，把 `models` 重新收紧即可。

* 由于 hook 是 `fail_open`，即使让 tsheadroom 保持停止也不会阻断流量。移除授权是干净的禁用方式。

* 要下线该设备，用 `docker compose down` 停止容器，然后在 [Machines](https://console.tailscale.com/admin/machines) 页面删除 `tsheadroom` 设备。

## 故障排除

如果 hook 的行为不符合预期，请按本节逐步排查。模型加载的情况放在表格之后，因为它需要更多解释。

| 症状                                              | 原因                                                                                                                                                                                                                                                                                                                              | 修复方法                                                                                                                                                                                                                                                                                                                               |
| :------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 每个请求都记录 `allow`，没有任何压缩              | 授权不匹配，或请求体中没有值得压缩的内容。`allow(noop)` 表示没有值得压缩的内容，例如一条短对话。`allow(passthrough)` 表示请求体中没有 `messages` 数组，例如 embeddings 调用或 Gemini 的 `contents` 请求体。两者都是正确行为。                                                                                                     | 确认授权的 `src` 覆盖了你的用户，`models` 覆盖了你调用的模型。如果具体是正文没有被缩减，确认构建使用了 `ml` 变体（`.env` 中的 `HEADROOM_VARIANT=ml`，然后 `docker compose up -d --build`），并用 `curl http://tsheadroom.<tailnet-name>.ts.net/config` 查看运行中的设置。                                                              |
| 完全没有请求到达设备                              | Aperture 无法解析或调用 hook，或 `send_hooks` 名称不匹配。                                                                                                                                                                                                                                                                        | 从 tailnet 设备上[重复请求测试][ar-confirm-device]。如果没有返回 JSON，问题出在设备或其 URL，而不是 Aperture。确认授权的 `send_hooks` 条目中的 hook 名称与你[定义 hook 时][ar-define-hook]所起的名称（`headroom`）完全一致。                                                                                                          |

如果第一个请求很慢或超时，原因是一次性的模型加载。每个 `ml` worker 会在启动时、报告就绪之前加载压缩模型（见第 2 步）。在新主机上，它还会下载约 600 MB，最长可能耗时约 60 秒。worker 还在加载时到达的请求会阻塞到某个 worker 就绪，然后返回 `modify`，除非调用方先取消。如果冷请求超过了 Aperture hook 的 `timeout` 并 fail open，请把你[定义 hook 时][ar-define-hook]设置的 `timeout` 提高到 `30s` 以上，或者设置一个 Hugging Face 令牌以避免受限流影响的模型下载。你可以在 [Hugging Face 令牌页面][xt-hf-tokens]生成一个只读权限的令牌。

## 安全注意事项

在生产环境中运行 tsheadroom 之前，请理解这些安全属性。

* tsheadroom 没有公开端点。它通过 [`tsnet`][docs-tsnet] 加入 tailnet——把 Tailscale 直接嵌入程序，因此它以一台独立设备的身份出现，并拥有 `tsheadroom.<tailnet-name>.ts.net` 这样的稳定 [MagicDNS][docs-magicdns] 名称。它只能经由你的 tailnet 访问，访问由你的授权管控，因此它不需要自己的 API 密钥或 bearer token。

* `/config` 端点对任何能经由 tailnet 访问 tsheadroom 的设备都是可读可写的。没有按端点的认证，因此任何能访问该设备的人都能读取并修改它的压缩设置，`/metrics` 还会暴露模型和提供商名称。请给该设备打上标签，并通过收紧 `src` 把授权范围限定到最小。

* 认证密钥（`<ts-auth-key>`）和状态目录都是机密。状态目录保存设备的私钥（`tailscaled.state`），因此要把它放在持久存储上并当作敏感数据处理。不要把认证密钥提交进版本控制，并尽量使用较短的有效期，因为 tsheadroom 只在第一次启动时需要该密钥。

* `fail_open` 策略是有意为之的，这样即使 tsheadroom 宕机也绝不会阻断请求。这一选择以可用性优先于强制执行，对压缩 hook 而言是正确的。不要把这个 hook 当作安全控制手段。

* 请求体会流经 tsheadroom 内存进行压缩。在 `ml` 变体下，唯一的出站网络调用是从 Hugging Face 下载模型的一次性操作。Hugging Face 令牌只为该下载提供认证，不会发送任何请求内容。tsheadroom 不会把请求内容发送给任何第三方服务。

## 后续步骤

臃肿请求在生产环境中被压缩后，你可以根据自己的流量进一步调优。

* 在限定范围的授权上验证响应质量后，把 `models` 从 `"anthropic/**"` 放宽到 `"**"`，或扩展到其他提供商。

* 模型下载完成后，调高 `.env` 中的 `POOL_SIZE`，让 tsheadroom 处理更多并发请求。每个 `ml` worker 都保存一份自己的模型副本，因此请根据主机内存规划池大小。

* 调整 tsheadroom 压缩的内容。用 `curl http://tsheadroom.<tailnet-name>.ts.net/config` 读取设备上的压缩设置，并通过向同一端点发送 `PUT` 修改它们。

## 进一步探索

这些文档主题涵盖了本指南所依赖的 Aperture 和 Tailscale 功能。

* [Aperture 配置参考][docs-aperture-configuration]介绍了 `hooks` 映射、`send_hooks`、事件以及护栏响应格式。

* [构建自定义 webhook][docs-build-custom-webhook]描述了 tsheadroom 实现的 `pre_request` hook 模式。

* [护栏][docs-guardrails]解释了 tsheadroom 所接入的护栏模型，包括 `fail_policy` 行为。

* [管控 AI 访问][docs-control-access]和[设置 LLM 提供商][docs-set-up-providers]涵盖了 Aperture 的前提条件。

* [认证密钥][docs-auth-keys]涵盖了你在开头生成的密钥。

* [授权语法][docs-grants-syntax]解释了授权以及策略文件对 `dst` 的要求。

[ar-confirm-device]: #第-3-步确认设备已加入你的-tailnet

[ar-define-hook]: #第-4-步在-aperture-中定义-hook

[ar-rollback]: #回滚或禁用压缩

[ar-security-notes]: #安全注意事项

[ar-troubleshooting]: #故障排除

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture]: /docs/aperture

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-build-custom-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-control-access]: /docs/aperture/control-access

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-guardrails]: /docs/aperture/guardrails

[docs-magicdns]: /docs/features/magicdns

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tsnet]: /docs/features/tsnet

[xt-headroom]: https://pypi.org/project/headroom-ai/

[xt-hf-tokens]: https://huggingface.co/settings/tokens
