---
title: "Taildrive"
description: "在 Tailscale 网络上的设备之间安全地共享文件夹。"
---

最后验证于 Jan 5, 2026

Taildrive 让你能在 Tailscale 网络（即 tailnet）上与其他用户和设备持久地共享文件夹。使用 Taildrive，你可以：

* 与同事共享文件夹。
* 在世界任何地方用手机访问台式电脑或 NAS 服务器上的文件。
* 将 [Duplicati][xt-duplicati] 或 [rclone][xt-rclone] 等备份工具连接到 NAS 上的 Taildrive 文件夹。

> **注意：** Taildrive 目前处于 alpha 阶段。

## 工作原理

通常，维护一台文件服务器需要你在连接层之外单独管理凭证和访问规则。Taildrive 提供了一种将连接与[访问控制][docs-access-control]统一起来的文件服务器，让你可以直接从 Tailscale 客户端共享目录。随后，你可以用 tailnet 策略文件定义 tailnet 中哪些成员可以访问某个共享目录，甚至可以定义具体的读写权限。

从 1.64.0 版本开始，Tailscale 客户端内置了一个基于 Web 的分布式创作与版本控制（WebDAV）服务器，在 Tailscale 处于连接状态时运行在 `100.100.100.100:8080`。你共享的每个目录都会获得一个全局唯一的路径，由 tailnet、机器名和共享名称组成：`/<tailnet>/<machine>/<share>`。

例如，如果你在 tailnet `example.com` 中从机器 `nas-device` 上以共享名称 `docs` 共享了一个目录，那么该共享的路径就是 `/example.com/nas-device/docs`。

## 配置 Taildrive

Taildrive 的服务器组件仅在 Linux、macOS 和 Windows 设备上可用。iOS 和 Android 设备可以访问从这些平台共享出来的目录，但自身不能共享目录。

### 在策略文件中启用 Taildrive

你需要是 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能编辑 tailnet 策略文件。启用 Taildrive 需要两个步骤：通过设置 `nodeAttr` 在设备上启用 Taildrive，以及使用[授权（grant）][docs-grants]定义共享权限。

#### 添加 `nodeAttrs` 以在设备上启用 Taildrive

要共享目录或访问其他设备共享的目录，你需要在 tailnet 策略文件的 `nodeAttrs` 部分启用 Taildrive。请[编辑你的策略文件][docs-edit-tailnet-policy-file]来完成此项更改。

例如，以下策略会在每个成员的设备上启用 Taildrive。tailnet 中的每个成员都将能够从自己的设备共享目录，并访问共享目录。

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

以下策略在所有设备上启用 Taildrive 访问，但只允许 tailnet 管理员通过 Taildrive 共享目录。

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

#### 定义共享权限

在设备上启用 Taildrive 之后，你就可以使用[授权][docs-grants]来定义具体的共享权限。

最宽松的策略允许所有设备访问 tailnet 中的所有共享，无论设备归属于哪个用户或标签：

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

你也可以选择允许成员从自己的任意设备读写自己的共享目录。实现这一点的策略如下：

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

你还可以限制写入权限，甚至为访问特定共享定义权限。以下策略允许所有 tailnet 成员读取带有 `fileserver` 标签的设备上 `company-docs` 共享中的文件，但除 `company-docs` 之外不会授予对任何其他共享目录的访问权限，也不允许写入：

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

权限配置完成后，你就可以开始共享自己的文件夹了。

## 使用 Taildrive 共享和访问文件夹

#### macOS

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

在 macOS 上，打开 Tailscale 客户端中的**设置**（Settings），然后打开**文件共享**（File Sharing）来管理 Taildrive 共享。由于 Taildrive 处于 alpha 阶段，Tailscale 客户端默认隐藏**文件共享**选项。要显示该选项，请在终端中运行以下命令之一。

对于从 App Store 安装的应用：

```shell
defaults write io.tailscale.ipn.macos FileSharingConfiguration -string show
```

对于从 `tailscale.com` 下载的应用：

