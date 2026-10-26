import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP - AWS SigV4 认证

使用 AWS SigV4 认证，将 LiteLLM 连接到托管在 [AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/latest/userguide/agentcore.html) 上的 MCP 服务器。

## 为什么用 SigV4？

AWS 服务使用 [Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) 对请求做身份验证。这是一种逐请求签名协议，会把请求体一并纳入加密签名。它的工作方式不同于静态请求头类的认证类型（`api_key`、`bearer_token` 等），后者在每个请求中都发送相同的请求头。

LiteLLM 的 `aws_sigv4` 认证类型会自动处理这一切：每个发往外部的 MCP 请求在发出前都会用你的 AWS 凭证完成签名。

## 快速上手

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

1. 进入 **MCP Servers** 页面，点击 **Add New MCP Server**
2. 将传输方式设置为 **Streamable HTTP**
3. 认证类型选择 **AWS SigV4**
4. 填写你的 AWS 凭证：

<Image
  img={require('../img/mcp_aws_sigv4_ui.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| **AWS 区域** | 是 | 用于 SigV4 签名的 AWS 区域（如 `us-east-1`） |
| **AWS 服务名称** | 否 | 默认为 `bedrock-agentcore` |
| **AWS 访问密钥 ID（Access Key ID）** | 否 | 留空时回退到 boto3 凭证链 |
| **AWS 私有访问密钥（Secret Access Key）** | 否 | 填写了访问密钥 ID 时必填 |
| **AWS 会话令牌（Session Token）** | 否 | 仅使用临时 STS 凭证时需要 |
| **AWS 角色 ARN** | 否 | 用于 STS AssumeRole 的 IAM 角色 ARN（如 `arn:aws:iam::123456789012:role/MyRole`）。设置后，LiteLLM 会在签名前先代入该角色 |
| **AWS 会话名称** | 否 | AssumeRole 调用的会话名称，会记录在 CloudTrail 中。省略时自动生成 |

创建完成后，LiteLLM 会用 SigV4 签名每个发往外部的 MCP 请求。该服务器的工具会自动出现在 MCP Tools 列表中。

**编辑凭证**：编辑已有的 SigV4 服务器时，凭证字段留空即表示保留当前值，只有实际填写的字段才会被更新。

</TabItem>
<TabItem value="config" label="config.yaml">

### 1. 设置 AWS 凭证

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION_NAME="us-east-1"
```

### 2. 将 AgentCore MCP 服务器添加到 config.yaml

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN          # IAM role to assume (recommended)
    aws_session_name: "litellm-prod"                 # optional — for CloudTrail auditing
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

:::info[URL 编码]

AgentCore runtime 的 ARN 在 `url` 字段中必须经过 URL 编码。例如：

```
arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/my-mcp-server
```

编码后为：

```
arn%3Aaws%3Abedrock-agentcore%3Aus-east-1%3A123456789012%3Aruntime%2Fmy-mcp-server
```

:::

### 3. 启动代理

```bash
litellm --config config.yaml
```

</TabItem>
</Tabs>

## 使用 MCP 工具

配置完成后，你的 AgentCore MCP 工具即可通过 LiteLLM 使用，与其他 MCP 服务器没有区别：

```bash title="列出可用工具"
curl http://localhost:4000/mcp-rest/tools/list \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```bash title="调用工具"
curl http://localhost:4000/mcp-rest/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "server_id": "my_agentcore_mcp",
    "name": "my_agentcore_mcp-your_tool_name",
    "arguments": {"key": "value"}
  }'
```

工具命名规则、`server_id` 格式与常见错误，参见 [MCP REST API](./mcp_rest_api.md)。

## 配置参考

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `url` | 是 | AgentCore MCP 服务器 URL（ARN 需 URL 编码） |
| `transport` | 是 | 必须为 `"http"` |
| `auth_type` | 是 | 必须为 `"aws_sigv4"` |
| `aws_access_key_id` | 否 | AWS 访问密钥。支持 `os.environ/VAR_NAME`。省略时回退到 boto3 凭证链 |
| `aws_secret_access_key` | 否 | AWS 私有访问密钥。支持 `os.environ/VAR_NAME`。省略时回退到 boto3 凭证链 |
| `aws_region_name` | 是 | AWS 区域（如 `us-east-1`） |
| `aws_service_name` | 否 | 用于签名的 AWS 服务名称。默认为 `bedrock-agentcore` |
| `aws_session_token` | 否 | 临时凭证使用的 AWS 会话令牌。支持 `os.environ/VAR_NAME` |
| `aws_role_name` | 否 | 用于 STS AssumeRole 的 IAM 角色 ARN。支持 `os.environ/VAR_NAME`。设置后，LiteLLM 会在签名前调用 `sts:AssumeRole` 获取临时凭证 |
| `aws_session_name` | 否 | AssumeRole 调用的会话名称（会记录在 CloudTrail 中）。省略时自动生成。支持 `os.environ/VAR_NAME` |

## 工作原理

LiteLLM 使用一个 `httpx.Auth` 子类（`MCPSigV4Auth`）挂入 HTTP 请求生命周期：

1. 对每个发往外部的 MCP 请求，认证处理器先计算请求体的 SHA-256 哈希
2. 用你的 AWS 凭证、请求 URL、请求头和请求体哈希生成 SigV4 签名
3. 将签名后的 `Authorization` 和 `x-amz-date` 请求头附加到请求上
4. AWS 校验签名并处理该 MCP 请求

整个过程自动完成，无需手动管理令牌。

## 使用临时凭证（STS）

如果你使用 AWS STS 临时凭证（例如来自 IAM 角色或 SSO），需要一并配置会话令牌：

```yaml title="config.yaml（使用 STS 凭证）" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_session_token: os.environ/AWS_SESSION_TOKEN
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

## 使用 IAM 角色代入（AssumeRole）

在生产环境中，如果你的 LiteLLM 实例通过 IAM 角色完成认证（例如 EKS 的 Pod 角色、EC2 实例配置文件），可以配置 `aws_role_name`，让 LiteLLM 在签名 MCP 请求前先调用 `sts:AssumeRole`：

```yaml title="config.yaml（使用 AssumeRole）" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: "arn:aws:iam::123456789012:role/BedrockAgentCoreRole"
    aws_session_name: "litellm-prod"    # optional
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

LiteLLM 会使用环境中的既有凭证（Pod 角色、实例配置文件或环境变量）调用 `sts:AssumeRole`，然后用代入角色的临时凭证签署 MCP 请求。

`aws_role_name` 也可以与显式的访问密钥组合使用，此时这些密钥会作为 AssumeRole 调用的源身份：

```yaml title="config.yaml（AssumeRole + 显式源密钥）" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_region_name: "us-east-1"
```

:::tip
对大多数 Kubernetes 部署来说，只需要 `aws_role_name` 和 `aws_region_name`；Pod 的 IAM 角色会自动提供源凭证。
:::

## 故障排查

### AWS 返回 403 Forbidden

- 确认 AWS 凭证有效且未过期
- 检查 `aws_region_name` 是否与 AgentCore URL 中的区域一致
- 确认 `aws_service_name` 已设置为 `bedrock-agentcore`
- 如果使用 STS 凭证，确认 `aws_session_token` 已设置且未过期

### AssumeRole 报 AccessDenied

如果使用 `aws_role_name` 时收到 `AccessDenied`：

- 确认角色 ARN 正确
- 检查目标角色的信任策略是否允许你的源身份代入该角色
- 如果运行在 EKS 上，确认 Pod 的 service account 已注解了正确的 IAM 角色
- 在 CloudTrail 中查找失败的 `sts:AssumeRole` 调用，查看具体报错

### 启动时的健康检查报错

带 SigV4 认证的 MCP 服务器会跳过代理启动时的标准健康检查。这是预期行为，调用工具时代理仍会正确签名请求。

### "botocore not found" 错误

安装 `botocore` 包：

```bash
uv add botocore
```

`botocore` 用于 SigV4 凭证处理，使用 `aws_sigv4` 认证时必须安装。
