---
title: "Tailscale messages"
description: "Tailscale client and admin console messages to help you understand, manage, and troubleshoot tailnet-related issues."
---

Last validated Jan 30, 2026

Informational and error messages can appear in the admin console, the Tailscale client UI, and the Tailscale client command-line interface (CLI). Understanding the context and purpose of these different message types can help you manage and troubleshoot issues related to your tailnet.

If the information in these topics doesn't resolve your issue and the message persists, contact [Tailscale Support][co-support].

## Admin console messages

* [Authentication failed while retrieving details from your identity provider][docs-messages-console-auth-failed-sso]
* [Failed to load sharing information][docs-messages-console-sharing-failure]
* [Login name change detected][docs-messages-console-login-name-change]
* [Multiple users with login][docs-messages-console-multi-user-login]
* [No auth service][docs-messages-console-no-auth-service]
* [Reached use limit][docs-messages-console-reached-use-limit]
* [You don't have access to the admin console][docs-messages-console-no-access]
* [Your account is not an administrator][docs-messages-console-account-not-admin]
* [Your organization has restricted members from joining external tailnets][docs-messages-console-org-has-restrictions]

## Client messages

* [Coordination server reports an issue][docs-messages-client-control-health]
* [Could not apply configuration][docs-messages-client-apply-disk-config]
* [Docker with stateful filtering][docs-messages-client-docker-stateful-filtering]
* [Encrypted connection failed][docs-messages-client-tls-connection-failed]
* [Invalid packet filter][docs-messages-client-invalid-packet-filter]
* [Linux DNS configuration issue][docs-messages-client-resolv-conf-overwritten]
* [Local log misconfiguration][docs-messages-client-local-log-config-error]
* [MagicSock function not running][docs-messages-client-magicsock-receive-func-error]
* [Network down][docs-messages-client-network-down]
* [Network map response timeout][docs-messages-client-mapresponse-timeout]
* [No home relay server][docs-messages-client-no-derp-home]
* [Out of sync][docs-messages-client-not-in-map-poll]
* [Relay server unavailable][docs-messages-client-no-derp-connection]
* [Security update available][docs-messages-client-security-update-available]
* [Tailscale blocked by Screen Time][docs-messages-client-macos-screen-time-controlclient]
* [Tailscale SSH and SELinux][docs-messages-client-ssh-unavailable-selinux-enabled]
* [Update available][docs-messages-client-update-available]
* [Using an unstable version][docs-messages-client-is-using-unstable-version]
* [Windows network configuration failed][docs-messages-client-set-network-category-failed]

[co-support]: https://tailscale.com/contact/support

[docs-messages-client-apply-disk-config]: /docs/reference/messages/client/could-not-apply-config

[docs-messages-client-control-health]: /docs/reference/messages/client/coordination-server-issue

[docs-messages-client-docker-stateful-filtering]: /docs/reference/messages/client/docker-stateful-filtering

[docs-messages-client-invalid-packet-filter]: /docs/reference/messages/client/invalid-packet-filter

[docs-messages-client-is-using-unstable-version]: /docs/reference/messages/client/using-unstable-version

[docs-messages-client-local-log-config-error]: /docs/reference/messages/client/local-log-config-error

[docs-messages-client-macos-screen-time-controlclient]: /docs/reference/messages/client/screen-time-controlclient

[docs-messages-client-magicsock-receive-func-error]: /docs/reference/messages/client/magicsock-receive-func-error

[docs-messages-client-mapresponse-timeout]: /docs/reference/messages/client/network-map-response-timeout

[docs-messages-client-network-down]: /docs/reference/messages/client/network-status

[docs-messages-client-no-derp-connection]: /docs/reference/messages/client/no-derp-connection

[docs-messages-client-no-derp-home]: /docs/reference/messages/client/no-derp-home

[docs-messages-client-not-in-map-poll]: /docs/reference/messages/client/not-in-map-poll

[docs-messages-client-resolv-conf-overwritten]: /docs/reference/messages/client/resolv-conf-overwritten

[docs-messages-client-security-update-available]: /docs/reference/messages/client/security-update-available

[docs-messages-client-set-network-category-failed]: /docs/reference/messages/client/set-network-category-failed

[docs-messages-client-ssh-unavailable-selinux-enabled]: /docs/reference/messages/client/ssh-unavailable-selinux-enabled

[docs-messages-client-tls-connection-failed]: /docs/reference/messages/client/tls-connection-failed

[docs-messages-client-update-available]: /docs/reference/messages/client/update-available

[docs-messages-console-account-not-admin]: /docs/reference/messages/console/account-not-admin

[docs-messages-console-auth-failed-sso]: /docs/reference/messages/console/auth-failed-sso

[docs-messages-console-login-name-change]: /docs/reference/messages/console/login-name-change

[docs-messages-console-multi-user-login]: /docs/reference/messages/console/multi-user-login

[docs-messages-console-no-access]: /docs/reference/messages/console/no-access

[docs-messages-console-no-auth-service]: /docs/reference/messages/console/no-auth-service

[docs-messages-console-org-has-restrictions]: /docs/reference/messages/console/org-has-restrictions

[docs-messages-console-reached-use-limit]: /docs/reference/messages/console/reached-use-limit

[docs-messages-console-sharing-failure]: /docs/reference/messages/console/sharing-failure
