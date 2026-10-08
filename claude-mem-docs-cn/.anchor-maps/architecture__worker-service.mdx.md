# architecture/worker-service.mdx 锚点映射

# Worker Service | worker 服务 | worker-服务
## Overview | 概览 | 概览
## REST API Endpoints | REST API 端点 | rest-api-端点
### Viewer & Health Endpoints | 查看器与健康端点 | 查看器与健康端点
### Data Retrieval Endpoints | 数据检索端点 | 数据检索端点
### Settings Endpoints | 设置端点 | 设置端点
### Queue Management Endpoints | 队列管理端点 | 队列管理端点
### Session Management Endpoints | 会话管理端点 | 会话管理端点
## Bun Process Management | Bun 进程管理 | bun-进程管理
### Overview | 概览 | 概览-1
### Commands | 命令 | 命令
### Auto-Start Behavior | 自动启动行为 | 自动启动行为
### Bun Requirement | Bun 依赖要求 | bun-依赖要求
## Claude Agent SDK Integration | Claude Agent SDK 集成 | claude-agent-sdk-集成
### Processing Flow | 处理流程 | 处理流程
### SDK Components | SDK 组件 | sdk-组件
### Model Configuration | 模型配置 | 模型配置
## Port Allocation | 端口分配 | 端口分配
## Data Storage | 数据存储 | 数据存储
## Error Handling | 错误处理 | 错误处理
## Performance | 性能 | 性能
## Troubleshooting | 故障排查 | 故障排查

## h4（端点小节，供参考）
#### 1. Viewer UI | 1. 查看器 UI | 1-查看器-ui
#### 2. Health Check | 2. 健康检查 | 2-健康检查
#### 3. Server-Sent Events Stream | 3. SSE 实时事件流 | 3-sse-实时事件流
#### 4. Get Prompts | 4. 获取提示词 | 4-获取提示词
#### 5. Get Observations | 5. 获取观察记录 | 5-获取观察记录
#### 6. Get Summaries | 6. 获取摘要 | 6-获取摘要
#### 7. Get Observation by ID | 7. 按 ID 获取观察记录 | 7-按-id-获取观察记录
#### 8. Get Observations by IDs (Batch) | 8. 批量获取观察记录 | 8-批量获取观察记录
#### 9. Get Session by ID | 9. 按 ID 获取会话 | 9-按-id-获取会话
#### 10. Get Prompt by ID | 10. 按 ID 获取提示词 | 10-按-id-获取提示词
#### 12. Get Stats | 12. 获取统计信息 | 12-获取统计信息
#### 13. Get Projects | 13. 获取项目列表 | 13-获取项目列表
#### 14. Get Settings | 14. 获取设置 | 14-获取设置
#### 15. Save Settings | 15. 保存设置 | 15-保存设置
#### 16. Get Pending Queue Status | 16. 获取待处理队列状态 | 16-获取待处理队列状态
#### 17. Trigger Manual Recovery | 17. 触发手动恢复 | 17-触发手动恢复
#### 19. Initialize Session | 19. 初始化会话 | 19-初始化会话
#### 20. Add Observation | 20. 添加观察记录 | 20-添加观察记录
#### 21. Generate Summary | 21. 生成摘要 | 21-生成摘要
#### 22. Session Status | 22. 会话状态 | 22-会话状态
#### 23. Delete Session | 23. 删除会话 | 23-删除会话

## 跨页锚点
- ../troubleshooting.md#worker-service-issues