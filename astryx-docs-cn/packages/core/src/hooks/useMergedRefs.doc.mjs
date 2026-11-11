// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMergedRefs',
  displayName: 'useMergedRefs',
  keywords: [
    'ref',
    'refs',
    'merge',
    '合并',
    'forwardRef',
    'callback ref',
    'stable ref',
    '稳定 ref',
  ],
  params: [
    {
      name: 'refs',
      type: 'Array<Ref<T> | undefined>',
      description: '最多六个 ref，它们都应接收同一个元素。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<T>',
      description:
        '合并后的回调 ref，在任何输入 ref 变化之前保持稳定。',
    },
  ],
  usage: {
    description:
      '把多个对象 ref 或回调 ref 合并为一个稳定的回调 ref。当组件既要转发使用方的 ref 又要挂载内部 ref 时使用它。与在渲染期间调用 mergeRefs 不同，回调的标识在无关的重新渲染之间保持稳定，因此 React 不会分离再重新挂载元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '当一个元素必须同时接收转发的 ref 和一个或多个内部 ref 时，使用 useMergedRefs。',
      },
      {
        guidance: false,
        description:
          '不要在 JSX 的 ref prop 里直接调用 mergeRefs；那会在每次渲染创建新回调，迫使元素做不必要的分离与重挂载。',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'utility',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '把对象/回调 ref 合并为一个稳定的回调 ref。标识只在某个输入 ref 变化时改变，避免内联 mergeRefs 调用带来的分离/重挂载抖动。',
  paramDescriptions: {
    refs: '都应接收同一个元素的多个 ref。',
  },
  returnDescriptions: {
    ref: '稳定的合并回调 ref；只在某个输入 ref 变化时改变。',
  },
  usage: {
    description:
      '当一个元素需要转发使用方 ref 加内部 ref 时使用。让回调在无关的重新渲染之间保持稳定。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于转发 ref 加内部测量、聚焦或锚点 ref。',
      },
      {
        guidance: false,
        description:
          '不要在 JSX 里内联调用 mergeRefs；它会在每次渲染迫使 ref 分离/重挂载。',
      },
    ],
  },
};
