# 规则

借助规则，你可以根据 LLM API 调用的输入或输出判定请求失败。


```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENROUTER_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 

litellm.post_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="{{openai_small}}", messages=[{"role": "user", 
"content": "Hey, how's it going?"}], fallbacks=["openrouter/gryphe/mythomax-l2-13b"])
```

## 可用端点

* `litellm.pre_call_rules = []` - 在发起 API 调用前依次执行的函数列表。每个函数应返回 True（放行调用）或 False（使调用失败）。

* `litellm.post_call_rules = []` - 在发起 API 调用前依次执行的函数列表。每个函数应返回 True（放行调用）或 False（使调用失败）。


## 规则的预期格式

```python
def my_custom_rule(input: str) -> bool: # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 
```

#### 输入
* `input`: *str*: 用户输入或 LLM 响应。

#### 输出
* `bool`: 返回 True（放行调用）或 False（使调用失败）


## 规则示例

### 示例 1：用户输入过长时使调用失败

```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if len(input) > 10: # fail call if too long
        return False 
    return True 

litellm.pre_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="{{openai_small}}", messages=[{"role": "user", "content": "Hey, how's it going?"}])
```

### 示例 2：LLM 拒绝回答时回退至无审查模型


```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENROUTER_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 

litellm.post_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="{{openai_small}}", messages=[{"role": "user", 
"content": "Hey, how's it going?"}], fallbacks=["openrouter/gryphe/mythomax-l2-13b"])
```
