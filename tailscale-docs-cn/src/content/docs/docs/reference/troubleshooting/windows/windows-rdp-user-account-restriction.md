---
title: "Troubleshoot Windows RDP user account restriction"
description: "Users in a Windows domain environment might encounter the following error when attempting to connect to another machine using Remote Desktop Protocol (RDP):"
---

Last validated Feb 18, 2026

Users in a Windows domain environment might encounter the following error when attempting to connect to another machine using Remote Desktop Protocol (RDP):

```shell
A user account restriction (for example, a time-of-day restriction)
is preventing you from logging on. For assistance, contact your system
administrator or technical support.
```

This can occur in an environment where the following is true:

* [MagicDNS][docs-magic-dns] is enabled in the tailnet.
* The remote machine is accessed by its unqualified name or MagicDNS domain name instead of the FQDN in the Active Directory domain.
  * An example of an unqualified name is `win11e`.
  * An example of a MagicDNS name is `win11e.example.ts.net`.
  * An example of an FQDN in Active Directory is `win11e.example.com`.
* Kerberos authentication is required due to [NTLM][xt-wikipedia-ntlm] authentication [restrictions][xt-windows-ntlm-restrict] in the domain.
* A [service principal name][xt-windows-spn] (SPN) is not configured for the remote machine.

We recommend using the [`setspn`][xt-windows-setspn] command to register an SPN. To do this, run the following command as a domain administrator:

```powershell
setspn -S TERMSRV/win11e.example.ts.net WIN11E
```

In the example above, `win11e.example.ts.net` is the hostname in the tailnet, and `WIN11E` is the account name in Active Directory.

[docs-magic-dns]: /docs/features/magicdns

[xt-wikipedia-ntlm]: https://en.wikipedia.org/wiki/NTLM

[xt-windows-ntlm-restrict]: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/jj865668\(v=ws.10\)

[xt-windows-setspn]: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc731241\(v=ws.10\)

[xt-windows-spn]: https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names
