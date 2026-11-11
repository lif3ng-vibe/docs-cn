// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/install-once`: install the CLI for the computer with each
 * package manager; the cache of versions projects need; offline (spec AST-081).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'install-once',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 2,
  },
  title: '全局安装 Astryx',
  category: 'guide',
  keywords: [
    'pnpm add -g',
    'yarn global add',
    'bun add -g',
    'volta install',
    'npx',
    '离线',
    '缓存',
    '每用户缓存',
    'EACCES',
    '权限被拒',
    'sudo',
    'npm prefix',
  ],
  description:
    '用 npm、pnpm、Yarn、Bun 或 Volta 为你的电脑安装一次 Astryx CLI，以及离线时会发生什么。',
  sections: [
    {
      id: 'install',
      title: '安装它',
      content: [
        {
          type: 'prose',
          text: '用你的包管理器安装 CLI 包。之后一条 astryx 命令即可在任意文件夹使用。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @astryxdesign/cli --global}\n# with Volta: volta install @astryxdesign/cli',
        },
        {
          type: 'prose',
          text: '同时也要在每个项目中安装 CLI：这能为队友和 CI 锁定版本（{@link generic:project-global-or-both}）。在项目内，无论你输入哪条 astryx 命令，都由项目版本应答。项目外由你的全局安装以其自身版本应答；而你指定版本时，例如 `{@pm dlx @astryxdesign/cli@0.7.0}`，会以该确切版本应答。',
        },
      ],
    },
    {
      id: 'eacces',
      title: '权限被拒（EACCES）',
      content: [
        {
          type: 'prose',
          text: '如果 `npm i -g` 因 `EACCES` 失败，不要用 `sudo`。给 npm 一个你拥有的全局文件夹，然后把它的 `bin` 文件夹加入 PATH，或使用 nvm、fnm、Volta 之类的 Node 版本管理器：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm-only npm "moves the npm global folder" config set prefix ~/.npm-global}\nexport PATH="$HOME/.npm-global/bin:$PATH"\n{@pm-only npm "installs into the npm global folder above" i -g @astryxdesign/cli}',
        },
        {
          type: 'prose',
          text: '此后 Astryx 的更新提示会在其升级命令中使用那个文件夹。',
        },
      ],
    },
    {
      id: 'versions-for-projects',
      title: '为项目准备的版本',
      content: [
        {
          type: 'prose',
          text: '当项目自己的 CLI 已安装但无法启动时，Astryx 会改为运行与项目 Core 版本一致的 CLI——把它安装到主目录下的缓存中一次并重复使用。这一步用 npm 完成，因此你的 npm registry、代理与离线设置都会生效。删除缓存是安全的：项目需要时版本会重新取回。缓存位置见：{@link generic:reference}。',
        },
      ],
    },
    {
      id: 'offline',
      title: '离线',
      content: [
        {
          type: 'prose',
          text: '你的全局安装能在只有 Core 的项目中离线应答，安装了自己 CLI 的项目同样可以。项目外，读取组件的命令（如 `{@command component Button}`）需要你全局版本的 Core：只要你在线运行过任意一条命令，全局安装就会在后台把 Core 一次性下载进缓存，此后即可离线工作（CI 中除外——那里任何东西都不会自行下载：{@link generic:ci-and-containers}；Windows 上也除外——第一条组件命令会即时下载）。只有自身 CLI 无法启动的项目才需要安装或缓存某个版本；两者皆无且无法获取时，你的全局安装会以一行警告应答，Astryx 会等待 2 分钟再重试下载（连续第二次失败后为 10 分钟）。确切消息见 {@link generic:problems}。',
        },
      ],
    },
    {
      id: 'more',
      title: '关于全局模式的更多内容',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了全局模式是什么以及各部分如何工作。下一篇：{@link generic:who-answers}。',
        },
      ],
    },
  ],
};
