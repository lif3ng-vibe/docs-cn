import { ControlPlaneArchitecture } from '@site/src/components/ControlPlaneArchitecture';

# 全局控制平面

部署一套统一的 LiteLLM UI，用它管理多个相互独立的 LiteLLM 代理服务器（proxy）实例，每个实例都有自己的数据库、Redis 和主密钥（master key）。

<EnterpriseFeature />

## 适用场景

当爆炸半径隔离比全局一致性更重要时，请选择这种拓扑，而不是共享数据库的[多区域部署](./multi_region.md)（Multi-Region Deployment）拓扑。某个工作节点（worker）的数据库故障不会波及其他节点，但在一个节点上创建的密钥无法在另一个节点上通过认证，因为密钥、团队和预算都只属于创建它们的那个节点。多区域部署文档完整讨论了两种拓扑的取舍，并给出授权对照表，本页方案正是表中的一行。

不要把它与那篇文档中介绍的专用管理实例混淆。那种实例同样只供管理员使用、不承载 LLM 流量，但它与所管理的各区域代理共享同一个数据库，因此管理的仍是单一部署。全局控制平面则与其工作节点之间什么都不共享，管理的是多个相互独立的部署。

## 架构

<ControlPlaneArchitecture />

**控制平面**（control plane）是一个 LiteLLM 实例，对外提供管理界面（Admin UI），并掌握所有工作节点的信息。它存在的唯一目的，就是让管理员在同一个 UI 中切换并管理各个工作节点。

每个**工作节点**（worker）都是一台完全独立的 LiteLLM 代理，负责处理自己区域或团队的 LLM 请求。工作节点拥有自己的数据库、Redis、用户、密钥、团队和预算。

## 设置

### 1. 控制平面配置

控制平面需要一个 `worker_registry`，其中列出所有工作节点实例。每个条目必须包含 `worker_id`、`name` 和 `url`。

```yaml title="cp_config.yaml"
model_list: []

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL

worker_registry:
  - worker_id: "worker-a"
    name: "Worker A"
    url: "http://localhost:4001" # must start with http:// or https://
  - worker_id: "worker-b"
    name: "Worker B"
    url: "http://localhost:4002"
```

启动控制平面：

```bash
litellm --config cp_config.yaml --port 4000
```

### 2. 工作节点配置

每个工作节点需要在 `general_settings` 中配置 `control_plane_url`。这会在工作节点上启用 `/v3/login` 和 `/v3/login/exchange` 端点，让控制平面的 UI 能够跨域向它完成认证。每个工作节点还必须设置 `PROXY_BASE_URL`，SSO 回调重定向才能正确解析。

```yaml title="worker_a_config.yaml"
model_list: []

general_settings:
  master_key: sk-worker-a-1234 # unique per worker
  database_url: os.environ/WORKER_A_DATABASE_URL # unique per worker
  control_plane_url: "http://localhost:4000"
```

```bash
PROXY_BASE_URL=http://localhost:4001 litellm --config worker_a_config.yaml --port 4001
```

对注册表中的每个工作节点重复上述操作，每次都要更换主密钥、数据库 URL 和端口。除此之外，工作节点就是一台普通的 LiteLLM 代理，[生产环境部署指南](./prod.md)对它原样适用。

:::important
每个工作节点必须拥有自己的 `master_key` 和 `database_url`。这套架构的核心就在于各工作节点相互独立。
:::

:::info
如果某个工作节点在负载均衡器后面运行了多个实例，请在该节点上配置 Redis（即其配置文件中的 `cache` 部分）。`/v3/login` 签发的登录码保存在服务端，如果没有共享的 Redis，交换请求可能落到另一个实例上并返回 401。
:::

### 3. SSO 配置（可选）

SSO 在控制平面实例上的配置方式与标准 LiteLLM 代理完全相同，完整步骤见 [SSO 配置指南](./admin_ui_sso.md)。如果使用 SSO，请在 SSO 提供商的仪表板中，把每个工作节点的 URL 和控制平面的 URL 都注册为允许的回调 URL。

在控制平面和至少一个工作节点运行起来之后，打开 `http://localhost:4000/ui`。登录页面上应该能看到工作节点选择器。

## 工作原理

### 登录流程

页面加载时，UI 会读取控制平面的 `/.well-known/litellm-ui-config` 端点；只要设置了 `worker_registry`，该端点就会返回 `is_control_plane: true`，并附上已注册的工作节点（各自的 ID、名称和 URL）。由于这是控制平面，登录页面会显示一个工作节点选择下拉框。

用户选择一个工作节点，用用户名/密码或 SSO 登录。UI 调用所选节点的 `/v3/login` 端点完成认证，该端点返回一个一次性代码，随后 UI 再拿这个代码到该节点的 `/v3/login/exchange` 换取 JWT。从这时起，所有后续 API 调用都指向该节点，因此密钥、团队、模型和预算都是在所选工作节点上管理的，控制平面 UI 只是统一的操作入口。

登录之后，用户可以在导航栏的下拉框中切换工作节点，无需离开 UI。切换时会跳回登录页面，向新的工作节点重新认证。
