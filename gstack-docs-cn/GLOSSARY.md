# gstack 汉化术语表

翻译规范以 `~/.claude/skills/translate-docs-site/SKILL.md` 为准；本表是 gstack 站的领域术语与站内统一口径。子代理开工前必读本表。

## 不译名单（产品/工具/文件/命令名，全部保留原文）

gstack、GBrain、Capy、Captain（命令语境 `/captain` 不译；叙述性"控制器"角色可译）、Aside、Claude Code、Codex、OpenCode、Cursor、Factory Droid、Kiro、Copilot CLI、Antigravity、Gemini CLI、Slate、OpenClaw、ClawHub、Hermes、Dot(s)、QM、Muse Code、Grok、Zed、Amp、Jules、Y Combinator（可译"Y Combinator"保留）、Chrome、Chromium、Brave、Edge、Opera、Comet、Arc、Playwright、Bun、Node.js、npm、git、GitHub、ngrok、Ubicloud、Supabase、PGLite、Tailscale、tailnet、Mermaid、Excalidraw、ffmpeg、Diataxis（后可括注"文档框架"）、OWASP、STRIDE、Core Web Vitals、TTHW、SKILL.md、CLAUDE.md、AGENTS.md、CREW.md、DESIGN.md、READY block、MIT、PowerShell、pwsh、winget、WSL、Git Bash、MSYS2、AppArmor、Consolas、Volta、React/Svelte/Vue、TypeScript、Swift、Rails、Puppeteer、Selenium、WebDriver、CDP、MCP、SDK、CLI、API、JSON、TOML、YAML、PDF、MP4、GIF、SVG、PNG

所有 slash command：`/office-hours`、`/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review`、`/plan-devex-review`、`/design-consultation`、`/review`、`/deslop-shared-libs`、`/write-skill`、`/test-audit`、`/investigate`、`/verify`、`/design-review`、`/devex-review`、`/design-shotgun`、`/design-html`、`/design-motion`、`/qa`、`/qa-only`、`/pair-agent`、`/cso`、`/ship`、`/land-and-deploy`、`/modernize`、`/canary`、`/benchmark`、`/ubicloud`、`/runaway-stopper`、`/eval-plan`、`/document-release`、`/document-generate`、`/retro`、`/browse`、`/scrape`、`/setup-browser-cookies`、`/autoplan`、`/spec`、`/learn`、`/make-pdf`、`/diagram`、`/codex`、`/claude-code`、`/careful`、`/freeze`、`/guard`、`/unfreeze`、`/open-gstack-browser`、`/setup-deploy`、`/setup-gbrain`、`/sync-gbrain`、`/gstack-upgrade`、`/captain`、`/crew`、`/ios-qa`、`/ios-fix`、`/ios-design-review`、`/ios-clean`、`/ios-sync`、`/office-hours` 等——一律原样。

gstack 独立 CLI：`gstack-egress`、`gstack-context-bill`、`gstack-model-benchmark`、`gstack-pr-wait`、`gstack-doctor`、`gstack-team-init`、`gstack-config`、`gstack-error-capture`、`gstack-prose-lint`、`gstack-decision-trail`、`gstack-worktree-audit`、`gstack-harness`、`gstack-modules`、`gstack-clean`、`gstack-upgrade` 等 `gstack-*` 前缀命令不译。

环境变量、配置键、路径、报错原文不译。

## 术语对照（英文 → 统一中文译法）

