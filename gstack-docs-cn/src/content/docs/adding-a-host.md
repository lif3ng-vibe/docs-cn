---
title: "为 gstack 新增一个宿主"
---


gstack 用声明式宿主配置系统。每个受支持的 AI 编码 agent（Claude、Codex、Factory、Kiro、OpenCode、Slate、Cursor、OpenClaw、Hermes、GBrain、Copilot、Antigravity、Gemini CLI）都定义为一个由 `defineHost()` 工厂构建的类型化 TypeScript 配置对象。渲染一个新宿主意味着创建一个文件并再导出它：生成器、测试与校验自动接上。安装它不是免费的：setup 对每个可安装宿主仍有一条安装臂（见下方"setup 在磁盘上改什么"），所以可安装宿主还需要一条 setup 臂、安装注册表层级表里的一个条目、以及一次认证运行，才能标 `full`。

## 安装所有权规则

这些规则对每个宿主、每个范围、每条升级路径（`./setup`、`./setup --refresh-registered`、`/gstack-upgrade`、团队模式自动更新）都成立。每次拒绝点名：什么被留着没动、适用的是哪条规则、以及继续的确切命令。

1. **项目本地 setup 绝不静默替换全局安装**。从项目内嵌副本、或从全局安装所链接的检出之外的任何检出的 setup，不动那个全局安装，并打印 `./setup --global` 作为有意替换的方式。（Codex：`setup:186-207`，#2879。Claude：全局 `~/.claude/skills/gstack` 链接。）
2. **显式 `--host X` 绝不改另一个宿主**。`--host codex` 只写 Codex 的技能目录与检出自己的 `.agents/` 渲染。它不修复、注册或移除 `settings.json` 里的 Claude Code 钩子，也不碰 Claude 的 gbrain 渲染（#2347）。一个有意的例外：一次性的 `/claude` → `/claude-code` 改名修复（`bin/gstack-migrate-claude-code`）在共享该检出的每个安装里改名 gstack 所有的条目。
3. **升级精确刷新已注册的安装**。setup 激活的每个安装都记入安装注册表。升级运行 `./setup --refresh-registered`——对该检出的每个已注册宿主各跑一次 setup（先打印来源），别的什么都不做。别的检出的安装、别的项目的项目安装，被列出并附上在彼处刷新的命令；绝不重新指向（#1925）。
4. **用户文件幸存**。Setup、`gstack-relink` 与 `gstack-uninstall` 只在能证明 gstack 创建了某条目（#2119 所有权门）时才删除或覆盖它；其余一律报告并留下。

### 安装注册表

`$GSTACK_STATE_ROOT/installs.tsv`（mode 0600）是安装的唯一记录。只有 `bin/gstack-install-registry.sh` 在锁目录与原子改名之下写它。列：宿主、范围（`global`/`project`）、项目、目的地（宿主发现的技能目录）、安装根、来源真实路径、版本、前缀设置、渲染、更新时间。一行只在宿主臂完成激活之后发布。安装根已消失的行被每次刷新与 `gstack-uninstall` 丢弃（`gstack_install_registry_reconcile`），所以升级绝不复活已卸载的宿主。

`./setup --status` 对每个安装打印一行（宿主、层级、范围、结果、版本、目的地、来源），不构建也不写任何东西，外加它在磁盘上找到的注册前安装，标为 `unregistered` 并附注册命令。被项目内嵌副本捕获的 Codex 安装（#2879）报两种选择而不是重新指向。setup 摘要、`/gstack-upgrade` 摘要与 `--status` 共用一个渲染器（`gstack_install_registry_render`）。

### 迁移

`gstack-upgrade/migrations/v*.sh` 是状态根迁移。其标记是 `$GSTACK_STATE_ROOT/.last-setup-version`（早于那次搬家的安装从 `~/.gstack` 读一次）。它只越过成功的迁移；失败的迁移停下序列、打印带重试命令的 `failed` 行、并在下次 `./setup` 重跑。安装与宿主迁移由注册表行的版本按安装跟踪。

### setup 在磁盘上改什么

setup 副作用的完整清单，按阶段（行号近似）：

