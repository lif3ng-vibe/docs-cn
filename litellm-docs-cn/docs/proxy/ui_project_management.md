import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ✨ [Beta] 项目管理 UI

<EnterpriseFeature />

直接在 LiteLLM 管理界面（Admin UI）中管理项目。项目位于组织层级中团队与密钥之间，可针对特定用例或应用实现细粒度的访问控制与预算管理。

:::info
项目管理目前处于 Beta 阶段，API 与 UI 可能发生变化。完整的 API 文档见 [项目管理](./project_management.md)。
:::

## 概览

项目可以帮助你：

- 按用例或应用组织 API 密钥
- 设置项目级预算与速率限制
- 在项目层级追踪花费与用量
- 控制每个项目可以访问的模型
- 在不同应用或团队之间保持清晰隔离

**层级结构**：`Organizations > Teams > Projects > Keys`

项目 API 与配置的详细信息见 [项目管理](./project_management.md)。

## 前提条件

- 拥有管理员或团队管理员权限
- 已创建至少一个团队（项目从属于团队）
- LiteLLM 管理界面已在本地或远程运行

## 在 UI 设置中启用项目

在创建项目之前，需要先在管理界面的设置中启用 Projects（项目）功能。

### 步骤 1：进入管理设置

打开管理界面（例如 `http://localhost:4000/ui/?login=success`）。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/b8de4dbf-a23b-4979-84a3-95fe17427b5a/ascreenshot_84dcb13b57a84fd589dff2d5af58adde_text_export.jpeg)

### 步骤 2：打开设置菜单

点击顶部导航栏中的 **"New"** 按钮。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/b8de4dbf-a23b-4979-84a3-95fe17427b5a/ascreenshot_447c8ea124f64d0eb18d3c9621f7cbbc_text_export.jpeg)

### 步骤 3：前往管理设置

点击 **"Admin Settings"**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/cc2ce9d9-d2d2-49f3-9fb8-c546fb8dfdcf/ascreenshot_fd792e9dbda24e7eb5cdb508c4f181f8_text_export.jpeg)

### 步骤 4：打开 UI 设置

点击 **"UI Settings New"**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/d667f4b4-300b-47c6-9d76-12e439519da6/ascreenshot_3f3db4df432843a48b53ae16b311e7df_text_export.jpeg)

### 步骤 5：启用项目功能

点击开关，启用 Projects 功能。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/4819f76b-4855-4f5c-8c4b-b4c272399724/ascreenshot_9df0555ae6db425ab839d73485ee9b99_text_export.jpeg)

启用后，管理界面导航中会出现 Projects（项目）板块，你就可以开始创建和管理项目了。

## 创建并管理项目

启用 Projects 功能后，即可在 Projects 页面创建项目。

### 步骤 1：进入项目页面

在侧边栏中点击 **"Projects New"**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/889e2e55-af7a-42f1-90d5-8bba8efaa986/ascreenshot_c42e33e2226c4e8b8e8ea83a7c8955e4_text_export.jpeg)

### 步骤 2：创建新项目

点击 **"Create Project"**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/8ecb531c-8e96-443d-ba1d-1a9e04ba2da3/ascreenshot_74f1b3c1c1b84517ae51881a050df73a_text_export.jpeg)

### 步骤 3：填写项目名称

点击 **"Project Name"** 输入框，为项目填写一个名称。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/83bf0612-2b19-4b28-ae02-bdb122dca4fa/ascreenshot_16ca328a71f04a79bb9641ab9c1ed6fe_text_export.jpeg)

### 步骤 4：选择团队

选择该项目从属于哪个团队。项目的适用范围限定在所属团队之内，因此你只能访问该团队可用的模型与功能。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/653c2f1e-5140-49b8-962f-a2b112f4834c/ascreenshot_7861310ad77d4859adcae789a9d51bd0_text_export.jpeg)

### 步骤 5：配置模型访问

选择该项目可以访问的模型。可选模型以该团队被允许使用的模型为范围。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/401a5716-ea16-4744-866a-d0ed6007065d/ascreenshot_a936c3ca417a49b2b603c890dee9d0ea_text_export.jpeg)

### 步骤 6：创建项目

点击 **"Create Project"** 保存项目。

![](https://colony-recorder.s3.amazonaws.com/files/2026-03-01/2f9f9ba1-df0b-4bef-b17c-77dfc38372f7/ascreenshot_933e4c1b119d43beb84161b94b17b764_text_export.jpeg)

## 使用场景

### 团队内的密钥组织

在团队内部按用例或应用组织 API 密钥。把相关的密钥归入同一个项目，就能将预算、模型访问和权限当作一个整体来管理，而无需逐个设置。

### 成本分摊

将项目分配给不同的成本中心或团队。按项目追踪花费，并把成本归集到对应的团队或业务部门。

### 功能灰度发布

为新功能或试验性用例创建专用项目。在测试期间控制可用模型的范围，并设置保守的速率限制。

### 客户分层

如果你是平台方，可以为不同的客户群体或用例分别创建项目，并按群体独立控制资源分配。

## 下一步

创建项目之后：

1. **生成 API 密钥**：创建从属于该项目的 API 密钥，供应用使用
2. **设置预算**：通过 [项目管理 API](./project_management.md) 配置项目级预算上限
3. **追踪花费**：在 Usage 仪表板中查看项目级花费
4. **管理访问**：使用 [访问组（Access Groups）](./access_groups.md) 控制模型与 MCP（Model Context Protocol）服务器的访问权限

## 相关文档

- [项目管理 API](./project_management.md)：项目 API 的完整参考
- [访问组（Access Groups）](./access_groups.md)：为模型、MCP 服务器和 Agent 定义可复用的访问控制
- [虚拟密钥（Virtual Keys）](./virtual_keys.md)：创建并管理从属于项目的 API 密钥
- [基于角色的访问控制（Role-based Access Control）](./access_control.md)：组织、团队与用户角色
- [花费日志（Spend Logs）](./spend_logs_deletion.md)：追踪请求级别的详细成本与用量
