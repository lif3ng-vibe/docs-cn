// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'List',
  displayName: 'List',
  group: 'List',
  category: 'Table & List',
  keywords: [
    'list',
    'listitem',
    'listbox',
    'menu',
    '列表',
    '列表项',
    '集合',
    'ul',
    'navlist',
    '导航列表',
  ],
  theming: {
    targets: [
      {className: 'astryx-list', visualProps: ['density', 'listStyle']},
      {className: 'astryx-list-item'},
    ],
    vars: [
      {
        name: '--_hit-border-bottom',
        description:
          '带分隔线的行下方分隔线的宽度，最后一行为 0。行的触摸命中层会把它加进自身偏移，使其命中带从分隔线之后开始。在 hasDividers 下，ListItem 通过 --border-width 把它设在行自身的 ::after 上，因此行内内容永远不会继承它，主题则通过该令牌改变分隔线。',
        default: '0px',
        private: true,
      },
    ],
  },
  description: '支持密度、分隔线与页眉的列表容器。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '列表项（ListItem 组件）。',
      slotElements: [
        {
          __element: 'ListItem',
          props: {
            label: 'List item',
          },
        },
      ],
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description:
        '项的间距密度。在触屏上，相邻行留出空间时，交互行的命中目标可达 44px，行的外观与布局不变。',
      default: "'balanced'",
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: '在项之间显示分隔线。',
      default: 'false',
    },
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        '来自 useAnimatedLayout({containerRef}) 的句柄。有了它，当行被插入、删除或重排时：插入的行进入，被删的行原地收起，向反方向跨行的行从其他行上方掠过并带表面色背景，变动之后的所有行以及列表之后直到该容器的内容都滑向新位置——这一切在同一次共享动效中完成，且适用于所有指针类型。在减弱动效（Reduce Motion）下没有任何位移。行由其 itemKey 标识：没有 itemKey 的行立即变化。没有句柄时列表立即变化。',
    },
    {
      name: 'reorderable',
      type: 'Reorderable',
      description:
        "使行可重排，传入由 createReorderable({onReorder, isReorderable}) 创建的对象：每个带 itemKey 的 ListItem 末尾获得一个重排手柄，每次确认移动都会以该行的 key 与移动后的索引调用一次 onReorder（{key, to}）；按新顺序渲染行即可生效。被对象的 isReorderable 拒绝的行没有手柄并保持原位；位于列表两端的行也为其他行设定边界。该对象可以在每次渲染时创建。在触摸屏上，手指在手柄上静止片刻即可拾起该行（在手柄上快速滑动仍会滚动）：该行保持原位并变暗，同时它的副本跟随手指，一条强调色线条标记落点；其他行保持不动，页面在靠近边缘时滚动，松手后各行重新排列并滑向新位置。鼠标则立即拖动手柄，使用同样的副本与线条，行直接就位、无动效；拖拽在放下时上报一次，取消的拖拽立即复原一切。在重排模式下，线条在每次移动后标记该行的新位置。没有拖拽时，手柄是开关：点击、Space 或 Enter 为其行开启重排模式（aria-pressed），此时每个上/下方向键立即把行移动一位并上报，Escape 或再次激活结束该模式并保留已做的移动。每次移动渲染后都会被播报，包含该行的位置与相邻行（'Milk, position 3 of 5, after Eggs, before Bread'），移动到一个保持原位的行会被拒绝并播报。模式开启时，手柄旁固定显示一个提示，其中的移动与 Done 是按钮、功能与按键相同，因此仅靠点按也能重排行。对象的 start(key) 可从你自己的 UI（例如行的上下文菜单）进入同一模式。禁用行的手柄仍可聚焦但移动不了任何东西。",
    },
    {
      name: 'edge',
      type: "'padded' | 'flush' | 'outset' | 'bleed'",
      description:
        "每行的文本、分隔线以及悬停与选中背景相对于列表边缘与外围容器的位置。'padded' 把文本保持在每行的内边距内，因此比列表上方的标题略有缩进，背景四周也有余量。'flush' 去掉行的侧边内边距：文本与标题对齐，分隔线与背景止于行的内容，两侧没有余量。它适用于任何位置，适合静态行。'outset' 让文本与标题对齐，并让分隔线与背景略越过它延伸进容器的内边距；适合容器中的交互行。'bleed' 让文本与标题对齐，并让分隔线与背景延伸到容器边缘，就像 Card 中的 Table 行。行都是方角，除非列表是圆角 Card 或 Dialog 的第一个或最后一个子元素，且其中没有更深处的其他 Table 或通栏 List——此时其首行（无页眉时）或末行会贴合容器圆角，扣除其上/下的容器内边距。行的首个内容是与标题对齐的元素：有 marker、icon 或 avatar 时是它们，否则是 label。'outset' 与 'bleed' 伸入最近一个共享其内边距的容器的内边距：Card、Section、Dialog 或 BottomSheet，或显式带内边距的 Layout 区域、带内边距的 ScrollableArea 等透明容器。请把 List 直接放进该容器的内边距中：Stack、Center 或你自己的样式在中间添加的内边距不被计入。抽屉以及 LayoutContent 与 LayoutPanel 的自动内边距暂不支持。没有这样的容器时（包括在 Popover 中），它们呈现为 'padded'。在容器内边距小于行自身内边距的容器中，文本会比标题对齐线略有偏移。主题在 `item` 上的行内内边距会替换所有取值的行内边距，包括 flush 的零内边距。",
      default: "'padded'",
    },
    {
      name: 'edgeCompensation',
      type: "'inline'",
      description:
        '已弃用：改用 edge="outset"（本 prop 即设置它）。仍然可用；两者同时设置时 edge 优先。`astryx upgrade` 会改写现有用法。',
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        '页眉内容，通过 aria-labelledby 与列表关联。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Header',
        },
      ],
    },
    {
      name: 'listStyle',
      type: "'none' | 'disc' | 'decimal' | 'circle'",
      description:
        "列表标记样式。'decimal' 会渲染 <ol> 元素而非 <ul>。",
      default: "'none'",
    },
    {
      name: 'start',
      type: 'number',
      description:
        "有序列表（listStyle='decimal'）的起始编号。把 CSS 计数器设为从该值开始。",
      default: '1',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  components: [{name: 'ListItem'}],
  usage: {
    description:
      '具有一致间距、分隔线与可选标记的垂直项集合。支持页眉、图标、头像、徽章，以及带点击或链接行为的交互项。用于展示有序或无序的相关内容分组。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供页眉为列表添加标签，并给屏幕阅读器提供上下文。',
      },
      {
        guidance: true,
        description:
          '使用 start 与 end 内容插槽为每项添加图标、头像或徽章。',
      },
      {
        guidance: true,
        description:
          '设置 edge 让行文本与列表上方的标题对齐：静态行用 flush，Card、Section 或 Dialog 中的行用 outset 或 bleed。',
      },
      {
        guidance: true,
        description:
          '在无 Card 的场景（例如侧边栏）要让文本与标题对齐并给高亮留出四周余量：把标题与列表放进 variant="transparent" 的 Section，并设 edge="outset"。',
      },
      {
        guidance: false,
        description:
          '不要在交互列表项内放置交互元素；会产生嵌套点击目标与混乱的焦点行为。',
      },
      {
        guidance: false,
        description:
          '不要用列表展示单个项或排布无关内容；列表意味着有意义的集合。',
      },
      {
        guidance: false,
        description:
          '不要在同一个列表中混用可点击与不可点击项而没有清晰的视觉区分。',
      },
    ],
    anatomy: [
      {
        name: 'List title',
        required: true,
        description: '为列表添加标签的标题。',
      },
      {
        name: 'Description',
        required: false,
        description: '标题下方的补充文本。',
      },
      {
        name: 'List items',
        required: true,
        description: '各个条目，可包含图标或图片。',
      },
      {
        name: 'Item description',
        required: false,
        description: '单个列表项的补充细节。',
      },
      {
        name: 'Reorder handle',
        required: false,
        description:
          '配合 reorderable：每行末尾可移动的按钮。它可拖动该行，并切换该行的重排模式。',
      },
      {
        name: 'Reorder hint',
        required: false,
        description:
          '行处于重排模式时：其手柄下方的提示，类似 Core 的键盘提示，其中的移动与 Done 是按钮。',
      },
    ],
  },
};
/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a header to label the list and give context to screen readers.',
      },
      {
        guidance: true,
        description:
          'Use start and end content slots to add icons, avatars, or badges to each item.',
      },
      {
        guidance: true,
        description:
          'Set edge to line row text up with a heading above the list: flush for static rows, outset or bleed for rows in a Card, Section, or Dialog.',
      },
      {
        guidance: true,
        description:
          'To line text up with a heading and keep room around the highlight where there is no Card, such as a sidebar, put the heading and the list in a Section with variant="transparent" and set edge="outset".',
      },
      {
        guidance: false,
        description:
          'Place interactive elements inside an interactive list item; it creates nested click targets and confusing focus behavior.',
      },
      {
        guidance: false,
        description:
          'Use a list for a single item or for laying out unrelated content; lists imply a meaningful collection.',
      },
      {
        guidance: false,
        description:
          'Mix clickable and non-clickable items in the same list without clear visual distinction.',
      },
    ],
    anatomy: [
      {
        name: 'List title',
        required: true,
        description: 'Heading that labels the list.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Supplementary text below the title.',
      },
      {
        name: 'List items',
        required: true,
        description: 'Individual entries, which may include icons or images.',
      },
      {
        name: 'Item description',
        required: false,
        description: 'Additional detail for an individual list item.',
      },
      {
        name: 'Reorder handle',
        required: false,
        description:
          'With reorderable: the button at the end of each row that can move. It drags the row, and toggles its reorder mode.',
      },
      {
        name: 'Reorder hint',
        required: false,
        description:
          "While a row is in reorder mode: the hint below its handle, like Core's keyboard hint, whose moves and Done are buttons.",
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '用于渲染项集合的垂直列表，带一致间距、分隔线与标记样式。组合模型：List 包裹 ListItem 子组件。',
  usage: {
    description:
      '具有一致间距、分隔线与可选标记的垂直项集合。支持页眉、图标、头像、徽章，以及带点击或链接行为的交互项。用于展示有序或无序的相关内容分组。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供页眉为列表添加标签，并给屏幕阅读器提供上下文。',
      },
      {
        guidance: true,
        description:
          '使用 start 与 end 内容插槽为每项添加图标、头像或徽章。',
      },
      {
        guidance: true,
        description:
          '设置 edge 让行文本与列表上方的标题对齐：静态行用 flush，Card、Section 或 Dialog 中的行用 outset 或 bleed。',
      },
      {
        guidance: true,
        description:
          '在无 Card 的场景（例如侧边栏）要让文本与标题对齐并给高亮留出四周余量：把标题与列表放进 variant="transparent" 的 Section，并设 edge="outset"。',
      },
      {
        guidance: false,
        description:
          '不要在交互列表项内放置交互元素；会产生嵌套点击目标与混乱的焦点行为。',
      },
      {
        guidance: false,
        description:
          '不要用列表展示单个项或排布无关内容；列表意味着有意义的集合。',
      },
      {
        guidance: false,
        description:
          '不要在同一个列表中混用可点击与不可点击项而没有清晰的视觉区分。',
      },
    ],
    anatomy: [
      {
        name: 'List title',
        required: true,
        description: '为列表添加标签的标题。',
      },
      {
        name: 'Description',
        required: false,
        description: '标题下方的补充文本。',
      },
      {
        name: 'List items',
        required: true,
        description: '各个条目，可包含图标或图片。',
      },
      {
        name: 'Item description',
        required: false,
        description: '单个列表项的补充细节。',
      },
      {
        name: 'Reorder handle',
        required: false,
        description:
          '配合 reorderable：每行末尾可移动的按钮。它可拖动该行，并切换该行的重排模式。',
      },
      {
        name: 'Reorder hint',
        required: false,
        description:
          '行处于重排模式时：其手柄下方的提示，类似 Core 的键盘提示，其中的移动与 Done 是按钮。',
      },
    ],
  },
};
