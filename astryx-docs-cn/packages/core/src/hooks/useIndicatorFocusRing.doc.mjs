// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useIndicatorFocusRing',
  displayName: 'useIndicatorFocusRing',
  keywords: [
    'focus ring',
    '焦点环',
    'focus',
    'focus-visible',
    'outline',
    'indicator',
    'checkbox',
    'radio',
    '视觉隐藏输入',
    'keyboard',
    '键盘',
    'accessibility',
    'a11y',
    'wcag',
  ],
  params: [
    {
      name: 'containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '指向仅包裹指示器元素的 ref，这样其唯一的子元素就明确无误地是绘制焦点环的对象。',
      required: true,
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '跳过焦点环；禁用控件不可聚焦。',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'focusProps',
      type: '{onFocus: (event: FocusEvent<HTMLElement>) => void; onBlur: () => void}',
      description: '展开到持有可聚焦 input 的元素上。',
    },
  ],
  usage: {
    description:
      '为真实 input 在视觉上隐藏的控件在指示器上绘制标准焦点环；checkbox 或 radio 聚焦的是一个 opacity-0 的 input，因此焦点环必须出现在其旁边的图形上。焦点环以命令式绘制在指示器自身的元素上——这是唯一能用自身 border-radius 塑形焦点环的元素——且仅在 :focus-visible 时绘制，因此指针点击不会触发。由本 hook 负责绘制，意味着主题提供的指示器无法通过忽略某个 prop 就交付一个没有可见焦点的控件（WCAG 2.4.7）。',
    bestPractices: [
      {
        guidance: true,
        description:
          "ref 指向的元素只包裹指示器；包住标签文本的容器会让整行都画出焦点环。",
      },
      {
        guidance: true,
        description:
          '把 focusProps 展开到包含隐藏 input 的元素上，而不是 input 本身。',
      },
      {
        guidance: false,
        description:
          '不要让可主题化的指示器自行绘制焦点环；忽略该 prop 的替换实现会让控件失去可见焦点。',
      },
    ],
  },
  relatedComponents: ['CheckboxInput', 'RadioList', 'Selector'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为真实 input 在视觉上隐藏的控件（checkbox / radio）在指示器上绘制标准焦点环。以命令式绘制在指示器元素上（唯一能用自身 border-radius 塑形焦点环的元素），且仅在 :focus-visible 时绘制。',
  paramDescriptions: {
    containerRef:
      '指向仅包裹指示器的元素的 ref；其唯一的子元素获得焦点环。',
    isDisabled: '跳过焦点环；禁用控件不可聚焦。',
  },
  returnDescriptions: {
    focusProps:
      'onFocus / onBlur，展开到持有可聚焦 input 的元素上。',
  },
  usage: {
    description:
      '由 hook 负责绘制焦点环，主题提供的指示器无法交付没有可见焦点的控件（WCAG 2.4.7）。',
    bestPractices: [
      {
        guidance: true,
        description:
          "ref 指向的元素只包裹指示器；包住标签文本的容器会让整行都画出焦点环。",
      },
      {
        guidance: true,
        description:
          '把 focusProps 展开到包含隐藏 input 的元素上，而不是 input。',
      },
      {
        guidance: false,
        description:
          '不要把焦点环委托给可主题化的指示器；忽略它的替换实现会失去可见焦点。',
      },
    ],
  },
};
