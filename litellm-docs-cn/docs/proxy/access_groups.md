import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 访问组（Access Groups）

访问组简化了组织内资源访问的定义与管理。你无需在每个密钥或团队上分别配置模型、MCP（Model Context Protocol）服务器和智能体（agents），只需创建一个组，把要授予的资源打包在一起，再将这个组挂到你的密钥或团队上即可。

## 概览

**访问组**让你在一处定义一组可复用的可用资源（模型、MCP 服务器和智能体），一个组即可同时授予这三种资源的访问权限。把组挂到某个密钥或团队上，它就能访问该组中定义的所有资源。

- **统一资源管控**：一个组同时控制对模型、MCP 服务器和智能体的访问
- **可复用**：定义一次，挂到多个密钥或团队
- **易于维护**：更新组（增删资源）后，所有挂载该组的密钥和团队都会自动同步变更
- **清晰可见**：准确看到每个组授予了哪些资源、哪些密钥或团队在使用它

<Image img={require('../../img/ui_access_groups.png')} />

### 工作原理

**核心概念**：在组中定义资源 → 把组挂到密钥或团队 → 密钥或团队获得组内全部资源的访问权限

| 资源类型 | 组控制的范围 |
| --- | --- |
| **模型** | 密钥或团队可以使用哪些 LLM 模型（例如 `gpt-4`、`claude-3-opus`） |
| **MCP 服务器** | 哪些 MCP 服务器可用于工具调用 |
| **智能体** | 可以调用哪些智能体 |

## 在管理界面中创建和使用访问组

### 1. 进入访问组页面

打开管理界面（Admin UI，例如 `http://localhost:4000/ui` 或你的 `PROXY_BASE_URL/ui`），在侧边栏点击 **Access Groups**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/d117fdb2-18c8-49e0-91e6-1f830d2d4b85/ascreenshot_f5822a0ddac64e3383124419d0c66298_text_export.jpeg)

### 2. 创建访问组

点击 **Create Access Group**，为组取一个名称。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/aefb900d-d106-4436-806c-3608ad19659f/ascreenshot_3f6fed1256604fe3b7038a0778ce3342_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/0951bb93-61bd-477e-beaf-f58810f8980b/ascreenshot_f0fb5d552fd74ff8a1080e82758fcdc2_text_export.jpeg)

### 3. 在组中定义资源

通过标签页选择这个组要授予访问权限的模型、MCP 服务器和智能体：

- **Models 标签页**：选择 LLM 模型
- **MCP Servers 标签页**：选择 MCP 服务器（用于工具调用）
- **Agents 标签页**：选择智能体

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/37398e8f-cd50-48c9-85e2-c77b2eeb994b/ascreenshot_440ec7906c8f4199b30ef91c903960b9_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/99d36543-8582-4bb7-a34d-3d5fe0fcf12f/ascreenshot_d9983240955c496892e1f7c38c074045_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/06fc5919-5c71-4fc3-999b-da7a4800af3f/ascreenshot_db93fdf742b249dc90a4b9d5991d6097_text_export.jpeg)

### 4. 将访问组挂到密钥上

创建或编辑虚拟密钥（virtual key）时，展开 **Optional Settings** 并选择你的访问组。该密钥将继承组内定义的所有模型、MCP 服务器和智能体的访问权限。

1. 进入 **Virtual Keys** 页面，点击 **+ Create New Key**
2. 展开 **Optional Settings**
3. 在 Access Group 字段中选择你创建的组
4. 保存密钥

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/cdfa76ab-bf38-4ca4-a97d-2cb50fafe50b/ascreenshot_046daecb57554c28ba553cf6c01f5450_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/84f08e9c-e9d0-42aa-8317-f385190b6d7d/ascreenshot_2d239716d30f431d9ad494baf7933d6a_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/41d7b7f9-ac58-4602-b887-c35c9b419dce/ascreenshot_8abd4fef48014dd1b88848411e6d7912_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/e37b01c0-f2d7-4133-8b2f-ccc51f6769e1/ascreenshot_f495df428ad54cac9ec43b46c3dfc1b1_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-15/3fe33cad-6b64-46c3-a66e-6e6e073c3d7a/ascreenshot_f2dcc79ae8af47dd86ade2f85165d3c1_text_export.jpeg)

### 5. 将访问组挂到团队上

在创建或编辑团队时，也可以把访问组挂到团队上。之后，该团队关联的所有密钥都能访问组内定义的资源。

## 使用场景

### 按团队划分访问

创建 “Engineering”、“Data Science”、“Product” 这样的组，放入各团队所需的模型、MCP 服务器和智能体，再把组挂到团队上，无需在每个密钥上逐一配置资源。

### 环境隔离

- **生产组**：生产模型、经过审批的 MCP 服务器和生产环境智能体
- **开发组**：高性价比模型、实验性 MCP 工具和开发环境智能体

按所处环境，把合适的组挂到密钥或团队上。

### 简化入职配置

新开发者只需拿到一个挂了访问组的密钥即可上手，不必手动配置模型、MCP 服务器和智能体。把他们加入合适的团队，或者发给他们一个挂了正确组的密钥。

### 集中更新

往组里新增一个模型或 MCP 服务器，所有挂载该组的密钥和团队都会自动获得访问权限；从组里移除某个资源，所有地方的访问权限会立即一并收回。

## 访问组与模型访问组的区别

LiteLLM 中有两个相关概念：

| 对比项 | **访问组**（Access Groups，本页） | **模型访问组**（Model Access Groups） |
| --- | --- | --- |
| 定义 | 在管理界面中定义；一个组可同时包含模型、MCP 服务器和智能体 | 在配置文件中或通过 API 定义；以模型为中心 |
| 覆盖范围 | 模型 + MCP 服务器 + 智能体 | 仅模型 |
| 挂载对象 | 密钥、团队 | 密钥、团队 |
| 适用场景 | 想在管理界面中统一管控模型、MCP 和智能体 | 需要基于配置文件或 API 的模型访问控制 |

若要通过 `model_info` 中的 `access_groups` 实现基于配置文件的模型访问控制，请参阅[模型访问组](./model_access_groups.md)。

## 相关文档

- [虚拟密钥](./virtual_keys.md)：创建和管理 API 密钥
- [基于角色的访问控制](./access_control.md)：组织、团队与用户角色
- [模型访问组](./model_access_groups.md)：基于配置文件的模型访问组
- [MCP 控制](../mcp_control.md)：MCP 服务器配置与访问控制
