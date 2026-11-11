// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/template-assets/template-styles`:
 * style a template with Astryx first, keep editable styles in the file, and
 * ship shared CSS from the package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-styles',
  placement: {
    parent: 'namespace:template-assets',
    slot: 'guides',
    order: 20,
  },
  title: '样式',
  category: 'guide',
  description:
    '让复制来的 UI 保持在应用的主题上：优先使用 Astryx 的 prop 与令牌，可编辑样式保留在文件内，共享 CSS 从你的包中交付。',
  sections: [
    {
      id: 'start-with-astryx',
      title: '从 Astryx 开始',
      content: [
        {
          type: 'prose',
          text: '在编写自定义 CSS 之前，先使用 Astryx 的组件 prop、布局原语与设计令牌。这样能让复制得到的结果与宿主主题保持一致，并减少应用继承的样式契约。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '使用 Stack 与 Grid 的间距 prop，而不是在子元素之间加 margin。',
            '优先使用组件的变体（variant）、尺寸、内边距与对齐 prop，而不是重新样式化内部结构。',
            '当 Astryx 未把某个值暴露为 prop 时，使用公开的主题令牌导出。',
            '不要复制私有生成的类名，也不要用选择器命中组件内部。',
          ],
        },
      ],
    },
    {
      id: 'keep-editable-styles-with-the-source',
      title: '可编辑样式跟随源文件',
      content: [
        {
          type: 'prose',
          text: '当样式属于可编辑起点的一部分时，直接在模板文件中定义它。',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  trend: {
    color: colorVars['--color-text-success'],
    minWidth: 0,
  },
});

// Later: <Text xstyle={styles.trend}>Up 12%</Text>`,
        },
        {
          type: 'prose',
          text: '只有当 Astryx 的 prop 与令牌都不适用时，才使用自定义声明。每一条都会计入 {@link generic:template-grading-rubric} 的 Custom CSS 类别。',
        },
      ],
    },
    {
      id: 'publish-shared-css',
      title: '审慎发布共享 CSS',
      content: [
        {
          type: 'prose',
          text: '当样式表必须归包持有时，在模板中通过其公开的包路径导入它。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'templates/acme-dashboard.tsx',
          code: "import '@acme/astryx-widgets/styles/acme-dashboard.css';",
        },
        {
          type: 'prose',
          text: '然后导出该路径，并将文件纳入包中（{@link generic:export-template-assets}）。TypeScript 6 及更高版本默认检查副作用导入，因此只有当应用或其框架声明了 `*.css` 模块时，这条导入才能通过类型检查。',
        },
      ],
    },
  ],
};
