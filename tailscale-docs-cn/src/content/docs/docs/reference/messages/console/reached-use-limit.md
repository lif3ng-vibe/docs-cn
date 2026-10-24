---
title: "Reached use limit"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

Reached use limit

## Why you're seeing this message

This issue can occur for the following reasons:

* You are trying to add more users than your current plan permits. This is most common with tailnets on the Personal plan. The Personal plan gives you six free users.
* Your account was not properly updated after a plan change. For example, when upgrading from the Personal plan to the Standard plan.
* Your organization's policies might have a usage that is limiting or preventing access to the tailnet.

## What to do

Here are some things you can try to resolve this issue:

* If your tailnet is on the Personal plan, you can upgrade your plan to accommodate more users. Alternatively, you can remove unnecessary users and add new users.
* If you are seeing this message for a tailnet on the Standard, Premium, or Enterprise plans, there is likely a configuration issue with your account, as there are no user limits for these plans. To resolve this issue, contact [Tailscale Support][co-support].
* Contact your IT administrator to determine if there are restrictions related to Tailscale authentication for your custom/private domain.

## Additional information

* For information about the plans we offer, refer to our [Pricing][co-pricing] page.
* For information about upgrading, refer to [Upgrade your plan][docs-plan-upgrade].

[co-pricing]: https://tailscale.com/pricing

[co-support]: https://tailscale.com/support

[docs-plan-upgrade]: /docs/account/manage-plans/upgrade-plan

[docs-messages]: /docs/reference/messages
