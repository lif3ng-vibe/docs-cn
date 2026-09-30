# OpenShip 文档汉化术语表

> 所有翻译批次（含并行子代理）必须注入本表并严格遵守。
> 终检时按"不译名单"与"定稿译法"两列 grep 全站抽查一致性。

## 一、总原则

1. **意译优先**，技术准确第一；不逐词直译，消灭翻译腔。
2. 术语**首次出现**时附英文原词：知识图谱（knowledge graph）样式——`控制台（dashboard）`。同一页内再次出现直接用中文。
3. 排版：中文全角标点（，。：；？！、（）""）；中英文/数字之间**一个半角空格**；代码、命令、路径内保持半角。
4. 引号统一用 ""（不用「」）；破折号用——（不带空格）。
5. **粗体 CJK 闭合铁律**（CommonMark）：粗体闭合 `**` 前不能紧跟全角标点后再接文字——
   - `**……。**后文` ✗ → `**……**。后文` ✓（句读移出粗体）
   - `**标题：**正文` ✗ → `**标题**：正文` ✓
   - `**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓（括注移出粗体）

## 二、不译名单（保留原文）

产品/工具/协议/文件/命令/代码：

OpenShip、OpenShip Cloud、OpenShip Edge、Openship CLI、`openship`（命令）、GitHub、Git、Docker、Compose、docker-compose.yml、Kubernetes、k3s、Coolify、Dokploy、Dokku、Vercel、Netlify、Cloudflare、Nginx、Caddy、Traefik、Let's Encrypt、ACME、SSH、SFTP、TLS、SSL、DNS、HTTP/HTTPS、REST、JSON、YAML、TOML、URL、URI、UUID、CRON、OAuth、2FA、SSO、SAML、SDK、CLI、API、MCP、npm、pnpm、yarn、bun、Node、Node.js、Bun、Deno、PostgreSQL、Postgres、MySQL、MariaDB、MongoDB、Redis、SQLite、Valkey、MinIO、TypeScript、JavaScript、React、Next.js、Astro、Vite、Turborepo、pnpm workspace、systemd、systemctl、journalctl、ufw、iptables、fail2ban、rsync、cron、NTP、S3、R2、AWS、GCP、Azure、Hetzner、OVH、Vultr、DigitalOcean、Linear、Sentry、Resend、Postmark、SMTP、IMAP、JMAP、openship.json、package.json、CHANGELOG.md、.env、localhost、127.0.0.1、stderr、stdout、stdin

其他不译：环境变量名（`OPENSHIP_*`）、API 路径与方法（`GET /v1/projects`）、配置键、代码块整体、命令及其参数、报错原文、TypeTable 的 `type`/`default` 列、`Tab` 的 `value` 属性值、代码注释（`#` 与 `//`——**CLI 命令清单里 `#` 注释要译**）、frontmatter 的键名。

## 三、核心术语定稿

