---
title: "设置 Amazon Bedrock"
description: "在 Aperture 中配置 Amazon Bedrock 提供商，让你的团队通过 tailnet 访问 AWS 基础模型。Bedrock 使用特定区域的 URL，并有自己的模型命名约定，两者都需要在提供商定义中配置。"
---

最后验证于 Sep 28, 2026

在 Aperture 中配置 Amazon Bedrock 提供商，让你的团队通过 tailnet 访问 AWS 基础模型（foundation models）。Bedrock 使用特定区域的 URL，并有自己的模型命名约定，这两者都在提供商定义中配置。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个 AWS 账户，并已在目标区域启用 Bedrock 模型访问。
* 一个 [Bedrock API key][xt-bedrock-api-keys]。在 Amazon Bedrock 控制台中生成一个长期 API key。Aperture 把该 key 作为 bearer token 放在 `Authorization` 头中发送，不会验证 AWS 签名，也不会生成临时凭证。

## 配置提供商

在 [Aperture 配置][docs-aperture-configuration]中把 Amazon Bedrock 添加为提供商。Bedrock URL 是特定于区域的，格式为 `https://bedrock-runtime.<region>.amazonaws.com`。请查阅 [AWS Bedrock 文档][xt-bedrock-regions]，确认你选择的区域提供目标模型。

下面的示例展示了美国东部区域使用 Anthropic Claude 模型的配置。模型名称必须完全匹配，包括区域前缀和版本后缀。可用模型名称的完整列表参阅 [AWS Bedrock 文档][xt-bedrock-regions]。

```json
{
  "providers": {
    "bedrock": {
      "baseurl": "https://bedrock-runtime.us-east-1.amazonaws.com",
      "apikey": "<your-bedrock-api-key>",
      "authorization": "bearer",
      "models": [
        "us.anthropic.claude-haiku-4-5-20251001-v1:0",
        "us.anthropic.claude-sonnet-4-6",
        "us.anthropic.claude-opus-4-6-v1"
      ],
      "cost_basis": "bedrock-us",
      "compatibility": {
        "bedrock_model_invoke": true,
        "bedrock_converse": true
      }
    }
  }
}
```

把 `<your-bedrock-api-key>` 替换为你的 Bedrock API key。

各配置字段的含义如下：

* **`bedrock_model_invoke`** 启用 Bedrock InvokeModel 端点，这是标准的 Bedrock API，大多数编码工具都使用该端点。如果你的工具改用 Bedrock Converse API，请在 `compatibility` 段中添加 `"bedrock_converse": true`。两个开关可以同时启用。
* **`cost_basis`** 控制 Aperture 如何计算请求成本。Aperture 会从 Bedrock 兼容性开关推断出 `bedrock`。显式设置该字段可以固定推理得不到的区域变体。例如，美国区域定价可用 `bedrock-us`，欧盟区域定价可用 `bedrock-eu`。
* **`authorization`** 设为 `bearer`，因为 Aperture 把 API key 直接作为 bearer token 放在 `Authorization` 头中传递。

兼容性开关的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

## 后续步骤

配置并检查提供商之后，完成适用的任务：

* [授予模型访问权][docs-grant-model-access]，控制每个用户或组可以通过 Aperture 访问哪些 Bedrock 模型。
* [设置 LLM 客户端][docs-use-your-tools]，接入支持 Bedrock API 格式的编码工具。
* 兼容性开关与配置选项的完整列表参阅[兼容性开关参考][docs-provider-compatibility]。
* 多区域提供商设置与凭证轮换的详情参阅 [Aperture 配置参考][docs-aperture-configuration]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-bedrock-api-keys]: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html

[xt-bedrock-regions]: https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html
