// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/problems`: every line global mode prints, with its
 * cause and fix, quoted from the CLI's own strings (test/global-mode-docs.test.mjs
 * fails when they differ); install problems package managers cause.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'problems',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 9,
  },
  title: 'global 模式疑难排查',
  category: 'guide',
  keywords: [
    '疑难排查',
    '错误',
    '不生效',
    'command not found',
    'ERR_VERSIONS_UNAVAILABLE',
    'ERR_PROJECT_REQUIRED',
    '代理',
    'registry',
    'corepack',
    'windows',
    'PATH',
    'astryx 版本不对',
    '回退',
    'could not get Astryx',
  ],
  description:
    'Astryx 在 global 模式下打印的每一行、其含义与处理办法。外加包管理器导致的安装问题：权限、PATH、Corepack 与 Windows。',
  sections: [
    {
      id: 'answered-by',
      title: '"astryx: answered by …"',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'astryx: answered by CLI 0.7.2 with Core 0.7.2, outside a project',
        },
        {
          type: 'prose',
          text: '这是信息提示，不是错误：它说明由哪个版本应答及其原因。仅在文本模式下打印，从不随 `--json` 打印。其他形式见 {@link generic:who-answers}。',
        },
      ],
    },
    {
      id: 'installing',
      title: '"installing CLI release … into the per-user cache"',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'astryx: installing CLI release 0.6.8 into the per-user cache (once)...\nastryx: waiting for another run to finish installing CLI release 0.6.8...',
        },
        {
          type: 'prose',
          text: '项目自带的 CLI 无法启动，因此 Astryx 把与 Core 版本一致的 CLI 装进缓存，只装一次。第二行表示另一次运行正在安装；本次会等待，最长 15 分钟。要避免等待，就安装项目的依赖。',
        },
      ],
    },
    {
      id: 'notices',
      title: '"A new release of Astryx is available"',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'A new release of Astryx is available: 0.7.2 → 0.7.3\nTo upgrade, run: npm i -g @astryxdesign/cli@latest\nTo upgrade, install Node >=22 (this computer runs Node 20.11.0), then run: npm i -g @astryxdesign/cli@latest',
        },
        {
          type: 'prose',
          text: '有更新的版本发布；运行显示的命令即可升级。当最新版需要更新的 Node 时，第二行会先指出这一点。要关闭通知，设置 `NO_UPDATE_NOTIFIER`：{@link generic:updates}。',
        },
      ],
    },
    {
      id: 'old-astryx',
      title: '"The astryx command on this computer runs CLI …"',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'The astryx command on this computer runs CLI 0.6.4, which answers every folder itself.\nTo upgrade, run: npm i -g @astryxdesign/cli@latest',
        },
        {
          type: 'prose',
          text: 'PATH 上第一个 astryx 命令是 global 模式出现之前的版本，因此它无视项目声明的版本。运行显示的命令，或移除那份安装。`{@command doctor}` 的 `cli-on-path` 检查会列出 PATH 上的每一个 astryx 命令。',
        },
      ],
    },
    {
      id: 'fallback',
      title: '"could not get Astryx … to match this project\'s Core"',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: "astryx: could not get Astryx 0.6.8 to match this project's Core (the registry could not be reached); answering with CLI 0.7.2 instead\nastryx: could not get Astryx 0.6.8 to match this project's Core (the registry does not have it); answering with CLI 0.7.2 instead\nastryx: could not get Astryx 0.6.8 to match this project's Core (the release cache /home/me/.cache/astryx/releases cannot be written (EACCES)); answering with CLI 0.7.2 instead",
        },
        {
          type: 'prose',
          text: '项目自带的 CLI 无法启动，Astryx 需要与 Core 版本一致的 CLI 却拿不到，于是命令仍会运行：由你启动的 astryx 命令应答，就像 global 模式出现之前那样。在修好原因之前，它的应答可能与项目的 Core 不匹配。使用 `--json` 时，`meta.answeredBy.copy` 为 `fallback`。Astryx 在重试下载前等待 2 分钟，连续第二次失败后再等 10 分钟；重装项目依赖可以修好项目自带的 CLI。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '无法连接 registry：你处于离线状态，或被代理拦截。Astryx 通过 npm 安装，因此在 `.npmrc` 里设置 npm 的 `proxy`、`https-proxy` 或 `registry`，或把 CLI 加进项目并安装其依赖。',
            'registry 没有这个版本：私有 registry 缺少 Astryx 包。把 npm 对 `@astryxdesign` 的 registry 指向一个有这些包的源。',
            '缓存不可写：主目录只读，常见于某些容器。把 `XDG_CACHE_HOME` 指向可写目录：{@link generic:ci-and-containers}。',
          ],
        },
      ],
    },
    {
      id: 'not-global',
      title: '收不到更新通知与智能体指南的全局安装',
      content: [
        {
          type: 'prose',
          text: '只有当包管理器自身的设置里写明该目录时（npm 的全局 prefix、Bun 的 `BUN_INSTALL`、Yarn 的 `global-folder`、pnpm 的 `PNPM_HOME`，或它们的默认值），Astryx 才把这份安装视为本机全局安装。仅用一次性 flag 指定的目录（如 {@pm-only yarn-classic "uses the Yarn 1 global folder" global add --global-folder ~/mine}）不在任何设置里，因此 Astryx 把那份安装当成项目的：没有每日更新检查，也没有智能体指南。把目录存进设置，Astryx 才知道这是全局安装：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm-only yarn-classic "uses the Yarn 1 global folder" config set global-folder ~/mine}   # writes ~/.yarnrc\nexport BUN_INSTALL=~/mybun              # in your shell profile, for Bun',
        },
      ],
    },
    {
      id: 'core-offline',
      title: '项目外的 "Core … could not be installed"',
      content: [
        {
          type: 'prose',
          text: '在项目之外，读取组件的命令（`component`、`search`、`template`、`build` 等）使用你全局版本的 Core。只有部分安装方式随 CLI 附带它；否则全局安装会在你联网运行某条命令后，于后台把它一次性下载进缓存（在 Windows 上，第一条组件命令触发下载），而在此之前离线运行的组件命令会以 `ERR_VERSIONS_UNAVAILABLE` 失败。重装 CLI 没有用：联网运行任意一条命令一次，此后组件读取即可离线工作。在 CI 里没有后台下载，因此那里的第一条组件命令需要能访问 registry。global 模式的各页面（{@link namespace:global}）无论如何都可离线读取。',
        },
        {
          type: 'prose',
          text: '在一个还没安装任何依赖的项目里（比如刚克隆的仓库），同样的命令也使用这份 Core；离线时错误信息为 `This project has no Core installed, and Core <version> could not be downloaded`：安装项目依赖（`{@pm install}`，或用你的包管理器安装），此后由项目自带的 Core 应答。',
        },
      ],
    },
    {
      id: 'unavailable',
      title: 'ERR_VERSIONS_UNAVAILABLE',
      content: [
        {
          type: 'prose',
          text: '只有当没有任何一方能应答时，运行才会以 `ERR_VERSIONS_UNAVAILABLE` 失败：项目之外需要 Core 的命令装不上它，或你精确指定的版本找不到。',
        },
      ],
    },
    {
      id: 'needs-a-project',
      title: '需要项目的命令',
      content: [
        {
          type: 'code',
          lang: 'text',
          code: 'Error: No package.json found. Run this command inside an app project.\nError: No package.json found. Run this command inside an integration package.\nError: Could not find @astryxdesign/core package. Make sure you are inside the design system monorepo or have @astryxdesign/core installed.\nError: Could not find installed @astryxdesign/core (or legacy @xds/core). This folder is outside a project; upgrade migrates the code of an app project that installs @astryxdesign/core.',
        },
        {
          type: 'prose',
          text: '会修改应用或包的命令，如 `theme use`、`integration add`、`swizzle`、`upgrade`，在项目之外不写任何东西，并说明自己需要什么。请在那个项目里运行。每条命令的文档说明了它在项目之外的行为（{@link namespace:commands}）；较新的命令会直接拒绝并报 `ERR_PROJECT_REQUIRED`。',
        },
      ],
    },
    {
      id: 'install-problems',
      title: '安装问题',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`npm i -g` 以 `EACCES`（权限被拒）失败：不要用 `sudo`。改用 Node 版本管理器，或给 npm 一个你拥有的全局目录：{@pm-only npm "moves the npm global folder" config set prefix ~/.npm-global}，然后把 `~/.npm-global/bin` 加入 PATH。',
            '安装后出现 `astryx: command not found`：包管理器的全局 bin 目录不在 PATH 上。{@pm-only npm "prints the npm global folder" prefix -g} 显示 npm 的目录（在 macOS 和 Linux 上是其 `bin` 目录）；{@pm-only pnpm "sets up the pnpm global folder" setup} 会配置 pnpm 的。',
            '`pnpm add -g` 以 `ERR_PNPM_NO_GLOBAL_BIN_DIR` 中止，常见于 Corepack 场景：运行 {@pm-only pnpm "sets up the pnpm global folder" setup}，开一个新终端再试。Yarn 2 及以后没有 `yarn global`；改用 `npm i -g`。',
            'Windows：npm 把 `astryx.cmd` 放在 `%APPDATA%\\npm`，该目录必须在 PATH 上。如果 PowerShell 提示禁止运行脚本，改运行 `astryx.cmd`，或用 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 为当前用户放行脚本。',
            '装了两份，跑起来的是错的那个：在项目之外运行 {@command doctor}，会按 shell 尝试的顺序列出 PATH 上的每一个 astryx 命令。',
          ],
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于 global 模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了 global 模式是什么以及各部分如何工作。',
        },
      ],
    },
  ],
};
