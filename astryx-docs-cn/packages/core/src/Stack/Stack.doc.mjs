// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Stack container',
    required: true,
    description: '沿单一 flex 轴排布内容的布局容器。',
  },
  {
    name: 'Item',
    required: false,
    description: '控制堆叠中单个元素的可选 StackItem 包装器。',
  },
  {
    name: 'Content',
    required: false,
    description: '由 Stack 或 StackItem 渲染的调用方内容。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Stack',
  displayName: 'Stack',
  group: 'Layout',
  category: 'Layout',
  keywords: ['stack', 'hstack', 'vstack', 'flexbox', 'flex', '堆叠', '间距', 'gap', '水平', '垂直', 'row', 'column'],
  theming: {
    targets: [
      {className: 'astryx-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'astryx-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'Stack',
      displayName: 'Stack',
      description:
        '带 direction prop 的统一堆叠布局组件。direction="horizontal" 沿行内轴排布（LTR 从左到右、RTL 从右到左），direction="vertical"（默认）从上到下。为方便起见，HStack 与 VStack 是预配置的包装组件。',
      playground: {
        defaults: {
          direction: 'horizontal',
          gap: 2,
          children: [
            {__element: 'Card', props: {padding: 3}, children: '元素 1'},
            {__element: 'Card', props: {padding: 3}, children: '元素 2'},
            {__element: 'Card', props: {padding: 3}, children: '元素 3'},
          ],
        },
      },
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description:
            "堆叠布局的方向。'horizontal' 沿行内轴排布元素（LTR 从左到右、RTL 从右到左，同 HStack），'vertical' 从上到下（同 VStack）。注意：取值是 'horizontal'，不是 'row'。",
          default: "'vertical'",
        },
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10。在 JSX 中以数字表达式传入，如 gap={4}，不要用 gap="4" 这样的字符串。',
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '四边内边距，使用间距刻度。以 JSX 数字表达式传入，如 padding={3}。',
        },
        {
          name: 'paddingInline',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内（水平）内边距。两者同时设置时在行内轴上覆盖 padding。',
        },
        {
          name: 'paddingInlineStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内起始内边距，使用间距刻度（LTR 为左，RTL 为右）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingInlineEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内结束内边距，使用间距刻度（LTR 为右，RTL 为左）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingBlock',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块（垂直）内边距。两者同时设置时在块轴上覆盖 padding。',
        },
        {
          name: 'paddingBlockStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块起始（顶部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'paddingBlockEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块结束（底部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            '启用可滚动溢出（overflow: auto）。',
          default: 'false',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: "堆叠容器的宽度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: "堆叠容器的高度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'maxWidth',
          type: 'SizeValue',
          description: '堆叠容器的最大宽度。',
        },
        {
          name: 'minHeight',
          type: 'SizeValue',
          description: '堆叠容器的最小高度。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch'",
          description: "水平对齐。direction='horizontal' 时为主轴（justify-content）；direction='vertical' 时为交叉轴（align-items）。",
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch'",
          description: "垂直对齐。direction='horizontal' 时为交叉轴（align-items）；direction='vertical' 时为主轴（justify-content）。",
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: "主轴对齐别名。解析为 hAlign（水平）或 vAlign（垂直）。注意：用 'between'，不是 'space-between'。",
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '交叉轴对齐别名。对应 CSS align-items。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
        },
        {
          name: 'className',
          type: 'string',
          description: '添加到堆叠元素上的类名，位于组件样式之后。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '堆叠元素的内联样式。width、height、maxWidth 与 minHeight 优先于此处的同名属性。',
        },
        {
          name: 'ref',
          type: 'Ref<HTMLElement>',
          description: '指向渲染的堆叠元素的 ref。',
        },
      ],
    },

    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description:
        '沿行内轴排列元素的水平堆叠组件：LTR 从左到右，RTL 从右到左。支持多态渲染。',
      playground: {
        defaults: {
          gap: 2,
          children: [
            {__element: 'Card', props: {padding: 3}, children: '元素 1'},
            {__element: 'Card', props: {padding: 3}, children: '元素 2'},
            {__element: 'Card', props: {padding: 3}, children: '元素 3'},
          ],
        },
      },
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10。在 JSX 中以数字表达式传入，如 gap={4}，不要用 gap="4" 这样的字符串。',
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '四边内边距，使用间距刻度（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。与 Card、LayoutContent、LayoutPanel 的 padding prop 一致。以 JSX 数字表达式传入，如 padding={3}。',
        },
        {
          name: 'paddingInline',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内（水平）内边距，使用间距刻度。两者同时设置时在行内轴上覆盖 padding。',
        },
        {
          name: 'paddingInlineStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内起始内边距，使用间距刻度（LTR 为左，RTL 为右）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingInlineEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内结束内边距，使用间距刻度（LTR 为右，RTL 为左）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingBlock',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块（垂直）内边距，使用间距刻度。两者同时设置时在块轴上覆盖 padding。',
        },
        {
          name: 'paddingBlockStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块起始（顶部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'paddingBlockEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块结束（底部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            '启用可滚动溢出（overflow: auto）。与 LayoutContent、LayoutPanel 的 isScrollable 一致。',
          default: 'false',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: "堆叠容器的宽度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: "堆叠容器的高度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'maxWidth',
          type: 'SizeValue',
          description: "堆叠容器的最大宽度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'minHeight',
          type: 'SizeValue',
          description: "堆叠容器的最小高度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '水平（主轴）对齐。',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '垂直（交叉轴）对齐。',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'hAlign 的主轴对齐别名。对应 CSS justify-content。同时设置 hAlign 时以其为准。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'vAlign 的交叉轴对齐别名。对应 CSS align-items。同时设置 vAlign 时以其为准。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
        },
        {
          name: 'className',
          type: 'string',
          description: '添加到堆叠元素上的类名，位于组件样式之后。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '堆叠元素的内联样式。width、height、maxWidth 与 minHeight 优先于此处的同名属性。',
        },
        {
          name: 'ref',
          type: 'Ref<HTMLElement>',
          description: '指向渲染的堆叠元素的 ref。',
        },
      ],    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description:
        '自上而下排列元素的垂直堆叠组件。支持多态渲染。',
      playground: {
        defaults: {
          gap: 2,
          children: [
            {__element: 'Card', props: {padding: 3}, children: '元素 1'},
            {__element: 'Card', props: {padding: 3}, children: '元素 2'},
            {__element: 'Card', props: {padding: 3}, children: '元素 3'},
          ],
        },
      },
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10。在 JSX 中以数字表达式传入，如 gap={4}，不要用 gap="4" 这样的字符串。',
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '四边内边距，使用间距刻度（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。与 Card、LayoutContent、LayoutPanel 的 padding prop 一致。以 JSX 数字表达式传入，如 padding={3}。',
        },
        {
          name: 'paddingInline',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内（水平）内边距，使用间距刻度。两者同时设置时在行内轴上覆盖 padding。',
        },
        {
          name: 'paddingInlineStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内起始内边距，使用间距刻度（LTR 为左，RTL 为右）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingInlineEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '行内结束内边距，使用间距刻度（LTR 为右，RTL 为左）。仅在该边覆盖 paddingInline 和 padding。',
        },
        {
          name: 'paddingBlock',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块（垂直）内边距，使用间距刻度。两者同时设置时在块轴上覆盖 padding。',
        },
        {
          name: 'paddingBlockStart',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块起始（顶部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'paddingBlockEnd',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '块结束（底部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            '启用可滚动溢出（overflow: auto）。与 LayoutContent、LayoutPanel 的 isScrollable 一致。',
          default: 'false',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: "堆叠容器的宽度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: "堆叠容器的高度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'maxWidth',
          type: 'SizeValue',
          description: "堆叠容器的最大宽度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'minHeight',
          type: 'SizeValue',
          description: "堆叠容器的最小高度。数字按像素处理，字符串原样使用（如 '100%'）。",
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '水平（交叉轴）对齐。',
          default: "'stretch'",
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '垂直（主轴）对齐。',
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'vAlign 的主轴对齐别名。对应 CSS justify-content。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'hAlign 的交叉轴对齐别名。对应 CSS align-items。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
        },
        {
          name: 'className',
          type: 'string',
          description: '添加到堆叠元素上的类名，位于组件样式之后。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '堆叠元素的内联样式。width、height、maxWidth 与 minHeight 优先于此处的同名属性。',
        },
        {
          name: 'ref',
          type: 'Ref<HTMLElement>',
          description: '指向渲染的堆叠元素的 ref。',
        },
      ],
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description:
        '控制堆叠内单个元素行为的堆叠子项。支持多态渲染。',
      playground: {
        wrapper: {component: 'HStack', props: {gap: 2, width: 300}},
        defaults: {
          size: 'fill',
          children: {__element: 'Card', props: {padding: 3}, children: '撑满整行'},
        },
      },
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex 增长行为：static 保持自然尺寸，fill 扩展以占据剩余空间。',
          default: "'static'",
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            '启用可滚动溢出（overflow: auto）。StackItem 已应用 flex 的 min-height/min-width 重置，因此 <StackItem size="fill" isScrollable> 就是完整的滚动区域。与 LayoutContent、LayoutPanel 的 isScrollable 一致。内容溢出时，div 或 span 项会成为一个 group，由 aria-label 或已翻译的 "Content" 命名；其他元素保留自身角色。',
          default: 'false',
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            '覆盖此单个项的交叉轴对齐，忽略父堆叠的对齐。',
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为子项包装器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子项内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
        },
        {
          name: 'className',
          type: 'string',
          description: '添加到子项元素上的类名，位于组件样式之后。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '子项元素的内联样式。',
        },
        {
          name: 'ref',
          type: 'Ref<HTMLElement>',
          description: '指向渲染的子项元素的 ref。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'Stack 以一致的间距把元素排成行或列。用 gap prop 控制元素间距。',
    bestPractices: [
      { guidance: true, description: '元素间距用 gap prop；不要手动加外边距。' },
      { guidance: true, description: '用 size="fill" 的 StackItem 让某个元素拉伸并填满剩余空间。' },
      { guidance: false, description: '不要在堆叠里再嵌堆叠；先试试 wrap="wrap" 让元素换行。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Stack',
  displayName: 'Stack',
  group: 'Layout',
  theming: {
    targets: [
      {className: 'astryx-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'astryx-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description:
        '水平堆叠组件，沿行内方向排列元素：LTR 中从左到右，RTL 中从右到左。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0、0.5、1、1.5、2、3、4、5、6、8、10。在 JSX 中使用数字表达式 e.g. gap={4}，不要使用字符串 gap="4"。',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: '堆叠容器的宽度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: '堆叠容器的高度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '水平（主轴）对齐方式。',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的垂直（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'hAlign 的别名。对应 CSS justify-content。同时设置 hAlign 时，以 hAlign 为准。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'vAlign 的别名。对应 CSS align-items。同时设置 vAlign 时，以 vAlign 为准。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description:
        '垂直堆叠组件，将元素从上到下排列。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0、0.5、1、1.5、2、3、4、5、6、8、10。在 JSX 中使用数字表达式 e.g. gap={4}，不要使用字符串 gap="4"。',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: '堆叠容器的宽度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: '堆叠容器的高度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的水平（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '垂直（主轴）对齐方式。',
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'vAlign 的别名。对应 CSS justify-content。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'hAlign 的别名。对应 CSS align-items。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
      ],
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description:
        '堆叠子元素，用于控制堆叠中单个元素的行为。支持多态渲染。',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex 增长行为：static 保持自然尺寸，fill 扩展以占据剩余空间。',
          default: "'static'",
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            '覆盖此元素的交叉轴对齐方式，忽略父堆叠的对齐设置。',
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为子元素包装器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子元素内容。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'Stack 以一致的间距把元素排成行或列。用 gap prop 控制元素间距。',
    bestPractices: [
      { guidance: true, description: '元素间距用 gap prop；不要手动加外边距。' },
      { guidance: true, description: '用 size="fill" 的 StackItem 让某个元素拉伸并填满剩余空间。' },
      { guidance: false, description: '不要在堆叠里再嵌堆叠；先试试 wrap="wrap" 让元素换行。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '基于 flexbox 的水平/垂直序列堆叠布局原语，使用主题化间距令牌。',
  usage: {
    anatomy,
    description:
      'Stack 以一致的间距把元素排成行或列。用 gap prop 控制元素间距。',
    bestPractices: [
      { guidance: true, description: '元素间距用 gap prop；不要手动加外边距。' },
      { guidance: true, description: '用 size="fill" 的 StackItem 让某个元素拉伸并填满剩余空间。' },
      { guidance: false, description: '不要在堆叠里再嵌堆叠；先试试 wrap="wrap" 让元素换行。' },
    ],
  },
  components: [
    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description: '水平堆叠；行内方向（LTR 从左到右，RTL 从右到左），支持多态渲染。',
      propDescriptions: {
        gap: '数字字面量间距步进：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10。用 gap={4} 而非 gap="4"。',
        width: "容器宽度。数字=像素，字符串=原样（如 '100%'）。",
        height: "容器高度。数字=像素，字符串=原样（如 '100%'）。",
        hAlign: '水平（主轴）对齐。',
        vAlign: '垂直（交叉轴）对齐。',
        justify: 'hAlign 的主轴对齐别名。对应 CSS justify-content。显式 hAlign 优先。',
        align: 'vAlign 的交叉轴对齐别名。对应 CSS align-items。显式 vAlign 优先。',
        wrap: 'Flex 换行行为。',
        as: '作为容器渲染的 HTML 元素。',
        children: '堆叠内容。',
        xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description: '垂直堆叠；从上到下，支持多态渲染。',
      propDescriptions: {
        gap: '数字字面量间距步进：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10。用 gap={4} 而非 gap="4"。',
        width: "容器宽度。数字=像素，字符串=原样（如 '100%'）。",
        height: "容器高度。数字=像素，字符串=原样（如 '100%'）。",
        hAlign: '水平（交叉轴）对齐。',
        vAlign: '垂直（主轴）对齐。',
        justify: 'vAlign 的主轴对齐别名。对应 CSS justify-content。',
        align: 'hAlign 的交叉轴对齐别名。对应 CSS align-items。',
        wrap: 'Flex 换行行为。',
        as: '作为容器渲染的 HTML 元素。',
        children: '堆叠内容。',
      },
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description: '控制堆叠内单个元素行为；支持多态渲染。',
      propDescriptions: {
        size: 'Flex 增长：static=自然尺寸，fill=扩展占据剩余空间。',
        crossAlignSelf: '覆盖此项的交叉轴对齐，忽略父级。',
        as: '作为包装器渲染的 HTML 元素。',
        children: '子项内容。',
      },
    },
  ],
};