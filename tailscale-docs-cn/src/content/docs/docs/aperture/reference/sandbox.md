---
title: "沙箱（Sandbox）参考"
description: "Aperture 聊天沙箱为助手提供每个对话独立的 Linux 隔离环境。它可以运行命令、读取和搜索文件、创建和编辑文件，并展示输出文件。临时存储"
---

最后验证于 Sep 28, 2026

> **注意**：Aperture 聊天沙箱目前处于 alpha 阶段。

\[缺失片段：contact\_account\_manager.mdx]

Aperture 聊天沙箱为助手提供每个对话独立的 Linux 隔离环境。它可以运行命令、读取和搜索文件、创建和编辑文件，并展示输出文件。临时存储（scratch storage）可能在回合之间消失。上传的文件和展示的输出文件会始终与对话关联。

概览请参阅 [Aperture 聊天沙箱][docs-sandbox-feature-guide]。使用帮助请参阅[管理沙箱操作][docs-manage-sandbox]或[排查沙箱问题][docs-troubleshooting]。

## 工具

助手调用工具时，工具名称会显示在聊天中。

### `aperture_bash`

在沙箱中执行 shell 命令。

| 参数      | 类型    | 必填 | 描述                                                         |
| --------- | ------- | -------- | ------------------------------------------------------------ |
| `command` | string  | 是       | 要执行的 shell 命令                                          |
| `timeout` | integer | 否       | 最长执行时间（秒）。默认：600（10 分钟）                     |

每次调用都从 `/home/aperture` 开始。该工具会把命令输出截断在 1 MiB（1,048,576 字节）。每个助手回合有 10 分钟的时限，调大 `timeout` 不会延长它。

### `aperture_read_file`

读取文件并返回带行号的内容。目录返回列表，图像文件返回一行元数据。

| 参数         | 类型                | 必填 | 描述                                                                            |
| ------------ | ------------------- | -------- | ------------------------------------------------------------------------------- |
| `path`       | string              | 是       | 文件的绝对路径                                                                  |
| `view_range` | array of 2 integers | 否       | `[start_line, end_line]`，从 1 开始编号。`end_line` 用 `-1` 表示读到末尾        |

输出在 16,000 字节处截断。请用 `view_range` 查看大文件的限定范围。

### `aperture_list_files`

列出目录中的文件，最多两层深度。

| 参数   | 类型   | 必填 | 描述                           |
| ------ | ------ | -------- | ------------------------------ |
| `path` | string | 是       | 目录的绝对路径                 |

列表最多包含 200 个条目，工具输出在 16,000 字节处截断。

### `aperture_grep`

在文件或目录中递归搜索匹配正则表达式的行。结果使用 `path:line:text` 格式。

| 参数      | 类型   | 必填 | 描述                                             |
| --------- | ------ | -------- | ------------------------------------------------ |
| `pattern` | string | 是       | 要搜索的正则表达式                               |
| `path`    | string | 是       | 要搜索的文件或目录的绝对路径                     |

输出在 16,000 字节处截断。

### `aperture_write_file`

创建文件及其父目录。

| 参数        | 类型   | 必填 | 描述                         |
| ----------- | ------ | -------- | ---------------------------- |
| `path`      | string | 是       | 要创建的文件的路径           |
| `file_text` | string | 是       | 要写入文件的内容             |

`/mnt/workspace/uploads/` 下的路径是只读的。超时时间为 30 秒。

### `aperture_edit_file`

替换文本文件中唯一的字符串。

| 参数         | 类型   | 必填 | 描述                                                         |
| ------------ | ------ | -------- | ------------------------------------------------------------ |
| `path`       | string | 是       | 要编辑的文件的路径                                           |
| `old_string` | string | 是       | 要替换的字符串。它必须唯一标识文件中的一个位置               |
| `new_string` | string | 否       | 替换字符串。省略或留空即可删除匹配内容                       |

该工具先尝试精确匹配，再尝试逐行的空白不敏感匹配。`/mnt/workspace/uploads/` 下的路径是只读的。超时时间为 30 秒。

### `aperture_present_files`

让文件在聊天中可见，供查看和下载。

| 参数    | 类型             | 必填 | 描述                                                                             |
| ------- | ---------------- | -------- | -------------------------------------------------------------------------------- |
| `paths` | array of strings | 是       | `/mnt/workspace/outputs/` 下的绝对路径。把最相关的文件放在最前面                 |

