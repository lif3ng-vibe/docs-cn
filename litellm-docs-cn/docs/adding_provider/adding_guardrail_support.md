# 为端点添加防护栏支持

本指南介绍如何为新的 LiteLLM 端点（例如 Chat Completions、Responses API 等）添加防护栏（guardrails）翻译支持。

## 何时需要添加防护栏支持

在以下情况下需要添加防护栏支持：
- 你正在创建新的 LiteLLM 端点（例如一种新的 API 格式）
- 你想为尚不支持防护栏的现有端点启用防护栏
- 你需要针对特定消息格式的自定义文本提取逻辑

## 目录结构

防护栏处理类（handler）遵循以下目录结构：

```
litellm/llms/{provider}/{endpoint}/guardrail_translation/
├── __init__.py          # 导出处理类并注册调用类型
├── handler.py           # 处理类主实现
└── README.md            # 文档（可选但推荐）
```

### 结构示例

**OpenAI Chat Completions：**
```
litellm/llms/openai/chat/guardrail_translation/
├── __init__.py
├── handler.py
└── README.md
```

**OpenAI Responses API：**
```
litellm/llms/openai/responses/guardrail_translation/
├── __init__.py
├── handler.py
└── README.md
```

**Anthropic Messages：**
```
litellm/llms/anthropic/chat/guardrail_translation/
├── __init__.py
└── handler.py
```

## 分步实现

### 步骤 1：创建处理类

创建继承自 `BaseTranslation` 的 `handler.py`：

```python
"""
{Provider} {Endpoint} Handler for Unified Guardrails

This module provides guardrail translation support for {Provider}'s {Endpoint} format.
"""

from typing import TYPE_CHECKING, Any, Dict, List, Optional, Tuple, Union, cast

from litellm._logging import verbose_proxy_logger
from litellm.llms.base_llm.guardrail_translation.base_translation import BaseTranslation
from litellm.types.utils import GenericGuardrailAPIInputs

if TYPE_CHECKING:
    from litellm.integrations.custom_guardrail import CustomGuardrail
    from litellm.litellm_core_utils.litellm_logging import Logging as LiteLLMLoggingObj
    from litellm.proxy._types import UserAPIKeyAuth
    from litellm.types.utils import ModelResponse  # Or appropriate response type


class MyEndpointHandler(BaseTranslation):
    """
    Handler for processing {Endpoint} with guardrails.

    This class provides methods to:
    1. Process input (pre-call hook)
    2. Process output response (post-call hook)
    """

    async def process_input_messages(
        self,
        data: dict,
        guardrail_to_apply: "CustomGuardrail",
        litellm_logging_obj: Optional["LiteLLMLoggingObj"] = None,
    ) -> Any:
        """
        Process input by applying guardrails to text content.

        Args:
            data: Request data dictionary
            guardrail_to_apply: The guardrail instance to apply
            litellm_logging_obj: Logging object for the call, forwarded to the guardrail

        Returns:
            Modified data with guardrails applied
        """
        # Your implementation here
        pass

    async def process_output_response(
        self,
        response: Any,  # Use appropriate response type
        guardrail_to_apply: "CustomGuardrail",
        litellm_logging_obj: Optional["LiteLLMLoggingObj"] = None,
        user_api_key_dict: Optional["UserAPIKeyAuth"] = None,
        request_data: dict | None = None,
    ) -> Any:
        """
        Process output response by applying guardrails to text content.

        Args:
            response: API response object
            guardrail_to_apply: The guardrail instance to apply
            litellm_logging_obj: Logging object for the call, forwarded to the guardrail
            user_api_key_dict: Caller identity, passed separately since the response has none
            request_data: The originating request body

        Returns:
            Modified response with guardrails applied
        """
        # Your implementation here
        pass
```

### 步骤 2：实现核心方法

#### A. 处理输入消息

从输入中提取文本、应用防护栏，再映射回原结构：

