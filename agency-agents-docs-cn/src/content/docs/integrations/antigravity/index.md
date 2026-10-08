---
title: 'Antigravity 集成'
---

把代理公司（The Agency）的完整名册安装为 Antigravity 技能。每个智能体
都加 `agency-` 前缀，以避免与现有技能冲突。

## 安装

```bash
./scripts/install.sh --tool antigravity
```

这会把文件从 `integrations/antigravity/` 复制到
`~/.gemini/config/skills/`（全局）。项目级技能方面，Antigravity
还会读取 `<project>/.agents/skills/`。

## 激活一个技能

在 Antigravity 中，通过 slug 激活一个智能体：

```
Use the agency-frontend-developer skill to review this component.
```

可用的 slug 遵循 `agency-<agent-name>` 模式，例如：
- `agency-frontend-developer`
- `agency-backend-architect`
- `agency-reality-checker`
- `agency-growth-hacker`

## 重新生成

修改智能体后，重新生成技能文件：

```bash
./scripts/convert.sh --tool antigravity
```

## 文件格式

每个技能是一个带 Antigravity 兼容 frontmatter 的 `SKILL.md` 文件：

```yaml
---
name: agency-frontend-developer
description: Expert frontend developer specializing in...
risk: low
source: community
date_added: '2026-03-08'
---
```