---
title: "Aperture configuration reference"
description: "Reference for Aperture configuration fields, defaults, and validation errors."
---

Last validated Oct 1, 2026

> **Note:**
>
> You can purchase tokens directly within Aperture. To use your own API keys with Aperture on a plan other than the personal Tailscale plan, [contact sales][co-contact-sales].

[Aperture by Tailscale][docs-aperture] uses a JSON configuration for LLM providers, access control, and integrations. It controls which models are available, how requests authenticate with providers, and who can access them.

Admins can edit the complete configuration as HuJSON at `/admin/settings/config`, under **Administration** > **Configuration** in the [admin dashboard][docs-aperture-dashboard-admin]. HuJSON accepts comments and trailing commas, as shown in the following examples. Standard JSON is also valid. Visual editors include **Providers** at `/admin/settings/providers` and **Grants** at `/admin/settings/grants`.

This topic is part of the [Aperture reference][docs-aperture-reference] documentation.

> **Note:**
>
> Use the visual editors under **Administration** for most configuration tasks. Use this reference to review the complete configuration, automate updates, or set options that the visual editors do not expose.

## Minimal configuration

A typical setup includes at least one provider with a base URL and at least one model. If you use only MCP servers or connectors, you can omit providers. Keep or add [role and model grants][docs-aperture-grant-model-access] so that users can access the model. The following example is a provider-only fragment. Add it to your current configuration instead of using it to replace the configuration:

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<anthropic-api-key>",
      "models": [
        "claude-sonnet-5-5",
        "claude-opus-5-5",
      ],
      "authorization": "x-api-key",
      "compatibility": {
        "anthropic_messages": true,
      }
    }
  }
}
```

If you omit `apikey`, Aperture continues to run. Most providers require an API key for authentication, so add one unless your provider handles authentication differently.

> **Note:**
>
> The `apikey` field takes an API key from the provider's developer platform, which is the standard way to authenticate a provider. Consumer and business subscription plans such as [Claude Pro or Claude Max][xt-anthropic-plans], [ChatGPT Plus, Pro, or Team][xt-openai-plans], and [Gemini Advanced][xt-gemini-plans] issue OAuth tokens rather than API keys, so there is no key to put in this field. To use a subscription plan, configure the provider with `auth_mode: "passthrough"` and let each client forward its own credential to the upstream. For more information, refer to [Set up passthrough mode][docs-use-passthrough-mode].

## Default configuration

New Aperture gateways include the managed Aperture provider and subscription passthrough providers for Claude and ChatGPT. The default grants everyone who can reach the gateway admin access, access to all models, and access to Aperture's built-in system tools until you narrow the grants.

The following configuration shows the shipped defaults. These model lists are a configuration snapshot, not recommendations or a guarantee of upstream availability. Refer to the [subscription passthrough guides][docs-use-passthrough-mode] when configuring clients and updating these lists.

```json
{
  "providers": {
    "aperture": {},
    "anthropic-sub": {
      "name": "Anthropic (Subscription)",
      "apikey": "",
      "auth_mode": "passthrough",
      "authorization": "x-api-key",
      "baseurl": "https://api.anthropic.com",
      "compatibility": {"anthropic_messages": true},
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-haiku-4-5",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-opus-5",
        "claude-sonnet-4-6",
        "claude-sonnet-5"
      ]
    },
    "openai-sub": {
      "name": "OpenAI (Subscription)",
      "apikey": "",
      "auth_mode": "passthrough",
      "authorization": "bearer",
      "baseurl": "https://chatgpt.com/backend-api/codex",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      },
      "models": [
        "gpt-5.5",
        "gpt-5.5-pro",
        "gpt-5.6-luna",
        "gpt-5.6-sol",
        "gpt-5.6-terra"
      ]
    }
  },
  "chat_models": [{"model": "**"}],
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [{"role": "admin"}]
      }
    },
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user", "models": "**"},
          {"connectors": ["label:system"]}
        ]
      }
    }
  ]
}
```

## Configuration reference

The following table describes the top-level configuration sections and the Aperture behavior each controls:

| Section           | Required | Description                                                                                                                                                                                                                                                                                                            |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers`       | No       | Map of LLM provider configurations. Tailscale recommends at least one provider or MCP server/connector.                                                                                                                                                                                                                |
| `model_aliases`   | No       | Model aliases that map names to `provider/model` destinations.                                                                                                                                                                                                                                                         |
| `grants`          | No       | Access control policies for users, models, and quotas. Uses the Tailscale grant structure.                                                                                                                                                                                                                             |
| `quotas`          | No       | Dollar-based spending limits using token buckets.                                                                                                                                                                                                                                                                      |
| `hooks`           | No       | Webhook endpoint configurations.                                                                                                                                                                                                                                                                                       |
| `exporters`       | No       | LLM session log export configuration. Supports S3-compatible storage.                                                                                                                                                                                                                                                  |
| `database`        | No       | Data storage settings, including capture retention policies.                                                                                                                                                                                                                                                           |
| `connectors`      | No       | Outbound integrations (MCP servers and HTTP APIs) with authentication.                                                                                                                                                                                                                                                 |
| `auto_cost_basis` | No       | Boolean (default `true`). When `true` and no explicit `cost_basis` is set, Aperture recognizes OpenRouter and Vercel AI Gateway from the provider `baseurl`, then falls back to the provider's compatibility flags. Set to `false` to disable inferred token-rate estimates. Provider-supplied costs remain available. |
| `flags`           | No       | Experimental feature flags. Each key is a flag ID containing a `value` boolean. Refer to the [flags reference][ar-flags-section] for flag statuses and validation behavior.                                                                                                                                            |
| `virtual`         | No       | Deprecated model alias syntax. Use `model_aliases` instead.                                                                                                                                                                                                                                                            |
| `mcp`             | No       | Deprecated MCP server proxying configuration. Use `connectors` instead.                                                                                                                                                                                                                                                |
| `temp_grants`     | No       | Deprecated access control syntax. Use `grants` instead.                                                                                                                                                                                                                                                                |

### `providers`

The `providers` section specifies the LLM providers to which Aperture routes requests. A unique string key identifies each provider. The following example shows the basic structure:

```json
{
  "providers": {
    "openai": { ... },
    "anthropic": { ... },
    "private": { ... }
  }
}
```

Each provider configuration accepts the following fields:

| Field            | Type   | Required | Default                                    | Description                                                                                                                                                                                                                               |
| ---------------- | ------ | -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseurl`        | string | Yes      | N/A                                        | Base URL for the provider's API.                                                                                                                                                                                                          |
| `models`         | array  | Yes      | `[]`                                       | List of model IDs available from this provider. A provider with no models cannot serve requests.                                                                                                                                          |
| `apikey`         | string | No       | `""`                                       | API key for authentication.                                                                                                                                                                                                               |
| `authorization`  | string | No       | `"bearer"`                                 | Authorization header type.                                                                                                                                                                                                                |
| `auth_mode`      | string | No       | `""` (override)                            | Source of the upstream credential. One of `""`/`override` (inject the configured `apikey`), `passthrough` (forward the client's credential, fall back to `apikey`), or `none` (send no credential). Refer to [`auth_mode`][ar-auth-mode]. |
| `name`           | string | No       | `""`                                       | Display name for the UI.                                                                                                                                                                                                                  |
| `description`    | string | No       | `""`                                       | Description shown in the UI.                                                                                                                                                                                                              |
| `compatibility`  | object | No       | `openai_chat` enabled, all others disabled | API compatibility flags. Refer to [compatibility flags][docs-provider-flags] for details.                                                                                                                                                 |
| `cost_basis`     | string | No       | Auto-inferred                              | Override the pricing service used for cost estimation. Refer to [cost basis][docs-aperture-provider-compatibility-cost-basis] in the provider configuration reference for valid values.                                                   |
| `preference`     | int    | No       | `0`                                        | Routing priority when a model is available from multiple providers. Higher value wins.                                                                                                                                                    |
| `disabled`       | bool   | No       | `false`                                    | Deactivates the provider without removing its configuration. Disabled providers are excluded from routing and `/v1/models`.                                                                                                               |
| `add_headers`    | array  | No       | `[]`                                       | Custom headers added to every upstream request for this provider. Each entry uses `"Header-Name: value"` format. Aperture redacts the values of these headers in stored captures and S3 exports.                                          |
| `model_cost_map` | array  | No       | `[]`                                       | Map unknown model names to known models for pricing. Refer to [model cost map][docs-aperture-provider-compatibility-model-cost-map].                                                                                                      |

\[Missing snippet: aperture\_provider\_auth\_note.mdx]

#### `auth_mode`

The `auth_mode` field controls how Aperture obtains the credential it sends to the upstream provider. It does not affect routing, model selection, or the authorization header format. Use `authorization` to configure that format. Valid `auth_mode` values are:

| Value          | Behavior                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `""` (default) | Inject the configured `apikey` on every request.                                                                                                                         |
| `override`     | Explicit form of the default. Inject the configured `apikey`. Requires a non-empty `apikey`, or the configuration fails to save.                                         |
| `passthrough`  | Forward the client's own `Authorization` or `x-api-key` header to the upstream unchanged. Fall back to the configured `apikey` only when the client sends no credential. |
| `none`         | Strip all upstream credentials, for providers that need none.                                                                                                            |

A `passthrough` provider with no configured `apikey` is passthrough-only. It serves only requests that carry a client credential. Its models still appear in the `/v1/models` endpoint, but Aperture hides them from the built-in chat UI, because server-originated chat requests carry no client credential. Configure a fallback `apikey` if you want the models available in the chat UI.

For a full walkthrough, including using subscription-plan OAuth tokens, refer to [Set up passthrough mode][docs-use-passthrough-mode].

#### How Aperture builds upstream URLs

Aperture appends the full incoming request path to the provider's `baseurl` to construct the upstream URL. For example, if `baseurl` is `https://api.openai.com` and a client sends `POST /v1/chat/completions`, the upstream URL is `https://api.openai.com/v1/chat/completions`.

