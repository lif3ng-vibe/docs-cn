---
title: "Integrate with external tools"
description: "Connect Aperture with authorization engines, log aggregators, and external services."
---

Last validated Sep 29, 2026

Aperture supports integration with external tools for authorization, observability, and custom automation. Use hooks in the [Aperture configuration][docs-aperture-configuration] to send event data to third-party services when requests match grant conditions. For built-in observability features, refer to [Observe and export AI usage][docs-observe-and-export].

[**Integrate Cerbos with Aperture**](/docs/aperture/integrate/cerbos) — Send AI request data from Aperture to Cerbos for fine-grained authorization decisions on LLM access.

[**Integrate Cribl with Aperture**](/docs/aperture/integrate/cribl) — Route AI usage data from Aperture to Cribl for processing and forwarding to your observability destinations.

[**Integrate Highflame with Aperture**](/docs/aperture/integrate/highflame) — Connect Aperture to Highflame for synchronous pre-request enforcement and asynchronous post-response observability of LLM requests.

[**Manage an existing Oso integration**](/docs/aperture/integrate/oso) — Review and update an existing Oso integration's hook and data-sharing grants as an Aperture admin.

[**Build a custom webhook**](/docs/aperture/how-to/build-custom-webhook) — Create a custom webhook integration to send Aperture event data to your own services.

[**Aperture recipes**](/docs/aperture/reference/recipes) — Find, use, and contribute integration guides and examples in the open source aperture-recipes repository.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-observe-and-export]: /docs/aperture/observe-and-export
