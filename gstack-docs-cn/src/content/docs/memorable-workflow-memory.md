---
title: "用 Memorable 做工作流记忆（可选，第三方）"
---


当你第三次让 Claude Code 做同一类形状的工作时，它又从零开始。它重读同样的文件、重跑同样的搜索，最后得出它上个月就写过的修法。**Memorable** 是一个第三方 CLI，它记录一项任务是如何完成的，并在你下次提出相近需求时把这份记录交还回来。

gstack 不安装它、不捆绑它、也不依赖它。gstack 增加的是一座**桥**：通过 gstack 自己的 hook 管理器注册 Memorable 的 `UserPromptSubmit` hook，并裹上 gstack 给其他所有出机汇聚端（off-machine sink）的同等保证。它默认关闭，直到你开启；Claude Code 是它唯一可用的宿主；且它暂不支持 Windows。

## 你能得到什么

- 每次提示之前，hook 会询问 Memorable 是否有过去的会话解决过与之相近的问题；若有，就把那套做法作为清晰标注的参考数据注入。
- 一个显式的 gstack 侧同意键 `memorable_recall`，默认关闭，由 `gstack-egress grants` 连同其撤销命令一并列出。
- 每个交给厂商二进制的提示都有一张回执，先于交接写入（`gstack-egress list --sink memorable-recall`）。没有回执，就没有交接。
- 一次 HIGH 层级的密钥预扫描：携带真实形状凭据的提示永远不会被交出。
- 对返回内容施加信任信封与 8 KiB 上限，且厂商永远无法阻断提示或冒充 gstack 发言。
- 厂商运行在一个白名单化的环境里（不含你会话中的任何 API 密钥），位于自己的进程组内；hook 结束、超时或被 Claude Code 中途终止时，整个进程组都会被杀掉。厂商故意脱离到自己的会话（`setsid`）中的进程在那个组之外，也在这个保证之外；那是厂商自身行为中可见的选择，不是 gstack 能阻止的。
- 在稳定安装处注册、每次 `./setup` 自愈、在 `./setup --no-team` 后存活、由 `gstack-uninstall` 移除，并且即使 Claude Code 重写过 `settings.json`，关闭开关依然有效。

## 它不是什么

- 不是确定性重放。它是召回的指引，模型可以无视。
- 与 Aside 或浏览器自动化无关。
- 不是跨过进程边界仍带 gstack 保证的 gstack 特性。gstack 把提示交给 `memorable` 二进制之后的一切，都属于另一家厂商的闭源 npm 包。

## 两个同意，互不隐含

| 同意 | 由谁设置 | 控制什么 |
|---|---|---|
| `memorable_recall`（gstack） | `gstack-memorable enable` / `disable` | gstack 的 hook 是否把提示交给厂商二进制 |
| Memorable 自身的同意 | `memorable enable` / `disable` / `forget`，由你运行 | Memorable 是否存储做法，以及（据其文档）是否向其抽取 API 发送会话轨迹 |

gstack 从不运行厂商的同意命令，也从不读取它们的状态。`gstack-memorable enable` 会把它们打印出来，供你自行运行或查验。关掉这座桥关掉的是 gstack 的交接；它不改变 Memorable 对已有数据被允许做什么。

## gstack 交出什么，又能证明什么

| 命令 | gstack 交给厂商二进制什么 |
|---|---|
| `gstack-memorable status`、`enable`、`disable` | 什么都不交。它们只检查二进制是否存在；从不执行它。 |
| hook，在每条提示上（门禁开启时） | Claude Code 的 `UserPromptSubmit` JSON：`session_id`、`cwd`、`transcript_path`、`prompt`。二进制以你的权限运行，因此它能读取你能读取的一切，包括该路径指向的会话记录。 |

回执精确证明那些字节（数量与 sha256），并点名 gstack 实际运行的接收方：`local:<memorable 可执行文件路径>`。它不证明、也无法证明厂商的网络行为。Memorable 的文档称：召回仅在本地词法匹配未命中时才通过其 API 嵌入一条脱敏的任务行；捕获则上传工具名、白名单内的参数字段和一条 200 字符的任务行。这些是厂商的说法。这座桥按 memorable-cli 0.5.18 的 hook 契约测试；其他版本的兼容性是厂商的主张。

二进制看到的环境是一份白名单，而不是你的会话环境：`PATH`、`HOME`、用户名与 shell 名、区域设置（`LANG`、`LC_*`）、临时目录、标准代理与 TLS 变量（`HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY`、`SSL_CERT_FILE`、`SSL_CERT_DIR`、`NODE_EXTRA_CA_CERTS`）、`XDG_*` 目录，以及所有 `MEMORABLE*` 变量。任何 `ANTHROPIC_API_KEY`、任何 `GSTACK_*`、任何 `CLAUDE_*` 都到不了它那里。一旦脱敏引擎在其 stderr 中发现 HIGH 或 MEDIUM 层级的形状（凭据、邮箱、电话号码），该 stderr 就不会进入 `hook-errors.log`，因此在报错时回显输入的厂商无法把你的提示复制进日志。回执的 `payload_class` 是令牌 `claude-user-prompt-json->local-vendor-cli`：提示 JSON，交给本地厂商可执行文件；网络目的地对 gstack 是未知的（Memorable 称：本地召回未命中时走它的 embed API）。

