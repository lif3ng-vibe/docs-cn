# 函数调用

## 检查模型是否支持函数调用

使用 `litellm.supports_function_calling(model="")`：模型支持函数调用（function calling）时返回 `True`，不支持时返回 `False`。

```python
assert litellm.supports_function_calling(model="{{openai_small}}") == True
assert litellm.supports_function_calling(model="azure/{{openai_large}}") == True
assert litellm.supports_function_calling(model="palm/chat-bison") == False
assert litellm.supports_function_calling(model="xai/grok-2-latest") == True
assert litellm.supports_function_calling(model="ollama/llama2") == False
```


## 检查模型是否支持并行函数调用

使用 `litellm.supports_parallel_function_calling(model="")`：模型支持并行函数调用（parallel function calling）时返回 `True`，不支持时返回 `False`。

```python keep-model-ids
assert litellm.supports_parallel_function_calling(model="gpt-5.6-terra") == True
assert litellm.supports_parallel_function_calling(model="gpt-4") == False
```
## 并行函数调用
并行函数调用指模型同时发起多个函数调用的能力，这些调用产生的效果与结果可以并行处理。

## 快速上手：gpt-3.5-turbo-1106
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/Parallel_function_calling.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>

本例中我们只定义一个函数 `get_current_weather`。

- 第 1 步：把 `get_current_weather` 连同用户问题一起发给模型
- 第 2 步：解析模型响应的输出，用模型给出的参数执行 `get_current_weather`
- 第 3 步：把 `get_current_weather` 函数的运行结果发回给模型


### 完整代码：使用 `gpt-3.5-turbo-1106` 的并行函数调用

```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request

# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})


def test_parallel_function_call():
    try:
        # Step 1: send the conversation and available functions to the model
        messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_current_weather",
                    "description": "Get the current weather in a given location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA",
                            },
                            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                        },
                        "required": ["location"],
                    },
                },
            }
        ]
        response = litellm.completion(
            model="{{openai_small}}",
            messages=messages,
            tools=tools,
            tool_choice="auto",  # auto is default, but we'll be explicit
        )
        print("\nFirst LLM Response:\n", response)
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        print("\nLength of tool calls", len(tool_calls))

        # Step 2: check if the model wanted to call a function
        if tool_calls:
            # Step 3: call the function
            # Note: the JSON response may not always be valid; be sure to handle errors
            available_functions = {
                "get_current_weather": get_current_weather,
            }  # only one function in this example, but you can have multiple
            messages.append(response_message)  # extend conversation with assistant's reply

            # Step 4: send the info for each function call and function response to the model
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions[function_name]
                function_args = json.loads(tool_call.function.arguments)
                function_response = function_to_call(
                    location=function_args.get("location"),
                    unit=function_args.get("unit"),
                )
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": function_response,
                    }
                )  # extend conversation with function response
            second_response = litellm.completion(
                model="{{openai_small}}",
                messages=messages,
            )  # get a new response from the model where it can see the function response
            print("\nSecond LLM response:\n", second_response)
            return second_response
    except Exception as e:
      print(f"Error occurred: {e}")

test_parallel_function_call()
```

### 说明：并行函数调用
下面逐步拆解上面的代码片段，说明 `gpt-3.5-turbo-1106` 上并行函数调用的执行过程。
### 第 1 步：在 litellm.completion() 中把 `tools` 设为 `get_current_weather`
```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = litellm.completion(
    model="{{openai_small}}",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
```

