// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/styling-basics`: overview of styling approaches,
 * xstyle prop, Tailwind integration, className/style props, and rest props.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'styling-basics',
  title: '基础',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 10},
  category: 'guide',
  description:
    '样式方案总览：xstyle prop、Tailwind 集成、className/style props 与 rest props。',
  keywords: [
    '样式',
    'rest props',
    'data-testid',
    'ref',
  ],

  sections: [
    {
      title: '总览',
      content: [
        {
          type: 'prose',
          text: '用 `xstyle`（StyleX）、`className`（Tailwind 或你自己的 CSS），或别名到 Astryx 令牌的样式库来为组件设置样式。它们最终都解析到同一套令牌。',
        },
        {
          type: 'table',
          headers: ['方案', '适用场景', '示例'],
          rows: [
            ['StyleX', '组件级覆盖、可复用样式、伪类与带类型的令牌', '`const styles = stylex.create(...); <Button xstyle={styles.save} />`'],
            ['Tailwind 工具类', '页面布局、包裹层与工具类样式', '`className="flex gap-3 p-4"`'],
            ['className', '在组件上集成外部 CSS 或 Tailwind', '`className="my-card shadow-lg"`'],
            ['样式库令牌别名', '让 Panda、Chakra、MUI、Emotion、styled-components、UnoCSS、CSS Modules 或 Sass 与系统保持同步', "`colors.surface = 'var(--color-background-surface)'`"],
          ],
        },
        {
          type: 'prose',
          text: '无论选哪种方案，主题定制与深色模式都照常工作。外部样式库见 {@link namespace:styling-libraries}；其中覆盖 Tailwind、StyleX、Panda、Chakra、MUI、CSS-in-JS、CSS Modules、Sass，以及用于非 CSS 处理的 `useTheme()`。',
        },
      ],
    },
    {
      title: 'xstyle prop',
      content: [
        {
          type: 'prose',
          text: '每个组件都接受用于样式定制的 `xstyle` prop。它只接受通过 `stylex.create()` 创建的 StyleX 样式，不接受内联对象或类名字符串。StyleX 样式在构建期编译，以获得最佳的去重与死代码消除效果。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '简单覆盖',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  card: { maxWidth: 400, marginBlock: 16 },
  saveButton: { alignSelf: 'flex-end' },
});

<Card xstyle={overrides.card} />
<Button label="Save" xstyle={overrides.saveButton} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '伪类与条件样式',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  card: {
    boxShadow: {
      default: 'none',
      ':hover': { '@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.1)' },
    },
  },
});

<Card xstyle={overrides.card}>...</Card>`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '所有 xstyle 值都必须来自 stylex.create()',
            'stylex.create 内支持伪类（:hover、:focus-visible）',
            '所有 :hover 样式必须加 @media (hover: hover) 守卫',
            '非 StyleX 样式（Tailwind、外部 CSS）请改用 className',
          ],
        },
      ],
    },
    {
      title: 'Tailwind 集成',
      content: [
        {
          type: 'prose',
          text: '本包自带一个 Tailwind v4 主题桥接，把所有设计令牌映射为 Tailwind 工具类。只需导入一次，即可使用由设计令牌支撑的 Tailwind 类：颜色、间距、圆角、阴影与排版都会解析到当前激活的主题。',
        },
        {
          type: 'prose',
          text: '需要导入的内容以及应写入全局 CSS 的 cascade layer 顺序，见 {@link generic:tailwind}。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '组件旁使用 Tailwind 工具类',
          code: `<div className="text-primary bg-surface rounded-lg p-4 flex gap-3">
  <Button label="Save" variant="primary" />
  <Button label="Cancel" variant="secondary" />
</div>`,
        },
        {
          type: 'prose',
          text: '桥接是纯 CSS、零 JS。主题变化（深色模式、自定义主题）会自动生效，因为这些工具类引用的正是组件所用的同一批 CSS 自定义属性。这是官方铺好的 Tailwind 路径；其他遵循同样别名模式的样式库见 {@link namespace:styling-libraries}。',
        },
      ],
    },
    {
      title: 'className 与 style props',
      content: [
        {
          type: 'prose',
          text: '每个组件也接受标准的 `className` 与 `style` props。`className` 追加在组件自身类名之后。`style` 合并在 StyleX 内联样式之后，冲突时消费方的值胜出。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'className 配合 Tailwind 工具类',
          code: `<Card className="shadow-lg hover:shadow-xl transition-shadow">
  ...
</Card>
<Button label="Save" className="my-app-save-btn" />`,
        },
        {
          type: 'prose',
          text: '页面布局与包裹层样式用 className 上的 Tailwind 工具类很合适。组件级覆盖（内边距、颜色、边框）则优先用 xstyle；它与 StyleX 去重及组件内部样式管线集成在一起。',
        },
      ],
    },
    {
      title: 'rest props（透传）',
      content: [
        {
          type: 'prose',
          text: '组件扩展 HTML 属性，并把 rest props 展开到根 DOM 元素上。也就是说 data-* 属性、aria-* 属性、事件处理器及其他 HTML props 会自动透传。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'data 属性、事件处理器与 ARIA',
          code: `<Card
  data-testid="user-card"
  data-user-id={user.id}
  onMouseEnter={handleHover}
  aria-label="User profile card"
>
  ...
</Card>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'ref 转发',
          code: `const cardRef = useRef<HTMLDivElement>(null);
<Card ref={cardRef}>...</Card>`,
        },
        {
          type: 'prose',
          text: '少数 HTML 属性被有意排除在基础类型之外（contentEditable、dangerouslySetInnerHTML）。children 也不在基础类型中；接受 children 的组件会显式声明它，这样基于插槽（slot）的组件就不会静默丢掉 JSX 子节点。',
        },
      ],
    },
  ],
};
