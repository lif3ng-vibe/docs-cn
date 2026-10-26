# AWS Key Management V1

<EnterpriseFeature />

:::tip

[BETA] AWS Key Management v2 属于企业版功能。文档请见[这里](../enterprise.md)。

:::

使用 AWS KMS 将代理主密钥（Proxy Master Key）的哈希副本存入环境变量中。

```bash
export LITELLM_MASTER_KEY="djZ9xjVaZ..." # 👈 ENCRYPTED KEY
export AWS_REGION_NAME="us-west-2"
```

```yaml
general_settings:
  key_management_system: "aws_kms"
  key_management_settings:
    hosted_keys: ["LITELLM_MASTER_KEY"] # 👈 WHICH KEYS ARE STORED ON KMS
```

[**查看解密代码**](https://github.com/BerriAI/litellm/blob/a2da2a8f168d45648b61279d4795d647d94f90c9/litellm/utils.py#L10182)
