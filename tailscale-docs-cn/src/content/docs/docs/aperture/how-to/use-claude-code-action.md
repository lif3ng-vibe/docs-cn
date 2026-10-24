---
title: "Use Claude Code Action with Aperture"
description: "Configure the [Claude Code GitHub Action][xt-claude-code-action] to send requests through [Aperture by Tailscale][docs-aperture] so that CI runners use their Tailscale identity for authentication inst"
---

Last validated Sep 28, 2026

Configure the [Claude Code GitHub Action][xt-claude-code-action] to send requests through [Aperture by Tailscale][docs-aperture] so that CI runners use their Tailscale identity for authentication instead of per-repository API keys.

## Prerequisites

* An [Aperture gateway][docs-get-started] with an Anthropic provider configured and at least one Anthropic model enabled.
* A Tailscale account with [Owner, Admin, or Network admin](/docs/reference/user-roles) permissions.
* A GitHub repository with GitHub Actions enabled and admin access to create repository secrets.

\[Missing snippet: aperture\_tls\_warning.mdx]

## Create a CI tag and grant access to Aperture

CI runners need a Tailscale tag, network access to the Aperture gateway, and a grant that authorizes model usage.

1. Open the [Access controls](https://console.tailscale.com/admin/acls/file) page in the admin console.

2. In the `tagOwners` section, add `tag:ci` if it does not already exist:

   ```json
   "tagOwners": {
     "tag:ci": []
   }
   ```

   An empty owner list means [Owners, Admins, and Network admins](/docs/reference/user-roles) can apply the tag.

3. Add a grant that gives `tag:ci` devices network access to the Aperture gateway and permission to use Anthropic models:

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

   Replace `"<aperture-hostname>"` with the hostname or Tailscale IP address of your Aperture gateway if it differs from the default. Adjust the `models` pattern to restrict CI runners to specific models, such as `anthropic/claude-sonnet-5-5`.

4. Save the tailnet policy file. The rules take effect immediately.

> **Warning:**
>
> The grant must include both a `role` entry and a `models` entry. Without `role`, Aperture returns HTTP 403 even if the `models` pattern matches.

For more information on grant syntax and model patterns, refer to [grant access to models][docs-grant-model-access]. Because this grant lives in the tailnet policy file, it includes an explicit `dst` field. For how grant requirements differ between the tailnet policy file and the Aperture configuration, refer to [Aperture grants versus tailnet policy file grants][docs-aperture-vs-tailnet-grants].

## Set up Tailscale authentication for GitHub Actions

The [Tailscale GitHub Action][docs-tailscale-github-action] needs credentials to join your tailnet as an ephemeral node.

### Workload identity federation (recommended)

Workload identity federation uses GitHub's OIDC tokens to authenticate, eliminating secrets that can expire or leak.

1. Create a [federated identity][docs-workload-identity-federation] in the Tailscale admin console. Set the issuer to GitHub Actions and configure the subject claim to match your repository. Assign the `auth_keys` scope and the `tag:ci` tag.
2. Copy the **Client ID** and **Audience** values.
3. In your GitHub repository, create two [repository secrets][xt-gh-secrets]:
   * `TS_OAUTH_CLIENT_ID`: your federated identity Client ID.
   * `TS_AUDIENCE`: your federated identity Audience.

Workload identity federation requires the `id-token: write` permission in your GitHub Actions workflow, which you add when you configure the workflow file.

### OAuth client

If your organization does not use workload identity federation, create an [OAuth client][docs-oauth-clients] instead.

1. Create an [OAuth client][docs-oauth-clients] in the admin console with the `auth_keys` scope and the `tag:ci` tag.
2. Copy the **Client ID** and **Client secret**.
3. In your GitHub repository, create two repository secrets:
   * `TS_OAUTH_CLIENT_ID`: your OAuth Client ID.
   * `TS_OAUTH_SECRET`: your OAuth Client secret.

For detailed instructions on either option, refer to the [Tailscale GitHub Action documentation][docs-tailscale-github-action].

## Add Claude Code Action to the workflow

Create or update a workflow file (for example, `.github/workflows/claude.yml`) with the following content. This example uses workload identity federation. If you use an OAuth client, replace `audience` with `oauth-secret` and reference `secrets.TS_OAUTH_SECRET`.

```yaml
name: Claude Code
on:
  pull_request:

permissions:
  id-token: write
  pull-requests: write
  contents: read

jobs:
  claude:
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
          ping: ai

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: "-"
        env:
          ANTHROPIC_BASE_URL: "http://ai"
          CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
```

### Key settings

| Setting                                            | Purpose                                                                                                                                               |
| :------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags: tag:ci`                                     | Assigns the tag that Aperture uses to identify and authorize the caller.                                                                              |
| `ping: <aperture-hostname>`                        | Waits for connectivity to the Aperture gateway before proceeding. Prevents the Claude Code step from starting before the tailnet connection is ready. |
| `anthropic_api_key: "-"`                           | Placeholder that satisfies the action's non-empty check. Aperture manages the real API key.                                                           |
| `ANTHROPIC_BASE_URL: "http://<aperture-hostname>"` | Redirects all API calls to the Aperture gateway. MagicDNS resolves `<aperture-hostname>` to the Aperture gateway's Tailscale IP address.              |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"`    | Prevents Claude Code from sending telemetry or update checks that would bypass Aperture.                                                              |

> **Note:**
>
> `anthropic_api_key` is a `with:` input (action parameter), while `ANTHROPIC_BASE_URL` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` are `env:` variables. The action performs a truthy check on `anthropic_api_key` and refuses to start without it.

### Permissions

The `permissions` block sets the minimum GitHub token permissions the workflow needs:

| Permission             | Purpose                                                                     |
| :--------------------- | :-------------------------------------------------------------------------- |
| `id-token: write`      | Required for workload identity federation. Omit if you use an OAuth client. |
| `pull-requests: write` | Lets the Claude Code Action post review comments on the pull request.       |
| `contents: read`       | Lets the Claude Code Action read repository files.                          |

## Verify the connection

1. Open a pull request with a small code change to trigger the workflow.
2. In the workflow run's **Actions** tab, confirm:
   * The **Connect to tailnet** step connected and the `ping: <aperture-hostname>` check succeeded.
   * The **Run Claude Code** step completed and shows API calls to `http://<aperture-hostname>`.
3. Open the Aperture admin dashboard, select **Security** > **Logs**, and confirm the request appears with `tag:ci` as the caller identity. Admin access is required.

### Troubleshoot common issues

| Symptom                                  | Cause                                                                                            | Fix                                                                                             |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| Connection timeout in the Tailscale step | `tag:ci` does not exist in `tagOwners`, or the runner cannot reach the coordination server.      | Verify the tag exists in your tailnet policy file and your GitHub secrets are correct.          |
| HTTP 403 from Aperture                   | The grant is missing a `role` entry, or the `models` pattern does not match the requested model. | Verify the grant includes both `{ "role": "user" }` and a matching `{ "models": "..." }` entry. |
| Claude Code reports an API key error     | `anthropic_api_key` is empty or missing.                                                         | Set `anthropic_api_key: "-"` in the `with:` block. The value must be non-empty.                 |
| `ping: <aperture-hostname>` times out    | The network grant does not allow `tag:ci` to reach the Aperture gateway on port 80.              | Check the `dst` and `ip` fields in your network access grant.                                   |

## Next steps

* [Set per-user spending limits][docs-set-per-user-spending-limits] to cap how much CI pipelines spend on AI requests.
* Restrict CI runners to specific models by narrowing the `models` pattern in the grant, for example `anthropic/claude-sonnet-5-5` instead of `anthropic/**`.
* [Export usage data to S3][docs-export-usage-data-to-s3] for long-term retention and record-keeping.
* [Build a custom webhook][docs-build-webhook] to receive real-time notifications when CI runners make AI requests.
* For a complete guide that sets up AI-powered code reviews with cost control and usage visibility, refer to [route AI code reviews through Aperture][docs-route-ai-code-reviews].

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-aperture]: /docs/aperture

[docs-build-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-export-usage-data-to-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-route-ai-code-reviews]: /docs/solutions/route-ai-code-reviews-through-aperture

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-workload-identity-federation]: /docs/features/workload-identity-federation

[xt-claude-code-action]: https://github.com/anthropics/claude-code-action

[xt-gh-secrets]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
