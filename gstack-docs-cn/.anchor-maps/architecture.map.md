## The core idea | ## 核心思想 | 核心思想
### The fallback engine | ### 回退引擎 | 回退引擎
## Why Bun | ## 为什么是 Bun | 为什么是-bun
## The daemon model | ## 守护进程模型 | 守护进程模型
### Why not start a browser per command? | ### 为什么不每条命令起一个浏览器？ | 为什么不每条命令起一个浏览器
### State file | ### 状态文件 | 状态文件
### Port selection | ### 端口选择 | 端口选择
### Version auto-restart | ### 版本自动重启 | 版本自动重启
## Rendering local HTML | ## 渲染本地 HTML | 渲染本地-html
## Security model | ## 安全模型 | 安全模型
### The browser boundary (Aside) | ### 浏览器边界（Aside） | 浏览器边界aside
### Localhost only | ### 只绑回环 | 只绑回环
### Dual-listener tunnel architecture (v1.6.0.0) | ### 双监听器隧道架构（v1.6.0.0） | 双监听器隧道架构v1600
### Bearer token auth | ### Bearer 令牌认证 | bearer-令牌认证
### Cookie security | ### Cookie 安全 | cookie-安全
### Shell injection prevention | ### 防 shell 注入 | 防-shell-注入
### Egress receipt ledger (v1.63.0.0) | ### 出站回执台账（v1.63.0.0） | 出站回执台账v16300
### Unicode sanitization at server egress (v1.38.0.0) | ### 服务器出站的 Unicode 消毒（v1.38.0.0） | 服务器出站的-unicode-消毒v13800
### Prompt injection defense (sidebar agent) | ### 提示注入防御（侧边栏 agent） | 提示注入防御侧边栏-agent
## The ref system | ## ref 系统 | ref-系统
### How it works | ### 工作原理 | 工作原理
### Why Locators, not DOM mutation | ### 为什么用 Locator 而不是改 DOM | 为什么用-locator-而不是改-dom
### Ref lifecycle | ### ref 生命周期 | ref-生命周期
### Ref staleness detection | ### ref 过期检测 | ref-过期检测
### Cursor-interactive refs (@c) | ### 光标可交互 ref（@c） | 光标可交互-refc
## Logging architecture | ## 日志架构 | 日志架构
## SKILL.md template system | ## SKILL.md 模板系统 | skillmd-模板系统
### The problem | ### 问题 | 问题
### The solution | ### 解法 | 解法
### The preamble | ### preamble | preamble
### Why committed, not generated at runtime? | ### 为什么提交在库、而不是运行时生成？ | 为什么提交在库而不是运行时生成
### Template test tiers | ### 模板测试分层 | 模板测试分层
## Command dispatch | ## 命令分发 | 命令分发
## Error philosophy | ## 错误哲学 | 错误哲学
### Crash recovery | ### 崩溃恢复 | 崩溃恢复
## E2E test infrastructure | ## E2E 测试基础设施 | e2e-测试基础设施
### Session runner (`test/helpers/session-runner.ts`) | ### 会话运行器（`test/helpers/session-runner.ts`） | 会话运行器testhelperssession-runnerts
### Observability data flow | ### 可观测性数据流 | 可观测性数据流
### Eval persistence (`test/helpers/eval-store.ts`) | ### 评测持久化（`test/helpers/eval-store.ts`） | 评测持久化testhelperseval-storets
### Test tiers | ### 测试分层 | 测试分层
## What's intentionally not here | ## 刻意不做的 | 刻意不做的
