---
title: "Deploy Tailscale using Google Workspace"
description: "You can use the Google Workspace mobile device management (MDM) solution to deploy Tailscale across your organization. Google Workspace lets you distribute and install the Tailscale app automatically "
---

Last validated Jan 5, 2026

> **Note:** This integration is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

> **Note:**
>
> MDM support and system policies, including Google Workspace integration, require Tailscale for Android v1.66 or later. The feature is not available on earlier versions.

You can use the Google Workspace mobile device management (MDM) solution to deploy Tailscale across your organization. Google Workspace lets you distribute and install the Tailscale app automatically on your fleet of Android devices. You can then configure a number of system policies, and use Google Workspace to deploy these policies across the Android devices in your organization.

If you need help deploying Tailscale using Google Workspace, or would like to suggest any feature enhancements, contact our [support][co-contact-support-form] or [sales][co-contact-sales] teams.

## Distribute Tailscale for Android using Google Workspace

1. Log into the [Google Workspace Admin console][xt-google-workspace-admin-console].

2. Using the sidebar, select **Apps** and then **Web and mobile apps**.

   *（图：The Google Workspace sidebar）*

3. Select **Add app > Search for apps**.

   *（图：The Google Workspace Search for Apps menu item）*

4. Search for **Tailscale**, and select it from the search results.

   *（图：Tailscale in the Google Workspace search results）*

5. Configure user access for the Tailscale app. At this time, you may choose to distribute Tailscale to all Android users in your organization, or just a subset of them. Then, select **Continue**.

   *（图：The User Access configuration for Tailscale in Google Workspace）*

6. Define the distribution settings for the Tailscale app. Within this configuration screen, you can choose to make the app available to your users for manual download from the Work profile Play Store, or automatically force-install the app on the user's behalf. Note that at this stage you may also set up Tailscale as an always-on VPN, which means that Android will automatically start and restart Tailscale, ensuring it is always running on the device.

   *（图：The Settings configuration for Tailscale in Google Workspace）*

7. Once the above steps are completed, Tailscale should appear in the applications list.

   *（图：Tailscale shown as an app in Google Workspace）*

## Deploy Tailscale system policies on Android using Google Workspace

Once you have completed the steps above and added the Tailscale client to your organization setup for distribution, you may choose to deploy [system policies][docs-mdm-keys] as well. Follow these steps to continue.

1. In the applications list above, select Tailscale. In the screen that appears, scroll down to the **Managed configurations** item, and select **Add managed configuration**.

   *（图：The Add managed configuration button in Google Workspace）*

2. The Tailscale configuration editor will appear. You may now configure Tailscale system policies. For instance, provide [your organization name][docs-org-name-policy] in the **Managed by — organization name** field. When you're done, select **Save** at the bottom right of the screen.

## Deploy Tailscale system policies on ChromeOS using Google Workspace

You can also use Google Workspace to [deploy and configure Tailscale on
managed ChromeOS devices][xt-google-workspace-managed-chromeos]. Managed
policies for Android apps on ChromeOS are provided as JSON object literals,
with keys corresponding to [managed policy keys][docs-mdm-keys].

*（图：Managed configuration for Tailscale on ChromeOS in Google Workspace）*

[co-contact-sales]: https://tailscale.com/contact/sales

[co-contact-support-form]: https://tailscale.com/contact/support#support-form

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-org-name-policy]: /docs/features/tailscale-system-policies#set-your-organization-name

[xt-google-workspace-admin-console]: https://admin.google.com/ac/home

[xt-google-workspace-managed-chromeos]: https://support.google.com/chrome/a/answer/7131624
