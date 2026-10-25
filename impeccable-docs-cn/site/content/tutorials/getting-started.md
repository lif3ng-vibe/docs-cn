---
title: 新手入门
tagline: "从安装到第一次打磨，大约十分钟。"
order: 1
description: "安装 Impeccable，运行一次 /impeccable init 建立设计上下文，再对已有的东西跑一次 /impeccable polish。这是见识 Impeccable 如何改变 AI 生成设计的最短路径。"
---

## 你将完成什么

学完这篇教程，你将装好 Impeccable、保存好设计上下文，并用一次 polish 改进一个既有页面。总耗时：约十分钟。

## 前置条件

- 一个 AI 编码宿主：Claude Code、Cursor、GitHub Copilot、Gemini CLI、Codex CLI，或其他受支持的工具。
- 一个至少包含一个想改进的 HTML 或组件文件的项目。新建脚手架生成的落地页就可以。

## Impeccable 的工作方式

Impeccable 以单个 agent 技能的形式安装，名为 `impeccable`。全部 23 条命令都通过它访问：

```
/impeccable <command> <target>
```

例如：`/impeccable polish the pricing page`，或 `/impeccable audit the checkout`。单独输入 `/impeccable` 可以看到完整列表。

某条命令用得频繁，就用 `/impeccable pin <command>` 把它固定成独立快捷方式（比如 `/impeccable pin audit` 让你直接用 `/audit`）。

如果只记得住一条序列，记住这条：

```
npx impeccable install
/impeccable init
/impeccable polish the page you care about
```

## 第 1 步：安装

<div class="docs-note">
  <span class="docs-note-icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.922 16.992c-.861 1.495-5.859 5.023-11.922 5.023-6.063 0-11.061-3.528-11.922-5.023A.641.641 0 0 1 0 16.736v-2.869a.841.841 0 0 1 .053-.22c.372-.935 1.347-2.292 2.605-2.656.167-.429.414-1.055.644-1.517a10.195 10.195 0 0 1-.052-1.086c0-1.331.282-2.499 1.132-3.368.397-.406.89-.717 1.474-.952 1.399-1.136 3.392-2.093 6.122-2.093 2.731 0 4.767.957 6.166 2.093.584.235 1.077.546 1.474.952.85.869 1.132 2.037 1.132 3.368 0 .368-.014.733-.052 1.086.23.462.477 1.088.644 1.517 1.258.364 2.233 1.721 2.605 2.656a.832.832 0 0 1 .053.22v2.869a.641.641 0 0 1-.078.256ZM12.172 11h-.344a4.323 4.323 0 0 1-.355.508C10.703 12.455 9.555 13 7.965 13c-1.725 0-2.989-.359-3.782-1.259a2.005 2.005 0 0 1-.085-.104L4 11.741v6.585c1.435.779 4.514 2.179 8 2.179 3.486 0 6.565-1.4 8-2.179v-6.585l-.098-.104s-.033.045-.085.104c-.793.9-2.057 1.259-3.782 1.259-1.59 0-2.738-.545-3.508-1.492a4.323 4.323 0 0 1-.355-.508h-.016.016Zm.641-2.935c.136 1.057.403 1.913.878 2.497.442.544 1.134.938 2.344.938 1.573 0 2.292-.337 2.657-.751.384-.435.558-1.15.558-2.361 0-1.14-.243-1.847-.705-2.319-.477-.488-1.319-.862-2.824-1.025-1.487-.161-2.192.138-2.533.529-.269.307-.437.808-.438 1.578v.021c0 .265.021.562.063.893Zm-1.626 0c.042-.331.063-.628.063-.894v-.02c-.001-.77-.169-1.271-.438-1.578-.341-.391-1.046-.69-2.533-.529-1.505.163-2.347.537-2.824 1.025-.462.472-.705 1.179-.705 2.319 0 1.211.175 1.926.558 2.361.365.414 1.084.751 2.657.751 1.21 0 1.902-.394 2.344-.938.475-.584.742-1.44.878-2.497Z"/><path d="M14.5 14.25a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Zm-5 0a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1Z"/></svg></span>
  <span class="docs-note-text"><strong>在 GitHub Copilot 应用里？</strong>Impeccable 是内置的。跳过下面的安装，在 <strong>Settings &rarr; Experimental</strong> 里启用即可。</span>
</div>

在项目根目录运行：

```
npx impeccable install
```

它会自动检测你的 AI 编码工具，并为它写入对应的技能文件（例如 `.claude/skills/` 或 `.cursor/skills/`）。它支持 Cursor、Claude Code、GitHub Copilot、Gemini CLI、Codex CLI 以及其他所有主流宿主。重载你的工具并输入 `/`，自动补全里应该能看到 `/impeccable`。输入它，参数提示会列出可用命令。

想换种安装方式？Claude Code 用户可以用 `/plugin marketplace add pbakaus/impeccable` 安装插件，通用型的 `npx skills add pbakaus/impeccable` 也仍然可用（只是它安装的是面向所有宿主的同一份共享构建，而不是为你的宿主编译的那份）。

