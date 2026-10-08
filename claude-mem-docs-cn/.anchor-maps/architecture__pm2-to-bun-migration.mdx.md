# 锚点映射：architecture/pm2-to-bun-migration.mdx

原英文标题 | 中文标题 | 新锚点

PM2 to Bun Migration: Complete Technical Documentation | PM2 到 Bun 迁移：完整技术文档 | pm2-到-bun-迁移完整技术文档
Executive Summary | 执行摘要 | 执行摘要
Key Benefits | 主要收益 | 主要收益
Migration Impact | 迁移影响 | 迁移影响
Architecture Comparison | 架构对比 | 架构对比
Old System (PM2-based) | 旧系统（基于 PM2） | 旧系统基于-pm2
New System (Bun-based) | 新系统（基于 Bun） | 新系统基于-bun
Migration Mechanics | 迁移机制 | 迁移机制
One-Time PM2 Cleanup | 一次性 PM2 清理 | 一次性-pm2-清理
Migration Trigger Points | 迁移触发点 | 迁移触发点
Marker File | 标记文件 | 标记文件
User Experience Timeline | 用户体验时间线 | 用户体验时间线
First Session After Update | 更新后的第一个会话 | 更新后的第一个会话
Subsequent Sessions | 后续会话 | 后续会话
Platform-Specific Behavior | 各平台行为差异 | 各平台行为差异
Platform Comparison | 平台对比 | 平台对比
Platform Notes | 平台说明 | 平台说明
Observable Changes | 可观测的变化 | 可观测的变化
Command Changes | 命令变化 | 命令变化
File Location Changes | 文件路径变化 | 文件路径变化
User-Visible Changes | 用户可见的变化 | 用户可见的变化
Orphaned Files | 残留文件 | 残留文件
File System State | 文件系统状态 | 文件系统状态
State Directory Structure | 状态目录结构 | 状态目录结构
Edge Cases and Troubleshooting | 边界情况与故障排查 | 边界情况与故障排查
Scenario 1: Migration Fails (PM2 Still Running) | 场景 1：迁移失败（PM2 仍在运行） | 场景-1迁移失败pm2-仍在运行
Scenario 2: Stale PID File (Process Dead) | 场景 2：PID 文件过期（进程已终止） | 场景-2pid-文件过期进程已终止
Scenario 3: Port Already in Use | 场景 3：端口被占用 | 场景-3端口被占用
Common Error Messages | 常见报错 | 常见报错
Developer Notes | 开发者说明 | 开发者说明
Testing the Migration | 测试迁移 | 测试迁移
Architecture Decisions | 架构决策 | 架构决策
Summary | 总结 | 总结

## 跨页锚点

无