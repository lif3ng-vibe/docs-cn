// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Glyph',
    required: true,
    description: '为所选图标渲染的视觉符号。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Icon',
  displayName: 'Icon',
  category: 'Content',
  keywords: [
    'icon',
    'svg',
    'glyph',
    'symbol',
    'pictogram',
    'graphic',
    'vector',
    'arrow',
    'chevron',
    'caret',
    'checkmark',
    'cross',
    'gear',
    'cog',
    'broom',
    'sparkle',
    'sparkles',
    'star',
    'heart',
    'bell',
    'trash',
    'pencil',
    'magnifyingglass',
    'paperclip',
    'house',
    'flame',
    'rocket',
    'lightning',
    'bolt',
    'globe',
    'sun',
    'moon',
    'bookmark',
    'thumbsup',
    'smiley',
    'emoji',
    'lock',
    'eye',
    'cloud',
    'hourglass',
    'trophy',
    'gift',
    'camera',
    '图标',
    '符号',
  ],
  playground: {
    // `icon` is required and its type can't be auto-generated, so the
    // properties-tab preview showed "Missing: icon". Seed a valid semantic
    // icon name so the interactive preview renders.
    defaults: {
      icon: 'search',
    },
  },
  props: [
    {
      name: 'icon',
      type: 'IconName | NamespacedIconName | ComponentType<SVGProps>',
      description:
        '语义图标名称或 SVG 组件。有效语义名称：close、chevronDown、chevronLeft、chevronRight、chevronsLeft、chevronsRight、check、success、error、warning、info、calendar、clock、externalLink、menu、moreHorizontal、search、upload、arrowUp、arrowDown、arrowsUpDown、funnel、eyeSlash、viewColumns、copy、checkDouble、wrench、stop、microphone。命名空间键（如 `richtext:bold`）指向某个组件或库注册的图标，主题可以按键替换它；没有注册的命名空间键不渲染任何内容。列表之外的图标请直接传入 SVG 组件（例如从 lucide-react 或 @heroicons/react 导入）。注意：这个 prop 叫 `icon`，不是 `name`。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'inherit' | 'blue' | 'red' | 'green' | 'gray' | 'cyan' | 'teal' | 'yellow' | 'orange' | 'pink' | 'purple'",
      description:
        '映射到 Astryx 图标颜色令牌的颜色变体。语义值（primary 到 warning）跟随角色，inherit 使用周围文字的颜色。在 Web 上，Icon 还接受调色板值 blue、red、green、gray、cyan、teal、yellow、orange、pink 和 purple，它们选择非语义色相。',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        "图标尺寸。xsm、sm、md、lg 在 16px 根字号下分别为 12、16、20、24px，并随根字号缩放；主题在 components.icon['size:sm']（及其他尺寸）上以 px 或 rem 设置 width 和 height，即可决定该尺寸的图标尺寸。显式值优先。省略时，Icon 使用最近的 Astryx 所属组件为其图标槽提供的默认尺寸；如果没有上下文默认值，则回退为 md。",
      default: "Contextual; otherwise 'md'",
    },
    {
      name: 'variant',
      type: 'IconVariant',
      description:
        "为语义图标名称请求当前主题的替代图稿，例如 'filled'。名称来自 IconVariantMap，由应用从 @astryxdesign/core/Icon 扩充；Astryx 本身不定义任何名称。只有当前主题在 iconVariants 中列出该变体时（对于主题继承来的条目，还需定义该条目的主题也列出它），主题的图标条目才会收到它；否则绘制常规图稿。直接传入的图标组件会忽略它。它只选择图稿：不会写入 DOM，也没有主题样式选择器。",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '有含义的独立图标的可访问名称（无相邻文字的状态图标或纯图标指示器）。设置后会将图标以 role="img" 暴露给屏幕阅读器，并以该文本作为可访问名称（aria-label），同时移除默认的 aria-hidden。省略（默认）用于装饰性图标，图标对辅助技术保持隐藏（aria-hidden="true"）。这是图标的可访问名称/替代文本 prop：一个 prop 取代手动设置 aria-label + role + aria-hidden。空字符串按装饰性处理。当交互式父元素（Button、IconButton、链接）已命名该控件时请勿设置。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于自定义的 StyleX 样式（颜色、尺寸、不透明度）。会并入图标自身的 stylex.props() 调用，从而与基础的颜色/尺寸样式组合。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '添加到渲染图形上的类名，与 astryx-icon 目标类名并列。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '合并到渲染图形上的内联样式，位于 Icon 自身的尺寸和颜色样式之后。',
    },
    {
      name: 'ref',
      type: 'Ref<SVGSVGElement>',
      description:
        '指向渲染的 SVG 元素的 ref，适用于图标组件以及语义名称或命名空间名称。对于名称，它指向包装元素内的 <svg>；若解析出的图形没有 <svg>，则为 null。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-icon', visualProps: ['color', 'size']}],
    vars: [
      {
        name: '--_icon-width',
        description:
          '该尺寸的图标宽度；由 icon 目标上的 width 设置',
        default: '0.75rem, 1rem, 1.25rem, or 1.5rem by size',
        private: true,
      },
      {
        name: '--_icon-height',
        description:
          '该尺寸的图标高度；由 icon 目标上的 height 设置',
        default: '0.75rem, 1rem, 1.25rem, or 1.5rem by size',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_icon-width'], replaces: true},
      {property: 'height', vars: ['--_icon-height'], replaces: true},
    ],
  },
  usage: {
    description:
      '图标是表示操作、对象或概念的小型视觉符号。它们提升可扫读性，并在文字之外强化含义。同时支持直接传入 SVG 组件和随当前主题自适应的语义图标名称。',
    anatomy,
    bestPractices: [
      {
        guidance: true,
        description:
          '可用时使用语义图标名称；它们会自动适配主题变化。',
      },
      {
        guidance: true,
        description:
          "通过主题覆盖图标，而不是全局覆盖：defineTheme({icons: {close: <XMarkIcon />}}) 把替换范围限定在当前 <Theme>，extends 会将其浅合并进派生主题。registerIcons() 会修改进程级注册表并在开发环境告警，因此把它留给应用引导阶段，不要当作库的主题接缝。",
      },
      {
        guidance: true,
        description:
          "要让图稿匹配渲染尺寸，可把主题或注册的图标条目做成 {size, variant} 的纯同步函数：defineTheme({icons: {info: ({size}) => <InfoIcon weight={size === 'sm' ? 'bold' : 'regular'} />}})。Icon 会传入它渲染时的尺寸；getIcon()、useIcon()、getIconRegistry() 和 theme.icons 按 md 尺寸读取该函数。返回 null 的函数什么都不绘制，也不会回退到默认图标。不要在其中使用 Hook、测量 DOM 或读取浏览器/可变状态。",
      },
      {
        guidance: true,
        description:
          '为无障碍将图标与文本标签搭配；纯图标元素需要无障碍标签。',
      },
      {
        guidance: true,
        description:
          '有含义的独立图标（无相邻文字）请通过 `label` prop 提供无障碍名称：它会设置 role="img" + aria-label 并取消图标的隐藏。',
      },
      {
        guidance: true,
        description:
          '图标颜色使用颜色令牌，不要硬编码十六进制值。',
      },
      {
        guidance: true,
        description:
          '注意上下文；紧凑组件中的装饰性图标可能分散注意力而非提供帮助。',
      },
      {
        guidance: false,
        description:
          '不要只靠图标传达含义；务必提供文本替代。',
      },
      {
        guidance: false,
        description:
          '不要用任意像素值调整图标尺寸；请使用提供的 size prop。',
      },
      {
        guidance: false,
        description:
          '不要在同一上下文中混用图标风格（如 outline 与 filled）。',
      },
      {
        guidance: false,
        description:
          '不要直接渲染原始 SVG 元素；始终用 Icon 包裹以获得一致的尺寸和颜色。',
      },
      {
        guidance: false,
        description:
          '不要传 `name` prop；Icon 用 `icon`（不是 `name`）指定要渲染的图标。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Icon',
  displayName: 'Icon',
  props: [
    {
      name: 'icon',
      type: 'IconName | NamespacedIconName | ComponentType<SVGProps>',
      description:
        '语义图标名称或 SVG 组件。有效语义名称：close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone。命名空间键（如 `richtext:bold`）指向某个组件或库注册的图标，主题可以按键替换它；没有注册的命名空间键不渲染任何内容。列表之外的图标请直接传入 SVG 组件。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'inherit' | 'blue' | 'red' | 'green' | 'gray' | 'cyan' | 'teal' | 'yellow' | 'orange' | 'pink' | 'purple'",
      description:
        '映射到 Astryx 图标颜色令牌的颜色变体。语义值（primary 到 warning）跟随角色，inherit 使用周围文字的颜色。在 Web 上，Icon 还接受调色板值 blue、red、green、gray、cyan、teal、yellow、orange、pink 和 purple，它们选择非语义色相。',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        "图标尺寸。xsm、sm、md、lg 在 16px 根字号下分别为 12、16、20、24px，并随根字号缩放；主题在 components.icon['size:sm']（及其他尺寸）上以 px 或 rem 设置 width 和 height，即可决定该尺寸的图标尺寸。显式值优先。省略时，Icon 使用最近的 Astryx 所属组件为其图标槽提供的默认尺寸；如果没有上下文默认值，则回退为 md。",
      default: "上下文默认值；否则为 'md'",
    },
    {
      name: 'variant',
      type: 'IconVariant',
      description:
        "为语义图标名称请求当前主题的替代图稿，例如 'filled'。名称来自 IconVariantMap，由应用从 @astryxdesign/core/Icon 扩充；Astryx 本身不定义任何名称。只有当前主题在 iconVariants 中列出该变体时（对于主题继承来的条目，还需定义该条目的主题也列出它），主题的图标条目才会收到它；否则绘制常规图稿。直接传入的图标组件会忽略它。它只选择图稿：不会写入 DOM，也没有主题样式选择器。",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '有含义的独立图标的可访问名称（无相邻文字的状态图标或纯图标指示器）。设置后会将图标以 role="img" 暴露给辅助技术，并以该文本作为可访问名称（aria-label），同时移除默认的 aria-hidden。省略（默认）用于装饰性图标，图标对辅助技术保持隐藏（aria-hidden="true"）。空字符串按装饰性处理。当交互式父元素（Button、IconButton、链接）已命名该控件时请勿设置。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于自定义的 StyleX 样式（颜色、尺寸、不透明度）。会并入图标自身的 stylex.props() 调用，从而与基础的颜色/尺寸样式组合。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '添加到渲染图标上的类名，与 astryx-icon 目标类名并列。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '合并到渲染图标上的内联样式，位于 Icon 自身的尺寸和颜色样式之后。',
    },
    {
      name: 'ref',
      type: 'Ref<SVGSVGElement>',
      description:
        '指向渲染的 SVG 元素的 ref，适用于图标组件以及语义名称或命名空间名称。对于名称，它指向包装元素内的 <svg>；若解析出的图形没有 <svg>，则为 null。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-icon', visualProps: ['color', 'size']}],
    vars: [
      {
        name: '--_icon-width',
        description: '该尺寸的图标宽度；由 icon 目标上的 width 设置',
        default: '按尺寸为 0.75rem、1rem、1.25rem 或 1.5rem',
        private: true,
      },
      {
        name: '--_icon-height',
        description: '该尺寸的图标高度；由 icon 目标上的 height 设置',
        default: '按尺寸为 0.75rem、1rem、1.25rem 或 1.5rem',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_icon-width'], replaces: true},
      {property: 'height', vars: ['--_icon-height'], replaces: true},
    ],
  },
  usage: {
    description:
      'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use semantic icon names when available; they adapt to theme changes automatically.',
      },
      {
        guidance: true,
        description:
          'Pair icons with text labels for accessibility; icon-only elements need an accessible label.',
      },
      {
        guidance: true,
        description:
          'Use color tokens for icon colors, not hardcoded hex values.',
      },
      {
        guidance: true,
        description:
          'Be mindful of context; decorative icons in compact components can distract rather than help.',
      },
      {
        guidance: false,
        description:
          'Use icons as the sole means of conveying meaning; always provide a text alternative.',
      },
      {
        guidance: false,
        description:
          'Resize icons with arbitrary pixel values; use the provided size props.',
      },
      {
        guidance: false,
        description:
          'Mix icon styles (e.g. outline and filled) within the same context.',
      },
      {
        guidance: false,
        description:
          'Render raw SVG elements; always wrap in Icon for consistent sizing and color.',
      },
      {
        guidance: false,
        description:
          'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '使用 Astryx 设计系统的颜色与尺寸渲染图标。支持直接传入 SVG 图标组件 + 随当前主题自适应的语义图标名称。',
  usage: {
    description:
      '图标是表示操作、对象或概念的小型视觉符号。它们提升可扫读性，并在文字之外强化含义。同时支持直接传入 SVG 组件和随当前主题自适应的语义图标名称。',
    anatomy,
    bestPractices: [
      {
        guidance: true,
        description:
          '可用时使用语义图标名称；它们会自动适配主题变化。',
      },
      {
        guidance: true,
        description:
          '通过主题覆盖图标而非全局：defineTheme({icons: {close: <XMarkIcon />}}) 把替换限定在当前 <Theme>；extends 浅合并进派生主题。registerIcons() 修改全局注册表并在开发环境告警：仅用于应用引导，不要当作库主题接缝。',
      },
      {
        guidance: true,
        description:
          "尺寸感知图稿：主题/注册条目可以是 {size, variant} 的纯同步函数，如 info: ({size}) => <InfoIcon weight={size === 'sm' ? 'bold' : 'regular'} />。Icon 传入渲染尺寸；getIcon/useIcon/getIconRegistry/theme.icons 按 md 读取。返回 null 则什么都不绘制（不回退）。不要用 Hook、测量 DOM 或读取浏览器/可变状态。",
      },
      {
        guidance: true,
        description:
          '为无障碍将图标与文本标签搭配；纯图标元素需要无障碍标签。',
      },
      {
        guidance: true,
        description:
          '有含义的独立图标（无相邻文字）通过 `label` 设置无障碍名称：设置 role="img" + aria-label 并取消隐藏。',
      },
      {
        guidance: true,
        description:
          '图标颜色使用颜色令牌，不要硬编码十六进制值。',
      },
      {
        guidance: true,
        description:
          '注意上下文；紧凑组件中的装饰性图标可能分散注意力而非提供帮助。',
      },
      {
        guidance: false,
        description:
          '不要只靠图标传达含义；务必提供文本替代。',
      },
      {
        guidance: false,
        description:
          '不要用任意像素值调整图标尺寸；请使用提供的 size prop。',
      },
      {
        guidance: false,
        description:
          '不要在同一上下文中混用图标风格（如 outline 与 filled）。',
      },
      {
        guidance: false,
        description:
          '不要直接渲染原始 SVG 元素；始终用 Icon 包裹以获得一致的尺寸和颜色。',
      },
      {
        guidance: false,
        description:
          '`name` prop 不存在。请用 `icon` 指定要渲染的图标。',
      },
    ],
  },
  propDescriptions: {
    icon: '语义图标名称或 SVG 组件。有效名称：close、chevronDown、chevronLeft、chevronRight、chevronsLeft、chevronsRight、check、success、error、warning、info、calendar、clock、externalLink、menu、moreHorizontal、search、upload、arrowUp、arrowDown、arrowsUpDown、funnel、eyeSlash、viewColumns、copy、checkDouble、wrench、stop、microphone。命名空间键（`richtext:bold`）指向某个组件或库注册的图标；未注册的不渲染任何内容。其余请传入 SVG 组件。',
    color:
      '映射到 Astryx 图标颜色令牌的颜色变体；inherit = 周围文字颜色。Web 还接受非语义调色板：blue、red、green、gray、cyan、teal、yellow、orange、pink、purple。',
    size: "xsm/sm/md/lg 在 16px 根字号下 = 12/16/20/24px，随根字号缩放；主题在 components.icon['size:sm'] 等目标上通过 width + height（px 或 rem）设置该尺寸的图标尺寸。显式设置 Icon 尺寸；否则用最近的所属组件默认值，无上下文默认时为 'md'",
    variant:
      "请求当前主题的替代图稿（如 'filled'）；名称来自可扩充的 IconVariantMap。仅当当前主题的 iconVariants 列出它时（继承条目还需其定义主题列出）才会传给条目；否则绘制常规图稿。直接传入的组件会忽略；不写入 DOM；无主题选择器。",
    label:
      '有含义的独立图标的可访问名称。设置 role="img" + aria-label 并移除默认 aria-hidden。装饰性图标省略（默认），保持 aria-hidden。空字符串 = 装饰性。这是图标的可访问名称/替代文本 prop。',
    xstyle:
      '经 stylex.create() 的 StyleX 样式（颜色、尺寸、不透明度）；与基础颜色/尺寸样式组合。',
    className: '添加到渲染图形上、与 astryx-icon 并列的类名。',
    style: '合并到 Icon 尺寸和颜色样式之后的内联样式。',
    ref: '对所有图标取值都能取到渲染的 SVG；解析出的图形没有 <svg> 时为 null。',
  },
};
