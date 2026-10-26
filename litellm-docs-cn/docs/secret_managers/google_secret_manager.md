# Google Secret Manager

<EnterpriseFeature />

支持 [Google Secret Manager](https://cloud.google.com/security/products/secret-manager)

1. 将 Google Secret Manager 的相关信息保存到环境变量中

```shell
GOOGLE_SECRET_MANAGER_PROJECT_ID="your-project-id-on-gcp" # example: adroit-crow-413218
```

可选参数

```shell
export GOOGLE_SECRET_MANAGER_REFRESH_INTERVAL = ""            # (int) defaults to 86400
export GOOGLE_SECRET_MANAGER_ALWAYS_READ_SECRET_MANAGER = ""  # (str) set to "true" if you want to always read from google secret manager without using in memory caching. NOT RECOMMENDED in PROD
```

2. 添加到代理的 config.yaml 中
```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      api_key: os.environ/OPENAI_API_KEY # this will be read from Google Secret Manager

general_settings:
  key_management_system: "google_secret_manager"
```

现在可以启动代理进行测试：
```bash
litellm --config /path/to/config.yaml
```

[快速测试代理](/docs/proxy/quick_start#使用-litellm-代理curl-请求openai-包langchain)
