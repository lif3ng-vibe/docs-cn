---
title: "智能体操作的系统健康诊断"
---

当已配置的检测器需要解读时，System Health 可以向负责的智能体提供一份持久的调查包（investigation packet）。该包保存发现（finding）、策略版本、证据以及当前权威文档。它邀请智能体在该选集之外继续调查，包括智能体自身的贡献。它不宣告病理（pathology），也不执行纠正动作。

## 启用有界诊断循环

仅限流程的诊断还要求在发现所解析出的 scope 上有显式的委托运行姿态（delegated operating posture）。对已解析但未设置的 scope，人主导（human-led）是可见的产品默认值；失败或含糊的 scope 读取保持未知。两种情况下发现都保持可检查。关于有意的流转、阶段/来源信息与共享健康契约，见 [scoped operating posture](/reference/scoped-operating-posture/)。

```sh
rig health policy --json > effective-policy.json
jq '.policy' effective-policy.json > health-policy.json
# Edit health-policy.json: diagnosis.enabled=true and diagnosis.owner=<seat@rig>.
rig health policy --file health-policy.json
rig health diagnose                    # preview; no writes or wakes
rig health diagnose --apply            # evaluate now and apply admitted actions
rig health diagnosis list
rig health diagnosis show <qitem-id>
```

`diagnosis list` 与 `diagnosis show` 在文本和 JSON 两种形态下都默认输出摘要。详细的文本摘要显示队列状态、负责人（owner）、阻塞者（blocker）、处置（disposition）、不确定性、发现标识与权威引用。摘要 JSON 另保留仪式依据（ceremony basis）与当前回执标识。它保持原有的对象/数组形状，并新增 `readView`：`complete`、`omittedFields`（路径、JSON 字节数与数组计数）、`fullJsonBytes`，以及确切的 `fullCommand`。调查包副本、权威内容、证据数组与诊断回执账本被显式省略。当前的工作流回执信封仍保留，其中 `evidenceIdentity` 携带已识别的裁剪/候选（cut/candidate）、判定（verdict）与证据引用字符串；其不透明的证据被省略。这些标识标签并不能验证一份回执。摘要不是完整证据。字节数描述的是不带结尾换行的紧凑 JSON 序列化，不是模型 token 数。

若调查或既有消费者需要先前的完整 JSON：

```sh
rig health diagnosis show <qitem-id> --full --json > diagnosis.json
rig health diagnosis list --full --json > diagnoses.json
```

`--full` 不带 `--json` 时以格式化 JSON 打印完整记录。这些展开可能很大。普通 `--json` 不再包含全部证据字段；请把这些字段的消费者迁移到 `--full --json`。HTTP API 响应与变更结果 JSON 不变。智能体对诊断采取行动之前仍然需要完整上下文；生成的调查包中写明了那条命令。

守护进程每分钟检查一次已启用的策略。`health policy` 报告该检查是否已排程及其最近一次结果（含错误）。普通的 `health` list/explain 命令保持只观察性质。诊断默认关闭；仪式放大（ceremony amplification）是默认情况下唯一的诊断触发器。一次持续的事件段（episode）保持一个 qitem，默认最多再接受一次呈报（presentation），并在多次事件段之间共享负责人冷却（默认一小时）。一次处置即停止再呈报。禁用策略会停止自动受理与呈报。负责人变更不会悄悄改道既有的发生项（occurrence）。
在托管席位之外，用 `rig health --actor <name> ...` 声明写入者身份。托管席位的传输身份优先于所声明的名称。
只有发生项被指派的负责人才能记录其处置或请求人工通知。其他智能体可以向负责人建言；策略负责人变更不会授予对既有发生项的保管权。写入会在队列流转上保留发送者的身份来源。

策略控制检测器启用、仪式/评审/唤醒阈值、来源观察窗口与新鲜度、诊断负责人、冷却、再呈报上限以及人工升级条件。直接编辑纯 JSON 并用命令应用；未知键与非法值会被拒绝，策略保持不变。
已应用的提案及其前身保留在所配置的 OpenRig home 下的 `health/policy-history/` 中。生效版本还包含既有的 `health.context_pressure.warning_percent` 与 `critical_percent` 设置，它们仍可通过 `rig config` 配置。默认值分别为 95 与 99。CLI/TUI 的发现说明会显示所用策略版本。

## 被动仪式诊断

