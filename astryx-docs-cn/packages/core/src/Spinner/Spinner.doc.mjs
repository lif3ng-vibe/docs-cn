// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Spinner',
  displayName: 'Spinner',
  category: 'Feedback & Status',
  keywords: [
    'spinner',
    'loader',
    '加载指示器',
    'loading',
    'circular',
    'progress',
    '旋转器',
    '加载中',
    'busy',
    'indeterminate',
    'circleprogress',
  ],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      description: '旋转器尺寸：环直径（10px、14px、18px、28px）。',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia' | 'subtle' | 'inherit'",
      description: '浅色或深色背景的颜色色调。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '旋转器下方的可见内容。字符串标签会通过 aria-labelledby 为指示器命名。',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '屏幕阅读器的无障碍名称。默认为 label（如果是字符串）或来自 i18n 词表的已翻译 "Loading"。',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-spinner', visualProps: ['size', 'shade']}],
    vars: [
      {
        name: '--spinner-diameter',
        description:
          "绘制环的直径。在尺寸变体目标上设置，以重新定义每个命名尺寸的解析值，例如 spinner: { 'size:xl': { '--spinner-diameter': '2.5rem' } }。渲染盒子的尺寸为该值加上两侧的描边宽度，并自动跟随。支持任意长度单位：rem、em 与 calc() 会在绘制前解析。",
        default: '10px (sm), 14px (md), 18px (lg), 28px (xl)',
      },
      {
        name: '--spinner-stroke-width',
        description:
          '构成环的两个圆——移动圆弧与其后的轨道——的描边宽度。与直径一起按尺寸设置。同一个描边宽度同时驱动两者，因此 0 会被采纳为零宽描边——什么都不绘制，而不会回退到默认值；若想要没有轨道的圆弧，请改将 --spinner-track-color 设为 transparent。',
        default: '2px (sm), 3px (md), 3px (lg), 4px (xl)',
      },
      {
        name: '--spinner-color',
        description:
          "运动圆弧的颜色。默认取所在 shade 的令牌，因此可在 shade 变体目标上设置以重新定义单个 shade（spinner: { 'shade:subtle': { '--spinner-color': 'var(--color-text-tertiary)' } }），或在 base 目标上设置以覆盖全部四种。接受任意颜色写法，包括 var()、color-mix() 与 currentColor。",
        default:
          'var(--color-accent) (default), var(--color-text-secondary) (subtle), var(--color-on-dark) (onMedia), currentColor (inherit)',
      },
      {
        name: '--spinner-track-color',
        description:
          '圆弧所在轨道的颜色。设为 `transparent` 可得到无轨道的圆弧。onMedia 与 inherit 两种 shade 会以降低的透明度（30%）绘制轨道，以便在任意背景上可辨；该淡化同样作用于主题化的颜色。',
        default:
          'var(--color-track) (default, subtle), var(--color-on-dark) (onMedia), currentColor (inherit)',
      },
      {
        name: '--spinner-arc-fraction',
        description:
          "运动圆弧覆盖圆环的比例，为纯数字（非百分比或角度）。在尺寸变体目标上设置，方式与 --spinner-diameter 相同，例如 spinner: { 'size:xl': { '--spinner-arc-fraction': '0.75' } } 可得到 270 度的圆弧。仅在样式表加载后生效；无 CSS 的渲染（SSR、无 JS）始终绘制默认的 135 度圆弧。",
        default: '0.375 (135deg), same for every size',
      },
    ],
  },
  usage: {
    description:
      '用于时长未知过程（如数据获取或表单提交）的动画加载指示器。支持可见标签、多种尺寸与深色背景变体。尺寸已知的内容请改用 Skeleton。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供有意义的标签，向屏幕阅读器用户描述正在加载什么。',
      },
      {
        guidance: true,
        description:
          '放在深色或 accent 色背景上时使用 "onMedia" 色调。',
      },
      {
        guidance: false,
        description:
          '尺寸已知的内容区域不要用；请改用 Skeleton 以保持布局。',
      },
      {
        guidance: false,
        description:
          '不要在同一视图堆叠多个旋转器；用一个代表整体加载状态。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Spinner',
  displayName: 'Spinner',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      description: '旋转器尺寸——环直径（10px、14px、18px、28px）。',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia' | 'subtle' | 'inherit'",
      description: '浅色或深色背景的颜色色调。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '旋转器下方的可见内容。未设置 aria-label 时，字符串标签提供无障碍名称。',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '屏幕阅读器的无障碍名称。默认为 label（如果是字符串）或来自 i18n 词条的已翻译 "Loading"。',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-spinner', visualProps: ['size', 'shade']}],
    vars: [
      {
        name: '--spinner-diameter',
        description:
          "绘制环的直径。在尺寸变体目标上设置，以重新定义每个命名尺寸的解析值，例如 spinner: { 'size:xl': { '--spinner-diameter': '2.5rem' } }。渲染盒子的尺寸为该值加上两侧的描边宽度，并自动跟随。支持任意长度单位——rem、em 与 calc() 会在绘制前解析。",
        default: '10px (sm), 14px (md), 18px (lg), 28px (xl)',
      },
      {
        name: '--spinner-stroke-width',
        description:
          '绘制环的两个圆——移动圆弧与其后的轨道——的描边宽度。与直径一起按尺寸设置。同一个描边宽度同时驱动两者，因此 0 会被采纳为零宽描边——什么都不绘制，而不会回退到默认值；若想要没有轨道的圆弧，请改将 --spinner-track-color 设为 transparent。',
        default: '2px (sm), 3px (md), 3px (lg), 4px (xl)',
      },
      {
        name: '--spinner-color',
        description:
          "运动圆弧的颜色。默认取所在 shade 的令牌，因此可在 shade 变体目标上设置以重新定义单个 shade——spinner: { 'shade:subtle': { '--spinner-color': 'var(--color-text-tertiary)' } }——或在 base 目标上设置以覆盖全部四种。接受任意颜色写法，包括 var()、color-mix() 与 currentColor。",
        default:
          'var(--color-accent)（default）、var(--color-text-secondary)（subtle）、var(--color-on-dark)（onMedia）、currentColor（inherit）',
      },
      {
        name: '--spinner-track-color',
        description:
          '圆弧所在轨道的颜色。设为 `transparent` 可得到无轨道的圆弧。onMedia 与 inherit 两种 shade 会以降低的透明度（30%）绘制轨道，以便在任意背景上可辨；该淡化同样作用于主题化的颜色。',
        default:
          'var(--color-track)（default、subtle）、var(--color-on-dark)（onMedia）、currentColor（inherit）',
      },
      {
        name: '--spinner-arc-fraction',
        description:
          "运动圆弧覆盖圆环的比例，为纯数字（非百分比或角度）。在尺寸变体目标上设置，方式与 --spinner-diameter 相同，例如 spinner: { 'size:xl': { '--spinner-arc-fraction': '0.75' } } 可得到 270 度的圆弧。仅在样式表加载后生效；无 CSS 的渲染（SSR、无 JS）始终绘制默认的 135 度圆弧。",
        default: '0.375（135 度），各尺寸相同',
      },
    ],
  },
  usage: {
    description:
      'An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a meaningful label to describe what is loading for screen reader users.',
      },
      {
        guidance: true,
        description:
          'Use the "onMedia" shade when placed on dark or accent-colored backgrounds.',
      },
      {
        guidance: false,
        description:
          'Use for content areas with known dimensions; use Skeleton to preserve layout instead.',
      },
      {
        guidance: false,
        description:
          'Stack multiple spinners in the same view; use one to represent the overall loading state.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '用于时长未知过程（如数据获取或表单提交）的动画加载指示器。支持可见标签、多种尺寸与深色背景变体。尺寸已知的内容请改用 Skeleton。',
    bestPractices: [
      {
        guidance: true,
        description: '提供有意义的标签，向屏幕阅读器用户描述正在加载什么。',
      },
      {
        guidance: true,
        description: '放在深色或 accent 色背景上时使用 "onMedia" 色调。',
      },
      {
        guidance: false,
        description: '尺寸已知的内容区域不要用；请改用 Skeleton 保持布局。',
      },
      {
        guidance: false,
        description: '不要在同一视图堆叠多个旋转器；用一个代表整体加载状态。',
      },
    ],
  },
  propDescriptions: {
    size: '旋转器尺寸：环直径（10px、14px、18px、28px）。',
    shade: '浅色或深色背景的颜色色调。',
    label:
      '旋转器下方的可见内容。未设置 aria-label 时，字符串提供其无障碍名称。',
    'aria-label':
      '屏幕阅读器的无障碍名称。默认为 label 或已翻译的 "Loading"。',
    xstyle:
      '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式。',
  },
};
