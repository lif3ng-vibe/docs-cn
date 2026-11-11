// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Outer chrome',
    required: true,
    description:
      '由 Section 持有的容器，提供工具栏表面、内边距与选定的分隔边。',
  },
  {
    name: 'Toolbar',
    required: true,
    description:
      '具名工具栏行，持有工具栏语义以及起始、可选居中与末端的布局。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Toolbar',
  displayName: 'Toolbar',
  category: 'Action',
  keywords: ['toolbar', 'nav', 'bar', 'actions', 'buttonbar', 'header', 'footer', 'action-bar', 'control-bar', '工具栏', '操作栏', '按钮栏'],
  playground: {
    defaults: {
      label: 'Table actions',
      size: 'sm',
      dividers: ['bottom'],
      startContent: {
        __element: 'TabList',
        props: {value: 'overview'},
        children: [
          {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
          {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
        ],
      },
      endContent: [
        {__element: 'Selector', props: {label: 'Status', isLabelHidden: true, placeholder: 'Status', size: 'sm', options: ['Open', 'In progress', 'Done']}},
        {__element: 'Button', props: {label: 'New item', variant: 'primary', size: 'sm'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-toolbar', states: ['size']},
    ],
  },
  components: [
    {
      name: 'Toolbar',
      displayName: 'Toolbar',
      description:
        '通用工具栏容器，提供三个内容插槽与循环 tabindex。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '工具栏的无障碍标签，作为 aria-label 应用。',
          required: true,
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: '对齐到起始侧的内容 (LTR 中靠左)。',
          slotElements: [
            {__element: 'Text', props: {type: 'body', weight: 'bold'}, children: 'Title'},
            {__element: 'Button', props: {label: 'Back', variant: 'ghost', size: 'sm'}},
            {__element: 'IconButton', props: {label: 'Filter', icon: {__element: 'Icon', props: {icon: 'check', size: 'sm'}}, variant: 'ghost', size: 'sm'}},
            {
              __element: 'TabList',
              props: {value: 'overview'},
              children: [
                {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
                {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
              ],
            },
            {
              __element: 'SegmentedControl',
              props: {label: 'View', value: 'list'},
              children: [
                {__element: 'SegmentedControlItem', props: {label: 'List', value: 'list'}},
                {__element: 'SegmentedControlItem', props: {label: 'Grid', value: 'grid'}},
              ],
            },
            {__element: 'Selector', props: {label: 'Status', isLabelHidden: true, placeholder: 'Status', size: 'sm', options: ['Open', 'In progress', 'Done']}},
          ],
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            '居中内容。切换为三栏布局：两侧各栏都能放进中间栏剩余宽度的一半时保持居中；放不下时整行换行。',
          slotElements: [
            {__element: 'Text', props: {type: 'body', weight: 'bold'}, children: 'Center'},
            {
              __element: 'SegmentedControl',
              props: {label: 'View', value: 'list'},
              children: [
                {__element: 'SegmentedControlItem', props: {label: 'List', value: 'list'}},
                {__element: 'SegmentedControlItem', props: {label: 'Grid', value: 'grid'}},
              ],
            },
            {
              __element: 'TabList',
              props: {value: 'overview'},
              children: [
                {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
                {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
              ],
            },
          ],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '对齐到末端的内容 (LTR 中靠右)。',
          slotElements: [
            {__element: 'Button', props: {label: 'Save', variant: 'primary', size: 'sm'}},
            {__element: 'IconButton', props: {label: 'More', icon: {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}}, variant: 'ghost', size: 'sm'}},
            {__element: 'Selector', props: {label: 'Sort', isLabelHidden: true, placeholder: 'Sort by', size: 'sm', options: ['Newest', 'Oldest', 'A–Z']}},
            {__element: 'Badge', props: {label: '3'}},
          ],
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description:
            '工具栏尺寸。控制最小高度，并与 Button、TextInput、TabList、Selector 协调；子元素通过 SizeContext 继承此尺寸作为默认值。',
          default: "'md'",
        },
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description: '每个插槽内项目之间的间距。',
          default: '1',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description:
            '键盘导航的方向。控制方向键方向。',
          default: "'horizontal'",
        },
        {
          name: 'variant',
          type: 'SectionVariant',
          description: '传递给 Section 的视觉变体。',
          default: "'transparent'",
        },
        {
          name: 'dividers',
          type: "Array<'top' | 'bottom' | 'start' | 'end'>",
          description: '工具栏四周渲染的边框/分隔线。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],    },
  ],
  usage: {
    anatomy,
    description:
      'Toolbar 是带有左、中、右区域的水平栏。用于内容区域内的上下文操作 (表格上方、卡片内或面板中)，而非页面级页眉。在工具栏上设置一次尺寸，其中的所有按钮、输入框和标签页会自动匹配。',
    bestPractices: [
      {guidance: true, description: '把“返回”等次要操作放在左侧，“保存”等主要操作放在右侧。'},
      {guidance: true, description: '让批量选择等临时工具栏在视觉上有区分度，让用户看出它们是上下文相关的，例如用背景色或边框。'},
      {guidance: true, description: '用分隔线、背景变体或两者兼用，让工具栏与其下方内容在视觉上分离。'},
      {guidance: true, description: '卡片页眉带有筛选、添加等交互操作时用 Toolbar 作为页眉；它提供插槽布局、键盘导航与尺寸级联。若页眉只是无操作的标题，LayoutHeader 或 Section 就够了。'},
      {guidance: false, description: '不要在一个工具栏里塞太多操作；把不常用项移入 MoreMenu。'},
      {guidance: false, description: '不要给单个子按钮设置尺寸；在工具栏上设置一次即可自动级联。'},
      {guidance: false, description: '不要用 Toolbar 承担全应用导航，如主菜单链接或退出登录；请改用 TopNav 或 LayoutHeader。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'Toolbar',
      displayName: 'Toolbar',
      description: '通用工具栏容器，提供三个内容插槽和循环 Tab。',
      propDescriptions: {
        label: '工具栏的无障碍标签，作为 aria-label 应用。',
        startContent: '起始内容（LTR 中靠左对齐）。',
        centerContent: '居中内容。切换为三栏布局：两侧各栏都能放进中间栏剩余宽度的一半时居中；各栏放不下时换行。',
        endContent: '结束内容（LTR 中靠右对齐）。',
        size: '工具栏尺寸。控制最小高度，子组件通过 SizeContext 继承此尺寸作为默认值。',
        gap: '插槽内项目间距。',
        orientation: '键盘导航方向。控制方向键方向。',
        variant: '传递给 Section 的视觉变体。',
        xstyle: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
      },
    },
  ],
  usage: {
    anatomy,
    description:
      'Toolbar is a horizontal bar with left, center, and right areas. Use it for contextual actions within a content area (above a table, inside a card, or in a panel), not as a page-level header. Set the size once on the toolbar and all buttons, inputs, and tabs inside it match automatically.',
    bestPractices: [
      {guidance: true, description: 'Put secondary actions like "Back" on the left, and primary actions like "Save" on the right.'},
      {guidance: true, description: 'Make temporary toolbars like bulk selection visually distinct so users can tell they\'re contextual, for example with a background color or border.'},
      {guidance: true, description: 'Visually separate the toolbar from the content below it, with a divider, a background variant, or both.'},
      {guidance: true, description: 'Use Toolbar as a card header when the header has interactive actions like filter or add; it gives you slot layout, keyboard navigation, and size cascading. If the header is just a title with no actions, a LayoutHeader or Section is enough.'},
      {guidance: false, description: 'Put too many actions in one toolbar; move less common items into a MoreMenu.'},
      {guidance: false, description: 'Set size on individual child buttons; set it once on the toolbar and it cascades automatically.'},
      {guidance: false, description: 'Use Toolbar for app-wide navigation like main menu links or sign out; use TopNav or LayoutHeader for that.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '带左、中、右区域的水平栏。用于内容中的上下文操作，非页面页眉。尺寸向子级级联。',
  usage: {
    anatomy,
    description:
      '带左、可选中、右区域的水平栏。用于内容中的上下文操作 (表格、卡片、面板)，非页面级页眉。尺寸向子级级联。',
    bestPractices: [
      {guidance: true, description: '次要操作 (返回) 放左，主要操作 (保存) 放右。'},
      {guidance: true, description: '临时工具栏 (批量选择) 要有视觉区分，如背景色或边框。'},
      {guidance: true, description: '工具栏与内容分离：分隔线、背景变体或两者。'},
      {guidance: true, description: '有操作 (筛选、添加) 时用 Toolbar 作卡片页眉。只是标题？用 LayoutHeader/Section。'},
      {guidance: false, description: '不要塞满操作；溢出项用 MoreMenu。'},
      {guidance: false, description: '不要给子按钮设尺寸；工具栏设一次，自动级联。'},
      {guidance: false, description: '不要用于全应用导航 (菜单链接、退出登录)；用 TopNav/LayoutHeader。'},
    ],
  },
  components: [
    {
      name: 'Toolbar',
      displayName: 'Toolbar',
      description: '工具栏容器：3 个内容插槽 + 循环 tabindex。',
      propDescriptions: {
        label: '无障碍标签，工具栏上的 aria-label。',
        startContent: '起始对齐的内容。',
        centerContent: '居中内容；三栏布局，放不下时换行。',
        endContent: '末端对齐的内容。',
        size: '工具栏尺寸；控制最小高度并经 SizeContext 向子级级联。',
        gap: '插槽内项目间距。',
        orientation: '键盘导航方向。',
        variant: 'Section 的视觉变体。',
        xstyle: 'StyleX 布局样式。必须是 stylex.create() 值。',
      },
    },
  ],
};
