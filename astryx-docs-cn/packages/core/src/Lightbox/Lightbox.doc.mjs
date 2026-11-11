// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Viewer overlay',
    required: true,
    description:
      '包含当前媒体与控件的全视口对话框覆盖层。',
  },
  {
    name: 'Media',
    required: true,
    description: '查看器中呈现的当前图片或视频。',
  },
  {
    name: 'Close button',
    required: true,
    description: '关闭查看器的按钮。',
  },
  {
    name: 'Previous button',
    required: false,
    description: '切换到上一媒体项的画廊按钮。',
  },
  {
    name: 'Next button',
    required: false,
    description: '切换到下一媒体项的画廊按钮。',
  },
  {
    name: 'Caption',
    required: false,
    description: '由调用方提供、显示在当前媒体下方的 caption。',
  },
  {
    name: 'Counter',
    required: false,
    description: '画廊模式下显示的当前位置与总数。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  category: 'Overlay',
  keywords: [
    'lightbox',
    '灯箱',
    '图片',
    '视频',
    '查看器',
    '画廊',
    '缩放',
    '全屏',
    '媒体',
    '照片',
    '预览',
  ],
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '灯箱是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '灯箱打开状态变化时的回调：关闭按钮、Esc 键、点按媒体旁空白处，或在手机或平板上从适合大小向下拖动照片。',
      required: true,
    },
    {
      name: 'media',
      // Left as the named type on purpose: the shape carries `caption?:
      // ReactNode`, so spelling it out makes the docsite playground parse the
      // whole prop as an editable *string*, which would feed the preview text
      // where a media object belongs. The shape and its legal values live in
      // the description instead (#1645).
      type: 'LightboxMedia | LightboxMedia[]',
      description:
        "要显示的媒体。单项传入单个对象，画廊模式传入数组并带上一张/下一张导航（在手机或平板上，滑动也可在项之间切换）。每项为 {src: string, alt: string, caption?: ReactNode, type?: 'image' | 'video'}；type 默认为 'image'，'video' 禁用缩放/平移。",
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: '画廊模式下的当前索引（media 为数组时）。',
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description:
        '画廊索引变化时的回调：上一张/下一张、方向键或滑动。',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description:
        '启用缩放（仅图片）：双指捏合（或 ctrl+滚轮），或双击/双点按在该处放大并还原；Enter/Space/+/- 围绕中心放大 2 倍并还原，0 恢复到适合大小。放大后可拖动、滚动触控板或用方向键平移；在手机或平板上，平移带惯性。',
      default: 'false',
    },
    {
      name: 'defaultIndex',
      type: 'number',
      description:
        '非受控用法下画廊模式的初始图片索引。',
      default: '0',
    },
    {
      name: 'hasAutoPlay',
      type: 'boolean',
      description:
        '显示视频媒体项时自动开始播放。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-lightbox', visualProps: []}],
  },
  usage: {
    anatomy,
    description:
      '全屏覆盖层，用于以全分辨率查看图片与视频。支持单项与画廊模式（带上一张/下一张导航与滑动）、图片的可选缩放与平移，以及原生视频控件。',
    bestPractices: [
      {
        guidance: true,
        description:
          '为每张图片提供 alt 文本，保证屏幕阅读器无障碍。',
      },
      {
        guidance: true,
        description:
          '多图集合使用画廊模式，并配合 onIndexChange。',
      },
      {
        guidance: true,
        description:
          '仅在查看需要细致观察的高分辨率图片时启用 hasZoom。',
      },
      {
        guidance: false,
        description:
          '不要用灯箱展示图片和视频以外的内容；它一次只显示一个媒体项。',
      },
      {
        guidance: false,
        description:
          '不要在 caption 内嵌套交互内容；保持纯文本。',
      },
    ],
  },
  // The lightbox opens via showModal() and renders nothing while closed —
  // overlay mode gives the Properties preview an open trigger instead of an
  // empty stage, mirroring MobileNav (#3616).
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      media: {
        src: '/template-assets/light-scene-horizontal-1.png',
        alt: '海岸线与海浪',
        caption:
          '晴朗天空下，海浪拍打着沙滩的秀丽海岸线。',
      },
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '灯箱是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '灯箱打开状态变化时的回调：关闭按钮、Esc 键、点按媒体旁空白处，或在手机或平板上从适合大小向下拖动照片。',
      required: true,
    },
    {
      name: 'media',
      type: 'LightboxMedia | LightboxMedia[]',
      description:
        "要显示的媒体。传入单个对象或数组（用于画廊模式的上一张/下一张导航；在手机或平板上，滑动也可在各项之间切换）。每项为 {src, alt, caption?, type?: 'image' | 'video'}；type 默认为 'image'，'video' 禁用缩放/平移。",
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: '画廊模式中当前索引。',
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description: '通过上一张/下一张导航更改画廊索引时的回调。',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description:
        '启用缩放（仅图片）：双指捏合（或按住 Ctrl 滚动滚轮），或双点按、双击在该处放大并还原；Enter/Space/+/- 键以中心放大 2 倍并还原，0 键恢复到适合大小。缩放后可拖动或在触控板上滚动平移，或用方向键平移；在手机或平板上，平移带惯性。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-lightbox', visualProps: []}],
  },
  usage: {
    anatomy,
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation and swiping, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide alt text for every image for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Use gallery mode with onIndexChange for multi-image sets.',
      },
      {
        guidance: true,
        description:
          'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.',
      },
      {
        guidance: false,
        description:
          'Use the lightbox for content other than images and videos; it shows one media item at a time.',
      },
      {
        guidance: false,
        description:
          'Nest interactive content inside captions; keep them plain text.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '以全分辨率查看图片与视频的全屏覆盖层，带画廊导航与缩放。',
  usage: {
    anatomy,
    description:
      '全屏覆盖层，用于以全分辨率查看图片与视频。支持单项与画廊模式（带上一张/下一张导航与滑动）、图片的可选缩放与平移，以及原生视频控件。',
    bestPractices: [
      {guidance: true, description: '为每张图片提供 alt 文本。'},
      {
        guidance: true,
        description:
          '多图集合使用画廊模式，并配合 onIndexChange。',
      },
      {
        guidance: true,
        description:
          '仅在查看需要细致观察的高分辨率图片时启用 hasZoom。',
      },
      {
        guidance: false,
        description:
          '不要用于图片和视频以外的内容；一次只显示一个媒体项。',
      },
      {
        guidance: false,
        description:
          '不要在 caption 内嵌套交互内容；保持纯文本。',
      },
    ],
  },
  propDescriptions: {
    isOpen: '灯箱是否打开。',
    onOpenChange:
      '打开状态变化时的回调（包括照片被向下拖动）。',
    media: '单个媒体对象，或画廊模式的数组。',
    index: '画廊模式下的当前索引。',
    onIndexChange:
      '画廊索引变化时的回调（按钮、按键或滑动）。',
    hasZoom:
      '图片的缩放（双指捏合或 ctrl+滚轮、双击/双点按、Enter/Space 或 +/-；0 重置）与平移（拖动、触控板滚动或方向键）。',
    xstyle: '用于布局定制的 StyleX 样式。',
  },
};
