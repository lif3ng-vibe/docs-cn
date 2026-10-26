# Policy Flow Builder

Policy Flow Builder（策略流程构建器）让你能够设计带有**条件执行**能力的防护栏（guardrails）流水线（pipeline）。各防护栏不再彼此独立运行，而是串联成有序的步骤，由你控制每个防护栏在**通过**、**未通过策略检查**（内容干预）或遭遇**技术错误**（如超时、提供商不可达、防护栏缺失）时分别作何处理。

它能支持两种模式：一是**防护栏回退**（guardrail fallback），某个防护栏失败时改试另一个；二是**重试同一防护栏**，失败后再次运行同一个防护栏，例如用于处理瞬态错误。借助 **`on_error`**，你还可以把**技术性**失败与**策略性**失败区别对待，例如在主 API 出错时回退到另一家提供商，同时对被标记的内容依旧予以拦截。

## 何时使用 Flow Builder

| 方式 | 适用场景 |
|----------|----------|
| **简单策略**（`guardrails.add`） | 所有防护栏并行运行；任一失败即拦截请求。 |
| **Flow Builder**（流水线） | 防护栏按顺序运行；每一步采取什么动作（next、block、allow、自定义响应）由你决定。 |

在以下场景中使用 Flow Builder：

- **防护栏回退**：用 `on_fail: next` 在某个防护栏失败时改试另一个（例如快速过滤器 → 更严格的过滤器）
- **重试同一防护栏**：把同一个防护栏配置为多个步骤；失败后 `on_fail: next` 会进入下一步，而下一步可以是同一个防护栏（适合应对瞬态 API 错误或速率限制）
- **条件路由**：例如快速防护栏失败时，转而运行更高级的防护栏，而不是立即拦截
- **自定义响应**：防护栏失败时返回特定消息，而不是笼统的拦截
- **数据传递**：把修改后的数据传给下一步，例如掩码后的 PII（个人身份信息）内容
- **细粒度控制**：每一步在通过和失败时可以配置不同的动作
- **技术错误路由**：把 `on_error` 与 `on_fail` 分开设置，让服务中断或超时既可以**放行**、**拦截**、**进入下一步**，也可以返回**自定义响应**，而不会与内容违规混为一谈

## 核心概念

### 流水线

一条流水线包含：

- **模式**（Mode）：`pre_call`（LLM 调用前）或 `post_call`（LLM 调用后）
- **步骤**（Steps）：按顺序排列的防护栏步骤列表

### 三种结果：pass、fail 和 error

每一次步骤运行都会产生以下三种结果之一：

| 结果 | 含义 | 典型原因 |
|--------|---------|----------------|
| **pass** | 防护栏执行完毕，未拦截 | 内容放行，或数据经修改后返回 |
| **fail** | 策略干预 | 防护栏触发了干预（如内容被标记、请求被拦截） |
| **error** | 技术故障 | 超时、网络错误、防护栏未注册，或其他非干预类异常 |

`on_pass` 与 `on_fail` 分别作用于 **pass** 和 **fail**。**`on_error`** 只作用于 **error**。若省略 `on_error`，流水线对 error 结果沿用 **`on_fail`**（向后兼容）。

### 步骤动作

对每一步，你要为 **pass**、**fail** 以及（可选的）**error** 各指定一个动作。可用取值为 `next`、`allow`、`block`、`modify_response`。

| 动作 | 说明 |
|--------|-------------|
| **下一步**（`next`） | 继续执行流水线中的下一个防护栏 |
| **放行**（`allow`） | 终止流水线，放行请求 |
| **拦截**（`block`） | 终止流水线并拦截请求 |
| **自定义响应**（`modify_response`） | 返回自定义消息，替代默认的拦截行为 |

### 步骤选项

| 字段 | 类型 | 说明 |
|-------|------|--------------|
| `guardrail` | `string` | 要运行的防护栏名称 |
| `on_pass` | `string` | 结果为 **pass** 时采取的动作：`next`、`allow`、`block`、`modify_response` |
| `on_fail` | `string` | 结果为 **fail**（策略干预）时采取的动作：`next`、`allow`、`block`、`modify_response` |
| `on_error` | `string`（可选） | 结果为 **error**（技术性）时采取的动作。若省略，**error** 沿用 `on_fail`。 |
| `pass_data` | `boolean` | 把修改后的请求数据（如 PII 掩码后）传给下一步 |
| `modify_response_message` | `string` | 使用 `modify_response` 动作时返回的自定义消息 |

