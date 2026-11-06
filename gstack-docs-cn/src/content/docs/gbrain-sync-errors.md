---
title: "gbrain-sync 错误速查"
---


`gstack-brain-*` 可能打印的每一条错误消息，附带问题、原因与修法。

按 `BRAIN_SYNC:` 之后的前缀，或按命令输出中的二进制名，在本文件中检索。

---

## `BRAIN_SYNC: brain repo detected: <url>`

**问题**：这台机器上存在 `~/.gstack-artifacts-remote.txt`（或旧版的 `~/.gstack-brain-remote.txt`，从另一台机器复制而来），但 `~/.gstack/.git` 处没有本地 git 仓库。

**原因**：你在别处设置过 GBrain 同步，而你的 gstack 尚未在这台机器上恢复。

**修法**：
```bash
gstack-brain-restore
```
该命令会把仓库拉取到 `~/.gstack/` 并重新注册合并驱动（merge driver）。

如果不想在此恢复，可用以下命令关闭提示：
```bash
gstack-config set artifacts_sync_mode_prompted true
```

---

## `ARTIFACTS_SYNC: attention: ...`（技能启动时）

**问题**：产物同步卡住或部分卡住。技能启动时每个问题打印一行固定内容；`ok` 与 `idle` 不打印任何内容。每一行都会给出 `gstack-brain-sync` 的绝对路径；带 `--status` 运行它即可查看原因、被扣留的文件与修法。

