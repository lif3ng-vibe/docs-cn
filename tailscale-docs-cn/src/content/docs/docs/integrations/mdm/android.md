---
title: "Deploy Tailscale on Android using MDM"
description: "This page contains technical information useful to system administrators deploying Tailscale for Android in a corporate environment using MDM solutions such as [Google Workspace][docs-mdm-google-works"
---

Last validated Aug 18, 2025

This page contains technical information useful to system administrators deploying Tailscale for Android in a corporate environment using MDM solutions such as [Google Workspace][docs-mdm-google-workspace], [Microsoft Intune][docs-mdm-microsoft-intune], or [TinyMDM][docs-mdm-tinymdm], among other tools.

We are always working on providing more options for administrators to programmatically manage their Tailscale deployments. If you are deploying Tailscale on a fleet of Android devices, and feel the need for a specific configuration option that is currently missing on this page, contact our support team.

> **Note:**
>
> MDM support and system policies require Tailscale for Android v1.66 or later. The feature is not available on earlier versions.

## Distributing Tailscale on Android

The application ID of our Android app is `com.tailscale.ipn`.

The recommended distribution method for our enterprise customers is the [Google Play Store][xt-google-play-store-listing]. Just like on all the other platforms we support, Tailscale Android builds published on the Play Store undergo quality assurance testing before each release, and app updates are distributed using phased rollouts to minimize the impact of any regressions.

To distribute Tailscale on Android devices enrolled in your MDM solution directly from the Play Store, refer to the documentation provided by its vendor. Most MDM solutions will require that you first connect your admin console to [Managed Google Play][xt-managed-google-play], and then select the Tailscale app listing among the available apps.

Note that Tailscale is an [open-source][xt-github-android] project, and as such, it is important to verify the authenticity of the binaries distributed to your end-users. To this end, we strongly recommend that enterprise users source their binaries from the official Tailscale listing on the Play Store which are built, verified, and distributed directly by the Tailscale team.

## Using Tailscale system policies on Android

Once you have deployed Tailscale for Android using MDM to your enrolled devices, you can use a [managed configuration][xt-android-managed-configuration] to enforce system policies on the Tailscale install. Deploying system policies lets you configure specific settings of the Tailscale client on behalf of the user, providing an easier setup process and reducing confusion for non-tech-savvy users.

Refer to our [system policies][docs-mdm-keys] for the full list of configurable settings.

The system policies available on Android are listed in the [`app_restrictions.xml` file][xt-restrictions-xml], part of the application APK. When you configure the Tailscale Android app using your preferred MDM solution, the configuration interface will dynamically discover the available restrictions, and let you define values for each.

For instance, TinyMDM will display the following configuration UI to configure Tailscale as part of a policy:

*（图：The TinyMDM configuration page for Tailscale）*

Refer to the instructions provided by your MDM solution vendor to configure app restrictions. On these pages, we have provided configuration steps for [Google Workspace][docs-mdm-google-workspace] and [TinyMDM][docs-mdm-tinymdm], which are two commonly used Android MDM solutions.

[docs-mdm-google-workspace]: /docs/integrations/mdm/google-workspace

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[docs-mdm-tinymdm]: /docs/integrations/mdm/tinymdm

[xt-android-managed-configuration]: https://developer.android.com/work/managed-configurations

[xt-github-android]: https://github.com/tailscale/tailscale-android

[xt-google-play-store-listing]: https://play.google.com/store/apps/details?id=com.tailscale.ipn

[xt-managed-google-play]: https://developers.google.com/android/work/overview#managed_google_play

[xt-restrictions-xml]: https://github.com/tailscale/tailscale-android/blob/main/android/src/main/res/xml/app_restrictions.xml
