---
title: "用 GBrain 同步实现跨机器记忆"
---


gstack 会往 `~/.gstack/` 写入许多有用的状态——心得、复盘、CEO 计划、设计文档、开发者画像。默认情况下，这一切都会在你换笔记本时随风而逝。**GBrain 同步**会把其中一份精选子集推送到私有 git 仓库，让你的记忆跟着你跨机器走，并成为 GBrain 可索引的内容。

## 你能得到什么

- 在机器 A 上工作，在机器 B 上无缝接续。
- 你的心得、计划与设计在 GBrain 中可见（如果你在用它）。
- 一条干净的退出通道（`gstack-brain-uninstall`），绝不触碰你的数据。
- 没有守护进程，没有系统服务，没有后台进程。

## 什么绝不会离开你的机器

出于设计，即使同步开启，以下内容也留在本地：

- 凭据：`.auth.json`、`auth-token.json`、`sidebar-sessions/`、
  `security/device-salt`
- 机器特定状态：Chromium 配置、ONNX 模型权重、缓存、eval-cache、
  CDP-profile、一次性提示标记（`.welcome-seen`、`.telemetry-prompted`、
  `.vendoring-warned-*` 等）
- 询问偏好：每台机器各自的 UX 偏好
  （`question-preferences.json`、`question-log.jsonl`、`question-events.jsonl`）。

确切的白名单（allowlist）放在 `~/.gstack/.brain-allowlist`。由 CLI 管理；
你可以在标记行之下追加自己的条目。

## 首次运行配置（30–90 秒）

```bash
gstack-artifacts-init
```

这条命令会：

1. 把 `~/.gstack/` 变成一个 git 仓库。
2. 询问远端 URL（默认：`gh repo create --private
   gstack-artifacts-$USER`）。任何 git 远端都行——GitHub、GitLab、Gitea、
   自托管皆可。
3. 推送一个只含配置的初始 commit。
4. 写入 `~/.gstack-artifacts-remote.txt`（只有 URL，无秘密——
   可以安全拷贝到另一台机器）。
5. 打印给 brain 宿主用的 `gbrain sources add` 接线命令
   （绝不自动执行——你自己跑，或者在你自己的机器上
   `bin/gstack-gbrain-source-wireup` 会完成同样的接线），这样
   `gbrain search` 就能索引你同步过去的心得、计划与设计。
   旧的 `gstack-brain-reader add --ingest-url ...` HTTP 路径已在
   v1.15.1.0 中移除——它依赖的 `/ingest-repo` 端点 gbrain 从未发布过。

初始化之后，**你运行的下一个技能**会就隐私模式问你一个问题：

- **白名单内全部同步（推荐**）：心得、评审、计划、设计、复盘、时间线
  与开发者画像全部同步。
- **仅产物**：计划、设计、复盘、心得——跳过
  行为数据（时间线、开发者画像）。
- **拒绝**：一切留在本地。之后可用
  `gstack-config set artifacts_sync_mode full` 开启同步。

你的回答会被持久化。不会再问第二次。

## 跨机器工作流

在机器 A 上：运行一次 `gstack-artifacts-init`。就这样——此后每次技能
调用都会在开始与结束边界清空同步队列
（每个技能约 200–800 毫秒的网络停顿）。

在机器 B 上：

1. 把机器 A 的 `~/.gstack-artifacts-remote.txt` 拷到机器 B
   （密码管理器、dotfile 仓库、U 盘——随你；旧名
   `~/.gstack-brain-remote.txt` 仍被识别）。
2. 运行任意 gstack 技能。preamble 看到 URL 文件后会打印：
   ```
   BRAIN_SYNC: brain repo detected: <url>
   BRAIN_SYNC: run 'gstack-brain-restore' to pull your cross-machine memory
   ```
3. 运行 `gstack-brain-restore`。它会 clone 仓库、还原你的
   心得/计划/复盘，并重新注册 git 合并驱动。
4. 下一个技能：你昨天在机器 A 上的心得浮现出来。这就是
   魔法时刻（magical moment）。

## 状态、健康与队列深度

```bash
gstack-brain-sync --status
```

