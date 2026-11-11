// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Center',
  displayName: 'Center',
  group: 'Layout',
  category: 'Layout',
  isHiddenFromOverview: true,
  keywords: ["center","居中","居中对齐","对齐","对齐方式","justify","flexbox","中间"],
  playground: {
    defaults: {
      width: 240,
      height: 120,
      children: {__element: 'Text', props: {type: 'body'}, children: '居中的内容'},
    },
  },
  props: [
    {
      name: 'axis',
      type: "'both' | 'horizontal' | 'vertical'",
      description:
        '选择 Center 模式。横向书写时，"horizontal" 居中 flex 主轴/行内轴，"vertical" 居中交叉轴/块轴。纵向书写时，当前单轴行为跟随这些逻辑 flex 轴而非物理名称；"both" 仍然居中两个轴。',
      default: "'both'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: '容器宽度（px 或 CSS 值）。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '容器高度（px 或 CSS 值）。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '容器最大宽度（px 或 CSS 值）。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '容器最小高度（px 或 CSS 值）。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '所有方向的内边距，使用间距刻度（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。与 Stack、Card、LayoutContent 和 LayoutPanel 的 padding prop 一致。以 JSX 数字表达式传入，如 padding={3}。',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑行内轴内边距，使用间距刻度。两者同时设置时在行内轴上覆盖 padding。',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑行内起始内边距，使用间距刻度。解析后的物理边取决于书写模式和方向。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑行内结束内边距，使用间距刻度。解析后的物理边取决于书写模式和方向。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑块轴内边距，使用间距刻度。两者同时设置时在块轴上覆盖 padding。',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑块起始内边距，使用间距刻度。解析后的物理边取决于书写模式。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '逻辑块结束内边距，使用间距刻度。解析后的物理边取决于书写模式。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: '使用 inline-flex（适用于文本/图标）。',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '要居中的内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-center', visualProps: ['axis']},
    ],
  },
  usage: {
    description:
      'Center 将内容对齐到容器中间。用于空状态、加载屏、登录表单，或任何应位于可用空间中央的内容。',
    bestPractices: [
      {guidance: true, description: '单轴取值仅在横向书写时使用，或先确认当前书写模式。纵向书写时，当前实现跟随 flex 主轴/交叉轴，而非属性名的物理轴。'},
      {guidance: true, description: '横向书写时使用 axis="vertical" 需给 Center 高度；居中需要所选 flex 轴上有可用空间。'},
      {guidance: true, description: '用 isInline 在一行文本内居中小元素（图标、徽章），不打断文本流。'},
      {guidance: true, description: '语义结构与无障碍名称放在内容上。Center 是纯布局容器，不添加 role 或标签。'},
      {guidance: false, description: '不要用 Center 包裹大块页面区块。页面级结构用 Layout 或 AppShell。'},
      {guidance: false, description: '不要用 Center 做条目的水平列表。改用 hAlign="center" 的 Stack。'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: '沿所选轴将子元素居中对齐的 flexbox 包裹层。'},
      {name: 'Content', required: true, description: '传给 Center 的任意 children，通常为卡片、表单、加载指示器或空状态消息。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Center',
  displayName: 'Center',
  usage: {
    description:
      'Center 将内容对齐到容器中间。用于空状态、加载屏、登录表单，或任何应位于可用空间中央的内容。',
    bestPractices: [
      {guidance: true, description: '单轴取值仅在横向书写时使用，或先确认当前书写模式。纵向书写时，当前实现跟随 flex 主轴/交叉轴，而非属性名的物理轴。'},
      {guidance: true, description: '横向书写时使用 axis="vertical" 需给 Center 高度；居中需要所选 flex 轴上有可用空间。'},
      {guidance: true, description: '用 isInline 在一行文本内居中小元素（图标、徽章），不打断文本流。'},
      {guidance: true, description: '语义结构与无障碍名称放在内容上。Center 是纯布局容器，不添加 role 或标签。'},
      {guidance: false, description: '不要用 Center 包裹大块页面区块。页面级结构用 Layout 或 AppShell。'},
      {guidance: false, description: '不要用 Center 做条目的水平列表。改用 hAlign="center" 的 Stack。'},
    ],
  },
  props: [
    {name: 'axis', type: "'both' | 'horizontal' | 'vertical'", description: '选择 Center 模式。横向书写时，horizontal 对应 flex 主轴/行内轴，vertical 对应交叉轴/块轴；纵向书写时，当前单轴行为仍跟随这些逻辑 flex 轴，而不是属性名暗示的物理轴。', default: "'both'"},
    {name: 'width', type: 'number | string', description: '容器宽度（px 或 CSS 值）。'},
    {name: 'height', type: 'number | string', description: '容器高度（px 或 CSS 值）。'},
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '所有方向的内边距，使用间距刻度（0、0.5、1、1.5、2、3、4、5、6、8、10）。与 Stack、Card、LayoutContent 和 LayoutPanel 的 padding 属性一致。在 JSX 中使用数字表达式 e.g. padding={3}。',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑行内轴内边距，使用间距刻度。两者同时设置时在行内轴上覆盖 padding。',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑行内起始内边距，使用间距刻度。解析后的物理边取决于书写模式和方向。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑行内结束内边距，使用间距刻度。解析后的物理边取决于书写模式和方向。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑块轴内边距，使用间距刻度。两者同时设置时在块轴上覆盖 padding。',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑块起始内边距，使用间距刻度。解析后的物理边取决于书写模式。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '逻辑块结束内边距，使用间距刻度。解析后的物理边取决于书写模式。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {name: 'isInline', type: 'boolean', description: '使用 inline-flex（适用于文本/图标）。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '要居中的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-center',
        visualProps: [
          'axis',
        ],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '在单个或两个 flex 轴上居中内容；单轴名称仅在横向书写时对应物理轴',
  usage: {
    description:
      'Center 将内容对齐到容器中间。用于空状态、加载屏、登录表单。',
    bestPractices: [
      {guidance: true, description: '单轴取值仅在横向书写时使用，或先确认当前书写模式。纵向书写时，当前实现跟随 flex 主轴/交叉轴，而非属性名的物理轴。'},
      {guidance: true, description: '横向书写时使用 axis="vertical" 需给 Center 高度；居中需要所选 flex 轴上有可用空间。'},
      {guidance: true, description: '用 isInline 在一行文本内居中小元素（图标、徽章），不打断文本流。'},
      {guidance: true, description: '语义结构与无障碍名称放在内容上；Center 不添加 role 或标签。'},
      {guidance: false, description: '不要用 Center 包裹大块页面区块。页面级结构用 Layout 或 AppShell。'},
      {guidance: false, description: '不要用 Center 做条目的水平列表。改用 hAlign="center" 的 Stack。'},
    ],
  },
  propDescriptions: {
    axis: '居中模式；横向书写之外，单轴取值跟随 flex 主轴/交叉轴',
    width: '容器宽度（px 或 CSS）',
    height: '容器高度（px 或 CSS）',
    padding:
      '所有方向的内边距（间距步进：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）',
    paddingInline: '逻辑行内轴内边距；在该轴上覆盖 padding',
    paddingInlineStart: '逻辑行内起始内边距；物理边取决于书写模式和方向',
    paddingInlineEnd: '逻辑行内结束内边距；物理边取决于书写模式和方向',
    paddingBlock: '逻辑块轴内边距；在该轴上覆盖 padding',
    paddingBlockStart: '逻辑块起始内边距；物理边取决于书写模式',
    paddingBlockEnd: '逻辑块结束内边距；物理边取决于书写模式',
    isInline: '文本/图标使用 inline-flex',
    children: '要居中的内容',
    xstyle: '布局用 StyleX 样式（外边距、定位、尺寸）；必须是 stylex.create() 的值',
  },
};
