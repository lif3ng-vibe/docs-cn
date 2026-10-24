---
title: "Aperture recipes"
description: "[Aperture recipes][xt-recipes] is an open source repository of integration guides, examples, and templates maintained by Tailscale's Aperture team. It helps you connect third-party services and tools "
---

Last validated Sep 29, 2026

[Aperture recipes][xt-recipes] is an open source repository of integration guides, examples, and templates maintained by Tailscale's Aperture team. It helps you connect third-party services and tools to your Aperture gateway. Partners, vendors, and community members can share integration instructions in one place so others can adopt their tools without starting from scratch.

## What's in the repository

Recipes cover four integration types:

* **Pre-request hooks**: Inspect, modify, or block requests before they reach an LLM provider.
* **Post-response hooks**: Process completed requests for logging or auditing.
* **Providers**: Connect Aperture to LLM providers or resellers.
* **Tools**: Use Aperture with developer tools, platforms, or workflows.

Each recipe has a `README.md` with setup instructions and examples. Recipes can include supporting scripts or configuration files, but the repository is not a collection of deployable applications.

## Use a recipe

To use an existing integration:

1. Browse the [integrations directory][xt-integrations] for a relevant recipe.
2. Read its `README.md`, including prerequisites and any security considerations.
3. Follow the setup instructions, adapting configuration examples to your environment.
4. Follow the recipe's validation steps to check that the integration works.

## Contribute a recipe

To share an integration:

1. Fork the [repository][xt-recipes].
2. Copy the [integration template][xt-template] into the appropriate category.
3. Follow the [contributing guide][xt-contributing] to open a pull request.

For hook integrations, start with the [protocol quick reference][xt-protocol].

The Aperture team reviews submissions before merging them. Community recipes are maintained by their contributors and are not automatically part of the official Aperture documentation.

[xt-recipes]: https://github.com/tailscale/aperture-recipes

[xt-integrations]: https://github.com/tailscale/aperture-recipes/tree/main/integrations

[xt-template]: https://github.com/tailscale/aperture-recipes/blob/main/templates/integration.md

[xt-contributing]: https://github.com/tailscale/aperture-recipes/blob/main/CONTRIBUTING.md

[xt-protocol]: https://github.com/tailscale/aperture-recipes/blob/main/docs/protocol-reference.md