Set `baseurl` to the provider's API root. The `/v1` segment belongs in the request path, not in `baseurl`. Aperture does not strip `/v1` from `baseurl` before appending the path.

> **Warning:**
>
> If `baseurl` includes `/v1`, the upstream URL contains `/v1/v1/...`. The duplicated path can cause the upstream provider to return HTTP 405. Refer to [troubleshooting HTTP 405 errors][docs-aperture-troubleshoot-405] for resolution steps.

**Exceptions**: Amazon Bedrock requests have the `/bedrock` prefix stripped before forwarding. Gemini Enterprise Agent Platform requests have auto-fill placeholders replaced in the path. All other providers receive the incoming path unchanged.

For the correct `baseurl` for each supported provider, refer to the [provider matrix][docs-provider-matrix].

#### Model names

Aperture registers each entry in a provider's `models` list as a literal model ID. It does not expand wildcards in this list or verify that the upstream provider serves an ID. Use IDs or aliases supported by the provider, and use glob patterns in [grants][ar-grants] to control access to the configured models.

For valid model IDs, refer to the provider's documentation (for example, [Anthropic models][xt-anthropic-models] or [OpenAI models][xt-openai-models]) and the Aperture [provider setup guides][docs-aperture-set-up-providers].

Model alias destinations require explicit model IDs in the provider's `models` array, even if a wildcard covers them. Refer to [model alias destination requirements][docs-model-alias-destination-requirements].

#### Authorization types

Different providers require different authorization header formats. The `authorization` field supports `bearer` (default, used by OpenAI and most providers), `x-api-key` (Anthropic), and `x-goog-api-key` (Google Gemini). For the full authorization types table and provider-specific details, refer to [authorization types][docs-provider-authorization].

#### Provider compatibility

The `compatibility` object specifies which API formats the provider supports and which endpoints Aperture exposes for the provider's models. Flags include `openai_chat`, `openai_responses`, `anthropic_messages`, `gemini_generate_content`, `bedrock_model_invoke`, and others. The `openai_chat` flag is enabled by default. Aperture clears it if you enable another flag without explicitly setting `openai_chat`. For the complete table, refer to [compatibility flags][docs-provider-flags]. For provider API formats and setup links, refer to the [provider matrix][docs-provider-matrix].

#### Provider examples

For complete configuration examples for each supported provider (OpenAI, Anthropic, Google Gemini, the Gemini Enterprise Agent Platform, Amazon Bedrock, OpenRouter, self-hosted LLMs, and [OpenAI-compatible providers][docs-aperture-openai-compatible-provider]), refer to the [provider setup guides][docs-aperture-set-up-providers].

### Pricing and cost estimation

Aperture estimates the dollar cost of each LLM request for quota deductions, hook metadata, and per-model pricing in the admin dashboard. You can override inferred pricing with the `cost_basis` and `model_cost_map` provider fields. For supported pricing sources, refer to [cost basis][docs-aperture-provider-compatibility-cost-basis]. For mapping syntax, refer to [model cost map][docs-aperture-provider-compatibility-model-cost-map].

Aperture surfaces cost data in several places:

* **Models** (`/admin/models`): Each model shows per-million-token pricing (input/output) with a tooltip that includes cache, reasoning, image, and web search rates.
* **Usage Overview** (`/admin/adoption`): The **CSV** button exports organization-wide usage data including token counts per model, user, and date.
* **Hooks**: Include `"estimated_cost"` in a hook's `send` array to receive dollar cost, cost basis, and token usage with every hook call. Refer to [hook send types][ar-hook-send-types] for details.

### `model_aliases`

The `model_aliases` section maps stable client model names to configured provider/model destinations. Its default selection strategy is `first`. An omitted or empty section defines no aliases unless the deprecated `virtual` fallback supplies them. For fields, defaults, and examples, refer to the [model alias configuration schema][docs-model-alias-schema].

### `grants`

The `grants` section specifies access control policies that determine which users can access which models, what hooks fire, and which quotas apply. Grants use the [Tailscale grant structure][docs-tailscale-grants] with capabilities scoped under `"tailscale.com/cap/aperture"`. Aperture is deny-by-default: without a matching grant, a user cannot access any models.

For step-by-step instructions on configuring access, refer to [grant access to models][docs-aperture-grant-model-access], [grant access to MCP tools][docs-aperture-grant-mcp-tool-access], and [set up admin access][docs-aperture-set-up-admin-access].

> **Note:**
>
> The `grants` section replaces the deprecated `temp_grants` syntax with a new structure. The `temp_grants` syntax still works but Tailscale does not recommend it for new configurations.

Configure grants on **Administration** > **Grants** at `/admin/settings/grants` or in the **Configuration** editor at `/admin/settings/config`.

To update grants through the API:

1. Call `GET http://<aperture-hostname>/api/config` to get the complete configuration and its hash.
2. Modify the returned configuration.
3. Send a JSON object to `PUT http://<aperture-hostname>/api/config`. Set `config` to the complete HuJSON configuration string and `hash` to the original hash. This replaces the complete configuration.

#### Basic structure

A grant specifies a source (`src`) and a set of app capabilities:

