---
title: 合规与 SOC 2 Type II
description: LiteLLM 已通过 SOC 2 Type II 审计。您可以从 Trust Center 获取审计报告，并在本页找到安全审查所需的答案，涵盖数据处理、镜像签名与漏洞管理。
---

# 合规与 SOC 2 Type II

LiteLLM 已通过 SOC 2 Type II 审计。本页帮助您收集安全审查所需的文档与答案。

## 获取 SOC 2 Type II 报告

请通过 [LiteLLM Trust Center](https://trust.litellm.ai/) 获取最新报告。

## 数据保留在您的环境中

LiteLLM 网关部署在您自己的环境中。自托管时，LiteLLM 不会在 LiteLLM 服务器上存储数据或遥测数据，网关处理的数据始终留在您的基础设施内。参见[数据隐私与安全](../data_security.md)。

部分企业版（Enterprise）功能会连接到 LiteLLM。[计费请求计量](../proxy/billing_metrics.md)仅向 LiteLLM 采集器发送成功请求的数量，提示词、响应、虚拟密钥（virtual key）与您的许可证密钥都不会离开部署环境。许可证校验通过 LiteLLM 许可证服务器完成，也可以使用签名负载离线校验。参见[跨区域许可](../proxy/multi_region.md#跨区域许可)。

## 验证您运行的镜像

自 v1.83.0 起，LiteLLM 使用 cosign 为 GHCR 上的每个 Docker 镜像签名。您可以在部署镜像前验证签名，也可以在 CI/CD 流水线中强制执行该校验。参见[验证镜像签名](../proxy/docker_image_security.md)。

## 漏洞管理

LiteLLM 会对构建的所有 Docker 镜像运行 `grype` 扫描。如需报告漏洞，请使用 [GitHub Security Advisories](https://github.com/BerriAI/litellm/security/advisories/new)。完整政策见 LiteLLM 仓库中的 [`security.md`](https://github.com/BerriAI/litellm/blob/main/security.md)。

对于重大安全更新，LiteLLM 会在公开披露前 7 天向企业版客户发送邮件通知。参见[安全最佳实践](../proxy/security_best_practices.md#1-监控安全邮件并及时升级)。安全补丁的响应时限见[支持与 SLA](./support.md)。

## 安全问卷参考答案

以下页面汇总了安全团队最常索取的答案：

- [数据隐私与安全](../data_security.md)：数据收集、Cookie、漏洞报告、采购方案与供应商信息。
- [共同责任](../shared_responsibility.md)：哪些问题由 LiteLLM 负责，哪些由您负责。
- [安全与加密常见问题](../proxy/security_encryption_faq.md)：传输中与静态数据的加密。
- [OWASP LLM Top 10](../proxy/security_owasp_llm_top10.md)：LiteLLM 针对 OWASP 各风险项的防护措施，以及每项措施的局限。
- [审计日志](../proxy/multiple_admins.md)：管理员对密钥、团队和模型变更的记录。

若这些页面未能解答您的问题，可以[预约演示](https://enterprise.litellm.ai/demo)，或到您的企业版支持渠道提问。
