// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Trigger area',
    required: true,
    description:
      '调用方提供的区域，接受右键、键盘上下文菜单键与长按输入。',
  },
  {
    name: 'Pointer menu surface',
    required: false,
    description:
      '指针呈现所用的光标定位菜单面板。',
  },
  {
    name: 'Pointer action row',
    required: false,
    description:
      '指针呈现中由 DropdownMenu 负责的操作、可选项或子菜单行。',
  },
  {
    name: 'Touch sheet frame',
    required: false,
    description:
      '承载触控操作的 BottomSheet 面板、内容区域、把手与可选遮罩。',
  },
  {
    name: 'Touch menu surface',
    required: false,
    description:
      '在触控面板框架内渲染的、由 ContextMenu 负责的内容面板。',
  },
  {
    name: 'Touch action list',
    required: false,
    description: '将数据驱动的触控操作分组的宽松 List。',
  },
  {
    name: 'Touch action row',
    required: false,
    description:
      '触控呈现中用于数据驱动操作或下钻入口的 ListItem 按钮。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ContextMenu',
  displayName: 'Context Menu',
  group: 'ContextMenu',
  category: 'Action',
  isHiddenFromOverview: true,
  keywords: [
    '上下文菜单',
    '右键',
    '菜单',
    '弹层',
    '操作',
    '上下文',
  ],
  theming: {
    targets: [{className: 'astryx-context-menu'}],
    vars: [
      {
        name: '--_dropdown-menu-radius',
        description: '菜单弹层的圆角半径',
        default: 'var(--radius-container)',
        private: true,
      },
      {
        name: '--_dropdown-menu-padding',
        description: '菜单弹层的内边距',
        default: 'var(--spacing-1)',
        private: true,
      },
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  description:
    '右键点击时在光标位置出现的上下文菜单。触发内容作为 children 包裹。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '触发区域：在此内容上右键即可打开菜单。',
      required: true,
    },
    {
      name: 'items',
      type: 'ContextMenuOption[]',
      description:
        '数据驱动的菜单条目。`items` 与 `menuContent` 二者必传其一。每个条目为以下之一：操作项 `{label, onClick?, icon?, isDisabled?, variant?, items?}`（嵌套 `items` 在 popover 呈现中打开飞出菜单，在 bottom-sheet 呈现中下钻到新视图；variant `"destructive"` 以错误色渲染）、分隔线 `{type: "divider"}`，或分区 `{type: "section", title?, items: [...action items]}`。',
    },
    {
      name: 'menuContent',
      type: 'ReactNode',
      description:
        '复合模式下的自定义 JSX 菜单内容。`menuContent` 与 `items` 二者必传其一。',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description: '自定义菜单宽度。',
      default: "'160px'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '菜单项尺寸：控制内边距密度。',
      default: "'md'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '菜单表面的无障碍名称，打开时播报。',
      default: "'Context menu'",
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '菜单打开或关闭时触发的回调。',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '呈现策略。`popover` 在指针位置打开，`bottom-sheet` 始终使用操作表单，`adaptive` 在紧凑触屏上使用 BottomSheet：主指针为粗指针，且视口窄于主题 `md` 断点（默认 768px）或矮于 500px。',
      default: "'popover'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '为 true 时，右键改为显示浏览器原生上下文菜单。',
      default: 'false',
    },
    {
      name: 'triggerXstyle',
      type: 'StyleXStyles | StyleXStyles[]',
      description:
        '应用到触发器包裹层的样式。接受 `stylex.create()` 值，不接受内联样式对象。',
    },
    {
      name: 'triggerAs',
      type: "'div' | 'span'",
      description:
        "触发器包裹层渲染为的元素。'div' 为块级；'span' 为行内包裹层，行文中的引用因此可以在不打断文本流的情况下拥有上下文菜单。",
      default: "'div'",
    },
  ],
  components: [{name: 'ContextMenuItem'}],
  usage: {
    anatomy,
    description:
      '在光标位置出现的右键上下文菜单。用于为特定元素或区域提供上下文操作，而不用可见按钮弄乱 UI。',
    bestPractices: [
      {
        guidance: true,
        description:
          '菜单项保持简洁、面向操作；用户期望快速访问上下文操作。',
      },
      {
        guidance: true,
        description:
          '菜单项较多时，用分区与分隔线将相关操作分组。',
      },
      {
        guidance: true,
        description:
          '桌面端右键需保持光标定位、紧凑触屏设备上长按需打开可触及的 BottomSheet 时，使用 `presentation="adaptive"`。',
      },
      {
        guidance: true,
        description:
          '确保所有上下文菜单操作也可通过其他 UI 元素访问，照顾纯键盘用户。',
      },
      {
        guidance: true,
        description:
          '重要移动端操作保留可见的 MoreMenu 或同等触发入口；长按绝不能是唯一途径。',
      },
      {
        guidance: false,
        description:
          '不要把 ContextMenu 作为访问重要操作的唯一方式；并非所有用户都知道右键。',
      },
      {
        guidance: false,
        description:
          '不要在单个菜单中放置超过 10–12 个项而不分区分组。',
      },
    ],
  },
  playground: {
    defaults: {
      children: {
        __element: 'Card',
        props: {padding: 6},
        children: {
          __element: 'Text',
          props: {color: 'secondary'},
          children: '在此区域右键点击',
        },
      },
      items: [
        {label: '编辑'},
        {label: '创建副本'},
        {type: 'divider'},
        {label: '删除'},
      ],
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      '右键点击时在光标位置出现的上下文菜单。用于为特定元素或区域提供上下文操作，而不使 UI 杂乱。',
    bestPractices: [
      {guidance: true, description: '保持菜单项简洁和面向操作。'},
      {guidance: true, description: '有很多项时使用分组和分隔线。'},
      {
        guidance: true,
        description:
          '在桌面端需要光标定位、紧凑触控设备上需要 BottomSheet 时，使用 `presentation="adaptive"`。',
      },
      {
        guidance: true,
        description: '确保所有上下文菜单操作也可通过其他 UI 元素访问。',
      },
      {
        guidance: true,
        description:
          '重要的移动端操作还应提供可见的 MoreMenu 或同等入口，不要只依赖长按。',
      },
      {
        guidance: false,
        description: '将上下文菜单作为访问重要操作的唯一方式。',
      },
      {
        guidance: false,
        description: '在单个菜单中放置超过 10-12 个项而不分组。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '光标位置的右键上下文菜单',
  usage: {
    anatomy,
    description:
      '光标位置出现的右键上下文菜单。用于为特定元素或区域提供上下文操作。',
    bestPractices: [
      {guidance: true, description: '条目保持简洁、面向操作。'},
      {
        guidance: true,
        description: '用分区与分隔线为相关操作分组。',
      },
      {
        guidance: true,
        description:
          '桌面光标弹层、紧凑触屏 BottomSheet 用 adaptive 呈现。',
      },
      {
        guidance: true,
        description:
          '确保操作也可经其他 UI 元素访问。',
      },
      {
        guidance: true,
        description: '重要操作保留可见的移动端入口。',
      },
      {
        guidance: false,
        description: '不要作为访问重要操作的唯一方式。',
      },
      {
        guidance: false,
        description: '不要放置超过 10–12 项而不分组。',
      },
    ],
  },
};
