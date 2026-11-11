// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/project-global-or-both`: which setup to use, project,
 * global, or both (recommended), with what each costs and how to set it up.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'project-global-or-both',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 1,
  },
  title: '项目安装、全局安装，还是两者都用',
  category: 'guide',
  keywords: [
    '该用哪种安装方式',
    '项目还是全局',
    '全局还是项目',
    '两者都用',
    '装进项目',
    'npx @astryxdesign/cli',
    '开发依赖',
    '推荐配置',
    '要不要全局安装',
  ],
  description:
    '在每个项目里安装 Astryx，同时为本机安装一份：两者都用是推荐的配置，且二者永不冲突。各自能带来什么，以及如何设置。',
  sections: [
    {
      id: 'both',
      title: '两者都用（推荐）',
      content: [
        {
          type: 'prose',
          text: '在每个项目里安装 CLI，同时为本机安装一份。双方各有一方做不到的能力，且永不冲突：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '**项目内**，CLI 版本钉在 `package.json` 与锁文件里，队友和 CI 跑的就是那个版本，运行时不取任何东西。',
            '**全局**，astryx 命令在每个目录都可用，包括项目尚不存在时的空目录，而且本机的每个编码智能体（agent）都能通过智能体指南了解 Astryx。',
            '**两者同时存在时**，在项目里始终由项目的版本应答，即使你敲的是全局 astryx 命令；在项目之外则由你的全局版本应答。global 模式永远不能取代项目的 CLI。',
          ],
        },
      ],
    },
    {
      id: 'compare',
      title: '一览对比',
      content: [
        {
          type: 'table',
          headers: ['配置', '你能得到什么', '代价是什么', '适合谁'],
          rows: [
            [
              '两者都用',
              '每个项目里钉住版本，外加任意目录下的文档、组件与搜索，以及面向每个智能体的智能体指南',
              '要维护两份安装并保持更新',
              '大多数人',
            ],
            [
              '仅项目',
              '版本钉在仓库里，团队与 CI 一致',
              '项目之外没有 astryx 命令；别处的智能体不了解 Astryx',
              'CI 机器与构建服务器',
            ],
            [
              '仅全局',
              '任意目录下的文档、组件与搜索；每个智能体都了解 Astryx',
              '团队没有任何钉住的版本；没有自带 CLI 的项目只能用你启动时的版本',
              '智能体、原型与快速查询',
            ],
          ],
        },
      ],
    },
    {
      id: 'set-up',
      title: '各自如何设置',
      content: [
        {
          type: 'prose',
          text: '在项目目录里（上手指南列出了应用还需安装的其他包）：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @astryxdesign/core @astryxdesign/cli}\n{@command init}',
        },
        {
          type: 'prose',
          text: '为本机安装一份：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @astryxdesign/cli --global}',
        },
        {
          type: 'prose',
          text: '两者都用，就把两步都做，顺序随意。',
        },
      ],
    },
    {
      id: 'what-happens',
      title: '两者都装了会发生什么',
      content: [
        {
          type: 'prose',
          text: '在项目里，始终由项目的版本应答，即使你敲的是全局 astryx 命令；在项目之外，由你的全局版本应答。{@link generic:who-answers}',
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于 global 模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了 global 模式是什么以及各部分如何工作。要开始一个应用：{@link generic:getting-started}。',
        },
      ],
    },
  ],
};
