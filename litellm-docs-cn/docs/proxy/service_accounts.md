import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 服务账号

如果你想创建的虚拟密钥（virtual key）不归属于特定用户，而是为生产项目准备的，就可以使用服务账号（service account）。

为什么要使用服务账号密钥？
  - 用户被删除时，密钥不会被连带删除。
  - 密钥适用的是团队限额，而不是团队成员限额。

## 服务账号与普通密钥的区别

| 特性 | 普通密钥 | 服务账号密钥 |
|---------|------------|-------------------|
| `user_id` | 可选 | 始终为 `null` |
| `team_id` | 可选 | 必填 |
| 生效的限额 | 用户 + 团队限额 | 仅团队限额 |
| 用户被删除时密钥也会被删除吗？ | 会 | 不会，会一直保留 |
| `metadata` 中的 `service_account_id` | 不设置 | 一经设置不可更改 |
| `team_member_key_duration` | 继承 | 不继承 |

## 预算与限制

服务账号密钥的预算与速率限制（rate limit）都在**团队层级**生效，不按用户或密钥成员单独计算。

- 在密钥本身上设置 `max_budget`、`tpm_limit`、`rpm_limit`，或者从团队继承这些配置。
- `team_member_key_duration` 是一个企业版功能，用于控制团队成员密钥的有效期，它对服务账号密钥**不**生效。

## 用法

使用 `/key/service-account/generate` 端点生成服务账号密钥。


```bash
curl -L -X POST 'http://localhost:4000/key/service-account/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "my-unique-team"
}'
```

### `service_account_id` 字段

你可以在 `metadata` 中传入可选的 `service_account_id`，为密钥指定一个稳定且易读的标识符：

```bash
curl -L -X POST 'http://localhost:4000/key/service-account/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "my-unique-team",
    "metadata": {
        "service_account_id": "my-ci-pipeline"
    }
}'
```

**不可变规则**。`service_account_id` 一经设置便无法更改：

| 操作 | 结果 |
|-----------|--------|
| 覆盖为其他值 | `400` 错误 |
| 显式设置为 `null` | `400` 错误 |
| 传入 `metadata: null`（会清空该值） | `400` 错误 |
| 更新时完全不传 `metadata` | 安全，现有值会保留 |
| 重复发送相同的值 | 允许（不产生任何变更） |

## 示例：要求所有服务账号请求都带 `user` 参数


### 1. 设置服务账号配置

如果你想创建一组仅对服务账号密钥生效的配置，请设置 `service_account_settings`

```yaml
general_settings:
    service_account_settings: 
        enforced_params: ["user"] # this means the "user" param is enforced for all requests made through any service account keys
```

### 2. 在 LiteLLM 管理界面（Admin UI）创建服务账号密钥

<Image img={require('../../img/create_service_account.png')} />

### 3. 测试服务账号密钥

<Tabs>

<TabItem value="Unsuccessful call" label="调用失败">


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer <sk-your-service-account>' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "hello"
        }
    ]
}'
```

预期响应

```json
{
  "error": {
    "message": "BadRequest please pass param=user in request body. This is a required param for service account",
    "type": "bad_request_error",
    "param": "user",
    "code": "400"
  }
}
```

</TabItem>

<TabItem value="Successful call" label="调用成功">


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer <sk-your-service-account>' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "hello"
        }
    ],
    "user": "test-user"
}'
```

预期响应

```json
{
  "id": "chatcmpl-ad9595c7e3784a6783b469218d92d95c",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "\n\nHello there, how may I assist you today?",
        "role": "assistant",
        "tool_calls": null,
        "function_call": null
      }
    }
  ],
  "created": 1677652288,
  "model": "{{openai_small}}",
  "object": "chat.completion",
  "system_fingerprint": "fp_44709d6fcb",
  "usage": {
    "completion_tokens": 12,
    "prompt_tokens": 9,
    "total_tokens": 21,
    "completion_tokens_details": null
  },
  "service_tier": null
}
```

</TabItem>

</Tabs>
