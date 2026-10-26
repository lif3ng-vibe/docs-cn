# [测试版] OpenID Connect（OIDC）
LiteLLM 支持使用 OpenID Connect（OIDC）向上游服务进行身份认证，从而避免在配置文件中存放敏感凭据。

:::info

该功能目前处于 Beta 测试阶段。

:::


## OIDC 身份提供商（IdP）

LiteLLM 支持以下 OIDC 身份提供商（IdP）：

| 提供商                   | 配置名        | 支持自定义受众（custom audience） |
| -------------------------| ------------ | ---------------- |
| Google Cloud Run         | `google`     | Yes              |
| CircleCI v1              | `circleci`   | No               |
| CircleCI v2              | `circleci_v2`| No               |
| GitHub Actions           | `github`     | Yes              |
| Azure Kubernetes Service | `azure`      | No               |
| Azure AD                 | `azure`      | Yes              |
| 文件                     | `file`       | No               |
| 环境变量                 | `env`        | No               |
| 环境变量路径             | `env_path`   | No               |

如果想接入其他 OIDC 提供商，请在 GitHub 上提交 issue。

:::tip

在不确定自己在做什么、也确认过其他提供商都无法覆盖你的场景之前，请不要使用 `file`、`env` 或 `env_path` 提供商。提示：它们多半能满足你的需求。

:::

## OIDC 依赖方（RP）

LiteLLM 支持以下 OIDC 依赖方（Relying Party）/ 客户端：

- Amazon Bedrock
- Azure OpenAI
- _（即将支持）Google Cloud Vertex AI_


### 配置 OIDC

凡是能填密钥（secret key）的地方，都可以原位改用 OIDC。通用格式如下：

```
oidc/config_name_here/audience_here
```

对于不使用 `audience` 参数的提供商，可以（也应该）省略这一段：

```
oidc/config_name_here/
```

#### 非官方提供商（不推荐）

对于非官方的 `file` 提供商，可使用以下格式
（注意双斜杠；`oidc/file/` 之后的路径必须是绝对路径）：

```
oidc/file//var/run/secrets/my-token
```

出于安全考虑，解析后的路径必须落在允许的凭据目录内。默认允许以下目录：

- `/var/run/secrets`
- `/run/secrets`

如果你的部署把凭据挂载在其他位置，请将环境变量 `LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS` 设置为逗号分隔的绝对目录列表。该值会整体替换默认列表，如仍需默认目录，请一并写入：

```bash
export LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS="/var/run/secrets,/etc/litellm/creds"
```

符号链接和 `..` 一并解析后，若路径落在白名单之外，将被拒绝。

对于非官方的 `env`，可使用以下格式，其中 `SECRET_TOKEN` 是存放令牌的环境变量名：

```
oidc/env/SECRET_TOKEN
```

对于非官方的 `env_path`，可使用以下格式，其中 `SECRET_TOKEN` 是存放令牌文件路径的环境变量名：

```
oidc/env_path/SECRET_TOKEN
```

:::tip

如果你打算用 oidc/env_path/AZURE_FEDERATED_TOKEN_FILE，请别这么做。改用 `oidc/azure/` 即可，这样即使 Azure 日后调整 OIDC 配置或新增功能，也能持续获得 LiteLLM 的支持。

:::

## 示例

### Google Cloud Run -> Amazon Bedrock

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-west-2
      aws_session_name: "litellm"
      aws_role_name: "arn:aws:iam::YOUR_THING_HERE:role/litellm-google-demo"
      aws_web_identity_token: "oidc/google/https://example.com"
```

### CircleCI v2 -> Amazon Bedrock

```yaml
model_list:
  - model_name: command-r
    litellm_params:
      model: bedrock/cohere.command-r-v1:0
      aws_region_name: us-west-2
      aws_session_name: "my-test-session"
      aws_role_name: "arn:aws:iam::335785316107:role/litellm-github-unit-tests-circleci"
      aws_web_identity_token: "oidc/example-provider/"
