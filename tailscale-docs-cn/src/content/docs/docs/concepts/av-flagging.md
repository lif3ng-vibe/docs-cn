---
title: "Antivirus flagging of the Tailscale client"
description: "What to do when Tailscale is being flagged by antivirus software and how to report legitimate concerns."
---

Last validated Apr 1, 2025

The Tailscale client can sometimes be falsely flagged by antivirus software, especially with new Tailscale releases, because many antivirus engines use machine learning and other automated tools that can result in false positives.

> **Note:**
>
> Do not disregard your antivirus alerts. There are possible scenarios of a supply chain attack or malware masquerading as the Tailscale client, even though this has not yet happened.

You can compare the antivirus alert details to the recent changes in [our client changelog][co-changelog-client] to determine when an alert corresponds to intended new behavior of Tailscale.

## Manage false positives

If your antivirus software flags the Tailscale client, and you are confident that the warning is a false positive, you can take the following actions:

* Report the false positive to the antivirus vendor.
* Add Tailscale to your local allow list in your antivirus software settings. When Tailscale is upgraded, your antivirus may flag the new version again, and you may need to re-add the Tailscale client to your allow list, depending on which antivirus software you use.
* Email screenshots and information about the antivirus software you are using, including the name and version, to `security@tailscale.com`. This may result in us contacting the antivirus vendor directly to raise the urgency.

## Manage true positives

If you believe the antivirus software is flagging a true positive, or you are not sure, you can email `security@tailscale.com` with the following information:

* Screenshots that display the flagged warning message in your antivirus software.
* Details about the antivirus product you are using, including the name and version.
* Information about recent Tailscale client upgrades or tailnet changes.
* A description of why you suspect that the flagging is a true positive.

[co-changelog-client]: https://tailscale.com/changelog#client
