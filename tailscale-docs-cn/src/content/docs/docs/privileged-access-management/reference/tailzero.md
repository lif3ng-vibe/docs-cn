---
title: "tailzero"
description: "[Tailscale PAM][docs-pam] includes the `tailzero` command-line interface (CLI) to let you start and manage your Tailscale PAM [connectors][docs-pam-connectors]."
---

Last validated Sep 30, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] includes the `tailzero` command-line interface (CLI) to let you start and manage your Tailscale PAM [connectors][docs-pam-connectors].

When you [set up a PAM connector][docs-pam-connectors-install], `tailzero` is installed on the connector device.

> **Note:**
>
> Tailscale PAM results from [Border0 joining Tailscale][bl-border0-joins-tailscale]. Currently several `tailzero` items such as flag names and descriptions rely on "border0" or "Border0" because of backend dependencies, as shown in this topic.

## Command Reference

`tailzero` provides commands for starting, installing, and uninstalling connectors, checking and upgrading the `tailzero` version, and inspecting the status of a running connector.

To get help for `tailzero`, run:

```shell
tailzero -h
```

To get help for a specific command, like `tailzero start`, run:

```shell
tailzero start -h
```

To get help for a specific subcommand, like `tailzero version check`, run:

```shell
tailzero version check -h
```

### start

Start the connector. This is the default command.

```shell
tailzero start [flags]
```

Available flags:

* `--acl-cap-pam=<uri>` App capability URI that the policy engine reads PAM grants from. Override this when the control plane reserves the `tailscale.com` domain, for example `border0.com/cap/pam`. Defaults to `tailscale.com/cap/pam`.
* `--border0-invite-code=<code>` Border0 connector invite code. Required unless `--border0-token` is set.
* `--border0-token=<token>` Border0 connector token. Required unless `--border0-invite-code` is set.
* `--cache-k8s-namespace=<namespace>` Kubernetes namespace of the secret used to cache invite exchange credentials. Used with `--border0-invite-code`.
* `--cache-k8s-secret-name=<name>` Kubernetes secret name used to cache invite exchange credentials. Used with `--border0-invite-code`.
* `--cache-ssm-path=<path>` AWS SSM Parameter Store path used to cache invite exchange credentials. Used with `--border0-invite-code`.
* `--config-dir=<path>` Directory containing credential and secret environment files, loaded at startup.
* `--debug` Enable verbose per-connection logging, including policy evaluation and connection traces. You can also enable this by setting the environment variable `BORDER0_VERBOSE_LOG=true`.
* `--hostname=<name>` Hostname to use for the connector name. Defaults to the hostname of the host machine.
* `--state-source=<uri>` State source URI for the Tailscale node identity. This can be `kube:<secret-name>` for a Kubernetes secret, `arn:aws:ssm:<region>:<acct>:parameter/<path>` for AWS SSM Parameter Store (which survives ECS deploys), or `mem:` for ephemeral state. If empty, state is stored as a file under `--statedir`. When this is an SSM ARN and `--cache-ssm-path` is unset, Border0 credentials are also stored inside the same parameter.
* `--statedir=<path>` Directory for Tailscale state. Used for runtime files, and is also the default state file location when `--state-source` is unset. Defaults to `/var/lib/tailzero`.
* `--ts-auth-key=<key>` Tailscale [auth key][docs-auth-keys]. Required unless identity federation credentials are present.
* `--ts-control-url=<url>` Tailscale coordination server URL. Set this for self-hosted deployments. Defaults to the public Tailscale control plane.
* `--ts-id-fed-cid=<client-id>` Tailscale [identity federation][docs-workload-identity] client ID. Required when `--ts-auth-key` is not set.
* `--ts-id-fed-token=<token>` Tailscale [identity federation][docs-workload-identity] token. Required when `--ts-auth-key` is not set.

### install

Install the connector as a system service.

```shell
tailzero install [flags]
```

Available flags:

* `--border0-invite-code=<code>` Border0 invite code, which is exchanged for a token and an auth key.
* `--border0-token=<token>` Border0 connector token. Providing this directly skips the invite exchange.
* `--cache-k8s-namespace=<namespace>` Kubernetes namespace for credential caching.
* `--cache-k8s-secret-name=<name>` Kubernetes secret name for credential caching.
* `--cache-ssm-path=<path>` AWS SSM path for credential caching.
* `--config-dir=<path>` Directory for credential and secret files. Defaults to `/etc/border0`.
* `--connector-name=<name>` Connector name. Defaults to the hostname of the host machine.
* `--service-user=<user>` User to run the service as. Defaults to the current user.
* `--state-dir=<path>` Tailscale state directory. Defaults to `/var/lib/tailzero`.
* `--ts-auth-key=<key>` Tailscale [auth key][docs-auth-keys]. Providing this directly skips the invite exchange.

### uninstall

Remove the system service.

```shell
tailzero uninstall
```

This command has no flags.

### version

Print the version, or check for and upgrade to a newer version.

```shell
tailzero version [subcommand] [flags]
```

Running `tailzero version` with no subcommand prints the installed version.

Subcommands:

* `check` Check for a newer version.
* `upgrade` Download and install a newer version.

Available flags for `check`:

* `--track=<track>` Release track to check, for example `stable` or `unstable`. Defaults to `stable`.

Available flags for `upgrade`:

* `--track=<track>` Release track to upgrade from, for example `stable` or `unstable`. Defaults to `stable`.
* `--version=<version>` Specific version to download, for example `1.0.0-0-gabcdef0` or `latest`.

### status

Show the status of a running connector. The `status` command queries the connector's local management socket, so it must be run on the connector device while the connector is running.

```shell
tailzero status [subcommand] [flags]
```

Running `tailzero status` with no subcommand prints a one-glance overview: the connector's health, hostname, tailnet, the number of active and total remote peers, and the number of active and total local services.

Subcommands:

* `peers` Show tailnet peers, similar to `tailscale status`.
* `services` Show the connector's services and their state.
* `health` Print `OK` or `UNHEALTHY`. The command exits `0` when the connector is healthy and `1` otherwise, so it can be used as a container, systemd, or Kubernetes probe.

Common flags, available on the overview and every subcommand:

* `--json` Output raw JSON instead of a formatted table.
* `--socket=<path>` Path to the connector management socket. Defaults to `<statedir>/mgmt.sock`.
* `--statedir=<path>` State directory used to locate the default management socket. Defaults to `/var/lib/tailzero`.

Additional flags for `peers` and `services`:

* `--active` For `peers`, show only peers that are online. For `services`, show only services in the `ACTIVE` state.

Additional flag for `health`:

* `--quiet` Suppress output and rely on the exit code only.

The `services` subcommand reports each service's state as one of the following:

* `ACTIVE` The service's Tailscale virtual IPs are assigned and the connector is serving it.
* `PENDING` The service is advertised but the control plane has not assigned it virtual IPs yet. This covers both a service still awaiting approval in the Tailscale admin console and one already approved whose virtual IP assignment has not yet propagated to the connector.
* `HTTP-TUNNEL-OFFLINE` An HTTP service whose tunnel to the Border0 proxy is not currently established.
* `UNKNOWN` The live status lookup for the service failed.

[bl-border0-joins-tailscale]: https://tailscale.com/blog/border0-joins-tailscale

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam]: /docs/privileged-access-management

[docs-workload-identity]: /docs/features/workload-identity-federation
