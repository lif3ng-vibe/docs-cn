import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 新增防护栏集成

你要创建一个类，在文本发往 LLM 之前或从 LLM 返回之后对其进行检查。一旦违反你设定的规则，就将其拦截。

## 工作原理

带防护栏（guardrail）的请求：

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "How do I hack a system?"}],
    "guardrails": ["my-guardrail"]
}'
```

防护栏会先检查输入，再检查输出。发现问题就抛出异常。

## 构建你的防护栏

### 创建目录

```bash
mkdir -p litellm/proxy/guardrails/guardrail_hooks/my_guardrail
cd litellm/proxy/guardrails/guardrail_hooks/my_guardrail
```

需要两个文件：`my_guardrail.py`（主类）和 `__init__.py`（初始化文件）。

### 编写主类

`my_guardrail.py`：

请参照[自定义防护栏](/docs/proxy/guardrails/custom_guardrail#1-write-a-customguardrail-class)教程进行。

### 创建初始化文件

`__init__.py`：

```python
from typing import TYPE_CHECKING

from litellm.types.guardrails import SupportedGuardrailIntegrations

from .my_guardrail import MyGuardrail

if TYPE_CHECKING:
    from litellm.types.guardrails import Guardrail, LitellmParams


def initialize_guardrail(litellm_params: "LitellmParams", guardrail: "Guardrail"):
    import litellm
    
    _my_guardrail_callback = MyGuardrail(
        api_base=litellm_params.api_base,
        api_key=litellm_params.api_key,
        guardrail_name=guardrail.get("guardrail_name", ""),
        event_hook=litellm_params.mode,
        default_on=litellm_params.default_on,
    )
    
    litellm.logging_callback_manager.add_litellm_callback(_my_guardrail_callback)
    return _my_guardrail_callback


guardrail_initializer_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: initialize_guardrail,
}

guardrail_class_registry = {
    SupportedGuardrailIntegrations.MY_GUARDRAIL.value: MyGuardrail,
}
```

### 注册防护栏类型

在 `litellm/types/guardrails.py` 中添加：

```python
class SupportedGuardrailIntegrations(str, Enum):
    LAKERA = "lakera_prompt_injection"
    APORIA = "aporia"
    BEDROCK = "bedrock_guardrails"
    PRESIDIO = "presidio"
    ZSCALER_AI_GUARD = "zscaler_ai_guard"
    MY_GUARDRAIL = "my_guardrail"
```

## 用法

### 配置文件

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
    api_key: os.environ/OPENAI_API_KEY

guardrails:
    - guardrail_name: my_guardrail
      litellm_params:
        guardrail: my_guardrail
        mode: during_call
        api_key: os.environ/MY_GUARDRAIL_API_KEY
        api_base: https://api.myguardrail.com
```

### 按请求启用

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Test message"}],
    "guardrails": ["my_guardrail"]
}'
```

## 测试

在 `test_litellm/` 目录中添加单元测试。