该调用超时时间为 30 秒。一次调用最多接受 20 个路径。每个路径必须位于 `/mnt/workspace/outputs/` 下，且不能包含 `..` 段。

## 文件系统布局

沙箱使用三个目录：

```text
/home/aperture/              # Working directory (assistant's scratch space)
/mnt/workspace/
    uploads/                 # User-uploaded files (read-only)
    outputs/                 # Output files (downloadable by user)
```

**`/home/aperture/`** 是命令的默认工作目录。它是脚本、临时数据、软件包和构建产物的临时空间。临时文件可能在后续回合之间消失。

**`/mnt/workspace/uploads/`** 包含用户附加到对话的文件。此目录在沙箱中是只读的。要修改上传的文件，助手必须先把它复制到 `/home/aperture/`。

**`/mnt/workspace/outputs/`** 存放最终交付物。只有此目录中的文件才能通过 `aperture_present_files` 预览和下载。

## 大小限制与配额

| 限制                                                    | 数值                                                                    | 超出后的行为                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| 文件上传大小                                            | 发送给模型的文件每个 25 MiB，仅沙箱处理的文件每个 500 MiB               | 上传被拒绝                                                     |
| 每个对话的附件数                                        | 所有消息合计 20 个上传文件                                              | 上传被拒绝                                                     |
| 存储配额生效时的对话保存文件                            | 上传与输出合计 500 MiB                                                  | 上传被拒并返回 HTTP 429，新输出可能无法保存                    |
| 存储配额生效时的每用户新增文件存储                      | 滚动 24 小时内 1 GiB                                                    | 上传被拒并返回 HTTP 429，新输出可能无法保存                    |
| 存储配额生效时的每网关新增文件存储                      | 滚动 24 小时内 10 GiB                                                   | 上传被拒并返回 HTTP 429，新输出可能无法保存                    |
| 沙箱执行容量                                            | 上传与输出合计 5 GiB                                                    | 命令和文件修改失败并报容量错误                                 |
| 命令输出                                                | 1 MiB（1,048,576 字节）                                                 | 输出被截断并给出提示                                           |
| 读取、列出或搜索输出                                    | 16,000 字节                                                             | 输出被截断并给出提示                                           |
| 命令超时（`aperture_bash`）                             | 默认 10 分钟，受 10 分钟助手回合时限约束                                | 命令被终止                                                     |
| 其他工具超时                                            | 30 秒                                                                   | 工具调用失败                                                   |
| 每次 `aperture_present_files` 调用的文件数              | 20                                                                      | 返回错误                                                       |
| 目录列表                                                | 200 个条目                                                              | 列表被截断                                                     |

存储配额取决于你的网关可用的沙箱服务。在尚未达到独立的 5 GiB 执行容量之前，它们就可能拒绝上传或阻止生成的文件保存。如果需要更高的限额，请联系 Tailscale 支持团队。相应的错误和恢复步骤请参阅[超出存储限额][docs-storage-limit]。

## 支持预览的文件类型

助手展示输出文件时，聊天界面会按文件类型渲染它们：

| 文件类型        | 扩展名                                                                                    | 预览行为                                                    |
| --------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 图像            | `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.bmp`、`.ico`、`.avif`                         | 内联图像                                                    |
| SVG             | `.svg`                                                                                    | 内联图像（出于脚本安全考虑单独处理）                        |
| PDF             | `.pdf`                                                                                    | 内联 PDF 查看器                                             |
| HTML            | `.html`、`.htm`                                                                           | 沙箱化内联预览（不加载外部资源）                            |
| Markdown        | `.md`                                                                                     | 内联渲染                                                    |
| 文本和代码      | `.txt`、`.py`、`.js`、`.jsx`、`.ts`、`.tsx`、`.go`、`.csv`、`.json`、`.yaml` 等           | 语法高亮并带行号                                            |
| 视频            | `.mp4`、`.webm`、`.mov`、`.m4v`、`.mkv`、`.avi`                                           | 内联播放                                                    |
| 音频            | `.mp3`、`.wav`、`.ogg`、`.flac`、`.m4a`、`.aac`、`.opus`                                  | 内联播放                                                    |
| 其他所有类型    | 任意                                                                                      | 仅下载                                                      |

