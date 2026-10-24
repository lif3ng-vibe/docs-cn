---
title: "Model aliases"
description: "Configure model aliases, choose destinations, and apply grants, quotas, and hooks."
---

Last validated Oct 22, 2026

A model alias maps a stable, client-facing model name to a concrete provider and model in your Aperture gateway. You can use model aliases to control the models your clients, harnesses, or agents access from a central point (the Aperture configuration), without changing configurations on client devices.

Common use cases include:

* [Switch providers without changing the client model name][ar-switch-providers-without-changing-the-client-model-name]: Reroute requests to a backup provider during an upstream outage.
* [Keep a model family on the latest approved version][ar-keep-a-model-family-on-the-latest-approved-version]: Update underlying model releases without modifying client settings.
* [Give users a task-focused model name][ar-give-users-a-task-focused-model-name]: Provide recognizable names like `writing-assistant` that route to approved models.

## How aliases resolve

Aperture resolves model aliases using the `model_aliases` section of the gateway configuration.

To understand how resolution works, distinguish these concepts:

* **Model alias**: The stable, exact-match name sent in a request's JSON `model` field. Its configuration is the corresponding entry in `model_aliases.models`.
* **Destination array**: The ordered `dst` array belonging to one alias, not the alias itself and not a retry chain.
* **Destination**: One string in that array in `provider/model` format. `provider` is the key configured under `providers`, not its display name. The model segment can contain slashes if the provider uses namespaced IDs.
* **Strategy**: The rule that selects one array entry. The global setting is `model_aliases.strategy`. The per-alias setting is `model_aliases.models.<alias>.strategy`.

When a request arrives, Aperture compares the JSON `model` value against configured aliases. If a match exists, Aperture resolves the alias according to the active strategy and rewrites the request to the selected destination before checking authorization, quotas, hooks, and routing.

### Configuration schema

The `model_aliases` section accepts the following fields:

| Field                                   | Type             | Required            | Default                           | Description                                                                                                                  |
| --------------------------------------- | ---------------- | ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `model_aliases.strategy`                | string           | No                  | `first`                           | Default destination selection strategy: `first` or `last`.                                                                   |
| `model_aliases.models`                  | object           | No                  | Empty map                         | Map keyed by the exact alias name the client sends. Refer to the migration note below for the deprecated `virtual` fallback. |
| `model_aliases.models.<alias>`          | object           | Yes, for each alias | N/A                               | Alias configuration. The alias name must not be empty. The object must not be null.                                          |
| `model_aliases.models.<alias>.dst`      | array of strings | Yes                 | N/A                               | One or more `provider/model` destinations, in selection order.                                                               |
| `model_aliases.models.<alias>.strategy` | string           | No                  | Inherits `model_aliases.strategy` | Selection strategy for this alias. Overrides the default with `first` or `last`.                                             |

Acceptable strategies are exactly `first` and `last`. An omitted or empty global strategy defaults to `first`. An omitted or empty per-alias strategy inherits the global value.

An omitted or empty `model_aliases.models` map defines no aliases in that map. An alias routes requests only when a client sends its exact name.

Use `model_aliases` rather than deprecated `virtual`. Aperture reads `virtual` only when `model_aliases` has neither a nonempty `strategy` nor any entries in `models`. Move old entries instead of populating both sections, which blocks saving.

### Selection strategies

The selection strategy determines which destination Aperture picks from the `dst` array:

* `first` selects index 0, the first destination in the array.
* `last` selects the last destination in the array.

A per-alias `strategy` overrides the global default. If a destination array contains only one entry, Aperture selects that entry whether the strategy is `first` or `last`. If an array contains more than two entries, definitions between the first and last entries are never selected by either strategy. Aperture validates all entries in the array, including unselected middle entries.

The following snippet illustrates how global and per-alias strategies interact:

```json
{
  "model_aliases": {
    "strategy": "last",
    "models": {
      "claude-opus-5-5": {
        "strategy": "first",
        "dst": [
          "vercel/anthropic/claude-opus-5.5",
          "bedrock_mantle/anthropic.claude-opus-5-5",
          "anthropic/claude-opus-5-5"
        ]
      }
    }
  }
}
```

