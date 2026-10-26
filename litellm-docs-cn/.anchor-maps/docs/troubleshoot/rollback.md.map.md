Safe Rollback Guide | 安全回滚指南 | 安全回滚指南
1. Determine Rollback Scope | 1. 确定回滚范围 | 1-确定回滚范围
2. Back Up the Database | 2. 备份数据库 | 2-备份数据库
3. Pre-Rollback Checks | 3. 回滚前检查 | 3-回滚前检查
4. Revert Application Version | 4. 回退应用版本 | 4-回退应用版本
Docker | Docker | docker
Helm | Helm | helm
5. Handle Database Migrations | 5. 处理数据库迁移 | 5-处理数据库迁移
Option A: Delete stale migration entries (recommended) | 方案 A：删除过期迁移记录（推荐） | 方案-a删除过期迁移记录推荐
Option B: Use `prisma migrate resolve` (if you have CLI access) | 方案 B：使用 `prisma migrate resolve`（需要有 CLI 权限） | 方案-b使用-prisma-migrate-resolve需要有-cli-权限
Auto-Recovery Logic | 自动恢复逻辑 | 自动恢复逻辑
6. Verification Checklist | 6. 验证清单 | 6-验证清单
7. Troubleshooting | 7. 故障排查 | 7-故障排查
"New migrations cannot be applied" | "New migrations cannot be applied" | new-migrations-cannot-be-applied
"relation X does not exist" | "relation X does not exist" | relation-x-does-not-exist
