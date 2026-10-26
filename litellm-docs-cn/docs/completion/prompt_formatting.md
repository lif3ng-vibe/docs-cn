# 提示词格式化

LiteLLM 会自动把 OpenAI ChatCompletions 提示词格式转译成其他模型的格式。你也可以为某个模型设置自定义提示词模板（prompt template）来控制这一行为。

## 内置模板

提示词模板只适用于接收单段原始文本提示词的提供商，例如 `ollama/`、`petals/`、`replicate/`、`sagemaker/` 和 `predibase/`。`huggingface/` 和 `together_ai/` 调用的是提供商的 OpenAI 兼容对话补全 API，LiteLLM 会原样发送你的 `messages`，由提供商套用模型自带的对话模板。无论是下文的内置模板，还是通过 `register_prompt_template` 注册的模板，对它们都不生效。

对于原始提示词类提供商，LiteLLM 支持 [Hugging Face 对话模板](https://huggingface.co/docs/transformers/main/chat_templating)，并会回退到该模型在 Hugging Face Hub 上注册的对话模板（例如 [Mistral-7b](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1/blob/main/tokenizer_config.json#L32)）。在 `sagemaker/` 上，传入 `hf_model_name` 即可为端点的基座模型选择模板。热门模型的模板已随包内置保存。

| 模型名 | 适用模型 |
| -------- | -------- |
| mistralai/Mistral-7B-Instruct-v0.1 | mistralai/Mistral-7B-Instruct-v0.1 |
| meta-llama/Llama-2-7b-chat | 所有 meta-llama llama2 对话模型 |
| tiiuae/falcon-7b-instruct | 所有 falcon instruct 模型 |
| mosaicml/mpt-7b-chat | 所有 mpt 对话模型 |
| codellama/CodeLlama-34b-Instruct-hf | 所有 codellama instruct 模型 |
| WizardLM/WizardCoder-Python-34B-V1.0 | 所有 wizardcoder 模型 |
| Phind/Phind-CodeLlama-34B-v2 | 所有 phind-codellama 模型 |

[**跳转查看代码**](https://github.com/BerriAI/litellm/blob/main/litellm/litellm_core_utils/prompt_templates/factory.py)

## 自行格式化提示词

你也可以自行格式化提示词。注册模板时使用不带提供商前缀的模型名。方法如下：

```python 
import litellm
from litellm import completion

# Create your own custom prompt template 
litellm.register_prompt_template(
	    model="llama2",
        initial_prompt_value="You are a good assistant", # [OPTIONAL]
	    roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n", # [OPTIONAL]
                "post_message": "\n<</SYS>>\n [/INST]\n" # [OPTIONAL]
            },
            "user": { 
                "pre_message": "[INST] ", # [OPTIONAL]
                "post_message": " [/INST]" # [OPTIONAL]
            }, 
            "assistant": {
                "pre_message": "\n", # [OPTIONAL]
                "post_message": "\n" # [OPTIONAL]
            }
        },
        final_prompt_value="Now answer as best you can:" # [OPTIONAL]
)

messages = [{"role": "user", "content": "Hey, how's it going?"}]
response = completion(model="ollama/llama2", messages=messages, api_base="http://localhost:11434")
print(response['choices'][0]['message']['content'])
```

Ollama（`ollama/`，而非 `ollama_chat/`）、Petals、Replicate、SageMaker、Predibase 等原始提示词类提供商都支持这一做法。对 `huggingface/` 和 `together_ai/` 的对话模型则不产生任何效果。

其他提供商要么使用固定的提示词模板（如 Anthropic），要么直接接收对话消息并在服务端完成格式化（如 Hugging Face、Together AI）。如果我们还没覆盖你用的提供商，欢迎告诉我们！

## 所有提供商

下面是我们为所有提供商做格式化的代码。如有改进建议，欢迎告诉我们。


| 提供商 | 模型名 | 代码 |
| -------- | -------- | -------- |
| Anthropic | `claude-instant-1`, `claude-instant-1.2`, `claude-2` | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/anthropic.py#L84)
| OpenAI Text Completion | `text-davinci-003`, `text-curie-001`, `text-babbage-001`, `text-ada-001`, `babbage-002`, `davinci-002`, | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/main.py#L442)
| Replicate | 所有以 `replicate/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/replicate.py#L180)
| Cohere | `command-nightly`, `command`, `command-light`, `command-medium-beta`, `command-xlarge-beta`, `command-r-plus` | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/cohere.py#L115)
| Huggingface | 所有以 `huggingface/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/huggingface_restapi.py#L186)
| OpenRouter | 所有以 `openrouter/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/main.py#L611)
| AI21 | `j2-mid`, `j2-light`, `j2-ultra` | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/ai21.py#L107)
| VertexAI | `text-bison`, `text-bison@001`, `chat-bison`, `chat-bison@001`, `chat-bison-32k`, `code-bison`, `code-bison@001`, `code-gecko@001`, `code-gecko@latest`, `codechat-bison`, `codechat-bison@001`, `codechat-bison-32k` | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/vertex_ai.py#L89)
| Bedrock | 所有以 `bedrock/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/bedrock.py#L183)
| Sagemaker | `sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b` | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/sagemaker.py#L89)
| TogetherAI | 所有以 `together_ai/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/together_ai.py#L101)
| AlephAlpha | 所有以 `aleph_alpha/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/aleph_alpha.py#L184)
| Palm | 所有以 `palm/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/palm.py#L95)
| NLP Cloud | 所有以 `palm/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/nlp_cloud.py#L120)
| Petals | 所有以 `petals/` 开头的模型名 | [代码](https://github.com/BerriAI/litellm/blob/721564c63999a43f96ee9167d0530759d51f8d45/litellm/llms/petals.py#L87)