In this example, the per-alias `strategy: "first"` overrides the global setting, so Aperture routes requests for `claude-opus-5-5` to `vercel/anthropic/claude-opus-5.5`. If you remove the per-alias `strategy` field, the alias inherits global `strategy: "last"`, which selects `anthropic/claude-opus-5-5`. Because there is no middle selection strategy, selecting `bedrock_mantle/anthropic.claude-opus-5-5` requires moving that entry to the first or last position in the array.

This example illustrates the inheritance hierarchy. Because a global change affects every alias that inherits it, it is best practice to use the per-alias `strategy` field for outage mitigation and operational changes instead of the global strategy.

No selection strategy discovers model versions, retries other destinations, or balances traffic across entries. An Aperture gateway admin must manually update the configuration file to change the model alias assignment or strategy.

### Destination requirements

Every destination in a `dst` array must satisfy these requirements:

* The provider part must identify an enabled, configured provider in the `providers` map. It cannot use the reserved provider ID `aperture`.
* The model part must match a model explicitly listed in that provider's `models` array. A wildcard in the provider configuration does not satisfy this check.
* A destination must be formatted as `provider/model`. Bare model names or references to other aliases are not valid. Aperture resolves an alias once to a concrete model, not another alias.
* All distinct destinations in an array must share at least one API compatibility flag, such as `anthropic_messages`.
* The selected destination must support the exact API format sent by the client. For example, if the client sends Anthropic Messages requests, the selected destination must have `anthropic_messages: true`. API compatibility across destinations and client request support are separate conditions.

Aperture validates every destination when you save the configuration. If an inactive destination is misconfigured, the save is rejected even if the active destination is valid.

## Supported requests and model discovery

Model aliases work with requests that send a JSON `model` field to these endpoints:

* `/v1/chat/completions`
* `/v1/messages`
* `/v1/responses`

Model aliases do not convert API formats. The selected destination must support the request format your client sends. For supported endpoints by provider, refer to the [provider compatibility reference][docs-provider-compatibility].

Model aliases do not work with native APIs for Google Gemini, Gemini Enterprise Agent Platform, or Amazon Bedrock InvokeModel and Converse. Bedrock Mantle endpoints supporting standard Anthropic Messages work with model aliases. Legacy `/completions` and `/responses/compact` are not supported.

Aliases do not add entries to `/v1/models` responses or the Aperture chat picker. Use a client that allows you to enter an explicit model name rather than relying on automatic discovery. To customize model labels and ordering in the web chat interface, use [`chat_models`][docs-chat-models].

## Prerequisites

Before configuring model aliases, ensure you have:

* An [Aperture gateway][docs-get-started] with [admin access][docs-admin-access] to edit its configuration.
* The provider or providers named in your chosen recipe, configured with credentials for the exact models. Refer to the [Anthropic][docs-use-anthropic] and [Vercel][docs-use-vercel] setup guides for provider credentials, and the [OpenAI][docs-use-openai] guide if you use the version-upgrade or task-focused recipes. Each provider used in the provider-switching recipe needs `anthropic_messages: true`, enabled status, valid credentials, and the exact model ID listed in its `models` array.
* A device connected to your [tailnet][docs-tailnet] with `curl` installed, associated with a test user login.

> **Note:**
>
> The JSON examples in this guide are fragments to merge, not full replacement configurations. When integrating these examples into a configuration, take care to preserve administrator grants, existing aliases, providers, credentials, quotas, hooks, and unrelated settings. Additionally, you should add capabilities to an existing grant or append the example grant without duplicating a top-level key. Replace `alice@example.com` with your test user's login and example provider keys with your configured keys. [Grants are additive][docs-how-grants-work], including grants in your tailnet policy file. Choose alias names carefully: defining an alias that matches a concrete model redirects requests for that model to the alias destination. Avoid unintended name collisions that could intercept traffic intended for other models.

Run requests from the test user's tailnet-connected device, replacing `<aperture-hostname>` with your Aperture gateway's address. After configuring `claude-opus-5-5` in the provider-switching recipe, send the following request:

```shell
curl --fail-with-body http://<aperture-hostname>/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
```

For the other recipes, use the alias names and prompts shown in their request examples.

Because the test device connects over Tailscale, requests authenticate with the device's Tailscale identity. You do not need to pass a provider API key in the request.

