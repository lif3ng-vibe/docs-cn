// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLightbox',
  displayName: 'useLightbox',
  group: 'Lightbox',
  keywords: [
    'lightbox',
    '灯箱',
    '画廊',
    '查看器',
    '图片',
    '视频',
    '媒体',
    '模态',
    '覆盖层',
    '触发器',
  ],
  params: [
    {
      name: 'options',
      type: 'UseLightboxOptions',
      description: '灯箱的配置选项。',
      required: true,
    },
    {
      name: 'options.media',
      type: 'LightboxMedia | LightboxMedia[]',
      description:
        '灯箱中显示的媒体。单项传入单个对象，画廊模式传入数组。',
      required: true,
    },
    {
      name: 'options.hasZoom',
      type: 'boolean',
      description:
        '启用双击或键盘 Enter/Space+/- 缩放（仅图片）。放大后拖动或用方向键平移。',
      default: 'false',
      required: false,
    },
    {
      name: 'options.hasAutoPlay',
      type: 'boolean',
      description: '灯箱打开时视频是否自动播放。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'open',
      type: '(index?: number) => void',
      description:
        '打开灯箱，可指定画廊索引（默认为 0）。',
    },
    {
      name: 'close',
      type: '() => void',
      description: '关闭灯箱。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '灯箱当前是否打开。',
    },
    {
      name: 'index',
      type: 'number',
      description: '当前画廊索引。',
    },
    {
      name: 'element',
      type: 'ReactNode',
      description:
        '预接线的 Lightbox 组件元素，渲染到你的 JSX 树中。',
    },
    {
      name: 'triggerProps',
      type: "{role: 'button', tabIndex: 0, 'aria-haspopup': 'dialog', onClick: () => void, onKeyDown: (e: React.KeyboardEvent) => void}",
      description:
        '展开到单个触发器元素上的 props：点击、Enter 或 Space 时在索引 0 打开灯箱。',
    },
    {
      name: 'getTriggerProps',
      type: "(index: number) => {role: 'button', tabIndex: 0, 'aria-haspopup': 'dialog', onClick: () => void, onKeyDown: (e: React.KeyboardEvent) => void}",
      description:
        '返回触发器 props，展开到元素上后可在点击、Enter 或 Space 时以指定画廊索引打开灯箱。',
    },
  ],
  usage: {
    description:
      'Lightbox 的状态管理与无障碍触发器接线。省去管理打开状态与当前索引的样板代码。返回带 button 角色、tabIndex={0}、aria-haspopup="dialog" 与键盘激活处理器的触发器 props，以及一个预接线的 Lightbox 元素——它负责关闭、上一张/下一张导航与焦点恢复。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 getTriggerProps(index) 展开到图片或缩略图元素上，赋予它们可访问的按钮语义与键盘激活能力。',
      },
      {
        guidance: true,
        description:
          '在组件 JSX 树中与触发器一起渲染一次 lightbox.element。',
      },
      {
        guidance: false,
        description:
          '不要在 useLightbox 之外再单独管理 isOpen 或 index 状态；hook 已同时跟踪两者。',
      },
      {
        guidance: false,
        description:
          '使用 triggerProps 或 getTriggerProps 时，不要再添加自定义 click 或 keydown 处理器来打开灯箱。',
      },
    ],
  },
  relatedComponents: ['Lightbox', 'Grid', 'Thumbnail'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/Lightbox',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Lightbox 的状态管理与无障碍触发器接线。省去打开状态与索引的样板代码。返回触发器 props 与预接线的 Lightbox 元素。',
  paramDescriptions: {
    options: '灯箱的配置选项。',
    'options.media':
      '要显示的媒体（单项或画廊模式的数组）。',
    'options.hasZoom':
      '启用双击或 Enter/Space+/- 缩放（仅图片）。',
    'options.hasAutoPlay': '打开时视频是否自动播放。',
  },
  returnDescriptions: {
    open: '打开灯箱，可指定画廊索引。',
    close: '关闭灯箱。',
    isOpen: '灯箱当前是否打开。',
    index: '当前画廊索引。',
    element: '预接线的 Lightbox 元素，渲染到 JSX 树中。',
    triggerProps:
      '展开到单个触发器元素上的触发器属性。',
    getTriggerProps:
      '(index) => props：返回在指定索引处响应点击、Enter 或 Space 打开的触发器属性。',
  },
  usage: {
    description:
      'Lightbox 的状态管理与触发器接线。返回触发器 props 与预接线元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 getTriggerProps(index) 展开到图片元素上，获得无障碍按钮语义。',
      },
      {
        guidance: true,
        description:
          '在 JSX 中与触发器一起渲染一次 lightbox.element。',
      },
      {
        guidance: false,
        description:
          '不要在 useLightbox 之外再单独管理 isOpen 或 index 状态。',
      },
    ],
  },
};

