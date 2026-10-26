# Prisma 迁移错误排查

升级或降级 LiteLLM 代理版本时常见的 Prisma 迁移问题，以及可能在任何迁移执行之前就让代理启动失败的查询引擎解析故障，本文给出对应的修复方法。

关于如何安全回退 LiteLLM 版本的完整指南，参见 **[安全回退指南](rollback)**。

## LiteLLM 中 Prisma 迁移的工作原理

- LiteLLM 用 [Prisma](https://www.prisma.io/) 管理自己的 PostgreSQL 数据库表结构。
- 迁移历史记录在数据库的 `_prisma_migrations` 表中。
- LiteLLM 启动时会执行 `prisma migrate deploy` 来应用新增的迁移。
- 如果启动时数据库初始化失败（数据库不可达、连接重试次数耗尽，或 `prisma migrate deploy` 执行失败），代理会以非零状态码退出，而不是在旧表结构上继续提供服务。滚动更新场景下，新 Pod 会反复崩溃重启，旧 Pod 继续提供服务，迁移报错可以在新 Pod 的日志里找到。
- 设置了 `DATABASE_URL`，但 Prisma CLI 既不在 `PATH` 里也无法导入时，结果也一样：代理会带着红色报错退出，而不是在缺少数据库的情况下启动。可以用 `pip install 'litellm[extra_proxy]'` 装上它，或直接运行官方 LiteLLM 镜像（已捆绑该 CLI）。
- 升级 LiteLLM 时，会应用自上次已应用版本之后新增的全部迁移。

## 常见错误

### 1. `relation "X" does not exist`

**示例报错**：

```
ERROR: relation "LiteLLM_DeletedTeamTable" does not exist
Migration: 20260116142756_update_deleted_keys_teams_table_routing_settings
```

**原因**：通常发生在版本回退之后。`_prisma_migrations` 表仍把新版本的那些迁移记录为"已应用"，但底层的数据库表已被修改、删除，或从未完整创建过。

**修复方法**：

#### 第 1 步：删除失败的迁移记录并重启

把有问题的迁移从历史中移除，让它能被重新应用：

```sql
-- View recent migrations
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 10;

-- Delete the failed migration entry
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<failed_migration_name>';
```

删除该记录后重启 LiteLLM，它会在启动时重新应用这条迁移。

#### 第 2 步：如果仍然不行，改用 `prisma db push`

如果删除迁移记录并重启后问题仍未解决，就直接同步表结构：

> **警告**：如果 Prisma schema 会删除数据库中已有的列或表，`prisma db push` 可能导致**数据丢失**。请只在万不得已时使用，并确保先备份数据库。

```bash
DATABASE_URL="<your_database_url>" prisma db push
```

这一步会绕过迁移历史，强制数据库表结构与 Prisma schema 保持一致。

---

### 2. `New migrations cannot be applied before the error is recovered from`

**原因**：此前有一个迁移失败了（`_prisma_migrations` 里记录了报错），在这个失败被处理掉之前，Prisma 拒绝应用任何新迁移。

**修复方法**：

1. 找到失败的迁移：

```sql
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
ORDER BY started_at DESC;
```

2. 删除失败的记录并重启 LiteLLM：

```sql
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<failed_migration_name>';
```

3. 如果仍然不行，改用 `prisma db push`（参见[上文的警告](#第-2-步如果仍然不行改用-prisma-db-push)，并先备份数据库）：

```bash
DATABASE_URL="<your_database_url>" prisma db push
```

---

### 3. 版本回退后的迁移状态不一致

**原因**：先升级到版本 X（应用了新迁移），回退到版本 Y，然后再次升级。此时 `_prisma_migrations` 表里残留着过期条目：有些迁移只应用了一半，有些对应的表结构状态已不复存在。

**修复**：

1. 检查迁移表里有没有问题条目：

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 20;
```

2. 对每条不该存在的迁移（即来自你回退前那个版本的迁移），删除对应条目：
     ```sql
     DELETE FROM "_prisma_migrations" WHERE migration_name = '<migration_name>';
     ```

3. 重启 LiteLLM，让它重新执行迁移。

4. 如果仍然不行，改用 `prisma db push`（参见[上文的警告](#第-2-步如果仍然不行改用-prisma-db-push)，并先备份数据库）：

```bash
DATABASE_URL="<your_database_url>" prisma db push
```

---

### 4. 解析查询引擎时出现 `PermissionError`

**示例报错**：

```
PermissionError: [Errno 13] Permission denied:
'/usr/local/lib/python{{python_version}}/site-packages/prisma/binaries/prisma-query-engine-debian-openssl-3.0.x'
```

**原因**：Prisma 在和数据库通信之前，得先决定要运行哪个查询引擎二进制文件，做法是遍历生成客户端时 Prisma CLI 记录下来的各条引擎路径。生成的客户端带五条这样的路径（每个受支持平台一条），所以这个遍历总会发生。它用 `Path.exists()` 逐一测试候选路径：文件不存在时返回 `False`，但候选路径沿途有目录拒绝当前 uid 访问时，会把 `PermissionError` 重新抛出；它只吞掉 `ENOENT`、`ENOTDIR`、`EBADF` 和 `ELOOP`。因此，镜像如果用一个 uid 生成客户端、却用另一个 uid 运行，或者把客户端装在运行时 uid 无法穿过的位置，启动就会直接失败，而不是跳到下一个候选路径继续。Python 3.14 在这种情况下返回 `False`，不受影响；LiteLLM 支持的所有更旧解释器都会抛错。 {/* keep-python-version */}

**修复方法**：把 Prisma 指向一个运行时 uid 可读的引擎，两个变量要一起设置。只设置 `PRISMA_QUERY_ENGINE_BINARY` 解决不了问题，因为抛错的遍历发生在 Prisma 读取这个变量之前。`PRISMA_BINARY_PLATFORM` 才是能让遍历提前短路、在任何候选路径被测试之前就生效的变量，所以两者谁也替代不了谁：

```bash
export PRISMA_BINARY_PLATFORM=debian-openssl-3.0.x
export PRISMA_QUERY_ENGINE_BINARY=/opt/prisma/binaries/prisma-query-engine-debian-openssl-3.0.x
```

`PRISMA_BINARY_PLATFORM` 必须写客户端实际生成过的平台。Prisma 会直接在生成的路径里按名字查找，写一个没生成过的平台，只是把 `PermissionError` 换成 `KeyError` 而已。`PRISMA_QUERY_ENGINE_BINARY` 必须指向一个运行时 uid 既可读又可执行的引擎文件。两个变量都通过环境变量设置，不要在 import 时直接改 `BINARY_PATHS`：`PRISMA_BINARY_PLATFORM` 是 Prisma 显式声明的配置项，`PRISMA_QUERY_ENGINE_BINARY` 则直接从环境读取，两者都不依赖那些版本一升级就可能挪位置的 Prisma 内部实现。

官方镜像已经避开了这个问题：构建时把 Prisma CLI 和引擎固定放在所有用户可读的 `/opt/prisma`，任何 uid 都能解析到它们。`v1.95.0` 是第一个对两种镜像变体都做到这一点的稳定版本。标准镜像从 `v1.94.0` 起就已如此，但整个 `1.94.x` 系列的 `litellm-non_root` 都没有这个修复，所以在 `v1.94.1` 或更早版本上做非 root 部署，仍需要上面那两个变量。自定义镜像和直接 `pip install` 的部署不在两项修复的覆盖范围内，始终需要这两个变量。

镜像发布在 `ghcr.io/berriai`，同步副本在 `docker.litellm.ai/berriai`；`ghcr.io/berriai/litellm-non_root:v1.95.0` 是非 root 变体。

---

### 5. 升级到 v1.99.0 及以上版本时卡在 `20260818000000_add_spend_log_timestamps`（PostgreSQL 10）

**症状**：代理启动后卡在 `prisma migrate deploy`，不处理任何流量。视版本而定，要么被 Prisma 命令超时杀掉、重启后又进入同一个迁移，要么在长时间停顿后终于起来，这期间 `pg_stat_activity` 能看到 `ALTER TABLE "LiteLLM_SpendLogs"` 持有 `ACCESS EXCLUSIVE` 锁。在 PostgreSQL 11 及以上版本上，同样的迁移毫秒级就能完成。

**原因**：这条迁移会以 `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP` 给 `LiteLLM_SpendLogs` 加上 `created_at` 和 `updated_at` 两列。PostgreSQL 11 把默认值存成列元数据，不触碰任何行，所以这条语句在空表和存了多年日志的表上同样只要几毫秒。PostgreSQL 10 没有这条快速路径：它会把整张表重写进一个新文件，重建表上的每个索引，期间一直持有 `ACCESS EXCLUSIVE` 锁。对一张 100 万行、1 GB 的 `LiteLLM_SpendLogs`，这条语句在 PostgreSQL 10 上耗时约 10 秒，在 PostgreSQL 16 上不到 2 毫秒；耗时随表的大小增长，而且在事务提交之前，重写需要足够的空闲磁盘来容纳表和索引的第二份副本。LiteLLM 在启动时执行迁移，所以 Prisma 客户端被杀后重写会回滚，下一次重启又从零开始。

**修复方法**：升级之前，先找一个维护窗口自己把列加上。这条迁移用的是 `ADD COLUMN IF NOT EXISTS`，所以列一旦存在，它在启动时就变成空操作，升级照常进行。先检查重写需要多少磁盘：

```sql
SELECT pg_size_pretty(pg_total_relation_size('"LiteLLM_SpendLogs"'));
```

最直接的办法是停掉代理，手动执行迁移自身的那条语句。它做的是同样的重写，只是没有客户端超时，而且时机由你选：

```sql
ALTER TABLE "LiteLLM_SpendLogs"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

如果表太大、锁不了那么久，可以完全绕开重写。先加列但不带默认值，之后再设置默认值，这两种操作在所有 PostgreSQL 版本上都只改元数据，期间代理还能继续跑旧版本：

```sql
ALTER TABLE "LiteLLM_SpendLogs"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);

ALTER TABLE "LiteLLM_SpendLogs"
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
```

现在新行都会拿到默认值。接下来分批回填已有行，反复执行同一条语句直到它报告 `UPDATE 0`，这样任何单个事务都不会长时间持锁，也不会把表撑大：

```sql
UPDATE "LiteLLM_SpendLogs"
SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP
WHERE "request_id" IN (
    SELECT "request_id" FROM "LiteLLM_SpendLogs" WHERE "created_at" IS NULL LIMIT 10000
);
```

`CURRENT_TIMESTAMP` 与迁移本身会写入的值一致。如果你希望回填的值反映每个请求实际发生的时间，就改用 `COALESCE("endTime", "startTime", CURRENT_TIMESTAMP)`。回填完成后，再加上非空约束；这一步会扫描表一次，但不会重写它：

```sql
ALTER TABLE "LiteLLM_SpendLogs"
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
```

然后正常升级。不要手工往 `_prisma_migrations` 里插记录，也不要运行 `prisma migrate resolve --applied`；让 `prisma migrate deploy` 在发现列已就位时自行记录这条迁移。

如果你更愿意让代理在启动时自己完成重写，就把超时调大，免得 Prisma 客户端在语句执行到一半时被杀。从 v1.101.0 起，`prisma migrate deploy` 有了自己的独立上限 `LITELLM_PRISMA_MIGRATE_DEPLOY_TIMEOUT`（默认 600 秒）。在 v1.99.x 和 v1.100.x 上，它受 `LITELLM_PRISMA_COMMAND_TIMEOUT`（默认 60 秒）约束，该变量同时覆盖所有其他 Prisma 命令。调大超时只是不再触发这个重试循环：重写完成之前，代理依然不可用，表也依然被锁着，所以无论选哪种方式，都要把这次重启当作维护窗口来安排。
