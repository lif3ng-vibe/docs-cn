# 模型访问的工作原理

## 核心概念

每一个接入的模型，在 LiteLLM 中就是一份"模型部署（model deployment）"。

这些模型部署通过 config.yaml 中的 "model_name" 字段，被归入一个"模型组（model group）"。

## 示例

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

这里为模型 `{{openai_large}}` 接入一份模型部署，并将其归入模型组 `my-custom-model`。

## 客户端请求

客户端发起的请求如下所示：

```bash
curl --location 'http://localhost:4000/chat/completions' \
-H 'Authorization: Bearer <your-api-key>' \
-H 'Content-Type: application/json' \
-d '{"model": "my-custom-model", "messages": [{"role": "user", "content": "Hello, how are you?"}]}'

```

## 访问控制

给某个密钥、用户或团队授权时，实际授予的是对某个"模型组"的访问权限。

示例：

```bash
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["my-custom-model"]}'
```

## 负载均衡

可以把多份模型部署放进同一个"模型组"，LiteLLM 会自动在组内的模型部署之间对请求做负载均衡（load balancing）。

示例：

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: my-custom-model
    litellm_params:
      model: azure/{{openai_large}}
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: os.environ/AZURE_API_VERSION
```

这样就能把多个模型部署各自的速率限制（rate limit）额度充分用满。

## 回退机制

可以在不同模型组之间设置回退（fallback）。当某个"模型组"里的所有"模型部署"都不可用（例如持续抛出 429 错误）时，这个机制就派上用场了。

示例：

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: my-other-model
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  fallbacks: [{"my-custom-model": ["my-other-model"]}]
```

回退按顺序执行：列表中的第一个模型组会先被尝试，如果失败，再尝试下一个模型组。


## 进阶：模型访问组

针对更复杂的使用场景，可以使用[模型访问组](./model_access_groups)动态地把多个模型组织成组并管理访问权限，无需重启代理。
