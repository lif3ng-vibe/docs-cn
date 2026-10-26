# 工具策略（Tool Policies）

工具策略（Tool Policies）是一个注册表，收录代理在流量中见过的每一个工具：OpenAI 与 Anthropic 请求中的 `tools`、响应中的工具调用，以及 MCP（Model Context Protocol）工具调用；每个工具都配有一条输入策略和一条输出策略。工具在请求经过代理时自动被发现，新发现的工具初始为 `input_policy: "untrusted"` 与 `output_policy: "untrusted"`。工具策略防护栏（Tool Policy Guardrail）读取这份注册表，并在请求与响应上强制执行其中的策略。

注册表保存工具名称、来源、策略取值、调用次数、使用过该工具的团队与密钥（如有）、user agent，以及首次和最近一次出现的时间戳。修改策略不会重置调用次数，后续调用也不会重置你已设置的策略。

## 工具策略与工具权限防护栏

工具策略管理工具之间的信任关系。输入策略可以放行不受信任的输入、要求输入必须受信任，或屏蔽某个工具。输出策略负责把输出标记为受信任或不受信任。设为屏蔽的输入策略或团队级、密钥级覆盖会拒绝工具调用。当对话中包含输出策略为不受信任的工具产生的输出时，受信任输入策略会拒绝该工具。

`untrusted` 输入策略接受任何输入，包括来自不受信任工具输出的数据。`trusted` 输入策略要求输入必须受信任。`blocked` 输入策略禁止使用该工具。`untrusted` 输出策略表示输出可能包含不安全内容，并可能触发下游的信任链拦截。`trusted` 输出策略被视为已验证安全，不会触发这些拦截。

[工具权限防护栏（Tool Permission Guardrail）](./guardrails/tool_permission)则提供一套独立的、基于规则的管控手段。它匹配已配置的工具名称，可选地再匹配工具类型与参数，然后执行所配置的放行或拒绝动作。当授权取决于能否命中已配置的模式时，使用工具权限防护栏规则；当管控依据是已发现工具的信任分级以及工具输出与输入之间的信任链时，使用工具策略。两种防护栏可以同时运行在同一个代理上，请求必须通过其中每一个已配置的防护栏。

## 快速上手

当前管理界面（Admin UI）路由为 `http://localhost:4000/ui/tool-policies`。旧地址 `http://localhost:4000/ui/?page=tool-policies` 会重定向到该路由。

工具策略仅对代理管理员开放。其他角色访问时会看到页面仅限管理员使用的提示。

概览页展示今日发现的工具数、已发现工具总数、已屏蔽工具数与活跃团队数，也可以展示仍保留默认 untrusted 输入策略的新发现工具。表格支持搜索、按策略和团队或密钥筛选、刷新以及客户端分页。各列包括发现时间、工具名称、输入策略、输出策略、调用次数、团队名称、密钥哈希、密钥名称和 user agent。

点击工具名称即可打开详情视图。详情视图展示来源、调用次数、user agent、首次发现时间与最近使用时间。通过 Input Policy 与 Output Policy 选择器保存全局策略取值。输入策略取值为 `untrusted`、`trusted` 和 `blocked`；输出策略取值为 `untrusted` 和 `trusted`。

详情视图还会展示屏蔽该工具的团队级与密钥级覆盖。要添加覆盖，选择一个团队或密钥并保存 blocked 输入策略即可；要移除覆盖，点击对应团队或密钥旁边的 Remove。详情视图中还包含所选工具的近期使用日志。

## 管理 API

所有工具策略管理路由都要求代理认证。请在 `Authorization` 请求头中传入代理的主密钥（master key）。

### 列出工具

`GET /v1/tool/list` 返回一个包含 `tools` 与 `total` 的对象。每个工具行都带有自身的策略和注册表元数据。可以使用 `input_policy` 查询参数按输入策略过滤。

```bash
curl "http://localhost:4000/v1/tool/list" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

只列出已屏蔽的工具：

```bash
curl "http://localhost:4000/v1/tool/list?input_policy=blocked" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

### 获取单个工具

`GET /v1/tool/{tool_name}` 返回单个工具行。当工具名称包含在 URL 中有特殊含义的字符时，请先进行 URL 编码。

```bash
curl "http://localhost:4000/v1/tool/example_tool" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

`GET /v1/tool/{tool_name}/detail` 返回工具行及其 `overrides` 列表。该详情路由由管理界面调用。

```bash
curl "http://localhost:4000/v1/tool/example_tool/detail" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

详情响应的结构如下：

```json
{
  "tool": {
    "tool_id": "tool-id",
    "tool_name": "example_tool",
    "input_policy": "untrusted",
    "output_policy": "untrusted"
  },
  "overrides": []
}
```

完整的工具行还可以包含 `origin`、`call_count`、`assignments`、`key_hash`、`team_id`、`key_alias`、`user_agent`、`last_used_at`、`created_at`、`updated_at`、`created_by` 和 `updated_by`。

### 获取策略选项

`GET /v1/tool/policy/options` 返回受支持的输入与输出策略取值，并附带各自的标签和描述。

