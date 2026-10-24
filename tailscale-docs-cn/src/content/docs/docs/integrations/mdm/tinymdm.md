---
title: "Deploy Tailscale using TinyMDM"
description: "You can use the [TinyMDM][xt-tinymdm-marketing-website] mobile device management (MDM) solution to deploy Tailscale across your organization. TinyMDM lets you distribute and install Tailscale automati"
---

Last validated Jan 5, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

> **Note:**
>
> MDM support and system policies, including TinyMDM integration, require Tailscale for Android v1.66 or later. The feature is not available on earlier versions.

You can use the [TinyMDM][xt-tinymdm-marketing-website] mobile device management (MDM) solution to deploy Tailscale across your organization. TinyMDM lets you distribute and install Tailscale automatically on your fleet of Android devices. You can then configure a number of system policies, and use TinyMDM to deploy these policies across the devices in your organization.

If you need help deploying Tailscale using TinyMDM, or would like to suggest any feature enhancements, contact our [support][co-contact-support-form] or [sales][co-contact-sales] teams.

## Distribute Tailscale for Android using TinyMDM

> **Note:**
>
> Refer to [Deploy Tailscale on macOS using MDM][docs-macos-mdm] for general best practices and [Approve the Tailscale system extension automatically][docs-macos-mdm-approve-the-extension] to ensure the best end-user experience.

Follow these steps to deploy the Tailscale APK onto devices enrolled in your TinyMDM account.

1. Log into the [TinyMDM admin console][xt-tinymdm-admin-console].
2. Select **Enterprise approved apps** in the sidebar.

   *（图：Approved apps list in TinyMDM）*
3. We are going to deploy the latest version of the Tailscale client as available in the Google Play Store. In the **Add applications to the company catalog** screen that appears, select **Public Apps**. If you wish to manually deploy a Tailscale APK you fetched manually (for instance, to keep devices on a different version of the client), choose **Private apps** at this step.

   *（图：Add applications to the company catalog dialog）*
4. Search for **Tailscale**, and select the **Select** input in the listing that appears among the search results.

   *（图：Tailscale in the Android Play Store）*
5. The **Add applications to the company catalog** dialog appears. Select the **Add applications to the company catalog** checkbox to add Tailscale to an already existing device policy, and choose either **Approve** or **Approve and install**. You may also select **Add app to all policies** to deploy Tailscale to all enrolled Android devices in your organization.
6. Upon completing this step, Tailscale should appear in the **Approved apps list**. If **Approve and install** was selected in the previous step, enrolled devices will begin installing the Tailscale client.

   *（图：Tailscale in the Approved apps list page）*

## Deploy Tailscale system policies on Android using TinyMDM

Once you have finished adding the Tailscale client to your device policies for distribution, you may choose to deploy system policies. Follow these steps to continue.

1. Log into the [TinyMDM admin console][xt-tinymdm-admin-console].
2. Select **Policies** in the sidebar.
3. Choose a policy whose users you want to deploy Tailscale for, then select its **Edit** button.

   *（图：Edit button for a policy）*
4. In the policy editor that appears, identify and expand the **Apps management** section.
5. Because it was added during the previous steps, Tailscale should be listed among the available applications here.

   *（图：Tailscale in the Policy approved apps list）*
6. Open the settings menu for the Tailscale item, and choose **Configuration**.

   *（图：Configuration menu item）*
7. The Tailscale configuration editor will appear. You may now configure Tailscale system policies. For instance, provide [your organization name][docs-org-name-policy] in the **Managed by — organization name** field. When you're done, select **Save** at the top right of the screen.

   *（图：Configuration page for Tailscale）*

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-macos-mdm-approve-the-extension]: /docs/integrations/mdm/mac#approve-the-tailscale-system-extension-automatically

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-org-name-policy]: /docs/features/tailscale-system-policies#set-your-organization-name

[xt-tinymdm-admin-console]: https://www.tinymdm.net/console

[xt-tinymdm-marketing-website]: https://www.tinymdm.net
