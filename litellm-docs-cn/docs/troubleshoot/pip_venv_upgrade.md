# 升级 LiteLLM 代理（uv/venv）

本指南介绍在虚拟环境（venv）中通过 uv 安装的 LiteLLM 代理如何升级。

:::info[重要]
运行任何 `litellm` 或 `prisma` 命令之前，务必先激活虚拟环境。本指南中的所有命令都假定你已在已激活的 venv 内操作。
:::

## uv/venv 升级的工作原理

有两个部分需要保持同步：

1. **Prisma 客户端**——与数据库交互的 Python 生成代码
2. **数据库 schema**——PostgreSQL 中的表和列

通过 uv 升级时，`litellm-proxy-extras` 包会附带新的 `schema.prisma` 和 `migrations/` 目录。但与 Docker 镜像不同，`uv add` 不会自动重新生成 Prisma 客户端，也不会执行迁移，这两步都得手动完成。

## 升级流程（uv/venv）

### 1. 停止代理

停止正在运行的 LiteLLM 代理实例。

### 2. （可选）备份数据库

```bash
pg_dump -h <host> -U <user> -d <db> -F c -f backup_$(date +%Y%m%d).dump
```

### 3. 升级软件包

```bash
uv add 'litellm[proxy]==<version>'
```

### 4. 重新生成 Prisma 客户端

```bash
prisma generate --schema <venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma
```

将 `<venv>` 替换为你的虚拟环境路径，将 `<version>` 替换为解释器版本号（例如 `python{{python_version}}`）。

### 5. 应用数据库迁移

有两种做法：

**方式 A：直接启动代理**（最简单）

代理启动时会自动执行 `prisma migrate deploy`，应用所有新增的迁移。

先激活虚拟环境：

```bash
source <venv>/bin/activate
```

然后启动代理：

```bash
litellm --config your_config.yaml --port 4000
```

**方式 B：启动前手动执行**

先激活虚拟环境：

```bash
source <venv>/bin/activate
```

然后用显式指定的 schema 路径执行迁移：

```bash
prisma migrate deploy --schema <venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma
```

将 `<venv>` 替换为你的虚拟环境路径，将 `<version>` 替换为解释器版本号（例如 `python{{python_version}}`）。

### 6. 启动代理

如果你用的是上面的方式 B，现在就启动代理（venv 仍处于激活状态）：

```bash
litellm --config your_config.yaml --port 4000
```

## 如何验证迁移

> **注意**：`<schema-path>` 即 `<venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma`

### 应用迁移前：预览将发生的变更

先执行 `uv add 'litellm[proxy]==<version>'`（即第 3 步），确保新的 `schema.prisma` 已就位。

```bash
prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema-datamodel <schema-path> \
  --script
```

### 应用迁移后：检查状态

```bash
prisma migrate status --schema <schema-path>
```

所有迁移都应有 `finished_at` 时间戳，且没有 `rolled_back_at`。

## 关键注意事项

- **`DISABLE_SCHEMA_UPDATE=true`** 环境变量可阻止启动时自动执行迁移，适合想完全手动控制的场景

- **`prisma db push`** 是终极手段：强制同步数据库使其与 schema 一致，绕过迁移历史。所有变更都是增量式（新增列或表）时是安全的，但务必先备份。

- **`litellm_proxy_extras` 内的 `schema.prisma` 才是唯一权威来源**，请始终使用这一份，不要用其他版本或 git 仓库里的

## 故障排查

如果遇到迁移报错，请参阅 [Prisma 迁移故障排查指南](./prisma_migrations)。
