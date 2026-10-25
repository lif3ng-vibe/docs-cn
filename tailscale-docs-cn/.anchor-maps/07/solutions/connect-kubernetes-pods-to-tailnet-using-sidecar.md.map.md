Prerequisites | 前提条件 | 前提条件
Step 1: Persist state to avoid re-registrations | 第 1 步：持久化状态以避免重复注册 | 第-1-步持久化状态以避免重复注册
(Recommended) Use a Kubernetes Secret | （推荐）使用 Kubernetes Secret | 推荐使用-kubernetes-secret
(Optional) Persistent volume | （可选）持久卷 | 可选持久卷
(Optional) Preserve container states | （可选）保留容器状态 | 可选保留容器状态
Step 2: Configure RBAC for Secret state storage | 第 2 步：为 Secret 状态存储配置 RBAC | 第-2-步为-secret-状态存储配置-rbac
Step 3: Authenticate the sidecar | 第 3 步：对 sidecar 进行认证 | 第-3-步对-sidecar-进行认证
(Alternative) Use a static auth key | （替代方案）使用静态认证密钥 | 替代方案使用静态认证密钥
(Alternative) Use workload identity federation | （替代方案）使用工作负载身份联合 | 替代方案使用工作负载身份联合
Step 4: Handle DNS in the pod | 第 4 步：处理 pod 中的 DNS | 第-4-步处理-pod-中的-dns
(Optional) Accept DNS using split DNS | （可选）使用拆分 DNS 接受 DNS | 可选使用拆分-dns-接受-dns
(Optional) Disable DNS takeover | （可选）禁用 DNS 接管 | 可选禁用-dns-接管
Step 5: Harden the sidecar | 第 5 步：加固 sidecar | 第-5-步加固-sidecar
Security context | 安全上下文 | 安全上下文
Tag-based access control | 基于标签的访问控制 | 基于标签的访问控制
Restrict inbound traffic | 限制入站流量 | 限制入站流量
Prevent route conflicts from breaking in-cluster networking | 防止路由冲突破坏集群内网络 | 防止路由冲突破坏集群内网络
How routing works | 路由的工作原理 | 路由的工作原理
Verify your tailnet before deploying | 部署前验证你的 tailnet | 部署前验证你的-tailnet
Step 6: Deploy the sidecar | 第 6 步：部署 sidecar | 第-6-步部署-sidecar
Step 7: (Optional) Configure health checks and observability | 第 7 步：（可选）配置健康检查与可观测性 | 第-7-步可选配置健康检查与可观测性
Troubleshooting | 故障排除 | 故障排除
Further exploration | 进一步探索 | 进一步探索
