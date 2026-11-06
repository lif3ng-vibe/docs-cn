---
title: "发布与更新渠道"
---


gstack 过去在每次合并进 main 时都打一个版本号。在 `merge: direct` 之下，PR 落地时不打标，各自带一个 `changelog.d` 片段，只有当 Captain 落地一份发布 PR（`gstack-release-stamp open`，见 [ship-policy.md](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-stamp)）时版本号才前进。自 2026 年 10 月末起又有了打标发布（tagged release），每周切两次，团队模式安装跟随它而不是跟随每次合并。

每次切版之前先落地一份发布 PR。切版给它找到的 VERSION 打标，而一个版本只打一次标：若自上次切版以来没有发布 PR 落地，下一次切版会在更早的提交上找到该版本的标签并拒绝执行。发布 PR 只会在它打标时的那个 main 上落地，所以 main 移动了就要重新开。切版给最新的绿色提交打标，因此落在发布 PR 与切版之间的 PR 会随该标签一同发布，其 CHANGELOG 条目则出现在下一次发布里。

## 一次发布是什么

每周一和周四 14:00 UTC（太平洋时间 07:00，冬季 06:00），**Stable release** 工作流（`.github/workflows/weekly-release.yml`，它运行 `scripts/release-cut.ts`；文件保留了旧名字，这样它的运行历史和下文的 `gh workflow run` 命令仍然有效）取 main 上最新的绿色提交，然后：

1. 给它打 `v<VERSION>` 标签（即该提交 VERSION 文件里的版本；附注标签（annotated tag））；
2. 发布一个 GitHub Release，说明为自上一个发布以来的每个 CHANGELOG 版本一行，附比较链接和指向该标签处完整 CHANGELOG 的链接；
3. 把 `stable` 分支快进到它。

标签和它的 release 永不改变。`stable` 是一个移动指针：始终是 main 第一父历史（first-parent history）上的提交，只由这个工作流移动、只向前移动，且除安全或回归修复（见下文）外至多每 72 小时移动一次。

**绿色**（green）指，恰在该提交上：`free-tests` 检查运行成功（main 要求的状态）、该提交已被门禁覆盖（见下文）、其上每个检查运行都已结束且无一失败，且 `refs/notes/gstack-trains` 中没有生效中的冻结。被取消的检查运行按红灯计。仍有检查运行在跑的提交会被跳过，转而考虑下一个更早的提交，最多回溯 7 天或 200 个第一父提交。该工作流自己不跑任何测试、不做任何付费评测；它只读取列车、后盾（backstop）与发布门禁已经记录下的东西。窗口内没有任何绿色提交时它会失败，并列出每个提交被跳过的原因。

