MCP Permission Management | MCP 权限管理 | mcp-权限管理
Overview | 概览 | 概览
How It Works | 工作原理 | 工作原理
Permission Hierarchy | 权限层级 | 权限层级
Require keys to define their own MCP access | 要求密钥自行定义 MCP 访问权限 | 要求密钥自行定义-mcp-访问权限
Opting a key out of all MCP servers (`no-mcp-servers`) | 将密钥排除在所有 MCP 服务器之外（`no-mcp-servers`） | 将密钥排除在所有-mcp-服务器之外no-mcp-servers
Allow/Disallow MCP Tools | 允许/禁止 MCP 工具 | 允许禁止-mcp-工具
Important Notes | 重要说明 | 重要说明
Pin a Server's Tool List | 固定服务器的工具列表 | 固定服务器的工具列表
Important Notes | 重要说明 | 重要说明
Public MCP Servers (allow_all_keys) | 公共 MCP 服务器（allow_all_keys） | 公共-mcp-服务器allow_all_keys
When to use it | 何时使用 | 何时使用
Allow/Disallow MCP Tool Parameters | 允许/禁止 MCP 工具参数 | 允许禁止-mcp-工具参数
Configuration | 配置 | 配置
How It Works | 工作原理 | 工作原理
Example Request Behavior | 请求行为示例 | 请求行为示例
Use Cases | 使用场景 | 使用场景
Combining with Tool Filtering | 与工具过滤结合使用 | 与工具过滤结合使用
MCP Server Access Control | MCP 服务器访问控制 | mcp-服务器访问控制
Method 1: URL-based Namespacing | 方法 1：基于 URL 的命名空间 | 方法-1基于-url-的命名空间
URL Format | URL 格式 | url-格式
Usage Examples | 使用示例 | 使用示例
#### Benefits of URL Namespacing | URL 命名空间的优势 | url-命名空间的优势
### Method 2: Header-based Namespacing | 方式 2：基于请求头的命名空间 | 方式-2基于请求头的命名空间
### Comparison: Header vs URL Namespacing | 对比：请求头 vs URL 命名空间 | 对比-请求头-vs-url-命名空间
### Grouping MCPs (Access Groups) | MCP 分组（访问组） | mcp-分组访问组
#### 1. Create an Access Group | 1. 创建访问组 | 1-创建访问组
##### A. Creating Access Groups using Config: | A. 通过配置文件创建访问组 | a-通过配置文件创建访问组
##### B. Creating Access Groups using UI | B. 通过 UI 创建访问组 | b-通过-ui-创建访问组
#### 2. Use Access Group in Cursor | 2. 在 Cursor 中使用访问组 | 2-在-cursor-中使用访问组
#### Advanced: Connecting Access Groups to API Keys | 进阶：将访问组关联到 API 密钥 | 进阶将访问组关联到-api-密钥
## Per-entity Tool-Level Permissions {#per-entity-tool-level-permissions} | 按实体划分的工具级权限 {#per-entity-tool-level-permissions} | per-entity-tool-level-permissions
### `mcp_tool_permissions` API | `mcp_tool_permissions` API | mcp_tool_permissions-api
### Entitling a person rather than a credential {#per-user-tool-permissions} | 授权给人，而非授权给凭证 {#per-user-tool-permissions} | per-user-tool-permissions
## Rate Limiting per MCP Server | MCP 服务器级速率限制 | mcp-服务器级速率限制
### Global limit on an MCP server | MCP 服务器上的全局限额 | mcp-服务器上的全局限额
## Dashboard View Modes | 仪表板视图模式 | 仪表板视图模式
## Publish MCP Registry | 发布 MCP 注册表 | 发布-mcp-注册表