显示：状态（`ok`、`idle`、`held`、`collision`、`blocked`、
`push_failed`、`error`），被秘密扫描或因不是合法 JSON 而扣住的文件
及其修复方法，因路径仅大小写不同而被扣住的文件
（`case_held`、`case_names`；见
[排障](/troubleshooting/#artifact-case-collision)）、
`drainable` 计数、上次同步与推送时间、待处理队列深度，以及
当前隐私模式。

每次技能运行都会在 preamble 输出顶部附近打印一行 `ARTIFACTS_SYNC:`。
当同步卡住时会追加一行
`ARTIFACTS_SYNC: attention:`；这些行及其修复方法的表格在
[gbrain-sync-errors.md](/gbrain-sync-errors/#artifacts_sync-attention-技能启动时)。

## 隐私模式详解

| 模式 | 同步什么 |
|------|------------|
| `off` | 什么都不同步（默认）。 |
| `artifacts-only` | 计划、设计、复盘、心得、评审。跳过时间线 + 开发者画像。 |
| `full` | 白名单内的一切，包括行为状态。 |

随时可改：
```bash
gstack-config set artifacts_sync_mode full
gstack-config set artifacts_sync_mode off
```

## 删除与移动的文件

默认情况下，同步绝不发布删除操作：删掉一份已同步的设计文档，
或移动一个项目目录（项目 slug 迁移就是这种），旧路径会留在远端，
brain 继续在新副本旁边索引它。想连删除也一起发布：

```bash
gstack-config set artifacts_sync_removals on
```

此后每次同步都会把已从磁盘消失的同步文件以删除形式提交。
转录页不受影响，决策日志与其活跃快照只会成对进出。一次同步若要
删除超过 20 个文件，则一个也不发布：那看起来像数据丢失，而不是
清理。无论设置如何，这类删除都由你自己审查并发布：

```bash
gstack-brain-sync --publish-removals        # 列出它们
gstack-brain-sync --publish-removals --yes  # 提交并推送其删除
```

## 秘密防护

每个 commit 在离开你的机器之前都会被扫描是否含凭据形态的内容。
被拦截的模式包括：

- AWS 访问密钥（`AKIA…`）
- GitHub token（`ghp_`、`gho_`、`ghu_`、`ghs_`、`ghr_`、`github_pat_`）
- OpenAI 密钥（`sk-…`）
- PEM 块（`-----BEGIN …-----`）
- JWT（`eyJ…`）
- JSON 中的 Bearer token（`"authorization": "…"`、`"api_key": "…"` 等）

如果扫描命中，只有被标记的文件（连同与它耦合的文件）被扣下；
其余照常同步。被扣的文件留在队列中，每次同步都会重新扫描，
技能启动时打印：

```
ARTIFACTS_SYNC: attention: status=held held=1. Sync is holding back 1 file(s) that the secret scan flagged or that are not valid JSON; everything else still syncs. See which files and how to fix them: <bin> --status
```

修复步骤：

1. 运行 `gstack-brain-sync --status`（那行会打印其绝对路径）。`held`
   下的每个条目都写明文件、扫描规则与两种修复方式。
2. 如果匹配是对你永远不想同步的内容的误报，运行
   `gstack-brain-sync --skip-file <path>` 永久排除该路径；
   `gstack-brain-sync --unskip-file <path>` 可撤销。
3. 否则，编辑该文件移除秘密；下一次技能运行就会同步它。

`~/.gstack/.git/hooks/pre-commit` 处还有一个纵深防御钩子，
在你对该仓库手动 `git commit` 时运行同样的扫描。

另外（v1.63.0.0 起），每次推送都会在发出任何内容*之前*向出站台账
（`~/.gstack/security/egress.jsonl`）写入一条防篡改回执，
失败即关闭：回执写不进去，推送即被拒绝，队列原样保留。用
`gstack-egress list` 查看台账，用 `gstack-egress verify` 校验其哈希链。

## 双机冲突

如果你同一天在机器 A 和机器 B 上都有写入，两边都会推送追加式
commit。按 git 默认行为会在文件尾部冲突，但 `.jsonl` 与 markdown
文件注册了自定义合并驱动：

- JSONL 文件使用排序去重驱动，按 ISO 时间戳排列追加内容
  （为保证确定性，回退为按每行的 SHA-256 哈希）。
- Markdown 产物（复盘、计划、设计）使用并集合并驱动，
  把两边内容拼接起来。

你不应看到冲突提示。如果真的出现（真正的语义冲突，比如两台机器
编辑了同一份计划），git 会停下来询问。

当推送被拒绝时，brain-sync 会自行 fetch 并合并另一台机器的
commit。会因合并而改变的文件的本地编辑会先被搁置、事后放回，
合并失败则整体中止，因此 `~/.gstack` 绝不会持有冲突标记。如果
本地编辑与另一台机器的修改冲突，工作区保留对方的版本，你的编辑
存进一个 git stash；`gstack-brain-sync --status` 会报出 stash 名称以及
把它取回的命令
`git -C ~/.gstack --literal-pathspecs restore --source=<stash> -- <path>`。

`developer-profile.json` 之类的 JSON 文件没有合并驱动，因此合并可能
在它们里面留下冲突标记。同步会解析每个暂存的 `.json` 文件，把解析
不过的扣下（状态 `held`，规则 `invalid-json`）直到你修复它；
当已同步的画像或决策快照持有冲突标记时，`gstack-doctor` 会告警。

## 跨机器拉取节奏

preamble 每 24 小时运行一次 `git fetch` + `git merge --ff-only`
（通过 `~/.gstack/.brain-last-pull` 缓存）。你无需操心——
它每天在第一次技能调用时自动发生。

历史注记（#2516）：那次的每日拉取只刷新了 `~/.gstack` 本身——
而没有刷新 gbrain 实际索引的、位于 `~/.gstack-brain-worktree` 的
分离 worktree，于是 brain 静默地继续供出陈旧页面，直到下一次
setup-gbrain/sync-gbrain 运行。自该修复起，每日同步也会推进
brain worktree（`gstack-gbrain-source-wireup --advance-only`，经
`~/.gstack/.brain-worktree-last-advance` 限频）；推进失败会告警
而非静默失败，且绝不强推重置一个脏 worktree。

## 卸载

```bash
gstack-brain-uninstall
```

它会：

- 移除 `~/.gstack/.git/` 及所有 `.brain-*` 配置文件。
- 清空 `gstack-config` 中的 `artifacts_sync_mode`。
- 绝不触碰你的心得、计划、复盘或开发者画像。

加 `--delete-remote` 可一并删除那个私有 GitHub 仓库（仅限 GitHub，
使用 `gh repo delete`）。

随时可用 `gstack-artifacts-init` 重新初始化。

## 排障

见 [gbrain-sync-errors.md](/gbrain-sync-errors/)：gstack-brain 可能打印的
每条错误消息的索引，逐条给出问题 / 原因 / 修复。

## 幕后原理

这个功能背后的架构决策：白名单优先于黑名单（未知文件默认留在
本地）、preamble 边界同步优先于守护进程（没有要照看的后台进程）、
JSONL 合并驱动让并发机器把队列并集而不是冲突，以及一道隐私闸门——
在任何东西同步之前先问一次。
