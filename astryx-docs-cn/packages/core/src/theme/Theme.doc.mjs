// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Theme',
  displayName: 'Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['theme', '主题', 'theming', '主题定制', 'provider', 'color-scheme', '配色方案'],
  playground: {
    defaults: {
      theme: '@astryxdesign/theme-matcha',
      mode: 'light',
      children: {
        __element: 'Card',
        props: {padding: 4, style: {maxWidth: 360}},
        children: {
          __element: 'VStack',
          props: {gap: 3},
          children: [
            {
              __element: 'Heading',
              props: {level: 4},
              children: '主题预览',
            },
            {
              __element: 'Text',
              props: {type: 'body', color: 'secondary'},
              children:
                '卡片、文本与按钮继承所选主题的令牌。',
            },
            {__element: 'Button', props: {label: '主要操作'}},
          ],
        },
      },
    },
  },
  usage: {
    description:
      '用指定的 Astryx 主题包裹子树。静态生产主题请用 `astryx theme build` 构建并导入生成的 CSS 与构建后的主题对象，以获得首帧与 SSR 性能。主题动态或原型阶段用运行时 `defineTheme()`。\n\n`defineTheme` 接受 `tokens` 对象，其键为 CSS 自定义属性名（始终带 `--` 前缀）。常见令牌名包括 `--color-accent`、`--color-background-surface`、`--color-background-body`、`--color-text-primary`、`--color-text-secondary`、`--radius-container`、`--spacing-1` 到 `--spacing-6`。值可以是字符串（浅色/深色相同）或 `[light, dark]` 元组。\n\n示例：\n```ts\nimport {defineTheme} from \'@astryxdesign/core/theme\';\nconst myTheme = defineTheme({\n  name: \'ocean\',\n  tokens: {\n    \'--color-accent\': [\'#0077B6\', \'#48CAE4\'],\n    \'--color-background-surface\': [\'#F0F8FF\', \'#0A1628\'],\n    \'--color-text-primary\': [\'#0A1317\', \'#FFFFFF\'],\n    \'--radius-container\': \'16px\',\n  },\n});\n```',
    bestPractices: [
      {
        guidance: true,
        description:
          '提前确定的应用主题用 `astryx theme build` 构建，然后导入生成的 CSS 与构建后的主题对象。',
      },
      {
        guidance: true,
        description:
          '主题在浏览器中创建或编辑时用运行时主题，如主题编辑器、用户品牌定制或原型。',
      },
      {
        guidance: true,
        description:
          '令牌名始终以 `--` 开头（如 `--color-accent`、`--color-background-surface`）。不要省略前缀。',
      },
      {
        guidance: false,
        description:
          '不要在 SSR 生产应用中默认使用运行时主题。组件覆盖会在水合后注入，而不是以静态 CSS 交付。',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'DefinedTheme',
      required: true,
      description:
        "要应用的主题对象。静态生产主题优先用构建后的主题对象；动态主题用运行时 `defineTheme()`。其 `motion` 可设置 `tempo`（0.75–1.5）与 `character`（`'crisp' | 'standard' | 'expressive'`）。",
    },
    {
      name: 'mode',
      type: "'light' | 'dark' | 'system'",
      default: "'system'",
      description: '配色模式。system 跟随操作系统偏好。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: '随主题渲染的内容。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '用指定 Astryx 主题包裹子树。静态生产主题用 `astryx theme build` + 生成 CSS + 构建后主题对象以获得首帧/SSR 性能。动态主题或原型用运行时 `defineTheme()`。令牌名始终以 `--` 开头（如 `--color-accent`、`--color-background-surface`）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提前确定的应用主题用 `astryx theme build` 构建；导入生成 CSS + 构建后主题对象。',
      },
      {
        guidance: true,
        description:
          '主题在浏览器中创建/编辑时用运行时主题，如主题编辑器、用户品牌定制、原型。',
      },
      {
        guidance: true,
        description:
          '令牌名始终以 `--` 开头（如 `--color-accent`、`--color-background-surface`）。不要省略前缀。',
      },
      {
        guidance: false,
        description:
          '不要在 SSR 生产应用中默认用运行时主题。组件覆盖在水合后注入，而非静态 CSS。',
      },
    ],
  },
  propDescriptions: {
    theme:
      '要应用的主题对象。静态生产主题优先用构建后的主题对象；动态主题用运行时 `defineTheme()`。',
    mode: '配色模式。system 跟随操作系统偏好。默认 "system"',
  },
};
