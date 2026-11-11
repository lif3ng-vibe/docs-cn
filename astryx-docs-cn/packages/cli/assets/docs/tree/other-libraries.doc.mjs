// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/other-libraries`: Panda, Chakra, MUI,
 * Emotion, styled-components, UnoCSS, and the interop checklist.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'other-libraries',
  title: '其他样式库',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 30},
  category: 'guide',
  description:
    'Panda、Chakra、MUI、Emotion、styled-components、Theme UI、UnoCSS，以及互操作清单。',
  keywords: [
    'UnoCSS',
    '语义 token',
    '调色板',
  ],

  sections: [
    {
      id: 'semantic-token-systems',
      title: 'Panda、Chakra 与其他语义 token 体系',
      content: [
        {
          type: 'prose',
          text: 'Panda CSS 和 Chakra UI 这类库提供一等公民的语义 token 对象。把系统的 CSS 变量放到这些对象的叶子位置，让业务代码使用库的语义命名，而值仍由系统持有。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '语义 token 别名',
          code: `semanticTokens: {
  colors: {
    text: {
      primary: {value: 'var(--color-text-primary)'},
      secondary: {value: 'var(--color-text-secondary)'},
    },
    background: {
      surface: {value: 'var(--color-background-surface)'},
      body: {value: 'var(--color-background-body)'},
    },
    border: {
      default: {value: 'var(--color-border)'},
    },
  },
},
tokens: {
  spacing: {
    4: {value: 'var(--spacing-4)'},
  },
  radii: {
    container: {value: 'var(--radius-container)'},
  },
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Panda 风格的用法',
          code: `<section
  className={css({
    bg: 'background.surface',
    color: 'text.primary',
    borderColor: 'border.default',
    p: '4',
    rounded: 'container',
  })}
/>`,
        },
        {
          type: 'prose',
          text: '如果语义 token 库需要从原始值生成自己的浅色/深色 CSS，就把它的模式选择器与 Theme 对齐（`data-theme="light|dark"`），并从系统主题数据生成这个适配层。否则它会与嵌套主题或运行时主题漂移。',
        },
      ],
    },
    {
      title: 'MUI 与基于调色板的主题',
      content: [
        {
          type: 'prose',
          text: '`MUI` 期望 primary、background、text、divider 这类调色板插槽。普通组件样式把这些插槽映射到系统变量。只有当 MUI 或你的代码需要解析颜色做对比度、alpha、变亮、变暗计算时才用原始值。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'MUI 调色板映射到系统变量',
          code: `const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {main: 'var(--color-accent)'},
        background: {
          default: 'var(--color-background-body)',
          paper: 'var(--color-background-surface)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        divider: 'var(--color-border)',
      },
    },
    dark: {
      palette: {
        primary: {main: 'var(--color-accent)'},
        background: {
          default: 'var(--color-background-body)',
          paper: 'var(--color-background-surface)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        divider: 'var(--color-border)',
      },
    },
  },
});`,
        },
        {
          type: 'prose',
          text: '如果应用中由 MUI 掌管颜色模式，就从系统主题数据生成浅色与深色两套调色板值，并让 Theme 模式保持同步。如果由 Theme 掌管颜色模式，就让 MUI 的两套 scheme 都指向同一批系统 CSS 变量。',
        },
      ],
    },
    {
      id: 'css-in-js',
      title: 'Emotion、styled-components、Theme UI 与 Styled System',
      content: [
        {
          type: 'prose',
          text: '`Emotion` 和 `styled-components` 这类运行时 CSS-in-JS 库通常接受任意主题对象。让对象保持语义化，但把值存为系统 CSS 变量引用。这样系统通过 CSS 级联更新值时，生成的类名保持稳定。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '通用的 CSS-in-JS 主题对象',
          code: `const appTheme = {
  colors: {
    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    surface: 'var(--color-background-surface)',
    border: 'var(--color-border)',
    accent: 'var(--color-accent)',
  },
  spacing: {
    4: 'var(--spacing-4)',
  },
  radius: {
    container: 'var(--radius-container)',
  },
};`,
        },
        {
          type: 'prose',
          text: '避免在每次模式切换时用原始颜色值重建 CSS-in-JS 主题对象。CSS 变量让类名保持不变，由浏览器解析当前生效的值。',
        },
      ],
    },
    {
      id: 'unocss',
      title: 'UnoCSS 与自定义工具类体系',
      content: [
        {
          type: 'prose',
          text: 'UnoCSS 这类工具类生成器可以把系统变量放进它们的主题配置或 shortcuts。类名保持语义化（`bg-surface`、`text-primary`），让值指向系统 token。',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'UnoCSS 风格的配置',
          code: `export default defineConfig({
  theme: {
    colors: {
      surface: 'var(--color-background-surface)',
      primary: 'var(--color-text-primary)',
      border: 'var(--color-border)',
      accent: 'var(--color-accent)',
    },
    spacing: {
      4: 'var(--spacing-4)',
    },
  },
  shortcuts: {
    'astryx-card': 'bg-surface text-primary border border-border rounded-lg p-4',
  },
});`,
        },
        {
          type: 'prose',
          text: '静态工具类提取器看不到动态拼出来的类名。优先使用显式的类名字符串，或该库的 safelist/源码注册机制。',
        },
      ],
    },
    {
      title: '互操作清单',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '尽早导入 reset/base CSS 与主题 CSS 文件，赶在首次绘制之前。生产环境 SSR 优先用 `{@command theme build}` 产出的构建版主题，或已发布的 `/built` 主题导入加 `theme.css`。',
            '为颜色模式选定唯一拥有者。Theme 用 `data-theme="light|dark"` 与 `color-scheme` 来解析 `light-dark()` token。',
            '外部库的语义层按意图映射到系统变量，而不是按字面命名一一对应。例如 MUI 的 `background.paper` 映射到 `--color-background-surface`。',
            '建立映射时使用 {@link namespace:tokens} 与聚焦 token 的文档。映射先从小的集合起步：text、surface/body/card/popover、border、accent、status、spacing、radius、typography、shadow。',
            'token 解析 API 只用于需要解析值的非 CSS API。',
          ],
        },
      ],
    },
  ],
};