门禁关闭或设置了 `MEMORABLE=0` 时，hook 会静默跳过交接（没有东西被拒绝，因此也不记录日志）。

以下情况它会拒绝交接，并在 `~/.gstack/hook-errors.log` 留下一行限频记录：

- 厂商二进制缺失；
- 提示携带 HIGH 层级的凭据形状（对原始字节和解码后的字符串值都做了检查，JSON 转义的密钥也溜不过去），或大于 1 MiB；
- 仓库的逐远端信任策略（trust policy）为 `deny`，或为 `read-only` 且未按下文开启召回（按会话的工作目录判定，因此涉及其他仓库的会话不在覆盖范围内），或该策略根本无法查询（git 读不了仓库、存储不可读或损坏）：查询失败即关闭（fail-closed）；
- 回执写不进去，或 hook 的 4.5 秒预算撑不起下一步（对超大提示的密钥扫描，或拉起厂商进程）。

一张缺少 outcome 的回执意味着宿主杀掉了 hook 或时间耗尽。把它读作未知，永远不要读作成功。outcome 为 `output-written` 表示 gstack 在自己的 stdout 上写下了信封化的上下文供 Claude Code 注入；Claude 是否用了它，不是 hook 能知道的。

## gstack 测试什么，什么是 Memorable 的主张

gstack 在 `test/gstack-memorable.test.ts`、`test/memorable-user-prompt-hook.test.ts` 和 `test/gstack-settings-hook-schema-aware.test.ts` 中对着一个假厂商测试这座桥：上述每一种拒绝、先回执后交接的顺序、信封与上限、环境白名单、进程组击杀、Claude Code 剥掉标签后按身份移除、清扫排除、卸载分支，以及退出码。进程边界之外的一切——Memorable 存了什么、存在哪里、发送了什么、`memorable disable` 和 `memorable forget` 各自抹掉什么——都是 Memorable 的主张，不是我们的。

## 开启（三步，中间一步由你完成）

```bash
npm i -g memorable-cli          # 该 CLI 来自 npm，不来自 gstack
memorable login && memorable enable   # 厂商的账户与厂商的同意；只有你能做这两步
gstack-memorable enable         # gstack 的门禁 + hook，落在稳定安装处
```

以下情况 `enable` 会拒绝且不做任何改动：厂商二进制缺失；Memorable 已注册了自己的 hook（见下文）；稳定安装不带这座桥（先运行 `./setup`）；`settings.json` 读不了。在当前版本的 Claude Code 上，新 hook 几秒内即被拾取；若没有触发，重启会话。验证用：

```bash
gstack-memorable status
```

## 若 Memorable 已注册了该 hook

`memorable install-hooks` 与 `memorable start` 会以 Memorable 自己的名义注册同一个 `UserPromptSubmit` hook，位于 gstack 的表之外（`memorable enable` 不会；只有那两个命令会）。此时 `enable` 会拒绝，而不是添加第二个条目：两个条目会在每条提示上把 hook 跑两遍，注入两遍、捕获两遍，双重消耗你的配额。

要改交给 gstack，从 `~/.claude/settings.json` 删除那个条目，再运行一次 `enable`。Memorable 没有移除自己 hook 的命令。

## 关闭

```bash
gstack-memorable disable
```

门禁先落下，因此条目还没消失，下一条提示就已关闭；已过门禁的提示会照常完成。随后 gstack 的条目按身份移除（无论有没有标签），两个结果都会核验，任何部分失败都以非零退出码报告。Memorable 自身的同意与它已存储的内容不受影响：`memorable disable` 停止捕获，`memorable forget` 拒绝一切，各自的抹除范围见其自己的文档。

该条目也会随 `gstack-uninstall` 一并移除（其 summary 中有点名），并在 `./setup --no-team` 后存活——那只会拆除团队模式的 hook。

## 只读仓库中的召回（逐远端开启）

`read-only` 让仓库内容不进 brain，默认同时让该仓库的提示远离 Memorable。如果你选 `read-only` 只是为了停止代码摄取，且不介意 Memorable 看到该仓库的提示，可以为那一个远端开启：

```bash
gstack-gbrain-repo-policy memorable set github.com/acme/client-a allow
gstack-gbrain-repo-policy memorable get github.com/acme/client-a   # read-only	allow
gstack-gbrain-repo-policy memorable set github.com/acme/client-a off
```

