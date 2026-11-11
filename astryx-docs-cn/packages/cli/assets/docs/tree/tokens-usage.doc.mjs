// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-usage",
  "title": "在 StyleX 中的用法",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 160
  },
  "category": "foundations",
  "description": "如何在 StyleX 样式中导入并使用令牌变量。",
  "sections": [
    {
      "title": "在 StyleX 中的用法",
      "content": [
        {
          "type": "code",
          "lang": "tsx",
          "label": "使用令牌导入",
          "code": "import * as stylex from '@stylexjs/stylex';\nimport {colorVars, spacingVars, sizeVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';\nimport {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';\n\nconst styles = stylex.create({\n  card: {\n    padding: spacingVars['--spacing-4'],\n    backgroundColor: colorVars['--color-background-surface'],\n    borderRadius: radiusVars['--radius-container'],\n  },\n  series: {\n    color: dataVars['--color-data-categorical-blue'],\n  },\n  button: {\n    height: sizeVars['--size-element-md'],\n  },\n});"
        },
        {
          "type": "prose",
          "text": "在 StyleX、DOM 样式与 SVG 表现属性中使用 `dataVars`。Canvas 等需要具体模式解析值的 API 应改用 `resolveThemeToken()` 或 `useTheme().token()`。原生 CSS 只有在编译后的 dataVars 输出有保证、或声明带有显式回退值时，才可以使用稳定的自定义属性名。xstyle、className 与复合组件模式见 {@link namespace:styling}；用 defineTheme 覆盖令牌见 {@link generic:author-a-theme}。"
        }
      ]
    }
  ]
};
