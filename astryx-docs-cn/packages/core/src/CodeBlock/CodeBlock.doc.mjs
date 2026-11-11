// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CodeBlock',
  displayName: 'Code Block',
  category: 'Content',
  keywords: [
    '代码',
    '语法',
    '高亮',
    '片段',
    'prism',
    'shiki',
    'pre',
    '等宽',
    '代码块',
    '行内',
  ],
  description:
    '带语法高亮的围栏代码块。用于多行代码片段。',
  props: [
    {
      name: 'code',
      type: 'string',
      description: '要显示的代码字符串。',
      required: true,
    },
    {
      name: 'language',
      type: 'string | CodeLanguage',
      description:
        '语法高亮所用语言。字符串选择内置语言：ts、js、tsx、jsx、json、html、xml、svg、css、scss、less、python、bash/sh/zsh/shell、php、hack、yaml、markdown、c、cpp（c++、cc、cxx、hpp、hh）、sql、rust、kotlin、swift、go。其他语言自行导入后传入：graphql、java、thrift、objectiveC、toml、powershell、ruby、lua、dockerfile 来自 @astryxdesign/core/CodeBlock/languages/<path>（如 languages/graphql、languages/objective-c），或用 createCodeLanguage({name, identifiers, tokenize}) 自制。值形式会以其 name 标注并把首个 identifier 反映为 data-language。设为 "plaintext" 可禁用高亮。',
      default: "'plaintext'",
    },
    {
      name: 'title',
      type: 'string',
      description: '标题栏中显示的文件名或标签。',
    },
    {
      name: 'hasLanguageLabel',
      type: 'boolean',
      description:
        '在标题栏显示语言名称。language 为 "plaintext" 时隐藏。',
      default: 'true',
    },
    {
      name: 'hasLineNumbers',
      type: 'boolean',
      description: '显示行号边栏。',
      default: 'false',
    },
    {
      name: 'startLineNumber',
      type: 'number',
      description:
        '行号边栏显示的首个行号。边栏按文件坐标（startLineNumber + index）显示，代码摘录因此能按真实行号阅读。highlightLines 使用相同的文件坐标。小于 1 的值钳制为 1。',
      default: '1',
    },
    {
      name: 'highlightLines',
      type: 'number[]',
      description:
        '要高亮的行号（从 1 开始），使用与行号边栏相同的文件坐标（见 startLineNumber）。超出范围的条目不高亮。',
    },
    {
      name: 'isDiff',
      type: 'boolean',
      default: 'false',
      description:
        '将代码按 `language` 渲染为统一 diff：以 + 开头的行是新增，- 是删除，@@ 是 hunk 头（紧邻其前的 `--- `/`+++ ` 文件头对同样视为头），其余为上下文。语言标签显示为 `diff` 或 `<language> diff`。加/删符号独占一列，行的其余部分保留语法高亮；复制返回与源码完全一致的内容。Markdown ```diff 与 ```diff-<lang> 围栏会启用此项。',
    },
    {
      name: 'hasCopyButton',
      type: 'boolean',
      description: '显示复制到剪贴板按钮。',
      default: 'true',
    },
    {
      name: 'onCopy',
      type: '() => void',
      description: '代码复制完成后触发的回调。',
    },
    {
      name: 'onCopyError',
      type: '(error: unknown) => void',
      description:
        '剪贴板写入失败时以拒绝原因调用一次。复制按钮显示叉号，并以"无法将值复制到剪贴板。"命名和播报；错误本身不显示。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '自定义控件，显示在复制按钮之前：块有标题栏时位于其中，否则位于代码旁的顶部行末角，绝不遮挡代码。它不会创建标题栏，也不会折叠块。ghost sm IconButton 与复制按钮的尺寸和变体一致。',
      slotElements: [
        {
          __element: 'IconButton',
          props: {
            variant: 'ghost',
            size: 'sm',
            label: 'Run in terminal',
          },
        },
      ],
    },
    {
      name: 'isWrapped',
      type: 'boolean',
      description: '长行换行显示，而不是启用横向滚动。',
      default: 'false',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: '块开始纵向滚动前的最大高度。',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '文本尺寸变体。',
      default: "'md'",
    },
    {
      name: 'width',
      type: 'string',
      description:
        "代码块的宽度。任意 CSS 宽度值。'fit-content'（默认）收缩至最长行。'100%' 填满父级宽度。",
      default: "'fit-content'",
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        "容器呈现样式。'card'（默认）：带边框圆角与柔和语法背景，呈独立卡片外观。'section'：无边框圆角且背景透明，使块融入其嵌入的卡片或面板。",
      default: "'card'",
    },
    {
      name: 'tokenizer',
      type: '(code: string, language: string) => Array<{type: string; start: number; end: number}>',
      description:
        '已弃用：改为向 language={createCodeLanguage({name, identifiers, tokenize})} 传入同一函数。仍按发布时的行为工作且优先于 language；astryx upgrade 会改写静态用法。',
    },
    {
      name: 'syntaxTheme',
      type: 'SyntaxThemeDefinition',
      description:
        '按实例覆盖语法主题。相当于把块包在 <SyntaxTheme theme={...}> 中的简写。接受 @astryxdesign/core/theme/syntax 的预设或经 defineSyntaxTheme() 创建的主题。默认取最近的 SyntaxTheme 祖先或主题级语法颜色。',
    },
    {
      name: 'highlightMode',
      type: "'auto' | 'ranges' | 'spans'",
      description: '语法高亮渲染模式。',
      default: "'auto'",
    },
    {
      name: 'isCollapsible',
      type: 'boolean',
      description:
        '允许把代码主体折叠为仅剩标题栏。初始展开；当代码超过 collapsibleThreshold 行时，可见标题栏变为可点击。无标题栏的块永不折叠，移除标题栏会展开已折叠的块。',
      default: 'false',
    },
    {
      name: 'collapsibleThreshold',
      type: 'number',
      description:
        '折叠开关出现前所需的最小行数。低于该阈值时，即使 isCollapsible 为 true，代码块仍正常渲染。',
      default: '10',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLPreElement>',
      description: '转发至代码块根元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS class 名。样式定制优先使用 xstyle。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: '内联样式。需要 StyleX 优化时优先使用 xstyle。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  components: [{name: 'Code'}],
  playground: {
    defaults: {
      code: 'import {Button} from \'@astryxdesign/core/Button\';\n\nexport function App() {\n  return <Button label="Hello" variant="primary" />;\n}',
      language: 'tsx',
      hasCopyButton: true,
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-code-block',
        visualProps: ['size', 'language', 'container'],
      },
      {
        className: 'astryx-code-block-header',
        visualProps: ['size', 'language', 'container'],
      },
      {className: 'astryx-code-block-title', visualProps: ['size', 'language']},
      {className: 'astryx-code-block-copy-button'},
    ],
    vars: [
      {
        name: '--_codeblock-gutter-width',
        description:
          '行号边栏的宽度，按最后一行的位数计算，使代码列从稳定的偏移处开始。',
        default: '2ch',
        private: true,
      },
    ],
    componentIcons: [
      {
        slot: 'code-block-copy',
        description: '复制按钮的图标。',
        fallback:
          '`copy`；复制成功反馈时为 `check`；复制失败显示时为 `close`',
        state: [
          {
            name: 'copied',
            type: 'boolean',
            description:
              '复制成功后的反馈显示期间为 true。复制失败显示期间为 false，此时映射该插槽的主题会绘制其默认图标；按钮仍以失败语义命名和播报。',
          },
        ],
        whenNull:
          '隐藏图标。按钮保留其尺寸、名称、tooltip 与复制操作。',
      },
    ],
  },
  usage: {
    description:
      'CodeBlock 渲染带行号、复制按钮与可选折叠区域的语法高亮代码。源文件、终端命令、配置示例等多行片段用 CodeBlock。正文中的函数名、变量或命令行参数等内联引用用 Code。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 language prop 设置为与代码内容匹配，保证语法高亮准确。语言未知时使用 "plaintext"。',
      },
      {
        guidance: true,
        description:
          '代码表示文件时添加 title。它为读者提供上下文，并显示在标题栏中与复制按钮并列。',
      },
      {
        guidance: true,
        description:
          '函数名或命令行参数等简短内联引用用 Code，独立多行片段用 CodeBlock。',
      },
      {
        guidance: false,
        description:
          '不要为短片段（少于 5 行）开启行号；徒增杂乱而无助于导航。',
      },
      {
        guidance: false,
        description:
          '不要把代码块嵌进可滚动容器；改用 maxHeight prop，它原生处理溢出。',
      },
    ],
    anatomy: [
      {
        name: 'Header Bar',
        required: false,
        description:
          '标题栏存在时显示 title、可见语言标签、endContent 与复制按钮。有 title 或可见语言标签时，无论行数多少都会创建标题栏。无 title 且 hasLanguageLabel={false} 时，endContent 与复制按钮位于代码旁的独立列中，与第一行居中对齐且绝不遮挡；单行代码块此时呈现为单行。',
      },
      {
        name: 'Header Title',
        required: false,
        description:
          '在标题栏内组合可选的 title、可见语言标签与折叠箭头。',
      },
      {
        name: 'Line Numbers',
        required: false,
        description:
          '沿左缘的行号边栏。经 hasLineNumbers 开启。',
      },
      {
        name: 'Code Body',
        required: true,
        description: '语法高亮的代码内容。',
      },
      {
        name: 'Highlighted Lines',
        required: false,
        description: '特定行上的背景强调色，用于吸引注意。',
      },
      {
        name: 'Copy Button',
        required: false,
        description:
          '将代码字符串复制到剪贴板。默认显示。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'CodeBlock displays syntax-highlighted code snippets with optional line numbers, copy button, and collapsible sections. Use CodeBlock for fenced multi-line code and Code for inline code within prose.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set the language prop to enable syntax highlighting. Use "plaintext" when the language is unknown or not supported.',
      },
      {
        guidance: true,
        description:
          'Use Code for short inline code references within body text, and CodeBlock for standalone multi-line snippets.',
      },
      {
        guidance: false,
        description:
          'Enable line numbers for short snippets where they add visual noise without aiding comprehension.',
      },
      {
        guidance: false,
        description:
          'Wrap code blocks in a scrollable container when isWrapped or maxHeight already handles overflow.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '经 CSS Custom Highlight API 实现的语法高亮代码块（零 DOM 开销）；span 回退；正文行内代码用 Code',
  usage: {
    description:
      'CodeBlock 渲染带行号、复制按钮与可选折叠区域的语法高亮代码。源文件、终端命令、配置示例等多行片段用 CodeBlock。正文中的函数名、变量或命令行参数等内联引用用 Code。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 language prop 设置为与代码内容匹配，保证语法高亮准确。语言未知时使用 "plaintext"。',
      },
      {
        guidance: true,
        description:
          '代码表示文件时添加 title。它为读者提供上下文，并显示在标题栏中与复制按钮并列。',
      },
      {
        guidance: true,
        description:
          '函数名或命令行参数等简短内联引用用 Code，独立多行片段用 CodeBlock。',
      },
      {
        guidance: false,
        description:
          '不要为短片段（少于 5 行）开启行号；徒增杂乱而无助于导航。',
      },
      {
        guidance: false,
        description:
          '不要把代码块嵌进可滚动容器；改用 maxHeight prop，它原生处理溢出。',
      },
    ],
  },
};