**被门禁覆盖**（gated）指三样证据之一成立。第一样是 `main-backstop` 检查运行：Main 后盾门禁工作流在每次推送到 main 时从自己的一个作业发布它——当一条绿色列车记录覆盖该树、或后盾把它判为绿色时为成功；当 main 在它被门禁判定之前已经越过该推送（被取代）或某次冻结自己的后盾运行接管了它（被推迟）时为中性；当它冻结了队列或没能完成时为失败。第二样是 `refs/notes/gstack-trains` 里的一条列车记录（kind 为 `train`，state 为 `green`、`merging` 或 `merged`），其 `merged[]` 列出该提交的 sha 或其树：这些条目正是 `gstack-ship-queue verify --train` 确认过的 main 提交，所以被绿色列车合并的提交即便在列车合并得比后盾尘埃落定更快、它自己的后盾运行以中性收场或从未运行的情况下，也算被门禁覆盖。`CANDIDATE` 行会写明是哪种：`gated by main-backstop` 或 `gated by train <nonce>`。第三样是该提交上的一条 GREEN 发布记录（kind 为 `release`），由发布门禁（[docs/ship-policy.md#release-gate](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-gate)）在策略声明了 `release_gate` 时写入；此时该行写作 `gated by release gate run <id>`。一条 RED 发布记录，如果其后没有包含它的更晚提交上的 GREEN 记录，就会像冻结一样拒绝切版。列车证据不放宽任何其他条件：红色的后盾运行、失败或缺失的 `free-tests` 运行、任何其他红色检查运行或仍在进行的运行都会把提交挡在外面，处于其他任何状态（`red`、`superseded`、`free-green`、……）的记录不算证据。三样证据一样都没有的提交（没有成功的后盾运行、列车记录或 GREEN 发布记录）不会发布：比如一次 dependabot 推送、一份没有 train 块的策略，或一棵从未被门禁覆盖的树。

其他仓库可以用自己的名字运行同一脚本：`--required-check <name>`（默认 `free-tests`）、`--backstop-check <name>`（默认 `main-backstop`）和 `--notes-ref <ref>`（默认 `refs/notes/gstack-trains`）。`weekly-release.yml` 一个都不传。

中途停下的切版（标签和 `stable` 已推送、release 未创建）由下一次运行收尾，无论定时还是手动：`stable` 自己保持候选身份直到它的 release 存在，其说明与它前一个发布标签做比较。

## 72 小时下限

`stable` 至多每 72 小时移动一次（Garry，2026-10-27）。每次切版，无论定时还是手动、无论带不带 `ref`，都会检查 `stable` 上次移动的时间：指向 `stable` 的附注标签 `v<VERSION>`（取 `stable` 处的 VERSION）的创建时间；若该标签的 GitHub Release 发布时间更晚，则以后者为准（一次切版在标签推送后重试了 `stable` 推送，就按它的 release 计时）。该提交上的任何其他标签都会被忽略，所以手工多打的标签既不能为移动计时，也拖不住之后的切版。
落在下限之内的切版什么都不改，并以前两行打印：

```
REFUSED_FLOOR: stable moved to v1.91.300.0 at 2026-11-02T14:04:51Z, 47.2 h ago; a hand-run cut needs 72 h; a security fix passes with --security "<GHSA-…|CVE-…|#n>: why" --ref <fix sha>, a regression fix with --regression "#n: worked in v<X>: why" --ref <fix sha>
NEXT_ALLOWED: 2026-11-05T14:04:51Z for a hand-run cut; 2026-11-05T11:04:51Z for a scheduled run
```

随后是它本会执行的计划。周一到周四恰好 72 小时，所以定时运行——也只有定时运行（`GITHUB_EVENT_NAME=schedule`，任何 dispatch 输入都设置不了它）——为 GitHub 的 cron 迟启动获得 3 小时宽限：周一迟切之后 69 小时的周四运行照样切。因此两次常规移动的间隔不会小于 69 小时，而手动切版始终需要完整的 72 小时。周四到周一是 96 小时。

被拒绝的手动切版以退出码 1 结束并带错误注解。被拒绝的定时运行以退出码 0 结束，带提示注解，并在 step summary 里写同样的行：这是策略在正常工作（周三的安全或回归切版会重置下限并按住周四，周一的切版把一切带上），不是故障。演练（dry run）打印计划和下限判定（`FLOOR:` 行）并以退出码 0 结束。

有两种情况不受下限约束。第一次切版发生在 `stable` 存在之前，无从计时。收尾一次未完成的切版（`stable` 已在候选上、release 缺失）不算一次新移动，不带 `ref` 的运行会先收完那次切版，再去考虑更新的东西。

下限在无法为移动计时时失败即关闭。三种情况为 `FLOOR_UNKNOWN`，任何触发方式下都是红灯，只有验证通过的安全切版能越过它们（回归切版只能通过可计时的下限）。这三种情况是：没有任何附注标签 `v<VERSION>` 可以为 `stable` 计时（只有这个工具会移动 `stable` 且它先打标签，所以那种状态意味着有人手工移动了它）；一个读不出来的 release（GitHub API 错误不等于"没有 release"）；以及 `stable` 自己的 release 尚未发布时的 `ref` 切版（它的标签可能比推送早好几天）。时间戳落在未来的标签从现在起按住下限，而不是从那个未来日期起。下限约束的是发布工具，约束不了直接推 `stable` 的人；那需要一条把 `stable` 限定给 Actions 机器人的分支 ruleset。

不属于更早 stable 版本回归的破损（比如说一个表现失常的新功能）就等下限过去；受影响的安装可以先跟随 main（`gstack-config set update_channel main`），下一次定时切版会把它带回来。

## 安全发布

安全修复是下限的两个例外之一（另一个是下文的回归修复）；一次切版只携带一个例外，绝不两个都带。手动运行工作流，`ref` 设为 main 上的修复提交，`security` 设为一条点名修复内容的理由：

```bash
gh workflow run weekly-release.yml -f ref=<full sha of the fix> -f security="GHSA-xxxx-xxxx-xxxx: tar path traversal" -f dry_run=false
```

理由必须点名一个 `GHSA-…`、一个 `CVE-…` 或一个 issue/pull request `#<n>`，工具还会检查它与被发布的提交范围（`stable`..`ref`）相互关联。以下至少一条必须成立：

1. 该范围内某条提交消息点名了同一个 GHSA 或 CVE；
2. issue 或 pull request `#<n>` 带有 `security` 标签，且范围内某条提交引用了 `#<n>`（squash 标题 `(#<n>)` 即可）；
3. 该 GHSA 或 CVE 在 GitHub Advisory Database（OSV 导入的数据源）里的条目列出了某个 npm 包，而该包自己的条目在范围的 `package.json` 或 `bun.lock` 中发生了变化（依赖行或 lockfile 包键，绝不算列在另一个包条目里的名字）：即一次修复已知通报的依赖升级。升级方向和已修复版本范围不在检查之列。

**已验证**：标识符存在于理由中、标签存在于 issue 上、标识符与被发布提交或被升级包之间的关联。**有人背书但未验证**：改动是否真的修复了漏洞、严重程度如何、是否确实等不及——`security` 标签本身是由拥有 triage 权限的人打上的。工具无法与范围关联起来的理由会得到 `REFUSED_SECURITY` 并附上它检查过的内容，任何触发方式下都是红灯；`security` 不带 `ref` 同样如此：安全切版发布到修复为止，绝不顺手发布碰巧最新的东西。`stable` 与修复之间的每个版本仍随之一同发布（没有 cherry-pick）；计划的 `RIDING_ALONG:` 行会数出它们。

理由是公开的。它会以一行至多 300 字符（控制字符变空格、反引号变撇号）进入标签消息和发布说明：``**Security release:** `<reason>` (verified: <evidence>)``。若修复处于禁运期，走第 2 条路径，用中性的提交标题和一个标题不比修复内容多说什么的已打标 issue，披露之前不要把通报细节写进理由。移动了 `stable` 之后中途停下的安全切版，由下一次运行按其标签记录的理由与证据收尾，不再重新检查。记录了安全切版却从未移动 `stable` 的标签没有这种优待：切版被拒绝（`REFUSED_SECURITY`），直到带着 `security`、`ref` 和其标签记录的理由重新运行并通过验证。此后下限从安全发布起算，下一次常规切版的说明只列出其后的版本。

## 回归发布

回归修复是另一个例外（Garry，2026-10-28："Regression"）。回归指对这样一种行为的修复：它在更早的 stable 版本里正常、在当前版本里坏了。维护者通过给 issue 或 pull request 打 `regression` 标签来宣布它（打标签需要 triage 权限；仓库若没有该标签就先建一次），运行切版的人在 `regression` 输入里点名它，`ref` 设为 main 上的修复提交：

```bash
gh workflow run weekly-release.yml -f ref=<full sha of the fix> -f regression="#3601: worked in v1.91.300.0: the update check stopped running" -f dry_run=false
```

理由必须恰好点名一个版本 `v<X>` 和至少一个 `#<n>`。以下条件必须全部成立，否则切版得到 `REFUSED_REGRESSION` 并附上它检查过的内容：

1. `v<X>` 是一个严格落后于当前 `stable` 的附注发布标签，且其 GitHub Release 已发布（不是草稿）：即团队安装确实运行过的更早 stable 版本——半途切版留下的标签不算。当前 stable 本身不算，因为修复它仍然做对的事情不需要例外。
2. `#<n>` 带有 `regression` 标签（`security` 标签不算，反过来也一样），且 `stable`..`ref` 中某条提交引用了它（squash 标题 `(#<n>)` 即可）。

**已验证**：发布标签、它在 `stable` 身后的位置及其已发布的 release、标签，以及被打标的 issue 或 PR 落在被发布范围内。**有人背书但未验证**：该行为在 `v<X>` 里是否真的正常、这次改动是否恢复了它——标签和公开的理由承载这一主张。

其余一切与安全切版相同。`ref` 必填，`regression` 与 `security` 同时出现会被拒绝，`stable` 与修复之间的每个版本随行发布（`RIDING_ALONG:`），净化后的理由与证据进入标签消息（`Regression:` / `Verified:`）和发布说明（``**Regression release:** `<reason>` (verified: <evidence>)``）。半途停下的回归切版按其标签记录收尾；从未移动 `stable` 的回归标签会被拒绝，直到带着 `regression` 和其标签记录的理由重新运行并通过验证。与安全切版不同，回归切版过不了 `FLOOR_UNKNOWN`。下限从回归发布起算，所以下一次定时切版可能被按住。

## 更新渠道

| 渠道 | 跟随什么 | 适合谁 |
|---|---|---|
| `stable` | `refs/heads/stable`：每周两次的发布（至多每 72 小时一次），外加任何周期外的安全或回归切版 | 团队模式（`./setup --team`）默认 |
| `main` | 每一次合并进 main | 普通 `./setup`、贡献者、Capy 编队机器 |

配置键为 `update_channel`（`bin/gstack-config`）：

```bash
gstack-config get update_channel          # auto（默认）| stable | main
gstack-config set update_channel main     # 想要每次合并的团队安装
gstack-config set update_channel stable   # 想要 stable 发布的个人安装
gstack-config unset update_channel        # 回到 auto
```

`auto` 在 `team_mode` 为真时解析为 `stable`，否则解析为 `main`，于是既有团队安装无需任何迁移就切到了 stable 版本发布，贡献者安装则完全没动。`GSTACK_UPDATE_CHANNEL=stable|main` 可为单条命令覆盖该键。解析逻辑集中在一个辅助脚本 `bin/gstack-update-channel.sh`，使用它的有：

- `bin/gstack-session-update`，团队模式的会话启动钩子：拉取渠道 ref 并快进到它。跟随发布时其日志（`<state root>/analytics/session-update.log`）会带上 `CHANNEL stable target=<sha>`。
- `bin/gstack-update-check`，每个技能前导里那行"有更新可用"：它读 `<channel>/VERSION` 并与 `refs/heads/<channel>` 比较，所以 stable 安装不会被每小时告知一次 main 动了。
- `bin/gstack-upgrade` 与 `/gstack-upgrade`：快进到渠道 ref（技能输出里的 `UPSTREAM_REF=origin/stable`），并说明跟随的是哪个渠道。
- `capy/skill/gstack/scripts/install.sh`，Capy 技能的安装器（wrapper revision 4）：全新克隆或越过支持底线（support floor）的升级，在渠道解析为 `stable` 且 `stable` 达到支持底线时跟随 `stable`，否则跟随 main。`--revision` 仍可钉住一个精确提交。

两个边界情况是刻意处理的：

- **第一个发布尚不存在时**，origin 上没有 `stable`。所有调用方此时跟随 main 并如实说明（钩子日志里的 `CHANNEL_FALLBACK stable->main`、`gstack-upgrade` 的 `channel stable has no release on origin yet`）。
- **已经越过该发布的安装**（此前一直跟随 main，或有热修复切在它下面）原地不动，直到 stable 越过它。更新器绝不把检出向后移。depth-1 克隆看不出更早的发布是它的祖先，于是由 VERSION 说话：main 在每次合并时打更高的版本（`merge: direct` 之下则是每次发布 PR），而 stable 永远是一个 main 提交。

无论哪种情况，本地分支都保持 `main`。stable 安装就是一个停在最后发布提交上的 `main` 检出，所以仅快进（fast-forward-only）依然成立，版本打标的一切都没变。

## 手动切一次发布（热修复）

热修复就是一份普通 PR：它经一列车合并进 main，像任何其他改动一样拿到版本（`merge: direct` 之下，从下一份[发布 PR](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-stamp) 拿，该 PR 必须在切版前落地）。要赶在下一次定时切版之前把它送上 stable，在 72 小时下限允许之后，带着合并提交的 SHA 手动运行工作流（安全或回归修复改用各自的输入）：

```bash
gh workflow run weekly-release.yml -f ref=<full sha on main> -f dry_run=false
```

或者打开 Actions，选 **Stable release**，在 main 上按 Run workflow（切版作业只从 `refs/heads/main` 运行，用的是 main 的工具；`ref` 必须是完整的 40 位十六进制 SHA）。同样的绿色检查照常适用。该提交按它的 VERSION 打标，发布说明写着"hotfix release"，列出上一个发布以来的每个版本（其间合并的一切随它一同发布），stable 快进。团队安装在下一个整点检查时拿到它。

没有发布分支，也没有 cherry-pick：stable 只会指向 main 提交。如果 main 上带着一个还不能发布的改动，先在 main 上回滚它，再晋级。

## 演练

以 `dry_run=true` 运行工作流（手动运行的默认值），可在不改动任何东西的前提下看到计划：候选提交、它的 VERSION 与标签、stable 的移动、说明会带多少个版本行、每个被跳过的提交及其原因、下限判定，以及真实切版会执行的确切命令。定时运行永远不会是演练。

```bash
gh workflow run weekly-release.yml -f dry_run=true
gh run watch
```

step summary 带同样的计划，外加完整的发布说明。

触及 `.github/workflows/weekly-release.yml` 或 `scripts/release-cut.ts` 的 pull request，会以自己的作业（`Dry run against main`，只读令牌）对 main 跑同一个演练，让发布工具链的改动在合并前先对着真实的检查运行演练一遍。

## 结果一览

| 行 | 含义 |
|---|---|
| `CANDIDATE: <sha> (<date>) gated by main-backstop|train <nonce>|release gate run <id>` | 即将被（或已经被）发布的提交，以及是哪样证据为它做了门禁（`--ref` 切版时 `gated by` 前带 `[hotfix: --ref]`） |
| `NOTHING_NEW: origin/main <sha> is already released as v<X>` | 上次发布以来没有任何合并；退出码 0 |
| `NO_GREEN_COMMIT: ...`（含 `SKIPPED:` 行） | 窗口内没有任何提交通过门禁；退出码 1（演练退出码 0：跳过清单就是它的答案） |
| `REFUSED: non-fast-forward: ...` | 候选落后于 stable；stable 只向前移动 |
| `REFUSED: queue frozen since train ...` | main 后盾冻结了队列；先解除它（docs/ship-policy.md） |
| `REFUSED: release gate red on <sha> (<cases>) and no gate on a later commit is green; ...` | 发布门禁的扣留：落地回滚或前向修复，然后 `gstack-release-gate run --ignore-cadence`（[docs/ship-policy.md#release-gate](https://github.com/garrytan/gstack/blob/main/docs/ship-policy.md#release-gate)） |
| `REFUSED: tag v<X> already names <other sha>` | 一个版本被打标两次；切任何东西之前需要先查一查 |
| `REFUSED_FLOOR: stable moved to v<X> at <time>, <h> h ago; ...` | 处于 72 小时下限之内；什么都没改。手动退出码 1，定时或演练退出码 0 |
| `NEXT_ALLOWED: <time> for a hand-run cut; <time> for a scheduled run` | 跟在每条 `REFUSED_FLOOR` 之后（`FLOOR_UNKNOWN` 之后也有，此时它解释为什么给不出时间） |
| `FLOOR_UNKNOWN: ...` | stable 的上次移动无法计时（没有附注标签 `v<VERSION>`、release 读不出来，或 `ref` 切版下 release 尚未发布）；任何触发方式下都退出码 1 |
| `REFUSED_SECURITY: ...` | `security` 不带 `ref`、工具无法与被发布提交关联的理由、记录了安全切版却从未移动 stable 的标签在不带 `security` 的情况下运行，或重跑的理由与其未移动标签所记录的不同；任何触发方式下都退出码 1（工作流会在脚本运行前拦下不带 `ref` 的 `security`） |
| `REFUSED_REGRESSION: ...` | `regression` 不带 `ref` 或与 `security` 并存、理由里没有一个更早的 stable `v<X>` 加上范围内带 `regression` 标签的 `#<n>`、记录了回归切版却从未移动 stable 的标签在不带 `regression` 的情况下运行，或重跑的理由与其未移动标签所记录的不同；任何触发方式下都退出码 1（工作流会在脚本运行前拦下不带 `ref` 的 `regression`） |
| `FLOOR: clear|refused|unknown|none|not applied|bypassed by the security|regression exception (...)` | 下限判定，出现在每份计划里 |
| ``SECURITY: `<reason>` (verified: <evidence>)`` 或 ``REGRESSION: `<reason>` (verified: <evidence>)``、`RIDING_ALONG: <n> other versions ship with the fix` | 例外切版的计划 |
| `TAG:`、`STABLE:`、`RELEASE:` | 切版做了什么；重跑会把每个步骤报告为已完成，并补完早前运行没走到的步骤 |
