
# ✨ IP 地址过滤

<EnterpriseFeature />

限制允许调用代理端点的 IP 地址。

```yaml
general_settings:
  allowed_ips: ["192.168.1.1"]
```

**预期响应**（IP 不在允许列表中时）

```bash
{
    "error": {
        "message": "Access forbidden: IP address not allowed.",
        "type": "auth_error",
        "param": "None",
        "code": 403
    }
}
```
