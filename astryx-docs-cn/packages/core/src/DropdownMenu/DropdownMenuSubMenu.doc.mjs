// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuSubMenu',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Submenu',
  isHiddenFromOverview: true,
  description:
    '单个菜单行，展开一个由自身条目组成的嵌套浮出面板。该行采用 DropdownMenuItem 语义（label / icon / description / isDisabled）；其 children 成为浮出内容。向行内末端（inline-end）展开并按视口自动翻转；Right/Enter/Space 打开并聚焦第一个条目，Left/Escape 关闭并把焦点还给触发行（RTL 中 Right/Left 互换）。在手机上（打开菜单时判定的粗指针）该行改为下钻：其行在同一容器中替换菜单的行，以名为 "Back to <parent>" 的返回行开头，Back、Escape 或 ArrowLeft 返回该行。宿主属性和 DOM 事件处理器（aria-*、data-*、id）会落到触发行——携带 role="menuitem" 和 aria-haspopup="menu" 的元素——上；调用方的处理器在该行自身的处理器之后运行，但打开浮出的按键（打开方向键、Enter、Space）和禁用行上的点击除外。数据驱动的菜单请给菜单条目嵌套 `items` 数组，而不是直接使用该组件。',
  playground: {
    defaults: {label: 'Move to'},
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description: '触发行的主标签文本。',
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        '显示在标签前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        '浮出菜单条目：与顶层相同的组件（DropdownMenuItem、嵌套的 DropdownMenuSubMenu、可选项）。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        '禁用的子菜单仍渲染触发行，但永远不会展开浮出面板。',
    },
    {
      name: 'hasSpinner',
      type: 'boolean',
      default: 'false',
      description:
        "在插入符位置显示加载指示器，例如懒加载子菜单的 children 尚在加载时。",
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description:
        '浮出面板最小宽度。面板可随内容增长，但以可用视口空间为上限。默认按内容自适应（最小 160px）。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '浮出面板打开或关闭时调用。',
    },
    {
      name: 'presentation',
      type: "'flyout' | 'drill-in' | 'adaptive'",
      description:
        "子菜单如何展示其行。'flyout' 在行旁边展开；'drill-in' 在同一容器中用这些行和一个返回行替换菜单的行；'adaptive' 在手指打开菜单时下钻（打开菜单时判定的粗指针），否则浮出。",
      default: "'adaptive'",
    },
    {
      name: 'delay',
      type: 'number',
      description:
        '悬停指针在浮出面板打开前等待的时长（毫秒）。键盘焦点和触屏从不等待。',
      default: '150',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description:
        '指针离开后浮出面板保持打开的时长（毫秒）。',
      default: '200',
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        '位于子菜单行之上、菜单本体之外的内容，例如筛选这些行的输入框。它保留自己的按键与按压行为。有 header 或 footer 时，子菜单的表面（浮出面板，或手机上的下钻视图）是一个以该行命名的模态对话框，位于菜单旁边而不是其中：该行会声明 aria-haspopup="dialog"，Tab 和 Shift+Tab 在 header、行、footer 之间循环移动并回绕，Escape 返回该行，指针离开浮出面板只有焦点也离开时才关闭。ContextMenu 不显示它。',
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        "位于子菜单行之下、菜单本体之外的内容，例如通往选项管理处的入口。规则与 header 相同。",
    },
    {
      name: 'menuDataTestId',
      type: 'string',
      description:
        '子菜单自身 role="menu" 元素的测试 id：浮出面板，或手机上的下钻列表。触发行使用 data-testid。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '触发行的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        '转发到触发行——携带 role="menuitem" 和 aria-haspopup="menu"（有 header 或 footer 时为 "dialog"）的元素——的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'DropdownMenuSubMenu',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Submenu',
  description:
    '展开自身 children/items 嵌套浮出的菜单行（单组件，不是 Sub/SubTrigger/SubContent）；手机上改为下钻',
  propDescriptions: {
    label: '触发行的主标签文本',
    icon: '标签前的图标',
    description: '标签下方的次要文本',
    children: '浮出菜单条目（与顶层相同的组件）',
    isDisabled: '渲染触发行但永不展开',
    hasSpinner: '异步加载 children 时以加载指示器替代插入符',
    menuWidth:
      '浮出面板最小宽度，以视口为上限（默认：随内容，最小 160px）',
    onOpenChange: '浮出面板打开/关闭时调用',
    presentation:
      "'flyout' 在行旁展开 | 'drill-in' 替换行 + 返回行 | 'adaptive'（默认）粗指针时下钻",
    delay: '悬停等待后浮出的时长（毫秒，默认 150）',
    hideDelay: '指针离开后浮出面板保持的时长（毫秒，默认 200）',
    header:
      '行上方、菜单外的内容；表面变为以该行命名的模态对话框（Tab 回绕，Escape 返回该行）',
    footer: '行下方、菜单外的内容；规则同 header',
    menuDataTestId: '浮出面板或下钻 role="menu" 的测试 id',
    xstyle: '触发行的 StyleX 样式',
    ref: '指向触发行的 ref（role="menuitem"）',
  },
};
