// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTheme',
  displayName: 'useTheme',
  group: 'Utilities',
  category: 'Utility',
  keywords: [
    'theme',
    '主题',
    'tokens',
    '令牌',
    'color',
    'mode',
    'dark',
    'light',
    'provider',
    'data visualization',
    '数据可视化',
    'canvas',
    'svg',
    'chart',
    '图表',
  ],
  params: [],
  returns: [
    {
      name: 'name',
      type: 'string',
      description:
        '最近主题的名称，没有 provider 时为 default。',
    },
    {
      name: 'mode',
      type: "'light' | 'dark'",
      description:
        '解析后的生效配色模式。system 模式会解析为 light 或 dark。',
    },
    {
      name: 'token',
      type: '(name: string) => string',
      description:
        '把单个设计令牌解析为生效模式下的当前 CSS 值。',
    },
    {
      name: 'tokens',
      type: 'Record<string, string>',
      description:
        '当前模式下解析的所有令牌，含默认值与主题覆盖。在生效主题或模式变化前保持稳定；与 resolveThemeTokens(theme, {mode}) 使用相同的解析逻辑。',
    },
  ],
  usage: {
    description:
      '为非 CSS 消费方提供主题令牌的程序化访问，如 SVG、canvas、Vega、D3、地图或需要 JavaScript 值而非 CSS 自定义属性引用的图表库。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把主题颜色集成进 React 组件内的 SVG 属性、canvas 绘制、图表选项或其他非 CSS 配置对象时，使用 tokens 或 token(name)。',
      },
      {
        guidance: true,
        description:
          '在 React hook 之外做相同令牌解析时使用 resolveThemeTokens(theme, {mode})。',
      },
      {
        guidance: true,
        description:
          '常规组件样式优先用 CSS 变量或 StyleX 令牌；只在 JavaScript 需要令牌值时才用本 hook。',
      },
      {
        guidance: true,
        description:
          '图表系列使用数据可视化令牌（如 --color-data-categorical-blue），而不是任意 UI 颜色。',
      },
      {
        guidance: false,
        description:
          '不要在数据可视化中硬编码浅色/深色颜色：应通过当前主题解析。',
      },
      {
        guidance: false,
        description:
          '不要假定 hook 反映每一条 CSS 级联覆盖。它为当前 Theme 模式解析令牌；局部媒体表面覆盖与任意外部 CSS 可能未体现。',
      },
    ],
  },
  relatedComponents: ['Theme'],
  relatedHooks: ['useMediaQuery'],
  importPath: '@astryxdesign/core/theme',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为需要 JS 值而非 CSS 变量的 SVG/canvas/图表提供主题令牌的程序化访问。',
  returnDescriptions: {
    name: '最近主题名称或 default。',
    mode: '解析后的浅色/深色模式。',
    token: '解析单个设计令牌在生效模式下的值。',
    tokens:
      '当前模式解析的所有令牌；主题/模式变化前稳定；与 resolveThemeTokens 同一解析器。',
  },
  usage: {
    description:
      '为需要 JS 值而非 CSS 变量的 SVG/canvas/图表提供主题令牌的程序化访问。',
    bestPractices: [
      {
        guidance: true,
        description: 'React 中 SVG/canvas/图表配置的主题颜色用 tokens/token(name)。',
      },
      {
        guidance: true,
        description:
          'React hook 之外用 resolveThemeTokens(theme, {mode})。',
      },
      {
        guidance: true,
        description:
          '常规样式优先 CSS 变量 / StyleX 令牌；JS 需要值时才用本 hook。',
      },
      {
        guidance: true,
        description: '图表系列用 --color-data-* 令牌。',
      },
      {
        guidance: false,
        description: '不要硬编码图表浅色/深色颜色：应从当前主题解析。',
      },
      {
        guidance: false,
        description:
          '不要假定 hook 反映任意 CSS 级联/媒体表面覆盖。',
      },
    ],
  },
};
