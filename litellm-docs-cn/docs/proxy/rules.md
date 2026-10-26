# 调用后规则（Post-Call Rules）

用它可以根据 LLM API 调用的输出判定请求失败。

## 快速上手

### 第 1 步：创建文件（如 post_call_rules.py）

```python
def my_custom_rule(input): # receives the model response 
    if len(input) < 5: 
      return {
            "decision": False,
            "message": "This violates LiteLLM Proxy Rules. Response too short"
      }
    return {"decision": True}   # message not required since, request will pass
```

### 第 2 步：将其指向你的代理

```yaml
litellm_settings:
  post_call_rules: post_call_rules.my_custom_rule
```

### 第 3 步：启动并测试你的代理

```bash
$ litellm /path/to/config.yaml
```

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
  "model": "{{openai_small}}",
  "messages": [{"role":"user","content":"What llm are you?"}],
  "temperature": 0.7,
  "max_tokens": 10,
}'
```
---

配置生效后，每次响应都会检查长度是否大于 5；不满足时会重试调用 3 次，仍不通过才判定请求失败。

### 违反规则的响应

这是违反规则时 LiteLLM 代理服务器返回的响应。

```json
{
  "error":
    {
      "message":"This violates LiteLLM Proxy Rules. Response too short",
      "type":null,
      "param":null,
      "code":500
    }
}   
```
