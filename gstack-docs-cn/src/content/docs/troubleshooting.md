---
title: "gstack 消息排查手册"
---


找到你看到的消息，然后按它的修法处理。gstack 运行的每项检查都以三种状态之一结束：

- **ran**：检查已执行。它仍可能发现了问题。
- **not run**：gstack 选择不运行它（你把它关掉了，或没有适用内容）。
- **unavailable**：gstack 尝试过但无法运行。这属于覆盖缺失，绝不算通过。

非 `ran` 的消息形如：

```
<check>: not run (<reason>). Fix: <command>
<check> unavailable: <reason> (<detail>). No review ran; this is missing coverage, not a pass. Fix: <command>
<check>: ran, verdict unverified (<reason>). Fix: read the output above
```

在本页搜索 `unavailable:` 或 `not run (` 之后的文字。每个小节都有稳定的链接锚点；原因码与锚点来自 `lib/gate-outcomes.ts`，若某个原因码在本页没有对应小节，一个免费测试就会失败。

<a id="gstack-doctor"></a>
### 技能运行前先检查就绪状态

运行 `~/.claude/skills/gstack/bin/gstack-doctor`（其他宿主：在你的 gstack checkout 中执行 `./setup --status` 会打印诊断器的绝对路径）。它会为安装、状态根目录（state root）、Bun、hooks、Codex、缓存的 Codex 模型检查、artifacts 同步、browse bundle、其余编译出的二进制、/cso 原生辅助程序、Claude Code、最大的会话日志以及最近的 /autoplan 守卫码各打印一行。每行都是 `ok`、`warn`、`not configured` 或 `fail` 并附修法；只有 `fail` 以非零码退出。它不发起任何付费调用：Codex 行报告的是缓存的模型检查及其时效，`--live` 才会真正运行一次该检查。把它的输出粘贴进 bug 报告。

---

## 模型策略

[model-policy 指南](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md)解释了两个层级、全部七项设置、优先级以及只读检查命令。解析出的选择并不能证明所请求的提供商或模型真的可以运行。

<a id="model-policy-config"></a>
### 模型策略配置无效或不可读

**含义**。新的策略路径读不出一份自洽的配置，或某个已配置的值无效。不可读的文件不会被当作未设置处理：那样做可能悄悄选中 premium 默认值。

**修法**。修复报错所指的文件或键。`plan_review_tier` 接受 `frontier`、`smart` 或 `host`；`implementation_tier` 接受 `frontier` 或 `smart`。用 `gstack-config unset <key>` 恢复默认值，而不是留下一个空值。被拒绝的 `set` 会保留旧值不变。修正属主/读取权限，而不是删掉一个无关的状态目录。对于 `plan_review_tier = smart` 这类格式错误的行，先编辑报错所指的文件，改正或删除该行：`unset` 只能移除规范的 `key:` 记录，修不了拼错的分隔符或带引号的键。

**预期结果**。`gstack-models list` 或对应的 `resolve` 命令会解释胜出的来源。此错误下没有运行任何外部模型调用。

<a id="model-policy-provider"></a>
### 自定义提供商需要显式模型或宿主模式

**含义**。原生设置或环境标志把评审者路由到了自定义端点或合作平台。公共 API 目录里的标识符在那里未必是有效的部署标识符。格式错误的原生提供商配置也会让 gstack 无法退回公共端点。

**修法**。为该请求提供一个兼容的模型，设置该提供商的 gstack 环境覆盖或层级模型（tier-model）设置，或选择 `gstack-config set plan_review_tier host`。凭据要放在该提供商的正常认证机制里，绝不要放进模型设置。如果报错指出某个原生配置格式错误，先修复那个来源。

**预期结果**。检查报告一个显式选择，或诚实地报告已交由宿主管理。它不认证账号权益，也不会把公共默认值发给一个推断出来的自定义端点。

<a id="model-policy-selection"></a>
### 选定的评审模型不可用

**含义**。所请求的模型被拒绝，或提供商无法完成评审。模型可能不存在、该账号无权使用、已退役，或端点配置有误；请保留提供商的证据，而不是把这几类情况并成同一个诊断。此时并不意味着有任何成功的外部评审，gstack 也不会换用别的模型。

**修法**。修改报错所指的来源。例如，环境覆盖优先于层级设置，所以改层级无法取代它。取消或修正该覆盖，或为该请求显式指定一个受支持的模型。若报告的失败属于认证、配额、沙箱或超时，按对应的既有修法处理。使用身份缺失时状态仍是未知，即使检查显示过一个请求用的 ID。

**预期结果**。下一次调用会播报它的模型与来源，检查同一选择并报告提供商的真实结果。缓存的探测或原生回退都不算完成的外部评审。

<a id="model-policy-freshness"></a>
### 模型目录新鲜度未知、过期或需要更新

**含义**。官方证据变了、某个必需来源无法检查，或留存的证据与当前目录和解析器不匹配。`unknown/source-unavailable` 不代表最新。之后一次来源失败不得抹掉更早的退役发现，也不得关闭其维护 issue。

**修法**。在新鲜度工作流报告与跟踪 issue 里查看失败的来源与证据细节。必要时修复来源解析器或发布访问，然后在默认分支上手动运行该工作流。若有模型被取代或弃用，按[维护者清单](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md#maintainer-update-checklist)认定替代品或记录一个受支持的缓解措施。不要仅仅因为新版本还没被采用就关闭 issue。

**预期结果**。完整的来源检查会产出与当前目录绑定的证据，而未解决的生命周期发现仍然可见。个人 pin 与无关 PR 不受影响。也检查一下工作流的最近运行日期：一个从不运行的定时任务无法报告自己的缺席。

#### 修复 `recoveryRequired` 状态

这个标志会刻意让 issue 保持开启，直到维护者修复记录。仅仅再抓取成功一次并不能证明已损坏的历史是可靠的。

1. 保存当前 issue 正文（包括其中留存的恢复归档），并下载最新的可信工作流报告。以它的 `report.state` 作为起始状态；不要编造运行 ID、目录哈希或检查日期。
2. 把它的 `lifecycle` 数组与 issue 中独立的 lifecycle 区块及任何留存归档对账。保留已知的退役、截止日期与人工处置。目录中仍存在的模型不得保留上一次替换留下的旧 `resolvedByCatalog` 标志。
3. 在 issue 编辑器里，在 `state:begin` 与 `state:end` 标记行之间恢复合法 JSON。把同一份 lifecycle 数组放回 `lifecycle:begin` 与 `lifecycle:end` 之间。恢复独立的 ownership 与 region 标记，托管区之外的人工文字保持原样。
4. 只有在对账之后才把 `recoveryRequired` 设为 `false`。若无法核实先前成功的证据，把 `lastSuccess` 设为 `null`，不要捏造新的成功。若生命周期历史无法恢复，保留该标志并让 issue 继续开启以待调查。
5. 在默认分支上运行 **Model-policy freshness**。只有完整、最新且没有未解决发现的证据才能关闭 issue。解析或来源错误会让它保持开启；不要靠抹掉历史制造一次通过。

## 外部评审（Codex 与 Claude Code）

外部评审把你的 diff、方案或问题发给第二家 AI 提供商。它们的结论来自 `lib/outside-review-result.ts`，该文件打印 `VERDICT: clean|findings|unverified|unavailable`。给它事件文件时，它还会打印 `OUTSIDE_USAGE:` 并带上 Codex 报告的 token 计数器；对方没有报告时打印 `OUTSIDE_USAGE: unknown`。带 P0 或 P1 发现的 `findings` 结论与原生 P0/P1 完全一样地阻断。`unverified` 与 `unavailable` 属于覆盖缺失：/ship 和 /review 继续进行，在就绪面板和 PR 正文中展示这个缺口，且绝不算通过。

<a id="outside-review-verdict"></a>
### 评审结论如何被读取

- **严重度标签**。`[P0]`-`[P3]`、Codex 原生的 `P1:` 标签，以及行首在可选的标题、列表符、编号或粗体之后的 P0-P3 标签：`**P1 — x**`、`**P1** — x`、`1. P2 — x`、`P2 —`、`### P1`，或表格单元格 `| P1 |`。P0 与 P1 阻断；P2 与 P3 仅供参考。处于标签位置但这些形式都读不出来的 P0-P3 记号（`## P1/P2 findings`）会让评审变成 [`unverified`](#outside-review-unparsed-severity)，绝不算 `clean`。代码围栏与行内代码是引用，不是标签。一个永不闭合的围栏，其文字仍会被排除在 `clean` 的证据之外，但在它的起始行之后，P0 或 P1 标签（或 Critical、High 字样）以及最后一行 `Verdict: not ready` 仍会阻断，读不出的标签仍会让评审变成 `unverified`。
- **标签位置的严重度单词**。`Severity: High`、`Priority: low`、以 `High:`、`High —`、`[High]` 或 `**High**` 开头的行（前面可有可选的标题、列表符或编号）、任意位置的粗体 `**High**`，或表格单元格 `| high |`。Critical 与 High 像 P0、P1 一样阻断；Medium 与 Low 像 P2、P3 一样仅供参考。正文里的单词不算数："high-level"、"low-risk"、"a medium-term follow-up" 和 "no critical findings" 都不是发现。
- **每一条评审门禁**。这些规则适用于所有汇总评审的门禁，包括 `/codex` consult 与 challenge 背后的 `execution` 门禁。最后一行 `Verdict:` 写着 `not ready` 的回复属于 `findings` 并以 3 退出——即使已经解析出可读的参考级严重度（P2 或 P3）；`FINDINGS:` 会给出其中最高的一个。无可读严重度的 not-ready 回复仍会打印 `FINDINGS: unspecified` 并以 3 退出。最后一行 `Verdict:` 若不是批准（`ready`、`LGTM`、`approve`、`ship it`、`pass`、`clean`、`good to go`，或恰好是 `NO_FINDINGS`），例如 `Can't verify`、`blocked`、`revise` 或空行；或一个声称有内容被排除、阻断、跳过、未运行、未执行或无法核实（或 "not yet"，或带 `?`，如 `Ready? No`）的批准——则属于 [`unverified`](#outside-review-unverified-verdict)，绝不算 `clean`。结论里的行内代码会像其他引文一样被抹掉，所以结论要写成纯文本：`Verdict: \`ready\`` 属于 unverified。只有以 `Verdict:` 开头的行（前面可有粗体、标题符或列表符）会被读取；裸 `Verdict` 标题之下、`>` 之后，或写成 `Overall verdict` 的结论不会被读取。
- **编号发现**。在带 `Verdict:` 行的回复里，行首的每一个编号项（`1. x`、`1. **Nonblocking — x**`）都是发现，除非回复的结论是它什么都没发现。当某一项没有可读的严重度时，`FINDINGS:` 打印 `unspecified` 而不是 `none`（此处与 `gstack-outside-voice run` 相同）；结论仍由上述规则决定。
- **没有发现**。既无标签也无标注的评审，只有在其结论明说时才算 `clean`：最后一句话（或其最后一个 ", and" 从句），或其 `Recommendation:` 行的 `because` 从句，以 `NO_FINDINGS`、"No issues found"、"I found no actionable regressions" 或 "I did not find any bugs" 开头，且不带 "but"、"however"、"except"、"other than" 或 "elsewhere"。当其他正文先行时，该陈述之后除谓语（"were found"、"is evident"）或冒号解释外的任何内容，都必须把范围限定到整个变更（"in this change"、"in the staged changes"）；"No issues in the parser." 不能作为评审的结论。出现在回复其他任何位置的 "no issues" 短语都不算数。否则该评审为 `unverified`（见下），绝不算 `clean`。完全没有严重度标签的 `/codex` consult 回答不是评审摘要，保持 `clean`。
- **设计提案**（/design-consultation 与 /office-hours 中的设计方向声音）用 `proposal` 门禁读取：一个完成的提案只需要它的 `Recommendation: ... because ...` 行。

外部评审的提示会请评审者为每个发现标注 Critical、High、Medium 或 Low，所以大多数评审落在 `findings` 或 `clean`。

<a id="sourced-helper-location"></a>
### `gstack: cannot load gstack-codex-probe` / `gstack: cannot locate <helper> (shell: ...)` / `CODEX_MODE: helper_unavailable`

**含义**。技能以命令方式运行 `gstack-codex-probe`，每项检查一个子命令，所以你的 agent 用哪个 shell 无关紧要。`cannot load gstack-codex-probe` 与 `CODEX_MODE: helper_unavailable` 表示你的安装里探测脚本缺失或不可执行。

`cannot locate <helper> (shell: ...)` 出自一个仍以 `source` 加载进你 shell 的辅助脚本（`gstack-egress-lib.sh`，以及升级前渲染的技能 source 进来的 Codex 探测脚本）。这类辅助脚本靠 bash（`BASH_SOURCE`）或 zsh（`%x`）找到自己的目录。在其他任何 shell（dash、sh）里，或当 shell 说不出自己正在读哪个文件时，它会停下来而不是去猜一个路径。消息里写明了它看到的 shell。

**修法**。对于 `cannot load`，在你的 gstack checkout 里重跑 `./setup`（或 `/gstack-upgrade`）。对于 `cannot locate`，用 bash 或 zsh 运行该技能（macOS 与 Linux 的默认 shell），或告诉辅助脚本 gstack 装在哪里：

```bash
export GSTACK_ROOT=~/.claude/skills/gstack   # 你的安装目录；里面应有 bin/
```

如果你看到 `gstack: sourcing gstack-codex-probe is deprecated ...`，说明升级前渲染的技能仍在 source 这个探测脚本。在 2026-10-21 当天或之后发布某个版本之前它会继续工作；现在就运行 `/gstack-upgrade` 重新渲染你的技能。

**预期结果**。在任何 shell 里，`~/.claude/skills/gstack/bin/gstack-codex-probe select-model exec` 都会打印 `CODEX_SEL: <model>`（并在 stderr 上打印 `CODEX_MODEL: <model> (exec; source: ...)`），预检打印的 `CODEX_MODE` 也不再是 `helper_unavailable`。`gstack-codex-probe help` 会列出所有子命令。

<a id="codex-sandbox-unavailable"></a>
### `Codex outside review unavailable: Codex's sandbox could not start here (...)`

**含义**。Codex 在 Linux 沙箱（bubblewrap）里运行每条命令。许多容器和 devcontainer 里内核不允许非特权用户命名空间，于是沙箱无法启动，Codex 尝试的每条命令都会失败。gstack 如实报告这一点，而不是相信一份什么都没读到的评审。`CODEX_MODE: sandbox_unavailable` 是免费预检在任何付费调用之前发现的同一情况。

**保留了什么**。没有发送任何东西去评审，或该评审已被丢弃。你的代码与文件未被改动。

**修法**。为该容器启用非特权用户命名空间（Docker 需要一条允许它们的 seccomp 配置），或在一个你信任的容器里，让 Codex 在这个 shell 中不带沙箱运行：

```bash
export GSTACK_CODEX_NO_SANDBOX=1
```

**预期结果**。启用命名空间后，下一次评审打印 `OUTSIDE_STATUS: completed`。设置 `GSTACK_CODEX_NO_SANDBOX=1` 时，每次评审都会打印 `WARNING: GSTACK_CODEX_NO_SANDBOX=1: ...`，因为此时 Codex 能读写你的用户可以读写的任何内容。只有精确值 `1` 有效，且只从你的 shell 环境读取。

<a id="outside-review-commands-failed"></a>
### `... outside review unavailable: the reviewer could not run commands or read the diff (...)`

**含义**。评审者尝试运行命令但一条都没成功，或它的回答说自己无法运行命令或读取 diff。在那之后写下的 "no issues found" 不是评审。

**保留了什么**。什么都没有；回答显示在上面，但不计入。

**修法**。阅读上面评审者的 stderr，修复它指出的问题，然后重跑。

**预期结果**。`OUTSIDE_STATUS: completed` 且带有一行 `VERDICT:`。

<a id="outside-review-execution-failed"></a>
### `... outside review unavailable: the reviewer process failed (exit N: ...)`

**含义**。提供商 CLI 以非零码退出。括号里是 stderr 的第一行。

**保留了什么**。部分输出显示在上面；不计入。

**修法**。按提供商诊断修复原因（重新登录、修正模型、检查网络），然后重跑。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-timeout"></a>
### `... outside review unavailable: the reviewer hit its time limit and was stopped (exit 124)`

**含义**。提供商未在期限内完成，被停止了。

**保留了什么**。部分输出显示在上面；不计入。

**修法**。缩小范围后重跑，或检查提供商状态与你的网络。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-empty-response"></a>
### `... outside review unavailable: the reviewer returned no response`

**含义**。提供商成功退出但没有返回任何内容。

**修法**。阅读上面的 stderr，然后重跑。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-refused"></a>
### `... outside review unavailable: the reviewer declined to review`

**含义**。提供商以拒绝代替评审作了回答。

**修法**。重跑；若再次拒绝，就依赖原生评审。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-truncated"></a>
### `... outside review unavailable: the reviewer hit its output token limit and the response is cut off (...)`

**含义**。api 运行器的提供商在输出 token 上限处停止（Anthropic `stop_reason: max_tokens`、OpenAI `finish_reason: length`），于是评审在句中截断，其发现可能丢失。

**修法**。用更大的 `--max-tokens` 重跑（`gstack-outside-voice run` 或 `gstack-autoplan run`），或缩短提示词。`gstack-autoplan run` 默认向两家提供商都发送 16384，而 OpenAI 会把推理 token 计入其中；`gstack-outside-voice run` 仅向 Anthropic 发送该默认值。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-missing-markers"></a>
### `... outside review unavailable: the response lacks the markers this gate requires (...)`

**含义**。回答中没有门禁要检查的内容：一行 `Recommendation: ... because ...`（或一个 `## Recommendation` 标题，其后第一个非空行是带 `because` 理由的普通句子）、一对 `SCORE:`/`AMBIGUITIES:`，或严重度标签。

**修法**。重跑评审。

**预期结果**。`OUTSIDE_STATUS: completed`。

<a id="outside-review-unverified"></a>
### `... outside review: ran, verdict unverified (...)` / `OUTSIDE_STATUS: unverified` / `GATE: UNVERIFIED`

**含义**。评审完成了，但既没有严重度标签或标注，也没有给出明确的"无发现"结论，所以从中读不出通过或失败（[结论如何被读取](#outside-review-verdict)）。

**保留了什么**。完整回答显示在上面。

**修法**。阅读上面的输出并自行判断。它不算通过，/ship 和 /review 会把它列为覆盖缺失。

<a id="outside-review-unparsed-severity"></a>
### `... outside review: ran, verdict unverified (the review labels a finding with a P0-P3 severity in a form the parser cannot read (line N: "..."))` / `REASON: unparsed_severity`

**含义**。回复在某行行首放了一个 P0-P3 记号——本应是发现标签的位置——但形式不是 gstack 能读出单一严重度的样子，例如 `## P1/P2 findings` 或 `- P2/P3 nits`。gstack 不会去猜适用哪个严重度，所以结论是 unverified 而不是 `clean`。括号里引用的行（也以 `UNPARSED:` 打印）是第一个这样的标签。当同一回复还带有可读的 P0 或 P1 发现时，该发现会阻断（`VERDICT: findings`、退出码 3），未解析的行仍会打印。

**保留了什么**。完整回复显示在上面。

**修法**。阅读引用的行与回复并自行判断；它不算通过。重跑评审，要求评审者把每个发现标注为 `[P1] <title>` 或 `P1: <title>`。要复查一份已保存或已修正的回复，在你的 gstack checkout 里运行：

```bash
bun lib/outside-review-result.ts --verdict execution reply.md
```

（那些门禁用 `review` 或 `structured`。）

**预期结果**。`VERDICT: findings` 或 `VERDICT: clean`，带一个 P0-P3 的 `FINDINGS:` 值，且没有 `UNPARSED:` 行。

<a id="outside-review-unverified-verdict"></a>
### `... outside review: ran, verdict unverified (the reviewer's own verdict does not say the change is ready (Verdict: ...))` / `REASON: unverified_verdict`

**含义**。回复最后一行 `Verdict:` 既不是批准也不是 `not ready`，例如 `Verdict: Can't verify (one changed file excluded ...)`；或者它批准了，但同时又说什么内容被排除、阻断、跳过、未运行或无法核实，或者提出了问题。评审者没有说评审已完成且变更已就绪，所以 gstack 不把它算作 `clean`。括号里是引用的结论。除各类批准外，只有精确的 `NO_FINDINGS` 记号才算 clean 结论。

`/codex` consult 或 challenge 的回答若其结论是选择一个选项（`Verdict: go with B`、`Verdict: Proceed with the plan`），则有意标为 `unverified`：consult 是建议，不是通过/失败的评审，因此没有可报告的"通过"。读回答本身即可；没有结论行的回答保持 `clean`。

**保留了什么**。完整回复显示在上面。

**修法**。阅读该结论与回复并自行判断；它不算通过。修复结论指出的问题（漏出评审的文件、无法运行的测试套件），然后重跑评审。要复查一份已保存的回复，在你的 gstack checkout 里运行 `bun lib/outside-review-result.ts --verdict execution reply.md`。

**预期结果**。`VERDICT: clean` 或 `VERDICT: findings`，且最后一行结论批准该变更或写着 `not ready`。

<a id="codex-model-unusable"></a>
### `CODEX_MODE: model_unusable` / `MODEL_UNUSABLE`

**含义**。Codex 拒绝了选定的模型：账号无权使用（HTTP 400）、模型已退役，或自定义提供商的 `base_url` 有误（HTTP 404）。`CODEX_MODEL:` 行会指明模型及其来源。

**修法**。选择你的账号可用的模型，或修正提供商：

```bash
export GSTACK_CODEX_MODEL=<supported-model>
# 或编辑 ${CODEX_HOME:-~/.codex}/config.toml 中的 model / base_url
```

**预期结果**。`CODEX_MODE: ready`。

<a id="codex-quota-exhausted"></a>
### `CODEX_MODE: quota_exhausted` / `MODEL_QUOTA_EXHAUSTED`

**含义**。Codex 拒绝了调用，因为其背后的账号到达了用量上限（`You've hit your usage limit` 或 `insufficient_quota`）。标记下面一行是 Codex 自己的消息，含重置时间与购买更多额度的入口。模型选择没有问题。gstack 把外部覆盖报告为 unavailable，绝不算通过，并将该结果缓存 15 分钟，因此本次运行的其余部分（以及其他技能）不会再调用 Codex。HINT 行写明还剩多少分钟。

**修法**。等待 Codex 消息中的重置时间，或为该账号充值、升级套餐。要换一个账号，重新登录：

```bash
codex login
```

要在 gstack 的 15 分钟缓存到期前复查（例如刚充值完），可以让单次检查跳过缓存结果，或直接删除它：

```bash
export GSTACK_CODEX_PROBE_RETRY=1   # 之后记得再取消该变量
# 或
rm -f ~/.gstack/.codex-model-probe  # <state root>/.codex-model-probe
```

**预期结果**。重置之后（或 `codex login` 之后——它会改变认证签名并立即重新探测），`CODEX_MODE: ready`。

<a id="codex-rate-limited"></a>
### `CODEX_MODE: unverified (rate_limited)` / `MODEL_PROBE_RATE_LIMITED` / `unavailable: Codex rate-limited the review`

**含义**。Codex 返回了 HTTP 429（请求过多），通常几秒内自行恢复。它与 `quota_exhausted` 是不同状态，且从不缓存。探测时出现 429，评审仍会运行，由其自身结果决定；评审过程中出现 429 则该次评审失败，属于覆盖缺失，绝不算通过。

**修法**。一分钟后重跑评审。若 429 持续出现，到提供商控制台检查该账号或 API key 的速率限制。

**预期结果**。`CODEX_MODE: ready`，评审完成。

<a id="codex-mode-unverified"></a>
### `CODEX_MODE: unverified` / `MODEL_PROBE_INCONCLUSIVE`

**含义**。简短的模型检查超时或遇到网络错误，gstack 未能确认模型可用。评审仍会运行，并检查其自身结果。

**修法**。此刻无需处理。若评审随后失败，其消息会说明原因。

<a id="codex-auth-failed"></a>
### `CODEX_MODE: not_authed` / `AUTH_FAILED`

**含义**。没有找到 Codex 凭据：没有 `CODEX_API_KEY`、没有 `OPENAI_API_KEY`、没有 `auth.json`，也没有 `config.toml` 里自定义提供商的 `env_key` 所指的已设置环境变量。

**修法。**

```bash
codex login
```

或导出你的提供商 `env_key` 所指的变量。

**预期结果**。`CODEX_MODE: ready`。

<a id="outside-review-disabled"></a>
### `Codex review skipped (codex_reviews disabled)` / `CODEX_MODE: disabled`

**含义**。你关闭了外部评审。这是 `not run`，绝不算通过，也不是故障。

**修法**。要重新开启：

```bash
gstack-config set codex_reviews enabled
```

<a id="outside-review-consent-missing"></a>
### `outside review: not run (outside reviews are turned off ... ). Fix: gstack-config set codex_reviews enabled ...` / `OUTSIDE_STATUS: not_run reason=consent_missing`

**含义**。发送环节本身拒绝了。`gstack-codex-probe run-with-timeout`、`gstack-claude-code`、`gstack-outside-voice` 与无人值守的 `gstack-autoplan` 运行器，在把仓库内容发给外部模型之前都会读取 `codex_reviews`。当它是 `disabled`，或配置文件存在但读不出来（或值不是 `enabled`/`disabled`）时，它们打印这一行，不启动任何 CLI，也不发起任何 API 请求。未设置 `codex_reviews` 表示默认值 `enabled`，此时一台机器上的第一次发送会打印下面的[通知](#codex-review-notice)。你按名字主动要求的评审（`/codex`、`/claude-code`）会传入 `--user-invoked`，照常运行。这是 `not run`，绝不算通过，也不是故障；`/autoplan` 把它记录为该阶段的外部结果（`status: disabled`、`outcome: not_run`、`reason: consent_missing`）。

**修法**。要重新允许外部评审：

```bash
gstack-config set codex_reviews enabled
gstack-config get --stored codex_reviews   # enabled、disabled、unset 或 unreadable（退出码 2）
```

若 stored 读取以 2 退出，修复它所指 `config.yaml` 中的权限问题或格式错误的 `codex_reviews` 行，然后重跑。

<a id="codex-review-notice"></a>
### `NOTICE: gstack outside reviews send the review prompt and code to Codex (...) using ...`

**含义**。外部评审默认开启。一台机器上的第一次评审会说明哪家提供商接收你的提示词与代码、哪个登录或 key 为其付费。它只显示一次（gstack 会在其状态目录记录 `.codex-review-notice-shown`），且从不阻断评审。

**修法**。如果这正是你想要的，无需处理。要停止把代码发给 Codex：

```bash
gstack-config set codex_reviews disabled
```

**预期结果**。之后的评审打印 `Codex review skipped (codex_reviews disabled)` 或 `CODEX_MODE: disabled`，/ship 和 /review 显示外部评审未运行。

---

## /ship、/review 与 /document-release

<a id="ship-no-version-source"></a>
### `Shipped without a version change: no version source is configured (no VERSION file, no .gstack/version-path). ...`

**含义**。/ship 没有找到自己可掌管的版本文件：没有 `VERSION`、没有 `.gstack/version-path`，或版本由发布自动化掌管（release-please、Changesets、semantic-release、workspace monorepo、占位的 package.json 版本）。对版本号提升而言这是 `not run`。

**保留了什么**。其余一切照常发布。没有版本提升、没有 CHANGELOG 版本标题、没有 `vX.Y.Z` 的 PR 标题前缀。

**修法**。要让 /ship 管理版本发布，创建 `VERSION`，或固定该文件：

```bash
echo package.json > .gstack/version-path && git add .gstack/version-path
```

**预期结果**。下一次 /ship 会提升该文件的版本并写入 CHANGELOG 标题。

<a id="ship-version-source-broken"></a>
### `gstack-version-bump: classify: version source is broken: <path> ...`

**含义**。固定的版本文件不存在、为空、不可读，或不含可解析的版本号。/ship 会停下，而不是编造 `0.0.0.0`。

**保留了什么**。什么都没写入。

**修法**。修复该文件，或改正 `--version-path` / `.gstack/version-path`。

**预期结果**。`gstack-version-bump classify` 打印当前版本。

<a id="review-base-stale"></a>
### `BASE_REFRESH: stale <rev>` / `Base coverage: stale at <rev>`

**含义**。/review 无法抓取 base 分支（离线、无凭据，或 `.git` 只读——例如 Codex 的沙箱），于是它对照你本地的 `origin/<base>`（在 `<rev>` 处）做了评审。

**修法**。在沙箱外运行 `git fetch origin <base>`；若 base 已前进，再重跑 /review。

<a id="review-content-changed"></a>
### `review_freshness: STALE content changed during review: the tree moved from <start> to <end> while <skill> ran ...` / **Review records missing or mismatched**

**含义**。工作树在该趟的 `gstack-review-log --start` 与它记录的那一行之间发生了变化：评审者还在读的时候，一次编辑、提交或合并落了进来。评审者可能没有看到那次变化，所以该行的 `review_binding.state` 是 `changed`。评审记录用 `gstack-wtree --review` 做指纹，它会跳过不含任何已跟踪文件的未跟踪根点目录（绝不会是 `.github/` 或 `.gstack/`），所以仅一个测试车道的草稿目录不会移动树。Step 11.5 无法绑定它，会插入 `9 → 10 → 11 → 11.5`。再次记录同样的结果也无法修复。

**修法**。从一趟开始，直到其中每个评审者都已返回且其行已记录，保持 checkout 冻结（不编辑、不提交、不合并、不推送）。若趟中变化是你自己对这趟发现的修复，则记录该趟时带 `"converged":false`，并把修复记为 `"action":"fixed"`。随后 `gstack-review-plan` 会挑选复检：当每个修复都低于阻断门槛时，做一次只读所涉 hunk 的修复检查，而 11.5 会接受该修复检查记录作为 Step 9 的记录。在同一个冻结的树上重跑 Step 11 的原生趟。

**预期结果**。`gstack-review-read` 显示两条记录位于同一棵树上，`review_freshness` 为 `CURRENT`，Step 11.5 继续进入 Step 12。

<a id="ship-preflight-run-open"></a>
### `STOP: /ship run <id> is open on this checkout and past its preflight (<marker>; open until its finish or for 120 minutes) ...`

**含义**。在一个已有一趟 /ship 通过 Steps 1-3 且尚未结束的 checkout 上，又运行了完整的 `gstack-ship-preflight`（Steps 1-3）。完整预检会把 base 合并进工作树，而那一趟的评审读者会 diff 这棵树，所以这次合并会作废它们的通过（gbrain-evals#317）。/ship 会传入 `--run <id>`（Step 1：前言中的 `SESSION_ID`；`ship/DRIVER.md` Phase 2：运行目录的名字）。Steps 1-3 一旦成功，预检会在 checkout 的 git 目录里记录该运行（`gstack-ship-run`），并在 checkout 自己的租约上打开它（`<git dir>/gstack-leases`，因此 driver 不需要工作流租约）。只要标记存在，该运行就算打开——`gstack-ship-release finish` 会在 Steps 15-16 通过时移除它；同时 `bin/gstack-lease open` 也这么判定：未满 120 分钟且其持有者（运行预检的宿主）存活。已结束、超时或已死的运行绝不阻断，而 /ship 自己的第一次预检（或 Step 3 STOP 之后的重跑）绝不会被拒。与打开运行的持有者不同的 `--run` 会替换它：那是前一趟未到 finish 就停止后的一次新 /ship。持有者是预检之上的第一个非 shell 进程：Claude Code 会话，或在 Capy 上机器唯一的 `capy-server`，所以在那里只有相同 id 或缺失 `--run` 才会被拒。相同 id、无 `--run`，或由另一个活进程（另一个会话）持有的打开运行，都会 STOP。

**保留了什么**。什么都没运行：没有 fetch、没有合并，树未被触碰。

**修法**。用 `gstack-ship-preflight --tests-only` 重跑 Step 5（它绝不合并），或让那趟 /ship 走完。若那趟运行已不在运行（在 finish 之前停了），删掉 STOP 指名的标记（`rm <marker>`），然后重跑。

**预期结果**。预检继续到 `STATUS:` 与 `MERGE:`。

<a id="ship-preflight-run-unrecorded"></a>
### `STOP: cannot record /ship run <id> on this checkout's lease (...)`

**含义**。给了 `--run`，但 `gstack-lease touch` 无法在 checkout 的租约上打开该运行，例如一个活进程正持有它的锁。若不记录，之后的完整预检就无法被拒绝，所以预检在 fetch 之前停下，而不是在无保护状态下继续。

**保留了什么**。什么都没运行：没有 fetch、没有合并。

**修法**。按括号里 `gstack-lease` 行所说的做（等待持有 `<git dir>/gstack-leases/.lock` 的进程），然后重跑。

<a id="review-fingerprint-tmpdir"></a>
### `gstack-wtree: cannot create a temp index under <dir>; set TMPDIR to a writable directory` / `gstack-review-log: cannot create a private object directory under <dir>; no working-tree fingerprint. Set TMPDIR to a writable directory.`

**含义**。/review 在一个私有的临时对象目录里为工作树做指纹（Codex 的沙箱把 `.git` 设为只读）。临时目录无法创建，所以这次评审没有指纹，后续步骤无法复用其证据。

**修法**。`export TMPDIR=<一个可写目录>`，然后再次运行 /review。

<a id="review-fingerprint-stage"></a>
### `gstack-wtree: cannot stage the working tree: <git error>`

**含义**。指纹的对象写不进去。独立运行的 `gstack-wtree` 会写进仓库的对象存储。

**修法**。通过 /review 运行它（`gstack-review-log` 会提供私有对象目录），或把 `.git/objects` 设为可写。

<a id="plan-audit-not-run"></a>
### `Plan completion audit: not run (no plan is bound to this branch and no docs/designs/ file matches). Fix: ...`

**含义**。/ship 与 /review 会按照绑定到 PR 分支的方案（plan mode、/autoplan，或 PR 正文里的一行 `Plan: <path>`）来审计 PR。既没有绑定的方案、也没有匹配的 `docs/designs/` 文件时，它们不再挑最新的无关方案；该审计为 `not run`。

**修法**。把 `Plan: docs/designs/<file>.md` 加进 PR 正文，或运行 /autoplan。

**预期结果**。下一次 /ship 或 /review 会打印针对该方案的审计。

<a id="plan-eng-review-not-persisted"></a>
### `PERSISTED: no` / `PERSIST: gstack-review-log '{...}'` / `no saved Eng Review: run the PERSIST: line ...`

**含义**。/plan-eng-review 运行在了调用方禁止写入的地方（例如一个委派的 agent 让评审者保持只读，于是它无法编辑自己评判的方案）。评审已完成：它以 `DONE` 加 `PERSISTED: no` 结束，记录遥测 `success`，并在回复中返回完整报告与决策台账。什么都没有保存，所以 /ship 的就绪面板没有 Eng Review 记录，并以 "no saved Eng Review" 报告 NOT CLEARED。真正的失败（一次被允许的保存失败、证据过期）仍会以 `BLOCKED` 结束。

**保留了什么**。回复里带着完整报告；它的最后一行是填好本次评审取值的 review-log 命令。

**修法**。在被评审的仓库里，去掉 `PERSIST: ` 前缀后运行回复的最后一行：

```bash
~/.claude/skills/gstack/bin/gstack-review-log '{"skill":"plan-eng-review",...}'
```

或在一个允许它写报告与日志的地方重跑 /plan-eng-review。

**预期结果**。`gstack-review-read` 列出 `plan-eng-review` 条目，/ship 的面板显示 Eng Review 行（状态为 `clean` 时即 CLEAR）。

<a id="learnings-bun-missing"></a>
### `gstack-learnings-search: bun not found on PATH, so learnings could not be read. Fix: ...`

**含义**。learnings 搜索（以及 `gstack-timeline-read`，即"时间线"）需要 Bun。它以 127 退出，而不是装作"没有 learnings"。

**修法**。从 https://bun.sh 安装 Bun，然后 `cd <gstack checkout> && ./setup`。

**预期结果**。技能重新打印你先前的 learnings。

<a id="learnings-unavailable"></a>
### `LEARNINGS: unavailable (<first stderr line>)`

**含义**。某个技能的 learnings 查询失败了（常见原因是缺 Bun）。技能以前在这里什么都不显示，看起来像"没有 learnings"。

**保留了什么**。你的 learnings 文件未被触碰；技能在没有它们的情况下继续。

**修法**。阅读括号里的原因。如果它说的是 Bun，安装后重跑 `./setup`。

<a id="log-tmpdir-unwritable"></a>
### `gstack-learnings-log: could not create a temp file in <dir>, so the learning was not recorded. Fix: ...`

**含义**。learnings、question 与 preference 日志通过 `${TMPDIR:-/tmp}` 里的临时文件写入。一个阻止它的沙箱以前会默默丢弃该条目。

**修法**。`export TMPDIR=<一个可写目录>` 后重新记录。

<a id="plan-tune-not-calibrated"></a>
### `CALIBRATION: not calibrated: no recorded signals`

**含义**。你记录的回答没有匹配到任何心理特征信号，/plan-tune 没有可校准的依据。它不再显示 "calibrated"。

**修法**。回答更多已注册的问题，然后运行 `gstack-developer-profile --derive`。

<a id="artifact-case-collision"></a>
### `ARTIFACTS_SYNC: attention: case-collision held=<N> names=<names>. Artifact paths differ only by letter case, ...`

**含义**。artifacts 仓库里存在仅大小写不同的路径，例如 `projects/MyApp/` 与 `projects/myapp/`。Mac 或 Windows 磁盘会把它们存成同一个文件，于是那边的 git 会以另一种拼写暂存写入，同步会报告成功，而一种拼写保持已修改状态，其他机器读到的是过期数据（#3220）。现在同步会扣住（hold）此类路径下所有排队的文件而不是暂存：文件留在队列里，其余一切继续同步，状态是 `collision` 而不是 `ok`。当只有一种拼写被跟踪时，该拼写继续同步，只有新别名被扣住；当两种都尚未被跟踪时，两者都等待。`<names>` 是冲突的文件夹或文件名；`gstack-brain-sync --status` 会在 `message` 里列出被扣住的路径。一个会把新别名推到远端的本地提交（两台机器同时创建了两种拼写）会被拒绝，状态为 `error`，并保留在本地。

不会自动修复任何东西。slug 解析与技能启动不受影响；只有同步在扣文件。

**修法**。在一台机器上，手工保留一种拼写：

1. 选择要保留的拼写：`gstack-slug` 今天在该项目里打印的那种。如果该项目会解析出不同拼写（远端 URL 有两种写法，或同一文件夹既以 `~/code/MyApp` 又以 `~/code/myapp` 访问），先让它稳定：修正远端 URL 的大小写，或设置 `GSTACK_PROJECT_SLUG`。
2. 把另一种拼写下已跟踪的文件并入保留的那种。两种拼写都要从 git 读，因为 Mac 的工作树只会显示其中一种；工作文件也要读，因为它们保存着被扣住、未同步的写入。下面的循环覆盖被放弃拼写的已跟踪文件与其未跟踪文件（从未同步的被扣写入）。它会折叠 JSONL 日志（拼接并去掉重复行），其余每个文件都打印出来由你决定：

   ```bash
   cd ~/.gstack
   keep=projects/MyApp; drop=projects/myapp
   { git -c core.ignorecase=false ls-files -- "$drop"; git -c core.ignorecase=false ls-files --others -- "$drop"; } | sort -u | while IFS= read -r f; do
     rel=${f#"$drop"/}
     case "$rel" in *.jsonl) ;; *) echo "decide by hand: $f"; continue ;; esac
     { git show ":$keep/$rel"; git show ":$f"; cat "$keep/$rel" "$f"; } 2>/dev/null | awk '!seen[$0]++' > "$HOME/.gstack-fold.tmp"
     mkdir -p "$keep/$(dirname "$rel")" && mv "$HOME/.gstack-fold.tmp" "$keep/$rel"
     git -c core.ignorecase=false add -f -- "$keep/$rel"
     git -c core.ignorecase=false rm -q --cached --ignore-unmatch -- "$f"
     echo "folded: $keep/$rel"
   done
   ```

   对它打印的每个文件（Markdown、`decisions.active.json` 之类的 JSON 快照），比较 `git show ":$keep/<file>"` 与 `git show ":$drop/<file>"`，把要保留的内容写入 `"$keep/<file>"`，然后执行同样的 `git -c core.ignorecase=false add -f -- "$keep/<file>"` 与 `git -c core.ignorecase=false rm -q --cached --ignore-unmatch -- "$drop/<file>"`。绝不拼接 JSON 快照。然后提交并推送：

   ```bash
   git -c core.ignorecase=false commit -m "repair: fold $drop into $keep"
   git push origin HEAD
   ```

   在 Linux 上两个文件夹在磁盘上是分开的：提交后，检查 `git -c core.ignorecase=false ls-files --others -- "$drop"` 列出的都是你已折叠或已移动的内容，然后删除被放弃的文件夹（`rm -r "$drop"`）。在 Mac 或 Windows 上它们是同一个文件夹，什么都不要删。
3. 清除被放弃拼写的扣留记录并把保留的文件排队：对 `--status` 列出的每个被扣路径执行 `gstack-brain-sync --skip-file <dropped path>`，然后对每行 `folded:` 与你手工移动的每个文件执行 `gstack-brain-enqueue <kept path>`，最后执行 `gstack-brain-sync --once`。
4. 在其余每台机器上，让下一次技能启动拉取这次修复（或运行 `git -C ~/.gstack pull`）。当不再有仅大小写不同的已跟踪路径时，这一行就会消失。

<a id="skill-start-former-bucket"></a>
### `gstack: earlier data for this project is in projects/<slug> (a worktree's old bucket). Merge it: ...`

**含义**。linked worktree 现在共享主 checkout 的项目身份。一个 worktree 曾在其自己的旧桶下写下的 learnings 与 checkpoint 仍然存在。

**修法**。合并它们（日志会去重、冲突会列出、不覆盖任何东西）：

```bash
gstack-slug --adopt-legacy --from <slug>
```

或停止提醒：`gstack-slug --adopt-legacy --dismiss <slug>`。

---

## 设计技能

<a id="design-not-available"></a>
### `DESIGN_NOT_AVAILABLE: <path> --version exited <code>` (or `timed out after 10s`, `is not installed`, `no timeout/gtimeout/perl ...`)

**含义**。设计技能现在会在宣称 `DESIGN_READY` 之前，以 10 秒期限运行 `"$D" --version`。退出码 137 表示 macOS 在启动时杀掉了该二进制（代码签名有问题）；setup 会把同一情况打印为 `design unavailable: <bin> is killed at launch (exit 137) after re-signing`。

**保留了什么**。没有生成任何东西，也没有任何花费。

**修法**。重跑 setup，它会重建并重新签名该二进制：

```bash
cd <gstack checkout> && ./setup
```

若消息指出缺少 timeout 工具，安装 coreutils（`gtimeout`）或 perl。

**预期结果**。下一个设计技能打印 `DESIGN_READY`。

<a id="design-image-model-invalid"></a>
### `GSTACK_DESIGN_IMAGE_MODEL="<value>" is not a gpt-image model name ...` (or `... is not a Gemini model name, and the design provider is gemini`)

**含义**。设计二进制在发出任何请求之前，就拒绝了与所选提供商不匹配的模型覆盖。在 OpenAI 上，图像工具的模型必须是 `gpt-image-*` 名称；在 Gemini 上，`GSTACK_DESIGN_IMAGE_MODEL` 与 `GSTACK_DESIGN_MODEL` 必须是 `gemini-*` 名称。Gemini 对某个模型返回 404 也指向这里。

**修法**。`unset GSTACK_DESIGN_IMAGE_MODEL GSTACK_DESIGN_MODEL` 以使用默认值，或设置为所选提供商和你的 key 都可用的模型。

<a id="design-no-image-key"></a>
### `No image API key found (OpenAI or Gemini).`

**含义**。`$D` 既没找到 OpenAI key（`~/.gstack/openai.json`、`OPENAI_API_KEY`），也没找到 Gemini key（`~/.gstack/gemini.json`、`GEMINI_API_KEY`）。设计技能会回退到 HTML 线框图。

**保留了什么**。没有发送任何东西，也没有任何花费。

**修法**。到 https://aistudio.google.com/apikey 领一个免费的 Gemini key，然后 `export GEMINI_API_KEY=<key>` 或 `printf %s "$KEY" | $D setup --provider gemini --key-stdin`。

**预期结果**。下一个设计命令打印 `Using Gemini key from ...`。

<a id="design-provider-invalid"></a>
### `GSTACK_DESIGN_PROVIDER="<value>" is not a design provider (expected openai or gemini).`

**修法**。`export GSTACK_DESIGN_PROVIDER=gemini`（或 `openai`），或 `unset GSTACK_DESIGN_PROVIDER` 让 `$D` 自己挑（设置了 OpenAI key 就用 OpenAI，否则用 Gemini）。

<a id="design-provider-no-key"></a>
### `GSTACK_DESIGN_PROVIDER=<provider> but no <Provider> key was found`

**含义**。你显式选择了一个提供商而它没有 key，于是 `$D` 在任何请求之前停下，而不是悄悄改用另一个。

**修法**。设置该提供商的 key（`GEMINI_API_KEY` 或 `OPENAI_API_KEY`），运行 `$D setup --provider <provider>`，或取消设置 `GSTACK_DESIGN_PROVIDER`。

<a id="design-gemini-key-rejected"></a>
### `Gemini API error (400|403, model <model>, key from <source>): ...`

**含义**。Google 拒绝了该 key（`API_KEY_INVALID`），或该 key 的 Google Cloud 项目未开启 Generative Language API。消息只指出 key 的来源，绝不会显示 key 本身。

**修法**。到 https://aistudio.google.com/apikey 创建一个 key 并运行 `$D setup --provider gemini`，或为该 key 的项目启用 Generative Language API。想改用 OpenAI：`export GSTACK_DESIGN_PROVIDER=openai`。

<a id="design-gemini-quota"></a>
### `Gemini API error (429 ...): ... no image quota left today`

**含义**。该 key 在此模型上的每日配额已用尽，或该 key 处于免费档、没有图像模型的配额。`$D` 不会重试这种情况；短暂的 429 会按 Google 建议的延迟后重试。

**修法**。在 Google AI Studio 为该 key 启用计费，等待每日重置，或 `export GSTACK_DESIGN_PROVIDER=openai`。

<a id="design-taste-profile-unavailable"></a>
### `TASTE_PROFILE_UNAVAILABLE: could not resolve the project slug (gstack-slug failed). Fix: run ./setup.`

**含义**。/design-consultation 与 /design-shotgun 会加载你的品味档案。这条消息说明档案找不到，而不是装作你没有档案。

**修法**。`cd <gstack checkout> && ./setup`。

<a id="design-variant-save-failed"></a>
### `cannot save paid image to <path>: <code> (<cause>). Image bytes were received; saved a recovery copy to <tmp path>. Fix: ...`

**含义**。付费图像生成成功了，但把它写入输出路径失败（磁盘、权限，或到 `-999` 为止的每个名字都已被占用）。gstack 绝不会为同一张图付两次费，也绝不覆盖已有图像。

**保留了什么**。图像还在，位于打印出来的临时目录恢复路径。

**修法**。按打印出的修法处理（腾出磁盘空间、把文件夹设为可写，或换一个新的 `--output`），然后把恢复文件复制到你想要的位置。

---

## Codex 与其他环境变量宿主

<a id="gstack-no-install-found"></a>
### `gstack: no install found (tried <path>). Fix: ./setup --host <host> from your gstack checkout; ./setup --status shows it.`

**含义**。在 Codex、Factory、OpenCode、Cursor、Copilot 与 Kiro 上，每个 bash 块都会自己找 gstack：先是一个导出的 `GSTACK_ROOT`（含 `bin/` 与 `lib/`），然后是仓库内安装，最后是宿主的全局安装（Codex 上是 `$CODEX_HOME/skills/gstack`）。一个都不存在。为单个文件夹安装的技能（Hermes，或 `./setup` 写入的 Codex 安装）是其第一个块的例外：该块运行文件夹自己的 `bin/gstack-skill-start` 并忽略导出的 `GSTACK_ROOT`。当该文件夹缺失时，块会打印这一行，其启动命令随后失败。

**修法。**

```bash
cd <gstack checkout> && ./setup --host codex   # 或你的宿主
./setup --status
```

**预期结果**。`./setup --status` 列出该安装，并说明 router 是真实文件、其小节链接都能解析。

<a id="setup-status-router-symlink"></a>
### `router is a symlink, which Codex skips` / `section links: N of M broken (first: ...)`

**含义**。`./setup --status` 会检查每个已登记的安装。Codex 会忽略符号链接的 SKILL.md，而一条断掉的小节链接意味着被切分的技能无法加载下一步。

**修法**。`cd <source> && ./setup --host <host>`（命令已打印）。

<a id="setup-skill-copy-saved"></a>
### `saved your edited <path> to <backup> (setup rewrites gstack's SKILL.md copies on every run)`

**含义**。已安装的 router 与嵌套 SKILL.md 文件现在是真实副本，每次 setup 都会重写。你的手工编辑已先被保存。

**保留了什么**。你的编辑，在 `<backup>`。请把定制内容移进你自己的技能。

<a id="setup-skill-copy-backup-failed"></a>
### `error: could not back up an edited SKILL.md copy under <root>; the previous runtime root is unchanged`

**修法**。修复 `<state root>/backups` 的权限，然后 `./setup --host <host>`。

<a id="upgrade-not-a-checkout"></a>
### `ERROR: <dir> is not a gstack checkout; nothing was changed. Re-run Step 2.` / `INSTALL_DIR is not set: re-run Step 2 ...`

**含义**。/gstack-upgrade 现在会在任何 git 命令之前检查自己是否在 gstack 自己的 checkout 里。某个块在没有 Step 2 打印的路径下运行了，于是它停下，而没有碰你的项目。

**修法**。重新运行 Step 2，并在该块前加上 `INSTALL_DIR=<打印的路径>`。在 Windows（Git Bash）上，即使 `INSTALL_DIR` 设置正确，旧版 /gstack-upgrade 文本会比较同一路径的两种写法并仍然拒绝；用 `cd <install dir> && git pull --ff-only --autostash && ./setup` 恢复（见 [hook 误报](#setup-hook-does-not-parse)）。

<a id="skill-over-size-limit"></a>
### `<host>/<skill>/SKILL.md is <bytes> bytes, over the 160,000-byte limit. Fix: carve sections with usesLazySections() for this skill.`

**含义**。给贡献者：宿主最多读取单个 SKILL.md 的 160,000 字节。`bun run gen:skill-docs` 在仓库里会失败，在 `--install-root` 下会告警。

---

## 安装与自动更新

<a id="bun-too-old"></a>
### `gstack needs Bun 1.3.3 or newer (1.4.2 recommended); found <version> at <path>. Nothing was installed or changed.`

**含义**。低于 1.3.3 的 Bun 会静默忽略那些阻止 gstack 编译工具读取项目 `.env` 的构建标志，所以 setup 在写入任何东西之前就拒绝了它。同一条目链接还出现在两条不会中止 setup 的警告上：`warning: gstack is tested on Bun 1.4.2 (CI pin); found <version>`（1.3.3 到 1.4.2 之间可用但未经测试）与 `warning: could not read the Bun version (...)`（setup 已继续；请检查 `bun --version`）。

**修法。**

```bash
bun upgrade
./setup
```

**预期结果**。`bun --version` 打印 1.4.2 或更新版本，setup 完成且没有 Bun 警告。

<a id="auto-update-bun-too-old"></a>
### `gstack auto-update: update held (bun-too-old: found Bun <version> at <path>; gstack <version> needs <floor> or newer); nothing was installed or changed. Fix now: ...`

**含义**。团队模式的自动更新抓取了一个发布，其 setup 需要比 setup 将要运行的 Bun 更新的版本。它把你的 checkout 与已安装技能留在当前版本，并在每次会话启动时打印这一行。（更早的自动更新器在运行第一次更新时做不了这项检查。）

**修法**。`bun upgrade`；下一次会话启动会继续完成更新。想现在就更新：`bun upgrade && cd <gstack checkout> && git pull --ff-only && ./setup`。

<a id="bun-version-unreadable"></a>
### `bun-version-unreadable: could not read the version of Bun at <path> (bun --version printed '<output>'); gstack <version> needs <floor> or newer (BUN_VERSION_UNREADABLE)`

**含义**。在移动 checkout 之前，自动更新器与 `/gstack-upgrade` 会把 setup 将运行的 Bun 与即将到来发布的安全下限作比较。`bun --version` 打印了不是版本号的内容（已展示，控制字符已移除），于是比较无法进行，更新被扣住：什么都没安装也没改动。`/gstack-upgrade` 会在 `BUN_VERSION_UNREADABLE:` 之后打印同样的文本。更早的版本会把读不出的版本（以及 zsh 下的一切版本）当作"不低于下限"而继续（#3195）。

**修法**。重装 Bun；`bun upgrade` 在损坏的安装上可能无法运行。在 Git Bash 或 macOS/Linux 终端里：

```bash
curl -fsSL https://bun.sh/install | bash
bun --version
```

**预期结果**。`bun --version` 打印一个类似 `1.4.2` 的版本，下一次会话启动（或 `/gstack-upgrade`）完成更新。

**修复于**。v1.91.101.0 之后的第一个发布（#3195）。

<a id="auto-update-incomplete"></a>
### `gstack auto-update: setup did not finish (<reason>); installed skills may be out of date. gstack retries automatically. Fix now: cd <dir> && ./setup`

**含义**。pull 成功了，但 setup（或迁移）失败。gstack 不再显示 "just upgraded"。它会在 1 小时后、再 6 小时、再 24 小时重试，并在每次会话启动时打印这一行。原因若是 `(bun not found on PATH)` 则表示要先安装 Bun。

**保留了什么**。先前的安装保持生效。

**修法**。运行打印出的命令。

<a id="auto-update-pull-failed"></a>
### `gstack auto-update: git pull did not finish (exit N: ...); gstack is not updating. Fix now: ...`

**修法**。`cd <gstack checkout> && git pull --ff-only && ./setup`。

<a id="setup-hook-does-not-parse"></a>
### `gstack setup: refusing to register hooks that do not parse (Claude Code would block tool calls with them): <file>:<line>: <error>`

**Windows（Git Bash），1.91.31 起：误报**。如果每个 TypeScript hook 都以 `bun could not bundle the TypeScript entry` 失败（question-log、question-preference、auq-error-fallback 与 timeline-stop hook、`/autoplan` 的 publication hook 以及 `/plan-ceo-review` 的 mode-handoff hook），你的 hook 本身没有问题。Git Bash 把路径以 `C:/…` 交给 Bun，而检查器按 `/c/…` 查找（#3088、#3100）；main 分支上的检查器两种写法都读。同样的 Git Bash 路径写法曾让 `/gstack-upgrade` 以 `ERROR: <dir> is not a gstack checkout; nothing was changed.` 停下。一次恢复可同时解决两者：手动更新，然后从更新后的代码运行 setup。

```bash
cd ~/.claude/skills/gstack && git pull --ff-only --autostash && ./setup
```

若你的安装目录不是 `~/.claude/skills/gstack`，请换成你的安装目录（`./setup --status` 会打印它）。预期结果：setup 以退出码 0 结束且没有拒绝行，之后的自动更新照常进行。

**其余环境的含义**。Claude Code 通过 `/bin/sh` 运行 gstack 的 hook shim，而解析不过的 hook 会以 2 退出，并在每个会话里阻断它所守护的工具调用。setup 会对它注册的每个 hook、以及技能 frontmatter 运行的每个 hook（`/autoplan`、`/careful`、`/freeze`、`/guard`、`/investigate` 与 `/plan-ceo-review`）做解析检查：shim、它 source 的 gstack shell 辅助脚本（如 `careful/bin/hook-extract.sh` 与 `bin/gstack-state-root.sh`），以及它运行的 TypeScript 及其本地导入。上述任何文件里的一行合并冲突标记都会以 `unresolved merge conflict marker` 失败——即使文件本身仍能解析（heredoc、字符串或模板字面量里的标记不算）。TypeScript 从 gstack checkout 打包，因此绝不会读取你运行它时所在项目的 `tsconfig.json` 或 `bunfig.toml`。它会注册能解析的 hook，跳过列出的那些，完成其余安装，并以非零码退出。Claude Code 直接从 `~/.claude/skills/gstack` 运行 hook，所以被跳过的 hook——无论更早的 setup 注册的、还是某个技能运行的——都会继续运行那个坏文件，直到它被修复。这是 gstack 的 bug，或是你 checkout 里一次只应用了一半的编辑或合并：请上报打印出的 `<file>:<line>`。

**修法。**

```bash
git -C ~/.claude/skills/gstack status   # 是否有只应用了一半的编辑或合并冲突？
git -C ~/.claude/skills/gstack checkout -- <file>   # 或完成合并
cd ~/.claude/skills/gstack && ./setup
```

**预期结果**。setup 以退出码 0 结束且没有拒绝行。

<a id="auto-update-hook-does-not-parse"></a>
### `gstack auto-update: update held (hook-does-not-parse: <file>:<line>: <error>); nothing was installed or changed, and your current hooks keep running. ...`

**Windows（Git Bash），1.91.31 起：误报**。若扣住原因是 `<hook>.ts:1: bun could not bundle the TypeScript entry`，发布本身没有问题：你已安装的检查器误读了 Git Bash 的 `C:/…` 路径（#3088、#3100），而自动更新器用这个检查器检查每个发布，所以在你手动更新一次之前，它会扣住每个发布。恢复方法（同时清除 `/gstack-upgrade` 的 `is not a gstack checkout` 拒绝）：

```bash
cd ~/.claude/skills/gstack && git pull --ff-only --autostash && ./setup
```

若你的安装目录不是 `~/.claude/skills/gstack`，请换成你的安装目录。预期结果：setup 以退出码 0 结束，下一次会话启动不再打印扣住行，之后的更新自行安装。

**其余环境的含义**。团队模式的自动更新抓到了一个带无法解析的 hook、或仍留有合并冲突标记的发布（与 setup 运行的同一项检查）。它在移动你的 checkout 之前就检查了即将到来的版本，所以你的 checkout、已安装技能与已注册 hook 都留在当前版本。由即将到来发布自己的 `bin/gstack-hook-check` 做决定，因此你安装里的检查器 bug 扣不住后续发布；你已安装的检查器只在对方崩溃、无输出或打印一份它无法核实的报告时才做决定。gstack 会在下一次更新检查时重查，并安装第一个 hook 可解析的发布。这是 gstack 的 bug：请上报打印出的 `<file>:<line>`。

**修法**。等待下一个发布。手动 `git pull` 后接 `./setup` 无法在 pull 之前检查；setup 随后会拒绝那个坏 hook（见上面的条目）。

<a id="auto-update-hook-check-unavailable"></a>
### `gstack auto-update: update held (hook-check-unavailable: <reason>); nothing was installed or changed, and your current hooks keep running. ... Fix now (in a terminal; Git Bash on Windows): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...`

**含义**。即将到来发布的 hook 检查器与你已安装的检查器，都没有对即将到来的 hook 给出经核实的报告（崩溃、无输出、报告不可读，或没有 Bun 来打包 TypeScript hook），或者无法为检查提取即将到来的版本（`cannot extract the incoming revision: <git's error>`），于是自动更新器无法判断移动你的 checkout 会不会破坏 Claude Code 的工具调用。它把你的 checkout、技能与 hook 留在当前版本。`<reason>` 说明了各检查器的情况。

**修法**。运行打印出的命令。`bin/gstack-ff-update` 会在不丢失本地编辑的情况下移动 checkout（见[被搁置的编辑](#auto-update-rescued-edits)），setup 会检查它注册的每个 hook 并指出问题（例如缺 Bun）。

在 Windows 上，若原因是 `git archive of the incoming revision failed`，你的更新器早于 #3184 的修复：见[被扣安装的恢复](#auto-update-held-install-recovery)。

<a id="auto-update-held-install-recovery"></a>
### `HELD hook-check-unavailable: git archive of the incoming revision failed` / `gstack auto-update: update held (hook-check-unavailable: git archive of the incoming revision failed) ...` / `gstack auto-update: setup did not finish (bun not found on PATH) ...`（Windows）

**含义**。从 1.91.89.0 到修复 #3184 的发布，自动更新器在检查 hook 之前用 `git archive | tar` 提取每个即将到来的发布。Git for Windows 的 MSYS `tar` 无法创建 `connect-chrome` 符号链接，因为它在归档里排在其目标之前，于是每个发布都被扣住（`~/.gstack/analytics/session-update.log` 里有 `HELD` 行），而过期的 `setup did not finish (bun not found on PATH)` 行可能把扣住状态掩盖。你已安装的更新器无法交付它自己的修复，而旧的 `/gstack-upgrade` 在本地编辑冲突时可能留下冲突标记。恢复方法是把新版本里的新 `bin/gstack-ff-update` 抓取到一个私有临时目录并运行它。它对干净安装、带冲突本地编辑的安装、已有未合并文件的安装以及前缀模式安装都有效：可再生的 `SKILL.md` 与 `sections/*.md` 编辑会由 setup 重新渲染，其余所有编辑都保存在一个 rescue ref 里（命令会打印它；见[被搁置的编辑](#auto-update-rescued-edits)）。

**修法，在 Git Bash 中**（若你的安装目录不是 `~/.claude/skills/gstack`，换成你的安装目录）：

<!-- form:recovery-gitbash -->
```bash
cd ~/.claude/skills/gstack && git fetch origin main && d=$(mktemp -d) && git show FETCH_HEAD:bin/gstack-ff-update > "$d/gstack-ff-update" && bash "$d/gstack-ff-update" . FETCH_HEAD; s=$?; rm -rf "$d"; [ "$s" = 0 ] && ./setup
```

**修法，在 Windows PowerShell 5.1 中**（它通过 Git 的 `bash.exe` 运行同一段脚本，然后运行 `.\setup.ps1`）：

<!-- form:recovery-powershell -->
```powershell
Set-Location -LiteralPath "$HOME\.claude\skills\gstack" -ErrorAction Stop; $gb = Join-Path (git --exec-path) '..\..\..\bin\bash.exe'; & $gb -c 'set -f; IFS=; git fetch origin main && d=$(mktemp -d) && git show FETCH_HEAD:bin/gstack-ff-update > $d/gstack-ff-update && bash $d/gstack-ff-update . FETCH_HEAD; s=$?; rm -rf -- $d; exit $s'; if ($LASTEXITCODE -eq 0) { .\setup.ps1 }
```

**在 Claude Code 中**，请它运行上面的 Git Bash 版本。

**预期结果**。脚本打印 `ok <old> <new>` 或 `rescued <old> <new> refs/gstack/rescue/<oid> unmerged=<0|1>`，setup 以退出码 0 结束，下一次会话启动不再打印扣住行，之后的更新自行安装。

**试用未发布的修复与回退**。修复分支可以在发布前试用；检出游离版本期间自动更新会暂停。把 `<branch>` 换成 issue 中指名的分支。

<!-- form:trial-gitbash -->
```bash
cd ~/.claude/skills/gstack && git checkout -- 'SKILL.md' '*/SKILL.md' '*/sections/*.md' && git fetch origin <branch> && git checkout --detach FETCH_HEAD && ./setup
```

<!-- form:trial-powershell -->
```powershell
Set-Location -LiteralPath "$HOME\.claude\skills\gstack" -ErrorAction Stop; $gb = Join-Path (git --exec-path) '..\..\..\bin\bash.exe'; & $gb -c 'set -f; git checkout -- SKILL.md */SKILL.md */sections/*.md && git fetch origin <branch> && git checkout --detach FETCH_HEAD'; if ($LASTEXITCODE -eq 0) { .\setup.ps1 }
```

要回到已发布版本（同时恢复自动更新）：

<!-- form:goback-gitbash -->
```bash
cd ~/.claude/skills/gstack && git checkout -- 'SKILL.md' '*/SKILL.md' '*/sections/*.md' && git checkout main && ./setup
```

<!-- form:goback-powershell -->
```powershell
Set-Location -LiteralPath "$HOME\.claude\skills\gstack" -ErrorAction Stop; $gb = Join-Path (git --exec-path) '..\..\..\bin\bash.exe'; & $gb -c 'set -f; git checkout -- SKILL.md */SKILL.md */sections/*.md && git checkout main'; if ($LASTEXITCODE -eq 0) { .\setup.ps1 }
```

<a id="auto-update-unmerged-files"></a>
### `gstack auto-update: update held (unmerged-files: <n> unmerged file(s) in the install (first: <path>)); an earlier merge, rebase or stash pop left conflicts in the install, and an update would bury them. Fix now (...): cd '<dir>' && git fetch origin && bash bin/gstack-ff-update . '@{upstream}' && ./setup ...`

**含义**。你的 gstack checkout 里有未合并文件：来自你自己的合并、rebase 或 `git stash pop` 的冲突标记，或来自早于此修复的自动更新器（它的 `merge --autostash` 在本地编辑冲突时把标记留在原地）。后台更新器绝不移动带未合并文件的 checkout，且在它们存在期间不打印任何 "setup did not finish" 修法，因为 setup 会碾过这些标记运行。

**修法**。运行打印出的命令。它会先把所有东西——包括未合并文件——保存进一个标记为 "needs manual resolution" 的 rescue ref，再把 checkout 移到该发布并运行 setup。用[被搁置的编辑](#auto-update-rescued-edits)下的命令读取该 rescue。想自己解决冲突，则完成或中止你的合并（`git -C '<dir>' merge --abort`、`git -C '<dir>' checkout -- <file>`）；gstack 会在下一次检查时重试。

<a id="auto-update-tracked-by-project"></a>
### `gstack auto-update: update held (tracked-by-project: ...)` / `(version-reverted: ...)` / `gstack-upgrade: tracked-by-project: ... (UPGRADE_REFUSED)` / `gstack-upgrade: version-reverted: ... (UPGRADE_REFUSED)`

**含义**。你的 gstack 安装位于另一个 git 项目内部，而那个项目把 gstack 的文件当作普通文件提交了。每次你在该项目切换分支或检出文件时，git 都会把它的旧副本放回去，于是 VERSION 等文件落后于安装自己的 HEAD，而更新看起来仍然成功（#1022）。`version-reverted` 是从安装一侧看到的同一症状：它的 VERSION 与 HEAD 不一致。在修复之前，`gstack-upgrade`、`/gstack-upgrade` 与自动更新器都不会移动该安装。以 git submodule 方式持有 gstack 的项目没有问题。没有外层项目的 `version-reverted` 表示 VERSION 被手工编辑过；只需执行下面 `stash push` 那一步。

**修法**。用 `bash <install>/bin/gstack-ff-update --preflight <install>` 打印确切命令。它们做三件事：在项目里取消跟踪该安装（`git rm -r --cached`）、把它加进项目的 `.gitignore`，并在你检出的每个分支上提交这两项（或者改为以 submodule 方式内嵌 gstack）。然后 `git -C <install> stash push` 恢复安装自己的文件，并把你做过的任何编辑留在 stash 里，下一次更新即可继续。

<a id="auto-update-autostash-unrecoverable"></a>
### `gstack auto-update: update held (autostash-unrecoverable: <reason>); your local edits are where they were and nothing was installed. Look first: git -C '<dir>' status --short. Fix now (...)` / `autostash-unrecoverable: <reason>`

**含义**。`bin/gstack-ff-update` 拒绝移动 checkout，什么都没改。`<reason>` 说明了原因：一个未跟踪文件占了发布要放已跟踪文件的位置（`git refused to update ...: would be overwritten`）、更新运行期间有文件变化、另一条 git 命令持有索引锁（`index.lock exists`），或该名字的 rescue ref 已经指向另一个提交。

**修法**。运行该行打印的 `status` 命令，把列出的未跟踪文件挪开（或等另一条 git 命令结束），然后运行打印的 `Fix now` 命令。不需要恢复任何东西：你的编辑仍在工作树里。

<a id="auto-update-rescued-edits"></a>
### `gstack auto-update: your local edits in the install (<files>) conflicted with an update, so they were saved in refs/gstack/rescue/<oid> and the install runs the update. ...` / `rescued <old> <new> refs/gstack/rescue/<oid> unmerged=<0|1>`

**含义**。你曾编辑过 gstack checkout 里的已跟踪文件，而发布改了同样的行（或你曾暂存过更改、或有未合并文件）。为了不在 Claude Code 运行 hook 的 checkout 里留下冲突标记，`bin/gstack-ff-update` 把你的编辑保存为一个提交 `refs/gstack/rescue/<oid>`，并把 checkout 移到该发布。该 rescue 的第一父提交是你先前所在的版本，因此它只包含你的更改；第二父提交保存你曾暂存的内容。未冲突的编辑留在原地，可再生的 `SKILL.md` 与 `sections/*.md` 编辑（技能前缀、gbrain 块）由 setup 重新渲染而不是被 rescue。会话启动那行每天重复一次，直到你删除该 ref。

**修法**。先检查：

```bash
git -C ~/.claude/skills/gstack show --stat 'refs/gstack/rescue/<oid>'
```

要保留你的编辑，只导出你的更改，并在一个临时 checkout 里应用（绝不要在安装里用 `stash apply`）：

```bash
git -C ~/.claude/skills/gstack diff 'refs/gstack/rescue/<oid>^' 'refs/gstack/rescue/<oid>' > ~/gstack-local-edits.patch
git clone https://github.com/garrytan/gstack.git ~/gstack-scratch && cd ~/gstack-scratch && git apply -3 ~/gstack-local-edits.patch
```

标记为 "needs manual resolution" 的 rescue 保存着本就未合并的文件：其内容可能含有需要解决的冲突标记。处理完后删除该 ref（这也会停止每日那行）：

```bash
git -C ~/.claude/skills/gstack update-ref -d 'refs/gstack/rescue/<oid>'
```

<a id="setup-runtime-root-contains-checkout"></a>
### `gstack setup: refusing to replace <root> for <host>: this runtime directory contains the source checkout setup runs from (<checkout>), so replacing it would delete the checkout. Nothing was changed.`

**含义**。setup 安装 Codex、Factory、OpenCode、Cursor、Copilot、Antigravity 与 Gemini CLI 的方式是构建一个运行时根目录（如 `~/.cursor/skills/gstack`）再换掉旧的；Kiro 则是写入 `~/.kiro/skills/gstack`。你的 gstack checkout 就位于那个根目录或其内部，所以替换会删掉 checkout（#3084），而 Kiro 会把 checkout 链接进它自己。setup 在写入任何东西之前拒绝。`./setup --status` 与 `gstack-doctor` 会为该宿主建议移动方案，而不是 `./setup --host <host>`。

**修法**。把 checkout 移出去，然后从新位置运行 setup。setup 会打印确切的命令。当 `~/.claude/skills/gstack` 是指向 checkout 的符号链接时，checkout 直接取代符号链接的位置：

```bash
rm ~/.claude/skills/gstack && mv ~/.cursor/skills/gstack ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --host claude && ./setup --host cursor
```

否则把它移到宿主 skills 目录之外的任何位置：

```bash
mv ~/.cursor/skills/gstack ~/gstack && cd ~/gstack && ./setup --host cursor
```

**预期结果**。两次 setup 都以退出码 0 结束，`./setup --status` 把每个宿主列为 `current`。

<a id="host-renders-pruned"></a>
### `pruned <dir> (<host> is not installed from this checkout): ...` / `kept <path>: not proven generated (...)` / `host-render backup: <dir> (...)`

**含义**。一个 gstack checkout 只为从它安装的 agent 保留技能，记录在 checkout 的 `.gstack-installed-hosts` 里（#1694）。更早的安装会渲染每个 agent 的副本，于是全局的 Claude 安装带着 632 个 `SKILL.md` 文件（34.7 MB），而 Claude Code 与 Cursor-agent 会扫描它们。setup 移除了不是从本 checkout 安装的 agent 的副本。生成文件被移进它打印的备份目录；指向 checkout 的链接被移除；无法证明由 gstack 生成的文件（`kept ...`）留在原地。备份里的 `prune.log` 列出每个路径。升级迁移也会运行一次同样的修剪。记录在案的 agent 绝不会被修剪。

**修法**。如果你不用那个 agent，无需处理。要找回一个 agent，从本 checkout 安装它——这会记录它并渲染其技能：

```bash
./setup --host <name>
```

对手工渲染的仅指令 agent（Hermes、OpenClaw、GBrain），先把它的名字加进 `.gstack-installed-hosts`，再运行 `bun run gen:skill-docs --host <name>`。要恢复单个文件，从备份 `mv` 回来即可。`kept` 文件是你自己的：不再需要时就移动或删除它。备份位于 gstack 的状态根目录，没有 agent 会扫描；确定不再需要后删掉它（1.91.65 之前的 Claude 安装约 36 MB）。

**预期结果**。下一次 `./setup` 不再打印 `pruned` 行，`./setup --status` 列出你使用的 agent。

<a id="cso-windows-msvc-compile"></a>
### `CSO unavailable: its native helper was not built (windows-msvc-compile)`

**含义**。找到了 Visual Studio 的编译器，但 /cso 的原生辅助程序没有编译通过。setup 会打印第一个编译器错误。它以前只说 "install Visual Studio"。

**修法**。修复打印出的编译器错误，然后重跑 `./setup`。

<a id="cso-build-or-publish-failed"></a>
### `CSO unavailable: the native helper's <stage> step failed (...)` / `CSO publish step failed (...) for <revision>; previous CSO kept: <revision>`

**含义**。/cso 的原生辅助程序是可选的。其构建前提已经具备，但 `build` 步骤（编译辅助程序）或 `publish` 步骤（在锁保护下把新辅助程序换入 `bin/`）失败了。setup 过去会在这里停止（#3071）；现在它会完成其余一切并说明哪一步失败。当此前已安装过辅助程序、且失败的 publish 恢复了它时，setup 打印 `previous CSO kept`，/cso 继续使用那个辅助程序；否则 /cso 报告 `not assessed`。`interrupted` 表示该步骤在记录结果之前被杀。结果保存在 `bin/.gstack-cso-build-result`，`gstack-doctor` 的 `cso` 行读取同一份记录。构建输出在 `bin/.gstack-cso-build.log`。

**修法**。读日志，修复它报告的问题，然后从你的 gstack checkout 重试：

```bash
bun run build:cso && ./setup
```

在 Windows 上，若安装了 PowerShell 7（`pwsh`），setup 与构建会使用它，否则回退到 Windows PowerShell 5.1。#3071 中 publish 期间暂存文件消失的根本原因仍未知；若再遇到，请把日志附到该 issue。CI 会设置 `GSTACK_STRICT_BUILD=1`，让这些失败变为致命，使构建回归无法藏匿。

**预期结果**。setup 不再打印 CSO 行，诊断器的 `cso` 行为 `ok`。

<a id="cso-windows-docker"></a>
### `Docker found at <path>, but native Windows Docker transport is not supported yet; static assessment only.` / `docker.exe at <path> is outside the trusted install locations (...)`

**含义**。在 Windows 上，/cso 只在 Windows 为 Program Files、Program Files (x86) 与 Windows 目录报告的安装文件夹下、按真实路径查找 `docker.exe`，路径上不得有符号链接或 junction。用户可写的目录不受信任，因为 Docker 子进程携带着 registry 凭据；该拒绝不可覆盖。

即使是受信任的 `docker.exe`，目前也无法运行 /cso 的隔离容器：/cso 只接受本地 Unix Docker socket，而 Windows 上的 Docker Desktop 走命名管道。/cso 会如实报告并只运行静态评估；不运行任何容器或运行时检查。

**修法**。要做运行时检查，从 Linux 或 macOS（WSL2 算 Linux）带本地 Docker socket 运行 /cso。在 Windows 上，静态评估是受支持的模式；若拒绝指向某个用户目录，请把 Docker Desktop 装到 Program Files 下。

<a id="cso-capacity"></a>
### `Snapshot manifest cap exceeded: ...` / `64 MiB source cap exceeded: ...` / `Symlink or special source file: <path>`

**含义**。/cso 在任何审计开始前把仓库复制进一个私有快照，当快照会不完整或过大时拒绝整个运行。每条消息都指明所适用的上限：

- **快照清单上限**（16 MiB）。每个已跟踪或未被忽略的未跟踪文件一条目；大约容纳 50,000 个文件。
- **64 MiB 源上限**。此类文件在依赖与 VCS 目录之外的总大小都计入，包括内容不对审计公开的超过 1 MiB 的文件。
- **符号链接**。仓库里任何位置的一个已跟踪符号链接都会中止运行。

**修法**。没有设置能提高这些上限。对 64 MiB 源上限，用 `--paths` 指定逗号分隔的、仓库相对的你想要审计的目录后重跑（例如 `--paths src/core,src/mcp`）。这些目录之外的路径绝不会被捕获或评估，也不计入上限；此时快照与历史覆盖显示 **partial**，报告会统计每个跳过的路径，运行的快照清单也会逐一列出，因此结论会说明哪些内容未被审计。使用 `--diff` 时，依赖目录之外的每个变更路径都必须位于 `--paths` 内，否则运行被拒绝。不要审计手工裁剪的副本：/cso 会把它当作整个仓库，什么都不会报告为跳过。`--paths` 不会降低清单上限或 100,000 条目上限，因为每个跳过的路径仍有一条清单条目（大约容纳 50,000 个文件）。符号链接必须移除。请把你的文件数或大小补充到 [#2993](https://github.com/garrytan/gstack/issues/2993)。

<a id="cso-scanner-invalid-output"></a>
### `INVALID_OUTPUT: Scanner report is malformed, unsupported, or exceeds structural limits.`（真实仓库上的 Semgrep）

**含义**。在 v1.91.101.0 之后的第一个发布之前，/cso 对扫描器的 JSON 报告做脱敏时，会把一个不带引号的 `<REDACTED-...>` 标记拼接到任何看起来像电话号码或卡号的裸数字上，例如 Semgrep 的 `"max_memory_bytes":1145427776` 或一个 epoch 时间戳。报告随后解析失败，扫描器被记为未评估（#3185）。现在被脱敏的数字会变成带引号的字符串 `"<REDACTED-...>"`，报告可以解析。会跨越 JSON 记号的脱敏仍会扣住载荷（`REDACTION_FAILED`）。

**修法**。更新 gstack（`/gstack-upgrade`），然后再次运行 /cso。若该代码仍出现，是扫描器自己发出了非法 JSON；请到 https://github.com/garrytan/gstack/issues 上报扫描器与版本。

**修复于**。v1.91.101.0 之后的第一个发布（#3185）。

<a id="cso-orbstack-argv0"></a>
### `unsupported argv0 "docker-tools"`（/cso 之下的 OrbStack `docker`）

**含义**。/cso 运行解析符号链接之后的 `docker` 规范路径，而 OrbStack 的 `docker` 是指向一个多合一二进制 `docker-tools` 的符号链接，该二进制按启动时的名字决定自己是什么。以真实名字启动时它拒绝了，于是 Docker 隔离与每个扫描器都被报告为缺失（#3187）。/cso 现在以 `docker` 这个名字启动同一个已验证的二进制，清理看门狗里也一样。

**修法**。更新 gstack（`/gstack-upgrade`），然后运行 `gstack-doctor`；OrbStack 运行时其 `cso` 行应通过。

**修复于**。v1.91.101.0 之后的第一个发布（#3187）。

<a id="conductor-auq-hook-removed"></a>
### `removed the AskUserQuestion preference hook: it breaks Conductor's native AskUserQuestion (#2207). ...`

**含义**。在 Conductor 中，setup 不再安装 plan-tune 的 question-preference hook，并会移除它先前添加过的那个。其余 plan-tune hook 保留。

**修法**。仍想保留的话：`gstack-config set plan_tune_hooks yes`，然后 `./setup`。

<a id="browse-extension-id-invalid"></a>
### `Error: browse_extension_id '<v>' is not a Chrome extension ID ... Existing value left unchanged.`

**修法**。从 `chrome://extensions` 复制 32 字母 ID（字母 a 到 p），然后 `gstack-config set browse_extension_id <id>`。

---

## 安装检查（`gstack-doctor --check`）与 Capy 安装器

`gstack-doctor --check` 为每个组件打印一行 `PASS | FAIL | SKIP <id>`，并以 `gstack: ok <revision> for=<workflow>`（退出码 0）或 `gstack: fail <id,id>`（退出码 1）结束。每个 FAIL 行都带一个 `fix:` 子句和下面的某个代码。直接读结尾行；绝不要把 `--check` 接到 `tail` 或其他会以自身退出状态顶替诊断器的命令后面（docs/capy-install.md）。

<a id="doctor-component-missing"></a>
### `FAIL <id> — <detail>; fix: <command> (COMPONENT_MISSING; ...)`

**含义**。所选工作流需要的组件（`--for <skill>`、`--require <csv>`，默认为从本 checkout 安装的每个宿主配置）未安装、未构建、不是最新或未认证。该行会指名：`claude` 或 `codex`（宿主配置缺失或过期）、`patch`（Codex 渲染缺少模型行为补丁）、`codex-cli`（需要 Codex CLI 但缺失或未登录）、`browse-bundle`、`browser`（Chromium 无法启动或渲染）、`cso`（需要原生辅助程序但未构建）。

**修法**。运行该行 `fix:` 子句里的命令。对 `browser`，即 `<checkout>/bin/gstack-browser-ensure`——当安装器跳过安装时，它会在首次使用时安装 Chromium（`SKIP browser (lazy; ...)`）。

**预期结果**。该行变为 `PASS`，结尾行是 `gstack: ok`。

<a id="doctor-runtime-below-minimum"></a>
### `FAIL runtime — bun <version> ... (RUNTIME_BELOW_MINIMUM; ...)`

**含义**。`PATH` 上的 Bun 缺失、低于 gstack 的安全下限（1.3.3：更老的 Bun 忽略 no-autoload 编译标志，见[bun-too-old](#bun-too-old)），或低于受支持的最低版本（1.4.2，即 CI pin 与 `engines.bun`）。面板（不带 `--check` 的 `gstack-doctor`）对未经测试的版本仅告警；`--check` 会判失败，因为在未经测试的运行时上跑门禁，正是这项检查要防的事故。默认 Capy 云镜像自带 1.3.14，所以新的 Capy 机器在安装器升级 Bun 之前都会在这里失败。

**修法**。`bin/gstack-capy-install` 会先经 setup 的校验和验证配方升级 Bun，再运行 `./setup`。手动做法：下载 `https://bun.sh/install`，对照 `bin/gstack-bun-version.sh` 里的 `GSTACK_BUN_INSTALL_SHA` 校验其 SHA-256，然后 `BUN_VERSION=1.4.2 bash <file>` 并重跑 `./setup`。

<a id="doctor-project-pin-mismatch"></a>
### `FAIL pins — bun <version> outside engines.bun >=1.4.2 (package.json:<line>; ...) (PROJECT_PIN_MISMATCH; ...)`

**含义**。目标项目（`--project <path>`，默认当前目录的 git toplevel，绝不是 gstack checkout）固定（pin）了某个 Bun 或 Node 版本，而正在运行的不满足。pin 来自 `package.json`（`packageManager`、`engines`）、`.tool-versions`、`.nvmrc`、`.bun-version`，以及 `.github/workflows/*.yml` 里的 `bun-version:` / `node-version:` 行。范围（`>=1.4.2`）与精确 pin 会区分开，且 CI pin 保留其平台车道：Windows 任务的 pin 绝不会让 Linux 运行失败。面板告警；`--check` 判失败。Bun 缺失时该行为 `SKIP pins (no bun to evaluate the project pins)`，绝不静默。

**修法**。为该平台安装被 pin 的版本（该行会列出每条约束及其来源），或修改项目的 pin。在 Capy 上，该行的修法就是确切的引导命令 `bash <skill>/scripts/install.sh`（同一命令去掉 `--check`）：pin 指向已验证版本时它会安装该 Bun 并以 `gstack: ok` 结束，否则以 `RUNTIME_PIN_CONFLICT` 停下并指名要放宽的 pin。

<a id="doctor-revision-unmet"></a>
### `FAIL revision — installed <version> (requested <ref>) (REVISION_UNMET; ...)`

**含义**。`--revision <ref>` 要求诊断器认证一个具体的 gstack 版本（VERSION 字符串、tag、分支或提交），而 checkout 在另一个版本上。未满足的版本绝不是 `ok`。

**修法**。移动 checkout：`<checkout>/bin/gstack-upgrade`（默认分支顶端；`/gstack-upgrade` 交互式），或 `git -C <checkout> fetch origin && git -C <checkout> checkout <ref> && ./setup`。`bin/gstack-capy-install --revision <ref>` 绝不移动已存在的 checkout；它会报告 `gstack: ok <installed> (requested <ref>; run <checkout>/bin/gstack-upgrade to move)`。

<a id="capy-install-runtime-conflict"></a>
### `gstack-capy-install: Bun conflict: gstack needs >=<minimum>, <project> pins <constraint> (RUNTIME_PIN_CONFLICT; ...)`

**含义**。安装器只安装一个已验证的 Bun 归档：gstack 的受支持最低版，或项目高于最低版的精确 pin（当该 pin 列在消息的 `verified archives:` 里时）。这里两者谈不拢（例如项目 pin 了 `bun@1.3.14`，或 pin 了 gstack 没有已验证归档的版本），所以安装器什么都没改，在 `./setup` 之前停下。

**修法**。在项目里 pin 一个已验证版本，把 gstack 升级到验证该版本的发布，或把 gstack 装在一台其 Bun 为项目所接受的机器上。`--project <path>` 指定 pin 生效的项目。

<a id="browser-ensure-failed"></a>
### `gstack-browser-ensure: NEEDS_SETUP ... (BROWSER_UNAVAILABLE; ...)`

**含义**。一台未装 Chromium 的机器（`SKIP browser (lazy; gstack-browser-ensure installs on first use)`）上第一次运行浏览器技能时，它尝试在 setup 的锁下通过 `bun x playwright install chromium` 安装，但失败了；或 Chromium 已安装但无法启动。

**修法**。阅读上面的安装器输出：离线或走代理的机器需要到 Playwright CDN 的网络访问；Ubuntu 24.04+ 上 AppArmor 用户命名空间错误需要 `GSTACK_CHROMIUM_NO_SANDBOX=1`；然后重跑 `<checkout>/bin/gstack-browser-ensure`。安装器的 `--with-browser` 为想现在就装好的机器提前完成安装。

<a id="capy-install-preflight-failed"></a>
### `gstack-capy-install: preflight: <tool> not found (INSTALL_PREFLIGHT_FAILED; ...)`

**含义**。安装器在 `./setup` 之前检查 `git`、`curl`、`node` 与 `jq`，并在 Bun 缺失或低于受支持最低版时安装它。这里缺了其中之一，或 Bun 安装脚本的校验和与 `GSTACK_BUN_INSTALL_SHA` 不符（下载被丢弃，什么都没运行）。

**修法**。安装指名的工具（`apt-get install -y jq`、从 nodejs.org 或 nvm 安装 Node），然后重跑 `bin/gstack-capy-install`。校验和不符表示上游安装器变了：只有在审阅过新脚本之后才更新 `GSTACK_BUN_INSTALL_SHA`。

<a id="capy-install-launch-file-unwritable"></a>
### `gstack: fail launch-file — could not write the launch file <path>; fix: ... (LAUNCH_FILE_UNWRITABLE)`

**含义**。诊断器通过了，但 `bin/gstack-capy-install` 写不了启动文件（`GSTACK_LAUNCH_FILE`，即安装结论旁那份可 source 的 mode-0600 的 `GSTACK_LAUNCH` 赋值副本）。该文件是 ok 结论的一部分：没有它，调用方就只剩那一行字和曾在 GSTA-96 泄漏过环境的重打字路径，所以运行改为失败。状态根目录下的该目录不可写，或临时文件无法就位。

**修法**。把结论目录设为可写，或把 `GSTACK_STATE_ROOT` 设为一个可写目录，然后重跑 `bin/gstack-capy-install`。

<a id="project-floor-unmet"></a>
### `WARN floor — installed <v> is below the floor <f> that <project>/.gstack/ship-policy.json declares (min_gstack_version); fix: ... (PROJECT_FLOOR_UNMET)` / trailer note `floor=<f> (<file>)`

**含义**。你工作的项目在其 `.gstack/ship-policy.json` 里以 `min_gstack_version` 声明了它希望编队使用的最老 gstack（`gstack-ship-queue` 校验同一键；只含该键的文件也合法），而这台机器的 checkout 更老。项目里的一次提交就取代了全编队的"upgrade to <v>"广播：每台机器的下一次会话检查都会说明这一点并给出命令。这是项目规则，不是安全下限，所以该行是 WARN，结尾行保持 `gstack: ok`，附 `floor=<f> (<file>)` 注记和 `fix:` 注记；只有低于受支持最低版（`REVISION_BELOW_MINIMUM`）才因过旧而让会话失败。

**修法**。在第一个工作流之前执行修法：在 Capy 上，`bash <skill>/scripts/install.sh --for <skill>` 一步把干净 checkout 快进到 origin 并重装（`SELF_UPGRADE: done`）；其他地方用 `bin/gstack-upgrade`。若 floor 高于 gstack 的最新发布，在项目里调低它。

<a id="project-node-pin-unmet"></a>
### `WARN pins — node <v> outside <pin> (<file>); node read from <path> (node pin only; bun pins pass); fix: ... (PROJECT_NODE_PIN_UNMET)`

**含义**。项目的 Node pin 不被 PATH 上第一个 Node 满足（例如 Capy 镜像的 Node 落后于 pin），而所有 Bun pin 都满足。gstack 自己的命令跑在 Bun 上，项目的测试通常自己选 Node（nvm、CI matrix），所以这只是建议：结尾行保持 ok。未满足的 Bun pin——无论有没有 Node 缺口——仍是 `FAIL pins`（`PROJECT_PIN_MISMATCH`）。

**修法**。当这台机器要跑项目的测试时，执行该行的修法：Capy 技能安装器会把精确 pin 装进 gstack 的运行时存储，并通过 `GSTACK_LAUNCH` PATH 启动它；否则 `nvm install <pin>` 并把它放到 PATH 最前。范围 pin（`>=24.22.1`）需要你自己安装 Node；或修改项目里的 pin。

<a id="upgrade-skipped"></a>
### `WARN behind — installed <v> is <n> commits behind origin (latest <ver>) and the session-start upgrade was skipped: <reason>; fix: <command> (UPGRADE_SKIPPED|UPGRADE_BUSY|UPGRADE_REFUSED)` / trailer note `behind=<n> (latest: <ver>); upgrade skipped: <reason> (<CODE>); fix: <command>`

**含义**。一个高于受支持最低版的安装模式会话启动时，发现 checkout 落后于 origin 却无法快进：checkout 脏了、分叉或被 pin（`UPGRADE_REFUSED`）、另一个活会话持有租约（`UPGRADE_BUSY`）、`bin/gstack-upgrade` 缺失，或该会话是 `--for review-voice` 评审者——它绝不移动可能被车道共享的 checkout（`UPGRADE_SKIPPED`）。什么都没改，诊断器认证的是已安装版本，结尾行保持 `gstack: ok` 并带上上述注记：高于最低版的差距绝不是硬失败。结论记录已安装版本，所以落后的车道会报告它（每份报告都带 `behind=`）。

**修法**。当车道需要更新的 gstack 时（`floor=` 注记，或上游落了一个修复），清除指名的原因并执行修法：拒绝解除后运行 `bin/gstack-upgrade`，或等租约持有者结束后再运行一次 Capy 技能安装器。低于受支持最低版时，引导器改为让 `revision` 失败（`REVISION_BELOW_MINIMUM`）。

<a id="upgrade-refused"></a>
### `gstack-upgrade: <cause>; nothing was changed; fix: <command> (UPGRADE_REFUSED)`

**含义**。`bin/gstack-upgrade` 只以快进方式把 checkout 移到其远端默认分支的顶端。它在改动任何东西之前拒绝了：目录不是 gstack checkout、HEAD 游离或位于其他分支（被 pin）、某个已跟踪文件被修改、某个本地提交不在远端分支上、即将到来发布的 Bun 下限高于 PATH 上的 Bun，或另一个更新器持有 `<state root>/.setup-lock`。它绝不 stash、reset 或丢弃。`tracked-by-project` 或 `version-reverted` 原因有自己的小节：[外层项目跟踪了该安装](#auto-update-tracked-by-project)。

**修法**。用打印出的命令解决指名的原因（提交或移走列出的更改、检出默认分支、把本地提交移到别的分支），然后重跑 `bin/gstack-upgrade`。快进之后失败的重装会由下一次运行完成（`reinstall pending from <version>`）。

<a id="upgrade-busy"></a>
### `gstack-upgrade: live gstack sessions hold this installation: pid <p> (<age>m), ...; nothing was changed; fix: ... (UPGRADE_BUSY)` / `gstack-upgrade: a shared harness (capy-server, pid <p>) holds a lease <n>m old; ... (UPGRADE_BUSY)`

**含义**。多个 agent 共享这个 checkout（比如一台机器上的 Capy 子 agent）。每次会话启动都会写一个工作流租约 `<git dir>/gstack-leases/<harness pid>`（由 `bin/gstack-skill-start` 调用 `bin/gstack-lease touch`），而 `bin/gstack-upgrade` 在改动任何东西之前拒绝了，因为存在一个 pid 存活且不在自己进程祖先链里的租约：快进会改变一个正处于工作流中途的会话所用的 gstack。超过 120 分钟的租约会被清理；进程已退出的租约绝不阻断，过期租约也一样：每份租约都记录其进程的启动身份，所以重启或唤醒机器后被复用的 pid（GBRA-105 的租约指名 pid 379，它已变成 dbus-daemon）会被收回而不是阻断。更新器自己的会话（它运行所在的 pid 链）对手工运行的 `bin/gstack-upgrade` 从不计数，共享宿主之下除外：在 Capy 上，每个会话的每次工具调用都跑在同一个 `capy-server` 下，所以调用方链里的 `capy-server` 租约可能是兄弟会话的。`bin/gstack-upgrade` 会计数它，直到它满 120 分钟——从机器上任何会话的最后一次续约算起（`a shared harness (capy-server, pid <p>) holds a lease <n>m old; …`，GST-396）。安装模式的 Capy 安装（`bin/gstack-capy-session`）在该租约未满 120 分钟时也计数它：从持有租约的工作流内部运行的安装（/ship 的 docs 步骤，#3571）会打印 `SELF_UPGRADE: skipped (a gstack run in this session holds a workflow lease on this installation: pid <p> (<age>m <command>), so the upgrade waits until the lease is 120 minutes old; fix: <checkout>/bin/gstack-upgrade once the lease is 120 minutes old, or GSTACK_UPGRADE_FORCE=1 <checkout>/bin/gstack-upgrade when no other session uses this checkout (UPGRADE_BUSY))`，并把 checkout 留在运行开始时的位置。每次 `gstack-skill-start` 都会续约租约并打开一个运行，由其 `gstack-skill-end` 关闭；运行全部关闭的租约是空闲的，从不计数（GST-1205）。

**修法**。等那些会话结束（`bin/gstack-lease list` 显示每个租约的时长与 `alive|idle|dead|stale`；持有者以 `pid <p> (<age>m <command>)` 指名），然后重跑 `bin/gstack-upgrade`。对会话自己的运行或共享宿主租约，等租约满 120 分钟再重跑。确定没有其他会话使用该 checkout 时，`GSTACK_UPGRADE_FORCE=1 bin/gstack-upgrade` 会继续。在 Capy 会话启动时，同一拒绝显示为 `SELF_UPGRADE: skipped (live gstack sessions hold this installation: ...)`，诊断器加上 `WARN behind — … (UPGRADE_BUSY)`，结尾行保持 `gstack: ok … (behind=<n> (latest: <v>); upgrade skipped: … (UPGRADE_BUSY); fix: …)`：已安装版本高于受支持最低版，所以会话仍被认证，注记会给出修法。

<a id="upgrade-fetch-failed"></a>
### `gstack-upgrade: could not reach origin (...) (UPGRADE_FETCH_FAILED)`

**含义**。无法列出或抓取远端默认分支（离线、代理、凭据），所以 `--check` 无法判断 checkout 是否最新。没有那次抓取，它绝不报告 `current`。

**修法**。检查到 checkout origin 的网络访问（`git -C <checkout> remote -v`），然后重跑。

<a id="revision-below-minimum"></a>
### `gstack: fail revision — installed <v> is below the supported minimum <m> (<cause>); fix: ... (REVISION_BELOW_MINIMUM)`

**含义**。远端默认分支上的 `capy/support.env` 声明了其安装器、结尾行与修法行仍然诚实的最老版本（`GSTACK_MIN_REVISION`），而本 checkout 更老。Capy 技能引导器从 `FETCH_HEAD` 读取它，所以即使早于该文件的 checkout 也能得知。`--check` 只报告（`fast-forward available`）；安装模式会快进一个干净、未被 pin 的 checkout，重装并在一把锁下复查。原因说明为什么没动：`pinned by --revision`、`pinned: HEAD is detached`、`tracked files changed: <files>`、`diverged: ...` 或 `auto-upgrade disabled`（`GSTACK_CAPY_AUTO_UPGRADE=0`）。`gstack-doctor --check --min-revision <m>` 会以同样方式让 revision 行失败。

**修法**。执行修法子句：不带 `--check` 的引导器，或 `<checkout>/bin/gstack-upgrade`。对 pin，去掉 `--revision` 或 pin 一个不低于最低版的版本。快进之后被中断的安装会让结尾行保持 `fail`；下一次安装运行会完成它。

<a id="capy-wrapper-stale"></a>
### `FAIL wrapper — ... (CAPY_WRAPPER_STALE)` / `WARN wrapper — ...; owner action: ...` / `gstack-capy-skill: owner action — Drive copy is wrapper <n>, minimum <m>; ...`

**含义**。Capy 技能文件夹比 checkout 的 `GSTACK_CAPY_MIN_WRAPPER`（`capy/support.env`）更老。诊断器的 `wrapper` 行按活动 wrapper 的来源判定（`GSTACK_CAPY_WRAPPER_REV` 与 `GSTACK_CAPY_WRAPPER_PATH`，由引导器导出）：活动的 wrapper 是当前的则通过，别处过期的 Drive 副本是 `WARN` 行——一项绝不会让运行失败的所有者操作。没有来源信息时（直接运行 `gstack-doctor --check`，或没有 `GSTACK_CAPY_WRAPPER=` 行的引导器之前副本——读作 wrapper 0），它会读 Drive 副本（`~/.capy/drive/*/skills/gstack/scripts/install.sh`，或设置了 `GSTACK_CAPY_WRAPPER_PATH` 时只读它），逐个列出其版本：每个副本都低于最低引导版时为 `WARN wrapper — every Capy skill copy is below the minimum wrapper <m> (it still works): ...`，并附所有者操作；只有当某个副本早于引导器（wrapper 0）、完全无法交接时才失败。过期的活动 wrapper 也是 `WARN`：更老的副本仍能工作（`capy/support.env`）。`bin/gstack-upgrade` 会以 checkout 自己的副本作为活动 wrapper 运行安装器，且当 wrapper 行是唯一失败时绝不留下未完成的重装。

**修法**。本次会话：运行 checkout 自己的副本 `bash <checkout>/capy/skill/gstack/scripts/install.sh --check --for <skill>`；它携带当前来源信息，所以在 Drive 副本原样不动的情况下完成认证。所有者：把 `<checkout>/capy/skill/gstack/` 复制到 Drive 技能文件夹上（在 Capy 上是用户级 Drive 的 `skills/gstack/`），或让 Capy 重新同步。Drive 副本改变之前，该消息每个会话都会重现。agent 绝不写技能文件夹。

<a id="bun-resolution-drift"></a>
### `FAIL runtime — bun resolution drifted: recorded bun <v> at <path> (<rule>), now <current>; changed: <what>; fix: ... (BUN_RESOLUTION_DRIFT)`

**含义**。安装与 `--check` 通过同一契约解析 Bun（`bin/gstack-bun-version.sh` 的 `gstack_bun_resolve`，由 `lib/pregate/runtime.ts` 的 `resolveBun` 对应实现）：先看项目的精确 pin 与 gstack 在运行时存储里的安装默认（`<state root>/runtimes/bun/<version>/bun`），再看 `$BUN_INSTALL/bin`、`~/.bun/bin`，最后 PATH；第一个满足 gstack 最低版与所有项目 pin 的 Bun 胜出。安装会把选择记录在该 checkout 与项目的安装结论里（`bun_path`、`bun_version`、`bun_rule`）。记录的 Bun 消失了、报告了另一个版本（被原地替换），或不再满足 gstack 最低版与项目 pin。一个现在会先被解析到的不同候选（另一个项目的安装发布的存储 Bun、变了的 `BUN_INSTALL`）不算漂移：`--check` 保留记录的 Bun，打印 `note: the recorded bun ... stays certified`，并指名记录新选择的那次安装器运行。预门禁的车道与守卫（`lib/pregate/runtime.ts`）以及工作流启动，会在结论记录的 Bun 消失或变化时以此代码拒绝。

**修法**。执行该行的修法：运行安装器记录当前选择；当没有任何合格候选时，它会重新下载一个已验证的 Bun 进存储。下一次 `--check` 通过。

<a id="bun-install-version-invalid"></a>
### `gstack-capy-install: GSTACK_BUN_INSTALL_VERSION=<v> is not a verified Bun at or above gstack's supported minimum ...; fix: ... (BUN_INSTALL_VERSION_INVALID)`

**含义**。当没有精确项目 pin 起决定作用时，`GSTACK_BUN_INSTALL_VERSION` 覆盖安装器下载的 Bun（`GSTACK_BUN_DEFAULT`，1.4.4）。它必须列在 `GSTACK_BUN_VERIFIED`（经 SHA-256 验证的归档）中，且不低于受支持最低版（`GSTACK_BUN_TESTED`）。什么都没安装。

**修法**。取消该变量，或把它设为消息列出的已验证版本之一。

<a id="install-unverified"></a>
### `INSTALL: fail verdict — <detail>; fix: ... (INSTALL_UNVERIFIED)`

**含义**。在 Capy 机器上（`GSTACK_CAPY=1`，由 `GSTACK_LAUNCH` 行设置），无人值守或派生的工作流只有在安装结论通过时才会启动（`<state root>/install-verdicts/<sha256 of the checkout path>/<sha256 of the project directory, or none>.json`，名为 `GSTACK_INSTALL_VERDICT`）——针对本 checkout、其当前 HEAD，以及一个至少与即将启动的一样宽的工作流：`--for autoplan` 的结论不覆盖 `qa` 的 browser，planning-only 的 pins SKIP 不覆盖会跑仓库测试的工作流。`gstack-skill-start` 打印了这一行和 `GSTACK_RESULT: skill=<s> status=refused run=-`，退出码 3。同一启动还会在任何宿主上拒绝 PATH 上的 Bun 低于受支持最低版的无人值守运行（`INSTALL: fail runtime ... (RUNTIME_BELOW_MINIMUM)`）。

**修法**。从工作流将运行的项目目录运行 Capy 技能安装器（`scripts/install.sh --for <workflow>`），因为结论按该目录键控（GSTA-85），并用它打印的 `GSTACK_LAUNCH` 行启动。存在但读不了的结论文件（`the install verdict at <file> is unreadable or has an unsupported schema_version`）同样通过重跑安装器修复。`GSTACK_ALLOW_UNSUPPORTED_RUNTIME=1` 无论如何放行（打印为 `INSTALL_VERDICT: overridden`）；请把它记为一项偏差。

---

## Capy：审批、Captain 简报与 PR 截图

这些来自 gstack 的 Capy 适配新增的命令：`gstack-approvals`（按线程的审批记录）、`gstack-owner-brief render --captain`（before/after 形态的方案请求）与 `gstack-pr-shots`（PR 正文的 before/after 图像）。指南在 `capy/skill/gstack/captain.md`。

<a id="approval-record-invalid"></a>
### `gstack-approvals: ... (APPROVAL_RECORD_INVALID)`

**含义**。某一行缺少必填字段（`--ask`、`--words`、`--scope`、`--by`）、取值超出枚举（`--outcome approved|rejected|pending|standing`、不是真实 `YYYY-MM-DD` 日期的 `--date`），或超过长度上限（ask、scope 与 pending 为 300 字符，words 为 2,000）。退出码 2。什么都没写入。

**修法**。在该行指名的上限内带齐所有必需 flag 重跑。

<a id="approval-record-secret"></a>
### `gstack-approvals: ... (APPROVAL_RECORD_SECRET)`

**含义**。某个字段命中了 gstack 的密钥扫描器（与推送守卫用的同一个）。该行指名字段与检测规则，绝不会显示命中的文本。退出码 3。什么都没写入——本地与 Drive 镜像都没有。

**修法**。把密钥替换为 `[redacted]` 后记录原话，或请当事人换一种说法。若密钥是真的，轮换它。

<a id="approval-record-no-branch"></a>
### `gstack-approvals: ... (APPROVAL_RECORD_NO_BRANCH)`

**含义**。记录按分支保存（一个 Capy 线程发布一个分支），而 HEAD 处于游离状态或工作目录不是 git 仓库。退出码 3。若是 `import --autoplan <dir> --stack <b1,b2,...>`，则表示列出的某个分支在本地和 origin 上都不存在；该行会指名它，且任何分支的记录都没写入。

**修法**。检出工作所发布的分支，或传入 `--branch <name>`。对 `--stack`，改正或抓取指名的分支后再导入。

<a id="approval-record-unavailable"></a>
### `gstack-approvals: ... (APPROVAL_RECORD_UNAVAILABLE)`

**含义**。本机没有记录，状态根目录是临时的（Capy 机器），且无法解析出任何 Drive 镜像，于是"没有审批"与"记录随旧机器丢失"无法区分。`render` 仍会打印该节，但以 "Record unavailable on this machine" 取代 "No approvals recorded"。退出码 1。

**修法**。在记录所在的机器运行，从线程报告把行拷回，或让一个 Drive 镜像可解析：`GSTACK_APPROVALS_DIR`、挂载的那块 Captain drive 里的 `approvals/` 目录（`~/.capy/drive/captain-*/approvals`，全编队可读），或某个 `~/.capy/drive/project-user-*` 文件夹。`gstack-approvals path` 会打印是哪条规则选中的镜像，并以 `READ_ALSO:` 列出它仍会读取的其他根（在 Captain 创建 `approvals/` 之前镜像过的行仍然可见）。

<a id="approval-record-write-failed"></a>
### `gstack-approvals: ... (APPROVAL_RECORD_WRITE_FAILED)`

**含义**。本地记录或其 Drive 镜像写不进去；该行指名路径与错误。本地追加失败时什么都没写。镜像写入失败时本地行保留在原处。退出码 1。

**修法**。把指名的目录设为可写，然后重跑 `gstack-approvals sync` 再次镜像。

<a id="approval-import-unanswered"></a>
### `gstack-approvals import: ... (APPROVAL_IMPORT_UNANSWERED)`

**含义**。该 autoplan 运行没有任何已回答的门禁（所有决定仍是 pending），所以没有可导入的内容。退出码 3。

**修法**。回答门禁（`gstack-autoplan answer ... --by human|agent:<id>`），然后再次导入。导入是幂等的，重试绝不会把一条回答记录两次。

<a id="captain-brief-incomplete"></a>
### `gstack-owner-brief render --captain: ... (CAPTAIN_BRIEF_INCOMPLETE)`

**含义**。方案缺少简报需要的至少一节：`## Before → after`、`## Why it matters`、`## What caused this work`、`## Big decisions`，以及（当运行的 `gate.json` 带有 `eli5` 字段时，gstack 1.91.305 及以后；更早的运行按原样渲染）`## ELI5`（别名 `## In plain words`）。简报仍会打印，但开头是 "Not ready for approval" 且没有回复邀请。退出码 1。

**修法**。把指名的各节补进方案（若该运行正在评审它，用 `gstack-autoplan revise --plan <file>`）并重新渲染。`--allow-incomplete` 以退出码 0 用于预览，但文本仍会说明尚未就绪。

<a id="pr-shots-input-not-found"></a>
### `gstack-pr-shots: ... (PR_SHOTS_INPUT_NOT_FOUND)`

**含义**。缺少一项输入：`--before/--after` 文件、`--base` ref、在 base 与工作树两处都存在的 `--path`，或两侧的 `--heading`。退出码 3。

**修法**。检查该行指名的 ref、路径或标题。

<a id="pr-shots-input-refused"></a>
### `gstack-pr-shots: ... (PR_SHOTS_INPUT_REFUSED)`

**含义**。渲染任何东西之前一项输入被拒绝了，因为 PR 图像是公开的。它命中了密钥扫描器（该行指名一侧、行号与规则）、是二进制、超过 512 KiB、位于仓库与状态根目录之外，或指名了一个以 `-` 开头的 ref。退出码 3。

**修法**。把密钥从截取内容中去掉，或改画一个已跟踪的文本文件。

<a id="pr-shots-identical"></a>
### `gstack-pr-shots: ... (PR_SHOTS_IDENTICAL)`

**含义**。before 与 after 是同一段文本，没有可呈现的变化。退出码 1。

**修法**。画一个本分支改过的文件或小节（`git diff --stat origin/<base>...HEAD`）。

<a id="pr-shots-render-failed"></a>
### `gstack-pr-shots: ... (PR_SHOTS_RENDER_FAILED)`

**含义**。有浏览器可用，但渲染 `shot.html` 失败；该行指名渲染器的错误。`shot.html` 与 `text.md` 仍会写出。退出码 1。完全没有浏览器时，命令改为打印 `SHOT_PNG: unavailable (...)` 并以退出码 0 结束。

**修法**。用你自己的浏览器以 880 px 宽度截取 `shot.html`，或使用 `text.md`。

## /ship 的 token 预算与全新上下文交接（gstack-ship-budget）

流程、BUDGET 行的逐字段说明与各种计量器见 [ship-budget.md](https://github.com/garrytan/gstack/blob/main/docs/ship-budget.md)。退出码 2 的行走 stderr；退出码 3 的行（一次停止）走 stdout，并带 STOP、RECOVER 与 GSTACK_RESULT 行。

<a id="budget-cap-reached"></a>
### `gstack-ship-budget: ... (BUDGET_CAP_REACHED)`

**含义**。下一步，或分发批次的第一个读者，会把"已用 + 未结预留 + 未知费用 + 其预估 + 尾量与停止预留"推过准入上限，所以它没有启动。退出码 3。能部分容纳的批次不会被整体拒绝：`check` 会放行能容纳的最大前缀并打印 `ADMIT: k of n (remaining=<roles>)`。运行停止之后的分发，`gstack-review-log --start` 会打印同一代码（退出码 1）。上限只放行工作；它无法停下一个已在运行的轮次，所以超支幅度以停止之前放行工作的预估偏差为界。

**修法**。该运行以 status=incomplete 结束，并留有可恢复的记录。提高上限由所有者决定：运行打印出的 `RECOVER:` 行；其恢复需要 `--approved-by <who> --words "<their words>"`。

<a id="budget-reading-missing"></a>
### `gstack-ship-budget: ... (BUDGET_READING_MISSING)`

**含义**。运行的计量器是 agent 自己的 Capy jam 计数器，设置了上限，而命令没有收到 `--reading`。退出码 2。任何 gstack 二进制都无法调用 Capy 的 API，所以由 agent 读数。

**修法**。在运行该命令的 execute 程序里读 `(await tools.thread.get({ thread_id: "<你自己的 jam id>" })).cost.tokens`，并作为 `--reading <n>` 传入。

<a id="meter-scope-parent"></a>
### `gstack-ship-budget: ... (METER_SCOPE_PARENT)`

**含义**。`start` 被告知该运行是一个子 agent（`--subagent` 或 `GSTACK_SHIP_SUBAGENT=1`），读取的是 `"this"`（`--reading-from this`）——根线程的计数器，它还包含所有兄弟车道——却又要求 `--meter-scope self`。self 范围会把那个计数器当作运行自身的成本打印。退出码 2；没有运行启动。

**修法**。以 `--meter-scope tree` 启动。此后每条成本行都打印 `METER: tree (root counter, upper bound)`。精确的按运行成本来自根重放线程（`docs/ship-budget.md`）。

<a id="budget-reading-rejected"></a>
### `gstack-ship-budget: ... (BUDGET_READING_REJECTED)`

**含义**。读数违反了运行的计量器契约：它低于同一 epoch 的上一次读数、`--prior-reading` 或 `--dispatched-at` 高于 `--reading`，或 `--reading` 给了一个读取自身来源（Claude Code 日志、估算值）的计量器。退出码 2；什么都没改。

**修法**。传入运行启动时的计数器（BUDGET 行指名计量器、单位与 epoch）。换一个计量器会开启一个保留先前用量的新 epoch：`gstack-ship-budget resume --run <id> --meter <m>`。

<a id="budget-meter-unavailable"></a>
### `gstack-ship-budget: ... (BUDGET_METER_UNAVAILABLE)`

**含义**。设置了上限却读不到任何计量器：没有 `--reading`、没有绑定的 Claude Code 会话、没有 `--meter estimate`；或 `--session`/`--nonce` 匹配到零个或多个日志。该行指名它尝试过的内容。退出码 2。

**修法**。Capy：`--reading <n>`。Claude Code：`--session <id>`，或回显该行打印一次的 nonce 并带 `--nonce <value>` 重跑。其他环境，经所有者同意用 `--meter estimate`。

<a id="budget-ledger-invalid"></a>
### `gstack-ship-budget: ... (BUDGET_LEDGER_INVALID)`

**含义**。台账（`<state root>/ship-runs/<run>/budget.json`）、记录的 gstack-budget 块、交接简报的块或某个检查点缺失、无法解析、来自其他 schema 版本，或未绑定到该运行（身份或 sha256 不匹配）。该行指名路径、schema 版本与解析位置。退出码 2。

**修法**。换机器后，`gstack-ship-budget resume --run <id>` 会从 Drive 检查点恢复台账与记录。否则重建：`resume --record <path> --rebuild-from-record --reading <n>`；未结预留按未知费用计。

<a id="budget-check-skipped"></a>
### `gstack-review-log: ... (BUDGET_CHECK_SKIPPED)` / `gstack-ship-budget: ... role=<r> step=<s> started=<t> spend=unknown (BUDGET_CHECK_SKIPPED)`

**含义**。在上限之下，`gstack-review-log --start` 没有收到预留 id、收到了来自另一运行的 id 或步骤预留（不匹配），或收到了已用过的 id（一次性）；它在分发之前拒绝（退出码 1，未捕获任何内容）。来自 `close`：该运行的某条 review-log 行在启动前没有预留；每次分发一行，运行以 status=incomplete 结束（退出码 3）。

**修法**。在批次之前运行 `gstack-ship-budget check --run <id> --step <s> --next dispatch:<roles>`，并把打印出的 id 以 `--reservation` 传入一次。预留绝不事后补建：由所有者以 `close --approved-by <who> --words "<their words>"` 接受这笔无预留支出，或在预留之下重跑分发。

<a id="handoff-pin-moved"></a>
### `gstack-ship-budget: ... (HANDOFF_PIN_MOVED)`

**含义**。`verify-handoff` 发现简报不再匹配它的树：HEAD、与 base ref 的合并基、工作树指纹（`gstack-wtree`）或被评审的树移动了，或简报的 sha256 不是父方记录的那个。每一行都指名钉住的项及其期望值与实际值。仅 main 前进不会动合并基，也绝不拒绝。退出码 3；子方已写入 status=refused 的返回。

**修法**。父方核对这次拒绝，在当前树上重新生成交接（`gstack-ship-budget handoff ...`），或停止。核对会停止该运行（`reason=child_refused`）：在重新生成的子方核对完成之前，或所有者运行 `gstack-ship-budget resume` 之前，每项检查都会拒绝。

## 浏览器

<a id="browse-runtime-version-skew"></a>
### `[browse] this install's browse CLI (<root>, build <hash>) and the gstack checkout's server bundle (<checkout>, build <hash>) are from different builds, so the server was not started. ...`

**含义**。在 Windows 上，宿主运行时根目录（`~/.codex/skills/gstack` 及其他环境变量宿主）持有的 browse 副本没有 `node_modules`，所以它的 CLI 会启动 `.source-path` 里记录的 gstack checkout 中的服务器包。该 checkout 被重建（或更新）时没有刷新这个运行时根目录，两个构建不一致，于是 browse 拒绝运行不匹配的服务器。

**修法**。从消息指名的 checkout 重跑 setup；它会重建并刷新每个运行时根目录：

```bash
cd <checkout> && ./setup
```

<a id="browse-chain-no-flow"></a>
### `[browse] chain: no flow to run (stdin was empty)` (or `stdin is a terminal`, `stdin could not be read (EAGAIN)`)

**含义**。不带参数的 `browse chain` 运行管道传入的 JSON flow。什么都没有到达，所以它在启动浏览器之前以 1 退出。它以前在 Windows 上什么都不运行也以 0 退出。

**修法**。把 flow 用管道传入，或作为参数传入：

```bash
echo '[["goto","https://example.com"],["text"]]' | browse chain
browse chain 'goto https://example.com | text'
```

<a id="browse-chromium-path-failed"></a>
### `Chromium at GSTACK_CHROMIUM_PATH=<path> failed to launch: ...`

**含义**。无头 browse、有头 browse、`browse handoff` 与 make-pdf 都使用 `GSTACK_CHROMIUM_PATH`（NixOS、macOS 13）。那个二进制启动不了。

**修法**。把 `GSTACK_CHROMIUM_PATH` 指向一个可用的 Chromium，或 `unset GSTACK_CHROMIUM_PATH` 改用 gstack 内置的。

<a id="browse-profile-in-use"></a>
### `Headed Chromium profile <dir> is in use by Chromium PID <pid> (started by PID <ppid>: <name>). ...`

**含义**。有头 browse 为每个项目保留一个配置目录（`<project>/.gstack/chromium-profile`）。一个活着的浏览器占着它，而 browse 绝不杀它。`... is locked by PID <pid> on another host (<host>)` 表示锁经由同步文件夹来自另一台机器。

**修法**。关掉那个浏览器，或 `export CHROMIUM_PROFILE=<另一个目录>`。对另一台机器的情况，在那边停掉它，或确定没有进程在用之后删除 `<dir>/SingletonLock`。

<a id="browse-profile-per-project"></a>
### `[browse] Headed browse now keeps a profile per project ...`

**含义**。首次使用时，若没有浏览器占用，会从 `~/.gstack/chromium-profile` 复制你的登录状态；否则从空白开始并打印导入方法。`browse profiles` 列出它们，`browse profiles prune --days 30` 移除闲置的。

<a id="browse-blocked-address"></a>
### `Blocked: <host> is a cloud metadata or link-local address` / `... resolves to a cloud metadata or link-local address`

**含义**。Browse 拒绝 169.254.0.0/16（含容器凭据端点）、100.100.100.200、fe80::/10 与 fc00::/7 的一切数字写法，重定向或页面驱动导航之后也一样。标签页被重置为 `about:blank`，命令失败。这不可覆盖。

<a id="browse-forbidden-origin"></a>
### `forbidden origin`（来自侧边栏终端）

**含义**。该终端只接受 gstack 的扩展。自建或 fork 的扩展有不同的 ID。`BROWSE_EXTENSION_ID` 不再被读取。

**修法**。`gstack-config set browse_extension_id <你的 32 字母 id>`。

<a id="browse-type-selector-hint"></a>
### `hint: "<word>" looks like a CSS selector`

**含义**。裸的 `browse type <text>` 是向聚焦元素输入文本。第一个词看起来像选择器，于是被当作文本敲了进去。

**修法**。`browse type --selector '<sel>' <text>`（以 `--` 开头的文本放到 `--` 之后）。

<a id="browse-server-node-missing"></a>
### `server-node.mjs not found. Run bun run build`（Windows）

**修法**。`cd <gstack checkout> && bun run build`。

<a id="freeze-helpers-out-of-date"></a>
### `[freeze] Hook helpers out of date (partial upgrade?)`

**含义**。`check-freeze.sh` 与 `hook-extract.sh` 来自不同的 gstack 版本。

**修法**。`cd <gstack checkout> && ./setup`（或 `/unfreeze`）。

<a id="browse-chromium-pid-unrecorded"></a>
### `[browse] Could not record the Chromium PID (CDP SystemInfo.getProcessInfo: <error>); browse stop cannot reap a surviving Chromium.`

**含义**。对于它自己启动的无头 Chromium，browse 会通过 CDP 读取浏览器的进程 id，好让 `browse stop` 能杀掉比服务器活得久的浏览器。那次读取失败或超过 2 秒，所以本次会话的浏览器没有被记录。gstack 没有启动的浏览器绝不会被记录或杀死。

**修法**。`browse stop` 之后，用 `ps aux | grep -i chrom` 检查残留的浏览器，并用 `kill <pid>` 结束它。

<a id="browse-no-active-page"></a>
### `No active page. Use "browse goto <url>" first.`（最后一个标签页在 browse 之外被关闭后）

**含义**。当所有标签页都在 browse 之外被关闭（有头窗口的标签页被手工关闭，或某个页面自行关闭）时，更早的版本会让之后的每条命令——包括 `status` 与 `stop`——都这样失败，直到守护进程被杀（#3167）。现在 `status` 与 `stop` 无需打开标签页即可应答，任何其他命令都会先打开一个新的空白标签页并打印 `[browse] warning: every tab was closed outside browse, so this command ran on a new blank tab; open your page again with: browse goto <url>`。

**修法**。`browse goto <url>` 重新打开你的页面。

**修复于**。v1.91.101.0 之后的第一个发布（#3167）。

<a id="browse-tab-unrecoverable"></a>
### ``browse: every tab was closed outside browse and a new one could not be opened, because the browser or its context is gone (<cause>); fix: run `browse restart` ... (BROWSE_TAB_UNRECOVERABLE)``

**含义**。所有标签页都在 browse 之外被关闭，浏览器或其上下文也没了，于是 browse 无法打开标签页来运行命令。`browse status` 与 `browse stop` 仍会应答。

**修法**。`browse restart`（gstack 技能内为 `$B restart`），然后再次运行该命令。

**修复于**。v1.91.101.0 之后的第一个发布（#3167）。

<a id="browse-session-invalid"></a>
### ``browse: the session name is not 1-64 letters, digits, dots, colons, underscores or dashes ("<name>"); fix: pick a name like agent-1 ... (BROWSE_SESSION_INVALID)``

**含义**。`BROWSE_SESSION` 或 `--session` 里的名字不会被 browse 用作标签页所有者。

**修法**。用 `agent-1` 这类短名字。空的 `BROWSE_SESSION=` 会关闭会话并使用共享的活动标签页。

<a id="browse-session-root-only"></a>
### ``browse: only the local root token may name a session ... (BROWSE_SESSION_ROOT_ONLY)``

**含义**。一个配对或受限（scoped）的 agent 发来了会话名。会话属于共享根 token 的本地 agent；受限 agent 已经有自己的标签页。

**修法**。运行 `newtab`，并在每条命令上传回返回的 `tabId`。

<a id="browse-session-tab-reset"></a>
### ``browse: this session's tab was closed ... (session <name>'s tab <id> was closed; it was on <url>); fix: open the page again ... (BROWSE_SESSION_TAB_RESET)``

**含义**。该会话工作的标签页没了：有人对它执行了 `closetab`、关掉了窗口，或它闲置超过 `BROWSE_SESSION_IDLE_MINUTES`（默认 120）。browse 拒绝读取，而不是从空白页应答。

**修法**。在同一会话里 `browse goto <url>` 会为它打开一个新标签页，然后在使用 `@refs` 之前再次 `snapshot`。

<a id="browse-session-limit"></a>
### ``browse: every session slot is running a command ... (BROWSE_SESSION_LIMIT)``

**含义**。`BROWSE_MAX_SESSIONS` 个会话（默认 16）都在命令执行中，browse 无法关掉一个闲置的来为新会话开标签页。

**修法**。稍后重试，或调高 `BROWSE_MAX_SESSIONS`。

<a id="browse-device-unknown"></a>
### ``browse: no Playwright device has that name, so nothing on the tab changed ("<name>"; nearest: ...); fix: $B device --list (BROWSE_DEVICE_UNKNOWN)``

**含义**。`$B device <name>` 大小写不敏感地匹配 Playwright `devices` 表里的名字。你给的名字不在其中，所以标签页未被触碰。该行列出最接近的三个名字。

**修法**。`$B device --list` 打印所有名字；带空格的名字要加引号（`$B device "iPhone 15"`）。加 `--landscape` 使用旋转后的档案。

**修复于**。v1.92.61.0 之后的第一个发布（#3058）。

<a id="browse-device-cdp-failed"></a>
### ``browse: Chromium refused a device emulation call on this tab (<method>: <error>; the tab is partly emulated); fix: $B device off (BROWSE_DEVICE_CDP_FAILED)``

**含义**。手机模拟是对标签页自身会话的三次 DevTools 调用（尺寸、触摸、user agent）。其中一次失败了；该行指名它，并说明它之前的调用是否已经改变了标签页。

**修法**。`$B device off` 清除全部三项，然后重试该设备。若仍失败，说明标签页或浏览器已没了：`$B restart`。

**修复于**。v1.92.61.0 之后的第一个发布（#3058）。

<a id="browse-touch-no-device"></a>
### ``browse: touch input needs a phone profile on this tab first ($B tap on this tab); fix: $B device "iPhone 15" (BROWSE_TOUCH_NO_DEVICE)``

**含义**。`tap`、`swipe`、`pinch` 与 `touch` 发送真实触摸事件，页面只在触摸设备上能看到。当前标签页没有手机档案。

**修法**。在同一标签页上 `$B device "iPhone 15"`（或 `$B device --list` 里的任何名字），然后重复触摸命令。

**修复于**。v1.92.61.0 之后的第一个发布（#3058）。

---

## Windows

<a id="windows-smart-app-control"></a>
### `Windows blocked compiled gstack binaries at launch (Smart App Control or another application-control policy, #2595)` / `bash: .../browse.exe: Permission denied`

**含义**。已知问题（#2595、#2124）。gstack 在你的机器上用 Bun 编译五个二进制：`browse`、`find-browse`、`design`、`pdf` 与 `gstack-global-discover`。它们没有签名，而在一台机器上构建的二进制永远攒不到 Smart App Control 认可、用来代替签名的信誉，所以开着 Smart App Control 的 Windows 11 拒绝启动它们。Git Bash 把它报成 `Permission denied`——看起来像文件权限问题，其实是代码完整性（PowerShell 说 `An Application Control policy has blocked this file`）。setup 现在会运行每个二进制的 `--version`，指名被拦的那些以及需要它们的技能：gstack 浏览器回退（`/browse`、`/qa`、`/qa-only`、`/design-review`、`/canary`、`/benchmark`、`/pair-agent`、`/scrape`、`/make-pdf`）、design 二进制（`/design-consultation`、`/design-shotgun`、`/design-html`、`/plan-design-review`）与 `/retro global`。其余技能都能工作。`gstack-doctor` 的 `browse bundle` 与 `binaries` 行显示同一状态。确切的 Windows 报错文本尚未在 Smart App Control 机器上核实；setup 会在分类旁边打印原始的第一行。

**修法**。Smart App Control 没有按文件的白名单。当前的选择：

- 在 WSL 里运行 gstack（`wsl --install`，然后在 Linux 发行版中安装 gstack）。WSL 运行的是 gstack 的 Linux 构建，Smart App Control 不检查它。
- 或在 Windows 安全中心 > 应用和浏览器控制 > Smart App Control 设置里关掉它。在装了 2026 年 4 月更新的 Windows 11 上，之后可以再打开而无需重装 Windows；更老的构建上一旦关闭就是永久的。只要它开着，gstack 的二进制就会一直被拦。

签名的发布二进制才是真正的修复，记录在 `TODOS.md`。Windows 放行这些二进制后，重跑 `./setup`；该消息会消失。

**预期结果**。setup 不再打印 "Windows blocked" 行，`gstack-doctor` 的 `browse bundle` 与 `binaries` 显示 `ok`。

<a id="setup-ps1-unexpected-eof"></a>
### `setup: -c: line 1: unexpected EOF while looking for matching '"'` / `setup: -c: line 2: syntax error: unexpected end of file`（来自 `.\setup.ps1`）

**含义**。Windows PowerShell 5.1（`powershell.exe`，Windows 默认的 PowerShell）以传统方式向原生程序传参，并剥掉其中的双引号。在修复 #3130 的发布之前，`setup.ps1` 交给 Git Bash 的 `bash -c` 脚本里含有双引号，于是 bash 读到坏脚本，什么都没装。PowerShell 7.3 及更新版本不受影响。

**修法**。更新 gstack（在 Git Bash 里：`cd ~/.claude/skills/gstack && git pull --ff-only`），然后再次运行 `.\setup.ps1`：它的脚本不再含有双引号。在那之前，从 Git Bash 运行 `./setup`，或从 PowerShell 7（`pwsh`）运行 `.\setup.ps1`。

<a id="setup-ps1-empty-argument"></a>
### `setup.ps1: argument N is empty; setup takes no empty arguments. Nothing was installed or changed. (SETUP_PS1_EMPTY_ARGUMENT; ...)`

**含义**。你传给 `.\setup.ps1` 的某个参数是空字符串（例如 `''`，或未设置的变量如 `$hostName`）。setup 不接受空参数，而 `setup.ps1` 在 Windows PowerShell 5.1 下向 Git Bash 传参的方式带不动空参数，所以它在运行任何东西之前就拒绝了。

**修法**。去掉空参数，或给它一个值：

```powershell
.\setup.ps1 --host codex
```

---

<a id="setup-deps-migrate-failed"></a>
### `gstack: WARN kept the full dependency install (SETUP_DEPS_MIGRATE_FAILED; ...): <cause>`

**含义**。你的安装早于 v1.91.231.0，所以仍带着测试与评测包（约 520 MB，主要是 Claude Agent SDK）。setup 把 `node_modules` 挪到一边以只装生产依赖，那次安装失败，于是 setup 把完整的 `node_modules` 放了回去。什么都没被移除，gstack 继续在完整安装上工作。

**修法**。修复警告指名的原因（无网络、代理、磁盘满），然后再次运行 `./setup`。在这个 checkout 里开发 gstack？标记它，setup 从此保留开发包：

```bash
git config gstack.contributor true
```

---

<a id="chromium-install-exit-127"></a>
### `Chromium bootstrap: chromium-install — <bun> x playwright install chromium exited 127 (command not found); install Bun from bun.sh (winget Bun ships no bunx), or skip with ./setup --no-browser (Git Bash) or .\setup.ps1 --no-browser (PowerShell)`

**含义**。setup（或 `bin/gstack-browser-ensure`，报为 `BROWSER_UNAVAILABLE <bun> x playwright install chromium exited 127 (command not found)`）无法运行 Playwright 安装器：shell 找不到可运行的命令。在修复 #3131 的发布之前，setup 调用 `bunx`——winget 安装的 Bun 不带它——并把失败报成 `exited 127 (offline, proxy, or blocked download?)`。现在它通过解析到的 Bun 运行 `bun x`，所以退出码 127 表示那个 Bun 本身或它启动的某个命令缺失。不需要浏览器的技能无论如何都会安装。

**修法**。从 https://bun.sh 安装 Bun（它带 `bun` 与 `bunx`），然后再次运行 setup。想暂时不带浏览器安装，在 Git Bash 里：

```bash
./setup --no-browser
```

或在 Windows PowerShell 里：

```powershell
.\setup.ps1 --no-browser
```

---

<a id="bash-unavailable"></a>
### `gstack: no Git Bash found to run gstack's bash scripts on Windows (tried ...); fix: ... (BASH_UNAVAILABLE)`

**含义**。Windows 无法运行带 shebang 的脚本，所以 gstack 把它的 bash 脚本（`gstack-wtree`、`gstack-slug`、各 hook 的 bin、regen 与 pregate 选择清单里的 `bash -c` 命令）交给 Git Bash。它按以下顺序查找，消息会列出尝试过的每个候选及其被拒的原因：

1. `GSTACK_GIT_BASH`（或旧名 `GSTACK_BASH`；两者都设置且不同时，`GSTACK_GIT_BASH` 胜出，并有一行警告说明）。不存在的值会被拒绝，而不是跳过。
2. `git --exec-path` 旁边的 bash（能找到 scoop、每用户与便携版 Git）。
3. `C:\Program Files\Git`、`C:\Program Files (x86)\Git`、`%LOCALAPPDATA%\Programs\Git` 与 scoop 的 `git\current`。
4. PATH 上的 `bash`，仅当 `uname -s` 报告 MSYS 或 MINGW 时。`System32` 或 `WindowsApps` 里 WSL 的 `bash.exe` 绝不会被用：它把 `C:\...` 路径当 Linux 路径读。既非前两者情况的 PATH bash（例如 Cygwin）也不再使用。

#3197 之前这些命令直接 spawn 脚本，于是 `gstack-restamp` 以 `cannot fingerprint the working tree ()` 拒绝，而 `gstack-gate-diff` 与 `gstack-evidence` 静默丢弃指纹。

**修法**。安装 Git for Windows（PowerShell 里 `winget install --id Git.Git -e`），或永久地把 gstack 指向你的 bash.exe。Git Bash 里的 `export` 只影响那个 shell，所以要设在 Claude Code 读取它的地方：

- Windows PowerShell 5.1 或 PowerShell 7，然后重启 Claude Code：

  ```powershell
  [Environment]::SetEnvironmentVariable('GSTACK_GIT_BASH', 'C:\Program Files\Git\bin\bash.exe', 'User')
  ```

- 或 `~/.claude/settings.json` 的 `env` 块：

  ```json
  { "env": { "GSTACK_GIT_BASH": "C:/Program Files/Git/bin/bash.exe" } }
  ```

hook 会把它找到的 bash 缓存在 `<state root>/cache/windows-bash.json`（以 `git.exe` 的路径与修改时间为键，使用前复查）；覆盖值从不缓存。

**预期结果**。`gstack-restamp --dry-run` 打印它的 diff，`gstack-gate-diff` 记录以树 id 结尾的候选而不是 `+nowtree`。

<a id="gate-error-no-base"></a>
### `GATE_ERROR=no_base`

**含义**。`gstack-gate-diff` 无法解析它要对照 diff 的 base（`GATE_ERROR=no_base ref=<ref> fix=<git command>` 是它唯一的 stdout 行，退出码 2）。该 ref 不是本 checkout 里的提交：浅克隆（CI 默认 `fetch-depth: 1`）、从未抓取过的远端分支（没有 `refs/remotes/origin/main` 的 `origin/main`），或浅历史里缺了第一父提交的 `--commit`。该工具绝不猜测 base，因为对着错误或不存在的 base 得到的空 diff 会被读作"没有门禁编辑"而通过评审。`gstack-diff-scope` 对同一原因打印 `SCOPE_ERROR=no_base`（所有 flag 为 false，退出码 2）；当没有给出 base 且 `origin/HEAD` 指向当前检出的分支（或其上游，或 HEAD 自己的提交），而没有 PR base、活的远端 HEAD、`origin/main` 或 `origin/master` 可解析时也一样（其注释行有说明）。

**修法**。运行该行打印的命令。它就是为本 checkout 构建的：未抓取的分支用 `git fetch origin +<branch>:refs/remotes/origin/<branch>`；浅克隆用 `git fetch --unshallow origin <refspec>` 或 `git fetch --deepen=50 origin`。在工作流里，在运行 `gstack-gate-diff` 或 `gstack-diff-scope` 的步骤之前，先以 `fetch-depth: 0` 检出（或显式抓取 base）。

**预期结果**。`gstack-gate-diff <base>` 打印 `GATE_SUMMARY:`，`gstack-diff-scope` 打印其 `SCOPE_*` flag 且没有错误行。

---

## 记忆与 gbrain

下面的每条消息也收录于 [docs/gbrain-sync-errors.md](/gbrain-sync-errors/)，并有更详细的说明，以及逐页摄入消息（`FAILED`、`re-queued`、`quarantined`、reconcile 进度、保留在本机的提示）。

<a id="gbrain-db-unreachable"></a>
### `database host unreachable (<code> <host>); your gbrain config is unchanged. Fix: check network or VPN, then re-run /sync-gbrain.`

**含义**。连接你的 gbrain 数据库时的 DNS 或连接错误。它以前看起来像配置坏了，而 setup 在离线时会剥离 brain 功能。

**修法**。恢复网络或 VPN，然后 `/sync-gbrain`。

<a id="memory-ingest-unattributed-failures"></a>
### `[memory-ingest] ERR: gbrain reported N failure(s) it did not attribute to a staged page ... Refusing to advance state.`

**保留了什么**。没有任何东西被标记为已保存，所以也不会丢失。三次这样的运行之后，gstack 会对批次做二分，并把破坏批次的页面隔离。

**修法**。重新运行 `/sync-gbrain`。

<a id="memory-reconcile-not-run"></a>
### `[memory-ingest] reconcile: not run (...)`

**含义**。升级之后，gstack 会复查它曾标记为已保存的转录，并重新导入 brain 里缺失的那些。该检查需要本地 gbrain。

**修法**。`/setup-gbrain`，然后 `gstack-memory-ingest --reconcile`（`--dry-run` 预览）。

<a id="memory-ingest-locked"></a>
### `[memory-ingest] ERR: another memory ingest (pid <N>) is writing <state file>; not run.`

**修法**。等它结束，然后重新运行 `/sync-gbrain`。

<a id="memory-ingest-state-unsaved"></a>
### `[memory-ingest] ERR: could not save ingest state <path>: <error>.`

**修法**。修复你 gstack 状态根目录下的权限或腾出磁盘空间，然后 `/sync-gbrain`。

<a id="memory-ingest-transcript-checkout"></a>
### `[memory-ingest] kept N transcript page(s) for <repo> on this machine: gbrain source <id> ...`

在托管式 gbrain brain（0.60+）上，一次导入只会落入绑定到本宿主所拥有 checkout 的 source，所以 gstack 会在导入前把每个转录 source 绑定到它自己的 checkout `<state root>/gbrain-transcript-sources/<id>/`。该分区留在本机、未打戳，在下列情况下等以后一次运行再导入：

- **被其他所有者持有**：该 source 绑定到了另一台宿主或另一个目录。gstack 绝不接管它。用 `gbrain sources writer status --source <id> --json` 检查；由所有者释放（在持有宿主上 `gbrain sources writer transfer prepare <id>`），或由你在这里重新绑定：`gbrain sources set-path <id> <checkout>`。
- **状态根目录是临时的**（`GSTACK_EPHEMERAL=1`）：绑定会指向一个随机器消失的目录。用持久根目录运行：`GSTACK_STATE_ROOT=<持久目录> gstack-memory-ingest --bulk`。
- **绑定到了 gstack 的 checkout，但它缺失或未激活**：从状态根目录的备份恢复该 checkout，或按 `gbrain doctor --json` 处理。
- **无法绑定**：消息带有 gbrain 的拒绝原因；用上面的 writer status 命令检查该 source。

<a id="gbrain-artifacts-not-indexed"></a>
### `curated artifacts pushed to git, but gbrain source <id> has 0 indexed pages. Fix: gbrain sync --source <id>, then re-run /sync-gbrain`

**修法**。`gbrain sync --source <id>`，然后 `/sync-gbrain`。

<a id="gbrain-dream-skipped"></a>
### `dream: skipped — the installed gbrain cannot run only the resolve_symbol_edges phase, and the full dream cycle costs about 35 minutes ...`

**含义**。`/sync-gbrain --dream`（以及 `--full` 的自动构建）现在只运行调用图阶段。你的 gbrain 无法限定该阶段，所以什么都没运行。

**修法**。`gstack-gbrain-install`，然后 `/sync-gbrain --dream`。或自己跑完整循环：`gbrain dream --source <id>`。

<a id="gbrain-cycle-freshness-unknown"></a>
### `call graph for <source>: unknown: installed gbrain does not expose cycle_freshness`

**修法**。`gstack-gbrain-install`。

<a id="gbrain-path-unavailable"></a>
### `[gbrain-sync] gbrain source <id>: path unavailable (<path>); gstack skips it.`

**含义**。某个已删除 worktree 的代码 source。gstack 绝不会自行删除它。

**修法**。先预览，再删除 gstack 能证明属于本机的那些：

```bash
gstack-gbrain-sync --prune-gone-worktrees --dry-run
gstack-gbrain-sync --prune-gone-worktrees
```

---

## 评测报告与通过率

这些消息来自付费评测普查报告与 `bun run eval:pass-rates`。红色普查的走查手册是 [docs/evals/census-red.md](https://github.com/garrytan/gstack/blob/main/docs/evals/census-red.md)。

<a id="pass-rates-unknown-flag"></a>
### `eval:pass-rates: unknown flag <flag>` / `eval:pass-rates: unknown case <id> (not an E2E, judge or paid test file id)`

**含义**。flag 或 case id 不被识别。命令在抓取任何东西之前以 2 退出。

**修法**。`bun run eval:pass-rates --help` 列出各 flag。`--case` 接受 `test/helpers/touchfiles-data.ts` 里的注册表 id 或付费测试文件路径。

<a id="failure-cause-newer"></a>
### `unknown failure_cause "<x>" (written by a newer gstack; update this checkout to read it)`

**含义**。某条试运行记录指名了一个本 checkout 不认识的失败原因。它由更新的 gstack 写入。

**修法**。`git pull`（或把你的分支 rebase 到 `main`），然后重跑该命令。

<a id="paid-case-several-owners"></a>
### `--case <id>: registered by <file>, <file>; it needs exactly one`

**含义**。注册该 case 的付费测试文件不止一个，于是 `test-paid-shards.ts --case` 无法挑选文件。

**修法**。直接运行红色分片的文件；报告的 `after a repair:` 行会打印它：`EVALS=1 EVALS_TIER=<tier> bun test <file>`。

<a id="evidence-too-large"></a>
### `evidence: <artifact> too large to fetch (<N> MB)`

**含义**。保存这条红色记录转录的 slice artifact 超过 64 MB，所以 `eval:pass-rates --run` 不下载它。

**修法**。从运行页面下载，或 `gh api repos/<owner>/<repo>/actions/artifacts/<artifact id>/zip > slice.zip`。

<a id="headroom-alarm"></a>
### `[headroom] <case> session <key>: max <s> of <s> (<pct>) over <n> sample(s), above the 85% cap. Cut work in the skill or fixture; budgets are never raised ...`

**含义**。`eval:pass-rates --gate`（周报）发现某个 case 最慢的会话用掉了它所设超时的 85% 以上。它离一次红色只差一个超时。

**修法**。削减技能或 fixture 里的工作量。预算绝不被调高。用 `bun run eval:pass-rates --headroom --case <id>` 检查该 case。

<a id="cost-unknown"></a>
### `cost unknown (no billing captured for any of <N> trial(s))` / `cost $<x> known + <N> of <M> trial(s) cost unknown`

**含义**。部分试运行的成本未被捕获，所以只显示已知的合计。下列情形的试运行成本未知：运行了一个无法计价的 PTY 会话（非密封或恢复的启动、原生 AskUserQuestion 捕获、同一 cwd 产生两份新转录、没有转录或 usage，或模型没有价格行）；一个没有完成任何轮次或模型没有价格行的 Codex 会话；一个没有结果就结束的 `claude -p` 会话；或一个被中止、流式 usage 无法计价的 Agent SDK 会话（没有 usage，或模型没有价格行）。能计价的 PTY 或被中止的 Agent SDK 会话改计其 `streamed_cost_usd`。当没有记录也没有会话可归到某次试运行时它同样未知，例如多 case 分片不带 `cost_case_id` 的显示名记录（单 case 分片的记录属于它的 case）；无模型的 case（`timeline-event-flow`）是已知的 $0。面板试运行（`behavior`、`judge`）只要任何一个会话没有计费就未知——即使它带有已计价的 `streamed_cost_usd`。规则见[失败原因与细节](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#failure-causes)。列车结论的 `ATTEMPT:` 行报告同样的 `cost=$<x> known + <n> of <m> case(s) cost unknown`；仅当列车记录里每个 case 都已计价时才是裸的 `cost=$<x>`，一个都没有时完全不报成本。

**修法**。无需处理；这是说明性信息。

<a id="cause-provider-stall"></a>
### `· cause provider_stall: no stream event for <N>s ...`

**含义**。该会话流式输出了部分消息，然后在一个模型请求进行中、且没有任何工具、权限提示、hook 或子 agent 未完成时，至少 120 秒没有收到任何事件。在 EVAL_POLICY v1 下它仍算失败的试运行。

**修法**。用 `bun run eval:pass-rates --run <run id> --case <id>` 检查它。付费重跑只发生在修复之后。

<a id="overlay-wrong-answer"></a>
### 带有 `taskCorrect: false` 与 `answerError` 的覆盖记录（契约 v4）

**含义**。该试运行以错误答案完成。在覆盖契约 v4 之下，这是对比中一次有效的测量；只有 overlay-ON 的错误答案才让 case 失败。

**修法**。读试运行 JSON 里的 `answerError`。无需重跑。

<a id="detector-corpora-stale"></a>
### `[detector-corpora] <N> stale entries (refresh from a current census when one fails)`

**含义**。部分重放语料条目来自其 case 更早的输入序列。这是说明性信息；语料仍会重放它们。

**修法**。当该 case 在一次普查中变红时，把新的捕获加进它的语料，并用 `bun test test/detector-corpus-<case>.test.ts` 检查。

<a id="auq-substance-panel"></a>
### `recommendation substance median <x> < 4 over samples [<a>,<b>,<c>] (boilerplate/weak)`

**含义**。auq-matrix case 用一个 3 样本评审模型面板为每个捕获问题的建议打分；3 个样本中少于 2 个达到 4，于是中位数低于 4。

**修法**。读日志样本与捕获的问题。修复应落在技能文本里，随后做一次 auq-matrix 诊断运行。

---

## 推送守卫（脱敏）

<a id="redact-postgres-default-pair"></a>
### `db.url_with_password` HIGH on a default `postgres`/`postgres` login whose host is a service name like `@db` (pre-push BLOCKED)

**含义**。默认的 `postgres:postgres` 组合只在 `localhost` 或 `127.0.0.1` 上豁免。像 `@db` 这样的服务名说明不了 URL 最终部署在哪里，所以仍然阻断。

**修法**。在本地与 CI 配置里使用 `postgres://postgres:postgres@localhost:5432/...`，或从环境变量读取 URL。若凭据是真的，轮换它。单次绕过：`GSTACK_REDACT_PREPUSH=skip git push`。若该 URL 是经过评审、公开的仅开发用途值，把它列进[`.gstack-redact-allowlist`](#redact-allowlist)。

<a id="redact-allowlist"></a>
### `.gstack-redact-allowlist (<n> entries) suppressed <m> finding(s) in this push`

**含义**。被推送的提交在仓库根带有 `.gstack-redact-allowlist`。每一行（去除首尾空白后；`#` 开头为注释）是一个精确的匹配区间：`db.url_with_password` 对应整个 `postgres://USER:PASSWORD@host:port` URL，键模式对应键本身，`pii.email` 对应地址。只有当发现的匹配文本与某条目完全相等时才被抑制，所以只有密码、子串或另一个键仍然会报告并阻断。hook 从每个被推送的提交读取该文件，绝不读工作树，并忽略超过 64 KiB 的文件。每次携带条目的推送都会打印这一行以及每个被抑制发现的文件与行号。它与 `gstack.redact.allowEmail` 并存，后者仍是本地设置。

**修法**。若列出的每个抑制都是评审过的值，无需处理。删除不再适用的条目；轮换真实的凭据。

<a id="redact-version-as-ip"></a>
### `pii.ip_public` MEDIUM on a four-part version number

**含义**。该行没有把值声明为版本号。当文本从仓库内部经过 `gstack-post` 时，等于根 `VERSION` 或 `## [x.y.z.w]` / `## vx.y.z.w` CHANGELOG.md 标题的四段版本号在哪里出现都豁免，所以在那里该发现表示这个四元组不是本仓库的发布版本（或该帖子发在 checkout 之外）。

**修法**。写成 `version: 1.2.3.4`、`"version": "..."` 或 `v1.2.3.4`。紧跟 `gstack` 之后命名的 gstack 发布（`gstack 1.94.4.0`，安装检查的 `gstack: ok 1.94.4.0 for=ship`）同样豁免，但仅限主版本 0 到 2。MEDIUM 发现不阻断推送。

<a id="redact-run-id-as-phone"></a>
### `pii.phone.e164` MEDIUM on a receipt token or a GitHub Actions run id

**含义**。全数字标识符会被读成电话号码：恰好全为数字的 12 位十六进制回执 sha（`tree`、`head`、`gated_tree` 或 `predecessor` 的值），或写在 `gstack-post` 无法与普通数字区分之处的 11 位 GitHub Actions 运行 id。`gstack-post` 只对它在这些位置找到的精确 token 做白名单：

- 紧跟在 `tree`、`gated_tree`、`head` 或 `predecessor` 之后、以 `=` 或空格相连的 12 位值（`tree=704992822996`、`tree 704992822996`）；
- 紧跟在 `review_loop_grant` 或 `review_loop_exception` 之后、以空格、`=` 或 `:` 相连的全数字 sha（`review_loop_grant 367120488513`），使所有者经 `gstack-approvals add` 的授权记录得以通过。扫描器本身豁免它（`lib/redact-patterns.ts` 的 `isReviewLoopSha`），且只有那个位置算数：同样的数字出现在别处，或 token 之后带 `+`、空格或横线的号码，仍会报告；
- `/actions/runs/<id>` URL 之内或作为该链接文字的 11 位 id；
- 当 `actions/runs/` 位于行首或跟在空白、`/`、`(`、`[`、`<` 或引号之后时，带或不带主机的 `actions/runs/<id>` 路径里的任何 id（`see actions/runs/41629861820`；`sales-actions/runs/…` 不算），以及 CI carry 或 run clear 打印的 `runs=<id>/<attempt>` 列表里的每个 11 或 12 位 id（`runs=41629861819/1,41629861820/2`；`run=` 同理）。扫描器本身对两者豁免（`isCiRunIdentifier`），且只有该形状算数：每个 id 都要带一到三位数字的 `/<attempt>`，所以 `runs=4155550123`、`runs=4155550123/1`、`runs=+14155550123/1` 以及行内其他位置的电话号码仍会报告（GST-1227）；
- 同一行紧跟运行词之后、中间可带 `:`、`#` 或 `=` 的 11 位 id：运行词为 `run`、`runs`、`screen`、`screens`、`gate`、`gates`、`backstop`、`bisect`、`rerun`、`dispatched`、`dispatch`、`failed`、`passed`（`failed 40269992077 | rerun passed 40287239206`、`gate 40323989742`、`run #19368712345`）；`id`、`job`、`attempt`、`workflow` 这类泛词什么也不豁免。该位置在扫描器本身中豁免（`lib/redact-patterns.ts` 的 `isCiRunIdentifier`），所以 `gstack-approvals add`、`gstack-decision-trail` 与预门禁密钥检查也接受它，不只是 `gstack-post`。紧跟运行词之后、不带 `+` 写出的国家号码在那里会被读成运行 id；这是"运行 id 不是电话号码"这一裁定所接受的残留；
- 经 `, `、` and `、` & `、` or ` 或 `、` 链接在被豁免 id 之后的每个 11 位 id，中间可带 `(#1234)`（`screen 40269992077 (#3434) and 40275443393 (#3453)`）。

不带任何上述上下文的裸 11 位数字、10 位国家号码以及 E.164 的 `+14155551234` 仍会报告，所以该发现意味着 id 孤立出现、没有运行词（`the id is 40269992077`、`40269992077 failed`），或跟在一个非运行词之后（`see 40323989742`）。

另外，扫描器会跳过恰好是 2 的幂（2^30 到 2^49）、比这样的幂小一、或十一个 32 位哈希与 PRNG 常量之一的裸数字（Knuth 乘法哈希、黄金比例常数、glibc 与 Numerical Recipes 的 LCG、FNV-1a、MurmurHash2 与 3、MT19937 种子器、最大 32 位素数；`lib/redact-patterns.ts` 的 `isNumericConstant`）。只有不带分隔符的精确数字豁免：同样的数字带 `+`、空格、横线、点或括号仍会报告。

**修法**。把 id 写在运行词旁边（`run 40269992077`）或写成 `/actions/runs/` 链接。其他情况，用拒绝所打印的 `TOKEN:` 行以 `--confirm <token>` 重跑；MEDIUM 发现不阻断推送。

<a id="gstack-post-pr-body-merge"></a>
### `gstack-post pr-body` kept sections the body file did not contain

**含义**。`pr-body` 按 `## ` 小节把文件合并进 PR 当前正文，而不是覆盖：文件中的小节替换同名小节（标题大小写不敏感比较），````gstack-ship-receipt```` 块自成一个小节，所以回执重写只替换回执，文件未重写的小节留在原地，新小节追加在其后。当文件是一份完整帖子时，第一个 `## ` 标题之上的文本属于文件：如 /ship 组合的、位于其第一个 `## ` 小节之上的回执块。此时当前回执与第一个标题之间的任何行都会被文件自己回执之下的文本替换，文件没有则被丢弃。第一份回执或标题之上的开头文本（一段话、机器人的徽标如 `<!-- capy-badge:start -->…<!-- capy-badge:end -->`，或没有 `## ` 标题时的整个正文）逐字节保留，新回执落在它正下方；只有文件自己带来的开头行才会替换它（GST-1227）。在其第一份回执或标题之后结束正文的 Capy 徽标（`<!-- capy-badge:start -->` 到 `<!-- capy-badge:end -->`，在代码围栏之外，其后只有空行）自成一块：其上方小节被重写时它留在末尾，新小节放在它上方，只有文件带来的徽标排在最后且只出现一次。其余所有标记块、后面带文字的徽标以及未闭合的徽标标记都留在它们所在的小节里。部分帖子（`## ` 小节之上没有回执，如车道发 `## Screenshots`）与没有 `## ` 小节的文件（只有回执或只有文本的帖子）不动那些文本，所以人工引言或回执下的 `Review-loop exception:` 行得以保留。一行 stderr 说明替换、保留、新增与丢弃了什么——被丢弃的块带其第一行，或当脱敏扫描标记它时略去该行（`gstack-post: pr-body merged by section: replaced ship receipt, What changed; kept leading text, Why; added Tests; dropped trailing text ("Old note under the receipt")`）。因此只含第一个小节的正文文件不会再抹掉 PR 的其余部分，过期备注也不会再留在新回执下面。要撤下旧引言，用 `--replace` 发整个正文，或带来新的开头行。脱敏扫描在合并后的字节上运行，所以 MEDIUM 或 HIGH 发现可能来自被保留的小节；`RULE:` 行的 `LINE:` 在合并后的文本里。当前正文读不出来时（`gh pr view --json body` 失败）什么都不发，退出码 3。当前正文中某标题被文件重写多次（如 gstack-evals#19 那样，早先的描述粘在新标题之下的 `---` 后面）时，文件的小节匹配不到唯一副本，于是什么都不发，退出码 64：`gstack-post: the PR's current body holds "What changed" more than once, so the file's copy matches no single section; nothing was posted. Rerun with --replace and the whole body`。合并会替换其中一份而把过期的另一份留在旁边。

**修法**。若保留的小节正是想要的，无需处理。要用文件覆盖整个正文，加 `--replace` 重跑。要丢弃某个小节，用 `--replace` 发正文或在托管方编辑。对重复标题拒绝，写出你想要的完整正文（若早先的描述应保留，就给它一个自己的标题，如 `## Original description`），并用 `--replace` 发送。

<a id="redact-prepush-email"></a>
### `MEDIUM  pii.email  <file>:<line>`（来自 pre-push hook）

**含义**。推送的行新增了一个既不是你的、也不在目标提交元数据里的电子邮件地址。该 hook 不报告你自己的地址（`git config user.email`）、列在 `gstack.redact.allowEmail` 里的地址，以及被推送提交的历史、被替换的远端尖端的历史，以及（对推送到已配置远端的新分支）该远端跟踪引用的历史中的作者与提交者地址（含 mailmap）。只有另一个远端才知道的地址仍会报告。如果 hook 还打印了 `existing-email suppression was limited for this push`，说明它没能在 5 秒内读完历史，已知作者也可能被列出。

package@version 风格的带 `@` 文件名不是地址，绝不报告：`@` 之后的部分是版本或 tag（一个无点标签或点分版本，绝不是域名）后跟没有任何顶级域名使用的扩展名，或全数字点分版本后跟兼作顶级域名的扩展名（`lib/redact-patterns.ts` 的 `looksLikeAtFilename`）。以真实地址命名的文件、全数字域名上的地址、以及顶级域名兼作文件扩展名的地址仍会报告。

**修法**。移除该地址，或为本仓库放行：`git config --add gstack.redact.allowEmail <address>`。若它是你自己的地址，检查 `git config user.email`。该白名单只覆盖 `pii.email`；它绝不会放行 HIGH 发现。

## 无人值守运行与产物

工作流命令（`gstack-artifact`、`gstack-gate`、`gstack-autoplan-timing`、
`gstack-review-log --findings`）的每条错误行以括号中的代码结尾，例如 `(ARTIFACT_STALE)`。代码与锚点来自 `lib/result-codes.ts`；grep 代码，不要 grep 文字。这类命令共享同一张退出码表：`0` 成功，`1` 失败，`2` 用法错误，`3` 被拒绝或缺少 flag。产物契约本身见 [docs/unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md)。

<a id="artifact-invalid-json"></a>
### `ARTIFACT_INVALID_JSON`

**含义**。`run.json`、`timing.json` 或其他 JSON 产物解析失败。

**修法**。用写入它的工具重新生成该运行。清单绝不手改；写了一半说明写入方被打断。

<a id="artifact-unsupported-version"></a>
### `ARTIFACT_UNSUPPORTED_VERSION`

**含义**。产物的 `schema_version` 是本 gstack 不读取的版本（`gstack-artifact schema <name>` 打印其校验的版本）。

**修法**。升级读取方（`/gstack-upgrade`），或用本版 gstack 重新生成该运行。

<a id="artifact-schema"></a>
### `ARTIFACT_SCHEMA`

**含义**。必需字段缺失、类型错误、或取值超出枚举。消息点名文件、行与字段。

**修法**。对照 `gstack-artifact schema <name>` 检查该行并重新生成。

<a id="artifact-missing"></a>
### `ARTIFACT_MISSING`

**含义**。`run.json` 点名的产物不在运行目录里。

**修法**。复制整个运行目录，不要只拷单个文件。文件从未被写过的话，重跑写它的那个阶段。

<a id="artifact-stale"></a>
### `ARTIFACT_STALE`

**含义**。文件的字节哈希不再等于 `run.json` 记录的值，清单描述的不是这份文件。

**修法**。把该运行视为被部分改写过。重新生成，或经写入它的工具重新绑定该文件、让清单随之更新。

<a id="artifact-path-escape"></a>
### `ARTIFACT_PATH_ESCAPE`

**含义**。某产物路径解析到了运行目录之外：`..` 段、绝对路径、或指向别处的符号链接。

**修法**。所有产物都放在运行目录内、用纯相对名。运行目录作为整体复制；目录外没有任何东西属于契约。

<a id="artifact-malformed-jsonl"></a>
### `ARTIFACT_MALFORMED_JSONL`

**含义**。JSONL 产物有一行（通常是最后一行）不是单个 JSON 对象。写入方在追加中途被打断。

**修法**。重跑写该文件的阶段。不要手工裁掉那行：那一行的内容反正已丢，清单哈希也会变。

<a id="artifact-duplicate-id"></a>
### `ARTIFACT_DUPLICATE_ID`

**含义**。同一文件里两行共用一个 id。

**修法**。id 与运行绑定（`<run>-...`）且每文件唯一。用分配 id 的工具重新生成这些行。

<a id="artifact-unbound-id"></a>
### `ARTIFACT_UNBOUND_ID`

**含义**。某行 id 不以 `run.json` 的运行 id 开头，可能属于别的运行。

**修法**。用本次运行的 id 重新生成该行。

<a id="artifact-dangling-ref"></a>
### `ARTIFACT_DANGLING_REF`

**含义**。任务的 `findings`、`blocked_by` 或 `depends_on`，或决策的引用，点名了本次运行没有任何产物定义的 id。

**修法**。先写被引用的发现、决策或任务，或删掉引用。`depends_on` 条目也可以指向文件里另一个任务带的 `pr` 标签。

<a id="artifact-dependency-cycle"></a>
### `ARTIFACT_DEPENDENCY_CYCLE`

**含义**。任务互相依赖成环，任何车道都无法启动。

**修法**。打断 `depends_on` 里的环。消息列出环上的 id。

<a id="artifact-count-mismatch"></a>
### `ARTIFACT_COUNT_MISMATCH`

**含义**。`run.json` 里某项 `counts` 与其汇总文件的行数不一致（例如 `counts.findings: 65` 旁只有 64 行）。

**修法**。最后一行写完后重新生成 `run.json`。计数从不替代文件；哈希与行才是记录。

<a id="artifact-run-interrupted"></a>
### `ARTIFACT_RUN_INTERRUPTED`

**含义**。`run.json.status` 不是终态，或某路声音仍是 `running`/`pending`。产物描述的是一次未完成的运行。

**修法**。续跑（`gstack-autoplan resume --out <dir>`，PR B-runner），或按部分产物消费并如实说明。

<a id="artifact-reviewer-missing"></a>
### `ARTIFACT_REVIEWER_MISSING`

**含义**。`required_phases` 里的某阶段在 `phases` 中缺席；某路声音没有终态；或已完成的声音在 `artifacts` 里没有绑定的输出文件（路径与哈希）。

**修法**。完成该阶段。缺席的声音就是缺席的覆盖；校验器绝不代填 N/A。

<a id="artifact-guard-line-missing"></a>
### `ARTIFACT_GUARD_LINE_MISSING`

**含义**。运行声明 `session_kind: unattended`，但其 `review-record.md` 没带 `GUARD_NOT_INSTALLED` 行，记录没有说明发布顺序未经校验。

**修法**。经 `gstack-skill-start` 启动运行（它会打印该行），并把该行保留在评审记录里。

<a id="guard-not-installed"></a>
### `autoplan guard: not enforced by this host; publication order is unverified (GUARD_NOT_INSTALLED)`

**含义**。autoplan 发布钩子只在 Claude Code 内执行。其他所有宿主上、以及每个 `unattended` 会话里，钩子存在但从不运行，阶段发布顺序靠的是每阶段记录的快照哈希，而不是 guard。

**修法**。本宿主无需做什么。该行每次运行打印一次、归入评审记录；无人值守运行的 `gstack-artifact validate` 要求它存在。在 Claude Code 上，钩子文件*缺失*时照样拒绝每个受守卫的调用（损坏的安装不得冒充不存在的安装）。

<a id="review-status-mismatch"></a>
### `review-log: status mismatch ... (REVIEW_STATUS_MISMATCH)`

**含义**。交给 `gstack-review-log` 的行声称的 `status`、`unresolved`、`issues_found` 或 `critical_gaps` 与 `--findings` 文件矛盾（例如 `status: clean` 旁边摆着未解决的发现）。该行未写入。

**修法**。修 findings 文件，不是修声称，然后重新记录。省略声称的字段，让行从文件推导。

<a id="gate-rev-stale"></a>
### `GATE_REV_STALE`

**含义**。回复点名的 `gate_rev` 比门禁清单当前修订旧，回答的可能已是被改过的条目。

**修法**。渲染当前清单（`gstack-gate render <file>`），读它，用打印出的 `gate_rev` 回复。

<a id="gate-reply-unparsed"></a>
### `GATE_REPLY_UNPARSED`

**含义**。回复中有一部分匹配不到任何门禁条目或选项。没有应用任何东西；未解析的 token 已列出。

**修法**。回复 `rec`（别名 `all`）、`rec except <tokens>`、`<id><option>` token（`d3b uc1a`）或 `as-is`（按原样通过计划）。光秃的 `yes` 或 `no` 在多选项条目上有歧义，绝不猜测。

<a id="answer-by-required"></a>
### `ANSWER_BY_REQUIRED`

**含义**。`gstack-autoplan answer` 在无人值守运行里没带 `--by`，或取值既非 `human` 也非 `agent:<id>`。产物必须说明是谁回答了门禁：否则所有者亲手敲 token 与 agent 转达或代决在 `decisions.jsonl` 里看起来一模一样。没有应用任何东西。

**修法**。所有者亲手敲的用 `--by human` 重跑；agent 转达或代决的用 `--by agent:<thread 或 id>`。该值作为 `answered_by` 记在这条回复对应的每个决策行以及评审记录的门禁行上。

## 队列感知发布：策略、重打戳、树回执、ship 回执

`gstack-ship-policy`、`gstack-restamp`、`gstack-tree-receipt`、
`gstack-ship-receipt` 与 `gstack-evidence bundle|ancestor` 共享上方的退出码表，每条错误行以括号中的代码结尾。策略文件见 [docs/ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md)；队列流程见 [docs/ship-policy.md#stamp-at-merge](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#stamp-at-merge)。

<a id="route-bounded-refused"></a>
### `ROUTE_BOUNDED_REFUSED: <path> <reason> (fix: …)`

**含义**。`gstack-ship-release finish` 发现一处有界类型的评审后编辑（审计文字、`.gstack/pregate.json` 车道变更、或声明的簿记文件）未通过其某项证明，该路径仍属行为变更，finish 在第 5–11.5 步停下（[review-policy.md#bounded-post-review-edits](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md#bounded-post-review-edits)）。原因点名失败的证明：`needs --reviewed-base`；`changed <n> lines since review (at most 20)`；`is binary or unreadable`；`carries a hunk the gate scan tagged`；`could not be gate-scanned`；`is not a doc the Step 14.5 audit snapshot recorded`；`is not the bytes the post-audit snapshot recorded (edited after the audit)`；`does not parse at both the reviewed and the current tree`；`loosens the reviewed policy: <what>`；`changes <key>; a lanes edit changes only dependencies`；`adds no lane`；或 `is a gate path or under .gstack/ or .github/, never bookkeeping`。

**修法**。照行的 `fix:` 所说做。带上与被评审树一起保存的合并基点重跑 finish。恢复被审计的字节，或车道变更删掉的映射（`[]` 声明先落在基础分支）。或为该编辑走第 5–11.5 步。绝不为了钻上限把编辑的行挪进另一个文件。

<a id="policy-source-unavailable"></a>
### `policy source unavailable — fix: git fetch origin <base> --depth=1 (POLICY_SOURCE_UNAVAILABLE)`

**含义**。策略从 `origin/<base>` 上提交的拷贝读取，而该 ref 在本地解析不了（浅克隆或分离的门禁检出，或从未 fetch）。工具以退出码 3 结束，绝不静默回退到工作树文件。对 `gstack-pregate`，同一拒绝还覆盖 git 读不了的基础分支 `.gstack/pregate.json`（超时、超大 blob、对象缺失或损坏）且 `git ls-tree` 无法确认其不存在——它绝不落到用户自有文件。Bun 从工作目录加载了 `.env` 时（裸 `bun gstack-pregate`）也拒绝——分支可能借此选中用户策略：直接跑 `gstack-pregate` 或用 `bun --no-env-file`。列车策略下的 `gstack-ship-queue ready` 先 fetch `origin/<base>`，fetch 失败即以此码拒绝并引用 git 的错误。`gstack-restamp` 的 `stamp_paths` 阶段在区分基础分支新增行与分支自有行的 diff 跑不了时同样拒绝（`cannot diff <since>..<base> for the stamp_paths stage (<git 的第一行 stderr>); nothing written`）——空 diff 会被读成"基础分支什么都没加"，再次搬动基础分支的行。

**修法**。`git fetch origin <base> --depth=1` 后重跑。要有意针对分支自己的文件运行，传 `--policy-from head --allow-repo-commands`；回执会写 `policy: head (unreviewed)`。

`--base` 点名 `origin` 上的分支。提交 SHA、标签或其他远程的 ref（fork 克隆里的 `upstream/main`）永远解析不成 `origin/<base>`，fetch 也造不出那个 ref，所以传一个 `origin` 上真实存在的分支（`git branch -r --list 'origin/*'` 可列出）。`gstack-pregate` 会在修法里直说，而不是建议 fetch。

<a id="history-read-failed"></a>
### `cannot read <path> at <ref>. <cause> (git version <v>). Fix: see docs/troubleshooting.md#history-read-failed (HISTORY_READ_FAILED)`

**含义**。CI 作业或本地发布工具读取旧提交上的文件而 git 产出不了。PR 与列车路径的作业（免费测试的 plan、Version Gate、E2E Evals 的 route/screen 摘要/planner/slices/重跑/二分/report）检出的是 blobless 克隆（`filter: blob:none`）：提交与树都在，旧文件的内容在首次读取时才从 GitHub 拉取。该 fetch 三次失败（GitHub 故障、网络中断）或 ref 根本解析不了时，读取就地失败，而不是计作"文件不存在"。提交确实没有的文件照旧读作不存在，一如从前。基础分支没有 ship 策略就没有列车；没有 VERSION 就是 `0.0.0.0`。route 与后盾策略读取（内联在各工作流里）、`.github/scripts/history-read.sh`（Version Gate 的基础 `VERSION`）与 `lib/history-read.ts`（Version Gate 的列车分类）打印本行。`git fetch origin <base>` 三次失败时 Version Gate 打印同一代码。`gstack-restamp` 与 `gstack-ship-queue land` 读不到基础分支 CHANGELOG（片段检查的对照物，`lib/changelog-fragments.ts` 经 `lib/history-read.ts` 读取）时也打印；部分克隆之外它们不重试。

**修法**。GitHub 可达后重跑失败的作业。健康网络下仍以同样方式失败，检查 ref 在 `origin` 上存在、且 runner 的 git 支持部分克隆（`git --version` 2.22+；评测镜像在 `.github/docker/Dockerfile.ci` 构建期断言）。本地工具则跑 `git fetch origin <base>` 后重跑。

<a id="policy-invalid"></a>
### `POLICY_INVALID`

**含义**。`.gstack/ship-policy.json` 有未知键、类型错误、或取值超出枚举。消息点名键。未知键按错误处理，拼写错误绝不会静默变成"默认值"。

**修法**。`gstack-ship-policy validate` 列出全部问题；`gstack-ship-policy init --explain` 打印每个键的含义与默认值。

<a id="policy-containment"></a>
### `POLICY_CONTAINMENT`

**含义**。仓库可控的输入越过了它的盒子：`stamp_paths`、`release_outputs`、`changelog` 或 `mirror` 里出现绝对路径或 `..` 段；glob 展开超过 512 个正则字符；清单超过 64 项；`release_tool` 超过 512 字符或含换行。写入时同一代码还会点名一个经符号链接解析到仓库之外的命中文件。

**修法**。路径保持仓库相对、glob 简短、清单精简。mirror 可以 `..` 开头（兄弟检出）但不得含内部的 `..`。

<a id="policy-exists"></a>
### `POLICY_EXISTS`

**含义**。`gstack-ship-policy init` 发现已有策略文件，什么都没写。

**修法**。编辑现有文件，或传 `--force` 用示例替换。

<a id="repo-commands-not-allowed"></a>
### `repo commands not executed (pass --allow-repo-commands) (REPO_COMMANDS_NOT_ALLOWED)`

**含义**。策略声明了命令（`release_tool`；或陈旧基础分支上 `gstack-ship-queue land --pin` 的 `land.merged_checks`），而工具在未获同意下运行。文件存在绝不构成执行授权：`/ship` 与 `/land-and-deploy` 之外，仓库声明的命令只在 `--allow-repo-commands` 下运行。命令已列出；没有写入或合并任何东西。

**修法**。确实要执行仓库代码时传 `--allow-repo-commands`（跑它的测试时你已经在这么做了），或放弃该发布工具。

<a id="queue-stale"></a>
### `QUEUE_STALE`

**含义**。`gstack-restamp` 被告知了分配所假设的基础 SHA（`--expect-base`）或合并顺序（`--expect-order`），而其中之一移动了：基础分支前进；某前序未合并；或某后继先合并了。`--expect-order` 先列车道的自有 PR（`--pr`）、再列其余顺序；漏掉它的清单会把每个条目都读成未合并前序，消息会说明。JSON 结果带 `expected`、`actual` 与 `recompute`。

**修法**。跑打印出的 `recompute` 命令：它携带修正后的顺序（本 PR 在前；已合并的剔除；未合并的前序因必须先合并而保持在前的），并从当前基础分支重算版本；然后带着服务端 head 条件合并（`MERGE_CONDITION: sha=<head>`）。GitHub 视为已合并而本地基础分支还没有的前序（`#<pr>=merged-not-in-base`）同样保持在前的，修法是 `git fetch origin <base>`：先 fetch 再重跑，重算钉定在本地基础分支上，绝不会分配前序已经拿走的版本。

<a id="restamp-version-source"></a>
### `RESTAMP_VERSION_SOURCE`

**含义**。配置的版本来源（`VERSION`、`.gstack/version-path`）在基础修订或分支上缺席、有歧义或损坏——没有可升的版本。

**修法**。在基础分支创建 `VERSION`，或在 `.gstack/version-path` 钉定清单路径。gstack 绝不代之以 `0.0.0.0`。

<a id="restamp-merge-conflict"></a>
### `RESTAMP_MERGE_CONFLICT`

**含义**。`--after <pr>` 在一次性 worktree 里构建分支与前序 head 的合并，而该合并冲突。分支未被触碰。

**修法**。按 `/ship` 第 3 步的冲突规则把前序（或基础分支，待其合并后）合进分支，再跑 `--after`。

<a id="restamp-release-tool-failed"></a>
### `RESTAMP_RELEASE_TOOL_FAILED`

**含义**。策略的 `release_tool` 在暂存 worktree 里非零退出。分支未被写入；日志记录了该阶段。

**修法**。在仓库里手动跑该工具、修好它，然后重跑 `gstack-restamp`。

<a id="restamp-output-outside-allowed"></a>
### `RESTAMP_OUTPUT_OUTSIDE_ALLOWED`

**含义**。发布工具改动了允许输出集之外的路径（版本文件、lockfile、CHANGELOG、`stamp_paths` 与 `release_outputs`）。重打戳在向分支写任何东西之前拒绝。

**修法**。确属合法生成产物时，在基础分支把该路径加进 `release_outputs`；或阻止工具写它。

<a id="restamp-conflict"></a>
### `RESTAMP_CONFLICT`

**含义**。应用或回滚时，某文件不再持有日志记录的字节（阶段跑完之后有人编辑过它）。覆盖会丢掉那次编辑，重打戳停手。

`cannot fingerprint the working tree (<detail>); nothing written` 是同一代码在暂存任何东西之前的形态：`gstack-wtree exited <n>: <reason>` 带着辅助程序自己的修复建议（例如可写的 `TMPDIR`）；`gstack-wtree could not start: ...` 是 Windows bash 查找失败（见[`BASH_UNAVAILABLE`](#bash-unavailable)）。

**修法**。读 `.gstack/tmp/restamp-journal.json`，手工对账点名的文件，然后重跑 `gstack-restamp`（幂等：完整打戳是空操作）。

<a id="restamp-predecessor-moved"></a>
### `PREDECESSOR MOVED <old> -> <new> — fix: gstack-restamp --after <pr> again (RESTAMP_PREDECESSOR_MOVED)`

**含义**。门禁跑在针对某前序 head 构建的合成树上，而那已不是该 PR 的 head——被门禁的树不是将要合并的树。回执拒绝 `gate-reuse: eligible`。

**修法**。再跑 `gstack-restamp --after <pr>`，门禁新的合成树，重读回执。

<a id="changelog-duplicate-heading"></a>
### `CHANGELOG_DUPLICATE_HEADING`

**含义**。两个小节共用一个版本标题，通常是打戳在已有版本的条目旁把 `[Unreleased]` 重新加了标题。`gstack-restamp` 只计 PR 引入的重复：标题对照两份 CHANGELOG 读取——`origin/<base>` 处的，与分支自有行计数所依据的提交（其分叉点，gate-ahead 打戳时为前序 head）处的；每个标题取较大计数，所以基础分支已经重复两次的版本（PR 继承且必须保留的已发布历史）只要 PR 不再加副本就放行。读取不可用时（PR 自己新增了 CHANGELOG，或文件挪过），阶段 detail 与拒绝会点名：完全没有读取时每个重复都计；否则继承的标题只在可读的提交处计。两条路保持严格规则：正被重新加标题的小节本身（`[Unreleased]`，或分支更早的打戳）只能存在一份；`gstack-version-bump write --changelog`（开工时的认领式升版）拿文件与它自身比较。

**修法**。把 PR 引入的重复小节合并成新版本下的一个条目。基础分支本身就有的重复不是本 PR 在重打戳里该修的；留着它，打戳照常进行。

<a id="changelog-top-mismatch"></a>
### `CHANGELOG_TOP_MISMATCH`

**含义**。打戳之后，首个条目的标题不是 `VERSION` 里的版本。

**修法**。`gstack-restamp` 会把 PR 的小节挪到顶部；手工编辑撤销了它就修标题或重跑重打戳。

<a id="changelog-section-missing"></a>
### `CHANGELOG_SECTION_MISSING`

**含义**。CHANGELOG 既没有 `[Unreleased]` 小节、也没有以分支当前所打戳版本为标题的小节——没有可重新加标题的东西。

**修法**。stamp-at-merge 之下，把 PR 的条目写在 `## [Unreleased]` 下；重打戳会把它变成 `## [<version>] - <date>`。

<a id="gate-reuse-not-eligible"></a>
### `gate-reuse: not-eligible (<what changed>) — fix: <rerun command> (GATE_REUSE_NOT_ELIGIBLE)`

**含义**。树身份单方面不构成门禁证据。回执把被门禁的身份（除打戳外的树、运行时钉定、lockfile 哈希、CI 工作流哈希、门禁命令哈希、实际执行的选组、runner 镜像）与当前身份比较，点名差异；或点名必须在最终树上重跑的打戳敏感门禁。

**修法**。用打印的命令在打戳树上重跑点名的车道；或在 `/ship` 里传 `--force-gate <reason>` 重跑完整门禁。

<a id="evidence-identity-unknown"></a>
### `EVIDENCE_IDENTITY_UNKNOWN`

**含义**。bundle（或台账记录）缺已提交树 id、运行时版本、lockfile 哈希或命令哈希——任何复用决策都不能以它为据。未经核验的导入断言同样算未知。git 产出不了被门禁 head 与当前 head 之间的 diff（对象缺失、超时）时，`gstack-tree-receipt` 也以此码失败：错误点名 git 的原因，失败的 diff 绝不读作"无变更"。

**修法**。车道在已提交 head 上跑完后，在门禁机上重建 bundle：`gstack-evidence bundle --out <file> --label <lane>...`。树回执的，修好 git 原因点名的问题（用 `git fetch origin <sha>` 拉缺失的 head），再重跑。

<a id="evidence-bundle-invalid"></a>
### `EVIDENCE_BUNDLE_INVALID`

**含义**。bundle 不是合法 JSON，或不是 `gstack-evidence-bundle` v1。

**修法**。用 `gstack-evidence bundle` 重建；bundle 绝不手改。

<a id="preregistration-not-ancestor"></a>
### `PREREGISTRATION_NOT_ANCESTOR`

**含义**。策略里的某条 `preregistration_shas` 不是 HEAD 的祖先，预注册的评测描述不了本分支。

**修法**。合并或 rebase 让该提交进入分支历史；或在基础分支移除该条目。`gstack-evidence ancestor <sha>...` 每条目打印一行；ship 回执记录结果。

<a id="history-policy-violation"></a>
### `HISTORY_POLICY_VIOLATION`

**含义**。策略声明 `history: merge-only` 而计划要 squash、rebase 或以其他方式改写分支：`gstack-ship-policy check-history --plan squash|rebase` 在任何东西移动之前拒绝（退出码 3）；不带 `--plan` 时，已推送分支不再是 HEAD 祖先即报告违规（退出码 1）。

**修法**。`git merge origin/<base>` 并保留每个提交；用合并提交合入 PR。

<a id="receipt-missing"></a>
### `RECEIPT_MISSING`

**含义**。`gstack-ship-receipt read --pr <n>` 在 PR 正文里找不到 ```` ```gstack-ship-receipt ```` 块。

**修法**。`/ship` 第 18 步会写它（`gstack-ship-receipt write ... --pr <n>`）；更老的 PR 用同一命令手工补写一次。

<a id="receipt-invalid"></a>
### `RECEIPT_INVALID`

**含义**。块存在但过不了 `ship-receipt` schema 校验（`gstack-artifact schema ship-receipt`）。`--head` 不是检出的 HEAD 时，`gstack-ship-receipt write` 也以此码拒绝且什么都不写：回执绑定评审读过的树。head 碰了 money/gate/auth/secret 代码而没有 done 的定向记录覆盖那些类别时（`REVIEW_TARGETED: … verdict=missing|failed`）同样拒绝；`--review-targeted` 点名的读取提交不是 HEAD 祖先、其后又有变更带上定向类别（定向评审读过之后 money/gate/auth/secret 代码变了，含门禁扫描标记的测试编辑）；或其产品补丁不是回执的、且其后的变更超出纯文档——都一样拒绝。读取之后的纯文档变更要继承记录，须不改任何二进制文件、不加任何数字论断、不碰 results/prereg/eval 路径、不点名 money/security/secret/auth 话题；任何其他文档变更都要重新跑读取方（GST-1195）。

**修法**。用 `gstack-ship-receipt write` 重新生成；绝不手改块。`--head` 拒绝的，检出那个提交再写。定向拒绝的，在 HEAD 上跑定向评审、`gstack-review-dispatch verify --targeted-out .gstack/tmp/targeted.json`，再带 `--review-targeted @.gstack/tmp/targeted.json` 重写。

**`field=review_exclude`**。回执的 review_exclude 摘要（或 `--review-exclude <digest>` 写入参数）不是 HEAD 在基础策略 [`review_exclude_paths`](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#review-exclude-paths) 下应有的摘要时，`gstack-ship-receipt write` 与队列的回执检查同样以此码拒绝。行内点名 `expected=`（现在）、`recorded=`（`--review-exclude` 参数，或回执据其记录的摘要；没有则 `none`）与 `source=`（基础提交）。失配只证明该参数与 head 现在的选组不同。write 只比较参数、不读评审台账，所以这一行说明不了评审者读过什么；通过 `expected=` 摘要的 write 会不经评审清掉该字段——别那么干。在 head 上重跑 `/ship` 的评审（`gstack-review-dispatch pass --base <base>`），跑 `gstack-review-dispatch verify --ledger <ledger>`（从评审者拿到的简报打印 `REVIEW_EXCLUDE_RECORD: digest=<d>`），然后 `gstack-ship-receipt write --pr <n> --review-exclude <d> --body <body>`。`recorded=none` 带 `no --review-exclude was given` 注记表示 write 少了 flag：传 verify 打印的摘要。评审之后仅第 14.5 步的文档审计在某个模式下编辑/增/删了文件时，传该次运行的 `--docs-post <audit-id>-post.json` 及其 Prepare 快照作 `--docs-pre`，不必重跑评审；不适用时拒绝信息里 `the docs-audit exception does not apply:` 子句会说明原因（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#review-exclude-paths)，GST-1429）。

write、carry 与队列在「记录的选组与 HEAD 的选组给 PR 的文件相同的适用模式、排除文件与保留文件」（GST-1434、GST-1446）时，接受有差异的摘要（`recorded=none`、在基础分支还没有 `review_exclude_paths` 时写的、或来自更旧策略的摘要）。write 绑定时会从基础分支曾持有的策略重建记录选组并打印 `REVIEW_EXCLUDE_POLICY_MOVED:`。所以这一行意味着两个选组在 PR 的文件上不同，或 write 无法从基础分支曾持有的任何策略重建摘要（基础分支的浅克隆可能导致：fetch 其历史后重跑 write）。

<a id="review-diff-too-large"></a>
### `REVIEW_DIFF_TOO_LARGE`

**含义**。某评审者的 diff 超过 2,000,000 字节的评审上限（约 500K token）。`gstack-review-dispatch pass`、`stage` 与 `render` 在写任何东西前各读一次评审者的 diff，宁可停止（退出码 3、什么都不写）也不把读不完的东西交给评审者。行内点名评审者、其字节数、最大的五个顶层目录（`top=<dir>:<bytes>`）与基础策略提交。

**修法**。行内按基础策略现状打印修法：

- **没有键**：把打印的 JSON（`{"review_exclude_paths":[…],"min_gstack_version":"…"}`）作为独立 PR 拷进基础分支的 `.gstack/ship-policy.json`。车道自己落不到基础分支上：问仓库所有者或协调者。合并后把基础分支带进分支重跑一次；仍超就拆 PR。
- **分支声明了键而基础分支没有**：只有基础分支的拷贝生效；先如上把那个 hunk 落到基础分支。
- **某模式未被应用**（`REVIEW_EXCLUDE:` 行上的 `skipped=`）：其保留文件需要超过 24,000 字节的参数。收窄模式、把保留文件挪出该模式，或拆 PR。
- **排除后仍超**：把打印的目录加进基础策略，或拆 PR。仅为密钥行保留的文件已按其摘录计数（[密钥行摘录](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#secret-line-excerpts)）；`DIFF_KEEP:` 里仍按全文件计数的，是因别的原因保留或摘录不了。

没有覆盖 flag。见[评审上限](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#review-diff-ceiling)。

<a id="review-diff-unreadable"></a>
### `REVIEW_DIFF_UNREADABLE`

**含义**。git 读不了某评审者的 diff，pass 在写清单或简报之前停止（退出码 1）。`reason=timeout` 表示 `git diff` 超过 `timeout_ms`（120,000 ms；固定，无 flag）；`reason=git-exit` 给出 git 退出码。行内带 diff 基点、git 的第一行 stderr（远程 URL 换成 `<url>`）、以及 `log=`——运行目录下存 git 全部 stderr（同样脱敏）的文件。git 列不出 `review_exclude_paths` 命中的文件时也打印。

**修法**。按原因：超时，原样重跑一次，再拆 PR 或在基础分支排除其最大数据目录；git 退出码 128（对象缺失或基础分支未 fetch），`git fetch origin <base>` 后重跑一次；其他情况，停下拿着日志文件找人。

<a id="review-plan-stopped"></a>
### `REVIEW_PLAN_STOPPED`

**含义**。`gstack-review-dispatch pass` 在写清单前运行 `gstack-review-plan`，该运行没跑完，pass 停止（退出码 1）、不分发评审者。行内点名步骤（plan 命令）、`reason=timeout` 及 `timeout_ms`（180,000 ms；`GSTACK_REVIEW_PLAN_TIMEOUT_MS` 毫秒可调）、`reason=signal` 及信号（被别的东西杀了）、或 `reason=spawn`（起不来）。这行出现之前，超限的 plan 会被无声杀掉（GST-1442）。

**修法**。原样重跑一次 pass。再停就把这一行与仓库文件数（`git ls-files | wc -l`）报给你的 Captain。`reason=signal` 先查机器空闲内存。

<a id="review-exclude-reference"></a>
### `REVIEW_EXCLUDE_REFERENCE`

**含义**。提示性信息，从不停下。保留的代码文件点名了 `review_exclude_paths` 排除的目录（例如写 `receipts/` 的 harness）。目录引用不保留文件，只有完整文件路径才保留，所以评审者看到那段代码、却看不到它读取的文件。

**修法**。评审本身无需做什么。代码的正确性依赖被排除的文件时，在基础分支收窄模式让它们留在 diff 里。

<a id="fetch-violation"></a>
### `FETCH_VIOLATION`

**含义**。某评审者违反了[fetch 规则](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md#what-readers-may-fetch)：一个评审阶段的开始到结束之间，工作区、家目录或临时目录下出现了带网络远程的 git 仓库或 ≥100 MB 的文件。`gstack-review-dispatch sweep --phase end` 每个路径打印一行（`kind=repo|download`、远程、大小、该阶段的评审者）。Capy 不暴露评审者 id，阶段就是单位：该阶段的每个评审者都被隔离。其回复挪到 `<out>/quarantine/`（mode 0600），其发现退出 `merged.jsonl`，永远到不了 Red Team、judge、返回输出或 PR 文本。`verify` 打印 `FETCH_VIOLATION:` 并拒绝，直到该阶段重跑且清扫干净。

**修法**。没有需要手工重跑的东西：pass 为每槽规划一次全新尝试（`RERUN:`，评审者名为 `<reader>#2`；不是评审轮次），pass 程序随后分发。每个路径得到一行 `KEEP:` 而绝不是删除命令：清扫只按时间判，任何转录都无法把路径绑定到评审者，同一时间窗内机器上其他进程的克隆看起来一样。逐个检查路径、别动它，然后写一条 decision-trail 记录并告知你的 Captain。触到边界的清扫（深度 6、200,000 条目或 20 秒）打印 `FETCH_SWEEP: partial`——只是注记，绝不是拒绝。

<a id="fetch-rerun-blocked"></a>
### `FETCH_RERUN_BLOCKED`

**含义**。某阶段首次尝试发现的路径（`FETCH_VIOLATION:` 行）在该阶段的重跑、或同一 pass 的任何其他阶段（含第 11 步的声音）开始时仍然存在。评审者可以打开那个克隆或下载且照样清扫干净，所以不分发任何评审者，pass 停止（退出码 3），`verify` 继续以首次尝试的 `FETCH_VIOLATION` 拒绝。

**修法**。停下并把打印的路径报给你的 Captain。别动它：没有转录能把它绑到评审者，所以绝不要自己移动或删除。路径消失后，重跑同一 pass 程序会从其清单恢复重跑。

<a id="fetch-rerun-spent"></a>
### `FETCH_RERUN_SPENT`

**含义**。该阶段唯一的一次重跑也 fetch 了，pass 停止（退出码 3）。其评审者与首次尝试一样被隔离，所写内容一律不并，`verify` 拒绝。再跑同一 pass 程序立即停住：不启动任何更晚的阶段（保留路径旁不会有 Red Team），不返回任何评审者输出。

**修法**。按上文处理 `FETCH_VIOLATION:` 行点名的路径。然后查清评审者为何一直 fetch（简报或检查单把它们送去了别的仓库；或策略尚未列出的密封路径），换新的 `--pass` 与 `--out` 开全新的 pass。第三次尝试绝无自动。

<a id="execution-unknown"></a>
### `EXECUTION_UNKNOWN`

**含义**。`gstack-autoplan` 为某次尝试记录了分发意图（prompt 已交给评审者）但没有任何终态记录：没有 `submit`、没有取消。runner 被杀，或父会话再没回来。供应商可能已完成并扣费；快照哈希证明发送过哪个输入，证明不了评审是否完成。支出台账保留该尝试的预留。

**修法**。评审者完成了，用同一尝试 id 提交其结果（`gstack-autoplan submit --out <dir> --phase <p> --voice <v> --result <file> --model <id> --attempt <id>`）；迟到的结果照样绑定。没完成，用 `gstack-autoplan next --out <dir> --redispatch <attempt>` 显式重发。`resume` 与 `next` 绝不自行重发一个存疑的尝试。

<a id="run-locked"></a>
### `RUN_LOCKED`

**含义**。另一个 `gstack-autoplan` 进程持有 `<dir>/run.lock`（pid、主机与启动时间都在文件里）。每个变更型命令在运行期间持锁，两个写者绝不交错。

**修法**。等持有者退出。其 pid 已消失（runner 被杀）时，`gstack-autoplan resume --out <dir>` 接管并对账未决尝试；pid 仍活着的锁绝不被抢。

<a id="run-not-initialized"></a>
### `RUN_NOT_INITIALIZED`

**含义**。`--out` 目录里没有 `gstack-autoplan` 写下的 `run.json`，`submit`、`status`、`answer` 与 `resume` 无从着手。

**修法**。用 `gstack-autoplan next --plan <file> --out <dir>` 启动运行；首个 `next` 完成初始化（恢复点、活跃计划、清单）。

<a id="phase-not-awaiting"></a>
### `PHASE_NOT_AWAITING`

**含义**。`submit` 点名的阶段或声音并不在等结果：阶段已关闭、尚未打开、或该声音已有绑定结果。

**修法**。跑 `gstack-autoplan status --out <dir>`，对最后一个 `next` 打印的尝试提交（`ATTEMPT: ... phase=<p> voice=<v>`）。

<a id="ceo-only-conflict"></a>
### `CEO_ONLY_CONFLICT`

**含义**。`gstack-autoplan next --ceo-only` 与 `--ui`、`--developer-tool` 或 `--agent-primary` 同用（命令行或计划的 `gstack-autoplan-scope` 标记里）——每个都会加一个 CEO-only 运行永不打开的阶段；或标记点名 `--ceo-only`（该模式是一次运行的命令行选择，计划钉不了它）；或计划就是 `<out>/ceo-review.md`（直接、经符号链接或硬链接）——运行要写的报告会盖掉它。finish 在写报告前会复查最后这种情况。

**修法**。去掉冲突 flag（或标记 token）、把计划挪出报告路径，或不带 `--ceo-only` 跑完整评审。

<a id="ceo-only-after-init"></a>
### `CEO_ONLY_AFTER_INIT`

**含义**。`next --ceo-only` 点名的运行目录已含一次完整评审运行。运行保持它启动时的模式。

**修法**。在新的 `--out` 目录启动 CEO-only 运行，首个 `next` 带 `--ceo-only`。

<a id="ceo-only-no-gate"></a>
### `CEO_ONLY_NO_GATE`

**含义**。在 CEO-only 运行上跑了 `answer`、`recommend` 或 `revise`，或把 `gstack-approvals import` 指向了它。CEO-only 运行不写门禁、以 `status=reviewed` 结束、永不被批准——没有可回答、修改或导入的东西。（`budget` 与 `close --deferred` 仍可用：预算停住的 CEO-only 运行靠它们恢复。）

**修法**。读 `<run dir>/ceo-review.md`。要门禁与审批，在新目录开完整评审：`gstack-autoplan next --out <新目录> --plan <file>`，不带 `--ceo-only`。

<a id="shadow-before-answer"></a>
### `SHADOW_BEFORE_ANSWER`

**含义**。`gstack-autoplan shadow` 跳过了某个门禁修订——其计划审批（`p1`）未回答、或答了 `c`（质询）。导出把每条隐藏预测与所有者的回答配对，没回答的修订没有可配的对象。同一运行中已回答的修订照样导出；只有什么都没导出时命令才以退出码 3 结束。

**修法**。回答门禁（`gstack-autoplan answer --out <dir> --gate-rev <n> ...`），再跑 `gstack-autoplan shadow`。见[影子模式](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#shadow-mode)。

<a id="attempt-mismatch"></a>
### `ATTEMPT_MISMATCH`

**含义**。`--attempt` id 不是该阶段与声音的未决尝试，或该尝试已提交。结果只绑定一次；同一尝试的第二次提交被拒绝而不是覆盖第一次。

**修法**。传 `next` 为该声音打印的尝试 id。要替换已绑定的结果，经 `answer`（改范围的选择）重开阶段，或开新运行。

<a id="result-receipt-missing"></a>
### `RESULT_RECEIPT_MISSING`

**含义**。结果文件没有以 prompt 要求的完整读取回执开头：`INPUT: <phase> <snapshot sha256>`。要么评审者没把 prompt 文件读到 EOF，要么结果属于另一快照（分发与提交之间计划变了）。

**修法**。评审者的首行必须是 prompt 文件里的 INPUT 行。计划变了就再跑 `next` 取新快照并重新分发；旧快照的结果绝不绑定到当前阶段。

<a id="result-findings-missing"></a>
### `RESULT_FINDINGS_MISSING`

**含义**。结果没有合法的规范发现块。每个评审者在文字之外返回一个围栏块：

````
```gstack-findings
{"severity":"High","title":"...","file":"lib/x.ts","line":12,"fix":"..."}
```
````

每行一个 JSON 对象，至少带 `severity`（`Critical`、`High`、`Medium`、`Low`、`Informational`）与 `title`。空围栏表示评审者一无所获；缺围栏或行格式错误意味着结果无法对账、被拒绝。

**修法**。向评审者要那个围栏（prompt 点名了它），或自己从其文字整理出行再提交。对账跑在这些行上、不跑在文字上；纯文字的评审没有完整性检查。

<a id="model-family-conflict"></a>
### `MODEL_FAMILY_CONFLICT`

**含义**。外部声音的模型与原生评审者同族（同为 Anthropic、同为 OpenAI……），或其族别无法从 id 判定。同族的两个声音算一个声音；记录会写明谁是谁。

**修法**。用别族的模型跑外部声音并以 `--model` 传其 id。可识别的族别：anthropic、openai、google、xai、deepseek、qwen、zai、moonshot、meta、mistral、minimax。表里分类不了的 id 会被拒绝；模型要写全名（`openai/gpt-6-astra`，不是 `astra`）。

<a id="spend-cap-exceeded"></a>
### `SPEND_CAP_EXCEEDED`

**含义**。`spent + reserved + next_estimate` 会超出 `--spend-cap`。台账（`<dir>/spend.json`）按预留额计未结预留与未知支出，崩溃的尝试会一直占用成本，直到结清或释放。

**修法**。上调 `--spend-cap`；结清实际成本已知的尝试（`submit --usage-usd <n>`）；释放从未运行的尝试（`gstack-autoplan release --attempt <id>`）；或就此打住。宿主分发的子 agent 支出记 `unknown`，绝不是 0。

<a id="consensus-missing"></a>
### `CONSENSUS_MISSING`

**含义**。Eng 阶段的 `next` 发现某个已关闭的前序阶段没有它的共识记录（`<phase>-consensus.md` 加其对账行）——Eng prompt 会在缺少该阶段摘要的情况下发出。

**修法**。`gstack-autoplan resume --out <dir>` 经对账重新关闭该阶段。每个关闭阶段都有摘要之前，Eng 分发被拒绝；绝不部分发送。

<a id="outside-runner-unavailable"></a>
### `OUTSIDE_RUNNER_UNAVAILABLE`

**含义**。`gstack-outside-voice run --runner <r>` 在此跑不了：`codex-cli` 没找到 `codex` 二进制或未登录；`api` 对该模型族别既没找到 `OPENAI_API_KEY` 也没找到 `ANTHROPIC_API_KEY`；或 `host-subagent` 被调用时没带 `--result <file> --model <id>`。配置了别的 runner（`--fallback` 或 `GSTACK_OUTSIDE_RUNNER`）时，行内写 `codex-cli unavailable; using <runner>`，评审改在该 runner 上进行——那是完整的外部声音，不是降级版。没有别的 runner 时，这就是覆盖缺失。

**修法**。`gstack-codex-login` 用 `OPENAI_API_KEY` 登录 Codex（无人值守机器）；或设 API key 并传 `--runner api`；或在跨族子 agent 上跑评审，用 `--runner host-subagent --result <file> --model <id>` 提交其文件。

<a id="reality-row-missing"></a>
### `REALITY_ROW_MISSING`

**含义**。`gstack-plan-reality check --phase <p> <review>` 发现评审必带的某行没有对应的 `REALITY: <row> …` 行（每个 tier 1 行：`premise-table`、`already-done`、`surface-check`、`binding-decisions`、`numbers`、`deferred-asks`、`pr-count`；加上经 `--scope` 传入范围的 tier 2 行），或某 tier 1 行标了 `n/a`。检查打印 `PLAN_REALITY: phase=<p> rows=<n>/<m> missing=<ids> verdict=<v>` 并以 `1` 退出。无人值守运行中裁决为 `incomplete`、阶段不关闭；交互式为 `repair`：补出缺失行再查，至多两轮，之后在门禁处逐行警告仍缺的。

**修法**。`gstack-plan-reality rows --phase <p> [--scope <csv>]` 打印每行的检查项。逐项完成，评审以每行一行收尾：`REALITY: <row> pass|finding <summary> <file:line>`。

<a id="reality-receipt-missing"></a>
### `REALITY_RECEIPT_MISSING`

**含义**。某 `REALITY:` 行点名了行与状态但没带回执。回执是 `path:line`、`path:line-line` 或提交 sha——它把这一行从主张变成检查。

**修法**。把检查发生的位置加进该行，例如 `REALITY: already-done pass 0 hits since 2026-10-09 for bin/gstack-doctor 91bbd9e` 或 `REALITY: surface-check finding bun upgrade --version absent on 1.3.14 bin/gstack-capy-install:52`。

<a id="office-hours-probe-refused"></a>
### `OFFICE_HOURS_PROBE_REFUSED`

**含义**。办公时间的 spec 评审者可用 `gstack-office-hours-review probe --help <command> [<subcommand>]` 核查被引用的 flag，此外什么都不跑。命令必须是 gstack bin、或所列只读 CLI（git、gh、bun、node、npm、pnpm、yarn、jq、rg、python3、uv、go、cargo、make、docker、claude、codex、gemini）之一、在仓库外的 PATH 上找到；gstack bin 必须支持 `--help`。子命令词允许给 git、gh、docker、cargo、go、npm 与 uv（git、cargo、npm 一个词；gh、docker、go、uv 至多两个），且须出自 `lib/office-hours-probe.ts` 里该 CLI 的内建名单；会运行具名程序、脚本、镜像或扩展的词（`uv run`、`docker run`、`go test`、`npm exec`、gh 扩展）被拒。探针从不运行 shell 或仓库本地程序（仓库内的 PATH 条目被剔除）、关闭 stdin、在空临时目录运行、环境里不带任何密钥或令牌、10 秒后停止。

**修法**。无需修复。该断言保持未核验（不是被证伪）；改从仓库里该命令的源码或文档核查。

<a id="tasks-supersede-refused"></a>
### `TASKS_SUPERSEDE_REFUSED`

**含义**。`gstack-tasks` 拒绝了一份任务清单。要么 `add` 在行文件（`.gstack/tmp/tasks-<phase>-rows.jsonl`）里发现非法的任务或处置行，或它把分支更早清单里的某任务弄得既没保留也没关闭（错误逐个点名 `<run_id>/<id>`），什么都没写；要么 `supersede` 被要求退役更早的清单，而新清单（`--keep`）缺失、在任务目录之外、有格式错误的行、或持有别的阶段或分支的行——什么都没挪，两份清单都保持生效。

**修法**。修好行文件里错误点名的行（`gstack-tasks --help` 展示两种行形态），重跑 `gstack-tasks add --phase <phase>`。

<a id="reality-receipt-unresolved"></a>
### `REALITY_RECEIPT_UNRESOLVED`

**含义**。`gstack-plan-reality check` 打开某回执后发现它在检出里为假：文件缺失；是目录或悬空链接；行号为 0 或区间倒序；或引用的行超出文件尾。`RECEIPT_UNRESOLVED: <row> <receipt> <reason>` 行逐个点名。检出无法评判的回执（所有根之外的路径、任何根都没有的裸文件名、浅克隆缺的 sha）改打 `RECEIPT_UNVERIFIABLE:` 且绝不阻断。

**修法**。打开文件、引用证据所在的行。证据在另一个检出里时，用 `--root <dir>` 为它跑 `check`（可重复；默认是工作目录的 git 顶层）。

## 预门禁：生成文件注册表、gstack-pregate、issue 链接

两个工具都从 `origin/<base>` 读 pin 文件（`.gstack/generated.json`、`.gstack/pregate.json`），从不读工作树；仓库声明的命令只在 `--allow-repo-commands` 下或 `/ship` 之内运行。基础分支没有 `.gstack/pregate.json` 时，`gstack-pregate run` 改读 `<state root>/projects/<slug>/pregate.json`（仓库之外；state root 与 slug 见 docs/pregate.md）。
细节见 docs/pregate.md。

<a id="regen-registry-invalid"></a>
### `REGEN_REGISTRY_INVALID`

**含义**。`.gstack/generated.json` 不是合法 JSON、有未知键、缺 `id`/`inputs`/`outputs`、或 id 重复。

**修法**。`gstack-regen validate` 带着各错误的 JSON 路径打印全部问题；对照 `gstack-regen init --explain` 在基础分支修好文件。

<a id="regen-containment"></a>
### `REGEN_CONTAINMENT`

**含义**。注册表 glob 逃出仓库（`..`、绝对路径、每清单超过 64 个），或命令不是 512 字节以内的单行。

**修法**。只用仓库相对 glob；每条命令一行。

<a id="regen-stale"></a>
### `REGEN_STALE`

**含义**。某注册产物与当前树的临时 `git worktree` 里其命令产出不一致：产物过期或被手改。

**修法**。跑打印的命令（`gstack-regen write --only <id>` 可就地完成）并提交产物。绝不手工合并生成文件：冲突时任取一侧，然后重新生成。

<a id="regen-command-failed"></a>
### `REGEN_COMMAND_FAILED`

**含义**。某注册命令在临时 worktree 里非零退出。

**修法**。在仓库里手动运行并读其输出；临时 worktree 没有自己的 `node_modules`，需要它们的命令必须引用仓库的（gstack 的条目经 `bun run` 已如此）。

<a id="regen-deps-missing"></a>
### `REGEN_DEPS_MISSING`

**含义**。某注册命令退出码 0 且产物与提交的不一致，但 `package.json` 声明了依赖而仓库没有 `node_modules`——临时 worktree 在缺依赖的情况下跑了生成器。差异可能来自缺失的依赖而非过期文件，所以该条目报为未核验，而不是 `REGEN_STALE`。

**修法**。跑打印的安装命令（`bun install`，或与仓库 lockfile 匹配的那个），再重跑 `gstack-regen check` 或预门禁。

<a id="pregate-gstack-too-old"></a>
### `PREGATE_GSTACK_TOO_OLD`

**含义**。`.gstack/pregate.json` 用了本 gstack 不认识的键，而同一棵树的 `.gstack/ship-policy.json` 把 `min_gstack_version` 设得高于本 gstack。该键属于更新的 gstack（后续发布添加），所以行内写 `needs gstack >= <version>; upgrade`。策略照旧拒绝，与 `PREGATE_CONFIG_INVALID` 完全一致。只有带这项检查的 gstack 才会打印它；更早发布的（含 1.94.0.0）把同一键报成 `PREGATE_CONFIG_INVALID`。

**修法**。把本机的 gstack 升到点名版本以上（`bin/gstack-upgrade`，或带 `--for <skill>` 的会话安装），再重跑。仓库采纳新键时先上调 `min_gstack_version`，所以带这项检查的较老 gstack 打印的是这个而不是笼统的无效配置错误。

<a id="pregate-config-invalid"></a>
### `PREGATE_CONFIG_INVALID`

**含义**。`.gstack/pregate.json` 有未知键、类型错误、逃出仓库的 glob、没有 `{files}` 的 runner、或 `secrets` 出现在 `warn` 里。用户自有的 `<state root>/projects/<slug>/pregate.json` 在设了 `sealed`、`price_file`、非空 `run_profiles` 或 `remote_gate_runs`（都只从基础分支拷贝读取）、或存在但读不了（路径上的悬空符号链接算数）时同样拒绝。

**修法**。`gstack-pregate validate`。`secrets` 与必需车道义务不可降级；`warn` 里的其他检查 id 只认基础分支拷贝或用户自有文件的。用户自有文件直接在消息点名的路径编辑。仓库之内、或经符号链接伸入仓库的用户文件被忽略而不是读取（`--explain` 点名它）。较新 gstack 定义的未知 `sealed` 键（如 `allow_paths`、`case_insensitive`、`label_keys` 或 `identifier_keys`）说明本机 gstack 比策略旧：升级本机 gstack，并在落地这类键之前先上调仓库 `.gstack/ship-policy.json` 的 `min_gstack_version`。

<a id="pregate-secrets"></a>
### `PREGATE_SECRETS`

**含义**。`gstack-redact` 在本分支新增的行里发现了 HIGH 发现、或 `secret` 类别的 MEDIUM 发现。

**修法**。轮换凭据、从新增行（连同历史）移除、重跑。不可降级。良性发现（假令牌、被当成电话号码的运行 id、供应商公钥）在策略 `allowlist` 里按发现 id 或非密钥类别登记，配路径 glob 或锚定模式与理由（[docs/pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#allowlist)）；`env.value`、整个 `secret` 类别与 `engine.*` 绝不放宽。

<a id="pregate-strays"></a>
### `PREGATE_STRAYS`

**含义**。仓库根、新的顶层目录、或以临时名（`zz-*`、`tmp*`、`scratch*`）或编辑器遗留名（`*.orig`、`*.rej`、`*.swp`、`*.swo`、`*.bak`、`*.tmp`、`*~`、`.DS_Store`、`Thumbs.db`）添加了文件。

**修法**。删除或挪走。有意放在根上的文件进 `strays.allow`。

<a id="pregate-literals"></a>
### `PREGATE_LITERALS`

**含义**。被改动的导出常量（或具名超时/重试字面量）仍以旧值出现在分支未更新的测试文件里——nightly-only 与 Heavy-only 文件也算。

**修法**。更新列出的每个 `file:line`，或保留旧值。测试有意保留旧值时（最低版本上调后被拒的输入），给那一行做标记：在该行或紧邻其上的注释行写 `// pregate-literal: NAME=<old value> <reason>`。标记只豁免那一行，检查把它列为 `waived:`。不要为此用 `warn: ["literals"]`——那会把整个常量检查关掉。

<a id="pregate-no-lane"></a>
### `PREGATE_NO_LANE`

**含义**。碰到的某个源文件经静态 import、仓库路径字符串字面量、`bin/<name>` → `test/<name>*.test.ts` 约定或 `dependencies` 声明都映射不到任何测试（Django 项目里还包括 Django 按名加载的文件：settings 字符串、`include()`、应用迁移、admin、模板与静态文件）。这是失败，不是通过。没有测试依赖的 Markdown 是 docs/no-tests 空车道，不算本错误——名字里带不带 plan、evidence、redproof 都一样。读了这类文件的测试（引号路径或路径段的 `join()`）仍会被选中。映射不到的源码/代码文件仍然失败。测试目录下的文件不属于这个空车道。图片、字体与媒体，以及没有测试点名的白名单工具配置，属于 assets-and-tool-config 空车道，不算本错误。
分支仅重新打戳的发布清单也不算：碰过的 `*.json`、`*.plist`、`VERSION` 或 `VERSION.txt` 与合并基点相比只差版本值时，`lanes` 以 version-stamp-only 豁免并打印 `version-stamp-only (no lane needed): <files>`。逐类精确规则（同形态同文本 JSON 的文档顶层 `version`、plist 的两个 bundle 版本键、VERSION 文件里的一个裸版本）见 [docs/pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#gstack-pregate)。因此，基础策略未为其清单声明车道时（gbrain 的 `release:restamp` 与其插件清单），重打戳 PR 无需改策略即可通过。description、键、键序、嵌套版本、换行符或任何非版本字节变了的清单；测试、fixture、golden、`.gstack/` 或工作流树下的清单；新增、删除、改名或改权限的清单——仍算本错误；`--explain` 对其打印 `not version-stamp-only (<reason>)`。
分支删除的测试通常也不算：删除或改名的 JS/TS/Python/Dart/bats 测试，若没有存留代码 import 它，则改打 `removed (no lane owed): <path> — <why>`。仍点名它的文件照跑测试；删除的测试跑其所属套件、或报 `coverage removed: <file> has no remaining test`。以下仍算本错误：存留代码 import 的被删测试、无测试文件仍点名的被删测试；删除或改名的 Go/Ruby 测试；合并基点文本读不了的被删测试（符号链接、无效 UTF-8、超 1 MiB）；其他任何被删路径（含改名源文件的旧名）；以及其唯一测试被分支删掉的被改文件。`--explain` 以 `<path>: removed, but …` 打印原因（读不了的被删测试为 `<path>: removed test whose merge-base text could not be read …`）。

**修法**。加一个点名该文件的测试，或在 `.gstack/pregate.json`（或消息点名的用户自有文件）的 `dependencies` 下声明其车道（无行为的文件显式 `[]`）。其他非 Markdown 文档放进基础分支的 `empty_lanes`。`integration_test/` 或 `test_driver/` 下的 Dart 文件需要真机，pregate 从不运行它们：在基础分支的 `dependencies` 下声明 `"**/integration_test/**": []`（与 `"**/test_driver/**": []`），交给 CI 跑。只在分支上加的 `[]` 声明在 `--policy-from head` 下被拒（[`PREGATE_HEAD_POLICY_LOOSENS`](#pregate-head-policy-loosens)），先在自己的 PR 里落地。
哪里都没有策略（无基础拷贝、无用户自有文件），或策略没有 `dependencies`、`empty_lanes`、`selection`、`local` 键（只有 timeout 的文件）时，映射不到的文件是警告 [`PREGATE_NO_POLICY`](#pregate-no-policy)（附一份入门策略），不是本错误。`warn: ["lanes"]` 之下它是带此码的 `warn`，且只在所选测试跑绿之后给出（红车道仍是 `PREGATE_LANE_FAILED`）；`gstack-pregate init` 会写出那份草稿并列出放不进的文件。`--explain` 打印每个映射及缘由。对没有车道的文件，它还打印测试文件里解析不到仓库文件的 import 说明符（例如 `tsconfig.json` `paths` 别名 `@/lib/x` 而目标缺失），以及任何未跟进的 `extends` 跳转（仅相对 `extends`，至多 4 跳）。测试确实覆盖该文件的，在 `dependencies` 里声明；解析器本应找到的，把说明符作为解析器缺口上报。

<a id="pregate-no-lane-own-policy"></a>
**分支自己加车道**。分支编辑 `.gstack/pregate.json` 给自己的新文件加车道仍会得到本错误：pregate 从 `origin/<base>`（或用户自有文件）读策略，从不读分支——分支不能放宽自己的门禁（[信任边界](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#trust-boundary)）。这是有意的，pregate 绝不自行切到分支的拷贝。此时修法行以 `this branch edits .gstack/pregate.json, but the policy comes from origin/<base>@<sha>:.gstack/pregate.json so a branch cannot loosen its own gate, and a lane it adds counts only once it is on <base>` 开头，并点名两条路：

1. 先把策略变更在自己的 PR 里落地（经评审的路线），再把基础分支合进本分支重跑。
2. 用 `--policy-from head --allow-repo-commands` 重跑（/ship 里为 `gstack-ship-preflight --tests-only --policy-from head`）。运行使用可信策略加分支新增的车道，其记录写 `policy head (unreviewed)`——评审者看得出门禁跑在还没人评审过的策略下；`gstack-ship-queue` 绝不接受 head 策略运行充当远程镜像。head 策略只要做了加测试车道以外的任何事就被拒（[`PREGATE_HEAD_POLICY_LOOSENS`](#pregate-head-policy-loosens)）。

分支往自己 `pregate.json` 加的 allowlist 条目或 `[]` 声明，只有上了基础分支才生效。

<a id="pregate-head-policy-loosens"></a>
### `PREGATE_HEAD_POLICY_LOOSENS`

**含义**。`--policy-from head` 之下，分支的 `.gstack/pregate.json` 对可信策略（基础分支拷贝；基础没有时为用户自有文件）做了加测试车道以外的事。消息逐条列出差异：删了 `dependencies` glob；从 glob 里去掉测试；新的 `[]` 声明；删了文件；或其他键（`runner`、`guards`、`warn`、`allowlist`、`timeout_s`、`remote_gate`……）不同。落后于基础分支的分支与其合并基点处的拷贝比较，所以基础分支后来加的车道不算差异。什么都没跑，也没写任何记录。

**修法**。可信策略的每个键原样保留，只加至少含一个测试的 `dependencies` glob，或在既有 glob 上加测试。其他任何变更（含 `[]` 声明）先在基础分支的独立 PR 里落地，再把基础分支合进本分支重跑。

<a id="pregate-lane-failed"></a>
### `PREGATE_LANE_FAILED`

**含义**。被碰文件选中的某条本地车道在 `set -o pipefail` 下非零退出，或报告零测试（ZERO-RUN）。

**修法**。读打印的车道日志、修好失败，重跑 `gstack-pregate --stage tests`。被 `| tail` 藏起来的退出码也是退出码。

<a id="pregate-incomplete"></a>
### `PREGATE_INCOMPLETE`

**含义**。某检查超时；runner 进程被信号杀死（内存不足、外部 kill）而无退出码收场；仓库命令未获允许；没有声明也探测不到 runner；或检查运行期间工作树变了。incomplete 绝不是通过，且阻断发布。PATH 缺工具、任何测试未跑前的网络或配额错误、磁盘满，属于[`PREGATE_ENVIRONMENT`](#pregate-environment)——机器的失败与 diff 的失败分开读。

**修法**。传 `--allow-repo-commands`；提交消息说缺 `pubspec.yaml` 的 Dart 包的那个文件（或声明 `runner`）；调高 `--timeout`；或保持树不动，然后重跑。被信号杀死的 runner 绝不放行：读车道日志后重跑或拆选组。PATH 缺工具属于[`PREGATE_ENVIRONMENT`](#pregate-environment)，各有其修法。

<a id="pregate-stalled"></a>
### `PREGATE_STALLED`

**含义**。车道检查（或守卫）启动的某测试命令对日志零输出，且其进程组 CPU 用量低于十分之一个核（Windows 只看日志增长），持续超过停滞超时（默认 300 s；基础分支 `.gstack/pregate.json` 或用户自有文件的 `stall_timeout_s`，或 `--stall-timeout`）。pregate 杀掉其进程组并点名最后启动的测试文件。检查为 incomplete，绝不是通过。

**修法**。打开打印的日志，在点名文件里找挂起点（阻塞的子进程、不退出的服务器、同步等待），修好再跑 `gstack-pregate --stage tests`。确需安静等待更久的测试调大 `--stall-timeout`；`0` 关闭停滞击杀、只剩 `--timeout`。`--remote` 门禁从不停滞：它以 `--timeout`（否则 `timeout_s`）为界，等 CI 的门禁要把超时设得够 CI 跑完。

<a id="pregate-receipt-invalid"></a>
### `PREGATE_RECEIPT_INVALID`

**含义**。`gstack-pregate clear --remote pregate.json/remote_gate --receipt <file>` 读了远程门禁的输出，而其 `PREGATE_REMOTE:` 行缺失、点名的是 `pregate.json` 所测之外的另一棵树、报告 0 测试、或报告失败。义务保持未清。仅凭运行 URL 永不清除此义务；`test_backend/<backend>` 义务收运行 URL，记为 attested（声证）而非 validated（核验）。

`gstack-pregate clear --run <id|url>` 的拒绝也用此码：行内为 `gstack-pregate clear: receipt refused — REUSE: refused reason=<code> — …`，所提供的 GitHub Actions 运行对照基础分支的 `run_profiles` 核验不过。各原因码及其检查内容见[运行证据](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#run-evidence)。

对某车道的 `gstack-pregate clear --remote <workflow.yml/job> --run-url <url>`（无 run profile）也以此码拒绝，行内为 `REUSE: refused reason=<code> — …`：`run_ref_invalid`（不是本仓库的 Actions 运行 URL 或 id）、`api_error`（gh 读不了该运行）、`workflow_mismatch`（别的工作流的运行）、`run_in_progress`（仍在排队或运行）、`run_not_success`（失败、被取消或超时）。各带一行修法；后三种，等车道自己的工作流跑出一次绿色完成再 clear（[运行证据](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#run-evidence)）。工作流只经 `workflow_call` 运行的车道，某个 job 写着 `uses: ./.github/workflows/<车道的>.yml` 的工作流运行按该车道的运行计（GST-971）；其 `<调用 job> / <车道 job>` job 未成功时拒绝 `caller_job_skipped`。

另一棵树只在一种情况下被接受：它与 `pregate.json` 的树只差仓库的打戳规则（基础分支的 `.gstack/ship-policy.json`：`stamp_files`、`stamp_patterns`、内建的版本、manifest、lockfile 与 CHANGELOG 形态），由树回执自己的分类器在两棵树的 `git diff` 上判定（[门禁先于打戳](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#remote-gate-stamp-only)）。拒绝行届时写 `and the trees differ beyond the stamp rule of <policy>: <path> (<rule>: <why>, line <n>)`，点名的路径就是非打戳的那一个：`stamp_files` 之外的文件，或 hunk 不是旧 → 新改写的打戳文件。`the gated tree <t> is not an object in this repository` 表示被门禁提交在本地未 fetch、两棵树无法比较。另有三种拒绝不做任何分类即关闭替换：`lists the test lane as stamp-sensitive (stamp_sensitive_gates: tests)`（基础策略声明测试档读取打戳——gstack 自己的策略就是这样——别的树上的运行覆盖不了这棵；在 head 上重跑门禁）、`pregate.json was recorded against origin/<a>, not this repository's base origin/<b>`（重跑 `gstack-pregate --base <b>`；`origin/HEAD` 未设时 `git remote set-head origin <a>`）、以及 `.gstack/ship-policy.json on origin/<base>@<sha> is invalid` 或 `could not be read`（在基础分支修策略，或 fetch 它）。

**修法**。在 pregate 所测的树上跑远程门禁并以 `--receipt` 传其输出文件，或让 `gstack-pregate --stage tests --remote --spend-cap <usd> --allow-repo-commands` 自己跑并核验。gate-ahead 回执：fetch 被门禁提交（`git fetch origin <sha>`）再 clear，或把点名路径按仓库规则变成打戳；只要还有差异路径属于变更，回执绝不被接受。

<a id="pregate-no-policy"></a>
### `PREGATE_NO_POLICY`

**含义**。仓库还没有预门禁策略（基础分支没有 `.gstack/pregate.json`、也没有用户自有 `<state root>/projects/<slug>/pregate.json`），或其策略未声明任何车道（没有 `dependencies`、`empty_lanes`、`selection`、`local` 键，例如只有 timeout 的文件），而碰到的文件映射不到测试车道。无策略时这是 `warn` 而非 `PREGATE_NO_LANE`：所选测试照跑（红车道仍是 `fail`），且表格打印了一份从仓库起草的入门策略（`PREGATE_STARTER:` 行：runner、测试目录、CI 车道、`begin` 与 `end` 之间的 JSON、每个无人覆盖文件一条 `TODO`）。`run` 什么都没写。
细节见 [docs/pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#no-policy)。

**修法**。审阅入门策略，用 `gstack-pregate init` 写入（已有文件时没有 `--force` 拒绝覆盖），逐个编辑 `TODO`（点名该文件的测试、一条 `dependencies`、或无行为文件的 `[]`），跑 `gstack-pregate validate`，然后在基础分支提交 `.gstack/pregate.json`。已有策略时改为把入门的 `dependencies` 并进去。从此映射不到的文件就是 `PREGATE_NO_LANE`。

<a id="pregate-environment"></a>
### `PREGATE_ENVIRONMENT`

**含义**。某检查没法跑它的命令，原因是机器而非 diff：PATH 缺 runner 或守卫二进制（退出码 127、`command not found`、某工具 `not on PATH`）；任何测试计数之前的网络错误或配额拒绝；磁盘满；运行时未核验；或 gstack 自己的扫描器没跑完。检查为 `incomplete`（绝不是通过），`pregate.json` 里带 `cause: "environment"` 与 `environment: { kind, evidence, proof }`，表格打印 `environment: <kind> — <evidence>`。测试失败、且日志同时点名连接错误的，**不是**本码：runner 自己的摘要计了失败，属 `cause: "diff"` 的 `PREGATE_LANE_FAILED`；二进制在而自身退出 127 的 runner、守卫或门禁脚本也不是。一个例外：所有测试都失败、且 Playwright 说浏览器未安装的 Playwright 车道，是 `missing-binary` 配 `proof: "output"`（`npx playwright install`）；装了一半仍是 diff 的失败。`proof: "launch"` 是确定的（命令起不来、二进制不在 PATH、运行时或 gstack 工具拒绝）；`proof: "output"` 表示在任何测试计数之前某规则匹配了命令文本——diff 自己的输出也可能写出这种文本，所以行内注明 `(inferred from output)`、修法要求另行确认。类别与规则见 [docs/pregate.md](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#environment)。

**修法**。修好 `environment:` 行在本机点名的问题（装工具、恢复网络或配额、清磁盘、修运行时），或到能跑的地方跑该车道：`gstack-pregate --stage tests --remote --spend-cap <usd> --allow-repo-commands`，或 CI 作业加 `gstack-pregate clear --remote <workflow.yml/job> --run-url <url>`。豁免运行的车道引用 kind、evidence 与 proof，绝不引用测试名；`verify` 打印 `PREGATE_ENVIRONMENT: <n> check(s) blocked by the environment (<kinds>), not by the diff`，并点名仅凭输出推断的检查——协调者因此能区分两者、知道先去别处确认哪个。

<a id="pregate-stale"></a>
### `PREGATE_STALE`

**含义**。`pregate.json` 记录时的工作树指纹与正在发布的（最终打戳、regen、任何编辑）不同；或其运行所依据的用户自有策略被编辑或删除（或在默认值下的一次运行之后，出现了一份新策略、或其路径上的符号链接开始指向空处）。

**修法**。最终生成与打戳之后重跑 `gstack-pregate`；否则第 18 步拒绝写 ship 回执。

<a id="pregate-remote-uncleared"></a>
### `PREGATE_REMOTE_UNCLEARED`

**含义**。一条 `requires-remote` 义务（本机跑不了的平台车道，由 `workflow.yml/job` 点名；或小机器的 `pregate.json/remote_gate` 档）没有回执；或从仅打戳前序树接受的 `remote_gate` 回执记录的 `accepted_for` 不是 `pregate.json` 所测的树、或 `gated_tree` 与其回执字符串的 `tree=` 不符（`clear` 之后文件被编辑过）——在这里什么都清不了；或 `clear --run` 回执点名的树不是 `pregate.json` 的且没有记录替换（`run receipt(s) verified for another tree`）。

**修法**。分发那个作业、等它绿，然后 `gstack-pregate clear --remote <workflow.yml/job> --run-url <url>`（或证据 bundle 的 `--bundle-lane <label>`）。对 `pregate.json/remote_gate`：`clear --remote pregate.json/remote_gate --receipt <gate output>`——门禁在本树上的运行，或与仓库打戳规则仅差打戳的前序树上的运行（[先于打戳的门禁](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#remote-gate-stamp-only)）；随后 `verify` 在其 ok 行打印接受的替换。基础分支声明了 run profiles 时，`clear --remote <lane> --run <id|url>` 依据本树上已核验的 GitHub Actions 运行清车道（远程门禁每个 `remote_gate_runs` profile 一次运行，带 `--allow-repo-commands`）；有 profile 的车道拒绝 `--bundle-lane`（[运行证据](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#run-evidence)）。ship 回执带着每条义务及其回执。

<a id="issue-unreadable"></a>
### `ISSUE_UNREADABLE`

**含义**。`Fixes #N`/`Closes #N` 尾注或 `--issue N` 点名的 issue 无法经 `gstack-issue-guard` 读取。

**修法**。查 `gh auth status` 与编号。读到之前，链接渲染为 `Refs #N`，绝不是 `Fixes`。

<a id="issue-lookup-failed"></a>
### `ISSUE_LOOKUP_FAILED`

**含义**。`gstack-issue-links` 解析不了仓库、列不出关闭本 PR 所修 issue 的在途 PR、搜不到点名 `--ci-run` id 的 flake issue、或认不出本 PR 作者：`gh` 以应用身份运行（`…[bot]`），而 HEAD 提交（未推送，或未关联 GitHub 用户）与用户自有仓库都给不出登录名——所有者自己的在途 PR 只能留在 `Related:` 行。关闭与引用行照常打印；`--json` 把每项失败列在 `unavailable` 下。

**修法**。查 `gh auth status`；远程不是 GitHub 仓库时传 `--repo <owner/repo>`，`gh` 以应用运行时传 `--author <login>`，然后重跑。仍失败就在交接里写明缺哪项查询；绝不把正文当作完整版呈现。

<a id="issue-links-missing"></a>
### `ISSUE_LINKS_MISSING`

**含义**。`gstack-ship-receipt write --issues @issues.json --body <file>` 发现正文缺 issues 对象记录的某行 `Fixes`、`Refs`、`Flake:`、`Related:`、`Supersedes` 或 `Contributed by`——PR 正文与其回执会互相矛盾。什么都没写。

**修法**。把 `gstack-issue-links` 打印的每一行贴进正文 `## Issues` 下（issue 集合变了就重跑 `gstack-issue-links --out`），然后重跑回执写入。

## 评测计划、车道归属、证据核验与负责人简报

`bin/gstack-eval-plan`、`bin/gstack-lane-check`、
`gstack-evidence verify`、`bin/gstack-owner-brief`、`bin/gstack-contributor-mode`
与 `bin/gstack-banned-terms` 打印的代码（计划 E1–E3）。每个都以括号结尾错误行；grep 代码。

<a id="prereg-incomplete"></a>
### `PREREG_INCOMPLETE`

**含义**。`gstack-eval-plan prereg --check <file>` 发现必需的预注册小节缺失或为空：`## Bars`、`## Arms`、`## Comparison`、`## Decoys`、`## Stop rules` 或 `## Held-out exposure`（计划涉及的每个留出集、其既往暴露与预留）。`## Comparison` 没有 `stack:` 行、取值不是 `loaded`/`none`、`stack: none` 却没有 `why:` 行，以及 `## Diagnostics` 声明格式错误时同样触发。

**修法**。在任何付费调用之前填好点名小节。说不出停止规则或留出暴露的计划不算预注册；试点没有通过的检查拒绝启动。

<a id="prereg-no-gstack-arm"></a>
### `PREREG_NO_GSTACK_ARM`

**含义**。预注册声明 `stack: loaded`（某些组加载 gstack 或其他技能栈）而其 `## No-gstack arm` 小节缺失，或缺 `arms:`、`inputs:`、`prompt:`、`panel:`、`report:`、`masking:`、`install:`、`audit:` 之一（或后三项之一写成 `none`）；列出的组不是 `<model>#no-gstack` 形态的 Arms 行；或对比中的某模型没有自己的 no-gstack 组。组按完整身份匹配，`claude-opus-5#no-gstack` 不覆盖 `claude-opus-5-5`。

**修法**。在 `## Arms` 下为每个模型加一行 `<model>#no-gstack`，在 `arms:` 行列出它们，并填好其余键：相同 inputs、无技能文本的朴素 prompt、相同 panel 与 judge、结果行放在变体旁边的位置、运行 agent 对 Capy drive 的遮蔽方式、确认未装 gstack 的检查、以及逐组 drive 读取审计。没有任何组加载技能栈时，改写 `stack: none` 并附 `why:` 行。规则见 [docs/TESTING_INTERNALS.md](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#no-gstack-arm)。

<a id="eval-report-no-gstack-row"></a>
### `EVAL_REPORT_NO_GSTACK_ROW`

**含义**。`gstack-eval-plan results --check <prereg> <results>` 在结果文件里找不到单张 markdown 表、为预注册 Arms 小节列出的每个组身份给出填好的行。通常是 `<model>#no-gstack` 行缺失、与其变体分居两张表、或只有占位符（`-`、`n/a`、`tbd`）。预注册本身没过 `prereg --check` 时同样触发。

**修法**。每个组身份一行、每个 no-gstack 组挨着它的变体，放进同一张表，重跑检查。打印 `RESULTS: ok` 之前不发布任何数字。`stack: none` 的预注册无需该行。规则见 [docs/TESTING_INTERNALS.md](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#no-gstack-arm)。

<a id="eval-arm-duplicate"></a>
### `EVAL_ARM_DUPLICATE`

**含义**。`gstack-eval-plan pilot start --arms` 把同一组身份点名了两次，两个组会共享同一批试点尝试。

**修法**。每组一个身份：`<model>` 或 `<model>#<loadout>`，如 `claude-opus-5-5` 与 `claude-opus-5-5#no-gstack`。没有预留任何东西。

<a id="eval-price-missing"></a>
### `EVAL_PRICE_MISSING`

**含义**。某组的模型在 `lib/pricing.ts` 没有行，准入估算会是 `$0`，台账会无限制放行。

**修法**。从供应商定价页补行（每百万 token 的美元价加 `as_of`），或去掉该组。该表只为标准文本 token 定价；排除的计费类别见 `lib/pricing.ts`。

<a id="eval-dry-run-failed"></a>
### `EVAL_DRY_RUN_FAILED`

**含义**。对真实输入文件的 `$0` 桩模型演练发现了付费运行才会为之买单的问题：某行缺 prompt 所需字段、输出预算对推理模型太小、或没有重试 prompt 文本。

**修法**。修好点名的行或 flag（`--output-budget`、`--retry-prompt`），重跑 `gstack-eval-plan dry-run`。它打印的检查单就是试点所需的记录。

<a id="eval-arms-unresolved"></a>
### `EVAL_ARMS_UNRESOLVED`

**含义**。`gstack-models resolve --role eval-arms` 没产出任何组，而仓库策略文档兜底（`--policy-doc`，默认依次找 `docs/model-policy.md`、`MODEL_POLICY.md`、`docs/MODELS.md`）也没点名计费模型。

**修法**。传 `--arms <model,model>`，或把 `--policy-doc` 指到列出项目可用模型的文档，或修模型策略配置。

<a id="eval-budget-exhausted"></a>
### `EVAL_BUDGET_EXHAUSTED`

**含义**。台账拒绝了下一次预留：已花费 + 已预留 + 未知支出 + 估算超过上限（底层是 `SPEND_CAP_EXCEEDED`）。运行以 `budget_exhausted` 状态停止；什么都不重试。

**修法**。读支出表（`gstack-eval-plan pilot report`），结清或释放未决尝试，然后有意上调 `--cap` 或就此打住。

<a id="lane-conflict"></a>
### `LANE_CONFLICT`

**含义**。`gstack-lane-check` 发现计划里的文件已被在途分支或 pull request 改动；输出行点名 PR 号、分支与 hunk 数。

**修法**。给文件一个所有者：等那个 PR 合并、把本车道叠在其分支上、或把文件移出计划。两条车道改一个文件正是这个检查要防的合并冲突事故。

<a id="lane-ref-unavailable"></a>
### `LANE_REF_UNAVAILABLE`

**含义**。某个 `--branch` 或 `--pr` 解析不了：ref 没 fetch，或 `gh` 缺失/未登录。

**修法**。`git fetch origin <branch>`，或 `gh auth status`。解析不了的车道如实上报，绝不计为畅通。

<a id="evidence-unverified"></a>
### `EVIDENCE_UNVERIFIED`

**含义**。`gstack-evidence verify <bundle>` 在本机无法核验某个车道声明：提交树与 bundle 的不一致、记录的日志缺失或哈希不符、或探测没有重跑。

**修法**。检出 bundle 的提交并跑 `--rerun` 在本机执行车道命令；或把该声明当作导入的断言——绝不计入门禁复用。

<a id="banned-term-found"></a>
### `BANNED_TERM_FOUND`

**含义**。diff 在 `.gstack/banned-terms.json` 所列术语的 `allowed_paths` 之外引入了该术语。发现点名术语、文件与行号、以及允许的位置。

**修法**。从新增行里删掉该术语，或把文字挪到允许路径。`/review` 与 `/document-release` 对每个 diff 都跑这项检查。

<a id="banned-terms-invalid"></a>
### `BANNED_TERMS_INVALID`

**含义**。`.gstack/banned-terms.json` 不合法：`terms` 必须是非空字符串列表，每条 `allowed_paths` 必须是纯仓库相对 glob（不许 `..`、绝对路径、符号链接逃逸）。

**修法**。`gstack-banned-terms init` 写出带注释、全部键为默认值的示例；`gstack-banned-terms validate` 检查文件。

<a id="contributor-source-unavailable"></a>
### `CONTRIBUTOR_SOURCE_UNAVAILABLE`

**含义**。`gstack-contributor-mode detect` 在 `.gstack/ship-policy.json` 里找不到 `maintainers` 清单，也无法询问协作者 API（`gh` 缺失、未登录、或解析不出 PR 作者），模式关闭并记录 `source=off`。

**修法**。在 ship 策略里加 `maintainers`（显式清单永远优先），跑 `gh auth login`，或传 `--contributor` 为本次评审强制开启模式。

<a id="brief-input-missing"></a>
### `BRIEF_INPUT_MISSING`

**含义**。`gstack-owner-brief render --out <dir>` 需要运行目录里的 `gate.json`、`decisions.jsonl` 与 `findings.jsonl`；缺了一样。

**修法**。先走到门禁（`gstack-autoplan next --out <dir>` 直到 `gate_pending`）；简报渲染的正是门禁写下的内容。

<a id="draft-direction-unresolved"></a>
### `DRAFT_DIRECTION_UNRESOLVED`

**含义**。阶段收尾改写发现某行"草稿方向待所有者决定"的决策 id 仍处于 pending，原样保留。

**修法**。回答该 id 的门禁，再重跑 `gstack-owner-brief close`；只有已决定的行才被改写，各自改成所选选项与日期。

<a id="setup-crlf-repair"></a>
### `warning: left <n> locally edited file(s) with CRLF line endings that gstack pins to LF`

**含义**。Git for Windows 以 `core.autocrlf=true` 检出，所以 gstack 的嵌套 shell 脚本（技能 `bin/` 辅助、Claude 钩子垫片、`lib/cso/images/*`、`scripts/app/*`）在 `.gitattributes` 把它们钉定为 LF（#3110）之前是以 CRLF 写下的。Git Bash 照样能跑，但读同一份检出的 Linux bash（同步树、WSL、bind mount）会以 `set: pipefail: invalid option name` 失败，而这样失败的钩子会挡住它守卫的工具调用。拉取新规则修不好既有拷贝——git 绝不改写内容没变的文件。setup 用一次 `git ls-files --eol` 找出这些文件并按 LF 重新检出。本地编辑过的文件它不动，只在本警告里点名。同一小节还覆盖 `skipped the CRLF repair`（另一个 setup 占着安装注册表锁）与 `the CRLF repair could not rewrite every file`。

**修法**。编辑过的文件：stash 再恢复——git 会以 LF 写回并保留你的编辑：

```bash
cd ~/.claude/skills/gstack && git stash && git stash pop
```

修复被跳过：等另一个 setup 结束后重跑 `./setup`。修复失败：在检出里 `git checkout -- . && ./setup`，丢弃本地编辑并改写全部文件。安装目录不是 `~/.claude/skills/gstack` 时用你自己的（`./setup --status` 打印它）。预期结果：下一次 `./setup` 不再打印 CRLF 警告。

## 波次车道 CD：预门禁守卫、重新门禁、密封输出

<a id="pregate-guard-failed"></a>
### `PREGATE_GUARD_FAILED`

**含义**。基础分支 `.gstack/pregate.json` 里的一个守卫（仓库命令，如串行测试清单检查或 CLI golden 测试；基础分支没有时用用户自有文件），命中了本分支碰过的文件并以非零退出。守卫覆盖 import graph 看不见的东西：清单、子进程 golden、注册表。不可降级为 warn。起不来的守卫、或其二进制不在 PATH 上（退出码 127）的，属于机器问题：`PREGATE_ENVIRONMENT`（`incomplete`），不是本代码；二进制在而脚本退出 127 的才是本代码。

**修法**。读表格里该守卫的行（退出码、输出尾部、日志路径），照其 `fix` 行做，提交，然后重跑 `gstack-pregate run --allow-repo-commands`。车道只有在此通过后才报完成，并在交接里携带 `PREGATE:` 行。

<a id="migration-collision"></a>
### `MIGRATION_COLLISION`

**含义**。`gstack-pregate regate` 从基础分支的 `.gstack/ship-policy.json` 读到 `migrations`（`dir`、`id`），发现本分支新增的迁移号已被基础分支占用，或被另一个在途 PR 以不同文件名占用。两个 PR 都会过各自的门禁，后合并的那个会破坏 schema 顺序。在途 PR 查询无法完成时（`gh` 缺失或出错、在途 PR 达 1000 个、某 PR 的文件清单被 GitHub 截断且无法完整取回），输出行说 `MIGRATION_COLLISION: unknown (...)` 并扣住 `REGATE: not-needed`。

**修法**。本 PR 临合并时取下一个空闲迁移号，重命名文件与其 id，提交，再重跑 `gstack-pregate regate --against <gated-head> --bundle <file>`。改名后的迁移是代码变更，门禁会重跑。

<a id="sealed-output-refused"></a>
### `SEALED_OUTPUT_REFUSED`

**含义**。仓库在 `.gstack/pregate.json` 声明了 `sealed` 策略（基础分支 ∪ 推送提交），而本次推送发布的一个提交加入了密封路径或转录（二进制、空文件、后来删除的文件都算），或加入含密封答案标记、种子或本机家目录路径的行，且目的地是公开的或可见性未知（新建或读不了的仓库按公开计）。设了 `sealed.label_keys` 时，新记录把标签字段挨着标识符放（`sealed.label_join`），或守卫读不了某个受支持文件（`sealed.label_join_unchecked`），同样拒绝。密封策略读不了或格式错误也拒绝。受管的 pre-push 钩子与 `gstack-pregate sealed` 对每个发现打印一行：规则、`file[:line]`、提交。它们从不打印命中的文本。

**修法**。在分支到达公开仓库之前，把输出从每个会被发布的提交里移除（后来删除它的提交照样发布过它）。紧挨密封数据保存的可发布文件（哈希与计数的 `MANIFEST.json`）可在基础分支的 `.gstack/pregate.json` 里用 `sealed.allow_paths` glob 豁免路径规则；文本规则仍会读它（[docs/pregate.md#sealed](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#sealed)）。`sealed.label_join` 的，从发布文件里去掉标识符字段（或标签），或不把文件放进公开仓库；`allow_paths` 绝不豁免它。经复核的误报在基础分支的 `.gstack/sealed-allow.tsv` 加一行：`rule<TAB>path<TAB>sha<TAB>reason`，`sha` 是完整提交 sha（短 sha 被忽略并在 stderr 点名）。目的地私有时，在基础分支 `.gstack/pregate.json` 的 `sealed` 下设 `"visibility": "private"`。Capy 的 PR 工具可能不跑本地钩子，所以任何推送或建 PR 之前自己跑一遍 `gstack-pregate sealed`。

<a id="eval-gate-unpriced"></a>
### `EVAL_GATE_UNPRICED`

**含义**。`gstack-eval-plan price-gate` 找不到付费门禁的调用计划文件：没给 `--plan-file`、基础分支 `.gstack/pregate.json` 里没有 `price_file`、或文件里没有 `GSTACK_EVAL_CALLS` 行。（声明的 `price_file` 在 HEAD 缺失属于 `EVAL_PLAN_STALE`，不是本码。）成本未知的门禁不能按已定价批准。

**修法**。消费方仓库按 [docs/eval-calls.md](https://github.com/garrytan/gstack/blob/main/docs/eval-calls.md) 的格式提交调用计划文件，并在 `price_file` 里点名。只有所有者接受未定价门禁时，才用 `--allow-unpriced "<reason>"` 重跑：退出码 0，打印 `GATE_UNPRICED_OVERRIDE: <reason> (owner-authorized override; not authorization to spend)` 并把原因记进回执。

<a id="eval-gate-over-cap"></a>
### `EVAL_GATE_OVER_CAP`

**含义**。门禁的定价总额超过 `--cap-usd`；或单次调用的预留（其输入份额加 `max_out_tokens`）超过 `--cap-usd`；`scope=smoke` 行则对照 `--smoke-cap-usd`。供应商会拒绝上限兜不住的预留，运行会在花钱之后失败。

**修法**。削减调用计划里的问题数、组数或 `max_out_tokens` 并重新生成，或与所有者慎重上调上限。绝不拆分调用钻上限的空子。

<a id="eval-plan-stale"></a>
### `EVAL_PLAN_STALE`

**含义**。调用计划文件定价的对象与正在批准的不一致：其 `GSTACK_EVAL_GATE` 命令与 `--gate` 字符串不严格一致；其 `GSTACK_EVAL_HEAD` 落后于 HEAD 且其后有计划文件以外的文件变更；某输入在 HEAD 的 sha256 与其 `GSTACK_EVAL_INPUT` 行不符；或基础策略的 `price_file` 不在 HEAD 提交里。`--allow-unpriced` 覆盖不了它。

**修法**。在 HEAD 为确切的门禁命令重新生成计划文件（用仓库自己的生产者），提交，重跑 `gstack-eval-plan price-gate`。

<a id="plan-sections-invalid"></a>
### `PLAN_SECTIONS_INVALID`

**含义**。`gstack-autoplan next` 只评审计划的 `## Implementation plan` 小节、把 `## Review record` 保密，所以计划需要恰好一个非空的 Implementation plan 小节、后接一个 Review record 小节，都在代码围栏之外。两个标题都没有的计划会被自动包裹；只有其一、重复、颠倒或空小节的计划在任何写入之前被拒。错误点名问题。

**修法**。补上缺失标题，或带 `--scaffold` 重跑首个 `next`：它写出补好标题的 `<out>/plan-source.md`、评审那份拷贝并打印 `SCAFFOLDED:`。你的计划文件绝不被编辑。重复、颠倒或空小节有歧义，必须手工修。

<a id="plan-amend-pending"></a>
### `PLAN_AMEND_PENDING`

**含义**。所有者在门禁接受了至少一处计划变更（每处都打印为 `APPLY:` 行），而运行的计划还没吸收它，重跑会评审旧计划。每条被接受的变更要么并入、要么撤回，在此之前 `next` 拒绝；`export` 对带着 pending 的 `complete` 运行同样拒绝。

**修法**。编辑计划，然后 `gstack-autoplan revise --out <dir> --plan <file> --incorporates <decision id,...>`。`revise` 把每个点名 id 绑定到新旧 Implementation plan 哈希，Implementation plan 没变时拒绝；没点名的 id 保持 pending。打包或顺序类变更（其 `APPLY:` 行以 `no plan edit needed: revise --settle <id>` 结尾）用 `gstack-autoplan revise --out <dir> --settle <id>` 清账、不重开任何东西。要放弃一条被接受的变更，`gstack-autoplan revise --out <dir> --withdraw <decision id>` 把撤回记进日志。

<a id="amendment-unknown"></a>
### `AMENDMENT_UNKNOWN`

**含义**。`gstack-autoplan revise --incorporates` 或 `--withdraw` 点名的决策 id 不是待定修正：所有者从没在门禁把它作为计划变更接受（例如 gstack 记录修正之前就回答了门禁），或它已被并入或撤回。什么都没改。

**修法**。只点名拒绝信息在 `pending:` 后列出的 id。一个都没有时，不带 `--incorporates` revise：`gstack-autoplan revise --out <dir> --plan <file>`。

<a id="amendment-not-settleable"></a>
### `AMENDMENT_NOT_SETTLEABLE`

**含义**。`gstack-autoplan revise --settle <id>` 清账一条被接受的变更而不改计划，这只对打包或顺序类变更（门禁条目的 `changes` 为 `packaging` 或 `ordering`）诚实，且作用于运行已在评审的计划：所有者接受它的那份计划，或后来某次 `revise` 记录的计划。点名的变更改动范围/成本/方向、没有 `changes` 值、计划文件里有没有任何 `revise` 记录过的编辑、或 `--settle` 配了个改了 Implementation plan 却什么都没并入的 `--plan`——都不行。什么都没改。

**修法**。编辑计划，然后 `gstack-autoplan revise --out <dir> --plan <file> --incorporates <decision id>`，同一次调用里加 `--settle <id>` 清掉打包/顺序类变更（或 revise 之后再 settle）。每条变更的 `APPLY:` 行写明走哪条路，`NEXT:` 先列 settle 步骤。

<a id="gate-rec-stale"></a>
### `GATE_REC_STALE`

**含义**。`gstack-autoplan recommend` 在门禁渲染之后改动了推荐，所有者对早先渲染给的 `rec`（或 `all`）回复会采纳他们没见过的推荐。每次渲染打印 `rec_hash=<h>`；`recommend` 跑过之后，`rec` 回复必须点名所有者回答的那次渲染的哈希。对 `rec` 出现之前的门禁（1.91.101.0 或更早、无 `rec_rev` 的 `gate.json`）回 `rec`/`all` 同样被拒：那次渲染告诉所有者 `all` 会把推荐 `b` 的条目留成 pending，而现在的 `all` 会接受它们。

**修法**。重新渲染（`gstack-gate render <dir>/gate.json --all`），转达，并用那次渲染的 `--rec-hash <h>` 回答。显式 `<id><option>` token 绝不被拒。

<a id="checkpoint-invalid"></a>
### `CHECKPOINT_INVALID`

**含义**。`gstack-autoplan resume --out <dir> --from <checkpoint>` 找不到可恢复的生成：`checkpoint.json` 读不了或不是 schema_version 1 检查点；列出的文件缺失、不是常规文件、逃出该生成（`..` 路径或符号链接目录）、或与记录的 sha256 不符；或暂存的运行过不了 `gstack-artifact validate`。`--from` 指向某运行的集合时恢复能通过校验的最新生成、跳过其后损坏的；持有多个运行的根必须点名一个。没有向 `--out` 写入任何东西。

**修法**。`gstack-autoplan checkpoints --from <dir>` 列出每个生成及其 `hash=ok` 或 `hash=bad (<reason>)`；传完好生成的目录恢复。设了 `GSTACK_AUTOPLAN_CHECKPOINT_DIR` 后，每个让运行归于静止的命令都发布新生成并保留前一个。

<a id="checkpoint-overlap"></a>
### `CHECKPOINT_OVERLAP`

**含义**。（解析符号链接后）本次运行的检查点目录与运行目录（恢复时则是检查点与 `--out` 或其暂存目录）相同或互相包含。把一个拷进另一个会替换或删除活着的运行，所以什么都没碰。已提交命令之后的检查点拒绝在 stderr 打印 `CHECKPOINT: failed …`，且不动该命令的退出码。

**修法**。把 `GSTACK_AUTOPLAN_CHECKPOINT_DIR`（或 `--from` / `--out`）指到运行之外的目录，例如项目私有的 user Drive 文件夹。

<a id="checkpoint-target-exists"></a>
### `CHECKPOINT_TARGET_EXISTS`

**含义**。`resume --from` 只恢复到缺失或空的 `--out` 目录，而这个目录已有文件。

**修法**。换新的 `--out` 目录，或不带 `--from` 跑 `gstack-autoplan resume --out <dir>` 续跑已在的运行。

<a id="owner-reply-required"></a>
### `OWNER_REPLY_REQUIRED`

**含义**。agent 回答了门禁（`--by agent:<id>`）却没有记录所有者实际说了什么。没有应用任何东西。

**修法**。逐字传所有者的话：`--owner-reply "<文本>"`、`--owner-reply -` 从 stdin 读、或 `--owner-reply-file <路径>`。它们存进每个决策行；能按门禁语法解析时，必须解析出与 `--reply` 相同的选择。

<a id="gate-owner-reply-mismatch"></a>
### `GATE_OWNER_REPLY_MISMATCH`

**含义**。所有者的逐字回复本身就是一条门禁回复（例如 `rec`），且它解析出的选择与 agent 转达的 token 不同。没有应用任何东西。

**修法**。转达所有者选了什么；把他们的回复直接当 `--reply` 传永远一致。所有者的话与你的 token 不一致时，去问所有者。

<a id="gstack-version-changed"></a>
### `GSTACK_VERSION_CHANGED`

**含义**。`run.json.gstack_version` 点名的 gstack 与正在运行的不同。对更老的运行（或该字段出现之前写下的），这只是通知：命令把 `gstack_version_changed` 记入日志、跑前向迁移（例如改写 1.91.95 之前铸造的决策 id）后继续。对更新的 gstack 写下的运行则拒绝——更老的 runner 不可能认识更新的状态。

**修法**。通知无需处理。拒绝的，在本机升级 gstack（`bin/gstack-upgrade`）后重跑命令。

<a id="artifact-gate-unsettled"></a>
### `ARTIFACT_GATE_UNSETTLED`

**含义**。`gstack-artifact validate` 发现某运行状态为 `complete`，而其最后一个门禁修订仍有审批项 pending，或某条被接受的计划变更（`run.json.amendments`）仍 pending。runner 绝不写出这种状态；它来自手改或更老的 runner。

**修法**。用 `gstack-autoplan answer` 回答门禁直到没有 pending 审批，并对每条 pending 修正 `revise --incorporates` 或 `--withdraw`。

<a id="ios-launch-env-invalid"></a>
### `ios-qa launch: GSTACK_IOS_LAUNCH_ENV ... so the app was not launched (<detail>); fix: ... (IOS_LAUNCH_ENV_INVALID)`

**含义**。`gstack-ios-qa-daemon` 每次启动被测应用时都会把 `GSTACK_IOS_LAUNCH_ENV` 转发给 `xcrun devicectl device process launch --environment-variables`。取值必须是键为环境变量名、值为字符串的 JSON 对象，且不得设置 `GSTACK_` 变量（该命名空间归调试桥所有）。其他任何形态（非法 JSON、数组、数值、`GSTACK_` 键）都会拒绝启动——缺了环境开关型调试桥所需变量的启动，看起来就像一个没有桥的正常应用。detail 点名键与其类型，绝不点名值。v1.91.101.0 之后的发布加入。

**修法**。在启动守护进程的 shell 里（macOS 终端，或带设备的 Mac 上的 Claude Code）：

```bash
export GSTACK_IOS_LAUNCH_ENV='{"DEBUG_BRIDGE":"1"}'
```

或 `unset GSTACK_IOS_LAUNCH_ENV`，然后重启 `gstack-ios-qa-daemon`。

<a id="outside-voice-unavailable"></a>
### `Outside voice unavailable: <cause>. Fix: <fix>. Continuing to ... (OUTSIDE_VOICE_UNAVAILABLE)`

**含义**。`/plan-ceo-review`、`/plan-eng-review` 或 `/plan-devex-review` 在没有第二意见的情况下运行了。外部提供者（Codex，或 Codex 宿主下的 Claude Code）没跑成或失败，原生兜底也交不出有界评审。该兜底在后台分发内建的 Plan 子 agent、旁边放一个五分钟后台计时器，先结束的一方把另一方停掉。cause 点名缺的是哪块：`Plan agent type not offered`、`TaskStop not offered`、`background tasks unavailable`、`no complete report within five minutes`、或失败状态。评审日志行把同一 cause 记作 `unavailable_reason`。Claude Code 2.1.277 移除了兜底从前用的 TaskOutput 工具，所以在较老的 gstack 上，当前 Claude Code 的每次原生兜底都终结于此。

**保留了什么**。原生计划评审本身是完整的。该行以 `status: unavailable` 记录，绝不记成干净评审；迟到或部分的评审者结果不计入。

**修法**。修好行内点名的提供者：安装它，或跑 `codex login`（你的终端或 Git Bash）。原生兜底的，用 Claude Code 2.1.277+ 并启用后台任务（取消 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS`，不开裸模式）。然后重跑评审。

**预期结果**。一份 `OUTSIDE VOICE (...)` 报告；提供者运行时则是 `CODEX SAYS (plan review — outside voice)`。

<a id="artifact-machine-path"></a>
### `ARTIFACT_MACHINE_PATH`

**含义**。autoplan 运行的公开拷贝仍含运行在本机记录的路径：其运行目录、家目录、计划所在目录、检查点目录或 worktree 根。`gstack-artifact validate --public <dir> --private <run>/run.json` 逐条报告命中的 file:line；`gstack-autoplan export --public` 在暂存拷贝上跑同一检查，失败时不写任何东西。

**修法**。用 `gstack-autoplan export --out <run> --public <dir>` 导出：它把记录的根改写为仓库相对路径或 `<local notes (not committed)>`。导出从不改写 plan.md 的行内代码与围栏块，那里的命中需要改计划：改路径、`revise`、再导出。不属于记录根的泛型家目录路径是 WARN 行，不算错误。

<a id="artifact-owner-words"></a>
### `ARTIFACT_OWNER_WORDS`

**含义**。autoplan 运行的公开拷贝仍在引用所有者本人的话：私有运行记录下的门禁回复（在决策行、门禁或日志上）、被携带门禁复用的话、或某人为
推延某个阶段给出的理由，无论是行文还是 gstack 对该理由的某种转写。人写下的东西没有他的点击就不会离开。3 个词以上的回复无论整体出现在哪都算引语；8 词以上的回复任意连续 8 词都算——比对时跨标点、换行、JSON 转义、实体、HTML 与 Markdown 标记、不可见格式字符、缩写与大小写。1–2 词的回复不扫；所有者从早先他没写的文本里回声出来的词不算他的（但回复在回声之上新增的词算）。见[公开拷贝](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#the-public-copy)。`gstack-artifact validate --public <dir> --private <run>/run.json` 逐条报告引语的 file:line；`gstack-autoplan export --public` 在暂存拷贝上跑同一检查，失败时不写任何东西。错误从不打印那些词本身。

**修法**。用 `gstack-autoplan export --out <run> --public <dir>` 导出：它丢弃那些字段，把行文与密封评审文件里的每处引语或转写替换成 `[owner words redacted]`。导出从不改写 plan.md 的行内代码与围栏块，那里的引语需要改计划：删掉、`revise`、再导出。

<a id="artifact-public-target-exists"></a>
### `ARTIFACT_PUBLIC_TARGET_EXISTS`

**含义**。`gstack-autoplan export --public <dir>` 在 `<dir>` 里发现了不属于同一运行早先公开拷贝的文件，拒绝覆盖。

**修法**。换空的或新目录，或指向已持有该运行公开拷贝的目录（整体替换）。

<a id="prereg-diagnostic-untested"></a>
### `PREREG_DIAGNOSTIC_UNTESTED`

**含义**。`gstack-eval-plan prereg --check <file> --allow-repo-commands` 在合成 fixture 上运行了预注册声明的 summarizer（`## Diagnostics`：`summarizer:`、`fixture:` 与每行一个 `| diagnostic | expected |`）。结果与预注册定义不符：计数有差（`mismatch`）、声明的诊断缺席（`missing`）、报告了没人预注册的诊断（`undeclared`）、或 summarizer 失败、超时、stdout 结尾不是单个计数 JSON 对象。每行 `PREREG_DIAGNOSTIC:` 点名一个诊断。这正是 gbrain-evals #162（D7）的形态——两个诊断计数在付费后需要修正案。

**修法**。修 summarizer，或改定义（期望计数或 fixture），直到每行都说 `ok`，然后提交冻结。`PREREG_DIAGNOSTICS:` 行的 `sha256` 绑定你测过的 fixture。不带 `--allow-repo-commands` 时，命令列出 summarizer（`PREREG_COMMAND:`）并以退出码 3 结束（`REPO_COMMANDS_NOT_ALLOWED`），因为 summarizer 是仓库命令。

<a id="eval-models-invalid"></a>
### `EVAL_MODELS_INVALID`

**含义**。`.gstack/eval-models.json` 读不了或校验失败。原因包括 JSON 错误、`schema_version` 不是 1、`allow` 缺失或为空、未知键或 scope、`families` 里出现 glob、一个 id 出现在两个 family、或 family 把旧 id 排在 gstack 当前目录模型之前。工作树副本存在而 `origin/<base>` 解析不了时同样触发。规则无效期间，任何组都过不了。

**修法**。按输出行所说修文件（`docs/eval-models.md`），走经评审的 PR；或 fetch 基础分支。要测未合并的修改，用 `--models-from head`。

<a id="eval-model-denied"></a>
### `EVAL_MODEL_DENIED`

**含义**。某组的模型命中 `deny` 或其 scope 的 `deny`；没命中任何 `allow` 条目（未知 id 一律拒绝）；或没命中其 scope `allow` 清单的任何条目。`EVAL_MODEL:` 行点名规则。

**修法**。选规则在该 scope 允许的模型。冒烟运行传 `--scope smoke`（`price-gate` 用每个调用行的 scope）。改规则就在经评审的 PR 里编辑 `.gstack/eval-models.json`。

<a id="eval-model-old-generation"></a>
### `EVAL_MODEL_OLD_GENERATION`

**含义**。规则声明了 `families`（新者在前），而某组用的 id 不是其 family 的第一个。

**修法**。用该 family 最新的 id（`EVAL_MODEL:` 行已点名）。顺序错了就在经评审的 PR 里修 `families`。

<a id="eval-model-generation-unresolved"></a>
### `EVAL_MODEL_GENERATION_UNRESOLVED`

**含义**。规则声明了 `families`，每组都必须是其 family 最新一代。这个组的模型不在任何 family 里，代次无从核验，该组失败而不是未经检查放行。

**修法**。在经评审的 PR 里把该模型加进 `.gstack/eval-models.json` 的所属 family（新者在前），或换用某个 family 列出的模型。

<a id="wtree-unavailable"></a>
### `gstack-pregate: cannot fingerprint the working tree: bin/gstack-wtree could not start (on Windows, no Git Bash was found) or it ran and failed (<detail>); fix: <fix> (WTREE_UNAVAILABLE)`

**含义**。`gstack-pregate` 在任何检查运行前用 `bin/gstack-wtree` 给工作树做指纹，做不到就以退出码 3 拒绝。两种成因，输出行指明是哪种：

- **起不来**。Windows 上找不到运行脚本的 Git Bash。detail 按[`BASH_UNAVAILABLE`](#bash-unavailable)所述的顺序列出试过的每个候选及落选原因（`GSTACK_GIT_BASH (unset): not set; git --exec-path …; install path …; PATH bash: …`）。macOS/Linux 上则意味着 `bin/gstack-wtree` 缺失。
- **跑了但失败**。detail 是脚本自己的消息，修法是它打印的修复，例如 `set TMPDIR to a writable directory`。

在此之前，两种情况都报成 `policy source unavailable: origin/<base> is not a resolvable commit`、修法给 `git fetch`——什么也改不了。

**修法**。按输出行打印的修法执行。Windows 场景把 gstack 指向 Git Bash 的 `bash.exe`，再重跑 `gstack-pregate`：

- Git Bash（仅本 shell）：`export GSTACK_GIT_BASH='C:/Program Files/Git/bin/bash.exe'`
- Windows PowerShell 5.1 或 PowerShell 7（仅本 shell）：`$env:GSTACK_GIT_BASH = 'C:\Program Files\Git\bin\bash.exe'`

要永久设置（Claude Code 下次启动时读取），照[`BASH_UNAVAILABLE`](#bash-unavailable)下的配方，或在 PowerShell 里 `winget install --id Git.Git -e` 安装 Git for Windows。

**`--json` 形态**。检查运行前的每次拒绝（本码、基础分支不可用、pin 文件无效）在 stdout 输出一个 JSON 对象：`{"ok":false,"status":"refused","code":"WTREE_UNAVAILABLE","detail":"…","fix":"…","docs":"…#wtree-unavailable"}`，退出码 3。运行的对象带同样的 `ok` 与 `status`（`complete` 或 `incomplete`），`status` 区分拒绝与运行。`--json` 之下 `GSTACK_RESULT:` 行走 stderr。

<a id="claude-md-skill-list"></a>
### `warn CLAUDE.md the gstack section in <file> lists <n> skills; Claude Code lists installed skills itself, and a pasted list goes stale with each release`

**含义**。`gstack-doctor` 在 `~/.claude/CLAUDE.md` 或本项目的 `CLAUDE.md` 里发现罗列技能的 gstack 小节：一行 `Available skills:`，或八个以上 `/skill` 名字。旧的安装提示曾要求贴这份清单（#3169）。Claude Code 本来就会列出每个已装技能及其描述，贴进去的清单会随每次发布过期，agent 会把不完整的清单当成全集。

**修法**。把该小节替换成诊断器打印的短块（不带技能清单；自己写的其他 gstack 规则保留）：

```
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
```

**预期结果**。下次 `gstack-doctor` 显示 `ok CLAUDE.md no gstack section lists skills (...)`。

<a id="policy-gstack-too-old"></a>
### `POLICY_GSTACK_TOO_OLD`

**含义**。基础分支的 `.gstack/ship-policy.json` 设了高于当前读取方 gstack 的 `min_gstack_version`。该策略使用的键在这个 gstack 眼里会被读错或读不到，所以每个 ship-policy 读取方（`gstack-restamp`、`gstack-tree-receipt`、`gstack-ship-queue`、`gstack-ship-policy`）都拒绝而不是猜测。比 `min_gstack_version` 更老的 gstack 会视该键为未知而以 `POLICY_INVALID` 失败（那个码会点名键名）。

**修法**。把 gstack 升级到消息点名的版本（`bin/gstack-upgrade`，或重跑会话安装）再重跑。编队负责人上调 `min_gstack_version` 时，等于同时抬高了编队的安装下限；`gstack-ship-policy validate` 打印 `MIN_READER:` 正是为此。

<a id="queue-not-ready"></a>
### `QUEUE_NOT_READY`

**含义**。`gstack-ship-queue ready` 不打印协调者可能误读的 READY 块：工作树有未提交的已跟踪改动；HEAD 不是 PR 已推送的 head（经 `gh pr view` 读取）；该确切 head 上的 CI 不绿（失败、pending 或读不到）；或预门禁结果缺失、失败、或记录在另一棵树上（`PREGATE_STALE`）。`--dispatch-ci` 之下还包括：一次以红收场的已分发工作流运行（红的运行不清任何预门禁车道）、或一次失败的 `gh workflow run`。`train land` 在槽位还不能合并时也用它：打戳提交上的检查不绿；`changelog_fragments.required_checks` 里某名字缺席或不绿；PR 的基础分支不再是列车的基础分支；分支仍读着钉定时打戳推送失败；`gh pr merge` 拒绝；或合并尚未在 main 上可见。`land` 在落地锁推送 origin 失败、且读不到 origin 的锁 ref 无法判断推送是否落地时同样用它。

**修法**。提交并推送，等该 head 上的 CI；树变了就重跑 `gstack-pregate run --allow-repo-commands`，然后重跑 `gstack-ship-queue ready --pr <n>`。拒绝前打印的块会显示哪一条还不成立。`train land` 的，照 `NEXT:` 做，然后重跑同一条 `train land` 命令——它会采纳自己日志里的打戳提交。落地锁读不到的，等 origin 有应答后重跑同一条 `land` 命令——它会恢复自己的锁。

<a id="queue-proof-missing"></a>
### `QUEUE_PROOF_MISSING`

**含义**。某个队列步骤缺少证明其声明所需的输入，或输入对不上：被门禁的 head 不是本地的提交；HEAD 与被门禁 head 的差异超出打戳范围（门禁从未覆盖这棵树）；一次带其他输入的更早打戳未完成；打戳日志的 head 移动了；或 gate-ahead 合并无法用 `git merge-tree` 重算。列车命令也用它：`train forget` 作用于不存在的记录、或仍在构建/运行/合并的列车；`train watch` 作用于未知记录；`verify --pr <n> --screen` 作用于没有可读裁决的运行（INCOMPLETE 或读不到的运行）；`verify --pr <n> --train <nonce>` 在 main 的树不匹配、且槽位是否已在 GitHub 合并读不到时（队列是否必须冻结未知；它绝不在读不到的状态下回答"没合并"）；`verify --pr <n> --train <nonce>` 在 GitHub 不报 PR 为 MERGED、且它不是打戳 diff 已与 main 一致的仅发布 PR 时；或读不到 PR 当前 head 时（`--no-fetch` 或 fetch 失败）——不冻结队列；`train land` 在基础分支或列车分支 fetch 不到、或记录的 T0 与 S_1..S_k 不是被门禁 head 的首父链（每个 S_i 的第二父是槽位 i 的钉定）时；`train land` 在 main 的树是槽位的 S_i 但 GitHub 不报 PR 为 MERGED 时（记录的槽位号或 merged 条目与 GitHub 不一致）；以及 `ready --screen` 在暂存合并分支推不出去时。除非 `QUEUE_STAMP_REFUSED:` 行写明 `committed=yes`，什么都没写。

**修法**。补齐点名的输入（fetch 被门禁 head、传当前基础 sha），或对你想打戳的树重新门禁。未完成的打戳：重跑同一命令续作，或还原其文件并删除 `.gstack/tmp/ship-queue/stamp-<pr>.json`。

<a id="queue-stamp-not-stamp-only"></a>
### `QUEUE_STAMP_NOT_STAMP_ONLY`

**含义**。`gstack-ship-queue stamp` 已提交打戳，而被门禁 head 与打戳 head 之间的树回执发现了打戳规则之外的差异（残差路径已打印）。门禁结果不覆盖那个 head。拒绝行写明 `committed=yes <sha>`。

**修法**。检查残差路径：丢掉杂散编辑重新打戳，或在打戳 head 上跑门禁。

<a id="queue-verify-mismatch"></a>
### `QUEUE_VERIFY_MISMATCH`

**含义**。协调者的 `gstack-ship-queue verify` 无法从 PR 的已推送提交复现车道的声明：head 移动了；head 与被门禁树的差异超出打戳；回执摘要与 `QUEUE_STAMP` 里的不一致；gate-ahead 记录的 `git merge-tree --write-tree` 得到另一棵合并树；记录的打戳补丁重建不出记录的被门禁树、或改动超出打戳；或前序 PR 在门禁之后移动了。

**修法**。不要合并。让车道在当前队列上重跑 `gstack-ship-queue stamp`（或 `gate-ahead`）并重新上报。

<a id="queue-gate-missing"></a>
### `QUEUE_GATE_MISSING`

**含义**。ship 策略设了 `full_e2e: true`，而没有通过的完整门禁结果绑定到正在打戳或核验的树：该被门禁 head 没有记录在案的 gate-ahead 尝试、没有在其上运行且 `--gate-exit 0 --gate-log <file>` 的结果、或记录的运行非零退出。列车命令也用它：PR 不在列车上；列车没有绿门禁；在已打戳列车上 `verify --train`、在普通列车上 `train land`（各自点名对方）。

**修法**。在 gate-ahead worktree 里跑策略 `gate_command` 点名的门禁，用 `gstack-ship-queue gate-ahead --record` 绑定；或把在被门禁 head 上通过运行的退出码与日志传给 `stamp`。

<a id="gate-ahead-attempt-invalid"></a>
### `GATE_AHEAD_ATTEMPT_INVALID`

**含义**。`gstack-ship-queue gate-ahead --record` 无法绑定门禁结果：该 PR 下尝试 id 未知；该尝试已持有不同结果；日志文件缺失；或该尝试的 worktree 不再持有被门禁提交（HEAD 移动或有已跟踪文件变更），结果会描述不了被门禁的树。

**修法**。`gstack-ship-queue gate-ahead --list --pr <n>` 显示每个尝试与当前者。记录仍在的尝试；或用 `gate-ahead --after <pr>` 准备新的，在那里跑门禁、不编辑已跟踪文件。

<a id="queue-train-off"></a>
### `QUEUE_TRAIN_OFF`

**含义**。合并列车命令（`train …` 或 `verify --train`）作用于一个 `.gstack/ship-policy.json` 未声明 `train` 块的基础修订——列车面关闭，适用按 PR 队列。什么都没写。

**修法**。用按 PR 队列（`ready --pr <n>`、`stamp`、`verify`），或先在基础分支落地带 `min_gstack_version` 的 `train` 块（[跑一次合并列车](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train)）。

<a id="queue-train-untrusted"></a>
### `QUEUE_TRAIN_UNTRUSTED`

**含义**。被钉定 PR 的 head 仓库不是基础仓库。列车分支及其分发带着仓库密钥运行，fork 的工作绝不上列车。`ready --dispatch-ci` 因同样理由拒绝 fork head 且不分发任何东西；`train land` 拒绝它且不推送任何东西。

**修法**。跑打印出的 `train build --prs <不含它的清单>`；fork PR 留在可信分支路径上。

<a id="changelog-fragment-invalid"></a>
### `CHANGELOG_FRAGMENT_INVALID`

**含义**。策略 `changelog_fragments` 目录下的一个 CHANGELOG 片段不是直接位于该目录的单个常规 `.md` 文件（带条目文字、可选 `bump:` front matter、无发布标题）；或超过 64 KiB；或同名片段已带着别的文字落地。没有分配或写入任何东西。见 [changelog 片段](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#changelog-fragments)。

**修法**。把点名的片段重写为扁平的 `<dir>/<slug>.md`，只含条目文字（与可选 `bump: minor|major` front matter）；名字已落地就改名。然后重跑。

<a id="queue-land-locked"></a>
### `QUEUE_LAND_LOCKED`

**含义**。另一次 `gstack-ship-queue land`、或某个 `train land` 槽位，持有仓库的落地锁（`refs/notes/gstack-land`），或抢在本运行之前拿走了它——本次会与之竞争合并到 main。拒绝行点名持有者及其阶段：落地是 `#<pr>`，列车是 `train <nonce> slot <i> (#<pr>)`。列车在阶段 `between` 期间——从一个已合并槽位到下一个槽位——一直持锁，独立落地无法插进槽位之间。

**修法**。等持有者完成。若它崩溃了，带 `--break-lock` 重跑——它会打印持有者（`LOCK_HOLDER:`）。以下情况该做法被拒绝：持有者不到 10 分钟前进入了推送或合并；列车处于槽位之间不到 10 分钟；以及活着的列车运行，除非同时传 `--break-train-lock`。阶段 `drift` 的锁靠落地其修复 PR 释放（[QUEUE_LAND_DRIFT](#queue-land-drift)）；阶段 `freeze` 的锁靠清除冻结的那次 verify 释放（[QUEUE_TRAIN_FROZEN](#queue-train-frozen)）。若那次释放推送失败，下一次 `land` 或 `train land` 在 fetch 到的冻结记录显示"锁写入之后冻结已清除"时接管该锁；`--break-lock` 永不如此。

GitHub 已应用但以错误应答的锁推送（HTTP 502）会对照 origin 的 ref 检查并计为已写入，所以重跑不带 `--break-lock` 就能续用本运行自己的锁。

<a id="queue-train-unstamped"></a>
### `QUEUE_TRAIN_UNSTAMPED`

**含义**。`verify --pr <n> --train <nonce>` 发现自己将要放行合并的槽位 head 没有打上自己的戳：head 的 `VERSION` 不高于 main 的；或其 CHANGELOG 顶部小节的标题版本不是直接位于 main 顶部发布之上（或保留着 main 没有的 `[Unreleased]` 小节）。该行点名规则、head 的版本与 main 的版本。列车 33 就这样合并了 #3527（一次无提交的基础合并、一次文件从未暂存的 restamp、一个裸提交），并按 #3526 的版本发了它。什么都没合并。

**修法**。车道上对该 head 跑 `gstack-restamp --next`，提交 restamp 暂存的内容，推送，然后重跑 verify。

<a id="restamp-not-staged"></a>
### `RESTAMP_NOT_STAGED`

**含义**。`gstack-restamp` 写好了打戳但 `git add` 失败——一次裸 `git commit` 会漏掉打戳。文件保持已写入状态，`.gstack/tmp/restamp-staging.json` 记录还有哪些待暂存。

**修法**。清掉阻碍 `git add` 的东西（例如残留的 `.git/index.lock`）再重跑 `gstack-restamp`；重跑是一次 noop，会把它写的文件暂存进去。若其中任何文件在 restamp 写入后又被改动（你手工提交过、切过分支或合并过基础分支），标记就过期了：noop 重跑会丢弃它且什么都不暂存，仍欠着的打戳照常重新打上。

<a id="restamp-unstaged-edits"></a>
### `RESTAMP_UNSTAGED_EDITS`

**含义**。`gstack-restamp` 要打戳的某个文件里有你未暂存的编辑。restamp 会暂存它写的内容，那些编辑会顺路混进打戳提交。什么都没写。

**修法**。把你在点名文件上的编辑暂存（`git add`）或 stash，然后重跑 `gstack-restamp`。

<a id="queue-land-conflict"></a>
### `QUEUE_LAND_CONFLICT`

**含义**。PR 与基础分支在某个产品文件上冲突（或某个无法单独消解的发布字段，比如清单里真实的依赖冲突），合并步骤无法给它打戳。什么都没推送。

**修法**。车道把基础分支合并进 PR，消解点名文件，重跑 /ship 并重新上报 READY。

<a id="queue-land-drift"></a>
### `QUEUE_LAND_DRIFT`

**含义**。squash 合并之后，基础分支的树不是基础 `land` 打戳时那棵打戳树：在最后一次检查与合并之间混进了一次 `land` 之外的合并。锁保持被持有，处于阶段 `drift`，这样就不会有别的落地在一个现已失真的发布记录上做分配。

**修法**。跑 `gstack-ship-queue land --pr <n> --repair`。它会开一个 PR，唯一改动是为外部合并带来的内容补一个片段。对它跑 /ship 并落地；那次落地会接管锁并释放它。然后查清是什么在 `land` 之外合并的。

<a id="queue-land-base-busy"></a>
### `QUEUE_LAND_BASE_BUSY`

**含义**。在两次允许的 restamp 中，基础分支每次都在打戳提交的 CI 期间移动，于是 `land` 停手，不再打第三次戳。

**修法**。查清是什么在 `land` 之外合并（每次合并都应经它），然后重跑 `gstack-ship-queue land --pr <n>`；锁已释放，重跑会从钉定（pin）重新打戳。

<a id="queue-land-stamped"></a>
### `QUEUE_LAND_STAMPED`

**含义**。在 `merge: direct` 下，PR 改动了 VERSION、`package.json` 版本或 CHANGELOG。版本与 CHANGELOG 在发布时设定，所以 PR 只应带上自己的 `changelog.d` 片段。什么都没合并。

**修法**。车道跑拒绝信息打印的命令，例如 `git checkout $(git merge-base origin/main HEAD) -- VERSION CHANGELOG.md`（被点名时把 `package.json` 版本手工改回去），保留或补上带条目文字的片段，提交，然后在新 head 上跑 /ship 和 `gstack-ship-queue ready --pr <n> --no-screen`。

<a id="queue-land-pin-moved"></a>
### `QUEUE_LAND_PIN_MOVED`

**含义**。PR head 不是 `land --pin` 收到的那个钉定（pin），所以 READY 描述的不是将要合并的内容。什么都没合并。

**修法**。车道在新 head 上跑 /ship 和 `ready --pr <n> --no-screen`，发送新的 READY；落地那个钉定即可。

<a id="queue-land-checks"></a>
### `QUEUE_LAND_CHECKS`

**含义**。钉定处的某个检查是红的或进行中，或某个必需检查在那里从未运行。什么都没合并。

**修法**。进行中：`gstack-pr-wait <n> --until green`，然后重跑 land。红：车道在新 head 上修复（不稳定用例按规则 16 享有唯一一次重跑）。缺失：在分支上分发那个工作流，然后重跑 land。

<a id="queue-land-merged-checks"></a>
### `QUEUE_LAND_MERGED_CHECKS`

**含义**。`origin/main` 自钉定的合并基之后移动了，而某条 `land.merged_checks` 命令在"钉定合并到 main 顶端"上失败。消息点名该命令、其退出码与最后的输出行。什么都没合并。

**修法**。车道把 `origin/main` 合并进分支，修复命令点名的问题，推送，等必需检查，在新 head 上跑 /ship 和 `ready`，并发送新的 READY。

<a id="queue-land-not-clean"></a>
### `QUEUE_LAND_NOT_CLEAN`

**含义**。GitHub 未把该 PR 报为 `MERGEABLE` 和 `CLEAN`；或在陈旧的基础分支上，钉定与 main 顶端冲突（消息点名文件）。什么都没合并。

**修法**。`CONFLICTING`：车道把基础分支合并进自己的分支，消解冲突，在新 head 上跑 /ship 和 `ready`。`UNKNOWN`：GitHub 仍在计算，稍等片刻重跑 land。`BLOCKED` 或 `BEHIND`：满足它点名的分支规则。

<a id="queue-land-unverified"></a>
### `QUEUE_LAND_UNVERIFIED`

**含义**。GitHub 合并了该 PR，但基础分支合并提交的树不是"钉定合并到那个提交的父提交"——评审过的钉定之外的东西进了 main；或合并提交的父提交既不是钉定、也不是 land 检查过的基础分支——main 在 land 的检查与合并之间移动了，随后 `land.merged_checks` 在已落地的树上失败，或基础策略没有列任何检查。没有写入落地备注（land note）。

**修法**。树不匹配：用 `git merge-tree --write-tree <parent> <pin>` 对比合并提交，还原不属于该 PR 的内容，并上报 Captain。父提交不在钉定之内：在合并提交处对 main 跑免费检查；若有红的，向前修复（fix forward）或回退该 PR，并上报 Captain。

<a id="release-stamp-empty"></a>
### `RELEASE_STAMP_EMPTY`

**含义**。`gstack-release-stamp open`（或 `gstack-restamp --release`）在基础分支上没找到 changelog 片段，没有可发布的内容。没有创建分支或 PR。

**修法**。无事可做。下一次发布打戳会卷入期间各 PR 落地带来的任何片段。若当前 VERSION 还没有标签（tag），stable 切割仍会给它打标。

<a id="release-stamp-invalid"></a>
### `RELEASE_STAMP_INVALID`

**含义**。两种情况之一。要么发布打戳被要求在 `origin/<base>` 的干净检出之外运行，或基础策略没有 `changelog_fragments`。要么 `land --pin`（或版本门禁）收到的 `release/<version>` head 超出了其合并基的发布打戳：它改动了打戳之外的文件、删除了某个发布产物、跳过或添加了片段，或携带的版本不是基础版本加上各片段的递升（bump）。什么都没写入或合并。

**修法**。关掉有问题的发布 PR，重跑 `gstack-release-stamp open`。它会在 `origin/main` 的全新检出上打戳。绝不要手工编辑 `release/<version>` 分支。

<a id="queue-train-stamp-mismatch"></a>
### `QUEUE_TRAIN_STAMP_MISMATCH`

**含义**。构建打戳列车（`changelog_fragments`）时，某个前缀 S_i 无法打戳；或它不是 S_(i-1) 与其钉定在打戳意义下的合并（modulo stamps）；或它改写了更早的发布条目；或它在发布路径之外与普通前缀 T_i 不同。什么都没推送或分发。见[打戳列车](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-land)。

**修法**。读点名的槽位与文件。写产品文件的打戳钩子（`restamp_command`、`release_tool`）在钩子里修；无效片段退回其车道。否则去掉该槽位重建列车并上报。

<a id="queue-train-moved"></a>
### `QUEUE_TRAIN_MOVED`

**含义**。某个 PR 的 head 不再是列车钉定的 SHA（构建时，或 verify 时超出其钉定且差异不止打戳），列车测试的将不是要合并的内容。在前序槽位已合并后的 verify 处，队列还会冻结（`QUEUE_TRAIN_FROZEN`）。在 `train land` 处，指某个 PR head 或分支偏离了钉定（或偏离 land 自己的打戳提交）；land 从不覆写它。

**修法**。让车道在新 head 上给出新的 READY，然后用新钉定构建列车（`train build --prs <n>@<新 sha>,…`）。

<a id="queue-train-conflict"></a>
### `QUEUE_TRAIN_CONFLICT`

**含义**。把某个 PR 合并到它之前的前缀上时，在版本文件与 CHANGELOG 之外发生冲突。来自 `train build` 时，`QUEUE_TRAIN_CONFLICT:` 行点名该 PR、冲突文件以及排在它之前合并的 PR；这项检查先于填充规则运行，所以正在填充的列车也会发现它。来自 `ready --no-screen` 时，前缀就是基础分支本身：`BASE_OVERLAP:` 行点名自 head 分叉以来基础分支移过来的文件，列车会停在这个 PR（在 `--screen` 下同样的冲突是 `QUEUE_SCREEN_STALE_REF`）。什么都没分发，也没有推送分支。

**修法**。来自 `train build`：跑打印出的 `train build --prs <去掉该 PR 的清单>`。该 PR 的车道把冲突上报控制器，并按其指令（编队模板规则 14）把 main 合并进钉定（前序 PR 落地后连带它们），消解冲突，推送，跑 /ship，再次上报 READY。

<a id="queue-train-free-red"></a>
### `QUEUE_TRAIN_FREE_RED`

**含义**。分发到 `train/<nonce>` 上的免费测试红了、被取消、缺失（`--free-timeout` 之前没出现 `workflow_dispatch` 运行）或跑在了别的 SHA 上，因此付费门禁没有分发。

**修法**。读免费测试运行。PR 导致的红就剔除该 PR（`train build --prs <去掉它的清单>`）；不稳定测试在下一次构建前交给其负责人。

<a id="queue-train-dispatch-unknown"></a>
### `QUEUE_TRAIN_DISPATCH_UNKNOWN`

**含义**。尝试了一次列车分发，但没有出现携带其 nonce 的运行，是否启动未知（`gh workflow run` 可能在 GitHub 接受分发之后仍失败）。绝不会盲目地再次分发。

**修法**。跑 `gstack-ship-queue train status --train <nonce>`。它会认领携带该 nonce 的运行，或把分发标记为缺席；只有此后 `train build --train <nonce>` 才会在同一 nonce 下再次分发。

在带 `gates` 的列车上，每个前缀最多发送两次工作流。两次发送都没出现携带 nonce 的运行时，`train build`（和 `train watch`）以本代码拒绝而不是发第三次：跑 `train doctor`（run-name 少了 nonce 是常见原因），在基础分支上修好工作流，然后构建新列车。

<a id="queue-train-waiting"></a>
### `QUEUE_TRAIN_WAITING`

**含义**。列车上的 PR 少于 `train.max_size`，且其最早的 READY PR 等待时间不足 `train.fill_hours`，所以暂不分发。消息会打印何时分发。临时合并已经跑过：其上方的 `MERGE_CHECK: T1..T<k> merge clean onto <base>@<sha>` 行说明每个入列钉定都能按槽位顺序干净合并（合不上的钉定会报 `QUEUE_TRAIN_CONFLICT`）；`#<pr> BASE_OVERLAP:` 行点名某个钉定——自它分叉以来基础分支的改动压到了它的文件上。

**修法**。补充 READY PR、在打印的时间之后重跑，或传 `--urgent` 组一个单 PR 列车。

<a id="queue-train-pending"></a>
### `QUEUE_TRAIN_PENDING`

**含义**。列车运行（免费测试、完整门禁或二分）尚未结束，还没有裁决。同一代码还覆盖：到达超时的 `train watch`；仍在运行的 screen 运行上的 `verify --pr <n> --screen`；尚未落定的检查上的 `verify --post-merge`；在其 `--timeout` 内仍在运行的 `ready --dispatch-ci` 工作流运行；其他进程持有列车租约或正跑其命令门禁时的 `train build` 或 `train verdict`；以及前序槽位的合并后检查尚未落定的 `train land`——每处都把要重跑的命令打印为 `NEXT:`。

**修法**。稍后重跑打印的 `NEXT:` 命令。运行进行期间什么都不会再次分发。

<a id="queue-train-incomplete"></a>
### `QUEUE_TRAIN_INCOMPLETE`

**含义**。列车门禁没有完成其清点（census）：INFRA 或 INCOMPLETE 面板；未绑定、部分或被取消的 shard；某个 slice 在上传前被杀；绑定到其他 nonce、head 或树的记录；或没有已发布的记录。不完整的门禁绝不判绿。

**修法**。当每个缺口都被机器归类为 INFRA 或 INCOMPLETE 时，用 `EVAL_POLICY.infraRedispatch` 允许的唯一一次重派（`train rebuild --train <nonce> --infra`）并上报两次运行。否则诊断该运行。

在带 `gates` 的列车上，指某个前缀门禁不完整（例如某个必需 job 被跳过或从未运行）；`PREFIX:` 行点名该运行。`train rebuild` 会拒绝，所以诊断那次运行并构建新列车。

<a id="queue-train-red"></a>
### `QUEUE_TRAIN_RED`

**含义**。列车的完整门禁在列车树上红了；消息点名红的用例。其 PR 不合并，也没有任何重试来改变裁决。

**修法**。对红的用例做二分（`train bisect --train <nonce> --spend-cap <usd>`）。重建后的第二次红，把用例转给修复车道。

在带 `gates` 的列车上没有二分：T<i> 是绿前缀之后的第一个红前缀，且其后每个前缀都红，所以槽位 i 是元凶。它之前的槽位照常落地（`train land`，或 `train watch --land`），元凶退回其车道，`NEXT:` 把其余的构建成新列车。

<a id="queue-train-red-on-main"></a>
### `QUEUE_TRAIN_RED_ON_MAIN`

**含义**。二分发现红的用例在每个前缀上都红，包括 main（T0）：坏的是 main，不是列车的 PR。

**修法**。先在 main 上向前修复（一个单 PR 列车），然后原样重建本列车。

在带 `gates` 的列车上不跑二分：T0（main）在自己的门禁运行上就红，或除了恰好槽位 1 的 `FIXES_BASE_RED` 用例之外还有任何红。

<a id="queue-train-unattributed"></a>
### `QUEUE_TRAIN_UNATTRIBUTED`

**含义**。二分模式既不归咎任何 PR 也不归咎 main：全绿，或不单调。每个前缀一次试验分不清不稳定（flake）与真坏。

**修法**。全绿：用预注册的唯一一次重建（`train rebuild --train <nonce>`），上报两次运行。其他任何模式：交修复车道，修复合并后再构建内容有变的列车。

在带 `gates` 的列车上，指红前缀之后跟着绿前缀。修复红的用例，或用 `--order` 换个顺序入列 PR；`train rebuild` 会拒绝，本列车再也不会原样运行。

<a id="queue-train-bisect-capped"></a>
### `QUEUE_TRAIN_BISECT_CAPPED`

**含义**。二分的预留价格（每个用例×前缀的试验；无成本数据的试验按 `train.trial_reservation_usd` 计）超过了 `--spend-cap`。放得下的前缀已启动，已完成的前缀保留，结果保持未归因；绝不判绿。

**修法**。用更高的上限续跑（`train bisect --train <nonce> --spend-cap <usd>`）。只有尚无结果的前缀会运行。

<a id="queue-train-prefix-invalid"></a>
### `QUEUE_TRAIN_PREFIX_INVALID`

**含义**。某个二分前缀不是 `train/<nonce>` 上列车 head 的祖先（分支移动了），或某个红用例不在门禁的计划里，二分输入在任何分发之前被拒绝。

**修法**。检查 `train/<nonce>` 是否仍指向记录的 head（`train status`）。移动过的分支需要新列车。

<a id="queue-train-rebuild-refused"></a>
### `QUEUE_TRAIN_REBUILD_REFUSED`

**含义**。不允许 `train rebuild`：没有二分记录（或带 `--infra` 时，没有仅含 INFRA/INCOMPLETE 的清点）；二分不是全绿；或该列车已经重建或重派过一次。

**修法**。把红的用例转给修复车道；只有修复合并之后才重建列车（内容有变的列车）。

<a id="queue-train-tree-mismatch"></a>
### `QUEUE_TRAIN_TREE_MISMATCH`

**含义**。main 的树既不是列车在本 PR 之前的前缀、也不是之后的前缀（打戳除外）——合并将发布门禁没测过的东西。合并之后，main 若仅在与 PR 后前缀的 CHANGELOG 上不同、且恰是其首父的 CHANGELOG 加上 PR 自己的条目（合并前 verify 对 head 适用的同一条规则），不算失配（[CHANGELOG 前后一条规则](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#run-a-merge-train)）。对打戳列车，`train land` 精确比对树：合并前 main 必须是 S_(i-1)，槽位检查期间不得移动，合并后必须是 S_i（[打戳列车](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-land)）；main 等于更早前缀时拒绝且不冻结，并点名应先落地的槽位。

**修法**。停止合并。若列车中某个 PR 已合并（已核验，或 GitHub 报 MERGED 而无核验过的树——包括槽 1 自己的 squash），队列现已冻结（`QUEUE_TRAIN_FROZEN`）；否则在当前 main 上新建列车。当槽位是否已在 GitHub 合并读不到时，verify 以 `QUEUE_PROOF_MISSING` 拒绝而不给任一答案；等 `gh pr view` 有应答后重跑。

<a id="queue-train-stale"></a>
### `QUEUE_TRAIN_STALE`

**含义**。verify 发现 main 的树在本列车前缀之外，但列车每个槽位都已在 GitHub 合并、且 main 的 SHA 是另一列车 verify 确认过的前缀——记录是陈旧的：它的 PR 已落地、后续列车把 main 推进了。拿今天的 main 与前缀比对证明不了任何事，所以不冻结队列、也不分发后盾（列车 24 的记录在列车 28 已核验的 main 上两样都干了，#3519）。其他列车在 notes ref 之后读取，所以从没跑过后继列车的机器也看得见它。

**修法**。`gstack-ship-queue train prune --stale --train <nonce>` 结清记录。当某槽位未合并、没有任何列车核验过 main 的 SHA、或 verify 带 `--no-fetch` 运行时，照旧冻结（`QUEUE_TRAIN_FROZEN`）。被别的机器冻结过的队列保持冻结；拒绝信息打印其冻结行。

<a id="queue-train-base-red"></a>
### `QUEUE_TRAIN_BASE_RED`

**含义**。条件（基础红）PR 或其修复者搭不上这列车。列车策略没有 `gates`；修复者缺席或不在槽 1；两个 PR 都声明 `FIXES_BASE_RED`；条件已过期；或修复者自己的前缀 T1 是红的。

**修法**。把修复者安排到带门禁列车的槽 1 重新构建。红的修复者前缀由修复者车道修理；过期条件由其车道重新分类（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-gates)）。

<a id="queue-train-spend-cap"></a>
### `QUEUE_TRAIN_SPEND_CAP`

**含义**。某个命令门禁的下一次 Ubicloud 运行会超出该门禁在本列车上的支出上限，或 `UBI_OWNER` 未设置。没有更多运行；已完成的运行保留其结果。

**修法**。把 `UBI_OWNER` 设为你的线程代号，重跑 `train build --train <nonce>`。上限问题：在基础分支上调高 `spend_cap_usd`（或调低 `timeout_sec`），然后在新 main 上建新列车——策略提交会把 main 推过 T0。

<a id="queue-train-land-method"></a>
### `QUEUE_TRAIN_LAND_METHOD`

**含义**。本槽位必须经更新提交落地（打戳列车、严格保护、条件 PR 或发布文件决议），而 `train.land.merge_method` 是 `rebase`——那会重放提交而不是落地被门禁的树。

**修法**。在基础分支把 `merge_method` 设为 `squash` 或 `merge`，然后在新 main 上建新列车：策略提交会把 main 挪出本列车的前缀。

<a id="queue-train-init-refused"></a>
### `QUEUE_TRAIN_INIT_REFUSED`

**含义**。在途 PR 会升版本，而策略既没声明 `changelog_fragments` 也不在合并时打戳，每次列车合并都会在版本上冲突。`VERSION_PRS:` 行点名它们。

**修法**。在基础分支采纳 `changelog_fragments`（推荐）或 `queue_mode: stamp-at-merge`，再跑 `train init`。

<a id="queue-train-doctor-findings"></a>
### `QUEUE_TRAIN_DOCTOR_FINDINGS`

**含义**。生效的列车块与仓库不一致。每行 `FINDING:` 点名一个问题：门禁工作流缺失、缺 `nonce` 输入或运行名；定义之外又要求某个 job；全局并发组；`train-prefix/` ref 上的 push 触发；工作流在基础分支从未绿过；命令门禁上限低于整列列车预留；GitHub 拒绝的合并方式；或以 `rebase` 作合并方式。

**修法**。在基础分支修好每项发现（`train init` 打印代码片段），再跑 `train doctor`。

<a id="queue-base-red-no-train"></a>
### `QUEUE_BASE_RED_NO_TRAIN`

**含义**。`ready --base-red` 或 `--fixes-base-red` 需要一列对每个前缀都门禁的列车，而基础策略没有带 `gates` 的列车块。

**修法**。等基础分支通过那些用例后跑 `/ship --resume`，或在基础分支开启带门禁的列车。

<a id="ship-base-red-fixer"></a>
### `SHIP_BASE_RED_FIXER`

**含义**。`ready --base-red` 没点名修复者、回执没有 `base_red` 块、或条件是在更旧的基础分支上分类的。

**修法**。传 `--fixer <pr>` 点名其合并能修好那些用例的 PR；基础分支移动后，先跑 `gstack-base-red classify` 与 /ship。

<a id="queue-train-frozen"></a>
### `QUEUE_TRAIN_FROZEN`

**含义**。一列列车在发布途中停下，main 持有一个没有任何门禁单独覆盖过的前缀。`QUEUE_TRAIN_FROZEN:` 行列出已合并的 PR（GitHub 报 MERGED 的槽位按合并计，树核验与否不论，原因会写 `merged on GitHub without a verified tree`，修复重建时绝不会再安排它）、main 的树、以及在 main 的 SHA 上分发的后盾运行。记录构建自决定冻结的那一次 GitHub 读取：读到 MERGED 的槽位就算已合并，哪怕片刻之后 `gh pr view` 停止应答；在另一槽位已合并时读不到状态的槽位，不进 `unmerged`、在原因里点名（`#<n> unreadable on GitHub, left out of unmerged; seat it in a train by hand once gh pr view answers`）——这样修复后的重建绝不会安排一个可能已经进去的 PR；记录把它放在 `unreadable` 下，`unreadable:` 行打印它，修复后的 `NEXT:` 点名它做一次 `gh pr view` 检查。冻结存在于本地状态与 `refs/notes/gstack-trains`。普通列车与其他列车的合并都被拒绝，直到一次修复落地。

**修法**。以其确切 head 接纳一个修复 PR（`train build --repair --prs <n>@<sha>`）。当 verify 在绿记录中发现该合并之后的 main 树，冻结解除；随后 `NEXT:` 用仍未合并的 PR 建新列车。

`merge: direct` 之下列车关闭，main 后盾变红（行内的 `train backstop`）会以同样方式冻结 `land --pin`。用 `gstack-ship-queue land --pr <n> --pin <sha> --repair` 落地这一个修复。它照常跑所有钉定检查，然后在落地锁之下把修复记入冻结（`REPAIR: #<n>@<sha> admitted under the land lock`）并落地；冻结保持激活。下一次 main 后盾在其门禁对该 main 为绿时清除冻结（`BACKSTOP: freeze cleared (repair #<n>; backstop <run> green on <sha>)`）。main 的策略声明 `release_gate` 后，后盾退场：`land --pin` 对之前遗留的后盾冻结只警告（`FREEZE: warn only:`）并照常落地；当绿发布门禁落在一个包含冻结时 main 的提交上，`release-cut` 也会放行该冻结（[release_gate](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#direct-freeze)）。已接纳的修复在其记录的钉定处合并、而尚无后盾评判它时，第二个 `--repair` 被拒绝；从未在彼处合并的修复则让位。见 [direct 冻结](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#direct-freeze)。

<a id="backstop-freeze-stands"></a>
### `BACKSTOP: green, but the freeze stands`

**含义**。main 后备门禁把 main 判绿，但活动中的冻结缺少解除所需的证据：没有接纳修复；被接纳的修复没有 `land` 备注（它在 `land --pin --repair` 之外被合并）；main 不包含那次合并；main 不在冻结 main 处或其后；或 main 已越过被门禁的提交（由那次推送的后备来裁决）。列车的冻结改经其修复列车的 verify 解除。

**修法**。用 `gstack-ship-queue land --pr <n> --pin <sha> --repair` 落地修复。已在记录钉定处合并但没有 `land` 备注的修复（合并后树检查没能完成），重跑该命令即获得备注——它直接进入树检查。冻结期间 main 不动，后备只在推送时运行，于是按该行点名的命令对同一提交再门禁一次：`gh run rerun <后备运行 id> -R <owner/repo>`。除此之外没有任何东西能解除冻结。

<a id="backstop-red-frozen"></a>
### `BACKSTOP: red, and the queue is already frozen`

**含义**。main 上的红门禁绝不写第二个冻结。在后备冻结上，它用这次红运行重写原因并保留 `frozen since main <sha>`。当 main 包含被接纳修复的合并且门禁结论为 `failure` 时，原因追加 `repair #<n> did not turn main green` 并释放修复槽位。从未裁决它的门禁（没有运行、被取消、过了期限）追加 `repair #<n> was not judged` 并保留槽位：按原因所说，用 `gh run rerun <后备运行 id> -R <owner/repo>` 对那个 main 再门禁一次。

**修法**。用 `land --pin --repair` 落地下一个修复（回退或向前修复）。

<a id="queue-wave-conflict"></a>
### `QUEUE_WAVE_CONFLICT`

**含义**。`wave build` 按列车的合并规则顺序合并各成员（constituent），其中一个在 CHANGELOG 与打戳文件之外与当前波冲突。什么都没推送。记录（状态 `conflict`）点名该 PR、文件以及状态根目录下正在进行合并的 worktree。`--continue` 会拒绝，直到那个 worktree 里有一棵干净的树、且持有"成员钉定合并到记录提交"的一次已提交合并。

**修法**。在打印的 worktree 里消解这些文件，`git -C <worktree> commit --no-edit`，然后 `gstack-ship-queue wave build --wave <nonce> --continue`。或去掉该 PR 重建波。

<a id="queue-wave-moved"></a>
### `QUEUE_WAVE_MOVED`

**含义**。波不再落地其记录点名的内容：某成员在加入后被推送、关闭或合并（一旦入列 head 即冻结）；波分支带有一个不是成员钉定的合并（例如并入了 main）；分支上找不到某个钉定；或波被重建而此 PR 是旧的。同一代码还会拒绝：目标分支不是基础分支的成员（堆叠 PR 的钉定带着父级的提交）；已发布的波；以及波 PR 仍开着时的 `--drop` 或 `--release`——已接纳它的列车仍会把它落地。

**修法**。波 PR 还开着就先关掉，然后剔除移动过的 PR 重建：`wave build --wave <nonce> --drop <pr>`——它会新建波分支与 PR（绝不强推）；对新的波 PR 跑 /ship 并发 READY。被移走的 PR 交还其负责人，自行落地或进之后的波。堆叠 PR 自行落地；发布之后，每个成员各自 READY。

<a id="queue-wave-duplicate"></a>
### `QUEUE_WAVE_DUPLICATE`

**含义**。某个 PR 会落地两次，或波会嵌套：它已是另一个活跃波的成员；`train build` 同时收到了波 PR 和它的某个成员（或共享成员的两个波）；波 PR 被点名为成员；或活跃波的成员被单独 READY 或单独交给 `train build`。

**修法**。每个 PR 只留一处：从 `train build` 去掉单独的钉定，或去掉共享 PR 重建其中一个波。活跃波的成员经波 PR 落地。

<a id="queue-wave-size"></a>
### `QUEUE_WAVE_SIZE`

**含义**。波默认携带 3 到 6 个 PR（R46）。`--min` 与 `--max` 只对单条命令改变边界。

**修法**。增删 PR；`wave plan` 会建议按领域分组。少于下限的 PR 作为单个列车槽位落地。

<a id="queue-wave-unknown"></a>
### `QUEUE_WAVE_UNKNOWN`

**含义**。某 PR 的 head 分支是 `wave/<nonce>`，或某条命令点名了一个 nonce，但本地状态与 `refs/notes/gstack-trains` 上都没有波记录。`ready` 与 `train build` 拒绝而不把它当普通 PR，因为其成员无从检查。

**修法**。`gstack-ship-queue wave status` 列出已知的波。记录丢了就用 `wave build --prs` 重建波。

<a id="queue-wave-dependent"></a>
### `QUEUE_WAVE_DEPENDENT`

**含义**。`wave build --drop <pr>` 被要求剔除一个钉定是另一成员钉定祖先的 PR（叠加 PR），重建的波仍会把被剔除的代码带落地。

**修法**。把包含它的 PR 一并剔除，或保留该 PR。

<a id="queue-wave-not-merged"></a>
### `QUEUE_WAVE_NOT_MERGED`

**含义**。`wave settle` 找不到满足以下条件的 PR：已合并进基础分支、其 head 分支是波分支、其合并提交在基础分支上、且该合并的树是 PR 的 head 树或该 head 合到合并父提交上的树——因此无法断言成员已落地。没有评论或关闭任何东西。

**修法**。经列车落地波 PR（`train land`），再重跑 `gstack-ship-queue wave settle --wave <nonce>`。

<a id="queue-receipt-missing"></a>
### `QUEUE_RECEIPT_MISSING`

**含义**。PR 正文没有有效的 ```gstack-ship-receipt``` 块——/ship 从没在本分支跑过（或正文被改写时丢了回执）。`gstack-ship-queue ready` 拒绝 READY 它；`train build` 在任何写、推、分发（含干跑）之前按 PR 号拒绝该钉定；`verify --train` 拒绝该槽位。块仍会打印提示性的 `SHIP_RECEIPT: none in the PR body`（或 `invalid`）行。没有跳过该检查的 flag（Garry，2026-10-25：合并 PR 前先用 gstack 的 ship 技能；[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-before-ready)）。

**修法**。在分支上跑 /ship。无人值守时，当 HEAD 存在该分支的在途 PR，它最后会把回执写进 PR 正文（先 `gstack-ship-receipt write --pr <n> … --body <file>`，再 `gstack-post pr-body`）；否则把回执留在 `.gstack/tmp/ship-receipt.md`，由父会话发布（[unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md)）。然后重跑 `gstack-ship-queue ready --pr <n> --screen|--no-screen`，发送新 READY 块。

<a id="queue-receipt-stale"></a>
### `QUEUE_RECEIPT_STALE`

**含义**。PR 正文的 ship 回执有效，但点名的 head 不是正在 READY 或合并的那个（/ship 之后又推送；从别的 PR 抄来的回执；或 `pr` 字段指向别的 PR），回执覆盖不了将要合并的东西。唯一被接受的差异是列车槽位的打戳：当前 head 是被钉定 head 的打戳提交（树相同、打戳文件除外；或槽 2 起并入了 main 的钉定）时，为被钉定 head 写的回执才是有约束力的那份，`verify --train` 接受它。

**修法**。在当前 head 重跑 /ship 让回执点名它，再重跑 `gstack-ship-queue ready --pr <n> --screen|--no-screen`。车道绝不靠打戳来修这个：打戳只在槽位被叫到时发生。

<a id="queue-receipt-conditional"></a>
### `QUEUE_RECEIPT_CONDITIONAL`

**含义**。PR 正文的 ship 回执带着 `base_red` 块：/ship 第 5 步在 `gstack-base-red` 已证明属于基础分支自身的用例上失败，/ship 在 READY 前暂停（[base_red](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#base-red)）。它不能被 READY、上列车、捎带或合并——例外是带 `gates` 的列车：`ready --base-red --fixer <pr>` 让它 READY、跟在槽 1 修复者身后上车（[base-red PR](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#train-gates)）。

**修法**。等基础分支通过那些用例（`gstack-base-red wait --pause <file>`），然后跑 `/ship --resume <record>`——它重跑第 5 步、重写不带 `base_red` 的回执。

<a id="base-red-unconfigured"></a>
### `BASE_RED_UNCONFIGURED`

**含义**。`origin/<base>` 的 ship 策略没有 `base_red` 块，`gstack-base-red` 无法在彼处复现失败，第 5 步的所有失败都留在分支内。基础分支策略无效视同此码（无效键先打印）。暂停之后块被移除时，`wait` 打印它。

**修法**。用 /ship 常规分流。要让 /ship 在红基础分支上暂停，在基础分支的 `.gstack/ship-policy.json` 加 `base_red`（[base_red](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#base-red)）。

<a id="base-red-unnamed"></a>
### `BASE_RED_UNNAMED`

**含义**。失败证据点名的失败数少于车道报告数，未点名的失败可能是这个 PR 的。

**修法**。列出每个失败测试（`id`、`file`、首行错误作 `signature`），`total` 等于车道的失败数，重新分类。

<a id="base-red-repro-error"></a>
### `BASE_RED_REPRO_ERROR`

**含义**。`gstack-base-red` 跑不了复现：基础分支或 HEAD 解析不了；PR 的 diff 读不了；临时检出失败；或 `setup` 非零退出。所有失败都留在分支内。

**修法**。读打印的 detail。fetch 基础分支，或在基础分支修好 `base_red.setup` 命令，再分类。

<a id="base-red-pause-expired"></a>
### `BASE_RED_PAUSE_EXPIRED`

**含义**。暂停超过 24 小时，分类已陈旧。

**修法**。把暂停的 PR 报给其 Captain 或所有者，在当前基础分支重启 /ship——它会重新分类。

<a id="base-red-wait-timeout"></a>
### `BASE_RED_WAIT_TIMEOUT`

**含义**。在 `gstack-base-red wait` 的 `--timeout` 之前，没有新的基础 head 通过暂停的用例。

**修法**。再跑 `wait`（暂停在过期前一直有效），或找到基础分支红着的负责人。

<a id="base-contains-head"></a>
### `BASE_CONTAINS_HEAD`

**含义**。某个以基础分支为基准的步骤（`gstack-ship-queue ready`、`land` 与 `train` 的回执绑定、`gstack-review-plan`、`gstack-pregate`、`gstack-gate-diff`、`gstack-diff-scope`、`gstack-docs-candidate snapshot`）收到了一个就是 head 或已包含 head 的 base，而分支上还有其真实 base 没有的提交。比较会变成分支与自身比较，报告零改动——假绿。常见原因是 PR 流程做的检出：`refs/remotes/origin/HEAD` 指向 PR 分支、本地没有 `main`（GST-774）。detail 点名 base、head 与真实 base（来自 `gh` 的 PR base；否则来自 `git ls-remote --symref` 的远端现行 HEAD；否则 `origin/main`；否则 `origin/master`）。对 pull request 的 head，只要 base 包含它，队列就拒绝。在基础分支自身、分离 HEAD、以及没有超出其 base 提交的新鲜分支上，步骤照旧运行。`gstack-diff-scope` 把它报为 `SCOPE_ERROR=base_contains_head`（所有 flag 为 false，退出码 2），原因放在注释行里。

**修法**。传真实 base（`--base main`，或 PR 的 base 分支）。`origin/HEAD` 指向已检出分支时，`git remote set-head origin main` 一次修好所有默认值。

<a id="queue-receipt-depth-raised"></a>
### `QUEUE_RECEIPT_DEPTH_RAISED`

**含义**。`ready` 或 `train build` 从 git 重算 head 需要的评审深度（对基础 ref 的范围——`ready` 用 `origin/<base>`、`train build` 用 `<remote>/<base>`；基础提交的生成产物注册表；以及点名该 head 时回执的门禁扫描），而回执的 `review_depth.depth` 低于它；或回执来自一个记录 `gstack_version` 却不带 `review_depth` 的 gstack。`REVIEW_DEPTH:` 行打印回执深度、所需深度、运行行数、类、原因与输入（`base@`、`registry@`、`gate_scan@` 或 `missing`）。为其他 head 记录的门禁扫描计为 missing，这会让该 head 需要 `full`。回执不变。

**修法**。在 READY 点名的 head 上跑 /ship；它按 `gstack-review-plan` 为该 head 规划的深度评审，并写出记录该深度的回执。绝不手工编辑 `review_depth`（[review-policy.md](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md#review-depth)）。

<a id="queue-receipt-exception-invalid"></a>
### `QUEUE_RECEIPT_EXCEPTION_INVALID`

**含义**。回执记录了队列无法接受的负责人豁免（`docs.exception` 或 `review_loop_exception`）：记录解析不了；review-loop 豁免接受的停下在评审循环里没有显示（`review_loop.fix_checks` 为 0 或缺失的 `fix_check`，或少于两轮、没有延期发现的 `second_pass`）；其 head（`fix_check.head` 或 `second_pass.head`）既非绑定的 head 也非其祖先（跨改写历史的 carry 之后不检查）；或 PR body 不再逐字带有豁免行（`Documentation exception: …` 或 `Review-loop exception: …`）。

**修法**。按 `write` 打印的原样把该行恢复进 PR body；或重跑 /ship，用 `--docs` 或 `--review-loop-exception` 记录负责人的接受（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-receipt)）。

<a id="queue-receipt-targeted-missing"></a>
### `QUEUE_RECEIPT_TARGETED_MISSING`

**含义**。`ready`、`train build` 或 `land` 从 git 重算 head 需要的定向类（money、gate、auth、secret），而回执的 `review_targeted` 没有用一次 `done` 评审覆盖其中每一个。`REVIEW_TARGETED:` 行打印必需类、done 评审覆盖的类（回执没记录定向评审时是 `legacy`）以及 `verdict=missing`；记录的评审失败时则是 `verdict=failed`。不需要任何类的 head 无论回执记什么都通过。回执不变。

**修法**。在 READY 点名的 head 上跑 /ship，让定向读者跑遍每个必需类，`gstack-ship-receipt write --review-targeted` 记录 done 评审（[review-policy.md](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md#targeted-pass-on-money-gate-auth-and-secret-code)）。绝不手工编辑 `review_targeted`。

<a id="queue-screen-stale-ref"></a>
### `QUEUE_SCREEN_STALE_REF`

**含义**。当 PR 与基础分支在 CHANGELOG 和打戳文件之外冲突（消息列出冲突路径）、或列不出远端 ref 时，`ready --screen` 以本代码拒绝。仅 merge ref 缺失或滞后不再拒绝（见修法）。本段其余部分解释为什么这样的 ref 不能直接拿来 screen：`ready --screen` 针对 GitHub 的 `refs/pull/<n>/merge` 分发 screen，而该 ref 可能缺失、或仍合并着比 PR 已推送 head 更老的 head。PR 与基础分支冲突期间 GitHub 停止重算 merge ref（打戳之后的仅 CHANGELOG 冲突也算），在那里分发的 screen 会检出旧合并、发现自己已被取代、计划 0 个用例并报告成功。GSTA-95 在 #3431 上撞到过：`ready` 打印了 `SCREEN_DISPATCH:`，好像 screen 跑过。现在 `ready` 在分发前比较 merge ref 的第二父与 PR head，计划了 0 用例的完结 screen 绝不被当作 screen 采纳。screen 运行不上传列车记录，证据就是它的计划：被取代的运行跳过 `plan-slices`、不上传 `paid-plan` 产物，计划为空的 manifest 同样计数。`ready --screen` 会分发新的一次，`train build` 打印 `SCREEN: #<n> run <id> planned no cases (no paid-plan artifact; …)` 或 `… planned no cases (an empty plan manifest; …)`，均以 `; counted as not-run, the slot rides unscreened` 结尾。读不出的计划（`… paid-plan artifact has expired`、`… manifest.json is unreadable`、读不出的运行或产物列表、读不出的仓库 slug、或 run id 不是数字的 READY）让槽位保持已 screen 状态并打印 `SCREEN: #<n> <原因>; counted as screened, unverified`；`ready --screen` 会跟随这种运行。`ready` 列不出远端 ref 时，以同一代码拒绝并附 `could not list …` 消息，其 NEXT 行说去检查远端、而不是解决冲突；列得出却 fetch 不到的 merge ref 由修法所述的临时合并替代。

**修法**。临时合并 screen 上线后，滞后的 merge ref 不再是拒绝：`ready --screen` 按列车的合并规则（版本文件取基础分支一侧，CHANGELOG 按小节合并）自行构建 PR head 向 `origin/<base>` 的合并，以 `screen/<pr>-<head12>` 推送并在该提交上分发 screen，打印 `SCREEN_MERGE: scratch merge …`。本代码现在只意味着真实冲突：消息列出冲突路径。与基础分支消解它们，推送，再跑 `gstack-ship-queue ready --pr <n> --screen`。仅 CHANGELOG 或仅打戳文件的冲突不拒绝——除非 PR 的 CHANGELOG 删掉或改名了某个已发布标题（消息此时点名 CHANGELOG）。`train prune --stale` 删除已合并或已关闭 PR 的临时分支。

<a id="queue-screen-red"></a>
### `QUEUE_SCREEN_RED`

**含义**。为该 PR head 分发的 screen 运行以红色（RED）收场。裁决从运行本身读取，绝不从车道报告读取：`gate-binding-a<attempt>` 产物是 evals.yml 的 report job 上传的（verdict、reconcile 退出码、不稳定用例），`report-verdict-a<attempt>` 产物里有 `collector-outcomes.json`（让车道失败的 panel、报告的 `✗` 失败行——点名没有 panel 的规则用例、以及规则 16 的不稳定行）。绑定判红的用例在运行内部已经失败过两次（规则 16 对首次失败重跑一次），所以红是真的。head 记录的 screen 运行为红时，`ready` 以本代码拒绝——无论传入 `--screen` 还是 `--no-screen`——且绝不在同一合并 SHA 再分发一次 screen；`train build` 拒绝入列该钉定，其 `NEXT:` 点名去掉它的构建；`verify --pr <n> --screen` 打印 `SCREEN_VERDICT: #<n> run <id> RED red=<用例> flaky=<用例>` 与每个不稳定用例一行 `FLAKY:`。裁决记入 READY 回执（`screen.verdict`），本地与 `refs/notes/gstack-trains` 都有。

**修法**。从 `SCREEN_VERDICT:` 行读红的用例，修复，推送新 head，重跑 /ship 与 `gstack-ship-queue ready --pr <n> --screen`（新 head 有自己的 screen）。带不稳定用例的 GREEN screen 就是绿：不稳定用例列入台账即可，无需重跑。

<a id="queue-train-stack-red"></a>
### `QUEUE_TRAIN_STACK_RED`

**含义**。`gstack-ship-queue train build --dry-run --stack-tests` 在包含该 PR 的集成前缀 T<k>（基础分支加上直到并含该 PR 的每个槽位）上的临时 worktree 里，运行了该 PR 新增的测试文件（相对基础分支新增、文件名以 `.test`、`_test`、`.spec` 或 `_spec` 加 JS/TS 扩展名结尾的文件，bun 自己的规则；`test/` 下的辅助或 fixture 不算），而它们失败了。`STACK_TESTS: #<pr> T<k> <n> new test file(s) FAIL (<files>): <failing assertion>` 行点名文件与运行器的失败行。这些测试在 PR head 单独上能过，只因列车里它之前没有东西改变它们读取的内容（2026-10-26，一个叠在另一 PR 测试文件或 fixture 上的 PR 命中此况）。什么都没写入、推送或分发；普通 dry run（不带 `--stack-tests`）不跑它们。

**修法**。针对那个前缀修该 PR 的测试；或用 `--order` 重排列车让它们依赖的 PR 排在前面，然后重跑 dry run。仓库的测试不在 `bun test` 下运行时传 `--stack-tests-command "<命令>"`；文件会追加到该命令之后。

<a id="queue-post-merge-red"></a>
### `QUEUE_POST_MERGE_RED`

**含义**。`gstack-ship-queue verify --post-merge <sha>`（完整 40 字符 SHA）监视列车合并到基础分支的那个提交所附的检查运行（push 工作流：免费测试、Windows 子集、main 后备）及其提交状态，直到没有仍在运行的；此时至少一个检查以 `failure`、`timed_out`、`cancelled` 或其他非成功收场，或某个提交状态失败（消息此时说的是提交状态，不是检查运行）。`neutral` 或 `skipped` 的检查（main 前进后后备以自身被取代收场）计为 skipped，绝不算红。命令不保留进程状态：轮询 gh 直到检查落定或 `--timeout`（默认 2700 秒）到点，打印 `POST_MERGE: <sha12> green|red|pending|none (passed= failed= pending= skipped=)` 与每检查一行 `CHECK: <name> <conclusion|status>`；超时是 `QUEUE_TRAIN_PENDING`，`NEXT:` 给同一条命令，中断后重跑即继续监视。带 `--checks <a,b>` 时（工作流门禁的 `post_merge_checks`，`train land` 与 `train watch --land` 会传），每个点名检查还必须成功；从未运行的在超时时报 `QUEUE_TRAIN_PENDING`。

**修法**。读 `CHECK:` 行点名的红运行。开新 PR 修复或回滚合并；后备立过冻结时，`gstack-ship-queue train status` 会点名它。

<a id="queue-screen-not-run"></a>
### `QUEUE_SCREEN_NOT_RUN`

**含义**。为本 PR 分发的 screen 运行以 `success` 收场，却没跑任何 slice。当 `scripts/eval-readiness.ts wait` 发现 PR head 已被取代（`ready --screen` 与制定计划之间落了一次推送）、或计划未选中任何用例时，evals.yml 的 `route` job 什么都不计划；于是运行不上传 `paid-plan` 产物（或上传空 manifest），每个 slice job 都被跳过，GitHub 显示绿勾。2026-10-26 的 41 次 PR screen 中有 18 次这样收场。裁决从运行读取（`lib/ship-queue-screen.ts`），所以这种运行是 `NOT-RUN`：`verify --pr <n> --screen` 打印 `SCREEN_VERDICT: #<n> run <id> NOT-RUN (<why>)` 并以本代码拒绝；READY 回执记录 `screen.verdict.outcome: NOT_RUN`；`ready --screen` 绝不跟随该运行（其 `SCREEN_DISPATCH:` 行写明 `not following … a screen that planned nothing is not a screen`）；`train build` 把钉定以未 screen 状态入列，并打印 `SCREEN: #<n> run <id> planned no cases …; counted as not-run, the slot rides unscreened`。

**修法**。在当前 head 跑 `gstack-ship-queue ready --pr <n> --screen` 分发一次新 screen。分发之后 head 动过的本来就需要新 READY（`QUEUE_TRAIN_MOVED`）；没动过却仍计划不出东西的 head，没有与 diff 相关的东西可 screen——在 READY 块点名聚焦用例并传 `--no-screen` 才是诚实的选择。

<a id="ready-screen-choice-required"></a>
### `READY_SCREEN_CHOICE_REQUIRED`

**含义**。基础策略开启了列车，所以 READY 需要明确的 screen 选择：`--screen`（现在就为该 PR 的合并 SHA 付一次 screen）或 `--no-screen`。`SCREEN:` 行显示选择与建议。

**修法**。按打印的建议重跑 `gstack-ship-queue ready`。已跑过聚焦本地用例的车道在 READY 块中说明，可传 `--no-screen`。

<a id="pregate-timing-assertion"></a>
### `PREGATE_TIMING_ASSERTION`

**含义**。分支新增或修改的某行测试，把经过的墙钟或 CPU 时间与一个界比较；或先睡固定时长再断言。机器负载之下，这种测试不改代码也会失败。`timing` 检查只警告、不阻断（度量说明见 [docs/pregate.md#timing](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#timing)）。

**修法**。改为对结果断言：注入的时钟、强加的截止、事件、或带截止的轮询。当界本身就是契约时，在该行或其上一行的注释里加 `gstack-timing-ok: <理由>`。绝不要为让不稳定（flake）通过而抬高界；诊断方法见 /investigate 的 flake 手册。

<a id="approval-classes-invalid"></a>
### `APPROVAL_CLASSES_INVALID`

**含义**。基础分支上提交的 `.gstack/approval-classes.json`（对 `gstack-approval-classes validate` 则是工作树副本）不是有效 JSON；有未知键；有类缺名字或没有任何匹配物；或有逃出仓库的 glob。`gstack-ship-receipt write` 会拒绝，而不会带着未检查的类发布。

**修法**。跑 `gstack-approval-classes validate`，改正文件并合并进去。见[审批类](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#approval-classes)。

<a id="approval-class-found"></a>
### `APPROVAL_CLASS_FOUND`

**含义**。`gstack-approval-classes check` 发现了被某个已声明类覆盖的改动。每条 `APPROVAL_CLASS:` 行点名类与 file:line；每条 `APPROVAL_SCOPE: <class>@<digest12>` 行就是批准所绑定的 token。内置探测器的仅报告行不设置本代码。

**修法**。询问负责人，然后把 `Approved by <owner> <YYYY-MM-DD> via <ref> for <class>@<digest12>` 加进 PR body。影响每次被添加、删除或编辑，token 都会变——之后的改动需要新的批准。

<a id="approval-citation-missing"></a>
### `APPROVAL_CITATION_MISSING`

**含义**。`gstack-ship-receipt write` 发现某个已声明的审批类没有任何既可解析、又绑定到当前影响的引用（citation），因此没有写出回执。该行列出每个候选引用及不算数的理由：计划的 autoplan 门禁不是 APPROVED；评论不是 ship-policy 维护者或不是所引负责人所写；证据既没点名范围 token、也没点名带全部影响路径的类（批准的是别的工作，或在某影响被添加之前给的批准）；或无法解析的引用缺少匹配的 `for <class>@<digest12>` 证明。

**修法**。引用批准：用计划 sha 配 `--approval-run <运行目录>`，或用点名该 token 的维护者评论/评审的 URL。对 gstack 读不到的证据（线程代号、聊天消息），用 `for <class>@<digest12>` 证明它覆盖哪个范围；回执把它记为 `citation: unverified` 供协调者参考。

<a id="approval-source-unavailable"></a>
### `APPROVAL_SOURCE_UNAVAILABLE`

**含义**。`origin/<base>` 无法解析，读不出已提交的审批类（approval classes）。`check` 以 3 退出；`gstack-ship-receipt write` 记录 `approval.status: unavailable` 并打印 `approval=unchecked`。

**修法**。`git fetch origin <base>` 后重跑。从不使用工作树里的副本。

<a id="state-matrix-incomplete"></a>
### `STATE_MATRIX_INCOMPLETE`

**含义**。`gstack-state-matrix check` 读取状态机专家的输出后发现缺口：某个 kind × owner 动作对没有行；某行没有结果行；某条测试引用在检出中不存在；或某个未测单元格没有 CRITICAL 发现。矩阵不完整的评审覆盖就不完整，绝不会是干净结果。

**修法**。在同一 diff 上重跑状态机专家，再次检查其输出。

<a id="review-scope-input"></a>
### `REVIEW_SCOPE_INPUT`

**含义**。`gstack-review-scope`（/ship 评审循环的发现范围工具，[ship-policy.md#review-scope](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#review-scope)）收到了无法分类的输入：发现不是对象构成的 JSON 数组；`--pass` 或 `--policy` 取值越界；第 2 轮及以后的调用没带 `--range-base`；`--range-base` 不是提交 id（7 到 64 位十六进制）；或 `summary --since` 没匹配到本分支经 /ship 写下的任何评审日志行（因此推不出 `REVIEW_LOOP:` 行，ship 回执的 `--review-loop` 输入也没写）。没有分类、延期或汇总任何东西。

**修法**。把第 9.3 步的发现作为 JSON 数组传入（`--findings <file>` 或 stdin），`--pass <n>` 取自调用记录；第 2 轮起传 `--range-base <sha>`——上一轮开始时保存的 HEAD，用十六进制提交 id。`summary` 则核对 `REVIEW_SINCE` 与调用记录的开始时间，并确认每轮都以 `via:"ship"` 完成。

<a id="review-scope-range"></a>
### `REVIEW_SCOPE_RANGE`

**含义**。`gstack-review-scope classify` 读不出作为范围基准的 diff：`origin/<base>` 或 `--range-base` 无法解析；或范围基不是 HEAD 的祖先（上一轮之后历史被改写）。

**修法**。fetch `origin/<base>`，对照调用记录里各轮的 head 核对 `--range-base`；分支被 rebase 过就重新开始完整一轮（`--pass 1`）。/ship 自己的规则是合并基础分支进来，绝不 rebase 已评审的 head。

<a id="review-scope-ledger"></a>
### `REVIEW_SCOPE_LEDGER`

**含义**。`gstack-review-scope summary` 数不出评审的分发台账（ledger），宁可不写 `REVIEW_LOOP:` 行也不写一个可能偏低的计数（GST-951）。要么没点名台账（`--run`、`--ledger` 或 `--no-ledger`）；`--run` 里没有 `review-ledger.jsonl`；某份台账、它点名的 `merged.jsonl` 或其已判定集读不出；或已判定集在 `judge` 检查之后又变了。台账在评审日志行分类之前保存每位读者的发现（专家、红队、两个对抗声音、定向、fix-check），计数正是从它们读出的。

**修法**。传 `--run <运行目录>`——评审各轮写出的目录（Capy 上是 `ship/DRIVER.md` 的运行目录），或逐个传 `--ledger <文件>`。只有没有任何读者经 `gstack-review-dispatch` 运行时才传 `--no-ledger`。文件被挪走就恢复它；已判定集变了就对它重跑 `gstack-review-dispatch judge`。

<a id="receipt-carry-refused"></a>
### `RECEIPT_CARRY_REFUSED`

**含义**。`gstack-ship-receipt carry` 无法把 PR 的 /ship 回执 carry 到 HEAD：PR body 没有有效回执；工作树有未提交或未跟踪改动（carry 认证的是一个提交，绝不是与之有差异的树）；回执的 head 已离开 HEAD 的历史、且回执没有记录可比对的树（`head_tree` 之前写的回执，其 head 不在本克隆里）；PR 在堆叠父级落地后被重新指向基础分支，但回执没有记录 `product_patch_id`、`origin/<parent>` 也无法解析，评审范围无法重算；或 git 无法比较两份产品 diff（包括 carry 无法在 `.git/gstack-patch-id` 下创建临时目录时，消息点名它），或读不出工作树状态。回执记录的负责人豁免已不成立时同样拒绝；对来自记录评审深度的 gstack 的回执，HEAD 需要比回执记录更深的评审、`--head` 不是检出的 HEAD、或回执记录了 `gstack_version` 却没有 `review_depth` 时也拒绝（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-receipt)）。HEAD 需要某个定向类（money、gate、auth、secret）而回执的 `review_targeted` 没有用一次 done 评审覆盖它时也拒绝——因为队列会拒绝那份回执。body 里的回执未变、仍指向旧 head，所以 `gstack-ship-queue ready` 会以 `QUEUE_RECEIPT_STALE` 拒绝。

**修法**。提交或 stash 所有工作树改动，然后在新 head 重跑 `gstack-ship-receipt carry --pr <n>`。历史已被改写且回执早于 `head_tree` 时，在新 head 上跑 /ship；下次改为合并基础分支而不是 rebase。重新指向的堆叠 PR（旧回执丢失了父分支）、或深度/定向/豁免类拒绝，在新 head 上跑 /ship。`--head` 不是检出的 HEAD 时，先检出它再在那里 carry。

<a id="review-loop-exception-invalid"></a>
### `REVIEW_LOOP_EXCEPTION_INVALID`

**含义**。`gstack-ship-receipt write --review-loop-exception` 拒绝该记录且什么都没写：它不是 `{ accepted_by, date, via, reason }` 且恰好带有 `fix_check: { head, findings[, files] }`（fix-check 之后的停下）或 `second_pass: { head, deferred: [<发现 id>] }`（第二轮完整评审留下未决发现后的停下，TRUT-7）之一；`--review-loop` 缺失或未显示那次停下（没有计入的 fix-check、少于两轮、或没有延期发现）；head 既非回执 head 也非其祖先；或 `--body` 文件缺 `Review-loop exception: …` 行。

**修法**。记录负责人的原话与其接受的那次停下（fix-check，或带延期发现 id 的第二轮完整评审），把 `gstack-review-scope summary` 文件作为 `--review-loop` 传入，把打印出的行放进 PR body，再次写入（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-receipt)）。

<a id="receipt-carry-tree-mismatch"></a>
### `RECEIPT_CARRY_TREE_MISMATCH`

**含义**。/ship 之后分支被 rebase 或强推过，回执的 head 不再在 HEAD 的历史里，且 HEAD 的树不是回执覆盖的树（其 `head_tree` 或 `carry.trees` 里的树）。没有任何评审看过这份代码。拒绝信息点名 HEAD 的树与被覆盖的树；body 未变。

**修法**。在新 head 上跑 /ship。rebase 只能 carry 到"对新基础的产品 diff 未变"的已评审树上；改为合并基础分支进来，则保留后续每一次 carry 的资格（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#receipt-carry)）。

<a id="receipt-carry-product-changed"></a>
### `RECEIPT_CARRY_PRODUCT_CHANGED`

**含义**。在回执 head 与 HEAD 之间，对基础分支的产品 diff 变了：至少一条路径——既非测试、发布元数据、预门禁 regen 检查证明过的注册产物（列在 `proven` 下，对照同一基础注册表核验）、也非基础合并的一部分——其补丁与评审 head 时的不同。rebase 之后，这意味着 HEAD 拥有评审过的树，但基础分支在其下方移动了，评审者将看到的 diff 不是评审过的那份。对父 PR 落地后重新指向基础分支的堆叠 PR，这意味着 HEAD 对基础分支的产品 diff 不是针对父分支评审的那个范围：父分支尚未完全落地，或分支此后又变了。回执以基础分支为对象写出的堆叠 PR，从基础分支已持有的最新评审提交起 carry（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#receipt-carry)）；只有当这种提交不存在、或分支此后又变时才在此拒绝。评审裁决不覆盖 HEAD，所以回执不 carry。拒绝信息点名变更的产品路径；对重新指向的堆叠 PR 则点名父分支与基础分支。

**修法**。在新 head 上跑 /ship。回执只在以下情形 carry：仅冲突的基础合并；仅测试的改动；发布元数据；预门禁 regen 检查证明过的注册产物；带记录产品 diff、rebase 到被覆盖的树上；堆叠 PR 的重新指向（其父分支已在基础分支完全落地）；打戳文件里分支自己也作为产品改动的行上的戳（每条变更行都在分支新增的位置、mode 未变、基础分支未触碰该文件）；分支对打戳文件的改动不超过对每个 head 基础的一枚戳（把 `package.json` 放回基础内容的 changelog 片段转换）；以及干净范围化评审之后未变更 hunk 旁边的基础上下文（[`RECEIPT_CARRY_SCOPED_REVIEW`](#receipt-carry-scoped-review)）——carry 的回执里 `carry` 对象以产品 patch-id 与 range-diff 证据记录它（[unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#the-terminal-line)）。

<a id="receipt-carry-scoped-review"></a>
### `RECEIPT_CARRY_SCOPED_REVIEW`

**含义**。分支触及的每个产品路径，其评审过的 +/- 行都在原位，但基础分支编辑了其中一些旁边的上下文行，于是 3 行补丁不同了（GST-384：main 改写了 PR hunk 上方那行）。合并可能已把两者拼接在一起——比如 JSON 条目里分支改了一个键、基础分支改了下一个键——所以回执不会默默 carry。拒绝信息点名这些路径，以及一个包含相异 hunk 与基础分支自身改动的 packet 文件。同样的行挪到了别处属于 `RECEIPT_CARRY_PRODUCT_CHANGED`，不是本代码。超过 200 行的 packet 小节改走完整评审循环，但计入该上限的只有分支自己的行：基础分支的 +/- 行（已在基础分支合并）只展示不计数（GST-1226），所以分支 hunk 旁的大幅基础编辑仍能得到范围化阅读。基础分支在单个文件里超过 2,000 行的改动重新全额计入，走完整循环。

**修法**。在 packet 上派一名 fix-check 评审者（[review-policy.md](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md)）。返回干净时，写 `{"head":"<HEAD>","paths":[...],"reviewer":"<模型>","verdict":"clean"}`，重跑 `gstack-ship-receipt carry ... --scoped-review <record.json>`；carry 原因会记录评审者与路径。出现阻塞发现意味着在新 head 上跑 /ship。`gstack-ship-release finish` 以同样方式停下并带 `context=N`，接受绑定到该树的 `--context-reviewed <record.json>`；把该记录写在 packet 旁、worktree 之外，免得改动它所绑定的树。对评审后有改动、但无门禁编辑的测试代码（`tests=N`），finish 也这样停：packet 装着那些测试 hunk，评审者检查每个测试是否仍在测原来的东西。对[评审后有界编辑](https://github.com/garrytan/gstack/blob/main/docs/review-policy.md#bounded-post-review-edits)（`bounded=N`）同样如此：一名范围化读者（而非一轮评审）读 packet，其干净记录还必须带上 STOP 行打印的 `packet_sha256`。写不出的 packet（`.git` 不可写）是一次 STOP 或 `RECEIPT_CARRY_REFUSED`，点名该路径。`carry --dry-run` 在不写 packet 的情况下报告本代码，且仅在 carry 的其他检查都不会拒绝时；不带 `--dry-run` 的 carry 会写出它。在 /ship 第 1 步，`gstack-ship-preflight` 把该路由打印为 `NEXT: carry route (Step 1.4)`。

<a id="receipt-carry-recheck"></a>
### `RECEIPT_CARRY_PRODUCT_CHANGED` 之后的范围化复查（J1）

**含义**。回执 head 之后产品 diff 变了，回执无法按原样 carry。当历史是线性的、基础分支就是回执评审所针对的那一个、且评审范围对当前范围的 `git range-diff` 不超过 400 行（`lib/ship-recheck.ts` 里的 `RECHECK_RANGE_DIFF_CAP`）时，carry 还会打印 `RECHECK: eligible range_diff_lines=N range_diff_sha256=<sha> packet=<file>`：让一名读者读那份 range-diff 即可放行，无需完整重跑第二次 /ship。rebase 过的分支（`RECEIPT_CARRY_TREE_MISMATCH`）、重新指向目标的堆叠、没有 `review_depth` 的回执、超过 20 条变更产品路径、二进制路径、基础上下文挪到评审 hunk 旁边、空或读不出的 range-diff、以及超过 400 行或 64 KB 的 packet，则打印 `RECHECK: not eligible (<why>)`。

**修法**。在 packet 上派一名读者（`.git/gstack/recheck-<head12>.md`；`--dry-run` 不写）。返回干净时，写 `{"from":"<评审 head>","head":"<HEAD>","range_diff_sha256":"<取自 RECHECK 行>","reader":"<模型>","verdict":"clean"}`，并重跑 `gstack-ship-receipt carry ... --recheck <record.json>`。carry 原因会记录读者与 range-diff 大小。HEAD 需要比回执记录更深的评审深度或不同风险类时，carry 仍会拒绝；那一点或任何阻塞发现，都意味着在新 head 上跑 /ship。在 /ship 第 1 步，`gstack-ship-preflight` 把它打印为 `NEXT: carry route (Step 1.4, J1)`。

<a id="receipt-prose-mismatch"></a>
### `RECEIPT_PROSE_MISMATCH`

**含义**。`gstack-ship-receipt read --check-prose` 在 PR body 里发现一个数字，与回执记录的某个计数对不上（`passes=3` 对 `review_loop.passes: 2`；`1 deferred` 对 `deferred: 2`；`passed: 40` 对 `gate.passed: 41`）。回执从运行写出，正文却是人手敲的——读 body 的人会得到一个运行从未产出的数字。`PROSE:` 行逐字段列出两个值。`gstack-approvals` 渲染的 `## Approvals` 表、回执豁免要求的 `Review-loop exception: …` 与 `Documentation exception: …` 行、以及闭合代码围栏的内部，从不当作声明来读。

**修法**。把正文改成回执的数字。若过时的是回执本身（运行重复过），重跑 `/ship` 让回执重写（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-receipt)）。

<a id="receipt-carry-pregate-stale"></a>
### `RECEIPT_CARRY_PREGATE_STALE`

**含义**。body 里的回执记录着旧 head 的预门禁结果，而 `gstack-ship-receipt carry` 被要求把它重绑到 HEAD，却没有对 HEAD 仍然当前的预门禁结果（或 `--pregate` 传入的结果已不当前）。carry 认证的是新 head，所以绝不保留旧树的检查。什么都没重写。

**修法**。在 HEAD 跑 `gstack-pregate`（策略要求时远端测试阶段也跑），然后重跑 `carry --pregate <pregate.json>`。没有它 `--dry-run` 仍会报告资格（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#receipt-carry)）。

<a id="receipt-git-too-old"></a>
### `RECEIPT_GIT_TOO_OLD`

**含义**。`gstack-ship-receipt carry` 用 `git patch-id --verbatim` 比较两个 head 的产品 diff——git 在 2.39 才加入该功能。安装的 git 更老（拒绝信息点名其版本），比较无法运行，什么都没重写。

**修法**。把 git 升级到 2.39 或更高并重跑 `carry`；不升级就在新 head 上跑 `/ship`（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#receipt-carry)）。

<a id="docs-audit-blocked"></a>
### `DOCS_AUDIT_BLOCKED`

**含义**。`gstack-ship-receipt write --docs` 收到一份 `status` 为 `blocked` 且无 `exception` 的文档审计；或 `--body` 缺少该记录所蕴含的豁免行；或 `gstack-ship-receipt docs-caps` 发现某个已声明文档文件超出其 `docs.caps` 字节上限（或缺失）。/ship 第 14.5 步以 blocked 收场，只有在没人接受点名风险时才会发生——此时写出的回执会把未经审计的发布当作已审计发布出去；什么都没写入。

**修法**。修好审计并重跑第 14.5 步；或裁减 `DOCS_CAP: … over` 行点名的文件（或在基础分支上调高其上限）。若负责人改为接受点名风险，将其记录为 `docs.exception: { accepted_by, date, via, reason }`，并在 PR body 的 `## Documentation` 小节逐字带上 `Documentation exception: accepted by <owner> <date> via <ref>: <reason>` 行（[ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#ship-receipt)）。然后用 `gstack-docs-candidate snapshot --exception .gstack/tmp/docs-audit.json` 保存审计后快照；`gstack-ship-release finish` 遇到快照缺豁免的 blocked 审计会停住。
<a id="gstack-pr-wait"></a>
## gstack-pr-wait

`gstack-pr-wait <pr> [--repo owner/name] [--until green|ready|any-change]
[--interval SECONDS] [--timeout MINUTES] [--exclude CHECK,...]` 监视一个 pull request，每个真实事件向 stdout 打印一行、前缀 `#<pr>`；进度与可恢复错误走 stderr。`/land-and-deploy` 第 3 步以 `--until green` 运行它。退出码 0 表示 `--until` 条件已满足或 PR 已合并；退出码 1 和 2 以下方两个代码之一结束。`green` 对 head 上每个检查做门禁，与 `gstack-ci-gate` 同判，两者绝不会不一致；基础分支要求的检查（rulesets 与经典分支保护）在其出现前按 pending 计。`--exclude <check,...>` 把点名的非必需检查排除在裁决之外，与 `gstack-ci-gate --exclude` 一致：pending 时既不扣住 `green`、失败时也不阻断，首次轮询会记录 `excluded from the verdict: <names>`；必需检查不可排除（`exclude refused for required check <name>`）且照常门禁；必需检查来源读不出时什么都不排除（`exclude refused for <names>: the required checks could not be read`），如同 `gstack-ci-gate` 拒绝其覆盖项。经典保护读取上的 403（无管理员 scope 的 token）记日志跳过，rulesets 读取仍会点名必需检查。评审机器人两张清单是配置项：`gstack-config set pr_wait_gating_bots greptile,macroscope` 与 `pr_wait_advisory_bots coderabbit`（`none` 清空清单）；机器人拥有以其名字开头的登录名和提及它的检查；advisory 机器人的评审绝不等待，其检查则与其他检查一样参与门禁。循环是同步的，Ctrl-C 与 `kill` 立即停住；留下的锁在该 pid 消失后由下一个该 PR 的监视者接管。

<a id="pr-wait-blocked"></a>
### `#<pr> stopped: action needed (PR_WAIT_BLOCKED)`

**含义**。退出码 1。不对 PR 做改动条件就无法满足：上方各行指明是哪种。某检查失败（名字与链接；基础分支要求时报 `required check failed`）；合并状态为 DIRTY（分支与基点冲突）；PR 未合并就被关闭；`--until ready` 被未解决的评审线程或 BEHIND 分支挡住；GitHub 连续十次轮询不可达，或返回非瞬态错误（`gstack-pr-wait stopped: <gh message>`）；或 `--timeout`（默认 60 分钟）到点而条件未满足（`gstack-pr-wait stopped: no green after 60 minutes; still pending: <checks>`）。

**修法**。按点名行行动：修好坏掉的检查并推送，rebase 或更新分支，解决线程，或读 gh 消息。超时后判断 pending 的检查值不值得等，再重新开始；`--timeout 0` 表示无限等待。然后再次启动 `gstack-pr-wait`；其状态文件记得已报告过的内容，只有新事件会打印。因 gh 错误停下的监视者，在 `gh auth status` 通过后即可干净重启。

<a id="pr-wait-refused"></a>
### `gstack-pr-wait: the watcher did not start, or a local error stopped it before a verdict — ... (PR_WAIT_REFUSED)`

**含义**。退出码 2，绝不给出对 PR 的裁决。目标不是 PR 号或 URL；`--repo` 不是 `owner/name`；从检出读不出仓库；当前 `gh` 登录读不了该 PR；选项未知；已有另一个 `gstack-pr-wait` 进程（行内点名其 pid）从同一状态根监视此 PR——再来一个会打出重复事件；或本地错误（`a local error stopped the watch before a verdict: <message>`，例如状态根不可写）终结了进程。退出码 1 保留给 `PR_WAIT_BLOCKED`，本地故障绝不会被误读成需要行动的 PR。

**修法**。传 PR 号或 URL 与 `--repo owner/name`，查 `gh auth status`，修好点名的本地错误，或等运行中的监视者结束。点名的 pid 没有任何事件送达时，`kill <pid>` 重开；pid 已死的锁无需这一步即可接管。

## gstack-error-capture

`gstack-error-capture` 为 `/devex-review` 第 3 步运行一个目标 CLI：无终端、环境洗净、临时 HOME 独立，打印一条脱敏后的 JSON 记录。它自身的失败打印一行 stderr：`gstack-error-capture: <什么>; fix: <修法> (<CODE>)`，不输出记录。退出码 2 是用法错误，3 是拒绝，1 是辅助程序失败。`gstack-error-capture --help` 列出全部 flag 与代码。

<a id="dx-capture-usage"></a>
### `gstack-error-capture: ... (DX_CAPTURE_USAGE)`

**含义**。gstack-error-capture 的参数格式错误：未知 flag、flag 缺值、没有 `--`、或 `--` 后没有命令。退出码 2。

**修法**。按 `gstack-error-capture [--deadline <s>] [--max-bytes <n>] [--pass-env NAME,...] [--copy-config <path>] [--cwd <dir>] [--approved] [--launch-check] -- <cmd> [args]` 重跑：flag 在 `--` 之前，命令及其参数在之后。

<a id="dx-capture-bad-deadline"></a>
### `gstack-error-capture: ... (DX_CAPTURE_BAD_DEADLINE)`

**含义**。--deadline 不是正的秒数（至多 3600，最多 3 位小数）。退出码 2。

**修法**。用 `--deadline 20` 重跑。

<a id="dx-capture-bad-max-bytes"></a>
### `gstack-error-capture: ... (DX_CAPTURE_BAD_MAX_BYTES)`

**含义**。--max-bytes 不是 1 到 1048576 的整数。退出码 2。

**修法**。用 `--max-bytes 65536` 重跑。

<a id="dx-capture-bad-pass-env"></a>
### `gstack-error-capture: ... (DX_CAPTURE_BAD_PASS_ENV)`

**含义**。--pass-env 点名了无效或未设置的变量，或隔离环境自有的变量（PATH、HOME、XDG_CONFIG_HOME、TERM、USERPROFILE）。退出码 2。

**修法**。用 `--pass-env NAME（NAME 须在调用环境里已设置）`重跑。

<a id="dx-capture-bad-cwd"></a>
### `gstack-error-capture: ... (DX_CAPTURE_BAD_CWD)`

**含义**。--cwd 不是已存在的目录。退出码 2。

**修法**。用 `--cwd <已存在目录> --approved` 重跑。

<a id="dx-capture-approval-required"></a>
### `gstack-error-capture: ... (DX_CAPTURE_APPROVAL_REQUIRED)`

**含义**。给了 --pass-env、--copy-config 或 --cwd 却没给 --approved；它们会把凭据或真实文件交予目标。退出码 3。

**修法**。请用户批准点名的变量、文件或目录，然后加 --approved。

<a id="dx-capture-config-refused"></a>
### `gstack-error-capture: ... (DX_CAPTURE_CONFIG_REFUSED)`

**含义**。--copy-config 点名了不存在的文件、符号链接、非常规文件、HOME 之外的路径、重复项、或超过 1 MiB 的文件。退出码 3。

**修法**。用 `--copy-config <$HOME 下的常规文件、无符号链接>` 重跑。

<a id="dx-capture-not-found"></a>
### `gstack-error-capture: ... (DX_CAPTURE_NOT_FOUND)`

**含义**。命令解析不到可执行文件；记录携带 launch "not_found"，什么都没跑。退出码 1。

**修法**。安装该命令，或在 -- 后传其绝对路径。

<a id="dx-capture-temp-dir"></a>
### `gstack-error-capture: ... (DX_CAPTURE_TEMP_DIR)`

**含义**。gstack 状态根下的 0700 私有隔离目录创建失败。退出码 1。

**修法**。把 `$GSTACK_STATE_ROOT/error-capture` 变为你所有的可写目录（不能是符号链接），再重跑。

<a id="dx-capture-containment-unavailable"></a>
### `gstack-error-capture: ... (DX_CAPTURE_CONTAINMENT_UNAVAILABLE)`

**含义**。本平台不支持进程组或 Windows Job 隔离；什么都没跑。退出码 1。

**修法**。在 Linux、macOS 或支持 Job 对象的 Windows 上运行采集。

<a id="dx-capture-supervisor-failed"></a>
### `gstack-error-capture: ... (DX_CAPTURE_SUPERVISOR_FAILED)`

**含义**。截止时间监督进程在给出结果前失败。退出码 1。

**修法**。同一命令重跑一次；复现则跑 bin/gstack-qa-deadline --help 检查监督进程。

<a id="dx-capture-interrupted"></a>
### `gstack-error-capture: ... (DX_CAPTURE_INTERRUPTED)`

**含义**。辅助程序收到 SIGINT、SIGTERM 或 SIGHUP；目标进程组被杀，未打印记录。退出码 1。

**修法**。不要打断，重跑同一命令。

<a id="dx-capture-redaction-failed"></a>
### `gstack-error-capture: ... (DX_CAPTURE_REDACTION_FAILED)`

**含义**。完成的记录仍命中某项密钥检查，因此什么都没打印。退出码 1。

**修法**。不要再加 --pass-env 重跑；把命令名报给 gstack 维护者。

<a id="dx-capture-internal"></a>
### `gstack-error-capture: ... (DX_CAPTURE_INTERNAL)`

**含义**。辅助程序意外失败；输出行点名错误类与第一帧栈。退出码 1。

**修法**。重跑一次；复现则把打印的栈帧报给 gstack 维护者。

## 文风检查（gstack-prose-lint）

`bin/gstack-prose-lint` 读取 /ship 即将发布的文字：CHANGELOG 条目（第 13 步）和作者写在 PR 正文里的小节（第 19 步：经 `--sections` 指定的 `## Why`、`## Summary` 与 `## Blast radius`；`## What changed` 的图注与图片文字仍按报告对待），质量门禁工作流还会对 `CHANGELOG.md` 的 `[Unreleased]` 块跑它。它只裁决正则表达式能裁决的东西：autopilot 词汇、"not just X, but Y" 句式、隐喻名词、当连词用的冒号、复述本行内容的粗体标签、代替句子的箭头或缺失冠词，以及未闭合的围栏或 HTML 注释（`unclosed-block`）——因为其后的内容都没被读到。围栏代码、行内代码、URL、HTML 注释与引号内的词从不读取，所以 `## Why` 里引用的问题原文由作者自己措辞。在其他任何地方（模板、文档、本文件）它都只是报告：跑一跑、读一读、保留你的破折号。

<a id="prose-lint-found"></a>
### `PROSE_LINT_FOUND`

**含义**。一次带门禁的运行（`--gate`）在给定文本中发现了至少一个特征。结尾块上方的每行 `PROSE: <file>:<line> <rule> "<match>" (<hint>)` 指出规则名与该改写成什么；`PROSE_LINT: found=<n>` 统计条数。带 `--unreleased` 只读 `## [Unreleased]` 块；带 `--base <ref>` 只读工作树自合并基点以来新增的行；带 `--sections <a,b>` 只读那些 `## ` 标题下的文字（`--gate` 之下，一个标题都不存在的文件以退出码 2 结束而非通过：草稿丢了标题）。

**修法**。按提示逐行改写草稿中点名的行（`1.6740 → 1.7010` 这类量测和 `before → after` 标题不算发现），然后重跑同一命令。PR 正文里工具原样生成的部分（审批表、issue 链接、评审发现、覆盖图）在 `--sections` 之外、从不读取——在那里出现发现说明 compose 块被编辑过：恢复它的 `--sections` 清单。某条规则反复误报正确文字，就是 `lib/prose-lint.ts` 的 bug：带上那个句子提 issue。

## 快速答案

过去放在 README 里的简短排查条目。每条只给症状与修法；上方各节深入覆盖每一条门禁消息。

**技能没显示出来**？在 gstack 检出目录里跑 `./setup --status`。它会打印每个安装（宿主、范围、版本、skills 目录、来源检出），对 `stale`、`missing` 或 `unregistered` 的行给出准确的修复命令。常规修法是从该行的来源为该宿主重跑 setup，如 `cd ~/.claude/skills/gstack && ./setup`（Claude）或 `cd ~/gstack && ./setup --host codex`。项目级安装在项目的 `.claude/skills/gstack` 或 `.agents/skills/gstack`；在项目内跑它的 `setup`。

**Cursor 加载时卡死，或升级后某个 agent 的 gstack 技能不见了**？现在每个检出只为其安装过的 agent 渲染技能（#1694）。`./setup --status` 列出它们；`./setup --host <name>` 加回来。被剪除的拷贝在 `~/.gstack/backups/host-renders/<time>-<id>/`，每个路径都记录在其 `prune.log`（见[宿主渲染被剪除](#host-renders-pruned)）。

**`/browse`（或 `/qa`、`/design-review`）报 `NEEDS_ASIDE` 或 `ASIDE_NOT_RUNNING`**？这是探测在告诉你它即将改用回退浏览器。想用 Aside？打开应用并登录——`aside --version` 应打印版本号、`aside repl 'console.log("ok")'` 应打印 `ok`——然后重跑。gstack 从不替你安装 Aside。想在 Aside 开着时故意走回退？`GSTACK_SKIP_ASIDE=1` 让所有技能、渲染器和 `./setup` 都把 Aside 当作不存在。Aside 不存在时探测会打印 `NEEDS_ASIDE: <OS>`，技能据该行决定是否做 macOS 专属的下载推介；`GSTACK_PLATFORM` 可覆盖它报的 OS，用于测试和特殊宿主（在你的 shell 里设——gstack 从不读项目 `.env` 里的它）。

**`/browse` 在回退浏览器上失败**？`cd ~/.claude/skills/gstack && bun install --production --frozen-lockfile && bun run build`

**`/make-pdf` 或 `/diagram` 渲染不了**？同样两条路：Aside 开着时经 Aside 打印（`bun run ~/.claude/skills/gstack/bin/gstack-render.ts some.html --screenshot /tmp/out.png` 可直接验证，其输出第一行 `ENGINE=aside` 或 `ENGINE=browse` 指明实际渲染的浏览器）；没有它时用内置浏览器，修法是 `bun run build`。

**安装过期**？跑 `/gstack-upgrade`——或在 `~/.gstack/config.yaml` 设 `auto_upgrade: true`。
在 Codex 及其他非 Claude 宿主上，从终端升级：在 `./setup --status` 的 `source` 列找到检出，
然后 `cd <source> && git pull && ./setup --host <host>`，并开一个新会话。

**用回退浏览器往特定输入框打字**？`browse type --selector '<css>' <text>`
打进该元素；裸的 `browse type <text>` 打进当前焦点所在。

**状态跑错了地方，或某个设置不生效**？`~/.claude/skills/gstack/bin/gstack-paths --explain` 显示 gstack 把状态放在哪个目录、为什么。见 [docs/state-root.md](https://github.com/garrytan/gstack/blob/main/docs/state-root.md)。

**想要更短的命令**？`cd ~/.claude/skills/gstack && ./setup --no-prefix`——从 `/gstack-qa` 切到 `/qa`。你的选择会被记住，影响以后的升级。

**有些技能用不上**？`gstack-config set disabled_skills make-pdf,pair-agent` 让它们不再注册到任何宿主，其描述也不再加载进每个会话。Claude Code 立即生效；其他宿主在下次 `./setup --host <name>` 或 `/gstack-upgrade` 时生效。文件仍留在盘上，所以技能调用被禁用的技能仍能工作（会收到警告）。拼错会以最接近的技能名拒绝；`gstack-upgrade` 不可禁用；`gstack-config set disabled_skills ""` 重新启用全部。

**从不用规划模式**？`gstack-config set plan_mode_preamble off` 让下次 `./setup` 在每个已安装技能里省去 "Plan Mode Safe Operations" 与 "Skill Invocation During Plan Mode" 两节（每技能约 1.6 KB）；命令会打印生效所需的准确 `./setup --refresh-registered` 行。之后 Claude Code 改从 `~/.gstack/render/claude` 提供渲染版本而非提交在库里的文件。标记 "PLAN MODE EXCEPTION — ALWAYS RUN" 的命令保留标记。`gstack-config set plan_mode_preamble on`（默认）再跑一次 `./setup` 即恢复。这对 Claude Code、Copilot 与 OpenCode 有意义：没有规划模式的宿主（Codex 等）从不携带这些小节。

**想要带命名空间的命令**？`cd ~/.claude/skills/gstack && ./setup --prefix`——从 `/qa` 切到 `/gstack-qa`。与其他技能包并行使用 gstack 时有用。

**Codex 报 "Skipped loading skill(s) due to invalid SKILL.md"**？你的 Codex 技能描述过期了。`${CODEX_HOME:-~/.codex}/skills/gstack` 是运行时目录而不是检出：`./setup --status` 显示 Codex 行的来源检出。修法：`cd <该来源> && git pull && ./setup --host codex`——仓库级安装要在项目内跑。

**`./setup` 期间 Chromium 安装失败或卡住**？内置浏览器是尽力而为：setup 记录原因、完成全部技能注册，并打印受影响的技能（`/qa`、`/qa-only`、`/design-review`、`/browse`、make-pdf、`/diagram`、`/pair-agent`）。Aside 开着时浏览器技能继续在 Aside 里跑，缺的只是回退引擎；`/pair-agent` 则始终需要内置浏览器。修好成因后重跑 `./setup`。可调项：`GSTACK_PLAYWRIGHT_INSTALL_TIMEOUT=<seconds>` 在慢网络下提高下载上限（默认 600）；`GSTACK_SKIP_PLAYWRIGHT=1` 完全跳过 Chromium 安装（CI、无浏览器机器）；`GSTACK_CHROMIUM_NO_SANDBOX=1` 用于 Chromium 装好却无法启动、因为宿主阻止非特权 user namespace 的场合（Ubuntu 24.04+ 的 AppArmor 默认行为，#2157）。

**setup 以 "Not registered (a skill you own already uses the name; left untouched)" 结束？**
gstack 只删除或覆盖它能证明是自己创建的技能条目：指向 gstack 的符号链接、带 `.gstack-owned` 标记（`./setup` 写进它创建的每个目录）的目录，或与 gstack 的 SKILL.md 逐字节相同、或带生成的 `<!-- AUTO-GENERATED from ... -->` 横幅的 SKILL.md。你自己写的 `qa/` 或 `ship/` 不会被 `./setup`、`gstack-relink` 和两种前缀模式切换碰掉，链接器会在最终摘要里点名它。给你的技能改名或挪走，或切换模式（`./setup --prefix` / `--no-prefix`）让名字不再冲突。如果你从生成的 gstack SKILL.md 起家再自行编辑过，该文件会在 gstack 的版本链入之前移到 `~/.gstack/backups/skills/<timestamp>/<skill>/SKILL.md`，绝不删除。

## gstack-decision-trail 与 gstack-worktree-audit

<a id="decision-trail-start-required"></a>
### `gstack-decision-trail: DECISION_TRAIL_START_REQUIRED: <file> has <n> rows and run <id> has no start row after the newest one`

你用 `--run <id>` 向一条其他运行已写过的 trail 追加，而其中最新的 `start` 行不是本次运行的。加入一条 trail 的运行（一次 agent 对话及其后续轮次）以自己的 `start` 行开头，让审阅者能分清哪些行是谁写的。先跑一次 `gstack-decision-trail start <file> <id>` 再追加；本次运行的 start 行仍是最新时，start 命令是空操作，所以重跑同一脚本安全。没有写入任何东西。见 [docs/unattended.md](https://github.com/garrytan/gstack/blob/main/docs/unattended.md#the-decision-trail)。

### `gstack-worktree-audit` 打印 `warn: no -b given; MERGED checks against origin/HEAD`，或每行都显示 `MERGED no`

不带 `-b` 时，审计拿每个 worktree 的 head 与远程默认分支比较（依次 `origin/main`、`origin/master`），这不一定是 PR 合入的分支；传 `-b origin/<branch>`。squash 合并的分支永远不会是基点的祖先，所以 `PR #n/merged` 旁的 `MERGED no` 属正常，只要树干净、每个提交都已推送，分类仍是 `safe`；该分支上有未推送提交或未跟踪文件则会归入 `review`，因为删除 worktree 会丢失它们。审计只读（唯一的写是拉取基点，`--no-fetch` 可跳过）；被判 `safe` 的 worktree 仍由你决定是否删除；`prunable` 行指一个已注册、未加锁、目录已消失的 worktree（`git worktree prune`）；加了锁的，或 `.git` 链接缺失的 `broken` 行，则读作 `review`。`clean,ignored:<n>` 表示树干净但持有随 worktree 一起消失也无妨的 gitignored 条目（`.env`、构建产物）。


## Agent 宿主（gstack-harness）

`bin/gstack-harness` 把 gstack 的技能注册进 gstack 所安装的 agent 宿主（OpenClaw、Hermes、Dot 或其他；QM 暂不可用），并把它写的每个文件记录到 `$GSTACK_STATE_ROOT/harness/<id>.ledger`。每条错误行以错误码和指向本节的链接结尾。各宿主的安装、校验与卸载步骤见 [docs/hosts.md](/hosts/#agent-宿主)。

<a id="harness-unknown-target"></a>
### `gstack-harness: unknown harness "<name>"` (HARNESS_UNKNOWN_TARGET)

名字不是 openclaw、hermes、dots、generic、qm、muse、grok 之一。gstack 不认识的宿主，用 `generic` 加 `--skills-dir` 或 `--context`，或用 `--print` 拿到可粘贴的路由技能与上下文块。

<a id="harness-no-destination"></a>
### `gstack-harness: <harness> has no default skills folder` (HARNESS_NO_DESTINATION)

`generic` 没有默认位置，gstack 也从不猜测你的上下文文件。传 `--skills-dir <dir>`（宿主读取的 Agent Skills 目录）或 `--context <file>`（宿主每个会话加载的文件），或 `--print` 什么都不写。

<a id="harness-mode-unsupported"></a>
### `gstack-harness: Hermes does not support --skills router` (HARNESS_MODE_UNSUPPORTED)

Hermes 的技能索引只列出以其技能树中文件夹形式注册的技能，router 模式会让其余 gstack 技能从模型可见的清单里消失（Hermes 的 `skill_view` 仍能按名字加载未列出的技能，但没有任何东西告诉模型它存在）。去掉 `--skills` 采用宿主默认（Hermes：all；OpenClaw：hybrid；dots 与 generic：router）。OpenClaw 接受 router、hybrid 或 all。

<a id="harness-unsafe-destination"></a>
### `gstack-harness: refusing to write into <dir>: <why>` (HARNESS_UNSAFE_DESTINATION)

目标是你的家目录、文件系统根、gstack 检出内部、符号链接（或在 gstack 自己目录原位置持有符号链接），或含制表符/换行符的路径。没有写入任何东西。改选宿主自己的技能目录，如 `--skills-dir ~/.openclaw/skills`。

<a id="harness-unowned-entry"></a>
### `gstack-harness: <path> already exists and gstack did not write it` / `a skill named <name> already exists at <path>` (HARNESS_UNOWNED_ENTRY)

gstack 只替换其台账记录在案的自己写的文件。同名目录或技能是你（或其他工具）的，而宿主按名字解析技能，所以 gstack 停手而不是遮蔽它。改名或挪走该条目后重新注册。

同一代码也会拦下 `register <harness> --context <file>`：文件里 `<!-- gstack:begin harness-routing -->` 或 `<!-- gstack:end harness-routing -->` 行没有恰好一个配对，或 gstack 块被人编辑过。删掉这些标记行（留好你要的内容后连中间行一起删），再注册。

<a id="harness-context-refused"></a>
### `gstack-harness: refusing to write the gstack block into <file>: <why>` (HARNESS_CONTEXT_REFUSED)

`--context` 只往你点名的文件写路由块，两类文件在写入前即被拒绝。`SOUL.md`（任意大小写）是宿主的身份文件（Hermes 与 OpenClaw 每个会话都加载它），gstack 绝不编辑。对 Hermes，新的 `.hermes.md`、`HERMES.md`、`AGENTS.override.md`、`AGENTS.md` 或 `CLAUDE.md` 若会压过 Hermes 当前加载的规则文件同样被拒：Hermes 只加载一种项目上下文类型，先到先得（`.hermes.md`/`HERMES.md`，然后 `AGENTS.md` 链，然后 `CLAUDE.md`，最后 `.cursorrules`），同一目录取先找到的名字（`.hermes.md` 先于 `HERMES.md`，`AGENTS.override.md` 先于 `AGENTS.md`），并取向 git 根上行走的最近的 `.hermes.md`/`HERMES.md`——新建它会遮住那些规则。改点名 Hermes 已经加载的文件（报错会指出），或 `$HERMES_HOME` 里对每个会话生效的文件。

<a id="harness-render-failed"></a>
### `gstack-harness: could not render <harness> skills: ...` (HARNESS_RENDER_FAILED)

宿主技能是从本检出用 `scripts/gen-skill-docs.ts` 渲染的。在检出里跑 `bun install` 再注册；生成器输出的最后几行附在消息里。

<a id="harness-budget-exceeded"></a>
### `gstack-harness: router description is <n> bytes` / `context block is <n> bytes` (HARNESS_BUDGET_EXCEEDED)

路由技能描述（至多 300 字节）与上下文块（至多 600 字节）会进每个会话，所以 gstack 拒绝让它们变大。这是 gstack 的 bug：带上字节数报告。

<a id="harness-not-registered"></a>
### `gstack-harness: no registration named "<name>"` (HARNESS_NOT_REGISTERED)

`$GSTACK_STATE_ROOT/harness` 下没有该宿主或 id 的台账。`gstack-harness status` 列出本机每个注册及其 id。

<a id="harness-hook-unsupported"></a>
### `gstack-harness: <harness> has no start hook` / `the start hook goes into the <harness> profile <dir>, and this registration uses another skills folder` (HARNESS_HOOK_UNSUPPORTED)

[启动钩子](/hosts/#start-hook)只面向 OpenClaw 与 Hermes，且要写进宿主 profile 自己的插件目录——宿主扫描的那一个。`--skills-dir` 指到别处的注册没有 gstack 能信任的 profile；`OPENCLAW_CONFIG_PATH` 指向别的配置时 OpenClaw 从 profile 之外读设置，gstack 的设置改动落不进去——所以 `--start-hook` 被拒绝、什么都不写。`OPENCLAW_CONFIG_PATH` 指向 profile 自己的 `openclaw.json`（解析符号链接后比对）不算拒绝。不带 `--skills-dir` 注册（设 `OPENCLAW_STATE_DIR` 或 `HERMES_HOME` 选定 profile），取消 `OPENCLAW_CONFIG_PATH` 或指向 profile 自己的 `openclaw.json`，或去掉 `--start-hook`。当开关来自 `GSTACK_HARNESS_START_HOOK` 或 `harness_start_hook` 而非 flag 时，注册拿不到钩子，`gstack-harness register` 与 `./setup --host` 以退出码 4 给出原因（`HARNESS_HOOK_INACTIVE`，`start hook is off`）；刷新只打印。

<a id="harness-hook-choice-invalid"></a>
### `gstack-harness: GSTACK_HARNESS_START_HOOK="<value>" is not on or off` (HARNESS_HOOK_CHOICE_INVALID)

启动钩子开关接受 `on` 或 `off`（`GSTACK_HARNESS_START_HOOK` 也接受 `1` 或 `0`）。没有注册任何东西。修正取值，或取消该变量让每次注册保留各自已保存的选择。

<a id="harness-hook-owned-elsewhere"></a>
### `gstack-harness: a gstack-start plugin already exists at <dir> and this registration did not write it` (HARNESS_HOOK_OWNED_ELSEWHERE)

每个宿主 profile 只有一个启动钩子，归写入它的 gstack 注册所有——这样移除一个安装永远带不走另一个安装的钩子。该目录不在本次注册的台账里：是另一个 gstack 检出或状态根写的，或有人手工造的。没有写入任何东西。从写入它的那份 gstack 安装跑 `gstack-harness register <harness> --no-start-hook`（它的 `gstack-harness status` 显示钩子），或把目录挪开后重新注册。

<a id="harness-hook-inactive"></a>
### `gstack-harness: <harness> start hook is written: <why>. Turn it on: <command>` (HARNESS_HOOK_INACTIVE, exit 4)

技能已注册、启动钩子文件已就位，但钩子在宿主里未激活。gstack 经宿主自己的 CLI 打开钩子再读回确认，所以这意味着：宿主还没有配置（`no OpenClaw config at <path> yet` 或 `no Hermes config at <path> yet`：先跑 `openclaw onboard` 或 `hermes setup`，再 `gstack-harness refresh`；在此之前 gstack 不跑任何宿主命令，因为 CLI 会创建一个只含 gstack 插件设置的配置）；CLI 不在 `PATH`；它的某条命令失败或超时（消息引用其最后输出）；或宿主设置拦下了插件：OpenClaw 设了 `plugins.allow` 但没有 `gstack-start`、`gstack-start` 在 `plugins.deny` 里，或 `hooks.allowPromptInjection: false`。gstack 绝不编辑你的 allow/deny 清单。跑打印出的命令，再 `gstack-harness status`；再次 `--start-hook` 会重试整步。`./setup --host` 因同样原因退出 4。刷新与升级会自行重试不报失败，你在宿主里禁用插件后即停止。

同一代码带 `start hook is off: <why>` 表示你经 `GSTACK_HARNESS_START_HOOK` 或 `harness_start_hook` 请求钩子，但本次注册无法接受（自定义 `--skills-dir`、`OPENCLAW_CONFIG_PATH` 指向别的配置、或不安全的插件目录）；消息写明修法。

<a id="harness-qm-credentials"></a>
### `gstack-harness: no QM admin credential in the environment` / `... needs --yes` (HARNESS_QM_CREDENTIALS)

向 QM 注册 gstack 会发布一个组织技能包，所以需要组织管理员凭据与显式 `--yes`。在环境里设 `GSTACK_QM_URL` 与 `GSTACK_QM_ADMIN_TOKEN`（或 `GSTACK_QM_SIGNING_SECRET` 配 `GSTACK_QM_ADMIN_ACTOR`），跑 `gstack-harness register qm --yes`。gstack 绝不询问、打印或存储凭据；消息改而展示准确的请求。凭据就位后注册仍会在下一检查处停下：QM 还无法导入 gstack（[HARNESS_QM_PACK_TOO_LARGE](#harness-qm-pack-too-large)）。

<a id="harness-qm-api"></a>
### `gstack-harness: <METHOD> /v1/admin/skill-packs... returned HTTP <code>` / `... failed: timed out after 60 s` (HARNESS_QM_API)

QM 的管理 API 拒绝或未应答。gstack 创建前会先列出包并重试一次，重跑不会造出第二个包。确认 URL 指向 QM core、凭据是组织管理员；`gstack-harness status` 显示是否记录了包 id。

<a id="harness-qm-pack-too-large"></a>
### `gstack-harness: gstack at <sha> is <n> MiB in <n> files; nothing was sent to QM` / `QM refused the pack: pack exceeds max bytes (33554432)` (HARNESS_QM_PACK_TOO_LARGE)

QM 注册暂不可用。QM 的技能包导入会克隆整个仓库、逐文件读完才挑技能，且默认拒绝超过 32 MiB 或 5,000 文件的包。gstack 仓库更大（约 73 MiB、4,300 文件），所以 gstack 先查大小、什么都不发。QM 自己拒绝时（另一套限额的 QM），已创建的包会留在组织里但没有技能：`gstack-harness unregister qm --remote` 归档它。过渡期方案：把 `gstack-harness register generic --print` 的输出贴进 QM agent 的指令里。


## 模块配置组（gstack-modules）

这些错误码来自 `bin/gstack-modules` 与 `gen-skill-docs --loadout/--modules`（指南：[loadouts.md](https://github.com/garrytan/gstack/blob/main/docs/loadouts.md)）。每个都在写入任何东西之前以退出码 2 结束，且没有一个回退到 `full` 配置组：评测组里静默渲染成 `full` 测的就是对照组了。例外是安装期提示 `LOADOUT_INVALID_MODEL`、`LOADOUT_MISMATCH` 与 `LOADOUT_FALLBACK`（来自 `bin/gstack-modules install`、Capy 安装器与 `gstack-skill-start`）：安装从不因它们失败，改而提供 `full`。

<a id="loadouts-invalid"></a>
### `LOADOUTS_INVALID: modules/loadouts.json …`

**含义**。`modules/loadouts.json` 不可读，或引用了不存在的模块、基础配置组、层级或默认项，排除了钉定模块，或把一个模型 id 映射到两个层级。**修法**。改正点名的条目，跑 `bin/gstack-modules validate` 直到打印 `LOADOUTS: ok`；`git checkout -- modules/loadouts.json` 恢复提交在库的文件。

<a id="loadout-unknown"></a>
### `LOADOUT_UNKNOWN: "<name>" is not a loadout (valid: …)`

**含义**。`--loadout` 或 `--modules` 的首个 token 在 `modules/loadouts.json` 里没有对应配置组。**修法**。用 `valid:` 清单里的名字（`bin/gstack-modules list` 会打印）；`full` 永远存在。

<a id="loadout-invalid-model"></a>
### `LOADOUT_INVALID_MODEL: "<id>" is not a plain model id; using full`

**含义**。给安装器的（`--model`）或 `GSTACK_MODEL` 里的模型 id 规范化后不是纯 id（小写字母、数字、`.`、`_`、`-`，至多 80 字符），因此不会进入任何启动文件或启动行。提供的是完整技能；没有失败。**修法**。按你的模型清单所写的形态传 id，如 `--model claude-opus-5-5` 或 `--model anthropic/claude-opus-5-5`（[配置组](https://github.com/garrytan/gstack/blob/main/docs/loadouts.md#how-gstack-picks-a-loadout)）。

<a id="loadout-mismatch"></a>
### `LOADOUT_MISMATCH: <baked id> vs <running id>: read <full root>/<skill>/SKILL.md now`

**含义**。你打开的技能是为另一模型渲染的 lite 版，而 `GSTACK_MODEL` 表明本会话跑的是另一个模型。lite 只在烘焙它的模型上做过度量。**修法**。改读点名的完整版 SKILL.md。要杜绝复发，用本会话的模型跑安装器（`scripts/install.sh --model <id>`），并从它打印的 `SKILL_ROOT` 读技能。

<a id="loadout-fallback"></a>
### `LOADOUT_FALLBACK: <reason>; serving full`

**含义**。lite 树没能发布（渲染或悬挂引用失败、状态根不可写、或已发布文件夹的文件与 `loadout.lock.json` 不再一致），安装器改而提供完整技能并打印它们的 `SKILL_ROOT`。其他一切未变。**修法**。修好点名的成因；文件变动的文件夹，删掉 `<state root>/loadouts/<loadout>-<digest>` 重跑安装器即可重新发布。

<a id="module-spec-invalid"></a>
### `MODULE_SPEC_INVALID: …`

**含义**。`--modules` 的某个 token 不是 `-<模块 id>` 或 `+<模块 id>`；同时给了 `--loadout` 和 `--modules`；`gen:skill-docs` 收到含排除项的选择但没给 `--out-dir`；或渲染 flag 缺失或格式错误。**修法**。按 `<loadout>,-<id>,+<id>` 写（如 `full,-section:office-hours/second-opinion`），并传 `bin/gstack-modules --help` 列出的 flag。

<a id="module-unknown"></a>
### `MODULE_UNKNOWN: "<id>" is not a module`

**含义**。该 id 不对应任何技能、小节、overlay 或 preamble 片段。**修法**。从 `bin/gstack-modules list` 复制 id。

<a id="module-pinned"></a>
### `MODULE_PINNED: <id> is pinned and can never be excluded`

**含义**。该选择删掉了安全契约必需的模块：启动命令（`preamble:bash`）、规划模式规则、提问格式、完成状态、无人值守 profile、/ship 的评审门禁、路由技能或 `/gstack-upgrade`**。修法**。从选择里去掉 `-<id>`；`bin/gstack-modules list --pinned` 打印全部钉定 id。

<a id="module-exclusion-unsafe"></a>
### `MODULE_EXCLUSION_UNSAFE: <id>: referenced by <file>:<line>`

**含义**。渲染出的树仍指向配置组排除掉的模块，照着走的 agent 会去读一个不存在的文件。**修法**。把引用方模块也排除，或在模板里把引用骨架文字包进 `{{IF_SECTION:<id>}}…{{/IF_SECTION}}`（该小节加载时文字原样渲染）。没有发布任何东西；改完重跑。

<a id="render-failed"></a>
### `RENDER_FAILED: gen-skill-docs failed: …`

**含义**。该配置组的生成环节本身失败（未解析的占位符、超限的技能、缺失的小节）。**修法**。修好点名的模板或模块再重跑。暂存目录已删除，`--out-dir` 未变。

<a id="render-dest-not-owned"></a>
### `RENDER_DEST_NOT_OWNED: <dir> exists and holds no loadout.lock.json`

**含义**。`--out-dir` 是一个非空目录且不是先前 `gstack-modules render` 写的，替换它可能删掉别人的文件。**修法**。换新的或空目录，或先前某次渲染的目录。

## ubi-runner 恢复与结果汇聚端

这些错误码来自 `scripts/ubicloud/ubi-runner.sh`（GST-1220）。`RECOVERED`、`RECOVER_GONE` 与 `RECOVER_FAILED` 行打到 stdout，每个 bundle 一行。每个 `RECOVER_FAILED` 都保留其 bundle，所以修好成因后重跑 `recover` 总是安全。

<a id="ubi-recovery-required"></a>
### `UBI_RECOVERY_REQUIRED`

**含义**。计费运行（`--counted` 或 `UBI_COUNTED=1`）或 `recover` 需要恢复目录，而 `UBI_RECOVERY_DIR`、`GSTACK_CAPY_RECOVERY_DIR`（及 `recover --dir`）都没指定。没有创建任何东西。计费重跑在要挂到一个存活 VM、而其 bundle 在恢复目录下缺失或无法用本密钥打开时，也以该码拒绝。**修法**。把 `UBI_RECOVERY_DIR` 设为另一控制者可读的目录（Capy 上即 drive 文件夹），再重跑。没有可打开 bundle 的 VM，用打印的 `down` 命令销毁后重跑。

<a id="ubi-recovery-unavailable"></a>
### `UBI_RECOVERY_UNAVAILABLE`

**含义**。bundle 无法写入或打开：缺 `openssl`、没有密钥（`UBI_RECOVERY_KEY` 或 `UBICLOUD_API_KEY`）、或目录不可写。计费运行会停：检查前置于开头时在任何创建之前停；后置写入失败时经 `up` 的清理路径停（会销毁 VM）。非计费运行打印警告、不带 bundle 继续。**修法**。装 openssl、把目录变为可写，再重跑。

<a id="recover-decrypt-failed"></a>
### `RECOVER_FAILED: vm=<name> code=RECOVER_DECRYPT_FAILED`

**含义**。bundle 在本机密钥下认证失败，或它封装的 VM 名/所有者与其文件名和文件夹不符，没有写入任何状态。要么密钥与创建方控制者不同（另一个 `UBI_RECOVERY_KEY` 或不同的 Ubicloud token），要么文件被改、改名或挪动。**修法**。把 `UBI_RECOVERY_KEY`（或 `UBICLOUD_API_KEY`）设为创建方控制者所用值，重跑 `recover`。密钥无误则视 bundle 为被篡改，改从 Ubicloud 控制台销毁 VM。

<a id="recover-api-unavailable"></a>
### `RECOVER_FAILED: vm=<name> code=RECOVER_API_UNAVAILABLE`

**含义**。Ubicloud API 对该 VM 返回了 200/404 以外的应答，或创建请求发出不足 `UBI_CREATE_GRACE` 秒、可能仍在途。没有写入状态。**修法**。等 API 正常应答或宽限期过后重跑 `recover`。

<a id="recover-exists"></a>
### `RECOVER_FAILED: vm=<name> code=RECOVER_EXISTS`

**含义**。本机已有该 VM 的状态，`recover` 绝不覆盖。**修法**。直接用那份状态（`pull`、`ssh`、`down <name>`）。确认已过期再删状态目录。

<a id="recover-gone"></a>
### `RECOVER_GONE: vm=<name>`

**含义**。已确认 VM 消失，其 bundle 随之删除。**修法**。无需。它的结果在汇聚端收下的位置（如果它配了汇聚端）。

<a id="ubi-sink-invalid"></a>
### `UBI_SINK_INVALID`

**含义**。`--sink` 或 `UBI_SINK` 指定了 `https-put:<预签名 https URL>` 以外的东西。`file:<绝对目录>` 仅在 `UBI_SINK_ALLOW_FILE=1`（面向测试）下可用；没有 `git:` 汇聚端——那会把仓库凭据放上 VM。没有创建任何东西，输出行也从不打印 URL。**修法**。传单对象的预签名 PUT URL。

<a id="sink-flush-failed"></a>
### `SINK_FLUSH_FAILED: vm=<name> seq=<n> last_push=<epoch|never> [sink_skipped=size|tar_failed]`

**含义**。`down` 停掉 VM 的推送进程并做了最后一次推送，而那次推送失败、超过 150 秒、或因结果超过 `UBI_SINK_MAX_MB`（`size`）或读不出（`tar_failed`）被跳过。被跳过的快照永不上传，汇聚端保留上一份好快照。VM 仍被销毁，所以汇聚端只保有截至 `last_push` 那次推送的结果。该 VM 的 `run` 或 `verify` 以 1 而非 0 退出。**修法**。把该次运行的结果视为不完整。确认预签名 URL 未过期且仍允许 PUT，再重跑。分层 `verify` 用 `--no-resume` 重跑：普通重跑按同一键复用已通过的层、不建 VM 也不推送，汇聚端仍会保留那份不完整快照。

<a id="ubi-create-unknown"></a>
### `UBI_CREATE_UNKNOWN`

**含义**。`up` 或 `run` 发出的创建收到 Ubicloud 5xx 或无应答，无法断定 VM 是否属于本次调用：要么按名查找在 `UBI_CREATE_GRACE` 秒内未应答，要么有 VM 应这个名字但本次调用的 ssh key 在 `UBI_SSH_WAIT` 秒内打不开它。别的调用者可以在名字检查与创建之间显式占用 `-n` 名字，所以无应答创建之后发现的 VM，在本次调用的 key 证明属于我们之前不会销毁。VM 的记录与恢复 bundle 保留，什么都不销毁它，`run` 打印 `left=unknown`**。修法**。跑 `scripts/ubicloud/ubi-runner.sh list` 查看 VM 及其所有者。确认是自己的才跑 `down <name>`——`down` 销毁应这个名字的一切。本所有者的收割进程会在未确认 VM 的 `-t<hours>` TTL 到期后销毁它。

<a id="ubi-attach-unknown"></a>
### `UBI_ATTACH_UNKNOWN`

**含义**。`run` 重跑时发现一条运行记录，其 VM 无法经 Ubicloud API 核实（200/404 以外的应答），于是拒绝启动第二个 VM——那会让第一个继续计费。没有创建任何东西。**修法**。等 API 正常后重跑。

## 按仓库清理（gstack-clean）

这些错误码来自 `bin/gstack-clean`：回收 `<repo>/.gstack/tmp/` 里的旧 codex 暂存、超 1 MB 的 browse 日志，`--audit-days N` 时还回收旧的 browse 审计条目。不传 `--apply` 什么都不改；`gstack-clean --help` 列出它碰哪些东西。

<a id="gstack-clean-usage"></a>
### `gstack-clean: an unknown flag or a bad --audit-days value … (GSTACK_CLEAN_USAGE)`

**含义**。flag 不是 `--apply`、`--audit-days N`、`--json`、`--help` 之一，或 `--audit-days` 收到的不是 1–99999 的整数天。输出行引用坏值，最后一行是用法行。退出码 2；没有读取或改动任何东西。**修法**。例如 `gstack-clean --audit-days 30`。

<a id="gstack-clean-target-refused"></a>
### `gstack-clean: the folder to clean is not a safe per-repo .gstack folder … (GSTACK_CLEAN_TARGET_REFUSED)`

**含义**。gstack-clean 只清理运行目录对应的 `<git toplevel>/.gstack`。git 检出之外拒绝；`.gstack` 是符号链接拒绝；`BROWSE_STATE_FILE` 指向别的目录的 `browse.json` 拒绝；目录是、含有或位于 gstack 状态根（默认 `~/.gstack`，你的学习记录与设置所在）之内也拒绝。退出码 3；没有碰任何东西。**修法**。在仓库内运行；取消 `BROWSE_STATE_FILE`（或指向本仓库的 `.gstack/browse.json`）；把符号链接形态的 `.gstack` 换成真实目录。

<a id="gstack-clean-partial"></a>
### `FAILED <path> <errno>` … `(GSTACK_CLEAN_PARTIAL)`

**含义**。一次或多次删除/截断失败，通常是 `EACCES` 或 `EPERM`（只读文件或目录）或 `EBUSY`（别的程序占着文件）。其余动作全部完成。退出码 1。**修法**。重跑安全：修好每个 FAILED 路径的权限，或等占用它的程序结束，再跑 `gstack-clean --apply`。

<a id="gstack-clean-internal"></a>
### `gstack-clean: unexpected gstack-clean failure … (GSTACK_CLEAN_INTERNAL)`

**含义**。gstack-clean 遇到了未预期的错误；输出行已点名。退出码 1。出错前的改动保留成立，且每一处都在改动前核验过。**修法**。重跑一次；复现则把打印的错误报给 gstack 维护者。

<a id="runaway-usage"></a>
### `RUNAWAY_USAGE: …` (gstack-runaway)

**含义**。`gstack-runaway` 收到：无命令、未知命令、`--thread` 与 `--dir` 同时给或都不给、无值 flag、解析不了的 `--now`、或不存在的路径。退出码 2；没有读取任何东西。**修法**。跑 `gstack-runaway --help`，传入 /runaway-stopper 抓取程序写的文件。

<a id="runaway-input"></a>
### `RUNAWAY_INPUT: file=<path> …` (gstack-runaway)

**含义**。该线程的文件不是合法 JSON，或缺 `cost.tokens`、可解析的 `created_at` 或数值型 `tasks[].cost.tokens`。该线程被跳过（绝不计入 OK），清扫的其余部分照跑，`SWEEP:` 把它计为 `unreadable`，退出码 1。**修法**。用 `tools.thread.get` 重新抓取该线程（完整对象，不要摘要），重跑扫描。
