---
title: "Deploy Tailscale with Microsoft Intune"
description: "You can use the [Microsoft Intune][xt-intune-landing-page] mobile device management (MDM) solution to deploy Tailscale in your organization. You can configure a number of [system policies][docs-mdm-ke"
---

Last validated Jan 5, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

You can use the [Microsoft Intune][xt-intune-landing-page] mobile device management (MDM) solution to deploy Tailscale in your organization. You can configure a number of [system policies][docs-mdm-keys], and you can then use Microsoft Intune to deploy these policies across devices in your organization. Tailscale system policies through Microsoft Intune are supported on Windows, macOS, iOS, tvOS, and Android.

If you need help deploying Tailscale using Microsoft Intune, or would like to suggest any feature enhancements, contact our [support][co-contact-support-form] or [sales][co-contact-sales] teams.

Follow the steps in this document to get started. On macOS and iOS, you'll create a configuration profile containing a system policy that displays the name of your organization in the Tailscale client as an example. You'll then deploy it to a set of devices already enrolled in Microsoft Intune. On Android, you'll distribute Tailscale and enforce restrictions already available in the Tailscale app by defining a custom configuration.

## Create, upload, and deploy a Tailscale configuration profile for macOS/iOS/iPadOS

> **Note:**
>
> Refer to [Deploy Tailscale on macOS using MDM][docs-macos-mdm] for general best practices and [Approve the Tailscale system extension automatically][docs-macos-mdm-approve-the-extension] to ensure the best end-user experience.

To get started with Tailscale and Microsoft Intune, you'll first need to determine which [system policies][docs-mdm-keys] you wish to impose on your devices. Once you know which system policies to impose and the value for each, you'll then need to create an Apple configuration profile (`.mobileconfig` file) to define them, and upload the profile to the Microsoft Intune admin center.

1. Paste the contents of our [configuration profile template][docs-macos-mdm-deploy-policies-profile], which provides preset values for the **ManagedByOrganizationName** and **IPAddressCopiedAlertSuppressed** policies into a new XML file called `Tailscale.mobileconfig`. This XML file with the `.mobileconfig` extension will become your configuration profile.
2. Log in to the [Microsoft Intune admin center][xt-intune-admin-center].
3. In the sidebar, select **Devices**, then choose **Configuration profiles** under the **Policy** section.
4. A list of currently configured profiles will appear. Select the **Create** menu item, then choose **New Policy** from the dropdown menu that will appear.
5. Select the platform you're looking to configure using the **Platform** dropdown menu. This will be either **macOS** or **iOS/iPadOS**.
6. Choose **Templates** as the **Profile type**.
7. Select the **Custom** template, and confirm with the **Create** button at the bottom of the templates list.
8. Set a descriptive name and an optional description for the policy. For instance, `Tailscale macOS system policies`.

   *（图：Set name and description for a custom configuration profile.）*
9. In the following **Configuration settings** step, enter a name for the policy that will be displayed to users, and upload the `.mobileconfig` previously created. Use the **Device** deployment channel if asked. Select **Next** to continue.

   *（图：Upload the .mobileconfig file previously created.）*
10. Select the correct assignments in the **Assignments** tab. You can use the **Add all users** shortcut if you wish to deploy the configuration profile to all users and groups in your organization. Alternatively, select users and groups to deploy the policies to.

    *（图：Select users and groups to assign the policy.）*
11. Select **Next** to continue to the **Review** step. If everything checks out, select **Create** to deploy the policy.

The steps above are valid for both macOS and iOS deployments. If you have both macOS and iOS devices in your organization, follow the instructions twice. Creating two separate `.mobileconfig` files using the proper application bundle identifier for each platform, and then choose the right platform when asked by the Intune admin center.

Once you have followed these steps, Microsoft Intune will begin deploying the profile to all the users and groups you selected. After rebooting the device, each enrolled client should display the organization name in the Tailscale client menu as set in the sample configuration profile used.

## Create, upload, and deploy a Tailscale configuration profile for Windows

> **Note:**
>
> Refer to [Deploy Tailscale on Windows using MDM][docs-windows-mdm] for general best practices.

To get started with Tailscale and Microsoft Intune, you'll first need to determine which [system policies][docs-mdm-keys] you wish to impose on your devices. Once you know which system policies to impose and the value for each, we recommend using the provided Tailscale ADMX file to import policies for a Tailscale configuration profile to be used with Microsoft Intune. [ADMX files][xt-ms-admx-overview] are a way to define group policies on Windows.

1. Download the Tailscale ADMX file and ADML file from the [Tailscale repository][xt-gh-tailscale-windows-policy].
2. Log in to the [Microsoft Intune admin center][xt-intune-admin-center].
3. In the sidebar, select **Devices**, then choose **Configuration profiles** under the **Policy** section.

   *（图：View of the configuration profiles.）*
