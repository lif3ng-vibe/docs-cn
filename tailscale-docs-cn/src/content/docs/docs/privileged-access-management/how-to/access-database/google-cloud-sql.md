---
title: "Access a Google Cloud SQL database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to Google Cloud SQL using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to Google Cloud SQL using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials.

You can control who has access to the database, apply fine-grained permissions, and keep an audit trail of database sessions. Users can continue using their preferred database clients or connect directly from their browser.

Tailscale PAM supports Cloud SQL instances running MySQL or PostgreSQL. This guide uses MySQL in the examples, but the same flow applies to PostgreSQL. Where the configuration differs, we'll call it out.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed, online, and able to reach the Cloud SQL server.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native database client.
* A Google Cloud SQL instance running MySQL or PostgreSQL.
* Access to configure the Cloud SQL instance and its Google Cloud IAM permissions.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

Tailscale PAM can connect to Cloud SQL directly using the instance's private or public IP address, or by using the built-in Cloud SQL connector.

If your Cloud SQL instance uses a private IP address, the Tailscale PAM connector must run somewhere with network access to that private IP. A Cloud SQL connector handles authentication and encryption, but it doesn't create a network path to a private IP instance.

## Choose how to connect to Cloud SQL

There are two ways for the Tailscale PAM connector to connect to your Cloud SQL instance.

### Use the Cloud SQL connector

The built-in Cloud SQL connector lets Tailscale PAM connect using your Cloud SQL instance connection name instead of connecting directly to its public IP address.

For public IP instances, this means you don't need to add the PAM connector's IP address to **Authorized networks** or manage SSL certificates yourself. Cloud SQL connectors handle encryption and use Google Cloud IAM to authorize the connection.

The Google Cloud identity used by the PAM connector must have permission to connect to the Cloud SQL instance. At minimum, grant it the **Cloud SQL Client** (`roles/cloudsql.client`) role. Make sure the Cloud SQL Admin API is also enabled for the project.

You'll also need the Cloud SQL instance connection name, which has the following format:

```shell
project-id:region:instance-id
```

For example:

```shell
my-project:us-central1:production-db
```

### Connect directly to the Cloud SQL instance

You can also connect directly to the instance using its private or public IP address.

For a private IP instance, make sure the PAM connector can reach the Cloud SQL instance over the private network.

For a public IP instance, enable a public IP on the Cloud SQL instance and add the public IP address of the machine running the PAM connector to the instance's **Authorized networks**.

You can authenticate with a database username and password, or configure TLS authentication using a client certificate and key.

## Create a Google Cloud SQL PAM service

Now that your Cloud SQL instance is ready, create a PAM service for it.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select either **MySQL - Google Cloud SQL** or **PostgreSQL - Google Cloud SQL**.

5. Select **Continue**.

6. Enter a name for the service.

   Use a name that will make the database suitable for users to recognize when they browse the services they can access.

7. (Optional) Provide a description for the service.

8. Choose whether to enable session recording.

9. Select the Tailscale PAM connector that can reach your Cloud SQL server.

10. Select **Continue**.

11. For **Upstream hostname or IP**, enter hostname or IP address of the Cloud SQL server.

12. For **Port**, enter the port.

13. Configure how the PAM connector should connect and authenticate to your Cloud SQL instance.

    The Cloud SQL connector uses Google Cloud credentials available to the PAM connector to establish the connection.

    If the PAM connector runs on a Google Compute Engine VM, it can use the Google Cloud Platform (GCP) service account associated with that VM, provided the service account has the required Cloud SQL permissions.

    #### Username and Password

    1. For **Authentication type**, select **Username and Password**.
    2. For **Username**, enter the database username that Tailscale PAM should use.
    3. For **Password**, enter the password for that username.

    #### Cloud SQL Connector

    To use the built-in Cloud SQL connector with your existing database username and password:

    1. For **Authentication type**, select **Cloud SQL Connector**.
    2. For **Username**, enter the database username that Tailscale PAM should use.
    3. For **Password**, enter the password for that username.
    4. For **Cloud SQL instance**, enter your Cloud SQL instance connection name.
    5. (Optional) For **GCP credentials JSON**, enter your GCP [service account key][xt-gcp-service-account-key] in JSON format.

    #### Cloud SQL Connector with IAM

    You can use Google Cloud IAM database authentication instead of storing a database password in the PAM service:

    Before configuring the Tailscale PAM service, make the following changes in the Google Cloud console:

    1. Enable IAM database authentication on the Cloud SQL instance.
    2. Add the Google Cloud IAM user or service account as a database user.
    3. Grant the IAM principal the **Cloud SQL Instance User** (`roles/cloudsql.instanceUser`) role.
    4. Grant the IAM principal the **Cloud SQL Client** (`roles/cloudsql.client`) role.
    5. Grant the database user the database privileges it needs.

    Cloud SQL doesn't grant database privileges automatically when you add an IAM database user, so make sure you grant the appropriate permissions within MySQL or PostgreSQL.

    Then, continuing with the Tailscale PAM setup:

    1. For **Authentication type**, select **Cloud SQL Connector with IAM**.

    2. For **Username**, enter the IAM database username that Tailscale PAM should use.

       The IAM database username format depends on the database engine:

       * **MySQL:** Use the IAM username without the `@` and domain. For a service account, remove the `@project-id.iam.gserviceaccount.com` suffix.
       * **PostgreSQL:** Use the IAM user's full email address. For a service account, remove only the `.gserviceaccount.com` suffix.

       For example, a PostgreSQL service account named `pam-connector@my-project.iam.gserviceaccount.com` uses `pam-connector@my-project.iam` as the database username.

    3. For **Cloud SQL instance**, enter your Cloud SQL instance connection name.

    4. (Optional) For **GCP credentials JSON**, enter your GCP [service account key][xt-gcp-service-account-key] in JSON format.

    #### TLS

    If you use TLS authentication, provide the client certificate and private key issued for the Cloud SQL instance. You can also provide the certificate authority (CA) to verify the server certificate.

    1. For **Authentication type**, select **TLS**.
    2. For **Username**, enter the database username that Tailscale PAM should use.
    3. For **Password**, enter the password for that username.
    4. For **Client TLS certificate**, enter the PEM-encoded client certificate the PAM connector presents to the upstream service for mutual TLS. If specified, also provide a value for **client TLS private key**.
    5. For **Client TLS private key**, enter the PEM-encoded private key for the client TLS certificate above. Required if you provided a value for **Client TLS certificate**.
    6. (Optional) For **Server CA certificate**, enter the PEM-encoded CA certificate used to verify the upstream service's TLS certificate. Use this field only if you want to verify the server certificate without client TLS. You can leave it blank and skip the verification process.

