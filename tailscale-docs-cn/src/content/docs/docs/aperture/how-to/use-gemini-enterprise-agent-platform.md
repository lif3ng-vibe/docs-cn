---
title: "Set up Gemini Enterprise Agent Platform"
description: "Configure a Gemini Enterprise Agent Platform provider in Aperture so your team can access Google Gemini and Anthropic Claude models through Aperture. This topic covers creating a Google Cloud service "
---

Last validated Sep 29, 2026

Configure a Gemini Enterprise Agent Platform provider in Aperture so your team can access Google Gemini and Anthropic Claude models through Aperture. This topic covers creating a Google Cloud service account, generating a key file, and adding the provider to your Aperture configuration.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* A Google Cloud project with the [Gemini Enterprise Agent Platform API][xt-geap-api] enabled.
* The [Google Cloud CLI][xt-gcloud-cli] (`gcloud`) installed and authenticated.
* Your Aperture gateway hostname, such as `ai` or `aperture.example.ts.net`. Tailscale's [MagicDNS][docs-magicdns] provides these names. If you [connect from outside your tailnet][docs-connect-outside-tailnet], use `localhost:<port-number>` instead.

## Set your Google Cloud project

Set the active project for the `gcloud` commands that follow. Replace `<your-project>` with your Google Cloud project ID.

```shell
gcloud config set project <your-project>
```

## Create a service account

Create a dedicated service account for Aperture to use when calling the Gemini Enterprise Agent Platform API.

```shell
gcloud iam service-accounts create aperture-vertex \
  --display-name="Aperture Gemini Enterprise Agent Platform"
```

This creates a service account named `aperture-vertex` in your project. Aperture uses this account to authenticate with the Gemini Enterprise Agent Platform API and generate bearer tokens for requests.

## Grant IAM roles

The service account requires two IAM roles: one to call the Gemini Enterprise Agent Platform API, and one to list available models.

1. Grant the `aiplatform.user` role, which lets the service account send requests to models on the Gemini Enterprise Agent Platform:

   ```shell
   gcloud projects add-iam-policy-binding <your-project> \
     --member="serviceAccount:aperture-vertex@<your-project>.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

2. Grant the `serviceUsageConsumer` role, which lets the service account list available models:

   ```shell
   gcloud projects add-iam-policy-binding <your-project> \
     --member="serviceAccount:aperture-vertex@<your-project>.iam.gserviceaccount.com" \
     --role="roles/serviceusage.serviceUsageConsumer"
   ```

## Generate a JSON key file

Create a JSON key file for the service account. Aperture uses this key file to mint bearer tokens for Gemini Enterprise Agent Platform requests.

```shell
gcloud iam service-accounts keys create aperture-vertex-key.json \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

This creates a file named `aperture-vertex-key.json` in your current directory. The file contains the private key and project metadata that Aperture needs to authenticate.

Store this file securely. You cannot recover the private key if lost, and anyone with access to the file can authenticate as the service account.

## Base64-encode the key file

Aperture requires the key file as a base64-encoded string in the provider configuration. Encode the key file and copy the result to your clipboard.

On macOS:

```shell
cat aperture-vertex-key.json | base64 | pbcopy
```

On Linux:

```shell
cat aperture-vertex-key.json | base64 -w 0
```

On Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("aperture-vertex-key.json")) | Set-Clipboard
```

Use the encoded string in the next step as the value for the provider's `apikey` field.

## Configure the Gemini Enterprise Agent Platform provider in Aperture

Add a Gemini Enterprise Agent Platform provider to your Aperture configuration at `/admin/settings/config`, on the **Administration** > **Configuration** page of the [Aperture admin dashboard][docs-web-dashboard-admin]. The following example shows the configuration with both Google and Anthropic models enabled.

```json
{
  "providers": {
    "vertex": {
      "baseurl": "https://aiplatform.googleapis.com",
      "apikey": "keyfile::<base64-encoded-key>",
      "models": [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
        "claude-haiku-4-5"
      ],
      "compatibility": {
        "google_generate_content": true,
        "google_raw_predict": true,
        "openai_chat": true
      }
    }
  }
}
```

Replace `<base64-encoded-key>` with the base64-encoded string from the previous step. The `keyfile::` prefix indicates that the value is a base64-encoded service account key file, not a plain API key. Aperture decodes the key file and extracts the `project_id`, which it uses to rewrite request paths for the Gemini Enterprise Agent Platform.

LLM clients send requests with two placeholder values in the URL path. Aperture replaces `_aperture_auto_vertex_project_id_` with the project ID from the key file, and replaces `_aperture_auto_vertex_region_` with `global`. Aperture uses the `global` region because it has the widest model availability across both Google and Anthropic model catalogs.

You do not need the `authorization` field when using `keyfile::` authentication. Aperture generates OAuth bearer tokens from the key file automatically, bypassing the `authorization` field.

The `compatibility` flags control which Gemini Enterprise Agent Platform API formats the provider accepts:

* `google_generate_content` enables the Gemini Enterprise Agent Platform `generateContent` endpoint for Google-published models such as Gemini.
* `google_raw_predict` enables the Gemini Enterprise Agent Platform raw predict endpoint for third-party models such as Anthropic Claude.
* `openai_chat` enables the platform's OpenAI-compatible Chat Completions path for Gemini models. A client using this path sends Chat Completions requests to the Aperture gateway's `/v1` base URL. It does not use the native Google URL placeholders described above.

Enable the flag for each model type your provider serves. Enable both `google_generate_content` and `google_raw_predict` if it serves Gemini and Anthropic models. To use a Chat Completions client with Gemini models, add `openai_chat`. Google-hosted Anthropic models require raw predict, not Chat Completions. These flags do not convert between arbitrary APIs. For all flags, refer to [compatibility flags][docs-provider-compatibility].

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

If the test request fails, refer to the [Aperture troubleshooting topic][docs-aperture-troubleshooting].

## Manage service account keys

List or revoke service account keys when rotating credentials or decommissioning a provider.

### List keys for the service account

Run the following command to list all keys associated with the service account:

```shell
gcloud iam service-accounts keys list \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

The output lists all keys for the service account. The `key-id` in the output matches the `private_key_id` field in your JSON key file.

### Revoke a key

Delete a specific key by its `key-id`:

```shell
gcloud iam service-accounts keys delete <key-id> \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

After revoking a key, generate a new key file and update the base64-encoded value in your Aperture provider configuration. Requests that use the revoked key fail immediately.

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-magicdns]: /docs/features/magicdns

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-web-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[xt-gcloud-cli]: https://cloud.google.com/sdk/docs/install

[xt-geap-api]: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
