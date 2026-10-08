---
title: 'Claude Code 集成'
---

# Claude Code 集成

代理公司（The Agency）就是为 Claude Code 而生的。无需转换——智能体以
现有的 `.md` + YAML frontmatter 格式原生工作。

## 安装

```bash
# 把所有智能体复制到你的 Claude Code 智能体目录
./scripts/install.sh --tool claude-code

# 或手动复制某个类别
cp engineering/*.md ~/.claude/agents/
```

## 激活一个智能体

在任何 Claude Code 会话中，直接按名字引用一个智能体：

```
Activate Frontend Developer and help me build a React component.
```

```
Use the Reality Checker agent to verify this feature is production-ready.
```

## 智能体目录

智能体按部门组织。完整名册见[主 README](../../README.md)。