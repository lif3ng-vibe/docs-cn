---
title: "Access a TCP service using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] gives users identity-based access to internal TCP services without requiring direct network access to those services."
---

Last validated Sep 3, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] gives users identity-based access to internal TCP services without requiring direct network access to those services.

You can make internal applications and services that communicate over TCP available without exposing them directly to the internet or giving users broader network access. Tailscale PAM determines whether users are allowed to access the service using the PAM grants in your tailnet access policy.

The PAM connector handles the connection to the upstream TCP service on the user's behalf. The upstream service can remain on your private network as long as the connector can reach it.

## How TCP access works

When you create a TCP PAM service, Tailscale PAM provides an endpoint that users can connect to with a TCP client.

When a user connects:

1. Tailscale PAM authenticates the user with their [Tailscale identity][docs-tailscale-identity].
2. Tailscale PAM checks whether their tailnet access policy lets them use the TCP service.
3. If access is allowed, the PAM connector establishes a connection to the upstream TCP service.
4. Tailscale PAM proxies traffic between the user and the upstream service.

Only the connector needs network connectivity to the upstream TCP service. The upstream service itself does not need to be directly reachable by the user or from the internet.

## Prerequisites

Before you begin, confirm you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* A connector that can reach the upstream TCP service.
* The hostname or IP address and port of the upstream service.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native TCP client.

## Create a TCP PAM service

To create the service:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **TCP**.

5. Select **Continue**.

6. Enter a name for the service.

   Use a name that makes the TCP service suitable for users to recognize when they browse the services they can access.

7. (Optional) Enter a display name for the service.

8. (Optional) Enter a description for the service.

9. Select one or more Tailscale PAM connectors that can reach the TCP service.

10. Select **Continue**.

11. For **Upstream Hostname or IP**, enter the hostname or IP address of the TCP service.

    For example:

    ```text
    10.10.10.10
    ```

    You can also use an internal DNS name:

    ```text
    service.internal.example.com
    ```

12. For **Port**, enter the port on which the upstream TCP service is listening.

    For example:

    ```text
    9000
    ```

13. Select **Save**.

Your TCP PAM service is ready to use. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the TCP service

Before users try to connect, make sure a Tailscale PAM [grant gives them access][docs-pam-control-access] to the TCP service. Tailscale PAM uses your tailnet access policy to determine which users, groups, devices, or tags can connect to the service.

For example, the following grant permits any source to connect to PAM TCP services:

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
              "tcp": {}
            }
          }
        ]
      }
    }
  ]
}
```

> **Warning:**
>
> This is a broad grant that's useful for getting started. In a production environment, you can restrict the `src` and `dst` fields to control which users, groups, devices, or tags can access specific services.

For more information about controlling access to PAM services, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the TCP service

After you've configured the service and granted access, users can connect to the TCP service using a compatible client.

Use the hostname and port for the Tailscale PAM service instead of the private hostname or IP address of the upstream service.

For example, you can test a TCP connection using `nc`:

```shell
nc -v <service-hostname> <port>
```

Users don't need direct network connectivity to the upstream TCP service. Tailscale PAM authenticates the user and checks their access against the tailnet policy. If a matching PAM grant permits TCP access to the service, Tailscale PAM proxies the connection through the connector to the upstream service.

Users can also connect to the TCP service by opening the Tailscale PAM [Border0 web client](https://my.tailscale.com) and selecting the service.

## Review TCP sessions

Tailscale PAM gives you a central place to review who accessed your internal TCP services and when they accessed them.

To review a TCP session, open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console and select the session you want to inspect. From there, you can review information about the user, the service they accessed, and the session.

## Troubleshooting

If you can't connect to a TCP PAM service, first confirm that the PAM connector is online.

Then verify that:

* The connector can reach the configured upstream hostname or IP address.
* The configured port is correct.
* The upstream service is listening on the configured port.
* The PAM grant gives your Tailscale identity TCP access to the service.
* The connector can resolve the hostname if you configured the upstream service using a DNS name.
* Firewalls between the connector and upstream service permit the TCP connection.
* If you're connecting from the browser client and your tailnet uses [device approval][docs-device-approval], the browser device has been [approved][docs-device-approval-approve].

You can also test connectivity to the upstream service from the connector's network. For example, depending on your connector's environment, use commands like:

* `nc -zv <upstream-hostname> <port>`
* `telnet  <upstream-hostname> <port>`

If the connection fails, resolve connectivity between the connector and upstream service before troubleshooting the user's Tailscale PAM connection.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-session-logs]. The session details can help determine whether the connection was blocked by access controls, network connectivity, or authentication to the upstream Windows server.

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam]: /docs/privileged-access-management

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
