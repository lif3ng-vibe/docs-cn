# progressive-disclosure.mdx 锚点映射

Progressive Disclosure: Claude-Mem's Context Priming Philosophy | 渐进式披露：Claude-Mem 的上下文预热哲学 | 渐进式披露claude-mem-的上下文预热哲学
Core Principle | 核心原则 | 核心原则
What is Progressive Disclosure? | 什么是渐进式披露？ | 什么是渐进式披露
The Problem: Context Pollution | 问题：上下文污染 | 问题上下文污染
Claude-Mem's Solution: Progressive Disclosure | Claude-Mem 的方案：渐进式披露 | claude-mem-的方案渐进式披露
How It Works in Claude-Mem | 在 Claude-Mem 中的工作机制 | 在-claude-mem-中的工作机制
The Index Format | 索引格式 | 索引格式
The Legend System | 图例系统 | 图例系统
Progressive Disclosure Instructions | 渐进式披露指引 | 渐进式披露指引
The Philosophy: Context as Currency | 理念：上下文即货币 | 理念上下文即货币
Mental Model: Token Budget as Money | 心智模型：把 token 预算当钱花 | 心智模型把-token-预算当钱花
The Attention Budget | 注意力预算 | 注意力预算
Design for Autonomy | 为自主性而设计 | 为自主性而设计
Implementation Principles | 实现原则 | 实现原则
1. Make Costs Visible | 1. 让成本可见 | 1-让成本可见
2. Use Semantic Compression | 2. 使用语义压缩 | 2-使用语义压缩
3. Group by Context | 3. 按上下文分组 | 3-按上下文分组
4. Provide Retrieval Tools | 4. 提供检索工具 | 4-提供检索工具
Real-World Example | 实战示例 | 实战示例
Scenario: Agent asked to fix a bug in hooks | 场景：让智能体修复 hooks 里的 bug | 场景让智能体修复-hooks-里的-bug
The Index Entry | 索引条目 | 索引条目
The Layered Workflow | 分层工作流 | 分层工作流
Layer 1: Search (Index) | 第 1 层：search（索引） | 第-1-层search索引
Layer 2: Timeline (Context) | 第 2 层：timeline（上下文） | 第-2-层timeline上下文
Layer 3: Get Observations (Details) | 第 3 层：get_observations（详情） | 第-3-层get_observations详情
Layer 4: Get Tool Uses (Raw Evidence) | 第 4 层：get_tool_uses（原始证据） | 第-4-层get_tool_uses原始证据
Cognitive Load Theory | 认知负荷理论 | 认知负荷理论
Intrinsic Load | 内在负荷 | 内在负荷
Extraneous Load | 外在负荷 | 外在负荷
Germane Load | 相关负荷 | 相关负荷
Anti-Patterns to Avoid | 应避免的反模式 | 应避免的反模式
❌ Verbose Titles | ❌ 冗长的标题 | ❌-冗长的标题
❌ Hiding Costs | ❌ 隐藏成本 | ❌-隐藏成本
❌ No Retrieval Path | ❌ 没有检索路径 | ❌-没有检索路径
❌ Skipping the Index Layer | ❌ 跳过索引层 | ❌-跳过索引层
Key Design Decisions | 关键设计决策 | 关键设计决策
Why Token Counts? | 为什么用 token 计数？ | 为什么用-token-计数
Why Icons Instead of Text Labels? | 为什么用图标而非文字标签？ | 为什么用图标而非文字标签
Why Index-First, Not Smart Pre-Fetch? | 为什么索引优先，而非智能预取？ | 为什么索引优先而非智能预取
Why Group by File Path? | 为什么按文件路径分组？ | 为什么按文件路径分组
Measuring Success | 成效衡量 | 成效衡量
✅ Low Waste Ratio | ✅ 低浪费比 | ✅-低浪费比
✅ Selective Fetching | ✅ 按需选取 | ✅-按需选取
✅ Fast Task Completion | ✅ 任务完成更快 | ✅-任务完成更快
✅ Appropriate Depth | ✅ 深度适中 | ✅-深度适中
Future Enhancements | 未来增强 | 未来增强
Adaptive Index Size | 自适应索引大小 | 自适应索引大小
Relevance Scoring | 相关性评分 | 相关性评分
Cost Forecasting | 成本预估 | 成本预估
Progressive Detail Levels | 渐进式细节层级 | 渐进式细节层级
Key Takeaways | 核心要点 | 核心要点
Remember | 谨记 | 谨记
Further Reading | 延伸阅读 | 延伸阅读

## 跨页锚点

无

（注：延伸阅读小节有两条跨页链接 `context-engineering` 与 `architecture/overview`，均为不带 `#锚点` 的纯路径链接，故按规则登记为「无」。）