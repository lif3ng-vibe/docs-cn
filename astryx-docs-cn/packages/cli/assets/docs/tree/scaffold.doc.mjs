// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/scaffold`: pick the shell, budget each region,
 * and choose navigation — before any content exists.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'scaffold',
  title: '脚手架',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 10},
  category: 'guide',
  description:
    '在任何内容存在之前，选定外壳、为每个区域分配宽度预算、选好导航。',
  keywords: [
    '外壳',
    '导航',
    '框架',
    '区域',
    '宽度预算',
  ],

  sections: [
    {
      id: 'scaffold',
      title: '脚手架',
      content: [
        {
          type: 'prose',
          text: '在任何内容存在之前，选定外壳、为每个区域分配宽度预算、选好导航。外壳与导航两节覆盖各步骤；以下规则对两者都适用。',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            '在任何内容存在之前定下框架、各区域宽度预算以及 fill 还是 capped',
            '说明导航选择的理由，或沿用模板的搭配',
            '结构宽度保留裸 px；内部间距使用令牌',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '以内容为先、把每个 section 包进一张 Card，结果变成一条带内边距的滚动长列',
            '让正文、表单或列表在宽区域里拉满，而不用 contentWidth 设上限',
            '导航其实是过滤器或控件、或必须容纳面包屑这类宽元素时，还用 SideNav',
            '顶部插槽归属不清晰、或层级很深还在增长时，还用 TopNav',
            '生态层很单薄时还上两条栏，第二条只是浪费空间',
            '没有说明理由就偏离模板的导航搭配',
          ],
        },
      ],
    },
    {
      id: 'shell',
      title: '外壳',
      content: [
        {
          type: 'prose',
          text: '在任何内容存在之前选定外壳并为其区域分配预算。结构宽度是唯一适合裸 px 的地方；其内部一切间距都使用间距刻度。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '选定框架：带导航的应用用 AppShell；多窗格工具用 Layout 加 start 或 end 插槽中的 LayoutPanel；文档与表单用朴素的内容列',
            '给每个固定区域一个宽度预算，渲染时不会有区域要为空间讨价还价',
            '按内容决定 fill 还是 capped：表格、图表与看板填满其区域；正文、表单与列表用 Layout 的 contentWidth 设上限，行宽绝不过度拉伸',
            '在写内容之前，为每个区域定下容器策略：行式还是卡片网格',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '三区域工具框架',
          code: `// Recommended budgets: SideNav 240–280, icon rail 64–72,
// side panel 340–420, filter rail 220–260.
<AppShell sideNav={<SideNav>{/* nav items */}</SideNav>}>
  <Layout
    content={<LayoutContent>{/* table fills its region */}</LayoutContent>}
    end={<LayoutPanel width={380} hasDivider>{/* detail */}</LayoutPanel>}
  />
</AppShell>

// Capped instead: 640 suits text and forms, 960 mixed content.
// Dividers stay full-bleed.
<Layout
  contentWidth={640}
  content={<LayoutContent>{/* settings form */}</LayoutContent>}
/>`,
        },
        {
          type: 'prose',
          text: '自查：在任何内容存在之前，每个区域都写下了宽度预算、fill 还是 capped 的决定以及容器策略。',
        },
      ],
    },
    {
      id: 'navigation',
      title: '导航',
      content: [
        {
          type: 'prose',
          text: '框架没有定死导航时，默认选 SideNav：它能吸收你尚未规划的目的地。应用类型与目的地数量是参考指标，不是硬性规则。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'SideNav，默认选项：需要分组、可自定义导航、条目带次级操作，或导航要可折叠。追踪器、控制台与设置页通常从这里起步',
            'TopNav：预期保持浅层的导航、必须常驻可见的上下文，或控件与过滤器密集的页面；需要第二层时加 TabList。媒体库常属此类，置于网格内容之上',
            '两者都用：真正的套件，TopNav 承载生态级事务（上下文切换器、全局搜索），SideNav 承载产品导航',
            '两者都不用：消息与信息流采用 rail、导航、流、面板组成的分栏框架',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '传给 AppShell 的导航',
          code: `// Default: product nav on the side.
<AppShell sideNav={<SideNav>{/* items */}</SideNav>} />

// Shallow, stable nav on a control-heavy page.
<AppShell topNav={<TopNav>{/* items */}</TopNav>} />

// Suite: ecosystem concerns on top, product nav on the side.
<AppShell topNav={<TopNav />} sideNav={<SideNav />} />`,
        },
        {
          type: 'prose',
          text: '自查：你能用一句话说明理由，且导航规模翻倍时选择依然成立。`{@command build "<idea>"}` 会给出起步模板；初始化之后搭配已经接好。',
        },
      ],
    },
  ],
};
