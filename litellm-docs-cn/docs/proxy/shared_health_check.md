# 跨 Pod 共享健康检查状态

该功能可在多个 LiteLLM 代理 Pod 之间协调健康检查（health check），避免重复检查并降低成本。

## 概述

运行多个 LiteLLM 代理 Pod 时（例如在 Kubernetes 中），每个 Pod 通常会对每个模型独立运行健康检查。这可能带来：

- 跨 Pod 的**重复健康检查**
- 昂贵模型（如 Gemini 3.1 Pro）带来的**成本攀升**
- **冗余的监控与日志噪音**
- **资源利用低效**

共享健康检查状态功能通过以下方式解决上述问题：

- 基于 Redis 跨 Pod **协调健康检查**
- 以可配置的 TTL（缓存有效期）**缓存结果**
- 使用**分布式锁**确保同一时刻只有一个 Pod 在运行健康检查
- **让其他 Pod** 直接读取缓存结果，不再重复执行检查

## 工作原理

### 1. 获取锁

Pod 需要运行健康检查时：
- 先尝试获取 Redis 锁
- 获取成功即运行健康检查
- 获取失败则短暂等待，并查询缓存结果

### 2. 缓存结果

健康检查运行完毕后：
- 结果以可配置的 TTL 缓存到 Redis
- 其他 Pod 可以读取这些缓存结果
- 缓存附带时间戳和 Pod ID，便于追踪

### 3. 回退行为

如果 Redis 不可用或缓存已过期：
- Pod 会回退为在本地运行健康检查
- 系统继续正常运转

## 配置

### 启用共享健康检查

在 `proxy_config.yaml` 中添加：

```yaml
general_settings:
  # Enable background health checks (required)
  background_health_checks: true

  # Enable shared health check state across pods
  use_shared_health_check: true

  # Health check interval (seconds)
  health_check_interval: 300  # 5 minutes

# Redis configuration (required for shared health check)
litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: your-redis-host
    port: 6379
    password: your-redis-password
```

### 环境变量

该功能本身只能通过配置文件中的 `general_settings.use_shared_health_check` 启用，没有对应的环境变量。缓存与锁的 TTL 可通过环境变量调整：

```bash
# Health check TTL (seconds)
export DEFAULT_SHARED_HEALTH_CHECK_TTL=300

# Lock TTL (seconds)
export DEFAULT_SHARED_HEALTH_CHECK_LOCK_TTL=60
```

## 前提条件

- **Redis**：跨 Pod 协调共享状态所必需
- **后台健康检查**：必须启用（`background_health_checks: true`）
- **多 Pod**：2 个及以上代理实例时收益最明显

## API 端点

### 查询共享健康检查状态

```bash
GET /health/shared-status
```

返回共享健康检查协调状态的相关信息：

```json
{
  "shared_health_check_enabled": true,
  "status": {
    "pod_id": "pod_1703123456789",
    "redis_available": true,
    "lock_ttl": 60,
    "cache_ttl": 300,
    "lock_owner": "pod_1703123456788",
    "lock_in_progress": true,
    "cache_available": true,
    "cache_age_seconds": 45.2,
    "last_checked_by": "pod_1703123456788"
  }
}
```

## 监控

### 健康检查状态

监控共享健康检查状态，确保各 Pod 协调正常：

```bash
curl -H "Authorization: Bearer your-api-key" \
  http://your-proxy-host/health/shared-status
```

### 日志

留意以下日志消息：

```
INFO: Initialized shared health check manager
INFO: Pod pod_123 acquired health check lock
INFO: Pod pod_123 released health check lock
INFO: Cached health check results for 5 healthy and 0 unhealthy endpoints
DEBUG: Using cached health check results
```

## 故障排查

### 常见问题

#### 1. 共享健康检查未生效

**症状**：每个 Pod 仍在独立运行健康检查

**解决方案**：
- 确认 Redis 已正确配置且可访问
- 检查是否设置了 `use_shared_health_check: true`
- 确保已启用 `background_health_checks: true`
- 在日志中排查 Redis 连接问题

#### 2. Redis 连接问题

**症状**：健康检查回退为本地执行

**解决方案**：
- 核对 Redis 主机、端口与凭据
- 检查 Pod 与 Redis 之间的网络连通性
- 监控 Redis 服务端日志中的报错

#### 3. 锁未释放

**症状**：某个 Pod 无限期持有锁

**解决方案**：
- 锁自带自动过期的 TTL（默认 60 秒）
- 在 Pod 日志中查找锁释放相关消息
- 核实 Redis 的 TTL 设置

### 调试模式

启用调试日志可查看详细的协调过程：

```yaml
general_settings:
  set_verbose: true
```

## 性能影响

### 收益

- **API 调用减少**：每个周期只有一个 Pod 运行健康检查
- **成本更低**：对昂贵模型的效果尤为显著
- **资源利用更好**：减少 Pod 之间的重复工作
- **监控更干净**：日志与指标中的噪音更少

### 开销

- **Redis 操作**：锁与缓存操作的开销极小
- **网络延迟**：与 Redis 通信会带来少量延迟
- **内存占用**：额外的内存占用可忽略不计

## 最佳实践

### 1. Redis 配置

- 使用开启了持久化的 Redis
- 配置合理的内存上限
- 为 Redis 搭建监控与告警

### 2. TTL 设置

- 将 `health_check_interval` 设为期望的检查频率
- 无特殊需求时沿用默认 TTL 值
- 对昂贵模型可考虑设置模型级超时

### 3. 监控

- 监控共享健康检查状态端点
- 为 Redis 连接问题设置告警
- 追踪健康检查的成本与频率

### 4. 扩展

- 该功能对任意数量的 Pod 都适用
- Pod 越多，协调收益越明显
- 高可用场景可考虑 Redis 集群

## 配置示例

### 完整示例

```yaml
# proxy_config.yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_timeout: 30  # 30 second timeout for health checks

general_settings:
  # Enable background health checks
  background_health_checks: true

  # Enable shared health check coordination
  use_shared_health_check: true

  # Health check interval (5 minutes)
  health_check_interval: 300

  # Health check details
  health_check_details: true

litellm_settings:
  # Redis configuration
  cache: true
  cache_params:
    type: redis
    host: redis-cluster.example.com
    port: 6379
    password: os.environ/REDIS_PASSWORD
    ssl: true
```

### Kubernetes 示例

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-proxy
spec:
  replicas: 3  # Multiple pods for coordination
  template:
    spec:
      containers:
      - name: litellm-proxy
        image: docker.litellm.ai/berriai/litellm:latest
        args: ["--config", "/app/proxy_config.yaml"]  # config sets use_shared_health_check: true
        env:
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
```

## 迁移

### 从独立健康检查迁移

1. **启用 Redis**：确保 Redis 已配置且可访问
2. **启用后台健康检查**：设置 `background_health_checks: true`
3. **启用共享健康检查**：设置 `use_shared_health_check: true`
4. **部署**：更新代理配置
5. **监控**：检查 `/health/shared-status` 端点

### 回滚

如需禁用共享健康检查：

```yaml
general_settings:
  use_shared_health_check: false
  # background_health_checks can remain true for independent checks
```

## 相关功能

- [后台健康检查](./health.md#后台健康检查)
- [Redis 缓存](./caching_redis.md)
- [Redis 事务缓冲](./prod.md#redis-事务缓冲区)
- [健康检查端点](./health.md#其他健康端点)
