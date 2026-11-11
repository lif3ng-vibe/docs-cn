// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/ci-and-containers`: Astryx in CI and containers: no
 * update checks, caching versions, read-only home folders (spec AST-081 FR6,
 * FR7, FR10).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'ci-and-containers',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 8,
  },
  title: 'CI 与容器',
  category: 'guide',
  keywords: [
    'ci',
    'github actions',
    '容器',
    'docker',
    '只读 home 目录',
    '缓存发布缓存',
    '智能体机器',
    '重启',
    '临时机器',
  ],
  description:
    'Astryx 在 CI 与容器中的行为：不检查更新、不输出通知，项目版本照常生效，以及如何缓存版本、如何应对只读的 home 目录。',
  sections: [
    {
      id: 'in-ci',
      title: '在 CI 中',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '大多数 CI 服务都会设置 `CI=true`。只要 `CI` 被设为空、`0`、`false` 以外的任何值，Astryx 就绝不检查更新，也绝不输出通知；`CI=false`、`CI=0` 和空 `CI` 不算数。`NO_UPDATE_NOTIFIER` 无论设成什么值，在任何环境都同样生效。',
            '把 `@astryxdesign/cli` 以 devDependency 的形式加入项目，并与 `@astryxdesign/core` 保持同一版本；这样 CI 运行的就是仓库锁定的版本，不会拉取任何东西。在 CI 镜像里做全局安装也可以：在项目内运行时，它运行项目的版本。',
            '需要脚本读取输出时使用 `--json`；它绝不携带 answered-by 行或更新通知。',
          ],
        },
      ],
    },
    {
      id: 'cache',
      title: '缓存项目版本',
      content: [
        {
          type: 'prose',
          text: '项目安装了自己的 CLI、而你又先装好项目依赖时，就没有东西可缓存。Astryx 只会把两类内容下载进缓存：项目自身 CLI 无法启动时所需的那份 CLI 版本，以及在项目之外，读取组件的命令所需的全局安装的 Core。在 CI 中它不会在后台下载任何东西，因此 CI 镜像里的全局安装要到第一条组件命令时才拉取这份 Core。要想每次运行都跳过这些下载，请在多次运行之间缓存此文件夹：',
        },
        {
          type: 'table',
          headers: ['Linux', 'macOS', 'Windows'],
          rows: [
            [
              '`~/.cache/astryx` (or `$XDG_CACHE_HOME/astryx`)',
              '`~/Library/Caches/astryx`',
              '`%LOCALAPPDATA%\\astryx\\Cache`',
            ],
          ],
        },
      ],
    },
    {
      id: 'read-only',
      title: '只读的 home 目录',
      content: [
        {
          type: 'prose',
          text: '缓存不可写时，自身 CLI 无法启动的项目会由全局安装代为应答，同时给出警告并指明该文件夹。可以把 `XDG_CACHE_HOME` 指向一个可写的绝对路径，也可以重新安装项目依赖。全局安装的每日检查和智能体（agent）指南在不可写时会被静默跳过。',
        },
      ],
    },
    {
      id: 'short-lived',
      title: '只保留 home 目录的机器',
      content: [
        {
          type: 'prose',
          text: '有些智能体机器重启后保留 home 目录，却不保留系统目录。全局安装在这种机器上重启后即消失，而 home 目录里的智能体指南还在，于是智能体会被指引去运行一条已经不存在的全局 astryx 命令；指南要求在该命令找不到时，运行当初安装 CLI 的那条命令，例如 `{@pm install @astryxdesign/cli --global}`，`astryx doctor` 也会给出同样的步骤。要让 CLI 在重启后仍然可用，请把它安装到 home 目录下的某个文件夹，并把它的 `bin` 文件夹加入 PATH（如同遇到权限错误时的做法，见 {@link generic:install-once}），或者在机器启动时运行那条命令。',
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了全局模式是什么，以及各部分如何运作。',
        },
      ],
    },
  ],
};
