// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RichTextEditorToolbar',
  subComponentOf: 'RichTextEditor',
  description: '用于 RichTextEditor 的 toolbar 插槽的格式化工具栏。',
  displayName: 'Rich Text Editor Toolbar',
  keywords: ['富文本', 'richtext', '工具栏', 'toolbar', '格式化', 'formatting', '粗体', 'bold', '链接', 'link', '标题', 'heading'],
  props: [
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description:
        '指向工具栏根元素的 ref。ref、className、style 与 xstyle 作用于其渲染的 Astryx Toolbar 根元素；data-*、其他 aria-* 属性与 DOM 处理器作用于其 role="toolbar" 元素。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '工具栏元素的可访问标签。请传 label 而非 aria-label。',
      default: "'Text formatting' (translated)",
    },
    {
      name: 'headingLevels',
      type: "ReadonlyArray<'h1' | 'h2' | 'h3'>",
      description:
        '块格式选择器按序提供的标题级别。',
      default: "['h1', 'h2', 'h3']",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        "工具栏控件的尺寸；同时决定工具栏的内边距。",
      default: "'sm'",
    },
    {
      name: 'hasLink',
      type: 'boolean',
      description:
        '是否显示链接按钮。它会打开一个 Astryx Dialog，可添加、更新或移除链接并保留编辑器选区。选区折叠时 URL 会作为链接文本插入；否则为所选文本建立链接。仅写入 http、https、mailto 与 tel URL。',
      default: 'true',
    },
    {
      name: 'promptForUrl',
      type: '(selectedText: string) => string | null | undefined',
      description:
        '同步的 URL 询问函数，当选区不是链接时按下链接按钮，用它取代内置 Dialog。参数为所选文本；返回 URL，或返回 null 或空字符串以取消。',
    },
    {
      name: 'hasNewTabLinks',
      type: 'boolean',
      description:
        '用工具栏创建的链接是否在新标签页打开。为 true 时，target="_blank" 与 rel="noopener noreferrer" 会写入链接节点，因此可序列化。',
      default: 'true',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '工具栏末尾、分隔符之后的额外条目，例如提及或 AI 控件。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: "工具栏根元素的 StyleX 样式。",
    },
  ],
  usage: {
    description:
      "RichTextEditor 的格式化工具栏，由 Astryx Toolbar、Selector 与 ToggleButton 控件构成：撤销与重做、段落/标题/列表/引用的块格式选择器、行内粗体/斜体/下划线/删除线/代码，以及链接。请在编辑器的 toolbar 插槽中渲染；它经编辑器的 Lexical composer 接入编辑器，因此必须放在其内部。",
    bestPractices: [
      {
        guidance: true,
        description:
          '以 toolbar={<RichTextEditorToolbar />} 传入。插槽会将其放在字段顶部、编辑表面之前，并保持正确的键盘顺序。',
      },
      {
        guidance: true,
        description:
          "主题可按 richtext:* 图标键（见 RICHTEXT_ICON_KEYS）重定字形样式，例如 defineTheme({icons: {'richtext:bold': <MyBoldIcon />}})。",
      },
      {
        guidance: false,
        description:
          "不要在 RichTextEditor 的 toolbar 插槽之外渲染：它依赖编辑器的 Lexical composer。",
      },
    ],
  },
};