| 英文 | 中文 | 说明 |
|---|---|---|
| skill | 技能 | gstack 的 slash command 单元 |
| agent harness / host | agent 宿主 | 两个词都指运行环境时统一"宿主" |
| sprint | 冲刺 | 十个并行冲刺 = 十个并行 sprint |
| office hours | 办公时间 | YC 术语，首现括注 |
| design doc | 设计文档 | |
| ship（动词） | 发布 | |
| release engineer | 发布工程师 | |
| merge train | 合并列车 | Captain 术语 |
| lane | 车道 | Captain 术语 |
| train | 列车 | |
| outside review | 外部评审 | |
| second opinion | 第二意见 | |
| gate | 门禁 | |
| pre-gate | 预门禁 | |
| gate integrity | 门禁完整性 | |
| regression | 回归（测试） | |
| AI slop | AI slop（AI 垃圾风格代码） | 首现括注，后文 AI slop |
| mockup | 视觉稿 | |
| taste | 品味 | |
| forcing question | 逼问式问题 | |
| premise | 前提 | |
| framing | 问题框定 | |
| wedge | 楔子 | YC 术语，最窄切入点 |
| loadout | 配置组 | 模块组合，首现括注 |
| egress receipt | 出站回执 | |
| telemetry | 遥测 | |
| update check | 更新检查 | |
| team mode | 团队模式 | |
| vendored | 内嵌（安装） | |
| state root | 状态根目录 | |
| conformance test | 一致性测试 | |
| certification | 认证 | |
| tier | 层级 | full/experimental/instruction-only 译 完整/实验性/仅指令 |
| fallback | 回退 | |
| bundled browser | 内置浏览器 | |
| headed mode | 有头模式 | |
| anti-bot stealth | 反爬隐身 | |
| domain skill | 站点技能 | per-site，首现括注 domain skills |
| eval | 评测 | |
| judge | 评审模型 | quality judge |
| dry run | 演练 | |
| stub model | 桩模型 | |
| decoy | 诱饵 | eval-plan 术语 |
| worktree | worktree | Git 术语不译 |
| TTHW | TTHW | time to hello world，首现括注 |
| developer experience / DX | 开发者体验（DX） | 首现括注 |
| onboarding | 上手流程 | |
| magical moment | 魔法时刻 | |
| boomerang | 回旋镖 | devex-review 比喻 |
| digest | 摘要 | |
| flaky | 不稳定（测试） | flaky pass 不稳定通过 |
| ledger | 台账 | review/evidence ledger 评审/证据台账 |
| receipt | 回执 | |
| artifact | 产物 | |
| memory（GBrain） | 记忆 | |
| trust triad | 信任三元组 | 读写/只读/拒绝 |
| throttled | 限频 | |
| channel | 渠道 | stable 渠道保留 stable |
| tagged release | 打标发布 | |
| host | 宿主 | agent host |
| router skill | 路由技能 | |
| task skill | 任务技能 | |
| prefix mode | 前缀模式 | |
| model tier | 模型层级 | |
| behavioral profile | 行为配置 | |
| capability check | 能力检查 | |
| daemon | 守护进程 | |
| allowlist | 白名单 | |
| audit log | 审计日志 | |
| escape hatch | 逃生通道 | |
| spend warden | 支出守门员 | |
| runaway | 失控 | runaway agent 失控 agent |
| handoff | 交接 | |
| retro | 复盘 | |
| shipping streak | 发布连胜 | |
| redaction | 脱敏 | |
| fail-closed | 失败即关闭 | |
| corpus | 语料库 | |
| preregister | 预注册 | |
| stop rule | 停止规则 | |
| pilot | 试点 | |
| extrapolation | 外推 | |
| spend table | 支出表 | |
| coverage map | 覆盖图 | |
| tutorial / how-to / explanation / reference | 教程 / 操作指南 / 解释 / 参考 | Diataxis 四象限 |
| unattended | 无人值守 | |
| sealed output | 密封输出 | |
| wave lane | 波次车道 | |
| owner brief | 负责人简报 | |
| evidence verification | 证据核验 | |
| tree receipt | 树回执 | |
| ship receipt | 发布回执 | |
| restamp | 重新打戳 | |
| token budget | token 预算 | |
| fresh-context | 全新上下文 | |
| prose lint | 文风检查 | |
| doctor | 诊断器 | gstack-doctor |
| installer | 安装器 | |
| approvals | 审批 | |
| brief | 简报 | |
| symlink | 符号链接 | |
| Boil the Ocean | 沸腾大海 | ETHOS 篇名，括注 |
| Search Before Building | 先搜索再建造 | ETHOS 篇名 |
| three layers of knowledge | 三层知识 | |
| tried-and-true / new-and-popular / first-principles | 屡试屡验 / 新近流行 / 第一性原理 | |
| Iron Law | 铁律 | |
| 10-star | 十星 | |
| virtual engineering team | 虚拟工程团队 | |
| software factory | 软件工厂 | |
| chief of staff | 参谋长 | |
| capability tier | 能力层级 | observe/interact/mutate/restore 观察/交互/变更/恢复 |
| HIG audit | HIG 审计 | Apple Human Interface Guidelines |
| debug bridge | 调试桥 | |
| accessor | 访问器 | |
| codegen | 代码生成 | |
| smart app control | Smart App Control | Windows 功能名不译 |
| Developer Mode | 开发者模式 | |
| migration | 迁移 | |
| registry（generated-file） | 注册表 | |
| queue-aware | 队列感知 | |
| results sink | 结果汇聚端 | |
| sink | 汇聚端 | |
| contribution(s) graph | 贡献图 | |

