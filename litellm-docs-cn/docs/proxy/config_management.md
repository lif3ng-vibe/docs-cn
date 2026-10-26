# 文件管理

## 在 config.yaml 中用 `include` 引入外部 YAML 文件

可以使用 `include` 在 config.yaml 中引入外部 YAML 文件。

**快速上手**：

要引入配置文件，`include` 后面跟单个文件或文件列表即可。

`parent_config.yaml` 的内容如下：
```yaml
include:
  - model_config.yaml # 👈 Key change, will include the contents of model_config.yaml

litellm_settings:
  callbacks: ["prometheus"] 
```


`model_config.yaml` 的内容如下：
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
  - model_name: fake-anthropic-endpoint
    litellm_params:
      model: anthropic/fake
      api_base: https://exampleanthropicendpoint-production.up.railway.app/

```

启动代理服务器

该命令会以 `parent_config.yaml` 为配置启动代理服务器。由于使用了 `include` 指令，服务器还会同时加载 `model_config.yaml` 的内容。
```
litellm --config parent_config.yaml --detailed_debug
```





## 使用 `include` 的示例

引入单个文件：
```yaml
include:
  - model_config.yaml
```

引入多个文件：
```yaml
include:
  - model_config.yaml
  - another_config.yaml
```
