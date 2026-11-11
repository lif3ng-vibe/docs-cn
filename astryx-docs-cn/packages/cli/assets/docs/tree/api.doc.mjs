// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/api`: the programmatic API of `@astryxdesign/cli/api`.
 *
 * Adopts each function, schema, and enum doc whose `namespace` is `cli/api`,
 * one generated level per kind: `cli/api/functions`, `cli/api/schemas`, and
 * `cli/api/enums`.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'api',
  title: 'API',
  summary:
    '编程 API：函数、JSON 输出信封、错误码与响应类型。',
  keywords: ['api', '函数', 'schema', '枚举', 'json'],
  placement: {parent: 'namespace:cli', slot: 'reference', order: 20},
  slots: {
    kinds: {title: '参考', accepts: {kinds: ['namespace']}},
  },
  blocks: [
    {
      type: 'prose',
      text: '要在你自己的命令行工具中运行整个 CLI（传入其参数、目录与命令名），请使用宿主入口：{@link generic:host-entry}。',
    },
  ],
  adopts: [
    {
      source: {group: 'cli/api', kinds: ['function', 'schema', 'enum']},
      into: 'kinds',
      groupBy: 'kind',
    },
  ],
};
