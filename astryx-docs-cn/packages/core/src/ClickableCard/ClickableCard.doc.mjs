// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'ClickableCard',
  displayName: 'Clickable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['卡片', '可点击', '交互', '导航', '操作', '链接'],
  usage: {
    description: '用于导航或操作目标的交互式卡片。嵌套的交互元素独立工作。',
    bestPractices: [
      {guidance: true, description: '适用于跳转详情页或触发单一操作的卡片。'},
      {guidance: true, description: '可在内部自由嵌套按钮或链接；它们自行处理事件。'},
      {guidance: false, description: '不要用于切换选中状态；请改用 SelectableCard。'},
      {guidance: false, description: '不要用 transparent 变体且无内边距的方式仅为借用按压模型来承载自有盒体的表面；请改用 useClickableContainer 文档中的 chrome-free 配方：它不会给页面添加任何 Card 样式。'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: '带悬停/聚焦/激活状态的交互式 div。'},
      {name: 'Content', required: true, description: '子内容，可包含嵌套的交互元素。'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '无障碍标签。', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: '点击处理函数：仅在卡片表面触发。'},
    {name: 'href', type: 'string', description: '导航 URL。普通点击、新标签页、Cmd/Ctrl 点击与中键激活都遵循 Link `href` prop 描述的统一导航规则。'},
    {name: 'target', type: 'string', description: '链接目标。', default: "'_self'"},
    {name: 'isDisabled', type: 'boolean', description: '禁用卡片并移除链接目标；卡片保留其 tab 停靠点，并会被播报为已禁用。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '卡片内容。'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '内边距。', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: '背景颜色变体。', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '静止状态阴影层级。常调高以提示整张卡片可点击。', default: "'none'"},
    {name: 'width', type: 'SizeValue', description: '卡片宽度。'},
    {name: 'height', type: 'SizeValue', description: '卡片高度。'},
    {name: 'maxWidth', type: 'SizeValue', description: '卡片最大宽度。'},
    {name: 'xstyle', type: 'StyleXStyles', description: '用于布局定制的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。'},
  ],
  theming: {
    container: true,
    targets: [{className: 'astryx-clickable-card', visualProps: ['variant']}],
    vars: [
      {name: '--_press-overlay', description: '悬停与鼠标状态下 ::after 交互覆盖层的颜色：静止时透明，悬停时（支持悬停的指针）为悬停覆盖层 token，鼠标按住 `:active` 时为按下覆盖层 token。触摸按压控制器绘制的按压（`data-astryx-press`）会改以其图像作为覆盖层图像，并按按压力度呈现，颜色让位于它。由卡片自身的交互部件设置在卡片元素上。', default: 'transparent', private: true},
    ],
  },
  playground: {
    defaults: {
      label: 'View product details',
      href: '#',
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: '无线耳机'},
          {__element: 'XDSText', props: {type: 'body'}, children: '降噪头戴式耳机，续航 30 小时。'},
        ],
      },
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '用于导航/操作目标的交互式卡片。嵌套交互元素独立工作。',
  usage: {
    description: '用于导航/操作目标的交互式卡片。嵌套交互元素独立工作。',
    bestPractices: [
      {guidance: true, description: '用于跳详情页或触发单一操作的卡片。'},
      {guidance: true, description: '内部自由嵌套按钮/链接；它们自行处理事件。'},
      {guidance: false, description: '切换选中不要用它；改用 SelectableCard。'},
      {guidance: false, description: 'transparent 变体 + 无内边距不要只为借用按压模型承载自有盒体表面；改用 useClickableContainer 文档中的 chrome-free 配方（不加 Card 样式）。'},
    ],
  },
  propDescriptions: {
    label: '无障碍标签',
    onClick: '点击回调：仅在卡片表面触发',
    href: '导航 URL；所有激活方式遵循统一导航规则（见 Link href）',
    target: '链接目标',
    isDisabled: '禁用卡片、移除链接目标、保留 tab 停靠点',
    padding: '内边距',
    variant: '背景颜色变体',
    elevation: '静止阴影层级：none|low|med|high；常调高提示可点击',
    width: '卡片宽度',
    height: '卡片高度',
    maxWidth: '卡片最大宽度',
  },
};
