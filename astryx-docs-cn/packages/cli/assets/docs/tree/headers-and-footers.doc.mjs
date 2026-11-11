// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/headers-and-footers`: pin a header or footer
 * while the body scrolls.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'headers-and-footers',
  title: '页眉与页脚',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 30},
  category: 'guide',
  description:
    '在主体滚动时固定页眉或页脚，让标题与提交操作始终可达。',
  keywords: [
    'LayoutHeader',
    'LayoutFooter',
    'Toolbar',
    'defaultHasDividers',
    '固定页眉',
    '固定页脚',
    '滚动的主体',
  ],

  sections: [
    {
      id: 'headers-and-footers',
      title: '页眉与页脚',
      content: [
        {
          type: 'prose',
          text: '一个区域可以在主体滚动时固定页眉或页脚。两者都是 Layout 的插槽，且在 Layout 上设置一次 padding 即可覆盖全部三者，因此页眉、主体与页脚共用同一条内容线。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'header 插槽中放 LayoutHeader：区域标题与其主要操作',
            '当页眉承载交互控件时，用 Toolbar 替代 LayoutHeader',
            'footer 插槽中放 LayoutFooter：提交工作的操作，必须保持可达',
            'Layout 上的 defaultHasDividers 一次性为两者加分隔线，而非按插槽逐个设置 hasDivider',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '滚动主体两侧固定的页眉与页脚',
          code: `// padding on Layout reaches every slot, so all three align.
<Layout
  padding={4}
  defaultHasDividers
  header={<LayoutHeader>{/* title + primary action */}</LayoutHeader>}
  content={<LayoutContent>{/* rows */}</LayoutContent>}
  footer={<LayoutFooter>{/* Save and Cancel */}</LayoutFooter>}
/>`,
        },
        {
          type: 'prose',
          text: '验证方式：滚动主体。页眉与页脚保持原位，分隔线贯通整行，且三者仍共用同一条左侧内容线。',
        },
      ],
    },
  ],
};
