---
title: "Connect inference and training servers"
description: "GPU servers, inference endpoints, and training nodes require secure network access without exposing them to the public internet. When these machines authenticate with user accounts, access breaks when"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Aperture**](/docs/aperture) — Monitor and secure LLM usage with Aperture by Tailscale.

GPU servers, inference endpoints, and training nodes require secure network access without exposing them to the public internet. When these machines authenticate with user accounts, access breaks when employees leave, keys rotate on schedules that disrupt long-running jobs, and there is no clean way to scope access per team or customer.

Tailscale [tags][docs-tags] and [auth keys][docs-auth-keys] give each server a machine identity in your tailnet. Tags define what a server is, auth keys automate how it joins, and [grants][docs-grants] control who can reach it. This topic covers single-tenant and multi-tenant setups, including containerized inference workloads.

## Define tags for your server infrastructure

Tags give non-user devices their own identity in your tailnet. Define tags for your server roles by adding a `tagOwners` block to your [tailnet policy file][docs-tailnet-policy-file]:

```json
"tagOwners": {
  "tag:inference-server": ["autogroup:admin"],
  "tag:training-cluster": ["autogroup:admin"],
}
```

The `tag:inference-server` tag identifies machines that serve model inference requests. The `tag:training-cluster` tag identifies machines used for model training. Assigning `autogroup:admin` as the owner means only tailnet admins can create auth keys for these tags.

> **Note:**
>
> These tag names are illustrative. Adapt them to match your infrastructure naming conventions (for example, `tag:gpu-a100` or `tag:ml-serving`) if you manage multiple server classes.

\[Missing snippet: visual\_policy\_editor.mdx]

For the full set of policy file configuration options, refer to the [tailnet policy file reference][docs-tailnet-policy-file].

## Authenticate servers with tagged auth keys

Auth keys let servers join your tailnet without interactive login. Generate a tagged auth key in the [Keys](https://console.tailscale.com/admin/settings/keys) with the following settings:

* **Reusable**: Yes, if you are adding multiple servers with the same tag.
* **Pre-authorized**: Yes, if you have [device approval][docs-device-approval] enabled.
* **Tags**: Select the tag you defined above (for example, `tag:inference-server`).

Install Tailscale on each server and authenticate with the auth key:

```shell
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=tskey-auth-<your-key> --advertise-tags=tag:inference-server
```

The server joins your tailnet immediately with the correct tag and no interactive login.

> **Note:**
>
> Tagged devices have [automatic key expiry disabled][docs-key-expiry], so servers authenticated with a tagged auth key do not require periodic reauthentication. Treat auth keys like passwords and store them in a secrets manager.

For details on auth key options, refer to the [auth keys reference][docs-auth-keys].

## Control access with grants

Use [grants][docs-grants] to define which users and groups can reach your tagged servers and on which ports. The following example gives your ML engineering team access to inference servers on all ports and limits training cluster access to SSH and a monitoring port:

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:inference-server"],
    "ip": ["*"],
  },
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:training-cluster"],
    "ip": ["22", "8080"],
  },
]
```

Grants are deny-by-default: if no grant explicitly permits a source-destination pair, Tailscale blocks the traffic.

\[Missing snippet: visual\_policy\_editor.mdx]

For additional grant patterns, refer to the [grants overview][docs-grants] and [grants examples][docs-grants-examples].

## Isolate access for multi-tenant environments

When multiple teams or customers share GPU infrastructure, assign per-tenant tags to prevent one tenant from reaching another tenant's servers. Define separate tags and grants for each tenant:

```json
"tagOwners": {
  "tag:tenant-a-gpu": ["autogroup:admin"],
  "tag:tenant-b-gpu": ["autogroup:admin"],
},
"grants": [
  {
    "src": ["group:tenant-a-users"],
    "dst": ["tag:tenant-a-gpu"],
    "ip": ["*"],
  },
  {
    "src": ["group:tenant-b-users"],
    "dst": ["tag:tenant-b-gpu"],
    "ip": ["*"],
  },
]
```

With this configuration, members of `group:tenant-a-users` can reach servers tagged `tag:tenant-a-gpu` but have no access to `tag:tenant-b-gpu`, and vice versa.

> **Note:**
>
> This pattern applies to any scenario that requires workload isolation, not only multi-tenant GPU infrastructure. You can use the same approach to separate development and production environments, internal teams, or customer-specific deployments.

## Connect containerized inference workloads

For inference workloads running in Docker containers, use an ephemeral tagged auth key passed as an environment variable. Ephemeral keys automatically clean up the device from your tailnet when the container stops.

The following Docker Compose example connects a container to your tailnet as a tagged inference server:

```yaml
services:
  inference:
    image: your-inference-image:latest
    environment:
      - TS_AUTHKEY=tskey-auth-<your-ephemeral-key>
      - TS_STATE_DIR=/var/lib/tailscale
    volumes:
      - tailscale-state:/var/lib/tailscale
volumes:
  tailscale-state:
```

Generate the auth key with the **Ephemeral** option enabled and the `tag:inference-server` tag selected. Each container instance joins the tailnet with its own identity, and Tailscale automatically removes it when it shuts down.

> **Note:**
>
> Use ephemeral keys for short-lived containers and reusable non-ephemeral keys for long-running servers. Refer to the [auth keys reference][docs-auth-keys] for details on key types.

For the full set of Docker and container configuration options, refer to the [Docker topic][docs-docker].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-docker]: /docs/features/containers/docker

[docs-grants]: /docs/features/access-control/grants

[docs-grants-examples]: /docs/reference/examples/grants

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
