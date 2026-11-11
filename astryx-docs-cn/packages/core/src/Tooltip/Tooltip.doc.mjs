// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Tooltip surface',
    required: true,
    description: '承载 tooltip 的绘制覆盖表面。',
  },
  {
    name: 'Tooltip text',
    required: true,
    description: '渲染在表面内的 tooltip 内容。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Tooltip',
  displayName: 'Tooltip',
  group: 'Tooltip',
  category: 'Overlay',
  playground: {
    defaults: {
      content: 'Helpful tooltip text',
      children: {
        __element: 'Button',
        props: {label: 'Hover me', variant: 'secondary'},
      },
    },
  },
  keywords: [
    'tooltip',
    'hint',
    'infotip',
    'title',
    'hover',
    'flyout',
    'balloon',
    'helpertext',
    '提示',
    '悬停提示',
    '信息提示',
  ],
  components: [
    {
      name: 'Tooltip',
      displayName: 'Tooltip',
      description:
        '悬停或聚焦触发 tooltip 显示的组件包装器。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '激活 tooltip 的触发元素。',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: '兄弟模式的外部锚点 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'tooltip 内容，通常是简短文本。',
          slotElements: [
            {
              __element: 'Text',
              props: {type: 'body'},
              children: 'Content text',
            },
          ],
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            '相对于锚点元素的位置。逻辑值：start/end 依据弹出层自身继承的方向解析 (RTL 在纯 CSS 中镜像)。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '沿放置轴的对齐方式。逻辑值：start/end 依据弹出层自身继承的方向解析 (RTL 在纯 CSS 中镜像)。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟 (毫秒)。',
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟 (毫秒)。',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制聚焦事件何时触发 tooltip。',
          default: "'auto'",
        },
        {
          name: 'touchTrigger',
          type: "'auto' | 'tap' | 'none'",
          description:
            '在没有悬停能力的场景下轻点的行为。auto：轻点即打开，除非触发元素自身会执行操作 (按钮、链接或表单控件)，此时轻点归该控件所有；设置了 aria-disabled 的控件不执行任何操作，因此轻点它会显示禁用原因。tap：始终轻点打开，适用于唯一作用就是展示 tooltip 的按钮；信息图标请用 InfoTip。none：触摸永不打开。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用 tooltip 触发器。',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'tooltip 可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: '在触发元素上显示虚线下划线。',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description:
            '挂载时是否显示 tooltip。仍可关闭。',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'tooltip 的受控打开状态。锁定关闭时，本会打开它的聚焦会调用 onOpenChange(true) 且不显示任何内容；锁定打开时，按 Escape 会调用 onOpenChange(false) 且保持打开。',
        },
      ],
    },
  ],
  theming: {
    targets: [{className: 'astryx-tooltip'}],
  },
  usage: {
    anatomy,
    description:
      '悬停或聚焦时出现、锚定在触发元素上的简短文字提示。用它说明纯图标按钮、展示被截断标签的完整文本，或在不弄乱界面的前提下提供补充上下文。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持 tooltip 内容简练：纯文本尽量控制在 140 字符以内。',
      },
      {
        guidance: true,
        description:
          '为纯图标按钮和缺少可见标签的控件添加 tooltip。',
      },
      {
        guidance: true,
        description:
          '触发元素是唯一作用就是展示 tooltip 的按钮时，把 touchTrigger 设为 tap：触摸没有悬停，而 auto 会把轻点留给执行操作的触发元素。信息图标请用 InfoTip，它同样在按一下时固定显示帮助。',
      },
      {
        guidance: false,
        description:
          '不要在 tooltip 内放置链接或按钮等可交互元素；请改用 HoverCard 或 Popover。',
      },
      {
        guidance: false,
        description:
          '不要用 tooltip 承载完成任务必须看到的关键信息。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Tooltip',
  displayName: 'Tooltip',
  components: [
    {
      name: 'Tooltip',
      displayName: 'Tooltip',
      description: '工具提示显示的组件包装器，通过悬停或聚焦触发。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '激活工具提示的触发元素。',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: '兄弟模式的外部锚点引用。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '工具提示内容，通常是简短文本。',
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            '相对于锚点元素的位置。逻辑值：start/end 根据弹出层自身继承的方向解析（RTL 镜像）。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '沿放置轴的对齐方式。逻辑值：start/end 根据弹出层自身继承的方向解析（RTL 镜像）。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制聚焦事件何时触发工具提示。',
          default: "'auto'",
        },
        {
          name: 'touchTrigger',
          type: "'auto' | 'tap' | 'none'",
          description:
            '在没有悬停的触摸设备上，轻点的行为。auto：轻点即打开，除非触发元素本身会执行操作（按钮、链接、表单控件），此时轻点归该控件所有；设置了 aria-disabled 的控件不执行操作，因此轻点它会显示其原因。tap：始终轻点打开，适用于唯一作用是显示工具提示的按钮；信息图标请使用 InfoTip。none：触摸永不打开。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用工具提示触发器。',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '工具提示可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: '在触发元素上显示虚线下划线。',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description: '是否在挂载时显示工具提示。仍然可以关闭。',
        },
      ],
    },
  ],
  theming: {
    targets: [{className: 'astryx-tooltip'}],
  },
  usage: {
    anatomy,
    description:
      'A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep tooltip content concise: aim for under 140 characters of plain text.',
      },
      {
        guidance: true,
        description:
          'Add a tooltip to icon-only buttons and controls that lack a visible label.',
      },
      {
        guidance: true,
        description:
          'Set touchTrigger to tap when the trigger is a button whose only job is revealing the tooltip: touch has no hover, and auto keeps the tap for triggers that perform an action. For an info icon, use InfoTip, which also pins its help on a press.',
      },
      {
        guidance: false,
        description:
          'Place interactive elements like links or buttons inside a tooltip; use HoverCard or Popover instead.',
      },
      {
        guidance: false,
        description:
          'Use tooltips for essential information that users must see to complete a task.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '悬停/聚焦触发的 tooltip，展示锚定在触发元素上的简短、非交互文本。',
  usage: {
    anatomy,
    description:
      '悬停或聚焦时出现的简短文字提示，锚定在触发元素上。用于说明纯图标按钮、展示截断标签全文，或在不弄乱界面的前提下补充上下文。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持 tooltip 内容简练：纯文本尽量控制在 140 字符以内。',
      },
      {
        guidance: true,
        description:
          '为纯图标按钮和缺少可见标签的控件添加 tooltip。',
      },
      {
        guidance: true,
        description:
          '触发元素是唯一作用就是展示 tooltip 的按钮时，把 touchTrigger 设为 tap：触摸没有悬停，而 auto 会把轻点留给执行操作的触发元素。信息图标请用 InfoTip。',
      },
      {
        guidance: false,
        description:
          '不要在 tooltip 内放置链接或按钮等可交互元素；请改用 HoverCard 或 Popover。',
      },
      {
        guidance: false,
        description:
          '不要用 tooltip 承载完成任务必须看到的关键信息。',
      },
    ],
  },
  components: [
    {
      name: 'Tooltip',
      displayName: 'Tooltip',
      description: '悬停/聚焦显示 tooltip 的组件包装器。',
      propDescriptions: {
        children: '激活 tooltip 的触发元素。',
        anchorRef: '兄弟模式的外部锚点 ref。',
        content: 'tooltip 内容，通常为简短文本。',
        placement:
          '相对锚点的位置。逻辑值：start/end 跟随弹出层继承的方向 (RTL 镜像)。',
        alignment:
          '沿放置轴的对齐。逻辑值：start/end 跟随弹出层继承的方向 (RTL 镜像)。',
        delay: '显示延迟 (毫秒)。',
        hideDelay: '隐藏延迟 (毫秒)。',
        focusTrigger: '控制聚焦事件何时触发 tooltip。',
        touchTrigger:
          '无悬停场景的轻点行为。auto = 轻点打开，除非触发元素自身执行操作 (按钮/链接/控件；aria-disabled 控件不执行)；tap = 始终打开 (唯一作用是 tooltip 的按钮；信息图标用 InfoTip)；none = 触摸永不打开。',
        isEnabled: '启用/禁用 tooltip 触发器。',
        onOpenChange:
          '可见性变化时的回调；true=显示，false=隐藏。',
        hasHoverIndication: '触发元素上的虚线下划线。',
        isDefaultOpen: '挂载时显示 tooltip。仍可关闭。',
      },
    },
  ],
};
