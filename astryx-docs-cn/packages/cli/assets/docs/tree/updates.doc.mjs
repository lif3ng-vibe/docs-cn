// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/updates`: how the global install learns of newer
 * versions, and the notice it prints (spec AST-081 FR6, FR10).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'updates',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 4,
  },
  title: '更新与提示',
  category: 'guide',
  keywords: [
    '更新',
    '升级',
    '升级 Astryx',
    '更新提示',
    '新版本发布',
    '新版本',
    'NO_UPDATE_NOTIFIER',
    'latest',
  ],
  description:
    '全局安装每天检查一次是否有更新的版本，并在命令成功后打印两行提示。它从不升级自己，也不会升级项目。',
  sections: [
    {
      id: 'notice',
      title: '提示内容',
      content: [
        {
          type: 'prose',
          text: '你的全局安装每天在后台检查一次注册表中的 `latest` 版本（安装后的第一天除外），且不会拖慢命令。当存在更新的版本时，成功执行的命令最多每天一次在标准错误上打印两行内容：',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'A new release of Astryx is available: 0.7.2 → 0.7.3\nTo upgrade, run: npm i -g @astryxdesign/cli@latest',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '所提示的命令对应安装这份全局安装时所用的包管理器：`npm i -g`、`pnpm add -g`、`yarn global add`、`bun add -g` 或 `volta install`。用包管理器自身的设置（`BUN_INSTALL`、Yarn 的 `global-folder`、`PNPM_HOME` 或 npm 的 prefix）移动过的全局文件夹，只要该设置仍指向它即被认可；应用自带的副本从不执行更新检查。',
            '当最新版本需要的 Node 版本比你的电脑当前运行的更高时，第二行会说明应先安装哪个 Node 版本。',
            '在项目中，提示针对的是项目的版本，并给出项目对应的安装与 `upgrade` 命令。安装命令总是会把 CLI 与 Core 一起添加，因此只安装了 Core 的项目也会按建议获得自己的 CLI。',
          ],
        },
      ],
    },
    {
      id: 'project-notice',
      title: '在项目中',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'A new release of Astryx is available: 0.7.1 → 0.7.3\nTo upgrade, run: pnpm add @astryxdesign/core@0.7.3 @astryxdesign/cli@0.7.3, then pnpm exec astryx upgrade --from 0.7.1 --apply',
        },
      ],
    },
    {
      id: 'turn-off',
      title: '关闭提示',
      content: [
        {
          type: 'prose',
          text: '使用 `--json`、命令失败之后、设置了 `CI` 环境变量或设置了 `NO_UPDATE_NOTIFIER` 时，都不会打印提示；设置了上述任一变量时，CLI 也不会检查注册表。与某些 CLI 不同，即使标准错误不是终端，提示也会打印，因为智能体（agent）运行 CLI 时并没有终端。',
        },
        {
          type: 'prose',
          text: '`{@command doctor}` 随时都能显示同样的信息（在其 `newest-release` 检查中）；如果上一次提示没有打印，还会说明原因。上次检查运行的时间以及每次提示打印的时间，都保存在设置文件夹的 `state.json` 中（{@link generic:reference}）。',
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页面属于 {@link namespace:global}，其中解释了全局模式是什么以及各部分如何工作。项目升级参见：{@link command:upgrade}。',
        },
      ],
    },
  ],
};
