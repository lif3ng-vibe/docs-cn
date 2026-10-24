---
title: "Set up Amazon Bedrock"
description: "Configure an Amazon Bedrock provider in Aperture so your team can access AWS foundation models through your tailnet. Bedrock uses region-specific URLs and has its own model naming conventions, both of"
---

Last validated Sep 28, 2026

Configure an Amazon Bedrock provider in Aperture so your team can access AWS foundation models through your tailnet. Bedrock uses region-specific URLs and has its own model naming conventions, both of which you configure in the provider definition.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* An AWS account with Bedrock model access enabled in your target region.
* A [Bedrock API key][xt-bedrock-api-keys]. Generate a long-term API key in the Amazon Bedrock console. Aperture sends this key as a bearer token in the `Authorization` header and does not verify AWS signatures or generate temporary credentials.

## Configure the provider

Add Amazon Bedrock as a provider in your [Aperture configuration][docs-aperture-configuration]. Bedrock URLs are region-specific, using the format `https://bedrock-runtime.<region>.amazonaws.com`. Check the [AWS Bedrock documentation][xt-bedrock-regions] to confirm your target models are available in your chosen region.

The following example shows a configuration for the US East region with Anthropic Claude models. Model names must match exactly, including the region prefix and version suffix. Refer to the [AWS Bedrock documentation][xt-bedrock-regions] for the full list of available model names.

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

Replace `<your-bedrock-api-key>` with your Bedrock API key.

The configuration fields work as follows:

* **`bedrock_model_invoke`** enables the Bedrock InvokeModel endpoint, which is the standard Bedrock API. Most coding tools use this endpoint. If your tools use the Bedrock Converse API instead, add `"bedrock_converse": true` to the `compatibility` section. You can enable both flags simultaneously.
* **`cost_basis`** controls how Aperture calculates costs for requests. Aperture infers `bedrock` from the Bedrock compatibility flags. Set this field explicitly to pin a regional variant that inference cannot produce. For example, you can use `bedrock-us` for US-region pricing or `bedrock-eu` for EU-region pricing.
* **`authorization`** is set to `bearer` because Aperture passes the API key directly as a bearer token in the `Authorization` header.

For the full list of compatibility flags, refer to the [compatibility flags reference][docs-provider-compatibility].

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

## Next steps

After you configure and check the provider, complete the applicable tasks:

* [Grant model access][docs-grant-model-access] to control which Bedrock models each user or group can access through Aperture.
* [Set up LLM clients][docs-use-your-tools] to connect coding tools that support the Bedrock API formats.
* Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of compatibility flags and configuration options.
* Refer to the [Aperture configuration reference][docs-aperture-configuration] for details on multi-region provider setups and credential rotation.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-bedrock-api-keys]: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html

[xt-bedrock-regions]: https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html
