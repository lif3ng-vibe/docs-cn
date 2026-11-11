// Copyright (c) Meta Platforms, Inc. and affiliates.



/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Blockquote',
  displayName: 'Blockquote',
  category: 'Content',
  keywords: ["blockquote","引用","出处","拉引","引文","cite","摘录"],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '引用块的内容。',
      required: true,
    },
    {
      name: 'cite',
      type: 'ReactNode',
      description: '引用的可选出处。在引用内容之后以 <cite> 元素渲染。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      children:
        '设计不只是外观和感觉，设计在于它如何运作。',
      cite: 'Steve Jobs',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-blockquote', visualProps: []},
    ],
  },
  usage: {
    description: '带有行首边框和次要文本颜色的引用块。用于突出显示引用内容、推荐语或摘录。边框和内边距使用逻辑属性，因此在从右到左的语言环境中会移到右侧。',
    anatomy: [
      {name: 'Rule', required: true, description: '行首边缘的边框，使用 --color-border-emphasized 绘制。'},
      {name: 'Quotation', required: true, description: '通过 children 传入的引用内容，渲染在 <blockquote> 元素内。'},
      {name: 'Attribution', required: false, description: '通过 cite 传入的来源，在引用内容下方以 <cite> 元素渲染。'},
    ],
    bestPractices: [
      { guidance: true, description: '用于引用文本、推荐语或来自外部来源的高亮摘录。' },
      { guidance: true, description: '引用来源已知时提供 cite prop。' },
      { guidance: true, description: '通过 cite 传入来源，而不是写在 children 里，这样它会渲染为语义化的 <cite> 元素，辅助技术可以将其与引用内容区分开。' },
      { guidance: false, description: '不要用于提示框或信息说明；那些场景应使用 Banner。' },
      { guidance: false, description: '不要自行用 <footer> 包裹出处。<blockquote> 内的 <footer> 会成为 contentinfo 文档地标，页面上有多个引用时就会报告多个页脚。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Blockquote',
  displayName: 'Blockquote',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '引用块的内容。',
      required: true,
    },
    {
      name: 'cite',
      type: 'ReactNode',
      description: '引用的可选出处。在引用内容之后以 <cite> 元素渲染。',
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
      {className: 'astryx-blockquote', visualProps: []},
    ],
  },
  usage: {
    description: '带有行首边框和次要文本颜色的引用块。用于突出显示引用内容、推荐语或摘录。边框和内边距使用逻辑属性，因此在从右到左的语言环境中会移到右侧。',
    anatomy: [
      {name: '边框', required: true, description: '行首边缘的边框，使用 --color-border-emphasized 绘制。'},
      {name: '引用内容', required: true, description: '通过 children 传入的引用内容，渲染在 <blockquote> 元素内。'},
      {name: '出处', required: false, description: '通过 cite 传入的来源，在引用内容下方以 <cite> 元素渲染。'},
    ],
    bestPractices: [
      { guidance: true, description: '用于引用文本、推荐语或来自外部来源的高亮摘录。' },
      { guidance: true, description: '当引用来源已知时，提供 cite 属性。' },
      { guidance: true, description: '通过 cite 传入来源，而不是写在 children 里，这样它会渲染为语义化的 <cite> 元素，辅助技术可以将其与引用内容区分开。' },
      { guidance: false, description: '用于提示框或信息说明，应使用 Banner。' },
      { guidance: false, description: '自行用 <footer> 包裹出处。<blockquote> 内的 <footer> 会成为 contentinfo 文档地标，页面上有多个引用时就会报告多个页脚。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '引用块：行首边框、次要文本颜色、可选出处',
  usage: {
    description: '带有行首边框和次要文本颜色的引用块。用于突出显示引用内容、推荐语或摘录。',
    bestPractices: [
      { guidance: true, description: '用于引用文本、推荐语或高亮摘录。' },
      { guidance: true, description: '来源已知时提供 cite。' },
      { guidance: true, description: '来源经 cite 传入，不放 children。' },
      { guidance: false, description: '不要用于提示/说明；改用 Banner。' },
      { guidance: false, description: '不要用 <footer> 包裹出处；它会成为 contentinfo 地标。' },
    ],
  },
  propDescriptions: {
    children: '引用块内容',
    cite: '可选出处，在引用内容后以 <cite> 渲染',
    xstyle: '布局用 StyleX 样式；必须是 stylex.create() 的值',
  },
};
