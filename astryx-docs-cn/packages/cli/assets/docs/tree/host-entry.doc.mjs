// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/host-entry`: run the CLI from a tool that carries it,
 * through `@astryxdesign/cli/host` (spec AST-081 FR1,
 * architecture:cli-surface INV30).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'host-entry',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 15},
  title: '宿主入口',
  category: 'guide',
  keywords: [
    '宿主入口',
    'runHostedCli',
    '@astryxdesign/cli/host',
    '携带 CLI',
    '嵌入 CLI',
    '编程式运行',
    '包集合',
    'cliCommand',
  ],
  description:
    '从你自己的命令行工具运行 Astryx CLI：`runHostedCli` 接受哪些输入、返回什么，以及哪些情况下进程会改为直接结束。',
  sections: [
    {
      id: 'start',
      title: '启动一次运行',
      content: [
        {
          type: 'prose',
          text: '为自身用户携带 CLI 的工具，通过 `@astryxdesign/cli/host` 的 `runHostedCli` 在每个进程中启动一次运行。该运行的行为与 CLI 自身命令在相同文件夹、相同参数下的表现一致，且它打印的命令会以你的工具命令开头。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "import {runHostedCli} from '@astryxdesign/cli/host';\n\nconst {status} = await runHostedCli({\n  argv: process.argv.slice(2),\n  cwd: process.cwd(),\n  cliCommand: 'acme astryx',\n});\nprocess.exitCode = status;",
        },
      ],
    },
    {
      id: 'options',
      title: '选项',
      content: [
        {
          type: 'table',
          headers: ['选项', '默认值', '含义'],
          rows: [
            [
              '`argv`',
              '无',
              '命令行参数，不含命令名。',
            ],
            [
              '`cwd`',
              '进程的工作文件夹',
              '运行所处的工作文件夹。必须已存在。',
            ],
            [
              '`cliCommand`',
              '包管理器名称',
              '你的用户输入的命令，例如 `acme astryx`：一行非空文本，最多 120 个字符，前后无空格。',
            ],
            [
              '`declinedProjectCli`',
              '无',
              '你没有运行项目自身 CLI 的原因，例如 `untrusted`：一行非空文本，最多 120 个字符。此后该 CLI 永不运行。',
            ],
            [
              '`roots`',
              '无',
              '你的包集合，按优先级排序：各文件夹的 `node_modules` 中分别装有 CLI、同一发行版的 Core 以及集成。运行从不安装发行版；它从第一个装有项目所需发行版的集合中取用。',
            ],
            [
              '`integrations`',
              '无',
              '你批准在项目外使用的集成，按包名指定。',
            ],
            [
              '`discoverSources`',
              '无',
              '你自己的 discover 来源。`{@command discover}` 会把每一项报告为宿主的来源。',
            ],
          ],
        },
      ],
    },
    {
      id: 'result',
      title: '结果与错误',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '它以 `{status, packages}` 兑现（resolve）：即 CLI 自身命令会以之退出的退出状态，以及本次运行用到的每个包——含其版本，以及它来自项目还是包集合。',
            '当另一个发行版通过自己的宿主入口从你的某个包集合应答时，该入口会在同一进程中以相同输入运行，且调用以它的结果兑现。',
            '对未知选项或无效值，它会在任何东西运行之前以 `TypeError` 拒绝（reject）；当进程中已有运行启动时，则以 `Error` 拒绝。请在新的进程中启动每次运行。',
          ],
        },
      ],
    },
    {
      id: 'process-ends',
      title: '进程何时改为直接结束',
      content: [
        {
          type: 'prose',
          text: '与 CLI 自身命令一样，当运行出现下列情况时，它会以退出状态结束进程，而调用永不兑现：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '打印帮助或版本信息（`--help`、`-h`、`help`、`--version`、`-V`、`--version --json`）；',
            '拒绝命令行，例如未知命令或选项；',
            '报告一个使其停止的错误，包括 `--json` 模式下的所有错误；',
            '遇到意外错误；',
            '把运行移交给另一个 CLI 自身的命令：未传 `declinedProjectCli` 时交给项目的 CLI，或交给某个 CLI 没有宿主入口的包集合。',
          ],
        },
      ],
    },
  ],
};
