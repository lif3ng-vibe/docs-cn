---
title: "Access a remote SSH server using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you provide secure access to remote SSH servers using Tailscale identity instead of distributing SSH keys or sharing static passwords."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you provide secure access to remote SSH servers using Tailscale identity instead of distributing SSH keys or sharing static passwords.

The Tailscale PAM [connector][docs-pam-connectors] acts as an SSH proxy. When a user starts an SSH session, the connector handles the incoming connection, applies the appropriate access controls, and, when allowed, connects to the upstream SSH server on the user's behalf.

Users authenticate with their [Tailscale identity][docs-tailscale-identity]. The connector handles authentication to the upstream SSH server, so users don't need access to its password, private key, or other credentials.

Tailscale PAM supports the following authentication methods for connecting from the connector to the upstream SSH server:

* Username and password.
* SSH private key.
* Certificate-based authentication.

This guide walks you through creating a remote SSH PAM service, configuring each authentication method, connecting to the service, and reviewing the resulting SSH sessions.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed and online.
* An SSH server that the connector can reach.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native SSH client.

If you're using your own SSH server, you'll need its hostname or IP address, port, and the upstream authentication information required by the authentication method you choose.

If you just want to try Tailscale PAM, use the public SSH sandbox. Its settings are in the following table.

| Setting  | Value                       |
| -------- | --------------------------- |
| Hostname | `ssh.playground.border0.io` |
| Port     | `22`                        |
| Username | `border0`                   |
| Password | `Border0<3Ssh`              |

The sandbox is intended for testing only and is periodically reset. For information about other sandbox services available for testing, refer to [Tailscale PAM FAQ][docs-pam-faq-sandbox].

## Create an SSH PAM service

To create a PAM service for the remote SSH server:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Secure Shell - Standard SSH**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Enter a description.

8. Choose whether to enable session recording.

9. From **Connect via**, select one or more Tailscale PAM connectors.

   Every connector you select must have network connectivity to the upstream SSH server.

   A service can use multiple connectors. This can improve availability when you have connectors in multiple locations that can independently reach the same SSH server.

10. Select **Continue**.

11. For **Upstream hostname or IP**, provide the hostname or IP address of the upstream SSH server.

12. For **Port**, enter the SSH port. The default is `22`.

13. For **Authentication type**, select the method the connector should use to authenticate to the upstream server.

    The authentication type controls how the Tailscale PAM connector authenticates to the remote SSH server. It does not change how users authenticate to Tailscale PAM. Users always connect using their Tailscale identity.

    #### Username and password

    Select **Username and Password** when the upstream SSH server accepts password authentication. Enter values for the following:

    * **Username:** The username the connector should use on the upstream SSH server.
    * **Password:** The password for that user.

    The connector uses these credentials when establishing the upstream SSH connection. Users connecting to the PAM service don't need to know the username or password.

    #### SSH private key

    Select **SSH Private Key** when the upstream SSH server uses key-based authentication. Enter values for the following:

    * **Username:** The username the connector should use on the upstream SSH server.
    * **SSH private key:** The private key corresponding to a public key authorized for that user.

    The connector uses the private key to authenticate to the upstream server. You don't need to distribute the key to users connecting through Tailscale PAM.

    Private keys are sensitive credentials.

    > **Warning:**
    >
    > For production environments, use a supported secret source instead of storing long-lived credentials directly in the service configuration whenever possible. For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

    #### Tailscale PAM certificate

    Select **Border0 Certificate** to use the Tailscale PAM built-in SSH certificate authentication.

    With certificate-based authentication, you don't need to store an upstream SSH password or private key. Tailscale PAM issues an SSH certificate to the connector, and the upstream SSH server trusts certificates signed by the Tailscale PAM SSH certificate authority (CA).

    Choose how the upstream username is determined:

    * **Manual username**: Enter a username that the connector should always use when connecting to the upstream SSH server.
    * **Prompt Client for Username**: Let the user specify the upstream username when starting the SSH connection.

    Before you can use certificate-based authentication, you must configure the upstream SSH server to trust the Tailscale PAM SSH CA. Refer to the next section.

14. Select **Save**.

Your remote SSH service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## (Optional) Configure the server for certificate-based authentication

Skip this step if you're using username and password or SSH private key authentication.

For certificate-based authentication, the upstream OpenSSH server must trust the Tailscale PAM SSH CA.

### Copy the SSH CA certificate

