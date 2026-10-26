# [已弃用] 基于区域的路由

:::info

此功能已弃用，请改用[基于标签的路由](./tag_routing.md)。

:::


将特定客户路由到仅限 eu 区域的模型。

为客户指定"allowed_model_region"后，LiteLLM 会过滤掉模型组（model group）中所有不在允许区域（即"eu"）内的模型。

[**查看代码**](https://github.com/BerriAI/litellm/blob/5eb12e30cc5faa73799ebc7e48fc86ebf449c879/litellm/router.py#L2938)

### 1. 创建带区域指定的客户

这里要用的是 litellm 的"end-user"对象。

在 openai 格式的对话补全（chat completion）或嵌入（embedding）调用中，把"user"参数传给 litellm，即可追踪并标识终端用户。

```bash
curl -X POST --location 'http://0.0.0.0:4000/end_user/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "user_id" : "ishaan-jaff-45",
    "allowed_model_region": "eu", # 👈 SPECIFY ALLOWED REGION='eu'
}'
```

### 2. 向模型组添加 eu 模型

把 eu 模型加入一个模型组。用"region_name"参数为每个模型指定所属区域。

目前支持的区域有"eu"和"us"。

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/{{openai_small}} # 👈 EU azure model
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: os.environ/AZURE_EUROPE_API_KEY
      region_name: "eu"
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY
      region_name: "us"

router_settings:
  enable_pre_call_checks: true # 👈 IMPORTANT
```

启动代理服务器：

```yaml
litellm --config /path/to/config.yaml
```

### 3. 测试一下

向代理发起一个简单的对话补全调用。在响应头中，你应该能看到返回的 api base。

```bash
curl -X POST --location 'http://localhost:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
    }],
    "user": "ishaan-jaff-45" # 👈 USER ID
}
'
```

响应头中预期的 API Base：

```
x-litellm-api-base: "https://my-endpoint-europe-berri-992.openai.azure.com/"
x-litellm-model-region: "eu" # 👈 CONFIRMS REGION-BASED ROUTING WORKED
```

### 常见问题（FAQ）

**如果该区域没有可用模型会怎样？**

由于路由器（Router）会过滤掉不在指定区域内的模型，一旦该区域没有可用模型，请求就会以错误的形式返回给用户。
