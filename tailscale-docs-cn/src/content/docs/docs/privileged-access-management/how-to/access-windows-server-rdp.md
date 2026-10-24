---
title: "Access a Windows server using RDP with Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to Windows servers over Remote Desktop Protocol (RDP) using their [Tailscale identity][docs-tailscale-identity] instead of sharing Windows usernames and pa"
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to Windows servers over Remote Desktop Protocol (RDP) using their [Tailscale identity][docs-tailscale-identity] instead of sharing Windows usernames and passwords.

The Tailscale PAM connector handles authentication to the upstream Windows server on the user's behalf. Users don't need to know or manage the credentials for the Windows server.

You can use Tailscale [grants][docs-grants] to control who can access each RDP service. Tailscale PAM keeps a record of RDP connections so you can review who connected, from which device, and when.

Users can connect using an RDP client on their device or directly from their browser.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* A connector with network connectivity to the Windows server.
* A Windows server with RDP enabled that the connector can reach.
* The tailnet hostname or IP address of the Windows server.
* The credentials Tailscale PAM should use to connect to the Windows server.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native RDP client.

## Create an RDP PAM service

To create a PAM service for your Windows server:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **RDP**.

5. Select **Continue**.

6. Enter a name for the service.

   Use a name that makes the Windows server suitable for users to recognize when they browse the services they can access.

7. (Optional) Enter a display name for the service.

8. (Optional) Enter a description for the service.

9. Select one or more Tailscale PAM connectors that can reach the Windows server.

   Each connector you select must have network connectivity to the upstream Windows server.

10. Select **Continue**.

11. For **Upstream hostname or IP**, enter the hostname or IP address of the Windows server.

12. For **Port**, enter the RDP port. The default is `3389`.

13. For **Username**, enter the Windows username Tailscale PAM should use when connecting to the server.

14. For **Password**, enter the password for the Windows user.

15. (Optional) For **Domain**, enter the Windows domain, if required by the server.

    The username, password, and domain are used by the Tailscale PAM connector to authenticate to the upstream Windows server. Users connecting to the PAM service don't need access to these credentials.

16. Select **Save**.

Your RDP PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page of the admin console.

## Grant access to the RDP service

Before users try to connect, make sure a Tailscale PAM [grant gives them access][docs-pam-control-access] to the RDP service. Tailscale PAM uses your tailnet access policy to determine which users, groups, devices, or tags can connect to the service.

For example, the following grant permits any source to connect to PAM RDP services:

```json
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
            "rdp": {}
          }
        }
      ]
    }
  }
]
```

> **Warning:**
>
> This is a broad grant that's useful for getting started. In a production environment, you can restrict the `src` and `dst` fields to control which users, groups, devices, or tags can access specific services.

For more information about controlling access to PAM services, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the Windows server

Users can connect using an RDP client on their device or directly from their browser.

### Connect with an RDP client

The primary way to connect from your desktop is through the Tailscale client.

1. Open the Tailscale client.
2. Open **Services**.
3. Select the RDP service.
4. Choose an available RDP client.
5. When connecting, use an empty password. That is, don't provide a password.

Tailscale PAM uses your Tailscale identity to authorize the connection and handles the credentials required to connect to the upstream Windows server. This means users can access the Windows server without needing to know or manage its shared username and password.

### Connect from the browser

You can also connect to the Windows desktop directly from the browser:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select the RDP service you want to access.
3. Select **Connect** in the upper-right corner, and the web-based RDP client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now use the Windows desktop directly from your browser.

The browser client appears as a Tailscale device in your tailnet. If [device approval][docs-device-approval] is enabled, an admin must [approve][docs-device-approval-approve] the browser device before it can connect.

## Secure the upstream credentials

In the example above, the Windows username and password are configured as part of the PAM service.

For production environments, you can instead configure Tailscale PAM to load credentials from a supported secret source. This lets you keep credentials in your existing secrets management system rather than storing them directly in the PAM service configuration.

The connector retrieves the credentials when they're needed and uses them to authenticate to the Windows server. Users connecting to the RDP service never need access to those credentials.

For more information, refer to [Manage credentials and secrets][docs-pam-manage-secrets].

## Review RDP sessions

Tailscale PAM gives you centralized visibility into connections to your RDP services.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the Tailscale admin console, then select a session for your RDP service.

You can review information such as:

* The Tailscale identity that connected.
* The originating device and source IP.
* The connection time.
* The RDP service that was accessed.
* The duration of the session.
* Whether the connection succeeded or was denied.

For more information, refer to Tailscale PAM [session logs][docs-session-logs].

## Troubleshooting

If you can't connect to your RDP service, first confirm that the PAM connector is online and can reach the Windows server on the configured RDP port.

Next, verify:

* RDP is enabled on the Windows server.
* The hostname or IP address and port are correct.
* The configured Windows credentials are valid.
* A Tailscale PAM grant gives your identity access to the RDP service.

If you're using a Windows domain account, also verify that the configured domain is correct.

If you're connecting from the browser and your tailnet uses [device approval][docs-device-approval], confirm that the browser device has been [approved][docs-device-approval-approve].

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-session-logs]. The session details can help determine whether the connection was blocked by access controls, network connectivity, or authentication to the upstream Windows server.

[docs-device-approval-approve]: /docs/features/access-control/device-management/device-approval#approve-devices-from-the-admin-console

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam]: /docs/privileged-access-management

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
