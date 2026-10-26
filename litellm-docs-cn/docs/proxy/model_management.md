import Image from '@theme/IdealImage';

# 模型管理

打开 `STORE_MODEL_IN_DB` 后，模型不再存放在静态的 `config.yaml` 里，而是进入数据库。这意味着上线后的日常调整都可以直接在管理界面（Admin UI）完成：新增模型、修改价格、轮换提供商密钥、下线某个部署，全程无需改配置文件，也无需重启代理。

本页介绍这些日常运维操作。如果你要添加第一个模型，请先从[快速上手](./docker_quick_start.md)开始，它会带你完成启动、接入提供商和发起第一个请求。等网关跑起来、想要管理已有模型时，再回到本页。

## 模型列表

进入 **Models + Endpoints**，打开 **All Models** 标签页，即可看到网关当前服务的所有模型。每一行都展示对外模型名、底层提供商与 litellm 模型，以及每个 Token 的输入与输出成本——LiteLLM 会自动从[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)映射这些价格。

每个模型上的徽标标明它的来源：通过 UI 或 API 添加的模型带 database 徽标，从 `config.yaml` 加载的模型则标记为 config。这个区分很重要，因为 config 模型无法在 UI 中编辑（见下文[数据库模型与 config.yaml 模型](#数据库模型与-configyaml-模型)）。列表太长时，可以用搜索框和提供商筛选器快速定位你关心的模型。

<Image img={require('../../img/ui_models_table.png')} alt="管理界面的 All Models 列表" />

## 查看与编辑模型

在列表中点击某个 Model ID 即可进入其详情页。**Overview** 标签页汇总了模型的设置与提供商信息，**Raw JSON** 标签页则展示完整的存储定义，方便你确认网关里到底保存了什么。

点击 **Edit Settings** 即可直接修改该模型。你可以更新客户端调用的对外模型名、请求实际路由到的 litellm 模型名，也可以在需要覆盖自动映射价格时调整每 1M Token 的输入与输出成本。保存之后，更改立即对新的请求生效。

详情页还提供两个操作。**Test Connection** 会用已存储的凭据向提供商重新验证该模型，让你在客户端真正调用之前确认密钥仍然有效、新改的设置没有问题。**Delete Model** 则把模型从网关移除；对数据库模型而言，这一步会直接删除存储的定义。

<Image img={require('../../img/ui_model_detail.png')} alt="模型详情页：Edit Settings、Test Connection 与 Delete Model" />

## 可复用的提供商凭据

多数部署中，同一个提供商账户背后挂着好几个模型。与其把同一个 API 密钥反复粘贴到每个模型里，不如创建一份命名凭据（credential），一次创建、处处复用。

打开 **LLM Credentials** 标签页并点击 **Add Credential**。选择提供商、填入 API 密钥，再给凭据起个名字。表单字段会随所选提供商变化，例如选择 Vertex AI 后，出现的是 `Vertex Project`、`Vertex Location` 和 `Vertex Credentials`，而不是单个密钥输入框。

<Image
  img={require('../../img/ui_add_credential.png')}
  dark={require('../../img/ui_add_credential_dark.png')}
  alt="Add New Credential 弹窗，提供商选择 OpenAI"
/>

保存之后，凡是在添加或编辑模型的地方都可以使用这份凭据。在 Add Model 表单里，从 **Existing Credentials** 下拉框选中它即可，无需再手动输入密钥。反过来也可以：在模型详情页点击 **Re-use Credentials** 按钮，把某个已配置模型的凭据沉淀为命名凭据，供后续模型使用。挂接了命名凭据的模型会在 Usage 页面打上 `Credential: <name>` 标记，因此无需任何额外配置就能按凭据筛选花费，参见[凭据用量统计](./credential_usage_tracking.md)。

## 数据库模型与 config.yaml 模型

把模型存进数据库，正是实现 UI 化管理的前提。开启方式：设置环境变量 `STORE_MODEL_IN_DB="True"`，或在配置中写入 `general_settings.store_model_in_db: true`。也可以在运行时从 UI 的 **Models + Endpoints** 设置中直接切换，这对云上部署格外省事——改配置就意味着走一遍完整发布流程；UI 上的取值会覆盖配置文件里的取值。

启用之后，凡是经 UI 或 API 添加的模型都会持久化到数据库，重启或增加代理实例都不会丢失。这些模型的提供商凭据落库时用 `LITELLM_SALT_KEY` 加密（未设置盐密钥时回退到 `LITELLM_MASTER_KEY`）；务必保管好该值，且一旦有模型入库就不要再改，因为用旧值加密的凭据无法用新值解密。

数据库存储并不取代你的 `config.yaml`。在文件里定义的模型照常工作，并与数据库模型一起展示。唯一的区别是 config 模型的所有权归文件，无法在 UI 里编辑或删除；要改就在配置里改，然后重新加载。配置文件格式本身见 [Config.yaml](./configs.md)。

设置项在这里的表现与模型不同。UI 写入 `general_settings`、`router_settings`、`litellm_settings` 或 `environment_variables` 的任何内容都会存进 `LiteLLM_Config`，并在启动时叠加到你的 `config.yaml` 之上，因此数据库里的值优先，之后再在 YAML 中修改同一个键并重启也不会生效。参见 [config.yaml 与数据库设置](./configs.md#configyaml-与数据库设置)。

### 为模型选定唯一事实来源

生产部署应当为模型定义选定一个主要事实来源：

| 方案 | 存储位置 | 模型变更需要重启吗？ | 适用场景 |
| --- | --- | --- | --- |
| `config.yaml` | 配置文件 | 需要。修改文件后重新加载或重启代理进程。 | GitOps 工作流，模型变更随应用一同部署。 |
| Admin UI、管理 API 或 Terraform | LiteLLM 数据库 | 不需要。写入成功后，更改即对新的请求生效。 | 日常运维、频繁的模型变更和集中式自动化。 |

LiteLLM 允许同时加载文件来源和数据库来源的模型，但把两者都当作模型管理体系会造成双重事实来源。从 `config.yaml` 加载的模型始终归该文件所有，无法通过 UI 编辑或删除。模型定义请只放在一个体系里；管理 API 未覆盖的基础设施设置，则继续用 `config.yaml` 或环境变量管理。

[LiteLLM Terraform provider](https://github.com/BerriAI/terraform-provider-litellm) 调用的正是 Admin UI 所用的同一套管理 API。资源直接持久化在 LiteLLM 数据库中，因此无需另写 REST 客户端，模型变更也不必重启代理。

## 自动化（API）

同样的操作也可以通过 HTTP 完成，这正是 CI/CD 或批量脚本化变更所需要的。这些端点要求开启 `store_model_in_db`；未开启时 `POST /model/new` 会失败，因为模型无处持久化。

添加模型：

```bash
curl -X POST "http://0.0.0.0:4000/model/new" \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model_name": "azure-gpt-4o",
      "litellm_params": {
        "model": "azure/{{openai_large}}",
        "api_key": "os.environ/AZURE_API_KEY",
        "api_base": "https://my-endpoint.openai.azure.com/"
      }
    }'
```

其余操作：

| 操作 | 路由 | 说明 |
| --- | --- | --- |
| 列出模型 | `GET /model/info` | 返回完整模型列表，API 密钥已打码 |
| 更新模型 | `POST /model/update` | 修改现有模型的 `litellm_params` 或 `model_info` |
| 删除模型 | `POST /model/delete` | 请求体为 `{"id": "<model_id>"}`，仅管理员可用。注意这是 POST，没有 DELETE 动词的路由 |

创建或更新模型时可以附加任意的 `model_info` 字段，它们会原样透传给 `GET /model/info`，与映射出的成本和上下文数据并列返回。这正是给模型标注自定义元数据的机制：标注负责团队、描述或版本号等信息，之后再用程序读回。
