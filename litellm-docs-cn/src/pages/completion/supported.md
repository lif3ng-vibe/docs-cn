# 生成/补全/对话补全模型

### OpenAI 对话补全模型

| 模型名称       | 函数调用                          | 所需环境变量                |
|------------------|----------------------------------------|--------------------------------------|
| gpt-3.5-turbo    | `completion('gpt-3.5-turbo', messages)` | `os.environ['OPENAI_API_KEY']`       |
| gpt-3.5-turbo-16k    | `completion('gpt-3.5-turbo-16k', messages)` | `os.environ['OPENAI_API_KEY']`       |
| gpt-3.5-turbo-16k-0613    | `completion('gpt-3.5-turbo-16k-0613', messages)` | `os.environ['OPENAI_API_KEY']`       |
| gpt-4            | `completion('gpt-4', messages)`         | `os.environ['OPENAI_API_KEY']`       |
| gpt-5-pro        | `completion('gpt-5-pro', messages)`    | `os.environ['OPENAI_API_KEY']`       |

## Azure OpenAI 对话补全模型
调用 Azure 时，需在 `model` 前加上 `azure/` 前缀。如果你的 Azure 部署（deployment）名称为 `gpt-v-2`，则将 `model` 设为 `azure/gpt-v-2`。

| 模型名称       | 函数调用                           | 所需环境变量                     |
|------------------|-----------------------------------------|-------------------------------------------|
| gpt-3.5-turbo    | `completion('azure/gpt-3.5-turbo-deployment', messages)` | `os.environ['AZURE_API_KEY']`,`os.environ['AZURE_API_BASE']`,`os.environ['AZURE_API_VERSION']` |
| gpt-4            | `completion('azure/gpt-4-deployment', messages)`         | `os.environ['AZURE_API_KEY']`,`os.environ['AZURE_API_BASE']`,`os.environ['AZURE_API_VERSION']` |

### OpenAI 文本补全模型

| 模型名称       | 函数调用                              | 所需环境变量                |
|------------------|--------------------------------------------|--------------------------------------|
| text-davinci-003 | `completion('text-davinci-003', messages)` | `os.environ['OPENAI_API_KEY']`       |

### Cohere 模型

| 模型名称       | 函数调用                              | 所需环境变量                |
|------------------|--------------------------------------------|--------------------------------------|
| command-nightly  | `completion('command-nightly', messages)` | `os.environ['COHERE_API_KEY']`       |


### Anthropic 模型

| 模型名称       | 函数调用                              | 所需环境变量                |
|------------------|--------------------------------------------|--------------------------------------|
| claude-instant-1  | `completion('claude-instant-1', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-2  | `completion('claude-2', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |

### Hugging Face 推理 API

liteLLM 支持所有 [`text2text-generation`](https://huggingface.co/models?library=transformers&pipeline_tag=text2text-generation&sort=downloads) 和 [`text-generation`](https://huggingface.co/models?library=transformers&pipeline_tag=text-generation&sort=downloads) 模型。按以下步骤，即可使用 Hugging Face 上的任意文本模型：

* 从 Hugging Face 复制 `model repo` 的 URL，并将其作为补全调用中的 `model` 参数。
* 将 `hugging_face` 参数设为 `True`。
* 确保已设置 Hugging Face 的 API 密钥（API key）

以下是一些受支持模型的示例：
**请注意，表格中列出的模型仅为示例，按照上述步骤，你可以使用 Hugging Face 上任何可用的文本模型**。

| 模型名称       | 函数调用                                                                       | 所需环境变量                |
|------------------|-------------------------------------------------------------------------------------|--------------------------------------|
| [stabilityai/stablecode-completion-alpha-3b-4k](https://huggingface.co/stabilityai/stablecode-completion-alpha-3b-4k)  | `completion(model="stabilityai/stablecode-completion-alpha-3b-4k", messages=messages, hugging_face=True)` | `os.environ['HF_TOKEN']`       |
| [bigcode/starcoder](https://huggingface.co/bigcode/starcoder)                           | `completion(model="bigcode/starcoder", messages=messages, hugging_face=True)`          | `os.environ['HF_TOKEN']`       |
| [google/flan-t5-xxl](https://huggingface.co/google/flan-t5-xxl)                         | `completion(model="google/flan-t5-xxl", messages=messages, hugging_face=True)`         | `os.environ['HF_TOKEN']`       |
| [google/flan-t5-large](https://huggingface.co/google/flan-t5-large)                     | `completion(model="google/flan-t5-large", messages=messages, hugging_face=True)`       | `os.environ['HF_TOKEN']`       |

### OpenRouter 补全模型

liteLLM 支持 [OpenRouter](https://openrouter.ai/docs) 上的所有文本模型。

| 模型名称       | 函数调用                              | 所需环境变量                |
|------------------|--------------------------------------------|--------------------------------------|
| openai/gpt-3.5-turbo | `completion('openai/gpt-3.5-turbo', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| openai/gpt-3.5-turbo-16k | `completion('openai/gpt-3.5-turbo-16k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| openai/gpt-4 | `completion('openai/gpt-4', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| openai/gpt-4-32k | `completion('openai/gpt-4-32k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| anthropic/claude-2 | `completion('anthropic/claude-2', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| anthropic/claude-instant-v1 | `completion('anthropic/claude-instant-v1', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| google/palm-2-chat-bison | `completion('google/palm-2-chat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| google/palm-2-codechat-bison | `completion('google/palm-2-codechat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| meta-llama/llama-2-13b-chat | `completion('meta-llama/llama-2-13b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |
| meta-llama/llama-2-70b-chat | `completion('meta-llama/llama-2-70b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OR_API_KEY']`       |

## Novita AI 补全模型

🚨 LiteLLM 支持所有 Novita AI 模型，传入 `model=novita/<your-novita-model>` 即可调用 Novita AI 的模型。全部 Novita AI 模型见[这里](https://novita.ai/models/llm?utm_source=github_litellm&utm_medium=github_readme&utm_campaign=github_link)

| 模型名称       | 函数调用                              | 所需环境变量                |
|------------------|--------------------------------------------|--------------------------------------|
| novita/deepseek/deepseek-r1 | `completion('novita/deepseek/deepseek-r1', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/deepseek/deepseek_v3 | `completion('novita/deepseek/deepseek_v3', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.3-70b-instruct | `completion('novita/meta-llama/llama-3.3-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-8b-instruct | `completion('novita/meta-llama/llama-3.1-8b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-8b-instruct-max | `completion('novita/meta-llama/llama-3.1-8b-instruct-max', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.1-70b-instruct | `completion('novita/meta-llama/llama-3.1-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3-8b-instruct | `completion('novita/meta-llama/llama-3-8b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3-70b-instruct | `completion('novita/meta-llama/llama-3-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.2-1b-instruct | `completion('novita/meta-llama/llama-3.2-1b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.2-11b-vision-instruct | `completion('novita/meta-llama/llama-3.2-11b-vision-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/meta-llama/llama-3.2-3b-instruct | `completion('novita/meta-llama/llama-3.2-3b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/gryphe/mythomax-l2-13b | `completion('novita/gryphe/mythomax-l2-13b', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/google/gemma-2-9b-it | `completion('novita/google/gemma-2-9b-it', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/mistralai/mistral-nemo | `completion('novita/mistralai/mistral-nemo', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/mistralai/mistral-7b-instruct | `completion('novita/mistralai/mistral-7b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen-2.5-72b-instruct | `completion('novita/qwen/qwen-2.5-72b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| novita/qwen/qwen-2-vl-72b-instruct | `completion('novita/qwen/qwen-2-vl-72b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
