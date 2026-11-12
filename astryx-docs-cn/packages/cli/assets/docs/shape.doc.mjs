// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'shape',
  title: '形状',
  category: 'foundations',
  description:
    '边框圆角令牌，让组件圆角保持一致——从直角到全圆药丸形。',
  tokenCategory: 'radius',

  sections: [
    {
      title: '概览',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '圆角刻度使用语义化命名体系：inner → element → container → page。每个级别对应特定场景。主题可以通过圆角倍率整体缩放刻度，--radius-none 与 --radius-full 是固定锚点。',
        },
      ],
    },
    {
      title: '圆角刻度',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '七个圆角令牌，从 0px 到 9999px。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Radius Tokens',
        },
      ],
    },
    {
      title: '同心圆角',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '在有内边距的圆角容器里，给嵌套元素的圆角取外层圆角减内边距，让曲线保持同心。Card 不会替你的内容做这件事。',
        },
        {
          type: 'code',
          lang: 'css',
          label: '同心圆角公式',
          code: `.inner {
  border-radius: max(0px, calc(var(--radius-container) - var(--spacing-4)));
}`,
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
            '交互控件（按钮、输入框、选择器）用 --radius-element。',
            '内容容器（卡片、面板、对话框）用 --radius-container。',
            '药丸形（徽章、标签、头像状态点）用 --radius-full。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "小元素用 --radius-page；它是给页面级容器用的。",
            "硬编码圆角值；它们不会随主题圆角倍率缩放。",
          ],
        },
      ],
    },
  ],
};