```python
async def process_input_messages(
    self,
    data: dict,
    guardrail_to_apply: "CustomGuardrail",
    litellm_logging_obj: Optional["LiteLLMLoggingObj"] = None,
) -> Any:
    """Process input messages by applying guardrails to text content."""
    # 1. Get input data from request
    messages = data.get("messages")  # or appropriate field
    if messages is None:
        return data

    # 2. Extract text into a flat list, remembering where each item came from
    texts_to_check: List[str] = []
    task_mappings: List[Tuple[int, Optional[int]]] = []

    for msg_idx, message in enumerate(messages):
        self._extract_input_texts(
            message=message,
            msg_idx=msg_idx,
            texts_to_check=texts_to_check,
            task_mappings=task_mappings,
        )

    # 3. Apply the guardrail to everything in one call
    if texts_to_check:
        guardrailed_inputs = await guardrail_to_apply.apply_guardrail(
            inputs=GenericGuardrailAPIInputs(texts=texts_to_check),
            request_data=data,
            input_type="request",
            logging_obj=litellm_logging_obj,
        )

        # 4. Map the returned texts back to the original structure
        await self._apply_guardrail_responses_to_input(
            messages=messages,
            responses=guardrailed_inputs.get("texts", []),
            task_mappings=task_mappings,
        )

    return data
```

`GenericGuardrailAPIInputs` 还可以携带 `images`、`tools`、`tool_calls`、`structured_messages` 和 `model` 这几个键。把你的端点格式中存在的键填上，防护栏返回了哪些，就把哪些映射回原结构。

所有内容放在一次调用里发送，而不是每条消息各调一次。这样防护栏提供方能一次看到完整对话，你也只需承担一次往返开销，而不是多次。

#### B. 处理输出响应

从响应中提取文本、应用防护栏，再更新响应：

```python
async def process_output_response(
    self,
    response: "ModelResponse",
    guardrail_to_apply: "CustomGuardrail",
    litellm_logging_obj: Optional["LiteLLMLoggingObj"] = None,
    user_api_key_dict: Optional["UserAPIKeyAuth"] = None,
    request_data: dict | None = None,
) -> Any:
    """Process output response by applying guardrails to text content."""
    # 1. Check if response has text to process
    if not self._has_text_content(response):
        return response

    # 2. Extract text into a flat list, remembering where each item came from
    texts_to_check: List[str] = []
    task_mappings: List[Tuple[int, Optional[int]]] = []

    for idx, item in enumerate(response.choices):  # or appropriate field
        self._extract_output_texts(
            item=item,
            idx=idx,
            texts_to_check=texts_to_check,
            task_mappings=task_mappings,
        )

    # 3. Apply the guardrail to everything in one call
    if texts_to_check:
        guardrailed_inputs = await guardrail_to_apply.apply_guardrail(
            inputs=GenericGuardrailAPIInputs(texts=texts_to_check),
            request_data=request_data or {},
            input_type="response",
            logging_obj=litellm_logging_obj,
        )

        # 4. Update response with guardrailed text
        await self._apply_guardrail_responses_to_output(
            response=response,
            responses=guardrailed_inputs.get("texts", []),
            task_mappings=task_mappings,
        )

    return response
```

### 步骤 3：创建辅助方法

实现用于文本提取与映射的辅助方法：

```python
def _extract_input_texts(
    self,
    message: Dict[str, Any],
    msg_idx: int,
    texts_to_check: List[str],
    task_mappings: List[Tuple[int, Optional[int]]],
) -> None:
    """Extract text content from a message and record where each piece came from."""
    content = message.get("content")
    if content is None:
        return

    if isinstance(content, str):
        # Simple string content
        texts_to_check.append(content)
        task_mappings.append((msg_idx, None))
    elif isinstance(content, list):
        # List content (e.g., multimodal)
        for content_idx, content_item in enumerate(content):
            if isinstance(content_item, dict):
                text_str = content_item.get("text")
                if text_str:
                    texts_to_check.append(text_str)
                    task_mappings.append((msg_idx, int(content_idx)))

async def _apply_guardrail_responses_to_input(
    self,
    messages: List[Dict[str, Any]],
    responses: List[str],
    task_mappings: List[Tuple[int, Optional[int]]],
) -> None:
    """Apply guardrail responses back to input messages."""
    for task_idx, guardrail_response in enumerate(responses):
        msg_idx, content_idx = task_mappings[task_idx]
        
        if content_idx is None:
            # String content
            messages[msg_idx]["content"] = guardrail_response
        else:
            # List content
            messages[msg_idx]["content"][content_idx]["text"] = guardrail_response

def _has_text_content(self, response: Any) -> bool:
    """Check if response has any text content to process."""
    # Implement based on your response structure
    return True  # or appropriate logic
```

