---
title: "GitOps for Tailscale"
description: "Use GitOps to maintain your tailnet policy file as code."
---

Last validated May 2, 2025

> **Note:** GitOps for Tailscale is available for [all plans](https://tailscale.com/pricing).

[GitOps][xt-opengitops] for Tailscale is an alternative to managing [access control policies][docs-access-control] and the [tailnet policy file][docs-tailnet-policy-file] using the admin console. Using GitOps offers some distinct advantages. It lets you leverage all the benefits of Git version control for your tailnet policy file such as maintaining multiple versions, auditing commits, and adopting a configuration-as-code approach.

You can also require reviews before merging changes, invoke automatic tests to run upon tailnet policy file changes, and automatically apply validated changes to your policy file.

When you use GitOps, Tailscale automatically validates changes to the tailnet policy file when you push or pull changes using Git.

GitOps for Tailscale works with Bitbucket, GitHub Actions, and GitLab CI. Explore the following topics to enable, disable, and manage GitOps for Tailscale:

[**GitOps for Tailscale with Bitbucket**](/docs/integrations/bitbucket/gitops) — Use a Bitbucket CI to maintain your tailnet policy file as code.

[**GitOps for Tailscale with GitHub Actions**](/docs/integrations/github/gitops) — Use a GitHub Action to maintain your tailnet policy file as code.

[**GitOps for Tailscale with GitLab CI**](/docs/integrations/gitlab/gitops) — Use a GitLab CI to maintain your tailnet policy file as code.

[docs-access-control]: /docs/features/access-control

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-opengitops]: https://opengitops.dev
