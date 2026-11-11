// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/computer-agent-guide`: the one skill file the global
 * install keeps for the whole computer, its links, and `init --user` (spec
 * AST-081 FR8).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'computer-agent-guide',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 5,
  },
  title: '你电脑上的智能体指南',
  category: 'guide',
  keywords: [
    '智能体指南',
    'init --user',
    'SKILL.md',
    'skills',
    'remove-agents',
    'claude',
    'codex',
    'cursor',
    '智能体',
    '其他智能体',
    'symlink',
    '链接 skills',
  ],
  description:
    '全局安装会在你的 home 目录里保留一份简短的 Astryx skill，并把它链接到智能体工具读取的文件夹，让任何地方的智能体都知道这台机器上有 Astryx。`{@command init --user}` 可立即写入或将其关闭。',
  sections: [
    {
      id: 'what',
      title: '它是什么',
      content: [
        {
          type: 'prose',
          text: '项目的智能体文档只能触达在该项目中工作的智能体（agent）。你的全局安装还会保留一份 skill 文件 `~/.agents/skills/astryx/SKILL.md`，大多数编码智能体都会读取它。它告诉智能体：这台电脑上装有 Astryx、它何时相关（构建或修改 UI 时），以及应从 `{@command search}` 开始。它不写版本号，因此永不过时。在项目内，项目自己的智能体文档优先。',
        },
        {
          type: 'prose',
          text: '它在首次运行时于后台写入，升级后会再次写入，因此没有命令需要等待它。安装包时不会写入它，因为有些包管理器会跳过安装脚本。',
        },
      ],
    },
    {
      id: 'where',
      title: '智能体在哪里找到它',
      content: [
        {
          type: 'prose',
          text: '只读取自己 skills 文件夹的智能体会得到一个指向该 skill 文件夹的链接，因此它们读到的都是同一个文件：一个带相对目标的文件夹符号链接（Windows 上是 junction；两者都无法创建时用副本）。Continue 的扫描器会跳过链接，所以它得到的是副本，并随该文件刷新：',
        },
        {
          type: 'table',
          headers: ['文件夹', '时机'],
          rows: [
            ['`~/.claude/skills/astryx`', '始终'],
            ['`~/.kiro/skills/astryx`', '当 `~/.kiro` 存在时'],
            [
              '`~/.codeium/windsurf/skills/astryx`',
              '当 `~/.codeium/windsurf` 存在时',
            ],
            ['`~/.letta/skills/astryx`', '当 `~/.letta` 存在时'],
            [
              '`~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/skills/astryx`',
              '当 Xcode 的编码助手文件夹存在时',
            ],
            [
              '`~/.config/agents/skills/astryx`',
              '当 `~/.config/agents/skills` 存在时',
            ],
            [
              '`~/.continue/skills/astryx`（副本）',
              '当 `~/.continue` 存在时',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Astryx 绝不替换在这些文件夹里不是由它创建的任何东西，也绝不写入其他工具管理的文件夹；`{@command doctor}` 会指出它跳过了哪些，以及哪些链接的 skill 文件夹缺失——例如只挂载了一个智能体文件夹的容器。',
        },
      ],
    },
    {
      id: 'cloud-and-apps',
      title: '云端智能体与应用',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '云端与后台智能体只读仓库，所以能触达它们的是项目自己的智能体文档，即 `{@command init}` 写入 AGENTS.md 或 CLAUDE.md 的那个块。',
            '接受上传 skill 的应用：上传 `~/.agents/skills/astryx/SKILL.md`，或其文件夹的 zip 包。',
          ],
        },
      ],
    },
    {
      id: 'other-agents',
      title: '其他智能体',
      content: [
        {
          type: 'prose',
          text: '如果你的智能体从其他文件夹读取 skills，把它链接到该 skill：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "ln -s ~/.agents/skills/astryx <your agent's skills folder>/astryx",
        },
        {
          type: 'prose',
          text: '在 Windows 上，用 PowerShell：',
        },
        {
          type: 'code',
          lang: 'powershell',
          code: 'New-Item -ItemType Junction -Path "<your agent\'s skills folder>\\astryx" -Target "$HOME\\.agents\\skills\\astryx"',
        },
      ],
    },
    {
      id: 'choose',
      title: '立即写入，或将其关闭',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: '{@command init --user}\n{@command init --user --remove-agents}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`init --user` 立即写入文件与链接。',
            '`--remove-agents` 移除该文件和 Astryx 创建的所有链接，并将其关闭，直到你再次运行 `{@command init --user}`。',
            '你编辑过的文件绝不会被覆盖或移除；删除它即可获得当前文本。',
            '在项目之外，`{@command doctor}` 会说明 skill 是否存在、是否为当前版、是否被编辑过或已关闭，以及链接到了哪里。',
          ],
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了全局模式是什么，以及各部分如何运作。项目自己的智能体文档：见 {@link command:init}。',
        },
      ],
    },
  ],
};
