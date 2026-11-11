// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Placeholder',
    required: true,
    description: '在内容加载期间顶替内容显示的绘制形状。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Skeleton',
  displayName: 'Skeleton',
  category: 'Feedback & Status',
  keywords: ['skeleton', 'placeholder', 'loading', '骨架屏', '占位', '加载', '微光', 'pulse', 'loader'],
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: '像素宽度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: '像素高度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'",
      description: '使用设计令牌刻度的边框圆角。none 表示直角，rounded 表示完全圆角（头像、药丸形、圆形）。',
      default: '3',
    },
    {
      name: 'index',
      type: 'number',
      description:
        '交错动画时序的索引。对于索引为 n 的元素，动画在 DELAY_TIME + (STAGGER_TIME × n) 时开始。',
      default: '0',
    },
  ],
  playground: {
    // Skeleton width/height default to '100%', which collapses to a zero-size
    // (invisible) element in the properties-tab preview. Give the example
    // explicit pixel dimensions so the shimmer placeholder is visible.
    defaults: {
      width: 320,
      height: 80,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-skeleton'},
    ],
  },
  usage: {
    anatomy,
    description:
      '加载时预览内容形状的动画微光占位符。用它构建与真实内容布局一致的加载画面。尺寸未知的内容请改用 Spinner。',
    bestPractices: [
      {guidance: true, description: '让占位符匹配所加载内容的尺寸与形状，营造真实感。'},
      {guidance: true, description: '用 `index` prop 交错多个骨架，形成自然的波浪动画。'},
      {guidance: false, description: '内容尺寸未知时不要用；请改用 Spinner。'},
      {guidance: false, description: '不要在同一内容区域同时叠加 Spinner；选定一种加载模式。'},
      {guidance: false, description: '不要无限期显示骨架；加载过久时应改为错误或空态。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Skeleton',
  displayName: 'Skeleton',
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: '像素宽度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: '像素高度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'",
      description: '使用设计令牌的边框圆角。使用 none 表示直角，rounded 表示完全圆角（头像、药丸形、圆形）。',
      default: '3',
    },
    {
      name: 'index',
      type: 'number',
      description:
        '交错动画时序的索引。对于索引为 n 的元素，动画在 DELAY_TIME + (STAGGER_TIME × n) 时开始。',
      default: '0',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-skeleton'},
    ],
  },
  usage: {
    anatomy,
    description:
      'An animated shimmer placeholder that previews the shape of content while it loads. Use it to build loading screens that match the layout of the real content. For content with unknown dimensions, use Spinner instead.',
    bestPractices: [
      {guidance: true, description: 'Match the size and shape of the content being loaded to create a realistic placeholder.'},
      {guidance: true, description: 'Stagger multiple skeletons with the `index` prop for a natural wave animation.'},
      {guidance: false, description: 'Use when the content dimensions are unknown; use Spinner instead.'},
      {guidance: false, description: 'Combine with a Spinner on the same content area; pick one loading pattern.'},
      {guidance: false, description: 'Show skeletons indefinitely; if loading takes too long, show an error or empty state instead.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    anatomy,
    description:
      '加载时预览内容形状的动画微光占位符。用它构建与真实内容布局一致的加载画面。尺寸未知的内容请改用 Spinner。',
    bestPractices: [
      {guidance: true, description: '让占位符匹配所加载内容的尺寸与形状。'},
      {guidance: true, description: '用 `index` prop 交错多个骨架，形成自然的波浪动画。'},
      {guidance: false, description: '内容尺寸未知时不要用；请改用 Spinner。'},
      {guidance: false, description: '不要在同一内容区域同时叠加 Spinner；选定一种加载模式。'},
      {guidance: false, description: '不要无限期显示骨架；加载过久时改为错误或空态。'},
    ],
  },
  propDescriptions: {
    width: '像素宽度（数字）或 CSS 值（字符串）。',
    height: '像素高度（数字）或 CSS 值（字符串）。',
    radius: '使用设计令牌的边框圆角。none 直角，0-4 刻度，rounded 药丸形。',
    index: '交错动画时序的索引。索引为 n 的元素在 DELAY_TIME + (STAGGER_TIME × n) 时开始。',
  },
};
