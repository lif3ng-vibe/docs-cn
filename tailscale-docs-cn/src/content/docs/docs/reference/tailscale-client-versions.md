---
title: "Tailscale client versions and release tracks"
description: "Understand Tailscale client versions and release tracks."
---

Last validated Feb 21, 2025

This topic explains Tailscale's client version numbering methodology and the client release tracks we offer. These concepts are helpful for understanding which client to [install][docs-installation] and the process for [updating][docs-update] the client.

## Client version numbers

Tailscale uses an alternating version numbering scheme based on the [Semantic Versioning][xt-semver] method. Version numbering varies between build release tracks.

* Stable builds are identified by even minor version numbers such as 1.70.0, 1.72.0, and 1.74.0. This can also include patch releases such as 1.72.1, 1.72.2, and 1.72.3.
* Release candidate builds are identified by even minor version numbers with a patch version, such as 1.70.1, 1.70.2, and 1.70.3.
* Unstable builds are identified by odd numbers such as 1.71.0, 1.73.0, and 1.75.0.

## Client release tracks

A release track indicates the readiness and reliability of a client build.

### Stable track

Stable track builds are the latest supported and tested version. These builds are considered the most reliable and are included in the [changelog][co-changelog].

Stable builds are available from the following locations:

* The Tailscale [Download][co-download] page.
* The [user interface of an installed client][docs-update-manual] where an update option is available, including Windows and macOS.
* The [Tailscale CLI][docs-cli] command [`tailscale update`][docs-cli-update] where CLI functionality is available, including Linux, Windows, and macOS.
* The app stores for the platforms that we support, such as Apple App Store, Google Play, and Amazon Appstore.
* The Tailscale Packages [stable track][pk-stable] page of the [Tailscale Packages][pk-home] site. The availability of specific platforms varies because not all platforms are updated simultaneously.
  * Typically, updates are concurrent for Linux, Windows, and macOS. Updates for NAS platforms such as Synology and QNAP are released less frequently.
  * Stable builds for iOS and tvOS are exclusively available on the Apple App Store.
  * For macOS, we refer to this as the Standalone variant and recommend this above all other variants. For more information, refer to [Three ways to run Tailscale on macOS][docs-macos-variants].

We release stable builds about every four weeks.

### Release candidate track

Release candidate track builds are offered exclusively on the Tailscale Packages [Release candidates track][pk-release-candidate] page of the [Tailscale Packages][pk-home] site. These are subsequent patch versions of the current stable release being tested in preparation for the stable track. For example, 1.72.1.

When the patch release candidate is deemed stable, it will be moved from this section and added to the stable track. Release candidates are not made available for minor releases, such as version 1.72.0.

We release client builds on an as-needed basis for patch release testing.

### Unstable track

Unstable track builds are offered exclusively on the [unstable track][pk-unstable] page of the [Tailscale Packages][pk-home] site. Unstable builds are the very latest versions available for testing, updated the most frequently, and are not recommended for production environments. For more information, refer to [Install unstable Tailscale clients][docs-install-unstable].

We release unstable builds about every few days.

[co-changelog]: https://tailscale.com/changelog#client

[co-download]: https://tailscale.com/download

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-install-unstable]: /docs/install/unstable

[docs-installation]: /docs/install

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-update-manual]: /docs/features/client/update#manual-updates

[docs-update]: /docs/features/client/update

[pk-home]: https://pkgs.tailscale.com/

[pk-release-candidate]: https://pkgs.tailscale.com/release-candidate

[pk-stable]: https://pkgs.tailscale.com/stable/

[pk-unstable]: https://pkgs.tailscale.com/unstable/

[xt-semver]: https://semver.org
