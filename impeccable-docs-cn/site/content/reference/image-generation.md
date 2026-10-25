---
title: 启用图像生成
tagline: "把视觉方向再推进一步。"
description: "了解图像生成能给 Impeccable 带来什么：更大胆的视觉方向，以及把它们转译成代码所需的迭代。然后配置内置支持或 OPENAI_API_KEY。"
section: concepts
order: 6
---

图像生成让 Impeccable 有空间去探索**更大胆的构图和更有创意的视觉方向**。一张生成的视觉稿可以立起一个视觉目标，超出编码模型凭自己本能会构建的范围。

**生成的视觉稿**

[![Neo Mirai 视觉稿：插画感未来城市上方的细腻字标，随后是一个不对称的议程区块。](/docs-cn/impeccable/assets/openai_image_2_hifi.jpg))](/docs-cn/impeccable/assets/openai_image_2_hifi.jpg))

**实现的页面**

[![Neo Mirai 实现：城市构图保留了下来，但字标更重、更棱角分明，插画不同，区块比例也有变化。](/docs-cn/impeccable/assets/cases/neo-mirai/live-page.png))](/docs-cn/impeccable/assets/cases/neo-mirai/live-page.png))

**同一个设计，从图像转译成代码。** 虚构的 Neo Mirai 大会保住了整体构图，但字体、插画和比例都变了。点开任一张图可看整页，或[浏览案例](/docs-cn/impeccable/cases/neo-mirai))。

## 收获与代价

- **视觉稿先行（comp-led）：视觉上更敢想**。你可以选择一个超出编码模型惯常范围的方向。但图像到代码的转译有损耗：视觉稿的一些气质和细节会改变或丢失。Impeccable 会帮你缩小差距；**请预期几轮提示与评审，而不是一把就中**。
- **没有图像生成：首次构建更可预期**。Impeccable 仍会提出一个概念，然后直接用代码构建（code-led）。结果开箱观感往往更连贯，但模型是在自己天然的视觉上限之内构建，执行通常没那么大胆。

视觉方向重要到值得花时间打磨时，选 comp-led。想要一次省力的、足够强的首次实现时，选 code-led。图像生成还能创建插画等成品素材；启用它之后，两种构建工作流都仍然可用。

## 为你的编码工具启用

选择你的配置路径：

- **[使用内置图像生成](#使用编码工具自带的图像生成)：**适用于 Codex、Cursor 等工具。无需 OpenAI API key。
- **[接入 OpenAI API key](#使用-openai-api-key)：**适用于没有图像生成的工具。走你的 API 项目计费。

已经配置好了？[确认已就绪](#确认已就绪)。

## 使用编码工具自带的图像生成

工具自带图像生成时，Impeccable 优先使用编码工具的图像生成。这条路径不需要你提供 OpenAI API key。

- **Codex：**在项目聊天里要一张图，或在请求里带上 `$imagegen`。内置生成计入 Codex 用量限额。[Codex 图像生成](https://developers.openai.com/codex/image-generation)。
- **Cursor：**让 Agent 生成图像。它可以预览并存入你的项目。[Cursor 的图像生成指南](https://cursor.com/changelog/2-4#image-generation)。

可用性取决于你的工具、账号和工作区设置。如果 agent 没有图像生成工具，就走下面的 API 路径。能读截图不代表能生成图像。

## 使用 OpenAI API key

编码工具没有内置图像生成时，Impeccable 提供一条回退路径，使用 agent 环境里的 `OPENAI_API_KEY`。agent 需要有权限运行辅助脚本并访问 OpenAI API。

### 1. 创建 key 并确认 API 计费

在你的 [OpenAI API 项目](https://platform.openai.com/api-keys)里创建一个 key，并确认项目已开通计费、有图像生成权限。参见 [OpenAI API 快速上手](https://developers.openai.com/api/docs/quickstart)和[图像生成要求](https://developers.openai.com/api/docs/guides/image-generation)。

> **API 图像走你的 API 项目计费**：首次回退渲染之前，Impeccable 应当会先告知你。每张视觉稿或每次修订都可能新增一次请求。大批量生成前，先看看[当前 API 定价](https://developers.openai.com/api/docs/pricing)。

### 2. 让 agent 能拿到 key

基于终端的编码工具，先在终端里设置变量，然后**从同一个终端**启动工具。在本地把占位符换成你的 key。

macOS or Linux:

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Windows PowerShell:

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
```

这些示例把 key 设置给当前终端会话以及从中启动的工具。要用于以后的会话，请用你工具的环境或密钥配置。

**key 必须在 agent 运行命令的地方可用。** 配置完后重启 agent 会话。不要把 key 放进聊天、提交进仓库的文件，或 `PUBLIC_*`、`VITE_*` 这类面向浏览器的变量。

#### 桌面应用、远程工作区、容器与 .env 文件

请用你工具的环境或密钥配置。在一个不相干的终端里设置 key，不会更新已在运行的应用或远程机器。

项目 `.env` 文件只有在你的启动流程会把它加载进 agent 的命令环境时才有效。回退路径读取的是 `OPENAI_API_KEY`；仅有一个 `.env` 文件并不代表就绪。

## 确认已就绪

在项目的 agent 聊天里问：

```text
/impeccable check whether image generation is available for this project. Tell me whether you can use a built-in image tool or the OpenAI API fallback. Do not generate an image or print any secret values.
```

这条检查会确认工具可用性或 key 是否存在，但不会生成图像。要验证生成真的能成功，就要一张小的测试图；它消耗你工具的图像额度或 API 计费。

### 在 agent 的终端里检查 API key

让 agent 在**它自己的命令环境**里运行这条命令。它只打印变量是否存在：

```bash
node -e 'console.log(process.env.OPENAI_API_KEY ? "OPENAI_API_KEY is set" : "OPENAI_API_KEY is missing")'
```

检测到 key 并不能确认它有效、计费已开通，或网络允许请求。

然后继续[构建新东西](/docs-cn/impeccable/docs/new-work#评审视觉稿或直接写代码))。图像生成可用且没有保存过偏好时，Impeccable 默认**视觉稿先行（comp-led）**。你可以在选择器里改选**直接构建（code-led）**，或让 Impeccable 把它存为默认。

### 视觉稿与成品素材有什么区别？

**视觉稿**（mockup，或称 comp）是拟议界面的图像。你确认构图，agent 再对着这个视觉目标构建可运行的界面。视觉稿替代不了能用的控件、无障碍文本或响应式布局。

**素材**是界面真正用到的图像：产品插画、背景或抠图。两种构建工作流都可以使用生成的素材。选 code-led 跳过的是视觉稿确认环节，并不会关掉你需要的素材生成。

## 图像生成不可用时

### agent 能读截图，却不能生成图像

确认它是否真有图像生成工具，或配置 API 回退。只有视觉理解是不够的。

### key 在你的终端里设好了，agent 却拿不到

把 key 设在 agent 运行的地方。重启应用或终端工具，远程或容器环境要单独检查。

### 检测到 key，但生成失败

读一下返回的错误。按情况检查 key 有效性、项目权限、图像模型访问权限、API 计费、用量限额和网络访问。

### 选择器里没有视觉稿/代码开关

没有图像生成可用时，Impeccable 走 code-led。配置好访问后，在一个全新会话里检查就绪状态。

### 图像生成可用，但选择器默认从代码开始

检查你保存的 `buildPath` 偏好。[修改默认值](/docs-cn/impeccable/docs/new-work#默认值与保存工作流偏好))，或只为本会话切换。

没有图像生成也可以继续工作。Impeccable 直接用代码构建，你在运行中的界面里评审设计。
