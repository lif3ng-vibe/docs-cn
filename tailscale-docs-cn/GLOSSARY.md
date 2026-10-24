# GLOSSARY — Tailscale 中文镜像术语表

翻译子代理注入材料 + 终检 grep 清单。两列表格：英文 → 中文。所有译者全站统一按此表；
「不译」条目在正文出现时原样保留（首次出现可视语境附英文原词）。

## 产品与组件（一律不译）

| 英文 | 中文 |
|---|---|
| Tailscale | 不译（产品名） |
| tailnet | tailnet（不译；全文首次可注「Tailscale 私有网络」） |
| WireGuard | 不译 |
| MagicDNS / MagicRoute | 不译（组件名） |
| Taildrop / Taildrive | 不译（组件名） |
| Tailnet Lock | 不译（组件名） |
| Tailscale Funnel | 不译（组件名）；作动词用时译「对外发布」（如 funnel a service） |
| Tailscale Serve | 不译（组件名） |
| Tailscale Services | 不译（组件名） |
| Tailscale SSH | 不译（组件名） |
| Tailscale Peer Relay / peer relay | 组件名不译；普通名词译「对等中继（peer relay）」 |
| DERP / DERP server | 不译（首次可注 Designated Encrypted Relay for Packets） |
| tailscale（CLI）/ tailscaled / tsnet / tsidp / tsrecorder | 不译（命令、守护进程、包名） |
| Aperture | 不译（产品名） |
| Tailscale PAM | 不译（首次可注「特权访问管理（PAM）」） |
| Headscale / Mullvad / Kubernetes / Docker / systemd / ufw / Proxmox | 不译（第三方名） |
| coordination server | 协调服务器（coordination server） |
| control server | 控制服务器（control server） |

## 核心概念

| 英文 | 中文 |
|---|---|
| node | 节点 |
| device | 设备 |
| machine | 机器 |
| tailnet policy file | tailnet 策略文件 |
| grant / grants | 授权（grant）；复数同译「授权」 |
| ACL (access control list) | ACL（首次附「访问控制列表」） |
| autogroup | autogroup（不译，策略语法关键字） |
| tag | 标签（tag） |
| ephemeral node | 临时节点（ephemeral node） |
| subnet router | 子网路由器 |
| exit node | 出口节点 |
| app connector | 应用连接器 |
| device posture | 设备态势（device posture） |
| route selection | 路由选择 |
| sharing / share | 共享 |
| invite | 邀请 |
| just-in-time (JIT) access | 即时访问（JIT） |
| userspace networking mode | 用户态网络模式 |
| kernel | 内核 |
| control plane / data plane | 控制平面 / 数据平面 |
| direct connection | 直连 |
| relayed connection | 中继连接 |
| NAT traversal | NAT 穿透 |
| CGNAT | 不译（首次可注「运营商级 NAT（CGNAT）」） |
| zero trust | 零信任 |
| least privilege | 最小权限 |
| post-quantum | 后量子 |

## 密钥与账户

| 英文 | 中文 |
|---|---|
| auth key | 认证密钥（auth key） |
| node key | 节点密钥（node key） |
| key expiry | 密钥过期 |
| pre-authorization key / pre-approved key | 预授权密钥 |
| trust credentials | 信任凭证（trust credentials） |
| admin console | 管理控制台 |
| billing | 账单 / 计费 |
| plan | 套餐 |
| role | 角色 |
| tailnet name | tailnet 名称 |

## 平台与集成

| 英文 | 中文 |
|---|---|
| Operator（K8s） | Operator（不译） |
| Ingress / Egress / sidecar / Connector / PeerRelay（K8s 资源名） | 不译（资源名）；sidecar 行文可注（边车） |
| GitOps | 不译 |
| infrastructure as code (IaC) | 基础设施即代码（IaC） |
| connector | 连接器 |
| MDM / MFA / 2FA / SSO / IdP / SAML / OIDC / SCIM / SCIM provisioning | 不译 |
| identity provider | 身份提供方（IdP） |
| webhook | webhook（不译） |

## 风格约定

| 英文 | 中文 |
|---|---|
| you / your | 你 / 你的 |
| Get Started | 开始使用 |
| quickstart | 快速开始 |
| Last validated <日期> | 最后验证于 <日期原样> |
| Note: / Warning: / Tip: | 注意： / 警告： / 提示： |
| egress / ingress traffic | 出站流量 / 入站流量 |
| on-premises | 本地部署 |
| deprecate | 弃用 |
