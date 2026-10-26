# 补全函数 - completion()
输入参数与 <a href="https://platform.openai.com/docs/api-reference/chat/create" target="_blank" rel="noopener noreferrer">OpenAI 创建对话补全（Create chat completion）</a> **完全一致**，让你能够用相同的格式调用 **Azure OpenAI、Anthropic、Cohere、Replicate、OpenRouter、Novita AI** 的模型。

此外，liteLLM 还允许传入以下 **可选** 的 liteLLM 参数：
`force_timeout`, `azure`, `logger_fn`, `verbose`

## 输入 - 请求体
# 请求体

**必填字段**

- `model`: *string* - 要使用的模型 ID。哪些模型支持 Chat API，详见模型端点兼容性表。
  
- `messages`: *array* - 构成迄今为止对话的消息列表。

*注意* - 数组中的每条消息包含以下属性：

    - `role`: *string* - 消息作者的角色。可选值：system、user、assistant 或 function。
    
    - `content`: *string or null* - 消息的内容。所有消息都必须提供该字段，但带函数调用的 assistant 消息可以为 null。
    
    - `name`: *string (optional)* - 消息作者的名称。role 为 "function" 时必填。名称应与 content 中所表示函数的名称一致，可包含字符（a-z、A-Z、0-9）和下划线，最长 64 个字符。
    
    - `function_call`: *object (optional)* - 应调用的函数的名称与参数，由模型生成。


**可选字段**

- `functions`: *array* - 模型可用来生成 JSON 输入的函数列表。每个函数应包含以下属性：

    - `name`: *string* - 要调用的函数的名称。可包含 a-z、A-Z、0-9、下划线和连字符，最长 64 个字符。
    
    - `description`: *string (optional)* - 说明该函数用途的描述，帮助模型决定何时以及如何调用该函数。
    
    - `parameters`: *object* - 该函数接受的参数，以 JSON Schema 对象描述。
    
    - `function_call`: *string or object (optional)* - 控制模型如何响应函数调用。

- `temperature`: *number or null (optional)* - 要使用的采样温度，取值范围 0 到 2。较高的值（如 0.8）会让输出更随机，较低的值（如 0.2）则让输出更集中、更确定。

- `top_p`: *number or null (optional)* - 温度采样之外的另一种采样方式。它让模型只考虑累计概率位于 top_p 之内的 token。例如 0.1 表示只考虑概率质量最高的前 10% token。

- `n`: *integer or null (optional)* - 为每条输入消息生成的对话补全候选数量。

- `stream`: *boolean or null (optional)* - 设为 true 时，将以增量方式发送部分消息。token 一经可用便即时发出，最终以一条 [DONE] 消息结束流。

- `stop`: *string/ array/ null (optional)* - 最多 4 个停止序列，API 生成到这些序列时将停止继续生成 token。

- `max_tokens`: *integer (optional)* - 对话补全中可生成的最大 token 数。

- `presence_penalty`: *number or null (optional)* - 根据新 token 是否已在现有文本中出现，对其施加惩罚。

- `frequency_penalty`: *number or null (optional)* - 根据新 token 在现有文本中出现的频率，对其施加惩罚。

- `logit_bias`: *map (optional)* - 用于修改特定 token 出现在补全结果中的概率。

- `user`: *string (optional)* - 代表最终用户的唯一标识符。有助于 OpenAI 监测和检测滥用行为。
