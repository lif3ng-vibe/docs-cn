---
title: "Log streaming"
description: "Log streaming lets you collect and send [configuration audit logs][docs-audit-logging] or [network flow logs][docs-network-flow-logs] about your Tailscale network (known as a tailnet) into various sys"
---

Last validated Feb 2, 2026

> **Note:** Log streaming is available for [the Premium and Enterprise plans](https://tailscale.com/pricing).

Log streaming lets you collect and send [configuration audit logs][docs-audit-logging] or [network flow logs][docs-network-flow-logs] about your Tailscale network (known as a tailnet) into various systems for collection and analysis.

> **Tip:**
>
> You can use `User-Agent: TailscaleLogStreamPublisher` to identify Tailscale traffic.

## Supported integrations

Tailscale supports different ways of integrating log streaming.

### SIEM integrations

You can stream logs into a Security information and event management ([SIEM][ln-security-info-event-management]) system to help detect and respond to security threats, set up alerting and monitoring rules, and the like.

We support log streaming integrations for the following SIEM systems:

* [Axiom][xt-axiom]
* [Cribl][xt-cribl]
* [Datadog][xt-datadog]
* [Elasticsearch Logstash][xt-elastic-log-stash], through a [data stream][xt-elastic-docs-data-streams]
* [Panther][xt-panther]
* [Splunk][xt-splunk], through an [HTTP Event Collector][xt-splunk-http-event-collector]
* [Additional SIEM systems][ar-additional-siem-systems]

### Cloud Storage

We support log streaming integrations for the following cloud storage services.

#### Amazon S3 and S3-compatible services

You can stream your logs to Amazon S3 and S3-compatible services for various cloud storage providers.

We support log streaming integrations for sending logs to the following S3 bucket types:

* [Amazon S3][xt-s3-logging]
* S3-compatible services, including:
  * [Storj][xt-storj]
  * [Wasabi][xt-wasabi]

#### Azure services

* [Azure Blob Storage][xt-azure-blob-storage]

#### Google Cloud services

* [Google Cloud Storage][xt-google-cloud-storage] (GCS)

### Other integrations types

Additional integrations that you can use for log streaming include:

* [Private endpoints][ar-private-endpoints]
* [Vector][xt-vector]

## Prerequisites

* You need an endpoint and credentials for either your SIEM integration or S3 cloud storage provider. Consult your vendor's documentation for how to get an endpoint and API credentials.
* You need to be an [Owner, Admin, Network admin, or IT admin](/docs/reference/user-roles) to add, edit, and delete a streaming destination.

## Configuration log streaming

Configuration log streaming lets you export audit and administrative activity from your tailnet to external monitoring, storage, and security platforms. Use the following procedures to configure, manage, and remove streaming destinations for configuration audit logs.

### Add configuration log streaming

#### SIEM integrations

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Start streaming**.
3. In the **Start streaming configuration logs** dialog:
   1. Select a SIEM destination.
   2. For **URL**, enter your SIEM endpoint. The endpoint URL must use the HTTPS protocol, and there
      is no restriction on which port is used.
      Splunk's HTTP Endpoint Connectors require an endpoint ending with `/services/collector/event`.
      Elasticsearch's data streams require an endpoint ending with `<stream_id>/_bulk?pretty`.
   3. If your SIEM system requires a value for **Username**, enter the SIEM username.
   4. For **Token**, enter the SIEM API token.
4. Select **Start streaming**.

*（图：The 'Start streaming configuration logs' dialog. Listing several available destinations.）*

Check your SIEM system to verify you are successfully streaming from your tailnet.

#### Amazon S3

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Start streaming**.
3. In the **Start streaming configuration logs** dialog, enter the following information:
   1. **Select a destination**: Select the **AWS | S3** radio button.

   2. **Sub-destinations**: Select the **Amazon S3** radio button.

   3. **Region**: Enter AWS region where S3 bucket is located. For a list of available AWS regions, refer to [AWS service endpoints][xt-aws-regions].

   4. **Bucket**: Enter the S3 bucket name where you want to upload logs.

   5. **Compression**: Select `none`, `zstd`, or `gzip`. The default compression method is `zstd`.

   6. **Upload period**: Enter how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.

   7. (Optional) **Object key prefix** : Enter the S3 object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce S3 object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same S3 bucket, with the ability to separate the data.

   8. **Role ARN**: Enter the Amazon Resource Name (ARN). This grants your tailnet access to write to your S3 bucket. For more information, refer to [Access to AWS accounts owned by third parties][xt-aws-arn].

   9. **Required IAM trust policy**: Copy and edit the generated details into an existing [AWS role trust policy][xt-aws-trust-policy] or create a new trust policy from the [AWS IAM console][xt-aws-iam-console]. The provided `Principal` and `Condition` string values are unique to your integration and must be added as displayed.

      The following is an example of a trust policy showing you where to add these details and the formatting to use.

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

   10. Add an [AWS role permission policy][xt-aws-permission-policy] from the [AWS IAM console][xt-aws-iam-console] to allow objects to be sent to your S3 bucket.

       The following is an example of a permission policy showing you where to add these details and the formatting to use.

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

   11. In the **Start streaming configuration logs** dialog of the admin console, select **Start streaming**.
4. Check your S3 monitoring tools to verify you are successfully streaming configuration audit logs from your tailnet to your S3 bucket.

It is expected behavior for Amazon S3 integrations to generate an empty file when there is no data to send.

#### S3-compatible

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Start streaming**.
3. In the **Start streaming configuration logs** dialog, enter the following information:
   1. **Select a destination**: Select the **AWS | S3** radio button.
   2. **Sub-destinations**: Select the **S3 compatible service** radio button.
   3. **URL**: Enter the API endpoint for the S3-compatible service you are using to indicate where to send requests.
   4. **Bucket**: Enter the bucket where you want to upload logs. You can use the tailnet DNS name for the S3 bucket if it is added to your tailnet.
   5. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   6. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.
   7. (Optional) **Object key prefix** : Enter the object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same bucket, with the ability to separate the data.
   8. (Optional) **Region**: Enter the region where the bucket is located if your S3-compatible service requires a region to be specified.
   9. **Access key ID**: Enter the access key ID provided by the S3-compatible service you are using.
   10. **Secret access key**: Enter the secret access key provided by the S3-compatible service you are using.
   11. Select **Start streaming**.
4. Check your monitoring tools to verify you are successfully streaming configuration audit logs from your tailnet to your S3-compatible bucket.

It is expected behavior for S3-compatible integrations to generate an empty file when there is no data to send.

#### Google Cloud Storage

#### Google Cloud Storage prerequisites for configuration log streaming

Before you configure log settings in the Tailscale admin console, you must first [create a Google service account][xt-google-cloud-iam-service-account] and [configure workload identity federation with AWS or Azure VMs][xt-google-cloud-iam-aws-azure] for AWS.

When following the ["Add a workload identity pool provider" steps][xt-google-cloud-iam-aws-azure-provider], you must set the `account-id` attribute to:

```
891612552178
```

Examples

1. Create a service account.

   Example:

   ```
   <tailnet-uploader>
   ```

   ```
   <tailnet-uploader>@<project>.iam.gserviceaccount.com
   ```

   Assigning the [`storage.objectCreator`][xt-google-cloud-iam-objectcreator-role] role to the service account is recommended.

2. Create a new workload identity pool.

   Example:

   ```shell
   gcloud iam workload-identity-pools create <tailnet-logstreaming-pool> \
     --location="global" \
     --display-name="Logstreaming Pool"
   ```

3. Add Tailscale's public workload identity pool provider.

   Example:

   ```shell
   gcloud iam workload-identity-pools providers create-aws <tailnet-aws-provider> \
     --location="global" \
     --workload-identity-pool="<tailnet-logstreaming-pool>" \
     --account-id="891612552178" \
     --display-name="AWS provider for logstreaming"
   ```

4. Authenticate a workload.

   Example:

   ```shell
   gcloud iam service-accounts add-iam-policy-binding \
     <tailnet-uploader>@<project>.iam.gserviceaccount.com \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/<tailnet-logstreaming-pool>/*"
   ```

#### Google Cloud Storage steps for configuration log streaming

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Start streaming**.
3. In the **Start streaming configuration logs** dialog, enter the following information:
   1. **Select a destination**: Select the **Google Cloud** radio button.
   2. **Bucket**: Enter the GCS bucket where you want to upload logs. You can use the tailnet DNS name for the GCS bucket if it is added to your tailnet.
   3. (Optional) **Object key prefix** : Enter the object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same bucket, with the ability to separate the data.
   4. **Scopes**: Specify comma-separated [authorization scopes][xt-google-cloud-auth-scopes]. For security, only grant the minimal amount of permissions (`https://www.googleapis.com/auth/devstorage.write_only`).
   5. **Config file content**: Follow the ["Download or create a credential configuration" steps][xt-google-cloud-iam-aws-azure-config] and provide it here.
   6. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   7. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.
   8. Select **Start streaming**.
4. Check your monitoring tools to verify you are successfully streaming configuration audit logs from your tailnet to your GCS bucket.

It is expected behavior for Google Cloud Storage integrations to generate an empty file when there is no data to send.

#### Azure Blob Storage

#### Azure Blob Storage prerequisites for configuration log streaming

Before you configure log settings in the Tailscale admin console, you must first [create an Azure storage account][xt-azure-storage-account] and container, [register an application][xt-azure-register-app], add the [federated credentials][xt-azure-federated-identity], and [grant write access][xt-azure-rbac].

This can be achieved through the [Azure Portal][xt-azure-portal] (web interface) or the [Azure CLI][xt-azure-cli] (command line interface). Only one prerequisite is required.

##### Azure Blob Storage prerequisites for configuration log streaming (Azure Portal)

Azure Portal prerequisites

**Register an application**

1. Log in to the Microsoft Entra admin center.
2. Select **App registrations**.
3. Select **New registration**. You will be directed to a **Register an application** page.
   1. Create an application **Name**. For example, `tailscale-logstreaming-writer`. This will be used later as a member for your storage account.
   2. Select **Register**. You will be directed to an **Overview** page for your new application.
4. Make a note of the **Application (client) ID**. This will be used later as your **Client ID** value.
5. Make a note of the **Directory (tenant) ID**. This will be used later as your **Tenant ID** value.

**Add the federated credential**

While still on the Microsoft Entra admin center and on the application **Overview** page:

1. Select **Certificates & secrets**.
2. Select **Federated credentials**.
3. Select **Add credential**. You will be directed to a **Add a credential** page.
   1. Set **Federated credential scenario** to **Other issuer**.

   2. Set **Issuer** (Issuer URL):

      ```
      https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws
      ```

   3. Set **Value** (Subject):

      ```
      arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole
      ```

   4. Set **Name**. For example: `tailscale-aws-federation`.

   5. Ensure **Audience** uses `api://AzureADTokenExchange`.

   6. Select **Add**.

**Create a storage account**

1. Log in to the Azure Portal.
2. Use the **Create a resource** navigation and select **Storage accounts**.
3. Select **Create**. You will be directed to a **Create a storage account** page.
   1. Select the appropriate **Subscription**.
   2. Create a new or select an example **Resource group**. For example: `tailscale-logstreaming`.
   3. Create a new **Storage account name**. For example: `tailscalelogstorage`.
   4. Set a **Region**. For example: **(US) West US 2**.
   5. Set **Performance**. The **Standard** option is recommended.
   6. Set **Primary service**. The **Azure Blob Storage or Azure Data Lake Storage** option is valid.
   7. Set **Redundancy**. The **Geo-redundant storage (GRS)** and **Make read access to data available in the event of regional unavailability** options are recommended.
   8. Select **Review + create**.
4. Select **Create**.
5. Select **Data storage**
6. Select **Containers**.
7. Select **Add container**
   1. Set a container **Name**. For example: `tailscale-logs`. This will be used later as your **Container name** value.
   2. Select **Create**.
8. Select **Settings**.
9. Select **Endpoints**.
10. Make a note of the **Blob service**. This will be used later as your **Storage account URL** value.

**Grant write access (RBAC)**

While still on the Azure Portal and on the account **Overview** page:

1. Select **Access Control (IAM)**. This will open the **Access Control** pane.
2. Select **Add**.
3. Select **Add role assignment**. You will be redirected to the **Add role assignment** page.
   1. Under **Job function roles**, filter the roles for **Storage Blob Data Contributor**.
   2. Select **Storage Blob Data Contributor**.
   3. Select **Next**. You will be directed to the **Members** pane.
      1. Set **Assign access to** to **User, group, or service principal**.
      2. Select **Select members**.
         1. Filter the members for the application you created earlier. For example: `tailscale-logstreaming-writer`.
         2. Select your application.
         3. Select **Select**.
      3. Select **Review + assign**.

##### Azure Blob Storage prerequisites for configuration log streaming (Azure CLI)

Azure CLI prerequisites

1. Sign in with Azure CLI.

   ```shell
   az login
   ```

2. Define custom configuration values.

   You must use these values to use Tailscale federated credentials:

   ```shell
   TAILSCALE_ISSUER="https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws"
   TAILSCALE_SUBJECT="arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole"
   ```

   Here are some example values that will be used by the other steps. You can customize these to suit your needs.

   ```shell
   LOCATION="westus2"
   RESOURCE_GROUP="tailscale-logstreaming"
   STORAGE_ACCOUNT="tailscalelogstorage"
   CONTAINER_NAME="tailscale-logs"
   APP_NAME="tailscale-logstreaming-writer"
   ```

3. Register an application.

   ```shell
   APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)

   az ad sp create --id "$APP_ID"

   TENANT_ID=$(az account show --query tenantId -o tsv)
   ```

4. Add the federated credential.

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

5. Create a storage account and container.

   ```shell
   az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

   az storage account create \
     --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" \
     --location "$LOCATION" --sku Standard_GRS --kind StorageV2

   az storage container create \
     --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --auth-mode login
   ```

6. Grant write access (RBAC).

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

   To grant access at the whole storage account level instead of a single container, drop the `/blobServices/default/containers/${CONTAINER_NAME}` suffix from `$SCOPE`. Container-level scope is the recommended default, since it grants Tailscale the least privilege necessary.

7. Export values to enter in the Tailscale admin console.

   ```shell
   echo "ContainerName     = ${CONTAINER_NAME}"
   echo "TenantID          = ${TENANT_ID}"
   echo "ClientID          = ${APP_ID}"
   echo "StorageAccountURL = https://${STORAGE_ACCOUNT}.blob.core.windows.net"
   ```

#### Azure Blob Storage steps for configuration log streaming

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the Tailscale admin console.
2. Select **Start streaming**.
3. In the **Start streaming configuration logs** screen, enter the following information:
   1. **Select a destination**: Select the **Azure** radio button.
   2. **Container name**: This is the name of your Azure container that you created in the prerequisites. It should resemble a string of 3-63 lowercase alphanumeric and hyphen characters.
   3. (Optional) **Key prefix**: Enter the object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same container, with the ability to separate the data.
   4. **Tenant ID**: This is the **Directory (tenant) ID** (or `tenantId`) after registering your app in the prerequisites. It should resemble a string of lowercase alphanumeric and hyphen characters.
   5. **Client ID**: This is the **Application (client) ID** (or `id`) after registering your app in the prerequisites. It should resemble a string of lowercase alphanumeric and hyphen characters.
   6. **Storage account URL**: This is the account's blob endpoint (based off the account name). It should resemble: `https://<storage-account>.blob.core.windows.net`.
   7. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   8. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute. You can specify between 1 minute and 24 hours.
   9. Select **Start streaming**.
4. Check your monitoring tools to verify you are successfully streaming configuration audit logs from your tailnet to your Azure container.

It is expected behavior for Azure Blob Storage integrations to generate an empty file when there is no data to send.

> **Note:**
>
> Depending on network conditions, there may be a delay before log streaming appears in your third-party tools.

### Edit a configuration log streaming destination

You can change the information for passing your logs to your preferred streaming destination.

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. For the system that you want to update, select the **Action** dropdown, then select **Edit**.
3. Update the values as needed.
4. Select **Save changes**.

> **Note:**
>
> If you are editing a log streaming destination for an Amazon S3 bucket, you can update the **Role ARN** field (the Amazon resource name) if the resource name already belongs to the specified AWS account. If the role does not belong to the AWS account, you must delete the log streaming destination in the admin console and create a new one.

### Delete a configuration log streaming destination

1. Open the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. For the integration that you want to delete, select the **Action** dropdown, then select **Delete**.
3. In the confirmation dialog, select **Delete**.

## Network log streaming

Network log streaming lets you export network flow logs from your tailnet to external monitoring, storage, and analytics platforms. The following procedures explain how to configure, update, and remove destinations for streamed network flow logs.

### Add a network log streaming destination

#### SIEM integrations

1. If you haven't already, [enable Network flow logs][docs-network-flow-logs-enable] for your tailnet.
2. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the admin console.
3. Select **Start streaming**.
4. In the **Start streaming network logs** dialog:
   1. Select a SIEM destination.
   2. For **URL**, enter your SIEM endpoint. The endpoint URL must use the HTTPS protocol, and there
      is no restriction on which port is used.
      Splunk's HTTP Endpoint Connectors require an endpoint ending with `/services/collector/event`.
      Elasticsearch's data stream endpoints end with `<stream_id>/_bulk?pretty`.
   3. If your SIEM system requires a value for **Username**, enter the SIEM username.
   4. For **Token**, enter the SIEM API token.
5. Select **Start streaming**.

*（图：The 'Start streaming network logs' dialog. Listing several available destinations.）*

Check your SIEM system to verify you are successfully streaming from your tailnet.

#### Amazon S3

1. Make sure you have [network flow logs enabled][docs-network-flow-logs-enable] for your tailnet.
2. Select **Start streaming**.
3. In the **Start streaming network logs** dialog, enter the following information:
   1. **Select a destination**: Select the **AWS | S3** radio button.

   2. **Sub-destinations**: Select the **Amazon S3** radio button.

   3. **Region**: Enter AWS region where S3 bucket is located. For a list of available AWS regions, refer to [AWS service endpoints][xt-aws-regions].

   4. **Bucket**: Enter the S3 bucket name where you want to upload logs.

   5. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.

   6. **Upload period**: Enter how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.

   7. (Optional) **Object key prefix** : Enter the S3 object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce S3 object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same S3 bucket, with the ability to separate the data.

   8. **Role ARN**: Enter the Amazon Resource Name (ARN). This grants your tailnet access to write to your S3 bucket. For more information, refer to [Access to AWS accounts owned by third parties][xt-aws-arn].

   9. **Required IAM trust policy**: Copy and edit the generated details into an existing [AWS role trust policy][xt-aws-trust-policy] or create a new trust policy from the [AWS IAM console][xt-aws-iam-console]. The provided `Principal` and `Condition` string values are unique to your integration and must be added as displayed.

      The following is an example of a trust policy showing you where to add these details and the formatting to use.

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

   10. Add an [AWS role permission policy][xt-aws-permission-policy] from the [AWS IAM console][xt-aws-iam-console] to allow objects to be sent to your S3 bucket.

       The following is an example of a permission policy showing you where to add these details and the formatting to use.

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

   11. In the **Start streaming configuration logs** dialog of the admin console, select **Start streaming**.
4. Check your S3 monitoring tools to verify you are successfully streaming network flow logs from your tailnet to your S3 bucket.

It is expected behavior for Amazon S3 integrations to generate an empty file when there is no data to send.

#### S3-compatible

1. Make sure you have [network flow logs enabled][docs-network-flow-logs-enable] for your tailnet.
2. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the admin console.
3. In the **Start streaming network logs** dialog, enter the following information:
   1. **Select a destination**: Select the **AWS | S3** radio button.
   2. **Sub-destinations**: Select the **S3 compatible service** radio button.
   3. **URL**: Enter the API endpoint for the S3-compatible service you are using to indicate where to send requests.
   4. **Bucket**: Enter the S3 bucket name where you want to upload logs.
   5. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   6. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.
   7. (Optional) **Object key prefix** : Enter the S3 object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce S3 object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same S3 bucket, with the ability to separate the data.
   8. (Optional) **Region**: Enter the region where the bucket is located if your S3-compatible service requires a region to be specified.
   9. **Access key ID**: Enter the access key ID provided by the S3-compatible service you are using.
   10. **Secret access key**: Enter the secret access key provided by the S3-compatible service you are using.
   11. Select **Start streaming**.
4. Check your S3 monitoring tools to verify you are successfully streaming network flow logs from your tailnet to your S3-compatible bucket.

It is expected behavior for S3-compatible integrations to generate an empty file when there is no data to send.

#### Google Cloud Storage

#### Google Cloud Storage prerequisites for network log streaming

Before you configure log settings in the Tailscale admin console, you must first [create a Google service account][xt-google-cloud-iam-service-account] and [configure workload identity federation with AWS or Azure VMs][xt-google-cloud-iam-aws-azure] for AWS.

When following the ["Add a workload identity pool provider" steps][xt-google-cloud-iam-aws-azure-provider], you must set the `account-id` attribute to:

```
891612552178
```

Examples

1. Create a service account.

   Example:

   ```
   <tailnet-uploader>
   ```

   ```
   <tailnet-uploader>@<project>.iam.gserviceaccount.com
   ```

   Assigning the [`storage.objectCreator`][xt-google-cloud-iam-objectcreator-role] role to the service account is recommended.

2. Create a new workload identity pool.

   Example:

   ```shell
   gcloud iam workload-identity-pools create <tailnet-logstreaming-pool> \
     --location="global" \
     --display-name="Logstreaming Pool"
   ```

3. Add Tailscale's public workload identity pool provider.

   Example:

   ```shell
   gcloud iam workload-identity-pools providers create-aws <tailnet-aws-provider> \
     --location="global" \
     --workload-identity-pool="<tailnet-logstreaming-pool>" \
     --account-id="891612552178" \
     --display-name="AWS provider for logstreaming"
   ```

4. Authenticate a workload.

   Example:

   ```shell
   gcloud iam service-accounts add-iam-policy-binding \
     <tailnet-uploader>@><project>.iam.gserviceaccount.com \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/<project-number>/locations/global/workloadIdentityPools/<tailnet-logstreaming-pool>/*"
   ```

#### Google Cloud Storage steps for network log streaming

1. Make sure you have [network flow logs enabled][docs-network-flow-logs-enable] for your tailnet.
2. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the admin console.
3. Select **Start streaming**.
4. In the **Start streaming network logs** dialog, enter the following information:
   1. **Select a destination**: Select the **Google Cloud** radio button.
   2. **Bucket**: Enter the GCS bucket where you want to upload logs. You can use the tailnet DNS name for the GCS bucket if it is added to your tailnet.
   3. (Optional) **Object key prefix** : Enter the object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same bucket, with the ability to separate the data.
   4. **Scopes:** Specify comma-separated [authorization scopes][xt-google-cloud-auth-scopes]. For security, only grant the minimal amount of permissions (`https://www.googleapis.com/auth/devstorage.write_only`).
   5. **Config file content**: Follow the ["Download or create a credential configuration" steps][xt-google-cloud-iam-aws-azure-config] and provide it here.
   6. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   7. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute and the range you can use is between 1 minute and 24 hours.
   8. Select **Start streaming**.
5. Check your monitoring tools to verify you are successfully streaming network flow logs from your tailnet to your GCS bucket.

It is expected behavior for Google Cloud Storage integrations to generate an empty file when there is no data to send.

#### Azure Blob Storage

#### Azure Blob Storage prerequisites for network log streaming

Before you configure log settings in the Tailscale admin console, you must first [create an Azure storage account][xt-azure-storage-account] and container, [register an application][xt-azure-register-app], add the [federated credentials][xt-azure-federated-identity], and [grant write access][xt-azure-rbac].

This can be achieved through the [Azure Portal][xt-azure-portal] (web interface) or the [Azure CLI][xt-azure-cli] (command line interface). Only one prerequisite is required.

##### Azure Blob Storage prerequisites for network log streaming (Azure Portal)

Azure Portal prerequisites

**Register an application**

1. Log in to the Microsoft Entra admin center.
2. Select **App registrations**.
3. Select **New registration**. You will be directed to a **Register an application** page.
   1. Create an application **Name**. For example, `tailscale-logstreaming-writer`. This will be used later as a member for your storage account.
   2. Select **Register**. You will be directed to an **Overview** page for your new application.
4. Make a note of the **Application (client) ID**. This will be used later as your **Client ID** value.
5. Make a note of the **Directory (tenant) ID**. This will be used later as your **Tenant ID** value.

**Add the federated credential**

While still on the Microsoft Entra admin center and on the application **Overview** page:

1. Select **Certificates & secrets**.
2. Select **Federated credentials**.
3. Select **Add credential**. You will be directed to a **Add a credential** page.
   1. Set **Federated credential scenario** to **Other issuer**.

   2. Set **Issuer** (Issuer URL):

      ```
      https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws
      ```

   3. Set **Value** (Subject):

      ```
      arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole
      ```

   4. Set **Name**. For example: `tailscale-aws-federation`.

   5. Ensure **Audience** uses `api://AzureADTokenExchange`.

   6. Select **Add**.

**Create a storage account**

1. Log in to the Azure Portal.
2. Use the **Create a resource** navigation and select **Storage accounts**.
3. Select **Create**. You will be directed to a **Create a storage account** page.
   1. Select the appropriate **Subscription**.
   2. Create a new or select an example **Resource group**. For example: `tailscale-logstreaming`.
   3. Create a new **Storage account name**. For example: `tailscalelogstorage`.
   4. Set a **Region**. For example: **(US) West US 2**.
   5. Set **Performance**. The **Standard** option is recommended.
   6. Set **Primary service**. The **Azure Blob Storage or Azure Data Lake Storage** option is valid.
   7. Set **Redundancy**. The **Geo-redundant storage (GRS)** and **Make read access to data available in the event of regional unavailability** options are recommended.
   8. Select **Review + create**.
4. Select **Create**.
5. Select **Data storage**
6. Select **Containers**.
7. Select **Add container**
   1. Set a container **Name**. For example: `tailscale-logs`. This will be used later as your **Container name** value.
   2. Select **Create**.
8. Select **Settings**.
9. Select **Endpoints**.
10. Make a note of the **Blob service**. This will be used later as your **Storage account URL** value.

**Grant write access (RBAC)**

While still on the Azure Portal and on the account **Overview** page:

1. Select **Access Control (IAM)**. This will open the **Access Control** pane.
2. Select **Add**.
3. Select **Add role assignment**. You will be redirected to the **Add role assignment** page.
   1. Under **Job function roles**, filter the roles for **Storage Blob Data Contributor**.
   2. Select **Storage Blob Data Contributor**.
   3. Select **Next**. You will be directed to the **Members** pane.
      1. Set **Assign access to** to **User, group, or service principal**.
      2. Select **Select members**.
         1. Filter the members for the application you created earlier. For example: `tailscale-logstreaming-writer`.
         2. Select your application.
         3. Select **Select**.
      3. Select **Review + assign**.

##### Azure Blob Storage prerequisites for network log streaming (Azure CLI)

Azure CLI prerequisites

1. Sign in with Azure CLI.

   ```shell
   az login
   ```

2. Define custom configuration values.

   You must use these values to use Tailscale federated credentials:

   ```shell
   TAILSCALE_ISSUER="https://a1917ce1-d85b-43b8-9ceb-068c49979384.tokens.sts.global.api.aws"
   TAILSCALE_SUBJECT="arn:aws:iam::891612552178:role/LogstreamPublisherS3WriterRole"
   ```

   Here are some example values that will be used by the other steps. You can customize these to suit your needs.

   ```shell
   LOCATION="westus2"
   RESOURCE_GROUP="tailscale-logstreaming"
   STORAGE_ACCOUNT="tailscalelogstorage"
   CONTAINER_NAME="tailscale-logs"
   APP_NAME="tailscale-logstreaming-writer"
   ```

3. Register an application.

   ```shell
   APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)

   az ad sp create --id "$APP_ID"

   TENANT_ID=$(az account show --query tenantId -o tsv)
   ```

4. Add the federated credential.

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

5. Create a storage account and container.

   ```shell
   az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

   az storage account create \
     --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" \
     --location "$LOCATION" --sku Standard_GRS --kind StorageV2

   az storage container create \
     --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --auth-mode login
   ```

6. Grant write access (RBAC).

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

   To grant access at the whole storage account level instead of a single container, drop the `/blobServices/default/containers/${CONTAINER_NAME}` suffix from `$SCOPE`. Container-level scope is the recommended default, since it grants Tailscale the least privilege necessary.

7. Export values to enter in the Tailscale admin console.

   ```shell
   echo "ContainerName     = ${CONTAINER_NAME}"
   echo "TenantID          = ${TENANT_ID}"
   echo "ClientID          = ${APP_ID}"
   echo "StorageAccountURL = https://${STORAGE_ACCOUNT}.blob.core.windows.net"
   ```

#### Azure Blob Storage steps for network log streaming

1. Make sure you have [network flow logs enabled][docs-network-flow-logs-enable] for your tailnet.
2. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the Tailscale admin console.
3. Select **Start streaming**.
4. In the **Start streaming network logs** screen, enter the following information:
   1. **Select a destination**: Select the **Azure** radio button.
   2. **Container name**: This is the name of your Azure container that you created in the prerequisites. It should resemble a string of 3-63 lowercase alphanumeric and hyphen characters.
   3. (Optional) **Key prefix**: Enter the object key to prefix for the file name string. For example, a prefix of `audit-logs/` will produce object keys similar to `audit-logs/2024/04/22/12:34:56.json`. This lets you upload both audit and network logs to the same container, with the ability to separate the data.
   4. **Tenant ID**: This is the **Directory (tenant) ID** (or `tenantId`) after registering your app in the prerequisites. It should resemble a string of lowercase alphanumeric and hyphen characters.
   5. **Client ID**: This is the **Application (client) ID** (or `id`) after registering your app in the prerequisites. It should resemble a string of lowercase alphanumeric and hyphen characters.
   6. **Storage account URL**: This is the account's blob endpoint (based off the account name). It should resemble: `https://<storage-account>.blob.core.windows.net`.
   7. **Compression**: From the drop-down menu, select `none`, `zstd`, or `gzip`. The default compression is `zstd`.
   8. **Upload period**: Specify how often to upload new objects, specified in minutes. Take into consideration latency and bandwidth. The default period is 1 minute. You can specify between 1 minute and 24 hours.
   9. Select **Start streaming**.
5. Check your monitoring tools to verify you are successfully streaming network flow logs from your tailnet to your Azure container.

It is expected behavior for Azure Blob Storage integrations to generate an empty file when there is no data to send.

> **Note:**
>
> Depending on network conditions, there may be a delay before log streaming appears in your third-party tools.

### Edit a network log streaming destination

You can change the information for passing your logs to your preferred streaming destination.

1. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the admin console.
2. For the system that you want to update, select the **Action** dropdown, then select **Edit**.
3. Update the values as needed.
4. Select **Save changes**.

> **Note:**
>
> If you are editing a log streaming destination for an Amazon S3 bucket, you can update the **Role ARN** field (the Amazon resource name) if the resource name already belongs to the specified AWS account. If the role does not belong to the AWS account, you must delete the log streaming destination in the admin console and create a new one.

### Delete a network log streaming destination

1. Open the [Network flow logs](https://console.tailscale.com/admin/logs/network) page of the admin console.
2. For the integration that you want to delete, select the **Action** dropdown, then select **Delete**.
3. In the confirmation dialog, select **Delete**.

## Private endpoints

Log streaming can publish logs to a host that is
directly reachable over the public internet,
in which case the endpoint must use HTTPS for security.
Alternatively, log streaming can publish logs to a private host
that is not directly reachable over the public internet
by using Tailscale for connectivity.
Plain HTTP may be used since the underlying transport is
secured by Tailscale using WireGuard.

Use of log streaming to a private host is detected automatically
based on the host specified in the endpoint URL.

*（图：An example of the URL used for private endpoints.）*

The host must reference a node within your tailnet and
can be any of the following:

* The name of a Tailscale node (for example, `splunk`).
* The [fully-qualified domain name][docs-magicdns-fqdn-vs-machine-names] of a Tailscale node (for example, `splunk.yak-bebop.ts.net`).
* The IPv6 address of a Tailscale node (for example, `fd7a:115c:a1e0:ab12:0123:4567:89ab:cdef`).

> **Note:**
>
> Only IPv6 addresses are supported for log streaming. IPv4 addresses are not supported for log streaming because Tailscale uses CGNAT for IPv4 addresses assigned to nodes within a single tailnet. This can present an issue because IPv4 addresses can be reused across a tailnet. IPv6 addresses are not reused, and hostnames will always route to the correct node.

Log streaming to a private endpoint operates by [sharing][docs-sharing] your node
into a Tailscale-managed tailnet, where a Tailscale-managed node will
publish logs directly to your node. This requires both sharing your node
out to Tailscale's `logstream` tailnet, and modifying your [tailnet policy file][docs-acls] to support incoming traffic to your node from the `logstream@tailscale` user.

When adding or updating an endpoint that points to a private host,
the control plane may need to share your node and/or update the tailnet policy file on your behalf. If additional configuration changes are needed, a follow-up dialog box
will ask you for permission to perform the necessary actions.
Audit log events will be generated for these operations and
the actions will be attributed to you.

*（图：The 'Grant share access to private host' confirmation dialog to share the node or update the tailnet policy file.）*

After adding or updating the endpoint, the node will be listed on the
[Machines](https://console.tailscale.com/admin/machines) page of the admin console
as having been shared out to the `logstream@tailscale` user.
Also, the tailnet policy file will be modified with a rule similar to the following:

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

\[Missing snippet: visual\_policy\_editor.mdx]

where:

* `nodeAddressV6` is the IPv6 address of the Tailscale node.
* `port` is the service port for the log streaming system.

The IPv6 address is specified as the log stream publisher that can communicate with your node over v6 of the Internet Protocol.

> **Note:**
>
> Only IPv6 addresses are supported for log streaming. IPv4 addresses are not supported for log streaming because Tailscale uses CGNAT for IPv4 addresses assigned to nodes within a single tailnet. This can present an issue because IPv4 addresses can be reused across a tailnet. IPv6 addresses are not reused, and hostnames will always route to the correct node.

Since log streaming to a private host may require
the ability to share nodes and the ability to update the tailnet policy file,
only the [Admin][docs-user-roles-admin] and [Network admin][docs-user-roles-network-admin] roles
have sufficient permissions to unilaterally make use of private endpoints.
The [IT admin][docs-user-roles-it-admin] has the ability to share nodes,
but lacks the ability to update the tailnet policy file.
An IT admin can still make use of private endpoints,
but requires either an Admin or Network admin to manually update
the tailnet policy file before logs can start streaming.

If your tailnet is configured to use [GitOps for management of Tailscale][docs-gitops-acls], you will receive
an error when Tailscale attempts to update your tailnet policy file to support incoming
traffic from the `logstream@tailscale` user. To avoid this error, first use GitOps to add an
[access rule][docs-policy-syntax-acls] that lets incoming traffic from the `logstream@tailscale` user reach the node that you use for the private endpoint, and then add your private endpoint as the log
streaming URL.

## Additional SIEM systems

We strive to support many common SIEM systems used by our customers, but we cannot support all the commercial and open-source SIEM and logging tools available. Some SIEM systems have [Splunk HTTP Event Collector (Splunk HEC)][xt-splunk-http-event-collector] compatible endpoints such as [DataSet by SentinelOne][xt-dataset-sentinelone]. If your SIEM supports Splunk HEC, configure [configuration audit log streaming][ar-configure-audit-log-streaming] and [network flow log streaming][ar-network-flow-log-streaming] per the instructions above to stream logs directly to your SIEM as if it were Splunk.

If we do not support your SIEM system, you can use [Vector][xt-vector], an open-source high-performance observability data pipeline, to ingest log data from Tailscale by using Vector's Splunk HEC support and deliver it to Vector's many supported SIEM systems, called "sinks" in Vector's terminology. Vector supports a number of [sinks][xt-vector-sinks] such as object storage systems, messaging queuing systems, Grafana Loki, New Relic, and more.

### Vector deployment

To use Vector with log streaming from Tailscale:

1. Follow Vector's [deployment guide][xt-vector-deployment] to deploy a machine running Vector to your infrastructure.
2. Configure Vector's [Splunk HTTP Event Collector (HEC) source][xt-vector-splunk-hec] to allow Tailscale to send log data to Vector.
3. Configure the [Vector sink][xt-vector-sinks] for your SIEM as the destination for the log streaming data.
4. Configure [configuration audit log streaming][ar-configure-audit-log-streaming] and [network flow log streaming][ar-network-flow-log-streaming] per the instructions above to stream logs to your Vector instance, ideally using [private endpoints][ar-private-endpoints].

### Vector example configuration

The Vector configuration below receives data from the `splunk_hec` source and outputs data to the `file` sink:

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

[ar-additional-siem-systems]: #additional-siem-systems

[ar-configure-audit-log-streaming]: #configuration-log-streaming

[ar-network-flow-log-streaming]: #network-log-streaming

[ar-private-endpoints]: #private-endpoints

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-gitops-acls]: /docs/gitops

[docs-magicdns-fqdn-vs-machine-names]: /docs/features/magicdns#fully-qualified-domain-names-vs-machine-names

[docs-network-flow-logs-enable]: /docs/features/logging/network-flow-logs#enable-network-flow-logs

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-sharing]: /docs/features/sharing

[docs-user-roles-admin]: /docs/reference/user-roles#admin

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-admin

[docs-user-roles-network-admin]: /docs/reference/user-roles#network-admin

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
