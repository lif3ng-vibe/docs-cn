---
title: "Route AI code reviews through Aperture"
description: "Centralize API key management, usage tracking, and cost control for AI-powered code reviews by routing Claude Code GitHub Action requests through Aperture by Tailscale."
---

Last validated Sep 28, 2026

AI-powered code reviews generate API calls from every pull request, and each call needs an API key. When those keys live in GitHub secrets spread across repositories, you lose visibility into which team or workflow is spending what, and a single leaked key exposes your entire AI budget. Revoking or rotating keys means touching every repository that uses one.

In this guide, you route [Claude Code GitHub Action][xt-claude-code-action] requests through [Aperture by Tailscale][docs-aperture] so that CI runners authenticate with their Tailscale identity instead of individual API keys. Every AI code review request flows through Aperture, where it is logged with the caller's identity, charged against a central budget, and forwarded to Anthropic using a single API key that never leaves the Aperture gateway.

You configure three things: a tailnet policy file rule, an Aperture grant, and a GitHub Actions workflow.

## How it works

The request flow works like this:

1. The [Tailscale GitHub Action][docs-tailscale-github-action] runs at the start of your workflow and creates an ephemeral node tagged `tag:ci` in your tailnet.
2. The [Claude Code Action][xt-claude-code-action] starts a code review. Because the workflow sets `ANTHROPIC_BASE_URL` to `http://<aperture-hostname>`, every API call goes to the Aperture gateway instead of directly to Anthropic.
3. Aperture receives the request, identifies the caller as `tag:ci` using [Tailscale's WhoIs API][docs-how-aperture-works], checks the grant, and forwards the request to Anthropic with the centrally managed API key.
4. Aperture logs the request with the caller's identity, model, token count, and cost. The response flows back to the runner.

This approach removes API keys from GitHub secrets and the runner environment. The runner authenticates through its Tailscale identity alone, and Aperture injects the Anthropic API key when forwarding requests.

Because all traffic between the runner and Aperture travels over your tailnet, it is encrypted with WireGuard. The `http://` URL is safe because the underlying transport is already encrypted.

This guide uses a centrally managed API key. To have each runner forward its own provider credential instead, configure the Anthropic provider in [passthrough mode][docs-use-passthrough-mode].

## Prerequisites

* An [Aperture gateway][docs-get-started] with an Anthropic provider configured and at least one Anthropic model enabled.
* A Tailscale account with [Owner, Admin, or Network admin](/docs/reference/user-roles) permissions.
* A GitHub repository with GitHub Actions enabled and admin access to create repository secrets.
* Familiarity with [GitHub Actions workflow syntax][xt-gh-workflow-syntax], [Tailscale tags][docs-tags], and [tailnet policy file grants][docs-grants].

\[Missing snippet: aperture\_tls\_warning.mdx]

## Step 1: Create a CI tag and grant access to Aperture

Before your CI runners can reach Aperture, define a tag for them, allow that tag to connect to the Aperture device, and grant it permission to use models.

### Define the tag

Open the [Access controls](https://console.tailscale.com/admin/acls/file) page in the admin console. In the `tagOwners` section, add `tag:ci` if it does not already exist:

```json
"tagOwners": {
  "tag:ci": []
}
```

An empty owner list means [Owners, Admins, and Network admins](/docs/reference/user-roles) can apply the tag. The Tailscale GitHub Action applies this tag automatically when it creates its ephemeral node.

### Allow network access

In the same tailnet policy file, add a grant that lets `tag:ci` devices reach the Aperture device on port 80:

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["ai"],
      "ip": ["tcp:80"]
    }
  ]
}
```

Replace `"<aperture-hostname>"` with the hostname or Tailscale IP address of your Aperture device if it differs from the default.

### Grant model access

CI runners also need an Aperture grant that authorizes them to use specific models. Add the following grant to the tailnet policy file:

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["<aperture-hostname>"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

The `models` pattern `anthropic/**` lets the CI runner access all Anthropic models. Adjust the pattern to restrict CI runners to specific models, such as `anthropic/claude-sonnet-5-5`.

> **Warning:**
>
> The grant must include both a `role` entry and a `models` entry. Without `role`, Aperture returns HTTP 403 even if the `models` pattern matches.

You can combine network access and model access into a single grant:

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["<aperture-hostname>"],
      "ip": ["tcp:80"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

Save the tailnet policy file. The rules take effect immediately.

## Step 2: Set up Tailscale authentication for GitHub Actions

The Tailscale GitHub Action needs credentials to join your tailnet as an ephemeral node.

### Workload identity federation (recommended)

Workload identity federation uses GitHub's OIDC tokens to authenticate, eliminating secrets that can expire or leak.

1. Create a [federated identity][docs-workload-identity-federation] in the Tailscale admin console. Set the issuer to GitHub Actions and configure the subject claim to match your repository. Assign the `auth_keys` scope and the `tag:ci` tag.
2. Copy the **Client ID** and **Audience** values.
3. In your GitHub repository, create two [repository secrets][xt-gh-secrets]:
   * `TS_OAUTH_CLIENT_ID`: your federated identity Client ID.
   * `TS_AUDIENCE`: your federated identity Audience.

Workload identity federation requires the `id-token: write` permission in your GitHub Actions workflow, which you add in Step 3.

### OAuth client

If your organization does not use workload identity federation, create an [OAuth client][docs-oauth-clients] instead.

1. Create an [OAuth client][docs-oauth-clients] in the admin console with the `auth_keys` scope and the `tag:ci` tag.
2. Copy the **Client ID** and **Client secret**.
3. In your GitHub repository, create two repository secrets:
   * `TS_OAUTH_CLIENT_ID`: your OAuth Client ID.
   * `TS_OAUTH_SECRET`: your OAuth Client secret.

For detailed instructions on either option, refer to the [Tailscale GitHub Action documentation][docs-tailscale-github-action].

## Step 3: Configure the GitHub Actions workflow

With access controls and authentication in place, configure your workflow to connect to the tailnet and route Claude Code requests through Aperture.

Create or update a workflow file (for example, `.github/workflows/code-review.yml`) with the following content. This example uses workload identity federation. If you use an OAuth client, replace `audience` with `oauth-secret` and reference `secrets.TS_OAUTH_SECRET`.

```yaml
name: AI code review
on:
  pull_request:

permissions:
  id-token: write
  pull-requests: write
  contents: read

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Connect to tailnet
        uses: tailscale/github-action@v4
        with:
          oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          audience: ${{ secrets.TS_AUDIENCE }}
          tags: tag:ci
          ping: <aperture-hostname>

      - name: Run Claude Code review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: "-"
        env:
          ANTHROPIC_BASE_URL: "http://ai"
          CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
```

### Permissions

The `permissions` block sets the minimum GitHub token permissions the workflow needs:

| Permission             | Purpose                                                                                                                                  |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `id-token: write`      | Required for workload identity federation. The Tailscale action uses it to request a GitHub OIDC token. Omit if you use an OAuth client. |
| `pull-requests: write` | Lets the Claude Code Action post review comments on the pull request.                                                                    |
| `contents: read`       | Lets the Claude Code Action read repository files for the review.                                                                        |

### Tailscale GitHub Action

The `tailscale/github-action@v4` step creates an ephemeral node in your tailnet:

* `tags: tag:ci` assigns the tag that Aperture uses to identify and authorize the caller.
* `ping: <aperture-hostname>` waits up to three minutes for a connection to the Aperture gateway. The Claude Code step starts only after the connection is ready.

### Claude Code Action

The `anthropics/claude-code-action@v1` step runs the AI code review:

* `anthropic_api_key: "-"` is a placeholder that satisfies the action's non-empty check. Aperture manages the real API key, so this value is never sent to Anthropic.
* `ANTHROPIC_BASE_URL: "http://<aperture-hostname>"` redirects all API calls to the Aperture gateway. MagicDNS resolves `<aperture-hostname>` to its Tailscale IP address.
* `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"` prevents Claude Code from sending telemetry or update checks that would bypass Aperture and fail without direct internet access.

> **Note:**
>
> `anthropic_api_key` is a `with:` input (action parameter), while `ANTHROPIC_BASE_URL` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` are `env:` variables. This distinction matters because the action performs a truthy check on `anthropic_api_key` and refuses to start without it.

## Step 4: Verify the pipeline

After committing the workflow file, open a pull request with a small code change to confirm the integration works end-to-end. The workflow runs automatically and the Claude Code Action posts review comments on the PR.

### Check the GitHub Actions logs

Open the workflow run in your repository's **Actions** tab:

1. In the **Connect to tailnet** step, confirm the Tailscale action connected and the `ping: <aperture-hostname>` check succeeded.
2. In the **Run Claude Code review** step, confirm Claude Code received a response from Aperture. Find lines showing the API call to `http://<aperture-hostname>`.

### Check the Aperture admin dashboard

As an Aperture admin, open `http://<aperture-hostname>/admin/logs` from a device in your tailnet:

1. Find the request from your test PR. The request shows `tag:ci` as the caller identity.
2. Verify the logged model name, token count, and cost match what you expect.

If the request appears with the `tag:ci` identity, the integration is working. Every future pull request generates logged records in Aperture.

### Troubleshoot common issues

If the workflow fails, check these common causes:

| Symptom                                  | Cause                                                                                                     | Fix                                                                                             |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| Connection timeout in the Tailscale step | `tag:ci` does not exist in `tagOwners`, or the runner cannot reach the coordination server.               | Verify the tag exists in your tailnet policy file and your GitHub secrets are correct.          |
| HTTP 403 from Aperture                   | The Aperture grant is missing a `role` entry, or the `models` pattern does not match the requested model. | Verify the grant includes both `{ "role": "user" }` and a matching `{ "models": "..." }` entry. |
| Claude Code reports an API key error     | `anthropic_api_key` is empty or missing.                                                                  | Set `anthropic_api_key: "-"` in the `with:` block. The value must be non-empty.                 |
| `ping: <aperture-hostname>` times out    | The network grant does not allow `tag:ci` to reach the Aperture device on port 80.                        | Check the `dst` and `ip` fields in your network access grant.                                   |

## Export logs for long-term retention (optional)

For long-term retention, you can export Aperture session logs to S3-compatible storage. Each exported record includes the caller identity, model, token counts, cost, and full session context, which you can feed into your existing cost-allocation or analytics pipelines.

For setup instructions, refer to [export usage data to S3][docs-export-usage-data-to-s3]. If you require that Aperture never store prompt or response content on disk, combine this with [zero-retention mode][docs-aperture-zero-retention] to keep S3 as the only archive.

## Next steps

With AI code reviews flowing through Aperture, consider:

* [Set per-user spending limits][docs-set-per-user-spending-limits] to cap how much your CI pipelines spend on AI reviews per day or month.
* Restrict CI runners to specific models by narrowing the `models` pattern in the grant, for example `anthropic/claude-sonnet-5-5` instead of `anthropic/**`.
* Apply the same pattern to other AI-powered CI tools by setting their base URL to `http://<aperture-hostname>` and connecting through the tailnet.
* [Build a custom webhook][docs-build-webhook] to receive real-time notifications when CI runners make AI requests.

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-aperture]: /docs/aperture

[docs-build-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-export-usage-data-to-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-get-started]: /docs/aperture/get-started

[docs-grants]: /docs/features/access-control/grants

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-tags]: /docs/features/tags

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-claude-code-action]: https://github.com/anthropics/claude-code-action

[xt-gh-secrets]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets

[xt-gh-workflow-syntax]: https://docs.github.com/en/actions/how-tos/write-workflows
