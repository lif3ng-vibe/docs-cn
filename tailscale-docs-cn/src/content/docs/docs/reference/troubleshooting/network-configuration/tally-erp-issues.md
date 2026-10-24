---
title: "Troubleshoot Tally ERP issues"
description: "Tally appears to bind to interfaces in a way which conflicts with VPN software like Tailscale. If the license server is running on the local device, fix this by changing the Tally configuration throug"
---

Last validated Mar 16, 2026

Tally appears to bind to interfaces in a way which conflicts with VPN software like Tailscale. If the license server is running on the local device, fix this by changing the Tally configuration through the UI or by editing `Tally.ini` to use `127.0.0.1:9999` as the license server instead of using the PC hostname.