| 阶段 | 写什么 | 范围 |
|---|---|---|
| 构建 | 源检出里的 `browse/dist`、`design/dist`、`make-pdf/dist`、`bin/gstack-cso-*` | 源 |
| 宿主记录 | 源检出里的 `.gstack-installed-hosts`：setup 从它安装过的每个宿主，只增不减（#1694） | 源 |
| 生成 | 源检出里只为已记录宿主渲染（`.agents/`、`.kiro/`、`.factory/`、`.opencode/`、`.cursor/`、`.copilot/`、`.agy/`、`.gemini-cli/`）；`gstack-patch-names` 就地改写 Claude 的 `name:` 字段 | 源 |
| 渲染修剪 | 记录未点名的宿主的渲染：指向检出的链接移除，生成文件挪进 `$GSTACK_STATE_ROOT/backups/host-renders/<ts>-<id>/`，其他文件保留 | 源 / 状态根 |
| Chromium | Playwright 缓存（`~/.cache/ms-playwright`）、状态根下的锁 | 机器 |
| 配置 | `$GSTACK_STATE_ROOT/config.yaml` 里的 `skill_prefix`、`timeline_stop_hook`、团队模式键 | 状态根 |
| Claude 臂 | `~/.claude/skills/gstack` 链接、每技能一目录带 `SKILL.md` 链接、别名拷贝 | 选中宿主 |
| Codex 臂 | `${CODEX_HOME:-~/.codex}/skills/gstack` 运行时根、`.agents/skills` 里的 `gstack-*` 链接、`.agents/skills/gstack` 边车 | 选中宿主 |
| Kiro、Factory、OpenCode、Cursor、Copilot、Antigravity、Gemini CLI 臂 | 该宿主的 `skills/gstack` 运行时根（在活的那个旁边建好再换入）与 `gstack-*` 链接 | 选中宿主 |
| OpenCode 命令 | `~/.config/opencode/commands/gstack-*.md`，带受管标记（#2629）；用户命令文件绝不碰 | 选中宿主 |
| 注册表 | `installs.tsv` 里每个已激活安装一行 | 状态根 |
| 迁移 | 各 `v*.sh` 修复的东西；标记在状态根 | 状态根 |
| Claude 钩子 | `~/.claude/settings.json`（heal、SessionStart、plan-tune、Stop）——只在选中 Claude 时 | Claude |
| gbrain | `gbrain-detection.json`；`$GSTACK_STATE_ROOT/render/claude` 里的 Claude 渲染——只在选中 Claude 时 | 状态根 / Claude |

今天的激活方式：macOS 与 Linux 上每个安装都是一组指进源检出的符号链接，所以 `git pull` 在 setup 之前就改变了生效载荷，"保留先前载荷"意味着"保留先前检出"——升级技能在内嵌路径这么做（`.bak` 恢复）、在 git 路径记录（`PRE_UPGRADE_COMMIT`）。Windows 上 setup 是拷贝而不是链接，每份拷贝暂存为 `<dst>.gstack-new.<pid>`、完整后才换入；被打断的换入在下次运行时修复（目的地缺失则从 `<dst>.gstack-old.<pid>` 恢复）。符号链接平台的版本化载荷目录尚未构建。

### 安装上下文渲染契约

提交在库的渲染点名每个宿主的默认安装根。为其他任何根（项目安装、`CLAUDE_CONFIG_DIR`、改名的检出）的渲染用 `gen-skill-docs --host <h> --install-root <绝对路径> --out-dir <tmp> --link-root <dir>` 制作：每个默认根路径换成给定根，resolver 以 `TemplateContext.installRoot` 看到它（null 保持提交字节）。逐安装的渲染放在 `$GSTACK_STATE_ROOT/render/installs/<host>-<id>/`（`<id>` 按根的真实路径键控）并记入注册表的 render 列。Setup 为 `~/.claude/skills/gstack` 之外的 Claude 安装（改名检出、项目内嵌副本、`CLAUDE_CONFIG_DIR`）与 `~/.codex/skills/gstack` 之外的全局 Codex 安装（`CODEX_HOME`）各制作一份；仓库级 Codex 安装在运行时解析自己的根。非纯路径（空白、shell 元字符）的根经 `<host>-<id>.root` 别名符号链接点名：worktree 隔离的 Claude Code 拒绝任何引号下含空格的命令路径。

### 安装里的宿主渲染（#1694）

一个检出只为从它安装过的宿主渲染技能。`bin/gstack-host-renders.sh` 持有记录、即检出里的 `.gstack-installed-hosts`：setup 加上它安装的每个宿主、绝不删一个，所以 `./setup --host codex` 保留 `--host factory` 的渲染。升级后的第一次运行从该检出已在服务的宿主播种（注册表行、解析到它的安装根、链进其渲染的宿主技能、以及无运行时根的旧拷贝）。`scripts/build.sh` 渲染 claude 加已记录的宿主并打印是哪些、为什么；没有记录的检出（开发检出）或 `GSTACK_RENDER_HOSTS=all` 渲染每个宿主。

