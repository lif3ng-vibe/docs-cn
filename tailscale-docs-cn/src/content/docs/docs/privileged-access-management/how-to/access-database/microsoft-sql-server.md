---
title: "Access a Microsoft SQL Server database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to Microsoft SQL Server using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials."
---

Last validated Sep 25, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to Microsoft SQL Server using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials.

You can control who has access to the database, apply fine-grained permissions, and keep an audit trail of database sessions. Users can continue using their preferred database clients or connect directly from their browser.

This guide walks you through creating a SQL Server service, connecting to it, and reviewing the resulting session activity.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed, online, and able to reach the SQL Server instance.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native database client.
* A SQL Server instance.
* The endpoint and port for your SQL Server instance.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

## Choose an authentication method

Tailscale PAM supports two ways to authenticate to the upstream SQL Server database:

* **SQL Server Authentication**: The connector uses a database username and password.
* **Kerberos**: The connector uses Kerberos authentication. For information about using Kerberos with SQL Server, refer to Microsoft's [Register a Service Principal Name for Kerberos connections][xt-microsoft-sql-kerberos] topic.

## Create a SQL Server PAM service

When your SQL Server instance is ready, create a PAM service for it.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Microsoft SQL Server**.

5. Select **Continue**.

6. Enter a name for the service.

   Use a name that users will recognize when browsing available services.

7. (Optional) Provide a display name for the service.

8. (Optional) Provide a description for the service.

9. Choose whether to enable session recording.

10. Select the Tailscale PAM connector that can reach your SQL Server instance.

11. Select **Continue**.

12. For **Upstream hostname or IP**, enter the SQL Server endpoint.

13. For **Port**, enter the default `1433`, or a different value as needed for your environment.

14. For **Authentication type**, select how the PAM connector should connect and authenticate to your SQL Server instance.

15. For **Username**, enter the database username Tailscale PAM should use.

16. For **Password**, enter the password for that database user.

17. (Optional) For **Server CA certificate**, enter the PEM-encoded certificate authority (CA) certificate used to verify the upstream service's TLS certificate, or you can leave this field blank to skip certificate verification. If you skip verification, the connection is still encrypted with TLS, but Tailscale PAM does not verify the identity of the upstream service. This increases the risk of connecting to an impersonated service or a man-in-the-middle attacker.

Your Microsoft SQL PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the SQL Server database

Before users try to connect, make sure a Tailscale PAM [grant gives them access][docs-pam-control-access] to the service. Tailscale PAM uses your tailnet access policy to determine which users, groups, devices, or tags can connect to the service.

For example, the following grant permits any source to connect to PAM database services:

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
            "database": {}
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

> **Danger:**
>
> Query-level access control, as defined in [allowed query types][docs-pam-control-access-database] database permissions in the tailnet policy file, is not currently supported for Microsoft SQL Server. Do not rely on this functionality when configuring access control for Microsoft SQL Server.

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the SQL Server database

The primary way to connect is through the Tailscale client, which can launch your preferred database client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred SQL Server client

Use the Tailscale client to open the database with a compatible database client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your SQL Server service.
4. Choose the database client you want to use.

The Tailscale client scans your device for well-known clients compatible with the database engine and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred database client isn't listed, open it directly and use the name of the Tailscale PAM service as the hostname.

For example, you can connect with the SQL Server command-line client, `sqlcmd`:

```shell
sqlcmd -S <service-name>,<port> -Q "SELECT @@VERSION AS 'SQL_Server_Version';"
```

Replace `<service-name>` with the name of your SQL Server PAM service and `<port>` with the port. If you want to access a specific database, you can pass it in at the command line by using `-d <database-name>`:

```shell
sqlcmd -S <service-name>,<port> -d <database-name> -Q "SELECT @@VERSION AS 'SQL_Server_Version';"
```

Replace `<database-name>` with the name of your database.

Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream authentication on your behalf. You don't need to know or manage the upstream database credentials.

### Connect from the browser

Alternatively, you can connect with the web-based database client. The browser client runs a Tailscale client directly in your browser using WebAssembly (Wasm), so there's nothing else to install.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select the SQL Server service you want to access.
3. Select **Connect** in the upper-right corner, and the Tailscale database browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now run queries against your SQL Server database directly from your browser.

The browser client appears as a Tailscale device in your tailnet. If [device approval][docs-device-approval] is enabled, an admin must approve the browser device before it can connect.

## Secure the upstream credentials

If your database service uses password authentication, the upstream database username and password can be stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, or another supported secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your SQL Server service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your SQL Server service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the SQL queries for the session.

This gives you a direct answer to two useful questions: who accessed the database, and what did they do while they were there?

## Troubleshooting

If you can't connect to your SQL Server service, first confirm that the PAM connector can reach the SQL Server endpoint and database port.

For password authentication, verify that the database username and password in the PAM service configuration are valid.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, database authentication, or the SQL Server instance itself.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access-database]: /docs/privileged-access-management/how-to/control-access#control-database-access

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-microsoft-sql-kerberos]: https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/register-a-service-principal-name-for-kerberos-connections