```json
"grants": [
  {
    "src": ["*"],               // who this grant applies to
    "app": {
      "tailscale.com/cap/aperture": [
        // array of individual capabilities
        { "models": "**" },     // allow access to all models
      ],
    },
  },
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

#### Source match (`src`)

The `src` field determines which users a grant applies to:

* `"*"`: Matches everyone.
* `"alice@example.com"`: Matches a specific Tailscale login name.
* `"group:engineering"`: Matches members of a Tailscale group or SCIM group. Requires [visible groups][docs-aperture-visible-groups] enabled for the Aperture gateway.
* `"engineering@example.com"`: Matches members of a SCIM group (by email). Requires [visible groups][docs-aperture-visible-groups] enabled for the Aperture gateway.
* `"tag:ci-runner"`: Matches a tagged device.

#### Model access

Each `models` field accepts one glob pattern string in `provider/model` format. To grant access to several specific models, use a separate capability entry for each. Do not use an array in a `models` field.

For [model aliases][docs-aperture-model-aliases], Aperture matches `models` against the destination, not the alias name. The following examples show model access patterns:

| Pattern              | Matches                                                      |
| :------------------- | :----------------------------------------------------------- |
| `"**"`               | All models from all providers                                |
| `"anthropic/**"`     | All Anthropic models                                         |
| `"openai/gpt-5.5"`   | Exactly `openai/gpt-5.5`                                     |
| `"*/claude-sonnet*"` | Any `claude-sonnet*` model from any single provider          |
| `"aperture-*/**"`    | Any model from a provider whose name starts with `aperture-` |

`*` matches any characters within a single path segment (it does not cross `/`). `**` matches zero or more segments.

A grant with no `models` field is "floating," meaning it applies globally (useful for hooks and quotas that apply regardless of model).

#### Role assignment

Roles determine a user's permission level:

```json
{ "role": "admin" }   // full admin access
{ "role": "user" }    // standard user access
```

A role grant controls administrative privileges. The `admin` role grants access to the admin dashboard and organization-wide data. The chat portal is available to authenticated tailnet users by default unless a matching grant sets `enable_portal` to `false`. If multiple role grants match a user, the `admin` role takes precedence.

#### Connector access

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

Grant access to connectors using the `connectors` field, which accepts an array of fully-qualified name (FQN) glob patterns in `"connectorID/category/resource"` format, and `label:<name>` patterns that match connectors by label:

```json
{
  "connectors": ["label:system"],         // every connector labeled "system" (the shipped default)
}
```

More specific patterns:

```json
{
  "connectors": [
    "github/proxy",        // proxy access to the "github" HTTP connector
    "docs/tools/*",        // all tools from the "docs" MCP connector
    "snowflake/**",        // everything from "snowflake"
    "aperture/**",         // everything from the built-in "aperture" connector, by ID
    "label:sales",         // every connector labeled "sales", at every category
  ],
}
```

The `connectors` field uses the same `*` / `**` glob syntax as `models`. The `category` segment is one of `tools`, `resources`, `templates` (MCP connectors), or `proxy` (HTTP connectors). A pattern with an unrecognized category silently never matches, so it grants no access. For the per-category breakdown, refer to the [connectors reference][docs-aperture-connectors-reference].

A `label:<name>` pattern is matched exactly rather than expanded as a glob, and a match grants the connector at every category and resource. Labels are additive like every other grant, so they widen access and never restrict it. For the label grammar, the reserved `system` label, and the `system_labels` field, refer to [connector labels][docs-aperture-connectors-labels] and [Grant connector access by label][docs-aperture-grant-by-label].

> **Note:**
>
> The `mcp_tools`, `mcp_resources`, and `mcp_templates` fields are deprecated. They still work for backward compatibility, but new configurations should use the `connectors` field instead.

#### More capability fields

Each capability object in the `tailscale.com/cap/aperture` array can also include these fields:

| Field                          | Type       | Description                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `connectors`                   | `[]string` | Array of FQN glob patterns for connector access (for example, `["aperture/**"]`, `["github/proxy"]`). Uses the same `*` / `**` glob syntax as `models`. Also accepts `label:<name>` patterns, which match connectors by [label][docs-aperture-connectors-labels] and are compared exactly rather than expanded as globs.             |
| `add_headers`                  | array      | Custom headers prepended to upstream requests when this grant matches. Each entry uses `"Header-Name: value"` format. Aperture redacts the values of these headers in stored captures and S3 exports.                                                                                                                                |
| `filterable_headers`           | array      | Indexed header names from `database.headers.filterable` that matched users can use as filters on supported admin dashboard pages. Use `["*"]` to grant every configured filterable header. Admins also need this grant. Edit it under **Header filter grants** on **Administration** > **Reporting** at `/admin/settings/reporting`. |
| `enable_portal`                | bool       | Controls access to the web portal. Access is available by default. Set to `false` to disable it for a grant. An explicit `true` wins over a broader opt-out, and admins always retain portal access.                                                                                                                                 |
| `enable_chat_ui`               | bool       | Legacy name for `enable_portal`. Existing configurations continue to work, but new configurations should use `enable_portal`.                                                                                                                                                                                                        |
| `read_metrics`                 | bool       | Grants access to the `/metrics` Prometheus endpoint.                                                                                                                                                                                                                                                                                 |
| `set_cors`                     | bool       | Enables CORS response header injection for this grant. Requires a non-empty `cors_paths` list.                                                                                                                                                                                                                                       |
| `cors_paths`                   | array      | URL path glob patterns that activate CORS headers (for example, `["/v1/**", "/bedrock/**"]`). Uses the same glob syntax as `models` but applied to URL paths. An empty list disables CORS even when `set_cors` is `true`.                                                                                                            |
| `Access-Control-Allow-Origin`  | string     | Value for the `Access-Control-Allow-Origin` response header.                                                                                                                                                                                                                                                                         |
| `Access-Control-Allow-Methods` | string     | Value for the `Access-Control-Allow-Methods` response header.                                                                                                                                                                                                                                                                        |
| `Access-Control-Allow-Headers` | string     | Value for the `Access-Control-Allow-Headers` response header.                                                                                                                                                                                                                                                                        |

#### CORS headers

CORS header injection lets browser-based clients access Aperture's LLM endpoints directly. You configure CORS for each grant, so users can have different CORS policies or none. CORS does not grant model access. The user still needs a `models` grant, either in the same grant entry or a different one.

Aperture sets CORS headers only when both `set_cors: true` and a non-empty `cors_paths` list are configured. The `cors_paths` field uses the same glob syntax as `models`, but matches URL paths, which must begin with `/`. When a CORS grant matches, Aperture automatically returns `200 OK` with the configured headers for `OPTIONS` preflight requests.

```json
{
  "src": ["browser-app@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      {
        "set_cors": true,
        "cors_paths": ["/v1/**", "/bedrock/**"],
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    ]
  }
}
```

> **Warning:**
>
> Using `Access-Control-Allow-Origin: *` lets any website make requests to Aperture on behalf of the matched user. Restrict the origin to specific domains when possible (for example, `"https://app.example.com"`).

#### Custom app capabilities

Grants can include capability keys beyond `tailscale.com/cap/aperture`. Aperture passes these through to hooks when you include the `"grants"` send type:

```json
{
  "src": ["admin@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "role": "admin" },
      { "models": "**" },
    ],
    // Custom capability: forwarded to hooks via "grants" send type
    "mycompany.com/cap/policy": [
      { "tier": "enterprise", "department": "engineering" },
    ],
  },
},
```

When a hook includes `"grants"` in its `send` array, these custom capabilities appear in the hook metadata. External systems can use these capabilities to make authorization decisions.

### `quotas`

The `quotas` section specifies dollar-based spending limits using token buckets. Each bucket has a capacity (maximum balance) and a refill rate. When a request's estimated cost would bring a bucket below zero, Aperture rejects the request with HTTP 429.

For step-by-step instructions, refer to [set per-user spending limits][docs-aperture-set-per-user-spending-limits] and [set a team-wide budget][docs-aperture-set-team-budget]. To check and refill budgets, refer to [check and refill budgets][docs-aperture-monitor-quota-balances].

```json
"quotas": {
  // Per-user daily budget: refills $5/day, can burst up to $10
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },

  // Shared pool across all users who reference it
  "eng-team-pool": {
    "capacity": "$100.00",
    "rate": "$100.00/day",
    "on_exceed": "reject",
  },

  // Per-user limit for expensive models
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject",
  },
}
```

Each quota accepts the following fields:

| Field       | Format               | Description                                                                                                 |
| :---------- | :------------------- | :---------------------------------------------------------------------------------------------------------- |
| `capacity`  | `"$<amount>"`        | Maximum balance the bucket can hold (must be greater than zero). Also the starting balance for new buckets. |
| `rate`      | `"$<amount>/<unit>"` | How fast the bucket refills. Units: `min`, `hour`, `day`, `week`, `month` (30 days).                        |
| `on_exceed` | `"reject"`           | Action when a request would bring the bucket below zero. The supported value is `"reject"` (HTTP 429).      |

Quota configuration uses dollar strings (for example, `"$10.00"`). [Hook payloads][ar-hooks] represent the same values in nanodollars (1 dollar = 1,000,000,000 nanodollars).

#### Template variables

Quota names can include template variables that expand at request time:

| Template | Expands to                                                                                  | Example                                             |
| :------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| `<user>` | Caller's Tailscale login name or tag combination                                            | `daily:<user>` expands to `daily:alice@example.com` |
| `<node>` | Caller's node ID (a distinct quota for each node, even if nodes share the same user or tag) | `device:<node>` expands to `device:n8f3a2c9d1CNTRL` |

Quotas without a template variable (for example, `eng-team-pool`) create a single shared bucket.

#### Attach quotas to grants

A quota defined in `quotas` takes effect only when a grant references it. When a request matches a grant, Aperture charges all quotas listed in that grant at the same time:

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "eng-team-pool"},
          ],
        },
      ],
    },
  },
]
```

#### How multiple quotas interact

When a grant references multiple quota buckets, all buckets must have a positive balance for the request to proceed. If any single bucket is exhausted, Aperture rejects the request, even if other buckets have remaining balance.

After the response completes, Aperture deducts the estimated cost from every referenced bucket at the same time.

A request can match multiple grants, each with their own quotas. Aperture collects and enforces all matching quotas together.

To charge buckets sequentially instead of in parallel, use overdrafts.

#### Overdrafts

Overdrafts chain quota buckets so a request falls back to additional buckets when the primary bucket is exhausted. Add an `overdrafts` list to a quota entry in a grant. The list names the buckets to borrow from, in order. Overdrafts live on the grant assignment, not on the bucket definition, so the same bucket can be a primary quota for some users and an overflow target for others.

```json
"grants": [
  {
    "src": ["group:eng"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>", "overdrafts": ["eng-team-pool"]},
          ],
        },
      ],
    },
  },
]
```

A request draws from the primary bucket first, then from each overflow bucket in order. A single request can split across buckets: if the primary bucket has $0.50 left and the request costs $2.00, Aperture takes $0.50 from the primary bucket and $1.50 from the next bucket. The last bucket in a chain can go negative to cover a request. While the combined balance of the chain is at or below zero, Aperture rejects requests until a refill restores it. Aperture rejects a request only after the whole chain cannot cover its cost.

An overflow target that references an undefined bucket is skipped and never makes the primary stricter.

When separate grants contribute overdrafts for the same primary bucket, Aperture merges them into one deterministic order, preserving the order within each grant. This merged order is hard to predict, so keep overdrafts that must run in a specific order within a single grant. If those grants disagree about the order, so that one grant lists a bucket before another while a second grant lists them in the opposite order, Aperture rejects the configuration when you save it and returns HTTP 400.

Buckets that are referenced only as overflow targets are classified as overdraft-only and appear in a separate section of the quota usage views. For step-by-step setup and troubleshooting, refer to [Configure overdraft quotas][docs-aperture-configure-overdrafts].

#### Bucket lifecycle

Aperture persists quota bucket balances. When you update a quota definition (for example, changing the capacity or refill rate), Aperture adjusts existing balances to match the new settings and caps each balance at the new capacity. Aperture removes buckets whose quota definitions you delete from the configuration.

> **Note:**
>
> If you reduce a bucket's `capacity`, Aperture caps any existing balance above the new capacity to the new value. You cannot recover the excess.

#### Quota examples

The following examples show common quota configurations.

##### Per-user quota

Each user gets their own bucket with independent capacity and refill rate:

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        { "models": "**",
          "quotas": [{"bucket": "daily:<user>"}] },
      ],
    },
  },
]
```

This creates a separate bucket for each user (for example, `daily:alice@example.com`, `daily:bob@example.com`), each with $10 capacity and a $5/day refill.

##### Quota scoped to specific models

Apply a quota only when the request targets specific models:

```json
"quotas": {
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        // General access, no quota
        { "models": "**" },
        // Additional quota for Opus models only
        {
          "models": "*/claude-opus*",
          "quotas": [{"bucket": "opus:<user>"}],
        },
      ],
    },
  },
]
```

The `opus:<user>` quota applies only when the request targets an Opus model. Other models are unmetered.

##### Combine per-user and shared quotas

Charge each request against both a personal budget and a shared team pool:

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "team-monthly"},
          ],
        },
      ],
    },
  },
]
```

In this example, every request deducts from both the user's daily bucket and the shared team-monthly bucket. Aperture blocks a user who exhausts either bucket.

### `hooks`

The `hooks` section specifies webhook endpoints that Aperture calls when conditions match. A unique string key identifies each hook, and grants reference this key. For step-by-step setup, refer to [build a custom webhook][docs-aperture-build-custom-webhook]. For integration-specific guides, refer to [integrate Oso with Aperture][docs-aperture-integrate-oso] or [integrate Cerbos with Aperture][docs-aperture-integrate-cerbos].

The following example shows the hooks configuration:

```json
{
  "hooks": {
    "oso": {
      "url": "https://api.osohq.com/api/agents/v1/model-request",
      "apikey": "<oso-api-key>",
      "timeout": "10s"
    },
    "my-webhook": {
      "url": "https://example.com/webhook",
      "apikey": "<api-key>"
    }
  }
}
```

Each hook configuration accepts the following fields:

