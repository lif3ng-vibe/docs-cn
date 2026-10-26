Shared Health Check State Across Pods | 跨 Pod 共享健康检查状态 | 跨-pod-共享健康检查状态
Overview | 概述 | 概述
How It Works | 工作原理 | 工作原理
1. Lock Acquisition | 1. 获取锁 | 1-获取锁
2. Result Caching | 2. 缓存结果 | 2-缓存结果
3. Fallback Behavior | 3. 回退行为 | 3-回退行为
Configuration | 配置 | 配置
Enable Shared Health Check | 启用共享健康检查 | 启用共享健康检查
Environment Variables | 环境变量 | 环境变量
Requirements | 前提条件 | 前提条件
API Endpoints | API 端点 | api-端点
Check Shared Health Check Status | 查询共享健康检查状态 | 查询共享健康检查状态
Monitoring | 监控 | 监控
Health Check Status | 健康检查状态 | 健康检查状态
Logs | 日志 | 日志
Troubleshooting | 故障排查 | 故障排查
Common Issues | 常见问题 | 常见问题
1. Shared Health Check Not Working | 1. 共享健康检查未生效 | 1-共享健康检查未生效
2. Redis Connection Issues | 2. Redis 连接问题 | 2-redis-连接问题
3. Lock Not Released | 3. 锁未释放 | 3-锁未释放
Debug Mode | 调试模式 | 调试模式
Performance Impact | 性能影响 | 性能影响
Benefits | 收益 | 收益
Overhead | 开销 | 开销
Best Practices | 最佳实践 | 最佳实践
1. Redis Configuration | 1. Redis 配置 | 1-redis-配置
2. TTL Settings | 2. TTL 设置 | 2-ttl-设置
3. Monitoring | 3. 监控 | 3-监控
4. Scaling | 4. 扩展 | 4-扩展
Example Configuration | 配置示例 | 配置示例
Complete Example | 完整示例 | 完整示例
Kubernetes Example | Kubernetes 示例 | kubernetes-示例
Migration | 迁移 | 迁移
From Independent Health Checks | 从独立健康检查迁移 | 从独立健康检查迁移
Rollback | 回滚 | 回滚
Related Features | 相关功能 | 相关功能
