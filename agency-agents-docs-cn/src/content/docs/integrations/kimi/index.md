---
title: 'Kimi Code CLI 集成'
---

把代理公司（The Agency）的所有智能体转换为 Kimi Code CLI 智能体规格。
每个智能体变成一个目录，内含 `agent.yaml`（智能体规格）和 `system.md`
（系统提示词）。

## 安装

### 前置条件

- 已安装 [Kimi Code CLI](https://github.com/MoonshotAI/kimi-cli)

### 安装

```bash
# 生成集成文件（全新 clone 后必做）
./scripts/convert.sh --tool kimi

# 安装智能体
./scripts/install.sh --tool kimi
```

这会把智能体复制到 `~/.config/kimi/agents/`。

## 用法

### 激活一个智能体

使用 `--agent-file` 标志加载特定智能体：

```bash
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml
```

### 在项目中

```bash
cd /your/project
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml \
     --work-dir /your/project \
     "Review this React component for performance issues"
```

### 列出已安装的智能体

```bash
ls ~/.config/kimi/agents/
```

## 智能体结构

每个智能体目录包含：

```
~/.config/kimi/agents/frontend-developer/
├── agent.yaml    # Agent specification (tools, subagents)
└── system.md     # System prompt with personality and instructions
```

### agent.yaml 格式

```yaml
version: 1
agent:
  name: frontend-developer
  extend: default  # Inherits from Kimi's built-in default agent
  system_prompt_path: ./system.md
  tools:
    - "kimi_cli.tools.shell:Shell"
    - "kimi_cli.tools.file:ReadFile"
    # ... all default tools
```

## 重新生成

修改源智能体后：

```bash
./scripts/convert.sh --tool kimi
./scripts/install.sh --tool kimi
```

## 故障排查

### 找不到智能体文件

确保你在 `install.sh` 之前跑过 `convert.sh`：

```bash
./scripts/convert.sh --tool kimi
```

### 未检测到 Kimi CLI

确保 `kimi` 在你的 PATH 里：

```bash
which kimi
kimi --version
```

### YAML 不合法

校验生成的文件：

```bash
python3 -c "import yaml; yaml.safe_load(open('integrations/kimi/frontend-developer/agent.yaml'))"
```