```shell
defaults write /Users/$(whoami)/Library/Preferences/io.tailscale.ipn.macsys.plist FileSharingConfiguration show
```

如果 Tailscale 应用已经在运行，请将其关闭再重新打开，以应用新设置。

在终端中启用 Taildrive 设置后，你会看到设置界面中出现一个**文件共享**标签页。

选择**选择共享文件夹**（Choose Shared Folders），开始管理你的共享文件夹。

要添加新的共享，请选择 **+**（加号）按钮。选定文件夹后，该共享会自动以所选文件夹命名。

你可以通过在列表中双击共享名称来重命名该共享。

要移除共享，请在列表中选中它，然后选择 **−**（减号）按钮。

### 访问通过 Taildrive 共享的目录

你可以通过连接 `100.100.100.100:8080` 上的 Taildrive 服务器来访问 Taildrive 共享。

1. 打开 Finder，然后在应用菜单中选择**前往**（Go），再选择**连接服务器**（Connect to Server）。也可以在 Finder 打开时使用键盘快捷键 `Cmd` + `K`。
2. 在**服务器地址**（Server address）字段中输入 `http://100.100.100.100:8080`
   你可以通过选择**收藏的服务器**（Favorite Servers）表格下方的 **+** 图标，将该地址添加到收藏。
3. 当出现**不安全连接**（Unsecured Connection）提示时，选择**继续**（Continue）。虽然连接通过 HTTP 进行，但它仍在 Tailscale 的 WireGuard 隧道中加密传输，因此你的连接依然是安全的。
4. 在**连接身份**（Connect As:）菜单中选择**访客**（Guest），然后选择**连接**（Connect）。

macOS 会连接到 Taildrive WebDAV 服务器，并显示一个 Finder 窗口，其中以文件夹形式呈现你的 tailnet DNS 名称。在该文件夹内，Taildrive 会为 tailnet 中的每台设备加载一个文件夹，设备上处于活动状态的共享会出现在这些文件夹中。

#### Windows

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

在 Windows 上使用 Taildrive 需要通过 Tailscale 命令行界面（CLI）。

打开一个新的 PowerShell 窗口，运行以下命令来使用 Taildrive 共享目录。将 `<share-name>` 和 `<path>` 替换为正确的值。

```shell
tailscale drive share <share-name> <path>
```

* `share-name`：共享的名称，将用于 Taildrive 路径中。它不必与目录名相同。共享名称只能包含小写字母 a-z、下划线 `_`、括号 `()` 或空格。首尾空格会被省略。要求使用小写字母，是为了避免不支持大小写敏感文件名的客户端出现问题。
* `path`：要共享的目录的文件系统路径。

#### 重命名 Taildrive 共享

要重命名 Taildrive 共享，请运行以下命令。将 `<old-share-name>` 替换为该共享的当前名称，将 `<new-share-name>` 替换为想要使用的新名称。

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

重命名完成后，拥有足够权限的用户可以立即使用新名称访问该共享。

#### 删除 Taildrive 共享

要删除现有的 Taildrive 共享，请运行以下命令。将 `<share-name>` 替换为要删除的共享的名称。

```shell
tailscale drive unshare <share-name>
```

#### 列出现有 Taildrive 共享

要列出某台设备上通过 Taildrive 共享的所有现有共享，请在该设备上运行以下 CLI 命令：

```shell
tailscale drive list
```

该命令会显示一个列表，其中包含设备上已共享的目录，以及它们的共享名称和共享该文件夹时所使用的本地用户权限。

```shell
name      path                      as
------    ----------------------    ----
Music     C:\Users\Amelie\Music
Video     C:\Users\Amelie\Video
```

`as` 列在 Windows 上为空。

### 访问通过 Taildrive 共享的目录

你可以通过连接 `100.100.100.100:8080` 上的 Taildrive 服务器来访问 Taildrive 共享。

1. 打开文件资源管理器，右键点击左侧边栏中的**此电脑**（This PC），然后选择**映射网络驱动器**（Map network drive）

2. 选择要在本地计算机上映射 Taildrive 共享所用的**驱动器号**（Drive letter）和**文件夹**（Folder）。

