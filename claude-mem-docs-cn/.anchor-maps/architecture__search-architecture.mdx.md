# 锚点映射：architecture/search-architecture.mdx

Search Architecture | 检索架构 | 检索架构
Overview | 概览 | 概览
How It Works | 工作原理 | 工作原理
1. User Query | 1. 用户查询 | 1-用户查询
2. MCP Protocol | 2. MCP 协议 | 2-mcp-协议
3. HTTP API Call | 3. HTTP API 调用 | 3-http-api-调用
4. Worker Processing | 4. worker 处理 | 4-worker-处理
5. Results Returned | 5. 返回结果 | 5-返回结果
6. Claude Processes Results | 6. Claude 处理结果 | 6-claude-处理结果
The 4 MCP Tools | 4 个 MCP 工具 | 4-个-mcp-工具
`important_workflow` - Workflow Documentation | `important_workflow`——工作流说明 | important_workflow工作流说明
`search` - Search Memory Index | `search`——检索记忆索引 | search检索记忆索引
`timeline` - Get Chronological Context | `timeline`——获取时序上下文 | timeline获取时序上下文
`get_observations` - Fetch Full Details | `get_observations`——获取完整详情 | get_observations获取完整详情
MCP Server Implementation | MCP 服务端实现 | mcp-服务端实现
Worker HTTP API | worker HTTP API | worker-http-api
The 3-Layer Workflow Pattern | 三层工作流模式 | 三层工作流模式
Design Philosophy | 设计理念 | 设计理念
Token Efficiency | Token 效率 | token-效率
Architecture Evolution | 架构演进 | 架构演进
Before: Complex MCP Implementation | 此前：复杂的 MCP 实现 | 此前复杂的-mcp-实现
After: Streamlined MCP Implementation | 此后：精简的 MCP 实现 | 此后精简的-mcp-实现
Key Insight | 关键洞察 | 关键洞察
Configuration | 配置 | 配置
Claude Desktop | Claude Desktop | claude-desktop
Claude Code | Claude Code | claude-code
Security | 安全 | 安全
FTS5 Injection Prevention | FTS5 注入防护 | fts5-注入防护
MCP Protocol Security | MCP 协议安全性 | mcp-协议安全性
Performance | 性能 | 性能
Benefits Over Alternative Approaches | 相较于其他方案的优势 | 相较于其他方案的优势
vs. Traditional RAG | 对比传统 RAG | 对比传统-rag
vs. Previous MCP Implementation (v5.x) | 对比此前的 MCP 实现（v5.x） | 对比此前的-mcp-实现-v5x
vs. Skill-Based Approach (Previously) | 对比此前的 Skill 方案 | 对比此前的-skill-方案
Troubleshooting | 故障排查 | 故障排查
MCP Server Not Connected | MCP 服务端未连接 | mcp-服务端未连接
Worker Service Not Running | worker 服务未运行 | worker-服务未运行
Empty Search Results | 搜索结果为空 | 搜索结果为空
Next Steps | 延伸阅读 | 延伸阅读

## 跨页锚点

- /usage/search-tools
- /progressive-disclosure
- /architecture/worker-service
- /architecture/database