1. Open the [PAM](https://console.tailscale.com/admin/settings/pam) page of the Tailscale admin console.
2. Find the **SSH certificate authority**.
3. Copy the public CA key.

You'll install this public key on each upstream SSH server that should accept Tailscale PAM certificates.

### Configure OpenSSH to trust the CA certificate

1. On the upstream SSH server, create a file for the CA public key:

   ```shell
   sudo tee /etc/ssh-ca.pub >/dev/null
   ```

2. Paste the Tailscale PAM SSH CA public key into the file, then save it.

3. To configure OpenSSH to trust certificates signed by that CA, add the following lines to `/etc/ssh/sshd_config`.

   ```shell
   TrustedUserCAKeys /etc/ssh-ca.pub
   AuthorizedPrincipalsFile /etc/ssh/authorized_principals
   ```

4. Create the principals file expected by Tailscale PAM:

   ```shell
   echo "border0_ssh_signed" | sudo tee /etc/ssh/authorized_principals
   ```

5. Reload the SSH server:

   ```shell
   sudo service ssh reload
   ```

The upstream server can now accept SSH certificates issued by the Tailscale PAM SSH CA. The current PAM certificate flow uses the `border0_ssh_signed` certificate principal.

If you want certificate authentication to be available only for specific system users, use a per-user `AuthorizedPrincipalsFile` instead. For example:

```shell
AuthorizedPrincipalsFile %h/.ssh/authorized_principals
```

Then add the PAM certificate principal only for the users who should be allowed to authenticate using PAM certificates.

## Grant access to the SSH service

Before users connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the SSH service.

For example, the following broad grant permits interactive shell sessions, SSH exec requests, and SFTP:

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

You can also restrict which upstream usernames users are allowed to request. Note that controlling usernames only works when using the built-in SSH server or certificate-based authentication, because with the password or SSH key option you always statically define a username:

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

SSH permissions can separately control interactive shell access, exec requests, SFTP, requested usernames, and TCP forwarding. You can also restrict exec requests to specific commands using regular expressions. TCP forwarding is disabled by default.

For more SSH grant examples and information about fine-grained SSH access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the SSH server

The primary way to connect is through the Tailscale client, which can launch your preferred SSH client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred SSH client

Use the Tailscale client to quickly open the SSH service with a compatible SSH client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your SSH service.
4. Choose the SSH client you want to use.

The Tailscale client scans your device for well-known SSH clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the SSH clients shown in the Tailscale client. If your preferred client isn't listed, open it directly and use the PAM service name as the hostname.

For example:

```shell
ssh your-service-name
```

If the service uses **Prompt Client for Username**, specify the upstream username you want to use:

```shell
ssh your-username@your-service-name
```

Port `22` is the default, so you don't need to specify it unless your PAM service uses a different port.

If you selected **Username and Password** or **SSH Private Key** authentication, any username supplied by the SSH client is ignored. Tailscale PAM uses the username configured for the service. A client supplied username is only used with certificate-based authentication when **Prompt Client for Username** is selected.

Tailscale PAM uses your Tailscale identity to authorize the connection. The connector then authenticates to the upstream SSH server using the username and password, private key, or PAM certificate configured for the service.

Users don't need access to the upstream authentication credentials.

### Connect from the browser

Alternatively, you can connect entirely from your browser using the Tailscale SSH browser client.

1. Open [Services](https://console.tailscale.com/admin/services) of the Tailscale admin console.
2. Select the SSH service you want to access.
3. Select **Connect**, and the Tailscale SSH browser client opens.
4. If prompted, authenticate with your Tailscale identity.

If the service is configured to prompt for an upstream username, enter the username you want to use.

You can now use an interactive SSH session directly from your browser.

The browser client runs a Tailscale client in the browser using WebAssembly (Wasm) and appears as a new [ephemeral][docs-ephemeral-nodes] device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Secure upstream credentials

For username and password or private key authentication, the connector needs access to credentials for the upstream SSH server.

> **Warning:**
>
> For production environments, we recommend keeping upstream credentials local to the connector using a supported secret source instead of storing them directly in the PAM service configuration.

Tailscale PAM supports secret references that the connector resolves locally. For example, an SSH username can come from a local file and a password can come from AWS Secrets Manager:

```shell
Username:
from:file:/etc/ssh_username

Password:
from:aws:secretsmanager:/staging/sshpassword
```

Supported secret sources include environment variables, local files, AWS Systems Manager Parameter Store, AWS Secrets Manager, and Keeper Secrets Manager.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

Certificate-based authentication avoids storing a static upstream SSH password or private key. Instead, the upstream server trusts the Tailscale PAM SSH CA.

## Review SSH sessions

Tailscale PAM gives you visibility into connections to your remote SSH service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your SSH service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The SSH service that was accessed.
* The requested SSH username.

When session recording is enabled, you can also review the recorded SSH session.

This gives you a direct answer to two useful questions: who accessed the server, and what did they do while they were connected?

## Troubleshooting

If you can't connect to your SSH service, start by confirming that the connector is online and can reach the upstream SSH hostname and port.

Because the connector establishes the upstream SSH connection, test connectivity from the device running the connector whenever possible.

### Username and password authentication

Verify that the username and password are valid and that password authentication is enabled on the upstream SSH server.

You can test the credentials directly from the connector:

```shell
ssh -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no \
  your-username@your-upstream-host
```

If password authentication is disabled, check the upstream server's `sshd_config` for:

```
PasswordAuthentication yes
```

Reload the SSH service after changing its configuration.

### SSH private key authentication

Verify that the username and private key configured for the PAM service match a public key authorized by the upstream SSH server.

You can test the key directly from the connector:

```shell
ssh -i ~/.ssh/id_rsa \
  -o PreferredAuthentications=publickey \
  -o IdentitiesOnly=yes \
  your-username@your-upstream-host
```

### Certificate-based authentication

If certificate authentication fails, verify that:

* The upstream server has the correct Tailscale PAM SSH CA in `/etc/ssh-ca.pub`.
* `TrustedUserCAKeys` points to the correct CA file.
* `AuthorizedPrincipalsFile` is configured correctly.
* The expected certificate principal is present in the principals file.
* The username requested by the client exists on the upstream system.
* The SSH daemon was reloaded after the configuration changed.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the Tailscale PAM [session logs][docs-pam-session-logs]. Failed sessions can help narrow down whether the problem is connector reachability, upstream authentication, Tailscale PAM access controls, or the SSH server configuration.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
