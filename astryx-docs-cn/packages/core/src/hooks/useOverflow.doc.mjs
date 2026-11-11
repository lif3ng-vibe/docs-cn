// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useOverflow',
  displayName: 'useOverflow',
  keywords: [
    'overflow',
    '溢出',
    'truncate',
    '截断',
    'responsive',
    '响应式',
    'collapse',
    '折叠',
    'resize',
    'measure',
    '测量',
    'hidden',
    'more',
    'breadcrumb',
  ],
  params: [
    {
      name: 'itemCount',
      type: 'number',
      description: '要为溢出测量的项总数。',
      required: true,
    },
    {
      name: 'options',
      type: 'UseOverflowOptions',
      description: '溢出行为的配置对象。',
      required: false,
    },
    {
      name: 'options.gap',
      type: 'number',
      description: '项之间的间距（像素）。用于宽度计算。',
      default: '0',
      required: false,
    },
    {
      name: 'options.minVisibleItems',
      type: 'number',
      description:
        "始终显示的最少项数，即使放不下也显示。",
      default: '0',
      required: false,
    },
    {
      name: 'options.collapseFrom',
      type: "'start' | 'end'",
      description: '从哪一端折叠项。',
      default: "'end'",
      required: false,
    },
    {
      name: 'options.behavior',
      type: "'observeParent' | 'observeSelf'",
      description:
        "为溢出计算观察哪个元素。'observeParent' 使用容器的父元素宽度，使可见容器保持内容尺寸。",
      default: "'observeSelf'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'containerRef',
      type: 'React.RefCallback<HTMLElement>',
      description: '挂到可见容器元素上的 ref 回调。',
    },
    {
      name: 'measureRef',
      type: 'React.RefCallback<HTMLElement>',
      description:
        '挂到承载所有项的隐藏测量容器上的 ref 回调。',
    },
    {
      name: 'visibleCount',
      type: 'number',
      description: '能放进可见容器的项数。',
    },
    {
      name: 'hasOverflow',
      type: 'boolean',
      description:
        '是否有项溢出（visibleCount < itemCount）。',
    },
  ],
  usage: {
    description:
      '在隐藏容器中测量子元素，在不闪烁的前提下确定有多少项能放进可用宽度。使用 ResizeObserver 响应容器与被测子元素的尺寸变化。测量容器应承载所有项，外加一个可选的溢出指示元素（通过 data-overflow-indicator 属性标识）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把所有项渲染进 measureRef 容器（隐藏），只把前 visibleCount 个项渲染进 containerRef 容器（可见）。',
      },
      {
        guidance: true,
        description:
          '在测量容器的最后一个子元素放一个溢出指示器（如 "+N more" 按钮），并带 data-overflow-indicator 属性。',
      },
      {
        guidance: false,
        description:
          '不要用于垂直溢出；本 hook 只测量水平宽度。',
      },
    ],
  },
  relatedComponents: ['OverflowList', 'Breadcrumb'],
  relatedHooks: ['useScrollOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '在隐藏容器中测量子元素，在不闪烁的前提下确定多少项能放进可用宽度。使用 ResizeObserver 响应容器与被测子元素的尺寸变化。测量容器应承载所有项，外加可选的溢出指示元素（通过 data-overflow-indicator 属性标识）。',
  paramDescriptions: {
    itemCount: '要为溢出测量的项总数。',
    options: '溢出行为的配置。',
    'options.gap': '项间距（px）。用于宽度计算。',
    'options.minVisibleItems':
      "始终显示的最少项数，即使放不下。",
    'options.collapseFrom': '从哪一端折叠项。',
    'options.behavior':
      "为溢出计算观察哪个元素。'observeParent' 使用容器父元素宽度，使可见容器保持内容尺寸。",
  },
  returnDescriptions: {
    containerRef: '可见容器元素的 ref 回调。',
    measureRef:
      '承载所有项的隐藏测量容器的 ref 回调。',
    visibleCount: '能放进可见容器的项数。',
    hasOverflow: '是否有项溢出（visibleCount < itemCount）。',
  },
  usage: {
    description:
      '在隐藏容器中测量子元素，在不闪烁的前提下确定多少项能放进可用宽度。使用 ResizeObserver 响应容器与被测子元素的尺寸变化。测量容器应承载所有项，外加可选的溢出指示元素（通过 data-overflow-indicator 属性标识）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把所有项渲染进 measureRef 容器（隐藏），只把前 visibleCount 个项渲染进 containerRef 容器（可见）。',
      },
      {
        guidance: true,
        description:
          '在测量容器最后一个子元素放溢出指示器（如 "+N more" 按钮），带 data-overflow-indicator 属性。',
      },
      {
        guidance: false,
        description:
          '不要用于垂直溢出；本 hook 只测量水平宽度。',
      },
    ],
  },
};
