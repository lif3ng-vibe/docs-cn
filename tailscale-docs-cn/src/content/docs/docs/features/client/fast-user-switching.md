---
title: "Fast user switching"
description: "Fast user switching lets you quickly switch between two or more logged-in accounts on the same device, without requiring you to re-authenticate."
---

Last validated Dec 4, 2025

Fast user switching lets you quickly switch between two or more logged-in accounts on the same device, without
requiring you to re-authenticate.

> **Note:** Fast user switching is available for [all plans](https://tailscale.com/pricing).

## How it works

A Tailscale client device lets only one active account log in at a time.
With fast user switching, a user on the client device can quickly switch to an account on
another [tailnet][docs-tailnet].

This will not require re-authentication unless one of the following is true:

* The account being switched to has never been used on the device.
* The device's [node key][bl-tailscale-key-management-node-keys] for the tailnet being switched to has expired.

A device is not able to transmit packets on multiple tailnets simultaneously.
When using fast user switching between tailnets, one tailnet doesn't have knowledge of the other tailnet's existence, nor
whether the client device is also in another tailnet.

Note that the active Tailscale client account is independent of which account is used to log into the
Tailscale [admin console](https://console.tailscale.com/admin). You can have only one active account logged into the Tailscale
client on a device, but if you have multiple browsers open, you can simultaneously use different accounts
to log in to the admin console.

### Adding an account to a device

You can add an account in either the client application (for macOS, iOS, and Windows) or using the
[Tailscale CLI][docs-cli] (for Linux, macOS, and Windows).

#### Adding an account using the client application

#### macOS

If you are running Tailscale v1.60.0 or later:

1. Select the Tailscale icon in the menu bar.
2. Select **Settings**.
3. Select **Accounts**.
4. Select **Add Account**.
5. In the browser window that opens, log in with the desired account to complete the authentication process.

If you are running a Tailscale version earlier than v1.60.0:

1. Select the Tailscale icon in the menu bar.
2. Select the account that is currently logged on.
3. Select **Add another account**.
4. In the browser window that opens, log in with the desired account to complete the authentication
   process.

#### iOS

1. Tap on the profile picture at the top right of the screen to open the **Settings** section.
2. Tap on the account details at the top of the screen to reveal the user switcher.
3. Tap on **Add another account**.
4. In the browser window that opens, log in with the desired account to complete the authentication
   process.

#### Windows

1. Right-click the Tailscale icon in the Windows system tray.
2. Hover over or select the account that is currently signed in. Or the **Accounts** menu if no account is currently active.
3. Select **Add another account**.
4. In the browser window that opens, log in with the desired account to complete the authentication process.

#### Android

1. Tap the upper right-hand icon.
2. Tap the account that is currently logged on.
3. Tap **Add another account**.
4. In the browser window that opens, log in with the desired account to complete the authentication process.

#### Adding an account using the CLI

1. Run the [`tailscale login`][docs-cli-login] command:

   ```shell
   tailscale login
   ```

2. Use the URL that is opened to specify the account that you want to use and complete the authentication process.

### Switching between accounts

You can switch between accounts in either the client application (for macOS, iOS, and Windows) or using
the [Tailscale CLI][docs-cli] (for Linux, macOS, and Windows).

This step assumes you have already [added an additional account][ar-add-account-to-device] to the client device.

#### Switching between accounts using the client application

#### macOS

1. Select the Tailscale icon in the menu bar.
2. Select the account that is currently logged on.
3. Select the account that you want to switch to.

You won't be asked to re-authenticate unless the device's [node key][bl-tailscale-key-management-node-keys]
for the tailnet being switched to has expired.

#### iOS

1. Tap on the profile picture at the top right of the screen to open the **Settings** section.
2. Tap on the account details at the top of the screen to reveal the user switcher.
3. Tap on the account that you want to switch to.

You won't be asked to re-authenticate unless the device's [node key][bl-tailscale-key-management-node-keys]
for the tailnet being switched to has expired.

#### Windows

1. Right-click the Tailscale icon in the Windows system tray.
2. Select the account that is currently logged on.
3. Select the account that you want to switch to.

You won't be asked to re-authenticate unless the device's [node key][bl-tailscale-key-management-node-keys]
for the tailnet being switched to has expired.

#### Android

1. Tap the upper right-hand icon.
2. Tap the account that is currently logged on.
3. Tap the account that you want to switch to.

You won't be asked to re-authenticate unless the device's [node key][bl-tailscale-key-management-node-keys]
for the tailnet being switched to has expired.

#### Switching between accounts using the CLI

Use the [`tailscale switch`][docs-cli-switch] command to switch between accounts.

```shell
tailscale switch alice@example.com
```

You won't be asked to re-authenticate unless the device's [node key][bl-tailscale-key-management-node-keys] for the tailnet being switched to has
expired.

If you previously [set a nickname][ar-setting-a-nickname] for an account, use the nickname when you switch between accounts.

```shell
tailscale switch work
```

### Viewing all accounts

You can access accounts that have authenticated with the device, using either the client application
or the [Tailscale CLI][docs-cli].

#### Viewing account using the client application

#### macOS

1. Select the Tailscale icon in the menu bar.
2. Select the account that is currently logged on.

The list of accounts will be displayed, with a check mark indicating which account is currently logged in.

#### iOS

1. Tap on the profile picture at the top right of the screen to open the **Settings** section.
2. Tap on the account details at the top of the screen to reveal the user switcher.

The list of accounts will be displayed, with a check mark indicating which account is currently logged in.

#### Windows

1. Right-click the Tailscale icon in the Windows system tray.
2. Select the account that is currently logged on.

The list of accounts will be displayed, with the text **(current)** indicating which account is currently logged in.

#### Android

1. Tap the upper right-hand icon.
2. Tap the account that is currently logged on.

The list of accounts will be displayed, with check mark indicating which account is currently logged in.

#### Viewing accounts using the CLI

Run the [`tailscale switch`][docs-cli-switch] command with the `--list` flag:

```shell
tailscale switch --list
```

The list of accounts will be displayed, with an asterisk indicating which account is currently logged in.

```shell
alice@example.com
alice@gmail.com *
```

If you [set a nickname][ar-setting-a-nickname] for an account, the `tailscale switch --list` command displays the
nickname:

```shell
alice@example.com
work *
```

### Setting a nickname

Use the [`tailscale set`][docs-cli-set] command to set a nickname for the currently active account.

Before setting the nickname in this example, let's assume that `tailscale switch --list` shows the
active account is `alice@example.com`.

```shell
tailscale switch --list
```

The output is:

```shell
alice@example.com *
alice@gmail.com
```

Set the nickname of the active account to `work`:

```shell
tailscale set --nickname=work
```

Run `tailscale switch --list` again, and read the nickname `work` appear in the output (instead of `alice@example.com`):

```shell
alice@gmail.com
work *
```

### Logging out of an account

You can log out of an account using either the client application or the [Tailscale CLI][docs-cli].

#### Logging out using the client application

#### macOS

If you are running Tailscale v1.60.0 or later:

1. Select the Tailscale icon in the menu bar.
2. Select **Settings**.
3. Select **Accounts**.
4. Select **Log Out**.

If you are running a Tailscale version earlier than v1.60.0:

1. Select the Tailscale icon in the menu bar.
2. Select the account that is currently logged on.
3. Select **Log out**.

#### iOS

1. Tap on the profile picture at the top right of the screen to open the **Settings** section.
2. Tap on the account details at the top of the screen to reveal the user switcher.
3. Tap **Log out**.

#### Windows

1. Right-click the Tailscale icon in the Windows system tray.
2. Select the account that is currently logged on.
3. Select **Log out**.

#### Android

1. Tap the upper right-hand icon.
2. Tap the account that is currently logged on.
3. Tap **Log out**.

#### Logging out using the CLI

Run the [`tailscale logout`][docs-cli-logout] command to log out the currently active account:

```shell
tailscale logout
```

### Limitations

* You aren't prevented from switching between accounts in the same tailnet. If you don't want to switch
  between accounts in the same tailnet, re-authenticate the device instead of switching between accounts.

[ar-add-account-to-device]: #adding-an-account-to-a-device

[ar-setting-a-nickname]: #setting-a-nickname

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[docs-cli-login]: /docs/reference/tailscale-cli#login

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-switch]: /docs/reference/tailscale-cli#switch

[docs-cli]: /docs/reference/tailscale-cli

[docs-tailnet]: /docs/concepts/tailnet
