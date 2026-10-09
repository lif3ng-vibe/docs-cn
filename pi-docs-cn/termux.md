# 在 Android 上用 Termux 运行 Pi

Pi 通过 [Termux](https://termux.dev/)（一款终端模拟器和 Linux 环境）在 Android 上运行。支持文本输入、文件工具和 shell 命令。Pi 可以通过 Termux:API 使用 Android 剪贴板复制和粘贴文本。不支持粘贴剪贴板图片。

## 开始之前

从 [GitHub 或 F-Droid](https://github.com/termux/termux-app#installation) 安装 Termux。不要使用已停止维护的 Google Play 版本。

[Termux:API](https://github.com/termux/termux-api#installation) 是可选的。只有当你想让 Pi 复制或粘贴 Android 剪贴板文本，或 shell 命令需要用到 Android 设备 API 时才安装它。

## 安装 Pi

1. 更新 Termux 软件包：

   ```bash
   pkg update && pkg upgrade
   ```

2. 安装 Node.js 和 Git：

   ```bash
   pkg install nodejs git
   ```

3. 安装 Pi：

   ```bash
   npm install -g --ignore-scripts @earendil-works/pi-coding-agent
   ```

4. 验证安装：

   ```bash
   pi --version
   ```

5. 打开你想工作的目录并启动 Pi：

   ```bash
   cd /path/to/working-folder
   pi
   ```

继续阅读主[快速开始](quickstart.md#3-choose-a-model)，连接模型并运行你的第一个任务。

## 访问 Android 共享存储

在你授予权限之前，Termux 无法访问 Android 共享存储。运行一次以下命令：

```bash
termux-setup-storage
```

批准后，Android 共享存储即可在 `/storage/emulated/0` 下访问，也可以通过 Termux 在 `~/storage/` 下创建的链接访问。

只有在希望 Pi 能访问这些文件时才授予该权限。在 Termux 中运行的命令和工具与 Termux 进程使用相同的存储权限。

## 使用剪贴板命令

Pi 用 `termux-clipboard-set` 复制文本，用 `termux-clipboard-get` 实现剪贴板粘贴快捷键。shell 命令也可以直接使用这两个命令。请安装 Termux:API 应用及其命令行包：

```bash
pkg install termux-api
```

验证集成：

```bash
printf 'Pi clipboard test' | termux-clipboard-set
termux-clipboard-get
```

第二条命令应输出 `Pi clipboard test`。

Termux 剪贴板 API 只支持文本。Pi 的剪贴板粘贴快捷键会把文本插入编辑器，但无法附带剪贴板图片。

## 添加 Termux 专属指令

Pi 能检测到自己运行在 Termux 中，但无法推断你希望它如何与 Android 交互。请只把与你的工作相关的环境细节写入 `~/.pi/agent/AGENTS.md`：

````markdown
# Termux environment

- Pi runs in Termux on Android.
- Shared Android storage is under `/storage/emulated/0`.
- Open URLs with `termux-open-url "https://example.com"`.
- Open files with `termux-open <path>`.
- Do not access shared storage unless the task requires it.
````

在会话进行中修改该文件后，请运行 `/reload`。

## 故障排查

### 剪贴板集成失败

确认你安装了两个组件：

1. 与 Termux 同一来源的 Termux:API Android 应用
2. `termux-api` 命令行包

然后在 Pi 之外运行上面的剪贴板验证命令。如果在那里就失败，请先修复 Termux:API 的安装，再重试 Pi 的复制命令。

### 共享存储报权限被拒

运行 `termux-setup-storage`，批准 Android 权限请求，然后重试 `~/storage/` 或 `/storage/emulated/0` 下的路径。

### 安装后找不到 pi

打开一个新的 Termux shell 并运行：

```bash
npm prefix -g
command -v pi
```

确认全局 npm 可执行文件目录在 `PATH` 上；如果包缺失，请重新安装 Pi。
