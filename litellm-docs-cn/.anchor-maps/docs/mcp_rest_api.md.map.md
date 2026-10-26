MCP REST API | MCP REST API | mcp-rest-api
Endpoints | 端点 | 端点
Tool naming | 工具命名 | 工具命名
1. List MCP servers | 1. 列出 MCP 服务器 | 1-列出-mcp-服务器
2. List tools | 2. 列出工具 | 2-列出工具
All servers | 所有服务器 | 所有服务器
One server (recommended for discovery) | 单个服务器（推荐用于发现工具） | 单个服务器推荐用于发现工具
3. Call a tool | 3. 调用工具 | 3-调用工具
Request body | 请求体 | 请求体
Works: prefixed name + server UUID | 可用：带前缀名称与服务器 UUID | 可用带前缀名称与服务器-uuid
Works: unprefixed name + server name | 可用：不带前缀名称与服务器名称 | 可用不带前缀名称与服务器名称
Works: `x-litellm-api-key` header | 可用：`x-litellm-api-key` 请求头 | 可用x-litellm-api-key-请求头
What does **not** work | 以下写法**不**可用 | 以下写法不可用
Missing `server_id` | 缺少 `server_id` | 缺少-server_id
`arguments: null` | `arguments: null` | arguments-null
Wrong separator in tool name (underscore instead of hyphen) | 工具名分隔符用错（下划线代替连字符） | 工具名分隔符用错下划线代替连字符
Tool belongs to a different server than `server_id` | 工具不属于 `server_id` 指定的服务器 | 工具不属于-server_id-指定的服务器
Invalid or unknown `server_id` | `server_id` 无效或不存在 | server_id-无效或不存在
Placeholder server ids from customer examples | 客户示例中的占位符 ID | 客户示例中的占位符-id
Quick reference | 快速参考 | 快速参考
Related docs | 相关文档 | 相关文档
