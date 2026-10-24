---
title: "Integrate Cerbos with Aperture"
description: "[Cerbos][xt-cerbos] is a policy engine that provides fine-grained, context-aware authorization. By connecting Aperture to Cerbos, you can send LLM request data to Cerbos so it can enforce authorizatio"
---

Last validated Jun 26, 2026

[Cerbos][xt-cerbos] is a policy engine that provides fine-grained, context-aware authorization. By connecting Aperture to Cerbos, you can send LLM request data to Cerbos so it can enforce authorization policies on AI usage, such as controlling which users can access specific models or tools.

Aperture sends data to Cerbos using the [hooks system][docs-configuration-hooks]. You configure a hook endpoint for your Cerbos deployment and a grant that specifies which requests trigger the hook and what data to include.

Cerbos is a third-party service. When Aperture forwards request data to it, Cerbos's use of that data is governed by your agreement with Cerbos, not your agreement with Tailscale.

\[Missing snippet: aperture\_async\_hook\_note.mdx]

## Prerequisites

Before you begin, ensure you have the following:

* A running [Aperture gateway][docs-get-started] accessible from your device.
* A [Cerbos][xt-cerbos] deployment (self-hosted or Cerbos Hub) with an API endpoint that can receive webhook data.

## Configure the Cerbos endpoint

To integrate Cerbos with Aperture, configure the Cerbos endpoint so you can use it as a hook in Aperture and set up a grant to send request data to that hook. This lets Cerbos receive real-time data about LLM requests for authorization decisions.

1. In your Cerbos deployment, identify or create an endpoint that can receive HTTP POST requests from Aperture.
2. Note the endpoint URL and any API key or authentication token. You'll use these when configuring the hook in Aperture.

For details on setting up Cerbos, refer to the [Cerbos documentation][xt-cerbos-docs].

## Configure the Aperture hook

Configure a hook in Aperture that points to your Cerbos endpoint. This lets you send request data to Cerbos for authorization decisions.

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Add a `cerbos` entry in the `hooks` section with the endpoint URL from your Cerbos deployment.

   ```json
   "hooks": {
       "cerbos": {
           "url": "<cerbos-endpoint-url>",
           "apikey": "<cerbos-api-key>"
       }
   }
   ```

   Replace `<cerbos-endpoint-url>` with the URL of your Cerbos endpoint and `<cerbos-api-key>` with the API key from your Cerbos deployment.

3. Add a grant with a `send_hooks` entry that references the `cerbos` hook. The grant controls which requests trigger the hook and what data Aperture sends.

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "send_hooks": [
                           {
                               "name": "cerbos",
                               "events": ["entire_request"],
                               "send": ["tools", "user_message", "grants"]
                           }
                       ]
                   }
               ]
           }
       }
   ]
   ```

   This configuration sends request data for all users. The `user_message` send type forwards prompt content to Cerbos, and the `grants` send type includes the user's custom capabilities, which Cerbos can use for authorization decisions. Send only what your policies need. To limit which users' requests trigger the hook, replace `"*"` in the `src` field with specific user identities or tags.

4. Save the configuration.

\[Missing snippet: aperture\_hooks\_config\_ref.mdx]

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Verify the integration

After configuring the Cerbos hook, verify that Aperture is sending data to Cerbos and that Cerbos is evaluating it against your policies.

1. Send a request through Aperture that matches your grant conditions.
2. Check your Cerbos deployment to confirm the request data arrives.
3. Verify that Cerbos evaluates the data against your authorization policies.

\[Missing snippet: aperture\_verify\_hook\_wiring.mdx]

## Next steps

\[Missing snippet: aperture\_hooks\_next\_steps.mdx]

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[xt-cerbos-docs]: https://docs.cerbos.dev/

[xt-cerbos]: https://www.cerbos.dev/