##### 预期输出
从输出中可以看到，模型多次调用该函数：旧金山、东京、巴黎各一次。
```python
ModelResponse(
  id='chatcmpl-8MHBKZ9t6bXuhBvUMzoKsfmmlv7xq', 
  choices=[
    Choices(finish_reason='tool_calls', 
    index=0, 
    message=Message(content=None, role='assistant', 
      tool_calls=[
        ChatCompletionMessageToolCall(id='call_DN6IiLULWZw7sobV6puCji1O', function=Function(arguments='{"location": "San Francisco", "unit": "celsius"}', name='get_current_weather'), type='function'), 

        ChatCompletionMessageToolCall(id='call_ERm1JfYO9AFo2oEWRmWUd40c', function=Function(arguments='{"location": "Tokyo", "unit": "celsius"}', name='get_current_weather'), type='function'), 
        
        ChatCompletionMessageToolCall(id='call_2lvUVB1y4wKunSxTenR0zClP', function=Function(arguments='{"location": "Paris", "unit": "celsius"}', name='get_current_weather'), type='function')
        ]))
    ], 
    created=1700319953, 
    model='{{openai_small}}', 
    object='chat.completion', 
    system_fingerprint='fp_eeff13170a',
    usage={'completion_tokens': 77, 'prompt_tokens': 88, 'total_tokens': 165}, 
    _response_ms=1177.372
)
```

### 第 2 步：解析模型响应并执行函数
发出初始请求后，解析模型响应，找出它想发起的函数调用。本例中预期会有三次工具调用（tool call），分别对应一个地点：旧金山、东京和巴黎。

```python
# Check if the model wants to call a function
if tool_calls:
    # Execute the functions and prepare responses
    available_functions = {
        "get_current_weather": get_current_weather,
    }

    messages.append(response_message)  # Extend conversation with assistant's reply

    for tool_call in tool_calls:
      print(f"\nExecuting tool call\n{tool_call}")
      function_name = tool_call.function.name
      function_to_call = available_functions[function_name]
      function_args = json.loads(tool_call.function.arguments)
      # calling the get_current_weather() function
      function_response = function_to_call(
          location=function_args.get("location"),
          unit=function_args.get("unit"),
      )
      print(f"Result from tool call\n{function_response}\n")

      # Extend conversation with function response
      messages.append(
          {
              "tool_call_id": tool_call.id,
              "role": "tool",
              "name": function_name,
              "content": function_response,
          }
      )

```

### 第 3 步：第二次 litellm.completion() 调用
函数执行完成后，把每次函数调用及其对应结果的信息发回给模型。这样模型在生成新响应时，就能把函数调用带来的影响考虑进去。
```python
second_response = litellm.completion(
    model="{{openai_small}}",
    messages=messages,
)
print("Second Response\n", second_response)
```

#### 预期输出
```python
ModelResponse(
  id='chatcmpl-8MHBLh1ldADBP71OrifKap6YfAd4w', 
  choices=[
    Choices(finish_reason='stop', index=0, 
    message=Message(content="The current weather in San Francisco is 72°F, in Tokyo it's 10°C, and in Paris it's 22°C.", role='assistant'))
  ], 
  created=1700319955, 
  model='{{openai_small}}', 
  object='chat.completion', 
  system_fingerprint='fp_eeff13170a', 
  usage={'completion_tokens': 28, 'prompt_tokens': 169, 'total_tokens': 197}, 
  _response_ms=1032.431
)
```

## Azure OpenAI 的并行函数调用
```python
# set Azure env variables
import os
os.environ['AZURE_API_KEY'] = "" # litellm reads AZURE_API_KEY from .env and sends the request
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test-v-1.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-07-01-preview"

import litellm
import json
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

## Step 1: send the conversation and available functions to the model
messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = litellm.completion(
    model="azure/chatgpt-functioncalling", # model = azure/<your-azure-deployment-name>
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
print("\nTool Choice:\n", tool_calls)

## Step 2 - Parse the Model Response and Execute Functions
# Check if the model wants to call a function
if tool_calls:
    # Execute the functions and prepare responses
    available_functions = {
        "get_current_weather": get_current_weather,
    }

    messages.append(response_message)  # Extend conversation with assistant's reply

    for tool_call in tool_calls:
      print(f"\nExecuting tool call\n{tool_call}")
      function_name = tool_call.function.name
      function_to_call = available_functions[function_name]
      function_args = json.loads(tool_call.function.arguments)
      # calling the get_current_weather() function
      function_response = function_to_call(
          location=function_args.get("location"),
          unit=function_args.get("unit"),
      )
      print(f"Result from tool call\n{function_response}\n")

      # Extend conversation with function response
      messages.append(
          {
              "tool_call_id": tool_call.id,
              "role": "tool",
              "name": function_name,
              "content": function_response,
          }
      )

## Step 3 - Second litellm.completion() call
second_response = litellm.completion(
    model="azure/chatgpt-functioncalling",
    messages=messages,
)
print("Second Response\n", second_response)
print("Second Response Message\n", second_response.choices[0].message.content)

```

