// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Label',
    required: true,
    description: '标识多行字段的文本。',
  },
  {
    name: 'Description',
    required: false,
    description: '标签与输入之间的辅助文本。',
  },
  {
    name: 'Input container',
    required: true,
    description: '包含文本区及其叠加层的绘制边界。',
  },
  {
    name: 'Text area',
    required: true,
    description: '显示并编辑值的多行控件。',
  },
  {
    name: 'Placeholder',
    required: false,
    description: '空文本区内显示的提示文本。',
  },
  {
    name: 'Start icon',
    required: false,
    description:
      '当 startIcon 是语义名称或图标组件时，在起始处渲染的 Astryx 图标。',
  },
  {
    name: 'Custom start content',
    required: false,
    description:
      '由调用方提供、在起始处渲染的 ReactNode，取代 Astryx 图标。',
  },
  {
    name: 'Spinner',
    required: false,
    description: '显示在输入容器末尾的加载指示器。',
  },
  {
    name: 'Status icon',
    required: false,
    description: '显示在输入内部的错误、警告或成功图标。',
  },
  {
    name: 'Character counter',
    required: false,
    description: '显示在输入容器内的当前与最大字符数。',
  },
  {
    name: 'Field status message',
    required: false,
    description: '与字段关联的附加式或分离式错误、警告或成功消息。',
  },
  {
    name: 'Tooltip status message',
    required: false,
    description: '为 tooltip 变体呈现状态消息的工具提示表面。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TextArea',
  displayName: 'Text Area',
  category: 'Form Controls',
  keywords: [
    'textarea',
    'textfield',
    '多行',
    '评论',
    '消息',
    '自动增高',
    '自适应高度',
    '字数限制',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLTextAreaElement>',
      description: '转发至底层 <textarea> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '文本域的标签文本。始终渲染以保证无障碍。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '文本域的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void',
      description: '文本域值变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description:
        '在 React transition 内于 onChange 之后触发的异步操作。通过 useOptimistic 启用乐观更新。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签，同时保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签与文本域之间的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '在标签旁显示 "Optional" 指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在标签旁显示 "Required" 指示器并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用文本域，阻止交互。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '将文本域设为只读：值以完整不透明度显示并仍随表单提交，但无法编辑。与 isDisabled 不同，只读文本域不会变暗，并保留其表单值。同时设置时 isDisabled 优先。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明文本域被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持文本域可聚焦（字段变为只读）。请使用此 prop，而不是用 Tooltip 包裹已禁用的 TextArea，这样原因会附加在字段本身。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '使文本域进入加载状态，在输入框内显示旋转器。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '文本域为空时显示的占位符文本。',
    },
    {
      name: 'rows',
      type: 'number',
      description: '可见文本行数。',
      default: '3',
    },
    {
      name: 'maxLength',
      type: 'number',
      description:
        '允许的最大字符数，按用户感知字符计：一个 emoji 或旗帜序列算一个。设置后，输入容器内会显示字符计数器（当前/最大），锚定在文字下方靠右处。不原生强制限制；超出时计数器变红并显示警告图标（非颜色的提示线索），屏幕阅读器用户会听到剩余/超限计数播报。需要校验限制的消费方应使用 characterCount（由包导出）计数，使强制逻辑与显示的计数一致。',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description:
        '应用彩色边框和图标的状态指示器。可选消息显示在文本域下方的浮动框中。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以工具提示呈现。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description:
        '在文本域包装器前端内部渲染的图标组件。有效语义名称见 `astryx docs icons`。',
    },
    {
      name: 'hasSpellCheck',
      type: 'boolean',
      description:
        '启用或禁用浏览器拼写检查。',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦文本域。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        '文本域尺寸，影响内部填充。高度由 rows 控制，而非 size。',
      default: "'md'",
    },
    {
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: '内容粘贴到文本域时触发的回调。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '文本域元素的 HTML name 属性，用于表单提交。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串按原样使用，如 "100%"）。会设定整个字段（标签、控件和状态）的尺寸以保持对齐。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域失去焦点时触发的回调。',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description:
        '原生 autocomplete 属性，原样转发给文本域。不影响受控的值。',
    },
    {
      name: 'enterKeyHint',
      type: "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'",
      description:
        '触屏键盘回车键上显示的内容（原生 `enterkeyhint`）。iOS 为 `done`、`go`、`next`、`search` 和 `send` 显示各自的按键（iOS 26 上为图形符号：对勾、箭头、右尖括号、放大镜、上箭头）；`enter` 和 `previous` 保留普通的回车键。Android 上的 Chrome（Gboard）为每个值显示各自的按键；未设置时 TextArea 保留回车键。它只改变按键的标签：按下回车做什么仍由你的处理函数决定。',
    },
    {
      name: 'inputMode',
      type: "'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'",
      description:
        '字段请求的触屏键盘（原生 `inputmode`），不改变字段接受的内容：`numeric` 显示数字键盘，`decimal` 显示小数点键盘，`tel` 显示电话键盘，`search` 显示网页搜索键盘（即使设置了 `enterKeyHint="search"`，iOS 上它的回车键仍显示为 Go）。',
    },
    {
      name: 'autoCapitalize',
      type: "'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'",
      description:
        '触屏键盘在输入时何时自动大写（原生 `autocapitalize`）。未设置时，iOS 会将句首大写。`off` 与 `none` 从不大写；`on` 与 `sentences` 将每句句首大写。',
    },
    {
      name: 'hasAutoCorrect',
      type: 'boolean',
      description:
        '触屏键盘是否在输入时自动更正单词（原生 `autocorrect`）。未设置时由浏览器决定；对用户名、代码等不是单词的值请关闭它。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内（请改为设置 InputGroup 的样式）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框和背景并包含图标与尾部控件的元素，绝非原生输入元素。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-text-area',
        visualProps: ['size', 'status'],
        states: ['disabled', 'readonly'],
      },
      {className: 'astryx-text-area-control'},
      {className: 'astryx-text-area-counter'},
    ],
    vars: [
      {
        name: '--_textarea-inline-padding',
        description:
          "文本域文本的行内内边距。外层容器保持无内边距（padding: 0），使原生缩放手柄位于真正的角落；该变量在内部 <textarea> 上承载内边距，起始图标、状态/加载指示器和字符计数器都与之对齐。",
        default: 'var(--spacing-2)',
        private: true,
      },
    ],
    derived: [
      {
        property: 'paddingInline',
        vars: ['--_textarea-inline-padding'],
        replaces: true,
      },
    ],
  },
  usage: {
    anatomy,
    description:
      'TextArea 是一个多行输入，用于收集评论、描述或消息等较长内容。当预期输入跨多行时使用它。较短的单行值请使用 TextInput。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供可见标签，让用户知道要输入什么。若标签必须隐藏，请设置 isLabelHidden 并为屏幕阅读器保留描述性标签。',
      },
      {
        guidance: true,
        description:
          '存在明确限制时，设置 maxLength 并显示字符计数器；它帮助用户在提交前保持在限制内。',
      },
      {
        guidance: true,
        description:
          '在多行字段中保持回车是换行。只有当你的回车处理逻辑确实与标签一致时，才用 enterKeyHint（send、done）重新标注该键。',
      },
      {
        guidance: true,
        description:
          '用 status prop 内联呈现校验反馈：输入有效时显示 success，软限制用 warning，硬性失败用 error。',
      },
      {
        guidance: true,
        description:
          '添加 description 或 placeholder 澄清预期内容，例如"请详细描述问题"，但绝不要只依赖 placeholder 作为唯一标签。',
      },
      {
        guidance: false,
        description:
          '不要为姓名或邮箱等短的单行值使用 TextArea；请改用 TextInput。',
      },
      {
        guidance: false,
        description:
          '不要只依赖占位符文本来传达字段用途；占位符在聚焦时消失，不是无障碍标签。',
      },
      {
        guidance: false,
        description:
          '不要在不设置状态类型的情况下显示状态消息；彩色边框和图标才是把用户注意力引向消息的元素。',
      },
      {
        guidance: false,
        description:
          '不要用 Tooltip 包裹已禁用的 TextArea 来解释禁用原因。请使用 disabledMessage prop，它把原因附加在字段本身。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'TextArea',
  displayName: 'Text Area',
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLTextAreaElement>',
      description: '转发至底层 <textarea> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description: '文本域的标签文本：始终渲染以确保无障碍性。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '文本域的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void',
      description: '文本域值变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description:
        '在 React transition 内于 onChange 之后触发的异步操作。通过 useOptimistic 启用乐观更新。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和文本域之间的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签旁显示"可选"指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在标签旁显示"必填"指示器并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用文本域，阻止交互。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '将文本域设为只读：值以完整不透明度显示并仍随表单提交，但无法编辑。与 isDisabled 不同，只读文本域不会变暗，并保留其表单值。同时设置时 isDisabled 优先。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明文本域被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持文本域可聚焦（字段变为只读）。请使用此属性，而不是用 Tooltip 包裹已禁用的 TextArea。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '使文本域进入加载状态，在输入框内显示旋转器。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '文本域为空时显示的占位符文本。',
    },
    {
      name: 'rows',
      type: 'number',
      description: '可见文本行数。',
      default: '3',
    },
    {
      name: 'maxLength',
      type: 'number',
      description:
        '允许的最大字符数。设置后，在文本域下方显示字符计数器（当前/最大）。不原生强制限制：超出时计数器显示错误样式。',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description:
        '应用彩色边框和图标的状态指示器。可选消息显示在文本域下方的浮动框中。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description: '在文本域包装器前端内部渲染的图标组件。',
    },
    {
      name: 'hasSpellCheck',
      type: 'boolean',
      description: '启用或禁用浏览器拼写检查。',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦文本域。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '文本域的尺寸，影响内部填充。高度由 rows 控制，而非 size。',
      default: "'md'",
    },
    {
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: '内容粘贴到文本域时触发的回调。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: '文本域元素的 HTML name 属性，用于表单提交。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域失去焦点时触发的回调。',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: '原生 autocomplete 属性，原样转发给文本域。不影响受控的值。',
    },
    {
      name: 'enterKeyHint',
      type: "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'",
      description:
        '触屏键盘回车键上显示的内容（原生 `enterkeyhint`）。iOS 为 `done`、`go`、`next`、`search` 和 `send` 显示各自的按键（iOS 26 上为图标：对勾、箭头、右尖括号、放大镜、上箭头）；`enter` 和 `previous` 保留普通的回车键。Android 上的 Chrome（Gboard）为每个值显示各自的按键；未设置时 TextArea 保留回车键。它只改变按键的标签：按下回车做什么仍由你的处理函数决定。',
    },
    {
      name: 'inputMode',
      type: "'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'",
      description:
        '字段请求的触屏键盘（原生 `inputmode`），不改变字段接受的内容：`numeric` 显示数字键盘，`decimal` 显示带小数点的数字键盘，`tel` 显示电话键盘，`search` 显示网页搜索键盘（即使设置了 `enterKeyHint="search"`，iOS 上它的回车键仍显示为“前往”）。',
    },
    {
      name: 'autoCapitalize',
      type: "'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'",
      description:
        '触屏键盘在输入时何时自动大写（原生 `autocapitalize`）。未设置时，iOS 会将句首大写。`off` 与 `none` 从不大写；`on` 与 `sentences` 将每句句首大写。',
    },
    {
      name: 'hasAutoCorrect',
      type: 'boolean',
      description:
        '触屏键盘是否在输入时自动更正单词（原生 `autocorrect`）。未设置时由浏览器决定；对用户名、验证码等不是单词的值请关闭它。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内（请改为设置 InputGroup 的样式）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框和背景并包含图标与尾部控件的元素，而非原生输入元素。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-text-area',
        visualProps: ['size', 'status'],
        states: ['disabled', 'readonly'],
      },
      {className: 'astryx-text-area-control'},
      {className: 'astryx-text-area-counter'},
    ],
    vars: [
      {
        name: '--_textarea-inline-padding',
        description:
          '文本域文本的行内内边距。外层容器保持无内边距（padding: 0），使原生缩放手柄位于真正的角落；该变量在内部 <textarea> 上承载内边距，起始图标、状态/加载指示器和字符计数器都与之对齐。',
        default: 'var(--spacing-2)',
        private: true,
      },
    ],
    derived: [
      {
        property: 'paddingInline',
        vars: ['--_textarea-inline-padding'],
        replaces: true,
      },
    ],
  },
  usage: {
    description:
      'TextArea is a multi-line text input for collecting longer-form content like comments, descriptions, or messages. Use it when the expected input spans multiple lines. For shorter, single-line values, use TextInput.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a visible label so users know what to enter. If the label must be hidden, set isLabelHidden with a descriptive label for screen readers.',
      },
      {
        guidance: true,
        description:
          'Set maxLength with a character counter when there is a defined limit; it helps users stay within bounds before they submit.',
      },
      {
        guidance: true,
        description:
          'Keep Return a line break in a multi-line field. Relabel it with enterKeyHint (send, done) only when your own Enter handling does what the label says.',
      },
      {
        guidance: true,
        description:
          'Use the status prop to surface validation feedback inline: show success when input is valid, warning for soft limits, and error for hard failures.',
      },
      {
        guidance: true,
        description:
          'Add a description or placeholder to clarify expected content, like "Describe the issue in detail," but never rely on placeholder alone as the only label.',
      },
      {
        guidance: false,
        description:
          'Avoid using TextArea for short, single-line values like names or emails; use TextInput instead.',
      },
      {
        guidance: false,
        description:
          "Don't rely solely on placeholder text to communicate the purpose of the field; placeholders disappear on focus and are not accessible labels.",
      },
      {
        guidance: false,
        description:
          "Don't show a status message without also setting the status type; the colored border and icon are what draw the user's attention to the message.",
      },
      {
        guidance: false,
        description:
          "Don't wrap a disabled TextArea in Tooltip to explain why it's disabled. Use the disabledMessage prop, which attaches the reason to the field itself.",
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '用于收集较长用户输入的多行输入。',
  usage: {
    description:
      '用于评论、描述、消息的多行输入。输入跨多行时使用；单行请用 TextInput。',
    bestPractices: [
      {
        guidance: true,
        description:
          '可见标签，或 isLabelHidden 加描述性标签供屏幕阅读器使用。',
      },
      {
        guidance: true,
        description: '存在限制时设置 maxLength 显示字符计数器。',
      },
      {
        guidance: true,
        description:
          '回车保持换行；仅当回车处理逻辑一致时才重新标注（enterKeyHint）。',
      },
      {
        guidance: true,
        description:
          '用 status prop 做内联校验：success、warning、error。',
      },
      {
        guidance: true,
        description:
          '添加 description 或 placeholder 补充语境；绝不用 placeholder 单独当标签。',
      },
      {
        guidance: false,
        description: '单行值不要用 TextArea；请用 TextInput。',
      },
      {
        guidance: false,
        description:
          '不要把 placeholder 当唯一标签；聚焦即消失，且无障碍性差。',
      },
      {
        guidance: false,
        description:
          '不要没有状态类型就显示状态消息；边框和图标才引人注意。',
      },
      {
        guidance: false,
        description:
          '不要用 Tooltip 包裹已禁用的 TextArea 解释状态；请改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    containerXstyle: '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不含根级 xstyle/className/style。',
    containerClassName: '字段容器的类名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle: '可视控件框的 StyleX 样式（边框、背景、图标）；不是原生输入。',
    controlClassName: '可视控件框的类名。',
    controlStyle: '可视控件框的内联样式。',
    ref: '转发至底层 <textarea> 的 ref。',
    label: '文本域的标签文本；始终渲染以保证无障碍。',
    value: '文本域当前值。',
    onChange: '文本域值变化时触发。',
    changeAction:
      'React transition 内 onChange 之后的异步操作。启用 useOptimistic。',
    isLabelHidden: '视觉上隐藏标签；保持屏幕阅读器可访问。',
    description: '标签与文本域之间的辅助文本。',
    isOptional: '显示 "Optional" 指示器。与 isRequired 互斥。',
    isRequired:
      '显示 "Required" 指示器并设置 aria-required。与 isOptional 互斥。',
    isDisabled: '禁用文本域，阻止交互。',
    isReadOnly:
      '只读：值可见且仍随表单提交，但不可编辑。与 isDisabled 不同：不变暗。',
    disabledMessage:
      '说明文本域被禁用的原因。与 isDisabled 一起使用时，在悬停/聚焦时显示工具提示，并通过 aria-disabled 保持文本域可聚焦（字段变为只读）。用它代替 Tooltip 包裹已禁用的 TextArea。',
    isLoading: '加载状态，输入框内带旋转器。',
    placeholder: '文本域为空时的占位符。',
    rows: '可见文本行数。',
    maxLength:
      '允许的最大字符数。在容器内、文字下方靠右处显示计数器（当前/最大）。不原生强制；超限显示红色 + 警告图标并向屏幕阅读器播报。',
    status:
      '彩色边框 + 图标状态。可选的浮动消息显示在文本域下方。',
    statusVariant:
      '状态消息的放置方式：attached 直接叠加在输入框下方；detached 留间距浮于下方；tooltip 隐藏消息框并显示在状态图标上。',
    labelTooltip: '标签末尾信息图标中的工具提示。',
    startIcon: '文本域包装器前端内部的图标。',
    hasSpellCheck: '启用/禁用浏览器拼写检查。',
    hasAutoFocus: '挂载时自动聚焦文本域。',
    size: '文本域尺寸；影响内部填充。高度由 rows 控制。',
    onPaste: '粘贴到文本域时触发。',
    htmlName: '用于表单提交的 HTML name 属性。',
    onFocus: '聚焦时回调。',
    onBlur: '失焦时回调。',
    autoComplete:
      '原生 autocomplete 属性，原样转发。不影响受控的值。',
  },
};
