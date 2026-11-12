// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'spacing',
  title: '间距',
  category: 'foundations',
  description:
    '用于 padding、gap 与 margin 的间距刻度令牌：设计系统布局的节奏基础。',
  keywords: ['padding', 'margin', 'gap'],
  tokenCategory: 'spacing',

  sections: [
    {
      title: '概览',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "设计系统使用 4px 基准单位的间距刻度，以 rem 书写，让间距与内边距像文字一样随读者的浏览器字号增长：每档 0.25rem，在默认 16px 根字号下即 4px。组件的 gap prop 接受映射到这些令牌的档位值。刻度在小尺寸端提供细粒度控制（2px、4px、6px），在更大尺寸上保持一致节奏（4px 的倍数）。",
        },
      ],
    },
    {
      title: '刻度',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '十五个间距令牌，从 0 到 3rem（默认 16px 根字号下为 0px 到 48px）。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Spacing Tokens',
        },
      ],
    },
    {
      title: '用法',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Stack、HStack、VStack、Grid、Toolbar、OverflowList 与 ChatMessageList 接受 `gap` 档位：0、0.5、1、1.5、2、3、4、5、6、8 或 10（×4px）。Carousel 接受 0 到 4 的档位。自定义布局则在 StyleX 中使用间距令牌。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '组件 prop 间距与 StyleX 间距对比',
          code: `// Via component props (preferred)
<Stack gap={4}>{/* 16px gap */}</Stack>

// Via StyleX tokens (custom layouts)
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  custom: {
    padding: spacingVars['--spacing-4'],
    gap: spacingVars['--spacing-3'],
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
            '有组件 gap prop 就用它；它会处理自动的间距补偿。',
            "为保持一致而坚守刻度。若某个值不在刻度上，重新考虑设计。",
            '紧凑的内部间距用小档（0.5–2），区块间隔用大档（4–8）。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '使用刻度之外的任意像素值。',
            '在同一组件中混用间距令牌与裸 px/rem 值。',
          ],
        },
      ],
    },
  ],
};
