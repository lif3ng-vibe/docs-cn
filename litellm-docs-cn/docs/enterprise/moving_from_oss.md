---
title: 从 OSS 迁移
description: 将开源版 LiteLLM 网关升级为 LiteLLM 企业版。镜像、config.yaml 与版本号都保持不变。在向公司所有团队开放网关之前，先用这份清单做一遍检查。
---

# 从 OSS 迁移

迁移到企业版后，你现有的一切都保持原样：镜像、`config.yaml` 文件和版本号都不用动。只需要在现有网关上添加一个许可证密钥（license key）。你的密钥、团队、模型和花费数据都保留在自己的数据库里。

在向公司内所有团队开放网关之前，请先过一遍本页的检查清单。其中大部分条目对开源版部署同样适用。

## 迁移前检查清单

### 1. 运行 Postgres 和 Redis

管理界面（Admin UI）、虚拟密钥（virtual key）、MCP 与 agent 注册表，以及预算追踪，都把数据存在 Postgres 里。请为每个网关实例设置 `DATABASE_URL`。

当运行不止一个网关实例或不止一个 worker 时，需要 Redis 7.0 或更高版本。Redis 会在实例之间共享速率限制计数器、预算和缓存命中。没有 Redis 时，各实例只能各自独立执行限制。参见[哪些场景需要 Redis](../proxy/redis_requirements.md)与[生产环境最佳实践](../proxy/prod.md#redis)。

### 2. 添加许可证密钥

在每个网关实例上设置 `LITELLM_LICENSE` 并重启实例，然后确认 API 文档页面显示 **Enterprise Edition**。参见[激活许可证](./activate.md)。

### 3. 在开放 Admin UI 之前先配置 SSO

默认情况下，管理界面允许用 `UI_USERNAME` 和 `UI_PASSWORD` 登录，也允许用主密钥（master key）登录。凡是知道这些值的人都能以代理管理员身份登录，而且审计日志无法识别具体是哪个人。

1. 接入你的身份提供商（identity provider）。参见 [Admin UI 的 SSO](../proxy/admin_ui_sso.md)。
2. 确认每位管理员都能通过 SSO 登录。
3. 在 `general_settings` 中设置 `disable_env_credential_login: true`。
4. 重启网关。

参见[关闭环境变量凭据登录](../proxy/security_best_practices.md#禁用环境变量凭据登录管理界面admin-ui)。

### 4. 轮换主密钥

如果代理管理员之外的人也知道主密钥，请在上线生产环境之前换一个新主密钥。

如果你设置过 `LITELLM_SALT_KEY`，主密钥就只是一个管理员凭据，直接更换密钥并重启实例即可。如果没有设置 salt key，主密钥还会加密存储的凭据，这时就必须走完整的轮换流程。参见[轮换主密钥](../proxy/master_key_rotations.md)。

添加模型之后，不要再改动 `LITELLM_SALT_KEY`。参见[设置 salt key](../proxy/prod.md#设置-salt-key)。

### 5. 加固部署

部署前固定确切的版本号或镜像 digest，并[验证镜像签名](../proxy/docker_image_security.md)。为你的 ingress 设置 `trusted_proxy_ranges`。给应用发放带作用域的虚拟密钥，而不是主密钥。参见[安全最佳实践](../proxy/security_best_practices.md)。

### 6. 邀请团队之前先设置预算

为每个团队设置预算，并开启软预算告警（soft budget alerts），让团队在触及上限之前先收到邮件提醒。参见[预算与速率限制](../proxy/users.md)、[团队预算](../proxy/team_budgets.md)和[软预算告警](../proxy/ui_team_soft_budget_alerts.md)。

## 后续步骤

- [生产环境上线](../learn/enterprise_quickstart.md)：从部署到费用分摊的五个步骤。
- [版本支持](./version_support.md)：LiteLLM 支持的发布版本线。
- [支持与 SLA](./support.md)：如何获得 LiteLLM 工程团队的帮助。
