// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/who-answers`: which version answers in each folder, the
 * hand-off, and how to see who answered (spec AST-081 FR2, FR3, FR5, FR9).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'who-answers',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 3,
  },
  title: '哪个版本在运行，为什么',
  category: 'guide',
  keywords: [
    '哪个发布版本',
    '版本不对',
    '版本不同',
    'answered by',
    'answeredBy',
    '交接',
    '已交接',
    '项目版本',
  ],
  description:
    '在项目内，无论你从哪个 astryx 命令开始，都由项目自己的 CLI 应答；在只安装了 Core 的项目中，由你启动的 astryx 命令应答。在项目之外，由你的全局安装应答。以及如何查看究竟是哪个版本应答。',
  sections: [
    {
      id: 'in-a-project',
      title: '在项目中：项目的版本',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '项目按建议安装了 CLI：无论其版本如何，都由该 CLI 应答，一贯如此。如果你输入的是全局 astryx 命令，它会把这次运行转交给项目的 CLI，参数、输入、输出与退出状态都保持不变，因此两种命令给出相同的结果。',
            '项目只安装了 Core，或尚未安装任何内容（例如刚克隆的仓库）：由你启动的 astryx 命令应答，一贯如此。当其版本与项目的 Core 不同时，命令之后每天最多一次给出提示，指明按 Core 的版本安装 CLI 的命令。',
            '项目的 CLI 已安装但无法启动：改由与项目 Core 版本相同的 CLI 应答（来自已安装的 Core，否则取 lockfile，再否则取声明范围允许的最新版本），并一次性安装到缓存中。',
          ],
        },
        {
          type: 'prose',
          text: '组件来自 `@astryxdesign/core`，模板、文档与智能体（agent）指南来自 CLI。在项目中，这里的 Core 就是项目安装的那份，因此项目的依赖装好之后，组件命令即可离线工作。在项目之外，或在尚未安装任何内容的项目中（刚克隆的仓库），它们会使用应答版本自带的 Core——来自 CLI 旁的文件或缓存；当该 Core 无法下载时，错误信息会要求先安装项目的依赖。当项目的 CLI 与 Core 版本不一致时，`{@command doctor}` 会给出警告并打印把它们对齐到同一版本的命令。',
        },
      ],
    },
    {
      id: 'outside',
      title: '项目之外：你的全局安装',
      content: [
        {
          type: 'prose',
          text: '在不属于任何项目的文件夹中，由你的全局安装应答，表现得如同一个运行在其版本上的全新项目，让你和你的智能体能读到每个组件与文档。它从不会自行安装更新的版本。',
        },
        {
          type: 'prose',
          text: '少数命令作用于你的整台电脑而非某个文件夹，例如 `{@command init --user}`：在任何文件夹中，它们都由你的全局安装应答。',
        },
      ],
    },
    {
      id: 'see-it',
      title: '查看是哪个版本应答',
      content: [
        {
          type: 'prose',
          text: '在只安装了 Core 的项目中，提示出现在命令之后，每个项目每天最多一次，形如：',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'astryx: this project has no Astryx CLI installed; answered by CLI 0.7.2 while its Core is 0.6.8. To match, run: npm install @astryxdesign/cli@0.6.8',
        },
        {
          type: 'prose',
          text: '其他情况下，文本模式会在标准错误上打印一行说明版本，除非是项目自己的 CLI 直接应答：',
        },
        {
          type: 'code',
          lang: 'text',
          code: "astryx: answered by this project's CLI 0.6.8, handed over from CLI 0.7.2\nastryx: answered by CLI 0.6.8 with Core 0.6.8, the release that matches this project's Core\nastryx: answered by CLI 0.7.2 with Core 0.7.2, outside a project\nastryx: answered by CLI 0.7.2 with Core 0.7.2, for this computer",
        },
        {
          type: 'prose',
          text: '使用 `--json` 时不会额外打印任何内容；每个结果改为携带 `meta.answeredBy`（{@link generic:reference}）：',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"meta": {"answeredBy": {"cli": "0.7.2", "core": "0.6.8", "copy": "starting"}}}',
        },
      ],
    },
    {
      id: 'printed-commands',
      title: 'Astryx 打印的命令',
      content: [
        {
          type: 'prose',
          text: 'CLI 打印出来供你运行的命令，都以能到达同一版本的名称开头：在项目中是项目的运行器（如 `pnpm exec astryx`）；在项目之外、由你的全局安装应答时是 `astryx`；其他情况下是钉定到相应版本的 CLI，如 `{@pm dlx @astryxdesign/cli@0.6.8}`。集成包可以指定自己的命令：{@link generic:cli-command}。',
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页面属于 {@link namespace:global}，其中解释了全局模式是什么以及各部分如何工作。要检查你的电脑，请在任何项目之外运行 `{@command doctor}`（{@link command:doctor}）。Monorepo 场景：{@link generic:monorepos}。',
        },
      ],
    },
  ],
};
