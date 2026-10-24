---
title: "Access an HTTP service using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] gives users identity-based access to internal web applications directly from their browser."
---

Last validated Sep 11, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] gives users identity-based access to internal web applications directly from their browser.

You can make dashboards, admin consoles, internal tools, and other HTTP or HTTPS applications available without requiring users to manage another set of access credentials or giving them broader network access. Users open the web application, sign in with their [Tailscale identity][docs-tailscale-identity], and Tailscale PAM determines whether they are allowed to access it using the PAM grants in your tailnet access policy.

The PAM connector handles the connection to the upstream web application on the user's behalf. The upstream application can remain on your private network as long as the connector can reach it.

In practice, this gives you an identity-aware access layer in front of an internal web application, while letting users keep the familiar experience of just opening it in a browser.

## How HTTP access works

When you create an HTTP PAM service, Tailscale PAM provides users with a browser-accessible endpoint for the service.

When a user opens it:

1. The user authenticates with their Tailscale identity.
2. Tailscale PAM checks whether their tailnet access policy lets them use the HTTP service.
3. If access is allowed, the PAM connector sends the request to the upstream web application.
4. The response is returned to the user's browser.

Only the connector needs network connectivity to the upstream web application. The upstream application itself does not need to be directly reachable by the user, or even be reachable from the internet.

Tailscale PAM proxies handle TLS for the browser-facing service, so users access the application over HTTPS even when the upstream application itself uses HTTP.

## Prerequisites

Before you begin, confirm you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* A connector that can reach the upstream web application.
* The hostname or IP address and port of the upstream application.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

## Create an HTTP PAM service

To create the service:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **HTTP (Web App)**.

5. Select **Continue**.

6. Provide a name for the service.

7. (Optional) Provide a description for the service.

8. Choose whether the **Session Recording** option is enabled or disabled.

9. From **Connect via**, select one or more Tailscale PAM connectors.

10. Select **Continue**.

11. For **Upstream Hostname or IP**, enter the hostname or IP address of the web application.

    For example:

    ```shell
    10.10.10.10
    ```

    You can also use an internal DNS name:

    ```shell
    dashboard.internal.example.com
    ```

12. For **Port**, enter the port where the upstream web application is listening.

    For example:

    * `80` for HTTP.
    * `443` for HTTPS.
    * A custom port such as `8080` or `8443` if your application uses one.

13. For **Scheme**, choose one of the following for how the connector should communicate with the upstream application:

    * HTTP
    * HTTPS

    This setting describes the connection between the PAM connector and the upstream application.

14. (Optional) For **Host header**, enter the HTTP `Host` header that the connector should send to the upstream application.

    Leave this blank when the application expects the same hostname you entered for **Upstream hostname or IP**.

    Set a different value when the upstream server uses name-based virtual hosting or otherwise expects a particular host name.

    For example, the connector might connect to:

    ```shell
    10.10.10.10
    ```

    while sending:

    ```shell
    internal-dashboard.example.com
    ```

    as the HTTP `Host` header.

15. (Optional) In the **Request headers**, you can add HTTP headers that the connector sends with each request to the upstream application.

    For each header that you want to add, select **Add header** and provide values for the header name and value.

    This can be useful when an internal application expects an additional header on incoming requests.
    These are additional headers you configure yourself. Tailscale PAM can also automatically pass information about the authenticated user to the upstream application, as described in [Pass Tailscale identity to your web application][ar-pass-tailscale-identity].

16. Select **Save**.

Your HTTP PAM service is ready to use. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the web application

Before users can open the application, create a Tailscale PAM [grant][docs-grants] that gives them access to the HTTP service.

For example, the following broad grant permits HTTP access:

```json
{
  "grants": [
    {
      "src": ["*"],
      "dst": ["*"],
      "ip": ["*"],
      "app": {
        "tailscale.com/cap/pam": [
          {
            "version": "v1",
            "permissions": {
              "http": {}
            }
          }
        ]
      }
    }
  ]
}
```

The `http` permission permits the source covered by the grant to access HTTP PAM services. PAM grants use the same Tailscale access policy model as other Tailscale service types.

> **Warning:**
>
> This broad example is useful for getting started. In production, restrict `src` and `dst` so only the appropriate users, groups, devices, or tags can access the specific web applications they need.
>
> For example, you might allow an engineering group to access an internal deployment dashboard without giving that group access to other PAM services.

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

For more information about PAM grants, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Open the web application

Once you've configured the service and granted access, users can open the HTTP service directly from their browser.

Users don't need direct network connectivity to the upstream web application. They can open the PAM service in their browser and authenticate with their Tailscale identity.

If the user isn't already authenticated, Tailscale PAM prompts them to sign in.

After authentication, the Tailscale PAM proxy checks the user's access against the tailnet policy. If a matching PAM grant permits HTTP access to the service, the request is forwarded to the connector which proxies the web application to the user's browser.

From the user's perspective, they just open the web application in their browser. They don't need to know its private IP address or have direct access to the network where it runs.

## Review HTTP sessions

Tailscale PAM gives you a central place to review who accessed your internal web applications and when they accessed them.

To review an HTTP session, open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console and select the session you want to inspect. From there, you can review information about the user, the service they accessed, and the session.

When **Session recording** is enabled, Tailscale PAM also records the user's interaction with the web application.

You can replay the recorded browser session from the PAM session log to review what happened while the user was using the application.

This gives you both sides of the access workflow: identity-based control over *who can open the application*, and a record of *what happened after they connected*.

## Pass Tailscale identity to your web application

