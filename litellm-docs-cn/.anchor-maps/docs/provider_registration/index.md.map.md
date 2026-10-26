Quick Start for OpenAI-Compatible Providers | OpenAI 兼容提供商快速上手 | openai-兼容提供商快速上手
Overview | 概述 | 概述
1. Create Your Config Class | 1. 创建配置类 | 1-创建配置类
`litellm/llms/your_provider_name_here` | `litellm/llms/your_provider_name_here` | litellmllmsyour_provider_name_here
`litellm/llms/your_provider_name_here/chat/transformation.py` | `litellm/llms/your_provider_name_here/chat/transformation.py` | litellmllmsyour_provider_name_herechattransformationpy
2. Add Yourself To Various Places In The Code Base | 2. 在代码库的多处登记自己 | 2-在代码库的多处登记自己
`litellm/__init__.py` | `litellm/__init__.py` | litellm__init__py
`litellm/main.py` | `litellm/main.py` | litellmmainpy
`litellm/constants.py` | `litellm/constants.py` | litellmconstantspy
`litellm/litellm_core_utils/get_llm_provider_logic.py` | `litellm/litellm_core_utils/get_llm_provider_logic.py` | litellmlitellm_core_utilsget_llm_provider_logicpy
`litellm/litellm_core_utils/streaming_handler.py` | `litellm/litellm_core_utils/streaming_handler.py` | litellmlitellm_core_utilsstreaming_handlerpy
If you are doing something custom with streaming, this needs to be updated, e.g. | 如果你在流式处理上做了自定义，这里也需要更新，例如： | 如果你在流式处理上做了自定义这里也需要更新例如
3. Write a test file to iterate your code | 3. 写一个测试文件来迭代你的代码 | 3-写一个测试文件来迭代你的代码
4. Implement Required Methods | 4. 实现必要的方法 | 4-实现必要的方法
`validate_environment` | `validate_environment` | validate_environment
`get_complete_url` | `get_complete_url` | get_complete_url
`transform_request` | `transform_request` | transform_request
`transform_response` | `transform_response` | transform_response
`get_sync_custom_stream_wrapper` / `get_async_custom_stream_wrapper` | `get_sync_custom_stream_wrapper` / `get_async_custom_stream_wrapper` | get_sync_custom_stream_wrapper--get_async_custom_stream_wrapper
🧪 Tests | 🧪 测试 | -测试
Spare thoughts | 补充想法 | 补充想法
