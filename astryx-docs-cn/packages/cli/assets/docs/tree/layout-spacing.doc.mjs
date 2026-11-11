// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/spacing`: hold one content line per region, then
 * tune gaps and density.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'layout-spacing',
  title: '布局间距',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 40},
  category: 'guide',
  description: '每个区域保持一条内容线，再调优间距与密度。',
  keywords: [
    '对齐',
    '内容线',
    '节奏',
    '间距',
    '密度',
    'padding',
    '内缩',
    '紧凑',
    '宽松',
    'FormLayout',
  ],

  sections: [
    {
      id: 'spacing',
      title: '间距',
      content: [
        {
          type: 'prose',
          text: '每个区域保持一条内容线，再调优间距与密度。对齐、节奏、密度与尺寸三节都建立在这些规则之上。',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            '由容器持有 padding，子元素将自己的 margin 归零',
            '每个区域保持一条内容线：文字落在线上，悬停背景铺满到边缘',
            '一个区域的头部、正文与页脚共用同一个 padding token',
            '用紧凑间距与宽松间距形成对比，让分组无需边框即可读出',
            '每行只用一种控件尺寸；密度与使用频率匹配',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '双重 padding：组件缩进超过其 Section 标题（内缩只允许一个持有者）',
            '内部间距使用裸 px；只能用 token，px 仅用于结构性宽度',
            '到处重复同一个间距值，这会抹平分组层次',
            '同一行混用多种控件尺寸',
          ],
        },
      ],
    },
    {
      id: 'alignment',
      title: '对齐',
      content: [
        {
          type: 'prose',
          text: '容器持有 padding 与子元素间距；子元素将 margin 归零，内部间距永远是 token。每个区域选定一条内容线并保持恒定，变的是 padding 而非内容线：`container_inset = content_line - component_intrinsic_inset`。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Text 与 Heading 不带内缩，容器因此获得完整 padding',
            'List、Tab、Menu 与导航项自带小内缩，容器因此让出 padding，由组件持有内容线',
            'Table 单元格内缩更大，容器因此让出 padding，由单元格持有内容线',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '一条内容线，两个内缩持有者',
          code: `// Target content line = 16px.
// Heading has 0 inset, so the Section takes the full padding.
<Section padding={4}><Heading level={3}>Members</Heading></Section>

// List has ~8px built in, Table cells 12–16px, so the Section
// gives up its padding and the component owns the inset.
<Section padding={0}><List>{/* items */}</List></Section>`,
        },
        {
          type: 'prose',
          text: '验证方法：沿区域左侧画一条垂直线，每个标签都触到这条线；只有悬停与选中背景会越过它。',
        },
      ],
    },
    {
      id: 'rhythm',
      title: '节奏',
      content: [
        {
          type: 'prose',
          text: '分组来自紧凑间距与宽松间距的对比，而不是到处重复同一个值。如果每个间距都是同一档，邻近性就起不了作用。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '紧凑间距负责聚合：最小的档位，用在条目或字段内部',
            '宽松间距负责分隔：向上跳几档，用在区块之间',
            '调优节奏时用中间档位，而不是把一切都归并到同样的两个值',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '内部紧凑，区块之间宽松',
          code: `// Tight binds at gap={1}–{2}, generous separates at gap={4}–{6}.
// In-between steps tune cadence: gap={3} = 12px, gap={5} = 20px.
<VStack gap={6}>
  <VStack gap={1}>
    <Text weight="semibold">Retention</Text>
    <Text color="secondary">Logs are kept for 30 days</Text>
  </VStack>
  <VStack gap={1}>{/* next label and value */}</VStack>
</VStack>`,
        },
        {
          type: 'prose',
          text: '验证方法：去掉所有边框后，仅凭间距仍能说出分组归属。如果做不到，说明间距过于均匀。表单字段是例外：FormLayout 负责它们的间距。',
        },
      ],
    },
    {
      id: 'density',
      title: '密度与尺寸',
      content: [
        {
          type: 'prose',
          text: '让密度与区域的使用频率匹配，并让同一行的每个控件使用相同尺寸，使高度共享一条基线。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '紧凑：需要快速扫读的高信息量区域，如日志、监控与大型数据集',
            '均衡：大多数 Table 与 List 表面',
            '宽松：低频或高风险的行，如设置页或简短的选择列表',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '密度与控件尺寸配对',
          code: `// Pair density with one control size: compact with sm,
// balanced with sm or md, spacious with md or lg.
<Table data={rows} columns={columns} density="compact" hasHover />
<Button label="Retry" size="sm" variant="ghost" />`,
        },
        {
          type: 'prose',
          text: '验证方法：同一行的每个可交互元素共享一个尺寸，且该尺寸与其所在区域的密度配对。',
        },
      ],
    },
  ],
};