普通的队列活动可以在没有健康检查点（checkpoint）的情况下受理一项诊断。该来源会发现观察窗口内被触碰的已声明交接（handoff）家族，使用其显式的 `project:` / `mission:` / `slice:` 标签与工作流成员关系，并收集确切的流转 ID、常规的 project/mission/slice 权威、进度与证明引用，以及工作流闭合证据。它绝不把 Markdown 解读、或把证明文件、审批、C1 结对、提交、测试或终端行当作已接受的产品成果来计数。

达到配置的流量阈值（默认 20 条流转）时，一个新鲜且完整的家族会变为 `ceremony.stage=needs-diagnosis`、`status=indeterminate`、`severity=info`。CLI/TUI 称之为**需要诊断**（needs diagnosis），而不是已确认的警告。已启用的诊断策略会受理一份有界调查包，即便产品分母未知。普通的不可用/过期检测器记录仍然不合格。诊断与人工通知流量不计入分子，也不能递归生成另一次调查。

智能体读取真实证据（包括所给引用之外的部分），并确定语义层面的成果粒度与后果边界。使用既有的处置命令，附带可选的 `progress` 结果：

```json
{
  "basis": "<current finding.ceremony.basis from diagnosis show>",
  "conclusion": "established",
  "outcomes": [{"id": "<distinct meaningful outcome>", "observedAt": "<time inside the measured interval>", "evidenceRefs": ["<normal proof path>"]}],
  "boundedAuthority": false,
  "boundary": "<selected SDLC boundary and why this outcome census covers the interval>",
  "evidenceRefs": ["<inspected authority/evidence path>"],
  "missingFacts": []
}
```

把这个对象放进 `progress`，与既有的 verdict/steering/uncertainty 字段并列。`established` 肯定对该确切区间完成了一次完整普查；空的成果列表肯定的是零成果，而不是发现失败。当不再有缺失事实时，`false-positive` 在不虚构分母的情况下清除嫌疑。仍点名缺失事实的 false-positive 评估保持 indeterminate，且不关闭事件段区间。`indeterminate` 不提供任何成果，并在 `missingFacts` 中点名缺失事实。必需引用必须能解析到工作区之内；初始调查包之外的额外证据是允许的。回执保留真实的行动者、时间戳、身份来源、来源依据与证据哈希。依据已变更时会拒绝过期的提交。后续证据变化会让确认变为 indeterminate，而不是保住一个虚假比率。成果含义始终归于署名的智能体判断。

只有 established 且当前有效的评估才允许产生比率。投影器（projector）用列出的去重成果与确切流转来计算它；一个达标且没有有界权威反向信号的比率会变为 `confirmed` / `active` / `warning`。成比例或有界权威的结果会清除该事件段。显式清除的评估标志该区间的结束；同一家族后续足够的流量会开始新的事件段。重复读取永不推进这些边界。每个事件段适用一次发生项与既有的负责人冷却；一次处置即停止重复请求。

这个有界来源覆盖显式关联的项目或任务工作：至多 2,000 个被触碰的 qitem、200 个根、每家族 1,000 个成员 / 10,000 条流转、200 份工作流回执、200 个已声明切片，以及每个所选切片 100 个证明文件。超限会被显式拒绝。上下文文件限定为 64 KiB。起始于保留窗口之前的谱系（lineage）保持 indeterminate，并点名缺失区间。
项目规划不需要后继任务（mission）：显式的项目身份即可解析其当前上下文，mission 与 phase 在无证据时缺席。
未关联或含糊的工作保持未知 scope，不能推断受托中断。缺席不是健康。调查包包含缺失的上下文引用，让智能体能够点名或修复自己的知识缺口，而不伪造来源真相。

## 可选的成果边界检查点

实时的队列流转本身并不能证明产品成果，也不能证明一次有界操作的权威。在一个有意义的成果边界上，掌握这些事实的智能体可以为一条 qitem 谱系与时间窗提交一次普查。设置 `includeHandoffs: true` 以跟进其声明的交接后代；这是在席位之间传递过的工作的正常路径。只看根通常错过评审/退回流量。
优先使用既有的 proof/progress/outcome 工件作为证据。不要给每次编辑或消息都加检查点。这是为显式提供的证据准备的回退；正常活动使用上文所述的被动诊断。已存在的检查点拥有自己的谱系，被动来源因此不会创建重复的事件段。

