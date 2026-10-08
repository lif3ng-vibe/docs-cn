---
title: 'DeepSeek Harness 集成'
---

把代理公司（The Agency）的完整名册安装为 DeepSeek Harness（DSH）技能。
每个智能体都加 `agency-` 前缀，以避免与内置技能冲突。

## 安装

```bash
./scripts/install.sh --tool dsh
```

这会把文件从 `integrations/dsh/` 复制到 `${DSH_HOME:-$HOME/.dsh}/skills/`
（用户级）。如果你的 Harness 配置在别处，请设置 `DSH_HOME`。要项目级
技能，则从你的项目根目录、以 `DSH_SKILLS_DIR=.dsh/skills` 运行安装器——
这一特定覆盖优先于 `DSH_HOME`，而且 DSH 会自动读取
`<project>/.dsh/skills/`。

> DSH 实时发现技能（被监视的根目录）：新增、改名或删除的技能
> 无需重启就会进入下一份技能目录清单（catalog）。不需要编辑任何
> 配置文件。

## 激活一个技能

在 DSH 中，技能默认用户和模型都可调用。通过斜杠命令、或在对话中
点名来激活一个智能体：

```
/agency-frontend-developer review this React component
```

或：

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
./scripts/convert.sh --tool dsh
```

## 文件格式

每个技能是一个 `SKILL.md` 文件，带标准 Agent-Skills frontmatter
（必填 `name` 和 `description`，name 须为严格 kebab-case），
智能体人格作为正文：

```markdown
---
name: 'agency-frontend-developer'
description: 'Expert frontend developer specializing in modern web technologies, React/Vue/Angular frameworks, UI implementation, and performance optimization'
---
...agent body...
```

这与 Antigravity 和 Osaurus 的技能输出（`skill-md` 格式）逐字节相同，
因此 Agency Agents 应用可以原生渲染它。

## DSH 扫描的技能根目录

| 优先级 | 来源 | 路径 |
|---|---|---|
| 100 | project | `<project>/.dsh/skills` |
| 200 | project | `<project>/.agents/skills` |
| 300 | custom | `customSkillDirs` config |
| 400 | user | `${DSH_HOME:-$HOME/.dsh}/skills` (default install) |
| 500 | user | `~/.agents/skills` |

项目技能（优先级 100/200）会遮蔽同名的用户技能（优先级 400/500），
所以对某个项目而言，项目级安装会覆盖用户级安装。