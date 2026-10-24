---
title: "Access the Tailscale PAM built-in SSH server"
description: "Every [Tailscale PAM][docs-pam] [connector][docs-pam-connectors] includes a built-in SSH server, making it convenient to SSH directly to the device running the connector using your [Tailscale identity"
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

Every [Tailscale PAM][docs-pam] [connector][docs-pam-connectors] includes a built-in SSH server, making it convenient to SSH directly to the device running the connector using your [Tailscale identity][docs-tailscale-identity].

There's no additional SSH server to install or configure. The built-in SSH server listens only on the connector's Tailscale IP address, so it isn't exposed publicly on port `22` and won't interfere with an SSH server already running on the device.

The built-in SSH server is enabled by default.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native SSH client.
* A Tailscale PAM [grant][docs-grants] that gives you SSH access to the connector's built-in SSH service.

## Enable or disable the built-in SSH server

You don't need to create a separate PAM service for the built-in SSH server. Each connector creates and manages its own SSH service.

To change whether the built-in SSH server is available:

Open the Connectors page of the Tailscale admin console.

1. Open the [Connectors](https://console.tailscale.com/admin/connectors) page of the admin console.
2. Select the connector to configure.
3. Select **Actions**.
4. Select **Edit**.
5. In the **Connector Configuration** page, enable or disable the **Enable Built-in SSH Service** setting, depending on whether you want to use it.
6. Select **Submit**.

When enabled, the connector's built-in SSH server appears in Services. By default, its name is based on the connector name and prefixed with `ssh`, for example `ssh-production-connector`.

Once enabled, the connector is ready to accept SSH connections through Tailscale PAM.

## Grant access to the SSH service

Before users connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the SSH service.

For example, the following grant permits interactive shell sessions, SSH exec requests, and SFTP:

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
            "ssh": {
              "shell": {},
              "exec": {},
              "sftp": {}
            }
          }
        }
      ]
    }
  }
]
```

> **Warning:**
>
> This is a broad grant that's useful for getting started. In a production environment, restrict the `src` and `dst` fields to control who can access specific SSH services.

You can also restrict the SSH usernames users are allowed to request. For example:

```json
"ssh": {
  "shell": {},
  "exec": {},
  "sftp": {},
  "allowed_usernames": [
    "support",
    "ubuntu"
  ]
}
```

SSH grants can also disable individual capabilities, restrict SSH exec requests to specific commands, or allow TCP forwarding to specific destinations. TCP forwarding is disabled by default.

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-edit-policies].

For more SSH grant examples and information about fine-grained access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect with your preferred SSH client

The primary way to connect is through the Tailscale client, which can launch an SSH client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select the connector's built-in SSH service.
4. Choose the SSH client you want to use.

The Tailscale client scans your device for well-known SSH clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred SSH client isn't listed, open it directly and connect using:

* **Hostname:** The name of the built-in SSH service.
* **Port:** `22`.
* **Username:** The system user you want to connect as.

You don't need to distribute an SSH key or static password to the user. Tailscale PAM uses the user's Tailscale identity to authorize the connection.

For example:

```shell
ssh your-username@your-service-name
```

Port `22` is the default, so you don't need to specify it. You can also specify it explicitly:

```shell
ssh -p 22 your-username@your-service-name
```

## Connect from the browser

Alternatively, you can connect entirely from your browser using the Tailscale SSH browser client.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the admin console.
2. Select the connector's built-in SSH service.
3. Select **Connect**, and the Tailscale SSH browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now use an interactive shell on the connector directly from your browser.

The browser client runs a Tailscale client in the browser using WebAssembly (Wasm) and appears as a new [ephemeral][docs-ephemeral-nodes] device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Review SSH sessions

Tailscale PAM gives you visibility into connections to your EC2 SSM service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the recorded SSH session.

This gives you a direct answer to two useful questions: who accessed the EC2 instance, and what did they do while they were connected?

## Troubleshooting

If you can't connect to the built-in SSH server, first confirm that the connector is online and you [enabled the built-in SSH server][ar-enable].

Next, verify that a Tailscale PAM grant gives your identity access to the SSH service and permits the username or SSH capability you're trying to use.

If you're connecting from the browser and your tailnet uses **Device approval**, confirm that the browser device has been approved.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. These can help narrow down whether the connection was blocked by the Tailscale PAM grant, the requested SSH username, or the connector itself.

[ar-enable]: #enable-or-disable-the-built-in-ssh-server

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
