
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# UI 日志入门

查看发往 LiteLLM 的每个请求的花费、Token 用量、密钥与团队名称


<Image img={require('../../img/ui_request_logs.png')}/>


## 概览

| 日志类型 | 默认是否追踪 |
|----------|-------------------|
| 成功日志 | ✅ 是 |
| 错误日志 | ✅ 是 |
| 请求/响应内容存储 | ❌ 默认否，**可通过 `store_prompts_in_spend_logs` 开启** |



**默认情况下，LiteLLM 不会记录请求与响应的内容**。

## 在日志页面追踪请求与响应内容

如果你想在 LiteLLM 日志中查看请求与响应内容，可以在以下任意一处开启：

- **从 UI 开启**（无需重启）：使用 [UI 花费日志设置](./ui_spend_log_settings.md)，打开 Logs → Settings，启用 "Store Prompts in Spend Logs" 后保存。立即生效，并优先于配置文件。
- **从配置开启**：在 `proxy_config.yaml` 中加入以下内容（需重启）：

```yaml
general_settings:
  store_prompts_in_spend_logs: true
```

<Image img={require('../../img/ui_request_logs_content.png')}/>

## 追踪工具调用

查看对话补全（completion）请求中提供了哪些工具、哪些被实际调用。

<Image img={require('../../img/ui_tools.png')}/>

**示例**：发起一个携带工具的补全请求：

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "What is the weather?"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            }
          }
        }
      }
    ]
  }'
```

打开 Logs 页面，即可看到提供的全部工具以及哪些被实际调用。

## 停止在数据库中存储错误日志

如果不想把错误日志存入数据库，可以通过以下设置关闭：

```yaml
general_settings:
  disable_error_logs: True   # Only disable writing error logs to DB, regular spend logs will still be written unless `disable_spend_logs: True`
```

## 停止在数据库中存储花费日志

如果不想把花费日志（spend logs）存入数据库，可以通过以下设置关闭：

```yaml
general_settings:
  disable_spend_logs: True   # Disable writing spend logs to DB
```

## 选择存储哪些元数据字段

每一行 `LiteLLM_SpendLogs` 都带有一个 `metadata` JSON 列，其中大部分内容通常是 `model_map_information`，即被复制进每一行的模型成本映射条目（约 7 KB）。可以用 `spend_logs_metadata_fields` 选择该列中哪些顶层键写入数据库。`include` 与 `exclude` 只能设置其中一个

```yaml
general_settings:
  spend_logs_metadata_fields:
    exclude:
      - model_map_information
```

```yaml
general_settings:
  spend_logs_metadata_fields:
    include:
      - user_api_key_alias
      - usage_object
      - cost_breakdown
```

不设置该项时默认写入全部键。同时设置两个列表、两个都不设、给出不属于 `LiteLLM_SpendLogs.metadata` 字段的键名，或使用 `usage_object.cache_read_input_tokens` 这类点分路径，都会让代理在启动时直接报错退出。`status` 与 `cold_storage_object_key` 始终写入，无法排除。该设置也支持免重启修改：通过 `POST /config/field/update` 接口携带 `config_type: general_settings`，接口会以 400 拒绝同样的非法值

这一过滤只作用于实际存储的行。每日花费统计表、预算以及日志回调仍会拿到全部键。`proxy_server_request` 与 `response` 两列不受影响，仍由 `store_prompts_in_spend_logs` 控制。修改前写入的行会保留原有元数据，直到被[保留期清理](#自动删除旧的花费日志)删除；Postgres 也只有在执行 `VACUUM FULL` 或 `pg_repack` 后才会真正归还磁盘空间

有些键会从存储的行中回读，缺失这些键时，受影响行的下列功能将不可用

| 键 | 缺失后失效的功能 |
|---|---|
| `model_map_information` | 没有功能会从存储行读取它 |
| `usage_object`, `cost_breakdown` | 日志抽屉中的成本明细与提示词缓存页面 |
| `error_information` | `/spend/logs` 上的错误码与错误信息筛选，以及日志抽屉中的错误详情 |
| `user_api_key_alias` | Logs 页面与 `/spend/logs/ui` 上的密钥别名筛选 |
| `user_api_key_team_id`, `user_api_key_user_id` | 从花费日志中找回已删除密钥所属的团队和用户 |
| `guardrail_information` | 日志抽屉中的防护栏（guardrails）面板与压缩节省信息 |
| `used_client_oauth_token` | `/spend/logs` 上的 OAuth token 筛选 |

## 自动删除旧的花费日志

如果你在存储花费日志，定期删除旧数据有助于保持数据库的性能。

保留期同样可以在以下任意一处设置：

- **从 UI 设置**（无需重启）：打开 [UI 花费日志设置](./ui_spend_log_settings.md)，进入 Logs → Settings，设置 Retention Period 后保存。
- **从配置设置**：在 `proxy_config.yaml` 中加入以下内容（需重启）：

```yaml
general_settings:
  maximum_spend_logs_retention_period: "7d"  # Delete logs older than 7 days

  # Optional: how often to run cleanup
  maximum_spend_logs_retention_interval: "1d"  # Run once per day
```

只有设置了保留期才会执行清理。每次清理受到三重限制：单条语句删除的行数、每张表执行的语句数，以及整轮清理的挂钟时间预算。默认值为每条语句 1000 行、每张表 500 条语句、总时长 5 分钟。触及上限的清理会就地停止，并在下一轮从同一截断点继续，因此大量积压会分多轮逐步清理完毕

完整的配置项、默认调度周期以及大表场景的建议，参见 [花费日志删除](../proxy/spend_logs_deletion)


## 记录了哪些内容？

[这里有一份 schema](https://github.com/BerriAI/litellm/blob/1cdd4065a645021aea931afb9494e7694b4ec64b/schema.prisma#L285)，说明具体记录了哪些内容。
