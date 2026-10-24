---
title: "Configure Tailscale clients to use a custom control server"
description: "Configure Tailscale clients to use a custom control server such as Headscale."
---

Last validated Sep 21, 2026

The Tailscale clients let you specify a custom control server URL instead of the default `https://controlplane.tailscale.com` server. If you are using a self-managed deployment of [Headscale][bl-headscale] as your control plane, use your Headscale instance's URL.

## Add a custom control server

#### macOS

If you're using the [App Store or Standalone variants][docs-macos-variants] of the Tailscale client, you can add a custom control server URL in the Tailscale user interface:

> **Note:**
>
> The following instructions only work when at least one other tailnet has been authenticated in the client. If no other tailnets have been added to the device, use the Tailscale CLI instructions instead.

1. Select the Tailscale icon in the macOS menu bar.
2. Choose **Settings** from the menu.
3. Select the **Accounts** tab.
4. Select the down arrow in the lower-left corner of the window.
5. Enter your custom control server URL and select **Add account**.

Alternatively, to sign in with a custom control server URL from the Tailscale CLI, run the following command. Replace `<URL>` with your custom control server URL.

```shell
tailscale login --login-server=<URL>
```

#### Windows

The Tailscale user interface for Windows doesn't support adding a custom control server URL. You can use the Tailscale CLI or edit registry settings instead.

To sign in with a custom control server URL from the Tailscale CLI, run the following command. Replace `<URL>` with your custom control server URL.

```powershell
tailscale login --login-server=<URL>
```

For more information, refer to [Deploy Tailscale on Windows using MDM][docs-deploy-tailscale-windows-mdm-registry] to use a custom control server URL by editing the `LoginURL` registry value. An MDM solution is not required. You can also edit the registry value directly.

#### Linux

Run the following command to authenticate to a custom control server. Replace `<URL>` with your custom control server URL.

```shell
tailscale login --login-server=<URL>
```

#### iOS

1. Tap the user profile icon in the top-right corner of the Tailscale app to open **Settings**.
2. If you are not signed in to any other tailnets, tap **Log in**. Otherwise, tap the signed-in user.
3. Tap the  menu in the top-right corner, then select **Use a custom coordination server**.
4. Enter the custom control server URL and tap **Log in**.

#### Android

1. Tap the user profile icon in the top-right corner of the Tailscale app to open **Settings**.
2. If you are not signed in to any other tailnets, tap **Log in**. Otherwise, tap the signed-in user.
3. Tap the  menu in the top-right corner, then select **Use an alternate server**.
4. Enter the custom control server URL and tap **Log in**.

#### tvOS

1. Open the tvOS **Settings** app.
2. Select **Apps**.
3. Select **Tailscale**.
4. Select **URL** under **Alternate coordination server URL**.
5. Enter the custom control server URL and select **Done**.
6. Return to the Tailscale app and sign in.

## Remove a custom control server

#### macOS

To remove a custom control server account using the Tailscale user interface:

1. Select the Tailscale icon in the macOS menu bar.
2. Choose **Settings** from the menu.
3. Select the **Accounts** tab.
4. Select the custom control server account.
5. Log out of the account.

Alternatively, use the Tailscale CLI:

```shell
tailscale logout
```

#### Windows

If you authenticated to the custom control server using the Tailscale CLI, run:

```powershell
tailscale logout
```

If you configured the custom control server using the `LoginURL` registry value, remove the value from the applicable registry path:

```text
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale
```

or:

```text
HKEY_CURRENT_USER\SOFTWARE\Policies\Tailscale
```

If an MDM solution manages the `LoginURL` value, remove or update the policy using that solution instead. Otherwise, the policy might be applied again.

#### Linux

To log out of the custom control server, run:

```shell
tailscale logout
```

If you need to completely reset the locally stored Tailscale state:

1. Stop `tailscaled`.

   ```shell
   sudo systemctl stop tailscaled
   ```

2. Remove the state file.

   ```shell
   sudo rm /var/lib/tailscale/tailscaled.state
   ```

3. Start `tailscaled`.

   ```shell
   sudo systemctl start tailscaled
   ```

> **Warning:**
>
> Removing the `tailscaled` state file deletes the locally stored Tailscale state for the device. Use this procedure only when logging out doesn't reset the client as needed.

#### iOS

1. Tap the user profile icon in the top-right corner of the Tailscale app to open **Settings**.
2. Tap the active account details to open the account switcher.
3. Press and hold the custom control server account you want to remove.
4. Confirm that you want to remove the account.

> **Note:**
>
> Pressing and holding the account lets you remove the profile even if the custom control server is offline or unreachable and the normal logout process fails.

#### Android

1. Tap the user profile icon in the top-right corner of the Tailscale app to open **Settings**.
2. Tap the active account name.
3. Tap **Log out**.

If the custom control server is offline or unreachable and you cannot log out, clear the Tailscale app's stored data from the Android system settings. The exact menu names can vary by Android version and device, but you can typically find this option under **Settings** > **Apps** > **Tailscale** > **Storage**.

> **Warning:**
>
> Clearing the Tailscale app's stored data resets its local client state.

#### tvOS

1. Open the tvOS **Settings** app.
2. Select **Apps**.
3. Select **Tailscale**.
4. Select **URL** under **Alternate coordination server URL**.
5. Clear the text field and select **Done**.
6. Return to the Tailscale app and sign in using the standard coordination server.

[bl-headscale]: https://tailscale.com/blog/opensource#the-open-source-coordination-server

[docs-deploy-tailscale-windows-mdm-registry]: /docs/integrations/mdm/windows-mdm#registry-values

[docs-macos-variants]: /docs/concepts/macos-variants
