// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Progress bar',
    required: true,
    description: '排列标签行与进度轨道的容器。',
  },
  {
    name: 'Label',
    required: true,
    description: '命名操作的文本，可在视觉上隐藏的同时保持无障碍可访问。',
  },
  {
    name: 'Value text',
    required: false,
    description: '按需显示在标签旁的格式化确定值文本。',
  },
  {
    name: 'Track',
    required: true,
    description: '承载 progressbar 语义、表示剩余进度的轨道。',
  },
  {
    name: 'Fill',
    required: true,
    description: '显示已完成进度或不确定运动的绘制区段。',
  },
  {
    name: 'Mark',
    required: false,
    description: '定位在确定轨道上的带标签目标刻度。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ProgressBar',
  displayName: 'Progress Bar',
  category: 'Feedback & Status',
  keywords: [
    'ProgressBar',
    'progress',
    '进度条',
    '加载指示器',
    'loading',
    '加载',
    '线性',
    '确定进度',
    '不确定进度',
    'meter',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: '当前值（不确定模式下忽略）。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签（仍保持无障碍）。',
      default: 'false',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '是否显示格式化的值文本（不确定模式下忽略）。',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description: '自定义值标签格式化器；默认为百分比字符串。',
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description:
        '未知进度时的动画加载指示器。在减弱动效下改为原地脉冲而非滑动。',
      default: 'false',
    },
    {
      name: 'marks',
      type: 'ReadonlyArray<{value: number; label: string}>',
      description:
        '在轨道上按与 value 相同的 0..max 刻度绘制的固定目标标记（例如目标线）。无论进度低于还是越过它们都保持可见，且颜色取决于所处的位置：位于已填充区域内的标记使用填充变体的前景色（on-accent、on-warning、on-error 等），仍在空轨道上的标记使用主文本颜色（禁用条上为次要文本颜色，禁用会弱化其绘制的所有内容）。每个标记都必须提供 label：它既是标记的无障碍名称，也是悬停/聚焦时通过工具提示显示的文本。不确定模式下忽略。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '视觉禁用状态：使填充条与文本变灰。用于已取消或不活跃的操作。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-progress-bar', visualProps: ['variant']},
      {className: 'astryx-progress-bar-fill', visualProps: ['variant']},
      {className: 'astryx-progress-bar-track'},
      {
        className: 'astryx-progress-bar-mark',
        visualProps: ['variant', 'placement'],
      },
    ],
    vars: [
      {
        name: '--_progressbar-mark-width',
        description: '目标标记刻度宽度',
        default: '2px',
        private: true,
      },
      {
        name: '--_progressbar-mark-height',
        description: '目标标记刻度高度',
        default: '8px',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_progressbar-mark-width'], replaces: true},
      {
        property: 'height',
        vars: ['--_progressbar-mark-height'],
        replaces: true,
      },
    ],
  },
  usage: {
    anatomy,
    description:
      '水平条，展示任务的完成进度。用于时长已知的操作，或在无法计算进度时作为动画指示器。支持语义颜色变体、值标签与自定义格式化。触控下新值的动画与 iOS 一致：线性地、按移动距离成比例推进（在主题默认节奏下走完整条轨道需一秒），且填充条在零以上始终保持最小可见长度。',
    bestPractices: [
      {
        guidance: true,
        description: '工作总量已知时使用确定进度条，未知时使用不确定进度条。',
      },
      {
        guidance: true,
        description:
          '选择与场景匹配的颜色变体：一般进度用 accent，完成用 success，警示用 warning 或 error。',
      },
      {
        guidance: true,
        description:
          '始终提供 label，即使视觉上隐藏；屏幕阅读器需要它来播报正在加载的内容。',
      },
      {
        guidance: false,
        description:
          '不要把图标或标签放进进度条内部；请用布局组件将它们组合在进度条旁边。',
      },
      {
        guidance: false,
        description: '不要将进度条用于即时操作；它面向耗时明显的操作。',
      },
      {
        guidance: false,
        description:
          '不要为同一操作堆叠多个进度条；请改用一条带值标签的进度条。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'ProgressBar',
  displayName: 'Progress Bar',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签（必填）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: '当前值（不确定模式下忽略）。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签（仍保持无障碍可访问性）。',
      default: 'false',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '显示格式化的值文本（不确定模式下忽略）。',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description: '自定义值标签格式化器；默认为百分比字符串。',
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: '用于未知进度的动画加载指示器。',
      default: 'false',
    },
    {
      name: 'marks',
      type: 'ReadonlyArray<{value: number; label: string}>',
      description:
        '在轨道上按与 value 相同的 0..max 刻度绘制的固定目标标记（例如目标线）。无论进度低于还是超过它们都保持可见，并根据所处位置取色：位于已填充区域内的标记使用与填充变体配对的前景色（on-accent、on-warning、on-error 等），仍位于空轨道上的标记使用主文本颜色（禁用状态下会降为次要文本颜色，与其整体弱化的呈现保持一致）。每个标记都必须提供 label——它既是标记的无障碍名称，也是悬停/聚焦时通过工具提示显示的文本。不确定模式下忽略。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '视觉禁用状态——使填充条和文本变灰。用于已取消或不活跃的操作。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-progress-bar', visualProps: ['variant']},
      {className: 'astryx-progress-bar-fill', visualProps: ['variant']},
      {className: 'astryx-progress-bar-track'},
      {
        className: 'astryx-progress-bar-mark',
        visualProps: ['variant', 'placement'],
      },
    ],
    vars: [
      {
        name: '--_progressbar-mark-width',
        description: '目标标记刻度宽度',
        default: '2px',
        private: true,
      },
      {
        name: '--_progressbar-mark-height',
        description: '目标标记刻度高度',
        default: '8px',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_progressbar-mark-width'], replaces: true},
      {
        property: 'height',
        vars: ['--_progressbar-mark-height'],
        replaces: true,
      },
    ],
  },
  usage: {
    anatomy,
    description:
      "A horizontal bar showing the completion progress of a task. Use it for operations where the duration is known, or as an animated indicator when progress can't be calculated. Supports semantic color variants, value labels, and custom formatting. Under a finger a new value animates as on iOS: linearly, in proportion to how far it moves (a full track takes one second at the theme's default tempo), and the fill keeps a minimum visible length above zero.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Use a determinate bar when the total amount of work is known, and indeterminate when it's not.",
      },
      {
        guidance: true,
        description:
          'Choose a color variant that matches the context: accent for general progress, success for completion, warning or error for alerts.',
      },
      {
        guidance: true,
        description:
          "Always provide a label, even if hidden; screen readers need it to announce what's loading.",
      },
      {
        guidance: false,
        description:
          'Place icons or labels inside the bar; compose them alongside it using layout components.',
      },
      {
        guidance: false,
        description:
          "Use a progress bar for instant actions; it's meant for operations that take noticeable time.",
      },
      {
        guidance: false,
        description:
          'Use multiple progress bars stacked together for the same operation; use one bar with a value label instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '用于显示确定或不确定进度的进度条。',
  usage: {
    anatomy,
    description:
      '水平条，展示任务的完成进度。用于时长已知的操作，或在无法计算进度时作为动画指示器。支持语义颜色变体、值标签与自定义格式化。触控下新值的动画与 iOS 一致：线性地、按移动距离成比例推进（在主题默认节奏下走完整条轨道需一秒），且填充条在零以上始终保持最小可见长度。',
    bestPractices: [
      {
        guidance: true,
        description: '工作总量已知时使用确定进度条，未知时使用不确定进度条。',
      },
      {
        guidance: true,
        description:
          '选择与场景匹配的颜色变体：一般进度用 accent，完成用 success，警示用 warning 或 error。',
      },
      {
        guidance: true,
        description:
          '始终提供 label，即使视觉上隐藏；屏幕阅读器需要它来播报正在加载的内容。',
      },
      {
        guidance: false,
        description:
          '不要把图标或标签放进进度条内部；请用布局组件将它们组合在进度条旁边。',
      },
      {
        guidance: false,
        description: '不要将进度条用于即时操作；它面向耗时明显的操作。',
      },
      {
        guidance: false,
        description:
          '不要为同一操作堆叠多个进度条；请改用一条带值标签的进度条。',
      },
    ],
  },
  propDescriptions: {
    label: '无障碍标签',
    value: '当前值（不确定模式下忽略）。',
    max: '最大值。',
    isLabelHidden: '视觉上隐藏标签（仍保持无障碍）。',
    hasValueLabel: '显示格式化的值文本（不确定模式下忽略）。',
    formatValueLabel: '自定义值标签格式化器；默认为百分比字符串。',
    variant: '语义颜色变体。',
    isIndeterminate: '未知进度时的动画加载指示器。在减弱动效下改为原地脉冲而非滑动。',
    marks:
      '在轨道上按 0..max 刻度绘制的固定目标标记（{value, label?}）；越过填充后仍保持可见。填充区内的标记取变体前景色，空轨道上的标记取主文本颜色（禁用时为次要颜色）。label 在悬停/聚焦时显示工具提示。不确定模式下忽略。',
    isDisabled: '视觉禁用：使填充条与文本变灰。',
    xstyle: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
  },
};
