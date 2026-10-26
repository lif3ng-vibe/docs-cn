# Azure Key Vault

<EnterpriseFeature />

## 在 LiteLLM 代理服务器中使用

1. 安装代理（Proxy）依赖项
```bash
uv tool install 'litellm[proxy]' 'litellm[extra_proxy]'
```

2. 将 Azure 相关信息保存到环境变量中
```bash 
export["AZURE_CLIENT_ID"]="your-azure-app-client-id"
export["AZURE_CLIENT_SECRET"]="your-azure-app-client-secret"
export["AZURE_TENANT_ID"]="your-azure-tenant-id"
export["AZURE_KEY_VAULT_URI"]="your-azure-key-vault-uri"
```

3. 添加到代理的 config.yaml 中
```yaml
model_list: 
    - model_name: "my-azure-models" # model alias 
      litellm_params:
            model: "azure/<your-deployment-name>"
            api_key: "os.environ/AZURE-API-KEY" # reads from key vault - get_secret("AZURE_API_KEY")
            api_base: "os.environ/AZURE-API-BASE" # reads from key vault - get_secret("AZURE_API_BASE")

general_settings:
  key_management_system: "azure_key_vault"
```

现在可以启动代理来进行测试：
```bash
litellm --config /path/to/config.yaml
```

[快速测试代理](/docs/proxy/quick_start#使用-litellm-代理curl-请求openai-包langchain)
