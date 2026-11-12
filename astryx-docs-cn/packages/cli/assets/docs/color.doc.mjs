// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'color',
  title: '颜色',
  category: 'foundations',
  description:
    '用于表面、文字、图标、边框与状态指示的语义颜色令牌。',
  tokenCategory: 'color',

  sections: [
    {
      title: '概览',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '颜色是语义化的：令牌描述用途而非外观。每种颜色都通过 CSS light-dark() 在浅色与深色模式间自动适配。主题覆盖解析后的取值，因此你的代码从不引用裸十六进制颜色。',
        },
      ],
    },
    {
      id: 'surface-colors',
      title: '颜色令牌',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '分层表面层级：body → surface → card → popover。每一层在视觉上都位于上一层之上。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Color Tokens',
        },
      ],
    },
    {
      id: 'usage',
      title: '在 StyleX 中使用颜色令牌',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '导入带类型的颜色令牌并在 `stylex.create()` 中使用；它们会解析到当前激活的主题与颜色模式。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '应用颜色令牌',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    borderColor: colorVars['--color-border'],
  },
  accent: {
    color: colorVars['--color-text-accent'],
  },
});`,
        },
      ],
    },
    {
      title: '最佳实践',
  category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '使用语义令牌（--color-text-primary），而非裸十六进制值。',
            '依赖表面层级（body → surface → card → popover）表达层叠。',
            '状态色（success、error、warning）只用于其语义含义。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "硬编码十六进制值，因为它们无法适配深色模式或自定义主题。",
            '在同一上下文中混用强调色与状态色。',
            '在非强调色背景上使用 --color-on-accent。',
          ],
        },
      ],
    },
  ],
};