## 在界面中使用 Flow Builder

1. 进入 LiteLLM 管理界面（Admin UI）的 **Policies**
2. 点击 **+ Create New Policy**（新建策略），或在现有策略上点击 **Edit**（编辑）
3. 选择 **Flow Builder**（而不是简单表单）
4. 设计你的流程：
   - **触发器**（Trigger）：传入的 LLM 请求（策略匹配时运行）
   - **步骤**（Steps）：添加防护栏，并为每一步设置 **ON PASS**（通过时）、**ON FAIL**（失败时）和 **ON API FAILURE**（API 出错时）/ **ON ERROR**；若 **ON API FAILURE** 未设置，技术错误按 **ON FAIL** 处理
   - **结束**（End）：流水线放行后，请求才会继续发往 LLM
5. 用步骤之间的 **+** 插入另一个防护栏步骤（用于回退、重试或更严格的二次检查）
6. 保存前用 **Test Pipeline**（测试流水线）试跑示例消息
7. 点击 **Save Policy**（保存策略）或 **Save**，创建或更新策略

### 在界面中配置防护栏回退（操作演示）

1. 点击 **Policies**

![管理界面中的 Policies 标签页](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/1333f4ae-d7df-4645-bd33-fee11c80cb96/ascreenshot_ce21e8bd79324c4685ad6c191e39d89e_text_export.jpeg)

2. 点击 **+ Add New Policy**（新增策略）

![新增策略](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/353c08ab-cdb5-490f-b54f-734f77c87c45/ascreenshot_223033a61071485187e87cbb8c41081e_text_export.jpeg)

3. 点击 **Flow Builder**

![选择 Flow Builder](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/70e99d1b-fd76-4143-93f4-296b8b4c3904/ascreenshot_ef49b2e2c5dc40e39cf8da7a37f346ac_text_export.jpeg)

4. 点击 **Continue to Builder**（进入构建器）

![进入构建器](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3de1beaf-9c52-4f03-9100-ce4d47e41967/ascreenshot_a1d64e7e58c54b6cb8a311173ffe435a_text_export.jpeg)

5. 点击第一步的 **guardrail search**（防护栏搜索）输入框

![选择第一个防护栏，搜索框](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/640f699b-bdde-4e6d-a226-1fede9477b22/ascreenshot_27f14445b78b4e61872f3f95c1c9bacd_text_export.jpeg)

6. 选择 **Test Moderation**（或你的主防护栏）

![选择 Test Moderation](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/d46f7ab6-4231-44fb-b377-59f817cdfbe5/ascreenshot_e3a9f8e25ffe46ad82a73641b81d157c_text_export.jpeg)

7. 对其中一个分支（例如 **ON API FAILURE**），把动作设为 **Next Step**，这样 API 出错时流水线就能顺延到下一个防护栏

![把动作设为 Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3a7ddc2a-4317-417b-9341-ff6b0913e64b/ascreenshot_8878486dc12b4dddafe0c8ba4382a0fb_text_export.jpeg)

8. 对 **ON PASS** 设为 **Allow**（放行）；如果放行前还需要更多步骤，则设为 **Next Step**

![ON PASS 设为 Allow](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/0e31cde8-3075-4e17-b771-b2b1696db98f/ascreenshot_b4b1d232459e4941904c9fbcf90c70ca_text_export.jpeg)

9. 打开下一个结果分支的搜索/下拉框（例如 **ON FAIL**）

![配置另一个分支，搜索框](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/715fc3ad-f245-4ee8-bb36-cc13400d635d/ascreenshot_395fece82c124d4d826fb5d84c9c0529_text_export.jpeg)

10. 如果检查失败后应继续走备用防护栏，把该分支设为 **Next Step**

![ON FAIL 分支设为 Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/83156e9b-fc3f-4cc2-a6cb-2a13a5e77b06/ascreenshot_c61429bf7b354063afc57c40a6b45c7a_text_export.jpeg)

11. 点击步骤之间的 **+**，添加第二个防护栏