之后发布新版本时，在同一个项目根目录运行 `npx impeccable update`。先用 `npx impeccable check` 看你是否落后了版本；插件用户则从 `/plugin` 菜单更新。

在 Claude Code、GitHub Copilot、Codex 和 Cursor 上，安装器还可以添加 Impeccable 的自动设计钩子。各宿主的行为与批准步骤见[自动设计检查](/docs-cn/impeccable/docs/hooks))。

## 第 2 步：为你的项目配置 Impeccable

这是最重要的一步。没有上下文的设计只能产出泛泛的结果。`/impeccable init` 命令会跑一段简短的设置访谈，并在项目根目录写入 `PRODUCT.md`。

运行：

```
/impeccable init
```

第一个问题很简单：这是**品牌面**还是**产品面**？

- **品牌面：**营销站、落地页、活动页、作品集。印象就是产品本身。
- **产品面：**应用 UI、仪表盘、管理后台、工作流工具。设计帮人完成任务。

文档把这个选择称为**调性（register）**。它改变 Impeccable 对字体、颜色、密度和动效的默认取舍。示例见[设计上下文](/docs-cn/impeccable/docs/context))。init 会从你的代码库形成一个假设，然后请你确认。

接着是几个更短的问题：

- **这个产品给谁用？**要具体。不是"用户"，而是"在会议间隙用手机评估新工具的独立创始人"。
- **用三个词概括品牌语调？**挑真实的词。"温暖、机械、有态度"好过"现代、干净"。
- **有视觉参照吗？**要点名的品牌、产品或印刷品，而不是形容词。"Klim Type Foundry 的样张页"，而不是"技术感、干净"。
- **反面参照？**产品明确不该长成什么样，同样要点名。

用你自己的话回答。技能会把答案写进 `PRODUCT.md`，之后每条命令都会自动读取它。

打开 `PRODUCT.md` 读一读它写了什么。感觉不对的地方尽管改。这个文件归你。

## 第 2.5 步：捕获视觉系统

`/impeccable init` 结束时，技能会提议替你运行 `/impeccable document`。答应它。它会审视你现有的颜色、字体、组件和令牌，然后按 [Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)写出 `DESIGN.md`。

在还没有视觉系统的新项目上，document 会问几个设置问题并写出一份起始脚手架。等有了真实代码再刷新它。

`PRODUCT.md` 承载策略（谁、做什么、为什么）。`DESIGN.md` 承载视觉（颜色、字体、组件）。每条命令生成前都会读取两者。完整模型见[设计上下文](/docs-cn/impeccable/docs/context))。

## 第 3 步：打磨一个页面

挑一个已经存在的页面。关于页、设置页、价格表，都行。运行：

```
/impeccable polish the pricing page
```

技能会逐项过一遍对齐、间距、字体、颜色、交互状态、过渡和文案。它做的是针对性修复，不是重写。预期收到一小把小的 diff，合在一起把页面从"做完了"抬到"做好了"。

一次典型的 polish 大致像这样：

```
Visual alignment: fixed 3 off-grid elements
Typography: tightened h1 kerning, fixed widow on feature list
Color: replaced one hardcoded hex with --color-accent token
Interaction: added missing hover state on FAQ items
Motion: softened modal entrance to 220ms ease-out-quart
Copy: removed stray 'Lorem' placeholder
```

审阅 diff。有不对劲的地方，让模型解释那处改动；还是不对劲，就回滚它。Impeccable 有主见，但并非不出错。

## 接下来可以试试

- [用 Live Mode 做视觉迭代](/docs-cn/impeccable/tutorials/iterate-live))会在你的开发服务器上打开浏览器选择器，为每个元素生成三个生产质量的变体，并把采纳的那个写回源码。
- `/impeccable critique the landing page` 跑一次完整设计评审，带打分、人设测试和自动检测。这是找到下一个该修什么的好办法。
- `/impeccable audit the checkout` 对实现跑无障碍、性能、主题化、响应式和反模式检查。上线前很有用。
- `npx impeccable detect src/` 直接在终端运行确定性检测器。见[检测器 CLI](/docs-cn/impeccable/docs/detector))。
- `/impeccable craft a pricing page for enterprise customers` 在全新功能上跑完整的先 shape 后构建流程。
- **固定你的常用命令。**如果某条命令你天天伸手就用，`/impeccable pin audit` 能让 `/audit` 作为独立快捷方式工作，同时不必撤掉整合。
- `/impeccable redo this hero section` 也可以。`/impeccable` 后面跟任何描述，都会把设计原则应用到这个任务上。

## 常见问题

- **技能提示"no design context found"**。你跳过了第 2 步。先运行 `/impeccable init`。
- **命令没有出现在宿主里**。安装后重载宿主。仍然没有的话，检查安装器是否把文件写进了预期位置（`.claude/skills/`、`.cursor/skills/` 等），以及你的宿主是否加载了那个目录。
- **polish 改掉了你喜欢的东西**。直说。回滚改动，告诉模型要撤销哪一处具体编辑，然后从那里继续。
