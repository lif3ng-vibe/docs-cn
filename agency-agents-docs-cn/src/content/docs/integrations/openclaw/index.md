---
title: 'OpenClaw 集成'
---

# OpenClaw 集成

OpenClaw 智能体以工作区形式安装，内含 `SOUL.md`、`AGENTS.md`
和 `IDENTITY.md` 文件。安装器把每个工作区复制到
`~/.openclaw/agency-agents/`，并在 `openclaw` CLI 可用时注册它。

安装前，先生成 OpenClaw 工作区：

```bash
./scripts/convert.sh --tool openclaw
```

## 安装

```bash
./scripts/install.sh --tool openclaw
```

## 激活一个智能体

安装后，智能体在 OpenClaw 会话中以 `agentId` 可用。

如果 OpenClaw 网关已在运行，安装后请重启它：

```bash
openclaw gateway restart
```

## 重新生成

```bash
./scripts/convert.sh --tool openclaw
```