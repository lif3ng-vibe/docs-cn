# 技能

技能（skill）为 Pi 提供针对特定工作的专门指令与配套文件。Pi 会以名称和描述通告每个可用技能，只在任务需要时才加载其完整指令。

当工作流所需的上下文（context）超出提示词模板（prompt template）所能承载，但又不需要新的可执行集成点时，就使用技能。技能可以把脚本、参考资料和资源文件与指令打包在一起。

Pi 实现了 [Agent Skills 规范](https://agentskills.io/specification)。大多数字段无效时只会产生警告，而不会阻止启动。

## 创建技能

技能是一个包含 `SKILL.md` 的目录：

```text
pdf-tools/
├── SKILL.md
├── scripts/
│   └── extract.sh
├── references/
│   └── formats.md
└── assets/
    └── template.json
```

`SKILL.md` 以 frontmatter 开头，随后是直接指令：

```markdown
---
name: pdf-tools
description: Extract text and tables from PDF files. Use when reading, converting, or inspecting PDFs.
---

# PDF tools

Read `references/formats.md` before converting a document. Run scripts relative to this skill directory.
```

`description` 决定模型何时考虑加载该技能。描述既要说明技能做什么，也要说明它适用于哪些场景。避免使用"Helps with PDFs"这类提供不了足够路由信息的描述。

引用打包文件时，请使用相对于技能目录的路径。Pi 会告知模型技能所在位置，使其能够解析这些路径。

## 了解技能的加载方式

启动时，Pi 会扫描已配置的技能位置，并把每个技能的名称、描述和路径加入系统提示词（system prompt），但不会加入完整指令。

当任务匹配时，模型会读取 `SKILL.md` 并遵循其指令。这样，详细的指引在被需要之前就不会进入上下文。模型有可能未能加载相关技能，因此需要强制加载时请使用 `/skill:name`。

`/skill:name` 之后的参数会作为用户请求附加到已加载的指令之后：

```text
/skill:pdf-tools extract report.pdf
```

当某个技能只应通过其显式命令使用时，在 frontmatter 中设置 `disable-model-invocation: true`。`enableSkillCommands` [设置](settings.md)控制技能命令是否出现在交互模式（interactive mode）的命令发现中；手动输入的 `/skill:name` 命令仍然有效。

<a id="choose-where-it-loads"></a>

## 把技能加入 Pi

将技能放在用户级或项目级技能目录中。包含 `SKILL.md` 的目录会被递归发现。

Pi 也支持 Agent Skills 的 `~/.agents/skills/` 与 `.agents/skills/` 位置。项目级 `.agents/skills/` 目录会从工作目录沿祖先目录向上发现，遇到仓库根目录（如存在）即停止。

Pi 也接受部分独立的 Markdown 技能，但包含 `SKILL.md` 的目录才是可移植形式，应优先采用。其他可用位置参见[设置](settings.md#resources)与 [Pi 包](packages.md)。

项目技能可能指示模型运行脚本或修改文件。授予项目信任之前，请先审查不熟悉的技能及其配套文件。

## 编写可移植的 frontmatter

Agent Skills 规范定义了以下字段：

| 字段 | 用途 |
|---|---|
| `name` | 命令名与显示名 |
| `description` | 展示给模型的路由描述 |
| `license` | 许可证名称或随附的许可证文件 |
| `compatibility` | 环境要求 |
| `metadata` | 额外的键值元数据 |
| `allowed-tools` | 实验性的预批准工具列表 |
| `disable-model-invocation` | 在模型的自动选择中隐藏该技能 |

名称使用小写字母、数字和连字符，开头与结尾不能是连字符，也不能出现连续连字符。名称最多 64 个字符；描述最多 1024 个字符。

当声明的名称与父目录名不一致时，Pi 既不强制要求也不发出警告。其他 Agent Skills 实现可能会强制这一要求，因此保持两者一致仍是更可移植的选择。

格式错误的 `SKILL.md` 文件，以及已声明但没有描述的技能，都不会被加载。名称冲突时保留最先发现的技能，并产生一条警告。

## 验证并分享技能

在技能可被发现的位置运行 Pi，然后检查启动诊断信息与 `/skill:name` 命令。在活跃会话中编辑技能后，请运行 `/reload`。

使用 [Pi 包](packages.md)通过 npm 或 git 分发一个或多个技能。环境设置放在技能内部，所需的运行时依赖则在包中声明。

示例参见 [Anthropic 技能合集](https://github.com/anthropics/skills)与 [Pi 技能合集](https://github.com/badlogic/pi-skills)。