```

#### CircleCI v2 -> Bedrock 的 Amazon IAM 角色配置

下面的配置仅作示例。请根据你的具体场景调整权限与信任关系。

权限：

```json keep-model-ids
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:*::foundation-model/cohere.command-r-v1:0"
            ]
        }
    ]
}
```

更多示例参见 https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html。

信任关系：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::335785316107:oidc-provider/oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd:aud": "c5a99188-154f-4f69-8da2-b442b1bf78dd"
                },
                "ForAnyValue:StringLike": {
                    "oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd:sub": [
                        "org/c5a99188-154f-4f69-8da2-b442b1bf78dd/project/*/user/*/vcs-origin/github.com/BerriAI/litellm/vcs-ref/refs/heads/main",
                        "org/c5a99188-154f-4f69-8da2-b442b1bf78dd/project/*/user/*/vcs-origin/github.com/BerriAI/litellm/vcs-ref/refs/heads/litellm_*"
                    ]
                }
            }
        }
    ]
}
```

该信任关系将 CircleCI 限制为只能在 main 分支以及以 `litellm_` 开头的分支上代入该角色。

对于 CircleCI（v1 和 v2），还需要在 AWS IAM 设置中添加你组织的 OIDC 提供商。更多信息参见 https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html。

:::tip

你_永远_不需要创建 IAM 用户。如果创建了，说明你没有正确使用 OIDC。你只需要创建一个带权限的角色，并与你的 OIDC 提供商建立信任关系。

:::


### Google Cloud Run -> Azure OpenAI

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      azure_ad_token: "oidc/google/https://example.com"
      api_version: "2024-06-01"
      api_base: "https://demo-here.openai.azure.com"
    model_info:
      base_model: azure/{{openai_large}}
```

对接 Azure OpenAI 时，需要在环境中定义 `AZURE_CLIENT_ID`、`AZURE_TENANT_ID`，以及可选的 `AZURE_AUTHORITY_HOST`。

```bash
export AZURE_CLIENT_ID="91a43c21-cf21-4f34-9085-331015ea4f91" # Azure AD Application (Client) ID
export AZURE_TENANT_ID="f3b1cf79-eba8-40c3-8120-cb26aca169c2" # Will be the same across of all your Azure AD applications
export AZURE_AUTHORITY_HOST="https://login.microsoftonline.com" # 👈 Optional, defaults to "https://login.microsoftonline.com"
```

:::tip

访问 `https://login.microsoftonline.com/YOUR_DOMAIN_HERE/v2.0/.well-known/openid-configuration`，在 `issuer` 字段中即可找到 `AZURE_CLIENT_ID`（即其中的 UUID）。

:::


:::tip

除非确需覆盖默认值，否则不要在环境中设置 `AZURE_AUTHORITY_HOST`。这样即使默认值日后有变，你也无需更新环境。

:::


:::tip

默认情况下，Azure AD 应用使用的受众（audience）为 `api://AzureADTokenExchange`。建议将其设置为更贴合你应用实际需求的值。

:::


#### Azure AD 应用配置

与 AWS 等其他 OIDC 依赖方相比，Azure 的配置要繁琐一些。大致步骤如下：

1. 创建 Azure 应用。
2. 为你使用的 OIDC IdP（如 Google Cloud Run）添加联合凭据（federated credential）。
3. 将该 Azure 应用加入包含 Azure OpenAI 资源的资源组。
4. 为该 Azure 应用授予访问 Azure OpenAI 资源所需的角色。

下面的自定义角色是 Azure 应用访问 Azure OpenAI 资源的推荐最小权限。请根据你的具体场景调整权限。

```json
{
    "id": "/subscriptions/24ebb700-ec2f-417f-afad-78fe15dcc91f/providers/Microsoft.Authorization/roleDefinitions/baf42808-99ff-466d-b9da-f95bb0422c5f",
    "properties": {
        "roleName": "invoke-only",
        "description": "",
        "assignableScopes": [
            "/subscriptions/24ebb700-ec2f-417f-afad-78fe15dcc91f/resourceGroups/your-openai-group-name"
        ],
        "permissions": [
            {
                "actions": [],
                "notActions": [],
                "dataActions": [
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/audio/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/search/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/chat/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/extensions/chat/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/embeddings/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/images/generations/action"
                ],
                "notDataActions": []
            }
        ]
    }
}
```

_注：你的 UUID 会与此不同。_

如需协助配置 Azure AD 应用，请联系我们获取付费企业版支持。

### Azure AD -> Amazon Bedrock
```yaml
model list:
  - model_name: aws/{{anthropic}}
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: "eu-central-1"
      aws_role_name: "arn:aws:iam::12345678:role/bedrock-role"
      aws_web_identity_token: "oidc/azure/api://123-456-789-9d04"
      aws_session_name: "litellm-session"
```
