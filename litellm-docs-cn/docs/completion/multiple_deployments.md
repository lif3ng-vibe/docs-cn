# 多个部署

如果同一个模型有多份部署（deployment），你可以把部署列表一并传入，LiteLLM 会返回最先得到的结果。

## 快速上手

多家提供商都提供 Mistral-7B-Instruct。

下面演示如何用 litellm 返回最先得到的结果：

```python
from litellm import completion

messages=[{"role": "user", "content": "Hey, how's it going?"}]

## All your mistral deployments ##
model_list = [{
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call
        "model": "replicate/mistralai/mistral-7b-instruct-v0.1:83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70",
        "api_key": "replicate_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call
        "model": "together_ai/mistralai/Mistral-7B-Instruct-v0.1",
        "api_key": "togetherai_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call
        "model": "together_ai/mistralai/Mistral-7B-Instruct-v0.1",
        "api_key": "togetherai_api_key",
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": { # params for litellm completion/embedding call
        "model": "perplexity/mistral-7b-instruct",
		"api_key": "perplexity_api_key"
    }
}, {
	"model_name": "mistral-7b-instruct",
	"litellm_params": {
		"model": "deepinfra/mistralai/Mistral-7B-Instruct-v0.1",
		"api_key": "deepinfra_api_key"
	}
}]

## LiteLLM completion call ## returns first response
response = completion(model="mistral-7b-instruct", messages=messages, model_list=model_list)

print(response)
```
