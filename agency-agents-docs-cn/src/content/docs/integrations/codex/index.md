---
title: 'Codex 集成'
---

把代理公司（The Agency）的所有智能体转换为 Codex 自定义智能体 TOML
文件。每个源智能体变成一个独立的 `.toml` 文件，只包含 Codex 要求的
极简字段：`name`、`description` 和 `developer_instructions`。

## 安装

### 前置条件

- 已安装 [Codex](https://developers.openai.com/codex/overview)

### 转换并安装

```bash
# 生成集成文件（全新 clone 后必做）
./scripts/convert.sh --tool codex

# 安装智能体
./scripts/install.sh --tool codex
```

这会把生成的智能体文件复制到 `~/.codex/agents/`。

## 生成格式

每个生成文件位于：

```text
integrations/codex/agents/<slug>.toml
```

映射刻意保持极简：

- `name` 从源 frontmatter 原样复制
- `description` 从源 frontmatter 原样复制
- `developer_instructions` 包含完整且未改动的 Markdown 正文

仅源文件使用的元数据（如 `color`、`emoji`、`vibe` 等不支持的
frontmatter 字段）会被省略。

## 用法

安装后，在 Codex 中按名字引用自定义智能体：

```text
Use the Frontend Developer agent to review this component.
```

Codex 以 TOML 文件内的 `name` 字段为唯一事实来源，所以生成的文件名
slug 只是为了文件系统安全。

## 重新生成

修改源智能体后：

```bash
./scripts/convert.sh --tool codex
./scripts/install.sh --tool codex
```

## 故障排查

### 找不到 Codex 集成

安装前请先生成 Codex 产物：

```bash
./scripts/convert.sh --tool codex
```

### 未检测到 Codex

确保 `codex` 在你的 PATH 里，或 `~/.codex/` 已存在：

```bash
which codex
codex --help
```