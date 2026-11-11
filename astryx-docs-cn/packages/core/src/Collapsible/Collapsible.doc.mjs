// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  displayName: 'Collapsible',
  group: 'Collapsible',
  category: 'Container',
  keywords: ['手风琴', '折叠', '可展开', '展开收起', '切换', '面板', '可折叠', '展开器', '展开'],
  playground: {
    defaults: {
      trigger: '点击展开',
      children: {__element: 'Text', props: {type: 'body'}, children: '展开折叠组件后显示此内容，其中可包含任意组件。'},
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-collapsible',
        visualProps: ['density'],
        states: ['divided'],
      },
      {
        className: 'astryx-collapsible-trigger',
        visualProps: ['density', 'chevronPosition'],
        states: ['open', 'disabled'],
      },
      {
        className: 'astryx-collapsible-content',
        visualProps: ['density'],
        states: ['open'],
      },
      {className: 'astryx-collapsible-group', visualProps: ['density']},
    ],
  },
  description: '让任意内容可折叠的基础组件：触发按钮切换内容区域的可见性，可自管理状态，也可交由父级 CollapsibleGroup 接管。',
  props: [
    {
      name: 'trigger',
      type: 'ReactNode',
      description: '触发区域显示的内容（始终可见）。',
      required: true,
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '触发器',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '可折叠与展开的内容。',
    },
    {
      name: 'defaultIsOpen',
      type: 'boolean',
      description:
        '独立非受控用法下的默认展开状态。value 将该项绑定到外层 CollapsibleGroup 时忽略。',
      default: 'true',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        '独立用法下的受控展开状态。value 将该项绑定到外层 CollapsibleGroup 时忽略。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用该项，使其触发器无法切换（变暗、aria-disabled、移出 tab 顺序）。不会折叠已展开的项。',
      default: 'false',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '独立展开状态变化时调用的回调。外层 CollapsibleGroup 拥有分组状态，改为调用其 onChange。',
    },
    {
      name: 'chevronPosition',
      type: "'start' | 'end'",
      description: 'Collapsible 展开箭头的逻辑位置。`end`（默认）位于标签之后，收起时朝下、展开时朝上。`start` 位于标签之前，收起时朝内容方向指（RTL 下镜像），展开时朝下。CollapsibleGroup 内默认取组的 chevronPosition。',
      default: "'end'",
    },
    {
      name: 'value',
      type: 'string',
      description:
        '用于组协调的标识。在 CollapsibleGroup 内设置时，组拥有展开状态，其 onChange 作为通知回调。',
    },
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        'useAnimatedLayout({containerRef}) 返回的句柄。传入后，展开与收起会让该 Collapsible 之后的内容（直到该容器）沿同一共享动效角色平滑滑动而非跳变，展开的内容与箭头在同一动效中移动。未传入时，后续内容立即就位。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发至折叠组件根元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS class 名。样式定制优先使用 xstyle。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '内联样式。需要 StyleX 优化时优先使用 xstyle。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  components: [
    {name: 'CollapsibleGroup'},
  ],
  usage: {
    accessibility: [
      {
        name: 'Trigger label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Pointer down'],
        description:
          '触发器文本与背后表面的对比度至少达到 4.5:1。Pointer down 状态需对照触发器行按下时绘制的按下覆盖层测量。',
      },
    ],
    description: 'Collapsible 在触发按钮之后隐藏与展示内容。适合设置面板、FAQ 页面或详情视图，保持页面可扫读，同时让用户深入感兴趣的分区。多个折叠项包进 CollapsibleGroup 即可得到手风琴行为。自定义折叠组件请直接使用 `useCollapsible` Hook（`astryx hook useCollapsible`）。',
    bestPractices: [
      { guidance: true, description: '给每个触发器起有意义的无障碍名称。可见文本通常即可充当；自定义触发器内容缺乏可见文本时，应加入 VisuallyHidden 文本。' },
      { guidance: true, description: 'FAQ 式列表在 CollapsibleGroup 上使用 hasDividers：内置行发丝线配合主题边框 token，无需手写边框。' },
      { guidance: true, description: '手风琴布局中为每个 Collapsible 包一层 Card 做视觉分隔；扁平列表则用 CollapsibleGroup 的 hasDividers；两者不要同时使用。' },
      { guidance: true, description: '设置或 FAQ 页面一次只应展开一个分区时，使用 type="single" 的 CollapsibleGroup。' },
      { guidance: true, description: '用户需要跨分区对比内容（如功能列表或价格档位）时使用 type="multiple"。' },
      { guidance: true, description: '内容在首次浏览时大概率需要就让分区默认展开（defaultIsOpen）；别让用户点击才能看到关键信息。' },
      { guidance: false, description: '不要把关键或必读内容藏进折叠组件；用户可能发现不了。' },
      { guidance: false, description: '不要嵌套折叠超过两层；会让内容难以查找和导航。' },
      { guidance: false, description: '不要为单个短段落用折叠组件；直接展示文本即可。' },
    ],
    anatomy: [
      { name: 'Container', required: true, description: '包含一个触发器及其受控内容的根元素；在带分隔线的组中负责绘制项分隔线。' },
      { name: 'Trigger', required: true, description: '始终可见、用于切换内容的按钮。显示标签与折叠箭头指示。' },
      { name: 'Chevron', required: false, description: '带动画的展开箭头。默认位于标签之后；chevronPosition="start" 将其移到标签之前，收起时朝内容方向指（RTL 下镜像），展开时朝下。' },
      { name: 'Content', required: false, description: '点击触发器时隐藏或显示的区域。' },
      { name: 'Group container', required: false, description: '开启分隔线时渲染的 CollapsibleGroup 包裹层。包含受协调的各折叠项，并承载其密度。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in CollapsibleGroup for accordion behavior.',
    bestPractices: [
      { guidance: true, description: '确保每个触发器都有有意义的无障碍名称。可见文本通常可提供名称；若自定义视觉内容无法提供名称，请加入 VisuallyHidden 文本。' },
      { guidance: true, description: 'Use hasDividers on CollapsibleGroup for FAQ-style lists: built-in row hairlines with themed border tokens, no hand-rolled borders.' },
      { guidance: true, description: 'Wrap each Collapsible in an Card for visual separation in accordion layouts, or use CollapsibleGroup\'s hasDividers for flat lists; don\'t combine both.' },
      { guidance: true, description: 'Use CollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view; don\'t make users click to see essential info.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible; users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep; it makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph; just show the text directly instead.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '在触发器后隐藏/展示内容；组用于手风琴行为',
  usage: {
    description: 'Collapsible 在触发按钮后隐藏与展示内容。用于设置、FAQ 或详情视图。包进 CollapsibleGroup 得到手风琴行为。',
    bestPractices: [
      { guidance: true, description: '给每个触发器起有意义的无障碍名称；自定义视觉缺文本时加 VisuallyHidden。' },
      { guidance: true, description: 'FAQ 式列表在 CollapsibleGroup 上用 hasDividers：内置行发丝线，不手写边框。' },
      { guidance: true, description: '每个 Collapsible 包 Card 做视觉分隔；扁平列表用 CollapsibleGroup 的 hasDividers；不并用。' },
      { guidance: true, description: '设置或 FAQ 页面一次只应展开一个分区时，使用 type="single" 的 CollapsibleGroup。' },
      { guidance: true, description: '用户需要跨分区对比时使用 type="multiple"。' },
      { guidance: true, description: '首次浏览就需要的内容让分区默认展开（defaultIsOpen）。' },
      { guidance: false, description: '关键内容不要藏进折叠组件；用户可能发现不了。' },
      { guidance: false, description: '折叠嵌套不要超过两层；内容难查找难导航。' },
      { guidance: false, description: '单个短段落不要用折叠组件；直接展示文本。' },
    ],
  },
};
