---
title: "macOS 支持"
description: "macOS 是受支持的平台：workspace 测试套件在 macOS CI 上运行，带标签的发布提供原生 ai-memory-macos-aarch64.tar.gz（Apple Silicon）与 ai-memory-macos-x86_64.tar.gz（Intel）二进制。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/macos.md"
---

# macOS 支持

macOS 是受支持的平台：workspace 测试套件在 macOS CI 上运行，带标签的发布提供原生 `ai-memory-macos-aarch64.tar.gz`（Apple Silicon）与 `ai-memory-macos-x86_64.tar.gz`（Intel）二进制。

macOS 上运行 ai-memory 推荐用**原生二进制**（预构建发布版或源码构建）。它把服务器绑在 `127.0.0.1:49374`，MCP 端点与生命周期钩子都对接这个环回地址——原生智能体够得到，且它已在默认 Host 头允许列表里。偏好容器化服务器时 Docker 包装器同样受支持。

与 Windows 不同，macOS 只有一个「路径世界」：全程 POSIX 路径与 POSIX `.sh` 钩子。没有 WSL 与原生之分可供搞错。

## 经验法则

从启动 Claude Code、Codex、Cursor、Gemini CLI 或其他智能体的同一个 shell 里运行 `install-mcp` / `install-hooks`——macOS 上那就是你平常的终端。

- 智能体以原生 macOS 进程运行，所以其配置必须指向**宿主可达**的服务器 URL。原生安装与 Docker 包装器的 `install-mcp` / `install-hooks` 命令渲染 `http://127.0.0.1:49374`，宿主智能体可达。
- 钩子按两种平台之一渲染：
  - `posix-native`——直接调 `ai-memory hook --event …`。原生 macOS/Linux Claude Code 安装（cargo / 发布二进制）的默认；用本地事件暂存（spool）+ OIDC 令牌回退。
  - `posix`——`sh` 运行随附的 `.sh` 脚本。Docker 包装器的默认。

  接钩子之前设 `AI_MEMORY_HOOK_PLATFORM` 可覆盖默认。

## 场景 A：预构建发布二进制（推荐，无需工具链）

想要本地服务器加原生钩子、又不想装 Rust 工具链或 Docker 时用这条。每个带标签的发布按架构各出一个 macOS 压缩包。

```bash
# 1. 按你的芯片下载压缩包，解压到固定位置。
#    aarch64 = Apple Silicon（M 系列）；x86_64 = Intel。
mkdir -p ~/Applications/ai-memory && cd ~/Applications/ai-memory
curl -fsSL -O https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-macos-aarch64.tar.gz
tar -xzf ai-memory-macos-aarch64.tar.gz
# `curl` 下载不会触发 Gatekeeper 隔离，二进制可以直接跑。
# 若是经浏览器下载的，清一次隔离标志：
#   xattr -d com.apple.quarantine ./ai-memory

# 2. 初始化数据目录（默认 ~/Library/Application Support/ai-memory；
#    用 AI_MEMORY_DATA_DIR 覆盖）。
./ai-memory init

# 3. 启动服务器（仅环回）。
./ai-memory serve --transport http --bind 127.0.0.1:49374
```

在第二个终端里接好智能体：

```bash
cd ~/Applications/ai-memory
# `install-hooks` 自动探测二进制旁随附的 hooks/ 目录。
./ai-memory install-hooks --agent claude-code --apply
./ai-memory install-mcp --client claude-code --apply
```

注意：

- 这个单用户环回配置下，MCP 端点、捕获钩子与 `ai-memory status` 无需 token 即可工作。若你为服务器显式配置了 `AI_MEMORY_AUTH_TOKEN`，CLI 命令用 `--auth-token` 传同一 token 或导出它。
- 解压出的 `ai-memory` 保持固定路径；钩子命令引用它。移动后重跑 `install-hooks`。

## 场景 B：源码构建

开发 ai-memory 本身时用这条。要求 Rust 1.95（`rust-toolchain.toml`）加 Xcode Command Line Tools（`xcode-select --install`）；SQLite 已捆绑、libgit2 已 vendored，无需额外系统库。

