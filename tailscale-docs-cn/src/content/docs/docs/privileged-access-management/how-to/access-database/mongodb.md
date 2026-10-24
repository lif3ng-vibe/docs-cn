---
title: "Access a MongoDB database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to MongoDB using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials."
---

Last validated Aug 18, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to MongoDB using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials.

You can control who has access to the database, apply fine-grained permissions, and keep an audit trail of database sessions and queries. Users can continue using their preferred MongoDB clients, including MongoDB Compass, `mongosh`, DBeaver, DataGrip, and TablePlus.

This guide walks you through creating a MongoDB PAM service, connecting to it, and reviewing the resulting session activity.

Tailscale PAM also supports MongoDB Atlas and Amazon DocumentDB. Those configurations are covered later in this guide.

## Prerequisites

Before you begin, confirm you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed, online, and able to reach the MongoDB server.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native database client.
* A MongoDB server that the connector can reach.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

You can use your own MongoDB server or run a local MongoDB server with Docker.

If you're using your own MongoDB server, you'll need its hostname or IP address, port, and the credentials the connector should use to authenticate.

## Run a local MongoDB server with Docker

If you're using your own MongoDB server, skip to the next step.

For a quick local test, start a MongoDB server with Docker:

```shell
docker run --name tailscale-pam-mongodb --rm \
  -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=<your-database-password> \
  mongo:latest
```

Replace `<your-database-password>` with a password of your choice.

This starts a MongoDB server on port `27017` with the `admin` user and the password that you specified.

Before continuing, verify that you can connect to it:

```shell
mongosh "mongodb://admin:your-database-password@127.0.0.1:27017/admin"
```

After you connect, run a basic command:

```mongodb
db.runCommand({ ping: 1 })
```

If MongoDB returns `ok: 1`, your server is ready.

If the Tailscale PAM connector runs on the same device as Docker, you can use `localhost` and port `27017` when you configure the PAM service. If the connector runs somewhere else, use an IP address or hostname that the connector can reach.

## Create a MongoDB PAM service

Create a database service and link it to your connector.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **MongoDB**.

5. Select **Continue**.

6. Provide a name for your service.

   Use a name that will make the database suitable for users to recognize when they browse the services they can access.

7. (Optional) Provide a description for the service.

8. Choose whether the **Session Recording** option is enabled or disabled.

9. Select the Tailscale PAM connector that can reach your MongoDB server.

10. Select **Continue**.

11. For **Upstream hostname**, enter hostname or IP address of the MongoDB server.

12. For **Port**, enter the MongoDB port. The default is `27017`.

13. For **Authentication Type**, select the authentication method used by the upstream MongoDB server. For this example, select username and password authentication. (Tailscale PAM also supports other MongoDB authentication configurations, including TLS, no authentication, and AWS IAM authentication where applicable.)

14. For **Username**, enter the username Tailscale PAM should use to connect to MongoDB.

15. For **Password**, enter the password for that user.

    If you used the local Docker example and the connector runs on the same device, use `localhost`, port `27017`, username `admin`, and the value you used for `<your-database-password>`.

16. Select **Save**.

Your MongoDB PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the MongoDB database

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

For MongoDB, you can also create more restrictive database permissions. Supported operation types include read-only, read-write, insert, update, and delete access. Collection-level and document-level restrictions aren't currently supported.

For more PAM grant examples and information about fine-grained access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the MongoDB database

The primary way to connect is through the Tailscale client, which can launch your preferred MongoDB client.

### Connect with your preferred MongoDB client

Use the Tailscale client to quickly open the database with a MongoDB client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your MongoDB service.
4. Choose the database client you want to use.

The Tailscale client scans your device for well-known MongoDB-compatible clients and shows the ones it can find. These can include clients such as `mongosh`, MongoDB Compass, DBeaver, DataGrip, and TablePlus.

Selecting a client establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred MongoDB client isn't listed, open it directly and connect using:

