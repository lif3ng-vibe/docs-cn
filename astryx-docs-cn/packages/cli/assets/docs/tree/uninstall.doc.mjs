// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/uninstall`: uninstall the global install with each package
 * manager, remove the agent guide, and reset the cache and settings folders.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'uninstall',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 10,
  },
  title: '卸载与重置',
  category: 'guide',
  keywords: [
    '卸载',
    '移除',
    '重置 astryx',
    '清除缓存',
    '删除缓存',
    'npm uninstall -g',
    '移除智能体（agent）指南',
    '重新开始',
  ],
  description:
    '移除你的全局安装、其中保存的智能体（agent）指南以及它使用的文件夹，或将其重置以重新开始。',
  sections: [
    {
      id: 'agent-guide',
      title: '第一步：移除智能体指南',
      content: [
        {
          type: 'prose',
          text: '趁 CLI 仍处于安装状态，先从你的用户主文件夹移除智能体指南：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command init --user --remove-agents}',
        },
        {
          type: 'prose',
          text: '或者删除 `~/.agents/skills/astryx` 以及 {@link generic:computer-agent-guide} 中列出的指向它的链接。',
        },
      ],
    },
    {
      id: 'uninstall',
      title: '卸载',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm remove @astryxdesign/cli --global}\n# with Volta: volta uninstall @astryxdesign/cli',
        },
        {
          type: 'prose',
          text: '项目不受影响：各项目仍使用自己安装的 CLI（如有）。',
        },
      ],
    },
    {
      id: 'reset',
      title: '重置',
      content: [
        {
          type: 'prose',
          text: '删除任一文件夹即可将其重置；Astryx 会在下次运行时重建所需内容。',
        },
        {
          type: 'table',
          headers: ['文件夹', 'Linux', 'macOS', 'Windows'],
          rows: [
            [
              '缓存：各项目的版本、已保存的 discover 问答',
              '`~/.cache/astryx`',
              '`~/Library/Caches/astryx`',
              '`%LOCALAPPDATA%\\astryx\\Cache`',
            ],
            [
              '设置：更新检查、智能体指南设置及其链接',
              '`~/.config/astryx`',
              '`~/Library/Application Support/astryx`',
              '`%APPDATA%\\astryx`',
            ],
          ],
        },
        {
          type: 'prose',
          text: '在 Linux 上，若把 `XDG_CACHE_HOME` 与 `XDG_CONFIG_HOME` 设为绝对路径，它们会改变这些文件夹的位置。',
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，其中解释了全局模式是什么以及各部分如何工作。',
        },
      ],
    },
  ],
};
