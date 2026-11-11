// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'ScrollableArea',
  displayName: 'Scrollable Area',
  category: 'Layout',
  keywords: ['scroll', 'overflow', 'viewport', '滚动', '溢出', '视口', '逻辑轴', '键盘', '过度滚动', 'sticky', '滚动条', '内边距', 'full bleed', 'scrollarea', 'scrollview'],
  usage: {
    description: '提供原生滚动视口与一个真实被观测的内容盒。仅当所请求的逻辑轴实际可滚动时，视口才进入 Tab 序；containment 也只作用于生效的轴。',
    bestPractices: [
      {guidance: true, description: '为每个区域提供简明标签，说明键盘用户将滚动的内容。'},
      {guidance: true, description: '普通滚动容器请保持 `role` 不设置（渲染为 `group`）。仅当区域重要到值得进入屏幕阅读器的地标导航时才用 `role="region"`；每个 `region` 都会在该列表中增加一项。'},
      {guidance: true, description: '根据内容意图选择 `inline`、`block` 或 `both`；组件会经由书写模式与方向映射逻辑轴。'},
      {guidance: true, description: '嵌套区域保持默认 `overscroll="allow"`，除非交互确实需要 containment。'},
      {guidance: true, description: '当组件已同时拥有视口与合适的内容盒，或子元素必须保持为直接的 flex/grid 项、或需要保留确定的百分比块尺寸基准时，请改用 `useScrollableArea`。'},
      {guidance: true, description: 'ScrollableArea 持有一个最小尺寸为 100% 的普通块级内容盒。inline 与 both 模式使用 max-content 行内尺寸，因此内在的行内布局会有意宽于视口。'},
      {guidance: true, description: '在内容盒上使用逻辑内边距 prop，让嵌套的 full-bleed 组件获得相同的内缩几何。'},
      {guidance: true, description: '仅当视口本身需要触及祖先容器边缘时才设置 `isFullBleed`；默认关闭。'},
      {guidance: true, description: '仅当内容自适应的视口需要有意保持为 Sticky 边界时才设置 `stickyContainment="always"`。'},
      {guidance: false, description: '不要在没有任何可见且可操作的溢出替代入口时隐藏原生滚动条。'},
      {guidance: false, description: '不要在 ScrollableArea 外再套一层溢出容器；滚动应由一个原生视口负责。'},
    ],
    anatomy: [
      {name: 'Viewport', required: true, description: '根原生滚动容器、无障碍名称的持有者、生效时的焦点目标，也是 `astryx-scrollable-area` 主题目标。'},
      {name: 'Content box', required: true, description: '与视口一同被观测的真实内部布局盒。inline 滚动时使用 max-content 行内尺寸且最小 100%。'},
    ],
  },
  props: [
    {name: 'axis', type: "'inline' | 'block' | 'both'", description: '允许原生滚动的逻辑轴。', default: "'block'"},
    {name: 'label', type: 'string', description: '视口变为可键盘滚动时的无障碍名称。', required: true},
    {name: 'role', type: "'group' | 'region'", description: '命名视口的语义；只有应进入地标导航的区域才用 `region`。', default: "'group'"},
    {name: 'overscroll', type: "'allow' | 'contain'", description: '生效轴在到达边缘时是否继续滚动祖先容器。', default: "'allow'"},
    {name: 'width', type: 'SizeValue', description: '视口宽度；数字按像素解释，字符串原样使用。'},
    {name: 'height', type: 'SizeValue', description: '视口高度；数字按像素解释，字符串原样使用。'},
    {name: 'maxWidth', type: 'SizeValue', description: '视口最大宽度。'},
    {name: 'minHeight', type: 'SizeValue', description: '视口最小高度。'},
    {name: 'stickyContainment', type: "'whenScrollable' | 'always'", description: '内容自适应时是否将 Sticky 归属让给外层容器，或有意让本视口保持为 CSS Sticky 边界。', default: "'whenScrollable'"},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '每个逻辑边缘的内容内边距；发布匹配的内缩几何。', default: '0'},
    {name: 'paddingInline', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 inline 轴内容内边距；在该轴上覆盖 `padding`。'},
    {name: 'paddingInlineStart', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 inline-start 内容内边距；覆盖更宽泛的内边距值。'},
    {name: 'paddingInlineEnd', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 inline-end 内容内边距；覆盖更宽泛的内边距值。'},
    {name: 'paddingBlock', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 block 轴内容内边距；在该轴上覆盖 `padding`。'},
    {name: 'paddingBlockStart', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 block-start 内容内边距；覆盖更宽泛的内边距值。'},
    {name: 'paddingBlockEnd', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '逻辑 block-end 内容内边距；覆盖更宽泛的内边距值。'},
    {name: 'isFullBleed', type: 'boolean', description: '让视口脱离继承的容器内边距，而不改变内容内边距。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '渲染在被观测内容盒内的内容。'},
    {name: 'xstyle', type: 'StyleXStyles', description: '视口的 StyleX 尺寸与原生滚动条呈现覆盖。必须是 `stylex.create()` 的值，而非内联样式对象。'},
  ],
  playground: {
    defaults: {
      axis: 'block',
      label: '可滚动示例',
      children: '添加足够内容以超出受限的视口。',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-scrollable-area', visualProps: ['axis']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '原生逻辑轴滚动视口，带条件键盘访问、实时边缘状态与被观测的内容几何',
  usage: {
    description: '用于完整的视口/内容组合；已有结构请用 useScrollableArea。',
    bestPractices: [
      {guidance: true, description: '始终提供简明标签。'},
      {guidance: true, description: '优先 overscroll allow；仅对有意设计的嵌套交互用 contain。'},
      {guidance: true, description: '用内容内边距 prop 发布内缩几何；isFullBleed 仅用于视口脱边。'},
      {guidance: false, description: '不要在它外面再嵌套一层溢出容器。'},
    ],
    anatomy: [
      {name: 'Viewport', required: true, description: '原生滚动、条件 Tab 停留点与主题目标'},
      {name: 'Content box', required: true, description: '真实被观测的布局盒'},
    ],
  },
  propDescriptions: {
    axis: "逻辑滚动意图：'inline' | 'block'（默认）| 'both'",
    label: '必填的视口无障碍名称',
    role: "命名视口语义：'group'（默认）| 'region'（仅限应进入地标导航的区域）",
    overscroll: "边缘行为：'allow'（默认）| 'contain'（仅作用于生效轴）",
    width: '视口宽度',
    height: '视口高度',
    maxWidth: '视口最大宽度',
    minHeight: '视口最小高度',
    stickyContainment: "内容自适应时的 Sticky 归属：'whenScrollable'（默认）| 'always'",
    padding: '每个边缘的内容内缩；默认 0 并发布几何',
    paddingInline: '逻辑 inline 轴内容内缩',
    paddingInlineStart: '逻辑 inline-start 内容内缩',
    paddingInlineEnd: '逻辑 inline-end 内容内缩',
    paddingBlock: '逻辑 block 轴内容内缩',
    paddingBlockStart: '逻辑 block-start 内容内缩',
    paddingBlockEnd: '逻辑 block-end 内容内缩',
    isFullBleed: '可选地让视口脱离继承的容器内边距',
    children: '被观测盒内的内容',
    xstyle: '视口尺寸与原生滚动条呈现覆盖',
  },
};
