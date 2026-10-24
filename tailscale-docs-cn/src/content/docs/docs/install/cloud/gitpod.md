---
title: "Access your tailnet from Gitpod"
description: "[Gitpod][xt-gitpod] is a way to spin up automated development environments for each task, in the cloud, in seconds, from any Git context you want."
---

Last validated Jan 5, 2026

[Gitpod][xt-gitpod] is a way to spin up automated development
environments for each task, in the cloud, in seconds, from any Git context you want.

Tailscale can be installed within a Gitpod workspace to be able to access private
resources securely, such as package registries, or to share an environment with
your colleagues for code review or pair programming.

## Start Tailscale

If you're already using Gitpod, Tailscale is installed in the [default `full` workspace base image][xt-docker-workspace-full] for Gitpod. To use it, in your workspace:

1. Run `sudo tailscaled` in a separate shell to start the process.
2. In your main shell, run `tailscale up` and authenticate using your browser or using an auth key.

### Add Tailscale to a custom base image

If you're managing your own base image instead of using the default `full` workspace image, you can still use Tailscale as part of a [custom Docker image][xt-gitpod-config-docker] for your project in Gitpod. The following files from the [`gitpod-io/template-tailscale` repository][xt-gh-gitpod-tailscale] or the [`tailscale/gitpod` repository][xt-gh-tailscale-gitpod] will need to be incorporated:

1. `.gitpod.Dockerfile` should be a layer in the build, or incorporated into the project Dockerfile.
2. The Tailscale task in `.gitpod.yml` needs to be incorporated into the project `.gitpod.yml` file.

## Authenticate to Tailscale

To allow the Gitpod workspace to join the tailnet, create an
[auth key][docs-auth-keys]
for your tailnet and add it as a [Gitpod environment variable][xt-gitpod-variables]
named `TAILSCALE_AUTHKEY`.

Once you're connected, you should find your Gitpod workspace in your tailnet following the naming convention `gitpod--{user-name}--{repo-name}`. Consider [enabling MagicDNS][docs-magicdns] to get a stable domain for your workspace, reachable from other nodes in your tailnet, such as your local machine.

### Use an ephemeral auth key for ephemeral workspaces

If you use a normal auth key, the Tailscale machine state will be stored in your Gitpod account, and your workspace will always reconnect as the same node.

Several Gitpod workspaces started relatively close together will get incrementing hostnames like `gitpod--{user-name}--{repo-name}-1` and `gitpod--{user-name}--{repo-name}-2`.

If you want to treat your Gitpod workspaces as ephemeral, instead use an [ephemeral auth key][docs-ephemeral-nodes].

*（图：Gitpod composing some Markdown）*

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-magicdns]: /docs/features/magicdns

[xt-docker-workspace-full]: https://hub.docker.com/r/gitpod/workspace-full

[xt-gh-gitpod-tailscale]: https://github.com/gitpod-io/template-tailscale

[xt-gh-tailscale-gitpod]: https://github.com/tailscale/gitpod

[xt-gitpod-config-docker]: https://www.gitpod.io/docs/config-docker

[xt-gitpod-variables]: https://gitpod.io/variables

[xt-gitpod]: https://www.gitpod.io
