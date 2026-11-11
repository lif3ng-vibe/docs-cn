// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Card',
  displayName: 'Card',
  group: 'Card',
  category: 'Container',
  keywords: ["card","表面","面板","容器","凸起","阴影","盒子","纸片","瓦片","凹槽"],
  usage: {
    description:
      'Card 是带边框、可凸起的容器，用于离散、自包含的条目：可以独立重排、移除或交互的东西。Card 不是默认布局工具。大多数内容分组根本不需要容器；间距与对齐自然形成视觉分组。只有当条目需要清晰的交互边界或网格中的视觉对比时才使用 Card。',
    bestPractices: [
      {guidance: true, description: '问自己 "它能被独立重排或移除吗？" 能，就是卡片；不能，它只是页面的一个区块：用标题 + Stack 或 Section。'},
      {guidance: true, description: '卡片用于离散条目：单个用户资料、单条通知、单个指标、网格中的一个产品。每张卡片代表一个有清晰交互边界的 "东西"。'},
      {guidance: true, description: '仅凭间距与对齐就能形成视觉分组。并非所有内容都需要容器；试着去掉卡片，看分组是否仍靠留白与排版清晰可辨。'},
      {guidance: true, description: '同级卡片的内边距保持一致，让它们在网格或列表中视觉对齐。'},
      {guidance: true, description: '需要结构化头部、可滚动内容与带操作的页脚时，将卡片与 Layout 搭配。'},
      {guidance: true, description: '在手机上让卡片共占一行或一个网格：卡片收缩以适应轨道，并在边缘裁剪无法换行的内容。长 ID、哈希与 URL 用 Text maxLines={1} 截断（完整值在 tooltip 中显示），宽内容给它自己的滚动区域：Table 自带滚动；代码或其他宽内容放进 ScrollableArea。'},
      {guidance: false, description: '不要默认用卡片做视觉分组。标题 + Stack 配合适当间距即可建立层级，无需到处加边框。卡片应是例外，而非默认。'},
      {guidance: false, description: '不要把页面区块包进卡片。"General Settings"、"Notification Preferences"、表单分组都是页面区域，用 Section 或标题 + 堆叠。'},
      {guidance: false, description: '不要创建完全相同的卡片网格（图标 + 标题 + 文本反复重复）。改变布局，或质疑是否真的需要卡片。'},
      {guidance: false, description: '不要把卡片嵌进卡片；压平层级，或改用间距与分隔线。'},
      {guidance: false, description: '不要用颜色变体表达状态；那是 Banner 或 Badge 的事。颜色卡片用于分类。'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: '带边框、背景、圆角与内边距的外层盒子。'},
      {name: 'Content', required: true, description: '渲染在卡片内的任意 children，常见为标题、文本与操作的堆叠。'},
    ],
  },
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: '卡片宽度（数字 = 像素，字符串 = 按原样使用）。在 flex 行或网格轨道中这是期望宽度：行更窄时卡片会收缩到该值以下。要在 flex 行中保住宽度，将卡片包进 StackItem（默认 static），让整行换行或滚动。在 Grid 中，在 Card 上设置消费者侧的 minWidth 并相应设置轨道尺寸。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '卡片高度（数字 = 像素，字符串 = 按原样使用）。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '卡片最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '卡片最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在卡片内部渲染的内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '使用间距刻度的内边距。省略时卡片采用主题的卡片内边距而非某个步进值，因此传入步进值意味着决定覆盖主题，而不是复述默认值。',
      default: '主题的卡片内边距（无主题时为间距步进 4）',
    },
    {
      name: 'variant',
      type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        '背景颜色变体。`default` 使用标准卡片背景；`transparent` 完全去掉背景；`muted` 使用弱化卡片的柔和背景。非语义变体使用对应的 `--color-background-<name>` 令牌。',
      default: "'default'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        '静止阴影深度。`none` 为扁平；`low`/`med`/`high` 对应阴影令牌刻度。只有当卡片需要浮于周围内容之上时才升高。',
      default: "'none'",
    },
  ],
  examples: [
    {
      label: '手机上共占一行的卡片（含长 ID）',
      code: `
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const payouts = [
  {label: 'Payout', amount: '$1,240.00', id: 'po_1Q8ZK4X7M2N5P3R6T9V1W4YB'},
  {label: 'Refund', amount: '-$86.50', id: 're_3NfK9Lm2Qx7Vb4Tz8Rw1Hy6C'},
  {label: 'Adjustment', amount: '$12.00', id: 'adj_7Hq2Wm9Kx4Lz8Vn3Rb6Tf1PD'},
];

// Each card takes one grid track and shrinks with it, so three cards fit a
// 390px phone without widening the page. The ID cannot wrap, so it truncates
// with maxLines={1} (the full value shows in a tooltip) instead of running
// past the card edge.
function PayoutCards() {
  return (
    <Grid columns={3} gap={3}>
      {payouts.map(payout => (
        <Card key={payout.id}>
          <VStack gap={1}>
            <Heading level={3}>{payout.label}</Heading>
            <Text hasTabularNumbers>{payout.amount}</Text>
            <Text type="supporting" maxLines={1}>
              {payout.id}
            </Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
`,
    },
  ],
  playground: {
    defaults: {
      children: {
        __element: 'VStack',
        props: {gap: 2},
        children: [
          {__element: 'Heading', props: {level: 3}, children: '卡片标题'},
          {__element: 'Text', props: {type: 'body'}, children: '卡片内容在此。这是一个带标题与正文的卡片。'},
        ],
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'astryx-card', visualProps: ['variant', 'elevation']},
    ],
    vars: [
      {name: '--_card-radius', description: '卡片的圆角', default: 'var(--radius-container)', private: true},
      {name: '--_card-elevation', description: '卡片的静止阴影，由 elevation prop 设置。与 --_card-ring 一起合成到卡片 box-shadow 列表，而非直接写为 boxShadow，使圆环与阴影可共存。', default: '0 0 transparent', private: true},
      {name: '--_card-ring', description: '绘制在卡片 box-shadow 列表中的内嵌圆环。SelectableCard 设置它以显示选中态而不接管阴影。', default: '0 0 transparent', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_card-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  displayName: 'Card',
  usage: {
    description:
      'Card 是带边框、可凸起的容器，用于离散、自包含的条目：可以独立重排、移除或交互的东西。Card 不是默认布局工具。大多数内容分组根本不需要容器；间距与对齐自然形成视觉分组。只有当条目需要清晰的交互边界或网格中的视觉对比时才使用 Card。',
    bestPractices: [
      {guidance: true, description: '问自己 "它能被独立重排或移除吗？" 能，就是卡片；不能，它只是页面的一个区块：用标题 + Stack 或 Section。'},
      {guidance: true, description: '卡片用于离散条目：单个用户资料、单条通知、单个指标、网格中的一个产品。每张卡片代表一个有清晰交互边界的 "东西"。'},
      {guidance: true, description: '仅凭间距与对齐就能形成视觉分组。并非所有内容都需要容器；试着去掉卡片，看分组是否仍靠留白与排版清晰可辨。'},
      {guidance: true, description: '同级卡片的内边距保持一致，让它们在网格或列表中视觉对齐。'},
      {guidance: true, description: '需要结构化头部、可滚动内容与带操作的页脚时，将卡片与 Layout 搭配。'},
      {guidance: true, description: '在手机上让卡片共占一行或一个网格：卡片收缩以适应轨道，并在边缘裁剪无法换行的内容。长 ID、哈希与 URL 用 Text maxLines={1} 截断（完整值在 tooltip 中显示），宽内容给它自己的滚动区域：Table 自带滚动；代码或其他宽内容放进 ScrollableArea。'},
      {guidance: false, description: '不要默认用卡片做视觉分组。标题 + Stack 配合适当间距即可建立层级，无需到处加边框。卡片应是例外，而非默认。'},
      {guidance: false, description: '不要把页面区块包进卡片。"General Settings"、"Notification Preferences"、表单分组都是页面区域，用 Section 或标题 + 堆叠。'},
      {guidance: false, description: '不要创建完全相同的卡片网格（图标 + 标题 + 文本反复重复）。改变布局，或质疑是否真的需要卡片。'},
      {guidance: false, description: '不要把卡片嵌进卡片；压平层级，或改用间距与分隔线。'},
      {guidance: false, description: '不要用颜色变体表达状态；那是 Banner 或 Badge 的事。颜色卡片用于分类。'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: '带边框、背景、圆角与内边距的外层盒子。'},
      {name: 'Content', required: true, description: '渲染在卡片内的任意 children，常见为标题、文本与操作的堆叠。'},
    ],
  },
  props: [
    {name: 'width', type: 'SizeValue', description: '卡片宽度（数字 = 像素，字符串 = 按原样使用）。'},
    {name: 'height', type: 'SizeValue', description: '卡片高度（数字 = 像素，字符串 = 按原样使用）。'},
    {name: 'maxWidth', type: 'SizeValue', description: '卡片最大宽度。'},
    {name: 'minHeight', type: 'SizeValue', description: '卡片最小高度。'},
    {name: 'children', type: 'ReactNode', description: '在卡片内部渲染的内容。'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '使用间距比例的内边距。省略时，卡片采用主题的卡片内边距，而不是某个步进值；传入步进值意味着覆盖主题，而不是复述默认值。', default: "the theme's card padding (spacing step 4 with no theme)"},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: '背景颜色变体。`default` 使用标准卡片背景；`transparent` 完全去掉背景；`muted` 使用弱化卡片的柔和背景。非语义变体使用对应的 `--color-background-<name>` 令牌。', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '静止阴影深度。`none` 为扁平；`low`/`med`/`high` 对应阴影令牌比例。', default: "'none'"},
  ],
  theming: {
    container: true,
    targets: [
      {className: 'astryx-card', visualProps: ['variant', 'elevation']},
    ],
    vars: [
      {name: '--_card-radius', description: '卡片的圆角', default: 'var(--radius-container)', private: true},
      {name: '--_card-elevation', description: '卡片的静止阴影，由 elevation prop 设置。', default: '0 0 transparent', private: true},
      {name: '--_card-ring', description: '绘制在卡片 box-shadow 列表中的内嵌圆环。', default: '0 0 transparent', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_card-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '离散条目的带边框容器；不是默认布局工具。大多数内容不需要卡片。',
  usage: {
    description:
      'Card 用于有清晰交互边界的离散条目（一个资料、一条通知、一个产品）。Card 不是默认。间距与对齐无需边框即可形成视觉分组。问自己："它能被独立重排或移除吗？" 不能就不要用卡片。',
    bestPractices: [
      {guidance: true, description: '问自己 "它能被独立重排或移除吗？" 能，就是卡片；不能，它只是页面区块：用标题 + Stack 或 Section。'},
      {guidance: true, description: '卡片用于离散条目：一个资料、一条通知、一个指标、网格中一个产品。每张卡片 = 一个有清晰交互边界的 "东西"。'},
      {guidance: true, description: '间距 + 对齐即可形成视觉分组。并非一切都需要容器；试着去掉卡片，若分组仍靠留白 + 排版清晰可辨，就不用。'},
      {guidance: true, description: '同级卡片的内边距保持一致，让它们在网格或列表中视觉对齐。'},
      {guidance: true, description: '需要结构化头部、可滚动内容与带操作的页脚时，将卡片与 Layout 搭配。'},
      {guidance: true, description: '卡片收缩适应行/网格轨道，在边缘裁剪不可换行内容。长 ID/哈希/URL → Text maxLines={1}（tooltip 显示完整值）。宽内容 → 自有滚动区域（Table 自带滚动；其余用 ScrollableArea）。'},
      {guidance: false, description: '不要默认用卡片分组。标题 + Stack 配合适当间距即可建立层级，无需到处边框。卡片是例外，不是默认。'},
      {guidance: false, description: '不要把页面区块包进卡片。"General Settings"、"Notification Preferences"、表单分组是页面区域；用 Section 或标题 + 堆叠。'},
      {guidance: false, description: '不要创建完全相同的卡片网格（图标 + 标题 + 文本反复重复）。改变布局，或质疑是否真的需要卡片。'},
      {guidance: false, description: '不要卡片套卡片；压平层级，或改用间距 + 分隔线。'},
      {guidance: false, description: '不要用颜色变体表达状态；用 Banner 或 Badge。颜色卡片用于分类。'},
    ],
  },
  propDescriptions: {
    width: '卡片宽度（数字=px，字符串=原样）',
    height: '卡片高度（数字=px，字符串=原样）',
    maxWidth: '卡片最大宽度',
    minHeight: '卡片最小高度',
    children: '卡片内容',
    padding: '经间距刻度的内边距；省略 = 主题的卡片内边距，不是固定步进。传步进值即覆盖主题。',
    variant: '背景颜色变体；`default` = 标准卡片背景，`transparent` = 完全无背景，`muted` = 弱化卡片的柔和背景；非语义变体用对应 `--color-background-<name>` 令牌',
    elevation: '静止阴影深度：none（扁平）| low | med | high（阴影令牌刻度）。仅浮于内容之上时升高。',
  },
};
