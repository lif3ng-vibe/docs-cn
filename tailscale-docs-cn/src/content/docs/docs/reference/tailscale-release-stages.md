---
title: "Release stages"
description: "Understand the Tailscale release stages."
---

Last validated Mar 25, 2025

Tailscale's features can go through multiple release stages: Alpha, Beta, and General Availability (GA). Use of these features is subject to our [Terms of Service][co-terms].

## Release stages

### Alpha

The feature is available for testing. Alpha releases may be public or private. The feature may have changing requirements and scope, and needs feedback. Alpha releases are not necessarily feature-complete, may not work on all platforms, may not have full functionality in the UI, CLI, or API, and may not be documented. Alpha releases have no technical support obligations.

### Beta

The feature is publicly available for testing environments. The feature needs refinement and broader testing to know it meets users' needs. Beta releases are documented, including any known gaps in functionality or platform support. Beta releases have no technical support obligations.

### General availability (GA)

The feature is publicly available, and ready for production use. Technical support obligations apply to GA features.

## Comparison matrix

|                    | **Alpha**                                           | **Beta**                                                                                                                               | **GA**                               |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Availability       | May be public or private                            | Public                                                                                                                                 | Public                               |
| Breaking changes   | Yes                                                 | Yes, but with some warning                                                                                                             | No                                   |
| Known issues       | Major                                               | Minor                                                                                                                                  | Bugs                                 |
| Platform support   | May only work on one platform                       | Works on all supported platforms by default. Any limitations are documented with the intent they will be addressed in a future update. | Works on all intended platforms      |
| UI/CLI/API support | May have limited UX                                 | May have limited UX                                                                                                                    | Works in all intended UX             |
| Documentation      | Not publicly, or very limited                       | Yes, but may be incomplete                                                                                                             | Yes                                  |
| Service Warranties | Covered under [existing Terms of Service][co-terms] | Not applicable                                                                                                                         | Not applicable                       |
| On by default      | No                                                  | May be for new tailnets                                                                                                                | May be for new and existing tailnets |

## Alpha and beta release stage indicators

### Tailscale admin console

Within the Tailscale [admin console][docs-terminology-admin-console], for a feature that is in alpha or beta, the UI displays a release stage indicator.

*（图：Release stage indicator for a feature.）*

### Tailscale CLI

Within the [Tailscale CLI][docs-cli], for a command or subcommand that is in alpha or beta, the `--help` text displays the release stage.

### Tailscale documentation

Within the [Tailscale Documentation][docs-docs] for a feature that is in alpha or beta, the topic displays text that shows the release stage.

*（图：Release stage indicator within documentation for a feature.）*

Documentation for a Tailscale CLI command or subcommand that is in alpha or beta also shows the release stage.

## Tailscale Community Projects

[Tailscale Community Projects][docs-community-projects] is a curated collection of community-supported open source projects built on Tailscale's platform. These projects showcase the breadth of how you can use Tailscale's networking and identity primitives to build secure, private tools for organizations and communities.

For information about supportability of projects in the Tailscale Community Projects [catalog][co-community-projects], refer to the [Tailscale Community Projects][co-special-terms-community-projects] section in our Special Terms.

[co-community-projects]: https://tailscale.com/community/community-projects

[co-special-terms-community-projects]: https://tailscale.com/special-terms#community-projects

[co-terms]: https://tailscale.com/terms

[docs-cli]: /docs/reference/tailscale-cli

[docs-community-projects]: /docs/reference/tailscale-community-projects

[docs-docs]: /docs

[docs-terminology-admin-console]: /docs/reference/glossary#admin-console
