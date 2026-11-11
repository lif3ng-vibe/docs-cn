// Copyright (c) Meta Platforms, Inc. and affiliates.



/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'VisuallyHidden',
  displayName: 'VisuallyHidden',
  category: 'Utility',
  keywords: ["visually hidden","sr-only","screen reader","accessibility","a11y","aria-live","hidden label","assistive technology","视觉隐藏“,”屏幕阅读器“,”无障碍"],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '对辅助技术公开、但对视觉隐藏的内容。',
    },
    {
      name: 'as',
      type: 'ElementType',
      description: '要渲染的 HTML 标签。实时区域请使用块级元素。',
      default: "'span'",
    },
  ],
  usage: {
    description: '在无障碍树中呈现内容的同时将其视觉隐藏。用于纯图标控件的无障碍名称、aria-live 播报区域，以及补充的屏幕阅读器上下文。有意不提供样式 prop——其全部意义就在于不可见。`xstyle` 仍被接受但被忽略，仅为让面向 0.7.2 编写的代码继续编译；计划中的次版本会移除它。',
    bestPractices: [
      { guidance: true, description: '用以为纯图标按钮和控件提供屏幕阅读器播报的无障碍名称。' },
      { guidance: true, description: '以块级元素 (as="div") 渲染并搭配 aria-live，播报拖放或结果计数等动态更新。' },
      { guidance: false, description: '不要用它对所有人隐藏内容；内容仍留在无障碍树中；要彻底移除内容请用条件渲染或 `hidden`。' },
      { guidance: false, description: '不要在其中放置可交互控件；内容不可见、也无法接收指针输入。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'VisuallyHidden',
  displayName: 'VisuallyHidden',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '对辅助技术公开但对视觉隐藏的内容。',
    },
    {
      name: 'as',
      type: 'ElementType',
      description: '要渲染的 HTML 标签。实时区域请使用块级元素。',
      default: "'span'",
    },
  ],
  usage: {
    description: 'Renders content in the accessibility tree while hiding it visually. Use for accessible names on icon-only controls, aria-live announcement regions, and supplementary screen-reader context.',
    bestPractices: [
      { guidance: true, description: 'Use to give icon-only buttons and controls an accessible name that screen readers announce.' },
      { guidance: true, description: 'Render as a block element (as="div") with aria-live to announce dynamic updates like drag-and-drop or result counts.' },
      { guidance: false, description: 'Use it to hide content from everyone; it stays in the accessibility tree; use conditional rendering or `hidden` to remove content entirely.' },
      { guidance: false, description: 'Put interactive controls inside it; the content is not visible and cannot receive pointer input.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '在无障碍树中呈现内容同时视觉隐藏 (sr-only)',
  usage: {
    description: '在无障碍树中呈现内容同时视觉隐藏。用于纯图标控件的无障碍名称、aria-live 播报区域与补充的屏幕阅读器上下文。',
    bestPractices: [
      { guidance: true, description: '用以为纯图标按钮和控件提供屏幕阅读器播报的无障碍名称。' },
      { guidance: true, description: '以块级元素 (as="div") 渲染并搭配 aria-live，播报拖放或结果计数等动态更新。' },
      { guidance: false, description: '不要用它对所有人隐藏内容；内容仍留在无障碍树中；彻底移除请用条件渲染或 `hidden`。' },
      { guidance: false, description: '不要在其中放置可交互控件；内容不可见、也无法接收指针输入。' },
    ],
  },
  propDescriptions: {
    children: '视觉隐藏的同时对辅助技术 (AT) 公开的内容',
    as: '要渲染的 HTML 标签；实时区域用块级元素',
  },
};
