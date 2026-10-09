# 在隔离环境中运行 Pi

使用隔离环境可以限制生成命令能访问或影响的文件、凭据、进程与网络服务。

你可以隔离完整的 Pi 进程，也可以让 Pi 留在主机上，只把选定的工具路由进隔离环境。

## 选择隔离方式

| 方式 | Pi 运行位置 | 隔离范围 | 凭据处理 | 最适合 |
|---|---|---|---|---|
| 原生 Docker | 容器 | Pi、内置工具、`!` 命令与扩展 | 凭据传入容器 | 简单直接的本地容器边界 |
| Docker Sandboxes | 托管沙箱 | Pi、内置工具、`!` 命令与扩展 | 提供商凭据保留在主机上，由代理替换 | 托管式本地隔离，且不暴露真实的提供商密钥 |
| OpenShell | 本地或远程沙箱 | Pi、内置工具、`!` 命令与扩展 | 由策略控制的凭据与推理路由 | 文件系统、进程、网络与凭据策略 |
| Gondolin 扩展 | 主机 | 内置工具与 `!` 命令 | Pi 已保存的凭据留在主机上，但命令会继承主机的环境变量 | 用本地微型虚拟机执行工具，同时保留主机接口 |

所选方式会改变扩展的运行位置。当完整的 Pi 进程运行在隔离环境内时，其扩展也在其中运行。当主机上的 Pi 通过 Gondolin 委托内置工具时，其他扩展工具仍在主机上运行，除非它们也委托自己的工作。

## 决定 Pi 能访问什么

隔离后的进程仍然会影响你暴露给它的资源：

- 可读写的主机挂载让 Pi 能修改那些主机文件。
- 挂载 `~/.pi/agent` 会暴露你的 Pi 凭据、设置、扩展与会话。
- 传入容器的环境变量对容器内的进程可见。
- 网络访问可能让代码或工具输出离开该环境。
- 仅隔离工具不会约束主机上的 Pi 进程，也不约束未使用隔离后端的扩展工具。

只暴露任务所需的工作目录、凭据与网络目标。如果不希望写入影响主机，使用只读挂载，或把文件复制进出该环境。

## 在原生 Docker 中运行 Pi

原生 Docker 提供最简单的整进程容器边界。

### 构建镜像

创建 `Dockerfile.pi`：

```dockerfile
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates git ripgrep \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

WORKDIR /workspace
ENTRYPOINT ["pi"]
```

在包含该文件的目录中构建：

```bash
docker build -t pi-sandbox -f Dockerfile.pi .
```

### 启动 Pi

在你想让 Pi 访问的工作目录中运行：

```bash
docker run --rm -it \
  -e ANTHROPIC_API_KEY \
  -v "$PWD:/workspace" \
  -v pi-agent-home:/root/.pi/agent \
  pi-sandbox
```

把 `ANTHROPIC_API_KEY` 替换为你的提供商所需的凭据。命名卷 `pi-agent-home` 可在多次运行之间保留容器内的设置、凭据与会话。

除非你确实想让容器访问主机上的 Pi 配置与凭据，否则不要挂载主机的 `~/.pi/agent`。

### 验证工作区

在 Pi 内运行：

```text
!pwd
```

该命令应报告 `/workspace`。`/workspace` 下的更改会直写进挂载的主机目录。如果不能接受这一点，请移除绑定挂载或改用只读挂载。

## 通过 Docker Sandboxes 运行 Pi

[Docker Sandboxes](https://docs.docker.com/ai/sandboxes/) 会在托管沙箱内运行完整的 Pi 进程。其代理可以把真实的提供商凭据保留在主机上，并在请求离开沙箱时替换它。

创建沙箱之前先配置凭据。不要在沙箱内运行 `/login`，因为那会把真实凭据写进沙箱。

### 使用 Claude Pro 或 Max 令牌

在装有 Claude Code 的机器上用 `claude setup-token` 生成令牌。如果已配置 `anthropic` secret，先将其移除，以免代理在 bearer 令牌之外再附加一个 API 密钥头：

```bash
sbx secret rm anthropic

sbx secret set-custom \
  --host api.anthropic.com \
  --env ANTHROPIC_OAUTH_TOKEN \
  --placeholder 'sk-ant-oat01-{rand}'
```

`sbx secret set-custom` 从标准输入读取真实令牌。沙箱收到的是一个 OAuth 形状的占位符，代理只对发往所配置主机的请求将其替换。

如果是 Anthropic API 密钥，改用 `sbx secret set anthropic`。

### 启动 Pi

在你想挂载的工作目录中运行：

```bash
sbx run --kit "docker.io/sbx/pi-kit:latest" pi
```

对于已有的沙箱，用以下命令以非交互方式运行 Pi：

```bash
sbx exec <sandbox-name> -- pi -p "list the failing tests"
```

其他提供商、故障排查与镜像固定参见 [Pi kit 文档](https://github.com/docker/sbx-kits-contrib/tree/main/pi)。

## 通过 OpenShell 运行 Pi

[NVIDIA OpenShell](https://docs.nvidia.com/openshell/about/overview) 提供带文件系统、进程、网络、凭据与推理策略的本地或远程沙箱。

### 选择网关

每个沙箱都需要一个活动的网关：

```bash
openshell gateway add <gateway-url> --name <name>
openshell gateway select <name>
```

### 创建沙箱

```bash
openshell sandbox create --name pi-sandbox --from pi -- pi
```

Pi、其内置工具、`!` 命令与扩展工具都在 OpenShell 边界内运行。

### 向远程沙箱传输文件

远程网关不会绑定挂载你的主机工作目录。可在沙箱内克隆仓库，或显式传输文件：

```bash
openshell sandbox upload pi-sandbox ./working-folder /workspace
openshell sandbox download pi-sandbox /workspace/working-folder ./working-folder-out
```

OpenShell 的推理路由可以把原始模型凭据留在沙箱之外。完成配置后，将 Pi 指向网关暴露的相应 OpenAI 兼容或 Anthropic 兼容端点。

## 通过 Gondolin 路由工具

[Gondolin](https://github.com/earendil-works/gondolin) 是一个本地 Linux 微型虚拟机。其示例扩展让 Pi 进程与基于文件的提供商凭据留在主机上，同时把内置工具和用户的 `!` 命令路由进虚拟机。

虚拟机内的命令会继承主机进程的环境。因此，通过环境变量提供的提供商密钥在虚拟机内可能可见。除非你移除了敏感变量或修改了扩展的环境处理方式，否则不要把这个模式当作凭据边界。

Gondolin 需要 Node.js 23.6 或更新版本，以及通过操作系统包管理器安装的 QEMU。

### 安装扩展

在 Pi 源码检出目录中：

```bash
mkdir -p ~/.pi/agent/extensions
cp -R packages/coding-agent/examples/extensions/gondolin ~/.pi/agent/extensions/gondolin
cd ~/.pi/agent/extensions/gondolin
npm install --ignore-scripts
```

### 启动 Pi

在你想挂载的工作目录中运行 Pi：

```bash
cd /path/to/working-folder
pi -e ~/.pi/agent/extensions/gondolin
```

该扩展把主机工作目录挂载到虚拟机的 `/workspace`，并覆盖 `read`、`write`、`edit`、`bash`、`grep`、`find` 与 `ls`。`/workspace` 下的文件更改会直写到主机。

其他扩展工具仍在主机上运行，除非它们显式委托自己的操作。在添加可能绕过虚拟机边界的工具之前，先审查 [Gondolin 示例](../examples/extensions/gondolin/)。