4. First, import the Tailscale ADMX file. Select **Import ADMX**, then select the **Import** button.

   *（图：Import the Tailscale ADMX file.）*
5. Upload the Tailscale ADMX and Tailscale ADML file. Select **Next**, then **Create**. You can select **Refresh** to check the status of the upload and template's availability.
6. Return to the **Policies** section. A list of currently configured profiles will appear. Select the **Create** menu item, then choose **New Policy** from the dropdown menu that will appear.
7. Select **Windows 10 and later** using the **Platform** dropdown menu.
8. Choose **Templates** as the **Profile type**.
9. Select **Imported Administrative templates (Preview)**.

   *（图：Select Imported Administrative templates (Preview).）*
10. Set a descriptive name and an optional description for the policy. For instance, `Tailscale windows policies`.

    *（图：Set name and description for a custom configuration profile.）*
11. Now you will find the Tailscale setting available for configuration.

    *（图：The Tailscale setting is now available for configuration.）*

    When you select the Tailscale settings, you can browse through policies that you can use and set their values.

    *（图：Select the Tailscale settings to browse through available policies and set their values.）*

    Once you set a policy's value, the state of the policy should be shown in the Tailscale settings.

    *（图：View the state of a policy.）*
12. Once you configure the policies you want to use, select **Next** to go to the **Scope Tags** section. You can assign a tag for the configuration profile if you have one. If you don't have any tags, select the **Default** option.

    *（图：Assign a tag to the configuration profile, or select the default.）*
13. Choose **Next**, and select your assignments in the **Assignments** tab. You can choose **Add all users** to deploy the configuration profile to all users, or select specific users or groups of users.

    *（图：Select users and groups to assign the policy.）*
14. Select **Next** and review your profile settings before selecting **Create**.

    *（图：Review your profile settings before selecting Create.）*

Once you have followed these steps, Microsoft Intune will begin deploying the profile to all the users and groups you selected. After rebooting the device, each enrolled client should display the organization name in the Tailscale client menu as per the sample configuration profile used. For more documentation on importing ADMX files, check the [Microsoft Intune documentation][xt-intune-admx].

## Deploy Tailscale for Android using Microsoft Intune

Configuring Microsoft Intune to deploy Tailscale is done in two steps. You'll begin by adding the Tailscale app as a Managed Google Play application. Then, you can optionally decide to deploy system policies using an Android managed configuration. This will let you configure the Tailscale Android client to fit the needs of your organization.

Before continuing, ensure that all Android devices you wish to deploy Tailscale to are already properly enrolled in Intune. Because we are going to add Tailscale as a *Managed Google Play app*, you will also need to connect your Intune account to your Managed Google Play account. For more information on the account connection process, refer to the documentation published by Microsoft in [Connect your Intune account to your Managed Google Play account][xt-intune-managed-google-play].

### Adding the Tailscale app to Microsoft Intune

1. Log in to the [Microsoft Intune admin center][xt-intune-admin-center].
2. Select **Apps** > **All apps** > **Add**, then select **Managed Google Play app**.
3. Search for **Tailscale** and confirm.
4. You might want to assign Tailscale to a group of users, so that Tailscale will be deployed automatically to these users' devices.

### Deploying Tailscale system policies on Android using Intune

Once Tailscale has been configured as a deployed app in Intune, you can optionally configure a set of [system policies][docs-mdm-keys] that will be enforced on the enrolled Android devices.

1. Log in to the [Microsoft Intune admin center][xt-intune-admin-center].
2. Select **Apps** > **App configuration policies** > **Add** > **Managed devices**.
3. Pick a descriptive name for the policy, such as *Tailscale System Policies*. Choose **Android** as the platform.
4. Select **Associated app** to display a list of configured applications. If you followed the previous steps, this list should include Tailscale. Select it to continue.
5. Choose **Configuration settings**, then **Use configuration designer**, and then select **Add** to pick from the list of [available system policies][docs-mdm-keys].
6. Enter your preferred system policy values.
7. Select **OK** to save the configuration.

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[docs-macos-mdm-deploy-policies-profile]: /docs/integrations/mdm/mac#deploying-system-policies-in-a-configuration-profile

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-windows-mdm]: /docs/integrations/mdm/windows-mdm

[xt-gh-tailscale-windows-policy]: https://github.com/tailscale/tailscale/tree/main/docs/windows/policy

[xt-intune-admin-center]: https://intune.microsoft.com/?ref=AdminCenter

[xt-intune-admx]: https://learn.microsoft.com/en-us/mem/intune/configuration/administrative-templates-import-custom

[xt-intune-landing-page]: https://www.microsoft.com/en-us/security/business/microsoft-intune

[xt-intune-managed-google-play]: https://learn.microsoft.com/en-us/mem/intune/enrollment/connect-intune-android-enterprise

[xt-ms-admx-overview]: https://learn.microsoft.com/en-us/windows/client-management/understanding-admx-backed-policies
