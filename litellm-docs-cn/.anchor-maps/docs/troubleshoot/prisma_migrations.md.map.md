原英文标题 | 中文标题 | 新锚点
Troubleshooting Prisma Migration Errors | Prisma 迁移错误排查 | prisma-迁移错误排查
How Prisma Migrations Work in LiteLLM | LiteLLM 中 Prisma 迁移的工作原理 | litellm-中-prisma-迁移的工作原理
Common Errors | 常见错误 | 常见错误
1. `relation "X" does not exist` | 1. `relation "X" does not exist` | 1-relation-x-does-not-exist
Step 1: Delete the failed migration entry and restart | 第 1 步：删除失败的迁移记录并重启 | 第-1-步删除失败的迁移记录并重启
Step 2: If that doesn't work, use `prisma db push` | 第 2 步：如果仍然不行，改用 `prisma db push` | 第-2-步如果仍然不行改用-prisma-db-push
2. `New migrations cannot be applied before the error is recovered from` | 2. `New migrations cannot be applied before the error is recovered from` | 2-new-migrations-cannot-be-applied-before-the-error-is-recovered-from
3. Migration state mismatch after version rollback | 3. 版本回退后的迁移状态不一致 | 3-版本回退后的迁移状态不一致
4. `PermissionError` while resolving the query engine | 4. 解析查询引擎时出现 `PermissionError` | 4-解析查询引擎时出现-permissionerror
5. Upgrade to v1.99.0 or later stalls on `20260818000000_add_spend_log_timestamps` (PostgreSQL 10) | 5. 升级到 v1.99.0 及以上版本时卡在 `20260818000000_add_spend_log_timestamps`（PostgreSQL 10） | 5-升级到-v1990-及以上版本时卡在-20260818000000_add_spend_log_timestampspostgresql-10
