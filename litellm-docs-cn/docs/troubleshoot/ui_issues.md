# UI 故障排查

如果 LiteLLM 管理界面（Admin UI）出现问题，反馈时请附上以下信息。

## 1. 复现步骤

清晰、分步地说明如何触发问题（例如："进入 Settings → Team，点击 'Create Team'，填写各字段后点击提交 → 出现报错"）。

## 2. LiteLLM 版本

你当前运行的 LiteLLM 版本。可通过 `litellm --version` 或 UI 的设置页查看。

## 3. 架构与部署设置

分布式环境是 UI 问题的常见来源。请描述：

- **LiteLLM 实例/副本数量**及部署方式（如 Kubernetes、Docker Compose、ECS）
- **负载均衡器**的类型与配置（如 ALB、Nginx、Cloudflare Tunnel），包括是否启用了会话保持（sticky session）
- **UI 的访问方式**：直接通过 LiteLLM、经由反向代理，还是位于 ingress controller 之后
- 用户与 LiteLLM 服务器之间是否存在 **CDN 或缓存层**

## 4. 网络面板请求

打开浏览器开发者工具（F12 → Network 标签页），复现问题，并分享以下内容：

- **失败的请求**：URL、请求方法、状态码与响应体
- 相关网络活动的**截图或 HAR 导出文件**
- Console 标签页中出现的 **CORS 或混合内容错误**

## 5. 环境变量

与 UI 和代理配置相关、不含敏感信息的环境变量，例如：

- `LITELLM_MASTER_KEY`
- `PROXY_BASE_URL` / `LITELLM_PROXY_BASE_URL`
- `UI_BASE_PATH`
- 所有与 SSO 相关的变量（如 `GOOGLE_CLIENT_ID`、`MICROSOFT_TENANT`）

请**务必不要**包含密码、机密信息或 API 密钥。

## 6. 浏览器与访问信息

- **浏览器**及其版本（如 Chrome 120、Firefox 121）
- **访问 UI 使用的 URL**（隐去敏感部分）
- 问题影响的是**所有用户还是特定角色**（Admin、Internal User 等）

## 7. 截图或录屏

问题发生时的截图或简短录屏非常有帮助。请包含所有可见的报错信息、Toast 提示或异常表现。
