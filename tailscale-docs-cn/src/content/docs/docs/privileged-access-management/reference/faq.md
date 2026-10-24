---
title: "Tailscale PAM FAQ"
description: "Yes. If you want to experiment with Tailscale PAM without using your own servers, you can use various public sandbox servers as origin servers."
---

Last validated Jul 6, 2026

> **Note:** Tailscale PAM is currently in beta.

## Are there sandbox servers I can use with Tailscale PAM?

Yes. If you want to experiment with Tailscale PAM without using your own servers, you can use various public sandbox servers as origin servers.

The sandbox servers are intended for testing only. Don't use them for sensitive or production data. They are periodically reset.

The sandbox includes services for SSH, HTTP, MySQL, PostgreSQL, VNC, RDP, and TCP. For information about the available sandbox servers, ports, and credentials, refer to [Sandbox servers][docs-pam-sandbox-servers].

## Which database clients does the Tailscale client recognize?

When you select a database service in the Tailscale client, the client tries to detect well-known database applications installed on your device. If it finds one, Tailscale can launch the application with the connection configuration for the PAM service.

The following database clients are currently recognized:

* `mycli`
* `pgcli`
* `psql`
* CockroachDB SQL shell
* DataGrip
* DBeaver
* MySQL
* MySQL Workbench
* pgAdmin
* TablePlus

You aren't limited to these database clients. If your preferred client isn't in this list, the Tailscale client won't automatically detect and launch it for you, but you can still use it with Tailscale PAM.

Start your database client manually and configure it to connect to the Tailscale PAM service name. You can then authenticate using your [Tailscale identity][docs-tailscale-identity].

## How do I make Tailscale PAM services highly available?

For high availability, deploy two or more Tailscale PAM connectors that can independently reach the same service. A PAM service can be linked to multiple connectors, so if one connector becomes unavailable, clients can use another available connector to reach the service.

For the best availability, deploy connectors across separate failure domains, such as different hosts, availability zones, or regions, and make sure each connector can independently reach the service.

When multiple connectors are available for a service, the Tailscale client selects the most stable connector. This is typically the connector that has maintained its peer connection for the longest time. Connector selection is based on connection stability rather than round-robin load balancing.

If the active connector becomes unavailable, new connections use another available connector. Existing TCP connections that pass through the failed connector are interrupted and need to reconnect.

For more information, refer to [Tailscale PAM connector high availability][docs-pam-connector-ha].

## How do I check or upgrade the Tailscale PAM connector version?

The Tailscale PAM connector binary is named `tailzero`.

To check the version of the connector you're running:

```shell
tailzero version check
```

To upgrade to the latest version:

```shell
sudo tailzero version upgrade
sudo systemctl restart tailzero
```

The `tailzero version upgrade` command downloads the latest connector binary and replaces the currently installed version. Restart the `tailzero` service after the upgrade for the new version to take effect.

## Why does SSO login fail through a Tailscale PAM HTTP service?

When you access an application through a Tailscale PAM [HTTP service][docs-pam-http-service], the service's public hostname may be different from the hostname you use to access the application directly. This could cause single sign-on (SSO) login to fail. For more information, including how to resolve this, refer to [Troubleshoot SSO login failure for an HTTP service][docs-pam-http-service-troubleshoot-sso-failure].

[docs-pam-connector-ha]: /docs/privileged-access-management/connectors/high-availability

[docs-pam-http-service-troubleshoot-sso-failure]: /docs/privileged-access-management/how-to/access-http-service/troubleshoot-sso-failure

[docs-pam-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-sandbox-servers]: /docs/privileged-access-management/reference/sandbox-servers

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