| Field           | Type    | Required | Default       | Description                                                                                                                                                                          |
| --------------- | ------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`           | string  | Yes      | N/A           | HTTP or HTTPS endpoint to POST hook data to.                                                                                                                                         |
| `apikey`        | string  | No       | `""`          | API key that Aperture sends to the hook endpoint using the method specified by `authorization`.                                                                                      |
| `authorization` | string  | No       | `"bearer"`    | How Aperture sends the API key. Supports the same values as provider authorization: `bearer`, `x-api-key`, `x-goog-api-key`, `hec`, `cf-aig-authorization`.                          |
| `timeout`       | string  | No       | `"5s"`        | Maximum duration to wait for the hook to respond.                                                                                                                                    |
| `disabled`      | boolean | No       | `false`       | Skips this hook when Aperture would otherwise call it. Useful for temporarily disabling a hook without removing its configuration.                                                   |
| `fail_policy`   | string  | No       | `"fail_open"` | Behavior when the hook is unreachable or returns an error. `fail_open` lets the request proceed. `fail_closed` blocks the request. Applies to `pre_request` hooks only.              |
| `preference`    | int     | No       | `0`           | Execution priority among stacked hooks. Higher values run first. Hooks with equal preference run in alphabetical order by key. Not related to the provider-level `preference` field. |

The `timeout` field accepts Go duration strings such as `5s`, `30s`, or `1m`. Set to `0` to disable the timeout.

The `send_hooks` entries in the `grants` section trigger hooks. A hook specified here does nothing until a grant references it.

### Hook grants

To trigger a hook, add a `send_hooks` entry to a capability in the `grants` section. Hook grants specify which requests trigger the hook and what data to send.

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "models": "**",
            "send_hooks": [
              {
                "name": "oso",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "request_body", "response_body"],
              },
            ],
          },
        ],
      },
    },
  ]
}
```

Each `send_hooks` entry contains the following fields:

| Field    | Type   | Description                                                        |
| -------- | ------ | ------------------------------------------------------------------ |
| `name`   | string | Key referencing a hook specified in the top-level `hooks` section. |
| `events` | array  | Event types that trigger the hook.                                 |
| `send`   | array  | List of data types to include in the hook payload.                 |

#### Hook events

| Event                      | Description                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre_request`              | Fires before the provider call. Synchronous: Aperture waits for the hook response. The hook can allow, block, or modify the request.                |
| `entire_request`           | Fires for every completed request. Asynchronous: does not affect the request or response.                                                           |
| `tool_call_entire_request` | Fires once after the response completes if any message in the response contained tool calls. Asynchronous: does not affect the request or response. |

#### Hook send types

The `send` array specifies which data to include in the POST payload sent to the hook endpoint:

| Field            | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `tools`          | Array of tool calls extracted from the response.                            |
| `request_body`   | The original request body sent to the LLM.                                  |
| `user_message`   | The user's message from the request.                                        |
| `response_body`  | The reconstructed response body JSON.                                       |
| `raw_responses`  | Array of raw SSE messages (for streaming) or single response object.        |
| `estimated_cost` | Dollar cost estimate, pricing basis, and token usage breakdown.             |
| `grants`         | Non-Aperture app capabilities from the user's grants (custom capabilities). |
| `quotas`         | Current state of all quota buckets that applied to this request.            |

#### `estimated_cost`

Includes the dollar cost estimate, the pricing basis used, and a token usage breakdown. These fields appear inside the `metadata` object of the hook payload:

```json
{
  "models": "**",
  "send_hooks": [
    {
      "name": "audit",
      "events": ["tool_call_entire_request"],
      "send": ["tools", "estimated_cost"],
    },
  ],
}
```

The hook receives the cost data inside `metadata`. The `cost_basis` identifies the pricing lookup entry. The dollar amount and token counts below illustrate the payload structure, not a price quote:

```json
{
  "metadata": {
    "login_name": "user@example.com",
    "...": "...",
    "estimated_cost": {
      "dollars": 0.0342,
      "cost_basis": "anthropic/claude-sonnet-4-6",
      "usage": {
        "input_tokens": 1500,
        "output_tokens": 800,
        "cached_tokens": 200,
        "reasoning_tokens": 0
      }
    }
  },
  "tool_calls": [...]
}
```

#### `grants`

Includes any non-Aperture app capabilities from the user's grants. This lets external systems (policy engines, audit logs) access custom capabilities attached to the user. The `grants` data appears inside the `metadata` object:

```json
{
  "src": ["alice@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "models": "**" },
      {
        "send_hooks": [
          {
            "name": "policy-engine",
            "events": ["entire_request"],
            "send": ["estimated_cost", "grants"],
          },
        ],
      },
    ],
    "mycompany.com/cap/policy": [
      {"tier": "enterprise", "max_context": 200000},
    ],
  },
}
```

The hook receives the custom capabilities inside `metadata`:

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "...",
    "grants": {
      "mycompany.com/cap/policy": [
        {"tier": "enterprise", "max_context": 200000}
      ]
    },
    "estimated_cost": { "..." }
  }
}
```

#### `quotas`

Includes the current state of all quota buckets that applied to the request. The `quotas` data appears inside the `metadata` object:

```json
"send": ["tools", "quotas"]
```