### 步骤 4：注册处理类

创建 `__init__.py`，把处理类注册到对应的调用类型上：

```python nolint
"""My Endpoint handler for Unified Guardrails."""

from litellm.llms.{provider}/{endpoint}/guardrail_translation.handler import (
    MyEndpointHandler,
)
from litellm.types.utils import CallTypes

guardrail_translation_mappings = {
    CallTypes.my_endpoint: MyEndpointHandler,
    CallTypes.amy_endpoint: MyEndpointHandler,  # async version if applicable
}

__all__ = ["guardrail_translation_mappings"]
```

**重要提示**：确保你的 `CallTypes` 已定义在 `litellm/types/utils.py` 中。

### 步骤 5：添加文档

创建 `README.md`，写清用法示例与数据格式细节：

```markdown
# {Provider} {Endpoint} Guardrail Translation Handler

Handler for processing {Provider}'s {Endpoint} with guardrails.

## Overview

This handler processes {Endpoint} input/output by:
1. Extracting text from messages/responses
2. Applying guardrails to text content
3. Mapping guardrailed text back to original structure

## Data Format

### Input Format
```json
{
  "field": "value",
  "messages": [...]
}
```

### Output Format
```json
{
  "field": "value",
  "output": [...]
}
```

## Usage

The handler is automatically discovered and applied when guardrails are used with this endpoint.

```bash
curl -X POST 'http://localhost:4000/{my_endpoint}' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["test"]
}'

```
## Extension

Override these methods to customize behavior:
- `_extract_input_texts()`: Custom text extraction
- `_apply_guardrail_responses_to_input()`: Custom response mapping
- `_has_text_content()`: Custom content detection
```

### 步骤 6：添加单元测试

在 `tests/test_litellm/llms/{provider}/{endpoint}/` 下编写完善的测试：

```python
"""
Unit tests for {Provider} {Endpoint} Guardrail Translation Handler
"""

import os
import sys
from typing import TYPE_CHECKING, Literal, Optional

import pytest

sys.path.insert(0, os.path.abspath("../../../../../.."))

from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.llms import get_guardrail_translation_mapping
from litellm.llms.{provider}.{endpoint}.guardrail_translation.handler import (
    MyEndpointHandler,
)
from litellm.types.utils import CallTypes, GenericGuardrailAPIInputs

if TYPE_CHECKING:
    from litellm.litellm_core_utils.litellm_logging import Logging as LiteLLMLoggingObj


class MockGuardrail(CustomGuardrail):
    """Mock guardrail for testing"""

    async def apply_guardrail(
        self,
        inputs: GenericGuardrailAPIInputs,
        request_data: dict,
        input_type: Literal["request", "response"],
        logging_obj: Optional["LiteLLMLoggingObj"] = None,
    ) -> GenericGuardrailAPIInputs:
        inputs["texts"] = [f"{text} [GUARDRAILED]" for text in inputs.get("texts", [])]
        return inputs


class TestHandlerDiscovery:
    """Test that the handler is properly discovered"""
    
    def test_handler_discovered(self):
        handler_class = get_guardrail_translation_mapping(CallTypes.my_endpoint)
        assert handler_class == MyEndpointHandler


class TestInputProcessing:
    """Test input processing functionality"""
    
    @pytest.mark.asyncio
    async def test_process_simple_input(self):
        handler = MyEndpointHandler()
        guardrail = MockGuardrail(guardrail_name="test")
        
        data = {"messages": [{"role": "user", "content": "Hello"}]}
        result = await handler.process_input_messages(data, guardrail)
        
        assert result["messages"][0]["content"] == "Hello [GUARDRAILED]"


class TestOutputProcessing:
    """Test output processing functionality"""
    
    @pytest.mark.asyncio
    async def test_process_simple_output(self):
        handler = MyEndpointHandler()
        guardrail = MockGuardrail(guardrail_name="test")
        
        # Create mock response
        response = create_mock_response()
        result = await handler.process_output_response(response, guardrail)
        
        # Assert guardrail was applied
        assert "GUARDRAILED" in get_response_text(result)
```

## 支持

如有疑问或遇到问题：
- 查看现有处理类实现，参考示例
- 查阅基础翻译类（base translation class）的文档
- 在 GitHub 上创建 issue，并打上 `guardrails` 标签
