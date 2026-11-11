// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useOverlay',
  displayName: 'useOverlay',
  group: 'Overlay',
  keywords: [
    'overlay',
    'scrim',
    'hover reveal',
    'focus-within',
    'quick view',
    'card actions',
    'media overlay',
    '覆盖层',
    '遮罩',
    '悬停显现',
    '卡片操作',
  ],
  params: [
    {
      name: 'options',
      type: 'UseOverlayOptions',
      description: '覆盖层配置。所有字段可选。',
      required: false,
    },
    {
      name: 'options.content',
      type: 'ReactNode',
      description:
        '渲染在遮罩内的内容。设置后 hook 会将其预渲染为 element 返回。',
      required: false,
    },
    {
      name: 'options.showOn',
      type: "'hover' | 'always' | 'focus' | 'hover-or-focus'",
      description:
        "可见性触发方式，由容器经 CSS 读取。'hover' 也在容器内聚焦时显现，照顾键盘用户；'hover-or-focus' 是它的别名。在触屏设备（hover: none）上，hover 覆盖层改为点按容器切换。",
      default: "'always'",
      required: false,
    },
    {
      name: 'options.isOpen',
      type: 'boolean',
      description:
        '受控可见性。设置后优先于 showOn 与触摸切换。',
      required: false,
    },
    {
      name: 'options.scrim',
      type: "'dark' | 'light' | false",
      description:
        '遮罩背景。false 渲染无遮罩背景的内容。',
      default: "'dark'",
      required: false,
    },
    {
      name: 'options.position',
      type: "'fill' | 'bottom' | 'top'",
      description:
        '遮罩位置：覆盖整个定位区域，或沿其底边/顶边呈条带。',
      default: "'fill'",
      required: false,
    },
    {
      name: 'options.align',
      type: "'start' | 'center' | 'end'",
      description: '内容在遮罩内的对齐方式。',
      default: "'end'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: '附加到容器元素。',
    },
    {
      name: 'containerProps',
      type: 'OverlayContainerProps',
      description:
        '展开到同一容器上：className 与 style 把它标记为覆盖层作用域（定位、裁剪）；在触屏设备的 hover 覆盖层上，onClick 与 onMouseUp 在点按时切换。',
    },
    {
      name: 'element',
      type: 'ReactElement | null',
      description:
        '带 options.content 的遮罩，在容器内渲染一次即可。未设置 content 时为 null。',
    },
    {
      name: 'renderOverlay',
      type: '(children: ReactNode) => ReactElement',
      description:
        '围绕传入的 children 渲染遮罩，适用于内容会变化或你自己挂载遮罩的情况。用它或 element，不要两者都用。',
    },
  ],
  usage: {
    description:
      "为你已渲染的容器（例如 Card 或自定义媒体框）添加覆盖层行为，而无需 Overlay 自带的包装元素。把 containerRef 与 containerProps 展开到容器上，然后在其中渲染一次 element（或 renderOverlay(children)）。遮罩绝对定位，因此覆盖最近的定位祖先：容器本身，或其内部某个定位区域（如图片区域）。可见性由容器的 :hover 与 :focus-within 经 CSS 驱动，因此 showOn 为 'hover' 时键盘用户把焦点移入容器即可显现内容。隐藏内容不可聚焦，因此容器在 Tab 顺序中需要在覆盖层内容之前有一个可聚焦元素。显现的遮罩会在其覆盖区域内接收指针输入，所以请把该元素放在遮罩之外，或使用 top/bottom 条带并把它留在条带未覆盖的部分。",
    bestPractices: [
      {
        guidance: true,
        description:
          "媒体卡片上的操作用 showOn 'hover'：它也会在容器内键盘聚焦时显现。",
      },
      {
        guidance: true,
        description:
          '在容器内、覆盖层内容之前放一个可聚焦元素（链接或卡片标题），这样 Tab 显现内容，下一个 Tab 到达它。',
      },
      {
        guidance: true,
        description:
          '还没有可附加的容器元素时，使用 Overlay 组件。',
      },
      {
        guidance: false,
        description:
          '不要把到达某个操作的唯一途径藏在悬停之后而前面没有任何可聚焦元素；键盘用户无法聚焦隐藏的内容。',
      },
    ],
  },
  relatedComponents: ['Overlay', 'Card', 'AspectRatio'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/Overlay',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为你已渲染的容器（Card、媒体框）添加覆盖层行为，无 Overlay 的包装元素。把 containerRef + containerProps 展开到容器上，在其中渲染一次 element / renderOverlay(children)。由容器 :hover/:focus-within 经 CSS 驱动；hover 模式也在键盘聚焦时显现。隐藏内容不可聚焦，因此要在它之前放一个可聚焦元素，且位于显现遮罩覆盖的区域之外（遮罩接收指针输入）。',
  paramDescriptions: {
    options: '覆盖层配置；所有字段可选。',
    'options.content':
      '遮罩内的内容；经预渲染作为 element 返回。',
    'options.showOn':
      "CSS 可见性触发。'hover' 也在 focus-within 时显现；'hover-or-focus' = 别名。触屏（hover: none）：hover 覆盖层点按切换。",
    'options.isOpen': '受控可见性；优先于 showOn + 触摸切换。',
    'options.scrim': '遮罩背景；false = 无背景。',
    'options.position': "遮罩位置：'fill'，或 'bottom' / 'top' 条带。",
    'options.align': '内容在遮罩内的对齐。',
  },
  returnDescriptions: {
    containerRef: '附加到容器。',
    containerProps:
      '展开到容器上：覆盖层作用域 className/style（定位、裁剪）+ 触屏设备 hover 覆盖层的点按切换处理器。',
    element:
      '带内容的遮罩，在容器内渲染一次；无内容时为 null。',
    renderOverlay:
      '(children) => 遮罩；用于动态内容或自行挂载遮罩。用它或 element。',
  },
  usage: {
    description:
      '在现有容器上添加覆盖层行为：展开 containerRef + containerProps，在其中渲染一次 element。遮罩覆盖最近的定位祖先。CSS :hover/:focus-within；hover 模式也在键盘聚焦时显现。在隐藏内容之前放一个可聚焦元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          "媒体卡片操作用 showOn 'hover'；也在键盘聚焦时显现。",
      },
      {
        guidance: true,
        description:
          '在覆盖层内容之前放一个可聚焦元素，Tab 显现它，下一个 Tab 到达它。',
      },
      {
        guidance: true,
        description: '没有可附加的容器时，使用 Overlay。',
      },
      {
        guidance: false,
        description:
          '不要把到达操作的唯一途径藏在悬停之后而前面没有任何可聚焦元素。',
      },
    ],
  },
};
