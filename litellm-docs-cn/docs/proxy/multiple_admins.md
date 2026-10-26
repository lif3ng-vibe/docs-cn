import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';


# 审计日志

<Image
  img={require('../../img/release_notes/ui_audit_log.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


作为代理管理员（Proxy Admin），你可以查证某个实体（密钥、团队、用户、模型）是否以及何时被创建、更新、删除或重新生成，以及操作由谁执行。这对审计和合规非常有用。

LiteLLM 会追踪以下实体与操作：

- **实体**：密钥、团队、用户、模型
- **操作**：创建、更新、删除、重新生成

<EnterpriseFeature />

## 用法

### 1. 开启审计日志
持有企业版许可（enterprise license）时，审计日志默认开启，无需任何配置。其他套餐，或者你想显式指定时，可以在 litellm 的 config.yaml 中添加 `store_audit_logs`，然后启动代理。
```shell
litellm_settings:
  store_audit_logs: true
```

想在使用企业版许可时关闭审计日志，可以将其显式设置为 `false`，显式值优先于默认值。`LITELLM_STORE_AUDIT_LOGS` 环境变量的行为与该配置项一致，仅在配置未设置 `store_audit_logs` 时读取。

```shell
litellm_settings:
  store_audit_logs: false
```

### 2. 对实体做一次变更

本例中我们将删除一个密钥。

```shell
curl -X POST 'http://0.0.0.0:4000/key/delete' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
        "key": "d5265fc73296c8fea819b4525590c99beab8c707e465afdf60dab57e1fa145e4"
    }'
```

### 3. 在 LiteLLM UI 上查看审计日志

在 LiteLLM UI 中，导航到 Logs -> Audit Logs，即可看到这次密钥删除对应的审计日志。

<Image
  img={require('../../img/key_delete.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## 将审计日志导出到外部存储

除了存入数据库，你还可以把审计日志导出到外部存储后端（如 S3）。日志会分批异步上传，不会阻塞代理请求。

### S3 示例

在 `litellm_settings` 中添加 `audit_log_callbacks` 和 `s3_callback_params`：

```yaml
litellm_settings:
  store_audit_logs: true
  audit_log_callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: my-audit-logs-bucket     # AWS Bucket Name
    s3_region_name: us-west-2                # AWS Region
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: litellm-audit                   # [OPTIONAL] prefix path in the bucket
```

审计日志以 JSON 文件的形式写入：

```
s3://<bucket>/audit_logs/<YYYY-MM-DD>/<HH-MM-SS>_<audit-log-id>.json
# or, when s3_path is set:
s3://<bucket>/<s3_path>/audit_logs/<YYYY-MM-DD>/<HH-MM-SS>_<audit-log-id>.json
```

:::info

`audit_log_callbacks` 只在审计日志功能启用时才会触发；企业版许可下默认启用，其他情况则需要设置 `store_audit_logs: true`。

:::

### 将审计日志发送到单独的 S3 存储桶

如果你还通过 `callbacks: ["s3_v2"]` 将普通请求/响应日志发送到 S3，默认情况下两条日志流会共用 `s3_callback_params`，写入同一个存储桶。若想把审计日志发送到另一个存储桶（例如仅供合规使用、访问控制更严格或保留期更长的桶），可以添加一个 `s3_audit_callback_params` 配置块。它接受与 `s3_callback_params` 相同的字段，且只作用于审计日志。

```yaml
litellm_settings:
  store_audit_logs: true
  callbacks: ["s3_v2"]                       # normal request logs
  audit_log_callbacks: ["s3_v2"]             # audit logs

  s3_callback_params:                        # used for normal logs
    s3_bucket_name: my-llm-logs-bucket
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: litellm-logs

  s3_audit_callback_params:                  # used for audit logs only
    s3_bucket_name: my-audit-logs-bucket
    s3_region_name: us-east-1                # different region OK
    s3_aws_access_key_id: os.environ/AWS_AUDIT_ACCESS_KEY_ID  # different creds OK
    s3_aws_secret_access_key: os.environ/AWS_AUDIT_SECRET_ACCESS_KEY
    s3_path: litellm-audit
```

## 进阶

### 将管理操作归属到用户

以某个用户的名义调用管理端点，让审计日志把这次变更归属到该用户，而不是调用密钥的 `user_id`。（把代理接入你的开发平台时很有用。）

:::warning[v1.84.0 起需要显式启用]

v1.84.0 之前，`LiteLLM-Changed-By` 请求头会被无条件采纳，任何调用者都能借此改写审计归属。从 v1.84.0 起，除非调用密钥或其团队的元数据（metadata）中带有 `allow_litellm_changed_by_header: true`，否则代理会忽略该请求头；未启用时，`changed_by` 回退为调用密钥的 `user_id`。主密钥（master key）没有存储任何元数据，无法启用此选项，因此请改用管理员虚拟密钥（virtual key）来携带该请求头。

:::

#### 1. 允许管理员密钥设置该请求头

在将要发送该请求头的管理员虚拟密钥的元数据中设置 `allow_litellm_changed_by_header: true`。如果改为设置在该密钥所属团队的元数据上，则该团队下的所有密钥都会一并启用。

```shell
curl -X POST 'http://0.0.0.0:4000/key/update' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{
        "key": "sk-my-admin-key",
        "metadata": {"allow_litellm_changed_by_header": true}
    }'
```

#### 2. 在请求头中设置 `LiteLLM-Changed-By`

调用管理端点时，在请求头中设置 'user_id'。[查看完整列表](https://docs.litellm.ai/api-reference/#/team%20management)。

- 用已启用的管理员密钥更新团队预算。
- 把变更归属到 'krrish@berri.ai'。

**关键改动**：传入 `-H 'LiteLLM-Changed-By: krrish@berri.ai'`

```shell
curl -X POST 'http://0.0.0.0:4000/team/update' \
    -H 'Authorization: Bearer sk-my-admin-key' \
    -H 'LiteLLM-Changed-By: krrish@berri.ai' \
    -H 'Content-Type: application/json' \
    -d '{
        "team_id" : "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
        "max_budget": 2000
    }'
```

#### 3. 生成的审计日志

```bash
{
   "id": "bd136c28-edd0-4cb6-b963-f35464cf6f5a",
   "updated_at": "2024-06-08 23:41:14.793",
   "changed_by": "krrish@berri.ai", # 👈 CHANGED BY
   "changed_by_api_key": "example-api-key-123",
   "action": "updated",
   "table_name": "LiteLLM_TeamTable",
   "object_id": "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
   "before_value": {
     "spend": 0,
     "max_budget": 0,
   },
   "updated_values": {
     "team_id": "8bf18b11-7f52-4717-8e1f-7c65f9d01e52",
     "max_budget": 2000 # 👈 CHANGED TO
   },
 }
```

## 审计日志的 API 规范


### `id`
- **类型**：`String`
- **描述**：每条审计日志记录的唯一标识符，默认由系统自动生成为 UUID（Universally Unique Identifier，通用唯一标识符）。

### `updated_at`
- **类型**：`DateTime`
- **描述**：该字段记录审计日志条目创建或更新的时间戳，默认自动填入当前日期和时间。

### `changed_by`
- **类型**：`String`
- **描述**：执行被审计操作的 `user_id`。如果传入了 `LiteLLM-Changed-By` 请求头，且调用密钥或其团队的元数据中带有 `allow_litellm_changed_by_header: true`，则为 `changed_by=<value passed for LiteLLM-Changed-By header>`。

### `changed_by_api_key`
- **类型**：`String`
- **描述**：该字段存储执行被审计操作时所使用的哈希后 API 密钥。若留空，默认为空字符串。

### `action`
- **类型**：`String`
- **描述**：所执行操作的类型，取值为 "create"、"update" 或 "delete" 之一。

### `table_name`
- **类型**：`String`
- **描述**：该字段存储被审计操作影响的表名，取值为 `LiteLLM_TeamTable`、`LiteLLM_UserTable`、`LiteLLM_VerificationToken` 之一。


### `object_id`
- **类型**：`String`
- **描述**：该字段存储被审计操作影响的对象 ID，可以是密钥 ID、团队 ID 或用户 ID。

### `before_value`
- **类型**：`Json?`
- **描述**：该字段存储执行被审计操作之前该行的值。该字段可选，可以为 null。

### `updated_values`
- **类型**：`Json?`
- **描述**：该字段存储执行被审计操作后该行被更新的值。
