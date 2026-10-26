import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 团队/项目级凭据路由

根据发起请求的团队或项目，把同一个模型路由到不同的 LLM 提供商端点（例如不同的 Azure 实例）。

## 概览

在多租户部署中，不同团队常常需要用同一个模型名（例如 `{{openai_large}}`）请求不同的提供商端点，比如各业务单元使用独立的 Azure OpenAI 实例，以实现成本隔离、数据驻留或限流隔离。

凭据路由（credential routing）让你在团队/项目的元数据中完成这一配置，直接复用现有的[凭据表](./model_management.md#可复用的提供商凭据)，无需重复定义模型，也不必为每个团队单独建模型组。

```
Hotel Team → {{openai_large}} → https://hotel-eastus.openai.azure.com/
Flight Team → {{openai_large}} → https://flight-centralus.openai.azure.com/
```

### 优先级链

请求进来时，系统会按这条优先级链逐级匹配（先命中先用）：

1. **客户端凭据**：请求体中传入的 `api_base`/`api_key`（[文档](./clientside_auth.md)）
2. **项目级模型专属配置**：在项目的 `model_config` 中为该模型单独设置的覆盖项
3. **项目默认配置**：项目 `model_config` 中的 `defaultconfig`
4. **团队级模型专属配置**：在团队的 `model_config` 中为该模型单独设置的覆盖项
5. **团队默认配置**：团队 `model_config` 中的 `defaultconfig`
6. **部署默认配置**：`config.yaml` 中为该模型配置的 `litellm_params`

## 快速上手

### 第 1 步：创建凭据

把 Azure 端点的凭据存入凭据表，可以通过 [UI](./model_management.md#可复用的提供商凭据) 或 API 操作：

```bash showLineNumbers
# Create credential for Hotel team's Azure endpoint
curl -X POST 'http://0.0.0.0:4000/credentials' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "credential_name": "hotel-azure-eastus",
    "credential_values": {
        "api_base": "https://hotel-eastus.openai.azure.com/",
        "api_key": "sk-azure-hotel-key-xxx"
    }
}'
```

```bash showLineNumbers
# Create credential for Flight team's Azure endpoint
curl -X POST 'http://0.0.0.0:4000/credentials' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "credential_name": "flight-azure-centralus",
    "credential_values": {
        "api_base": "https://flight-centralus.openai.azure.com/",
        "api_key": "sk-azure-flight-key-xxx"
    }
}'
```

### 第 2 步：在团队上设置 `model_config`

在团队的 metadata 中加入 `model_config` 键，按名称引用对应凭据：

```bash showLineNumbers
# Hotel team — default Azure endpoint for all models
curl -X POST 'http://0.0.0.0:4000/team/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "hotel-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-azure-eastus"
                }
            }
        }
    }
}'
```

```bash showLineNumbers
# Flight team — default Azure endpoint for all models
curl -X POST 'http://0.0.0.0:4000/team/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "flight-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "flight-azure-centralus"
                }
            }
        }
    }
}'
```

### 第 3 步：发起请求

请求会根据 API 密钥所属的团队，自动路由到正确的 Azure 端点：

```bash showLineNumbers
# Request using Hotel team's API key → routes to hotel-eastus.openai.azure.com
curl http://localhost:4000/v1/chat/completions \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-hotel-team-key' \
-d '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "Hello"}]}'

# Request using Flight team's API key → routes to flight-centralus.openai.azure.com
curl http://localhost:4000/v1/chat/completions \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-flight-team-key' \
-d '{"model": "{{openai_large}}", "messages": [{"role": "user", "content": "Hello"}]}'
```

## 按模型覆盖

可以为特定模型设置不同的凭据，其余模型仍走默认凭据：

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/team/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "hotel-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-azure-eastus"
                }
            },
            "{{openai_large}}": {
                "azure": {
                    "litellm_credentials": "hotel-azure-westus"
                }
            }
        }
    }
}'
```

按这份配置：
- `{{openai_large}}` 的请求 → 使用 `hotel-azure-westus` 凭据（模型专属）
- 其余所有模型 → 使用 `hotel-azure-eastus` 凭据（默认）

## 项目级覆盖

项目会继承所属团队的 `model_config`，但可以在项目级覆盖；项目覆盖的优先级高于团队覆盖。

```bash showLineNumbers
# Project overrides the team default for all models
curl -X POST 'http://0.0.0.0:4000/project/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "project_id": "hotel-rec-app-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-rec-azure"
                }
            },
            "gpt-4-vision": {
                "azure": {
                    "litellm_credentials": "hotel-rec-vision"
                }
            }
        }
    }
}'
```

### 完整示例：含两个项目的酒店团队

**初始配置**：
- **酒店团队**：默认 `hotel-azure-eastus`，`{{openai_large}}` 覆盖为 `hotel-azure-westus`
- **Hotel Rec App**（项目）：默认 `hotel-rec-azure`，GPT-4-Vision 覆盖为 `hotel-rec-vision`
- **Hotel Review App**（项目）：无覆盖，直接继承团队配置

**解析结果**：

| 请求 | 解析出的凭据 | 原因 |
|---|---|---|
| Hotel Rec App → `gpt-5.6-terra` | `hotel-rec-azure` | 项目默认配置（项目级没有针对 gpt-5.6-terra 的模型专属匹配） |
| Hotel Rec App → `gpt-4-vision` | `hotel-rec-vision` | 项目级模型专属配置 |
| Hotel Review App → `gpt-3.5` | `hotel-azure-eastus` | 团队默认配置（项目无配置） |
| Hotel Review App → `gpt-5.6-terra` | `hotel-azure-westus` | 团队级模型专属配置 |

## `model_config` 结构

`model_config` 是团队/项目 `metadata` 中的一个 JSON 对象：

```json
{
    "model_config": {
        "defaultconfig": {
            "<provider>": {
                "litellm_credentials": "<credential-name>"
            }
        },
        "<model-name>": {
            "<provider>": {
                "litellm_credentials": "<credential-name>"
            }
        }
    }
}
```

| 字段 | 说明 |
|---|---|
| `defaultconfig` | 未单独列出的模型的回退凭据 |
| `<model-name>` | 模型专属覆盖项，必须与 LiteLLM 的模型组名称完全一致 |
| `<provider>` | 提供商键（如 `azure`、`openai`、`bedrock`）。当模型名带有提供商前缀（如 `azure/gpt-4`）时，系统会优先匹配对应的提供商键 |
| `litellm_credentials` | [凭据表](./model_management.md#可复用的提供商凭据)中某个凭据的名称 |

### 凭据包含的值

被引用的凭据可以包含以下键的任意组合：

| 键 | 说明 |
|---|---|
| `api_base` | 提供商端点 URL |
| `api_key` | 该提供商的 API 密钥 |
| `api_version` | API 版本（例如 Azure 需要） |

只有凭据中实际存在的键才会被应用；请求中已有的键（例如客户端传入的 `api_version`）永远不会被覆盖。

## 启用该功能

该功能**默认关闭**，需要显式开启。启用方式如下：

<Tabs>

<TabItem value="config" label="config.yaml">

```yaml
litellm_settings:
    enable_model_config_credential_overrides: true
```

</TabItem>

<TabItem value="env" label="环境变量">

```bash
export LITELLM_ENABLE_MODEL_CONFIG_CREDENTIAL_OVERRIDES=true
```

</TabItem>

</Tabs>

:::info
必须先开启该功能开关，团队/项目 metadata 中的 `model_config` 条目才会生效。否则凭据路由完全不起作用：既不会读取 metadata，也不会解析任何凭据。
:::

## 相关文档

- [添加 LLM 凭据](./model_management.md#可复用的提供商凭据)：创建并管理可复用的凭据
- [项目管理](./project_management.md)：项目层级结构与 API
- [团队预算](./team_budgets.md)：团队级预算管理
- [客户端 LLM 凭据](./clientside_auth.md)：在请求体中传递凭据
- [凭据用量统计](./credential_usage_tracking.md)：按凭据追踪花费
