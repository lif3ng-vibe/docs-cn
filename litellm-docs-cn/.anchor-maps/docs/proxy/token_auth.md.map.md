OIDC - JWT-based Auth | OIDC - 基于 JWT 的认证 | oidc---基于-jwt-的认证
Usage | 用法 | 用法
Step 1. Setup Proxy | 第 1 步：配置代理 | 第-1-步配置代理
Step 2. Create JWT with scopes | 第 2 步：创建带作用域的 JWT | 第-2-步创建带作用域的-jwt
Step 3. Test your JWT | 第 3 步：测试你的 JWT | 第-3-步测试你的-jwt
Advanced | 进阶 | 进阶
Multiple OIDC providers | 多个 OIDC 提供商 | 多个-oidc-提供商
How a token is validated | 令牌如何被校验 | 令牌如何被校验
Caching and failure behavior | 缓存与失败行为 | 缓存与失败行为
Per-issuer claim mapping | 按 issuer 区分的声明映射 | 按-issuer-区分的声明映射
Per-issuer fields | 按 issuer 的字段 | 按-issuer-的字段
Things to know | 需要了解的几点 | 需要了解的几点
Recommended multi-provider setup | 推荐的多提供商配置 | 推荐的多提供商配置
Provider compatibility | 提供商兼容性 | 提供商兼容性
Troubleshooting | 故障排查 | 故障排查
Kubernetes ServiceAccount Authentication | Kubernetes ServiceAccount 认证 | kubernetes-serviceaccount-认证
Prerequisites | 前置条件 | 前置条件
Step 1: Configure the OIDC Discovery URL | 第 1 步：配置 OIDC 发现 URL | 第-1-步配置-oidc-发现-url
Step 2: Configure LiteLLM | 第 2 步：配置 LiteLLM | 第-2-步配置-litellm
Step 3: Create ServiceAccount and Configure Pod | 第 3 步：创建 ServiceAccount 并配置 Pod | 第-3-步创建-serviceaccount-并配置-pod
Step 4: Create Team for Namespace | 第 4 步：为命名空间创建团队 | 第-4-步为命名空间创建团队
Step 5: Use the Token | 第 5 步：使用令牌 | 第-5-步使用令牌
Example: ServiceAccount Token Structure | 示例：ServiceAccount 令牌结构 | 示例serviceaccount-令牌结构
Advanced: Map Namespace to Team Using Name Resolution | 进阶：通过名称解析把命名空间映射到团队 | 进阶通过名称解析把命名空间映射到团队
Set Accepted JWT Scope Names | 设置接受的 JWT 作用域名称 | 设置接受的-jwt-作用域名称
Tracking End-Users / Internal Users / Team / Org | 追踪终端用户 / 内部用户 / 团队 / 组织 | 追踪终端用户--内部用户--团队--组织
Resolve by Name (Alias) Instead of ID | 按名称（别名）而非 ID 解析 | 按名称别名而非-id-解析
JWT Scopes | JWT 作用域 | jwt-作用域
Control model access with Teams | 用团队控制模型访问 | 用团队控制模型访问
Flow | 流程 | 流程
Select Team via Request Header | 通过请求头选择团队 | 通过请求头选择团队
Fall back to DB team when JWT claims don't resolve | JWT 声明无法解析时回退到数据库团队 | jwt-声明无法解析时回退到数据库团队
Custom JWT Validate | 自定义 JWT 校验 | 自定义-jwt-校验
1. Setup custom validate function | 1. 设置自定义校验函数 | 1-设置自定义校验函数
2. Setup config.yaml | 2. 配置 config.yaml | 2-配置-configyaml
3. Test the flow | 3. 测试流程 | 3-测试流程
Allowed Routes | 允许的路由 | 允许的路由
Allowing other provider routes for Teams | 为团队开放其他提供商路由 | 为团队开放其他提供商路由
Caching Public Keys | 缓存公钥 | 缓存公钥
Custom JWT Field | 自定义 JWT 字段 | 自定义-jwt-字段
Block Teams | 封禁团队 | 封禁团队
Upsert Users + Allowed Email Domains | Upsert 用户与允许的邮箱域名 | upsert-用户与允许的邮箱域名
OIDC UserInfo Endpoint | OIDC UserInfo 端点 | oidc-userinfo-端点
When to Use | 适用场景 | 适用场景
Configuration | 配置 | 配置
Flow Diagram | 流程图 | 流程图
Example: Azure AD | 示例：Azure AD | 示例azure-ad
Example: Keycloak | 示例：Keycloak | 示例keycloak
Route JWT-Shaped Machine Tokens to OAuth2 | 将 JWT 形态的机器令牌路由到 OAuth2 | 将-jwt-形态的机器令牌路由到-oauth2
Matching behavior | 匹配行为 | 匹配行为
Example: `scope` and wildcard `client_id` | 示例：`scope` 与通配符 `client_id` | 示例scope-与通配符-client_id
List-based override example | 基于列表的覆写示例 | 基于列表的覆写示例
[BETA] Control Access with OIDC Roles | [BETA] 通过 OIDC 角色控制访问 | beta-通过-oidc-角色控制访问
Example Token | 令牌示例 | 令牌示例
Role Mapping Spec | 角色映射规范 | 角色映射规范
[Architecture Diagram (Control Model Access)](./jwt_auth_arch) | [架构图（模型访问控制）](./jwt_auth_arch) | 架构图模型访问控制
[BETA] Control Model Access with Scopes | [BETA] 通过作用域控制模型访问 | beta-通过作用域控制模型访问
1. Setup config.yaml with scope mappings. | 1. 在 config.yaml 中配置作用域映射 | 1-在-configyaml-中配置作用域映射
Scope Mapping Spec | 作用域映射规范 | 作用域映射规范
2. Create a JWT with the correct scopes. | 2. 创建带正确作用域的 JWT | 2-创建带正确作用域的-jwt
3. Test the flow. | 3. 测试该流程 | 3-测试该流程
[BETA] Sync User Roles and Teams with IDP | [BETA] 与 IDP 同步用户角色和团队 | beta-与-idp-同步用户角色和团队
Use Cases | 使用场景 | 使用场景
Setup | 设置 | 设置
1. Configure JWT Role Mapping | 1. 配置 JWT 角色映射 | 1-配置-jwt-角色映射
2. JWT Role Mapping Spec | 2. JWT 角色映射规范 | 2-jwt-角色映射规范
3. Example JWT Token | 3. JWT 令牌示例 | 3-jwt-令牌示例
How It Works | 工作原理 | 工作原理
Configuration Options | 配置选项 | 配置选项
Important Notes | 注意事项 | 注意事项
Testing the Sync Feature | 测试同步功能 | 测试同步功能
[BETA] JWT-to-Virtual-Key Mapping | [BETA] JWT 到虚拟密钥映射 | beta-jwt-到虚拟密钥映射
Setup | 设置 | 设置-1
Managing Mappings | 管理映射 | 管理映射
How It Works | 工作原理 | 工作原理-1
Error Codes | 错误码 | 错误码
Bind JWTs to Registered Agents | 将 JWT 绑定到已注册的 Agent | 将-jwt-绑定到已注册的-agent
Setup | 设置 | 设置-2
Behavior | 行为 | 行为
All JWT Params | 所有 JWT 参数 | 所有-jwt-参数
