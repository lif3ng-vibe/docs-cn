---
title: "wt list"
description: "列出各 worktree 及其状态。"
sidebar:
  order: 11
---
<!-- ⚠️ AUTO-GENERATED from `wt list --help-page` — edit src/cli/mod.rs to update -->

列出各 worktree 及其状态。

显示未提交的更改、相对默认分支与远程的领先/落后，以及可选的 CI 状态与 LLM 摘要。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-list.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-list.gif" alt="wt list 演示" width="1600" height="900">
</picture>
<figcaption>渐进式渲染，随后是 --full 与 --branches</figcaption>
</figure>

表格采用渐进式渲染：分支名、路径与提交哈希立即出现，状态、领先/落后情况等其余列则随后台 git 操作完成逐渐填充。

## 完整模式

`--full` 会增加仅有的两列需要走出本机获取的数据：[CI 状态](#ci-状态)（forge 流水线通过/失败，经网络获取）与各分支更改的 [LLM 生成摘要](#llm-摘要)。

## 示例

列出所有 worktree：

```console
$ wt list
  Branch       Status      HEAD±     main↕    main…±    Remote⇅  Commit    Age  Message
@ feature-api  +   ↕⇡     +54   -5   ↑4  ↓1  +234  -24   ⇡3      6814f02   30m  Add API tests
^ main             ^⇅                                    ⇡1  ⇣1  41ee083    4d  Merge fix-auth: ha…
+ fix-auth         ↕|                ↑2  ↓1   +25  -11     |     b772e68    5h  Add secure token s…
+ fix-typos        _|                                      |     41ee083    4d  Merge fix-auth: ha…

○ Showing 4 worktrees, 1 with changes, 2 ahead, hidden: Path
```

附带 CI 状态与 LLM 摘要：

```console
$ wt list --full
  Branch       Status      HEAD±     main↕    main…±    Summary                       Remote⇅  CI
@ feature-api  +   ↕⇡     +54   -5   ↑4  ↓1  +234  -24  Refactor API to REST archit…   ⇡3      #412
^ main             ^⇅                                                                  ⇡1  ⇣1  #
+ fix-auth         ↕|                ↑2  ↓1   +25  -11  Harden auth with constant-t…     |     #408
+ fix-typos        _|                                                                    |     #410

○ Showing 4 worktrees, 1 with changes, 2 ahead, hidden: Path, Commit, Age, Message
```

包含尚无 worktree 的分支：

```console
$ wt list --branches --full
  Branch       Status      HEAD±     main↕    main…±    Summary                       Remote⇅  CI
@ feature-api  +   ↕⇡     +54   -5   ↑4  ↓1  +234  -24  Refactor API to REST archit…   ⇡3      #412
^ main             ^⇅                                                                  ⇡1  ⇣1  #
+ fix-auth         ↕|                ↑2  ↓1   +25  -11  Harden auth with constant-t…     |     #408
+ fix-typos        _|                                                                    |     #410
/ exp             /↕                 ↑2  ↓1  +137       Explore GraphQL schema and…
/ wip             /↕                 ↑1  ↓1   +33       Start API documentation

○ Showing 4 worktrees, 2 branches, 1 with changes, 4 ahead, hidden: Path, Commit, Age, Message
```

输出 JSON 供脚本使用：

```console
$ wt list --format=json
```

## 列

| 列 | 显示内容 |
|--------|-------|
| Branch | 分支名，超过 32 个字符时以 `…` 截断；脱离 HEAD 的 worktree 显示其短哈希 |
| Status | 紧凑符号（见下文） |
| HEAD± | 未提交的更改（含未跟踪文件）：+新增 -删除的行数 |
| main↕ | 领先/落后默认分支的提交数 |
| main…± | 自与默认分支的合并基（三点式）以来的行差异 |
| Summary | LLM 生成的分支摘要；需要 `--full`、`summary = true` 与 [`commit.generation`](/config/#commit) |
| Remote⇅ | 领先/落后跟踪分支的提交数 |
| CI | 按流水线状态着色的 PR/MR 编号；仅限 `--full` |
| Path | worktree 目录 |
| URL | 来自项目配置的开发服务器 URL；端口未监听时呈暗色 |
| *(custom)* | 由 `[list.custom-columns]` 用户配置定义的[自定义列](#自定义列) <span class="badge-experimental"></span> |
| Commit | 短哈希，按 `core.abbrev` 截取 |
| Age | 距上次提交的时间 |
| Message | 最后一条提交信息（截断显示） |

`main↕` 与 `main…±` 这两个表头在所有仓库中都保留大家熟悉的 `main` 标签。

表格宽度随终端自适应。列放不下时，最不重要的先被隐藏——大体从右往左，因为上面的列序正是从身份信息排到锦上添花——摘要页脚会点名（`hidden: Commit, Age, Message`）。终端更宽时它们会回来。想固定一组列而不是交给宽度决定，可在 [`[list] columns`](/config/#list) 中指名；`--format=json` 则在任何宽度下都携带全部字段。

### 行首列（gutter）

最左侧的一列按物理存在程度标记每一行，从存在程度最高到最低：

| 符号 | 含义 |
|--------|---------|
| `@` | 当前 worktree |
| `^` | 主 worktree（仓库的本体 worktree） |
| `+` | 其他 worktree |
| `/` | 没有 worktree 的本地分支（`--branches`） |
| `\|` | 远程分支，抓取之前本地不可见（`--remotes`） |

### CI 状态

CI 列显示该分支开放的 PR/MR——GitHub、Gitea 与 Azure DevOps 上形如 `#3035`，GitLab 上形如 `!3035`——并按流水线状态着色；没有可用编号时（例如无 PR/MR 的分支工作流）只显示一个裸 `#`。绿、蓝、红、黄、灰表示流水线状态；品红与青色表示评审状态。各取值的 JSON 形式见 [checks 对象](#checks-对象)与 [review 状态](#review-状态)：

| 指示符 | 取值 | 含义 |
|-----------|-------|---------|
| <span style='color:#0a0'>#</span> 绿色 | `"passed"` | 所有检查均通过 |
| <span style='color:#00a'>#</span> 蓝色 | `"running"` | 检查进行中 |
| <span style='color:#a00'>#</span> 红色 | `"failed"` | 一项或多项检查失败 |
| <span style='color:#a60'>#</span> 黄色 | `"conflicts"` | 与目标分支存在合并冲突 |
| <span style='color:#888'>#</span> 灰色 | `"no-ci"` | 无 PR/MR，或未配置检查 |
| <span style='color:#a60'>⚠</span> 黄色 | `"error"` | 无法获取 CI 状态（登录过期、速率限制、网络等） |
| <span style='color:#a0a'>#</span> 品红 | `"changes_requested"` | 有评审者要求修改 |
| <span style='color:#0aa'>#</span> 青色 | `"pending"` | 需要评审（如分支保护）但尚未给出 |
| （空白） | `pr` 与 `checks` 缺失 | 分支从未推送、forge CLI 未登录到该主机，或无 PR/MR 且无分支工作流 |

其余两个评审状态没有专属指示符：`"draft"` 只是把单元格调暗，`"approved"` 则不改颜色。

要求修改（品红）的优先级高于进行中的检查，而待评审（青色）只为本为绿色或灰色的分支改色。GitLab 只报告 `"pending"` 与 `"draft"` 两种评审状态。

CI 单元格是指向 PR 或流水线页面的可点击链接；遇到草稿 PR/MR（`"draft"`），或未推送的本地更改使状态过期（`checks.stale`）时呈暗色。结果缓存 30-60 秒；可用 `wt config state cache` 查看或清除。

### LLM 摘要

复用 [`commit.generation`](/config/#commit) 命令——即生成提交信息的那套 LLM。在 `[list]` 配置中设 `summary = true` 启用；需要 `--full`。结果会缓存，直到该分支的 diff 发生变化。

### 自定义列

<span class="badge-experimental"></span>

用户配置中的每个 `[list.custom-columns]` 条目都会增加一列：条目的键作表头，其模板渲染每行的单元格。模板可读取 `{{ vars.* }}`（用 [`wt config state vars set`](/config/#wt-config-state-vars) 设置）与 `{{ git.branch.* }}`（来自 Git 配置的 `branch.<name>.*`）：

```toml
# ~/.config/worktrunk/config.toml
[list.custom-columns.Ticket]
template = "{{ vars.ticket }}"
```

模板、宽度与丢弃优先级详见[自定义列配置](/config/#自定义列)。

## 状态符号

状态列由多个子列拼成，从左到右，每个子列对应 `--format=json` 中 schema-2 的一个字段（schema 1 对其中若干个拼写不同——见 [Schema 1](#schema-1)）。工作区标志相互独立、可并存——任意组合都会同时显示。其余子列互斥：各显示一个符号，即按表格自上而下的顺序优先级最高的状态；无适用状态时留空。

### 工作区（working tree）

来自 `git status` 的独立标志；可同时显示多个（如 `+!?`）。每个都对应 [changes 对象](#changes-对象)中的一个布尔值：

| 符号 | worktree.changes | 含义 |
|--------|------------------|---------|
| `+` | `staged` | 已暂存的文件 |
| `!` | `modified` | 已修改的文件（未暂存） |
| `?` | `untracked` | 未跟踪的文件 |

`worktree.changes` 还会报告 `renamed` 与 `deleted`，但它们在这一列没有专属符号。

### Worktree

表示进行中的 git 操作、worktree 位置属性，或没有 worktree 的分支。只显示一个符号，按优先级从高到低（`✘ > ↻ > ⊟ > ⊞ > ⊘ > ⚐ > /`）：

| 符号 | JSON | 含义 |
|--------|------|---------|
| `✘` | `worktree.changes.conflicted` | 合并冲突 |
| `↻` | `worktree.operation` `"rebase"`、`"merge"`、`"cherry_pick"`、`"revert"`、`"bisect"` | 有 git 操作正在进行；`git status` 会指明是哪个 |
| `⊟` | `worktree.prunable` | 可修剪（worktree 目录或其 `.git` 已消失） |
| `⊞` | `worktree.locked` | 已锁定的 worktree |
| `⊘` | `worktree.detached` | 脱离 HEAD（detached HEAD） |
| `⚐` | `worktree.duplicate_branch` | 分支被检出到多个 worktree |
| `⚐` | `worktree.branch_mismatch` | worktree 不在其分支对应的路径上 |
| `/` | 无 `worktree` 对象 | 没有 worktree 的分支 |

### 默认分支

描述分支与默认分支关系的唯一最高优先级状态；无适用状态时留空（即普通的最新分支）。每个符号对应一个 `display.state` 取值：

| 符号 | display.state | 含义 |
|--------|---------------|---------|
| `^` | `"is_main"` | 主 worktree（仓库的本体 worktree） |
| `∅` | `"orphan"` | 与默认分支没有共同祖先 |
| `_` | `"empty"` | 与默认分支同提交且工作区干净——可安全移除；该行呈暗色 |
| `⊂` | `"integrated"` | 内容已经由不同历史[并入](/remove/#分支清理)默认分支或合并目标；命中的判定记录在 `default_branch.integration.reason`；该行呈暗色 |
| `✗` | `"would_conflict"` | 合并进默认分支会冲突（用 `git merge-tree` 模拟）且分支尚未被并入；使用 `--full` 时该检查还计入已跟踪文件的未提交更改 |
| `–` | `"same_commit"` | 与默认分支同提交，但有未提交更改 |
| `↕` | `"diverged"` | 既领先又落后于默认分支 |
| `↑` | `"ahead"` | 拥有默认分支没有的提交 |
| `↓` | `"behind"` | 缺少默认分支已有的提交 |

[可安全删除](/remove/#分支清理)时该行呈暗色——即 `_`（`"empty"`）或 `⊂`（`"integrated"`）。

### 远程

与跟踪分支的关系，由 `upstream.ahead` / `upstream.behind` 计数得出；没有上游时留空：

| 符号 | upstream | 含义 |
|--------|----------|---------|
| `\|` | `ahead` 0，`behind` 0 | 与远程同步 |
| `⇡` | `ahead` > 0 | 领先于远程 |
| `⇣` | `behind` > 0 | 落后于远程 |
| `⇅` | `ahead` > 0，`behind` > 0 | 与远程分叉 |

### 标记

最后一个子列显示分支的标记（marker），用 [`wt config state marker set`](/config/#wt-config-state-marker) 设置——通常是一个表明分支用途的 emoji。它会作为条目的 `marker` 字段读回。

### 占位符号

表格加载期间，它们会出现在各个列中：

| 符号 | 含义 |
|--------|---------|
| `·` | 数据加载中，或采集超时 |

---

## JSON 输出

`--format=json` 默认输出 schema 2，即下面的信封（envelope）格式。设置 `[list] json-schema = 1` 可保留最初的裸数组格式。

### Schema 2

单个信封对象。条目携带相互独立的事实；渲染出的字符串（包括折叠后的 Status 取值）都在 `display` 之下：

```json
{
  "schema": 2,
  "repo": {
    "default_branch": "main",
    "forge": {"url": "https://github.com/org/repo", "provider": "github",
              "host": "github.com", "owner": "org", "name": "repo", "remote": "origin"}
  },
  "collected": {"ci": false, "summary": false},
  "items": [
    {
      "branch": "feature",
      "head": {"sha": "05a4a45d…", "short_sha": "05a4a45", "subject": "Add login page",
               "committed_at": "2025-01-01T08:00:00Z"},
      "worktree": {"path": "/home/user/repo.feature", "main": false, "current": true,
                   "previous": false, "detached": false, "branch_mismatch": false,
                   "duplicate_branch": false,
                   "changes": {"staged": false, "modified": true, "untracked": false,
                               "renamed": false, "deleted": false, "conflicted": false,
                               "diff": {"added": 10, "deleted": 2}}},
      "default_branch": {"ahead": 3, "behind": 1, "diff": {"added": 50, "deleted": 20},
                         "orphan": false, "integration": null, "merge_conflicts": false},
      "upstream": {"remote": "origin", "branch": "feature", "ahead": 0, "behind": 2},
      "display": {"state": "diverged", "symbols": "!↕", "statusline": "feature …"}
    }
  ]
}
```

“无值”如何解读：

- **缺失**（absent）——无可报告：不适用（仅分支行上的 `worktree`）、本次运行未请求（信封的 `collected` 记录了实际请求了什么）、或已判定为空（无 PR、无锁定、未并入）。
- **`null`**——已请求但未判定：某任务超时、某项检查被跳过，或 forge 抓取失败。这是表格 `·` 占位符的 JSON 形式。

jq 的路径表达式对缺失与 `null` 一视同仁，因此过滤器无需判空；确有需要时用 `has()` 区分二者。

信封字段：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `schema` | number | 格式版本；恒为 `2` |
| `repo` | object | `{default_branch, forge}`——所有 `default_branch` 对象参照的分支（检测失败时缺失），以及从主远程推导的 forge 元数据（远程 URL 无法解析时缺失；见 [repo 对象](#repo-对象)） |
| `collected` | object | `{ci, summary}`——本次运行请求了哪些受门控的事实族，因此缺失的 `pr`/`checks`/`summary` 应读作“未请求”而非“无” |
| `items` | array | 每行一个对象：worktree、本地分支或仅远程的分支 |

条目字段：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `branch` | string/null | 分支名；脱离 HEAD 的 worktree 为 null。远程行的分支名不带远程前缀，远程名放在 `remote` |
| `remote` | string | 远程名，仅出现在仅远程分支的行上 |
| `head` | object/null | HEAD 提交（见 [head 对象](#head-对象)）；尚无提交的分支（unborn）为 null |
| `worktree` | object | worktree 相关事实（见 [worktree 对象](#worktree-对象)）；仅分支的行上缺失 |
| `default_branch` | object | 与默认分支的关系（见 [default_branch 对象](#default-branch-对象)）；默认分支自身缺失 |
| `upstream` | object | 跟踪分支（见 [upstream 对象](#upstream-对象)）；未配置时缺失 |
| `pr` | object | 开放的 PR/MR（见 [pr 对象](#pr-对象)）；随 `--full` 采集 |
| `checks` | object | CI 流水线（见 [checks 对象](#checks-对象)）；随 `--full` 采集 |
| `dev_server` | object | 来自项目 `list.url` 模板的 `{url, listening}`；未配置时缺失 |
| `summary` | string | LLM 分支摘要；需要 `--full`、`[list] summary = true` 与一条 `[commit.generation]` 命令 |
| `marker` | string | 来自 [`wt config state marker`](/config/#wt-config-state-marker) 的分支标记；未设置时缺失 |
| `vars` | object | 来自 [`wt config state vars`](/config/#wt-config-state-vars) 的按分支变量 |
| `display` | object | 渲染出的字符串（见 [display 对象](#display-对象)） |

### head 对象

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `sha` | string | 完整提交 SHA（40 字符） |
| `short_sha` | string | 短提交 SHA，按 `core.abbrev` 截取（前缀有歧义时自动加长） |
| `subject` | string/null | 提交主题（首行）；未加载时为 null，例如可修剪的 worktree |
| `committed_at` | string/null | 提交者时间，RFC 3339 UTC；未加载时为 null |

### worktree 对象

仅出现在 worktree 行上。位置类属性相互独立、可并存——符号见 [Worktree](#worktree)，符号只取其一：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `path` | string | worktree 路径 |
| `main` | boolean | 是否为主 worktree |
| `current` | boolean | 是否为命令运行时所在的 worktree |
| `previous` | boolean | 是否为上一个 worktree（`wt switch -`） |
| `detached` | boolean | HEAD 是否脱离 |
| `locked` | object | `{reason}`；未锁定时缺失 |
| `prunable` | object | `{reason}`；git 未报告该 worktree 可修剪时缺失 |
| `branch_mismatch` | boolean | worktree 不在其分支对应的路径上 |
| `duplicate_branch` | boolean | 另一个 worktree 检出了同一分支 |
| `operation` | string/null | 进行中的操作：`"merge"`、`"rebase"`、`"cherry_pick"`、`"revert"`、`"bisect"`；无进行中操作时缺失 |
| `changes` | object/null | 工作区状态（见 [changes 对象](#changes-对象)） |

### changes 对象

五个变更标志对应[工作区](#工作区-working-tree)一节的符号（`renamed` 与 `deleted` 没有专属符号）：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `staged` | boolean | 有已暂存的文件 |
| `modified` | boolean | 有已修改的文件（未暂存） |
| `untracked` | boolean | 有未跟踪的文件 |
| `renamed` | boolean | 有已改名的文件 |
| `deleted` | boolean | 有已删除的文件 |
| `conflicted` | boolean/null | 已跟踪文件存在合并冲突 |
| `diff` | object/null | 相对 HEAD 变更的行数：`{added, deleted}` |

### default_branch 对象

相互独立的事实；表格按优先级折叠出的符号即 `display.state`。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `ahead` | number/null | 领先默认分支的提交数（孤儿分支为 null） |
| `behind` | number/null | 落后默认分支的提交数（孤儿分支为 null） |
| `diff` | object/null | 相对默认分支变更的行数：`{added, deleted}` |
| `orphan` | boolean/null | 与默认分支没有共同祖先 |
| `integration` | object/null | `{reason}`——哪项检查判定内容已[并入](/remove/#分支清理)（见 [integration 原因](#integration-原因)）；判定为未并入时缺失，未判定（检查超时或被跳过）时为 null |
| `merge_conflicts` | boolean/null | 合并进默认分支是否会冲突，用 `git merge-tree` 本地模拟得出 |

### upstream 对象

`ahead` / `behind` 决定 [Remote](#远程) 一节的分叉符号：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `remote` | string | 远程名（如 `"origin"`） |
| `branch` | string/null | 远程上的分支名 |
| `ahead` | number | 领先远程的提交数 |
| `behind` | number | 落后远程的提交数 |

### pr 对象

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `number` | integer/null | PR/MR 编号 |
| `url` | string/null | PR/MR 页面的 URL |
| `review` | string | 评审状态（见 [review 状态](#review-状态)）；forge 未报告评审信号时缺失 |
| `mergeable` | boolean/null | forge 报告冲突时为 false，否则为 null |
| `repo` | object | PR/MR 目标仓库（fork PR 的上游）的结构化元数据（见 [repo 对象](#repo-对象)）；URL 无法解析时缺失 |

### checks 对象

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `status` | string/null | `"passed"`、`"running"` 或 `"failed"`；被冲突报告掩盖时为 null |
| `source` | string | `"pr"`（PR/MR）或 `"branch"`（分支工作流） |
| `stale` | boolean | 本地 HEAD 与远程不一致（有未推送的更改） |

三个 [CI 状态](#ci-状态)取值没有自己的 `checks.status`，因为它们由 `pr` 与 `checks` 的形态来表达：抓取出错（`⚠`）时二者均为 null，无 CI 时 `checks` 缺失，合并冲突时 `checks.status` 为 null 且 `pr.mergeable` 为 false。

### dev_server 对象

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `url` | string | 来自项目配置的开发服务器 URL |
| `listening` | boolean/null | 该 URL 的端口是否在监听 |

### display 对象

仅用于呈现——这里的每个值渲染的都是条目中别处已有的事实：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `state` | string | 表格折叠后的默认分支状态（见 [state 取值](#state-取值)）；无适用状态时缺失 |
| `symbols` | string | 不带颜色的原始状态符号（如 `"!?↓"`） |
| `statusline` | string | 带颜色与链接的预格式化状态 |
| `columns` | object | 按表头为键的已渲染[自定义列](#自定义列)取值；空单元格省略 |

### repo 对象

`repo.forge` 描述由主远程推导出的本地检出所属仓库。`pr.repo` 描述 PR/MR 的目标仓库（对 fork PR 而言即上游目标）。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `url` | string | 仓库网页 URL |
| `provider` | string | `"github"`、`"gitlab"`、`"gitea"`、`"azure-devops"` 或 `"unknown"` |
| `host` | string | 仓库网页主机 |
| `owner` | string | 所有者、组织或命名空间路径 |
| `name` | string | 仓库名 |
| `project` | string | Azure DevOps 项目名；其他 provider 时缺失 |
| `remote` | string | 本地远程名；出现在 `repo.forge` 上，`pr.repo` 上缺失 |

### state 取值

描述分支与默认分支关系的唯一最高优先级状态；无适用状态时缺失（即普通的最新分支）。每个取值对应一个默认分支符号——符号及各取值的完整含义见[默认分支](#默认分支)（`"is_main"`、`"orphan"`、`"empty"`、`"integrated"`、`"would_conflict"`、`"same_commit"`、`"diverged"`、`"ahead"`、`"behind"`）。

### integration 原因

`default_branch.integration.reason` 记录命中了哪项检查。检查按成本从低到高运行，首个命中者生效。符号见[默认分支](#默认分支)。

| 取值 | 含义 |
|-------|---------|
| `"same_commit"` | 分支 HEAD 即默认分支的提交 |
| `"ancestor"` | 分支 HEAD 是默认分支的祖先，默认分支已前进越过它 |
| `"no_added_changes"` | 三点 diff（`main...branch`）为空——合并基之外没有文件变更 |
| `"trees_match"` | 历史不同，但分支的树与默认分支完全相同 |
| `"merge_adds_nothing"` | 分支有更改，但并入后默认分支的树不变（例如目标分支已在其他文件上继续前进的 squash 合并） |
| `"patch_id_match"` | 分支 squash 后的 diff 与默认分支上的单个提交一致（如 GitHub/GitLab 的 squash 合并） |

### review 状态

`pr.review` 取 `"changes_requested"`、`"pending"`、`"draft"`、`"approved"` 四者之一，forge 未报告评审信号时缺失。各取值如何呈现见 [CI 状态](#ci-状态)。该词表与 Claude Code statusline 的 `pr.review_state` 字段一致。

```console
# Current worktree path (for scripts)
$ wt list --format=json | jq -r '.items[] | select(.worktree.current) | .worktree.path'

# Branches with uncommitted changes
$ wt list --format=json | jq '.items[] | select(.worktree.changes.modified)'

# Worktrees with merge conflicts
$ wt list --format=json | jq '.items[] | select(.worktree.changes.conflicted)'

# Branches ahead of main (needs merging)
$ wt list --format=json | jq '.items[] | select(.default_branch.ahead > 0) | .branch'

# Integrated branches (safe to remove)
$ wt list --format=json | jq '.items[] | select(.display.state == "integrated" or .display.state == "empty") | .branch'

# Branches without worktrees
$ wt list --format=json --branches | jq '.items[] | select(.worktree == null) | .branch'

# Worktrees ahead of upstream (needs pushing)
$ wt list --format=json | jq '.items[] | select(.upstream.ahead > 0) | {branch, ahead: .upstream.ahead}'

# Stale CI (local changes not reflected in CI)
$ wt list --format=json --full | jq '.items[] | select(.checks.stale) | .branch'
```

信封的 JSON Schema 发布于 [worktrunk.dev/schema/list-v2.json](https://worktrunk.dev/schema/list-v2.json)。

### Schema 1

最初的裸数组格式——每行一个对象、没有信封——由 `[list] json-schema = 1` 选定。其字段在 schema 2 中都有归宿：

| Schema 1 | Schema 2 |
|----------|----------|
| `branch` | `branch` |
| `path` | `worktree.path` |
| `kind` | 行的形态——有 `worktree` 对象即 `"worktree"`，无则 `"branch"` |
| `commit.sha`, `.short_sha`, `.message` | `head.sha`, `.short_sha`, `.subject` |
| `commit.timestamp` (Unix) | `head.committed_at` (RFC 3339 UTC) |
| `working_tree.staged`, `.modified`, `.untracked`, `.renamed`, `.deleted`, `.diff` | `worktree.changes.*` |
| `operation_state` `"conflicts"` | `worktree.changes.conflicted` |
| `operation_state` `"rebase"`, `"merge"`, … | `worktree.operation` |
| `main_state` | `display.state` |
| `integration_reason` | `default_branch.integration.reason`（snake_case，且单独报告 `"same_commit"` 而不是折叠进 `main_state`） |
| `main.ahead`, `.behind`, `.diff` | `default_branch.ahead`, `.behind`, `.diff` |
| `remote.name`, `.branch`, `.ahead`, `.behind` | `upstream.remote`, `.branch`, `.ahead`, `.behind` |
| `worktree.state` | `worktree.locked`、`.prunable`、`.duplicate_branch`、`.branch_mismatch`——相互独立，可并存 |
| `worktree.reason` | `worktree.locked.reason`, `worktree.prunable.reason` |
| `worktree.detached` | `worktree.detached` |
| `is_main`, `is_current`, `is_previous` | `worktree.main`, `.current`, `.previous` |
| `ci.status` | `checks.status`，另有 [checks 对象](#checks-对象)所述的形态 |
| `ci.source`, `ci.stale` | `checks.source`, `checks.stale` |
| `ci.number`, `ci.url`, `ci.review_state` | `pr.number`, `pr.url`, `pr.review` |
| `ci.repo`, `ci.repo_url` | `pr.repo`, `pr.repo.url` |
| `repo`, `repo_url` | 信封的 `repo.forge`、`repo.forge.url` |
| `url`, `url_active` | `dev_server.url`, `dev_server.listening` |
| `summary`, `vars`, `marker` | `summary`, `vars`, `marker` |
| `statusline`, `symbols`, `columns` | `display.statusline`, `display.symbols`, `display.columns` |

信封的 `repo.default_branch` 与 `collected` 在 schema 1 中没有对应物，而 schema 2 把“无可报告”与“未判定”区分开——见[“无值”如何解读](#schema-2)。

缺少某个大家普遍用得上的字段？欢迎[提 issue](https://github.com/max-sixty/worktrunk/issues)。

## 另请参阅

- [`wt switch`](/switch/)——切换 worktree 或打开交互式选择器

## 命令参考

```text wt-command-reference
wt list - List worktrees and their status

Usage: wt list [OPTIONS]
       wt list <COMMAND>

Commands:
  statusline  Single-line status for the current worktree

Options:
      --format <FORMAT>
          Output format

          [default: table]
          [possible values: table, json]

      --branches
          Include branches without worktrees

      --remotes
          Include remote branches

      --full
          Show CI status and LLM summaries

      --progressive
          Show fast info immediately, update with slow info

          Displays local data (branches, paths, status) first, then updates with remote data (CI,
          upstream) as it arrives. Use --no-progressive to force buffered rendering. Auto-enabled
          for TTY.

  -h, --help
          Print help (see a summary with '-h')

Global Options:
  -C <path>
          Working directory for this command

      --config <path>
          User config file path

      --config-set <toml>
          Override config with inline TOML, e.g. --config-set list.full=true (repeatable)

  -v, --verbose...
          Verbose output (-v: info logs + hook/alias template variables on stderr; -vv: also debug
          logs and raw subprocess output written to .git/wt/logs/). Set WORKTRUNK_VERBOSE=0|1|2 to
          apply the same level everywhere — including shell completion, which no flag can reach

  -y, --yes
          Skip approval prompts
```

# 子命令

## wt list statusline

当前 worktree 的单行状态。

这一行携带的单元格与 `wt list` 中该 worktree 所在行相同。CI 状态缓存过期时，它会联网一两秒，因此更适合宿主在后台渲染的 statusline——Claude Code 的状态栏、`tmux` 状态栏——而不太适合 shell 会阻塞等待的提示符。想让它快到可用于同步提示符？欢迎[提 issue](https://github.com/max-sixty/worktrunk/issues)。

### 输出格式

- `table`（默认）：`branch  status  HEAD±  main↕  main…±  Remote⇅  CI  URL`
- `json`：当前的 [`wt list --format=json`](/list/#json-输出) schema——默认为单条目信封，设 `[list] json-schema = 1` 时为单元素数组
- `claude-code`：`table` 的各单元格，前置 `dir`，后接 `model  context  pace`

没有内容可显示的单元格会被略过，因此大多数行比上面列出的更短。一行超出终端宽度时会整格丢弃，最不重要的先丢。

CI 引用会链接到对应的 PR/MR；带端口的开发服务器 URL 显示为 `:3000`，链接指向完整 URL，在该端口有响应前呈暗色。两者都是带下划线的终端链接。

### Claude Code 模式

`--format=claude-code` 从 stdin 读取 JSON 上下文（`.workspace.current_dir` 必填；其余可选）：

- `.workspace.current_dir`——工作目录
- `.model.display_name`——模型名
- `.context_window.used_percentage`——上下文占用（0–100），渲染为 `🌔 65%`，随上下文填满，月亮由 🌕 渐亏至 🌑
- `.rate_limits.{five_hour,seven_day}.used_percentage`——速率限制窗口用量（0–100）
- `.rate_limits.{five_hour,seven_day}.resets_at`——窗口重置时间（Unix epoch 秒）

pace 段只在用量可能于窗口重置前触及速率限制时出现，并显示风险更高的窗口：`2.9×(Tue–Tue 5pm)` 读作恰好填满该窗口的节奏的 2.9 倍。用量超过 90% 时显示用量而非节奏——`93%(Tue–Tue 5pm)`。窗口内预计被限流的时间占比越高，其颜色越从暗色加深为黄色。

[Claude Code statusline 设置](/claude-code/#statusline-仅-claude-code)中给出了为此模式供数据的 `~/.claude/settings.json` 条目。

### 命令参考

```text wt-command-reference
wt list statusline - Single-line status for the current worktree

Usage: wt list statusline [OPTIONS]

Options:
      --format <FORMAT>
          Output format

          Possible values:
          - table
          - json
          - claude-code: Claude Code statusline mode (reads context from stdin)

          [default: table]

  -h, --help
          Print help (see a summary with '-h')
```

<!-- END AUTO-GENERATED -->
