// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/configuration/cli-command`:
 * name the command an integration's users run the CLI with, so every command
 * the CLI prints in their apps starts with it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'cli-command',
  placement: {parent: 'namespace:configuration', slot: 'guides', order: 15},
  title: 'CLI 命令',
  category: 'guide',
  keywords: [
    'cliCommand',
    '命令名',
    '包装器',
    '打印的命令',
    'pnpm exec astryx',
  ],
  description:
    '为用户运行 CLI 的命令命名，让 CLI 在其应用中打印的每条命令都以它开头。',
  sections: [
    {
      id: 'when-to-set-it',
      title: '何时设置',
      content: [
        {
          type: 'prose',
          text: 'CLI 会在大多数回答的结尾给出下一条要运行的命令：可能是提示、错误修复、Doctor 修复，或文档示例。默认情况下，每条命令都以能触达应答版本的方式开头：应用自身 CLI 应答时，用应用的包管理器所运行的命令，例如 `pnpm exec astryx` 或 `yarn astryx`；否则用锁定到该版本的 CLI 包，例如 `{@pm dlx @astryxdesign/cli@0.7.2}`。',
        },
        {
          type: 'prose',
          text: '只有当用户以其他方式运行 CLI 时才设置 `cliCommand`，例如你们公司发布的某个包装器（wrapper），它在加载你们包的情况下运行 CLI。否则，CLI 打印的命令会把用户和他们的智能体（agent）引向一个在没有你们包的情况下应答的 CLI。大多数包都不设置它。',
        },
      ],
    },
    {
      id: 'set-it',
      title: '设置它',
      content: [
        {
          type: 'prose',
          text: '在 `astryx.integration.mjs` 中添加 `cliCommand`：只写命令本身，不带子命令。',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// astryx.integration.mjs
export default {
  components: './components',
  cliCommand: 'acme astryx',
};`,
        },
        {
          type: 'prose',
          text: '在安装了你们包的应用里，CLI 此后打印每条命令都会带上它：',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Error: Theme "ocean" is not added. Run `acme astryx theme add ocean` first.',
        },
        {
          type: 'prose',
          text: '这涵盖提示、错误、建议、Doctor 修复、`--help`、安装提醒、`init` 写入的智能体块，以及文档文本。`--json` 输出保留每条不带运行器的命令，如 `"command": "astryx theme add ocean"`，这样脚本在所有应用里读到的字段都一致。',
        },
      ],
    },
    {
      id: 'how-the-cli-picks',
      title: 'CLI 如何选定命令',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '应用加载的包所设置的 `cliCommand`，前提是它们只声明了一条命令。',
            '宿主工具为应用运行 CLI 时指定的命令。普通项目里没有任何东西会指定命令。',
            '能触达应答版本的命令：应用自身 CLI 应答时，用应用的包管理器所运行的命令，例如 `pnpm exec astryx` 或 `yarn astryx`；为整台机器安装的 CLI 应答时，在项目之外用 `astryx`；否则用锁定到该版本的 CLI 包，例如 `{@pm dlx @astryxdesign/cli@0.7.2}`（见 {@link generic:who-answers}）。',
          ],
        },
        {
          type: 'prose',
          text: '两个包设置同一条命令即视为一致，CLI 会采用它。',
        },
      ],
    },
    {
      id: 'when-two-packages-disagree',
      title: '两个包不一致时',
      content: [
        {
          type: 'prose',
          text: '如果应用加载的两个包设置了不同的命令，CLI 两条都不采用：它会用应用的包管理器所运行的命令来打印命令，即使宿主工具指定过命令也是如此。`{@command doctor}` 会在其 `cli-command` 检查中发出警告，并指出这两个包：',
        },
        {
          type: 'code',
          lang: 'text',
          code: `status:  [warn]
label:   CLI command
message: Loaded integrations declare different CLI commands: @acme/astryx-widgets (\`acme astryx\`), @other/kit (\`other astryx\`). Neither is used, so printed commands start with \`pnpm exec astryx\`.`,
        },
        {
          type: 'prose',
          text: '应用可以移除不该在的那个包来修复，或者让这些包统一为一条命令。',
        },
      ],
    },
    {
      id: 'check-it',
      title: '校验',
      content: [
        {
          type: 'prose',
          text: '无效的值会被忽略，清单的其余部分照常加载。`{@command doctor integration validate}` 会以 `invalid_cli_command` 报告它。有效的 `cliCommand` 是一行纯文本，首尾无空格，最多 120 个字符。',
        },
        {
          type: 'prose',
          text: '在安装了你们包的应用里，`{@command doctor}` 会通过其 `cli-command` 检查，并指明是你们的包设置的这条命令。早于该字段发布的 CLI 会把 `cliCommand` 当作未知键报告，并打印包管理器的命令。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration validate}\n# In an app that installs the package\n{@command doctor}',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：在项目之外，适用为整台机器安装的集成的 `cliCommand`；若无人声明，命令以这台机器上安装的 CLI 的裸命令开头。在项目之内，只有项目的集成生效，因此来自为整台机器安装的包的 `cliCommand` 绝不会改变项目里打印的命令。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
