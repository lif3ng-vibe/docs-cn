# platform-integration.mdx 锚点映射

原英文标题 | 中文标题 | 新锚点

## Quick Reference | 快速参考 | 快速参考

### Worker Service Basics | worker 服务基础 | worker-服务基础

### Most Common Operations | 最常用操作 | 最常用操作

### Environment Variables | 环境变量 | 环境变量

### Build Commands (Local Development) | 构建命令（本地开发） | 构建命令本地开发

## Supported Harnesses | 支持的平台 | 支持的平台

## Worker Architecture | worker 架构 | worker-架构

### Request Flow | 请求流程 | 请求流程

### Domain Services | 领域服务 | 领域服务

### Route Organization | 路由组织 | 路由组织

## API Reference | API 参考 | api-参考

### Session Lifecycle (SessionRoutes) | 会话生命周期（SessionRoutes） | 会话生命周期sessionroutes

#### Create/Get Session + Queue Observation (New API) | 创建/获取会话并入队观察记录（新 API） | 创建获取会话并入队观察记录新-api

#### Queue Summary (New API) | 入队会话摘要（新 API） | 入队会话摘要新-api

#### Complete Session (New API) | 完成会话（新 API） | 完成会话新-api

#### Legacy Endpoints (Still Supported) | 旧版端点（仍受支持） | 旧版端点仍受支持

### Data Retrieval (DataRoutes) | 数据检索（DataRoutes） | 数据检索dataroutes

#### Get Paginated Data | 获取分页数据 | 获取分页数据

#### Get by ID | 按 ID 获取 | 按-id-获取

#### Get Database Stats | 获取数据库统计 | 获取数据库统计

#### Get Projects List | 获取项目列表 | 获取项目列表

#### Get Processing Status | 获取处理状态 | 获取处理状态

### Search Operations (SearchRoutes) | 检索操作（SearchRoutes） | 检索操作searchroutes

#### Unified Search | 统一检索 | 统一检索

#### Unified Timeline | 统一时间线 | 统一时间线

#### Search by File Path | 按文件路径检索 | 按文件路径检索

#### Get Recent Context | 获取最近上下文 | 获取最近上下文

#### Context Preview (for Settings UI) | 上下文预览（供设置界面使用） | 上下文预览供设置界面使用

#### Context Injection (for Hooks) | 上下文注入（供 Hook 使用） | 上下文注入供-hook-使用

### Settings & Configuration (SettingsRoutes) | 设置与配置（SettingsRoutes） | 设置与配置settingsroutes

#### Get/Update User Settings | 获取/更新用户设置 | 获取更新用户设置

#### MCP Server Status/Toggle | MCP 服务器状态/开关 | mcp-服务器状态开关

### Viewer & Real-Time Updates (ViewerRoutes) | 查看器与实时更新（ViewerRoutes） | 查看器与实时更新viewerroutes

#### Health Check | 健康检查 | 健康检查

#### Viewer UI | 查看器 UI | 查看器-ui

#### SSE Stream | SSE 流 | sse-流

## Data Models | 数据模型 | 数据模型

### Active Session (In-Memory) | 活动会话（内存中） | 活动会话内存中

### Database Entities | 数据库实体 | 数据库实体

### Search Results | 检索结果 | 检索结果

### Timeline Item | 时间线条目 | 时间线条目

## Integration Patterns | 集成模式 | 集成模式

### Mapping Claude Code Hooks to Worker API | 将 Claude Code Hook 映射到 worker API | 将-claude-code-hook-映射到-worker-api

### VSCode Extension Integration | VSCode 扩展集成 | vscode-扩展集成

#### Language Model Tool Registration | 语言模型工具注册 | 语言模型工具注册

#### Chat Participant Implementation | Chat Participant 实现 | chat-participant-实现

## Error Handling & Resilience | 错误处理与容错 | 错误处理与容错

### Connection Failures | 连接失败 | 连接失败

### Retry Logic with Exponential Backoff | 指数退避重试 | 指数退避重试

### Worker Health Check | worker 健康检查 | worker-健康检查

### Privacy Tag Handling | 隐私标签处理 | 隐私标签处理

### Custom Error Classes | 自定义错误类 | 自定义错误类

### SSE Stream Error Handling | SSE 流错误处理 | sse-流错误处理

## Development Workflow | 开发工作流 | 开发工作流

### Project Structure (Recommended) | 项目结构（推荐） | 项目结构推荐

### Build Configuration (esbuild) | 构建配置（esbuild） | 构建配置esbuild

### package.json (VSCode Extension) | package.json（VSCode 扩展） | packagejsonvscode-扩展

### Local Testing Loop | 本地测试循环 | 本地测试循环

### Debug Configuration (.vscode/launch.json) | 调试配置（.vscode/launch.json） | 调试配置vscode-launchjson

## Testing Strategy | 测试策略 | 测试策略

### Unit Tests (Worker Client) | 单元测试（Worker Client） | 单元测试worker-client

### Integration Tests (With Worker Spawning) | 集成测试（拉起 worker 进程） | 集成测试拉起-worker-进程

### Manual Testing Checklist | 手动测试清单 | 手动测试清单

## Code Examples | 代码示例 | 代码示例

### Complete WorkerClient Implementation | 完整的 WorkerClient 实现 | 完整的-workerclient-实现

### Search Language Model Tool | 检索语言模型工具 | 检索语言模型工具

## Critical Implementation Notes | 关键实现注意事项 | 关键实现注意事项

### sessionDbId vs claudeSessionId | sessionDbId 与 claudeSessionId 的区别 | sessiondbid-与-claudesessionid-的区别

### JSON String Fields | JSON 字符串字段 | json-字符串字段

### Timestamps | 时间戳 | 时间戳

### Asynchronous Processing | 异步处理 | 异步处理

### Privacy Tags | 隐私标签 | 隐私标签

## Additional Resources | 更多资源 | 更多资源

## 跨页锚点

无。

（另有不带 #锚点的跨页链接，路径原样保留：/architecture/worker-service、/architecture/database，以及 https://claude-mem.ai、https://github.com/thedotmack/claude-mem）