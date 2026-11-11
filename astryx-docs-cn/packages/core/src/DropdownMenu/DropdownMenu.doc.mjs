// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Trigger button',
    required: true,
    description: '打开和关闭当前菜单呈现方式的按钮。',
  },
  {
    name: 'Trigger indicator icon',
    required: false,
    description:
      '启用 hasChevron 时，带标签触发器显示的可选尾部箭头。',
  },
  {
    name: 'Pointer menu surface',
    required: false,
    description:
      '指针呈现方式使用的锚定顶级或嵌套菜单面板。',
  },
  {
    name: 'Pointer action row',
    required: false,
    description:
      '锚定菜单中的操作、可选项或子菜单触发行。',
  },
  {
    name: 'Icon-rendered item icon',
    required: false,
    description:
      '通过 Icon 在操作行开头渲染的可选语义图标或组件图标。',
  },
  {
    name: 'Caller-rendered item start content',
    required: false,
    description:
      '直接渲染在操作行开头的可选任意 React 内容。',
  },
  {
    name: 'Checkbox indicator',
    required: false,
    description:
      '复选操作行的装饰性共用复选指示器。',
  },
  {
    name: 'Radio indicator',
    required: false,
    description:
      '装饰性共用单选指示器，另有一个菜单自身的目标。',
  },
  {
    name: 'Pointer section heading',
    required: false,
    description:
      '为锚定菜单中一组行提供标签的标题：数据驱动的 section 或组合式的 DropdownMenuGroup。',
  },
  {
    name: 'Pointer divider',
    required: false,
    description: '锚定菜单中分组之间的分隔线。',
  },
  {
    name: 'Pointer submenu indicator icon',
    required: false,
    description:
      '标识操作行为嵌套浮出触发器的尾部箭头。',
  },
  {
    name: 'Touch sheet frame',
    required: false,
    description:
      '承载触屏操作的 BottomSheet 面板、内容区、把手和可选遮罩。',
  },
  {
    name: 'Touch menu surface',
    required: false,
    description:
      '渲染在触屏面板框架内的菜单自有内容面板。',
  },
  {
    name: 'Touch heading',
    required: false,
    description:
      '当前操作面板标题，打开嵌套操作视图时更新。',
  },
  {
    name: 'Touch action list',
    required: false,
    description: '触屏呈现方式下将操作分组展示的宽松 List。',
  },
  {
    name: 'Touch action row',
    required: false,
    description:
      '触屏呈现方式下用于操作或下钻条目的 ListItem 按钮。',
  },
  {
    name: 'Touch divider',
    required: false,
    description: '触屏呈现方式下操作分组之间的分隔线。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenu',
  displayName: 'Dropdown Menu',
  group: 'DropdownMenu',
  category: 'Action',
  keywords: [
    'dropdown',
    'menu',
    'popover',
    'select',
    'contextmenu',
    'kebab',
    '下拉菜单',
    '操作菜单',
    '弹出菜单',
    '右键菜单',
    '菜单按钮',
  ],
  playground: {
    // `items` is required; without seeded entries the properties-tab preview
    // renders an empty trigger button. Provide a few actions so the preview
    // is meaningful.
    defaults: {
      button: {label: 'Actions'},
      presentation: 'popover',
      items: [
        {label: 'Edit project', icon: 'wrench'},
        {label: 'Duplicate project', icon: 'copy'},
        {label: 'Share project', icon: 'externalLink'},
        {label: 'Archive project', icon: 'stop'},
      ],
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu',
        visualProps: ['presentation'],
      },
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size', 'variant'],
      },
      {
        className: 'astryx-dropdown-menu-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-dropdown-menu-section-heading'},
      {className: 'astryx-dropdown-menu-divider'},
      {className: 'astryx-dropdown-menu-indicator-icon'},
    ],
    vars: [
      {
        name: '--_dropdown-menu-radius',
        description: '菜单弹出层的圆角',
        default: 'var(--radius-container)',
        private: true,
      },
      {
        name: '--_dropdown-menu-padding',
        description: '菜单弹出层的内边距',
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
    '带触发按钮的操作菜单，支持锚定、底部面板或自适应呈现方式。',
  props: [
    {
      name: 'button',
      type: 'DropdownMenuButtonProps',
      description:
        '触发按钮的 prop（Button 的 prop，onClick 除外）。与 `renderTrigger` 互斥。',
      default: "{ label: 'Menu' }",
    },
    {
      name: 'renderTrigger',
      type: '(props: DropdownMenuTriggerProps) => ReactNode',
      description:
        '渲染菜单所依附的控件——IconButton、chip、头像、列表行——而不是内建的 Button。将给定的 props 展开到该控件上：它们承载按压模型（鼠标按下即打开，手指长按时手指未抬起即打开）、键盘打开、切换点击，以及 `aria-haspopup`/`aria-expanded`/`aria-controls`/`id`；菜单随后通过 `aria-labelledby` 以该控件命名。与 `button` 互斥。',
    },

    {
      name: 'items',
      type: 'DropdownMenuOption[]',
      description:
        '菜单条目数组。每个条目是以下之一：操作项 `{label, onClick?, href?, target?, rel?, icon?, description?, endContent?, isDisabled?, variant?, hasCloseOnSelect?, id?}`（`href` 让该行成为真实链接，修饰键点击仍保留浏览器的默认含义；variant `"destructive"` 以错误色渲染；`endContent` 存放尾部内容，如快捷键提示；`id` 是该行的稳定 React key，仅在数组会重排或过滤时需要）、分隔线 `{type: "divider"}`，或分组 `{type: "section", title?, id?, items: [...action items]}`。',
      required: true,
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        "数据驱动条目的呈现表面。'popover' 保持锚定，'bottom-sheet' 始终在模态 BottomSheet 中渲染操作，'adaptive' 在紧凑的粗指针布局上使用 BottomSheet，其余情况保持锚定。组合式 children 目前仅支持 popover。省略时菜单为锚定式，并且在任何设备上用手指操作时，打开它的手指必须先移动 10px 才能选中某一行。传 'popover' 可在所有设备上保留指针行为，包括落点判定规则。",
    },
    {
      name: 'isMenuOpen',
      type: 'boolean',
      description:
        '菜单的受控打开状态。以 true 挂载时渲染为打开状态但不把焦点移入菜单；只有挂载后再打开时，焦点才会移到第一个条目。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '打开状态变化时触发的回调。',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description:
        'popover 呈现方式的最小宽度。长度值可随内容增长；intrinsic 与 CSS 全局关键字会选用首选行内尺寸。所有形式都以可用视口空间为上限。默认匹配触发器宽度，不超过该上限。',
    },
    {
      name: 'menuMaxHeight',
      type: 'number',
      description:
        'popover 呈现方式的最大高度（像素），用于必须容纳所有行的菜单。会解除默认的 300px 上限；视口仍是最终边界。',
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        '位于各行之上、菜单本体之外的内容——筛选输入框、开关等。菜单只容纳自己的行，因此不是行的控件应放在这里或 `footer`，绝不要放在行之间。它保留自己的按键与按压行为。有 header 或 footer 时，popover 是围绕菜单的模态对话框：Tab 和 Shift+Tab 在 header、菜单、footer 之间循环移动并在两端回绕，Escape 关闭。底部面板会把它显示在操作上方。',
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        '位于各行之下、菜单本体之外的内容——"创建"按钮等。从菜单按 Tab 会进入这里，越过其最后一个控件的 Tab 回绕到对话框开头（见 `header`）。底部面板会把它显示在操作下方。',
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        "popover 相对触发器的放置位置。底部面板呈现方式忽略该项。逻辑属性：start/end 按菜单自身继承的方向解析（RTL 下镜像）。",
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        "popover 沿放置轴的对齐方式。底部面板呈现方式忽略该项。逻辑属性：start/end 遵循菜单自身继承的方向（RTL 下镜像）。",
      default: "'start'",
    },
    {
      name: 'onClick',
      type: '() => void',
      description:
        '触发器被成功激活时触发的回调。同一次按压中轻触关闭菜单后的收尾点击会被忽略。',
    },
    {
      name: 'hasChevron',
      type: 'boolean',
      description:
        '是否在触发按钮上显示箭头图标。纯图标触发器请设为 false。',
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '组合模式的菜单内容：DropdownMenuItem、DropdownMenuDivider、DropdownMenuSubMenu（笔记本上是浮出面板，手机上是带返回行的下钻视图），以及可选择的条目。与 `items` 互斥。',
    },
  ],
  components: [{name: 'DropdownMenuItem'}],
  usage: {
    anatomy,
    description:
      '在按钮触发的弹出层中显示可操作条目列表的下拉菜单。用于在流程的下一步呈现操作选项，或在不打扰界面的前提下提供上下文操作。与 macOS 和 iOS 的菜单一样：指针释放时其下方的行即被执行，高亮跟随按住的鼠标或手指；鼠标按下即打开并可直接拖入，手指按在触发器上时手指未抬起即打开。',
    bestPractices: [
      {
        guidance: true,
        description:
          '菜单条目保持简短、面向动作，方便用户快速浏览选项。',
      },
      {
        guidance: true,
        description:
          '菜单条目较多时，用分组和分隔线组织相关操作。',
      },
      {
        guidance: true,
        description:
          '对于简短扁平的操作集合，当产品策略要求模态触控表面时，使用 presentation="bottom-sheet"。',
      },
      {
        guidance: true,
        description:
          '当同一组简短操作需要在指针布局上保持锚定、在紧凑粗指针布局上变为 BottomSheet 时，使用 presentation="adaptive"。',
      },
      {
        guidance: true,
        description:
          '当层级结构无法在紧凑触控表面上以相邻浮出面板呈现时，产品可明确采用带返回操作的下钻交互。',
      },
      {
        guidance: true,
        description:
          '在产品代码中显式选择 presentation。紧凑、粗指针、无悬停的 media query 是一种可行策略，但 DropdownMenu 不强加统一的设备断点。',
      },
      {
        guidance: true,
        description:
          '当内容不再是一份简短的即时操作列表时，重新评估交互并选择与实际任务匹配的组件；仅凭内容特征不足以决定组件。',
      },
      {
        guidance: false,
        description:
          '不要用 DropdownMenu 做导航；请改用导航组件。',
      },
      {
        guidance: false,
        description:
          '不要在单个菜单里放置超过 10–12 个条目而不做分组。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep menu items concise and action-oriented so users can scan options quickly.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to group related actions when the menu has many items.',
      },
      {
        guidance: true,
        description:
          'For a short, flat action set, use presentation="bottom-sheet" when product policy calls for a modal touch surface.',
      },
      {
        guidance: true,
        description:
          'Use presentation="adaptive" when the same short action set should remain anchored on pointer layouts and become a BottomSheet on compact coarse-pointer layouts.',
      },
      {
        guidance: true,
        description:
          'For a hierarchy that cannot fit as adjacent flyouts on a compact touch surface, a product may explicitly use a drill-in interaction with a Back action.',
      },
      {
        guidance: true,
        description:
          'Choose presentation explicitly in product code. A compact, coarse-pointer, hover-free media query is one useful policy, but DropdownMenu does not impose a universal device breakpoint.',
      },
      {
        guidance: true,
        description:
          'When the content is no longer a short list of immediate actions, reevaluate the interaction and choose a component that matches the actual task; content traits alone do not determine the component.',
      },
      {
        guidance: false,
        description:
          'Use a DropdownMenu for navigation; use a navigation component instead.',
      },
      {
        guidance: false,
        description:
          'Place more than 10–12 items in a single menu without grouping them into sections.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '在弹出层中展示可操作条目的下拉菜单',
  usage: {
    anatomy,
    description:
      '在按钮触发的弹出层中显示可操作条目列表的下拉菜单。用于在流程的下一步呈现操作选项，或在不打扰界面的前提下提供上下文操作。',
    bestPractices: [
      {
        guidance: true,
        description:
          '菜单条目保持简短、面向动作，方便用户快速浏览选项。',
      },
      {
        guidance: true,
        description:
          '菜单条目较多时，用分组和分隔线组织相关操作。',
      },
      {
        guidance: true,
        description:
          '对于简短扁平的操作集合，当产品策略要求模态触控表面时，使用 presentation="bottom-sheet"。',
      },
      {
        guidance: true,
        description:
          '当同一组简短操作需要在指针布局上保持锚定、在紧凑粗指针布局上变为 BottomSheet 时，使用 presentation="adaptive"。',
      },
      {
        guidance: true,
        description:
          '当层级结构无法在紧凑触控表面上以相邻浮出面板呈现时，产品可明确采用带返回操作的下钻交互。',
      },
      {
        guidance: true,
        description:
          '在产品代码中显式选择 presentation。紧凑、粗指针、无悬停的 media query 是一种可行策略，但 DropdownMenu 不强加统一的设备断点。',
      },
      {
        guidance: true,
        description:
          '当内容不再是一份简短的即时操作列表时，重新评估交互并选择与实际任务匹配的组件；仅凭内容特征不足以决定组件。',
      },
      {
        guidance: false,
        description:
          '不要用 DropdownMenu 做导航；请改用导航组件。',
      },
      {
        guidance: false,
        description:
          '不要在单个菜单里放置超过 10–12 个条目而不做分组。',
      },
    ],
  },
};
