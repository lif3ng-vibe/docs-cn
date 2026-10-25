Abstract | 摘要 | 摘要
Introduction | 引言 | 引言
Context | 背景 | 背景
Design goal | 设计目标 | 设计目标
Assigning trust for key distribution | 为密钥分发分配信任 | 为密钥分发分配信任
Components of Tailnet Lock | Tailnet Lock 的组件 | tailnet-lock-的组件
Tailnet Lock keys | Tailnet Lock 密钥 | tailnet-lock-密钥
The tailnet key authority | tailnet 密钥管理机构 | tailnet-密钥管理机构
Authority update messages (AUMs) | 权限更新消息（AUM） | 权限更新消息aum
Processing incremental updates | 处理增量更新 | 处理增量更新
Validation | 验证 | 验证
Processing forking updates | 处理分叉更新 | 处理分叉更新
Disablement secrets | 禁用密钥 | 禁用密钥
Lock state ID | 锁定状态 ID | 锁定状态-id
Cryptography | 密码学 | 密码学
BLAKE2 is used for generating digests of AUMs | 使用 BLAKE2 生成 AUM 摘要 | 使用-blake2-生成-aum-摘要
Ed25519 keys are used for signing operations | 使用 Ed25519 密钥执行签名操作 | 使用-ed25519-密钥执行签名操作
ZIP215 semantics are used for signature validity | 使用 ZIP215 语义判定签名有效性 | 使用-zip215-语义判定签名有效性
Argon2 is used as the disablement secret key derivation function | 使用 Argon2 作为禁用密钥的密钥派生函数 | 使用-argon2-作为禁用密钥的密钥派生函数
CBOR2 is used to encode signatures and update messages | 使用 CBOR2 编码签名与更新消息 | 使用-cbor2-编码签名与更新消息
User flows within Tailnet Lock | Tailnet Lock 中的用户流程 | tailnet-lock-中的用户流程
Enabling Tailnet Lock | 启用 Tailnet Lock | 启用-tailnet-lock
Signing node keys for new nodes | 为新节点签署节点密钥 | 为新节点签署节点密钥
Disabling Tailnet Lock | 禁用 Tailnet Lock | 禁用-tailnet-lock
Changing trusted Tailnet Lock keys | 更改受信任的 Tailnet Lock 密钥 | 更改受信任的-tailnet-lock-密钥
Recovering from a Tailnet Lock key compromise | 从 Tailnet Lock 密钥失陷中恢复 | 从-tailnet-lock-密钥失陷中恢复
Limitations | 局限性 | 局限性
Tailnet Lock protects against unauthorized nodes, not denial of service | Tailnet Lock 防御的是未授权节点，而非拒绝服务 | tailnet-lock-防御的是未授权节点而非拒绝服务
Enablement is Trust on First Use (ToFU) | 启用基于首次使用即信任（ToFU） | 启用基于首次使用即信任tofu
