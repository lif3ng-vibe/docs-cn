// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useEntryAnimation',
  displayName: 'useEntryAnimation',
  keywords: ['animation', 'entry', 'mount', 'transition', 'slide', 'fade', 'scale', 'motion', 'stylex', '入场动画', '过渡'],
  params: [
    {
      name: 'preset',
      type: "'slideDown' | 'slideUp' | 'fadeIn' | 'scaleIn'",
      description: '挂载时应用的动画预设。',
      default: "'slideDown'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'entryStyle',
      type: 'StyleXStyles | null',
      description: '入场动画的 StyleX 样式对象；元素在页面初始渲染或从服务端 HTML 水合时为 null (无需动画)。',
    },
  ],
  usage: {
    description:
      '返回用于挂载时动画元素的 StyleX 样式。仅在元素于首屏绘制后被动态插入时才动画；页面加载时渲染的元素不做动画。使用 Astryx 动效令牌 (duration、easing) 保持动画时序一致。服务端渲染的元素水合时无入场样式、从不动画；水合后挂载的元素会动画。',
    bestPractices: [
      { guidance: true, description: '用于条件渲染的元素，如校验消息、toast 或展开区块。' },
      { guidance: true, description: '把返回的样式与其他样式一起传入 stylex.props()。' },
      { guidance: false, description: '首屏就应可见的元素不要用它；它们不会动画。' },
    ],
  },
  relatedComponents: ['FieldStatus'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '返回挂载时动画元素的 StyleX 样式。仅在元素于首屏绘制后被动态插入时动画；页面加载时渲染的元素不动画。使用 Astryx 动效令牌 (duration、easing) 保持时序一致。服务端渲染元素水合时无入场样式、从不动画；水合后挂载的元素会动画。',
  paramDescriptions: {
    preset: '挂载时应用的动画预设。',
  },
  returnDescriptions: {
    entryStyle: '入场动画的 StyleX 样式对象 / 元素首屏渲染时为 null (无需动画)。',
  },
  usage: {
    description:
      '返回挂载时动画元素的 StyleX 样式。仅动态插入时动画。使用 Astryx 动效令牌 (duration、easing) 保持时序一致。服务端渲染元素水合时无入场样式、从不动画；水合后挂载的元素会动画。',
    bestPractices: [
      { guidance: true, description: '用于条件渲染元素，如校验消息、toast、展开区块。' },
      { guidance: true, description: '把返回样式与其他样式一起传入 stylex.props()。' },
      { guidance: false, description: '首屏就应可见的元素不要用；它们不会动画。' },
    ],
  },
};
