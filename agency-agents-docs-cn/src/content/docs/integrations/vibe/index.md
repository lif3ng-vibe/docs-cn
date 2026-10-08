---
title: 'Mistral Vibe 集成'
---

# Mistral Vibe 集成

Mistral Vibe 为每个智能体使用两个文件：
- 一个 TOML 配置文件（`~/.vibe/agents/<slug>.toml`）
- 一个 Markdown 提示词文件（`~/.vibe/prompts/<slug>.md`）

生成的文件来自 `scripts/convert.sh --tool vibe`，它为每个智能体
分别向 `integrations/vibe/agents/` 和 `integrations/vibe/prompts/`
写入一个 TOML 智能体配置和一个 Markdown 提示词文件。

## 生成

从仓库根目录：

```bash
./scripts/convert.sh --tool vibe
```

## 安装

从你的目标目录运行安装器：

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool vibe
```

这会把生成的文件复制到：

```text
~/.vibe/agents/<slug>.toml
~/.vibe/prompts/<slug>.md
```

你可以用 `VIBE_HOME` 环境变量覆盖安装目的地：

```bash
VIBE_HOME=~/.config/vibe ./scripts/install.sh --tool vibe
```

## 生成格式

每个生成的智能体文件对位于：

```text
integrations/vibe/agents/<slug>.toml
integrations/vibe/prompts/<slug>.md
```

### 智能体 TOML 文件

最简的 Vibe 智能体配置：

```toml
agent_type = "agent"
system_prompt_id = "<slug>"
```

用户可以在自己的智能体 TOML 文件里指定 `active_model`，或依赖
Vibe 配置的默认模型。

### 提示词 Markdown 文件

提示词文件包含：
- 一个带智能体名的标题头
- 智能体描述
- 源智能体的完整 Markdown 正文

## 用法

安装后，在 Mistral Vibe 中按系统提示词 ID（与文件名 slug 一致）
引用智能体。

示例：
```text
Use the Code Reviewer agent to analyze this pull request.
```

## 过滤

只安装特定部门或特定智能体：

```bash
# 只安装 Division 1 的智能体
./scripts/install.sh --tool vibe --division 1

# 只安装 code-reviewer 这一个智能体
./scripts/install.sh --tool vibe --agent code-reviewer
```

## 重新生成

修改源智能体后：

```bash
./scripts/convert.sh --tool vibe
./scripts/install.sh --tool vibe
```

## 故障排查

### 未检测到 Mistral Vibe

确保 `vibe` 在你的 PATH 里，或 `~/.vibe/` 已存在：

```bash
which vibe
vibe --version
```

### 集成文件未生成

安装前请先生成 Vibe 产物：

```bash
./scripts/convert.sh --tool vibe
```