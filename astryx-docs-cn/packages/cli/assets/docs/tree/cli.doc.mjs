// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli`: the top of the CLI's docs tree (spec:AST-046).
 *
 * A namespace declares a level and its slots. It never lists its children:
 * a guide places itself here with `placement`, and the `commands` and `api`
 * namespaces adopt the CLI's typed docs by the `namespace` group each declares.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'cli',
  title: 'Astryx CLI',
  summary:
    '命令、编程式 API 与输出契约。构建集成的内容见 {@link namespace:authoring}。',
  keywords: ['cli', '命令', 'api', '参考'],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic', 'namespace']}},
    reference: {title: '参考', accepts: {kinds: ['namespace']}},
  },
  blocks: [
    {
      type: 'prose',
      text: '在任何文件夹里都能使用 CLI：为这台机器安装一次，每个项目仍会得到与其 Core 匹配的版本。见 {@link namespace:global}。',
    },
  ],
};
