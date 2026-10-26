---
title: "将 Lens 接入 LiteLLM"
description: "将运行中的 Lens 服务连接到你的网关，并从 LiteLLM 侧边栏打开。"
slug: "/proxy/lens/deployment/litellm"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 将 Lens 接入 LiteLLM

将 Lens 服务连接到你的网关后，用户即可在 LiteLLM 侧边栏中打开 **Lens**。他们沿用现有的 LiteLLM 会话，Lens 的独立 URL 依然可用。

本指南同样适用于接入**已有的 Lens 部署**（包括托管在 Render 上的实例），并保留其数据、ClickHouse 设置、管理员令牌和追踪密钥。

你需要能访问两个服务的环境变量设置。只连接属于同一可信工作区的网关：其管理员在 Lens 中也拥有管理员权限。

:::info 网关版本
以下步骤依赖独立的 Lens 适配器与 UI，已在 [PR #45529](https://github.com/BerriAI/litellm/pull/45529) 中合入 LiteLLM。已发布的 `v1.106.0-dev.3` 版本早于该改动，请使用包含这一改动的网关构建。在此类构建部署之前，你可以通过 Lens 的独立 URL 使用 Lens。参见[版本与镜像](./releases.md)。
:::

## 1. 获取 Lens 地址

如果 Lens 已经在运行，直接使用其现有 URL 并进入第 2 步。例如 Render 服务使用其公网 HTTPS URL。这里要填应用本身的 URL，而不是 Render 仪表板的 URL。

如果尚未安装 Lens，请先完成[独立部署快速上手](./local.md)、[服务器部署](./server.md)或 [Helm 部署](./kubernetes.md#new-deployment)，再回到本页。

确认 Lens 已就绪。将示例 URL 替换为你自己的：

```sh
curl --fail https://lens.example.com/health/ready
```

应返回 HTTP 200。网关也必须能访问到该服务。网关容器无法通过 `localhost` 访问位于另一容器或另一主机上的 Lens。

## 2. 创建两个连接密钥

如果 Lens 已经连接过某个网关，请复用现有的 `LITELLM_LENS_SERVICE_TOKEN` 和 `LENS_GATEWAY_SECRET`，不要在添加本次连接时轮换它们。

如果是新连接，请在私密终端中生成两个不同的密钥：

```sh
openssl rand -hex 32
openssl rand -hex 32
```

将第一个保存为 `LITELLM_LENS_SERVICE_TOKEN`，第二个保存为 `LENS_GATEWAY_SECRET`，存入你的密钥管理器（secret manager）。稍后要给两个服务提供同一对值。

| 值 | 用途 |
| --- | --- |
| `LITELLM_LENS_SERVICE_TOKEN` | 验证 LiteLLM 发往 Lens 的内部请求 |
| `LENS_GATEWAY_SECRET` | 让 Lens 能校验 LiteLLM 传来的用户身份 |

这两个密钥独立于 Lens 管理员令牌、Agent 追踪密钥和 LiteLLM 模型密钥。不要把它们的值提交进 Git、写入浏览器端代码或共享日志。

## 3. 将密钥添加到 Lens

在**现有的 Lens 服务**上添加以下环境变量：

```dotenv
LITELLM_LENS_SERVICE_TOKEN=YOUR_SERVICE_SECRET
LENS_GATEWAY_SECRET=YOUR_SIGNING_SECRET
```

将各占位符替换为第 2 步中生成的对应值，Lens 的其他设置保持不变。

<Tabs groupId="lens-host">
<TabItem value="render" label="Render">

在 Render 仪表板中打开你的 Lens 服务，选择 **Environment**，添加这两个变量，然后保存并重新部署。等待部署状态变为 **Live**。

</TabItem>
<TabItem value="compose" label="Docker Compose">

将这两个变量加入你的 Lens 代码库中的 `deploy/lens/.env`，然后在仓库根目录执行：

```sh
docker compose -f deploy/lens/compose.yaml up -d --wait
```

</TabItem>
<TabItem value="other" label="Helm 或其他平台">

使用 Helm 时，参考 [Lens chart 的网关设置](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#connect-a-gateway)来引用这两个密钥。使用其他平台时，通过环境变量设置为 Lens 服务添加这两个变量，然后重新部署。

</TabItem>
</Tabs>

部署完成后，重复第 1 步的就绪检查。

## 4. 配置 LiteLLM

将以下变量添加到 LiteLLM 服务。如果采用网关与后端分离的部署方式，两个服务都要提供：

```dotenv
LITELLM_LENS_URL=https://lens.example.com
LITELLM_LENS_PUBLIC_URL=https://lens.example.com
LITELLM_LENS_SERVICE_TOKEN=YOUR_SERVICE_SECRET
LENS_GATEWAY_SECRET=YOUR_SIGNING_SECRET
```

填入你的 Lens URL 以及第 2 步中相同的两个密钥。两个 URL 都不要以 `/ui/` 或 `/v1/traces` 结尾。

`LITELLM_LENS_URL` 是网关实际调用的地址；`LITELLM_LENS_PUBLIC_URL` 是展示给 Agent 导出器的地址。两者可以是同一个 HTTPS URL。如果前者使用内网地址，后者仍必须能被你的 Agent 访问到。

将以下配置块合并进网关现有的 `config.yaml`，保留其模型列表和其他设置：

```yaml
general_settings:
  tracing:
    store:
      type: lens
```

通过你惯用的网关部署方式使配置生效。使用 Compose 时，参照 [Compose 部署步骤](./docker-compose.md#2-apply-the-gateway-settings)；使用 Helm 时，采用 [Lens 外部模式](./kubernetes.md#existing-deployment)。这四个环境变量由 Helm 通过 chart values 和 Secret 引用提供。

## 5. 在网关中打开 Lens

以网关管理员身份登录 LiteLLM 仪表板，在侧边栏中选择 **Lens**。你应该会看到已连接的 Lens 工作区，或其首次追踪的设置页面。页面不应再要求输入 Lens 独立部署的管理员令牌。

如果服务已连接但还没有追踪记录，请在此嵌入页面中按照[发送你的第一条追踪](../first-trace.md)操作。在这里创建追踪密钥时，会沿用网关用户的访问范围。连接网关不会把已有的独立部署追踪记录重新分配给其他用户或团队。

通过网关正常发起一次模型请求，确认原有的模型连接依然可用。接入 Lens 不要求更改 Agent 使用的模型端点或模型密钥。

## 连接不上时的排查

| 现象 | 排查方向 |
| --- | --- |
| Lens 仍显示安装引导 | 确认四个网关变量都已注入正在运行的服务，再检查其版本。 |
| Lens 已配置但无法访问 | 检查 `/health/ready`、网关到 Lens 的网络连通性，以及两个密钥是否一致。 |
| 能打开 Lens 但无法发送追踪 | 检查公开的上报 URL，并改用 Agent 追踪密钥，而不是任一连接密钥。 |
| 某个用户看不到已有的追踪 | 检查追踪密钥的用户/团队范围，并用管理员账号检查工作区。 |

如需通过 API 检查连接状态，可使用 LiteLLM 管理员凭据调用网关上的 `GET /lens/service`。连接就绪时会返回 `connected: true`、`status.storage_ready: true`、`status.credentials_ready: true` 和 `status.public_contract: 1`。请妥善保管该凭据。

**可选**：如果需要针对你的部署环境调整这些步骤，可以把[现有 LiteLLM 接入提示词](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#add-lens-to-existing-litellm)复制给你的编码 Agent，告知它 Lens 已在运行并提供服务 URL。密钥请通过密钥管理器共享。
