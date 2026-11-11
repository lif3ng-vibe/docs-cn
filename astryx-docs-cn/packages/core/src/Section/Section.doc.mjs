// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Section container',
    required: true,
    description: '为页面区域分组、带绘制背景的容器。',
  },
  {
    name: 'Consumer content',
    required: false,
    description: '由调用方提供、渲染在区域容器内的内容。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Section',
  displayName: 'Section',
  group: 'Layout',
  category: 'Layout',
  keywords: ['section', 'panel', '区块', '容器', '分组', '区域', '面板'],
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'muted'",
      description: '应用于区域容器的背景变体。',
      default: "'section'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '区域的宽度；数字按像素解释，字符串原样使用。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        '区域的高度；数字按像素解释，字符串原样使用。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '区域的最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '区域的最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在区域内部渲染的内容。',
    },
    {
      name: 'dividers',
      type: "Array<'top' | 'bottom' | 'start' | 'end'>",
      description: '区域的哪些边具有分隔线边框。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距刻度的内部内边距（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。用 padding={0} 实现贴边内容。',
      default: '4',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内（水平）内边距覆盖。只覆盖行内轴内边距，保留来自 `padding` 或容器主题默认值的块轴内边距。接受间距刻度（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内起始内边距覆盖（LTR 为左，RTL 为右）。仅在该边覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内结束内边距覆盖（LTR 为右，RTL 为左）。仅在该边覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块（垂直）内边距覆盖。只覆盖块轴内边距，保留来自 `padding` 或容器主题默认值的行内内边距。接受间距刻度（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块起始（顶部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块结束（底部）内边距，使用间距刻度。仅在该边覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象。',
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'astryx-section', visualProps: ['variant']},
    ],
    derived: [
      {property: 'padding', expand: 'container'},
    ],
  },
  usage: {
    anatomy,
    description:
      'Section 是创建页面区域、在页面上组织相关内容的正确方式。适用于设置分组、表单分区、侧边栏区域，或任何需要在页面各部分之间做视觉分隔的场景。如果想用 Card 来做页面分区，请改用 Section。',
    bestPractices: [
      { guidance: true, description: '用 Section 做页面级分组：设置面板、表单分组、侧边栏区域。它们是页面分区，而非离散条目。' },
      { guidance: true, description: '从默认变体开始。只在需要突出特定区域时用 muted。' },
      { guidance: true, description: '在背景相同、需要分隔的区域之间加分隔线。' },
      { guidance: true, description: '与标题 + Stack 组合，构成典型的页面分区模式。' },
      { guidance: false, description: '想要 Section 时不要用 Card。Card 面向离散条目（一条通知、一份资料）；Section 面向页面区域。' },
      { guidance: true, description: "要让 Section 居中，在 xstyle 中把 marginInlineStart 和 marginInlineEnd 设为 'auto'。如果 Astryx 源码在你的应用自己的 StyleX 编译中处理，marginInline 简写会输给 Section 自身的行内外边距。" },
    ],
  },
  examples: [
    {
      label: '用最大宽度居中一个 Section',
      code: `import * as stylex from '@stylexjs/stylex';
import {Section} from '@astryxdesign/core/Section';

const styles = stylex.create({
  centered: {marginInlineStart: 'auto', marginInlineEnd: 'auto'},
});

function Page({children}: {children: React.ReactNode}) {
  return (
    <Section maxWidth={1280} xstyle={styles.centered}>
      {children}
    </Section>
  );
}`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Section',
  displayName: 'Section',
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'muted'",
      description: '应用于区域容器的背景变体。',
      default: "'section'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '区域的宽度；数字类型会被解释为像素值，字符串类型按原样使用。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        '区域的高度；数字类型会被解释为像素值，字符串类型按原样使用。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '区域的最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '区域的最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在区域内部渲染的内容。',
    },
    {
      name: 'dividers',
      type: "Array<'top' | 'bottom' | 'start' | 'end'>",
      description: '区域的哪些边具有分隔线边框。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内部内边距（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。使用 padding={0} 实现全宽内容。',
      default: '4',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内（水平）方向内边距覆盖。仅覆盖行内轴内边距，同时保留来自 padding 或容器主题默认值的块内边距。使用间距比例（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内起始内边距覆盖（LTR 中为左侧，RTL 中为右侧）。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内结束内边距覆盖（LTR 中为右侧，RTL 中为左侧）。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块（垂直）方向内边距覆盖。仅覆盖块轴内边距，同时保留来自 padding 或容器主题默认值的行内内边距。使用间距比例（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块起始（顶部）内边距，使用间距刻度。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块结束（底部）内边距，使用间距刻度。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'astryx-section', visualProps: ['variant']},
    ],
    derived: [
      {property: 'padding', expand: 'container'},
    ],
  },
  usage: {
    anatomy,
    description:
      'Section is the correct way to create page regions and group related content on a page. Use it for settings groups, form sections, sidebar areas, or any time you need visual separation between parts of a page. If you are tempted to use a Card for a page section, use Section instead.',
    bestPractices: [
      { guidance: true, description: 'Use Section for page-level grouping: settings panels, form groups, sidebar regions. These are sections of a page, not discrete items.' },
      { guidance: true, description: 'Start with the default variant. Use muted only to call attention to a specific region.' },
      { guidance: true, description: '在背景相同、需要分隔的区域之间加分隔线。' },
      { guidance: true, description: 'Combine with a heading + Stack for a typical page section pattern.' },
      { guidance: false, description: 'Use Card when you mean Section. Cards are for discrete items (one notification, one profile). Sections are for page regions.' },
      { guidance: true, description: '要让 Section 居中，在 xstyle 中把 marginInlineStart 和 marginInlineEnd 设为 \'auto\'。如果 Astryx 源码在你的应用自己的 StyleX 编译中处理，marginInline 简写会输给 Section 自身的行内外边距。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '用于把内容组织成页面区域的页面级容器。设置面板、表单分组与页面分区请用 Section 而非 Card。',
  usage: {
    anatomy,
    description:
      'Section 创建页面区域。用于设置分组、表单分区、侧边栏区域。想在视觉上分隔页面某一部分时，用 Section 而非 Card。Card 面向离散条目（一份资料、一条通知）。',
    bestPractices: [
      { guidance: true, description: '用 Section 做页面级分组：设置面板、表单分组、侧边栏区域。是页面分区，而非离散条目。' },
      { guidance: true, description: '从默认变体开始。只在需要突出特定区域时用 muted。' },
      { guidance: true, description: '在背景相同、需要分隔的区域之间加分隔线。' },
      { guidance: true, description: '与标题 + Stack 组合，构成典型页面分区模式。' },
      { guidance: false, description: '想要 Section 时不要用 Card。Card = 离散条目（一条通知、一份资料）；Section = 页面区域。' },
      { guidance: true, description: "居中：xstyle 中设 marginInlineStart + marginInlineEnd 为 'auto'。如果 Astryx 源码经过你应用的 StyleX 编译，marginInline 简写会输给 Section 的行内外边距。" },
    ],
  },
  propDescriptions: {
    variant: '应用于区域容器的背景变体。',
    width: '区域宽度；数字按像素解释，字符串原样使用。',
    height: '区域高度；数字按像素解释，字符串原样使用。',
    maxWidth: '区域最大宽度。',
    minHeight: '区域最小高度。',
    children: '在区域内部渲染的内容。',
    dividers: '区域的哪些边有分隔线边框。',
    padding: '经间距刻度的内部内边距；贴边内容用 0。',
    paddingInline: '行内轴内边距覆盖；保留来自 padding/主题的块内边距。',
    paddingInlineStart: '行内起始（LTR 为左）内边距覆盖；在该边优先于 paddingInline/padding。',
    paddingInlineEnd: '行内结束（LTR 为右）内边距覆盖；在该边优先于 paddingInline/padding。',
    paddingBlock: '块轴内边距覆盖；保留来自 padding/主题的行内内边距。',
    paddingBlockStart: '块起始（顶部）内边距覆盖；在该边优先于 paddingBlock/padding。',
    paddingBlockEnd: '块结束（底部）内边距覆盖；在该边优先于 paddingBlock/padding。',
    xstyle: '用于布局自定义的 StyleX 样式；必须是 stylex.create() 的值。',
  },
};
