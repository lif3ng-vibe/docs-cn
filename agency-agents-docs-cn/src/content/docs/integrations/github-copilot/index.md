---
title: 'GitHub Copilot 集成'
---

# GitHub Copilot 集成

代理公司（The Agency）开箱即支持 GitHub Copilot。无需转换——智能体使用
现有的 `.md` + YAML frontmatter 格式。

## 安装

```bash
# 把所有智能体复制到你的 GitHub Copilot 智能体目录
./scripts/install.sh --tool copilot

# 或手动复制某个类别
cp engineering/*.md ~/.github/agents/
cp engineering/*.md ~/.copilot/agents/
```

## 激活一个智能体

在任何 GitHub Copilot 会话中，直接按名字引用一个智能体：

```
Activate Frontend Developer and help me build a React component.
```

```
Use the Reality Checker agent to verify this feature is production-ready.
```

## 智能体目录

智能体按部门组织。当前完整名册见[主 README](/catalog/)。