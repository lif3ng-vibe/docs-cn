---
title: "占用者自有的流分类与影子捕获（实验性）"
---

> **0.6.0 中为实验性，可选且默认关闭**。Jev 分类路径与影子捕获可能不完整或无法工作，
> 不做任何准确性或生产可靠性声明。OpenRig 的投递、看门狗与路由决策不使用它们的输出。
> 如果它们的行为与本文描述不符，请
> [提交 issue](https://github.com/mvschwarz/openrig/issues/new/choose) 或发起 pull request
> （[CONTRIBUTING.md](/../CONTRIBUTING/)）。

这个来源为一位真实的分类器占用者提供一个有界接收器。它默认不启动智能体、不注册看门狗作业、也不启用捕获。分类体系（taxonomy）、问题与决定属于占用者；守护进程提供来源事实，并执行其既有的租约、执行与幂等围栏。一个显式的可选 Jev 模式通过同一个 worker 提供咨询性决定。实验性标签没有经过验证的准确性或经过校准的置信度，不取代投递、看门狗或路由决策。

## 可选的前台 Jev 实验

无配置时，实验处于关闭状态。选择一个既有私有目录中的显式本地 JSON 路径；该文件只包含启用状态与界限：

```sh
rig project experimental status --config ./experiment.json --json
rig project experimental enable --config ./experiment.json --max-requests 3 --timeout-ms 10000 --json
rig project experimental disable --config ./experiment.json --json
```

启用不会启动处理、捕获、守护进程或智能体。status 与 disable 不发出提供商请求。已启用的运行要求调用进程的环境中有 `OPENROUTER_API_KEY`；这个入口绝不搜索凭据文件，也绝不把凭据复制进配置。凭据缺失时，在任何尝试或提供商工作开始之前即失败。正常的密钥供给仍由操作员负责。

所选路由是 `https://openrouter.ai/api/alpha/decisions`，钉定在 `typesafe/jev-1.13`，没有提供商回退或 HTTP 重定向。请求声明的提供商价格上限为每百万 prompt token $0.05，completion 与请求价格为零。这些是准入上限，不是报价、花费估算或凭据访问声明。每次前台运行允许 1–20 次请求（默认 3），每次有 1–30 秒的时限（默认 10），请求上限 24 KiB、响应上限 256 KiB。失败的请求也消耗其额度。后台没有任何重试。

要处理来自实际所选占用者的流条目：

```sh
rig project wake --project PROJECT --taxonomy ./taxonomy.yaml \
  --classifier-version experimental-jev-1.13 --evidence-epoch OWNER_EPOCH \
  --limit 3 --experiment ./experiment.json --json
```

使用下文描述的分类体系格式。每个判据（criterion）必须有一个非空字符串描述；`__unknown__` 为保留字。问题留在守护进程之外。请求会把所选条目的正文、所供给的分类体系问题/判据、规范 scope ID 与当前名册目的地发送给 OpenRouter。请选择适合这种外部处理的输入。它不会把凭据放入证据传输，也不会将其存入分类结果。输出绑定当前来源、分类体系、候选版本、租约、占用者世代与尝试执行。不推断任何行动或置信度标签。重复判断仍是人工事项。

唤醒的条目数由 `--limit` 与已配置的请求上限中较小者界定。未知答案保持为 null；整体未知的答案弃权。无效的模型、提供商、答案键、选项、概率或响应字节会拒绝整个答案。概率之和保持严格的 0.001 容差；没有舍入修复，也没有部分挽救。不可用/无效的提供商工作会终止该次运行，不写入任何分类。检查返回的尝试状态：终态弃权不会重开，失败/未知的守护进程写入必须通过既有账本对账。绝不要为了重试一次实验而更改证据纪元（evidence epoch）。

每次调用之前、以及应用其结果之前，都会检查禁用状态。单独的 disable 命令无法取消一个已转发的远程请求；其迟到的结果会被丢弃，等待仍受既有时限约束。Ctrl-C 或 SIGTERM 会请求立即取消前台运行。不配合的请求仍会报告为 pending，并且在该次运行中不会造成迟到写入或第二次调用。本地取消不能证明远程已取消或已退款。该命令不注册唤醒、不返回自动继续，要做更多工作需要显式的后续调用。

对于来自既有影子档案的所选观测：

```sh
rig project experimental capture --config ./experiment.json \
  --input ./selected-shadow.jsonl --output ./new-advisory-results.jsonl --json
```

它最多读取 8 MiB，且只考虑前"已配置上限"数量的记录。它绝不捕获终态条目。输入保持不变；输出以 0600 权限独占创建。保留既有输出，只为刻意选定的新一轮运行选择另一个文件名。它把捕获到的筛后（post-screen）文本发送给同一个提供商，并在答案旁保留原有的 attempt/node/occupant/pane 绑定与捕获哈希。缺失捕获或绑定时不可用，且不发起提供商调用。状态类答案是实验性提示；投递仍为 `INDETERMINATE`，因为屏幕文本无法证明已提交/已消费/已生效，而且档案不保留原始发送文本。任何结果都不会反馈进实时传输或清单。失败的运行保留已写出的输出；请检查 `unavailable`、`remaining`、调用次数与停止原因，而不是把文件当作成功的证明。

## 一次有界唤醒

从所选占用者出发，使用已配置的项目 ID 读取候选：

```sh
rig project candidates --project PROJECT --taxonomy /private/taxonomy.yaml \
  --classifier-version VERSION --evidence-epoch OWNER_EPOCH --limit 20 --json
```

结果包括合格的流 ID、带确切来源路径/哈希的成文 scope ID、占用者 rig 的当前运行名册、观测时间与一个候选版本。分类体系 YAML 提供 `version` 与 `fields.{kind,urgency,maturity,area}`，各带一个 `question` 与 `values` 映射。这些问题会返回给占用者；草拟的取值不是经过验证的事实。在校准选定那个契约之前，置信度没有可选值。目的地选项是当前名册会话加上显式的 `pool`。null/省略的目的地保持未知；不会被转换成 `pool`。候选哈希同时绑定可选取值与来源、分类体系哈希。在这一 pool 修正之前准备的包需要重新准备；它不会重开历史尝试，也不会更改证据纪元。

用 `rig stream show ITEM --json` 读取每个合格条目。重复候选是最近的 100 条未归档条目，带确切的正文哈希证据引用；其预览上限 2,000 字符，截断时会标注。在选定重复之前，先读完整候选。检索未中即未知。目录名、issue ID 与单纯的成员关系绝不充当 scope ID。来源错误是显式的，部分的来源快照导致弃权。

写一个由占用者自有的决定文件（最多 100 个唯一条目 ID，最多 1 MiB）：

```json
{
  "candidateSetVersion": "sha256:<version returned by candidates>",
  "decisions": [{
    "streamItemId": "<eligible ID>",
    "bodyHash": "sha256:<SHA256 of the exact UTF-8 item body>",
    "decision": { "kind": "classify", "labels": {
      "classificationType": "<selected taxonomy value>",
      "scopeRef": "<selected canonical mission or slice ID>",
      "needsHuman": null
    }}
  }]
}
```

显式弃权写作 `{"kind":"abstain","reason":"why unknown"}`。其他标签键还有 `classificationUrgency`、`classificationMaturity`、`classificationDestination`、`area` 与 `classificationConfidence`。省略或为 null 的标签保持未知。一条重复判定需要同时给出 `duplicateOfStreamItemId` 与来自候选的确切匹配的 `duplicateEvidenceRef`，外加占用者"它确实是重复"的判断。仅仅存在一个既有条目，不构成那种判断。

```sh
rig project wake --project PROJECT --taxonomy /private/taxonomy.yaml \
  --classifier-version VERSION --evidence-epoch OWNER_EPOCH --limit 20 \
  --decisions /private/decisions.json --json
```

该命令经由既有 HTTP 服务实际调用一次 `StreamClassificationWorker.wake()`。它通过 `DaemonClient` 推导发送者身份，要求存在一个当前运行中的占用者，并把捕获到的世代贯穿每一次租约/尝试/分类请求。它绝不虚构一个守护进程持有者。既有的直接 HTTP 调用方保持其文档化的发送者来源行为。

该命令在获取租约之前刷新来源候选。决策包缺失或过时会返回不可用，而不开始尝试；若名册、scope、分类体系或近期流发生了变化，就重新准备。在唤醒期间，没有精确正文绑定决定的条目、来源缺失的条目、或所选候选不可用的条目会弃权。这是刻意从严；持续的来源变动可能要求反复准备，这不是吞吐量声明。

每次唤醒最多处理 `--limit` 个条目（1–100；默认 20），从最旧的合格工作开始，而不依赖有损的通知游标。持久的终态尝试保持排除在外。新的候选版本**不**授权再来一遍：只有占用者选定的证据纪元会改变那个尝试身份。把 candidates 输出与决定、结果一并留存，使其版本可复现。CLI 不保存第二份本地账本。

结果携带逐条目的结果、`moreEligible`、`nextWakeAt`，以及一个看门狗 `wakeRequest` 描述符，内含真实会话/世代与一条接收指令。`registered:false` 是字面义。一条周期提醒消息请占用者准备并运行这个入口；该消息的送达不是执行。注册/落位仍是显式的后续动作。遵守 `nextWakeAt`：租约维护利用 TTL/3 的时机；租约丢失或服务不可用则退避 60 秒。守护进程的重试/耗尽账本仍是权威。普通客户端把每个请求限定在五秒内；超时的写入在被账本读取之前结果未知，且绝不会被报告为已写入。

人工决定路径中没有提供商。可复用的异步 worker 只有一个待决分类器槽位；超时会请求取消但无法强制。一个不配合的分类器会阻塞该实例中的后续调用，且迟到的结果无法写入。那个内存中的待决槽位不是跨进程取消。

## 独立的有界影子排空

生产传输与清单探测接受同一个可选观察器。它们只记录已发生的捕获，节点、占用者、pane 与捕获目标在 await 之前即已绑定。普通廉价的清单路径仍不做捕获。"保留但未写入"是一个独立事件，绝不是投递证据。

激活要求在随后一次获得授权的守护进程启动时显式供给 `OPENRIG_SHADOW_CAPTURE` JSON。缺失或无效的配置使捕获保持关闭。本文档不提供任何实时目的地或激活指令。必填字段与工程上限如下：

| 字段 | 含义 | 上限 |
|---|---|---|
| `destination` | 规范的、归当前用户所有的 0700 目录中的一个新绝对路径 JSONL 文件 | 显式路径 |
| `maxRecords` | 汇（sink）预留记录总数 | 100,000 |
| `maxBytes` | 汇预留字节总数，含换行符 | 1 GiB |
| `capacity` | 排队观测数 | 1,000 |
| `maxQueuedBytes` | 队列中等待的序列化字节 | 8 MiB |
| `maxObservationBytes` | 每条观测的序列化字节 | 1 MiB |

所有数字字段都是必需的正安全整数。这些是工程容量限制，不是经批准的语料库规模或分类阈值。一个在途排空最多可再容纳 64 条观测，受队列字节配额约束；队列加排空因此最多可保留两倍于该配额的量。独立观察器的默认值为 256 条、4 MiB 排队、每条观测 256 KiB；显式的生产配置逐项提供各值。

`rig project shadow-status` 只检查配置/计数器。`rig project shadow-drain` 请既有 HTTP 服务排空至多 64 行；它要求一个行动者，且绝不启用捕获。不添加任何后台排空计时器。`rig project shadow-stop` 立即禁用新的入队，完成任何在途排空与有限的保留队列，然后关闭汇。重复 stop 是幂等的；它无法启用捕获，也无法删除既有档案。既有的配额损失与汇失败损失继续计数。慢磁盘可能让 stop 停留在 pending；客户端超时之后请检查状态，而不要假设冲刷已完成。重新启用捕获需要另一次获得授权、且带新目的地的守护进程启动；启用本地提供商实验不会启用捕获。文件以 0600 权限独占创建。已存在的文件会被拒绝，绝不被覆盖、追加、轮转或删除。重启需要一个新的选定目的地。私有文件创建目前要求 POSIX 所有权支持。

热路径只执行有界的同步入队工作；它绝不等待磁盘或排空完成。慢汇会让一个排空处于 pending；并发的排空不会启动另一个写入者。溢出会丢弃新观测。容量耗尽会停止汇。错误会停止写入、计入损失并保留任何部分文件；失败的批次不会重放。`reservedRecords/Bytes` 包含已尝试的写入，而 `completedRecords/Bytes` 只计成功的追加。`drained` 表示已从观察器移除，不一定已持久化。队列计数丢弃、字节上限丢弃、记录错误、缺失/不可用捕获与汇失败仍各自独立。

实时采集、私有目的地/保留策略选择、语料库标签、托管校准、原生落位、打包/安装证明，以及独立的可见/已提交/已消费/已生效证据，都不在这个来源入口的范围之内。
