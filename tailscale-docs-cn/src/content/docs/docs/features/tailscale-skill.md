---
title: "Tailscale skill for coding agents"
description: "Install the Tailscale skill so a coding agent can work with Tailscale configuration and code."
---

Last validated Jul 24, 2026

> **Note:** The Tailscale skill is currently in alpha.

The Tailscale skill supplies coding agents with Tailscale reference material so they can help you configure your [tailnet][docs-tailnet] and build applications that use Tailscale. Instead of pasting documentation into your agent's context for each request, you install the skill once and the agent draws on it when a request involves Tailscale.

The skill follows the Agent Skills standard, so it works with Claude Code, Cursor, OpenCode, OpenAI Codex, Pi, and other agents that support the standard. It covers core connectivity features, connectivity diagnostics, file sharing, containers and Kubernetes, enterprise deployment, session recording, [Aperture][docs-aperture], the Tailscale CLI, the Tailscale API, and Go application development with [`tsnet`][docs-tsnet].

> **Warning:**
>
> The Tailscale skill is an alpha release and is not supported. Treat what your agent produces as a starting point rather than a finished configuration. Verify commands, policy syntax, and configuration values against this documentation before you apply them to a production tailnet.

## Use cases

The skill helps when you want an agent to work with Tailscale rather than explain it to you. Common use cases include:

* **Configure tailnet features**: Set up an [exit node][docs-exit-nodes], a [subnet router][docs-subnet-routers], or [Tailscale SSH][docs-tailscale-ssh] without switching between your editor and the documentation.
* **Author policy changes**: Draft [tailnet policy file][docs-tailnet-policy-file] grants, tags, and tests for review.
* **Build with Tailscale**: Write Go applications that embed Tailscale with `tsnet`, or scripts that call the [Tailscale API][docs-api].
* **Deploy in containers**: Configure the [Kubernetes operator][docs-k8s-operator] or run Tailscale in [containers][docs-containers].
* **Diagnose connectivity**: Interpret `tailscale status` and `tailscale netcheck` output when a connection is not behaving as expected.

## Prerequisites

Before you install the skill, make sure you have:

* A coding agent that supports the Agent Skills standard, such as Claude Code, Cursor, OpenCode, OpenAI Codex, or Pi.
* Node.js installed, which provides the `npx` command used to install the skill.

## Get started

Install the skill from its repository:

```shell
npx skills add https://github.com/tailscale/tailscale-skill
```

The command installs the skill into your agent's skills directory. Restart your agent if it does not pick up new skills automatically.

If you would rather not use the `skills` command, install the skill manually. The repository holds the skill in a `skills/tailscale` subdirectory, so clone the repository and then copy that subdirectory into your agent's skills directory. The following example uses the Claude Code directory. Change the target directory if you use a different agent:

```shell
git clone https://github.com/tailscale/tailscale-skill.git
cp -r tailscale-skill/skills/tailscale ~/.claude/skills/tailscale
```

Copy the `skills/tailscale` directory itself rather than the repository root. An agent finds a skill by reading a `SKILL.md` file at the top level of a directory in its skills directory, and the repository root does not have one.

Keeping a manually installed skill current is your responsibility. Pull the repository and copy the directory again to pick up changes.

After the skill is installed, you can call it two ways:

* **Explicit**: Start your request with `/tailscale`. The agent loads the skill for that request.
* **Implicit**: Ask a question about Tailscale in conversation. Whether the agent loads the skill varies between agents and between requests.

Use the explicit form when you want to be certain the agent uses the skill.

### Example prompts

The following prompts show the kind of work the skill supports.

Configure a feature on the device you are working on:

```
/tailscale Configure this Ubuntu server as an exit node and advertise it.
```

Draft a policy change for review:

```
/tailscale Write a grant that lets the group:contractors group reach only
the tag:web devices on port 443, and add a test for it.
```

Add Tailscale to an application you are building:

```
/tailscale Add tsnet to this Go service so it listens on my tailnet instead
of a public port.
```

Deploy a workload onto your tailnet:

```
/tailscale Expose this Deployment to my tailnet with the Kubernetes operator.
```

Work through a connectivity problem:

```
/tailscale My two devices connect through DERP instead of directly. Walk
through netcheck output with me and identify why.
```

## Limitations

The skill has the following limitations:

* The skill is an alpha release and is not supported through Tailscale support channels.
* Tailscale configuration syntax and features change. The skill's reference material reflects the state of its repository at the time you installed it, so verify output against this documentation.
* Implicit calls depend on your agent. An agent might answer from its training data instead of loading the skill.
* The skill supplies reference material, not access. It does not authenticate to your tailnet and does not change your configuration.

## Support and feedback

For problems with the skill itself, such as inaccurate guidance, missing coverage, or installation failures, [open an issue in the skill repository][xt-gh-tailscale-skill-issues].

For questions about Tailscale products and features, contact [Tailscale Support][co-support]. Support does not cover the skill or output an agent produced with it.

[co-support]: https://tailscale.com/contact/support

[docs-aperture]: /docs/aperture

[docs-api]: /docs/reference/tailscale-api

[docs-containers]: /docs/features/containers

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-k8s-operator]: /docs/kubernetes-operator

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tsnet]: /docs/features/tsnet

[xt-gh-tailscale-skill-issues]: https://github.com/tailscale/tailscale-skill/issues
