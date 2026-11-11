// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs authoring/building-blocks/configuration — set how your integration behaves. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'configuration',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 60},
  title: '配置',
  summary:
    '设置集成在应用中的行为方式：智能体指引、用户运行 CLI 的命令、调试与差距报告，后续还会有更多。',
  keywords: ['配置', '智能体指引', 'cliCommand', '调试', '差距报告'],
  slots: {
    guides: {title: '配置', accepts: {kinds: ['generic', 'namespace']}},
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：你的包与全局 CLI 并列安装在这台机器上时，其清单的读取方式与在项目中相同，并应用于任何项目之外的文件夹；peer 范围对照全局 CLI 的版本检查。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
    },
    {
      type: 'prose',
      text: '除了交付的内容之外，集成还能设置它在应用中的行为方式：给在其中工作的 AI 智能体的指引、用户运行 CLI 的命令，以及它对每次 CLI 运行的记录。在下方打开一项进行设置。',
    },
  ],
};