每次 setup 随后按 `bin/gstack-relink` 的证明规则修剪未记录宿主的渲染：指向检出的符号链接（强证明）移除；被证明是生成物的文件（弱证明：gen-skill-docs 横幅、生成器确切的 `openai.yaml` 形态、与检出的字节一致性）挪进 `$GSTACK_STATE_ROOT/backups/host-renders/<ts>-<id>/`；其余文件原地不动，只有清空的目录被移除。备份的 `prune.log` 列出每个路径。gstack-upgrade 的迁移为没有跑过 setup 的升级安装执行同一修剪。Harness 宿主（OpenClaw、Hermes）渲染进临时目录再拷进 harness 自己的文件夹，所以绝不给检出添渲染；GBrain 从不被 setup 安装，所以在某个安装里手工渲染它的用户先把它加进记录。

## 宿主层级与能力

每个宿主声明 `tier` 与 `capabilities`（`scripts/host-config.ts`）。同一套词汇到处使用：`./setup --help`、setup 与 `--status` 行、宿主错误、以及 README 宿主矩阵——全部由 `test/host-config.test.ts` 对照 `hosts/index.ts` 检查。

| 层级 | 含义 |
|---|---|
| `full` | 安装、渲染、通过一致性套件，且下方有带日期的认证记录。 |
| `experimental` | 安装、渲染并通过一致性套件；尚无认证记录。harness 宿主（`install.registration: 'harness'`：OpenClaw、Hermes）经 `gstack-harness register` 安装、由 `test/harness-register.test.ts` 而非逐目录套件认证。 |
| `instruction-only` | 无安装臂。`./setup --host X` 打印该拷什么，什么都不改。 |

光渲染永远认证不了 `full`。

| 能力 | 取值 | 用于 |
|---|---|---|
| `toolExecution` | 布尔 | preamble 与 `bin/` 辅助可运行 |
| `questions` | `native` / `prose` | 结构化提问工具对纯文本提问 |
| `planMode` | 布尔 | 规划模式切换；`false` 省略 preamble 的规划模式节 |
| `delegation` | 布尔 | 子 agent |
| `browser` | 布尔（需 `toolExecution`） | gstack 的浏览器 |
| `safetyHooks` | `enforced` / `advisory` | `/careful`、`/freeze`、`/guard` 阻断（Claude）或仅警告 |

`safetyHooks: 'advisory'` 的宿主在 `/careful`、`/freeze` 与 `/guard` 顶部得到一行："not enforced on <host>: advisory, not blocked"。

## 认证你的宿主

1. 通过一致性套件：`bun test test/host-conformance.test.ts` 把每个可安装宿主装进临时 HOME，检查发现目录、无其他宿主变体、无重复、`./setup --status`、以及从上一发布安装布局的升级。
2. 在该宿主上真实跑一个代表性工作流（比如小 diff 上的 `/review`），以及从既有安装的升级。
3. 在下方加一行：日期、宿主版本、gstack 版本、转录所在，然后把 `tier` 设为 `'full'`。

| 宿主 | 日期 | 宿主版本 | gstack 版本 | 证据 |
|---|---|---|---|---|
| claude | 2026-10-02 | Claude Code 2.1.284（CI 镜像钉定） | v1.91.13.0（1c54555） | gate 层评测、真实 Claude Code 会话：https://github.com/garrytan/gstack/actions/runs/37033755821 |

Codex 保持 `experimental`，直到其周期用例（`codex-discover-skill`、`codex-review`）在 CI 镜像钉定的 Codex CLI 上通过并加行。

## GitHub Copilot CLI（#393）

以 `experimental` 发布（`hosts/copilot.ts`、`./setup --host copilot`）：技能在 `~/.copilot/skills/gstack-*`、运行时根 `~/.copilot/skills/gstack` 带 `.source-path` 标记让 `/gstack-upgrade` 找到检出、名字带 `gstack-` 前缀（否则 Copilot 内建的 `/review` 会赢）、敏感技能 `disable-model-invocation: true`、以及插在 preamble 的 STATUS 规则之前的一段工具名对照表（`ask_user`、`exit_plan_mode`、`task`、`view`、`skill`）。共享目录不够：Copilot CLI 1.0.36 起不读 `~/.claude/skills`，gstack 绝不写 `~/.agents/skills`，而 Codex 渲染带着 Codex 路径与 Codex 模型配置。

社区尝试的处置：