To verify requests, check the HTTP response body and open **Administration** > [**Logs**][docs-dashboard-logs] in the Aperture dashboard. The logs record the resolved provider and model. Log detail depends on your gateway capture and retention settings. The response body's `model` field can reflect the upstream provider's canonical model ID rather than the alias name. Model aliases route requests, but they do not guarantee identical response metadata or preserve chat sessions across different models.

## Use cases

The first recipe configures three destinations and switches providers without changing the client request. The other recipes are independent and cover version upgrades and task-focused names.

### Switch providers without changing the client model name

Use a multi-destination alias to switch providers when an upstream provider experiences an outage. This recipe configures `claude-opus-5-5` with Vercel, AWS Bedrock Mantle, and Anthropic serving the exact same underlying Claude Opus model.

All three destinations pin the same model release across three providers:

* `vercel/anthropic/claude-opus-5.5`
* `bedrock_mantle/anthropic.claude-opus-5-5`
* `anthropic/claude-opus-5-5`

Native Amazon Bedrock `bedrock_model_invoke` and `bedrock_converse` endpoints use AWS-specific schemas and cannot share an API compatibility flag with Anthropic Messages endpoints. To route Claude Messages requests to Bedrock alongside Anthropic and Vercel, configure a Bedrock Mantle provider endpoint using the standard [Anthropic Messages API on AWS Bedrock][xt-bedrock-opus-model-card].

#### Configure the Bedrock Mantle provider

Before defining the alias, ensure that you have configured your Anthropic, Vercel, and Bedrock Mantle providers. Obtain an [AWS Bedrock API key][xt-bedrock-api-keys] with model access enabled in your target region. Bedrock Mantle supports standard bearer token authentication and does not require AWS SigV4 request signing.

Add the following `bedrock_mantle` provider fragment under `providers`:

