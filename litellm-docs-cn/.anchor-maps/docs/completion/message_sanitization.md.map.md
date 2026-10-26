# anchor map: docs/completion/message_sanitization.md
Tool Call Message Sanitization for Anthropic Models | 面向 Anthropic 模型的工具调用消息清洗 | 面向-anthropic-模型的工具调用消息清洗
Overview | 概览 | 概览
Why Message Sanitization? | 为什么需要消息清洗？ | 为什么需要消息清洗
Quick Start | 快速上手 | 快速上手
Sanitization Scenarios | 清洗场景 | 清洗场景
Scenario A: Orphaned Tool Calls (Missing Tool Results) | 场景 A：孤立工具调用（缺少工具结果） | 场景-a孤立工具调用缺少工具结果
Scenario B: Orphaned Tool Results (Invalid tool_call_id) | 场景 B：孤立工具结果（tool_call_id 无效） | 场景-b孤立工具结果tool_call_id-无效
Scenario C: Empty Message Content | 场景 C：空消息内容 | 场景-c空消息内容
Configuration | 配置 | 配置
Enable Globally | 全局启用 | 全局启用
Per-Request Override Not Supported | 不支持按请求覆盖 | 不支持按请求覆盖
Supported Providers | 支持的提供商 | 支持的提供商
Implementation Details | 实现细节 | 实现细节
How It Works | 工作原理 | 工作原理
Code Location | 代码位置 | 代码位置
Logging | 日志 | 日志
Best Practices | 最佳实践 | 最佳实践
1. Enable in Production Workflows | 1. 在生产工作流中启用 | 1-在生产工作流中启用
2. Prefer Real Tool Results | 2. 尽量保留真实的工具结果 | 2-尽量保留真实的工具结果
3. Monitor Sanitization Events | 3. 监控清洗事件 | 3-监控清洗事件
4. Test Edge Cases | 4. 测试边界情况 | 4-测试边界情况
Related Features | 相关功能 | 相关功能
Troubleshooting | 故障排查 | 故障排查
Sanitization Not Working | 清洗未生效 | 清洗未生效
Unexpected Dummy Tool Results | 出现意外的占位工具结果 | 出现意外的占位工具结果
Performance Impact | 性能影响 | 性能影响
Frequently Asked Questions | 常见问题 | 常见问题
Further Reading | 延伸阅读 | 延伸阅读
