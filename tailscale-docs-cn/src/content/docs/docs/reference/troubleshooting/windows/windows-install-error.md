---
title: "Troubleshoot Windows installation error"
description: "The Tailscale client installer requires the following Windows system services to be running:"
---

Last validated Feb 18, 2026

The Tailscale client installer requires the following Windows system services to be running:

* `Dnscache`
* `iphlpsvc`
* `netprofm`
* `WinHttpAutoProxySvc`

If the installer does not detect that these services are running, it will automatically fail. For official Microsoft guidance on disabling system services, refer to [Guidance on disabling system services on Windows Server 2016 with Desktop Experience][xt-windows-services].

[xt-windows-services]: https://learn.microsoft.com/en-us/windows-server/security/windows-services/security-guidelines-for-disabling-system-services-in-windows-server
