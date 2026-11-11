// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/reference`: every folder, environment variable, JSON
 * field, and error code of global mode, and a short glossary (spec AST-081).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'reference',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 11,
  },
  title: '全局模式参考',
  category: 'guide',
  keywords: [
    '参考',
    '路径',
    '目录',
    '环境变量',
    'env vars',
    'XDG_CACHE_HOME',
    'XDG_CONFIG_HOME',
    'LOCALAPPDATA',
    'APPDATA',
    'meta.available',
    '错误码',
    '词表',
    'state.json',
    'settings.json',
  ],
  description:
    '全局模式在各系统上使用的每个文件夹、读取的环境变量、新增的 JSON 字段、错误码，以及一份简明词表。',
  sections: [
    {
      id: 'paths',
      title: '文件夹与文件',
      content: [
        {
          type: 'table',
          headers: ['内容', 'Linux', 'macOS', 'Windows'],
          rows: [
            [
              '缓存文件夹',
              '`~/.cache/astryx`（或 `$XDG_CACHE_HOME/astryx`）',
              '`~/Library/Caches/astryx`',
              '`%LOCALAPPDATA%\\astryx\\Cache`',
            ],
            [
              '项目用的版本',
              '`<cache>/releases/<version>`',
              '`<cache>/releases/<version>`',
              '`<cache>\\releases\\<version>`',
            ],
            [
              '设置文件夹',
              '`~/.config/astryx`（或 `$XDG_CONFIG_HOME/astryx`）',
              '`~/Library/Application Support/astryx`',
              '`%APPDATA%\\astryx`',
            ],
            [
              '更新检查与通知，以及上次通知或检查未执行的原因（仅 `{@command doctor}` 使用）',
              '`<settings>/state.json`',
              '`<settings>/state.json`',
              '`<settings>\\state.json`',
            ],
            [
              '智能体（agent）指南设置，以及 Astryx 创建的链接',
              '`<settings>/settings.json`',
              '`<settings>/settings.json`',
              '`<settings>\\settings.json`',
            ],
            [
              '智能体指南',
              '`~/.agents/skills/astryx/SKILL.md`，从 `~/.claude/skills/astryx` 等处链接过来',
              '同上',
              '同上，位于 `%USERPROFILE%` 下',
            ],
          ],
        },
        {
          type: 'prose',
          text: '智能体指南链接到的全部文件夹：{@link generic:computer-agent-guide}。',
        },
      ],
    },
    {
      id: 'env',
      title: '环境变量',
      content: [
        {
          type: 'table',
          headers: ['变量', '作用'],
          rows: [
            [
              '`CI`',
              '设为除空值、`0`、`false` 之外的任意值：不做更新检查，也不发通知。',
            ],
            [
              '`NO_UPDATE_NOTIFIER`',
              '设为任意值：不做更新检查，也不发通知。',
            ],
            [
              '`XDG_CACHE_HOME`, `XDG_CONFIG_HOME`',
              '在 Linux 上移动缓存与设置文件夹；仅在值为绝对路径时生效。',
            ],
            [
              '`LOCALAPPDATA`, `APPDATA`',
              '在 Windows 上指定缓存与设置文件夹；仅在值为绝对路径时生效。',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Astryx 不读取任何自有环境变量。npm 自身的设置（如 registry 与代理）会作用于它为项目安装的版本。',
        },
      ],
    },
    {
      id: 'json',
      title: 'JSON 字段',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`meta.answeredBy` 出现在每个成功的 `--json` 结果中：`cli`（作出应答的版本）、`core`（其使用的 Core，或为 `null`），以及 `copy`：`project`（项目自己的 CLI）、`starting`（你启动的 astryx 命令，项目没有自己的 CLI 时）、`matched`（与项目 Core 一致的 CLI 版本，项目自己的 CLI 无法启动时）、`carried`（项目之外），或 `fallback`（无法取得该版本，改由你启动的 astryx 命令应答）。',
            '来自 `{@command discover}` 且 `source: "installed for this computer"` 的 `meta.available` 条目：安装在你的全局安装旁、项目可以添加的集成，其安装命令在 `install` 中。',
          ],
        },
      ],
    },
    {
      id: 'errors',
      title: '错误码',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`ERR_VERSIONS_UNAVAILABLE`：没有任何版本能应答，例如在无法安装 Core 的项目之外运行需要 Core 的命令。若只是缺少匹配版本，运行仍会应答并附警告。{@link generic:problems}',
            '`ERR_PROJECT_REQUIRED`：只能在项目中运行的命令被用在项目之外。全局模式出现之前发布的命令保留其原有错误码：`theme use`、`theme remove`、`theme add <slug>` 用 `ERR_THEME_INVALID`，`integration add` 用 `ERR_FILE_NOT_FOUND`，`swizzle` 用 `ERR_CORE_NOT_FOUND`，`upgrade` 用 `ERR_VERSION_DETECT`。',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '全局模式下的变化',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '由哪个版本应答：项目内由项目自己的 CLI 应答（只有 Core 时，由你启动的 astryx 命令应答）；项目外由全局版本应答。{@link generic:who-answers}',
            '修改项目的命令在项目外不写任何东西；`doctor`、`init` 与 `theme add` 在那里做的是别的事情。{@link namespace:commands}',
            '全局安装的集成只在项目外生效。{@link generic:computer-integrations}',
            '编程 API 在你的进程内以你导入的包运行，绝不转交给其他版本；当 `cwd` 在项目外时，其函数的应答方式与命令在项目外的行为一致。{@link namespace:api}',
          ],
        },
      ],
    },
    {
      id: 'glossary',
      title: '词表',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '**全局安装**：用 `npm i -g` 或其他包管理器为整台电脑安装的 CLI。',
            '**项目版本**：项目自己的 CLI；该项目中的每个命令都由它应答。只有 Core 的项目没有它，改由你启动的 astryx 命令应答。',
            '**缓存**：Astryx 存放项目需要但未安装的版本的文件夹。',
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
          text: '本页属于 {@link namespace:global}，那里解释了全局模式是什么以及各部分如何工作。',
        },
      ],
    },
  ],
};