```bash
git clone https://github.com/akitaonrails/ai-memory
cd ai-memory
cargo build --release --workspace
./target/release/ai-memory init
./target/release/ai-memory serve --transport http --bind 127.0.0.1:49374
```

在仓库的另一个 shell 里，`install-hooks` 自动找到随附的 `hooks/`（仓库根下不需要 `--source`）：

```bash
./target/release/ai-memory install-hooks --agent claude-code --apply
./target/release/ai-memory install-mcp   --client claude-code --apply
```

## 场景 C：Docker 包装器

想要服务器数据放 Docker 卷、而智能体仍作为原生 macOS 进程运行时用这条。包装器为宿主侧智能体配置渲染 `http://127.0.0.1:49374`，但它自己的瘦客户端命令经 Docker Desktop 的 `host.docker.internal` 别名从辅助容器内访问服务器。

```bash
# 起服务器。镜像默认允许列表含 host.docker.internal，
# 包装器瘦客户端命令（status、search……）不会被 403 拒绝。
docker run -d --name ai-memory --restart unless-stopped \
    -p 127.0.0.1:49374:49374 -v ai-memory-data:/data \
    akitaonrails/ai-memory:latest

# 接原生宿主智能体。包装器让这些渲染出的 URL 保持在环回。
ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
```

发布的 Docker 镜像含 `linux/amd64` 与 `linux/arm64` 两架构，Apple Silicon 无需 `--platform linux/amd64` 即可拉到原生 arm64 镜像。

## macOS 上的钩子平台

`AI_MEMORY_HOOK_PLATFORM` 选择钩子命令的渲染方式。macOS 上相关的两个值是 `posix-native`（直接调二进制；原生默认）与 `posix`（随附 `.sh` 脚本；Docker 包装器默认）。运行 `install-hooks` 之前设置它，让选择固化进渲染出的命令。原生钩子在本地暂存事件、做短的会话启动清理、并启动分离的会话结束 `hook-drain` 辅助进程；整分钟级的暂存时序覆盖与 Windows 共享，见 [Windows 支持的「调整暂存时序」一节](/windows/#调整暂存时序高延迟实例)。

原生 `posix-native` 的 `ai-memory hook` 命令在暂存或网络投递之前强制执行就近标记的 `[capture] ignore_paths` 策略。Docker 包装器的 `posix` shell 脚本路径不执行。升级后重跑 `install-hooks --agent <agent> --apply` 刷新既有原生安装；见[捕获排除](/marker-file/#捕获排除capture-exclusions)。

## macOS 故障排查

- **Docker 包装器 CLI 命令报 `403 forbidden host`：** 更新 Docker 镜像与包装器脚本。当前镜像已把 `host.docker.internal` 加进环回发布的 Docker Desktop 服务器允许列表。
- **智能体配置指向 `host.docker.internal`：** 用当前包装器重跑 `ai-memory install-mcp --client <client> --apply` 与 `ai-memory install-hooks --agent <agent> --apply`。宿主侧智能体配置应该用 `http://127.0.0.1:49374`。
- **从发布压缩包找不到钩子包：** 确认解压了整个 tarball 而不只是二进制。当前 `install-hooks` 自动探测同级的 `hooks/` 目录。
- **Apple Silicon 上的平台不匹配警告：** 更新到当前的 Docker tag。带标签的发布提供含 `linux/arm64` 的多架构 manifest。

## 建议的测试清单

1. `ai-memory serve --bind 127.0.0.1:49374` 启动并打出 `bind=127.0.0.1:49374` 日志。
2. `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:49374/mcp` 返回 `405`（可达；GET 不允许），确认环回服务器在线。
3. `install-hooks --agent claude-code --apply` 写出的钩子命令引用 `http://127.0.0.1:49374` 与宿主侧路径。
4. `install-mcp --client claude-code` 渲染 `http://127.0.0.1:49374/mcp`。
5. 启动智能体，调 `memory_status`，发一条提示词，然后确认捕获（`ai-memory status` 显示非零观察数，或查 SQLite 的 `observations` 表）。

反馈时说明你用的是哪个场景、芯片（Apple Silicon / Intel）、智能体及版本，以及钩子是执行成功还是以连接/解析错误失败。
