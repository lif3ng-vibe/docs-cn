// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/css-and-stylex`: core integration
 * principle, plain CSS / CSS Modules, and StyleX typed-token imports.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'css-and-stylex',
  title: 'CSS & StyleX',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 10},
  category: 'guide',
  description:
    '核心集成原则、普通 CSS / CSS Modules，以及 StyleX 类型化令牌导入。',

  sections: [
    {
      title: '核心原则',
      content: [
        {
          type: 'prose',
          text: '让系统始终作为主题值的真值来源。组件从 CSS 自定义属性读取设计令牌，例如 `--color-text-primary`、`--color-background-surface`、`--spacing-4` 和 `--radius-container`。其他样式库应尽可能把自己的语义令牌、工具类名或主题对象映射到这些系统 CSS 变量。',
        },
        {
          type: 'prose',
          text: '普通 DOM 样式使用 CSS 变量：它们沿组件树继承、跟随 `data-theme` 颜色模式、遵循嵌套的 `data-astryx-theme` 作用域，并在主题切换时更新。令牌解析器 API 只给非 CSS 的消费方用，例如 SVG 属性值、canvas、图表配置、颜色计算或静态配置生成。',
        },
        {
          type: 'prose',
          text: '可用令牌的名称与值，运行 {@link namespace:tokens} 查看。聚焦的参考还有 {@link generic:color}、{@link generic:spacing}、{@link generic:shape}、{@link namespace:typography}、{@link generic:elevation} 和 {@link generic:motion}。',
        },
      ],
    },
    {
      title: '选择集成路径',
      content: [
        {
          type: 'prose',
          text: '选择适合该样式库的最窄集成路径。大多数 DOM 样式应留在 CSS 变量路径上；JavaScript 令牌解析只用于无法消费 CSS 自定义属性的 API。',
        },
        {
          type: 'table',
          headers: ['路径', '适用场景', '值形态'],
          rows: [
            [
              'CSS 变量别名',
              '该库最终写出 CSS 且接受字符串值',
              '`var(--color-text-primary)`',
            ],
            [
              'StyleX 令牌导入',
              '你在应用代码中编写 StyleX 样式',
              "`colorVars['--color-text-primary']`",
            ],
            [
              'Tailwind 桥接',
              '你想要由当前系统令牌支撑的工具类',
              '`@astryxdesign/core/tailwind-theme.css`',
            ],
            [
              '设计令牌解析器 API',
              'JavaScript 需要为图表、canvas、SVG 或配置对象取令牌值',
              "`resolveThemeToken(theme, '--color-data-categorical-blue', {mode})`",
            ],
          ],
        },
      ],
    },
    {
      title: '最佳实践',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '按语义意图映射：文字、表面、边框、强调色、状态、圆角、间距、排版。',
            '颜色模式交给系统管理。根 Theme 会把 `data-theme="light|dark"` 和 `data-astryx-theme` 同步到 `<html>`，服务于 portal 和第一层主题作用域。',
            '运行时主题切换与嵌套主题优先用 CSS 变量。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '在 `var(...)` 引用可行时，把原始 hex/px 值复制进另一份主题对象。',
            '再运行一个与 Theme 不一致、不同步的深色模式 provider。',
            '把其他库的 CSS 变量当成系统的真值来源。有些消费方需要在 DOM 之外取令牌值。',
          ],
        },
      ],
    },
    {
      title: '普通 CSS 与 CSS Modules',
      content: [
        {
          type: 'prose',
          text: '最简单的集成是直接使用 CSS 变量。CSS Modules 会限定类名的作用域，但系统令牌变量是全局/继承值，由包的 CSS 与当前主题提供。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Card.module.css',
          code: `.card {
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-container);
  padding: var(--spacing-4);
}`,
        },
        {
          type: 'prose',
          text: 'Sass 变量只在编译期有效。它们适合生成静态 CSS，但在系统切换主题或颜色模式时不会更新。可主题化的值请用原生 CSS 自定义属性。',
        },
      ],
    },
    {
      title: 'StyleX',
      content: [
        {
          type: 'prose',
          text: '编写 StyleX 样式时，优先使用 `@astryxdesign/core/theme/tokens.stylex` 的类型化令牌导出。它们提供自动补全、能抓住令牌名拼写错误，同时运行时仍通过同一批系统 CSS 变量解析。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '类型化令牌导入',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  panel: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    padding: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
  },
});`,
        },
        {
          type: 'prose',
          text: '组件覆盖用 `xstyle`，自己的 DOM 节点用 `stylex.props()`。集成非 StyleX 样式库时用 `className`。',
        },
      ],
    },
  ],
};
