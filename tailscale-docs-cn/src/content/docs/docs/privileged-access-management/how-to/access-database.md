---
title: "Access a database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets you give users secure, identity-based access to databases without distributing database credentials."
---

Last validated Aug 20, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets you give users secure, identity-based access to databases without distributing database credentials.

Users authenticate with their [Tailscale identity][docs-tailscale-identity], and you control who can connect to each database and what they're allowed to do. Tailscale PAM also gives you a centralized audit trail, so you can review who accessed a database, which device they connected from, when they connected, and, when session recording is enabled, the queries they ran.

In practice, this gives database access an SSO-like experience. Users sign in with Tailscale and connect to the databases they're allowed to use without needing the upstream database username or password.

## How database access works

Database access is provided through a Tailscale PAM [connector][docs-pam-connectors]. The connector runs in your environment, where it has network access to the databases you want to make available.

The connector establishes outbound connectivity to Tailscale PAM. When an authorized user starts a database session, Tailscale PAM authenticates the user with their Tailscale identity, applies the appropriate access controls, and proxies the connection through the connector to the target database.

Because the connector establishes the connection from your environment, you don't need to expose the database directly to the public internet.

Users can connect using the database clients they already use, or use the browser-based database client when one is available. This lets your organization centralize database access while still letting users work with familiar tools.

## Control database access

Tailscale PAM grants let you control who can connect to a database and what they're allowed to do after they connect.

For example, you can provide one group with read-only database access while allowing another group to do a broader set of operations. The database remains protected by its existing authentication, while users access it through their Tailscale identity.

For more information, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

## Database guides

The following guides show you how to make different types of databases available through Tailscale PAM:

* [Access a Google Cloud SQL database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/google-cloud-sql) — Access a Google Cloud SQL database using Tailscale PAM.

* [Access a Microsoft SQL Server database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/microsoft-sql-server) — Provide privileged access to a Microsoft SQL Server database using Tailscale PAM.

* [Access a MongoDB database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/mongodb) — Access a MongoDB database using Tailscale PAM.

* [Access a MySQL database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/mysql) — Access a MySQL database using Tailscale PAM.

* [Access a PostgreSQL database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/postgresql) — Access a PostgreSQL database using Tailscale PAM.

* [Access an Amazon RDS database using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/amazon-rds) — Access an Amazon RDS database using Tailscale PAM.

* [Access an Elasticsearch server using Tailscale PAM](/docs/privileged-access-management/how-to/access-database/elasticsearch) — Access an Elasticsearch server using Tailscale PAM.

If you don't have a database available for testing, you can also use one of the public Tailscale PAM sandbox servers. For information about the available sandbox services and credentials, refer to [Tailscale PAM sandbox servers][docs-pam-faq-sandbox].

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-faq-sandbox]: /docs/privileged-access-management/reference/faq#are-there-sandbox-servers-i-can-use-with-tailscale-pam

[docs-pam]: /docs/privileged-access-management

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
