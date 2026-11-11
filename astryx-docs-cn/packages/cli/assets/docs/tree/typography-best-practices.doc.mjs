// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs typography/typography-best-practices`: do/don't rules
 * for using the type scale, headings, and semantic tokens.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'typography-best-practices',
  title: '最佳实践',
  placement: {parent: 'namespace:typography', slot: 'guides', order: 30},
  category: 'foundations',
  description:
    '使用字阶、标题、展示文本与语义令牌的该做与不该做。',
  keywords: [
    '最佳实践',
    '无障碍',
    '标题层级',
    'font-size',
  ],

  sections: [
    {
      title: '最佳实践',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '文档标题用 Heading，其余都用 Text；它们会自动应用完整字阶。',
            '从整体上调整排版：在 defineTheme 中修改 base 和 ratio 来移动整条梯度（例如编辑类内容用 { base: 16, ratio: 1.25 }，高密度界面用 { base: 12, ratio: 1.125 }）。',
            '当展示文本作为页面标题时，用 as="h1"（或 h2/h3）搭配 display 类型；这样既保留无障碍性又获得展示级字号。更好的做法是用 `<Heading level={1} type="display-1">`，语义与样式一并处理。',
            '让行高通过字阶吸附到 4px 网格；expandTypeScale 会从 base 和 ratio 自动计算行距。',
            '次要信息用 supporting 类型：时间戳、辅助文本、元数据、说明文字。',
            '当视觉层级与文档大纲不一致时（例如侧边栏或卡片标题），在 Heading 上使用 accessibilityLevel。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '手动设置 font-size 或 line-height；请改用语义字阶令牌，让整条梯度保持一致并对齐 4px 网格。',
            '跳过标题层级（例如从 h1 直接到 h3）；屏幕阅读器依赖连续不断的层级。用 accessibilityLevel 把视觉层级与语义层级解耦。',
            '把 display 类型用于正文内容或页内小节；它们专为 hero/营销/数据标注场景设计。',
            '通过覆盖单个字号令牌（--font-size-lg）来"微调"某个标题；应改为调整 base/ratio，让比例在整个字阶上保持协调。',
            '使用原始数字字重值（400、600）；请引用语义字重令牌，让主题可以重新映射它们。',
          ],
        },
      ],
    },
  ],
};
