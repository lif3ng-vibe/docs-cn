✨ SSO for Admin UI | ✨ Admin UI 的 SSO 单点登录 | -admin-ui-的-sso-单点登录
Usage (Google, Microsoft, Okta, etc.) | 用法（Google、Microsoft、Okta 等） | 用法googlemicrosoftokta-等
Video Walkthrough | 视频演示 | 视频演示
Step 1: Create an OIDC Application in Okta | 第 1 步：在 Okta 中创建 OIDC 应用 | 第-1-步在-okta-中创建-oidc-应用
Step 2: Assign Users to the Application | 第 2 步：将用户分配到应用 | 第-2-步将用户分配到应用
Step 3: Set Environment Variables | 第 3 步：设置环境变量 | 第-3-步设置环境变量
Step 3a: Configure Access Policy (Custom Authorization Server only) | 第 3a 步：配置访问策略（仅限自定义授权服务器） | 第-3a-步配置访问策略仅限自定义授权服务器
Step 4: Configure Okta Security Settings | 第 4 步：配置 Okta 安全设置 | 第-4-步配置-okta-安全设置
Step 5: Test the SSO Flow | 第 5 步：测试 SSO 流程 | 第-5-步测试-sso-流程
Troubleshooting | 故障排查 | 故障排查
Default Login, Logout URLs | 默认登录与登出 URL | 默认登录与登出-url
Step 3. Set `PROXY_BASE_URL` in your .env | 第 3 步：在 .env 中设置 `PROXY_BASE_URL` | 第-3-步在-env-中设置-proxy_base_url
Step 4. Test flow | 第 4 步：测试流程 | 第-4-步测试流程
Restrict Email Subdomains w/ SSO | 用 SSO 限制邮箱子域名 | 用-sso-限制邮箱子域名
Set Proxy Admin | 设置代理管理员 | 设置代理管理员
Step 1: Copy your ID from the UI | 第 1 步：从 UI 复制你的 ID | 第-1-步从-ui-复制你的-id
Step 2: Set it in your .env as the PROXY_ADMIN_ID | 第 2 步：在 .env 中将其设为 PROXY_ADMIN_ID | 第-2-步在-env-中将其设为-proxy_admin_id
Step 3: See all proxy keys | 第 3 步：查看全部代理密钥 | 第-3-步查看全部代理密钥
Auto-add SSO users to teams (OIDC) | 自动将 SSO 用户加入团队（OIDC） | 自动将-sso-用户加入团队oidc
Step 1: Point LiteLLM at the claim containing the team ids | 第 1 步：让 LiteLLM 读取包含团队 ID 的 claim | 第-1-步让-litellm-读取包含团队-id-的-claim
Step 2: Create the teams on LiteLLM | 第 2 步：在 LiteLLM 上创建团队 | 第-2-步在-litellm-上创建团队
Step 3: Test the SSO flow | 第 3 步：测试 SSO 流程 | 第-3-步测试-sso-流程
Restrict Personal Key Creation | 限制个人密钥的创建 | 限制个人密钥的创建
Use Username, Password when SSO is on | SSO 开启时使用用户名密码登录 | sso-开启时使用用户名密码登录
Restrict UI Access | 限制 UI 访问 | 限制-ui-访问
Custom Branding Admin UI | 自定义 Admin UI 品牌外观 | 自定义-admin-ui-品牌外观
Set Custom Logo | 设置自定义 Logo | 设置自定义-logo
Or set your logo directly from Admin UI: | 或直接在 Admin UI 中设置 Logo | 或直接在-admin-ui-中设置-logo
Set Custom Color Theme | 设置自定义配色主题 | 设置自定义配色主题
Troubleshooting | 故障排查 | 故障排查
"The 'redirect_uri' parameter must be a Login redirect URI in the client app settings" Error | 报错："The 'redirect_uri' parameter must be a Login redirect URI in the client app settings" | 报错the-redirect_uri-parameter-must-be-a-login-redirect-uri-in-the-client-app-settings
Issue | 问题 | 问题
Solution | 解决方案 | 解决方案
Common Configuration Issues | 常见配置问题 | 常见配置问题
Missing Protocol in Base URL | Base URL 缺少协议 | base-url-缺少协议
Fallback Login | 回退登录 | 回退登录
Debugging SSO JWT fields | 调试 SSO JWT 字段 | 调试-sso-jwt-字段
Advanced | 进阶 | 进阶
Manage User Roles via Azure App Roles | 通过 Azure App Roles 管理用户角色 | 通过-azure-app-roles-管理用户角色
Step 1: Create App Roles on Azure App Registration | 第 1 步：在 Azure 应用注册中创建应用角色 | 第-1-步在-azure-应用注册中创建应用角色
Step 2: Assign Users to App Roles | 第 2 步：为用户分配应用角色 | 第-2-步为用户分配应用角色
Step 3: Sign in and verify | 第 3 步：登录并验证 | 第-3-步登录并验证
