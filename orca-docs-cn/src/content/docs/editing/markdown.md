---
title: "富文本 Markdown 编辑器"
description: "富文本 Markdown 编辑器——Orca 文档。"
source: "https://www.onorca.dev/docs/editing/markdown"
---

Markdown 文件默认在富文本编辑器中打开——斜杠菜单、工具栏、图片和代码的行内预览、内链自动补全。随时可用 `Cmd-Shift-M` 切换到原始 Monaco。

*富文本 Markdown 编辑器——斜杠菜单、行内预览、内链自动补全*

## 斜杠菜单

在空行输入 `/` 打开斜杠菜单：标题、列表、代码块、提示框（callout）、图片、mermaid 图和折叠块。

用 `/toggle-text` 做可折叠备注，或当折叠摘要需要呈现为标题层级时用 `/toggle-h1` …… `/toggle-h5`。Orca 把折叠块保存为可移植的 `<details>` / `<summary>` markdown，文件在 Orca 之外仍可预览。

## 内链

输入 `[[` 开始一个 wiki 风格链接。Orca 自动补全 worktree 内的文件路径并插入相对链接。

## 搜索

编辑器内的 markdown 搜索针对渲染后的文本而非原始 markdown——因此搜索 "Install" 时，无论写成 `# Install` 还是 `<h1>Install</h1>` 的标题都能找到。

## 评审标注

在 Orca 富文本编辑器中评审 markdown 时，选中渲染后的文字即可添加标注，无需切回原始 markdown。Orca 会把备注绑定到选中的源码范围，因此你继续编辑渲染文档时评论依然可见。

**Add Review Note**（添加评审备注）是可重映射的快捷键（默认 `Cmd+Shift+A` / `Ctrl+Shift+A`，位于 [Settings → Shortcuts](/settings)）。

## Front matter

YAML 和 TOML front matter 默认显示在富文本编辑器和渲染预览中，让文档和静态站点文章无需切换原始 markdown 即可展示元数据。打开编辑器的 **More actions**（更多操作，`…`）菜单并选择 **Hide front matter**（隐藏 front matter）即可只看正文；同一菜单可切回 **Show front matter**（显示 front matter）。该开关按文件生效，在某份文档隐藏不会影响其他文档。

## 表格

在富文本 markdown 表格中：

| 按键 | 行为 |
| --- | --- |
| **Tab** / **Shift-Tab** | 下一个 / 上一个单元格；在最后一个单元格按 Tab 会插入一行 |
| **Enter** | 移到下方单元格；在最后一行会新增一行 |
| 在完全空的行上按 **Backspace** | 删除该行（若为最后一行则删除整个表格） |
| 行内仍有内容时，空单元格中的 **Backspace** | 退到上一个单元格 |

光标位于表格中时，富文本编辑器工具栏会显示一键 **插入/删除行与列** 控件。右键点击表格单元格可在上下文菜单找到相同的结构命令（Table 子菜单仅在目标是表格单元格时出现）。

## 目录

长文档可点击编辑器标题栏的 **Table of Contents**（目录，树形图标）按钮，在编辑器左侧打开固定的标题大纲。点击标题即可跳转；折叠和展开控制让深层嵌套的小节保持可读。富文本和预览模式均可用。

## 分享为 artifact

从编辑器标题栏使用 **Share as artifact**（分享为 artifact），通过已登录的 Orca 账号把打开的 Markdown 文件发布为公开查看链接。需要 **Settings → Artifacts → Allow publishing public artifact links**（允许发布公开 artifact 链接，默认关闭）。Orca 仍保有映射时，重新发布会更新同一链接；可在侧边栏 **Artifacts** 页面管理或删除链接。智能体和脚本可使用 `orca artifacts share|update|list|delete`——参见 [CLI 参考 → Artifacts](/cli/reference#artifacts)。
