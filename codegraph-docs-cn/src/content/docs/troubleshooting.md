---
title: 故障排查
description: 最常见 CodeGraph 问题的修复方法。
---

## "CodeGraph not initialized"（CodeGraph 未初始化）

请先在项目目录中运行 `codegraph init`。

## 索引很慢

检查 `node_modules` 等大型目录是否已被排除（凡被 gitignore 的目录都会被排除）。用 `--quiet` 减少输出开销。

## MCP 遇到 `database is locked`

当前版本不应再出现此问题：CodeGraph 自带 Node 运行时，并使用 Node 内置的 `node:sqlite` 以 WAL 模式运行，并发读取永远不会被写入方阻塞。如果你仍然遇到：

- **你的安装版本太旧（0.9 之前）。** 请重新安装以获得自带运行时——`curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh`（macOS/Linux）、`irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex`（Windows），或 `npm i -g @colbymchenry/codegraph@latest`。
- **`codegraph status` 显示的 `Journal:` 不是 `wal`**——该文件系统无法启用 WAL（网络共享与 WSL2 的 `/mnt` 下很常见），读取就可能被写入阻塞。请把项目（连同 `.codegraph/` 目录）移到本地磁盘。

## MCP 服务器连不上

服务器由你的智能体自行启动，因此无需手动运行。确认项目已初始化并建立索引（`codegraph status`），且 MCP 配置中的路径正确无误。如果仍然连不上，重新运行 `codegraph install` 重写配置。

## 符号缺失

MCP 服务器会在保存时自动同步（稍等几秒）。必要时可手动运行 `codegraph sync`。检查该文件的语言是否属于[受支持的语言](/reference/languages/)，并且不在被 `.gitignore` 忽略或默认排除的目录里（如 `node_modules`、`dist`）。

## 在 Windows 与 WSL 之间共享同一份检出

不要让两边指向同一个 `.codegraph/`：后台服务器的锁和 SQLite 索引都与写入它们的操作系统绑定，而 SQLite 锁在跨越 WSL2/Windows 文件系统边界时并不可靠。在同一棵目录树里给两边各配一份索引：在其中一侧把 `CODEGRAPH_DIR` 设为一个不同的名字——例如在 Windows 侧设 `CODEGRAPH_DIR=.codegraph-win`，让 WSL 继续使用默认的 `.codegraph`。CodeGraph 在索引和监听时会跳过所有同级的 `.codegraph-*` 目录，两边因此互不干扰。
