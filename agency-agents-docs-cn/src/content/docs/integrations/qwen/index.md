---
title: 'Qwen Code 集成'
---

# Qwen Code 集成

Qwen Code 使用 `.qwen/agents/` 下的项目级 `.md` 子智能体文件。

生成的文件来自 `scripts/convert.sh --tool qwen`，它为每个智能体
向 `integrations/qwen/agents/` 写一个 SubAgent Markdown 文件。

## 生成

从仓库根目录：

```bash
./scripts/convert.sh --tool qwen
```

## 安装

从你的目标项目根目录运行安装器：

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool qwen
```

这会把生成的 SubAgent 文件复制到：

```text
.qwen/agents/
```

## 在 Qwen Code 中刷新

安装后：

- 在 Qwen Code 中运行 `/agents manage` 刷新智能体列表，或
- 重启当前 Qwen Code 会话

## 注意事项

- Qwen Code 是项目级作用域，不是用户主目录级
- 生成的 Qwen 文件使用极简 frontmatter：`name`、`description` 和
  可选的 `tools`
- 如果你在本仓库里更新了智能体，重装前请先重新生成 Qwen 产物