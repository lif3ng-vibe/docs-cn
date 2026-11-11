// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/configuration/debug-and-gap-reports`: receive a record
 * of each CLI run with `debug`, and handle `astryx gap-report` with
 * `gapReport`, both named exports of the integration manifest.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'debug-and-gap-reports',
  placement: {parent: 'namespace:configuration', slot: 'guides', order: 20},
  title: '调试与缺口报告',
  category: 'guide',
  keywords: ['缺口报告', 'gap report', '调试处理器', 'debug handler'],
  description:
    '在使用你的包的应用中接收每次 CLI 运行的记录，并处理这些应用发来的相关缺口报告。',
  sections: [
    {
      id: 'record-runs-with-debug',
      title: '用 debug 记录运行',
      content: [
        {
          type: 'prose',
          text: '从 `astryx.integration.mjs` 导出一个 `debug` 函数；在加载你的包的应用中，CLI 每运行一条命令都会调用它一次。',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// astryx.integration.mjs
import {appendFileSync} from 'node:fs';

/** @param {import('@astryxdesign/cli/authoring').DebugEvent} event */
export function debug(event) {
  if (event.outcome !== 'ok') {
    appendFileSync('acme-failed-runs.ndjson', JSON.stringify(event) + '\\n');
  }
}

export default {
  components: './components',
};`,
        },
        {
          type: 'prose',
          text: '该事件是一个 `DebugEvent`，包含 `command`、`outcome`、`exitCode`、`durationMs`、`error` 等字段，字段值均已脱敏（`redacted: true`）。每个字段的定义见 {@link schema:debug-event}。',
        },
        {
          type: 'prose',
          text: '保持该函数同步：CLI 在进程退出时调用它，绝不等待 promise。应用自身的 `debug` 处理器先运行，你的后运行。抛出异常的处理器会被跳过，命令的输出与退出码保持不变。',
        },
        {
          type: 'prose',
          text: '只有当应用的 `astryx.config` 提到 `integrations` 或 `debug` 时（把你的包列入清单正属此列），它才会记录每条命令。否则，你的处理器只对加载应用项目的命令运行，如 `component` 和 `docs`，绝不会对 `--version` 或输错的命令运行。在配置中两者都未提及的应用里，这些命令还会打印一条 stderr 警告。',
        },
        {
          type: 'prose',
          text: '`debug` 是一个具名导出，而非清单字段，因此旧版 CLI 会忽略它并加载清单的其余部分。',
        },
      ],
    },
    {
      id: 'turn-off-debug-in-an-app',
      title: '在应用中关闭 debug',
      content: [
        {
          type: 'prose',
          text: '应用可以拒绝所有集成的 `debug` 处理器，只保留自己的：在其 package.json 中设置 `inheritDebug`：',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"astryx": {"inheritDebug": false}}',
        },
        {
          type: 'prose',
          text: '此后你的处理器不再在该应用中运行。',
        },
      ],
    },
    {
      id: 'handle-gap-reports',
      title: '处理缺口报告',
      content: [
        {
          type: 'prose',
          text: '导出一个 `gapReport` 处理器，应用中的 `{@command gap-report}` 就会把每份缺口报告（例如缺失的组件或变体）发给它。处理器登记该报告并返回一张回执。',
        },
        {
          type: 'code',
          lang: 'js',
          code: `/** @type {import('@astryxdesign/cli/authoring').GapReportHandler} */
export const gapReport = {
  audience: 'public',
  async handle(report, {signal}) {
    if (report.target.package !== '@acme/astryx-widgets') return {status: 'skipped'};
    const body = JSON.stringify(report);
    const response = await fetch('https://tracker.example.com/issues', {method: 'POST', body, signal});
    const {url} = await response.json();
    return {status: 'filed', url};
  },
};`,
        },
        {
          type: 'prose',
          text: '应用中的每个处理器都会收到每一份报告，因此请检查 `report.target.package`，跳过与其他包相关的报告。',
        },
        {
          type: 'prose',
          text: '每个字段的定义见 {@link schema:gap-report-handler}。',
        },
        {
          type: 'prose',
          text: 'CLI 等待 30 秒，然后中止 `signal`。抛出异常、超时或回执无效都会导致你的投递失败，命令以退出码 1 结束；其他处理器仍会运行。与 `debug` 一样，`gapReport` 是旧版 CLI 会忽略的具名导出。',
        },
      ],
    },
    {
      id: 'ask-before-filing-in-public',
      title: '公开登记前先征得同意',
      content: [
        {
          type: 'prose',
          text: "当你的处理器会写入公众可读之处时，设置 `audience: 'public'`。只有调用方传入 `--confirm-public` 时 CLI 才会运行它；`'internal'` 处理器则始终运行。",
        },
        {
          type: 'code',
          lang: 'bash',
          code: "{@command gap-report AcmeCarousel --category missing_variant --reason 'Need a vertical layout'}",
        },
        {
          type: 'code',
          lang: 'text',
          code: `handlerType: integration
handler:     @acme/astryx-widgets
audience:    public
status:      consent_required
message:     Rerun with --confirm-public to file this report.`,
        },
        {
          type: 'prose',
          text: '带上 `--confirm-public` 后，同一次投递会显示 `status: filed` 并给出你的 `url`。报告发往 `--package` 指定的包；未指定时，发往拥有该组件的包；再否则发往 Core。',
        },
      ],
    },
    {
      id: 'fall-back-to-issues-url',
      title: '回退到 issuesUrl',
      content: [
        {
          type: 'prose',
          text: '若应用中没有 `gapReport` 处理器，CLI 会把报告路由到目标包清单里的 `issuesUrl`。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'GitHub issues URL（如 `https://github.com/acme/widgets/issues`）在调用方传入 `--confirm-public` 后，会通过 GitHub CLI（`gh`）登记一个 issue。',
            '其他任何 URL 都会以 `routed_only` 回执返回，由调用方自行打开。',
            '没有 `issuesUrl` 时命令会失败：`Package "@acme/astryx-widgets" provides neither a report handler nor an issues URL.`',
          ],
        },
        {
          type: 'prose',
          text: '只要应用中任何位置存在一个处理器——无论来自应用还是任何包——所有报告的回退即告关闭。列入清单却加载失败的包同样如此：CLI 无法判断它是否有处理器，因此该包的报告会直接失败，而不是转投其他跟踪器。见 {@link command:gap-report}。',
        },
      ],
    },
    {
      id: 'choose-a-destination',
      title: '让用户选择报告去向',
      content: [
        {
          type: 'prose',
          text: '当应用加载的包各自声明了 `issuesUrl` 时，报告可以发往默认目标（各处理器，或上述回退路径），也可以发往其中某个包。`{@command gap-report --list-categories}` 与不带 `--to` 登记报告时的回执都会列出全部去向，并附一行提示，让智能体（agent）去询问用户。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '智能体会询问用户报告发往何处，绝不会自行挑选某个包作为去向。',
            "`--to <package>` 传达用户的选择：报告只发往该包的 `issuesUrl`，同样遵循 `--confirm-public` 规则，且不会有任何处理器运行。",
            '用户未做选择时，省略 `--to`，报告发往默认目标。',
            '指向不存在去向的 `--to` 会在发送任何内容前失败，并列出所有可用去向。',
          ],
        },
      ],
    },
    {
      id: 'global-mode',
      title: '在全局模式下',
      content: [
        {
          type: 'prose',
          text: '在全局模式下：当用户为整台电脑安装你的包（与全局 CLI 并存）时，它的 `debug` 函数也会接收任何项目之外文件夹里的运行记录；在项目内，则仅当该项目安装了你的包时才会接收。见 {@link namespace:global} 与 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
