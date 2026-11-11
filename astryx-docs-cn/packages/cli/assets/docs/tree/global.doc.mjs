// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global`: global mode. What it is, how to install it, what you get,
 * and which version runs where; the parent of every global-mode page
 * (spec AST-081).
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'global',
  title: '全局模式',
  summary:
    '在你的电脑上安装一次 Astryx，即可在任意文件夹中使用。每个项目仍运行自己的 Astryx 版本，因此全局安装永远不会改变项目所得到的内容。',
  keywords: [
    '全局',
    '全局模式',
    '全局方式',
    '全局安装',
    'npm i -g',
    '安装到全局',
    '一次安装',
    '任意文件夹',
    '项目外',
    '哪个版本',
    '电脑',
  ],
  slots: {
    guides: {
      title: '全局模式：逐问解答',
      accepts: {
        kinds: ['generic'],
      },
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式指在你的电脑上只安装一次 Astryx CLI，这样 astryx 命令在任何地方都可用：在你的项目里、在空文件夹里，以及面向每个编码智能体（agent）。项目内部由项目自己的 Astryx 版本应答，因此全局安装永远不会改变项目所得到的内容。',
    },
    {
      type: 'code',
      lang: 'bash',
      code: '{@pm install @astryxdesign/cli --global}',
    },
    {
      type: 'heading',
      level: 3,
      text: '你能得到什么',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        '还没有项目时，也能在任意文件夹使用文档、组件、模板与搜索。',
        '你电脑上的每个编码智能体都认识 Astryx——CLI 会把一份简短指南放在智能体工具会查找的位置。',
        '每个项目保留自己的版本：在项目内由项目版本应答，无论你运行的是哪条 astryx 命令。',
      ],
    },
    {
      type: 'heading',
      level: 3,
      text: '运行的是哪个版本',
    },
    {
      type: 'table',
      headers: ['在哪里运行', '由哪个版本应答'],
      rows: [
        [
          '项目内',
          '项目自己的 CLI。在只安装 `@astryxdesign/core` 的项目中，由你启动的那条 astryx 命令应答，并每天最多一次提示添加 CLI。',
        ],
        ['项目外', '你的全局版本。'],
        [
          '面向电脑的命令，例如 `{@command init --user}`',
          '你的全局版本，任意文件夹皆可。',
        ],
      ],
    },
    {
      type: 'prose',
      text: '不确定你想要项目内安装、全局安装，还是两者都要：{@link generic:project-global-or-both}。细节见：{@link generic:who-answers}。',
    },
    {
      type: 'heading',
      level: 3,
      text: '更新',
    },
    {
      type: 'prose',
      text: '你的全局安装从不升级自己，也不升级项目。当有新版本发布时，执行成功的命令会在结尾附上两行提示，每天最多一次：{@link generic:updates}。',
    },
    {
      type: 'heading',
      level: 3,
      text: '智能体',
    },
    {
      type: 'prose',
      text: 'CLI 会把一份简短的 Astryx 指南放在你主目录下智能体工具会查找的位置，这样在任何地方工作的智能体都知道 Astryx 的存在：{@link generic:computer-agent-guide}。',
    },
    {
      type: 'heading',
      level: 3,
      text: '集成',
    },
    {
      type: 'prose',
      text: '安装到全局安装旁边的集成在项目外生效；项目内则只有项目自己的集成生效：{@link generic:computer-integrations}。如何构建一个集成：{@link generic:global-integrations}。',
    },
    {
      type: 'heading',
      level: 3,
      text: '更多',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        '安装与离线工作：{@link generic:install-once}。',
        'Monorepo 与嵌套文件夹：{@link generic:monorepos}。',
        'CI 与容器：{@link generic:ci-and-containers}。',
        '看起来不对劲：{@link generic:problems}。',
        '卸载与重置：{@link generic:uninstall}。',
        '全部路径、设置、JSON 字段与错误码：{@link generic:reference}。',
        '每条命令在项目外的行为：{@link namespace:commands}。',
      ],
    },
  ],
};
