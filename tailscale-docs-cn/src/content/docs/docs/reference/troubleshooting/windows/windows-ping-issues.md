---
title: "Troubleshoot Windows ping issues"
description: "Windows generally has aggressive firewall rules set up, even for ICMP (ping) traffic (both incoming and outgoing). Be sure that you've enabled your Windows devices to be able to both send and receive "
---

Last validated Feb 18, 2026

Windows generally has aggressive firewall rules set up, even for ICMP (ping) traffic (both incoming and outgoing). Be sure that you've enabled your Windows devices to be able to both send and receive ICMP traffic.

A faster, but riskier approach to test this is to (temporarily) disable the Windows firewalls and check for any impact. Refer to [issue #454][xt-gh-tailscale-issue-454] for updates on improving related notifications and user experience.

[xt-gh-tailscale-issue-454]: https://github.com/tailscale/tailscale/issues/454
