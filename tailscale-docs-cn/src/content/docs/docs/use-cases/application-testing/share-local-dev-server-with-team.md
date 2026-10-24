---
title: "Share a local development server with your team"
description: "When building a feature or fixing a bug, you often want a teammate to preview your work before it's deployed, without pushing to a staging environment. Tailscale [Serve][docs-serve] lets you expose a "
---

Last validated May 18, 2026

When building a feature or fixing a bug, you often want a teammate to preview your work before it's deployed, without pushing to a staging environment. Tailscale [Serve][docs-serve] lets you expose a local development server to other members of your Tailscale network (known as a tailnet) over a secure HTTPS URL. No port forwarding, no tunneling service, and no public internet access required.

> **Note:**
>
> Tailscale Serve is only accessible to members of your tailnet. It does not expose your development server to the public internet. To share with someone outside your tailnet, refer to [Tailscale Funnel][docs-funnel].

1. Ensure you have [MagicDNS][docs-magicdns] and [HTTPS certificates][docs-certs] enabled for your tailnet. Both are required for Serve and are enabled by default for new tailnets.

2. Ensure your local development server is running and listening for requests.

3. Run the [`tailscale serve`][docs-tailscale-serve] command, replacing `3000` with the port your development server is listening on:

   ```bash
   tailscale serve 3000
   ```

   Tailscale Serve proxies requests from your `*.ts.net` hostname to your local port and automatically provisions a TLS certificate. The output shows the URL your teammates can use to access your development server:

   ```
   Available within your tailnet:

   https://my-device.tailnet-name.ts.net/
   |-- proxy http://127.0.0.1:3000
   ```

   Your development server is now accessible to other tailnet members at that URL over HTTPS.

4. Copy the `https://*.ts.net` URL from the `tailscale serve` output and share it with your teammate. As long as they are connected to your tailnet, they can open the URL in their browser and access your local development server.

> **Tip:**
>
> Your teammate's Tailscale client must be running and connected for them to reach your `*.ts.net` hostname.

1. When you no longer want to share your development server, stop the Serve configuration:

   ```bash
   tailscale serve --terminate-on 3000
   ```

   This removes the proxy and stops advertising your development server on the `*.ts.net` hostname.

   Alternatively, you can stop serving all ports at once:

   ```bash
   tailscale serve reset
   ```

[docs-certs]: /docs/how-to/set-up-https-certificates

[docs-funnel]: /docs/features/tailscale-funnel

[docs-magicdns]: /docs/features/magicdns

[docs-serve]: /docs/features/tailscale-serve

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve
