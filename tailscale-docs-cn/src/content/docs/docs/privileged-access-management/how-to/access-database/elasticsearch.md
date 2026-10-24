---
title: "Access an Elasticsearch server using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to Elasticsearch using their [Tailscale identity][docs-tailscale-identity] instead of sharing Elasticsearch credentials."
---

Last validated Aug 21, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to Elasticsearch using their [Tailscale identity][docs-tailscale-identity] instead of sharing Elasticsearch credentials.

You can control who has access to the Elasticsearch server and keep an audit trail of sessions and queries. Users can continue using familiar tools such as `curl` or other Elasticsearch-compatible clients.

This guide walks you through creating an Elasticsearch PAM service, connecting to it, and reviewing the resulting session activity.

## Prerequisites

Before you begin, confirm you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed, online, and able to reach the Elasticsearch server.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect.
* An Elasticsearch server that the connector can reach.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

You can use your own Elasticsearch server or run a local Elasticsearch server with Docker.

If you're using your own Elasticsearch server, you'll need its hostname or IP address, port, username, and password.

## Run a local Elasticsearch server with Docker

If you're using your own Elasticsearch server or the Tailscale PAM sandbox, skip to the next step.

For a quick local test, start a single-node Elasticsearch server with Docker:

```shell
docker run --name tailscale-pam-elasticsearch --rm \
  -d -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ELASTIC_PASSWORD=<your-database-password>" \
  docker.elastic.co/elasticsearch/elasticsearch:9.4.4
```

Replace `<your-database-password>` with a password of your choice.

Elastic publishes its Elasticsearch Docker images in the Elastic container registry. This example uses Elasticsearch 9.4.4.

This starts a single-node Elasticsearch server with the `elastic` user and the value you used for `<your-database-password>` as the password.

Before continuing, verify that you can connect to it:

```shell
curl -k -u elastic:<your-database-password> https://localhost:9200
```

If Elasticsearch returns information about the cluster, the server is ready.

If the Tailscale PAM connector runs on the same device as Docker, you can use `localhost` and port `9200` when you configure the PAM service. If the connector runs somewhere else, use an IP address or hostname that the connector can reach.

## Create an Elasticsearch PAM service

To create a PAM service for your Elasticsearch server:

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select **Elasticsearch**.

5. Select **Continue**.

6. Provide a name for your service.

   Use a name that will make the database suitable for users to recognize when they browse the services they can access.

7. (Optional) Provide a display name for the service.

8. (Optional) Provide a description for the service.

9. Choose whether the **Session Recording** option is enabled or disabled.

10. Select the Tailscale PAM connector that can reach your Elasticsearch server.

11. Select **Continue**.

12. For **Upstream hostname**, enter the hostname or IP address of the Elasticsearch server.

13. For **Port**, enter the Elasticsearch port. The default is `9200`.

14. For **Protocol**, select **HTTP** or **HTTPS**.

15. For **Authentication type**, select **Basic Auth**.

    Tailscale PAM currently uses HTTP Basic authentication for the upstream Elasticsearch connection.

    If you used the local Docker example and the connector runs on the same device, use `localhost`, port `9200`, username `elastic`, and `your-database-password`.

    If you're using your own Elasticsearch server, enter the connection details and credentials for that server.

16. For **Username**, enter the username Tailscale PAM should use to connect to Elasticsearch.

17. For **Password**, enter the password for that user.

18. Select **Save**.

Your database service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the Elasticsearch service

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

Unlike MySQL and PostgreSQL PAM services, Elasticsearch services don't currently support query-level authorization or index-specific restrictions in Tailscale PAM. Once a user has access to the service, Tailscale PAM doesn't restrict which Elasticsearch queries they can submit or which indices they can access.

To limit what users can do after connecting, configure the upstream Elasticsearch user with the appropriate Elasticsearch roles and index privileges.

For more information about controlling access to PAM services, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the Elasticsearch server

The primary way to connect is through the Tailscale client and then use `curl` or your preferred Elasticsearch-compatible client.

### Connect with your preferred Elasticsearch client

Use the Tailscale client to quickly open the database with an Elasticsearch client already installed on your device.

1. Open the Tailscale client.
2. Select **Services**.
3. Select your Elasticsearch service.
4. Use the name of the service as the hostname in your Elasticsearch client.

For example, you can connect with `curl`:

```shell
curl http://<service-name>:9200
```

Replace `<service-name>` with the name of your Elasticsearch PAM service.

You don't need to provide the upstream Elasticsearch username or password. Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream Elasticsearch authentication on your behalf.

For example, you can add a document:

```shell
curl -X POST "http://<service-name>:9200/my_index/_doc/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "Elasticsearch is cool!"
  }'
```

Then query the index:

```shell
curl "http://<service-name>:9200/my_index/_search?q=title:Hello"
```

Use `http://` when connecting to the Elasticsearch PAM service. Traffic between your device and the Tailscale PAM connector is protected by WireGuard, so you don't need to use HTTPS for the client-side connection to the PAM service.

### Connect from the browser

Because Elasticsearch exposes an HTTP API, you can also make basic requests directly from a browser on a device connected to Tailscale.

For example, open `http://<service-name>:9200`.

For querying, indexing, and other API operations, use `curl` or another Elasticsearch-compatible client.

## Secure the upstream credentials

In the example above, the upstream Elasticsearch username and password are stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, a local file, or a secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

Because Tailscale PAM doesn't currently enforce query-level or index-specific permissions for Elasticsearch, consider using a dedicated upstream Elasticsearch user instead of a highly privileged account. Use Elasticsearch roles to give that user access only to the indices and operations it needs.

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your Elasticsearch service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your Elasticsearch service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the Elasticsearch queries for the session.

This gives you a direct answer to two useful questions: who accessed the Elasticsearch server, and what did they do while they were there?

## Troubleshooting

If you can't connect to your Elasticsearch service, the most common issue is that the connector can't connect to the upstream Elasticsearch server.

First, confirm that the connector is online and can reach the Elasticsearch hostname and port. Also verify that the username and password in the service configuration are valid.

If you're using the Docker example, remember that `localhost` refers to the device running the connector. If your connector runs on a different device, use a hostname or IP address that is reachable from that device.

You can also test connectivity to the upstream server directly from the device running the connector. For the Docker example:

```shell
curl -k -u elastic:<your-database-password> https://localhost:9200
```

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, authentication, or the upstream Elasticsearch server itself.

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
