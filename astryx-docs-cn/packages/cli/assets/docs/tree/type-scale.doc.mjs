// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs typography/type-scale`: line height, semantic type scale,
 * display text, headings and text components, custom type scales, and the
 * reader's text size on iOS.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'type-scale',
  title: '字阶',
  placement: {parent: 'namespace:typography', slot: 'guides', order: 20},
  category: 'foundations',
  description:
    '行高、语义字阶令牌、展示文本（display text）、Heading 与 Text 组件、通过 defineTheme 自定义字阶，以及在 iOS 上跟随读者的文字大小。',
  keywords: [
    '行高',
    '行距',
    'defineTheme',
    'base',
    'ratio',
    '动态字体',
    '文字大小',
  ],

  sections: [
    {
      title: '行高',
      content: [
        {
          type: 'prose',
          text: '行高由分档的目标比值计算得出，并吸附到 4px 垂直网格。小号文本（<20px）目标为 1.5，中号文本（20–31px）目标为 1.4，大号文本（≥32px）目标为 1.25。系统强制 fontSize + 4px 的最小间隙。结果是一个无单位的比值，存入每个 --text-*-leading 令牌。',
        },
        {
          type: 'prose',
          text: '4px 网格很重要：每个行盒都对齐到 4px 的增量，从而让基线、间距与组件高度可预测。只要提供 base 和 ratio，expandTypeScale 工具就会自动计算这些值，因此你永远不需要手动设置 line-height。',
        },
      ],
    },
    {
      title: '字阶',
      content: [
        {
          type: 'prose',
          text: '把字号、字重与行高组合为单一字体样式的语义令牌。每组令牌三元组（--text-*-size、--text-*-weight、--text-*-leading）由 Text 和 Heading 消费。请使用组件 prop，而不是自行组合原始字体令牌。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Type Scale Tokens',
        },
      ],
    },
    {
      title: '展示文本',
      content: [
        {
          type: 'prose',
          text: '展示变体（display-1、display-2、display-3）在 heading-1 之上延续几何级数，步进分别为 +6、+5、+4。它们使用常规字重（400）而非半粗（semibold），并采用更紧的行高（约 1.2），因为大号文本在更小行距下更易读。display 类型用于 hero 横幅、营销标题与数据标注，不要用于文档标题。',
        },
        {
          type: 'prose',
          text: '为了无障碍，展示文本常常需要标题语义。使用 Heading 的 type prop 可以套用展示样式，同时保留正确的 HTML 元素：`<Heading level={1} type="display-1">` 提供 display-1 样式并落到 `<h1>` 标签上，屏幕阅读器因此能看到正确的文档大纲。',
        },
      ],
    },
    {
      id: 'usage',
      title: '标题与文本',
      content: [
        {
          type: 'prose',
          text: '文档结构用 `Heading`，其余都用 `Text`；两者都会把各自的 prop 映射到字阶令牌。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用 Heading 表达文档结构',
          code: `import {Heading} from '@astryxdesign/core/Heading';

// Heading levels map to semantic tokens: level 1 → --text-heading-1-*
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section</Heading>
<Heading level={3}>Subsection</Heading>

// Display type for hero/marketing headings — level sets the HTML element
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>

// Override the accessibility level when visual ≠ document hierarchy
<Heading level={2} accessibilityLevel={3}>
  Sidebar Section
</Heading>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用于正文、标签与展示文本的 Text',
          code: `import {Text} from '@astryxdesign/core/Text';

<Text type="body">Body text at the base scale.</Text>
<Text type="large">Emphasized body text.</Text>
<Text type="label">Form label</Text>
<Text type="supporting">Helper text, timestamps, metadata.</Text>
<Text type="code">{'const x = 1;'}</Text>

// Display without heading semantics (data callouts, decorative)
<Text type="display-2">$1.2M Revenue</Text>`,
        },
      ],
    },
    {
      id: 'custom-type-scale',
      title: '自定义字阶',
      content: [
        {
          type: 'prose',
          text: '在 `defineTheme` 中用 `base` 和 `ratio` 改变整条梯度；每个字号与行高都会据此重新计算。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '通过 defineTheme 自定义字阶',
          code: `import {defineTheme} from '@astryxdesign/core/theme';

// Adjust the entire ramp holistically with base and ratio
const editorialTheme = defineTheme({
  name: 'editorial',
  typography: {
    scale: { base: 16, ratio: 1.25 },          // airy / article feel
    body: { family: 'Geist', fallbacks: '-apple-system, sans-serif' },
    heading: { weight: 'bold' },
    code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace' },
  },
});

const denseTheme = defineTheme({
  name: 'dense',
  typography: {
    scale: { base: 12, ratio: 1.125 },          // compact / data-dense UI
  },
});`,
        },
      ],
    },
    {
      id: 'dynamic-type',
      title: '在 iOS 上跟随读者的文字大小',
      content: [
        {
          type: 'prose',
          text: '在 iPhone 上，读者会在设置（显示与文字大小，然后是更大字体）中选择文字大小，原生应用会随之放大或缩小文本。每个主题在 iPhone 的 Safari 中也会如此：Safari 通过 `font: -apple-system-body` 暴露这一选择。每个字号都沿它所对应的 iOS 文字样式的曲线跟随读者的选择——正文像 Body 一样缩放，`heading-1` 像 Title 1，展示文本像 Large Title，各角色保持原有次序。主题固定为某一长度的字号（例如 12px 的辅助字号）按其默认对应档位的曲线缩放；`em` 或 `%` 单位的字号跟随其父级，读取变量的字号则跟随该变量。在默认尺寸下，每个字号都是主题自身的值。字体族、间距、圆角与根字号永不改变，行高保持各自的比值，iOS 上文本输入框保持 16px 下限；在 Android 上，浏览器支持时系统字体缩放会通过 `env(preferred-text-scale)` 放大每个字号；两者都不支持的浏览器则没有任何变化。无需打开任何开关：没有主题选项、prop 或文档属性。',
        },
        {
          type: 'prose',
          text: '文本输入框等固定高度的控件保持自身高度，因此在无障碍特大字号下其文本可能溢出。带标签的 `Button` 会随标签一起变大。',
        },
      ],
    },
  ],
};
