---
title: "参与贡献 gstack"
---


感谢你想让 gstack 变得更好。无论你是在技能提示里修一个错别字，还是在搭建一个全新的工作流，本指南都能让你快速上手。

## 快速开始

gstack 技能是 Claude Code 从 `skills/` 目录发现的 Markdown 文件。通常它们住在 `~/.claude/skills/gstack/`（你的全局安装）。但你开发 gstack 本身时，希望 Claude Code 用的是*你工作树里*的技能——这样编辑立即生效，不用拷贝或部署。

这就是 dev mode 做的事。它把你的仓库符号链接进本地 `.claude/skills/` 目录，让 Claude Code 直接从你的检出读技能。

```bash
git clone https://github.com/garrytan/gstack.git && cd gstack
bun install                    # install dependencies
bin/dev-setup                  # activate dev mode
```

（译注：克隆后 `bun install` 装依赖、`bin/dev-setup` 激活 dev mode。）

`./setup` 单独运行只装生产依赖。`bin/dev-setup` 额外装上测试与评测需要的开发工具链（Claude Agent SDK、TypeScript 与 Prettier），并用 `git config gstack.contributor true` 把克隆标记为贡献者的。被标记的克隆里后续 `./setup` 也跑完整安装，工具链保持 `bun.lock` 的版本。未标记的克隆里 `./setup` 退回生产依赖——v1.91.231.0 之前做的安装就是这样丢掉它们从不需要的工具链。如果你跑的是裸 `bun install` 而不是 `bin/dev-setup`，跑一次 `git config gstack.contributor true`，或单次运行设 `GSTACK_CONTRIBUTOR=1`。

> **完整克隆对浅克隆**。README 的用户向安装用 `--depth 1` 求快。作为贡献者，用完整克隆（不带 `--depth`）——`git log`、`git blame`、`git bisect`、以及对照旧版本评审 PR 都需要历史。如果照 README 已经有了 `--depth 1` 克隆，用 `git fetch --unshallow` 升级成完整克隆。

### 第一个免费检查（无 API key、无浏览器）

```bash
bun install --frozen-lockfile
bun run typecheck        # expect no output and exit 0 (about a second)
bun run typecheck:test   # expect "test typecheck ratchet: N known diagnostics, none new."
```

（译注：typecheck 应无输出且退出码 0、约一秒；typecheck:test 应打印"N 条已知诊断、无新增"。）

`typecheck` 覆盖产品代码（`browse/src`、`lib`、`scripts`、`bin`、`hosts` 及 `tsconfig.json` 的其他条目）且必须保持零错误。`typecheck:test` 把测试代码约束在提交的 `scripts/typecheck-test-baseline.json`：新的或重复的诊断都失败并点名文件、TS 码与消息；修好诊断也会失败，直到你用 `bun run typecheck:test --write-baseline` 锁进更小的额度。在改 `lib/cso/*.ts`？提交前跑 `bun run format:cso`；CI 跑 `format:cso:check`。三者都在必需的 `free-tests` 检查里。

现在编辑任意 `SKILL.md`，在 Claude Code 里调用它（如 `/review`），看着你的改动实时生效。开发完之后：

```bash
bin/dev-teardown               # deactivate — back to your global install
```

## 运营自我改进

gstack 自动从失败中学习。每个技能会话结束时，agent 复盘哪里出了问题（CLI 错误、走错的路、项目怪癖），把运营学习记进 `~/.gstack/projects/{slug}/learnings.jsonl`。后续会话自动浮出这些学习，所以 gstack 在你的代码库上随时间越来越聪明。

无需设置。学习自动记录。用 `/learn` 查看。

### 贡献者工作流

1. **正常使用 gstack**——运营学习自动捕获
2. **查看你的学习**：`/learn` 或 `ls ~/.gstack/projects/*/learnings.jsonl`
3. **Fork 并克隆 gstack**（如果还没做）
4. **把你的 fork 符号链接进撞到 bug 的项目：**
   ```bash
   # In your core project (the one where gstack annoyed you)
   ln -sfn /path/to/your/gstack-fork .claude/skills/gstack
   cd .claude/skills/gstack && bun install && bun run build && ./setup
   ```
   Setup 创建逐技能目录、内含 SKILL.md 符号链接（`qa/SKILL.md -> gstack/qa/SKILL.md`），把每个技能的运行时资产（sections/、templates、checklists——SKILL.md、测试、构建产物与 `.tmpl` 源之外的一切）链在旁边，并询问你的前缀偏好。传 `--no-prefix` 跳过提示用短名。
5. **修 issue**——你的改动在这个项目里立即生效
6. **用真实使用来测试**——做那件烦你的事，验证它修好了
7. **从你的 fork 开 PR**

这是最好的贡献方式：在你真实的工作里、在真正感到疼痛的项目里修 gstack。

**CI 对 fork PR 做什么**。GitHub 绝不给 fork PR 本仓库的密钥，所以 CI 跑一切不需要密钥的东西：必需的 `free-tests` 检查（Linux 免费套件、typecheck、macOS 与 Windows 门）、Windows Smoke、Skill Docs Freshness、Workflow Lint、Version Gate、Quality gate、make-pdf gate，以及你的改动触及的路径触发门。E2E Evals 仍从你的 `Dockerfile.ci` 构建 CI 镜像但不发布，并跳过需要提供方 API key 的付费评测作业。那个跳过是预期的、不挡你的 PR。它也不是通过：维护者从本仓库的分支跑付费评测后才合并。首次贡献者的运行要等维护者批准。

### 会话感知

同时开着 3 个以上 gstack 会话时，每个问题都会告诉你哪个项目、哪个分支、正在发生什么。不用再盯着问题想"这是哪个窗口来着？"格式在所有技能间一致。

## 在 gstack 仓库里开发 gstack

当你编辑 gstack 技能又想在同一个仓库里用 gstack 实测它们时，`bin/dev-setup` 搞定接线。它创建指回你工作树的 `.claude/skills/` 符号链接（gitignored），让 Claude Code 用你的本地修改而不是全局安装。

```
gstack/                          <- your working tree
├── .claude/skills/              <- created by dev-setup (gitignored)
│   ├── gstack -> ../../         <- symlink back to repo root
│   ├── review/                  <- real directory (short name, default)
│   │   └── SKILL.md -> gstack/review/SKILL.md
│   ├── ship/                    <- or gstack-review/, gstack-ship/ if --prefix
│   │   └── SKILL.md -> gstack/ship/SKILL.md
│   └── ...                      <- one directory per skill
├── review/
│   └── SKILL.md                 <- edit this, test with /review
├── ship/
│   └── SKILL.md
├── browse/                      <- /browse skill + gstack's own browser engine (the fallback)
│   ├── src/                     <- TypeScript source
│   └── dist/                    <- compiled binary (gitignored)
├── lib/
│   ├── aside-render.ts          <- local-HTML rendering: Aside first, browse engine fallback
│   └── design-catalog.ts        <- typed design anti-pattern catalog; review/design-checklist.md is generated from it
├── bin/
│   └── gstack-render.ts         <- the CLI skills call to render a local HTML file
└── ...
```

Setup 在顶层创建真实目录（非符号链接）、内含 SKILL.md 符号链接，外加指向每个技能运行时资产（sections/、templates、checklists）的链接。别名技能（`_gstack-command`、`connect-chrome`）以改写副本安装、绝不做符号链接——编辑符号链接的别会损坏生成源。这确保 Claude 把它们发现为顶层技能而不是嵌套在 `gstack/` 下。名字取决于你的前缀设置（`~/.gstack/config.yaml`）。短名（`/review`、`/ship`）是默认。偏好命名空间名（`/gstack-review`、`/gstack-ship`）就跑 `./setup --prefix`。

## 日常工作流

```bash
# 1. Enter dev mode
bin/dev-setup

# 2. Edit a skill template (SKILL.md files are generated — edit the .tmpl)
vim review/SKILL.md.tmpl
bun run gen:skill-docs   # or: bun run dev:skill (watch mode, auto-regen on change)

# 3. Test it in Claude Code — changes are live
#    > /review

# 4. Editing browse source? Rebuild the binary
bun run build

# 5. Done for the day? Tear down
bin/dev-teardown
```

（译注：进 dev mode；编辑技能模板（SKILL.md 是生成的——改 .tmpl）并重新生成；在 Claude Code 里实测（改动实时生效）；改了 browse 源码就重建二进制；收工时拆掉 dev mode。）

### dev 工作区里的 brain 感知块（已装 gbrain）

gbrain 已安装且可用（`bin/gstack-gbrain-detect --is-ok` 退出码 0）时，`bin/dev-setup` 保持你被跟踪的 `SKILL.md` 为权威版本，并把 brain 感知变体（`GBRAIN_CONTEXT_LOAD` / `GBRAIN_SAVE_RESULTS` 块）渲染进 `.claude/gstack-rendered/`（gitignored、每工作区一份）。它随后把工作区的 `SKILL.md` 符号链接重指向该渲染，所以你的 Claude 会话获得完整 gbrain 体验、`git status` 保持干净。底层上，dev-setup 对嵌套的 `./setup` 内联传 `GSTACK_SKIP_GBRAIN_REGEN=1`（所以它绝不弄脏被跟踪源），并跑 `gen:skill-docs:user --out-dir .claude/gstack-rendered`——它只把 section 基路径改写为指向该渲染。`bin/dev-teardown` 移除该渲染。要让这些块在你*其他*项目的 Claude 会话里生效，跑 `gstack-config gbrain-refresh`：它把它们渲染到用户渲染目录（`${GSTACK_USER_RENDER_DIR:-~/.gstack/render/claude}`，渲染成功才换入）并经 `gstack-relink` 把已安装技能重指向它——全局安装检出保持 git 干净，且刷新带守卫、绝不碰符号链接的或非 gstack 的目录。

## 测试与评测

Codex 评测与 GPT benchmark 适配器默认 `gpt-6-astra`：显式模型 > `GSTACK_CODEX_MODEL` > 默认。被测 Claude 模型（capture）默认 `claude-opus-5-5`、评审模型（judge）默认 `claude-fable-5-1`，经 `lib/eval-model.ts` 解析。被测模型换人时评审模型不动，因为它的标定 fixture 与它绑定：

