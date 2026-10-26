# 用户入门指南

本指南分步讲解两件事：管理员如何把用户接入你的 LiteLLM 代理服务器（proxy）实例，以及用户如何用自己的 API 密钥快速上手。

---

## 面向管理员

### 步骤 1：创建用户账户

你可以通过管理界面（Admin UI）或 API 创建用户账户。

#### 管理界面（Admin UI）
- 打开管理界面（`/ui` 端点）
- 进入 Internal Users（内部用户）版块
- 点击 "Add User"（添加用户），填写所需信息

#### API
```bash
curl -X POST http://localhost:4000/user/new \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"user_email": "user@example.com"}'
```

---

### 步骤 2：授予访问权限

- 将用户加入某个团队（可选）
- 按需设置预算、速率限制以及允许使用的模型
- 为用户生成 API 密钥（通过 UI 或 API）

#### **生成 API 密钥**（API 示例）
```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "<user-id>", "max_budget": 100}'
```

---

## 面向最终用户

### 步骤 3：验证你的 API 密钥

在发起 LLM 调用之前，先调用 `/v1/models` 端点，确认密钥可用：

```bash
curl -X GET http://localhost:4000/v1/models \
  -H "Authorization: Bearer <your-api-key>"
```
- 密钥有效时，你会收到可用模型列表。
- 密钥无效时，会返回 401 错误。

---

### 步骤 4：Hello World，发起你的第一次 LLM 调用

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 故障排查
- 遇到 401 错误时，请联系管理员确认你的密钥处于启用状态，并且你有权限访问所请求的模型。
- 用 `/v1/models` 端点可以快速验证密钥是否有效，且不会消耗 LLM token。

---

## 另请参阅
- [Proxy 快速上手](./quick_start.md)
- [用户管理](./users.md)
- [密钥管理](./virtual_keys.md)
