// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/document-the-template/block-template`:
 * the block-only fields: component relationships and the preview shape.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'block-template',
  placement: {
    parent: 'namespace:document-the-template',
    slot: 'guides',
    order: 30,
  },
  title: '区块模板',
  category: 'guide',
  description:
    '描述一个较小的组合，选择其预览形态，并只在关系真实存在时才将它与组件示例关联。',
  sections: [
    {
      id: 'start-with-a-standalone-block',
      title: '从独立区块开始',
      content: [
        {
          type: 'prose',
          text: '大多数区块是独立的。除非该区块就是某个组件的示例或展示，否则请从这一形态开始。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'templates/acme-stat-card.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').IntegrationTemplateDoc} */
export default {
  type: 'block',
  name: 'acme-stat-card',
  displayName: 'Acme Stat Card',
  description:
    '一张紧凑的指标卡，含当前值、环比变化与辅助趋势线。适用于 KPI、记分卡、摘要或仪表盘统计数字。',
  isReady: false,
  aspectRatio: 4 / 3,
  componentsUsed: ['Card', 'HStack', 'Text', 'VStack'],
};`,
        },
        {
          type: 'prose',
          text: '不要仅因为区块用到了某个组件就添加 `exampleFor`。`componentsUsed` 记录的是组合关系；`exampleFor` 则声明该示例归属于某个组件。',
        },
      ],
    },
    {
      id: 'choose-the-component-relationship',
      title: '选择与组件的关系',
      content: [
        {
          type: 'prose',
          text: '每个字段的定义见 {@link schema:template-doc}。',
        },
        {
          type: 'prose',
          text: '只保留一个清晰的主归属；`also*` 字段仅用于有意设置的次级归属。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'templates/acme-status-card-showcase.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').IntegrationTemplateDoc} */
export default {
  type: 'block',
  name: 'acme-status-card-showcase',
  displayName: 'Acme Status Card Showcase',
  description:
    '展示 AcmeStatusCard 的账户健康摘要，演示状态、趋势与操作三种形态。',
  isReady: true,
  exampleFor: 'AcmeStatusCard',
  isShowcase: true,
  alsoExampleFor: ['AcmeDashboard'],
  aspectRatio: 4 / 3,
  componentsUsed: ['AcmeStatusCard', 'Button', 'HStack', 'VStack'],
};`,
        },
        {
          type: 'prose',
          text: '然后检查包范围的模板列表（{@link generic:template-doc-overview}），确认该条目带有你设置的关系。`{@command component}` 不显示集成区块，因此要在这个列表里核对。',
        },
      ],
    },
    {
      id: 'choose-a-useful-preview',
      title: '选择有用的预览',
      content: [
        {
          type: 'prose',
          text: '每个字段的定义见 {@link schema:template-doc}。',
        },
        {
          type: 'prose',
          text: '`aspectRatio` 先取下面最接近形态的值，按该比例渲染区块，再逐步调整，直到既不裁切内容也不留下大片空白。这些只是起点，不是约定默认值。',
        },
        {
          type: 'table',
          headers: ['区块形态', '起点值'],
          rows: [
            ['宽型导航、横幅、工具栏或标签页', '`16 / 4`'],
            ['方形按钮、徽标、头像、图标、加载指示器或状态', '`1`'],
            ['高型导航、日历、列表或树', '`3 / 4`'],
            ['内容卡片、对话框、表格或表单组', '`4 / 3`'],
          ],
        },
        {
          type: 'prose',
          text: '`scale` 只影响 Astryx 自身的区块预览。集成区块可以不设置它。',
        },
      ],
    },
  ],
};
