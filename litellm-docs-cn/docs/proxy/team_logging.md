import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基于团队/密钥的日志

## 概述

允许每个密钥/团队使用自己的 Langfuse 项目或自定义回调（callback），从而对日志进行细粒度控制，满足合规要求。

**示例场景**：
```showLineNumbers title="Team Based Logging"
Team 1 -> Logs to Langfuse Project 1 
Team 2 -> Logs to Langfuse Project 2
Team 3 -> Disabled Logging (for GDPR compliance)
```

## 支持的日志集成
- `langfuse`
- `gcs_bucket`
- `langsmith`
- `arize`


## [BETA] 团队日志

<EnterpriseFeature />

### UI 用法

1. 创建带日志设置的团队

创建一个名为 "AI Agents" 的团队
<Image 
  img={require('../../img/team_logging1.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />


2. 为团队创建密钥

下面为团队 "AI Agents" 创建一个密钥。该团队的日志设置将应用于为它创建的所有密钥。

<Image 
  img={require('../../img/team_logging2.png')}
  style={{width: '80%', display: 'block', margin: '2rem auto', border: '1px solid #E5E7EB'}}
/>

<br />


3. 发起一次 LLM API 测试请求

用新密钥发起一次 LLM API 测试请求，预期日志会出现在第 1 步配置的日志服务上。

<Image 
  img={require('../../img/team_logging3.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

4. 在日志服务上查看日志

前往你配置的日志服务，确认收到了第 2 步产生的日志。

<Image 
  img={require('../../img/team_logging4.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

### API 用法

#### 谁可以调用这些接口

代理管理员（proxy admin）、团队所在组织的管理员，以及团队本身的管理员，可以列出、设置和移除该团队的回调。其他所有人都会收到 `403`，且一个团队的管理员无法读取另一个团队的回调。

`POST /team/{team_id}/disable_logging` 是例外：它仍然仅限代理管理员调用。团队管理员想关闭某个集成时，应使用 `DELETE /team/{team_id}/callback/{callback_name}`。

### 按团队设置回调

#### 1. 为团队设置回调

向 `POST /team/{team_id}/callback` 发起请求，为团队添加回调：

```shell
curl -X POST 'http:/localhost:4000/team/dbe2f686-a686-4896-864a-4c3924458709/callback' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "callback_name": "langfuse",
  "callback_type": "success",
  "callback_vars": {
    "langfuse_public_key": "pk", 
    "langfuse_secret_key": "sk_", 
    "langfuse_host": "https://cloud.langfuse.com"
    }
  
}'
```

##### 支持的取值

| 字段 | 支持的取值 | 说明 |
|-------|------------------|-------|
| `callback_name` | `"langfuse"`, `"gcs_bucket"`| 目前仅支持 `"langfuse"` 与 `"gcs_bucket"` |
| `callback_type` | `"success"`, `"failure"`, `"success_and_failure"` | |
| `callback_vars` | | 回调设置的字典 |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_public_key` | string | Langfuse 必填 |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_secret_key` | string | Langfuse 必填 |
| &nbsp;&nbsp;&nbsp;&nbsp;`langfuse_host` | string | Langfuse 可选（默认为 https://cloud.langfuse.com） |
| &nbsp;&nbsp;&nbsp;&nbsp;`gcs_bucket_name` | string | GCS 存储桶必填。你的 GCS 存储桶名称 |
| &nbsp;&nbsp;&nbsp;&nbsp;`gcs_path_service_account` | string | GCS 存储桶必填。服务账号 JSON 文件的路径 |

#### 2. 为团队创建密钥

为团队 `dbe2f686-a686-4896-864a-4c3924458709` 创建的所有密钥，都会把日志写入[第 1 步：为团队设置回调](#1-为团队设置回调)中指定的 Langfuse 项目。


```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "dbe2f686-a686-4896-864a-4c3924458709"
}'
```


#### 3. 为团队发起 `/chat/completion` 请求

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-KbUuE0WNptC0jXapyMmLBA" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```

这次请求应被记录到[第 1 步：为团队设置回调](#1-为团队设置回调)中指定的 Langfuse 项目。


### 为团队禁用日志

要为特定团队禁用日志，可以使用以下端点：

`POST /team/{team_id}/disable_logging`

该端点会移除指定团队的全部成功与失败回调，等于彻底禁用日志。如果只想移除单个集成、让团队的其他回调继续工作，请改用 `DELETE /team/{team_id}/callback/{callback_name}`，详见下文

#### 步骤 1. 为团队禁用日志

```shell
curl -X POST 'http://localhost:4000/team/YOUR_TEAM_ID/disable_logging' \
    -H 'Authorization: Bearer YOUR_API_KEY'
```
将 YOUR_TEAM_ID 替换为实际的团队 ID

**响应**
请求成功后会返回类似这样的响应：
```json
{
    "status": "success",
    "message": "Logging disabled for team YOUR_TEAM_ID",
    "data": {
        "team_id": "YOUR_TEAM_ID",
        "success_callbacks": [],
        "failure_callbacks": []
    }
}
```

#### 步骤 2. 测试 - `/chat/completions`

使用为团队 `team_id` 生成的密钥发起请求，你配置的成功回调（如 Langfuse）上不应再出现任何日志

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-KbUuE0WNptC0jXapyMmLBA" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```

#### 调试与故障排查

- 使用 `GET /team/{team_id}/callback` 查看团队当前生效的回调

用它检查团队 `team_id` 当前有哪些成功/失败回调在生效

```shell
curl -X GET 'http://localhost:4000/team/dbe2f686-a686-4896-864a-4c3924458709/callback' \
        -H "Authorization: Bearer $LITELLM_API_KEY"
```

### 从团队移除单个回调

要在团队其他回调继续运行的情况下注销某个集成，使用：

`DELETE /team/{team_id}/callback/{callback_name}`

注册在该 `callback_name` 下的所有条目都会被移除，且不区分回调类型；因此一个同时注册了 `success` 和 `failure` 的集成，一次调用即可全部注销。响应中会列出保留下来的回调；若传入团队未注册过的 `callback_name`，则返回 `404` 且不做任何更改

### 团队日志端点

- [`POST /team/{team_id}/callback` 为团队添加成功/失败回调](https://docs.litellm.ai/api-reference/#/team%20management/add_team_callbacks_team__team_id__callback_post)
- [`GET /team/{team_id}/callback` - 获取团队的成功/失败回调及其配置变量](https://docs.litellm.ai/api-reference/#/team%20management/get_team_callbacks_team__team_id__callback_get)
- [`DELETE /team/{team_id}/callback/{callback_name}` - 从团队移除单个回调](https://docs.litellm.ai/api-reference/#/team%20management/delete_team_callback_team__team_id__callback__callback_name__delete)
- [`POST /team/{team_id}/disable_logging` - 移除团队的全部回调](https://docs.litellm.ai/api-reference/#/team%20management/disable_team_logging_team__team_id__disable_logging_post)



## 团队日志 - `config.yaml`

为特定的团队 id 开启/关闭日志与缓存。

本节只覆盖团队维度：`litellm_settings.default_team_settings` 为属于某个团队 id 的所有密钥配置回调。`config.yaml` 中没有用于声明单个虚拟密钥（virtual key）的配置项；按密钥配置的回调需通过 `/key/generate` 或 `/key/update` API 下发，参见[基于密钥的日志](#beta-基于密钥的日志)。

由于 `config.yaml` 是由运维人员掌控的可信配置，这里支持 `os.environ/...` 引用，并在代理启动时从代理的环境中解析。同样的引用若通过管理 API 提交则会被拒绝（参见[通过 API 配置回调时的密钥处理](#通过-api-配置回调时的密钥处理)）。

**示例：**

下面这份配置会按团队 id，把 Langfuse 日志发送到两个不同的 Langfuse 项目：

```yaml
litellm_settings:
  default_team_settings: 
    - team_id: "dbe2f686-a686-4896-864a-4c3924458709"
      success_callback: ["langfuse"]
      langfuse_public_key: os.environ/LANGFUSE_PUB_KEY_1 # Project 1
      langfuse_secret: os.environ/LANGFUSE_PRIVATE_KEY_1 # Project 1
    - team_id: "06ed1e01-3fa7-4b9e-95bc-f2e59b74f3a8"
      success_callback: ["langfuse"]
      langfuse_public_key: os.environ/LANGFUSE_PUB_KEY_2 # Project 2
      langfuse_secret: os.environ/LANGFUSE_SECRET_2 # Project 2
```

现在，当你为这个团队 id [生成密钥](./virtual_keys.md)时：

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"team_id": "06ed1e01-3fa7-4b9e-95bc-f2e59b74f3a8"}'
```

用这些密钥发出的所有请求，都会把数据记录到各自团队专属的日志配置中。


## [BETA] 基于密钥的日志

使用 `/key/generate` 或 `/key/update` 端点，为特定密钥添加日志回调。

<EnterpriseFeature />

**基于密钥的日志的工作方式**：

- 若**密钥没有配置回调**，则使用 config.yaml 文件中指定的默认回调
- 若**密钥已配置回调**，则使用密钥中指定的回调


### UI 用法

1. 创建带日志设置的密钥

创建密钥时，可以为它配置专属的日志设置。这些日志设置将应用于用这个密钥发出的所有请求。

<Image 
  img={require('../../img/key_logging.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<br />


2. 发起一次 LLM API 测试请求

用新密钥发起一次 LLM API 测试请求，预期日志会出现在第 1 步配置的日志服务上。

<Image 
  img={require('../../img/key_logging2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

3. 在日志服务上查看日志

前往你配置的日志服务，确认收到了第 2 步产生的日志。

<Image 
  img={require('../../img/key_logging_arize.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

### API 用法



<Tabs>
<TabItem label="Langfuse" value="langfuse">

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "logging": [{
            "callback_name": "langfuse", # "otel", "gcs_bucket"
            "callback_type": "success", # "success", "failure", "success_and_failure"
            "callback_vars": {
                "langfuse_public_key": "pk-lf-...", # pass the resolved value, not an os.environ/ reference
                "langfuse_secret_key": "sk-lf-...", # pass the resolved value, not an os.environ/ reference
                "langfuse_host": "https://cloud.langfuse.com"
            }
        }]
    }
}'

```

每个密钥都可以指向不同的 Langfuse 项目：为每个项目各生成一个密钥，并在 `callback_vars` 中传入该项目的凭据。

#### 通过 API 配置回调时的密钥处理

通过 API 提交的 `callback_vars` 中的 `os.environ/...` 引用会被拒绝（自 v1.84 起）。如果允许在请求体里解析环境引用，任何拥有密钥管理权限的调用者都能读取代理环境中的任意机密，因此这类请求会因校验错误而失败。请在请求中直接传入已解析的机密值；LiteLLM 会使用代理的 salt key 对 `callback_vars` 中的凭据加密存储。如果希望代理从自己的环境中解析凭据，请在可信的 `config.yaml` 中配置回调（在 `litellm_settings` 下全局配置，或通过 [`default_team_settings`](#团队日志---configyaml) 按团队配置）。

<iframe width="840" height="500" src="https://www.youtube.com/embed/8iF0Hvwk0YU" frameBorder="0" allowFullScreen></iframe>

</TabItem>
<TabItem label="GCS 存储桶" value="gcs_bucket">

1. 创建虚拟密钥，把日志写入特定的 GCS 存储桶

  在环境中把 `GCS_SERVICE_ACCOUNT` 设置为服务账号 JSON 文件的路径
  ```bash
  export GCS_SERVICE_ACCOUNT=/path/to/service-account.json # GCS_SERVICE_ACCOUNT=/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json
  ```

  ```bash
  curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
      "metadata": {
          "logging": [{
              "callback_name": "gcs_bucket", # "otel", "gcs_bucket"
              "callback_type": "success", # "success", "failure", "success_and_failure"
              "callback_vars": {
                  "gcs_bucket_name": "my-gcs-bucket", # Name of your GCS Bucket to log to
                  "gcs_path_service_account": "/path/to/service-account.json" # path to the service account json, not an os.environ/ reference
              }
          }]
      }
  }'

  ```

2. 测试 - `/chat/completions` 请求

  使用第 3 步得到的虚拟密钥发起 `/chat/completions` 请求

  请求成功后，你应能在 GCS 存储桶中看到日志

  ```shell
  curl -i http://localhost:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-Fxq5XSyWKeXDKfPdqXZhPg" \
    -d '{
      "model": "fake-openai-endpoint",
      "messages": [
        {"role": "user", "content": "Hello, Claude"}
      ],
      "user": "hello",
    }'
  ```

</TabItem>

<TabItem label="Langsmith" value="langsmith">

1. 创建虚拟密钥，把日志写入特定的 Langsmith 项目

  ```bash
  curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
      "metadata": {
          "logging": [{
              "callback_name": "langsmith", # "otel", "gcs_bucket"
              "callback_type": "success", # "success", "failure", "success_and_failure"
              "callback_vars": {
                  "langsmith_api_key": "lsv2_pt_...", # resolved Langsmith API key, not an os.environ/ reference
                  "langsmith_project": "pr-brief-resemblance-72", # project name on langsmith
                  "langsmith_base_url": "https://api.smith.langchain.com"
              }
          }]
      }
  }'

  ```

2. 测试 - `/chat/completions` 请求

  使用第 3 步得到的虚拟密钥发起 `/chat/completions` 请求

  请求成功后，你应能在自己的 Langsmith 项目中看到日志

  ```shell
  curl -i http://localhost:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-Fxq5XSyWKeXDKfPdqXZhPg" \
    -d '{
      "model": "fake-openai-endpoint",
      "messages": [
        {"role": "user", "content": "Hello, Claude"}
      ],
      "user": "hello",
    }'
  ```

</TabItem>
</Tabs>

---

欢迎通过[提交 issue](https://github.com/BerriAI/litellm/issues) 帮我们改进这个功能

### 检查密钥回调配置是否正确 `/key/health`

携带密钥调用 `/key/health`，检查回调设置是否配置正确

在请求头中传入密钥

```bash
curl -X POST "http://localhost:4000/key/health" \
  -H "Authorization: Bearer <your-key>" \
  -H "Content-Type: application/json"
```

<Tabs>
<TabItem label="密钥配置正确时的响应" value="Response when key is configured correctly">

日志回调设置正确时的响应：

日志回调设置正确时，密钥的状态为 **healthy**。

```json
{
  "key": "healthy",
  "logging_callbacks": {
    "callbacks": [
      "gcs_bucket"
    ],
    "status": "healthy",
    "details": "No logger exceptions triggered, system is healthy. Manually check if logs were sent to ['gcs_bucket']"
  }
}
```

</TabItem>

<TabItem label="密钥配置不正确时的响应" value="Response when key is configured incorrectly">

日志回调设置不正确时的响应

日志回调设置不正确时，密钥的状态为 **unhealthy**。

```json
{
  "key": "unhealthy",
  "logging_callbacks": {
    "callbacks": [
      "gcs_bucket"
    ],
    "status": "unhealthy",
    "details": "Logger exceptions triggered, system is unhealthy: Failed to load vertex credentials. Check to see if credentials containing partial/invalid information."
  }
}
```

</TabItem>
</Tabs>

### 禁用/启用消息脱敏

如果你已在全局禁用提示词日志，可以用它为特定密钥重新启用提示词日志

全局禁用提示词日志（消息脱敏）的 config.yaml 示例
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
litellm_settings:
  callbacks: ["datadog"]
  turn_off_message_logging: True # 👈 Globally logging prompt / response is disabled
```

**为密钥启用提示词日志**

对要启用提示词日志的密钥，把 `turn_off_message_logging` 设为 `false`。这会覆盖全局的 `turn_off_message_logging` 设置。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "logging": [{
            "callback_name": "datadog",
            "callback_vars": {
                "turn_off_message_logging": false # 👈 Enable prompt logging
            }
        }]
    }
}'
```

`/key/generate` 的响应

```json
{
    "key_alias": null,
    "key": "sk-9v6I-jf9-eYtg_PwM8OKgQ",
    "metadata": {
        "logging": [
            {
                "callback_name": "datadog",
                "callback_vars": {
                    "turn_off_message_logging": false
                }
            }
        ]
    },
    "token_id": "a53a33db8c3cf832ceb28565dbb034f19f0acd69ee7f03b7bf6752f9f804081e"
}
```

用该密钥发起 `/chat/completions` 请求

该密钥会把提示词记录到请求中指定的回调

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-9v6I-jf9-eYtg_PwM8OKgQ" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi my name is ishaan what key alias is this"}
    ]
  }'
```
