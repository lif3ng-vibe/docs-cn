// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/side-panels`: add a master-detail side panel
 * that opens on row select instead of navigating away.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'side-panels',
  title: '侧面板',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 35},
  category: 'guide',
  description:
    '添加主从式（master-detail）侧面板：选中行时打开面板，而不是跳转离开。',
  keywords: [
    'LayoutPanel',
    '侧面板',
    '主从式',
    'ResizeHandle',
    'useResizable',
    'EmptyState',
    'isScrollable',
    '详情面板',
    '分栏视图',
  ],

  sections: [
    {
      id: 'side-panels',
      title: '侧面板',
      content: [
        {
          type: 'prose',
          text: '主从式（master-detail）：选中一行会打开固定宽度的侧面板，而不是跳转离开。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'LayoutPanel 放在 Layout 的 start 或 end 插槽中，守住固定的宽度预算',
            '用 hasDivider 与内容区隔开；isScrollable 让较长的详情自行滚动',
            '要允许用户调节宽度，把 useResizable() 与面板内侧边缘的 ResizeHandle 成对使用：start 插槽中放在面板之后，end 插槽中放在面板之前并加 isReversed',
            '此时分隔线归 ResizeHandle 管，所以面板要设置 hasDivider={false}',
            '未选中任何内容时渲染 EmptyState，该区域因此永不塌缩',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '固定面板，然后是可调宽度形态',
          code: `// Recommended panel width: 340–420.
<Layout
  content={<LayoutContent>{/* rows */}</LayoutContent>}
  end={
    <LayoutPanel width={380} hasDivider isScrollable label="Details">
      {/* detail fields, or EmptyState when nothing is selected */}
    </LayoutPanel>
  }
/>

// Resizable: handle first in an end slot, and isReversed so
// dragging left widens the panel.
end={
  <>
    <ResizeHandle isReversed hasDivider resizable={panel.props}
      label="Resize details" />
    <LayoutPanel width={panel.size} hasDivider={false} />
  </>
}`,
        },
        {
          type: 'prose',
          text: '自查：窄宽度下面板让出宽度而不是挤压内容（见响应式指南），且两个区域之间只有一个元素画边框。',
        },
      ],
    },
  ],
};
