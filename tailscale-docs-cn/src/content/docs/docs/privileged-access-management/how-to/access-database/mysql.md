---
title: "Access a MySQL database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to MySQL using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials."
---

Last validated Aug 19, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to MySQL using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials.

You can control who has access to the database, apply fine-grained permissions, and keep an audit trail of database sessions. Users can connect from the browser or continue using their preferred MySQL client.

This guide walks you through creating a MySQL PAM service, connecting to it, and reviewing the resulting session activity.

## Prerequisites

Before you begin, make sure you have the following:

* A [connector][docs-pam-connectors] that is installed, online, and able to reach the MySQL server.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native database client.
* A MySQL server that the connector can reach.

You can use your own MySQL server, the Tailscale PAM sandbox server, or a local Docker container.

If you're using your own MySQL server, you'll need its hostname or IP address, port, username, and password.

If you just want to try Tailscale PAM, you can use the public MySQL sandbox:

| Setting  | Value                         |
| -------- | ----------------------------- |
| Hostname | `mysql.playground.border0.io` |
| Port     | `3306`                        |
| Username | `border0`                     |
| Password | `Border0<3MySql`              |

For information about the other sandbox servers available for testing, refer to [Tailscale PAM sandbox servers][docs-pam-faq-sandbox].

## Run a local MySQL server with Docker

If you're using your own MySQL server or the Tailscale PAM sandbox, skip to the next step.

For a quick local test, start a MySQL server with Docker:

At a command line on a device in your tailnet that will host the database, run:

```shell
docker run --name tailscale-pam-mysql --rm \
 -e MYSQL_ROOT_PASSWORD=<your-database-password> \
 -d -p 3306:3306 mysql
```

Replace `<your-database-password>` with a password of your choice. This starts a MySQL server on port `3306` with the `root` user and the password that you specified.

Before continuing, verify that you can connect to it:

```shell
mysql -u root -p -h 127.0.0.1 --protocol TCP
```

When prompted, enter your password.

After you connect, run a basic query:

```sql
SELECT VERSION();
```

If the query succeeds, your MySQL server is ready.

If the Tailscale PAM connector runs on the same device as Docker, you can use `localhost` and port `3306` when you configure the PAM service. If the connector runs somewhere else, use an IP address or hostname that the connector can reach.

## Create a database service

Now that you have a MySQL server, create a PAM service for it.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **MySQL**.

5. Select **Continue**.

6. Enter a name for the service.

7. (Optional) Provide a description for the service.

8. Choose whether to enable session recording.

9. Select the Tailscale PAM connector that can reach your MySQL server.

10. Select **Continue**.

11. For **Upstream hostname**, enter the hostname or IP address of the MySQL server.

12. For **Port**, enter the MySQL port. The default is `3306`.

13. For **Authentication type**, select **Username and Password**.

14. For **Username**, enter the username Tailscale PAM should use to connect to MySQL.

15. For **Password**, enter the password for that user.

    If you used the local Docker example and the connector runs on the same device, use localhost, port 3306, username root, and your-database-password.

    If you're using the Tailscale PAM sandbox, use the sandbox connection details from the prerequisites above. If you're using your own MySQL server, enter the connection details for that server.

16. Select **Save**.

Your MySQL PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the MySQL service

Before users can connect, make sure a Tailscale PAM grant gives them access to the service. For example, the following grant permits any source to connect to PAM database services:

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

You can also define more advanced database permissions, such as read-only access.

For more PAM grant examples and information about fine-grained access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Connect to the MySQL database

The primary way to connect is through the Tailscale client, which can launch your preferred MySQL client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred MySQL client

Use the Tailscale client to quickly open the database with a MySQL client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your MySQL service.
4. Choose the database client you want to use.

The Tailscale client scans your device for well-known MySQL-compatible database clients and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred database client isn't listed, open it directly and connect using:

* **Hostname:** The name of the Tailscale PAM service.
* **Port:** `3306`.
* **Username:** Leave empty.
* **Password:** Leave empty.

Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream database connection on your behalf. This means you can continue using your familiar database tools without needing the MySQL credentials.

For example, you can connect with the standard MySQL command-line client:

```shell
mysql -h <service-name> -P 3306 --protocol TCP
```

Replace `<service-name>` with the name of your MySQL PAM service.

### Connect from the browser

Alternatively, you can connect with the web-based MySQL client. The browser client runs a Tailscale client directly in your browser using WebAssembly, so there's nothing else to install.

1. Open the **Services** page of the Tailscale admin console.
2. Select the MySQL service you want to access.
3. Select **Connect** in the upper-right corner, and the Tailscale MySQL browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now run queries against the MySQL database directly from your browser.

The browser client appears as a Tailscale device in your tailnet. If [device approval][docs-device-approval] is enabled for the tailnet, an admin must approve the browser device before it can connect.

## Secure the upstream credentials

In the example above, the upstream MySQL username and password are stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, a local file, or a secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

By default, Tailscale PAM attempts to establish the connection between the connector and the upstream MySQL server using TLS. If the MySQL server doesn't support TLS, the connection falls back to a non-TLS connection.

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your MySQL service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your MySQL service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the SQL queries for the session.

This gives you a direct answer to two useful questions: who accessed the database, and what did they do while they were there?

## Troubleshooting

If you can't connect to your MySQL service, the most common issue is that the connector can't connect to the upstream database.

First, confirm that the connector is online and can reach the MySQL hostname and port. Also verify that the username and password in the service configuration are valid.

If you're using the Docker example, remember that `localhost` refers to the device running the connector. If your connector runs on a different device, use a hostname or IP address that is reachable from that device.

Next, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, authentication, or the upstream database itself.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-install]: /docs/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