* **Hostname**: The name of the Tailscale PAM service.
* **Port**: `27017`.
* **Username**: Leave empty.
* **Password**: Leave empty.

Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream MongoDB connection on your behalf. This means you can continue using the MongoDB tools you're already familiar with without needing to know or manage the upstream credentials.

For example, you can connect with `mongosh`:

```shell
mongosh "mongodb://<service-name>:27017/admin"
```

Replace `<service-name>` with the name of your MongoDB PAM service. MongoDB uses port `27017` by default, and `mongosh` accepts a standard `mongodb://` connection URI.

## Secure the upstream credentials

In the example above, the upstream MongoDB username and password are stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, a local file, or a secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your MongoDB service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your MongoDB service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the MongoDB queries for the session.

This gives you a direct answer to two useful questions: who accessed the database, and what did they do while they were there?

## Use Amazon DocumentDB with IAM authentication

Tailscale PAM also supports Amazon DocumentDB as a MongoDB-compatible upstream service.

Amazon DocumentDB can use AWS IAM identities for database authentication, letting the PAM connector authenticate using an IAM role or user instead of a static database password. IAM authentication uses the `MONGODB-AWS` authentication mechanism and stores IAM-authenticated database users in the `$external` database.

If your PAM connector runs on an Elastic Compute Cloud (EC2) instance, you can use the IAM role attached to that instance.

First, connect to DocumentDB as an administrator and switch to the `$external` database:

```mongodb
use $external
```

Create a database user whose name matches the IAM role ARN used by the connector:

```mongodb
db.createUser({
  user: "arn:aws:iam::<account-id>:role/<role-name>",
  mechanisms: ["MONGODB-AWS"],
  roles: [
    { role: "readWrite", db: "admin" }
  ]
})
```

Replace `<account-id>` and `<role-name>` with the IAM identity used by your connector.

Amazon DocumentDB IAM authentication requires the database user to match the IAM identity ARN. The connector can retrieve temporary credentials automatically when it runs with an attached IAM role.

When you configure the PAM service:

* Use the DocumentDB cluster endpoint as the upstream hostname.
* Use port `27017`.
* Select AWS IAM authentication.
* Configure TLS for the upstream connection.
* Select the PAM connector that has access to the DocumentDB cluster.

You don't need to store a static database password when the connector authenticates using its AWS IAM identity.

## Use MongoDB Atlas

Tailscale PAM can also provide access to MongoDB Atlas.

Before configuring the PAM service, make sure:

* You have an existing MongoDB Atlas cluster.
* You have a MongoDB database user with access to the databases you want to make available.
* The Atlas cluster is reachable from the network where the PAM connector runs.

For standard public Atlas connections, add the connector's public IP address to the Atlas project's IP access list. You can also connect through Amazon Virtual Private Cloud (VPC) or Azure Virtual Network (VNet) peering or a private endpoint when the connector has access to that private network. MongoDB Atlas requires both network access and a MongoDB database user before a client can connect.

When creating the PAM service, select **MongoDB Atlas** and provide the Atlas cluster connection information and database credentials.

Once configured, users connect to the PAM service using their Tailscale identity just as they would with a standard MongoDB service. They don't need access to the upstream Atlas credentials.

## Troubleshooting

If you can't connect to your MongoDB service, the most common issue is that the connector can't connect to the upstream database.

First, confirm that the connector is online and can reach the MongoDB hostname and port. Also verify that the credentials in the service configuration are valid.

If you're using the Docker example, remember that `localhost` refers to the device running the connector. If your connector runs on a different device, use a hostname or IP address that is reachable from that device.

For MongoDB Atlas, confirm that the connector has network access to the cluster and, for public connections, that its public IP address is included in the Atlas IP access list.

For Amazon DocumentDB with IAM authentication, verify that the IAM-authenticated database user exists in the `$external` database, that its username matches the IAM identity ARN used by the connector, and that the connector can get valid AWS credentials.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, authentication, or the upstream MongoDB service itself.

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
