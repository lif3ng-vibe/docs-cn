---
title: '推出 Astryx RichText：表单里的富文本字段'
description: '@astryxdesign/richtext 已进入稳定版：一个带标签的富文本字段，基于 Lexical 构建、由你的 Astryx 主题着色，可无损读写 Markdown。'
date: '2026-10-20'
type: 'update'
draft: false
authors:
  - 'cixzhang'
  - 'potatowagon'
  - 'ernest'
tags:
  - 'Release'
  - 'Components'
  - 'Accessibility'
relatedDocs:
  - title: 'RichTextEditor'
    href: '/components/RichTextEditor'
---

`@astryxdesign/richtext` 现在是稳定的 Astryx 包。它为你的表单提供富文本字段：用户可以用标题、列表、链接、表格和代码来写作，你的应用保存他们写下的内容。从 v0.7.1 起，它与 `@astryxdesign/core` 以相同版本安装，并遵循同样的兼容性策略。

![在一个空的 Launch notes 富文本字段中写作。工具栏的样式菜单把第一行变为 Q4 launch plan 标题；Bold 按钮把 "rich text" 加粗；Insert link 对话框把 "every form" 变成链接；随后样式菜单切到 Bulleted list，输入 Feedback form 和 Release notes 两个条目。](/blog/introducing-astryx-richtext/richtext-toolbar.gif)

```bash
npm install @astryxdesign/richtext @astryxdesign/core
```

然后以 0.52 安装 `lexical` 与 `@lexical/*` 对等依赖（`npm view @astryxdesign/richtext peerDependencies` 可列出它们）。与 Core 一样，RichText 交付预构建 CSS：在 Core 和你主题的样式表旁引入它的样式表即可。

```tsx
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css'; // or your theme's CSS
import '@astryxdesign/richtext/richtext.css';
```

```tsx
import {RichTextEditor, RichTextEditorToolbar} from '@astryxdesign/richtext';

<RichTextEditor
  label="Release notes"
  description="Capture formatted context for your team."
  toolbar={<RichTextEditorToolbar />}
  onChange={editorState => save(JSON.stringify(editorState.toJSON()))}
/>;
```

## 首先是一个表单字段

`RichTextEditor` 是一个带标签的字段，与 `TextArea` 一样：标签、描述、必填与选填状态、状态消息、只读与禁用状态、字符数上限，以及与表单其余部分一致的边框和焦点环。`RichTextView` 以只读方式展示已保存内容，排版相同。

![一个带描述与工具栏的 Launch notes 富文本字段，内容包括 Q4 launch plan 标题、一段含加粗文本与链接的段落、一个 This week 标题及其下带行内代码的圆点列表、一张 surfaces/owners/status 三列表格，以及一个 tsx 代码块。](/blog/introducing-astryx-richtext/richtext-editor@2x.png)

你保存的值是序列化为 JSON 的 Lexical 编辑器状态。传给 `RichTextEditor` 的 `defaultValue` 可继续编辑，传给 `RichTextView` 的 `value` 则用于展示。

## Markdown 无损进出

`markdownToEditorStateJSON` 与 `editorStateJSONToMarkdown` 双向转换，无需挂载编辑器，服务器上也一样。打开 Markdown，什么都不改，再导出：拿回的是逐字节相同的内容。只改一段，其余部分原样归来：列表符号、转义、间距与字符引用。

```ts
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from '@astryxdesign/richtext/markdown';

const editorState = markdownToEditorStateJSON(markdown); // pass to defaultValue
editorStateJSONToMarkdown(editorState) === markdown; // true until someone edits
```

## 同一份文档，阅读与编辑模式一致

RichText 文档与 Astryx `Markdown` 渲染的同一份文档保持一致：同样的字号比例、区块间距、行宽度量、列表符号与代码框，浅色深色皆同，从左到右与从右到左皆同。在 `Markdown` 与 `RichTextEditor` 之间切换页面，每个块的顺序与间距不变；编辑器只多出它的字段外框。两种模式下长代码行都会折行，手机读者永远不用横向滚动代码。

![同一份 Markdown 源文本展示两次。上方标注 Markdown，阅读模式：Release notes 标题、一段含加粗、斜体、删除线与行内代码的文本、一个链接和一个裸 URL，然后是 What changed 标题。下方标注 RichText，编辑模式：同样内容位于编辑器的字段外框与工具栏内，在同一批词上折行。](/blog/introducing-astryx-richtext/read-and-edit@2x.png)

## 与主题一致的工具栏

`RichTextEditorToolbar` 由 Astryx 的 `Toolbar`、`Selector`、`ToggleButton` 和 `Dialog` 构成，因此跟随你的主题：撤销与重做、段落与标题样式、列表与引用、粗体、斜体、下划线、删除线、行内代码与链接。空间紧张时它滚动，而不是把控件藏进菜单；每个图标都可从主题替换。通过它的 `endContent` 插槽添加你自己的控件。

## 基于 Lexical 构建

RichText 基于可扩展文本编辑框架 [Lexical](https://lexical.dev) 构建。直接添加你自己的节点、Markdown transformer 和 Lexical 插件；`onChange` 给你 Lexical 编辑器状态。RichText 同一时间只支持一个 Lexical minor 版本：今天是 0.52，以 `^0.52.0` 对等依赖声明，因此由你的应用安装 Lexical，而不是 RichText 自带一份拷贝。

你用 `createMarkdownPlugin` 为 Astryx `Markdown` 添加语法的插件在编辑器里同样可用：用 `createRichTextExtension` 接入，其节点按 `Markdown` 的方式渲染，并作为一个单元编辑。转换整份文档的插件会被拒绝并抛出 `RichTextExtensionError`。

## 不需要你自己搭建的无障碍

屏幕阅读器能正确播报编辑器：读出字段的标签，并说明这是一个多行文本框，使用者因此知道自己在往哪里输入。整个工具栏支持键盘操作——方向键在按钮间移动，不需要鼠标——Tab 像在文字处理软件中一样缩进，先按 Escape 再按 Tab 则把焦点移出编辑器。屏幕阅读器会播报这一提示，键盘用户不会被困住。任务列表里的 checkbox 可以用键盘勾选，屏幕阅读器也称其为 checkbox。按钮 tooltip、链接对话框和编辑器的播报都来自 Astryx 消息词表，翻译方式与其余 Astryx 内容一致。

## 上手

- 安装上面的包和 Lexical 对等依赖。
- 阅读 [RichTextEditor 文档](/components/RichTextEditor)，或在已安装该包的项目里运行 `npx @astryxdesign/cli component RichTextEditor`。
- 在 [RichText playground story](https://astryx.atmeta.com/storybook/?path=/story/richtext-richtexteditor--playground) 里试用全部特性。
