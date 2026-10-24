---
title: "Using app-based split tunneling on Android"
description: "App-based split tunneling is a feature in the Android Tailscale client that lets you decide which apps on the Android device will bypass or be forced to use a Tailscale network (known as a tailnet). I"
---

Last validated Jan 5, 2026

App-based split tunneling is a feature in the Android Tailscale client that lets you decide which apps on the Android device will bypass or be forced to use a Tailscale network (known as a tailnet). It provides flexibility and control over your network traffic on an app-specific basis. When an app is included or excluded using app-based split tunneling, traffic routing and DNS forwarding will be configured according to your rules.

> **Note:**
>
> App-based split tunneling for Android requires Tailscale v1.70 or later.

Here are some scenarios when you might want to exclude apps from using Tailscale:

* When using streaming apps such as Netflix or Prime Video to avoid potential geo-blocking restrictions caused by using an [exit node][docs-exit-nodes].
* When your banking app requires you to disable VPN connectivity before the app can be used.

## Types of app-based split tunneling

There are two types of app-based split tunneling behaviors available:

* Route all apps automatically and manually specify the applications that you want to exclude from using Tailscale. This is the default behavior.
* Route no apps automatically and specify the set of apps that will be forced to use Tailscale. This option requires a [mobile device management][docs-mdm] (MDM) solution for Android devices.

## Exclude apps from the client

You can configure app-based split tunneling exclusions directly from the app settings. Any excluded app selected in the Tailscale app settings will access the internet directly without routing through Tailscale. This is useful for any apps that require direct internet access for performance or functionality reasons. When Tailscale is disabled for an app using split tunneling, its traffic and DNS queries won't be handled by Tailscale.

1. Open the Tailscale app on the Android device and make sure it's connected to your tailnet.
2. Tap on your avatar at the top of the screen and select **App-based split tunneling**.
3. In the list displaying the applications installed on your Android device, check the box next to each app you want to exclude from the tailnet. These apps will access the internet directly. Apps not selected will continue to use Tailscale.
4. Leave the **Settings** page to save your configuration.

## Force and exclude apps using MDM

If you're a system administrator deploying Tailscale for Android, you can specify which apps are allowed and prohibited from communicating over your tailnet.

To allow specific apps to communicate in your tailnet, use the [`IncludedPackageNames` system policy][docs-mdm-keys-included-package-names]. When a list of application package names is specified using the policy, Tailscale will exclude all apps. Only the specified apps will use Tailscale. As of Tailscale v1.70, this behavior must be configured using system policies, which requires management using MDM. Refer to the [list of Tailscale system policies][docs-mdm-keys] for more information.

To exclude specific apps from communicating in your tailnet, use the [`ExcludedPackageNames` system policy][docs-mdm-keys-excluded-package-names], using your [MDM solution][docs-mdm].

## Default app exclusions

To improve the user experience out of the box, a small set of apps and system services is always excluded from routing and DNS through Tailscale. These apps do not work properly when a VPN is enabled, and are therefore excluded by default:

* Android Auto (`com.google.android.projection.gearhead`)
* Google Chromecast (`com.google.android.apps.chromecast.app`)
* GoPro (`com.gopro.smarty`)
* RCS/Jibe messaging services (`com.google.android.apps.messaging`)
* Sonos (`com.sonos.acr` and `com.sonos.acr2`)

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-mdm]: /docs/mdm

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-keys-excluded-package-names]: /docs/features/tailscale-system-policies#set-excluded-applications

[docs-mdm-keys-included-package-names]: /docs/features/tailscale-system-policies#set-included-applications
