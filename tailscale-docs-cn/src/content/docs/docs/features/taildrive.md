---
title: "Taildrive"
description: "Share folders securely between devices on your Tailscale network."
---

Last validated Jan 5, 2026

Taildrive lets you persistently share folders with other users and devices on your Tailscale network (known as a tailnet). Using Taildrive, you can:

* Share folders with your colleagues.
* Access files from your desktop PC or NAS server from your phone, anywhere in the world.
* Connect a backup utility, like [Duplicati][xt-duplicati] or [rclone][xt-rclone], to a Taildrive folder on your NAS.

> **Note:** Taildrive is currently in alpha.

## How it works

Normally, maintaining a file server requires you to manage credentials and access rules separately from the connectivity layer. Taildrive offers a file server that unifies connectivity and [access controls][docs-access-control], allowing you to share directories directly from the Tailscale client. You can then use your tailnet policy file to define which members of your tailnet can access a particular shared directory, and even define specific read and write permissions.

Beginning in version 1.64.0, the Tailscale client includes a Web-based Distributed Authoring and Versioning (WebDAV) server that runs on `100.100.100.100:8080` while Tailscale is connected. Every directory that you share receives a globally-unique path consisting of the tailnet, the machine name, and the share name: `/<tailnet>/<machine>/<share>`.

For example, if you shared a directory with the share name `docs` from the machine `nas-device` in the tailnet `example.com`, the share's path would be `/example.com/nas-device/docs`.

## Configure Taildrive

Taildrive's server component is only available on Linux, macOS, and Windows devices. iOS and Android devices can access directories shared from these platforms, but cannot share directories themselves.

### Enable Taildrive in the policy file

You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) to edit the tailnet policy file. Enabling Taildrive requires two steps: Enabling Taildrive on devices by setting a `nodeAttr`, and defining sharing permissions using [grants][docs-grants].

#### Add `nodeAttrs` to enable Taildrive on devices

To share directories or access directories shared by other devices, you need to enable Taildrive in the `nodeAttrs` section of your tailnet policy file. [Edit your policy file][docs-edit-tailnet-policy-file] to make this change.

For example, this policy will enable Taildrive on every member's devices. Every member of your tailnet will be able to share directories from their device and access shared directories.

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr": [
      "drive:share",
      "drive:access",
    ],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

The following policy enables Taildrive access on all devices, but only lets tailnet administrators share directories with Taildrive.