```json
{
  "providers": {
    "bedrock_mantle": {
      "baseurl": "https://bedrock-mantle.us-east-1.api.aws/anthropic",
      "apikey": "<your-bedrock-api-key>",
      "authorization": "bearer",
      "models": [
        "anthropic.claude-opus-5-5"
      ],
      "cost_basis": "bedrock-mantle",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

Each provider must be enabled, supply valid credentials, and explicitly list its respective model ID in its `models` array:

* `anthropic`: includes `claude-opus-5-5` with `anthropic_messages: true`.
* `vercel`: includes `anthropic/claude-opus-5.5` with `anthropic_messages: true`.
* `bedrock_mantle`: includes `anthropic.claude-opus-5-5` with `anthropic_messages: true`.

#### Configure and switch the alias

Defining `claude-opus-5-5` redirects all requests that use that bare model name, not only the test user's requests. Before saving, grant every affected user access to all three destinations. Users with access only to the Anthropic destination can lose access when the alias selects Vercel or Bedrock Mantle.

To configure provider switching:

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Confirm that `anthropic`, `vercel`, and `bedrock_mantle` providers are configured and enabled, with `anthropic_messages: true` and their respective model IDs listed in `models`.

3. Merge the following fragment into your configuration. Replace `alice@example.com` with your test user login:

   ```json
   {
     "model_aliases": {
       "models": {
         "claude-opus-5-5": {
           "strategy": "first",
           "dst": [
             "vercel/anthropic/claude-opus-5.5",
             "bedrock_mantle/anthropic.claude-opus-5-5",
             "anthropic/claude-opus-5-5"
           ]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "vercel/anthropic/claude-opus-5.5" },
             { "models": "bedrock_mantle/anthropic.claude-opus-5-5" },
             { "models": "anthropic/claude-opus-5-5" }
           ]
         }
       }
     ]
   }
   ```

4. Save the configuration.

5. Send a request using `claude-opus-5-5`:

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -H "anthropic-version: 2023-06-01" \
    -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

6. Confirm that the request succeeds and that **Logs** shows model `vercel/anthropic/claude-opus-5.5`.

7. During an outage of the primary provider, replace only the `model_aliases.models.claude-opus-5-5` object in **Administration** > **Configuration** with the following object to select `last`:

   ```json
   {
     "strategy": "last",
     "dst": [
       "vercel/anthropic/claude-opus-5.5",
       "bedrock_mantle/anthropic.claude-opus-5-5",
       "anthropic/claude-opus-5-5"
     ]
   }
   ```

8. Save the configuration.

9. Repeat the exact same `curl` request without changing the client payload:

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -H "anthropic-version: 2023-06-01" \
    -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

10. Confirm that the request succeeds and that **Logs** now shows model `anthropic/claude-opus-5-5`.

11. When the primary provider recovers, change `strategy` back to `first` and save.

Because Aperture supports only `first` and `last` strategies, neither strategy selects middle entries such as `bedrock_mantle/anthropic.claude-opus-5-5`. To route traffic to Bedrock Mantle during an outage of both primary and secondary providers, move `bedrock_mantle/anthropic.claude-opus-5-5` to the first or last position in the `dst` array.

Provider switching is manual. If the selected destination fails, Aperture does not try another entry. Before relying on the switch, review permissions, quota and hook coverage, credentials, API support, and pricing for all three destinations.

### Keep a model family on the latest approved version

Use a model alias to provide a stable name such as `gpt-latest` that always routes to your organization's approved flagship model. When you approve a new version, update the alias destination in the gateway configuration. Client applications continue requesting `gpt-latest` without local changes.

In Aperture, "latest" represents an administrator-maintained configuration choice. Aperture does not automatically detect upstream releases, query provider version APIs, or guarantee upstream availability.

To configure and update a versioned alias:

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Confirm that your `openai` provider is enabled, has `openai_chat: true`, and explicitly includes both `gpt-5.5` and `gpt-6-sol` in its `models` array.

3. Merge the following fragment into your configuration. Replace `alice@example.com` with your test user login:

   ```json
   {
     "model_aliases": {
       "models": {
         "gpt-latest": {
           "dst": ["openai/gpt-5.5"]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "openai/gpt-5.5" },
             { "models": "openai/gpt-6-sol" }
          ]
         }
       }
     ]
   }
   ```

4. Save the configuration.

5. Send a request using the alias from your test device:

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-latest","messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

6. Confirm that the request succeeds and that the dashboard **Logs** show destination `openai/gpt-5.5`.

7. Replace only the `model_aliases.models.gpt-latest` object in **Administration** > **Configuration** with the following object:

   ```json
   {
     "dst": ["openai/gpt-6-sol"]
   }
   ```

8. Save the configuration.

9. Repeat the exact same `curl` request. Confirm that the request succeeds and that **Logs** now shows destination `openai/gpt-6-sol`.

Before approving future upgrades, review capabilities, cost differences, user grants, quotas, and hooks for the new destination.

### Give users a task-focused model name

Evaluate a model for writing tasks, then give users a recognizable name such as `writing-assistant`. Users do not need to know its provider-specific model ID. The alias does not appear automatically in model pickers.

An alias provides routing convenience only. It does not modify system prompts, enforce tone, or add specialized capabilities to the underlying model.

To configure a task-focused alias:

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Confirm that your `openai` provider is enabled and lists `gpt-5.4-mini` under `models` with `openai_chat: true`.

3. Merge the following fragment into your configuration:

   ```json
   {
     "model_aliases": {
       "models": {
         "writing-assistant": {
           "dst": ["openai/gpt-5.4-mini"]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "openai/gpt-5.4-mini" }
           ]
         }
       }
     ]
   }
   ```

4. Save the configuration.

5. Send a request with a writing prompt:

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"writing-assistant","messages":[{"role":"user","content":"Draft a short meeting follow-up."}]}'
   ```

6. Confirm that the response returns generated text and **Logs** records destination `openai/gpt-5.4-mini`.

7. Share the exact alias name `writing-assistant` and supported API requirements with your team. Instruct users to enter the name directly in clients that support explicit model configuration.

## Access and usage

Grants, quotas, hooks, and usage tracking use the resolved destination. Captured request bodies also contain the rewritten destination model, not the alias.

### Grants

Aperture grants authorize access to the resolved destination model, not the model alias name. To use an alias, a user must have:

* An Aperture role grant, such as `{ "role": "user" }`.
* A model capability granting access to the destination model, such as `{ "models": "openai/gpt-5.4-mini" }`. For setup, refer to [grant access to models][docs-grant-model-access].

If you configure a multi-destination alias for provider switching, grant access to all destinations in the array before initiating a switch. Access to a destination model also allows users to request that concrete model directly. Model aliases do not prevent direct requests or restrict access to destination models.

To verify access controls, test negative permissions using a separate user account:

1. Identify a separate test user account with a `user` role.
2. Verify that no grants in the Aperture configuration or tailnet policy file grant that user access to the alias destination model. Keep your administrative grants intact.
3. Send a request specifying the alias as that test user.
4. Confirm that Aperture returns HTTP 404 with a message such as `does not have permission to use model` that names the destination, not the alias.

### Quotas

Model-scoped quotas evaluate the resolved destination model rather than the alias name. When Aperture evaluates a request, it matches quota capabilities against the destination FQN.

Keep the following behaviors in mind:

* **Shared buckets across destinations**: If destination grants reference the same quota bucket, such as `daily:<user>`, usage accrues to that bucket regardless of which destination serves the request. A destination change does not create an alias-specific bucket.
* **Destination pricing**: Aperture calculates cost using the destination's configured or inferred pricing. Switching to a differently priced destination changes how quickly requests consume quota.
* **Quotas across models**: Quota capabilities without a `models` restriction apply to all accessible models, including any model resolved through an alias.

For full quota configuration options and bucket rules, refer to [Quotas][docs-quotas-config].

### Hooks

Model-scoped webhooks evaluate the resolved destination model rather than the alias name. When Aperture matches hooks, it uses the destination FQN.

Keep the following behaviors in mind:

* **Hook scoping**: A grant with `send_hooks` scoped to a model pattern matches only when the resolved destination matches that pattern. Hooks without a `models` restriction match every model the user can access.
* **Hook payload metadata**: The hook metadata and `model` field reflect the rewritten destination model, not the alias name. If your hook inspects the model name, configure it to expect the destination FQN.
* **Request body capture**: If a hook includes `request_body` in its `send` list, the hook receives the rewritten JSON request containing the destination model.
* **Hook definitions**: Defining a hook in the top-level `hooks` map does not attach it to requests. You must attach the hook through a grant's `send_hooks` array.

Hooks are policy and monitoring tools. They cannot alter routing or redirect an alias to a different destination. For hook setup, refer to [Hooks][docs-hooks-config].

### Policy integration example

The following configuration fragment demonstrates how grants, quotas, and hooks interact for the `claude-opus-5-5` multi-destination alias.

Before using this example, define `daily:<user>` under top-level `quotas` and a hook named `audit` under top-level `hooks`. For setup, refer to [quotas][docs-quotas-config] and [hooks][docs-hooks-config]. Substitute your existing bucket and hook names. In the provider-switching recipe's grant, add the `quotas` and `send_hooks` fields shown below to its three model capabilities. Keep the existing `src` and role. Do not add a second `grants` key.

