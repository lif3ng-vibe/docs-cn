---
title: "排查 Windows RDP 用户账户限制"
description: "Windows 域环境中的用户在尝试使用远程桌面协议（RDP）连接另一台机器时，可能遇到以下错误："
---

最后验证于 Feb 18, 2026

Windows 域环境中的用户在尝试使用远程桌面协议（RDP）连接另一台机器时，可能遇到以下错误：

```shell
A user account restriction (for example, a time-of-day restriction)
is preventing you from logging on. For assistance, contact your system
administrator or technical support.
```

在同时满足以下条件的环境中可能出现此问题：

* tailnet 中启用了 [MagicDNS][docs-magic-dns]。
* 访问远程机器时用的是不带域后缀的名称或 MagicDNS 域名，而不是 Active Directory 域中的 FQDN。
  * 不带域后缀名称的示例：`win11e`。
  * MagicDNS 名称的示例：`win11e.example.ts.net`。
  * Active Directory 中 FQDN 的示例：`win11e.example.com`。
* 由于域中存在 [NTLM][xt-wikipedia-ntlm] 认证[限制][xt-windows-ntlm-restrict]，必须使用 Kerberos 认证。
* 远程机器未配置[服务主体名称][xt-windows-spn]（SPN）。

我们建议使用 [`setspn`][xt-windows-setspn] 命令注册 SPN。为此，请以域管理员身份运行以下命令：

```powershell
setspn -S TERMSRV/win11e.example.ts.net WIN11E
```

在上面的示例中，`win11e.example.ts.net` 是 tailnet 中的主机名，`WIN11E` 是 Active Directory 中的账户名。

[docs-magic-dns]: /docs/features/magicdns

[xt-wikipedia-ntlm]: https://en.wikipedia.org/wiki/NTLM

[xt-windows-ntlm-restrict]: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/jj865668\(v=ws.10\)

[xt-windows-setspn]: https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc731241\(v=ws.10\)

[xt-windows-spn]: https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names
