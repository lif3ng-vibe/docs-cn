# GLOSSARY — OpenRig 文档汉化术语表

> 所有翻译子代理必须全文遵循本表。终检时按本表 grep 全站核对一致性。
> 术语首次出现附英文原词：知识图谱（knowledge graph）；此后中文裸用。

## 一、译法表（英文 → 中文）

| 英文 | 中文 | 备注 |
|---|---|---|
| seat | 席位 | 一个 agent 占一个席位；地址 `owner@rig` 中是名称不译 |
| daemon | 守护进程 | 首次「守护进程（daemon）」，后文「守护进程」 |
| kernel | 内核（kernel） | kernel rig = 内核 rig；内核就绪 ≠ 守护进程健康 |
| rig | rig | 概念名不译（一个 rig = 一个协作团队实例）；内联代码一律 \`rig\` |
| provider | 提供商 | Claude Code / Codex / Pi |
| harness | 运行框架 | 指宿主 CLI（Claude Code、Codex 这类） |
| recipe | 配方 | first-project 等预置配方 |
| starter | 预置模板（starter） | `first-project` 等 starter 名称不译 |
| outcome owner | 成果负责人 | 简称「负责人」 |
| independent checker | 独立检查者 | 简称「检查者」 |
| checker | 检查者 | |
| teammate | 队友 | |
| lead agent | 主导智能体 | |
| specialist | 专家（智能体） | 视上下文 |
| agent | 智能体 | 全站统一，不用「代理」「AI 助手」 |
| assignment | 指派 | |
| claim | 认领 | |
| handoff | 交接 | |
| park | 搁置 | 队列操作动词：搁置（park） |
| queue | 队列 | `rig queue` 命令名不译 |
| qitem | 队列条目（qitem） | |
| entry qitem | 入口队列条目 | |
| mission | 任务（mission） | scope 持久工件；与泛指的 work 区分 |
| slice | 切片 | |
| workspace | 工作区 | |
| work tree | 工作树 | projects/missions/slices 所在的磁盘结构 |
| workflow | 工作流 | `rig workflow` 命令名不译 |
| instance | 实例 | workflow instance = 工作流实例 |
| lifecycle | 生命周期 | |
| snapshot | 快照 | |
| restore | 恢复 | |
| handover | 交接 | |
| compaction | 压缩 | 上下文压缩 |
| agent image | 智能体镜像 | |
| context pack | 上下文包（context pack） | |
| transcript | 会话记录 | |
| transport | 传输 | 传输层 |
| probe | 探测 | auth probe = 认证探测 |
| preflight | 预检 | |
| permission policy | 权限策略 | |
| allowance | 许可规则 | command allowance = 命令许可规则 |
| sandbox | 沙箱 | |
| approval | 审批 | approval policy = 审批策略 |
| fresh start / fresh conversation | 全新开始 / 全新会话 | 与 resume 相对 |
| resume | 恢复 | |
| fork | 分叉 | |
| operator | 操作员 | kernel 的 operator 席位；指人时译「操作者」 |
| occupant | 占用者 | 席位占用者 |
| obligation | 待办义务 | 队列语境 |
| transitions | 流转 | queue transitions = 队列流转记录 |
| watchdog | 看门狗（watchdog） | |
| steering | 引导 | |
| artifact | 工件 | |
| allowlist | 允许列表 | |
| managed | 托管 | managed seat/launch = 托管席位/托管启动 |
| native | 原生 | native rules = 原生规则（指 Claude Code/Codex 自身机制） |
| scope | scope | 命令/子系统名不译：`rig scope` |
| intent | 意图 | project intent = 项目意图 |
| surface | 呈现面 | content surfaces = 内容呈现面；视上下文可作「界面」 |
| classification | 分类 | |
| wake | 唤醒 | wake defaults = 唤醒默认值 |
| permissions | 权限 | |
| precedence | 优先级 | 设置优先级链 |
| detach | 分离 | tmux detach = 分离 |
| attach | 接入 | attach to terminal = 接入终端 |
| pod | 工作舱 | TUI 术语，终检时按 TUI 文档复核 |
| endpoint / address | 端点 / 地址 | seat address = 席位地址 |
| readiness | 就绪 | kernel readiness = 内核就绪 |
| provenance | 来源 | disk provenance = 磁盘来源 |
| posture | 姿态 | work posture = 工作姿态；scoped operating posture 见具体篇 |
| fidelity | 忠实度 | |

## 二、不译名单（产品/命令/标识符/专有名）

OpenRig、rig（代码语境）、Codex、Claude Code、Claude、Pi、tmux、Herdr、cmux、
Node.js、npm、npx、YAML、TOML、JSON、MDX、MCP、TUI、WSL2、macOS、Linux、
Apple silicon、Apache-2.0、Vercel、AgentSpec、RigSpec、RigBundle、edge type（规格名，
正文可释为「边类型（edge type）」）、gpt-6-astra、operator-human、first-project、
first-project-claude、first-project-mixed、CODEX_HOME、CLAUDE_CONFIG_DIR、
OPENRIG_YOLO、openrig-specs、qitem（代码语境）、`rig` 全部子命令
（send/queue/tui/up/ps/status/specs/grow/scope/workflow/policy/seat/context/
setup/daemon/terminal/workspace/doctor…）、所有环境变量、文件路径、配置键。

## 三、排版与风格规则（与 skill 同步）

- 中文全角标点：，。：；？！、（）「」不用；引号一律用 ""（不用「」）；破折号——不带空格。
- 中英文/数字之间一个半角空格；代码、命令、路径内保持半角原样。
- 意译；术语首次出现附英文原词；产品名/命令不译。
- **粗体 CJK 闭合规则**（必守）：粗体闭合 `**` 前若是全角标点且后紧跟文字则无法闭合，
  页面显示字面 `**`。句读/括注一律移出粗体：
  - `**……。**后文` ✗ → `**……**。后文` ✓
  - `**标题：**正文` ✗ → `**标题**：正文` ✓
  - `**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓
  - 粗体结尾是文字或行尾则无问题。
- 代码块、命令、CLI 输出、报错原文、配置键一律不译；`#` 外的代码注释不译；
  **命令清单里的 `#` 注释要译**。
- frontmatter：title 译成中文（保持一句话）；description 译（若无则不新增也行，
  有则必译）；slug 不新增不改（保持 URL 与文件名一致）。
- 原文 H1 已剥离（frontmatter title 即页面标题），正文从 H2 开始。
- 原文中的相对链接（`../reference/foo.md`、`#anchor`）：**路径一个字都不改**，
  只译链接文字；`#anchor` 锚点保留原样，由后续统一回修脚本处理。
- "某次变更"不用"一次变更"；"接入"不用"接线"；保持原文严谨语气，不添油加醋。

## 四、发布说明固定标题译法（releases/ 全部 37 篇必须一致）

| 英文标题 | 中文标题 |
|---|---|
| Summary | 摘要 |
| Included In This Release | 本版包含内容 |
| User-Facing Changes | 用户可感知的变化 |
| Operator / Setup Notes | 运维/安装注意项 |
| Known Limitations | 已知限制 |
| Verification Performed | 已执行的验证 |

## 五、as-built frontmatter 处理

`kind/status/topics/domains/siblings/prerequisite-reads/last-verified-against-source/last-updated`
等键与值一律原样保留；仅 `title` 译中文、`applies-when` 多行说明译中文。

## 六、终检补充批次（终检时统一回写）

| 术语 | 分歧译法 | 定稿 |
|---|---|---|
| （待终检填写） | | |
