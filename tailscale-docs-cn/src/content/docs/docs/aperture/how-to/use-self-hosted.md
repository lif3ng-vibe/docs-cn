---
title: "设置自托管提供商"
description: "把自托管的 LLM 服务器配置为 Aperture 中的提供商，让你的团队通过 tailnet 访问私有模型。此设置使用 OpenAI 兼容的 Chat Completions API。Aperture 同时支持 `/v1/chat/completions` 和 `/chat/completions` 路径。"
---

最后验证于 Sep 29, 2026

把自托管的 LLM 服务器配置为 Aperture 中的提供商，让你的团队通过 tailnet 访问私有模型。此设置使用 OpenAI 兼容的 Chat Completions API。Aperture 同时支持 `/v1/chat/completions` 和 `/chat/completions` 路径。常见服务器包括 llama.cpp、vLLM 和 Ollama。请核实你的服务器支持客户端所需的 API 特性。云端托管的提供商参阅[设置 OpenAI 兼容提供商][docs-use-openai-compatible-provider]。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一台 Aperture 网关可以访问的自托管 LLM 服务器——可以就在网关上，也可以通过 tailnet 访问。

## 配置提供商

在你的 [Aperture 配置][docs-aperture-configuration]中把自托管服务器添加为提供商：

```json
{
  "providers": {
    "private": {
      "baseurl": "http://<self-hosted-server>:8080",
      "models": ["qwen3-coder:30b", "llama3.1:70b"]
    }
  }
}
```

把 `<self-hosted-server>` 替换为你服务器的主机名或 Tailscale IP 地址。示例使用的是 Ollama 模型标签，并假设你的服务器已提供这些模型。要找到服务器正确的模型名称，请查询其模型列表端点（通常是 `GET /v1/models`），并使用响应中的 `id` 字段。把模型添加到 Aperture 并不会把它安装到你的服务器上。

在 `baseurl` 中，`localhost` 指的是 Aperture 网关，而不是你的设备。只有当服务器就在网关本身上可访问时才使用它。对其他设备上的服务器，请使用其 tailnet 主机名或 Tailscale IP 地址。

> **注意：**
>
> Aperture 会把完整的传入请求路径拼接到 `baseurl` 后面。对 `/v1/chat/completions` 请求，请从 `baseurl` 末尾去掉 `/v1`，以免出现 `/v1/v1` 重复路径。更早的路径前缀要保留。发送 `/chat/completions` 的客户端可能反而需要在 `baseurl` 中带上 `/v1`。详情参阅 [Aperture 如何构造上游 URL][docs-aperture-url-construction]。

自托管提供商默认使用 `openai_chat` 兼容性和 `bearer` 授权。具备 OpenAI 兼容 Chat Completions API 的服务器无需额外开关。其他 API 格式请设置对应的[兼容性开关][docs-provider-compatibility]。

如果服务器不需要认证，请省略 `apikey` 字段。如果服务器要求密钥，请在提供商块中添加 `"apikey": "<your-key>"`。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#兼容性标志

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider
