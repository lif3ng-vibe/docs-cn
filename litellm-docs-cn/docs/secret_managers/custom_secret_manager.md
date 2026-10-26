import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 自定义密钥管理器

将自定义密钥管理系统（secret manager）接入 LiteLLM。

## 快速上手

### 1. 创建你的密钥管理器类

新建一个 `my_secret_manager.py` 文件，实现一个基于内存的密钥存储：

```python showLineNumbers title="my_secret_manager.py"
from typing import Optional, Union
import httpx
from litellm.integrations.custom_secret_manager import CustomSecretManager

class InMemorySecretManager(CustomSecretManager):
    def __init__(self):
        super().__init__(secret_manager_name="in_memory_secrets")
        # Store your secrets in memory
        self.secrets = {
            "OPENAI_API_KEY": "sk-...",
            "ANTHROPIC_API_KEY": "sk-ant-...",
        }

    async def async_read_secret(
        self,
        secret_name: str,
        optional_params: Optional[dict] = None,
        timeout: Optional[Union[float, httpx.Timeout]] = None,
    ) -> Optional[str]:
        """Read secret asynchronously"""
        return self.secrets.get(secret_name)

    def sync_read_secret(
        self,
        secret_name: str,
        optional_params: Optional[dict] = None,
        timeout: Optional[Union[float, httpx.Timeout]] = None,
    ) -> Optional[str]:
        """Read secret synchronously"""
        return self.secrets.get(secret_name)
```

### 2. 配置代理

在 `config.yaml` 中引用你的自定义密钥管理器：

```yaml showLineNumbers title="config.yaml"
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  key_management_system: custom  # 👈 KEY CHANGE
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager  # 👈 KEY CHANGE

model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY  # Read from custom secret manager
```

### 3. 启动 LiteLLM 代理

<Tabs>
<TabItem value="docker" label="Docker">

把自定义密钥管理器文件挂载到容器中：

```bash showLineNumbers
docker run -d \
  -p 4000:4000 \
  -e LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY \
  --name litellm-proxy \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/my_secret_manager.py:/app/my_secret_manager.py \
  docker.litellm.ai/berriai/litellm:latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug
```

</TabItem>

<TabItem value="pip" label="Python 包">

```bash
litellm --config config.yaml --detailed_debug
```

</TabItem>
</Tabs>

## 配置选项

在 `config.yaml` 中定制密钥管理器的行为：

<Tabs>
<TabItem value="read_only" label="仅读取密钥">

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    hosted_keys: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]  # Only check these keys
```

</TabItem>

<TabItem value="write_only" label="存储虚拟密钥">

把 LiteLLM 代理的虚拟密钥（virtual key）存入你的密钥管理器：

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    access_mode: "write_only"
    store_virtual_keys: true
    prefix_for_stored_virtual_keys: "litellm/"
    description: "LiteLLM virtual key"
    tags:
      Environment: "Production"
      Team: "AI"
```

</TabItem>

<TabItem value="read_and_write" label="读写">

```yaml showLineNumbers title="config.yaml"
general_settings:
  key_management_system: custom
  key_management_settings:
    custom_secret_manager: my_secret_manager.InMemorySecretManager
    access_mode: "read_and_write"
    hosted_keys: ["OPENAI_API_KEY"]
    store_virtual_keys: true
    prefix_for_stored_virtual_keys: "litellm/"
```

</TabItem>
</Tabs>

### 可用配置项

| 设置项 | 说明 | 默认值 |
|---------|-------------|---------|
| `custom_secret_manager` | 自定义密钥管理器类的路径 | 必填 |
| `access_mode` | `"read_only"`、`"write_only"` 或 `"read_and_write"` | `"read_only"` |
| `hosted_keys` | 需要在密钥管理器中检查的具体密钥列表 | 所有密钥 |
| `store_virtual_keys` | 是否把 LiteLLM 虚拟密钥存入密钥管理器 | `false` |
| `prefix_for_stored_virtual_keys` | 存储虚拟密钥时使用的前缀 | `"litellm/"` |
| `description` | 存储密钥时的描述信息 | `None` |
| `tags` | 应用到所存密钥上的标签 | `None` |

## 必须实现的方法

你的自定义密钥管理器**必须**实现以下两个方法：

### `async_read_secret()`

```python showLineNumbers
async def async_read_secret(
    self,
    secret_name: str,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> Optional[str]:
    """
    Read a secret asynchronously.
    
    Returns:
        Secret value if found, None otherwise
    """
    pass
```

### `sync_read_secret()`

```python showLineNumbers
def sync_read_secret(
    self,
    secret_name: str,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> Optional[str]:
    """
    Read a secret synchronously.
    
    Returns:
        Secret value if found, None otherwise
    """
    pass
```

## 可选方法

实现以下方法可以获得更多功能：

### `async_write_secret()`

```python showLineNumbers
async def async_write_secret(
    self,
    secret_name: str,
    secret_value: str,
    description: Optional[str] = None,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
    tags: Optional[Union[dict, list]] = None,
) -> dict:
    """Write a secret to your secret manager"""
    pass
```

### `async_delete_secret()`

```python showLineNumbers
async def async_delete_secret(
    self,
    secret_name: str,
    recovery_window_in_days: Optional[int] = 7,
    optional_params: Optional[dict] = None,
    timeout: Optional[Union[float, httpx.Timeout]] = None,
) -> dict:
    """Delete a secret from your secret manager"""
    pass
```

## 适用场景

✅ 专有保险库（vault）系统  
✅ 自定义认证方式（mTLS、OAuth）  
✅ 组织特定的安全策略  
✅ 遗留密钥存储系统  
✅ 多区域密钥复制  
✅ 密钥版本管理与轮换  
✅ 合规要求（HIPAA、SOC2）  

## 示例

完整可运行的示例见 [cookbook/litellm_proxy_server/secret_manager/my_secret_manager.py](https://github.com/BerriAI/litellm/blob/main/cookbook/litellm_proxy_server/secret_manager/my_secret_manager.py)，其中包含：

- 内存密钥管理器的实现  
- 与 LiteLLM 代理的集成  
- 读取、写入与删除操作