该开启项默认关闭，且只覆盖你点名的那个远端（它的 SSH 与 HTTPS 拼法算同一个键）。在 `deny` 远端上会被拒绝；即使有人手工把开启项写进存储，`deny` 也一票否决召回。变更远端层级会清除它，因此日后把仓库移回 `read-only` 绝不会悄悄重新打开召回。当 `~/.gstack` 也把该远端设为只读时（见[状态根目录](https://github.com/garrytan/gstack/blob/main/docs/state-root.md)），那个存储也得另行开启。损坏、为空或不可读的策略存储（或其位置上悬空的符号链接）会让所有仓库跳过召回，直到你修复；hook 绝不会把它重置为"无策略"，也绝不改写它。查询检查的是每个已配置的 `remote.origin.url`，不是经 `url.*.insteadOf` 改写后的 URL，任何被拒或未开启的只读远端都跳过召回。`gstack-gbrain-repo-policy list` 用 `memorable=allow` 列显示已开启的远端。gbrain 摄取方面没有任何变化：对 `/sync-gbrain` 和其他所有 gbrain 写入方来说，该仓库仍是 `read-only`。

## 若你在运行 gbrain

Memorable 可以把它的工作流做法存进你自己的 gbrain 数据库，而非它的本地存储（`memorable init gbrain`，见其文档）。这改变的是厂商存储的位置；对这座桥没有任何改变——它只把提示交给本地的 `memorable` 二进制。gstack 的 `/setup-gbrain` 与 `/sync-gbrain` 与此无关。

## 故障排查

- **hook 从不触发。** `gstack-memorable status` 应显示门禁 `on` 与 "registered by gstack"。若显示一行不匹配信息，照它处理。若一切看起来正常，重启一次 Claude Code。一个已知的竞态：Claude Code 会按自己的节奏重写 `settings.json`，若一次重写恰好落在 `enable` 期间，可能在 gstack 打印 `registered` 之后把条目丢掉；hook 管理器是收敛式的而非独占式的，因此再运行一次 `enable`（它会报告 `unchanged` 或 `registered`）并检查 `status`。
- **从来召回不出东西。** 若 `gstack-egress list --sink memorable-recall` 显示 outcome 为 `output-written` 或 `injected=no` 的回执，说明交接在发生。`injected=no` 表示厂商什么都没返回：用 `memorable status` 和 `memorable doctor` 检查登录、同意与已存储的做法。
- **outcome 显示 `timeout`。** 厂商耗时超出了预算允许（扣除 gstack 自身工作后约 4 秒）。通常是网络问题。
- **`hook-errors.log` 点名了一次拒绝。** `refused:redaction-high` 表示提示里有凭据形状；`trust policy ... deny or read-only` 表示仓库受保护（见上文逐远端开启）；`receipt-unwritable` 表示 `~/.gstack/security` 不可写。
- **`enable` 说稳定安装早于这座桥。** 运行 `./setup`（或 `/gstack-upgrade`），让注册在 `~/.claude/skills/gstack` 的 hook 就是将要运行的代码。

## 内部机制，如实说明

`bin/gstack-memorable` 是正门。它按 `GSTACK_MEMORABLE_BIN`、然后 `MEMORABLE_BIN`、然后 `~/.memorable/bin/memorable`、然后 `PATH` 的顺序解析厂商 CLI，一个都找不到时给出点名这些位置的报错并拒绝。它从不执行该二进制。`enable` 与 `disable` 期间它会持锁，先捕获先前状态，失败时恢复的是那个真实状态，而不是假想状态。

`hosts/claude/hooks/memorable-user-prompt-hook` 是注册的命令：一层跑在 `memorable-user-prompt-hook.ts` 之上的失败即放行（fail-open）bash 垫片，后者执行上述流水线且总是以 0 退出。

注册经由 `gstack-settings-hook ensure-event` 完成（5 秒超时），该 hook 在那个文件的 `KNOWN_HOOKS` 表中有一行，因此它按命令识别，从不按标签识别。由此带来的结果：

- `gstack-settings-hook list-items --event UserPromptSubmit --owned-by gstack-memorable` 无论标签是否幸存都能显示它；`list-sources` 只显示带标签的条目，因此可能显示不出来。
- `prune-stale --repoint`（每次 `./setup` 都会运行）会治愈陈旧路径。
- `./setup --no-team` 把它排除在清扫之外；`gstack-uninstall` 移除它。
- `gstack-settings-hook rollback` 是对最后一次变更的整文件恢复，不是逐 hook 撤销。

Windows：暂不支持。那里没有进程组可以容纳厂商，因此 `enable` 拒绝、hook 以 0 退出。已在 TODOS.md 中跟踪。

## 致谢

这项集成及其 hook 契约出自 Memorable 的 [Advaiyt Sane](https://github.com/AdvaiytSane)（@AdvaiytSane）与 [Nikhil Krishnaswamy](https://github.com/NIkhil-cmd-cmd)（@NIkhil-cmd-cmd）（#2831）。同意、回执、信封与围堵（containment）层是评审中加上的。
