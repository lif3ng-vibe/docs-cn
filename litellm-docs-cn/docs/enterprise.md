---
title: 企业版
hide_title: true
description: LiteLLM 企业版在开源 AI 网关之上加入 SSO、审计日志、委派管理角色、多区域部署与支持 SLA，全部自托管在你的云环境中。
---

import {EnterpriseHero, TierStack} from '@site/src/components/Conversion/Enterprise';
import {Tiles, SalesBand} from '@site/src/components/Conversion';

<EnterpriseHero />

## 开源版之上还能获得什么

企业版就是一把许可证密钥（license key），直接用于你可能已在运行的同一个网关镜像。无需迁移任何东西：每一层都包含其下所有层级的功能。

<TierStack />

## 给组织带来哪些改变

<Tiles size="lg" columns={3} items={[
  {icon: 'compliance', title: '经审计的安全，可直接交给评审团队', text: '通过 SOC 2 Type II 审计，自托管部署保证数据不出你的环境，Docker 镜像带签名、可自行校验。', to: 'https://trust.litellm.ai/', more: '校验签名镜像', moreTo: '/docs/proxy/docker_image_security'},
  {icon: 'sso', title: '所有人都通过你的身份提供商登录', text: '支持 Okta、Entra ID、Google Workspace 或任何 OIDC、SAML 提供商的 SSO 与 SCIM，访问权限完全跟随你的组织架构。', to: '/docs/proxy/admin_ui_sso'},
  {icon: 'audit', title: '每一步管理操作都有据可查', text: '密钥、团队与模型变更均有审计日志，保留策略由你的合规团队自行设定。', to: '/docs/proxy/multiple_admins'},
  {icon: 'budget', title: '团队自主管理密钥与预算', text: '团队管理员无需主密钥（master key），即可按项目、标签和模型管理密钥、模型与预算，触及上限前还会收到告警。', to: '/docs/proxy/access_control'},
  {icon: 'secrets', title: '提供商密钥留在你自己的保管库', text: '支持 AWS、Azure、Google、HashiCorp Vault 与 CyberArk 密钥管理器，虚拟密钥（virtual key）自动轮换。', to: '/docs/secret_managers/overview'},
  {icon: 'support', title: '工程师随时待命', text: '与构建 LiteLLM 的工程师直连专属 Slack 或 Teams 频道，24/7 SLA 响应最快 1 小时。', to: '/docs/enterprise/support'},
]} />

<SalesBand source="enterprise-page-mid" title="在你的自有基础设施上跑起来" text="与团队聊聊你的上线计划和安全评审，并以完整许可开启 30 天试用。" />

## 企业版适合谁？

适合大规模运行 LiteLLM 的团队（100 人以上用户，或 10 个以上生产级 AI 场景），需要在开源版之上获得 SSO、审计日志、细粒度访问控制与专业支持。SSO 对 5 名以内用户免费；超出则需要企业版许可证。正在做试用评估的工程师可参考[生产环境上线](/docs/learn/enterprise_quickstart)指南，已在用开源版的团队可以从[从 OSS 迁移](/docs/enterprise/moving_from_oss)入手。

## 完整功能清单 {#full-feature-list}

以下功能均由许可证密钥解锁，每一项都附有对应的配置指南。

### 安全与访问