| PR | 决定 | 原因 |
|---|---|---|
| #2323（@andrey-esipov） | 选择性采纳，具名致谢 | 保留：`~/.copilot/skills` 与 `.github/skills` 根、`copilot` 二进制探测、`.source-path`、`gstack-` 前缀、1024 字符描述上限、卸载覆盖。不保留：新 schema 字段与生成器改动（早于 `defineHost()`）、对运行时根的无守卫 `rm -rf`（#2142）、递归扫描目录里指向 `setup`/`scripts`/Claude 源的链接、setup 里的测试专用安装后门、以及一刀切的 AskUserQuestion → `ask_user` 改写。 |
| #396（@ridermw） | 拒绝 | 用 sed 把 Codex 输出改写进共享 `.agents/skills`；其 E2E 运行器把真实 `~/.copilot` 凭据拷进临时 HOME。其会话扫描器是日后 `/retro global` 的候选。 |
| #487（@ridermw） | 拒绝 | 依赖 `~/.claude/skills`，Copilot CLI 已不读。 |
| #1852（@lolisaigao1234） | 拒绝 | 探测 `gh` 而不是 `copilot`、装进 Copilot 不扫描的目录、链接 `bin` 不带 `lib`。 |

没有真实 Copilot CLI 核验过的（为何不是 `full`）：autopilot 可能自己回答 `ask_user`；规划模式阻断变更性 shell 命令；符号链接的技能目录需要 Copilot CLI 1.0.62+；`COPILOT_HOME` 不是 `~/.copilot` 的暂时拒绝。

## Antigravity CLI

以 `experimental` 发布（`hosts/agy.ts`、`./setup --host agy`、别名 `--host antigravity`），面向 Google 的 Antigravity CLI。宿主以 `agy` 二进制命名：用长名字时逐围栏运行时前导是 408 字节、超其 400 字节预算（全局根太长）；`agy` 恰好 400 渲染，所以那个前导再加一个字节必须跟着预算变更。2026-10-08 对照 Google 文档核验：

