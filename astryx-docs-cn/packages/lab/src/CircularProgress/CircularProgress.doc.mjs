// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CircularProgress',
  displayName: 'Circular Progress',
  category: 'Feedback & Status',
  keywords: ["circular","环形","progress","进度","radial","径向","ring","圆环","arc","弧线","determinate","确定进度","indeterminate","不确定进度","gauge","仪表","meter","donut","圆环图"],
  props: [
    {
      name: 'value',
      type: 'number',
      description: '当前值。isIndeterminate 为 true 时忽略。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'label',
      type: 'string',
      description: '屏幕阅读器的无障碍标签。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签（仍保持无障碍可访问）。默认为 true，因为圆形进度通常显示中心内容。',
      default: 'true',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '在环形中心显示格式化的值（如 "75%"）。isIndeterminate 为 true 或 children 提供自定义中心内容时忽略。',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description: '自定义值标签格式化函数；默认输出百分比字符串。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '环形中心显示的内容：百分比、图标或自定义内容。优先于 hasValueLabel。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '进度环直径（32px、48px、64px）。',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '进度填充的语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: '未知进度的旋转动画指示器。遵循 prefers-reduced-motion，减速播放动画。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '视觉禁用：环形与文本变灰。用于已取消或停用的操作。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式（外边距、定位）。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-circular-progress', visualProps: ['variant', 'size']},
      {className: 'astryx-circular-progress-track'},
      {className: 'astryx-circular-progress-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      '以圆环或弧线展示完成度的圆形进度指示器。适用于上传进度、分数展示、仪表盘度量，或水平空间有限的紧凑进度场景。作为 ProgressBar 的补充，用于径向布局。',
    bestPractices: [
      { guidance: true, description: '确定进度传 value；时长未知时设置 isIndeterminate。' },
      { guidance: true, description: '用 hasValueLabel 显示数值，或传 children 自定义中心内容：图标或短标签。' },
      { guidance: true, description: '始终提供 label，即使它默认视觉隐藏；屏幕阅读器需要它。' },
      { guidance: false, description: '用圆形进度承载长文本标签；改用 ProgressBar，它为标签和数值留有更多空间。' },
      { guidance: false, description: '用不确定进度的 CircularProgress 表示小的行内加载状态；行内指示器用 Spinner。' },
    ],
  },
  examples: [
    {
      label: '确定进度与值标签',
      code: '<CircularProgress value={75} label="Upload progress" hasValueLabel />',
    },
    {
      label: '不确定进度',
      code: '<CircularProgress isIndeterminate label="Loading..." />',
    },
    {
      label: '自定义值格式',
      code: '<CircularProgress value={3.2} max={5} label="Disk usage" hasValueLabel formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />',
    },
    {
      label: '禁用',
      code: '<CircularProgress value={30} label="Canceled" isDisabled hasValueLabel />',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'CircularProgress',
  displayName: 'Circular Progress',
  props: [
    {
      name: 'value',
      type: 'number',
      description: '当前值。当 isIndeterminate 为 true 时忽略。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'label',
      type: 'string',
      description: '屏幕阅读器的无障碍标签（必填）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签（仍保持无障碍可访问性）。默认为 true，因为圆形进度条通常显示中心内容。',
      default: 'true',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '在环形中心显示格式化的值（如 "75%"）。当 isIndeterminate 为 true 或提供了 children 自定义中心内容时忽略。',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description: '自定义值标签格式化函数；默认为百分比字符串。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在环形中心显示的内容：百分比、图标或自定义内容。优先于 hasValueLabel。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '进度环的直径（32px、48px、64px）。',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '进度填充的语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: '用于未知进度的旋转动画指示器。遵循 prefers-reduced-motion，减速播放动画。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '视觉禁用：环形和文本变灰。用于已取消或非活动的操作。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-circular-progress', visualProps: ['variant', 'size']},
      {className: 'astryx-circular-progress-track'},
      {className: 'astryx-circular-progress-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A circular progress indicator that shows completion as a ring or arc. Use it for upload progress, score displays, dashboard gauges, or compact progress where horizontal space is limited. Complements ProgressBar for radial layouts.',
    bestPractices: [
      { guidance: true, description: 'Pass a value for determinate progress; set isIndeterminate when the duration is unknown.' },
      { guidance: true, description: 'Show the value with hasValueLabel, or pass children for custom center content: an icon or short label.' },
      { guidance: true, description: 'Always provide a label, even though it is visually hidden by default; screen readers need it.' },
      { guidance: false, description: 'Use circular progress for long text labels; use ProgressBar instead, which has more room for label and value display.' },
      { guidance: false, description: 'Use an indeterminate CircularProgress for small inline loading states; Spinner is the inline indicator.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '以圆环弧线展示完成度的圆形/径向进度指示器。',
  usage: {
    description:
      '以圆环或弧线展示完成度的圆形进度指示器。适用于上传进度、分数展示、仪表盘度量，或水平空间有限的紧凑进度场景。作为 ProgressBar 的补充，用于径向布局。',
    bestPractices: [
      { guidance: true, description: '确定进度传 value；时长未知时设置 isIndeterminate。' },
      { guidance: true, description: '用 hasValueLabel 显示数值，或传 children 自定义中心内容：图标或短标签。' },
      { guidance: true, description: '始终提供 label，即使它默认视觉隐藏；屏幕阅读器需要它。' },
      { guidance: false, description: '用圆形进度承载长文本标签；改用 ProgressBar，它为标签和数值留有更多空间。' },
      { guidance: false, description: '用不确定进度的 CircularProgress 表示小的行内加载状态；行内指示器用 Spinner。' },
    ],
  },
  propDescriptions: {
    value: '当前值。不确定进度时忽略。',
    max: '最大值。',
    label: '屏幕阅读器的无障碍标签。',
    isLabelHidden: '视觉隐藏标签（仍保持可访问）。默认为 true。',
    hasValueLabel: '在环形中心显示格式化值（不确定进度或给了 children 时忽略）。',
    formatValueLabel: '自定义值标签格式化函数；默认百分比字符串。',
    children: '中心内容：百分比、图标或自定义。优先于 hasValueLabel。',
    size: '环形直径（32px、48px、64px）。',
    variant: '填充的语义颜色变体。',
    isIndeterminate: '未知进度的旋转动画指示器。',
    isDisabled: '视觉禁用：环形与文本变灰。',
    xstyle: '用于布局定制的 StyleX 样式。必须是 stylex.create() 值。',
  },
};
