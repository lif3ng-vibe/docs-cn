---
title: "Troubleshoot Linux operator permission"
description: "The [Tailscale daemon][docs-tailscaled] (`tailscaled`) typically runs as the `root` user, and so only `root` can manage the daemon. To allow a different user to manage Tailscale, set the user as the o"
---

Last validated Feb 18, 2026

The [Tailscale daemon][docs-tailscaled] (`tailscaled`) typically runs as the `root` user, and so only `root` can manage the daemon. To allow a different user to manage Tailscale, set the user as the operator using the [`tailscale set`][docs-tailscale-cli-set] command:

```shell
sudo tailscale set --operator=<USERNAME>
```

[docs-tailscale-cli-set]: /docs/reference/tailscale-cli#set

[docs-tailscaled]: /docs/reference/tailscaled