| 事实 | 值 | 来源 |
|---|---|---|
| 全局技能 | `~/.gemini/antigravity-cli/skills/<skill>/SKILL.md` | [Agent skills](https://antigravity.google/docs/skills/)（CLI 节）、[Plugins & skills](https://antigravity.google/docs/cli/plugins/)、[Migrating from Gemini CLI](https://antigravity.google/docs/cli/gcli-migration/) |
| 工作区技能 | `.agents/skills/<skill>/SKILL.md` | 同上 |
| frontmatter | `name`（可选，默认取目录名）、`description`（必填） | [Agent skills](https://antigravity.google/docs/skills/) |
| 描述上限 | 1024 字符（Agent Skills 格式） | [What are Agent Skills?](https://cloud.google.com/discover/ai-agent-skills) |
| 工具名 | `run_command`、`view_file`、`write_to_file`、`replace_file_content`、`multi_replace_file_content`、`grep_search`、`find_by_name`、`invoke_subagent`、`ask_question` | [Hooks: supported tools](https://antigravity.google/docs/hooks/) |
| 规划模式 | `agy --mode=plan` / `/plan`，无退出规划工具 | [Execution modes](https://antigravity.google/docs/cli/modes/) |
| 二进制 | `agy`，装到 `~/.local/bin/agy`；配置在 `~/.gemini/antigravity-cli/` | [Installation](https://antigravity.google/docs/cli/install/)、[Settings](https://antigravity.google/docs/cli/settings/) |

宿主做什么：技能在 `~/.gemini/antigravity-cli/skills/gstack-*`、运行时根 `~/.gemini/antigravity-cli/skills/gstack` 带 `.source-path` 供 `/gstack-upgrade`、`name:` 等于 `gstack-<skill>` 目录（CLI 把每个名字变成 slash 命令，且有 `/plan`、`/diff`、`/skills` 等内建）、frontmatter 只留 `name` 与 `description`、Gemini 模型 overlay、以及 preamble 的 STATUS 规则之前的一段工具对照表。对照表还告诉 agent：`view_file` 只返回长 SKILL.md 的一部分时继续读——用户报告首次读停在 800 行（[论坛](https://discuss.ai.google.dev/t/make-the-800-line-forced-first-read-in-view-file-configurable-or-opt-out/172257)），Google 文档没写，所以渲染文本不点名数字。

**共享的 `~/.gemini`**。Antigravity CLI 与 Gemini CLI 都住在 `~/.gemini` 下。Gemini CLI 读 `~/.gemini/skills`（与 `~/.agents/skills`）；Antigravity CLI 读 `~/.gemini/antigravity-cli/skills`，而 Google 的迁移表把 `~/.gemini/skills` 也列为 Antigravity 全局路径。每个宿主的臂只在自己目录里写 gstack 条目，卸载只移除各自里面 gstack 受管的条目，`--host auto` 只在 `agy` 于 `PATH` 或已有 `~/.gemini/antigravity-cli` 时选 Antigravity、只在 `gemini` 于 `PATH` 时选 Gemini CLI，绝不为裸 `~/.gemini` 选任何一个。`test/setup-install-registry.test.ts` 持有每个方向，含两个宿主同时安装。Gemini CLI 是自己的宿主（下方 "Gemini CLI"）。两个重叠仍在：工作区 `.agents/skills` 也是项目级 Codex 安放其 Codex 风味 `gstack-*` 技能的地方，Antigravity 会在这个仓库里列出它们；且 Antigravity 2.0 应用与 IDE 读 `~/.gemini/config/skills`，本宿主不安装它（Google 的 codelab 说那个目录也到 CLI；CLI 文档没说，所以 setup 跟 CLI 文档）。

社区尝试的处置：

| PR | 决定 | 原因 |
|---|---|---|
| #2134（@0xshae） | 选择性采纳，具名致谢 | 保留：`agy` 作宿主名与二进制、`.agents/skills` 作工作区根、以及与 Codex 的 `.agents` 分开的 `.agy` 渲染目录。不保留：手写配置（早于 `defineHost()`）、`~/.gemini/config/skills` 作 CLI 根、以及没有所有权门的 setup 臂。 |
| #2893（@ManchalaSashank） | 选择性采纳，具名致谢 | 保留：setup 与生成里 `agy`/`antigravity` 作宿主名与别名、Gemini overlay、卸载覆盖。不保留：`~/.gemini/config/skills`、对裸 `~/.gemini`（Gemini CLI 的目录）的自动探测、`.gemini` 作渲染目录、以及仓库级 `.gemini/skills` 边车。 |
| #2726（@voipexpert） | 选择性采纳，具名致谢 | 保留：出自其官方文档的工具名，以及 `manage_task`（后台进程）不是待办工具这一点。不保留：一刀切的工具名改写（由 preamble 对照表替代）与压制外部评审——它们经 shell 运行。 |
| #2244（@KiDDarn） | 选择性采纳，具名致谢 | 保留：没有链到任何技能就让安装失败。不保留：`~/.gemini/config/plugins` 的插件布局（CLI 插件住在 `~/.gemini/antigravity-cli/plugins`、由 `agy plugin install` 安装）、benchmark 提供方工作、以及额外 frontmatter 字段。 |
| #413（@jnMetaCode） | 拒绝 | 装进 `~/.gemini/skills` 且探测 `gemini`：那是 Gemini CLI。其评论（@doogiehowzer）报告了对照表现在处理的 `view_file` 部分读取。 |
| #2079（@FACUTUCCI10） | 拒绝 | Gemini CLI 路径（`~/.gemini/skills`）。 |
| #2187（@NotArsal） | 拒绝 | #2134 的无 setup 重复。 |
| #1490（@7H0M45-4N70NY） | 拒绝 | `~/.antigravity/skills`，任何 Antigravity 面都不读。 |
| #565（@ChetanTekur） | 拒绝 | Gemini CLI 的 `GEMINI.md` 支持；Gemini CLI 超出范围。 |

没有真实 Antigravity CLI 核验过的（为何不是 `full`）：CLI 是否跟随符号链接的技能目录；是否不把运行时根的多余 markdown（`ETHOS.md`、`review/*.md`）当技能导入；`view_file` 对长技能的部分读取行为；`ask_question` 选项处理；以及从既有安装的升级。

## Gemini CLI（#1247）

以 `experimental` 发布（`hosts/gemini.ts`、`./setup --host gemini`、别名 `--host gemini-cli`）。2026-10-31 对照 Gemini CLI 0.66.0（其捆绑的 `docs/cli/skills.md` 与 `SkillManager.discoverSkills`）核验：

| 事实 | 值 | 来源 |
|---|---|---|
| 用户技能 | `~/.gemini/skills/<skill>/SKILL.md`，与用户层内优先的 `~/.agents/skills` 别名 | [Agent Skills](https://geminicli.com/docs/cli/skills/)、`packages/core/src/skills/skillManager.ts` |
| 工作区技能 | `.gemini/skills` 与 `.agents/skills` 别名，只在受信文件夹（`/trust`）加载 | 同上 |
| 优先级 | 内建 < 扩展 < 用户 < 工作区；同名：高层赢 | 同上 |
| 发现 | `<dir>/<name>/SKILL.md`，一层深；跟随符号链接的技能目录；名字来自 frontmatter `name` | 同上 |
| 调用 | 你批准后模型调 `activate_skill`；`/skills list` 与 `gemini skills list` 显示 | 同上 |
| 工具名 | `run_shell_command`、`read_file`、`read_many_files`、`write_file`、`replace`、`grep_search`、`glob`、`list_directory`、`ask_user`、`invoke_agent`、`activate_skill`、`enter_plan_mode`、`exit_plan_mode`、`write_todos`、`web_fetch`、`google_web_search` | 0.66.0 捆绑 |
| 上下文文件 | `GEMINI.md` | 0.66.0 捆绑 |

宿主做什么：技能在 `~/.gemini/skills/gstack-*`、运行时根 `~/.gemini/skills/gstack` 带 `.source-path` 供 `/gstack-upgrade`、`name:` 等于 `gstack-<skill>` 目录、frontmatter 只留 `name` 与 `description`（1024 字符上限）、Gemini 模型 overlay、以及 preamble 的 STATUS 规则之前的一段工具对照表。对照表还点名 Antigravity 的 `run_command`、`view_file` 与 `ask_question`，因为读 `~/.gemini/skills` 的 Antigravity CLI 也会看到这些技能。渲染目录是 `.gemini-cli/`（gitignored）而不是 `.gemini/`，所以本仓库自己的受信工作区绝不把渲染产物列为技能。`--local` 被拒绝：它只装 Claude，而 Gemini CLI 只在受信文件夹读工作区技能。

重叠：受信仓库里，项目级 Codex 安装的 `.agents/skills`（Codex 风味 `gstack-*` 技能）是工作区层、高于 `~/.gemini/skills`，所以 Gemini CLI 在那里用那些。gstack 绝不写 `~/.agents/skills`：那个别名与其他工具共享、且高于 `~/.gemini/skills`。Antigravity 自己的安装留在 `~/.gemini/antigravity-cli/skills`。

没有构建机上的 Gemini API key 核验过的（为何不是 `full`）：任一技能的实机模型运行、`ask_user` 选项处理、以及 gstack 规划评审技能下的规划模式。发现已核验：`./setup --host gemini` 之后 `gemini skills list` 列出 `gstack-*` 技能。

## 仅指令宿主与 agent harness

Slate 与 GBrain 没有安装臂。OpenClaw 与 Hermes 是 harness 宿主：`./setup --host openclaw|hermes`（以及在两者之内跑的 `./setup`）调用 `bin/gstack-harness register`，它把宿主渲染进临时目录、带所有权台账（`lib/harness-register.ts`）拷进 harness 自己的技能文件夹。Hermes 渲染写 `name: gstack-<skill>`，让按 frontmatter 名字索引技能的 Hermes 无法遮蔽它们（#2825）。

不需要自己渲染的 harness（QM、dots、任何其他）是 `lib/harness-register.ts` 里 `TARGETS` 的一行，不是宿主文件：给它机制、默认目的地、harness 内部标记（harness 为其 agent 运行的命令所设的环境变量，绝不猜测）、存在性检查、以及（有则）列出它所见技能的命令。把它的原因码加进 `HARNESS_CODES` 并配 docs/troubleshooting.md 小节、`test/harness-register.test.ts` 用例、以及 [hosts.md](/hosts/#agent-宿主) 表中的一行。

## 工作原理

```
hosts/
├── define-host.ts   # defineHost() 工厂：共享默认 + 派生字段
├── claude.ts        # Primary host
├── codex.ts         # OpenAI Codex CLI
├── factory.ts       # Factory Droid
├── kiro.ts          # Amazon Kiro
├── opencode.ts      # OpenCode
├── slate.ts         # Slate (Random Labs)
├── cursor.ts        # Cursor
├── openclaw.ts      # OpenClaw
├── hermes.ts        # Hermes (Nous Research)
├── gbrain.ts        # GBrain
├── copilot.ts       # GitHub Copilot CLI
├── agy.ts           # Google Antigravity CLI
├── gemini.ts        # Google Gemini CLI
└── index.ts         # Registry: imports all, derives Host type
```

每个配置文件调用 `defineHost()` 并导出得到的 `HostConfig` 对象，它告诉生成器：
- 生成的技能放哪里（路径）
- frontmatter 怎么变换（allowlist/denylist 字段）
- 哪些 Claude 专属引用要改写（路径、工具名）
- 自动安装探测哪个二进制
- 压制哪些 resolver 小节
- 安装时符号链接哪些资产

生成器、setup 脚本、platform-detect、卸载、健康检查、worktree 拷贝与测试全部从这些配置读。它们没有逐宿主代码。

## 一步一步：新增一个宿主

### 1. 创建配置文件

配置用 `hosts/define-host.ts` 的 `defineHost()` 工厂构建。你只写与外部宿主公共默认不同的字段；其余全部从宿主名派生。一个全默认宿主只有两个字段（见 `hosts/slate.ts` 或 `hosts/cursor.ts`）：

```typescript
import { defineHost } from './define-host';

const myhost = defineHost({
  name: 'myhost',
  displayName: 'MyHost',
});

export default myhost;
```

它展开为带以下默认的完整 `HostConfig`：

- `cliCommand: 'myhost'`（名字；`command -v` 探测的二进制）
- `cliAliases: []`
- `defaultModel: 'claude'`（生成未显式给 `--model` 时用的模型 overlay；codex 覆写为 `'gpt'`）
- `globalRoot` / `localSkillRoot`：`.myhost/skills/gstack`、`hostSubdir`：`.myhost`
- `usesEnvVars: true`（只有 Claude 为 false，它用字面 `~` 路径）
- `frontmatter`：allowlist 只留 `name` + `description`，无描述上限
- `generation`：无元数据文件、`skipSkills: []`（两个外部评审技能都启用；Claude 与 Codex 显式省掉自己的包装器）
- `pathRewrites`：从解析出的路径派生的标准三连（`~/.claude/skills/gstack` → `~/{globalRoot}`、`.claude/skills/gstack` → `{localSkillRoot}`、`.claude/skills` → `{hostSubdir}/skills`）
- `suppressedResolvers`：GBrain 一对（`GBRAIN_CONTEXT_LOAD`、`GBRAIN_SAVE_RESULTS`）
- `runtimeRoot`：`sharedRuntimeRoot()`，技能运行或读取的每个文件作 `$GSTACK_ROOT/<path>`（`bin`、`lib`、编译工具、`freeze/bin`、评审检查表与专家、行话清单与提问注册表、AskUserQuestion 文档、DX 名人堂、`VERSION`、以及 office-hours 与 plan-design-review 的 `SKILL.md` 拷贝）。它镜像 setup 的 `_link_runtime_dists` 与 `_copy_runtime_skill_refs`；`test/runtime-root-assets.test.ts` 检查磁盘上每个暂存根。有额外资产的宿主传给它：`sharedRuntimeRoot(['qa/templates'])`。
- `install`：`{ linkingStrategy: 'symlink-generated' }`
- `learningsMode: 'basic'`

任何字段传给 `defineHost()` 即可覆盖。两个路径改写选项：

- `extraPathRewrites`：在派生三连**之后**追加（例如 kiro 的 codex 路径清理，或 AGENTS.md 宿主的 `{ from: 'CLAUDE.md', to: 'AGENTS.md' }`）。标准三连对但需要更多时用它。
- `pathRewrites`：整体替换派生清单。只用于非机械情况——codex 与 factory 把全局路径改写为 `$GSTACK_ROOT` 并加一条额外的评审路径改写；claude 是空清单。

两者互斥（工厂在你同时传时抛错）。

`define-host.ts` 导出的共享常量供展开组合：`CROSS_MODEL_RESOLVERS`（外部提供方评审 resolver 加 Review Army，在选择退出的宿主上压制；Codex 保留外部评审、压制 Review Army）、`GBRAIN_RESOLVERS`（默认压制对）、以及 `EXEC_STYLE_TOOL_REWRITES`（openclaw 与 gbrain 共享的 OpenClaw 风格小写工具改写）。

好例子：`hosts/opencode.ts`（路径 + 额外运行时资产）、`hosts/factory.ts`（工具改写与条件字段）、`hosts/hermes.ts`（带自定义工具改写与 resolver 组合的 AGENTS.md 宿主）。

### 2. 在 index 注册

编辑 `hosts/index.ts`：

```typescript
import myhost from './myhost';

// Add to ALL_HOST_CONFIGS array:
export const ALL_HOST_CONFIGS: HostConfig[] = [
  claude, codex, factory, kiro, opencode, slate, cursor, openclaw, hermes, gbrain, myhost
];

// Add to re-exports:
export { claude, codex, factory, kiro, opencode, slate, cursor, openclaw, hermes, gbrain, myhost };
```

### 3. 加进 .gitignore 与渲染表

把 `.myhost/` 加进 `.gitignore`（生成的技能文档被 gitignore），并把 `myhost:.myhost` 加进 `bin/gstack-host-renders.sh` 的 `GSTACK_HOST_RENDER_DIRS`，让安装只在它被安装时渲染、否则修剪（#1694；`test/host-renders.test.ts` 对照 `hosts/*.ts` 检查该表）。

### 4. 生成并验证

```bash
# Generate skill docs for the new host
bun run gen:skill-docs --host myhost

# Verify output exists
ls .myhost/skills/gstack-*/SKILL.md

# Generate for all hosts (includes the new one)
bun run gen:skill-docs --host all

# Validate all host content and tracked output freshness, including the new host
bun run skill:check
# Claude install paths are rejected in prose; legitimate Bash fallbacks are allowed.
```

（译注：为宿主生成技能文档；验证输出存在；为全部宿主生成；校验全部宿主内容与跟踪产物的新鲜度。）

### 5. 跑测试

```bash
bun test test/gen-skill-docs.test.ts
bun test test/host-config.test.ts
```

参数化冒烟测试自动接上新宿主。它们验证：输出存在、无路径泄漏、frontmatter 合法、新鲜度检查通过、外部评审技能与各宿主的排除一致。

### 6. 更新 README.md 与 docs/hosts.md

把新宿主的行加进 README 宿主矩阵（层级、安装命令、首次调用、安全技能、外部评审需求、修复）。逐宿主说明住在 [docs/hosts.md](/hosts/)，不在 README。

## 配置字段参考

完整 `HostConfig` 接口（每字段带 JSDoc 注释）见 `scripts/host-config.ts`。

关键字段：

| 字段 | 用途 |
|-------|---------|
| `tier` | `full`、`experimental` 或 `instruction-only`（见宿主层级） |
| `capabilities` | 宿主运行时提供什么；渲染与文档不得宣称更多 |
| `frontmatter.nameMatchesDirectory` | 为按 frontmatter 名字索引的宿主把 `gstack-<skill>` 写进 `name:` |
| `defaultModel` | 生成未显式给 `--model` 时渲染的模型 overlay（对照 `scripts/models.ts` 的 `ALL_MODEL_NAMES` 校验） |
| `frontmatter.mode` | `allowlist`（只留所列）或 `denylist`（剥掉所列） |
| `frontmatter.descriptionLimit` | 最大字符数，`null` 无上限 |
| `frontmatter.descriptionLimitBehavior` | `error`（构建失败）、`truncate`、`warn` |
| `frontmatter.conditionalFields` | 按模板值加字段，allowlist 与 denylist 模式都行。两个模板旗标映射到 `disable-model-invocation: true`：`sensitive`（宽：/ship、/land-and-deploy、/modernize 与安全技能；Copilot 与 Factory）和 `manual_only`（窄：仅 /land-and-deploy 与 /modernize；Claude Code 与 Cursor，"ship it" 必须仍能启动 /ship）。文档尊重 `disable-model-invocation` 的宿主选一个 |
| `frontmatter.renameFields` | 改名模板字段（如 voice-triggers → triggers） |
| `generation.generateMetadata` | 在每个技能旁发 `agents/openai.yaml`（今天仅 Codex；格式硬编码在 `gen-skill-docs.ts`）。其 `default_prompt` 取模板的 `codex_default_prompt:` frontmatter 键，否则 `Use <name> for this task.` |
| `pathRewrites` | 对内容做字面 replaceAll。顺序要紧。替换派生三连。 |
| `extraPathRewrites` | （仅 defineHost 输入）追加在派生三连之后。 |
| `toolRewrites` | 改写 Claude 工具名（如 "use the Bash tool" → "run this command"） |
| `suppressedResolvers` | 对该宿主返回空的 resolver 函数 |
| `coAuthorTrailer` | 提交的 git 共同作者串 |
| `boundaryInstruction` | 跨模型调用的防提示注入警告 |
| `transcripts` | 可选 `{ root, layout }`：宿主把自己的聊天转录存盘于何处、本工作区的文件如何区分，由 `/context-restore` 的无检查点回退渲染（`{{TRANSCRIPT_SOURCES}}`、`{{TRANSCRIPT_DISCOVERY}}`）；声明了存储还要在 `scripts/resolvers/transcripts.ts` 加发现正文。缺省：宿主声明无转录存储。 |

## 校验

`scripts/host-config.ts` 的 `validateHostConfig()` 检查：
- 名字：小写字母数字加连字符
- CLI 命令：字母数字加连字符/下划线
- `defaultModel`：必须是 `scripts/models.ts` `ALL_MODEL_NAMES` 的已知模型族
- 路径：仅安全字符（字母数字、`.`、`/`、`$`、`{}`、`~`、`-`、`_`）
- 配置间无重名、无重复 hostSubdir、无重复 globalRoot

跑 `bun run scripts/host-config-export.ts validate` 检查全部配置。
