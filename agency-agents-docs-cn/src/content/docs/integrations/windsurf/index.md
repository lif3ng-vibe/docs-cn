---
title: 'Windsurf 集成'
---

# Windsurf 集成

代理公司（The Agency）的完整名册被合并成单个 `.windsurfrules` 文件。
规则是**项目级**的——请从你的项目根目录安装。

## 安装

```bash
# 从你的项目根目录运行
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool windsurf
```

## 激活一个智能体

在 Windsurf 中，在提示词里按名字引用一个智能体：

```
Use the Frontend Developer agent to build this component.
```

## 重新生成

```bash
./scripts/convert.sh --tool windsurf
```