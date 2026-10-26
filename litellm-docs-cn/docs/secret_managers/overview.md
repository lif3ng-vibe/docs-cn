import Image from '@theme/IdealImage';

# 密钥管理器概览

<EnterpriseFeature />

LiteLLM 支持从 Azure Key Vault、Google Secret Manager、Hashicorp Vault、CyberArk Conjur 与 AWS Secret Manager **读取密钥**（如 `OPENAI_API_KEY`）和**写入密钥**（如虚拟密钥 virtual key）。

## 支持的密钥管理器

- [AWS Key Management Service](./aws_kms)
- [AWS Secret Manager](./aws_secret_manager)
- [Azure Key Vault](./azure_key_vault)
- [CyberArk Conjur](./cyberark)
- [Google Secret Manager](./google_secret_manager)
- [Google Key Management Service](./google_kms)
- [Hashicorp Vault](./hashicorp_vault)

## 所有密钥管理器设置

密钥管理涉及的全部设置如下。

```yaml
general_settings:
  key_management_system: "aws_secret_manager" # REQUIRED
  key_management_settings:  

    # Storing Virtual Keys Settings
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL.I f set, this prefix will be used for stored virtual keys in the secret manager
    
    # Access Mode Settings
    access_mode: "write_only" # OPTIONAL. Literal["read_only", "write_only", "read_and_write"]. Defaults to "read_only"
    
    # Hosted Keys Settings
    hosted_keys: ["litellm_master_key"] # OPTIONAL. Specify which env keys you stored on AWS

    # K/V pairs in 1 AWS Secret Settings
    primary_secret_name: "litellm_secrets" # OPTIONAL. Read multiple keys from one JSON secret on AWS Secret Manager
```

## 团队级密钥管理器设置

团队级密钥管理器设置允许每个团队使用自己的密钥管理配置。在创建与该团队关联的虚拟密钥时，就会用到这些设置。

按以下步骤配置：

1. **创建团队**  
   打开 Teams 页面，点击 `Create Team` 打开弹窗。  

   <Image img={require('../../img/secret_manager_settings_create_team.png')} />

2. **展开 Additional Settings**  
   使用 `Additional Settings` 开关展开高级配置面板。  
   
  <Image img={require('../../img/secret_manager_settings_additional_settings.png')} />

3. **配置密钥管理器**  
   在 `Secret Manager Settings` 面板中粘贴对应提供商的 JSON。支持的键值请参考各提供商页面（AWS、Azure、Google、Hashicorp 等）。目前仅支持 JSON 格式，后续计划提供更友好的 UI 编辑器。  
   
   <Image img={require('../../img/secret_manager_settings.png')} />

4. **创建团队**  
   检查各项输入后，点击 `Create Team` 保存。  
   
   <Image img={require('../../img/secret_manager_settings_create_button.png')} />

保存后，LiteLLM 就会使用该配置。
