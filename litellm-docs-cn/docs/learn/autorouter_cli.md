---
title: lite autoroute
sidebar_label: lite autoroute
description: 用 lite CLI 在本地针对真实运行的代理试用 LiteLLM 的基于复杂度的自动路由，并让 Claude Code 流量经由它转发。
---

`lite autoroute` 是 `lite` 的一个子命令。`lite` 是 [LiteLLM 代理 CLI](../proxy/management_cli.md)，还提供 `lite login`、`lite up`、`lite claude` 以及模型、密钥和团队管理命令。它让你在本地试用 LiteLLM 的基于复杂度的自动路由（complexity-based auto-routing），且只针对你的密钥在真实运行中的代理上已有权限访问的模型。它会根据提示词的复杂程度选择更便宜或更昂贵的模型，既不用修改代理的 `config.yaml`，也不会让任何请求绕过代理。它会在本地临时启动一个代理，把所有请求都转发回你的真实代理，然后在这个会话里把 Claude Code 指向该本地代理。

:::info[预览功能；期待你的反馈]

`lite autoroute` 还处于早期，仍在持续演进。哪些好用、哪里出问题、下一步想看到什么，欢迎到 [GitHub 上的 Autorouter 讨论区](https://github.com/BerriAI/litellm/discussions/32168)告诉我们。你的反馈会直接决定它的走向。

:::

代理的搭建方法和完整配置参考，见[自动路由](../proxy/auto_routing.md)。

## 1. 安装 CLI

`lite autoroute start` 会在你的机器上运行一个临时代理，因此需要完整的代理运行时：[CLI 快速上手](../proxy/management_cli.md#快速上手)里那条轻量的 `install-cli.sh` 一行命令只安装 `litellm[cli]`，在这里不够用，下面的命令会替代这种安装方式。它用一条 curl 命令从 `main` 分支安装 `litellm[proxy]`；如果缺少 `uv`，会自动装好。

```bash
curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install.sh | \
  LITELLM_CLI_REF=main sh
```

## 2. 让 CLI 指向你的代理

设置真实代理的 URL 与密钥（key）。自动路由器会带着这把密钥、经由这个代理转发每一个请求。

```bash
export LITELLM_PROXY_URL=http://localhost:4000
export LITELLM_PROXY_API_KEY=sk-...
```

## 3. 配置自动路由器

运行交互式向导。它会探测你的密钥能访问到哪些模型组（model group），并请你为每个复杂度层级（complexity tier）分配模型。

```bash
lite autoroute configure
```

## 4. 启动自动路由器

启动这个临时本地代理。它在前台运行，并打印代理的请求日志。按 Ctrl-C 即可停止并恢复你的 Claude Code 设置；如果进程以其他方式中断，可以用 `lite autoroute stop` 完成同样的清理。

```bash
lite autoroute start
```

## 5. 照常运行 Claude Code

另开一个标签页，启动 Claude Code。这时自动路由器会自动接管所有 Claude Code 流量，每轮回复后，Claude Code 的状态行都会显示 `Routed to: <model>`。

```bash
claude
```

完整参考（包括未正常关闭后的恢复方法和重要注意事项），见 [CLI README 中的 `lite autoroute` 章节](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/client/cli/README.md#qa-complexity-based-auto-routing-against-your-real-proxy)。
