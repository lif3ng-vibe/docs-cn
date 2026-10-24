---
title: "Manage an existing Oso integration"
description: "[Oso][xt-oso] is an authorization platform that provides fine-grained access control for AI agents. This topic is for Aperture admins managing an existing Oso integration."
---

Last validated Sep 29, 2026

[Oso][xt-oso] is an authorization platform that provides fine-grained access control for AI agents. This topic is for Aperture admins managing an existing Oso integration.

Aperture sends tool use data to Oso using the [hooks system][docs-configuration-hooks]. The hook defines the Oso endpoint, and a grant specifies which requests trigger the hook and what data to include.

Oso is a third-party service. When Aperture forwards request data to it, Oso's use of that data is governed by your agreement with Oso, not your agreement with Tailscale.

\[Missing snippet: aperture\_async\_hook\_note.mdx]

## Prerequisites

Before you begin, ensure you have the following:

* Access to your [Aperture gateway][docs-get-started].
* The admin role in Aperture to access the admin dashboard and edit configuration.
* An existing Oso integration configured in Aperture and access to its Oso account.

## Review or update the Oso hook

To review or update an existing integration:

1. Open the Aperture admin dashboard and go to **Administration** > **Configuration**.

2. Find the existing `oso` entry in the `hooks` section. If you need to replace its API key, update the `apikey` value with a key from your Oso account.

   ```json
   "hooks": {
       "oso": {
           "url": "https://api.osohq.com/api/agents/v1/model-request",
           "apikey": "<oso-api-key>"
       }
   }
   ```

   Keep the existing endpoint unless Oso instructs you to change it.

3. Review the grants with a `send_hooks` entry that references the `oso` hook. Each grant controls which requests trigger the hook and what data Aperture sends. For example:

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "send_hooks": [
                           {
                               "name": "oso",
                               "events": ["tool_call_entire_request"],
                               "send": ["user_message", "tools", "request_body", "response_body"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   This configuration forwards full request and response bodies (`request_body` and `response_body`), which contain prompt and model-output content, not just tool-use metadata. Send only the data Oso needs for your authorization policies. To limit which users' requests trigger the hook, replace `"*"` in the `src` field with specific user identities or tags.

4. Save the configuration.

\[Missing snippet: aperture\_hooks\_config\_ref.mdx]

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Verify the integration

After updating the Oso hook or its grants, verify that Aperture is sending the intended data to Oso.

1. Send a request through Aperture that includes a tool call and matches your grant conditions.
2. Open the [Oso dashboard][xt-oso] and confirm the tool use data appears.

\[Missing snippet: aperture\_verify\_hook\_wiring.mdx]

## Next steps

\[Missing snippet: aperture\_hooks\_next\_steps.mdx]

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[xt-oso]: https://www.osohq.com/