- Claude 会话、PTY、Agent SDK 评测运行器与 Claude benchmark 适配器：显式模型 > `EVALS_MODEL` > `GSTACK_EVAL_MODEL_CAPTURE` > `GSTACK_EVAL_MODEL` > 默认。
- 共享评审调用（含 benchmark 质量打分）：显式模型 > `GSTACK_EVAL_MODEL_JUDGE` > `GSTACK_EVAL_MODEL` > 默认。`EVALS_MODEL` 只作用于 capture 运行器，不作用于评审。

预热保持 `claude-haiku-4-5`；蒸馏保持 `claude-haiku-4-5-20251001`。显式测试与历史 benchmark 模型选择仍然优先。这些评测默认独立于[运行时模型层级](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md)钉定；层级新鲜度工作流不自动发现或更改评测模型。下方付费运行成本是默认值变更前的历史估算，不是新默认的实测。

### 我该跑哪条命令？

| 我想…… | 命令 | 成本 / 时间 | 需要 |
|---|---|---|---|
| 快速检查一个普通编辑 | `bun run test:quick` | 免费、约一分钟 | Bun 1.4.2 |
| 修复期间跑单个免费测试文件 | `bun test <file>` | 免费、秒级 | 套件绝不裸跑 `bun test` |
| 发布前跑完整免费验收 | `bun run test` | 免费、几分钟 | Bun 1.4.2 |
| 从小机器跑完整免费套件 | `bun run test:ubicloud` | 计费 16-vCPU VM 上的免费套件、约 5 分钟 | `UBICLOUD_API_KEY`、`UBI_OWNER` |
| 8 核以下机器上从 CI 清预门禁测试档——gstack 的默认（[CI 搬运](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#ci-carry)） | 推送、`gstack-ci-carry wait --base main`，然后 `gstack-pregate --allow-repo-commands`（落后于 main 的分支先跑 `gh workflow run free-tests.yml --ref <branch>`） | 免费；复用你推送树上的绿色 Free Tests 运行 | 已推送分支、`gh` |
| 无 CI 运行覆盖你的树时在 8 核以下机器清测试档（[远程门禁](https://github.com/garrytan/gstack/blob/main/docs/pregate.md#remote-gate)，选择性开启） | `gstack-pregate --stage tests --remote --spend-cap 2 --timeout 2700 --allow-repo-commands`（同一命令，带键或不带键） | 带键：一台计费 16-vCPU VM，整个免费档约 7 分钟 $0.06、最坏 $0.38；无键：免费、本地并行分片、只适合小选组（98 个文件 4 核 103 秒） | 带键：`UBICLOUD_API_KEY`、`UBI_OWNER`；无键：无 |
| 跑策展的 Windows 安全子集 | `bun run test:windows`（CI：六个 `windows-latest` 作业、main 上每晚；PR 跑更短的 `windows-smoke` 检查，碰路径/文件名/进程代码的 PR 还会在 `Windows Scoped Tests` 里跑其改动的 Windows 安全测试文件） | 免费 | Windows、Git Bash |
| 在 Windows CI 上重跑选定的 Windows 安全测试文件 | `gh workflow run windows-scoped-tests.yml --ref <branch> -f files='<file> <file>'`（文件从 `bun run test:windows --list` 挑） | 免费 CI runner | 已推送分支、有工作流权限的 `gh` |
| 刷新 Windows 时长种子 | `gh workflow run windows-free-tests.yml --ref <branch> -f record_durations=true`，然后提交 `free-test-durations-windows` 工件 | 免费 CI runner | 已推送分支、有工作流权限的 `gh` |
| 跑原生 Windows 资格战役 | `gh workflow run native-qualification.yml --ref <branch> -f mode=<mode>`（[模式](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#windows-free-lane)） | 免费 CI runner | 已推送分支、有工作流权限的 `gh` |
| 预览我的 diff 选中哪些付费用例 | `bun run eval:select`（PR profile；`--profile full` 为朴素 touchfile 选择） | 免费 | — |
| 预览 CI 付费分片计划 | `bun run scripts/test-paid-shards.ts --tier periodic --list --slice-budget 420 --jobs 2`（按 diff 选择；`EVALS_ALL=1` 列全部） | 免费 | — |
| 为我的改动跑付费覆盖（agent：分离式） | `bun run eval:bg:pr`（前台：`bun run test:pr`） | 只花所选用例的 API 费；分发到 CI 时约 10 分钟 | 分发：干净已推送的 HEAD 与 `gh`。本地回退：`ANTHROPIC_API_KEY`、Claude Code CLI、普通终端 |
| 发布前跑完整门禁 + 周期清点 | `bun run eval:bg:release`（前台：`bun run test:release`） | 最大 API 花费；本地运行至多 4 小时 | 同上 |
| 跑单个付费层级 | `bun run test:gate:sharded` / `bun run test:periodic:sharded`（分离式：`eval:bg:gate` / `eval:bg:periodic`） | 该层级的 API 花费 | 同上 |
| 把单个付费用例跑成它的 CI 面板 | `bun run scripts/test-paid-shards.ts --tier <tier> --case <case-id> --trials 3` | 该用例的 API 花费 | 同上 |
| 在分支的 CI 上验证门禁用例 | `gh workflow run evals.yml --ref <branch> -f evals_all=true` | CI runner + API 花费 | 已推送分支、有工作流权限的 `gh` |
| 在分支的 CI 上验证周期用例 | `gh workflow run evals-periodic.yml --ref <branch>`（仅周期车道） | CI runner + API 花费 | 已推送分支、有工作流权限的 `gh` |
| 在分支上验证周期用例加每周门禁清点 | `gh workflow run evals-periodic.yml --ref <branch> -f include_gate_census=true` | CI runner + API 花费 | 已推送分支、有工作流权限的 `gh` |
| 跑选择性开启的 ML、gitleaks 与 Swift 检查 | `gh workflow run platform-qualification.yml --ref <branch>` | 免费 CI runner | 已推送分支、有工作流权限的 `gh` |
| 把一个模块配置组渲染成评测组（[配置组](https://github.com/garrytan/gstack/blob/main/docs/loadouts.md)） | `bin/gstack-modules render --host claude --modules full,-section:<skill>/<id> --out-dir <dir>`（对照组用 `--loadout full`） | 免费、每宿主约一秒 | Bun 1.4.2 |
| 看某模型拿到哪个配置组，或按 Capy 的方式发布它（[配置组](https://github.com/garrytan/gstack/blob/main/docs/loadouts.md#how-gstack-picks-a-loadout)） | `bin/gstack-modules resolve --model <id>`；`bin/gstack-modules install --model <id> --full-root ~/.claude/skills --store <dir>` | 免费、一秒内 | Bun 1.4.2 |
| 查看本地评测历史 | `bun run eval:list` / `eval:compare` / `eval:summary` | 免费 | 本地评测历史 |
| 看某用例近几周运行的通过率 | `bun run eval:pass-rates --case <case-id>` | 免费 | 有仓库读权限的 `gh` |
| 单测一个红用例对照 ship 门槛（MEETS 9/10） | `bun run scripts/ship-measure.ts measure --case <case-id> --round baseline`（[门槛](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#ship-measure)） | 10 次试验（行为类 12 次）的 API 花费；单试验超 $2 先问、单用例 $25 止步 | 同付费覆盖 |
| 测 main 最 flaky 的门禁用例（每周清扫） | `gh workflow run eval-sweep.yml --ref main [-f k=5] [-f cap_usd=150] [-f dry_run=true]`，或本地 `bun run scripts/ship-measure.ts sweep --dry-run`（[清扫](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#ship-measure-sweep)） | 每 7 天至多 $150 API 花费（`ship_measure_sweep_budget_usd`）；`--dry-run` 免费 | 有仓库读权限的 `gh`；CI 分发需工作流权限 |
| 回放付费门禁花了什么、以及每种选择或列车策略本会花多少（[回放](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#replay-gate-cost)） | `bun run scripts/gate-cost-replay.ts --runs <完整门禁运行 id> --since <日期> --until <日期>`（筛查数字印为 screen-provisional、T2 落地前为启发式） | 免费；`gh` 读取、缓存在 `.context/gate-cost-cache` | 有仓库读权限的 `gh` |
| 看审计成功指标与每周健康 | `bun run test:health [--since-days 7] [--json] [--enforce]` | 免费；5–20 分钟 `gh` 读取 | 有仓库读权限的 `gh` |

旧命令名列在[已退役命令](#已退役命令)下。

### 设置

开发与测试需要 Bun 1.4.2+；CI 钉定并测试 1.4.2。更早的 Linux 版本会在子进程垃圾回收期间关闭无关的活文件描述符，造成间歇性的浏览器与 HTTP fixture 失败（[上游诊断](https://github.com/oven-sh/bun/issues/34785#issuecomment-5020318035)）。

```bash
# 1. Copy .env.example and add your API key
cp .env.example .env
# Edit .env → set ANTHROPIC_API_KEY=sk-ant-...

# 2. Install deps (if you haven't already)
bun install
```

Bun 自动加载 `.env`——无需额外配置。Conductor 工作区自动从主 worktree 继承 `.env`（见下方"Conductor 工作区"）。

### 测试分层

功能 QA 变更需要原生 fixture 证据加提示检查。在隔离的临时仓库里、本检出之外，添加声明的 CLI 或回环 API/worker 契约。演练成功与异常路径、持久效果与安装失败。只报告的评测必须保留可变更的工具并独立检测被禁的写入，包括先改后还的编辑；干净的最终 diff 不够。付费运行之前先用故意坏的对照组验证观察者。

探索性回归要保留真实的修复前失败、修复后通过、原始探针与相邻 happy path。自动调用方测试必须经 review/ship 进入，而不是让 agent 去跑被测组件。文档测试必须证明真实子进程完成且父进程在发布前用上了它的结果；现有的只分发测试是更窄的证据。把新用例与全部消费的 section/resolver 输入登记进 touchfiles、tiers 与 PR profile 让它们跑起来。报告问题时共享脱敏的复现命令与 fixture 证据，绝不共享凭据、私有载荷或整份未评审的 agent 转录。

| 层级 | 经由 | 测什么 |
|------|--------------|---------------|
| 1——静态 | `bun run test`（免费） | 命令校验、快照旗标、Aside 契约钉、渲染包装器选项映射、SKILL.md 正确性、TODOS-format.md 引用、可观测性单测 |
| 2——E2E | 分片付费运行器（`bun run eval:bg:pr`、`eval:bg:release`） | 经 `claude -p`、PTY 与 Agent SDK 会话的完整技能执行 |
| 3——LLM 评审 | 付费用例内部，经 `test/helpers/llm-judge.ts` | 模型给付费运行的产物打分 |

命令从[我该跑哪条命令？](#我该跑哪条命令)挑。

PR 付费门禁用显式的短行为 profile。每个被选中的质量评审仍在其中；清单把推迟的行为与通过分开列。未知源依赖恢复完整门禁；作业摘要点名导致它的每个文件及其修法（[PR 付费车道回退](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#pr-paid-lane-fallback)）。没有登记覆盖的新 prompt 在规划期失败。已知宽行为在其 prompt 变更时保持显式推迟；它们不会静默获得 PR 通过分。完整门禁与周期清点每周新鲜跑、也在手动分发 `evals-periodic.yml` 时跑；`bun run eval:bg:release` 两者都跑。因此一些宽行为失败会在 PR 门禁之后才发现。

阻断性付费车道（PR 门禁与每周周期 + 门禁清点）目标是含安装的中位数约 10 分钟。规划器把记录的墙钟时间（`scripts/paid-test-durations.json`、按层）打进工作所需的 7 分钟（420 秒）runner、每个一文件或一组紧包的文件；用例短但总量长的文件一用例一 runner。矩阵规模与各 runner 的作业超时出自该计划，所以挂住的 runner 在自己的天花板内失败。免费预览用 `bun run scripts/test-paid-shards.ts --tier periodic --list --slice-budget 420 --jobs 2`。完整的端到端流程属于 `marathon` 层（`describeE2ETier('marathon')`），只在非阻断的 `evals-marathon.yml` 车道（每周与分发）跑、绝不挡合并。

裁决：付费评测绝不重试，唯一例外是门禁对红用例裁决在同一 head 上的一次不稳定重跑（[不稳定重跑](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#flaky-reruns)）。每个用例在 `E2E_KINDS`（`test/helpers/touchfiles-data.ts`）里的类别在运行前固定其试验次数，出自 `EVAL_POLICY`（`test/helpers/periodic-exclude-data.ts`）的常量：

- `rule`（默认）：一次试验；任何断言失败即用例失败。当没有随机因素决定裁决、或裁决检查产品每次运行必须满足的契约时用它（规划模式不写、决策前先问、技能强制步骤、无密钥泄漏）。
- `behavior`：3 次独立试验的并行分片面板，2 次及以上通过且无契约违例（`expectContract()`）即 PASS。只在活模型选择决定裁决、偶尔偏离是可接受的产品行为时用；一行理由进 `BEHAVIOR_WHY`。
- `judge`：LLM 评审给固定输入打分；同一 prompt 恰 3 份采样，每维度按其中位数门控、至少 2/3 采样、对照不变的阈值（布尔按多数；均值只报告）。出错的样本让面板失败且绝不重采样。

超时、崩溃或基础设施失败的试验计为失败试验并带其类别报告；缺试验使用例 INCOMPLETE、车道失败。2/3 通过报告为 `PASS 2/3` 附失败试验的原因，绝不是干净的通过。用例预算与阈值在此策略下从不改变。隔离（`CASE_QUARANTINE`）与历史见 `docs/TESTING_INTERNALS.md`；`bun run eval:pass-rates --case <id>` 显示用例的逐试验通过率与 Wilson 区间。

**清点变红了**？照 [docs/evals/census-red.md](https://github.com/garrytan/gstack/blob/main/docs/evals/census-red.md) 做：读红行、用 `bun run eval:pass-rates --run <id>` 查其证据、看 `--reds` 与 `--headroom`、用免费回归测试修复，然后才花一次付费运行跑该行的 `after a repair:` 命令。`main` 上的红清点报在每周追踪 issue；分支上分发的清点把同样报告写进其运行摘要与 `census-report` 工件。

质量评审永远新鲜跑。只跑一次的 PR profile E2E 分片（无重试，所以通过可证为首试）在同一 PR 内当全部消费输入逐字节相同时复用通过：测试的 import 闭包、其登记用例的 touchfiles 与全局 touchfiles 命中的每个被跟踪文件、runner 与工作流、子进程的 EVALS_/GSTACK_/CLAUDE_/ANTHROPIC_ 环境（只看密钥有无）、CI 镜像与 Claude CLI 版本（`scripts/e2e-shard-reuse.ts`）。计算出的用例登记或匹配不到任何东西的 touchfile 模式保持分片新鲜。每周清点、marathon 与 release 车道绝不复用。本地运行保持新鲜，除非提供完整的受限缓存与运行时配置。键包含完整 prompt 字节、生成输入、fixture、runner/评分代码、已装依赖、模型设置与运行时。现有断言对复用的分数再验一次。记录保留原始运行、修订与时间；复用从不续期那个时间。失败、重试、部分或未知输入的结果不能复用。`EVALS_FRESH=1` 绕过复用；周期与发布运行总是绕过。

时延目标：编辑反馈一分钟内、典型 PR 检查 3–5 分钟、隔离 CI 机器上的完整免费测试执行 60–90 秒。它们是目标，不是超时削减或保证。完整本地套件用可用 CPU 亲和性，Linux 至多 16 worker、macOS 与 Windows 六个；更短的编辑回路用 `test:quick`。小开发机、容器或云沙箱上，`bun run test:ubicloud` 改在全新 16-vCPU Ubicloud VM 上以 CI 车道环境跑完整套件（端到端约四分半，含 VM 启动与安装）。下方历史六 worker 结果与[四核组合对比](https://github.com/garrytan/gstack/blob/main/docs/TEST_PORTFOLIO.md#measurement-contract)是特定机器的测量。CI 安装、构建与排队时间单列。用 `bun run test:ubicloud --record-durations` 刷新测量（笔记本电脑录制不是可接受的种子；见[免费套件时长种子](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#free-suite-duration-seed)）；发布前用该种子与现有 `QUICK_CORE` 清单为快速反馈分类新回归。不要把未知文件分类为快、不要拿快速结果当发布验收。runner 在 `.context/free-test-logs/` 保留完整日志并在失败时解释下一步修复；详见[免费运行器恢复](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md)。完整验收时，必需的免费 CI 车道把完整清单打进隔离 runner、然后在报告成功前检查每个分片的回执。本地 worker 数保持有界以避免浏览器/进程争用。

2026-09-21 的历史测量：

| 运行 | 覆盖 | 耗时 |
|---|---|---|
| 本地编辑反馈 | 993 个免费测试文件中的 861 个 | 38 秒 |
| 本地完整免费套件 | 全部 993 文件、六 worker | 4m 35s |
| 完整 Linux CI | 全部 993 文件、20 个隔离 runner | 测试步骤合计 1m 40s；含安装与汇总 3m 7s |

2026-09-29 测试审计之后（[证据](https://github.com/garrytan/gstack/blob/main/docs/test-audit-2026-09.md)）：

| 运行 | 覆盖 | 耗时 |
|---|---|---|
| 完整免费套件，`bun run test:ubicloud`（standard-16） | 全部 857 文件、20,302 个通过的测试 | VM 上 136 秒；记录的串行测试时间 1,738 秒 |

`25030d68` 上的 [Linux CI 运行](https://github.com/garrytan/gstack/actions/runs/35642667809)含一次记录在案的成功重试。最慢测试步骤 77 秒；错峰启动拉长了完整测试跨度。典型 PR 付费门禁时延仍需在小变更上测量。显式豁免的仅免费 runner 变更不选付费工作；映射依赖优先；未知依赖保留宽回退。见[覆盖边界](https://github.com/garrytan/gstack/blob/main/docs/TEST_PORTFOLIO.md#repeated-work-removed)。

付费评测失败时，修产品或 harness，并把捕获的用例作为一行加进检测器的 owner 测试（检测器 → owner 表在 [TEST_PORTFOLIO.md](https://github.com/garrytan/gstack/blob/main/docs/TEST_PORTFOLIO.md#detector-owner-tests)）；绝不新增逐事故文件。一行是挨着其他条目的一个 `describe` 块或表条目，例如 `test/eng-first-review.test.ts` 里新的 `describe('eng-cache-writes-at', …)`，加载其 fixture 并对捕获的调用断言 `engFirstReviewAUQ`。跑 `bun test <owner-test>`，然后 `bun test test/test-of-test-ratchet.test.ts`：棘轮对任何只 import `test/` 代码的新测试文件、或读取付费测试文件源码并切片的文件失败，并点名该用的 owner 测试。

模板与生成 SKILL.md 的测试用 `test/helpers/prompt-structure.ts`（`between`、`expectTokens`、`expectAbsent`、`expectOrdered`、`expectMentions`）：机器读的 token 与步骤顺序精确匹配，安全规则按一句内的关键词共现（大小写不敏感）检查。不要钉英文句子；见[测试价值门槛](https://github.com/garrytan/gstack/blob/main/docs/test-value-bar.md)。

遵循 [AGENTS.md 的验证纪律](https://github.com/garrytan/gstack/blob/main/AGENTS.md#validation-discipline)：用聚焦检查复现已知失败、核验相邻源码与生成契约，然后跑受影响与剩余的必选评测。评审修复与发布准备做完后，在冻结的代码上跑一次完整免费套件。修复期间，聚焦检查取代每次提交前的全套件运行。

### 第 1 层：静态校验（免费）

`bun run test` 运行，它经 `scripts/test-free-shards.ts` 路由：N 个并发分片进程、严格输出契约——没有 bun 自身终端摘要行就退出的分片、或崩溃的 worker 都让运行失败，所以静默截断永远报不了绿。传 `--verbose` 转发完整子进程流；`--wall-timeout <秒>` 覆盖逐分片击杀期限。`GSTACK_FREE_JOBS=<n>` 覆盖分片数（只收数字、垃圾值大声报错），`GSTACK_FREE_RETRY_FLAKY=1` 选择性开启一次串行重试轮（面向系统调用监督的沙箱；本地默认关——开发机应该看得见 flake；必需的 CI 免费车道开启它并把每次 flake 通过上传为 `flake-ledger-<shard>` JSONL 工件；每周 test-health 运行在某文件于至少 20 次 main 运行中 flake 超过 5% 时失败，见[flake 台账](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#flake-ledger)）。在云沙箱里？每次开机跑一次 `scripts/sandbox-doctor.sh` 让套件变绿（细节见 [docs/TESTING_INTERNALS.md](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md)），或干脆用 `bun run test:ubicloud` 绕开沙箱限制。套件绝不裸打 `bun test`：它会走遍全仓库、加载付费评测文件、且错过严格分类器。无需 API key。

- **技能解析器测试**（`test/skill-parser.test.ts`）——从 SKILL.md bash 块提取每条 `$B` 命令并对照 `browse/src/commands.ts` 的命令注册表校验。抓错拼、已删命令与非法快照旗标。
- **技能校验测试**（`test/skill-validation.test.ts`）——校验 SKILL.md 只引用真实的命令与旗标、命令描述达到质量门槛。还交叉核对 AGENTS.md 与 docs/skills.md 的技能清单。
- **Aside 驱动契约**（`test/aside-driver.test.ts`）——技能里的浏览器行为对着 `scripts/resolvers/aside.ts`（`{{ASIDE_SETUP}}`）写、并在 Mac 上对真实 Aside CLI 实测。CI 跑不了 Aside，所以 Aside E2E 测试在未安装处自跳过；静态钉（探测、回退交接、同意、凭据、每脚本一流程、哨兵）才是 CI 证明的。
- **Aside 渲染包装器**（`test/aside-render.test.ts`）——钉住 `lib/aside-render.ts` 的选项映射与生成脚本，并用假 `aside`/`browse` 可执行文件密闭驱动两台引擎（探测分类、stdout 契约、回环服务器策略、失败路径、超时击杀、引擎选择与运行中回退）；实机渲染（经真实 Aside 的 PDF + 截图）只在 Aside 开着的地方跑、别处自跳过。make-pdf 的渲染门（`make-pdf/test/e2e/*-gate.test.ts`）与 `test/skill-e2e-diagram.test.ts` 与引擎无关：走解析出的任一引擎（`browserAvailable()`——Aside，或 `bun run build:gates` 编译的 browse 二进制，Linux CI 就这么干），只在两者皆无时跳过。
- **渲染 CLI**（`test/gstack-render-cli.test.ts`）——用假守护进程钉住 `bin/gstack-render.ts`（`GSTACK_SKIP_ASIDE=1` + `GSTACK_BROWSE_BIN`）：argv 守卫以用法行退出 1、`--help` 退出 0、先 `ENGINE=` 再 `OK <path>` 再围栏的 `EVAL`/`PAGE_ERRORS`、`--serve-root` 遏制、无浏览器首行、成功渲染后的提示退出。`make-pdf/test/cli-exit-codes.test.ts` 与 `make-pdf/test/setup-smoke.test.ts` 钉住 `pdf` 二进制的错误到退出码映射与 `$P setup` 的引擎报告。
- **生成器测试**（`test/gen-skill-docs.test.ts`）——测模板系统：占位符正确解析、输出含旗标的值提示（如 `-d <N>` 而非只有 `-d`）、关键命令的增强描述（如 `is` 列合法状态、`press` 列按键示例）、以及模板的 `codex_default_prompt:` frontmatter 键到达 Codex `agents/openai.yaml` 的 `default_prompt`（无键的模板保持 `Use <name> for this task.`）且没有任何宿主的 SKILL.md 渲染携带该键。
- **设计检测器、目录与 DESIGN.md**（`test/gstack-design-detect.test.ts`、`test/design-detect-contract.test.ts`、`test/design-catalog.test.ts`、`test/design-checklist-sync.test.ts`、`test/design-md.test.ts`、`test/frontend-scope.test.ts`、`test/impeccable-fixtures.test.ts`）——经 `test/fixtures/fake-impeccable.ts` 的假引擎驱动 `bin/gstack-design-detect.ts`（探测顺序、绝不执行仓库文件规则、`--changed` 目标白名单、`design_detector: off`、分析行、输出消毒），钉住目录不变量与生成的 `review/design-checklist.md`、往返 open DESIGN.md 读写器，并把真实引擎捕获（`test/fixtures/impeccable-*.json`、引擎 0.1.3）对照契约检查。`test/dom-dump-hygiene.test.ts` 经构建的 browse 二进制在真实 Chromium 页面里跑 `lib/dom-dump.js`；无二进制自跳过、CI 之外选择性开启（`GSTACK_DOM_DUMP_HYGIENE=1`）。
- **层级对齐不变量**（`test/e2e-tier-alignment.test.ts`）——对 touchfiles 依赖清单点名的每个自门控 `test/skill-e2e-*.test.ts`，文件 `EVALS_TIER` 自门控必须与其在 `E2E_TIERS` 声明的层级一致。杀掉"惰性降级"这类：测试在 `touchfiles.ts` 里换了层、文件还门控在旧层、继续在错车道跑。未映射或混合层级的文件被报告、绝不静默跳过。
- **目录预算**（`test/catalog-budget.test.ts`）——给聚合发现面上限：每个技能 frontmatter `name` + `description`（每个宿主每次会话加载的东西）之和须低于 1,452 token 等价物、每技能 260 字节。计数经 `test/helpers/skill-census.ts` 的共享清点（物理文件、编写技能与注册条目——三个刻意不同的计数）。加技能？失败消息带重测 + 棘轮协议。
- **上下文预算棘轮**（`test/context-budget-ratchet.test.ts`）——对目录预算盖不住的两本 token 账设 CI 天花板：常开的全 frontmatter 聚合与每技能每次调用的急切 token（SKILL.md + 强制读取引用），经 `lib/context-bill.ts` 对照 `test/fixtures/context-budget.json` 评分。新技能没有天花板就失败；删掉的技能的天花板必须修剪。正当增长或已落地的削减：重跑 `bun test/helpers/capture-context-budget.ts` 并在同一提交里交刷新的 fixture，让这个变更在 diff 里是一个看得见的决定。
- **技能到 bin 漂移棘轮**（`test/skill-bin-drift.test.ts`）——`scripts/skill-bin-drift.ts` 静态读取技能模板、雕刻小节、references 与 Claude 宿主渲染里的每个 gstack bin 调用（绝不执行 bin），技能点名 `bin/` 里没有的 bin 或该 bin 解析器不收的旗标时以 `DRIFT_UNKNOWN_BIN` 或 `DRIFT_UNKNOWN_FLAG` 在 file:line 失败。已知漏网住在 `test/fixtures/skill-bin-drift-allowlist.json`，它只缩不涨：新发现失败，不再复现的条目也失败。单个技能用 `bun run scripts/skill-bin-drift.ts --skill <名>` 检查；解析器宽松或无用法文本的 bin 被报告、不失败。
- **依赖安全回归**（`test/dependency-security.test.ts`）——跑 `bun test test/dependency-security.test.ts` 检查解析出的 `sharp`、`adm-zip`、`qs` 与 `@hono/node-server` 版本下限、加载 Sharp、验证普通 ZIP 解压、并拒绝经目标文件或目标目录符号链接的解压。符号链接用例在 Windows 跳过。这些检查补充 OSV 扫描；不改变其既有豁免。

### 第 2 层：经 `claude -p` 的 E2E

以 `--output-format stream-json --verbose` 把 `claude -p` 拉成子进程、流式读 NDJSON 拿实时进度、扫浏览器错误。这是最接近"这技能端到端真的能用吗"的东西。

```bash
# Must run from a plain terminal — can't nest inside Claude Code or Conductor
EVALS_RUN_ID="local-$(bun -e 'console.log(crypto.randomUUID())')" EVALS=1 bun test test/skill-e2e-*.test.ts
```

（译注：必须从普通终端跑——不能嵌在 Claude Code 或 Conductor 里。）

- 由 `EVALS=1` 环境变量门控（防误触发昂贵运行）
- 在 Claude Code 内运行时自跳过（`claude -p` 嵌不进去）
- API 连通预检——ConnectionRefused 时烧预算之前快速失败
- stderr 实时进度：`[Ns] turn T tool #C: Name(...)`
- 保存完整 NDJSON 转录与失败 JSON 供调试
- 测试住在 `test/skill-e2e-*.test.ts`（按类别拆分），runner 逻辑在 `test/helpers/session-runner.ts`

每次调用提供新的 `EVALS_RUN_ID`，包括下面的分离运行。功能 QA 与文档用例没有它拒绝验收。CI 提供自己的运行/尝试/作业/分片身份；保留的原生捕获工件见[测试内幕](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md)。

**默认密闭**。每个 E2E 运行器（claude -p、真 PTY 规划模式运行器、Agent SDK 运行器，加 codex 与 gemini 运行器）经 `test/helpers/hermetic-env.ts` 拉起子进程：白名单洗净的环境、全新播种的 `CLAUDE_CONFIG_DIR`、临时 `GSTACK_HOME`、`--strict-mcp-config`。你的操作者 `~/.claude` 配置、MCP 服务器（gbrain、Conductor）、技能、`~/.gstack` 决策日志与 `CONDUCTOR_*` 环境绝不漏进子进程。`GITHUB_` 与 `EVALS_` 前缀规则保留 CI 元数据但拒绝凭据形状的名字，如 `GITHUB_TOKEN`、`GITHUB_PERSONAL_ACCESS_TOKEN`、`GITHUB_APP_PRIVATE_KEY`。筛子读每个下划线分隔段，所以尾部修饰词带不过名字（`GITHUB_APP_PRIVATE_KEY_BASE64`、`GITHUB_TOKEN_1`），而仅含凭词的段保持元数据（`GITHUB_PATH`、`GITHUB_TOKENIZER`）。具名提供方认证、runner `extraAllow` 条目与逐测试覆盖是有意的例外；基于名字的规则认不出赋给任意元数据名的密钥。这让本地评测信号与 CI 一致，而不是因与被测代码无关的原因互不一致。密闭 `CLAUDE_CONFIG_DIR` 默认不播种技能；要打 `/skill` slash 命令的 PTY 测试向 PTY 运行器传 `seedSkills: true`，它换入 `hermeticSkillsConfigDir()`——一个播种的技能注册表，符号链接**活**工作树的 SKILL.md 文件（设计如此：被测的正是技能，快照会量到过期副本）。设 `EVALS_HERMETIC=0` 对你的真实操作者状态调试（这也会去掉 `--strict-mcp-config`）。接线由 `test/hermetic-wiring.test.ts`（免费静态绊线）、`test/skill-e2e-hermetic-canary.test.ts` 的两个门级隔离金丝雀、以及 `test/hermetic-skills-seeding.test.ts` / `test/pty-skill-seeding-wiring.test.ts` 的技能播种绊线钉住。

### E2E 可观测性

E2E 测试运行时在 `~/.gstack-dev/` 产机读工件：

| 工件 | 路径 | 用途 |
|----------|------|---------|
| 心跳 | `e2e-live.json` | 当前测试状态（逐工具调用更新） |
| 部分结果 | `evals/_partial-e2e.json` | 已完成测试（扛 kill） |
| 进度日志 | `e2e-runs/{runId}/progress.log` | 只追加文本日志 |
| NDJSON 转录 | `e2e-runs/{runId}/{test}.ndjson` | 每测试的原始 `claude -p` 输出 |
| 失败 JSON | `e2e-runs/{runId}/{test}-failure.json` | 失败时的诊断数据 |

**实时进度**：分离运行的日志在 `~/.gstack-dev/eval-runs/` 下流式打出每个分片落地的结果；CI 运行用 `gh run watch <run-id>`。逐测试进度在各分片的 `progress.log`。

**评测历史工具：**

```bash
bun run eval:list            # list all eval runs (turns, duration, cost per run)
bun run eval:compare         # compare two runs — shows per-test deltas + Takeaway commentary
bun run eval:summary         # aggregate stats + per-test efficiency averages across runs
bun run eval:pass-rates      # per-case trial pass rates + Wilson intervals from recent weekly runs (--case, --runs, --dir, --backfill, --json, --gate)
bun run eval:pass-rates --reds       # verdict reds per census by failure class and cause, all-green probability
bun run eval:pass-rates --headroom   # slowest session per case vs its armed budget (alarm above 85% in --gate)
bun run eval:pass-rates --run <id>   # one census's reds with their values and fetched transcript evidence
```

**面向 agent 与长套件的分离运行**。agent（或不想盯运行的你）发起长评测时，用 `eval:bg:*` 脚本（`scripts/eval-bg.ts`）。各自选后端并打印：

- **dispatch**（干净 HEAD 已推送 garrytan/gstack、有 `gh`）：CI 在那个确切修订上跑车道，本地日志跟随运行；
- **local**（其他一切，或 `--local`）：本机跑分片付费运行器，上限 ceil(1.5 × 计划串行秒 / `EVALS_JOBS`) + 20 分钟、至多 4 小时（`--timeout 秒` 覆盖）。

两者都经 `bin/gstack-detach` 跑：逃离轮界 SIGTERM 的新会话、挡空闲休眠的 `caffeinate` 包装、机器级 `gstack-evals` 锁（并发 worktree 排队而不是打满模型 API）、`~/.gstack-dev/eval-runs/` 下按运行的日志、以及保证出现的 `### gstack-detach EXIT=<code> ###` 哨兵——轮询者绝不把沉默误当成功。`bun run scripts/eval-bg.ts --help` 列旗标，`bun run scripts/eval-bg.ts status <日志或运行 id>` 重连运行。

```bash
bun run eval:bg:pr           # changed coverage (CI: evals.yml, evals_all=false)
bun run eval:bg:release      # fresh full gate + periodic (CI: both workflows)
bun run eval:bg:gate         # gate tier (CI: evals.yml, evals_all=true)
bun run eval:bg:periodic     # periodic tier (CI: evals-periodic.yml)
```

本地后端经分片付费运行器跑（`scripts/test-paid-shards.ts`，也直接可用 `bun run test:gate:sharded` / `bun run test:periodic:sharded`）：每测试文件一个 Bun 进程、杀整个分片进程组的外部墙钟超时（含走失的 `claude`/`codex` 孙进程）、逐分片评测目录（`GSTACK_EVAL_DIR=<evalDir>/shards/<slug>/`）、以及区分失败对超时对从未启动的聚合。runner 还按 diff 选择：你的分支没碰的分片报 skipped-by-diff，选择横幅点名原因（`EVALS_ALL=1` 强制全部）。`EVALS_JOBS` 设同时跑的分片进程数（默认 8；`test:pr` 设 2）；`EVALS_CONCURRENCY` 是 bun 在分片**之内**的并发（默认 2）——它们是刻意分开的旋钮。`eval:list`、`eval:compare`、`eval:summary` 与 `eval:pass-rates` 都感知分片。人在自己终端前台跑 `bun run test:pr` 不需要这些——那里 Ctrl-C 是有意的。

**评测对比评注**：`eval:compare` 生成解读两次运行之间变化的大白话 Takeaway 小节——标回归、记改进、点效率收益（更少轮次、更快、更便宜）、给整体总结。由 `eval-store.ts` 的 `generateCommentary()` 驱动。

工件从不清理——在 `~/.gstack-dev/` 累积供事后排查与趋势分析。

### 第 3 层：LLM 评审

没有任何测试让模型给技能文字打分。留下的评审模型给 agent 产出的东西打分，在各自的付费用例里（如 `test/llm-judge-recommendation.test.ts` 与 QA、设计 E2E 文件里的结果评审）。多个技能必须以同一方式陈述的事实改为免费检查，例如 `test/review-bot-history-facts.test.ts`。

评审模型默认 `claude-fable-5-1`；每次运行用 `GSTACK_EVAL_MODEL_JUDGE` 覆盖（经 `lib/eval-model.ts` 按上述顺序解析）。每个被打分维度是同一 prompt 的 3 份并发采样面板；每维度面板中位数（至少 2/3 采样）须达到该用例的阈值。出错样本让面板失败。需要 `ANTHROPIC_API_KEY`。`test/helpers/llm-judge.ts` 直接调 Anthropic API（不经 `claude -p`），所以在哪都能跑、包括 Claude Code 里。

### 付费测试 touchfiles

`test/helpers/touchfiles-data.ts` 把每个付费用例映射到选中它的文件编辑。免费 `*.test.ts` 文件绝不列入：改免费测试不跑付费评测。`test/touchfiles.test.ts` 推导每个付费文件的静态 `test/helpers` / `test/fixtures` import 闭包、加它在字符串字面量里点名的 fixture 与 helper 路径，闭包没被用例的键盖住就失败。失败时把点名路径加进点名键，用 `bun run scripts/test-paid-shards.ts --tier gate --profile pr --list` 查选择。规则是下界：测试在运行时构建的 fixture 路径它看不见，这类路径手工加进键。

### 加一个付费评测

1. **测试文件**。把用例写进付费测试文件，以字面名登记（`testIfSelected('<case-id>', ...)`），给结果（文件、git 状态、原生提问、退出状态）打分而不是措辞——除非步骤本身就是契约。契约断言包进 `expectContract()`。
2. **Touchfiles**。把 `'<case-id>': [...]` 加进 `E2E_TOUCHFILES`；`bun test test/touchfiles.test.ts` 点名缺的闭包路径。
3. **层级**。加进 `E2E_TIERS`：每个 PR 都要的廉价契约进 `gate`，长或模型质量用例进 `periodic`，完整流程进 `marathon`。
4. **类别**。加进 `E2E_KINDS`（默认 `rule`；活模型选择可接受偏离时用 `behavior` 加一行 `BEHAVIOR_WHY`）。`bun test test/eval-kinds.test.ts` 打印要加的字面量。
5. **PR profile**。PR 该跑就把它加进 `scripts/test-pr-profile.ts`，用 `bun run scripts/test-paid-shards.ts --tier gate --profile pr --list` 核对。
6. **本地试面板**。`bun run scripts/test-paid-shards.ts --tier <tier> --case <case-id> --trials 3` 在你推送之前跑 CI 同款面板。

### 已退役命令

这些 package 脚本作为一个发布的桩：各打印替代者并退出 1（`scripts/retired-command.ts`）。下个发布删除它们。

| 已退役 | 改用 | 退役原因 |
|---|---|---|
| `test:evals` | `bun run eval:bg:pr` | 无分层：跳过了所有层门控的付费文件 |
| `test:evals:all` | `bun run eval:bg:release` | 无分层：跳过了所有层门控的付费文件 |
| `test:e2e` | `bun run eval:bg:pr` | 无分层：跳过了所有层门控的付费文件 |
| `test:e2e:all` | `bun run eval:bg:release` | 无分层：跳过了所有层门控的付费文件 |
| `test:gate` | `bun run test:gate:sharded` | 单进程扇出从未跑完过一次运行 |
| `test:periodic` | `bun run test:periodic:sharded` | 单进程扇出从未跑完过一次运行 |
| `test:codex` | `bun run test:periodic:sharded` | 不设 `EVALS_TIER`，两个周期层 Codex 文件都跑了零用例 |
| `test:codex:all` | `bun run test:periodic:sharded` | 同 `test:codex` |
| `eval:bg` | `bun run eval:bg:pr` | 分离的是已退役的 `test:evals` |
| `eval:bg:all` | `bun run eval:bg:release` | 分离的是已退役的 `test:evals:all` |
| `eval:flake-rank` | `bun run eval:pass-rates` | 同一脚本的第二个名字 |
| `eval:watch` | 盯 `gstack-detach` 日志，或 `gh run watch <run-id>` | 只读无分片 runner 写的文件，分片运行什么也不显示 |
| `test:audit` | `bun run test` | `test/audit-compliance.test.ts` 已在免费套件里跑 |

### CI

一个 GitHub Action（`.github/workflows/skill-docs.yml`）在 push 到 main 与 PR 时生成全部宿主，然后拒绝被跟踪差异与未被忽略的未跟踪产物。生成错误也让作业失败。可选的忽略宿主缓存不与 Git 比较。

供应链门与它并行：

- **Quality gate**（`.github/workflows/quality-gate.yml`，每个 PR 与 push）——用 gstack 自己的脱敏引擎扫 diff 新增行的凭据（`.github/scripts/gate-secret-scan.mjs`）。HIGH 发现让作业失败；MEDIUM 发现以咨询计数浮出。扫描产不出报告则失败即关闭。还对 setup/build 边界跑 ShellCheck，并用 `bin/gstack-prose-lint CHANGELOG.md --unreleased --gate` 门 `CHANGELOG.md` 的 `## [Unreleased]` 块（autopilot 词汇、"not just X, but Y" 及它点名的其他特征；已打戳或缺席的块通过；修法见 [docs/troubleshooting.md](/troubleshooting/#prose-lint-found)）。
- **Dependency review**（`.github/workflows/dependency-review.yml`）——在碰 `package.json` 或 `bun.lock` 的 PR 上评审依赖变更，高危或严重 advisory 时失败。它与每周 OSV 扫描是依赖双门。
- **OSV scanner**（`.github/workflows/osv-scanner.yml`）——每周对照 OSV 库的漏洞扫描。配置在 `.osv-scanner.toml`、经显式 `--config` 加载（OSV 不自动发现该文件名）；每条忽略条目需要理由与 `ignoreUntil` 到期，由 `test/osv-config-wiring.test.ts` 强制。失败的 main 扫描 upsert 追踪 issue "OSV scanner: vulnerable dependency needs triage"、干净扫描关闭它；`test/osv-ignore-expiry.test.ts` 在任何 `ignoreUntil` 前 14 天失败，让将到期的压制浮出在 PR 里。
- **每周测试健康**（`.github/workflows/test-health.yml`，每周一与分发）——跑 `bun run test:health --since-days 7 --enforce`。免费测试文件在至少 20 次 main 运行中 flake 超 5%、或超过 5 个免费文件缺席时长种子时失败；失败时 upsert 一个追踪 issue，只在每个此前失败的检查都有证据且通过时关闭。读不到的指标打印 "unavailable: <原因>; next: <步骤>"、绝不让运行失败。
- **Dependabot**（`.github/dependabot.yml`）——分组依赖更新 PR。
- **OpenSSF Scorecard**（`.github/workflows/scorecard.yml`）——每周与 main push；结果在 Security 标签与 api.scorecard.dev。

- **平台资格**（`.github/workflows/platform-qualification.yml`，分发与每季）——跑没有其他车道有前置条件的选择性测试：ML 提示注入分类器（`SECURITY_BENCH=1`）、对真实 gitleaks 的记忆摄取（`GSTACK_TEST_GITLEAKS`）、DebugBridge Swift 构建（`GSTACK_TEST_SWIFT=1`，macOS）。`test/platform-qualification-workflow.test.ts` 把每道门钉到其作业。

每个工作流把第三方 action 钉到提交 SHA（`test/workflow-action-pins.test.ts`）。PR 模板（`.github/PULL_REQUEST_TEMPLATE.md`）要证据——跑过的测试、评测输出——而不是承诺。

测试直接对 browse 二进制跑——不需要 dev mode。需要 Aside 本体的（`test/skill-e2e-aside.test.ts`、Aside 的 qa/设计用例、`test/aside-render.test.ts` 的实机渲染）只在开着 Aside 应用的 Mac 上跑、别处自跳过；make-pdf 的渲染门与 `/diagram` E2E 走解析出的任一引擎，所以 CI 在它用 `bun run build:gates` 构建的 browse 二进制上跑。

## 编辑 SKILL.md 文件

SKILL.md 文件是**从 `.tmpl` 模板生成的**。不要直接编辑 `.md`——你的改动会在下次构建被覆盖。

```bash
# 1. Edit the template
vim SKILL.md.tmpl              # or browse/SKILL.md.tmpl

# 2. Regenerate for all hosts
bun run gen:skill-docs --host all

# 3. Check health (reports all hosts)
bun run skill:check

# Or use watch mode — auto-regenerates on save
bun run dev:skill
```

`skill:check` 用正式内容路径与宿主默认把全部宿主渲染进临时存储、校验完整生成内容、并把期望的被跟踪产物与检出比对。缺失、变更或未忽略的未跟踪产物都失败。本地忽略的宿主缓存（含符号链接的缓存）不动；没有它们检查器照样工作。生成失败产不出对部分产物的成功检查。

模板编写最佳实践（自然语言优于 bash 腔、动态分支检测、`{{BASE_BRANCH_DETECT}}` 用法）见 CLAUDE.md 的 "Writing SKILL templates" 节。

技能里的浏览器步骤是遵循 `scripts/resolvers/aside.ts` cookbook 的 `aside repl` 脚本，各配回退引擎的 `$B` 等价物；提交前把 Aside 形态对着 Aside CLI 跑一遍。加 browse 命令就改 `browse/src/commands.ts`。加快照旗标就改 `browse/src/snapshot.ts` 的 `SNAPSHOT_FLAGS`。然后重建。

**经 `lib/aside-render.ts` 渲染；不要在技能里捆绑 puppeteer/Chromium**。需要光栅化或打印自己的 HTML/JSON（图表、卡片、og-image、PDF）的技能从模板调 `bin/gstack-render.ts`（`--screenshot`、`--pdf`、`--eval JS --out FILE`），或在 TypeScript 里从 `lib/aside-render.ts` import `render`（`renderWithAside` / `renderWithBrowse` 是引擎专属的两半；`render` 在二者间选择，Aside 的 CLI 起不来或运行中丢 CDP 桥时在 browse 引擎上重试一次）。包装器在 Aside 开着时经 Aside 打印、否则经 `browse` 守护进程（`newtab --json`、`goto` 回环 URL、`js` 就绪轮询、`pdf --from-file`、`viewport` + `screenshot`、`js --out`、`closetab`）——每机那一个共享 Chromium、同样的旗标与 `OK <path>` 行、`ENGINE=aside|browse` 说明实际渲染者、`EVAL`/`PAGE_ERRORS` 行按不可信网页内容围栏。回环服务器服务单次渲染的密钥 URL、绝不跟随逃出其目录的符号链接。定尺寸截图在回退上为 1x（Aside 2x）；JPEG 质量与 `pageRanges`/`scale` 仅 Aside；`--landscape` 交换纸张尺寸。绝不 `npm i puppeteer`、绝不下第二个会失去版本同步的 Chromium、绝不把渲染器指向网站。包装器缺你要的选项就加进 `lib/aside-render.ts`（在 `test/aside-render.test.ts` 钉住，是 CLI 旗标就再钉 `test/gstack-render-cli.test.ts`），让每个调用方两条路都得到。导出的测试接缝：`pickEngine(fresh, deps)`（注入探测与二进制解析器）、`serveDir(root, nonce)`、`SAFE_TMP_DIR`、`PAGE_NUMBER_FOOTER`（make-pdf、`gstack-render` 与 browse `pdf` 命令共享的那一个页码页脚）。

## 每次前沿模型发布时的 prompt 审计

新的前沿 Claude 模型发布时，审计模型阅读的文字里新模型过度执行或不再需要的指令。审计工具是 Anthropic 的 `/claude-api prompt-audit`——你在自己的 Claude Code 会话里跑的技能；gstack 只打印喂什么给它。

```bash
bun run audit:manifest   # slices of templates, resolvers, overlays, CLAUDE.md and wording-pinning tests (--json for a machine-readable list)
```

1. 在 Claude Code 里以新模型为目标跑 `/claude-api prompt-audit`，一次一片，给它那片的文件清单。`s01` 是每个技能都读的共享文字（CLAUDE.md、模型 overlay、preamble resolver）；技能的模板与其 sections 共享一片。
2. 修模板与 resolver 里的发现，绝不修生成的 SKILL.md，然后跑 `bun run gen:skill-docs --host all`。
3. 把安全规则视为持有：只有当评测显示模型在改动前后都遵守时才改写某条。
4. "钉技能措辞的测试"那几片最后做。文字变了的，把精确句子钉换成结构或语义检查（CLAUDE.md 测试节的 prompt 字节规则）。
5. `test/archaeology-lint.test.ts` 把 issue 号与事故故事挡在生成文字之外；它的失败点名要修的源文件。

## 行话清单（V1 文风）

gstack 的文风节（注入每个 tier ≥2 技能的 preamble）按每次技能调用给技术术语首现加注。可加注的术语清单在 `scripts/jargon-list.json`——约 50 个策展的高频术语（幂等、竞态、N+1、背压等）。不在清单上的术语视为够直白。

**增删术语**：开 PR 编辑 `scripts/jargon-list.json`。编辑后跑 `bun run gen:skill-docs`——术语在生成时烘进每个 SKILL.md，改动重新生成后才生效。无运行时加载；无用户侧覆盖。仓库清单即事实源。

好的候选：非技术用户在评审输出里高频遇到却无上下文的高频术语（常见数据库/并发术语、安全行话、前端框架概念）。不要加只在一两个小众技能里出现的术语——性价比配不上评审开销。

## 多宿主开发

gstack 从一套 `.tmpl` 模板为 13 个宿主生成 SKILL.md。每个宿主是 `hosts/*.ts` 里的一个类型化配置。生成器读这些配置产出宿主适配的输出（不同 frontmatter、路径、工具名）。

**受支持宿主**：Claude（主）、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw、Hermes、GBrain、Copilot、Antigravity、Gemini CLI。

### 为全部宿主生成

```bash
# Generate for a specific host
bun run gen:skill-docs                    # Claude (default)
bun run gen:skill-docs --host codex       # Codex
bun run gen:skill-docs --host opencode    # OpenCode
bun run gen:skill-docs --host all         # All 13 hosts

# Or use build, which does all hosts + compiles binaries
bun run build
```

### 宿主之间变什么

每个宿主配置（`hosts/*.ts`）控制：

| 方面 | 示例（Claude 对 Codex） |
|--------|---------------------------|
| 输出目录 | `{skill}/SKILL.md` 对 `.agents/skills/gstack-{skill}/SKILL.md` |
| frontmatter | 完整（name、description、hooks、version）对最小（name + description） |
| 路径 | `~/.claude/skills/gstack` 对 `$GSTACK_ROOT` |
| 工具名 | "use the Bash tool" 对相同（Factory 改写为 "run this command"） |
| 钩子技能 | `hooks:` frontmatter 对内联安全建议文字 |
| 压制小节 | GBrain 块对 GBrain 块加 Review Army；Codex 保留路由到 Claude Code 的外部评审节 |
| 模型 overlay | `claude` 对 `gpt`（逐宿主 `defaultModel`；`--model` 或安装期 Codex `config.toml` 的模型覆盖） |
| 元数据文件 | 无 对每个技能旁的 `agents/openai.yaml`（`generation.generateMetadata`）；其 `default_prompt` 取模板的 `codex_default_prompt:` frontmatter 键，否则 `Use <name> for this task.`。该键仅生成器输入，不出现在任何宿主的 SKILL.md 渲染 |

完整 `HostConfig` 接口见 `scripts/host-config.ts`。

### 测试宿主输出

```bash
# Run all static tests (includes parameterized smoke tests for all hosts)
bun run test

# Check freshness for all hosts
bun run gen:skill-docs --host all --dry-run

# Health dashboard covers all hosts
bun run skill:check
```

### 加新宿主

完整指南见 [docs/ADDING_A_HOST.md](/adding-a-host/)。短版：

1. 创建 `hosts/myhost.ts`（从 `hosts/opencode.ts` 拷贝），含 `tier` 与 `capabilities`
2. 加进 `hosts/index.ts`
3. 把 `.myhost/` 加进 `.gitignore`
4. 跑 `bun run gen:skill-docs --host myhost`
5. 跑 `bun run test`（参数化测试自动覆盖）

渲染不需要生成器代码。安装需要：可安装宿主还要 setup 安装臂、`gstack_host_tier`（`bin/gstack-install-registry.sh`）里的行、README 宿主矩阵行、以及一致性套件（`test/host-conformance.test.ts`）。在带日期的认证记录存在之前它以 `experimental` 发布；见指南里的 "Certify your host" 与安装所有权规则。

### 加新技能

用 `/write-skill` 编写或修改技能文字（编辑阶梯、层级、`gstack-skill-bill`、漂移检查）。新增技能模板时每个宿主都渲染它；几张静态清单仍需加行：
1. 创建 `{skill}/SKILL.md.tmpl`（可选带一行 `codex_default_prompt:` frontmatter 键——Codex 选取器为该技能插入的那句话；没有则选取器拿 `Use <name> for this task.`）
2. 跑 `bun run gen:skill-docs --host all`
3. 动态模板发现为每个宿主渲染与 `gstack/llms.txt` 接上它。它填不上的两处：`lib/doctor-components.ts` 里 `SKILL_REQUIREMENTS` 的行（诊断器的 `--for <skill>` 表；`test/doctor-components.test.ts` 对没有行的技能目录失败，同一次生成重渲染 `bin/gstack-doctor-components.sh`），以及读者找到该技能的目录行（README.md、AGENTS.md、`docs/skills.md`、`docs/PROJECT_STRUCTURE.md`、根 `SKILL.md.tmpl` 路由器）
4. 预算它：跑 `bun test/helpers/capture-context-budget.ts` 并提交刷新的 `test/fixtures/context-budget.json`——上下文预算棘轮对没有天花板的技能失败；目录预算（`test/catalog-budget.test.ts`）直到按其失败消息里的协议棘轮上限才通过，数字引用在 CLAUDE.md、本文件与 `docs/CONTRIBUTOR_REFERENCE.md`
5. 提交 `{skill}/SKILL.md`（模板 `preamble-tier` ≥2 时连同生成的 `{skill}/sections/preamble.md`）；外部宿主输出在安装期生成且被 gitignore
6. 给证据台账 `docs/inventory/evidence.json` 加行（[ETHOS.md 第 9 条：赚得位置](/ethos/#9-赚得位置earn-its-place)）：前沿模型上有帮助的证据（`sources`、`models`、`prompt: preset`、`scope`、`masked: true` 与结果限制的 `caveats`），或 `status: untested` 加 `reason`、具体 `plan`（`test/fixtures/skill-evals/<skill>/tasks.json` 或 /eval-plan 预注册）、`owner` 与 `measure_by` 日期。`test/inventory.test.ts` 对没有有效行的技能失败；`bin/gstack-inventory --check` 点名问题，`bin/gstack-inventory` 刷新 `docs/inventory.md` 的带日期快照

## Conductor 工作区

用 [Conductor](https://conductor.build) 并行跑多个 Claude Code 会话时，`conductor.json` 自动接线工作区生命周期：

| 钩子 | 脚本 | 做什么 |
|------|--------|-------------|
| `setup` | `bin/dev-setup` | 从主 worktree 拷 `.env`、装依赖、链技能、非交互跑 `./setup`，且（装了 gbrain 时）把 brain 感知块渲染进 `.claude/gstack-rendered/` 而不弄脏被跟踪源 |
| `archive` | `bin/dev-teardown` | 移除技能符号链接、`.claude/gstack-rendered/` 渲染，并清理 `.claude/` 目录 |

Conductor 创建新工作区时 `bin/dev-setup` 自动跑。它探测主 worktree（经 `git worktree list`）、拷你的 `.env` 让 API key 带过去、并装好 dev mode——无需手工步骤。

`bin/dev-setup` 完全非交互地跑 `./setup`（传 `--plan-tune-hooks=prompt` 并关 stdin），所以转发的 Conductor TTY 绝不会卡在隐藏的 setup 提示上。它也绝不安装 plan-tune 的 Claude Code 钩子——一次性工作区改不动你的全局 `~/.claude/settings.json` 去指向临时 worktree 路径。要有意安装 plan-tune 钩子，在 dev-setup 之外跑 `./setup --plan-tune-hooks`（或 `gstack-config set plan_tune_hooks yes`）。显式旗标算显式决定：setup 对 AskUserQuestion 钩子的 Conductor 自动 opt-in 只在真正的静默落空时触发（无旗标、无 `GSTACK_PLAN_TUNE_HOOKS` 环境变量、无字面存在的 `plan_tune_hooks` 键，经 `gstack-config has` 核查），所以它绝不能把 dev-setup 覆盖成装钩子。一个声明的修复例外：setup 的 heal-first 轮（`gstack-settings-hook prune-stale --repoint`）可以修剪死掉的 gstack 钩子条目、把既有的重指向稳定的 `~/.claude/skills/gstack` 安装。那是严格收敛的修复、绝不是新注册，且注册本身只认正式名，所以临时树路径绝不会被烘进 settings.json。

**首次设置**：把你的 `ANTHROPIC_API_KEY` 放进主仓库的 `.env`（见 `.env.example`）。每个 Conductor 工作区自动继承。

**`GSTACK_*` 环境前缀**（Conductor 注入的键）。Conductor 显式剥掉每个工作区进程环境里的 `ANTHROPIC_API_KEY` 与 `OPENAI_API_KEY`。`.env` 拷贝路径也救不回——剥除发生在环境继承之后。想让付费评测、`/sync-gbrain` embeddings 或 `claude-agent-sdk` 调用在 Conductor 工作区可用的用户，要在 Conductor 的工作区环境配置里设 `GSTACK_ANTHROPIC_API_KEY` 与 `GSTACK_OPENAI_API_KEY`；Conductor 原样放行。gstack 侧，TS 入口以副作用 import `lib/conductor-env-shim.ts`，它在正式名为空时把 `GSTACK_FOO_API_KEY` 提升为 `FOO_API_KEY`。新增会打付费 API 的 TS 入口时，在文件顶部加 `import "../lib/conductor-env-shim";`。今天 shim 从 `bin/gstack-gbrain-sync.ts`、`bin/gstack-model-benchmark`、`scripts/preflight-agent-sdk.ts` 与 `test/helpers/e2e-helpers.ts` import。

## 需要知道的事

- **SKILL.md 文件是生成的**。改 `.tmpl` 模板，不是 `.md`。跑 `bun run gen:skill-docs` 重新生成。同一次运行从 `lib/design-catalog.ts` 生成 `review/design-checklist.md`、从 `lib/dom-dump-script.ts` 生成 `lib/dom-dump.js`：改那些源，绝不改生成文件（`test/design-checklist-sync.test.ts` 对漂移失败）。tier 2+ 技能还得到生成的 `sections/preamble.md`——`scripts/resolvers/preamble-hoist.ts` 渲染的共享 preamble：改 preamble resolver，绝不该文件。
- **TODOS.md 是统一待办**。按技能/组件组织、P0–P4 优先级。`/ship` 自动检测完成项。所有规划/评审/复盘技能读它取上下文。
- **browse、make-pdf、design 与 `lib/` 源变更需要重建**。碰了 `browse/src/*.ts`、`make-pdf/src/*.ts`、`design/src/*.ts` 或 `lib/` 下任何东西（二进制内嵌的正式 `claude-bin.ts`、`error-handling.ts`、`aside-render.ts`，加 `design-catalog.ts`——其 `MOCKUP_NEVER_NAMES` 内嵌进 design 二进制的模型稿 prompt；`browse/src` 再导出前三个）就跑 `bun run build`。`./setup` 自己也做同样判断：三个二进制缺一、或那些源/`package.json`/`bun.lock` 比 browse 二进制新时就重建（`test/setup-needs-build.test.ts` 钉住该决策）。
- **dev mode 遮蔽你的全局安装**。项目本地技能优先于 `~/.claude/skills/gstack`。`bin/dev-teardown` 恢复全局的。
- **Conductor 工作区独立**。每个工作区是自己的 git worktree。`bin/dev-setup` 经 `conductor.json` 自动跑。
- **`.env` 跨 worktree 传播**。主仓库设一次，所有 Conductor 工作区都有。
- **`.claude/skills/` 被 gitignore**。符号链接绝不进库。
- **绝不在 `setup` 里写裸 `ln -snf`**。setup 的每个链接点必须经 `IS_WINDOWS` 探测旁的 `_link_or_copy SRC DST` 辅助。辅助在 Unix 保持 `ln -snf`、在无开发者模式的 Windows 切到 `cp -R` / `cp -f`——那里裸 `ln -snf` 产出 `git pull` 后不刷新的冻结副本。`test/setup-windows-fallback.test.ts` 用静态不变量强制——辅助体之外一次裸 `ln` 调用即 CI 失败。
- **同步子 agent 分发必须声明旗标**。Claude Code 默认后台运行 Agent 工具子 agent（v2.1.198 起），所以任何分发子 agent 并消费其输出的模板步骤必须带 `run_in_background: false`。用 `{{FOREGROUND_DISPATCH_NOTE}}` 占位符（`scripts/resolvers/constants.ts`）而不是手写指引，并在同一提交把生成的携带文件加进 `test/run-in-background-guidance.test.ts` 的 `GENERATED_WITH_GUIDANCE`——其结构扫描器对缺旗标的生成分发祈使句让 CI 失败。
- **绝不删除或覆盖 setup 证明不了是 gstack 的技能条目**。setup（链接器、别名安装器、两个前缀切换清理）与 `bin/gstack-relink` 的每个破坏性站点都经所有权辅助（setup 的 `_claude_entry_is_ours` / `_claude_entry_owned_strongly`、relink 的 `_entry_is_ours` / `_entry_owned_strongly`）。退役技能修剪（`_prune_stale_generated`）经自己的门应用同样的强弱切分：真实宿主目录只有当其 SKILL.md 带生成横幅（`_owned_for_windows_refresh`）才是候选；宿主符号链接只在解析进 gstack（`_gstack_target_is_ours`）时移除；带横幅的真实目录经 `_cleanup_weak_dir` 清理；渲染树内的符号链接绝不跟随。指向 gstack 的符号链接或 `.gstack-owned` 标记证明整个目录；逐字节相同或带生成横幅的 SKILL.md 只证明那个文件，有出入的先挪到 `~/.gstack/backups/skills/<ts>/`。`test/setup-link-ownership.test.ts`、`test/setup-cleanup-orphans.test.ts`、`test/setup-prune-stale-generated.test.ts` 与 `test/relink.test.ts` 钉住它。在 TODOS.md 里立案的共享辅助落地之前，规则在两个脚本里各有一份：两处都要改。宿主渲染修剪（`bin/gstack-host-renders.sh` 的 `gstack_prune_host_renders`，#1694）对检出不服务的宿主渲染目录应用同样切分：指向检出的链接走、被证明生成的文件挪 `~/.gstack/backups/host-renders/<ts>-<id>/`、其余留下、只有清空的目录移除（`test/host-renders-prune.test.ts`）。
- **`./setup` 绝不因 Chromium 失败**。Playwright 引导（setup 第 `# 2` 节）尽力而为且有界：每次失败变成原因码（`skipped`、`chromium-install`、`chromium-install-timeout`、`chromium-install-locked`、`windows-no-node`、`windows-node-modules`、`post-install-launch`），与依赖浏览器的技能一起打印在最终摘要里，技能注册照常跑。`GSTACK_PLAYWRIGHT_INSTALL_TIMEOUT=<秒>`（默认 600）限下载；`GSTACK_SKIP_PLAYWRIGHT=1` 跳过它——无浏览器机器或 setup-only 测试循环的正确旋钮。`GSTACK_SKIP_ASIDE=1` 让浏览器摘要（如同技能的探测与渲染器）把 Aside 当缺席，所以摘要绝不承诺引导没交付的回退（`test/setup-browser-hint.test.ts`）。引导之后加的任何东西必须保持不依赖浏览器。`test/setup-playwright-best-effort.test.ts` 钉住该块。

## 在真实项目里测试你的改动

**这是开发 gstack 的推荐方式**。把你的 gstack 检出符号链接进你实际使用它的项目，改动在你做真实工作时实时生效。

### 第 1 步：符号链接你的检出

```bash
# In your core project (not the gstack repo)
ln -sfn /path/to/your/gstack-checkout .claude/skills/gstack
```

### 第 2 步：跑 setup 创建逐技能符号链接

光有 `gstack` 符号链接不够。Claude Code 经各个顶层目录（`qa/SKILL.md`、`ship/SKILL.md`……）发现技能，不是经 `gstack/` 目录本身。跑 `./setup` 创建它们：

```bash
cd .claude/skills/gstack && bun install && bun run build && ./setup
```

Setup 会问你要短名（`/qa`）还是命名空间名（`/gstack-qa`）。选择存进 `~/.gstack/config.yaml` 并被以后记住。跳过提示传 `--no-prefix`（短名）或 `--prefix`（命名空间名）。

### 第 3 步：开发

改模板、跑 `bun run gen:skill-docs`，下一次 `/review` 或 `/qa` 立即用上。无需重启。

### 回到稳定的全局安装

移除项目本地符号链接。Claude Code 回落到 `~/.claude/skills/gstack/`：

```bash
rm .claude/skills/gstack
```

逐技能目录（`qa/`、`ship/`……）里的 SKILL.md 符号链接指向 `gstack/...`，所以它们会自动解析到全局安装。

### 切换前缀模式

以一种前缀设置安装后想切换：

```bash
cd .claude/skills/gstack && ./setup --no-prefix   # switch to /qa, /ship
cd .claude/skills/gstack && ./setup --prefix       # switch to /gstack-qa, /gstack-ship
```

Setup 自动清掉旧符号链接。无需手工清理。只有 gstack 创建的条目被移除：与你重名的自有技能（比如手写的 `qa/`）留在原地并在 setup 最终摘要里点名。

### 替代：把全局安装指向一个分支

不想要逐项目符号链接的话，可以切全局安装：

```bash
cd ~/.claude/skills/gstack
git fetch origin
git checkout origin/<branch>
bun install && bun run build && ./setup
```

这影响所有项目。还原：`git checkout main && git pull && bun run build && ./setup`。

## Issue 分流

issue 处于开放、parked 或关闭；关闭意味着修复、重复或不予修复，各自理由写在关闭评论里。我们打算以后修的 issue 保持开放、挂 `parked` 标签、留一条评论说明它在哪里被跟踪（TODOS.md 主题或追踪 issue）以及什么能修好它。替维护者分流的 agent 以其 bot 身份（Capy 上的 `capy-ai[bot]`）发这些评论，绝不用维护者本人账号。Capy 上只经 `tools.pr.comment` 评论，绝不用 `gh pr comment`、`gh issue comment` 或 `gh api`——`gh` 以维护者身份运行。完整规则（含标签与关闭理由）在 [docs/triage.md](https://github.com/garrytan/gstack/blob/main/docs/triage.md)。

## 社区 PR 分流（波次流程）

社区 PR 积压时，把它们攒成主题波次：

1. **归类**——按主题分组（安全、功能、基础设施、文档）
2. **去重**——两个 PR 修同一件事时，选改动行数少的。另一个带指向胜者的说明关闭。
3. **收集分支**——创建 `pr-wave-N`，合并干净的 PR、为脏的解冲突、用 `bun run test && bun run build` 验证
4. **带着上下文关闭**——每个被关闭的 PR 得到一条解释为什么、以及（若有）什么取代它的评论。贡献者做了真实的工作；用清晰的沟通尊重它。跑波次的 agent 以其 bot 身份发这些说明，绝不用维护者本人账号。
5. **作为一个 PR 发布**——单 PR 进 main，全部署名保留在合并提交里。附一张什么合并了、什么关闭了的汇总表。

第一波示例见 [PR #205](https://github.com/garrytan/gstack/pull/205)（v0.8.3）。

## 移植贡献者的 PR

有时落地外部 PR 的正确方式是移植：diff 是对的，但它坐在旧基点上、测试需要我们的 fixture、或仓库的门（生成渲染、体积钉、CHANGELOG 条目）只有维护者能收尾。移植保留贡献者的署名并给他们清楚的答复；以下步骤是维护者编队所循规则的仓库版（[docs/captain.md](/captain/#编队之外的贡献)）。

1. **在任何东西运行它之前，把 diff 当不可信输入**。读它的范围、网络出站、凭据、新依赖、CI 权限变更与被弱化或删除的测试。fork 的绿色检查证明不了本检出的事：移植头在 PR 开启前得到自己的聚焦评审与免费档（迭代时 `bun run test:quick`、最终树上一次 `bun run test`）。
2. **他们的提交保持他们的**。把贡献者的提交 cherry-pick 或 rebase 到当前基点、署名完好（`git cherry-pick -x` 在消息里保留源 SHA）。必须改写的提交保留他们作 author、为编辑者加 `Co-authored-by:` 尾注。绝不把他们的工作折进你名下的提交，绝不猜邮箱：用他们提交上的身份。
3. **你的修复合在其上、作独立提交**。基础合并、生成文件、测试修理、CHANGELOG 条目与版本打戳是你的提交、排在他们的之后，所以 `git log` 与 PR 的提交清单显示谁做了什么。squash 合并在 squash 消息携带其 `Co-authored-by:` 行时保住署名；说"已落地"之前检查合并提交。
4. **在移植里说明**。PR 正文第一段点名原 PR 与作者、列出你在其 diff 之上改了什么。移植的 `## Approvals` 节（仓库使用时）记录谁要求的移植。
5. **以具体的致谢关闭原件**。移植落地后，在他们的 PR 上评论：落了什么（移植的编号与版本）、你改了什么为什么、并就他们修的具体那件事具名致谢。然后关闭。agent 以其 bot 身份发那条评论，绝不用维护者本人账号。不落地就关闭一个贡献是维护者的决定、绝不是车道的：先问；答案是"不"时，在同一条评论里说为什么。

移植不是重写。贡献者的方案是你不会落地的那种时，在他们的 PR 上直说，并按 [issue 分流](#issue-分流)关闭或搁置，而不是以他们的名义发布另一个变更。

## 升级迁移

当发布以 `./setup` 自身修不好的方式改动磁盘状态（目录结构、配置格式、过期文件）时，加一个迁移脚本让既有用户得到干净升级。

### 什么时候加迁移

- 技能目录的创建方式变了（符号链接对真实目录）
- `~/.gstack/config.yaml` 的配置键改名或挪位
- 需要删除旧版本留下的孤儿文件
- `~/.gstack/` 状态文件的格式变了

不为这些加迁移：新功能（用户自动得到）、新技能（setup 发现它们）、纯代码改动（无磁盘状态）。

### 怎么加

1. 创建 `gstack-upgrade/migrations/v{VERSION}.sh`，`{VERSION}` 对应需要修复的发布 VERSION 文件。
2. 加可执行位：`chmod +x gstack-upgrade/migrations/v{VERSION}.sh`
3. 脚本必须**幂等**（多次运行安全）且**非致命**（失败被记录但不挡升级）。
4. 顶部加注释块说明改了什么、为什么需要迁移、影响哪些用户。

示例：

```bash
#!/usr/bin/env bash
# Migration: v0.15.2.0 — Fix skill directory structure
# Affected: users who installed with --no-prefix before v0.15.2.0
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
"$SCRIPT_DIR/bin/gstack-relink" 2>/dev/null || true
```

### 怎么跑

`/gstack-upgrade` 期间，`./setup` 完成（第 4.75 步）后，升级技能扫 `gstack-upgrade/migrations/` 并跑每个版本比用户旧版本新的 `v*.sh` 脚本。脚本按版本序跑。失败被记录但绝不挡升级。

### 测试迁移

迁移作为 `bun run test`（第 1 层、免费）的一部分被测。测试套件验证 `gstack-upgrade/migrations/` 的全部迁移脚本可执行且无语法错误地解析。

## 发布你的改动

技能编辑满意后：

```bash
/ship
```

它跑测试、评审 diff、分流你配置的每个评审机器人的评论（Greptile 的带两级升级）、管理 TODOS.md、升版本、开 PR。完整工作流见 `ship/SKILL.md`。