`.jsx`、`.tsx`、`.mermaid` 等源文件以语法高亮文本显示。聊天界面不会执行 React 组件，也不会渲染 Mermaid 图。

HTML 文件在提供时带有严格的 Content-Security-Policy，阻止加载外部资源。内联脚本和样式是允许的，但页面运行在一个 origin 不透明的沙箱化 iframe 中。这意味着 HTML 输出文件无法从外部 URL 获取数据，也无法加载外部脚本。由于 iframe 未包含 `allow-same-origin`，页面以 null origin 运行，无法读写 `localStorage` 或 `sessionStorage`，也无法访问父页面的 cookie、存储或 DOM。

## 错误消息

下表列出可能出现在聊天界面或工具结果中的用户可见错误消息：

| 错误消息                                                                                                                       | 原因                                                                           | 处理方式                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `This conversation's attached files exceed the sandbox capacity (5 GiB combined). Archive or remove some files and try again.` | 文件超出沙箱执行容量                                                           | 开始新对话                                                           |
| `Conversation storage limit reached. You can contact support to request a limit increase.`                                     | 已保存的上传和输出达到对话配额                                                 | 用更少的文件开始新对话，或联系支持团队                               |
| `Storage limit reached. Try again later or contact support.`                                                                   | 达到滚动的用户或网关存储配额                                                   | 稍后重试或联系支持团队                                               |
| `... output truncated (exceeded 1 MiB) ...`                                                                                    | 命令产生的输出超过 1 MiB                                                       | 把输出重定向到文件，然后读取特定区段                                 |
| `... output truncated ...`                                                                                                     | 文件查看产生的输出超过 16,000 字节                                             | 使用 `view_range` 读取特定行范围                                     |
| `Error: string not found in {path}`                                                                                            | 文件中找不到 `old_string` 文本                                                 | 助手重新读取文件并用正确的文本重试                                   |
| `Error: string appears N times in {path} (must be unique)`                                                                     | `old_string` 文本在文件中出现多次                                              | 助手使用更多上下文使匹配唯一                                         |
| `too many paths (max 20, got N)`                                                                                               | 传给 `aperture_present_files` 的路径超过 20 个                                 | 助手把文件拆分到多次调用                                             |
| `path must be absolute and under /mnt/workspace/outputs/`                                                                      | `aperture_present_files` 的路径不在输出目录下                                  | 助手先把文件移动到 `/mnt/workspace/outputs/`                         |
| `file not found`                                                                                                               | 传给 `aperture_present_files` 的文件在指定路径不存在                           | 助手先创建文件再展示                                                 |
| `command is required`                                                                                                          | 调用 `aperture_bash` 工具时未提供命令                                          | 助手带上命令重试                                                     |
| `Exit code: N`（后跟输出）                                                                                                     | shell 命令以非零状态退出                                                       | 助手读取错误输出并调整处理方式                                       |

这些错误会作为工具结果出现在聊天中。大多数情况下，助手会自动通过重试或调整处理方式来解决。如果助手无法解决某个错误，它会在响应中说明问题。

面向管理员的错误（下载端点的 HTTP 状态码、沙箱连接问题）请参阅[排查沙箱问题][docs-troubleshooting]。

## 配置

当沙箱服务可用且对话中选择了 **Code Sandbox** 时，沙箱工具即可通过用户门户使用。用户或项目的工具策略可以禁用沙箱。

门户访问默认开放。要让匹配的非管理员用户只能使用 API，请在授权（grant）中把 `enable_portal` 设置为 `false`。这会禁用整个用户门户，包括沙箱访问。管理员始终保留门户访问，且任何匹配授权中的显式 `enable_portal: true` 会覆盖匹配的 `false`。

Tailscale 负责管理你的 Aperture 网关的沙箱可用性。设置说明请参阅[启用聊天沙箱][docs-sandbox-setup]。

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-feature-guide]: /docs/aperture/chat-sandbox

[docs-sandbox-setup]: /docs/aperture/how-to/enable-sandbox

[docs-troubleshooting]: /docs/aperture/troubleshooting/sandbox

[docs-storage-limit]: /docs/aperture/troubleshooting/sandbox#超出存储上限
