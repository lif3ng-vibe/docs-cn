---
title: "Access your tailnet GitHub Codespaces"
description: "[GitHub Codespaces][xt-gh-codespaces] is a way to run Visual Studio Code—with its editor, terminal, debugger, version control, settings sync, and the entire ecosystem of extensions—hosted in the cloud"
---

Last validated Jan 5, 2026

[GitHub Codespaces][xt-gh-codespaces] is a way to run Visual Studio
Code—with its editor, terminal, debugger, version control, settings sync,
and the entire ecosystem of extensions—hosted in the cloud.

Tailscale can be installed within a Codespace to be able to access private resources
such as package registries or license servers securely, regardless of whether they're in
the cloud or on premises. You can also use Tailscale to share your development or staging
environment with a colleague.

## Integration

When using [GitHub Codespaces][xt-gh-codespaces], you can include Tailscale as a [feature][xt-gh-features] in your [dev container][xt-gh-dev-containers].

This feature is available from the [`tailscale/codespace` repository][xt-gh-tailscale-codespace].

To use the Tailscale feature, in your `devcontainer.json` include:

```json
"runArgs": ["--device=/dev/net/tun"],
"features": {
  // ...
  "ghcr.io/tailscale/codespace/tailscale": {}
  // ...
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

Then launch your codespace.

## Authorization

The first time the codespace starts it is necessary to authenticate it to join the tailnet.
In the terminal window run: `tailscale set --accept-routes`

This will print a URL to visit in a browser where you can log into the desired account.

*（图：GitHub Codespace writing this topic）*

[xt-gh-codespaces]: https://github.com/features/codespaces

[xt-gh-dev-containers]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/introduction-to-dev-containers

[xt-gh-features]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-features-to-a-devcontainer-file

[xt-gh-tailscale-codespace]: https://github.com/tailscale/codespace
