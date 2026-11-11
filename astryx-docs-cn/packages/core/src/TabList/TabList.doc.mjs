// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TabList',
  displayName: 'Tab List',
  group: 'Tabs',
  category: 'Navigation',
  keywords: ['tabs', 'tabbar', '标签栏', '标签页', 'navigation', 'tabpanel', '标签组', 'segmented', 'navtabs', 'tab'],
  playground: {
    defaults: {
      value: 'tab-1',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-tab-list', visualProps: ['size']},
      {className: 'astryx-tab-strip'},
      {className: 'astryx-tab-scroll-button'},
      {className: 'astryx-tab', states: ['selected']},
      {className: 'astryx-tab-indicator', states: ['selected']},
      {className: 'astryx-tab-menu'},
      {className: 'astryx-tab-menu-dropdown'},
      {className: 'astryx-tab-menu-item'},
    ],
    vars: [
      {name: '--_tab-indicator-bottom', description: '选中标签指示器相对标签底边的垂直偏移。自带底部分隔线的宿主（Toolbar）会设置此项，让指示器落在分隔线上而不是其上方。', default: '-1px', private: true},
    ],
  },
  description: '标签条，向 Tab 与 TabMenu 子元素提供 TabListContext（value、onChange、size）；默认为导航地标，role="tablist" 时采用 WAI-ARIA tabs 模式。',
  props: [
    {
      name: 'value',
      type: 'string',
      description: '当前选中的标签值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '选中某个标签时触发的回调。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '应用到所有子标签的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'layout',
      type: "'hug' | 'fill'",
      description: "标签尺寸的布局模式。'hug'：每个标签按内容取宽。'fill'：各标签等分拉伸以填满容器宽度。",
      default: "'hug'",
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '是否在标签列表下显示底部分隔线。',
      default: 'false',
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description: "让标签条脱离父容器内边距，延伸到容器内容边缘（用负外边距抵消最近的带内边距 Layout 容器的 --container-padding-* 自定义属性）。内部标签条会按容器内缩中未被第一个或最后一个标签停留位提供的部分回补内边距，边缘标签保持对齐，hasDivider 下划线横跨全部内容宽度。与 Divider 的 isFullBleed 一致：仅行内（start/end）边；块边停靠仍由周围布局负责。",
      default: 'false',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: "标签条的 ARIA 角色。'tablist' 请求 WAI-ARIA tabs 模式：role=\"tablist\" / role=\"tab\" 与 aria-selected，每个标签通过其 panelId 指向所控面板；tablist 条内只能放标签，且标签的 href 在其中被忽略。不设置时，标签条是导航地标，用 aria-current 标记当前标签。其他任何值原样传递给元素。",
    },
    {
      name: 'overflow',
      type: "'auto' | 'scroll' | 'visible'",
      description: "标签比标签条更宽时的处理方式。'auto' 由组件选择，目前总是滚动。'scroll' 水平滚动标签，带边缘渐隐与可悬停指针的箭头入口。'visible' 关闭溢出处理，让标签溢出标签条。选中的标签始终会滚动回可视区。",
      default: "'auto'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '要在标签条内渲染的 Tab 与 TabMenu 项。',
      slotElements: [
        {
          __element: 'Tab',
          props: {
            label: 'Tab',
            value: 'tab',
          },
        },
      ],
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
  components: [
    {name: 'Tab'},
    {name: 'TabMenu'},
  ],
  usage: {
    accessibility: [
      {
        name: 'Tab label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Selected'],
        description:
          '每个标签与其背后标签表面的对比度至少 4.5:1。对于 Hover 与 Pointer down，应在叠加层应用后测量最终背景。',
      },
    ],
    description:
      'TabList 提供标签式导航，把内容组织成分类区块。用于让用户不离开页面即可在相关视图间切换。标签条比标签窄时会水平滚动并保持选中标签在可视区。',
    bestPractices: [
      { guidance: true, description: '标签文字保持简短且具有描述性，让用户快速浏览可用区块。' },
      { guidance: true, description: '保持溢出处理开启：标签条比标签窄时滚动，选中标签保持在可视区。想要精选的额外选项组而非滚动条时，用 TabMenu。' },
      { guidance: true, description: '在标签旁搭配操作按钮并使用 hasDivider 时，让 Button 尺寸与 TabList 尺寸一致（同为 md 或同为 sm）；带分隔线的标签条会预留空间，使标签与同尺寸按钮对齐到轨道上方的共同基线。' },
      { guidance: true, description: '标签条原地切换面板时用 role="tablist"，并给每个标签一个指向其打开面板的 panelId：屏幕阅读器正是通过这一关联从标签找到其内容。视图间导航则不要开启。' },
      { guidance: true, description: '在带内边距的 LayoutHeader、Card 或 Section 内让标签栏延伸到容器行内内容边缘时，设置 isFullBleed，而不是手写负外边距 CSS。' },
      { guidance: false, description: '顺序步骤或工作流不要用标签页；请改用步骤器或向导模式。' },
      { guidance: false, description: '溢出菜单前可见标签不要超过 6–8 个；优先保留最重要的分类。' },
      { guidance: false, description: '不要把 TabList 与 SegmentedControl 或 ToggleButton 混淆。TabList 用于视图间导航。SegmentedControl 与 ToggleButton 是输入控件：SegmentedControl 始终恰好有一个选中项，ToggleButton 可独立开关。' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: '最重要的区域；按内容取宽。'},
      {name: 'Center-Fill Content', required: false, description: '拉伸填满可用空间。'},
      {name: 'Right Content', required: false, description: '按内容取宽。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page. A strip narrower than its tabs scrolls horizontally and keeps the selected tab in view.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Leave overflow handling on: a strip narrower than its tabs scrolls, and the selected tab is kept in view. Use TabMenu when you want a curated group of extra options rather than a scrolling strip.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, match the Button size to the TabList size (both md, both sm); the divided tab strip reserves space so tabs and same-size buttons align to a shared baseline above the rail.' },
      { guidance: true, description: 'Reach for role="tablist" when the strip switches panels in place, and give each tab a panelId pointing at the panel it opens: that link is how a screen reader gets from a tab to its content. Leave it off for navigation between views.' },
      { guidance: true, description: 'Set isFullBleed to stretch a tab bar inside a padded LayoutHeader, Card, or Section to the container\'s inline content edges, instead of reaching for negative-margin CSS.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows; use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu; prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with SegmentedControl or ToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls: SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '带溢出滚动的标签条；默认为导航地标，role="tablist" 时为 WAI-ARIA tabs 模式。',
  usage: {
    description:
      'TabList 提供标签式导航，把内容组织成分类区块。用户不离开页面即可在相关视图间切换。标签条比标签窄时水平滚动并保持选中标签在可视区。',
    bestPractices: [
      { guidance: true, description: '标签文字保持简短且具有描述性，让用户快速浏览可用区块。' },
      { guidance: true, description: '保持溢出处理开启：标签条比标签窄时滚动，选中标签保持在可视区。想要精选的额外选项组而非滚动条时，用 TabMenu。' },
      { guidance: true, description: '标签旁搭配操作按钮并使用 hasDivider 时，Button 尺寸与 TabList 尺寸一致（同为 md 或同为 sm）；带分隔线的标签条会预留空间，使标签与同尺寸按钮对齐到轨道上方的共同基线。' },
      { guidance: true, description: '原地切换面板时用 role="tablist"，并给每个标签指向其打开面板的 panelId：屏幕阅读器靠这一关联从标签找到内容。视图间导航则不要开启。' },
      { guidance: true, description: '在带内边距的 LayoutHeader、Card 或 Section 内让标签栏延伸到容器行内内容边缘时，设置 isFullBleed，而非负外边距 CSS。' },
      { guidance: false, description: '顺序步骤或工作流不要用标签页；请改用步骤器或向导模式。' },
      { guidance: false, description: '溢出菜单前可见标签不要超过 6–8 个；优先保留最重要的分类。' },
      { guidance: false, description: '不要把 TabList 与 SegmentedControl 或 ToggleButton 混淆。TabList 用于视图间导航；SegmentedControl 始终恰好有一个选中项，ToggleButton 可独立开关。' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: '最重要的区域；按内容取宽。'},
      {name: 'Center-Fill Content', required: false, description: '拉伸填满可用空间。'},
      {name: 'Right Content', required: false, description: '按内容取宽。'},
    ],
  },
};