```json
{
  "schema": "openrig.health-checkpoint/v0alpha1",
  "lineageQitemId": "<existing-product-qitem>",
  "includeHandoffs": true,
  "scope": {"type": "slice", "projectId": "<project>", "missionId": "<mission>", "sliceId": "<slice>"},
  "startedAt": "<ISO timestamp>",
  "observedAt": "<ISO timestamp>",
  "transitionIds": "derive",
  "productOutcomes": [
    {"id": "<outcome-id>", "observedAt": "<ISO timestamp>", "evidenceRef": "<proof-artifact-path>"}
  ],
  "productCensusRef": "<artifact establishing the complete outcome census for this lineage/window>",
  "boundedAuthority": {"applies": false, "evidenceRef": "<bounded-effect-authority assessment>"},
  "sdlc": {"expectation": "<selected components and review boundary>", "evidenceRef": "<authority for that selection>"},
  "authorityPaths": {
    "project": ["<current project SPEC and project.yaml paths>"],
    "mission": ["<current mission SPEC and mission.yaml paths>"],
    "slice": ["<current slice SPEC and slice.yaml paths>"]
  }
}
```

```sh
rig queue transitions <existing-product-qitem>
rig health checkpoint --file checkpoint.json
rig health --instance --json
```

`transitionIds: "derive"` 要求既有的提交命令一次性收集完整普查，然后把确切 ID 保留在检查点及其审计中。作者提供成果及其含义，而不是逐行记账的仪式。为封存重放（sealed replay）或调用方提供的普查，也支持显式 ID 数组。后续读取绝不悄悄扩展这两种形式。

守护进程会验证流转 ID 恰好是该 qitem 与时间窗的完整普查，选择时包含全部交接后代。它不会从相似名称或席位名称推断共享谱系。完整流转普查可以从队列账本拼出；遗漏一个后代会遭拒绝。
被计数家族成员上显式的 mission/slice 标签必须与检查点 scope 匹配；未打标签的后代继承声明的交接关系。
上限是 1,000 个关联 qitem 与 10,000 条流转；超大家族会被拒绝，而不是被悄悄抽样。相互独立的根各自算独立普查。它统计那些流转与去重的、有证据的产品成果，并解释比率的两侧、字面的门标签（gate-tag）分解，以及所选的 SDLC 期望。这些是保管/状态流转，不是消息，也不是对每次评审是否有用的判断。产品成果是一个去重的、有证据的用户可见结果；为达成同一承诺结果所需的提交、测试运行、退回与修复并不各自制造另一个分母单位。普查必须声明其成果粒度与覆盖范围。正向与成比例控制必须使用同一粒度。空成果列表与非空列表需要同样的普查证据。不可用的产品普查是空分母：说明中写明未计算比率，而不是悄悄代入零或一。
`boundedAuthority.applies=null` 表示未知，绝非 false。
缺失 SDLC 选择（包括没有 `sdlc` 的较老检查点）会让达标信号变为 indeterminate。引用对测量窗口生效的权威，而不是其后的更正。比率只是标记一次检查；智能体在诊断放大之前，先把它与该选择及后果证据对照。产品成果含义、所选 SDLC 与有界效应权威始终是署名的手写证据；它们不因被摄取而自动成立。发现会标注该来源并使用中等置信度。必需的证据引用必须解析到所配置工作区内非空、可读的本地文件（至多 1 MiB）。支持绝对路径与相对该工作区的路径；其他引用种类（包括节地址）仍然不可用。已解析证据记录携带 SHA-256；缺失文件与符号链接逃逸仍作为署名主张保留，但会强制来源真相变为 indeterminate，且不能受理诊断。可用性在每次投影时都会重新检查；在场并不能证明工件的含义。
这份权威评估不同于提供给诊断智能体的 project/mission/slice 文档。可嵌入的权威限于对应工作树节点上规范的 `SPEC.md` 与 project/mission/slice YAML 文件，各至多 64 KiB。其他路径与符号链接别名会被报告为不可用，且不嵌入其内容。
每个条目保留其权威层级。项目文件必须位于所配置的项目根；mission 文件必须属于该发现的 mission；slice 文件还必须有一个声明该发现 slice ID（以及在有声明时匹配 mission）的兄弟 `SPEC.md`。兄弟切片或另一个 mission 即使文件名规范也不可用。没有 mission/slice scope 时，这些权威层级保持不可用。

