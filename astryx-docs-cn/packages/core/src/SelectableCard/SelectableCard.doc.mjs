// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'SelectableCard',
  displayName: 'Selectable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['card', 'selectable', 'toggle', 'checkbox', 'radio', '卡片', '可选卡片', '切换', '复选', '单选', '选中'],
  usage: {
    description: '在选中与未选中状态间切换、带 accent 边框的卡片。导航场景请用 ClickableCard。',
    bestPractices: [
      {guidance: true, description: '用于多选场景：筛选 chips、功能加购或多个可同时打开的选项网格。'},
      {guidance: true, description: '用于多选分组；用 Set 跟踪选中的 ID。'},
      {guidance: true, description: '聚焦时用 Space 或 Enter 切换选中。'},
      {guidance: false, description: '不要用于导航；请改用 ClickableCard。'},
      {guidance: false, description: '不要用于单选分组：每张卡片都是一个 checkbox，辅助技术会播报为多选组，且每张卡片各占一个 Tab 停留点。'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: '可交互 div，选中时带 accent 边框。'},
      {name: 'Content', required: true, description: '渲染在卡片内的子内容。'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '无障碍标签。', required: true},
    {name: 'isSelected', type: 'boolean', description: '受控选中状态。', required: true},
    {name: 'onChange', type: '(isSelected: boolean) => void', description: '切换时调用。', required: true},
    {name: 'isDisabled', type: 'boolean', description: '禁用卡片。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '卡片内容。'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '内边距。', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: '背景颜色变体。', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '静止时的阴影深度。选中环叠加在其上，因此选中卡片保留自身阴影。', default: "'none'"},
    {name: 'width', type: 'SizeValue', description: '卡片宽度。'},
    {name: 'height', type: 'SizeValue', description: '卡片高度。'},
    {name: 'maxWidth', type: 'SizeValue', description: '卡片最大宽度。'},
    {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。'},
  ],
  theming: {
    container: true,
    targets: [{className: 'astryx-selectable-card', visualProps: ['selected', 'variant']}],
    vars: [
      {name: '--selectable-card-ring-color', description: '主题新增变体所绘制选中环的颜色。内置变体各自用自己的边框 token 画环并忽略此项；新增变体的主题应在与该变体 `backgroundColor` 相同的规则中设置它，因为组件无法保证所选 token 与其不知道的填充色形成对比。', default: 'var(--color-accent)'},
      {name: '--_press-overlay', description: 'hover 与鼠标状态下 ::after 交互叠加层的颜色：静止时透明，悬停时为悬停叠加层 token（支持悬停的指针），鼠标按住 `:active` 时为按压叠加层 token。由触摸按压控制器绘制的按压（`data-astryx-press`）则改用叠加层的 image，并按按压强度呈现，此颜色让位于它。由卡片自身的交互部件设置在卡片元素上。', default: 'transparent', private: true},
    ],
  },
  playground: {
    defaults: {
      label: 'Pro 方案',
      isSelected: true,
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Pro 方案'},
          {__element: 'XDSText', props: {type: 'body'}, children: '$29/月，无限项目与优先支持。'},
        ],
      },
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '在选中/未选中状态间切换、带 accent 边框的卡片。导航请改用 ClickableCard。',
  usage: {
    description: '在选中/未选中状态间切换、带 accent 边框的卡片。导航请改用 ClickableCard。',
    bestPractices: [
      {guidance: true, description: '用于多选场景：筛选 chips、加购项、选项网格。'},
      {guidance: true, description: '用于多选分组；用 Set 跟踪选中 ID。'},
      {guidance: true, description: '聚焦时用 Space 或 Enter 切换选中。'},
      {guidance: false, description: '不要用于导航；请改用 ClickableCard。'},
      {guidance: false, description: '不要用于单选：每张卡片都是一个 checkbox，屏幕阅读器会播报为多选。'},
    ],
  },
  propDescriptions: {
    label: '无障碍标签',
    isSelected: '受控选中状态',
    onChange: '切换时调用',
    isDisabled: '禁用卡片',
    padding: '内边距',
    variant: '背景颜色变体',
    elevation: '静止阴影深度：none|low|med|high；选中环叠加其上',
    width: '卡片宽度',
    height: '卡片高度',
    maxWidth: '卡片最大宽度',
  },
};
