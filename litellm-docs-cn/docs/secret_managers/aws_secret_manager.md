import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Secret Manager

<EnterpriseFeature />

将代理服务器的密钥存放在 AWS Secret Manager 中。

| 功能 | 支持情况 | 说明 |
|---------|----------|-------------|
| 读取密钥 | ✅ | 读取密钥，例如 `OPENAI_API_KEY` |
| 写入密钥 | ✅ | 存储密钥，例如 `Virtual Keys` |

## 代理用法

1. 在环境中保存 AWS 凭证
```bash
os.environ["AWS_ACCESS_KEY_ID"] = ""  # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = "" # Secret access key
os.environ["AWS_REGION_NAME"] = "" # us-east-1, us-east-2, us-west-1, us-west-2
```

2. 在配置中启用 AWS Secret Manager。

<Tabs>
<TabItem value="read_only" label="从 AWS Secret Manager 读取密钥">

```yaml
general_settings:
  master_key: os.environ/litellm_master_key 
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    hosted_keys: ["litellm_master_key"] # 👈 Specify which env keys you stored on AWS 

```

</TabItem>

<TabItem value="write_only" label="将虚拟密钥写入 AWS Secret Manager">

此模式只会将虚拟密钥存入 AWS Secret Manager，不会从 AWS Secret Manager 读取任何密钥。

```yaml
general_settings:
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "write_only" # Literal["read_only", "write_only", "read_and_write"]
    description: "litellm virtual key" # OPTIONAL, if set will set this as the description for all virtual keys
    tags: # OPTIONAL, if set will set this as the tags for all virtual keys
      Environment: "Prod"
      Owner: "AI Platform team"
    kms_key_id: "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555" # OPTIONAL, customer-managed KMS key used to encrypt stored virtual keys
```
</TabItem>
<TabItem value="read_and_write" label="通过 AWS Secret Manager 读取并写入密钥">

```yaml
general_settings:
  master_key: os.environ/litellm_master_key 
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
    hosted_keys: ["litellm_master_key"] # OPTIONAL. Specify which env keys you stored on AWS
```

</TabItem>
</Tabs>

3. 启动代理服务器

```bash
litellm --config /path/to/config.yaml
```

## 使用客户托管 KMS 密钥加密虚拟密钥

默认情况下，LiteLLM 在 AWS Secrets Manager 中创建的密钥（secret）会使用 AWS 托管的 `aws/secretsmanager` 密钥加密。将 `kms_key_id` 设置为某个 KMS 密钥的 ID、别名或 ARN，即可改用你自己的客户托管密钥（CMK）来加密。该值会在每次 `CreateSecret` 调用时作为 `KmsKeyId` 传入，因此只对设置生效后新建的密钥起作用；已有密钥仍沿用当前的加密密钥。

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    kms_key_id: "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555"
```

除了 Secrets Manager 权限之外，代理所用的 IAM 身份还需要对该密钥拥有 `kms:GenerateDataKey` 和 `kms:Decrypt` 权限。可以用 `aws secretsmanager describe-secret --secret-id litellm/<key_alias>` 确认新密钥是否已生效；返回结果中的 `KmsKeyId` 应与所配置的密钥一致。

## 在单个 AWS Secret 中使用键值对

通过 `primary_secret_name` 参数，可以从单个 AWS Secret 中读取多个密钥：

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    hosted_keys: [
      "OPENAI_API_KEY_MODEL_1",
      "OPENAI_API_KEY_MODEL_2",
    ]
    primary_secret_name: "litellm_secrets" # 👈 Read multiple keys from one JSON secret
```

借助 `primary_secret_name`，你可以以 JSON 对象的形式从单个 AWS Secret 中读取多个密钥。例如，"litellm_secrets" 的内容如下：

```json
{
  "OPENAI_API_KEY_MODEL_1": "sk-key1...",
  "OPENAI_API_KEY_MODEL_2": "sk-key2..."
}
```

这样可以减少需要管理的 AWS Secret 数量。

## 担任 IAM 角色

为了更高的安全性，可以用 IAM 角色代替静态 AWS 凭证。

### 基本 IAM 角色

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::123456789012:role/LiteLLMSecretManagerRole"
    aws_session_name: "litellm-session"
```

### 跨账户访问

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::999999999999:role/CrossAccountRole"
    aws_external_id: "unique-external-id"
```

### 配合 IRSA 使用 EKS

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::123456789012:role/LiteLLMServiceAccountRole"
    aws_web_identity_token: "os.environ/AWS_WEB_IDENTITY_TOKEN_FILE"
```

### 配置参数

| 参数 | 说明 |
|-----------|-------------|
| `aws_region_name` | AWS 区域 |
| `aws_role_name` | 要担任的 IAM 角色 ARN |
| `aws_session_name` | 会话名称（可选） |
| `aws_external_id` | 跨账户访问使用的外部 ID（External ID） |
| `aws_profile_name` | 来自 `~/.aws/credentials` 的 AWS 配置档案（profile） |
| `aws_web_identity_token` | IRSA 使用的 OIDC 令牌路径 |
| `aws_sts_endpoint` | VPC 场景下自定义的 STS 端点 |
| `kms_key_id` | 用于加密 LiteLLM 所创建密钥的客户托管 KMS 密钥（ID、别名或 ARN） |

