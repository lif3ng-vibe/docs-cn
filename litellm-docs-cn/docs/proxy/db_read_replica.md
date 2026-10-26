import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 数据库只读副本

LiteLLM 代理服务器可以将只读查询路由到独立的数据库端点，而写操作仍走主库。对于 Aurora 这类同时暴露 reader/writer 两个端点的集群，这一点尤其有用：把读请求导向 reader 端点，writer 端点就能腾出来专注处理事务型负载。

## 快速上手

在现有 `DATABASE_URL` 的基础上，再设置一个 `DATABASE_URL_READ_REPLICA`：

```shell
export DATABASE_URL=postgresql://user:pass@writer.db.example.com:5432/litellm
export DATABASE_URL_READ_REPLICA=postgresql://user:pass@reader.db.example.com:5432/litellm
```

代理服务器会在启动时自动检测该环境变量，并把内部 Prisma 客户端切换到路由模式，在两个端点之间分流。如果未设置 `DATABASE_URL_READ_REPLICA`，代理服务器保持单库行为，不需要任何其他配置。

## 路由规则

| 操作 | 路由目标 |
| --- | --- |
| `find_first`、`find_many`、`find_unique`（含 `_or_raise` 变体） | Reader |
| `count`、`group_by` | Reader |
| `query_raw`、`query_first` | Reader |
| `create`、`update`、`upsert`、`delete`、`update_many`、`delete_many` | Writer |
| `execute_raw` | Writer |
| 事务（`tx`、`batch_`） | Writer |

代码内部发起的读取（例如虚拟密钥（virtual key）查询、团队成员关系、花费查询）会被派发到 reader，调用方无需任何改动。路由包装层会拦截各模型的操作访问器，按方法选择后端。

## 只读副本降级

如果启动时 reader 端点不可达，代理服务器会记录一条警告并让读操作回退到 writer，而不是直接启动失败：

```
Failed to connect to read replica DB: <error>. Falling back to the writer for
reads until the reader is reachable.
```

如果 reader 在重连周期中失效，同样适用这一回退。下一次成功重建 reader 连接时会清除降级标记，读操作会重新落到 reader 上。

这意味着，启用只读副本路由**绝不会降低可用性**，最坏情况也只是退化到单库模式的性能。

## 基于 Token 的数据库认证

设置 `IAM_TOKEN_DB_AUTH=True`（AWS RDS IAM）或 `AZURE_POSTGRESQL_AUTH=True`（Microsoft Entra ID）时，writer 与 reader 会各自独立刷新 Token，且都在自身过期前完成。reader 地址既可以由单个 `DATABASE_URL_READ_REPLICA` 提供，也可以用一组组件变量（`DATABASE_HOST_READ_REPLICA`、`DATABASE_USER_READ_REPLICA` 等）拼装而成；Token 刷新路径会重新解析最终的 reader URL，因此启动之后轮换的只有 Token。

在 AWS 上，这天然适配 Aurora 的 reader 端点，该端点会解析到集群中的 reader 实例；在 Azure 上，则适配 Azure Database for PostgreSQL Flexible Server 的只读副本。

### 跨区域的 RDS IAM 认证

设置 `IAM_TOKEN_DB_AUTH=True` 后，LiteLLM 会独立签署 writer 与 reader 的 Token，因此 writer 和跨区域只读副本可以各自在自己的区域完成签署。每个连接的签署区域按以下顺序确定：连接自身的覆盖值，然后是其 RDS 主机名中的区域，最后是进程的 AWS 区域（`AWS_REGION_NAME`，缺省时回退到 `AWS_REGION`）。writer 的覆盖变量是 `AWS_RDS_REGION`，reader 的覆盖变量是 `AWS_RDS_READ_REPLICA_REGION`。reader 永远不会继承 `AWS_RDS_REGION`，因此只覆盖 writer 时，reader 仍走自己的解析路径。空值或纯空白值视同未设置，解析会继续尝试下一个来源。

对于标准格式的 RDS 端点，无需任何覆盖变量，主机名本身就携带区域。当签署区域必须与主机名所暗示的区域不同时才需要设置：

```shell
export IAM_TOKEN_DB_AUTH=true
export DATABASE_HOST=writer.abc123.us-east-1.rds.amazonaws.com
export DATABASE_PORT=5432
export DATABASE_USER=iam_user
export DATABASE_NAME=litellm
export DATABASE_URL_READ_REPLICA=postgresql://iam_user@reader.abc123.ap-northeast-1.rds.amazonaws.com:5432/litellm?sslmode=require
export AWS_RDS_REGION=us-east-1
export AWS_RDS_READ_REPLICA_REGION=ap-northeast-1
```

