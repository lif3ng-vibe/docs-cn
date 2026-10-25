---
title: "日志流式传输"
description: "日志流式传输让你可以把有关 Tailscale 网络（即 tailnet）的[配置审计日志][docs-audit-logging]或[网络流日志][docs-network-flow-logs]收集并发送到各种系统进行采集与分析"
---

最后验证于 Feb 2, 2026

> **注意**：日志流式传输[面向 Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

日志流式传输让你可以把有关 Tailscale 网络（即 tailnet）的[配置审计日志][docs-audit-logging]或[网络流日志][docs-network-flow-logs]收集并发送到各种系统进行采集与分析。

> **提示：**
>
> 你可以使用 `User-Agent: TailscaleLogStreamPublisher` 来识别 Tailscale 流量。

## 支持的集成

Tailscale 支持多种日志流式传输集成方式。

### SIEM 集成

你可以把日志流式传输到 SIEM（安全信息与事件管理，[SIEM][ln-security-info-event-management]）系统，帮助检测和响应安全威胁、设置告警和监控规则等。

我们支持向以下 SIEM 系统进行日志流式传输集成：

* [Axiom][xt-axiom]
* [Cribl][xt-cribl]
* [Datadog][xt-datadog]
* [Elasticsearch Logstash][xt-elastic-log-stash]，通过[数据流（data stream）][xt-elastic-docs-data-streams]
* [Panther][xt-panther]
* [Splunk][xt-splunk]，通过 [HTTP Event Collector][xt-splunk-http-event-collector]
* [其他 SIEM 系统][ar-additional-siem-systems]

### 云存储

我们支持向以下云存储服务进行日志流式传输集成。

#### Amazon S3 与 S3 兼容服务

你可以把日志流式传输到 Amazon S3 以及多家云存储服务商的 S3 兼容服务。

我们支持向以下 S3 存储桶类型发送日志的集成：

* [Amazon S3][xt-s3-logging]
* S3 兼容服务，包括：
  * [Storj][xt-storj]
  * [Wasabi][xt-wasabi]

#### Azure 服务

* [Azure Blob Storage][xt-azure-blob-storage]

#### Google Cloud 服务

* [Google Cloud Storage][xt-google-cloud-storage]（GCS）

### 其他集成类型

可用于日志流式传输的其他集成包括：

* [私有端点][ar-private-endpoints]
* [Vector][xt-vector]

## 前提条件

* 你需要 SIEM 集成或 S3 云存储服务商的端点与凭证。如何获取端点和 API 凭证，请查阅相应厂商的文档。
* 你需要具有 [Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles) 身份，才能添加、编辑和删除流式传输目标。

## 配置日志流式传输

配置日志流式传输让你可以把 tailnet 的审计与管理活动导出到外部监控、存储和安全平台。使用以下流程来配置、管理和移除配置审计日志的流式传输目标。

### 添加配置日志流式传输

#### SIEM 集成

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Start streaming**。
3. 在 **Start streaming configuration logs** 对话框中：
   1. 选择一个 SIEM 目标。
   2. 在 **URL** 中输入你的 SIEM 端点。端点 URL 必须使用 HTTPS 协议，端口不限。
      Splunk 的 HTTP Endpoint Connector 要求端点以 `/services/collector/event` 结尾。
      Elasticsearch 的数据流要求端点以 `<stream_id>/_bulk?pretty` 结尾。
   3. 如果你的 SIEM 系统要求填写 **Username**，输入 SIEM 用户名。
   4. 在 **Token** 中输入 SIEM API 令牌。
4. 选择 **Start streaming**。

*（图：Start streaming configuration logs 对话框，列出多个可用目标。）*

请检查你的 SIEM 系统，确认已成功从 tailnet 进行流式传输。

#### Amazon S3

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Start streaming**。
3. 在 **Start streaming configuration logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **AWS | S3** 单选按钮。

   2. **Sub-destinations**：选择 **Amazon S3** 单选按钮。

   3. **Region**：输入 S3 存储桶所在的 AWS 区域。可用 AWS 区域列表参见 [AWS service endpoints][xt-aws-regions]。

   4. **Bucket**：输入要上传日志的 S3 存储桶名称。

   5. **Compression**：选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。

   6. **Upload period**：输入上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。

   7. （可选）**Object key prefix**：输入用作文件名前缀的 S3 对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的 S3 对象键。这样你可以把审计日志和网络日志上传到同一个 S3 存储桶，同时能区分数据。

   8. **Role ARN**：输入 Amazon Resource Name（ARN）。这会授予你的 tailnet 向你的 S3 存储桶写入的权限。更多信息参见 [Access to AWS accounts owned by third parties][xt-aws-arn]。

   9. **Required IAM trust policy**：复制生成的详细信息并编辑到现有的 [AWS 角色信任策略][xt-aws-trust-policy]中，或在 [AWS IAM 控制台][xt-aws-iam-console]中创建新的信任策略。所提供的 `Principal` 和 `Condition` 字符串值是你的集成独有的，必须按显示原样添加。

      以下信任策略示例展示了把这些详细信息添加到哪里以及应采用的格式。

      ```json
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": "891612552178"
            },
            "Condition": {
              "StringEquals": {
                "sts:ExternalId": "69f73fe7-cfcc-414e-8d45-35eb5d70fe7d"
              }
            },
            "Action": "sts:AssumeRole"
          }
        ]
      }
      ```

   10. 在 [AWS IAM 控制台][xt-aws-iam-console]中添加一条 [AWS 角色权限策略][xt-aws-permission-policy]，允许向你的 S3 存储桶发送对象。

       以下权限策略示例展示了把这些详细信息添加到哪里以及应采用的格式。

       ```json
       {
         "Version": "2012-10-17",
         "Statement": {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject"
           ],
           "Resource": "arn:aws:s3:::yourBucketName/*"
         }
       }
       ```

   11. 在管理控制台的 **Start streaming configuration logs** 对话框中，选择 **Start streaming**。
4. 检查你的 S3 监控工具，确认已成功把配置审计日志从 tailnet 流式传输到你的 S3 存储桶。

没有数据可发送时，Amazon S3 集成会生成一个空文件，这是预期行为。

#### S3 兼容服务

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Start streaming**。
3. 在 **Start streaming configuration logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **AWS | S3** 单选按钮。
   2. **Sub-destinations**：选择 **S3 compatible service** 单选按钮。
   3. **URL**：输入你所使用的 S3 兼容服务的 API 端点，指明请求发送到哪里。
   4. **Bucket**：输入要上传日志的存储桶。如果 tailnet DNS 名称已添加到你的 tailnet，你可以将其用作 S3 存储桶。
   5. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   6. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。
   7. （可选）**Object key prefix**：输入用作文件名前缀的对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的对象键。这样你可以把审计日志和网络日志上传到同一个存储桶，同时能区分数据。
   8. （可选）**Region**：如果你的 S3 兼容服务要求指定区域，输入存储桶所在区域。
   9. **Access key ID**：输入你所使用的 S3 兼容服务提供的访问密钥 ID。
   10. **Secret access key**：输入你所使用的 S3 兼容服务提供的秘密访问密钥。
   11. 选择 **Start streaming**。
4. 检查你的监控工具，确认已成功把配置审计日志从 tailnet 流式传输到你的 S3 兼容存储桶。

没有数据可发送时，S3 兼容集成会生成一个空文件，这是预期行为。

#### Google Cloud Storage

#### 配置日志流式传输的 Google Cloud Storage 前提条件

在 Tailscale 管理控制台配置日志设置之前，你必须先[创建 Google 服务账户][xt-google-cloud-iam-service-account]，并为 AWS [配置与 AWS 或 Azure 虚拟机的工作负载身份联合][xt-google-cloud-iam-aws-azure]。

按照["Add a workload identity pool provider"步骤][xt-google-cloud-iam-aws-azure-provider]操作时，必须把 `account-id` 属性设置为：

```
891612552178
```

示例

1. 创建服务账户。

   示例：

   ```
   <tailnet-uploader>
   ```

   ```
   <tailnet-uploader>@<project>.iam.gserviceaccount.com
   ```

   建议为服务账户分配 [`storage.objectCreator`][xt-google-cloud-iam-objectcreator-role] 角色。

2. 创建新的工作负载身份池。

   示例：

   ```shell
   gcloud iam workload-identity-pools create <tailnet-logstreaming-pool> \
     --location="global" \
     --display-name="Logstreaming Pool"
   ```

3. 添加 Tailscale 的公共工作负载身份池提供方。

   示例：

   ```shell
   gcloud iam workload-identity-pools providers create-aws <tailnet-aws-provider> \
     --location="global" \
     --workload-identity-pool="<tailnet-logstreaming-pool>" \
     --account-id="891612552178" \
     --display-name="AWS provider for logstreaming"
   ```

4. 为工作负载认证。

   示例：

   ```shell
   gcloud iam service-accounts add-iam-policy-binding \
     <tailnet-uploader>@<project>.iam.gserviceaccount.com \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/<tailnet-logstreaming-pool>/*"
   ```

#### 配置日志流式传输的 Google Cloud Storage 步骤

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Start streaming**。
3. 在 **Start streaming configuration logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **Google Cloud** 单选按钮。
   2. **Bucket**：输入要上传日志的 GCS 存储桶。如果 tailnet DNS 名称已添加到你的 tailnet，你可以将其用作 GCS 存储桶。
   3. （可选）**Object key prefix**：输入用作文件名前缀的对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的对象键。这样你可以把审计日志和网络日志上传到同一个存储桶，同时能区分数据。
   4. **Scopes**：指定以逗号分隔的[授权范围][xt-google-cloud-auth-scopes]。出于安全考虑，只授予最小权限（`https://www.googleapis.com/auth/devstorage.write_only`）。
   5. **Config file content**：按照["Download or create a credential configuration"步骤][xt-google-cloud-iam-aws-azure-config]操作，并在此处提供配置文件内容。
   6. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   7. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。
   8. 选择 **Start streaming**。
4. 检查你的监控工具，确认已成功把配置审计日志从 tailnet 流式传输到你的 GCS 存储桶。

没有数据可发送时，Google Cloud Storage 集成会生成一个空文件，这是预期行为。

#### Azure Blob Storage

#### 配置日志流式传输的 Azure Blob Storage 前提条件

在 Tailscale 管理控制台配置日志设置之前，你必须先[创建 Azure 存储账户][xt-azure-storage-account]和容器、[注册应用程序][xt-azure-register-app]、添加[联合凭证][xt-azure-federated-identity]，并[授予写入访问权限][xt-azure-rbac]。

这可以通过 [Azure Portal][xt-azure-portal]（网页界面）或 [Azure CLI][xt-azure-cli]（命令行界面）完成，只需其中一种即可。

##### 配置日志流式传输的 Azure Blob Storage 前提条件（Azure Portal）

Azure Portal 前提条件

**注册应用程序**

1. 登录 Microsoft Entra 管理中心。
2. 选择 **App registrations**。
3. 选择 **New registration**。你会进入 **Register an application** 页面。
   1. 创建应用程序 **Name**。例如 `tailscale-logstreaming-writer`。之后它会作为成员用于你的存储账户。
   2. 选择 **Register**。你会进入新应用程序的 **Overview** 页面。
4. 记下 **Application (client) ID**。之后它将作为你的 **Client ID** 值。
5. 记下 **Directory (tenant) ID**。之后它将作为你的 **Tenant ID** 值。

**添加联合凭证**

仍在 Microsoft Entra 管理中心的应用程序 **Overview** 页面上：

1. 选择 **Certificates & secrets**。
2. 选择 **Federated credentials**。
3. 选择 **Add credential**。你会进入 **Add a credential** 页面。
   1. 将 **Federated credential scenario** 设为 **Other issuer**。

   2. 设置 **Issuer**（颁发者 URL）：

      ```
      https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws
      ```

   3. 设置 **Value**（主题）：

      ```
      arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole
      ```

   4. 设置 **Name**。例如：`tailscale-aws-federation`。

   5. 确保 **Audience** 使用 `api://AzureADTokenExchange`。

   6. 选择 **Add**。

**创建存储账户**

1. 登录 Azure Portal。
2. 使用 **Create a resource** 导航并选择 **Storage accounts**。
3. 选择 **Create**。你会进入 **Create a storage account** 页面。
   1. 选择合适的 **Subscription**。
   2. 新建或选择示例 **Resource group**。例如：`tailscale-logstreaming`。
   3. 新建 **Storage account name**。例如：`tailscalelogstorage`。
   4. 设置 **Region**。例如：**(US) West US 2**。
   5. 设置 **Performance**。推荐 **Standard** 选项。
   6. 设置 **Primary service**。**Azure Blob Storage or Azure Data Lake Storage** 选项有效。
   7. 设置 **Redundancy**。推荐 **Geo-redundant storage (GRS)** 和 **Make read access to data available in the event of regional unavailability** 选项。
   8. 选择 **Review + create**。
4. 选择 **Create**。
5. 选择 **Data storage**
6. 选择 **Containers**。
7. 选择 **Add container**
   1. 设置容器 **Name**。例如：`tailscale-logs`。之后它将作为你的 **Container name** 值。
   2. 选择 **Create**。
8. 选择 **Settings**。
9. 选择 **Endpoints**。
10. 记下 **Blob service**。之后它将作为你的 **Storage account URL** 值。

**授予写入访问权限（RBAC）**

仍在 Azure Portal 的账户 **Overview** 页面上：

1. 选择 **Access Control**（IAM）。这会打开 **Access Control** 窗格。
2. 选择 **Add**。
3. 选择 **Add role assignment**。你会被重定向到 **Add role assignment** 页面。
   1. 在 **Job function roles** 下，将角色筛选为 **Storage Blob Data Contributor**。
   2. 选择 **Storage Blob Data Contributor**。
   3. 选择 **Next**。你会进入 **Members** 窗格。
      1. 将 **Assign access to** 设为 **User, group, or service principal**。
      2. 选择 **Select members**。
         1. 将成员筛选为你之前创建的应用程序。例如：`tailscale-logstreaming-writer`。
         2. 选择你的应用程序。
         3. 选择 **Select**。
      3. 选择 **Review + assign**。

##### 配置日志流式传输的 Azure Blob Storage 前提条件（Azure CLI）

Azure CLI 前提条件

1. 使用 Azure CLI 登录。

   ```shell
   az login
   ```

2. 定义自定义配置值。

   要使用 Tailscale 联合凭证，必须使用以下值：

   ```shell
   TAILSCALE_ISSUER="https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws"
   TAILSCALE_SUBJECT="arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole"
   ```

   以下示例值将用于其他步骤。你可以根据需要自定义。

   ```shell
   LOCATION="westus2"
   RESOURCE_GROUP="tailscale-logstreaming"
   STORAGE_ACCOUNT="tailscalelogstorage"
   CONTAINER_NAME="tailscale-logs"
   APP_NAME="tailscale-logstreaming-writer"
   ```

3. 注册应用程序。

   ```shell
   APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)

   az ad sp create --id "$APP_ID"

   TENANT_ID=$(az account show --query tenantId -o tsv)
   ```

4. 添加联合凭证。

   ```shell
   az ad app federated-credential create \
     --id "$APP_ID" \
     --parameters "{
       \"name\": \"tailscale-aws-federation\",
       \"issuer\": \"${TAILSCALE_ISSUER}\",
       \"subject\": \"${TAILSCALE_SUBJECT}\",
       \"audiences\": [\"api://AzureADTokenExchange\"]
     }"
   ```

5. 创建存储账户和容器。

   ```shell
   az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

   az storage account create \
     --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" \
     --location "$LOCATION" --sku Standard_GRS --kind StorageV2

   az storage container create \
     --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --auth-mode login
   ```

6. 授予写入访问权限（RBAC）。

   ```shell
   SUB_ID=$(az account show --query id -o tsv)
   SCOPE="/subscriptions/${SUB_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT}/blobServices/default/containers/${CONTAINER_NAME}"
   SP_OBJECT_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv)

   az role assignment create \
     --assignee-object-id "$SP_OBJECT_ID" \
     --assignee-principal-type ServicePrincipal \
     --role "Storage Blob Data Contributor" \
     --scope "$SCOPE"
   ```

   要在整个存储账户级别而非单个容器级别授予权限，从 `$SCOPE` 中去掉 `/blobServices/default/containers/${CONTAINER_NAME}` 后缀即可。推荐默认使用容器级范围，因为它授予 Tailscale 的权限最小。

7. 导出需要填入 Tailscale 管理控制台的值。

   ```shell
   echo "ContainerName     = ${CONTAINER_NAME}"
   echo "TenantID          = ${TENANT_ID}"
   echo "ClientID          = ${APP_ID}"
   echo "StorageAccountURL = https://${STORAGE_ACCOUNT}.blob.core.windows.net"
   ```

#### 配置日志流式传输的 Azure Blob Storage 步骤

1. 打开 Tailscale 管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 选择 **Start streaming**。
3. 在 **Start streaming configuration logs** 界面中输入以下信息：
   1. **Select a destination**：选择 **Azure** 单选按钮。
   2. **Container name**：这是你在前提条件中创建的 Azure 容器名称。应为 3-63 个小写字母、数字和连字符组成的字符串。
   3. （可选）**Key prefix**：输入用作文件名前缀的对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的对象键。这样你可以把审计日志和网络日志上传到同一个容器，同时能区分数据。
   4. **Tenant ID**：这是你在前提条件中注册应用后的 **Directory (tenant) ID**（或 `tenantId`）。应为小写字母、数字和连字符组成的字符串。
   5. **Client ID**：这是你在前提条件中注册应用后的 **Application (client) ID**（或 `id`）。应为小写字母、数字和连字符组成的字符串。
   6. **Storage account URL**：这是账户的 blob 端点（基于账户名）。应形如：`https://<storage-account>.blob.core.windows.net`。
   7. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   8. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟。可选范围为 1 分钟到 24 小时。
   9. 选择 **Start streaming**。
4. 检查你的监控工具，确认已成功把配置审计日志从 tailnet 流式传输到你的 Azure 容器。

没有数据可发送时，Azure Blob Storage 集成会生成一个空文件，这是预期行为。

> **注意：**
>
> 受网络状况影响，日志流式传输的内容可能会延迟出现在你的第三方工具中。

### 编辑配置日志流式传输目标

你可以更改向首选流式传输目标传递日志的信息。

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 对于要更新的系统，选择 **Action** 下拉框，然后选择 **Edit**。
3. 按需更新各项值。
4. 选择 **Save changes**。

> **注意：**
>
> 如果你在编辑 Amazon S3 存储桶的日志流式传输目标，当资源名称已属于指定的 AWS 账户时，你可以更新 **Role ARN** 字段（Amazon 资源名称）。如果该角色不属于该 AWS 账户，则必须在管理控制台中删除该日志流式传输目标并重新创建。

### 删除配置日志流式传输目标

1. 打开管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面。
2. 对于要删除的集成，选择 **Action** 下拉框，然后选择 **Delete**。
3. 在确认对话框中选择 **Delete**。

## 网络日志流式传输

网络日志流式传输让你可以把 tailnet 的网络流日志导出到外部监控、存储和分析平台。以下流程说明如何配置、更新和移除网络流日志的流式传输目标。

### 添加网络日志流式传输目标

#### SIEM 集成

1. 如果尚未启用，先为你的 tailnet [启用网络流日志][docs-network-flow-logs-enable]。
2. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
3. 选择 **Start streaming**。
4. 在 **Start streaming network logs** 对话框中：
   1. 选择一个 SIEM 目标。
   2. 在 **URL** 中输入你的 SIEM 端点。端点 URL 必须使用 HTTPS 协议，端口不限。
      Splunk 的 HTTP Endpoint Connector 要求端点以 `/services/collector/event` 结尾。
      Elasticsearch 的数据流端点以 `<stream_id>/_bulk?pretty` 结尾。
   3. 如果你的 SIEM 系统要求填写 **Username**，输入 SIEM 用户名。
   4. 在 **Token** 中输入 SIEM API 令牌。
5. 选择 **Start streaming**。

*（图：Start streaming network logs 对话框，列出多个可用目标。）*

请检查你的 SIEM 系统，确认已成功从 tailnet 进行流式传输。

#### Amazon S3

1. 确保你的 tailnet 已[启用网络流日志][docs-network-flow-logs-enable]。
2. 选择 **Start streaming**。
3. 在 **Start streaming network logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **AWS | S3** 单选按钮。

   2. **Sub-destinations**：选择 **Amazon S3** 单选按钮。

   3. **Region**：输入 S3 存储桶所在的 AWS 区域。可用 AWS 区域列表参见 [AWS service endpoints][xt-aws-regions]。

   4. **Bucket**：输入要上传日志的 S3 存储桶名称。

   5. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。

   6. **Upload period**：输入上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。

   7. （可选）**Object key prefix**：输入用作文件名前缀的 S3 对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的 S3 对象键。这样你可以把审计日志和网络日志上传到同一个 S3 存储桶，同时能区分数据。

   8. **Role ARN**：输入 Amazon Resource Name（ARN）。这会授予你的 tailnet 向你的 S3 存储桶写入的权限。更多信息参见 [Access to AWS accounts owned by third parties][xt-aws-arn]。

   9. **Required IAM trust policy**：复制生成的详细信息并编辑到现有的 [AWS 角色信任策略][xt-aws-trust-policy]中，或在 [AWS IAM 控制台][xt-aws-iam-console]中创建新的信任策略。所提供的 `Principal` 和 `Condition` 字符串值是你的集成独有的，必须按显示原样添加。

      以下信任策略示例展示了把这些详细信息添加到哪里以及应采用的格式。

      ```json
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": "891612552178"
            },
            "Condition": {
              "StringEquals": {
                "sts:ExternalId": "69f73fe7-cfcc-414e-8d45-35eb5d70fe7d"
              }
            },
            "Action": "sts:AssumeRole"
          }
        ]
      }
      ```

   10. 在 [AWS IAM 控制台][xt-aws-iam-console]中添加一条 [AWS 角色权限策略][xt-aws-permission-policy]，允许向你的 S3 存储桶发送对象。

       以下权限策略示例展示了把这些详细信息添加到哪里以及应采用的格式。

       ```json
       {
         "Version": "2012-10-17",
         "Statement": {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject"
           ],
           "Resource": "arn:aws:s3:::yourBucketName/*"
         }
       }
       ```

   11. 在管理控制台的 **Start streaming configuration logs** 对话框中，选择 **Start streaming**。
4. 检查你的 S3 监控工具，确认已成功把网络流日志从 tailnet 流式传输到你的 S3 存储桶。

没有数据可发送时，Amazon S3 集成会生成一个空文件，这是预期行为。

#### S3 兼容服务

1. 确保你的 tailnet 已[启用网络流日志][docs-network-flow-logs-enable]。
2. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
3. 在 **Start streaming network logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **AWS | S3** 单选按钮。
   2. **Sub-destinations**：选择 **S3 compatible service** 单选按钮。
   3. **URL**：输入你所使用的 S3 兼容服务的 API 端点，指明请求发送到哪里。
   4. **Bucket**：输入要上传日志的 S3 存储桶名称。
   5. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   6. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。
   7. （可选）**Object key prefix**：输入用作文件名前缀的 S3 对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的 S3 对象键。这样你可以把审计日志和网络日志上传到同一个 S3 存储桶，同时能区分数据。
   8. （可选）**Region**：如果你的 S3 兼容服务要求指定区域，输入存储桶所在区域。
   9. **Access key ID**：输入你所使用的 S3 兼容服务提供的访问密钥 ID。
   10. **Secret access key**：输入你所使用的 S3 兼容服务提供的秘密访问密钥。
   11. 选择 **Start streaming**。
4. 检查你的 S3 监控工具，确认已成功把网络流日志从 tailnet 流式传输到你的 S3 兼容存储桶。

没有数据可发送时，S3 兼容集成会生成一个空文件，这是预期行为。

#### Google Cloud Storage

#### 网络日志流式传输的 Google Cloud Storage 前提条件

在 Tailscale 管理控制台配置日志设置之前，你必须先[创建 Google 服务账户][xt-google-cloud-iam-service-account]，并为 AWS [配置与 AWS 或 Azure 虚拟机的工作负载身份联合][xt-google-cloud-iam-aws-azure]。

按照["Add a workload identity pool provider"步骤][xt-google-cloud-iam-aws-azure-provider]操作时，必须把 `account-id` 属性设置为：

```
891612552178
```

示例

1. 创建服务账户。

   示例：

   ```
   <tailnet-uploader>
   ```

   ```
   <tailnet-uploader>@<project>.iam.gserviceaccount.com
   ```

   建议为服务账户分配 [`storage.objectCreator`][xt-google-cloud-iam-objectcreator-role] 角色。

2. 创建新的工作负载身份池。

   示例：

   ```shell
   gcloud iam workload-identity-pools create <tailnet-logstreaming-pool> \
     --location="global" \
     --display-name="Logstreaming Pool"
   ```

3. 添加 Tailscale 的公共工作负载身份池提供方。

   示例：

   ```shell
   gcloud iam workload-identity-pools providers create-aws <tailnet-aws-provider> \
     --location="global" \
     --workload-identity-pool="<tailnet-logstreaming-pool>" \
     --account-id="891612552178" \
     --display-name="AWS provider for logstreaming"
   ```

4. 为工作负载认证。

   示例：

   ```shell
   gcloud iam service-accounts add-iam-policy-binding \
     <tailnet-uploader>@><project>.iam.gserviceaccount.com \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/<tailnet-logstreaming-pool>/*"
   ```

#### 网络日志流式传输的 Google Cloud Storage 步骤

1. 确保你的 tailnet 已[启用网络流日志][docs-network-flow-logs-enable]。
2. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
3. 选择 **Start streaming**。
4. 在 **Start streaming network logs** 对话框中输入以下信息：
   1. **Select a destination**：选择 **Google Cloud** 单选按钮。
   2. **Bucket**：输入要上传日志的 GCS 存储桶。如果 tailnet DNS 名称已添加到你的 tailnet，你可以将其用作 GCS 存储桶。
   3. （可选）**Object key prefix**：输入用作文件名前缀的对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的对象键。这样你可以把审计日志和网络日志上传到同一个存储桶，同时能区分数据。
   4. **Scopes:** 指定以逗号分隔的[授权范围][xt-google-cloud-auth-scopes]。出于安全考虑，只授予最小权限（`https://www.googleapis.com/auth/devstorage.write_only`）。
   5. **Config file content**：按照["Download or create a credential configuration"步骤][xt-google-cloud-iam-aws-azure-config]操作，并在此处提供配置文件内容。
   6. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   7. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟，可选范围为 1 分钟到 24 小时。
   8. 选择 **Start streaming**。
5. 检查你的监控工具，确认已成功把网络流日志从 tailnet 流式传输到你的 GCS 存储桶。

没有数据可发送时，Google Cloud Storage 集成会生成一个空文件，这是预期行为。

#### Azure Blob Storage

#### 网络日志流式传输的 Azure Blob Storage 前提条件

在 Tailscale 管理控制台配置日志设置之前，你必须先[创建 Azure 存储账户][xt-azure-storage-account]和容器、[注册应用程序][xt-azure-register-app]、添加[联合凭证][xt-azure-federated-identity]，并[授予写入访问权限][xt-azure-rbac]。

这可以通过 [Azure Portal][xt-azure-portal]（网页界面）或 [Azure CLI][xt-azure-cli]（命令行界面）完成，只需其中一种即可。

##### 网络日志流式传输的 Azure Blob Storage 前提条件（Azure Portal）

Azure Portal 前提条件

**注册应用程序**

1. 登录 Microsoft Entra 管理中心。
2. 选择 **App registrations**。
3. 选择 **New registration**。你会进入 **Register an application** 页面。
   1. 创建应用程序 **Name**。例如 `tailscale-logstreaming-writer`。之后它会作为成员用于你的存储账户。
   2. 选择 **Register**。你会进入新应用程序的 **Overview** 页面。
4. 记下 **Application (client) ID**。之后它将作为你的 **Client ID** 值。
5. 记下 **Directory (tenant) ID**。之后它将作为你的 **Tenant ID** 值。

**添加联合凭证**

仍在 Microsoft Entra 管理中心的应用程序 **Overview** 页面上：

1. 选择 **Certificates & secrets**。
2. 选择 **Federated credentials**。
3. 选择 **Add credential**。你会进入 **Add a credential** 页面。
   1. 将 **Federated credential scenario** 设为 **Other issuer**。

   2. 设置 **Issuer**（颁发者 URL）：

      ```
      https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws
      ```

   3. 设置 **Value**（主题）：

      ```
      arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole
      ```

   4. 设置 **Name**。例如：`tailscale-aws-federation`。

   5. 确保 **Audience** 使用 `api://AzureADTokenExchange`。

   6. 选择 **Add**。

**创建存储账户**

1. 登录 Azure Portal。
2. 使用 **Create a resource** 导航并选择 **Storage accounts**。
3. 选择 **Create**。你会进入 **Create a storage account** 页面。
   1. 选择合适的 **Subscription**。
   2. 新建或选择示例 **Resource group**。例如：`tailscale-logstreaming`。
   3. 新建 **Storage account name**。例如：`tailscalelogstorage`。
   4. 设置 **Region**。例如：**(US) West US 2**。
   5. 设置 **Performance**。推荐 **Standard** 选项。
   6. 设置 **Primary service**。**Azure Blob Storage or Azure Data Lake Storage** 选项有效。
   7. 设置 **Redundancy**。推荐 **Geo-redundant storage (GRS)** 和 **Make read access to data available in the event of regional unavailability** 选项。
   8. 选择 **Review + create**。
4. 选择 **Create**。
5. 选择 **Data storage**
6. 选择 **Containers**。
7. 选择 **Add container**
   1. 设置容器 **Name**。例如：`tailscale-logs`。之后它将作为你的 **Container name** 值。
   2. 选择 **Create**。
8. 选择 **Settings**。
9. 选择 **Endpoints**。
10. 记下 **Blob service**。之后它将作为你的 **Storage account URL** 值。

**授予写入访问权限（RBAC）**

仍在 Azure Portal 的账户 **Overview** 页面上：

1. 选择 **Access Control**（IAM）。这会打开 **Access Control** 窗格。
2. 选择 **Add**。
3. 选择 **Add role assignment**。你会被重定向到 **Add role assignment** 页面。
   1. 在 **Job function roles** 下，将角色筛选为 **Storage Blob Data Contributor**。
   2. 选择 **Storage Blob Data Contributor**。
   3. 选择 **Next**。你会进入 **Members** 窗格。
      1. 将 **Assign access to** 设为 **User, group, or service principal**。
      2. 选择 **Select members**。
         1. 将成员筛选为你之前创建的应用程序。例如：`tailscale-logstreaming-writer`。
         2. 选择你的应用程序。
         3. 选择 **Select**。
      3. 选择 **Review + assign**。

##### 网络日志流式传输的 Azure Blob Storage 前提条件（Azure CLI）

Azure CLI 前提条件

1. 使用 Azure CLI 登录。

   ```shell
   az login
   ```

2. 定义自定义配置值。

   要使用 Tailscale 联合凭证，必须使用以下值：

   ```shell
   TAILSCALE_ISSUER="https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws"
   TAILSCALE_SUBJECT="arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole"
   ```

   以下示例值将用于其他步骤。你可以根据需要自定义。

   ```shell
   LOCATION="westus2"
   RESOURCE_GROUP="tailscale-logstreaming"
   STORAGE_ACCOUNT="tailscalelogstorage"
   CONTAINER_NAME="tailscale-logs"
   APP_NAME="tailscale-logstreaming-writer"
   ```

3. 注册应用程序。

   ```shell
   APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)

   az ad sp create --id "$APP_ID"

   TENANT_ID=$(az account show --query tenantId -o tsv)
   ```

4. 添加联合凭证。

   ```shell
   az ad app federated-credential create \
     --id "$APP_ID" \
     --parameters "{
       \"name\": \"tailscale-aws-federation\",
       \"issuer\": \"${TAILSCALE_ISSUER}\",
       \"subject\": \"${TAILSCALE_SUBJECT}\",
       \"audiences\": [\"api://AzureADTokenExchange\"]
     }"
   ```

5. 创建存储账户和容器。

   ```shell
   az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

   az storage account create \
     --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" \
     --location "$LOCATION" --sku Standard_GRS --kind StorageV2

   az storage container create \
     --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --auth-mode login
   ```

6. 授予写入访问权限（RBAC）。

   ```shell
   SUB_ID=$(az account show --query id -o tsv)
   SCOPE="/subscriptions/${SUB_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT}/blobServices/default/containers/${CONTAINER_NAME}"
   SP_OBJECT_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv)

   az role assignment create \
     --assignee-object-id "$SP_OBJECT_ID" \
     --assignee-principal-type ServicePrincipal \
     --role "Storage Blob Data Contributor" \
     --scope "$SCOPE"
   ```

   要在整个存储账户级别而非单个容器级别授予权限，从 `$SCOPE` 中去掉 `/blobServices/default/containers/${CONTAINER_NAME}` 后缀即可。推荐默认使用容器级范围，因为它授予 Tailscale 的权限最小。

7. 导出需要填入 Tailscale 管理控制台的值。

   ```shell
   echo "ContainerName     = ${CONTAINER_NAME}"
   echo "TenantID          = ${TENANT_ID}"
   echo "ClientID          = ${APP_ID}"
   echo "StorageAccountURL = https://${STORAGE_ACCOUNT}.blob.core.windows.net"
   ```

#### 网络日志流式传输的 Azure Blob Storage 步骤

1. 确保你的 tailnet 已[启用网络流日志][docs-network-flow-logs-enable]。
2. 打开 Tailscale 管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
3. 选择 **Start streaming**。
4. 在 **Start streaming network logs** 界面中输入以下信息：
   1. **Select a destination**：选择 **Azure** 单选按钮。
   2. **Container name**：这是你在前提条件中创建的 Azure 容器名称。应为 3-63 个小写字母、数字和连字符组成的字符串。
   3. （可选）**Key prefix**：输入用作文件名前缀的对象键。例如，前缀 `audit-logs/` 会生成类似 `audit-logs/2024/04/22/12:34:56.json` 的对象键。这样你可以把审计日志和网络日志上传到同一个容器，同时能区分数据。
   4. **Tenant ID**：这是你在前提条件中注册应用后的 **Directory (tenant) ID**（或 `tenantId`）。应为小写字母、数字和连字符组成的字符串。
   5. **Client ID**：这是你在前提条件中注册应用后的 **Application (client) ID**（或 `id`）。应为小写字母、数字和连字符组成的字符串。
   6. **Storage account URL**：这是账户的 blob 端点（基于账户名）。应形如：`https://<storage-account>.blob.core.windows.net`。
   7. **Compression**：从下拉菜单中选择 `none`、`zstd` 或 `gzip`。默认压缩方式为 `zstd`。
   8. **Upload period**：指定上传新对象的频率（以分钟为单位）。需考虑延迟和带宽。默认周期为 1 分钟。可选范围为 1 分钟到 24 小时。
   9. 选择 **Start streaming**。
5. 检查你的监控工具，确认已成功把网络流日志从 tailnet 流式传输到你的 Azure 容器。

没有数据可发送时，Azure Blob Storage 集成会生成一个空文件，这是预期行为。

> **注意：**
>
> 受网络状况影响，日志流式传输的内容可能会延迟出现在你的第三方工具中。

### 编辑网络日志流式传输目标

你可以更改向首选流式传输目标传递日志的信息。

1. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
2. 对于要更新的系统，选择 **Action** 下拉框，然后选择 **Edit**。
3. 按需更新各项值。
4. 选择 **Save changes**。

> **注意：**
>
> 如果你在编辑 Amazon S3 存储桶的日志流式传输目标，当资源名称已属于指定的 AWS 账户时，你可以更新 **Role ARN** 字段（Amazon 资源名称）。如果该角色不属于该 AWS 账户，则必须在管理控制台中删除该日志流式传输目标并重新创建。

### 删除网络日志流式传输目标

1. 打开管理控制台的 [Network flow logs](https://console.tailscale.com/admin/logs/network) 页面。
2. 对于要删除的集成，选择 **Action** 下拉框，然后选择 **Delete**。
3. 在确认对话框中选择 **Delete**。

## 私有端点

日志流式传输可以把日志发布到公网上可直接访问的主机，这种情况下端点必须使用 HTTPS 以保证安全。
另外，日志流式传输也可以借助 Tailscale 建立连接，
把日志发布到公网上无法直接访问的私有主机。
此时可以使用纯 HTTP，因为底层传输已由 Tailscale 使用 WireGuard 加密保护。

系统会根据端点 URL 中指定的主机自动检测是否为私有主机上的日志流式传输。

*（图：私有端点所用 URL 的示例。）*

主机必须指向你 tailnet 内的一个节点，可以是以下任意一种：

* Tailscale 节点的名称（例如 `splunk`）。
* Tailscale 节点的[完全限定域名][docs-magicdns-fqdn-vs-machine-names]（例如 `splunk.yak-bebop.ts.net`）。
* Tailscale 节点的 IPv6 地址（例如 `fd7a:115c:a1e0:ab12:0123:4567:89ab:cdef`）。

> **注意：**
>
> 日志流式传输仅支持 IPv6 地址。IPv4 地址不受支持，因为 Tailscale 对单个 tailnet 内分配给节点的 IPv4 地址使用 CGNAT，这会带来问题：IPv4 地址在 tailnet 内可能被重复使用。IPv6 地址不会被复用，主机名也始终能路由到正确的节点。

私有端点的日志流式传输的工作方式是：把你[共享][docs-sharing]到一个由 Tailscale 管理的 tailnet 中，由 Tailscale 管理的节点直接把日志发布到你的节点。这既需要把你的节点共享给 Tailscale 的 `logstream` tailnet，也需要修改你的[策略文件][docs-acls]，以允许来自 `logstream@tailscale` 用户的入站流量访问你的节点。

添加或更新指向私有主机的端点时，控制平面可能需要代你共享节点和/或更新策略文件。如果还需要其他配置更改，后续会弹出对话框请求你授权执行这些操作。
这些操作会生成审计日志事件，
且操作会归属于你。

*（图：用于共享节点或更新策略文件的"Grant share access to private host"确认对话框。）*

添加或更新端点后，该节点会显示在管理控制台的
[Machines](https://console.tailscale.com/admin/machines) 页面中，
标记为已共享给 `logstream@tailscale` 用户。
同时，策略文件中会添加一条类似如下的规则：

```json
{
  // Private log streaming enables audit and network logs to be directly
  // uploaded to a node in your tailnet without exposing it to the public internet.
  // This access rule provides access for a Tailscale-managed node to upload logs
  // directly to the specified node.
  // See https://tailscale.com/docs/features/logging/log-streaming#private-endpoints
  "action": "accept",
  "src":    ["logstream@tailscale"],
  "dst":    ["[nodeAddressV6]:port"],
}
```

\[缺少代码片段：visual\_policy\_editor.mdx]

其中：

* `nodeAddressV6` 是 Tailscale 节点的 IPv6 地址。
* `port` 是日志流式传输系统的服务端口。

指定 IPv6 地址，是为了让日志流发布方能够通过 IPv6 协议与你的节点通信。

> **注意：**
>
> 日志流式传输仅支持 IPv6 地址。IPv4 地址不受支持，因为 Tailscale 对单个 tailnet 内分配给节点的 IPv4 地址使用 CGNAT，这会带来问题：IPv4 地址在 tailnet 内可能被重复使用。IPv6 地址不会被复用，主机名也始终能路由到正确的节点。

由于私有主机的日志流式传输可能需要共享节点和更新策略文件的权限，
只有 [Admin][docs-user-roles-admin] 和 [Network admin][docs-user-roles-network-admin] 角色
拥有单方面使用私有端点的足够权限。
[IT admin][docs-user-roles-it-admin] 可以共享节点，
但无法更新策略文件。
IT admin 仍然可以使用私有端点，
但需要由 Admin 或 Network admin 手动更新
策略文件之后，日志才能开始流式传输。

如果你的 tailnet 配置为使用 [GitOps 管理 Tailscale][docs-gitops-acls]，当 Tailscale 尝试更新你的策略文件以允许来自 `logstream@tailscale` 用户的入站流量时，你会收到错误。为避免此错误，请先通过 GitOps 添加一条[访问规则][docs-policy-syntax-acls]，让 `logstream@tailscale` 用户的入站流量能到达你用作私有端点的节点，然后再把你的私有端点添加为日志
流式传输 URL。

## 其他 SIEM 系统

我们尽力支持客户使用的多种常见 SIEM 系统，但无法支持市面上所有商业和开源 SIEM 及日志工具。有些 SIEM 系统提供 [Splunk HTTP Event Collector（Splunk HEC）][xt-splunk-http-event-collector]兼容端点，例如 [DataSet by SentinelOne][xt-dataset-sentinelone]。如果你的 SIEM 支持 Splunk HEC，按照上文说明配置[配置审计日志流式传输][ar-configure-audit-log-streaming]和[网络流日志流式传输][ar-network-flow-log-streaming]，即可把日志直接流式传输到你的 SIEM，如同它是 Splunk 一样。

如果我们不支持你的 SIEM 系统，你可以使用 [Vector][xt-vector]——一个开源的高性能可观测性数据管道——借助 Vector 的 Splunk HEC 支持来摄取来自 Tailscale 的日志数据，并将其投递到 Vector 支持的众多 SIEM 系统（在 Vector 术语中称为"sink"）。Vector 支持多种 [sink][xt-vector-sinks]，例如对象存储系统、消息队列系统、Grafana Loki、New Relic 等。

### Vector 部署

要将 Vector 与 Tailscale 的日志流式传输配合使用：

1. 按照 Vector 的[部署指南][xt-vector-deployment]，在你的基础设施中部署一台运行 Vector 的机器。
2. 配置 Vector 的 [Splunk HTTP Event Collector（HEC）source][xt-vector-splunk-hec]，允许 Tailscale 向 Vector 发送日志数据。
3. 为你的 SIEM 配置 [Vector sink][xt-vector-sinks]，作为日志流式传输数据的目标。
4. 按照上文说明配置[配置审计日志流式传输][ar-configure-audit-log-streaming]和[网络流日志流式传输][ar-network-flow-log-streaming]，把日志流式传输到你的 Vector 实例，最好使用[私有端点][ar-private-endpoints]。

### Vector 配置示例

下面的 Vector 配置从 `splunk_hec` source 接收数据，并将数据输出到 `file` sink：

```yaml
# /etc/vector/vector.yaml

sources:
  splunk_hec:
    type: "splunk_hec"
    address: "100.x.y.z:8088" # Your Vector Tailscale device's IP or hostname
    valid_tokens:
      - "YOUR TOKEN"

sinks:
  file_sink:
    type: "file"
    inputs:
      - "splunk_hec"
    path: "/vector-data-dir/tailscale-%Y-%m-%d.log"
    encoding:
      codec: "json"
```

[ar-additional-siem-systems]: #其他-siem-系统

[ar-configure-audit-log-streaming]: #配置日志流式传输

[ar-network-flow-log-streaming]: #网络日志流式传输

[ar-private-endpoints]: #私有端点

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-gitops-acls]: /docs/gitops

[docs-magicdns-fqdn-vs-machine-names]: /docs/features/magicdns#完全限定域名与机器名

[docs-network-flow-logs-enable]: /docs/features/logging/network-flow-logs#启用网络流日志

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-sharing]: /docs/features/sharing

[docs-user-roles-admin]: /docs/reference/user-roles#admin管理员

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-adminit-管理员

[docs-user-roles-network-admin]: /docs/reference/user-roles#network-admin网络管理员

[ln-security-info-event-management]: https://tailscale.com/learn/security-information-and-event-management

[xt-aws-arn]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html

[xt-aws-iam-console]: https://console.aws.amazon.com/iam/

[xt-aws-permission-policy]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_update-role-permissions.html

[xt-aws-regions]: https://docs.aws.amazon.com/general/latest/gr/rande.html#region-names-codes

[xt-aws-trust-policy]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_update-role-trust-policy.html

[xt-azure-blob-storage]: https://azure.microsoft.com/en-us/products/storage/blobs

[xt-azure-cli]: https://learn.microsoft.com/en-us/cli/azure/

[xt-azure-federated-identity]: https://azure.github.io/azure-workload-identity/docs/topics/federated-identity-credential.html

[xt-azure-portal]: https://learn.microsoft.com/en-us/azure/azure-portal/

[xt-azure-rbac]: https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal

[xt-azure-register-app]: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory

[xt-azure-storage-account]: https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create

[xt-axiom]: https://axiom.co

[xt-cribl]: https://cribl.io

[xt-datadog]: https://www.datadoghq.com

[xt-dataset-sentinelone]: https://app.scalyr.com/solutions/splunk-hec

[xt-elastic-docs-data-streams]: https://www.elastic.co/guide/en/elasticsearch/reference/current/data-streams.html

[xt-elastic-log-stash]: https://www.elastic.co/logstash

[xt-google-cloud-auth-scopes]: https://docs.cloud.google.com/storage/docs/reference/rpc/google.storage.control.v2#storagecontrol

[xt-google-cloud-iam-aws-azure]: https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds

[xt-google-cloud-iam-aws-azure-config]: https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds#create-cred-config

[xt-google-cloud-iam-aws-azure-provider]: https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds#create_the_workload_identity_pool_and_provider

[xt-google-cloud-iam-objectcreator-role]: https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectCreator

[xt-google-cloud-iam-service-account]: https://docs.cloud.google.com/iam/docs/service-accounts-create#iam-service-accounts-create-console

[xt-google-cloud-storage]: https://cloud.google.com/storage

[xt-panther]: https://panther.com

[xt-s3-logging]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/logging-with-S3.html

[xt-splunk-http-event-collector]: https://dev.splunk.com/enterprise/docs/devtoolshttpeventcollector

[xt-splunk]: https://www.splunk.com

[xt-storj]: https://www.storj.io/

[xt-vector-deployment]: https://vector.dev/docs/setup/deployment

[xt-vector-sinks]: https://vector.dev/docs/reference/configuration/sinks

[xt-vector-splunk-hec]: https://vector.dev/docs/reference/configuration/sources/splunk_hec

[xt-vector]: https://vector.dev

[xt-wasabi]: https://wasabi.com/
