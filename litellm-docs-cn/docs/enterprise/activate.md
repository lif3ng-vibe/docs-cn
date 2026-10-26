---
title: 激活许可证
description: 在每个 LiteLLM 网关实例上设置 LITELLM_LICENSE，确认网关已显示 Enterprise Edition（企业版），并了解许可证密钥解锁了哪些功能。
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 激活许可证

LiteLLM Enterprise 是一份适用于网关镜像的许可证密钥（license key），而你当前运行的正是这个镜像。密钥用来解锁企业版功能。你无需安装另一个镜像，也无需迁移数据。

许可证密钥是一段 JWT。购买许可证或开启 [30 天试用](https://www.litellm.ai/enterprise#trial)时，LiteLLM 会把密钥发给你。

## 设置许可证密钥

在每个网关实例的环境中设置 `LITELLM_LICENSE`，然后重启每个实例。

<Tabs>
<TabItem value="env" label=".env 文件">

```env
LITELLM_LICENSE="eyJ..."
```

</TabItem>
<TabItem value="docker" label="Docker">

```bash
docker run \
  -e LITELLM_MASTER_KEY=sk-<paste-a-long-random-key> \
  -e DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname> \
  -e LITELLM_LICENSE="eyJ..." \
  -e STORE_MODEL_IN_DB=True \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:latest
```

</TabItem>
<TabItem value="kubernetes" label="Kubernetes">

把密钥放进 Deployment 通过 `envFrom` 加载的 Secret 中：

```bash
kubectl create secret generic litellm-secrets \
  --from-literal=LITELLM_MASTER_KEY="sk-<paste-a-long-random-key>" \
  --from-literal=LITELLM_SALT_KEY="sk-<paste-a-long-random-salt>" \
  --from-literal=LITELLM_LICENSE="eyJ..." \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/litellm"
```

</TabItem>
<TabItem value="helm" label="Helm">

创建一个 Secret，并在 values 文件的 `environmentSecrets` 中列出它：

```bash
kubectl create secret generic litellm-env-secret \
  --from-literal=LITELLM_LICENSE="eyJ..."
```

```yaml title="values.yaml"
environmentSecrets:
  - litellm-env-secret
```

</TabItem>
</Tabs>

你也可以在 `general_settings` 中以 `litellm_license` 的形式设置密钥，或者把加密后的密钥存放在 `LITELLM_SECRET_AWS_KMS_LITELLM_LICENSE` 中，配合 AWS KMS 使用。详见[配置参考](../proxy/config_settings.md)。

如果你在多个区域运行网关，每个区域都使用同一份密钥。每个实例会独立校验密钥。一份许可证即可覆盖共享同一个数据库的所有区域。详见[多区域部署](../proxy/multi_region.md#跨区域许可)。

## 验证许可证

1. 在浏览器中打开 `http://<your-proxy-host>:<port>/`。
2. 在 API 文档页面的描述区域中找到 **Enterprise Edition**（企业版）字样。
3. 如果页面没有显示 **Enterprise Edition**，请检查密钥是否正确、是否已过期。
4. 完整重启所有网关实例，然后重新检查一次。

如果你设置了 `NO_DOCS`，网关就不会显示 API 文档页面。请先完成上述检查，再禁用 API 文档。详见[限制所有 API 文档](../proxy/configs.md#生产隔离网络部署下禁用全部-api-文档)。

## 许可证启用的功能

概览页上的[完整功能列表](../enterprise.md#full-feature-list)列出了密钥解锁的全部功能。每个功能页面顶部都有一条 **Enterprise feature**（企业版功能）提示。在侧边栏中，这些页面带有 **Enterprise** 标签。

部分功能有特殊条件：

- Admin UI 的 SSO（单点登录）最多免费支持 5 个用户，更多用户则需要许可证。详见 [Admin UI 的 SSO](../proxy/admin_ui_sso.md)。
- 网关带有许可证时，审计日志默认开启。详见[审计日志](../proxy/multiple_admins.md)。
- 部分防护栏（guardrails）集成需要许可证。详见[哪些防护栏需要许可证？](../enterprise.md#guardrails-oss-vs-enterprise)。
- 带 **Free Enterprise feature**（免费企业版功能）提示的页面不需要许可证，例如[托管文件](../proxy/litellm_managed_files.md)和[托管批处理](../proxy/managed_batches.md)。
- [计费请求计量](../proxy/billing_metrics.md)需要许可证密钥，以及你在 LiteLLM 开通流程中获得的计量凭证。

## 后续步骤

- [从 OSS 迁移](./moving_from_oss.md)：针对现有网关的检查清单。
- [生产环境上线](../learn/enterprise_quickstart.md)：新部署的五个步骤。
