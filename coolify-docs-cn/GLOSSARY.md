# Coolify 文档汉化术语表（GLOSSARY）

> 快照：coollabsio/coolify-docs@main（2026-10-24）。一期范围：人工内容 305 页（services/CLI 生成页二期）。
> 规则：全站统一；术语首次出现附英文原词；产品/工具名不译；中英文/数字间一个半角空格；全角标点；引号用 ""。

## 一、不译名单

| 原词 | 处理 |
|---|---|
| Coolify / Coolify Cloud | 不译（产品名） |
| Coolify instance | Coolify 实例 |
| Docker / Docker Compose / Dockerfile / Docker Swarm | 不译 |
| Traefik / Caddy / Nixpacks | 不译 |
| Hetzner / GitHub / GitLab / Bitbucket / Gitea | 不译 |
| S3 / MinIO / Cloudflare / Cloudflare Tunnel | 不译 |
| OAuth / SSO / SAML / 2FA / LDAP | 不译 |
| API / CLI / MCP / OpenAPI / Swagger | 不译 |
| SSH / SSL / TLS / CDN / DNS / IP / HTTP(S) | 不译 |
| webhook | 不译（约定俗成） |
| Git / git / GitHub Actions | 不译 |
| PostgreSQL / MySQL / MariaDB / MongoDB / Redis / KeyDB / ClickHouse 等软件名 | 不译 |
| Kubernetes / Nomad / Swarm | 不译 |
| Nginx / Apache / Uptime Kuma / Grafana / Glance | 不译 |
| Plausible | 不译 |
| `.env`、环境变量名（`APP_KEY` 等）、命令、路径、配置键 | 保持原样 |

## 二、产品概念（意译，首次出现附英文）

| 英文 | 中文 | 备注 |
|---|---|---|
| self-hosted / self-hosting | 自托管 / 自托管托管？ | 统一「自托管」；self-hosting journey 译「自托管之旅」等意译 |
| server | 服务器 | |
| resource | 资源 | Coolify 里指应用/数据库/服务等条目 |
| project | 项目 | |
| environment | 环境 | development/production → 开发/生产环境 |
| application | 应用 | |
| service | 服务 | |
| one-click service | 一键服务 | |
| database | 数据库 | |
| destination | 目标（Destination） | Coolify 特有：Docker 引擎的抽象；首次出现标注 |
| deployment | 部署 | |
| deploy | 部署 | 动词同 |
| preview deployment | 预览部署 | PR 预览场景 |
| staging | 预发布 | staging deployment → 预发布部署 |
| production | 生产（环境） | |
| build | 构建 | |
| rebuild | 重新构建 | |
| rollback | 回滚 | |
| reverse proxy | 反向代理 | |
| proxy | 代理 | |
| domain | 域名 | |
| subdomain | 子域名 | |
| custom domain | 自定义域名 | |
| wildcard domain | 泛域名 | |
| container | 容器 | |
| volume | 卷（volume） | 首次标注；后文可「卷」 |
| registry | 镜像仓库 | Docker registry 语境 |
| image | 镜像 | |
| secret | 机密（Secret） | Coolify 资源类型；首次标注 |
| environment variable | 环境变量 | |
| health check / healthcheck | 健康检查 | |
| backup | 备份 | |
| restore | 恢复 | |
| scheduled task | 计划任务 | |
| log drain | 日志转发 | 指日志外发到外部服务 |
| notification | 通知 | |
| team | 团队 | |
| member | 成员 | |
| control plane | 控制平面 | Coolify Cloud 语境 |
| workload | 工作负载 | |
| firewall | 防火墙 | |
| persistent storage | 持久化存储 | |
| storage mount | 存储挂载 | |
| pre-deployment / post-deployment command | 部署前/部署后命令 | |
| multi-server | 多服务器 | |
| scaling / autoscaling | 扩展 / 自动扩缩 | |
| private key / SSH key | 私钥 / SSH 密钥 | |
| API key / token | API 密钥 / 令牌 | |
| S3 storage | S3 存储 | |
| monitoring | 监控 | |
| uptime | 在线率 | |
| port | 端口 | |
| redirect | 重定向 | |
| maintenance window | 维护窗口 | |
| onboarding | 上手引导 | 视语境意译 |
| instance | 实例 | |

## 三、UI 文案（src/components、layout）

| 英文 | 中文 |
|---|---|
| Search | 搜索 |
| Copy / Copied | 复制 / 已复制 |
| On this page | 本页内容 |
| Edit this page | 编辑此页 |
| Get started | 快速开始 |
| Resources | 资源 |
| Contribute | 参与贡献 |
| Sponsors | 赞助商 |
| Support | 支持 |
| Previous / Next | 上一篇 / 下一篇 |
| Docs | 文档 |

## 四、终检补充批次（翻译中分歧在此裁决回写）

| 术语 | 采纳译法 | 日期 |
|---|---|---|
| Tabs 组件 `items` 数组与 `<Tab value>` | **成对汉化**（value 只在本页组件内匹配，成对改不破版，与锚点中文化口径一致；**b2a 批次保留英文的页需终检回修统一**；镜像产品 UI 选项名的标签除外，如 Redirect to www 保留英文） | 2026-10-27 |
| provision（Provision Cloud Server） | 创建（云服务器） | 2026-10-27 |
| Cloud Tokens | 云令牌 | 2026-10-27 |
| Server Patching | 服务器补丁 | 2026-10-27 |
| UI 内控件/按钮/Tab 名 | 保留英文 + 括注中文（Save（保存）式）；导航路径「Settings > Authentication」译「设置 > 身份验证」 | 2026-10-27 |