| 英文 | 中文 | 备注 |
|---|---|---|
| server | 服务器 | 用户自己的物理机/VPS |
| project | 项目 | |
| service | 服务 | |
| app | 应用 | 泛指部署的应用 |
| deploy（动词） | 部署 | |
| deployment | 部署 | 一次部署记录/部署对象 |
| redeploy | 重新部署 | |
| rollback | 回滚 | |
| build | 构建 | |
| release | 发布 | |
| source | 源 | git source → Git 源 |
| git provider | Git 提供方 | GitHub/GitLab 等 |
| template | 模板 | |
| app catalog | 应用目录 | |
| deploy from GitHub | 从 GitHub 部署 | |
| auto-deploy | 自动部署 | |
| preview environment | 预览环境 | |
| environment variable(s) | 环境变量 | |
| domain | 域名 | |
| subdomain | 子域名 | |
| wildcard domain | 泛域名 | |
| DNS | DNS | 不译 |
| certificate | 证书 | TLS 证书 |
| proxy | 代理 | 反向代理 → 反向代理 |
| edge | 边缘 | OpenShip Edge 是功能名保留原文；泛指"边缘网络" |
| CDN | CDN | 不译 |
| network | 网络 | |
| cluster | 集群 | |
| scale（动词） | 扩缩容 | scale up → 扩容；scale to zero → 缩容到零 |
| scaling | 扩缩容 | |
| stateless | 无状态 | |
| stateful | 有状态 | |
| replica | 副本 | |
| container | 容器 | |
| image | 镜像 | 容器镜像 |
| registry | 镜像仓库 | 容器镜像仓库语境 |
| volume | 卷 | 存储卷 |
| persistent storage | 持久化存储 | |
| backup | 备份 | |
| restore | 恢复 | |
| backup destination | 备份目标 | |
| retention | 保留策略 | |
| snapshot | 快照 | |
| migration | 迁移 | 数据库迁移/服务器迁移均译迁移 |
| data transfer | 数据传输 | |
| control plane | 控制面 | |
| log | 日志 | |
| monitoring | 监控 | |
| metric | 指标 | |
| alert | 告警 | |
| notification | 通知 | |
| health check | 健康检查 | |
| uptime | 在线率 | |
| status | 状态 | |
| job | 任务 | 定时任务/后台任务 |
| cron | 定时任务 | cron 表达式语境保留 cron |
| webhook | Webhook | 首次附注（网络回调） |
| event | 事件 | |
| audit | 审计 | |
| token | 令牌 | API token → API 令牌 |
| credential | 凭据 | |
| permission | 权限 | |
| role | 角色 | |
| team | 团队 | |
| member | 成员 | |
| dashboard | 控制台 | OpenShip 的 Web 管理界面 |
| admin panel | 管理面板 | 服务器本地的管理界面 |
| billing | 计费 | |
| credit | 点数 | OpenShip Cloud 计费点数 |
| plan | 套餐 | free plan → 免费套餐 |
| subscription | 订阅 | |
| invoice | 账单 | |
| complimentary | 免费赠送的 | complimentary plan → 免费赠送套餐 |
| cloud | 云 | OpenShip Cloud 产品名不译；泛指"云端" |
| self-host(ed) | 自托管 | self-hosted → 自托管的 |
| on-premises | 本地机房 | |
| cold start | 冷启动 | |
| sleep mode | 休眠模式 | |
| idle | 空闲 | |
| resource | 资源 | |
| workspace | 工作区 | |
| runtime | 运行时 | |
| region | 区域 | |
| capacity | 容量 | |
| quota | 配额 | |
| limit | 限制 | 速率限制/资源限制 |
| rate limit | 速率限制 | |
| server-to-server | 服务器到服务器 | |
| migration (server) | 迁移 | |
| control-plane migration | 控制面迁移 | |
| custom server | 自定义服务器 | 带入自己的机器 |
| bring your own | 自带 | |
| terminal | 终端 | |
| CLI reference | CLI 参考 | |
| API reference | API 参考 | |
| quickstart | 快速开始 | |
| getting started | 快速上手 | 标题语境 |
| troubleshooting | 故障排查 | |
| best practice | 最佳实践 | |
| guide | 指南 | |
| overview | 总览 | |
| architecture | 架构 | |
| module | 模块 | |
| note/tip/warning/caution | 提示/技巧/注意/警告 | Callout title 按语义选 |
| step | 步骤 | |
| requirement | 前置要求 | |
| prerequisite | 前提条件 | |

## 四、易错风格点

| 场景 | 统一写法 |
|---|---|
| "your server" | 你的服务器（不用"您的"） |
| "点击/前往" 链接引导 | "参见"/"前往" |
| OpenShip 拟人比喻（kitchen 等） | 保留比喻但自然汉化，不生硬 |
| "spin up" | 启动/拉起 |
| "out of the box" | 开箱即用 |
| "under the hood" | 底层实现上 |
| "fall back" | 回退 |
| "teardown/tear down" | 拆除/销毁 |
| "provision" | 开通/置备 |
| "stream/streaming" | 流式 |
| "handy/convenient" | 方便 |
| "note that ..." | 注意：…… |
| 列表句尾 | 名词短语不带句号；完整句带句号 |

## 五、终检补充批次（终检时分歧定稿后回写此处）

| 术语 | 分歧译法 | 定稿 |
|---|---|---|
| （待终检填充） | | |