![添加步骤，加号控件](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/e76cff13-af73-4775-90f6-4d29cb97d401/ascreenshot_52c478e7afd5410f9f63b616c753c851_text_export.jpeg)

12. 打开新步骤上的防护栏搜索框

![第二步，防护栏搜索](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/5c1c4eea-d7da-41e5-bebd-945e97562aa5/ascreenshot_cef70e9146b148b1936e721638de0783_text_export.jpeg)

13. 选择 **Insults & Personal Attacks**（或你的回退/更严格防护栏）

![选择 Insults and Personal Attacks](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/e796c733-351f-494f-9261-795c27f2b519/ascreenshot_f0f778d50c2146e48829ffb203c7de92_text_export.jpeg)

14. 按这一步的需要，为各分支设置 **Next Step** 或 **Block**（拦截）

![第二步分支设为 Next Step](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/c5fad953-4f4b-47ec-ab6d-81d21b2fb7b8/ascreenshot_b515fadec0534c6a9b9d66091398d82d_text_export.jpeg)

15. 如果该防护栏应顺利走完整条流水线，把 **ON PASS** 设为 **Allow**

![第二步通过时设为 Allow](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/8210f32a-8704-41b1-97cc-7d183682a2a4/ascreenshot_23361af2b7da482a8d89025ab285a72e_text_export.jpeg)

16. 打开你想配置 **Custom Response**（自定义响应）的分支（例如最后一步的 **ON FAIL**）

![自定义响应，打开分支选择器](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/98ab3a2c-f22f-4478-a146-d5d26cae9b10/ascreenshot_6a3b673654e64ce29c8c93fbf30c52ed_text_export.jpeg)

17. 选择 **Custom Response**

![选择 Custom Response](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/a9e69e82-d517-4426-95da-034643a2388b/ascreenshot_f8ef581fbfb440cdbf145a2e9368c8e8_text_export.jpeg)

18. 点击 **Enter custom response...** 输入框，键入你的消息

![自定义响应文本框](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/ef0f90ba-d0bc-4220-874f-4998b2dcc5f6/ascreenshot_f3e825b57fa0478a92f56840af266e03_text_export.jpeg)

19. 按需在 **Enter custom response...** 中确认或修改消息

![自定义响应，确认消息](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/f9a4711d-655c-4f15-b0ea-6b7d33fe6e60/ascreenshot_5df4b465bc484d8f86a4af5a45e9ab42_text_export.jpeg)

20. 打开 **Test Pipeline**（测试流水线）

![Test Pipeline 面板](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/3f9ac555-66fe-43e0-a8d8-2288a5966c73/ascreenshot_b2319dae363346ebb4da5d09180b56e8_text_export.jpeg)

21. 点击 **Run Test**（运行测试）

![运行测试](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/8e21e973-8193-404b-9d97-fd85be5f90b6/ascreenshot_619ca71e3be244449ca2ab01dde3cc45_text_export.jpeg)

22. 在结果中展开 **Step 1**（或第一个防护栏行），对比查看 **ERROR** / **Next Step** 与 **PASS** / **Allow**

![展开测试结果中的第一步](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/b8010e20-dd9a-4e59-b0ca-1f2ba4c7b6ac/ascreenshot_da99f5761bbf44a08af4f1e1175a95fc_text_export.jpeg)

23. 展开 **Step 2**（例如 **Insults & Personal Attacks**），确认回退后得到 **PASS** 和 **Allow**

