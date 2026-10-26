AWS ElastiCache IAM Authentication | AWS ElastiCache IAM 身份验证 | aws-elasticache-iam-身份验证
Why use it | 为什么使用 | 为什么使用
Requirements | 前提条件 | 前提条件
Walkthrough | 操作演练 | 操作演练
1. Create an ElastiCache user in IAM mode | 1. 在 IAM 模式下创建 ElastiCache 用户 | 1-在-iam-模式下创建-elasticache-用户
2. Put the user in a user group and attach it to the cache | 2. 将用户加入用户组并挂到缓存上 | 2-将用户加入用户组并挂到缓存上
3. Grant `elasticache:Connect` to the role the proxy runs as | 3. 向代理运行角色授予 `elasticache:Connect` 权限 | 3-向代理运行角色授予-elasticacheconnect-权限
4. Point LiteLLM at the cache | 4. 将 LiteLLM 指向缓存 | 4-将-litellm-指向缓存
5. Roll it out and verify | 5. 上线并验证 | 5-上线并验证
Settings | 配置项 | 配置项
Notes | 注意事项 | 注意事项
Troubleshooting | 故障排查 | 故障排查
See also | 另请参阅 | 另请参阅
