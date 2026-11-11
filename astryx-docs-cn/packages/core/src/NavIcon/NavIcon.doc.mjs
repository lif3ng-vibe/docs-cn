// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Container',
    required: true,
    description: '容纳所给图标的圆形着色容器。',
  },
  {
    name: 'Icon',
    required: true,
    description:
      '由调用方提供、渲染在容器内的视觉内容。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'NavIcon',
  displayName: 'Nav Icon',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  hidden: false,
  keywords: [
    'navicon',
    'iconbutton',
    'toolbar icon',
    'appbar icon',
    'nav button',
    '导航图标',
  ],
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '在圆形背景内渲染的图标元素。应为 Icon 或类似的图标组件。',
      required: true,
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  theming: {
    targets: [{className: 'astryx-nav-icon'}],
  },
  usage: {
    anatomy,
    description:
      'NavIcon 是一个带强调色背景的圆形图标容器。用于 TopNavHeading 与 PageNavHeader 等导航头部，以视觉方式标识某个分区或应用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在导航头部使用，为分区提供可识别的视觉锚点。',
      },
      {
        guidance: true,
        description:
          '传 Icon 或尺寸相近的图标组件，保证比例正确。',
      },
      {
        guidance: false,
        description:
          '不要把 NavIcon 用于交互；它是纯展示容器，不是按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'NavIcon',
  displayName: 'Nav Icon',
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description: '在圆形背景内渲染的图标元素。应为 Icon 或类似的图标组件。',
      required: true,
    },
  ],
  theming: {
    targets: [{className: 'astryx-nav-icon'}],
  },
  usage: {
    anatomy,
    description:
      'NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use in navigation headers to provide a recognizable visual anchor for the section.',
      },
      {
        guidance: true,
        description:
          'Pass an Icon or similarly sized icon component to ensure proper proportions.',
      },
      {
        guidance: false,
        description:
          'Use NavIcon for interactive purposes; it is a display-only container, not a button.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带强调色背景的圆形图标容器，用于导航头部。',
  usage: {
    anatomy,
    description:
      'NavIcon 是一个带强调色背景的圆形图标容器。用于 TopNavHeading 与 PageNavHeader 等导航头部，以视觉方式标识某个分区或应用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在导航头部使用，为分区提供可识别的视觉锚点。',
      },
      {
        guidance: true,
        description:
          '传 Icon 或尺寸相近的图标组件，保证比例正确。',
      },
      {
        guidance: false,
        description:
          '不要把 NavIcon 用于交互；它是纯展示容器，不是按钮。',
      },
    ],
  },
  propDescriptions: {
    icon: '圆形背景内的图标元素。应为 Icon 或类似组件。',
  },
};
