# e2e 文档中文翻译术语表

> 源站：https://e2e.tester.army/docs （Mintlify）。上游快照：tester-army/e2e @ main（2026-10-07）。
> 本表是并行子代理的注入材料 + 终检的 grep 清单。终检补充批次见文末。

## 核心概念

| 英文 | 中文 | 备注 |
|---|---|---|
| goal | 目标 | `agent.act` 的参数概念，译「目标」；代码/参数名不译 |
| assertion | 断言 | |
| locator | 定位器 | Playwright 社区通行译法 |
| agent | 智能体 | 泛指行文用「智能体」；`agent` fixture/`agent.act` 等 API 名不译 |
| agent step | 智能体步骤 | |
| coding agent | 编码智能体 | |
| engine | 引擎 | |
| engine contract | 引擎契约 | |
| executor | 执行器 | |
| step executor | 步骤执行器 | |
| fixture | fixture | 不译（Playwright 社区惯例） |
| runner | runner | 不译（产品内概念） |
| decision model | 决策模型 | |
| verdict | 判定 | |
| attempt | 尝试 | |
| suite | 套件 | |
| report | 报告 | |
| reporter | 报告器 | |
| trace | 链路 | trace page → 链路页 |
| evidence | 证据 | |
| replay cache | 回放缓存 | replay → 回放 |
| redacted | 脱敏 | |
| secret / Secret | 机密 / `Secret` | 行文译「机密」，API 类型名 `Secret` 不译 |
| vision | 视觉 | vision: true 等参数名不译 |
| viewport | 视口 | |
| test ID | test ID | `data-testid` 等属性不译 |
| observation | 观测 | engine contract 术语 |
| action | 动作 | engine contract 术语 |
| hook | 钩子 | |
| provider | 提供者 | browser provider → 浏览器提供者；device provider → 设备提供者 |
| browser provider | 浏览器提供者 | |
| device provider | 设备提供者 | |
| simulator | 模拟器 | iOS Simulator 译「模拟器」 |
| emulator | 仿真器 | Android Emulator 译「仿真器」（与模拟器区分） |
| device cloud | 设备云 | |
| hosted browsers and devices | 托管浏览器与设备 | |
| subscription | 订阅 | |
| explore | 探索 | 功能名；explore session → 探索会话 |
| explore session | 探索会话 | |
| bug bash | bug 大排查 | 功能名 Bug bashes |
| persona | 人设 | |
| skill | skill | 不译（Claude Code 生态概念） |
| tool | 工具 | |
| model | 模型 | |
| judging model | 判定模型 | |
| decision model | 决策模型 | |
| target | target | CLI/配置概念 `--target` 不译 |
| workflow | 工作流 | |
| pipeline | 流水线 | |
| app session | 应用会话 | |

## 标准译法句例

- "Run e2e alongside Playwright" → 「让 e2e 与 Playwright 并行运行」
- "one prompt to your coding agent" → 「给你的编码智能体发一句话提示」
- "Spend less time on tests and more time building" → 「少花时间写测试，多花时间搭建产品」

## 不译名单

e2e、Playwright、Cypress、Selenium、Detox、Maestro、Expo、EAS、Bitrise、Codemagic、GitHub Actions、MCP、Mintlify、Node、npm、pnpm、bun、bunx、npx、TypeScript、Zod（代码中的 zod 不译，行文 Zod 保留）、Standard Schema、PostHog、Claude Code、Codex、Cursor、ChatGPT、GitHub Copilot、OpenCode、SuperGrok、Kernel、SwiftUI、Jetpack Compose、Flutter、Kotlin Multiplatform、Vite、Next.js、Android、iOS、fixture、runner、agent（API 名）、`agent.act`/`agent.assert`/`agent.waitFor`/`agent.extract`、`screen`、`expect`、`test`、`app`、`browser`、`device`、`unique`、`e2e.config.ts`、环境变量（`E2E_*`）、CLI 命令与旗标

## 终检补充批次

（终检统计各译法文件数取多数派后定稿）

| 英文 | 定稿中文 | 备注 |
|---|---|---|
| artifact | 产物 | 全站多数派，唯一分歧已被多数派吸收 |
| ledger | 台账 | 首现附原词「台账（ledger）」；prior-step ledger→上一步台账；secret ledger→机密/脱敏台账 |
| lease | 名词「租约」、动词「租用」 | 按语境自然分工，两种形态并存 |
| headed / headless | 有头 / 无头 | 有头浏览器、有头的运行；不用「有界面的」 |
| provider seam | 提供者接缝（provider seam） | 首现附原词 |
| screencast | 屏幕广播 | |
| dashboard | 控制台 | |
| repro test | 复现测试 | |
| explorer | 探索者 | |
| explorer 的 goal | 探索目标 | gated 目标提示词按代码体保留英文 |
| setup test | 准备测试 | explore 语境；`setup` 字面量不译 |
| job（CI） | 作业 | |
| pull request | 拉取请求 | |
| build profile | 构建配置档 | |
| required check | 必需检查 | |
| judgment tier | 判定层 | |
| bounded actions | 受限动作 | |
| hand-off | 接管 | |
| flaky | 不稳定 | |
| persona | 人设 | |
| physical device | 真机 | |
| device farm | 设备农场 | |
| deep link | 深链 | |
| pinned | 固定 | |
| keychain | 钥匙串 | |
| masked | 遮挡 | 像素/截图语境；与 redaction→脱敏区分 |
| redaction ledger | 脱敏台账 | |
| credential | 凭据 | |
| digest | 摘要 | |
| surface | 界面 | |
| taint | 污点 | |
| serial group | 串行组 | |
| teardown | 清理 | |
| migration 状态列 | same→相同 / renamed→更名 / missing→暂缺 / web only→仅 web / device only→仅 device / by design→有意为之 | migrate 各页统一 |