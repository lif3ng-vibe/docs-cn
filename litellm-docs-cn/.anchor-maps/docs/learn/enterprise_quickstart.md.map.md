Step 1. Deploy LiteLLM | 步骤 1：部署 LiteLLM | 步骤-1部署-litellm
Critical deployment settings | 关键部署设置 | 关键部署设置
Prerequisites | 前提条件 | 前提条件
Deploy the gateway | 部署网关 | 部署网关
1. Create a ConfigMap for `config.yaml` | 1. 为 `config.yaml` 创建 ConfigMap | 1-为-configyaml-创建-configmap
2. Create a Secret for keys | 2. 为密钥创建 Secret | 2-为密钥创建-secret
3. Create `deployment.yaml` | 3. 创建 `deployment.yaml` | 3-创建-deploymentyaml
4. Create `service.yaml` | 4. 创建 `service.yaml` | 4-创建-serviceyaml
5. Start the server | 5. 启动服务器 | 5-启动服务器
1. Create a Secret for your license + provider keys | 1. 为许可证与提供商密钥创建 Secret | 1-为许可证与提供商密钥创建-secret
2. Create `values-enterprise.yaml` | 2. 创建 `values-enterprise.yaml` | 2-创建-values-enterpriseyaml
3. Deploy with Helm | 3. 使用 Helm 部署 | 3-使用-helm-部署
4. Expose the service to localhost | 4. 将服务暴露到本地 | 4-将服务暴露到本地
Verify Enterprise Edition | 验证企业版 | 验证企业版
Step 2. Give access to models, MCP tools, and agents | 步骤 2：授予模型、MCP 工具与智能体的访问权限 | 步骤-2授予模型mcp-工具与智能体的访问权限
2a. Add providers and models | 2a. 添加提供商与模型 | 2a-添加提供商与模型
2b. Create an organization, a team, and a virtual key | 2b. 创建组织、团队与虚拟密钥 | 2b-创建组织团队与虚拟密钥
2c. Add MCP tools | 2c. 添加 MCP 工具 | 2c-添加-mcp-工具
2d. Add agents | 2d. 添加智能体 | 2d-添加智能体
Step 3. Configure the client endpoints | 步骤 3：配置客户端端点 | 步骤-3配置客户端端点
3a. LLM requests | 3a. LLM 请求 | 3a-llm-请求
3b. MCP tool calls | 3b. MCP 工具调用 | 3b-mcp-工具调用
3c. Agent calls | 3c. 智能体调用 | 3c-智能体调用
3d. Connect your client tools | 3d. 接入客户端工具 | 3d-接入客户端工具
Step 4. Implement secure authentication | 步骤 4：实现安全认证 | 步骤-4实现安全认证
SSO for the Admin UI | 为管理界面配置 SSO | 为管理界面配置-sso
JWT authentication for API traffic | API 流量的 JWT 认证 | api-流量的-jwt-认证
Least-privilege access | 最小权限访问 | 最小权限访问
Secret manager | 密钥管理器 | 密钥管理器
Audit logs | 审计日志 | 审计日志
Step 5. Set up chargeback | 步骤 5：设置成本分摊 | 步骤-5设置成本分摊
5a. Team budget | 5a. 团队预算 | 5a-团队预算
5b. Projects | 5b. 项目 | 5b-项目
5c. Key budget and rate limits | 5c. 密钥预算与速率限制 | 5c-密钥预算与速率限制
5d. Tag budget | 5d. 标签预算 | 5d-标签预算
5e. Spend reports | 5e. 花费报告 | 5e-花费报告
After the rollout | 上线之后 | 上线之后
Get help | 获取帮助 | 获取帮助
