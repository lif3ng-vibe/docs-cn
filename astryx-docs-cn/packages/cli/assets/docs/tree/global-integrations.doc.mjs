// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/global-integrations`: make an
 * integration work when people install it next to their global Astryx
 * install; a checklist and the commands to try it (spec AST-081 FR12).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'global-integrations',
  placement: {
    parent: 'namespace:authoring',
    slot: 'guides',
    order: 25,
  },
  title: '让你的集成在全局模式下工作',
  category: 'guide',
  keywords: [
    'authoring',
    '全局集成',
    '全局模式',
    'npm i -g',
    '安装到本机',
    '项目外',
    'peer 范围',
    'peerDependencies',
    'cliCommand 冲突',
    '全局试用',
  ],
  description:
    '用户可以把你的集成安装到全局 Astryx 安装旁边，这样它在项目外的每个文件夹都能生效；项目内部则只有项目自身的集成生效。附一份检查清单和用于验证的确切命令。',
  sections: [
    {
      id: 'peer-range',
      title: '第一步：你的 peer 范围必须覆盖全局 CLI 的版本',
      content: [
        {
          type: 'prose',
          text: '你的 `@astryxdesign/core`（如果你用到的话，还有 `@astryxdesign/cli`）的 `peerDependencies` 范围必须包含全局安装的 CLI 版本。否则 Astryx 在项目外会跳过你的包，且 `{@command doctor}` 会发出警告并指出是哪个范围。',
        },
        {
          type: 'prose',
          text: '在未安装你的包的项目里，一旦你的 peer 范围覆盖该项目的发行版本，`{@command discover}` 就会推荐它，并给出将其加入该项目的命令。',
        },
      ],
    },
    {
      id: 'where-it-works',
      title: '你的集成在哪些地方生效',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '安装在某应用中：和往常一样，它在该应用内生效；无论用户运行的是哪个 `astryx`，都由该应用自己的 Astryx 版本应答。',
            '安装到全局安装旁边（`{@pm install @astryxdesign/cli your-package --global}`），或由某个把它们一起安装的工具装进 CLI 所在文件夹：它在项目外的每个文件夹都生效。那里的用户与智能体（agent）能看到它的组件、模板、文档、主题、codemod 以及可被发现的源码。',
            '仅在全局安装、而某应用未安装它：它在该应用中不添加任何内容。当它支持该应用的版本并能加载时，`{@command discover}` 会把它列为该应用可添加的一项，并给出该应用的安装命令。',
            '两种方式都装了：在该应用内使用应用自己的副本；在你自己的包文件夹中则使用你的工作副本。',
          ],
        },
        {
          type: 'prose',
          text: 'Astryx 以与应用集成相同的加载器和检查来加载全局集成，因此你的 manifest 无需任何额外内容。',
        },
      ],
    },
    {
      id: 'checklist',
      title: '检查清单',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '声明你的包真正支持的 `@astryxdesign/core`（如果你用到的话，还有 `@astryxdesign/cli`）`peerDependencies` 范围。项目外，当该范围未覆盖全局版本时，Astryx 会跳过你的包，`{@command doctor}` 会说明原因：范围太窄，全局用户升级后会失去它；范围太宽，它会加载到可能无法与之共同构建的 Core 上。',
            '文档与模板中的 import 只引用会随你的包一起被应用安装的包，因为项目外没有应用可供校验它们。',
            '如果你设置了 `cliCommand`，要知道项目外 Astryx 打印的每条命令都以它开头；还要知道两个声明了不同命令的全局集成会互相抵消，回退到 `astryx`（{@link generic:cli-command}）。应用内部则只有该应用的集成生效。',
            '发布前，按下面的步骤在全局试用。',
          ],
        },
      ],
    },
    {
      id: 'try-it',
      title: '全局试用',
      content: [
        {
          type: 'prose',
          text: '打包你的包，把它安装到全局 CLI 旁边，然后在一个空文件夹里查看效果：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm-only npm "the tarball the registry receives" pack}\n{@pm install @astryxdesign/cli ./your-package-1.0.0.tgz --global}\nmkdir -p /tmp/try-global && cd /tmp/try-global\n{@command discover}\n{@command docs}\n{@command doctor}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`{@command discover}` 会把你的包列为已安装，并显示它添加的内容。',
            '`{@command docs}` 会列出你的话题，`{@command search <one of your component names>}` 能找到它们。',
            '`{@command doctor}` 的 `computer-integrations` 检查会把你的包列为在用，且没有任何警告。',
            '在未安装它的应用里，`{@command discover}` 会把它列为该应用可添加的一项，并给出该应用的安装命令，而它的组件与文档都不会出现。',
          ],
        },
        {
          type: 'prose',
          text: '之后用 `{@pm remove your-package --global}` 移除它即可。',
        },
      ],
    },
    {
      id: 'more',
      title: '关于全局模式的更多内容',
      content: [
        {
          type: 'prose',
          text: '全局模式对安装你包的用户是如何工作的：{@link namespace:global}。全局集成的用户侧视角：{@link generic:computer-integrations}。',
        },
      ],
    },
  ],
};
