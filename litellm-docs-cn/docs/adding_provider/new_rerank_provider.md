# 新增重排序提供商

所有重排序（rerank）提供商在 LiteLLM 中**统一遵循 Cohere Rerank API 格式**。下面介绍如何新增一个重排序提供商：

## 1. 新建 transformation.py 文件

新建一个配置类，命名为 `<Provider><Endpoint>Config`，继承 [`BaseRerankConfig`](https://github.com/BerriAI/litellm/blob/main/litellm/llms/base_llm/rerank/transformation.py)：

下面这些方法在 `BaseRerankConfig` 中都是抽象方法，六个全部实现之前，该类无法实例化：

```python
from typing import Any

import httpx

from litellm.litellm_core_utils.litellm_logging import Logging as LiteLLMLoggingObj
from litellm.llms.base_llm.rerank.transformation import BaseRerankConfig
from litellm.secret_managers.main import get_secret_str
from litellm.types.rerank import OptionalRerankParams, RerankRequest, RerankResponse


class YourProviderRerankConfig(BaseRerankConfig):
    def validate_environment(
        self,
        headers: dict,
        model: str,
        api_key: str | None = None,
        optional_params: dict | None = None,
        litellm_params: dict | None = None,
    ) -> dict:
        # Return the request headers, including auth
        api_key = api_key or get_secret_str("YOUR_PROVIDER_API_KEY")
        return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json", **headers}

    def get_complete_url(
        self,
        api_base: str | None,
        model: str,
        optional_params: dict | None = None,
    ) -> str:
        # Return the full URL the request is POSTed to
        return f"{api_base or 'https://api.your-provider.com'}/v1/rerank"

    def get_supported_cohere_rerank_params(self, model: str) -> list:
        return [
            "query",
            "documents",
            "top_n",
            # ... other supported params
        ]

    def map_cohere_rerank_params(
        self,
        non_default_params: dict,
        model: str,
        drop_params: bool,
        query: str,
        documents: list[str | dict[str, Any]],
        custom_llm_provider: str | None = None,
        top_n: int | None = None,
        rank_fields: list[str] | None = None,
        return_documents: bool | None = True,
        max_chunks_per_doc: int | None = None,
        max_tokens_per_doc: int | None = None,
        instruction: str | None = None,
    ) -> dict:
        # Map the Cohere-style params to the ones your provider accepts
        return dict(OptionalRerankParams(query=query, documents=documents, top_n=top_n))

    def transform_rerank_request(
        self,
        model: str,
        optional_rerank_params: dict,
        headers: dict,
        litellm_params: dict | None = None,
    ) -> dict:
        # Transform request to RerankRequest spec
        rerank_request = RerankRequest(model=model, **optional_rerank_params)
        return rerank_request.model_dump(exclude_none=True)

    def transform_rerank_response(
        self,
        model: str,
        raw_response: httpx.Response,
        model_response: RerankResponse,
        logging_obj: LiteLLMLoggingObj,
        api_key: str | None = None,
        request_data: dict = {},
        optional_params: dict = {},
        litellm_params: dict = {},
    ) -> RerankResponse:
        # Transform provider response to RerankResponse
        return RerankResponse(**raw_response.json())
```


## 2. 注册提供商
把你的提供商加入 [`litellm/utils.py`](https://github.com/BerriAI/litellm/blob/main/litellm/utils.py) 的 `ProviderConfigManager.get_provider_rerank_config()` 中。未在此处列出的提供商会回退到 `CohereRerankConfig`，随后 `litellm.rerank()` 抛出 `Unsupported provider`：

```python nolint
elif litellm.LlmProviders.YOUR_PROVIDER == provider:
    return litellm.YourProviderRerankConfig()
```


## 3. 将提供商加入 rerank_api/main.py

没有专属分支的提供商最终会走通用的 `else` 分支，该分支已经会用第 2 步返回的配置调用 `base_llm_http_handler.rerank`。只有当你的提供商需要自定义 `api_key` 或 `api_base` 解析逻辑时，才需要新增专属分支，并为其传入 `provider_config`。


```python nolint
elif _custom_llm_provider == "your_provider":
    ...
    response = base_llm_http_handler.rerank(
        model=model,
        custom_llm_provider=_custom_llm_provider,
        provider_config=rerank_provider_config,
        optional_rerank_params=optional_rerank_params,
        logging_obj=litellm_logging_obj,
        timeout=optional_params.timeout,
        api_key=dynamic_api_key or optional_params.api_key,
        api_base=api_base,
        _is_async=_is_async,
        headers=headers or litellm.headers or {},
        client=client,
        model_response=model_response,
        litellm_params=rerank_litellm_params,
    )
    ...
```

## 4. 添加测试

在 [`tests/llm_translation`](https://github.com/BerriAI/litellm/tree/main/tests/llm_translation) 中添加测试文件。

```python
def test_basic_rerank_cohere():
    response = litellm.rerank(
        model="cohere/rerank-english-v3.0",
        query="hello",
        documents=["hello", "world"],
        top_n=3,
    )

    print("re rank response: ", response)

    assert response.id is not None
    assert response.results is not None
```


## 参考 PR
- [新增 Infinity 重排序](https://github.com/BerriAI/litellm/pull/7321)
