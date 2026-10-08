---
title: 'OpenCode 集成'
---

> **❌ 不要这样做：**
>
> ```bash
> # 错误——会因 schema 校验报错
> cp agency-agents/engineering/*.md .opencode/agents/
> ```
>
> **✅ 改为这样做：**
>
> ```bash
> /path/to/agency-agents/scripts/install.sh --tool opencode
> ```
>
> 源文件使用命名颜色和一个 OpenCode 会拒绝的 `tools` 字段。
> 安装器会自动把颜色转换成 `#RRGGBB` 十六进制，并剥掉不兼容的字段。

OpenCode 智能体是存储在 `.opencode/agents/` 中的带 YAML frontmatter
的 `.md` 文件。转换器把命名颜色映射为十六进制色值，并加上
`mode: subagent`，让智能体通过 `@agent-name` 按需调用，
而不是挤占主智能体选择器。

## 安装

```bash
# 从你的项目根目录运行
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool opencode
```

这会在你的项目目录里创建 `.opencode/agents/<slug>.md` 文件。

## 激活一个智能体

在 OpenCode 中，用 `@` 前缀调用一个子智能体：

```
@frontend-developer help build this component.
```

```
@reality-checker review this PR.
```

你也可以在 OpenCode 界面的智能体选择器里选择智能体。

## 智能体格式

每个生成的智能体文件包含：

```yaml
---
name: Frontend Developer
description: Expert frontend developer specializing in modern web technologies...
mode: subagent
color: "#00FFFF"
---
```

- **mode: subagent**——智能体按需可用，不在主 Tab 循环列表里显示
- **color**——十六进制色值（源文件的命名颜色会被自动转换）

## 项目级还是全局

`.opencode/agents/` 中的智能体是**项目级**的。要让它们在所有项目
全局可用，先生成智能体文件，再用 `--path` 安装：

```bash
./scripts/convert.sh --tool opencode
./scripts/install.sh --tool opencode --path ~/.config/opencode/agents
```

## 重新生成

```bash
./scripts/convert.sh --tool opencode
```