```json
{
  "grants": [
    {
      "src": ["alice@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          {
            "models": "vercel/anthropic/claude-opus-5.5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          },
          {
            "models": "bedrock_mantle/anthropic.claude-opus-5-5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          },
          {
            "models": "anthropic/claude-opus-5-5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

In this example:

* All three destinations attach to the same `daily:<user>` bucket, preserving quota tracking across provider switches.
* All three destinations trigger the `audit` hook on completion, sending cost metrics without exposing prompt contents.
* If you opt into `request_body` in `send_hooks`, the webhook receives the rewritten request containing the concrete destination model.

## Limitations

Keep the following limitations in mind when designing alias configurations:

* **No automatic failover or load balancing**: If the selected destination returns an error or is unreachable, Aperture does not fail over to another destination in the array. The destination array is not an automated fallback list. Switching requires an administrator to update the configuration.
* **Configured concrete models only**: Destinations must be concrete models configured under enabled providers. An alias cannot point to another alias. Bare model names fail destination validation. The provider ID `aperture` is reserved.
* **Name collisions**: An alias name overrides any concrete model with the same name, including models used by the Aperture chat interface. Here, defining the alias `claude-opus-5-5` intentionally matches the concrete model name and redirects requests for that model to the alias destination. Avoid unintended name collisions that could intercept traffic intended for other models.
* **Supported APIs and explicit model names only**: Use a supported request format and a client that accepts an explicit model name. Aliases do not add entries to model lists or pickers. Refer to [supported requests and model discovery][ar-supported-requests-and-model-discovery].

## Troubleshooting

Aperture validates alias structure and destination requirements when you save the configuration in the dashboard or through the API. Both errors and warnings reject the save.

### Configuration errors

For configurations that use deprecated `virtual`, the validation messages use the `virtual.` prefix instead of `model_aliases.`.

The following structural validation errors prevent configuration saves:

| Condition                                         | Error or warning message                                                                       | Type    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| Invalid top-level strategy                        | `model_aliases.strategy: invalid value "{value}" (valid: "first", "last")`                     | Error   |
| Empty alias name                                  | `model_aliases.models: model id must not be empty`                                             | Error   |
| Null alias object                                 | `model_aliases.models.{alias}: model config must not be null`                                  | Error   |
| Invalid per-alias strategy                        | `model_aliases.models.{alias}.strategy: invalid value "{value}" (valid: "first", "last")`      | Error   |
| Missing or empty destination list                 | `model_aliases.models.{alias}.dst: must contain at least one destination`                      | Error   |
| Empty destination string                          | `model_aliases.models.{alias}.dst[{index}]: destination must not be empty`                     | Error   |
| Malformed destination string                      | `model_aliases.models.{alias}.dst[{index}]: "{destination}" is not a valid provider/model FQN` | Error   |
| Both `model_aliases` and `virtual` contain values | `model_aliases and virtual must not both be nonempty; use model_aliases instead of virtual`    | Warning |

The following destination validation errors prevent configuration saves:

| Condition                                                | Error message                                                                                            |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Provider not configured or uses reserved ID `aperture`   | `model_aliases.models.{alias}.dst[{index}]: provider "{provider}" is not configured`                     |
| Provider is disabled                                     | `model_aliases.models.{alias}.dst[{index}]: provider "{provider}" is disabled`                           |
| Model not explicitly listed in provider's `models` array | `model_aliases.models.{alias}.dst[{index}]: model "{model}" is not configured for provider "{provider}"` |
| Destinations do not share an API compatibility flag      | `model_aliases.models.{alias}.dst: destinations do not share any API compatibility: {details}`           |

Every destination in a `dst` array is validated upon save. If an inactive destination violates any condition, Aperture rejects the entire configuration update.

### Request failures

If a request using a model alias fails at runtime, check the following causes:

| Symptom                            | Diagnostic check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP 403 Forbidden                 | Verify that the user has an Aperture role grant (`{ "role": "user" }` or `{ "role": "admin" }`).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| HTTP 404 Not Found                 | Check that the alias name in the request matches the configuration key exactly. If the alias resolved, check whether the user has a grant for the resolved destination model, or whether the destination supports the requested API format. Aperture returns messages such as `no providers match model`, `no route found for model`, `does not have permission to use model`, or `model "..." is available via ..., not ...`. When an alias matches, the error message names the resolved destination rather than the alias. |
| HTTP 429 Too Many Requests         | Check the response and **Logs** for an assigned quota rejection or an upstream rate limit. Aperture quota errors use `insufficient_quota` for OpenAI requests and `rate_limit_error` for Anthropic requests. For diagnosis, refer to [troubleshooting Aperture][docs-troubleshooting].                                                                                                                                                                                                                                        |
| Client cannot find or select alias | Model aliases do not appear in `/v1/models` responses or the Aperture chat picker. Use a client that supports entering an explicit model name.                                                                                                                                                                                                                                                                                                                                                                                |
| Upstream provider error            | Verify that the upstream provider credentials are valid and have permission to call the resolved model, and that the provider endpoint is healthy.                                                                                                                                                                                                                                                                                                                                                                            |

For general gateway routing, authentication, and logging issues, refer to [Troubleshooting Aperture][docs-troubleshooting].

[ar-give-users-a-task-focused-model-name]: #give-users-a-task-focused-model-name

[ar-keep-a-model-family-on-the-latest-approved-version]: #keep-a-model-family-on-the-latest-approved-version

[ar-supported-requests-and-model-discovery]: #supported-requests-and-model-discovery

[ar-switch-providers-without-changing-the-client-model-name]: #switch-providers-without-changing-the-client-model-name

[docs-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-chat-models]: /docs/aperture/configuration#chat_models

[docs-dashboard-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-hooks-config]: /docs/aperture/configuration#hooks

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-quotas-config]: /docs/aperture/configuration#quotas

[docs-tailnet]: /docs/reference/glossary#tailnet

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-anthropic]: /docs/aperture/how-to/use-anthropic

[docs-use-openai]: /docs/aperture/how-to/use-openai

[docs-use-vercel]: /docs/aperture/how-to/use-vercel

[xt-bedrock-api-keys]: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html

[xt-bedrock-opus-model-card]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5-5.html
