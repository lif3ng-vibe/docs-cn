Audit Logs | 审计日志 | 审计日志
Usage | 用法 | 用法
1. Switch on audit Logs | 1. 开启审计日志 | 1-开启审计日志
2. Make a change to an entity | 2. 对实体做一次变更 | 2-对实体做一次变更
3. View the audit log on LiteLLM UI | 3. 在 LiteLLM UI 上查看审计日志 | 3-在-litellm-ui-上查看审计日志
Export Audit Logs to External Storage | 将审计日志导出到外部存储 | 将审计日志导出到外部存储
S3 Example | S3 示例 | s3-示例
Send Audit Logs to a Separate S3 Bucket | 将审计日志发送到单独的 S3 存储桶 | 将审计日志发送到单独的-s3-存储桶
Advanced | 进阶 | 进阶
Attribute Management changes to Users | 将管理操作归属到用户 | 将管理操作归属到用户
1. Allow your admin key to set the header | 1. 允许管理员密钥设置该请求头 | 1-允许管理员密钥设置该请求头
2. Set `LiteLLM-Changed-By` in request headers | 2. 在请求头中设置 `LiteLLM-Changed-By` | 2-在请求头中设置-litellm-changed-by
3. Emitted Audit Log | 3. 生成的审计日志 | 3-生成的审计日志
API SPEC of Audit Log | 审计日志的 API 规范 | 审计日志的-api-规范
`id` | `id` | id
`updated_at` | `updated_at` | updated_at
`changed_by` | `changed_by` | changed_by
`changed_by_api_key` | `changed_by_api_key` | changed_by_api_key
`action` | `action` | action
`table_name` | `table_name` | table_name
`object_id` | `object_id` | object_id
`before_value` | `before_value` | before_value
`updated_values` | `updated_values` | updated_values
