---
title: "入门：在你的仓库里完成一个有用的变更"
---

从一个仓库和一个你能实际演练的有界变更开始。随附的 first-project 配方提供的都是同样两个席位：一位成果负责人（outcome owner）与一位独立检查者（independent checker）。用你已有的账号选择 Claude Code、Codex，或各选其一。终端提供商支持不会改变运行框架或登录。

你需要 Node.js 22 或 24 与 tmux，运行于 macOS 或 Linux。在 Apple silicon 的 Mac 上请使用 Node.js 22（参见[兼容性历史](/releases/v0.5.15/#已知的兼容性限制)）。原生 Windows 暂不支持，WSL2 尚未经过测试。Node 20 已不再支持；Node 26 及其他版本未经测试。

**在启动团队之前先选定权限**。普通的 OpenRig 启动使用 Codex 的 `-s workspace-write`（审批策略取自你的原生配置），或 Claude Code 的 `acceptEdits`——命令仍受原生规则与提示约束。Codex 的沙箱通常阻断网络访问，包括本地 OpenRig 守护进程（daemon）。命令许可规则不会改变一般沙箱/网络设置。预置模板（starter）的 `profile: default` 选定的是 OpenRig 资源，而不是某个原生权限 profile。智能体引导的设置会[问一次](#让智能体帮你配置权限)：“允许你的智能体运行 OpenRig 命令而不再反复弹出权限提示吗？”**是——推荐** / **否——保留提示**。已有的明确选择会被复用；回答否或不回答则设置保持不变。更宽的访问是另一回事。

> 下文报告的都是**当前实际为真**的状态，绝不担保下游工作一定会成功。“守护进程已启动”不代表每个智能体都健康；“内核（kernel）就绪”不代表每个内核智能体都健康；一个工作区根目录处于*活跃*状态，也不代表它就是你项目的*正确*选择。

## 准备并启动

在普通终端中输入 `rig`，打开启动与工作 TUI。它会显示守护进程地址；**d** 展开所选实例的路径与诊断信息。若守护进程已停止，按 Enter 即可启动该守护进程，然后选择你想要的 rig 与席位。建议先选内核；选定其操作员并不会启动每一个内核席位。在普通 TUI 工作中按 **S** 也能进入同一视图。即使连接检查尚未完成，**?** 也能打开帮助。**w** 跳过启动；**Esc** 返回上一页，或在启动首页直接退出启动。这些选择不会启动守护进程或席位。**L** 在连接前后都可打开本地读取：选择已配置的 Specs、项目意图、项目，或任务（mission）与切片，再选定一个目录或文件。**r** 重新读取所选来源；**Esc** 返回。本地读取使用本机配置的工作区路径与文件允许列表，即使所选守护进程地址是远程的也一样。它会显示磁盘来源、缺失或被拒的来源、二进制文件以及 1 MiB 的文本截断边界。这些磁盘快照在读取之后可能变化，且不提供实时的队列、执行或拓扑状态。实时视图在确认连接并主动进入后才加载；实时读取停滞不会妨碍帮助或本地读取。当终端传输不可用时，**t** 会启动空的终端服务，以便查看恢复选项。它不会启动任何席位。

对于曾被占用过的席位，Enter 会尝试恢复其先前的会话。若历史不可用，请阅读原因。**f** 会为该具名席位打开一个单独的全新开始决定；**Esc** 则拒绝且不启动。确认后的全新会话会接收已配置的上下文并保留旧历史，但不会恢复该历史。认证或运行时失败需要先修复相应前置条件。**o** 在此打开既有的原生终端；分离（detach）后即可返回（tmux 默认为先 Ctrl-b 再 d）。原生信任/认证提示在那里处理。若全新开始曾在上下文交付前暂停，**c** 会向同一占用者完成该交付。**r** 再次读取实际状态；**d** 展开细节。

### 选择你的提供商

询问：**“你想让这个团队使用哪个可用账号：Claude Code、Codex，还是两者都用？”** 复用已经做出的明确选择。推荐用户已经可用的账号；第二个订阅并非前置条件。

| 选择 | 预置模板名称 | 负责人 / 检查者的运行时与模型 |
| --- | --- | --- |
| 两个 Codex 智能体（既有路线） | `first-project` | 均为 `codex`，固定 `gpt-6-astra` |
| 两个 Claude 智能体 | `first-project-claude` | 均为 `claude-code`，使用已配置的原生默认模型 |
| 各一个 | `first-project-mixed` | Claude 负责人（原生默认）；Codex 检查者（`gpt-6-astra`） |

Claude 沿用与既有 Claude 内核及实现搭档配方相同的非固定模型约定：OpenRig 不传入模型覆盖。在继续之前，读取所选运行框架已配置的模型，并与配方和启动命令一并展示。若涉及模型固定，请确认账号可访问该模型；若不可用，应询问一个受支持的模型选择，而不是悄悄替换模型或提供商。启动之后，在分派工作前确认实际的原生模型。

安装 OpenRig 并检查 `tmux -V`。只检查**选定的提供商**：

- Claude Code：`claude --version` 与 `claude auth status`。若未登录，问一次：“请在你的启动环境中运行 `claude auth login`。”
- Codex：`codex --version` 与 `codex login status`。若未登录，问一次：“请在你的启动环境中运行 `codex login`。”

若选定的 CLI 缺失，按其提供商的安装说明安装。另一提供商的 CLI/登录以及 Herdr/cmux 都是可选的。不要复制凭据，也不要反复尝试登录。用户完成登录后，重新检查所选登录。`rig setup --dry-run` 可预览更全面的安装；执行 `rig setup` 会安装/检查**两个**运行框架与 cmux，因此在只选单个提供商的路径上它是可选的，不必为了某个用不到的提供商而执行。

### 内核启动保持自动

在全新实例上，普通守护进程启动会依据成功的原生认证探测选择内核变体：仅 Claude、仅 Codex，或两者。因此某个用不到的提供商缺席也没有问题。项目配方**不会**约束该探测：若两个账号都已认证，内核自动启动会两者都用，即使两个项目智能体只用其中一个提供商。这条路径无需任何手动内核设置。预置模板的选择不是实例级的提供商限制；要求一切只用一个提供商是另一件事。保留任何既有的托管内核与正在工作的 rig。

### 启动两个项目席位

将 `starter` 设为表中选定的名称；既有 Codex 路线保持不变：

```sh
cd <your-repository>
starter=first-project  # 或 first-project-claude 或 first-project-mixed
rig specs preview "$starter" --kind rig
rig up "$starter" --cwd . --plan
rig up "$starter" --cwd .
rig status
rig ps --nodes --rig "$starter"
```

预览选定的席位、模型与资源。Plan 会检查针对工作目录的解析与预检。Launch 在需要时启动守护进程，并遵循上述内核行为。关注项目席位的就绪状态，而不只是守护进程健康。在给该席位派活之前，先解决具名的认证、信任或权限提示。回到既有项目时不需要新建团队。

当席位暂停时，在启动视图中用 **o** 打开其既有终端。阅读所提议的命令、工作目录与目标实例。对于本意的本地 `rig` 调用，如果这正是你想要的范围，就选择原生提示中的一次性审批；已保存的命令前缀许可规则也会影响未来匹配的调用。对意外的操作予以拒绝，并告诉同一个智能体应该改做什么。审批控制一个动作能否运行；沙箱控制其文件系统与网络访问。关闭审批并不会授予网络访问。

回答之后，留意命令的结果以及智能体继续推进。从你的普通终端读取对应的队列行与流转记录。若某个操作超时，在要求重试之前先读取其结果：它可能已经生效。消息已送达或提示已消失，这两者本身都不算进展。若启动仍在等待上下文交付，对同一占用者使用 **c**，然后用 **r** 刷新。不要为了清掉一个提示而另启席位。

这些预置模板刻意保持为小型起点，不是万能团队。若要不同的已安装运行时或团队形态，先查看 `rig specs ls --kind rig` 和 `rig specs preview <name>` 再做选择。七席位展示是可选的，且会占用更多并发容量。

## 给负责人一个成果

例如，在一个导入 CSV 文件的项目中：

```sh
rig send "dev-owner@$starter" 'Improve the CSV import error when a required column is missing: name the column and leave the existing data unchanged. Add a regression check, ask dev-check for an independent check of the exact candidate, and record the result and how I can try it. Keep the change local; do not publish.'
```

用你仓库中的真实问题替换该示例。写明用户应当观察到什么、边界在哪里，以及如何检验成功。负责人创建并认领一个持久任务，实现它，并把选定的独立检查路由出去。你不应该需要在终端之间转达评审。`rig send` 是初始会话；队列与仓库工件保存着这项工作。未绑定的 shell 无需冒充队列所有者。

在其席位地址中使用所选的 rig 名称（例如 `dev-owner@first-project-claude`）。从实际的项目席位出发，用 `rig queue list --limit 1000` 跟进工作：其默认 scope 是调用者当前所在的 rig。`queue list` 没有 `--rig` 选项。从观察者 shell 或另一个 rig 出发，在核实这些实时地址之后，使用 `rig queue list --destination "dev-owner@$starter" --limit 1000`，对 `"dev-check@$starter"` 也用同样形式的命令。它们显示的是每个目的地的待办义务，而不是整个 rig 的视图。未绑定的 shell 不得为改变 scope 而冒充席位；只有当你确实想要更宽的视图时才使用 `--all-rigs`。然后阅读 `rig queue show <id> --full` 与 `rig queue transitions <id>`。消息送达不等于结果已评审。阅读工件，实际运行其行为，并确认候选方案已通过检查者评审。

## 共享仪表盘并随时回来

```sh
rig tui --shared
```

全新内核会在其既有的 `operator-human` 终端中运行普通 TUI。该命令把另一个客户端接入该终端。**Ctrl-b 再按 d** 可在不退出 TUI 的情况下分离；用同一命令回来时，视图仍停留在原处。另一个获得授权的智能体可以捕获或操作同一个 pane。它应当在改变你的视图之前告知你。该终端不是人类收件箱，也不能证明有人在看着它。

朴素的 `rig tui` 仍是一个独立的本地视图。若旧内核或你已退出的 TUI 显示的是一个 shell，在该 shell 里运行一次 `rig tui`。`--shared` 不会启动或替换终端，因此绑定缺失时会连同恢复指引一起报告，而不是创建第二个内核。

Herdr 用户遵循相同的启动与派活路径。要把托管团队放进 Herdr，使用 `rig terminal open "$starter" --provider herdr`；要打开共享仪表盘，使用 `rig terminal open kernel --provider herdr`。等价的 cmux 提供商也可用。请阅读已打开/不存在/已降级的结果：部分可见的终端视图不代表团队健康。反复调用终端打开命令可能创建另一个提供商工作区；想保留已有工作区时，请回到已打开的那一个。这是终端集成，不是原生插件注册。

## 继续真实的项目工作

带着下一个成果回到同一个负责人，并引用先前的结果。席位地址与持久队列在你关闭查看终端后依然存在。把意图、验收与证据保存在仓库既有的项目、任务与切片工件中；预置模板会先读取它们，而不是自行发明一条路径。

若项目还没有工作树，先用 `rig workspace doctor` 与 `rig scope mission create --help`，再看 `rig scope slice create --help`。在创建工作之前先设定真正想要的成果。`rig scope` 保存的是正在构建什么。当反复出现的协调值得用工作流承载时，用 `rig workflow specs` 发现有哪些工作流，查看其负责人与输入，再用 `rig workflow instantiate --help` 实例化选定的名称。仅仅为了完成第一个本地变更，并不需要工作流。

对于要长期延续的团队，[OpenRig Software Factory](/reference/https:/github.com/mvschwarz/openrig/blob/main/daemon/specs/agents/shared/skills/core/openrig-software-factory/SKILL/) 提供手动/团队工作、不依赖 Workflow 的队列编排，以及一条可选的显式 Workflow 路径，且唤醒默认值、token 成本与权限选择都清晰可见。把它的简短请求交给你的既有智能体。安装之后，用 `rig context show skills/core/openrig-software-factory --json` 发现配套的内置配方；若结果为缺失或版本不匹配，应保留该结果，而不是悄悄使用更新的指令。它的增长部分把三条路径分得清清楚楚：维持这一对搭档不变；用 `rig grow` 且无需 YAML 为运行中的 rig 增加一两个席位；或者（可选）自行编写自定义 rig。它涵盖新席位的上下文/工作归属、并发成本，以及保存扩展后的 spec。本指南仍是简短的首次使用路径。

## 安装未完成与重启

| 现象 | 下一步动作 |
| --- | --- |
| 工具缺失或登录失败 | 使用具体的安装/认证提示；在启动 shell 中重新检查该可执行文件。不要把工作派给未就绪的席位。 |
| 守护进程健康，内核仍在启动 | 阅读 `rig status` 与 `rig ps --nodes --rig kernel`；内核就绪是另一回事。 |
| 共享终端不存在 | 检查既有的内核绑定与恢复状态；解决期间使用独立的 `rig tui`。 |
| 查看终端被关闭 | 用 `rig tui --shared` 重新接入；不要重启团队。 |
| 守护进程重启但 tmux 幸存 | 重新阅读 `rig status` 与既有队列；守护进程重启不等于全新项目。 |
| 主机重启丢失 tmux 会话 | 打开 `rig`，按需启动守护进程，并选择既有的 rig 与席位。恢复（resume）是默认；全新会话需要单独决定。 |
| 启动报告没有可用快照 | 检查既有 rig 与保留的项目文件，然后按下面的同席位恢复方法处理。 |
| 工作在等待某个提示或决定 | 阅读该行、流转记录与具名提示；在缺失的决定到来之前保留该待办义务。 |

若快照不可用，启动视图会检查所选席位保留的启动来源与权威占用者关系。它会报告来源缺失或有歧义，而不是随意挑选一条历史记录。修复具名的来源、重试，或让该席位保持停止。继续工作之前，先检查保留的队列、项目笔记与已观察到的结果。

`rig setup` 会打印这条路径的简短形式；`rig status` 会指回这里。

## 内核定位（`rig setup` 做什么与不做什么）

显式的 CLI 守护进程启动保留其自动内核行为。TUI 启动守护进程时禁用内核自动引导，以便用户选择席位：

- `rig setup` 安装/校验运行时；它不会启动守护进程或内核。
- 启动守护进程（`rig daemon start`，或经 `rig up` 隐式触发）才会在后台引导内核 rig。
- 从裸 `rig` 启动不会自动准备任何智能体。TUI 在连接之后提供内核设置与逐席位选择。
- **内核就绪与守护进程健康是两个不同的信号**。守护进程的 HTTP 健康很早即绑定；守护进程已启动时，内核可能仍在引导，或某个内核智能体可能不健康。`rig status` 单独呈现内核就绪状态（经 `/api/kernel/status`）；`rig daemon start --wait-for-kernel` 会轮询它。

## scope 与 workflow 之间的桥

两个相关的基本构件，新操作者常常混淆：

- **`rig scope`** 管理**持久的、落在磁盘上的工件**——任务（mission）与切片（你工作区里的 markdown/YAML 文件）。它们是*存在哪些工作*的持久记录。
- **`rig workflow`** 管理一个**运行时实例**——当你执行 `rig workflow instantiate <name>` 时，守护进程会创建一个工作流实例，外加一个把第一步路由给负责人的**入口队列条目（entry qitem）**。这是*谁来做下一步*的实时协调。

scope 文件保存的是工作是什么；工作流实例及其队列包保存的是下一步谁来执行。创建或编辑任务并不会启动工作。你可以用 `rig workflow instantiate <name>` 实例化一个具名工作流，也可以用 `rig workflow compile` 显式检查一个已编写好的生命周期，并用 `rig workflow instantiate-lifecycle` 创建其运行时。仅仅编译不会启动工作。[OpenRig Software Factory](/reference/https:/github.com/mvschwarz/openrig/blob/main/daemon/specs/agents/shared/skills/core/openrig-software-factory/SKILL/) 展示了一个小型的已评审示例，以及如何在真实的等待过程中保持对工作的看管。

## 让智能体帮你配置权限

在团队启动之前，你的智能体会问一次，除非你已针对这些运行框架与这个 scope 做出过明确选择：

> 允许你的智能体运行 OpenRig 命令而不再反复弹出权限提示吗？
> **是——推荐** / **否——保留提示**

它覆盖整个 `rig` 家族，包括启动/停止智能体、配置以及启动进程。它既不是全局 YOLO，也不是自行发明工作的许可。范围是你针对本项目的个人设置，除非你明确选择用户级会话——那会影响你的其他项目。

在实际回答**是**时，智能体会备份相关文件，无重复地添加既有原生规则，并保留更严格的规则与无关设置。它会检查裸命令与真实绝对路径调用、规则加载，以及目标会话中反复的无害读取。回答否或不回答则不动设置，继续沿用既有提示。不受支持的 scope 或托管限制会被报告出来；这不是授予更宽访问的许可。

智能体会把明确选择、范围与确切的添加项记入既有的引导上下文，因此设置不会再问。你无需为每次常规编辑单独批准。要撤销，就说：**“撤销本次设置添加的 OpenRig 命令许可规则；保留我的其他规则”**。智能体只移除它记录在案的添加项，保留更早的规则与之后的编辑，并验证重载生效。撤销之后，其他既有的许可规则可能仍会放行某些命令。

使用持续维护的**应用权限策略**（Applying a permission policy）流程：

```sh
rig context get skills/applying-a-permission-policy/SKILL.md
```

在源码检出版中，阅读[其源文件](/reference/https:/github.com/mvschwarz/openrig/blob/main/daemon/assets/plugins/openrig-core/skills/applying-a-permission-policy/SKILL/)。在 npm 安装中，同一文件位于匹配的 `npm root -g` 或本地 `npm root` 之下的 `@openrig/cli/daemon/assets/plugins/openrig-core/skills/applying-a-permission-policy/SKILL.md`。使用与你的 `rig` 可执行文件相配的版本。它涵盖 Codex/Claude 命令规则、真实配置根、保留限制以及验证目标会话。指南缺失或原生版本不受支持都应作为缺口报告出来，而不是悄悄绕过的许可。

下面更宽泛的启动模式配方是可选的。命令族规则不需要改动预置模板的沙箱或其他所有人的默认值。

## 选择性加入的宽松运行

宽松运行让智能体以你账号的文件系统与网络访问行事，权限拦截更少。它们可能损坏文件或在没有再次确认的情况下发送数据。只在你明确信任的工作与环境中使用；它不会补齐缺失的凭据，也不会覆盖组织策略。

修改要在**用户自有的 spec 中、其首次启动之前**进行。要定制预置模板，运行 `rig specs show first-project --kind rig` 并找到它的 `Path`，其结尾是 `specs/rigs/launch/first-project/rig.yaml`。把整个 `specs` 目录复制到你仓库中的 `./openrig-specs`，并保持其目录结构：只复制 `rig.yaml` 会破坏其相对的 agent 与 culture 引用。安装的那份副本保持原样，不要动。下面的示例使用 `./openrig-specs/rigs/launch/first-project/rig.yaml`。如果你已经有一个在运行的 `first-project`，改动之前先看下文关于既有会话的建议；这不是一个实时权限开关。

### Codex：同时选定沙箱与审批

对于支持具名 `.config.toml` profile 的 Codex 版本，创建 `~/.codex/first-project-permissive.config.toml`（如果你为守护进程的启动环境设置了 `CODEX_HOME`，则放在其下）：

```toml
sandbox_mode = "danger-full-access"
approval_policy = "never"
```

在复制出来的 rig 中，为应使用它的**每一个 Codex 成员**添加该字段；成员既有的 `profile: default` 保持不变：

```yaml
codex_config_profile: first-project-permissive
```

`permission_policy` 保持缺省，或设为 `none`，且不要有成员级 YOLO 覆盖。OpenRig 随后会传入 `-p first-project-permissive` 而非默认的 `-s workspace-write`，两个设置都由原生 profile 提供。优先级更高的原生项目配置或托管要求仍可能更改/拒绝该结果。派活之前先查看原生 `/status`。

```sh
rig policy current --spec ./openrig-specs/rigs/launch/first-project/rig.yaml
rig up ./openrig-specs/rigs/launch/first-project/rig.yaml --cwd . --plan
rig up ./openrig-specs/rigs/launch/first-project/rig.yaml --cwd .
```

OpenRig 的 `permission_policy: builtin:yolo` 设置会在全新、恢复与分叉启动时选择 `-s danger-full-access -a never`，取代具名 profile 参数。当你想把这些选择维护在原生配置中时，上面的 profile 配方仍然有用。仅靠环境变量的旧式 `OPENRIG_YOLO=1` 路径在无已解析策略时仍只作用于沙箱。独立运行的 `codex --yolo` 命令不是 OpenRig 的设置。

要让下一次启动回到受限状态，把所选 profile 改为：

```toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[sandbox_workspace_write]
network_access = false
```

### 逐席位权限模式

权限模式是原生的执行选择；工作姿态是项目层面的指引。对既有的托管席位，显式选定未来启动的权限：

```sh
rig seat set-permissions owner@first-project --mode full_bypass --reason "Operator selected broader access"
rig seat status owner@first-project --json
```

它会把操作者、理由以及新旧选择记录在该席位上。它不会重启该席位、更改原生历史、改动同级席位，也不会编辑权限规则/钩子。之后的生命周期操作仍是单独的决定。显式的席位选择会覆盖继承的成员/rig 策略；`--mode inherit` 清除该选择但不改动被继承的策略。`floor` 选择既有的普通启动路径（配置了 Codex 具名 profile 时也包括它）；它不会重写原生 profile，也不强制其审批设置。

Codex 与 Claude 接受 `floor` 和 `full_bypass`。其余 Claude 原生模式（包括 `auto`）需要托管可执行文件的 help 中声明支持。OpenRig 在席位绝对工作目录下解析其托管启动 PATH 上的第一个可执行文件，然后用这个确切路径进行发现与启动。它不使用交互式 shell 的别名，也不使用被 shell 修改过的 PATH。相对的 PATH 条目与相对的 `CLAUDE_CONFIG_DIR` 从席位目录解析。

对这些显式原生模式，全新、恢复、分叉与旧式恢复都使用同一套托管环境：PATH、HOME、`CLAUDE_CONFIG_DIR`（默认 HOME/.claude）以及已配置的 classic-renderer 设置。其他 shell 定制被排除在外。既有的托管身份与允许列表中的提供商认证通道按变量名保留；凭据不会被复制进启动命令或能力证据。运行 help 时不带该凭据通道。既有的登录文件仍留在托管 home 之下。选定模式之前，请刻意配置守护进程的托管启动环境；这不是对任意交互式 shell 的探测。

每次选定以及之后的每次启动都会重新检查支持情况，不使用缓存。节点/占用者、绑定、cwd、可执行文件或能力环境一旦变化，下一次检查就会拒绝：help 之后、选定/审计变更之前，以及粘贴并回车之前一刻。有效粘贴之后失败属于输入不完整，既不是启动成功，也不表示早先输入已回滚。拒绝时既有的显式选择保留不变；不会挑选回退项。普通与继承的启动路径不受影响。status 响应会区分期望设置、与生成绑定的启动参数，以及未经验证的原生效果。在授权启动之后，先检查原生会话，再宣称其实际权限行为。

rig 级的动词是 `rig policy permissions list`、`show`、`current` 与 `apply`。既有的 `rig policy list/show/current/apply` 仍是兼容别名，JSON 与退出行为一致。Pi 资源信任与逐席位输入防护是独立的控制。

### Claude Code：另一个启动旗标

随附的 `first-project` 使用 Codex。对用户自有的 **Claude Code** rig，OpenRig 通常传入 `--permission-mode acceptEdits`：编辑可以继续，其他动作则遵循原生规则与提示。它不会添加全局 `Bash(rig:*)` 许可规则。要为该 rig 显式选择绕过启动旗标：

```sh
rig policy apply yolo --spec ./my-claude-rig/rig.yaml
rig policy current --spec ./my-claude-rig/rig.yaml
```

这会记录 `permission_policy: builtin:yolo`；下一次托管启动将传入 `--dangerously-skip-permissions`。成员级策略优先。要让未来启动回到 OpenRig 的 `acceptEdits` 模式，使用 `rig policy apply none --spec ./my-claude-rig/rig.yaml`，并移除任何成员级绕过覆盖。原生规则与托管限制仍然有效；该旗标不是关于沙箱或账号访问的承诺。参见 [Claude 权限](https://code.claude.com/docs/en/permissions)。

**已在运行时**：修改文件或运行 `rig policy apply` 不会撤销在运行智能体的权限，也不会在恢复时重写已存储 rig 的策略。暂停工作，并为该会话使用原生权限控制（当前的 Codex 与 Claude CLI 都提供 `/permissions`）；再次检查生效的模式。后续启动保持启动 spec/profile 一致。若原生版本无法就地应用变更，保留工作，并在检查其保留策略后使用受支持的同席位停止/恢复路径；不要为了重置权限而删除 rig 或另起一个重复的。恢复可能重新套用已存储的启动模式，因此在继续工作前请再次核实原生模式。

## 自定义设置与优先级

- **OpenRig**：成员的 `permission_policy` 覆盖 rig 的 `permission_policy`。两者都未设置时，普通托管启动会显式绑定默认模式；在客户端 shell 里导出 `OPENRIG_YOLO=1` 不是可靠的按团队配方。自定义策略文件相对于声明它的 rig spec，不允许绝对路径或 `..`。`surface: flag` 选定一个启动模式。配置呈现面策略（`locked`、`standard`、`open` 或自定义）描述的是意图：记录其中之一并不会翻译并执行其规则。实际的原生设置需要另行应用与检查。参见 [RigSpec 权限策略参考](/reference/rig-spec/#挂接权限策略)。
- **Codex**：个人设置位于 `~/.codex/config.toml` 或 `CODEX_HOME`；受信任的项目设置位于 `.codex/config.toml`。当前优先级为：CLI 覆盖、受信任的项目设置、所选 profile、用户设置、（若提供）云端默认值、Unix 上的 `/etc/codex/config.toml`，最后是内置默认值——一切以托管要求为准。OpenRig 显式沙箱旗标优先于文件中的 `sandbox_mode`；自定义沙箱请改用 `codex_config_profile`。若要在保留审批的同时允许工作区编辑带网络访问，请使用具名 profile，其中 `sandbox_mode = "workspace-write"`、`approval_policy = "on-request"`，且 `[sandbox_workspace_write]` `network_access = true`。这会授予一般性的网络访问，而不只是访问本地守护进程。参见 [Codex 配置](https://learn.chatgpt.com/docs/config-file/config-basic)与[沙箱/审批控制](https://learn.chatgpt.com/docs/agent-approvals-security)。
- **Claude Code**：使用 `~/.claude/settings.json`、共享的项目 `.claude/settings.json`，或个人的项目 `.claude/settings.local.json`。托管设置的优先级高于启动旗标，其后依次是项目本地、项目共享与用户设置。权限规则列表会合并；更高层级的 allow 不能用来压过 deny。OpenRig 的 `acceptEdits` 启动旗标覆盖文件中的 `permissions.defaultMode`；选定的运行时资源也可能合并进项目本地设置。参见 [Claude 设置与优先级](https://code.claude.com/docs/en/settings)与 [OpenRig 运行时配置披露](/reference/agent-startup-guide/#运行时配置披露)。

这些配方并未覆盖每一种提供商/版本/配置组合。请检查已安装版本与生效设置。较新的权限 profile 或自动评审功能是提供商的选择，不是 OpenRig 的隐含能力。选择某些规则或更宽的模式不会改变随附默认值。
