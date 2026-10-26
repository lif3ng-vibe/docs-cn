---
title: 共同责任模型
description: 自托管网关时 LiteLLM 与你各自承担的责任，以及如何判断一个问题归哪一方。
---

# 共同责任模型

自托管 LiteLLM 时，软件由你来运行，而构建由我们负责。这条分界线决定了出了问题谁来排查。本文说明哪些问题归我们、哪些归你，让问题报告能送达正确的团队。

简而言之：产品在本站所记载的行为归我们，产品运行所在的环境以及你附加进去的任何代码归你。

| 范围 | 责任方 |
| --- | --- |
| 文档所载功能与端点的行为正确性 | LiteLLM |
| 文档所载功能集内的内存泄漏、挂起等稳定性问题 | LiteLLM |
| 文档所载的提供商格式转换、成本追踪（cost tracking）与路由行为 | LiteLLM |
| 安全补丁，以及官方 Docker 镜像与 Helm chart | LiteLLM |
| 你的实例及其底层基础设施的可用性 | 你 |
| 自定义回调、自定义防护栏（guardrails）、自定义认证（custom auth），以及你注入的其他代码 | 你 |
| 偏离我们推荐部署方式（自建 Dockerfile、chart 或基础镜像）导致的基础设施问题 | 你 |
| 你自己的补丁在 fork 上引入、上游并不存在的 bug | 你 |
| 你的提供商账户、配额（quota）与提供商侧的故障 | 你 |

## 我们负责的部分

我们负责让产品正常工作。本站收录的每个功能都应与文档描述一致；如果不一致，那就是我们的 bug，你可以[提交 issue](https://github.com/BerriAI/litellm/issues)，或通过你的企业版支持渠道反馈。

这份责任不止于正确性，也包括稳定性。在文档所载功能集范围内，内存增长、文件描述符或连接泄漏、死锁、挂起以及吞吐量回退，都由我们负责诊断和修复。这同样覆盖你打交道的各类接口：公共 HTTP 接口由 [API 稳定性策略](./api_stability_policy.md)约束，版本编号以及补丁版或小版本升级意味着什么，见[发布周期](./proxy/release_cycle.md)；beta 功能转入企业版的规则，见[迁移政策](./migration_policy.md)。我们维护[生产部署](./proxy/deploy.md)中介绍的官方 Docker 镜像、Helm chart 与 Terraform 模块，并为[受支持的版本区间](./enterprise/version_support.md)发布安全补丁。

如果你使用的版本线已到生命周期终点，我们建议第一步先升级，确保用上最新的 bug 修复与安全补丁。

## 你负责的部分

除了应用自身的稳定性缺陷之外，让实例保持可用是你的责任。这包括容量规划与规格选型、重启与发布、健康检查与自动伸缩，以及 Postgres、Redis、网络和编排器的健康状况。[生产最佳实践](./proxy/prod.md)、[数据库容量规划](./proxy/db_sizing.md)与 [Redis 容量规划](./proxy/redis_sizing.md)给出了我们推荐的配置与容量设定，[健康检查端点](./proxy/health.md)则可供你的探针使用。

你向网关引入的自定义代码同样由你负责。[自定义回调](./observability/custom_callback.md)、[自定义防护栏](./proxy/guardrails/custom_guardrail.md)、[自定义认证](./proxy/custom_auth.md)、[自定义 SSO](./proxy/custom_sso.md)、[钩子（hooks）](./proxy/call_hooks.md)与[插件](./proxy/plugins.md)都在代理进程中执行，因此这些代码里的一次阻塞调用、一个无上限的缓存或一个泄漏的客户端，都可能表现为代理延迟升高、内存增长或挂起，即便代理本身完全正常。处理器的逻辑，以及它的性能与内存表现，归你所有。套在网关外面的东西也一样，包括 sidecar、前置代理，以及会改写请求的额外中间件。

运行 fork 也是同样的道理。同一个 bug 在相同版本的原生上游代码上也能复现，那排查和修复就确凿归我们；如果你的补丁引入了 bug，那归你，在 rebase 到新版本时让这些补丁继续可用同样是你的事。如果你是因为上游缺少某个能力才打补丁绕过，欢迎提交 issue 或以 pull request 形式发来补丁；只要算得上通用改进，我们很乐意收进上游。

另外，如果你的部署方式没有走我们推荐的路径，这条路径的维护责任就归你。很多团队构建自己的镜像、编写自己的 chart、更换基础镜像或 Python 版本、固定自己的依赖集合，或者使用自己的进程管理器并自行决定 worker 数量。这属于受支持的使用方式，但也意味着构建失败、缺少系统库、依赖不匹配、容器内存限制导致的 OOMKill、worker 数量配置不当等问题都由你承担。参见：

- [生产部署](./proxy/deploy.md)
- [Docker 快速上手](./proxy/docker_quick_start.md)
- [服务器调优](./proxy/server_tuning.md)

## 向我们提交 Issue

请附上以下信息：

1. LiteLLM 版本号
2. 部署方式
3. 脱敏后的配置
4. 确切发出的请求
5. 开启[详细调试日志](./proxy/debugging.md)后得到的完整报错或 traceback
6. 稳定性问题报告建议附上内存或延迟随时间变化的曲线、请求速率，以及 worker 与容器限额
7. 内存与延迟问题建议附上 [Pyroscope 性能分析](./proxy/pyroscope_profiling.md)结果

bug 与功能请求请提交为 [GitHub issue](https://github.com/BerriAI/litellm/issues)。企业版客户也可以使用专属支持渠道。服务时间与 SLA 选项见[支持与 SLA](./enterprise/support.md)。
