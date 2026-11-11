// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Item',
  isHiddenFromOverview: true,
  description:
    'DropdownMenu 指针呈现中的一个操作或目标行。父菜单负责键盘导航；该行负责激活、禁用状态、目标行为、内容布局和主题目标。支持的宿主属性、DOM 处理程序、className、style、xstyle 和 ref 会落在或组合到 role="menuitem" 根元素上。',
  usage: {
    description:
      '在 DropdownMenu 组合模式中使用 DropdownMenuItem 承载单个操作或目标。label、description、icon 和 endContent 保持非交互；控件应放在单独的行或菜单的 header/footer 中。',
    bestPractices: [
      {
        guidance: true,
        description:
          '目标跳转使用 href，这样 LinkProvider、修饰键点击、中键点击和浏览器的链接行为都能保留。',
      },
      {
        guidance: true,
        description:
          '只有当激活需要在同一行上就地反馈结果时，才使用 hasCloseOnSelect=false。',
      },
      {
        guidance: false,
        description:
          '不要把按钮、链接或其他可聚焦控件放进 label、description 或 endContent。每个菜单行只有一个交互目标。',
      },
    ],
    anatomy: [
      {
        name: 'Row',
        required: true,
        description:
          '持有激活、禁用状态、目标行为和主题状态的 role="menuitem" 根元素。',
      },
      {
        name: 'Content',
        required: true,
        description:
          '非交互的 label，加上可选的 icon、description 和尾部内容。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size', 'variant'],
      },
    ],
  },
  playground: {
    // Standalone DropdownMenuItem has no required props, so the properties-tab
    // preview renders an empty row without seeded content. Seed a label and
    // description so the preview is meaningful.
    defaults: {label: 'Edit', description: 'Modify this item'},
  },
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description:
        '显示在标签前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        "选中该项时的回调。键盘激活会以携带修饰键的合成点击到达。带 `href` 的行会在浏览器导航前运行；带修饰键的点击（⌘、Ctrl、Shift、Alt、中键）会被跳过并交给浏览器处理。",
    },
    {
      name: 'href',
      type: 'string',
      description:
        '该行导航到的地址。此时该行通过 LinkProvider 渲染为带 role="menuitem" 的真实链接，修饰键点击或中键点击保留浏览器语义——新标签页——而不会运行 onClick。',
    },
    {
      name: 'target',
      type: "'_blank' | '_self'",
      description: '链接目标。仅与 href 一起使用。',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        '链接关系。target="_blank" 时自动加入 noopener noreferrer。仅与 href 一起使用。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '该行是否不可用。禁用行会暴露 aria-disabled、移除链接目标并抑制激活。',
      default: 'false',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签和描述之后渲染的非交互内容。',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      description:
        '激活该项时是否关闭菜单。操作要在该项上就地反馈结果时设为 false。',
      default: 'true',
    },
    {
      name: 'variant',
      type: "'default' | 'destructive'",
      description:
        "视觉变体。'destructive' 以错误色渲染标签、描述和图标，用于危险操作（如删除）。",
      default: "'default'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        '转发到行根元素（携带 role="menuitem" 的元素）的 ref。用以元素为键的 observer 或 overlay 注册该行。',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Item',
  description:
    'DropdownMenu 指针呈现中的一个操作或目标行。父菜单负责键盘导航；该行负责激活、禁用状态、目标行为、内容布局和主题目标。支持的宿主属性、DOM 处理程序、className、style、xstyle 和 ref 会落在或组合到 role="menuitem" 根元素上。',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        '选中该项时的回调。键盘激活会以携带修饰键的合成点击到达；带 href 的行会在浏览器导航前运行，带修饰键的点击则交给浏览器处理。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '该行导航到的地址。此时该行渲染为带 role="menuitem" 的真实链接，带修饰键的点击或中键点击保留浏览器语义（新标签页）。',
    },
    {
      name: 'target',
      type: "'_blank' | '_self'",
      description: '链接目标。仅与 href 一起使用。',
    },
    {
      name: 'rel',
      type: 'string',
      description: '链接关系。target="_blank" 时自动加入 noopener noreferrer。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '该行是否不可用；不可用的行不会激活或导航。',
      default: 'false',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签和描述之后渲染的非交互式附加内容。',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      description:
        '激活该项时是否关闭菜单。若操作要在该项上就地反馈结果，请设为 false。',
      default: 'true',
    },
    {
      name: 'variant',
      type: "'default' | 'destructive'",
      description:
        "视觉变体。'destructive' 会以错误色渲染标签、描述和图标，用于危险操作（如删除）。",
      default: "'default'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '根容器的 StyleX 样式。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: '转发到行根元素（带 role="menuitem" 的元素）的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'DropdownMenuItem',
  displayName: 'Dropdown Menu Item',
  description:
    '指针菜单中的单个操作/目标行；父菜单管键盘，该行管激活、状态、目标、内容和根元素输入',
  propDescriptions: {
    icon: '标签前的图标',
    label: '主标签文本',
    description: '标签下方的次要文本',
    onClick:
      '选中回调（event）；键盘激活 = 带修饰键的合成点击；href 行上带修饰键的点击会跳过',
    href: '该行是带 role=menuitem 的真实链接；修饰键/中键点击保留浏览器语义',
    target: "链接目标（'_blank' | '_self'），配合 href",
    rel: '链接 rel；_blank 时自动加入 noopener noreferrer',
    isDisabled: '不可用；移除链接目标并抑制激活',
    endContent: 'label+description 之后渲染的非交互内容',
    hasCloseOnSelect:
      'false 时激活不关闭菜单（结果就地显示在该项上）',
    variant:
      "'destructive' 以错误色渲染该项，用于危险操作",
    xstyle: '根容器的 StyleX 样式',
    ref: '转发到行根元素（携带 role="menuitem" 的元素）',
  },
};
