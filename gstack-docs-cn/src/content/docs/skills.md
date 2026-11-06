---
title: "技能深度指南"
---


每个 gstack 技能的深度指南——哲学、工作流与示例。

| 技能 | 你的专家 | 他们做什么 |
|-------|----------------|--------------|
| [`/office-hours`](#office-hours) | **YC 办公时间** | 从这里开始。六个逼问式问题（forcing question）在你写代码之前重新框定你的产品。质疑你的问题框定，挑战前提，生成实现备选方案。设计文档喂给下游每一个技能。 |
| [`/spec`](#spec) | **规格作者** | 五个阶段把模糊的意图变成精确、可执行的规格。产出可直接进 backlog，下游技能可以接手。结尾可选拉起一个 agent。 |
| [`/plan-ceo-review`](#plan-ceo-review) | **CEO / 创始人** | 重新思考问题。找出藏在需求里的十星（10-star）产品。四种模式：扩张、选择性扩张、维持范围、收缩。 |
| [`/plan-eng-review`](#plan-eng-review) | **工程经理** | 锁定架构、数据流、图表、边界情况和测试。把隐藏假设逼到明面上。 |
| [`/plan-design-review`](#plan-design-review) | **资深设计师** | 交互式计划模式设计评审。每个维度打 0-10 分，解释 10 分长什么样，修复计划。在计划模式下工作。 |
| [`/design-consultation`](#design-consultation) | **设计伙伴** | 从零构建完整的设计系统。了解业界格局，提出有创意的冒险，生成真实感的产品视觉稿。设计居于其余所有阶段的中心。 |
| [`/review`](#review) | **资深工程师** | 找出能通过 CI 却会在生产环境爆炸的 bug。自动修复显而易见的那些。标记完整性缺口。建议性的简化镜头标记过度构建的代码——从不拦截，从不自动应用。 |
| [`/investigate`](#investigate) | **调试手** | 系统化的根因排障。铁律（Iron Law）：没有调查就没有修复。追踪数据流，验证假设，3 次修复失败后停下。 |
| [`/verify`](#verify) | **构建循环** | 跑仓库的检查项和 `/ship` 预门禁会为你的改动挑的测试，修掉坏的，重复到全绿，然后交接给 `/ship`。对没有测试映射的改动绝不报绿。 |
| [`/design-review`](#design-review) | **会写代码的设计师** | 线上站点视觉审计 + 修复循环。80 项审计，然后修复它发现的问题。原子提交，前后截图。 |
| [`/design-shotgun`](#design-shotgun) | **设计探索者** | 生成多个 AI 设计变体，在浏览器里打开对比板，迭代直到你批准一个方向。品味记忆向你的偏好倾斜。 |
| [`/design-html`](#design-html) | **设计工程师** | 生成生产级品质的 Pretext 原生 HTML。可与获批视觉稿、CEO 计划、设计评审协同，或从零开始。文字随窗口重排，高度随内容调整。按设计类型智能路由 API。React/Svelte/Vue 框架检测。预览经你的 Aside 浏览器渲染。 |
| [`/design-motion`](#design-motion) | **动效设计师** | 把获批设计变成展示循环：精确重建那一帧，从空状态加载，每个视觉一个故事，然后经接缝、静止和溢出检查后，产出给 X 的 MP4、网站 GIF 和 800×500 GIF。 |
| [`/qa`](#qa) | **QA 负责人** | 探索浏览器与功能行为（API、CLI、定时任务、worker、webhook），复现缺陷，证明回归测试在修复前失败，然后修复并复验。 |
| [`/qa-only`](#qa) | **QA 报告员** | 探索同样的面并提出带证据的回归用例，不改动产品代码或测试。 |
| [`/scrape`](#browse) | **浏览器数据提取器** | 从网页拉取结构化数据——表格、列表、价格——在你的 Aside 浏览器里带着页面真实的登录态进行。与 `/browse` 同一份驱动契约。在回退浏览器上，一个固化好的浏览器技能约 200ms 应答重复意图。 |
| [`/skillify`](#browse) | **技能固化器** | 回退浏览器技能：回溯你的对话，找到上一个 `/scrape` 原型，合成脚本 + 测试 + fixture，跑测试，提交前先问你。在 Aside 上，持久的按站自动化属于 Aside 自己的技能。 |
| [`/ship`](#ship) | **发布工程师** | 同步 main，跑测试，在有界范围内探索已变更行为，在最终验证前审计覆盖与文档，然后推送并创建或更新 PR。合适时自动引导测试框架。 |
| [`/land-and-deploy`](#land-and-deploy) | **发布工程师** | 合并 PR，等 CI 和部署，验证生产健康。一条命令从"已批准"到"已在生产验证"。 |
| [`/modernize`](#modernize) | **陈旧 PR 维护者** | 把老去的 PR 搬到当前基线上，并决定它是否还应存在：MODERNIZE、REWORK 或 CLOSE。读出 PR 之下移动了什么，找意义上的冲突，用 `git range-diff` 证明 rebase，带着钉在观察到的 head 上的 lease 推送，绝不自行关闭 PR。 |
| [`/canary`](#canary) | **SRE** | 部署后监控循环。在你的 Aside 浏览器里盯控制台错误、性能回归和页面故障。 |
| [`/benchmark`](#benchmark) | **性能工程师** | 页面加载时间、Core Web Vitals 和资源体积的基线。每个 PR 上做前后对比。随时间跟踪趋势。 |
| [`/ubicloud`](#ubicloud) | **远程执行器** | 在一台临时的 16-vCPU Ubicloud VM 上跑重型套件、构建或评测：TTL 命名的 VM 带回收器、配额预检、卡死看门狗和每个仓库一次已提交的验证。 |
| [`/runaway-stopper`](#runaway-stopper) | **支出守门员** | 找出失控（runaway）的 Capy 线程与子代理，在干净的点停下或轮换它们，并设置让它们不再回来的默认值。 |
| [`/cso`](#cso) | **首席安全官** | 带显式覆盖范围的有据安全发现。没有目录画像时静态评估依然可用；受控的运行时/扫描器执行需要匹配的合格画像。运行时测试过的 bundle 对独立的外部断言做认证。项目测试完成度保持 `self_reported`，因为目标代码控制着测试进程；`tested` 留给未来独立于目标的完成见证。 |
| [`/document-release`](#document-release) | **技术写作者** | 每次发布时在最终验证前审计相关文档；PR 已存在后也可以独立运行更新文档。抓出过时的 README，报告未解决的缺口。 |
| [`/document-generate`](#document-generate) | **技术写作者** | 从代码为某个功能生成 Diataxis（文档框架）文档（教程 / 操作指南 / 参考 / 解释）。 |
| [`/retro`](#retro) | **工程经理** | 团队感知的每周复盘。按人拆解、发布连胜、测试健康趋势、成长机会。 |
| [`/browse`](#browse) | **QA 工程师** | 给 agent 一双眼睛。优先经确定性的 `aside repl` 脚本驱动你的 Aside 浏览器——真实会话、真实点击、真实截图——Aside 不在时回退到 gstack 自带的 Chromium（每条命令约 100ms）。 |
| [`/setup-browser-cookies`](#setup-browser-cookies) | **会话管理器** | 把选定的 cookie 从 Chrome、Chromium、Brave、Edge、仅 Windows 的 Opera 和 Opera GX，或仅 macOS 的 Comet 和 Arc 复制进回退浏览器。选你的画像和域名；登录态单独检查。Aside 上不需要，它已经持有你的会话。 |
| [`/autoplan`](#autoplan) | **评审流水线** | 一条命令，一份完整评审过的计划。自动跑 CEO → 设计 → DX → 工程评审（工程永远最后，让发布门禁评审最终修订版计划），内置决策原则。只把品味决策呈给你批准。 |
| [`/plan-devex-review`](#plan-devex-review) | **开发者体验负责人** | 计划阶段 DX 评审。TTHW（time-to-hello-world）、魔法时刻、摩擦点、画像轨迹，以及为读它们的 agent 打分的错误消息（[面向 agent 的错误消息](/agent-ready-errors/)）。三种模式：扩张、打磨、分诊。 |
| [`/devex-review`](#devex-review) | **DX 测试员（实测）** | 实测开发者体验审计。走真实的上手流程，测 TTHW，抓出文档谎言，并以 agent 遇到报错的方式（无终端、受控、脱敏）经 `gstack-error-capture` 触发 CLI 报错。 |
| [`/plan-tune`](#plan-tune) | **问题调校器** | 按问题自调 AskUserQuestion 的灵敏度。把问题标记为永不问、总是问或仅单向问。 |
| [`/spec`](#spec) | **规格作者** | 五个阶段把模糊的意图变成精确、可执行的规格。提交一个 GitHub issue，可选在全新 worktree 里拉起一个 Claude Code agent，并让 `/ship` 在合并时关闭源 issue。 |
| [`/learn`](#learn) | **记忆** | 管理 gstack 跨会话学到的东西。评审、搜索、修剪并导出项目特有的模式与偏好。 |
| [`/context-save`](#context-save) | **保存状态** | 保存工作上下文（git 状态、决定、剩余工作），任何未来会话都能接续。 |
| [`/context-restore`](#context-restore) | **恢复状态** | 从已保存的上下文接续，甚至跨 Conductor 工作区交接。 |
| [`/health`](#health) | **代码质量仪表盘** | 包装类型检查器、linter、测试、死代码检测。算出加权 0-10 分；随时间跟踪趋势。 |
| [`/deslop-shared-libs`](#deslop-shared-libs) | **共享代码评审** | 在近期工作里找出值得做的共享代码抽取。只出建议。 |
| [`/write-skill`](#write-skill) | **技能编辑器** | 写或改进一个 agent 技能而不臃肿：编辑阶梯、逐级尺寸、技能到 bin 的漂移检查、带前/后测试的完整瘦身。 |
| [`/test-audit`](#test-audit) | **测试审计员** | 清扫既有测试里低价值、耦合实现或重复的测试。只出报告，除非你批准一批。 |
| [`/landing-report`](#landing-report) | **发布队列仪表盘** | 工作区感知的发布队列只读快照。哪些版本槽被占用、哪些兄弟工作区有 WIP。 |
| [`/captain`](#captain) | **编队控制器** | 用一个控制器跑很多编码 agent。车道构建并发送 READY block；控制器校验它，经列车合并（按需打戳、验证、以期望的 head 合并、再验证；`changelog_fragments` 下每槽 `train land`），维护摘要，以三种固定形态转达审批，并每天跑一轮不稳定修复。也响应 `/crew`。 |
| [`/benchmark-models`](#benchmark-models) | **模型基准测试** | 技能的跨模型并排基准测试（Claude vs GPT vs Gemini，外加经 OpenRouter 的 particle-1 和 DeepSeek V4.1 Flash）。延迟、token、成本、可选的 LLM 评审质量。 |
| [`/eval-plan`](#eval-plan) | **评测规划器** | 预注册一次付费评测（门槛、实验臂、诱饵、停止规则），用桩模型 $0 演练，试点三个计价项，然后从外推表批准支出。 |
| | | |
| **多 AI** | | |
| [`/codex`](#codex) | **第二意见** | OpenAI Codex 的评审、质询与咨询。在 Codex 宿主之外可用。 |
| [`/claude-code`](#claude-code) | **第二意见** | Claude Code 的评审、质询与咨询。在 Claude Code 宿主之外可用；用于 Codex 里的自动外部评审。 |
| [`/pair-agent`](#browse) | **远程 agent 桥接** | 把一个远程 AI agent（OpenClaw、Codex、Cursor、Hermes）与 gstack 自带的浏览器配对。范围限定的隧道、锁定的白名单、会话 token。回退浏览器技能；驱动 Aside 的 agent 自己开标签页。 |
| [`/setup-gbrain`](#setup-gbrain) | **记忆同步** | 设置 gbrain 做跨机器会话记忆同步。一条命令从零到上线。 |
| [`/sync-gbrain`](#sync-gbrain) | **保持大脑最新** | 对照本仓库的代码刷新 gbrain；教 agent 何时用 `gbrain search`/`code-def` 而非 Grep。幂等；可安全重跑。 |
| | | |
| **安全与实用** | | |
| [`/careful`](#安全与护栏) | **安全护栏** | 在破坏性命令（rm -rf、DROP TABLE、force-push、git reset --hard）前告警。任意 MEDIUM 告警可覆盖；root/home 递归删除与默认分支强推硬性拒绝。常见构建清理已加白。 |
| [`/freeze`](#安全与护栏) | **编辑锁** | 把所有文件编辑限制在单一目录。拦下边界外的 Edit、Write 和 NotebookEdit。调试防误伤。 |
| [`/guard`](#安全与护栏) | **全面防护** | 一条命令合并 /careful + /freeze。生产工作的最大安全。 |
| [`/unfreeze`](#安全与护栏) | **解锁** | 移除 /freeze 边界，重新允许随处编辑。 |
| [`/open-gstack-browser`](#open-gstack-browser) | **GStack 浏览器** | 有头启动 gstack 自带的浏览器，带侧栏、反爬隐身、自动模型路由、cookie 导入和 Claude Code 集成。回退引擎的可见面孔；开着 Aside 时你在那里看 agent 的标签页。 |
| [`/setup-deploy`](#setup-deploy) | **部署配置器** | `/land-and-deploy` 的一次性配置。检测你的平台、生产 URL 和部署命令。 |
| [`/gstack-upgrade`](#gstack-upgrade) | **自更新器** | 把 gstack 升级到最新版。检测全局还是内嵌安装，两边同步，展示变更内容。 |
| [`/make-pdf`](#make-pdf) | **PDF 生成器** | 把任何 markdown 文件变成出版级品质的 PDF。得当的页边距、页码、封面、可点击目录。Mermaid/excalidraw 围栏渲染为矢量图；`--to html\|docx` 输出其他格式。经你的 Aside 浏览器（macOS 15+）打印，Aside 不在时用 gstack 的内置浏览器。 |
| [`/diagram`](#diagram) | **图表绘制器** | 英文进，图出：mermaid 源码 + 可编辑的 `.excalidraw`（在 excalidraw.com 打开，手绘风格）+ 渲染好的 SVG/PNG。完全离线，经你的 Aside 浏览器（macOS 15+）渲染，Aside 不在时用 gstack 的内置浏览器。 |
| [`/ios-qa`](#ios-qa) | **iOS QA 负责人** | 经 USB CoreDevice 隧道 + 内嵌 StateServer 的真机 iOS QA。读 Swift 源码，生成访问器，驱动真实 iPhone 或 iPad。可选经 Tailscale 把设备暴露给远程 agent。 |
| [`/ios-fix`](#ios-fix) | **iOS 自主修复器** | 在真实 iPhone 上闭合发现→修复→验证循环。抓取复现快照，修源码，重建，重部署，验证。 |
| [`/ios-design-review`](#ios-design-review) | **iOS 设计师之眼** | 在真实 iPhone 上做 10 维 Apple HIG 审计。给每个屏幕打分，说出怎样才是 10 分。 |
| [`/ios-clean`](#ios-clean) | **iOS 桥接清理** | 剥离 DebugBridge SPM + `#if DEBUG` 接线的便捷包装。结构性的 Release 构建守卫在 Package.swift + CI 里；这个技能用于引导式手动移除。 |
| [`/ios-sync`](#ios-sync) | **iOS 桥接重同步** | 对照最新上游 gstack 重新生成访问器与 Swift 模板。新增 `@Observable` 类或升级 gstack 后运行。 |

---

## `/office-hours`

每个项目都该从这里开始。

在你做计划之前、评审之前、写代码之前——先和一位 YC 风格的伙伴坐下来，想想你真正在做的是什么。不是你以为在做的那个，而是你*真正*在做的东西。

### 重新框定

一个真实项目上发生过这样的事。用户说："我想为我的日历做一个每日简报 app。"合理的需求。接着它追问痛点——要具体例子，不要假设性描述。对方讲了助理漏事、多个 Google 账号的日历条目信息过时、准备文档是 AI slop（AI 垃圾产物）、活动地点填错要追查半天。

它回来的是：*"我要推回你的问题框定，因为我觉得你已经长过它了。你说的是'多 Google 日历管理的每日简报 app'。但你实际描述的是一位个人参谋长（chief of staff）AI。"*

接着它提炼出用户自己都没意识到的五项能力：

1. **盯着你的日历**——跨所有账号检测过时信息、缺失地点、权限缺口
2. **生成真正的会前功课**——不是后勤摘要，而是为董事会、播客、融资做准备的那份*智力工作*
3. **管理你的 CRM**——见的是谁、关系如何、对方想要什么、有什么历史
4. **为你的时间排优先级**——提示功课要提前开始、主动预留时间、按重要性给活动排序
5. **用钱换杠杆**——主动寻找委派或自动化的机会

那次重新框定改变了整个项目。他们原本要做一个日历 app，现在在做一件价值十倍的东西——因为这个技能听的是他们的痛点，而不是功能需求。

### 前提挑战

重新框定之后，它会列出前提（premise）供你验证。不是"听起来不错吗？"——而是关于产品的、真正可证伪的断言：

1. 日历是锚定数据源，但价值在它之上的智能层
2. 助理不会被取代——而是被赋予超能力
3. 最窄的楔子（wedge）是一个真正管用的每日简报
4. CRM 集成是必需品，不是锦上添花

你同意、反对或调整。你接受的每一条前提都会成为设计文档里的承重墙。

### 实现备选方案

然后它会生成 2-3 个具体的实现方案，附诚实的工时估算：

- **方案 A：先做每日简报**——最窄楔子，明天就能发布，M 档工时（人工：约 3 周 / CC：约 2 天）
- **方案 B：CRM 优先**——先建关系图谱，L 档工时（人工：约 6 周 / CC：约 4 天）
- **方案 C：完整愿景**——一次全做，XL 档工时（人工：约 3 个月 / CC：约 1.5 周）

它推荐 A，因为你从真实使用中学习。CRM 数据第二周自然就有了。

### 两种模式

**创业模式**——给正在建立一门生意的创始人和内部创业者。你会得到六个从 YC 合伙人评估产品的方式中提炼出的逼问式问题：需求现实、现状、极致具体、最窄楔子、观察与意外、未来契合。这些问题故意让人不舒服。如果你说不出一个具体需要你产品的真人，那就是写任何代码之前最该搞清楚的事。

**建造者模式**——给黑客马拉松、副业项目、开源、学习和找乐子。你会得到一位热情的合作者，帮你找到你想法里最酷的版本。什么会让人脱口一声"哇"？通往一个能分享的东西的最快路径是什么？这些问题是生成式的，不是审问式的。

### 设计文档

两种模式都以一份写进 `~/.gstack/projects/` 的设计文档收尾——那份文档直接喂给 `/plan-ceo-review` 和 `/plan-eng-review`。完整的生命周期现在是：`office-hours → plan → implement → review → QA → ship → retro`。

设计文档获批后，`/office-hours` 会复盘它注意到的你思考方式上的东西——不是泛泛的夸奖，而是对你在会话里说过的话的具体回指。这些观察也会出现在设计文档里，等你以后重读时再次遇到。

---

## `/plan-ceo-review`

这是我的**创始人模式**。

在这里，我要模型带着品味、雄心、用户同理心和长期视角来思考。我不要它照字面执行需求，我要它先问一个更重要的问题：

**这个产品到底是做什么用的？**

我把它想成**Brian Chesky 模式**。

重点不是实现那张显而易见的工单。重点是从用户的视角重新思考问题，找到那个让人觉得顺理成章、令人愉悦、甚至有点魔法的版本。

### 示例

假设我在做一个 Craigslist 风格的 listings 应用，我说：

> "让卖家为自己的商品上传一张照片。"

一个平庸的助手会加一个文件选择器，存下一张图。

那不是真正的产品。

在 `/plan-ceo-review` 里，我要模型先问："照片上传"到底算不算功能。也许真正的功能是帮人创建一条真正卖得出去的 listing。

如果那才是真正要干的活，整个计划都会变。

现在模型该问的是：

* 能不能从照片识别出商品？
* 能不能推断出 SKU 或型号？
* 能不能搜索网络并自动起草标题和描述？
* 能不能拉来规格、类目和价格对比？
* 能不能建议哪张照片做头图转化最好？
* 能不能检测出上传的照片丑、暗、乱或低信任？
* 能不能让体验显得高级，而不是像 2007 年的死表单？

这就是 `/plan-ceo-review` 替我做的事。

它不只是问"怎么加这个功能？"
它问的是，**"藏在这条需求里的十星产品是什么？"**

### 四种模式

- **范围扩张（SCOPE EXPANSION**）——往大了想。agent 提出有野心的版本。每一项扩张都作为一个单独的决定呈给你选择加入。它热情推荐。
- **选择性扩张（SELECTIVE EXPANSION**）——把当前范围守住当基线，但看看还有什么可能。agent 一个个摆出机会，给中立的推荐——你来挑值得做的。
- **维持范围（HOLD SCOPE**）——对现有计划做到最严。不摆任何扩张。
- **范围收缩（SCOPE REDUCTION**）——找最小可行版本。其余全砍。

愿景与决定会持久化到 `~/.gstack/projects/`，让它们活过会话本身。出色的愿景可以晋升到仓库的 `docs/designs/` 给团队用。

---

## `/plan-eng-review`

这是我的**工程经理模式**。

产品方向对了之后，我要的是一种完全不同的智能。我不要再铺开的头脑风暴，不要再"要是能这样岂不酷"。我要模型变成我最好的技术负责人。

这个模式该钉死的是：

* 架构
* 系统边界
* 数据流
* 状态迁移
* 失败模式
* 边界情况
* 信任边界
* 测试覆盖

还有一个对我意外管用的大解锁：**图**。

逼着 LLM 画系统，它们的思考会完整得多。时序图、状态图、组件图、数据流图，甚至测试矩阵。图会把隐藏假设逼到明面上，让含糊其辞的规划难上加难。

所以 `/plan-eng-review` 就是我要模型搭建技术脊柱的地方——能扛起产品愿景的那根。

### 示例

还是拿那个 listings 应用的例子。

假设 `/plan-ceo-review` 已经干完了它的活。我们认定真正的功能不只是照片上传，而是一条聪明的 listing 流程，它能：

* 上传照片
* 识别商品
* 从网络充实 listing
* 起草有力的标题和描述
* 建议最佳头图

现在 `/plan-eng-review` 接手。

现在我要模型回答这样的问题：

* 上传、分类、充实、草稿生成的架构是什么？
* 哪些步骤同步做，哪些进后台任务？
* 应用服务器、对象存储、视觉模型、搜索/充实 API 和 listing 数据库之间的边界在哪里？
* 上传成功但充实失败会怎样？
* 商品识别置信度低会怎样？
* 重试怎么工作？
* 怎么防止重复任务？
* 什么在什么时候持久化，什么可以安全重算？

这正是我要图的地方——架构图、状态模型、数据流图、测试矩阵。图会把隐藏假设逼到明面上，让含糊其辞的规划难上加难。

这就是 `/plan-eng-review`。

不是"把想法改小"。
**是把想法变得可建造。**

关于调用方式说一句：在计划模式下，技能会跳过"评审什么？"的范围提问，自动评审你的当前计划，并用一行宣布它的选择（"Scope gate: plan mode — auto-selected B"），方便你改道。显式点名目标（"review PLAN.md"）则你的选择在任何模式下都胜出。计划模式之外且没点名时，它会先问——那道门禁是硬停止。

### 评审就绪仪表盘

每次评审（CEO、工程、设计）都会记录结果。每轮评审结束时你会看到一个仪表盘：

```
+====================================================================+
|                    REVIEW READINESS DASHBOARD                       |
+====================================================================+
| Review          | Runs | Last Run            | Status    | Required |
|-----------------|------|---------------------|-----------|----------|
| Eng Review      |  1   | 2026-03-16 15:00    | CLEAR     | YES      |
| CEO Review      |  1   | 2026-03-16 14:30    | CLEAR     | no       |
| Design Review   |  0   | —                   | —         | no       |
+--------------------------------------------------------------------+
| VERDICT: CLEARED — Eng Review passed                                |
+====================================================================+
```

工程评审是唯一必需的门禁（用 `gstack-config set skip_eng_review true` 关闭）。CEO 和设计是信息性的——分别推荐用于产品与 UI 变更。

diff 评审使用由 `gstack-review-read` 计算的 `review_freshness` 等级，`/ship` 和 `/land-and-deploy` 共享它。CURRENT 要求一次干净、由评审者报告已完成且已收敛的通过，其捕获的起点与终点指纹与当前工作区内容一致。已跟踪的编辑和未被忽略的未跟踪源码都算数；相同的 commit 哈希或"评审以来零提交"不能作为兜底。

起点/终点内容不一致的已捕获通过评为 STALE；此前验证过但指纹不再匹配的通过同样如此。缺失或复用的起点回执、只留日志的旧式记录、未完成或未收敛的通过，以及未解决的发现，都不能评为 CURRENT；证据缺失评为 UNVERIFIED。发布遥测不算一次评审通过。修复之后，要带着新的起点回执做一次真正的完整重审，而不是只为记录结果捕获一次。完成与否仍由评审者报告，不是"某个模型读过源码"的独立证明。

计划文件评审保留现有的七天新鲜度处理和可选的计划哈希对比；仓库内容规则不适用于它们。diff 评审必须评为 CURRENT 才能通过工程评审，这之外还有仪表盘既有的时效与干净状态要求。

### 从计划到 QA 的流转

`/plan-eng-review` 跑完测试评审部分后，会把一份测试计划产物写进 `~/.gstack/projects/`。之后你运行 `/qa` 时，它会自动接上那份测试计划——你的工程评审直接喂给 QA 测试，无需手动复制粘贴。

---

## `/plan-design-review`

这是我的**资深设计师审你的计划**——在你写下一行代码之前。

大多数计划描述后端做什么，却从没说清用户到底看到什么。空状态？错误状态？加载状态？移动端布局？AI slop 风险？这些决定被推迟到"实现的时候再说"——然后某个工程师把 "No items found." 当空状态发了出去，因为没人规定过更好的。

`/plan-design-review` 在计划阶段就拦下这一切，那时修复还便宜。

它的工作方式像 `/plan-ceo-review` 和 `/plan-eng-review`——交互式，一次一个问题，用 **STOP + AskUserQuestion** 模式。它给每个设计维度打 0-10 分，解释 10 分长什么样，然后改计划朝那个方向走。评分驱动工作量：分低 = 大量修复，分高 = 快速过一遍。和 `/plan-eng-review` 一样，它在计划模式下跳过"评审什么？"的范围提问，自动瞄准你的当前计划（一行宣布，方便你改道）；显式点名的目标在任何模式下都胜出。

对计划做七遍扫描：信息架构、交互状态覆盖、用户旅程、AI slop 风险、设计系统对齐、响应式/无障碍，以及未决的设计决定。每一遍它找缺口，要么直接修（显而易见的），要么请你做一个设计选择（真正的权衡）。

### 示例

```
You:   /plan-design-review

Claude: Initial Design Rating: 4/10

        "This plan describes a user dashboard but never specifies
         what the user sees first. It says 'cards with icons' —
         which looks like every SaaS template. It mentions zero
         loading states, zero empty states, and no mobile behavior."

        Pass 1 (Info Architecture): 3/10
        "A 10 would define primary/secondary/tertiary content
         hierarchy for every screen."
        → Added information hierarchy section to plan

        Pass 2 (Interaction States): 2/10
        "The plan has 4 UI features but specifies 0 out of 20
         interaction states (4 features × 5 states each)."
        → Added interaction state table to plan

        Pass 4 (AI Slop): 4/10
        "The plan says 'clean, modern UI with cards and icons'
         and 'hero section with gradient'. These are the top 2
         AI-generated-looking patterns."
        → Rewrote UI descriptions with specific, intentional alternatives

        Overall: 4/10 → 8/10 after fixes
        "Plan is design-complete. Run /design-review after
         implementation for visual QA."
```

重新运行时，已到 8 分以上的部分快速过一遍，低于 8 分的部分得到完整处理。实现之后要对线上站点做视觉审计，用 `/design-review`。

---

## `/design-consultation`

这是我的**设计伙伴模式**。

`/plan-design-review` 审计的是已存在的站点。`/design-consultation` 用于你还一无所有的时候——没有设计系统、没选定字体、没有配色。你从零开始，想让一位资深设计师坐下来和你一起把整套视觉身份建起来。

这是一场对话，不是一张表单。agent 会问你的产品、你的用户、你的受众。它想清楚你的产品要传达什么——信任、速度、匠心、温度，什么合适来什么——再从那里倒推出具体选择。然后它提出一套完整、自洽的设计系统：美学方向、字体排印（3 款以上各司其职的字体）、带十六进制值的调色板、间距比例、布局方式和动效策略。每条推荐都带理由，每个选择都在强化其他选择。

但自洽只是入场券。每个开发者工具的仪表盘都长一个样——干净的无衬线体、低饱和灰、一个蓝色点缀。它们都自洽，也都毫无记忆点。一个"好看"的产品和一个别人真认得出来的产品，差别在于**刻意为之的创意冒险**：标题用一款没人料到的衬线体、一个同类里没人用的泼辣点缀色、更紧的间距让你的数据显得权威而不是松散。

这才是 `/design-consultation` 真正干的事。它不只提一套安全的系统。它把安全选择和冒险一起摆出来——并告诉你哪个是哪个。"这些选择让你在品类里保持通晓。而这几处我认为你该破例，理由如下。"你来挑要冒哪些险。agent 会检查整套系统在两种情况下依然自洽。

如果你愿意，agent 会去调研你的赛道里已经有什么——给真实站点截图、分析它们的字体、颜色和间距——让你在做选择前先看到格局。这不是为了抄，而是先进入大致范围，知道惯例是什么，再决定哪些值得打破。

就系统达成一致后，它会生成一个交互式 HTML 预览页——不是色板和字体样张，而是真实感的产品页。你在做仪表盘，就看到一个带侧栏、数据表和统计卡的仪表盘；你在做营销站，就看到一个带真实文案和 CTA 的 hero 区。一切都用你的设计系统渲染，带着你的产品名，亮色暗色双模式。在生产代码一行未写之前，你就能看到你的产品可能是什么手感。

然后它把 `DESIGN.md` 写到你的仓库根目录——项目的设计事实源——并更新 `CLAUDE.md`，让未来的每个 Claude Code 会话都尊重这套系统。从那一刻起，`/design-review` 可以拿它做审计，任何在你前端上干活的 agent 都知道规则。

文件采用开放的 DESIGN.md 格式（[google-labs-code/design.md](https://github.com/google-labs-code/design.md)）：每个 token 放在 YAML front matter（`colors`、`typography`、`rounded`、`spacing`、`components`）里，理由放在规范的固定章节里，于是 impeccable、Google Stitch 以及任何读这个格式的工具共享同一份文件。如果你已有一份旧式 gstack `DESIGN.md`，技能会提议转换一次（保留备份），并把你的答复记进文件，从此不再问。仓库根目录的 `PRODUCT.md` 会预填产品问题，不再重问。

### 示例

```
You:   /design-consultation

Claude: From the README, this looks like a developer analytics dashboard
        for engineering teams. Sound right? Tell me about the feeling
        you want — and would you like me to look at what's out there
        first so we can see the landscape?

You:    Yes, it's for eng managers. Show me what's out there.

Claude: [browses Linear, Vercel, Datadog, Posthog — takes screenshots]

        Here's the landscape. They all converge on clean sans-serifs
        and muted blue-gray palettes. Linear stands out with dark-first
        and tight spacing. The rest feel interchangeable.

        Here's my proposal — and where I'd play it safe vs. take risks:

        AESTHETIC: Industrial/Utilitarian — data-first, every pixel earns its place
        TYPOGRAPHY: Geist (body + UI), Instrument Serif (display), JetBrains Mono (data)
        COLOR: Restrained — slate neutrals, single teal accent (#0D9488)
        SPACING: 4px base, compact density
        LAYOUT: Grid-disciplined, 12-column
        MOTION: Minimal-functional — only transitions that aid comprehension

        SAFE CHOICES (match category expectations):
          Geist for body — your users already know this font from Vercel
          Slate neutrals — warm grays feel right for data-heavy UIs
          Grid-disciplined layout — dashboards need predictable alignment

        RISKS (where you'd stand out):
          Instrument Serif for display headings — nobody in dev tools
            uses a serif. It creates instant hierarchy contrast and
            signals "we care about craft" in a space full of sans-serifs.
          Single teal accent instead of blue — everyone else in this space uses blue.
            Teal is close enough to feel trustworthy, different enough
            to be recognizable.
          4px compact density — tighter than Linear, says "we respect
            your screen real estate."

        The safe choices keep you literate. The risks are where your
        product gets its own face. Which risks appeal to you?

You:    Love the serif risk. Let's see it.

Claude: Preview opened in your browser.
        [/tmp/design-consultation-preview-1710000000.html]

        The page shows a realistic dashboard: sidebar nav, header with
        avatar, stat cards, data table — all in your design system.
        Instrument Serif at hero scale, Geist in body text, JetBrains
        Mono in the data table. Teal accent on buttons and active states.
        Light and dark mode toggle in the corner.

        How does it feel? Want to adjust anything before I write DESIGN.md?

You:    Ship it.

Claude: Wrote DESIGN.md (typography, color, spacing, layout, motion).
        Updated CLAUDE.md with design system guidelines.
        All future sessions will respect these choices.
```

---

## `/design-review`

这是我的**会写代码的设计师模式**。

`/plan-design-review` 在实现之前评审你的计划。`/design-review` 在之后审计并修复线上站点。

它在线上站点跑一项 80 项的视觉审计——在你的 Aside 浏览器里，所以它看到的正是登录中的你看到的——然后进入修复循环：对每条设计发现，它定位源文件、做最小的 CSS/样式改动、以 `style(design): FINDING-NNN` 提交、重新导航验证、拍前后截图。一处修复一个提交，完全可二分。

自我调节的启发式为设计工作调校过——纯 CSS 改动免费放行（天然安全可回退），但对组件 JSX/TSX 文件的改动计入风险预算。硬上限 30 处修复。风险分超过 20% 就停下来问。

**设计检测器**。装有 [impeccable](https://impeccable.style) 时，它的引擎先跑：给了 URL 就导出页面渲染后的 DOM（外链样式已内联）并扫描；在没有 URL 的功能分支上则扫描变更的前端文件（`.dart` 文件除外：它们算前端范围，但引擎读的是 web 源）。每条机械性发现都作为一个带规则 id 标签的 `FINDING-NNN` 到来（`[nested-cards]`、`[low-contrast]`），报告以 `Detector: N → M` 收尾。gstack 绝不运行 impeccable 的安装器；没有引擎时它会提议一次下载引擎二进制（校验和锁定，记入出站回执台账）并记住你的答复；没有它，审计照旧。`gstack-config set design_detector off` 可关闭这道前置。

### 示例

```
You:   /design-review https://myapp.com

Claude: [Runs full 80-item visual audit on the live site]
        Design Score: C  |  AI Slop Score: D
        12 findings (4 high, 5 medium, 3 polish)

        Fixing 9 design issues...

        style(design): FINDING-001 — replace 3-column icon grid with asymmetric layout
        style(design): FINDING-002 — add heading scale 48/32/24/18/16
        style(design): FINDING-003 — remove gradient hero, use bold typography
        style(design): FINDING-004 — add second font for headings
        style(design): FINDING-005 — vary border-radius by element role
        style(design): FINDING-006 — left-align body text, reserve center for headings
        style(design): FINDING-007 — add hover/focus states to all interactive elements
        style(design): FINDING-008 — add prefers-reduced-motion media query
        style(design): FINDING-009 — set max content width to 680px for body text

        Final audit:
        Design Score: C → B+  |  AI Slop Score: D → A
        9 fixes applied (8 verified, 1 best-effort). 3 deferred.

        [Report with before/after screenshots saved to ~/.gstack/projects/<slug>/designs/design-audit-<date>/]
```

九个提交，每个只碰一件事。AI Slop 分数从 D 到 A，因为三个最易识别的模式（渐变 hero、三列网格、统一圆角）都没了。

---

## `/design-shotgun`

这是我的**设计探索模式**。

那种感觉你懂的。你有一个功能、一个页面、一个落地屏……却拿不准它该长什么样。你可以描述给 Claude，得到一个答案。但一个答案只代表一种视角，而设计是一场品味游戏。你需要看到选项。

`/design-shotgun` 用 GPT Image API 生成 3 个视觉设计变体，在浏览器里打开对比板，等你的反馈。你选一个方向、要求修改，或索要全新的变体。对比板支持重混、重新生成和批准操作。

### 循环

1. 你描述想要什么（或指向一个已有页面）
2. 技能读你的 `DESIGN.md` 拿品牌约束（如果存在）
3. 它生成 3 个彼此不同的设计变体 PNG
4. 对比板在浏览器里打开，3 个并排呈现
5. 你在喜欢的那个上点"批准"，或给反馈再来一轮
6. 获批变体连同一份 `approved.json` 存进 `~/.gstack/projects/$SLUG/designs/`；若是落地页、定价页或活动页，它还会记下你选的页面原型（`classic-hero`、`long-form-story`、`minimal-conversion` 或 `comparison`）及其分区大纲

那份 `approved.json` 是喂给 `/design-html` 的一种方式。设计管线是串起来的：shotgun 定方向，design-html 把它渲染成能用的代码。但 `/design-html` 也能吃 CEO 计划、设计评审，或仅仅一段描述。

### 品味记忆

技能会跨会话记住你的偏好。如果你一贯偏爱极简而非花哨，它会为后续生成加倾向。这不是一个你去配置的设置……它从你的批准里自己长出来。

### 示例

```
You:   /design-shotgun — hero section for a developer tools landing page

Claude: [Generates 3 variants]
        Variant A: Bold typography, dark background, code snippet hero
        Variant B: Split layout, product screenshot left, copy right
        Variant C: Minimal, centered headline, gradient accent

        [Opens comparison board at localhost:PORT]

You:    [Clicks "Approve" on Variant A in the browser]

Claude: Approved Variant A. Saved to ~/.gstack/projects/myapp/designs/
        Next: run /design-html to generate production HTML from this mockup.
```

---

## `/design-html`

这是我的**设计转代码模式**。

每个 AI 代码生成工具产出的都是静态 CSS。写死的高度。一改窗口就溢出的文字。生硬跳变而不是流动的断点。产出只在某一个视口尺寸下看起来对，其他全坏。

`/design-html` 解决这个。它用 Cheng Lou（前 React 核心、Midjourney 前端）的 [Pretext](https://github.com/chenglou/pretext) 生成 HTML。Pretext 是一个 15KB 的库，无需 DOM 测量即可计算文字布局。文字会重排，高度随内容调整，卡片自己定尺寸，聊天气泡紧贴内容。全部亚毫秒，全部动态。

它吃多种输入：`/design-shotgun` 的获批视觉稿、`/plan-ceo-review` 的 CEO 计划、`/plan-design-review` 的设计评审上下文、你给的 PNG，或仅仅一段描述。它探测存在哪种上下文，然后问你想怎么进行。

### 智能 API 路由

不是每个页面都需要完整 Pretext 引擎。技能读设计，挑对工具：

- **简单布局**（落地页、营销页）：`prepare()` + `layout()` 得到感知窗口的高度
- **卡片网格**（仪表盘、listing）：`prepare()` + `layout()` 得到自定尺寸的卡片
- **聊天界面**：`walkLineRanges()` 得到零浪费像素的紧贴气泡
- **编辑排版**：`layoutNextLine()` 让文字绕开障碍物流动
- **复杂编辑排版**：`layoutWithLines()` 完整引擎做手工逐行渲染

### 精修循环

1. 读 `approved.json` 里的获批视觉稿，外加你在对比板上选的页面原型与分区大纲，按给定内容直接构建，不再重问
2. 用 GPT-4o 视觉提取实现规格（颜色、字体排印、布局）
3. 生成内联 Pretext 的自包含 HTML（15KB，零网络依赖）
4. 起一个热重载服务器，改动即时可见
5. 在 3 个视口（手机、平板、桌面）截图验证布局
6. AskUserQuestion：哪里要改？
7. 经 Edit 工具做外科手术式修改（不是整体重新生成）
8. 循环，直到你说"好了"

**Slop 门禁**。装有 [impeccable](https://impeccable.style) 时，定稿页面在验证截图之前会过一遍它的引擎：发现会触发一轮针对非建议类规则的外科手术式修复，然后再扫一次。剩下的都以"有理由地接受"呈现（获批视觉稿里本来就有、`DESIGN.md` 认可，或你同意加一条内联 `impeccable-disable` 注释）。只过一轮，绝不循环；没有 impeccable 就静默跳过这一步。技能的永不收录清单带着与检测器报告相同的规则 id，来自 `lib/design-catalog.ts`。

### 框架检测

如果你的项目用 React、Svelte 或 Vue（从 `package.json` 检测），技能会提议生成框架组件而不是原生 HTML。框架输出用 `npm install @chenglou/pretext`，而不是把库内联进文件。

### 示例

```
You:   /design-html

Claude: Found approved mockup: variant-A.png (hero section)
        Design type: simple layout → using prepare() + layout()

        [Generates HTML with Pretext, opens live-reload server]
        [Screenshots at 375px, 768px, 1440px — all verified]

        The HTML is live at localhost:3456. Resize your browser.
        Text reflows dynamically. What needs to change?

You:    Make the headline bigger and add more spacing below the CTA

Claude: [Edits font-size and margin, browser auto-reloads]
        Updated. Two changes applied.

You:    Done

Claude: Saved to ~/.gstack/projects/myapp/designs/hero-20260330/finalized.html
```

---

## `/design-motion`

这是我的**展示模式**。

X 上的发布帖要的是产品动起来，不是一张静态视觉稿。实时录屏会给你掉帧、接缝处跳变的循环，还有跑到一半就飘出容器的卡片。

`/design-motion` 吃 `/design-shotgun` 的获批视觉稿、`/design-html` 的 `finalized.html`，或一个 URL。它把精确的那一帧重建为一个自包含页面，从空状态起步，以柔和的升起与落定把它加载进来，再给每个视觉一个故事：一张图表被读出来，一个列表迎来新条目，一个提示词自己重新打字。然后溶解，循环。

没有任何东西是实时录的。`bin/gstack-motion-capture.ts` 在 Playwright 的假时钟上以整毫秒步长驱动页面，平均 1000/60，所以第 N 帧永远是相同的像素。`bin/gstack-motion-encode check` 再用 ffmpeg 的 PSNR 证明循环成立：第一帧等于一个周期后的那一帧（接缝），空拍等于开始前的那一帧（没有残留 JS 状态），溶解前的最后一帧等于静态设计（每个故事都回了家），容器之外没有任何东西在动（溢出）。只有在这之后，`export` 才写出发 X 的 MP4、960 px 的网站 GIF 和 800×500 的 GIF。

在网站上它改为遵守 gstack 的设计规则：每页一个精心编排的动效时刻，内容无脚本也可见，不留任何跑着的脉动圆点或跑马灯。ffmpeg 是可选的；没有它，技能会构建页面并告诉你怎么安装。设了 `FIGMA_TOKEN` 时可以用 Figma 源。

改编自 Elaya 的 [design-to-motion](https://github.com/elayadesign/ai-design-skills)（MIT，© 2026 Elaya）。

### 示例

```
You:   /design-motion

Claude: Found approved mockup: variant-B.png (analytics bento, 1440×990)
        Context: showcase. Layout: separate cards (4).
        Stories: chart scrubber, a new lead lands on the stack, KPI counts up.
        Cycle: 12 s.

        [Rebuilds the frame, still matches the mockup at 37 dB]
        [Captures 744 frames on a fake clock]

        MOTION_CHECK: seam pass
        MOTION_CHECK: empty-beat pass
        MOTION_CHECK: rest pass
        MOTION_CHECK: overflow pass

        bento-x.mp4 (1744×1200, 60 fps, 12 s), bento-loop.gif, bento-800x500.gif
```

---

## `/review`

这是我的**偏执资深工程师模式**。

测试通过不代表分支安全。

`/review` 的存在，是因为有一整类 bug 能活过 CI，照样在生产环境给你一拳。这个模式不是为了把梦做大，也不是为了把计划变漂亮，而是为了问一句：

**还有什么会坏？**

这是一次结构性审计，不是一遍风格挑刺。我要模型去找这样的东西：

* N+1 查询
* 过时读
* 竞态条件
* 糟糕的信任边界
* 缺失的索引
* 转义 bug
* 被破坏的不变量
* 糟糕的重试逻辑
* 通过了却没覆盖真正失败模式的测试
* 被遗忘的枚举处理——新增一个 status 或 type 常量，`/review` 会追着它跑遍你代码库里的每一个 switch 语句和白名单，而不只是你改过的文件

### 修复优先

发现会被处置，而不是只列出来。显而易见的机械修复（死代码、过时注释、N+1 查询）自动应用——每一条你都会看到 `[AUTO-FIXED] file:line 问题 → 做了什么`。真正含糊的问题（安全、竞态、设计决定）会呈给你裁决。

### 完整性缺口

`/review` 现在会标记偷懒实现——当完整版的成本不足 30 分钟 CC 时间时。如果你选了 80% 的方案，而 100% 的方案是一个湖而不是一片海，评审会点名。

一个例外：你刻意为之并记录在案的偷懒。一个 `gstack-shortcut(dec-<id>)` 标记，只要其决策 id 能在决策台账中查到，就会把该发现降级为已确认的债。孤儿标记——背后没有台账条目的那种——什么也压不住；缺口照常报告，标记本身也会被点名。

**设计扫描**。diff 涉及前端文件时，设计专家会读 `review/design-checklist.md`（由 `lib/design-catalog.ts` 生成），于是 `/review`、`/ship` 和 `/design-review` 在相同的规则 id 下标记相同的模式。装有 [impeccable](https://impeccable.style) 时，它的引擎先扫变更的前端文件（`.dart` 文件只走清单扫描）：它的行按层级分桶（auto-fix、ask、possible），检测器命中和清单命中落在同一 file:line 的合并为一行，你仓库的 `.impeccable/config*.json` 忽略项被当作已定论的决定读取。没有它，清单扫描独自运行。

**PR 类型**。清单先从变更路径判断 PR 的类别：docs-only、CI/infra、scripts/tooling、application 或 mixed，评审的第一行会说明是哪类（`PR type: <type>`）。application 和 mixed 的 diff 照旧跑所有类别。CI/infra、scripts/tooling 或 docs-only 的 diff 永远会得到 Gate Integrity、Shell Injection、Completeness Gaps、Distribution & CI/CD Pipeline 和 Repo Conventions & Platform Fit；其余无可检查的类别各以一行列为不适用，绝不计为通过。Repo Conventions & Platform Fit 标记与仓库既有语言、工具或其 CI 运行平台不符的新文件，比如一个 bash 加 Makefile 仓库里的 `.bat` 构建脚本。

### 示例

假设聪明的 listing 流程已实现，测试全绿。

`/review` 仍然该问：

* 渲染 listing 照片或草稿建议时，我有没有引入 N+1 查询？
* 我是不是在信客户端提供的文件元数据，而不是校验真实文件？
* 两个标签页会不会竞态并互相覆盖头图选择或商品详情？
* 失败的上传会不会把孤儿文件永远留在存储里？
* "恰好一张头图"的规则在并发下会不会被打破？
* 充实 API 部分失败时，我是优雅降级还是存进垃圾？
* 把网络数据拉进草稿生成，我有没有顺手制造出提示词注入或信任边界问题？

这正是 `/review` 的意义。

我在这里不要奉承。
我要模型在生产事故发生之前先想象到它。

---

## `/investigate`

东西坏了又不知道为什么时，`/investigate` 就是你的系统化调试器。它遵守铁律：**先做根因调查，才有修复。**

它把顺序和工具留给模型，只保留几道守卫（三个假设失败后停下询问、修复涉及超过五个文件先问、把编辑锁定在受影响模块内），读一份针对不稳定测试、顺序依赖失败、竞态和评测回归的处方，最后产出一份结构化调试报告。它过去走一套五阶段流程；46 次有记录的会话里 Opus 5.5 一次都没照做，于是流程被砍掉了（GST-938）。

---

## `/verify`

`/verify` 是你边构建边跑的循环：改点东西，跑仓库的检查项，修掉坏的，再跑。`gstack-checks detect` 找出仓库已声明的检查（CLAUDE.md 里的 `gstack:verify:` 行或 `## Health Stack` 小节，否则 package.json scripts、tsconfig、eslint 或 biome、pyproject、Cargo.toml、go.mod），绝不凭空造一个。`gstack-checks run` 跑它们，外加 `/ship` 预门禁会为你的改动挑的测试——用的是 pregate 自己的选择器——所以 `/verify` 绿预示预门禁绿。`/health` 用同一个检测器找它的工具（`gstack-checks detect --for health`），再加上它的测试、knip、shellcheck 和 gbrain 维度。

跑任何仓库命令前它问一次（`gstack-checks trust`），命令变了再问一次。改过的文件没有任何测试覆盖是 `UNMAPPED`，一次选择跑了零个测试是 `ZERO_RUN`，两者都不算绿。缺工具或缺服务会被报告，而不是绕过去。跑满五轮或同一失败出现两次就停，把顽固的红交给 `/investigate`。一切通过时，`gstack-checks status` 打印 `READY_FOR_SHIP tree=<tree>` 而不重跑任何东西，然后你跑 `/ship`。它绝不评审、升版本、推送或开 PR。

---

## `/qa`

这是我的**QA 负责人模式**。

`/browse` 给 agent 眼睛。`/qa` 给它一套测试方法论。

最常见的用法：你在功能分支上，刚写完代码，想验证一切正常。只说 `/qa`——它用你的请求、仓库契约、测试计划和 diff 来选择浏览器、功能（API、CLI、定时任务、worker 或 webhook）或混合面。不需要 URL 或手工测试计划。浏览器目标照旧在 Aside 标签页（或 gstack 的回退浏览器）里打开受影响页面；纯功能目标使用有文档记录的原生命令和隔离的本地 fixture，不启动浏览器。

选 Full、Quick 或 Regression 深度；diff 感知负责选测什么：

- **Diff 感知**（功能分支上自动）——选择已变更及相邻的行为。独立运行的 `/qa` 先通过它的提交/暂存/中止提问处理脏工作区，然后测试处理后的检出。浏览器目标会识别受影响页面并专门测它们。
- **Full**——浏览器 QA 系统性探索整个应用（通常 5-15 分钟，记录 5-10 个证据充分的问题）；功能 QA 覆盖适用的已记录契约，单独报告受阻或未测的。
- **Quick**（`--quick`）——浏览器 QA 保留 30 秒首页 + 前五导航的冒烟；功能 QA 检查一次成功操作和风险最高的变更边缘，其余契约标记为未跑。
- **Regression**（`--regression <previous-report-or-baseline>`）——浏览器 QA 跑完整模式并与先前的 `baseline.json` 做对比；功能 QA 要求可读的先前功能报告和回放证据，把失败的探针对着目标契约重跑，然后检查已变更的相邻行为。只有浏览器的基线不是功能基线。

探索保留书面轨迹：每次下一个发现探针之前，QA 会在它专属的报告目录里存一个
`exploration-NNN.json` 检查点，含上一条命令及结果、假设和下一条确切命令。最终
报告会链接这些文件。`/qa-only` 和有界的评审/发布通道使用同一份证据契约，但
不因此获得编辑产品代码或测试的权限。

时间限制包含检查点与证据工作；未完成的探针保持未测。新运行保留先前的报告和
基线，所选输出目录已有产物时改用一个全新的专属运行目录。混合运行把浏览器与
功能结果放进同一份报告的不同章节；浏览器分数绝不套用到功能覆盖上。
Quick/Regression 的冲突请求在探针开始前解决。

### 自动回归测试

对已复现的缺陷，`/qa` 在基础设施可用时写一个原生回归测试，并在修复之前先证明它对该缺陷失败；纯 CSS 缺陷可改用浏览器证据。根因修复之后，它要求原始探针、相邻 happy path 和（可用的）原生回归都通过，才称修复已验证。测试可追溯到 QA 报告。`/qa-only` 可以提出用例并保留可回放证据，但绝不改产品代码或测试；原生测试基础设施缺失始终是一项显式的覆盖限制，不是为功能 QA 安装新框架的许可。

### 示例

```
You:   /qa https://staging.myapp.com

Claude: [Explores 12 pages, fills 3 forms, tests 2 flows]

        QA Report: staging.myapp.com — Health Score: 72/100

        Top 3 Issues:
        1. CRITICAL: Checkout form submits with empty required fields
        2. HIGH: Mobile nav menu doesn't close after selecting an item
        3. MEDIUM: Dashboard chart overlaps sidebar below 1024px

        [Full report with screenshots saved to .gstack/qa-reports/]
```

**测试需要登录的页面**：有 Aside，什么都不用设。Aside 就是你的浏览器，`/qa` 已经持有你的会话；撞上登录墙就在 Aside 里登录并告诉它"好了"——它重跑那一步。它绝不替你输密码。在回退浏览器上，先跑 `/setup-browser-cookies` 导入你的真实会话，或在有头模式里登录一次。

---

## `/ship`

这是我的**发布机器模式**。

一旦我定了做什么、钉死了技术方案、跑过一轮严肃的评审，我就不想再多谈。我要执行。

`/ship` 负责最后一公里。它面向一条就绪的分支，而不是用来决定做什么。

在这里，模型应该停止扮演头脑风暴伙伴，开始扮演一名纪律严明的发布工程师：同步 main，跑对的测试，确认分支状态健全，仓库有要求就更新 changelog 或版本号，推送，创建或更新 PR。

### 测试引导

你的项目没有测试框架时，`/ship` 会装一个——检测你的运行时，调研最好的框架，安装它，为你的真实代码写 3-5 个真测试，搭好 CI/CD（GitHub Actions），并创建 TESTING.md。100% 测试覆盖是目标——测试让凭感觉写码变得安全，而不是野蛮操作。

### 覆盖审计

每次 `/ship` 都会从你的 diff 构建代码路径图，搜索对应的测试，并产出一张带质量星标的 ASCII 覆盖图。缺口会自动生成测试。你的 PR 正文会显示覆盖情况：`Tests: 42 → 47 (+5 new)`。

`/review` 和 `/ship` 还会对已变更行为和附近风险跑一轮有界的探索，哪怕 diff 很小、没有计划也没有 web 服务器。它们既有的审批与测试规则管辖任何修复或永久测试；被阻塞的探针仍是覆盖缺口，不算通过的 QA 结果。

### 评审门禁

`/ship` 在预检时于[评审就绪仪表盘](#评审就绪仪表盘)中展示历史评审就绪状态。缺工程评审会被报告，但不多问一句；它不替代也不豁免当前的上线前评审。第 9 步仍会跑清单、一位批量专家（测试与安全，外加清单范围选择）和有界的探索性 QA，沿用其既有的审批与完成门禁。

大量分支死在有趣的工作做完、只剩无聊的发布工作的时候。人会把那部分拖延下去。AI 不应该。

### PR 正文

`/ship` 从 diff、回执和评审写 PR 正文，一个没在会话现场的人要靠它决定合不合并。在 Capy（`CAPY_PR: on`）上，正文以四个章节开篇，按此顺序，排在标准的 Summary、Test plan 和 Documentation 之前：

1. **`## What changed`**：一到三张带说明的前后对比图，来自 `gstack-pr-shots` 或 UI 截图，信号最强的在前，每张下面附折叠的文字版。
2. **`## Why`**：两三句话。第一句用当事人的话说出问题（issue、消息、失败的那次运行），然后是原因和用户可见的影响。
3. **`## Blast radius`**：这次变更还波及什么，以及让它安全的那一个事实，并给出该事实到达的证据阶梯档位（一个跑过共享路径的测试、一次对每个调用方的 grep、一次实测运行）。对共享辅助函数、生成文件、选择清单或策略默认值的改动永远有这一条；叶子级修复用一行说明即可。
4. **`## Approvals`**：`gstack-approvals render` 的输出，一字不差。私有仓库上是那张表；公开仓库，或 gh 读不到可见性的仓库，只有 `Approved: yes|no (record <id>)`，因为 GitHub 会保留 PR 描述的每一个历史版本。

正文组装之前，`gstack-prose-lint` 会读 Why、Summary 和 Blast radius 的草稿（`--sections 'Why,Summary,Blast radius' --gate`）以及 CHANGELOG 条目（`--base origin/<base> --gate`），一条 `PROSE_LINT_FOUND` 行点名要重写的句子；正文其余部分只作建议。Captain 的合并请求模板（`captain/templates/merge-ask.md`）带着同样的四个章节，所以一份 READY 报告和它的 PR 说的是同一件事。

### 版本：/ship 去哪找，以及什么时候不带版本发布

只有项目说明了版本在哪里，`/ship` 才会升版本。它按顺序检查：

1. 传给 `gstack-version-bump` / `gstack-next-version` 的 `--version-path <path>`。
2. `.gstack/version-path`：一个已提交的单行文件，存着版本文件的仓库相对路径，例如 `package.json` 或 `apps/web/package.json`。`.json` 路径按其 `"version"` 字段读写；三位 semver 保持三位。
3. 根目录的 `VERSION` 文件（gstack 自己的 4 位 `MAJOR.MINOR.PATCH.MICRO` 格式）。

只有根 `package.json` 不算数，因为很多应用在那里放的是占位符。想让 `/ship` 为它升版本，运行 `echo package.json > .gstack/version-path` 并提交该文件。

这些都不存在时，`/ship` 不带版本变更发布：不升版本、不加 CHANGELOG 版本头、不加 `v1.2.3` 标题前缀、不打 tag。它会打印：

> Shipped without a version change: no version source is configured (no VERSION file, no .gstack/version-path). To version releases, create VERSION or write the version file's path (for example package.json) to .gstack/version-path.

配置了 release-please、Changesets 或 semantic-release、仓库是 workspace monorepo，或 `package.json` 里是 `0.0.0-development` 之类的占位符时，它同样如此并说明原因；版本归那些工具管。`/land-and-deploy` 和 `/document-release` 读同一个信号。已配置的版本文件缺失、为空、不可读或格式错误会让 `/ship` 带着文件路径和问题停下；gstack 绝不替之以 `0.0.0.0`。

### 第三方网页操作（v1.72.0.0+）

发布工作有时会走出终端：注册 API key、创建厂商账号、接一个 webhook 或 OAuth 应用。`/ship`（以及 `/spec`、`/office-hours`、`/land-and-deploy`、`/setup-deploy`）不会塞给你一张手工步骤清单，而是提议替你驾驶浏览器。Aside 优先——它在你真实登录的会话间行动，这正是厂商控制台需要的。没有 Aside？gstack 自己的可见浏览器（有头 `$B`，登录可交接）是所有平台上的回退，每任务给一个 aside.com（macOS 15+）指引。

同意规则严格且经 pin 测试：每个任务一个显式提问，点名确切的站点与操作；没有长期授权；绝不自动安装（无 Aside 的 Mac 上你会得到一个下载指引——aside.com，macOS 15+——每任务一次）。密码、支付、CAPTCHA 和身份验证始终归你；任何技能都绝不把 Apple 凭据创建当作驾驶目标。捕获的秘密绝不出现在聊天里——它落进一个仅属主的文件，并在 gstack 宣称成功之前用一次只读 API 调用验证。

---

## `/land-and-deploy`

这是我的**部署管线模式**。

`/ship` 创建 PR。`/land-and-deploy` 收尾：合并、部署、验证。

它确认 PR 就绪与你的合并批准，合并，然后在检查生产之前盯 CI 和部署。部署坏了，它报告什么失败了、能否回滚。新版本的部署无法确认时，它会报告这份不确定，而不是拿一个健康的旧页面当证明。

首次运行，或部署配置有变更时，会触发一次演练走查，让你在任何不可逆的事发生之前验证管线。未变更且此前已确认的配置跳过走查，但不跳过就绪检查和合并批准。批准绑定到确切的 PR head 和目标分支；改任一项都要重新做就绪与批准。

### 初始设置

先跑 `/setup-deploy`。它检测你的平台（Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions 或自定义），发现你的生产 URL 和健康检查端点，并把配置写进 CLAUDE.md。一次性，60 秒。

### 示例

```
You:   /land-and-deploy

Claude: Merging PR #42...
        CI: 3/3 checks passed
        Deploy: Fly.io — deploying v2.1.0...
        Health check: https://myapp.fly.dev/health → 200 OK
        Canary: 5 pages checked, 0 console errors, p95 < 800ms

        Production verified. v2.1.0 is live.
```

---

## `/modernize`

`/ship` 把基线合并进你正在做的分支。`/modernize` 面向另一种情况：一个搁置数周的
PR，常常是别人的，真正的问题不是"它还能不能 rebase"，而是"它还应不应该存在"。

```
You: /modernize 2187

Claude: Claim: #2187 caches the skill census so `bun run skill:check` stops
        re-reading 57 directories. It relies on the census being read once per run.

        Moved under it: 41 base commits since the merge base; 3 touch its files.
        Conceptual: a2f9c01 (v1.91.240.0) made the census a shared helper that
        already memoizes per process. The cache the PR adds would be a second one.

        Verdict: CLOSE. The base solves the problem another way (a2f9c01). Nothing
        was pushed and the PR stays open; say "close it" and I will post the reason
        and the superseding commit from the bot account, with thanks to its author.
```

三种裁决，在推送任何东西之前选定。**MODERNIZE**：主张仍然成立，于是分支被
rebase，作者的提交保持作者身份，`git range-diff` 证明没有丢失任何意图（每个
变更块都有一行理由），仓库自己的测试会跑，推送用
`--force-with-lease=<branch>:<rebase 前观察到的 sha>`，别人在此期间的推送会被
拒绝而不是被覆盖。**REWORK**：问题是真的，但这个 diff 已不再是解决它的方式；
技能说明新的变更会是什么，且什么都不推。**CLOSE**：问题消失了、被另一种方式
解决，或被决定不做；技能建议连同取代它的提交一起关闭，并把 PR 留在打开状态，
直到有权的人另有决定。一次干净的 `git rebase` 不是 PR 仍然最新的证据，PR 的
年龄也不是任何一方的证据。

## `/canary`

这是我的**部署后监控模式**。

部署之后，`/canary` 替你盯着线上站点找麻烦。它在你的 Aside 浏览器里循环过你的关键页面（每页一个 `aside repl` 脚本，所以每圈都是全新加载），检查控制台错误、性能回归、页面故障和视觉异常。定期截图并与部署前基线对比。

在 `/land-and-deploy` 之后立刻用，或在一次高风险部署后安排它定期运行。

```
You:   /canary https://myapp.com

Claude: Monitoring 8 pages every 2 minutes...

        Cycle 1: ✓ All pages healthy. p95: 340ms. 0 console errors.
        Cycle 2: ✓ All pages healthy. p95: 380ms. 0 console errors.
        Cycle 3: ⚠ /dashboard — new console error: "TypeError: Cannot read
                   property 'map' of undefined" at dashboard.js:142
                 Screenshot saved.

        Alert: 1 new console error after 3 monitoring cycles.
```

---

## `/deslop-shared-libs`

从近期工作里找出值得抽取的共享代码。默认情况下，技能评审之前 14 个 UTC 天的
提交和 PR，加上当前分支的相关工作。它检查既有辅助函数，验证兼容的自有调用方，
并在推荐至多三个之前比较多达五个新机会。估算包含测试与集成，所以把代码挪进
新文件不算节省。更少的推荐——包括零个——也是合法结果。

```text
You: /deslop-shared-libs
You: /deslop-shared-libs — focus on the API and workers over the past 30 days
```

报告链接被评审的源码，点名最小可用的辅助函数及其调用方，解释可靠性收益与
共同失败风险，并区分已被 PR 覆盖的工作。它在一个有界扫描里检查较老的开着的
PR 是否与候选重叠，并披露不可访问的历史或不完整的覆盖。它读原始未提交源码，
不跑项目 hooks 或过滤器。它绝不编辑代码、跑项目测试、保存报告或创建 issue
和 PR。

`/plan-eng-review` 把同样的标准应用于计划和拟议的调用方。`/review` 哪怕对极小的
改动也检查 diff 和相关调用方。这些范围化检查不跑历史审计。可选的抽取仅属建议
且需要批准；它们不阻塞一次干净的评审，也不降低其分数。真实缺陷保持正常的
修复处理。

## `/write-skill`

每个技能每次运行都会被完整读入，所以每多一行都在每次运行时花 token，而一个点名了工具已不存在的命令的技能会产出能通过 CI 的错误调用。`/write-skill` 让技能保持精简且正确，既管 gstack 自己的模板，也管你拥有的任何技能目录。

- **找到技能**。`gstack-skill-bill <name|folder>` 只解析精确名称，并告诉你手里是什么：你自己的目录、gstack 检出模板（编辑 `SKILL.md.tmpl` 后跑 `bun run gen:skill-docs`），或一个已安装的 gstack 技能——后者它绝不编辑，因为 `gstack-upgrade` 会覆盖它。
- **编辑阶梯**。停在第一个能处理这次改动的台阶：先修工具（更清楚的报错、一个 flag、一个测试）；新会话本来就会的不加；改掉覆盖这个想法的那一行而不是追加；把事实放到能及时触达 agent 的最低层级（description、SKILL.md、`references/`、工具的 `--help`、工具的报错）；写下规则，把故事放进提交信息。
- **证据**。一个新的技能、步骤、指令、检查或默认值，需要"它在前沿模型上有帮助"的证据，或一个带日期的测量计划（[ETHOS.md: 9. Earn Its Place](/ethos/#9-赚得位置earn-its-place)）。提交带 `Evidence:` 行，每个 gstack 技能在证据台账 `docs/inventory/evidence.json` 里有一行，[docs/inventory.md](https://github.com/garrytan/gstack/blob/main/docs/inventory.md) 按每次运行的负载给它排序。
- **尺寸**。`gstack-skill-bill` 按层级打印字节数和估算 token，在 gstack 检出里还打印技能的评测任务文件（`EVAL TASKS:`）和它的台账行（`EVIDENCE:`）。提交带 `Skill-Size: <before>→<after> bytes`；一个技能比上一次 `Skill-Diet:` 提交超出 10% 以上即 DUE，上下文预算棘轮变红意味着瘦身，不是抬高上限。
- **漂移**。模板或渲染出的技能调用不存在的 gstack bin 或 flag 时，`test/skill-bin-drift.test.ts` 失败（单技能用 `bun run scripts/skill-bin-drift.ts --skill <name>`）。它的白名单只减不增。
- **完整瘦身**。先出报告，任何裁剪之前先写评测任务（`test/fixtures/skill-evals/<skill>/tasks.json`），锁住它们（`gstack-evals skill-eval --lock`，然后提交 `tasks.lock.json`；共享评测没有它拒绝付费运行），再裁剪，然后用共享技能评测（`docs/designs/SKILL_EVAL_CONTRACT.md`）证明前 vs 后 vs 无技能。只有"之前通过的任务没有一个在之后失败"，瘦身才能发布。

`/write-skill` 不是 `/skillify`：`/skillify` 把一次浏览器抓取固化成浏览器技能。改编自
[nicobailon/skill-diet](https://github.com/nicobailon/skill-diet)（MIT）。第一次瘦身把 /learn 的模板从 5,797 字节砍到 2,955 字节。

## `/test-audit`

找出维护成本高于保护价值的既有测试。`/review`、`/ship`、`/qa` 和
`/plan-eng-review` 对 diff 里的测试应用同一条[测试价值标准](https://github.com/garrytan/gstack/blob/main/docs/test-value-bar.md)；`/test-audit` 清扫的是已经存在的测试。

```text
You: /test-audit
You: /test-audit test/ --max-candidates 5
You: /test-audit --since origin/main
```

在模型阅读之前，一道机械预筛先挑出无断言探针、源码 grep、导出清单副本和近乎
重复的文件。每个候选得到一张退役卡（它检测什么、用搜索命令找出的非测试
调用方、更强的现存证明、历史、退役它能解锁什么，以及验证命令）。SKILL.md
golden 和 prompt 字节检查这类契约测试（机器读取的 token，不是英文句子；见
[价值标准](https://github.com/garrytan/gstack/blob/main/docs/test-value-bar.md)）
会被保留。报告和一份 JSON 边车落在 `~/.gstack/projects/<slug>/`。除非你批准
一批，否则什么都不编辑；被生成的会话保持只报告。标了
`gstack:test-value keep reason="..."` 的测试被跳过并列在报告附录里。

## `/eval-plan`

在第一次计费调用之前预注册一次付费评测。

```text
You: /eval-plan
You: /eval-plan how much will the retrieval eval cost before I run it?
```

`bin/gstack-eval-plan prereg --init` 写下预注册（问题、门槛、实验臂、诱饵、停止
规则、上限），`--check` 在任何字段为空时拒绝继续（`PREREG_INCOMPLETE`）。`arms`
把 `eval-arms` 模型角色对照 `lib/pricing.ts` 解析，遇到未定价模型即停
（`EVAL_PRICE_MISSING`）；`dry-run` 用桩模型以 $0 跑完每一行并标记畸形行
（`EVAL_DRY_RUN_FAILED`），且拒绝一个每个实验臂都是 Haiku 或 Sonnet 的计划，
除非 `--tier-question` 说明它要问那个层级的什么问题，并按前沿模型重新计价
（[受测的前沿模型](https://github.com/garrytan/gstack/blob/main/docs/TESTING_INTERNALS.md#frontier-models-under-test)）；
`pilot start|settle|release|report` 跑三个计价项，记录实际支出，把每个计价臂
对照上限外推到全集（`EVAL_BUDGET_EXHAUSTED`），并打印审批提问展示的那张支出表。
订阅内不额外计费的臂用 `pilot start --seat-metered <arm,...>` 声明：它预留 $0，
结算为 `unknown`，并且在它的某次尝试结算出真实费用之前不进外推。这种臂上一出现
配额或限频错误，运行即停。`results --check <prereg> <results.md>` 拒绝一份已完结
的结果文件，除非有一张表为每个臂都放了填好的行，每个 `<model>#no-gstack` 行都
排在其变体旁边（`EVAL_REPORT_NO_GSTACK_ROW`）；在那之前任何数字都不离开这次
运行。技能的收尾章节把 tier-3 项（仪表审计、稳态、密封路径、机外持久化、内存
预检、功率表、QA 浸泡）列为 `tier 3, after P7`；它们都还没跑。

## `/benchmark`

这是我的**性能工程师模式**。

`/benchmark` 为你的页面建立性能基线：加载时间、Core Web Vitals（LCP、CLS、INP）、资源数量和总传输体积。在 PR 前后各跑一次，抓住回归。

它在你的 Aside 浏览器里测量——用页面自己的 `performance` 导航与资源条目，来自真实加载，不是合成估算。每个页面跑五次，报告中位数及其区间（`--quick` 是单次粗估）。结果会持久化，让你跨 PR 跟踪趋势。

```
You:   /benchmark https://myapp.com

Claude: Benchmarking 5 pages (5 runs each)...

        /           load: 1.2s  LCP: 0.9s  CLS: 0.01  resources: 24 (890KB)
        /dashboard  load: 2.1s  LCP: 1.8s  CLS: 0.03  resources: 31 (1.4MB)
        /settings   load: 0.8s  LCP: 0.6s  CLS: 0.00  resources: 18 (420KB)

        Baseline saved. Run again after changes to compare.
```

---

## `/runaway-stopper`

这是我的**支出守门员**。

一个长寿的 agent 线程每一步都要重读自己的全部历史，所以成本随每次唤醒增长——
哪怕那些唤醒最后一句话也没说。一条 Founderstar 线程在 13 天里用掉 6.9B token，
其中约 4B 是它自己的上下文；它的一个 /ship 子代理达到 485M，因为它被五次
/ship 运行复用。`/runaway-stopper` 从宿主自己的线程数据里找出这个模式，在安全
的节点停掉它，并设置让它不再回来的默认值。

- **检测**。一个程序把每条编队线程（`tools.thread.get`，带完整记录）抓到文件，
  然后 `gstack-runaway scan --dir <dir>` 为每条线程打印一行 `RUNAWAY:`，为每条
  被越过的限打印一行 `FLAG:`：自有 token 超 500M 或活跃超 3 天（轮换）、子代理
  超 100M（停止）、空唤醒超过最近 40 轮的 25%、每个 PR 的评审轮次超 2。Captain
  只报告，绝不轮换。
- **停止**。超过 100M 的在役子代理带着理由被停止。线程在一个干净节点经交接文件
  和继任者简报（`runaway-stopper/templates/`）轮换，然后由它自己的 Captain 归档。
  正在 /ship 或合并中的线程得到 `DEFER:`，等那件事做完之前什么也不发生。
- **预防**。一次性等待所有挂起操作、安静的唤醒、紧凑的程序返回、每个 PR head
  一个 /ship 子代理（它自己那行有 100M 默认上限，`BUDGET_DEFAULT_CAP:`）、两轮
  评审，以及每次自动化运行一条全新线程。

按 2026-11-03 读取的 FOUN-4、FOUN-14 和 FOUN-71 扫描结果（节选）：

```
RUNAWAY: thread=FOUN-4 verdict=ROTATE own=4.04B(upper) total=6.90B credits=2299398 age_days=13.1 active=yes ...
FLAG: ROTATE own_tokens 4.04B > 500M (upper bound)
FLAG: LOOK subagent 40 "Run /ship on PR #442 (careless margin)" 485M > 100M (done)
RUNAWAY: thread=FOUN-14 verdict=ROTATE own=2.02B(exact) total=2.54B ...
RUNAWAY: thread=FOUN-71 verdict=ROTATE own=677M(exact) total=953M ...
```

---

## `/ubicloud`

这是我的**远程执行器**。

在 4 核沙箱上要跑一小时的套件，在 `standard-16` VM 上只要几分钟。`/ubicloud`
通过唯一入口 `bin/gstack-ubi`（`scripts/ubicloud/ubi-runner.sh`）把它跑到那里，
并带着共享配额所需的纪律：每台 VM 都以 `ubirun-<owner>-<epoch>-<suffix>-t<hours>`
命名，所以它的属主（`UBI_OWNER`，创建必需）和 TTL（`UBI_TTL_HOURS`，默认 3）对
所有人可见；每次 `up` 先收割自己属主名下 TTL 已到的 VM，以及没有 TTL 但已满
4 小时的，绝不动别的属主的；每次运行以 `UBICLOUD: left=0` 结束，否则即失败；
配额预检在创建请求之前拒绝：项目在跑的 VM 加上新尺寸超过已知上限时
（`UBI_QUOTA_VCPUS`，或上次拒绝打印的最大值；`UBI_QUOTA_WAIT` 改为等待空位）；
看门狗在远程命令静默 `UBI_IDLE_TIMEOUT` 秒（1800）后以 exit 124 连同其最后
40 行杀掉它，并每 `UBI_HEARTBEAT` 秒打印一次心跳；`gstack-ubi verify` 跑仓库
提交的 `.gstack/ubicloud.json`（setup、command、size、env、pass、pull），而不是
每车道一个包装器，且文件被限制在检出内：setup 与 pull 路径在 `--src` 内解析，
`pass` 名只在命令行授权时（`--pass NAME` 或 `--trust-config`）转发，绝不是
`UBICLOUD_*`。技能坚持被看护的启动（一个被等待的后台操作，或 `gstack-detach`），
因为只有在它活着时，runner 才会在每条退出路径上销毁自己的 VM。

```
You:   /ubicloud run the full verify

Claude: UBICLOUD_API_KEY: set; UBI_OWNER=lane7
        gstack-ubi verify  (.gstack/ubicloud.json: bootstrap.sh, "bash scripts/verify.sh", standard-16)
        ubi-runner: reap: no expired VMs
        ubi-runner: creating eu-central-h1/ubirun-lane7-1761500000-9f3a2c10-t3 (standard-16)
        ubi-runner: ubirun-lane7-1761500000-9f3a2c10-t3 carries a 3h TTL (this owner's next up or reap destroys it once it expires); if this process dies first: gstack-ubi down ubirun-lane7-1761500000-9f3a2c10-t3
        ubi-runner: heartbeat: command 300s elapsed, last output 2s ago
        ubi-runner: command exited 0 after 1140s
        ubi-runner: destroyed eu-central-h1/ubirun-lane7-1761500000-9f3a2c10-t3
        UBICLOUD: left=0 owner=lane7 vm=ubirun-lane7-1761500000-9f3a2c10-t3 others=0
```

---

## `/cso`

这是我的**首席安全官**。

跑 `/cso` 得到一次有界的静态调查：带应用模型、被质询过的发现和显式覆盖范围；没有合格的运行时或扫描器目录画像时，静态评估依然可用。有匹配的合格画像时，`/cso --comprehensive` 可以在受控的本地运行时里准备 Node/Bun、Python 和 Rails 应用、复现一个缺陷，并在不改工作分支的前提下留下一份可评审的修复候选。一个进程外见证者可以认证外部启动、合法控制和安全断言，并签发一个 `runtime_tested` 包。项目测试的完成度保持 `self_reported`，因为目标代码与测试进程同处一进程，可以伪造报告输出或终止 runner；记录下来的命令、计数、退出码和输出哈希是诊断性证据，不是独立于目标的完成见证。每份报告把断言、测试完成度和评审保证分开呈现。`tested` 状态留给未来独立于目标的见证者，今天不会发出。`/cso --doctor`、`--resume`、`--replay` 和 `--recheck` 分别诊断前置条件、恢复被中断的工作、重放记录的验证，并凭新证据确立当前源码的闭合。

```
You:   /cso

Claude: complete — assessed application routes, tenant authorization, secrets,
        dependency exposure, and deployment configuration.

        HIGH: Cross-tenant invoice access (app/controllers/invoices.rb:47)
        Confidence: high — caller, middleware, and policy checks traced
        Evidence: supported static finding; runtime not requested

        1 supported finding. Run ID: cso-…
```

---

## `/document-release`

这是我的**技术写作者模式**。

每一次 `/ship` 运行——包括重跑和更新已有 PR——都有一轮发布方自有的 `/document-release` 审计，在最终提交、验证与发布之前，对照已提交和选定的未提交变更检查相关的自写文档。明确的事实性修正并入受检变更；版本管理、Git 与 PR 发布归发布父流程所有。审计受阻或不完整时，必须先恢复，或显式接受点名的文档风险，才能发布，绝不静默变成"最新"。PR 已存在后你仍然可以独立调用 `/document-release`；那个工作流保留自己的审批、提交和 PR 正文步骤。

```
You:   /document-release

Claude: Analyzing 21 files changed across 3 commits. Found 8 documentation files.

        README.md: updated skill count from 9 to 10, added new skill to table
        CLAUDE.md: added new directory to project structure
        CONTRIBUTING.md: current — no changes needed
        TODOS.md: marked 2 items complete, added 1 new item

        All docs updated and committed. PR body updated with doc diff.
```

它还会润色 CHANGELOG 的语气（绝不覆写既有条目）、清理已完成的 TODOS、检查跨文档一致性，并只在合适的时候询问版本升级。

---

## `/retro`

这是我的**工程经理模式**。

一周结束时，我想知道实际发生了什么。不要感觉——要数据。`/retro` 分析提交历史、工作模式和发布速度，写一份坦率的复盘。

它感知团队。它识别谁在运行命令，对你自己的工作给最深的剖析，然后带着具体的表扬和成长机会拆解每一位贡献者。它计算提交数、LOC、测试占比、PR 体积和修复占比等指标。它从提交时间戳识别编码时段、找出热点文件、跟踪发布连胜，并点出本周最大的一次发布。

它还跟踪测试健康：测试文件总数、本期新增测试、回归测试提交和趋势增量。测试占比跌破 20% 时，它会把它标记为成长区。

### 示例

```
You:   /retro

Claude: Week of Mar 1: 47 commits (3 contributors), 3.2k LOC, 38% tests, 12 PRs, peak: 10pm | Streak: 47d

        ## Your Week
        32 commits, +2.4k LOC, 41% tests. Peak hours: 9-11pm.
        Biggest ship: one browser contract for every browser skill (Aside).
        What you did well: shipped a complete feature with encryption, UI, and
        18 unit tests in one focused push...

        ## Team Breakdown

        ### Alice
        12 commits focused on app/services/. Every PR under 200 LOC — disciplined.
        Opportunity: test ratio at 12% — worth investing before payment gets more complex.

        ### Bob
        3 commits — fixed the N+1 query on dashboard. Small but high-impact.
        Opportunity: only 1 active day this week — check if blocked on anything.

        [Top 3 team wins, 3 things to improve, 3 habits for next week]
```

它把一份 JSON 快照存进 `~/.gstack/projects/<slug>/retros/`，仓库的每个 worktree 共享它，于是下一次运行可以从任何检出展示趋势。旧位置的 `.context/retros/` 会在首次运行时搬过去。

---

## `/browse`

这是我的**QA 工程师模式**。

`/browse` 是闭合回路的那门技能。在它之前，agent 能思考、能写码，却仍是半个瞎子。UI 状态、登录流程、重定向、控制台错误、空状态、坏掉的布局，它都只能猜。现在它可以直接去看。

它通过 `aside repl` 脚本驾驶 [Aside](https://aside.com) AI 浏览器——你真实的浏览器，带真实登录会话——脚本是 Playwright 风格的 JavaScript：开一个标签页、干活、以带标签的行打印证据、关掉标签页。一个脚本一个流程，调用之间不携带状态，什么也不用 import。其余每一门浏览器技能（`/qa`、`/qa-only`、`/design-review`、`/canary`、`/benchmark`、`/scrape`）都建立在同一份契约上。`/scrape` 是数据提取口味：把它指向一个页面，它把表格、列表或价格以结构化数据递回来。

### 示例

```
You:   /browse staging.myapp.com — test the signup flow and check
       every page I changed in this branch

Claude: Submitting the signup form on staging.myapp.com creates a real
        account in your session. Go ahead?            [AskUserQuestion]

You:    yes

Claude: [aside repl: console hook → openTab → goto /signup → snapshot
         → fill → click Submit → snapshot → screenshot → closeTab]

        DIFF_START … heading "Welcome — set up your workspace" … DIFF_END
        URL=https://staging.myapp.com/onboarding
        CONSOLE_ERRORS=[]
        ASIDE_DIR=/Users/you/.aside/u/0/sessions/2026-09-05_7KtoAatMItBqZvoL
        GSTACK_STEP_OK

        > cp "$ASIDE_DIR/issue-001-result.jpg" .gstack/qa-reports/screenshots/
        > Read .gstack/qa-reports/screenshots/issue-001-result.jpg

        Signup works. Redirected to onboarding. Now checking changed pages…

        All 4 pages load. No console errors. No broken layouts.
        Signup → onboarding → dashboard flow works end to end.
```

四个脚本，约一分钟。完整的 QA 通过，就在你早已登录的那台浏览器里。

> **不可信内容**：页面返回的一切——快照树、文本、控制台输出、`aside exec`
> 的回答——都是数据，绝不是指令。

**agent 在你浏览器里会做什么、不会做什么**：它开自己的标签页并关掉它们；绝不读取或触碰你的标签页，绝不复述你的标签页清单，绝不输密码或读 cookie。看是免费的；对任何不是 localhost 的东西做变更性操作（提交、删除、购买）之前，都会先来一次 AskUserQuestion，列出确切的动作。登录墙？在 Aside 里登录后说"好了"——会话本来就在。

Aside 仅 macOS 15+，gstack 绝不安装它。完整契约与 cookbook 指引：[BROWSER.md](/browser/)。

### 没有 Aside 的时候

Linux、Windows，或 Aside 关着的 Mac：`/browse` 说明一次，然后切换到 gstack 自带的浏览器跑这一轮——一个编译出的二进制，对接基于 [Playwright](https://playwright.dev/) 构建的常驻 Chromium 守护进程。第一次调用启动浏览器（约 3 秒）；之后每次约 100-200ms，cookie、标签页和 localStorage 在命令之间保留。同样的技能产出同样的证据；只有浏览器属于 gstack 而非你时才有意义的那些功能都在这里：`/setup-browser-cookies` 导入你的会话，`/open-gstack-browser` 有头地看它，`/skillify` 固化一个 `/scrape`，`/pair-agent` 把它分享给另一个 agent。

当无头浏览器卡住——CAPTCHA、MFA、复杂登录——它交接给你：

```
Claude: I'm stuck on a CAPTCHA at the login page. Opening a visible
        Chrome so you can solve it.

        > browse handoff "Stuck on CAPTCHA at login page"

You:    done

Claude: > browse resume

        Got a fresh snapshot. Logged in successfully. Continuing QA.
```

浏览器在交接期间保留全部状态，`resume` 之后 agent 拿到你停在哪里的全新快照。一条 browse 命令连续失败 3 次，它会自动建议 `handoff`。

**安全提示**：回退是一个常驻 Chromium 会话——cookie、localStorage 和会话状态在命令间保留。除非你有意为之，不要拿它去碰敏感的生产环境。会话在闲置 30 分钟后自动关闭。完整 `$B` 命令参考：[BROWSER.md](/browser/#回退引擎完整参考)。

---

## `/setup-browser-cookies`

这是我的**会话管理器模式**——面向回退浏览器。Aside 开着时，`/qa` 和 `/browse` 已经跑在你的真实会话里，这门技能无事可做。

要在 gstack 自带的浏览器上做登录态测试，`/setup-browser-cookies` 从你的日常浏览器复制选定的 cookie。站点可能还需要 storage 或一次新登录，所以复制了 cookie 不等于会话可用。

选择器检测 Chrome、Chromium、Brave、Edge、仅 Windows 的 Opera 和 Opera GX，以及仅 macOS 的 Comet 和 Arc。选浏览器、账号/画像和域名。画像标签用当前 `Local State` 名称加目录判别符，改过名的画像和重名画像都能区分。任何 cookie 值都不显示；来源/画像标签本身仍然敏感。

```
You:   /setup-browser-cookies

Claude: Cookie picker opened. Select your browser, profile, and domains,
        then tell me when you're done.

        [You choose a browser/profile and pick github.com, myapp.com]

You:    done

Claude: Imported 2 domains (47 cookies). Sign-in has not been checked.
```

直接导入时，先选浏览器和画像并导航到匹配的目标。不要从 CLI 旧版 Comet 默认值推断账号：

```
You:   /setup-browser-cookies github.com from Chrome, Profile 2

Claude: Imported 12 cookies; sign-in has not been checked.
```

`--verify-auth` 是显式的，要求在启动前于守护进程环境里私下配置选择器与期望身份。它检查捕获目标上一个确切可见的身份，而不只是 HTTP 200 或 cookie 数量。配置缺失则在变更前失败。`--clear-storage` 是单独的、选择加入的恢复手段，面向 Chromium 目标：它在一个带原生时限的隔离世界里，只清捕获 origin 的 localStorage（该 origin 的标签页共享）和目标标签页的 sessionStorage。其他目标引擎保留导入/登录检查但拒绝重置。它绝不自动执行，也不能与 `--all` 组合。部分导入和未成功的检查保持可见，而不是变成一个假的"就绪"。

macOS 可能弹钥匙串批准；Linux 走其支持的 keyring/回退路径；Windows 能导入 DPAPI 兼容的 cookie，但原生 App-Bound Encryption 提取在合格验证之前保持禁用。关闭 Chrome 绕不过 Chrome 136+ 的默认目录保护。需要且有显示器时，用回退浏览器的有头手动登录，绝不降级 TCP 或复制真实画像。完整 flags、配置与隐私指引：[cookie 导入参考](/browser/#选择来源浏览器并确认登录)。

---

## `/make-pdf`

把任何 markdown 文件变成出版级品质的 PDF：得当的页边距、页码、封面、可点击目录，mermaid 和 excalidraw 围栏渲染为矢量图，需要其他格式时用 `--to html|docx`。编译出的 `pdf` 二进制负责排版；打印发生在浏览器里——先是你的 Aside 浏览器。make-pdf 从你的机器经回环地址提供成品 HTML，在一个 Aside 用完即关的标签页里打开它，经浏览器自己的 PDF 引擎打印（tagged PDF、文档大纲、页眉页脚模板全部保留），再把文件拷出来。任何东西都不离开这台机器。Aside 不在时（Linux、Windows 或应用已关闭），同一条管线改经 gstack 的内置浏览器打印，所以每个平台都出得了 PDF。围栏与格式完整指南：[howto-diagrams-and-formats.md](/howto-diagrams-and-formats/)。

---

## `/diagram`

英文进，图出。描述想要的图（或粘贴 mermaid 源码），你会拿到三件套：mermaid 源码、一个可在 excalidraw.com 打开的手绘风格可编辑 `.excalidraw` 文件，以及渲染好的 SVG + PNG。mermaid 与 excalidraw 运行时内嵌在 `lib/diagram-render/`，由 `bin/gstack-render.ts` 渲染——与 make-pdf 用的是同一个单脚本渲染——Aside 开着时经你的 Aside 浏览器，否则经 gstack 的内置浏览器，所以在每个平台都完全离线。

---

## `/autoplan`

这是我的**评审自动驾驶模式**。

逐个跑 `/plan-ceo-review`、再 `/plan-design-review`、再 `/plan-eng-review`，意味着回答 15–30 个中间问题。每个问题都有价值，但有时你想让整道关卡不停顿地跑完。

`/autoplan` 从磁盘读取评审技能并顺序执行：CEO → 设计（涉及 UI 范围时）→ DX（面向开发者时）→ 工程（永远最后）——必经的发布门禁评审的是最终修订过的计划，不是过时版本。它自动做决策：每个问题默认采纳推荐选项，六条内建原则（偏好完整覆盖、沿用既有模式、选可逆选项、沿用用户在同类历史决策中的选择、搁置含糊项、安全事项上报）负责打破平局并裁决没有推荐项的问题。品味决策（势均力敌的方案、临界范围扩展、跨模型分歧）被保存下来，汇到最后一个审批关口一次呈报。

一条命令，产出一份完整评审过的计划。

```
You:   /autoplan

Claude: Running CEO review... [4 scope decisions auto-resolved]
        Running design review... [3 design dimensions auto-scored]
        Running eng review... [2 architecture decisions auto-resolved]

        TASTE DECISIONS (need your input):
        1. Scope: Codex suggested adding search — borderline expansion. Add?
        2. Design: Two approaches scored within 1 point. Which feels right?

        [Shows both options with context]

You:    1) Yes, add search. 2) Option A.

Claude: Plan complete. 9 decisions auto-resolved, 2 taste decisions approved.
```

---

## `/learn`

这是我的**制度记忆模式**。

gstack 从每个会话中学习。模式、坑、偏好、架构决策……它们累积在 `~/.gstack/projects/$SLUG/learnings.jsonl`。每条学习记录带置信分、来源归属和它引用的文件。

`/learn` 让你看到 gstack 吸收了什么、检索特定模式、清理过期条目（引用的文件已不存在时），以及导出学习记录供团队共享。真正的魔法在其他技能里……它们在给出建议前会自动检索学习记录，并在过往洞见相关时显示 "Prior learning applied"（已应用过往学习）。

```
You:   /learn

Claude: 23 learnings for this project (14 high confidence, 6 medium, 3 low)

        Top patterns:
        - [9/10] API responses always wrapped in { data, error } envelope
        - [8/10] Tests use factory helpers in test/support/factories.ts
        - [8/10] All DB queries go through repository pattern, never direct

        3 potentially stale (referenced files deleted):
        - "auth middleware uses JWT" — auth/middleware.ts was deleted
        [Remove, keep, or update each one?]
```

---

## `/open-gstack-browser`

这是我的**同屏在场模式**——面向回退浏览器。Aside 开着时，你本来就能在 Aside 里看 agent 的标签页；这个技能解决的是浏览器为 gstack 自带时的同屏观看。

没有 Aside 时，`/browse` 默认无头运行，你看不到 agent 看到的东西。`/open-gstack-browser` 改变这一点：它启动由 Playwright 控制的 GStack Browser（带反爬隐身的换标 Chromium），自动加载侧边栏扩展。你实时观看每一个动作。

侧边栏对话就是一个控制浏览器的 Claude 实例。它自动路由到合适的模型：Sonnet 负责导航与操作（点击、跳转、填写、截图），Opus 负责阅读与分析（总结、找 bug、描述）。侧边栏页脚一键导入 Cookie。只要窗口开着浏览器就一直存活……有头模式下没有空闲超时。菜单栏写的是 "GStack Browser" 而不是 "Chrome for Testing"。

侧边栏 agent 自带分层提示注入防御：一个 22MB 的本地 ML 分类器扫描每个页面与工具输出，一个 Haiku 会话检查器对完整对话投票，一个金丝雀令牌捕捉会话外传企图，还有一个裁决合并器要求两个分类器一致才会拦截。顶栏的盾牌图标显示状态（绿/黄/红）。细节见 [ARCHITECTURE.md](/architecture/#提示注入防御侧边栏-agent)。

```
You:   /open-gstack-browser

Claude: Launched GStack Browser with sidebar extension.
        Anti-bot stealth active. All $B commands run in headed mode.
        Type in the sidebar to direct the browser agent.
        Sidebar model routing: sonnet for actions, opus for analysis.
```

---

## `/setup-deploy`

一次性的部署配置。第一次跑 `/land-and-deploy` 之前先跑它。

它自动探测你的部署平台（Fly.io、Render、Vercel、Netlify、Heroku、GitHub Actions 或自定义），发现你的生产 URL、健康检查端点与部署状态命令，并把这一切写进 CLAUDE.md，让之后的每次部署全自动。

```
You:   /setup-deploy

Claude: Detected: Fly.io (fly.toml found)
        Production URL: https://myapp.fly.dev
        Health check: /health → expects 200
        Deploy command: fly deploy
        Status command: fly status

        Written to CLAUDE.md. Run /land-and-deploy when ready.
```

如果你回答"什么都还没部署"，`/setup-deploy` 会停下且什么都不写，因为不存在可记录的生产部署。[如何搭起你的第一次生产部署](/howto-bring-up-a-first-deploy/)讲的就是这第一步；应用上线后再跑一次 `/setup-deploy` 即可。

---

## `/codex`

这是我的**第二意见模式**。

`/codex` 请来 OpenAI Codex CLI 独立评审同一份 diff。除 Codex 自身外，它在所有宿主上都可用；外部宿主安装为 `/gstack-codex`。把它的发现与原生评审对照，就能区分"两家都抓到"的确证发现与只有一方抓到的问题。

不带角色时，gstack 自有的 Codex 调用依次选择：请求内指定的模型 → `GSTACK_CODEX_MODEL` → Codex 原生配置，兜底 `gpt-6-astra`。恢复的咨询会话同样适用。生成的命令通过 `-c model=...` 传递所选模型，覆盖该次调用里 CLI 配置的模型。原生评审还会把 `-c review_model=...` 设为该选择，覆盖任何单独的评审模型钉定。

在 Codex 宿主上，Claude 的外部声音技能是 `gstack-claude-code`。它的评审、挑战与咨询调用保留 Claude 已配置的模型；`GSTACK_CLAUDE_MODEL=<model>` 提供显式覆盖（对恢复的会话也生效），请求中点名的模型优先。宿主路由与模型选择相互独立。

显式 `--role plan-review` 则改用配置的规划评审层级；请求与环境覆盖仍然优先，`host` 模式恢复原生选择。钉定、优先级与恢复见[模型策略](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md)（model policy）。

### 三种模式

**评审（Review**）——对当前 diff 跑 `codex review`。Codex 读每个改动文件，按严重度分级发现（P1 危急、P2 高、P3 中），给出 PASS/FAIL 裁决。任何 P1 发现 = FAIL。评审完全独立——Codex 看不到 Claude 的评审。

严重度门禁的 PASS 与[评审新鲜度](#评审就绪仪表盘)是两回事：未解决的记录发现（`findings > findings_fixed`，缺 `findings_fixed` 按 0 计）会让树拿不到 CURRENT，即便门禁通过。这不改变严重度门禁本身。修复后仍需一轮全新、未变更的评审通过，修复过的树才能评 CURRENT。

**挑战（Challenge**）——对抗模式。Codex 主动尝试攻破你的代码：找边界情况、竞态、安全洞，以及一上负载就会崩的假设。把它当作针对你逻辑的渗透测试。

**推理力度（Reasoning effort**）——评审与挑战默认 `high`，咨询 `medium`。`gstack-config set codex_effort <level>` 改所有运行；紧跟在 `/codex` 或模式词之后（与前置 flag `-m`、`--model`、`--role` 并列）的 `--effort <level>` 只改一次（`/codex review --effort medium` 得到更快更便宜的评审）。`--xhigh` 是 `--effort xhigh` 的简写。未知档位会在 Codex 启动前拦下。档位与优先级见[模型策略](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md#reasoning-effort)。

**咨询（Consult**）——带会话连续性的开放对话。关于代码库随便问。追问复用同一会话，上下文得以延续。适合"我这个想法对吗？"的时刻。

### 跨模型分析

当 `/review`（Claude）与 `/codex`（OpenAI）都评审过同一分支，你会得到跨模型对比：哪些发现重叠（高置信）、哪些是 Codex 独有（不同视角）、哪些是 Claude 独有。这就是代码评审的"两位医生看同一位病人"。

```
You:   /codex review

Claude: Running independent Codex review...

        CODEX REVIEW: PASS (3 findings)
        [P2] Race condition in payment handler — concurrent charges
             can double-debit without advisory lock
        [P3] Missing null check on user.email before downcase
        [P3] Token comparison not using constant-time compare

        Cross-model analysis (vs /review):
        OVERLAP: Race condition in payment handler (both caught it)
        UNIQUE TO CODEX: Token comparison timing attack
        UNIQUE TO CLAUDE: N+1 query in listing photos
```

---

## `/claude-code`

gstack 跑在 Codex 里时，由 Claude Code 担任外部评审者。其他非 Claude 宿主也为显式请求暴露这个技能；Claude Code 自身则不装。外部宿主安装为 `/gstack-claude-code`。

**评审**提供分支 diff 做只读的通过/不通过评审。**挑战**请 Claude Code 在同一份 diff 里找具体失败案例。**咨询**支持只读的仓库探索，并恢复保存在 `.context/claude-session-id` 的会话。评审与挑战从父工作流接收上下文、不带工具运行；咨询可以读文件和检索。

Claude Code CLI 必须已安装并登录。不带角色时沿用其既有模型配置；显式 `--role plan-review` 遵循[模型策略](https://github.com/garrytan/gstack/blob/main/docs/model-policy.md)。`GSTACK_CLAUDE_BIN` / `GSTACK_CLAUDE_BIN_ARGS` 可执行覆盖继续有效。错误、超时与无效响应会报告外部覆盖缺失，而不是给出一份干净的评审。自动评审总是全新开始；咨询的会话连续性是显式的。

外部评审的路由跟随宿主，与配置的模型无关。泛型第二意见请求在 Codex 上选 `/claude-code`、在其他宿主选 `/codex`；显式点名提供者的请求保持该提供者。既有 `codex_reviews` 设置控制在已使用该设置的工作流中选哪个自动评审者。既有的 opt-in 与跳过控制在办公时间、设计与 spec 工作流中继续适用。

`/claude` 已更名为 `/claude-code`，无别名。跑 `./setup --host <name>` 迁移受管安装，包括共享该检出的安装。替换件生成或安装失败时，setup 会保留一份可用的旧安装。

## 主动技能建议

gstack 可以在你的请求匹配某个技能时替你调用它。默认（`proactive: core`）只有 `/office-hours`、`/review`、`/qa` 和 `/ship` 自动调用；`all` 放开全部技能，`off` 不做任何建议。见 [docs/proactive.md](https://github.com/garrytan/gstack/blob/main/docs/proactive.md)。

## 安全与护栏

四个为任意 Claude Code 会话加上安全护栏的技能。它们通过 Claude Code 的 PreToolUse hooks 生效——透明、会话级、零配置。

### `/careful`

在临近生产环境操作、跑破坏性命令，或只是想要一张安全网时，说一句 "be careful" 或跑 `/careful`。每条 Bash 与 PowerShell 命令都会对照已知危险模式检查：

- `rm -rf` / `rm -r`——递归删除
- `DROP TABLE` / `DROP DATABASE` / `TRUNCATE`——数据丢失
- `git push --force` / `git push -f`——改写历史
- `git reset --hard`——丢弃提交
- `git checkout .` / `git restore .`——丢弃未提交的工作
- `kubectl delete`——删除生产资源
- `docker rm -f` / `docker system prune`——容器/镜像丢失

Windows 上同一个 hook 会检查 Claude Code 的 PowerShell 工具以及从 Bash 启动的任何 `pwsh`/`powershell`/`cmd`：`Remove-Item` 及其别名带 `-Recurse`/`-Force`（任意参数前缀）、cmd 的 `rd /s` 和 `del /s`、`Format-Volume`、`Clear-Disk`、`Clear-Content` 与 .NET 删除都会先询问；编码或动态的 PowerShell（`-EncodedCommand`、`iex`、`Start-Process` 启动 shell、`& $cmd`）因无法检视而一律询问。PowerShell 覆盖是尽力而为；Claude Code 的权限拒绝规则（如 `"PowerShell(Remove-Item *)"`）才是硬闸。

常见构建产物清理（`rm -rf node_modules`、`dist`、`.next`、`__pycache__`、`build`、`coverage`）在白名单里——常规操作不误报。

任何 MEDIUM 警告都可以放行。两种灾难形态不询问而是硬拒绝：对文件系统根或家目录的递归删除（含 `/*`、`~/`、`$HOME/` 形态），以及向仓库默认分支的强推（`--force-with-lease` 永不触发拒绝；逃生通道是结束会话级的 `/careful` 会话）。你也可以加自己的警告规则——每行一条 POSIX ERE——写在 `~/.gstack/careful-patterns.txt`（全局）或 `~/.gstack/projects/<slug>/careful-patterns.txt`（按项目）；自定义模式只会增加警告，绝不抑制内置规则。护栏防的是事故，不是访问控制。

### `/freeze`

把所有文件编辑限制在单一目录。调试计费 bug 时，你不希望 Claude 顺手"修好" `src/auth/` 里的无关代码。`/freeze src/billing` 会拦截该路径之外的所有 Edit、Write 和 NotebookEdit（Jupyter notebook）操作。

`/investigate` 会自动激活它——它检测正在调试的模块并把编辑冻结到那个目录。

```
You:   /freeze src/billing

Claude: Edits restricted to src/billing/. Run /unfreeze to remove.

        [Later, Claude tries to edit src/auth/middleware.ts]

Claude: BLOCKED — Edit outside freeze boundary (src/billing/).
        Skipping this change.
```

注意：它只拦 Edit 和 Write 工具。`sed` 之类 Bash 命令仍能改动边界外的文件——这是防事故，不是安全沙箱。

### `/guard`

全量安全模式——一条命令合并 `/careful` + `/freeze`。破坏性命令警告加目录范围编辑。动生产或调试线上系统时用它。

### `/unfreeze`

移除 `/freeze` 边界，恢复处处可编辑。hooks 在会话内保持注册——只是放行一切。再跑 `/freeze` 可设新边界。

---

## `/captain`

一个控制器，多条车道。`/captain`（也是 `/crew`）教会一个协调 agent 那套让几十条工作线程合进同一个基础分支而不把它搞红的运营模型。

```text
You: /captain
You: /captain ready 42        # 在车道 READY 块进列车前校验它
You: /captain train           # 构建、读裁决、叫号、核验、合并、再核验
You: /captain digest          # 重写 Needs you / New / In progress
```

规则是：车道绝不合并，其职责止于一个不打戳的 **READY**（`gstack-ship-queue ready` 打印的块，加上完整 head SHA、屏幕选择、钉定处的 ship 回执与记录在案的不稳定用例）；绿的 PR 页面或廉价测试档永远不算合并证据。控制器把 READY 钉定攒成**合并列车**，在列车 head 上读一次完整门禁（运行中的不稳定用例重跑一次；两次失败的用例就是真的），然后逐槽合并：叫号、车道在叫号上以一个只含工具输出的提交打戳、`verify --train`、`gh pr merge --match-head-commit`、再核验。在 `changelog_fragments` 之下没有叫号：`train land` 发布每个槽的打戳前缀并合并它。红车按其红用例二分，至多重build 一次；每次基础分支推送上的后盾门禁，在有未被任何列车覆盖的树落地时冻结队列。审批有三种形态（按线程的记录、带前后对比与 "do it" 回复的规划请示、带配图前后对比的合并请示）。摘要分 Needs you / New / In progress 并标注时长。每日不稳定修复把门禁运行的不稳定记录与免费套件的重试读进台账，修的是成因，从不挪阈值。在运行这套模型的编队之间有分歧的地方（squash 还是 merge、谁打戳、gate-ahead、严重竞态、READY 里带不带门禁运行 id），技能把两种做法都作为选项写进编队规则文件。

模板（CREW.md、AGENTS.md、NOTES.md、DIGEST.md、不稳定台账、车道报告、READY 块、叫号、车道简报、规划与合并请示、每日自动化提示）都在 `captain/templates/`；Capy 的团队搭建指南是 [docs/captain.md](/captain/)。

## `/gstack-upgrade`

一条命令保持 gstack 最新。它探测你的安装形态（全局装在 `~/.claude/skills/gstack`，还是内嵌在项目的 `.claude/skills/gstack`），执行升级，双安装时同步两份拷贝，并展示改了什么。

```
You:   /gstack-upgrade

Claude: Current version: 0.7.4
        Latest version: 0.8.2

        What's new:
        - Browser skills now drive your Aside browser
        - /codex multi-AI second opinion
        - /qa always uses browser now
        - Safety skills: /careful, /freeze, /guard
        - Proactive skill suggestions

        Upgraded to 0.8.2. Both global and project installs synced.
```

在 `~/.gstack/config.yaml` 里设 `auto_upgrade: true` 可完全跳过询问——有新版本时 gstack 在每个会话开始时静默升级。

---

## Greptile 集成

[Greptile](https://greptile.com) 是一家自动评审你 PR 的 YC 公司。它抓的是真 bug——竞态、安全问题、那些过了 CI 却在生产环境爆炸的东西。它真救过我不止一次。我喜欢这帮人。

### 安装

在 [greptile.com](https://greptile.com) 把 Greptile 装到你的 GitHub 仓库上——大约 30 秒。它开始评审你的 PR 后，gstack 自动抓取它的评论。无需额外配置。

### 工作原理

任何自动评审者的难题都是分流。Greptile 很好，但不是每条评论都是真问题：有的是误报，有的标记的是你三个提交前就修掉的东西。没有分流层，评论会堆积，然后你开始无视它们——这就本末倒置了。

gstack 解决这个。`/review` 和 `/ship` 读取你评审机器人的评论（Greptile、CodeRabbit、Macroscope，或你点名的任何机器人），逐条分类并采取行动：

- **有效问题**进关键发现清单，发布前修掉
- **已修复问题**自动回复致谢
- **误报**顶回去——你确认后，一条解释错在哪的回复发出去

结果是一个双层评审：Greptile 在 PR 上异步抓问题，`/review` 和 `/ship` 再把那些发现纳入常规工作流分流。没有任何东西掉进缝里。

### 从历史中学习

你确认过的每条误报都存进 `~/.gstack/review-bot-history.md`，并打上产出它的机器人的标签。之后的运行会对你的代码库自动跳过该机器人已知的误报模式。`/retro` 还会长期追踪每个机器人的命中率——你能看到信噪比是否在改善。

### 选择你的机器人

机器人就是 `gstack-pr-wait` 用的两张清单：`gstack-config set pr_wait_gating_bots greptile,macroscope`（先等待、后分流）与 `gstack-config set pr_wait_advisory_bots coderabbit,copilot`（只分流、从不等待）。两个都设为 `none` 可关闭机器人分流。Greptile 的提前评审（`/ship` 提前开 PR）只在 `greptile` 位于其中一张清单时运行。

### Example

```
You:   /ship

Claude: [syncs main, runs tests, pre-landing review...]

        Greptile found 3 comments on this PR:

        [VALID] app/services/payment_service.rb:47 — Race condition:
        concurrent charges can double-debit. Recommend DB-level advisory
        lock around the charge block.

        [ALREADY FIXED] app/models/user.rb:12 — Missing null check
        on email before downcase.
        → Already fixed in commit abc1234. Auto-replying.

        [FALSE POSITIVE] lib/auth.rb:88 — "Token comparison should
        use constant-time comparison." We already use
        ActiveSupport::SecurityUtils.secure_compare here.

        Fixing the race condition in payment_service.rb...

        The auth token comment is a false positive.
        Options: A) Reply to Greptile explaining  B) Fix anyway  C) Ignore

You:    A

Claude: Replied to Greptile. All tests pass.
        PR: github.com/you/app/pull/42
```

三条 Greptile 评论：一个真修复，一个自动致谢，一个误报顶回并回复。额外总耗时：约 30 秒。

---

## `/ios-qa`

真机 iOS QA。这个分支最重要的洞见是：不模拟、不跑 XCTest、不拉起 WebDriverAgent。在被测应用里内嵌一个 HTTP 服务器，由 Mac 侧守护进程经 USB CoreDevice 的 IPv6 隧道驱动它。

agent 读你的 Swift 源码，找出带 `@Snapshotable` 标记字段的 `@Observable` 类，代码生成带类型的访问器，部署调试桥，然后跑一个封闭的发现→修复→验证循环。

### 一张图看架构

```
       ┌──────────────────────┐   USB CoreDevice (IPv6)   ┌──────────────────┐
       │ gstack-ios-qa daemon │ ────────────────────────▶ │ iOS app          │
       │ (Mac, bun/TS)        │   bearer + X-Session-Id   │ StateServer      │
       │ - rotates boot token │                           │ (loopback only)  │
       │ - mints session toks │                           └──────────────────┘
       │ - capability tiers   │
       │ - audit + redact     │
       └──────────────────────┘
                ▲
                │ Tailscale (optional, --tailnet)
                │
       ┌──────────────────────┐
       │ Remote agent         │
       │ (OpenClaw, etc.)     │
       └──────────────────────┘
```

iOS 应用的 `StateServer` 只绑回环地址（`::1` + `127.0.0.1`）。Mac 守护进程掌管 tailnet 身份校验、能力层级与审计日志。远程 agent 永远看不到引导令牌——只有经 Tailscale 身份门控铸造的短时会话令牌（默认 1 小时，硬上限 24 小时）。

### 解锁点：USB 直连 + Tailscale = 任意 agent 的远程 iOS QA

一台 Mac、一部你已有的 iPhone，加上 Tailscale 免费档，就替代了多数团队付费购买 BrowserStack/Sauce Labs 的能力。你的 tailnet 上任何能发 HTTP 的 agent，拿到你铸造的会话令牌后就能驱动这部 iOS 应用。Tailscale ACL 圈定哪些身份能以哪个能力层级触达这台 Mac。

可运行的完整配置见 `ios-qa/docs/tailscale-acl-example.md`。

### 能力层级

| 层级 | 端点 |
|------|-----------|
| observe（观察） | `/screenshot`, `/elements`, `GET /state/*`, `/state/snapshot`, `/healthz` |
| interact（交互） | observe + `/tap`, `/swipe`, `/type`, `/session/*` |
| mutate（变更） | interact + `POST /state/<key>` |
| restore（恢复） | mutate + `POST /state/restore` |

默认铸造的令牌拿到 `interact`。更高层级需要所有者显式铸造。

---

## `/ios-fix`

铁律：没有复现快照就没有修复。agent 经 `GET /state/snapshot` 抓取 bug 前状态，写下修复，重新构建、重新部署，恢复快照，验证 bug 已消失。快照成为回归测试夹具，让这个 bug 无法悄悄复发。

这是 `/qa` 的发现 bug → 修复 → 再验证循环在 iOS 上的镜像。

---

## `/ios-design-review`

在真机 iPhone 上做设计师视角的 QA。以观察层级连上同一个 `/ios-qa` 守护进程，对每个屏幕截图。给 10 个维度打 0–10 分：排版层级、间距节奏、色彩层级、触控目标、加载/空/错误状态、无障碍、动画纪律、iOS 惯用法贴合度、信息密度、AI slop 检查。

每个低于 7 分的维度，用 AskUserQuestion 呈现问题与推荐修法。

---

## `/ios-clean`

便捷封装。防止 DebugBridge 混进 Release 构建的结构性防线在 `Package.swift`（`.when(configuration: .debug)`）加一条 CI 不变量测试里。`/ios-clean` 面向想要引导式移除流程、或没走 `/ios-qa` 手动加了 SPM 依赖的开发者。

---

## `/ios-sync`

升级 gstack 或新增 `@Observable` 类之后运行。它探测已安装内容，按最新上游模板跑 gen-accessors，刷新变化的 Swift 文件，验证应用可重新构建。缓存键失效覆盖 Swift 版本变化、生成器 git 版本变化与源码变化。
