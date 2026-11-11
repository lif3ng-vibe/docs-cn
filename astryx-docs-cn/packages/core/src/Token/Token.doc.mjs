// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Token',
  displayName: 'Token',
  category: 'Content',
  keywords: ["token","chip","tag","pill","标记“,”标签“,”可移除“,”可关闭“,”筛选标记"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '显示在标记（token）内部的文本标签。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: '标记的颜色变体。',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '渲染在标签之前的可选图标。',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '标记是否禁用；降低不透明度并阻止交互。',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击移除按钮时触发的回调。提供时会在标记内部渲染一个 X 按钮。',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击处理函数。提供时，标记渲染为 <span> 容器，内部包含不可见的 <button> 以保证无障碍。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '链接 URL。提供时，标记渲染为 <a> 元素。目标地址遵循 Link `href` prop 所述的共享导航规则。',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '通过 aria-description 应用到根元素的无障碍描述。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '渲染在标签之后、移除按钮之前的内容。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '使用仅屏幕阅读器可见的裁剪技术在视觉上隐藏标签；标签仍保持无障碍可访问。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式 (外边距、定位、尺寸)。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],  theming: {
    targets: [
      {className: 'astryx-token', visualProps: ['color', 'size'], states: ['disabled']},
    ],
  },
  usage: {
    description:
      'Token 是一种小型行内元素，用于表示离散的关联数据，如标签、分类或选项。可用它标注内容、展示生效的筛选条件，或表示可移除的条目，例如撰写框中已选的收件人。',
    bestPractices: [
      {guidance: true, description: '用颜色区分类别（例如绿色代表“激活”、红色代表“已封禁”、蓝色代表“审核中”），让用户一眼扫清状态。'},
      {guidance: true, description: '当标记表示可撤销的用户选择（如筛选条件或多选值）时，提供 onRemove 回调。'},
      {guidance: true, description: '当前置图标有助于更快识别标记类型时添加它，例如用户标记用人形图标、标签类标记用标签图标。'},
      {guidance: true, description: '保持标签简短：一到三个词。文本溢出时标记会以省略号截断。'},
      {guidance: false, description: '不要用标记承担主要操作或导航；请改用 Button 或 Link。标记用于展示元数据，而非触发流程。'},
      {guidance: false, description: '除非图标本身含义人尽皆知，否则不要隐藏标签。没有文字的色点是含糊的。'},
      {guidance: false, description: '不要在同一个标记组里混用过多颜色。坚持两三种有意义的颜色，保持调色板易于扫读。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '标识标记类型的前置图标，例如用户头像或分类符号。'},
      {name: 'Label', required: true, description: '可见文本。isLabelHidden 为 true 时也用作无障碍名称。'},
      {name: 'End content', required: false, description: '标签之后的尾部内容，例如计数徽章或状态圆点。'},
      {name: 'Remove button', required: false, description: '提供 onRemove 时出现的 X 按钮，让用户可以移除标记。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Token',
  displayName: 'Token',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '显示在标记内部的文本标签。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '标记的大小。',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: '标记的颜色变体。',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '在标签前渲染的可选图标。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '标记是否被禁用；降低透明度并阻止交互。',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击移除按钮时触发的回调。提供时，标记内会渲染一个 X 按钮。',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击处理函数。提供时，标记渲染为 <span> 容器，内部包含不可见的 <button> 以确保可访问性。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '链接 URL。提供时，标记渲染为 <a> 元素。',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '通过 aria-description 应用于根元素的无障碍描述。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签之后、移除按钮之前渲染的内容。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '使用仅屏幕阅读器可见的裁剪技术视觉隐藏标签；标签仍然保持可访问性。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-token', visualProps: ['color', 'size'], states: ['disabled']},
    ],
  },
  usage: {
    description:
      'Token is a small, inline element for representing discrete pieces of associated data, like tags, categories, or selections. Use it to label content, show active filters, or represent removable items like selected recipients in a compose field.',
    bestPractices: [
      {guidance: true, description: 'Use color to distinguish categories (for example, green for "Active", red for "Blocked", blue for "In Review") so users can scan status at a glance.'},
      {guidance: true, description: 'Provide an onRemove callback when tokens represent user selections that can be undone, like filters or multi-select values.'},
      {guidance: true, description: 'Add a leading icon when it helps identify the token type faster, like a person icon for user tokens or a tag icon for labels.'},
      {guidance: true, description: 'Keep labels short: one to three words. Tokens truncate with ellipsis when the text overflows.'},
      {guidance: false, description: 'Don\'t use tokens for primary actions or navigation; use Button or Link instead. Tokens are for displaying metadata, not triggering workflows.'},
      {guidance: false, description: 'Don\'t hide the label unless the icon alone is universally understood. A color dot without text is ambiguous.'},
      {guidance: false, description: 'Don\'t mix too many colors in one token group. Stick to two or three meaningful colors so the palette stays scannable.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that identifies the token type, like a user avatar or category symbol.'},
      {name: 'Label', required: true, description: 'The visible text. Also used as the accessible name when isLabelHidden is true.'},
      {name: 'End content', required: false, description: 'Trailing content after the label, like a count badge or status dot.'},
      {name: 'Remove button', required: false, description: 'An X button that appears when onRemove is provided, letting users dismiss the token.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '紧凑型 chip/tag，用于行内元数据、筛选与选项。11 种颜色、3 种尺寸，支持移除、点击与链接。',
  usage: {
    description:
      'Token 是表示离散关联数据（标签、分类、选项）的小型行内元素。用于标注内容、展示生效筛选条件或表示可移除条目。',
    bestPractices: [
      {guidance: true, description: '用颜色为类别编码（绿=激活、红=封禁、蓝=审核中）便于快速扫读。'},
      {guidance: true, description: '标记表示可移除的用户选择（筛选、多选值）时提供 onRemove。'},
      {guidance: true, description: '前置图标有助于识别标记类型时添加：用户用人形图标，标签用标签图标。'},
      {guidance: true, description: '标签保持一到三个词。溢出时以省略号截断。'},
      {guidance: false, description: '不要用标记做操作或导航；用 Button 或 Link。标记展示元数据，不触发流程。'},
      {guidance: false, description: '除非图标含义人尽皆知，否则不要隐藏标签。'},
      {guidance: false, description: '同组不要混用过多颜色。两三种有意义的颜色即可保持可扫读。'},
    ],
  },
  propDescriptions: {
    label: '标记内的文本标签。',
    size: "标记尺寸；'sm'、'md' 或 'lg'。",
    color: '标记的颜色变体。',
    icon: '标签前的可选图标。',
    isDisabled: '降低不透明度，阻止交互。',
    onRemove: '点击移除按钮时触发。提供时渲染 X 按钮。',
    onClick: '点击处理函数。渲染 <span> 并内嵌不可见 <button> 以保证无障碍。',
    href: '链接 URL。渲染为 <a> 元素。遵循共享导航规则 (见 Link href)。',
    description: '通过 aria-description 设置在根元素上的无障碍描述。',
    endContent: '标签之后、移除按钮之前的内容。',
    isLabelHidden: '以仅屏幕阅读器可见的裁剪方式视觉隐藏标签；保持无障碍。',
    xstyle: 'StyleX 布局样式 (外边距、定位)。必须是 stylex.create() 值。',
  },
};
