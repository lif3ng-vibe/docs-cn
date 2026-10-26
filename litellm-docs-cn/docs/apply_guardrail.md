import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /guardrails/apply_guardrail

通过这个端点，可以直接调用 LiteLLM 实例上已配置的防护栏（guardrail）。如果你的某些服务需要直接调用某个防护栏，这个端点会非常有用。

## 支持的防护栏类型

此端点支持多种防护栏类型，包括：
- **Presidio**：PII（个人身份信息）检测与脱敏
- **Bedrock**：AWS Bedrock 防护栏，用于内容审核
- **Lakera**：AI 安全防护栏
- **PANW Prisma AIRS**：威胁检测、DLP（数据防泄露）与策略执行
- **自定义防护栏**：用户自定义的防护栏

## 配置

### Bedrock 防护栏配置

要在 apply_guardrail 端点中使用 Bedrock 防护栏，请先在 LiteLLM 的 config.yaml 中配置该防护栏：

```yaml
guardrails:
  - guardrail_name: "bedrock-content-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"
      guardrailIdentifier: "your-guardrail-id"  # Your actual Bedrock guardrail ID
      guardrailVersion: "DRAFT"  # or your version number
      aws_region_name: "us-east-1"  # Your AWS region
      aws_role_name: "your-role-arn"  # Your AWS role with Bedrock permissions
      default_on: true
```

**AWS 必要配置**：
1. 在 AWS 控制台中创建一个 Bedrock 防护栏
2. 获取防护栏的 ID 与版本号
3. 确保你的 AWS 凭证具备 Bedrock 权限
4. 在 LiteLLM 配置文件中配置该防护栏


## 用法
---

<Tabs>
<TabItem value="presidio" label="Presidio PII 防护栏" default>

本示例中，`mask_pii` 是配置在 LiteLLM 上的一个 Presidio 防护栏。

```bash showLineNumbers title="调用该端点的示例"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}'
```

</TabItem>
<TabItem value="bedrock" label="Bedrock 防护栏">

本示例中，`bedrock-content-guard` 是配置在 LiteLLM 上的一个 Bedrock 防护栏。

```bash showLineNumbers title="调用该端点的示例"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "bedrock-content-guard",
    "text": "This is potentially harmful content that should be blocked",
    "language": "en"
}'
```

**注意**：对 Bedrock 防护栏来说，`entities` 参数不会用到，内容审核由 Bedrock 按自身策略处理。

</TabItem>
<TabItem value="custom" label="带 metadata 的自定义防护栏">

参数化的自定义防护栏会从 `request_data["metadata"]` 读取按请求传入的配置。在请求体中附上可选的 `metadata` 字段，它就会被转发给你防护栏的 `apply_guardrail` 方法。本示例中，`my-topic-guardrail` 是一个自定义防护栏，会拦截提到 `metadata` 中所传 `forbidden_topics` 里任意话题的文本。

```bash showLineNumbers title="调用该端点的示例"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "my-topic-guardrail",
    "text": "What are tax loopholes?",
    "metadata": {
        "forbidden_topics": ["tax", "finance"]
    }
}'
```

`metadata` 只在客户端发送时才会被转发，因此不依赖按请求配置的防护栏在省略该字段时行为保持不变。

</TabItem>
</Tabs>

## 从管理界面测试
---

在管理界面（Admin UI）的防护栏测试 Playground（`Guardrails` -> `Test Playground`）中，输入文本下方提供了一个可选的 **Metadata** 字段。填入一个 JSON 对象，它就会作为请求中的 `metadata` 字段一并发送，让你无需离开仪表板即可调试参数化自定义防护栏。如果 JSON 格式无效，请求发出前就会被直接拒绝。

## 请求格式
---

请求体应符合 ApplyGuardrailRequest 格式。

#### 请求体示例

```json
{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}
```

#### 必填字段
- **guardrail_name**（string）：  
  要应用的防护栏标识符（例如 "mask_pii"）。
- **text**（string）：  
  要经过防护栏处理的输入文本。

#### 可选字段
- **language**（string）：  
  输入文本的语言（例如 "en" 表示英语）。
- **entities**（array of strings）：  
  要处理或筛选的特定实体（例如 ["NAME", "EMAIL"]）。
- **metadata**（object）：  
  按请求传入的配置，会以 `request_data["metadata"]` 的形式转发给防护栏。覆写了 `apply_guardrail` 的自定义防护栏需自行读取该字段。仅在有值时才转发，因此省略它不影响现有行为。

## 响应格式
---

响应中会包含应用防护栏后处理完成的文本。

#### 响应示例

<Tabs>
<TabItem value="presidio" label="Presidio 响应" default>

```json
{
    "response_text": "My name is [REDACTED] and my email is [REDACTED]"
}
```

</TabItem>
<TabItem value="bedrock" label="Bedrock 响应">

```json
{
    "response_text": "This is potentially harmful content that should be blocked"
}
```

**注意**：如果 Bedrock 防护栏拦截了内容，端点会返回错误并附上拦截原因。

</TabItem>
</Tabs>

#### 响应字段
- **response_text**（string）：  
  应用防护栏之后的文本。

#### 错误响应

如果防护栏拦截了内容（例如 Bedrock 防护栏），端点会返回如下错误：

```json
{
    "detail": "Content blocked by Bedrock guardrail: Content violates policy"
}
```