| 状态 | 触发条件 | 提示行（`ARTIFACTS_SYNC: attention: ` 之后的内容） | 修法 |
|---|---|---|---|
| `held` | 密钥扫描或 JSON 检查扣留了被标记的文件，其余文件照常同步 | `status=held held=<N>. Sync is holding back <N> file(s) that the secret scan flagged or that are not valid JSON; everything else still syncs. See which files and how to fix them: <bin> --status` | 编辑文件使其不再命中扫描规则，或执行 `<bin> --skip-file <path>`（永久生效；用 `--unskip-file <path>` 撤销），或修复不是合法 JSON 的文件 |
| `blocked` | 扣留后重扫仍被标记，或在一个未完成的 git merge 中文件会被扣留，因此什么都没提交 | `status=blocked. Sync committed nothing: a flagged file could not be held back on its own, or held files are part of an unfinished git merge. See the fix: <bin> --status` | 编辑或跳过 `--status` 点名的文件，或用 `<bin> --drop-queue --yes` 清空本批。若是未完成的 merge，则修复被扣留的文件或完成合并；跳过文件或清空队列都不能消除此状态 |
| `push_failed` | 提交已保存在本地，但推送失败 | `status=push_failed. Synced files are committed locally but the push failed; it retries at skill start. See the cause: <bin> --status` | 执行 `--status` 给出的修法（通常是 `gh auth status`） |
| `error` | 排空（drain）在提交前中止，队列被保留 | `status=error. The last sync stopped before committing; the queue is kept and retried. See the cause: <bin> --status` | 处理 `--status` 点名的原因：git 索引锁、提交钩子或 `git add` 失败 |
| `unknown` | 状态文件里存有本表之外的状态码 | `status=unknown. The sync status file is unreadable. See it: <bin> --status` | 运行 `<bin> --once` 重写它 |
| stale-push | 排空的 `drainable` 计数大于零，却已超过 24 小时没有推送 | `stale-push. Files are ready to sync but nothing has been pushed for over 24 hours. See why: <bin> --status` | 处理 `--status` 点名的等待原因（一组耦合文件在等待一致的生成版本，或 `git add` 失败） |
| case-collision | 设置了 `case_names`：产物路径仅大小写不同，排空因此扣留其下排队中的文件 | `case-collision held=<N> names=<names>. Artifact paths differ only by letter case, which a Mac or Windows disk stores as one file; sync holds <N> queued file(s) under them and syncs everything else. Repair: https://github.com/garrytan/gstack/blob/main/docs/troubleshooting.md#artifact-case-collision. See the paths: <bin> --status` | 保留一种拼写：按[故障排查](/troubleshooting/#artifact-case-collision)中的手动修复操作 |
| stale-drain | `last_drain_at` 距今超过 24 小时，而队列中仍有记录 | `stale-drain. The sync has not run for over 24 hours while files wait in the queue. See why: <bin> --status` | 若没有 gstack 进程在运行，删除 `~/.gstack/.brain-sync.lock.d`，然后运行 `<bin> --once` |

`<bin>` 是绝对路径，例如
`~/.claude/skills/gstack/bin/gstack-brain-sync`。权威出处是 `bin/gstack-brain-sync` 的 usage 头；技能启动时的各项检查即由它生成。

**被扣留的文件**。密钥扫描标记某个文件时，只有该文件（连同与其耦合的文件，例如一条决策日志及其当前快照）被扣留；其余一切照常同步。被扣留的文件留在队列中，每次同步都会重新扫描，因此编辑它即可自动解除扣留。`--status` 会在 `held` 下列出每个被扣留的文件，附命中的扫描规则（绝不会给出命中的文本本身）、与其一同被扣留的文件（`dependents`）以及两条修法：

1. **若是真实密钥**：编辑文件将其移除。下一次技能运行会重新扫描并同步它。
2. **若命中的是误报**，且你永远不想让它同步：
   ```bash
   ~/.claude/skills/gstack/bin/gstack-brain-sync --skip-file <path>
   ```
   这会把这个路径永久排除在今后的同步之外（对耦合文件，与它耦合的文件也会一并停止）。要撤销并让该路径重新排队：
   ```bash
   ~/.claude/skills/gstack/bin/gstack-brain-sync --unskip-file <path>
   ```
3. **要放弃整批**（重新开始）：
   ```bash
   ~/.claude/skills/gstack/bin/gstack-brain-sync --drop-queue --yes
   ```

一个无法解析的已同步 `.json` 文件（常见于 merge 留下的 git 冲突标记）会以同样的方式按规则 `invalid-json` 被扣留。唯一的修法是修复文件；不提供 `--skip-file`，因为那会永久停止该文件的同步。下一次同步会重新检查它。

**Git 索引锁**。一个在写入中途被杀掉的 git 进程会留下 `~/.gstack/.git/index.lock`。同步会在它超过 10 分钟后将其删除，因为每个写入 `~/.gstack` 的 gstack 写入方都会先获取同一把同步锁。锁龄不足 10 分钟则说明有 git 进程正在那里运行；此时同步报告 `error`，并在下一次技能启动时重试。

---

## `BRAIN_SYNC: push failed: auth.`

**问题**：git push 被拒绝，因为你与远端的认证已过期或缺失。

**原因**：以当前凭据无法访问远端。

**修法**：按你的远端刷新认证：

- **GitHub**：`gh auth status`（需要时再执行 `gh auth refresh`）
- **GitLab**：`glab auth status`
- **其他**：`git remote -v` + 检查 SSH 密钥或凭据助手

认证修复后，运行任意技能即可自动重试同步。

---

## `BRAIN_SYNC: push failed: <first-line-of-error>`

**问题**：推送因认证之外的原因失败。git 错误的第一行显示在冒号之后。

**原因**：可能是网络问题、推送被拒（远端领先）、服务器 500，或仓库访问权被收回。这一行是 git 自身的错误，不是它的 `To <remote>` 横幅或 `hint:` 行。推送被拒后，brain-sync 会拉取并合并另一台机器的提交；该合并失败时，状态会追加 `; merging origin failed: <reason>`（例如 `CONFLICT (content): Merge conflict in developer-profile.json`）。

**修法**：查看 `~/.gstack/.brain-sync-status.json` 了解详情，或运行：
```bash
cd ~/.gstack && git status && git push origin HEAD
```
以查看 git 的完整错误。任何推送尝试之后队列都会被清空，但你的本地提交仍然存在——下一次技能运行会重试推送。

---

## `gstack: brain-sync push NOT sent — the egress receipt could not be written`

**问题**：推送在任何数据离开你的机器之前即被拒绝。每次 brain-sync 推送在发送前都会先向出站台账（egress ledger，`~/.gstack/security/egress.jsonl`）写入一条防篡改回执，失败即关闭（fail-closed）。回执写不进去，因此什么都没发送、没有产生本地提交，队列也原样保留——下一次运行会重试整个排空过程。`gstack-brain-sync --status` 会将 `EGRESS_RECEIPT_FAILED` 显示为失败详情。

**原因**：`~/.gstack/security/` 不可写（回执写入器会在其缺失时创建它，因此仅缺失不是原因）、磁盘已满，或 `GSTACK_HOME` 指向只读位置。

**修法**：
```bash
mkdir -p ~/.gstack/security && chmod -R u+w ~/.gstack/security
```
然后运行任意技能（或 `gstack-brain-sync --once`）重试。用 `gstack-egress list` 查看台账；用 `gstack-egress verify` 校验其哈希链。

---

## `gstack-artifacts-init: ~/.gstack/ is already a git repo pointing at: <url>`

**问题**：你试图用一个与现有远端不匹配的 URL 初始化。命令拒绝覆盖。

**原因**：你此前用另一个远端运行过 `gstack-artifacts-init`。

**修法**：二选一：

- 沿用现有远端：运行 `gstack-artifacts-init` 时不带 `--remote`，或传入匹配的 URL。
- 更换远端：`git -C ~/.gstack remote set-url origin <url>`（命令自己给出的建议），或先 `gstack-brain-uninstall`，再用新 URL 重新初始化。两者都不会删除你的数据。

---

## `Remote not reachable via SSH: <url>`

**问题**：初始化时无法连通 git 远端以验证连接。

**原因**：URL 有误、缺少认证或网络问题。

**修法**：手动测试：
```bash
git ls-remote <url>
```
若失败，检查：
- URL 拼写
- GitHub：`gh auth status`
- GitLab：`glab auth status`
- 专用网络 / VPN / DNS

---

## `Failed to create or find '<name>'. Try --remote <url>.`

**问题**：通过 `gh repo create` 自动建仓失败，`gh repo view` 也找不到该仓库。

**原因**：`gh` 未认证、同名仓库已存在且属于他人，或你的 GitHub 账户触发了配额。

**修法**：
```bash
gh auth status
```
若未认证，运行 `gh auth login`。若仓库名冲突，换一个名字：
```bash
gstack-artifacts-init --remote git@github.com:YOURUSER/custom-name.git
```

---

## `gstack-brain-restore: ~/.gstack/.git already points at <url>`

**问题**：你试图从一个与现有 git 配置不匹配的 URL 恢复。

**原因**：此前用另一个远端初始化留下的陈旧 `.git`。

**修法**：先 `gstack-brain-uninstall`，再重新运行 `gstack-brain-restore <url>`。

---

## `gstack-brain-restore: ~/.gstack/ has existing allowlisted files that would be clobbered`

**问题**：你试图恢复，但 `~/.gstack/` 里已有会被覆盖的学习记录（learnings）或计划。

**原因**：要么 (a) 这台机器在开启同步之前的 gstack 会话中积累了状态，要么 (b) 上一次失败的恢复留下了部分状态。

**修法**（三个选项）。

1. **若这台机器的状态应成为新的基准**：改运行 `gstack-artifacts-init` 而不是恢复——它会用这台机器的状态创建一个全新的 brain 仓库。

2. **若想采纳远端、丢弃这台机器的状态**：先备份 `~/.gstack/projects/`，再移除引发冲突的文件并重新运行恢复。

3. **若想合并**：没有自动合并的办法。在已开启同步的机器上，把 `~/.gstack/` 中的学习记录手动复制进你正在运行的 gstack，然后在此恢复。

---

## `gstack-brain-restore: <url> does not look like a gstack-brain repo`

**问题**：克隆成功，但仓库缺少 `.brain-allowlist` 和 `.gitattributes`。

**原因**：你把恢复指向了一个无关的 git 仓库，或有人从 brain 仓库中删掉了规范配置文件。

**修法**：核对 URL。若 URL 正确，运行 `gstack-artifacts-init --remote <url>` 重新播种规范配置。

---

## `database host unreachable (<code> <host>); your gbrain config is unchanged. Fix: check network or VPN, then re-run /sync-gbrain.`

**问题**：`/sync-gbrain` 跳过了代码、记忆与 dream 阶段，或 `/setup-gbrain` 报告了 `gbrain_local_status: db-unreachable`。

**原因**：因网络错误（离线沙箱中的 `ENOTFOUND` / `EAI_AGAIN`、VPN 掉线、连接被拒或超时），gbrain 无法访问 `~/.gbrain/config.json` 中指定的数据库。配置本身没有任何已知问题，因此 gstack 不去动它，并继续渲染记忆感知的技能区块——与对待缓慢的 `timeout` 的方式相同。

**修法**：恢复网络访问（或 VPN），然后：
```bash
/sync-gbrain
```
不要把 `~/.gbrain/config.json` 移开；那套处置只适用于 `broken-db` / `broken-config`。

---

## `[memory-ingest] ERR: gbrain import accounted for N-1 of N staged page(s) ... Refusing to advance state`（`.claude` 式项目，每次运行都出现）

**问题**：本版本之前，只要批次里含有 slug 以点开头（例如 `.claude`）的项目的页面，摄取在每次运行时都会拒绝整个批次。

**原因**：gbrain 的导入遍历器会跳过每个以点开头的路径段，因此已暂存的页面从未被收集。

**修法**：升级后无需任何操作：这类 slug 现在会以 `dot-claude` 形式暂存，旧名下记录的状态会映射到新名。运行一次 `/sync-gbrain` 即可导入此前卡住的页面。

---

## `[memory-ingest] FAILED <path>: <error> (left un-stamped; retried next run)`

**问题**：在 `/sync-gbrain` 的记忆阶段，gbrain 拒绝了一个已暂存的页面（例如 frontmatter 无效或页面超长）。

**原因**：`gbrain import` 把该页面列为逐文件失败（记在其 `--json` 的 `failures` 列表或 `Skipped <path>:` 行中）。本版本之前，这类页面会被标记为已摄取且不再重试。

**修法**：没有任何损失：页面不会被标记为已摄取，且每次运行都会重试。若同一页面持续失败，阅读错误信息、修复其来源文件，然后运行 `/sync-gbrain`。

---

## `[memory-ingest] re-queued <slug>: not found in gbrain source <id> after import (retried next run)`

**问题**：gbrain 称某个页面已导入（或无变化），但落地检查在它被导入的源中找不到它，或发现内容不同。

**原因**：通常是一个已被接受但仍在发布中的托管导入（gbrain 输出中的 `Pending:`），或一个被 gbrain 跳过却未点名的页面。

**修法**：无需处理；下一次 `/sync-gbrain` 会再次导入它。若每次运行都重复出现，升级 gbrain（`gstack-gbrain-install`）。

---

## `[memory-ingest] ERR: gbrain reported N failure(s) it did not attribute to a staged page ... Refusing to advance state.`

**问题**：记忆阶段失败，且没有标记任何页面为已摄取。

**原因**：gbrain 统计了未点名的失败（同类失败打印到五次后即停止），因此 gstack 无从判断哪些页面已落地。

**修法**：重新运行 `/sync-gbrain`。连续三次被拒后，批次会自动对半拆分以找出 gbrain 无法导入的页面；该页面被隔离（见下一节），其余页面照常导入。

---

## `[memory-ingest] quarantined <slug> (<source path>): gbrain refuses every batch that contains it (...)`

**问题**：一个页面持续导致 gbrain 拒绝整个批次。

**原因**：在三个批次被拒后，gstack 将批次对半拆分导入，直到定位出该页面。其余每个页面都已导入。

**修法**：该页面的源文件一有变动就会自动重试。想立即重试，就修复或删除消息中点名的源文件，然后运行 `/sync-gbrain`。

---

## `[memory-ingest] reconcile: checked N, present M, re-queued K, not yet checked L (run again to continue)`

**问题**：这不是错误。这是升级后的一次性补课：gstack 重新检查它标记为已摄取的会话记录（transcript），并把 brain 中缺失的那些重新排队，让被旧版本丢失的会话记录再次导入。

**原因**：旧版本可能把 gbrain 跳过的页面标记为已摄取。升级会记录一次待执行的对账（reconcile）；此后每次摄取运行检查一个有界批次（200 条），直至完成。

**修法**：无需处理；每次 `/sync-gbrain` 都会从上一次停下的地方继续。想立即运行或查看进度：
```bash
gstack-memory-ingest --reconcile --dry-run   # 仅报告
gstack-memory-ingest --reconcile             # 再检查下 200 条（--limit N）
```
"not yet checked" 统计的是查询失败的页面（gbrain 忙碌或不可达）；它们绝不会被当作缺失。"unrecoverable" 统计的是 brain 中缺失且会话记录文件已不存在的页面。每轮开始前，状态文件都会备份到 `~/.gstack/.transcript-ingest-state.json.pre-reconcile.bak`。

---

## `[memory-ingest] reconcile: not run (...)`

**问题**：请求了一轮对账，但无法运行。

**原因**：gbrain 未安装或不支持 `import`，或 brain 是远程 HTTP brain（其页面已暂存、等待 brain 管理员拉取，因此本地没有可检查的内容）。

**修法**：若缺少 gbrain，运行 `/setup-gbrain`，然后 `gstack-memory-ingest --reconcile`。若是远程 HTTP brain，无需处理。

---

## `[memory-ingest] ERR: another memory ingest (pid <N>) is writing <state file>; not run.`

**问题**：本次运行中记忆阶段什么都没做。

**原因**：另一个摄取、对账或 `--request-reconcile` 持有状态锁（`~/.gstack/.transcript-ingest-state.json.lock`）。已不存在的进程留下的锁会被自动接管。

**修法**：等另一个运行结束后，再运行一次 `/sync-gbrain`。

---

## `[memory-ingest] ERR: could not save ingest state <path>: <error>.`

**问题**：记忆阶段在导入之后失败。

**原因**：状态文件写不进去（磁盘已满、权限问题，或其位置上是个目录）。这次运行以失败告终，而不是假装记录了进度；它导入的页面会在下次运行时重新检查——代价很小，因为 gbrain 会跳过未变化的内容。

**修法**：释放磁盘空间或修复 `~/.gstack/` 的权限，然后运行 `/sync-gbrain`。

---

## `[memory-ingest] kept N unattributed transcript(s) on this machine: the brain is remote (Postgres or HTTP), ...`

**问题**：`--include-unattributed` 的会话记录（没有 git 远端的会话）未被导入。

**原因**：无法归属到某个仓库的会话记录只会进入仅本机、永不跨机共享的源 `gstack-transcripts-unattributed`。你的 brain 是远程的（Postgres 或 Supabase 的 `database_url`，或远程 HTTP MCP brain），发送它们会把它们带离这台机器。因此它们既不被标记为已摄取，也不写入可发布的 `~/.gstack/transcripts/` 暂存区。

**修法**：若这正是你想要的，无需处理。要纳入这样的会话，请在一个带 `origin` 远端的 git 仓库里运行它，使其可归属。

---

## `[memory-ingest] kept N transcript page(s) for <repo> on this machine: could not register gbrain source <id> (...)`

**问题**：来自某个仓库的会话记录未被导入。

**原因**：gstack 会把每个仓库的会话记录导入该仓库自己的 gbrain 源（`gstack-transcripts-...`，仅本机且不跨机共享），并在首次导入前注册它。已安装的 gbrain 拒绝了 `gbrain sources add`，因此这些页面留在本地、未打戳。

**修法**：
```bash
gstack-gbrain-install      # 升级 gbrain
/sync-gbrain               # 下一次运行即导入这些页面
```

---

## `curated artifacts pushed to git, but gbrain source <id> has 0 indexed pages. Fix: gbrain sync --source <id>, then re-run /sync-gbrain`

**问题**：`/sync-gbrain` 的 brain-sync 阶段为 `ERR`，尽管 git 推送已成功。

**原因**：推送只是把你的精选产物（curated artifacts）送进 git。gbrain 会单独为它们建索引，而这台机器维护的产物源报告的页面数为零，因此搜索不会从中返回任何结果。本版本之前，该阶段会显示 "curated artifacts pushed" 并通过。

**修法**：
```bash
gbrain sync --source <id>
/sync-gbrain
```
若仍为零，用 `gstack-gbrain-source-wireup` 重新注册该源。

---

## `[gbrain-sync] gbrain source <id>: path unavailable (<path>); gstack skips it.`

**问题**：某个 gbrain 代码源指向这台机器上已不存在的目录，通常是已删除的 Conductor worktree。gbrain 的 autopilot 会一直在这个源上失败。

**原因**：每个 worktree 都有自己的 `gstack-code-<repo>-<hash>` 源。删除 worktree 会把源留下来。gstack 不会自行移除它：其已索引的页面可能是从未提交的工作的唯一副本，而且一个源也可能属于共享同一 brain 的另一台机器。

**修法**：先审查，再移除 gstack 能证明已消失的那些：
```bash
gstack-gbrain-sync --prune-gone-worktrees --dry-run
gstack-gbrain-sync --prune-gone-worktrees
```
只有当一个源的路径在连续两次同步中都缺失、其父目录可读、其 id 能由本主机与路径重新算出（即本机创建了它）、且其仓库仍存在但已不再列出该 worktree 时，它才会被移除。每次移除都会记录到 `~/.gstack/.gbrain-prune.log`。请在同一仓库的主检出中运行，gstack 才能找到该仓库。它保留的每个源都会打印原因；只有在确信无误时，才用 `gbrain sources remove <id>` 手动移除这样的源。

---

## `dream: skipped — the installed gbrain cannot run only the resolve_symbol_edges phase, and the full dream cycle costs about 35 minutes (LLM phases).`

**问题**：`/sync-gbrain --dream`（或 `--full`）没有构建调用图。

**原因**：调用图只需要 gbrain 的 `resolve_symbol_edges` 阶段。已安装的 gbrain 无法单独运行该阶段（没有 `dream --phase`，或没有这个阶段），而 gstack 也不再自行启动 gbrain 的完整维护周期：它耗时约 35 分钟且会运行 LLM 阶段。

**修法**：
```bash
gstack-gbrain-install          # 升级 gbrain，然后：
/sync-gbrain --dream
```
或者在你有空时自己运行完整周期：`gbrain dream --source <id>`。

---

## `call graph for <source>: unknown: installed gbrain does not expose cycle_freshness`

**问题**：`/sync-gbrain` 无法判断这个仓库的调用图是否曾经构建过，因此不会主动提议构建。

**原因**：答案来自 `gbrain doctor` 的 `cycle_freshness` 检查。gstack 现在从 `gbrain doctor --json --scope=brain` 读取它（以前用的 `--fast` 模式会跳过该检查，所以总是显示 "unknown"）。你安装的 gbrain 根本不报告这项检查。

**修法**：
```bash
gstack-gbrain-install          # 升级 gbrain
/sync-gbrain --dream           # 或者不管怎样，现在就构建调用图
```

---

## `artifacts remote: restored <url> because <owner>/gstack-artifacts-<user> does not exist and <owner>/gstack-brain-<user> does`

**问题**：升级期间打印一次。产物推送此前一直在失败，因为 `~/.gstack-artifacts-remote.txt` 指向一个从未创建过的仓库。

**原因**：v1.27.0.0 升级向 `gh repo rename` 传了一个裸仓库名——这必定失败——随后仍把远端改写成了新名字。本次升级把远端（以及 `~/.gstack` 的 `origin`）指回实际存在的仓库。

**修法**：无需任何操作；推送已恢复。要完成改名：
```bash
gh repo rename gstack-artifacts-<user> --repo <owner>/gstack-brain-<user> --yes
GSTACK_MIGRATE_ASSUME_YES=1 bash ~/.claude/skills/gstack/gstack-upgrade/migrations/v1.27.0.0.sh
```
若它显示的是 `could not confirm ... exists (gh is not installed or not signed in)`，运行 `gh auth login` 并在 GitHub 上核对仓库名。

---

## 预期会同步，却什么都没在同步

**这不是错误，而是一个常见的坑**。按顺序检查：

1. `gstack-brain-sync --status` —— 模式是否为 `off`？
2. `~/.gstack/.git` 是否存在？
3. `gstack-config get artifacts_sync_mode` —— 应为 `full` 或 `artifacts-only`。
4. 你预期会同步的文件 —— 它在白名单里吗？
   `cat ~/.gstack/.brain-allowlist`
5. 隐私分级过滤 —— 若模式为 `artifacts-only`，行为类文件（timelines、developer-profile）是被有意跳过的。

若以上都没问题，运行：
```bash
gstack-brain-sync --discover-new
gstack-brain-sync --once
```
强制排空一次。
