---
title: "Logging overview"
description: "Understand Tailscale's logging infrastructure."
---

Last validated Jan 5, 2026

Each Tailscale agent in your distributed network streams its logs to a central log server (at `log.tailscale.com`). This includes real-time events for open and close events for every inter-machine connection (TCP or UDP) on your network.

Because every connection requires two endpoints, and both endpoints log every connection, it's possible to detect lost or tampered logs by comparing the double entries of each endpoint. You could also use IDS (intrusion detection system) rules to automatically detect suspicious activity on your network.

## Client logs

Each client logs information about its own operation and its attempts to contact other nodes. The data collected and how it is used are described in our [privacy policy][co-privacy-policy].

You can access logs locally for nodes on some desktop platforms.

#### Windows

Logs are stored in `C:\ProgramData\Tailscale` (or, more generally `$env:ALLUSERSPROFILE\Tailscale`).

#### macOS

To stream log entries as they are logged, open the Console application, start streaming, and search for `IPN`.

To collect Tailscale logs retroactively from the system log, you can also extract a macOS sysdiagnose by running `sudo sysdiagnose` in the Terminal. Look for entries matching `IPN` in the `system_logs.logarchive` file within the sysdiagnose.

#### iOS / tvOS

To stream log entries as they are logged, connect your iOS or tvOS device to your Mac. Then open the Console application, select your iOS or tvOS device in the sidebar, start streaming, and search for `IPN`.

To collect Tailscale logs retroactively from the system log, you can also extract a [sysdiagnose][xt-apple-training-sysdiagnose] and look for entries matching `IPN` in the `system_logs.logarchive` file within the sysdiagnose.

#### Android

Use the `logcat` utility to search for log entries issued by the `com.tailscale.ipn` package.

#### Linux

Logs are available in the shell:

```shell
journalctl -u tailscaled
```

### Centralized log management

Some logs are centrally collected by Tailscale for debugging. This is done with a [custom-built, high-capacity, high-reliability, distributed logging system][xt-apenwarr-20190216].

Client operational logs are only accessible locally on each node, but you could stream your system- and container-level logs to the same centralized data store for further analysis. [Network flow logs][ar-network-flow-logs] are available from the admin console when enabled.

### Opt out of client logging

You opt out of client logging on each device individually, using the `--no-logs-no-support` flag for the [`tailscaled`][docs-tailscaled] daemon or the equivalent `TS_NO_LOGS_NO_SUPPORT` environment variable. This disables telemetry and opts the device out of any support that would require that telemetry for debugging.

The flag and the environment variable have the same effect, but flag availability varies by platform. On Windows, only the environment variable is available. On macOS, the flag works only with the command-line [open source `tailscaled` variant][docs-macos-variants], not the Standalone app or the Mac App Store app. Use the method that matches your platform.

> **Note:**
>
> If you block client logging, Tailscale may not be able to provide technical support.

#### Windows

This is possible if you set the `TS_NO_LOGS_NO_SUPPORT` environment variable in `%ProgramData%\Tailscale\tailscaled-env.txt`:

```powershell
TS_NO_LOGS_NO_SUPPORT=true
```

To track when you can instead use the `--no-logs-no-support` flag, follow our [GitHub issue][xt-gh-tailscale-issue-5114] for making it easier to use environment variables.

#### macOS

If you are running the open source `tailscaled` [macOS variant][docs-macos-variants], pass the `--no-logs-no-support` flag to `tailscaled`:

```shell
tailscaled --no-logs-no-support
```

To track when you can use the `--no-logs-no-support` flag for other macOS variants, follow our [GitHub issue][xt-gh-tailscale-issue-5114] for making it easier to use environment variables.

#### Linux

Either use the `--no-logs-no-support` flag, or set the `TS_NO_LOGS_NO_SUPPORT` environment variable.

To use the `--no-logs-no-support` flag, pass it to `tailscaled`:

```shell
tailscaled --no-logs-no-support
```

To set the `TS_NO_LOGS_NO_SUPPORT` environment variable, edit `/etc/default/tailscaled` and add the following line:

```shell
TS_NO_LOGS_NO_SUPPORT=true
```

## Kubernetes Operator logs

The Kubernetes Operator's reconciliation logs are centrally collected for debugging. These logs describe steps the Kubernetes Operator has taken to bring the deployed state in-line with the desired state regarding Kubernetes resources.

Refer to our [privacy policy][co-privacy-policy] to understand the data collected and how we use it.

You can access logs locally using the `kubectl logs` command.

### Opt out of Kubernetes logging

If you deployed the Kubernetes Operator with Helm, add the `TS_NO_LOGS_NO_SUPPORT` environment variable to the `operatorConfig.extraEnv` section:

```yaml
operatorConfig:
  extraEnv:
  - name: TS_NO_LOGS_NO_SUPPORT
    value: "true"
```

If you deployed the Kubernetes Operator with static manifests, add the `TS_NO_LOGS_NO_SUPPORT` environment variable to the Kubernetes Operator's Deployment:

```yaml
env:
- name: TS_NO_LOGS_NO_SUPPORT
  value: "true"
```

## Network flow logs

> **Note:** Network flow logs are available for [the Premium and Enterprise plans](https://tailscale.com/pricing).

[Network flow logs][docs-network-flow-logs] are available to help you understand which devices are connecting to one another over time, that is, the *flow* of traffic across your tailnet.

These logs strictly do not contain any information about client operations or contents of network traffic.

Network flow logs must be [enabled][docs-network-flow-logs-enable].

> **Note:**
>
> Flow logs can be configured to [stream][docs-log-streaming] to a security information and event management (SIEM) system.

## Server logs

[Configuration audit logs][docs-audit-logging] record actions that modify a tailnet's configuration, including the type of action, the actor, the target resource, and the time.

All [users who have access to the admin console][docs-user-roles] can inspect configuration audit logs in the [Logs](https://console.tailscale.com/admin/logs) page of the admin console, and can filter these logs to find specific events.

Configuration audit logs are enabled by default for all tailnets, and are available for the most recent 90 days.

> **Note:**
>
> Audit logs can be configured to [stream][docs-log-streaming] to a security information and event management (SIEM) system.

## Local SSH session logs

Local SSH session logs are not supported as of version 1.48.0.

You can use [Tailscale SSH session recording][docs-tailscale-ssh-session-recording] to streaming recordings from the server device.

[ar-network-flow-logs]: #network-flow-logs

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-network-flow-logs-enable]: /docs/features/logging/network-flow-logs#enable-network-flow-logs

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscaled]: /docs/reference/tailscaled

[docs-user-roles]: /docs/reference/user-roles

[xt-apenwarr-20190216]: https://apenwarr.ca/log/20190216

[xt-apple-training-sysdiagnose]: https://it-training.apple.com/tutorials/support/sup075

[xt-gh-tailscale-issue-5114]: https://github.com/tailscale/tailscale/issues/5114
