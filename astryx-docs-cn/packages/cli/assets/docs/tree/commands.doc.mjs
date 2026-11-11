// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/commands`: every command the CLI ships.
 *
 * Adopts each command doc whose `namespace` is `cli/commands`, so a new
 * command appears here with no edit to this file.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'commands',
  title: '命令',
  summary:
    '每条命令与子命令：用法、选项、示例、退出码，以及在项目之外的行为。',
  keywords: ['命令', '用法', '选项', '标志'],
  placement: {parent: 'namespace:cli', slot: 'reference', order: 10},
  slots: {
    commands: {title: '命令', accepts: {kinds: ['command']}},
  },
  adopts: [
    {source: {group: 'cli/commands', kinds: ['command']}, into: 'commands'},
  ],
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：每条命令都声明了它在项目之外的行为（`outsideProject`）。大多数命令像在一个新项目里那样应答；有些什么都不写入，并指出它们需要的项目；`doctor`、`init` 和 `upgrade` 的行为则不同。行为有差异的命令会在各自的 `In global mode:` 说明中描述，且 CLI 测试会在空文件夹里针对每条命令声明的值运行它。在项目内，无论你输入的是哪条 astryx 命令，都由项目的 Astryx 版本运行。见 {@link namespace:global}。',
    },
  ],
};