14. Select **Save**.

Your Cloud SQL PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the Cloud SQL database

Before users can connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the service. For example, the following grant permits any source to connect to PAM database services:

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
>
> You can also define more advanced database permissions, such as read-only access.
>
> For more PAM grant examples and information about fine-grained access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the Cloud SQL database

The primary way to connect is through the Tailscale client, which can launch your preferred Cloud SQL client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred Cloud SQL client

Use the Tailscale client to quickly open the database with a Cloud SQL client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your Cloud SQL service.
4. Choose the database client you want to use.

The Tailscale client scans your device for well-known clients compatible with the database engine and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred database client isn't listed, open it directly and use the name of the Tailscale PAM service as the hostname.

For a MySQL Cloud SQL service, use port `3306` and leave the username and password empty:

```shell
mysql -h <service-name> -P 3306 --protocol TCP
```

For a PostgreSQL Cloud SQL service, use port `5432`:

```shell
psql -h <service-name> -p 5432 -d <database-name>
```

Replace `<service-name>` with the name of your Cloud SQL PAM service and `<database-name>` with the name of your database.

Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream Cloud SQL connection on your behalf. You don't need to know or manage the upstream database credentials.

### Connect from the browser

Alternatively, you can connect with the web-based database client. The browser client runs a Tailscale client directly in your browser using WebAssembly (Wasm), so there's nothing else to install.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select the Cloud SQL service you want to access.
3. Select **Connect** in the upper-right corner.
4. The Tailscale database browser client opens.
5. If prompted, authenticate with your Tailscale identity.

You can now run queries against your Cloud SQL database directly from your browser.

The browser client appears as a Tailscale device in your tailnet. If [device approval][docs-device-approval] is enabled, an admin must approve the browser device before it can connect.

## Secure the upstream credentials

If your Cloud SQL service uses a database username and password, those credentials can be stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, a local file, or a secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

If you're using the Cloud SQL connector with IAM database authentication, you don't need to store a static database password. The Cloud SQL connector handles IAM database authentication using the Google Cloud identity available to the PAM connector.

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your Cloud SQL service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your Cloud SQL service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the SQL queries for the session.

This gives you a direct answer to two useful questions: who accessed the database, and what did they do while they were there?

## Troubleshooting

If you can't connect to your Cloud SQL service, start by reviewing the connector logs and the failed session in the PAM session log.

If you're connecting directly to a private IP address, confirm that the PAM connector has network access to the Cloud SQL instance.

If you're connecting directly to a public IP address, verify that the PAM connector's public IP is included in the Cloud SQL instance's **Authorized networks**.

If you're using the Cloud SQL connector, confirm that:

* The Cloud SQL Admin API is enabled.
* The instance connection name is correct.
* The Google Cloud identity used by the PAM connector has the **Cloud SQL Client** role.
* The PAM connector can make outbound connections on TCP ports `443` and `3307`. Cloud SQL connectors use port `443` to reach Google APIs and port `3307` to connect to Cloud SQL instances.

If you're using IAM database authentication, also confirm that IAM database authentication is enabled on the instance, the IAM principal has the **Cloud SQL Instance User** role, the corresponding database user exists, and that user has the required database privileges.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed PAM sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, Google Cloud IAM permissions, database authentication, or the upstream Cloud SQL instance itself.

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-gcp-service-account-key]: https://docs.cloud.google.com/iam/docs/service-account-creds#key-types
