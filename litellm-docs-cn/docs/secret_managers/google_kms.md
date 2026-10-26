# Google KMS 密钥管理服务

<EnterpriseFeature />

在代理（proxy）上使用来自 Google KMS 的加密密钥

第 1 步：将密钥写入环境变量
```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
export GOOGLE_KMS_RESOURCE_NAME="projects/*/locations/*/keyRings/*/cryptoKeys/*"
export PROXY_DATABASE_URL_ENCRYPTED=b'\n$\x00D\xac\xb4/\x8e\xc...'
```

第 2 步：更新配置

```yaml
general_settings:
  key_management_system: "google_kms"
  database_url: "os.environ/PROXY_DATABASE_URL_ENCRYPTED"
  master_key: os.environ/LITELLM_MASTER_KEY
```

第 3 步：启动并测试代理

```
$ litellm --config /path/to/config.yaml
```

然后在另一个终端里运行
```
$ litellm --test 
```

[快速测试代理](../proxy/user_keys)