- **[管理界面（Admin UI）的 SSO](./proxy/admin_ui_sso.md)**。支持 Okta、Azure AD、Google Workspace 及任何 OIDC/SAML 提供商
- **[基于 JWT 的身份验证](./proxy/token_auth.md)**。用你身份提供商的令牌完成请求认证
- **[带保留策略的审计日志](./proxy/multiple_admins.md)**。追踪每一项管理操作与密钥级变更
- **[基于角色的访问控制](./proxy/access_control.md)**。组织、团队与用户角色
- **[公开与私有路由控制](./proxy/public_routes.md)**。限制管理路由，收窄暴露面
- **[基于 IP 地址的访问控制列表](./proxy/ip_address.md)**。将代理访问限制在指定 CIDR 网段
- **[密钥轮换](./proxy/virtual_keys.md#-密钥轮换)**。自动轮换虚拟密钥
- **[密钥管理器（secret manager）](./secret_managers/overview.md)**。AWS KMS、AWS Secrets Manager、Azure Key Vault、Google KMS、Google Secret Manager、HashiCorp Vault、CyberArk，或自定义密钥管理器
- **[AI Hub](./proxy/ai_hub.md)**。对外分享一个带品牌标识的公开页面，展示可用的模型、MCP 服务器、智能体与技能

### 治理与成本

- **[多租户架构](./proxy/multi_tenant_architecture.md)**。组织、团队、项目与密钥
- **[项目管理](./proxy/project_management.md)**。按应用或用例给密钥分组，配齐预算、负责人、速率限制、模型白名单与独立的花费视图。参见[界面导览](./proxy/ui_project_management.md)
- **[基于标签的预算](./proxy/provider_budget_routing.md)**。按自定义标签做预算与花费追踪
- **[虚拟密钥的按模型预算](./proxy/users.md)**。每个模型、每把密钥都能设不同限额
- **[临时提高预算](./proxy/temporary_budget_increase.md)**。限时上调花费额度，不做永久变更
- **[软预算邮件告警](./proxy/ui_team_soft_budget_alerts.md)**。在团队触及硬性上限前发出预警
- **[生成花费报告](./proxy/cost_tracking.md#企业版生成花费报告)**。以编程方式按密钥、团队、标签或模型查询花费

### 可观测性与合规

- **[SOC 2 Type II](https://trust.litellm.ai/)**。控制措施经过审计，报告可通过 Trust Center 索取
- **[按团队配置日志](./proxy/team_logging.md)**。把每个团队的日志路由到各自的 Langfuse 项目或回调
- **[按团队关闭日志](./proxy/team_logging.md#为团队禁用日志)**。团队级退出日志记录，满足 GDPR 要求
- **[日志导出到 GCS / Azure Blob](./observability/gcs_bucket_integration.md)**。持久化存储，方便合规留存
- **[按密钥/团队配置防护栏（guardrails）](#guardrails-oss-vs-enterprise)**。敏感信息脱敏、内容审核、违禁词过滤
- **强制必填参数**。拒绝缺少必需元数据的请求

### 运维与品牌定制 {#operations--branding}

- **自定义 Swagger 品牌**。在 API 文档页设置你自己的标题、描述与要展示的路由
- **[自定义邮件品牌](./proxy/email.md#邮件自定义)**。系统邮件带上你的 Logo 与配色
- **请求/响应大小上限**。防止失控的超大负载拖垮代理
- **[团队自管模型](./proxy/team_model_add.md)**。让团队自带密钥与微调模型

### 哪些防护栏需要许可证？ {#guardrails-oss-vs-enterprise}

开源版防护栏框架自带自定义防护栏，以及用于个人身份信息（PII）脱敏的 Presidio。以下内置回调集成则需要 LiteLLM 企业版许可证：`llmguard_moderations`、`llamaguard_moderations`、`hide_secrets`、`openai_moderations`、`google_text_moderation`、`lakera_prompt_injection` 和 `aporia_prompt_injection`。

## 部署运行

在你的自有基础设施上部署 Docker 镜像，或用 pip 包自行构建。许可证密钥可解锁上述全部功能，并附带专属支持频道。

```env
LITELLM_LICENSE="eyJ..."
```

数据不会离开你的环境，LiteLLM 也已通过 [SOC 2 Type II](https://trust.litellm.ai/) 审计。[可经由 AWS Marketplace 与 Azure Marketplace 采购。](./data_security.md#法律合规常见问题)

价格取决于你的部署规模。[联系我们](https://enterprise.litellm.ai/demo)评估具体方案。

## 支持 {#professional-support}

每份许可证都附带与工程团队直连的专属 Slack 或 Teams 频道。选购可选的 24/7 SLA 后，Sev 0 级事件响应时间为 1 小时，安全补丁为 72 小时。服务时间、完整严重级别表与定制 SLA 见[支持与 SLA](/docs/enterprise/support)。

## 版本支持

LiteLLM 支持最近四个稳定次版本线，且企业版与开源版共用同一镜像、同一版本号。详见[版本支持](/docs/enterprise/version_support)。

## 常见问题

<details>
<summary>

### 如何设置并验证企业版许可证？

</summary>

把许可证密钥写入环境变量，然后重启代理。

```env
LITELLM_LICENSE="eyJ..."
```

打开 `http://<your-proxy-host>:<port>/`。API 文档页的描述里应显示 **Enterprise Edition** 字样。如果没有，请确认密钥正确且未过期，并确认代理已完整重启。

</details>

<details>
<summary>

### LiteLLM 是否通过 SOC 2 认证？

</summary>

是的。LiteLLM 已通过 SOC 2 Type II 审计，最新报告可通过 [LiteLLM Trust Center](https://trust.litellm.ai/) 索取。数据处理、漏洞报告及其余安全评审事项，见[数据安全、法律与合规常见问题](./data_security.md)。

</details>

<details>
<summary>

### 可以通过 AWS 或 Azure Marketplace 购买吗？

</summary>

可以。企业版许可证可通过 AWS Marketplace 或 Azure Marketplace 购买，也支持直接对公发票采购。详见[采购方式](./data_security.md#法律合规常见问题)。

</details>

<details>
<summary>

### 在哪里可以进一步了解数据安全与合规？

</summary>

参见[数据安全、法律与合规常见问题](./data_security.md)。

</details>

<details>
<summary>

### 定价如何计算？

</summary>

定价基于用量。[联系我们](https://enterprise.litellm.ai/demo)获取针对你团队的报价。

</details>

<details>
<summary>

### 如何不重启就获得新模型的 day-0 支持？

</summary>

使用[自动同步新模型](./proxy/sync_models_github.md)，按需或定时从 GitHub 拉取最新的价格与上下文窗口数据，全程无需重启。用 `POST /reload/model_cost_map` 手动触发一次同步，或用 `POST /schedule/model_cost_map_reload?hours=6` 定时同步。

</details>

<SalesBand source="enterprise-page-bottom" />
