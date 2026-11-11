// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Overlay',
  displayName: 'Overlay',
  group: 'Overlay',
  category: 'Overlay',

  keywords: ['overlay', 'scrim', 'media', 'hover', 'focus', 'image', 'card', '覆盖层', '遮罩', '悬停显示'],

  usage: {
    description:
      'Overlay 把操作或辅助内容以可选遮罩与显现行为的方式叠加在媒体、卡片、视频或其他有界表面上。宿主属性与 DOM 处理器（id、data-*、aria-*）会落到根元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把覆盖层用于直接属于底层媒体或表面的简短上下文操作或标签。',
      },
      {
        guidance: true,
        description:
          '保持覆盖层内容紧凑，使其在遮罩上仍清晰可读，且不遮蔽重要的视觉信息。',
      },
      {
        guidance: false,
        description:
          '不要用 Overlay 承载锚定在表面之外的浮动内容。这类模式请用 Popover、Tooltip 或 Dialog。',
      },
    ],
    anatomy: [
      {
        name: 'Base content',
        required: false,
        description: '覆盖层所叠加的媒体、卡片或有界表面。',
      },
      {
        name: 'Scrim',
        required: false,
        description: '可选的深色或浅色覆盖背景，用于提升内容对比度。',
      },
      {
        name: 'Overlay content',
        required: true,
        description: '渲染在基础表面之上的操作、标签或辅助内容。',
      },
    ],
  },

  playground: {
    defaults: {
      content: {
        __element: 'Button',
        props: {label: '快速查看', variant: 'secondary', size: 'sm'},
      },
      children: [
        {
          __element: 'AspectRatio',
          props: {
            ratio: 1.7777777777777777,
            style: {
              width: 320,
              borderRadius: 12,
              overflow: 'clip',
            },
          },
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
              },
            },
            children: '媒体预览',
          },
        },
      ],
    },
  },

  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: '渲染在覆盖层遮罩内的内容。',
      required: true,
      slotElements: [
        {
          __element: 'Button',
          props: {label: '快速查看', variant: 'secondary', size: 'sm'},
        },
        {
          __element: 'Text',
          props: {type: 'body', weight: 'bold'},
          children: 'Overlay content',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '覆盖层所叠加的基础内容，例如图片、视频、卡片或媒体表面。',
      slotElements: [
        {
          __element: 'AspectRatio',
          props: {ratio: 1.7777777777777777, style: {width: 320}},
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
              },
            },
          },
        },
      ],
    },
    {
      name: 'showOn',
      type: "'hover' | 'always' | 'focus' | 'hover-or-focus'",
      description:
        '可见性触发方式。hover 模式也在聚焦时显现，保证键盘无障碍；hover-or-focus 是 hover 的别名。',
      default: "'always'",
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '受控可见性覆盖。设置后优先于 showOn 与触摸切换行为。',
    },
    {
      name: 'scrim',
      type: "'dark' | 'light' | false",
      description: '遮罩背景模式。设为 false 则渲染无遮罩背景的覆盖层内容。',
      default: "'dark'",
    },
    {
      name: 'position',
      type: "'fill' | 'bottom' | 'top'",
      description: '遮罩出现在基础表面内的位置。',
      default: "'fill'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: '覆盖层内容在遮罩内的对齐方式。',
      default: "'end'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '附加到根元素的 CSS 类名。样式尽量首选 xstyle。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '应用到根元素的内联样式。设计系统样式请首选 xstyle。',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: '转发到覆盖层根元素的 ref。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-overlay'},
      {className: 'astryx-overlay-scrim', visualProps: ['position']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '以遮罩 + 悬停/聚焦/受控显现的方式，把内容分层叠加在媒体/卡片表面上',
  usage: {
    description:
      'Overlay 把紧凑的操作或辅助内容叠加在媒体、卡片或有界表面上，带可选的深/浅遮罩与悬停/聚焦/受控显现。宿主属性与 DOM 处理器会落到根元素。',
    bestPractices: [
      {guidance: true, description: '用于与底层表面绑定的简短上下文操作/标签。'},
      {guidance: true, description: '保持内容紧凑，在遮罩上清晰可读。'},
      {guidance: false, description: '不要用于浮动的锚定表面；请用 Popover、Tooltip 或 Dialog。'},
    ],
  },
  propDescriptions: {
    content: '遮罩内的覆盖层内容；必填',
    children: '覆盖层下方的基础媒体/卡片/表面',
    showOn: '可见性触发；hover 也含 focus-visible；默认 always',
    isOpen: '受控可见性覆盖',
    scrim: '深/浅遮罩，或 false 表示无遮罩；默认 dark',
    position: '遮罩位置：fill、底部条带或顶部条带',
    align: '内容在遮罩内的对齐',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
    className: '额外的根类名',
    style: '根内联样式；首选 xstyle',
    ref: '转发的根 div ref',
  },
};
