// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MediaTheme',
  displayName: 'Media Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'theme',
    '主题',
    'dark-mode',
    '深色模式',
    'light-mode',
    '浅色模式',
    'media',
    'inverted',
    '反色',
    'overlay',
    '浮层',
    'scrim',
    '遮罩',
    'toast',
    'tooltip',
  ],
  playground: {
    defaults: {
      mode: 'auto',
      children: {
        __element: 'Section',
        props: {
          variant: 'transparent',
          padding: 4,
          style: {
            maxWidth: 360,
            backgroundColor: 'var(--color-background-inverted)',
            borderRadius: 'var(--radius-container)',
          },
        },
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {
              __element: 'Text',
              props: {type: 'body', weight: 'bold'},
              children: '媒体浮层',
            },
            {
              __element: 'Text',
              props: {type: 'supporting', color: 'secondary'},
              children: '文本与操作会适配深色媒体表面。',
            },
            {
              __element: 'Button',
              props: {label: '立即观看', variant: 'secondary', size: 'sm'},
            },
          ],
        },
      },
    },
  },
  usage: {
    description:
      '为渲染在反色表面上的内容提供令牌覆盖：媒体浮层、遮罩、toast 与 tooltip。基础行为会翻转 color-scheme，使所有 light-dark() 令牌解析到正确的一侧；除此之外只有少量令牌需要显式覆盖。主题可通过 defineTheme() 的 onDark/onLight 进一步定制组件在媒体表面上的外观，支持令牌覆盖（如 "--color-accent": "#90CAF9"）和组件覆盖（如幽灵按钮在深色表面上加描边）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于放置在深色背景上的任何内容（图片浮层、视频遮罩、深色卡片）或 toast、tooltip 等其他反色表面。',
      },
      {
        guidance: true,
        description:
          '表面颜色来自主题令牌时优先用 mode="auto"。名为 "inverted" 的令牌不保证是反色的，auto 测量实际绘制的效果而不是信任名字。它甚至可以判定某个表面完全不需要媒体上下文。',
      },
      {
        guidance: true,
        description:
          '搭配背景色使用：MediaTheme 翻转令牌上下文但不添加背景。请在父元素上设置 backgroundColor。',
      },
      {
        guidance: true,
        description:
          '主题可通过 defineTheme() 的 onDark.components 与 onLight.components 定制媒体表面上的组件。例如给深色表面上的幽灵按钮加描边。',
      },
      {
        guidance: false,
        description:
          '不要用 MediaTheme 做应用级深色模式：请改用 Theme 的 mode="dark" 或 mode="system"。MediaTheme 用于局部表面反色，不是整页配色方案。',
      },
    ],
  },
  props: [
    {
      name: 'mode',
      type: "'dark' | 'light' | 'auto' | 'off'",
      required: true,
      description:
        '表面明暗上下文：dark 用于深色背景上的内容（浅色文字、白色调交互），light 用于浅色背景上的内容（深色文字、黑色调交互），auto 从实际绘制的表面判断（环境文字在表面上已有 3:1 对比时无媒体上下文，否则取对比更好的一侧），off 显式关闭。无论哪种模式元素都会渲染，因此表面可以切换上下文而不重挂载子内容。',
    },
    {
      name: 'fallback',
      type: "'dark' | 'light'",
      default: "'dark'",
      description:
        '表面无法测量时 auto 使用的侧别：SSR 期间、客户端首帧，以及背景无法从 CSS 得知时——最常见是 background-image，其像素需要采样（useImageMode）而非计算样式。仅当 mode 为 auto 时生效。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        '以反色令牌上下文渲染的内容。组件自动继承正确颜色。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '为反色表面上的内容提供令牌覆盖：媒体浮层、遮罩、toast、tooltip。基础行为翻转 color-scheme，使所有 light-dark() 令牌解析到正确侧；除此之外只需少量显式覆盖。主题可通过 defineTheme() 的 onDark/onLight 进一步定制媒体表面上的组件外观，支持令牌覆盖（如 "--color-accent": "#90CAF9"）+ 组件覆盖（如幽灵按钮在深色表面加描边）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于放置在深色背景上的任何内容（图片浮层、视频遮罩、深色卡片）或 toast/tooltip 等其他反色表面。',
      },
      {
        guidance: true,
        description:
          '表面颜色来自主题令牌时优先 mode="auto"；名为 "inverted" 的令牌不保证反色，auto 测量实际绘制效果。',
      },
      {
        guidance: true,
        description:
          '搭配背景色：MediaTheme 翻转令牌上下文但不添加背景。请在父元素上设置 backgroundColor。',
      },
      {
        guidance: true,
        description:
          '主题可通过 defineTheme() 的 onDark.components + onLight.components 定制媒体表面上的组件。如给深色表面上的幽灵按钮加描边。',
      },
      {
        guidance: false,
        description:
          '不要用 MediaTheme 做应用级深色模式：请改用 Theme 的 mode="dark"/mode="system"。MediaTheme 用于局部表面反色，不是整页配色方案。',
      },
    ],
  },
  propDescriptions: {
    mode: '表面明暗上下文：dark 用于深色背景上的内容（浅色文字、白色调交互），light 用于浅色背景上的内容（深色文字、黑色调交互），auto 从绘制表面判断（环境文字已有 3:1 对比则无媒体上下文，否则取对比更好一侧），off 显式关闭（元素仍渲染，子内容不重挂载）',
    fallback:
      '表面不可测量时（SSR、首帧、background-image——需 useImageMode 采样）auto 使用的侧别；仅 mode 为 auto 时生效',
  },
};