## 当前所选上下文与更正

`diagnosis show` 与 `list` 在 `authorityReadAt` 刷新顶层 `authority`。最初的 `packet.authority` 与呈报回执保持为历史快照。当保留的调查包早于本指引时，当前的 `guidance` 仍然可用。完整读取包含内容；摘要保留地址、哈希、可用性、选择来源以及不可用来源的原因。

读取器复用 `project.yaml` 的 `install.context` 与所选的 `lifecycle.profiles[profile].workflow.context_refs`，加上当前 mission 的 `lifecycle.workflow.context_refs`。项目所有者可以在那里选择规划权威与相关因果更正，甚至在任何 mission 存在之前：

```yaml
install:
  context:
    - PREFLIGHT.md#current-authority
    - evidence/process-correction.md
```

这些是手写的选集，不是推断出的权威，也不是可执行的采纳。路径相对于声明它的清单解析，且必须留在解析后的项目之内。本地 `file.md#h2/h3` 地址使用既有的 Markdown 读取器。缺失/含糊的节、别名、不支持的地址、未知 scope 以及选集中缺失的文件保持不可用。不会递归跟随链接，也不会猜测后继 mission。读取器至多接受 32 个所选地址，每个源文件至多 64 KiB，所选内容总量至多 128 KiB；超限以不可用引用的形式可见。节的哈希恰好覆盖返回的节字节。裸库引用与远程 URL 不由这个本地读取器抓取。

权威与当前有用性是两个问题。一次不完整的全局成果普查，不能为一个前提已被证伪的特定限制辩护其继续保留。在解读历史处置之前先读当前更正，保留无关的有效边界（如发布权威），并把自动唤醒/回执记账与有用的负责人动作区分开。
正常的交互式规划本身不是病理。在评估中说明这次中断的相关性与成本；不要把这个信号变成反复的自我审计，也不要要求一个普适的外部评审者。

检查点在 `health/checkpoints/history/` 下接受审计；重放完全相同的字节不写入任何东西。后续普查推进观察时间。高到高的观察保留事件段身份；一个清除性检查点加上之后的复发，产生一个已清除事件段和一个新 ID。读取从不更新检查点状态。
过期、不可用、自相矛盾、被裁剪或缺失的证据不能受理诊断。没有发现不是健康的断言。当前来源上限是每个检查点 200 条谱系、10,000 条流转与 1,000 个产品成果，每份输入 1 MiB。不受支持或非法的来源会显式失败。

## 调查并记录处置

阅读确切证据与当前权威。追查模式从哪里开始，检验你自己的动作是否放大了它，并区分是另一个席位还是过期引导。第二意见是可选的。调查包是一个起点，不是封闭的证据集。

```json
{
  "verdict": "insufficient evidence",
  "causalStart": null,
  "steering": "Inspect the missing outcome evidence; apply separately established corrections within current authority.",
  "uncertainty": "The cited artifact does not yet establish the denominator.",
  "evidenceRefs": ["<inspected-evidence-path>"]
}
```

```sh
rig health diagnosis record <qitem-id> --file disposition.json
rig health diagnosis show <qitem-id>
```

判定取值为 `false positive`、`early real condition`、`established pathology`、`insufficient evidence` 或 `resolved`。处置保留在诊断 qitem 的流转上，在 CLI 输出与队列中可见。记录处置不会关闭或改动底层的产品工作。变更后的处置保留先前的证词；完全相同的重放是无操作。检测器清除与智能体宣告问题已解决分别记录。

可选的 `correction` 把因果判断、提议或已采取的动作，以及后续行为效果分离开。它不要求完整的 `progress` 普查。例如，一个保留案例（retained-case）评估可以记录：

```json
{
  "applicability": "The retired emergency restriction no longer applies; publication still needs its separate decision.",
  "causalJudgment": "The retained trace attributes persistence of the restriction to a disproved premise.",
  "action": {"state": "taken", "summary": "The authorized restriction was retired in the retained case.", "evidenceRefs": ["evidence/correction-action.md"]},
  "effect": {"state": "unobserved", "summary": "No later natural opportunity has been observed.", "evidenceRefs": []}
}
```

