# 提示词模板

提示词模板（prompt template）能把 Markdown 文件变成可复用的 `/` 命令。当你想复用同一段提示词，又不需要添加可执行行为或更庞大的配套指令集时，就适合使用它。

模板可以接受参数，并会出现在命令补全中。Pi 可以从个人配置、项目配置、显式路径或 Pi 包中加载模板。项目配置只在授予项目信任后才会加载。

## 创建模板

创建 `~/.pi/agent/prompts/review.md`：

```markdown
---
description: Review staged git changes
argument-hint: "[focus]"
---
Review the staged changes. Focus on ${1:-correctness, security, and error handling}.
```

文件名即命令名，因此该模板可通过 `/review` 使用。`description` 会显示在命令补全中；若省略，Pi 会使用第一个非空行。

`argument-hint` 是可选的。必填参数用 `<angle brackets>`（尖括号），可选参数用 `[square brackets]`（方括号）。

在活跃会话中新增或修改模板后，请运行 `/reload`。

<a id="invoke-a-template"></a>

## 使用模板

在编辑器（editor）中输入模板命令：

```text
/review
/review concurrency
```

Pi 会在最终文本进入智能体（agent）之前先展开模板。除非有同名扩展命令处理输入，否则扩展会先通过 `input` 事件收到原始输入。

模板支持以下替换：

| 语法 | 结果 |
|---|---|
| `$1`、`$2`…… | 单个位置参数 |
| `$@` 或 `$ARGUMENTS` | 所有参数以空格连接 |
| `${1:-default}` | 第一个参数，或默认值 |
| `${@:-default}` | 所有参数，或默认值 |
| `${@:N}` | 从位置 `N` 开始的参数 |
| `${@:N:L}` | 从位置 `N` 开始的 `L` 个参数 |

参数遵循类似 shell 的引号规则，因此 `/review "API compatibility"` 会提供一个包含空格的参数。

<a id="choose-where-it-loads"></a>

## 把模板加入 Pi

将模板放在用户级或项目级提示词目录中。约定位置的提示词目录只加载直接位于其下的 `.md` 文件。

设置与包可以选中嵌套的 Markdown 文件；包清单（package manifest）可通过显式路径与 glob 收窄发现范围。相关选项参见[设置](settings.md#%E8%B5%84%E6%BA%90)与 [Pi 包](packages.md)。

项目模板会在授予信任后成为编辑器中的命令。信任不熟悉的项目之前，请先审查其内容。参见[安全](security.md#%E4%BA%86%E8%A7%A3%E9%A1%B9%E7%9B%AE%E4%BF%A1%E4%BB%BB)。
