---
title: "Share a local development server with the internet"
description: "Sometimes you need to share a local development server with someone outside your Tailscale network. For example, a client reviewing a prototype, a contractor testing an integration, or an external ser"
---

Last validated May 18, 2026

Sometimes you need to share a local development server with someone outside your Tailscale network. For example, a client reviewing a prototype, a contractor testing an integration, or an external service delivering webhooks. Tailscale [Funnel][docs-funnel] lets you expose a local port to the public internet over a stable HTTPS URL, without configuring port forwarding, DNS records, or a public IP address on your device.

> **Warning:**
>
> Tailscale Funnel exposes your local port to the public internet. Anyone with the URL can access it. Do not use Funnel to expose services that contain sensitive data or that are not intended for public access.

1. Ensure you have [MagicDNS][docs-magicdns] and [HTTPS certificates][docs-https] enabled for your tailnet. Both are required for Funnel and are enabled by default for new tailnets.

2. Go to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console and turn on **Funnel**. You need to be a member of the [Owner, Admin, or Network admin](/docs/reference/user-roles) Tailscale role to enable Funnel.

3. Ensure your local development server is running and listening for requests.

4. Run the [`tailscale funnel`][docs-tailscale-funnel] command, replacing `3000` with the port your development server is listening on:

   ```bash
   tailscale funnel 3000
   ```

   Tailscale Funnel proxies public HTTPS traffic to your local port and automatically provisions a TLS certificate. The output shows the public URL anyone can use to access your development server:

   ```
   Available on the internet:

   https://my-device.tailnet-name.ts.net/
   |-- proxy http://127.0.0.1:3000
   ```

   Your development server is now publicly accessible at that URL over HTTPS.

5. Copy the `https://*.ts.net` URL from the `tailscale funnel` output and share it with whoever needs access. They do not need Tailscale installed. The URL is reachable from any browser or HTTP client on the internet.

6. When you no longer want to expose your development server, stop the Funnel configuration:

   ```bash
   tailscale funnel --terminate-on 3000
   ```

   This removes the public proxy and makes the URL unreachable.

   Alternatively, you can stop all Funnel ports at once:

   ```bash
   tailscale funnel reset
   ```

[docs-funnel]: /docs/features/tailscale-funnel

[docs-https]: /docs/how-to/set-up-https-certificates

[docs-magicdns]: /docs/features/magicdns

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel
