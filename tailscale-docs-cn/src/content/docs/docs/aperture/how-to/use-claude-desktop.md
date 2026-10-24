---
title: "Use Claude Desktop with Aperture"
description: "Configure the [Claude Desktop][xt-claude-desktop] app to send model requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, an"
---

Last validated Sep 29, 2026

Configure the [Claude Desktop][xt-claude-desktop] app to send model requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging.

Claude Desktop's gateway connection uses the Anthropic Messages API. Configure it to send requests to your Aperture gateway.

> **Note:**
>
> To skip the manual steps below, use the [Aperture CLI][docs-aperture-cli]. It lists Claude Desktop as **Claude Cowork**, writes the gateway configuration, and changes HTTP URLs to HTTPS. This connection uses Anthropic Messages. For Bedrock limitations, refer to [Use Amazon Bedrock models][ar-use-amazon-bedrock-models].

The manual configuration steps in this guide use the macOS Claude Desktop app and its menu paths. To deploy to Windows devices, refer to [Deploy across a fleet with MDM][ar-deploy-across-a-fleet-with-mdm].

## Prerequisites

Before you begin, you need:

* An Aperture gateway with a provider that supports Anthropic Messages, such as Anthropic, and a model you have permission to use. The gateway must be accessible from your device. Refer to [get started with Aperture][docs-get-started] if you have not set this up.
* The Aperture gateway URL accessible from your device over `https://`, with a trusted TLS certificate valid for that hostname.
* The [Claude Desktop][xt-claude-desktop] app installed on macOS.

> **Warning:**
>
> Claude Desktop requires an `https://` gateway URL and rejects `http://`. Use the full tailnet hostname covered by the gateway's TLS certificate, such as `https://<aperture-hostname>.<tailnet-name>.ts.net`. Configure that endpoint in the [Aperture CLI][docs-aperture-cli] before using its Claude Cowork setup. The CLI changes the URL scheme to HTTPS but does not expand a short hostname to its full tailnet name.

\[Missing snippet: aperture\_any\_provider.mdx]

Claude Desktop's gateway connection is a per-user setting. Each person who uses Aperture configures it on their own device, or an admin deploys it across a fleet with MDM.

## Enable Developer Mode

The gateway connection lives behind Developer Mode:

1. In the menu bar, select **Help** > **Troubleshooting** > **Enable Developer Mode**.
2. Claude Desktop might restart. When Developer Mode is active, **Developer** appears in the menu bar.

## Configure the gateway connection

Open the third-party inference configuration and point it at your Aperture gateway:

1. Select **Developer** > **Configure Third-Party Inference**.

2. Set the connection type to **Gateway**.

3. Set **Credential kind** to **Static API key**.

4. Set **Gateway base URL** to the full HTTPS hostname of your Aperture gateway:

   ```text
   https://<aperture-hostname>.<tailnet-name>.ts.net
   ```

5. Set **Gateway API key** to any non-empty placeholder, such as `aperture`. The field cannot be empty, but Aperture requires no API key and ignores the value. Aperture authenticates requests by tailnet identity and injects provider credentials automatically.

6. Leave the **Custom inference headers** section empty. Aperture does not require an authorization header.

7. In the **Models** section, add at least one model your admin has configured in Aperture. Aperture does not expose a discoverable model list, so enter models manually rather than relying on model discovery. For example:

   | Field        | Value               |
   | ------------ | ------------------- |
   | Model ID     | `claude-sonnet-5-5` |
   | Display name | Claude Sonnet       |
   | Tier alias   | `sonnet`            |

8. Select **Save Changes**, then **Apply Changes**.

9. Fully quit and reopen Claude Desktop to load the new configuration.

> **Note:**
>
> Aperture routes to the native Anthropic Messages API (`/v1/messages`). Keep the connection type set to **Gateway**, not an OpenAI-compatible option.

## Use Amazon Bedrock models

Changing the model ID alone does not let this Anthropic Messages connection use Amazon Bedrock Runtime. Aperture routes Anthropic Messages and native Bedrock APIs separately.

To use a provider configured with `bedrock_model_invoke` or `bedrock_converse`, follow [Set up Amazon Bedrock][docs-use-amazon-bedrock] and use a client with the corresponding Bedrock back end. For example, the [Claude Code CLI configuration][docs-cli-claude-code] uses the native Bedrock InvokeModel path. Refer to [Supported providers and clients][docs-compatibility] before selecting a client and provider.

## Verify the connection

To verify that Claude Desktop routes requests through Aperture:

1. Start a conversation in Claude Desktop and send a test message.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If the request does not appear, refer to the [Aperture troubleshooting topic][docs-aperture-troubleshooting].

## Deploy across a fleet with MDM

Because the gateway connection is a per-user setting, an admin can push it to every managed device instead of having each person configure it by hand. Claude Desktop's **Export** feature turns a working configuration into a deployment file for your device management platform.

To generate and deploy the configuration:

1. Configure the gateway connection on one device using the steps above, and confirm it works.

2. In the **Configure Third-Party Inference** window, open the **Export** dropdown at the top.

3. Choose the format that matches your management platform:

   | Format                       | File            | Use with                                      |
   | ---------------------------- | --------------- | --------------------------------------------- |
   | macOS configuration profile  | `.mobileconfig` | Jamf, Kandji, Intune, and other MDM platforms |
   | Windows registry file        | `.reg`          | Windows deployment tooling                    |
   | Group Policy template (ADMX) | `.zip`          | Intune or Group Policy managed consoles       |

4. Deploy the exported file with your management platform. For example, on macOS, push the `.mobileconfig` profile through your MDM to set managed preferences under the `com.anthropic.claudefordesktop` domain, which locks the gateway connection for every managed device.

> **Note:**
>
> The export writes the placeholder API key into the file in plain text. Because Aperture requires no API key, this value is not a secret and the exported file contains no real credentials.

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[ar-deploy-across-a-fleet-with-mdm]: #deploy-across-a-fleet-with-mdm

[ar-use-amazon-bedrock-models]: #use-amazon-bedrock-models

[docs-aperture-cli]: /docs/aperture/cli

[docs-cli-claude-code]: /docs/aperture/cli#claude-code

[docs-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-use-amazon-bedrock]: /docs/aperture/how-to/use-amazon-bedrock

[xt-claude-desktop]: https://claude.ai/download
