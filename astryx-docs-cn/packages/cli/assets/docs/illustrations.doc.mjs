// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  name: 'illustrations',
  title: '插画',
  category: 'foundations',
  description:
    '面向空状态、引导流程与功能亮点的插画指南。',
  keywords: ['空状态'],

  sections: [
    {
      title: '何时使用',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '一致的插画使用能强化品牌识别，帮助用户一眼理解上下文。在以下场景使用插画：',
        },
        {
          type: 'table',
          headers: ['场景', '示例'],
          rows: [
            ['空状态', '无数据、首次体验、搜索无结果'],
            ['引导', '欢迎页、功能介绍、设置向导'],
            ['功能亮点', '新功能公告、升级提示'],
            ['错误状态', '无权限、未找到、服务不可用'],
          ],
        },
      ],
    },
    {
      title: '准则',
      category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '让插画风格在整个产品中保持一致。',
            '使用在浅色与深色模式下都适用的简洁扁平插画。',
            '按容器比例确定插画尺寸，通常为 120–240px。',
            '插画居中放置，说明文字放在下方。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '混用来自不同来源的插画风格。',
            '把插画当作毫无目的的装饰。',
          ],
        },
      ],
    },
    {
      title: '摆放位置',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '对空状态，把插画传给 `EmptyState` 的 `icon` 插槽，它会将其居中放在标题与描述上方。典型插画尺寸从内联空状态的 120px 到整页引导界面的 240px 不等。始终让插画与标题及描述搭配，说明接下来该做什么。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '带插画的空状态',
          code: `<EmptyState
  icon={<img src="/illustrations/empty-search.svg" alt="" width={200} height={200} />}
  title="No results found"
  description="Try adjusting your search or filters."
/>`,
        },
      ],
    },
  ],
};
