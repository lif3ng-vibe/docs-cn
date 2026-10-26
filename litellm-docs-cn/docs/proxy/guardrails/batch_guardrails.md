# Batch API 防护栏

对批处理输入文件中的记录执行防护，让批处理任务无法把内容带过防护栏（guardrails）；同样的内容在 `/chat/completions` 上本来是会被拦下的。

## 工作原理

批处理任务的提交分两步：先把 `.jsonl` 文件以 `purpose=batch` 上传到 `/v1/files`，再拿文件 id 创建任务。记录只在提供商（provider）侧执行，因此上传是 LiteLLM 唯一经手其内容的时间点。

防护栏就在这一步生效。每条记录都会被单独扫描，并按其 `url` 所指的调用类型处理，因此指向 `/v1/chat/completions` 的记录，其检查方式与对应的对话补全请求完全一致：

```
POST /v1/files  (purpose=batch)
        │
        ▼
┌──────────────────────┐
│    LiteLLM Proxy     │  scans every record against your pre_call guardrails
└──────────┬───────────┘
           │
           │  record 1  clean          -> submitted unchanged
           │  record 2  guardrail masks -> submitted with the mask applied
           │  record 3  guardrail blocks -> left out of the file
           │
           ▼
      Provider receives the remaining records
```

一条记录违规不会导致整个文件被拒。批处理任务动辄包含数千行，因为一条问题记录而否决全部，通常不是你想要的结果。

## 配置

无需任何开关。凡是运行在 `pre_call` 阶段的防护栏都会自动作用于批处理上传：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: pii-guard
    litellm_params:
      guardrail: presidio
      mode: pre_call
      default_on: true

files_settings:
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
```

## 每条记录会发生什么

会改写内容的防护栏（如 PII 掩码）会把改写应用到记录上，然后以改写后的形式提交。触发拦截则意味着该记录不会进入送达提供商的文件，任务的其余部分照常继续。

防护栏没有提出异议的记录会按原样逐字节透传，因此启用防护栏不会改动文件其余部分的格式。

## 上传响应

响应就是常规的文件对象，外加一个 `litellm_batch_guardrail` 字段；只有防护栏改动过内容时才会出现这个字段：

```bash
curl -sS http://localhost:4000/v1/files \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F purpose=batch \
  -F file=@batch_input.jsonl
```

```json
{
  "id": "file-Cr85eqBTg1WiNb1S4ystvR",
  "object": "file",
  "purpose": "batch",
  "bytes": 594,
  "status": "processed",
  "litellm_batch_guardrail": {
    "submitted_records": 3,
    "modified_records": [
      {"line": 2, "custom_id": "row-2", "action": "redacted", "guardrail": null},
      {"line": 3, "custom_id": "row-3", "action": "dropped", "guardrail": "pii-guard"}
    ]
  }
}
```

`submitted_records` 是实际送达提供商的记录数。`modified_records` 中的每一项同时用 `custom_id` 和上传文件中从 1 开始计数的 `line` 来标识记录，两种方式都能对回你的源数据。

`action` 为 `redacted` 表示记录在应用了防护栏的改写后提交；为 `dropped` 表示该记录被剔除。

`guardrail` 指明是哪个防护栏剔除了记录，前提是该防护栏上报了自己的身份。这里刻意只报防护栏而不报原因：防护栏拒绝内容，与防护栏在 fail-closed 默认策略下无法连通时报错的方式相同，此刻无法区分二者。知道了名字，你就知道该去查什么。

同样的结果也会写入代理日志，以及日志回调读取的请求元数据（metadata），因此被剔除的记录在服务端同样可见，而不只是调用方知道。

## 上传被拒绝的情形

有四种情况会让整次上传直接失败，而不是剔除单条记录。

如果所有记录都被拦截，就没有可提交的内容了，此时上传返回 400，而不是创建一个空任务。

如果防护栏无法连通，或以"并非针对内容作出判断"的方式出错，上传会返回 400，并附带该防护栏自身的状态。剔除一条从未被真正检查过的记录等于无声地丢数据，因此整个文件会被拒绝。这包括配置为 fail-closed 但后端宕机的防护栏；这种情况很容易被误判成策略拦截，因为许多集成对两者的上报方式相同。

如果防护栏被配置为把敏感内容路由到另一个模型，触发它的记录会导致上传返回 400 并指明行号。批处理文件的所有记录都提交给同一个提供商，没办法把这一条单独送到别处，请在批处理之外发送它。

如果记录的 `body` 不是对象，或者没有 `messages`、`prompt` 或 `input`，防护栏就无从读取内容，上传会返回 400 并指明行号。在此之前记录还会先经过批处理文件的常规校验，所以无法解析、或缺少 `custom_id`、`method`、`url`、`body` 的行会更早被拒，并带有各自的错误信息。

## 限制

只有运行在 `pre_call` 阶段的防护栏才会看到批处理记录。仅配置为 `post_call` 的防护栏不参与其中，因为上传时还没有响应可检查。

决定运行哪些防护栏时，会忽略记录自身 body 里的 `guardrails` 键，因此单条记录无法绕开你的密钥或团队所选的防护栏。该键会原样保留在送达提供商的记录里。

通过 `litellm_params` 挂到特定部署（deployment）上的防护栏是在路由之后生效的，而批处理上传不经过路由，因此这类防护栏不会作用于批处理记录。

记录按有上限的批次分批扫描，而不是一次性全部处理，因此超大文件搭配走网络的防护栏时，上传耗时会相应变长。扫描的记录数量没有上限。