In addition to any request headers you configure yourself, Tailscale PAM automatically passes information about the authenticated user with each upstream request.

Your application can use this information to identify the user making the request and, if you choose, make its own authentication or authorization decisions based on that identity.

Tailscale PAM adds identity headers such as:

| HTTP header          | Example value                            |
| -------------------- | ---------------------------------------- |
| `"X-Auth-Email"`     | `"ameliepangolin@gmail.com"`             |
| `"X-Auth-Expiresin"` | `"1234567890"`                           |
| `"X-Auth-Name"`      | `"Amelie Pangolin"`                      |
| `"X-Auth-Subject"`   | `"1234abcd-56ef-78ab-1111-abcd1234efab"` |
| `"X-Auth-Userid"`    | `"ameliepangolin@gmail.com"`             |
| `"X-Auth-Username"`  | `"ameliepangolin@gmail.com"`             |

This is useful for applications that support authentication through a trusted reverse proxy. Instead of asking the user to sign in again, the application can use the identity that Tailscale PAM has already authenticated.

For an example that uses these headers, refer to [Use Tailscale identity with Grafana][docs-pam-grafana].

### Verify identity headers

If your application relies on the `X-Auth-*` headers for authentication or authorization, you can cryptographically verify that the identity information came from Tailscale PAM.

Requests include signature metadata such as:

* `X-Auth-Sig`
* `X-Auth-Kid`
* `X-Auth-Timestamp`
* `X-Auth-Request-Id`

The authenticated identity headers, including headers such as `X-Auth-Email`, are covered by the signature.

Tailscale PAM uses an Ed25519 signature over a canonical representation of the request that includes the HTTP method, path, query, and signed headers. Your application can use `X-Auth-Kid` to find the corresponding public key and verify the signature before trusting the identity information.

Public signing keys are available from:

```shell
https://signing.border0.io/keys
```

Example implementations for verifying these signatures in Go and PHP are available in the [HTTP signature verification examples][xt-github-border0-httpsig].

Signature verification is optional, but is recommended when your application uses the forwarded identity headers to make security-sensitive authentication or authorization decisions.

## Access the HTTP service programmatically

You can access an HTTP PAM service from a script, command-line client such as `curl`, or another workload that can't complete the browser-based login flow. To do so, authenticate using a token for a client [service account][docs-pam-service-accounts]. A client service account represents a Tailscale [tag][docs-tags] in PAM. Tailscale PAM automatically creates a client service account for each tag in your tailnet, so you don't need to create the service account separately.

If you want to use a new identity for the workload, first [create a new tag][docs-tags-define] in your tailnet policy. Then create a token for the corresponding client service account:

1. Open the  [PAM](https://console.tailscale.com/admin/settings/pam) page of the Tailscale admin console.
2. In the **Service accounts** section, find the client service account corresponding to the Tailscale tag you want the workload to use. Client service accounts have the `client` role.
3. Select the  menu, then select **Edit**.
4. Select **Create token**.
5. Enter a name for the token.
6. Select the token lifetime.
7. Select **Save**.
8. Copy the token and store it securely.

Treat service account tokens as secrets. Each token inherits the permissions of its service account.

When possible, use an expiring token and choose the shortest lifetime that is suitable for your automation.

> **Note:**
>
> The token identifies requests as having the corresponding tagged client identity. Creating a token does not grant the identity access to any HTTP services. Your [tailnet policy file][docs-tailnet-policy-file] must [include a PAM grant][docs-pam-control-access] that lets the tag access the HTTP service.

For more information about client service accounts and protecting their tokens, refer to Tailscale PAM [service accounts][docs-pam-service-accounts].

You can now pass the token to the HTTP service using the `Border0-Token` request header:

```shell
export BORDER0_TOKEN=<your-token>

curl https://<your-service> \
  -H "Border0-Token: $BORDER0_TOKEN"
```

Replace `<your-token>` with your token and `https://<your-service>` with the URL of your HTTP PAM service.

Tailscale PAM uses the `Border0-Token` header instead of the standard `Authorization` header so that PAM authentication doesn't conflict with authentication headers required by the upstream HTTP application.

## Troubleshooting

If you can't open an HTTP PAM service, first confirm that the PAM connector is online.

Then verify that:

* The connector can reach the configured upstream hostname or IP address.
* The configured port is correct.
* The selected **Scheme** matches the protocol used by the upstream application.
* The PAM grant gives your Tailscale identity HTTP access to the service.

If the upstream application returns an unexpected page or error, check the **Host header**. Applications that use name-based virtual hosting might require a specific host name even when the connector reaches the application using an IP address or different DNS name.

If you've configured additional request headers, verify that the header names and values are correct.

The HTTP service's public hostname may be different from the hostname you use to access the application directly. This could cause single sign-on (SSO) login to fail. For more information, including how to resolve this, refer to [Troubleshoot SSO login failure for an HTTP service][docs-pam-http-service-troubleshoot-sso-failure].

[ar-pass-tailscale-identity]: #pass-tailscale-identity-to-your-web-application

[docs-grants]: /docs/features/access-control/grants

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-grafana]: /docs/privileged-access-management/how-to/access-http-service/grafana

[docs-pam-http-service-troubleshoot-sso-failure]: /docs/privileged-access-management/how-to/access-http-service/troubleshoot-sso-failure

[docs-pam-service-accounts]: /docs/privileged-access-management/service-accounts

[docs-pam]: /docs/privileged-access-management

[docs-tags-define]: /docs/features/tags#define-a-tag

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-github-border0-httpsig]: https://github.com/borderzero/examples/tree/main/httpsig
