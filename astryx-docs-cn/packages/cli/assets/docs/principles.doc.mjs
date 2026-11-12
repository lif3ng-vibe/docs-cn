// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'principles',
  title: '设计原则',
  category: 'guide',
  description:
    '使用设计系统进行构建的核心设计原则与规则。',

  sections: [
    {
      title: '设计哲学',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '一个注重一致性、适应性与开发者体验的设计系统。每个决策都源自几条核心理念：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '组件优于原始元素：凡是组件覆盖的场景，都先用组件，再考虑裸 HTML',
            '语义令牌优于硬编码值：颜色、间距与圆角按用途命名，而非按外观',
            '主题无关的代码：应用代码从不引用具体颜色或尺寸，因此主题与深色模式自动生效',
            '开放的内部机制：每个原语都可导出、可组合，你可以在其上构建而无需与它对抗',
          ],
        },
      ],
    },
    {
      title: '规则',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '让应用代码保持在系统之内的八条规则。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '凡是组件覆盖的场景都使用组件',
            '页面布局框架优先：先选定外壳并规划各区域尺寸，再编写内容（见 {@link namespace:layout}）',
            '密集数据用行渲染（Table、List/Item），通栏加分隔线；Card 用于小部件、画廊与设置分组',
            '自定义样式用 StyleX 或 Tailwind；两者都是一等公民（见 {@link namespace:styling}）',
            '语义令牌，而非硬编码值（见 {@link namespace:tokens}）',
            '颜色用 CSS 自定义属性，而非十六进制值',
            '表单输入为受控组件（value + onChange）',
            '导航使用 useLinkComponent()，让使用者可通过 LinkProvider 接入自己的框架路由',
          ],
        },
      ],
    },
    {
      title: '样式方法',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '设计系统支持多种样式方案。每个组件都接受 \`xstyle\` prop，用 \`stylex.create()\` 做 StyleX 样式覆盖。组件之外的布局与包装样式，用 StyleX 或 Tailwind 工具类；两者都解析到同一组设计令牌。',
        },
        {
          type: 'prose',
          text: '带示例的完整指南见 {@link namespace:styling}。',
        },
      ],
    },
    {
      title: '反模式',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '会破坏主题、路由或布局的写法，以及应改用的做法。',
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '在原始元素上用内联样式。应在组件上用 xstyle',
            '硬编码颜色（#fff）。应使用 var(--color-*) 或 Tailwind 语义类（text-primary、bg-surface）',
            '硬编码间距（16px）。应使用间距令牌或 Tailwind 间距工具类',
            '硬编码 <a> 元素。应使用 useLinkComponent()，让使用者可通过 LinkProvider 换成自己的框架路由',
            '把每个列表项或页面区块都包进 Card。应先定框架；密集数据用行渲染（见 {@link namespace:layout}）',
            '把 Badge 当装饰。Badge 留给计数与枚举状态；状态用 StatusDot 或 Token',
            '自创 prop。先读组件文档',
          ],
        },
      ],
    },
    {
      title: '设计令牌',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '设计系统为间距、颜色、圆角、阴影、排版与尺寸提供语义设计令牌。令牌会适配当前激活的主题与颜色模式。完整参考（含全部取值）见 {@link namespace:tokens}。',
        },
      ],
    },
  ],
};
