---
title: 'Gemini CLI 集成'
---

把代理公司（The Agency）的所有智能体打包为 Gemini CLI 子智能体。
这些智能体安装到 `~/.gemini/agents/`。

## 安装

```bash
# 先生成 Gemini CLI 智能体文件
./scripts/convert.sh --tool gemini-cli

# 然后安装到 ~/.gemini/agents/
./scripts/install.sh --tool gemini-cli
```

## 使用一个智能体

在 Gemini CLI 中，在提示词里按名字引用一个智能体：

```
Use the frontend-developer agent to help me build this UI.
```

或者，如果你使用的 Gemini CLI 版本支持，直接调用智能体：

```bash
gemini --agent frontend-developer "How should I structure this React component?"
```

## 目录结构

```
~/.gemini/agents/
  frontend-developer.md
  backend-architect.md
  reality-checker.md
  ...
```

## 重新生成

```bash
./scripts/convert.sh --tool gemini-cli
```