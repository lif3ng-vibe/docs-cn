# hooks-architecture.mdx 锚点映射

Claude-Mem 如何使用 Hook：生命周期驱动的架构 | Claude-Mem 如何使用 Hook：生命周期驱动的架构 | claude-mem-如何使用-hook生命周期驱动的架构
核心原则 | 核心原则 | 核心原则
整体概览 | 整体概览 | 整体概览
为什么选择 Hook？ | 为什么选择 Hook？ | 为什么选择-hook
非侵入性要求 | 非侵入性要求 | 非侵入性要求
Hook 系统的优势 | Hook 系统的优势 | hook-系统的优势
Hook 脚本 | Hook 脚本 | hook-脚本
Setup Hook: Version Check | Setup Hook：版本检查 | setup-hook版本检查
Hook 1: SessionStart - Context Injection | Hook 1：SessionStart——上下文注入 | hook-1sessionstart上下文注入
Hook 2: UserPromptSubmit (New Session Hook) | Hook 2：UserPromptSubmit（新会话 Hook） | hook-2userpromptsubmit新会话-hook
Hook 3: PostToolUse (Save Observation Hook) | Hook 3：PostToolUse（保存观察记录 Hook） | hook-3posttooluse保存观察记录-hook
Hook 4: Stop Hook (Summary Generation) | Hook 4：Stop Hook（生成会话摘要） | hook-4-stop-hook生成会话摘要
Hook 5: SessionEnd (Cleanup Hook) | Hook 5：SessionEnd（清理 Hook） | hook-5sessionend清理-hook
Hook Execution Flow | Hook 执行流程 | hook-执行流程
Session Lifecycle | 会话生命周期 | 会话生命周期
Hook Timing | Hook 时序 | hook-时序
The Worker Service Architecture | Worker 服务架构 | worker-服务架构
为什么需要后台 worker？ | 为什么需要后台 worker？ | 为什么需要后台-worker
Bun Process Management | Bun 进程管理 | bun-进程管理
Worker HTTP API | Worker HTTP API | worker-http-api
Design Patterns | 设计模式 | 设计模式
Pattern 1: Fire-and-Forget Hooks | 模式 1：即发即忘的 Hook | 模式-1即发即忘的-hook
Pattern 2: Queue-Based Processing | 模式 2：基于队列的处理 | 模式-2基于队列的处理
Pattern 3: Graceful Degradation | 模式 3：优雅降级 | 模式-3优雅降级
Pattern 4: Progressive Enhancement | 模式 4：渐进增强 | 模式-4渐进增强
Hook Debugging | Hook 调试 | hook-调试
Debug Mode | 调试模式 | 调试模式
Common Issues | 常见问题 | 常见问题
Testing Hooks Manually | 手动测试 Hook | 手动测试-hook
Performance Considerations | 性能考量 | 性能考量
Hook 执行耗时 | Hook 执行耗时 | hook-执行耗时
Database Performance | 数据库性能 | 数据库性能
Worker Throughput | Worker 吞吐量 | worker-吞吐量
Security Considerations | 安全考量 | 安全考量
Hook Command Safety | Hook 命令安全性 | hook-命令安全性
Data Privacy | 数据隐私 | 数据隐私
API Key Protection | API 密钥保护 | api-密钥保护
Key Takeaways | 核心要点 | 核心要点
Further Reading | 延伸阅读 | 延伸阅读

## 跨页锚点

无