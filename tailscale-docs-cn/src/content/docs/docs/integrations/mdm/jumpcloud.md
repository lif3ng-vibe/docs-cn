---
title: "Deploy Tailscale with JumpCloud"
description: "You can use the [JumpCloud][xt-jumpcloud] mobile device management (MDM) solution to deploy Tailscale across your organization. JumpCloud lets you distribute and install Tailscale automatically on you"
---

Last validated Jan 5, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

You can use the [JumpCloud][xt-jumpcloud] mobile device management (MDM) solution to deploy Tailscale across your organization. JumpCloud lets you distribute and install Tailscale automatically on your fleet of devices. You can then configure a number of [system policies][docs-mdm-keys], and use JumpCloud to deploy these policies across the devices in your organization. Tailscale system policies set through JumpCloud are supported on Windows, macOS, iOS/tvOS, and Android.

If you need help deploying Tailscale using JumpCloud, or would like to suggest any feature enhancements, contact our [support][co-contact-support-form] or [sales][co-contact-sales] teams.

## Deploying Tailscale on macOS using JumpCloud

> **Note:**
>
> Refer to [Deploy Tailscale on macOS using MDM][docs-macos-mdm] for general best practices and [Approve the Tailscale system extension automatically][docs-macos-mdm-approve-the-extension] to ensure the best end-user experience.

To deploy Tailscale to a fleet of Macs managed through JumpCloud, follow these steps. You'll first configure JumpCloud to fetch and distribute the Tailscale `.pkg` installer. Then, if needed, you'll be able to configure and deploy a set of system policies to customize the behavior of the Tailscale client according to the needs of your organization.

### Distributing the Standalone variant of the client

Follow these steps to add Tailscale to the deployable apps in the JumpCloud admin console:

1. Log in to the JumpCloud admin console for your organization at `https://console.jumpcloud.com`.

2. Select **Software Management** in the sidebar, and then select the **Apple** section to bring up your library of deployed macOS apps.

3. Select the **+** button at the top-left to add a new app. Choose the **Self-hosted** option, which lets you define a new application by providing a URL to a `.pkg` installer.

   *（图：The view to enter the software package URL in the JumpCloud MDM admin console.）*

4. In the **Software Description** field, enter **Tailscale**.

5. In the **Software Package URL** field, enter the download URL for the Tailscale installer, such as `https://pkgs.tailscale.com/stable/Tailscale-1.76.1-macos.pkg`. To determine the URL to use, refer to our [packages server][pk-stable-macos] to find the latest available version of the client. Replace `1.76.1` with the current version number.

> **Warning:**
>
> Do not use the autoupdating `latest` download URL (`https://pkgs.tailscale.com/stable/Tailscale-latest-macos.pkg`). Although this download URL will work initially, it will break as soon as Tailscale releases an update.
>
> JumpCloud does not support URLs that reference changing `.pkg` file versions. When the `.pkg` file is updated from the original version configured in the JumpCloud admin console, package validation will fail.

1. Select the **Validate** button to verify that JumpCloud is able to fetch the installer package. If successful, you'll find the version field populate with the version you chose.

Then, assign the Tailscale app to a device or a group of devices:

1. Select either the **Devices** or **Device Groups** sections, and select one or more device or device groups that you wish to deploy Tailscale on.

2. Select **Save** to confirm the selection. After confirming, JumpCloud will begin to silently run the Tailscale `.pkg` installer on the devices or device groups you selected.

### Deploying system policies on macOS using JumpCloud

We suggest reading the [system policies][docs-mdm-keys] topic to identify configuration options suitable for your organization. Once you know which policies you want to deploy to your fleet of devices, follow these steps to define them in JumpCloud:

1. Log in to the JumpCloud admin console for your organization at `https://console.jumpcloud.com`.

2. Select the **Policy Management** section in the sidebar.

3. Select the **+** button at the top-left of the screen to add a new policy. In the modal window that appears, choose **Mac**.

4. In the list of available policy types, choose **MDM Custom Configuration Profile**, which will let you upload a custom `.mobileconfig` file.

   *（图：The view to choose a policy type in the JumpCloud MDM admin console.）*

5. Choose a descriptive policy name and description (optional). For instance, `Tailscale System Policies`.

   *（图：The view to choose a profile title and description in the JumpCloud MDM admin console.）*

6. In the **Mobile Configuration File** section, upload a `.mobileconfig` file containing your policies. You may find an example within [our macOS MDM setup guide][docs-macos-mdm].

7. Assign the policies to a group of devices or one or more device by selecting items in the **Device Groups** or **Devices** section respectively.

8. Select **Save** to save the policies. JumpCloud will begin deploying the configuration profile to selected devices momentarily. The Tailscale client must be restarted in order for all policies to be applied.

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-jumpcloud]: https://jumpcloud.com/platform/mdm
