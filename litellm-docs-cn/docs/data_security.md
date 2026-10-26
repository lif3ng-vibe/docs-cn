# 数据隐私与安全

在 LiteLLM，**保障你的数据隐私与安全**是我们的头等大事。我们深知你与我们分享的数据至关重要，并以最高标准的严谨态度加以对待。

## 安全措施

### LiteLLM 自托管实例

- **自托管时，LiteLLM 服务器不存储任何数据或遥测信息**
- 安装与配置请参见：[自托管指南](../docs/proxy/deploy.md)
- **遥测**：自托管 LiteLLM 时，我们不运行任何遥测

如有安全方面的疑问，请发送邮件至 support@berri.ai 与我们联系。

## 个人数据的收集

### 针对自托管 LiteLLM 的用户：
- 自托管本软件时，LiteLLM 不收集任何个人数据，也不会向 LiteLLM 服务器传输数据。
- 产生或处理的任何数据都完全保留在你自己的基础设施内。

## Cookie 信息、安全与隐私

### 针对自托管 LiteLLM 的用户：
- Cookie 数据完全保留在你自己的基础设施内。
- LiteLLM 只使用极少量的 Cookie，唯一目的是让代理（Proxy）用户能够访问 LiteLLM 管理界面（Admin UI）。
- 这些 Cookie 在你登录后存储于浏览器中。
- 我们不将 Cookie 用于广告、追踪或登录会话维护之外的任何用途。
- 所用 Cookie 仅用于维持应用 UI 的用户认证与会话管理。
- 会话 Cookie 会在你关闭浏览器、注销或满 24 小时后过期。
- LiteLLM 不使用任何第三方 Cookie。
- Admin UI 会读取该 Cookie 来验证你的登录会话。
- 该 Cookie 以 JWT 形式存储，系统的其他任何部分都无法访问它。
- 我们（LiteLLM）不会出于任何其他目的访问或共享这些 Cookie 数据。

## 安全漏洞报告指南

我们高度重视安全社区在保护我们的系统与用户方面发挥的作用。

正式的漏洞披露政策见 [LiteLLM 仓库中的 `security.md`](https://github.com/BerriAI/litellm/blob/main/security.md)，其中包含我们的漏洞赏金计划信息。

报告漏洞的首选渠道是通过 [GitHub Security Advisories](https://github.com/BerriAI/litellm/security/advisories/new) 提交私密漏洞报告。如果无法使用 GitHub，把同样的细节发邮件至 [support@berri.ai](mailto:support@berri.ai) 也可以，只是处理起来可能更慢。

请注意：为抵御低质量的 AI 垃圾报告，所有漏洞报告都必须附上视频或屏幕录像，完整演示漏洞的利用过程。

## 漏洞扫描

- LiteLLM 对所有构建出的 Docker 镜像运行 [`grype`](https://github.com/anchore/grype) 安全扫描。
    - 参见 [ci/cd 上的 `grype litellm` 检查](https://github.com/BerriAI/litellm/blob/main/.circleci/config.yml#L1099)。
    - 当前状态：✅ 通过。未发现高危/严重级别漏洞。

## 法律/合规常见问题

### 采购方式

1. 开具发票
2. AWS Marketplace
3. Azure Marketplace


### 供应商信息

法定实体名称：Berrie AI Incorporated

安全事件联系人邮箱：krrish@berri.ai

一般安全问题联系人邮箱：krrish@berri.ai

供应商是否已通过审计/认证？
- SOC 2 Type II。我们当前的报告可通过 [LiteLLM Trust Center](https://trust.litellm.ai/) 获取。

是否已实施信息安全管理体系（ISMS）？
- 是。我们使用 [CodeQL](https://codeql.github.com/)，并建立了覆盖多个安全领域的 ISMS。

是否记录关键事件（认证、创建、更新变更）的日志？
- 是。我们提供[审计日志](https://docs.litellm.ai/docs/proxy/multiple_admins#1-switch-on-audit-logs)。

供应商是否已建立网络安全事件管理机制？
- 是。事件响应政策可按需提供。


供应商是否制定了漏洞披露政策？[有](https://github.com/BerriAI/litellm?tab=security-ov-file#security-vulnerability-reporting-guidelines)

供应商是否执行漏洞扫描？
- 是。我们定期执行漏洞扫描，详见[漏洞扫描](#漏洞扫描)一节。

签署人姓名：Krish Amit Dholakia

签署人邮箱：krrish@berri.ai
