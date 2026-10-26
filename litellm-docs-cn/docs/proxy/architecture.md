import { RequestFlowDiagram, RouterFlowDiagram, ImageFlowDiagram } from '@site/src/components/CloudArchitecture';

# 一次请求的生命周期

## 整体架构

<RequestFlowDiagram />


### 请求流程

1. **用户发送请求**：流程始于用户向 LiteLLM 代理服务器（网关）发起请求。

2. [**虚拟密钥**](./virtual_keys)（virtual key）：此阶段会校验请求中的 `Bearer` 令牌，确保其有效且未超出预算。[每次请求会执行的检查清单见这里](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/auth/auth_checks.py)
    - 2.1 检查虚拟密钥是否存在于 Redis 缓存或内存缓存中
    - 2.2 **若缓存中未命中**，则在数据库中查找该虚拟密钥

3. **限流**：[并行请求限制器](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter_v3.py)会检查以下各级的**速率限制**（RPM/TPM，即每分钟请求数 / 每分钟 Token 数）：
    - 全局服务器速率限制
    - 虚拟密钥速率限制
    - 用户速率限制
    - 团队限额

4. **LiteLLM `proxy_server.py`**：包含 `/chat/completions` 与 `/embeddings` 两个端点。发往这些端点的请求都会经由 LiteLLM Router 处理。

5. [**LiteLLM Router**](../routing)：LiteLLM Router 负责 LLM API 部署（deployment）的负载均衡（load balancing）、回退（fallback）与重试（retry）。

6. [**litellm.completion() / litellm.embedding()**：](../index.md#litellm-python-sdk) 借助 litellm Python SDK，以 OpenAI API 格式调用 LLM（负责格式转换与参数映射）。

7. **请求后处理**：响应返回客户端之后，还会执行以下**异步**任务：
   - [将日志写入 Lunary、MLflow、LangFuse 或其他日志目的地](./logging)
   - [并行请求限制器](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter_v3.py)会更新以下各级的 RPM/TPM 用量：
        - 全局服务器速率限制
        - 虚拟密钥速率限制
        - 用户速率限制
        - 团队限额
    - `_ProxyDBLogger` 会在 LiteLLM 数据库中更新花费与用量数据。[每次请求在数据库中记录了哪些内容，见这里](https://github.com/BerriAI/litellm/blob/main/schema.prisma)

## 路由器：回退与重试

<RouterFlowDiagram />

上文第 5 步将请求交给 LiteLLM Router，由它负责负载均衡、回退与重试。所有统一端点（`.completion`、`.embeddings` 等）都以同样的方式经过它。

请求首先进入 `function_with_fallbacks`，它用 try-except 包裹调用，以便在主部署失败时回退到其他部署。随后进入 `function_with_retries`，它再次包裹调用，在请求失败时对同一模型组（model group）内的可用部署进行重试。最后，`function_with_retries` 会调用 litellm 的基础统一函数（如 `litellm.completion` 或 `litellm.embeddings`），由它真正向 LLM API 发起请求。

**model_group** 指共享同一个 `model_name`、可在其上进行负载均衡的一组 LLM API 部署。

## 图片 URL 处理

<ImageFlowDiagram />

有些 LLM API 不接受图片 URL，只接受 base64 字符串。针对这类 API，LiteLLM 会检测请求中的 URL，确认目标 API 是否支持 URL；若不支持，就下载图片并把 base64 字符串发给提供商（provider）。转换后的图片最多会在内存中缓存 10 张，以降低重复调用时的延迟；单张图片的下载大小上限为 50MB，可通过 `MAX_IMAGE_URL_DOWNLOAD_SIZE_MB` 配置。

## 常见问题

1. 数据库事务是否与请求的生命周期绑定？
    - 不绑定，数据库事务与请求的生命周期无关。
    - 校验虚拟密钥是否有效时，若缓存未命中，则依赖一次数据库读取。
    - 其余所有数据库事务都在后台任务中异步执行。