把这个对象放进既有处置中 `verdict`、`causalStart`、`steering`、`uncertainty` 与 `evidenceRefs` 旁边。动作状态是 `proposed` 或 `taken`；效果状态是 `unobserved` 或 `observed`。每个被引用的工件必须在本地可用；`taken` 与 `observed` 各自要求证据。这些检查确认的是可用性，不是因果真相。回执保留证据哈希，`assessment` 标明真实的队列行动者、时间与流转。
`behavioralEffect` 是最近一任负责人报告的效果，遗留（legacy）处置默认为 `unobserved`。它不是一份独立认证。后任负责人的提交保留先前证词。只有真实的后续机会才可记录已观察效果，需连同其下一个决策、有用工作、复发与中断负担；脚本化重放只证明机械运作。关闭一行、改一个提示词或清掉一个数值信号，永远不会自动供出那种证据。没有机会就是 unobserved，发布主张留给其决策所有者。本指引既不重新启用诊断，也不分派纠正工作。

## 人工送达

被指派的智能体可以显式请求人工升级：

```sh
rig health diagnosis notify <qitem-id>
```

它要求一个已注册的 `human.address` 与一条已受理的 `human.conditions` 条目（`critical`、`established pathology` 或 `confirmed ceremony`）。连接器必须启用并通过实时就绪检查。当前连接器实现验证 Slack scope 与频道成员关系；诊断服务本身使用一个传输中立的就绪端口。既有的网关拥有送达策略与发布。每个事件段保留一次人工请求，其实际送达结果来自队列回执。`pending` 绝不会被呈现为 `posted`。
检查返回 qitem 的流转即可看到连接器回执。没有任何周期性健康检查会执行修复。设置 `human.conditions=["confirmed ceremony"]` 时，已启用的诊断循环会为一个活跃、已确认的被动仪式事件段自动请求一次通知。临时、indeterminate、已清除与过期的事件段从不通知。效果由既有的就绪/网关路径负责；未就绪的连接器会留下一条可见、去重的就绪回执。后续检查可以重试就绪，但绝不为既有事件段创建第二次请求。
只读的 list/explain/preview 命令从不发送。

## 只读消费者与校准

诸如日后 Herder 插件之类的消费者读取 `GET /api/health` 与 `GET /api/health/:findingId`，或完全相同的 `rig health --json` 与 `rig health explain <finding-id> --json` 记录。记录 schema 是 `openrig.health/v0alpha1`；列表元数据是 `openrig.health-list/v0alpha1`。请把 ID、状态、策略版本、时间窗、新鲜度、证据与阈值保持在一起。没有健康分数，也没有隐含的修复权威。
默认列表排除已清除记录；显式的 cleared 查询与精确 ID 读取在其来源仍可投影它们时保留它们。清除后的复发获得新的事件段 ID。这是按需投影，不是历史存储；详情 404 不能证明已解决。

列表默认 100 条、上限 200 条，`total` 与 `truncated` 显式给出。仪式发现在上限之前优先，使上下文压力无法遮蔽主信号。查询被截断时请收窄范围；不要为未见的剩余部分背书。空不是健康，不可用不是空，indeterminate 的发现不能授权一次诊断发生项——上文所述显式且新鲜的 `needs-diagnosis` 被动候选除外。既有发生项在其来源变为 indeterminate 时可以收到一条状态观察回执；这不会创建另一条待办义务或唤醒。

实时来源提供上下文压力、被动仪式候选与署名评估，外加可选的仪式检查点。
行为与认知类别有意不设检测器。评审轮换（review carousel）、冗余唤醒、过期指令与 scope 受理各有类型化评估器与重放控制，但实时来源不会推断它们缺失的候选变更、营救、指令冲突或受理权威事实。
未打标签的工作与未声明的关系仍在被动仪式覆盖之外；正常打标签的工作不再需要专门的成果普查。低于配置阈值的小谱系仍可能值得智能体查看；阈值是一个保守的受理规则，不是好流程的定义。

`packages/daemon/scripts/probe-health-calibration.mjs` 在 daemon/CLI/TUI 构建之后接受一份封存重放导出与输出目录。它驱动编译后的 checkpoint/list/explain/diagnosis 命令，渲染 TUI，保留确切记录与屏幕，比较读取前后的数据库与文件系统效果，并对照声明的预算测量查询成本。每次写入都使用一次性 home 与数据库。历史期望状态必须独立于检测器公式来奠基；不完整的成果证据是一个 indeterminate 案例，不是分母为一。校准报告描述其所选语料与剩余盲区，不是全机群的假阳性率。