![展开 Step 2，第二个防护栏的结果](https://colony-recorder.s3.amazonaws.com/files/2026-04-15/cac5273c-dd4f-48a0-af58-12c428d0f0d0/ascreenshot_f74da58e280a47319a7d2fa41519f4fb_text_export.jpeg)

## 配置（YAML）

在策略配置中定义一条流水线：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: pii_masking
    litellm_params:
      guardrail: presidio
      mode: pre_call

  - guardrail_name: prompt_injection
    litellm_params:
      guardrail: lakera
      mode: pre_call

policies:
  my-pipeline-policy:
    description: "PII mask first, then check for prompt injection"
    guardrails:
      add:
        - pii_masking
        - prompt_injection
    pipeline:
      mode: pre_call
      steps:
        - guardrail: pii_masking
          on_pass: next
          on_fail: block
          pass_data: true
        - guardrail: prompt_injection
          on_pass: allow
          on_fail: block

policy_attachments:
  - policy: my-pipeline-policy
    scope: "*"
```

## 回退与重试

### 防护栏回退

用 `on_fail: next` 在某个防护栏失败时回退到另一个防护栏。先运行轻量级防护栏；一旦失败，再升级到更严格的防护栏或另一家提供商：

```yaml
policies:
  fallback-policy:
    guardrails:
      add:
        - fast_content_filter
        - strict_content_filter
    pipeline:
      mode: pre_call
      steps:
        - guardrail: fast_content_filter
          on_pass: allow
          on_fail: next
        - guardrail: strict_content_filter
          on_pass: allow
          on_fail: block
```

`fast_content_filter` 通过 → 放行。失败 → 运行 `strict_content_filter`；通过 → 放行，失败 → 拦截。

### 重试同一防护栏

把同一个防护栏配置为多个步骤，失败时即可重试。适合瞬态错误（API 超时、速率限制）：

```yaml
policies:
  retry-policy:
    guardrails:
      add:
        - lakera_prompt_injection
    pipeline:
      mode: pre_call
      steps:
        - guardrail: lakera_prompt_injection
          on_pass: allow
          on_fail: next
        - guardrail: lakera_prompt_injection
          on_pass: allow
          on_fail: block
```

第一次通过 → 放行。第一次失败 → 重试同一防护栏；第二次通过 → 放行，第二次失败 → 拦截。

## 技术错误与策略失败的区别（`on_error`）

当你希望 **API/基础设施问题**与**内容策略**违规采取不同处理时，使用 **`on_error`**。

- **`on_fail`**：防护栏对内容**干预**时触发（如有毒内容、检测到 PII）。
- **`on_error`**：步骤以 **error** 告终时触发（超时、连接失败、防护栏未加载等）。若省略 `on_error`，**error** 结果沿用 **`on_fail`**。

示例：内容不佳时拦截；但如果主扫描器宕机，则回退到第二个防护栏，而不是拦截所有请求：

```yaml
policies:
  error-fallback-policy:
    guardrails:
      add:
        - primary_scanner
        - backup_scanner
    pipeline:
      mode: pre_call
      steps:
        - guardrail: primary_scanner
          on_pass: allow
          on_fail: block
          on_error: next
        - guardrail: backup_scanner
          on_pass: allow
          on_fail: block
          on_error: allow
```

`primary_scanner` 出错 → 运行 `backup_scanner`。`backup_scanner` 也出错 → 放行请求（若你更倾向 fail-closed，即出错时一律拦截，可把 `on_error` 设为 `block`）。

## 示例：失败时返回自定义响应

用一条符合品牌口吻的消息，取代默认的笼统拦截：

```yaml
policies:
  branded-block-policy:
    guardrails:
      add:
        - pii_detector
    pipeline:
      mode: pre_call
      steps:
        - guardrail: pii_detector
          on_pass: allow
          on_fail: modify_response
          modify_response_message: "Your message contains sensitive information. Please remove PII and try again."
```

## 测试流水线（API）

在挂载策略前，先用示例消息测试流水线：

```bash
curl -X POST "http://localhost:4000/policies/test-pipeline" \
  -H "Authorization: Bearer <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": {
      "mode": "pre_call",
      "steps": [
        {
          "guardrail": "pii_masking",
          "on_pass": "next",
          "on_fail": "block",
          "pass_data": true
        },
        {
          "guardrail": "prompt_injection",
          "on_pass": "allow",
          "on_fail": "block"
        }
      ]
    },
    "test_messages": [
      {"role": "user", "content": "What is 2+2?"},
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ]
  }'
```

响应中包含每一步的结果（pass/fail/error）、所采取的动作以及耗时。

## 流水线与简单策略的对比

策略带有 `pipeline` 时，执行顺序和动作由流水线定义。`guardrails.add` 列表必须包含流水线步骤中用到的所有防护栏。

| 策略类型 | 执行方式 |
|-------------|-----------|
| 简单（仅 `guardrails.add`） | 所有防护栏都会运行；任一失败即拦截 |
| 流水线（含 `pipeline`） | 步骤按顺序运行；动作控制流程走向 |

## 相关文档

- [防护栏策略](./guardrail_policies)：策略基础、挂载与继承
- [策略模板](./policy_templates)：预置的策略模板
