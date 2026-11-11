// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RichTextEditor',
  displayName: 'Rich Text Editor',
  category: 'Form Controls',
  keywords: [
    '富文本',
    'richtext',
    'rich text',
    'wysiwyg',
    '所见即所得',
    '编辑器',
    'editor',
    'lexical',
    '格式化',
    'formatting',
    'contenteditable',
    'prose',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '编辑器的标签文本。出于无障碍考虑始终渲染。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签（屏幕阅读器仍可访问）。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签与编辑器之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '在标签旁显示 “可选” 标识。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在标签旁显示 “必填” 标识，并在可编辑表面设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '显示在标签末尾信息图标中的 tooltip 文本。',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        '初始序列化编辑器状态（editorState.toJSON() 生成的 JSON 字符串）。仅在挂载时读取一次；编辑器为非受控。',
    },
    {
      name: 'onChange',
      type: '(editorState: EditorState, editor: LexicalEditor) => void',
      description:
        '内容变化时触发。持久化时用 editorState.toJSON() 序列化。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '编辑器为空时显示的占位文本。与可编辑内容使用相同的响应式正文排版和文本内边距。',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '编辑器是否为只读（不可编辑）。内容保持完全不透明、保留在 Tab 序中，并会被播报为只读。挂载后更改即生效。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '编辑器是否禁用：不可编辑、变暗、移出 Tab 序，并会被播报为禁用。其中的链接不可导航，也不是 Tab 停靠点。与 isReadOnly 同时设置时以禁用为准。挂载后更改即生效。',
      default: 'false',
    },
    {
      name: 'status',
      type: '{ type: "warning" | "error" | "success"; message?: string }',
      description:
        '校验状态。显示彩色边框与状态图标；可选消息遵循 statusVariant 的呈现位置。error 还会设置 aria-invalid。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态的呈现方式：attached 将图标保留在编辑器内并让消息重叠在下方；detached 让消息连同自己的图标悬浮在下方；tooltip 隐藏消息框，改为从编辑器内可聚焦的状态图标呼出。',
      default: "'attached'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '编辑器尺寸，影响内部内边距。',
      default: "'md'",
    },
    {
      name: 'nodes',
      type: 'ReadonlyArray<Klass<LexicalNode>>',
      description:
        '在默认 OSS 节点集（Heading、Quote、List、Link、Code）之外注册的额外 Lexical 节点。用于在不分叉的前提下扩展自定义节点（提及、图片）。',
    },
    {
      name: 'toolbar',
      type: 'ReactNode',
      description:
        '渲染在字段顶部、带内边距编辑表面之前，通铺到边缘的工具栏内容。请传入 RichTextEditorToolbar 以获得正确的视觉与键盘顺序。',
    },
    {
      name: 'plugins',
      type: 'ReactNode',
      description:
        '在 composer 内渲染的额外 Lexical 插件。在基础编辑器之上组合提及、自动链接等编辑器行为。',
    },
    {
      name: 'hasMarkdownShortcuts',
      type: 'boolean',
      description:
        '启用 Markdown 快捷输入（例如输入 "# " 创建标题）。使用 transformers prop（默认包含主题分隔线、标准 @lexical/markdown transformers、硬换行与 GFM 表格）。',
      default: 'true',
    },
    {
      name: 'markdownExtensions',
      type: 'ReadonlyArray<RichTextMarkdownExtension>',
      description:
        '编辑器要绘制其节点的 Markdown 插件，每个都经 createRichTextExtension 采用。插件节点完全按核心 Markdown 的方式渲染，并作为一个整体编辑；未在此提供插件的节点则显示其源码。请传入内容转换时所用的扩展，并在客户端模块中创建它们。RichTextView 接受相同的 prop。',
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        '代码围栏可声明的 CodeBlock 语言值，每个单独引入（例如 @astryxdesign/core/CodeBlock/languages/graphql 中的 graphql），或用 createCodeLanguage 创建。请传入与 Markdown codeLanguages 相同的列表，使匹配的围栏在阅读与编辑时呈现相同的着色与标签。RichTextView 接受相同的 prop。',
    },
    {
      name: 'transformers',
      type: 'ReadonlyArray<Transformer>',
      description:
        'Markdown transformers：markdown 行为的唯一事实来源。默认包含主题分隔线、标准 @lexical/markdown TRANSFORMERS（每个嵌套列表都写在上一条目的内容列上，因此回读时保持嵌套）、硬换行（用 Shift+Enter 输入的换行会在行尾前导出为一个反斜杠，回读时恢复为换行）以及 GFM 表格；自定义数组会整体替换默认值，包括主题分隔线与表格。在 Lexical 中，同一数组驱动全部三种 markdown 操作（快捷输入、markdown->state 导入、state->markdown 导出）；此 prop 目前接入快捷输入，也是后续阶段序列化 API 的预期输入。传入自定义数组可在三者中一致地支持更多节点类型（例如经 nodes 扩展点叠加的 transformers）。仅当 hasMarkdownShortcuts 为 true 时才应用快捷输入。',
      default: 'TRANSFORMERS',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦编辑器。',
      default: 'false',
    },
    {
      name: 'tabEscapeHint',
      type: 'string',
      description:
        '面向屏幕阅读器的提示，说明如何将焦点移出编辑器，因为 Tab 已绑定缩进（先按 Escape 再按 Tab）。视觉隐藏，经 aria-describedby 关联。按当前 locale 翻译；可覆盖以更改文本，或传入 "" 省略。',
      default:
        "'Press Escape then Tab to move focus out of the editor.' (translated)",
    },
    {
      name: 'maxLength',
      type: 'number',
      description:
        '最大字符数。设置后会在编辑器下方显示字符计数器（当前/上限）。与 TextArea 一样，本身不强制该限制；当纯文本长度超限时计数器显示错误样式。',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        '字段宽度。数字按像素处理，字符串原样使用（例如 "100%"）。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description:
        '可编辑内容表面的最小高度。数字按像素处理，字符串作为 CSS 长度使用。内容可继续增长超过此高度。',
      default: "'4.5rem'",
    },
    {
      name: 'namespace',
      type: 'string',
      description: 'Lexical composer 命名空间，用于编辑器标识。',
      default: "'astryx-editor'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-rich-text-editor',
        // RichTextEditor.tsx reflects both through
        // themeProps('rich-text-editor', {size, status}) as `data-size` and
        // `data-status`, the same axes TextArea declares for the input visuals
        // this field container shares.
        visualProps: ['size', 'status'],
      },
    ],
  },
  usage: {
    description:
      '基于 Lexical 构建的所见即所得（WYSIWYG）富文本编辑器，使用 Astryx 设计令牌定制样式。其字段容器与 TextArea 共享输入视觉：静态边框、悬停环、focus-within 焦点环、禁用状态与状态色。由 @astryxdesign/richtext 交付；lexical 与 @lexical/* 为可选 peer 依赖。编辑器刻意保持精简且可扩展：传入 toolbar、nodes 与 plugins 即可在不分叉的前提下叠加更丰富的行为（格式化、提及、悬停卡片）。只读渲染序列化内容请使用 RichTextView。',
    bestPractices: [
      {
        guidance: true,
        description:
          'RichText 基于 Lexical 构建并直接暴露它：nodes 与 transformers 接受 Lexical 类型，plugins 接受 Lexical React 插件，onChange 与 getEditorState() 返回 Lexical 类型。从 @astryxdesign/richtext 导入之前，请按包 peer 范围声明的 Lexical 次版本安装 lexical 与 @lexical/* peers（可选 peer 依赖）。',
      },
      {
        guidance: true,
        description:
          '在 onChange 中序列化 editorState.toJSON() 以持久化内容；通过 defaultValue / RichTextView value 恢复。',
      },
      {
        guidance: true,
        description:
          '在编辑器与 RichTextView 两处都通过 nodes prop 注册自定义节点类型，使序列化内容能完整往返。',
      },
      {
        guidance: true,
        description:
          '通过 ref（RichTextEditorRef）以命令式方式调用 focus()、clear()，经 getEditorState() 读取状态，经 getMarkdown() 序列化为 Markdown 或经 getHTML() 序列化为 HTML，或经 getEditor() 获取 LexicalEditor。该句柄在挂载后可用。getMarkdown() 使用编辑器配置的同一 transformers prop，并按内容的原始写法返回导入内容：无人改动过的块逐字节原样返回，只有被编辑或新增的块才以规范 Markdown 重写。编辑器只读或禁用时 focus() 与 clear() 为无操作，clear() 会重置为单个空段落。',
      },
      {
        guidance: true,
        description:
          'GFM 管道表格默认支持导入、编辑与导出。首行渲染为表头单元格，分隔行冒号决定各列对齐，比最宽行短的行补空单元格，宽表格在其自身容器内滚动。方向键在单元格间移动；Tab 保持其编辑器语义，因此先按 Escape 再按 Tab 仍会移出编辑器。表格以规范形式导出：外侧管道符与三连字符分隔行。RichTextView 渲染相同的表格。请随其他 lexical peers 一起安装 @lexical/table。',
      },
      {
        guidance: true,
        description:
          '在代码块中，Tab 与 Shift+Tab 按块已有的缩进宽度缩进/反缩进选区触及的每一行：若其中一行以 tab 缩进则用 tab，否则用缩进行的最少前导空格数（2 到 8），否则用 2 个空格。选区保持在相同字符上，每次按键为一个撤销步骤。先按 Escape 再按 Tab 仍会将焦点移出编辑器。',
      },
      {
        guidance: true,
        description:
          '在代码块最开头按 Backspace 会将其转换为保留各行内容的段落，每行各占一行，光标位于段首。代码永远不会并入上方的块，因此上方的标题保留自己的文本。在代码块其他位置按 Backspace 照常删除。',
      },
      {
        guidance: true,
        description:
          '粘贴进代码块会插入纯代码。富内容（如网页、文字处理文档或从其他编辑器复制的块）会以剪贴板上的纯文本形式进入；当剪贴板没有纯文本时，每个粘贴的块以一行文本进入。标题、列表、表格与格式永远不会落入代码块内。',
      },
      {
        guidance: true,
        description:
          '在代码块或表格单元格内，Cmd+A（其他平台为 Ctrl+A）先选中代码或单元格文本；再次按下则选中文档全文。在其他位置则一次选中整个文档。',
      },
      {
        guidance: true,
        description:
          '主题分隔线（---、***、___，符号间可有可无空格）导入为水平分割线，导出为 ---。紧邻段落行下方的短横线行会随该段落保留，与 Markdown 一致。点击分割线或用方向键移入即可选中；Backspace 将其删除。RichTextView 绘制相同的分割线。请随其他 lexical peers 一起安装 @lexical/extension。',
      },
      {
        guidance: true,
        description:
          '不挂载编辑器而从 Markdown 生成 defaultValue（例如在服务端），可使用 markdownToEditorStateJSON(markdown)。反向转换用 editorStateJSONToMarkdown(json)。两者经 @lexical/headless 无头运行，接受与编辑器相同的 transformers/nodes 选项。往返转换保持 Markdown 原样：导出未改动的内容会精确返回输入，包括缩进、转义、字符引用、围栏元数据以及编辑器以纯文本显示的结构；一次编辑只重新生成它改动的块。在服务端或 Node 中，请从 @astryxdesign/richtext/markdown 导入，它不加载任何 React 或客户端代码。',
      },
      {
        guidance: true,
        description:
          "要识别经 createMarkdownPlugin 创建的 Markdown 插件，请用 createRichTextExtension(plugin) 采用它，并将结果传入 markdownToEditorStateJSON 的 extensions 选项。核心解析器会找到插件的语法，每个节点保留其精确源码并以此导出；插件源码内的基础 Markdown 仍属于该节点的一部分。声明了 transform 的插件会被以 RichTextExtensionError 拒绝，重复采用同一插件的配置同样如此。不提供扩展时，插件语法保持为纯文本。createRichTextExtension 与序列化器也从 @astryxdesign/richtext/markdown 导出，供服务端代码使用。将相同的扩展传给 RichTextEditor 与 RichTextView 的 markdownExtensions prop 即可绘制节点：每个节点都按核心 Markdown 的方式渲染、作为一个整体编辑（光标整块跨越；Backspace、剪切、复制与粘贴都整块处理），并导出其精确源码。",
      },
      {
        guidance: true,
        description:
          '通过 toolbar={<RichTextEditorToolbar />} 添加格式化工具栏。专用插槽将其通铺放置在字段顶部、带内边距编辑表面之前，带有 RichText 自有的 4px 控件边距和正确的键盘顺序。它使用小型 Astryx Toolbar 控件：撤销/重做、分段的块格式 Selector（段落/标题/列表/引用），以及分段的行内 ToggleButton（粗体/斜体/下划线/删除线/代码）和链接。空间不足时整行操作控件可横向滚动，每个控件始终直接可用，无需 More 菜单。Selector 保持其默认的自适应位置。额外控件经 endContent 组合。',
      },
      {
        guidance: true,
        description:
          '链接：工具栏 Link 按钮（默认开启；用 hasLink={false} 关闭）与 Cmd/Ctrl+K 会打开一个 Astryx Dialog。焦点移入 URL 输入框时表单会保留 Lexical 选区，并支持添加、更新、移除、Escape 与焦点返回。仅在集成既有同步 URL 流程时才传入 promptForUrl。输入的 URL 会被净化（仅写入 http/https/mailto/tel；javascript:/data: 被拒绝）。链接默认在新标签页打开：target=_blank 与 rel=noopener noreferrer 会写入链接节点数据；同标签页打开请设置 hasNewTabLinks={false}。工具栏接受基础 props 并传给它渲染的 Astryx Toolbar：根元素上的 ref、className、style 与 xstyle；工具栏元素上的 data-*、其他 aria-* 属性与 DOM 处理器（命名请用 label，不要用 aria-label）。',
      },
      {
        guidance: true,
        description:
          '自动链接：在 plugins 插槽中渲染 RichTextEditorAutoLinkPlugin，自动将输入/粘贴的 URL 与邮箱转换为链接。创建的链接默认在新标签页打开（target=_blank、rel=noopener noreferrer 固化进节点）。传入 matchers 可识别更多模式（用 createLinkMatcherWithRegExp 构建）。',
      },
      {
        guidance: true,
        description:
          "工具栏的图标字形支持主题定制。每个控件以稳定的 richtext:* 键（见 RICHTEXT_ICON_KEYS）从核心图标注册表解析图标，回退到内置的内联 SVG。主题只需指名其键即可重定任何字形的样式，无需分叉工具栏：defineTheme({icons: {'richtext:bold': <MyBoldIcon />}})。无论用哪个字形绘制，撤销与重做在 RTL（从右到左布局）方向下都会镜像。",
      },
      {
        guidance: true,
        description:
          "要在阅读（Markdown 或 RichTextView）与原位编辑同一文档之间切换，应将编辑器字段的外边距与边框放在阅读宽度之外，使每个段落在切换前后保持相同行数。用 stylex.create 定义边框，例如 const inPlace = stylex.create({editorFrame: {marginInline: `calc(-1 * (${spacingVars['--spacing-2']} + ${borderVars['--border-width']}))`}})，其中 spacingVars 与 borderVars 来自 @astryxdesign/core/theme/tokens.stylex，并将 xstyle={inPlace.editorFrame} 传给 RichTextEditor。该配方假设没有状态图标：状态图标会在行内末端再占一个 spacing-6。字段随后会向两侧伸出列外，请在周边留出空间。表单中的独立编辑器保持默认宽度，其边框与周围字段对齐。",
      },
      {
        guidance: false,
        description:
          '不要用于单行输入或纯文本场景；那些场景请使用 TextInput 或 TextArea。',
      },
    ],
  },
};