```bash
curl "http://localhost:4000/v1/tool/policy/options" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

响应包含 `input_policies` 与 `output_policies` 两个数组。每个选项都含有 `value`、`label` 和 `description`：

```json
{
  "input_policies": [
    {
      "value": "untrusted",
      "label": "Untrusted",
      "description": "Tool accepts any input, including data from untrusted tool outputs. Default for newly discovered tools."
    }
  ],
  "output_policies": [
    {
      "value": "trusted",
      "label": "Trusted",
      "description": "Tool output is verified safe. Will not trigger trust-chain blocks on downstream tools."
    }
  ]
}
```

### 更新全局策略

`POST /v1/tool/policy` 接受一个 JSON 请求体，其中必须包含 `tool_name`，以及 `input_policy` 与 `output_policy` 至少其一。输入策略可取 `trusted`、`untrusted` 或 `blocked`；输出策略可取 `trusted` 或 `untrusted`。

```bash
curl -X POST "http://localhost:4000/v1/tool/policy" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "example_tool",
    "input_policy": "blocked",
    "output_policy": "untrusted"
  }'
```

该端点会在必要时对注册表行执行 upsert，并返回 `tool_name`、已提交的策略字段以及 `updated: true`。两个策略字段都省略时返回 HTTP 400，报错为 `At least one of input_policy or output_policy must be provided`。

### 添加或移除团队或密钥覆盖

同一个更新路由还可以为单个团队或单个密钥添加或移除屏蔽。`team_id` 和 `key_hash` 必须二选一传入。将 `input_policy` 设为 `blocked` 即可添加覆盖。

```bash
curl -X POST "http://localhost:4000/v1/tool/policy" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "example_tool",
    "input_policy": "blocked",
    "team_id": "team-id"
  }'
```

密钥级覆盖改用 `key_hash` 代替 `team_id`。请求模型还接受 `key_alias`，用于补充更新路由返回的密钥元数据。

```bash
curl -X POST "http://localhost:4000/v1/tool/policy" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "example_tool",
    "input_policy": "blocked",
    "key_hash": "key-hash",
    "key_alias": "production-key"
  }'
```

要移除覆盖，使用 `DELETE /v1/tool/{tool_name}/overrides` 并只传一个查询参数：

```bash
curl -X DELETE "http://localhost:4000/v1/tool/example_tool/overrides?team_id=team-id" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

覆盖移除成功后，删除路由返回 `{"deleted": true, "tool_name": "example_tool"}`。同时提供 `team_id` 和 `key_hash` 会被拒绝，报错为 `Provide either team_id or key_hash, not both`。

### 获取使用日志

详情视图通过 `GET /v1/tool/{tool_name}/logs` 读取工具被实际调用的日志。该接口支持 `page`、`page_size`、`start_date` 与 `end_date` 查询参数，日期取值格式为 `YYYY-MM-DD`。

```bash
curl "http://localhost:4000/v1/tool/example_tool/logs?page=1&page_size=50" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

响应包含 `logs`、`total`、`page` 和 `page_size`。每条日志可以包含请求 ID、时间戳、模型、花费、总 Token 数以及一段输入片段。

## 策略执行

要启用策略执行，请在代理配置中添加工具策略防护栏：

```yaml
guardrails:
  - guardrail_name: "tool_policy"
    litellm_params:
      guardrail: tool_policy
      mode: post_call
```

该防护栏支持 `pre_call`、`post_call` 与 `during_call` 三种事件钩子。处理请求时，它从请求携带的 tools 中读取工具名称，tools 列表缺失时则从请求路由读取；处理响应时，它从响应的工具调用中读取工具名称。

当某个工具的 `input_policy: "blocked"` 生效，或它被团队级、密钥级覆盖屏蔽时，防护栏会抛出 HTTP 400。调用方可见的异常详情如下：

```json
{
  "detail": {
    "error": "Violated tool policy",
    "blocked_tools": ["example_tool"],
    "message": "Tool(s) ['example_tool'] are blocked by policy."
  }
}
```

当某个工具的 `input_policy: "trusted"` 生效，而对话中又包含 `output_policy: "untrusted"` 工具产生的输出时，防护栏同样会抛出 HTTP 400。详情中包含 `blocked_tools`、`untrusted_sources`，以及一条说明受信任输入工具要求受信任输入的消息。

HTTP 400 响应的结构如下：

```json
{
  "detail": {
    "error": "Violated tool policy",
    "blocked_tools": ["trusted_tool"],
    "untrusted_sources": ["untrusted_tool"],
    "message": "trusted_tool requires trusted input but conversation contains untrusted output from untrusted_tool."
  }
}
```

如果内存中的策略注册表尚未初始化，防护栏会直接返回输入，不应用工具策略。代理在加载工具数据库对象时会从数据库初始化注册表；注册表已初始化时，策略更新会让注册表重新同步。

## 配置

`TOOL_POLICY_CACHE_TTL_SECONDS` 是一个环境变量，默认值为 `60`。配置参考将其描述为缓存工具策略防护栏结果的 TTL 秒数：

```bash
export TOOL_POLICY_CACHE_TTL_SECONDS=60
```

完整的环境变量参考见 [代理配置设置](./config_settings)。

## 发现行为

工具在请求完成后异步注册，与记录花费的后台刷新同属一个批次，因此工具可能需要几秒钟才会出现在注册表中。工具名称来自 MCP 工具调用元数据、OpenAI 格式请求中的 `tools`、Anthropic Messages 请求中的 `tools`，以及响应中的工具调用。工具详情页的使用日志只包含模型实际调用了该工具的请求。
