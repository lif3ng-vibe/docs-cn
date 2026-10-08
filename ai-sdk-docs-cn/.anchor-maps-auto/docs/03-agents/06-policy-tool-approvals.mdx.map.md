Policy-Based Tool Approvals | 基于策略的工具审批 | 基于策略的工具审批
Policy-Based Tool Approvals | Policy-Based Tool Approvals | policy-based-tool-approvals
What you can enforce | 你能强制约束什么 | 你能强制约束什么
Best fit: deterministic checks | 最适合：确定性检查 | 最适合确定性检查
Install | 安装 | 安装
pick one (or both) OPA backends: | pick one (or both) OPA backends: | pick-one-or-both-opa-backends
How it works | 工作原理 | 工作原理
Quick start | 快速上手 | 快速上手
Writing the Rego policy | 编写 Rego 策略 | 编写-rego-策略
Default to "not-applicable" so unmatched calls fall through. | Default to "not-applicable" so unmatched calls fall through. | default-to-not-applicable-so-unmatched-calls-fall-through
Use { decision: "deny" } to default-deny instead. | Use { decision: "deny" } to default-deny instead. | use--decision-deny--to-default-deny-instead
Hard deny: pushes are never allowed automatically. | Hard deny: pushes are never allowed automatically. | hard-deny-pushes-are-never-allowed-automatically
Auto-allow: read-only git operations. | Auto-allow: read-only git operations. | auto-allow-read-only-git-operations
Human-in-the-loop: kubectl by oncall. | Human-in-the-loop: kubectl by oncall. | human-in-the-loop-kubectl-by-oncall
Test the policy in CI | 在 CI 中测试策略 | 在-ci-中测试策略
policy_test.rego | policy_test.rego | policy_testrego
Errors fail closed | 错误时默认拒绝（fail closed） | 错误时默认拒绝fail-closed
Loading the policy | 加载策略 | 加载策略
Option A: WASM (in-process) | 方案 A：WASM（进程内） | 方案-awasm进程内
Option B: HTTP (running OPA server) | 方案 B：HTTP（运行中的 OPA 服务器） | 方案-bhttp运行中的-opa-服务器
Bring in external data and integrations | 引入外部数据与集成 | 引入外部数据与集成
Roll out safely with shadow mode | 用影子模式安全上线 | 用影子模式安全上线
Send decisions to your observability platform | 将决策发送到你的可观测性平台 | 将决策发送到你的可观测性平台
Capability scoping at the model boundary | 在模型边界进行能力限定 | 在模型边界进行能力限定
Scoping a discovered tool surface | 限定已发现的工具面 | 限定已发现的工具面
Allow-all when no policy is configured | 未配置策略时放行全部 | 未配置策略时放行全部
Transitive enforcement: composite tools | 传递式强制：组合工具 | 传递式强制组合工具
Example application | 示例应用 | 示例应用
API reference | API 参考 | api-参考
Related | 相关内容 | 相关内容
