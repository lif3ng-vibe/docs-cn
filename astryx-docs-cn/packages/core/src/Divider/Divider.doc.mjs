// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Divider group',
    required: true,
    description:
      '围绕可选标签排布一条或两条线段的分隔线组。',
  },
  {
    name: 'Rule',
    required: true,
    description:
      '绘制的线段；存在标签时会渲染第二条线段。',
  },
  {
    name: 'Label',
    required: false,
    description: '显示在两条线段之间的可选内容。',
  },
];



/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Divider',
  displayName: 'Divider',
  category: 'Layout',
  keywords: ["divider","separator","hr","rule","分隔线","分隔符","线条","边框","间距","水平分割线"],
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '分隔线的方向。',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '居中显示在分隔线上的可选标签。数字 0 会保留；null、布尔值和空字符串不渲染标签。',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: '分隔线的视觉粗细。',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description:
        '通过负边距将分隔线延伸至容器边缘。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-divider', visualProps: ['orientation', 'variant']},
    ],
  },
  usage: {
    anatomy,
    description: '一种将内容划分为不同区域的视觉分隔线。用于在相关内容组之间创建清晰边界，或在布局中划定交互区域。',
    bestPractices: [
      { guidance: true, description: '相关内容区块之间使用 subtle 分隔线，需要高对比度边界时使用 strong 分隔线。' },
      { guidance: true, description: '当区块需要可见的类别标题时，为分隔线添加标签。' },
      { guidance: false, description: '过度使用分隔线；可能时依靠间距和布局来区分内容。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Divider',
  displayName: 'Divider',
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '分隔线的方向。',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '居中显示在分隔线上的可选标签。数字 0 会保留；null、布尔值和空字符串不渲染标签。',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: '分隔线的视觉粗细。',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description: '通过负边距将分隔线延伸至容器边缘。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-divider', visualProps: ['orientation', 'variant']},
    ],
  },
  usage: {
    anatomy,
    description: 'A visual separator that divides content into distinct sections. Use to create clear boundaries between groups of related content, or to demarcate interactive regions within a layout.',
    bestPractices: [
      { guidance: true, description: 'Use subtle dividers between related content sections and strong dividers for high-contrast boundaries.' },
      { guidance: true, description: 'Add a label to the divider when sections need a visible category heading.' },
      { guidance: false, description: 'Overuse dividers; rely on spacing and layout to separate content when possible.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '带可选标签的视觉分隔线，使用 Astryx 设计令牌',
  usage: {
    anatomy,
    description: '将内容划分为不同区域的视觉分隔线。用于在相关内容组之间创建清晰边界，或在布局中划定交互区域。',
    bestPractices: [
      { guidance: true, description: '相关内容区块之间使用 subtle 分隔线，需要高对比度边界时使用 strong 分隔线。' },
      { guidance: true, description: '当区块需要可见的类别标题时，为分隔线添加标签。' },
      { guidance: false, description: '过度使用分隔线；可能时依靠间距和布局来区分内容。' },
    ],
  },
  propDescriptions: {
    orientation: '分隔线方向',
    label: '可选的居中标签；保留数字 0；null/布尔值/"" 不渲染',
    variant: '分隔线的视觉粗细',
    isFullBleed: '通过负边距延伸至容器边缘',
    xstyle: '布局用 StyleX 样式；必须是 stylex.create() 的值',
  },
};
