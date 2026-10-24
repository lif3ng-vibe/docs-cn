---
title: "Using Tailscale with captive portals"
description: "Understand how Tailscale handles captive portals when you connect to a public network."
---

Last validated Dec 10, 2025

When you connect to a public network, you might be redirected to a [captive portal][xt-wikipedia-captive-portal] requiring you to authenticate or accept terms before accessing the internet.

A captive portal typically appears before the user can access any other web pages, and often includes login forms, payment options, or advertisements. Captive portals are commonly used in public Wi-Fi hotspots such as those found in airports, hotels, coffee shops, libraries, and other public venues. They are also frequently implemented in corporate environments and educational institutions to ensure only users with credentials can connect to the network.

If you connect your device to a captive portal and do not complete the authentication steps, Tailscale cannot establish a connection to the coordination server, and connectivity with other devices in your tailnet is not possible.

## Captive portal notifications

> **Note:**
>
> Captive portal notifications are currently only supported on macOS and iOS. Notification permissions must be granted for the Tailscale client in order for notifications to appear.

In Tailscale v1.72 or later, a notification will appear on your device when a captive portal is detected:

*（图：Notification informing the user about the presence of a captive portal on macOS）*

On platforms where the [Tailscale CLI][docs-cli] is available, the `tailscale status` command will also include a health warning:

```shell
tailscale status
```

This command should output the following:

```shell
# Health check:
#     - This network requires you to log in using your web browser.
```

To resolve the issue, complete the necessary authentication steps in your web browser by attempting to access a website such as [`example.com`][xt-example-com].&#x20;

## How Tailscale detects captive portals

> **Note:**
>
> Captive portal detection requires Tailscale v1.72 or later.

Although a number of [standards][xt-rfc-8952-captive] have been proposed over the years, captive portals are implemented differently by each networking equipment manufacturer or ISP. Due to the lack of a uniform standard, there is no widely used protocol to reliably detect a captive portal. The Tailscale client detects captive portals continuously in the background, on a best-effort basis, by performing these steps:

1. The client continuously observes the state of network interfaces and connections to the Tailscale [coordination server][docs-coordination-server] and [relay servers][docs-derp]. If a connectivity issue is observed, the captive portal detection process starts. Captive portal detection does not run unless a connectivity issue is observed.
2. Tailscale attempts to contact a set of relay servers that are known to accept incoming connections on TCP port `80`. The client executes an unencrypted HTTP request reaching out to a `/generate_204` endpoint on the relay server. This endpoint is expected to return an HTTP response with a 204 status code.
3. Because [DNS resolution][docs-dns] is unreliable behind some captive portals, Tailscale reaches out to the relay server by directly using its IPv4 address. For instance, the outgoing HTTP request may target a relay server at `http://123.12.12.123/generate_204`.
4. As part of the HTTP request above, Tailscale may also send a challenge in the HTTP headers of the request (`X-Tailscale-Challenge`), if the relay server supports the challenge protocol. This challenge header value is `ts_<hostname>`, where `<hostname>` is the hostname of the relay server being used.
5. The HTTP request is sent, and the status code and headers of the HTTP response are evaluated.

* If the status code is `204` and the `X-Tailscale-Response` is `response ts_<hostname>`, Tailscale assumes that no captive portal has been detected.
* If `X-Tailscale-Response` is missing from the response, or has an unexpected value, or the return status code is not `204`, Tailscale infers that something is tampering with the HTTP connection, and therefore a captive portal is likely present.

## Disable captive portal detection

You can turn off captive portal detection if you always use your computer in the same location or want to avoid detection-related traffic to our servers by configuring the `disable-captive-portal-detection` [node attribute][docs-policy-syntax-node-attributes] in your tailnet [access control policies][docs-access-control]:

```json
{
  "nodeAttrs": [
    {
      "target": [
        "autogroup:member"
      ],
      "attr": [
        "disable-captive-portal-detection"
      ]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-cli]: /docs/reference/tailscale-cli

[docs-coordination-server]: /docs/reference/glossary#coordination-server

[docs-derp]: /docs/reference/derp-servers

[docs-dns]: /docs/reference/dns-in-tailscale

[xt-rfc-8952-captive]: https://www.rfc-editor.org/rfc/rfc8952.html

[xt-example-com]: http://www.example.com

[xt-wikipedia-captive-portal]: https://en.wikipedia.org/wiki/Captive_portal