```json
"nodeAttrs": [
  {
    // Any device can access shared directories with Taildrive
    "target": ["*"],
    "attr": ["drive:access"],
  },
  {
    // Only tailnet admins can use Taildrive to share directories
    "target": ["autogroup:admin"],
    "attr": [
      "drive:share",
      "drive:access",
    ],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### Define sharing permissions

Now that you've enabled Taildrive on your devices, you define specific sharing permissions using [grants][docs-grants].

The broadest possible policy lets all devices access all shares in the tailnet, no matter which user or tag owns the device:

```json
"grants": [
  {
    "src": ["*"],
    "dst": ["*"],
    "app": {
      "tailscale.com/cap/drive": [{
        "shares": ["*"],
        "access": "rw"
      }]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

You may also choose to allow members to read and write to their own shared directories from any of their devices. A policy to allow this would look like this:

```json
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "app": {
      "tailscale.com/cap/drive": [{
        "shares": ["*"],
        "access": "rw"
      }]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

You can also limit write access or even define permissions for accessing specific shares. The following policy lets all tailnet members read files from the `company-docs` share with the tag `fileserver`, but does not grant access to any other shared directories besides `company-docs` and does not allow write access:

```json
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:fileserver"],
    "app": {
      "tailscale.com/cap/drive": [{
        "shares": ["company-docs"],
        "access": "ro"
      }]
    }
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

Now that you've configured permissions, you can share your folders.

## Sharing and accessing folders with Taildrive

#### macOS

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

On macOS, open **Settings** then **File Sharing** in the Tailscale client to manage Taildrive sharing. Because Taildrive is in alpha, the Tailscale client hides the **File Sharing** option by default. To show it, run one of the following commands in a terminal.

For applications installed from the App store:

```shell
defaults write io.tailscale.ipn.macos FileSharingConfiguration -string show
```

For applications downloaded from `tailscale.com`:

```shell
defaults write /Users/$(whoami)/Library/Preferences/io.tailscale.ipn.macsys.plist FileSharingConfiguration show
```

If the Tailscale application is already running, close and reopen it to pick up the new setting.

Once you've enabled the Taildrive settings in the terminal, you will find a **File Sharing** tab on the Settings screen.

Select **Choose Shared Folders** to start managing your shared folders.

To add a new share, select the **+** (plus) button. Once you select a folder, the share will be automatically named after the selected folder.

You can rename the share by double selecting its name in the list.

To remove a share, select it in the list and select the **−** (minus) button.

### Access directories shared with Taildrive

You can access Taildrive shares by connecting to the Taildrive server at `100.100.100.100:8080`.

1. Open Finder, then select **Go** from the app menu. Choose **Connect to Server**. Alternatively, with Finder open, you can use the keyboard shortcut `Cmd` + `K`.
2. In the **Server address** field, enter `http://100.100.100.100:8080`
   You can add this address to your favorites by selecting the **+** icon below the **Favorite Servers** table.
3. When the **Unsecured Connection** prompt appears, select **Continue**. While the connection takes place over HTTP, it is still encrypted in Tailscale's WireGuard tunnels, so your connection is still secure.
4. Choose **Guest** in the **Connect As:** menu and select **Connect**.

macOS will connect to the Taildrive WebDAV server and show a Finder window with your tailnet DNS name as a folder. Inside that folder, Taildrive will load a folder for each device in your tailnet, and any shares that are active on the devices will appear within those folders.

#### Windows

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

To use Taildrive on Windows, you use the Tailscale command-line interface (CLI).

Open a new PowerShell window and run the following command to share a directory using Taildrive. Replace `<share-name>` and `<path>` with the correct values.

```shell
tailscale drive share <share-name> <path>
```

* `share-name`: A name for the share that will be used in the Taildrive path. It does not need to be identical to the directory name. Share names must only contain the lowercase letters a-z, underscores `_`, parentheses `()`, or spaces. Leading and trailing spaces are omitted. Lowercase letters are required to avoid problems with clients that don't support case-sensitive filenames.
* `path`: The file system path to the directory that you will share.

#### Rename Taildrive shares

To rename a Taildrive share, run the following command. Replace `<old-share-name>` with the current name of the share and `<new-share-name>` with its intended new name.

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

After you rename the share, users with sufficient permission can immediately access the share using the new name.

#### Delete Taildrive shares

To delete an existing Taildrive share, run the following command. Replace `<share-name>` with the name of the share to delete.

```shell
tailscale drive unshare <share-name>
```

#### List existing Taildrive shares

To list all existing Taildrive shares that are shared from a device, run the following CLI command on that device:

```shell
tailscale drive list
```

The command displays a list showing the shared directories on the device, along with their share names and the local user whose permissions were used to share the folder.

```shell
name      path                      as
------    ----------------------    ----
Music     C:\Users\Amelie\Music
Video     C:\Users\Amelie\Video
```

The `as` column will be blank on Windows.

### Access directories shared with Taildrive

You can access Taildrive shares by connecting to the Taildrive server at `100.100.100.100:8080`.

1. Open File Explorer, then right-click on **This PC** in the left sidebar and select **Map network drive**

2. Select the **Drive letter** and the **Folder** that you want to map your Taildrive shares to on your local machine.

3. Select the **Reconnect at sign-in** (optional) and **Connect using different credentials** checkboxes.

4. Select **Connect to a Web site that you can use to store your documents and pictures**.

5. Select **Next**.

6. Select **Choose a custom network location** and then select **Next**.

7. In the **Internet or network address** field, enter `http://100.100.100.100:8080` and then select **Next**.

8. Leave the **Username** and **Password** field blank in the pop-up box, and select **Ok**.

9. Select the **Next** button, and then the **Finish** button.

Your Taildrive directory will appear as a mapped drive in Windows File Explorer, and will contain a folder with your tailnet name. Inside that folder, Taildrive will load a folder for each device in your tailnet, and any shares that are active on the devices will appear within those folders.

By default, Windows limits WebDAV files to 50MB. This can be changed by editing the registry key:

1. Open the **Windows Run** dialog by using the keyboard shortcut `Windows` + `R`.
2. In the dialogue box, type `Regedit` and select **Ok**.
3. Locate the registry key at `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WebClient\Parameters`, under the entry `FileSizeLimitInBytes`.
4. Change the value to `4294967295`, which is 4GB. This is the maximum allowed value.

#### Linux

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

Using the Tailscale command-line interface (CLI), run the following command to share a directory using Taildrive. Replace `<share-name>` and `<path>` with your own values.

```shell
tailscale drive share <share-name> <path>
```

* `share-name`: A name for the share that will be used in the Taildrive path. It does not need to be identical to the directory name. Share names may only contain the lowercase letters a-z, underscores `_`, parentheses `()`, or spaces. Leading and trailing spaces are omitted. Lowercase letters are required to avoid problems with clients that don't support case-sensitive filenames.
* `path`: The file system path to the directory that you will share.

#### Rename Taildrive shares

To rename a Taildrive share, run the following command. Replace `<old-share-name>` with the current name of the share, and `<new-share-name>` with its intended new name.

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

After you rename the share, users with the sufficient access can immediately access the share by using the new name.

#### Delete Taildrive shares

To delete an existing Taildrive share, run the following command. Replace `<share-name>` with the name of the share to delete.

```shell
tailscale drive unshare <share-name>
```

#### List existing Taildrive shares

To list all existing Taildrive shares that are shared from a device, run the following CLI command on that device:

```shell
tailscale drive list
```

The command displays a list showing the shared directories on the device, along with their share names and the local user whose permissions were used to share the folder.

For example:

```shell
name      path                      as
------    ----------------------    ----
nas       /media/data-A/nas-data    root
docs      /pi/docs                  root
backup    /pi/system-backups        root
```

### Access directories shared with Taildrive

You can access Taildrive shares by mounting the Taildrive server at `100.100.100.100:8080` with [davfs2][xt-davfs2].

For example:

```shell
# sudo mount -t davfs http://100.100.100.100:8080 /mount/tailscale
```

[xt-davfs2]: https://wiki.archlinux.org/title/Davfs2

#### Synology

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

> **Note:**
>
> Taildrive sharing is not compatible with DSM 6. You must use DSM 7 on your Synology NAS to share directories. Any version of DSM can view shared Taildrive directories.

Before you can use the `tailscale drive share` command to share a directory on a Synology NAS, you must give Tailscale permission to read and write inside your Synology volume. Additionally, you need to [enable Terminal access][xt-synology-terminal] for your Synology NAS to run Tailscale commands at the command line.

To share directories from a Synology device running DSM 7, you need to edit the permissions of the top-level Shared Folder in your volume.

1. Access the Synology web interface and sign in.
2. Open the **Control Panel**.
3. Select **Shared Folder** under the **File Sharing** section.
4. Select the Shared Folder that you wish to be able to share with Taildrive.
5. Select **Edit** in the Control Panel task bar.
6. Select the **Permissions** tab.
7. Select **System internal user** from the dropdown menu.
8. Find `tailscale` in the table.
9. Check the **Read/Write** box in that row.
10. Select **Save**.
11. Repeat these steps for any other Shared Folders in your Synology volumes that you want to use with Taildrive.

This lets you share any sub-directory of that shared folder with your tailnet by Taildrive.

[xt-synology-terminal]: https://kb.synology.com/en-global/DSM/help/DSM/AdminCenter/system_terminal?version=7

Using the Tailscale command-line interface (CLI), run the following command to share a directory using Taildrive. Replace `<share-name>` and `<path>` with your own values.

```shell
tailscale drive share <share-name> <path>
```

* `share-name`: A name for the share that will be used in the Taildrive path. It does not need to be identical to the directory name. Share names may only contain the lowercase letters a-z, underscores `_`, parentheses `()`, or spaces. Leading and trailing spaces are omitted. Lowercase letters are required to avoid problems with clients that don't support case-sensitive filenames.
* `path`: The file system path to the directory that you will share.

#### Rename Taildrive shares

To rename a Taildrive share, run the following command. Replace `<old-share-name>` with the current name of the share, and `<new-share-name>` with its intended new name.

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

After you rename the share, users with the sufficient access can immediately access the share by using the new name.

#### Delete Taildrive shares

To delete an existing Taildrive share, run the following command. Replace `<share-name>` with the name of the share to delete.

```shell
tailscale drive unshare <share-name>
```

#### List existing Taildrive shares

To list all existing Taildrive shares that are shared from a device, run the following CLI command on that device:

```shell
tailscale drive list
```

The command displays a list showing the shared directories on the device, along with their share names and the local user whose permissions were used to share the folder.

For example:

```shell
name      path                      as
------    ----------------------    ----
nas       /media/data-A/nas-data    root
docs      /pi/docs                  root
backup    /pi/system-backups        root
```

### Access directories shared with Taildrive

These steps will work with any Synology device running DSM 6 or DSM 7. Remember, DSM 6 devices can access shared directories over Taildrive, but cannot share directories themselves.

1. Access the Synology web interface and sign in.

2. Open the **File Station** application.

3. Select the **Tools** dropdown from the task bar.

4. Select **Remote Connection** and then select **Connection Setup**.

5. Choose **WebDAV / WebDAV HTTPS** from the list of connection options.

6. Enter `100.100.100.100` in the **Hostname or IP** field.

7. Enter `8080` in the **Port** field.

8. Leave the **Account Name** and **Password** blank. No credentials are needed, since Taildrive uses your [Tailscale identity][docs-tailscale-identity] to determine your permissions.

9. Ensure **Codepage** is set to `Unicode (UTF-8)`.

10. Optionally, add a **Profile Name**. This lets you give a nickname the connection.

11. Select **Apply**.

Synology will display this connection in the left sidebar of the **File Station** application, under the **WebDAV** heading. Selecting the connection will show your tailnet DNS name as a folder. Inside that folder, Taildrive will load a folder for each device in your tailnet, and any shares that are active on the devices will appear within those folders.

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

#### iOS

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

Sharing folders from iOS is not supported.

### Access directories shared with Taildrive

Taildrive is available as a location in the Files app.

1. Open the Files app, and select **Browse** on the menu bar at the bottom of the screen.
2. Select **Tailscale** from the list of locations.
3. The first time you connect, a prompt will appear asking for permission to **Turn on "Tailscale"**. Tap **Turn On**.

The Files app will display a folder with your tailnet name. Inside that folder, Taildrive will load a folder for each device in your tailnet, and any shares that are active on the devices will appear within those folders.

You can favorite any folder inside of the Tailscale file provider to gain quicker access to it.

Now that you've set up Taildrive on your iOS device, you'll have access to read and write to the shared folders from any app that integrates with the iOS Files app.

#### Android

> **Note:**
>
> Tailscale must be running to access Taildrive shares at `100.100.100.100:8080`.

### Share directories with Taildrive

Sharing folders from Android is not supported.

### Access directories shared with Taildrive

To access Taildrive, you will need a WebDAV compatible file browser app from the [Play Store][xt-play-store].

> **Note:**
>
> Some WebDAV explorers only work with `https` URLs, but Taildrive only works on `http`.

If your file browser requires a username/password for WebDAV connections, you may enter any username and password you like.

#### Material Files

[Material Files][xt-material-files] is a free and [open source][xt-gh-material-files] file browser that works with Taildrive.

To access Taildrive from Material Files, follow these steps:

1. Tap on the top-left hamburger menu.
2. Select **+ Add storage...**.
3. Select **WebDAV server**.
4. Enter `100.100.100.100` for the **Hostname**.
5. Enter `8080` for the **Port**.
6. Leave **Path** empty.
7. Enter any value for **Name**, such as `Tailscale`.
8. Select `HTTP` as the **Protocol**.
9. Select `None` for **Authentication**.
10. Tap **Connect and add**.

You can now find your WebDAV mount under the locations in the hamburger menu.

[xt-gh-material-files]: https://github.com/zhanghai/MaterialFiles

[xt-material-files]: https://play.google.com/store/apps/details?id=me.zhanghai.android.files&hl=en_US&gl=US&pli=1

[xt-play-store]: https://play.google.com/store/search?q=webdav%20file%20browser&c=apps

## Limitations

* A device [shared][docs-sharing] into your tailnet cannot access any Taildrive folders in your tailnet. Similarly, a device you share to another tailnet cannot access any Taildrive folders in the other tailnet
* Using Taildrive with `rclone` on client version 1.64.2 or earlier will fail without the `--inplace` flag. Use [version 1.65.75][pk-1-65-75-unstable] or later to avoid this.

[docs-access-control]: /docs/features/access-control

[docs-edit-tailnet-policy-file]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-grants]: /docs/features/access-control/grants

[docs-sharing]: /docs/features/sharing

[pk-1-65-75-unstable]: https://pkgs.tailscale.com/unstable

[xt-duplicati]: https://www.duplicati.com

[xt-rclone]: https://rclone.org