The hook receives the bucket state inside `metadata`:

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "...",
    "quotas": {
      "daily:alice@example.com": {
        "current": 7250000000,
        "capacity": 10000000000,
        "rate": "$5.00/day"
      }
    }
  }
}
```

Values for `current` and `capacity` are in nanodollars (1 dollar = 1,000,000,000 nanodollars).

Every hook call automatically includes a `metadata` object with request context:

```json
{
  "metadata": {
    "login_name": "user@example.com",
    "user_agent": "curl/8.0",
    "url": "/v1/chat/completions",
    "model": "gpt-5.5",
    "provider": "openai",
    "tailnet_name": "example.com",
    "stable_node_id": "n12345",
    "request_id": "abc123",
    "session_id": "oacc_1a2b3c4d5e6f7890"
  }
}
```

#### Hook grant example

The following example sends tool call data and cost estimates to an audit service for all requests from a specific user:

```json
{
  "grants": [
    {
      "src": ["developer@company.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "models": "anthropic/**",
            "send_hooks": [
              {
                "name": "my-webhook",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "estimated_cost"],
              },
            ],
          },
          {
            "models": "openai/**",
            "send_hooks": [
              {
                "name": "my-webhook",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "estimated_cost"],
              },
            ],
          },
        ],
      },
    },
  ]
}
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

#### Hook response format

For `pre_request` hooks, the hook endpoint must return a JSON response that tells Aperture how to handle the request. Asynchronous hooks (`entire_request`, `tool_call_entire_request`) ignore the response body. Any valid JSON (including `{}`) is enough.

The response contains the following fields:

| Field          | Type   | Required              | Default                          | Description                                                          |
| -------------- | ------ | --------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `action`       | string | Yes                   | N/A                              | How to handle the request. Valid values: `allow`, `block`, `modify`. |
| `status_code`  | int    | No                    | `403`                            | HTTP status code returned to the client. Applies to `block` only.    |
| `message`      | string | No                    | `"request blocked by guardrail"` | Error message returned to the client. Applies to `block` only.       |
| `request_body` | object | Required for `modify` | N/A                              | Replacement request body forwarded to the provider.                  |

The three actions:

* **`allow`**: The request proceeds unchanged. Aperture ignores other fields.
* **`block`**: Aperture rejects the request without forwarding it to the provider. The client receives a format-specific error response with the `status_code` and `message`.
* **`modify`**: Aperture replaces the forwarded request body with the `request_body` from the hook response and continues to the provider. The `request_body` must be a JSON object. If the hook returns a non-object, Aperture treats the response as `allow`.

When a hook blocks a request, the client receives an error envelope that matches the API format of the original request:

| API format                                    | Error envelope                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| OpenAI Chat / Responses                       | `{"error": {"message": "...", "type": "guardrail_blocked"}}`                      |
| Anthropic Messages                            | `{"type": "error", "error": {"type": "invalid_request_error", "message": "..."}}` |
| Gemini API / Gemini Enterprise Agent Platform | `{"error": {"code": ..., "message": "...", "status": "PERMISSION_DENIED"}}`       |
| Bedrock Invoke/Converse                       | Header `x-amzn-ErrorType: AccessDeniedException`. Body `{"message": "..."}`       |

#### Hook chains

When multiple `pre_request` hooks match a request, Aperture calls them one at a time in the following order.

**Ordering**: Hooks with higher `preference` values run first. For example, `preference: 10` runs before `preference: 0`, the default. Hooks with equal preference run alphabetically by hook key: `audit-a` runs before `audit-z`.

**Chain execution**:

* **`allow`** is a no-op. The chain proceeds to the next hook with the current request body.
* **`modify`** rewrites the request body in place. The next hook in the chain receives the modified body, not the original.
* **`block`** terminates the chain immediately. Hooks later in the chain do not run, and the client receives the block response.

If a hook modifies the request and a later hook blocks it, Aperture does not forward the modified request to the provider. The blocking hook receives the modified body. To let a blocking hook decide before other hooks modify the body, give it a higher `preference` so it runs first.

**Failure handling**: When a `pre_request` hook fails (unreachable, timed out, non-2xx response, or unparseable body), the `fail_policy` on the hook definition controls what happens. `fail_open` proceeds to the next hook in the chain. `fail_closed` blocks the request with HTTP 503 and no subsequent hooks run. Asynchronous hooks always fail open: if the hook errors, the request still proceeds.

### `exporters`

The `exporters` section configures periodic export of LLM session logs to external storage. Aperture supports exporting to S3-compatible storage, such as Amazon S3 and Google Cloud Storage. For step-by-step setup, refer to [export usage data to S3][docs-aperture-export-s3].

The following example shows the exporters configuration:

```json
{
  "exporters": {
    "s3": {
      "endpoint": "https://your-s3-compatible-endpoint.url",
      "bucket_name": "aperture-exports",
      "region": "us-east-1",
      "prefix": "prod",
      "access_key_id": "<aws-access-key-id>",
      "access_secret": "<aws-secret-access-key>",
      "every": 3600,
      "limit": 1000
    }
  }
}
```

Setting `bucket_name` to a non-empty value enables the S3 exporter. Each S3 exporter configuration accepts the following fields:

| Field           | Type   | Required    | Default       | Description                                                                                                                                              |
| --------------- | ------ | ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`      | string | No          | `""`          | HTTP endpoint for an S3-compatible API. Required for non-AWS services such as GCS. Omit for Amazon S3, where Aperture infers the endpoint from `region`. |
| `bucket_name`   | string | Conditional | `null`        | Name of the S3 bucket to upload exports to. Setting this field to a non-empty value enables the S3 exporter.                                             |
| `region`        | string | No          | `"us-east-1"` | AWS region for the bucket. Required even for non-AWS endpoints because the AWS SDK validates this field.                                                 |
| `prefix`        | string | No          | `""`          | Path prefix for new S3 objects. Must not end with `/`.                                                                                                   |
| `access_key_id` | string | Conditional | `null`        | AWS access key ID used to authenticate. Required and must be non-empty when `bucket_name` is set and static credentials are used.                        |
| `access_secret` | string | Conditional | `null`        | Secret key used with `access_key_id` to authenticate. Required and must be non-empty when `access_key_id` is set.                                        |
| `every`         | int    | No          | `3600`        | Number of seconds to wait after the last export before starting another. Default is one hour.                                                            |
| `limit`         | int    | No          | `1000`        | Maximum number of records per export. Aperture caps this value at `10000` and reduces higher values without a warning.                                   |

### `connectors`

The `connectors` section configures outbound integrations, including authenticated MCP servers and HTTP API proxies. Connectors replace the deprecated `mcp.servers` syntax and add support for authenticated connections and multiple protocols.

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

> **Note:**
>
> Connectors are always available and the previous feature flag `connectors` is deprecated. Aperture still accepts it for backward compatibility, but it has no effect, so you can remove it from your configuration.

```json
{
  "connectors": {
    "servers": {
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      },
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "auth": {
          "type": "bearer_token",
          "secret": "github_pat_example"
        }
      }
    }
  }
}
```

#### `connectors` fields

| Field     | Type | Default | Description                                                                                                                                                                                                                        |
| --------- | ---- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `servers` | map  | `{}`    | Map of connector ID to server configuration. The map key is the connector ID, which becomes the name prefix for tools (`connectorID_toolname`), resources (`connectorID-uri`), and resource templates (`connectorID-uriTemplate`). |

#### `servers` fields

Each entry in the `servers` map accepts the following fields:

| Field         | Type             | Required | Default    | Description                                                                                                                                                                                                                                                                              |
| ------------- | ---------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol`    | string           | Yes      | N/A        | How Aperture communicates with the upstream. One of `"mcp"` or `"http"`.                                                                                                                                                                                                                 |
| `url`         | string           | No       | N/A        | Endpoint URL of the upstream server. Aperture warns if `url` is missing but still loads the configuration.                                                                                                                                                                               |
| `provider`    | string           | No       | `"Custom"` | Provider identifier. Set automatically when using a verified connector from the registry (for example, `"Salesforce"`, `"Atlassian"`, `"Slack"`). Controls whether the connector appears in the "verified" or "custom" category in the admin dashboard.                                  |
| `description` | string           | No       | `""`       | Human-readable label displayed in the Aperture UI. For granted HTTP connectors, `aperture_list_connectors` also returns it to permitted users.                                                                                                                                           |
| `context`     | string or JSON   | No       | N/A        | Prompt or context information for a connector. Accepts a plain string or arbitrary JSON object. For granted HTTP connectors, `aperture_list_connectors` returns it to permitted users.                                                                                                   |
| `labels`      | array of strings | No       | `[]`       | Flat labels that group the connector for access control. A grant pattern of `label:<name>` matches every connector carrying that label. Each label must match `[a-zA-Z0-9][a-zA-Z0-9._-]*`. The label `system` is reserved for built-in connectors and is stripped from user connectors. |
| `auth`        | object           | No       | N/A        | Authentication configuration. Dispatched by the `type` field.                                                                                                                                                                                                                            |

The `connectors` section also accepts a `system_labels` map, which replaces the default labels on a built-in connector (for example, `{"aperture": ["system", "public"]}`). Refer to [connector labels][docs-aperture-connectors-labels].

#### Connector ID rules

Connector IDs must match the pattern `[a-zA-Z][a-zA-Z0-9]*` (letters and digits only, starting with a letter). Connector IDs cannot contain underscores or hyphens because the MCP wire format reserves these as separators: underscores separate the connector ID from the tool name (`snowflake_query`), and hyphens separate the connector ID from resource URIs (`snowflake-resource://...`).

Valid IDs: `github`, `snowflake`, `analyticsV2`. Invalid IDs: `my-mcp` (hyphen), `github_api` (underscore), `2fast` (starts with digit).

The IDs `tailscale`, `internal`, and `aperture` are reserved and cannot be used as connector IDs. The `aperture` ID is used by the built-in system connector.

The restriction on hyphens may be relaxed in a future release. Treat the letters-and-digits rule as current behavior, not a permanent guarantee. Refer to the [connectors reference][docs-aperture-connectors-reference] for the full ID rules.

#### Auth types

The `auth` object's `type` field selects the authentication scheme. The following table describes the available auth types:

| Type                        | Required fields                           | Description                                                                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bearer_token`              | `secret`                                  | Static `Authorization: Bearer <secret>` header.                                                                                                                                                                                                 |
| `api_key`                   | `secret`, `name`, `in`                    | Credential injected as a named header or query parameter. `in` must be `"header"` or `"query"`.                                                                                                                                                 |
| `basic`                     | `username`, `password`                    | HTTP Basic authentication.                                                                                                                                                                                                                      |
| `oauth2_client_credentials` | `client_id`, `client_secret`, `token_url` | Machine-to-machine OAuth 2.0 token. Auto-refreshed. Optional `scopes` array.                                                                                                                                                                    |
| `oauth2_authorization_code` | `client_id`, `auth_url`, `token_url`      | Per-user OAuth 2.0 consent flow. Optional `client_secret` (not required for PKCE-only), `scopes`, and `auth_params`.                                                                                                                            |
| `oauth2_dcr`                | `url`                                     | Per-user OAuth 2.0 consent flow using dynamic client registration. Aperture discovers the authorization server and registers a client at runtime, so no `client_id`, `auth_url`, or `token_url` is needed. Optional `scopes` and `auth_params`. |

The following example shows a connector with OAuth 2.0 client credentials authentication:

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

#### HTTP connectors

When `protocol` is `"http"`, Aperture acts as an authenticated reverse proxy. Aperture forwards requests sent to `/v1/connectors/<id>/<path>` to the connector's upstream URL and injects credentials automatically. When at least one HTTP connector is configured, Aperture registers an `aperture_list_connectors` MCP tool so that AI models can discover available HTTP connectors.

> **Warning:**
>
> The authentication credentials configured on an HTTP connector are shared by all users with a matching `connectors` grant. Users must have a grant matching `"connectorID/proxy"` or a broader pattern like `"connectorID/**"` to access the proxy endpoint. Use the narrowest possible credential scope, preferably read-only. Do not put sensitive information in `description` or `context`. The `aperture_list_connectors` tool returns these fields to users who can call it.

#### Migration from `mcp.servers`

The `connectors` section replaces the deprecated `mcp.servers` syntax. At load time, Aperture automatically folds legacy `mcp.servers` entries into `connectors.servers` with `protocol: "mcp"` and no authentication. Both sections can coexist during migration, but connector IDs must be unique across both. Aperture rejects duplicate IDs at load time.

Consider the following `mcp.servers` entry:

```json
"mcp": { "servers": { "docs": { "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

The equivalent `connectors` entry is:

```json
"connectors": { "servers": { "docs": { "protocol": "mcp", "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

For the full connectors schema and per-category grant reference, refer to the [connectors reference][docs-aperture-connectors-reference].

### `mcp`

> **Note:**
>
> The `mcp.servers` syntax is deprecated. Use the [`connectors`][ar-connectors-section] section instead, which supports the same functionality plus authenticated connections and the `http` protocol. Aperture retains the `mcp` section for backward compatibility and for the `accept_registrations` field, which has no `connectors` equivalent.

The `mcp` section configures MCP (Model Context Protocol) server proxying. Aperture connects to remote MCP servers, aggregates their tools, resources, and resource templates, and exposes them through a single `/v1/mcp` endpoint. Refer to [MCP server proxying][docs-aperture-set-up-mcp-servers] for setup instructions and troubleshooting.

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {
      "docs": {
        "url": "http://mcp-server.example.ts.net:8185/v1/mcp"
      }
    }
  }
}
```

#### `mcp` fields

| Field                  | Type    | Default | Description                                                                                                                                                                                                                                                                         |
| ---------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accept_registrations` | boolean | `false` | Allow backends to register dynamically through `POST /v1/mcp/register`. Backends POST `{"url": "http://..."}` and keep the connection open. Tools are unregistered when the connection closes. This field has no `connectors` equivalent.                                           |
| `servers`              | map     | `{}`    | Map of server ID to server configuration. Deprecated: use `connectors.servers` instead. The map key is the server ID, which becomes the name prefix for tools (`serverID_toolname`), resources (`serverID-uri`), and resource templates (`serverID-uriTemplate`) from that backend. |

#### `servers` fields

Each entry in the `servers` map accepts the following fields:

| Field | Type   | Required | Description                                                                                |
| ----- | ------ | -------- | ------------------------------------------------------------------------------------------ |
| `url` | string | Yes      | The MCP server endpoint URL (for example, `http://mcp-server.example.ts.net:8185/v1/mcp`). |

### `database`

The `database` section configures data storage behavior, including retention policies and header filtering for captured request and response data.

```json
{
  "database": {
    "save_raws": false,
    "keep_encrypted_blobs": false,
    "retention": {
      "duration": "30d",
      "require_export": false,
      "purge": ["captures"]
    }
  }
}
```

#### `database` fields

| Field                  | Type    | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `save_raws`            | boolean | `false` | Saves original HTTP request and response bytes before JSON parsing alongside parsed JSON captures. When `false`, Aperture discards raw bodies for valid JSON responses. It retains raw bytes for responses that fail JSON parsing unless zero retention is configured (`duration: "0"`, `require_export: false`). Turning this off does not remove raw bodies that Aperture already saved. The retention policy removes them.                                                                                                                                         |
| `keep_encrypted_blobs` | boolean | `false` | Aperture normally replaces provider-encrypted thinking-block signatures, web search encrypted content, citation indices, and encrypted response items with placeholders in parsed captures. Set to `true` to keep these fields for debugging or replay until the retention policy removes their captured content. This setting does not redact raw HTTP bodies, which can contain the original encrypted values when `save_raws` is enabled or response JSON parsing fails. Zero retention (`duration: "0"`, `require_export: false`) does not store captured bodies. |
| `retention`            | object  | `{}`    | Capture data retention policy. Refer to the following retention fields.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `headers`              | object  | `{}`    | Header filtering policy. Controls which request and response headers are stored in a queryable form and can be used as filters on supported Aperture admin dashboard pages. Empty (the default) disables the feature. Refer to the following header fields.                                                                                                                                                                                                                                                                                                           |

#### `database.retention` fields

| Field            | Type    | Default        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :--------------- | :------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `duration`       | string  | `""`           | How long to keep captured content before deleting it, such as `"30d"` or `"720h"`. An empty string uses your gateway's default retention period, which is one year unless Tailscale configured a different default. The default is also the longest period Aperture applies. If you set a longer non-zero duration, Aperture uses the default instead. Non-zero values must be between 1 hour and 3650 days. Set to `"0"` for zero retention without export gating. The default limits only longer durations, so `"0"` always takes effect. |
| `require_export` | boolean | `false`        | When `true`, Aperture removes local captured content only after successfully exporting the capture to an Amazon S3-compatible endpoint. Aperture keeps captures that have not yet been exported, regardless of `duration`. A successful export does not guarantee immediate removal.                                                                                                                                                                                                                                                        |
| `purge`          | array   | `["captures"]` | Categories of content to remove. An omitted or empty list defaults to `["captures"]`. A non-empty list must include `"captures"` and cannot contain duplicates. `["captures"]` removes request and response bodies, headers, and raw bodies but keeps tool use data. `["captures", "tools"]` also removes tool use data.                                                                                                                                                                                                                    |

With `duration: "0"` and `require_export: false`, Aperture does not store captured request and response bodies, headers, or raw HTTP bytes. This applies even if `save_raws` or `keep_encrypted_blobs` is enabled or response JSON parsing fails. This does not depend on the `purge` list. To also omit captured tool data, add `"tools"` to `purge`.

When you save, Aperture rejects malformed or negative durations and non-zero durations outside the range of 1 hour to 3650 days. A valid duration longer than your gateway's default retention period still saves, but Aperture applies the default instead. For example, with a one-year default, `"730d"` results in an effective retention period of one year.

Aperture removes captured content while keeping capture metadata, session records, usage metrics (token counts, model, cost estimate, duration, and status code), and separately indexed header values. Usage analytics and header filtering remain available after Aperture removes captured content. Capture retention does not delete Aperture Chat conversation history. Other lifecycle rules or user actions can affect data outside capture retention.

> **Warning:**
>
> An omitted or empty `duration` uses the default retention period, not an unlimited one. That default is one year unless Tailscale configured a different default for your gateway. It is also the maximum: Aperture shortens a longer duration to the default. If `require_export` is `true`, Aperture keeps local captured content until export succeeds, even past the retention period. Contact your Tailscale account manager to confirm your gateway's default retention period.

> **Note:**
>
> For step-by-step guidance on zero retention for captured content, refer to [Configure zero-retention mode][docs-aperture-zero-retention]. For an overview of retention, redaction, and independent Chat and hook data handling, refer to [Privacy and data retention][docs-aperture-privacy].

#### `database.headers` fields

Aperture stores captured request and response headers in compressed form. The `headers` section specifies which headers Aperture indexes for filtering by presence or value. These filters are available on:

* **User Dashboard** at `/admin/dashboard`
* **Usage Overview** at `/admin/adoption`
* **Model Activity** at `/admin/adoption/model-activity`
* **Agent Activity** at `/admin/adoption/agent-activity`
* **Logs** at `/admin/logs`
* **Tool Use** at `/admin/tool-use`

Aperture retains indexed header values past the capture retention period. With write-time zero retention, Aperture writes no new header index values, including configured filterable headers.

| Field        | Type  | Default | Description                                                                                                                                                                                                                                       |
| :----------- | :---- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `filterable` | array | `[]`    | Objects describing the request and response headers to index by name and value. An empty array builds no header indexes. Edit this list under **Stored filterable headers** on **Administration** > **Reporting** at `/admin/settings/reporting`. |

Each `filterable` entry has these fields:

| Field           | Type    | Description                                                                                                                                                                                                                                                                                                                                                                     |
| :-------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`          | string  | Required. Header name to index. Case-insensitive, and applied to both the request and response hops.                                                                                                                                                                                                                                                                            |
| `redact_values` | boolean | Optional, defaults to `false`. When `true`, Aperture stores only the header's presence, never its value. The header supports **Present** matching, but not **Contains** or **Is exactly**. Use it for headers whose values must not be stored durably. Set this field on **Administration** > **Configuration**. The **Reporting** page honors this field but does not edit it. |

Aperture builds no header indexes until you list at least one header. Only the headers you list are indexed. Other headers remain available only in retained captures.

Indexing a header does not grant access to filter by it. Users, including admins, need a grant that assigns the header through [`filterable_headers`][ar-grant-capability-fields]. They can then use it as a filter on any dashboard page that supports filtering.

Aperture indexes the header for new requests immediately. Aperture backfills older requests from captures that remain within the retention window. It cannot backfill requests whose captures have already been purged.

> **Note:**
>
> The backfiller finishes all historical data, but might not immediately reindex the current calendar day. It fills in missed entries for the current day when the next day begins.

Aperture redacts detected credentials in stored header values. Built-in checks cover common formats, including bearer tokens, JWTs, and API keys with prefixes such as `sk-`, `AKIA`, `ghp_`, and `xoxb-`, plus high-entropy values. Matching values are stored as `(redacted)`. These checks are fixed and cannot detect every secret. To make sure Aperture never stores a header's value, set `redact_values` on that header.

```json
"headers": {
  "filterable": [
    { "name": "x-request-id" },
    { "name": "user-agent" },
    { "name": "authorization", "redact_values": true },
  ],
},
```

> **Note:**
>
> For step-by-step guidance, refer to [Filter logs by header][docs-aperture-filter-logs-by-header].

### `chat_models`

The `chat_models` section controls which models appear in the Aperture chat UI picker, their display names and order, and their utility roles for title generation and summarization.

This section does not grant access. When `chat_models` has entries, a model must match both a grant and a `chat_models` entry to appear in the picker. When the section is omitted or empty, the picker shows all granted models whose provider declares a chat-compatible API, labeled with their raw model IDs.

Use `provider/model` IDs or patterns in `chat_models`, not [model alias][docs-aperture-model-aliases] names. The `display_name` field changes the picker label. It does not create an alias for API requests.

> **Note:**
>
> The web portal is available by default. Set `enable_portal` to `false` in a [grant][ar-grant-capability-fields] to disable it for matched non-admin users. An explicit `true` wins over a broader opt-out, and admins always retain access. The legacy `enable_chat_ui` field has the same effect for existing configurations. The `chat_models` section controls what the chat model picker shows, not who can access the portal.

```json
{
  "chat_models": [
    {"model": "anthropic/claude-opus-5-5", "display_name": "Claude Opus", "priority": 100},
    {"model": "anthropic/claude-sonnet-5-5", "display_name": "Claude Sonnet", "priority": 90},
    {"model": "anthropic/claude-haiku-4-5-20251001", "display_name": "Claude Haiku", "priority": 70,
     "title_gen": true, "summarize": true},
    {"model": "openai/gpt-5*", "priority": 50}
  ]
}
```

#### `chat_models` fields

Each entry in the `chat_models` array accepts the following fields:

| Field                   | Type    | Default               | Description                                                                                                                                                                                                                                      |
| ----------------------- | ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`                 | string  | (required)            | Fully qualified `provider/model` glob pattern using the same syntax as `grants.models` (`*` matches any characters within a single path segment, `**` matches zero or more segments).                                                            |
| `display_name`          | string  | `""`                  | Label shown in the chat picker. When empty, falls back to the model's short ID (the part after the provider prefix).                                                                                                                             |
| `priority`              | integer | `0`                   | Picker ordering priority. Higher values appear first. Ties are broken alphabetically by model ID. Also used as the tiebreaker for utility model selection.                                                                                       |
| `title_gen`             | boolean | `false`               | Flags this entry as eligible for conversation-title generation. The chat service selects the highest-priority `title_gen` entry whose model the user is granted. Falls back to the conversation's chosen model when nothing qualifies.           |
| `summarize`             | boolean | `false`               | Flags this entry as eligible for summarizing extended reasoning blocks in chat responses. Selection follows the same rules as `title_gen`. The `title_gen` and `summarize` roles are independent.                                                |
| `hidden`                | boolean | `false`               | Excludes matching models from the chat picker while keeping them eligible for the `title_gen` and `summarize` roles. Use it to reserve a model for background tasks without offering it for responses.                                           |
| `context_window_tokens` | integer | (model catalog value) | Overrides the context window Aperture assumes for chat. Must be a positive integer.                                                                                                                                                              |
| `max_output_tokens`     | integer | (model catalog value) | Maximum output tokens for chat responses. Aperture sends this value to the upstream provider, even for APIs where the limit is optional, and lowers it when the conversation leaves less room in the context window. Must be a positive integer. |
| `native_tool_loading`   | boolean | `false`               | Uses the provider's own tool search instead of Aperture's. Applies only to Anthropic Messages and OpenAI Responses models, and only when `model` is an exact model ID rather than a pattern.                                                     |

When multiple entries match the same model, the most specific glob wins. For example, `"anthropic/claude-opus-5-5"` takes precedence over `"anthropic/**"`, which takes precedence over `"**"`. If patterns are equally specific, the earlier entry in the configuration wins.

> **Note:**
>
> The chat picker only includes models whose provider declares a chat-compatible API: `anthropic_messages`, `openai_chat`, `openai_responses`, `gemini_generate_content`, or `google_generate_content` (for Gemini models). Models served only through other formats, such as Amazon Bedrock, do not appear regardless of `chat_models` entries.

### `flags`

The `flags` section enables experimental features that are not yet generally available. Each flag is identified by a string key and contains a `value` boolean. All flags default to disabled (`false`). Adding a flag to the configuration enables it.

```json
{
  "flags": {
    "direct_access_api": {
      "value": true
    }
  }
}
```

Each key is a flag ID. The value object must contain a `value` field set to `true` to enable the flag. Setting `value` to `false` or omitting the flag entirely leaves the feature disabled. The preceding example enables the direct provider access API. Refer to [direct provider access][docs-aperture-direct-access] for what that flag turns on.

#### Flag reference

The flags in this reference carry one of two statuses:

* **Private.** Tailscale manages these outside your Aperture configuration. You cannot enable them, and Aperture rejects them in your configuration.
* **Deprecated.** These no longer do anything. The feature they gated is always on.

Tailscale manages the following flags outside your Aperture configuration. Do not add them to your configuration: Aperture reports each as `unknown flag "{key}" in flags config`, which blocks the save.

| Flag ID                            | Name                             | Status  |
| ---------------------------------- | -------------------------------- | ------- |
| `mcp_apps`                         | MCP Apps                         | Private |
| `disable_liveness_check`           | Disable Liveness Check           | Private |
| `disable_hook_request_compression` | Disable Hook Request Compression | Private |
| `portal_root`                      | Portal Root                      | Private |
| `connector_identity_headers`       | Connector Identity Headers       | Private |

These flags are deprecated. The features they gated are always available, so you can remove them from your configuration.

| Flag ID             | Name              | Status     |
| ------------------- | ----------------- | ---------- |
| `chat_ui`           | Chat UI           | Deprecated |
| `connectors`        | Connectors        | Deprecated |
| `web_tools`         | Web Tools         | Deprecated |
| `connector_labels`  | Connector Labels  | Deprecated |
| `capture_retention` | Capture Retention | Deprecated |

Web search and fetch no longer require the `web_tools` flag. Availability depends on your gateway's configuration.

The configuration API rejects a deprecated flag when you add it to a saved configuration. Aperture preserves an existing deprecated flag for compatibility. The flags have no effect and you can remove them.

> **Note:**
>
> The **Administration** > **Feature Flags** page at `/admin/settings/feature-flags` never lists Private or Deprecated flags.

#### Validation behavior

Unknown flag IDs produce a validation warning: `unknown flag "{key}" in flags config`. This warning blocks saves through the API or admin dashboard, where warnings are treated as errors.

#### Connectors flags

The `connectors` flag is deprecated. Connectors, including the [`connectors`][ar-connectors-section] configuration section, the **Connectors** page at `/admin/settings/connectors`, and the `/v1/connectors/` REST API endpoints, are always available and no longer require a flag. If your configuration still sets `connectors`, you can remove it.

The `connector_labels` flag is also deprecated. Connector labels, including the `labels` field on a connector, `label:<name>` grant matching, and the label fields at `/admin/settings/connectors`, are always available. Removing the gate cannot narrow anyone's access, because label grants only ever add access. If your configuration still sets `connector_labels`, you can remove it.

For the full connectors configuration schema, refer to the [`connectors`][ar-connectors-section] section on this page and the [connectors feature guide][docs-aperture-connectors].

## Quota enforcement

Aperture enforces quotas at request time by checking all referenced buckets before forwarding a request to the provider.

### What happens when a request exceeds a quota

When a request would exceed any of its quota buckets, Aperture:

1. Rejects the request with HTTP status **429 (Too Many Requests)**.
2. Sets a `Retry-After` header with the estimated seconds until enough budget refills.
3. Formats the error to match the provider's native error format.
4. Logs a warning with the bucket detail, login name, and model.

The following table describes the provider-specific error formats:

| Provider                                      | Error format                                                                          |
| :-------------------------------------------- | :------------------------------------------------------------------------------------ |
| Anthropic                                     | `{"type":"error","error":{"type":"rate_limit_error","message":"..."}}`                |
| OpenAI                                        | `{"error":{"message":"...","type":"insufficient_quota","code":"insufficient_quota"}}` |
| Bedrock                                       | `{"message":"..."}` with `x-amzn-ErrorType: ThrottlingException`                      |
| Gemini API / Gemini Enterprise Agent Platform | `{"error":{"code":429,"message":"...","status":"RESOURCE_EXHAUSTED"}}`                |

### How clients observe enforcement

When Aperture blocks a request for exceeding a quota, the client receives an HTTP 429 response. The blocked request also appears on the **Logs** page at `/admin/logs` with a 429 status.

## Validation

Aperture validates configuration before saving it through the API or the admin dashboard. Both errors and warnings block the save. Correct the reported problems and save again.

Use `POST /aperture/config:validate` to check a configuration before saving. Warnings set `Valid: false`, matching save behavior. The admin lockout check applies only when saving and prevents you from removing your own admin access.

The following table lists validation errors and warnings.

| Condition                                                                              | Message                                                                                                                                                                  | Severity |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| No providers or MCP servers                                                            | `no providers or mcp servers defined; users will not be able to access any models`                                                                                       | Warning  |
| Provider missing `baseurl`                                                             | `provider {id} has no baseurl configured`                                                                                                                                | Warning  |
| Invalid `authorization` type                                                           | `provider {id} has invalid authorization type: {type}`                                                                                                                   | Warning  |
| Unresolved environment variable                                                        | `unsubstituted macros: [var_name]`                                                                                                                                       | Error    |
| Invalid JSON or HUJSON syntax                                                          | Parse error details                                                                                                                                                      | Error    |
| Invalid quota definition                                                               | `quota {name}: {details}`                                                                                                                                                | Error    |
| **Structural / syntax**                                                                |                                                                                                                                                                          |          |
| Duplicate keys in configuration                                                        | `duplicate config key "hostname"`                                                                                                                                        | Warning  |
| Unknown configuration keys                                                             | `unknown config key "basurl"`                                                                                                                                            | Warning  |
| Type mismatch in field value                                                           | Field name and `json.UnmarshalTypeError` details                                                                                                                         | Warning  |
| **Provider**                                                                           |                                                                                                                                                                          |          |
| Invalid `add_headers` format                                                           | `provider {id}: add_headers entry "Bad-Entry" must be in "Header-Name: value" format`                                                                                    | Warning  |
| **Quota**                                                                              |                                                                                                                                                                          |          |
| Invalid quota name template                                                            | `quota "{name}": quota name "{name}" has unsupported template "{template}" after colon`                                                                                  | Warning  |
| **Grant**                                                                              |                                                                                                                                                                          |          |
| Unknown fields in grant                                                                | Strict JSON parsing error for the unrecognized field                                                                                                                     | Warning  |
| Grant `models` references undefined provider                                           | `models pattern "{pattern}" references provider "{name}" which does not match any declared provider`                                                                     | Warning  |
| Grant `mcp_tools`, `mcp_resources`, or `mcp_templates` references undefined MCP server | `mcp_tools pattern "{pattern}" references server "{name}" which does not match any declared MCP server`                                                                  | Warning  |
| Grant `send_hooks` references undefined hook                                           | `send_hooks references undefined hook "{name}"`                                                                                                                          | Warning  |
| Grant `quotas` references undefined quota                                              | `quotas references undefined quota "{name}"`                                                                                                                             | Warning  |
| Invalid quota bucket ref template in grant                                             | `grants[{n}] grant {n} quotas[{n}]: bucket ref "{ref}" has unsupported template...`                                                                                      | Warning  |
| Grant-level `add_headers` invalid format                                               | `add_headers entry "{entry}" must be in "Header-Name: value" format`                                                                                                     | Warning  |
| **Connector**                                                                          |                                                                                                                                                                          |          |
| Connector missing `protocol`                                                           | `connectors.servers.{id}: protocol is required (e.g. "mcp" or "http")`                                                                                                   | Error    |
| Unsupported connector protocol                                                         | `connectors.servers.{id}: unsupported protocol "{value}" (supported: "mcp", "http")`                                                                                     | Error    |
| Invalid connector ID                                                                   | `connectors.servers.{id}: invalid ID "{id}"; connector IDs must match [a-zA-Z][a-zA-Z0-9]* (letters and digits only, starting with a letter; no hyphens or underscores)` | Error    |
| Connector missing URL                                                                  | `connectors.servers.{id}: URL is required`                                                                                                                               | Warning  |
| Connector auth validation failure                                                      | `connectors.servers.{id}.auth: {details}`                                                                                                                                | Error    |
| Invalid connector label                                                                | `connectors.servers.{id}.labels: invalid label "{label}"; labels must match [a-zA-Z0-9][a-zA-Z0-9._-]* (no slashes)`                                                     | Error    |
| Reserved label on a user connector                                                     | `connectors.servers.{id}.labels: removed reserved label "system"`                                                                                                        | Warning  |
| Unknown system connector in `system_labels`                                            | `connectors.system_labels.{id}: unknown system connector ID`                                                                                                             | Error    |
| Duplicate connector ID across `mcp` and `connectors`                                   | `config: server ID "{id}" is defined in both 'mcp.servers' and 'connectors.servers'; IDs must be unique across both sections`                                            | Error    |
| **Hook**                                                                               |                                                                                                                                                                          |          |
| Hook missing URL                                                                       | `hook {name} has no url configured`                                                                                                                                      | Warning  |
| Hook invalid URL scheme                                                                | `hook {name} has invalid URL scheme (must be http:// or https://): {url}`                                                                                                | Warning  |
| Hook invalid authorization type                                                        | `hook {name} has invalid authorization type: {type}`                                                                                                                     | Warning  |
| **Exporter**                                                                           |                                                                                                                                                                          |          |
| S3 prefix ends with `/`                                                                | `exporters.s3.prefix must not end with a slash`                                                                                                                          | Warning  |
| **Structural warnings**                                                                |                                                                                                                                                                          |          |
| No grants assign admin role                                                            | `no grant in grants or temp_grants assigns role:admin; nobody will be able to manage this instance`                                                                      | Warning  |
| Providers configured but no grants defined                                             | `providers are configured but no grants or temp_grants defined; all access will be denied`                                                                               | Warning  |
| **Save-only**                                                                          |                                                                                                                                                                          |          |
| Empty configuration                                                                    | `config must not be empty`                                                                                                                                               | Error    |
| Admin lockout prevention                                                               | Rejects saves that would remove the saving user's admin access                                                                                                           | Error    |
| **Exporter silent cap**                                                                |                                                                                                                                                                          |          |
| S3 exporter `limit` exceeds 10000                                                      | Aperture silently reduces `limit` to `10000`                                                                                                                             | Silent   |

For model alias validation errors and warnings, refer to [model alias configuration errors][docs-model-alias-errors]. For other common validation issues and how to resolve them, refer to [troubleshooting][docs-aperture-troubleshooting].

### Model alias destination validation

For requirements that apply to every destination, including inactive destinations, refer to [model alias destination requirements][docs-model-alias-destination-requirements]. For save-blocking messages, refer to [model alias configuration errors][docs-model-alias-errors].

## Complete example

The following example combines grants, quotas, exporters, providers, hooks, connectors, MCP registration, and database retention in one configuration. Before you save, replace the example credentials and endpoint URLs. Change `admin@company.com` to your own admin login. Aperture rejects a save that would remove your admin access.

```json
{
  // Access control: who can use which models
  "grants": [
    // All users: access all models with per-user and org-wide quotas
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          {
            "models": "**",
            "quotas": [
              {"bucket": "daily:<user>"},
              {"bucket": "org-monthly"},
            ],
          },
        ],
      },
    },
    // Admin access for specific user with audit hook
    {
      "src": ["admin@company.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" },
          {
            "models": "**",
            "send_hooks": [
              {
                "name": "oso",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "estimated_cost"],
              },
            ],
          },
        ],
      },
    },
    // CORS headers for browser-based clients
    {
      "src": ["browser-app@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "set_cors": true,
            "cors_paths": ["/v1/**", "/bedrock/**"],
            "Access-Control-Allow-Origin": "https://app.example.com",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        ],
      },
    },
  ],

  // Dollar-based spending limits
  "quotas": {
    "daily:<user>": {
      "capacity": "$10.00",
      "rate": "$5.00/day",
      "on_exceed": "reject",
    },
    "org-monthly": {
      "capacity": "$2000.00",
      "rate": "$2000.00/month",
      "on_exceed": "reject",
    },
  },

  // LLM session log export configuration
  "exporters": {
    "s3": {
      // Required for S3-compatible services such as GCS
      "endpoint": "https://your-s3-compatible-endpoint.url",
      "bucket_name": "aperture-exports",
      "region": "us-west-2",
      "prefix": "prod",
      "access_key_id": "<aws-access-key-id>",
      "access_secret": "<aws-secret-access-key>",
      "every": 3600,
      "limit": 1000
    }
  },

  // LLM providers
  "providers": {
    "openai": {
      "baseurl": "https://api.openai.com",
      "apikey": "<openai-api-key>",
      "models": ["gpt-5.5", "gpt-5.4-mini", "gpt-5.3-codex"],
      "name": "OpenAI",
      "description": "OpenAI models for coding and chat",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    },
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<proxy-anthropic-api-key>",
      "authorization": "x-api-key",
      "models": ["claude-sonnet-5-5", "claude-haiku-4-5-20251001", "claude-opus-5-5"],
      "name": "Anthropic",
      "compatibility": {
        "openai_chat": false,
        "anthropic_messages": true
      }
    },
    "gemini": {
      "baseurl": "https://generativelanguage.googleapis.com",
      "apikey": "<proxy-gemini-api-key>",
      "authorization": "x-goog-api-key",
      "models": ["gemini-3.8-flash", "gemini-2.5-pro"],
      "name": "Google Gemini",
      "compatibility": {
        "openai_chat": false,
        "gemini_generate_content": true
      }
    },
    "private": {
      "baseurl": "<private-llm-url>",
      // Use an ID already served by your endpoint. This example uses an Ollama tag.
      "models": ["qwen3-coder:30b"]
    }
  },

  // Stable model name for clients
  "model_aliases": {
    "models": {
      "team-chat": {
        "dst": ["openai/gpt-5.4-mini"]
      }
    }
  },

  // Hooks for external integrations
  "hooks": {
    "oso": {
      "url": "https://api.osohq.com/api/agents/v1/model-request",
      "apikey": "<oso-api-key>",
    },
  },

  // Outbound integrations (MCP servers and HTTP APIs)
  "connectors": {
    "servers": {
      // Unauthenticated MCP server in your tailnet
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp",
      },
      // MCP server with bearer token auth, grouped by label
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "labels": ["analytics", "restricted"],
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token",
        },
      },
    },
  },

  // Dynamic MCP registration (accept_registrations has no connectors equivalent)
  "mcp": {
    "accept_registrations": true,
  },

  // Data storage settings
  "database": {
    "retention": {
      "duration": "30d",
      "require_export": false,
      "purge": ["captures"],
    },
  },
}
```

## Related

The following topics provide more information about configuring and managing Aperture:

* For provider and client API formats and requirements, refer to [Supported providers and clients][docs-supported-providers-clients].
* For compatibility flags, authorization, and cost basis values, refer to [Provider configuration][docs-aperture-provider-compatibility].
* For step-by-step provider setup, refer to the [set up LLM providers][docs-aperture-set-up-providers] guides.
* For stable model names, configuration, and provider switching, refer to [model aliases][docs-aperture-model-aliases].
* For instructions on controlling model access, refer to [grant access to models][docs-aperture-grant-model-access].
* For common configuration issues, refer to [troubleshooting][docs-aperture-troubleshooting].
* For the Aperture admin dashboard, refer to the [admin dashboard reference][docs-aperture-dashboard-admin].

[ar-auth-mode]: #auth_mode

[ar-connectors-section]: #connectors

[ar-flags-section]: #flags

[ar-grant-capability-fields]: #more-capability-fields

[ar-grants]: #grants

[ar-hook-send-types]: #hook-send-types

[ar-hooks]: #hooks

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-aperture-build-custom-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-aperture-configure-overdrafts]: /docs/aperture/how-to/configure-overdraft-quotas

[docs-aperture-connectors-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-aperture-connectors-reference]: /docs/aperture/connectors/reference

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-direct-access]: /docs/aperture/direct-access

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-aperture-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-aperture-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-aperture-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-aperture-integrate-oso]: /docs/aperture/integrate/oso

[docs-aperture-model-aliases]: /docs/aperture/model-aliases

[docs-aperture-monitor-quota-balances]: /docs/aperture/how-to/check-and-refill-budgets

[docs-aperture-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility-cost-basis]: /docs/aperture/provider-compatibility#cost-basis

[docs-aperture-provider-compatibility-model-cost-map]: /docs/aperture/provider-compatibility#model-cost-map

[docs-aperture-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-aperture-reference]: /docs/aperture/reference

[docs-aperture-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-aperture-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-aperture-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-aperture-set-up-mcp-servers]: /docs/aperture/mcp-server

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[docs-aperture-troubleshoot-405]: /docs/aperture/troubleshooting#http-405-error-from-upstream-provider

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture-visible-groups]: /docs/aperture/visible-groups

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-aperture]: /docs/aperture

[docs-model-alias-destination-requirements]: /docs/aperture/model-aliases#destination-requirements

[docs-model-alias-errors]: /docs/aperture/model-aliases#configuration-errors

[docs-model-alias-schema]: /docs/aperture/model-aliases#configuration-schema

[docs-provider-authorization]: /docs/aperture/provider-compatibility#authorization-types

[docs-provider-flags]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-provider-matrix]: /docs/aperture/reference/supported-providers-clients#provider-matrix

[docs-supported-providers-clients]: /docs/aperture/reference/supported-providers-clients

[docs-tailscale-grants]: /docs/features/access-control/grants/grants-app-capabilities

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-anthropic-models]: https://platform.claude.com/docs/en/about-claude/models/overview

[xt-anthropic-plans]: https://www.anthropic.com/pricing

[xt-gemini-plans]: https://gemini.google.com

[xt-openai-models]: https://platform.openai.com/docs/models

[xt-openai-plans]: https://openai.com/chatgpt/pricing
