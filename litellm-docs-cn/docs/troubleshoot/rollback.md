# 安全回滚指南

本指南介绍如何将 LiteLLM 代理服务器（Proxy）的部署安全地回滚到之前的版本。

我们建议回滚到上一个[稳定版本（stable release）](https://github.com/BerriAI/litellm/releases)。稳定版本每周发布一次，遵循 `vX.Y.Z` 标签命名规范（例如 `v1.89.4`）。

## 1. 确定回滚范围

动手之前，先弄清楚这次回滚的原因：
- **应用逻辑错误**：回退代码变更，但保留数据库 schema。
- **数据库迁移失败**：回退包含数据库 schema 更新的那批变更。
- **性能回归**：回退到某个已知的稳定版本。

## 2. 备份数据库

> **回滚前务必先备份**。做任何改动之前，先给数据库做一次快照或导出备份。万一回滚过程中出了岔子，它就是你的安全网。

```bash
# PostgreSQL example
pg_dump -h <host> -U <user> -d <database> -F c -f litellm_backup_$(date +%Y%m%d_%H%M%S).dump
```

如果你用的是托管数据库（例如 AWS RDS、GCP Cloud SQL），请改在云控制台上创建快照。

## 3. 回滚前检查

回退之前，先核对以下几项：

- **`LITELLM_SALT_KEY`**：回滚期间**不要**改动这个值。它用于加解密数据库中存储的 LLM API 密钥凭据，一旦改动，现有凭据将无法读取。参见[生产环境最佳实践](../proxy/prod#设置-salt-key)。
- **`config.yaml`**：如果你为新版添加过专属配置项，旧版本可能无法识别。请检查配置，删除或注释掉由你正在回退的那个版本引入的配置项。
- **`DISABLE_SCHEMA_UPDATE`**：如果你在 Pod 上使用了[Helm 迁移 PreSync 钩子](../proxy/prod#通过-helm-presync-钩子执行迁移)并设置了 `DISABLE_SCHEMA_UPDATE=true`，重启时迁移**不会**自动执行。你需要手动处理迁移清理（见第 5 步），或者基于旧版本的 chart 重新运行 PreSync 钩子。

## 4. 回退应用版本

将你的部署回退到上一个稳定版本的 Docker 镜像或 Helm chart。

### Docker
更新部署清单（例如 K8s Deployment、Docker Compose），改用上一个版本：
```yaml
# Example: Reverting to the previous stable release
image: docker.litellm.ai/berriai/litellm:v<VERSION>
```

查看[全部可用镜像](https://github.com/orgs/BerriAI/packages)。

### Helm
如果你是通过 Helm 部署的，使用 `helm rollback`：
```bash
helm rollback <release-name> [revision-number]
```

## 5. 处理数据库迁移

如果你要回滚到的版本不包含某个特定迁移，可能需要处理数据库中残留的迁移状态。

> LiteLLM 在生产环境默认使用 `prisma migrate deploy`。如果某个迁移执行到一半失败，或者你回退的代码依赖更旧的 schema，就需要清理 `_prisma_migrations` 表中的迁移历史。参见[生产环境最佳实践](../proxy/prod#使用-prisma-migrate-deploy)。

### 方案 A：删除过期迁移记录（推荐）

连接到你的 PostgreSQL 数据库，删除属于你正在回退的那个版本的迁移记录。这样以后再次升级时，LiteLLM 可以干净地重新应用这些迁移。

```sql
-- View recent migrations
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 10;

-- Delete migration entries from the version you are rolling back from
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<migration_name_from_newer_version>';
```

删除这些记录后重启 LiteLLM，它会在启动时重新应用与其版本匹配的正确迁移。

> **注意**：如果你的 Pod 上设置了 `DISABLE_SCHEMA_UPDATE=true`，迁移不会自动执行。你需要临时把它改为 `false`，或者针对旧版本重新运行 Helm PreSync 迁移任务。

### 方案 B：使用 `prisma migrate resolve`（需要有 CLI 权限）

如果你能使用 Prisma CLI（例如在本地开发环境，或安装了 `litellm-proxy-extras` 包的调试容器中）：

```bash
DATABASE_URL="<your_database_url>" prisma migrate resolve --rolled-back "<migration_name>"
```

> **注意**：这要求你的环境中装有 Prisma CLI（通过 `prisma-client-py` 安装）。如果没有 CLI 权限（例如无法进入运行中的容器执行 shell），请改用**方案 A**（直接执行 SQL）。

### 自动恢复逻辑
LiteLLM 内部的 `ProxyExtrasDBManager` 会自动尝试处理幂等迁移。很多情况下，只要数据库变更是增量式的（例如新增列或新增表），回退版本并重启代理就足够了。

## 6. 验证清单

回滚完成后，逐项确认系统健康状况：

- [ ] **健康端点**：确认 `/health` 端点返回 `200 OK`。
- [ ] **检查日志**：确认没有出现 Prisma 报错。在日志中留意 `relation "..." does not exist`、`column "..." does not exist` 或 `prisma migrate` 失败的迹象。
- [ ] **花费追踪**（spend tracking）：跑一次测试补全，确认花费已记录到 `LiteLLM_SpendLogs` 表。
- [ ] **计费**（Lago）：如果你使用 Lago 计费（例如 Lago → Stripe），检查代理日志中是否出现 `Logged Lago Object`，确认用量事件已在发送。
- [ ] **状态一致性**：如果你使用 Redis 做缓存或限流，且新版本改动了缓存键结构，考虑清一次缓存。
- [ ] **管理界面**（Admin UI）：确认 Admin UI 能正常加载，密钥与团队数据展示正确。

## 7. 故障排查

### "New migrations cannot be applied"
回滚后看到这个报错，说明数据库中存在处于 "failed" 状态的迁移。
1. 找到失败的迁移名称（参见第 5 步中的 SQL 查询）。
2. 从 `_prisma_migrations` 中删除这条失败的记录。
3. 重启代理。

### "relation X does not exist"
这通常说明 `_prisma_migrations` 里存在迁移记录，但对应的表或列从未创建，或者已被删除。
1. 删除过期的迁移记录。
2. 重启 LiteLLM，让它重新执行迁移。

更多 Prisma 报错的排查细节，参见 [Prisma 迁移故障排查](prisma_migrations)。
