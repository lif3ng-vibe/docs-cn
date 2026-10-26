# 自动同步 Anthropic Beta Headers

无需重启服务，即可让 Anthropic beta headers 配置自动保持最新。**这意味着在不重启服务的情况下，所有提供商都能支持新的 Anthropic beta 特性**。

## 概览

Anthropic 发布新的 beta 特性（如新的工具能力、更长的上下文窗口）时，通常需要重启 LiteLLM 服务，才能拿到各提供商（Anthropic、Bedrock、Vertex AI、Azure AI）最新的 beta header 映射。

开启自动同步后，LiteLLM 会自动从 GitHub 拉取最新的 [`anthropic_beta_headers_config.json`](https://github.com/BerriAI/litellm/blob/main/litellm/anthropic_beta_headers_config.json) 配置，全程无需重启。这意味着：

- **零停机**：新 beta 特性发布时无需中断服务
- **始终最新**：提供商支持映射自动保持更新
- **自动更新**：设置一次，无需再管

## 快速上手

**手动同步**：
```bash
curl -X POST "https://your-proxy-url/reload/anthropic_beta_headers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**每 24 小时自动同步**：
```bash
curl -X POST "https://your-proxy-url/schedule/anthropic_beta_headers_reload?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## API 端点

| 端点 | 方法 | 说明 |
|----------|--------|-------------|
| `/reload/anthropic_beta_headers` | POST | 手动同步 |
| `/schedule/anthropic_beta_headers_reload?hours={hours}` | POST | 设置定时同步 |
| `/schedule/anthropic_beta_headers_reload` | DELETE | 取消定时同步 |
| `/schedule/anthropic_beta_headers_reload/status` | GET | 查询同步状态 |

**鉴权**：需要 admin 角色或主密钥（master key）

## Python 示例

```python
import requests

def sync_anthropic_beta_headers(proxy_url, admin_token):
    response = requests.post(
        f"{proxy_url}/reload/anthropic_beta_headers",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()

# Usage
result = sync_anthropic_beta_headers("https://your-proxy-url", "your-admin-token")
print(result['message'])
```

## 配置

**自定义 beta headers 配置 URL**：
```bash
export LITELLM_ANTHROPIC_BETA_HEADERS_URL="https://raw.githubusercontent.com/BerriAI/litellm/main/litellm/anthropic_beta_headers_config.json"
```

**使用本地 beta headers 配置**：
```bash
export LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS=True
```

## 定时自动重载

设置定时自动重载，确保代理服务器始终持有最新的 beta header 映射：

```bash
# 每 24 小时重载一次
curl -X POST "https://your-proxy-url/schedule/anthropic_beta_headers_reload?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**查询重载状态**：
```bash
curl -X GET "https://your-proxy-url/schedule/anthropic_beta_headers_reload/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**响应**：
```json
{
  "scheduled": true,
  "interval_hours": 24,
  "last_run": "2026-02-13T10:00:00",
  "next_run": "2026-02-14T10:00:00"
}
```

**取消定时重载**：
```bash
curl -X DELETE "https://your-proxy-url/schedule/anthropic_beta_headers_reload" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 环境变量

| 变量 | 说明 | 默认值 |
|----------|-------------|---------|
| `LITELLM_ANTHROPIC_BETA_HEADERS_URL` | 拉取 beta headers 配置的 URL | GitHub main branch |
| `LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS` | 设为 `True` 时仅使用本地配置 | `False` |

## 工作原理

1. **初始加载**：启动时，LiteLLM 从远程 URL 加载 beta headers 配置（若已配置本地文件，则从本地文件加载）
2. **缓存**：配置缓存在内存中，避免每个请求都重复拉取
3. **定时重载**：配置后，代理每 10 秒检查一次是否到达计划的重载时间
4. **手动重载**：可通过 API 端点立即触发一次重载
5. **多 Pod 支持**：多 Pod 部署时，重载配置存储在数据库中，所有 Pod 保持同步

## 优势

- **无需重启**：不停机即可支持新的 Anthropic beta 特性
- **提供商兼容**：自动获取 Bedrock、Vertex AI、Azure AI 等提供商的最新映射
- **性能**：配置有缓存，只在需要时才重载
- **可靠性**：远程拉取失败时回退到本地配置

## 相关阅读

- [模型成本表同步](./sync_models_github.md)——自动同步模型定价数据
- [Anthropic Beta Headers](../providers/anthropic.md)——使用 Anthropic beta 特性
