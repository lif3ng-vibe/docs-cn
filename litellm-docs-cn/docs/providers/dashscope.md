# DashScope API（Qwen 模型）
https://dashscope.console.aliyun.com/

:::info
该平台现已更名：中国大陆以外称 QwenCloud，中国大陆境内称 Qianwen AI Platform。`qwencloud/` 与 `qwen_ai_platform/` 前缀请参见 [QwenCloud 与 Qianwen AI Platform 页面](./qwencloud)。`dashscope/` 前缀仍作为别名受到完整支持
:::

**我们支持来自阿里云的全部 Qwen 模型，发送补全（completion）请求时只需加上 `dashscope/` 前缀即可**

## API 密钥
```python
# env variable
os.environ['DASHSCOPE_API_KEY']
```

## API 地址
你可以根据所在区域按需指定 API base URL：

| 区域 | API 地址 |
|--------|----------|
| **国际版** | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| **中国/北京** | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

```python
# Set via environment variable
os.environ['DASHSCOPE_API_BASE'] = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# Or pass directly in the completion call
response = completion(
    model="dashscope/qwen-turbo",
    messages=[{"role": "user", "content": "hello"}],
    api_base="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
```

## 用法示例
```python
from litellm import completion
import os

os.environ['DASHSCOPE_API_KEY'] = ""
response = completion(
    model="dashscope/qwen-turbo", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 流式用法示例
```python
from litellm import completion
import os

os.environ['DASHSCOPE_API_KEY'] = ""
response = completion(
    model="dashscope/qwen-turbo", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 全部支持的模型

[DashScope 模型列表](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope?spm=a2c4g.11186623.help-menu-2400256.d_2_8_0.1efd516e2tTXBn&scm=20140722.H_2833609._.OR_help-T_cn~zh-V_1#7f9c78ae99pwz)

| 模型名称               | 调用方式                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| qwen-turbo | `completion(model="dashscope/qwen-turbo", messages)` | 
| qwen-plus | `completion(model="dashscope/qwen-plus", messages)` | 
| qwen-max | `completion(model="dashscope/qwen-max", messages)` | 
| qwen-turbo-latest | `completion(model="dashscope/qwen-turbo-latest", messages)` | 
| qwen-plus-latest | `completion(model="dashscope/qwen-plus-latest", messages)` | 
| qwen-max-latest | `completion(model="dashscope/qwen-max-latest", messages)` | 
| qwen-vl-plus | `completion(model="dashscope/qwen-vl-plus", messages)` |  
| qwen-vl-max | `completion(model="dashscope/qwen-vl-max", messages)` |  
| qwq-32b | `completion(model="dashscope/qwq-32b", messages)` |  
| qwq-32b-preview | `completion(model="dashscope/qwq-32b-preview", messages)` |  
| qwen3-235b-a22b | `completion(model="dashscope/qwen3-235b-a22b", messages)` |  
| qwen3-32b | `completion(model="dashscope/qwen3-32b", messages)` |  
| qwen3-30b-a3b | `completion(model="dashscope/qwen3-30b-a3b", messages)` |
