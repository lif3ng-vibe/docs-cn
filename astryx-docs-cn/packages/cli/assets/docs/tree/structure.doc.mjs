// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/structure`: rank the content in each region,
 * then pick the weakest container that groups it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'structure',
  title: '结构',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 20},
  category: 'guide',
  description:
    '给每个区域的内容排出层级，再挑选能将其归组的最弱容器。',
  keywords: [
    '文字层级',
    'Card',
    'Section',
    'Table',
    'List',
    '容器',
    '行',
    '次要',
    'Divider',
  ],

  sections: [
    {
      id: 'structure',
      title: '结构',
      content: [
        {
          type: 'prose',
          text: '给每个区域的内容排出层级，再挑选能将其归组的最弱容器。"文字层级"与"Card 还是行"两节各覆盖其中一步；以下规则对全部情况都适用。',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            '每个区域只有一个主标题（lead）；用字重与颜色排层级；主要操作只放一个',
            '正文保持默认样式；降级靠字重与颜色，而非字号',
            '默认用 Section；选用视觉上能成组的最弱容器',
            '集合渲染成行（Table 或 List），通栏排布并配分隔线',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '把正文变灰变小，导致整个区域看起来像次要元数据',
            '把 disabled 色用于内容；它对比度不达标，且专用于禁用控件',
            'Card 泛滥：每条记录各自包一层 Card，而不是渲染成行',
            'Card 套 Card，或用整宽 Card 层叠充当页面结构',
            'Flexbox 泛滥：用层层嵌套的临时 flexbox，而不是 Grid、Layout、Section 或 FormLayout',
            '同一区域出现两个互相竞争的主要操作',
            '把 Badge 当装饰用；状态与元数据请用 StatusDot 或 Token',
          ],
        },
      ],
    },
    {
      id: 'type-hierarchy',
      title: '文字层级',
      content: [
        {
          type: 'prose',
          text: '给每个区域一个主标题（lead），其余内容用字重与颜色排层级，而不是字号。内容只用两种文字颜色——primary 与 secondary，没有更暗的：正文完全不需要任何 prop。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '正文（默认）：裸 Text，不带 type、color 或 size prop',
            '主标题：用与页面深度匹配级别的 Heading，或加重字重的正文 Text',
            '辅助说明：换用 secondary 颜色，而不是缩小字号',
            '元数据：用 supporting 文字，或用 StatusDot、Token 代替文字段落',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '正文，外加一行四个层级',
          code: `// Body copy takes no props. Text already defaults to body
// size in the primary color.
<Text>Credentials rotate every 90 days</Text>

<HStack gap={2}>
  <Text weight="semibold">Payments API</Text>
  <StatusDot variant="success" label="Healthy" />
  <Text color="secondary">v2.14</Text>
  <Text type="supporting">edited 3h ago</Text>
</HStack>`,
        },
        {
          type: 'prose',
          text: '眯眼测试：模糊状态下，你应依次读到主标题、辅助说明，再到各个分组。如果所有内容同时涌出来，就用字重与颜色拉开对比，而不是加边框，也不是缩小文字。',
        },
      ],
    },
    {
      id: 'containers',
      title: 'Card 还是行',
      content: [
        {
          type: 'prose',
          text: '从视觉上能成组的最弱容器用起，只有它不够用时才升级。由弱到强：',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'spacing 与 gap：同一组内的相关条目。默认的节奏',
            'Divider：密集列表或工具栏中的同级项，或把页头与可滚动主体隔开',
            'Section：默认的页面结构单元，一个标题下的相关内容。无边框',
            'Card：自成一体的部件（KPI 卡片、图表、画廊条目），或给关键内容划出的硬边界',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Section 作为默认单元',
          code: `// Records are rows in one Section, not one Card each.
// Recommended row height: 32–40px.
<Section padding={0}>
  <List header={<Heading level={3}>Members</Heading>} hasDividers>
    {/* ListItem per member */}
  </List>
</Section>`,
        },
        {
          type: 'prose',
          text: '判断法：记录渲染成行——列状数据用 Table，单行内容用 List；自成一体或需要硬边界的部件用 Card；其余一律用 Section。',
        },
      ],
    },
  ],
};