显式覆盖始终优先，即使与主机名不一致也以覆盖为准，因此区域填错会导致该连接认证失败。reader 认证失败时按前述降级行为把读操作回退到 writer；writer 失败则会导致启动失败。这些覆盖变量既作用于启动时的 Token 签发，也作用于此后每一次续期，包括通过 `DATABASE_HOST_READ_REPLICA` 拼装的 reader，以及容器内 PgBouncer 背后的 writer。它们不影响 Bedrock 或其他 AWS 服务的区域、密码认证，也不影响 Azure Entra 认证。

区域覆盖只决定签署区域，不会改写 Token 签署所针对的主机名。AWS 在生成 IAM Token 时要求使用真实的 RDS 端点，因此自定义 DNS 名称（例如 Route 53 记录）仍需在连接配置中使用标准 RDS 端点。TLS 主机名校验与区域选择相互独立。

## Kubernetes / Helm

官方 Helm chart 提供了两种配置 reader URL 的方式：

<Tabs>

<TabItem value="secret" label="来自 Kubernetes Secret（推荐）">

如果 reader URL 内嵌了凭据，请通过 `db.secret.readReplicaUrlKey` 从已有的 `db.secret.name` Kubernetes Secret 中引用。这样 URL 就不会出现在渲染后的 pod spec 和 Helm release Secret 里。

```yaml
db:
  useExisting: true
  secret:
    name: postgres
    usernameKey: username
    passwordKey: password
    # Add the reader URL to the same secret under any key, then reference it:
    readReplicaUrlKey: read-url
```

</TabItem>

<TabItem value="plain" label="明文值">

对于不含凭据的 URL（例如 `IAM_TOKEN_DB_AUTH` 或 `AZURE_POSTGRESQL_AUTH` 在运行时提供密码的场景），可以使用 `db.readReplicaUrl`：

```yaml
db:
  readReplicaUrl: "postgresql://litellm@reader.aurora.local:5432/litellm"
```

如果 URL 内嵌密码，请避免这种写法，因为该值会渲染进 pod spec 和 Helm release Secret。

</TabItem>

</Tabs>

## Docker Compose

在你的 service 中加上该环境变量：

```yaml
services:
  litellm:
    environment:
      DATABASE_URL: postgresql://user:pass@writer:5432/litellm
      DATABASE_URL_READ_REPLICA: postgresql://user:pass@reader:5432/litellm
```

## 何时启用

只读副本路由在以下场景最有价值：

- 你使用 Aurora（或其他提供 reader 端点的托管 PostgreSQL），希望把花费 / 团队 / 密钥查询从 writer 上分流出去。
- 读流量占主导，而 writer 的 CPU / 连接数吃紧。
- 你希望读请求在地理上更就近（reader 距离代理服务器更近）。

以下情况则**不适合**启用：

- 主库与副本其实是同一个物理端点。
- 你运行的是没有副本的单节点 PostgreSQL。
- 复制延迟会破坏应用的一致性假设。注意所有读操作都会路由到 reader，包括紧跟在写操作之后的那些读。

## 复制延迟

代理服务器不会为 reader 端点实现写后读一致性。如果你的复制延迟不可忽略（超过 100ms），并且存在先写某一行、紧接着就读同一行的流程，这些读可能拿到过期数据。代理服务器 Prisma 客户端上的 `query_raw` 和 `query_first` 与其他读操作一样路由到 reader，因此需要读自己写（read-your-writes）一致性的代码，应改用 `WriterPinnedClient`（来自 `litellm.proxy.db.routing_prisma_wrapper`）读取，或放进事务（`tx`）中执行，这两条路径都运行在 writer 上。

## 相关环境变量

| 环境变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | writer 连接 URL（必填）。 |
| `DATABASE_URL_READ_REPLICA` | reader 连接 URL（可选）。未设置时，所有读操作都走 writer。 |
| `IAM_TOKEN_DB_AUTH` | 设为 `True` 时，writer 与 reader 都自动刷新 AWS RDS IAM Token。 |
| `AZURE_POSTGRESQL_AUTH` | 设为 `True` 时，writer 与 reader 都自动刷新 Microsoft Entra ID Token。 |

完整列表见[环境变量参考](./config_settings#环境变量参考)。
