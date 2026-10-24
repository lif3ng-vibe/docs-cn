---
title: "Set up LLM clients"
description: "Configure LLM clients to route requests through Aperture."
---

Last validated Sep 29, 2026

After [setting up Aperture][docs-get-started] and [configuring your providers][docs-set-up-providers], set up your LLM clients to route requests through your Aperture gateway.

Choose a setup method:

* Use the [Aperture CLI][docs-cli] to configure a client interactively.
* Copy [gateway-generated configuration][ar-gateway-generated-configuration] from the **Agents** page.
* Follow a client-specific guide below for manual setup and additional options.

Before choosing a client, compare its API requirements with your provider in [Supported providers and clients][docs-provider-compatibility].

## Client setup guides

[**Aperture CLI**](/docs/aperture/cli) — Use the Aperture CLI to discover, configure, and run coding agents that connect through your Aperture gateway.

[**Set up the chat UI**](/docs/aperture/how-to/set-up-chat-ui) — Configure models, curate the model picker, and manage access to the Aperture Chat interface.

[**Use Claude Code with Aperture**](/docs/aperture/how-to/use-claude-code) — Configure Claude Code to route requests through your Aperture gateway.

[**Use Claude Code Action with Aperture**](/docs/aperture/how-to/use-claude-code-action) — Configure the Claude Code GitHub Action to route requests through Aperture so CI runners authenticate with Tailscale identity instead of individual API keys.

[**Use Claude Desktop with Aperture**](/docs/aperture/how-to/use-claude-desktop) — Configure the Claude Desktop app to route Anthropic Messages model inference through your Aperture gateway.

[**Use Codex with Aperture**](/docs/aperture/how-to/use-codex) — Configure OpenAI Codex to route requests through your Aperture gateway.

[**Use OpenCode with Aperture**](/docs/aperture/how-to/use-opencode) — Configure OpenCode to route requests through your Aperture gateway.

[**Use OpenAI-compatible tools with Aperture**](/docs/aperture/how-to/use-openai-compatible-tools) — Configure Roo Code, Cline, and other clients that use OpenAI-compatible APIs to route requests through Aperture.

## Gateway-generated configuration

The Aperture gateway generates client settings from the models you have permission to use. Available clients and back ends depend on your gateway version, configured providers, and model grants.

Before you begin, install the client you want to configure and connect your device to the gateway's tailnet. For [Kilo Code][xt-kilo] and [Grok Build][xt-grok], use the client's installation instructions.

1. Open your Aperture gateway in a browser and select **Agents**, or visit `/agents` on the gateway's host.
2. Select your client. Search for **Kilo Code** or **Grok** if its card is not initially visible. A client appears only when the gateway can generate a compatible configuration for it.
3. If the client offers multiple modes, select the API-key, subscription, or provider-specific mode that matches your setup.
4. Apply the settings shown on the page:
   * For file-based configuration, create the named file or merge the generated keys. Keep any unrelated settings.
   * For clients such as GitHub Copilot CLI, add the generated environment variables to your shell profile and reload it.
5. Follow the page's model-selection and launch instructions. Send a test prompt, then use the setup page's verification control to check that Aperture received the request.

The generated configuration is specific to your gateway and model access. Regenerate it when your provider configuration or model grants change. Use the client documentation linked from the setup page for platform-specific file locations.

### Kilo Code

Select **Kilo Code** on the **Agents** page. Save the generated configuration as `kilo.jsonc` in your home configuration directory or the project's root. Refer to the [Kilo Code custom model documentation][xt-kilo-models] for details. Reopen Kilo Code and select an Aperture model.

The gateway generates separate AI SDK provider blocks for compatible APIs and model families. Only configured models you can access appear. The generated configuration does not use ChatGPT subscription authentication.

### Grok Build

Select **Grok** on the **Agents** page. Save or merge the generated TOML into `~/.grok/config.toml`. Start the client with `grok`, select a generated Aperture model, and send a test prompt. If Grok prompts for an xAI API key at startup, set `XAI_API_KEY=not-needed` for this launch. The generated per-model credentials take precedence for Aperture requests.

The generated configuration prefers OpenAI Chat Completions and uses Responses only for models without a Chat Completions route. The Grok Responses decoder has stricter response-shape requirements. If a response fails to decode, choose a model available through Chat Completions. This setup does not configure Anthropic Messages, native Google APIs, or Bedrock APIs.

### Other generated configurations

The **Agents** page also generates settings for Claude Code, Codex, OpenCode, GitHub Copilot CLI, Pi, and Hermes. Follow the instructions shown for the selected client. In particular:

* **GitHub Copilot CLI** uses environment variables in your shell profile, not a JSON configuration file.
* **Pi** uses `~/.pi/agent/models.json`. The [CLI launcher][docs-cli-pi] uses a temporary extension instead.
* **Hermes** uses `~/.hermes/config.yaml`. Merge the generated blocks into your existing file.

Gateway-generated configuration and CLI launchers can use different APIs for the same client, particularly OpenCode, Pi, and Hermes. Compare their back ends in the [client compatibility table][docs-client-compatibility].

\[Missing snippet: tailscale\_skill.mdx]

[ar-gateway-generated-configuration]: #gateway-generated-configuration

[docs-client-compatibility]: /docs/aperture/reference/supported-providers-clients#clients-and-agent-harnesses

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-cli]: /docs/aperture/cli

[docs-cli-pi]: /docs/aperture/cli#pi

[xt-kilo]: https://kilo.ai/docs

[xt-kilo-models]: https://kilo.ai/docs/code-with-ai/agents/custom-models

[xt-grok]: https://docs.x.ai/build/overview
