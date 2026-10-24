---
title: "Manage secrets and credentials with Tailscale PAM"
description: "Some [Tailscale PAM][docs-pam] [services][docs-pam-services] require credentials so that the [connector][docs-pam-connectors] can authenticate to an upstream resource. For example, a database service "
---

Last validated Aug 14, 2026

> **Note:** Tailscale PAM is currently in beta.

Some [Tailscale PAM][docs-pam] [services][docs-pam-services] require credentials so that the [connector][docs-pam-connectors] can authenticate to an upstream resource. For example, a database service might require an upstream username and password, or an SSH service might require credentials for the upstream SSH server.

Instead of storing these credentials directly in the Tailscale PAM service configuration, we recommend storing them in an external secret source and configuring the service with a reference to the secret.

The Tailscale PAM connector resolves the secret locally at runtime when it needs the credential. This means the service configuration contains a reference to the secret rather than the secret value itself.

Using secret references lets you:

* Keep upstream credentials in your existing secrets management system.
* Avoid storing secret values directly in Tailscale PAM configuration.
* Keep secret retrieval within the environment where the connector runs.
* Rotate credentials in the secret source without changing the service configuration, as long as the secret reference remains the same.

## How secret references work

A dynamic secret reference starts with `from:`.

When configuring a PAM service:

1. Store the credential in a supported secret source.
2. Make sure the Tailscale PAM connector has permission to read the secret.
3. Enter a `from:` reference in the relevant service configuration field instead of entering the credential directly.
4. When the connector needs the credential, it resolves the reference and retrieves the value from the configured source.

For example, instead of entering a database password directly:

```shell
my-secret-password
```

You can reference a value stored in AWS Systems Manager Parameter Store:

```shell
from:aws:ssm:/production/database/password
```

## Supported secret sources

Tailscale PAM supports the following secret sources.

| Secret source                       | Reference format                 | Example                                        |
| ----------------------------------- | -------------------------------- | ---------------------------------------------- |
| Environment variable                | `from:env:<VARIABLE>`            | `from:env:DB_USERNAME`                         |
| File                                | `from:file:<PATH>`               | `from:file:/etc/database_username`             |
| AWS Systems Manager Parameter Store | `from:aws:ssm:<PATH>`            | `from:aws:ssm:/production/database/password`   |
| AWS Secrets Manager                 | `from:aws:secretsmanager:<PATH>` | `from:aws:secretsmanager:/production/database` |
| Keeper Secrets Manager              | `from:keeper:<RECORD>:<FIELD>`   | `from:keeper:database:password`                |

### Environment variables

Use `from:env:` to retrieve a value from an environment variable available to the Tailscale PAM connector.

For example:

```shell
from:env:DB_USERNAME
```

The connector retrieves the value of the `DB_USERNAME` environment variable when it needs the credential.

### Files

Use `from:file:` to retrieve a value from a file on the connector host.

For example:

```shell
from:file:/etc/database_password
```

The connector reads the value from `/etc/database_password`.

Make sure the account running the Tailscale PAM connector has permission to read the file, and protect the file using appropriate filesystem permissions.

### AWS Systems Manager Parameter Store

Use `from:aws:ssm:` to retrieve a value from AWS Systems Manager Parameter Store.

For example:

```shell
from:aws:ssm:/production/database/password
```

The connector must have AWS IAM permission to read the referenced parameter.

When possible, grant the connector access only to the parameters required by the PAM services it manages.

### AWS Secrets Manager

Use `from:aws:secretsmanager:` to retrieve a secret from AWS Secrets Manager.

For example:

```shell
from:aws:secretsmanager:/production/database/password
```

The connector must have AWS IAM permission to read the referenced secret.

### Keeper Secrets Manager

Use `from:keeper:` to retrieve a field from a Keeper Secrets Manager record.

The format is:

```shell
from:keeper:<record>:<field>
```

For example:

```shell
from:keeper:database:password
```

The Keeper integration uses the `ksm` CLI. The CLI must be installed on the connector host and available in its `PATH`.

## Reference secrets in service configuration

When configuring a Tailscale PAM service, you can use a `from:` reference instead of entering a value directly in supported upstream configuration fields.

Common examples include:

| Service type | Configuration fields                           |
| ------------ | ---------------------------------------------- |
| SSH          | Upstream username, upstream password           |
| Database     | Upstream username, upstream password, hostname |
| AWS          | AWS access key ID, AWS secret access key       |

The connector resolves the reference when it needs the value to connect to the upstream service.

For example, a database service could use an environment variable for its upstream username and AWS Systems Manager Parameter Store for its password:

```shell
Username:
from:env:RDS_USERNAME

Password:
from:aws:ssm:/rdsdata/password
```

In this example, the connector reads `RDS_USERNAME` from its environment and retrieves the password from AWS Systems Manager Parameter Store.

An SSH service could similarly retrieve its username from a local file and its password from AWS Secrets Manager:

```shell
Username:
from:file:/etc/ssh_username

Password:
from:aws:secretsmanager:/staging/sshpassword
```

## Extract a field from a JSON secret

Secrets are sometimes stored as JSON objects containing multiple values, such as a username and password.

You can use the `jq_exp` option to extract an individual value from a JSON secret. The expression uses basic dot notation similar to `jq`.

The format is:

```shell
from:<source>:<path>,jq_exp=<expression>
```

For example, suppose an AWS Secrets Manager secret contains:

```json
{
  "username": "database-user",
  "password": "secret-password",
  "database": {
    "token": "secret-token"
  }
}
```

You can retrieve individual fields:

```shell
from:aws:secretsmanager:production-database,jq_exp=.username

from:aws:secretsmanager:production-database,jq_exp=.password

from:aws:secretsmanager:production-database,jq_exp=.database.token
```

You can use `jq_exp` with supported secret sources, including AWS Secrets Manager, AWS Systems Manager Parameter Store, environment variables, and files.

## Protect access to secrets

The Tailscale PAM connector needs permission to retrieve any secret referenced by the services it manages.

Use the least privilege necessary when granting this access. For example, if you use AWS Secrets Manager or Systems Manager Parameter Store, configure the connector's IAM permissions so it can read only the secrets or parameters required by its PAM services.

For file-based secrets, restrict filesystem permissions to the account running the connector. For environment variables, make sure other processes or users on the connector host cannot access sensitive values.

Where possible, use an external secrets manager rather than storing upstream credentials directly in the Tailscale PAM service configuration.

### When secrets are refreshed

Tailscale PAM does not continuously poll external secret sources. The connector reads referenced secrets when:

* The connector starts.
* A service is initially provisioned.
* The service configuration is saved or updated.

If you rotate a secret in the external secret source without updating the service, the connector continues using the previously loaded value.

To load the new value, either restart the connector or save the service configuration again. You don't need to change any settings. Saving the service is enough to trigger the connector to retrieve the secret again.

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services

[docs-pam]: /docs/privileged-access-management