## 角色译名（README「sprint 表」等处的专家隐喻）

| 英文 | 中文 |
|---|---|
| YC Office Hours | YC 办公时间 |
| CEO / Founder | CEO / 创始人 |
| Eng Manager | 工程经理 |
| Senior Designer | 资深设计师 |
| Developer Experience Lead | 开发者体验负责人 |
| Design Partner | 设计伙伴 |
| Staff Engineer | 资深工程师 |
| Shared Code Reviewer | 共享代码评审 |
| Skill Editor | 技能编辑器 |
| Test Auditor | 测试审计员 |
| Debugger | 调试手 |
| Build Loop | 构建循环 |
| Designer Who Codes | 会写代码的设计师 |
| DX Tester | DX 测试员 |
| Design Explorer | 设计探索者 |
| Design Engineer | 设计工程师 |
| Motion Designer | 动效设计师 |
| QA Lead | QA 负责人 |
| QA Reporter | QA 报告员 |
| Multi-Agent Coordinator | 多 Agent 协调器 |
| Chief Security Officer | 首席安全官 |
| Release Engineer | 发布工程师 |
| Stale-PR Maintainer | 陈旧 PR 维护者 |
| SRE | SRE |
| Performance Engineer | 性能工程师 |
| Remote Runner | 远程执行器 |
| Spend Warden | 支出守门员 |
| Eval Planner | 评测规划器 |
| Technical Writer | 技术写作者 |
| Documentation Author | 文档作者 |
| Memory | 记忆 |
| Publisher | 出版器 |
| Diagram Maker | 图表绘制器 |
| Safety Guardrails | 安全护栏 |
| Edit Lock | 编辑锁 |
| Crew Controller | 编队控制器 |
| Session Manager | 会话管理器 |
| Second Opinion | 第二意见 |
| Self-Updater | 自更新器 |
| Spec Author | 规格作者 |
| Review Pipeline | 评审流水线 |

## 排版与翻译纪律（摘要，全文见 skill）

- 中文全角标点（，。：；？！、（）""——）；中英文/数字间一个半角空格；代码内半角。
- 引号统一 ""（不用「」）；破折号——不带空格。
- 粗体闭合：`**……。**后文` ✗ → `**……**。后文` ✓；`**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓。
- 代码块内容不译；唯一例外：bash/shell 块内 `# ` 开头的注释行要译。终端会话输出原样。
- 表格中命令/路径/取值列不译，表头与说明列要译。
- 链接：只译 `[文字]`，`(路径#锚点)` 一字不动。
- frontmatter title 也要译（description 若有同样）。
- 术语首现附英文原词：如「门禁（gate）」。
