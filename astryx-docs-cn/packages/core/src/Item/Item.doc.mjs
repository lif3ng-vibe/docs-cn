// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Item',
  displayName: 'Item',
  group: 'Item',
  category: 'Table & List',
  isHiddenFromOverview: true,
  keywords: [
    'item',
    'list-item',
    'media-object',
    'row',
    'cell',
    'entity',
    'contact',
    'notification',
    'preview',
    '列表项',
    '行',
    '单元格',
  ],
  playground: {
    defaults: {
      label: 'Item label',
      description: 'Supporting text',
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-item',
        visualProps: ['density', 'align'],
        states: ['highlighted', 'selected', 'disabled'],
      },
      {className: 'astryx-item-swipe-panel', visualProps: ['side']},
      {className: 'astryx-item-swipe-action', visualProps: ['variant']},
    ],
    vars: [
      {
        name: '--_item-label-color',
        description:
          '标签行的颜色。默认未设置（标签使用主文本令牌）；父级设置它可为其渲染的标签重新着色，destructive 的下拉/上下文菜单项就是这样做。',
        default: 'var(--color-text-primary)',
        private: true,
      },
      {
        name: '--_item-description-color',
        description:
          '--_item-label-color 的配套变量，作用于次要描述行。',
        default: 'var(--color-text-secondary)',
        private: true,
      },
      {
        name: '--_item-inset-inline',
        description:
          '行的行内缩进。Item 从该变量派生 paddingInline，List 读取它为其边缘处理（edge="flush"、"outset"、"bleed"）摆放行。在主题的 `item` 上设置 paddingInline，二者保持同步。',
        default: 'var(--spacing-2) (var(--spacing-3) for density="spacious")',
        private: true,
      },
    ],
    derived: [{property: 'paddingInline', vars: ['--_item-inset-inline']}],
  },
  components: [
    {
      name: 'Item',
      displayName: 'Item',
      description:
        '通用项目原语，统一 "起始内容 + 标签 + 描述 + 结束内容" 布局模式。用作列表项、菜单项、联系人行、通知等的构建块。',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description:
            '标识此项目的主要文本。接受字符串（自动截断）或 ReactNode（用于富内容）。',
          required: true,
        },
        {
          name: 'marker',
          type: 'ReactNode',
          description:
            '在 startContent 之前渲染的标记，作为直接 flex 子元素。用于需要自定义基线对齐的列表项目符号/计数器。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '在标签/描述区域之前渲染的内容，例如图标、头像或复选框。',
          slotElements: [
            {__element: 'Avatar', props: {name: 'Ada Lovelace', size: 'sm'}},
            {
              __element: 'Icon',
              props: {icon: 'info', size: 'sm', color: 'secondary'},
            },
          ],
        },
        {
          name: 'description',
          type: 'ReactNode',
          description:
            '次要文本：副标题、描述或辅助信息。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '在标签/描述区域之后渲染的内容，例如徽章、元数据、时间戳或操作按钮。',
          slotElements: [
            {__element: 'Badge', props: {label: 3}},
            {
              __element: 'Text',
              props: {color: 'secondary'},
              children: '2h ago',
            },
          ],
        },
        {
          name: 'as',
          type: "'div' | 'li' | 'span' | ElementType",
          description:
            '根元素渲染成什么：HTML 元素，或调用方需要的其他组件。导航型菜单行在这里传入应用的链接组件，使行的根元素就是锚点。仅当行带有 role 且 startContent/endContent 中没有交互节点时才传组件。',
          default: "'div'",
        },
        {
          name: 'align',
          type: "'center' | 'start' | 'first-line'",
          description:
            "起始/结束内容插槽的垂直对齐方式。'center' 让每个插槽以整个文本块居中；'start' 让插槽顶部与文本顶部对齐；'first-line' 让每个插槽以标签第一行居中，小标记与换行标签的第一行保持水平。插槽高于该行时会把文本下移。`item` 主题目标以 `align` 反映该值。",
          default: "'center'",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description:
            '间距密度。"compact" 使用 4px 块向内边距，"balanced" 使用 8px，"spacious" 使用 12px 块向和行向内边距。',
          default: "'balanced'",
        },
        {
          name: 'labelLines',
          type: 'number',
          description: '标签以省略号截断前的最大行数。',
        },
        {
          name: 'descriptionLines',
          type: 'number',
          description: '描述以省略号截断前的最大行数。',
        },
        {
          name: 'layout',
          type: "'stacked' | 'inline'",
          description:
            '标签和描述如何排布。stacked 把描述放在标签下方独立一行；inline 让二者同行、描述先截断，使行适配固定高度的宿主。',
          default: "'stacked'",
        },
        {
          name: 'onClick',
          type: '(event: MouseEvent) => void',
          description:
            '点击处理器。使项目可点击，具有按钮语义。',
        },
        {
          name: 'interactiveRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            '指向嵌套控件（如 startContent 中的复选框）的 ref，该控件承载项目的键盘访问和操作。行成为更大的点击/触摸目标，将表面点击委托给该控件（useClickableContainer），且不渲染不可见按钮/锚点，因此行不会增加第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥；设置后二者被忽略。',
        },
        {
          name: 'href',
          type: 'string',
          description:
            '链接 URL。通过不可见锚点元素使项目成为链接。根元素已是链接组件的行（见 `as`）会把地址放在根元素上，不渲染不可见锚点。',
        },
        {
          name: 'target',
          type: "'_blank' | '_self'",
          description:
            '链接目标。仅与 href 一起使用。target="_blank" 自动添加 noopener noreferrer。',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            '链接关系标记。target="_blank" 自动合并 noopener noreferrer。',
        },
        {
          name: 'isHighlighted',
          type: 'boolean',
          description: '高亮状态（悬停/键盘焦点外观）。',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: '选中状态。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用状态。',
          default: 'false',
        },
        {
          name: 'swipeActions',
          type: '{leading?: ItemSwipeAction[]; trailing?: ItemSwipeAction[]}',
          description:
            "触屏滑动操作：侧向拖动在每个侧面揭示的动词，最外层最后，每项为 `{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`。`leading` 由朝行内结束方向的拖动揭示，`trailing` 由朝行内起始方向的拖动揭示。鼠标永不触发拖动，接近垂直的拖动仍归滚动器。该手势是触屏加速器，绝不能是某个动词的唯一路径：只能靠滑动触达的动词对键盘和鼠标不可达，因此每个条目还必须能通过行自身内容触达。仅用于 role 允许交互后代的行（listitem 或无 role 的 row），不用于 option、菜单项或作为原生 radio 放大目标的行。包含这些行的元素在行内轴上用 overflow-inline: clip 裁剪——List 会做；其他宿主做一次即可。`hasRemoval` 只表示动作触发后该行保持在外而不是弹回。手势及其面板在首次出现带滑动操作的行时按需加载，没有滑动操作的行不会引入这些代码。",
        },
        {
          name: 'swipeBehavior',
          type: "'reveal' | 'commit'",
          description:
            '滑动的行为。`reveal` 让行停在打开状态，每个条目都是真实按钮，长拖或快速滑动触发最外层；`commit` 把行滑出并在松手时触发最外层，无停留、面板仅作展示。`commit` 适合每侧一个条目。',
          default: "'reveal'",
        },
        {
          name: 'ref',
          type: 'React.Ref<HTMLElement>',
          description:
            '转发到根元素的 ref，其类型跟随 `as`。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
        },
        {
          name: 'className',
          type: 'string',
          description: '根元素的 CSS 类名（一个或多个）。',
        },
        {
          name: 'style',
          type: 'React.CSSProperties',
          description: '根元素的内联样式。',
        },
        {
          name: 'data-testid',
          type: 'string',
          description: '自动化测试框架用的测试选择器。',
        },
      ],
    },
  ],
  usage: {
    description:
      '统一 Astryx 中 "起始内容 + 标签 + 描述 + 结束内容" 模式的单一灵活项目原语。凡是需要结构化行的地方都用它：下拉菜单、选择器、联系人列表、通知、文件浏览器和活动流。',
    bestPractices: [
      {
        guidance: true,
        description:
          '常见布局使用命名插槽（startContent、label、description、endContent），覆盖 80% 的场景。',
      },
      {
        guidance: true,
        description:
          '菜单和密集列表用 density="compact"，标准行用 "balanced"，宽松布局用 "spacious"。',
      },
      {
        guidance: true,
        description:
          '内容长度不定时，设置 labelLines 和 descriptionLines 控制截断。',
      },
      {
        guidance: true,
        description:
          '当换行标签旁边是属于其第一行的小标记（状态点、单选按钮、时间戳）时，用 align="first-line"；要让较高的插槽与文本顶部对齐，用 align="start"。',
      },
      {
        guidance: true,
        description:
          '为滑动操作在行内提供第二入口（菜单或 endContent 中的按钮）：滑动手势是触屏加速器，只能靠滑动触达的动词对键盘和鼠标不可达。',
      },
      {
        guidance: false,
        description:
          '不要在交互式 Item 内嵌套交互元素（按钮、链接）；会造成混乱的焦点和点击目标。',
      },
      {
        guidance: false,
        description:
          '不要用 Item 做视图间导航；请用合适的导航组件。',
      },
      {
        guidance: false,
        description:
          '不要直接添加已读/未读或收件箱特有行为；组合一个薄包装器（如 PreviewItem）。',
      },
    ],
    anatomy: [
      {
        name: 'Marker',
        required: false,
        description:
          '在起始内容之前渲染的可选列表项目符号/计数器。',
      },
      {
        name: 'Start content',
        required: false,
        description: '前导视觉：头像、图标、图片或复选框。',
      },
      {
        name: 'Label',
        required: true,
        description: '标识项目的主要文本。',
      },
      {
        name: 'Description',
        required: false,
        description: '标签下方的次要辅助文本。',
      },
      {
        name: 'End content',
        required: false,
        description:
          '末端对齐内容：徽章、时间戳或操作按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'Item',
      displayName: 'Item',
      description:
        '通用项目原语，统一 "起始内容 + 标签 + 描述 + 结束内容" 布局模式。用作列表项、菜单项、联系人行、通知等的构建块。',
      propDescriptions: {
        label:
          '标识此项目的主要文本。接受字符串（自动截断）或 ReactNode（用于富内容）。',
        marker:
          '在 startContent 之前渲染的标记，作为直接 flex 子元素。用于需要自定义基线对齐的列表项目符号/计数器。',
        startContent: '在标签/描述区域之前渲染的内容，例如图标、头像或复选框。',
        description: '次要文本：副标题、描述或辅助信息。',
        endContent:
          '在标签/描述区域之后渲染的内容，例如徽章、元数据、时间戳或操作按钮。',
        as: '根元素的 HTML 元素。',
        align:
          "起始/结束内容插槽的垂直对齐方式：'center'（默认）、'start'（顶部对齐）或 'first-line'（以标签第一行为中心）。",
        density:
          '间距密度。"compact" 使用 4px 块内距，"balanced" 使用 8px，"spacious" 使用 12px 块内距和内联内距。',
        labelLines: '标签截断前的最大行数。',
        descriptionLines: '描述截断前的最大行数。',
        onClick: '点击处理函数。使项目可点击，具有按钮语义。',
        interactiveRef:
          '指向嵌套控件（如 startContent 中的复选框）的 ref，该控件承载项目的键盘访问和操作。行成为更大的点击/触摸目标，将表面点击委托给该控件（useClickableContainer），且不渲染不可见按钮/锚点，因此行不会增加第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥——设置后二者将被忽略。',
        href: '链接 URL。通过不可见锚点元素使项目成为链接。',
        target:
          '链接目标。仅与 href 一起使用。target="_blank" 会自动添加 noopener noreferrer。',
        rel: '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
        isHighlighted: '高亮状态（悬停/键盘焦点外观）。',
        isSelected: '选中状态。',
        isDisabled: '禁用状态。',
        ref: '转发到根元素的引用。',
        xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
        'data-testid': '自动化测试的选择器。',
      },
    },
  ],
  usage: {
    description:
      '通用项目原语，统一 Astryx 中 "起始内容 + 标签 + 描述 + 结束内容" 的布局模式。适用于下拉菜单、选择器、联系人列表、通知、文件浏览器和活动流等场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          '使用命名插槽（startContent、label、description、endContent）处理常见布局。',
      },
      {
        guidance: true,
        description:
          '菜单和密集列表使用 density="compact"，标准行使用 "balanced"，宽松布局使用 "spacious"。',
      },
      {
        guidance: true,
        description:
          '设置 labelLines 和 descriptionLines 控制内容长度不定时的截断。',
      },
      {
        guidance: true,
        description:
          '当换行标签旁边是属于其第一行的小标记（状态点、单选按钮、时间戳）时，使用 align="first-line"。使用 align="start" 让较高插槽与文本顶部对齐。',
      },
      {
        guidance: false,
        description: '不要在交互式 Item 内嵌套交互元素（按钮、链接）。',
      },
      {
        guidance: false,
        description: '不要使用 Item 进行视图间导航：使用适当的导航组件。',
      },
      {
        guidance: false,
        description:
          '不要直接添加已读/未读行为：组合一个薄包装器如 PreviewItem。',
      },
    ],
    anatomy: [
      {
        name: '标记',
        required: false,
        description: '在起始内容之前渲染的可选列表项目符号/计数器。',
      },
      {
        name: '起始内容',
        required: false,
        description: '前导视觉：头像、图标、图片或复选框。',
      },
      {name: '标签', required: true, description: '标识项目的主要文本。'},
      {name: '描述', required: false, description: '标签下方的次要辅助文本。'},
      {
        name: '结束内容',
        required: false,
        description: '末端对齐内容：徽章、时间戳或操作按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '通用项目原语，带 startContent+label+description+endContent 布局。列表项、菜单项、联系人、通知的构建块',
  usage: {
    description:
      '统一 "起始内容 + 标签 + 描述 + 结束内容" 模式的灵活项目原语。用于菜单、列表、联系人、通知、文件浏览器中的结构化行。',
    bestPractices: [
      {
        guidance: true,
        description:
          '80% 场景用命名插槽（startContent、label、description、endContent）。',
      },
      {
        guidance: true,
        description:
          '菜单/密集列表用 density="compact"，标准行用 "balanced"，宽松布局用 "spacious"。',
      },
      {
        guidance: true,
        description: '用 labelLines/descriptionLines 控制截断。',
      },
      {
        guidance: true,
        description:
          '换行标签旁的小标记用 align="first-line"；较高插槽与文本顶部对齐用 align="start"。',
      },
      {
        guidance: false,
        description: '不要在交互式 Item 内嵌套交互元素。',
      },
      {
        guidance: false,
        description: '不要用于视图导航；请用导航组件。',
      },
      {
        guidance: false,
        description: '不要添加收件箱特有行为；组合包装器。',
      },
    ],
  },
  components: [
    {
      name: 'Item',
      displayName: 'Item',
      description:
        '通用项目原语，带 startContent+label+description+endContent 布局',
      propDescriptions: {
        label:
          '主要文本。字符串自动截断；富内容用 ReactNode。',
        marker: 'startContent 之前的列表项目符号/计数器，作为直接 flex 子元素。',
        startContent:
          '标签/描述之前的内容：头像、图标、复选框、ReactNode。',
        description: '标签下方的次要文本。',
        endContent:
          '标签/描述之后的内容：徽章、时间戳、操作。',
        as: '根 HTML 元素。',
        align:
          "起始/结束插槽对齐：'center'（默认）、'start'（顶部）或 'first-line'（以标签第一行为中心）。",
        density:
          '间距："compact"（4px）、"balanced"（8px）或 "spacious"（12px）。',
        labelLines: '标签截断前最大行数。',
        descriptionLines: '描述截断前最大行数。',
        onClick: '点击处理器；启用按钮语义。',
        interactiveRef:
          '指向承载项目键盘访问/操作的嵌套控件的 ref；行把表面点击委托给它（useClickableContainer），无不可见按钮/锚点，不增加第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥。',
        href: '链接 URL；启用锚点语义。遵循共享导航规则（见 Link href）。',
        target:
          '链接目标，仅配合 href。target="_blank" 自动添加 noopener noreferrer。',
        rel: '链接关系标记。target="_blank" 自动合并 noopener noreferrer。',
        isHighlighted: '高亮状态。',
        isSelected: '选中状态。',
        isDisabled: '禁用状态。',
        xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值。',
        'data-testid': '测试选择器。',
      },
    },
  ],
};
