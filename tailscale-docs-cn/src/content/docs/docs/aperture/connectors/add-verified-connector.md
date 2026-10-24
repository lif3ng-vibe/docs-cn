---
title: "Add a verified connector"
description: "Aperture maintains a registry of verified connectors with pre-configured defaults. Select a provider in the connector picker to pre-fill its available fields, such as its URL, OAuth endpoints, and sco"
---

Last validated Sep 28, 2026

Aperture maintains a registry of verified connectors with pre-configured defaults. Select a provider in the connector picker to pre-fill its available fields, such as its URL, OAuth endpoints, and scopes. Supply OAuth client credentials if the provider requires them.

These steps use Salesforce, Atlassian, and Slack as examples and apply to any provider in the picker. For the current list, open the picker or refer to the [connectors reference][docs-connectors-reference].

Most verified connectors use the [per-user OAuth 2.0 authorization code flow][docs-set-up-per-user-oauth2-connector], so each user authorizes individually after you configure the connector.

> **Note:**
>
> Some verified connectors, such as Atlassian, use [dynamic client registration (`oauth2_dcr`)][docs-connectors-reference-dcr] instead. Aperture registers an OAuth client with the provider automatically, so these connectors have no OAuth application to create and no client credentials to supply. For a DCR connector, skip Step 1 and Step 2's credential fields: the connector needs only its registry URL. Each user still authorizes individually.

## Prerequisites

Before you begin, you need the following:

* Admin access to the Aperture configuration. Refer to [Get started with connectors][docs-connectors-get-started].
* If the selected connector requires a manually created OAuth application, permission to create one in the provider's developer or admin console. Connectors using `oauth2_dcr` do not require this permission.

## Step 1: Create the OAuth application at the provider

Configure the OAuth application on the provider first. Mismatched values between the provider and Aperture are the most common cause of connection failures.

\[Missing snippet: aperture\_google\_workspace\_dpp\_note.mdx]

1. Create an OAuth application in the provider's developer or admin console.
2. Register `https://<aperture-hostname>/aperture/auth/<connector-id>/callback` as the redirect URI. In Step 2, Aperture defaults the connector ID to the provider name, such as `Salesforce`. Use the same ID here. To choose a custom ID first, complete Step 2 before registering the callback URL.
3. Grant the application the scopes your users need. The picker pre-fills each provider's default scopes as editable chips, which you can add to or remove.
4. Note the client ID. If the application uses a client secret, note that too. You enter these values in Aperture in the next step.

## Step 2: Add the connector from the picker

Add and configure the connector:

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. Choose **Add connector** and select a verified provider from the list. Choose **Custom connector** to configure a provider that is not in the registry. Aperture pre-fills the fields available for that provider and sets the connector ID to the provider name. Dynamic client registration connectors, including Atlassian, Notion, and Linear, do not pre-fill authorization or token URLs.
3. Confirm or edit the connector ID, then enter your client ID and your client secret if your OAuth application uses one. PKCE-only applications can omit the secret. The connector ID must match the value you used in the callback URL.
4. When you select an authorization-code verified provider, Aperture pre-fills any `auth_params` that provider requires for refresh tokens (for example, Google's `{"access_type": "offline", "prompt": "consent"}`). You normally do not need to change these. Refer to the [connectors reference][docs-connectors-reference] for `auth_params` details.
5. Save the connector.

Aperture uses the saved configuration, not the registry defaults, at runtime. For default URLs and scopes, refer to the [connectors reference][docs-connectors-reference].

## Step 3: Grant access

Verified connectors are deny-by-default like all connectors. Add a `connectors` grant so users can reach the connector's tools. Refer to [grant access to MCP tools][docs-grant-mcp-tool-access].

## Step 4: Have users authorize

Open **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors] to confirm the connector is available to the intended users.

Tell your users to [use the connector][docs-connectors-use]: open Chat **Connectors**, select the connector, and choose **Connect** to complete the consent flow.

## Related

* [Set up a per-user OAuth 2.0 connector][docs-set-up-per-user-oauth2-connector] - Configure a custom connector that uses the same per-user OAuth flow.
* [Connectors reference][docs-connectors-reference] - The verified connectors registry, authentication types, and field definitions.

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
