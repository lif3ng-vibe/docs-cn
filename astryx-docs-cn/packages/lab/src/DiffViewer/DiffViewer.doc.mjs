// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DiffViewer',
  displayName: 'Diff Viewer',
  group: 'DiffViewer',
  category: 'Content',
  keywords: [
    'diff',
    'patch',
    '补丁',
    '代码评审',
    '变更',
    'split',
    '分栏',
    'unified',
    '统一视图',
    '并排对比',
    'compare',
    '对比',
    'word diff',
    '词级 diff',
    '行内高亮',
    'DiffViewer',
  ],

  theming: {
    targets: [
      {className: 'astryx-diff-viewer', visualProps: ['viewMode']},
      {className: 'astryx-diff-viewer-header'},
      {className: 'astryx-diff-viewer-path'},
    ],
  },

  usage: {
    description:
      '针对单个文件的只读、语法高亮 diff，适用于代码评审界面。在文件的 hunk 之上渲染文件头部（路径、Added/Deleted/Renamed 标记、+/− 行数统计、headerEnd 插槽以及可选的展开控件），支持 unified 或 split（并排）视图。行使用与 CodeBlock 配合 isDiff 相同的语法主题 diff 插槽，因此一套语法主题即可同时样式化两者。renderLineAnnotation 在任意行下方添加一个通栏行（用于评审评论），onLineNumberClick 把行号变成按钮。用 parseUnifiedDiff(patch) 构建文件模型——git 或 diff -u 补丁中的每个文件返回一项；或在你手头有两个文本版本时用 createDiffFile({oldValue, newValue})。显示选项涵盖变更的标记方式（经典 +/− 字形、色条或不标记）、变更行是否着色，以及对每对删除/新增行内部变化内容的词级或字符级高亮。每个变更行都带有视觉隐藏的 "Added"/"Removed" 标签，因此在任何模式下无需颜色也能读出变更。不换行时，行号和变更指示符在代码滚动时保持固定；split 视图中每侧是独立的滚动容器，分栏始终保持对半固定，两侧横向同步滚动，一行的高度等于较高一侧的高度。当代码横向溢出时，横向过度滚动被关闭，触控板既不会弹过一行也不会触发浏览器的后退手势。在从右到左的页面中，hunk 区域保持从左到右，如同代码编辑器：注释内容按页面方向阅读，注释行随代码滚动。当变更太大无法逐行对比时，createDiffFile 会将其 hunk 标记为 isReplacedBlock：把所有旧行列为删除、所有新行列为新增。DiffViewer 将这些行折叠在 "Large change: N lines" 行之后，其中 N 计算该块的删除加新增行数，并提供 Show full diff 按钮。其他变更行超过 2,000 行的文件默认以同样方式折叠，因为每一行都消耗渲染时间。读者展开后其行级 diff 仍在。当折叠会隐藏的行带有注释时，折叠自动展开，因此不会隐藏任何评审评论。行是普通 DOM，没有虚拟化：超大文件请折叠或分窗口显示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '每个文件渲染一个 DiffViewer，列表布局由你自己排；parseUnifiedDiff(patch).map(file => <DiffViewer key={file.newPath ?? file.oldPath} file={file} />) 是多文件场景。',
      },
      {
        guidance: true,
        description:
          '用 DiffViewerLineRef 的 side + lineNumber 对来定位评审评论：在 unified 和 split 视图中含义相同。',
      },
      {
        guidance: true,
        description:
          '把文件级操作（如 "Viewed" 复选框）放在 headerEnd；若已查看的文件应折叠收起，则用同一状态驱动 isCollapsed。',
      },
      {
        guidance: false,
        description:
          '不要在正文或聊天消息中用 DiffViewer 呈现短 diff；那里用 isDiff 的 CodeBlock（或 Markdown 中的 ```diff 代码围栏）更轻量。',
      },
    ],
  },

  examples: [
    {
      label: '从补丁得到的 unified diff',
      code: `const [file] = parseUnifiedDiff(patch);

<DiffViewer file={file} />`,
    },
    {
      label: '分栏视图（split）',
      code: '<DiffViewer file={file} viewMode="split" />',
    },
    {
      label: '对比一个文本的两个版本',
      code: `const file = createDiffFile({oldValue: before, newValue: after, path: 'src/app.ts'});

<DiffViewer file={file} />`,
    },
    {
      label: '色条、字符级高亮、行不着色',
      code: `<DiffViewer
  file={file}
  viewMode="split"
  changeIndicator="bars"
  inlineHighlight="char"
  hasChangeBackground={false}
/>`,
    },
    {
      label: '评审评论',
      code: `<DiffViewer
  file={file}
  onLineNumberClick={(ref) => startComment(ref.side, ref.lineNumber)}
  renderLineAnnotation={(ref) => {
    const thread = threads.get(\`\${ref.side}:\${ref.lineNumber}\`);
    return thread ? <CommentThread thread={thread} /> : null;
  }}
/>`,
    },
  ],

  props: [
    {
      name: 'file',
      type: 'DiffViewerFile',
      description:
        '要渲染的文件：路径、状态、二进制标志以及带行号的 hunk。用 parseUnifiedDiff 或 createDiffFile 构建。',
      required: true,
    },
    {
      name: 'viewMode',
      type: "'unified' | 'split'",
      description:
        "'unified' 单列显示，删除行位于其替换行之上；'split' 左侧显示旧文件、右侧显示新文件，每个删除行与其替换的新增行成对排列。",
      default: "'unified'",
    },
    {
      name: 'language',
      type: 'string | CodeLanguage',
      description:
        '语法高亮语言：内置标识符，或单独导入的 CodeBlock 语言值（如来自 @astryxdesign/core/CodeBlock/languages/graphql 的 graphql），或用 createCodeLanguage 创建的值。默认从文件名或扩展名在内置语言与 codeLanguages 中推断；无法匹配的文件按纯文本渲染。',
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        '文件名或扩展名可推断的语言值，如 [graphql, dockerfile]；靠后的条目优先。评审页面上的每个 DiffViewer 传入相同列表。',
    },
    {
      name: 'hasLineNumbers',
      type: 'boolean',
      description: '显示新旧两组行号边距。',
      default: 'true',
    },
    {
      name: 'isWrapped',
      type: 'boolean',
      description:
        '换行显示长行而不是横向滚动。不换行时，行号和变更指示符在代码滚动时保持固定；split 视图中每侧是独立的滚动容器，分栏始终保持对半固定，两侧横向同步滚动。代码横向溢出时，横向过度滚动（弹性回弹、滑动导航）被关闭。',
      default: 'false',
    },
    {
      name: 'changeIndicator',
      type: "'classic' | 'bars' | 'none'",
      description:
        "变更行在代码旁的标记方式：'classic' 为 +/− 字形，'bars'（新增行为实心条，删除行为虚线条），或 'none'。任何模式下屏幕阅读器都会朗读 \"Added\"/\"Removed\"。",
      default: "'classic'",
    },
    {
      name: 'inlineHighlight',
      type: "'word' | 'char' | 'none'",
      description:
        '在每个删除行及其替换的新增行内高亮变化的词（或字符），配对方式与 split 视图相同。除空白外毫无共同之处的行不做行内高亮。',
      default: "'word'",
    },
    {
      name: 'hasChangeBackground',
      type: 'boolean',
      description:
        '为新增行和删除行的行着色。关闭后仅变更指示符、行号和行内高亮标记变更。',
      default: 'true',
    },
    {
      name: 'isCollapsible',
      type: 'boolean',
      description:
        '把文件头部变成可折叠的展开控件，用于隐藏和显示 hunk。仅当文件有路径可为控件命名时生效。',
      default: 'true',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: '受控的折叠状态。与 onCollapsedChange 搭配使用。',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: '非受控时的初始折叠状态。',
      default: 'false',
    },
    {
      name: 'onCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description:
        '头部切换时以新的折叠状态调用。',
    },
    {
      name: 'headerEnd',
      type: 'ReactNode',
      description:
        '文件头部末尾的内容，如 "Viewed" 复选框或文件操作菜单。',
    },
    {
      name: 'renderLineAnnotation',
      type: '(ref: DiffViewerLineRef) => ReactNode',
      description:
        '在某一行的下方以通栏行渲染内容，如评审评论；没有内容可显示的行返回 null。split 视图中该行位于行所属的一侧之下。',
    },
    {
      name: 'onLineNumberClick',
      type: '(ref: DiffViewerLineRef, event: MouseEvent<HTMLButtonElement>) => void',
      description:
        '把每行的行号变成按钮，例如用于在该行发起评论。按钮是行所锚定的编号：删除行用原编号，新增或未变更行用变更后文件的编号（未变更行的原编号保持纯文本）。每个行号都是独立的 Tab 停留点。',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: 'hunk 区域滚动前的最大高度。',
    },
    {
      name: 'syntaxTheme',
      type: 'SyntaxThemeDefinition',
      description:
        '按实例的语法主题，同 CodeBlock。未设置时应用最近的 SyntaxTheme 或主题语法颜色。',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: '转发到根元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。',
    },
  ],
};
