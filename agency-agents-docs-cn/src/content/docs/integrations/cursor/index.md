---
title: 'Cursor 集成'
---

# Cursor 集成

把代理公司（The Agency）的完整名册转换为 Cursor `.mdc` 规则文件。
规则是**项目级**的——请从你的项目根目录安装。

## 安装

```bash
# 从你的项目根目录运行
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool cursor
```

这会在你的项目里创建 `.cursor/rules/<agent-slug>.mdc` 文件。

## 激活一条规则

在 Cursor 中，在提示词里引用一个智能体：

```
@frontend-developer Review this React component for performance issues.
```

或者编辑规则的 frontmatter，把它设为始终启用：

```yaml
---
description: Expert frontend developer...
globs: "**/*.tsx,**/*.ts"
alwaysApply: true
---
```

## 重新生成

```bash
./scripts/convert.sh --tool cursor
```