import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Config.yaml
在 config.yaml 上设置模型列表、`api_base`、`api_key`、`temperature` 以及代理服务器设置（`master-key`）。

| 参数名               | 说明                                                          |
|----------------------|---------------------------------------------------------------|
| `model_list`         | 服务器支持的模型列表，可附带模型专属配置 |
| `router_settings`   | litellm Router 设置，例如 `routing_strategy="least-busy"` [**查看全部**](./config_settings#router_settings-参考)|
| `litellm_settings`   | litellm 模块级设置，例如 `litellm.drop_params=True`、`litellm.set_verbose=True`、`litellm.api_base`、`litellm.cache` [**查看全部**](./config_settings#litellm_settings-参考)|
| `general_settings`   | 服务器设置，例如设置 `master_key: sk-my_special_key` [**查看全部**](./config_settings#general_settings-参考)|
| `environment_variables`   | 环境变量示例：`REDIS_HOST`、`REDIS_PORT` [**查看全部**](./config_settings#环境变量参考)|

**完整清单**：config.yaml 可传入的全部配置项，请查阅 `<your-proxy-url>/#/config.yaml`（例如 http://0.0.0.0:4000/#/config.yaml）处的 Swagger UI 文档。


## 快速上手

为你的部署设置一个模型别名。

在 `config.yaml` 中，`model_name` 参数是部署对外呈现给用户的名称。

在下面的配置中：
- `model_name`：外部客户端传给 litellm 的名称  
- `litellm_params.model`：传给 litellm.completion() 函数的模型字符串

例如：
- `model=vllm-models` 会路由到 `openai/facebook/opt-125m`。
- `model={{openai_large}}` 会在 `azure/gpt-4o-eu` 与 `azure/gpt-4o-ca` 之间做负载均衡

```yaml
model_list:
  - model_name: {{openai_large}} ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: azure/gpt-4o-eu ### MODEL NAME sent to `litellm.completion()` ###
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU" # does os.getenv("AZURE_API_KEY_EU")
      rpm: 6      # [OPTIONAL] Rate limit for this deployment: in requests per minute (rpm)
  - model_name: bedrock-claude-v1 
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4o-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_CA"
      rpm: 6
  - model_name: anthropic-claude
    litellm_params: 
      model: bedrock/us.anthropic.{{anthropic}}
      ### [OPTIONAL] SET AWS REGION ###
      aws_region_name: us-east-1
  - model_name: vllm-models
    litellm_params:
      model: openai/facebook/opt-125m # the `openai/` prefix tells litellm it's openai compatible
      api_base: http://0.0.0.0:4000/v1
      api_key: none
      rpm: 1440
    model_info: 
      version: 2
  
  # Use this if you want to make requests to `{{anthropic}}`,`{{anthropic_large}}` without defining them on the config.yaml
  # Default models
  # Works for ALL Providers and needs the default provider credentials in .env
  - model_name: "*" 
    litellm_params:
      model: "*"

litellm_settings: # module level litellm settings - https://github.com/BerriAI/litellm/blob/main/litellm/__init__.py
  drop_params: True
  success_callback: ["langfuse"] # OPTIONAL - if you want to start sending LLM Logs to Langfuse. Make sure to set `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` in your env

general_settings: 
  master_key: os.environ/LITELLM_MASTER_KEY # [OPTIONAL] Only use this if you to require all calls to contain this key (Authorization: Bearer $LITELLM_API_KEY)
  alerting: ["slack"] # [OPTIONAL] If you want Slack Alerts for Hanging LLM requests, Slow llm responses, Budget Alerts. Make sure to set `SLACK_WEBHOOK_URL` in your env
```
:::info

更多提供商专属信息见[这里](../providers/)

:::

#### 第 2 步：用配置启动代理

```shell
$ litellm --config /path/to/config.yaml
```

:::tip

如需详细调试日志，可加 `--detailed_debug` 运行

```shell
$ litellm --config /path/to/config.yaml --detailed_debug
```

:::

#### 第 3 步：测试

请求会发送到 config.yaml 中 `model_name={{openai_large}}` 对应的模型。

如果存在多条 `model_name={{openai_large}}` 配置，则会触发[负载均衡](https://docs.litellm.ai/docs/proxy/load_balancing)

**[Langchain、OpenAI SDK 调用示例](../proxy/user_keys#请求格式)**

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "{{openai_large}}",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```

## config.yaml 与数据库设置

启用 `store_model_in_db` 后（通过 `general_settings.store_model_in_db: true` 或 `STORE_MODEL_IN_DB="True"`），管理界面（Admin UI）和 `/config/update` API 会把设置写入 `LiteLLM_Config` 表，数据库随之成为这些配置的唯一事实来源。代理在启动时和每次刷新配置时，都会先加载 `config.yaml`，再把数据库中 `general_settings`、`router_settings`、`litellm_settings`、`environment_variables` 的表行叠加到其上。叠加是一次深度合并，两边都存在的键以数据库值为准，因此在 YAML 里改这类键再重启 Pod，并不会改变实际运行的值。把这四个部分的 YAML 当作启动引导即可；UI 写入的键请在界面里修改（或直接删除 `LiteLLM_Config` 中对应的行），而不是改文件

还有几个细节值得了解。数据库中的 `null` 和空列表会被视为"无值"，不会覆盖 YAML 提供的内容，因此你没在界面里设置过的键仍然来自文件。叠加也只作用于上述四个设置部分；`model_list` 不参与这种合并，因为通过界面或 API 添加的模型存放在 `LiteLLM_ProxyModelTable` 中，与 YAML 里的模型一同对外提供。也就是说，数据库里的模型不会替换同名的 YAML 条目，而是作为一个额外的部署参与负载均衡（参见[模型管理](./model_management.md)）。而 `store_model_in_db` 关闭时，配置完全不会读数据库，`config.yaml` 拥有全部权威性

## LLM 配置 `model_list`

### 模型专属参数（API Base、密钥、Temperature、Max Tokens、Organization、Headers 等）
你可以在配置中保存模型专属的信息，例如 api_base、api_key、temperature、max_tokens 等。

[**全部输入参数**](https://docs.litellm.ai/docs/completion/input#input-params-1)

**第 1 步**：创建 `config.yaml` 文件
```yaml
model_list:
  - model_name: gpt-4-team1
    litellm_params: # params for litellm.completion() - https://docs.litellm.ai/docs/completion/input#input---request-body
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      azure_ad_token: eyJ0eXAiOiJ
      seed: 12
      max_tokens: 20
  - model_name: gpt-4-team2
    litellm_params:
      model: azure/{{openai_large}}
      api_key: sk-123
      api_base: https://openai-gpt-4-test-v-2.openai.azure.com/
      temperature: 0.2
  - model_name: openai-gpt-4o
    litellm_params:
      model: openai/{{openai_large}}
      extra_headers: {"AI-Resource Group": "ishaan-resource"}
      api_key: sk-123
      organization: org-ikDc4ex8NB
      temperature: 0.2
  - model_name: mistral-7b
    litellm_params:
      model: ollama/mistral
      api_base: your_ollama_api_base
```

**第 2 步**：用配置启动服务

```shell
$ litellm --config /path/to/config.yaml
```

**预期日志**：

在控制台日志中看到下面这一行，就说明 config.yaml 已正确加载。
```
LiteLLM: Proxy initialized with Config, Set models:
```

### 嵌入模型 - 支持 Sagemaker、Bedrock、Azure、OpenAI、XInference

支持的嵌入提供商与模型见[这里](https://docs.litellm.ai/docs/embedding/supported_embedding)


<Tabs>
<TabItem value="bedrock" label="Bedrock 补全/对话">

```yaml
model_list:
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-west-2"
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-east-2"
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-east-1"

```

</TabItem>

<TabItem value="sagemaker" label="Sagemaker、Bedrock 嵌入">

下面演示如何在代理服务器上，在 GPT-J 嵌入（sagemaker 端点）、Amazon Titan 嵌入（Bedrock）与 Azure OpenAI 嵌入之间做路由：

```yaml
model_list:
  - model_name: sagemaker-embeddings
    litellm_params: 
      model: "sagemaker/berri-benchmarking-gpt-j-6b-fp16"
  - model_name: amazon-embeddings
    litellm_params:
      model: "bedrock/amazon.titan-embed-text-v1"
  - model_name: azure-embeddings
    litellm_params: 
      model: "azure/azure-embedding-model"
      api_base: "os.environ/AZURE_API_BASE" # os.getenv("AZURE_API_BASE")
      api_key: "os.environ/AZURE_API_KEY" # os.getenv("AZURE_API_KEY")
      api_version: "2023-07-01-preview"

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY # [OPTIONAL] if set all calls to proxy will require either this key or a valid generated token
```

</TabItem>

<TabItem value="Hugging Face emb" label="Hugging Face 嵌入">
LiteLLM 代理支持所有<a href="https://huggingface.co/models?pipeline_tag=feature-extraction">特征提取类嵌入模型</a>。

```yaml
model_list:
  - model_name: deployed-codebert-base
    litellm_params: 
      # send request to deployed hugging face inference endpoint
      model: huggingface/microsoft/codebert-base # add huggingface prefix so it routes to hugging face
      api_key: hf_LdS                            # api key for hugging face inference endpoint
      api_base: https://uysneno1wv2wd4lw.us-east-1.aws.endpoints.huggingface.cloud # your hf inference endpoint 
  - model_name: codebert-base
    litellm_params: 
      # no api_base set, sends request to hugging face free inference api https://api-inference.huggingface.co/models/
      model: huggingface/microsoft/codebert-base # add huggingface prefix so it routes to hugging face
      api_key: hf_LdS                            # api key for hugging face                     

```

</TabItem>

<TabItem value="azure" label="Azure OpenAI 嵌入">

```yaml
model_list:
  - model_name: azure-embedding-model # model group
    litellm_params:
      model: azure/azure-embedding-model # model name for litellm.embedding(model=azure/azure-embedding-model) call
      api_base: your-azure-api-base
      api_key: your-api-key
      api_version: 2023-07-01-preview
```

</TabItem>

<TabItem value="openai" label="OpenAI 嵌入">

```yaml
model_list:
- model_name: text-embedding-ada-002 # model group
  litellm_params:
    model: text-embedding-ada-002 # model name for litellm.embedding(model=text-embedding-ada-002) 
    api_key: your-api-key-1
- model_name: text-embedding-ada-002 
  litellm_params:
    model: text-embedding-ada-002
    api_key: your-api-key-2
```

</TabItem>


<TabItem value="xinf" label="XInference">

https://docs.litellm.ai/docs/providers/xinference

**注意**：在 `litellm_params` 的 `model` 上加 `xinference/` 前缀，litellm 才会将其路由到 OpenAI

```yaml
model_list:
- model_name: embedding-model  # model group
  litellm_params:
    model: xinference/bge-base-en   # model name for litellm.embedding(model=xinference/bge-base-en) 
    api_base: http://0.0.0.0:9997/v1
```

</TabItem>

<TabItem value="openai emb" label="OpenAI 兼容嵌入">

<p>用于调用<a href="https://github.com/xorbitsai/inference">OpenAI 兼容服务器上的 /embedding 端点</a>。</p>

**注意**：在 `litellm_params` 的 `model` 上加 `openai/` 前缀，litellm 才会将其路由到 OpenAI

```yaml
model_list:
- model_name: text-embedding-ada-002  # model group
  litellm_params:
    model: openai/<your-model-name>   # model name for litellm.embedding(model=text-embedding-ada-002) 
    api_base: <model-api-base>
```

</TabItem>
</Tabs>

#### 启动代理

```shell
litellm --config config.yaml
```

#### 发起请求
向 `bedrock-cohere` 发送请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "bedrock-cohere",
  "messages": [
      {
      "role": "user",
      "content": "gm"
      }
  ]
}'
```


### 多个 OpenAI 组织

只需一条模型定义，即可覆盖所有 OpenAI 组织下的全部 openai 模型

```yaml
  - model_name: "*"
    litellm_params:
      model: openai/*
      api_key: os.environ/OPENAI_API_KEY
      organization:
       - org-1 
       - org-2 
       - org-3
```

LiteLLM 会自动为每个组织创建单独的部署。

可以通过以下方式确认：

```bash
curl --location 'http://0.0.0.0:4000/v1/model/info' \
--header 'Authorization: Bearer ${LITELLM_KEY}' \
--data ''
```

### 负载均衡

:::info
更多内容见[这一页](https://docs.litellm.ai/docs/proxy/load_balancing)
:::

用它调用同一模型的多个实例，并配置[路由策略](https://docs.litellm.ai/docs/routing#advanced)等选项。

要获得最佳性能：
- 为每个模型部署设置 `tpm/rpm`，加权选择会基于设定的 tpm/rpm 进行。
- 在 `router_settings:routing_strategy` 中选择最适合你的路由策略。

LiteLLM 支持以下取值：
```text
["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"`
```

设置了 `tpm/rpm` 且 `routing_strategy==simple-shuffle` 时，litellm 会基于设定的 tpm/rpm 做加权选择。**在我们的负载测试中，为所有部署设置 tpm/rpm 并搭配 `routing_strategy==simple-shuffle` 能将吞吐最大化**
- 使用多个 LiteLLM 服务器 / Kubernetes 时，请设置 `router_settings:redis_host` 等 redis 配置

```yaml
model_list:
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
        rpm: 60      # Optional[int]: When rpm/tpm set - litellm uses weighted pick for load balancing. rpm = Rate limit for this deployment: in requests per minute (rpm).
        tpm: 1000   # Optional[int]: tpm = Tokens Per Minute 
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
        rpm: 600      
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
        rpm: 60000      
  - model_name: {{openai_small}}
    litellm_params:
        model: {{openai_small}}
        api_key: <my-openai-key>
        rpm: 200      
  - model_name: {{openai_large}}
    litellm_params:
        model: {{openai_large}}
        api_key: <my-openai-key>
        rpm: 100      

litellm_settings:
  num_retries: 3 # retry call 3 times on each model_name (e.g. zephyr-beta)
  request_timeout: 10 # raise Timeout error if call takes longer than 10s. Sets litellm.request_timeout 
  fallbacks: [{"zephyr-beta": ["{{openai_small}}"]}] # fallback to {{openai_small}} if call fails num_retries 
  context_window_fallbacks: [{"zephyr-beta": ["{{openai_large}}"]}, {"{{openai_small}}": ["{{openai_large}}"]}] # fallback to {{openai_large}} if context window error
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute. 

router_settings: # router_settings are optional
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"
  model_group_alias: {"gpt-5.6": "{{openai_small}}"} # all requests with `gpt-5.6` will be routed to models with `{{openai_small}}`
  num_retries: 2
  timeout: 30                                  # 30 seconds
  redis_host: <your redis host>                # set this when using multiple litellm proxy deployments, load balancing state stored in redis
  redis_password: <your redis password>
  redis_port: 1992
```

设置好[虚拟密钥（virtual key）](https://docs.litellm.ai/docs/proxy/virtual_keys)或 [custom_callbacks](https://docs.litellm.ai/docs/proxy/logging) 后，即可查看你的成本


### 从环境变量加载 API 密钥 / 配置值

如果你的环境里已保存密钥，又不想把它们暴露在 config.yaml 中，可以按下面的方法从环境加载模型专属的密钥。**这对 config.yaml 上的任意值都适用**。

```yaml
os.environ/<YOUR-ENV-VAR> # runs os.getenv("YOUR-ENV-VAR")
```

```yaml 
model_list:
  - model_name: gpt-4-team1
    litellm_params: # params for litellm.completion() - https://docs.litellm.ai/docs/completion/input#input---request-body
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_NORTH_AMERICA_API_KEY # 👈 KEY CHANGE
```

[**查看代码**](https://github.com/BerriAI/litellm/blob/c12d6c3fe80e1b5e704d9846b246c059defadce7/litellm/utils.py#L2366)

感谢 [@David Manouchehri](https://www.linkedin.com/in/davidmanouchehri/) 在这一点上的帮助。

### 集中管理凭据

凭据只需定义一次，就能在多个模型间复用。好处包括：
- 便于密钥轮换
- 减少配置重复

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/{{openai_large}}
      litellm_credential_name: default_azure_credential  # Reference credential below

credential_list:
  - credential_name: default_azure_credential
    credential_values:
      api_key: os.environ/AZURE_API_KEY  # Load from environment
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-05-15"
    credential_info:
      description: "Production credentials for EU region"
      custom_llm_provider: "azure"
```

#### 关键参数
- `credential_name`：凭据集的唯一标识
- `credential_values`：凭据/密文的键值对（支持 `os.environ/` 语法）
- `credential_info`：用户自定义的凭据信息键值对。不强制要求包含任何键值对，但这个字典本身必须存在。

#### 凭据名称不可更改

模型和向量存储都通过 `credential_name` 引用凭据，因此创建后不能再改名。携带不同 `credential_name` 的 `PATCH` 请求会返回 400

要在管理界面（Admin UI）里改凭据的显示名，应改设 `display_name`。该字段可选、无需唯一，最长 255 个字符。发 `PATCH` 时省略它表示保留当前显示名，传 `null` 表示清除：

```bash
curl -X PATCH http://localhost:4000/credentials/default_azure_credential \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Azure EU (prod)", "credential_info": {}}'
```

`credential_list` 中的凭据只能在 `config.yaml` 里修改。对它们的 `PATCH` 和 `DELETE` 会返回 405，界面上的编辑和删除按钮也不可用，在那里设置的 `display_name` 会被忽略。`GET /credentials` 会返回每个凭据的 `display_name` 及其来源 `source`，取值为 `db` 或 `config`

### 从密钥管理器加载 API 密钥（Azure Vault 等）

[**在 LiteLLM 代理中使用密钥管理器**](../secret)


### 为模型设置支持的运行环境 - `production`、`staging`、`development`

如果你想控制某个模型只在特定的 litellm 环境中暴露，可以使用这一功能

支持的运行环境：
- `production`
- `staging`
- `development`

1. 在环境变量中设置 `LITELLM_ENVIRONMENT="<environment>"`，可取 `production`、`staging`、`development` 之一


2. 在 `model_info.supported_environments` 中为每个模型设置支持的运行环境列表
```yaml
model_list:
 - model_name: {{openai_small}}
   litellm_params:
     model: openai/{{openai_small}}
     api_key: os.environ/OPENAI_API_KEY
   model_info:
     supported_environments: ["development", "production", "staging"]
 - model_name: {{openai_large}}
   litellm_params:
     model: openai/{{openai_large}}
     api_key: os.environ/OPENAI_API_KEY
   model_info:
     supported_environments: ["production", "staging"]
 - model_name: {{anthropic}}
   litellm_params:
     model: anthropic/{{anthropic}}
     api_key: os.environ/ANTHROPIC_API_KEY
   model_info:
     supported_environments: ["production"]
```


### 设置自定义提示词模板

LiteLLM 默认会检查模型是否自带[提示词模板并加以套用](../completion/prompt_formatting.md)（例如 huggingface 模型的 tokenizer_config.json 里保存了聊天模板的情况）。不过，你也可以在 `config.yaml` 中为代理设置自定义提示词模板：

**第 1 步**：把提示词模板保存到 `config.yaml`
```yaml
# Model-specific parameters
model_list:
  - model_name: mistral-7b # model alias
    litellm_params: # actual params for litellm.completion()
      model: "huggingface/mistralai/Mistral-7B-Instruct-v0.1" 
      api_base: "<your-api-base>"
      api_key: "<your-api-key>" # [OPTIONAL] for hf inference endpoints
      initial_prompt_value: "\n"
      roles: {"system":{"pre_message":"<|im_start|>system\n", "post_message":"<|im_end|>"}, "assistant":{"pre_message":"<|im_start|>assistant\n","post_message":"<|im_end|>"}, "user":{"pre_message":"<|im_start|>user\n","post_message":"<|im_end|>"}}
      final_prompt_value: "\n"
      bos_token: " "
      eos_token: " "
      max_tokens: 4096
```

**第 2 步**：用配置启动服务

```shell
$ litellm --config /path/to/config.yaml
``` 

### 设置自定义分词器

如果你在使用 [`/utils/token_counter` 端点](https://docs.litellm.ai/api-reference/#/llm%20utils/token_counter_utils_token_counter_post)，并想为某个模型指定自定义的 huggingface 分词器，可以在 `config.yaml` 中设置

```yaml
model_list:
  - model_name: openai-deepseek
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      access_groups: ["restricted-models"]
      custom_tokenizer: 
        identifier: deepseek-ai/DeepSeek-V3-Base
        revision: main
        auth_token: os.environ/HUGGINGFACE_API_KEY
```

**字段说明**
```
custom_tokenizer: 
  identifier: str # huggingface model identifier
  revision: str # huggingface model revision (usually 'main')
  auth_token: Optional[str] # huggingface auth token 
```

## 通用设置 `general_settings`（数据库连接等）

### 配置数据库连接池上限与连接超时

```yaml
general_settings: 
  database_connection_pool_limit: 10 # sets connection pool per worker for prisma client to postgres db (default: 10, recommended: 10-20)
  database_connection_timeout: 60 # sets a 60s timeout for any connection call to the db 
```

**如何计算合适的值**：

连接上限是按**每个 worker 进程**生效的，而不是按实例。这意味着如果有多个 worker，每个 worker 都会创建自己的连接池。

**计算公式**：
```
database_connection_pool_limit = MAX_DB_CONNECTIONS ÷ (number_of_instances × number_of_workers_per_instance)
```

**示例**：
- 数据库最多允许 **100 个连接**
- LiteLLM 运行 **1 个实例**
- 每个实例有 **8 个 worker**（通过 `--num_workers 8` 设置）

计算：`100 ÷ (1 × 8) = 12.5`

12.5 不能直接用，向下取整为 **10** 以留出安全余量。这意味着：
- 8 个 worker 各自的连接池上限为 10
- 总连接上限：8 个 worker × 10 个连接 = 80 个连接
- 稳妥地保持在数据库 100 个连接的上限之内

### 限制空闲数据库连接并传递额外的 Prisma URL 参数

如果发现大量 Prisma 空闲连接始终不关闭，可以设置 `database_socket_timeout`，让 Prisma 关闭任何静默超过阈值的连接。还可以用 `database_connect_timeout` 限制 Prisma 打开新连接的等待时长，并通过 `database_extra_connection_params` 向 Prisma 传递任意的额外查询字符串参数。

这些配置对应 Prisma 的同名 [PostgreSQL 连接 URL 参数](https://www.prisma.io/docs/orm/overview/databases/postgresql)（去掉 `database_` 前缀），LiteLLM 会把它们同时追加到 `DATABASE_URL` 和 `DIRECT_URL` 上。

```yaml
general_settings:
  database_connection_pool_limit: 20
  database_socket_timeout: 300   # close any connection idle/slow for >5 min
  database_connect_timeout: 15   # fail fast if a new connection can't be established within 15s
  database_extra_connection_params:
    pgbouncer: "true"            # set if running behind PgBouncer
    statement_cache_size: 0
    sslmode: "require"
```

**注意事项**：
- `database_socket_timeout` 是限制 LiteLLM 空闲数据库连接的主要开关。
- `database_connect_timeout` 与 `database_socket_timeout` 未设置时不会出现在 URL 中，此时沿用 Prisma 的默认值。
- `database_extra_connection_params` 是不带类型校验的透传字典：你在这里设置的任何键都会**覆盖** LiteLLM 为该键设置的默认值（例如可以通过它覆盖 `pool_timeout`）。适用于 `sslmode`、`pgbouncer`、`statement_cache_size` 或其他任何 Prisma URL 参数。
- 要用自定义 CA 校验数据库服务器证书（例如 AWS RDS），在这里或 URL 上设置 `sslmode: "verify-full"` 和 `sslrootcert: "/certs/global-bundle.pem"`；LiteLLM 会把它们转换为 Prisma 的 `sslcert` + `sslaccept=strict`。参见[校验数据库服务器证书](./prod.md#校验数据库服务器证书自定义-ca如-aws-rds)。

### 限制语句执行与锁等待时间

`database_connect_timeout` 和 `database_socket_timeout` 约束的是*连接*。两者都管不到已经在执行的语句，因此一条缓慢的写操作可以在 Prisma 客户端早已放弃等待之后继续在服务器上运行，并全程持有行锁。后续对同一批行的写入会排在这些锁后面，持续流量下正是这个队列耗尽数据库会话。

设置下面两个 Postgres 侧的界限来兜住这种情况：

```yaml
general_settings:
  database_statement_timeout: 60 # seconds; cancels any statement running longer than this
  database_lock_timeout: 15      # seconds; fails a statement that waits this long for someone else's lock
```

LiteLLM 通过 `DATABASE_URL` 上标准的 libpq `options` 参数传递这两项（`options=-c statement_timeout=60000 -c lock_timeout=15000`）；Postgres 没有为它们提供专门的 Prisma URL 参数。被取消的语句会以 SQLSTATE `57014`、`canceling statement due to statement timeout` 的形式抛回给 LiteLLM。

**注意事项**：
- 两项都是**可选开启**的。不设置就一切照旧。
- `database_lock_timeout` 应远小于 `database_statement_timeout`，让被其他事务的锁挡住的写操作尽快失败，而不是耗光整条语句的时间预算。
- 两者都不会作用于 `DIRECT_URL`（Prisma 用于迁移）。迁移本来就允许长时间运行，不会被这些设置取消。
- 你自己固定在 `DATABASE_URL` 上的 `options` 值会被保留，且其中已固定的设置优先于这里的配置；`database_extra_connection_params` 又优先于两者。
- 这些界限和在服务器端或 RDS 参数组里设置的是同一批。在这里设置的差别是只作用于 LiteLLM 自己的连接，而不影响该数据库的其他客户端。

### 禁用服务端预编译语句

设置 `database_disable_prepared_statements: true` 可以阻止 Prisma 复用服务端预编译语句。它会在 Prisma 连接 URL 上追加 `pgbouncer=true`，让每条查询都重新准备，而不是复用缓存的执行计划。

```yaml
general_settings:
  database_disable_prepared_statements: true
```

适用于以下场景：
- LiteLLM 通过**事务池化模式的 PgBouncer** 连接 Postgres。这种模式下复用预编译语句会出问题，因为相邻的查询可能落在不同的服务器连接上。
- 你在做**带 schema 迁移的滚动部署**，并看到 `cached plan must not change result type` 报错。该错误在迁移改动了某个列的结果类型、而连接池中的连接仍持有引用该列的执行计划时触发；开启此开关后不再有可被作废的复用计划，迁移也就无害了。

代价是每条查询都要自付准备成本、无法摊薄，带来少量单次查询开销。`database_extra_connection_params` 中显式设置的 `pgbouncer` 键优先于这个开关。

## LiteLLM 许可证密钥（企业版）

要启用 [LiteLLM 企业版功能](https://docs.litellm.ai/docs/enterprise)，请把许可证密钥设为环境变量：

```bash
export LITELLM_LICENSE="eyJ..."
```

许可证密钥是一个 JWT 令牌，在你购买 LiteLLM 企业版许可时提供。设置后，LiteLLM 会自动检测并激活企业版功能。

也可以把它加进 `.env` 文件：

```env
LITELLM_LICENSE="eyJ..."
```

## 其他配置


### 禁用 Swagger UI

要禁用基础 URL 上的 Swagger 文档，在环境中设置

```env
NO_DOCS="True"
```

然后重启代理。

### 禁用 Redoc

要禁用 Redoc 文档（默认在 `<your-proxy-url>/redoc`），在环境中设置

```env
NO_REDOC="True"
```

然后重启代理。

### 禁用 OpenAPI schema

要禁用原始 OpenAPI schema（默认在 `<your-proxy-url>/openapi.json`），在环境中设置

```env
NO_OPENAPI="True"
```

然后重启代理。

### 生产/隔离网络部署下禁用全部 API 文档

Swagger、Redoc 和原始 OpenAPI schema 是三个相互独立的入口，各自由独立的环境变量控制。要彻底锁死生产或隔离网络（air-gapped）部署，把三项都设上：

```env
NO_DOCS="True"
NO_REDOC="True"
NO_OPENAPI="True"
```

设置后重启代理。此后 `/redoc` 和 `/openapi.json` 会返回 404 且响应中不含 schema，`/` 只返回简单的 `"LiteLLM: RUNNING"` 状态字符串，推理和管理路由不受影响。

### 为代理使用 CONFIG_FILE_PATH（简化 Azure 容器部署）

1. 准备 config.yaml

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

2. 把文件路径存为环境变量

```bash
CONFIG_FILE_PATH="/path/to/config.yaml"
```

3. 启动代理

```bash
$ litellm 

# RUNNING on http://0.0.0.0:4000
```


### 以 S3、GCS 存储桶对象/URL 的形式提供 LiteLLM config.yaml

如果部署服务上无法挂载配置文件（例如 AWS Fargate、Railway 等），就用这种方式

LiteLLM 代理会从 S3 存储桶或 GCS 存储桶读取你的 config.yaml

<Tabs>
<TabItem value="gcs" label="GCS 存储桶">

设置以下 .env 变量
```shell
LITELLM_CONFIG_BUCKET_TYPE = "gcs"                              # set this to "gcs"         
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on GCS
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "proxy_config.yaml"         # object key on GCS
```

带着这些环境变量启动 litellm 代理，litellm 会从 GCS 读取配置

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -e LITELLM_CONFIG_BUCKET_TYPE="gcs" \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm:latest --detailed_debug
```

</TabItem>

<TabItem value="s3" label="s3">

设置以下 .env 变量
```shell
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on s3 
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "litellm_proxy_config.yaml"  # object key on s3
```

带着这些环境变量启动 litellm 代理，litellm 会从 s3 读取配置

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm:latest
```
</TabItem>
</Tabs>