3. 勾选**登录时重新连接**（Reconnect at sign-in）（可选）和**使用其他凭据连接**（Connect using different credentials）复选框。

4. 选择**连接到可用于存储文档和图片的网站**。

5. 选择**下一步**（Next）。

6. 选择**选择自定义网络位置**（Choose a custom network location），然后选择**下一步**（Next）。

7. 在 **Internet 或网络地址**字段中输入 `http://100.100.100.100:8080`，然后选择**下一步**（Next）。

8. 在弹出的对话框中将**用户名**（Username）和**密码**（Password）留空，然后选择**确定**（Ok）。

9. 选择**下一步**（Next）按钮，然后选择**完成**（Finish）按钮。

你的 Taildrive 目录会作为映射驱动器显示在 Windows 文件资源管理器中，其中包含一个以你的 tailnet 名称命名的文件夹。在该文件夹内，Taildrive 会为 tailnet 中的每台设备加载一个文件夹，设备上处于活动状态的共享会出现在这些文件夹中。

默认情况下，Windows 将 WebDAV 文件大小限制为 50MB。可以通过编辑注册表项来更改此限制：

1. 使用键盘快捷键 `Windows` + `R` 打开 **Windows 运行**（Windows Run）对话框。
2. 在对话框中输入 `Regedit`，然后选择**确定**（Ok）。
3. 找到注册表项 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WebClient\Parameters` 下面的 `FileSizeLimitInBytes` 条目。
4. 将该值更改为 `4294967295`，即 4GB。这是允许的最大值。

#### Linux

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

使用 Tailscale 命令行界面（CLI），运行以下命令来使用 Taildrive 共享目录。将 `<share-name>` 和 `<path>` 替换为你自己的值。

```shell
tailscale drive share <share-name> <path>
```

* `share-name`：共享的名称，将用于 Taildrive 路径中。它不必与目录名相同。共享名称只能包含小写字母 a-z、下划线 `_`、括号 `()` 或空格。首尾空格会被省略。要求使用小写字母，是为了避免不支持大小写敏感文件名的客户端出现问题。
* `path`：要共享的目录的文件系统路径。

#### 重命名 Taildrive 共享

要重命名 Taildrive 共享，请运行以下命令。将 `<old-share-name>` 替换为该共享的当前名称，将 `<new-share-name>` 替换为想要使用的新名称。

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

重命名完成后，拥有足够权限的用户可以立即使用新名称访问该共享。

#### 删除 Taildrive 共享

要删除现有的 Taildrive 共享，请运行以下命令。将 `<share-name>` 替换为要删除的共享的名称。

```shell
tailscale drive unshare <share-name>
```

#### 列出现有 Taildrive 共享

要列出某台设备上通过 Taildrive 共享的所有现有共享，请在该设备上运行以下 CLI 命令：

```shell
tailscale drive list
```

该命令会显示一个列表，其中包含设备上已共享的目录，以及它们的共享名称和共享该文件夹时所使用的本地用户权限。

例如：

```shell
name      path                      as
------    ----------------------    ----
nas       /media/data-A/nas-data    root
docs      /pi/docs                  root
backup    /pi/system-backups        root
```

### 访问通过 Taildrive 共享的目录

你可以使用 [davfs2][xt-davfs2] 挂载 `100.100.100.100:8080` 上的 Taildrive 服务器，从而访问 Taildrive 共享。

例如：

```shell
# sudo mount -t davfs http://100.100.100.100:8080 /mount/tailscale
```

[xt-davfs2]: https://wiki.archlinux.org/title/Davfs2

#### Synology

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

> **注意：**
>
> Taildrive 共享与 DSM 6 不兼容。你必须使用群晖（Synology）NAS 上的 DSM 7 才能共享目录。任何版本的 DSM 都可以查看通过 Taildrive 共享的目录。

在群晖 NAS 上使用 `tailscale drive share` 命令共享目录之前，你必须授予 Tailscale 在群晖存储空间（volume）内进行读写的权限。此外，你还需要为群晖 NAS [启用 Terminal 访问][xt-synology-terminal]，才能在命令行运行 Tailscale 命令。

要从运行 DSM 7 的群晖设备共享目录，你需要编辑存储空间中顶层共享文件夹的权限。

1. 访问群晖网页界面并登录。
2. 打开**控制面板**（Control Panel）。
3. 在**文件共享**（File Sharing）分区下选择**共享文件夹**（Shared Folder）。
4. 选择你希望能够通过 Taildrive 共享的共享文件夹。
5. 在控制面板任务栏中选择**编辑**（Edit）。
6. 选择**权限**（Permissions）标签页。
7. 从下拉菜单中选择**系统内部用户**（System internal user）。
8. 在表格中找到 `tailscale`。
9. 勾选该行中的**读/写**（Read/Write）复选框。
10. 选择**保存**（Save）。
11. 对群晖存储空间中其他想要配合 Taildrive 使用的共享文件夹重复上述步骤。

这样你就可以通过 Taildrive 将该共享文件夹的任意子目录共享给你的 tailnet。

[xt-synology-terminal]: https://kb.synology.com/en-global/DSM/help/DSM/AdminCenter/system_terminal?version=7

使用 Tailscale 命令行界面（CLI），运行以下命令来使用 Taildrive 共享目录。将 `<share-name>` 和 `<path>` 替换为你自己的值。

```shell
tailscale drive share <share-name> <path>
```

* `share-name`：共享的名称，将用于 Taildrive 路径中。它不必与目录名相同。共享名称只能包含小写字母 a-z、下划线 `_`、括号 `()` 或空格。首尾空格会被省略。要求使用小写字母，是为了避免不支持大小写敏感文件名的客户端出现问题。
* `path`：要共享的目录的文件系统路径。

#### 重命名 Taildrive 共享

要重命名 Taildrive 共享，请运行以下命令。将 `<old-share-name>` 替换为该共享的当前名称，将 `<new-share-name>` 替换为想要使用的新名称。

```shell
tailscale drive rename <old-share-name> <new-share-name>
```

重命名完成后，拥有足够权限的用户可以立即使用新名称访问该共享。

#### 删除 Taildrive 共享

要删除现有的 Taildrive 共享，请运行以下命令。将 `<share-name>` 替换为要删除的共享的名称。

```shell
tailscale drive unshare <share-name>
```

#### 列出现有 Taildrive 共享

要列出某台设备上通过 Taildrive 共享的所有现有共享，请在该设备上运行以下 CLI 命令：

```shell
tailscale drive list
```

该命令会显示一个列表，其中包含设备上已共享的目录，以及它们的共享名称和共享该文件夹时所使用的本地用户权限。

例如：

```shell
name      path                      as
------    ----------------------    ----
nas       /media/data-A/nas-data    root
docs      /pi/docs                  root
backup    /pi/system-backups        root
```

### 访问通过 Taildrive 共享的目录

这些步骤适用于任何运行 DSM 6 或 DSM 7 的群晖设备。请注意，DSM 6 设备可以通过 Taildrive 访问共享目录，但自身不能共享目录。

1. 访问群晖网页界面并登录。

2. 打开 **File Station** 应用。

3. 在任务栏中选择**工具**（Tools）下拉菜单。

4. 选择**远程连接**（Remote Connection），然后选择**连接设置**（Connection Setup）。

5. 从连接选项列表中选择 **WebDAV / WebDAV HTTPS**。

6. 在**主机名或 IP**（Hostname or IP）字段中输入 `100.100.100.100`。

7. 在**端口**（Port）字段中输入 `8080`。

8. 将**账户名称**（Account Name）和**密码**（Password）留空。无需任何凭证，因为 Taildrive 会使用你的 [Tailscale 身份][docs-tailscale-identity]来确定你的权限。

9. 确保**代码页**（Codepage）设置为 `Unicode (UTF-8)`。

10. （可选）添加一个**配置文件名称**（Profile Name）。这样你可以为该连接起一个别名。

11. 选择**应用**（Apply）。

群晖会在 **File Station** 应用的左侧边栏中、**WebDAV** 标题下显示此连接。选择该连接后，会以文件夹形式显示你的 tailnet DNS 名称。在该文件夹内，Taildrive 会为 tailnet 中的每台设备加载一个文件夹，设备上处于活动状态的共享会出现在这些文件夹中。

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

#### iOS

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

不支持从 iOS 共享文件夹。

### 访问通过 Taildrive 共享的目录

Taildrive 在"文件"（Files）App 中作为一个位置提供。

1. 打开"文件" App，然后选择屏幕底部菜单栏中的**浏览**（Browse）。
2. 从位置列表中选择 **Tailscale**。
3. 首次连接时，会出现一个提示，请求允许**开启"Tailscale"**（Turn on "Tailscale"）。点按**开启**（Turn On）。

"文件" App 会显示一个以你的 tailnet 名称命名的文件夹。在该文件夹内，Taildrive 会为 tailnet 中的每台设备加载一个文件夹，设备上处于活动状态的共享会出现在这些文件夹中。

你可以收藏 Tailscale 文件提供方中的任意文件夹，以便更快地访问它。

在 iOS 设备上设置好 Taildrive 之后，你就可以在任何与 iOS"文件" App 集成的应用中读取和写入这些共享文件夹。

#### Android

> **注意：**
>
> 必须保持 Tailscale 运行，才能访问 `100.100.100.100:8080` 上的 Taildrive 共享。

### 使用 Taildrive 共享目录

不支持从 Android 共享文件夹。

### 访问通过 Taildrive 共享的目录

要访问 Taildrive，你需要从 [Play Store][xt-play-store] 安装一个兼容 WebDAV 的文件浏览器应用。

> **注意：**
>
> 有些 WebDAV 浏览器只能使用 `https` URL，但 Taildrive 只能在 `http` 上工作。

如果你的文件浏览器在 WebDAV 连接时要求用户名/密码，你可以随意输入任意用户名和密码。

#### Material Files

[Material Files][xt-material-files] 是一款免费且[开源][xt-gh-material-files]的文件浏览器，可与 Taildrive 配合使用。

要在 Material Files 中访问 Taildrive，请按以下步骤操作：

1. 点按左上角的汉堡菜单。
2. 选择 **+ 添加存储**（+ Add storage...）。
3. 选择 **WebDAV 服务器**（WebDAV server）。
4. 在**主机名**（Hostname）中输入 `100.100.100.100`。
5. 在**端口**（Port）中输入 `8080`。
6. 将**路径**（Path）留空。
7. 在**名称**（Name）中输入任意值，例如 `Tailscale`。
8. **协议**（Protocol）选择 `HTTP`。
9. **身份验证**（Authentication）选择 `None`。
10. 点按**连接并添加**。

现在，你可以在汉堡菜单中的位置列表里找到你的 WebDAV 挂载。

[xt-gh-material-files]: https://github.com/zhanghai/MaterialFiles

[xt-material-files]: https://play.google.com/store/apps/details?id=me.zhanghai.android.files&hl=en_US&gl=US&pli=1

[xt-play-store]: https://play.google.com/store/search?q=webdav%20file%20browser&c=apps

## 局限性

* [共享][docs-sharing]到你 tailnet 中的设备无法访问你 tailnet 中的任何 Taildrive 文件夹。同样，你共享到其他 tailnet 的设备也无法访问该 tailnet 中的任何 Taildrive 文件夹。
* 在 1.64.2 或更早版本的客户端上配合 `rclone` 使用 Taildrive 时，如果没有 `--inplace` 标志将会失败。请使用 [1.65.75 或更高版本][pk-1-65-75-unstable]以避免此问题。

[docs-access-control]: /docs/features/access-control

[docs-edit-tailnet-policy-file]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-grants]: /docs/features/access-control/grants

[docs-sharing]: /docs/features/sharing

[pk-1-65-75-unstable]: https://pkgs.tailscale.com/unstable

[xt-duplicati]: https://www.duplicati.com

[xt-rclone]: https://rclone.org