## 已弃用：使用 `completion(functions=functions)` 的函数调用
```python
import os, litellm
from litellm import completion

os.environ['OPENAI_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

# python function that will get executed
def get_current_weather(location):
  if location == "Boston, MA":
    return "The weather is 12F"

# JSON Schema to pass to OpenAI
functions = [
    {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  ]

response = completion(model="{{openai_small}}", messages=messages, functions=functions)
print(response)
```

## litellm.function_to_dict：将函数转换为 OpenAI 函数调用可用的字典
`function_to_dict` 可以读取函数的 docstring，生成一份 OpenAI 函数调用可用的字典。

### 使用 `function_to_dict`
1. 定义你的函数 `get_current_weather`
2. 为函数 `get_current_weather` 补充 docstring
3. 把函数传给 `litellm.utils.function_to_dict`，得到 OpenAI 函数调用所需的字典

```python
# function with docstring
def get_current_weather(location: str, unit: str):
        """Get the current weather in a given location

        Parameters
        ----------
        location : str
            The city and state, e.g. San Francisco, CA
        unit : {'celsius', 'fahrenheit'}
            Temperature unit

        Returns
        -------
        str
            a sentence indicating the weather
        """
        if location == "Boston, MA":
            return "The weather is 12F"

# use litellm.utils.function_to_dict to convert function to dict
function_json = litellm.utils.function_to_dict(get_current_weather)
print(function_json)
```

#### function_to_dict 的输出
```python
{
    'name': 'get_current_weather', 
    'description': 'Get the current weather in a given location', 
    'parameters': {
        'type': 'object', 
        'properties': {
            'location': {'type': 'string', 'description': 'The city and state, e.g. San Francisco, CA'}, 
            'unit': {'type': 'string', 'description': 'Temperature unit', 'enum': "['fahrenheit', 'celsius']"}
        }, 
        'required': ['location', 'unit']
    }
}
```

### 在函数调用中使用 function_to_dict
```python
import os, litellm
from litellm import completion

os.environ['OPENAI_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

def get_current_weather(location: str, unit: str):
    """Get the current weather in a given location

    Parameters
    ----------
    location : str
        The city and state, e.g. San Francisco, CA
    unit : str {'celsius', 'fahrenheit'}
        Temperature unit

    Returns
    -------
    str
        a sentence indicating the weather
    """
    if location == "Boston, MA":
        return "The weather is 12F"

functions = [litellm.utils.function_to_dict(get_current_weather)]

response = completion(model="{{openai_small}}", messages=messages, functions=functions)
print(response)
```

## 让不支持函数调用的模型使用函数调用

### 将函数加入提示词
对于不支持函数调用的模型或提供商，LiteLLM 允许把函数直接加入提示词，只需设置：`litellm.add_function_to_prompt = True`

#### 用法
```python keep-model-ids
import os, litellm
from litellm import completion

# IMPORTANT - Set this to TRUE to add the function to the prompt for Non OpenAI LLMs
litellm.add_function_to_prompt = True # set add_function_to_prompt for Non OpenAI LLMs

os.environ['ANTHROPIC_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

def get_current_weather(location):
  if location == "Boston, MA":
    return "The weather is 12F"

functions = [
    {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  ]

response = completion(model="claude-2", messages=messages, functions=functions)
print(response)
```
