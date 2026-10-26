---
title: 生产环境上线
sidebar_label: 生产环境上线
description: 分五个步骤上线 LiteLLM 企业版：部署网关，授予模型、MCP 工具与智能体的访问权限，接入客户端，实现安全认证，并按项目与业务单元分摊成本。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本指南介绍如何分五个步骤，在公司内为所有团队上线 LiteLLM 企业版。请按顺序执行；每一步都会用到前面步骤创建的部署、团队和虚拟密钥（virtual key）。

1. [部署 LiteLLM](#步骤-1部署-litellm)，并配置好各项关键部署设置。
2. [授予访问权限](#步骤-2授予模型mcp-工具与智能体的访问权限)，覆盖提供商、模型、MCP 工具与智能体。
3. [配置客户端端点](#步骤-3配置客户端端点)。
4. [实现安全认证](#步骤-4实现安全认证)。
5. [设置成本分摊](#步骤-5设置成本分摊)，把成本分摊到各项目与业务单元。

:::info

- **免费试用**：[30 天企业版许可证](https://www.litellm.ai/enterprise#trial)
- **联系我们**：[预约演示](https://enterprise.litellm.ai/demo)
- **已有运行中的网关**：先看[从 OSS 迁移](/docs/enterprise/moving_from_oss)
- **全部企业版功能**：[企业版概览](/docs/enterprise)

:::

## 步骤 1：部署 LiteLLM

### 关键部署设置

在首次部署之前先确定以下事项；团队开始使用网关之后，每一项都很难再改。

- **Postgres**：管理界面（Admin UI）、虚拟密钥、MCP 与智能体（agent）注册表，以及预算追踪，数据都存放在 Postgres 中。参见[数据库容量规划](/docs/proxy/db_sizing)。
- **Redis**：如果运行多个实例或多个 worker，请使用 Redis 7.0 或更新版本。没有 Redis 时，每个实例都会各自独立地执行速率限制和预算限制。参见[哪些功能需要 Redis](/docs/proxy/redis_requirements)。
- **盐值密钥**（salt key）：在添加第一个模型之前设置 `LITELLM_SALT_KEY`。盐值密钥用于加密存储的凭据，一旦添加了模型就不能再改。参见[设置盐值密钥](/docs/proxy/prod#设置-salt-key)。
- **主密钥**（master key）：把主密钥保存在密钥管理器中。应用必须使用虚拟密钥，而不是主密钥。
- **版本**：固定到确切的版本号或镜像摘要，并[验证镜像签名](/docs/proxy/docker_image_security)。始终使用[受支持的版本](/docs/enterprise/version_support)。
- **拓扑**：如果要部署多个区域，请在部署前阅读[多区域部署](/docs/proxy/multi_region)。

完整清单见[生产环境最佳实践](/docs/proxy/prod)与[安全最佳实践](/docs/proxy/security_best_practices)。

### 前提条件

- 一个 LLM 提供商的 API 密钥（OpenAI、Azure、Anthropic 或其他提供商均可）
- 一个 Postgres 数据库，或者由所选部署方式自动创建的 Postgres 数据库
- 你的**企业版许可证密钥**（Enterprise license key）
- 一个部署目标：**Docker Compose**、**Kubernetes**（`kubectl`）或 **Helm**

### 部署网关

<Tabs>
<TabItem value="docker-compose" label="Docker Compose">

按照[快速上手](/docs/proxy/docker_quick_start)操作即可；这里给出精简步骤：

```bash
curl -O https://raw.githubusercontent.com/BerriAI/litellm/main/docker-compose.yml
```

创建 `.env`：

```bash
LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>"
LITELLM_SALT_KEY="sk-salt-change-me"
LITELLM_LICENSE="eyJ..."
OPENAI_API_KEY="your-api-key"
```

创建 `config.yaml`：

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["prometheus"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: "postgresql://llmproxy:dbpassword9090@db:5432/litellm"
  store_model_in_db: true
```

```bash
docker compose up
```

</TabItem>

<TabItem value="kubernetes" label="Kubernetes">

当你自行管理 Postgres、希望完全掌控资源时，可以用原始清单直接部署。前提是集群能访问一个已有的 Postgres。

#### 1. 为 `config.yaml` 创建 ConfigMap

```yaml title="litellm-config.yaml" showLineNumbers
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-config
data:
  config.yaml: |
    model_list:
      - model_name: {{openai_large}}
        litellm_params:
          model: openai/{{openai_large}}
          api_key: os.environ/OPENAI_API_KEY

    litellm_settings:
      callbacks: ["prometheus"]

    general_settings:
      master_key: os.environ/LITELLM_MASTER_KEY
      store_model_in_db: true
```

```bash
kubectl apply -f litellm-config.yaml
```

#### 2. 为密钥创建 Secret

```bash
kubectl create secret generic litellm-secrets \
  --from-literal=LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>" \
  --from-literal=LITELLM_SALT_KEY="sk-salt-change-me" \
  --from-literal=LITELLM_LICENSE="eyJ..." \
  --from-literal=OPENAI_API_KEY="your-api-key" \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/litellm"
```

#### 3. 创建 `deployment.yaml`

```yaml title="deployment.yaml" showLineNumbers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: litellm
  template:
    metadata:
      labels:
        app: litellm
    spec:
      containers:
        - name: litellm
          image: docker.litellm.ai/berriai/litellm:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 4000
          envFrom:
            - secretRef:
                name: litellm-secrets
          args:
            - "--config"
            - "/app/proxy_config.yaml"
          volumeMounts:
            - name: config-volume
              mountPath: /app/proxy_config.yaml
              subPath: config.yaml
              readOnly: true
          livenessProbe:
            httpGet:
              path: /health/liveliness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 4000
            initialDelaySeconds: 120
            periodSeconds: 15
      volumes:
        - name: config-volume
          configMap:
            name: litellm-config
```

```bash
kubectl apply -f deployment.yaml
```

#### 4. 创建 `service.yaml`

```yaml title="service.yaml" showLineNumbers
apiVersion: v1
kind: Service
metadata:
  name: litellm-service
spec:
  selector:
    app: litellm
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: NodePort
```

```bash
kubectl apply -f service.yaml
```

#### 5. 启动服务器

```bash
kubectl port-forward service/litellm-service 4000:4000
```

你的 LiteLLM 网关现在已经运行在 `http://0.0.0.0:4000`。

</TabItem>

<TabItem value="helm" label="Helm">

Chart 发布在 OCI registry 中，Helm 可以直接安装，无需克隆仓库。它既可以帮你部署 Postgres（`db.deployStandalone: true`），也可以指向已有数据库（`db.useExisting`）。参见 [chart README](https://github.com/BerriAI/litellm/blob/main/helm/litellm-helm/README.md) 与完整的 [values.yaml](https://github.com/BerriAI/litellm/blob/main/helm/litellm-helm/values.yaml)。

#### 1. 为许可证与提供商密钥创建 Secret

```bash
kubectl create secret generic litellm-env-secret \
  --from-literal=LITELLM_LICENSE="eyJ..." \
  --from-literal=OPENAI_API_KEY="your-api-key"
```

#### 2. 创建 `values-enterprise.yaml`

在 chart 之上叠加企业版配置。`environmentSecrets` 会把上面的 Secret 以环境变量的形式注入，`proxy_config` 再通过 `os.environ/<NAME>` 引用这些变量。

```yaml title="values-enterprise.yaml" showLineNumbers
masterkey: sk-<your-litellm-api-key>

environmentSecrets:
  - litellm-env-secret

db:
  deployStandalone: true

proxyConfigMap:
  create: true

proxy_config:
  model_list:
    - model_name: {{openai_large}}
      litellm_params:
        model: openai/{{openai_large}}
        api_key: os.environ/OPENAI_API_KEY
  litellm_settings:
    callbacks: ["prometheus"]
  general_settings:
    store_model_in_db: true
```

`db.deployStandalone: true` 会通过 Bitnami chart 部署一个单节点 Postgres，并使用默认密码。试用没问题；要长期运行，请用 `--set postgresql.auth.password=<pw>,postgresql.auth.postgres-password=<pw>` 覆盖密码，或改用下文的自带数据库方式。

**自带数据库**：要让 chart 指向已有的 Postgres 而不是自己部署一个，请替换 `db` 配置块。先创建一个包含 `username` 和 `password` 键的 Secret（默认名称为 `postgres`）；chart 会用 `endpoint`、`database` 以及这组凭据拼出连接 URL。

```yaml title="values-enterprise.yaml" showLineNumbers
db:
  useExisting: true
  endpoint: my-postgres.default.svc.cluster.local
  database: litellm
  secret:
    name: litellm-db-secret
    usernameKey: username
    passwordKey: password
```

#### 3. 使用 Helm 部署

直接从 OCI registry 安装 chart，并传入你的企业版配置：

```bash
helm install \
  -f values-enterprise.yaml \
  mydeploy \
  oci://docker.litellm.ai/berriai/litellm-helm
```

#### 4. 将服务暴露到本地

```bash
kubectl port-forward service/mydeploy-litellm-helm 4000:4000
```

你的 LiteLLM 网关现在已经运行在 `http://127.0.0.1:4000`。

</TabItem>
</Tabs>

### 验证企业版

打开 `http://localhost:4000/`。API 文档页面的描述中必须出现 **Enterprise Edition** 字样；如果没有，参见[激活许可证](/docs/enterprise/activate)。

在 `http://localhost:4000/ui` 打开管理界面，用主密钥登录。到步骤 4 时，你会把这种登录方式替换为 SSO（单点登录）。

---

## 步骤 2：授予模型、MCP 工具与智能体的访问权限

在这一步，你把提供商、模型、MCP 服务器和智能体加入网关，然后把它们的访问权限授予一个团队。

### 2a. 添加提供商与模型

步骤 1 的部署已在 `config.yaml` 中添加了 `{{openai_large}}`。要添加更多模型，可以使用管理界面的 **Models** 页面，或修改 `config.yaml` 中的 `model_list`。模型的定义只保留一处权威来源。参见[模型管理](/docs/proxy/model_management)与[全部提供商](/docs/providers)。

### 2b. 创建组织、团队与虚拟密钥

以下步骤在管理界面中完成。

| 步骤 | 操作 | 说明 |
| ---- | ------ | --- |
| 1 | 创建**组织**（organization）与**团队**（team） | 组织是顶层实体，例如一个业务单元；组织下面包含团队，例如一个前端团队。 |
| 2 | 邀请**内部用户**（Internal Users）加入团队 | 每个用户都能访问团队模型，网关会分别统计每个用户的花费。 |
| 3 | 设置团队的 **`max_budget`**（例如 `30d` 内 `$10`） | 预算提供硬性花费上限。在步骤 5 中，你会用它来验证预算限制是否生效。 |
| 4 | 创建一个可访问该模型的**团队虚拟密钥** | 应用会在步骤 3 中使用这个密钥；网关会记录该密钥与团队的花费。 |

参见[多租户架构](/docs/proxy/multi_tenant_architecture)与[虚拟密钥](/docs/proxy/virtual_keys)。

### 2c. 添加 MCP 工具

1. 在管理界面进入 **MCP Servers**，选择 **Add New MCP Server**：

   - 名称：`deepwiki`
   - URL：`https://mcp.deepwiki.com/mcp`
   - 传输方式：HTTP

   也可以把该服务器添加到 `config.yaml`：

```yaml
mcp_servers:
  deepwiki:
    url: https://mcp.deepwiki.com/mcp
    transport: http
    available_on_public_internet: true
```

2. 在团队或虚拟密钥的 MCP 设置中，允许 `deepwiki` 服务器。参见 [MCP 权限管理](/docs/mcp_control)。
3. 确认这些工具已出现在管理界面的 **MCP Servers > MCP Tools** 下方。

### 2d. 添加智能体

1. 部署一个示例 A2A（Agent-to-Agent）智能体，例如[基于 A2A 的多智能体协作](https://github.com/a2aproject/a2a-samples/tree/main/demo)。该智能体支持流式输出。
2. 在管理界面进入 **Agents**，选择 **Add Agent**，填写智能体的名称和 URL。
3. 在虚拟密钥的智能体设置中，允许该智能体。参见[智能体权限管理](/docs/a2a_agent_permissions)。

```mermaid
flowchart TD
    CLIENT["Client (A2A SDK / curl)"]
    CLIENT -->|"Authorization: Bearer sk-..."| PROXY["LiteLLM Agent Gateway"]
    PROXY -->|"object_permission.agents"| PERMS["Key / Team agent allowlist"]
    PERMS -->|"GET /v1/agents filter"| LIST["Agent catalog"]
    PERMS -->|"POST /a2a/{agent_id}"| AGENT["Downstream A2A Agent"]
    AGENT -->|"response + nested LLM calls"| PROXY
    PROXY -->|"X-LiteLLM-Trace-Id · agent spend"| LOGS["Logs tab · Agent cost tracking"]
```

→ [MCP 概览](/docs/mcp) · [智能体网关概览](/docs/a2a)

---

## 步骤 3：配置客户端端点

应用和工具带上团队虚拟密钥，向网关 URL 发送请求。在这一步，你会发送一个 LLM 请求、一个 MCP 工具调用和一个智能体调用，然后接入你的客户端工具。

### 3a. LLM 请求

```mermaid
flowchart TD
    APP["Client App / SDK"]
    APP -->|"Authorization: Bearer sk-..."| PROXY["LiteLLM Gateway"]
    PROXY -->|"virtual key lookup"| KEY["Virtual Key + Team"]
    KEY -->|"model allowlist"| ROUTE["LLM Router /v1/chat/completions"]
    ROUTE -->|"litellm_params.model"| PROVIDER["Provider API (OpenAI, Azure, Bedrock)"]
    PROXY -->|"request + token spend"| LOGS["Logs tab · Spend dashboard"]
```

1. 使用团队虚拟密钥发送一个请求：

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-team-key' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello from LiteLLM Enterprise Gateway"}]
  }'
```

2. 确认响应为 `200 OK`。助手的回复文本位于 `choices[0].message.content`。
3. 打开 **Logs** 页面，确认日志中记录了密钥、团队、模型、延迟和花费。
4. 打开 **Teams** 页面并选择你的团队，确认花费已经增加。

### 3b. MCP 工具调用

```mermaid
flowchart TD
    CLIENT["Client (curl / OpenAI SDK / Cursor)"]
    CLIENT -->|"x-litellm-api-key: Bearer sk-..."| PROXY["LiteLLM MCP Gateway"]
    PROXY -->|"object_permission.mcp_servers"| PERMS["Key / Team MCP allowlist"]
    PERMS -->|"allowed server"| MCP["DeepWiki MCP Server"]
    MCP -->|"tool result"| PROXY
    PROXY -->|"mcp tool call log + cost"| LOGS["Logs tab · MCP cost tracking"]
```

1. 发送一个使用 `deepwiki` 工具的请求：

```bash
curl -X POST 'http://localhost:4000/v1/chat/completions' \
  -H 'Authorization: Bearer sk-team-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "TLDR of BerriAI/litellm repo"}],
    "tools": [{
      "type": "mcp",
      "server_url": "litellm_proxy/deepwiki",
      "server_label": "deepwiki",
      "require_approval": "never"
    }]
  }'
```

2. 确认响应中包含工具输出以及助手给出的摘要。
3. 打开 **Logs** 页面，确认日志中记录了这次 MCP 工具调用，包括工具名称和成本。

参见[使用 MCP](/docs/mcp_usage)。

### 3c. 智能体调用

1. 列出该密钥可用的智能体：

```bash
curl -H 'Authorization: Bearer sk-team-key' \
  'http://localhost:4000/v1/agents'
```

2. 使用 A2A SDK 调用智能体：

```python showLineNumbers title="invoke_a2a_agent.py"
import httpx, asyncio
from uuid import uuid4
from a2a.client import A2ACardResolver, A2AClient
from a2a.types import MessageSendParams, SendMessageRequest

LITELLM_BASE_URL = "http://localhost:4000"
LITELLM_VIRTUAL_KEY = "sk-team-key"

async def main():
    headers = {"Authorization": f"Bearer {LITELLM_VIRTUAL_KEY}"}
    async with httpx.AsyncClient(headers=headers) as client:
        agents = (await client.get(f"{LITELLM_BASE_URL}/v1/agents")).json()
        agent_id = agents[0]["agent_id"]
        base_url = f"{LITELLM_BASE_URL}/a2a/{agent_id}"
        resolver = A2ACardResolver(httpx_client=client, base_url=base_url)
        a2a_client = A2AClient(
            httpx_client=client,
            agent_card=await resolver.get_agent_card(),
        )
        response = await a2a_client.send_message(
            SendMessageRequest(
                id=str(uuid4()),
                params=MessageSendParams(
                    message={
                        "role": "user",
                        "parts": [{"kind": "text", "text": "Hello, what can you do?"}],
                        "messageId": uuid4().hex,
                    }
                ),
            )
        )
        print(response.model_dump(mode="json", exclude_none=True, indent=2))

asyncio.run(main())
```

3. 打开 **Logs** 页面，确认日志中记录了这次智能体调用的密钥、团队、延迟和成本。

参见[调用 A2A 智能体](/docs/a2a_invoking_agents)与[智能体成本追踪](/docs/a2a_cost_tracking)。

### 3d. 接入客户端工具

代码工具和聊天类应用使用网关 URL，以及虚拟密钥或登录令牌。每种客户端都有对应的配置页，例如 Claude Code、Codex 和 Claude Desktop。参见[客户端配置](/docs/proxy/client_setup/overview)。

---

## 步骤 4：实现安全认证

在这一步，你把共享主密钥的登录方式替换为自己的身份提供商（IdP）登录，然后限制每个人、每个工作负载可以执行的操作。

### 为管理界面配置 SSO

SSO 管理的是管理界面的登录；API 请求使用另一种机制：虚拟密钥或 JWT。在你的身份提供商处注册以下重定向 URI：

```
https://<your-proxy-base-url>/sso/callback
```

<Tabs>
<TabItem value="google" label="Google">

```bash
GOOGLE_CLIENT_ID="<your-client-id>"
GOOGLE_CLIENT_SECRET="<your-client-secret>"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

</TabItem>
<TabItem value="microsoft" label="Microsoft">

```bash
MICROSOFT_CLIENT_ID="<your-client-id>"
MICROSOFT_CLIENT_SECRET="<your-client-secret>"
MICROSOFT_TENANT="<your-tenant-id>"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

</TabItem>
<TabItem value="okta" label="Okta / Generic OIDC">

```bash
GENERIC_CLIENT_ID="<your-client-id>"
GENERIC_CLIENT_SECRET="<your-client-secret>"
GENERIC_AUTHORIZATION_ENDPOINT="https://<your-idp>/oauth2/v1/authorize"
GENERIC_TOKEN_ENDPOINT="https://<your-idp>/oauth2/v1/token"
GENERIC_USERINFO_ENDPOINT="https://<your-idp>/oauth2/v1/userinfo"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

</TabItem>
</Tabs>

改用身份提供商登录管理界面，然后禁用基于主密钥和 `UI_PASSWORD` 的登录。参见[禁用环境凭据登录](/docs/proxy/security_best_practices#禁用环境变量凭据登录管理界面admin-ui)。

要从身份提供商同步创建用户和团队，可使用 [SCIM 配置](/docs/tutorials/scim_litellm)。更多选项参见[管理界面 SSO](/docs/proxy/admin_ui_sso)、[SSO 事件钩子](/docs/proxy/custom_sso)与 [CLI SSO](/docs/proxy/cli_sso)。

### API 流量的 JWT 认证

工作负载可以携带来自 OIDC 提供商的 JWT，替代长期有效的虚拟密钥。JWT 声明（claims）可以把每个请求映射到对应的 LiteLLM 用户、团队和模型访问权限。参见 [JWT 认证](/docs/proxy/token_auth)与[JWT 到虚拟密钥的映射](/docs/proxy/jwt_key_mapping)。

### 最小权限访问

给每个人分配最小的 [RBAC 角色](/docs/proxy/access_control)，并保持代理管理员数量尽可能少。给每个生产环境工作负载分配独立的[服务账户](/docs/proxy/service_accounts)密钥，这样吊销某个工作负载时不会影响其他工作负载。要限制网络来源，可使用 [IP 地址过滤](/docs/proxy/ip_address)。

### 密钥管理器

把提供商密钥保存在密钥管理器中，不要放在配置文件里。参见[密钥管理器](/docs/secret_managers/overview)。

### 审计日志

只要网关配置了许可证，审计日志默认开启。要关闭，在 `litellm_settings` 中设置 `store_audit_logs: false`。测试方法：通过 API 或管理界面删除一个虚拟密钥，然后打开 **Audit Logs** 页面查看。参见[审计日志](/docs/proxy/multiple_admins)。

---

## 步骤 5：设置成本分摊

成本分摊（chargeback）把每个请求的成本归属到发起它的业务单元或项目。LiteLLM 会在租户层级的每一层归属花费：组织、团队、用户和虚拟密钥。项目和标签则提供更多统计维度。用组织对应业务单元，用团队对应其下的分组；用项目对应应用，用标签对应跨团队的成本。

```mermaid
flowchart TD
    REQUEST["Client Request (LLM / MCP / Agent)"]
    REQUEST -->|"Authorization: Bearer sk-..."| PROXY["LiteLLM Enterprise Gateway"]

    PROXY -->|"key.team_id"| TEAMS["Team (Org hierarchy)"]
    PROXY -->|"virtual key lookup"| KEYS["Virtual Keys"]
    PROXY -->|"metadata.tags on request"| TAGS["Tag Budget (cross-cutting projects)"]

    TEAMS --> TBUDGET["Team max_budget / Monthly spend envelope"]
    KEYS --> KBUDGET["Key max_budget + RPM/TPM limits"]
    TAGS --> TABUDGET["Tag budget limits"]

    TBUDGET --> ENFORCE["Budget check before route"]
    KBUDGET --> ENFORCE
    TABUDGET --> ENFORCE
    ENFORCE --> ROUTES["LLM / MCP / Agent routes"]
    PROXY --> SPEND["Spend dashboard · GET /spend/tags"]
```

同一个虚拟密钥和同一套预算，同时适用于 LLM、MCP 和智能体请求。

### 5a. 团队预算

团队的 `max_budget` 在步骤 2 中已经设置。完成步骤 3 之后：

1. 打开 **Teams** 页面并选择你的团队。
2. 确认花费统计中包含 LLM、MCP 和智能体调用。
3. 可选：把团队的 `max_budget` 设成一个极小的值，例如 `$0.0001`。发送一个 LLM 请求，确认网关返回预算错误。

要在团队达到预算上限之前发邮件提醒，可使用[软预算警报](/docs/proxy/ui_team_soft_budget_alerts)。

### 5b. 项目

项目把同一个应用或使用场景下的密钥归为一组。项目拥有自己的预算、负责人、速率限制、模型白名单和独立的花费视图。参见[项目](/docs/proxy/project_management)。

### 5c. 密钥预算与速率限制

1. 创建一个带小额预算和 RPM 上限的密钥：

```bash
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "max_budget": 0.01,
    "rpm_limit": 1,
    "team_id": "<your-team-id>"
  }'
```

2. 用新密钥发送一个请求，确认响应为 `200 OK`。
3. 在同一分钟内发送第二个请求，确认网关返回速率限制错误。
4. 在管理界面打开 **Virtual Keys**，查看该密钥的花费。

参见[虚拟密钥](/docs/proxy/virtual_keys)。

### 5d. 标签预算

1. 在 `config.yaml` 中添加 `tag_budget_config`，然后重启网关：

```yaml
litellm_settings:
  tag_budget_config:
    poc:chat-app:
      max_budget: 0.000000000001
      budget_duration: 1d
```

2. 发送一个带该标签的请求：

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Authorization: Bearer sk-team-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["poc:chat-app"]}
  }'
```

3. 确认第一个请求成功；再发送一个带相同标签的请求，确认网关返回预算错误。

4. 获取每个标签的花费：

```bash
curl -X GET 'http://localhost:4000/spend/tags' \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

确认响应中显示 `poc:chat-app` 及其 `total_spend` 和 `log_count`。

参见[请求标签](/docs/proxy/request_tags)与[标签预算](/docs/proxy/tag_budgets)。

### 5e. 花费报告

要把成本交给财务，可以用 API 按团队、密钥、标签或模型获取花费报告。参见[生成花费报告](/docs/proxy/cost_tracking#企业版生成花费报告)。

需要临时提高限额时，可使用[临时预算提升](/docs/proxy/temporary_budget_increase)；需要分层限额时，可使用[预算与速率限制分层](/docs/proxy/rate_limit_tiers)。

---

## 上线之后

- **防护栏**（guardrails）：创建一个防护栏，用策略把它绑定到团队或密钥上，然后发送一个本应被拦截的请求来验证效果。参见[防护栏快速上手](/docs/proxy/guardrails/quick_start)与[防护栏策略](/docs/proxy/guardrails/guardrail_policies)。
- **团队日志**：把每个团队的日志发送到其专属的可观测性（observability）项目。参见[团队与密钥日志](/docs/proxy/team_logging)。
- **AI Hub**：在一个页面里集中展示用户可用的模型、MCP 服务器和智能体。参见 [AI Hub](/docs/proxy/ai_hub)。
- **安全审查**：收集 SOC 2 Type II 报告和安全团队所需的问题答复。参见[合规与 SOC 2 Type II](/docs/enterprise/compliance)。

## 获取帮助

每个企业版许可证都包含一个与 LiteLLM 工程师直连的专属 Slack 或 Teams 频道。也可以发送邮件至 `support@berri.ai`。参见[支持与 SLA](/docs/enterprise/support)。
